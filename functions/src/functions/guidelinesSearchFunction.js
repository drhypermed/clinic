const crypto = require('crypto');
const { normalizeSearchText, highValueTerms, getQueryProfile, inferFocusCollections } = require('./guidelinesSearchQueryProfile');
const createGuidelineStaticSearchIndex = require('./guidelinesStaticSearchIndex');
const { chunkMetadataText, scoreChunk } = require('./guidelinesSearchScoring');
const createGuidelineBookFunctions = require('./guidelinesBookFunctions');

module.exports = ({ getDb, assertAdminRequest, admin, HttpsError }) => {
  const EMBEDDING_MODEL = 'gemini-embedding-001';
  const EMBEDDING_DIMENSIONS = 768;
  const VECTOR_FIELD = 'embeddingVector';
  const VECTOR_DISTANCE_FIELD = '_vectorDistance';
  const SEARCH_RESULT_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
  const SEARCH_RESULT_CACHE_MAX_ENTRIES = 900;
  const EMBEDDING_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
  const EMBEDDING_CACHE_MAX_ENTRIES = 800;
  const SEARCH_CACHE_VERSION = String(process.env.GUIDELINE_SEARCH_CACHE_VERSION || process.env.GUIDELINE_STATIC_VERSION || 'v1').trim() || 'v1';
  const SEARCH_BACKEND = ['firestore', 'shadow', 'static'].includes(String(process.env.GUIDELINE_SEARCH_BACKEND || '').toLowerCase())
    ? String(process.env.GUIDELINE_SEARCH_BACKEND).toLowerCase()
    : 'firestore';
  const STATIC_SHADOW_PERCENT = Math.max(0, Math.min(100, Number(process.env.GUIDELINE_STATIC_SEARCH_SHADOW_PERCENT || 100)));
  const SEARCH_DIAGNOSTIC_LOGS_ENABLED = String(process.env.GUIDELINE_SEARCH_DIAGNOSTIC_LOGS || 'false').toLowerCase() === 'true';
  const searchResultCache = new Map();
  const embeddingCache = new Map();
  const staticSearchIndex = admin
    ? createGuidelineStaticSearchIndex({ admin, normalizeSearchText })
    : null;
  const RETRIEVAL_LIMITS = {
    vector: 30,
    vectorHighRisk: 40,
    vectorComparison: 56,
    vectorStrictSource: 24,
    prefixDefault: 120,
    selectedKeyword: 70,
    focusedKeyword: 45,
    schoolKeyword: 8,
    broadKeyword: 60,
    sourceScoped: 60,
    collectionScan: 70,
    collectionScanComparison: 110,
    broadComparisonScan: 90,
    hydrateExtra: 4,
    neighborRoots: 2,
    neighborDocReads: 8,
    bookPageRead: 45,
  };
  const ALL_GUIDELINE_SCHOOLS = [
    'NICE', 'GINA', 'KDIGO', 'ADA', 'EASL', 'Endocrine', 'ESC', 'ACC', 'ACP', 'ACG', 'AGA', 'GOLD', 'EASD', 'AAD',
    'AAOS', 'AAP', 'AAPMR', 'ACOG', 'ACR', 'AUA', 'EAU', 'Audiology', 'ASHA', 'ASH', 'ASA', 'ESPEN', 'ADA_Dental',
    'CDC_ACIP',
  ];

  const normalizePathCandidate = (value) => String(value || '').replace(/\\/g, '/').trim();

  const makeSearchCacheKey = ({ query, selectedCollectionId, sourcePathCandidates, limit, strictSource, backend = SEARCH_BACKEND }) =>
    JSON.stringify({
      v: SEARCH_CACHE_VERSION,
      backend,
      q: normalizeSearchText(query).slice(0, 500),
      c: selectedCollectionId || '',
      s: sourcePathCandidates.slice(0, 10),
      l: limit,
      strict: Boolean(strictSource),
    });

  const getCachedSearchResult = (key) => {
    const cached = searchResultCache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.createdAt > SEARCH_RESULT_CACHE_TTL_MS) {
      searchResultCache.delete(key);
      return null;
    }
    return cached.value;
  };

  const setCachedSearchResult = (key, value) => {
    searchResultCache.set(key, { createdAt: Date.now(), value });
    if (searchResultCache.size > SEARCH_RESULT_CACHE_MAX_ENTRIES) {
      const oldestKey = searchResultCache.keys().next().value;
      if (oldestKey) searchResultCache.delete(oldestKey);
    }
  };

  const getCachedEmbedding = (key) => {
    const cached = embeddingCache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.createdAt > EMBEDDING_CACHE_TTL_MS) {
      embeddingCache.delete(key);
      return null;
    }
    return cached.value;
  };

  const setCachedEmbedding = (key, value) => {
    if (!Array.isArray(value) || value.length !== EMBEDDING_DIMENSIONS) return;
    embeddingCache.set(key, { createdAt: Date.now(), value });
    if (embeddingCache.size > EMBEDDING_CACHE_MAX_ENTRIES) {
      const oldestKey = embeddingCache.keys().next().value;
      if (oldestKey) embeddingCache.delete(oldestKey);
    }
  };

  const hashDiagnosticValue = (value) =>
    crypto.createHash('sha256').update(String(value || '')).digest('hex').slice(0, 16);

  const shouldRunStaticShadow = (query) => {
    if (SEARCH_BACKEND !== 'shadow' || !staticSearchIndex || STATIC_SHADOW_PERCENT <= 0) return false;
    const bucket = Number.parseInt(hashDiagnosticValue(query).slice(0, 8), 16) % 100;
    return bucket < STATIC_SHADOW_PERCENT;
  };

  const getCallerHash = (request) =>
    hashDiagnosticValue(request?.auth?.uid || request?.auth?.token?.email || 'anonymous');

  const maybeLogSearchDiagnostic = (entry) => {
    if (!SEARCH_DIAGNOSTIC_LOGS_ENABLED) return;
    console.info('[guidelineSearchDiagnostics]', {
      at: new Date().toISOString(),
      ...entry,
    });
  };

  const finalizeSearchResponse = ({ response, diagnostics, includeAdminDiagnostics, adminEmail }) => {
    maybeLogSearchDiagnostic(diagnostics);
    if (!includeAdminDiagnostics) return response;
    return {
      ...response,
      meta: {
        ...(response.meta || {}),
        adminDiagnostics: {
          ...diagnostics,
          adminHash: hashDiagnosticValue(adminEmail),
        },
      },
    };
  };

  const buildSourcePathCandidates = (data) => {
    const candidates = new Set();
    const add = (value) => {
      const normalized = normalizePathCandidate(value);
      if (normalized) candidates.add(normalized);
    };

    (Array.isArray(data.sourcePathCandidates) ? data.sourcePathCandidates : []).forEach(add);
    add(data.selectedSourcePath);
    add(data.selectedSourceLocalFile);

    const localFile = normalizePathCandidate(data.selectedSourceLocalFile);
    const collectionId = String(data.selectedCollectionId || '');
    const year = collectionId.match(/(20\d{2})/)?.[1];
    if (localFile && !localFile.includes('/')) {
      if (collectionId.startsWith('ada-') && year) add(`ADA/${year}/${localFile}`);
      if (collectionId.startsWith('gina-')) {
        add(`GINA/${localFile}`);
        add(`GINA/${localFile.replace(/\.pdf$/i, '')}`);
      }
    }

    return Array.from(candidates).slice(0, 10);
  };

  const getAdaptiveVectorLimit = ({ profile, selectedCollectionId, sourcePathCandidates, strictSource }) => {
    if (profile.plan?.needsComparison) return RETRIEVAL_LIMITS.vectorComparison;
    if (profile.plan?.isHighRisk || profile.plan?.needsSourceTrace) return RETRIEVAL_LIMITS.vectorHighRisk;
    if (strictSource && sourcePathCandidates.length > 0) return RETRIEVAL_LIMITS.vectorStrictSource;
    if (selectedCollectionId) return Math.max(RETRIEVAL_LIMITS.vector, 32);
    if (sourcePathCandidates.length > 0) return RETRIEVAL_LIMITS.vectorStrictSource;
    return RETRIEVAL_LIMITS.vector;
  };

  const getVectorCoverageThreshold = (vectorLimit, profile) => {
    if (profile.plan?.needsComparison) return Math.max(34, Math.floor(vectorLimit * 0.7));
    if (profile.plan?.isHighRisk || profile.plan?.needsSourceTrace) return Math.max(24, Math.floor(vectorLimit * 0.65));
    return Math.max(20, Math.floor(vectorLimit * 0.72));
  };

  const embedQuery = async (query) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || typeof fetch !== 'function') return null;
    const cacheKey = JSON.stringify({
      v: SEARCH_CACHE_VERSION,
      model: EMBEDDING_MODEL,
      q: normalizeSearchText(query).slice(0, 500),
    });
    const cached = getCachedEmbedding(cacheKey);
    if (cached) return cached;
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: `models/${EMBEDDING_MODEL}`,
          content: { parts: [{ text: String(query || '').slice(0, 3000) }] },
          taskType: 'RETRIEVAL_QUERY',
          outputDimensionality: EMBEDDING_DIMENSIONS,
        }),
      });
      if (!response.ok) return null;
      const data = await response.json();
      const values = data?.embedding?.values;
      const embedding = Array.isArray(values) ? values.map(Number).filter((value) => Number.isFinite(value)) : null;
      if (embedding?.length === EMBEDDING_DIMENSIONS) setCachedEmbedding(cacheKey, embedding);
      return embedding;
    } catch (error) {
      console.warn('[searchGuidelineIndex] query embedding failed', { message: error.message });
      return null;
    }
  };

  const docToChunk = (doc) => {
    const data = doc.data() || {};
    const pageStart = Number(data.pageStart || data.page || 0);
    const pageEnd = Number(data.pageEnd || data.endPage || pageStart || 0);
    return {
      id: data.id || doc.id,
      bookId: data.bookId || '',
      collectionId: data.collectionId || '',
      collectionTitle: data.collectionTitle || '',
      school: data.school || '',
      year: Number(data.year || 0),
      group: data.group || '',
      topicId: data.topicId || '',
      sourceId: data.sourceId || '',
      sourceTitle: data.sourceTitle || '',
      folderTitle: data.folderTitle || '',
      fileTitle: data.fileTitle || '',
      localFile: data.localFile || data.sourcePath || '',
      sourcePath: data.sourcePath || '',
      url: data.url || '',
      page: pageStart,
      endPage: pageEnd,
      pageStart,
      pageEnd,
      chunkIndex: Number(data.chunkIndex || 0),
      globalOrder: Number(data.globalOrder || 0),
      heading: data.heading || '',
      label: data.label || '',
      text: data.text || data.textPreview || '',
      keywords: Array.isArray(data.keywords) ? data.keywords : [],
      concepts: Array.isArray(data.concepts) ? data.concepts : [],
      intentTags: Array.isArray(data.intentTags) ? data.intentTags : [],
      embedding: Array.isArray(data.embedding) ? data.embedding : null,
      embeddingModel: data.embeddingModel || '',
      vectorDistance: typeof data[VECTOR_DISTANCE_FIELD] === 'number' ? data[VECTOR_DISTANCE_FIELD] : null,
      retrievalSources: Array.isArray(data.retrievalSources) ? data.retrievalSources : [],
      publicPdfPath: data.publicPdfPath || '',
      storagePdfPath: data.storagePdfPath || '',
      storagePdfUrl: data.storagePdfUrl || '',
      pdfHighlight: data.pdfHighlight && typeof data.pdfHighlight === 'object' ? data.pdfHighlight : null,
      kind: 'full-text',
    };
  };

  const { getGuidelineBookText, listGuidelineBooks } = createGuidelineBookFunctions({
    getDb,
    buildSourcePathCandidates,
    docToChunk,
    bookPageRead: RETRIEVAL_LIMITS.bookPageRead,
  });

  const makeQueryKey = (chunk) => chunk.id || `${chunk.bookId}:${chunk.chunkIndex}`;

  const mergeCandidate = (candidates, chunk, source) => {
    const key = makeQueryKey(chunk);
    const existing = candidates.get(key);
    const nextSources = new Set(Array.isArray(existing?.retrievalSources) ? existing.retrievalSources : []);
    if (source) nextSources.add(source);
    if (Array.isArray(chunk.retrievalSources)) {
      chunk.retrievalSources.forEach((item) => nextSources.add(item));
    }

    candidates.set(key, {
      ...(existing || {}),
      ...chunk,
      vectorDistance: typeof chunk.vectorDistance === 'number' ? chunk.vectorDistance : existing?.vectorDistance ?? null,
      retrievalSources: Array.from(nextSources),
    });
  };

  const fetchVectorCandidates = async ({ db, queryEmbedding, limit = 90 }) => {
    if (!Array.isArray(queryEmbedding) || queryEmbedding.length !== EMBEDDING_DIMENSIONS) return [];
    try {
      const snapshot = await db.collection('guideline_chunk_search')
        .findNearest({
          vectorField: VECTOR_FIELD,
          queryVector: queryEmbedding,
          limit,
          distanceMeasure: 'COSINE',
          distanceResultField: VECTOR_DISTANCE_FIELD,
        })
        .get();
      const candidates = [];
      snapshot.forEach((doc) => candidates.push(docToChunk(doc)));
      return candidates;
    } catch (error) {
      console.warn('[searchGuidelineIndex] vector query failed; falling back to keyword retrieval', {
        message: error?.message || String(error),
      });
      return [];
    }
  };

  const fetchKeywordCandidates = async ({ db, profile, selectedCollectionId, focusCollections, vectorCandidateCount = 0 }) => {
    const chunksRef = db.collection('guideline_chunk_search');
    const candidates = new Map();
    const terms = Array.from(new Set([
      ...profile.importantTerms,
      ...profile.concepts,
      ...profile.intentTags,
      ...profile.populationTags,
    ])).slice(0, 10);
    const collect = (snapshot) => {
      snapshot.forEach((doc) => {
        const chunk = docToChunk(doc);
        mergeCandidate(candidates, chunk, 'keyword');
      });
    };

    const jobs = [];
    const prefixJobs = [];
    if (terms.length === 0) return [];

    const collectBookIdPrefix = (prefix, expectedCollectionId, limit = RETRIEVAL_LIMITS.prefixDefault) => {
      if (!prefix) return;
      if (selectedCollectionId && expectedCollectionId && selectedCollectionId !== expectedCollectionId) return;
      prefixJobs.push(
        chunksRef.orderBy('bookId')
          .startAt(prefix)
          .endAt(`${prefix}\uf8ff`)
          .limit(limit)
          .get()
          .then(collect)
          .catch((error) => {
            console.warn('[searchGuidelineIndex] book-id prefix query failed', { prefix, message: error.message });
          }),
      );
    };

    const queryText = profile.normalizedQuery || '';
    const hasCkdAnemiaIntent = profile.terms.includes('ckd')
      && (profile.terms.includes('iron') || profile.terms.includes('anemia') || profile.terms.includes('anaemia') || profile.terms.includes('tsat') || profile.terms.includes('ferritin'));
    if (hasCkdAnemiaIntent) {
      collectBookIdPrefix('kdigo-anemia-in-ckd', 'kdigo-2026', 240);
    }
    if (/\b(hepatitis b|hbv)\b/i.test(queryText)) {
      collectBookIdPrefix('easl-2025-easl-clinical-practice-guidelines-on-the-management-of-', 'easl-2026', 220);
    }
    if (profile.terms.includes('dka') || profile.terms.includes('ketoacidosis')) {
      collectBookIdPrefix('ada-2026-16-diabetes-care-in-the-hospital', 'ada-2026', 170);
      collectBookIdPrefix('ada-2026-6-glycemic-goals-hypoglycemia-and-hyperglycemic-crises', 'ada-2026', 130);
      if (profile.populationTags.includes('child')) {
        collectBookIdPrefix('ada-2026-14-children-and-adolescents', 'ada-2026', 110);
      }
    }
    if (profile.terms.includes('asthma') || profile.terms.includes('mart') || profile.terms.includes('formoterol') || profile.terms.includes('saba') || profile.terms.includes('ics')) {
      collectBookIdPrefix('gina-gina-2026', 'gina-2026', 220);
    }
    if (profile.terms.includes('gout') || profile.terms.includes('urate') || profile.terms.includes('allopurinol') || profile.terms.includes('febuxostat') || profile.terms.includes('colchicine')) {
      collectBookIdPrefix('acr-gout-clinical-practice-guidelines-american-college-of-rheumatology-2020-guideline-for-the-management-of-gout', 'acr-2026', 180);
    }

    if (prefixJobs.length > 0) {
      await Promise.all(prefixJobs);
    }

    if (selectedCollectionId) {
      jobs.push(
        chunksRef.where('keywords', 'array-contains-any', terms)
          .where('collectionId', '==', selectedCollectionId)
          .limit(RETRIEVAL_LIMITS.selectedKeyword)
          .get()
          .then(collect)
          .catch((error) => {
            console.warn('[searchGuidelineIndex] selected collection keyword query failed', { selectedCollectionId, message: error.message });
          }),
      );
    } else {
      for (const collectionId of focusCollections.slice(0, 5)) {
        jobs.push(
          chunksRef.where('keywords', 'array-contains-any', terms)
            .where('collectionId', '==', collectionId)
            .limit(RETRIEVAL_LIMITS.focusedKeyword)
            .get()
            .then(collect)
            .catch(() => {}),
        );
      }

      const vectorCoveredGeneralSearch = vectorCandidateCount >= 24 && !profile.plan.needsComparison;
      const shouldQueryEverySchool = !vectorCoveredGeneralSearch && (focusCollections.length === 0 || profile.plan.needsComparison);
      if (shouldQueryEverySchool) {
        for (const school of ALL_GUIDELINE_SCHOOLS) {
          jobs.push(
            chunksRef.where('keywords', 'array-contains-any', terms)
              .where('school', '==', school)
              .limit(RETRIEVAL_LIMITS.schoolKeyword)
              .get()
              .then(collect)
              .catch(() => {}),
          );
        }
      }

      if (!vectorCoveredGeneralSearch) {
        jobs.push(chunksRef.where('keywords', 'array-contains-any', terms).limit(RETRIEVAL_LIMITS.broadKeyword).get().then(collect).catch((error) => {
          console.warn('[searchGuidelineIndex] broad keyword query failed', { message: error.message });
        }));
      }
    }

    await Promise.all(jobs);
    return Array.from(candidates.values());
  };

  const fetchSourceScopedCandidates = async ({ db, sourcePathCandidates }) => {
    if (!sourcePathCandidates.length) return [];
    const chunksRef = db.collection('guideline_chunk_search');
    const candidates = new Map();

    for (const sourcePath of sourcePathCandidates) {
      const snapshot = await chunksRef.where('sourcePath', '==', sourcePath).limit(RETRIEVAL_LIMITS.sourceScoped).get();
      snapshot.forEach((doc) => {
        const chunk = docToChunk(doc);
        mergeCandidate(candidates, chunk, 'source');
      });
    }

    return Array.from(candidates.values());
  };

  const fetchCollectionScanCandidates = async ({ db, selectedCollectionId, focusCollections, needsComparison }) => {
    const chunksRef = db.collection('guideline_chunk_search');
    const candidates = new Map();
    const collections = selectedCollectionId
      ? [selectedCollectionId]
      : (focusCollections.length ? focusCollections : []);

    const collect = (snapshot) => {
      snapshot.forEach((doc) => {
        const chunk = docToChunk(doc);
        mergeCandidate(candidates, chunk, 'collection-scan');
      });
    };

    if (collections.length > 0) {
      await Promise.all(collections.slice(0, needsComparison ? 6 : 3).map((collectionId) =>
        chunksRef.where('collectionId', '==', collectionId).limit(needsComparison ? RETRIEVAL_LIMITS.collectionScanComparison : RETRIEVAL_LIMITS.collectionScan).get().then(collect).catch((error) => {
          console.warn('[searchGuidelineIndex] collection scan failed', { collectionId, message: error.message });
        })
      ));
    }

    if (candidates.size === 0 && needsComparison) {
      await chunksRef.limit(RETRIEVAL_LIMITS.broadComparisonScan).get().then(collect).catch((error) => {
        console.warn('[searchGuidelineIndex] broad comparison scan failed', { message: error.message });
      });
    }

    return Array.from(candidates.values());
  };

  const hasHighConfidenceSourceCandidates = (profile, candidates) => {
    if (profile.plan?.needsComparison || !Array.isArray(candidates) || candidates.length < 8) return false;
    const countByPrefix = (prefix) => candidates.filter((chunk) => String(chunk.bookId || '').startsWith(prefix)).length;
    const queryText = profile.normalizedQuery || '';
    const hasCkdAnemiaIntent = profile.terms.includes('ckd')
      && (profile.terms.includes('iron') || profile.terms.includes('anemia') || profile.terms.includes('anaemia') || profile.terms.includes('tsat') || profile.terms.includes('ferritin'));
    if (hasCkdAnemiaIntent && countByPrefix('kdigo-anemia-in-ckd') >= 8) return true;
    if (/\b(hepatitis b|hbv)\b/i.test(queryText)) {
      const hbvMatches = candidates.filter((chunk) => /hepatitis-b-virus|hepatitis b virus/i.test(`${chunk.bookId || ''} ${chunk.fileTitle || ''} ${chunk.sourceTitle || ''}`)).length;
      if (hbvMatches >= 8) return true;
    }
    if (profile.terms.includes('dka') || profile.terms.includes('ketoacidosis')) {
      const dkaMatches = candidates.filter((chunk) =>
        /^ada-2026-(16-diabetes-care-in-the-hospital|6-glycemic-goals-hypoglycemia-and-hyperglycemic-crises|14-children-and-adolescents)/.test(String(chunk.bookId || ''))
      ).length;
      if (dkaMatches >= 8) return true;
    }
    if (profile.terms.includes('asthma') || profile.terms.includes('mart') || profile.terms.includes('formoterol') || profile.terms.includes('saba') || profile.terms.includes('ics')) {
      if (countByPrefix('gina-gina-2026') >= 8) return true;
    }
    if (profile.terms.includes('gout') || profile.terms.includes('urate') || profile.terms.includes('allopurinol') || profile.terms.includes('febuxostat') || profile.terms.includes('colchicine')) {
      if (countByPrefix('acr-gout-clinical-practice-guidelines-american-college-of-rheumatology-2020-guideline-for-the-management-of-gout') >= 8) return true;
    }
    return false;
  };

  const hydrateFullChunks = async (db, chunks, max = 50) => {
    const roots = chunks.slice(0, max);
    const refs = roots
      .map((chunk) => chunk.id)
      .filter(Boolean)
      .map((id) => db.collection('guideline_book_chunks').doc(id));
    if (refs.length === 0) return roots;

    const snapshots = await db.getAll(...refs);
    const hydrated = new Map();
    snapshots.forEach((doc) => {
      if (!doc.exists) return;
      const chunk = docToChunk(doc);
      hydrated.set(chunk.id, chunk);
    });

    return roots.map((chunk) => {
      const full = hydrated.get(chunk.id);
      return full
        ? {
          ...chunk,
          ...full,
          embedding: chunk.embedding,
          vectorDistance: chunk.vectorDistance,
          retrievalSources: chunk.retrievalSources,
        }
        : chunk;
    });
  };

  const expandNeighborContext = async ({ db, ranked, maxRoots = 6 }) => {
    const expanded = new Map(ranked.map((chunk) => [makeQueryKey(chunk), chunk]));
    const docRefs = [];

    for (const root of ranked.slice(0, maxRoots)) {
      if (!root.bookId || !root.chunkIndex) continue;
      for (const offset of [-2, -1, 1, 2]) {
        const neighborIndex = root.chunkIndex + offset;
        if (neighborIndex < 1) continue;
        const docId = `${root.bookId}:${String(neighborIndex).padStart(5, '0')}`;
        if (!expanded.has(docId)) {
          docRefs.push(db.collection('guideline_book_chunks').doc(docId));
        }
      }
    }

    if (docRefs.length === 0) return ranked;

    const snapshots = await db.getAll(...docRefs.slice(0, RETRIEVAL_LIMITS.neighborDocReads));
    snapshots.forEach((doc) => {
      if (!doc.exists) return;
      const chunk = docToChunk(doc);
      const key = makeQueryKey(chunk);
      if (!expanded.has(key)) {
        chunk.score = Math.max(1, Number(ranked.find((item) => item.bookId === chunk.bookId)?.score || 1) - 12);
        chunk.contextOnly = true;
        expanded.set(key, chunk);
      }
    });

    return Array.from(expanded.values());
  };

  const diversifyByBook = (chunks, limit) => {
    const result = [];
    const perBook = new Map();
    for (const chunk of chunks) {
      const count = perBook.get(chunk.bookId) || 0;
      if (count >= 4 && result.length < Math.max(4, limit - 2)) continue;
      result.push(chunk);
      perBook.set(chunk.bookId, count + 1);
      if (result.length >= limit) break;
    }
    return result;
  };

  const diversifyForComparison = (chunks, limit) => {
    const byCollection = new Map();
    for (const chunk of chunks) {
      const key = chunk.collectionId || chunk.school || 'unknown';
      if (!byCollection.has(key)) byCollection.set(key, []);
      byCollection.get(key).push(chunk);
    }

    const groups = Array.from(byCollection.values()).sort((a, b) => (b[0]?.score || 0) - (a[0]?.score || 0));
    const result = [];
    let depth = 0;
    while (result.length < limit && groups.some((group) => group[depth])) {
      for (const group of groups) {
        if (group[depth]) result.push(group[depth]);
        if (result.length >= limit) break;
      }
      depth += 1;
    }
    return result;
  };

  const rerankEvidence = ({ chunks, profile, options }) => {
    const queryAnchors = new Set([
      ...profile.concepts,
      ...profile.importantTerms.filter((term) => highValueTerms.has(term)),
      ...profile.intentTags,
      ...profile.populationTags,
    ].map(normalizeSearchText).filter(Boolean));

    return chunks
      .map((chunk) => {
        const raw = `${chunk.heading || ''}\n${chunk.label || ''}\n${chunk.text || ''}`;
        const text = normalizeSearchText(raw);
        const meta = chunkMetadataText(chunk);
        let rerankScore = Number(chunk.score || 0);
        let anchorHits = 0;

        for (const anchor of queryAnchors) {
          if (text.includes(anchor) || meta.includes(anchor)) anchorHits += 1;
        }

        rerankScore += Math.min(anchorHits, 8) * 18;
        if (chunk.retrievalSources?.includes('vector')) rerankScore += 45;
        if (chunk.retrievalSources?.includes('keyword')) rerankScore += 18;
        if (chunk.retrievalSources?.includes('source')) rerankScore += 28;
        if (typeof chunk.vectorDistance === 'number' && Number.isFinite(chunk.vectorDistance)) {
          rerankScore += Math.max(0, 1 - Math.min(1, chunk.vectorDistance)) * 95;
        }
        if (/recommendation|practice point|should|recommend|diagnostic criteria|management|treatment|therapy/i.test(raw)) {
          rerankScore += 35;
        }
        if (/references|acknowledg|disclosures|table of contents|contents\b/i.test(raw.slice(0, 1200))) {
          rerankScore -= 90;
        }
        if (/under review or expired/i.test(meta)) {
          rerankScore -= 220;
        }
        if (options.focusCollections.includes(String(chunk.collectionId || ''))) {
          rerankScore += 30;
        }
        if (profile.plan?.isHighRisk && !/recommendation|practice point|should|recommend|urgent|emergency|acute|severe|critical|icu|intensive/i.test(raw)) {
          rerankScore -= 28;
        }

        return { ...chunk, score: Math.round(rerankScore * 10) / 10 };
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.bookId === b.bookId) return (a.chunkIndex || 0) - (b.chunkIndex || 0);
        return String(a.label).localeCompare(String(b.label));
      });
  };

  const rankAndShapeResults = async ({ db, candidates, profile, options, limit, diagnostics, useStaticStorage = false }) => {
    const prelim = candidates
      .map((chunk) => ({ ...chunk, score: scoreChunk(chunk, profile, options) }))
      .filter((chunk) => chunk.score >= 8)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.bookId === b.bookId) return (a.chunkIndex || 0) - (b.chunkIndex || 0);
        return String(a.label).localeCompare(String(b.label));
      })
      .slice(0, Math.max(18, limit + RETRIEVAL_LIMITS.hydrateExtra));

    const shouldHydrateFullText = Boolean(
      options.strictSource
      || profile.plan?.needsComparison
      || profile.plan?.isHighRisk
      || profile.plan?.needsSourceTrace
    );
    if (diagnostics) {
      diagnostics.prelimCandidateCount = prelim.length;
      diagnostics.fullTextHydrated = shouldHydrateFullText;
      diagnostics.estimatedHydrateDocReads = shouldHydrateFullText
        ? Math.min(prelim.length, Math.max(18, limit + RETRIEVAL_LIMITS.hydrateExtra))
        : 0;
    }
    const hydrated = shouldHydrateFullText
      ? (useStaticStorage && staticSearchIndex
        ? await staticSearchIndex.hydrateChunks(prelim.slice(0, Math.max(18, limit + RETRIEVAL_LIMITS.hydrateExtra)))
        : await hydrateFullChunks(db, prelim, Math.max(18, limit + RETRIEVAL_LIMITS.hydrateExtra)))
      : prelim;
    const ranked = hydrated
      .map((chunk) => ({ ...chunk, score: scoreChunk(chunk, profile, options) }))
      .filter((chunk) => chunk.score >= 8)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.bookId === b.bookId) return (a.chunkIndex || 0) - (b.chunkIndex || 0);
        return String(a.label).localeCompare(String(b.label));
      });

    const reranked = rerankEvidence({ chunks: ranked, profile, options });
    const roots = profile.plan?.needsComparison
      ? diversifyForComparison(reranked, Math.max(10, limit))
      : diversifyByBook(reranked, Math.max(8, limit));
    if (diagnostics) {
      diagnostics.rootCandidateCount = roots.length;
      diagnostics.estimatedNeighborDocReads = shouldHydrateFullText
        ? Math.min(RETRIEVAL_LIMITS.neighborDocReads, Math.max(0, roots.slice(0, RETRIEVAL_LIMITS.neighborRoots).length * 4))
        : 0;
    }
    const withContext = shouldHydrateFullText
      ? (useStaticStorage && staticSearchIndex
        ? await staticSearchIndex.getNeighborChunks(roots, RETRIEVAL_LIMITS.neighborRoots, RETRIEVAL_LIMITS.neighborDocReads)
        : await expandNeighborContext({ db, ranked: roots, maxRoots: RETRIEVAL_LIMITS.neighborRoots }))
      : roots;
    return withContext
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.bookId === b.bookId) return (a.chunkIndex || 0) - (b.chunkIndex || 0);
        return String(a.label).localeCompare(String(b.label));
      })
      .slice(0, limit);
  };

  const searchGuidelineIndex = async (request) => {
    const startedAt = Date.now();
    const data = request.data || {};
    const query = String(data.query || '').trim();
    const selectedCollectionId = data.selectedCollectionId ? String(data.selectedCollectionId) : '';
    const limit = Math.min(24, Math.max(8, Number(data.limit || 24) || 24));
    const strictSource = Boolean(data.strictSource);
    const includeAdminDiagnostics = Boolean(data.includeAdminDiagnostics || data.debugDiagnostics);

    if (!query) return { results: [] };

    const profile = getQueryProfile(query);
    if (profile.terms.length === 0) return { results: [] };

    let adminEmailForDiagnostics = '';
    if (includeAdminDiagnostics) {
      if (typeof assertAdminRequest !== 'function') {
        throw new Error('Admin guard is not available for guideline search diagnostics');
      }
      adminEmailForDiagnostics = await assertAdminRequest(request);
    }
    const effectiveBackend = data.forceStaticBackend && includeAdminDiagnostics
      ? 'static'
      : SEARCH_BACKEND;

    const db = getDb();
    const sourcePathCandidates = buildSourcePathCandidates(data);
    const focusCollections = inferFocusCollections(profile);
    const staticFocusCollections = Array.from(new Set([
      ...focusCollections,
      ...(profile.populationTags.includes('child')
        && (profile.terms.includes('dka') || profile.terms.includes('ketoacidosis'))
        ? ['nice-2023']
        : []),
    ]));
    // النسخة الثابتة تحتوي كامل فهرس البحث، وليس المدارس التي استطعنا
    // استنتاجها من السؤال فقط. لذلك عند تفعيل backend=static نستخدمها حتى
    // للأسئلة العامة؛ وإلا كانت هذه الأسئلة تعود بصمت إلى Firestore وتبقي
    // فهرس الـ58 ألف جزء مطلوباً في الإنتاج.
    const staticPrimaryEligible = Boolean(
      effectiveBackend === 'static' && staticSearchIndex
    );
    if (effectiveBackend === 'static' && !staticPrimaryEligible) {
      throw new HttpsError(
        'failed-precondition',
        'GUIDELINE_STATIC_SEARCH_NOT_CONFIGURED'
      );
    }
    const vectorLimit = getAdaptiveVectorLimit({ profile, selectedCollectionId, sourcePathCandidates, strictSource });
    const vectorCoverageThreshold = getVectorCoverageThreshold(vectorLimit, profile);
    const diagnostics = {
      callerHash: getCallerHash(request),
      queryHash: hashDiagnosticValue(profile.normalizedQuery || query),
      queryLength: query.length,
      selectedCollectionId,
      limit,
      vectorLimit,
      vectorCoverageThreshold,
      strictSource,
      sourcePathCandidateCount: sourcePathCandidates.length,
      focusCollections,
      staticFocusCollections,
      configuredBackend: SEARCH_BACKEND,
      effectiveBackend,
      staticPrimaryEligible,
      plan: {
        needsComparison: Boolean(profile.plan?.needsComparison),
        isHighRisk: Boolean(profile.plan?.isHighRisk),
        needsSourceTrace: Boolean(profile.plan?.needsSourceTrace),
      },
      sourceScopedCandidateCount: 0,
      vectorCandidateCount: 0,
      keywordCandidateCount: 0,
      scanCandidateCount: 0,
    };
    const cacheKey = makeSearchCacheKey({
      query,
      selectedCollectionId,
      sourcePathCandidates,
      limit,
      strictSource,
      backend: effectiveBackend,
    });
    const cachedResult = getCachedSearchResult(cacheKey);
    if (cachedResult) {
      return finalizeSearchResponse({
        response: {
          ...cachedResult,
          meta: {
            ...(cachedResult.meta || {}),
            cacheHit: true,
          },
        },
        diagnostics: {
          ...diagnostics,
          cacheHit: true,
          retrievalMode: cachedResult.meta?.retrievalMode || 'cache',
          resultCount: Array.isArray(cachedResult.results) ? cachedResult.results.length : 0,
          estimatedDocsReturned: 0,
          durationMs: Date.now() - startedAt,
        },
        includeAdminDiagnostics,
        adminEmail: adminEmailForDiagnostics,
      });
    }
    const queryEmbedding = await embedQuery(query);
    const options = {
      selectedCollectionId,
      sourcePathCandidates,
      focusCollections,
      queryEmbedding,
      strictSource,
    };

    const runStaticSearch = (effectiveBackend === 'static' && staticPrimaryEligible)
      || (includeAdminDiagnostics && shouldRunStaticShadow(profile.normalizedQuery || query));
    const firestoreVectorPromise = effectiveBackend === 'static' && staticPrimaryEligible
      ? null
      : fetchVectorCandidates({ db, queryEmbedding, limit: vectorLimit });
    let staticVectorResult = null;
    if (runStaticSearch && staticSearchIndex) {
      try {
        staticVectorResult = await staticSearchIndex.searchVectors({
          queryEmbedding,
          selectedCollectionId,
          focusCollections: staticFocusCollections,
          sourcePathCandidates,
          limit: profile.plan.needsComparison
            ? Math.max(220, vectorLimit)
            : (profile.plan.isHighRisk || profile.plan.needsSourceTrace ? Math.max(140, vectorLimit) : Math.max(80, vectorLimit)),
        });
        diagnostics.staticVectorCandidateCount = staticVectorResult.candidates.length;
        diagnostics.staticLoadedShards = staticVectorResult.loadedShards;
        diagnostics.staticVectorDurationMs = staticVectorResult.durationMs;
      } catch (error) {
        diagnostics.staticSearchError = String(error?.message || error).slice(0, 240);
        console.error('[searchGuidelineIndex] static search failed', {
          message: error?.message || String(error),
        });
        if (effectiveBackend === 'static') {
          // The legacy Firestore vector index is intentionally removed. Falling back
          // to it would turn a temporary Storage failure into misleading empty results.
          throw new HttpsError('unavailable', 'GUIDELINE_SEARCH_TEMPORARILY_UNAVAILABLE');
        }
      }
    }

    const useStaticPrimary = effectiveBackend === 'static'
      && staticPrimaryEligible
      && Boolean(staticVectorResult);
    let candidates = [];
    if (!useStaticPrimary && sourcePathCandidates.length > 0) {
      candidates = await fetchSourceScopedCandidates({ db, sourcePathCandidates });
      diagnostics.sourceScopedCandidateCount = candidates.length;
    }

    const vectorCandidates = useStaticPrimary
      ? staticVectorResult.candidates
      : await (firestoreVectorPromise || fetchVectorCandidates({ db, queryEmbedding, limit: vectorLimit }));
    diagnostics.vectorCandidateCount = vectorCandidates.length;
    diagnostics.activeBackend = useStaticPrimary ? 'static' : 'firestore';
    if (effectiveBackend === 'shadow' && staticVectorResult) {
      const firestoreIds = new Set(vectorCandidates.map((chunk) => makeQueryKey(chunk)));
      const staticIds = staticVectorResult.candidates.map((chunk) => makeQueryKey(chunk));
      diagnostics.staticShadowTopOverlap = staticIds.filter((id) => firestoreIds.has(id)).length;
      diagnostics.staticShadowCompared = Math.min(vectorCandidates.length, staticIds.length);
    }
    if (vectorCandidates.length > 0) {
      const byId = new Map(candidates.map((chunk) => [makeQueryKey(chunk), chunk]));
      vectorCandidates.forEach((chunk) => mergeCandidate(byId, chunk, 'vector'));
      candidates = Array.from(byId.values());
    }

    const vectorCoversRoutineSearch = Boolean(
      vectorCandidates.length >= vectorCoverageThreshold
      && sourcePathCandidates.length === 0
      && !selectedCollectionId
      && !profile.plan.needsComparison
      && !profile.plan.isHighRisk
      && !profile.plan.needsSourceTrace
    );

    if (!vectorCoversRoutineSearch && (candidates.length === 0 || sourcePathCandidates.length === 0)) {
      const keywordResult = useStaticPrimary
        ? await staticSearchIndex.searchLexical({
          terms: [
            ...profile.importantTerms,
            ...profile.concepts,
            ...profile.intentTags,
            ...profile.populationTags,
          ],
          selectedCollectionId,
          focusCollections: staticFocusCollections,
          sourcePathCandidates,
          limit: profile.plan.needsComparison ? 700 : 400,
        })
        : null;
      const keywordCandidates = useStaticPrimary
        ? keywordResult.candidates
        : await fetchKeywordCandidates({
          db,
          profile,
          selectedCollectionId,
          focusCollections,
          vectorCandidateCount: vectorCandidates.length,
        });
      if (keywordResult) diagnostics.staticLexicalDurationMs = keywordResult.durationMs;
      diagnostics.keywordCandidateCount = keywordCandidates.length;
      const byId = new Map(candidates.map((chunk) => [makeQueryKey(chunk), chunk]));
      keywordCandidates.forEach((chunk) => mergeCandidate(byId, chunk, 'keyword'));
      candidates = Array.from(byId.values());
    }

    if ((candidates.length < 18 || profile.plan.needsComparison) && !hasHighConfidenceSourceCandidates(profile, candidates)) {
      const scanCandidates = useStaticPrimary
        ? (await staticSearchIndex.searchLexical({
          terms: profile.terms,
          selectedCollectionId,
          focusCollections: staticFocusCollections,
          sourcePathCandidates,
          limit: profile.plan.needsComparison ? 700 : 400,
        })).candidates
        : await fetchCollectionScanCandidates({
          db,
          selectedCollectionId,
          focusCollections,
          needsComparison: profile.plan.needsComparison,
        });
      diagnostics.scanCandidateCount = scanCandidates.length;
      const byId = new Map(candidates.map((chunk) => [makeQueryKey(chunk), chunk]));
      scanCandidates.forEach((chunk) => mergeCandidate(byId, chunk, 'collection-scan'));
      candidates = Array.from(byId.values());
    }

    diagnostics.candidateCount = candidates.length;
    const activeOptions = useStaticPrimary
      ? { ...options, focusCollections: staticFocusCollections }
      : options;
    const results = await rankAndShapeResults({
      db,
      candidates,
      profile,
      options: activeOptions,
      limit,
      diagnostics,
      useStaticStorage: Boolean(staticSearchIndex),
    });
    const response = {
      results,
      meta: {
        intentTags: profile.intentTags,
        populationTags: profile.populationTags,
        focusCollections,
        plan: profile.plan,
        retrievalMode: queryEmbedding
          ? (vectorCandidates.length > 0
            ? (useStaticPrimary
              ? (profile.plan.needsComparison ? 'comparison-storage-vector-hybrid-rerank' : 'storage-vector-hybrid-rerank')
              : (profile.plan.needsComparison ? 'comparison-firestore-vector-hybrid-rerank' : 'firestore-vector-hybrid-rerank'))
            : (profile.plan.needsComparison ? 'comparison-hybrid-vector-fallback' : 'hybrid-vector-fallback-rerank'))
          : (profile.plan.needsComparison ? 'comparison-hybrid' : 'hybrid-keyword-semantic-rerank'),
        vectorCandidateCount: vectorCandidates.length,
        searchBackend: useStaticPrimary ? 'static' : 'firestore',
        fullTextHydrated: Boolean(activeOptions.strictSource || profile.plan?.needsComparison || profile.plan?.isHighRisk || profile.plan?.needsSourceTrace),
        cacheHit: false,
      },
    };
    diagnostics.cacheHit = false;
    diagnostics.retrievalMode = response.meta.retrievalMode;
    diagnostics.resultCount = results.length;
    diagnostics.estimatedDocsReturned = useStaticPrimary
      ? 0
      : diagnostics.sourceScopedCandidateCount
        + diagnostics.vectorCandidateCount
        + diagnostics.keywordCandidateCount
        + diagnostics.scanCandidateCount
        + Number(diagnostics.estimatedHydrateDocReads || 0)
        + Number(diagnostics.estimatedNeighborDocReads || 0);
    diagnostics.durationMs = Date.now() - startedAt;
    setCachedSearchResult(cacheKey, response);
    return finalizeSearchResponse({
      response,
      diagnostics,
      includeAdminDiagnostics,
      adminEmail: adminEmailForDiagnostics,
    });
  };

  return {
    getGuidelineBookText,
    listGuidelineBooks,
    searchGuidelineIndex,
  };
};
