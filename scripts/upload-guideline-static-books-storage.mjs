import admin from 'firebase-admin';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const workspace = process.cwd();
const sourceRoot = path.resolve('guidelines-sources/_generated/static-books');
const defaultProjectId = 'gen-lang-client-0444130146';
const defaultStorageBucket = 'gen-lang-client-0444130146.firebasestorage.app';
const destinationRoot = 'guidelines-static';
const dryRun = process.argv.includes('--dry-run');
const forceUpload = process.argv.includes('--force');
const quiet = process.argv.includes('--quiet');
const metadataOnly = process.argv.includes('--metadata-only');
const onlyFilters = process.argv
  .filter((arg) => arg.startsWith('--only='))
  .flatMap((arg) => arg.slice('--only='.length).split(','))
  .map((value) => value.trim().replace(/\\/g, '/').toLowerCase())
  .filter(Boolean);

const ensureInsideWorkspace = (target, label) => {
  const relative = path.relative(workspace, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label} must stay inside the workspace: ${target}`);
  }
};

ensureInsideWorkspace(sourceRoot, 'Source root');

const matchesOnlyFilter = (relativePath) => {
  if (onlyFilters.length === 0) return true;
  const relative = relativePath.replace(/\\/g, '/').toLowerCase();
  const collectionId = relative.split('/')[0];
  return onlyFilters.some((filter) => (
    collectionId === filter
    || collectionId.startsWith(`${filter}-`)
    || collectionId.startsWith(`${filter}_`)
    || relative === filter
    || relative.startsWith(`${filter}/`)
    || (filter.includes('/') && relative.includes(filter))
  ));
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

const readExistingDownloadToken = () => {
  for (const envPath of ['.env.local', '.env.production', '.env']) {
    if (!fs.existsSync(envPath)) continue;
    const text = fs.readFileSync(envPath, 'utf8');
    const match = text.match(/^VITE_GUIDELINE_STATIC_BASE_URL=(.+)$/m);
    if (!match) continue;
    const tokenMatch = match[1].match(/[?&]token=([^&\s]+)/);
    if (tokenMatch?.[1]) return decodeURIComponent(tokenMatch[1]);
  }
  return '';
};

const bucket = admin.storage().bucket();
const uploadToken = process.env.GUIDELINE_STATIC_DOWNLOAD_TOKEN || readExistingDownloadToken() || crypto.randomUUID();

const walkFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files.sort((a, b) => a.localeCompare(b));
};

const contentTypeFor = (relativePath) => {
  if (relativePath.endsWith('.json') || relativePath.endsWith('.json.gz')) return 'application/json; charset=utf-8';
  return 'application/octet-stream';
};

const files = walkFiles(sourceRoot).filter((filePath) => {
  const relativePath = path.relative(sourceRoot, filePath).replace(/\\/g, '/');
  if (metadataOnly && !relativePath.endsWith('/collection-data.json') && !relativePath.endsWith('/collection-data.json.gz')) {
    return false;
  }
  return matchesOnlyFilter(relativePath);
});

let uploaded = 0;
let skipped = 0;
let uploadedBytes = 0;
let existingBytes = 0;
const uploadedCollections = new Set();

for (const [index, filePath] of files.entries()) {
  const relativePath = path.relative(sourceRoot, filePath).replace(/\\/g, '/');
  const destination = `${destinationRoot}/${relativePath}`;
  const file = bucket.file(destination);
  const stat = fs.statSync(filePath);
  const [exists] = dryRun ? [false] : await file.exists();
  let shouldUpload = forceUpload || !exists;

  if (exists && !forceUpload) {
    const [metadata] = await file.getMetadata();
    const sizeMatches = Number(metadata.size || 0) === stat.size;
    const tokenMatches = String(metadata.metadata?.firebaseStorageDownloadTokens || '').split(',').includes(uploadToken);
    shouldUpload = !(sizeMatches && tokenMatches);
  }

  if (!dryRun && shouldUpload) {
    await bucket.upload(filePath, {
      destination,
      resumable: stat.size >= 5 * 1024 * 1024,
      metadata: {
        contentType: contentTypeFor(relativePath),
        cacheControl: 'public, max-age=31536000, immutable',
        ...(relativePath.endsWith('.gz') ? { contentEncoding: 'gzip' } : {}),
        metadata: {
          firebaseStorageDownloadTokens: uploadToken,
          staticGuidelinePath: relativePath,
        },
      },
    });
    uploaded += 1;
    uploadedBytes += stat.size;
  } else {
    skipped += 1;
    existingBytes += stat.size;
  }
  uploadedCollections.add(relativePath.split('/')[0]);

  if (!quiet) {
    const action = dryRun ? 'dry-run' : shouldUpload ? 'uploaded' : 'exists';
    console.log(`[guideline-static] ${index + 1}/${files.length} ${action} ${relativePath}`);
  }
}

const baseUrlTemplate = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(`${destinationRoot}/`).replace(/%2F$/, '%2F')}{path}?alt=media&token=${uploadToken}`;

console.log(JSON.stringify({
  dryRun,
  forceUpload,
  bucket: bucket.name,
  sourceRoot: path.relative(workspace, sourceRoot).replace(/\\/g, '/'),
  destinationRoot,
  collections: Array.from(uploadedCollections).sort(),
  fileCount: files.length,
  uploaded,
  skipped,
  uploadedMB: Number((uploadedBytes / 1024 / 1024).toFixed(2)),
  existingMB: Number((existingBytes / 1024 / 1024).toFixed(2)),
  baseUrlTemplate,
}, null, 2));

await admin.app().delete();
