import fs from 'node:fs/promises';
import path from 'node:path';

const workspace = process.cwd();
const outputRoot = path.resolve('guidelines-sources');
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36';

const configs = [
  {
    school: 'AAOS',
    specialty: 'Orthopedics and Sports Medicine',
    seeds: ['https://www.aaos.org/quality/quality-programs/clinical-practice-guidelines/'],
    internalHostPattern: /(^|\.)aaos\.org$/i,
    internalPattern: /clinical-practice-guideline|quality-programs|quality-and-practice-resources|guideline/i,
    maxInternalPages: 80,
    maxPdfs: 80,
  },
  {
    school: 'ACR',
    specialty: 'Rheumatology and Immunology',
    seeds: ['https://rheumatology.org/clinical-practice-guidelines'],
    internalHostPattern: /(^|\.)rheumatology\.org$/i,
    internalPattern: /guideline|spondyloarthritis|osteoporosis|gout|arthritis|lupus|vasculitis|myositis|sjogren|vaccination|reproductive/i,
    maxInternalPages: 80,
    maxPdfs: 80,
  },
  {
    school: 'EULAR',
    specialty: 'Rheumatology and Immunology',
    seeds: ['https://www.eular.org/recommendations-home'],
    internalHostPattern: /(^|\.)eular\.org$/i,
    internalPattern: /recommendation|criteria|classification|diagnostic|eular-acr/i,
    maxInternalPages: 70,
    maxPdfs: 80,
  },
  {
    school: 'AUA',
    specialty: 'Urology, Andrology, and Infertility',
    seeds: ['https://www.auanet.org/guidelines-and-quality/guidelines'],
    internalHostPattern: /(^|\.)auanet\.org$/i,
    internalPattern: /guideline|quality\/guidelines|urologic|prostate|bladder|kidney|stone|bph|incontinence|infertility|erectile/i,
    maxInternalPages: 90,
    maxPdfs: 90,
  },
  {
    school: 'EAU',
    specialty: 'Urology, Andrology, and Infertility',
    seeds: ['https://uroweb.org/guidelines'],
    internalHostPattern: /(^|\.)uroweb\.org$/i,
    internalPattern: /guidelines/i,
    maxInternalPages: 90,
    maxPdfs: 90,
  },
  {
    school: 'ASRM',
    specialty: 'Andrology and Infertility',
    seeds: ['https://www.asrm.org/practice-guidance/practice-committee-documents/'],
    internalHostPattern: /(^|\.)asrm\.org$/i,
    internalPattern: /practice-guidance|committee|infertility|fertility|andrology/i,
    maxInternalPages: 80,
    maxPdfs: 80,
  },
  {
    school: 'AAN',
    specialty: 'Neurology',
    seeds: ['https://www.aan.com/Guidelines/home', 'https://www.aan.com/practice/guidelines'],
    internalHostPattern: /(^|\.)aan\.com$/i,
    internalPattern: /guideline|practice/i,
    maxInternalPages: 80,
    maxPdfs: 80,
  },
  {
    school: 'APA',
    specialty: 'Psychiatry and Addiction',
    seeds: ['https://www.psychiatry.org/psychiatrists/practice/clinical-practice-guidelines'],
    internalHostPattern: /(^|\.)psychiatry\.org$|(^|\.)psychiatryonline\.org$/i,
    internalPattern: /clinical-practice-guidelines|guidelines|practice/i,
    maxInternalPages: 50,
    maxPdfs: 60,
  },
  {
    school: 'AAO',
    specialty: 'Ophthalmology',
    seeds: ['https://www.aao.org/preferred-practice-patterns', 'https://www.aao.org/guidelines-browse'],
    internalHostPattern: /(^|\.)aao\.org$/i,
    internalPattern: /preferred-practice-pattern|guideline|clinical-statement|ophthalmology/i,
    maxInternalPages: 80,
    maxPdfs: 80,
  },
  {
    school: 'AAO_HNS',
    specialty: 'ENT',
    seeds: ['https://www.entnet.org/quality-practice/quality-products/clinical-practice-guidelines/'],
    internalHostPattern: /(^|\.)entnet\.org$/i,
    internalPattern: /clinical-practice-guidelines|guideline|quality-products/i,
    maxInternalPages: 80,
    maxPdfs: 80,
  },
  {
    school: 'Audiology',
    specialty: 'Audiology and Balance',
    seeds: ['https://www.audiology.org/practice-guideline/', 'https://www.audiology.org/practice-resources/practice-guidelines-and-standards/'],
    internalHostPattern: /(^|\.)audiology\.org$/i,
    internalPattern: /practice-guideline|guidelines-and-standards|guideline|standard/i,
    maxInternalPages: 60,
    maxPdfs: 60,
  },
  {
    school: 'ASHA',
    specialty: 'Speech Therapy and Behavioral Modification',
    seeds: ['https://www.asha.org/practice/', 'https://www.asha.org/practice-portal/'],
    internalHostPattern: /(^|\.)asha\.org$/i,
    internalPattern: /practice-portal|practice|guideline|evidence/i,
    maxInternalPages: 60,
    maxPdfs: 60,
  },
  {
    school: 'ASH',
    specialty: 'Hematology',
    seeds: ['https://www.hematology.org/education/clinicians/guidelines-and-quality-care/clinical-practice-guidelines'],
    internalHostPattern: /(^|\.)hematology\.org$/i,
    internalPattern: /clinical-practice-guidelines|guidelines/i,
    maxInternalPages: 70,
    maxPdfs: 80,
  },
  {
    school: 'ASCO',
    specialty: 'Medical Oncology',
    seeds: ['https://ascopubs.org/guidelines'],
    internalHostPattern: /(^|\.)ascopubs\.org$|(^|\.)asco\.org$/i,
    internalPattern: /guidelines|guideline/i,
    maxInternalPages: 50,
    maxPdfs: 80,
  },
  {
    school: 'ASA',
    specialty: 'Pain Medicine and Anesthesia',
    seeds: ['https://www.asahq.org/standards-and-practice-parameters'],
    internalHostPattern: /(^|\.)asahq\.org$/i,
    internalPattern: /standards-and-practice-parameters|practice-guideline|practice-advisory|parameter/i,
    maxInternalPages: 100,
    maxPdfs: 100,
  },
  {
    school: 'ESPEN',
    specialty: 'Geriatrics, Nutrition, and Obesity',
    seeds: ['https://www.espen.org/guidelines-home/espen-guidelines'],
    internalHostPattern: /(^|\.)espen\.org$/i,
    internalPattern: /guidelines|scientific-guidelines|practical-guidelines|position-papers/i,
    maxInternalPages: 30,
    maxPdfs: 130,
  },
  {
    school: 'AAPMR',
    specialty: 'Physical Medicine and Rehabilitation',
    seeds: ['https://www.aapmr.org/quality-practice/clinical-practice-guidelines/aapm-r-endorsed-guidelines'],
    internalHostPattern: /(^|\.)aapmr\.org$|(^|\.)aaos\.org$|(^|\.)spine\.org$/i,
    internalPattern: /clinical-practice-guidelines|endorsed-guidelines|guideline|spine|osteoarthritis|fracture|rehab/i,
    maxInternalPages: 60,
    maxPdfs: 80,
  },
  {
    school: 'ADA_Dental',
    specialty: 'Dentistry',
    seeds: ['https://www.ada.org/resources/research/science/evidence-based-dental-research'],
    internalHostPattern: /(^|\.)ada\.org$/i,
    internalPattern: /evidence-based|clinical-practice-guideline|guideline|oral|caries|cancer|endocarditis|sedation/i,
    maxInternalPages: 60,
    maxPdfs: 80,
  },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sanitize = (value, max = 140) =>
  String(value || 'guideline')
    .replace(/&amp;/g, '&')
    .replace(/[<>:"/\\|?*\u0000-\u001f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
    .replace(/[. ]+$/g, '') || 'guideline';

const slug = (value, max = 90) =>
  sanitize(value, max)
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'guideline';

const reportSuffix = process.env.PRIORITY_REPORT_SUFFIX ? `-${slug(process.env.PRIORITY_REPORT_SUFFIX, 80)}` : '';
const reportPath = path.resolve(`guidelines-sources/_review/priority-11-22-download-report${reportSuffix}.json`);

const htmlDecode = (value) =>
  String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ');

const fetchText = async (url) => {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(30000),
    headers: {
      'user-agent': userAgent,
      accept: 'text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8',
    },
  });
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();
  return { response, contentType, text };
};

const fetchBytes = async (url) => {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(45000),
    headers: {
      'user-agent': userAgent,
      accept: 'application/pdf,text/html;q=0.9,*/*;q=0.8',
    },
  });
  const contentType = response.headers.get('content-type') || '';
  const bytes = new Uint8Array(await response.arrayBuffer());
  return { response, contentType, bytes };
};

const isPdfBytes = (bytes) =>
  bytes.length >= 5 && Buffer.from(bytes.slice(0, 5)).toString('ascii') === '%PDF-';

const extractTitle = (html) =>
  htmlDecode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '')
    .replace(/\s+/g, ' ')
    .trim();

const extractLinks = (html, baseUrl) =>
  [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map((match) => {
      let href = htmlDecode(match[1]);
      try {
        href = new URL(href, baseUrl).href;
      } catch {
        return null;
      }
      const text = htmlDecode(match[2].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
      return /^https?:/i.test(href) ? { href, text } : null;
    })
    .filter(Boolean);

const isLikelyPdfLink = (link) =>
  /\.pdf(?:[?#]|$)/i.test(link.href)
  || (
    process.env.PRIORITY_ALLOW_TEXT_DOWNLOADS === '1'
    && /\b(pdf|download file|download guideline|practice guideline|quick reference guide)\b/i.test(link.text)
  );

const shouldSkipPdf = (link) =>
  /comment|brochure|membership|press|media|reporting-guide|quality-measure|dues|registration|publiccomments/i.test(`${link.text} ${link.href}`)
  && !/guideline|practice|standard|parameter|criteria|recommendation|pathway|statement/i.test(`${link.text} ${link.href}`);

const uniqueByHref = (items) => Array.from(new Map(items.map((item) => [item.href, item])).values());

const collectCandidatesForConfig = async (config) => {
  const pages = new Map();
  const pdfLinks = new Map();
  const failures = [];

  const addPage = (href, sourceText = '') => {
    if (pages.size >= config.maxInternalPages + config.seeds.length) return;
    if (!/^https?:/i.test(href)) return;
    let parsed;
    try {
      parsed = new URL(href);
    } catch {
      return;
    }
    if (!config.internalHostPattern.test(parsed.hostname)) return;
    if (pages.has(href)) return;
    if (config.seeds.includes(href) || config.internalPattern.test(`${href} ${sourceText}`)) {
      pages.set(href, { href, sourceText });
    }
  };

  config.seeds.forEach((seed) => addPage(seed, 'seed'));

  for (let index = 0; index < Array.from(pages.keys()).length; index += 1) {
    const pageUrl = Array.from(pages.keys())[index];
    try {
      const { response, contentType, text } = await fetchText(pageUrl);
      if (!response.ok) {
        failures.push({ stage: 'page', url: pageUrl, error: `HTTP ${response.status}` });
        continue;
      }
      if (/application\/pdf/i.test(contentType)) {
        pdfLinks.set(pageUrl, { href: pageUrl, text: pages.get(pageUrl)?.sourceText || pageUrl, pageUrl, pageTitle: path.basename(pageUrl) });
        continue;
      }
      const pageTitle = extractTitle(text) || pages.get(pageUrl)?.sourceText || config.specialty;
      const links = extractLinks(text, pageUrl);
      for (const link of links) {
        if (isLikelyPdfLink(link) && !shouldSkipPdf(link)) {
          pdfLinks.set(link.href, { ...link, pageUrl, pageTitle });
        } else if (pages.size < config.maxInternalPages + config.seeds.length) {
          addPage(link.href, link.text);
        }
      }
      await sleep(120);
    } catch (error) {
      failures.push({ stage: 'page', url: pageUrl, error: error instanceof Error ? error.message : String(error) });
    }
  }

  return {
    pages: Array.from(pages.values()),
    pdfLinks: uniqueByHref(Array.from(pdfLinks.values())).slice(0, config.maxPdfs),
    failures,
  };
};

const saveCandidate = async (config, candidate) => {
  const { response, contentType, bytes } = await fetchBytes(candidate.href);
  if (!response.ok || !isPdfBytes(bytes)) {
    throw new Error(`HTTP ${response.status}; content-type=${contentType}; pdf=${isPdfBytes(bytes)}`);
  }
  const topic = slug(candidate.pageTitle || config.specialty);
  const folder = path.join(outputRoot, config.school, topic);
  await fs.mkdir(folder, { recursive: true });
  const urlName = path.basename(new URL(response.url || candidate.href).pathname).replace(/\.pdf$/i, '');
  const textName = candidate.text && !/^download|pdf|view|click|file$/i.test(candidate.text) ? candidate.text : urlName;
  const fileName = `${sanitize(textName || urlName || 'guideline', 120)}.pdf`;
  const target = path.join(folder, fileName);
  await fs.writeFile(target, bytes);
  return {
    status: 'downloaded',
    school: config.school,
    specialty: config.specialty,
    title: candidate.text,
    pageTitle: candidate.pageTitle,
    sourcePage: candidate.pageUrl,
    url: candidate.href,
    finalUrl: response.url,
    localPath: path.relative(workspace, target).replace(/\\/g, '/'),
    bytes: bytes.length,
  };
};

const requestedSchools = (process.env.PRIORITY_SCHOOLS || '')
  .split(',')
  .map((school) => school.trim())
  .filter(Boolean);

const selectedConfigs = requestedSchools.length
  ? configs.filter((config) => requestedSchools.includes(config.school))
  : configs;

const run = async () => {
  const report = {
    generatedAt: new Date().toISOString(),
    sources: [],
    downloaded: [],
    failed: [],
  };

  await fs.mkdir(path.dirname(reportPath), { recursive: true });

  for (const config of selectedConfigs) {
    console.log(`[priority-11-22] collecting ${config.school}`);
    const collected = await collectCandidatesForConfig(config);
    const sourceRecord = {
      school: config.school,
      specialty: config.specialty,
      seeds: config.seeds,
      pagesScanned: collected.pages.length,
      candidatePdfs: collected.pdfLinks.length,
      pageFailures: collected.failures,
    };
    report.sources.push(sourceRecord);
    console.log(`[priority-11-22] ${config.school}: pages=${sourceRecord.pagesScanned}, pdfs=${sourceRecord.candidatePdfs}`);

    for (const candidate of collected.pdfLinks) {
      try {
        const saved = await saveCandidate(config, candidate);
        report.downloaded.push(saved);
        console.log(`[priority-11-22] downloaded ${config.school}: ${saved.localPath}`);
      } catch (error) {
        report.failed.push({
          school: config.school,
          specialty: config.specialty,
          title: candidate.text,
          sourcePage: candidate.pageUrl,
          url: candidate.href,
          error: error instanceof Error ? error.message : String(error),
        });
        console.warn(`[priority-11-22] failed ${config.school}: ${candidate.href}`);
      }
      await sleep(150);
    }

    for (const failure of collected.failures) {
      report.failed.push({
        school: config.school,
        specialty: config.specialty,
        url: failure.url,
        error: failure.error,
        stage: failure.stage,
      });
    }

    await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }

  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`[priority-11-22] done downloaded=${report.downloaded.length} failed=${report.failed.length}`);
  console.log(path.relative(workspace, reportPath).replace(/\\/g, '/'));
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
