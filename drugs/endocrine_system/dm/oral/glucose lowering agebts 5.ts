import { Medication, Category } from '../../../../types';

// Helper to convert numbers to Arabic numerals
const toAr = (n: number | string) => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
const fixed = (text: string) => (_w: number, _a: number) => text;

const uniq = (values: Array<string | undefined | null>) => {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const v of values) {
    const s = (v || '').toString().trim();
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
};

const mergeWarnings = (...lists: string[][]) => uniq(lists.flat());

// =========================
// Common warnings (patient-facing)
// =========================
const GENERAL_DIABETES_WARNINGS = [
  'التزم بالنظام الغذائي والرياضة وقياس السكر.',
  'إذا حدث دوخة شديدة/تعرق/رعشة/جوع شديد: قد يكون هبوط سكر—قِس السكر وخذ مصدر سكر سريع، ثم أعد التقييم إذا تكرر.',
  'راجع تداخلات المريض (خصوصاً الكُلى/الضغط/الكورتيزون).',
];

const METFORMIN_WARNINGS = [
  ...GENERAL_DIABETES_WARNINGS,
  'قد يسبب اضطراب معدة/غثيان/إسهال خصوصاً في البداية؛ ابدأ تدريجياً وخذه مع/بعد الأكل.',
  'يُوقف مؤقتاً قبل الأشعة بالصبغة (٢٤–٤٨ ساعة) ويُعاد بعد التأكد من سلامة وظائف الكُلى.',
  'يُتجنب في القصور الكلوي الشديد (eGFR منخفض) أو الجفاف الشديد/قيء مستمر (خطر حُماض لاكتيكي نادر).',
];

const DPP4_WARNINGS = [
  ...GENERAL_DIABETES_WARNINGS,
  'أوقف الدواء وأعد التقييم إذا حدث ألم بطن شديد مستمر مع قيء (اشتباه التهاب بنكرياس).',
];

const SGLT2_WARNINGS = [
  ...GENERAL_DIABETES_WARNINGS,
  'قد يسبب كثرة التبول وجفاف؛ اشرب سوائل كافية (إذا لا يوجد مانع طبي).',
  'اهتم بالنظافة الشخصية لتقليل التهابات المسالك/الفطريات التناسلية.',
  'إذا لديك قيء/إسهال شديد أو صيام طويل أو قبل عملية جراحية: أعد التقييم لإيقافه مؤقتاً (لتقليل خطر الحماض الكيتوني).',
  'يُستخدم بحذر مع القصور الكلوي حسب eGFR (قد لا يكون مناسباً في الحالات الشديدة).',
];

const SULFONYLUREA_WARNINGS = [
  ...GENERAL_DIABETES_WARNINGS,
  'خطر هبوط السكر وارد خصوصاً عند تفويت الوجبات أو المجهود الزائد.',
  'قد يسبب زيادة وزن عند بعض المرضى.',
  'يُستخدم بحذر في كبار السن أو القصور الكلوي/الكبدي لتقليل خطر الهبوط.',
];

const GLINIDE_WARNINGS = [
  ...GENERAL_DIABETES_WARNINGS,
  'خطر هبوط السكر وارد خصوصاً عند تفويت الوجبات.',
  'يُؤخذ قبل الوجبات؛ إذا لم تتناول الوجبة لا تأخذ الجرعة.',
];

const PIOGLITAZONE_WARNINGS = [
  ...GENERAL_DIABETES_WARNINGS,
  'قد يسبب احتباس سوائل/تورم القدمين وزيادة وزن؛ يُتجنب في قصور القلب.',
  'يُستخدم بحذر عند وجود تاريخ مرضي لسرطان المثانة.',
];

const GLP1_WARNINGS = [
  ...GENERAL_DIABETES_WARNINGS,
  'قد يسبب غثيان/قيء/إسهال خصوصاً في البداية؛ التدرج في الجرعة يقلل الأعراض.',
  'أوقف الدواء وأعد التقييم إذا حدث ألم بطن شديد مستمر مع قيء (اشتباه التهاب بنكرياس).',
  'معظم GLP‑1 غير معتمد في الحمل؛ إن تخططين للحمل أو أثناءه: أعدي التقييم.',
];

// =========================
// Keyword & instruction enhancement
// =========================
const glucoseKeywordBoost = (m: Medication) => {
  const g = (m.genericName || '').toString().toLowerCase();
  const n = (m.name || '').toString().toLowerCase();

  const base = [
    '#anti-diabetic',
    '#anti_diabetic',
    'anti-diabetic',
    'diabetes',
    'dm',
    'type 2',
    't2dm',
    'hyperglycemia',
    'سكر',
    'سكر تاني',
    'السكر',
    'مقاومة انسولين',
    'insulin resistance',
    'pcos',
    'تكيس المبايض',
  ];

  const dose = (m.concentration || '').toString();
  const doseAr = dose ? toAr(dose) : '';
  const dosePlain = dose.replace(/\s+/g, '').replace(/\./g, '').toLowerCase();

  const boost: string[] = [];

  if (g.includes('metformin')) boost.push('#sensitizers', '#biguanide', 'biguanide');
  if (g.includes('gliclazide') || g.includes('glimepiride') || g.includes('glibenclamide') || g.includes('glyburide')) boost.push('#secretagogues', '#sulfonylurea', 'sulfonylurea');
  if (g.includes('dapagliflozin') || g.includes('empagliflozin')) boost.push('#sglt2 inhibitor', '#sglt2_inhibitor', 'sglt2 inhibitor');
  if (g.includes('sitagliptin') || g.includes('vildagliptin') || g.includes('linagliptin') || g.includes('alogliptin')) boost.push('#dpp-4 inhibitors', '#dpp_4_inhibitors', 'dpp-4 inhibitor', 'gliptin');
  if (g.includes('pioglitazone')) boost.push('#glitazone', 'thiazolidinedione', 'tzds');
  if (g.includes('repaglinide')) boost.push('#secretagogues', '#glinides', 'glinide', 'meglitinide');
  if (g.includes('semaglutide') || g.includes('tirzepatide') || g.includes('lixisenatide') || g.includes('liraglutide') || g.includes('dulaglutide')) boost.push('#glp-1 agonist', '#glp1', 'glp-1', 'incretin');

  // Common brand aliases used in this batch
  if (g.includes('semaglutide')) boost.push('semaglutide', 'سيماجلوتايد', 'rybelsus', 'رايبلسوس', 'ozempic', 'اوزيمبيك');
  if (g.includes('pioglitazone')) boost.push('pioglitazone', 'بيوجليتازون', 'actos', 'اكتوس', 'diabetin', 'ديابتين');
  if (g.includes('glimepiride')) boost.push('glimepiride', 'جليميبرايد', 'amaryl', 'اماريل', 'glaryl', 'جلاريل', 'glimadel', 'جليمادل', 'glimaryl', 'جليماريل');
  if (g.includes('sitagliptin')) boost.push('sitagliptin', 'سيتاجليبتين', 'januvia', 'جانوفيا', 'pharmabetic', 'فارمابيتك');
  if (g.includes('linagliptin')) boost.push('linagliptin', 'لينا جليبتين', 'trajenta', 'تراجنتا', 'linajenta', 'ليناجينتا', 'prevaglip', 'بريفاجليب');
  if (g.includes('vildagliptin')) boost.push('vildagliptin', 'فيلداجليبتين', 'galvus', 'جالفوس', 'vildaglip', 'فيلداجليب', 'dibavally', 'ديبافالي');
  if (g.includes('alogliptin')) boost.push('alogliptin', 'الوجليبتين', 'inhiglip', 'انهيجليب', 'gliptopack', 'جليبتوباك');
  if (g.includes('empagliflozin')) boost.push('empagliflozin', 'إمباجليفلوزين', 'jardiance', 'جارديانس', 'empaglutech', 'امباجلوتيك', 'empaglimax', 'امباجليماكس');
  if (g.includes('metformin')) boost.push('metformin', 'ميتفورمين');
  if (g.includes('dulaglutide')) boost.push('dulaglutide', 'دولاجلوتايد', 'trulicity', 'تروليسيتي');

  // Form hints
  if (n.includes('xr') || n.includes('mr') || n.includes('ext') || n.includes('extended')) boost.push('xr', 'mr', 'extended release', 'ممتد المفعول');
  if (n.includes('pen') || (m.form || '').toString().toLowerCase().includes('pen')) boost.push('pen', 'قلم', 'قلم حقن');
  if (n.includes('inj') || n.includes('injection')) boost.push('injection', 'حقن', 'حقنة');

  return uniq([...base, ...boost, dose, dosePlain, doseAr, m.name, m.genericName]);
};

const enhanceGlucoseLoweringMedication = (m: Medication): Medication => ({
  ...m,
  matchKeywords: uniq([...(m.matchKeywords || []), ...glucoseKeywordBoost(m)]),
});

// =========================
// Glucose lowering agents (oral) - list 5 (232-258)
// =========================
const GLUCOSE_LOWERING_AGENTS_5_RAW: Medication[] = [
  // 232
  {
    id: 'rybelsus-3mg-30-tabs-dm5',
    name: 'rybelsus 3 mg 30 tabs.',
    genericName: 'semaglutide',
    concentration: '3mg',
    price: 3150,
    matchKeywords: ['rybelsus 3', 'رايبلسوس ٣', '#anti-diabetic', '#glp-1 agonist'],
    usage: 'سيماجلوتايد فموي (GLP‑1) لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('3mg (قرص) — مرة يومياً — على معدة فارغة — مزمن.'),
    warnings: GLP1_WARNINGS,
  },

  // 233
  {
    id: 'diabetin-15mg-30-tab-dm5',
    name: 'diabetin 15mg 30 tab.',
    genericName: 'pioglitazone',
    concentration: '15mg',
    price: 75,
    matchKeywords: ['diabetin 15', 'ديابتين ١٥', '#anti-diabetic', '#sensitizers', '#glitazone'],
    usage: 'بيوجليتازون لتحسين مقاومة الإنسولين.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('15mg (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: PIOGLITAZONE_WARNINGS,
  },

  // 234
  {
    id: 'glaryl-2mg-30-tabs-dm5',
    name: 'glaryl 2mg 30 tabs.',
    genericName: 'glimepiride',
    concentration: '2mg',
    price: 36,
    matchKeywords: ['glaryl 2', 'جلاريل ٢', '#anti-diabetic', '#secretagogues', '#sulfonylurea'],
    usage: 'جليميبرايد (سلفونيل يوريا) لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('2mg (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: SULFONYLUREA_WARNINGS,
  },

  // 235
  {
    id: 'pharmabetic-50mg-30-fc-tab-dm5',
    name: 'pharmabetic 50 mg 30 f.c.tab.',
    genericName: 'sitagliptin',
    concentration: '50mg',
    price: 153,
    matchKeywords: ['pharmabetic 50', 'فارمابيتك ٥٠', '#anti-diabetic', '#dpp-4 inhibitors'],
    usage: 'سيتاجليبتين (DPP‑4) لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('50mg (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: DPP4_WARNINGS,
  },

  // 236
  {
    id: 'prevaglip-plus-2-5-850mg-30-tab-dm5',
    name: 'prevaglip plus 2.5/850 mg 30 tab',
    genericName: 'linagliptin & metformin hydrochloride',
    concentration: '2.5/850mg',
    price: 120.75,
    matchKeywords: ['prevaglip plus 2.5/850', 'بريفاجليب بلس ٨٥٠', '#anti-diabetic', '#dpp-4 inhibitors', '#biguanide'],
    usage: 'ليناجليبتين + ميتفورمين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('2.5/850mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, DPP4_WARNINGS),
  },

  // 237
  {
    id: 'averofage-15-500mg-30-fc-tab-dm5',
    name: 'averofage 15/500mg 30 f.c.tab',
    genericName: 'metformin hydrochloride & pioglitazone',
    concentration: '15/500mg',
    price: 69,
    matchKeywords: ['averofage 15/500', 'افيروفاج ٥٠٠', '#anti-diabetic', '#sensitizers', '#glitazone', '#biguanide'],
    usage: 'ميتفورمين + بيوجليتازون لتحسين مقاومة الإنسولين وضبط السكر.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('15/500mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, PIOGLITAZONE_WARNINGS),
  },

  // 238
  {
    id: 'averofage-15-850mg-30-fc-tab-dm5',
    name: 'averofage 15/850mg 30 f.c.tab.',
    genericName: 'metformin hydrochloride & pioglitazone',
    concentration: '15/850mg',
    price: 76.5,
    matchKeywords: ['averofage 15/850', 'افيروفاج ٨٥٠', '#anti-diabetic', '#sensitizers', '#glitazone', '#biguanide'],
    usage: 'ميتفورمين + بيوجليتازون لتحسين مقاومة الإنسولين وضبط السكر.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('15/850mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, PIOGLITAZONE_WARNINGS),
  },

  // 239
  {
    id: 'rybelsus-3mg-10-tabs-dm5',
    name: 'rybelsus 3mg 10 tabs',
    genericName: 'semaglutide',
    concentration: '3mg (10 tablets)',
    price: 1575,
    matchKeywords: ['rybelsus 3 10', 'رايبلسوس ٣', '#anti-diabetic', '#glp-1 agonist'],
    usage: 'سيماجلوتايد فموي (GLP‑1) لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('3mg (10 tablets) (قرص) — مرة يومياً — على معدة فارغة — مزمن.'),
    warnings: GLP1_WARNINGS,
  },

  // 240
  {
    id: 'empaglutech-10mg-30-tabs-dm5',
    name: 'empaglutech 10mg 30 tabs',
    genericName: 'empagliflozin',
    concentration: '10mg',
    price: 231,
    matchKeywords: ['empaglutech 10', 'امباجلوتيك ١٠', '#anti-diabetic', '#sglt2 inhibitor'],
    usage: 'إمباجليفلوزين (SGLT2) لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('10mg (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: SGLT2_WARNINGS,
  },

  // 241
  {
    id: 'pharmavildamin-50-850mg-30-tab-dm5',
    name: 'pharmavildamin 50/850mg 30 tab',
    genericName: 'vildagliptin & metformin hydrochloride',
    concentration: '50/850mg',
    price: 159,
    matchKeywords: ['pharmavildamin 50/850', 'فارمافيلدامين ٨٥٠', '#anti-diabetic', '#dpp-4 inhibitors', '#biguanide'],
    usage: 'فيلداجليبتين + ميتفورمين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('50/850mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, DPP4_WARNINGS),
  },

  // 242
  {
    id: 'dibavally-50mg-14-tabs-dm5',
    name: 'dibavally 50 mg 14 tabs.',
    genericName: 'vildagliptin',
    concentration: '50mg (14 tablets)',
    price: 41.5,
    matchKeywords: ['dibavally 50 14', 'ديبافالي', '#anti-diabetic', '#dpp-4 inhibitors'],
    usage: 'فيلداجليبتين (DPP‑4) لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('50mg (قرص) — مرتين يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: DPP4_WARNINGS,
  },

  // 243
  {
    id: 'dibavally-50mg-28-tabs-dm5',
    name: 'dibavally 50 mg 28 tabs.',
    genericName: 'vildagliptin',
    concentration: '50mg (28 tablets)',
    price: 152,
    matchKeywords: ['dibavally 50 28', 'ديبافالي ٢٨', '#anti-diabetic', '#dpp-4 inhibitors'],
    usage: 'فيلداجليبتين (DPP‑4) لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('50mg (قرص) — مرتين يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: DPP4_WARNINGS,
  },

  // 244
  {
    id: 'empaglimax-25mg-30-fc-tabs-dm5',
    name: 'empaglimax 25 mg 30 f.c. tabs.',
    genericName: 'empagliflozin',
    concentration: '25mg',
    price: 297,
    matchKeywords: ['empaglimax 25', 'امباجليماكس ٢٥', '#anti-diabetic', '#sglt2 inhibitor'],
    usage: 'إمباجليفلوزين (SGLT2) لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('25mg (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: SGLT2_WARNINGS,
  },

  // 245
  {
    id: 'glimadel-1mg-30-fc-tabs-dm5',
    name: 'glimadel 1mg 30 f.c.tabs.',
    genericName: 'glimepiride',
    concentration: '1mg',
    price: 15,
    matchKeywords: ['glimadel 1', 'جليمادل ١', '#anti-diabetic', '#sulfonylurea'],
    usage: 'جليميبرايد (سلفونيل يوريا) لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('1mg (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: SULFONYLUREA_WARNINGS,
  },

  // 246
  {
    id: 'glimaryl-2mg-30-tab-dm5',
    name: 'glimaryl 2mg 30 tab.',
    genericName: 'glimepiride',
    concentration: '2mg',
    price: 20.25,
    matchKeywords: ['glimaryl 2', 'جليماريل ٢', '#anti-diabetic', '#sulfonylurea'],
    usage: 'جليميبرايد لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('2mg (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: SULFONYLUREA_WARNINGS,
  },

  // 247
  {
    id: 'inhiglip-12-5mg-30-fc-tabs-dm5',
    name: 'inhiglip 12.5 mg 30 f.c. tabs.',
    genericName: 'alogliptin',
    concentration: '12.5mg',
    price: 129,
    matchKeywords: ['inhiglip 12.5', 'انهيجليب', '#anti-diabetic', '#dpp-4 inhibitors'],
    usage: 'ألوغليبتين (DPP‑4) لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('12.5mg (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: DPP4_WARNINGS,
  },

  // 248
  {
    id: 'linajenta-5mg-10-tabs-dm5',
    name: 'linajenta 5 mg 10 tabs.',
    genericName: 'linagliptin',
    concentration: '5mg (10 tablets)',
    price: 153,
    matchKeywords: ['linajenta 5 10', 'ليناجينتا', '#anti-diabetic', '#dpp-4 inhibitors'],
    usage: 'ليناجليبتين (DPP‑4) لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('5mg (10 tablets) (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: DPP4_WARNINGS,
  },

  // 249
  {
    id: 'piompride-4-30mg-30-tab-dm5',
    name: 'piompride 4/30 mg 30 tab.',
    genericName: 'glimepiride & pioglitazone',
    concentration: '4/30mg',
    price: 58.5,
    matchKeywords: ['piompride 4/30', 'بيومبرايد', '#anti-diabetic', '#secretagogues', '#sensitizers'],
    usage: 'جليميبرايد + بيوجليتازون لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('4/30mg (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: mergeWarnings(SULFONYLUREA_WARNINGS, PIOGLITAZONE_WARNINGS),
  },

  // 250
  {
    id: 'prevaglip-plus-2-5-1000mg-30-tabs-dm5',
    name: 'prevaglip plus 2.5/1000mg 30 tabs.',
    genericName: 'linagliptin & metformin hydrochloride',
    concentration: '2.5/1000mg',
    price: 190.5,
    matchKeywords: ['prevaglip plus 2.5/1000', 'بريفاجليب بلس ١٠٠٠', '#anti-diabetic', '#dpp-4 inhibitors', '#biguanide'],
    usage: 'ليناجليبتين + ميتفورمين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('2.5/1000mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, DPP4_WARNINGS),
  },

  // 251
  {
    id: 'prevaglip-plus-2-5-500mg-30-tabs-dm5',
    name: 'prevaglip plus 2.5/500mg 30 tabs.',
    genericName: 'linagliptin & metformin hydrochloride',
    concentration: '2.5/500mg',
    price: 178.5,
    matchKeywords: ['prevaglip plus 2.5/500', 'بريفاجليب بلس ٥٠٠', '#anti-diabetic', '#dpp-4 inhibitors', '#biguanide'],
    usage: 'ليناجليبتين + ميتفورمين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('2.5/500mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, DPP4_WARNINGS),
  },

  // 252
  {
    id: 'atometaflozine-12-5-1000mg-30-tabs-dm5',
    name: 'atometaflozine 12.5/1000mg 30 tabs',
    genericName: 'empagliflozin & metformin hydrochloride',
    concentration: '12.5/1000mg',
    price: 217.5,
    matchKeywords: ['atometaflozine 12.5/1000', 'اتوميتافلوزين ١٠٠٠', '#anti-diabetic', '#sglt2 inhibitor', '#biguanide'],
    usage: 'إمباجليفلوزين + ميتفورمين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('12.5/1000mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, SGLT2_WARNINGS),
  },

  // 253
  {
    id: 'atometaflozine-12-5-500mg-30-tabs-dm5',
    name: 'atometaflozine 12.5/500mg 30 tabs',
    genericName: 'empagliflozin & metformin hydrochloride',
    concentration: '12.5/500mg',
    price: 196.5,
    matchKeywords: ['atometaflozine 12.5/500', 'اتوميتافلوزين ٥٠٠', '#anti-diabetic', '#sglt2 inhibitor', '#biguanide'],
    usage: 'إمباجليفلوزين + ميتفورمين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('12.5/500mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, SGLT2_WARNINGS),
  },

  // 254
  {
    id: 'trulicity-1-5mg-0-5ml-4-pens-dm5',
    name: 'trulicity 1.5mg/0.5ml 4 pre-filled pens',
    genericName: 'dulaglutide',
    concentration: '1.5mg/0.5ml (4 pens)',
    price: 3250,
    matchKeywords: ['trulicity 1.5', 'تروليسيتي ١٫٥', '#glp-1 agonist', '#anti-diabetic'],
    usage: 'دولاجلوتايد (GLP‑1) قلم حقن أسبوعي لضبط السكر.',
    timing: 'مرة أسبوعياً – مزمن',
    category: Category.DIABETES,
    form: 'Pen',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('1.5mg/0.5ml (4 pens) (حقنة) — مرة أسبوعياً — بدون اعتبار للأكل — مزمن.'),
    warnings: GLP1_WARNINGS,
  },

  // 255
  {
    id: 'vildaglip-50mg-30-tabs-dm5',
    name: 'vildaglip 50 mg 30 tabs.',
    genericName: 'vildagliptin',
    concentration: '50mg',
    price: 174,
    matchKeywords: ['vildaglip 50', 'فيلداجليب', '#anti-diabetic', '#dpp-4 inhibitors'],
    usage: 'فيلداجليبتين (DPP‑4) لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('50mg (قرص) — مرتين يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: DPP4_WARNINGS,
  },

  // 256
  {
    id: 'glyxambi-25-5mg-30-fc-tabs-dm5',
    name: 'glyxambi 25/5 mg 30 f.c. tabs.',
    genericName: 'linagliptin & empagliflozin',
    concentration: '25/5mg',
    price: 886,
    matchKeywords: ['glyxambi 25/5', 'جليكسامبي ٢٥', '#anti-diabetic', '#sglt2 inhibitor', '#dpp-4 inhibitors'],
    usage: 'إمباجليفلوزين + ليناجليبتين لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('25/5mg (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: mergeWarnings(SGLT2_WARNINGS, DPP4_WARNINGS),
  },

  // 257
  {
    id: 'gliptopack-12-5mg-30-tabs-dm5',
    name: 'gliptopack 12.5 mg 30 tabs.',
    genericName: 'alogliptin & metformin hydrochloride',
    concentration: '12.5mg + metformin',
    price: 163.5,
    matchKeywords: ['gliptopack 12.5', 'جليبتوباك', '#anti-diabetic', '#dpp-4 inhibitors', '#biguanide'],
    usage: 'ألوغليبتين + ميتفورمين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('12.5mg + metformin (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, DPP4_WARNINGS),
  },

  // 258
  {
    id: 'pharmabetic-100mg-30-fc-tab-dm5',
    name: 'pharmabetic 100 mg 30 f.c.tab.',
    genericName: 'sitagliptin',
    concentration: '100mg',
    price: 253,
    matchKeywords: ['pharmabetic 100', 'فارمابيتك ١٠٠', '#anti-diabetic', '#dpp-4 inhibitors'],
    usage: 'سيتاجليبتين (DPP‑4) لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('100mg (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: DPP4_WARNINGS,
  },
];

export const GLUCOSE_LOWERING_AGENTS_5: Medication[] = GLUCOSE_LOWERING_AGENTS_5_RAW.map(enhanceGlucoseLoweringMedication);

