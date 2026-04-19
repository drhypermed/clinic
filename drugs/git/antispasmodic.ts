import { Category, Medication } from '../../types';

const toAr = (n: number | string) => n.toString().replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const fixed = (text: string) => (_w: number, _a: number) => text;

/* ═══════════════════════════════════════════════════════════════════════════
   COMMON WARNINGS - تحذيرات ثابتة مشتركة
   ═══════════════════════════════════════════════════════════════════════════ */

const ANTICHOLINERGIC_WARNINGS = [
    'ممنوع في: الجلوكوما ضيقة الزاوية، احتباس البول/تضخم البروستاتا، انسداد/شلل الأمعاء.',
    'الحذر مع: كبار السن، تسارع القلب/اضطراب النظم، الحمى/الجو الحار.',
    'تداخلات: يزيد الجفاف/الإمساك/زغللة مع مضادات الحساسية المهدئة/مضادات الاكتئاب الثلاثية.',
    'أوقف الدواء عند حدوث حساسية شديدة أو صعوبة تنفس.'
];

const TIEMONIUM_WARNINGS = [
    ...ANTICHOLINERGIC_WARNINGS,
    'الحقن الوريدي يكون ببطء شديد لتجنب هبوط الضغط.'
];

const DICYCLOMINE_WARNINGS = [
    ...ANTICHOLINERGIC_WARNINGS,
    'ممنوع للرضع أقل من ٦ شهور (خطر توقف التنفس).',
    'قد يسبب نعاساً — تجنب القيادة.'
];

const MEBEVERINE_WARNINGS = [
    'نادراً: طفح جلدي أو حساسية.',
    'آمن نسبياً مقارنة بمضادات الكولين — لا يسبب جفاف أو احتباس بول.'
];

const HYOSCINE_WARNINGS = [
    ...ANTICHOLINERGIC_WARNINGS,
    'قد يسبب نعاساً — تجنب القيادة والآلات الثقيلة.'
];

/* ═══════════════════════════════════════════════════════════════════════════
   DOSE HELPERS - دوال حساب الجرعات
   ═══════════════════════════════════════════════════════════════════════════ */

// Dicyclomine Syrup Dose (0.5 mg/kg/dose, 3-4 times daily)
const dicyclomineSyrupDose = (weightKg: number, ageMonths: number, mgPerMl: number = 2): string => {
    if (ageMonths < 6) {
        return 'ممنوع للرضع أقل من ٦ شهور.';
    }
    if (ageMonths < 24) {
        const doseMg = clamp(weightKg * 0.5, 2.5, 5);
        const doseML = (doseMg / mgPerMl).toFixed(1);
        return `${toAr(doseML)} مل (${toAr(Math.round(doseMg))} مجم) ٣ مرات يومياً قبل الأكل.`;
    }
    if (ageMonths < 144) {
        const doseMg = clamp(weightKg * 0.5, 5, 10);
        const doseML = (doseMg / mgPerMl).toFixed(1);
        return `${toAr(doseML)} مل (${toAr(Math.round(doseMg))} مجم) ٣ مرات يومياً قبل الأكل.`;
    }
    return '٥ مل (١٠ مجم) ٣ مرات يومياً قبل الأكل.';
};

// Mebeverine Dose (135mg 3 times daily for adults)
const mebeverineDose = (weightKg: number, ageMonths: number): string => {
    if (ageMonths < 120) { // < 10 years
        return 'غير مُعتمد للأطفال أقل من ١٠ سنوات.';
    }
    return 'قرص واحد (١٣٥ مجم) ٣ مرات يومياً قبل الأكل بـ ٢٠ دقيقة.';
};

// Tiemonium Syrup Dose (10mg/5ml)
const tiemoniumSyrupDose = (weightKg: number, ageMonths: number): string => {
    if (ageMonths < 6) {
        return 'ممنوع للرضع أقل من ٦ شهور.';
    }
    if (ageMonths < 72) { // 6 months - 6 years
        return '٢٫٥ مل كل ٨ ساعات قبل الأكل — ٣ مرات يومياً.';
    }
    if (ageMonths < 144) { // 6-12 years
        return '٥ مل كل ٨ ساعات قبل الأكل — ٣ مرات يومياً.';
    }
    return '١٥ مل كل ٨ ساعات قبل الأكل — ٣ مرات يومياً.';
};

// Tiemonium Injection Dose
const tiemoniumInjDose = fixed('أمبول واحد (٥ مجم) بالعضل أو وريدي بطيء — كل ٨-١٢ ساعة عند اللزوم (حد أقصى ٣ أمبولات/يوم).');

/* ═══════════════════════════════════════════════════════════════════════════
   TEXT SANITIZERS
   ═══════════════════════════════════════════════════════════════════════════ */

const normalizeSpaces = (s: string) =>
    s.replace(/\s+/g, ' ').replace(/\s+([،.])/g, '$1').trim();

const stripDoctorPhrases = (s: string) => {
    let t = s;
    t = t.replace(/تحت\s*إشراف\s*طبي(?:ب)?/g, '');
    t = t.replace(/(?:بعد\s+)?استشارة\s+طبية/g, '');
    t = t.replace(/استشر\s+الطبيب(?:ك)?/g, '');
    t = t.replace(/(?:إلا\s+)?باستشارة\s+طبيب(?:\s+أطفال)?/g, '');
    t = t.replace(/بدون\s+مراجعة\s+طبيب/g, '');
    t = t.replace(/حسب\s+(?:توجيه|تعليمات|إرشادات|شدة الألم و)\s*(?:الطبيب)?/g, '');
    t = t.replace(/بوصفة\s+طبيب/g, '');
    t = t.replace(/وبأمر\s+الطبيب/g, '');
    t = t.replace(/بأمر\s+الطبيب/g, '');
    t = t.replace(/إلا\s+بوصفة\s+طبيب/g, '');
    t = t.replace(/إلا\s+للضرورة\s+و/g, 'للضرورة فقط.');
    t = t.replace(/يُستخدم\s+فقط\s+(?:إذا|عند)\s+(?:كانت\s+)?(?:الفائدة\s+تفوق\s+الضرر|الضرورة|لزم)\s*و?/g, 'للضرورة فقط —');
    t = t.replace(/يفضل\s+تجنبه\s+إلا\s+للضرورة\s*و?/g, 'يُتجنب إلا للضرورة.');
    t = t.replace(/يُتجنب\s+إلا\s+للضرورة\s*و?/g, 'يُتجنب إلا للضرورة.');
    // Clean up double spaces and punctuation
    t = t.replace(/\s*؛\s*\./g, '.');
    t = t.replace(/\(\s*\)/g, '');
    return normalizeSpaces(t);
};

const sanitizeDoseText = (s: string) => stripDoctorPhrases(s);
const sanitizeWarnings = (warnings: string[]) =>
    warnings.map(w => stripDoctorPhrases(w)).filter(w => w.length > 0);

const sanitizeMedication = (m: Medication): Medication => ({
    ...m,
    timing: stripDoctorPhrases(m.timing),
    warnings: sanitizeWarnings(m.warnings),
    calculationRule: (w, a) => sanitizeDoseText(m.calculationRule(w, a)),
});

const ANTISPASMODIC_MEDS_RAW: Medication[] = [
  // 1. Visceralgine 5mg/2ml 6 Ampoules
  {
    id: 'visceralgine-5-amp-6',
    name: 'Visceralgine 5mg/2ml 6 Ampoules',
    genericName: 'Tiemonium methylsulfate',
    concentration: '5mg/2ml',
    price: 90,
    matchKeywords: [
      'spasm', 'antispasmodic', 'tiemonium', 'visceralgine', 'colic', 'abdominal pain', 'renal colic', 'biliary colic',
      'فيسيرالجين', 'تيمونيوم', 'مغص', 'تقلصات', 'ألم بطن', 'مغص كلوي', 'مغص مراري', 'حقن تقلصات'
    ],
    usage: 'مضاد للتقلصات (مضاد كولين طرفي) لتخفيف المغص وتقلصات الجهاز الهضمي/القنوات المرارية/المسالك البولية كعلاج عرضي.',
    timing: 'عادة يُستخدم لفترة قصيرة عند اللزوم للمغص الحاد.',
    category: Category.ANTISPASMODIC, 
    form: 'Ampoule',
    minAgeMonths: 180, 
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('أمبول واحد (٥ مجم) بالعضل أو بالوريد ببطء شديد — كل ٨-١٢ ساعة عند اللزوم (حد أقصى ٣ أمبولات/يوم).'),
    warnings: TIEMONIUM_WARNINGS
  },

  // 2. Spasmofree 5mg/2ml 3 Ampoules
  {
    id: 'spasmofree-5-amp-3',
    name: 'Spasmofree 5mg/2ml 3 Ampoules',
    genericName: 'Tiemonium methylsulfate',
    concentration: '5mg/2ml',
    price: 54, 
    matchKeywords: [
      'spasm', 'antispasmodic', 'tiemonium', 'spasmofree', 'colic', 'abdominal pain', 'renal colic', 'biliary colic',
      'سبازموفري', 'تيمونيوم', 'مغص', 'تقلصات', 'ألم بطن', 'مغص كلوي', 'مغص مراري', 'حقن تقلصات'
    ],
    usage: 'مضاد للتقلصات (مضاد كولين طرفي) لتخفيف المغص وتقلصات الجهاز الهضمي/القنوات المرارية/المسالك البولية كعلاج عرضي.',
    timing: 'عادة يُستخدم لفترة قصيرة عند اللزوم للمغص الحاد.',
    category: Category.ANTISPASMODIC, 
    form: 'Ampoule',
    minAgeMonths: 180, 
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('أمبول واحد (٥ مجم) بالعضل أو بالوريد ببطء شديد — كل ٨-١٢ ساعة عند اللزوم (حد أقصى ٣ أمبولات/يوم).'),
    warnings: TIEMONIUM_WARNINGS
  },

  // 3. Spasmofree 50mg 20 f.c. tabs.
  {
    id: 'spasmofree-50-tabs',
    name: 'Spasmofree 50mg 20 f.c. tabs.',
    genericName: 'Tiemonium methylsulfate',
    concentration: '50mg',
    price: 42, 
    matchKeywords: [
      'spasm', 'antispasmodic', 'tiemonium', 'spasmofree', 'colic', 'abdominal pain', 'irritable bowel syndrome', 'ibs',
      'سبازموفري أقراص', 'تيمونيوم', 'مغص', 'تقلصات', 'قولون', 'ألم بطن', 'مغص الدورة', 'مغص كلوي'
    ],
    usage: 'مضاد للتقلصات (مضاد كولين طرفي) لتخفيف أعراض التقلصات/المغص المرتبطة بالجهاز الهضمي أو المرارة أو المسالك البولية.',
    timing: 'يفضل قبل الأكل بـ ٢٠–٣٠ دقيقة إذا كانت الأعراض مرتبطة بالوجبات.',
    category: Category.ANTISPASMODIC, 
    form: 'Tablet',
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد (٥٠ مجم) كل ٨ ساعات قبل الأكل — ٣ مرات يومياً.'),
    warnings: ANTICHOLINERGIC_WARNINGS
  },

  // 4. Visceralgine 10mg/5ml syrup 120 ml
  {
    id: 'visceralgine-10-syrup',
    name: 'Visceralgine 10mg/5ml syrup 120 ml',
    genericName: 'Tiemonium methylsulfate',
    concentration: '10mg/5ml',
    price: 35, 
    matchKeywords: [
      'spasm', 'antispasmodic', 'tiemonium', 'visceralgine', 'colic', 'abdominal pain', 'infant colic', 'pediatric',
      'فيسيرالجين شراب', 'تيمونيوم', 'مغص للاطفال', 'تقلصات الرضع', 'مغص معوي', 'ألم بطن', 'شراب للمغص'
    ],
    usage: 'مضاد للتقلصات لتخفيف المغص/تقلصات البطن كعلاج عرضي. لا يُغني عن تقييم السبب (عدوى/انسداد/جفاف).',
    timing: 'عادة ٣ مرات يومياً قبل الأكل بـ ٢٠–٣٠ دقيقة إذا كانت الأعراض مرتبطة بالوجبات.',
    category: Category.ANTISPASMODIC, 
    form: 'Syrup',
    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 3.5,
    maxWeight: 150,
    calculationRule: tiemoniumSyrupDose,
    warnings: ANTICHOLINERGIC_WARNINGS
  },

  // 5. Visceralgine 5mg/2ml iv im 3 ampoules
  {
    id: 'visceralgine-5-amp-3',
    name: 'Visceralgine 5mg/2ml iv im 3 ampoules',
    genericName: 'Tiemonium methylsulfate',
    concentration: '5mg/2ml',
    price: 45, 
    matchKeywords: [
      'spasm', 'antispasmodic', 'tiemonium', 'visceralgine', 'colic', 'abdominal pain', 'renal colic', 'biliary colic',
      'فيسيرالجين أمبول', 'تيمونيوم', 'مغص', 'تقلصات', 'ألم بطن', 'مغص كلوي', 'مغص مراري', 'حقنة تقلصات'
    ],
    usage: 'مضاد للتقلصات (مضاد كولين طرفي) لتخفيف المغص الحاد كعلاج عرضي.',
    timing: 'عادة يُستخدم لفترة قصيرة عند اللزوم.',
    category: Category.ANTISPASMODIC, 
    form: 'Ampoule',
    minAgeMonths: 180, 
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: tiemoniumInjDose,
    warnings: TIEMONIUM_WARNINGS
  },

  // 6. Visceralgine 20mg 6 supp.
  {
    id: 'visceralgine-20-supp',
    name: 'Visceralgine 20mg 6 supp.',
    genericName: 'Tiemonium methylsulfate',
    concentration: '20mg',
    price: 18, 
    matchKeywords: [
      'spasm', 'antispasmodic', 'tiemonium', 'visceralgine', 'colic', 'abdominal pain', 'suppository',
      'فيسيرالجين لبوس', 'تيمونيوم', 'مغص', 'تقلصات', 'ألم بطن', 'لبوس للمغص', 'تقلصات القولون'
    ],
    usage: 'مضاد للتقلصات لتخفيف المغص كعلاج عرضي عندما يتعذر تناول الدواء بالفم.',
    timing: 'عادةً عند اللزوم لفترة قصيرة.',
    category: Category.ANTISPASMODIC, 
    form: 'Suppository',
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('لبوسة واحدة كل ٨-١٢ ساعة عند اللزوم — حد أقصى ٣ مرات يومياً.'),
    warnings: ANTICHOLINERGIC_WARNINGS
  },

  // 7. Visceralgine 50mg 20 f.c. tab.
  {
    id: 'visceralgine-50-tabs',
    name: 'Visceralgine 50mg 20 f.c. tab.',
    genericName: 'Tiemonium methylsulfate',
    concentration: '50mg',
    price: 42, 
    matchKeywords: [
      'spasm', 'antispasmodic', 'tiemonium', 'visceralgine', 'colic', 'abdominal pain', 'irritable bowel syndrome', 'ibs',
      'فيسيرالجين أقراص', 'تيمونيوم', 'مغص', 'تقلصات', 'قولون عصبي', 'ألم بطن', 'مغص مراري', 'مغص كلوي'
    ],
    usage: 'مضاد للتقلصات (مضاد كولين طرفي) لتخفيف المغص/التقلصات كعلاج عرضي.',
    timing: 'يفضل قبل الأكل بـ ٢٠–٣٠ دقيقة إذا كانت الأعراض مرتبطة بالوجبات.',
    category: Category.ANTISPASMODIC, 
    form: 'Tablet',
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: fixed('قرص واحد (٥٠ مجم) كل ٨ ساعات قبل الأكل — ٣ مرات يومياً.'),
    warnings: ANTICHOLINERGIC_WARNINGS
  },

  // 8. Alverinspasm 24 s.g.caps.
  {
    id: 'alverinspasm-24-caps',
    name: 'Alverinspasm 24 s.g.caps.',
    genericName: 'Alverine citrate',
    concentration: '60mg',
    price: 74, 
    matchKeywords: [
      'spasm', 'antispasmodic', 'alverine', 'alverinspasm', 'ibs', 'irritable bowel syndrome', 'dysmenorrhea', 'colic',
      'ألفيرينسبازم', 'ألفيرين', 'تقلصات القولون', 'قولون عصبي', 'مغص الدورة', 'مغص معوي', 'تشنج العضلات الملساء'
    ],
    usage: 'مضاد للتقلصات يُستخدم لتخفيف أعراض القولون العصبي (ألم/تقلصات) وقد يفيد في تقلصات الدورة كعلاج عرضي.',
    timing: 'يُفضل قبل الوجبات إذا كانت الأعراض مرتبطة بالأكل.',
    category: Category.ANTISPASMODIC, 
    form: 'Soft Gelatin Capsule',
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: (_weight, ageMonths) => {
      if (ageMonths >= 144) {
        return 'كبسولة واحدة كل ٨ ساعات قبل الأكل (٣ مرات يومياً).';
      }

      return 'غير موصى به عادةً للأطفال أقل من ١٢ سنة (الجرعات/الأمان غير مثبتين).';
    },
    warnings: [
      'الحمل: بيانات غير كافية؛ يُفضل تجنبه إلا حسب التشخيص (خصوصاً في الثلث الأول).',
      'التداخلات: لا توجد تداخلات دوائية شائعة ذات أهمية كبيرة عادةً، لكن راجع تداخلات المريض خاصة أدوية القولون/المسكنات.',
      'تحذيرات: اطلب تقييماً طبياً إذا كان الألم شديداً/مستمراً أو مصحوباً بنقص وزن/دم بالبراز/حمى.',
      'أوقف الدواء واطلب مراجعة إذا ظهرت علامات حساسية (طفح/تورم) أو اصفرار الجلد/العين (نادراً).'
    ]
  },

  // 9. Sekem baby calm herbs 15 filter bags
  {
    id: 'sekem-baby-calm-15',
    name: 'Sekem baby calm herbs 15 filter bags',
    genericName: 'Herbal blend (Chamomile, Anise, Fennel, Caraway)',
    concentration: 'Filter Bag',
    price: 28, 
    matchKeywords: [
      'colic', 'baby', 'calm', 'herbs', 'sekem', 'natural', 'gas', 'flatulence', 'bloating', 'infant',
      'سيكم', 'بيبي كالم', 'أعشاب', 'مغص أطفال', 'غازات', 'رضع', 'مهدئ', 'أعشاب طبيعية', 'يانسون', 'كروية'
    ],
    usage: 'مغلي أعشاب للمساعدة على تهدئة المغص الخفيف والغازات عند الأطفال كدعم، وليس بديلاً للرضاعة أو العلاج الطبي.',
    timing: 'عند اللزوم وبكميات صغيرة، ويفضل بعد الرضعة.',
    category: Category.ANTISPASMODIC, 
    form: 'Sachets',
    minAgeMonths: 6,
    maxAgeMonths: 120,
    minWeight: 3,
    maxWeight: 40,
    calculationRule: (_weight, ageMonths) => {
      if (ageMonths >= 6 && ageMonths < 24) {
        return 'انقع كيس واحد في ١٠٠ مل ماء مغلي لمدة ٥ دقائق، ثم اعطِ ٥–١٠ مل فقط بعد الرضعة عند اللزوم (لا يتجاوز ٣ مرات/اليوم).';
      }

      if (ageMonths >= 24 && ageMonths <= 120) {
        return 'انقع كيس واحد في ١٥٠ مل ماء مغلي لمدة ٥ دقائق، ثم يُشرب ٥٠–١٠٠ مل مرة إلى مرتين يومياً عند اللزوم.';
      }

      return 'غير موصى به أقل من ٦ أشهر إلا حسب التشخيص.';
    },
    warnings: [
      'الحمل: غير مخصص للحامل كمنتج علاجي؛ وفي حال استخدام أعشاب منفردة، تُستشار الطبيبة لأن بعض الأعشاب قد تسبب تقلصات رحمية.',
      'التداخلات: قد تزيد مهدئات/مضادات الهيستامين المسببة للنعاس من النعاس إذا تم تناول الأعشاب بكميات كبيرة.',
      'تحذيرات: خطر حساسية (خاصة البابونج لمن لديهم حساسية من نباتات الأقحوان). أوقفه إذا ظهر طفح/تورم/صفير.',
      'لا يُعطى العسل للأطفال أقل من ١٢ شهر (خطر التسمم الوشيقي).',
      'اطلب تقييم طبي إذا كان المغص شديداً/مستمراً أو مع قيء/حمى/دم بالبراز أو ضعف رضاعة.'
    ]
  },

  // 10. Simedill emulsion 120 ml
  {
    id: 'simedill-120-emul',
    name: 'Simedill emulsion 120 ml',
    genericName: 'Simethicone',
    concentration: '40mg/5ml', 
    price: 50, 
    matchKeywords: [
      'gas', 'flatulence', 'bloating', 'simethicone', 'simedill', 'infant colic', 'antiflatulent',
      'سيميديل', 'سيميثيكون', 'غازات', 'انتفاخ', 'مغص رضع', 'طارد للغازات', 'ترييح البطن'
    ],
    usage: 'طارد للغازات يعمل موضعياً داخل الأمعاء لتقليل الانتفاخ/الغازات (لا يُعالج سبب الألم إذا كان هناك مرض عضوي).',
    timing: 'بعد الأكل وعند النوم، أو عند اللزوم.',
    category: Category.ANTISPASMODIC, 
    form: 'Syrup',
    minAgeMonths: 0, 
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 250,
    calculationRule: (_weight, ageMonths) => {
      if (ageMonths >= 144) {
        return '١٠ مل (٨٠ مجم) بعد الأكل وعند النوم، حتى ٤ مرات يومياً.';
      }

      if (ageMonths >= 24 && ageMonths < 144) {
        return '٥ مل (٤٠ مجم) بعد الأكل وعند النوم، حتى ٤ مرات يومياً.';
      }

      return '٢.٥ مل (٢٠ مجم) بعد الرضعة وعند النوم، حتى ٤ مرات يومياً.';
    },
    warnings: [
      'الحمل: يعتبر منخفض الخطورة لأن امتصاصه الجهازي ضئيل جداً/معدوم عادةً؛ يُستخدم عند اللزوم.',
      'التداخلات: لا توجد تداخلات دوائية مهمة شائعة لأنه يعمل موضعياً داخل الأمعاء.',
      'تحذيرات: لا يُستخدم إذا كان هناك اشتباه انسداد معوي (قيء مستمر/انقطاع غازات وبراز/انتفاخ شديد).',
      'أعد التقييم إذا استمر الألم/الانتفاخ لأكثر من عدة أيام أو تكرر بشكل ملحوظ.'
    ]
  },
  // 11. Spasmocure 60mg 30 tabs
  {
    id: 'spasmocure-60-tabs',
    name: 'Spasmocure 60mg 30 tabs',
    genericName: 'Alverine citrate',
    concentration: '60mg',
    price: 54, 
    matchKeywords: [
      'spasm', 'antispasmodic', 'alverine', 'spasmocure', 'ibs', 'irritable bowel syndrome', 'dysmenorrhea', 'colic',
      'سبازموكيور', 'ألفيرين', 'تقلصات القولون', 'قولون عصبي', 'مغص الدورة', 'مغص معوي', 'تشنج العضلات الملساء'
    ],
    usage: 'مضاد للتقلصات لتخفيف أعراض القولون العصبي (ألم/تقلصات) كعلاج عرضي.',
    timing: 'يفضل قبل الأكل إذا كانت الأعراض مرتبطة بالوجبات.',
    category: Category.ANTISPASMODIC, 
    form: 'Tablet',
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: (_weight, ageMonths) => {
      if (ageMonths >= 144) {
        return 'قرص واحد كل ٨ ساعات قبل الأكل (٣ مرات يومياً).';
      }

      return 'غير موصى به عادةً للأطفال أقل من ١٢ سنة.';
    },
    warnings: [
      'الحمل: بيانات غير كافية؛ يُفضل تجنبه إلا حسب التشخيص.',
      'التداخلات: لا توجد تداخلات شائعة مهمة عادةً؛ راجع تداخلات المريض للمعدة/المسكنات.',
      'تحذيرات: اطلب مراجعة إذا وُجد ألم شديد مستمر، أو فقدان وزن، أو دم بالبراز، أو إمساك شديد جديد.',
      'أوقفه إذا ظهرت حساسية أو اصفرار الجلد/العين (نادراً).' 
    ]
  },

  // 12. Spasmofree 10mg/5ml syrup 120ml
  {
    id: 'spasmofree-10-syrup',
    name: 'Spasmofree 10mg/5ml syrup 120ml',
    genericName: 'Tiemonium methylsulfate',
    concentration: '10mg/5ml',
    price: 35,
    matchKeywords: [
      'spasm', 'antispasmodic', 'tiemonium', 'spasmofree', 'colic', 'abdominal pain', 'infant colic', 'pediatric',
      'سبازموفري شراب', 'تيمونيوم', 'مغص للاطفال', 'تقلصات الرضع', 'مغص معوي', 'ألم بطن', 'شراب للمغص'
    ],
    usage: 'مضاد للتقلصات لتخفيف المغص/تقلصات البطن كعلاج عرضي. لا يُستخدم كبديل لتقييم سبب الألم.',
    timing: 'عادة ٣ مرات يومياً قبل الأكل بـ ٢٠–٣٠ دقيقة إذا كانت الأعراض مرتبطة بالوجبات.',
    category: Category.ANTISPASMODIC, 
    form: 'Syrup',
    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 3.5,
    maxWeight: 150,
    calculationRule: (_weight, ageMonths) => {
      if (ageMonths >= 144) {
        return '١٥ مل (ملعقة كبيرة) كل ٨ ساعات قبل الأكل (٣ مرات يومياً).';
      }

      if (ageMonths >= 72) {
        return '٥ مل (ملعقة صغيرة) كل ٨ ساعات قبل الأكل (٣ مرات يومياً).';
      }

      if (ageMonths >= 6) {
        return '٢.٥ مل كل ٨ ساعات قبل الرضاعة/الأكل (٣ مرات يومياً).';
      }

      return 'غير مُوصى به أقل من ٦ أشهر إلا حسب التشخيص والسن.';
    },
    warnings: [
      'الحمل: خطورة غير محددة (بيانات محدودة)؛ يُستخدم فقط عند الضرورة وبأمر الطبيب.',
      'التداخلات: زيادة التأثير المضاد للكولين مع مضادات الحساسية المهدئة/TCAs/مضادات الذهان → احتباس بول/إمساك/زغللة.',
      'تحذيرات: يُمنع في الجلوكوما ضيقة الزاوية، واحتباس البول/انسداد الأمعاء.',
      'تحذيرات: الحذر مع الحمى/الجو الحار (قد يقلل التعرق).'
    ]
  },

  // 13. Stopspasm 20 f.c. tabs.
  {
    id: 'stopspasm-50-tabs',
    name: 'Stopspasm 20 f.c. tabs.',
    genericName: 'Tiemonium methylsulfate', 
    concentration: '50mg',
    price: 60, 
    matchKeywords: [
      'spasm', 'antispasmodic', 'tiemonium', 'stopspasm', 'colic', 'abdominal pain', 'irritable bowel syndrome', 'ibs',
      'ستوب سبازم', 'تيمونيوم', 'مغص', 'تقلصات', 'قولون', 'ألم بطن', 'مغص مراري', 'مغص كلوي'
    ],
    usage: 'مضاد للتقلصات (مضاد كولين طرفي) لتخفيف المغص/التقلصات كعلاج عرضي.',
    timing: 'يفضل قبل الأكل بـ ٢٠–٣٠ دقيقة إذا كانت الأعراض مرتبطة بالوجبات.',
    category: Category.ANTISPASMODIC, 
    form: 'Tablet',
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: (_weight, ageMonths) => {
      if (ageMonths >= 144) {
        return 'قرص واحد كل ٨ ساعات قبل الأكل (٣ مرات يومياً). عند اللزوم يمكن زيادته إلى ٤ مرات يومياً لفترة قصيرة حسب شدة الألم وبأمر الطبيب.';
      }

      return 'غير مناسب عادةً للأطفال أقل من ١٢ سنة بهذا التركيز.';
    },
    warnings: [
      'الحمل: خطورة غير محددة (بيانات محدودة)؛ يفضل تجنبه إلا للضرورة وبأمر الطبيب.',
      'التداخلات: تزداد الأعراض المضادة للكولين مع مضادات الحساسية المهدئة/TCAs/مضادات الذهان.',
      'تحذيرات: يُمنع في الجلوكوما ضيقة الزاوية، احتباس البول/تضخم البروستاتا، انسداد/شلل الأمعاء.',
      'قد يسبب زغللة/دوخة؛ تجنب القيادة إذا ظهرت الأعراض.'
    ]
  },

  // 14. Timogen 10mg/5ml syrup 120ml
  {
    id: 'timogen-10-syrup',
    name: 'Timogen 10mg/5ml syrup 120ml',
    genericName: 'Tiemonium methylsulfate',
    concentration: '10mg/5ml',
    price: 23, 
    matchKeywords: [
      'spasm', 'antispasmodic', 'tiemonium', 'timogen', 'colic', 'abdominal pain', 'infant colic', 'pediatric',
      'تيموجين شراب', 'تيمونيوم', 'مغص للاطفال', 'تقلصات الرضع', 'مغص معوي', 'ألم بطن', 'شراب للمغص'
    ],
    usage: 'مضاد للتقلصات لتخفيف المغص/التقلصات كعلاج عرضي. لا يُستخدم كبديل لتقييم السبب.',
    timing: 'عادة ٣ مرات يومياً قبل الأكل بـ ٢٠–٣٠ دقيقة إذا كانت الأعراض مرتبطة بالوجبات.',
    category: Category.ANTISPASMODIC, 
    form: 'Syrup',
    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 3.5,
    maxWeight: 150,
    calculationRule: (_weight, ageMonths) => {
      if (ageMonths >= 144) {
        return '١٥ مل (ملعقة كبيرة) كل ٨ ساعات قبل الأكل (٣ مرات يومياً).';
      }

      if (ageMonths >= 72) {
        return '٥ مل (ملعقة صغيرة) كل ٨ ساعات قبل الأكل (٣ مرات يومياً).';
      }

      if (ageMonths >= 6) {
        return '٢.٥ مل كل ٨ ساعات قبل الرضاعة/الأكل (٣ مرات يومياً).';
      }

      return 'غير مُوصى به أقل من ٦ أشهر إلا حسب التشخيص والسن.';
    },
    warnings: [
      'الحمل: خطورة غير محددة (بيانات محدودة)؛ يُستخدم فقط عند الضرورة وبأمر الطبيب.',
      'التداخلات: تزداد الأعراض المضادة للكولين مع مضادات الحساسية المهدئة/TCAs/مضادات الذهان.',
      'تحذيرات: يُمنع في الجلوكوما ضيقة الزاوية، احتباس البول، انسداد الأمعاء.',
      'تحذيرات: الحذر مع الحمى/الجو الحار (قد يقلل التعرق).'
    ]
  },

  // 15. Buscopan compositum 20 sugar c. tab.
  {
    id: 'buscopan-compositum-tabs',
    name: 'Buscopan compositum 20 sugar c. tab.',
    genericName: 'Hyoscine butylbromide + Metamizole sodium (dipyrone)',
    concentration: '10mg + 500mg',
    price: 20, 
    matchKeywords: [
      'spasm', 'antispasmodic', 'analgesic', 'buscopan', 'compositum', 'hyoscine', 'metamizole', 'dipyrone', 'renal colic',
      'بسكوبان كومبوزيتوم', 'هيوسين', 'ميتاميزول', 'مسكن ومضاد للتقلصات', 'مغص شديد', 'مغص كلوي', 'ألم الدورة', 'مغص مراري'
    ],
    usage: 'مسكن + مضاد للتقلصات للمغص الشديد (مثل المغص الكلوي/المراري) كعلاج قصير المدى. لا يغني عن علاج السبب.',
    timing: 'عادة بعد الأكل لتقليل اضطراب المعدة.',
    category: Category.ANTISPASMODIC, 
    form: 'Sugar Coated Tablet',
    minAgeMonths: 180,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: (_weight, ageMonths) => {
      if (ageMonths >= 180) {
        return 'قرص واحد كل ٨–١٢ ساعة عند اللزوم بعد الأكل. في الألم الشديد يمكن قرصين كجرعة واحدة. الحد الأقصى: ٨ أقراص/اليوم (بسبب الميتاميزول ٥٠٠ مجم/قرص).';
      }

      return 'غير موصى به عادةً أقل من ١٥ سنة بهذا المستحضر.';
    },
    warnings: [
      'الحمل: خطورة عالية—يُتجنب، وممنوع في الثلث الثالث (الميتاميزول قد يؤثر على كلى الجنين/القناة الشريانية ويزيد نزف الأم والجنين).',
      'التداخلات: يُتجنب مع الميثوتريكسات (زيادة سمّية الدم). قد يُنقص مستويات السيكلوسبورين. وقد يزيد خطر النزف مع مضادات التجلط/الأسبرين عبر تأثيرات على الصفائح.',
      'تحذيرات خطيرة: الميتاميزول قد يسبب ندراً نقص العدلات/اللاعدلات (agranulocytosis) أو تفاعل تحسسي شديد وهبوط ضغط—أوقفه فوراً إذا ظهر التهاب حلق/قرح فم/حمى غير مفسرة أو طفح/صفير.',
      'تحذيرات: يُمنع عند حساسية البيرازولونات/الميتاميزول، وفي تاريخ تفاعلات حساسية شديدة للمسكنات، وفي بعض اضطرابات نخاع العظم/الدم.',
      'تحذيرات: الحذر في الربو التحسسي، انخفاض الضغط، قصور الكلى/الكبد، وكبار السن.'
    ]
  },

  // 16. Spasmopyralgin-m 25*10 tablets
  {
    id: 'spasmopyralgin-m-tabs',
    name: 'Spasmopyralgin-m 25*10 tablets',
    genericName: 'Camylofin dihydrochloride + Metamizole sodium (dipyrone)',
    concentration: '50mg + 500mg',
    price: 525, 
    matchKeywords: [
      'spasm', 'antispasmodic', 'analgesic', 'camylofin', 'metamizole', 'spasmopyralgin', 'renal colic', 'severe pain',
      'سبازموبيرالجين', 'كاميلوفين', 'ميتاميزول', 'مسكن ومضاد للتقلصات', 'مغص شديد', 'مغص كلوي', 'مغص مراري', 'ألم شديد'
    ],
    usage: 'مسكن + مضاد للتقلصات للمغص الشديد (كلوي/مراري/معوي) كعلاج قصير المدى.',
    timing: 'يفضل بعد الأكل. لا يستخدم لفترات طويلة دون مراجعة.',
    category: Category.ANTISPASMODIC, 
    form: 'Tablet',
    minAgeMonths: 180,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: (_weight, ageMonths) => {
      if (ageMonths >= 180) {
        return 'قرص واحد كل ٨–١٢ ساعة عند اللزوم بعد الأكل. في الألم الشديد يمكن قرصين كجرعة واحدة. الحد الأقصى: ٨ أقراص/اليوم (بسبب الميتاميزول ٥٠٠ مجم/قرص).';
      }

      return 'غير موصى به عادةً أقل من ١٥ سنة بهذا المستحضر.';
    },
    warnings: [
      'الحمل: خطورة عالية—يُتجنب، وممنوع في الثلث الثالث بسبب مكون الميتاميزول (تأثيرات محتملة على كلى الجنين/القناة الشريانية ونزف).',
      'التداخلات: يُتجنب مع الميثوتريكسات (زيادة سمّية الدم). قد يُنقص مستويات السيكلوسبورين. الحذر مع مضادات التجلط/الأسبرين (زيادة خطر النزف).',
      'تحذيرات خطيرة: خطر ندرة نقص العدلات/اللاعدلات (agranulocytosis) أو حساسية شديدة/هبوط ضغط—أوقفه فوراً إذا حدث التهاب حلق/حمى/قرح فم/طفح شديد.',
      'تحذيرات: يُمنع عند حساسية الميتاميزول/البيرازولونات، واضطرابات الدم/نخاع العظم.'
    ]
  },

  // 17. Tobolanza 24 s.g.caps.
  {
    id: 'tobolanza-60-caps',
    name: 'Tobolanza 24 s.g.caps.',
    genericName: 'Alverine citrate',
    concentration: '60mg',
    price: 74,
    matchKeywords: [
      'spasm', 'antispasmodic', 'alverine', 'tobolanza', 'ibs', 'irritable bowel syndrome', 'dysmenorrhea', 'colic',
      'توبولانزا', 'ألفيرين', 'تقلصات القولون', 'قولون عصبي', 'مغص الدورة', 'مغص معوي', 'تشنج العضلات الملساء'
    ],
    usage: 'مضاد للتقلصات لتخفيف أعراض القولون العصبي (ألم/تقلصات) وقد يفيد في تقلصات الدورة كعلاج عرضي.',
    timing: 'يفضل قبل الأكل إذا كانت الأعراض مرتبطة بالوجبات.',
    category: Category.ANTISPASMODIC, 
    form: 'Soft Gelatin Capsule',
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: (_weight, ageMonths) => {
      if (ageMonths >= 144) {
        return 'كبسولة واحدة كل ٨ ساعات قبل الأكل (٣ مرات يومياً).';
      }

      return 'غير موصى به عادةً للأطفال أقل من ١٢ سنة.';
    },
    warnings: [
      'الحمل: بيانات غير كافية؛ يُفضل تجنبه إلا حسب التشخيص.',
      'التداخلات: لا توجد تداخلات شائعة مهمة عادةً.',
      'تحذيرات: اطلب تقييماً إذا كان الألم شديداً/مصحوباً بحمى أو قيء أو دم بالبراز.',
      'أوقفه إذا ظهرت حساسية أو اصفرار الجلد/العين (نادراً).' 
    ]
  },

  // 18. Viscera 10mg/5ml syrup 120ml
  {
    id: 'viscera-10-syrup',
    name: 'Viscera 10mg/5ml syrup 120ml',
    genericName: 'Tiemonium methylsulfate',
    concentration: '10mg/5ml',
    price: 23,
    matchKeywords: [
      'spasm', 'antispasmodic', 'tiemonium', 'viscera', 'colic', 'abdominal pain', 'infant colic', 'pediatric',
      'فيسيرا شراب', 'تيمونيوم', 'مغص للاطفال', 'تقلصات الرضع', 'مغص معوي', 'ألم بطن', 'شراب للمغص'
    ],
    usage: 'مضاد للتقلصات لتخفيف المغص/التقلصات كعلاج عرضي. لا يُستخدم كبديل لتقييم السبب.',
    timing: 'عادة ٣ مرات يومياً قبل الأكل بـ ٢٠–٣٠ دقيقة.',
    category: Category.ANTISPASMODIC, 
    form: 'Syrup',
    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 3.5,
    maxWeight: 150,
    calculationRule: (_weight, ageMonths) => {
      if (ageMonths >= 144) {
        return '١٥ مل (ملعقة كبيرة) كل ٨ ساعات قبل الأكل (٣ مرات يومياً).';
      }

      if (ageMonths >= 72) {
        return '٥ مل (ملعقة صغيرة) كل ٨ ساعات قبل الأكل (٣ مرات يومياً).';
      }

      if (ageMonths >= 6) {
        return '٢.٥ مل كل ٨ ساعات قبل الرضاعة/الأكل (٣ مرات يومياً).';
      }

      return 'غير مُوصى به أقل من ٦ أشهر إلا حسب التشخيص والسن.';
    },
    warnings: [
      'الحمل: خطورة غير محددة (بيانات محدودة)؛ يُستخدم فقط عند الضرورة وبأمر الطبيب.',
      'التداخلات: زيادة التأثير المضاد للكولين مع مضادات الحساسية المهدئة/TCAs/مضادات الذهان.',
      'تحذيرات: يُمنع في الجلوكوما ضيقة الزاوية، احتباس البول، انسداد الأمعاء.'
    ]
  },

  // 19. Spasmomen 40mg 20 tab.
  {
    id: 'spasmomen-40-tabs',
    name: 'Spasmomen 40mg 20 tab.',
    genericName: 'Otilonium bromide',
    concentration: '40mg',
    price: 80, 
    matchKeywords: [
      'spasm', 'antispasmodic', 'otilonium', 'spasmomen', 'ibs', 'irritable bowel syndrome', 'colon spasm',
      'سبازمومين', 'أوتيلونيوم', 'قولون عصبي', 'تقلصات القولون', 'مغص معوي', 'اضطرابات الجهاز الهضمي'
    ],
    usage: 'مضاد للتقلصات يُستخدم لتخفيف أعراض القولون العصبي (IBS) مثل الألم/التقلصات والانتفاخ كعلاج عرضي.',
    timing: 'قبل الأكل بـ ٢٠–٣٠ دقيقة.',
    category: Category.ANTISPASMODIC, 
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: (_weight, ageMonths) => {
      if (ageMonths >= 216) {
        return 'قرص واحد قبل الأكل بـ ٢٠–٣٠ دقيقة، مرتين إلى ٣ مرات يومياً (كل ٨–١٢ ساعة).';
      }

      return 'غير موصى به للأطفال والمراهقين (الأمان/الفعالية غير مثبتين).';
    },
    warnings: [
      'الحمل: بيانات غير كافية؛ يفضل تجنبه إلا حسب التشخيص.',
      'التداخلات: قد تزداد أعراض جفاف الفم/الإمساك عند الجمع مع أدوية ذات تأثير مضاد للكولين.',
      'تحذيرات: يُمنع عند الاشتباه في انسداد/شلل الأمعاء. أعد التقييم إذا كان هناك ألم شديد جديد أو نزيف/نقص وزن.',
      'قد يسبب إمساكاً أو جفاف فم نادراً؛ زد السوائل والألياف إذا سمح الطبيب.'
    ]
  },

  // 20. Spazaway 0.125mg 20 sublingual tab.
  {
    id: 'spazaway-0125-sublingual',
    name: 'Spazaway 0.125mg 20 sublingual tab.',
    genericName: 'Hyoscyamine sulfate',
    concentration: '0.125mg',
    price: 29, 
    matchKeywords: [
      'spasm', 'antispasmodic', 'hyoscyamine', 'spazaway', 'sublingual', 'ibs', 'colic', 'instant relief',
      'سبازاواي', 'هيوسيامين', 'تحت اللسان', 'تقلصات سريعة', 'مغص كلوي', 'قولون عصبي', 'مغص مراري'
    ],
    usage: 'مضاد كولين سريع المفعول لتخفيف التقلصات/المغص كعلاج عرضي (مثل IBS). لا يعالج السبب.',
    timing: 'عند اللزوم. يمكن أخذه قبل الوجبات إذا كانت الأعراض مرتبطة بالأكل.',
    category: Category.ANTISPASMODIC, 
    form: 'Tablet',
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: (_weight, ageMonths) => {
      if (ageMonths >= 144) {
        return 'قرص واحد (0.125 مجم) تحت اللسان كل ٤ ساعات عند اللزوم. الحد الأقصى: ١٢ قرص/اليوم (1.5 مجم/يوم).';
      }

      if (ageMonths >= 24 && ageMonths < 144) {
        return 'نصف قرص (0.0625 مجم) إلى قرص واحد (0.125 مجم) كل ٤ ساعات عند اللزوم. الحد الأقصى: ٦ أقراص/اليوم.';
      }

      return 'غير موصى به أقل من سنتين إلا بتوجيه متخصص.';
    },
    warnings: [
      'الحمل: خطورة غير محددة (بيانات محدودة)؛ يُتجنب إلا للضرورة وبأمر الطبيب (دواء مضاد كولين).',
      'التداخلات: يزيد الجفاف/احتباس البول/زغللة النظر مع مضادات الحساسية المهدئة، TCAs، ومضادات الذهان. وقد يزيد الإمساك عند الجمع مع الأفيونات.',
      'تحذيرات: يُمنع في الجلوكوما ضيقة الزاوية، احتباس البول/تضخم البروستاتا، الانسداد/شلل الأمعاء، والوهن العضلي الوبيل.',
      'قد يسبب دوخة/تشوش رؤية؛ تجنب القيادة. انتبه لارتفاع الحرارة/قلة التعرق خصوصاً في الجو الحار.'
    ]
  },

  // 21. Dillengo 120 ml syrup
  {
    id: 'dillengo-120-syrup',
    name: 'Dillengo 120 ml syrup',
    genericName: 'Dill oil + Sodium bicarbonate',
    concentration: '2.3mg + 52.5mg / 5ml',
    price: 65, 
    matchKeywords: [
      'colic', 'gas', 'indigestion', 'baby', 'infant', 'natural', 'dill oil', 'dillengo', 'gripe water',
      'ديليينجو', 'مغص', 'غازات', 'زيت الشبت', 'هضم', 'رضع', 'انتفاخات', 'ماء غريب'
    ],
    usage: 'مستحضر داعم لتخفيف الغازات/عسر الهضم البسيط عند الرضع والأطفال. ليس علاجاً لمرض خطير.',
    timing: 'بعد الرضاعة/الأكل عند اللزوم.',
    category: Category.ANTISPASMODIC, 
    form: 'Syrup',
    minAgeMonths: 1, 
    maxAgeMonths: 144,
    minWeight: 4,
    maxWeight: 50,
    calculationRule: (_weight, ageMonths) => {
      if (ageMonths >= 12 && ageMonths <= 144) {
        return '٥ مل بعد الأكل عند اللزوم، حتى ٣ مرات يومياً.';
      }

      if (ageMonths >= 6 && ageMonths < 12) {
        return '٢.٥–٥ مل بعد الرضعة عند اللزوم، حتى ٣ مرات يومياً.';
      }

      if (ageMonths >= 1 && ageMonths < 6) {
        return '٢.٥ مل بعد الرضعة عند اللزوم، حتى ٣ مرات يومياً.';
      }

      return 'غير موصى به أقل من شهر إلا باستشارة طبيب أطفال.';
    },
    warnings: [
      'الحمل: غير مخصص للحامل/البالغين كدواء علاجي؛ أعد التقييم قبل استخدام أي مستحضر يحتوي بيكربونات.',
      'التداخلات: بيكربونات الصوديوم قد تغيّر حموضة المعدة وقد تؤثر على امتصاص بعض الأدوية الفموية عند أخذها في نفس الوقت؛ اترك فاصل ساعتين عن الأدوية الأخرى.',
      'تحذيرات: الحذر في مرضى الكلى/فشل القلب/الرضع الذين يحتاجون تقليل الصوديوم (عبء صوديوم).',
      'تحذيرات: توقف وأعد التقييم إذا كان هناك قيء مستمر، ضعف رضاعة، دم بالبراز، أو فشل زيادة وزن.'
    ]
  }
];

export const ANTISPASMODIC_MEDS: Medication[] = ANTISPASMODIC_MEDS_RAW.map(sanitizeMedication);
export default ANTISPASMODIC_MEDS;

