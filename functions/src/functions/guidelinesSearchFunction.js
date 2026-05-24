const admin = require('firebase-admin');

module.exports = ({
  HttpsError,
  getDb,
}) => {
  // Clinical Aliases and Stop Words for Keyword Indexing
  const normalizeSearchText = (value) =>
    String(value || '')
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

  const splitTerms = (value) =>
    value
      .split(/\s+/)
      .map((term) => term.trim())
      .filter((term) => term.length >= 2 && !stopWords.has(term));

  // High-speed Keyword Extraction for searching
  const extractKeywords = (text) => {
    const normalized = normalizeSearchText(text);
    const words = splitTerms(normalized);
    const keywordSet = new Set();

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

  /**
   * Cloud Function: searchGuidelineIndex
   * Receives: query (string), selectedCollectionId (string, optional), selectedGroup (string, optional)
   * Returns: list of top 10 relevant chunks ranked by relevance score
   */
  const searchGuidelineIndex = async (request) => {
    const data = request.data || {};
    const query = String(data.query || '').trim();
    const selectedCollectionId = data.selectedCollectionId ? String(data.selectedCollectionId) : null;
    const selectedGroup = data.selectedGroup ? String(data.selectedGroup) : null;

    if (!query) {
      return { results: [] };
    }

    let queryKeywords = extractKeywords(query);
    if (queryKeywords.length === 0) {
      // Fallback: if all words were stop words, just take the raw split terms
      const splitRaw = splitTerms(normalizeSearchText(query));
      if (splitRaw.length === 0) {
        return { results: [] };
      }
      queryKeywords = splitRaw;
    }

    // Limit to maximum 10 terms to be 100% compliant with Firestore array-contains-any query limits
    const matchKeywords = queryKeywords.slice(0, 10);

    const db = getDb();
    let queryRef = db.collection('guideline_chunks');

    // Filter by collection if specified
    if (selectedCollectionId) {
      queryRef = queryRef.where('collectionId', '==', selectedCollectionId);
    }

    // Filter by group if specified
    if (selectedGroup) {
      queryRef = queryRef.where('group', '==', selectedGroup);
    }

    // Query Firestore matching keywords
    queryRef = queryRef.where('keywords', 'array-contains-any', matchKeywords);

    // Set maximum fetch size to 100 to optimize memory & document read cost
    const snapshot = await queryRef.limit(100).get();

    const normalizedQuery = normalizeSearchText(query);
    const results = [];

    snapshot.forEach((doc) => {
      const chunk = doc.data();
      const text = chunk.text || '';
      const label = chunk.label || '';
      const sourceTitle = chunk.sourceTitle || '';
      const fileTitle = chunk.fileTitle || '';
      const school = chunk.school || '';

      const normalizedText = normalizeSearchText(text);
      const normalizedLabel = normalizeSearchText(label);
      const normalizedSourceTitle = normalizeSearchText(sourceTitle);
      const normalizedFileTitle = normalizeSearchText(fileTitle);

      let score = 0;

      // Weighted Scoring Algorithm
      // 1. Check exact phrase match of normalized query in label and text
      if (normalizedLabel.includes(normalizedQuery)) {
        score += 50;
      }
      if (normalizedText.includes(normalizedQuery)) {
        score += 25;
      }

      // 2. Count term frequencies and match locations
      queryKeywords.forEach((term) => {
        // Label matches
        if (normalizedLabel.includes(term)) {
          score += 15;
        }

        // Title matches
        if (normalizedSourceTitle.includes(term) || normalizedFileTitle.includes(term)) {
          score += 8;
        }

        // Medical School matches (GINA, KDIGO, ADA)
        if (String(school).toLowerCase() === term) {
          score += 4;
        }

        // Text matches frequency count
        const textWords = normalizedText.split(/\s+/);
        let frequency = 0;
        for (const w of textWords) {
          if (w === term) {
            frequency++;
          }
        }
        score += Math.min(5, frequency) * 1.5; // Cap text occurrence points to prevent stuffing bias
      });

      results.push({
        id: chunk.id,
        collectionId: chunk.collectionId,
        collectionTitle: chunk.collectionTitle,
        school: chunk.school,
        year: chunk.year,
        group: chunk.group,
        topicId: chunk.topicId,
        sourceId: chunk.sourceId,
        sourceTitle: chunk.sourceTitle,
        folderTitle: chunk.folderTitle,
        fileTitle: chunk.fileTitle,
        url: chunk.url,
        page: chunk.page,
        endPage: chunk.endPage,
        label: chunk.label,
        text: chunk.text,
        kind: chunk.kind,
        score,
      });
    });

    // Sort results descending by score
    results.sort((a, b) => b.score - a.score);

    // Keep only top 10 relevant matches
    const topResults = results.slice(0, 10);

    return { results: topResults };
  };

  return {
    searchGuidelineIndex,
  };
};
