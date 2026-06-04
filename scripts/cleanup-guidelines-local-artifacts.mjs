import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const workspace = process.cwd();
const confirm = process.argv.includes('--confirm');
const deletePdfDuplicatesByHash = process.argv.includes('--all-pdf-duplicates');
const sourceRoot = path.resolve('guidelines-sources');
const structuredRoot = path.resolve('guidelines-sources/_structured/full-text');
const reportPath = path.resolve('guidelines-sources/_review/local-cleanup/last-run.json');

const toPosix = (value) => value.replace(/\\/g, '/');
const rel = (target, root = workspace) => toPosix(path.relative(root, target));

const ensureInsideWorkspace = (target, label) => {
  const relative = path.relative(workspace, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label} must stay inside the workspace: ${target}`);
  }
};

ensureInsideWorkspace(sourceRoot, 'Source root');
ensureInsideWorkspace(structuredRoot, 'Structured root');
ensureInsideWorkspace(reportPath, 'Report path');

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

const walkPdfFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const relative = rel(fullPath, sourceRoot);
    const topLevel = relative.split('/')[0];
    if (entry.isDirectory()) {
      if (entry.name.startsWith('_') || ['_assets', '_extracted', '_generated', '_inbox', '_review', '_structured'].includes(topLevel)) {
        continue;
      }
      files.push(...walkPdfFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
      files.push(fullPath);
    }
  }
  return files.sort((a, b) => a.localeCompare(b));
};

const hashFile = (target) => {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(target));
  return hash.digest('hex');
};

const isPdfLike = (target) => {
  const fd = fs.openSync(target, 'r');
  try {
    const buffer = Buffer.alloc(5);
    fs.readSync(fd, buffer, 0, buffer.length, 0);
    return buffer.toString('ascii') === '%PDF-';
  } finally {
    fs.closeSync(fd);
  }
};

const deleteFile = (target, deleted) => {
  ensureInsideWorkspace(target, 'Delete target');
  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) return;
  if (confirm) {
    fs.unlinkSync(target);
    if (fs.existsSync(target)) {
      throw new Error(`Failed to delete ${target}`);
    }
  }
  deleted.push(rel(target));
};

const duplicateStructured = [];
const failedStructured = [];
const invalidPdfFiles = [];
const duplicatePdfFiles = [];
const deleted = [];

for (const structuredPath of walkJsonFiles(structuredRoot)) {
  let payload = null;
  try {
    payload = JSON.parse(fs.readFileSync(structuredPath, 'utf8'));
  } catch {
    continue;
  }

  if (payload.status === 'duplicate') duplicateStructured.push({ structuredPath, payload });
  if (payload.status === 'failed') failedStructured.push({ structuredPath, payload });
}

for (const { structuredPath, payload } of duplicateStructured) {
  const sourcePath = String(payload.sourcePath || '');
  if (sourcePath) deleteFile(path.join(sourceRoot, sourcePath), deleted);
  deleteFile(structuredPath, deleted);
}

for (const { structuredPath, payload } of failedStructured) {
  const sourcePath = String(payload.sourcePath || '');
  if (sourcePath) {
    const sourceFile = path.join(sourceRoot, sourcePath);
    if (fs.existsSync(sourceFile) && fs.statSync(sourceFile).isFile() && sourceFile.toLowerCase().endsWith('.pdf') && !isPdfLike(sourceFile)) {
      invalidPdfFiles.push(rel(sourceFile, sourceRoot));
      deleteFile(sourceFile, deleted);
      deleteFile(structuredPath, deleted);
    }
  }
}

if (deletePdfDuplicatesByHash) {
  const seenByHash = new Map();
  for (const pdfPath of walkPdfFiles(sourceRoot)) {
    if (!fs.existsSync(pdfPath)) continue;
    const sourcePath = rel(pdfPath, sourceRoot);
    const sha256 = hashFile(pdfPath);
    const canonical = seenByHash.get(sha256);
    if (!canonical) {
      seenByHash.set(sha256, sourcePath);
      continue;
    }
    duplicatePdfFiles.push({ sourcePath, duplicateOf: canonical, sha256 });
    deleteFile(pdfPath, deleted);
    deleteFile(path.join(structuredRoot, sourcePath.replace(/\.pdf$/i, '.json')), deleted);
    deleteFile(path.resolve('guidelines-sources/_extracted/full-text', sourcePath.replace(/\.pdf$/i, '.txt')), deleted);
  }
}

const report = {
  mode: confirm ? 'deleted' : 'dry-run',
  generatedAt: new Date().toISOString(),
  duplicateStructuredFiles: duplicateStructured.length,
  failedStructuredFiles: failedStructured.length,
  duplicatePdfFiles,
  invalidPdfFiles,
  deletedCount: deleted.length,
  deleted,
};

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log(JSON.stringify({
  mode: report.mode,
  duplicateStructuredFiles: report.duplicateStructuredFiles,
  failedStructuredFiles: report.failedStructuredFiles,
  duplicatePdfFiles: report.duplicatePdfFiles.length,
  invalidPdfFiles: report.invalidPdfFiles.length,
  deletedCount: report.deletedCount,
  reportPath: rel(reportPath),
}, null, 2));

if (!confirm) {
  console.log('Dry run only. Re-run with --confirm to delete these local duplicate/invalid artifacts.');
}
