/**
 * Download real ACOG Practice Bulletin PDFs using an authenticated browser
 * profile created by scripts/acog-login-session.mjs.
 *
 * This script refuses HTML fallbacks and only saves files whose first bytes are
 * %PDF. It is intentionally strict so broken Access Not Allowed pages are not
 * uploaded as guidelines.
 */

import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const SEARCH_URL = 'https://www.acog.org/clinical/search?t=#f:@selectedcontenttype=[Practice%20Bulletin]';
const PROFILE_DIR = path.resolve('scratch/acog-auth-profile');
const TARGET_DIR = path.resolve('guidelines-sources/ACOG');
const META_DIR = path.join(TARGET_DIR, '_metadata');
const force = process.argv.includes('--force');
const auditOnly = process.argv.includes('--audit-only');
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.slice('--limit='.length)) : 0;
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36';

function stripHtml(value = '') {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function canonicalUrl(value = '') {
  try {
    const url = new URL(value);
    url.protocol = 'https:';
    url.hash = '';
    return url.href.replace(/\/+$/, '');
  } catch {
    return String(value || '').replace(/^http:/i, 'https:').replace(/\/+$/, '');
  }
}

function safeName(value, max = 115) {
  return String(value || '')
    .replace(/\s+\|\s+ACOG$/i, '')
    .replace(/:/g, ' -')
    .replace(/[<>"/\\|?*\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
    .trim();
}

async function getToken() {
  const response = await fetch(`https://www.acog.org/coveo/rest/token?t=${Date.now()}`, {
    headers: {
      accept: 'application/json',
      referer: SEARCH_URL,
      'user-agent': USER_AGENT,
    },
    signal: AbortSignal.timeout(45_000),
  });
  if (!response.ok) throw new Error(`ACOG token returned ${response.status}`);
  return (await response.json()).token;
}

async function coveoSearch(token, firstResult) {
  const body = {
    q: '',
    aq: '@selectedcontenttype=="Practice Bulletin"',
    searchHub: 'Clinical Search Results',
    pipeline: 'Clinical Search Results',
    firstResult,
    numberOfResults: 100,
    fieldsToInclude: [
      'title',
      'clickableuri',
      'uri',
      'selectedcontenttype',
      'articlenumber',
      'articlemonth',
      'customarticleyear',
      'doinumber',
      'topicname',
      'date',
    ],
  };
  const response = await fetch('https://www.acog.org/coveo/rest/search', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      referer: SEARCH_URL,
      'user-agent': USER_AGENT,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error(`ACOG Coveo search returned ${response.status}`);
  return response.json();
}

async function discoverEntries() {
  const token = await getToken();
  const results = [];
  for (let first = 0; ; first += 100) {
    const page = await coveoSearch(token, first);
    results.push(...(page.results || []));
    if (results.length >= Number(page.totalCount || 0) || !page.results?.length) break;
  }

  const seen = new Set();
  return results
    .map((result) => {
      const raw = result.raw || {};
      return {
        title: String(result.title || raw.title || '').replace(/\s+\|\s+ACOG$/i, '').trim(),
        url: canonicalUrl(result.clickUri || raw.clickableuri || raw.uri),
        articleNumber: raw.articlenumber ? String(raw.articlenumber) : '',
        month: raw.articlemonth || '',
        year: raw.customarticleyear ? String(raw.customarticleyear) : '',
        doi: raw.doinumber || '',
        topics: Array.isArray(raw.topicname) ? raw.topicname : raw.topicname ? [raw.topicname] : [],
      };
    })
    .filter((entry) => entry.url && entry.title)
    .filter((entry) => {
      const key = canonicalUrl(entry.url).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => (b.year || '').localeCompare(a.year || '') || Number(b.articleNumber || 0) - Number(a.articleNumber || 0));
}

async function extractPdfUrl(page, entry) {
  await page.goto(entry.url, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await page.getByText('Continue').first().click({ timeout: 3000 }).catch(() => undefined);
  const title = await page.title().catch(() => '');
  const bodyText = await page.locator('body').innerText({ timeout: 10_000 }).catch(() => '');
  if (/Access Not Allowed|Withdrawn Clinical Document/i.test(`${title}\n${bodyText.slice(0, 3000)}`)) return '';

  return page.locator('a').evaluateAll((links) => {
    const match = links.find((link) => {
      const text = (link.textContent || '').replace(/\s+/g, ' ').trim();
      const href = link.href || '';
      return /\.pdf(?:[?#]|$)/i.test(href) && (/download pdf/i.test(text) || /practice-bulletin/i.test(href));
    });
    return match?.href || '';
  });
}

async function fetchPdfWithContext(context, entry, pdfUrl) {
  const response = await context.request.get(pdfUrl, {
    headers: {
      accept: 'application/pdf,*/*;q=0.8',
      referer: entry.url,
      'user-agent': USER_AGENT,
    },
    timeout: 120_000,
    maxRedirects: 10,
  });
  const buffer = await response.body();
  const head = buffer.subarray(0, 4).toString('latin1');
  const sample = buffer.subarray(0, 2500).toString('utf8');
  return {
    ok: response.ok(),
    status: response.status(),
    contentType: response.headers()['content-type'] || '',
    isPdf: head === '%PDF',
    accessDenied: /Access Not Allowed|Log in|Subscribe|Register/i.test(sample),
    buffer,
  };
}

async function main() {
  await fs.mkdir(TARGET_DIR, { recursive: true });
  await fs.mkdir(META_DIR, { recursive: true });

  let entries = await discoverEntries();
  if (Number.isFinite(limit) && limit > 0) entries = entries.slice(0, limit);
  await fs.writeFile(path.join(META_DIR, 'acog-practice-bulletins-discovered.json'), `${JSON.stringify(entries, null, 2)}\n`);
  console.log(`Discovered ${entries.length} unique ACOG Practice Bulletin pages.`);

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    acceptDownloads: true,
    userAgent: USER_AGENT,
  });
  const page = context.pages()[0] || await context.newPage();

  const results = [];
  try {
    for (const [index, entry] of entries.entries()) {
      const yearDir = path.join(TARGET_DIR, entry.year || 'Undated');
      const numberPrefix = entry.articleNumber ? `Practice Bulletin ${entry.articleNumber} - ` : '';
      const destination = path.join(yearDir, `${safeName(`${numberPrefix}${entry.title}`)}${entry.year ? ` (${entry.year})` : ''}.pdf`);
      const relativeDestination = path.relative(process.cwd(), destination).replace(/\\/g, '/');
      console.log(`[${index + 1}/${entries.length}] ${entry.title}`);

      if (!force && fsSync.existsSync(destination)) {
        const existing = await fs.readFile(destination);
        if (existing.subarray(0, 4).toString('latin1') === '%PDF') {
          console.log(`  Exists: ${relativeDestination}`);
          results.push({ ...entry, destination: relativeDestination, status: 'exists' });
          continue;
        }
      }

      const pdfUrl = await extractPdfUrl(page, entry);
      if (!pdfUrl) {
        console.log('  No active official PDF link.');
        results.push({ ...entry, status: 'skipped', reason: 'No active official PDF link' });
        continue;
      }

      const fetched = await fetchPdfWithContext(context, entry, pdfUrl);
      if (!fetched.isPdf) {
        const reason = fetched.accessDenied
          ? 'Official PDF returned access/login/subscription HTML'
          : `Official PDF did not return PDF (${fetched.status} ${fetched.contentType})`;
        console.log(`  Skipped: ${reason}`);
        results.push({ ...entry, pdfUrl, status: 'skipped', reason, responseStatus: fetched.status, contentType: fetched.contentType });
        continue;
      }

      if (!auditOnly) {
        await fs.mkdir(yearDir, { recursive: true });
        await fs.writeFile(destination, fetched.buffer);
      }
      console.log(`  Downloaded official PDF (${fetched.buffer.length} bytes): ${relativeDestination}`);
      results.push({ ...entry, pdfUrl, destination: relativeDestination, bytes: fetched.buffer.length, status: auditOnly ? 'pdf-available' : 'downloaded' });
    }
  } finally {
    await context.close();
  }

  await fs.writeFile(path.join(META_DIR, 'acog-authenticated-download-results.json'), `${JSON.stringify(results, null, 2)}\n`);
  const downloaded = results.filter((result) => result.status === 'downloaded' || result.status === 'exists' || result.status === 'pdf-available').length;
  const skipped = results.filter((result) => result.status === 'skipped').length;
  console.log(JSON.stringify({ total: entries.length, downloaded, skipped, auditOnly }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
