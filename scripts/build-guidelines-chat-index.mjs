import fs from 'node:fs';
import path from 'node:path';

const workspace = process.cwd();
const sourceRoot = path.resolve(process.argv[2] ?? 'guidelines-sources/_structured/full-text');
const outputPath = path.resolve(process.argv[3] ?? 'guidelines-sources/_generated/full-text-index.json');

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
  if (parts[0] === 'Endocrine') return ['Endocrine Society Guidelines', ...fileless.slice(1)].join(' / ');
  if (parts[0] === 'ACG') return ['ACG Guidelines', ...fileless.slice(1)].join(' / ');
  if (parts[0] === 'AGA') return ['AGA Clinical Guidance', ...fileless.slice(1)].join(' / ');
  if (parts[0] === 'AAP') return ['AAP Clinical Practice Guidelines', ...fileless.slice(1)].join(' / ');
  if (parts[0] === 'CDC_ACIP') return ['CDC ACIP Vaccine Recommendations', ...fileless.slice(1)].join(' / ');
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
  if (etAlCount >= 8 || numberedCitationCount >= 8) return true;
  return false;
};

const hasReliablePdfPageNumbers = (sourcePath) => /\.pdf$/i.test(String(sourcePath || ''));

const formatPageRangeForLabel = (sourcePath, startPage, endPage) => {
  if (!hasReliablePdfPageNumbers(sourcePath) || !startPage) return '';
  return endPage && endPage !== startPage ? ` pp. ${startPage}-${endPage}` : ` p. ${startPage}`;
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
  const collectionTitle =
    school === 'KDIGO'
      ? 'KDIGO Kidney Guidelines Full Text Library'
      : school === 'Endocrine'
        ? 'Endocrine Society Guidelines'
        : school === 'ACG'
          ? 'ACG Guidelines'
          : school === 'AGA'
            ? 'AGA Clinical Guidance'
            : school === 'AAP'
              ? 'AAP Clinical Practice Guidelines'
              : school === 'CDC_ACIP'
                ? 'CDC ACIP Vaccine Recommendations'
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
    const text = cleanChunkText(chunk.text);
    if (shouldSkipChunk(chunk, sourcePath)) {
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
      label: `${school} ${year} - ${folderTitle ? `${folderTitle} / ` : ''}${sourceTitle}${formatPageRangeForLabel(sourcePath, chunk.startPage, chunk.endPage)}`,
      kind: 'full-text',
      text,
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
