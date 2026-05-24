import fs from 'node:fs';
import path from 'node:path';

const workspace = process.cwd();
const sourceRoot = path.resolve(process.argv[2] ?? 'guidelines-sources/_structured/full-text');
const outputPath = path.resolve(process.argv[3] ?? 'public/guidelines-search/full-text-index.json');

const ensureInsideWorkspace = (target, label) => {
  const relative = path.relative(workspace, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label} must stay inside the workspace: ${target}`);
  }
};

ensureInsideWorkspace(sourceRoot, 'Source root');
ensureInsideWorkspace(outputPath, 'Output path');

const readJson = (target) => JSON.parse(fs.readFileSync(target, 'utf8'));

const walkJsonFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkJsonFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.json')) {
      files.push(fullPath);
    }
  }
  return files.sort((a, b) => a.localeCompare(b));
};

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
  if (school === 'GINA') return 'gina-2025';
  if (school === 'KDIGO') return 'kdigo-2026';
  return `${school.toLowerCase()}-${year}`;
};

const titleFromFile = (sourcePath) =>
  path.basename(sourcePath, path.extname(sourcePath)).replace(/\s+/g, ' ').trim();

const folderFromPath = (sourcePath) => {
  const parts = sourcePath.split('/');
  const fileless = parts.slice(0, -1);
  if (parts[0] === 'ADA') return fileless.slice(0, 2).join(' / ');
  return fileless.join(' / ');
};

const shouldSkipChunk = (text) => {
  const compact = text.replace(/\s+/g, ' ').trim();
  if (compact.length < 120) return true;
  if (/^(references|acknowledgments?|disclosures?|contents?)\b/i.test(compact) && compact.length < 700) return true;
  return false;
};

const jsonFiles = walkJsonFiles(sourceRoot);
const chunks = [];
const documents = [];
let skipped = 0;
let duplicateDocuments = 0;
let failedDocuments = 0;

for (const jsonPath of jsonFiles) {
  const structured = readJson(jsonPath);
  if (structured.status === 'duplicate') {
    duplicateDocuments += 1;
    continue;
  }
  if (structured.status !== 'extracted') {
    failedDocuments += 1;
    continue;
  }

  const sourcePath = structured.sourcePath;
  const school = inferSchool(sourcePath);
  const year = inferYear(sourcePath, school);
  const collectionId = inferCollectionId(sourcePath, school, year);
  const sourceTitle = titleFromFile(sourcePath);
  const folderTitle = folderFromPath(sourcePath);
  const collectionTitle = school === 'KDIGO'
    ? 'KDIGO Kidney Guidelines Full Text Library'
    : `${school} ${year} Guidelines Full Text`;

  documents.push({
    sourcePath,
    school,
    year,
    collectionId,
    sourceTitle,
    folderTitle,
    pageCount: structured.pageCount,
    textChars: structured.textChars,
    chunkCount: structured.chunks.length,
  });

  for (const chunk of structured.chunks) {
    if (shouldSkipChunk(chunk.text)) {
      skipped += 1;
      continue;
    }
    chunks.push({
      id: `fulltext:${sourcePath}:${chunk.id}`,
      collectionId,
      collectionTitle,
      school,
      year,
      sourceTitle,
      folderTitle,
      fileTitle: path.basename(sourcePath),
      localFile: sourcePath,
      sourcePath,
      page: chunk.startPage,
      endPage: chunk.endPage,
      label: `${school} ${year} - ${folderTitle ? `${folderTitle} / ` : ''}${sourceTitle} pp. ${chunk.startPage}-${chunk.endPage}`,
      kind: 'full-text',
      text: chunk.text,
    });
  }
}

const output = {
  generatedAt: new Date().toISOString(),
  sourceRoot: path.relative(workspace, sourceRoot).replace(/\\/g, '/'),
  documentCount: documents.length,
  duplicateDocuments,
  failedDocuments,
  chunkCount: chunks.length,
  skippedChunks: skipped,
  documents,
  chunks,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(output)}\n`, 'utf8');

console.log(`Wrote ${chunks.length} chunks from ${documents.length} documents.`);
console.log(path.relative(workspace, outputPath).replace(/\\/g, '/'));
