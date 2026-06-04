import admin from 'firebase-admin';
import fs from 'node:fs';
import path from 'node:path';

const dryRun = process.argv.includes('--dry-run');
const confirm = process.argv.includes('--confirm');

if (!dryRun && !confirm) {
  throw new Error('Pass --confirm to delete legacy guideline collections, or --dry-run to inspect counts.');
}

if (!admin.apps.length) {
  const serviceAccountPath = path.resolve('service-account.json');
  if (fs.existsSync(serviceAccountPath)) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))),
    });
  } else {
    admin.initializeApp({ projectId: 'gen-lang-client-0444130146' });
  }
}

const db = admin.firestore();

const legacyCollections = [
  'guideline_topics',
  'guideline_digests',
  'guideline_chunks',
];

const countCollection = async (name) => {
  const snapshot = await db.collection(name).count().get();
  return Number(snapshot.data().count || 0);
};

const deleteCollection = async (name, batchSize = 50) => {
  let deleted = 0;
  for (;;) {
    const snapshot = await db.collection(name).limit(batchSize).get();
    if (snapshot.empty) break;

    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    deleted += snapshot.size;
    console.log(`${name}: deleted ${deleted}`);
  }
  return deleted;
};

const main = async () => {
  const canonicalBooks = await countCollection('guideline_books');
  const canonicalChunks = await countCollection('guideline_book_chunks');
  if (!dryRun && (canonicalBooks < 1 || canonicalChunks < 1)) {
    throw new Error(`Canonical guideline data is not ready: books=${canonicalBooks}, chunks=${canonicalChunks}`);
  }

  const before = {};
  for (const name of legacyCollections) {
    before[name] = await countCollection(name);
  }

  console.log(JSON.stringify({
    dryRun,
    canonicalBooks,
    canonicalChunks,
    legacyBefore: before,
  }, null, 2));

  if (dryRun) return;

  const auditRef = db.collection('guideline_migration_audits').doc(`legacy-cleanup-${new Date().toISOString()}`);
  await auditRef.set({
    canonicalBooks,
    canonicalChunks,
    legacyBefore: before,
    startedAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'running',
  });

  const deleted = {};
  for (const name of legacyCollections) {
    deleted[name] = await deleteCollection(name);
  }

  const after = {};
  for (const name of legacyCollections) {
    after[name] = await countCollection(name);
  }

  await auditRef.set({
    deleted,
    legacyAfter: after,
    finishedAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'completed',
  }, { merge: true });

  console.log(JSON.stringify({ deleted, legacyAfter: after }, null, 2));
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await admin.app().delete().catch(() => undefined);
  });
