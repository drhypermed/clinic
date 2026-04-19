
import { Medication, Category } from '../../types';

// Helper to convert numbers to Arabic numerals
const toAr = (n: number | string) => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d, 10)]);
const fixed = (text: string) => (_w: number, _a: number) => text;
const roundVol = (vol: number): number => Math.round(vol * 2) / 2;

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
  'في مرض مزمن/حساسية شديدة أو أدوية ثابتة: راجعي الجرعة والتداخلات.',
];

const ZINC_WARNINGS = [
  ...GENERAL_SUPPLEMENT_WARNINGS,
  'قد يسبب غثيان/حموضة أو طعم معدني؛ يُفضل بعد الأكل.',
  'افصل ساعتين عن المضادات الحيوية (تتراسيكلين/كينولون) لتجنب تقليل الامتصاص.',
  'الجرعات العالية لفترات طويلة قد تقلل امتصاص النحاس.',
];

const ZINC_DIARRHEA_NOTE = [
  'في الإسهال عند الأطفال: غالباً يُستخدم ١٠–٢٠ مجم يومياً لمدة ١٠–١٤ يوم (حسب العمر) مع محلول الجفاف.',
];

const NAC_WARNINGS = [
  ...GENERAL_SUPPLEMENT_WARNINGS,
  'قد يسبب غثيان/حموضة؛ يفضل بعد الأكل.',
  'مرضى الربو: قد يزيد الكحة/الصفير؛ استخدم بحذر.',
];

// =========================
// Keyword & instruction enhancement
// =========================
const zincKeywordBoost = (m: Medication) => {
  const g = (m.genericName || '').toString().toLowerCase();
  const n = (m.name || '').toString().toLowerCase();

  const base = [
    '#zinc',
    '#zinc supplement',
    '#zinc_supplement',
    'zinc',
    'zinc supplement',
    'زنك',
    'مكمل زنك',
    'immunity',
    'مناعة',
    'diarrhea',
    'اسهال',
    'إسهال',
    'hair loss',
    'تساقط شعر',
    'acne',
    'حب الشباب',
  ];

  const dose = (m.concentration || '').toString();
  const doseAr = dose ? toAr(dose) : '';
  const dosePlain = dose.replace(/\s+/g, '').replace(/\./g, '').toLowerCase();

  const boost: string[] = [];
  if (n.includes('octozinc')) boost.push('octozinc', 'اكتوزنك');
  if (n.includes('sulfozinc')) boost.push('sulfozinc', 'سلفوزنك');
  if (n.includes('zinctron')) boost.push('zinctron', 'زينكترون');
  if (n.includes('zinc origin') || n.includes('origin')) boost.push('zinc origin', 'زنك اوريجين');
  if (n.includes('respovan')) boost.push('respovan', 'ريسبوفان', '#anti cough', '#mucolytic');

  if (g.includes('ascorbic')) boost.push('#vitamin c', 'vitamin c', 'vit c', 'فيتامين سي');
  if (g.includes('pyridox')) boost.push('#vitamin b', 'vitamin b6', 'b6', 'فيتامين ب٦');
  if (g.includes('copper')) boost.push('copper', 'نحاس');
  if (g.includes('acetyl')) boost.push('n-acetylcysteine', 'nac', 'مذيب بلغم');
  if (g.includes('ivy')) boost.push('ivy', 'لبلاب', 'كحة ببلغم', 'بلغم', 'productive cough');

  return uniq([...base, ...boost, dose, dosePlain, doseAr, m.name, m.genericName]);
};

const enhanceZincMedication = (m: Medication): Medication => ({
  ...m,
  matchKeywords: uniq([...(m.matchKeywords || []), ...zincKeywordBoost(m)]),
});

// =========================
// Zinc list (replace all previous items)
// =========================
const ZINC_GROUP_RAW: Medication[] = [
  // 1
  {
    id: 'octozinc-25mg-20-caps-zinc',
    name: 'Octozinc 25mg 20 caps',
    genericName: 'zinc',
    concentration: '25mg',
    price: 30,
    matchKeywords: ['octozinc 25', 'octozinc', 'zinc 25', 'اكتوزنك ٢٥', '#zinc supplement'],
    usage: 'مكمل زنك لدعم المناعة والجلد والشعر وحالات نقص الزنك.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsules',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً بعد الأكل.'),
    warnings: ZINC_WARNINGS,
  },

  // 2
  {
    id: 'sulfozinc-20mg-5ml-syrup-80ml-zinc',
    name: 'Sulfozinc 20mg/5ml syrup 80ml',
    genericName: 'zinc',
    concentration: '20mg/5ml',
    price: 15.5,
    matchKeywords: ['sulfozinc syrup 20mg/5ml', 'sulfozinc 80', 'سلفوزنك شراب', 'diarrhea zinc', 'اسهال'],
    usage: 'شراب زنك لدعم المناعة، وقد يُستخدم كجزء من علاج الإسهال عند الأطفال حسب الإرشادات.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Syrup',
    minAgeMonths: 0,
    maxAgeMonths: 144,
    minWeight: 3,
    maxWeight: 50,
    calculationRule: (_w, ageMonths) => (ageMonths < 6 ? '٢.٥ مل يومياً (١٠ مجم)' : '٥ مل يومياً (٢٠ مجم)'),
    warnings: [...ZINC_WARNINGS, ...ZINC_DIARRHEA_NOTE],
  },

  // 3
  {
    id: 'zinctron-30-caps-zinc',
    name: 'Zinctron 30 caps',
    genericName: 'copper & ascorbic acid (vitamin c) & zinc & pyridoxine hydrochloride (vitamin b6)',
    concentration: '30 caps',
    price: 126,
    matchKeywords: ['zinctron', 'زينكترون', 'zinc copper vitamin c', 'b6', '#zinc supplement'],
    usage: 'مكمل زنك مع نحاس وفيتامين C وB6 لدعم المناعة والجلد والشعر.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsules',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً بعد الأكل.'),
    warnings: ZINC_WARNINGS,
  },

  // 4
  {
    id: 'octozinc-25mg-1000-caps-zinc',
    name: 'Octozinc 25 mg 100*10 caps.',
    genericName: 'zinc',
    concentration: '25mg',
    price: 850,
    matchKeywords: ['octozinc 25 100*10', 'octozinc bulk', 'اكتوزنك عبوة كبيرة', '#zinc supplement'],
    usage: 'مكمل زنك (عبوة كبيرة) لدعم المناعة والجلد والشعر وحالات نقص الزنك.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsules',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً بعد الأكل.'),
    warnings: ZINC_WARNINGS,
  },

  // 5
  {
    id: 'zinc-origin-0-2gm-100ml-syrup-120ml-zinc',
    name: 'Zinc origin 0.2gm/100ml syrup 120 ml',
    genericName: 'zinc',
    concentration: '0.2gm/100ml (2mg/ml)',
    price: 31,
    matchKeywords: ['zinc origin 0.2', 'zinc origin syrup', 'زنك اوريجين شراب', '0.2gm/100ml', '#zinc supplement'],
    usage: 'شراب زنك للأطفال لدعم المناعة والنمو، ويُستخدم أيضاً كجزء من علاج الإسهال حسب الإرشادات.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Syrup',
    minAgeMonths: 6,
    maxAgeMonths: 144,
    minWeight: 5,
    maxWeight: 50,
    // Concentration: 2mg/ml. Standard pediatric zinc: 10mg/day (<6m) or 20mg/day (>=6m) for diarrhea.
    calculationRule: (w, _ageMonths) => `${toAr(roundVol(w / 2))} مل`,
    warnings: [...ZINC_WARNINGS, ...ZINC_DIARRHEA_NOTE],
  },

  // 6
  {
    id: 'sulfozinc-10mg-5ml-powder-for-susp-80ml-zinc',
    name: 'Sulfozinc 10mg/5ml pd. for susp. 80ml',
    genericName: 'zinc',
    concentration: '10mg/5ml',
    price: 22,
    matchKeywords: ['sulfozinc powder', 'sulfozinc suspension 10mg/5ml', 'سلفوزنك بودرة', 'susp', '#zinc supplement'],
    usage: 'زنك معلق (بعد التحضير) لدعم المناعة وقد يُستخدم كجزء من علاج الإسهال عند الأطفال حسب الإرشادات.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Oral Suspension',
    minAgeMonths: 0,
    maxAgeMonths: 144,
    minWeight: 3,
    maxWeight: 50,
    // Concentration 10mg/5ml => 2mg/ml
    calculationRule: (_w, ageMonths) => (ageMonths < 6 ? '٥ مل يومياً (١٠ مجم)' : '١٠ مل يومياً (٢٠ مجم)'),
    warnings: [...ZINC_WARNINGS, ...ZINC_DIARRHEA_NOTE],
  },

  // 7
  {
    id: 'respovan-120ml-syrup-zinc',
    name: 'Respovan 120 ml syrup',
    genericName: 'ivy & n acetyl cystain & zinc',
    concentration: '120ml',
    price: 60,
    matchKeywords: ['respovan', 'ريسبوفان', 'ivy', 'n acetyl cysteine', 'nac', 'mucolytic', 'anti cough', 'كحة', 'بلغم', '#anti cough', '#mucolytic', '#zinc'],
    usage: 'شراب للكحة ببلغم (مذيب بلغم) يحتوي على NAC + خلاصة لبلاب + زنك لدعم المناعة.',
    timing: '٣ مرات يومياً.',
    category: Category.PRODUCTIVE_COUGH,
    form: 'Syrup',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,
    calculationRule: (_w, ageMonths) => {
      if (ageMonths < 72) return '٢.٥ مل ٣ مرات يومياً';
      if (ageMonths < 144) return '٥ مل ٣ مرات يومياً';
      return '١٠ مل ٣ مرات يومياً';
    },
    warnings: [...NAC_WARNINGS, ...ZINC_WARNINGS, 'غير مناسب للأطفال أقل من سنتين. لا تجمع موسّع بلغم/ NAC مع مهدئ سعال؛ إن لزم ففاصل ٤–٦ ساعات وأقل مدة.'],
  },
];

export const ZINC_GROUP: Medication[] = ZINC_GROUP_RAW.map(enhanceZincMedication);

