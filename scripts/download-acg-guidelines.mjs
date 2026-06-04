/**
 * Download ACG guidelines from https://gi.org/guidelines/ into topic folders.
 *
 * Most READ links resolve to LWW/DOI pages that block direct scraping. The
 * readable mirror keeps the full article text, so those pages are rendered into
 * local PDFs for the same downstream extraction/upload pipeline.
 *
 * Run: node scripts/download-acg-guidelines.mjs
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const INDEX_URL = 'https://gi.org/guidelines/';
const TARGET_DIR = path.resolve('guidelines-sources/ACG');
const META_DIR = path.join(TARGET_DIR, '_metadata');
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const MONTHS =
  'January|February|March|April|May|June|July|August|September|October|November|December';

function jinaUrl(url) {
  return `https://r.jina.ai/http://${url}`;
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      accept: 'text/markdown,text/plain,text/html,application/xhtml+xml,*/*;q=0.8',
      'user-agent': USER_AGENT,
    },
  });
  if (!response.ok) throw new Error(`GET ${url} returned ${response.status}`);
  return response.text();
}

function decodeMarkdown(value = '') {
  return value
    .replace(/\\\[/g, '[')
    .replace(/\\\]/g, ']')
    .replace(/\\_/g, '_')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractYear(value = '') {
  return value.match(/\b(19|20)\d{2}\b/)?.[0] ?? '';
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

function stripTypeSuffix(title) {
  return title
    .replace(/\s*-\s*(Guidelines?|Monograph|Competencies in Endoscopy|Consensus Statement)\s*$/i, '')
    .replace(/\s*-\s*Guideline\s*$/i, '')
    .trim();
}

function fileNameFor(title, date) {
  const year = extractYear(date);
  const clean = safeName(stripTypeSuffix(title), 115);
  return `${year ? `${clean} (${year})` : clean}.pdf`;
}

function typeForTitle(title) {
  if (/competenc/i.test(title)) return 'Competencies in Endoscopy';
  if (/monograph/i.test(title)) return 'Monograph';
  if (/consensus|multi-society task force|statement/i.test(title)) return 'Consensus statement';
  return 'Guideline';
}

function categoryForTitle(title) {
  const prefix = title.includes(':') ? title.split(':')[0]?.trim() : '';
  if (/endoscop|ercp|eus|colonoscopy|capsule|enteroscopy/i.test(title)) return 'Endoscopy';
  if (/crohn|ulcerative colitis|inflammatory bowel|IBD|pouchitis/i.test(title)) return 'Inflammatory Bowel Disease';
  if (/colorectal|colon|lynch|polyposis|cancer|polyp|ischemia/i.test(title)) return 'Colorectal and Cancer';
  if (/hemochromatosis|liver|cirrhosis|hepat|cholangitis/i.test(title)) return 'Liver';
  if (prefix && prefix.length <= 42 && !/Guideline|Consensus|College|Task Force|Monograph/i.test(prefix)) {
    if (/bleeding/i.test(prefix)) return 'Bleeding';
    if (/liver/i.test(prefix)) return 'Liver';
    if (/pancreatitis/i.test(prefix)) return 'Pancreas and Biliary';
    if (/inflammatory bowel disease/i.test(prefix)) return 'Inflammatory Bowel Disease';
    if (/diarrheal|infection/i.test(prefix)) return 'Infections';
    return prefix;
  }

  if (/pancrea|biliary|gall/i.test(title)) return 'Pancreas and Biliary';
  if (/esoph|reflux|achalasia|eosinophilic|dyspepsia|gastric|helicobacter|gastroparesis/i.test(title)) return 'Esophagus and Stomach';
  if (/irritable|SIBO|constipation|diarrh|anorectal|celiac/i.test(title)) return 'Functional GI and Motility';
  if (/pregnancy|geriatric|nutrition|microbiome|infection|clostridioides/i.test(title)) return 'General GI';
  return 'General GI';
}

function parseGuidelineIndex(markdown) {
  const lines = markdown.split('\n');
  const entries = [];

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^### \[(.*?)\]\((.*?)\)/);
    if (!match) continue;

    const block = [];
    for (let cursor = index + 1; cursor < lines.length && !lines[cursor].startsWith('### ['); cursor += 1) {
      block.push(lines[cursor]);
    }

    const title = decodeMarkdown(match[1].replace(/_/g, ''));
    const fallbackUrl = match[2].trim();
    const readUrl = block.join('\n').match(/\[READ\]\((.*?)\)/)?.[1]?.trim() || fallbackUrl;
    const date = block.find((line) => new RegExp(`^(${MONTHS}) \\d{4}$`).test(line.trim()))?.trim() || '';

    if (!readUrl || /^https?:\/\/gi\.org\/guidelines\/?$/i.test(readUrl)) continue;

    entries.push({
      category: categoryForTitle(title),
      date,
      fileName: fileNameFor(title, date),
      sourceUrl: readUrl,
      title,
      type: typeForTitle(title),
      year: extractYear(date),
    });
  }

  return entries;
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
  <div class="meta">ACG Guidelines | ${meta.date || meta.year || ''} | ${meta.sourceUrl}</div>
  <pre>${escaped}</pre>
</body>
</html>`;
}

async function downloadPdf(url, destination) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: {
      accept: 'application/pdf,*/*;q=0.8',
      'user-agent': USER_AGENT,
    },
  });
  const buffer = Buffer.from(await response.arrayBuffer());
  if (!response.ok || buffer.subarray(0, 4).toString('latin1') !== '%PDF') {
    throw new Error(`PDF download failed with ${response.status} from ${url}`);
  }
  await fs.writeFile(destination, buffer);
}

function extractTocArticleUrls(markdown) {
  const urls = [];
  for (const match of markdown.matchAll(/^#### \[(.*?)\]\((https:\/\/journals\.lww\.com\/ajg\/fulltext\/.*?)\b(?:\s+".*?")?\)/gim)) {
    const title = decodeMarkdown(match[1]);
    if (/continuing medical education|editor and author profiles/i.test(title)) continue;
    if (!urls.includes(match[2])) urls.push(match[2]);
  }
  return urls;
}

async function fetchReadableMarkdownForEntry(entry) {
  const sourceUrl = entry.sourceUrl;
  const readable = await fetchText(jinaUrl(sourceUrl));

  if (/\/toc\/|toc\.aspx/i.test(sourceUrl)) {
    const articleUrls = extractTocArticleUrls(readable);
    if (articleUrls.length === 0) return readable;
    const sections = [`# ${entry.title}`, `Source TOC: ${sourceUrl}`, ''];
    for (const [index, articleUrl] of articleUrls.entries()) {
      console.log(`    Monograph article ${index + 1}/${articleUrls.length}`);
      const articleMarkdown = await fetchText(jinaUrl(articleUrl));
      sections.push(articleMarkdown);
      sections.push('\n\n---\n\n');
    }
    return sections.join('\n');
  }

  return readable;
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

async function main() {
  await fs.mkdir(TARGET_DIR, { recursive: true });
  await fs.mkdir(META_DIR, { recursive: true });

  const indexMarkdown = await fetchText(jinaUrl(INDEX_URL));
  const entries = parseGuidelineIndex(indexMarkdown);
  console.log(`Discovered ${entries.length} downloadable ACG guideline entries.`);

  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    for (const [index, entry] of entries.entries()) {
      const categoryDir = path.join(TARGET_DIR, safeName(entry.category, 90));
      const destination = path.join(categoryDir, entry.fileName);
      await fs.mkdir(categoryDir, { recursive: true });

      console.log(`\n[${index + 1}/${entries.length}] [${entry.category}] ${entry.title}`);
      try {
        if (/\.pdf(?:$|[?#])/i.test(entry.sourceUrl)) {
          await downloadPdf(entry.sourceUrl, destination);
          results.push({ ...entry, destination, status: 'downloaded', method: 'direct-pdf' });
          console.log('  Downloaded direct PDF.');
        } else {
          const markdown = await fetchReadableMarkdownForEntry(entry);
          if (markdown.replace(/\s+/g, ' ').trim().length < 4000) {
            throw new Error(`Readable article text is too short (${markdown.length} chars)`);
          }
          await renderMarkdownPdf(browser, markdown, destination, entry);
          const markdownPath = path.join(META_DIR, `${path.basename(entry.fileName, '.pdf')}.md`);
          await fs.writeFile(markdownPath, `${markdown.trim()}\n`, 'utf8');
          results.push({ ...entry, destination, markdownPath, status: 'downloaded', method: 'readable-markdown-pdf' });
          console.log(`  Rendered readable article PDF (${markdown.length} chars).`);
        }
      } catch (error) {
        console.error(`  Failed: ${error.message}`);
        results.push({ ...entry, destination, status: 'failed', reason: error.message });
      }
    }
  } finally {
    await browser.close();
  }

  const manifestPath = path.join(META_DIR, 'acg-guidelines-download-manifest.json');
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
