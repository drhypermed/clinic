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

const FOLATE_WARNINGS = [
  ...GENERAL_SUPPLEMENT_WARNINGS,
  'حمض الفوليك ضروري قبل الحمل بشهر على الأقل وخلال الثلث الأول للوقاية من عيوب الأنبوب العصبي (مثل الشوكة المشقوقة).',
  'حمض الفوليك قد يُخفي أعراض نقص B12؛ إن وُجد تنميل/أنيميا شديدة أو استخدام طويل: اعمل تحليل B12 وأعد التقييم.',
];

const HIGH_DOSE_FOLATE_WARNINGS = [
  ...FOLATE_WARNINGS,
  'جرعة ٥ مجم تعتبر جرعة علاجية (أو للحمل عالي الخطورة) وتُستخدم حسب التشخيص.',
];

const ACTIVE_FOLATE_WARNINGS = [
  ...FOLATE_WARNINGS,
  'الفولات النشط (L‑Methylfolate/5‑MTHF) مناسب لمن لديهم صعوبة في تمثيل الفوليك العادي (مثل طفرة MTHFR).',
];

const B6_WARNINGS = [
  ...GENERAL_SUPPLEMENT_WARNINGS,
  'الجرعات العالية من فيتامين B6 لفترات طويلة قد تسبب تنميل/اعتلال أعصاب؛ لا تُطيل الاستخدام دون متابعة.',
];

const B12_WARNINGS = [
  ...GENERAL_SUPPLEMENT_WARNINGS,
  'عادة آمن، وقد يسبب اضطراب معدة خفيف أو صداع عند بعض الأشخاص.',
];

// =========================
// Keyword & instruction enhancement
// =========================
const folicKeywordBoost = (m: Medication) => {
  const g = (m.genericName || '').toString().toLowerCase();
  const n = (m.name || '').toString().toLowerCase();

  const base = [
    '#folic acid',
    '#folic_acid',
    'folic acid',
    'folate',
    'vitamin b9',
    'b9',
    'حمض الفوليك',
    'فوليك',
    'فوليك اسيد',
    'تجهيز حمل',
    'قبل الحمل',
    'حمل',
    'pregnancy',
    'neural tube defects',
    'تشوهات الجنين',
    'spina bifida',
    'anemia',
    'انيميا',
    'أنيميا',
    'folate deficiency',
    'نقص فوليك',
  ];

  const dose = (m.concentration || '').toString();
  const doseAr = dose ? toAr(dose) : '';
  const dosePlain = dose.replace(/\s+/g, '').replace(/\./g, '').toLowerCase();

  const boost: string[] = [];

  if (n.includes('folicap')) boost.push('folicap', 'فوليكاب');
  if (n.includes('sansofolic')) boost.push('sansofolic', 'سانسوفوليك');
  if (n.includes('folicinad')) boost.push('folicinad', 'فوليكيناد');
  if (n.includes('tecafo')) boost.push('tecafo', 'تيكافو');
  if (n.includes('folaska')) boost.push('folaska', 'فولاسكا');
  if (n.includes('forcelat')) boost.push('forcelat', 'فورسيلات');
  if (n.includes('heptafolice')) boost.push('heptafolice', 'هيبتافوليس');
  if (n.includes('acti-folic') || n.includes('actifolic')) boost.push('acti-folic', 'acti folic', 'أكتي فوليك');
  if (n.includes('methyl folate')) boost.push('methyl folate', 'ميثيل فولات', 'active folate', 'فوليك نشط');
  if (n.includes('illegal import') || n.includes('import')) boost.push('import', 'imported', 'illegal import', 'استيراد', 'غير مسجل');

  // Active folate
  if (g.includes('methylfolate') || g.includes('5-methyl') || g.includes('5 methyltetra') || g.includes('5-mthf')) {
    boost.push('l-methylfolate', 'methylfolate', '5-mthf', '5 methyltetrahydrofolate', 'active folate', 'فوليك نشط', 'MTHFR');
  }

  // B12/B6 combos
  if (g.includes('b12') || g.includes('cobal')) boost.push('#vitamin b12', '#vitamin_b12', 'vitamin b12', 'b12', 'فيتامين ب12');
  if (g.includes('b6') || g.includes('pyridox')) boost.push('#vitamin b', '#vitamin_b', 'vitamin b6', 'b6', 'فيتامين ب6');

  // High dose
  if (dosePlain.includes('5mg') || dosePlain.includes('5000mcg')) boost.push('5mg', 'جرعة علاجية', 'high dose');

  return uniq([...base, ...boost, dose, dosePlain, doseAr, m.name, m.genericName]);
};

const enhanceFolicMedication = (m: Medication): Medication => ({
  ...m,
  matchKeywords: uniq([...(m.matchKeywords || []), ...folicKeywordBoost(m)]),
});

// =========================
// Folic list (replace all previous items)
// =========================
const FOLIC_GROUP_RAW: Medication[] = [
  // 1
  {
    id: 'folic-acid-mepaco-500mcg-20-tabs-folic',
    name: 'Folic acid (mepaco) 500 mcg 20 tabs',
    genericName: 'folic acid',
    concentration: '500mcg',
    price: 20,
    matchKeywords: ['mepaco', 'ميباكو', '500 mcg', '0.5 mg', 'pregnancy preparation'],
    usage: 'حمض الفوليك (جرعة وقائية) قبل وأثناء الحمل، ولعلاج/وقاية نقص الفولات حسب التشخيص والحالة.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً.'),
    warnings: FOLATE_WARNINGS,
  },

  // 2
  {
    id: 'folicap-0-5mg-24-caps-folic',
    name: 'Folicap 0.5mg 24 caps',
    genericName: 'folic acid',
    concentration: '0.5mg (500mcg)',
    price: 20,
    matchKeywords: ['folicap 0.5', 'فوليكاب ٠.٥', '500mcg'],
    usage: 'حمض الفوليك (جرعة وقائية) قبل وأثناء الحمل، ولعلاج نقص الفولات حسب الحالة.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsules',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً.'),
    warnings: FOLATE_WARNINGS,
  },

  // 3
  {
    id: 'folicap-2-5mg-24-caps-folic',
    name: 'Folicap 2.5mg 24 cap',
    genericName: 'folic acid',
    concentration: '2.5mg',
    price: 22,
    matchKeywords: ['folicap 2.5', 'فوليكاب ٢.٥', '2.5mg'],
    usage: 'حمض الفوليك بجرعة أعلى—يُستخدم حسب التشخيص لعلاج نقص الفولات أو حالات خاصة.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsules',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً (أو حسب التشخيص والحالة).'),
    warnings: FOLATE_WARNINGS,
  },

  // 4
  {
    id: 'methyl-folate-ora-30-caps-folic',
    name: 'Methyl folate (ora) 30 caps.',
    genericName: 'l-methylfolate',
    concentration: '30 caps',
    price: 110,
    matchKeywords: ['ora', 'أورا', 'mthfr', 'active folate'],
    usage: 'فولات نشط (L‑Methylfolate) لدعم الحمل وتكوين الدم، مناسب لمن لديهم ضعف تحويل الفوليك.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsules',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً.'),
    warnings: ACTIVE_FOLATE_WARNINGS,
  },

  // 5
  {
    id: 'methyl-folate-20-tabs-folic',
    name: 'Methyl folate 20 tabs',
    genericName: 'l-methyl folate',
    concentration: '20 tabs',
    price: 79,
    matchKeywords: ['methyl folate 20', 'فوليك نشط ٢٠'],
    usage: 'فولات نشط (L‑Methylfolate) لدعم تكوين الدم والحمل حسب الحاجة.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً.'),
    warnings: ACTIVE_FOLATE_WARNINGS,
  },

  // 6
  {
    id: 'folic-acid-el-nile-5mg-30-tab-folic',
    name: 'Folic acid (el nile) 5 mg 30 tab.',
    genericName: 'folic acid',
    concentration: '5mg',
    price: 36,
    matchKeywords: ['el nile', 'النيل', '5 mg', '5mg'],
    usage: 'حمض الفوليك ٥ مجم (جرعة علاجية) لعلاج نقص الفولات/أنيميا ميجالوبلاستيك أو للحمل عالي الخطورة حسب التشخيص والحالة.',
    timing: 'مرة واحدة يومياً (حسب التشخيص).',
    category: Category.VITAMINS_MINERALS,
    form: 'Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً (٥ مجم) أو حسب التشخيص والحالة.'),
    warnings: HIGH_DOSE_FOLATE_WARNINGS,
  },

  // 7
  {
    id: 'acti-folic-30-tabs-folic',
    name: 'Acti-folic 30 tabs.',
    genericName: 'l-methylfolate',
    concentration: '30 tabs',
    price: 55,
    matchKeywords: ['acti folic', 'acti-folic', 'أكتي فوليك'],
    usage: 'فولات نشط (L‑Methylfolate) لدعم الحمل وتكوين الدم خاصة مع ضعف امتصاص/تحويل الفوليك.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً.'),
    warnings: ACTIVE_FOLATE_WARNINGS,
  },

  // 8
  {
    id: 'tecafo-30-tab-folic',
    name: 'Tecafo 30 tab',
    genericName: 'folic acid & vitamin b12 & vitamin b6',
    concentration: '30 tabs',
    price: 75,
    matchKeywords: ['tecafo', 'تيكافو', 'b12', 'b6', 'folic acid combo'],
    usage: 'فوليك + B12 + B6 لدعم تكوين الدم وتحسين أعراض التنميل/الإرهاق المرتبط بنقص فيتامينات ب حسب الحالة.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً بعد الأكل.'),
    warnings: [...FOLATE_WARNINGS, ...B12_WARNINGS, ...B6_WARNINGS],
  },

  // 9
  {
    id: 'folicinad-5mg-50-tabs-folic',
    name: 'Folicinad 5mg 50tabs',
    genericName: 'folic acid',
    concentration: '5mg',
    price: 50,
    matchKeywords: ['folicinad', 'فوليكيناد', '5mg 50'],
    usage: 'حمض الفوليك ٥ مجم (جرعة علاجية) لعلاج نقص الفولات أو للحمل عالي الخطورة حسب التشخيص والحالة.',
    timing: 'مرة واحدة يومياً (حسب التشخيص).',
    category: Category.VITAMINS_MINERALS,
    form: 'Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً (٥ مجم) أو حسب التشخيص والحالة.'),
    warnings: HIGH_DOSE_FOLATE_WARNINGS,
  },

  // 10
  {
    id: 'folic-acid-eipico-5mg-20-tab-folic',
    name: 'Folic acid (eipico) 5 mg 20 tab.',
    genericName: 'folic acid',
    concentration: '5mg',
    price: 24,
    matchKeywords: ['eipico', 'ايبيكو', '5mg 20'],
    usage: 'حمض الفوليك ٥ مجم (جرعة علاجية) لعلاج نقص الفولات/أنيميا ميجالوبلاستيك أو للحمل عالي الخطورة حسب التشخيص والحالة.',
    timing: 'مرة واحدة يومياً (حسب التشخيص).',
    category: Category.VITAMINS_MINERALS,
    form: 'Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً (٥ مجم) أو حسب التشخيص والحالة.'),
    warnings: HIGH_DOSE_FOLATE_WARNINGS,
  },

  // 11
  {
    id: 'folaska-20-caps-folic',
    name: 'Folaska 20 caps',
    genericName: '5 methyltetrahydrofolic acid & methylcobalamin',
    concentration: '20 caps',
    price: 85,
    matchKeywords: ['folaska', 'فولاسكا', '5-mthf', 'methylcobalamin'],
    usage: 'فولات نشط (5‑MTHF) مع B12 نشط لدعم تكوين الدم والأعصاب—مفيد مع ضعف الامتصاص/طفرة MTHFR.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsules',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً بعد الأكل.'),
    warnings: [...ACTIVE_FOLATE_WARNINGS, ...B12_WARNINGS],
  },

  // 12
  {
    id: 'heptafolice-20-tabs-folic',
    name: 'Heptafolice 20 tabs',
    genericName: 'folic acid & vitamin b12',
    concentration: '20 tabs',
    price: 55,
    matchKeywords: ['heptafolice', 'هيبتافوليس', 'b12', 'folic acid b12'],
    usage: 'فوليك مع B12 لدعم تكوين الدم وعلاج الأنيميا المرتبطة بنقص الفولات/ب12 حسب التحاليل.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً بعد الأكل.'),
    warnings: [...FOLATE_WARNINGS, ...B12_WARNINGS],
  },

  // 13
  {
    id: 'forcelat-30-caps-folic',
    name: 'Forcelat 30 caps',
    genericName: 'l-5-methyl tetrahydrofolate',
    concentration: '30 caps',
    price: 105,
    matchKeywords: ['forcelat', 'فورسيلات', 'l-5-methyl', '5-mthf'],
    usage: 'فولات نشط (L‑5‑MTHF) لدعم الحمل وتكوين الدم خاصة مع صعوبة تحويل الفوليك.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsules',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً بعد الأكل.'),
    warnings: ACTIVE_FOLATE_WARNINGS,
  },

  // 14
  {
    id: 'folic-acid-400mcg-250-tabs-illegal-import-folic',
    name: 'Folic acid 400 mcg 250 tablets (illegal import)',
    genericName: 'folic acid',
    concentration: '400mcg',
    price: 0,
    matchKeywords: ['400 mcg', '400mcg', '250 tablets', 'illegal import', 'imported'],
    usage: 'حمض الفوليك ٤٠٠ ميكروجرام (جرعة وقائية) قبل وأثناء الحمل حسب الإرشادات.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً.'),
    warnings: [...FOLATE_WARNINGS, 'منتج غير مسجل/استيراد: تأكد من المصدر والجودة قبل الاستخدام.'],
  },

  // 15
  {
    id: 'sansofolic-800mcg-28-tabs-folic',
    name: 'Sansofolic 800 mcg 28 tabs.',
    genericName: 'folic acid',
    concentration: '800mcg',
    price: 110,
    matchKeywords: ['sansofolic 800', 'سانسوفوليك ٨٠٠', '800mcg'],
    usage: 'حمض الفوليك ٨٠٠ ميكروجرام (جرعة أعلى من الوقائية) لدعم الحمل وتكوين الدم حسب الحاجة.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً.'),
    warnings: FOLATE_WARNINGS,
  },
];

export const FOLIC_GROUP: Medication[] = FOLIC_GROUP_RAW.map(enhanceFolicMedication);


