import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const workspace = process.cwd();
const args = process.argv.slice(2);
const structuredRoot = path.resolve(args.find((arg) => !arg.startsWith('--')) ?? 'guidelines-sources/_structured/full-text');
const sourceRoot = path.resolve('guidelines-sources');
const defaultReportPath = 'guidelines-sources/_review/guideline-page-audit.json';
const reportArg = args.find((arg) => arg.startsWith('--report='));
const reportPath = path.resolve(reportArg ? reportArg.slice('--report='.length) : defaultReportPath);
const onlyFilters = args
  .filter((arg) => arg.startsWith('--only='))
  .flatMap((arg) => arg.slice('--only='.length).split(','))
  .map((value) => value.trim().replace(/\\/g, '/').toLowerCase())
  .filter(Boolean);
const freshPdfInfo = args.includes('--fresh-pdfinfo');

const ensureInsideWorkspace = (target, label) => {
  const relative = path.relative(workspace, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label} must stay inside the workspace: ${target}`);
  }
};

ensureInsideWorkspace(structuredRoot, 'Structured root');
ensureInsideWorkspace(reportPath, 'Report path');

const commandExists = (command) => {
  try {
    execFileSync(process.platform === 'win32' ? 'where.exe' : 'which', [command], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

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

const resolvePopplerCommand = (name) => {
  const exe = process.platform === 'win32' ? `${name}.exe` : name;
  if (commandExists(exe)) return exe;
  for (const candidate of popplerBinCandidates) {
    const fullPath = path.join(candidate, exe);
    if (fs.existsSync(fullPath)) return fullPath;
  }
  return null;
};

const pdfinfo = freshPdfInfo ? resolvePopplerCommand('pdfinfo') : null;

const rel = (target) => path.relative(workspace, target).replace(/\\/g, '/');

const matchesOnlyFilter = (relativePath) => {
  if (onlyFilters.length === 0) return true;
  const normalized = relativePath.replace(/\\/g, '/').toLowerCase();
  return onlyFilters.some((filter) => (
    normalized === filter
    || normalized.startsWith(`${filter}/`)
    || normalized.includes(filter)
  ));
};

const walkJsonFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkJsonFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.json')) {
      const relative = rel(fullPath);
      if (matchesOnlyFilter(relative)) files.push(fullPath);
    }
  }
  return files.sort((a, b) => a.localeCompare(b));
};

const readJson = (target) => JSON.parse(fs.readFileSync(target, 'utf8'));

const parsePdfInfoPages = (pdfPath) => {
  if (!pdfinfo) return null;
  try {
    const raw = execFileSync(pdfinfo, [pdfPath], {
      cwd: workspace,
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 8,
      timeout: 10_000,
    });
    const match = raw.match(/^Pages:\s*(\d+)\s*$/mi);
    return match ? Number(match[1]) : null;
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
};

const isPdfSource = (sourcePath) => /\.pdf$/i.test(String(sourcePath || ''));

const sourceAbsolutePath = (sourcePath) => path.join(sourceRoot, String(sourcePath || '').replace(/\//g, path.sep));

const countRawPageMarkers = (rawTextPath) => {
  if (!rawTextPath) return null;
  const fullPath = path.resolve(rawTextPath);
  if (!fs.existsSync(fullPath)) return null;
  const raw = fs.readFileSync(fullPath, 'utf8');
  const markers = raw.match(/^--- Page \d+ ---$/gm);
  return markers ? markers.length : 0;
};

const firstWord = (text) => String(text || '').trim().match(/[A-Za-z][A-Za-z'-]*/)?.[0] ?? '';
const lastWord = (text) => {
  const matches = String(text || '').trim().match(/[A-Za-z][A-Za-z'-]*/g);
  return matches?.at(-1) ?? '';
};

const findBoundaryContinuations = (pages, limit = 8) => {
  const continuations = [];
  if (!Array.isArray(pages)) return continuations;
  for (let index = 1; index < pages.length; index += 1) {
    const currentFirst = firstWord(pages[index]?.text);
    const previousText = String(pages[index - 1]?.text || '').trim();
    const previousLast = lastWord(previousText);
    const previousEndsOpen = previousText ? !/[.!?:;)"'\]]$/.test(previousText) : false;
    if (currentFirst && /^[a-z]/.test(currentFirst) && previousEndsOpen) {
      continuations.push({
        pageNumber: Number(pages[index]?.pageNumber || index + 1),
        firstWord: currentFirst,
        previousLastWord: previousLast,
      });
      if (continuations.length >= limit) break;
    }
  }
  return continuations;
};

const validatePages = (payload) => {
  const issues = [];
  if (!Array.isArray(payload.pages)) {
    issues.push('missing-pages-array');
    return issues;
  }
  if (Number(payload.pageCount || 0) !== payload.pages.length) {
    issues.push('page-count-does-not-match-pages-array');
  }
  payload.pages.forEach((page, index) => {
    if (Number(page?.pageNumber || 0) !== index + 1) {
      issues.push(`page-number-sequence-broken-at-${index + 1}`);
    }
  });
  return issues;
};

const validateChunks = (payload) => {
  const issues = [];
  if (!Array.isArray(payload.chunks)) {
    issues.push('missing-chunks-array');
    return issues;
  }
  const pageCount = Number(payload.pageCount || 0);
  payload.chunks.forEach((chunk, index) => {
    const start = Number(chunk?.startPage || 0);
    const end = Number(chunk?.endPage || start || 0);
    if (!start || !end || start > end || end > pageCount) {
      issues.push(`chunk-page-range-invalid-at-${index + 1}`);
    }
    if (!String(chunk?.text || '').trim()) {
      issues.push(`chunk-empty-at-${index + 1}`);
    }
  });
  return issues;
};

const summary = {
  generatedAt: new Date().toISOString(),
  structuredRoot: rel(structuredRoot),
  checkedFiles: 0,
  extractedFiles: 0,
  duplicateFiles: 0,
  pdfSources: 0,
  nonPdfSources: 0,
  missingSourceFiles: 0,
  pageCountMismatches: 0,
  filesWithIssues: 0,
  pdfInfoMode: freshPdfInfo ? 'fresh-pdfinfo' : 'stored-pdfInfo-pages',
  pdfInfoAvailable: freshPdfInfo ? Boolean(pdfinfo) : true,
};

const issues = [];
const nonPdfPageNumberSources = [];
const continuationSamples = [];

for (const jsonPath of walkJsonFiles(structuredRoot)) {
  summary.checkedFiles += 1;
  let payload;
  try {
    payload = readJson(jsonPath);
  } catch (error) {
    issues.push({ structuredPath: rel(jsonPath), issues: ['invalid-json'], error: error instanceof Error ? error.message : String(error) });
    summary.filesWithIssues += 1;
    continue;
  }

  if (payload.status === 'duplicate') {
    summary.duplicateFiles += 1;
    continue;
  }
  if (payload.status !== 'extracted') {
    issues.push({ structuredPath: rel(jsonPath), sourcePath: payload.sourcePath, issues: [`unexpected-status-${payload.status || 'missing'}`] });
    summary.filesWithIssues += 1;
    continue;
  }

  summary.extractedFiles += 1;
  const fileIssues = [];
  const sourcePath = payload.sourcePath;
  const pdfSource = isPdfSource(sourcePath);
  if (pdfSource) summary.pdfSources += 1;
  else summary.nonPdfSources += 1;

  const absoluteSource = sourceAbsolutePath(sourcePath);
  if (!fs.existsSync(absoluteSource)) {
    fileIssues.push('source-file-missing');
    summary.missingSourceFiles += 1;
  }

  fileIssues.push(...validatePages(payload), ...validateChunks(payload));

  const rawMarkers = countRawPageMarkers(path.join('guidelines-sources/_extracted/full-text', sourcePath.replace(/\.pdf$/i, '.txt')));
  if (rawMarkers !== null && rawMarkers > 0 && rawMarkers !== Number(payload.pageCount || 0)) {
    fileIssues.push(`raw-page-marker-count-${rawMarkers}-does-not-match-page-count-${payload.pageCount || 0}`);
  }

  let pdfPages = null;
  if (pdfSource && fs.existsSync(absoluteSource)) {
    const storedPdfPages = Number(
      payload.pdfInfo?.Pages
      || payload.pdfInfo?.pages
      || payload.pdfInfo?.PageCount
      || 0,
    );
    pdfPages = freshPdfInfo ? parsePdfInfoPages(absoluteSource) : (storedPdfPages || null);
    if (typeof pdfPages === 'number' && pdfPages !== Number(payload.pageCount || 0)) {
      fileIssues.push(`pdf-page-count-${pdfPages}-does-not-match-structured-page-count-${payload.pageCount || 0}`);
      summary.pageCountMismatches += 1;
    } else if (pdfPages && typeof pdfPages === 'object') {
      fileIssues.push('pdfinfo-failed');
    }
  }

  if (!pdfSource && Number(payload.pageCount || 0) > 0) {
    nonPdfPageNumberSources.push({
      sourcePath,
      structuredPath: rel(jsonPath),
      method: payload.extractionMethod || '',
      pseudoPageCount: Number(payload.pageCount || 0),
    });
  }

  const continuations = findBoundaryContinuations(payload.pages);
  if (continuations.length > 0 && continuationSamples.length < 40) {
    continuationSamples.push({
      sourcePath,
      structuredPath: rel(jsonPath),
      samples: continuations,
    });
  }

  if (fileIssues.length > 0) {
    issues.push({
      structuredPath: rel(jsonPath),
      sourcePath,
      extractionMethod: payload.extractionMethod || '',
      pageCount: Number(payload.pageCount || 0),
      pdfPageCount: typeof pdfPages === 'number' ? pdfPages : null,
      issues: [...new Set(fileIssues)],
    });
    summary.filesWithIssues += 1;
  }
}

const report = {
  summary,
  issues,
  nonPdfPageNumberSources,
  continuationSamples,
};

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log(JSON.stringify({
  reportPath: rel(reportPath),
  ...summary,
  nonPdfPageNumberSources: nonPdfPageNumberSources.length,
  continuationSampleFiles: continuationSamples.length,
}, null, 2));

if (summary.filesWithIssues > 0 || nonPdfPageNumberSources.length > 0) {
  process.exitCode = 1;
}
