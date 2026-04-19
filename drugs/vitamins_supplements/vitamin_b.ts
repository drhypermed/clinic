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
  'في الحمل/الرضاعة أو مرض مزمن أو أدوية ثابتة: راجعي الجرعة والتداخلات.',
];

const B6_WARNINGS = [
  ...GENERAL_SUPPLEMENT_WARNINGS,
  'الجرعات العالية من فيتامين B6 لفترات طويلة قد تسبب تنميل/اعتلال أعصاب؛ لا تُطيل الاستخدام دون متابعة.',
];

const FOLATE_WARNINGS = [
  ...GENERAL_SUPPLEMENT_WARNINGS,
  'حمض الفوليك قد يُخفي أعراض نقص فيتامين B12؛ لا تستخدمه لفترات طويلة دون تقييم إذا لديك أنيميا شديدة/تنميل.',
];

const B12_WARNINGS = [
  ...GENERAL_SUPPLEMENT_WARNINGS,
  'عادة آمن، وقد يسبب اضطراب معدة خفيف أو صداع عند بعض الأشخاص.',
];

const INJECTION_WARNINGS = [
  'للإعطاء بالمستشفى/العيادة فقط (عضل/وريد).',
  'قد يسبب ألم/احمرار مكان الحقن (عادة بسيط).',
  'الحقن الوريدي (إن وجد) يجب أن يكون ببطء وبواسطة مختص.',
  'قد يسبب حساسية؛ اطلب مساعدة طبية عند تورم/ضيق نفس/طفح شديد.',
];

const GINKGO_WARNINGS = [
  ...GENERAL_SUPPLEMENT_WARNINGS,
  'قد يزيد قابلية النزف (جينكو)؛ يُستخدم بحذر مع أدوية السيولة/الأسبرين أو قبل العمليات.',
];

const NSAID_WARNINGS = [
  'يُؤخذ بعد الأكل لتقليل تهيج المعدة.',
  'يُتجنب مع قرحة/نزيف معدة، قصور كلوي، أو حساسية سابقة من مضادات الالتهاب.',
  'لا تجمع اثنين من مضادات الالتهاب (إيبوبروفين+نابروكسين)؛ يزيد خطر نزيف/قرحة.',
  'الحمل: يُتجنب خصوصاً في الثلث الأخير.',
];

const ALA_WARNINGS = [
  ...GENERAL_SUPPLEMENT_WARNINGS,
  'قد يُخفض سكر الدم؛ مرضى السكر يراقبوا السكر خصوصاً في البداية.',
  'قد يسبب حموضة/غثيان؛ يفضل بعد الأكل إذا سبب تهيج معدة.',
];

// =========================
// Keyword & instruction enhancement
// =========================
const vitaminBKeywordBoost = (m: Medication) => {
  const g = (m.genericName || '').toString().toLowerCase();
  const n = (m.name || '').toString().toLowerCase();

  const base = [
    '#vitamin b',
    '#vitamin_b',
    'vitamin b',
    'vit b',
    'b complex',
    'b-complex',
    'فيتامين ب',
    'فيتامين ب المركب',
    'مقوي اعصاب',
    'مقوي أعصاب',
    'اعصاب',
    'أعصاب',
    'neuropathy',
    'nerve pain',
    'numbness',
    'tingling',
    'تنميل',
    'شكشكة',
    'حرقان',
    'fatigue',
    'tiredness',
    'ارهاق',
    'إرهاق',
    'anemia',
    'انيميا',
    'أنيميا',
  ];

  const dose = (m.concentration || '').toString();
  const doseAr = dose ? toAr(dose) : '';
  const dosePlain = dose.replace(/\s+/g, '').replace(/\./g, '').toLowerCase();

  const boost: string[] = [];

  // B12 types
  if (g.includes('cyanocobalamin')) boost.push('cyanocobalamin', 'سيانوكوبالامين', 'b12', 'vitamin b12', '#vitamin b12', '#vitamin_b12');
  if (g.includes('hydroxocobalamin')) boost.push('hydroxocobalamin', 'هيدروكسوكوبالامين', 'b12', 'vitamin b12', '#vitamin b12', '#vitamin_b12');
  if (g.includes('methylcobal') || g.includes('mecobal')) boost.push('methylcobalamin', 'mecobalamin', 'ميثيل كوبالامين', 'ميكوبالامين', 'b12', 'vitamin b12', '#vitamin b12', '#vitamin_b12');

  // B1/B6 keywords
  if (g.includes('thiamine') || g.includes('benfotiamine')) boost.push('thiamine', 'benfotiamine', 'فيتامين ب1', 'بنفوتيامين', 'b1');
  if (g.includes('pyridox') || n.includes('pyrido')) boost.push('pyridoxine', 'pyridoxal', 'vitamin b6', 'فيتامين ب6', 'b6');

  // Folate
  if (g.includes('folic') || g.includes('folate')) boost.push('folic acid', 'folate', 'methylfolate', 'quadrafolic', 'فوليك', 'حمض الفوليك', 'ميثيل فولات', '#folic acid', '#folic_acid');

  // Forms
  const form = (m.form || '').toString().toLowerCase();
  if (form.includes('ampoule') || form.includes('vial')) boost.push('injection', 'ampoule', 'im', 'iv', 'حقن', 'حقنة');
  if (n.includes('sublingual') || form.includes('orodispersible')) boost.push('sublingual', 'under tongue', 'تحت اللسان');
  if (form.includes('film')) boost.push('film', 'orodissolvable', 'oro dispersible film', 'فيلم', 'شريط يذوب');
  if (form.includes('lozenge')) boost.push('lozenge', 'استحلاب');

  // Product hints
  if (n.includes('milga')) boost.push('milga', 'ميلجا');
  if (n.includes('neurobion')) boost.push('neurobion', 'نيوروبيون');
  if (n.includes('betolvex')) boost.push('betolvex', 'بيتولفيكس');
  if (n.includes('depovit')) boost.push('depovit', 'ديبوفيت');
  if (n.includes('depofort')) boost.push('depofort', 'ديبوفورت');

  // NSAID combos
  if (g.includes('diclofenac') || n.includes('arthineur') || n.includes('pain reliefer')) boost.push('#nsaid', 'nsaid', 'diclofenac', 'ديكلوفيناك', 'مسكن', 'مضاد التهاب');

  // Ginkgo combos
  if (g.includes('ginkgo') || n.includes('gicyano')) boost.push('ginkgo', 'ginkgo biloba', 'جينكو', '#ginkgo biloba');

  return uniq([...base, ...boost, dose, dosePlain, doseAr, m.name, m.genericName]);
};

const enhanceVitaminBMedication = (m: Medication): Medication => ({
  ...m,
  matchKeywords: uniq([...(m.matchKeywords || []), ...vitaminBKeywordBoost(m)]),
});

// =========================
// Vitamin B list (replace all previous items)
// =========================
const VITAMIN_B_GROUP_RAW: Medication[] = [
  // 1
  {
    id: 'betolvex-1mgml-2-prefilled-syringe-im-vitb',
    name: 'Betolvex 1mg/ml 2 pre-filled syringe i.m.',
    genericName: 'cyanocobalamin',
    concentration: '1mg/ml',
    price: 110,
    matchKeywords: ['betolvex prefilled', 'prefilled syringe', 'بيتولفيكس سرنجة', 'b12 deficiency', 'نقص ب12', '#vitamin b', '#vitamin b12'],
    usage: 'حقن فيتامين B12 لعلاج نقص ب12 والأنيميا المرتبطة به والتنميل/التهاب الأعصاب حسب التشخيص والتحاليل.',
    timing: 'حسب البروتوكول.',
    category: Category.VITAMINS_MINERALS,
    form: 'Ampoule (IV/IM)',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: fixed('حقنة عضل عميق: ١ مجم (عادة أسبوعياً ثم صيانة شهرياً حسب الحالة).'),
    warnings: [...INJECTION_WARNINGS, ...B12_WARNINGS],
  },

  // 2
  {
    id: 'betolvex-1mgml-2-amp-vitb',
    name: 'Betolvex 1mg/ml 2 amp',
    genericName: 'cyanocobalamin',
    concentration: '1mg/ml',
    price: 64,
    matchKeywords: ['betolvex amp', 'بيتولفيكس امبول', 'b12', 'اعصاب', 'تنميل', '#vitamin b', '#vitamin b12'],
    usage: 'حقن فيتامين B12 لعلاج نقص ب12 والأنيميا/أعراض الأعصاب.',
    timing: 'حسب البروتوكول.',
    category: Category.VITAMINS_MINERALS,
    form: 'Ampoule (IV/IM)',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: fixed('أمبول عضل عميق: ١ مجم (عادة أسبوعياً ثم صيانة).'),
    warnings: [...INJECTION_WARNINGS, ...B12_WARNINGS],
  },

  // 3
  {
    id: 'milga-advance-30-fc-tabs-vitb',
    name: 'Milga advance 30 f.c. tabs',
    genericName: 'benfotiamine & cyanocobalamine & pyridoxine',
    concentration: '30 f.c. tabs',
    price: 150,
    matchKeywords: ['milga advance', 'ميلجا ادفانس', 'benfotiamine', 'diabetic neuropathy', 'اعصاب السكر', '#vitamin b'],
    usage: 'مقوّي للأعصاب (بنفوتيامين + ب6 + ب12) لاعتلال الأعصاب الطرفية والتنميل خاصة مع السكري.',
    timing: 'مرة إلى مرتين يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Film-coated Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    calculationRule: fixed('قرص ١–٢ مرة يومياً بعد الأكل حسب شدة الأعراض.'),
    warnings: B6_WARNINGS,
  },

  // 4
  {
    id: 'becozyme-im-iv-12-amp-vitb',
    name: 'Becozyme i.m./i.v. 12 amp',
    genericName: 'riboflavin (vitamin b2) & vitamin b1 (thiamine) & pyridoxine',
    concentration: '12 amp',
    price: 120,
    matchKeywords: ['becozyme', 'بيكوزيم', 'b complex injection', 'ارهاق', '#vitamin b'],
    usage: 'حقن فيتامين ب مركب لدعم الأعصاب والنشاط في حالات نقص فيتامينات ب.',
    timing: 'مرة إلى مرتين أسبوعياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Ampoule (IV/IM)',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: fixed('أمبول ١ مرة إلى مرتين أسبوعياً حسب الحالة.'),
    warnings: [...INJECTION_WARNINGS, ...B6_WARNINGS],
  },

  // 5
  {
    id: 'depovit-b12-1000mcgml-3-im-amps-vitb',
    name: 'Depovit B12-1000mcg/ml 3 i.m. amps.',
    genericName: 'hydroxocobalamin',
    concentration: '1000mcg/ml',
    price: 51,
    matchKeywords: ['depovit b12 3', 'ديبوفيت ب12', 'hydroxocobalamin', '#vitamin b12'],
    usage: 'حقن B12 ممتد المفعول لعلاج نقص ب12 والأنيميا وأعراض الأعصاب حسب التشخيص والتحاليل.',
    timing: 'عادة أسبوعياً ثم صيانة.',
    category: Category.VITAMINS_MINERALS,
    form: 'Ampoule (IV/IM)',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: fixed('أمبول ١ (١٠٠٠ ميكروجرام) أسبوعياً ٤ أسابيع ثم شهرياً حسب الحالة.'),
    warnings: [...INJECTION_WARNINGS, ...B12_WARNINGS],
  },

  // 6
  {
    id: 'depovit-b12-1000mcgml-5-im-amp-vitb',
    name: 'Depovit B12-1000mcg/ml 5 i.m. amp',
    genericName: 'hydroxocobalamin',
    concentration: '1000mcg/ml',
    price: 85,
    matchKeywords: ['depovit b12 5', 'ديبوفيت ٥ امبول', 'b12 injection', '#vitamin b'],
    usage: 'حقن B12 ممتد المفعول لعلاج نقص ب12 والأنيميا/التنميل.',
    timing: 'عادة أسبوعياً ثم صيانة.',
    category: Category.VITAMINS_MINERALS,
    form: 'Ampoule (IV/IM)',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: fixed('أمبول ١ أسبوعياً ٤ أسابيع ثم شهرياً حسب الحالة.'),
    warnings: [...INJECTION_WARNINGS, ...B12_WARNINGS],
  },

  // 7
  {
    id: 'methyltechno-1000mcg-30-orodissolvable-films-vitb',
    name: 'Methyltechno 1000mcg 30 orodissolvable films',
    genericName: 'methylcobalamin',
    concentration: '1000mcg',
    price: 135,
    matchKeywords: ['methyltechno', 'ميثيل تكنو', 'film b12', 'امتصاص', '#vitamin b12'],
    usage: 'فيتامين B12 نشط (ميثيل كوبالامين) في صورة فيلم يذوب بالفم—مناسب لمن لديهم صعوبة امتصاص.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Orodispersible Film',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('فيلم واحد يومياً.'),
    warnings: B12_WARNINGS,
  },

  // 8
  {
    id: 'bswift-1000mcg-30-sublingual-disp-tabs-vitb',
    name: 'Bswift 1000 mcg 30 sublingual disp. tabs.',
    genericName: 'methylcobalamin',
    concentration: '1000mcg',
    price: 95,
    matchKeywords: ['bswift', 'بي سويفت', 'sublingual b12', 'تحت اللسان', '#vitamin b12'],
    usage: 'فيتامين B12 نشط (ميثيل كوبالامين) أقراص تحت اللسان لدعم الأعصاب والأنيميا الناتجة عن نقص ب12.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Orodispersible Tablet',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً تحت اللسان.'),
    warnings: B12_WARNINGS,
  },

  // 9
  {
    id: 'deltavit-b12-1mg-30-sublingual-tab-vitb',
    name: 'Deltavit b12 1mg 30 sublingual tab',
    genericName: 'cyanocobalamin (vitamin b12)',
    concentration: '1mg (1000mcg)',
    price: 75,
    matchKeywords: ['deltavit b12', 'دلتا فيت ب12', 'cyanocobalamin sublingual', '#vitamin b12'],
    usage: 'فيتامين B12 (سيانوكوبالامين) أقراص تحت اللسان لعلاج/دعم نقص ب12.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Orodispersible Tablet',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً تحت اللسان.'),
    warnings: B12_WARNINGS,
  },

  // 10
  {
    id: 'milga-40-tablets-vitb',
    name: 'Milga 40 tablets',
    genericName: 'benfotiamine & cyanocobalamine & pyridoxine',
    concentration: '40 tabs',
    price: 108,
    matchKeywords: ['milga', 'ميلجا ٤٠', 'تنميل', 'اعصاب', '#vitamin b'],
    usage: 'مقوّي أعصاب (بنفوتيامين + ب6 + ب12) للتنميل والتهاب الأعصاب الطرفية.',
    timing: 'مرة إلى ثلاث مرات يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('قرص بعد الأكل ١–٣ مرات يومياً حسب شدة الأعراض والبروتوكول.'),
    warnings: B6_WARNINGS,
  },

  // 11
  {
    id: 'neuroton-30-tab-vitb',
    name: 'Neuroton 30 tab',
    genericName: 'folic acid & pyridoxine hydrochloride (vitamin b6) & cyanocobalamin',
    concentration: '30 tabs',
    price: 96,
    matchKeywords: ['neuroton', 'نيوروتون', 'folic acid', 'b6', 'b12', 'انيميا', 'تنميل', '#vitamin b'],
    usage: 'فوليك + B6 + B12 لدعم تكوين الدم ودعم الأعصاب (حسب الحالة).',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً بعد الأكل.'),
    warnings: [...FOLATE_WARNINGS, ...B6_WARNINGS],
  },

  // 12
  {
    id: 'neurovit-30-sugar-coated-tab-vitb',
    name: 'Neurovit 30 sugar coated tab',
    genericName: 'vitamin b1 & vitamin b6 & vitamin b12',
    concentration: '30 tabs',
    price: 102,
    matchKeywords: ['neurovit 30', 'نيوروفيت ٣٠', 'b1 b6 b12', 'اعصاب', 'تنميل', '#vitamin b'],
    usage: 'فيتامينات ب (B1+B6+B12) كمقوّي أعصاب ودعم للإرهاق/التنميل.',
    timing: 'مرة إلى ثلاث مرات يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Sugar Coated Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('قرص بعد الأكل ١–٣ مرات يومياً حسب البروتوكول.'),
    warnings: B6_WARNINGS,
  },

  // 13
  {
    id: 'b-com-im-iv-6-amp-vitb',
    name: 'B-com i.m./i.v. 6 amp',
    genericName: 'vitamin b complex',
    concentration: '6 amp',
    price: 48,
    matchKeywords: ['b-com', 'بي كوم', 'حقن ب مركب', 'ارهاق', '#vitamin b'],
    usage: 'حقن فيتامين ب مركب لدعم الأعصاب والنشاط في حالات نقص فيتامينات ب.',
    timing: 'كل ٣ أيام (٢–٣ أسابيع ثم حسب الحالة).',
    category: Category.VITAMINS_MINERALS,
    form: 'Ampoule (IV/IM)',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: fixed('أمبول ١ كل ٣ أيام (جرعة شائعة).'),
    warnings: INJECTION_WARNINGS,
  },

  // 14
  {
    id: 'biovit-12-depot-2-amp-vitb',
    name: 'Biovit 12 depot 2 amp',
    genericName: 'folic acid & hydroxocobalamin & pyridoxine hydrochloride (vitamin b6)',
    concentration: '2 amp',
    price: 28,
    matchKeywords: ['biovit 12 depot', 'بيوفيت ١٢ ديبوت', 'folic', 'b12 depot', '#vitamin b12', '#folic acid'],
    usage: 'حقن ب12 (ديبوت) مع فوليك وB6 لدعم الأعصاب وتكوين الدم حسب التشخيص والتحاليل.',
    timing: 'أسبوعياً أو حسب الحالة/التحاليل.',
    category: Category.VITAMINS_MINERALS,
    form: 'Ampoule (IV/IM)',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: fixed('أمبول ١ عضل أسبوعياً (شائع) ثم صيانة حسب الحالة.'),
    warnings: [...INJECTION_WARNINGS, ...FOLATE_WARNINGS, ...B6_WARNINGS],
  },

  // 15
  {
    id: 'foliplex-24-lozenges-vitb',
    name: 'Foliplex 24 lozenges',
    genericName: 'folic acid & vitamin b complex',
    concentration: '24 lozenges',
    price: 80,
    matchKeywords: ['foliplex', 'فولي بليكس', 'lozenges', 'استحلاب', 'folic acid', '#folic acid', '#vitamin b'],
    usage: 'فوليك + مجموعة فيتامين ب لدعم تكوين الدم والطاقة حسب الحاجة.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Lozenge',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('قرص استحلاب واحد يومياً.'),
    warnings: FOLATE_WARNINGS,
  },

  // 16
  {
    id: 'livabion-6-im-amp-2ml-vitb',
    name: 'Livabion 6 i.m. amp. 2 ml',
    genericName: 'thiamine (vitamin b1) & pyridoxine hydrochloride (vitamin b6) & cyanocobalamin (vitamin b12)',
    concentration: '2ml ampoule',
    price: 96,
    matchKeywords: ['livabion', 'ليفابيون', 'b1 b6 b12 injection', 'اعصاب', '#vitamin b'],
    usage: 'حقن فيتامينات ب (B1+B6+B12) لدعم التهاب الأعصاب والتنميل حسب التشخيص والتحاليل.',
    timing: 'كل ٣ أيام (٢–٣ أسابيع ثم حسب الحالة).',
    category: Category.VITAMINS_MINERALS,
    form: 'Ampoule (IV/IM)',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: fixed('أمبول ١ عضل كل ٣ أيام (شائع).'),
    warnings: [...INJECTION_WARNINGS, ...B6_WARNINGS],
  },

  // 17
  {
    id: 'methyl-folate-orchidia-30-caps-vitb',
    name: 'Methyl folate (Orchidia) 30 caps.',
    genericName: 'l-methylfolate & vitamin b12',
    concentration: '30 caps',
    price: 120,
    matchKeywords: ['methyl folate orchidia', 'orchidia methyl folate', 'اوركيديا', 'mthfr', 'active folate', '#folic acid', '#vitamin b12'],
    usage: 'فوليك نشط (ميثيل فولات) مع B12 لدعم الحمل/الخصوبة وتكوين الدم حسب الحالة.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsules',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً بعد الأكل.'),
    warnings: [...FOLATE_WARNINGS, ...B12_WARNINGS],
  },

  // 18
  {
    id: 'neurovit-6-im-amps-vitb',
    name: 'Neurovit 6 i.m. amps',
    genericName: 'vitamin b1 & vitamin b6 & vitamin b12',
    concentration: '6 amp',
    price: 66,
    matchKeywords: ['neurovit 6 amp', 'نيوروفيت حقن', 'b1 b6 b12', '#vitamin b'],
    usage: 'حقن فيتامينات ب (B1+B6+B12) لالتهاب الأعصاب والتنميل حسب التشخيص والتحاليل.',
    timing: 'كل ٣ أيام.',
    category: Category.VITAMINS_MINERALS,
    form: 'Ampoule (IV/IM)',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: fixed('أمبول ١ عضل كل ٣ أيام (شائع).'),
    warnings: [...INJECTION_WARNINGS, ...B6_WARNINGS],
  },

  // 19
  {
    id: 'omnevora-8-im-amp-2ml-vitb',
    name: 'Omnevora 8 i.m. amp. 2 ml',
    genericName: 'folic acid & nicotinamide & orotic acid & d-panthenol & thiamine (vitamin b1) & pyridoxine',
    concentration: '2ml ampoule',
    price: 128,
    matchKeywords: ['omnevora', 'اومنڤورا', 'b complex injection', 'folic acid injection', '#vitamin b'],
    usage: 'حقن فيتامينات ب مركبة مع فوليك لدعم نقص الفيتامينات والإرهاق حسب التشخيص والتحاليل.',
    timing: 'مرة إلى مرتين أسبوعياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Ampoule (IV/IM)',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: fixed('أمبول ١ مرة إلى مرتين أسبوعياً حسب الحالة.'),
    warnings: [...INJECTION_WARNINGS, ...FOLATE_WARNINGS, ...B6_WARNINGS],
  },

  // 20
  {
    id: 'power-b-complex-im-iv-6-amp-vitb',
    name: 'Power B complex i.m./i.v. 6 amp',
    genericName: 'vitamin b1 (thiamine) & riboflavin (vitamin b2) & pyridoxine (vitamin b6)',
    concentration: '6 amp',
    price: 48,
    matchKeywords: ['power b complex', 'باور بي', 'b complex amp', 'ارهاق', '#vitamin b'],
    usage: 'حقن فيتامين ب مركب لدعم النشاط والأعصاب في حالات النقص.',
    timing: 'كل ٣ أيام (٢–٣ أسابيع ثم حسب الحالة).',
    category: Category.VITAMINS_MINERALS,
    form: 'Ampoule (IV/IM)',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: fixed('أمبول ١ كل ٣ أيام (جرعة شائعة).'),
    warnings: [...INJECTION_WARNINGS, ...B6_WARNINGS],
  },

  // 21
  {
    id: 'novocobal-1mg-30-sublingual-tabs-vitb',
    name: 'Novocobal 1 mg 30 sublingual tabs.',
    genericName: 'methylcobalamin',
    concentration: '1mg (1000mcg)',
    price: 67,
    matchKeywords: ['novocobal 30', 'نوفوكوبال ٣٠', 'b12 sublingual', '#vitamin b12'],
    usage: 'فيتامين B12 نشط أقراص تحت اللسان لدعم الأعصاب والأنيميا الناتجة عن نقص ب12.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Orodispersible Tablet',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً تحت اللسان.'),
    warnings: B12_WARNINGS,
  },

  // 22
  {
    id: 'depofort-b12-1mgml-5-amp-vitb',
    name: 'Depofort b12 1mg/ml 5 amp.',
    genericName: 'hydroxocobalamin acetate',
    concentration: '1mg/ml',
    price: 55,
    matchKeywords: ['depofort b12 5', 'ديبوفورت ب12', 'b12 injection', '#vitamin b12'],
    usage: 'حقن B12 ممتد المفعول لعلاج نقص ب12 والأنيميا/أعراض الأعصاب حسب التشخيص والتحاليل.',
    timing: 'حسب البروتوكول.',
    category: Category.VITAMINS_MINERALS,
    form: 'Ampoule (IV/IM)',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: fixed('أمبول ١ أسبوعياً ثم صيانة حسب الحالة.'),
    warnings: [...INJECTION_WARNINGS, ...B12_WARNINGS],
  },

  // 23
  {
    id: 'pain-reliefer-30-caps-vitb',
    name: 'Pain reliefer 30 caps.',
    genericName: 'diclofenac sodium & vitamin b1 & vitamin b6 & vitamin b12',
    concentration: '30 caps',
    price: 72,
    matchKeywords: ['pain reliefer', 'بين رليفر', 'diclofenac b complex', 'مسكن اعصاب', '#nsaid', '#vitamin b'],
    usage: 'مسكن ومضاد التهاب (ديكلوفيناك) مع فيتامينات ب لدعم ألم الأعصاب/العضلات حسب الحالة.',
    timing: 'مرة إلى مرتين يومياً لفترة قصيرة.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('كبسولة بعد الأكل مرة إلى مرتين يومياً حسب الألم (لفترة قصيرة).'),
    warnings: NSAID_WARNINGS,
  },

  // 24
  {
    id: 'gicyano-30-fc-tabs-vitb',
    name: 'Gicyano 30 f.c tabs',
    genericName: 'ginkgo biloba extract & vitamin b12 & vitamin b6 & vitamin b1 & glutamic acid',
    concentration: '30 f.c. tabs',
    price: 180,
    matchKeywords: ['gicyano', 'جيسيانو', 'ginkgo b12', 'memory', 'ذاكرة', '#ginkgo biloba', '#vitamin b'],
    usage: 'مقوّي للأعصاب والدورة الدموية الطرفية (جينكو + فيتامينات ب) وقد يفيد التركيز حسب الحالة.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Film-coated Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً بعد الأكل.'),
    warnings: [...GINKGO_WARNINGS, ...B6_WARNINGS],
  },

  // 25
  {
    id: 'arthineur-10-caps-vitb',
    name: 'Arthineur 10 caps.',
    genericName: 'diclofenac sodium & vitamin b1 (thiamine) & pyridoxine hydrochloride (vitamin b6) & cyanocobalamin (vitamin b12)',
    concentration: '10 caps',
    price: 23,
    matchKeywords: ['arthineur', 'ارثينير', 'diclofenac b1 b6 b12', 'مسكن', '#nsaid', '#vitamin b'],
    usage: 'مسكن ومضاد التهاب (ديكلوفيناك) مع فيتامينات ب لدعم ألم الأعصاب/الظهر/العضلات حسب الحالة.',
    timing: 'مرة إلى مرتين يومياً لفترة قصيرة.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('كبسولة بعد الأكل مرة إلى مرتين يومياً حسب الألم (لفترة قصيرة).'),
    warnings: NSAID_WARNINGS,
  },

  // 26
  {
    id: 'cobal-500mcg-30-fc-tab-vitb',
    name: 'Cobal 500mcg 30 f.c.tab',
    genericName: 'mecobalamin',
    concentration: '500mcg',
    price: 38.25,
    matchKeywords: ['cobal 500', 'كوبال ٥٠٠', 'mecobalamin', 'b12', 'اعصاب', '#vitamin b12'],
    usage: 'فيتامين B12 (ميكوبالامين/ميثيل كوبالامين) لدعم الأعصاب وعلاج نقص ب12 حسب التحاليل.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'F.C. Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً بعد الأكل.'),
    warnings: B12_WARNINGS,
  },

  // 27
  {
    id: 'hydrovit-b12-depot-500mcgml-3-amp-vitb',
    name: 'Hydrovit-b12 depot 500mcg/ml 3 amp',
    genericName: 'hydroxocobalamin',
    concentration: '500mcg/ml',
    price: 30,
    matchKeywords: ['hydrovit b12 depot', 'هيدروفيت ب12', 'b12 depot injection', '#vitamin b12'],
    usage: 'حقن B12 ممتد المفعول (هيدروكسوكوبالامين) لعلاج نقص ب12 حسب التشخيص والتحاليل.',
    timing: 'أسبوعياً أو شهرياً حسب التحاليل والحالة.',
    category: Category.VITAMINS_MINERALS,
    form: 'Ampoule (IV/IM)',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: fixed('أمبول ١ عضل أسبوعياً ثم صيانة حسب الحالة.'),
    warnings: [...INJECTION_WARNINGS, ...B12_WARNINGS],
  },

  // 28
  {
    id: 'jaxolic-30-chewable-tabs-vitb',
    name: 'Jaxolic 30 chewable tabs',
    genericName: 'l-methyl folate & methyl cobalamin',
    concentration: '30 chew tabs',
    price: 165,
    matchKeywords: ['jaxolic', 'جاكسوليك', 'methylfolate', 'methylcobalamin', 'chewable', '#folic acid', '#vitamin b12'],
    usage: 'ميثيل فولات + B12 نشط لدعم تكوين الدم والأعصاب (أقراص قابلة للمضغ).',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Chewable Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('قرص قابل للمضغ يومياً بعد الأكل.'),
    warnings: [...FOLATE_WARNINGS, ...B12_WARNINGS],
  },

  // 29
  {
    id: 'novocobal-1mg-60-sublingual-tabs-vitb',
    name: 'Novocobal 1mg 60 sublingual tabs.',
    genericName: 'methylcobalamin',
    concentration: '1mg (1000mcg)',
    price: 64,
    matchKeywords: ['novocobal 60', 'نوفوكوبال ٦٠', '#vitamin b12'],
    usage: 'فيتامين B12 نشط أقراص تحت اللسان لدعم الأعصاب وعلاج نقص ب12.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Orodispersible Tablet',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً تحت اللسان.'),
    warnings: B12_WARNINGS,
  },

  // 30
  {
    id: 'benphora-30-fc-tablets-vitb',
    name: 'Benphora 30 f.c. tablets',
    genericName: 'benfotiamine & methylcobalamine & pyridoxine',
    concentration: '30 f.c. tabs',
    price: 150,
    matchKeywords: ['benphora', 'بنفورا', 'benfotiamine', 'methylcobalamin', 'neuropathy', '#vitamin b'],
    usage: 'مقوّي أعصاب (بنفوتيامين + B6 + B12 نشط) لاعتلال الأعصاب والتنميل.',
    timing: 'مرة إلى مرتين يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Film-coated Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('قرص بعد الأكل مرة إلى مرتين يومياً حسب الحالة.'),
    warnings: B6_WARNINGS,
  },

  // 31
  {
    id: 'cyanoheptan-6-im-amp-2ml-vitb',
    name: 'Cyanoheptan 6 i.m. amp. 2 ml',
    genericName: 'folic acid & nicotinamide & orotic acid & d-panthenol & thiamine (vitamin b1) & pyridoxine',
    concentration: '2ml ampoule',
    price: 114,
    matchKeywords: ['cyanoheptan', 'سيانوهيبتان', 'b complex injection', 'folic acid injection', '#vitamin b'],
    usage: 'حقن فيتامينات ب مركبة مع فوليك لدعم نقص الفيتامينات والإرهاق حسب التشخيص والتحاليل.',
    timing: 'مرة إلى مرتين أسبوعياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Ampoule (IV/IM)',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: fixed('أمبول ١ مرة إلى مرتين أسبوعياً حسب الحالة.'),
    warnings: [...INJECTION_WARNINGS, ...FOLATE_WARNINGS, ...B6_WARNINGS],
  },

  // 32
  {
    id: 'depofort-b12-1mgml-2-amp-vitb',
    name: 'Depofort b12 1mg/ml 2 amp. (n/a)',
    genericName: 'hydroxocobalamin acetate',
    concentration: '1mg/ml',
    price: 22,
    matchKeywords: ['depofort b12 2', 'ديبوفورت ٢ امبول', '#vitamin b12'],
    usage: 'حقن B12 ممتد المفعول لعلاج نقص ب12 حسب التشخيص والتحاليل.',
    timing: 'حسب البروتوكول.',
    category: Category.VITAMINS_MINERALS,
    form: 'Ampoule (IV/IM)',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: fixed('أمبول ١ أسبوعياً ثم صيانة حسب الحالة.'),
    warnings: [...INJECTION_WARNINGS, ...B12_WARNINGS],
  },

  // 33
  {
    id: 'nervizam-30-caps-vitb',
    name: 'Nervizam 30 cap',
    genericName: 'alpha lipoic acid & benfotiamine & vitamin b12 & vitamin b6',
    concentration: '30 caps',
    price: 450,
    matchKeywords: ['nervizam', 'نيرفيزام', 'alpha lipoic acid', 'ala', 'benfotiamine', 'اعصاب السكر', '#vitamin b'],
    usage: 'مضاد أكسدة ومقوّي أعصاب (ALA + بنفوتيامين + B6 + B12) لاعتلال الأعصاب والتنميل.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً بعد الأكل.'),
    warnings: [...ALA_WARNINGS, ...B6_WARNINGS],
  },

  // 34
  {
    id: 'neuroton-6-amp-vitb',
    name: 'Neuroton 6 amp',
    genericName: 'vitamin b1 & vitamin b2 & vitamin b6 & vitamin b12',
    concentration: '6 amp',
    price: 66,
    matchKeywords: ['neuroton amp', 'نيوروتون حقن', 'b complex injection', '#vitamin b'],
    usage: 'حقن فيتامينات ب مركبة لدعم الأعصاب والنشاط حسب التشخيص والتحاليل.',
    timing: 'كل ٣ أيام (٢–٣ أسابيع ثم حسب الحالة).',
    category: Category.VITAMINS_MINERALS,
    form: 'Ampoule (IV/IM)',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: fixed('أمبول ١ كل ٣ أيام (شائع).'),
    warnings: [...INJECTION_WARNINGS, ...B6_WARNINGS],
  },

  // 35
  {
    id: 'limitless-vitamin-b12-30-oro-dispersible-film-vitb',
    name: 'Limitless vitamin b12 30 oro dispersible film',
    genericName: 'vitamin b12',
    concentration: '30 films',
    price: 135,
    matchKeywords: ['limitless b12 film', 'ليمتلس ب12', 'oro dispersible film', '#vitamin b12'],
    usage: 'فيتامين B12 في صورة فيلم يذوب بالفم لدعم الأعصاب وعلاج نقص ب12 حسب الحالة.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Orodispersible Film',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('فيلم واحد يومياً.'),
    warnings: B12_WARNINGS,
  },

  // 36
  {
    id: 'vixaport-30-fc-tabs-vitb',
    name: 'Vixaport 30 f.c. tabs.',
    genericName: 'benfotiamine & cyanocobalamine & pyridoxine',
    concentration: '30 f.c. tabs',
    price: 150,
    matchKeywords: ['vixaport', 'فيكسابورت', 'benfotiamine', 'اعصاب', '#vitamin b'],
    usage: 'مقوّي أعصاب (بنفوتيامين + B6 + B12) لالتهاب الأعصاب والتنميل.',
    timing: 'مرة إلى مرتين يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Film-coated Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('قرص بعد الأكل مرة إلى مرتين يومياً حسب الحالة.'),
    warnings: B6_WARNINGS,
  },

  // 37
  {
    id: 'loxaraf-20-sublingual-tablet-vitb',
    name: 'Loxaraf 20 sublingual tablet',
    genericName: 'pyridoxine hydrochloride & methylcobalamine & folic acid',
    concentration: '20 tabs',
    price: 95,
    matchKeywords: ['loxaraf', 'لوكساراف', 'b6 b12 folate sublingual', '#vitamin b12', '#folic acid'],
    usage: 'B6 + B12 نشط + فوليك لدعم الأعصاب وتكوين الدم (أقراص تحت اللسان).',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Orodispersible Tablet',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً تحت اللسان.'),
    warnings: [...FOLATE_WARNINGS, ...B6_WARNINGS, ...B12_WARNINGS],
  },

  // 38
  {
    id: 'lingonerv-30-tabs-vitb',
    name: 'Lingonerv 30 tabs',
    genericName: 'methylcobalamin & methylfolate & pyridoxal-5-phosphate',
    concentration: '30 tabs',
    price: 135,
    matchKeywords: ['lingonerv', 'لينجونيرف', 'p5p', 'methylfolate', '#vitamin b12', '#folic acid'],
    usage: 'مزيج نشط للأعصاب (B12 نشط + فولات نشط + B6 نشط) لدعم الاعتلال العصبي والتنميل.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً بعد الأكل.'),
    warnings: [...FOLATE_WARNINGS, ...B6_WARNINGS, ...B12_WARNINGS],
  },

  // 39
  {
    id: 'rubivamin-1000mcg-5-amp-vitb',
    name: 'Rubivamin 1000mcg 5 amp.',
    genericName: 'cyanocobalamin',
    concentration: '1000mcg',
    price: 42.5,
    matchKeywords: ['rubivamin', 'روبيفامين', 'b12 injection 1000mcg', '#vitamin b12'],
    usage: 'حقن فيتامين B12 لعلاج نقص ب12 والأنيميا وأعراض الأعصاب حسب التشخيص والتحاليل.',
    timing: 'حسب البروتوكول.',
    category: Category.VITAMINS_MINERALS,
    form: 'Ampoule (IV/IM)',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: fixed('أمبول ١ أسبوعياً ثم صيانة حسب الحالة.'),
    warnings: [...INJECTION_WARNINGS, ...B12_WARNINGS],
  },

  // 40
  {
    id: 'nervixal-30-fc-tabs-vitb',
    name: 'Nervixal 30 f.c.tabs.',
    genericName: 'benfotiamine & methylcobalamin & pyridoxine',
    concentration: '30 f.c. tabs',
    price: 90,
    matchKeywords: ['nervixal', 'نيرفيكسال', 'benfotiamine', 'methylcobalamin', '#vitamin b'],
    usage: 'مقوّي أعصاب (بنفوتيامين + B6 + B12 نشط) للتنميل واعتلال الأعصاب.',
    timing: 'مرة إلى مرتين يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Film-coated Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('قرص بعد الأكل مرة إلى مرتين يومياً حسب الحالة.'),
    warnings: B6_WARNINGS,
  },

  // 41
  {
    id: 'neurovit-3-im-amps-vitb',
    name: 'Neurovit 3 i.m. amps.',
    genericName: 'thiamine hydrochloride (vitamin b1) & pyridoxine hydrochloride (vitamin b6) & cyanocobalamin (vitamin b12)',
    concentration: '3 amp',
    price: 22.5,
    matchKeywords: ['neurovit 3 amp', 'نيوروفيت ٣ امبول', 'b1 b6 b12 injection', '#vitamin b'],
    usage: 'حقن فيتامينات ب (B1+B6+B12) لالتهاب الأعصاب والتنميل حسب التشخيص والتحاليل (عبوة صغيرة).',
    timing: 'كل ٣ أيام.',
    category: Category.VITAMINS_MINERALS,
    form: 'Ampoule (IV/IM)',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: fixed('أمبول ١ عضل كل ٣ أيام.'),
    warnings: [...INJECTION_WARNINGS, ...B6_WARNINGS],
  },

  // 42
  {
    id: 'renofolium-30-tab-vitb',
    name: 'Renofolium 30 tab',
    genericName: 'folic acid & vitamin c & vitamin b1 & vitamin b2 & vitamin b6',
    concentration: '30 tabs',
    price: 125,
    matchKeywords: ['renofolium', 'رينوفوليوم', 'renal', 'folic', 'vitamin c', '#vitamin b', '#vitamin c', '#folic acid'],
    usage: 'مكمل (فوليك + مجموعة فيتامينات ب + فيتامين C) لدعم تكوين الدم والطاقة حسب الحالة.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً بعد الأكل.'),
    warnings: [...FOLATE_WARNINGS, ...B6_WARNINGS],
  },

  // 43
  {
    id: 'cobafolic-30-tab-vitb',
    name: 'Cobafolic 30 tab',
    genericName: 'quadrafolic & methyl cobalamin',
    concentration: '30 tabs',
    price: 165,
    matchKeywords: ['cobafolic', 'كوبافوليك', 'quadrafolic', 'methylcobalamin', '#folic acid', '#vitamin b12'],
    usage: 'فولات نشط (Quadrafolic) مع B12 نشط لدعم تكوين الدم والخصوبة حسب الحالة.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً بعد الأكل.'),
    warnings: [...FOLATE_WARNINGS, ...B12_WARNINGS],
  },

  // 44
  {
    id: 'liposom-b-complex-30-caps-vitb',
    name: 'Liposom-b complex 30 caps.',
    genericName: 'liposomal vitamin b complex',
    concentration: '30 caps',
    price: 195,
    matchKeywords: ['liposom b complex', 'ليبوسوم ب مركب', 'liposomal b complex', 'energy', 'طاقة', '#vitamin b'],
    usage: 'فيتامين ب مركب (ليبوسومال) لدعم الطاقة والأعصاب.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsules',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً بعد الأكل.'),
    warnings: GENERAL_SUPPLEMENT_WARNINGS,
  },

  // 45
  {
    id: 'gamabion-30-tabs-vitb',
    name: 'Gamabion 30 tabs.',
    genericName: 'liposomal vitamin b12 & liposomal vitamin b6 & liposomal vitamin b1',
    concentration: '30 tabs',
    price: 140,
    matchKeywords: ['gamabion', 'جامابيون', 'liposomal b12', 'liposomal b6', '#vitamin b'],
    usage: 'تركيبة ليبوسومال من فيتامينات ب لدعم الأعصاب والطاقة.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً بعد الأكل.'),
    warnings: [...B6_WARNINGS, ...B12_WARNINGS],
  },

  // 46
  {
    id: 'andovit-neuro-20-fc-tabs-vitb',
    name: 'Andovit neuro 20 f.c. tabs.',
    genericName: 'benfotiamine & cyanocobalamine & pyridoxine',
    concentration: '20 f.c. tabs',
    price: 130,
    matchKeywords: ['andovit neuro 20', 'اندوفيت نيو', 'benfotiamine', 'اعصاب', '#vitamin b'],
    usage: 'مقوّي أعصاب (بنفوتيامين + B6 + B12) للتنميل واعتلال الأعصاب.',
    timing: 'مرة إلى مرتين يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Film-coated Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('قرص بعد الأكل مرة إلى مرتين يومياً حسب الحالة.'),
    warnings: B6_WARNINGS,
  },

  // 47
  {
    id: 'andovit-neuro-30-fc-tabs-vitb',
    name: 'Andovit neuro 30 f.c. tabs. (n/a)',
    genericName: 'benfotiamine & cyanocobalamine & pyridoxine',
    concentration: '30 f.c. tabs',
    price: 75,
    matchKeywords: ['andovit neuro 30', 'اندوفيت نيو ٣٠', 'اعصاب', '#vitamin b'],
    usage: 'مقوّي أعصاب (B1+B6+B12) للتنميل واعتلال الأعصاب.',
    timing: 'مرة إلى مرتين يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Film-coated Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('قرص بعد الأكل مرة إلى مرتين يومياً حسب الحالة.'),
    warnings: B6_WARNINGS,
  },

  // 48
  {
    id: 'pyridovit-30-caps-vitb',
    name: 'Pyridovit 30 caps.',
    genericName: 'benfotiamine & vitamin b2 & vitamin b6 & vitamin b12',
    concentration: '30 caps',
    price: 150,
    matchKeywords: ['pyridovit', 'بيريدوفيت', 'b complex', 'اعصاب', '#vitamin b'],
    usage: 'مجموعة فيتامينات ب لدعم الأعصاب والطاقة.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsules',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً بعد الأكل.'),
    warnings: B6_WARNINGS,
  },

  // 49
  {
    id: 'folate-b12-30-tabs-vitb',
    name: 'Folate b12 30 tabs',
    genericName: 'methyl folate & methyl cobalamin',
    concentration: '30 tabs',
    price: 120,
    matchKeywords: ['folate b12', 'فولات ب12', 'methylfolate', 'methylcobalamin', '#folic acid', '#vitamin b12'],
    usage: 'فولات نشط + B12 نشط لدعم تكوين الدم والأعصاب.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً بعد الأكل.'),
    warnings: [...FOLATE_WARNINGS, ...B12_WARNINGS],
  },

  // 50
  {
    id: 'incera-20-capsule-vitb',
    name: 'Incera 20 capsule',
    genericName: 'methylcobalamin & 5-methyl tetrahydrofolate & vitamin b6',
    concentration: '20 caps',
    price: 74,
    matchKeywords: ['incera', 'انسيرا', '5-mthf', 'methylcobalamin', 'b6', '#folic acid', '#vitamin b12'],
    usage: 'تركيبة نشطة (B12 نشط + 5-MTHF + B6) لدعم الأعصاب وتكوين الدم.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsules',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً بعد الأكل.'),
    warnings: [...FOLATE_WARNINGS, ...B6_WARNINGS, ...B12_WARNINGS],
  },

  // 51
  {
    id: 'liposom-sublingual-1000mcg-30-sublingual-tabs-vitb',
    name: 'Liposom-sublingual 1000 mcg 30 sublingual tabs.',
    genericName: 'cyanocobalamin',
    concentration: '1000mcg',
    price: 90,
    matchKeywords: ['liposom sublingual 1000', 'ليبوسوم تحت اللسان', 'cyanocobalamin 1000', '#vitamin b12'],
    usage: 'فيتامين B12 (سيانوكوبالامين) أقراص تحت اللسان لدعم الأعصاب وعلاج نقص ب12.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Orodispersible Tablet',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً تحت اللسان.'),
    warnings: B12_WARNINGS,
  },

  // 52
  {
    id: 'neurorubine-forte-20-lactabs-vitb',
    name: 'Neurorubine forte 20 lactabs',
    genericName: 'vitamin b1 (thiamine) & vitamin b12 (cyanocobalamin) & pyridoxine',
    concentration: '20 tabs',
    price: 46,
    matchKeywords: ['neurorubine forte', 'نيوروروبين فورت', 'b1 b6 b12', 'اعصاب', '#vitamin b'],
    usage: 'فيتامينات ب (B1+B6+B12) لدعم الأعصاب والتنميل.',
    timing: 'مرة إلى ثلاث مرات يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Tablet',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('قرص بعد الأكل ١–٣ مرات يومياً حسب شدة الأعراض.'),
    warnings: B6_WARNINGS,
  },

  // 53
  {
    id: 'rangonal-20-film-coated-tabs-vitb',
    name: 'Rangonal 20 film coated tablets',
    genericName: 'folic acid & methylcobalamin & pyridoxine & thiamine',
    concentration: '20 f.c. tabs',
    price: 80,
    matchKeywords: ['rangonal', 'رانجونال', 'methylcobalamin', 'folic', '#folic acid', '#vitamin b12', '#vitamin b'],
    usage: 'فوليك + B12 نشط + B6 + B1 لدعم الأعصاب وتكوين الدم.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Film-coated Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً بعد الأكل.'),
    warnings: [...FOLATE_WARNINGS, ...B6_WARNINGS, ...B12_WARNINGS],
  },

  // 54
  {
    id: 'liposom-b12-1000mcg-20-sublingual-tabs-vitb',
    name: 'Liposom-b12 1000 mcg 20 sublingual tabs.',
    genericName: 'cyanocobalamin',
    concentration: '1000mcg',
    price: 60,
    matchKeywords: ['liposom b12 1000 20', 'ليبوسوم ب12 ٢٠', 'b12 sublingual', '#vitamin b12'],
    usage: 'فيتامين B12 أقراص تحت اللسان لدعم الأعصاب وعلاج نقص ب12.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Orodispersible Tablet',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً تحت اللسان.'),
    warnings: B12_WARNINGS,
  },

  // 55
  {
    id: 'neurobion-20-coated-tab-vitb',
    name: 'Neurobion 20 coated tab.',
    genericName: 'vitamin b1 & vitamin b6 & vitamin b12',
    concentration: '20 tabs',
    price: 21,
    matchKeywords: ['neurobion', 'نيوروبيون', 'b1 b6 b12', 'اعصاب', '#vitamin b'],
    usage: 'فيتامينات ب (B1+B6+B12) لدعم الأعصاب والتنميل والإرهاق.',
    timing: 'مرة إلى ثلاث مرات يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('قرص بعد الأكل ١–٣ مرات يومياً حسب شدة الأعراض.'),
    warnings: B6_WARNINGS,
  },

  // 56
  {
    id: 'vino-b12-1mg-30-sublingual-tab-vitb',
    name: 'Vino b12 1mg 30 sublingual tab',
    genericName: 'vitamin b1 & vitamin b6 & vitamin b12 & folic acid',
    concentration: '1mg',
    price: 70,
    matchKeywords: ['vino b12', 'فينو ب12', 'sublingual', '#vitamin b12', '#folic acid'],
    usage: 'مزيج فيتامينات ب مع فوليك لدعم الأعصاب وتكوين الدم (قرص تحت اللسان).',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Orodispersible Tablet',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد يومياً تحت اللسان.'),
    warnings: [...FOLATE_WARNINGS, ...B6_WARNINGS, ...B12_WARNINGS],
  },

  // 57
  {
    id: 'vavra-b-neuro-30-capsules-vitb',
    name: 'Vavra b neuro 30 capsules',
    genericName: 'vitamin b1 & vitamin b2 & vitamin b3 & vitamin b5 & vitamin b6 & vitamin b12',
    concentration: '30 caps',
    price: 185,
    matchKeywords: ['vavra b neuro', 'فافرا بي نيو', 'b complex', 'energy', 'طاقة', '#vitamin b'],
    usage: 'فيتامين ب مركب لدعم الطاقة والأعصاب.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsules',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('كبسولة واحدة يومياً بعد الأكل.'),
    warnings: B6_WARNINGS,
  },

  // 58
  {
    id: 'symmebact-vit-60ml-syrup-vitb',
    name: 'Symmebact-vit 60 ml syrup',
    genericName: 'lactobacillus rhamnosis & vitamin b complex & zinc',
    concentration: '60ml',
    price: 60,
    matchKeywords: ['symmebact vit', 'سيمباكت فيت', 'probiotics', 'lactobacillus rhamnosus', 'b complex', 'zinc', '#probiotics', '#vitamin b'],
    usage: 'بروبيوتك مع فيتامين ب مركب وزنك لدعم صحة الجهاز الهضمي والطاقة (حسب الحاجة).',
    timing: 'مرة يومياً.',
    category: Category.PROBIOTICS,
    form: 'Syrup',
    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 8,
    maxWeight: 250,
    calculationRule: (_w, ageMonths) => (ageMonths < 144 ? '٥ مل يومياً بعد الأكل' : '١٠ مل يومياً بعد الأكل'),
    warnings: [...GENERAL_SUPPLEMENT_WARNINGS, 'افصل ساعتين عن المضادات الحيوية إذا كانت تؤخذ في نفس اليوم.'],
  },

  // 59
  {
    id: 'vitalox-b12-energy-10-oral-ampoules-7ml-vitb',
    name: 'Vitalox b12 energy 10 oral ampoules x 7 ml',
    genericName: 'vitamin b12',
    concentration: '10 oral ampoules × 7ml',
    price: 790,
    matchKeywords: ['vitalox b12 energy', 'فيتالوكس ب12', 'oral ampoules', 'energy', 'طاقة', '#vitamin b12'],
    usage: 'B12 للشرب لدعم الطاقة وعلاج نقص ب12 حسب الحاجة والتحاليل.',
    timing: 'مرة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Solution',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 25,
    maxWeight: 250,
    calculationRule: fixed('أمبول فموي واحد يومياً بعد الأكل؛ المدة حسب التحاليل.'),
    warnings: B12_WARNINGS,
  },
];

export const VITAMIN_B_GROUP: Medication[] = VITAMIN_B_GROUP_RAW.map(enhanceVitaminBMedication);


