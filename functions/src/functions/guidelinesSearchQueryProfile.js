const normalizeSearchText = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[\u0623\u0625\u0622\u0671]/g, '\u0627')
    .replace(/\u0649/g, '\u064a')
    .replace(/\u0629/g, '\u0647')
    .replace(/\u0624/g, '\u0648')
    .replace(/\u0626/g, '\u064a')
    .replace(/\bhaem/g, 'hem')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

const stopWords = new Set([
  'a', 'an', 'and', 'are', 'be', 'by', 'can', 'do', 'does', 'for', 'from', 'how', 'i',
  'in', 'is', 'it', 'me', 'of', 'on', 'or', 'should', 'the', 'to', 'use', 'what',
  'when', 'with', 'this', 'that', 'these', 'those', 'about', 'patient', 'patients',
  'doctor', 'شرح', 'اشرح', 'ايه', 'متى', 'امتى', 'هل', 'في', 'من', 'على', 'عن',
  'مع', 'ازاي', 'ممكن',
]);

const clinicalAliasGroups = [
  ['aki', 'acute kidney injury', 'acute renal failure', 'kidney injury', 'renal injury', 'اصابة كلوية حادة', 'فشل كلوي حاد'],
  ['akd', 'acute kidney disease'],
  ['ckd', 'chronic kidney disease', 'chronic renal disease', 'kidney disease', 'renal disease', 'renal', 'kidney', 'قصور كلوي مزمن', 'مرض كلوي مزمن'],
  ['rrt', 'krt', 'renal replacement therapy', 'kidney replacement therapy', 'dialysis', 'hemodialysis', 'haemodialysis', 'peritoneal dialysis', 'غسيل كلوي'],
  ['esa', 'erythropoiesis stimulating agent', 'epoetin', 'darbepoetin', 'erythropoietin'],
  ['hb', 'hgb', 'hemoglobin', 'haemoglobin', 'هيموجلوبين'],
  ['iron', 'ferritin', 'tsat', 'transferrin saturation', 'حديد', 'فيريتين'],
  ['egfr', 'gfr', 'estimated glomerular filtration rate', 'glomerular filtration rate'],
  ['scr', 'serum creatinine', 'creatinine', 'كرياتينين'],
  ['urine output', 'oliguria', 'anuria', 'diuresis'],
  ['hyperkalemia', 'hyperkalaemia', 'potassium', 'بوتاسيوم'],
  ['acidosis', 'metabolic acidosis'],
  ['fluid overload', 'volume overload', 'pulmonary edema', 'oedema', 'edema'],
  ['uremia', 'uraemia', 'uremic'],
  ['diabetes', 'dm', 't2d', 't2dm', 'type 2 diabetes', 'سكري'],
  ['a1c', 'hba1c', 'glycated hemoglobin', 'glycaemic', 'glycemic', 'سكر تراكمي'],
  ['bp', 'blood pressure', 'hypertension', 'ضغط الدم', 'ضغط'],
  ['sglt2', 'sglt2 inhibitor', 'sodium glucose cotransporter 2'],
  ['glp1', 'glp 1', 'glp-1 receptor agonist'],
  ['ascvd', 'atherosclerotic cardiovascular disease', 'cardiovascular disease', 'cvd'],
  ['asthma', 'bronchial asthma', 'ربو', 'حساسية صدر'],
  ['ics', 'inhaled corticosteroid', 'corticosteroid inhaled'],
  ['saba', 'short acting beta agonist', 'salbutamol', 'albuterol'],
  ['laba', 'long acting beta agonist', 'formoterol', 'salmeterol'],
  ['mart', 'maintenance and reliever therapy', 'smart', 'anti inflammatory reliever'],
  ['copd', 'chronic obstructive pulmonary disease'],
  ['pregnancy', 'pregnant', 'gestational', 'حمل', 'حامل'],
  ['children', 'child', 'pediatric', 'paediatric', 'adolescent', 'اطفال', 'طفل'],
];

const highValueTerms = new Set([
  'aki', 'akd', 'ckd', 'rrt', 'krt', 'esa', 'hb', 'hgb', 'iron', 'ferritin', 'tsat',
  'egfr', 'creatinine', 'hyperkalemia', 'diabetes', 'a1c', 'hba1c', 'sglt2', 'glp1',
  'ascvd', 'asthma', 'ics', 'saba', 'laba', 'mart', 'formoterol', 'salbutamol',
  'albuterol', 'dialysis', 'anemia', 'anaemia', 'pregnancy', 'children', 'insulin',
  'oliguria', 'anuria', 'acidosis', 'uremia', 'edema', 'oedema', 'copd',
]);

const intentLexicon = {
  diagnosis: ['diagnosis', 'diagnose', 'diagnostic', 'criteria', 'confirm', 'classification', 'تشخيص', 'معايير'],
  treatment: ['treatment', 'treat', 'therapy', 'management', 'start', 'initiate', 'give', 'use', 'stop', 'switch', 'علاج', 'ابدأ', 'استخدم'],
  threshold: ['when', 'indication', 'threshold', 'target', 'level', 'cutoff', 'goal', 'متى', 'امتى', 'هدف', 'نسبة'],
  dose: ['dose', 'dosage', 'mg', 'units', 'جرعة'],
  monitoring: ['monitor', 'follow', 'repeat', 'frequency', 'reassess', 'متابعة', 'راقب'],
  contraindication: ['avoid', 'contraindication', 'caution', 'harm', 'تجنب', 'ممنوع'],
  comparison: ['compare', 'versus', 'vs', 'difference', 'better', 'مقارنة', 'فرق'],
  explanation: ['explain', 'why', 'mechanism', 'meaning', 'شرح', 'اشرح', 'يعني'],
};

const populationLexicon = {
  adult: ['adult', 'adults', 'بالغ'],
  child: ['child', 'children', 'pediatric', 'paediatric', 'adolescent', 'اطفال', 'طفل'],
  pregnancy: ['pregnancy', 'pregnant', 'gestational', 'حمل', 'حامل'],
  dialysis: ['dialysis', 'hemodialysis', 'haemodialysis', 'peritoneal dialysis', 'غسيل'],
  nondialysis: ['not on dialysis', 'non dialysis', 'nondialysis', 'nd ckd', 'بدون غسيل'],
  elderly: ['older adult', 'elderly', 'geriatric', 'كبار السن'],
};

[
  '\u0639\u0646\u062f\u0647', '\u0639\u0646\u062f\u0647\u0627', '\u0633\u0646', '\u0633\u0646\u0647',
  '\u0633\u0646\u064a\u0646', '\u0633\u0646\u0648\u0627\u062a', '\u0639\u0627\u0645', '\u0627\u0639\u0648\u0627\u0645',
  '\u0639\u0627\u064a\u0632', '\u0627\u0632\u0627\u064a', '\u0643\u064a\u0641',
].forEach((term) => stopWords.add(term));

clinicalAliasGroups.push(
  ['dka', 'diabetic ketoacidosis', 'ketoacidosis', 'ketosis', 'ketone', 'ketones', 'ketonaemia', 'ketonemia', '\u062d\u0645\u0627\u0636 \u0643\u064a\u062a\u0648\u0646\u064a', '\u0643\u064a\u062a\u0648\u0646', '\u0643\u064a\u062a\u0648\u0646\u0627\u062a'],
  ['hhs', 'hyperosmolar hyperglycemic state', 'hyperosmolar hyperglycaemic state', 'hyperosmolar'],
  ['hypoglycemia', 'hypoglycaemia', 'low blood glucose', 'low glucose', 'low sugar', '\u0646\u0642\u0635 \u0633\u0643\u0631', '\u0647\u0628\u0648\u0637 \u0633\u0643\u0631'],
  ['hyperglycemia', 'hyperglycaemia', 'high blood glucose', 'high glucose', 'high sugar', '\u0627\u0631\u062a\u0641\u0627\u0639 \u0633\u0643\u0631'],
  ['icu', 'intensive care', 'critical care', 'critically ill', '\u0627\u0644\u0639\u0646\u0627\u064a\u0647', '\u0639\u0646\u0627\u064a\u0647 \u0645\u0631\u0643\u0632\u0647'],
  ['heart failure', 'hf', 'hfrEF', 'hfpef', 'decompensated heart failure'],
  ['atrial fibrillation', 'af', 'afib'],
  ['acute coronary syndrome', 'acs', 'myocardial infarction', 'mi', 'nstemi', 'stemi'],
  ['stroke', 'tia', 'cerebrovascular accident', 'cva'],
  ['pneumonia', 'community acquired pneumonia', 'cap'],
  ['sepsis', 'septic shock'],
  ['cirrhosis', 'liver cirrhosis', 'decompensated liver disease'],
  ['variceal bleeding', 'variceal bleed', 'varices', 'portal hypertension'],
  ['gerd', 'gastroesophageal reflux disease', 'reflux'],
  ['ibd', 'inflammatory bowel disease', 'ulcerative colitis', 'crohn'],
  ['gout', 'urate', 'uric acid', 'urate lowering', 'urate-lowering therapy', 'allopurinol', 'febuxostat', 'colchicine'],
  ['thyroid', 'hypothyroidism', 'hyperthyroidism', 'tsh'],
  ['obesity', 'overweight', 'weight management'],
);

[
  'dka', 'hhs', 'ketoacidosis', 'ketone', 'hypoglycemia', 'hyperglycemia',
  'icu', 'intensive', 'critical', 'heart', 'failure', 'afib', 'acs', 'mi',
  'stroke', 'pneumonia', 'sepsis', 'cirrhosis', 'variceal', 'gerd', 'ibd',
  'gout', 'urate', 'allopurinol', 'febuxostat', 'colchicine',
  'thyroid', 'obesity',
].forEach((term) => highValueTerms.add(term));

intentLexicon.treatment.push('manage', 'handle', '\u062a\u0639\u0627\u0645\u0644', '\u0627\u062a\u0639\u0627\u0645\u0644', '\u0627\u062f\u0627\u0631\u0647', '\u062a\u062f\u0628\u064a\u0631', '\u0627\u0632\u0627\u064a', '\u0643\u064a\u0641');
populationLexicon.criticalCare = ['icu', 'intensive care', 'critical care', 'critically ill', '\u0627\u0644\u0639\u0646\u0627\u064a\u0647', '\u0639\u0646\u0627\u064a\u0647 \u0645\u0631\u0643\u0632\u0647'];

const splitTerms = (value) =>
  normalizeSearchText(value)
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2 && !stopWords.has(term));

const inferAgeProfile = (normalizedQuery) => {
  const match = normalizedQuery.match(
    /(^|\s)(\d{1,3}|one|two|three|four|five|six|seven|eight|nine|ten)\s*(day|days|month|months|year|years|yr|yrs|yo|y o|\u064a\u0648\u0645|\u0627\u064a\u0627\u0645|\u0634\u0647\u0631|\u0634\u0647\u0648\u0631|\u0633\u0646\u0647|\u0633\u0646\u064a\u0646|\u0633\u0646\u0648\u0627\u062a|\u0639\u0627\u0645|\u0627\u0639\u0648\u0627\u0645)\b/i,
  );
  if (!match) return null;
  const wordNumbers = {
    one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  };
  const rawValue = match[2].toLowerCase();
  const value = Number.isFinite(Number(rawValue)) ? Number(rawValue) : wordNumbers[rawValue];
  const unit = match[3].toLowerCase();
  if (!Number.isFinite(value)) return null;
  const isDay = /day|\u064a\u0648\u0645|\u0627\u064a\u0627\u0645/.test(unit);
  const isMonth = /month|\u0634\u0647\u0631|\u0634\u0647\u0648\u0631/.test(unit);
  const ageYears = isDay ? value / 365 : isMonth ? value / 12 : value;
  if (ageYears < 0.08) return { ageYears, population: 'neonate', terms: ['neonate', 'newborn', 'infant', 'pediatric', 'child'] };
  if (ageYears < 2) return { ageYears, population: 'infant', terms: ['infant', 'pediatric', 'child', 'children'] };
  if (ageYears < 13) return { ageYears, population: 'child', terms: ['child', 'children', 'pediatric', 'paediatric'] };
  if (ageYears < 18) return { ageYears, population: 'adolescent', terms: ['adolescent', 'children', 'pediatric', 'paediatric'] };
  if (ageYears >= 65) return { ageYears, population: 'elderly', terms: ['older adult', 'elderly', 'geriatric'] };
  return { ageYears, population: 'adult', terms: ['adult', 'adults'] };
};

const semanticExpansionRules = [
  {
    match: ['kidney function', 'renal function', 'worsening kidney', 'deteriorating kidney', 'acute rise creatinine', 'drop in urine', 'low urine', 'after diuretic', 'diuretic resistance'],
    terms: ['aki', 'akd', 'creatinine', 'urine output', 'oliguria', 'fluid overload', 'diuresis', 'rrt'],
    concepts: ['aki', 'diuresis', 'fluid', 'rrt'],
  },
  {
    match: ['variceal bleeding', 'variceal bleed', 'acute varices', 'cirrhosis bleeding', 'portal hypertension bleeding', 'hematemesis cirrhosis'],
    terms: ['variceal', 'bleeding', 'cirrhosis', 'portal', 'endoscopy', 'vasoactive', 'antibiotic', 'tips'],
    concepts: ['variceal bleeding', 'cirrhosis', 'portal hypertension'],
  },
  {
    match: ['liver pregnancy', 'pregnant liver', 'cholestasis pregnancy', 'cirrhosis pregnancy'],
    terms: ['pregnancy', 'liver', 'cholestasis', 'cirrhosis', 'maternal', 'fetal'],
    concepts: ['pregnancy', 'liver disease'],
  },
  {
    match: ['shortness of breath asthma', 'wheeze', 'reliever overuse', 'formoterol reliever'],
    terms: ['asthma', 'mart', 'ics', 'formoterol', 'saba', 'exacerbation'],
    concepts: ['asthma', 'mart'],
  },
  {
    match: ['kidney diabetes', 'diabetic kidney', 'albuminuria diabetes', 'egfr diabetes'],
    terms: ['diabetes', 'ckd', 'egfr', 'albuminuria', 'sglt2', 'blood pressure'],
    concepts: ['diabetes', 'ckd', 'sglt2'],
  },
];

const detectQueryPlan = (profile) => {
  const text = profile.normalizedQuery;
  const hasComparison = profile.intentTags.includes('comparison')
    || /\b(vs|versus|compare|difference|ada.*kdigo|kdigo.*ada|gina.*easl|easl.*gina)\b/i.test(text);
  const terms = Array.isArray(profile.terms) ? profile.terms : [];
  const concepts = Array.isArray(profile.concepts) ? profile.concepts : [];
  const hasEmergency = /\b(acute|emergency|urgent|severe|shock|bleeding|dka|hhs|ketoacidosis|hyperkalemia|respiratory failure)\b/i.test(text)
    || ['dka', 'hhs', 'ketoacidosis', 'sepsis', 'shock', 'acs', 'stroke'].some((term) => terms.includes(term) || concepts.includes(term));
  const wantsSource = /\b(source|reference|citation|page|pdf|where)\b/i.test(text);
  return {
    answerShape: hasComparison ? 'comparison' : wantsSource ? 'source-check' : hasEmergency ? 'urgent-care' : 'clinical',
    needsComparison: hasComparison,
    needsSourceTrace: wantsSource,
    isHighRisk: hasEmergency || profile.intentTags.includes('dose') || profile.intentTags.includes('contraindication'),
  };
};

const detectTags = (normalizedQuery, dictionary) => {
  const tags = [];
  for (const [tag, words] of Object.entries(dictionary)) {
    if (words.some((word) => normalizedQuery.includes(normalizeSearchText(word)))) tags.push(tag);
  }
  return tags;
};

const getQueryProfile = (query) => {
  const normalizedQuery = normalizeSearchText(query);
  const rawTerms = splitTerms(normalizedQuery);
  const terms = new Set(rawTerms);
  const concepts = new Set();
  const ageProfile = inferAgeProfile(normalizedQuery);
  if (ageProfile) {
    ageProfile.terms.forEach((term) => splitTerms(term).forEach((part) => terms.add(part)));
    if (['child', 'adolescent', 'infant', 'neonate'].includes(ageProfile.population)) concepts.add('children');
    else concepts.add(ageProfile.population);
  }
  rawTerms.forEach((term) => {
    if (term.startsWith('ال') && term.length > 4) terms.add(term.slice(2));
    if (term.startsWith('بال') && term.length > 5) terms.add(term.slice(3));
    if (term.startsWith('لل') && term.length > 4) terms.add(term.slice(2));
  });

  for (const aliases of clinicalAliasGroups) {
    const normalizedAliases = aliases.map(normalizeSearchText);
    const matched = normalizedAliases.some((alias) => {
      if (!alias) return false;
      if (normalizedQuery.includes(alias)) return true;
      if (!alias.includes(' ')) return terms.has(alias);
      return false;
    });
    if (matched) {
      normalizedAliases.forEach((alias) => splitTerms(alias).forEach((term) => terms.add(term)));
      splitTerms(normalizedAliases[0]).forEach((term) => concepts.add(term));
    }
  }

  for (const rule of semanticExpansionRules) {
    const matched = rule.match.some((phrase) => normalizedQuery.includes(normalizeSearchText(phrase)));
    if (matched) {
      rule.terms.forEach((term) => splitTerms(term).forEach((part) => terms.add(part)));
      rule.concepts.forEach((concept) => splitTerms(concept).forEach((part) => concepts.add(part)));
    }
  }

  const allTerms = Array.from(terms);
  const intentTags = detectTags(normalizedQuery, intentLexicon);
  const populationTags = detectTags(normalizedQuery, populationLexicon);
  if (ageProfile?.population) {
    if (['child', 'adolescent', 'infant', 'neonate'].includes(ageProfile.population) && !populationTags.includes('child')) populationTags.push('child');
    if (ageProfile.population === 'adult' && !populationTags.includes('adult')) populationTags.push('adult');
    if (ageProfile.population === 'elderly' && !populationTags.includes('elderly')) populationTags.push('elderly');
  }
  const plan = detectQueryPlan({ normalizedQuery, intentTags, populationTags, terms: allTerms, concepts: Array.from(concepts) });
  const importantTerms = allTerms
    .sort((a, b) => {
      const scoreA = (highValueTerms.has(a) ? 100 : 0) + Math.min(a.length, 20);
      const scoreB = (highValueTerms.has(b) ? 100 : 0) + Math.min(b.length, 20);
      return scoreB - scoreA;
    })
    .slice(0, 10);

  return {
    normalizedQuery,
    rawTerms,
    terms: allTerms,
    importantTerms,
    concepts: Array.from(concepts),
    intentTags,
    populationTags,
    ageProfile,
    plan,
  };
};

const inferFocusCollections = (profile) => {
  const terms = new Set(profile.terms);
  const text = profile.normalizedQuery;
  const focus = [];
  const hasAny = (items) => items.some((item) => terms.has(item) || text.includes(item));

  if (hasAny(['asthma', 'mart', 'smart', 'ics', 'saba', 'laba', 'formoterol', 'salbutamol', 'albuterol'])) focus.push('gina-2026');
  if (hasAny(['copd', 'chronic obstructive', 'gold', 'bronchodilator', 'eosinophil', 'triple therapy'])) focus.push('gold-2026');
  if (hasAny(['diabetes', 'dka', 'hhs', 'ketoacidosis', 'ketone', 'hypoglycemia', 'hyperglycemia', 'a1c', 'hba1c', 'insulin', 'sglt2', 'glp1', 'obesity'])) focus.push('ada-2026');
  if (hasAny(['ckd', 'aki', 'akd', 'kidney', 'renal', 'dialysis', 'egfr', 'gfr', 'ferritin', 'tsat', 'esa', 'anemia', 'anaemia', 'transplant', 'glomerular', 'creatinine'])) focus.push('kdigo-2026');
  if (hasAny(['af', 'afib', 'atrial', 'fibrillation', 'atrial fibrillation'])) focus.push('acc-2023', 'esc-2024');
  if (hasAny(['heart', 'cardiac', 'cardiovascular', 'hf', 'heart failure'])) focus.push('acc-2022', 'esc-2021', 'esc-2023', 'esc-2026');
  if (hasAny(['acs', 'mi', 'myocardial', 'coronary'])) focus.push('acc-2025', 'esc-2023');
  if (hasAny(['stroke'])) focus.push('nice-2022', 'nice-2023', 'nice-2024');
  if (hasAny(['liver', 'cirrhosis', 'hepatitis', 'portal', 'variceal', 'varices', 'ascites', 'tips', 'cholestasis'])) focus.push('easl-2026');
  if (hasAny(['thyroid', 'endocrine', 'hormone', 'pituitary', 'adrenal', 'obesity'])) focus.push('endocrine-2026');
  if (hasAny(['gastrointestinal', 'stomach', 'colon', 'gerd', 'ibd', 'crohn'])) focus.push('acg-2026', 'aga-2026');
  if (hasAny(['gout', 'urate', 'uric acid', 'allopurinol', 'febuxostat', 'colchicine', 'rheumatoid', 'arthritis', 'spondyloarthritis', 'osteoporosis'])) focus.push('acr-2026');
  if (hasAny(['nutrition', 'nutritional', 'enteral', 'parenteral', 'protein', 'calories', 'icu nutrition', 'clinical nutrition'])) focus.push('espen-2026');
  if (hasAny(['psoriasis', 'biologic', 'phototherapy', 'dermatitis', 'eczema', 'dermatology'])) focus.push('aad-2023');

  return Array.from(new Set(focus));
};

module.exports = {
  normalizeSearchText,
  highValueTerms,
  getQueryProfile,
  inferFocusCollections,
};
