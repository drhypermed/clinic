import admin from 'firebase-admin';
import fs from 'node:fs';
import path from 'node:path';
import { GUIDELINE_COLLECTIONS, loadGuidelineCollectionData } from '../components/guidelines/guidelinesData';
import { buildGuidelineChatIndex } from '../components/guidelines/guidelineChatSearch';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccountPath = path.resolve('service-account.json');
  if (fs.existsSync(serviceAccountPath)) {
    console.log('🔑 Found service-account.json, initializing with service account credentials...');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath),
    });
  } else {
    console.log('☁️ Initializing with Application Default Credentials...');
    admin.initializeApp({
      projectId: 'gen-lang-client-0444130146',
    });
  }
}

const db = admin.firestore();

// Clinical Aliases and Stop Words for Keyword Indexing
const normalizeSearchText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/\bhaem/g, 'hem')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

const stopWords = new Set([
  'a', 'an', 'and', 'are', 'be', 'can', 'do', 'does', 'for', 'from', 'how', 'i', 'in', 'is', 'me', 'of', 'on', 'or',
  'should', 'the', 'to', 'use', 'what', 'when', 'with', 'ابدا', 'استخدم', 'ايه', 'الى', 'او', 'ال', 'انا', 'في',
  'كيف', 'ما', 'متي', 'مع', 'من', 'ممكن', 'هل',
]);

const clinicalAliasGroups = [
  ['aki', 'acute kidney injury', 'kidney injury', 'acute renal failure', 'اصابه كلويه حاده', 'فشل كلوي حاد'],
  ['akd', 'acute kidney disease', 'acute kidney diseases and disorders', 'مرض كلوي حاد'],
  ['ckd', 'chronic kidney disease', 'chronic renal disease', 'قصور كلوي مزمن', 'مرض كلوي مزمن'],
  ['rrt', 'krt', 'renal replacement therapy', 'kidney replacement therapy', 'dialysis', 'hemodialysis', 'haemodialysis', 'peritoneal dialysis', 'غسيل كلوي', 'بدء الغسيل'],
  ['esa', 'erythropoiesis stimulating agent', 'epoetin', 'darbepoetin', 'erythropoietin', 'محفزات تكوين الدم'],
  ['hb', 'hgb', 'hemoglobin', 'haemoglobin', 'هيموجلوبين'],
  ['iron', 'ferritin', 'tsat', 'transferrin saturation', 'حديد', 'فيريتين'],
  ['egfr', 'gfr', 'estimated glomerular filtration rate', 'glomerular filtration rate'],
  ['scr', 'serum creatinine', 'creatinine', 'كرياتينين'],
  ['urine output', 'oliguria', 'anuria', 'diuresis', 'بول', 'قلة البول', 'انقطاع البول'],
  ['hyperkalemia', 'hyperkalaemia', 'potassium', 'k', 'بوتاسيوم'],
  ['acidosis', 'metabolic acidosis', 'حماض'],
  ['fluid overload', 'volume overload', 'pulmonary edema', 'oedema', 'وذمه', 'احتقان'],
  ['uremia', 'uraemia', 'uremic', 'يوريميا'],
  ['diabetes', 'dm', 't2d', 't2dm', 'type 2 diabetes', 'سكري'],
  ['a1c', 'hba1c', 'glycated hemoglobin', 'glycaemic', 'glycemic', 'سكر تراكمي'],
  ['bp', 'blood pressure', 'hypertension', 'ضغط الدم', 'ضغط'],
  ['sglt2', 'sglt2 inhibitor', 'sodium glucose cotransporter 2'],
  ['glp1', 'glp 1', 'glp 1 ra', 'glp-1 receptor agonist'],
  ['ascvd', 'atherosclerotic cardiovascular disease', 'cardiovascular disease', 'cvd'],
  ['asthma', 'ربو', 'حساسيه صدر'],
  ['ics', 'inhaled corticosteroid', 'corticosteroid inhaled', 'كورتيزون استنشاق'],
  ['saba', 'short acting beta agonist', 'salbutamol', 'albuterol'],
  ['laba', 'long acting beta agonist', 'formoterol', 'salmeterol'],
  ['mart', 'maintenance and reliever therapy', 'smart', 'anti inflammatory reliever'],
];

const splitTerms = (value: string) =>
  value
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2 && !stopWords.has(term));

// High-speed Keyword Extraction for Firestore search index
const extractKeywords = (text: string, label: string = ''): string[] => {
  const normalized = normalizeSearchText(`${label} ${text}`);
  const words = splitTerms(normalized);
  const keywordSet = new Set<string>();

  // Add all base words
  words.forEach((w) => keywordSet.add(w));

  // Expand medical aliases
  for (const aliases of clinicalAliasGroups) {
    const matched = aliases.some((alias) => {
      const normalizedAlias = normalizeSearchText(alias);
      return normalized.includes(normalizedAlias);
    });

    if (matched) {
      aliases.forEach((alias) => {
        const normalizedAlias = normalizeSearchText(alias);
        splitTerms(normalizedAlias).forEach((w) => keywordSet.add(w));
      });
    }
  }

  return Array.from(keywordSet);
};

async function main() {
  console.log('🚀 Starting Guidelines database migration to Firestore...');
  const bulkWriter = db.bulkWriter();
  let uploadedCount = 0;

  bulkWriter.onWriteError((error) => {
    console.error('❌ Firestore write failed:', {
      code: error.code,
      message: error.message,
      path: error.documentRef?.path || '',
    });
    return false;
  });

  // 1. Gather Structured Guideline Chunks from TypeScript Data
  console.log('\n📦 Compiling structured guidelines...');
  const structuredChunks: any[] = [];
  
  for (const collection of GUIDELINE_COLLECTIONS) {
    const data = await loadGuidelineCollectionData(collection.id);
    if (!data) continue;

    console.log(`- Compiling structured topics for ${collection.school} ${collection.year}...`);
    const compiled = buildGuidelineChatIndex([{ collection, data }]);
    structuredChunks.push(...compiled);

    // Queue structured topics upload
    console.log(`- Queueing structured topics for ${collection.school} ${collection.year}...`);
    for (const topic of data.topics) {
      const topicRef = db.collection('guideline_topics').doc(`${collection.id}:${topic.id}`);
      const topicPayload = {
        id: topic.id,
        collectionId: collection.id,
        group: topic.group,
        title: topic.title,
        summary: topic.summary,
        points: topic.points,
        details: topic.details || null,
        quickDecision: topic.quickDecision || null,
        practiceNote: topic.practiceNote || null,
        visuals: topic.visuals || null,
        sourceIds: topic.sourceIds || [],
        tags: topic.tags || [],
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      bulkWriter.set(topicRef, topicPayload, { merge: true });
    }

    // Queue recommendation digests upload
    if (data.recommendationDigest) {
      console.log(`- Queueing recommendation digests for ${collection.school} ${collection.year}...`);
      for (const digest of data.recommendationDigest) {
        const digestRef = db.collection('guideline_digests').doc(`${collection.id}:${digest.sourceId}`);
        const digestPayload = {
          sourceId: digest.sourceId,
          collectionId: collection.id,
          title: digest.title,
          sourcePdf: digest.sourcePdf,
          recommendations: digest.recommendations || [],
          tablesAndFigures: digest.tablesAndFigures || [],
          tableTextRows: digest.tableTextRows || [],
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        bulkWriter.set(digestRef, digestPayload, { merge: true });
      }
    }
  }
  console.log(`✓ Structured topics compiled: ${structuredChunks.length} chunks.`);

  // 2. Gather Full-Text Guideline Chunks from compiled JSON index
  console.log('\n📖 Compiling full-text guidelines...');
  const fullTextIndexPath = path.resolve('public/guidelines-search/full-text-index.json');
  let fullTextChunks: any[] = [];

  if (fs.existsSync(fullTextIndexPath)) {
    const payload = JSON.parse(fs.readFileSync(fullTextIndexPath, 'utf8'));
    if (Array.isArray(payload.chunks)) {
      fullTextChunks = payload.chunks;
      console.log(`✓ Full-text chunks loaded: ${fullTextChunks.length} chunks.`);
    }
  } else {
    console.warn('⚠️ full-text-index.json was not found. Full-text search chunks will not be uploaded.');
  }

  // 3. Merge, index keywords, and upload in batches
  const allChunks = [...structuredChunks, ...fullTextChunks];
  console.log(`\n☁️ Uploading total of ${allChunks.length} chunks to Firestore 'guideline_chunks'...`);

  for (const chunk of allChunks) {
    const docId = chunk.id.replace(/[^a-zA-Z0-9:-]+/g, '_');
    const docRef = db.collection('guideline_chunks').doc(docId);
    
    // Extract keywords for server-side indexing
    const keywords = extractKeywords(chunk.text, chunk.label);

    const payload = {
      id: chunk.id,
      collectionId: chunk.collectionId,
      collectionTitle: chunk.collectionTitle,
      school: chunk.school,
      year: chunk.year,
      group: chunk.group || '',
      topicId: chunk.topicId || '',
      sourceId: chunk.sourceId || '',
      sourceTitle: chunk.sourceTitle || '',
      folderTitle: chunk.folderTitle || '',
      fileTitle: chunk.fileTitle || '',
      localFile: chunk.localFile || '',
      url: chunk.url || '',
      page: chunk.page || 0,
      endPage: chunk.endPage || 0,
      label: chunk.label,
      text: chunk.text,
      kind: chunk.kind,
      keywords,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    bulkWriter.set(docRef, payload, { merge: true });
    uploadedCount++;

    if (uploadedCount % 500 === 0) {
      console.log(`- Queued ${uploadedCount} chunks...`);
    }
  }

  console.log('\n⏳ Committing batch writes to Firestore...');
  await bulkWriter.close();
  console.log(`\n🎉 Success! Successfully uploaded ${uploadedCount} guideline chunks to Firestore!`);
}

main().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
