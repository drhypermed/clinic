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

const INSULIN_COMBO_WARNINGS = [
  ...GENERAL_DIABETES_WARNINGS,
  'خطر هبوط السكر وارد؛ احمل مصدر سكر سريع وراقب السكر حسب الخطة.',
  'تعلم طريقة الحقن والتخزين الصحيحة (قلم/ثلاجة) من تعليمات العبوة أو الصيدلي.',
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

  // Mechanism/class tags (user requested)
  if (g.includes('metformin')) boost.push('#sensitizers', '#biguanide', 'biguanide');
  if (g.includes('gliclazide') || g.includes('glimepiride') || g.includes('glibenclamide') || g.includes('glyburide')) boost.push('#secretagogues', '#sulfonylurea', 'sulfonylurea');
  if (g.includes('dapagliflozin') || g.includes('empagliflozin')) boost.push('#sglt2 inhibitor', '#sglt2_inhibitor', 'sglt2 inhibitor');
  if (g.includes('sitagliptin') || g.includes('vildagliptin') || g.includes('linagliptin') || g.includes('alogliptin')) boost.push('#dpp-4 inhibitors', '#dpp_4_inhibitors', 'dpp-4 inhibitor', 'gliptin');
  if (g.includes('pioglitazone')) boost.push('#glitazone', 'thiazolidinedione', 'tzds');
  if (g.includes('repaglinide')) boost.push('#secretagogues', '#glinides', 'glinide', 'meglitinide');
  if (g.includes('semaglutide') || g.includes('tirzepatide') || g.includes('lixisenatide') || g.includes('liraglutide')) boost.push('#glp-1 agonist', '#glp1', 'glp-1', 'incretin');

  // Generics & common Arabic spellings / brand aliases
  if (g.includes('metformin')) boost.push('metformin', 'ميتفورمين', 'glucophage', 'جلوكوفاج', 'cidophage', 'سيدوفاج', 'maxophage', 'ماكسوفاج', 'glucolight', 'جلوكولايت');
  if (g.includes('gliclazide')) boost.push('gliclazide', 'جليكلازيد', 'diamicron', 'دياميكرون', 'diamedizen', 'دياميديزين');
  if (g.includes('glimepiride')) boost.push('glimepiride', 'جليميبرايد', 'amaryl', 'اماريل', 'dolcyl', 'دولسيل', 'glemax', 'جليماكس', 'glaryl', 'جلاريل', 'glimadel', 'جليمادل', 'diabenor', 'ديابنور', 'glimaryl', 'جليماريل');
  if (g.includes('glibenclamide') || g.includes('glyburide')) boost.push('glibenclamide', 'glyburide', 'جليبينكلاميد', 'جليبوريد', 'diavance', 'ديافانس', 'glimet', 'جليمت');
  if (g.includes('dapagliflozin')) boost.push('dapagliflozin', 'داباجليفلوزين', 'forflozin', 'فورفلوزين', 'forxiga', 'فورسيجا', 'dapablix', 'دابابليكس');
  if (g.includes('empagliflozin')) boost.push('empagliflozin', 'إمباجليفلوزين', 'jardiance', 'جارديانس', 'mellitofix', 'ميليتوفيكس', 'diacurimap', 'دياكوريماب', 'glimpacare', 'جليمباكير', 'glempozin', 'جليمبوزين', 'giflog', 'جيفلوج', 'glucoadjust', 'جلوكوادجست', 'glyxambi', 'جليكسامبي', 'empacyrl', 'امباسيرل', 'atcogliflozin', 'اتكوجليفلوزين');
  if (g.includes('pioglitazone')) boost.push('pioglitazone', 'بيوجليتازون', 'actos', 'اكتوس', 'diabetin', 'ديابتين', 'amaglust', 'اماجلوست');
  if (g.includes('vildagliptin')) boost.push('vildagliptin', 'فيلداجليبتين', 'gliptus', 'جليبتس', 'sugarlo', 'شوجارلو', 'vanvilda', 'فانفيلدا', 'vildabetes', 'فيلدابيتس', 'pharmavildamin', 'فارمافيلدامين');
  if (g.includes('sitagliptin')) boost.push('sitagliptin', 'سيتاجليبتين', 'januvia', 'جانوفيا', 'janaglip', 'جاناجليب', 'sitagliform', 'سيتاجليفورم', 'pharmabetic', 'فارمابيتك');
  if (g.includes('linagliptin')) boost.push('linagliptin', 'لينا جليبتين', 'trajenta', 'تراجنتا', 'prevaglip', 'بريفاجليب');
  if (g.includes('alogliptin')) boost.push('alogliptin', 'الوجليبتين', 'gliptopack', 'جليبتوباك', 'inhibamet', 'انهيباميت');
  if (g.includes('repaglinide')) boost.push('repaglinide', 'ريباكلينيد', 'novonorm', 'نوفونورم');
  if (g.includes('semaglutide')) boost.push('semaglutide', 'سيماجلوتايد', 'ozempic', 'اوزيمبيك', 'rybelsus', 'رايبلسوس');
  if (g.includes('tirzepatide')) boost.push('tirzepatide', 'تيرزيباتيد', 'mounjaro', 'مونجارو');
  if (g.includes('liraglutide')) boost.push('liraglutide', 'ليراجلوتايد', 'saxenda', 'ساكسندا');
  if (g.includes('insulin glargine')) boost.push('insulin glargine', 'جلارجين', 'glargine');
  if (g.includes('lixisenatide')) boost.push('lixisenatide', 'ليكسيزيناتيد');
  if (n.includes('soliqua')) boost.push('soliqua', 'سوليكوا');

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
// Glucose lowering agents (oral) - list 4
// =========================
const GLUCOSE_LOWERING_AGENTS_4_RAW: Medication[] = [
  // 171
  {
    id: 'giflog-25mg-30-tab-dm4',
    name: 'giflog 25 mg 30 tab',
    genericName: 'empagliflozin',
    concentration: '25mg',
    price: 183,
    matchKeywords: ['giflog 25', 'جيفلوج ٢٥', '#diabetes', '#sglt2 inhibitor'],
    usage: 'إمباجليفلوزين (SGLT2) لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('25mg (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: SGLT2_WARNINGS,
  },

  // 172
  {
    id: 'glucoadjust-12-5-500mg-30-fc-tabs-dm4',
    name: 'glucoadjust 12.5/500 mg 30 f.c. tabs.',
    genericName: 'empagliflozin & metformin hydrochloride',
    concentration: '12.5/500mg',
    price: 196.5,
    matchKeywords: ['glucoadjust 12.5/500', 'جلوكوادجست', '#anti-diabetic', '#sglt2 inhibitor', '#biguanide'],
    usage: 'إمباجليفلوزين + ميتفورمين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('12.5/500mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, SGLT2_WARNINGS),
  },

  // 173
  {
    id: 'glucoadjust-5-500mg-30-fc-tabs-dm4',
    name: 'glucoadjust 5/500 mg 30 f.c. tabs.',
    genericName: 'empagliflozin & metformin hydrochloride',
    concentration: '5/500mg',
    price: 118.5,
    matchKeywords: ['glucoadjust 5/500', 'جلوكوادجست ٥٠٠', '#anti-diabetic'],
    usage: 'إمباجليفلوزين + ميتفورمين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('5/500mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, SGLT2_WARNINGS),
  },

  // 174
  {
    id: 'vanvilda-50mg-30-tabs-dm4',
    name: 'vanvilda 50 mg 30 tabs.',
    genericName: 'vildagliptin',
    concentration: '50mg',
    price: 114,
    matchKeywords: ['vanvilda 50', 'فانفيلدا', '#anti-diabetic', '#dpp-4 inhibitors'],
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

  // 175
  {
    id: 'actos-30mg-30-tab-dm4',
    name: 'actos 30mg 30 tab.',
    genericName: 'pioglitazone',
    concentration: '30mg',
    price: 372,
    matchKeywords: ['actos 30', 'اكتوس', '#anti-diabetic', '#glitazone', '#sensitizers'],
    usage: 'بيوجليتازون لتحسين مقاومة الإنسولين (يُتجنب في قصور القلب).',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('30mg (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: PIOGLITAZONE_WARNINGS,
  },

  // 176
  {
    id: 'ozempic-0-25mg-pen-dm4',
    name: 'ozempic 0.25 mg pre-filled pen',
    genericName: 'semaglutide',
    concentration: '0.25mg (pen)',
    price: 4000,
    matchKeywords: ['ozempic 0.25', 'اوزيمبيك ٠٫٢٥', '#anti-diabetic', '#glp-1 agonist'],
    usage: 'سيماجلوتايد (GLP‑1) قلم حقن أسبوعي (جرعة بداية) لضبط السكر.',
    timing: 'مرة أسبوعياً – مزمن',
    category: Category.DIABETES,
    form: 'Pen',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('0.25mg (pen) (حقنة) — مرة أسبوعياً — بدون اعتبار للأكل — مزمن.'),
    warnings: GLP1_WARNINGS,
  },

  // 177
  {
    id: 'amaglust-2-30mg-30-scored-tab-dm4',
    name: 'amaglust 2/30 mg 30 scored tab',
    genericName: 'glimepiride & pioglitazone',
    concentration: '2/30mg',
    price: 93,
    matchKeywords: ['amaglust 2/30', 'اماجلوست', '#anti-diabetic', '#secretagogues', '#sensitizers'],
    usage: 'جليميبرايد + بيوجليتازون لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Scored Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('2/30mg (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: mergeWarnings(SULFONYLUREA_WARNINGS, PIOGLITAZONE_WARNINGS),
  },

  // 178
  {
    id: 'glimpacare-plus-10-5mg-30-fc-tabs-dm4',
    name: 'glimpacare plus 10/5 mg 30 f.c.tabs.',
    genericName: 'empagliflozin & linagliptin',
    concentration: '10/5mg',
    price: 273,
    matchKeywords: ['glimpacare plus 10/5', 'جليمباكير بلس', '#anti-diabetic', '#sglt2 inhibitor', '#dpp-4 inhibitors'],
    usage: 'إمباجليفلوزين + ليناجليبتين لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('10/5mg (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: mergeWarnings(SGLT2_WARNINGS, DPP4_WARNINGS),
  },

  // 179
  {
    id: 'pharmabetic-plus-50-1000mg-30-fc-tab-dm4',
    name: 'pharmabetic plus 50/1000 mg 30 f.c.tab.',
    genericName: 'sitagliptin & metformin hydrochloride',
    concentration: '50/1000mg',
    price: 157.5,
    matchKeywords: ['pharmabetic plus 50/1000', 'فارمابيتك بلس', '#anti-diabetic', '#dpp-4 inhibitors', '#biguanide'],
    usage: 'سيتاجليبتين + ميتفورمين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('50/1000mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, DPP4_WARNINGS),
  },

  // 180
  {
    id: 'cidophage-850mg-30-fc-tabs-dm4',
    name: 'cidophage 850mg 30 f.c. tabs',
    genericName: 'metformin hydrochloride',
    concentration: '850mg',
    price: 48,
    matchKeywords: ['cidophage 850', 'سيدوفاج ٨٥٠', '#anti-diabetic', '#biguanide'],
    usage: 'ميتفورمين لضبط السكر وتحسين مقاومة الإنسولين.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('850mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: METFORMIN_WARNINGS,
  },

  // 181
  {
    id: 'diabenor-3mg-30-tabs-dm4',
    name: 'diabenor 3 mg 30 tabs.',
    genericName: 'glimepiride',
    concentration: '3mg',
    price: 40.5,
    matchKeywords: ['diabenor 3', 'ديابنور ٣', '#anti-diabetic', '#sulfonylurea'],
    usage: 'جليميبرايد (سلفونيل يوريا) لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('3mg (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: SULFONYLUREA_WARNINGS,
  },

  // 182
  {
    id: 'diabetin-30mg-30-tabs-dm4',
    name: 'diabetin 30 mg 30 tabs.',
    genericName: 'pioglitazone',
    concentration: '30mg',
    price: 105,
    matchKeywords: ['diabetin 30 30', 'ديابتين', '#anti-diabetic', '#glitazone'],
    usage: 'بيوجليتازون لتحسين مقاومة الإنسولين.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('30mg (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: PIOGLITAZONE_WARNINGS,
  },

  // 183
  {
    id: 'diabetin-30mg-10-tab-dm4',
    name: 'diabetin 30 mg 10 tab.',
    genericName: 'pioglitazone',
    concentration: '30mg (10 tablets)',
    price: 35,
    matchKeywords: ['diabetin 30 10', 'ديابتين ١٠', '#anti-diabetic', '#glitazone'],
    usage: 'بيوجليتازون لتحسين مقاومة الإنسولين.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('30mg (10 tablets) (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: PIOGLITAZONE_WARNINGS,
  },

  // 184
  {
    id: 'diamedizen-30mg-mr-30-fc-tab-dm4',
    name: 'diamedizen 30mg mr 30 f.c.tab.',
    genericName: 'gliclazide',
    concentration: '30mg MR',
    price: 42,
    matchKeywords: ['diamedizen 30 mr', 'دياميديزين', '#anti-diabetic', '#sulfonylurea'],
    usage: 'جليكلازيد ممتد المفعول لضبط سكر النوع الثاني (سلفونيل يوريا).',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Prolonged Release Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('30mg MR (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: SULFONYLUREA_WARNINGS,
  },

  // 185
  {
    id: 'pharmabetic-plus-50-500mg-30-fc-tab-dm4',
    name: 'pharmabetic plus 50/500 mg 30 f.c.tab.',
    genericName: 'sitagliptin & metformin hydrochloride',
    concentration: '50/500mg',
    price: 157.5,
    matchKeywords: ['pharmabetic plus 50/500', 'فارمابيتك بلس ٥٠٠', '#anti-diabetic', '#dpp-4 inhibitors'],
    usage: 'سيتاجليبتين + ميتفورمين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('50/500mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, DPP4_WARNINGS),
  },

  // 186
  {
    id: 'gedimadel-2mg-30-tab-dm4',
    name: 'gedimadel 2mg 30 tab.',
    genericName: 'glimepiride',
    concentration: '2mg',
    price: 15.75,
    matchKeywords: ['gedimadel 2', 'جيديمادل', '#anti-diabetic', '#sulfonylurea'],
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

  // 187
  {
    id: 'westdiab-25-30-tabs-dm4',
    name: 'westdiab 25 tabs',
    genericName: 'empagliflozin',
    concentration: '25mg',
    price: 76.25,
    matchKeywords: ['westdiab', 'ويستدياب', '#anti-diabetic', '#sglt2 inhibitor'],
    usage: 'إمباجليفلوزين (SGLT2) لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('25mg (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: SGLT2_WARNINGS,
  },

  // 188
  {
    id: 'glaryl-1mg-30-tabs-dm4',
    name: 'glaryl 1mg 30 tabs.',
    genericName: 'glimepiride',
    concentration: '1mg',
    price: 33,
    matchKeywords: ['glaryl 1', 'جلاريل ١', '#anti-diabetic', '#sulfonylurea'],
    usage: 'جليميبرايد (سلفونيل يوريا) لضبط السكر.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('1mg (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: SULFONYLUREA_WARNINGS,
  },

  // 189
  {
    id: 'glaryl-3mg-30-tab-dm4',
    name: 'glaryl 3mg 30 tab.',
    genericName: 'glimepiride',
    concentration: '3mg',
    price: 42,
    matchKeywords: ['glaryl 3', 'جلاريل ٣', '#anti-diabetic', '#sulfonylurea'],
    usage: 'جليميبرايد لضبط السكر.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('3mg (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: SULFONYLUREA_WARNINGS,
  },

  // 190
  {
    id: 'glimadel-2mg-30-fc-tab-dm4',
    name: 'glimadel 2mg 30 f.c.tab.',
    genericName: 'glimepiride',
    concentration: '2mg',
    price: 20.25,
    matchKeywords: ['glimadel 2', 'جليمادل ٢', '#anti-diabetic', '#sulfonylurea'],
    usage: 'جليميبرايد لضبط السكر.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('2mg (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: SULFONYLUREA_WARNINGS,
  },

  // 191
  {
    id: 'glimadel-3mg-30-fc-tab-dm4',
    name: 'glimadel 3mg 30 f.c.tab.',
    genericName: 'glimepiride',
    concentration: '3mg',
    price: 45,
    matchKeywords: ['glimadel 3', 'جليمادل ٣', '#anti-diabetic', '#sulfonylurea'],
    usage: 'جليميبرايد لضبط السكر.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('3mg (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: SULFONYLUREA_WARNINGS,
  },

  // 192
  {
    id: 'glimadel-4mg-30-fc-tabs-dm4',
    name: 'glimadel 4mg 30 f.c. tab.',
    genericName: 'glimepiride',
    concentration: '4mg',
    price: 51,
    matchKeywords: ['glimadel 4', 'جليمادل ٤', '#anti-diabetic', '#sulfonylurea'],
    usage: 'جليميبرايد لضبط السكر.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('4mg (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: SULFONYLUREA_WARNINGS,
  },

  // 193
  {
    id: 'glucolight-xr-1000mg-30-pr-fc-tab-dm4',
    name: 'glucolight xr 1000mg 30 ex. rel .f.c. tab.',
    genericName: 'metformin hydrochloride',
    concentration: '1000mg XR',
    price: 54,
    matchKeywords: ['glucolight xr 1000', 'جلوكولايت اكس ار', '#anti-diabetic', '#biguanide'],
    usage: 'ميتفورمين ممتد المفعول لضبط السكر.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Prolonged Release Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('1000mg XR (قرص) — مرة يومياً — مع/بعد الأكل — مزمن.'),
    warnings: METFORMIN_WARNINGS,
  },

  // 194
  {
    id: 'glucolight-xr-500mg-30-pr-fc-tab-dm4',
    name: 'glucolight xr 500mg 30 f.c.tab.',
    genericName: 'metformin',
    concentration: '500mg XR',
    price: 24,
    matchKeywords: ['glucolight xr 500', 'جلوكولايت ٥٠٠', '#anti-diabetic', '#biguanide'],
    usage: 'ميتفورمين ممتد المفعول لضبط السكر.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Prolonged Release Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('500mg XR (قرص) — مرة يومياً — مع/بعد الأكل — مزمن.'),
    warnings: METFORMIN_WARNINGS,
  },

  // 195
  {
    id: 'pharmavildamin-50-1000mg-30-tab-dm4',
    name: 'pharmavildamin 50/1000mg 30 tab',
    genericName: 'vildagliptin & metformin hydrochloride',
    concentration: '50/1000mg',
    price: 192,
    matchKeywords: ['pharmavildamin 50/1000', 'فارمافيلدامين', '#anti-diabetic', '#dpp-4 inhibitors'],
    usage: 'فيلداجليبتين + ميتفورمين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('50/1000mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, DPP4_WARNINGS),
  },

  // 196
  {
    id: 'rybelsus-7mg-10-tabs-dm4',
    name: 'rybelsus 7mg 10 tabs',
    genericName: 'semaglutide',
    concentration: '7mg (10 tablets)',
    price: 1575,
    matchKeywords: ['rybelsus 7 10', 'رايبلسوس ٧', '#anti-diabetic', '#glp-1 agonist'],
    usage: 'سيماجلوتايد فموي (GLP‑1) لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('7mg (10 tablets) (قرص) — مرة يومياً — على معدة فارغة — مزمن.'),
    warnings: GLP1_WARNINGS,
  },

  // 197
  {
    id: 'novonorm-0-5mg-30-tab-dm4',
    name: 'novonorm 0.5mg 30 tab',
    genericName: 'repaglinide',
    concentration: '0.5mg',
    price: 66,
    matchKeywords: ['novonorm 0.5', 'نوفونورم', '#anti-diabetic', '#glinides'],
    usage: 'ريباكلينيد (Glinide) لضبط سكر النوع الثاني خصوصاً بعد الوجبات.',
    timing: 'حسب التعليمات – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('0.5mg (قرص) — حسب التعليمات — قبل الأكل — مزمن.'),
    warnings: GLINIDE_WARNINGS,
  },

  // 198
  {
    id: 'novonorm-2mg-30-tab-dm4',
    name: 'novonorm 2mg 30 tab',
    genericName: 'repaglinide',
    concentration: '2mg',
    price: 92,
    matchKeywords: ['novonorm 2', 'نوفونورم ٢', '#anti-diabetic', '#glinides'],
    usage: 'ريباكلينيد (Glinide) لضبط سكر النوع الثاني.',
    timing: 'حسب التعليمات – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('2mg (قرص) — حسب التعليمات — قبل الأكل — مزمن.'),
    warnings: GLINIDE_WARNINGS,
  },

  // 199
  {
    id: 'rybelsus-7mg-30-tabs-dm4',
    name: 'rybelsus 7mg 30 tabs',
    genericName: 'semaglutide',
    concentration: '7mg',
    price: 3150,
    matchKeywords: ['rybelsus 7 30', 'رايبلسوس ٧', '#anti-diabetic', '#glp-1 agonist'],
    usage: 'سيماجلوتايد فموي (GLP‑1) لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('7mg (قرص) — مرة يومياً — على معدة فارغة — مزمن.'),
    warnings: GLP1_WARNINGS,
  },

  // 200
  {
    id: 'saxenda-18mg-3ml-1-pen-sc-dm4',
    name: 'saxenda 18mg/3ml 1 prefilled pen s.c.',
    genericName: 'liraglutide',
    concentration: '18mg/3ml (1 pen)',
    price: 1970,
    matchKeywords: ['saxenda 1 pen', 'ساكسندا', '#anti-diabetic', '#glp-1 agonist'],
    usage: 'ليراجلوتايد (GLP‑1) قلم حقن يومي (غالباً لإنقاص الوزن/مقاومة الإنسولين حسب التشخيص والحالة).',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Pen',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('18mg/3ml (1 pen) (حقنة) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: GLP1_WARNINGS,
  },

  // 201
  {
    id: 'saxenda-18mg-3ml-3-pen-sc-dm4',
    name: 'saxenda 18mg/3ml 3 pre-filled pen s.c.',
    genericName: 'liraglutide',
    concentration: '18mg/3ml (3 pens)',
    price: 5910,
    matchKeywords: ['saxenda 3 pen', 'ساكسندا ٣', '#anti-diabetic', '#glp-1 agonist'],
    usage: 'ليراجلوتايد (GLP‑1) قلم حقن يومي حسب التشخيص والحالة.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Pen',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('18mg/3ml (3 pens) (حقنة) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: GLP1_WARNINGS,
  },

  // 202
  {
    id: 'metformin-eva-xr-1000mg-30-tabs-dm4',
    name: 'metformin-eva xr 1000 mg 30 tabs.',
    genericName: 'metformin hydrochloride',
    concentration: '1000mg XR',
    price: 70.5,
    matchKeywords: ['metformin-eva xr 1000', 'ميتفورمين ايفا ١٠٠٠', '#anti-diabetic', '#biguanide'],
    usage: 'ميتفورمين ممتد المفعول لضبط السكر.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Prolonged Release Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('1000mg XR (قرص) — مرة يومياً — مع/بعد الأكل — مزمن.'),
    warnings: METFORMIN_WARNINGS,
  },

  // 203
  {
    id: 'ozempic-0-5mg-pen-dm4',
    name: 'ozempic 0.5mg prefilled pen',
    genericName: 'semaglutide',
    concentration: '0.5mg (pen)',
    price: 4000,
    matchKeywords: ['ozempic 0.5', 'اوزيمبيك ٠٫٥', '#anti-diabetic', '#glp-1 agonist'],
    usage: 'سيماجلوتايد (GLP‑1) قلم حقن أسبوعي لضبط السكر.',
    timing: 'مرة أسبوعياً – مزمن',
    category: Category.DIABETES,
    form: 'Pen',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('0.5mg (pen) (حقنة) — مرة أسبوعياً — بدون اعتبار للأكل — مزمن.'),
    warnings: GLP1_WARNINGS,
  },

  // 204
  {
    id: 'dapablix-5mg-30-fc-tab-dm4',
    name: 'dapablix 5mg 30 f.c. tab',
    genericName: 'dapagliflozin',
    concentration: '5mg',
    price: 117,
    matchKeywords: ['dapablix 5', 'دابابليكس ٥', '#anti-diabetic', '#sglt2 inhibitor'],
    usage: 'داباجليفلوزين (SGLT2) لضبط السكر.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('5mg (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: SGLT2_WARNINGS,
  },

  // 205
  {
    id: 'atcogliflozin-10mg-30-fc-tabs-dm4',
    name: 'atcogliflozin 10 mg 30 f.c.tabs.',
    genericName: 'empagliflozin',
    concentration: '10mg',
    price: 180,
    matchKeywords: ['atcogliflozin 10', 'اتكوجليفلوزين ١٠', '#anti-diabetic', '#sglt2 inhibitor'],
    usage: 'إمباجليفلوزين (SGLT2) لضبط السكر.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('10mg (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: SGLT2_WARNINGS,
  },

  // 206
  {
    id: 'empaglutech-25mg-30-tabs-dm4',
    name: 'empaglutech 25mg 30 tabs',
    genericName: 'empagliflozin',
    concentration: '25mg',
    price: 231,
    matchKeywords: ['empaglutech 25', 'امباجلوتيك', '#anti-diabetic', '#sglt2 inhibitor'],
    usage: 'إمباجليفلوزين (SGLT2) لضبط السكر.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('25mg (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: SGLT2_WARNINGS,
  },

  // 207
  {
    id: 'dapaveldactin-5mg-28-fc-tabs-dm4',
    name: 'dapaveldactin 5 mg 28 f.c. tabs.',
    genericName: 'dapagliflozin',
    concentration: '5mg (28 tablets)',
    price: 268,
    matchKeywords: ['dapaveldactin 5', 'دابافيلداكتين ٥', '#anti-diabetic', '#sglt2 inhibitor'],
    usage: 'داباجليفلوزين (SGLT2) لضبط السكر.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('5mg (28 tablets) (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: SGLT2_WARNINGS,
  },

  // 208
  {
    id: 'diavance-2-5-500mg-30-fc-tab-dm4',
    name: 'diavance 2.5/500mg 30 f.c.tab.',
    genericName: 'metformin hydrochloride & glibenclamide (glyburide)',
    concentration: '2.5/500mg',
    price: 39,
    matchKeywords: ['diavance 2.5/500', 'ديافانس', '#anti-diabetic', '#sulfonylurea', '#biguanide'],
    usage: 'ميتفورمين + جليبينكلاميد لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('2.5/500mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, SULFONYLUREA_WARNINGS),
  },

  // 209
  {
    id: 'empacyrl-10-5mg-30-fc-tabs-dm4',
    name: 'empacyrl 10/5 mg 30 f.c. tabs.',
    genericName: 'empagliflozin & linagliptin',
    concentration: '10/5mg',
    price: 354,
    matchKeywords: ['empacyrl 10/5', 'امباسيرل', '#anti-diabetic', '#sglt2 inhibitor', '#dpp-4 inhibitors'],
    usage: 'إمباجليفلوزين + ليناجليبتين لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('10/5mg (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: mergeWarnings(SGLT2_WARNINGS, DPP4_WARNINGS),
  },

  // 210
  {
    id: 'empacyrl-25-5mg-30-fc-tabs-dm4',
    name: 'empacyrl 25/5 mg 30 f.c. tabs.',
    genericName: 'empagliflozin & linagliptin',
    concentration: '25/5mg',
    price: 354,
    matchKeywords: ['empacyrl 25/5', 'امباسيرل ٢٥', '#anti-diabetic', '#sglt2 inhibitor', '#dpp-4 inhibitors'],
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

  // 211
  {
    id: 'mounjaro-12-5mg-0-5ml-4-pen-dm4',
    name: 'mounjaro injection 12.5mg/0.5ml 4 single dose pens',
    genericName: 'tirzepatide',
    concentration: '12.5mg/0.5ml (4 pens)',
    price: 18150,
    matchKeywords: ['mounjaro 12.5', 'مونجارو ١٢٫٥', '#anti-diabetic', '#glp-1 agonist'],
    usage: 'تيرزيباتيد (GIP/GLP‑1) لضبط السكر حسب التشخيص والحالة.',
    timing: 'مرة أسبوعياً – مزمن',
    category: Category.DIABETES,
    form: 'Pen',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('12.5mg/0.5ml (4 pens) (حقنة) — مرة أسبوعياً — بدون اعتبار للأكل — مزمن.'),
    warnings: GLP1_WARNINGS,
  },

  // 212
  {
    id: 'forxiga-5mg-28-tabs-dm4',
    name: 'forxiga 5mg 28 tabs.',
    genericName: 'dapagliflozin',
    concentration: '5mg',
    price: 602,
    matchKeywords: ['forxiga 5', 'فورسيجا ٥', '#anti-diabetic', '#sglt2 inhibitor'],
    usage: 'داباجليفلوزين (SGLT2) لضبط السكر وقد يفيد القلب/الكُلى حسب الحالة.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('5mg (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: SGLT2_WARNINGS,
  },

  // 213
  {
    id: 'gedimadel-3mg-30-tab-dm4',
    name: 'gedimadel 3mg 30 tab.',
    genericName: 'glimepiride',
    concentration: '3mg',
    price: 27,
    matchKeywords: ['gedimadel 3', 'جيديمادل ٣', '#anti-diabetic', '#sulfonylurea'],
    usage: 'جليميبرايد لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('3mg (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: SULFONYLUREA_WARNINGS,
  },

  // 214
  {
    id: 'glimaryl-3mg-30-tab-dm4',
    name: 'glimaryl 3mg 30 tab.',
    genericName: 'glimepiride',
    concentration: '3mg',
    price: 24,
    matchKeywords: ['glimaryl 3', 'جليماريل', '#anti-diabetic', '#sulfonylurea'],
    usage: 'جليميبرايد لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('3mg (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: SULFONYLUREA_WARNINGS,
  },

  // 215
  {
    id: 'gliptalina-2-5-500mg-30-fc-tabs-dm4',
    name: 'gliptalina 2.5/500mg 30 f.c. tabs.',
    genericName: 'metformin hydrochloride & linagliptin',
    concentration: '2.5/500mg',
    price: 147,
    matchKeywords: ['gliptalina 2.5/500', 'جليبتالينا ٥٠٠', '#anti-diabetic', '#dpp-4 inhibitors'],
    usage: 'ميتفورمين + ليناجليبتين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('2.5/500mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, DPP4_WARNINGS),
  },

  // 216
  {
    id: 'gliptalina-2-5-850mg-30-fc-tabs-dm4',
    name: 'gliptalina 2.5/850mg 30 f.c. tabs.',
    genericName: 'metformin hydrochloride & linagliptin',
    concentration: '2.5/850mg',
    price: 120.75,
    matchKeywords: ['gliptalina 2.5/850', 'جليبتالينا ٨٥٠', '#anti-diabetic', '#dpp-4 inhibitors'],
    usage: 'ميتفورمين + ليناجليبتين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('2.5/850mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, DPP4_WARNINGS),
  },

  // 217
  {
    id: 'inhibamet-12-5-1000mg-30-fc-tabs-dm4',
    name: 'inhibamet 12.5/1000 mg 30 f.c. tabs.',
    genericName: 'alogliptin & metformin hydrochloride',
    concentration: '12.5/1000mg',
    price: 174,
    matchKeywords: ['inhibamet 12.5/1000', 'انهيباميت', '#anti-diabetic', '#dpp-4 inhibitors'],
    usage: 'ألوغليبتين + ميتفورمين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('12.5/1000mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, DPP4_WARNINGS),
  },

  // 218
  {
    id: 'inhibamet-12-5-500mg-30-fc-tabs-dm4',
    name: 'inhibamet 12.5/500 mg 30 f.c. tabs.',
    genericName: 'alogliptin & metformin hydrochloride',
    concentration: '12.5/500mg',
    price: 120,
    matchKeywords: ['inhibamet 12.5/500', 'انهيباميت ٥٠٠', '#anti-diabetic', '#dpp-4 inhibitors'],
    usage: 'ألوغليبتين + ميتفورمين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('12.5/500mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, DPP4_WARNINGS),
  },

  // 219
  {
    id: 'janaglip-50mg-28-fc-tabs-dm4',
    name: 'janaglip 50 mg 28 f.c. tabs.',
    genericName: 'sitagliptin',
    concentration: '50mg (28 tablets)',
    price: 162,
    matchKeywords: ['janaglip 50', 'جاناجليب ٥٠', '#anti-diabetic', '#dpp-4 inhibitors'],
    usage: 'سيتاجليبتين (DPP‑4) لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('50mg (28 tablets) (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: DPP4_WARNINGS,
  },

  // 220
  {
    id: 'atcogliflozin-25mg-30-fc-tabs-dm4',
    name: 'atcogliflozin 25 mg 30 f.c.tabs.',
    genericName: 'empagliflozin',
    concentration: '25mg',
    price: 180,
    matchKeywords: ['atcogliflozin 25', 'اتكوجليفلوزين ٢٥', '#anti-diabetic', '#sglt2 inhibitor'],
    usage: 'إمباجليفلوزين (SGLT2) لضبط السكر.',
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

  // 221
  {
    id: 'prevaglip-5mg-30-tabs-dm4',
    name: 'prevaglip 5mg 30 tabs.',
    genericName: 'linagliptin',
    concentration: '5mg',
    price: 270,
    matchKeywords: ['prevaglip 5', 'بريفاجليب', '#anti-diabetic', '#dpp-4 inhibitors'],
    usage: 'ليناجليبتين (DPP‑4) لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('5mg (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: DPP4_WARNINGS,
  },

  // 222
  {
    id: 'empagliform-xr-10-1000mg-30-fc-tabs-dm4',
    name: 'empagliform xr 10/1000 mg 30 f.c. tabs.',
    genericName: 'metformin hydrochloride & empagliflozin',
    concentration: '10/1000mg XR',
    price: 312,
    matchKeywords: ['empagliform xr 10/1000', 'امباجليفورم اكس ار', '#anti-diabetic', '#sglt2 inhibitor'],
    usage: 'إمباجليفلوزين + ميتفورمين ممتد المفعول لضبط السكر.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Prolonged Release Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('10/1000mg XR (قرص) — مرة يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, SGLT2_WARNINGS),
  },

  // 223
  {
    id: 'empagliform-xr-25-1000mg-30-fc-tabs-dm4',
    name: 'empagliform xr 25/1000 mg 30 f.c. tabs.',
    genericName: 'empagliflozin & metformin hydrochloride',
    concentration: '25/1000mg XR',
    price: 405,
    matchKeywords: ['empagliform xr 25/1000', 'امباجليفورم اكس ار ٢٥', '#anti-diabetic', '#sglt2 inhibitor'],
    usage: 'إمباجليفلوزين + ميتفورمين ممتد المفعول لضبط السكر.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Prolonged Release Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('25/1000mg XR (قرص) — مرة يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, SGLT2_WARNINGS),
  },

  // 224
  {
    id: 'glempozin-10mg-30-fc-tabs-dm4',
    name: 'glempozin 10 mg 30 f.c. tabs.',
    genericName: 'empagliflozin',
    concentration: '10mg',
    price: 240,
    matchKeywords: ['glempozin 10', 'جليمبوزين ١٠', '#anti-diabetic', '#sglt2 inhibitor'],
    usage: 'إمباجليفلوزين (SGLT2) لضبط السكر.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('10mg (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: SGLT2_WARNINGS,
  },

  // 225
  {
    id: 'glimpacare-plus-25-5mg-30-fc-tabs-dm4',
    name: 'glimpacare plus 25/5 mg 30 f.c.tabs.',
    genericName: 'empagliflozin & linagliptin',
    concentration: '25/5mg',
    price: 349.5,
    matchKeywords: ['glimpacare plus 25/5', 'جليمباكير بلس ٢٥', '#anti-diabetic', '#sglt2 inhibitor', '#dpp-4 inhibitors'],
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

  // 226
  {
    id: 'glyxambi-10-5mg-30-fc-tabs-dm4',
    name: 'glyxambi 10/5 mg 30 f.c. tabs.',
    genericName: 'empagliflozin & linagliptin',
    concentration: '10/5mg',
    price: 886,
    matchKeywords: ['glyxambi 10/5', 'جليكسامبي', '#anti-diabetic', '#sglt2 inhibitor', '#dpp-4 inhibitors'],
    usage: 'إمباجليفلوزين + ليناجليبتين لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('10/5mg (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: mergeWarnings(SGLT2_WARNINGS, DPP4_WARNINGS),
  },

  // 227
  {
    id: 'andoflozin-xr-12-5-1000mg-20-fc-tabs-dm4',
    name: 'andoflozin xr 12.5/1000 mg 20 f.c. tabs.',
    genericName: 'empagliflozin & metformin hydrochloride',
    concentration: '12.5/1000mg XR (20 tablets)',
    price: 199,
    matchKeywords: ['andoflozin xr 12.5/1000', 'اندوفلوزين', '#anti-diabetic', '#sglt2 inhibitor'],
    usage: 'إمباجليفلوزين + ميتفورمين ممتد المفعول لضبط السكر.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Prolonged Release Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('12.5/1000mg XR (20 tablets) (قرص) — مرة يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, SGLT2_WARNINGS),
  },

  // 228
  {
    id: 'vildabetes-50-1000mg-30-tabs-dm4',
    name: 'vildabetes 50/1000mg 30 tabs.',
    genericName: 'metformin hydrochloride & vildagliptin',
    concentration: '50/1000mg',
    price: 186,
    matchKeywords: ['vildabetes 50/1000', 'فيلدابيتس', '#anti-diabetic', '#dpp-4 inhibitors'],
    usage: 'ميتفورمين + فيلداجليبتين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('50/1000mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, DPP4_WARNINGS),
  },

  // 229
  {
    id: 'xigduo-5-1000mg-56-fc-tabs-dm4',
    name: 'xigduo 5/1000 mg 56 f.c.tabs',
    genericName: 'dapagliflozin & metformin hydrochloride',
    concentration: '5/1000mg (56 tablets)',
    price: 653,
    matchKeywords: ['xigduo 5/1000', 'اكسيجدو', '#anti-diabetic', '#sglt2 inhibitor'],
    usage: 'داباجليفلوزين + ميتفورمين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('5/1000mg (56 tablets) (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, SGLT2_WARNINGS),
  },

  // 230
  {
    id: 'gliptopack-met-12-5-1000mg-30-tabs-dm4',
    name: 'gliptopack met 12.5/1000 mg 30 tabs.',
    genericName: 'alogliptin & metformin hydrochloride',
    concentration: '12.5/1000mg',
    price: 162,
    matchKeywords: ['gliptopack met 12.5/1000', 'جليبتوباك', '#anti-diabetic', '#dpp-4 inhibitors'],
    usage: 'ألوغليبتين + ميتفورمين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('12.5/1000mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, DPP4_WARNINGS),
  },

  // 231
  {
    id: 'gliptopack-met-12-5-500mg-30-tabs-dm4',
    name: 'gliptopack met 12.5/500 mg 30 tabs.',
    genericName: 'alogliptin & metformin hydrochloride',
    concentration: '12.5/500mg',
    price: 163.5,
    matchKeywords: ['gliptopack met 12.5/500', 'جليبتوباك ٥٠٠', '#anti-diabetic', '#dpp-4 inhibitors'],
    usage: 'ألوغليبتين + ميتفورمين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('12.5/500mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, DPP4_WARNINGS),
  },
];

export const GLUCOSE_LOWERING_AGENTS_4: Medication[] = GLUCOSE_LOWERING_AGENTS_4_RAW.map(enhanceGlucoseLoweringMedication);

