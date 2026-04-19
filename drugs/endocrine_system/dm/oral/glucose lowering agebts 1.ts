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

const VILDAGLIPTIN_WARNINGS = [
  ...DPP4_WARNINGS,
  'راقب وظائف الكبد دورياً خصوصاً في بداية العلاج أو مرض كبدي سابق.',
];

const SITAGLIPTIN_WARNINGS = [
  ...DPP4_WARNINGS,
  'قصور الكُلى: جرعة ٥٠ مجم إذا eGFR ٣٠–٥٠؛ ٢٥ مجم إذا eGFR &lt;٣٠.',
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

const PIOGLITAZONE_WARNINGS = [
  ...GENERAL_DIABETES_WARNINGS,
  'قد يسبب احتباس سوائل/تورم القدمين وزيادة وزن؛ يُتجنب في قصور القلب.',
  'يُستخدم بحذر عند وجود تاريخ مرضي لسرطان المثانة.',
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

  // Generics & common Arabic spellings
  if (g.includes('metformin')) boost.push('metformin', 'ميتفورمين', 'glucophage', 'جلوكوفاج', 'cidophage', 'سيدوفاج', 'maxophage', 'ماكسوفاج', 'maxophage xr', 'ماكسوفاج اكس ار');
  if (g.includes('gliclazide')) boost.push('gliclazide', 'جليكلازيد', 'diamicron', 'دياميكرون', 'unocron', 'يونكرون', 'diamedizen', 'دياميديزين');
  if (g.includes('glimepiride')) boost.push('glimepiride', 'جليميبرايد', 'amaryl', 'اماريل', 'dolcyl', 'دولسيل', 'diabenor', 'ديابنور');
  if (g.includes('glibenclamide') || g.includes('glyburide')) boost.push('glibenclamide', 'glyburide', 'جليبينكلاميد', 'جليبوريد', 'glucovance', 'جلوكوفانس', 'glybofen', 'جليبوفين', 'gluokan', 'جلووكان', 'glimet forte', 'جليمت فورت', 'diavance', 'ديافانس');
  if (g.includes('vildagliptin')) boost.push('vildagliptin', 'فيلداجليبتين', 'galvus', 'جالفس', 'galvus met', 'sugarlo', 'شوجارلو', 'gliptus', 'جليبتس', 'metvildazone', 'ميتفيلدازون', 'vildagluse', 'فيلداجلوز', 'icandra', 'ايكاندرا', 'futavildix', 'فوتافيلديكس', 'vanvilda', 'فانفيلدا');
  if (g.includes('sitagliptin')) boost.push('sitagliptin', 'سيتاجليبتين', 'januvia', 'جانوفيا', 'janumet', 'جانوميت', 'glaptivia', 'جلابتيفيا', 'janaglip', 'جاناجليب', 'gleptomet', 'جليبتوميت', 'sitagliform', 'سيتاجليفورم');
  if (g.includes('linagliptin')) boost.push('linagliptin', 'لينا جليبتين', 'trajenta', 'تراجنتا', 'linatraje', 'ليناتراجي');
  if (g.includes('dapagliflozin')) boost.push('dapagliflozin', 'داباجليفلوزين', 'forflozin', 'فورفلوزين', 'dapablix', 'دابابليكس', 'diglifloz', 'ديجليفلوز', 'diaflozimet', 'ديافلوزيمت', 'forxiga', 'فورسيجا', 'dapaglif', 'داباجليف');
  if (g.includes('empagliflozin')) boost.push('empagliflozin', 'إمباجليفلوزين', 'faglozino', 'فاجلوزينو', 'empacoza', 'امباكوزا', 'mellitofix', 'ميليتوفيكس', 'jardiance', 'جارديانس', 'synjardy', 'سينجاردي', 'diacurimap', 'دياكوريماب', 'gliflozamet', 'جليفلوزاميت');
  if (g.includes('pioglitazone')) boost.push('pioglitazone', 'بيوجليتازون', 'hi-glitazone', 'هاي جليتازون', 'zanoglide', 'زانوجلايد', 'amaglust', 'اماجلوست', 'diabetonorm', 'ديابتونورم', 'bioglita', 'بيوجليتا');

  // Form hints
  if (n.includes('xr') || n.includes('mr') || n.includes('ext') || n.includes('extended')) boost.push('xr', 'mr', 'extended release', 'ممتد المفعول');

  return uniq([...base, ...boost, dose, dosePlain, doseAr, m.name, m.genericName]);
};

const enhanceGlucoseLoweringMedication = (m: Medication): Medication => ({
  ...m,
  matchKeywords: uniq([...(m.matchKeywords || []), ...glucoseKeywordBoost(m)]),
});

// =========================
// Glucose lowering agents (oral) - list 1 (replace oral files)
// =========================
const GLUCOSE_LOWERING_AGENTS_1_RAW: Medication[] = [
  // 1
  {
    id: 'diamicron-mr-30mg-30-tab-dm1',
    name: 'Diamicron mr 30 mg 30 tab.',
    genericName: 'gliclazide',
    concentration: '30mg',
    price: 80,
    matchKeywords: ['diamicron mr 30', 'دياميكرون ٣٠', '#sulfonylurea', '#secretagogues'],
    usage: 'جليكلازيد ممتد المفعول لضبط سكر الدم في النوع الثاني (سلفونيل يوريا).',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Prolonged Release Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('30mg (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: SULFONYLUREA_WARNINGS,
  },

  // 2
  {
    id: 'galvus-met-50-500mg-30-fc-tabs-dm1',
    name: 'Galvus met 50/500mg 30 f.c.tabs.',
    genericName: 'vildagliptin & metformin hydrochloride',
    concentration: '50/500mg',
    price: 258,
    matchKeywords: ['galvus met 50/500', 'جالفس ميت', '#dpp-4 inhibitors', '#sensitizers'],
    usage: 'فيلداجليبتين + ميتفورمين لضبط سكر النوع الثاني (تركيبة تقلل مقاومة الإنسولين وتزيد كفاءة التحكم).',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('50/500mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(VILDAGLIPTIN_WARNINGS, METFORMIN_WARNINGS),
  },

  // 3
  {
    id: 'glucophage-1000mg-30-fc-tabs-dm1',
    name: 'Glucophage 1000 mg 30 f.c.tabs.',
    genericName: 'metformin',
    concentration: '1000mg',
    price: 54,
    matchKeywords: ['glucophage 1000', 'جلوكوفاج ١٠٠٠', '#biguanide'],
    usage: 'ميتفورمين لتنظيم سكر النوع الثاني ومقاومة الإنسولين (وقد يُستخدم في تكيس المبايض ٥٠٠–١٥٠٠ مجم/يوم).',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: fixed('1000mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: METFORMIN_WARNINGS,
  },

  // 4
  {
    id: 'glucophage-xr-1000mg-30-tabs-dm1',
    name: 'Glucophage xr 1000 mg 30 tabs.',
    genericName: 'metformin',
    concentration: '1000mg (XR)',
    price: 126,
    matchKeywords: ['glucophage xr 1000', 'جلوكوفاج اكس ار ١٠٠٠', '#biguanide'],
    usage: 'ميتفورمين ممتد المفعول لتحسين تحمل المعدة وضبط السكر.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Prolonged Release Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('1000mg (XR) (قرص) — مرة يومياً — مع/بعد الأكل — مزمن.'),
    warnings: METFORMIN_WARNINGS,
  },

  // 5
  {
    id: 'glucophage-xr-500mg-30-tabs-dm1',
    name: 'Glucophage xr 500 mg 30 tabs.',
    genericName: 'metformin hydrochloride',
    concentration: '500mg (XR)',
    price: 77,
    matchKeywords: ['glucophage xr 500', 'جلوكوفاج اكس ار ٥٠٠', '#biguanide'],
    usage: 'ميتفورمين ممتد المفعول (جرعة بداية) لضبط السكر ومقاومة الإنسولين.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Prolonged Release Tablet',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: fixed('500mg (XR) (قرص) — مرة يومياً — مع/بعد الأكل — مزمن.'),
    warnings: METFORMIN_WARNINGS,
  },

  // 6
  {
    id: 'janumet-50-850mg-56-fc-tabs-dm1',
    name: 'Janumet 50/850mg 56 f.c. tab',
    genericName: 'metformin hydrochloride & sitagliptin',
    concentration: '50/850mg',
    price: 674,
    matchKeywords: ['janumet 50/850', 'جانوميت ٨٥٠', '#dpp-4 inhibitors'],
    usage: 'سيتاجليبتين + ميتفورمين لضبط سكر النوع الثاني (تركيبة).',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('50/850mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(SITAGLIPTIN_WARNINGS, METFORMIN_WARNINGS),
  },

  // 7
  {
    id: 'janumet-50-1000mg-56-fc-tabs-dm1',
    name: 'Janumet 50/1000mg 56 f.c. tab',
    genericName: 'sitagliptin & metformin hydrochloride',
    concentration: '50/1000mg',
    price: 674,
    matchKeywords: ['janumet 50/1000', 'جانوميت ١٠٠٠', '#dpp-4 inhibitors'],
    usage: 'سيتاجليبتين + ميتفورمين لضبط سكر النوع الثاني (تركيبة أقوى).',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('50/1000mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(SITAGLIPTIN_WARNINGS, METFORMIN_WARNINGS),
  },

  // 8
  {
    id: 'sugarlo-plus-50-1000mg-30-fc-tabs-dm1',
    name: 'Sugarlo plus 50/1000mg 30 f.c. tabs',
    genericName: 'vildagliptin & metformin hydrochloride',
    concentration: '50/1000mg',
    price: 136.5,
    matchKeywords: ['sugarlo plus 50/1000', 'شوجارلو بلس', '#dpp-4 inhibitors'],
    usage: 'بديل اقتصادي لتركيبة فيلداجليبتين + ميتفورمين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('50/1000mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(VILDAGLIPTIN_WARNINGS, METFORMIN_WARNINGS),
  },

  // 9
  {
    id: 'diamicron-mr-60mg-30-scored-tab-dm1',
    name: 'Diamicron mr 60 mg 30 scored tab.',
    genericName: 'gliclazide',
    concentration: '60mg (MR)',
    price: 156,
    matchKeywords: ['diamicron mr 60', 'دياميكرون ٦٠', 'scored', '#sulfonylurea'],
    usage: 'جليكلازيد ممتد المفعول لضبط سكر النوع الثاني (قرص قابل للقسمة).',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Scored Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('60mg (MR) (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: SULFONYLUREA_WARNINGS,
  },

  // 10
  {
    id: 'forflozin-10mg-30-fc-tabs-dm1',
    name: 'Forflozin 10mg 30 f.c. tabs',
    genericName: 'dapagliflozin',
    concentration: '10mg',
    price: 306,
    matchKeywords: ['forflozin 10', 'فورفلوزين', '#sglt2 inhibitor'],
    usage: 'داباجليفلوزين (SGLT2) لضبط السكر وقد يفيد القلب/الكُلى حسب الحالة.',
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

  // 11
  {
    id: 'galvus-met-50-1000mg-30-fc-tabs-dm1',
    name: 'Galvus met 50/1000mg 30 f.c. tabs',
    genericName: 'metformin & vildagliptin',
    concentration: '50/1000mg',
    price: 315,
    matchKeywords: ['galvus met 50/1000', 'جالفس ميت ١٠٠٠'],
    usage: 'فيلداجليبتين + ميتفورمين لضبط سكر النوع الثاني (تركيبة أقوى).',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('50/1000mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(VILDAGLIPTIN_WARNINGS, METFORMIN_WARNINGS),
  },

  // 12
  {
    id: 'janumet-50-500mg-56-fc-tabs-dm1',
    name: 'Janumet 50/500mg 56 f.c. tab.',
    genericName: 'sitagliptin & metformin hydrochloride',
    concentration: '50/500mg',
    price: 618,
    matchKeywords: ['janumet 50/500', 'جانوميت ٥٠٠'],
    usage: 'سيتاجليبتين + ميتفورمين لضبط سكر النوع الثاني (تركيبة بجرعة ميتفورمين أقل).',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('50/500mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(SITAGLIPTIN_WARNINGS, METFORMIN_WARNINGS),
  },

  // 13
  {
    id: 'sugarlo-plus-50-500mg-30-fc-tabs-dm1',
    name: 'Sugarlo plus 50/500mg 30 f.c. tabs',
    genericName: 'vildagliptin & metformin hydrochloride',
    concentration: '50/500mg',
    price: 132,
    matchKeywords: ['sugarlo plus 50/500', 'شوجارلو ٥٠٠'],
    usage: 'بديل اقتصادي لتركيبة فيلداجليبتين + ميتفورمين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('50/500mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(VILDAGLIPTIN_WARNINGS, METFORMIN_WARNINGS),
  },

  // 14
  {
    id: 'vildagluse-plus-50-1000mg-30-tabs-dm1',
    name: 'Vildagluse plus 50/1000mg 30 tabs',
    genericName: 'metformin hydrochloride & vildagliptin',
    concentration: '50/1000mg',
    price: 147,
    matchKeywords: ['vildagluse plus 50/1000', 'فيلداجلوز بلس'],
    usage: 'بديل لتركيبة فيلداجليبتين + ميتفورمين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('50/1000mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(VILDAGLIPTIN_WARNINGS, METFORMIN_WARNINGS),
  },

  // 15
  {
    id: 'zanoglide-4-30mg-30-tab-dm1',
    name: 'Zanoglide 4/30 mg 30 tab',
    genericName: 'glimepiride & pioglitazone',
    concentration: '4/30mg',
    price: 102,
    matchKeywords: ['zanoglide 4/30', 'زانوجلايد 4/30', 'pioglitazone'],
    usage: 'جليميبرايد + بيوجليتازون لتحسين التحكم في السكر عند مقاومة الإنسولين (قد يزيد خطر الهبوط).',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('4/30mg (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: mergeWarnings(SULFONYLUREA_WARNINGS, PIOGLITAZONE_WARNINGS),
  },

  // 16
  {
    id: 'metvildazone-50-1000mg-30-fc-tabs-dm1',
    name: 'Metvildazone 50/1000 mg 30 f.c.tabs.',
    genericName: 'metformin hydrochloride & vildagliptin',
    concentration: '50/1000mg',
    price: 150,
    matchKeywords: ['metvildazone 50/1000', 'ميتفيلدازون'],
    usage: 'فيلداجليبتين + ميتفورمين لضبط سكر النوع الثاني (بديل).',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('50/1000mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(VILDAGLIPTIN_WARNINGS, METFORMIN_WARNINGS),
  },

  // 17
  {
    id: 'vildagluse-plus-50-500mg-30-tabs-dm1',
    name: 'Vildagluse plus 50/500 mg 30 tabs.',
    genericName: 'vildagliptin & metformin hydrochloride',
    concentration: '50/500mg',
    price: 132,
    matchKeywords: ['vildagluse plus 50/500', 'فيلداجلوز ٥٠٠'],
    usage: 'بديل لتركيبة فيلداجليبتين + ميتفورمين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('50/500mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(VILDAGLIPTIN_WARNINGS, METFORMIN_WARNINGS),
  },

  // 18
  {
    id: 'vildagluse-plus-50-850mg-30-tabs-dm1',
    name: 'Vildagluse plus 50/850 mg 30 tabs.',
    genericName: 'vildagliptin & metformin hydrochloride',
    concentration: '50/850mg',
    price: 136.5,
    matchKeywords: ['vildagluse plus 50/850', 'فيلداجلوز ٨٥٠'],
    usage: 'بديل لتركيبة فيلداجليبتين + ميتفورمين لضبط سكر النوع الثاني (850).',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('50/850mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(VILDAGLIPTIN_WARNINGS, METFORMIN_WARNINGS),
  },

  // 19
  {
    id: 'sugarlo-plus-50-850mg-30-fc-tabs-dm1',
    name: 'Sugarlo plus 50/850mg 30 f.c. tabs',
    genericName: 'vildagliptin & metformin hydrochloride',
    concentration: '50/850mg',
    price: 132,
    matchKeywords: ['sugarlo plus 50/850', 'شوجارلو ٨٥٠'],
    usage: 'بديل اقتصادي لتركيبة فيلداجليبتين + ميتفورمين (850) لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('50/850mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(VILDAGLIPTIN_WARNINGS, METFORMIN_WARNINGS),
  },

  // 20
  {
    id: 'amaryl-1mg-30-tab-dm1',
    name: 'Amaryl 1 mg 30 tab',
    genericName: 'glimepiride',
    concentration: '1mg',
    price: 40,
    matchKeywords: ['amaryl 1', 'اماريل ١', '#sulfonylurea'],
    usage: 'جليميبرايد (سلفونيل يوريا) لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('1mg (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: SULFONYLUREA_WARNINGS,
  },

  // 21
  {
    id: 'amaryl-2mg-30-tabs-dm1',
    name: 'Amaryl 2 mg 30 tabs',
    genericName: 'glimepiride',
    concentration: '2mg',
    price: 78,
    matchKeywords: ['amaryl 2', 'اماريل ٢'],
    usage: 'جليميبرايد لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('2mg (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: SULFONYLUREA_WARNINGS,
  },

  // 22
  {
    id: 'amaryl-3mg-30-tabs-dm1',
    name: 'Amaryl 3 mg 30 tabs',
    genericName: 'glimepiride',
    concentration: '3mg',
    price: 87,
    matchKeywords: ['amaryl 3', 'اماريل ٣'],
    usage: 'جليميبرايد لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('3mg (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: SULFONYLUREA_WARNINGS,
  },

  // 23
  {
    id: 'amaryl-4mg-30-tabs-dm1',
    name: 'Amaryl 4 mg 30 tabs',
    genericName: 'glimepiride',
    concentration: '4mg',
    price: 108,
    matchKeywords: ['amaryl 4', 'اماريل ٤'],
    usage: 'جليميبرايد (جرعة أعلى) لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('4mg (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: SULFONYLUREA_WARNINGS,
  },

  // 24
  {
    id: 'amaryl-m-2-500mg-30-fc-tabs-dm1',
    name: 'Amaryl m 2/500 mg 30 f.c.tabs.',
    genericName: 'glimepiride & metformin hydrochloride',
    concentration: '2/500mg',
    price: 102,
    matchKeywords: ['amaryl m 2/500', 'اماريل ام', '#secretagogues', '#sensitizers'],
    usage: 'جليميبرايد + ميتفورمين لضبط سكر النوع الثاني (تحفيز + تقليل مقاومة).',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('2/500mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(SULFONYLUREA_WARNINGS, METFORMIN_WARNINGS),
  },

  // 25
  {
    id: 'cidophage-850mg-60-fc-tabs-dm1',
    name: 'Cidophage 850mg 60 f.c. tabs',
    genericName: 'metformin hydrochloride',
    concentration: '850mg',
    price: 96,
    matchKeywords: ['cidophage 850', 'سيدوفاج ٨٥٠', '#biguanide'],
    usage: 'ميتفورمين لضبط سكر النوع الثاني ومقاومة الإنسولين.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: fixed('850mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: METFORMIN_WARNINGS,
  },

  // 26
  {
    id: 'glybofen-2-5-500mg-30-fc-tabs-dm1',
    name: 'Glybofen 2.5/500mg 30 f.c.tabs.',
    genericName: 'metformin hydrochloride & glibenclamide (glyburide)',
    concentration: '2.5/500mg',
    price: 33,
    matchKeywords: ['glybofen 2.5/500', 'جليبوفين', 'glibenclamide metformin'],
    usage: 'جليبينكلاميد + ميتفورمين لضبط سكر النوع الثاني (قوي وقد يسبب هبوط سكر).',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('2.5/500mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(SULFONYLUREA_WARNINGS, METFORMIN_WARNINGS),
  },

  // 27
  {
    id: 'diamedizen-60mg-mr-30-fc-tab-dm1',
    name: 'Diamedizen 60mg mr 30 f.c.tab',
    genericName: 'gliclazide',
    concentration: '60mg (MR)',
    price: 72,
    matchKeywords: ['diamedizen 60 mr', 'دياميديزين', 'gliclazide mr'],
    usage: 'جليكلازيد ممتد المفعول لضبط سكر النوع الثاني (بديل).',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Prolonged Release Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('60mg (MR) (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: SULFONYLUREA_WARNINGS,
  },

  // 28
  {
    id: 'dolcyl-3mg-30-tab-dm1',
    name: 'Dolcyl 3mg 30 tab.',
    genericName: 'glimepiride',
    concentration: '3mg',
    price: 54,
    matchKeywords: ['dolcyl 3', 'دولسيل ٣'],
    usage: 'جليميبرايد لضبط سكر النوع الثاني (بديل اقتصادي).',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('3mg (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: SULFONYLUREA_WARNINGS,
  },

  // 29
  {
    id: 'galvus-met-50-850mg-30-fc-tabs-dm1',
    name: 'Galvus met 50/850mg 30 f.c.tabs',
    genericName: 'metformin & vildagliptin',
    concentration: '50/850mg',
    price: 309,
    matchKeywords: ['galvus met 50/850', 'جالفس ميت ٨٥٠'],
    usage: 'فيلداجليبتين + ميتفورمين لضبط سكر النوع الثاني (850).',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('50/850mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(VILDAGLIPTIN_WARNINGS, METFORMIN_WARNINGS),
  },

  // 30
  {
    id: 'glaptivia-plus-50-500mg-30-fc-tab-dm1',
    name: 'Glaptivia plus 50/500mg 30 f.c. tab.',
    genericName: 'sitagliptin & metformin hydrochloride',
    concentration: '50/500mg',
    price: 153,
    matchKeywords: ['glaptivia plus 50/500', 'جلابتيفيا بلس'],
    usage: 'سيتاجليبتين + ميتفورمين لضبط سكر النوع الثاني (بديل).',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('50/500mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(SITAGLIPTIN_WARNINGS, METFORMIN_WARNINGS),
  },

  // 31
  {
    id: 'glimepiride-plus-4-30mg-30-scored-tab-dm1',
    name: 'Glimepiride plus 4/30 mg 30 scored tab.',
    genericName: 'glimepiride & pioglitazone',
    concentration: '4/30mg',
    price: 123,
    matchKeywords: ['glimepiride plus 4/30', 'جليميبرايد بلس', 'scored'],
    usage: 'جليميبرايد + بيوجليتازون لتحسين التحكم في السكر مع مقاومة الإنسولين.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Scored Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('4/30mg (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: mergeWarnings(SULFONYLUREA_WARNINGS, PIOGLITAZONE_WARNINGS),
  },

  // 32
  {
    id: 'glimet-forte-5-800mg-30-fc-tab-dm1',
    name: 'Glimet forte 5/800 mg 30 f.c.tab.',
    genericName: 'metformin & glibenclamide (glyburide)',
    concentration: '5/800mg',
    price: 66,
    matchKeywords: ['glimet forte 5/800', 'جليمت فورت'],
    usage: 'جليبينكلاميد + ميتفورمين لضبط سكر النوع الثاني (قوي وقد يسبب هبوط سكر).',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('5/800mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(SULFONYLUREA_WARNINGS, METFORMIN_WARNINGS),
  },

  // 33
  {
    id: 'glucophage-500mg-50-fc-tabs-dm1',
    name: 'Glucophage 500 mg 50 f.c.tabs.',
    genericName: 'metformin',
    concentration: '500mg',
    price: 60,
    matchKeywords: ['glucophage 500', 'جلوكوفاج ٥٠٠'],
    usage: 'ميتفورمين (جرعة بداية) لضبط سكر النوع الثاني ومقاومة الإنسولين.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: fixed('500mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: METFORMIN_WARNINGS,
  },

  // 34
  {
    id: 'glucovance-500-2-5mg-30-fc-tab-dm1',
    name: 'Glucovance 500/2.5mg 30 f.c.tab',
    genericName: 'metformin hydrochloride & glibenclamide',
    concentration: '500/2.5mg',
    price: 54,
    matchKeywords: ['glucovance 500/2.5', 'جلوكوفانس'],
    usage: 'جليبينكلاميد + ميتفورمين لضبط سكر النوع الثاني (قد يسبب هبوط سكر).',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('500/2.5mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(SULFONYLUREA_WARNINGS, METFORMIN_WARNINGS),
  },

  // 35
  {
    id: 'gluokan-5-500mg-30-fc-tab-dm1',
    name: 'Gluokan 5/500mg 30 f.c.tab.',
    genericName: 'glibenclamide (glyburide) & metformin',
    concentration: '5/500mg',
    price: 24,
    matchKeywords: ['gluokan 5/500', 'جلووكان'],
    usage: 'جليبينكلاميد + ميتفورمين لضبط سكر النوع الثاني (بديل اقتصادي).',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('5/500mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(SULFONYLUREA_WARNINGS, METFORMIN_WARNINGS),
  },

  // 36
  {
    id: 'glybofen-5-500mg-30-fc-tabs-dm1',
    name: 'Glybofen 5/500mg 30 f.c.tabs.',
    genericName: 'metformin hydrochloride & glibenclamide (glyburide)',
    concentration: '5/500mg',
    price: 45,
    matchKeywords: ['glybofen 5/500', 'جليبوفين ٥/٥٠٠'],
    usage: 'جليبينكلاميد + ميتفورمين لضبط سكر النوع الثاني (قد يسبب هبوط سكر).',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('5/500mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(SULFONYLUREA_WARNINGS, METFORMIN_WARNINGS),
  },

  // 37
  {
    id: 'hi-glitazone-15mg-30-tab-dm1',
    name: 'Hi-glitazone 15mg 30 tab.',
    genericName: 'pioglitazone',
    concentration: '15mg',
    price: 75,
    matchKeywords: ['hi-glitazone 15', 'هاي جليتازون', '#glitazone'],
    usage: 'بيوجليتازون لتحسين مقاومة الإنسولين وضبط السكر (الجرعة ١٥–٤٥ مجم/يوم).',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('15mg (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: PIOGLITAZONE_WARNINGS,
  },

  // 38
  {
    id: 'empacoza-plus-25-5mg-30-fc-tabs-dm1',
    name: 'Empacoza plus 25/5mg 30 f.c tabs',
    genericName: 'empagliflozin & linagliptin',
    concentration: '25/5mg',
    price: 357,
    matchKeywords: ['empacoza plus 25/5', 'امباكوزا بلس', '#sglt2 inhibitor', '#dpp-4 inhibitors'],
    usage: 'إمباجليفلوزين + لينا جليبتين لضبط سكر النوع الثاني (تركيبة SGLT2 + DPP-4).',
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

  // 39
  {
    id: 'janaglip-plus-50-1000mg-28-fc-tabs-dm1',
    name: 'Janaglip plus 50/1000mg 28 f.c. tab.',
    genericName: 'metformin hydrochloride & sitagliptin',
    concentration: '50/1000mg',
    price: 172,
    matchKeywords: ['janaglip plus 50/1000', 'جاناجليب بلس'],
    usage: 'سيتاجليبتين + ميتفورمين لضبط سكر النوع الثاني (بديل).',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('٥٠ مجم (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(SITAGLIPTIN_WARNINGS, METFORMIN_WARNINGS),
  },

  // 40
  {
    id: 'januvia-100mg-28-fc-tab-dm1',
    name: 'Januvia 100mg 28 f.c. tab.',
    genericName: 'sitagliptin',
    concentration: '100mg',
    price: 510,
    matchKeywords: ['januvia 100', 'جانوفيا ١٠٠', '#dpp-4 inhibitors'],
    usage: 'سيتاجليبتين (DPP‑4) لضبط سكر النوع الثاني (عادة لا يسبب هبوط سكر وحده).',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('٥٠ مجم (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: SITAGLIPTIN_WARNINGS,
  },

  // 41
  {
    id: 'mellitofix-trio-25-5-1000mg-30-fc-tabs-dm1',
    name: 'Mellitofix trio 25/5/1000 mg 30 f.c. tabs.',
    genericName: 'empagliflozin & linagliptin & metformin hydrochloride',
    concentration: '25/5/1000mg',
    price: 486,
    matchKeywords: ['mellitofix trio', 'ميليتوفيكس تريو', 'triple therapy'],
    usage: 'تركيبة ثلاثية (إمباجليفلوزين + لينا جليبتين + ميتفورمين) لضبط سكر النوع الثاني عند الحاجة.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('25/5/1000mg (قرص) — مرة يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(SGLT2_WARNINGS, DPP4_WARNINGS, METFORMIN_WARNINGS),
  },

  // 42
  {
    id: 'unocron-mr-30mg-30-tabs-dm1',
    name: 'Unocron mr 30mg 30 tabs.',
    genericName: 'gliclazide',
    concentration: '30mg (MR)',
    price: 15.75,
    matchKeywords: ['unocron mr 30', 'يونكرون ٣٠', 'gliclazide'],
    usage: 'جليكلازيد ممتد المفعول لضبط سكر النوع الثاني (بديل اقتصادي).',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Prolonged Release Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('30mg (MR) (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: SULFONYLUREA_WARNINGS,
  },

  // 43
  {
    id: 'unocron-mr-60mg-30-tabs-dm1',
    name: 'Unocron mr 60mg 30 tabs.',
    genericName: 'gliclazide',
    concentration: '60mg (MR)',
    price: 60,
    matchKeywords: ['unocron mr 60', 'يونكرون ٦٠'],
    usage: 'جليكلازيد ممتد المفعول (جرعة أعلى) لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Prolonged Release Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('60mg (MR) (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: SULFONYLUREA_WARNINGS,
  },

  // 44
  {
    id: 'zanoglide-2-30mg-30-tab-dm1',
    name: 'Zanoglide 2/30 mg 30 tab',
    genericName: 'glimepiride & pioglitazone',
    concentration: '2/30mg',
    price: 93,
    matchKeywords: ['zanoglide 2/30', 'زانوجلايد 2/30'],
    usage: 'جليميبرايد + بيوجليتازون (جرعة جليميبرايد أقل) لتحسين التحكم في السكر مع مقاومة الإنسولين.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('2/30mg (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: mergeWarnings(SULFONYLUREA_WARNINGS, PIOGLITAZONE_WARNINGS),
  },

  // 45
  {
    id: 'dapablix-10mg-30-fc-tab-dm1',
    name: 'Dapablix 10mg 30 f.c. tab',
    genericName: 'dapagliflozin',
    concentration: '10mg',
    price: 186,
    matchKeywords: ['dapablix 10', 'دابابليكس', '#sglt2 inhibitor'],
    usage: 'داباجليفلوزين لضبط السكر وقد يفيد القلب/الكُلى حسب الحالة (بديل).',
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

  // 46
  {
    id: 'amaglust-4-30mg-30-scored-tab-dm1',
    name: 'Amaglust 4/30 mg 30 scored tab',
    genericName: 'glimepiride & pioglitazone',
    concentration: '4/30mg',
    price: 102,
    matchKeywords: ['amaglust 4/30', 'اماجلوست'],
    usage: 'جليميبرايد + بيوجليتازون لضبط السكر مع مقاومة الإنسولين.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Scored Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('4/30mg (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: mergeWarnings(SULFONYLUREA_WARNINGS, PIOGLITAZONE_WARNINGS),
  },

  // 47
  {
    id: 'faglozino-25mg-30-fc-tabs-dm1',
    name: 'Faglozino 25 mg 30 f.c.tabs.',
    genericName: 'empagliflozin',
    concentration: '25mg',
    price: 207,
    matchKeywords: ['faglozino 25', 'فاجلوزينو', '#sglt2 inhibitor'],
    usage: 'إمباجليفلوزين (SGLT2) لضبط السكر وقد يفيد القلب/الكُلى حسب الحالة.',
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

  // 48
  {
    id: 'empacoza-trio-10-5-1000mg-30-tabs-dm1',
    name: 'Empacoza trio 10/5/1000 mg 30 tabs',
    genericName: 'metformin hydrochloride & empagliflozin & linagliptin',
    concentration: '10/5/1000mg',
    price: 396,
    matchKeywords: ['empacoza trio 10/5/1000', 'امباكوزا تريو'],
    usage: 'تركيبة ثلاثية لضبط سكر النوع الثاني (SGLT2 + DPP‑4 + Metformin).',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('10/5/1000mg (قرص) — مرة يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(SGLT2_WARNINGS, DPP4_WARNINGS, METFORMIN_WARNINGS),
  },

  // 49
  {
    id: 'empacoza-trio-25-5-1000mg-30-tabs-dm1',
    name: 'Empacoza trio 25/5/1000 mg 30 tabs',
    genericName: 'empagliflozin & linagliptin & metformin hydrochloride',
    concentration: '25/5/1000mg',
    price: 396,
    matchKeywords: ['empacoza trio 25/5/1000', 'امباكوزا تريو ٢٥'],
    usage: 'تركيبة ثلاثية لضبط سكر النوع الثاني (SGLT2 ١٠ مجم في التركيبة).',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('25/5/1000mg (قرص) — مرة يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(SGLT2_WARNINGS, DPP4_WARNINGS, METFORMIN_WARNINGS),
  },

  // 50
  {
    id: 'dapablix-met-xr-10-1000mg-30-ext-rel-fc-tabs-dm1',
    name: 'Dapablix met xr 10 mg/ 1000 mg 30 ext. rel. f.c. tabs',
    genericName: 'dapagliflozin & metformin hydrochloride',
    concentration: '10/1000mg (XR)',
    price: 216,
    matchKeywords: ['dapablix met xr 10/1000', 'دابابليكس ميت اكس ار'],
    usage: 'داباجليفلوزين + ميتفورمين ممتد المفعول لضبط السكر مع ميزة فقدان وزن/حماية قلب حسب الحالة.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Sustained-release Film-coated Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('10/1000mg (XR) (قرص) — مرة يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(SGLT2_WARNINGS, METFORMIN_WARNINGS),
  },

  // 51
  {
    id: 'diaflozimet-10-1000mg-30-ext-rel-fc-tabs-dm1',
    name: 'Diaflozimet 10/1000 mg 30 ext. rel . f.c. tabs.',
    genericName: 'dapagliflozin & metformin hydrochloride',
    concentration: '10/1000mg (XR)',
    price: 258,
    matchKeywords: ['diaflozimet 10/1000', 'ديافلوزيمت'],
    usage: 'داباجليفلوزين + ميتفورمين ممتد المفعول لضبط السكر (بديل).',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Sustained-release Film-coated Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('10/1000mg (XR) (قرص) — مرة يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(SGLT2_WARNINGS, METFORMIN_WARNINGS),
  },

  // 52
  {
    id: 'diaflozimet-10-500mg-30-ext-rel-fc-tabs-dm1',
    name: 'Diaflozimet 10/500 mg 30 ext. rel . f.c. tabs.',
    genericName: 'dapagliflozin & metformin hydrochloride',
    concentration: '10/500mg (XR)',
    price: 258,
    matchKeywords: ['diaflozimet 10/500', 'ديافلوزيمت ٥٠٠'],
    usage: 'داباجليفلوزين + ميتفورمين ممتد المفعول (جرعة ميتفورمين أقل) لضبط السكر.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Sustained-release Film-coated Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('10/500mg (XR) (قرص) — مرة يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(SGLT2_WARNINGS, METFORMIN_WARNINGS),
  },

  // 53
  {
    id: 'diglifloz-10mg-30-fc-tabs-dm1',
    name: 'Diglifloz 10mg 30 f.c. tabs.',
    genericName: 'dapagliflozin',
    concentration: '10mg',
    price: 318,
    matchKeywords: ['diglifloz 10', 'ديجليفلوز ١٠'],
    usage: 'داباجليفلوزين لضبط السكر (SGLT2).',
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

  // 54
  {
    id: 'diglifloz-5mg-30-fc-tabs-dm1',
    name: 'Diglifloz 5mg 30 f.c. tabs.',
    genericName: 'dapagliflozin',
    concentration: '5mg',
    price: 183,
    matchKeywords: ['diglifloz 5', 'ديجليفلوز ٥'],
    usage: 'داباجليفلوزين ٥ مجم لضبط السكر (وقد يُزاد إلى ١٠ مجم حسب التحليل).',
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

  // 55
  {
    id: 'diglifloz-plus-5-1000mg-30-fc-tabs-dm1',
    name: 'Diglifloz plus 5/1000mg 30 f.c. tabs',
    genericName: 'dapagliflozin & metformin hydrochloride',
    concentration: '5/1000mg',
    price: 183,
    matchKeywords: ['diglifloz plus 5/1000', 'ديجليفلوز بلس'],
    usage: 'داباجليفلوزين + ميتفورمين لضبط السكر (تركيبة).',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('5/1000mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(SGLT2_WARNINGS, METFORMIN_WARNINGS),
  },

  // 56
  {
    id: 'gliptus-plus-50-500mg-30-tablets-dm1',
    name: 'Gliptus plus 50/500mg 30 tablets',
    genericName: 'vildagliptin & metformin hydrochloride',
    concentration: '50/500mg',
    price: 153,
    matchKeywords: ['gliptus plus 50/500', 'جليبتس بلس'],
    usage: 'فيلداجليبتين + ميتفورمين لضبط سكر النوع الثاني (بديل).',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('50/500mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(VILDAGLIPTIN_WARNINGS, METFORMIN_WARNINGS),
  },
];

export const GLUCOSE_LOWERING_AGENTS_1: Medication[] = GLUCOSE_LOWERING_AGENTS_1_RAW.map(enhanceGlucoseLoweringMedication);


