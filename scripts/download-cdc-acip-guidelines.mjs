/**
 * Download CDC ACIP vaccine-specific recommendation PDFs.
 *
 * Source:
 * https://www.cdc.gov/acip/vaccine-recommendations/index.html
 *
 * The landing page links to the vaccine-specific recommendation library. Each
 * vaccine page lists MMWR recommendations with a "Print Version" PDF link.
 */

import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const INDEX_URL = 'https://www.cdc.gov/acip/vaccine-recommendations/index.html';
const VACCINE_INDEX_URL = 'https://www.cdc.gov/acip-recs/hcp/vaccine-specific/index.html';
const TARGET_DIR = path.resolve('guidelines-sources/CDC_ACIP');
const META_DIR = path.join(TARGET_DIR, '_metadata');
const force = process.argv.includes('--force');
const auditOnly = process.argv.includes('--audit-only');
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.slice('--limit='.length)) : 0;
const matchArg = process.argv.find((arg) => arg.startsWith('--match='));
const matchText = matchArg ? matchArg.slice('--match='.length).toLowerCase() : '';
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36';

const HTML_HEADERS = {
  accept: 'text/html,application/xhtml+xml,text/plain,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.9',
  'user-agent': USER_AGENT,
};

const PDF_HEADERS = {
  accept: 'application/pdf,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.9',
  'user-agent': USER_AGENT,
};

function decodeHtml(value = '') {
  return String(value)
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&ndash;|&#8211;/g, '-')
    .replace(/&mdash;|&#8212;|&#8213;/g, '-')
    .replace(/&ge;/g, '>=')
    .replace(/&le;/g, '<=');
}

function stripHtml(value = '') {
  return decodeHtml(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function safeName(value, max = 110) {
  return String(value || '')
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

function hashShort(value) {
  return crypto.createHash('sha1').update(String(value)).digest('hex').slice(0, 8);
}

async function fetchText(url) {
  let lastError = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, { headers: HTML_HEADERS, redirect: 'follow', signal: AbortSignal.timeout(45_000) });
      if (!response.ok) throw new Error(`GET ${url} returned ${response.status}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
    }
  }
  throw lastError;
}

function extractLinks(html, baseUrl) {
  return [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map((match) => ({
    href: new URL(decodeHtml(match[1]), baseUrl).href,
    text: stripHtml(match[2]),
  }));
}

async function discoverEntries() {
  await fs.mkdir(META_DIR, { recursive: true });
  const landingHtml = await fetchText(INDEX_URL);
  await fs.writeFile(path.join(META_DIR, 'cdc-acip-landing.html'), landingHtml);

  const indexHtml = await fetchText(VACCINE_INDEX_URL);
  await fs.writeFile(path.join(META_DIR, 'cdc-acip-vaccine-specific-index.html'), indexHtml);

  const seenPages = new Set();
  const vaccinePages = extractLinks(indexHtml, VACCINE_INDEX_URL)
    .filter((link) => /\/acip-recs\/hcp\/vaccine-specific\/[^/]+\.html$/i.test(link.href))
    .filter((link) => !link.href.endsWith('/index.html'))
    .filter((link) => {
      if (seenPages.has(link.href)) return false;
      seenPages.add(link.href);
      return true;
    });

  const entries = [];
  for (const page of vaccinePages) {
    const html = await fetchText(page.href);
    await fs.writeFile(path.join(META_DIR, `${safeName(page.text, 70)}.html`), html);
    const links = extractLinks(html, page.href);
    for (let index = 0; index < links.length; index += 1) {
      const link = links[index];
      if (!/Print Version/i.test(link.text) || !/\.pdf/i.test(link.href)) continue;
      const priorArticle = links
        .slice(Math.max(0, index - 4), index)
        .reverse()
        .find((candidate) => /\/mmwr\//i.test(candidate.href) && !/\.pdf/i.test(candidate.href));
      const title = priorArticle?.text || link.text;
      entries.push({
        topic: page.text,
        title,
        articleUrl: priorArticle?.href || page.href,
        pdfUrl: link.href,
        year: extractYear(title) || extractYear(link.href),
      });
    }
  }

  const seen = new Set();
  return entries
    .filter((entry) => {
      const key = `${entry.topic}|${entry.title}|${entry.pdfUrl}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.topic.localeCompare(b.topic) || (b.year || '').localeCompare(a.year || '') || a.title.localeCompare(b.title));
}

async function downloadPdf(url, destination, referer) {
  let lastError = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url.split('#')[0], {
        headers: { ...PDF_HEADERS, referer },
        redirect: 'follow',
        signal: AbortSignal.timeout(90_000),
      });
      if (!response.ok) throw new Error(`GET ${url} returned ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.subarray(0, 4).toString('latin1') !== '%PDF') {
        throw new Error(`Response is not a PDF (${buffer.subarray(0, 24).toString('latin1')})`);
      }
      await fs.mkdir(path.dirname(destination), { recursive: true });
      await fs.writeFile(destination, buffer);
      return buffer.length;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
    }
  }
  throw lastError;
}

async function main() {
  await fs.mkdir(TARGET_DIR, { recursive: true });
  await fs.mkdir(META_DIR, { recursive: true });

  let entries = await discoverEntries();
  if (matchText) {
    entries = entries.filter((entry) => `${entry.topic} ${entry.title} ${entry.pdfUrl}`.toLowerCase().includes(matchText));
  }
  if (Number.isFinite(limit) && limit > 0) entries = entries.slice(0, limit);
  await fs.writeFile(path.join(META_DIR, 'cdc-acip-discovered.json'), `${JSON.stringify(entries, null, 2)}\n`);

  console.log(`Discovered ${entries.length} CDC ACIP recommendation PDF entries.`);
  if (auditOnly) return;

  const results = [];
  for (const [index, entry] of entries.entries()) {
    const topicDir = path.join(TARGET_DIR, safeName(entry.topic, 70));
    const fileName = `${safeName(entry.title, 98)}${entry.year ? ` (${entry.year})` : ''} - ${hashShort(entry.pdfUrl)}.pdf`;
    const destination = path.join(topicDir, fileName);

    console.log(`\n[${index + 1}/${entries.length}] [${entry.topic}] ${entry.title}`);
    if (!force && fsSync.existsSync(destination)) {
      const existing = await fs.readFile(destination);
      if (existing.subarray(0, 4).toString('latin1') === '%PDF') {
        results.push({ ...entry, destination, status: 'exists', bytes: existing.length });
        console.log(`  Exists (${existing.length} bytes).`);
        continue;
      }
    }

    try {
      const bytes = await downloadPdf(entry.pdfUrl, destination, entry.articleUrl);
      results.push({ ...entry, destination, status: 'downloaded', bytes });
      console.log(`  Downloaded PDF (${bytes} bytes).`);
    } catch (error) {
      results.push({ ...entry, destination, status: 'failed', reason: error.message });
      console.error(`  Failed: ${error.message}`);
    }
  }

  const manifestPath = path.join(META_DIR, 'cdc-acip-download-manifest.json');
  await fs.writeFile(manifestPath, `${JSON.stringify(results, null, 2)}\n`);
  const ok = results.filter((result) => result.status === 'downloaded' || result.status === 'exists');
  const failed = results.filter((result) => result.status === 'failed');
  console.log(`\nDone. Downloaded/verified ${ok.length}/${results.length}.`);
  if (failed.length) failed.forEach((item) => console.log(`- ${item.topic} / ${item.title}: ${item.reason}`));
  console.log(`Manifest: ${manifestPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
