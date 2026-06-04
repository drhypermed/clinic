/**
 * Download Endocrine Society clinical practice guidelines into topic folders.
 *
 * The Endocrine pages usually link to Oxford Academic. Oxford blocks direct
 * article/PDF requests, but the same articles are available through the
 * Silverchair article-minimal endpoint when we know the article id.
 *
 * Run: node scripts/download-endocrine-guidelines.mjs
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const ROOT_URL = 'https://www.endocrine.org';
const SITEMAP_URL = `${ROOT_URL}/sitemap.xml`;
const TARGET_DIR = path.resolve('guidelines-sources/Endocrine');
const META_DIR = path.join(TARGET_DIR, '_metadata');

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const SKIP_SLUGS = new Set([
  'adrenal',
  'bone-health-and-osteoporosis',
  'cardiovascular-endocrinology',
  'collaborated-and-endorsed-guidelines',
  'cpg-survey-pico',
  'diabetes-mellitus-and-glucose-metabolism',
  'endocrine-cancer-and-neoplasia',
  'endocrine-society-guideline-methodologist',
  'female-reproductive-endocrinology',
  'guidelines-by-year',
  'guidelines-in-development',
  'hypoglycemia',
  'male-reproductive-endocrinology',
  'methodology',
  'methodology-beta',
  'methodology-beta-2',
  'mobile-app',
  'neuroendocrinology',
  'obesity',
  'obesity-focus-group',
  'pediatric-endocrinology',
  'pocket-guides-members',
  'public-comments',
  'social-media-toolkit',
  'transgender-medicine-and-research',
]);

const CATEGORY_BY_SLUG = {
  acromegaly: 'Neuroendocrinology',
  'adult-growth-hormone-deficiency': 'Neuroendocrinology',
  'androgen-therapy-in-women': 'Female Reproductive Endocrinology',
  'congenital-adrenal-hyperplasia-guideline-resources': 'Adrenal',
  'continuous-glucose-monitoring': 'Diabetes Mellitus and Glucose Metabolism',
  'diabetes-in-older-adults': 'Diabetes Mellitus and Glucose Metabolism',
  'diagnosis-of-cushing-syndrome': 'Adrenal',
  'disorders-in-survivors-of-childhood-cancer': 'Pediatric Endocrinology',
  'gender-dysphoria-gender-incongruence': 'Transgender Medicine and Research',
  'glucocorticoid-induced-adrenal-insufficiency': 'Adrenal',
  hirsutism: 'Female Reproductive Endocrinology',
  'high-risk-for-hypoglycemia': 'Hypoglycemia',
  hypercalcemia: 'Endocrine Cancer and Neoplasia',
  'hormone-replacement-in-hypopituitarism': 'Neuroendocrinology',
  hyperprolactinemia: 'Neuroendocrinology',
  'hypothalamic-amenorrhea': 'Female Reproductive Endocrinology',
  'inpatient-hyperglycemia-guideline-resources': 'Diabetes Mellitus and Glucose Metabolism',
  'lipid-management-guideline': 'Cardiovascular Endocrinology',
  'osteoporosis-in-postmenopausal-women': 'Bone Health and Osteoporosis',
  'pagets-disease-of-bone': 'Bone Health and Osteoporosis',
  'pediatric-obesity': 'Pediatric Endocrinology',
  'pharmacological-management-of-obesity': 'Obesity',
  'pituitary-incidentaloma': 'Neuroendocrinology',
  'polycystic-ovary-syndrome': 'Female Reproductive Endocrinology',
  'post-bariatric-surgery': 'Obesity',
  'preexisting-diabetes-in-pregnancy': 'Diabetes Mellitus and Glucose Metabolism',
  'primary-adrenal-insufficiency': 'Adrenal',
  'primary-aldosteronism-2': 'Adrenal',
  'testosterone-therapy': 'Male Reproductive Endocrinology',
  'thyroid-dysfunction-during-pregnancy-and-postpartum': 'Female Reproductive Endocrinology',
  'treatment-of-cushing-syndrome': 'Adrenal',
  'vitamin-d-for-prevention-of-disease': 'Bone Health and Osteoporosis',
};

const ARTICLE_ID_BY_DOI = {
  '10.1210/clinem/dgaa674': '5909161',
  '10.1210/jc.2009-2128': '2835116',
  '10.1210/jc.2010-1692': '2709487',
  '10.1210/jc.2010-2756': '2834825',
  '10.1210/jc.2011-0179': '2833853',
  '10.1210/jc.2011-2803': '2823170',
  '10.1210/jc.2014-2260': '2836272',
  '10.1210/jc.2014-2700': '2836347',
  '10.1210/jc.2014-2910': '2833929',
  '10.1210/jc.2014-3415': '2813109',
  '10.1210/jc.2016-2118': '2764912',
  '10.1210/jc.2016-2573': '2965084',
  '10.1210/jc.2017-00131': '3077281',
  '10.1210/jc.2019-00221': '5418884',
};

const SOURCE_BY_SLUG = {
  'hormone-replacement-in-hypopituitarism': {
    href: 'https://doi.org/10.1210/jc.2016-2118',
    text: 'Hormonal Replacement in Hypopituitarism in Adults',
  },
  'hypothalamic-amenorrhea': {
    href: 'https://academic.oup.com/jcem/article-lookup/doi/10.1210/jc.2017-00131',
    text: 'Functional Hypothalamic Amenorrhea',
  },
  'inpatient-hyperglycemia-guideline-resources': {
    href: 'https://academic.oup.com/jcem/advance-article/doi/10.1210/clinem/dgac278/6605637',
    text: 'Management of Hyperglycemia in Hospitalized Adult Patients in Non-Critical Care Settings: An Endocrine Society Clinical Practice Guideline',
  },
  'lipid-management-guideline': {
    href: 'https://academic.oup.com/jcem/article-lookup/doi/10.1210/clinem/dgaa674',
    text: 'Lipid Management in Patients with Endocrine Disorders: An Endocrine Society Clinical Practice Guideline',
  },
};

const ENTITY_MAP = {
  amp: '&',
  apos: "'",
  gt: '>',
  hellip: '...',
  ldquo: '"',
  lsquo: "'",
  lt: '<',
  mdash: '-',
  ndash: '-',
  nbsp: ' ',
  quot: '"',
  rdquo: '"',
  rsquo: "'",
};

function decodeHtml(value = '') {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(Number.parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (_, name) => ENTITY_MAP[name.toLowerCase()] ?? `&${name};`)
    .replace(/\s+/g, ' ')
    .trim();
}

function slugFromUrl(url) {
  return new URL(url).pathname.split('/').filter(Boolean).pop();
}

function safeName(value, max = 180) {
  return value
    .replace(/:/g, ' -')
    .replace(/[<>"/\\|?*\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
    .trim();
}

function extractYear(value = '') {
  const match = value.match(/\b(19|20)\d{2}\b/);
  return match?.[0] ?? '';
}

function fileNameFor(title, date) {
  const cleanTitle = safeName(title, 110).replace(/^Full Guideline\s*-?\s*/i, '');
  const year = extractYear(date);
  const hasYear = year && new RegExp(`\\b${year}\\b`).test(cleanTitle);
  return `${hasYear || !year ? cleanTitle : `${cleanTitle} (${year})`}.pdf`;
}

function extractDoi(href) {
  const url = new URL(href);
  const doiIndex = url.pathname.indexOf('/doi/');
  if (doiIndex >= 0) {
    const afterDoi = decodeURIComponent(url.pathname.slice(doiIndex + 5));
    const parts = afterDoi.split('/').filter(Boolean);
    if (parts[0] === '10.1210' && parts[1] === 'clinem') return `${parts[0]}/${parts[1]}/${parts[2]}`;
    if (parts[0] === '10.1210') return `${parts[0]}/${parts[1]}`;
  }

  const lookupIndex = url.pathname.indexOf('/article-lookup/doi/');
  if (lookupIndex >= 0) {
    return decodeURIComponent(url.pathname.slice(lookupIndex + '/article-lookup/doi/'.length));
  }

  const match = decodeURIComponent(href).match(/10\.1210\/(?:clinem\/[a-z0-9-]+|jc\.[a-z0-9-]+)/i);
  return match?.[0] ?? '';
}

function extractArticleId(href, doi) {
  const url = new URL(href);
  const numericParts = url.pathname.split('/').filter((part) => /^\d{6,}$/.test(part));
  return numericParts.at(-1) ?? ARTICLE_ID_BY_DOI[doi] ?? '';
}

function pickGuidelineLink(anchors) {
  const journalLinks = anchors
    .filter((anchor) => {
      const url = new URL(anchor.href);
      return url.hostname === 'doi.org' || (url.hostname === 'academic.oup.com' && url.pathname.startsWith('/jcem/'));
    })
    .map((anchor, index, all) => {
      if (!/^(full guideline:?|read the full guideline)$/i.test(anchor.text)) return anchor;
      const longerDuplicate = all.find((candidate) => candidate.href === anchor.href && candidate.text.length > anchor.text.length);
      return longerDuplicate ?? anchor;
    });
  const usable = journalLinks.filter((anchor) => {
    const text = anchor.text.toLowerCase();
    return !/(systematic review|meta-analysis|patient resource|patient guide|pocket|feature|communication|table|figure|correction|presentation|slide|education|guideline central)/i.test(
      text,
    );
  });

  return (
    usable.find((anchor) => /full guideline/i.test(anchor.text)) ??
    usable.find((anchor) => /clinical practice guideline|joint clinical guideline/i.test(anchor.text)) ??
    usable.find((anchor) => /read the full guideline/i.test(anchor.text)) ??
    usable.find((anchor) => /management|diagnosis|treatment|therapy|evaluation|replacement|amenorrhea|lipid|hyperglycemia/i.test(anchor.text)) ??
    null
  );
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'user-agent': USER_AGENT,
    },
  });
  if (!response.ok) throw new Error(`GET ${url} returned ${response.status}`);
  return response.text();
}

async function discoverGuidelines() {
  const xml = await fetchText(SITEMAP_URL);
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map((match) => match[1])
    .filter((url) => url.startsWith(`${ROOT_URL}/clinical-practice-guidelines/`));

  const guidelines = [];

  for (const pageUrl of urls) {
    const slug = slugFromUrl(pageUrl);
    if (SKIP_SLUGS.has(slug)) continue;

    const html = await fetchText(pageUrl);
    const h1 = decodeHtml(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? '');
    const pageDate = decodeHtml(html.match(/<span class="meta__date">([\s\S]*?)<\/span>/i)?.[1] ?? '');
    const anchors = [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map((match) => ({
      href: new URL(match[1], pageUrl).href,
      text: decodeHtml(match[2]),
    }));

    const guidelineLink = pickGuidelineLink(anchors) ?? SOURCE_BY_SLUG[slug];
    if (!guidelineLink) {
      guidelines.push({
        articleId: '',
        category: CATEGORY_BY_SLUG[slug] ?? 'Uncategorized',
        date: pageDate,
        doi: '',
        fileName: fileNameFor(h1 || slug, pageDate),
        h1,
        pageUrl,
        pmcid: '',
        slug,
        sourceUrl: '',
        status: 'missing-link',
        title: h1 || slug,
      });
      continue;
    }

    const doi = extractDoi(guidelineLink.href);
    const articleId = extractArticleId(guidelineLink.href, doi);
    const title = safeName(guidelineLink.text || h1 || slug).replace(/^Full Guideline\s*-?\s*/i, '') || safeName(h1 || slug);

    guidelines.push({
      articleId,
      category: CATEGORY_BY_SLUG[slug] ?? 'Uncategorized',
      date: pageDate,
      doi,
      fileName: fileNameFor(title, pageDate),
      h1,
      pageUrl,
      pmcid: '',
      slug,
      sourceUrl: guidelineLink.href,
      status: 'pending',
      title,
    });
  }

  return guidelines;
}

async function lookupPmcid(doi) {
  if (!doi) return '';
  const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:${encodeURIComponent(
    doi,
  )}&format=json&resultType=core`;
  const response = await fetch(url, { headers: { 'user-agent': USER_AGENT } });
  if (!response.ok) return '';
  const json = await response.json();
  return json.resultList?.result?.[0]?.pmcid ?? '';
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

async function printArticleMinimalPdf(browser, articleId, destination) {
  const page = await browser.newPage({ userAgent: USER_AGENT });
  const url = `https://oup.silverchair-cdn.com/article-minimal/${articleId}`;
  try {
    const html = await fetchText(url);
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await page.addStyleTag({
      content: `
        html, body { background: #fff !important; }
        body { font-family: Arial, Helvetica, sans-serif !important; color: #111 !important; }
        header, nav, footer, script, style, .toolbar, .article-tools, .share, .advertisement { display: none !important; }
        * { visibility: visible !important; color: #111 !important; }
        a { color: #111 !important; text-decoration: none !important; }
        table { max-width: 100%; font-size: 10px; border-collapse: collapse; }
        img { max-width: 100%; }
      `,
    });
    await page.pdf({
      path: destination,
      format: 'A4',
      printBackground: true,
      margin: { top: '14mm', right: '12mm', bottom: '14mm', left: '12mm' },
    });
  } finally {
    await page.close();
  }
}

async function main() {
  await fs.mkdir(TARGET_DIR, { recursive: true });
  await fs.mkdir(META_DIR, { recursive: true });

  const guidelines = await discoverGuidelines();
  console.log(`Discovered ${guidelines.length} Endocrine guideline pages.`);

  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    for (const guideline of guidelines) {
      const categoryDir = path.join(TARGET_DIR, safeName(guideline.category));
      const destination = path.join(categoryDir, guideline.fileName);
      await fs.mkdir(categoryDir, { recursive: true });

      console.log(`\n[${guideline.category}] ${guideline.title}`);
      console.log(`  Page: ${guideline.pageUrl}`);
      if (!guideline.sourceUrl) {
        console.log('  No full guideline link found.');
        results.push({ ...guideline, destination, status: 'failed', reason: 'No full guideline link found' });
        continue;
      }

      try {
        guideline.pmcid = await lookupPmcid(guideline.doi);
        if (guideline.pmcid) {
          try {
            await downloadPdf(`https://europepmc.org/api/getPdf?pmcid=${guideline.pmcid}`, destination);
            console.log(`  Downloaded Europe PMC PDF (${guideline.pmcid}).`);
            results.push({ ...guideline, destination, status: 'downloaded', method: 'europepmc' });
            continue;
          } catch (error) {
            console.log(`  Europe PMC PDF unavailable (${error.message}); trying Oxford article-minimal.`);
          }
        }

        if (!guideline.articleId) throw new Error(`No Oxford article id for ${guideline.sourceUrl}`);
        await printArticleMinimalPdf(browser, guideline.articleId, destination);
        console.log(`  Rendered Oxford article-minimal PDF (${guideline.articleId}).`);
        results.push({ ...guideline, destination, status: 'downloaded', method: 'oup-article-minimal' });
      } catch (error) {
        console.error(`  Failed: ${error.message}`);
        results.push({ ...guideline, destination, status: 'failed', reason: error.message });
      }
    }
  } finally {
    await browser.close();
  }

  const downloaded = results.filter((result) => result.status === 'downloaded');
  const failed = results.filter((result) => result.status === 'failed');
  const manifestPath = path.join(META_DIR, 'endocrine-guidelines-download-manifest.json');
  await fs.writeFile(manifestPath, `${JSON.stringify(results, null, 2)}\n`);

  console.log(`\nDone. Downloaded ${downloaded.length}/${results.length} guidelines.`);
  if (failed.length) {
    console.log('Failures:');
    for (const failure of failed) console.log(`- ${failure.slug}: ${failure.reason}`);
  }
  console.log(`Manifest: ${manifestPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
