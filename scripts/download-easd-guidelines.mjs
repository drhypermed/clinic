import fs from 'node:fs';
import path from 'node:path';

const SOURCE_URL = 'https://www.easd.org/guidelines/statements-guidelines/';
const targetDir = path.resolve('guidelines-sources/EASD/Statements and Guidelines');
const reviewDir = path.resolve('guidelines-sources/_review');
const reportPath = path.join(reviewDir, 'easd-statements-guidelines-download-report.json');

const userAgent =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const htmlDecode = (value) =>
  String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&ndash;/g, '-')
    .replace(/&mdash;/g, '-')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const sanitize = (value, max = 170) =>
  htmlDecode(value)
    .replace(/[<>:"/\\|?*\u0000-\u001f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
    .replace(/[. ]+$/g, '') || 'EASD guideline';

const headers = (accept) => ({
  'user-agent': userAgent,
  accept,
  'accept-language': 'en-US,en;q=0.9',
});

const fetchWithRetries = async (url, options, attempts = 3) => {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(options.timeoutMs),
        redirect: 'follow',
      });
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(1000 * attempt);
    }
  }
  throw lastError;
};

const fetchText = async (url) => {
  const response = await fetchWithRetries(url, {
    timeoutMs: 45000,
    headers: headers('text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8'),
  });
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();
  return { response, contentType, text };
};

const fetchBytes = async (url) => {
  const response = await fetchWithRetries(url, {
    timeoutMs: 60000,
    headers: headers('application/pdf,text/html;q=0.9,*/*;q=0.8'),
  });
  const contentType = response.headers.get('content-type') || '';
  const bytes = new Uint8Array(await response.arrayBuffer());
  return { response, contentType, bytes };
};

const isPdfBytes = (bytes) =>
  bytes.length >= 5 && Buffer.from(bytes.slice(0, 5)).toString('ascii') === '%PDF-';

const absolutize = (href, baseUrl) => {
  try {
    return new URL(htmlDecode(href), baseUrl).href;
  } catch {
    return '';
  }
};

const extractLinks = (html, baseUrl) =>
  [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => ({
      href: absolutize(match[1], baseUrl),
      text: htmlDecode(match[2]),
    }))
    .filter((link) => link.href);

const extractEasdPublicationLinks = (html) => {
  const start = html.search(/Consensus Reports,\s*Guidelines/i);
  const end = html.search(/<h2[^>]*>\s*Archives\s*<\/h2>/i);
  const archiveEnd = html.search(/The aims of the Association/i);
  const currentHtml = start >= 0 ? html.slice(start, end > start ? end : undefined) : html;
  const archiveHtml = end >= 0 ? html.slice(end, archiveEnd > end ? archiveEnd : undefined) : '';

  const parseSection = (sectionHtml, section) =>
    extractLinks(sectionHtml, SOURCE_URL)
      .filter((link) => /\((?:19|20)\d{2}\)/.test(link.text))
      .map((link) => ({ ...link, section }));

  const all = [...parseSection(currentHtml, 'current'), ...parseSection(archiveHtml, 'archive')];
  const seen = new Set();
  return all.filter((link) => {
    const key = link.href;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const springerPdfCandidate = (url) => {
  try {
    const parsed = new URL(url);
    if (!/(^|\.)link\.springer\.com$/i.test(parsed.hostname)) return '';
    const doi = decodeURIComponent(parsed.pathname.replace(/^\/(?:article|chapter)\//, '').replace(/\/$/, ''));
    if (!doi || doi === parsed.pathname) return '';
    return `https://link.springer.com/content/pdf/${doi}.pdf`;
  } catch {
    return '';
  }
};

const elsevierPdfCandidate = (url) => {
  try {
    const parsed = new URL(url);
    if (!/(journal-of-hepatology\.eu|endocrinepractice\.org|sciencedirect\.com)$/i.test(parsed.hostname)) {
      return '';
    }
    const match = parsed.pathname.match(/\/article\/([^/]+)(?:\/(?:fulltext|abstract))?\/?$/i);
    if (!match) return '';
    return `${parsed.origin}/action/showPdf?pii=${encodeURIComponent(match[1])}`;
  } catch {
    return '';
  }
};

const elsevierArticlePdfCandidate = (url) => {
  try {
    const parsed = new URL(url);
    if (!/(journal-of-hepatology\.eu|endocrinepractice\.org|sciencedirect\.com)$/i.test(parsed.hostname)) {
      return '';
    }
    const match = parsed.pathname.match(/\/article\/([^/]+)(?:\/(?:fulltext|abstract))?\/?$/i);
    if (!match) return '';
    return `${parsed.origin}/article/${match[1]}/pdf`;
  } catch {
    return '';
  }
};

const elsevierScienceDirectCandidate = (url) => {
  try {
    const parsed = new URL(url);
    if (!/(journal-of-hepatology\.eu|endocrinepractice\.org|sciencedirect\.com)$/i.test(parsed.hostname)) {
      return '';
    }
    const match = parsed.pathname.match(/\/article\/([^/]+)(?:\/(?:fulltext|abstract))?\/?$/i);
    if (!match) return '';
    const normalizedPii = decodeURIComponent(match[1]).replace(/[^a-z0-9]/gi, '');
    return normalizedPii
      ? `https://www.sciencedirect.com/science/article/pii/${normalizedPii}/pdfft?isDTMRedir=true&download=true`
      : '';
  } catch {
    return '';
  }
};

const extractDoi = (value) => {
  const decoded = decodeURIComponent(String(value || ''));
  const match = decoded.match(/10\.\d{4,9}\/[^\s"'<>?#]+/i);
  return match ? match[0].replace(/\.pdf$/i, '').replace(/[).,;]+$/, '') : '';
};

const europePmcPdfCandidate = async (doi) => {
  if (!doi) return '';
  const apiUrl = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:%22${encodeURIComponent(doi)}%22&format=json`;
  const { response, text } = await fetchText(apiUrl);
  if (!response.ok) return '';
  const data = JSON.parse(text);
  const result = data?.resultList?.result?.find((item) => item?.pmcid && item?.hasPDF === 'Y')
    || data?.resultList?.result?.find((item) => item?.pmcid);
  return result?.pmcid ? `https://europepmc.org/api/getPdf?pmcid=${encodeURIComponent(result.pmcid)}` : '';
};

const extractPmid = (value) => {
  const match = String(value || '').match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/i) || String(value || '').match(/\bPMID[:\s]*(\d{6,})\b/i);
  return match ? match[1] : '';
};

const europePmcPdfCandidateByPmid = async (pmid) => {
  if (!pmid) return '';
  const apiUrl = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:${encodeURIComponent(pmid)}%20AND%20SRC:MED&format=json`;
  const { response, text } = await fetchText(apiUrl);
  if (!response.ok) return '';
  const data = JSON.parse(text);
  const result = data?.resultList?.result?.find((item) => item?.pmcid && item?.hasPDF === 'Y')
    || data?.resultList?.result?.find((item) => item?.pmcid);
  return result?.pmcid ? `https://europepmc.org/api/getPdf?pmcid=${encodeURIComponent(result.pmcid)}` : '';
};

const knownPdfCandidate = (url) => {
  if (/who\.int\/publications\/i\/item\/use-of-glycated-haemoglobin/i.test(url)) {
    return 'https://iris.who.int/server/api/core/bitstreams/db9b9d3d-f95e-4797-9d2b-c78dcef0133f/content';
  }
  return '';
};

const extractPdfCandidates = (html, baseUrl) => {
  const candidates = [];

  for (const match of html.matchAll(/<meta\b[^>]*(?:name|property)=["']citation_pdf_url["'][^>]*content=["']([^"']+)["'][^>]*>/gi)) {
    candidates.push(absolutize(match[1], baseUrl));
  }
  for (const match of html.matchAll(/<meta\b[^>]*content=["']([^"']+)["'][^>]*(?:name|property)=["']citation_pdf_url["'][^>]*>/gi)) {
    candidates.push(absolutize(match[1], baseUrl));
  }

  for (const link of extractLinks(html, baseUrl)) {
    if (/(\.pdf(?:[?#]|$)|\/pdf(?:[?#]|$)|\/content\/pdf\/|\/article-pdf\/|pdfft|iris\.who\.int\/server\/api\/core\/bitstreams)/i.test(link.href)) {
      candidates.push(link.href);
    }
  }
  for (const match of html.matchAll(/https:\/\/iris\.who\.int\/server\/api\/core\/bitstreams\/[^"'<>\\]+\/content/gi)) {
    candidates.push(match[0]);
  }

  const known = knownPdfCandidate(baseUrl);
  if (known) candidates.push(known);
  const springer = springerPdfCandidate(baseUrl);
  if (springer) candidates.push(springer);

  const elsevier = elsevierPdfCandidate(baseUrl);
  if (elsevier) candidates.push(elsevier);
  const elsevierArticle = elsevierArticlePdfCandidate(baseUrl);
  if (elsevierArticle) candidates.push(elsevierArticle);
  const scienceDirect = elsevierScienceDirectCandidate(baseUrl);
  if (scienceDirect) candidates.push(scienceDirect);

  return [...new Set(candidates.filter(Boolean))];
};

const resolvePdf = async (sourceUrl) => {
  const tried = [];

  const tryPdf = async (url) => {
    if (!url || tried.includes(url)) return null;
    tried.push(url);
    const { response, contentType, bytes } = await fetchBytes(url);
    if (response.ok && (isPdfBytes(bytes) || /application\/pdf/i.test(contentType))) {
      return { url: response.url || url, bytes };
    }
    return null;
  };

  const direct = await tryPdf(sourceUrl).catch(() => null);
  if (direct) return { ...direct, tried };

  const sourceHtml = await fetchText(sourceUrl);
  const finalUrl = sourceHtml.response.url || sourceUrl;
  const doiCandidates = [
    extractDoi(sourceUrl),
    extractDoi(finalUrl),
    ...[...sourceHtml.text.matchAll(/10\.\d{4,9}\/[^\s"'<>?#]+/gi)].map((match) => extractDoi(match[0])),
  ].filter(Boolean);
  const pmidCandidates = [
    extractPmid(sourceUrl),
    extractPmid(finalUrl),
    ...[...sourceHtml.text.matchAll(/\bPMID[:\s]*(\d{6,})\b/gi)].map((match) => match[1]),
  ].filter(Boolean);
  const europePmcCandidates = [];
  for (const doi of [...new Set(doiCandidates)]) {
    const candidate = await europePmcPdfCandidate(doi).catch(() => '');
    if (candidate) europePmcCandidates.push(candidate);
  }
  for (const pmid of [...new Set(pmidCandidates)]) {
    const candidate = await europePmcPdfCandidateByPmid(pmid).catch(() => '');
    if (candidate) europePmcCandidates.push(candidate);
  }
  const candidates = [
    ...europePmcCandidates,
    knownPdfCandidate(sourceUrl),
    knownPdfCandidate(finalUrl),
    springerPdfCandidate(sourceUrl),
    springerPdfCandidate(finalUrl),
    elsevierPdfCandidate(sourceUrl),
    elsevierPdfCandidate(finalUrl),
    elsevierArticlePdfCandidate(sourceUrl),
    elsevierArticlePdfCandidate(finalUrl),
    elsevierScienceDirectCandidate(sourceUrl),
    elsevierScienceDirectCandidate(finalUrl),
    ...extractPdfCandidates(sourceHtml.text, finalUrl),
  ].filter(Boolean);

  for (const candidate of [...new Set(candidates)]) {
    const pdf = await tryPdf(candidate).catch(() => null);
    if (pdf) return { ...pdf, tried };
  }

  return { url: '', bytes: null, tried, finalUrl };
};

const shortTitle = (text) => {
  const value = htmlDecode(text);
  const year = value.match(/\(((?:19|20)\d{2})\)/)?.[1] || 'undated';
  const patterns = [
    [/Standard Operating Procedure/i, `${year} EASD Standard Operating Procedure for Guideline Development`],
    [/metabolic dysfunction-associated steatotic liver disease|MASLD/i, /Executive Summary/i.test(value)
      ? `${year} MASLD Clinical Practice Guidelines Executive Summary`
      : `${year} MASLD Clinical Practice Guidelines`],
    [/Dyslipidemia/i, `${year} AACE Dyslipidemia Management Algorithm Consensus Statement`],
    [/islet autoantibody-positive/i, `${year} Monitoring Islet Autoantibody Positive Pre Stage 3 Type 1 Diabetes`],
    [/Hyperglycemic Crises/i, `${year} Hyperglycemic Crises in Adults With Diabetes Consensus Report`],
    [/Automated insulin delivery: benefits/i, `${year} Automated Insulin Delivery Consensus Report`],
    [/hyperglycaemia in type 2 diabetes, 2022/i, `${year} Management of Hyperglycaemia in Type 2 Diabetes Consensus Report`],
    [/management of type 1 diabetes in adults/i, `${year} Management of Type 1 Diabetes in Adults Consensus Report`],
    [/Remission in Type 2 Diabetes/i, `${year} Type 2 Diabetes Remission Consensus Report`],
    [/Precision medicine in diabetes/i, `${year} Precision Medicine in Diabetes Consensus Report`],
    [/individualising diabetes technology/i, `${year} Individualising Diabetes Technology Position Statement`],
    [/transparency, standardisation, and calibration/i, `${year} CGM Performance Evaluation Transparency Standardisation Calibration`],
    [/clinical obesity/i, `${year} Lancet Clinical Obesity Diagnostic Criteria Commission`],
    [/automated insulin delivery around physical activity/i, `${year} Automated Insulin Delivery Around Physical Activity Type 1 Diabetes`],
    [/dietary management of diabetes/i, `${year} Dietary Management of Diabetes DNSG Recommendations`],
    [/Glucose Management for Exercise/i, `${year} CGM Exercise Type 1 Diabetes Position Statement`],
    [/non-alcoholic fatty liver disease/i, `${year} NAFLD Clinical Practice Guidelines`],
    [/CVD Prevention/i, `${year} European CVD Prevention Guidelines`],
    [/diabetes, pre-diabetes, and cardiovascular diseases/i, `${year} ESC Diabetes Prediabetes Cardiovascular Disease Guidelines`],
    [/digital app technology/i, `${year} Diabetes Digital App Technology Consensus Report`],
    [/2019 update to: Management of hyperglycaemia/i, `${year} Management of Hyperglycaemia Type 2 Diabetes Consensus Update`],
    [/hyperglycaemia in type 2 diabetes: ADA and EASD Consensus Report/i, `${year} Management of Hyperglycaemia Type 2 Diabetes Consensus Report`],
    [/Insulin Pump Risks and Benefits/i, `${year} Insulin Pump Risks Benefits Safety Standards Statement`],
    [/hyperglycaemia in type 2 diabetes, 2015/i, `${year} Management of Hyperglycaemia Type 2 Diabetes Position Statement Update`],
    [/Medical Devices in Diabetes Care/i, `${year} Medical Devices in Diabetes Care Statement`],
    [/Glycated Haemoglobin|HbA1c/i, `${year} WHO HbA1c Diagnosis of Diabetes Mellitus`],
    [/severe mental illness/i, `${year} Cardiovascular Disease Diabetes Severe Mental Illness Position Statement`],
  ];
  return patterns.find(([pattern]) => pattern.test(value))?.[1] || `${year} ${sanitize(value.replace(/\s*\(((?:19|20)\d{2})\)\s*$/, ''), 120)}`;
};

const writePdf = (item, pdf) => {
  const sectionDir = item.section === 'archive' ? 'Archive' : 'Current';
  const outputDir = path.join(targetDir, sectionDir);
  fs.mkdirSync(outputDir, { recursive: true });
  const filename = `${sanitize(shortTitle(item.text), 150)}.pdf`;
  const outputPath = path.join(outputDir, filename);
  fs.writeFileSync(outputPath, Buffer.from(pdf.bytes));
  return path.relative(process.cwd(), outputPath).replace(/\\/g, '/');
};

const existingPdf = (item) => {
  const sectionDir = item.section === 'archive' ? 'Archive' : 'Current';
  const outputPath = path.join(targetDir, sectionDir, `${sanitize(shortTitle(item.text), 150)}.pdf`);
  if (!fs.existsSync(outputPath)) return null;
  const stats = fs.statSync(outputPath);
  if (!stats.isFile() || stats.size <= 0) return null;
  return {
    outputPath: path.relative(process.cwd(), outputPath).replace(/\\/g, '/'),
    bytes: stats.size,
  };
};

const main = async () => {
  fs.mkdirSync(targetDir, { recursive: true });
  fs.mkdirSync(reviewDir, { recursive: true });

  console.log(`[EASD] Fetching source page: ${SOURCE_URL}`);
  const page = await fetchText(SOURCE_URL);
  if (!page.response.ok) {
    throw new Error(`Failed to fetch EASD page: ${page.response.status}`);
  }

  const links = extractEasdPublicationLinks(page.text);
  console.log(`[EASD] Found ${links.length} publication links.`);

  const results = [];
  for (const [index, item] of links.entries()) {
    console.log(`\n[EASD] [${index + 1}/${links.length}] ${item.text}`);
    console.log(`       ${item.href}`);
    try {
      const existing = existingPdf(item);
      if (existing) {
        console.log(`       Already exists ${existing.outputPath} (${existing.bytes.toLocaleString()} bytes)`);
        results.push({ ...item, status: 'downloaded-existing', outputPath: existing.outputPath, bytes: existing.bytes });
        await sleep(100);
        continue;
      }
      const pdf = await resolvePdf(item.href);
      if (!pdf.bytes) {
        console.log(`       PDF not resolved after ${pdf.tried.length} attempt(s).`);
        results.push({ ...item, status: 'not-resolved', finalUrl: pdf.finalUrl || '', tried: pdf.tried });
        await sleep(400);
        continue;
      }
      const outputPath = writePdf(item, pdf);
      console.log(`       Saved ${outputPath} (${pdf.bytes.length.toLocaleString()} bytes)`);
      results.push({ ...item, status: 'downloaded', pdfUrl: pdf.url, outputPath, bytes: pdf.bytes.length, tried: pdf.tried });
    } catch (error) {
      console.log(`       Failed: ${error instanceof Error ? error.message : String(error)}`);
      results.push({ ...item, status: 'failed', error: error instanceof Error ? error.message : String(error) });
    }
    await sleep(600);
  }

  const summary = {
    sourceUrl: SOURCE_URL,
    downloadedAt: new Date().toISOString(),
    total: results.length,
    downloaded: results.filter((item) => item.status === 'downloaded' || item.status === 'downloaded-existing').length,
    unresolved: results.filter((item) => item.status !== 'downloaded' && item.status !== 'downloaded-existing').length,
    results,
  };
  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2), 'utf8');
  console.log(`\n[EASD] Downloaded ${summary.downloaded}/${summary.total}.`);
  console.log(`[EASD] Report: ${path.relative(process.cwd(), reportPath).replace(/\\/g, '/')}`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
