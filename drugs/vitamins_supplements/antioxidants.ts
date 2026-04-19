
import { Medication, Category } from '../../types';

// Helper to convert numbers to Arabic numerals
const toAr = (n: number | string) => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d, 10)]);
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

// =========================
// Common warnings (patient-facing)
// =========================
const GENERAL_SUPPLEMENT_WARNINGS = [
  'لا تتجاوز الجرعة اليومية الموصى بها.',
  'إذا كنتِ حامل/مرضع أو لديك مرض مزمن أو تتناول أدوية ثابتة: راجع الجرعة والتداخلات قبل الاستخدام.',
];

const ZINC_WARNINGS = [
  ...GENERAL_SUPPLEMENT_WARNINGS,
  'افصل ساعتين عن المضادات الحيوية (تتراسيكلين/كينولون) لتجنب تقليل الامتصاص.',
];

const FAT_SOLUBLE_VIT_WARNINGS = [
  ...GENERAL_SUPPLEMENT_WARNINGS,
  'تجنب الجمع مع مكملات أخرى تحتوي على فيتامين A أو E بجرعات عالية.',
  'الحمل: تجنب الجرعات العالية من فيتامين A إلا حسب التشخيص.',
];

const OMEGA3_WARNINGS = [
  ...GENERAL_SUPPLEMENT_WARNINGS,
  'يُستخدم بحذر مع أدوية السيولة أو قبل العمليات.',
  'تحسس السمك/المأكولات البحرية: استخدم بحذر.',
];

const COQ10_WARNINGS = [
  ...GENERAL_SUPPLEMENT_WARNINGS,
  'قد يُخفض ضغط الدم قليلاً عند بعض الأشخاص.',
  'قد يتداخل مع أدوية السيولة (مثل الوارفارين)؛ تابع INR إذا لزم.',
];

const ALA_WARNINGS = [
  ...GENERAL_SUPPLEMENT_WARNINGS,
  'قد يُخفض سكر الدم؛ مرضى السكر يراقبوا السكر خصوصاً في البداية.',
  'قد يسبب غثيان/حموضة؛ إذا سبب تهيج معدة يمكن تناوله بعد الأكل.',
];

const ALA_EMPTY_STOMACH_WARNINGS = [
  ...ALA_WARNINGS,
  'لأفضل امتصاص: يُفضل قبل الأكل بنصف ساعة ويفضل فصل ساعتين عن مكملات المعادن (حديد/كالسيوم/ماغنسيوم).',
];

const CARNITINE_WARNINGS = [
  ...GENERAL_SUPPLEMENT_WARNINGS,
  'قد يسبب اضطراب معدة/إسهال أو رائحة سمكية للعرق/البول (طبيعي).',
  'يُستخدم بحذر مع مرضى الصرع أو من لديهم تاريخ نوبات.',
];

const GINKGO_WARNINGS = [
  ...GENERAL_SUPPLEMENT_WARNINGS,
  'قد يزيد قابلية النزف عند بعض الأشخاص (جينكو بيلوبا)؛ يُستخدم بحذر مع أدوية السيولة أو قبل العمليات.',
];

const MELATONIN_WARNINGS = [
  ...GENERAL_SUPPLEMENT_WARNINGS,
  'قد يسبب نعاساً؛ تجنب القيادة بعد تناوله.',
  'يُستخدم بحذر مع الحمل/الرضاعة، ومع مضادات التجلط أو أدوية المناعة.',
];

const NAC_WARNINGS = [
  ...GENERAL_SUPPLEMENT_WARNINGS,
  'قد يسبب غثيان/حموضة؛ يفضل بعد الأكل.',
  'مرضى الربو: قد يزيد الكحة/الصفير؛ استخدم بحذر.',
];

const CAFFEINE_WARNINGS = [
  ...GENERAL_SUPPLEMENT_WARNINGS,
  'قد يسبب خفقان/قلق/أرق (يحتوي على كافيين).',
  'يُتجنب مع الضغط غير المنضبط، اضطراب النظم، ومع اقتراب وقت النوم.',
];

const TOPICAL_WARNINGS = [
  'للاستخدام الخارجي فقط.',
  'تجنب ملامسة العينين/الفم.',
  'أوقفه إذا سبب تهيجاً شديداً.',
];

const EYE_DROP_WARNINGS = [
  'لا تلمس طرف القطارة للعين.',
  'إذا كنت ترتدي عدسات: انزعها قبل الاستخدام وأعدها بعد ١٥ دقيقة.',
  'أوقفه وأعد التقييم إذا حدث ألم شديد/احمرار شديد/تدهور نظر.',
];

const INJECTION_WARNINGS = [
  'للاستخدام في منشأة صحية.',
  'يُحقن/يُعطى ببطء لتقليل الأعراض الجانبية.',
  'قد يسبب حساسية؛ اطلب مساعدة طبية إذا حدث تورم/ضيق نفس/طفح شديد.',
];

// =========================
// Keyword & instruction enhancement (similar idea to antipsychotic enhancer)
// =========================
const antioxidantKeywordBoost = (m: Medication) => {
  const g = (m.genericName || '').toString().toLowerCase();
  const n = (m.name || '').toString().toLowerCase();

  const base = [
    '#antioxidants',
    'antioxidant',
    'antioxidants',
    'anti oxidant',
    'anti-oxidant',
    'oxidative stress',
    'free radicals',
    'مضاد اكسدة',
    'مضاد أكسدة',
    'مضادات اكسدة',
    'مضادات أكسدة',
    'اكسدة',
    'أكسدة',
    'جذور حرة',
  ];

  const dose = (m.concentration || '').toString();
  const doseAr = dose ? toAr(dose) : '';
  const dosePlain = dose.replace(/\s+/g, '').replace(/\./g, '').toLowerCase();

  const boost: string[] = [];

  // Alpha lipoic / thioctic acid group (neuropathy)
  if (
    g.includes('thioctic') ||
    g.includes('alpha lipoic') ||
    g.includes('lipoic') ||
    n.includes('thiotacid') ||
    n.includes('thiotex') ||
    n.includes('thiodio') ||
    n.includes('alphanerve') ||
    n.includes('nirakuat') ||
    n.includes('rozonethio') ||
    n.includes('brovitacan') ||
    n.includes('alphavim') ||
    n.includes('corvibeak')
  ) {
    boost.push(
      'alpha lipoic acid',
      'alpha-lipoic acid',
      'thioctic acid',
      'thiotic acid',
      'ala',
      'حمض ألفا ليبويك',
      'الفا ليبويك',
      'حمض ثيوكتيك',
      'ثيوكتيك',
      'التهاب اعصاب',
      'اعتلال الأعصاب',
      'اعتلال الأعصاب السكري',
      'diabetic neuropathy',
      'neuropathy',
      'nerve pain',
      'numbness',
      'tingling',
      'تنميل',
      'شكشكة',
      'حرقان',
      'ألم أعصاب'
    );
  }

  // CoQ10 group
  if (g.includes('coenzyme') || g.includes('q10') || n.includes('q10') || n.includes('coenzyme')) {
    boost.push(
      'coenzyme q10',
      'co-enzyme q10',
      'coenzyme q-10',
      'ubiquinone',
      'q10',
      'كو انزيم',
      'كوإنزيم',
      'كيو 10',
      'كيو ١٠',
      'عضلة القلب',
      'heart',
      'cardiac',
      'statin',
      'myalgia',
      'fatigue',
      'طاقة',
      'ارهاق'
    );
  }

  // Carnitine group
  if (g.includes('carnitine') || g.includes('levocarnitine') || n.includes('carnit') || n.includes('carnivita') || n.includes('fertitonex') || n.includes('carnisight')) {
    boost.push(
      'l-carnitine',
      'l carnitine',
      'levocarnitine',
      'carnitine',
      'كارنيتين',
      'ليفو كارنيتين',
      'خصوبة',
      'male fertility',
      'sperm',
      'حيوانات منوية',
      'ضعف حركة الحيوانات المنوية',
      'energy',
      'fatigue',
      'حرق دهون'
    );
  }

  // Eye antioxidants
  if (g.includes('lutein') || g.includes('zeax') || n.includes('vigoton')) {
    boost.push('lutein', 'zeaxanthin', 'eye', 'vision', 'شبكية', 'ضمور البقعة', 'نظر');
  }

  // Melatonin
  if (g.includes('melatonin') || n.includes('melaton')) {
    boost.push('melatonin', 'sleep', 'insomnia', 'ميلاتونين', 'أرق', '#sleep aid');
  }

  // NAC
  if (g.includes('acetyl') || g.includes('n-acetyl') || n.includes('acetothyme')) {
    boost.push('n-acetylcysteine', 'acetylcysteine', 'nac', 'mucolytic', 'phlegm', 'بلغم', 'مذيب بلغم', '#mucolytic');
  }

  // Glutathione / skin
  if (g.includes('glutathione') || n.includes('vee white')) {
    boost.push('glutathione', 'gsh', 'جلوتاثيون', 'تفتيح', 'whitening');
  }

  // Eye drops / lubricant
  if (n.includes('navitae')) {
    boost.push('dry eye', 'lubricant', 'eye drops', 'tear substitute', 'hyaluronate', 'جفاف العين', 'ترطيب العين', '#lubricant');
  }

  return uniq([...base, ...boost, dose, dosePlain, doseAr, m.name, m.genericName]);
};

const enhanceAntioxidantMedication = (m: Medication): Medication => ({
  ...m,
  matchKeywords: uniq([...(m.matchKeywords || []), ...antioxidantKeywordBoost(m)]),
});

// =========================
// Antioxidants list (replace all previous items)
// =========================
const ANTIOXIDANTS_RAW: Medication[] = [
  // 1
  {
    id: 'thiotacid-compound-600mg-20-tab-antiox',
    name: 'Thiotacid compound 600mg 20 tab.',
    genericName: 'thioctic acid & vitamin b1 & vitamin b12',
    concentration: '600mg',
    price: 166,
    matchKeywords: ['thiotacid compound', 'thiotacid', 'ثيوتاسيد', 'ثيوتاسيد كومباوند', 'اعصاب السكر', 'diabetic neuropathy', '#antioxidants'],
    usage: 'مضاد أكسدة ومقوّي للأعصاب لعلاج التهاب/اعتلال الأعصاب الطرفية (خصوصاً أعصاب السكر).',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً.'),
    warnings: ALA_EMPTY_STOMACH_WARNINGS,
  },

  // 2
  {
    id: 'coenzyme-q10-30mg-20-caps-antiox',
    name: 'Coenzyme q10 30 mg 20 caps.',
    genericName: 'co enzyme q10',
    concentration: '30mg',
    price: 40,
    matchKeywords: ['coenzyme q10 30', 'coq10 30', 'q10 30', 'كو انزيم كيو 10', 'statin', 'myalgia', 'عضلات', 'قلب', '#antioxidants'],
    usage: 'مضاد أكسدة لدعم عضلة القلب والطاقة، وقد يفيد في آلام العضلات مع أدوية الكوليسترول.',
    timing: 'مرة إلى مرتين يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsule',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً، ويمكن مرتين يومياً حسب الحاجة.'),
    warnings: COQ10_WARNINGS,
  },

  // 3
  {
    id: 'coenzyme-q10-forte-100mg-20-caps-antiox',
    name: 'Coenzyme q10 forte 100 mg 20 caps.',
    genericName: 'co enzyme q10',
    concentration: '100mg',
    price: 60,
    matchKeywords: ['coenzyme q10 forte', 'coq10 100', 'q10 100', 'كو انزيم فورت', 'طاقة', 'fatigue', '#antioxidants'],
    usage: 'CoQ10 بتركيز أعلى لدعم الطاقة وصحة القلب.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsule',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً.'),
    warnings: COQ10_WARNINGS,
  },

  // 4
  {
    id: 'thiotacid-compound-600mg-30-fc-caplets-antiox',
    name: 'Thiotacid compound 600 mg 30 f.c.caplets',
    genericName: 'thioctic acid (alpha lipoic acid) & vitamin b1 (thiamine) & vitamin b12',
    concentration: '600mg',
    price: 249,
    matchKeywords: ['thiotacid compound 30', 'thiotacid 600 compound', 'ثيوتاسيد كومباوند ٣٠', 'اعصاب', 'تنميل', '#antioxidants'],
    usage: 'مضاد أكسدة ومقوّي للأعصاب (ALA + فيتامينات ب) لاعتلال الأعصاب.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Caplet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً.'),
    warnings: ALA_EMPTY_STOMACH_WARNINGS,
  },

  // 5
  {
    id: 'octatron-20-caps-antiox',
    name: 'Octatron 20 caps',
    genericName: 'vitamin a & d-alpha-tocopheryl acid succinate & d-alpha-tocopherol',
    concentration: '20 caps',
    price: 50.7,
    matchKeywords: ['octatron', 'اوكتاترون', 'vitamin a', 'vitamin e', 'immunity', 'مناعة', 'skin', 'بشرة', '#antioxidants'],
    usage: 'مضاد أكسدة (فيتامين A + فيتامين E) لدعم المناعة وصحة الجلد.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsule',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً بعد الأكل.'),
    warnings: FAT_SOLUBLE_VIT_WARNINGS,
  },

  // 6
  {
    id: 'octatron-30-caps-antiox',
    name: 'Octatron 30 caps',
    genericName: 'vitamin a & d-alpha-tocopheryl acid succinate & d-alpha-tocopherol',
    concentration: '30 caps',
    price: 135,
    matchKeywords: ['octatron 30', 'اوكتاترون ٣٠', 'vitamin a', 'vitamin e', 'immunity', 'مناعة', '#antioxidants'],
    usage: 'مضاد أكسدة (فيتامين A + فيتامين E) لدعم المناعة وصحة الجلد.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsule',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً بعد الأكل.'),
    warnings: FAT_SOLUBLE_VIT_WARNINGS,
  },

  // 7
  {
    id: 'fertitonex-30-caps-antiox',
    name: 'Fertitonex 30 caps',
    genericName: 'l-carnitine & l-arginine & vitamin b6 & vitamin b12 & vitamin c',
    concentration: '30 caps',
    price: 300,
    matchKeywords: ['fertitonex', 'فيرتيتونكس', 'fertility', 'male fertility', 'خصوبة رجال', 'حيوانات منوية', '#antioxidants', '#infertility'],
    usage: 'مضاد أكسدة وداعم للخصوبة والطاقة (كارنيتين + أرجنين + فيتامينات).',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsule',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً بعد الأكل.'),
    warnings: CARNITINE_WARNINGS,
  },

  // 8
  {
    id: 'thiotacid-600-original-30-tab-antiox',
    name: 'Thiotacid 600 original 30 tab.',
    genericName: 'thioctic acid (alpha lipoic acid)',
    concentration: '600mg',
    price: 245,
    matchKeywords: ['thiotacid 600 original 30', 'thiotacid 600', 'ثيوتاسيد ٦٠٠', 'اعصاب', 'تنميل', '#antioxidants'],
    usage: 'ألفا ليبويك أسيد (ALA) مضاد أكسدة لعلاج/دعم التهاب الأعصاب الطرفية.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً.'),
    warnings: ALA_EMPTY_STOMACH_WARNINGS,
  },

  // 9
  {
    id: 'thiotacid-compound-300mg-30-caps-antiox',
    name: 'Thiotacid compound 300mg 30 caps',
    genericName: 'alpha lipoic acid & vitamin b1 (thiamine) & cyanocobalamin',
    concentration: '300mg',
    price: 168,
    matchKeywords: ['thiotacid compound 300', 'ثيوتاسيد كومباوند ٣٠٠', 'neuropathy', 'اعصاب', 'تنميل', '#antioxidants'],
    usage: 'مضاد أكسدة ومقوّي للأعصاب (ALA + B1 + B12) لاعتلال الأعصاب.',
    timing: 'مرتين يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsule',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('كبسولة مرتين يومياً.'),
    warnings: ALA_EMPTY_STOMACH_WARNINGS,
  },

  // 10
  {
    id: 'thiotacid-600-original-20-fc-tabs-antiox',
    name: 'Thiotacid 600 original 20 f.c. tabs',
    genericName: 'thioctic acid (alpha lipoic acid)',
    concentration: '600mg',
    price: 108,
    matchKeywords: ['thiotacid 600 original 20', 'ثيوتاسيد ٢٠', 'ala 600', 'اعصاب', 'تنميل', '#antioxidants'],
    usage: 'ألفا ليبويك أسيد (ALA) مضاد أكسدة لاعتلال الأعصاب الطرفية.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً.'),
    warnings: ALA_EMPTY_STOMACH_WARNINGS,
  },

  // 11
  {
    id: 'alphavim-600-20-caps-antiox',
    name: 'Alphavim 600 - 20 caps.',
    genericName: 'thioctic acid & vitamin b12 & vitamin b6 & folic acid & ginkgo biloba',
    concentration: '600mg',
    price: 290,
    matchKeywords: ['alphavim 600', 'الفافيم ٦٠٠', 'ginkgo', 'folic', 'neuropathy', 'تنميل', '#antioxidants'],
    usage: 'مضاد أكسدة ومقوّي للأعصاب مع فيتامينات ب + جينكو (لدعم الأعصاب والدورة الدموية الطرفية).',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً.'),
    warnings: [...ALA_WARNINGS, ...GINKGO_WARNINGS],
  },

  // 12
  {
    id: 'l-carnitine-300mgml-syrup-30ml-antiox',
    name: 'L-carnitine 300mg/ml syrup 30ml',
    genericName: 'l-carnitine',
    concentration: '300mg/ml',
    price: 70,
    matchKeywords: ['l-carnitine syrup', 'كارنيتين شراب', '300mg/ml', 'hypotonia', 'ارتخاء', 'ضعف عضلات', '#antioxidants'],
    usage: 'شراب كارنيتين لدعم نقص الكارنيتين/ارتخاء العضلات (خصوصاً للأطفال) حسب التشخيص.',
    timing: 'يومياً (مقسمة).',
    category: Category.VITAMINS_MINERALS,
    form: 'Syrup',
    minAgeMonths: 0,
    maxAgeMonths: 216,
    minWeight: 2.5,
    maxWeight: 80,
    // Dose: 50 mg/kg/day. Concentration: 300mg/1ml. Total ml/day = weight/6.
    calculationRule: (w) => `${toAr((w / 6).toFixed(1))} مل يومياً`,
    warnings: CARNITINE_WARNINGS,
  },

  // 13
  {
    id: 'l-carnitine-plus-20-fc-tab-antiox',
    name: 'L-carnitine plus 20 f.c. tab',
    genericName: 'l-carnitine l-tartarate & zinc gluconate',
    concentration: '20 tabs',
    price: 116,
    matchKeywords: ['l-carnitine plus', 'كارنيتين بلس', 'zinc', 'fertility', 'خصوبة', '#antioxidants'],
    usage: 'كارنيتين + زنك لدعم الخصوبة والطاقة والعضلات.',
    timing: 'مرتين يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'F.C. Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد مرتين يومياً بعد الأكل.'),
    warnings: [...CARNITINE_WARNINGS, ...ZINC_WARNINGS],
  },

  // 14
  {
    id: 'thiotacid-300mg-30-tab-antiox',
    name: 'Thiotacid 300mg 30 tab.',
    genericName: 'thioctic acid (alpha lipoic acid)',
    concentration: '300mg',
    price: 150,
    matchKeywords: ['thiotacid 300', 'ثيوتاسيد ٣٠٠', 'ala 300', 'neuropathy', 'تنميل', '#antioxidants'],
    usage: 'ألفا ليبويك أسيد ٣٠٠ مجم مضاد أكسدة لاعتلال الأعصاب.',
    timing: 'مرتين يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد مرتين يومياً.'),
    warnings: ALA_EMPTY_STOMACH_WARNINGS,
  },

  // 15
  {
    id: 'thiotacid-600mg-20-fc-tab-antiox',
    name: 'Thiotacid 600mg 20 f.c.tab',
    genericName: 'thioctic acid (alpha lipoic acid)',
    concentration: '600mg',
    price: 67.5,
    matchKeywords: ['thiotacid 600 20', 'ثيوتاسيد ٦٠٠ ٢٠', 'ala', 'اعصاب', 'تنميل', '#antioxidants'],
    usage: 'ألفا ليبويك أسيد ٦٠٠ مجم مضاد أكسدة للأعصاب.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً.'),
    warnings: ALA_EMPTY_STOMACH_WARNINGS,
  },

  // 16
  {
    id: 'thiotex-forte-600mg-20-caps-antiox',
    name: 'Thiotex forte 600mg 20 caps',
    genericName: 'thioctic acid (alpha lipoic acid)',
    concentration: '600mg',
    price: 255,
    matchKeywords: ['thiotex forte 600', 'ثيوتكس فورت', 'ala 600', 'اعصاب', 'تنميل', '#antioxidants'],
    usage: 'ألفا ليبويك أسيد ٦٠٠ مجم مضاد أكسدة لدعم الأعصاب الطرفية.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsule',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً.'),
    warnings: ALA_EMPTY_STOMACH_WARNINGS,
  },

  // 17
  {
    id: 'jaufree-oral-drops-10ml-antiox',
    name: 'Jaufree oral drops 10 ml',
    genericName: 'wheat germ oil & vitamin e',
    concentration: '10ml',
    price: 55,
    matchKeywords: ['jaufree', 'جاوفري', 'vitamin e drops', 'wheat germ', 'skin', 'بشرة', 'hair', 'شعر', '#antioxidants'],
    usage: 'نقط فيتامين E (زيت جنين القمح) كمضاد أكسدة لدعم البشرة/الشعر وحالات النقص.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Oral Drops',
    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 8,
    maxWeight: 250,
    calculationRule: (_w, ageMonths) => (ageMonths < 144 ? '٥ نقاط يومياً بعد الأكل' : '١٠ نقاط يومياً بعد الأكل'),
    warnings: FAT_SOLUBLE_VIT_WARNINGS,
  },

  // 18
  {
    id: 'vigoton-plus-20-caps-antiox',
    name: 'Vigoton plus 20 caps',
    genericName: 'lutein & zeaxanthin & omega 3 & beta-carotene & selenium & vitamin c',
    concentration: '20 caps',
    price: 160,
    matchKeywords: ['vigoton plus', 'فيجوتون بلس', 'lutein', 'zeaxanthin', 'eye health', 'شبكية', 'نظر', '#antioxidants'],
    usage: 'مضاد أكسدة لدعم صحة العين والشبكية (لوتين/زياكسانثين + أوميجا + سيلينيوم).',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsule',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً بعد الأكل.'),
    warnings: [...OMEGA3_WARNINGS, ...FAT_SOLUBLE_VIT_WARNINGS],
  },

  // 19
  {
    id: 'oxilozyme-10-tablets-antiox',
    name: 'Oxilozyme 10 tablets',
    genericName: 'l-carnitine & co q 10',
    concentration: '10 tabs',
    price: 165,
    matchKeywords: ['oxilozyme', 'اوكسيلوزايم', 'carnitine', 'coq10', 'energy', 'طاقة', '#antioxidants'],
    usage: 'مضاد أكسدة لدعم الطاقة والخصوبة/العضلات (كارنيتين + CoQ10).',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً بعد الأكل.'),
    warnings: [...CARNITINE_WARNINGS, ...COQ10_WARNINGS],
  },

  // 20
  {
    id: 'carnivita-chewable-30-tabs-antiox',
    name: 'Carnivita chewable tab 30 tab',
    genericName: 'levocarnitine',
    concentration: '30 chew tabs',
    price: 43.5,
    matchKeywords: ['carnivita chewable', 'كارنيفيا مضغ', 'levocarnitine', 'energy', 'طاقة', '#antioxidants'],
    usage: 'ليفو كارنيتين قابل للمضغ لدعم الطاقة ونقص الكارنيتين حسب الحالة.',
    timing: 'مرة إلى مرتين يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Chewable Tablets',
    minAgeMonths: 48,
    maxAgeMonths: 1200,
    minWeight: 15,
    maxWeight: 250,
    calculationRule: (_w, ageMonths) => (ageMonths < 144 ? 'قرص واحد يومياً بعد الأكل' : 'قرص مرتين يومياً بعد الأكل'),
    warnings: CARNITINE_WARNINGS,
  },

  // 21
  {
    id: 'carnivita-forte-30-fc-tab-antiox',
    name: 'Carnivita forte 30 f.c. tab',
    genericName: 'l-carnitine l-tartarate & zinc',
    concentration: '30 tabs',
    price: 177,
    matchKeywords: ['carnivita forte', 'كارنيفيا فورت', 'infertility', 'خصوبة', '#antioxidants', '#infertility'],
    usage: 'كارنيتين + زنك لدعم الخصوبة (خصوصاً الرجال) كمضاد أكسدة.',
    timing: 'مرتين يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد مرتين يومياً بعد الأكل.'),
    warnings: [...CARNITINE_WARNINGS, ...ZINC_WARNINGS],
  },

  // 22
  {
    id: 'corvibeak-20-caps-antiox',
    name: 'Corvibeak 20 caps.',
    genericName: 'thioctic acid & vitamin b12 & vitamin d3 & vitamin b1 & vitamin b6',
    concentration: '20 caps',
    price: 220,
    matchKeywords: ['corvibeak', 'كورفيبيك', 'neuropathy', 'اعصاب', 'vitamin d3', 'تنميل', '#antioxidants'],
    usage: 'مقوّي أعصاب مضاد أكسدة (ALA + فيتامينات ب + D3) لاعتلال الأعصاب والتنميل.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً بعد الأكل.'),
    warnings: [...ALA_WARNINGS, ...FAT_SOLUBLE_VIT_WARNINGS],
  },

  // 23
  {
    id: 'l-carnitine-350mg-20-caps-antiox',
    name: 'L-carnitine 350mg 20 caps.',
    genericName: 'l-carnitine',
    concentration: '350mg',
    price: 72,
    matchKeywords: ['l-carnitine 350', 'كارنيتين ٣٥٠', 'fatigue', 'ارهاق', 'fertility', 'خصوبة', '#antioxidants'],
    usage: 'كارنيتين لدعم الطاقة والخصوبة/العضلات.',
    timing: 'مرتين يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsule',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('كبسولة مرتين يومياً بعد الأكل.'),
    warnings: CARNITINE_WARNINGS,
  },

  // 24
  {
    id: 'thiotex-300mg-30-caps-antiox',
    name: 'Thiotex 300mg 30 caps.',
    genericName: 'thioctic acid (alpha lipoic acid)',
    concentration: '300mg',
    price: 90,
    matchKeywords: ['thiotex 300', 'ثيوتكس ٣٠٠', 'ala 300', 'neuropathy', 'تنميل', '#antioxidants'],
    usage: 'ألفا ليبويك أسيد ٣٠٠ مجم لدعم الأعصاب كمضاد أكسدة.',
    timing: 'مرتين يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('كبسولة مرتين يومياً.'),
    warnings: ALA_EMPTY_STOMACH_WARNINGS,
  },

  // 25
  {
    id: 'vigoton-plus-30-caps-antiox',
    name: 'Vigoton plus 30 caps',
    genericName: 'lutein & zeaxanthin & omega 3 & beta-carotene & selenium & vitamin c',
    concentration: '30 caps',
    price: 240,
    matchKeywords: ['vigoton plus 30', 'فيجوتون بلس ٣٠', 'lutein', 'zeaxanthin', 'شبكية', '#antioxidants'],
    usage: 'مضاد أكسدة لدعم صحة العين والشبكية.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsule',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً بعد الأكل.'),
    warnings: [...OMEGA3_WARNINGS, ...FAT_SOLUBLE_VIT_WARNINGS],
  },

  // 26
  {
    id: 'carnitine-1gm-5ml-5-amp-iv-antiox',
    name: 'Carnitine 1gm/5ml 5 amp. i.v.',
    genericName: 'l-carnitine',
    concentration: '1gm/5ml',
    price: 80,
    matchKeywords: ['carnitine amp', 'كارنيتين امبول', 'dialysis', 'غسيل كلوي', 'deficiency', 'نقص كارنيتين', '#antioxidants'],
    usage: 'حقن كارنيتين لعلاج نقص الكارنيتين (خصوصاً مرضى الغسيل الكلوي) في منشأة صحية.',
    timing: 'حسب البروتوكول.',
    category: Category.VITAMINS_MINERALS,
    form: 'Ampoule (IV)',
    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 2,
    maxWeight: 250,
    // Hemodialysis common regimen: 20 mg/kg IV after dialysis. Concentration: 200 mg/ml.
    calculationRule: (w) => `وريدي: ${toAr((w * 20).toFixed(0))} مجم (= ${toAr((w / 10).toFixed(1))} مل) بعد جلسة الغسيل (جرعة شائعة)`,
    warnings: INJECTION_WARNINGS,
  },

  // 27
  {
    id: 'carnitol-30-percent-syrup-60ml-antiox',
    name: 'Carnitol 30% syrup 60ml',
    genericName: 'l-carnitine',
    concentration: '30% (300mg/ml)',
    price: 87,
    matchKeywords: ['carnitol 30', 'كارنيتول ٣٠٪', 'l-carnitine 30%', 'child muscle weakness', 'ارتخاء', '#antioxidants'],
    usage: 'شراب كارنيتين ٣٠٪ لدعم نقص الكارنيتين/ارتخاء العضلات حسب التشخيص.',
    timing: 'يومياً (مقسمة).',
    category: Category.VITAMINS_MINERALS,
    form: 'Syrup',
    minAgeMonths: 0,
    maxAgeMonths: 216,
    minWeight: 2.5,
    maxWeight: 80,
    calculationRule: (w) => `${toAr((w / 6).toFixed(1))} مل يومياً`,
    warnings: CARNITINE_WARNINGS,
  },

  // 28
  {
    id: 'carnivita-advance-women-30-sachets-antiox',
    name: 'Carnivita advance women 30 sachets',
    genericName: 'l-carnitine',
    concentration: '30 sachets',
    price: 350,
    matchKeywords: ['carnivita advance women', 'كارنيفيا ادفانس', 'women', 'energy', 'طاقة', '#antioxidants'],
    usage: 'كارنيتين (ساشيه) لدعم الطاقة والتمثيل الغذائي.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Sachets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('ساشيه واحد يومياً.'),
    warnings: CARNITINE_WARNINGS,
  },

  // 29
  {
    id: 'l-carnitine-1gm-5ml-5-amp-antiox',
    name: 'L-carnitine 1gm/5ml 5 amp.',
    genericName: 'l-carnitine',
    concentration: '1gm/5ml',
    price: 80,
    matchKeywords: ['l-carnitine amp', 'ليفو كارنيتين امبول', 'carnitine injection', 'نقص كارنيتين', '#antioxidants'],
    usage: 'حقن كارنيتين لعلاج نقص الكارنيتين في منشأة صحية.',
    timing: 'حسب البروتوكول.',
    category: Category.VITAMINS_MINERALS,
    form: 'Ampoule (IV/IM)',
    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 2,
    maxWeight: 250,
    calculationRule: (w) => `مرجع جرعة: ${toAr((w * 20).toFixed(0))} مجم (= ${toAr((w / 10).toFixed(1))} مل) كجرعة شائعة (مثلاً بعد الغسيل)`,
    warnings: INJECTION_WARNINGS,
  },

  // 30
  {
    id: 'thiotacid-300mg-iv-5-amp-10ml-antiox',
    name: 'Thiotacid 300mg 5 i.v. amp 10 ml',
    genericName: 'thioctic acid (alpha lipoic acid)',
    concentration: '300mg/10ml',
    price: 46.5,
    matchKeywords: ['thiotacid iv', 'ثيوتاسيد امبول', 'ala iv', 'neuropathy', 'اعصاب', '#antioxidants'],
    usage: 'حقن ألفا ليبويك أسيد وريدياً (دعم الأعصاب) داخل منشأة طبية.',
    timing: 'حسب البروتوكول.',
    category: Category.VITAMINS_MINERALS,
    form: 'Ampoule (IV)',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('وريدي: أمبول (٣٠٠ مجم) يومياً وقد تُستخدم ٢ أمبول (٦٠٠ مجم) حسب الحالة.'),
    warnings: [...INJECTION_WARNINGS, ...ALA_WARNINGS],
  },

  // 31
  {
    id: 'free-vit-20-tabs-antiox',
    name: 'Free vit 20 tabs',
    genericName: 'selenium & zinc & vitamin c & vitamin e & beta carotene & l-leucine',
    concentration: '20 tabs',
    price: 135,
    matchKeywords: ['free vit', 'فري فيت', 'selenium', 'zinc', 'immunity', 'مناعة', 'hair', 'شعر', '#antioxidants'],
    usage: 'مضاد أكسدة شامل (سيلينيوم + زنك + فيتامينات C/E + بيتا كاروتين) لدعم المناعة.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً بعد الأكل.'),
    warnings: [...ZINC_WARNINGS, ...FAT_SOLUBLE_VIT_WARNINGS],
  },

  // 32
  {
    id: 'vee-white-30-caps-antiox',
    name: 'Vee white 30 caps.',
    genericName: 'liposomal glutathione & ascorbic acid & alpha lipoic acid',
    concentration: '30 caps',
    price: 530,
    matchKeywords: ['vee white', 'في وايت', 'glutathione', 'تفتيح', 'skin whitening', 'alpha lipoic acid', '#antioxidants'],
    usage: 'مضاد أكسدة قوي (جلوتاثيون + فيتامين C + ألفا ليبويك) لدعم الجلد وتقليل الأكسدة.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً بعد الأكل.'),
    warnings: ALA_WARNINGS,
  },

  // 33
  {
    id: 'carnisight-30-caps-antiox',
    name: 'Carnisight 30 capsule',
    genericName: 'l-carnitine & l-arginine & co-enzyme q-10 & zinc & selenium',
    concentration: '30 caps',
    price: 330,
    matchKeywords: ['carnisight', 'كارنسايت', 'male fertility', 'خصوبة رجال', 'sperm', 'حيوانات منوية', '#male fertility', '#antioxidants'],
    usage: 'مضاد أكسدة لدعم خصوبة الرجال (كارنيتين + أرجنين + CoQ10 + زنك + سيلينيوم).',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً بعد الأكل.'),
    warnings: [...CARNITINE_WARNINGS, ...COQ10_WARNINGS, ...ZINC_WARNINGS],
  },

  // 34
  {
    id: 'carnitol-500mg-30-caps-antiox',
    name: 'Carnitol 500mg 30 caps',
    genericName: 'l-carnitine',
    concentration: '500mg',
    price: 105,
    matchKeywords: ['carnitol 500', 'كارنيتول ٥٠٠', 'fatigue', 'طاقة', 'fertility', 'خصوبة', '#antioxidants'],
    usage: 'كارنيتين ٥٠٠ مجم لدعم الطاقة والخصوبة/العضلات.',
    timing: 'مرتين يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsules',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('كبسولة مرتين يومياً بعد الأكل.'),
    warnings: CARNITINE_WARNINGS,
  },

  // 35
  {
    id: 'nirakuat-600mg-20-film-coated-tabs-antiox',
    name: 'Nirakuat 600 mg 20 film coated tablets',
    genericName: 'alpha lipoic acid & benfotiamine & vitamin b6 & vitamin b12',
    concentration: '600mg',
    price: 195,
    matchKeywords: ['nirakuat 600', 'نيراكوات ٦٠٠', 'benfotiamine', 'neuropathy', 'اعصاب', '#antioxidants'],
    usage: 'مقوّي أعصاب مضاد أكسدة (ALA + بنفوتيامين + B6 + B12) لاعتلال الأعصاب.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Film-coated Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً.'),
    warnings: ALA_EMPTY_STOMACH_WARNINGS,
  },

  // 36
  {
    id: 'synapse-co-q10-60-tabs-antiox',
    name: 'Synapse co q10 60 tabs.',
    genericName: 'coenzyme q-10',
    concentration: '60 tabs',
    price: 1550,
    matchKeywords: ['synapse co q10', 'synapse q10', 'سينابس كيو 10', 'coq10', 'heart', 'طاقة', '#antioxidants'],
    usage: 'CoQ10 لدعم الطاقة وصحة القلب كمضاد أكسدة.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً بعد الأكل (تحقق من تركيز القرص على العبوة).'),
    warnings: COQ10_WARNINGS,
  },

  // 37
  {
    id: 'alphavim-300-20-caps-antiox',
    name: 'Alphavim 300 - 20 caps.',
    genericName: 'thioctic acid & vitamin b12 & vitamin b6 & folic acid & ginkgo biloba',
    concentration: '300mg',
    price: 160,
    matchKeywords: ['alphavim 300', 'الفافيم ٣٠٠', 'diabetic neuropathy', 'اعصاب السكر', '#diabetic neuropathy', '#antioxidants'],
    usage: 'مقوّي أعصاب مضاد أكسدة (جرعة ALA أقل) لحالات اعتلال الأعصاب خاصة أعصاب السكر.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً.'),
    warnings: [...ALA_WARNINGS, ...GINKGO_WARNINGS],
  },

  // 38
  {
    id: 'panox-30-soft-gelatin-caps-antiox',
    name: 'Panox 30 soft gelatin caps.',
    genericName: 'vitamin a (retinol palmitate) & dl-alpha-tocopheryl acetate',
    concentration: '30 caps',
    price: 120,
    matchKeywords: ['panox', 'بانوكس', 'vitamin a', 'vitamin e', 'skin', 'بشرة', '#antioxidants'],
    usage: 'فيتامين A + E كمضاد أكسدة لدعم الجلد وحالات النقص.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Soft Gelatin Capsule',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً بعد الأكل.'),
    warnings: FAT_SOLUBLE_VIT_WARNINGS,
  },

  // 39
  {
    id: 'synapse-q10-plus-60-fc-tabs-antiox',
    name: 'Synapse q10 plus 60 f.c.tabs.',
    genericName: 'coenzyme q-10 & vitamins e & vitamins c & vitamins b2 & vitamins b12',
    concentration: '60 tabs',
    price: 750,
    matchKeywords: ['synapse q10 plus', 'سينابس كيو 10 بلس', 'coq10', 'energy', 'طاقة', '#antioxidants'],
    usage: 'CoQ10 مع فيتامينات مضادة للأكسدة لدعم الطاقة والمناعة.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'F.C. Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً بعد الأكل.'),
    warnings: COQ10_WARNINGS,
  },

  // 40
  {
    id: 'carnitol-plus-1000-50mg-20-fc-tabs-antiox',
    name: 'Carnitol plus 1000/50mg 20 f.c. tablets',
    genericName: 'l-carnitine l-tartrate & zinc',
    concentration: '1000/50mg',
    price: 117,
    matchKeywords: ['carnitol plus 1000/50', 'كارنيتول بلس', 'zinc', 'fertility', 'خصوبة', '#antioxidants'],
    usage: 'كارنيتين + زنك بجرعة أعلى لدعم الخصوبة والطاقة.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً بعد الأكل.'),
    warnings: [...CARNITINE_WARNINGS, ...ZINC_WARNINGS],
  },

  // 41
  {
    id: 'thiodio-comb-600mg-30-tabs-antiox',
    name: 'Thiodio comb 600mg 30 tabs.',
    genericName: 'thioctic acid & benfotiamine & vitamin b12',
    concentration: '600mg',
    price: 240,
    matchKeywords: ['thiodio comb', 'ثيوديو كومب', 'benfotiamine', 'neuropathy', 'اعصاب', '#antioxidants'],
    usage: 'مقوّي أعصاب مضاد أكسدة (ALA + بنفوتيامين + B12) لاعتلال الأعصاب.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً.'),
    warnings: ALA_EMPTY_STOMACH_WARNINGS,
  },

  // 42
  {
    id: 'corvibeak-30-caps-antiox',
    name: 'Corvibeak 30 caps.',
    genericName: 'thioctic acid & vitamin b12 & vitamin d3 & vitamin b1 & vitamin b6',
    concentration: '30 caps',
    price: 136.5,
    matchKeywords: ['corvibeak 30', 'كورفيبيك ٣٠', 'neuropathy', 'تنميل', '#antioxidants'],
    usage: 'مقوّي أعصاب مضاد أكسدة (ALA + B + D3) لاعتلال الأعصاب والتنميل.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً بعد الأكل.'),
    warnings: [...ALA_WARNINGS, ...FAT_SOLUBLE_VIT_WARNINGS],
  },

  // 43
  {
    id: 'thiodio-600mg-30-caps-antiox',
    name: 'Thiodio 600mg 30 caps.',
    genericName: 'alpha lipoic acid',
    concentration: '600mg',
    price: 156,
    matchKeywords: ['thiodio 600', 'ثيوديو ٦٠٠', 'ala 600', 'اعصاب', 'تنميل', '#antioxidants'],
    usage: 'ألفا ليبويك أسيد ٦٠٠ مجم مضاد أكسدة لدعم الأعصاب الطرفية.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً.'),
    warnings: ALA_EMPTY_STOMACH_WARNINGS,
  },

  // 44
  {
    id: 'rozonethio-600mg-20-fc-tabs-antiox',
    name: 'Rozonethio 600 mg 20 f.c.tabs',
    genericName: 'alphalipoic acid & vitamin b12 & vitamin b1 & calcium & vitamin d',
    concentration: '600mg',
    price: 150,
    matchKeywords: ['rozonethio 600', 'روزونيثيو ٦٠٠', 'calcium', 'vitamin d', 'neuropathy', 'اعصاب', '#antioxidants'],
    usage: 'مقوّي أعصاب مضاد أكسدة (ALA + فيتامينات ب + كالسيوم + فيتامين د) حسب الحالة.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً بعد الأكل.'),
    warnings: [...ALA_WARNINGS, ...FAT_SOLUBLE_VIT_WARNINGS],
  },

  // 45
  {
    id: 'brovitacan-complex-30-fc-tabs-antiox',
    name: 'Brovitacan complex 30 f.c.tabs.',
    genericName: 'alpha lipoic acid & vitamin b1 & vitamin b6 & vitamin b12 & vitamin d3',
    concentration: '30 tabs',
    price: 225,
    matchKeywords: ['brovitacan', 'بروفيتاكان', 'vitamin d3', 'neuropathy', 'تنميل', '#antioxidants'],
    usage: 'مقوّي أعصاب مضاد أكسدة (ALA + فيتامينات ب + D3) لاعتلال الأعصاب.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً بعد الأكل.'),
    warnings: [...ALA_WARNINGS, ...FAT_SOLUBLE_VIT_WARNINGS],
  },

  // 46
  {
    id: 'alphanerve-20-tab-antiox',
    name: 'Alphanerve 20 tab.',
    genericName: 'alphalipoic acid',
    concentration: '20 tabs',
    price: 92,
    matchKeywords: ['alphanerve', 'الفا نيرف', 'alpha lipoic', 'اعصاب', 'تنميل', '#antioxidants'],
    usage: 'ألفا ليبويك أسيد مضاد أكسدة لدعم الأعصاب الطرفية.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً.'),
    warnings: ALA_EMPTY_STOMACH_WARNINGS,
  },

  // 47
  {
    id: 'green-coffee-15-sachets-antiox',
    name: 'Green coffee 15 sachets',
    genericName: 'green coffee bei',
    concentration: '15 sachets',
    price: 145,
    matchKeywords: ['green coffee', 'green coffee bean', 'قهوة خضراء', 'weight loss', 'تخسيس', 'fat burner', 'حرق دهون', '#antioxidants'],
    usage: 'قهوة خضراء (مضاد أكسدة/منبه) قد تساعد في التحكم بالشهية والطاقة ضمن نظام غذائي.',
    timing: 'مرة واحدة يومياً.',
    category: Category.WEIGHT_LOSS,
    form: 'Sachets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('ساشيه واحد يومياً.'),
    warnings: CAFFEINE_WARNINGS,
  },

  // 48
  {
    id: 'alphaxide-30-tabs-antiox',
    name: 'Alphaxide 30 tabs',
    genericName: 'co-enzyme q10 & alpha lipoic acid & glutathione & l-cysteine',
    concentration: '30 tabs',
    price: 135,
    matchKeywords: ['alphaxide', 'الفاكسايد', 'coq10', 'glutathione', 'alpha lipoic acid', 'skin', 'بشرة', '#antioxidants'],
    usage: 'مضاد أكسدة مركب (CoQ10 + ALA + جلوتاثيون + سيستين) لدعم مقاومة الأكسدة والطاقة.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً بعد الأكل.'),
    warnings: [...ALA_WARNINGS, ...COQ10_WARNINGS],
  },

  // 49
  {
    id: 'melatonine-5mg-20-sachets-antiox',
    name: 'Melatonine 5 mg 20 sachets',
    genericName: 'melatonin',
    concentration: '5mg',
    price: 89,
    matchKeywords: ['melatonine 5', 'melatonin 5', 'ميلاتونين ٥', 'sleep', 'insomnia', 'أرق', '#sleep aid', '#antioxidants'],
    usage: 'ميلاتونين للمساعدة على تنظيم النوم (للأرق/اضطراب النوم).',
    timing: 'قبل النوم.',
    category: Category.HYPNOTICS_SEDATIVES,
    form: 'Sachets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('ساشيه واحد قبل النوم بـ ٣٠–٦٠ دقيقة.'),
    warnings: MELATONIN_WARNINGS,
  },

  // 50
  {
    id: 'mentovage-cream-50gm-antiox',
    name: 'Mentovage 50 gm cream',
    genericName: 'peperrmint & glycerin & vitamin a & vitamin e',
    concentration: '50gm',
    price: 50,
    matchKeywords: ['mentovage', 'منتوفاج', 'peppermint cream', 'dry skin', 'تشقق', 'ترطيب', '#antioxidants'],
    usage: 'كريم مرطب/ملطف يحتوي على فيتامينات مضادة للأكسدة (A/E) مع نعناع.',
    timing: '٢–٣ مرات يومياً.',
    category: Category.TOPICAL_CARE,
    form: 'Cream',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,
    calculationRule: fixed('تُوضع طبقة رقيقة ٢–٣ مرات يومياً.'),
    warnings: TOPICAL_WARNINGS,
  },

  // 51
  {
    id: 'navitae-plus-eye-drops-15ml-antiox',
    name: 'Navitae plus 15ml eye drops',
    genericName: 'sodium hyaluronate & carboxy methyl beta glucan & vitamin a & vitamin e',
    concentration: '15ml',
    price: 355,
    matchKeywords: ['navitae plus', 'نافيتاي بلس', 'eye drops', 'dry eye', 'جفاف العين', 'lubricant', 'مرطب عين', '#antioxidants', '#lubricant'],
    usage: 'قطرة مرطبة للعين (بديل دموع) لجفاف العين والتهيج.',
    timing: '٣–٤ مرات يومياً أو عند اللزوم.',
    category: Category.OPHTHALMIC,
    form: 'Eye Drops',
    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 2,
    maxWeight: 250,
    calculationRule: fixed('نقطة إلى نقطتين بكل عين ٣–٤ مرات يومياً أو عند اللزوم.'),
    warnings: EYE_DROP_WARNINGS,
  },

  // 52
  {
    id: 'acetothyme-10-sachets-antiox',
    name: 'Acetothyme 10 sachets',
    genericName: 'n-acetyl l-cysteine & thyme & vitamin c',
    concentration: '10 sachets',
    price: 65,
    matchKeywords: ['acetothyme', 'اسيتوثايم', 'nac', 'acetylcysteine', 'mucolytic', 'كحة ببلغم', 'بلغم', '#mucolytic', '#antioxidants'],
    usage: 'مذيب بلغم ومضاد أكسدة (NAC) مع زعتر وفيتامين C للكحة ببلغم.',
    timing: 'مرة إلى مرتين يومياً.',
    category: Category.PRODUCTIVE_COUGH,
    form: 'Sachets',
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    calculationRule: fixed('ساشيه واحد مرة إلى مرتين يومياً بعد الأكل.'),
    warnings: NAC_WARNINGS,
  },

  // 53
  {
    id: 'oxifree-30-caps-antiox',
    name: 'Oxifree 30 caps.',
    genericName: 'omega 3 & thioctic acid & proanthocyanidins & bioflavonoids',
    concentration: '30 caps',
    price: 207,
    matchKeywords: ['oxifree', 'اوكسيفري', 'omega 3', 'grape seed', 'proanthocyanidins', 'مضاد اكسدة', '#antioxidants'],
    usage: 'مضاد أكسدة مركب (أوميجا ٣ + ALA + مضادات أكسدة نباتية) لدعم المناعة والأوعية.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsules',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً بعد الأكل.'),
    warnings: [...OMEGA3_WARNINGS, ...ALA_WARNINGS],
  },

  // 54
  {
    id: 'thionerv-300mg-20-tab-antiox',
    name: 'Thionerv 300mg 20 tab.',
    genericName: 'thioctic acid (alpha lipoic acid)',
    concentration: '300mg',
    price: 80,
    matchKeywords: ['thionerv 300', 'ثيونيرف ٣٠٠', 'ala 300', 'neuropathy', 'تنميل', '#antioxidants'],
    usage: 'ألفا ليبويك أسيد ٣٠٠ مجم مضاد أكسدة لدعم الأعصاب الطرفية.',
    timing: 'مرتين يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد مرتين يومياً.'),
    warnings: ALA_EMPTY_STOMACH_WARNINGS,
  },
];

export const ANTIOXIDANTS: Medication[] = ANTIOXIDANTS_RAW.map(enhanceAntioxidantMedication);

