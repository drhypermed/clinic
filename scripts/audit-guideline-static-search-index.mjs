import admin from 'firebase-admin';
import fs from 'node:fs';
import path from 'node:path';

const sourceRoot = path.resolve('guidelines-sources/_generated/static-search-index');
const destinationRoot = String(process.env.GUIDELINE_STATIC_SEARCH_ROOT || 'guidelines-search/v1').replace(/^\/+|\/+$/g, '');
const defaultProjectId = 'gen-lang-client-0444130146';
const defaultStorageBucket = 'gen-lang-client-0444130146.firebasestorage.app';

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

const localFiles = new Map(
  fs.readdirSync(sourceRoot)
    .filter((name) => fs.statSync(path.join(sourceRoot, name)).isFile())
    .map((name) => [`${destinationRoot}/${name}`, fs.statSync(path.join(sourceRoot, name)).size]),
);
const bucket = admin.storage().bucket();
const [remoteFiles] = await bucket.getFiles({ prefix: `${destinationRoot}/`, autoPaginate: true });
const remote = new Map(remoteFiles.map((file) => [file.name, Number(file.metadata?.size || 0)]));
const missing = [];
const sizeMismatch = [];

for (const [name, size] of localFiles) {
  if (!remote.has(name)) missing.push(name);
  else if (remote.get(name) !== size) sizeMismatch.push({ name, localSize: size, remoteSize: remote.get(name) });
}

const extra = Array.from(remote.keys()).filter((name) => !localFiles.has(name));
const result = {
  bucket: bucket.name,
  destinationRoot,
  localFiles: localFiles.size,
  remoteFiles: remote.size,
  missingCount: missing.length,
  sizeMismatchCount: sizeMismatch.length,
  extraCount: extra.length,
  missing: missing.slice(0, 10),
  sizeMismatch: sizeMismatch.slice(0, 10),
  extra: extra.slice(0, 10),
};
console.log(JSON.stringify(result, null, 2));
await admin.app().delete();

if (missing.length > 0 || sizeMismatch.length > 0) process.exitCode = 1;
