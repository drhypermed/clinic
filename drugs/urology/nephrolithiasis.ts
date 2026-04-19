import { Medication, Category } from '../../types';

// Helper to convert numbers to Arabic numerals
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
  t = t.replace(/بواسطة\s+الطبيب/g, '');
  t = t.replace(/اسأل\s+الطبيب[^.]*\./g, '.');
  t = t.replace(/\(اسأل الطبيب\)/g, '');
  t = t.replace(/بإرشاد\s+طبي/g, '');
  return normalizeSpaces(t);
};

const sanitizeText = (s: string) => {
  let t = stripDoctorPhrases((s || '').toString());
  t = t.replace(/راجع\s+طبيباً\s+فوراً/g, 'يستلزم تقييماً عاجلاً');
  t = t.replace(/راجع\s+الطبيب/g, 'يستلزم تقييماً');
  t = t.replace(/استشر(?:ي)?\s+الطبيب/g, 'قد يلزم تقييماً');
  t = t.replace(/\bممنوع\b/g, 'غير مناسب');
  t = t.replace(/\bيُمنع\b/g, 'غير مناسب');
  t = t.replace(/لا\s+تتجاوز/g, 'الحد الأعلى');
  t = t.replace(/\bخذها\b/g, 'تُؤخذ');
  t = t.replace(/\bخذ\b/g, 'تُؤخذ');
  t = t.replace(/\bاتبع\b/g, 'استخدام');
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
const GENERAL_STONE_WARNINGS = [
  'الجرعة اليومية الموصى بها هي الحد الأعلى.',
  'اشرب سوائل بكميات كافية خلال اليوم (إذا لا يوجد مانع طبي) للمساعدة في تقليل ترسب الأملاح.',
  'ألم شديد/قيء مستمر/حمّى أو دم في البول يستلزم تقييماً عاجلاً.',
];

const CITRATE_WARNINGS = [
  ...GENERAL_STONE_WARNINGS,
  'يُستخدم بحذر مع مرضى الكُلى أو من لديهم ارتفاع بوتاسيوم/صوديوم في الدم.',
  'قد يسبب اضطراب معدة؛ يُفضل بعد الأكل.',
  'أدوية قد ترفع البوتاسيوم (مثل سبيرونولاكتون/ACEi/ARBs): قد يلزم تقييم قبل الاستخدام.',
];

const XR_WARNINGS = [
  ...CITRATE_WARNINGS,
  'أقراص ممتدة المفعول: تُبلع كاملة ولا تُكسر/تُسحق.',
];

const ALLOPURINOL_WARNINGS = [
  'يُؤخذ بعد الأكل مع شرب سوائل كافية.',
  'ليس لعلاج نوبة النقرس الحادة؛ يُستخدم للوقاية وخفض حمض اليوريك.',
  'تحذير مهم: طفح جلدي/حكة شديدة/تورم قد يدل على حساسية خطيرة ويستلزم إيقاف الدواء وتقييماً عاجلاً.',
  'تداخلات خطيرة: غير مناسب مع أزاثيوبرين/ميركابتوبورين إلا ضمن متابعة متخصصة.',
  'قصور الكُلى قد يستلزم جرعة أقل حسب التقييم.',
];

// =========================
// Keyword & instruction enhancement
// =========================
const nephroKeywordBoost = (m: Medication) => {
  const g = (m.genericName || '').toString().toLowerCase();
  const n = (m.name || '').toString().toLowerCase();

  const base = [
    '#renal stones',
    '#kidney stones',
    '#nephrolithiasis',
    '#urinary alkalinizing agent',
    '#urinary_alkalinizing_agent',
    'renal stones',
    'kidney stones',
    'ureteric stones',
    'nephrolithiasis',
    'urinary alkalinizer',
    'urine alkalinizer',
    'alkalinizing agent',
    'hypocitraturia',
    'citrate',
    'uric acid stones',
    'cystine stones',
    'urine ph',
    'حصوات',
    'حصوات كلى',
    'حصوة',
    'مغص كلوي',
    'رمل',
    'أملاح',
    'أملاح يوريك',
    'قلونة البول',
    'رفع قلوية البول',
    'مسالك بولية',
    'كلى',
    'حالب',
  ];

  const dose = (m.concentration || '').toString();
  const doseAr = dose ? toAr(dose) : '';
  const dosePlain = dose.replace(/\s+/g, '').replace(/\./g, '').toLowerCase();

  const boost: string[] = [];

  if (g.includes('potassium citrate')) boost.push('potassium citrate', 'سترات بوتاسيوم', 'k citrate', 'kalemapex', 'كاليما بيكس');
  if (g.includes('sodium citrate')) boost.push('sodium citrate', 'سترات صوديوم');
  if (g.includes('citric acid')) boost.push('citric acid', 'حمض الستريك');
  if (g.includes('potassium sodium hydrogen citrate')) boost.push('uralyt-u', 'uralyt', 'يوراليت', 'ph control');
  if (g.includes('allopurinol'))
    boost.push(
      '#anti-gout',
      'anti-gout',
      'gout',
      'نقرس',
      'uric acid',
      '#uric acid',
      'hyperuricemia',
      'حمض اليوريك',
      '#xoi',
      '#xanthine oxidase inhibitor',
      'xanthine oxidase inhibitor',
      'XOI',
      'allopurinol',
      'zyloric',
      'no-uric',
      'نو يوريك',
      'nouric'
    );

  if (n.includes('xr') || n.includes('xl') || n.includes('extended')) boost.push('xr', 'extended release', 'ممتد المفعول');
  if (n.includes('granules')) boost.push('granules', 'effervescent granules', 'جرانول', 'فوار');

  return uniq([...base, ...boost, dose, dosePlain, doseAr, m.name, m.genericName]);
};

const enhanceNephroMedication = (m: Medication): Medication => ({
  ...sanitizeMedication({
    ...m,
    matchKeywords: uniq([...(m.matchKeywords || []), ...nephroKeywordBoost(m)]),
  }),
});

// =========================
// Nephrolithiasis list (replace all previous items)
// =========================
const NEPHROLITHIASIS_RAW: Medication[] = [
  // 1
  {
    id: 'kalemapex-15meq-1620mg-30-xr-tabs-nephro',
    name: 'Kalemapex 15 meq (1620 mg) 30 xr tabs.',
    genericName: 'potassium citrate',
    concentration: '15 mEq (1620mg)',
    price: 243,
    matchKeywords: ['kalemapex 15', 'k citrate 15', 'سترات بوتاسيوم', '#renal stones', '#urinary alkalinizing agent'],
    usage: 'سترات بوتاسيوم لقلونة البول والوقاية من حصوات الكلى (خصوصاً حصوات حمض اليوريك/السيستين) وعلاج نقص السترات.',
    timing: 'مرتين يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Prolonged Release Tablet',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرتين يومياً بعد الأكل مع كثير من الماء (مزمن)'),
    warnings: XR_WARNINGS,
  },

  // 2
  {
    id: 'uralyt-u-eff-granules-280gm-nephro',
    name: 'Uralyt-u eff. granules 280 gm',
    genericName: 'potassium sodium hydrogen citrate',
    concentration: '280 gm',
    price: 366,
    matchKeywords: ['uralyt-u', 'uralyt u', 'يوراليت', 'ph', 'urine alkalinizer', '#nephrolithiasis'],
    usage: 'قلونة البول لإذابة/منع حصوات حمض اليوريك وحصوات السيستين؛ الجرعة ٣–٤ مرات يومياً وتُضبط حسب pH البول (استهدف ٦.٢–٦.٨).',
    timing: '٢–٣ مرات يومياً بعد الأكل',
    category: Category.URINARY_CARE,
    form: 'Granules',
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    calculationRule: fixed('مكيال يُذاب في نصف كوب ماء ٢–٣ مرات يومياً بعد الأكل'),
    warnings: CITRATE_WARNINGS,
  },

  // 3
  {
    id: 'citra-forte-2-4gm-gran-280gm-nephro',
    name: 'Citra forte 2.4 gm gran. 280 gm',
    genericName: 'sodium citrate & potassium citrate & citric acid anhydrous',
    concentration: '2.4 gm (280 gm)',
    price: 208,
    matchKeywords: ['citra forte', 'سيترا فورت', 'urinary alkalinizer', 'citrate', '#nephrolithiasis'],
    usage: 'جرانول قلونة البول للمساعدة في تقليل ترسب الأملاح والوقاية من تكوين الحصوات.',
    timing: '٢–٣ مرات يومياً بعد الأكل',
    category: Category.URINARY_CARE,
    form: 'Granules',
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    calculationRule: fixed('مكيال يُذاب في نصف كوب ماء ٢–٣ مرات يومياً بعد الأكل'),
    warnings: CITRATE_WARNINGS,
  },

  // 4
  {
    id: 'kalemapex-10meq-1080mg-30-xr-tabs-nephro',
    name: 'Kalemapex 10 meq (1080 mg) 30 xr tabs.',
    genericName: 'potassium citrate',
    concentration: '10 mEq (1080mg)',
    price: 187.5,
    matchKeywords: ['kalemapex 10', 'k citrate 10', 'سترات بوتاسيوم', '#renal stones'],
    usage: 'سترات بوتاسيوم لقلونة البول والوقاية من حصوات الكلى وعلاج نقص السترات (جرعة أقل).',
    timing: 'مرتين يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Prolonged Release Tablet',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرتين يومياً بعد الأكل مع كثير من الماء (مزمن)'),
    warnings: XR_WARNINGS,
  },

  // 5
  {
    id: 'no-uric-allopurinol-300mg-tabs-20',
    name: 'No-uric 300mg 20 tab.',
    genericName: 'allopurinol',
    concentration: '300mg',
    price: 38,
    matchKeywords: ['no-uric 300', 'نو يوريك ٣٠٠', 'uric acid stones', 'حصوات يوريك', '#anti-gout', '#xanthine oxidase inhibitor'],
    usage: 'خفض حمض اليوريك لعلاج/وقاية حصوات حمض اليوريك وفرط اليوريك.',
    timing: 'مرة يومياً – مزمن',
    category: Category.MUSCULOSKELETAL,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً بعد الأكل مع كثير من الماء (مزمن)'),
    warnings: ALLOPURINOL_WARNINGS,
  },

  // 6
  {
    id: 'no-uric-allopurinol-100mg-tabs-50',
    name: 'No-uric 100mg 50 tab.',
    genericName: 'allopurinol',
    concentration: '100mg',
    price: 65,
    matchKeywords: ['no-uric 100', 'نو يوريك ١٠٠', 'uric acid stones', 'حصوات يوريك', '#anti-gout', '#xanthine oxidase inhibitor'],
    usage: 'خفض حمض اليوريك (جرعة بداية/للكُلى) للمساعدة في الوقاية من حصوات حمض اليوريك والنقرس المزمن.',
    timing: 'مرة يومياً – مزمن',
    category: Category.MUSCULOSKELETAL,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً بعد الأكل مع كثير من الماء (مزمن)'),
    warnings: ALLOPURINOL_WARNINGS,
  },
];

export const NEPHROLITHIASIS_MEDS: Medication[] = NEPHROLITHIASIS_RAW.map(enhanceNephroMedication);


