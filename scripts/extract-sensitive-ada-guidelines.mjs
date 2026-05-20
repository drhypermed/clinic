import fs from 'node:fs';
import path from 'node:path';

const structuredDir = process.argv[2] ?? 'guidelines-sources/_structured/ADA/2025';
const outputDir = process.argv[3] ?? 'guidelines-sources/_review/ADA/2025';

const workspace = process.cwd();
const resolvedStructured = path.resolve(structuredDir);
const resolvedOutput = path.resolve(outputDir);

const ensureInsideWorkspace = (target, label) => {
  const relative = path.relative(workspace, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label} must stay inside the workspace: ${target}`);
  }
};

ensureInsideWorkspace(resolvedStructured, 'Structured directory');
ensureInsideWorkspace(resolvedOutput, 'Output directory');
fs.mkdirSync(resolvedOutput, { recursive: true });

const windows1252Bytes = new Map([
  [0x20ac, 0x80],
  [0x201a, 0x82],
  [0x0192, 0x83],
  [0x201e, 0x84],
  [0x2026, 0x85],
  [0x2020, 0x86],
  [0x2021, 0x87],
  [0x02c6, 0x88],
  [0x2030, 0x89],
  [0x0160, 0x8a],
  [0x2039, 0x8b],
  [0x0152, 0x8c],
  [0x017d, 0x8e],
  [0x2018, 0x91],
  [0x2019, 0x92],
  [0x201c, 0x93],
  [0x201d, 0x94],
  [0x2022, 0x95],
  [0x2013, 0x96],
  [0x2014, 0x97],
  [0x02dc, 0x98],
  [0x2122, 0x99],
  [0x0161, 0x9a],
  [0x203a, 0x9b],
  [0x0153, 0x9c],
  [0x017e, 0x9e],
  [0x0178, 0x9f],
]);

const repairMojibake = (value) => {
  if (!value || !/[\u00c2\u00c3\u00e2]/.test(value)) return value ?? '';
  const bytes = [];
  for (const char of value) {
    const code = char.codePointAt(0);
    if (code <= 0xff) bytes.push(code);
    else if (windows1252Bytes.has(code)) bytes.push(windows1252Bytes.get(code));
    else return value;
  }
  const repaired = Buffer.from(bytes).toString('utf8');
  return repaired.includes('\uFFFD') ? value : repaired;
};

const repairCommonMojibake = (value) =>
  value
    .replace(/\u00e2\u20ac\u201c/g, '\u2013')
    .replace(/\u00e2\u20ac\u201d/g, '\u2014')
    .replace(/\u00e2\u20ac\u02dc/g, '\u2018')
    .replace(/\u00e2\u20ac\u2122/g, '\u2019')
    .replace(/\u00e2\u20ac\u0153/g, '\u201c')
    .replace(/\u00e2\u20ac[\u009d\uFFFD]/g, '\u201d')
    .replace(/\u00e2\u20ac\u00a2/g, '\u2022')
    .replace(/\u00e2\u2030\u00a5/g, '\u2265')
    .replace(/\u00e2\u2030\u00a4/g, '\u2264')
    .replace(/\u00e2\u20ac\u00a0/g, '\u2020')
    .replace(/\u00e2\u20ac\u00a1/g, '\u2021')
    .replace(/\u00c3\u2014/g, '\u00d7')
    .replace(/\u00c2\u00a7/g, '\u00a7')
    .replace(/\u00c2\u00a9/g, '\u00a9')
    .replace(/\u00c2\u00b1/g, '\u00b1')
    .replace(/\u00c2/g, '');

const normalizeText = (value) =>
  repairCommonMojibake(repairMojibake(value))
    .replace(/\u00a0/g, ' ')
    .replace(/\ufb01/g, 'fi')
    .replace(/\ufb02/g, 'fl')
    .replace(/\s+/g, ' ')
    .trim();

const sensitivityRules = [
  {
    id: 'acute-emergency-risk',
    label: 'Acute emergency risk',
    severity: 5,
    pattern: /\b(DKA|diabetic ketoacidosis|ketoacidosis|ketone|ketosis|HHS|hyperosmolar|severe hypoglycemia|hypoglycemia|glucagon|critical illness|hospitalization|inpatient|emergency|acute)\b/i,
  },
  {
    id: 'pregnancy-childbearing',
    label: 'Pregnancy and childbearing',
    severity: 5,
    pattern: /\b(pregnan|gestational|preconception|contraception|childbearing|postpartum|lactation|breastfeeding|fetal|maternal)\b/i,
  },
  {
    id: 'children-adolescents',
    label: 'Children and adolescents',
    severity: 5,
    pattern: /\b(children|adolescents?|youth|pediatric|puberty|school|caregiver|family)\b/i,
  },
  {
    id: 'renal-ckd',
    label: 'CKD and renal dosing',
    severity: 5,
    pattern: /\b(CKD|kidney|renal|eGFR|glomerular|albuminuria|dialysis|transplant|nephropathy)\b/i,
  },
  {
    id: 'cardiovascular',
    label: 'Cardiovascular disease and BP/lipids',
    severity: 5,
    pattern: /\b(ASCVD|cardiovascular|heart failure|HFpEF|HFrEF|coronary|stroke|blood pressure|hypertension|statin|LDL|lipid|aspirin|ACE inhibitor|ARB|albuminuria)\b/i,
  },
  {
    id: 'insulin-high-risk-meds',
    label: 'Insulin or high-risk glucose-lowering medication',
    severity: 5,
    pattern: /\b(insulin|sulfonylurea|meglitinide|SGLT2|GLP-1|GIP|DPP-4|metformin|pioglitazone|thiazolidinedione|tirzepatide|semaglutide|liraglutide|empagliflozin|dapagliflozin|canagliflozin)\b/i,
  },
  {
    id: 'contraindication-adverse-effects',
    label: 'Contraindications, warnings, and adverse effects',
    severity: 5,
    pattern: /\b(contraindicated|not recommended|avoid|do not|discontinue|adverse|side effects?|pancreatitis|gastroparesis|retinopathy|infection|fracture|bladder cancer|fluid retention|hypersensitivity|safety|quality|FDA-approved|compounded)\b/i,
  },
  {
    id: 'older-adults-frailty',
    label: 'Older adults, frailty, and deintensification',
    severity: 4,
    pattern: /\b(older adults?|frailty|cognitive|dementia|deintensification|polypharmacy|functional|falls|long-term care|end of life|palliative)\b/i,
  },
  {
    id: 'screening-diagnosis-thresholds',
    label: 'Diagnosis, screening, or numeric thresholds',
    severity: 4,
    pattern: /\b(screen|diagnos|classification|A1C|HbA1c|fasting plasma glucose|OGTT|threshold|mg\/dL|mmol\/L|mmHg|percent|%|target|goal)\b/i,
  },
  {
    id: 'therapy-change-affordability',
    label: 'Therapy substitution, access, or affordability',
    severity: 4,
    pattern: /\b(cost|afford|access|availability|shortage|switch|substitution|coverage|insurance|financial|lower-cost|generic|barriers)\b/i,
  },
  {
    id: 'procedures-surgery-devices',
    label: 'Procedures, surgery, technology, or devices',
    severity: 4,
    pattern: /\b(surgery|metabolic surgery|bariatric|procedure|device|CGM|pump|automated insulin delivery|AID|continuous glucose monitoring|telehealth|spirometry)\b/i,
  },
];

const qualityRules = [
  {
    id: 'mojibake',
    pattern: /(?:â|Â|Ã|�)/,
    message: 'Possible mojibake or replacement character remains.',
  },
  {
    id: 'column-bleed',
    pattern: /\b(Suggested citation|Downloaded from|Diabetes Care Volume|Professional Practice Committee|Readers may use|American Diabetes Association)\b/i,
    message: 'Possible header/footer/sidebar text mixed into recommendation.',
  },
  {
    id: 'hyphenation-fragments',
    pattern: /\b\w{2,}-\s+\w{2,}\b/,
    message: 'Possible line-break hyphenation remains.',
  },
  {
    id: 'missing-spaces',
    pattern: /\b(?:decisionmaking|medicationtaking|glucoselowering|hypoglycemiaand|Table\s*\d+\.\d+and|Fig\.\s*\d+\.\d+and)\b/i,
    message: 'Possible missing spaces from PDF extraction.',
  },
  {
    id: 'truncated-numeric-range',
    pattern: /\b(?:every\s+\d+–\s|mL\/min\/\s+\d|mg\/dL\s*$|mmHg\s*$)/i,
    message: 'Possible truncated numeric threshold or range.',
  },
  {
    id: 'very-long',
    pattern: /^.{900,}$/s,
    message: 'Very long recommendation; likely includes adjacent body text.',
  },
  {
    id: 'very-short',
    pattern: /^.{0,35}$/s,
    message: 'Very short text; verify extraction completeness.',
  },
];

const severityLabel = (score, warningsCount) => {
  if (score >= 10 || warningsCount > 0) return 'critical-review';
  if (score >= 6) return 'high-review';
  return 'focused-review';
};

const classifyText = (text) => {
  const categories = sensitivityRules
    .filter((rule) => rule.pattern.test(text))
    .map(({ id, label, severity }) => ({ id, label, severity }));
  const warnings = qualityRules
    .filter((rule) => rule.pattern.test(text))
    .map(({ id, message }) => ({ id, message }));

  const score = categories.reduce((sum, category) => sum + category.severity, 0);
  return {
    categories,
    warnings,
    sensitivityScore: score,
    reviewPriority: severityLabel(score, warnings.length),
  };
};

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const manifestPath = path.join(resolvedStructured, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  throw new Error(`Missing manifest: ${manifestPath}`);
}

const manifest = readJson(manifestPath);
const sensitiveRecommendations = [];
const sensitiveTablesFigures = [];

for (const entry of manifest.documents) {
  const documentPath = path.resolve(workspace, entry.json);
  if (!fs.existsSync(documentPath)) continue;
  const document = readJson(documentPath);
  const title = normalizeText(document.title);
  const sourcePdf = document.sourcePdf;
  const documentMarkdown = entry.markdown;

  for (const recommendation of document.recommendations ?? []) {
    const text = normalizeText(recommendation.text);
    const classification = classifyText(text);
    if (!classification.categories.length && !classification.warnings.length) continue;

    const samePageCaptions = (document.captions ?? [])
      .filter((caption) => caption.page === recommendation.page)
      .slice(0, 3)
      .map((caption) => normalizeText(caption.caption));

    sensitiveRecommendations.push({
      document: title,
      sourcePdf,
      documentJson: entry.json,
      documentMarkdown,
      recommendationId: recommendation.id,
      evidenceGrade: recommendation.evidenceGrade,
      page: recommendation.page,
      text,
      ...classification,
      samePageCaptions,
      needsManualVerification: classification.reviewPriority === 'critical-review',
    });
  }

  for (const caption of document.captions ?? []) {
    const text = normalizeText(caption.caption);
    const classification = classifyText(text);
    if (!classification.categories.length && !classification.warnings.length) continue;

    const samePageImages = (document.images ?? [])
      .filter((image) => image.page === caption.page)
      .map((image) => image.file)
      .filter(Boolean);

    sensitiveTablesFigures.push({
      document: title,
      sourcePdf,
      documentJson: entry.json,
      documentMarkdown,
      kind: caption.kind,
      captionId: caption.id,
      page: caption.page,
      text,
      ...classification,
      samePageImages,
      needsManualVerification: classification.reviewPriority === 'critical-review',
    });
  }
}

const byPriority = (left, right) =>
  right.sensitivityScore - left.sensitivityScore ||
  Number(Boolean(right.warnings.length)) - Number(Boolean(left.warnings.length)) ||
  left.document.localeCompare(right.document, undefined, { numeric: true }) ||
  left.page - right.page ||
  String(left.recommendationId ?? left.captionId).localeCompare(String(right.recommendationId ?? right.captionId), undefined, {
    numeric: true,
  });

sensitiveRecommendations.sort(byPriority);
sensitiveTablesFigures.sort(byPriority);

const categoryCounts = {};
for (const item of [...sensitiveRecommendations, ...sensitiveTablesFigures]) {
  for (const category of item.categories) {
    categoryCounts[category.id] ??= { label: category.label, count: 0 };
    categoryCounts[category.id].count += 1;
  }
}

const review = {
  generatedAt: new Date().toISOString(),
  sourceManifest: path.relative(workspace, manifestPath).replace(/\\/g, '/'),
  totals: {
    sensitiveRecommendations: sensitiveRecommendations.length,
    recommendationsNeedingManualVerification: sensitiveRecommendations.filter((item) => item.needsManualVerification).length,
    sensitiveTablesFigures: sensitiveTablesFigures.length,
    tablesFiguresNeedingManualVerification: sensitiveTablesFigures.filter((item) => item.needsManualVerification).length,
  },
  categoryCounts: Object.fromEntries(
    Object.entries(categoryCounts).sort(([, left], [, right]) => right.count - left.count),
  ),
  sensitiveRecommendations,
  sensitiveTablesFigures,
};

const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
const recommendationCsv = [
  ['priority', 'document', 'id', 'grade', 'page', 'categories', 'warnings', 'source_pdf', 'text'],
  ...sensitiveRecommendations.map((item) => [
    item.reviewPriority,
    item.document,
    item.recommendationId,
    item.evidenceGrade,
    item.page,
    item.categories.map((category) => category.label).join('; '),
    item.warnings.map((warning) => warning.id).join('; '),
    item.sourcePdf,
    item.text,
  ]),
]
  .map((row) => row.map(escapeCsv).join(','))
  .join('\n');

const toMarkdown = () => {
  const lines = [
    '# ADA 2025 Sensitive Clinical Review',
    '',
    `- Sensitive recommendations: ${review.totals.sensitiveRecommendations}`,
    `- Recommendations needing manual verification: ${review.totals.recommendationsNeedingManualVerification}`,
    `- Sensitive tables/figures: ${review.totals.sensitiveTablesFigures}`,
    `- Tables/figures needing manual verification: ${review.totals.tablesFiguresNeedingManualVerification}`,
    '',
    '## Category Counts',
    '',
  ];

  for (const [id, category] of Object.entries(review.categoryCounts)) {
    lines.push(`- ${category.label} (${id}): ${category.count}`);
  }

  lines.push('', '## Recommendations', '');
  for (const item of sensitiveRecommendations) {
    const categories = item.categories.map((category) => category.label).join(', ');
    const warnings = item.warnings.length ? ` Warnings: ${item.warnings.map((warning) => warning.id).join(', ')}.` : '';
    lines.push(
      `### ${item.reviewPriority}: ${item.document} ${item.recommendationId ?? ''} (${item.evidenceGrade ?? 'no grade'}), p. ${item.page}`,
      '',
      `Categories: ${categories || 'review-only'}.${warnings}`,
      '',
      item.text,
      '',
      `Source: \`${item.sourcePdf}\``,
      '',
    );
  }

  lines.push('## Sensitive Tables and Figures', '');
  for (const item of sensitiveTablesFigures) {
    const categories = item.categories.map((category) => category.label).join(', ');
    const warnings = item.warnings.length ? ` Warnings: ${item.warnings.map((warning) => warning.id).join(', ')}.` : '';
    lines.push(
      `### ${item.reviewPriority}: ${item.document} ${item.kind} ${item.captionId}, p. ${item.page}`,
      '',
      `Categories: ${categories || 'review-only'}.${warnings}`,
      '',
      item.text,
      '',
      `Source: \`${item.sourcePdf}\``,
      '',
    );
  }

  return `${lines.join('\n')}\n`;
};

fs.writeFileSync(path.join(resolvedOutput, 'sensitive-clinical-review.json'), `${JSON.stringify(review, null, 2)}\n`, 'utf8');
fs.writeFileSync(path.join(resolvedOutput, 'sensitive-recommendations.csv'), `${recommendationCsv}\n`, 'utf8');
fs.writeFileSync(path.join(resolvedOutput, 'sensitive-clinical-review.md'), toMarkdown(), 'utf8');

console.log(`Sensitive recommendations: ${review.totals.sensitiveRecommendations}`);
console.log(`Recommendations needing manual verification: ${review.totals.recommendationsNeedingManualVerification}`);
console.log(`Sensitive tables/figures: ${review.totals.sensitiveTablesFigures}`);
console.log(`Output: ${path.relative(workspace, resolvedOutput)}`);
