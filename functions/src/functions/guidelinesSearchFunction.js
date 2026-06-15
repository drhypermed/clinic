const crypto = require('crypto');
const { normalizeSearchText, highValueTerms, getQueryProfile, inferFocusCollections } = require('./guidelinesSearchQueryProfile');

module.exports = ({ getDb, assertAdminRequest }) => {
  const EMBEDDING_MODEL = 'gemini-embedding-001';
  const EMBEDDING_DIMENSIONS = 768;
  const VECTOR_FIELD = 'embeddingVector';
  const VECTOR_DISTANCE_FIELD = '_vectorDistance';
  const SEARCH_RESULT_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
  const SEARCH_RESULT_CACHE_MAX_ENTRIES = 300;
  const SEARCH_DIAGNOSTIC_LOGS_ENABLED = String(process.env.GUIDELINE_SEARCH_DIAGNOSTIC_LOGS || 'false').toLowerCase() === 'true';
  const searchResultCache = new Map();
  const RETRIEVAL_LIMITS = {
    vector: 45,
    vectorComparison: 70,
    prefixDefault: 160,
    selectedKeyword: 90,
    focusedKeyword: 60,
    schoolKeyword: 8,
    broadKeyword: 80,
    sourceScoped: 90,
    collectionScan: 90,
    collectionScanComparison: 140,
    broadComparisonScan: 120,
    hydrateExtra: 6,
    neighborRoots: 3,
    neighborDocReads: 12,
    bookPageRead: 45,
  };
  const ALL_GUIDELINE_SCHOOLS = [
    'NICE', 'GINA', 'KDIGO', 'ADA', 'EASL', 'Endocrine', 'ESC', 'ACC', 'ACP', 'ACG', 'AGA', 'GOLD', 'EASD', 'AAD',
    'AAOS', 'AAP', 'AAPMR', 'ACOG', 'ACR', 'AUA', 'EAU', 'Audiology', 'ASHA', 'ASH', 'ASA', 'ESPEN', 'ADA_Dental',
    'CDC_ACIP',
  ];

  const normalizePathCandidate = (value) => String(value || '').replace(/\\/g, '/').trim();

  const makeSearchCacheKey = ({ query, selectedCollectionId, sourcePathCandidates, limit, strictSource }) =>
    JSON.stringify({
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

  const hashDiagnosticValue = (value) =>
    crypto.createHash('sha256').update(String(value || '')).digest('hex').slice(0, 16);

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

  const chunkMetadataText = (chunk) =>
    normalizeSearchText([
      chunk.label,
      chunk.heading,
      chunk.sourceTitle,
      chunk.folderTitle,
      chunk.fileTitle,
      chunk.school,
      chunk.year,
    ].filter(Boolean).join(' '));

  const countOccurrences = (haystack, needle) => {
    if (!needle) return 0;
    let count = 0;
    let index = haystack.indexOf(needle);
    while (index !== -1 && count < 12) {
      count += 1;
      index = haystack.indexOf(needle, index + needle.length);
    }
    return count;
  };

  const countRegex = (value, regex) => {
    const matches = String(value || '').match(regex);
    return matches ? matches.length : 0;
  };

  const cosineSimilarity = (a, b) => {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || a.length !== b.length) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i += 1) {
      const x = Number(a[i] || 0);
      const y = Number(b[i] || 0);
      dot += x * y;
      normA += x * x;
      normB += y * y;
    }
    if (!normA || !normB) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  };

  const embedQuery = async (query) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || typeof fetch !== 'function') return null;
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
      return Array.isArray(values) ? values.map(Number).filter((value) => Number.isFinite(value)) : null;
    } catch (error) {
      console.warn('[searchGuidelineIndex] query embedding failed', { message: error.message });
      return null;
    }
  };

  const scoreChunk = (chunk, profile, options) => {
    const text = normalizeSearchText(chunk.text || '');
    const meta = chunkMetadataText(chunk);
    let score = 0;
    let matchedTerms = 0;
    let importantMatches = 0;

    if (options.queryEmbedding && Array.isArray(chunk.embedding)) {
      const vectorScore = cosineSimilarity(options.queryEmbedding, chunk.embedding);
      if (vectorScore > 0.2) score += vectorScore * 130;
    }

    if (profile.normalizedQuery.length >= 8) {
      if (meta.includes(profile.normalizedQuery)) score += 75;
      if (text.includes(profile.normalizedQuery)) score += 48;
    }

    for (const term of profile.terms) {
      const isImportant = highValueTerms.has(term) || profile.importantTerms.includes(term);
      const metaHit = meta.includes(term);
      const textHits = countOccurrences(text, term);
      const keywordHit = Array.isArray(chunk.keywords) && chunk.keywords.includes(term);
      const conceptHit = Array.isArray(chunk.concepts) && chunk.concepts.includes(term);
      if (metaHit || textHits > 0 || keywordHit || conceptHit) {
        matchedTerms += 1;
        if (isImportant) importantMatches += 1;
      }
      if (metaHit) score += isImportant ? 24 : 9;
      if (textHits > 0) score += Math.min(textHits, 5) * (isImportant ? 7 : 2.4);
      if (keywordHit) score += isImportant ? 14 : 4;
      if (conceptHit) score += isImportant ? 20 : 7;
    }

    const coverage = profile.terms.length ? matchedTerms / profile.terms.length : 0;
    score += coverage * 38;
    score += importantMatches * 16;

    const chunkConcepts = new Set(Array.isArray(chunk.concepts) ? chunk.concepts : []);
    const chunkIntentTags = new Set(Array.isArray(chunk.intentTags) ? chunk.intentTags : []);
    for (const tag of profile.intentTags) {
      if (chunkIntentTags.has(tag)) score += 30;
      if (meta.includes(tag) || text.includes(tag)) score += 8;
    }
    for (const tag of profile.populationTags) {
      if (chunkConcepts.has(tag) || meta.includes(tag) || text.includes(tag)) score += 22;
    }

    const collectionId = String(chunk.collectionId || '');
    if (options.selectedCollectionId && collectionId === options.selectedCollectionId) score += 20;
    if (!options.selectedCollectionId && options.focusCollections.includes(collectionId)) score += 45;
    if (!profile.normalizedQuery.includes('2025') && Number(chunk.year || 0) >= 2026) score += 15;
    if (!profile.normalizedQuery.includes('2025') && Number(chunk.year || 0) === 2025) score -= 8;

    if (options.sourcePathCandidates.length > 0 && options.sourcePathCandidates.includes(chunk.sourcePath)) {
      score += 70;
    }

    const rawText = String(chunk.text || '');
    const firstBlock = rawText.slice(0, 900);
    const etAlCount = countRegex(rawText, /\bet al\b/gi);
    const referenceLineCount = countRegex(rawText, /^\s*\d+\.\s+[A-Z][A-Za-z-]+/gim);
    const supplementListCount = countRegex(rawText, /\b(Table|Figure)\s+S\d+/gi);
    const normalizedConcepts = new Set((Array.isArray(chunk.concepts) ? chunk.concepts : []).map(normalizeSearchText));
    const normalizedKeywords = new Set((Array.isArray(chunk.keywords) ? chunk.keywords : []).map(normalizeSearchText));
    const nonClinicalAnchors = new Set([
      'adult', 'adults', 'child', 'children', 'pediatric', 'paediatric', 'adolescent', 'pregnancy',
      'pregnant', 'dialysis', 'nondialysis', 'elderly', 'geriatric', 'icu', 'intensive', 'critical',
      'diagnosis', 'treatment', 'threshold', 'dose', 'monitoring', 'contraindication', 'comparison',
      'explanation',
    ]);
    const requestedAnchors = Array.from(new Set([
      ...profile.concepts,
      ...profile.importantTerms.filter((term) => highValueTerms.has(term)),
    ])).filter((term) => term && !nonClinicalAnchors.has(term));
    const strictAnchors = requestedAnchors.filter((term) =>
      [
        'af', 'afib', 'atrial', 'fibrillation', 'atrial fibrillation',
        'dka', 'hhs', 'ketoacidosis', 'asthma', 'copd', 'ckd', 'aki',
        'heart', 'failure', 'stroke', 'pneumonia', 'sepsis', 'cirrhosis',
        'variceal', 'gerd', 'ibd', 'gout', 'urate', 'thyroid', 'obesity',
      ].includes(term)
    );
    if (requestedAnchors.length > 0) {
      const anchorHits = requestedAnchors.filter((anchor) =>
        text.includes(anchor) || meta.includes(anchor) || normalizedConcepts.has(anchor) || normalizedKeywords.has(anchor)
      ).length;
      if (anchorHits === 0) score -= 85;
      else score += Math.min(anchorHits, 4) * 34;
    }
    if (strictAnchors.length > 0) {
      const strictHits = strictAnchors.filter((anchor) =>
        text.includes(anchor) || meta.includes(anchor) || normalizedConcepts.has(anchor) || normalizedKeywords.has(anchor)
      ).length;
      if (strictHits === 0) score -= 120;
    }

    if (/(^|\n)\s*references\b/i.test(firstBlock) || etAlCount >= 10 || referenceLineCount >= 8) score -= 145;
    if (/disclosures|acknowledg/i.test(meta)) score -= 45;
    if (/under review or expired/i.test(meta)) score -= 320;
    if (/table of contents|contents\b/i.test(firstBlock) || supplementListCount >= 8 || /PRISMA diagram/i.test(firstBlock)) score -= 95;

    if (profile.intentTags.includes('diagnosis')) {
      if (/criteria for (the )?diagnosis|diagnostic criteria|diagnosis of diabetes/i.test(rawText)) score += 95;
      if (/fasting plasma glucose|oral glucose tolerance|random plasma glucose|A1C\s*[≥>=]/i.test(rawText)) score += 60;
      if (/Table\s+2\.1|classification and diagnosis|confirmatory testing/i.test(rawText)) score += 45;
      if (!profile.populationTags.includes('pregnancy') && /\bGDM\b|gestational diabetes/i.test(rawText)) score -= 55;
    }
    if (profile.terms.includes('iron')) {
      if (/recommendation\s+\d+\.\d+|practice point\s+\d+\.\d+/i.test(rawText)) score += 42;
      if (/initiat(e|ing|ion).*iron|start.*iron|iron therapy/i.test(rawText)) score += 68;
      if (!/iron|ferritin|TSAT|transferrin saturation/i.test(rawText)) score -= 85;
    }
    if (profile.terms.includes('ckd') && (profile.terms.includes('iron') || profile.terms.includes('anemia') || profile.terms.includes('anaemia') || profile.terms.includes('tsat') || profile.terms.includes('ferritin'))) {
      if (chunk.school === 'KDIGO' || /KDIGO|chronic kidney disease|CKD|kidney disease|renal/i.test(meta)) score += 150;
      if (/anemia in ckd|anaemia in ckd|anemia.*chronic kidney disease|anaemia.*chronic kidney disease/i.test(meta)) score += 260;
      if (/anemia in CKD|anaemia in CKD|CKD guideline|chronic kidney disease/i.test(rawText)) score += 80;
      if (/AKI|AKD|acute kidney injury|acute kidney disease/i.test(meta) && !/anemia in ckd|anaemia in ckd/i.test(meta)) score -= 180;
      if (!/CKD|chronic kidney|kidney disease|renal|dialysis/i.test(rawText + ' ' + meta)) score -= 160;
    }
    if (profile.terms.includes('gout') || profile.terms.includes('urate') || profile.terms.includes('allopurinol') || profile.terms.includes('febuxostat') || profile.terms.includes('colchicine')) {
      if (/gout|urate|uric acid|allopurinol|febuxostat|colchicine|ULT|urate-lowering/i.test(rawText + ' ' + meta)) score += 150;
      if (/2020 guideline for the management of gout/i.test(meta)) score += 240;
      else if (/management of gout/i.test(meta)) score += 110;
      if (!/gout|urate|uric acid|allopurinol|febuxostat|colchicine|urate-lowering/i.test(rawText + ' ' + meta)) score -= 170;
    }
    if (/hepatitis b|hbv/i.test(profile.normalizedQuery)) {
      if (/hepatitis b|HBV/i.test(rawText + ' ' + meta)) score += 240;
      if (/management of hepatitis b|hepatitis b virus/i.test(meta)) score += 220;
      if (!/hepatitis b|HBV/i.test(rawText + ' ' + meta)) score -= 180;
    }
    if (profile.intentTags.includes('threshold')) {
      if (/threshold|target|initiat|start|consider|recommendation|practice point/i.test(rawText)) score += 32;
    }
    if (profile.intentTags.includes('treatment')) {
      if (/recommendation|practice point|treatment|therapy|management|initiat|start|dose|administer/i.test(rawText)) score += 34;
    }
    if (profile.terms.includes('dka') || profile.terms.includes('ketoacidosis')) {
      if (/\bDKA\b|diabetic ketoacidosis|ketoacidosis|ketone|ketosis|acidosis/i.test(rawText)) score += 110;
      if (/fluid|insulin|potassium|cerebral edema|cerebral oedema|critical care|intensive care|ICU|HHS/i.test(rawText)) score += 45;
      if (chunk.school === 'ADA' && /hyperglycemic crises|diabetes care in the hospital|diabetic ketoacidosis|ketoacidosis/i.test(rawText + ' ' + meta)) score += 340;
      if (chunk.school === 'ADA' && profile.populationTags.includes('child') && /children and adolescents/i.test(meta)) score += 70;
      if (/hyperglycemic crises|diabetic ketoacidosis|ketoacidosis/i.test(meta)) score += 260;
      if (profile.intentTags.includes('treatment') && /children and adolescents/i.test(meta) && !/hyperglycemic crises|diabetic ketoacidosis|ketoacidosis/i.test(meta)) score -= 420;
      if (/type 2 diabetes mellitus|newly diagnosed type 2 diabetes/i.test(meta) && !/hyperglycemic crises|diabetic ketoacidosis|ketoacidosis/i.test(meta)) score -= 180;
      if (!/\bDKA\b|diabetic ketoacidosis|ketoacidosis|ketone|ketosis/i.test(rawText)) score -= 90;
    }
    if (profile.populationTags.includes('child')) {
      if (/child|children|pediatric|paediatric|adolescent|youth/i.test(rawText)) score += 42;
      if (/(adult|adults)\b/i.test(rawText) && !/child|children|pediatric|paediatric|adolescent/i.test(rawText)) score -= 24;
    }
    if (profile.populationTags.includes('criticalCare')) {
      if (/intensive care|critical care|critically ill|ICU|high dependency/i.test(rawText)) score += 38;
    }
    if (profile.intentTags.includes('monitoring')) {
      if (/monitor|follow-up|repeat|frequency|reassess|measure/i.test(rawText)) score += 36;
    }
    if (profile.terms.includes('mart') || profile.terms.includes('formoterol')) {
      if (/maintenance and reliever therapy|MART|ICS-formoterol/i.test(rawText)) score += 74;
    }
    if (profile.terms.includes('variceal') || profile.terms.includes('varices')) {
      if (/variceal (haemorrhage|hemorrhage|bleeding)|acute variceal|portal hypertension/i.test(rawText)) score += 82;
      if (/vasoactive|terlipressin|octreotide|endoscopy|band ligation|antibiotic prophylaxis|TIPS/i.test(rawText)) score += 48;
    }
    if (profile.terms.includes('cirrhosis')) {
      if (/cirrhosis|decompensated liver disease|portal hypertension/i.test(rawText)) score += 24;
    }
    if (profile.populationTags.includes('nondialysis') && /dialysis|hemodialysis|haemodialysis/i.test(rawText) && !/not receiving dialysis|not on dialysis|non[- ]dialysis|nondialysis/i.test(rawText)) {
      score -= 30;
    }
    if (profile.plan?.needsComparison) {
      if (/recommendation|practice point|guideline|should|recommend/i.test(rawText)) score += 18;
    }

    return Math.round(score * 10) / 10;
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
      collectBookIdPrefix('kdigo-anemia-in-ckd', 'kdigo-2026', 360);
    }
    if (/\b(hepatitis b|hbv)\b/i.test(queryText)) {
      collectBookIdPrefix('easl-2025-easl-clinical-practice-guidelines-on-the-management-of-', 'easl-2026', 320);
    }
    if (profile.terms.includes('dka') || profile.terms.includes('ketoacidosis')) {
      collectBookIdPrefix('ada-2026-16-diabetes-care-in-the-hospital', 'ada-2026', 240);
      collectBookIdPrefix('ada-2026-6-glycemic-goals-hypoglycemia-and-hyperglycemic-crises', 'ada-2026', 180);
      if (profile.populationTags.includes('child')) {
        collectBookIdPrefix('ada-2026-14-children-and-adolescents', 'ada-2026', 160);
      }
    }
    if (profile.terms.includes('asthma') || profile.terms.includes('mart') || profile.terms.includes('formoterol') || profile.terms.includes('saba') || profile.terms.includes('ics')) {
      collectBookIdPrefix('gina-gina-2026', 'gina-2026', 320);
    }
    if (profile.terms.includes('gout') || profile.terms.includes('urate') || profile.terms.includes('allopurinol') || profile.terms.includes('febuxostat') || profile.terms.includes('colchicine')) {
      collectBookIdPrefix('acr-gout-clinical-practice-guidelines-american-college-of-rheumatology-2020-guideline-for-the-management-of-gout', 'acr-2026', 260);
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

  const rankAndShapeResults = async ({ db, candidates, profile, options, limit, diagnostics }) => {
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
      ? await hydrateFullChunks(db, prelim, Math.max(18, limit + RETRIEVAL_LIMITS.hydrateExtra))
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
      ? await expandNeighborContext({ db, ranked: roots, maxRoots: RETRIEVAL_LIMITS.neighborRoots })
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

    const db = getDb();
    const sourcePathCandidates = buildSourcePathCandidates(data);
    const focusCollections = inferFocusCollections(profile);
    const diagnostics = {
      callerHash: getCallerHash(request),
      queryHash: hashDiagnosticValue(profile.normalizedQuery || query),
      queryLength: query.length,
      selectedCollectionId,
      limit,
      strictSource,
      sourcePathCandidateCount: sourcePathCandidates.length,
      focusCollections,
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
    const cacheKey = makeSearchCacheKey({ query, selectedCollectionId, sourcePathCandidates, limit, strictSource });
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

    let candidates = [];
    if (sourcePathCandidates.length > 0) {
      candidates = await fetchSourceScopedCandidates({ db, sourcePathCandidates });
      diagnostics.sourceScopedCandidateCount = candidates.length;
    }

    const vectorCandidates = await fetchVectorCandidates({
      db,
      queryEmbedding,
      limit: profile.plan.needsComparison ? RETRIEVAL_LIMITS.vectorComparison : RETRIEVAL_LIMITS.vector,
    });
    diagnostics.vectorCandidateCount = vectorCandidates.length;
    if (vectorCandidates.length > 0) {
      const byId = new Map(candidates.map((chunk) => [makeQueryKey(chunk), chunk]));
      vectorCandidates.forEach((chunk) => mergeCandidate(byId, chunk, 'vector'));
      candidates = Array.from(byId.values());
    }

    const vectorCoversRoutineSearch = Boolean(
      vectorCandidates.length >= 36
      && sourcePathCandidates.length === 0
      && !selectedCollectionId
      && !profile.plan.needsComparison
      && !profile.plan.isHighRisk
      && !profile.plan.needsSourceTrace
    );

    if (!vectorCoversRoutineSearch && (candidates.length === 0 || sourcePathCandidates.length === 0)) {
      const keywordCandidates = await fetchKeywordCandidates({
        db,
        profile,
        selectedCollectionId,
        focusCollections,
        vectorCandidateCount: vectorCandidates.length,
      });
      diagnostics.keywordCandidateCount = keywordCandidates.length;
      const byId = new Map(candidates.map((chunk) => [makeQueryKey(chunk), chunk]));
      keywordCandidates.forEach((chunk) => mergeCandidate(byId, chunk, 'keyword'));
      candidates = Array.from(byId.values());
    }

    if ((candidates.length < 18 || profile.plan.needsComparison) && !hasHighConfidenceSourceCandidates(profile, candidates)) {
      const scanCandidates = await fetchCollectionScanCandidates({
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
    const results = await rankAndShapeResults({ db, candidates, profile, options, limit, diagnostics });
    const response = {
      results,
      meta: {
        intentTags: profile.intentTags,
        populationTags: profile.populationTags,
        focusCollections,
        plan: profile.plan,
        retrievalMode: queryEmbedding
          ? (vectorCandidates.length > 0
            ? (profile.plan.needsComparison ? 'comparison-firestore-vector-hybrid-rerank' : 'firestore-vector-hybrid-rerank')
            : (profile.plan.needsComparison ? 'comparison-hybrid-vector-fallback' : 'hybrid-vector-fallback-rerank'))
          : (profile.plan.needsComparison ? 'comparison-hybrid' : 'hybrid-keyword-semantic-rerank'),
        vectorCandidateCount: vectorCandidates.length,
        fullTextHydrated: Boolean(options.strictSource || profile.plan?.needsComparison || profile.plan?.isHighRisk || profile.plan?.needsSourceTrace),
        cacheHit: false,
      },
    };
    diagnostics.cacheHit = false;
    diagnostics.retrievalMode = response.meta.retrievalMode;
    diagnostics.resultCount = results.length;
    diagnostics.estimatedDocsReturned =
      diagnostics.sourceScopedCandidateCount
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

  const listGuidelineBooks = async (request) => {
    const data = request.data || {};
    const selectedCollectionId = data.selectedCollectionId ? String(data.selectedCollectionId) : '';
    const limit = Math.min(500, Math.max(50, Number(data.limit || 250) || 250));
    const db = getDb();
    let query = db.collection('guideline_books').where('status', '==', 'active');
    if (selectedCollectionId) query = query.where('collectionId', '==', selectedCollectionId);
    const snapshot = await query.limit(limit).get();
    const books = [];
    snapshot.forEach((doc) => {
      const d = doc.data() || {};
      books.push({
        id: doc.id,
        bookId: d.bookId || doc.id,
        collectionId: d.collectionId || '',
        school: d.school || '',
        year: Number(d.year || 0),
        title: d.title || d.sourceTitle || '',
        sourceTitle: d.sourceTitle || '',
        folderTitle: d.folderTitle || '',
        fileTitle: d.fileTitle || '',
        sourcePath: d.sourcePath || '',
        pageCount: Number(d.pageCount || 0),
        chunkCount: Number(d.chunkCount || 0),
        textChars: Number(d.textChars || 0),
        storagePdfPath: d.storagePdfPath || '',
        storagePdfUrl: d.storagePdfUrl || '',
      });
    });
    books.sort((a, b) => {
      if (a.school !== b.school) return a.school.localeCompare(b.school);
      if (b.year !== a.year) return b.year - a.year;
      return a.sourcePath.localeCompare(b.sourcePath);
    });
    return { books };
  };

  const getGuidelineBookText = async (request) => {
    const data = request.data || {};
    const db = getDb();
    const bookId = String(data.bookId || '').trim();
    const limit = Math.min(80, Math.max(12, Number(data.limit || 40) || 40));
    const afterChunkIndex = Math.max(0, Number(data.afterChunkIndex || 0) || 0);
    const samplingMode = String(data.samplingMode || '').trim();
    const sourcePathCandidates = buildSourcePathCandidates(data);

    let chunks = [];
    let book = null;

    if (bookId) {
      const bookSnap = await db.collection('guideline_books').doc(bookId).get();
      if (bookSnap.exists) book = { id: bookSnap.id, ...bookSnap.data() };
      const startIndex = Math.max(1, afterChunkIndex + 1);
      const readLimit = Math.min(RETRIEVAL_LIMITS.bookPageRead, limit + 1);
      const refs = Array.from({ length: readLimit }, (_, idx) => {
        const chunkIndex = startIndex + idx;
        return db.collection('guideline_book_chunks').doc(`${bookId}:${String(chunkIndex).padStart(5, '0')}`);
      });
      const snapshots = await db.getAll(...refs);
      snapshots.forEach((doc) => {
        if (doc.exists) chunks.push(docToChunk(doc));
      });
    } else {
      for (const sourcePath of sourcePathCandidates) {
        const snapshot = await db.collection('guideline_book_chunks')
          .where('sourcePath', '==', sourcePath)
          .limit(RETRIEVAL_LIMITS.bookPageRead)
          .get();
        snapshot.forEach((doc) => chunks.push(docToChunk(doc)));
        if (chunks.length > 0) break;
      }
      if (chunks[0]?.bookId) {
        const bookSnap = await db.collection('guideline_books').doc(chunks[0].bookId).get();
        if (bookSnap.exists) book = { id: bookSnap.id, ...bookSnap.data() };
      }
    }

    chunks = chunks.sort((a, b) => (a.chunkIndex || 0) - (b.chunkIndex || 0));

    if (samplingMode === 'summary') {
      const selected = new Map();
      const add = (chunk) => {
        if (!chunk) return;
        selected.set(chunk.id || `${chunk.bookId || chunk.sourcePath}:${chunk.chunkIndex}`, chunk);
      };
      chunks.slice(0, 5).forEach(add);

      const highValuePattern = /\b(recommend|recommendation|should|diagnos|criteria|classif|management|treat|therapy|contraindicat|avoid|monitor|follow-up|follow up|screen|refer|risk|dose|dosage|target|threshold|algorithm|emergency|acute|severe|pregnan|child|elderly|renal|hepatic)\b/i;
      chunks
        .filter((chunk) => highValuePattern.test(`${chunk.heading || ''} ${chunk.text || ''}`))
        .slice(0, Math.max(8, limit - 8))
        .forEach(add);

      const remainingSlots = Math.max(0, limit - selected.size);
      const step = remainingSlots > 0 ? Math.max(1, Math.floor(chunks.length / remainingSlots)) : chunks.length || 1;
      for (let i = 0; selected.size < limit && i < chunks.length; i += step) add(chunks[i]);
      chunks.slice(-3).forEach(add);

      chunks = Array.from(selected.values())
        .sort((a, b) => (a.chunkIndex || 0) - (b.chunkIndex || 0))
        .slice(0, limit);
    } else {
      chunks = chunks.filter((chunk) => (chunk.chunkIndex || 0) > afterChunkIndex);
    }

    const page = chunks.slice(0, limit);
    const last = page[page.length - 1];
    return {
      book: book ? {
        id: book.id || book.bookId || '',
        bookId: book.bookId || book.id || '',
        collectionId: book.collectionId || '',
        school: book.school || '',
        year: Number(book.year || 0),
        title: book.title || book.sourceTitle || '',
        sourceTitle: book.sourceTitle || '',
        folderTitle: book.folderTitle || '',
        fileTitle: book.fileTitle || '',
        sourcePath: book.sourcePath || '',
        pageCount: Number(book.pageCount || 0),
        chunkCount: Number(book.chunkCount || 0),
        textChars: Number(book.textChars || 0),
        storagePdfPath: book.storagePdfPath || '',
        storagePdfUrl: book.storagePdfUrl || '',
      } : null,
      chunks: page,
      nextAfterChunkIndex: samplingMode === 'summary' ? null : (last ? last.chunkIndex : null),
      hasMore: samplingMode === 'summary' ? false : chunks.length > page.length,
    };
  };

  return {
    getGuidelineBookText,
    listGuidelineBooks,
    searchGuidelineIndex,
  };
};
