/**
 * ACC Guidelines Scraper
 * Fetches all guidelines listed on https://www.acc.org/guidelines
 * and saves each as a .txt file under guidelines-sources/ACC/<Year>/<Title>.txt
 *
 * Run: node scripts/scrape-acc-guidelines.mjs
 */

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUTPUT_DIR = path.resolve('guidelines-sources/ACC');
const INDEX_FILE = path.resolve('guidelines-sources/ACC/_index.json');
const GUIDELINES_PAGE = 'https://www.acc.org/guidelines';

// Utility: slugify for folder/file names (keep spaces as underscores, strip bad chars)
const slugify = (text) =>
  text
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')  // remove Windows forbidden chars
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);  // Windows max path ~260 chars total

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('🚀 Starting ACC Guidelines Scraper...\n');
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  // ─── STEP 1: Load the guidelines index page ───────────────────────────────
  console.log('📄 Loading ACC guidelines index page...');
  await page.goto(GUIDELINES_PAGE, { waitUntil: 'networkidle', timeout: 60000 });
  await sleep(3000);

  // Scroll to load all lazy content
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let totalHeight = 0;
      const distance = 300;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
  await sleep(2000);

  // ─── STEP 2: Collect all guideline links ─────────────────────────────────
  console.log('🔗 Collecting guideline links...');

  const guidelineLinks = await page.evaluate(() => {
    const results = [];
    // ACC uses anchor tags with guideline links in various sections
    const anchors = Array.from(document.querySelectorAll('a[href]'));
    const seen = new Set();

    for (const a of anchors) {
      const href = a.href;
      const text = a.textContent?.trim();

      // Filter for guideline article links
      if (
        href &&
        text &&
        text.length > 20 &&
        !seen.has(href) &&
        (
          href.includes('/clinical-topics/') ||
          href.includes('/guidelines/') ||
          href.includes('jacc.org') ||
          href.includes('ahajournals.org')
        ) &&
        !href.endsWith('.pdf') &&
        !href.includes('#') &&
        !href.includes('javascript:')
      ) {
        seen.add(href);
        results.push({ url: href, title: text });
      }
    }
    return results;
  });

  // Also extract from the structured guideline list sections
  const structuredLinks = await page.evaluate(() => {
    const results = [];
    const seen = new Set();

    // Look for guideline cards/items in the page
    const selectors = [
      '.guideline-item a',
      '.guidelines-list a',
      '[data-component="GuidelineCard"] a',
      '.accordion-content a',
      '.content-list a',
      'article a',
      '.card a',
      '.list-item a',
      'h2 a', 'h3 a', 'h4 a',
    ];

    for (const sel of selectors) {
      try {
        const els = document.querySelectorAll(sel);
        for (const el of els) {
          const href = el.href;
          const text = (el.textContent || el.innerText || '').trim();
          if (href && text && text.length > 15 && !seen.has(href) && !href.endsWith('.pdf')) {
            seen.add(href);
            results.push({ url: href, title: text });
          }
        }
      } catch {}
    }
    return results;
  });

  // Merge and deduplicate
  const allLinks = [...guidelineLinks, ...structuredLinks];
  const seen = new Set();
  const uniqueLinks = allLinks.filter(l => {
    if (seen.has(l.url)) return false;
    seen.add(l.url);
    return true;
  });

  console.log(`✅ Found ${uniqueLinks.length} unique links on index page\n`);

  // ─── STEP 3: Also get year-specific sections ──────────────────────────────
  // The URL hash #guidelines-2026 suggests year sections exist
  // Let's extract section headers and their associated links
  const yearSections = await page.evaluate(() => {
    const sections = {};
    // Find year headers
    const headers = document.querySelectorAll('h2, h3, [id*="guideline"], [id*="2020"], [id*="2021"], [id*="2022"], [id*="2023"], [id*="2024"], [id*="2025"], [id*="2026"]');
    let currentYear = 'Unknown';

    for (const el of document.querySelectorAll('*')) {
      const id = el.id || '';
      const text = el.textContent?.trim() || '';
      if (/^20\d{2}$/.test(text) || /guidelines-20\d{2}/.test(id)) {
        currentYear = text.match(/20\d{2}/)?.[0] || currentYear;
        if (!sections[currentYear]) sections[currentYear] = [];
      }
    }
    return sections;
  });

  // ─── STEP 4: Scrape page content ──────────────────────────────────────────
  // Get the full page text organized by year sections
  const pageContent = await page.evaluate(() => {
    return {
      title: document.title,
      html: document.body.innerHTML,
      text: document.body.innerText,
    };
  });

  // Save the raw index HTML for reference
  fs.writeFileSync(
    path.join(OUTPUT_DIR, '_raw_index.html'),
    pageContent.html,
    'utf8'
  );

  // Parse guidelines from the page text
  const guidelinesFromText = parseGuidelinesFromText(pageContent.text);
  console.log(`📋 Parsed ${guidelinesFromText.length} guidelines from page text\n`);

  // ─── STEP 5: Visit each guideline and save content ────────────────────────
  const index = [];
  let downloaded = 0;
  let skipped = 0;

  // Combine text-parsed + link-parsed guidelines
  const allGuidelines = deduplicateGuidelines([...guidelinesFromText, ...uniqueLinks]);
  console.log(`🎯 Total unique guidelines to process: ${allGuidelines.length}\n`);

  for (let i = 0; i < allGuidelines.length; i++) {
    const g = allGuidelines[i];
    const year = g.year || extractYearFromTitle(g.title) || 'Unknown';
    const safeTitle = slugify(g.title || `guideline-${i}`);
    const yearDir = path.join(OUTPUT_DIR, year);
    const filePath = path.join(yearDir, `${safeTitle}.txt`);

    // Skip if already downloaded
    if (fs.existsSync(filePath)) {
      console.log(`  ⏭️  [${i + 1}/${allGuidelines.length}] SKIP (exists): ${g.title?.slice(0, 80)}`);
      index.push({ title: g.title, year, url: g.url, file: `ACC/${year}/${safeTitle}.txt`, status: 'exists' });
      skipped++;
      continue;
    }

    console.log(`  📥 [${i + 1}/${allGuidelines.length}] Downloading: ${g.title?.slice(0, 80)}`);

    try {
      if (!g.url) {
        // No URL - just save the title/abstract if available
        fs.mkdirSync(yearDir, { recursive: true });
        fs.writeFileSync(filePath, `Title: ${g.title}\nYear: ${year}\n\n${g.abstract || '(No content available - no URL)'}`, 'utf8');
        index.push({ title: g.title, year, url: null, file: `ACC/${year}/${safeTitle}.txt`, status: 'no-url' });
        downloaded++;
        continue;
      }

      // Navigate to the guideline page
      const guidelinePage = await context.newPage();
      try {
        await guidelinePage.goto(g.url, { waitUntil: 'networkidle', timeout: 45000 });
        await sleep(2000);

        // Scroll to load all content
        await guidelinePage.evaluate(async () => {
          await new Promise(resolve => {
            let total = 0;
            const timer = setInterval(() => {
              window.scrollBy(0, 400);
              total += 400;
              if (total >= document.body.scrollHeight) { clearInterval(timer); resolve(); }
            }, 80);
          });
        });
        await sleep(1000);

        // Extract full text
        const content = await guidelinePage.evaluate(() => {
          // Remove nav, footer, scripts, ads
          const remove = ['nav', 'footer', 'script', 'style', 'iframe', 'noscript',
            '.nav', '.footer', '.header', '.advertisement', '.ad', '.sidebar',
            '.breadcrumb', '.social', '.share', '.cookie', '.popup', '.modal',
            '[class*="nav"]', '[class*="menu"]', '[class*="cookie"]'];
          remove.forEach(sel => {
            try { document.querySelectorAll(sel).forEach(el => el.remove()); } catch {}
          });

          return {
            title: document.title || document.querySelector('h1')?.textContent?.trim() || '',
            text: document.body.innerText || document.body.textContent || '',
            url: window.location.href,
          };
        });

        const fileContent = [
          `Title: ${content.title}`,
          `URL: ${content.url}`,
          `Year: ${year}`,
          `Downloaded: ${new Date().toISOString()}`,
          '',
          '─'.repeat(80),
          '',
          content.text,
        ].join('\n');

        fs.mkdirSync(yearDir, { recursive: true });
        fs.writeFileSync(filePath, fileContent, 'utf8');

        index.push({
          title: g.title || content.title,
          year,
          url: g.url,
          file: `ACC/${year}/${safeTitle}.txt`,
          status: 'downloaded',
          chars: content.text.length,
        });
        downloaded++;
        console.log(`    ✅ Saved (${Math.round(content.text.length / 1024)}KB)`);

      } catch (err) {
        console.error(`    ❌ Error: ${err.message?.slice(0, 100)}`);
        index.push({ title: g.title, year, url: g.url, file: null, status: 'error', error: err.message?.slice(0, 200) });
      } finally {
        await guidelinePage.close();
      }

      // Rate limit
      await sleep(1500);

    } catch (err) {
      console.error(`    ❌ Outer error: ${err.message?.slice(0, 100)}`);
      index.push({ title: g.title, year, url: g.url, file: null, status: 'error', error: err.message?.slice(0, 200) });
    }
  }

  await browser.close();

  // Save index
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2), 'utf8');

  console.log('\n' + '═'.repeat(60));
  console.log(`✅ Done! Downloaded: ${downloaded}, Skipped: ${skipped}`);
  console.log(`📁 Output: ${OUTPUT_DIR}`);
  console.log(`📋 Index: ${INDEX_FILE}`);
  console.log('═'.repeat(60));
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractYearFromTitle(title = '') {
  const m = title.match(/\b(20\d{2})\b/);
  return m ? m[1] : null;
}

function parseGuidelinesFromText(text) {
  const guidelines = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  let currentYear = null;
  for (const line of lines) {
    // Detect year lines
    const yearMatch = line.match(/^(20\d{2})$/);
    if (yearMatch) {
      currentYear = yearMatch[1];
      continue;
    }

    // Guideline lines: usually long, contain "Guideline" or "Focused Update" etc.
    if (
      line.length > 30 &&
      (
        /guideline/i.test(line) ||
        /focused update/i.test(line) ||
        /expert consensus/i.test(line) ||
        /appropriate use/i.test(line) ||
        /scientific statement/i.test(line) ||
        /decision pathway/i.test(line) ||
        /performance measures/i.test(line)
      )
    ) {
      const year = extractYearFromTitle(line) || currentYear || 'Unknown';
      guidelines.push({ title: line, year, url: null });
    }
  }

  return guidelines;
}

function deduplicateGuidelines(list) {
  const seen = new Set();
  return list.filter(g => {
    const key = (g.url || g.title || '').toLowerCase().slice(0, 100);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
