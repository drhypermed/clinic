import admin from 'firebase-admin';
import fs from 'node:fs';
import path from 'node:path';

const dryRun = process.argv.includes('--dry-run');
const confirm = process.argv.includes('--confirm');

if (!dryRun && !confirm) {
  throw new Error('Pass --dry-run to inspect, or --confirm to delete the verified static duplicate.');
}

const workspace = process.cwd();
const staticManifestPath = path.resolve('guidelines-sources/_generated/static-search-index/manifest.json');
const relativeManifestPath = path.relative(workspace, staticManifestPath);

if (relativeManifestPath.startsWith('..') || path.isAbsolute(relativeManifestPath) || !fs.existsSync(staticManifestPath)) {
  throw new Error(`Static search manifest is missing from the workspace: ${staticManifestPath}`);
}

const staticManifest = JSON.parse(fs.readFileSync(staticManifestPath, 'utf8'));
const staticChunkCount = Number(
  staticManifest.chunkCount
  || (staticManifest.shards || []).reduce((sum, shard) => sum + Number(shard.count || 0), 0),
);

if (!Number.isSafeInteger(staticChunkCount) || staticChunkCount < 1) {
  throw new Error('Static search manifest does not contain a valid chunk count.');
}

if (!admin.apps.length) {
  const serviceAccountPath = path.resolve('service-account.json');
  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error('service-account.json is required for this maintenance script.');
  }
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))),
  });
}

const db = admin.firestore();
const collection = db.collection('guideline_chunk_search');

const countSearchChunks = async () => Number((await collection.count().get()).data().count || 0);

const deleteSearchChunks = async (pageSize = 500) => {
  let deleted = 0;
  for (;;) {
    const snapshot = await collection.limit(pageSize).get();
    if (snapshot.empty) return deleted;

    // BulkWriter يحذف كل مستند في عملية مستقلة، لذلك لا نصطدم بحد حجم
    // transaction عند وجود فهارس vector كبيرة، وفي الوقت نفسه يستأنف
    // بأمان من الصفحة المتبقية لو انقطعت نافذة الأوامر.
    const writer = db.bulkWriter({
      throttling: { initialOpsPerSecond: 50, maxOpsPerSecond: 150 },
    });
    writer.onWriteError((error) => [4, 10, 13, 14].includes(error.code) && error.failedAttempts < 8);
    snapshot.docs.forEach((doc) => writer.delete(doc.ref));
    await writer.close();
    deleted += snapshot.size;
    console.log(`guideline_chunk_search: deleted ${deleted}`);
  }
};

const main = async () => {
  const firestoreChunkCount = await countSearchChunks();
  const report = {
    dryRun,
    staticManifest: relativeManifestPath.replace(/\\/g, '/'),
    staticManifestGeneratedAt: staticManifest.generatedAt || '',
    staticChunkCount,
    firestoreChunkCount,
    staticCoverageVerified: firestoreChunkCount <= staticChunkCount,
  };

  console.log(JSON.stringify(report, null, 2));
  if (dryRun) return;

  if (firestoreChunkCount > staticChunkCount) {
    throw new Error(
      `Refusing deletion: Firestore has ${firestoreChunkCount} chunks, more than the verified static index's ${staticChunkCount}.`,
    );
  }

  const auditRef = db.collection('guideline_migration_audits').doc(`static-search-cleanup-${new Date().toISOString()}`);
  await auditRef.set({
    ...report,
    startedAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'running',
  });

  const deleted = await deleteSearchChunks();
  const remaining = await countSearchChunks();
  if (remaining !== 0) {
    throw new Error(`Cleanup did not finish: ${remaining} Firestore search chunks remain.`);
  }

  await auditRef.set({
    deleted,
    remaining,
    finishedAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'completed',
  }, { merge: true });

  console.log(JSON.stringify({ deleted, remaining }, null, 2));
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await admin.app().delete().catch(() => undefined);
  });
