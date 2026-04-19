import { Medication, Category } from '../../types';

// Helper to convert numbers to Arabic numerals
const toAr = (n: number | string) => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
const fixed = (text: string) => (_w: number, _a: number) => text;

const normalizeSpaces = (input: string) =>
  (input || '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([،.؛:!؟)\]])/g, '$1')
    .replace(/([(\[] )\s+/g, '$1')
    .replace(/\(\s*\)/g, '')
    .trim();

const stripDoctorPhrases = (input: string) => {
  let text = input || '';
  const patterns: RegExp[] = [
    /\(\s*حسب\s+الطبيب\s*\)/g,
    /\(\s*بوصفة\s+طبيب\s*\)/g,
    /\(\s*أو\s+حسب\s+الطبيب\s*\)/g,
    /حسب\s+الطبيب/g,
    /بتوجيه\s+طبي/g,
    /استشارة\s+طبيب/g,
    /استشر\s+الطبيب/g,
    /راجع\s+الطبيب/g,
    /بوصفة\s+طبيب/g,
    /تحت\s+إشراف\s+طبي/g,
  ];
  for (const p of patterns) text = text.replace(p, '');
  return normalizeSpaces(text);
};

const sanitizeText = (input: string) => {
  let text = stripDoctorPhrases(input || '');

  text = text
    .replace(/\bلا\s+تتجاوز\b/g, 'الحد الأعلى')
    .replace(/\bممنوع\b/g, 'غير مناسب')
    .replace(/\bيُمنع\b/g, 'غير مناسب')
    .replace(/\bأوقفه\b/g, 'الإيقاف')
    .replace(/\bأوقف\b/g, 'الإيقاف');

  return normalizeSpaces(text);
};

const wrapRule = (rule?: Medication['calculationRule']): Medication['calculationRule'] | undefined => {
  if (!rule) return rule;
  return (weight, ageMonths) => sanitizeText(rule(weight, ageMonths));
};

const sanitizeMedication = (m: Medication): Medication => ({
  ...m,
  usage: m.usage ? sanitizeText(m.usage) : m.usage,
  timing: m.timing ? sanitizeText(m.timing) : m.timing,
  warnings: m.warnings ? m.warnings.map(sanitizeText).filter(Boolean) : m.warnings,
  calculationRule: wrapRule(m.calculationRule),
});

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
const GENERAL_URINARY_WARNINGS = [
  'الجرعة اليومية الموصى بها هي الحد الأعلى.',
  'مع مرض مزمن (كُلى/كبد/قلب) أو أدوية ثابتة: قد يلزم تقييم قبل الاستخدام.',
];

const HYDRATION_WARNINGS = [
  ...GENERAL_URINARY_WARNINGS,
  'شرب سوائل بكميات كافية خلال اليوم (إذا لا يوجد مانع) يساعد على تسييل البول وتقليل المغص.',
];

const TERPENE_WARNINGS = [
  ...HYDRATION_WARNINGS,
  'قد يسبب تجشؤ/طعم زيوت عطرية أو اضطراب معدة خفيف.',
  'الحمل/الرضاعة: قد يلزم تقييم قبل الاستخدام.',
];

const HEXAMINE_WARNINGS = [
  ...HYDRATION_WARNINGS,
  'القصور الكلوي أو حصوات متكررة: قد يلزم تقييم قبل الاستخدام.',
  'الجمع مع أدوية السلفا قد لا يكون مناسباً.',
];

const COLCHICINE_WARNINGS = [
  ...GENERAL_URINARY_WARNINGS,
  'قد يسبب إسهال/مغص/غثيان؛ إسهال شديد يستلزم الإيقاف والتقييم.',
  'الحمل: قد لا يناسب.',
];

// =========================
// Keyword & instruction enhancement
// =========================
const urinaryAntiInfectiveKeywordBoost = (m: Medication) => {
  const g = (m.genericName || '').toString().toLowerCase();
  const n = (m.name || '').toString().toLowerCase();

  const base = [
    '#urinary',
    '#analgesics',
    '#antiseptics',
    'urinary',
    'urinary antiseptic',
    'urinary analgesic',
    'renal colic',
    'kidney stone',
    'stones',
    'sand',
    'crystals',
    'حصوات',
    'مغص كلوي',
    'أملاح',
    'رمل',
    'التهاب مسالك',
    'حرقان بول',
    'cystitis',
  ];

  const dose = (m.concentration || '').toString();
  const doseAr = dose ? toAr(dose) : '';
  const dosePlain = dose.replace(/\s+/g, '').replace(/\./g, '').toLowerCase();

  const boost: string[] = [];

  if (n.includes('rowatinex')) boost.push('rowatinex', 'رواتينكس');
  if (n.includes('urinex')) boost.push('urinex', 'يورينكس');
  if (n.includes('urivin')) boost.push('urivin', 'يوريفين');
  if (n.includes('proximol')) boost.push('proximol', 'بروكسيمول');
  if (n.includes('uricol')) boost.push('uricol', 'يوريكول');
  if (n.includes('coli-urinal') || n.includes('coli urinal')) boost.push('coli-urinal', 'كولي يورينال');
  if (n.includes('renal-s') || n.includes('renal s')) boost.push('renal-s', 'renal s', 'رينال اس');

  if (g.includes('hexamine') || g.includes('methenamine')) boost.push('hexamine', 'methenamine', 'هيكسامين');
  if (g.includes('khellin')) boost.push('khellin', 'خِلين');
  if (g.includes('piperazine')) boost.push('piperazine', 'بيبيرازين');
  if (g.includes('colchicine')) boost.push('colchicine', 'كولشيسين', 'uric acid stones', 'املاح يوريك');
  if (g.includes('anethol') || g.includes('borneol') || g.includes('cineole') || g.includes('pinene')) boost.push('terpenes', 'essential oils', 'زيوت عطرية');

  // Form hints
  const form = (m.form || '').toString().toLowerCase();
  if (form.includes('sachet')) boost.push('effervescent', 'fawar', 'فوار');
  if (form.includes('granules')) boost.push('granules', 'جرانول');

  return uniq([...base, ...boost, dose, dosePlain, doseAr, m.name, m.genericName]);
};

const enhanceUrinaryAntiInfectiveMedication = (m: Medication): Medication => ({
  ...sanitizeMedication(m),
  matchKeywords: uniq([...(m.matchKeywords || []), ...urinaryAntiInfectiveKeywordBoost(m)]),
});

// =========================
// Urinary anti-infective list (replace all previous items)
// =========================
const URINARY_ANTI_INFECTIVE_RAW: Medication[] = [
  // 1
  {
    id: 'rowatinex-45-caps-uai',
    name: 'Rowatinex 45 capsules',
    genericName: 'anethol & borneol & camphene & cineole & ethaverine & fench...',
    concentration: '45 capsules',
    price: 93,
    matchKeywords: ['#urinary', '#analgesics', '#antiseptics', 'renal stones', 'kidney stone'],
    usage: 'للمغص الكلوي وحصوات الكلى/الحالب وقد يُستخدم كمساعد مع التهابات المسالك البولية.',
    timing: '٤ مرات يومياً – ١٠ أيام',
    category: Category.URINARY_CARE,
    form: 'Capsule',
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    calculationRule: fixed('١ قرص ٤ مرات يومياً مع كثير من الماء لمدة ١٠ أيام'),
    warnings: TERPENE_WARNINGS,
  },

  // 2
  {
    id: 'urinex-24-caps-uai',
    name: 'Urinex 24 caps',
    genericName: 'alpha pinene & borneol & fenchone & anethol & cineol & ...',
    concentration: '24 caps',
    price: 44,
    matchKeywords: ['#urinary', '#analgesics', '#antiseptics', 'urinary antiseptic'],
    usage: 'مدر للبول ومطهر مساعد للمسالك وقد يساعد في تفتيت/طرد الحصوات الصغيرة.',
    timing: '٤ مرات يومياً – ١٠ أيام',
    category: Category.URINARY_CARE,
    form: 'Capsule',
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    calculationRule: fixed('١ قرص ٤ مرات يومياً مع كثير من الماء لمدة ١٠ أيام'),
    warnings: TERPENE_WARNINGS,
  },

  // 3
  {
    id: 'urivin-n-10-eff-sachets-uai',
    name: 'Urivin n 10 eff. sachets',
    genericName: 'piperazine citrate & colchicine & khellin',
    concentration: '10 sachets',
    price: 31,
    matchKeywords: ['#urinary', '#analgesics', 'uric acid stones', 'املاح يوريك', 'نقرس'],
    usage: 'فوار للمسالك قد يساعد في أملاح/حصوات حمض اليوريك وتخفيف المغص.',
    timing: '٤ مرات يومياً – ١٠ أيام',
    category: Category.URINARY_CARE,
    form: 'Sachets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('١ قرص ٤ مرات يومياً مع كثير من الماء لمدة ١٠ أيام'),
    warnings: [...COLCHICINE_WARNINGS, ...HYDRATION_WARNINGS],
  },

  // 4
  {
    id: 'proximol-0-4mg-40-sugar-coated-tabs-uai',
    name: 'Proximol 0.4mg 40 sugar c.tabs.',
    genericName: 'proximadiol',
    concentration: '40 tablets',
    price: 34,
    matchKeywords: ['#urinary', '#analgesics', '#antiseptics', 'ureteric stones', 'طرد حصوات'],
    usage: 'مساعد لطرد الحصوات الصغيرة/الرمل وتخفيف تقلصات المسالك (حسب الحالة).',
    timing: '٤ مرات يومياً – ١٠ أيام',
    category: Category.URINARY_CARE,
    form: 'Sugar Coated Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('١ قرص ٤ مرات يومياً مع كثير من الماء لمدة ١٠ أيام'),
    warnings: HYDRATION_WARNINGS,
  },

  // 5
  {
    id: 'uricol-6-eff-gr-sachets-uai',
    name: 'Uricol 6 eff. gr. in sachets',
    genericName: 'hexamine & khellin & piperazine',
    concentration: '6 sachets',
    price: 21,
    matchKeywords: ['#urinary', '#analgesics', '#antiseptics', 'urinary antiseptic', 'فوار'],
    usage: 'مطهر مساعد للمسالك ومذيب للأملاح (حسب الحالة).',
    timing: '٤ مرات يومياً – ١٠ أيام',
    category: Category.URINARY_CARE,
    form: 'Sachets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('١ قرص ٤ مرات يومياً مع كثير من الماء لمدة ١٠ أيام'),
    warnings: HEXAMINE_WARNINGS,
  },

  // 6
  {
    id: 'coli-urinal-eff-gr-60gm-uai',
    name: 'Coli-urinal eff. gr. 60 gm',
    genericName: 'hexamine & khellin & piperazine',
    concentration: '60 gm',
    price: 40,
    matchKeywords: ['#urinary', '#analgesics', '#antiseptics', 'cystitis', 'التهاب مثانة'],
    usage: 'فوار مطهر مساعد للمسالك ومذيب للأملاح (عبوة جرانول).',
    timing: '٤ مرات يومياً – ١٠ أيام',
    category: Category.URINARY_CARE,
    form: 'Granules',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('١ قرص ٤ مرات يومياً مع كثير من الماء لمدة ١٠ أيام'),
    warnings: HEXAMINE_WARNINGS,
  },

  // 7
  {
    id: 'renal-s-12-sachet-uai',
    name: 'Renal-s 12 sachet',
    genericName: 'hexamine & khellin',
    concentration: '12 sachets',
    price: 21,
    matchKeywords: ['#urinary', '#analgesics', '#antiseptics', 'renal s'],
    usage: 'مطهر مساعد للمسالك ومذيب للأملاح (حسب الحالة).',
    timing: '٤ مرات يومياً – ١٠ أيام',
    category: Category.URINARY_CARE,
    form: 'Sachets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('١ قرص ٤ مرات يومياً مع كثير من الماء لمدة ١٠ أيام'),
    warnings: HEXAMINE_WARNINGS,
  },

  // 8
  {
    id: 'renal-s-n-12-sachet-uai',
    name: 'Renal s-n 12 sachet',
    genericName: 'hexamine & khellin',
    concentration: '12 sachets',
    price: 30,
    matchKeywords: ['#urinary', '#analgesics', '#antiseptics', 'renal s-n'],
    usage: 'مطهر مساعد للمسالك ومذيب للأملاح (حسب الحالة).',
    timing: '٤ مرات يومياً – ١٠ أيام',
    category: Category.URINARY_CARE,
    form: 'Sachets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('١ قرص ٤ مرات يومياً مع كثير من الماء لمدة ١٠ أيام'),
    warnings: HEXAMINE_WARNINGS,
  },
];

export const URINARY_ANTI_INFECTIVE_MEDS: Medication[] = URINARY_ANTI_INFECTIVE_RAW.map(enhanceUrinaryAntiInfectiveMedication);


