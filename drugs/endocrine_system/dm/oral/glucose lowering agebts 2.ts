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

  // Generics & common Arabic spellings / brand aliases
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
// Glucose lowering agents (oral) - list 2
// =========================
const GLUCOSE_LOWERING_AGENTS_2_RAW: Medication[] = [
  // 57
  {
    id: 'empacoza-10mg-30-fc-tabs-dm2',
    name: 'Empacoza 10 mg 30 f.c. tabs',
    genericName: 'empagliflozin',
    concentration: '10mg',
    price: 240,
    matchKeywords: ['empacoza 10', 'امباكوزا ١٠', '#sglt2 inhibitor', '#secretagogues'],
    usage: 'إمباجليفلوزين (SGLT2) لضبط سكر النوع الثاني وقد يفيد القلب/الكُلى حسب الحالة.',
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

  // 58
  {
    id: 'empacoza-25mg-30-fc-tabs-dm2',
    name: 'Empacoza 25 mg 30 f.c. tabs.',
    genericName: 'empagliflozin',
    concentration: '25mg',
    price: 240,
    matchKeywords: ['empacoza 25', 'امباكوزا ٢٥', '#sglt2 inhibitor', '#secretagogues'],
    usage: 'إمباجليفلوزين (SGLT2) جرعة أعلى لضبط سكر النوع الثاني حسب التشخيص والحالة.',
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

  // 59
  {
    id: 'forxiga-10mg-28-tabs-dm2',
    name: 'Forxiga 10mg 28 tabs.',
    genericName: 'dapagliflozin',
    concentration: '10mg',
    price: 602,
    matchKeywords: ['forxiga 10', 'فورسيجا', '#sglt2 inhibitor', '#secretagogues'],
    usage: 'داباجليفلوزين (SGLT2) لضبط السكر وقد يفيد قصور القلب/الكُلى حسب الحالة.',
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

  // 60
  {
    id: 'futavildix-50-850mg-30-fc-tabs-dm2',
    name: 'Futavildix 50/850 mg 30 f.c. tablets',
    genericName: 'metformin hydrochloride & vildagliptin',
    concentration: '50/850mg',
    price: 192,
    matchKeywords: ['futavildix 50/850', 'فوتافيلديكس', '#sensitizers', '#secretagogues'],
    usage: 'ميتفورمين + فيلداجليبتين لضبط سكر النوع الثاني (تركيبة).',
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

  // 61
  {
    id: 'glaptivia-plus-50-1000mg-30-fc-tab-dm2',
    name: 'Glaptivia plus 50/1000mg 30 f.c. tab.',
    genericName: 'sitagliptin & metformin hydrochloride',
    concentration: '50/1000mg',
    price: 168,
    matchKeywords: ['glaptivia plus 50/1000', 'جلابتيفيا بلس ١٠٠٠'],
    usage: 'سيتاجليبتين + ميتفورمين لضبط سكر النوع الثاني (بديل).',
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

  // 62
  {
    id: 'gleptomet-50-1000mg-30-fc-tabs-dm2',
    name: 'Gleptomet 50/1000mg 30 f.c.tabs.',
    genericName: 'sitagliptin & metformin hydrochloride',
    concentration: '50/1000mg',
    price: 157.5,
    matchKeywords: ['gleptomet 50/1000', 'جليبتوميت ١٠٠٠'],
    usage: 'سيتاجليبتين + ميتفورمين لضبط سكر النوع الثاني (بديل).',
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

  // 63
  {
    id: 'gleptomet-50-500mg-30-fc-tabs-dm2',
    name: 'Gleptomet 50/500mg 30 f.c.tabs.',
    genericName: 'sitagliptin & metformin hydrochloride',
    concentration: '50/500mg',
    price: 157.5,
    matchKeywords: ['gleptomet 50/500', 'جليبتوميت ٥٠٠'],
    usage: 'سيتاجليبتين + ميتفورمين (جرعة ميتفورمين أقل) لضبط سكر النوع الثاني.',
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

  // 64
  {
    id: 'gliptus-plus-50-1000mg-30-tabs-dm2',
    name: 'Gliptus plus 50/1000mg 30 tablets',
    genericName: 'metformin hydrochloride & vildagliptin',
    concentration: '50/1000mg',
    price: 192,
    matchKeywords: ['gliptus plus 50/1000', 'جليبتس بلس ١٠٠٠'],
    usage: 'ميتفورمين + فيلداجليبتين لضبط سكر النوع الثاني (بديل).',
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

  // 65
  {
    id: 'gliptus-plus-50-850mg-30-tabs-dm2',
    name: 'Gliptus plus 50/850mg 30 tablets',
    genericName: 'metformin hydrochloride & vildagliptin',
    concentration: '50/850mg',
    price: 192,
    matchKeywords: ['gliptus plus 50/850', 'جليبتس بلس ٨٥٠'],
    usage: 'ميتفورمين + فيلداجليبتين (850) لضبط سكر النوع الثاني.',
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

  // 66
  {
    id: 'glucovance-1000-5mg-30-fc-tab-dm2',
    name: 'Glucovance 1000/5mg 30 f.c.tab.',
    genericName: 'metformin hydrochloride & glibenclamide (glyburide)',
    concentration: '1000/5mg',
    price: 124,
    matchKeywords: ['glucovance 1000/5', 'جلوكوفانس ١٠٠٠/٥'],
    usage: 'ميتفورمين + جليبينكلاميد لضبط سكر النوع الثاني (قد يسبب هبوط سكر).',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('1000/5mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(SULFONYLUREA_WARNINGS, METFORMIN_WARNINGS),
  },

  // 67
  {
    id: 'glucovance-500-5mg-30-fc-tab-dm2',
    name: 'Glucovance 500/5mg 30 f.c.tab.',
    genericName: 'metformin hydrochloride & glibenclamide (glyburide)',
    concentration: '500/5mg',
    price: 74,
    matchKeywords: ['glucovance 500/5', 'جلوكوفانس ٥٠٠/٥'],
    usage: 'ميتفورمين + جليبينكلاميد لضبط سكر النوع الثاني (قد يسبب هبوط سكر).',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('500/5mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(SULFONYLUREA_WARNINGS, METFORMIN_WARNINGS),
  },

  // 68
  {
    id: 'glybofen-5-1000mg-30-fc-tabs-dm2',
    name: 'Glybofen 5/1000mg 30 f.c.tabs.',
    genericName: 'metformin hydrochloride & glibenclamide (glyburide)',
    concentration: '5/1000mg',
    price: 48,
    matchKeywords: ['glybofen 5/1000', 'جليبوفين ١٠٠٠'],
    usage: 'ميتفورمين + جليبينكلاميد لضبط سكر النوع الثاني (بديل اقتصادي).',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('5/1000mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(SULFONYLUREA_WARNINGS, METFORMIN_WARNINGS),
  },

  // 69
  {
    id: 'glybofen-5-850mg-30-fc-tab-dm2',
    name: 'Glybofen 5/850mg 30 f.c. tab.',
    genericName: 'glibenclamide (glyburide) & metformin hydrochloride',
    concentration: '5/850mg',
    price: 48,
    matchKeywords: ['glybofen 5/850', 'جليبوفين ٨٥٠'],
    usage: 'جليبينكلاميد + ميتفورمين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('5/850mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(SULFONYLUREA_WARNINGS, METFORMIN_WARNINGS),
  },

  // 70
  {
    id: 'icandra-50mg-30-tab-dm2',
    name: 'Icandra 50 mg 30 tab.',
    genericName: 'vildagliptin',
    concentration: '50mg',
    price: 118.5,
    matchKeywords: ['icandra 50', 'ايكاندرا', '#dpp-4 inhibitors'],
    usage: 'فيلداجليبتين (DPP‑4) لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('50mg (قرص) — مرتين يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: VILDAGLIPTIN_WARNINGS,
  },

  // 71
  {
    id: 'icandra-plus-50-1000mg-30-fc-tabs-dm2',
    name: 'Icandra plus 50/1000mg 30 f.c. tabs',
    genericName: 'vildagliptin & metformin hydrochloride',
    concentration: '50/1000mg',
    price: 192,
    matchKeywords: ['icandra plus 50/1000', 'ايكاندرا بلس'],
    usage: 'فيلداجليبتين + ميتفورمين لضبط سكر النوع الثاني (تركيبة).',
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

  // 72
  {
    id: 'jardiance-10mg-30-fc-tabs-dm2',
    name: 'Jardiance 10 mg 30 f.c. tabs.',
    genericName: 'empagliflozin',
    concentration: '10mg',
    price: 626,
    matchKeywords: ['jardiance 10', 'جارديانس ١٠', '#sglt2 inhibitor'],
    usage: 'إمباجليفلوزين (SGLT2) لضبط السكر وقد يفيد القلب/الكُلى حسب الحالة.',
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

  // 73
  {
    id: 'jardiance-25mg-30-fc-tabs-dm2',
    name: 'Jardiance 25 mg 30 f.c. tabs.',
    genericName: 'empagliflozin',
    concentration: '25mg',
    price: 626,
    matchKeywords: ['jardiance 25', 'جارديانس ٢٥', '#sglt2 inhibitor'],
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

  // 74
  {
    id: 'diacurimap-plus-25-5mg-30-fc-tabs-dm2',
    name: 'Diacurimap plus 25/5 mg 30 f.c. tabs.',
    genericName: 'empagliflozin & linagliptin',
    concentration: '25/5mg',
    price: 354,
    matchKeywords: ['diacurimap plus 25/5', 'دياكوريماب بلس'],
    usage: 'إمباجليفلوزين + لينا جليبتين لضبط سكر النوع الثاني.',
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

  // 75
  {
    id: 'maxophage-xr-1000mg-30-ext-rel-tabs-dm2',
    name: 'Maxophage xr 1000mg 30 ext. rel. tabs',
    genericName: 'metformin hydrochloride',
    concentration: '1000mg (XR)',
    price: 72,
    matchKeywords: ['maxophage xr 1000', 'ماكسوفاج اكس ار ١٠٠٠', '#biguanide'],
    usage: 'ميتفورمين ممتد المفعول لضبط السكر ومقاومة الإنسولين.',
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

  // 76
  {
    id: 'mellitofix-10mg-30-fc-tabs-dm2',
    name: 'Mellitofix 10mg 30 f.c. tabs',
    genericName: 'empagliflozin',
    concentration: '10mg',
    price: 204,
    matchKeywords: ['mellitofix 10', 'ميليتوفيكس ١٠'],
    usage: 'إمباجليفلوزين (SGLT2) لضبط السكر وقد يفيد القلب/الكُلى حسب الحالة.',
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

  // 77
  {
    id: 'mellitofix-met-12-5-1000mg-30-fc-tabs-dm2',
    name: 'Mellitofix met 12.5/1000 mg 30 f.c. tabs',
    genericName: 'empagliflozin & metformin hydrochloride',
    concentration: '12.5/1000mg',
    price: 214.5,
    matchKeywords: ['mellitofix met 12.5/1000', 'ميليتوفيكس ميت'],
    usage: 'إمباجليفلوزين + ميتفورمين لضبط السكر مع دعم فقدان وزن/حماية قلب حسب الحالة.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('12.5/1000mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(SGLT2_WARNINGS, METFORMIN_WARNINGS),
  },

  // 78
  {
    id: 'mellitofix-met-12-5-500mg-30-fc-tabs-dm2',
    name: 'Mellitofix met 12.5/500 mg 30 f.c. tabs',
    genericName: 'empagliflozin & metformin hydrochloride',
    concentration: '12.5/500mg',
    price: 193.5,
    matchKeywords: ['mellitofix met 12.5/500', 'ميليتوفيكس ميت ٥٠٠'],
    usage: 'إمباجليفلوزين + ميتفورمين (500) لضبط السكر.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('12.5/500mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(SGLT2_WARNINGS, METFORMIN_WARNINGS),
  },

  // 79
  {
    id: 'mellitofix-met-5-1000mg-30-fc-tabs-dm2',
    name: 'Mellitofix met 5/1000 mg 30 f.c. tabs',
    genericName: 'empagliflozin & metformin hydrochloride',
    concentration: '5/1000mg',
    price: 163.5,
    matchKeywords: ['mellitofix met 5/1000', 'ميليتوفيكس ميت ٥/١٠٠٠'],
    usage: 'إمباجليفلوزين + ميتفورمين لضبط السكر (بديل).',
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

  // 80
  {
    id: 'mellitofix-met-5-500mg-30-fc-tabs-dm2',
    name: 'Mellitofix met 5/500 mg 30 f.c. tabs',
    genericName: 'empagliflozin & metformin hydrochloride',
    concentration: '5/500mg',
    price: 118.5,
    matchKeywords: ['mellitofix met 5/500', 'ميليتوفيكس ميت ٥/٥٠٠'],
    usage: 'إمباجليفلوزين + ميتفورمين (500) لضبط السكر.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('5/500mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(SGLT2_WARNINGS, METFORMIN_WARNINGS),
  },

  // 81
  {
    id: 'linatraje-5mg-21-fc-tabs-dm2',
    name: 'Linatraje 5 mg 21 f.c.tabs.',
    genericName: 'linagliptin',
    concentration: '5mg',
    price: 180,
    matchKeywords: ['linatraje 5', 'ليناتراجي', '#dpp-4 inhibitors'],
    usage: 'لينا جليبتين (DPP‑4) لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('5mg (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: DPP4_WARNINGS,
  },

  // 82
  {
    id: 'synjardy-12-5-1000mg-60-fc-tabs-dm2',
    name: 'Synjardy 12.5/1000 mg 60 f.c. tabs.',
    genericName: 'metformin hydrochloride & empagliflozin',
    concentration: '12.5/1000mg',
    price: 870,
    matchKeywords: ['synjardy 12.5/1000', 'سينجاردي ١٠٠٠'],
    usage: 'إمباجليفلوزين + ميتفورمين لضبط السكر مع دعم فقدان وزن/حماية قلب حسب الحالة.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('12.5/1000mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(SGLT2_WARNINGS, METFORMIN_WARNINGS),
  },

  // 83
  {
    id: 'synjardy-12-5-850mg-60-fc-tabs-dm2',
    name: 'Synjardy 12.5/850 mg 60 f.c. tabs.',
    genericName: 'empagliflozin & metformin hydrochloride',
    concentration: '12.5/850mg',
    price: 570,
    matchKeywords: ['synjardy 12.5/850', 'سينجاردي ٨٥٠'],
    usage: 'إمباجليفلوزين + ميتفورمين (850) لضبط السكر.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('12.5/850mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(SGLT2_WARNINGS, METFORMIN_WARNINGS),
  },

  // 84
  {
    id: 'synjardy-5-1000mg-60-fc-tabs-dm2',
    name: 'Synjardy 5/1000 mg 60 f.c. tabs.',
    genericName: 'empagliflozin & metformin hydrochloride',
    concentration: '5/1000mg',
    price: 870,
    matchKeywords: ['synjardy 5/1000', 'سينجاردي ٥/١٠٠٠'],
    usage: 'إمباجليفلوزين + ميتفورمين لضبط السكر (بديل).',
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

  // 85
  {
    id: 'trajenta-5mg-30-tabs-dm2',
    name: 'Trajenta 5 mg 30 tabs.',
    genericName: 'linagliptin',
    concentration: '5mg',
    price: 501,
    matchKeywords: ['trajenta 5', 'تراجنتا', '#dpp-4 inhibitors'],
    usage: 'لينا جليبتين (DPP‑4) لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('5mg (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: DPP4_WARNINGS,
  },

  // 86
  {
    id: 'vildagluse-50mg-30-tabs-dm2',
    name: 'Vildagluse 50mg 30 tabs.',
    genericName: 'vildagliptin',
    concentration: '50mg',
    price: 126,
    matchKeywords: ['vildagluse 50', 'فيلداجلوز', '#dpp-4 inhibitors'],
    usage: 'فيلداجليبتين (DPP‑4) لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('50mg (قرص) — مرتين يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: VILDAGLIPTIN_WARNINGS,
  },

  // 87
  {
    id: 'futavildix-50-1000mg-30-fc-tabs-dm2',
    name: 'Futavildix 50/1000 mg 30 f.c. tabs.',
    genericName: 'metformin hydrochloride & vildagliptin',
    concentration: '50/1000mg',
    price: 192,
    matchKeywords: ['futavildix 50/1000', 'فوتافيلديكس ١٠٠٠'],
    usage: 'ميتفورمين + فيلداجليبتين (1000) لضبط سكر النوع الثاني.',
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

  // 88
  {
    id: 'gliflozamet-xr-12-5-1000mg-30-fc-tabs-dm2',
    name: 'Gliflozamet xr 12.5/1000 mg 30 f.c.tabs.',
    genericName: 'empagliflozin & metformin hydrochloride',
    concentration: '12.5/1000mg (XR)',
    price: 288,
    matchKeywords: ['gliflozamet xr 12.5/1000', 'جليفلوزاميت اكس ار'],
    usage: 'إمباجليفلوزين + ميتفورمين ممتد المفعول لضبط السكر.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Sustained-release Film-coated Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('12.5/1000mg (XR) (قرص) — مرة يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(SGLT2_WARNINGS, METFORMIN_WARNINGS),
  },

  // 89
  {
    id: 'gliflozamet-xr-25-1000mg-30-fc-tabs-dm2',
    name: 'Gliflozamet xr 25/1000 mg 30 f.c.tabs.',
    genericName: 'empagliflozin & metformin hydrochloride',
    concentration: '25/1000mg (XR)',
    price: 357,
    matchKeywords: ['gliflozamet xr 25/1000', 'جليفلوزاميت ٢٥'],
    usage: 'إمباجليفلوزين + ميتفورمين ممتد المفعول (جرعة SGLT2 أعلى) لضبط السكر.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Sustained-release Film-coated Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('25/1000mg (XR) (قرص) — مرة يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(SGLT2_WARNINGS, METFORMIN_WARNINGS),
  },

  // 90
  {
    id: 'gliflozino-10mg-30-fc-tabs-dm2',
    name: 'Gliflozino 10mg 30 f.c.tabs',
    genericName: 'dapagliflozin',
    concentration: '10mg',
    price: 214.5,
    matchKeywords: ['gliflozino 10', 'جليفلوزينو ١٠'],
    usage: 'داباجليفلوزين (SGLT2) بديل لضبط السكر.',
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

  // 91
  {
    id: 'gliflozino-5mg-30-fc-tabs-dm2',
    name: 'Gliflozino 5mg 30 f.c.tabs',
    genericName: 'dapagliflozin',
    concentration: '5mg',
    price: 144,
    matchKeywords: ['gliflozino 5', 'جليفلوزينو ٥'],
    usage: 'داباجليفلوزين (جرعة أقل) لضبط السكر حسب التشخيص والحالة.',
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

  // 92
  {
    id: 'empacoza-plus-10-5mg-30-fc-tabs-dm2',
    name: 'Empacoza plus 10/5mg 30 f.c tabs',
    genericName: 'empagliflozin & linagliptin',
    concentration: '10/5mg',
    price: 357,
    matchKeywords: ['empacoza plus 10/5', 'امباكوزا بلس ١٠/٥'],
    usage: 'إمباجليفلوزين + لينا جليبتين لضبط سكر النوع الثاني.',
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

  // 93
  {
    id: 'forflozin-plus-10-1000mg-30-ext-rel-fc-tabs-dm2',
    name: 'Forflozin plus 10/1000 mg 30 ext. rel . f.c. tabs.',
    genericName: 'dapagliflozin & metformin hydrochloride',
    concentration: '10/1000mg (XR)',
    price: 306,
    matchKeywords: ['forflozin plus 10/1000', 'فورفلوزين بلس'],
    usage: 'داباجليفلوزين + ميتفورمين ممتد المفعول لضبط السكر.',
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

  // 94
  {
    id: 'diglifloz-plus-5-850mg-30-fc-tabs-dm2',
    name: 'Diglifloz plus 5/850mg 30 f.c. tabs',
    genericName: 'dapagliflozin & metformin hydrochloride',
    concentration: '5/850mg',
    price: 159,
    matchKeywords: ['diglifloz plus 5/850', 'ديجليفلوز بلس ٨٥٠'],
    usage: 'داباجليفلوزين + ميتفورمين لضبط السكر (تركيبة).',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('5/850mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(SGLT2_WARNINGS, METFORMIN_WARNINGS),
  },

  // 95
  {
    id: 'dapablix-10mg-10-fc-tabs-na-dm2',
    name: 'Dapablix 10 mg 10 f.c.tabs.(n/a)',
    genericName: 'dapagliflozin',
    concentration: '10mg',
    price: 71.5,
    matchKeywords: ['dapablix 10', 'دابابليكس ١٠', 'n/a'],
    usage: 'داباجليفلوزين (SGLT2) لضبط السكر (عبوة 10 أقراص).',
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

  // 96
  {
    id: 'mellitofix-trio-10-5-1000mg-30-fc-tabs-dm2',
    name: 'Mellitofix trio 10/5/1000 mg 30 f.c. tabs.',
    genericName: 'empagliflozin & linagliptin & metformin hydrochloride',
    concentration: '10/5/1000mg',
    price: 486,
    matchKeywords: ['mellitofix trio 10/5/1000', 'ميليتوفيكس تريو ١٠'],
    usage: 'تركيبة ثلاثية لضبط سكر النوع الثاني (SGLT2 + DPP‑4 + Metformin).',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('10/5/1000mg (قرص) — مرة يومياً — مع/بعد الأكل — مزمن.'),
    warnings: mergeWarnings(SGLT2_WARNINGS, DPP4_WARNINGS, METFORMIN_WARNINGS),
  },

  // 97
  {
    id: 'vanvilda-plus-50-1000mg-30-tabs-dm2',
    name: 'Vanvilda plus 50/1000 mg 30 tabs.',
    genericName: 'vildagliptin & metformin hydrochloride',
    concentration: '50/1000mg',
    price: 138,
    matchKeywords: ['vanvilda plus 50/1000', 'فانفيلدا بلس'],
    usage: 'فيلداجليبتين + ميتفورمين لضبط سكر النوع الثاني (بديل اقتصادي).',
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

  // 98
  {
    id: 'vanvilda-plus-50-500mg-30-tabs-dm2',
    name: 'Vanvilda plus 50/500 mg 30 tabs.',
    genericName: 'vildagliptin & metformin hydrochloride',
    concentration: '50/500mg',
    price: 129,
    matchKeywords: ['vanvilda plus 50/500', 'فانفيلدا ٥٠٠'],
    usage: 'فيلداجليبتين + ميتفورمين (500) لضبط سكر النوع الثاني.',
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

  // 99
  {
    id: 'vanvilda-plus-50-850mg-30-tabs-dm2',
    name: 'Vanvilda plus 50/850 mg 30 tabs.',
    genericName: 'vildagliptin & metformin hydrochloride',
    concentration: '50/850mg',
    price: 132,
    matchKeywords: ['vanvilda plus 50/850', 'فانفيلدا ٨٥٠'],
    usage: 'فيلداجليبتين + ميتفورمين (850) لضبط سكر النوع الثاني.',
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

  // 100
  {
    id: 'bioglita-plus-15-850mg-20-fc-tabs-dm2',
    name: 'Bioglita plus 15/850mg 20 f.c.tabs',
    genericName: 'metformin hydrochloride & pioglitazone',
    concentration: '15/850mg',
    price: 74,
    matchKeywords: ['bioglita plus 15/850', 'بيوجليتا بلس'],
    usage: 'ميتفورمين + بيوجليتازون لتحسين مقاومة الإنسولين وضبط السكر (حسب التشخيص والحالة).',
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

  // 101
  {
    id: 'bioglita-plus-15-500mg-20-fc-tabs-dm2',
    name: 'Bioglita plus 15/500mg 20 f.c.tabs.',
    genericName: 'metformin hydrochloride & pioglitazone',
    concentration: '15/500mg',
    price: 50,
    matchKeywords: ['bioglita plus 15/500', 'بيوجليتا ٥٠٠'],
    usage: 'ميتفورمين + بيوجليتازون (جرعة ميتفورمين أقل) لضبط السكر.',
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

  // 102
  {
    id: 'dapaglif-10mg-14-fc-tabs-dm2',
    name: 'Dapaglif 10mg 14 f.c. tabs',
    genericName: 'dapagliflozin',
    concentration: '10mg',
    price: 178,
    matchKeywords: ['dapaglif 10', 'داباجليف', '#sglt2 inhibitor'],
    usage: 'داباجليفلوزين (SGLT2) لضبط السكر (عبوة 14 قرص).',
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

  // 103
  {
    id: 'sitagliform-50-500mg-30-fc-tabs-dm2',
    name: 'Sitagliform 50/500mg 30 f.c. tabs.',
    genericName: 'sitagliptin & metformin hydrochloride',
    concentration: '50/500mg',
    price: 207,
    matchKeywords: ['sitagliform 50/500', 'سيتاجليفورم'],
    usage: 'سيتاجليبتين + ميتفورمين لضبط سكر النوع الثاني (تركيبة).',
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

  // 104
  {
    id: 'cidophage-1000mg-20-fc-tabs-dm2',
    name: 'Cidophage 1000mg 20 f.c. tabs',
    genericName: 'metformin',
    concentration: '1000mg',
    price: 51,
    matchKeywords: ['cidophage 1000', 'سيدوفاج ١٠٠٠'],
    usage: 'ميتفورمين لضبط سكر النوع الثاني ومقاومة الإنسولين (عبوة 20 قرص).',
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

  // 105
  {
    id: 'cidophage-500mg-10-tab-dm2',
    name: 'Cidophage 500mg 10 tab',
    genericName: 'metformin hydrochloride',
    concentration: '500mg',
    price: 11,
    matchKeywords: ['cidophage 500', 'سيدوفاج ٥٠٠'],
    usage: 'ميتفورمين (عبوة 10 أقراص) لضبط السكر ومقاومة الإنسولين.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 120,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: fixed('500mg (قرص) — مرتين يومياً — مع/بعد الأكل — مزمن.'),
    warnings: METFORMIN_WARNINGS,
  },

  // 106
  {
    id: 'diabenor-2mg-30-tabs-dm2',
    name: 'Diabenor 2 mg 30 tabs.',
    genericName: 'glimepiride',
    concentration: '2mg',
    price: 36,
    matchKeywords: ['diabenor 2', 'ديابنور ٢', '#sulfonylurea', '#secretagogues'],
    usage: 'جليميبرايد لضبط سكر النوع الثاني (بديل اقتصادي).',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('2mg (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: SULFONYLUREA_WARNINGS,
  },

  // 107
  {
    id: 'diabetonorm-45mg-15-tab-dm2',
    name: 'Diabetonorm 45mg 15 tab',
    genericName: 'pioglitazone',
    concentration: '45mg',
    price: 50,
    matchKeywords: ['diabetonorm 45', 'ديابتونورم', '#glitazone'],
    usage: 'بيوجليتازون (جرعة 45mg) لتحسين مقاومة الإنسولين وضبط السكر (حسب التشخيص والحالة).',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('45mg (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: PIOGLITAZONE_WARNINGS,
  },

  // 108
  {
    id: 'diavance-5-500mg-30-fc-tab-dm2',
    name: 'Diavance 5/500mg 30 f.c.tab.',
    genericName: 'glibenclamide (glyburide) & metformin hydrochloride',
    concentration: '5/500mg',
    price: 51,
    matchKeywords: ['diavance 5/500', 'ديافانس'],
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

  // 109
  {
    id: 'dolcyl-2mg-30-tab-dm2',
    name: 'Dolcyl 2mg 30 tab.',
    genericName: 'glimepiride',
    concentration: '2mg',
    price: 48,
    matchKeywords: ['dolcyl 2', 'دولسيل ٢'],
    usage: 'جليميبرايد لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('2mg (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: SULFONYLUREA_WARNINGS,
  },

  // 110
  {
    id: 'dolcyl-4mg-30-tab-dm2',
    name: 'Dolcyl 4mg 30 tab.',
    genericName: 'glimepiride',
    concentration: '4mg',
    price: 69,
    matchKeywords: ['dolcyl 4', 'دولسيل ٤'],
    usage: 'جليميبرايد (جرعة أعلى) لضبط سكر النوع الثاني.',
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

  // 111
  {
    id: 'dolcyl-6mg-30-tab-dm2',
    name: 'Dolcyl 6mg 30 tab.',
    genericName: 'glimepiride',
    concentration: '6mg',
    price: 87,
    matchKeywords: ['dolcyl 6', 'دولسيل ٦'],
    usage: 'جليميبرايد (جرعة 6mg) لضبط سكر النوع الثاني حسب التشخيص والحالة.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('6mg (قرص) — مرة يومياً — قبل الأكل — مزمن.'),
    warnings: SULFONYLUREA_WARNINGS,
  },

  // 112
  {
    id: 'galvus-50mg-28-tabs-dm2',
    name: 'Galvus 50 mg 28 tabs.',
    genericName: 'vildagliptin',
    concentration: '50mg',
    price: 222,
    matchKeywords: ['galvus 50', 'جالفس', '#dpp-4 inhibitors'],
    usage: 'فيلداجليبتين لضبط سكر النوع الثاني.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('50mg (قرص) — مرتين يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: VILDAGLIPTIN_WARNINGS,
  },

  // 113
  {
    id: 'glaptivia-100mg-30-fc-tab-dm2',
    name: 'Glaptivia 100mg 30 f.c. tab.',
    genericName: 'sitagliptin',
    concentration: '100mg',
    price: 303,
    matchKeywords: ['glaptivia 100', 'جلابتيفيا ١٠٠', '#dpp-4 inhibitors'],
    usage: 'سيتاجليبتين (DPP‑4) لضبط سكر النوع الثاني.',
    timing: 'مرة يومياً – مزمن',
    category: Category.DIABETES,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('100mg (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: SITAGLIPTIN_WARNINGS,
  },
];

export const GLUCOSE_LOWERING_AGENTS_2: Medication[] = GLUCOSE_LOWERING_AGENTS_2_RAW.map(enhanceGlucoseLoweringMedication);


