import admin from 'firebase-admin';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const workspace = process.cwd();
const dryRun = process.argv.includes('--dry-run');
const onlyFilters = process.argv
  .filter((arg) => arg.startsWith('--only='))
  .flatMap((arg) => arg.slice('--only='.length).split(','))
  .map((value) => value.trim().replace(/\\/g, '/').toLowerCase())
  .filter(Boolean);

const matchesOnlyFilter = (relativePath, filter) => {
  const relative = relativePath.replace(/\\/g, '/').toLowerCase();
  const normalizedFilter = filter.replace(/\\/g, '/').toLowerCase();
  const relativeVariants = new Set([
    relative,
    relative.replace(/\.json$/i, '.pdf'),
    relative.replace(/\.pdf$/i, '.json'),
    relative.replace(/\.(json|pdf)$/i, ''),
  ]);
  const filterVariants = new Set([
    normalizedFilter,
    normalizedFilter.replace(/\.json$/i, '.pdf'),
    normalizedFilter.replace(/\.pdf$/i, '.json'),
    normalizedFilter.replace(/\.(json|pdf)$/i, ''),
  ]);
  for (const relativeVariant of relativeVariants) {
    for (const filterVariant of filterVariants) {
      if (relativeVariant === filterVariant || relativeVariant.startsWith(`${filterVariant}/`)) return true;
      if (filterVariant.includes('/') && relativeVariant.includes(filterVariant)) return true;
    }
  }
  if (relative === normalizedFilter || relative.startsWith(`${normalizedFilter}/`)) return true;
  if (normalizedFilter.includes('/')) return relative.includes(normalizedFilter);
  return relative.split('/').includes(normalizedFilter);
};
const positionalArgs = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const sourceRoot = path.resolve(positionalArgs[0] ?? 'guidelines-sources/_structured/full-text');

const ensureInsideWorkspace = (target, label) => {
  const relative = path.relative(workspace, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label} must stay inside the workspace: ${target}`);
  }
};

ensureInsideWorkspace(sourceRoot, 'Source root');

if (!admin.apps.length) {
  const serviceAccountPath = path.resolve('service-account.json');
  if (fs.existsSync(serviceAccountPath)) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))),
    });
  } else {
    admin.initializeApp({ projectId: 'gen-lang-client-0444130146' });
  }
}

const db = admin.firestore();

const readJson = (target) => JSON.parse(fs.readFileSync(target, 'utf8'));

const walkJsonFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkJsonFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.json')) {
      files.push(fullPath);
    }
  }
  return files.sort((a, b) => a.localeCompare(b));
};

const slugify = (value, max = 160) =>
  String(value || '')
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max)
    .toLowerCase() || 'guideline';

const hashShort = (value) => crypto.createHash('sha1').update(String(value)).digest('hex').slice(0, 12);

const makeBookId = (sourcePath) => `${slugify(sourcePath, 120)}-${hashShort(sourcePath)}`;

const inferSchool = (sourcePath) => sourcePath.split('/')[0] || 'Guidelines';

const inferYear = (sourcePath, school) => {
  const parts = sourcePath.split('/');
  if (school === 'ADA') {
    const year = Number(parts[1]);
    if (Number.isFinite(year)) return year;
  }
  const match = sourcePath.match(/\b(20\d{2})\b/);
  return match ? Number(match[1]) : new Date().getFullYear();
};

const inferCollectionId = (sourcePath, school, year) => {
  if (school === 'ADA') return `ada-${year}`;
  if (school === 'GINA') return 'gina-2026';
  if (school === 'KDIGO') return 'kdigo-2026';
  if (school === 'EASD') return 'easd-2026';
  if (school === 'EASL') return 'easl-2026';
  if (school === 'GOLD') return 'gold-2026';
  if (school === 'ESC') return 'esc-2025';
  if (school === 'ACP') return 'acp-2026';
  if (school === 'Endocrine') return 'endocrine-2026';
  if (school === 'ACG') return 'acg-2026';
  if (school === 'AGA') return 'aga-2026';
  if (school === 'AAP') return 'aap-2026';
  if (school === 'AAD') return 'aad-2023';
  if (school === 'AAOS') return 'aaos-2026';
  if (school === 'AAPMR') return 'aapmr-2026';
  if (school === 'ACR') return 'acr-2026';
  if (school === 'ADA_Dental') return 'ada-dental-2026';
  if (school === 'ASA') return 'asa-2026';
  if (school === 'ASH') return 'ash-2026';
  if (school === 'ASHA') return 'asha-2026';
  if (school === 'AUA') return 'aua-2026';
  if (school === 'Audiology') return 'audiology-2026';
  if (school === 'EAU') return 'eau-2026';
  if (school === 'ESPEN') return 'espen-2026';
  if (school === 'CDC_ACIP') return 'cdc-acip-2026';
  return `${school.toLowerCase()}-${year}`;
};

const titleFromFile = (sourcePath) => {
  const baseName = path.basename(sourcePath, path.extname(sourcePath)).replace(/\s+/g, ' ').trim();
  const pathYear = sourcePath.match(/\/(20\d{2})\//)?.[1];
  const withoutHash = baseName.replace(/\s+-\s+[a-f0-9]{10}$/i, '').trim();
  if (pathYear) {
    return withoutHash
      .replace(new RegExp(`^${pathYear}\\s+-\\s+${pathYear}\\s+`), '')
      .replace(new RegExp(`^${pathYear}\\s+-\\s+`), '')
      .trim();
  }
  return withoutHash;
};

const folderFromPath = (sourcePath) => {
  const parts = sourcePath.split('/');
  const fileless = parts.slice(0, -1);
  if (parts[0] === 'ADA') return fileless.slice(0, 2).join(' / ');
  if (parts[0] === 'Endocrine') return ['Endocrine Society Guidelines', ...fileless.slice(1)].join(' / ');
  if (parts[0] === 'ACG') return ['ACG Guidelines', ...fileless.slice(1)].join(' / ');
  if (parts[0] === 'AGA') return ['AGA Clinical Guidance', ...fileless.slice(1)].join(' / ');
  if (parts[0] === 'AAP') return ['AAP Clinical Practice Guidelines', ...fileless.slice(1)].join(' / ');
  if (parts[0] === 'CDC_ACIP') return ['CDC ACIP Vaccine Recommendations', ...fileless.slice(1)].join(' / ');
  return fileless.join(' / ');
};

const normalizeSearchText = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[Ù -Ù©]/g, (digit) => String('Ù Ù¡Ù¢Ù£Ù¤Ù¥Ù¦Ù§Ù¨Ù©'.indexOf(digit)))
    .replace(/[Û°-Û¹]/g, (digit) => String('Û°Û±Û²Û³Û´ÛµÛ¶Û·Û¸Û¹'.indexOf(digit)))
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[\u0623\u0625\u0622\u0671]/g, '\u0627')
    .replace(/\u0649/g, '\u064a')
    .replace(/\u0629/g, '\u0647')
    .replace(/\u0624/g, '\u0648')
    .replace(/\u0626/g, '\u064a')
    .replace(/\bhaem/g, 'hem')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

const stopWords = new Set([
  'a', 'an', 'and', 'are', 'be', 'by', 'can', 'do', 'does', 'for', 'from', 'how', 'i', 'in',
  'is', 'it', 'me', 'of', 'on', 'or', 'should', 'the', 'to', 'use', 'what', 'when', 'with',
  'this', 'that', 'these', 'those', 'guideline', 'guidelines', 'chapter', 'section', 'table',
  'patient', 'patients', 'doctor', 'Ø¹Ù†Ø¯Ù‡', 'Ø¹Ù†Ø¯Ù‡Ø§', 'Ø³Ù†', 'Ø³Ù†Ø©', 'Ø³Ù†Ù‡', 'Ø³Ù†ÙŠÙ†', 'Ø³Ù†ÙˆØ§Øª', 'Ø¹Ø§Ù…', 'Ø§Ø¹ÙˆØ§Ù…',
]);

const clinicalAliasGroups = [
  ['aki', 'acute kidney injury', 'acute renal failure', 'kidney injury', 'renal injury', 'Ø§ØµØ§Ø¨Ø© ÙƒÙ„ÙˆÙŠØ© Ø­Ø§Ø¯Ø©', 'ÙØ´Ù„ ÙƒÙ„ÙˆÙŠ Ø­Ø§Ø¯'],
  ['akd', 'acute kidney disease'],
  ['ckd', 'chronic kidney disease', 'chronic renal disease', 'kidney disease', 'renal disease', 'renal', 'kidney', 'Ù‚ØµÙˆØ± ÙƒÙ„ÙˆÙŠ Ù…Ø²Ù…Ù†', 'Ù…Ø±Ø¶ ÙƒÙ„ÙˆÙŠ Ù…Ø²Ù…Ù†'],
  ['rrt', 'krt', 'renal replacement therapy', 'kidney replacement therapy', 'dialysis', 'hemodialysis', 'haemodialysis', 'peritoneal dialysis', 'ØºØ³ÙŠÙ„ ÙƒÙ„ÙˆÙŠ'],
  ['esa', 'erythropoiesis stimulating agent', 'epoetin', 'darbepoetin', 'erythropoietin'],
  ['hb', 'hgb', 'hemoglobin', 'haemoglobin', 'Ù‡ÙŠÙ…ÙˆØ¬Ù„ÙˆØ¨ÙŠÙ†'],
  ['iron', 'ferritin', 'tsat', 'transferrin saturation', 'Ø­Ø¯ÙŠØ¯', 'ÙÙŠØ±ÙŠØªÙŠÙ†'],
  ['egfr', 'gfr', 'estimated glomerular filtration rate', 'glomerular filtration rate'],
  ['scr', 'serum creatinine', 'creatinine', 'ÙƒØ±ÙŠØ§ØªÙŠÙ†ÙŠÙ†'],
  ['urine output', 'oliguria', 'anuria', 'diuresis'],
  ['hyperkalemia', 'hyperkalaemia', 'potassium', 'Ø¨ÙˆØªØ§Ø³ÙŠÙˆÙ…'],
  ['acidosis', 'metabolic acidosis'],
  ['fluid overload', 'volume overload', 'pulmonary edema', 'oedema', 'edema'],
  ['uremia', 'uraemia', 'uremic'],
  ['diabetes', 'dm', 't2d', 't2dm', 'type 2 diabetes', 'Ø³ÙƒØ±ÙŠ'],
  ['dka', 'diabetic ketoacidosis', 'ketoacidosis', 'ketosis', 'ketone', 'ketones', 'ketonaemia', 'ketonemia', 'Ø­Ù…Ø§Ø¶ ÙƒÙŠØªÙˆÙ†ÙŠ', 'Ø§Ù„ÙƒÙŠØªÙˆÙ†ÙŠ', 'ÙƒÙŠØªÙˆÙ†', 'ÙƒÙŠØªÙˆÙ†Ø§Øª'],
  ['hhs', 'hyperosmolar hyperglycemic state', 'hyperosmolar hyperglycaemic state', 'hyperosmolar', 'ÙØ±Ø· Ø§Ø³Ù…ÙˆÙ„ÙŠØ©'],
  ['a1c', 'hba1c', 'glycated hemoglobin', 'glycaemic', 'glycemic', 'Ø³ÙƒØ± ØªØ±Ø§ÙƒÙ…ÙŠ'],
  ['bp', 'blood pressure', 'hypertension', 'Ø¶ØºØ· Ø§Ù„Ø¯Ù…'],
  ['sglt2', 'sglt2 inhibitor', 'sodium glucose cotransporter 2'],
  ['glp1', 'glp 1', 'glp-1 receptor agonist'],
  ['ascvd', 'atherosclerotic cardiovascular disease', 'cardiovascular disease', 'cvd'],
  ['asthma', 'bronchial asthma', 'Ø±Ø¨Ùˆ', 'Ø­Ø³Ø§Ø³ÙŠØ© ØµØ¯Ø±'],
  ['ics', 'inhaled corticosteroid'],
  ['saba', 'short acting beta agonist', 'salbutamol', 'albuterol'],
  ['laba', 'long acting beta agonist', 'formoterol', 'salmeterol'],
  ['mart', 'maintenance and reliever therapy', 'smart', 'anti inflammatory reliever'],
  ['copd', 'chronic obstructive pulmonary disease'],
  ['pregnancy', 'pregnant', 'gestational', 'Ø­Ù…Ù„', 'Ø­Ø§Ù…Ù„'],
  ['children', 'child', 'pediatric', 'paediatric', 'adolescent', 'Ø§Ø·ÙØ§Ù„', 'Ø·ÙÙ„'],
  ['icu', 'intensive care', 'critical care', 'critically ill', 'Ø§Ù„Ø¹Ù†Ø§ÙŠØ©', 'Ø§Ù„Ø¹Ù†Ø§ÙŠØ© Ø§Ù„Ù…Ø±ÙƒØ²Ø©', 'Ø¹Ù†Ø§ÙŠØ© Ù…Ø±ÙƒØ²Ø©', 'Ø±Ø¹Ø§ÙŠØ© Ù…Ø±ÙƒØ²Ø©'],
];

const intentLexicon = {
  diagnosis: ['diagnosis', 'diagnose', 'diagnostic', 'criteria', 'confirm', 'classification', 'ØªØ´Ø®ÙŠØµ', 'Ù…Ø¹Ø§ÙŠÙŠØ±'],
  treatment: ['treatment', 'treat', 'therapy', 'management', 'manage', 'handle', 'start', 'initiate', 'give', 'use', 'stop', 'switch', 'Ø¹Ù„Ø§Ø¬', 'Ø§Ø¨Ø¯Ø£', 'Ø§Ø³ØªØ®Ø¯Ù…', 'ØªØ¹Ø§Ù…Ù„', 'Ø§ØªØ¹Ø§Ù…Ù„', 'Ø§Ø¯Ø§Ø±Ø©', 'Ø¥Ø¯Ø§Ø±Ø©', 'ØªØ¯Ø¨ÙŠØ±', 'Ø§Ø²Ø§ÙŠ', 'ÙƒÙŠÙ'],
  threshold: ['when', 'indication', 'threshold', 'target', 'level', 'cutoff', 'goal', 'Ù…ØªÙ‰', 'Ø§Ù…ØªÙ‰', 'Ù‡Ø¯Ù', 'Ù†Ø³Ø¨Ø©'],
  dose: ['dose', 'dosage', 'mg', 'units', 'Ø¬Ø±Ø¹Ø©'],
  monitoring: ['monitor', 'follow', 'repeat', 'frequency', 'reassess', 'Ù…ØªØ§Ø¨Ø¹Ø©', 'Ø±Ø§Ù‚Ø¨'],
  contraindication: ['avoid', 'contraindication', 'caution', 'harm', 'ØªØ¬Ù†Ø¨', 'Ù…Ù…Ù†ÙˆØ¹'],
  comparison: ['compare', 'versus', 'vs', 'difference', 'better', 'Ù…Ù‚Ø§Ø±Ù†Ø©', 'ÙØ±Ù‚'],
  explanation: ['explain', 'why', 'mechanism', 'meaning', 'Ø´Ø±Ø­', 'Ø§Ø´Ø±Ø­', 'ÙŠØ¹Ù†ÙŠ'],
};

const populationLexicon = {
  adult: ['adult', 'adults', 'Ø¨Ø§Ù„Øº'],
  child: ['child', 'children', 'pediatric', 'paediatric', 'adolescent', 'Ø§Ø·ÙØ§Ù„', 'Ø·ÙÙ„'],
  pregnancy: ['pregnancy', 'pregnant', 'gestational', 'Ø­Ù…Ù„', 'Ø­Ø§Ù…Ù„'],
  dialysis: ['dialysis', 'hemodialysis', 'haemodialysis', 'peritoneal dialysis', 'ØºØ³ÙŠÙ„'],
  nondialysis: ['not on dialysis', 'non dialysis', 'nondialysis', 'nd ckd', 'Ø¨Ø¯ÙˆÙ† ØºØ³ÙŠÙ„'],
  elderly: ['older adult', 'elderly', 'geriatric', 'ÙƒØ¨Ø§Ø± Ø§Ù„Ø³Ù†'],
  criticalCare: ['icu', 'intensive care', 'critical care', 'critically ill', 'Ø§Ù„Ø¹Ù†Ø§ÙŠØ©', 'Ø§Ù„Ø¹Ù†Ø§ÙŠØ© Ø§Ù„Ù…Ø±ÙƒØ²Ø©', 'Ø¹Ù†Ø§ÙŠØ© Ù…Ø±ÙƒØ²Ø©'],
};

clinicalAliasGroups.push(
  ['hypoglycemia', 'hypoglycaemia', 'low blood glucose', 'low glucose', 'low sugar', '\u0646\u0642\u0635 \u0633\u0643\u0631', '\u0647\u0628\u0648\u0637 \u0633\u0643\u0631'],
  ['hyperglycemia', 'hyperglycaemia', 'high blood glucose', 'high glucose', 'high sugar', '\u0627\u0631\u062a\u0641\u0627\u0639 \u0633\u0643\u0631'],
  ['heart failure', 'hf', 'hfrEF', 'hfpef', 'decompensated heart failure'],
  ['atrial fibrillation', 'af', 'afib'],
  ['acute coronary syndrome', 'acs', 'myocardial infarction', 'mi', 'nstemi', 'stemi'],
  ['stroke', 'tia', 'cerebrovascular accident', 'cva'],
  ['pneumonia', 'community acquired pneumonia', 'cap'],
  ['sepsis', 'septic shock'],
  ['cirrhosis', 'liver cirrhosis', 'decompensated liver disease'],
  ['variceal bleeding', 'variceal bleed', 'varices', 'portal hypertension'],
  ['gerd', 'gastroesophageal reflux disease', 'reflux'],
  ['ibd', 'inflammatory bowel disease', 'ulcerative colitis', 'crohn'],
  ['thyroid', 'hypothyroidism', 'hyperthyroidism', 'tsh'],
  ['obesity', 'overweight', 'weight management'],
);

const splitTerms = (value) =>
  normalizeSearchText(value)
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2 && !stopWords.has(term));

const extractKeywords = (...parts) => {
  const normalized = normalizeSearchText(parts.filter(Boolean).join(' '));
  const terms = new Set(splitTerms(normalized));
  for (const aliases of clinicalAliasGroups) {
    const normalizedAliases = aliases.map(normalizeSearchText);
    if (normalizedAliases.some((alias) => alias && (normalized.includes(alias) || (!alias.includes(' ') && terms.has(alias))))) {
      normalizedAliases.forEach((alias) => splitTerms(alias).forEach((term) => terms.add(term)));
    }
  }
  return Array.from(terms).slice(0, 350);
};

const detectTags = (normalized, dictionary) => {
  const tags = [];
  for (const [tag, words] of Object.entries(dictionary)) {
    if (words.some((word) => normalized.includes(normalizeSearchText(word)))) tags.push(tag);
  }
  return tags;
};

const extractConcepts = (...parts) => {
  const normalized = normalizeSearchText(parts.filter(Boolean).join(' '));
  const concepts = new Set();
  for (const aliases of clinicalAliasGroups) {
    const normalizedAliases = aliases.map(normalizeSearchText);
    const terms = new Set(splitTerms(normalized));
    if (normalizedAliases.some((alias) => alias && (normalized.includes(alias) || (!alias.includes(' ') && terms.has(alias))))) {
      splitTerms(normalizedAliases[0]).forEach((term) => concepts.add(term));
    }
  }
  detectTags(normalized, populationLexicon).forEach((tag) => concepts.add(tag));
  return Array.from(concepts).slice(0, 80);
};

const detectHeading = (text) => {
  const lines = String(text || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .slice(0, 12);
  const heading = lines.find((line) =>
    line.length >= 8
    && line.length <= 140
    && !/[.;:]$/.test(line)
    && (/^(chapter|section|recommendation|practice point|table|figure)\b/i.test(line) || /^[A-Z0-9][A-Za-z0-9 ,()/-]{7,}$/.test(line))
  );
  return heading || '';
};

const watermarkTokens = new Set(['TE', 'U', 'IB', 'TR', 'IS', 'D', 'R', 'O', 'PY', 'C', 'T', 'N', '-D', 'L', 'IA', 'ER', 'AT', 'M', 'H', 'IG']);

const cleanChunkText = (text) =>
  String(text || '')
    .replace(/([A-Za-z])\u00ad\s*\n\s*([a-z])/g, '$1$2')
    .replace(/([A-Za-z])-\s*\n\s*([a-z])/g, '$1$2')
    .replace(/\u00ad/g, '')
    .replace(/\bDownloaded\s+from\s+https?:\/\/\S+(?:\s+\S+){0,8}?\s+by\s+guest\s+on\s+\d{1,2}\s+[A-Za-z]+\s+\d{4}\b/gi, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !watermarkTokens.has(line) && !/^Downloaded from .+ by guest on /i.test(line))
    .join('\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();

const shouldSkipChunk = (chunk, sourcePath) => {
  const text = cleanChunkText(chunk.text);
  if (/^GINA\/GINA 2026\.pdf$/i.test(sourcePath) && Number(chunk.startPage || 0) < 16) return true;
  const compact = text.replace(/\s+/g, ' ').trim();
  if (compact.length < 120) return true;
  if (/^(references|acknowledgments?|acknowledgements?|disclosures?|contents?)\b/i.test(compact)) return true;
  if (/\bReferences\s+\d{1,4}\b/i.test(compact.slice(0, 1200))) return true;
  if (/\bAcknowledg(e)?ments?\b/i.test(compact.slice(0, 1200))) return true;
  if (/Table of contents|Asthma treatment steps.*Track 1.*Track 2/i.test(compact.slice(0, 2200))) return true;
  if (/TE U IB TR IS D R O PY O C T O N O/i.test(compact.slice(0, 400))) return true;
  const etAlCount = (compact.match(/\bet al\b/gi) || []).length;
  const numberedCitationCount = (compact.match(/\b\d{1,4}\.\s+[A-Z][A-Za-z-]+/g) || []).length;
  return etAlCount >= 8 || numberedCitationCount >= 8;
};

const hasReliablePdfPageNumbers = (sourcePath) => /\.pdf$/i.test(String(sourcePath || ''));

const formatPageRangeForLabel = (sourcePath, startPage, endPage) => {
  if (!hasReliablePdfPageNumbers(sourcePath) || !startPage) return '';
  return endPage && endPage !== startPage ? ` pp. ${startPage}-${endPage}` : ` p. ${startPage}`;
};

const batchCommit = async (writer, count) => {
  if (dryRun) return;
  if (count % 160 === 0) {
    await writer.flush();
  }
};

const main = async () => {
  const jsonFiles = walkJsonFiles(sourceRoot);
  const writer = dryRun ? null : db.bulkWriter({
    throttling: {
      initialOpsPerSecond: 40,
      maxOpsPerSecond: 100,
    },
  });
  let bookCount = 0;
  let chunkCount = 0;
  let duplicateCount = 0;
  let skippedCount = 0;
  let globalOrder = 0;

  if (writer) {
    writer.onWriteError((error) => {
      const retryable = [4, 10, 13, 14].includes(error.code);
      if (retryable && error.failedAttempts < 8) {
        console.warn('Retrying write:', error.documentRef?.path, error.message);
        return true;
      }
      console.error('Write failed:', error.documentRef?.path, error.message);
      return false;
    });
  }

  for (const jsonPath of jsonFiles) {
    const relativeJsonPath = path.relative(sourceRoot, jsonPath);
    if (
      onlyFilters.length > 0
      && !onlyFilters.some((filter) => matchesOnlyFilter(relativeJsonPath, filter))
    ) {
      continue;
    }

    const structured = readJson(jsonPath);
    if (structured.status === 'duplicate') {
      duplicateCount += 1;
      continue;
    }
    if (structured.status !== 'extracted' || !Array.isArray(structured.chunks)) {
      skippedCount += 1;
      continue;
    }

    const sourcePath = structured.sourcePath;
    const bookId = makeBookId(sourcePath);
    const school = inferSchool(sourcePath);
    const year = inferYear(sourcePath, school);
    const collectionId = inferCollectionId(sourcePath, school, year);
    const sourceTitle = titleFromFile(sourcePath);
    const folderTitle = folderFromPath(sourcePath);
    const fileTitle = path.basename(sourcePath);

    const bookPayload = {
      id: bookId,
      bookId,
      collectionId,
      school,
      year,
      sourceTitle,
      title: sourceTitle,
      folderTitle,
      fileTitle,
      sourcePath,
      localFile: sourcePath,
      pageCount: Number(structured.pageCount || 0),
      textChars: Number(structured.textChars || 0),
      chunkCount: structured.chunks.length,
      sha256: structured.sha256 || '',
      extractionMethod: structured.extractionMethod || '',
      extractedAt: structured.extractedAt || '',
      status: 'active',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (!dryRun) {
      writer.set(db.collection('guideline_books').doc(bookId), bookPayload, { merge: true });
    }
    bookCount += 1;
    await batchCommit(writer, bookCount);

    for (const chunk of structured.chunks) {
      const chunkIndex = Number(String(chunk.id || '').match(/(\d+)$/)?.[1] || chunkCount + 1);
      const pageStart = Number(chunk.startPage || 0);
      const pageEnd = Number(chunk.endPage || pageStart || 0);
      const text = cleanChunkText(chunk.text);
      if (shouldSkipChunk(chunk, sourcePath)) {
        skippedCount += 1;
        continue;
      }

      globalOrder += 1;
      const chunkId = `${bookId}:${String(chunkIndex).padStart(5, '0')}`;
      const label = `${school} ${year} - ${folderTitle ? `${folderTitle} / ` : ''}${sourceTitle}${formatPageRangeForLabel(sourcePath, pageStart, pageEnd)}`;
      const heading = detectHeading(text);
      const keywords = extractKeywords(label, heading, text);
      const concepts = extractConcepts(label, heading, text);
      const intentTags = detectTags(normalizeSearchText([label, heading, text].join(' ')), intentLexicon);
      const payload = {
        id: chunkId,
        bookId,
        collectionId,
        school,
        year,
        sourceTitle,
        folderTitle,
        fileTitle,
        sourcePath,
        localFile: sourcePath,
        pageStart,
        pageEnd,
        page: pageStart,
        endPage: pageEnd,
        chunkIndex,
        globalOrder,
        label,
        heading,
        text,
        textCharCount: text.length,
        kind: 'full-text',
        keywords,
        concepts,
        intentTags,
        status: 'active',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const searchPayload = {
        id: chunkId,
        bookId,
        collectionId,
        school,
        year,
        sourceTitle,
        folderTitle,
        fileTitle,
        sourcePath,
        localFile: sourcePath,
        pageStart,
        pageEnd,
        page: pageStart,
        endPage: pageEnd,
        chunkIndex,
        globalOrder,
        label,
        heading,
        textPreview: text.slice(0, 1600),
        textCharCount: text.length,
        kind: 'full-text',
        keywords,
        concepts,
        intentTags,
        status: 'active',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (!dryRun) {
        writer.set(db.collection('guideline_chunk_search').doc(chunkId), searchPayload, { merge: true });
      }
      chunkCount += 1;
      await batchCommit(writer, chunkCount);
    }
  }

  if (!dryRun) {
    await writer.close();
    await db.collection('guideline_migration_audits').doc(`canonical-${new Date().toISOString()}`).set({
      sourceRoot: path.relative(workspace, sourceRoot).replace(/\\/g, '/'),
      bookCount,
      chunkCount,
      duplicateCount,
      skippedCount,
      finishedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  console.log(JSON.stringify({ dryRun, bookCount, chunkCount, duplicateCount, skippedCount }, null, 2));
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await admin.app().delete().catch(() => undefined);
  });


