import fs from 'node:fs';
import path from 'node:path';

import ts from 'typescript';

const dataDir = process.argv[2] ?? 'components/guidelines/data/ada2025';
const guidelinesDataPath = process.argv[3] ?? 'components/guidelines/guidelinesData.ts';
const structuredDir = process.argv[4] ?? 'guidelines-sources/_structured/ADA/2025';
const outputPath = process.argv[5] ?? 'components/guidelines/data/ada2025/recommendationDigest.ts';

const workspace = process.cwd();
const read = (filePath) => fs.readFileSync(path.resolve(filePath), 'utf8');

const repairText = (value) =>
  String(value ?? '')
    .replace(/\u0002/g, '')
    .replace(/â‰¥/g, '≥')
    .replace(/â‰¤/g, '≤')
    .replace(/â€“|â€”|âˆ’/g, '-')
    .replace(/â€™/g, "'")
    .replace(/â€œ|â€/g, '"')
    .replace(/Â²/g, '2')
    .replace(/\$(?=\s*\d)/g, '≥')
    .replace(/#(?=\s*\d)/g, '≤')
    .replace(/([a-z0-9)])\.([A-Z])/g, '$1. $2')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeKey = (value) =>
  repairText(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '');

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

const parseArrays = (filePath) => {
  const source = ts.createSourceFile(filePath, read(filePath), ts.ScriptTarget.Latest, true);
  const arrays = [];
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && node.initializer && ts.isArrayLiteralExpression(node.initializer)) {
      arrays.push(evaluate(node.initializer));
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return arrays;
};

const visitObjects = (value, callback) => {
  if (Array.isArray(value)) {
    value.forEach((item) => visitObjects(item, callback));
    return;
  }
  if (!value || typeof value !== 'object') return;
  callback(value);
  Object.values(value).forEach((item) => visitObjects(item, callback));
};

const sourceFiles = [
  guidelinesDataPath,
  ...fs
    .readdirSync(path.resolve(dataDir))
    .filter((name) => name.endsWith('.ts') && name !== path.basename(outputPath))
    .map((name) => path.join(dataDir, name)),
];

const sources = [];
for (const file of sourceFiles) {
  for (const array of parseArrays(file)) {
    visitObjects(array, (item) => {
      if (item?.id && item.localFile && item.title) sources.push(item);
    });
  }
}

const lineText = (items) =>
  items
    .slice()
    .sort((a, b) => a.x - b.x)
    .map((item) => item.text)
    .join(' ');

const recommendationTextFromItems = (items) => {
  const rows = [];
  for (const item of items) {
    const row = rows.find((candidate) => Math.abs(candidate.y - item.y) <= Math.max(2.2, item.height * 0.35));
    if (row) row.items.push(item);
    else rows.push({ y: item.y, items: [item] });
  }
  rows.sort((a, b) => a.y - b.y);
  return repairText(
    rows
      .map((row) => lineText(row.items))
      .join('\n')
      .replace(/-\n/g, '')
      .replace(/\n(?=[a-z,;)])/g, ' ')
      .replace(/\n/g, ' '),
  );
};

const sortRecommendations = (left, right) =>
  left.id.localeCompare(right.id, undefined, { numeric: true, sensitivity: 'base' });

const extractLayoutRecommendations = (document) => {
  const chapterPrefix = path.basename(document.sourcePdf).match(/^(\d+)\./)?.[1] ?? document.title.match(/^(\d+)\./)?.[1];
  if (!chapterPrefix) return [];

  const recommendations = [];
  const idPattern = new RegExp(`^${chapterPrefix}\\.\\d+[a-z]?$`);
  for (const page of document.pages ?? []) {
    const layout = page.layout;
    if (!layout?.items?.length) continue;
    const candidates = layout.items
      .filter((item) => idPattern.test(item.text))
      .sort((a, b) => a.x - b.x || a.y - b.y);
    if (!candidates.length) continue;

    const columnStarts = [...new Set(candidates.map((item) => Math.round(item.x)))].sort((a, b) => a - b);
    for (const candidate of candidates) {
      const columnIndex = columnStarts.findIndex((x) => Math.abs(x - Math.round(candidate.x)) <= 3);
      const minX = Math.max(0, columnStarts[columnIndex] - 10);
      const maxX =
        columnStarts.length === 1
          ? Math.min(layout.width * 0.64, 390)
          : columnIndex < columnStarts.length - 1
            ? columnStarts[columnIndex + 1] - 12
            : layout.width - 24;
      const nextInColumn = candidates
        .filter((item) => Math.abs(item.x - candidate.x) <= 4 && item.y > candidate.y + 2)
        .sort((a, b) => a.y - b.y)[0];
      const maxY = nextInColumn ? nextInColumn.y - 2 : layout.height - 38;
      const blockItems = layout.items
        .filter((item) => item.x >= minX && item.x <= maxX && item.y >= candidate.y - 1 && item.y <= maxY)
        .filter((item) => !/^Downloaded from https?:\/\//i.test(item.text))
        .sort((a, b) => a.y - b.y || a.x - b.x);
      const gradeItems = blockItems.filter((item) => /^[A-E]$/.test(item.text));
      const gradeItem = gradeItems.at(-1);
      if (!gradeItem) continue;

      const gradeIndex = blockItems.indexOf(gradeItem);
      const contentItems = blockItems.slice(0, gradeIndex).filter((item) => item.x <= gradeItem.x + 28);
      const text = recommendationTextFromItems(contentItems).replace(candidate.text, '').trim();
      if (text.length < 20) continue;

      recommendations.push({
        id: candidate.text,
        grade: [...new Set(gradeItems.map((item) => item.text))].join('/'),
        page: page.page,
        text,
        extractionMethod: 'layout',
      });
    }
  }

  const seen = new Set();
  return recommendations
    .filter((recommendation) => {
      if (seen.has(recommendation.id)) return false;
      seen.add(recommendation.id);
      return true;
    })
    .sort(sortRecommendations);
};

const cleanRawRecommendation = (recommendation) => {
  let text = repairText(recommendation.text)
    .replace(/\s+References\s+\d+\..*$/i, '')
    .replace(/\s+(Downloaded from https?:\/\/.*)$/i, '')
    .trim();
  let grade = repairText(recommendation.evidenceGrade ?? recommendation.grade ?? '');

  const bodyTextBreak = text.match(
    /\s+([A-E])\s+(?=Although intermittent\b|Blood pressure should be measured\b|Care and close supervision\b|Critical Care Setting\b|Estimated prevalence\b|Foot ulcerations\b|Glycemic Management\b|Lipid Management\b|Malnutrition\b|Neuropathic Pain\b|People with or without diabetes\b|Please refer\b|Studies of individuals\b|Teplizumab,|The Diabetes Prevention Program\b|The overall objectives\b|Therapeutic Strategies\b|Weight Management\b)/,
  );
  if (bodyTextBreak && bodyTextBreak.index && bodyTextBreak.index > 80) {
    grade = bodyTextBreak[1];
    text = text.slice(0, bodyTextBreak.index).trim();
  }

  if (text.length > 1400) {
    const headingBreak = text.search(
      /\s(?:Background|Evidence for|Glycemic Management|Weight Management|Lipid Management|Blood Pressure Management|Neuropathic Pain|Critical Care Setting|Malnutrition|Screening|Treatment|References)\s+[A-Z]/,
    );
    if (headingBreak > 180) text = text.slice(0, headingBreak).trim();
  }

  return {
    id: recommendation.id,
    grade,
    page: recommendation.page,
    text,
    extractionMethod: recommendation.extractionMethod ?? 'structured',
  };
};

const chooseRecommendations = (document) => {
  const layoutById = new Map(extractLayoutRecommendations(document).map((recommendation) => [recommendation.id, recommendation]));
  return (document.recommendations ?? [])
    .map((recommendation) => {
      const structured = cleanRawRecommendation(recommendation);
      const layout = layoutById.get(recommendation.id);
      if (!layout) return structured;
      if (structured.text.length > 700 && layout.text.length < structured.text.length * 0.75) return layout;
      return structured;
    })
    .filter((recommendation) => recommendation.text.length >= 20)
    .sort(sortRecommendations)
    .map(({ id, grade, page, text }) => ({ id, grade, page, text }));
};

const cleanCaption = (caption) => ({
  kind: repairText(caption.kind),
  id: repairText(caption.id),
  page: caption.page,
  caption: repairText(caption.caption),
});

const cleanTableExtract = (table) => ({
  page: table.page,
  relatedItems: (table.nearbyCaptions ?? [])
    .map((caption) => `${repairText(caption.kind)} ${repairText(caption.id)}`)
    .filter(Boolean),
  rows: (table.rows ?? []).map(repairText).filter((row) => row.length >= 12),
});

const manifest = JSON.parse(read(path.join(structuredDir, 'manifest.json')));
const manifestDocuments = manifest.documents
  .map((item) => {
    const jsonPath = path.resolve(workspace, item.json);
    if (!fs.existsSync(jsonPath)) return null;
    return { manifest: item, document: JSON.parse(fs.readFileSync(jsonPath, 'utf8')) };
  })
  .filter(Boolean);

const digest = [];
const usedDocuments = new Set();
for (const source of sources) {
  const sourceKey = normalizeKey(source.localFile);
  const titleKey = normalizeKey(source.title);
  const match = manifestDocuments.find(({ document }) => {
    if (usedDocuments.has(document.sourcePdf)) return false;
    return normalizeKey(document.sourcePdf).includes(sourceKey) || normalizeKey(document.title).includes(titleKey.slice(0, 36));
  });
  if (!match) continue;
  usedDocuments.add(match.document.sourcePdf);
  digest.push({
    sourceId: source.id,
    title: repairText(source.title),
    sourcePdf: match.document.sourcePdf,
    recommendations: chooseRecommendations(match.document),
    tablesAndFigures: (match.document.captions ?? []).map(cleanCaption),
    tableTextRows: (match.document.tableLikeRows ?? [])
      .map(cleanTableExtract)
      .filter((table) => table.rows.length > 0),
  });
}

const variableName = outputPath.includes('2026') ? 'ADA_2026_RECOMMENDATION_DIGEST' : 'ADA_2025_RECOMMENDATION_DIGEST';
const output = `import type { GuidelineSourceDigest } from '../../guidelinesData';\n\nexport const ${variableName}: GuidelineSourceDigest[] = ${JSON.stringify(digest, null, 2)};\n`;

fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
fs.writeFileSync(path.resolve(outputPath), output);

const totals = digest.reduce(
  (memo, source) => ({
    sources: memo.sources + 1,
    recommendations: memo.recommendations + source.recommendations.length,
    tablesAndFigures: memo.tablesAndFigures + source.tablesAndFigures.length,
    tableTextRows: memo.tableTextRows + (source.tableTextRows ?? []).reduce((total, table) => total + table.rows.length, 0),
    longRecommendations: memo.longRecommendations + source.recommendations.filter((item) => item.text.length > 1000).length,
  }),
  { sources: 0, recommendations: 0, tablesAndFigures: 0, tableTextRows: 0, longRecommendations: 0 },
);

console.log(JSON.stringify(totals, null, 2));
