import admin from 'firebase-admin';
import fs from 'node:fs';
import path from 'node:path';

const workspace = process.cwd();
const sourceRoot = path.resolve('guidelines-sources/_generated/static-books');
const defaultProjectId = 'gen-lang-client-0444130146';
const defaultStorageBucket = 'gen-lang-client-0444130146.firebasestorage.app';
const destinationRoot = 'guidelines-static';

const ensureInsideWorkspace = (target, label) => {
  const relative = path.relative(workspace, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label} must stay inside the workspace: ${target}`);
  }
};

ensureInsideWorkspace(sourceRoot, 'Source root');

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

const localFiles = new Map(
  walkFiles(sourceRoot).map((filePath) => [
    `${destinationRoot}/${path.relative(sourceRoot, filePath).replace(/\\/g, '/')}`,
    fs.statSync(filePath).size,
  ]),
);

const bucket = admin.storage().bucket();
const [remoteFiles] = await bucket.getFiles({
  prefix: `${destinationRoot}/`,
  autoPaginate: true,
});
const remoteFilesByName = new Map(
  remoteFiles.map((file) => [file.name, Number(file.metadata?.size || 0)]),
);

const missing = [];
const sizeMismatch = [];
for (const [name, localSize] of localFiles) {
  const remoteSize = remoteFilesByName.get(name);
  if (remoteSize === undefined) {
    missing.push(name);
  } else if (remoteSize !== localSize) {
    sizeMismatch.push({ name, localSize, remoteSize });
  }
}

const extra = Array.from(remoteFilesByName.keys())
  .filter((name) => !localFiles.has(name));

console.log(JSON.stringify({
  bucket: bucket.name,
  sourceRoot: path.relative(workspace, sourceRoot).replace(/\\/g, '/'),
  destinationRoot,
  localFiles: localFiles.size,
  remoteFiles: remoteFilesByName.size,
  missingCount: missing.length,
  sizeMismatchCount: sizeMismatch.length,
  extraCount: extra.length,
  missing: missing.slice(0, 10),
  sizeMismatch: sizeMismatch.slice(0, 10),
  extra: extra.slice(0, 10),
}, null, 2));

await admin.app().delete();
