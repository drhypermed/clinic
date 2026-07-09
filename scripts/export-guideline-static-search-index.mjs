import admin from 'firebase-admin';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const workspace = process.cwd();
const outputRoot = path.resolve('guidelines-sources/_generated/static-search-index');
const serviceAccountPath = path.resolve('service-account.json');
const dimensions = Number(process.env.GUIDELINE_EMBEDDING_DIMENSIONS || 768);
const shardCount = Math.max(4, Math.min(64, Number(process.env.GUIDELINE_STATIC_SEARCH_SHARDS || 24)));
const embeddingModel = process.env.GUIDELINE_EMBEDDING_MODEL || 'gemini-embedding-001';
const pageSize = 500;
const keywordBloomBytes = 256;
const keywordBloomSeeds = [2166136261, 2166136261 ^ 0x9e3779b9, 2166136261 ^ 0x85ebca6b, 2166136261 ^ 0xc2b2ae35];

const ensureInsideWorkspace = (target) => {
  const relative = path.relative(workspace, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Output path must stay inside the workspace: ${target}`);
  }
};

ensureInsideWorkspace(outputRoot);

if (!admin.apps.length) {
  const options = { projectId: process.env.GCLOUD_PROJECT || 'gen-lang-client-0444130146' };
  if (fs.existsSync(serviceAccountPath)) {
    options.credential = admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8')));
  }
  admin.initializeApp(options);
}

const db = admin.firestore();

const stableShard = (value) => {
  let hash = 2166136261;
  for (const character of String(value || 'unknown')) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % shardCount;
};

const normalizeVector = (values) => {
  if (!Array.isArray(values) || values.length !== dimensions) return null;
  let normSquared = 0;
  const vector = new Float32Array(dimensions);
  for (let index = 0; index < dimensions; index += 1) {
    const value = Number(values[index]);
    if (!Number.isFinite(value)) return null;
    vector[index] = value;
    normSquared += value * value;
  }
  const norm = Math.sqrt(normSquared);
  if (!Number.isFinite(norm) || norm <= 0) return null;
  for (let index = 0; index < dimensions; index += 1) {
    vector[index] /= norm;
  }
  return vector;
};

const bloomHash = (value, seed) => {
  let hash = seed >>> 0;
  for (const character of String(value || '')) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  hash ^= hash >>> 16;
  return hash >>> 0;
};

const createKeywordBloom = (keywords) => {
  if (!Array.isArray(keywords) || keywords.length === 0) return '';
  const bytes = Buffer.alloc(keywordBloomBytes);
  const bitCount = keywordBloomBytes * 8;
  for (const keyword of keywords) {
    const value = String(keyword || '').trim();
    if (!value) continue;
    for (const seed of keywordBloomSeeds) {
      const bit = bloomHash(value, seed) % bitCount;
      bytes[bit >> 3] |= 1 << (bit & 7);
    }
  }
  return bytes.toString('base64');
};

const compactChunk = (doc, data, hasEmbedding) => ({
  id: data.id || doc.id,
  bookId: data.bookId || '',
  collectionId: data.collectionId || '',
  school: data.school || '',
  year: Number(data.year || 0),
  sourceTitle: data.sourceTitle || '',
  folderTitle: data.folderTitle || '',
  fileTitle: data.fileTitle || '',
  sourcePath: data.sourcePath || '',
  localFile: data.localFile || data.sourcePath || '',
  pageStart: Number(data.pageStart || data.page || 0),
  pageEnd: Number(data.pageEnd || data.endPage || data.pageStart || data.page || 0),
  chunkIndex: Number(data.chunkIndex || 0),
  globalOrder: Number(data.globalOrder || 0),
  label: data.label || '',
  heading: data.heading || '',
  textPreview: data.textPreview || data.text || '',
  keywordBloom: createKeywordBloom(data.keywords),
  concepts: Array.isArray(data.concepts) ? data.concepts : [],
  intentTags: Array.isArray(data.intentTags) ? data.intentTags : [],
  publicPdfPath: data.publicPdfPath || '',
  storagePdfPath: data.storagePdfPath || '',
  storagePdfUrl: data.storagePdfUrl || '',
  hasEmbedding,
});

const shards = Array.from({ length: shardCount }, (_, index) => ({
  id: String(index).padStart(2, '0'),
  chunks: [],
  vectorBuffers: [],
  collections: new Set(),
}));

let lastDoc = null;
let scanned = 0;
let exported = 0;
let skipped = 0;
let embedded = 0;

while (true) {
  let query = db.collection('guideline_chunk_search')
    .orderBy(admin.firestore.FieldPath.documentId())
    .select(
      'id', 'bookId', 'collectionId', 'school', 'year', 'sourceTitle', 'folderTitle',
      'fileTitle', 'sourcePath', 'localFile', 'pageStart', 'pageEnd', 'page', 'endPage',
      'chunkIndex', 'globalOrder', 'label', 'heading', 'textPreview', 'text',
      'keywords', 'concepts', 'intentTags', 'publicPdfPath', 'storagePdfPath', 'storagePdfUrl',
      'embedding', 'embeddingModel', 'embeddingDimensions',
    )
    .limit(pageSize);

  if (lastDoc) query = query.startAfter(lastDoc);
  const snapshot = await query.get();
  if (snapshot.empty) break;

  for (const doc of snapshot.docs) {
    scanned += 1;
    const data = doc.data() || {};
    const vector = normalizeVector(data.embedding);
    if (!vector) skipped += 1;
    else embedded += 1;

    const collectionId = String(data.collectionId || 'unknown');
    const shard = shards[stableShard(collectionId)];
    shard.chunks.push(compactChunk(doc, data, Boolean(vector)));
    const storedVector = vector || new Float32Array(dimensions);
    shard.vectorBuffers.push(Buffer.from(storedVector.buffer, storedVector.byteOffset, storedVector.byteLength));
    shard.collections.add(collectionId);
    exported += 1;
  }

  lastDoc = snapshot.docs[snapshot.docs.length - 1];
  console.log(`[static-search-export] scanned=${scanned} exported=${exported} last=${lastDoc.id}`);
}

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(outputRoot, { recursive: true });

const manifestShards = [];
const collectionToShard = {};

for (const shard of shards) {
  if (shard.chunks.length === 0) continue;
  const baseName = `shard-${shard.id}`;
  const metadata = {
    formatVersion: 1,
    shardId: shard.id,
    dimensions,
    count: shard.chunks.length,
    chunks: shard.chunks,
  };
  const metadataJson = Buffer.from(JSON.stringify(metadata));
  const metadataGzip = zlib.gzipSync(metadataJson, { level: 9 });
  const vectors = Buffer.concat(shard.vectorBuffers);
  const metadataPath = path.join(outputRoot, `${baseName}.json.gz`);
  const vectorsPath = path.join(outputRoot, `${baseName}.f32`);
  fs.writeFileSync(metadataPath, metadataGzip);
  fs.writeFileSync(vectorsPath, vectors);

  const collections = Array.from(shard.collections).sort();
  collections.forEach((collectionId) => {
    collectionToShard[collectionId] = shard.id;
  });
  manifestShards.push({
    id: shard.id,
    count: shard.chunks.length,
    collections,
    metadataPath: `${baseName}.json.gz`,
    vectorsPath: `${baseName}.f32`,
    metadataBytes: metadataGzip.length,
    vectorsBytes: vectors.length,
    metadataSha256: crypto.createHash('sha256').update(metadataGzip).digest('hex'),
    vectorsSha256: crypto.createHash('sha256').update(vectors).digest('hex'),
  });
}

const manifest = {
  formatVersion: 1,
  generatedAt: new Date().toISOString(),
  embeddingModel,
  dimensions,
  chunkCount: exported,
  embeddedChunkCount: embedded,
  skippedChunkCount: skipped,
  shardCount: manifestShards.length,
  collectionToShard,
  shards: manifestShards,
};

fs.writeFileSync(path.join(outputRoot, 'manifest.json'), JSON.stringify(manifest, null, 2));

console.log(JSON.stringify({
  outputRoot: path.relative(workspace, outputRoot).replace(/\\/g, '/'),
  scanned,
  exported,
  embedded,
  skipped,
  dimensions,
  shardCount: manifestShards.length,
  metadataMB: Number((manifestShards.reduce((sum, shard) => sum + shard.metadataBytes, 0) / 1024 / 1024).toFixed(2)),
  vectorsMB: Number((manifestShards.reduce((sum, shard) => sum + shard.vectorsBytes, 0) / 1024 / 1024).toFixed(2)),
}, null, 2));

await admin.app().delete();
