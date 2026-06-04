/**
 * Download AGA clinical guidance from https://gastro.org/clinical-guidance/
 * into topic folders.
 *
 * The landing page only renders a small subset. The complete list is exposed
 * through the WordPress REST API as the `clinical-guidance` post type.
 *
 * Run: node scripts/download-aga-guidelines.mjs
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const API_BASE = 'https://gastro.org/wp-json/wp/v2';
const INDEX_URL = 'https://gastro.org/clinical-guidance/';
const TARGET_DIR = path.resolve('guidelines-sources/AGA');
const META_DIR = path.join(TARGET_DIR, '_metadata');
const auditOnly = process.argv.includes('--audit-only');
const headless = process.argv.includes('--headless');
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.slice('--limit='.length)) : 0;
const matchArg = process.argv.find((arg) => arg.startsWith('--match='));
const matchText = matchArg ? matchArg.slice('--match='.length).toLowerCase() : '';
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const JSON_HEADERS = {
  accept: 'application/json,text/plain,*/*',
  'accept-language': 'en-US,en;q=0.9',
  referer: INDEX_URL,
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'user-agent': USER_AGENT,
};

const HTML_HEADERS = {
  accept: 'text/html,application/xhtml+xml,text/plain,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.9',
  referer: INDEX_URL,
  'user-agent': USER_AGENT,
};

const RETIRED_GUIDELINE_TYPE_ID = 5352;
const UPDATE_IN_DEVELOPMENT_TYPE_ID = 5386;

async function fetchJson(url) {
  let lastError = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, { headers: JSON_HEADERS, signal: AbortSignal.timeout(45_000) });
      if (!response.ok) throw new Error(`GET ${url} returned ${response.status}`);
      return {
        data: await response.json(),
        totalPages: Number(response.headers.get('x-wp-totalpages') || 1),
      };
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 2500));
    }
  }
  throw lastError;
}

async function fetchText(url, headers = HTML_HEADERS) {
  let lastError = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, { headers, redirect: 'follow', signal: AbortSignal.timeout(45_000) });
      if (!response.ok) throw new Error(`GET ${url} returned ${response.status}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 2500));
    }
  }
  throw lastError;
}

function decodeHtml(value = '') {
  return String(value)
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripHtml(value = '') {
  return decodeHtml(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function safeName(value, max = 115) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/:/g, ' -')
    .replace(/[<>"/\\|?*\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
    .trim();
}

function extractYear(value = '') {
  return String(value).match(/\b(19|20)\d{2}\b/)?.[0] ?? '';
}

function fileNameFor(title, date) {
  const year = extractYear(date);
  const clean = safeName(title, 115);
  return `${year ? `${clean} (${year})` : clean}.pdf`;
}

function htmlToReadableHtml(html) {
  return decodeHtml(html)
    .replace(/<\/(p|div|li|h[1-6]|tr|section|article)>/gi, '</$1>\n')
    .replace(/<br\s*\/?>/gi, '\n');
}

function termsFor(ids, termsById) {
  return (ids || []).map((id) => termsById.get(Number(id))).filter(Boolean);
}

function shouldKeepPost(post) {
  const guidelineTypes = post.guideline_type || [];
  if (guidelineTypes.includes(RETIRED_GUIDELINE_TYPE_ID)) return false;
  if (guidelineTypes.includes(UPDATE_IN_DEVELOPMENT_TYPE_ID)) return false;
  if (!Array.isArray(post.category_type) || post.category_type.length === 0) return false;

  const title = stripHtml(post.title?.rendered || '');
  const link = post.link || '';
  if (/faq|toolkit|referencing|upcoming clinical guidance/i.test(`${title} ${link}`)) return false;

  return true;
}

function extractExternalLinks(html, ownUrl) {
  const links = [];
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = decodeHtml(match[1]).trim();
    const text = stripHtml(match[2]);
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    if (/gastro\.org\/clinical-guidance/i.test(href) || href === ownUrl) continue;
    if (!/^https?:\/\//i.test(href)) continue;
    if (
      /doi\.org|gastrojournal\.org|cghjournal\.org|clinicalkey|sciencedirect|pubmed|pmc|pdf|guideline|article|publication|read/i.test(
        `${href} ${text}`,
      )
    ) {
      links.push({ href, text });
    }
  }
  return links;
}

function extractDoiLinks(html) {
  const links = [];
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']*doi\.org\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = decodeHtml(match[1]).trim();
    const text = stripHtml(match[2]);
    if (!links.some((link) => link.href === href)) links.push({ href, text });
  }
  return links;
}

function markdownToHtml(markdown, meta) {
  const escaped = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${safeName(meta.title, 160)}</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; color: #111; font-size: 12px; line-height: 1.45; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .meta { color: #444; font-size: 10px; margin-bottom: 20px; }
    pre { white-space: pre-wrap; word-break: break-word; font-family: Arial, Helvetica, sans-serif; }
  </style>
</head>
<body>
  <h1>${safeName(meta.title, 220)}</h1>
  <div class="meta">AGA Clinical Guidance | ${meta.date || meta.year || ''} | ${meta.sourceUrl}</div>
  <pre>${escaped}</pre>
</body>
</html>`;
}

function postToMarkdown(post, meta) {
  const content = htmlToReadableHtml(post.content?.rendered || '');
  const excerpt = stripHtml(post.excerpt?.rendered || '');
  const description = post.yoast_head_json?.description || '';
  const body = stripHtml(content);
  const lines = [
    `# ${meta.title}`,
    '',
    `AGA clinical guidance page: ${post.link}`,
    `Published: ${meta.date}`,
    `Topic: ${meta.category}`,
    `Guidance type: ${meta.guidanceType}`,
  ];
  if (description) lines.push(`Description: ${stripHtml(description)}`);
  if (excerpt) lines.push(`Excerpt: ${excerpt}`);
  if (meta.articleUrl) lines.push(`External article/source: ${meta.articleUrl}`);
  lines.push('', '## AGA page content', '', body);
  return lines.join('\n').replace(/\n{4,}/g, '\n\n\n').trim();
}

async function renderMarkdownPdf(browser, markdown, destination, meta) {
  const page = await browser.newPage();
  try {
    await page.setContent(markdownToHtml(markdown, meta), { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await page.pdf({
      path: destination,
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
    });
  } finally {
    await page.close();
  }
}

async function downloadPdfFromDoi(page, doiUrl, destination) {
  await page.goto(doiUrl, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await page.waitForSelector('a[href*="showPdf"], a.article-tools__item__pdf', {
    state: 'attached',
    timeout: 90_000,
  });
  const pdfUrl = await page.$eval(
    'a[href*="showPdf"], a.article-tools__item__pdf',
    (anchor) => new URL(anchor.getAttribute('href'), location.href).href,
  );

  await page.goto(pdfUrl, { waitUntil: 'commit', timeout: 120_000 });

  let pdfViewerFrame = null;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    pdfViewerFrame = page.frames().find((frame) => frame.url().startsWith('chrome-extension://'));
    if (pdfViewerFrame) break;
    await page.waitForTimeout(1000);
  }
  if (!pdfViewerFrame) {
    throw new Error('Chrome PDF viewer did not open for Download PDF response');
  }

  const downloadPromise = page.waitForEvent('download', { timeout: 120_000 });
  await pdfViewerFrame.evaluate(() => {
    const findSaveButton = (root) => {
      const direct = root.querySelector?.('#save');
      if (direct) return direct;
      for (const element of root.querySelectorAll?.('*') || []) {
        if (element.shadowRoot) {
          const found = findSaveButton(element.shadowRoot);
          if (found) return found;
        }
      }
      return null;
    };
    const saveButton = findSaveButton(document);
    if (!saveButton) throw new Error('Download button was not found in Chrome PDF viewer');
    saveButton.click();
  });
  const download = await downloadPromise;
  await download.saveAs(destination);

  const buffer = await fs.readFile(destination);
  if (buffer.subarray(0, 4).toString('latin1') !== '%PDF') {
    throw new Error(`Download PDF response is not a PDF (${buffer.subarray(0, 20).toString('latin1')})`);
  }
  return { pdfUrl, bytes: buffer.length };
}

function jinaUrl(url) {
  return `https://r.jina.ai/http://${url}`;
}

async function extractDoiFromAgaPage(sourceUrl) {
  const readable = await fetchText(jinaUrl(sourceUrl), {
    accept: 'text/markdown,text/plain,*/*;q=0.8',
    'user-agent': USER_AGENT,
  });
  const doiUrl = readable.match(/https:\/\/doi\.org\/10\.[^\s)\]"'<>]+/i)?.[0]?.replace(/[.,;]+$/, '');
  if (doiUrl) return doiUrl;
  throw new Error('No DOI link found on the AGA guidance page');
}

async function loadTerms(taxonomy) {
  const cached = await readCachedJson(`api-${taxonomy}`);
  if (cached) return cached;
  const { data } = await fetchJson(`${API_BASE}/${taxonomy}?per_page=100`);
  return data;
}

async function readCachedJson(name) {
  const jsonPath = path.join(META_DIR, `${name}.json`);
  const jinaPath = path.join(META_DIR, `${name}.jina.md`);
  try {
    return JSON.parse(await fs.readFile(jsonPath, 'utf8'));
  } catch {}
  try {
    const raw = await fs.readFile(jinaPath, 'utf8');
    const jsonStart = raw.indexOf('[{');
    if (jsonStart >= 0) return JSON.parse(raw.slice(jsonStart).trim());
  } catch {}
  return null;
}

async function loadGuidancePosts() {
  const cachedPage1 = await readCachedJson('api-clinical-guidance-page-1');
  const cachedPage2 = await readCachedJson('api-clinical-guidance-page-2');
  if (cachedPage1 && cachedPage2) return [...cachedPage1, ...cachedPage2];

  const first = await fetchJson(
    `${API_BASE}/clinical-guidance?per_page=100&page=1&_fields=id,date,slug,link,title,topic,guideline_type,category_type,parent`,
  );
  const posts = [...first.data];
  for (let page = 2; page <= first.totalPages; page += 1) {
    const next = await fetchJson(
      `${API_BASE}/clinical-guidance?per_page=100&page=${page}&_fields=id,date,slug,link,title,topic,guideline_type,category_type,parent`,
    );
    posts.push(...next.data);
  }
  return posts;
}

async function main() {
  await fs.mkdir(TARGET_DIR, { recursive: true });
  await fs.mkdir(META_DIR, { recursive: true });

  const [topics, categoryTypes, guidelineTypes, posts] = await Promise.all([
    loadTerms('topic'),
    loadTerms('category_type'),
    loadTerms('guideline_type'),
    loadGuidancePosts(),
  ]);
  const termsById = new Map([...topics, ...categoryTypes, ...guidelineTypes].map((term) => [term.id, stripHtml(term.name)]));

  let entries = posts
    .filter(shouldKeepPost)
    .map((post) => {
      const title = stripHtml(post.title?.rendered || '');
      const category = termsFor(post.topic, termsById)[0] || 'General GI';
      const guidanceType = termsFor(post.category_type, termsById)[0] || 'Clinical Guidance';
      return {
        category,
        date: post.date?.slice(0, 10) || '',
        fileName: fileNameFor(title, post.date),
        guidanceType,
        post,
        sourceUrl: post.link,
        title,
        year: extractYear(post.date),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.category.localeCompare(b.category) || a.title.localeCompare(b.title));

  if (matchText) {
    entries = entries.filter((entry) =>
      `${entry.title} ${entry.category} ${entry.guidanceType} ${entry.sourceUrl}`.toLowerCase().includes(matchText),
    );
  }
  if (Number.isFinite(limit) && limit > 0) entries = entries.slice(0, limit);

  console.log(`Discovered ${posts.length} AGA clinical-guidance posts.`);
  console.log(`Keeping ${entries.length} current guidance entries with a guidance type.`);

  if (auditOnly) {
    const audit = [];
    for (const [index, entry] of entries.entries()) {
      const pageHtml = await fetchText(entry.sourceUrl);
      const doiLinks = extractDoiLinks(pageHtml);
      audit.push({
        title: entry.title,
        category: entry.category,
        guidanceType: entry.guidanceType,
        date: entry.date,
        sourceUrl: entry.sourceUrl,
        doiUrl: doiLinks[0]?.href || '',
      });
      console.log(`[audit ${index + 1}/${entries.length}] ${doiLinks[0]?.href ? 'DOI' : 'NO DOI'} ${entry.title}`);
    }
    await fs.writeFile(path.join(META_DIR, 'aga-guidelines-doi-audit.json'), `${JSON.stringify(audit, null, 2)}\n`);
    const missing = audit.filter((entry) => !entry.doiUrl);
    console.log(`\nAudit done. DOI links found for ${audit.length - missing.length}/${audit.length}.`);
    if (missing.length) {
      console.log('Missing DOI links:');
      missing.forEach((entry) => console.log(`- ${entry.title}: ${entry.sourceUrl}`));
    }
    return;
  }

  const browser = await chromium.launch({
    channel: headless ? undefined : 'chrome',
    headless,
    args: ['--disable-blink-features=AutomationControlled'],
  });
  const context = await browser.newContext({
    acceptDownloads: true,
    viewport: { width: 1365, height: 900 },
    userAgent: USER_AGENT,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(90_000);
  page.setDefaultNavigationTimeout(120_000);
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });
  const results = [];

  try {
    for (const [index, entry] of entries.entries()) {
      const categoryDir = path.join(TARGET_DIR, safeName(entry.category, 90));
      const destination = path.join(categoryDir, entry.fileName);
      await fs.mkdir(categoryDir, { recursive: true });

      console.log(`\n[${index + 1}/${entries.length}] [${entry.category}] ${entry.title}`);
      try {
        console.log('  Reading AGA page for DOI...');
        const doiUrl = await extractDoiFromAgaPage(entry.sourceUrl);

        console.log(`  DOI: ${doiUrl}`);
        const download = await downloadPdfFromDoi(page, doiUrl, destination);
        results.push({
          ...entry,
          post: undefined,
          destination,
          status: 'downloaded',
          method: 'doi-download-pdf-button',
          doiUrl,
          pdfUrl: download.pdfUrl,
          bytes: download.bytes,
        });
        console.log(`  Downloaded actual PDF (${download.bytes} bytes) from Download PDF.`);
      } catch (error) {
        console.error(`  Failed: ${error.message}`);
        results.push({ ...entry, post: undefined, destination, status: 'failed', reason: error.message });
      }
    }
  } finally {
    await context.close();
    await browser.close();
  }

  const manifestPath = path.join(META_DIR, 'aga-guidelines-download-manifest.json');
  await fs.writeFile(manifestPath, `${JSON.stringify(results, null, 2)}\n`);

  const downloaded = results.filter((result) => result.status === 'downloaded').length;
  const failed = results.filter((result) => result.status === 'failed');
  console.log(`\nDone. Downloaded ${downloaded}/${results.length}.`);
  if (failed.length) {
    console.log('Failures:');
    failed.forEach((item) => console.log(`- ${item.title}: ${item.reason}`));
  }
  console.log(`Manifest: ${manifestPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
