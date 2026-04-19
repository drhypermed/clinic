import { Medication, Category } from '../../types';

const toAr = (n: number | string) => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
const fixed = (text: string) => (_w: number, _a: number) => text;

const normalizeSpaces = (s: string) => s.replace(/\s+/g, ' ').replace(/\s+([.,؛:!؟])/g, '$1').trim();

const stripDoctorPhrases = (s: string) => {
  let t = s;
  t = t.replace(/تحت\s*إشراف\s*طبي/g, '');
  t = t.replace(/(?:إلا\s+)?بتوجيه\s+طبي/g, '');
  t = t.replace(/(?:إلا\s+)?بوصفة\s+طبيب/g, '');
  t = t.replace(/استشر(?:ي)?\s+الطبيب[^.]*\./g, '.');
  t = t.replace(/استشارة\s+(?:طبية|الطبيب)[^.]*\./g, '.');
  t = t.replace(/حسب\s+(?:توجيه|تعليمات|إرشادات|وصف)\s+الطبيب/g, '');
  t = t.replace(/حسب\s+الطبيب/g, 'حسب التقييم');
  t = t.replace(/اسأل\s+الطبيب[^.]*\./g, '.');
  t = t.replace(/\(اسأل الطبيب\)/g, '');
  t = t.replace(/بإرشاد\s+طبي/g, '');
  return normalizeSpaces(t);
};

const sanitizeText = (s: string) => {
  let t = stripDoctorPhrases((s || '').toString());
  t = t.replace(/راجع\s+الطبيب/g, 'يستلزم تقييماً');
  t = t.replace(/استشر(?:ي)?\s+الطبيب/g, 'قد يلزم تقييماً');
  t = t.replace(/لا\s+تتجاوز/g, 'الحد الأعلى');
  t = t.replace(/\bخذها\b/g, 'تُؤخذ');
  t = t.replace(/\bخذ\b/g, 'تُؤخذ');
  t = t.replace(/\bيُتجنب\b/g, 'قد لا يناسب');
  return normalizeSpaces(t);
};

const wrapRule = (rule: Medication['calculationRule']): Medication['calculationRule'] => {
  return (weight, ageMonths) => sanitizeText(rule(weight, ageMonths));
};

const sanitizeMedication = (m: Medication): Medication => ({
  ...m,
  usage: sanitizeText(m.usage),
  timing: sanitizeText(m.timing),
  warnings: (m.warnings || []).map(sanitizeText),
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
  'وجود أمراض مزمنة أو أدوية ثابتة قد يغيّر الملاءمة/الأمان، وقد يلزم تقييم قبل الاستخدام.',
];

const ANTISPASMODIC_WARNINGS = [
  ...GENERAL_URINARY_WARNINGS,
  'قد يسبب جفاف الفم/إمساك/زغللة بالرؤية أو دوخة.',
  'قد لا يناسب: احتباس البول، جلوكوما ضيقة الزاوية، أو انسداد/شلل بالأمعاء.',
  'كبار السن: يُستخدم بحذر لأنه قد يسبب تشوش ذهني/ارتباك.',
];

const MIRABEGRON_WARNINGS = [
  ...GENERAL_URINARY_WARNINGS,
  'قد يرفع ضغط الدم أو يسبب خفقان؛ يُستخدم بحذر مع ضغط غير منضبط.',
  'قد يزيد صعوبة التبول عند من لديهم انسداد شديد بمجرى البول.',
];

// =========================
// Keyword & instruction enhancement
// =========================
const oabKeywordBoost = (m: Medication) => {
  const g = (m.genericName || '').toString().toLowerCase();
  const n = (m.name || '').toString().toLowerCase();

  const base = [
    '#overactive bladder',
    '#overactive_bladder',
    '#urge incontinence',
    '#urge_incontinence',
    'overactive bladder',
    'oab',
    'urge incontinence',
    'urgency',
    'frequency',
    'فرط نشاط المثانة',
    'مثانة',
    'إلحاح بولي',
    'كثرة التبول',
    'سلس بول إلحاحي',
    'مسالك بولية',
    'bladder',
    'nocturia',
    'تبول ليلي',
  ];

  const dose = (m.concentration || '').toString();
  const doseAr = dose ? toAr(dose) : '';
  const dosePlain = dose.replace(/\s+/g, '').replace(/\./g, '').toLowerCase();

  const boost: string[] = [];
  if (g.includes('mirabegron')) boost.push('mirabegron', 'ميرابيجрон', 'beta-3 agonist');
  if (g.includes('trospium')) boost.push('trospium', 'تروسبيوم', 'trospium chloride');
  if (g.includes('darifenacin')) boost.push('darifenacin', 'داريفيناسين');

  if (n.includes('bladogra')) boost.push('bladogra', 'بلادوجرا');
  if (n.includes('flowadjust')) boost.push('flowadjust', 'فلوأدجست');
  if (n.includes('uribladon')) boost.push('uribladon', 'يوريبلادون');
  if (n.includes('betmiga')) boost.push('betmiga', 'بيتميجا');
  if (n.includes('atobegron')) boost.push('atobegron', 'اتوبجرون');
  if (n.includes('trospamexin')) boost.push('trospamexin', 'تروسبيميكسين');
  if (n.includes('andodaricin')) boost.push('andodaricin', 'اندوداريشين');
  if (n.includes('frequefenacine')) boost.push('frequefenacine', 'فريكوفييناسين');

  if (n.includes('xr') || n.includes('prolonged') || n.includes('ext')) boost.push('xr', 'extended release', 'ممتد المفعول');

  return uniq([...base, ...boost, dose, dosePlain, doseAr, m.name, m.genericName]);
};

const enhanceOabMedication = (m: Medication): Medication => ({
  ...sanitizeMedication({
    ...m,
    matchKeywords: uniq([...(m.matchKeywords || []), ...oabKeywordBoost(m)]),
  }),
});

// =========================
// Overactive bladder list (replace all previous items)
// =========================
const OVER_ACTIVE_BLADDER_RAW: Medication[] = [
  // 1
  {
    id: 'bladogra-xr-50mg-30-fc-tabs-oab',
    name: 'Bladogra xr 50mg 30 f.c. tabs.',
    genericName: 'mirabegron',
    concentration: '50mg',
    price: 357,
    matchKeywords: ['bladogra xr 50', '#overactive bladder'],
    usage: 'ميرابيجـرون لعلاج فرط نشاط المثانة وتقليل الإلحاح وكثرة التبول.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Prolonged Release Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 200,
    calculationRule: fixed('١ قرص مرة يومياً (مزمن)'),
    warnings: MIRABEGRON_WARNINGS,
  },

  // 2
  {
    id: 'bladogra-xr-25mg-30-fc-tabs-oab',
    name: 'Bladogra xr 25 mg 30 f.c. tabs.',
    genericName: 'mirabegron',
    concentration: '25mg',
    price: 255,
    matchKeywords: ['bladogra xr 25', '#overactive bladder'],
    usage: 'ميرابيجـرون بجرعة ابتدائية لعلاج فرط نشاط المثانة.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Prolonged Release Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 200,
    calculationRule: fixed('١ قرص مرة يومياً (مزمن)'),
    warnings: MIRABEGRON_WARNINGS,
  },

  // 3
  {
    id: 'flowadjust-25mg-30-prolonged-tabs-oab',
    name: 'Flowadjust 25mg 30 prolonged rel. tabs.',
    genericName: 'mirabegron',
    concentration: '25mg',
    price: 306,
    matchKeywords: ['flowadjust 25', 'prolonged release', '#overactive bladder'],
    usage: 'ميرابيجـرون ممتد المفعول لعلاج فرط نشاط المثانة.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Prolonged Release Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 200,
    calculationRule: fixed('١ قرص مرة يومياً (مزمن)'),
    warnings: MIRABEGRON_WARNINGS,
  },

  // 4
  {
    id: 'uribladon-xr-50mg-30-fc-tabs-oab',
    name: 'Uribladon xr 50 mg 30 f.c. tabs.',
    genericName: 'mirabegron',
    concentration: '50mg',
    price: 516,
    matchKeywords: ['uribladon xr 50', '#overactive bladder'],
    usage: 'ميرابيجـرون ممتد المفعول لعلاج فرط نشاط المثانة.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Prolonged Release Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 200,
    calculationRule: fixed('١ قرص مرة يومياً (مزمن)'),
    warnings: MIRABEGRON_WARNINGS,
  },

  // 5
  {
    id: 'trospamexin-20mg-20-fc-tabs-oab',
    name: 'Trospamexin 20mg 20 f.c. tabs.',
    genericName: 'trospium chloride',
    concentration: '20mg',
    price: 80,
    matchKeywords: ['trospamexin 20', 'trospium', '#urge incontinence'],
    usage: 'تروسبيوم لعلاج فرط نشاط المثانة والإلحاح البولي.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 200,
    calculationRule: fixed('١ قرص مرة يومياً (مزمن)'),
    warnings: ANTISPASMODIC_WARNINGS,
  },

  // 6
  {
    id: 'uribladon-xr-25mg-30-fc-tabs-oab',
    name: 'Uribladon xr 25 mg 30 f.c. tabs.',
    genericName: 'mirabegron',
    concentration: '25mg',
    price: 384,
    matchKeywords: ['uribladon xr 25', '#overactive bladder'],
    usage: 'ميرابيجـرون بجرعة ابتدائية لعلاج فرط نشاط المثانة.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Prolonged Release Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 200,
    calculationRule: fixed('١ قرص مرة يومياً (مزمن)'),
    warnings: MIRABEGRON_WARNINGS,
  },

  // 7
  {
    id: 'andodaricin-7-5mg-20-fc-tab-oab',
    name: 'Andodaricin 7.5 mg 20 f.c.tab.',
    genericName: 'darifenacin',
    concentration: '7.5mg',
    price: 80,
    matchKeywords: ['andodaricin 7.5', 'darifenacin', '#urge incontinence'],
    usage: 'داريفيناسين لعلاج فرط نشاط المثانة والإلحاح البولي.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 200,
    calculationRule: fixed('١ قرص مرة يومياً (مزمن)'),
    warnings: ANTISPASMODIC_WARNINGS,
  },

  // 8
  {
    id: 'betmiga-50mg-30-prolonged-tab-oab',
    name: 'Betmiga 50 mg 30 prolonged r.tablets',
    genericName: 'mirabegron',
    concentration: '50mg',
    price: 562,
    matchKeywords: ['betmiga 50', 'mirabegron', '#overactive bladder'],
    usage: 'ميرابيجـرون ممتد المفعول لعلاج فرط نشاط المثانة.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Prolonged Release Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 200,
    calculationRule: fixed('١ قرص مرة يومياً (مزمن)'),
    warnings: MIRABEGRON_WARNINGS,
  },

  // 9
  {
    id: 'frequefenacine-7-5mg-20-ext-rel-tab-oab',
    name: 'Frequefenacine 7.5mg 20 ext. rel. tab.',
    genericName: 'darifenacin',
    concentration: '7.5mg',
    price: 46,
    matchKeywords: ['frequefenacine 7.5', 'darifenacin extended', '#urge incontinence'],
    usage: 'داريفيناسين ممتد المفعول لعلاج فرط نشاط المثانة والإلحاح البولي.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Prolonged Release Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 200,
    calculationRule: fixed('١ قرص مرة يومياً (مزمن)'),
    warnings: ANTISPASMODIC_WARNINGS,
  },

  // 10
  {
    id: 'atobegron-xr-50mg-30-fc-tabs-oab',
    name: 'Atobegron xr 50 mg 30 f.c. tabs.',
    genericName: 'mirabegron',
    concentration: '50mg',
    price: 498,
    matchKeywords: ['atobegron xr 50', 'mirabegron', '#overactive bladder'],
    usage: 'ميرابيجـرون ممتد المفعول لعلاج فرط نشاط المثانة.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Prolonged Release Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 200,
    calculationRule: fixed('١ قرص مرة يومياً (مزمن)'),
    warnings: MIRABEGRON_WARNINGS,
  },
];

export const OVER_ACTIVE_BLADDER_MEDS: Medication[] = OVER_ACTIVE_BLADDER_RAW.map(enhanceOabMedication);


