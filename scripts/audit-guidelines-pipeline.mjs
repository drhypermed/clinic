import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const workspace = process.cwd();
const args = new Set(process.argv.slice(2));
const jsonOnly = args.has('--json');
const failOnIssues = args.has('--fail-on-issues');
const sourceRoot = path.resolve('guidelines-sources');
const structuredRoot = path.resolve('guidelines-sources/_structured/full-text');
const generatedIndexPath = path.resolve('guidelines-sources/_generated/full-text-index.json');
const componentSourcesRoot = path.resolve('components/guidelines/data');
const guidelinesDataPath = path.resolve('components/guidelines/guidelinesData.ts');

const generatedTopLevelNames = new Set([
  '_assets',
  '_extracted',
  '_generated',
  '_inbox',
  '_review',
  '_structured',
]);

const toPosix = (value) => value.replace(/\\/g, '/');
const rel = (target, root = workspace) => toPosix(path.relative(root, target));
const fileExists = (target) => fs.existsSync(target) && fs.statSync(target).isFile();

const countColumnBleedLines = (value) =>
  String(value || '')
    .split(/\r?\n/)
    .filter((line) => {
      const segments = line
        .split(/ {2,}/)
        .map((segment) => segment.trim())
        .filter((segment) => /[A-Za-z]{3,}/.test(segment));
      const wordCount = (line.match(/[A-Za-z]{3,}/g) || []).length;
      return line.length >= 95 && segments.length >= 3 && wordCount >= 12;
    })
    .length;

const findTextQualityIssues = (payload, sourcePath) => {
  const issues = [];
  for (const chunk of Array.isArray(payload.chunks) ? payload.chunks : []) {
    const columnBleedLines = countColumnBleedLines(chunk.text);
    if (columnBleedLines >= 4) {
      issues.push({
        sourcePath,
        chunkId: chunk.id || '',
        startPage: Number(chunk.startPage || 0),
        endPage: Number(chunk.endPage || 0),
        issue: 'probable merged multi-column text',
        columnBleedLines,
        sample: String(chunk.text || '').replace(/\s+/g, ' ').slice(0, 240),
      });
    }
  }
  return issues;
};

const ensureInsideWorkspace = (target, label) => {
  const relative = path.relative(workspace, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label} must stay inside the workspace: ${target}`);
  }
};

ensureInsideWorkspace(sourceRoot, 'Source root');
ensureInsideWorkspace(structuredRoot, 'Structured root');
ensureInsideWorkspace(generatedIndexPath, 'Generated index');
ensureInsideWorkspace(componentSourcesRoot, 'Component sources root');
ensureInsideWorkspace(guidelinesDataPath, 'Guidelines data path');

const walkFiles = (dir, predicate, options = {}) => {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const relative = rel(fullPath, options.root ?? dir);
    const topLevel = relative.split('/')[0];
    if (entry.isDirectory()) {
      if (options.skipGenerated && (entry.name.startsWith('_') || generatedTopLevelNames.has(entry.name) || generatedTopLevelNames.has(topLevel))) {
        continue;
      }
      files.push(...walkFiles(fullPath, predicate, options));
    } else if (entry.isFile() && predicate(fullPath)) {
      files.push(fullPath);
    }
  }
  return files.sort((a, b) => a.localeCompare(b));
};

const readJson = (target) => JSON.parse(fs.readFileSync(target, 'utf8'));

const hashFile = (target) => {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(target));
  return hash.digest('hex');
};

const hasPdfMagic = (target) => {
  const fd = fs.openSync(target, 'r');
  try {
    const buffer = Buffer.alloc(5);
    fs.readSync(fd, buffer, 0, buffer.length, 0);
    return buffer.toString('ascii') === '%PDF-';
  } finally {
    fs.closeSync(fd);
  }
};

const inferSourcePathFromStructured = (jsonPath) =>
  rel(jsonPath, structuredRoot).replace(/\.json$/i, '.pdf');

const loadStructured = () => {
  const rows = [];
  const textQualityIssues = [];
  for (const jsonPath of walkFiles(structuredRoot, (target) => target.toLowerCase().endsWith('.json'))) {
    try {
      const payload = readJson(jsonPath);
      const sourcePath = payload.sourcePath || inferSourcePathFromStructured(jsonPath);
      if (payload.status === 'extracted') {
        textQualityIssues.push(...findTextQualityIssues(payload, sourcePath));
      }
      rows.push({
        path: rel(jsonPath),
        sourcePath,
        school: sourcePath.split('/')[0],
        status: payload.status || 'missing-status',
        textChars: Number(payload.textChars || 0),
        chunkCount: Array.isArray(payload.chunks) ? payload.chunks.length : 0,
        sha256: payload.sha256 || '',
      });
    } catch (error) {
      rows.push({
        path: rel(jsonPath),
        sourcePath: inferSourcePathFromStructured(jsonPath),
        school: inferSourcePathFromStructured(jsonPath).split('/')[0],
        status: 'parse-error',
        error: error instanceof Error ? error.message : String(error),
        textChars: 0,
        chunkCount: 0,
        sha256: '',
      });
    }
  }
  return { rows, textQualityIssues };
};

const inferLocalFileCandidates = (sourceFile, localFile, surroundingText) => {
  const normalized = toPosix(localFile);
  if (normalized.includes('/')) return [normalized];
  const sourcePath = toPosix(sourceFile);
  if (sourcePath.includes('/ada2026/')) return [`ADA/2026/${normalized}`];
  if (sourcePath.includes('/gina2025/')) return [`GINA/${normalized}`];
  if (sourcePath.includes('/gold2026/')) return [`GOLD/${normalized}`];
  if (sourcePath.endsWith('/guidelinesData.ts')) {
    const candidates = [];
    if (/dc26|2026|Diabetes-2026/i.test(surroundingText)) candidates.push(`ADA/2026/${normalized}`);
    return candidates.length ? candidates : [normalized];
  }
  return [normalized];
};

const loadDeclaredLocalFiles = () => {
  const sourceFiles = [
    guidelinesDataPath,
    ...walkFiles(componentSourcesRoot, (target) => path.basename(target) === 'sources.ts'),
  ].filter(fileExists);
  const localFiles = [];
  const localFilePattern = /(?:localFile|"localFile")\s*:\s*(['"])((?:\\.|(?!\1).)*)\1/g;

  for (const sourceFile of sourceFiles) {
    const text = fs.readFileSync(sourceFile, 'utf8');
    let match;
    while ((match = localFilePattern.exec(text))) {
      const localFile = match[2].replace(/\\(['"\\])/g, '$1');
      const context = text.slice(Math.max(0, match.index - 500), match.index + 500);
      const candidates = inferLocalFileCandidates(sourceFile, localFile, context);
      localFiles.push({
        sourceFile: rel(sourceFile),
        localFile: toPosix(localFile),
        candidates,
      });
    }
  }

  return localFiles;
};

const loadGeneratedIndex = () => {
  if (!fileExists(generatedIndexPath)) {
    return { exists: false, documents: [], chunks: [], path: rel(generatedIndexPath) };
  }
  const payload = readJson(generatedIndexPath);
  return {
    exists: true,
    path: rel(generatedIndexPath),
    generatedAt: payload.generatedAt || '',
    documentCount: Number(payload.documentCount || 0),
    chunkCount: Number(payload.chunkCount || 0),
    duplicateDocuments: Number(payload.duplicateDocuments || 0),
    failedDocuments: Number(payload.failedDocuments || 0),
    documents: Array.isArray(payload.documents) ? payload.documents : [],
    chunks: Array.isArray(payload.chunks) ? payload.chunks : [],
  };
};

const incrementSchool = (map, school, patch) => {
  const row = map.get(school) ?? {
    pdf: 0,
    invalidPdf: 0,
    structured: 0,
    extracted: 0,
    duplicate: 0,
    failed: 0,
    indexedDocuments: 0,
    indexedChunks: 0,
    declaredLocalFiles: 0,
  };
  for (const [key, value] of Object.entries(patch)) row[key] = (row[key] ?? 0) + value;
  map.set(school, row);
};

const pdfFiles = walkFiles(
  sourceRoot,
  (target) => target.toLowerCase().endsWith('.pdf'),
  { root: sourceRoot, skipGenerated: true },
);
const sourceAssetFiles = walkFiles(
  sourceRoot,
  () => true,
  { root: sourceRoot, skipGenerated: true },
);
const pdfSourcePaths = new Set(pdfFiles.map((target) => rel(target, sourceRoot)));
const sourceAssetPaths = new Set(sourceAssetFiles.map((target) => rel(target, sourceRoot)));
const invalidPdfFiles = pdfFiles.filter((target) => !hasPdfMagic(target)).map((target) => rel(target, sourceRoot));

const hashes = new Map();
const duplicatePdfFiles = [];
for (const pdfPath of pdfFiles) {
  const sourcePath = rel(pdfPath, sourceRoot);
  if (invalidPdfFiles.includes(sourcePath)) continue;
  const hash = hashFile(pdfPath);
  if (hashes.has(hash)) {
    duplicatePdfFiles.push({ sourcePath, duplicateOf: hashes.get(hash), sha256: hash });
  } else {
    hashes.set(hash, sourcePath);
  }
}

const structuredResult = loadStructured();
const structured = structuredResult.rows;
const textQualityIssues = structuredResult.textQualityIssues;
const structuredBySource = new Map(structured.map((entry) => [entry.sourcePath, entry]));
const declaredLocalFiles = loadDeclaredLocalFiles();
const generatedIndex = loadGeneratedIndex();
const indexedSources = new Set(generatedIndex.documents.map((document) => document.sourcePath).filter(Boolean));
const extractedSources = new Set(structured.filter((entry) => entry.status === 'extracted').map((entry) => entry.sourcePath));

const missingStructured = Array.from(pdfSourcePaths).filter((sourcePath) => !structuredBySource.has(sourcePath));
const failedStructured = structured.filter((entry) => entry.status === 'failed' || entry.status === 'parse-error');
const indexedMissingCurrentExtraction = Array.from(extractedSources).filter((sourcePath) => !indexedSources.has(sourcePath));
const staleIndexDocuments = generatedIndex.documents
  .filter((document) => !extractedSources.has(document.sourcePath))
  .map((document) => document.sourcePath);

const declaredMissingAsset = [];
const declaredMissingIndex = [];
for (const declaration of declaredLocalFiles) {
  const hasAsset = declaration.candidates.some((candidate) => sourceAssetPaths.has(candidate));
  const hasIndex = declaration.candidates.some((candidate) => indexedSources.has(candidate));
  if (!hasAsset) declaredMissingAsset.push(declaration);
  if (!hasIndex) declaredMissingIndex.push(declaration);
}

const declaredCandidates = new Set(declaredLocalFiles.flatMap((entry) => entry.candidates));
const pdfsNotDeclared = Array.from(pdfSourcePaths).filter((sourcePath) => !declaredCandidates.has(sourcePath));

const bySchool = new Map();
for (const sourcePath of pdfSourcePaths) {
  incrementSchool(bySchool, sourcePath.split('/')[0], { pdf: 1 });
}
for (const sourcePath of invalidPdfFiles) {
  incrementSchool(bySchool, sourcePath.split('/')[0], { invalidPdf: 1 });
}
for (const entry of structured) {
  const patch = { structured: 1 };
  if (entry.status === 'extracted') patch.extracted = 1;
  else if (entry.status === 'duplicate') patch.duplicate = 1;
  else patch.failed = 1;
  incrementSchool(bySchool, entry.school, patch);
}
for (const document of generatedIndex.documents) {
  incrementSchool(bySchool, String(document.school || document.sourcePath?.split('/')?.[0] || 'Unknown'), { indexedDocuments: 1 });
}
for (const chunk of generatedIndex.chunks) {
  incrementSchool(bySchool, String(chunk.school || chunk.sourcePath?.split('/')?.[0] || 'Unknown'), { indexedChunks: 1 });
}
for (const declaration of declaredLocalFiles) {
  const school = declaration.candidates[0]?.split('/')?.[0] || 'Unknown';
  incrementSchool(bySchool, school, { declaredLocalFiles: 1 });
}

const report = {
  generatedAt: new Date().toISOString(),
  sourceRoot: rel(sourceRoot),
  structuredRoot: rel(structuredRoot),
  generatedIndex: {
    exists: generatedIndex.exists,
    path: generatedIndex.path,
    generatedAt: generatedIndex.generatedAt,
    documentCount: generatedIndex.documentCount,
    chunkCount: generatedIndex.chunkCount,
    duplicateDocuments: generatedIndex.duplicateDocuments,
    failedDocuments: generatedIndex.failedDocuments,
  },
  totals: {
    pdfFiles: pdfSourcePaths.size,
    invalidPdfFiles: invalidPdfFiles.length,
    duplicatePdfFiles: duplicatePdfFiles.length,
    structuredFiles: structured.length,
    extractedStructuredFiles: structured.filter((entry) => entry.status === 'extracted').length,
    duplicateStructuredFiles: structured.filter((entry) => entry.status === 'duplicate').length,
    failedStructuredFiles: failedStructured.length,
    declaredLocalFiles: declaredLocalFiles.length,
    missingStructuredFiles: missingStructured.length,
    indexedMissingCurrentExtraction: indexedMissingCurrentExtraction.length,
    staleIndexDocuments: staleIndexDocuments.length,
    declaredMissingAsset: declaredMissingAsset.length,
    declaredMissingIndex: declaredMissingIndex.length,
    pdfsNotDeclared: pdfsNotDeclared.length,
    textQualityIssues: textQualityIssues.length,
  },
  bySchool: Object.fromEntries([...bySchool.entries()].sort(([a], [b]) => a.localeCompare(b))),
  issues: {
    invalidPdfFiles,
    duplicatePdfFiles,
    missingStructured,
    failedStructured,
    indexedMissingCurrentExtraction,
    staleIndexDocuments,
    declaredMissingAsset,
    declaredMissingIndex,
    pdfsNotDeclared,
    textQualityIssues,
  },
};

if (jsonOnly) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log('Guidelines pipeline audit');
  console.log(JSON.stringify(report.totals, null, 2));
  console.log('');
  console.table(report.bySchool);

  const printSample = (label, values) => {
    if (!values.length) return;
    console.log(`\n${label} (${values.length})`);
    for (const value of values.slice(0, 20)) {
      console.log(typeof value === 'string' ? `- ${value}` : `- ${JSON.stringify(value)}`);
    }
    if (values.length > 20) console.log(`... ${values.length - 20} more`);
  };

  printSample('Invalid PDF files', invalidPdfFiles);
  printSample('Duplicate PDF files', duplicatePdfFiles);
  printSample('Missing structured files', missingStructured);
  printSample('Failed structured files', failedStructured);
  printSample('Extracted documents missing from generated index', indexedMissingCurrentExtraction);
  printSample('Stale generated index documents', staleIndexDocuments);
  printSample('Declared sources missing source asset', declaredMissingAsset);
  printSample('Declared sources missing generated index entry', declaredMissingIndex);
  printSample('PDFs not declared in component sources', pdfsNotDeclared);
  printSample('Text quality issues', textQualityIssues);
}

const hasBlockingIssues = invalidPdfFiles.length > 0
  || missingStructured.length > 0
  || failedStructured.length > 0
  || indexedMissingCurrentExtraction.length > 0
  || staleIndexDocuments.length > 0
  || declaredMissingAsset.length > 0
  || declaredMissingIndex.length > 0
  || textQualityIssues.length > 0;

if (failOnIssues && hasBlockingIssues) {
  process.exitCode = 1;
}
