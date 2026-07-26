const { normalizeSearchText, highValueTerms } = require('./guidelinesSearchQueryProfile');

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

const keywordBloomSeeds = [2166136261, 2166136261 ^ 0x9e3779b9, 2166136261 ^ 0x85ebca6b, 2166136261 ^ 0xc2b2ae35];
const bloomHash = (value, seed) => {
  let hash = seed >>> 0;
  for (const character of String(value || '')) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  hash ^= hash >>> 16;
  return hash >>> 0;
};
const keywordBloomHas = (encoded, term) => {
  if (!encoded || !term) return false;
  const bytes = Buffer.from(encoded, 'base64');
  const bitCount = bytes.length * 8;
  if (bitCount === 0) return false;
  return keywordBloomSeeds.every((seed) => {
    const bit = bloomHash(term, seed) % bitCount;
    return (bytes[bit >> 3] & (1 << (bit & 7))) !== 0;
  });
};

const chunkHasKeyword = (chunk, term) => {
  if (!term) return false;
  if (Array.isArray(chunk.keywords) && chunk.keywords.includes(term)) return true;
  if (keywordBloomHas(chunk.keywordBloom, term)) return true;
  return String(chunk.keywordText || '').includes(`\n${term}\n`);
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
    const keywordHit = chunkHasKeyword(chunk, term);
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
      text.includes(anchor) || meta.includes(anchor) || normalizedConcepts.has(anchor) || normalizedKeywords.has(anchor) || chunkHasKeyword(chunk, anchor)
    ).length;
    if (anchorHits === 0) score -= 85;
    else score += Math.min(anchorHits, 4) * 34;
  }
  if (strictAnchors.length > 0) {
    const strictHits = strictAnchors.filter((anchor) =>
      text.includes(anchor) || meta.includes(anchor) || normalizedConcepts.has(anchor) || normalizedKeywords.has(anchor) || chunkHasKeyword(chunk, anchor)
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
  if (profile.populationTags.includes('adult') && !profile.populationTags.includes('pregnancy')) {
    if (/pregnan|gestational|maternal|postpartum|recently pregnant/i.test(rawText + ' ' + meta)) score -= 150;
    if (/people aged 16 or over|adults?\b/i.test(rawText + ' ' + meta)) score += 24;
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


module.exports = {
  chunkMetadataText,
  scoreChunk,
};

