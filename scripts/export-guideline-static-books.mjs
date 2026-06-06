import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';

const workspace = process.cwd();
const args = process.argv.slice(2);
const sourceRoot = path.resolve('guidelines-sources/_structured/full-text');
const outputRoot = path.resolve('guidelines-sources/_generated/static-books');
const onlyFilters = args
  .filter((arg) => arg.startsWith('--only='))
  .flatMap((arg) => arg.slice('--only='.length).split(','))
  .map((value) => value.trim().replace(/\\/g, '/').toLowerCase())
  .filter(Boolean);

const ensureInsideWorkspace = (target, label) => {
  const relative = path.relative(workspace, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label} must stay inside the workspace: ${target}`);
  }
};

ensureInsideWorkspace(sourceRoot, 'Source root');
ensureInsideWorkspace(outputRoot, 'Output root');

const rel = (target) => path.relative(workspace, target).replace(/\\/g, '/');
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

const matchesOnlyFilter = (value) => {
  if (onlyFilters.length === 0) return true;
  const normalized = value.replace(/\\/g, '/').toLowerCase();
  const school = normalized.split('/')[0];
  return onlyFilters.some((filter) => (
    normalized === filter
    || normalized.startsWith(`${filter}/`)
    || school === filter
    || (filter.includes('/') && normalized.includes(filter))
  ));
};

const slug = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180);

const makeBookId = (sourcePath) => slug(sourcePath.replace(/\.pdf$/i, '')) || crypto.createHash('sha1').update(sourcePath).digest('hex');
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
  if (school === 'Endocrine') return 'endocrine-2026';
  if (school === 'ACG') return 'acg-2026';
  if (school === 'AGA') return 'aga-2026';
  if (school === 'AAP') return 'aap-2026';
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
  return fileless.join(' / ');
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

const detectHeading = (text) => {
  const lines = String(text || '').split(/\n/).map((line) => line.trim()).filter(Boolean);
  return lines.find((line) => line.length >= 8 && line.length <= 140 && !/[.!?]$/.test(line)) || '';
};

const formatPageRangeForLabel = (startPage, endPage) =>
  endPage && endPage !== startPage ? ` pp. ${startPage}-${endPage}` : ` p. ${startPage}`;

const writeJsonWithGzip = (target, payload) => {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const json = `${JSON.stringify(payload)}\n`;
  fs.writeFileSync(target, json, 'utf8');
  fs.writeFileSync(`${target}.gz`, zlib.gzipSync(json, { level: 9 }));
  return {
    path: rel(target),
    gzipPath: rel(`${target}.gz`),
    bytes: Buffer.byteLength(json),
    gzipBytes: fs.statSync(`${target}.gz`).size,
    sha256: crypto.createHash('sha256').update(json).digest('hex'),
  };
};

const collections = new Map();
let skippedDocuments = 0;
let skippedChunks = 0;

for (const jsonPath of walkJsonFiles(sourceRoot)) {
  const structured = readJson(jsonPath);
  const sourcePath = structured.sourcePath || rel(jsonPath, sourceRoot).replace(/\.json$/i, '.pdf');
  if (!matchesOnlyFilter(sourcePath)) continue;
  if (structured.status !== 'extracted' || !Array.isArray(structured.chunks)) {
    skippedDocuments += 1;
    continue;
  }

  const school = inferSchool(sourcePath);
  const year = inferYear(sourcePath, school);
  const collectionId = inferCollectionId(sourcePath, school, year);
  const collection = collections.get(collectionId) ?? { books: [], chunkCount: 0, textChars: 0 };
  const bookId = makeBookId(sourcePath);
  const sourceTitle = titleFromFile(sourcePath);
  const folderTitle = folderFromPath(sourcePath);
  const fileTitle = path.basename(sourcePath);
  let globalOrder = 0;

  const book = {
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
    chunkCount: 0,
    sha256: structured.sha256 || '',
    extractionMethod: structured.extractionMethod || '',
    extractedAt: structured.extractedAt || '',
    status: 'active',
  };

  const chunks = [];
  for (const chunk of structured.chunks) {
    const chunkIndex = Number(String(chunk.id || '').match(/(\d+)$/)?.[1] || chunks.length + 1);
    const pageStart = Number(chunk.startPage || 0);
    const pageEnd = Number(chunk.endPage || pageStart || 0);
    const text = cleanChunkText(chunk.text);
    if (shouldSkipChunk(chunk, sourcePath)) {
      skippedChunks += 1;
      continue;
    }
    globalOrder += 1;
    const chunkId = `${bookId}:${String(chunkIndex).padStart(5, '0')}`;
    const label = `${school} ${year} - ${folderTitle ? `${folderTitle} / ` : ''}${sourceTitle}${formatPageRangeForLabel(pageStart, pageEnd)}`;
    chunks.push({
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
      heading: detectHeading(text),
      text,
      textCharCount: text.length,
      kind: 'full-text',
      status: 'active',
    });
  }

  book.chunkCount = chunks.length;
  const bookPayload = {
    generatedAt: new Date().toISOString(),
    sourceRoot: rel(sourceRoot),
    book,
    chunks,
  };
  const bookOutput = writeJsonWithGzip(path.join(outputRoot, collectionId, 'books', `${bookId}.json`), bookPayload);
  collection.books.push({
    ...book,
    staticJsonPath: `${collectionId}/books/${bookId}.json`,
    staticGzipPath: `${collectionId}/books/${bookId}.json.gz`,
    staticJsonBytes: bookOutput.bytes,
    staticGzipBytes: bookOutput.gzipBytes,
    staticSha256: bookOutput.sha256,
  });
  collection.chunkCount += chunks.length;
  collection.textChars += chunks.reduce((sum, item) => sum + item.text.length, 0);
  collections.set(collectionId, collection);
}

const manifests = [];
for (const [collectionId, collection] of collections.entries()) {
  collection.books.sort((a, b) => a.sourcePath.localeCompare(b.sourcePath));
  const manifest = {
    generatedAt: new Date().toISOString(),
    formatVersion: 1,
    collectionId,
    bookCount: collection.books.length,
    chunkCount: collection.chunkCount,
    textChars: collection.textChars,
    books: collection.books,
  };
  const manifestOutput = writeJsonWithGzip(path.join(outputRoot, collectionId, 'manifest.json'), manifest);
  manifests.push({
    collectionId,
    bookCount: collection.books.length,
    chunkCount: collection.chunkCount,
    manifestPath: manifestOutput.path,
    manifestGzipPath: manifestOutput.gzipPath,
    manifestBytes: manifestOutput.bytes,
    manifestGzipBytes: manifestOutput.gzipBytes,
  });
}

console.log(JSON.stringify({
  outputRoot: rel(outputRoot),
  collections: manifests,
  skippedDocuments,
  skippedChunks,
}, null, 2));
