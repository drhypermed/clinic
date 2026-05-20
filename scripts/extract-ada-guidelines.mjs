import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

const sourceDir = process.argv[2] ?? 'guidelines-sources/ADA/2025';
const outputDir = process.argv[3] ?? 'guidelines-sources/_structured/ADA/2025';
const assetDir = process.argv[4] ?? 'guidelines-sources/_assets/ADA/2025';

const workspace = process.cwd();
const resolvedSource = path.resolve(sourceDir);
const resolvedOutput = path.resolve(outputDir);
const resolvedAssets = path.resolve(assetDir);

const ensureInsideWorkspace = (target, label) => {
  const relative = path.relative(workspace, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label} must stay inside the workspace: ${target}`);
  }
};

ensureInsideWorkspace(resolvedSource, 'Source directory');
ensureInsideWorkspace(resolvedOutput, 'Output directory');
ensureInsideWorkspace(resolvedAssets, 'Asset directory');

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
    execFileSync(process.platform === 'win32' ? 'where.exe' : 'which', [command], {
      stdio: 'ignore',
    });
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
const pdfimages = resolvePopplerCommand('pdfimages');
const pdfinfo = resolvePopplerCommand('pdfinfo');
const pdftoppm = resolvePopplerCommand('pdftoppm');

if (!pdftotext) {
  throw new Error('Poppler pdftotext was not found. Install Poppler or set POPPLER_BIN to its bin folder.');
}

fs.mkdirSync(resolvedOutput, { recursive: true });
fs.mkdirSync(resolvedAssets, { recursive: true });

const normalizeText = (value) =>
  repairCommonMojibake(repairMojibake(value))
    .replace(/\r\n/g, '\n')
    .replace(/\u00c2([\u2010-\u2015])/g, '$1')
    .replace(/\u00c2/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/\u0001/g, '-')
    .replace(/\u000e/g, '•')
    .replace(/\u000f/g, '•')
    .replace(/\ufb01/g, 'fi')
    .replace(/\ufb02/g, 'fl')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();

const slugify = (value) =>
  value
    .normalize('NFKD')
    .replace(/[^\w.\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 90)
    .toLowerCase();

const resetDirectory = (target) => {
  ensureInsideWorkspace(target, 'Reset directory');
  fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(target, { recursive: true });
};

const run = (command, args, options = {}) =>
  execFileSync(command, args, {
    cwd: workspace,
    encoding: options.encoding ?? 'utf8',
    maxBuffer: options.maxBuffer ?? 1024 * 1024 * 256,
    stdio: options.stdio,
  });

const windows1252Bytes = new Map([
  [0x20ac, 0x80],
  [0x201a, 0x82],
  [0x0192, 0x83],
  [0x201e, 0x84],
  [0x2026, 0x85],
  [0x2020, 0x86],
  [0x2021, 0x87],
  [0x02c6, 0x88],
  [0x2030, 0x89],
  [0x0160, 0x8a],
  [0x2039, 0x8b],
  [0x0152, 0x8c],
  [0x017d, 0x8e],
  [0x2018, 0x91],
  [0x2019, 0x92],
  [0x201c, 0x93],
  [0x201d, 0x94],
  [0x2022, 0x95],
  [0x2013, 0x96],
  [0x2014, 0x97],
  [0x02dc, 0x98],
  [0x2122, 0x99],
  [0x0161, 0x9a],
  [0x203a, 0x9b],
  [0x0153, 0x9c],
  [0x017e, 0x9e],
  [0x0178, 0x9f],
]);

const repairMojibake = (value) => {
  if (!/[\u00c2\u00c3\u00e2]/.test(value)) return value;
  const bytes = [];
  for (const char of value) {
    const code = char.codePointAt(0);
    if (code <= 0xff) bytes.push(code);
    else if (windows1252Bytes.has(code)) bytes.push(windows1252Bytes.get(code));
    else return value;
  }
  const repaired = Buffer.from(bytes).toString('utf8');
  return repaired.includes('\uFFFD') ? value : repaired;
};

const repairCommonMojibake = (value) =>
  value
    .replace(/\u00e2\u20ac\u201c/g, '\u2013')
    .replace(/\u00e2\u20ac\u201d/g, '\u2014')
    .replace(/\u00e2\u20ac\u02dc/g, '\u2018')
    .replace(/\u00e2\u20ac\u2122/g, '\u2019')
    .replace(/\u00e2\u20ac\u0153/g, '\u201c')
    .replace(/\u00e2\u20ac[\u009d\uFFFD]/g, '\u201d')
    .replace(/\u00e2\u20ac\u00a2/g, '\u2022')
    .replace(/\u00e2\u2030\u00a5/g, '\u2265')
    .replace(/\u00e2\u2030\u00a4/g, '\u2264')
    .replace(/\u00e2\u20ac\u00a0/g, '\u2020')
    .replace(/\u00e2\u20ac\u00a1/g, '\u2021')
    .replace(/\u00c3\u2014/g, '\u00d7')
    .replace(/\u00c2\u00a7/g, '\u00a7')
    .replace(/\u00c2\u00a9/g, '\u00a9')
    .replace(/\u00c2\u00b1/g, '\u00b1')
    .replace(/\u00c2/g, '');

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

const cleanPageLines = (pageText) => {
  const lines = normalizeText(repairMojibake(pageText))
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.filter((line) => {
    if (/^Downloaded from https?:\/\/diabetesjournals\.org\//i.test(line)) return false;
    if (/^Diabetes Care Volume 48, Supplement 1, January 2025$/i.test(line)) return false;
    if (/^© 2024 by the American Diabetes Association\.?$/i.test(line)) return false;
    if (/^Readers may use this article as long as/i.test(line)) return false;
    if (/^More information is available at https?:\/\/www/i.test(line)) return false;
    if (/^Suggested citation:/i.test(line)) return false;
    if (/^\*A complete list of members/i.test(line)) return false;
    if (/^Duality of interest information/i.test(line)) return false;
    return true;
  });
};

const textFromPoppler = (pdfPath, mode = '-layout') => {
  const raw = run(pdftotext, [mode, '-enc', 'UTF-8', path.relative(workspace, pdfPath), '-']);
  return raw.split('\f').map((page) => cleanPageLines(page).join('\n'));
};

const lineText = (items) => {
  const sorted = [...items].sort((a, b) => a.x - b.x);
  let text = '';
  let previous = null;
  for (const item of sorted) {
    if (previous && item.x - (previous.x + previous.width) > Math.max(2.5, previous.height * 0.35)) {
      text += ' ';
    }
    text += item.text;
    previous = item;
  }
  return normalizeText(text);
};

const pageTextFromLayout = (page) => {
  if (!page?.items?.length) return '';
  const usefulItems = page.items.filter((item) => {
    if (item.y < 28 || item.y > page.height - 24) return false;
    if (/^Downloaded from https?:\/\//i.test(item.text)) return false;
    return true;
  });

  const hasDenseColumns =
    usefulItems.some((item) => item.x > page.width * 0.25 && item.x < page.width * 0.45) &&
    usefulItems.some((item) => item.x > page.width * 0.52);
  const bands = hasDenseColumns
    ? [
        [0, page.width * 0.34],
        [page.width * 0.34, page.width * 0.67],
        [page.width * 0.67, page.width],
      ]
    : [
        [0, page.width * 0.5],
        [page.width * 0.5, page.width],
      ];

  const lines = [];
  for (const [minX, maxX] of bands) {
    const bandItems = usefulItems.filter((item) => item.x >= minX && item.x < maxX);
    const rows = [];
    for (const item of bandItems) {
      const row = rows.find((candidate) => Math.abs(candidate.y - item.y) <= Math.max(2.2, item.height * 0.35));
      if (row) {
        row.items.push(item);
        row.y = Math.min(row.y, item.y);
      } else {
        rows.push({ y: item.y, items: [item] });
      }
    }
    rows.sort((a, b) => a.y - b.y);
    for (const row of rows) {
      const text = lineText(row.items);
      if (text) lines.push(text);
    }
  }

  return cleanPageLines(lines.join('\n')).join('\n');
};

const pdfjsPageModel = async (pdfPath) => {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const document = await pdfjs.getDocument({
    data,
    disableWorker: true,
    useSystemFonts: true,
  }).promise;

  const pages = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent({
      includeMarkedContent: false,
      disableNormalization: false,
    });
    const items = content.items
      .filter((item) => item.str?.trim())
      .map((item) => ({
        text: normalizeText(item.str),
        x: Number(item.transform[4].toFixed(2)),
        y: Number((viewport.height - item.transform[5]).toFixed(2)),
        width: Number(item.width.toFixed(2)),
        height: Number(item.height.toFixed(2)),
        font: item.fontName,
      }));
    pages.push({
      page: pageNumber,
      width: Number(viewport.width.toFixed(2)),
      height: Number(viewport.height.toFixed(2)),
      items,
    });
  }
  return pages;
};

const recommendationTextFromItems = (items) => {
  const rows = [];
  for (const item of items) {
    const row = rows.find((candidate) => Math.abs(candidate.y - item.y) <= Math.max(2.2, item.height * 0.35));
    if (row) row.items.push(item);
    else rows.push({ y: item.y, items: [item] });
  }
  rows.sort((a, b) => a.y - b.y);
  return rows
    .map((row) => lineText(row.items))
    .join('\n')
    .replace(/-\n/g, '')
    .replace(/\n(?=[a-z,;)])/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const extractRecommendations = (pageModel, chapterPrefix) => {
  const recommendations = [];
  const idPattern = new RegExp(`^${chapterPrefix}\\.\\d+[a-z]?$`);

  for (const page of pageModel) {
    const candidates = page.items
      .filter((item) => idPattern.test(item.text))
      .sort((a, b) => a.x - b.x || a.y - b.y);
    if (!candidates.length) continue;

    const columnStarts = [...new Set(candidates.map((item) => Math.round(item.x)))].sort((a, b) => a - b);

    for (const candidate of candidates) {
      const columnIndex = columnStarts.findIndex((x) => Math.abs(x - Math.round(candidate.x)) <= 3);
      const minX = Math.max(0, columnStarts[columnIndex] - 10);
      const maxX =
        columnStarts.length === 1
          ? Math.min(page.width * 0.64, 390)
          : columnIndex < columnStarts.length - 1
            ? columnStarts[columnIndex + 1] - 12
            : page.width - 24;
      const nextInColumn = candidates
        .filter((item) => Math.abs(item.x - candidate.x) <= 4 && item.y > candidate.y + 2)
        .sort((a, b) => a.y - b.y)[0];
      const maxY = nextInColumn ? nextInColumn.y - 2 : page.height - 38;
      const blockItems = page.items
        .filter((item) => item.x >= minX && item.x <= maxX && item.y >= candidate.y - 1 && item.y <= maxY)
        .filter((item) => !/^Downloaded from https?:\/\//i.test(item.text))
        .sort((a, b) => a.y - b.y || a.x - b.x);
      const gradeIndex = blockItems.findLastIndex((item) => /^[A-E]$/.test(item.text));
      const gradeItem = gradeIndex >= 0 ? blockItems[gradeIndex] : null;
      const evidenceGrade = gradeItem?.text ?? null;
      const contentItems = gradeItem
        ? blockItems.slice(0, gradeIndex).filter((item) => item.x <= gradeItem.x + 28)
        : blockItems;
      const rawText = recommendationTextFromItems(contentItems);
      const text = normalizeText(rawText.replace(candidate.text, '')).replace(/\s+/g, ' ').trim();
      if (!evidenceGrade || text.length < 20) continue;
      recommendations.push({
        id: candidate.text,
        text,
        evidenceGrade,
        page: page.page,
      });
    }
  }

  const seen = new Set();
  return recommendations.filter((recommendation) => {
    const key = `${recommendation.id}:${recommendation.text}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => {
    const left = a.id.match(/^(\d+)\.(\d+)([a-z]?)$/);
    const right = b.id.match(/^(\d+)\.(\d+)([a-z]?)$/);
    if (!left || !right) return a.id.localeCompare(b.id, undefined, { numeric: true });
    return Number(left[1]) - Number(right[1]) || Number(left[2]) - Number(right[2]) || left[3].localeCompare(right[3]);
  });
};

const normalizeRecommendationText = (value) =>
  normalizeText(value)
    .replace(/-\n/g, '')
    .replace(/\n(?=[a-z,;)])/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\$(?=\s*\d)/g, '≥')
    .replace(/#(?=\s*\d)/g, '≤')
    .replace(/mL\/min\/\s+1\.73\s*m2/g, 'mL/min/1.73 m2')
    .replace(/\b(Fig\.\s*\d+\.\d+)and(Table\s+\d+\.\d+)/g, '$1 and $2')
    .replace(/\b(Table\s+\d+\.\d+)and(Fig\.\s*\d+\.\d+)/g, '$1 and $2')
    .trim();

const extractRecommendationsFromRawText = (rawPages, chapterPrefix) => {
  const recommendations = [];
  const idPattern = new RegExp(`^${chapterPrefix}\\.\\d+[a-z]?\\b`, 'gm');

  for (const [pageIndex, pageText] of rawPages.entries()) {
    const matches = [...pageText.matchAll(idPattern)];
    for (let index = 0; index < matches.length; index += 1) {
      const match = matches[index];
      const id = match[0];
      const next = matches[index + 1];
      const blockStart = match.index + id.length;
      const blockEnd = next?.index ?? pageText.length;
      const block = normalizeRecommendationText(pageText.slice(blockStart, blockEnd));
      if (block.length < 20) continue;

      const gradeMatches = [...block.matchAll(/(?<=[.)\]])\s*([A-E])(?=\s|$)/g)];
      if (!gradeMatches.length) continue;

      const lastGrade = gradeMatches[gradeMatches.length - 1];
      const evidenceGrade = lastGrade[1];
      const text = normalizeRecommendationText(block.slice(0, lastGrade.index + lastGrade[0].length))
        .replace(/\s+[A-E]$/, '')
        .trim();

      if (text.length < 20) continue;
      recommendations.push({
        id,
        text,
        evidenceGrade,
        page: pageIndex + 1,
        extractionMethod: 'poppler-raw',
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
    .sort((a, b) => {
      const left = a.id.match(/^(\d+)\.(\d+)([a-z]?)$/);
      const right = b.id.match(/^(\d+)\.(\d+)([a-z]?)$/);
      if (!left || !right) return a.id.localeCompare(b.id, undefined, { numeric: true });
      return Number(left[1]) - Number(right[1]) || Number(left[2]) - Number(right[2]) || left[3].localeCompare(right[3]);
    });
};

const mergeRecommendations = (rawRecommendations, layoutRecommendations) => {
  const merged = new Map();
  for (const recommendation of layoutRecommendations) {
    merged.set(recommendation.id, { ...recommendation, extractionMethod: 'pdfjs-layout' });
  }
  for (const recommendation of rawRecommendations) {
    merged.set(recommendation.id, recommendation);
  }
  return [...merged.values()].sort((a, b) => {
    const left = a.id.match(/^(\d+)\.(\d+)([a-z]?)$/);
    const right = b.id.match(/^(\d+)\.(\d+)([a-z]?)$/);
    if (!left || !right) return a.id.localeCompare(b.id, undefined, { numeric: true });
    return Number(left[1]) - Number(right[1]) || Number(left[2]) - Number(right[2]) || left[3].localeCompare(right[3]);
  });
};

const extractHeadings = (pages) => {
  const headings = [];
  for (const page of pages) {
    for (const line of page.lines) {
      if (/^Recommendations$/i.test(line)) continue;
      if (/^(Table|Figure)\s+\d+/i.test(line)) continue;
      const isAllCaps = /^[A-Z0-9\s,;:()\/\-–—]+$/.test(line) && /[A-Z]{4}/.test(line);
      const isNumberedTitle = /^\d+\.\s+[A-Z]/.test(line);
      if ((isAllCaps && line.length >= 8 && line.length <= 120) || isNumberedTitle) {
        headings.push({ title: line, page: page.page });
      }
    }
  }
  return headings;
};

const extractCaptions = (pages) => {
  const captions = [];
  for (const page of pages) {
    const lines = page.rawLines?.length ? page.rawLines : page.lines;
    for (let index = 0; index < lines.length; index += 1) {
      const match = lines[index].match(/^(Table|Figure)\s+(\d+(?:\.\d+)?)(.*)$/i);
      if (!match) continue;

      const captionLines = [lines[index]];
      for (let nextIndex = index + 1; nextIndex < lines.length; nextIndex += 1) {
        const nextLine = lines[nextIndex];
        if (/^(?:Table|Figure)\s+\d+(?:\.\d+)?/i.test(nextLine)) break;
        if (/^\d+\.\d+[a-z]?\b/.test(nextLine)) break;
        if (/^Recommendations$/i.test(nextLine)) break;
        if (/^References$/i.test(nextLine)) break;
        if (/^S\d+\b/.test(nextLine)) break;
        if (/^Downloaded from https?:\/\//i.test(nextLine)) break;
        if (captionLines.join(' ').length > 1400) break;
        captionLines.push(nextLine);
      }

      const caption = normalizeText(captionLines.join(' ')).replace(/\s+/g, ' ');
      if (caption.length >= 12) {
        captions.push({ kind: match[1], id: match[2], caption, page: page.page });
      }
    }
  }
  return captions;
};

const extractTableLikeRows = (pageModel, textPages) =>
  pageModel.flatMap((page, pageIndex) => {
    const rows = new Map();
    for (const item of page.items) {
      const key = Math.round(item.y / 4) * 4;
      const row = rows.get(key) ?? [];
      row.push(item);
      rows.set(key, row);
    }

    const tableRows = [];
    for (const row of rows.values()) {
      const sorted = row.sort((a, b) => a.x - b.x);
      const gaps = sorted.slice(1).filter((item, index) => item.x - (sorted[index].x + sorted[index].width) > 24);
      const rowText = sorted.map((item) => item.text).join(' ').replace(/\s+/g, ' ').trim();
      if (gaps.length >= 2 && rowText.length > 20) tableRows.push(rowText);
    }

    return tableRows.length
      ? [
          {
            page: pageIndex + 1,
            rows: tableRows,
            nearbyCaptions: textPages[pageIndex]?.captions ?? [],
          },
        ]
      : [];
  });

const extractImages = (pdfPath, docSlug) => {
  if (!pdfimages) return { images: [], extracted: false, reason: 'pdfimages not found' };

  const docAssetDir = path.join(resolvedAssets, docSlug);
  resetDirectory(docAssetDir);
  const prefix = path.join(docAssetDir, 'image');
  let listing = '';

  try {
    const relativePdf = path.relative(workspace, pdfPath);
    const relativePrefix = path.relative(workspace, prefix);
    listing = run(pdfimages, ['-list', relativePdf]);
    run(pdfimages, ['-all', relativePdf, relativePrefix], { stdio: 'ignore', encoding: 'buffer' });
  } catch (error) {
    return { images: [], extracted: false, reason: error.message };
  }

  const files = fs
    .readdirSync(docAssetDir)
    .filter((name) => /^image-\d+/.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const rows = listing
    .split(/\r?\n/)
    .slice(2)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const parts = line.split(/\s+/);
      const file = files[index] ?? null;
      return {
        page: Number(parts[0]),
        number: Number(parts[1]),
        type: parts[2],
        width: Number(parts[3]),
        height: Number(parts[4]),
        color: parts[5],
        bitsPerComponent: Number(parts[6]),
        encoding: parts[7],
        file: file ? path.relative(workspace, path.join(docAssetDir, file)).replace(/\\/g, '/') : null,
      };
    });

  return { images: rows, extracted: true };
};

const toMarkdown = (document) => {
  const lines = [
    `# ${document.title}`,
    '',
    `- Source PDF: \`${document.sourcePdf}\``,
    `- Pages: ${document.pageCount}`,
    `- Extracted images: ${document.images.length}`,
    `- Recommendations detected: ${document.recommendations.length}`,
    '',
  ];

  if (document.recommendations.length) {
    lines.push('## Recommendations', '');
    for (const recommendation of document.recommendations) {
      lines.push(
        `- **${recommendation.id} (${recommendation.evidenceGrade})**, p. ${recommendation.page}: ${recommendation.text}`,
      );
    }
    lines.push('');
  }

  if (document.captions.length) {
    lines.push('## Tables and Figures', '');
    for (const caption of document.captions) {
      lines.push(`- p. ${caption.page}: ${caption.caption}`);
    }
    lines.push('');
  }

  lines.push('## Page Text', '');
  for (const page of document.pages) {
    lines.push(`### Page ${page.page}`, '', page.cleanedText || '[No text extracted]', '');
  }

  return `${lines.join('\n')}\n`;
};

const pdfEntries = fs
  .readdirSync(resolvedSource, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.pdf'))
  .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

const manifest = {
  generatedAt: new Date().toISOString(),
  sourceDir: path.relative(workspace, resolvedSource).replace(/\\/g, '/'),
  outputDir: path.relative(workspace, resolvedOutput).replace(/\\/g, '/'),
  assetDir: path.relative(workspace, resolvedAssets).replace(/\\/g, '/'),
  tools: {
    pdftotext,
    pdfimages: pdfimages ?? null,
    pdfinfo: pdfinfo ?? null,
    pdftoppm: pdftoppm ?? null,
    pdfjs: path.relative(workspace, path.dirname(fileURLToPath(import.meta.url))).replace(/\\/g, '/'),
  },
  documents: [],
};

for (const entry of pdfEntries) {
  const pdfPath = path.join(resolvedSource, entry.name);
  const docSlug = slugify(path.basename(entry.name, '.pdf'));
  const docOutputDir = path.join(resolvedOutput, docSlug);
  resetDirectory(docOutputDir);

  console.log(`Extracting ${entry.name}`);

  const info = parsePdfInfo(pdfPath);
  const popplerPages = textFromPoppler(pdfPath, '-layout');
  const rawPopplerPages = textFromPoppler(pdfPath, '-raw');
  const modelPages = await pdfjsPageModel(pdfPath);
  const pageCount = Math.max(popplerPages.length, modelPages.length);
  const pages = Array.from({ length: pageCount }, (_, index) => {
    const readingText = pageTextFromLayout(modelPages[index]);
    const cleanedText = readingText || normalizeText(popplerPages[index] ?? '');
    const lines = cleanedText ? cleanedText.split('\n').map((line) => line.trim()).filter(Boolean) : [];
    const rawText = normalizeText(rawPopplerPages[index] ?? '');
    return {
      page: index + 1,
      cleanedText,
      popplerText: normalizeText(popplerPages[index] ?? ''),
      rawText,
      rawLines: rawText ? rawText.split('\n').map((line) => line.trim()).filter(Boolean) : [],
      readingText,
      lines,
      captions: [],
      layout: modelPages[index] ?? null,
    };
  });

  const captions = extractCaptions(pages);
  for (const caption of captions) {
    pages[caption.page - 1]?.captions.push(caption);
  }

  const chapterPrefix = path.basename(entry.name).match(/^(\d+)\./)?.[1] ?? '\\d+';
  const rawRecommendations = extractRecommendationsFromRawText(rawPopplerPages, chapterPrefix);
  const recommendations = mergeRecommendations(rawRecommendations, extractRecommendations(modelPages, chapterPrefix));
  const headings = extractHeadings(pages);
  const tableLikeRows = extractTableLikeRows(modelPages, pages);
  const imageResult = extractImages(pdfPath, docSlug);

  const document = {
    title: repairMojibake(path.basename(entry.name, '.pdf')),
    sourcePdf: path.relative(workspace, pdfPath).replace(/\\/g, '/'),
    info,
    pageCount,
    headings,
    recommendations,
    captions,
    tableLikeRows,
    images: imageResult.images,
    imageExtraction: {
      extracted: imageResult.extracted,
      reason: imageResult.reason ?? null,
    },
    pages,
  };

  const jsonPath = path.join(docOutputDir, 'document.json');
  const markdownPath = path.join(docOutputDir, 'document.md');
  fs.writeFileSync(jsonPath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
  fs.writeFileSync(markdownPath, toMarkdown(document), 'utf8');

  manifest.documents.push({
    title: document.title,
    sourcePdf: document.sourcePdf,
    pageCount,
    recommendations: recommendations.length,
    captions: captions.length,
    images: imageResult.images.length,
    json: path.relative(workspace, jsonPath).replace(/\\/g, '/'),
    markdown: path.relative(workspace, markdownPath).replace(/\\/g, '/'),
  });
}

fs.writeFileSync(path.join(resolvedOutput, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Done. Structured output: ${path.relative(workspace, resolvedOutput)}`);
