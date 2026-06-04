import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const workspace = process.cwd();
const sourceUrl = 'https://www.acc.org/guidelines';
const outputRoot = path.resolve('guidelines-sources/ACC');
const force = process.argv.includes('--force');
const dryRun = process.argv.includes('--dry-run');
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
const yearsArg = process.argv.find((arg) => arg.startsWith('--years='));
const limit = limitArg ? Number(limitArg.slice('--limit='.length)) : Infinity;
const yearFilters = new Set(
  yearsArg
    ? yearsArg
        .slice('--years='.length)
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    : [],
);

const ensureInsideWorkspace = (target, label) => {
  const relative = path.relative(workspace, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label} must stay inside the workspace: ${target}`);
  }
};

ensureInsideWorkspace(outputRoot, 'Output root');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeSpace = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const stripLeadingYear = (value) => normalizeSpace(value).replace(/^20\d{2}\s+/, '').trim();

const sanitizeFileName = (value, max = 150) =>
  normalizeSpace(value)
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, max)
    .trim() || 'ACC Guideline';

const slugForId = (value, max = 120) =>
  normalizeSpace(value)
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max)
    .toLowerCase() || 'acc-guideline';

const hashShort = (value) => crypto.createHash('sha1').update(String(value)).digest('hex').slice(0, 10);

const writeJson = (target, value) => {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};

const writeText = (target, value) => {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${value.trim()}\n`, 'utf8');
};

const gotoWithRetries = async (page, url, options = {}, attempts = 3) => {
  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await page.goto(url, {
        waitUntil: options.waitUntil ?? 'domcontentloaded',
        timeout: options.timeout ?? 120000,
      });
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      console.warn(`  retry ${attempt}/${attempts - 1} after navigation failure: ${error.message}`);
      await sleep(3000 * attempt);
    }
  }
  throw lastError;
};

const collectGuidelines = async (page) => {
  await gotoWithRetries(page, sourceUrl, { timeout: 120000 });
  await page.waitForTimeout(5000);

  const rawHtml = await page.content();
  fs.mkdirSync(outputRoot, { recursive: true });
  fs.writeFileSync(path.join(outputRoot, '_raw_index.html'), rawHtml, 'utf8');

  return page.$$eval('section#guidelines section[id^="guidelines-"] a[href]', (anchors) => {
    const normalize = (value) => (value || '').replace(/\s+/g, ' ').trim();
    const seen = new Set();
    return anchors
      .map((a) => {
        const year = a.closest('section[id^="guidelines-"]')?.id?.match(/20\d{2}/)?.[0] || '';
        return {
          title: normalize(a.textContent).replace(/^New\s+/i, '').replace(/^20\d{2}\s+/, ''),
          year,
          url: a.href,
        };
      })
      .filter((item) => {
        const key = `${item.year}|${item.url}`;
        if (!item.title || !item.year || !item.url || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  });
};

const findPdfLink = async (page) =>
  page
    .$$eval('a[href]', (anchors) => {
      const links = anchors.map((a) => ({
        text: (a.textContent || '').replace(/\s+/g, ' ').trim(),
        href: a.href,
      }));
      return (
        links.find((link) => /^PDF$/i.test(link.text) && /\/doi\/e?pdf\//i.test(link.href)) ||
        links.find((link) => /\/doi\/e?pdf\//i.test(link.href)) ||
        links.find((link) => /\.pdf(?:$|[?#])/i.test(link.href))
      )?.href || null;
    })
    .catch(() => null);

const cleanArticleForPrint = async (page, metadata) => {
  await page.evaluate(({ title, url, sourceUrl: source }) => {
    const removeSelectors = [
      'script',
      'style',
      'noscript',
      'iframe',
      'header',
      'nav',
      'footer',
      '#header',
      '#footer',
      '#breadcrumbs',
      '.breadcrumbs',
      '.breadcrumb',
      '.advertisement',
      '.ad',
      '.social',
      '.share',
      '.related',
      '.recommended',
      '.article-tools',
      '.accessOptions',
      '.tabbed-menu',
      '[class*="cookie"]',
      '[class*="modal"]',
      '[class*="popup"]',
    ];
    for (const selector of removeSelectors) {
      document.querySelectorAll(selector).forEach((element) => element.remove());
    }

    const content =
      document.querySelector('main article') ||
      document.querySelector('article') ||
      document.querySelector('main') ||
      document.querySelector('#main-content') ||
      document.body;

    const printable = document.createElement('main');
    printable.id = 'acc-guideline-printable';
    printable.innerHTML = `
      <section class="source-note">
        <h1>${title}</h1>
        <p><strong>Source:</strong> ${url}</p>
        <p><strong>Index:</strong> ${source}</p>
        <p><strong>Captured:</strong> ${new Date().toISOString()}</p>
      </section>
      ${content.innerHTML}
    `;

    document.body.innerHTML = '';
    document.body.appendChild(printable);

    const style = document.createElement('style');
    style.textContent = `
      @page { margin: 16mm 14mm; }
      html, body { background: #fff !important; color: #111 !important; font-family: Arial, Helvetica, sans-serif; font-size: 10.5pt; line-height: 1.45; }
      #acc-guideline-printable { max-width: 920px; margin: 0 auto; }
      .source-note { border-bottom: 1px solid #999; margin-bottom: 18px; padding-bottom: 12px; }
      .source-note h1 { font-size: 18pt; line-height: 1.25; margin: 0 0 8px; }
      h1, h2, h3, h4 { color: #111 !important; page-break-after: avoid; }
      a { color: #111 !important; text-decoration: none; }
      img, svg, canvas, video { max-width: 100% !important; height: auto !important; page-break-inside: avoid; }
      table { border-collapse: collapse; width: 100%; page-break-inside: auto; }
      tr { page-break-inside: avoid; }
      th, td { border: 1px solid #ccc; padding: 4px 6px; vertical-align: top; }
      .table-wrap, figure { page-break-inside: avoid; }
    `;
    document.head.appendChild(style);
  }, metadata);
};

const extractArticleText = async (page) =>
  page
    .locator('body')
    .innerText({ timeout: 15000 })
    .then((text) => text.replace(/\n{4,}/g, '\n\n\n').trim())
    .catch(() => '');

const run = async () => {
  const browser = await chromium.launch({ headless: true });
  const baseContextOptions = {
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1365, height: 1600 },
    locale: 'en-US',
  };
  const context = await browser.newContext(baseContextOptions);

  const indexPage = await context.newPage();
  const discovered = await collectGuidelines(indexPage);
  await indexPage.close();

  const selected = discovered
    .filter((item) => yearFilters.size === 0 || yearFilters.has(item.year))
    .slice(0, Number.isFinite(limit) ? limit : discovered.length);

  console.log(`Found ${discovered.length} ACC guideline links. Selected ${selected.length}.`);

  const records = [];
  for (const [index, item] of selected.entries()) {
    const title = stripLeadingYear(item.title);
    const recordBase = { ...item, title };
    const label = `[${index + 1}/${selected.length}] ${item.year} ${title}`;
    const yearDir = path.join(outputRoot, item.year);
    const baseName = sanitizeFileName(`${item.year} - ${title}`);
    const uniqueName = `${baseName} - ${hashShort(item.url)}`;
    const pdfPath = path.join(yearDir, `${uniqueName}.pdf`);
    const htmlPath = path.join(yearDir, `${uniqueName}.html`);
    const textPath = path.join(yearDir, `${uniqueName}.txt`);

    if (!force && fs.existsSync(pdfPath) && fs.existsSync(textPath)) {
      console.log(`${label} - skip existing`);
      records.push({
        ...recordBase,
        status: 'exists',
        localPdf: path.relative(workspace, pdfPath).replace(/\\/g, '/'),
        localHtml: path.relative(workspace, htmlPath).replace(/\\/g, '/'),
        localText: path.relative(workspace, textPath).replace(/\\/g, '/'),
      });
      continue;
    }

    console.log(`${label} - capture`);
    const articleContext = await browser.newContext(baseContextOptions);
    const page = await articleContext.newPage();
    try {
      if (!dryRun) fs.mkdirSync(yearDir, { recursive: true });
      if (force && !dryRun) {
        for (const target of [pdfPath, htmlPath, textPath]) {
          if (fs.existsSync(target)) fs.rmSync(target, { force: true });
        }
      }

      const response = await gotoWithRetries(page, item.url, { timeout: 120000 });
      await page.waitForTimeout(4500);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)).catch(() => {});
      await page.waitForTimeout(1500);

      const pageTitle = normalizeSpace(await page.title());
      const pdfLink = await findPdfLink(page);
      const html = await page.content();

      await cleanArticleForPrint(page, {
        title: pageTitle || title,
        url: item.url,
        sourceUrl,
      });
      const text = await extractArticleText(page);
      if (response?.status() >= 400 || /just a moment/i.test(pageTitle) || text.length < 5000) {
        throw new Error(`Captured page is not usable (status ${response?.status() ?? 'unknown'}, title "${pageTitle}", ${text.length} chars).`);
      }

      if (!dryRun) {
        writeText(htmlPath, html);
        writeText(textPath, text);
        await page.pdf({
          path: pdfPath,
          format: 'A4',
          printBackground: true,
          preferCSSPageSize: false,
          margin: { top: '12mm', right: '10mm', bottom: '12mm', left: '10mm' },
        });
      }

      const pdfBytes = !dryRun && fs.existsSync(pdfPath) ? fs.statSync(pdfPath).size : 0;
      records.push({
        ...recordBase,
        status: 'captured',
        httpStatus: response?.status(),
        pageTitle,
        officialPdfLink: pdfLink,
        localPdf: path.relative(workspace, pdfPath).replace(/\\/g, '/'),
        localHtml: path.relative(workspace, htmlPath).replace(/\\/g, '/'),
        localText: path.relative(workspace, textPath).replace(/\\/g, '/'),
        textChars: text.length,
        pdfBytes,
      });
      console.log(`  saved ${Math.round(pdfBytes / 1024)}KB PDF, ${text.length} chars`);
    } catch (error) {
      records.push({
        ...recordBase,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
      });
      console.error(`  failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      await page.close().catch(() => {});
      await articleContext.close().catch(() => {});
      await sleep(1000);
    }
  }

  await browser.close();

  const manifest = {
    sourceUrl,
    generatedAt: new Date().toISOString(),
    discoveredCount: discovered.length,
    selectedCount: selected.length,
    capturedCount: records.filter((record) => record.status === 'captured' || record.status === 'exists').length,
    failedCount: records.filter((record) => record.status === 'failed').length,
    years: [...new Set(discovered.map((item) => item.year))],
    records,
  };

  if (!dryRun) writeJson(path.join(outputRoot, '_index.json'), manifest);
  console.log(`Done. Captured ${manifest.capturedCount}, failed ${manifest.failedCount}.`);
  console.log(path.relative(workspace, path.join(outputRoot, '_index.json')).replace(/\\/g, '/'));
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
