import admin from 'firebase-admin';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';

const workspace = process.cwd();
const outputRoot = path.resolve('guidelines-sources/_generated/static-books');
const defaultProjectId = 'gen-lang-client-0444130146';
const onlyFilters = process.argv
  .filter((arg) => arg.startsWith('--only='))
  .flatMap((arg) => arg.slice('--only='.length).split(','))
  .map((value) => value.trim().replace(/\\/g, '/').toLowerCase())
  .filter(Boolean);

const ensureInsideWorkspace = (target, label) => {
  const relative = path.relative(workspace, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label} must stay inside the workspace: ${target}`);
  }
};

ensureInsideWorkspace(outputRoot, 'Output root');

const rel = (target) => path.relative(workspace, target).replace(/\\/g, '/');

const matchesOnlyFilter = (collectionId) => {
  if (onlyFilters.length === 0) return true;
  const normalized = collectionId.toLowerCase();
  return onlyFilters.some((filter) => (
    normalized === filter
    || normalized.startsWith(`${filter}-`)
    || normalized.startsWith(`${filter}_`)
  ));
};

const stableSortById = (items) =>
  items.sort((a, b) => String(a.id || a.sourceId || '').localeCompare(String(b.id || b.sourceId || '')));

const writeJsonWithGzip = (target, payload) => {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const json = `${JSON.stringify(payload)}\n`;
  fs.writeFileSync(target, json, 'utf8');
  fs.writeFileSync(`${target}.gz`, zlib.gzipSync(json, { level: 9 }));
  return {
    path: rel(target),
    gzipPath: rel(`${target}.gz`),
    bytes: Buffer.byteLength(json),
    gzipBytes: fs.statSync(`${target}.gz`).size,
    sha256: crypto.createHash('sha256').update(json).digest('hex'),
  };
};

const listStaticCollectionIds = () => {
  if (!fs.existsSync(outputRoot)) return [];
  return fs.readdirSync(outputRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter(matchesOnlyFilter)
    .sort((a, b) => a.localeCompare(b));
};

if (!admin.apps.length) {
  const serviceAccountPath = 'service-account.json';
  const appOptions = {
    projectId: process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || defaultProjectId,
  };
  if (fs.existsSync(serviceAccountPath)) {
    appOptions.credential = admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8')));
  }
  admin.initializeApp(appOptions);
}

const db = admin.firestore();
const collectionIds = listStaticCollectionIds();
if (collectionIds.length === 0) {
  throw new Error(`No static guideline collections found in ${rel(outputRoot)}. Run export:guidelines:static first.`);
}

const fetchCollectionDocs = async (collectionName, collectionId) => {
  const snapshot = await db.collection(collectionName)
    .where('collectionId', '==', collectionId)
    .get();
  return snapshot.docs.map((doc) => doc.data());
};

const exported = [];
for (const [index, collectionId] of collectionIds.entries()) {
  const [topics, recommendationDigest] = await Promise.all([
    fetchCollectionDocs('guideline_topics', collectionId),
    fetchCollectionDocs('guideline_digests', collectionId),
  ]);

  const payload = {
    generatedAt: new Date().toISOString(),
    formatVersion: 1,
    collectionId,
    topics: stableSortById(topics),
    recommendationDigest: recommendationDigest.length > 0 ? stableSortById(recommendationDigest) : undefined,
  };

  const output = writeJsonWithGzip(path.join(outputRoot, collectionId, 'collection-data.json'), payload);
  exported.push({
    collectionId,
    topics: topics.length,
    digests: recommendationDigest.length,
    path: output.path,
    gzipPath: output.gzipPath,
    bytes: output.bytes,
    gzipBytes: output.gzipBytes,
  });
  console.log(`[guideline-static-metadata] ${index + 1}/${collectionIds.length} ${collectionId}: ${topics.length} topics, ${recommendationDigest.length} digests`);
}

console.log(JSON.stringify({
  outputRoot: rel(outputRoot),
  collections: exported,
}, null, 2));

await admin.app().delete();
