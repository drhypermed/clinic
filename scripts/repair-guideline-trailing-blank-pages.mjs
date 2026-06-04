import fs from 'node:fs';
import path from 'node:path';

const workspace = process.cwd();
const structuredRoot = path.resolve('guidelines-sources/_structured/full-text');
const rawRoot = path.resolve('guidelines-sources/_extracted/full-text');
const dataRoot = path.resolve('components/guidelines/data');

const rel = (target) => path.relative(workspace, target).replace(/\\/g, '/');

const normalizeText = (value) =>
  String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/([A-Za-z])\u00ad\s*\n\s*([a-z])/g, '$1$2')
    .replace(/([A-Za-z])-\s*\n\s*([a-z])/g, '$1$2')
    .replace(/\u00ad/g, '')
    .replace(/\ufb01/g, 'fi')
    .replace(/\ufb02/g, 'fl')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/[ \t]{3,}/g, '  ')
    .replace(/\n{5,}/g, '\n\n\n\n')
    .trim();

const compactText = (value) =>
  normalizeText(value)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');

const getOverlapText = (text, overlapChars) => {
  if (!text || text.length <= overlapChars) return text;
  const roughStart = Math.max(0, text.length - overlapChars);
  const nextWhitespace = text.slice(roughStart).search(/\s/);
  const start = nextWhitespace >= 0 ? roughStart + nextWhitespace + 1 : roughStart;
  return text.slice(start).trim();
};

const buildChunks = (pages, maxChars = 2400, overlapChars = 350) => {
  const chunks = [];
  let buffer = '';
  let startPage = 1;

  const flush = (endPage) => {
    const text = compactText(buffer);
    if (text.length < 80) {
      buffer = '';
      return;
    }
    chunks.push({
      id: `chunk-${String(chunks.length + 1).padStart(4, '0')}`,
      startPage,
      endPage,
      text,
      charCount: text.length,
    });
    buffer = getOverlapText(text, overlapChars);
    startPage = endPage;
  };

  pages.forEach((page, index) => {
    const pageNumber = index + 1;
    const pageText = compactText(page.text);
    if (!pageText) return;
    if (!buffer) startPage = pageNumber;
    buffer = `${buffer}\n\n${pageText}`.trim();
    while (buffer.length >= maxChars) {
      flush(pageNumber);
    }
  });

  if (buffer.trim()) flush(pages.at(-1)?.pageNumber ?? startPage);
  return chunks;
};

const readJson = (target) => JSON.parse(fs.readFileSync(target, 'utf8'));
const writeJson = (target, value) => fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const writeText = (target, value) => {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${value.trim()}\n`, 'utf8');
};

const walkFiles = (dir, extension) => {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath, extension));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(extension)) {
      files.push(fullPath);
    }
  }
  return files.sort((a, b) => a.localeCompare(b));
};

const storedPdfPageCount = (payload) => Number(
  payload.pdfInfo?.Pages
  || payload.pdfInfo?.pages
  || payload.pdfInfo?.PageCount
  || 0,
);

const isTrailingBlankPageBug = (payload) => {
  if (payload.status !== 'extracted') return false;
  if (!/\.pdf$/i.test(payload.sourcePath || '')) return false;
  if (!Array.isArray(payload.pages) || payload.pages.length === 0) return false;
  const pdfPages = storedPdfPageCount(payload);
  if (!pdfPages || Number(payload.pageCount || 0) !== pdfPages + 1) return false;
  const last = payload.pages.at(-1);
  return !compactText(last?.text) && !compactText(last?.layoutText) && !compactText(last?.rawText);
};

const sourceRecordUpdates = new Map();
let repaired = 0;

for (const jsonPath of walkFiles(structuredRoot, '.json')) {
  const payload = readJson(jsonPath);
  if (!isTrailingBlankPageBug(payload)) continue;

  const pdfPages = storedPdfPageCount(payload);
  const pages = payload.pages.slice(0, pdfPages).map((page, index) => ({
    ...page,
    pageNumber: index + 1,
  }));
  const chunks = buildChunks(pages);
  const textChars = pages.reduce((total, page) => total + String(page.text || '').length, 0);
  const updated = {
    ...payload,
    pageCount: pdfPages,
    textChars,
    pages,
    chunks,
  };

  writeJson(jsonPath, updated);

  const rawPath = path.join(rawRoot, payload.sourcePath.replace(/\.pdf$/i, '.txt').replace(/\//g, path.sep));
  const rawText = pages
    .map((page) => [`--- Page ${page.pageNumber} ---`, page.text].join('\n'))
    .join('\n\n');
  writeText(rawPath, rawText);

  sourceRecordUpdates.set(rel(jsonPath), {
    pageCount: pdfPages,
    textChars,
    chunkCount: chunks.length,
  });
  repaired += 1;
}

let sourceFilesUpdated = 0;
for (const sourceFile of walkFiles(dataRoot, '.ts')) {
  let text = fs.readFileSync(sourceFile, 'utf8');
  const original = text;
  for (const [structuredTextPath, update] of sourceRecordUpdates) {
    if (!text.includes(`"structuredTextPath": "${structuredTextPath}"`)) continue;
    const escaped = structuredTextPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const recordPattern = new RegExp(`(\\{[\\s\\S]*?"structuredTextPath":\\s*"${escaped}"[\\s\\S]*?\\n\\s*\\})`, 'g');
    text = text.replace(recordPattern, (record) =>
      record
        .replace(/"pageCount":\s*\d+/, `"pageCount": ${update.pageCount}`)
        .replace(/"textChars":\s*\d+/, `"textChars": ${update.textChars}`)
        .replace(/"chunkCount":\s*\d+/, `"chunkCount": ${update.chunkCount}`),
    );
  }
  if (text !== original) {
    fs.writeFileSync(sourceFile, text, 'utf8');
    sourceFilesUpdated += 1;
  }
}

console.log(JSON.stringify({
  repairedStructuredFiles: repaired,
  updatedSourceRecords: sourceRecordUpdates.size,
  sourceFilesUpdated,
}, null, 2));
