import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const workspace = process.cwd();
const sourceRoot = process.argv[2] ?? 'guidelines-sources';
const outputRoot = process.argv[3] ?? 'guidelines-sources/_structured/full-text';
const rawRoot = process.argv[4] ?? 'guidelines-sources/_extracted/full-text';
const reportRoot = process.argv[5] ?? 'guidelines-sources/_review/full-text-extraction';

const resolvedSource = path.resolve(sourceRoot);
const resolvedOutput = path.resolve(outputRoot);
const resolvedRaw = path.resolve(rawRoot);
const resolvedReport = path.resolve(reportRoot);

const generatedTopLevelNames = new Set([
  '_assets',
  '_extracted',
  '_inbox',
  '_review',
  '_structured',
]);

const ensureInsideWorkspace = (target, label) => {
  const relative = path.relative(workspace, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label} must stay inside the workspace: ${target}`);
  }
};

ensureInsideWorkspace(resolvedSource, 'Source root');
ensureInsideWorkspace(resolvedOutput, 'Structured output root');
ensureInsideWorkspace(resolvedRaw, 'Raw text output root');
ensureInsideWorkspace(resolvedReport, 'Report output root');

const popplerBinCandidates = [
  process.env.POPPLER_BIN,
  path.join(
    process.env.LOCALAPPDATA ?? '',
    'Microsoft',
    'WinGet',
    'Packages',
    'oschwartz10612.Poppler_Microsoft.Winget.Source_8wekyb3d8bbwe',
    'poppler-25.07.0',
    'Library',
    'bin',
  ),
].filter(Boolean);

const commandExists = (command) => {
  try {
    execFileSync(process.platform === 'win32' ? 'where.exe' : 'which', [command], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

const resolvePopplerCommand = (name) => {
  const exe = process.platform === 'win32' ? `${name}.exe` : name;
  if (commandExists(exe)) return exe;

  for (const candidate of popplerBinCandidates) {
    const fullPath = path.join(candidate, exe);
    if (fs.existsSync(fullPath)) return fullPath;
  }

  return null;
};

const pdftotext = resolvePopplerCommand('pdftotext');
const pdfinfo = resolvePopplerCommand('pdfinfo');
const pdfjs = pdftotext ? null : await import('pdfjs-dist/legacy/build/pdf.mjs');

if (!pdftotext) {
  console.warn('Poppler pdftotext was not found. Falling back to pdfjs-dist text extraction.');
}

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

const run = (command, args, options = {}) =>
  execFileSync(command, args, {
    cwd: workspace,
    encoding: options.encoding ?? 'utf8',
    maxBuffer: options.maxBuffer ?? 1024 * 1024 * 512,
    stdio: options.stdio,
  });

const parsePdfInfo = (pdfPath) => {
  if (!pdfinfo) return {};
  try {
    const raw = run(pdfinfo, [pdfPath]);
    return Object.fromEntries(
      raw
        .split(/\r?\n/)
        .map((line) => line.match(/^([^:]+):\s*(.*)$/))
        .filter(Boolean)
        .map((match) => [match[1].trim(), match[2].trim()]),
    );
  } catch {
    return {};
  }
};

const splitPages = (value) =>
  value
    .split('\f')
    .map(normalizeText)
    .map((page) => page.trim());

const extractPages = (pdfPath, mode) => {
  const raw = run(pdftotext, [mode, '-enc', 'UTF-8', pdfPath, '-']);
  return splitPages(raw);
};

const textFromPdfjsItems = (items) => {
  const rows = [];
  for (const item of items) {
    const text = normalizeText(item.str ?? '');
    if (!text) continue;
    const transform = item.transform ?? [1, 0, 0, 1, 0, 0];
    const x = transform[4] ?? 0;
    const y = transform[5] ?? 0;
    const height = item.height || Math.abs(transform[3]) || 8;
    const row = rows.find((candidate) => Math.abs(candidate.y - y) <= Math.max(2.5, height * 0.45));
    if (row) {
      row.items.push({ text, x, width: item.width ?? 0 });
      row.y = (row.y + y) / 2;
    } else {
      rows.push({ y, items: [{ text, x, width: item.width ?? 0 }] });
    }
  }

  return rows
    .sort((a, b) => b.y - a.y)
    .map((row) => {
      let previous = null;
      return row.items
        .sort((a, b) => a.x - b.x)
        .map((item) => {
          const needsSpace = previous && item.x - (previous.x + previous.width) > 2.5;
          previous = item;
          return `${needsSpace ? ' ' : ''}${item.text}`;
        })
        .join('');
    })
    .join('\n');
};

const extractPagesWithPdfjs = async (pdfPath) => {
  if (!pdfjs) throw new Error('pdfjs fallback is not initialized.');
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const document = await pdfjs.getDocument({
    data,
    disableFontFace: true,
    useSystemFonts: true,
  }).promise;
  const pages = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent({
      disableNormalization: false,
      includeMarkedContent: false,
    });
    pages.push(normalizeText(textFromPdfjsItems(content.items)));
    page.cleanup();
  }
  await document.destroy();
  return pages;
};

const findPdfFiles = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativeFromRoot = path.relative(resolvedSource, fullPath);
    const topLevel = relativeFromRoot.split(path.sep)[0];

    if (entry.isDirectory()) {
      if (generatedTopLevelNames.has(entry.name) || generatedTopLevelNames.has(topLevel)) continue;
      files.push(...findPdfFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
      files.push(fullPath);
    }
  }

  return files.sort((a, b) => a.localeCompare(b));
};

const hashFile = (filePath) => {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
};

const outputPathsFor = (sourcePath) => {
  const relative = path.relative(resolvedSource, sourcePath);
  const parsed = path.parse(relative);
  return {
    sourceRelativePath: relative.replace(/\\/g, '/'),
    structuredPath: path.join(resolvedOutput, parsed.dir, `${parsed.name}.json`),
    textPath: path.join(resolvedRaw, parsed.dir, `${parsed.name}.txt`),
  };
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

const writeJson = (target, value) => {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};

const writeText = (target, value) => {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${value.trim()}\n`, 'utf8');
};

fs.mkdirSync(resolvedOutput, { recursive: true });
fs.mkdirSync(resolvedRaw, { recursive: true });
fs.mkdirSync(resolvedReport, { recursive: true });

const startedAt = new Date().toISOString();
const pdfFiles = findPdfFiles(resolvedSource);
const seenByHash = new Map();
const manifest = {
  generatedAt: startedAt,
  sourceRoot: path.relative(workspace, resolvedSource).replace(/\\/g, '/'),
  structuredRoot: path.relative(workspace, resolvedOutput).replace(/\\/g, '/'),
  rawTextRoot: path.relative(workspace, resolvedRaw).replace(/\\/g, '/'),
  reportRoot: path.relative(workspace, resolvedReport).replace(/\\/g, '/'),
  totalPdfCount: pdfFiles.length,
  extractedCount: 0,
  duplicateCount: 0,
  failedCount: 0,
  totalTextChars: 0,
  files: [],
};

for (const [index, pdfPath] of pdfFiles.entries()) {
  const paths = outputPathsFor(pdfPath);
  const displayIndex = `${index + 1}/${pdfFiles.length}`;

  try {
    const fileHash = hashFile(pdfPath);
    const canonical = seenByHash.get(fileHash);

    if (canonical) {
      const duplicateRecord = {
        status: 'duplicate',
        sourcePath: paths.sourceRelativePath,
        sha256: fileHash,
        duplicateOf: canonical.sourcePath,
        canonicalStructuredPath: canonical.structuredPath,
        canonicalTextPath: canonical.textPath,
      };
      writeJson(paths.structuredPath, duplicateRecord);
      manifest.files.push({
        ...duplicateRecord,
        structuredPath: path.relative(workspace, paths.structuredPath).replace(/\\/g, '/'),
      });
      manifest.duplicateCount += 1;
      console.log(`[${displayIndex}] duplicate  ${paths.sourceRelativePath}`);
      continue;
    }

    const info = parsePdfInfo(pdfPath);
    const layoutPages = pdftotext ? extractPages(pdfPath, '-layout') : await extractPagesWithPdfjs(pdfPath);
    const rawPages = pdftotext ? extractPages(pdfPath, '-raw') : layoutPages;
    const pageCount = Math.max(layoutPages.length, rawPages.length);
    const pages = Array.from({ length: pageCount }, (_, pageIndex) => {
      const layoutText = normalizeText(layoutPages[pageIndex] ?? '');
      const rawText = normalizeText(rawPages[pageIndex] ?? '');
      const text = layoutText.length >= rawText.length * 0.72 ? layoutText : rawText;
      return {
        pageNumber: pageIndex + 1,
        text,
        layoutText,
        rawText,
        charCount: text.length,
      };
    });
    const chunks = buildChunks(pages);
    const allText = pages
      .map((page) => [`--- Page ${page.pageNumber} ---`, page.text].join('\n'))
      .join('\n\n');
    const textChars = pages.reduce((total, page) => total + page.text.length, 0);

    const structured = {
      status: 'extracted',
      sourcePath: paths.sourceRelativePath,
      sha256: fileHash,
      extractedAt: new Date().toISOString(),
      extractionMethod: 'poppler pdftotext layout+raw',
      pdfInfo: info,
      pageCount,
      textChars,
      pages,
      chunks,
    };

    writeText(paths.textPath, allText);
    writeJson(paths.structuredPath, structured);

    const structuredRelativePath = path.relative(workspace, paths.structuredPath).replace(/\\/g, '/');
    const textRelativePath = path.relative(workspace, paths.textPath).replace(/\\/g, '/');
    const sourceRecord = {
      sourcePath: paths.sourceRelativePath,
      structuredPath: structuredRelativePath,
      textPath: textRelativePath,
    };
    seenByHash.set(fileHash, sourceRecord);
    manifest.files.push({
      status: 'extracted',
      ...sourceRecord,
      sha256: fileHash,
      pageCount,
      textChars,
      chunkCount: chunks.length,
      title: info.Title,
    });
    manifest.extractedCount += 1;
    manifest.totalTextChars += textChars;
    console.log(`[${displayIndex}] extracted  ${paths.sourceRelativePath}  (${pageCount} pages, ${textChars} chars)`);
  } catch (error) {
    const failedRecord = {
      status: 'failed',
      sourcePath: paths.sourceRelativePath,
      error: error instanceof Error ? error.message : String(error),
      structuredPath: path.relative(workspace, paths.structuredPath).replace(/\\/g, '/'),
    };
    writeJson(paths.structuredPath, failedRecord);
    manifest.files.push(failedRecord);
    manifest.failedCount += 1;
    console.error(`[${displayIndex}] failed     ${paths.sourceRelativePath}: ${failedRecord.error}`);
  }
}

manifest.finishedAt = new Date().toISOString();
writeJson(path.join(resolvedReport, 'manifest.json'), manifest);

console.log('');
console.log(`Done. Extracted ${manifest.extractedCount}, duplicates ${manifest.duplicateCount}, failed ${manifest.failedCount}.`);
console.log(`Structured: ${manifest.structuredRoot}`);
console.log(`Raw text:   ${manifest.rawTextRoot}`);
console.log(`Report:     ${path.relative(workspace, path.join(resolvedReport, 'manifest.json')).replace(/\\/g, '/')}`);
