import admin from 'firebase-admin';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { deletePatientImageById } = require('../functions/src/patientImageStore.js');

const PROJECT_ID = 'gen-lang-client-0444130146';
const STORAGE_BUCKET = `${PROJECT_ID}.firebasestorage.app`;
const readArg = (name) => {
  const prefix = `--${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix));
  return value ? value.slice(prefix.length).trim() : '';
};

const userId = readArg('user');
const imageIds = Array.from(new Set(readArg('images').split(',').map((id) => id.trim()).filter(Boolean)));
const execute = process.argv.includes('--execute');
if (!/^[A-Za-z0-9_-]{6,128}$/.test(userId) || imageIds.some((id) => !/^[A-Za-z0-9_-]{6,200}$/.test(id))) {
  throw new Error('Pass valid --user=<uid> and --images=<id,id>');
}
if (imageIds.length === 0 || imageIds.length > 50) throw new Error('Pass between 1 and 50 image ids');

const options = { projectId: PROJECT_ID, storageBucket: STORAGE_BUCKET };
if (fs.existsSync('service-account.json')) {
  options.credential = admin.credential.cert(JSON.parse(fs.readFileSync('service-account.json', 'utf8')));
}
admin.initializeApp(options);
const db = admin.firestore();

for (const imageId of imageIds) {
  const ref = db.collection('users').doc(userId).collection('patientImages').doc(imageId);
  const snapshot = await ref.get();
  const data = snapshot.data() || {};
  const report = {
    imageId,
    metadataExists: snapshot.exists,
    source: String(data.source || ''),
    status: String(data.status || ''),
    storagePath: String(data.storagePath || ''),
  };
  console.log(JSON.stringify(report));
  if (execute && snapshot.exists) {
    const result = await deletePatientImageById({ admin, db, userId, imageId });
    console.log(JSON.stringify({ imageId, result }));
  }
}

console.log(execute ? 'Permanent deletion completed.' : 'Dry run only; pass --execute to delete.');

