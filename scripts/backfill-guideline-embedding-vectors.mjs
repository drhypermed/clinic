import admin from 'firebase-admin';
import fs from 'node:fs';
import { FieldValue } from 'firebase-admin/firestore';

const projectId = 'gen-lang-client-0444130146';
const dimensions = Number(process.env.GUIDELINE_EMBEDDING_DIMENSIONS || 768);
const batchSize = Math.min(500, Math.max(1, Number(process.env.GUIDELINE_VECTOR_BACKFILL_BATCH || 300)));
const limit = Number(process.env.GUIDELINE_VECTOR_BACKFILL_LIMIT || 0);
const dryRun = process.argv.includes('--dry-run');
const force = process.argv.includes('--force');
const startAfterId = String(process.env.GUIDELINE_VECTOR_BACKFILL_START_AFTER || '').trim();

if (!admin.apps.length) {
  const serviceAccountPath = 'service-account.json';
  if (fs.existsSync(serviceAccountPath)) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))),
    });
  } else {
    admin.initializeApp({ projectId });
  }
}

const db = admin.firestore();

let scanned = 0;
let eligible = 0;
let written = 0;
let skippedExisting = 0;
let skippedInvalid = 0;
let lastDoc = null;
let pendingStartAfterId = startAfterId;

while (true) {
  let query = db.collection('guideline_chunk_search')
    .orderBy(admin.firestore.FieldPath.documentId())
    .select('embedding', 'embeddingVector', 'embeddingDimensions')
    .limit(batchSize);

  if (lastDoc) query = query.startAfter(lastDoc);
  else if (pendingStartAfterId) query = query.startAfter(pendingStartAfterId);
  const snapshot = await query.get();
  if (snapshot.empty) break;

  const batch = db.batch();
  let writesInBatch = 0;

  snapshot.forEach((doc) => {
    scanned += 1;
    const data = doc.data() || {};
    const values = Array.isArray(data.embedding) ? data.embedding.map(Number) : [];
    if (values.length !== dimensions || values.some((value) => !Number.isFinite(value))) {
      skippedInvalid += 1;
      return;
    }
    if (!force && data.embeddingVector) {
      skippedExisting += 1;
      return;
    }
    eligible += 1;
    if (!dryRun) {
      batch.update(doc.ref, {
        embeddingVector: FieldValue.vector(values),
        embeddingVectorDimensions: dimensions,
        embeddingVectorUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      writesInBatch += 1;
    }
  });

  if (!dryRun && writesInBatch > 0) {
    await batch.commit();
    written += writesInBatch;
  }

  lastDoc = snapshot.docs[snapshot.docs.length - 1];
  pendingStartAfterId = '';
  console.log(`[guideline-vector-backfill] scanned=${scanned} eligible=${eligible} written=${written} skippedExisting=${skippedExisting} skippedInvalid=${skippedInvalid} last=${lastDoc.id}`);

  if (limit > 0 && scanned >= limit) break;
}

console.log(JSON.stringify({
  dryRun,
  force,
  dimensions,
  scanned,
  eligible,
  written,
  skippedExisting,
  skippedInvalid,
}, null, 2));

await admin.app().delete().catch(() => undefined);
