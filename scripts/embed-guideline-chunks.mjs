import admin from 'firebase-admin';
import fs from 'node:fs';
import { FieldValue } from 'firebase-admin/firestore';

const projectId = 'gen-lang-client-0444130146';
const model = process.env.GUIDELINE_EMBEDDING_MODEL || 'gemini-embedding-001';
const dimensions = Number(process.env.GUIDELINE_EMBEDDING_DIMENSIONS || 768);
const batchSize = Math.min(80, Math.max(1, Number(process.env.GUIDELINE_EMBEDDING_BATCH || 32)));
const requestDelayMs = Math.max(0, Number(process.env.GUIDELINE_EMBEDDING_DELAY_MS || 750));
const maxRetries = Math.max(0, Number(process.env.GUIDELINE_EMBEDDING_MAX_RETRIES || 8));
const limit = Number(process.env.GUIDELINE_EMBEDDING_LIMIT || 0);
const dryRun = process.argv.includes('--dry-run');
const force = process.argv.includes('--force');
const onlyFilters = process.argv
  .filter((arg) => arg.startsWith('--only='))
  .flatMap((arg) => arg.slice('--only='.length).split(','))
  .map((value) => value.trim().replace(/\\/g, '/').toLowerCase())
  .filter(Boolean);
const onlySchools = new Set(
  (process.env.GUIDELINE_EMBEDDING_SCHOOLS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
);

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

const matchesOnlyFilter = (data) => {
  if (onlyFilters.length === 0) return true;
  const candidates = [
    data.sourcePath,
    data.localFile,
    data.bookId,
    data.id,
    data.fileTitle,
    data.sourceTitle,
  ]
    .filter(Boolean)
    .map((value) => String(value).replace(/\\/g, '/').toLowerCase());
  return onlyFilters.some((filter) =>
    candidates.some((candidate) => candidate === filter || candidate.includes(filter))
  );
};

if (!apiKey && !dryRun) {
  throw new Error('Missing GEMINI_API_KEY or GOOGLE_API_KEY. Use --dry-run to inspect without writing.');
}

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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const chunkForEmbedding = (data) => [
  data.school,
  data.year,
  data.sourceTitle,
  data.folderTitle,
  data.fileTitle,
  data.heading,
  data.label,
  data.text || data.textPreview,
].filter(Boolean).join('\n').slice(0, 6000);

const embedBatchOnce = async (items) => {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:batchEmbedContents?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: items.map((item) => ({
        model: `models/${model}`,
        content: { parts: [{ text: item.text }] },
        taskType: 'RETRIEVAL_DOCUMENT',
        outputDimensionality: dimensions,
      })),
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Embedding request failed ${response.status}: ${body.slice(0, 500)}`);
  }

  const data = await response.json();
  return (data.embeddings || []).map((embedding) => embedding.values || []);
};

const embedBatch = async (items) => {
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await embedBatchOnce(items);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const retryable = /\b(429|500|502|503|504)\b/.test(message);
      if (!retryable || attempt >= maxRetries) throw error;
      const delay = Math.min(120000, 5000 * 2 ** attempt);
      console.warn(`[guideline-embeddings] retry ${attempt + 1}/${maxRetries} after ${delay}ms: ${message.slice(0, 180)}`);
      await sleep(delay);
    }
  }
  throw new Error('Embedding request failed after retries.');
};

const collectTargets = async () => {
  const targets = [];
  let lastDoc = null;

  while (true) {
    let query = db.collection('guideline_chunk_search')
      .orderBy(admin.firestore.FieldPath.documentId())
      .select(
        'school',
        'year',
        'sourceTitle',
        'folderTitle',
        'fileTitle',
        'sourcePath',
        'localFile',
        'bookId',
        'id',
        'heading',
        'label',
        'text',
        'textPreview',
        'embeddingModel',
        'embeddingDimensions',
      )
      .limit(1000);

    if (lastDoc) query = query.startAfter(lastDoc);
    const snapshot = await query.get();
    if (snapshot.empty) break;

    snapshot.forEach((doc) => {
      const data = doc.data() || {};
      if (onlySchools.size > 0 && !onlySchools.has(String(data.school || ''))) return;
      if (!matchesOnlyFilter({ ...data, id: doc.id })) return;
      if (!force && data.embeddingModel === model && Number(data.embeddingDimensions || 0) === dimensions) return;
      const text = chunkForEmbedding(data);
      if (text.length < 40) return;
      targets.push({ id: doc.id, text });
    });

    lastDoc = snapshot.docs[snapshot.docs.length - 1];
    console.log(`[guideline-embeddings] scanned=${targets.length} targets so far, last=${lastDoc.id}`);
    if (limit > 0 && targets.length >= limit) return targets.slice(0, limit);
  }

  return targets;
};

const targets = await collectTargets();
console.log(`[guideline-embeddings] targets=${targets.length} model=${model} dimensions=${dimensions} dryRun=${dryRun}`);

if (dryRun || targets.length === 0) {
  process.exit(0);
}

let written = 0;
for (let i = 0; i < targets.length; i += batchSize) {
  const batchItems = targets.slice(i, i + batchSize);
  const embeddings = await embedBatch(batchItems);
  const batch = db.batch();
  batchItems.forEach((item, index) => {
    const values = embeddings[index];
    if (!Array.isArray(values) || values.length === 0) return;
    const vectorValues = values.map(Number);
    const payload = {
      embedding: vectorValues,
      embeddingVector: FieldValue.vector(vectorValues),
      embeddingModel: model,
      embeddingDimensions: dimensions,
      embeddingUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    batch.update(db.collection('guideline_chunk_search').doc(item.id), payload);
    written += 1;
  });
  await batch.commit();
  console.log(`[guideline-embeddings] ${Math.min(i + batchSize, targets.length)}/${targets.length} processed`);
  await sleep(requestDelayMs);
}

console.log(`[guideline-embeddings] done written=${written}`);
