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
  'التزم بالنظام الغذائي والرياضة وقياس السكر حسب الحالة وقراءات السكر.',
  'إذا حدث دوخة شديدة/تعرق/رعشة/جوع شديد: قد يكون هبوط سكر—قِس السكر وخذ مصدر سكر سريع، ثم أعد التقييم إذا تكرر.',
  'راجع تداخلات المريض (خصوصاً الكُلى/الضغط/الكورتيزون).',
];

const METFORMIN_WARNINGS = [
  ...GENERAL_DIABETES_WARNINGS,
  'قد يسبب اضطراب معدة/غثيان/إسهال خصوصاً في البداية؛ ابدأ تدريجياً وخذه مع/بعد الأكل.',
  'يُوقف مؤقتاً قبل الأشعة بالصبغة (حسب التشخيص والحالة) ويُعاد بعد التأكد من سلامة وظائف الكُلى.',
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
  'إذا لديك قيء/إسهال شديد أو صيام طويل أو قبل عملية جراحية: اسأل الطبيب عن إيقافه مؤقتاً (لتقليل خطر الحماض الكيتوني).',
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
  'أوقف الدواء وأعد التقييم إذا حدث ألم بطن شديد مستمر (اشتباه التهاب بنكرياس).',
  'لا تُستخدم بعض أدوية GLP‑1 في الحمل؛ أعدي التقييم إذا تخططين للحمل.',
];

const INSULIN_COMBO_WARNINGS = [
  ...GENERAL_DIABETES_WARNINGS,
  'خطر هبوط السكر وارد؛ احمل مصدر سكر سريع وراقب السكر حسب الخطة.',
  'تعلم طريقة الحقن والتخزين الصحيحة (قلم/ثلاجة) من الطبيب/الصيدلي.',
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
  if (g.includes('gliclazide') || g.includes('glimepiride') || g.includes('glibenclamide')) boost.push('#secretagogues', '#sulfonylurea', 'sulfonylurea');
  if (g.includes('dapagliflozin') || g.includes('empagliflozin')) boost.push('#sglt2 inhibitor', '#sglt2_inhibitor', 'sglt2 inhibitor');
  if (g.includes('sitagliptin') || g.includes('vildagliptin') || g.includes('linagliptin')) boost.push('#dpp-4 inhibitors', '#dpp_4_inhibitors', 'dpp-4 inhibitor', 'gliptin');
  if (g.includes('pioglitazone')) boost.push('#glitazone', 'thiazolidinedione', 'tzds');
  if (g.includes('repaglinide')) boost.push('#secretagogues', '#glinides', 'glinide', 'meglitinide');
  if (g.includes('semaglutide') || g.includes('tirzepatide') || g.includes('lixisenatide')) boost.push('#glp-1 agonist', '#glp1', 'glp-1', 'incretin');

  // Generics & common Arabic spellings / brand aliases
  if (g.includes('metformin')) boost.push('metformin', 'ميتفورمين', 'glucophage', 'جلوكوفاج', 'cidophage', 'سيدوفاج', 'maxophage', 'ماكسوفاج');
  if (g.includes('glimepiride')) boost.push('glimepiride', 'جليميبرايد', 'amaryl', 'اماريل', 'dolcyl', 'دولسيل', 'glemax', 'جليماكس', 'glaryl', 'جلاريل');
  if (g.includes('dapagliflozin')) boost.push('dapagliflozin', 'داباجليفلوزين', 'forflozin', 'فورفلوزين', 'forxiga', 'فورسيجا', 'dexiglofozin', 'ديكسيجلوفوزين', 'dapaglif', 'داباجليف');
  if (g.includes('empagliflozin')) boost.push('empagliflozin', 'إمباجليفلوزين', 'jardiance', 'جارديانس', 'faglozino', 'فاجلوزينو', 'mellitofix', 'ميليتوفيكس', 'diacurimap', 'دياكوريماب', 'glimpacare', 'جليمباكير', 'glempozin', 'جليمبوزين', 'giflog', 'جيفلوج');
  if (g.includes('pioglitazone')) boost.push('pioglitazone', 'بيوجليتازون', 'hi-glitazone', 'هاي جليتازون', 'bioglita', 'بيوجليتا');
  if (g.includes('vildagliptin')) boost.push('vildagliptin', 'فيلداجليبتين', 'gliptus', 'جليبتس', 'sugarlo', 'شوجارلو');
  if (g.includes('sitagliptin')) boost.push('sitagliptin', 'سيتاجليبتين', 'januvia', 'جانوفيا', 'janaglip', 'جاناجليب', 'sitagliform', 'سيتاجليفورم');
  if (g.includes('linagliptin')) boost.push('linagliptin', 'لينا جليبتين', 'trajenta', 'تراجنتا');
  if (g.includes('repaglinide')) boost.push('repaglinide', 'ريباكلينيد', 'replitza', 'ريبليتزا');
  if (g.includes('semaglutide')) boost.push('semaglutide', 'سيماجلوتايد', 'ozempic', 'اوزيمبيك', 'rybelsus', 'رايبلسوس');
  if (g.includes('tirzepatide')) boost.push('tirzepatide', 'تيرزيباتيد', 'mounjaro', 'مونجارو');
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
// Glucose lowering agents (oral) - list 3
// =========================
const GLUCOSE_LOWERING_AGENTS_3_RAW: Medication[] = [
  // 114
  {
    id: 'glaryl-4mg-30-tab-dm3',
    name: 'glaryl 4mg 30 tab',
    genericName: 'glimepiride',
    concentration: '4mg',
    price: 45,
    matchKeywords: ['glaryl 4', 'جلاريل', '#anti-diabetic', '#secretagogues', '#sulfonylurea'],
    usage: 'جليميبرايد (سلفونيل يوريا) لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('4mg (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: SULFONYLUREA_WARNINGS,
  },

  // 115
  {
    id: 'hi-glitazone-30mg-30-tab-dm3',
    name: 'hi-glitazone 30mg 30 tab.',
    genericName: 'pioglitazone',
    concentration: '30mg',
    price: 99,
    matchKeywords: ['hi-glitazone 30', 'هاي جليتازون', '#anti-diabetic', '#sensitizers', '#glitazone'],
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

  // 116
  {
    id: 'giflog-10mg-30-tab-dm3',
    name: 'giflog 10mg 30 tab',
    genericName: 'empagliflozin',
    concentration: '10mg',
    price: 183,
    matchKeywords: ['giflog 10', 'جيفلوج', '#diabetes', '#sglt2 inhibitor'],
    usage: 'إمباجليفلوزين (SGLT2) لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('10mg (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: SGLT2_WARNINGS,
  },

  // 117
  {
    id: 'mounjaro-5mg-0-5ml-4-pen-dm3',
    name: 'mounjaro injection 5mg/0.5ml 4 single dose pens',
    genericName: 'tirzepatide',
    concentration: '5mg/0.5ml (4 pens)',
    price: 12250,
    matchKeywords: ['mounjaro 5', 'مونجارو ٥', '#anti-diabetic', '#glp-1 agonist'],
    usage: 'تيرزيباتيد (GIP/GLP‑1) لضبط سكر النوع الثاني وإنقاص الوزن حسب التشخيص والحالة.',
    timing: 'مرة أسبوعياً – مزمن',
    category: Category.DIABETES,
    form: 'Pen',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('5mg/0.5ml (4 pens) (حقنة) — مرة أسبوعياً — بدون اعتبار للأكل — مزمن.'),
    warnings: GLP1_WARNINGS,
  },

  // 118
  {
    id: 'dexiglofozin-5mg-30-tabs-dm3',
    name: 'dexiglofozin 5mg 30 tabs',
    genericName: 'dapagliflozin',
    concentration: '5mg',
    price: 102,
    matchKeywords: ['dexiglofozin 5', 'ديكسيجلوفوزين', '#anti-diabetic', '#secretagogues', '#sglt2 inhibitor'],
    usage: 'داباجليفلوزين (SGLT2) لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('5mg (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: SGLT2_WARNINGS,
  },

  // 119
  {
    id: 'dapagliflozin-eva-10mg-30-fc-tabs-dm3',
    name: 'dapagliflozin-eva 10 mg 30 f.c. tabs.',
    genericName: 'dapagliflozin',
    concentration: '10mg',
    price: 271.5,
    matchKeywords: ['dapagliflozin-eva 10', 'داباجليفلوزين ايفا', '#anti-diabetic', '#secretagogues', '#sglt2 inhibitor'],
    usage: 'داباجليفلوزين (SGLT2) لضبط سكر النوع الثاني.',
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

  // 120
  {
    id: 'metformin-eva-xr-500mg-30-tabs-dm3',
    name: 'metformin-eva xr 500 mg 30 tabs.',
    genericName: 'metformin hydrochloride',
    concentration: '500mg XR',
    price: 48,
    matchKeywords: ['metformin-eva xr 500', 'ميتفورمين ايفا اكس ار', '#anti-diabetic', '#sensitizers', '#biguanide'],
    usage: 'ميتفورمين ممتد المفعول لتحسين مقاومة الإنسولين وضبط السكر.',
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

  // 121
  {
    id: 'dapaglif-plus-xr-10-1000mg-14-fc-tabs-dm3',
    name: 'dapaglif plus xr 10mg/1000mg 14 f.c. tabs.',
    genericName: 'dapagliflozin & metformin hydrochloride',
    concentration: '10/1000mg XR',
    price: 180,
    matchKeywords: ['dapaglif plus xr', 'داباجليف بلس', '#anti-diabetic', '#sglt2 inhibitor', '#biguanide'],
    usage: 'داباجليفلوزين + ميتفورمين ممتد المفعول لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('10/1000mg XR (قرص) — مرة يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, SGLT2_WARNINGS),
  },

  // 122
  {
    id: 'dexiglofozin-10mg-30-tabs-dm3',
    name: 'dexiglofozin 10mg 30 tabs',
    genericName: 'dapagliflozin',
    concentration: '10mg',
    price: 195,
    matchKeywords: ['dexiglofozin 10', 'ديكسيجلوفوزين ١٠', '#anti-diabetic', '#secretagogues', '#sglt2 inhibitor'],
    usage: 'داباجليفلوزين (SGLT2) لضبط سكر النوع الثاني.',
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

  // 123
  {
    id: 'rybelsus-14mg-30-tabs-dm3',
    name: 'rybelsus 14 mg 30 tabs.',
    genericName: 'semaglutide',
    concentration: '14mg',
    price: 3150,
    matchKeywords: ['rybelsus 14', 'رايبلسوس ١٤', '#anti-diabetic', '#glp-1 agonist'],
    usage: 'سيماجلوتايد فموي (GLP‑1) لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('14mg (قرص) — مرة يومياً — على معدة فارغة — مزمن.'),
    warnings: GLP1_WARNINGS,
  },

  // 124
  {
    id: 'forflozin-5mg-30-fc-tabs-dm3',
    name: 'forflozin 5 mg 30 f.c.tabs',
    genericName: 'dapagliflozin',
    concentration: '5mg',
    price: 153,
    matchKeywords: ['forflozin 5', 'فورفلوزين ٥', '#anti-diabetic', '#secretagogues', '#sglt2 inhibitor'],
    usage: 'داباجليفلوزين (SGLT2) لضبط سكر النوع الثاني.',
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

  // 125
  {
    id: 'ozempic-1mg-pen-dm3',
    name: 'ozempic 1mg prefilled pen',
    genericName: 'semaglutide',
    concentration: '1mg (pen)',
    price: 4000,
    matchKeywords: ['ozempic 1', 'اوزيمبيك ١', '#anti-diabetic', '#glp-1 agonist'],
    usage: 'سيماجلوتايد (GLP‑1) قلم حقن أسبوعي لضبط السكر.',
    timing: 'مرة أسبوعياً – مزمن',
    category: Category.DIABETES,
    form: 'Pen',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('1mg (pen) (حقنة) — مرة أسبوعياً — بدون اعتبار للأكل — مزمن.'),
    warnings: GLP1_WARNINGS,
  },

  // 126
  {
    id: 'faglozino-10mg-30-tablets-dm3',
    name: 'faglozino 10mg 30 tablets',
    genericName: 'empagliflozin',
    concentration: '10mg',
    price: 186,
    matchKeywords: ['faglozino 10', 'فاجلوزينو ١٠', '#anti-diabetic', '#sglt2 inhibitor'],
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

  // 127
  {
    id: 'bioglita-plus-15-500mg-30-fc-tab-dm3',
    name: 'bioglita plus 15/500mg 30 f.c.tab.',
    genericName: 'metformin hydrochloride & pioglitazone',
    concentration: '15/500mg',
    price: 105,
    matchKeywords: ['bioglita plus 15/500', 'بيوجليتا بلس', '#anti-diabetic', '#sensitizers', '#glitazone', '#biguanide'],
    usage: 'ميتفورمين + بيوجليتازون لتحسين مقاومة الإنسولين وضبط السكر.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('15/500mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, PIOGLITAZONE_WARNINGS),
  },

  // 128
  {
    id: 'bioglita-plus-15-850mg-30-fc-tab-dm3',
    name: 'bioglita plus 15/850mg 30 f.c. tab.',
    genericName: 'metformin hydrochloride & pioglitazone',
    concentration: '15/850mg',
    price: 111,
    matchKeywords: ['bioglita plus 15/850', 'بيوجليتا بلس ٨٥٠', '#anti-diabetic', '#sensitizers', '#glitazone', '#biguanide'],
    usage: 'ميتفورمين + بيوجليتازون لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('15/850mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, PIOGLITAZONE_WARNINGS),
  },

  // 129
  {
    id: 'rybelsus-14mg-10-tabs-dm3',
    name: 'rybelsus 14mg 10 tabs',
    genericName: 'semaglutide',
    concentration: '14mg (10 tablets)',
    price: 1575,
    matchKeywords: ['rybelsus 14 10', 'رايبلسوس ١٤', '#anti-diabetic', '#glp-1 agonist'],
    usage: 'سيماجلوتايد فموي (GLP‑1) لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('14mg (10 tablets) (قرص) — مرة يومياً — على معدة فارغة — مزمن.'),
    warnings: GLP1_WARNINGS,
  },

  // 130
  {
    id: 'mounjaro-2-5mg-0-5ml-4-pen-dm3',
    name: 'mounjaro injection 2.5mg/0.5ml 4 single dose pens',
    genericName: 'tirzepatide',
    concentration: '2.5mg/0.5ml (4 pens)',
    price: 9435,
    matchKeywords: ['mounjaro 2.5', 'مونجارو ٢٫٥', '#anti-diabetic', '#glp-1 agonist'],
    usage: 'تيرزيباتيد (GIP/GLP‑1) جرعة بداية لضبط السكر حسب التشخيص والحالة.',
    timing: 'مرة أسبوعياً – مزمن',
    category: Category.DIABETES,
    form: 'Pen',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('2.5mg/0.5ml (4 pens) (حقنة) — مرة أسبوعياً — بدون اعتبار للأكل — مزمن.'),
    warnings: GLP1_WARNINGS,
  },

  // 131
  {
    id: 'mounjaro-7-5mg-0-5ml-4-pen-dm3',
    name: 'mounjaro injection 7.5mg/0.5ml 4 single dose pens',
    genericName: 'tirzepatide',
    concentration: '7.5mg/0.5ml (4 pens)',
    price: 15455,
    matchKeywords: ['mounjaro 7.5', 'مونجارو ٧٫٥', '#anti-diabetic', '#glp-1 agonist'],
    usage: 'تيرزيباتيد (GIP/GLP‑1) لضبط السكر حسب التشخيص والحالة.',
    timing: 'مرة أسبوعياً – مزمن',
    category: Category.DIABETES,
    form: 'Pen',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('7.5mg/0.5ml (4 pens) (حقنة) — مرة أسبوعياً — بدون اعتبار للأكل — مزمن.'),
    warnings: GLP1_WARNINGS,
  },

  // 132
  {
    id: 'cidophage-1000mg-30-fc-tabs-dm3',
    name: 'cidophage 1000mg 30 f.c. tabs',
    genericName: 'metformin',
    concentration: '1000mg',
    price: 51,
    matchKeywords: ['cidophage 1000', 'سيدوفاج ١٠٠٠', '#anti-diabetic', '#sensitizers', '#biguanide'],
    usage: 'ميتفورمين لضبط السكر وتحسين مقاومة الإنسولين.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('1000mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: METFORMIN_WARNINGS,
  },

  // 133
  {
    id: 'dapaveldactin-10mg-28-fc-tabs-dm3',
    name: 'dapaveldactin 10 mg 28 f.c. tabs.',
    genericName: 'dapagliflozin',
    concentration: '10mg (28 tablets)',
    price: 368,
    matchKeywords: ['dapaveldactin 10', 'دابافيلداكتين', '#anti-diabetic', '#secretagogues', '#sglt2 inhibitor'],
    usage: 'داباجليفلوزين (SGLT2) لضبط السكر.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('10mg (28 tablets) (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: SGLT2_WARNINGS,
  },

  // 134
  {
    id: 'dapaveldactin-plus-5-1000mg-28-fc-tabs-dm3',
    name: 'dapaveldactin plus 5/1000 mg 28 f.c. tabs.',
    genericName: 'metformin hydrochloride & dapagliflozin',
    concentration: '5/1000mg',
    price: 200,
    matchKeywords: ['dapaveldactin plus 5/1000', 'دابافيلداكتين بلس', '#anti-diabetic', '#secretagogues', '#sglt2 inhibitor'],
    usage: 'ميتفورمين + داباجليفلوزين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('5/1000mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, SGLT2_WARNINGS),
  },

  // 135
  {
    id: 'dapaveldactin-plus-5-850mg-28-fc-tabs-dm3',
    name: 'dapaveldactin plus 5/850 mg 28 f.c. tabs.',
    genericName: 'metformin hydrochloride & dapagliflozin',
    concentration: '5/850mg',
    price: 200,
    matchKeywords: ['dapaveldactin plus 5/850', 'دابافيلداكتين بلس ٨٥٠', '#anti-diabetic', '#secretagogues', '#sglt2 inhibitor'],
    usage: 'ميتفورمين + داباجليفلوزين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('5/850mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, SGLT2_WARNINGS),
  },

  // 136
  {
    id: 'diacurimap-10mg-30-fc-tabs-dm3',
    name: 'diacurimap 10 mg 30 f.c. tabs.',
    genericName: 'empagliflozin',
    concentration: '10mg',
    price: 204,
    matchKeywords: ['diacurimap 10', 'دياكوريماب ١٠', '#anti-diabetic', '#secretagogues', '#sglt2 inhibitor'],
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

  // 137
  {
    id: 'diacurimap-25mg-30-fc-tabs-dm3',
    name: 'diacurimap 25 mg 30 f.c. tabs.',
    genericName: 'empagliflozin',
    concentration: '25mg',
    price: 204,
    matchKeywords: ['diacurimap 25', 'دياكوريماب ٢٥', '#anti-diabetic', '#secretagogues', '#sglt2 inhibitor'],
    usage: 'إمباجليفلوزين (SGLT2) جرعة أعلى لضبط السكر حسب التشخيص والحالة.',
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

  // 138
  {
    id: 'diaflozimet-5-1000mg-30-xr-fc-tabs-dm3',
    name: 'diaflozimet 5/1000 mg 30 ext. rel . f.c. tabs.',
    genericName: 'dapagliflozin & metformin hydrochloride',
    concentration: '5/1000mg XR',
    price: 190.5,
    matchKeywords: ['diaflozimet 5/1000', 'ديافلوزيمت', '#anti-diabetic', '#secretagogues', '#sglt2 inhibitor'],
    usage: 'داباجليفلوزين + ميتفورمين ممتد المفعول لضبط السكر.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('5/1000mg XR (قرص) — مرة يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, SGLT2_WARNINGS),
  },

  // 139
  {
    id: 'diaflozimet-5-500mg-30-xr-fc-tabs-dm3',
    name: 'diaflozimet 5/500 mg 30 ext. rel . f.c. tabs.',
    genericName: 'dapagliflozin & metformin hydrochloride',
    concentration: '5/500mg XR',
    price: 190.5,
    matchKeywords: ['diaflozimet 5/500', 'ديافلوزيمت ٥٠٠', '#anti-diabetic', '#secretagogues', '#sglt2 inhibitor'],
    usage: 'داباجليفلوزين + ميتفورمين ممتد المفعول لضبط السكر.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('5/500mg XR (قرص) — مرة يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, SGLT2_WARNINGS),
  },

  // 140
  {
    id: 'dibavally-plus-50-1000mg-14-tabs-dm3',
    name: 'dibavally plus 50/1000mg 14 tabs.',
    genericName: 'vildagliptin & metformin hydrochloride',
    concentration: '50/1000mg (14 tablets)',
    price: 52,
    matchKeywords: ['dibavally plus 50/1000 14', 'ديبافالي بلس', '#anti-diabetic', '#secretagogues', '#dpp-4 inhibitors'],
    usage: 'فيلداجليبتين + ميتفورمين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('50/1000mg (14 tablets) (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, DPP4_WARNINGS),
  },

  // 141
  {
    id: 'dibavally-plus-50-1000mg-28-tabs-dm3',
    name: 'dibavally plus 50/1000mg 28 tabs.',
    genericName: 'vildagliptin & metformin hydrochloride',
    concentration: '50/1000mg (28 tablets)',
    price: 184,
    matchKeywords: ['dibavally plus 50/1000 28', 'ديبافالي بلس ٢٨', '#anti-diabetic', '#secretagogues', '#dpp-4 inhibitors'],
    usage: 'فيلداجليبتين + ميتفورمين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('50/1000mg (28 tablets) (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, DPP4_WARNINGS),
  },

  // 142
  {
    id: 'dolcyl-1mg-30-tab-dm3',
    name: 'dolcyl 1mg 30 tab.',
    genericName: 'glimepiride',
    concentration: '1mg',
    price: 36,
    matchKeywords: ['dolcyl 1', 'دولسيل ١', '#anti-diabetic', '#secretagogues', '#sulfonylurea'],
    usage: 'جليميبرايد لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('1mg (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: SULFONYLUREA_WARNINGS,
  },

  // 143
  {
    id: 'dolcyl-m-2-1000mg-20-fc-tab-dm3',
    name: 'dolcyl m 2/1000mg 20 f.c. tab',
    genericName: 'glimepiride & metformin hydrochloride',
    concentration: '2/1000mg',
    price: 40,
    matchKeywords: ['dolcyl m 2/1000', 'دولسيل ام', '#anti-diabetic', '#secretagogues', '#sensitizers'],
    usage: 'جليميبرايد + ميتفورمين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('2/1000mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, SULFONYLUREA_WARNINGS),
  },

  // 144
  {
    id: 'dolcyl-m-2-500mg-20-fc-tab-dm3',
    name: 'dolcyl m 2/500mg 20 f.c. tab',
    genericName: 'glimepiride & metformin hydrochloride',
    concentration: '2/500mg',
    price: 34,
    matchKeywords: ['dolcyl m 2/500', 'دولسيل ام ٥٠٠', '#anti-diabetic', '#secretagogues', '#sensitizers'],
    usage: 'جليميبرايد + ميتفورمين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('2/500mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, SULFONYLUREA_WARNINGS),
  },

  // 145
  {
    id: 'empagliform-12-5-500mg-30-fc-tabs-dm3',
    name: 'empagliform 12.5/500 mg 30 f.c. tabs.',
    genericName: 'empagliflozin & metformin hydrochloride',
    concentration: '12.5/500mg',
    price: 207,
    matchKeywords: ['empagliform 12.5/500', 'امباجليفورم', '#anti-diabetic', '#secretagogues', '#sglt2 inhibitor'],
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

  // 146
  {
    id: 'empagliform-5-500mg-30-fc-tabs-dm3',
    name: 'empagliform 5/500 mg 30 f.c. tabs',
    genericName: 'empagliflozin & metformin hydrochloride',
    concentration: '5/500mg',
    price: 159,
    matchKeywords: ['empagliform 5/500', 'امباجليفورم ٥٠٠', '#anti-diabetic', '#secretagogues', '#sglt2 inhibitor'],
    usage: 'إمباجليفلوزين + ميتفورمين لضبط السكر.',
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

  // 147
  {
    id: 'forflozin-plus-5-1000mg-30-xr-fc-tabs-dm3',
    name: 'forflozin plus 5/1000 mg 30 ext. rel . f.c. tabs.',
    genericName: 'metformin hydrochloride & dapagliflozin',
    concentration: '5/1000mg XR',
    price: 171,
    matchKeywords: ['forflozin plus 5/1000', 'فورفلوزين بلس', '#anti-diabetic', '#secretagogues', '#sglt2 inhibitor'],
    usage: 'ميتفورمين + داباجليفلوزين ممتد المفعول لضبط السكر.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('5/1000mg XR (قرص) — مرة يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, SGLT2_WARNINGS),
  },

  // 148
  {
    id: 'westadiab-25mg-10-fc-tabs-dm3',
    name: 'westadiab 25 mg 10 f.c. tabs.',
    genericName: 'empagliflozin',
    concentration: '25mg (10 tablets)',
    price: 76.25,
    matchKeywords: ['westadiab 25', 'ويستادياب', '#anti-diabetic', '#secretagogues', '#sglt2 inhibitor'],
    usage: 'إمباجليفلوزين (SGLT2) لضبط السكر.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('25mg (10 tablets) (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: SGLT2_WARNINGS,
  },

  // 149
  {
    id: 'glemax-4mg-30-caplets-dm3',
    name: 'glemax 4 mg 30 caplets',
    genericName: 'glimepiride',
    concentration: '4mg',
    price: 61,
    matchKeywords: ['glemax 4', 'جليماكس', '#anti-diabetic', '#secretagogues', '#sulfonylurea'],
    usage: 'جليميبرايد (سلفونيل يوريا) لضبط السكر.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Caplet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('4mg (كبسولة) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: SULFONYLUREA_WARNINGS,
  },

  // 150
  {
    id: 'glimet-2-5-400mg-30-fc-tab-dm3',
    name: 'glimet 2.5/400 mg 30 f.c.tab.',
    genericName: 'metformin & glibenclamide (glyburide)',
    concentration: '2.5/400mg',
    price: 45,
    matchKeywords: ['glimet 2.5/400', 'جليمت', '#anti-diabetic', '#secretagogues', '#sensitizers'],
    usage: 'ميتفورمين + جليبينكلاميد لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('2.5/400mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, SULFONYLUREA_WARNINGS),
  },

  // 151
  {
    id: 'glimpacare-25mg-21-tabs-dm3',
    name: 'glimpacare 25 mg 21 tabs.',
    genericName: 'empagliflozin',
    concentration: '25mg (21 tablets)',
    price: 156,
    matchKeywords: ['glimpacare 25 21', 'جليمباكير', '#anti-diabetic', '#secretagogues', '#sglt2 inhibitor'],
    usage: 'إمباجليفلوزين (SGLT2) لضبط السكر.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('25mg (21 tablets) (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: SGLT2_WARNINGS,
  },

  // 152
  {
    id: 'gliptalina-2-5-1000mg-30-fc-tabs-dm3',
    name: 'gliptalina 2.5/1000mg 30 f.c. tabs.',
    genericName: 'metformin hydrochloride & linagliptin',
    concentration: '2.5/1000mg',
    price: 162,
    matchKeywords: ['gliptalina 2.5/1000', 'جليبتالينا', '#anti-diabetic', '#secretagogues', '#dpp-4 inhibitors'],
    usage: 'ميتفورمين + ليناجليبتين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('2.5/1000mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, DPP4_WARNINGS),
  },

  // 153
  {
    id: 'gliptus-50mg-30-tabs-dm3',
    name: 'gliptus 50 mg 30 tabs.',
    genericName: 'vildagliptin',
    concentration: '50mg',
    price: 151.5,
    matchKeywords: ['gliptus 50', 'جليبتس', '#anti-diabetic', '#secretagogues', '#dpp-4 inhibitors'],
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

  // 154
  {
    id: 'glimpacare-25mg-28-tabs-dm3',
    name: 'glimpacare 25 mg 28 tabs.',
    genericName: 'empagliflozin',
    concentration: '25mg (28 tablets)',
    price: 208,
    matchKeywords: ['glimpacare 25 28', 'جليمباكير ٢٨', '#anti-diabetic', '#secretagogues', '#sglt2 inhibitor'],
    usage: 'إمباجليفلوزين (SGLT2) لضبط السكر.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('25mg (28 tablets) (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: SGLT2_WARNINGS,
  },

  // 155
  {
    id: 'diacurimap-plus-10-5mg-30-fc-tabs-dm3',
    name: 'diacurimap plus 10/5 mg 30 f.c. tabs.',
    genericName: 'empagliflozin & linagliptin',
    concentration: '10/5mg',
    price: 354,
    matchKeywords: ['diacurimap plus 10/5', 'دياكوريماب بلس', '#anti-diabetic', '#sglt2 inhibitor', '#dpp-4 inhibitors'],
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

  // 156
  {
    id: 'janaglip-100mg-28-fc-tab-dm3',
    name: 'janaglip 100mg 28 f.c. tab.',
    genericName: 'sitagliptin',
    concentration: '100mg (28 tablets)',
    price: 262,
    matchKeywords: ['janaglip 100', 'جاناجليب ١٠٠', '#anti-diabetic', '#secretagogues', '#dpp-4 inhibitors'],
    usage: 'سيتاجليبتين (DPP‑4) لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('100mg (28 tablets) (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: DPP4_WARNINGS,
  },

  // 157
  {
    id: 'januvia-50mg-28-fc-tab-dm3',
    name: 'januvia 50 mg 28 f.c. tab.',
    genericName: 'sitagliptin',
    concentration: '50mg (28 tablets)',
    price: 290,
    matchKeywords: ['januvia 50', 'جانوفيا ٥٠', '#anti-diabetic', '#secretagogues', '#dpp-4 inhibitors'],
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

  // 158
  {
    id: 'mounjaro-10mg-0-5ml-4-pen-dm3',
    name: 'mounjaro injection 10mg/0.5ml 4 single dose pens',
    genericName: 'tirzepatide',
    concentration: '10mg/0.5ml (4 pens)',
    price: 15455,
    matchKeywords: ['mounjaro 10', 'مونجارو ١٠', '#anti-diabetic', '#glp-1 agonist'],
    usage: 'تيرزيباتيد (GIP/GLP‑1) لضبط السكر حسب التشخيص والحالة.',
    timing: 'مرة أسبوعياً – مزمن',
    category: Category.DIABETES,
    form: 'Pen',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('10mg/0.5ml (4 pens) (حقنة) — مرة أسبوعياً — بدون اعتبار للأكل — مزمن.'),
    warnings: GLP1_WARNINGS,
  },

  // 159
  {
    id: 'mounjaro-15mg-0-5ml-4-pen-dm3',
    name: 'mounjaro injection 15mg/0.5ml 4 single dose pens',
    genericName: 'tirzepatide',
    concentration: '15mg/0.5ml (4 pens)',
    price: 18150,
    matchKeywords: ['mounjaro 15', 'مونجارو ١٥', '#anti-diabetic', '#glp-1 agonist'],
    usage: 'تيرزيباتيد (GIP/GLP‑1) لضبط السكر حسب التشخيص والحالة.',
    timing: 'مرة أسبوعياً – مزمن',
    category: Category.DIABETES,
    form: 'Pen',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('15mg/0.5ml (4 pens) (حقنة) — مرة أسبوعياً — بدون اعتبار للأكل — مزمن.'),
    warnings: GLP1_WARNINGS,
  },

  // 160
  {
    id: 'mellitofix-25mg-30-fc-tabs-dm3',
    name: 'mellitofix 25 mg 30 f.c. tabs',
    genericName: 'empagliflozin',
    concentration: '25mg',
    price: 303,
    matchKeywords: ['mellitofix 25', 'ميليتوفيكس', '#anti-diabetic', '#secretagogues', '#sglt2 inhibitor'],
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

  // 161
  {
    id: 'mepaphage-xr-1000mg-30-fc-tab-dm3',
    name: 'mepaphage xr 1000mg 30 f.c. tab.',
    genericName: 'metformin hydrochloride',
    concentration: '1000mg XR',
    price: 66,
    matchKeywords: ['mepaphage xr 1000', 'ميبافاج اكس ار', '#anti-diabetic', '#sensitizers', '#biguanide'],
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

  // 162
  {
    id: 'replitza-1-500mg-30-fc-tabs-dm3',
    name: 'replitza 1/500 mg 30 f.c. tabs.',
    genericName: 'repaglinide & metformin hydrochloride',
    concentration: '1/500mg',
    price: 36,
    matchKeywords: ['replitza 1/500', 'ريبليتزا', '#anti-diabetic', '#secretagogues', '#glinides'],
    usage: 'ريباكلينيد + ميتفورمين لضبط سكر النوع الثاني.',
    timing: 'حسب التعليمات – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('1/500mg (قرص) — حسب التعليمات — قبل الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, GLINIDE_WARNINGS),
  },

  // 163
  {
    id: 'soliqua-100u-33mcg-ml-3-pen-dm3',
    name: 'soliqua 100 units+33 mcg/ml 3 prefilled pens',
    genericName: 'insulin glargine & lixisenatide',
    concentration: '100 units + 33 mcg/ml (3 pens)',
    price: 1785,
    matchKeywords: ['soliqua 33', 'سوليكوا ٣٣', '#anti-diabetic', '#glp-1 agonist'],
    usage: 'تركيبة: أنسولين جلارجين + ليكسيزيناتيد لضبط سكر النوع الثاني حسب التشخيص.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Pen',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('100 units + 33 mcg/ml (3 pens) (حقنة) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: mergeWarnings(INSULIN_COMBO_WARNINGS, GLP1_WARNINGS),
  },

  // 164
  {
    id: 'soliqua-100u-50mcg-ml-3-pen-dm3',
    name: 'soliqua 100 units+50 mcg/ml 3 prefilled pens',
    genericName: 'insulin glargine & lixisenatide',
    concentration: '100 units + 50 mcg/ml (3 pens)',
    price: 2531,
    matchKeywords: ['soliqua 50', 'سوليكوا ٥٠', '#anti-diabetic', '#glp-1 agonist'],
    usage: 'تركيبة: أنسولين جلارجين + ليكسيزيناتيد لضبط سكر النوع الثاني حسب التشخيص.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Pen',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('100 units + 50 mcg/ml (3 pens) (حقنة) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: mergeWarnings(INSULIN_COMBO_WARNINGS, GLP1_WARNINGS),
  },

  // 165
  {
    id: 'sugarlo-50mg-30-tabs-dm3',
    name: 'sugarlo 50mg 30 tabs.',
    genericName: 'vildagliptin',
    concentration: '50mg',
    price: 123,
    matchKeywords: ['sugarlo 50', 'شوجارلو', '#anti-diabetic', '#secretagogues', '#dpp-4 inhibitors'],
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

  // 166
  {
    id: 'vildaformin-50-1000mg-30-tabs-dm3',
    name: 'vildaformin 50/1000mg 30 tabs',
    genericName: 'metformin hydrochloride & vildagliptin',
    concentration: '50/1000mg',
    price: 174,
    matchKeywords: ['vildaformin 50/1000', 'فيلدافورمين', '#anti-diabetic', '#secretagogues', '#sensitizers'],
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

  // 167
  {
    id: 'empagliform-12-5-1000mg-30-fc-tabs-dm3',
    name: 'empagliform 12.5/1000 mg 30 f.c. tabs.',
    genericName: 'empagliflozin & metformin hydrochloride',
    concentration: '12.5/1000mg',
    price: 228,
    matchKeywords: ['empagliform 12.5/1000', 'امباجليفورم ١٠٠٠', '#anti-diabetic', '#secretagogues', '#sglt2 inhibitor'],
    usage: 'إمباجليفلوزين + ميتفورمين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('12.5/1000mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, SGLT2_WARNINGS),
  },

  // 168
  {
    id: 'empagliform-5-1000mg-30-fc-tabs-dm3',
    name: 'empagliform 5/1000 mg 30 f.c. tabs.',
    genericName: 'empagliflozin & metformin hydrochloride',
    concentration: '5/1000mg',
    price: 177,
    matchKeywords: ['empagliform 5/1000', 'امباجليفورم ٥/١٠٠٠', '#anti-diabetic', '#secretagogues', '#sglt2 inhibitor'],
    usage: 'إمباجليفلوزين + ميتفورمين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('5/1000mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(METFORMIN_WARNINGS, SGLT2_WARNINGS),
  },

  // 169
  {
    id: 'glempozin-25mg-30-fc-tabs-dm3',
    name: 'glempozin 25 mg 30 f.c. tabs.',
    genericName: 'empagliflozin',
    concentration: '25mg',
    price: 240,
    matchKeywords: ['glempozin 25', 'جليمبوزين', '#anti-diabetic', '#secretagogues', '#sglt2 inhibitor'],
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

  // 170
  {
    id: 'sitagliform-50-1000mg-30-fc-tabs-dm3',
    name: 'sitagliform 50/1000mg 30 f.c. tabs.',
    genericName: 'sitagliptin & metformin hydrochloride',
    concentration: '50/1000mg',
    price: 207,
    matchKeywords: ['sitagliform 50/1000', 'سيتاجليفورم', '#anti-diabetic', '#secretagogues', '#sensitizers'],
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
];

export const GLUCOSE_LOWERING_AGENTS_3: Medication[] = GLUCOSE_LOWERING_AGENTS_3_RAW.map(enhanceGlucoseLoweringMedication);

