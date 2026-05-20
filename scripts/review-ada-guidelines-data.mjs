import fs from 'node:fs';
import path from 'node:path';

import ts from 'typescript';

const dataDir = process.argv[2] ?? 'components/guidelines/data/ada2025';
const guidelinesDataPath = process.argv[3] ?? 'components/guidelines/guidelinesData.ts';
const structuredDir = process.argv[4] ?? 'guidelines-sources/_structured/ADA/2025';
const sensitiveReviewPath = process.argv[5] ?? 'guidelines-sources/_review/ADA/2025/sensitive-clinical-review.json';
const outputDir = process.argv[6] ?? 'guidelines-sources/_review/ADA/2025';

const workspace = process.cwd();
const resolvedOutput = path.resolve(outputDir);
fs.mkdirSync(resolvedOutput, { recursive: true });

const read = (filePath) => fs.readFileSync(path.resolve(filePath), 'utf8');

const sourceFiles = [
  guidelinesDataPath,
  ...fs
    .readdirSync(path.resolve(dataDir))
    .filter((name) => name.endsWith('.ts'))
    .map((name) => path.join(dataDir, name)),
];

const evaluate = (node) => {
  if (!node) return undefined;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isArrayLiteralExpression(node)) {
    return node.elements
      .filter((item) => !ts.isSpreadElement(item))
      .map((item) => evaluate(item));
  }
  if (ts.isObjectLiteralExpression(node)) {
    const object = {};
    for (const prop of node.properties) {
      if (!ts.isPropertyAssignment(prop)) continue;
      const name = prop.name;
      const key = ts.isIdentifier(name) || ts.isStringLiteral(name) ? name.text : undefined;
      if (!key) continue;
      object[key] = evaluate(prop.initializer);
    }
    return object;
  }
  return undefined;
};

const collectStrings = (value, output = []) => {
  if (typeof value === 'string') output.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, output));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => collectStrings(item, output));
  return output;
};

const parseArrays = (filePath) => {
  const source = ts.createSourceFile(filePath, read(filePath), ts.ScriptTarget.Latest, true);
  const arrays = [];
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && node.initializer && ts.isArrayLiteralExpression(node.initializer)) {
      arrays.push({
        name: ts.isIdentifier(node.name) ? node.name.text : '',
        value: evaluate(node.initializer),
      });
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return arrays;
};

const sourceMap = new Map();
const topics = [];

const visitEvaluatedObjects = (value, callback) => {
  if (Array.isArray(value)) {
    value.forEach((item) => visitEvaluatedObjects(item, callback));
    return;
  }
  if (!value || typeof value !== 'object') return;
  callback(value);
  Object.values(value).forEach((item) => visitEvaluatedObjects(item, callback));
};

for (const file of sourceFiles) {
  for (const array of parseArrays(file)) {
    visitEvaluatedObjects(array.value, (item) => {
      if (!item || typeof item !== 'object') return;
      if (item.localFile && item.id) sourceMap.set(item.id, item);
      if (item.sourceIds && item.points && item.title) {
        topics.push({
          ...item,
          file: path.relative(workspace, path.resolve(file)).replace(/\\/g, '/'),
        });
      }
    });
  }
}

const manifest = JSON.parse(read(path.join(structuredDir, 'manifest.json')));
const documents = new Map();
for (const item of manifest.documents) {
  const documentPath = path.resolve(workspace, item.json);
  if (!fs.existsSync(documentPath)) continue;
  const document = JSON.parse(fs.readFileSync(documentPath, 'utf8'));
  const corpus = [
    document.title,
    document.sourcePdf,
    ...(document.recommendations ?? []).map((rec) => `${rec.id} ${rec.evidenceGrade} ${rec.text}`),
    ...(document.captions ?? []).map((caption) => caption.caption),
    ...(document.pages ?? []).map((page) => page.cleanedText),
  ].join(' ');
  documents.set(item.sourcePdf, { ...document, corpus });
}

const sensitiveReview = fs.existsSync(path.resolve(sensitiveReviewPath))
  ? JSON.parse(read(sensitiveReviewPath))
  : { sensitiveRecommendations: [] };

const normalizeKey = (value) =>
  String(value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '');

const normalizeClinicalText = (value) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/[≥]/g, '>=')
    .replace(/[≤]/g, '<=')
    .replace(/\$(?=\s*\d)/g, '>=')
    .replace(/#(?=\s*\d)/g, '<=')
    .replace(/[–—−]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

const compactNumberToken = (value) =>
  normalizeClinicalText(value)
    .replace(/m²/g, 'm2')
    .replace(/\s*(>=|<=|>|<|=)\s*/g, '$1')
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, '')
    .replace(/(\d+)\.0(?=%)/g, '$1')
    .replace(/\/1\.73m2?/g, '/1.73m')
    .replace(/percent/g, '%')
    .replace(/years/g, 'year')
    .replace(/months/g, 'month')
    .replace(/weeks/g, 'week')
    .replace(/hours?/g, 'h');

const sourceDocumentFor = (sourceId) => {
  const source = sourceMap.get(sourceId);
  if (!source) return null;
  const sourceKey = normalizeKey(source.localFile);
  const titleKey = normalizeKey(source.title);
  for (const document of documents.values()) {
    if (normalizeKey(document.sourcePdf).includes(sourceKey)) return document;
    if (normalizeKey(document.title).includes(titleKey.slice(0, 36))) return document;
  }
  return null;
};

const numberPattern =
  /(?:[<>]=?|≥|≤)\s*\d+(?:\.\d+)?(?:\s*[-–]\s*\d+(?:\.\d+)?)?\s*(?:%|mg\/dL|mmol\/L|mmHg|mL\/min(?:\/1\.73\s*m(?:2|²))?|g(?:\/day)?|hours?|weeks?|months?|years?)?|\b\d+(?:\.\d+)?\s*[-–]\s*\d+(?:\.\d+)?\s*(?:%|mg\/dL|mmol\/L|mmHg|mL\/min(?:\/1\.73\s*m(?:2|²))?|g(?:\/day)?|hours?|weeks?|months?|years?)|\b\d+(?:\.\d+)?\s*(?:%|mg\/dL|mmol\/L|mmHg|mL\/min(?:\/1\.73\s*m(?:2|²))?|g(?:\/day)?|hours?|weeks?|months?|years?)\b/gi;

const extractNumberClaims = (topic) => {
  const strings = collectStrings({
    title: topic.title?.en,
    summary: topic.summary?.en,
    points: topic.points?.en,
    details: topic.details?.map((detail) => ({
      title: detail.title?.en,
      items: detail.items?.en,
    })),
    practiceNote: topic.practiceNote?.en,
    visuals: topic.visuals?.map((visual) => ({
      title: visual.title?.en,
      label: visual.label,
      takeaways: visual.takeaways?.en,
    })),
  }).join(' ');
  const raw = strings.match(numberPattern) ?? [];
  return [...new Set(raw.map((item) => item.trim()))];
};

const manuallyVerifiedClaims = new Map(
  [
    ['older-adults-full|80-130 mg/dL', 'ADA 2025 Table 13.1: healthy older adult fasting/premeal glucose goal'],
    ['older-adults-full|80-180 mg/dL', 'ADA 2025 Table 13.1: healthy older adult bedtime glucose goal'],
    ['older-adults-full|100-180 mg/dL', 'ADA 2025 Table 13.1: very complex/poor health fasting/premeal glucose goal'],
    ['older-adults-full|110-200 mg/dL', 'ADA 2025 Table 13.1: very complex/poor health bedtime glucose goal'],
    ['hospital-care-full|>=200 mg/dL', 'ADA 2025 Figure 16.1: DKA pathway diagnostic anchor'],
    ['hospital-care-full|150 and 200 mg/dL', 'ADA 2025 Figure 16.1: DKA treatment pathway glucose range until resolution'],
    ['hospital-care-full|200 and 250 mg/dL', 'ADA 2025 Figure 16.1: HHS treatment pathway glucose range until resolution'],
  ].map(([key, note]) => [compactNumberToken(key), note]),
);

const verifyNumberClaim = ({ topicId, claim, compactCorpus }) => {
  const compact = compactNumberToken(claim);
  if (compact.length > 0 && compactCorpus.includes(compact)) {
    return { verifiedInSource: true, verificationMethod: 'exact-source-text' };
  }

  const manualNote = manuallyVerifiedClaims.get(compactNumberToken(`${topicId}|${claim}`));
  if (manualNote) {
    return {
      verifiedInSource: true,
      verificationMethod: 'manual-table-or-figure-review',
      reviewNote: manualNote,
    };
  }

  return { verifiedInSource: false, verificationMethod: 'not-found' };
};

const textTokens = (value) =>
  new Set(
    normalizeClinicalText(value)
      .replace(/[^a-z0-9%./<>-]+/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 3 && !/^\d+$/.test(token)),
  );

const overlapScore = (left, right) => {
  const a = textTokens(left);
  const b = textTokens(right);
  if (!a.size || !b.size) return 0;
  let overlap = 0;
  for (const token of a) {
    if (b.has(token)) overlap += 1;
  }
  return overlap / Math.min(a.size, b.size);
};

const topicText = (topic) => collectStrings(topic).join(' ');

const topicReviews = topics.map((topic) => {
  const sourceIds = [
    ...(topic.sourceIds ?? []),
    ...(topic.visuals ?? []).map((visual) => visual.sourceId),
  ].filter(Boolean);
  const sourceDocuments = [...new Set(sourceIds)].map(sourceDocumentFor).filter(Boolean);
  const sourceCorpus = normalizeClinicalText(sourceDocuments.map((document) => document.corpus).join(' '));
  const compactCorpus = compactNumberToken(sourceCorpus);
  const numberClaims = extractNumberClaims(topic);
  const numericClaims = numberClaims.map((claim) => {
    return {
      claim,
      ...verifyNumberClaim({ topicId: topic.id, claim, compactCorpus }),
    };
  });
  const unverifiedNumbers = numericClaims.filter((claim) => !claim.verifiedInSource);

  const sensitiveCandidates = (sensitiveReview.sensitiveRecommendations ?? [])
    .filter((item) => sourceDocuments.some((document) => document.sourcePdf === item.sourcePdf))
    .map((item) => ({
      recommendationId: item.recommendationId,
      grade: item.evidenceGrade,
      page: item.page,
      score: Number(overlapScore(topicText(topic), item.text).toFixed(3)),
      categories: item.categories?.map((category) => category.id) ?? [],
      warnings: item.warnings?.map((warning) => warning.id) ?? [],
      text: item.text,
    }))
    .filter((item) => item.score >= 0.12)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const issues = [];
  if (!topic.sourceIds?.length) issues.push('missing-sourceIds');
  if (topic.sourceIds?.some((sourceId) => !sourceMap.has(sourceId))) issues.push('unknown-sourceId');
  if (!sourceDocuments.length) issues.push('missing-extracted-source-document');
  if (unverifiedNumbers.length) issues.push('unverified-number-claim');
  const expectsSensitiveMatch =
    !(topic.sourceIds ?? []).includes('advocacy') &&
    /insulin|A1C|CKD|ASCVD|pregnan|hypoglycemia|DKA|mg\/dL|mmHg|eGFR/i.test(topicText(topic));
  if (!sensitiveCandidates.length && expectsSensitiveMatch) {
    issues.push('no-sensitive-source-match');
  }

  return {
    id: topic.id,
    file: topic.file,
    group: topic.group,
    title: topic.title?.en,
    sourceIds: topic.sourceIds ?? [],
    visualSourceIds: [...new Set((topic.visuals ?? []).map((visual) => visual.sourceId).filter(Boolean))],
    sourceDocuments: sourceDocuments.map((document) => document.sourcePdf),
    numericClaims,
    sensitiveCandidates,
    issues,
    status: issues.length ? 'needs-review' : 'source-supported',
  };
});

const totals = {
  topics: topicReviews.length,
  sourceSupported: topicReviews.filter((topic) => topic.status === 'source-supported').length,
  needsReview: topicReviews.filter((topic) => topic.status === 'needs-review').length,
  numericClaims: topicReviews.reduce((sum, topic) => sum + topic.numericClaims.length, 0),
  unverifiedNumericClaims: topicReviews.reduce(
    (sum, topic) => sum + topic.numericClaims.filter((claim) => !claim.verifiedInSource).length,
    0,
  ),
};

const review = {
  generatedAt: new Date().toISOString(),
  totals,
  topicReviews,
};

const markdown = [
  '# ADA 2025 App Data Review',
  '',
  `- Topics reviewed: ${totals.topics}`,
  `- Source-supported topics: ${totals.sourceSupported}`,
  `- Topics needing review: ${totals.needsReview}`,
  `- Numeric claims: ${totals.numericClaims}`,
  `- Unverified numeric claims: ${totals.unverifiedNumericClaims}`,
  '',
  '## Topics Needing Review',
  '',
  ...topicReviews
    .filter((topic) => topic.status === 'needs-review')
    .flatMap((topic) => [
      `### ${topic.id}: ${topic.title}`,
      '',
      `File: \`${topic.file}\``,
      '',
      `Issues: ${topic.issues.join(', ')}`,
      '',
      topic.numericClaims.length
        ? `Numbers: ${topic.numericClaims.map((claim) => `${claim.claim}${claim.verifiedInSource ? ' OK' : ' REVIEW'}`).join('; ')}`
        : 'Numbers: none',
      '',
      topic.sensitiveCandidates.length
        ? `Closest sensitive recommendations: ${topic.sensitiveCandidates
            .map((item) => `${item.recommendationId} (${item.grade}, p.${item.page}, score ${item.score})`)
            .join('; ')}`
        : 'Closest sensitive recommendations: none',
      '',
    ]),
].join('\n');

const csv = [
  ['status', 'topic_id', 'title', 'issues', 'numeric_claims', 'unverified_numeric_claims', 'source_ids'],
  ...topicReviews.map((topic) => [
    topic.status,
    topic.id,
    topic.title,
    topic.issues.join('; '),
    topic.numericClaims.map((claim) => claim.claim).join('; '),
    topic.numericClaims.filter((claim) => !claim.verifiedInSource).map((claim) => claim.claim).join('; '),
    topic.sourceIds.join('; '),
  ]),
]
  .map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
  .join('\n');

fs.writeFileSync(path.join(resolvedOutput, 'app-data-review.json'), `${JSON.stringify(review, null, 2)}\n`, 'utf8');
fs.writeFileSync(path.join(resolvedOutput, 'app-data-review.md'), `${markdown}\n`, 'utf8');
fs.writeFileSync(path.join(resolvedOutput, 'app-data-review.csv'), `${csv}\n`, 'utf8');

console.log(`Topics reviewed: ${totals.topics}`);
console.log(`Topics needing review: ${totals.needsReview}`);
console.log(`Numeric claims: ${totals.numericClaims}`);
console.log(`Unverified numeric claims: ${totals.unverifiedNumericClaims}`);
console.log(`Output: ${path.relative(workspace, resolvedOutput)}`);
