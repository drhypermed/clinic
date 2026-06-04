import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const sourceRoot = path.resolve('guidelines-sources/ACP');
const structuredRoot = path.resolve('guidelines-sources/_structured/full-text/ACP');
const extractedRoot = path.resolve('guidelines-sources/_extracted/full-text/ACP');

// Ensure target directories exist
fs.mkdirSync(structuredRoot, { recursive: true });
fs.mkdirSync(extractedRoot, { recursive: true });

const walkTextFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith('_')) continue;
      files.push(...walkTextFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.txt')) {
      files.push(fullPath);
    }
  }
  return files;
};

const normalizeText = (value) =>
  value
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
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
    buffer = text.slice(Math.max(0, text.length - overlapChars));
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

const splitTextIntoPages = (text, pageSize = 3000) => {
  const lines = text.split('\n');
  const pages = [];
  let currentPage = [];
  let currentLength = 0;

  for (const line of lines) {
    currentPage.push(line);
    currentLength += line.length + 1; // +1 for the newline
    if (currentLength >= pageSize) {
      pages.push(currentPage.join('\n'));
      currentPage = [];
      currentLength = 0;
    }
  }
  if (currentPage.length > 0) {
    pages.push(currentPage.join('\n'));
  }
  return pages.map((pageText, index) => ({
    pageNumber: index + 1,
    text: pageText,
    charCount: pageText.length
  }));
};

const files = walkTextFiles(sourceRoot);
console.log(`Found ${files.length} ACP guidelines files in text format.`);

let totalProcessed = 0;
for (const txtPath of files) {
  const rawText = fs.readFileSync(txtPath, 'utf8');
  const sourceRelative = path.relative(path.resolve('guidelines-sources'), txtPath).replace(/\\/g, '/');
  const sha256 = crypto.createHash('sha256').update(rawText).digest('hex');
  
  const pages = splitTextIntoPages(rawText, 3000);
  const chunks = buildChunks(pages, 2400, 350);
  const textChars = rawText.length;
  
  // Clean [2024] - prefix if exists
  const title = path.basename(txtPath, '.txt').replace(/^\[.*?\]\s*-\s*/, '');
  
  const structured = {
    status: 'extracted',
    sourcePath: sourceRelative,
    sha256,
    extractedAt: new Date().toISOString(),
    extractionMethod: 'manual plain text chunking and page splitting',
    pdfInfo: {
      Title: title
    },
    pageCount: pages.length,
    textChars,
    pages,
    chunks
  };
  
  const structuredPath = path.join(path.resolve('guidelines-sources/_structured/full-text'), sourceRelative.replace('.txt', '.json'));
  fs.mkdirSync(path.dirname(structuredPath), { recursive: true });
  fs.writeFileSync(structuredPath, JSON.stringify(structured, null, 2), 'utf8');
  
  const extractedPath = path.join(path.resolve('guidelines-sources/_extracted/full-text'), sourceRelative);
  fs.mkdirSync(path.dirname(extractedPath), { recursive: true });
  fs.writeFileSync(extractedPath, rawText, 'utf8');
  
  totalProcessed++;
  console.log(`[${totalProcessed}/${files.length}] Structured: ${sourceRelative} -> ${chunks.length} chunks on ${pages.length} pages.`);
}

console.log(`Successfully structured and extracted all ${totalProcessed} ACP guideline documents.`);
