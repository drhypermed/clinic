
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

const GENERAL_SUPPLEMENT_WARNINGS = [
  'لا تتجاوز الجرعة اليومية الموصى بها.',
  'إن وُجد حصوات كلى/قصور كلوي أو أدوية ثابتة: راجع الجرعة والتداخلات قبل الاستخدام.',
];

const VITAMIN_C_WARNINGS = [
  ...GENERAL_SUPPLEMENT_WARNINGS,
  'قد يسبب حموضة/مغص/إسهال مع الجرعات العالية؛ يُفضّل بعد الأكل إن سبب حموضة.',
  'الجرعات العالية لفترات طويلة قد تزيد خطر حصوات الكلى لدى من لديهم استعداد.',
];

const EFFERVESCENT_WARNINGS = [
  ...VITAMIN_C_WARNINGS,
  'الفوار قد يحتوي صوديوم؛ يُستخدم بحذر مع ضغط غير منضبط أو فشل قلبي.',
];

const ZINC_WARNINGS = [
  ...GENERAL_SUPPLEMENT_WARNINGS,
  'افصل ساعتين عن المضادات الحيوية (تتراسيكلين/كينولون) لتجنب تقليل الامتصاص.',
];

const FAT_SOLUBLE_VIT_WARNINGS = [
  ...GENERAL_SUPPLEMENT_WARNINGS,
  'تجنب الجمع مع مكملات أخرى تحتوي على فيتامين A/E بجرعات عالية.',
];

const vitaminCKeywordBoost = (m: Medication) => {
  const g = (m.genericName || '').toString().toLowerCase();
  const n = (m.name || '').toString().toLowerCase();

  const base = [
    '#vitamin c',
    '#vitamin_c',
    'vitamin c',
    'vit c',
    'ascorbic acid',
    'ascorbate',
    'فيتامين سي',
    'فيتامين c',
    'اسكوربيك',
    'حمض الاسكوربيك',
    'مناعة',
    'نزلات البرد',
    'برد',
    'انفلونزا',
    'إنفلونزا',
    'antioxidant',
    'مضاد اكسدة',
  ];

  const dose = (m.concentration || '').toString();
  const doseAr = dose ? toAr(dose) : '';
  const dosePlain = dose.replace(/\s+/g, '').replace(/\./g, '').toLowerCase();

  const boost: string[] = [];
  if (g.includes('zinc') || n.includes('plus') || n.includes('lemox')) boost.push('zinc', 'زنك');
  if (n.includes('redoxon')) boost.push('redoxon', 'ريدكسون');
  if (n.includes('vitacid')) boost.push('vitacid', 'فيتاسيد');
  if (n.includes('fawar')) boost.push('فوار', 'effervescent', 'eff', 'فوار سي');
  if (n.includes('drops')) boost.push('drops', 'oral drops', 'نقط', 'قطرة');

  return uniq([...base, ...boost, dose, dosePlain, doseAr, m.name, m.genericName]);
};

const enhanceVitaminCMedication = (m: Medication): Medication => ({
  ...m,
  matchKeywords: uniq([...(m.matchKeywords || []), ...vitaminCKeywordBoost(m)]),
});

const VITAMINS_C_RAW: Medication[] = [
  // 1
  {
    id: 'vitacid-c-1gm-12-eff-tabs-vitc',
    name: 'Vitacid C 1gm 12 eff. tab.',
    genericName: 'ascorbic acid (vitamin c)',
    concentration: '1000mg',
    price: 54,
    matchKeywords: ['vitacid c 1gm', 'vitacid c 1000', 'vitacid', 'فيتاسيد سي', 'برد', 'مناعة'],
    usage: 'فيتامين C لرفع المناعة ودعم نزلات البرد ومضاد أكسدة.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Effervescent Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    calculationRule: fixed('قرص فوار واحد يومياً.'),
    warnings: EFFERVESCENT_WARNINGS,
  },

  // 2
  {
    id: 'vitacid-c-500mg-12-eff-gran-sachets-vitc',
    name: 'Vitacid C 500mg 12 eff. gran. in sachets',
    genericName: 'ascorbic acid (vitamin c)',
    concentration: '500mg (12 sachets)',
    price: 16,
    matchKeywords: ['vitacid c 500', 'فيتاسيد ٥٠٠', 'sachet', 'ساشيه', 'مناعة'],
    usage: 'فيتامين C جرعة متوسطة لدعم المناعة ونزلات البرد.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Sachets',
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    calculationRule: fixed('ساشيه واحد يومياً.'),
    warnings: EFFERVESCENT_WARNINGS,
  },

  // 3
  {
    id: 'vitacid-c-1000mg-12-eff-gran-sachets-vitc',
    name: 'Vitacid C 1000mg 12 eff. gran. in sachets',
    genericName: 'vitamin c',
    concentration: '1000mg (12 sachets)',
    price: 54,
    matchKeywords: ['vitacid c 1000 sachets', 'فيتاسيد ١٠٠٠ ساشيه', 'مناعة', 'برد'],
    usage: 'فيتامين C (١ جم) لدعم المناعة ونزلات البرد.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Sachets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    calculationRule: fixed('ساشيه واحد يومياً.'),
    warnings: EFFERVESCENT_WARNINGS,
  },

  // 4
  {
    id: 'c-retard-500mg-10-caps-vitc',
    name: 'C-retard 500mg 10 caps',
    genericName: 'ascorbic acid (vitamin c)',
    concentration: '500mg',
    price: 35,
    matchKeywords: ['c-retard 500', 'c retard', 'سي ريتارد', 'sustained release', 'retard', 'مناعة'],
    usage: 'فيتامين C ممتد المفعول لدعم المناعة.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Sustained-release Capsule',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً بعد الأكل.'),
    warnings: VITAMIN_C_WARNINGS,
  },

  // 5
  {
    id: 'vitacid-c-plus-12-eff-tabs-vitc',
    name: 'Vitacid C plus 12 eff tablet',
    genericName: 'vitamin c & zinc',
    concentration: '1000mg + zinc',
    price: 35,
    matchKeywords: ['vitacid c plus', 'vitacid plus', 'فيتاسيد سي بلس', 'zinc', 'زنك', 'مناعة'],
    usage: 'فيتامين C مع زنك لدعم المناعة خصوصاً مع نزلات البرد.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Effervescent Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    calculationRule: fixed('قرص فوار واحد يومياً.'),
    warnings: [...EFFERVESCENT_WARNINGS, ...ZINC_WARNINGS],
  },

  // 6
  {
    id: 'c-vit-drops-10g-100ml-15ml-vitc',
    name: 'C-vit drops 10 gm/100 ml drops 15 ml',
    genericName: 'ascorbic acid (vitamin c)',
    concentration: '10g/100ml (100mg/ml) - 15ml',
    price: 25,
    matchKeywords: ['c-vit drops', 'c vit drops', 'سي فيت نقط', 'vitamin c drops', 'نقط فيتامين سي'],
    usage: 'نقط فيتامين C للأطفال (دعم المناعة/نزلات البرد).',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Oral Drops',
    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 2,
    maxWeight: 250,
    calculationRule: (_w, ageMonths) => {
      if (ageMonths < 12) return '٠.٥ مل يومياً (≈ ٥٠ مجم)';
      if (ageMonths < 72) return '١ مل يومياً (≈ ١٠٠ مجم)';
      return '١–٢ مل يومياً (≈ ١٠٠–٢٠٠ مجم) حسب الحاجة';
    },
    warnings: VITAMIN_C_WARNINGS,
  },

  // 7
  {
    id: 'marvy-c-oral-drops-15ml-vitc',
    name: 'Marvy C oral drops 15 ml',
    genericName: 'vitamin c',
    concentration: '15ml',
    price: 40,
    matchKeywords: ['marvy c', 'مارفي سي', 'vitamin c drops', 'نقط', 'مناعة'],
    usage: 'نقط فيتامين C لدعم المناعة (حسب تركيز العبوة).',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Oral Drops',
    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 2,
    maxWeight: 250,
    calculationRule: fixed('الجرعة تعتمد على تركيز العبوة: شائع ٠.٥–١ مل يومياً بعد الأكل.'),
    warnings: VITAMIN_C_WARNINGS,
  },

  // 8
  {
    id: 'lemox-30-tabs-vitc',
    name: 'Lemox 30 tabs.',
    genericName: 'vitamin c & zinc & vitamin e & beta carotene & selenium',
    concentration: '30 tabs',
    price: 65,
    matchKeywords: ['lemox', 'ليموكس', 'selenium', 'beta carotene', 'vitamin e', 'zinc', 'مناعة', 'مضاد اكسدة'],
    usage: 'مضاد أكسدة مع فيتامين C + زنك + سيلينيوم لدعم المناعة.',
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

  // 9
  {
    id: 'vitamin-c-plus-sedico-10-eff-sachets-vitc',
    name: 'Vitamin C plus sedico 10 eff. sachets',
    genericName: 'ascorbic acid (vitamin c) & zinc',
    concentration: 'vitamin c + zinc (10 sachets)',
    price: 16,
    matchKeywords: ['vitamin c plus sedico', 'sedico vitamin c plus', 'سيديكو فيتامين سي بلس', 'zinc', 'زنك'],
    usage: 'فيتامين C مع زنك لدعم المناعة.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Sachets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    calculationRule: fixed('ساشيه واحد يومياً.'),
    warnings: [...EFFERVESCENT_WARNINGS, ...ZINC_WARNINGS],
  },

  // 10
  {
    id: 'vitamin-c-sedico-1g-10-eff-sachets-vitc',
    name: 'Vitamin C sedico 1g 10 eff. sachets',
    genericName: 'ascorbic acid',
    concentration: '1000mg (10 sachets)',
    price: 13.5,
    matchKeywords: ['vitamin c sedico 1g', 'sedico 1g', 'سيديكو ١ جم', 'فوار سي'],
    usage: 'فيتامين C (١ جم) لدعم المناعة ونزلات البرد.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Sachets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    calculationRule: fixed('ساشيه واحد يومياً.'),
    warnings: EFFERVESCENT_WARNINGS,
  },

  // 11
  {
    id: 'ascorbic-acid-oral-drops-15ml-vitc',
    name: 'Ascorbic acid oral drops 15 ml',
    genericName: 'vitamin c',
    concentration: '15ml',
    price: 35,
    matchKeywords: ['ascorbic acid drops', 'vitamin c drops', 'نقط فيتامين سي', 'اسكوربيك نقط'],
    usage: 'نقط فيتامين C لدعم المناعة (حسب تركيز العبوة).',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Oral Drops',
    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 2,
    maxWeight: 250,
    calculationRule: fixed('الجرعة تعتمد على تركيز العبوة: شائع ٠.٥–١ مل يومياً بعد الأكل.'),
    warnings: VITAMIN_C_WARNINGS,
  },

  // 12
  {
    id: 'fawar-c-1gm-6-eff-sachets-vitc',
    name: 'Fawar C 1 gm 6 eff. sachets',
    genericName: 'ascorbic acid',
    concentration: '1000mg (6 sachets)',
    price: 8,
    matchKeywords: ['fawar c', 'فوار سي', 'fawar', 'eff sachet', 'برد'],
    usage: 'فيتامين C فوار لدعم المناعة.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Sachets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    calculationRule: fixed('ساشيه واحد يومياً.'),
    warnings: EFFERVESCENT_WARNINGS,
  },

  // 13
  {
    id: 'redoxon-1gm-15-eff-tabs-vitc',
    name: 'Redoxon 1 gm 15 eff. tabs.',
    genericName: 'vitamin c',
    concentration: '1000mg',
    price: 395,
    matchKeywords: ['redoxon 1gm', 'redoxon 1000', 'ريدكسون ١ جم', 'eff tab'],
    usage: 'فيتامين C فوار لدعم المناعة ومضاد أكسدة.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Effervescent Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    calculationRule: fixed('قرص فوار واحد يومياً.'),
    warnings: EFFERVESCENT_WARNINGS,
  },
];

export const VITAMINS_C: Medication[] = VITAMINS_C_RAW.map(enhanceVitaminCMedication);

