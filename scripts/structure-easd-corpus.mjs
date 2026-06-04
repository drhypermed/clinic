import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const sourceRoot = path.resolve('guidelines-sources/EASD/extracted');
const structuredRoot = path.resolve('guidelines-sources/_structured/full-text/EASD');
const extractedRoot = path.resolve('guidelines-sources/_extracted/full-text/EASD');

// Ensure target directories exist
fs.mkdirSync(structuredRoot, { recursive: true });
fs.mkdirSync(extractedRoot, { recursive: true });

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

const main = () => {
  if (!fs.existsSync(sourceRoot)) {
    console.error(`Source directory does not exist: ${sourceRoot}`);
    return;
  }

  const files = fs.readdirSync(sourceRoot).filter((file) => file.toLowerCase().endsWith('.txt'));
  console.log(`Found ${files.length} EASD guideline text files.`);

  let totalProcessed = 0;
  for (const file of files) {
    const txtPath = path.join(sourceRoot, file);
    const rawText = fs.readFileSync(txtPath, 'utf8');
    
    // In GINA/ACP source relative is school/filename.pdf
    const pdfName = `${path.basename(file, '.txt')}.pdf`;
    const sourceRelative = `EASD/${pdfName}`;
    const sha256 = crypto.createHash('sha256').update(rawText).digest('hex');
    
    const pages = splitTextIntoPages(rawText, 3000);
    const chunks = buildChunks(pages, 2400, 350);
    const textChars = rawText.length;
    
    const title = path.basename(file, '.txt');
    
    const structured = {
      status: 'extracted',
      sourcePath: sourceRelative,
      sha256,
      extractedAt: new Date().toISOString(),
      extractionMethod: 'pdfjs-dist text extraction and manual page splitting',
      pdfInfo: {
        Title: title
      },
      pageCount: pages.length,
      textChars,
      pages,
      chunks
    };
    
    const structuredJsonPath = path.join(structuredRoot, `${path.basename(file, '.txt')}.json`);
    fs.mkdirSync(path.dirname(structuredJsonPath), { recursive: true });
    fs.writeFileSync(structuredJsonPath, JSON.stringify(structured, null, 2), 'utf8');
    
    const extractedTxtPath = path.join(extractedRoot, file);
    fs.mkdirSync(path.dirname(extractedTxtPath), { recursive: true });
    fs.writeFileSync(extractedTxtPath, rawText, 'utf8');
    
    totalProcessed++;
    console.log(`[${totalProcessed}/${files.length}] Structured: ${sourceRelative} -> ${chunks.length} chunks on ${pages.length} pages.`);
  }

  console.log(`Successfully structured and extracted all ${totalProcessed} EASD guideline documents.`);
};

main();
