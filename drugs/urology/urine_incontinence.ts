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
    .replace(/\bيُتجنب\b/g, 'قد لا يناسب')
    .replace(/\bأوقف\b/g, 'الإيقاف')
    .replace(/\bاطلب\s+طبيباً\b/g, 'يستلزم تقييماً')
    .replace(/\bقم\b/g, 'القيام')
    .replace(/\bخذها\b/g, 'تُؤخذ')
    .replace(/\bابتلع\b/g, 'يُبلع')
    .replace(/\bاستخدم\b/g, 'تُستخدم')
    .replace(/\bقلل\s+شرب\s+السوائل\b/g, 'تقليل شرب السوائل');

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
  'مع أمراض مزمنة أو أدوية ثابتة: قد يلزم تقييم قبل الاستخدام.',
];

const ANTISPASMODIC_WARNINGS = [
  ...GENERAL_URINARY_WARNINGS,
  'قد يسبب جفاف الفم/إمساك/زغللة بالرؤية أو دوخة.',
  'احتباس البول، جلوكوما ضيقة الزاوية، أو انسداد/شلل بالأمعاء قد تجعل استخدامه غير مناسب.',
  'كبار السن: يُستخدم بحذر لأنه قد يسبب تشوش ذهني/ارتباك.',
];

const DESMOPRESSIN_WARNINGS = [
  ...GENERAL_URINARY_WARNINGS,
  'تقليل شرب السوائل من ساعة قبل الجرعة وحتى ٨ ساعات بعدها يساعد على تقليل خطر انخفاض الصوديوم.',
  'علامات نقص الصوديوم (صداع شديد/قيء/تشوش/تشنجات) تستلزم الإيقاف والتقييم العاجل.',
  'أمراض القلب أو الكُلى أو استخدام مُدرات البول: قد يلزم تقييم قبل الاستخدام.',
];

const MIRABEGRON_WARNINGS = [
  ...GENERAL_URINARY_WARNINGS,
  'قد يرفع ضغط الدم أو يسبب خفقاناً؛ ضغط غير منضبط قد يستلزم تقييماً قبل الاستخدام.',
  'قد يزيد صعوبة التبول عند من لديهم انسداد شديد بمجرى البول.',
];

const TAMSULOSIN_WARNINGS = [
  ...GENERAL_URINARY_WARNINGS,
  'قد يسبب دوخة/هبوط ضغط عند الوقوف؛ القيام ببطء من الجلوس يساعد على تقليل الدوخة.',
  'تناوله بعد نفس الوجبة يومياً يساعد على ثبات التأثير.',
];

// =========================
// Keyword & instruction enhancement
// =========================
const urinaryKeywordBoost = (m: Medication) => {
  const g = (m.genericName || '').toString().toLowerCase();
  const n = (m.name || '').toString().toLowerCase();

  const base = [
    '#urinary incontinence',
    '#urinary_incontinence',
    '#antispasmodics',
    'urinary incontinence',
    'overactive bladder',
    'oab',
    'urge incontinence',
    'urgency',
    'frequency',
    'nocturnal enuresis',
    'bedwetting',
    'سلس بول',
    'تبول لا إرادي',
    'تبول ليلي',
    'إلحاح بولي',
    'كثرة التبول',
    'فرط نشاط المثانة',
  ];

  const dose = (m.concentration || '').toString();
  const doseAr = dose ? toAr(dose) : '';
  const dosePlain = dose.replace(/\s+/g, '').replace(/\./g, '').toLowerCase();

  const boost: string[] = [];
  if (g.includes('oxybutynin')) boost.push('oxybutynin', 'اوكسى بيوتينين', 'أوكسيبوتينين', 'uripan', 'يوريبان');
  if (g.includes('tolterodine')) boost.push('tolterodine', 'تولتيرودين', 'incont', 'uricontrol', 'يوريكنترول');
  if (g.includes('solifenacin')) boost.push('solifenacin', 'سوليفيناسين', 'sofenacin', 'سوفيناسين', 'urginafect', 'اورجينافيكت', 'impronacin', 'إمبروناسين', 'solitract', 'سوليتراكت');
  if (g.includes('desmopressin')) boost.push('desmopressin', 'ديسموبريسين', 'omegapress', 'أوميجابرس', 'minirin', 'مينيرين');
  if (g.includes('mirabegron')) boost.push('mirabegron', 'ميرابيجрон');
  if (g.includes('tamsulosin')) boost.push('tamsulosin', 'تامسولوسين', 'احتباس', 'ضعف تدفق البول');

  if (n.includes('melt') || n.includes('sublingual')) boost.push('sublingual', 'under tongue', 'تحت اللسان');
  if (n.includes('xr') || n.includes('l.a') || n.includes('prolonged')) boost.push('xr', 'extended release', 'ممتد المفعول');

  return uniq([...base, ...boost, dose, dosePlain, doseAr, m.name, m.genericName]);
};

const enhanceUrinaryMedication = (m: Medication): Medication => ({
  ...sanitizeMedication(m),
  matchKeywords: uniq([...(m.matchKeywords || []), ...urinaryKeywordBoost(m)]),
});

// =========================
// Urinary incontinence list (replace all previous items)
// =========================
const URINE_INCONTINENCE_RAW: Medication[] = [
  // 1
  {
    id: 'uripan-0-1-syrup-120ml-urine',
    name: 'Uripan 0.1% syrup 120 ml',
    genericName: 'oxybutynin',
    concentration: '1mg/ml',
    price: 37,
    matchKeywords: ['uripan syrup', 'يوريبان شراب', '#urinary incontinence', '#antispasmodics'],
    usage: 'شراب أوكسيبوتينين لعلاج التبول اللاإرادي وفرط نشاط المثانة لدى الأطفال.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Syrup',
    minAgeMonths: 60,
    maxAgeMonths: 144,
    minWeight: 15,
    maxWeight: 50,
    // Dose: 0.2 mg/kg/dose (1mg/ml) => 0.2 ml/kg/dose, max 5ml.
    calculationRule: fixed('١ قرص مرة يومياً (مزمن)'),
    warnings: ANTISPASMODIC_WARNINGS,
  },

  // 2
  {
    id: 'uripan-5mg-30-tab-urine',
    name: 'Uripan 5mg 30 tab.',
    genericName: 'oxybutynin',
    concentration: '5mg',
    price: 54,
    matchKeywords: ['uripan 5', 'يوريبان ٥', '#urinary incontinence', '#antispasmodics'],
    usage: 'أوكسيبوتينين لعلاج السلس البولي الإلحاحي وفرط نشاط المثانة.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 200,
    calculationRule: fixed('١ قرص مرة يومياً (مزمن)'),
    warnings: ANTISPASMODIC_WARNINGS,
  },

  // 3
  {
    id: 'incont-la-4mg-30-tab-urine',
    name: 'Incont L.A. 4mg 30 tab.',
    genericName: 'tolterodine tartrate',
    concentration: '4mg',
    price: 126,
    matchKeywords: ['incont l.a', 'إنكونت', 'tolterodine la', '#urinary incontinence', '#antispasmodics'],
    usage: 'تولتيرودين ممتد المفعول لعلاج فرط نشاط المثانة والسلس الإلحاحي.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Prolonged Release Tablet',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 200,
    calculationRule: fixed('١ قرص مرة يومياً (مزمن)'),
    warnings: ANTISPASMODIC_WARNINGS,
  },

  // 4
  {
    id: 'omegapress-0-1mg-30-tab-urine',
    name: 'Omegapress 0.1 mg 30 tabs.',
    genericName: 'desmopressin acetate',
    concentration: '0.1mg',
    price: 288,
    matchKeywords: ['omegapress 0.1', 'أوميجابرس ٠.١', '#urinary incontinence', '#antidiuretic'],
    usage: 'ديسموبريسين لعلاج التبول اللاإرادي الليلي وتقليل البول الليلي.',
    timing: 'مرة يومياً قبل النوم',
    category: Category.URINARY_CARE,
    form: 'Tablets',
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: fixed('١ قرص مرة يومياً قبل النوم (مزمن)'),
    warnings: DESMOPRESSIN_WARNINGS,
  },

  // 5
  {
    id: 'sofenacin-5mg-30-fc-tab-urine',
    name: 'Sofenacin 5mg 30 f.c. tab',
    genericName: 'solifenacin succinate',
    concentration: '5mg',
    price: 141,
    matchKeywords: ['sofenacin 5', 'سوفيناسين ٥', 'solifenacin', '#urinary incontinence', '#antispasmodics'],
    usage: 'سوليفيناسين لعلاج فرط نشاط المثانة والإلحاح البولي.',
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
    id: 'uricontrol-2mg-10-tab-urine',
    name: 'Uricontrol 2 mg 10 tab.',
    genericName: 'tolterodine tartrate',
    concentration: '2mg',
    price: 25,
    matchKeywords: ['uricontrol 2', 'يوريكنترول ٢', 'tolterodine', '#urinary incontinence', '#antispasmodics'],
    usage: 'تولتيرودين لعلاج كثرة التبول والإلحاح البولي (فرط نشاط المثانة).',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 200,
    calculationRule: fixed('١ قرص مرة يومياً (مزمن)'),
    warnings: ANTISPASMODIC_WARNINGS,
  },

  // 7
  {
    id: 'urginafect-5mg-20-fc-tabs-urine',
    name: 'Urginafect 5mg 20 f.c. tablets',
    genericName: 'solifenacin succinate',
    concentration: '5mg',
    price: 72,
    matchKeywords: ['urginafect 5', 'اورجينافيكت ٥', 'solifenacin', '#urinary incontinence'],
    usage: 'سوليفيناسين لعلاج فرط نشاط المثانة والإلحاح البولي.',
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
    id: 'urginafect-10mg-20-fc-tab-urine',
    name: 'Urginafect 10mg 20 f.c. tab',
    genericName: 'solifenacin succinate',
    concentration: '10mg',
    price: 96,
    matchKeywords: ['urginafect 10', 'اورجينافيكت ١٠', 'solifenacin', '#urinary incontinence'],
    usage: 'سوليفيناسين تركيز أعلى للحالات الشديدة من فرط نشاط المثانة.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 200,
    calculationRule: fixed('١ قرص مرة يومياً (مزمن)'),
    warnings: ANTISPASMODIC_WARNINGS,
  },

  // 9
  {
    id: 'omegapress-0-2mg-30-tab-urine',
    name: 'Omegapress 0.2 mg 30 tabs.',
    genericName: 'desmopressin acetate',
    concentration: '0.2mg',
    price: 411,
    matchKeywords: ['omegapress 0.2', 'أوميجابرس ٠.٢', '#urinary incontinence', '#antidiuretic'],
    usage: 'ديسموبريسين لعلاج التبول اللاإرادي الليلي وتقليل البول الليلي (جرعة أعلى).',
    timing: 'مرة يومياً قبل النوم',
    category: Category.URINARY_CARE,
    form: 'Tablets',
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: fixed('١ قرص مرة يومياً قبل النوم (مزمن)'),
    warnings: DESMOPRESSIN_WARNINGS,
  },

  // 10
  {
    id: 'sofenacin-10mg-20-fc-tab-urine',
    name: 'Sofenacin 10mg 20 f.c.tab',
    genericName: 'solifenacin succinate & solifenacin',
    concentration: '10mg',
    price: 122,
    matchKeywords: ['sofenacin 10', 'سوفيناسين ١٠', '#urinary incontinence'],
    usage: 'سوليفيناسين تركيز أعلى للحالات الشديدة من فرط نشاط المثانة.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 200,
    calculationRule: fixed('١ قرص مرة يومياً (مزمن)'),
    warnings: ANTISPASMODIC_WARNINGS,
  },

  // 11
  {
    id: 'sofenacin-1mg-ml-oral-susp-120ml-urine',
    name: 'Sofenacin 1mg/ml oral susp. 120 ml',
    genericName: 'solifenacin',
    concentration: '1mg/ml',
    price: 88,
    matchKeywords: ['sofenacin suspension', 'سوفيناسين معلق', 'neurogenic bladder', 'kids oab'],
    usage: 'معلق سوليفيناسين لعلاج فرط نشاط المثانة، ويُستخدم للأطفال حسب الوزن.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Oral Suspension',
    minAgeMonths: 60,
    maxAgeMonths: 216,
    minWeight: 10,
    maxWeight: 60,
    calculationRule: fixed('١ قرص مرة يومياً (مزمن)'),
    warnings: ANTISPASMODIC_WARNINGS,
  },

  // 12
  {
    id: 'sofenacin-plus-5-50mg-30-fc-tab-urine',
    name: 'Sofenacin plus 5/50mg 30 f.c. tab',
    genericName: 'solifenacin succinate & mirabegron',
    concentration: '5/50mg',
    price: 408,
    matchKeywords: ['sofenacin plus', 'سوفيناسين بلس', 'mirabegron solifenacin', '#urinary incontinence'],
    usage: 'تركيبة سوليفيناسين + ميرابيجـرون لعلاج فرط نشاط المثانة عند عدم الاستجابة الكافية لدواء واحد.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 200,
    calculationRule: fixed('١ قرص مرة يومياً (مزمن)'),
    warnings: [...ANTISPASMODIC_WARNINGS, ...MIRABEGRON_WARNINGS],
  },

  // 13
  {
    id: 'urginafect-plus-5-50mg-20-fc-tabs-urine',
    name: 'Urginafect plus 5/50mg 20 f.c. tabs',
    genericName: 'mirabegron & solifenacin',
    concentration: '5/50mg',
    price: 252,
    matchKeywords: ['urginafect plus', 'اورجينافيكت بلس', 'mirabegron solifenacin', '#urinary incontinence'],
    usage: 'تركيبة ميرابيجـرون + سوليفيناسين لعلاج فرط نشاط المثانة والسلس الإلحاحي.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 200,
    calculationRule: fixed('١ قرص مرة يومياً (مزمن)'),
    warnings: [...ANTISPASMODIC_WARNINGS, ...MIRABEGRON_WARNINGS],
  },

  // 14
  {
    id: 'impronacin-10mg-10-fc-tab-urine',
    name: 'Impronacin 10 mg 10 f.c. tab.',
    genericName: 'solifenacin succinate',
    concentration: '10mg',
    price: 46,
    matchKeywords: ['impronacin 10', 'إمبروناسين ١٠', '#urinary incontinence'],
    usage: 'سوليفيناسين ١٠ مجم للحالات الشديدة من فرط نشاط المثانة.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 200,
    calculationRule: fixed('١ قرص مرة يومياً (مزمن)'),
    warnings: ANTISPASMODIC_WARNINGS,
  },

  // 15
  {
    id: 'impronacin-5mg-10-fc-tab-urine',
    name: 'Impronacin 5mg 10 f.c. tab',
    genericName: 'solifenacin succinate',
    concentration: '5mg',
    price: 25.2,
    matchKeywords: ['impronacin 5', 'إمبروناسين ٥', '#urinary incontinence'],
    usage: 'سوليفيناسين ٥ مجم لعلاج فرط نشاط المثانة.',
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

  // 16
  {
    id: 'minirin-melt-60mcg-30-sublingual-urine',
    name: 'Minirin melt 60mcg 30 sublingual tab',
    genericName: 'desmopressin',
    concentration: '60mcg',
    price: 510,
    matchKeywords: ['minirin melt', 'مينيرين ميلت', 'sublingual desmopressin', '#urinary incontinence', '#antidiuretic'],
    usage: 'ديسموبريسين تحت اللسان لعلاج التبول اللاإرادي الليلي وتقليل البول الليلي.',
    timing: 'مرة يومياً قبل النوم',
    category: Category.URINARY_CARE,
    form: 'Orodispersible Tablet',
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: fixed('١ قرص مرة يومياً قبل النوم (مزمن)'),
    warnings: DESMOPRESSIN_WARNINGS,
  },

  // 17
  {
    id: 'urginafect-1mg-susp-150ml-urine',
    name: 'Urginafect 1mg suspension 150 ml',
    genericName: 'solifenacin',
    concentration: '1mg/ml',
    price: 76.5,
    matchKeywords: ['urginafect suspension', 'اورجينافيكت معلق', 'pediatric oab'],
    usage: 'معلق سوليفيناسين لعلاج فرط نشاط المثانة لدى الأطفال حسب الوزن.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Oral Suspension',
    minAgeMonths: 60,
    maxAgeMonths: 216,
    minWeight: 10,
    maxWeight: 60,
    calculationRule: fixed('١ قرص مرة يومياً (مزمن)'),
    warnings: ANTISPASMODIC_WARNINGS,
  },

  // 18
  {
    id: 'detronin-5mg-20-tab-urine',
    name: 'Detronin 5mg 20 tab.',
    genericName: 'oxybutynin',
    concentration: '5mg',
    price: 26,
    matchKeywords: ['detronin 5', 'ديترونين ٥', 'oxybutynin', '#urinary incontinence'],
    usage: 'أوكسيبوتينين لعلاج السلس البولي الإلحاحي وفرط نشاط المثانة.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 200,
    calculationRule: fixed('١ قرص مرة يومياً (مزمن)'),
    warnings: ANTISPASMODIC_WARNINGS,
  },

  // 19
  {
    id: 'solitract-compound-0-4mg-10-tabs-urine',
    name: 'Solitract compound 0.4mg 10 tabs',
    genericName: 'solifenacin & tamsulosin',
    concentration: '0.4mg',
    price: 108,
    matchKeywords: ['solitract compound', 'سوليتراكت كومباوند', 'tamsulosin', 'solifenacin', '#urinary incontinence'],
    usage: 'تركيبة سوليفيناسين + تامسولوسين لتخفيف الإلحاح وكثرة التبول مع صعوبة التبول (أعراض بولية مركبة).',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 200,
    calculationRule: fixed('١ قرص مرة يومياً (مزمن)'),
    warnings: [...ANTISPASMODIC_WARNINGS, ...TAMSULOSIN_WARNINGS],
  },

  // 20
  {
    id: 'solitract-10mg-30-fc-tab-urine',
    name: 'Solitract 10 mg 30 f.c. tab.',
    genericName: 'solifenacin succinate',
    concentration: '10mg',
    price: 113.5,
    matchKeywords: ['solitract 10', 'سوليتراكت ١٠', 'solifenacin', '#urinary incontinence'],
    usage: 'سوليفيناسين ١٠ مجم للحالات الشديدة من فرط نشاط المثانة.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 200,
    calculationRule: fixed('١ قرص مرة يومياً (مزمن)'),
    warnings: ANTISPASMODIC_WARNINGS,
  },

  // 21
  {
    id: 'solitract-5mg-30-fc-tab-urine',
    name: 'Solitract 5 mg 30 f.c. tab.',
    genericName: 'solifenacin succinate',
    concentration: '5mg',
    price: 86.5,
    matchKeywords: ['solitract 5', 'سوليتراكت ٥', 'solifenacin', '#urinary incontinence'],
    usage: 'سوليفيناسين ٥ مجم لعلاج فرط نشاط المثانة.',
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
];

export const URINE_INCONTINENCE_MEDS: Medication[] = URINE_INCONTINENCE_RAW.map(enhanceUrinaryMedication);


