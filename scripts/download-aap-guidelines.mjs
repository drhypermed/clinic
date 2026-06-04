/**
 * Download AAP clinical practice guideline PDFs from:
 * https://www.aap.org/en/quality-improvement/clinical-practice-guidelines/
 *
 * AAP Publications is protected by Cloudflare for direct Node fetches, while
 * the official PDF URLs are exposed through Crossref DOI metadata. This script
 * discovers the AAP page entries, resolves DOIs to official article-pdf URLs,
 * then uses a normal Chrome instance with "always open PDFs externally" enabled
 * to save the actual PDF files.
 *
 * Run: node scripts/download-aap-guidelines.mjs --force
 */

import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const INDEX_URL = 'https://www.aap.org/en/quality-improvement/clinical-practice-guidelines/';
const TARGET_DIR = path.resolve('guidelines-sources/AAP');
const META_DIR = path.join(TARGET_DIR, '_metadata');
const DOWNLOAD_DIR = path.resolve('scratch/aap-guideline-downloads');
const CHROME_PROFILE = path.resolve(`scratch/chrome-aap-guideline-downloader-${Date.now()}`);
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

const DOI_OVERRIDES = {
  'Infant Fever': ['10.1542/peds.2021-052228'],
  'Acute Bacterial Sinusitis': ['10.1542/peds.2013-1071'],
  'Acute Otitis Media': ['10.1542/peds.2012-3488'],
  Bronchiolitis: ['10.1542/peds.2014-2742'],
  'Childhood Obstructive Sleep Apnea Syndrome': ['10.1542/peds.2012-1671'],
  'Simple Febrile Seizure': ['10.1542/peds.2010-3318'],
  'Type 2 Diabetes Mellitus (T2DM)': ['10.1542/peds.2012-3494'],
};

const EXCLUDED_DOIS = new Set([
  // Linked from the infant fever page, but this is a quality-improvement article,
  // not the clinical practice guideline PDF.
  '10.1542/peds.2018-2201',
]);

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

function safeName(value, max = 125) {
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

function fileNameFor(title, publishedDate, doi) {
  const year = extractYear(publishedDate || doi);
  const clean = safeName(title, 95);
  return `${year ? `${clean} (${year})` : clean}.pdf`;
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

function absolutize(url, baseUrl) {
  return new URL(decodeHtml(url), baseUrl).href;
}

function sectionFromHeading(heading) {
  const clean = stripHtml(heading);
  if (/current/i.test(clean)) return 'Current';
  if (/development/i.test(clean)) return 'In Development';
  if (/review|expired/i.test(clean)) return 'Under Review or Expired';
  return clean.replace(/^AAP Clinical Practice Guidelines:?\s*/i, '') || 'AAP Clinical Practice Guidelines';
}

function parseGuidelineMappings(html) {
  const blocks = [];
  const blockRegex = /<div class="card-block[^"]*"\s+data-campaigns-toolkit="([^"]+)"[\s\S]*?window\.resourceMappings\.push\(\{id:\s*'\1'[\s\S]*?<\/script>/gi;
  for (const blockMatch of html.matchAll(blockRegex)) {
    const id = blockMatch[1];
    const block = blockMatch[0];
    const heading = block.match(/<h3[^>]*data-block-title[^>]*>([\s\S]*?)<\/h3>/i)?.[1] || '';
    const section = sectionFromHeading(heading);
    const mappings = [];
    for (const mappingMatch of block.matchAll(/resourceMappings\['([^']+)'\.concat\(''\)\]\s*=\s*'([^']+)'/gi)) {
      const topic = decodeHtml(mappingMatch[1]).trim();
      const url = decodeHtml(mappingMatch[2]).trim();
      if (!topic || /not available at this time/i.test(topic)) continue;
      if (url.replace(/\/+$/, '') === INDEX_URL.replace(/\/+$/, '')) continue;
      mappings.push({ topic, url });
    }
    if (mappings.length) blocks.push({ id, section, mappings });
  }
  return blocks;
}

function normalizeDoi(value) {
  const cleaned = String(value || '')
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    .replace(/[?#].*$/, '')
    .replace(/[.,;)\]]+$/, '')
    .trim();
  return cleaned.match(/^(10\.1542\/peds\.\d{4}-\d{4,6})/i)?.[1] || cleaned;
}

function addPediatricsDoi(dois, value) {
  const doi = normalizeDoi(value);
  if (/^10\.1542\/peds\./i.test(doi)) dois.add(doi);
}

function doiFromECode(code) {
  const match = String(code || '').match(/^e?((?:19|20)\d{2})(\d{4,6})$/i);
  if (!match) return '';
  return `10.1542/peds.${match[1]}-${match[2]}`;
}

function extractDoisFromHtml(html, baseUrl) {
  const dois = new Set();
  for (const match of html.matchAll(/https?:\/\/(?:dx\.)?doi\.org\/(10\.1542\/[^"'<>)\]\s]+)/gi)) {
    addPediatricsDoi(dois, match[1]);
  }
  for (const match of html.matchAll(/https?:\/\/publications\.aap\.org\/[^"'<>]+\/article\/doi\/(10\.1542\/[^"'<>?\s]+)/gi)) {
    addPediatricsDoi(dois, match[1]);
  }
  for (const match of html.matchAll(/https?:\/\/pediatrics\.aappublications\.org\/content\/(?:pediatrics\/)?\d+\/\d+\/(e?\d{8,10})/gi)) {
    const doi = doiFromECode(match[1]);
    if (doi) dois.add(doi);
  }
  for (const match of html.matchAll(/href=["']([^"']+)["']/gi)) {
    const href = absolutize(match[1], baseUrl);
    const doiUrl = href.match(/\/article\/doi\/(10\.1542\/[^"'<>?\s]+)/i)?.[1];
    if (doiUrl) addPediatricsDoi(dois, doiUrl);
    const eCode = href.match(/\/(e\d{8,10})(?:[/?#]|$)/i)?.[1];
    const doi = doiFromECode(eCode);
    if (doi) dois.add(doi);
  }
  return [...dois];
}

function extractDoiFromArticleUrl(url) {
  const directDoi = url.match(/\/article\/doi\/(10\.1542\/[^/?#]+)/i)?.[1];
  if (directDoi) return normalizeDoi(directDoi);
  const eCode = url.match(/\/(e\d{8,10})(?:[/?#]|$)/i)?.[1];
  const inferred = doiFromECode(eCode);
  if (inferred) return inferred;
  const pdfName = url.match(/peds[_-]((?:19|20)\d{2})[-_]?(\d{4,6})\.pdf/i);
  if (pdfName) return `10.1542/peds.${pdfName[1]}-${pdfName[2]}`;
  return '';
}

async function resolveCrossref(doi) {
  const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      'user-agent': 'drhyperclinic-guideline-import/1.0',
    },
    signal: AbortSignal.timeout(45_000),
  });
  if (!response.ok) throw new Error(`Crossref ${doi} returned ${response.status}`);
  const json = await response.json();
  const message = json.message || {};
  const pdfUrl =
    (message.link || []).find((link) => /pdf/i.test(link['content-type'] || '') && /publications\.aap\.org/i.test(link.URL || ''))
      ?.URL || (message.link || []).find((link) => /pdf/i.test(`${link['content-type'] || ''} ${link.URL || ''}`))?.URL;
  if (!pdfUrl) throw new Error(`No Crossref PDF link for ${doi}`);
  return {
    doi,
    title: stripHtml(message.title?.[0] || doi),
    publishedDate: message.published?.['date-parts']?.[0]?.join('-') || String(message.year || ''),
    pdfUrl,
    articleUrl: message.URL || `https://doi.org/${doi}`,
  };
}

async function discoverEntries() {
  const indexHtml = await fetchText(INDEX_URL);
  await fs.mkdir(META_DIR, { recursive: true });
  await fs.writeFile(path.join(META_DIR, 'aap-guidelines-page.html'), indexHtml);

  const blocks = parseGuidelineMappings(indexHtml);
  const discovered = [];
  for (const block of blocks) {
    for (const mapping of block.mappings) {
      let dois = [];
      if (/publications\.aap\.org|pediatrics\.aappublications\.org/i.test(mapping.url)) {
        const doi = extractDoiFromArticleUrl(mapping.url);
        if (doi) dois.push(doi);
      } else {
        const html = await fetchText(mapping.url);
        await fs.writeFile(path.join(META_DIR, `${safeName(mapping.topic, 70)}.html`), html);
        dois = extractDoisFromHtml(html, mapping.url);
      }
      for (const override of DOI_OVERRIDES[mapping.topic] || []) {
        if (!dois.includes(override)) dois.push(override);
      }
      dois = dois.filter((doi) => !EXCLUDED_DOIS.has(doi.toLowerCase()));
      discovered.push({
        section: block.section,
        topic: mapping.topic,
        sourceUrl: mapping.url,
        dois: [...new Set(dois)],
      });
    }
  }

  const entries = [];
  for (const item of discovered) {
    if (!item.dois.length) {
      entries.push({ ...item, status: 'no-doi' });
      continue;
    }
    for (const doi of item.dois) {
      const resolved = await resolveCrossref(doi);
      entries.push({
        section: item.section,
        topic: item.topic,
        sourceUrl: item.sourceUrl,
        ...resolved,
      });
    }
  }

  const seen = new Set();
  return entries
    .filter((entry) => {
      if (!entry.doi) return true;
      const key = entry.doi.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.section.localeCompare(b.section) || a.topic.localeCompare(b.topic) || (a.title || '').localeCompare(b.title || ''));
}

function findChromePath() {
  const candidates = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google/Chrome/Application/chrome.exe'),
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  ];
  const found = candidates.find((candidate) => candidate && fsSync.existsSync(candidate));
  if (!found) throw new Error('Chrome or Edge executable was not found');
  return found;
}

async function waitForPort(port) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`, { signal: AbortSignal.timeout(1000) });
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Chrome debugging port ${port} was not ready`);
}

async function launchDownloadBrowser() {
  await fs.rm(CHROME_PROFILE, { recursive: true, force: true });
  await fs.rm(DOWNLOAD_DIR, { recursive: true, force: true });
  await fs.mkdir(path.join(CHROME_PROFILE, 'Default'), { recursive: true });
  await fs.mkdir(DOWNLOAD_DIR, { recursive: true });
  await fs.writeFile(
    path.join(CHROME_PROFILE, 'Default', 'Preferences'),
    JSON.stringify({
      download: {
        default_directory: DOWNLOAD_DIR,
        directory_upgrade: true,
        prompt_for_download: false,
      },
      plugins: { always_open_pdf_externally: true },
    }),
  );

  const port = 9250 + Math.floor(Math.random() * 200);
  const chrome = spawn(
    findChromePath(),
    [
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${CHROME_PROFILE}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-popup-blocking',
      'about:blank',
    ],
    { stdio: 'ignore' },
  );
  await waitForPort(port);
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
  const session = await browser.newBrowserCDPSession();
  await session.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: DOWNLOAD_DIR });
  return { browser, chrome };
}

async function listCompleteDownloads() {
  const entries = await fs.readdir(DOWNLOAD_DIR, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (!entry.isFile() || entry.name.endsWith('.crdownload')) continue;
    const fullPath = path.join(DOWNLOAD_DIR, entry.name);
    const stat = await fs.stat(fullPath);
    files.push({ fullPath, name: entry.name, mtimeMs: stat.mtimeMs, size: stat.size });
  }
  return files.sort((a, b) => b.mtimeMs - a.mtimeMs);
}

async function waitForDownloadedFile(startTime, suggestedName) {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    const files = await listCompleteDownloads();
    const exact = suggestedName ? files.find((file) => file.name === suggestedName && file.mtimeMs >= startTime - 5000) : null;
    const newest = files.find((file) => file.mtimeMs >= startTime - 5000);
    const picked = exact || newest;
    if (picked && picked.size > 1000) return picked;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error('Downloaded file was not found');
}

async function downloadPdf(context, entry, destination) {
  const page = context.pages()[0] || (await context.newPage());
  page.setDefaultTimeout(90_000);
  page.setDefaultNavigationTimeout(120_000);
  const before = Date.now();
  const downloadPromise = page.waitForEvent('download', { timeout: 120_000 });
  await page.goto(entry.pdfUrl, { waitUntil: 'commit', timeout: 120_000 }).catch((error) => {
    if (!/Download is starting/i.test(error.message)) throw error;
  });
  const download = await downloadPromise;
  const downloaded = await waitForDownloadedFile(before, download.suggestedFilename());
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(downloaded.fullPath, destination);

  const buffer = await fs.readFile(destination);
  if (buffer.subarray(0, 4).toString('latin1') !== '%PDF') {
    throw new Error(`Downloaded response is not a PDF (${buffer.subarray(0, 24).toString('latin1')})`);
  }
  await fs.rm(downloaded.fullPath, { force: true });
  return { bytes: buffer.length, suggestedFilename: download.suggestedFilename() };
}

async function main() {
  await fs.mkdir(TARGET_DIR, { recursive: true });
  await fs.mkdir(META_DIR, { recursive: true });

  let entries = await discoverEntries();
  if (matchText) {
    entries = entries.filter((entry) =>
      `${entry.section} ${entry.topic} ${entry.title || ''} ${entry.doi || ''}`.toLowerCase().includes(matchText),
    );
  }
  if (Number.isFinite(limit) && limit > 0) entries = entries.slice(0, limit);

  await fs.writeFile(path.join(META_DIR, 'aap-guidelines-discovered.json'), `${JSON.stringify(entries, null, 2)}\n`);
  console.log(`Discovered ${entries.length} AAP guideline/article entries.`);

  if (auditOnly) {
    const missing = entries.filter((entry) => !entry.doi || !entry.pdfUrl);
    console.log(`Audit done. PDF links found for ${entries.length - missing.length}/${entries.length}.`);
    if (missing.length) missing.forEach((entry) => console.log(`- ${entry.topic}: ${entry.sourceUrl}`));
    return;
  }

  const { browser, chrome } = await launchDownloadBrowser();
  const context = browser.contexts()[0];
  const results = [];

  try {
    for (const [index, entry] of entries.entries()) {
      if (!entry.doi || !entry.pdfUrl) {
        results.push({ ...entry, status: 'skipped', reason: 'No DOI/PDF URL' });
        continue;
      }
      const sectionDir = path.join(TARGET_DIR, safeName(entry.section, 60));
      const topicDir = path.join(sectionDir, safeName(entry.topic, 80));
      const destination = path.join(topicDir, fileNameFor(entry.title, entry.publishedDate, entry.doi));

      console.log(`\n[${index + 1}/${entries.length}] [${entry.section} / ${entry.topic}] ${entry.title}`);
      if (!force && fsSync.existsSync(destination)) {
        const existing = await fs.readFile(destination);
        if (existing.subarray(0, 4).toString('latin1') === '%PDF') {
          results.push({ ...entry, destination, status: 'exists', bytes: existing.length });
          console.log(`  Exists (${existing.length} bytes).`);
          continue;
        }
      }

      try {
        const downloaded = await downloadPdf(context, entry, destination);
        results.push({
          ...entry,
          destination,
          status: 'downloaded',
          bytes: downloaded.bytes,
          suggestedFilename: downloaded.suggestedFilename,
        });
        console.log(`  Downloaded actual PDF (${downloaded.bytes} bytes).`);
      } catch (error) {
        results.push({ ...entry, destination, status: 'failed', reason: error.message });
        console.error(`  Failed: ${error.message}`);
      }
    }
  } finally {
    await browser.close().catch(() => {});
    chrome.kill('SIGKILL');
  }

  const manifestPath = path.join(META_DIR, 'aap-guidelines-download-manifest.json');
  await fs.writeFile(manifestPath, `${JSON.stringify(results, null, 2)}\n`);
  const downloaded = results.filter((result) => result.status === 'downloaded' || result.status === 'exists');
  const failed = results.filter((result) => result.status === 'failed');
  console.log(`\nDone. Downloaded/verified ${downloaded.length}/${results.length}.`);
  if (failed.length) {
    console.log('Failures:');
    failed.forEach((item) => console.log(`- ${item.topic} / ${item.title}: ${item.reason}`));
  }
  console.log(`Manifest: ${manifestPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
