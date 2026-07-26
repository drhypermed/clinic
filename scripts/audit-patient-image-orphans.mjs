import admin from 'firebase-admin';
import fs from 'node:fs';

const PROJECT_ID = 'gen-lang-client-0444130146';
const DEFAULT_BUCKET = `${PROJECT_ID}.firebasestorage.app`;

const readArg = (name) => {
  const prefix = `--${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix));
  return value ? value.slice(prefix.length).trim() : '';
};

const userId = readArg('user');
const shouldDelete = process.argv.includes('--delete');
const minAgeMinutes = Math.max(0, Number(readArg('min-age-minutes') || 120));

if (!/^[A-Za-z0-9_-]{6,128}$/.test(userId)) {
  throw new Error('Pass a valid --user=<firebase-uid>');
}

const serviceAccountPath = 'service-account.json';
const options = {
  projectId: PROJECT_ID,
  storageBucket: DEFAULT_BUCKET,
};
if (fs.existsSync(serviceAccountPath)) {
  options.credential = admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8')));
}
admin.initializeApp(options);

const db = admin.firestore();
const bucket = admin.storage().bucket(DEFAULT_BUCKET);
const prefix = `patient-images/${userId}/`;
const [files] = await bucket.getFiles({ prefix });
const nowMs = Date.now();
const minAgeMs = minAgeMinutes * 60 * 1000;

const candidates = [];
for (const file of files) {
  const [metadata] = await file.getMetadata();
  const imageId = String(metadata?.metadata?.patientImageId || '').trim();
  const createdMs = Date.parse(String(metadata?.timeCreated || ''));
  if (!imageId || imageId.includes('/') || !Number.isFinite(createdMs)) {
    console.warn('SKIP unsafe object metadata:', file.name);
    continue;
  }
  candidates.push({ file, imageId, createdMs, size: Number(metadata.size || 0) });
}

const snapshots = candidates.length > 0
  ? await db.getAll(...candidates.map(({ imageId }) => (
      db.collection('users').doc(userId).collection('patientImages').doc(imageId)
    )))
  : [];

let kept = 0;
let deleted = 0;
let orphanBytes = 0;
for (let index = 0; index < candidates.length; index += 1) {
  const candidate = candidates[index];
  if (snapshots[index]?.exists) {
    kept += 1;
    continue;
  }
  if (nowMs - candidate.createdMs < minAgeMs) {
    console.log('ORPHAN_TOO_NEW:', candidate.file.name);
    continue;
  }

  orphanBytes += candidate.size;
  console.log(shouldDelete ? 'DELETE_ORPHAN:' : 'ORPHAN:', candidate.file.name);
  if (shouldDelete) {
    await candidate.file.delete({ ignoreNotFound: true });
    deleted += 1;
  }
}

console.log(JSON.stringify({
  bucket: bucket.name,
  prefix,
  objects: files.length,
  kept,
  orphanBytes,
  deleted,
  mode: shouldDelete ? 'delete' : 'dry-run',
}, null, 2));

