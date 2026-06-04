import admin from 'firebase-admin';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const workspace = process.cwd();
const sourceRoot = path.resolve('guidelines-sources');
const defaultProjectId = 'gen-lang-client-0444130146';
const defaultStorageBucket = 'gen-lang-client-0444130146.firebasestorage.app';
const dryRun = process.argv.includes('--dry-run');
const checkOnly = process.argv.includes('--check-only');
const dedupeByHash = process.argv.includes('--dedupe-by-hash');
const skipFirestore = process.argv.includes('--skip-firestore');
const quiet = process.argv.includes('--quiet');
const forceUpload = process.argv.includes('--force');
const onlyFilters = process.argv
  .filter((arg) => arg.startsWith('--only='))
  .flatMap((arg) => arg.slice('--only='.length).split(','))
  .map((value) => value.trim().replace(/\\/g, '/').toLowerCase())
  .filter(Boolean);

const matchesOnlyFilter = (relativePath, filter) => {
  const relative = relativePath.replace(/\\/g, '/').toLowerCase();
  const normalizedFilter = filter.replace(/\\/g, '/').toLowerCase();
  if (relative === normalizedFilter || relative.startsWith(`${normalizedFilter}/`)) return true;
  if (normalizedFilter.includes('/')) return relative.includes(normalizedFilter);
  return relative.split('/').includes(normalizedFilter);
};

if (!admin.apps.length) {
  const serviceAccountPath = 'service-account.json';
  const appOptions = {
    projectId: process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || defaultProjectId,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || defaultStorageBucket,
  };
  if (fs.existsSync(serviceAccountPath)) {
    appOptions.credential = admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8')));
  }
  admin.initializeApp(appOptions);
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

const generatedTopLevelNames = new Set(['_assets', '_extracted', '_inbox', '_review', '_structured']);

const walkPdfFiles = (dir) => {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const relative = path.relative(sourceRoot, fullPath);
    const topLevel = relative.split(path.sep)[0];
    if (entry.isDirectory()) {
      if (entry.name.startsWith('_')) continue;
      if (generatedTopLevelNames.has(entry.name) || generatedTopLevelNames.has(topLevel)) continue;
      files.push(...walkPdfFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
      files.push(fullPath);
    }
  }
  return files.sort((a, b) => a.localeCompare(b));
};

const mediaUrlFor = (destination, token) =>
  `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destination)}?alt=media&token=${token}`;

const hashFile = (filePath) => {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
};

const files = walkPdfFiles(sourceRoot).filter((pdfPath) => {
  if (onlyFilters.length === 0) return true;
  const relative = path.relative(sourceRoot, pdfPath).replace(/\\/g, '/').toLowerCase();
  return onlyFilters.some((filter) => matchesOnlyFilter(relative, filter));
});

let uploaded = 0;
let skipped = 0;
let updatedBooks = 0;
let updatedChunks = 0;
let totalBytes = 0;
let duplicateFiles = 0;
let duplicateBytes = 0;
let existingFiles = 0;
let missingFiles = 0;
let existingBytes = 0;
const seenByHash = new Map();

for (const [index, pdfPath] of files.entries()) {
  const sourcePath = path.relative(sourceRoot, pdfPath).replace(/\\/g, '/');
  const localStat = fs.statSync(pdfPath);
  const fileHash = dedupeByHash ? hashFile(pdfPath) : null;
  const canonical = fileHash ? seenByHash.get(fileHash) : null;
  const sourcePathForStorage = canonical?.sourcePath ?? sourcePath;
  const destination = `guidelines-sources/${sourcePathForStorage}`;
  const file = bucket.file(destination);
  const isDuplicate = Boolean(canonical);
  let token = crypto.randomUUID();
  let shouldUpload = !isDuplicate;

  if (isDuplicate) {
    token = canonical.token;
    duplicateFiles += 1;
    duplicateBytes += localStat.size;
  } else if (!dryRun && !forceUpload) {
    const [exists] = await file.exists();
    if (exists) {
      existingFiles += 1;
      existingBytes += localStat.size;
      const [metadata] = await file.getMetadata();
      const sizeMatches = Number(metadata.size || 0) === localStat.size;
      const existingToken = String(metadata.metadata?.firebaseStorageDownloadTokens || '').split(',').filter(Boolean)[0];
      if (sizeMatches && existingToken) {
        token = existingToken;
        shouldUpload = false;
      }
    } else if (checkOnly) {
      missingFiles += 1;
    }
  }

  if (fileHash && !canonical) {
    seenByHash.set(fileHash, { sourcePath, destination, token });
  }

  if (!dryRun && !checkOnly && shouldUpload) {
    await bucket.upload(pdfPath, {
      destination,
      resumable: true,
      metadata: {
        contentType: 'application/pdf',
        cacheControl: 'public, max-age=31536000, immutable',
        metadata: {
          firebaseStorageDownloadTokens: token,
          sourcePath,
        },
      },
    });
    uploaded += 1;
    totalBytes += localStat.size;
  } else if (!shouldUpload && !isDuplicate) {
    skipped += 1;
  }

  const storagePdfUrl = mediaUrlFor(destination, token);
  const shouldUpdateFirestore = shouldUpload || forceUpload || isDuplicate;
  if (!dryRun && !checkOnly && !skipFirestore && shouldUpdateFirestore) {
    const writer = db.bulkWriter({ throttling: { initialOpsPerSecond: 40, maxOpsPerSecond: 120 } });
    writer.onWriteError((error) => [4, 10, 13, 14].includes(error.code) && error.failedAttempts < 8);

    const bookSnap = await db.collection('guideline_books').where('sourcePath', '==', sourcePath).get();
    bookSnap.forEach((doc) => {
      writer.set(doc.ref, { storagePdfPath: destination, storagePdfUrl }, { merge: true });
      updatedBooks += 1;
    });

    const chunkSnap = await db.collection('guideline_book_chunks').where('sourcePath', '==', sourcePath).get();
    chunkSnap.forEach((doc) => {
      writer.set(doc.ref, { storagePdfPath: destination, storagePdfUrl }, { merge: true });
      updatedChunks += 1;
    });

    const searchSnap = await db.collection('guideline_chunk_search').where('sourcePath', '==', sourcePath).get();
    searchSnap.forEach((doc) => {
      writer.set(doc.ref, { storagePdfPath: destination, storagePdfUrl }, { merge: true });
    });

    await writer.close();
  }

  const action = dryRun
    ? (isDuplicate ? 'duplicate-dry-run' : 'upload-dry-run')
    : (checkOnly
        ? (isDuplicate ? 'duplicate-check' : (shouldUpload ? 'missing' : 'exists'))
        : (isDuplicate ? 'duplicate' : (shouldUpload ? (forceUpload ? 'force-uploaded' : 'uploaded') : 'exists')));
  if (!quiet) {
    console.log(`[storage-pdf] ${index + 1}/${files.length} ${action} ${sourcePath}${isDuplicate ? ` -> ${sourcePathForStorage}` : ''}`);
  }
}

console.log(JSON.stringify({
  dryRun,
  checkOnly,
  dedupeByHash,
  skipFirestore,
  forceUpload,
  bucket: bucket.name,
  fileCount: files.length,
  uniqueFileCount: dedupeByHash ? seenByHash.size : files.length,
  duplicateFiles,
  duplicateMB: Number((duplicateBytes / 1024 / 1024).toFixed(1)),
  existingFiles,
  missingFiles,
  existingMB: Number((existingBytes / 1024 / 1024).toFixed(1)),
  uploaded,
  skipped,
  uploadedMB: Number((totalBytes / 1024 / 1024).toFixed(1)),
  updatedBooks,
  updatedChunks,
}, null, 2));

await admin.app().delete();
