import { Medication, Category } from '../../types';

// Helper to convert numbers to Arabic numerals
const toAr = (n: number | string) => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
const fixed = (text: string) => (_w: number, _a: number) => text;

const normalizeSpaces = (s: string) => s.replace(/\s+/g, ' ').replace(/\s+([.,؛:!؟])/g, '$1').trim();

// Removes generic "doctor supervision / by doctor's guidance" phrasing (as requested)
const stripDoctorPhrases = (s: string) => {
  let t = s;
  t = t.replace(/تحت\s*إشراف\s*طبي/g, '');
  t = t.replace(/(?:إلا\s+)?بتوجيه\s+طبي/g, '');
  t = t.replace(/(?:إلا\s+)?بوصفة\s+طبيب/g, '');
  t = t.replace(/استشر(?:ي)?\s+الطبيب[^.]*\./g, '.');
  t = t.replace(/استشارة\s+(?:طبية|الطبيب)[^.]*\./g, '.');
  t = t.replace(/حسب\s+(?:توجيه|تعليمات|إرشادات|وصف)\s+الطبيب/g, '');
  t = t.replace(/حسب\s+تقييم\s+الطبيب/g, 'حسب التقييم');
  t = t.replace(/اسأل\s+الطبيب[^.]*\./g, '.');
  t = t.replace(/\(اسأل الطبيب\)/g, '');
  t = t.replace(/بإرشاد\s+طبي/g, '');
  return normalizeSpaces(t);
};

const sanitizeText = (s: string) => {
  let t = stripDoctorPhrases((s || '').toString());
  t = t.replace(/راجع\s+الطبيب/g, 'يستلزم تقييماً');
  t = t.replace(/استشر(?:ي)?\s+الطبيب/g, 'قد يلزم تقييماً');
  t = t.replace(/\bممنوع\b/g, 'غير مناسب');
  t = t.replace(/\bيُمنع\b/g, 'غير مناسب');
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
  'وجود أمراض مزمنة (قلب/ضغط/كبد/كُلى) أو أدوية ثابتة قد يغيّر الملاءمة/الأمان، وقد يلزم تقييم قبل الاستخدام.',
];

const ALPHA_BLOCKER_WARNINGS = [
  ...GENERAL_URINARY_WARNINGS,
  'قد يسبب هبوط ضغط انتصابي (دوخة/إغماء عند الوقوف)؛ القيام ببطء من الجلوس/النوم يقلل ذلك.',
  'قد يسبب صداع أو احتقان أنف.',
  'قبل جراحة المياه البيضاء (الكتاراكت): من المهم إبلاغ فريق جراحة العيون باستخدام حاصرات ألفا (خصوصاً تامسولوسين) لاحتمال حدوث متلازمة القزحية المرتخية أثناء العملية (IFIS).',
];

const TAMSULOSIN_WARNINGS = [
  ...ALPHA_BLOCKER_WARNINGS,
  'قد يسبب ارتجاع/نقص القذف عند بعض الرجال (عادة غير خطير).',
];

const SILODOSIN_WARNINGS = [
  ...ALPHA_BLOCKER_WARNINGS,
  'قد يسبب ارتجاع/نقص القذف عند بعض الرجال (أكثر شيوعاً).',
  'قصور الكُلى قد يستلزم جرعة أقل حسب التقييم.',
];

const ALFUZOSIN_WARNINGS = [
  ...ALPHA_BLOCKER_WARNINGS,
  'يُستخدم بحذر مع أمراض الكبد أو عند تناول أدوية قد تطيل QT.',
];

const DOXAZOSIN_WARNINGS = [
  ...ALPHA_BLOCKER_WARNINGS,
  'الجرعة الأولى أو عند زيادة الجرعة قد تسبب دوخة شديدة/إغماء؛ وقت المساء/قبل النوم قد يكون أنسب لتقليل دوخة البداية.',
];

const PDE5_WARNINGS = [
  ...GENERAL_URINARY_WARNINGS,
  'غير مناسب مع أدوية النيترات/النترات (مثل نيتروجليسرين) لاحتمال هبوط ضغط خطير.',
  'قد يسبب صداع/احمرار/حُرقة معدة/احتقان أنف.',
  'يُستخدم بحذر مع أدوية الضغط أو حاصرات ألفا (قد يزيد الدوخة/هبوط الضغط).',
];

const FIVE_ALPHA_REDUCTASE_WARNINGS = [
  ...GENERAL_URINARY_WARNINGS,
  'قد يسبب نقص الرغبة الجنسية/ضعف الانتصاب/نقص السائل المنوي عند بعض الرجال.',
  'قد يقلل قيمة PSA تقريباً للنصف؛ يجب أخذ ذلك في الاعتبار عند تفسير التحاليل.',
  'تحذير هام: الدواء مُسخ للأجنة الذكور (Category X). النساء الحوامل (أو المتوقع حملهن) يجب ألا يلمسن أقراص مكسورة/مسحوق الدواء.',
  'يُفرز في السائل المنوي؛ يُنصح باستخدام واقي ذكري إذا كانت الشريكة حامل أو قد تحمل.',
];

const HERBAL_PROSTATE_WARNINGS = [
  ...GENERAL_URINARY_WARNINGS,
  'مكملات البروستاتا العشبية قد تحتاج ٤–٨ أسابيع لظهور أثر؛ الأعراض الشديدة لا يناسبها الاعتماد على المكملات فقط.',
  'دم بالبول/ألم شديد/احتباس بول يستلزم تقييماً عاجلاً.',
];

const ANTISPASMODIC_WARNINGS = [
  ...GENERAL_URINARY_WARNINGS,
  'قد يسبب جفاف الفم/إمساك/زغللة بالرؤية أو دوخة.',
  'يُتجنب مع احتباس البول، جلوكوما ضيقة الزاوية، أو انسداد/شلل بالأمعاء.',
  'كبار السن: يُستخدم بحذر لأنه قد يسبب تشوش ذهني/ارتباك.',
];

const RECTAL_SUPP_WARNINGS = [
  'للاستخدام الشرجي فقط.',
  'نزيف شرجي أو ألم شديد أو حرارة يستلزم الإيقاف والتقييم.',
  'الاستخدام لفترات طويلة غير مناسب بدون متابعة.',
];

// =========================
// Keyword & instruction enhancement
// =========================
const bphKeywordBoost = (m: Medication) => {
  const g = (m.genericName || '').toString().toLowerCase();
  const n = (m.name || '').toString().toLowerCase();

  const base = [
    '#prostate',
    '#bph',
    '#benign prostatic hypertrophy',
    '#urination difficulty',
    'bph',
    'benign prostatic hypertrophy',
    'prostate',
    'enlarged prostate',
    'luts',
    'weak stream',
    'hesitancy',
    'straining',
    'dribbling',
    'nocturia',
    'frequency',
    'urgency',
    'urine retention',
    'تضخم البروستاتا',
    'بروستاتا',
    'احتباس بول',
    'صعوبة التبول',
    'ضعف اندفاع البول',
    'تقطيع البول',
    'كثرة التبول',
    'تبول ليلي',
    'إلحاح بولي',
    'مسالك بولية',
    'IFIS',
    'floppy iris',
  ];

  const dose = (m.concentration || '').toString();
  const doseAr = dose ? toAr(dose) : '';
  const dosePlain = dose.replace(/\s+/g, '').replace(/\./g, '').toLowerCase();

  const boost: string[] = [];

  if (g.includes('tamsulosin')) boost.push('tamsulosin', 'تامسولوسين', '#alpha blocker', '#alpha_blocker');
  if (g.includes('silodosin')) boost.push('silodosin', 'سيلودوسين', '#alpha blocker', '#alpha_blocker');
  if (g.includes('alfuzosin')) boost.push('alfuzosin', 'الفيوزوسين', '#alpha 1 receptor blockers', '#alpha_1_receptor_blockers');
  if (g.includes('doxazosin')) boost.push('doxazosin', 'دوكسازوسين', '#antihypotensive', '#alpha 1 receptor blockers');
  if (g.includes('dutasteride')) boost.push('dutasteride', 'دوتاستيرايد', '#alpha-reductase inhibitor', '#alpha_reductase_inhibitor');
  if (g.includes('finasteride')) boost.push('finasteride', 'فيناستيرايد', '#alpha-reductase inhibitor', '#alpha_reductase_inhibitor');
  if (g.includes('tadalafil')) boost.push('tadalafil', 'تادالافيل', '#tonic', 'erectile dysfunction', 'ضعف انتصاب');
  if (g.includes('solifenacin')) boost.push('solifenacin', 'سوليفيناسين', '#antimuscarinic', '#antispasmodics');

  if (g.includes('saw palmetto')) boost.push('saw palmetto', 'ساو بالميتو');
  if (g.includes('pumpkin')) boost.push('pumpkin seed', 'زيت بذور اليقطين', 'pepom', 'pepon');
  if (g.includes('pygeum')) boost.push('pygeum africanum', 'بيجيوم', 'افريكانوم');
  if (g.includes('zinc')) boost.push('zinc', 'زنك');
  if (g.includes('selenium')) boost.push('selenium', 'سيلينيوم');

  // Brand hints (name-based)
  if (n.includes('omnic')) boost.push('omnic', 'أومنيك');
  if (n.includes('tamsul')) boost.push('tamsul', 'تامسول');
  if (n.includes('tamsulin')) boost.push('tamsulin', 'تامسولين');
  if (n.includes('block alpha')) boost.push('block alpha', 'بلوك ألفا');
  if (n.includes('cure pro')) boost.push('cure pro', 'curepro', 'كيور برو');
  if (n.includes('xatral')) boost.push('xatral', 'زاترال');
  if (n.includes('cardura')) boost.push('cardura', 'كاردورا');
  if (n.includes('dosin')) boost.push('dosin', 'دوزين');
  if (n.includes('avodart')) boost.push('avodart', 'أفودارت');
  if (n.includes('duodart')) boost.push('duodart', 'ديو دارت');
  if (n.includes('bengiride')) boost.push('bengiride', 'بنجيرايد');
  if (n.includes('proscar')) boost.push('proscar', 'بروسكار');
  if (n.includes('royalsteride')) boost.push('royalsteride', 'رويالستيرايد');
  if (n.includes('prostride')) boost.push('prostride', 'بروسترايد');
  if (n.includes('finastura')) boost.push('finastura', 'فيناستورا');
  if (n.includes('cialis')) boost.push('cialis', 'سياليس');
  if (n.includes('starkoprex')) boost.push('starkoprex', 'ستاركوبريكس');
  if (n.includes('diamonrecta')) boost.push('diamonrecta', 'ديامونريكتا');
  if (n.includes('cialong')) boost.push('cialong', 'سيالونج');
  if (n.includes('tadanerfi')) boost.push('tadanerfi', 'تادانيرفي');
  if (n.includes('flopadex')) boost.push('flopadex', 'فلوباديكس');
  if (n.includes('sildocare')) boost.push('sildocare', 'سيلدوكير');
  if (n.includes('sympaprost')) boost.push('sympaprost', 'سيمبابروست');
  if (n.includes('lidoflak')) boost.push('lidoflak', 'ليدوفلاك');
  if (n.includes('pepon')) boost.push('pepon', 'بيبون');
  if (n.includes('ronkin')) boost.push('ronkin', 'رونكين');
  if (n.includes('prostality')) boost.push('prostality', 'بروستاليتي');
  if (n.includes('prostacure')) boost.push('prostacure', 'بروستاكير');
  if (n.includes('prostanorm')) boost.push('prostanorm', 'بروستانورم');
  if (n.includes('modern saw palmetto')) boost.push('modern saw palmetto');
  if (n.includes('prost ade')) boost.push('prost ade', 'بروست اد');
  if (n.includes('geoprost')) boost.push('geoprost', 'جيو بروست');
  if (n.includes('decongestyl')) boost.push('decongestyl', 'ديكونجستيل');
  if (n.includes('prostalin')) boost.push('prostalin', 'بروستالين');

  // Form hints
  if (n.includes('xl') || n.includes('xr') || n.includes('mr') || n.includes('modified') || n.includes('prolonged')) {
    boost.push('xr', 'extended release', 'ممتد المفعول');
  }
  if (n.includes('orodispersible') || n.includes('film')) {
    boost.push('orodispersible', 'film', 'فيلم', 'يذوب');
  }
  if (n.includes('supp')) boost.push('suppository', 'لبوس');

  return uniq([...base, ...boost, dose, dosePlain, doseAr, m.name, m.genericName]);
};

const enhanceBphMedication = (m: Medication): Medication => ({
  ...sanitizeMedication({
    ...m,
    matchKeywords: uniq([...(m.matchKeywords || []), ...bphKeywordBoost(m)]),
  }),
});

// =========================
// BPH list (replace all previous items)
// =========================
const BPH_MEDS_RAW: Medication[] = [
  // 1
  {
    id: 'starkoprex-5mg-30-tabs-bph',
    name: 'Starkoprex 5mg 30 tabs',
    genericName: 'tadalafil',
    concentration: '5mg',
    price: 252,
    matchKeywords: ['#tonic', '#prostate', '#bph', 'daily tadalafil', 'bph and ed'],
    usage: 'تادالافيل ٥ مجم (جرعة يومية) لتحسين أعراض تضخم البروستاتا وقد يساعد أيضاً في ضعف الانتصاب.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً بدون اعتبار للأكل (مزمن)'),
    warnings: PDE5_WARNINGS,
  },

  // 2
  {
    id: 'pepon-plus-20-caps-bph',
    name: 'Pepon plus 20 caps',
    genericName: 'pumpkin seed oil & saw palmetto oil & zinc',
    concentration: '20 caps',
    price: 150,
    matchKeywords: ['#prostate', '#bph', 'herbal prostate', 'احتقان بروستاتا'],
    usage: 'مكمل عشبي لدعم صحة البروستاتا وتخفيف أعراض الاحتقان/ضعف تدفق البول في الحالات البسيطة.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً بدون اعتبار للأكل (مزمن)'),
    warnings: HERBAL_PROSTATE_WARNINGS,
  },

  // 3
  {
    id: 'ronkin-1010mg-20-sg-caps-bph',
    name: 'Ronkin 1010 mg 20 s.g.caps.',
    genericName: 'pumpkin seed oil',
    concentration: '1010mg',
    price: 96,
    matchKeywords: ['#prostate', 'pumpkin seed oil'],
    usage: 'زيت بذور اليقطين كمكمل داعم للبروستاتا وقد يساعد أعراض البول الخفيفة.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Soft Gelatin Capsule',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً بدون اعتبار للأكل (مزمن)'),
    warnings: HERBAL_PROSTATE_WARNINGS,
  },

  // 4
  {
    id: 'tamsulin-0-4mg-28-caps-bph',
    name: 'Tamsulin 0.4mg 28 caps',
    genericName: 'tamsulosin',
    concentration: '0.4mg',
    price: 124,
    matchKeywords: ['#urination difficulty', '#alpha blocker', '#bph'],
    usage: 'تامسولوسين لتحسين تدفق البول وتقليل أعراض تضخم البروستاتا.',
    timing: 'مرة يومياً قبل النوم – مزمن',
    category: Category.URINARY_CARE,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً قبل النوم (مزمن)'),
    warnings: TAMSULOSIN_WARNINGS,
  },

  // 5
  {
    id: 'cialis-20mg-4-tabs-bph',
    name: 'Cialis 20mg 4 tabs',
    genericName: 'tadalafil',
    concentration: '20mg',
    price: 474,
    matchKeywords: ['#tonic', 'cialis 20', 'ed'],
    usage: 'تادالافيل ٢٠ مجم لعلاج ضعف الانتصاب (وقد يحسن بعض أعراض البول عند البعض).',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً بدون اعتبار للأكل (مزمن)'),
    warnings: PDE5_WARNINGS,
  },

  // 6
  {
    id: 'cialis-20mg-2-tabs-bph',
    name: 'Cialis 20mg 2 tabs',
    genericName: 'tadalafil',
    concentration: '20mg',
    price: 237,
    matchKeywords: ['#tonic', 'cialis 20', 'ed'],
    usage: 'تادالافيل ٢٠ مجم لعلاج ضعف الانتصاب (عند اللزوم).',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً بدون اعتبار للأكل (مزمن)'),
    warnings: PDE5_WARNINGS,
  },

  // 7
  {
    id: 'omnic-0-4mg-30-mr-caps-bph',
    name: 'Omnic 0.4mg 30 modified release caps',
    genericName: 'tamsulosin',
    concentration: '0.4mg',
    price: 282,
    matchKeywords: ['#urination difficulty', '#alpha blocker', 'omnic'],
    usage: 'تامسولوسين ممتد المفعول لتحسين تدفق البول وتقليل أعراض تضخم البروستاتا.',
    timing: 'مرة يومياً قبل النوم – مزمن',
    category: Category.URINARY_CARE,
    form: 'Modified-release Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً قبل النوم (مزمن)'),
    warnings: TAMSULOSIN_WARNINGS,
  },

  // 8
  {
    id: 'block-alpha-0-4mg-mr-30-caps-bph',
    name: 'Block alpha 0.4 mg mr 30 caps.',
    genericName: 'tamsulosin',
    concentration: '0.4mg',
    price: 120,
    matchKeywords: ['#urination difficulty', '#alpha blocker', 'block alpha'],
    usage: 'تامسولوسين (ممتد المفعول) لتحسين تدفق البول وتقليل أعراض تضخم البروستاتا.',
    timing: 'مرة يومياً قبل النوم – مزمن',
    category: Category.URINARY_CARE,
    form: 'Modified-release Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً قبل النوم (مزمن)'),
    warnings: TAMSULOSIN_WARNINGS,
  },

  // 9
  {
    id: 'diamonrecta-5mg-30-fc-tabs-bph',
    name: 'Diamonrecta 5 mg 30 f.c. tab.',
    genericName: 'tadalafil',
    concentration: '5mg',
    price: 187.5,
    matchKeywords: ['#tonic', 'tadalafil 5', 'daily'],
    usage: 'تادالافيل ٥ مجم (جرعة يومية) لتحسين أعراض البروستاتا وقد يساعد ضعف الانتصاب.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً بدون اعتبار للأكل (مزمن)'),
    warnings: PDE5_WARNINGS,
  },

  // 10
  {
    id: 'flopadex-8mg-30-caps-bph',
    name: 'Flopadex 8 mg 30 capsules',
    genericName: 'silodosin',
    concentration: '8mg',
    price: 177,
    matchKeywords: ['#urination difficulty', '#alpha blocker', '#bph'],
    usage: 'سيلودوسين لتحسين أعراض تضخم البروستاتا (ضعف اندفاع البول/تقطيع/صعوبة التبول).',
    timing: 'مرة يومياً قبل النوم – مزمن',
    category: Category.URINARY_CARE,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً قبل النوم (مزمن)'),
    warnings: SILODOSIN_WARNINGS,
  },

  // 11
  {
    id: 'tadanerfi-20mg-4-orodispersible-films-bph',
    name: 'Tadanerfi 20 mg 4 orodispersible films',
    genericName: 'tadalafil',
    concentration: '20mg',
    price: 126,
    matchKeywords: ['#tonic', 'film', 'orodispersible', 'ed'],
    usage: 'تادالافيل ٢٠ مجم (فيلم يذوب بالفم) لعلاج ضعف الانتصاب (عند اللزوم).',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Orodispersible Film',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً بدون اعتبار للأكل (مزمن)'),
    warnings: PDE5_WARNINGS,
  },

  // 12
  {
    id: 'tadanerfi-5mg-20-orodispersible-films-bph',
    name: 'Tadanerfi 5mg 20 orodispersible films',
    genericName: 'tadalafil',
    concentration: '5mg',
    price: 180,
    matchKeywords: ['#tonic', 'film', 'daily tadalafil'],
    usage: 'تادالافيل ٥ مجم (فيلم يذوب بالفم) كجرعة يومية لتحسين أعراض البروستاتا وقد يساعد ضعف الانتصاب.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Orodispersible Film',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً بدون اعتبار للأكل (مزمن)'),
    warnings: PDE5_WARNINGS,
  },

  // 13
  {
    id: 'xatral-xl-10mg-30-fc-tabs-bph',
    name: 'Xatral xl 10mg 30 f.c. tab.',
    genericName: 'alfuzosin',
    concentration: '10mg',
    price: 97,
    matchKeywords: ['#antihypotensive', '#alpha 1 receptor blockers', '#urination difficulty', '#bph'],
    usage: 'ألفيوزوسين ممتد المفعول لتحسين أعراض تضخم البروستاتا وتقليل صعوبة التبول.',
    timing: 'مرة يومياً قبل النوم – مزمن',
    category: Category.URINARY_CARE,
    form: 'Prolonged Release Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً قبل النوم (مزمن)'),
    warnings: ALFUZOSIN_WARNINGS,
  },

  // 14
  {
    id: 'decongestyl-n-12-rectal-supp-bph',
    name: 'Decongestyl-n 12 rectal supp.',
    genericName: 'potassium iodide & ichthammol & hamamelis extract',
    concentration: '12 suppositories',
    price: 56,
    matchKeywords: ['#prostate', 'suppository', 'احتقان', 'rectal'],
    usage: 'لبوس شرجي قد يُستخدم لتخفيف الاحتقان/الأعراض الموضعية.',
    timing: 'مرة يومياً قبل النوم – مزمن',
    category: Category.URINARY_CARE,
    form: 'Suppositories',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً قبل النوم (مزمن)'),
    warnings: RECTAL_SUPP_WARNINGS,
  },

  // 15
  {
    id: 'duodart-0-5-0-4mg-30-caps-bph',
    name: 'Duodart 0.5/0.4mg 30 caps.',
    genericName: 'dutasteride & tamsulosin',
    concentration: '0.5/0.4mg',
    price: 491,
    matchKeywords: ['#alpha-reductase inhibitor', '#alpha blocker', '#prostate', '#bph'],
    usage: 'تركيبة دوتاستيرايد + تامسولوسين لتخفيف الأعراض سريعاً وتقليل حجم البروستاتا على المدى الطويل.',
    timing: 'مرة يومياً قبل النوم – مزمن',
    category: Category.URINARY_CARE,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً قبل النوم (مزمن)'),
    warnings: [...TAMSULOSIN_WARNINGS, ...FIVE_ALPHA_REDUCTASE_WARNINGS],
  },

  // 16
  {
    id: 'prostality-20-caps-bph',
    name: 'Prostality 20 caps',
    genericName: 'saw palmetto & pumpkin seed oil & tomato extract',
    concentration: '20 caps',
    price: 160,
    matchKeywords: ['#prostate', 'supplement', 'saw palmetto', 'pumpkin seed'],
    usage: 'مكمل عشبي لدعم صحة البروستاتا وتحسين الأعراض البسيطة.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً بدون اعتبار للأكل (مزمن)'),
    warnings: HERBAL_PROSTATE_WARNINGS,
  },

  // 17
  {
    id: 'tamsul-0-4mg-30-caps-bph',
    name: 'Tamsul 0.4mg 30 capsules',
    genericName: 'tamsulosin hcl',
    concentration: '0.4mg',
    price: 105,
    matchKeywords: ['#urination difficulty', '#alpha blocker', '#bph'],
    usage: 'تامسولوسين لتحسين تدفق البول وتقليل أعراض تضخم البروستاتا.',
    timing: 'مرة يومياً قبل النوم – مزمن',
    category: Category.URINARY_CARE,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً قبل النوم (مزمن)'),
    warnings: TAMSULOSIN_WARNINGS,
  },

  // 18
  {
    id: 'avodart-0-5mg-30-caps-bph',
    name: 'Avodart 0.5mg 30 caps',
    genericName: 'dutasteride',
    concentration: '0.5mg',
    price: 313,
    matchKeywords: ['#alpha-reductase inhibitor', '#prostate', '#bph'],
    usage: 'دوتاستيرايد لتقليل حجم البروستاتا (علاج طويل المدى) وتحسين أعراض التبول.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً بدون اعتبار للأكل (مزمن)'),
    warnings: FIVE_ALPHA_REDUCTASE_WARNINGS,
  },

  // 19
  {
    id: 'cardura-xl-4mg-28-prolonged-tabs-bph',
    name: 'Cardura xl 4mg 28 prolonged release tabs.',
    genericName: 'doxazosin',
    concentration: '4mg',
    price: 255,
    matchKeywords: ['#antihypotensive', '#alpha 1 receptor blockers', '#bph'],
    usage: 'دوكسازوسين ممتد المفعول لتحسين أعراض البروستاتا وقد يساعد في الضغط.',
    timing: 'مرة يومياً قبل النوم – مزمن',
    category: Category.URINARY_CARE,
    form: 'Prolonged Release Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً قبل النوم (مزمن)'),
    warnings: DOXAZOSIN_WARNINGS,
  },

  // 20
  {
    id: 'dosin-4mg-20-tabs-bph',
    name: 'Dosin 4mg 20 tab.',
    genericName: 'doxazosin',
    concentration: '4mg',
    price: 46,
    matchKeywords: ['#antihypotensive', '#alpha 1 receptor blockers', '#bph'],
    usage: 'دوكسازوسين لتحسين أعراض البروستاتا وقد يستخدم للضغط.',
    timing: 'مرة يومياً قبل النوم – مزمن',
    category: Category.URINARY_CARE,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً قبل النوم (مزمن)'),
    warnings: DOXAZOSIN_WARNINGS,
  },

  // 21
  {
    id: 'flopadex-4mg-20-caps-bph',
    name: 'Flopadex 4 mg 20 capsules',
    genericName: 'silodosin',
    concentration: '4mg',
    price: 96,
    matchKeywords: ['#urination difficulty', '#alpha blocker', '#bph'],
    usage: 'سيلودوسين (جرعة أقل) لتحسين أعراض تضخم البروستاتا حسب التشخيص.',
    timing: 'مرة يومياً قبل النوم – مزمن',
    category: Category.URINARY_CARE,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً قبل النوم (مزمن)'),
    warnings: SILODOSIN_WARNINGS,
  },

  // 22
  {
    id: 'prostride-5mg-30-caps-bph',
    name: 'Prostride 5mg 30 caps.',
    genericName: 'finasteride',
    concentration: '5mg',
    price: 183,
    matchKeywords: ['#alpha-reductase inhibitor', '#prostate', '#bph'],
    usage: 'فيناستيرايد ٥ مجم لتقليل حجم البروستاتا (علاج طويل المدى).',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً بدون اعتبار للأكل (مزمن)'),
    warnings: FIVE_ALPHA_REDUCTASE_WARNINGS,
  },

  // 23
  {
    id: 'sildocare-8mg-20-caps-bph',
    name: 'Sildocare 8mg 20 caps',
    genericName: 'silodosin',
    concentration: '8mg',
    price: 90,
    matchKeywords: ['#urination difficulty', '#alpha blocker', '#bph'],
    usage: 'سيلودوسين لتحسين أعراض تضخم البروستاتا.',
    timing: 'مرة يومياً قبل النوم – مزمن',
    category: Category.URINARY_CARE,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً قبل النوم (مزمن)'),
    warnings: SILODOSIN_WARNINGS,
  },

  // 24
  {
    id: 'sympaprost-8mg-30-caps-bph',
    name: 'Sympaprost 8mg 30 caps.',
    genericName: 'silodosin',
    concentration: '8mg',
    price: 177,
    matchKeywords: ['#urination difficulty', '#alpha blocker', '#bph'],
    usage: 'سيلودوسين لتحسين أعراض تضخم البروستاتا (ضعف التدفق/الإلحاح).',
    timing: 'مرة يومياً قبل النوم – مزمن',
    category: Category.URINARY_CARE,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً قبل النوم (مزمن)'),
    warnings: SILODOSIN_WARNINGS,
  },

  // 25
  {
    id: 'tamsulin-plus-6-0-4mg-20-mr-tabs-bph',
    name: 'Tamsulin plus 6/0.4mg 20 mr tabs',
    genericName: 'tamsulosin & solifenacin',
    concentration: '6/0.4mg',
    price: 148,
    matchKeywords: ['#urination difficulty', '#alpha blocker', '#antimuscarinic', '#bph', 'urgency'],
    usage: 'تركيبة تامسولوسين + سوليفيناسين لتحسين التدفق وتقليل الإلحاح/كثرة التبول عند بعض مرضى البروستاتا.',
    timing: 'مرة يومياً قبل النوم – مزمن',
    category: Category.URINARY_CARE,
    form: 'Prolonged Release Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً قبل النوم (مزمن)'),
    warnings: uniq([...(TAMSULOSIN_WARNINGS || []), ...(ANTISPASMODIC_WARNINGS || [])]),
  },

  // 26
  {
    id: 'cialong-5mg-30-fc-tabs-bph',
    name: 'Cialong 5 mg 30 f.c.tabs.',
    genericName: 'tadalafil',
    concentration: '5mg',
    price: 150,
    matchKeywords: ['#tonic', 'tadalafil 5', 'daily'],
    usage: 'تادالافيل ٥ مجم (جرعة يومية) لتحسين أعراض تضخم البروستاتا وقد يساعد ضعف الانتصاب.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً بدون اعتبار للأكل (مزمن)'),
    warnings: PDE5_WARNINGS,
  },

  // 27
  {
    id: 'pepon-30-caps-bph',
    name: 'Pepon 30 caps',
    genericName: 'pumpkin seed oil',
    concentration: '30 caps',
    price: 60,
    matchKeywords: ['#prostate', 'pepon'],
    usage: 'زيت بذور اليقطين كمكمل داعم للبروستاتا وقد يساعد أعراض البول الخفيفة.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً بدون اعتبار للأكل (مزمن)'),
    warnings: HERBAL_PROSTATE_WARNINGS,
  },

  // 28
  {
    id: 'prostacure-50mg-20-caps-bph',
    name: 'Prostacure 50mg 20 caps.',
    genericName: 'pygeum africanum extract',
    concentration: '50mg',
    price: 94,
    matchKeywords: ['#prostate', 'pygeum'],
    usage: 'مستخلص بيجيوم أفريكانوم كمكمل لدعم أعراض البروستاتا الخفيفة.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً بدون اعتبار للأكل (مزمن)'),
    warnings: HERBAL_PROSTATE_WARNINGS,
  },

  // 29
  {
    id: 'prostanorm-30-caps-bph',
    name: 'Prostanorm 30 caps',
    genericName: 'pygeum africanum & saw palmetto & zinc gluconate & n...',
    concentration: '30 caps',
    price: 231,
    matchKeywords: ['#prostate', 'supplement', 'prostanorm'],
    usage: 'مكمل بروستاتا متعدد المكونات لدعم أعراض البروستاتا الخفيفة والمتوسطة.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً بدون اعتبار للأكل (مزمن)'),
    warnings: HERBAL_PROSTATE_WARNINGS,
  },

  // 30
  {
    id: 'modern-saw-palmetto-30-caps-bph',
    name: 'Modern saw palmetto 30 capsules',
    genericName: 'saw palmetto & zinc',
    concentration: '30 caps',
    price: 250,
    matchKeywords: ['#phototherapy', '#prostate', 'saw palmetto'],
    usage: 'ساو بالميتو مع زنك كمكمل داعم لصحة البروستاتا وقد يساعد أعراض البول الخفيفة.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً بدون اعتبار للأكل (مزمن)'),
    warnings: HERBAL_PROSTATE_WARNINGS,
  },

  // 31
  {
    id: 'cardura-1mg-21-tabs-bph',
    name: 'Cardura 1mg 21 tab.',
    genericName: 'doxazosin',
    concentration: '1mg',
    price: 78,
    matchKeywords: ['cardura 1', '#antihypotensive', '#alpha 1 receptor blockers', '#bph'],
    usage: 'دوكسازوسين (جرعة ابتدائية) لتحسين أعراض البروستاتا وقد يساعد في الضغط.',
    timing: 'مرة يومياً قبل النوم – مزمن',
    category: Category.URINARY_CARE,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً قبل النوم (مزمن)'),
    warnings: DOXAZOSIN_WARNINGS,
  },

  // 32
  {
    id: 'bengiride-0-5mg-30-caps-bph',
    name: 'Bengiride 0.5 mg 30 caps.',
    genericName: 'dutasteride',
    concentration: '0.5mg',
    price: 162,
    matchKeywords: ['#alpha-reductase inhibitor', 'dutasteride'],
    usage: 'دوتاستيرايد لتقليل حجم البروستاتا وتحسين الأعراض على المدى الطويل.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً بدون اعتبار للأكل (مزمن)'),
    warnings: FIVE_ALPHA_REDUCTASE_WARNINGS,
  },

  // 33
  {
    id: 'proscar-5mg-28-fc-tabs-bph',
    name: 'Proscar 5mg 28 f.c. tab',
    genericName: 'finasteride',
    concentration: '5mg',
    price: 234,
    matchKeywords: ['#alpha-reductase inhibitor', 'proscar'],
    usage: 'فيناستيرايد ٥ مجم لتقليل حجم البروستاتا (علاج طويل المدى).',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً بدون اعتبار للأكل (مزمن)'),
    warnings: FIVE_ALPHA_REDUCTASE_WARNINGS,
  },

  // 34
  {
    id: 'royalsteride-5mg-20-fc-tabs-bph',
    name: 'Royalsteride 5 mg 20 f.c. tabs.',
    genericName: 'finasteride',
    concentration: '5mg',
    price: 52.25,
    matchKeywords: ['#alpha-reductase inhibitor', 'royalsteride'],
    usage: 'فيناستيرايد ٥ مجم لتقليل حجم البروستاتا (علاج طويل المدى).',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً بدون اعتبار للأكل (مزمن)'),
    warnings: FIVE_ALPHA_REDUCTASE_WARNINGS,
  },

  // 35
  {
    id: 'royalsteride-5mg-30-fc-tabs-bph',
    name: 'Royalsteride 5 mg 30 f.c. tabs.',
    genericName: 'finasteride',
    concentration: '5mg',
    price: 132,
    matchKeywords: ['#alpha-reductase inhibitor', 'royalsteride'],
    usage: 'فيناستيرايد ٥ مجم لتقليل حجم البروستاتا (علاج طويل المدى).',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً بدون اعتبار للأكل (مزمن)'),
    warnings: FIVE_ALPHA_REDUCTASE_WARNINGS,
  },

  // 36
  {
    id: 'prost-ade-20-caps-bph',
    name: 'Prost ade 20 capsules',
    genericName: 'saw palmetto & pygeum africanum extract & pumpkin...',
    concentration: '20 caps',
    price: 83.5,
    matchKeywords: ['#prostate', 'supplement'],
    usage: 'مكمل بروستاتا عشبي مركب لدعم الأعراض الخفيفة.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً بدون اعتبار للأكل (مزمن)'),
    warnings: HERBAL_PROSTATE_WARNINGS,
  },

  // 37
  {
    id: 'prostalin-5-rectal-supp-bph',
    name: 'Prostalin 5 rectal supp.',
    genericName: 'hamamelis extract & potassium iodide & ichtham...',
    concentration: '5 suppositories',
    price: 4.25,
    matchKeywords: ['#prostate', 'suppository', 'rectal'],
    usage: 'لبوس شرجي قد يُستخدم لتخفيف الاحتقان/الأعراض الموضعية.',
    timing: 'مرة يومياً قبل النوم – مزمن',
    category: Category.URINARY_CARE,
    form: 'Suppositories',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً قبل النوم (مزمن)'),
    warnings: RECTAL_SUPP_WARNINGS,
  },

  // 38
  {
    id: 'geoprost-30-ec-tabs-bph',
    name: 'Geoprost 30 e.c.tabs.',
    genericName: 'vitamin b6 & selenium & zinc & vitamin d3 & saw palmetto ex...',
    concentration: '30 tabs',
    price: 350,
    matchKeywords: ['#prostate', 'vitamins', 'selenium', 'zinc', 'vitamin d3'],
    usage: 'مكمل بروستاتا يحتوي على مضادات أكسدة ومعادن (مثل زنك/سيلينيوم) مع ساو بالميتو لدعم الأعراض الخفيفة.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'E.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً بدون اعتبار للأكل (مزمن)'),
    warnings: HERBAL_PROSTATE_WARNINGS,
  },

  // 39
  {
    id: 'cure-pro-0-4mg-10-caps-bph',
    name: 'Cure pro 0.4mg 10 caps',
    genericName: 'tamsulosin hcl',
    concentration: '0.4mg',
    price: 21.6,
    matchKeywords: ['#urination difficulty', '#alpha blocker'],
    usage: 'تامسولوسين لتحسين تدفق البول وتقليل أعراض تضخم البروستاتا (عبوة صغيرة).',
    timing: 'مرة يومياً قبل النوم – مزمن',
    category: Category.URINARY_CARE,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً قبل النوم (مزمن)'),
    warnings: TAMSULOSIN_WARNINGS,
  },

  // 40
  {
    id: 'finastura-5mg-30-fc-tabs-bph',
    name: 'Finastura 5mg 30 f.c.tab.',
    genericName: 'finasteride',
    concentration: '5mg',
    price: 111,
    matchKeywords: ['#alpha-reductase inhibitor', 'finastura'],
    usage: 'فيناستيرايد ٥ مجم لتقليل حجم البروستاتا وتحسين الأعراض على المدى الطويل.',
    timing: 'مرة يومياً – مزمن',
    category: Category.URINARY_CARE,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً بدون اعتبار للأكل (مزمن)'),
    warnings: FIVE_ALPHA_REDUCTASE_WARNINGS,
  },

  // 41
  {
    id: 'curepro-xr-0-4mg-10-caps-bph',
    name: 'Curepro xr 0.4 mg 10 caps',
    genericName: 'tamsulosin hcl',
    concentration: '0.4mg',
    price: 21.6,
    matchKeywords: ['#urination difficulty', '#alpha blocker', 'xr'],
    usage: 'تامسولوسين (ممتد المفعول) لتحسين تدفق البول وتقليل أعراض تضخم البروستاتا (عبوة صغيرة).',
    timing: 'مرة يومياً قبل النوم – مزمن',
    category: Category.URINARY_CARE,
    form: 'Modified-release Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً قبل النوم (مزمن)'),
    warnings: TAMSULOSIN_WARNINGS,
  },

  // 42
  {
    id: 'lidoflak-8mg-10-caps-bph',
    name: 'Lidoflak 8 mg 10 capsules',
    genericName: 'silodosin',
    concentration: '8mg',
    price: 35,
    matchKeywords: ['#urination difficulty', '#alpha blocker', 'silodosin'],
    usage: 'سيلودوسين لتحسين أعراض تضخم البروستاتا (عبوة صغيرة).',
    timing: 'مرة يومياً قبل النوم – مزمن',
    category: Category.URINARY_CARE,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً قبل النوم (مزمن)'),
    warnings: SILODOSIN_WARNINGS,
  },

  // 43
  {
    id: 'lidoflak-8mg-30-caps-bph',
    name: 'Lidoflak 8 mg 30 caps.',
    genericName: 'silodosin',
    concentration: '8mg',
    price: 135,
    matchKeywords: ['#urination difficulty', '#alpha blocker', 'silodosin'],
    usage: 'سيلودوسين لتحسين أعراض تضخم البروستاتا.',
    timing: 'مرة يومياً قبل النوم – مزمن',
    category: Category.URINARY_CARE,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً قبل النوم (مزمن)'),
    warnings: SILODOSIN_WARNINGS,
  },

  // 44
  {
    id: 'curepro-xr-0-4mg-30-caps-bph',
    name: 'Curepro xr 0.4 mg 30 caps.',
    genericName: 'tamsulosin hcl',
    concentration: '0.4mg',
    price: 75,
    matchKeywords: ['#urination difficulty', '#alpha blocker', 'xr'],
    usage: 'تامسولوسين (ممتد المفعول) لتحسين تدفق البول وتقليل أعراض تضخم البروستاتا.',
    timing: 'مرة يومياً قبل النوم – مزمن',
    category: Category.URINARY_CARE,
    form: 'Modified-release Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: fixed('١ قرص مرة يومياً قبل النوم (مزمن)'),
    warnings: TAMSULOSIN_WARNINGS,
  },
];

export const BPH_MEDS: Medication[] = BPH_MEDS_RAW.map(enhanceBphMedication);


