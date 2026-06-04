/**
 * Extract full text from EASD PDFs using pdfjs-dist for 100% accuracy.
 * Run: node scripts/extract-easd-text.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

const sourceDir = path.resolve('guidelines-sources/EASD');
const outputDir = path.resolve('guidelines-sources/EASD/extracted');
fs.mkdirSync(outputDir, { recursive: true });

const normalizeText = (value) =>
  String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/\ufb01/g, 'fi')
    .replace(/\ufb02/g, 'fl')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();

const extractPdfText = async (pdfPath) => {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const document = await pdfjs.getDocument({
    data,
    disableWorker: true,
    useSystemFonts: true,
  }).promise;

  const pagesText = [];
  for (let pageNum = 1; pageNum <= document.numPages; pageNum++) {
    const page = await document.getPage(pageNum);
    const content = await page.getTextContent({
      includeMarkedContent: false,
      disableNormalization: false,
    });
    
    // Sort items by layout coordinates y descending, then x ascending
    const items = content.items.filter((item) => item.str?.trim());
    
    // Reconstruct lines by grouping items with similar y coordinate
    const rows = [];
    for (const item of items) {
      const text = item.str;
      const transform = item.transform || [1, 0, 0, 1, 0, 0];
      const x = transform[4] || 0;
      const y = transform[5] || 0;
      
      const row = rows.find((r) => Math.abs(r.y - y) <= 4);
      if (row) {
        row.items.push({ text, x, width: item.width || 0 });
      } else {
        rows.push({ y, items: [{ text, x, width: item.width || 0 }] });
      }
    }
    
    // Sort rows by y coordinate descending
    rows.sort((a, b) => b.y - a.y);
    
    const pageLines = rows.map((row) => {
      // Sort items within each row by x coordinate ascending
      row.items.sort((a, b) => a.x - b.x);
      let rowText = '';
      let prev = null;
      for (const item of row.items) {
        if (prev && item.x - (prev.x + prev.width) > 3) {
          rowText += ' ';
        }
        rowText += item.text;
        prev = item;
      }
      return rowText.trim();
    });

    pagesText.push(pageLines.join('\n'));
  }
  
  return pagesText.join('\n\n\f\n\n'); // \f as page separator
};

const main = async () => {
  console.log(`Starting pdfjs-dist text extraction from ${sourceDir}`);
  const files = fs.readdirSync(sourceDir).filter((file) => file.toLowerCase().endsWith('.pdf'));
  
  for (const file of files) {
    const pdfPath = path.join(sourceDir, file);
    // Ignore empty/redirect files that are too small (e.g. less than 100KB)
    if (fs.statSync(pdfPath).size < 100 * 1024) {
      console.log(`Skipping small/incomplete file: ${file}`);
      continue;
    }
    
    const outputName = `${path.basename(file, '.pdf')}.txt`;
    const outputPath = path.join(outputDir, outputName);
    
    console.log(`Extracting: ${file} ...`);
    try {
      const text = await extractPdfText(pdfPath);
      const normalized = normalizeText(text);
      fs.writeFileSync(outputPath, normalized, 'utf8');
      console.log(`Saved: ${outputName} (${normalized.length.toLocaleString()} characters)`);
    } catch (error) {
      console.error(`Error extracting ${file}:`, error.message);
    }
  }
  console.log('Text extraction complete.');
};

main().catch(console.error);
