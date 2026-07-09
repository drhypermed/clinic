import admin from 'firebase-admin';
import fs from 'node:fs';
import path from 'node:path';

const workspace = process.cwd();
const sourceRoot = path.resolve('guidelines-sources/_generated/static-search-index');
const destinationRoot = String(process.env.GUIDELINE_STATIC_SEARCH_ROOT || 'guidelines-search/v1').replace(/^\/+|\/+$/g, '');
const defaultProjectId = 'gen-lang-client-0444130146';
const defaultStorageBucket = 'gen-lang-client-0444130146.firebasestorage.app';
const dryRun = process.argv.includes('--dry-run');
const force = process.argv.includes('--force');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const uploadWithRetry = async (bucket, sourcePath, options, maxAttempts = 4) => {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await bucket.upload(sourcePath, options);
      return;
    } catch (error) {
      lastError = error;
      if (attempt >= maxAttempts) break;
      const delayMs = attempt * 2000;
      console.warn(`[static-search-upload] retry ${attempt}/${maxAttempts - 1} after ${delayMs}ms: ${error.message}`);
      await sleep(delayMs);
    }
  }
  throw lastError;
};

if (!fs.existsSync(path.join(sourceRoot, 'manifest.json'))) {
  throw new Error('Static search index is missing. Run export:guidelines:static-search first.');
}

if (!admin.apps.length) {
  const options = {
    projectId: process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || defaultProjectId,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || defaultStorageBucket,
  };
  if (fs.existsSync('service-account.json')) {
    options.credential = admin.credential.cert(JSON.parse(fs.readFileSync('service-account.json', 'utf8')));
  }
  admin.initializeApp(options);
}

const bucket = admin.storage().bucket();
const files = fs.readdirSync(sourceRoot)
  .filter((name) => fs.statSync(path.join(sourceRoot, name)).isFile())
  .sort((a, b) => a.localeCompare(b));

let uploaded = 0;
let skipped = 0;
let uploadedBytes = 0;

for (const [index, name] of files.entries()) {
  const sourcePath = path.join(sourceRoot, name);
  const destination = `${destinationRoot}/${name}`;
  const remoteFile = bucket.file(destination);
  const stat = fs.statSync(sourcePath);
  const [exists] = dryRun ? [false] : await remoteFile.exists();
  let shouldUpload = force || !exists;

  if (exists && !force) {
    const [metadata] = await remoteFile.getMetadata();
    shouldUpload = Number(metadata.size || 0) !== stat.size;
  }

  if (!dryRun && shouldUpload) {
    await uploadWithRetry(bucket, sourcePath, {
      destination,
      resumable: stat.size >= 5 * 1024 * 1024,
      metadata: {
        contentType: name.endsWith('.json') ? 'application/json' : 'application/octet-stream',
        cacheControl: 'private, max-age=31536000, immutable',
        metadata: {
          guidelineStaticSearch: 'true',
        },
      },
    });
    uploaded += 1;
    uploadedBytes += stat.size;
  } else {
    skipped += 1;
  }
  console.log(`[static-search-upload] ${index + 1}/${files.length} ${shouldUpload ? (dryRun ? 'dry-run' : 'uploaded') : 'exists'} ${destination}`);
}

console.log(JSON.stringify({
  dryRun,
  bucket: bucket.name,
  destinationRoot,
  files: files.length,
  uploaded,
  skipped,
  uploadedMB: Number((uploadedBytes / 1024 / 1024).toFixed(2)),
}, null, 2));

await admin.app().delete();
