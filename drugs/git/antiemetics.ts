
import { Medication, Category } from '../../types';

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITY FUNCTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

const toAr = (n: number | string) => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
const roundVol = (vol: number): number => Math.round(vol * 10) / 10;
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const fixed = (text: string) => (_w: number, _a: number) => text;

/* ═══════════════════════════════════════════════════════════════════════════
   COMMON WARNINGS - تحذيرات ثابتة مشتركة
   ═══════════════════════════════════════════════════════════════════════════ */

const COMMON_ANTIEMETIC_WARNINGS = [
    'لا يغني عن تعويض السوائل بمحلول الجفاف (ORS).',
    'لا يُستخدم لدوار الحركة أو الغثيان البسيط.',
];

const ONDANSETRON_WARNINGS = [
    ...COMMON_ANTIEMETIC_WARNINGS,
    'تحذير QT: يُستخدم بحذر مع اضطراب نظم القلب أو أدوية تُطيل QT.',
    'يُمنع مع دواء Apomorphine.',
    'الحد الأقصى لمرضى القصور الكبدي الشديد: ٨ مجم/يوم.',
];

const DOMPERIDONE_WARNINGS = [
    'لا يُستخدم لأكثر من ٧ أيام متواصلة.',
    'يُمنع في انسداد أو نزيف الجهاز الهضمي.',
    'يُمنع في قصور الكبد المتوسط أو الشديد.',
    'تحذير QT: يُستخدم بحذر مع أمراض القلب أو أدوية تُطيل QT.',
];

const METOCLOPRAMIDE_WARNINGS = [
    'يُمنع لمن هم دون ١٨ سنة (خطر أعراض عصبية حركية).',
    'يُمنع مع الصرع أو انسداد/نزيف الأمعاء أو مرض باركنسون.',
    'لا يُستخدم أكثر من ٥ أيام متواصلة.',
    'قد يسبب أعراضاً عصبية حركية خاصة لدى الشباب وكبار السن.',
];

const GRANISETRON_WARNINGS = [
    ...COMMON_ANTIEMETIC_WARNINGS,
    'تحذير QT: يُستخدم بحذر مع اضطراب نظم القلب.',
    'تداخلات محتملة مع أدوية السيروتونين (متلازمة السيروتونين).',
    'دواء تخصصي للحالات الشديدة فقط (كيماوي/إشعاع/جراحات كبرى).',
];

const PREDNISOLONE_WARNINGS = [
    'لا يُوقف فجأة إذا استُخدم أكثر من أسبوع — يُسحب تدريجياً.',
    'يُستخدم بحذر في: السكري، قرحة المعدة، ارتفاع الضغط، عدوى نشطة.',
    'قد يرفع السكر والضغط ويسبب أرقاً أو زيادة شهية مؤقتاً.',
    'في الأطفال: قد يؤثر على النمو مع الاستخدام الطويل.',
    'تجنب مخالطة مرضى الجديري المائي/الحصبة أثناء العلاج.',
];

const PREGNANCY_NAUSEA_WARNINGS = [
    'يسبب النعاس — يُفضّل قبل النوم وتجنب القيادة.',
    'يُمنع مع مضادات الهيستامين الأخرى أو مثبطات MAO.',
    'يُستخدم بحذر مع الربو أو الجلوكوما أو احتباس البول.',
];

/* ═══════════════════════════════════════════════════════════════════════════
   DOSE CALCULATION HELPERS - دوال حساب الجرعات
   ═══════════════════════════════════════════════════════════════════════════ */

type InjectionRoute = 'IV' | 'IM' | 'IV/IM';

// ─────────────────────────────────────────────────────────────
// Ondansetron Injection Helper
// الجرعة: ٠٫١٥ مجم/كجم (حد أقصى ٨ مجم للجرعة الواحدة)
// ─────────────────────────────────────────────────────────────
const ondansetronInjectionDose = (
    weightKg: number,
    ageMonths: number,
    mgPerMl: number,
    ampMl: number,
    route: InjectionRoute = 'IV/IM'
): string => {
    // الأطفال أقل من ٦ شهور
    if (ageMonths < 6) {
        return 'غير مُعتمد للأطفال أقل من ٦ شهور.';
    }

    const mgPerKg = 0.15;
    const maxSingleDose = 8; // mg
    
    const doseMg = clamp(weightKg * mgPerKg, 0, maxSingleDose);
    const doseMl = roundVol(doseMg / mgPerMl);
    
    let doseText = `${toAr(doseMl)} مل (${toAr(Math.round(doseMg))} مجم)`;
    
    // تعليمات الإعطاء
    let adminText = '';
    if (route === 'IM' || route === 'IV/IM') {
        adminText = `\nطريقة الإعطاء: حقن عضلي عميق أو وريدي بطيء خلال ٢-٥ دقائق.`;
    } else {
        adminText = `\nطريقة الإعطاء: حقن وريدي بطيء خلال ٢-٥ دقائق.`;
    }
    
    // تنبيه إذا احتاج أكثر من أمبول
    const ampNeeded = doseMl / ampMl;
    let ampNote = '';
    if (ampNeeded > 1) {
        ampNote = `\nتنبيه: قد تحتاج أكثر من أمبول واحد للجرعة.`;
    }
    
    return `${doseText} — مرة واحدة عند اللزوم، يمكن تكرارها كل ٨ ساعات (حد أقصى ٣ جرعات/يوم).${adminText}${ampNote}`;
};

// ─────────────────────────────────────────────────────────────
// Domperidone Suspension Helper
// الجرعة: ٠٫٢٥ مجم/كجم/جرعة (٣ مرات يومياً)
// ─────────────────────────────────────────────────────────────
const domperidoneSuspDose = (weightKg: number, ageMonths: number, mgPerMl: number = 1): string => {
    const mgPerKgPerDose = 0.25;
    const maxDailyMgPerKg = 0.75;
    const maxDailyMg = 30;
    
    const doseMg = weightKg * mgPerKgPerDose;
    const doseMl = roundVol(doseMg / mgPerMl);
    const dailyMg = Math.min(weightKg * maxDailyMgPerKg, maxDailyMg);
    
    return `${toAr(doseMl)} مل (${toAr(roundVol(doseMg))} مجم) — ٣ مرات يومياً قبل الأكل بـ ١٥-٣٠ دقيقة.\nالحد الأقصى اليومي: ${toAr(Math.round(dailyMg))} مجم.`;
};

// ─────────────────────────────────────────────────────────────
// Granisetron Injection Helper
// الجرعة: ٤٠ ميكروجرام/كجم (حد أقصى ٣ مجم)
// ─────────────────────────────────────────────────────────────
const granisetronInjectionDose = (weightKg: number, ageMonths: number, mgPerMl: number = 1): string => {
    if (ageMonths < 24) {
        return 'غير مُعتمد للأطفال أقل من سنتين.';
    }
    
    const mcgPerKg = 40; // 40 mcg/kg = 0.04 mg/kg
    const maxDoseMg = 3;
    
    const doseMg = clamp(weightKg * 0.04, 0, maxDoseMg);
    const doseMl = roundVol(doseMg / mgPerMl);
    
    return `${toAr(doseMl)} مل (${toAr(roundVol(doseMg))} مجم) — جرعة واحدة قبل الكيماوي/العملية بـ ٣٠ دقيقة.\nطريقة الإعطاء: تُخفف في ٥٠-١٠٠ مل محلول ملح وتُعطى بالتنقيط الوريدي خلال ٥ دقائق.`;
};

// ─────────────────────────────────────────────────────────────
// Prednisolone Dose Helper
// الجرعة: ١-٢ مجم/كجم/يوم (قصيرة المدى)
// ─────────────────────────────────────────────────────────────
const prednisoloneDose = (weightKg: number, ageMonths: number, tabMg: number): string => {
    const isAdult = ageMonths >= 144 || weightKg >= 40;
    
    if (isAdult) {
        const minDose = 20;
        const maxDose = 40;
        const minTabs = Math.ceil(minDose / tabMg);
        const maxTabs = Math.ceil(maxDose / tabMg);
        if (minTabs === maxTabs) {
            return `${toAr(minTabs)} قرص (${toAr(minTabs * tabMg)} مجم) صباحاً — لمدة ٣-٥ أيام.`;
        }
        return `${toAr(minTabs)}-${toAr(maxTabs)} قرص (${toAr(minDose)}-${toAr(maxDose)} مجم) صباحاً — لمدة ٣-٥ أيام.`;
    }
    
    // الأطفال: ١-٢ مجم/كجم/يوم
    const minDose = weightKg * 1;
    const maxDose = weightKg * 2;
    const minTabs = roundVol(minDose / tabMg);
    const maxTabs = roundVol(maxDose / tabMg);
    
    return `${toAr(minTabs)}-${toAr(maxTabs)} قرص (${toAr(Math.round(minDose))}-${toAr(Math.round(maxDose))} مجم) صباحاً — لمدة ٣-٥ أيام.`;
};

/* ═══════════════════════════════════════════════════════════════════════════
   TEXT SANITIZERS - دوال تنظيف النصوص
   ═══════════════════════════════════════════════════════════════════════════ */

const normalizeSpaces = (s: string) =>
    s.replace(/\s+/g, ' ').replace(/\s+([،.])/g, '$1').trim();

const stripDoctorPhrases = (s: string) => {
    let t = s;
    t = t.replace(/تحت\s*إشراف\s*طبي/g, '');
    t = t.replace(/(?:إلا\s+)?بتوجيه\s+طبي/g, '');
    t = t.replace(/(?:إلا\s+)?بوصفة\s+طبيب/g, '');
    t = t.replace(/استشارة\s+طبيب[^.]*\./g, '.');
    t = t.replace(/حسب\s+(?:توجيه|تعليمات|إرشادات)\s+الطبيب/g, '');
    t = t.replace(/يُفضّل\s+تجنبه\s+إلا/g, 'يُتجنب إلا للضرورة.');
    t = t.replace(/بعد\s+استشارة/g, '');
    return normalizeSpaces(t);
};

const ANTIEMETIC_MEDS_RAW: Medication[] = [

// 1. Vomibreak 30
  {
    id: 'vomibreak-30-dr-tabs',
    name: 'Vomibreak 30mg Delayed Release F.C. Tablets',
    genericName: 'Doxylamine Succinate + Pyridoxine (Vit B6)',
    concentration: '20mg / 20mg', 
    price: 66, 
    matchKeywords: [
        'nausea', 'vomiting', 'pregnancy', 'morning sickness', 'doxylamine', 'pyridoxine', 'vomibreak',
        'فومي بريك', 'فوميبريك', 'ترجيع الحمل', 'غثيان الصباح', 'دوكسيلامين', 'فيتامين ب6', 'مضاد للقيء'
    ],
    usage: 'يستخدم لعلاج الغثيان والقيء المصاحبين للحمل عندما لا تكفي الإجراءات الغذائية.',
    timing: 'يؤخذ على معدة فارغة مع كوب ماء. الجرعة الأساسية تكون قبل النوم لتقليل الغثيان الصباحي.',
    category: Category.ANTIEMETIC, 
    form: 'Tablet',
    
    minAgeMonths: 216, 
    maxAgeMonths: 600,
    minWeight: 45,
    maxWeight: 150,
    
    calculationRule: fixed('قرص واحد قبل النوم.\nإذا استمرت الأعراض: يمكن إضافة قرص صباحاً + قرص مساءً.\nالحد الأقصى: ٣ أقراص/يوم.'),
    
    warnings: PREGNANCY_NAUSEA_WARNINGS
  },

// 2. Ondalenz 4mg
  {
    id: 'ondalenz-4mg-film',
    name: 'Ondalenz 4mg 5 Orodispersible Films',
    genericName: 'Ondansetron',
    concentration: '4mg',
    price: 160, 
    matchKeywords: [
        'vomiting', 'nausea', 'ondansetron', 'ondalenz', 'film', 'tongue film', 'gastroenteritis', 'chemo-induced nausea',
        'أوندالينز', 'اوندالينز', 'أوندانسيترون', 'قيء', 'ترجيع', 'نزلة معوية', 'فيلم على اللسان', 'لصقة ترجيع'
    ],
    usage: 'مضاد للقيء من فئة 5-HT3 لعلاج القيء الشديد بعد العمليات أو مع العلاج الكيماوي، ويُستخدم بحذر في النزلات المعوية.',
    timing: 'يوضع على اللسان قبل المحفز للقيء بـ ٣٠ دقيقة أو عند اللزوم حسب شدة الحالة.',
    category: Category.ANTIEMETIC, 
    form: 'Orodispersible Film',
    
    minAgeMonths: 6, 
    maxAgeMonths: 1200,
    minWeight: 8,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (weight >= 30) {
            return 'فيلم واحد (٤ مجم) حتى مرتين يومياً؛ الحد الأقصى ٨ مجم/يوم في القيء غير الكيماوي.';
        }
        if (weight >= 15) {
            return 'فيلم واحد (٤ مجم) مرة إلى مرتين يومياً حسب شدة القيء.';
        }
        if (weight >= 8) {
            return 'يُفضَّل استخدام تركيز/شكل مناسب للأطفال .';
        }
        return 'للأوزان أقل من ٨ كجم يجب تحديد الجرعة بدقة في المستشفى.';
    },
    
    warnings: [
        'قد يسبب صداعاً أو إمساكاً.',
        'تحذير إطالة QT؛ يُستخدم بحذر مع اضطراب نظم القلب أو الأدوية المُطيلة لـQT.',
        'يُمنع مع دواء Apomorphine (هبوط ضغط شديد).',
        'لا يغني عن تعويض السوائل بمحلول الجفاف.'
    ]
  },

// 3. Ondalenz 8mg
  {
    id: 'ondalenz-8mg-film',
    name: 'Ondalenz 8mg 5 Orodispersible Films',
    genericName: 'Ondansetron',
    concentration: '8mg',
    price: 256, 
    matchKeywords: [
        'severe vomiting', 'nausea', 'ondansetron', 'ondalenz 8', 'chemotherapy', 'post-operative nausea',
        'أوندالينز ٨', 'اوندالينز ٨', 'أوندانسيترون ٨', 'قيء شديد', 'ترجيع مستمر', 'علاج كيماوي', 'فيلم سريع الذوبان'
    ],
    usage: 'مضاد قوي للقيء للبالغين في القيء الشديد المرتبط بالكيماوي/الإشعاع أو بعد العمليات الكبرى.',
    timing: 'يوضع على اللسان قبل المحفز للقيء بـ ٣٠–٦٠ دقيقة.',
    category: Category.ANTIEMETIC, 
    form: 'Orodispersible Film',
    
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (weight >= 40) {
            return 'فيلم واحد (٨ مجم) مرة أو مرتين يومياً حسب شدة القيء والتشخيص.';
        }
        return 'للأوزان الأقل من ٤٠ كجم يُفضَّل تركيز ٤ مجم أو جرعات وزن-أساس.';
    },
    
    warnings: [
        'تحذير إطالة QT خاصة مع الجرعات العالية.',
        'الإمساك شائع مع الاستخدام المتكرر.',
        'الحد الأقصى لمرضى القصور الكبدي الشديد: ٨ مجم/يوم.',
        'لا يُستخدم للغثيان البسيط.'
    ]
  },

// 4. Motinorm Suspension
  {
    id: 'motinorm-5mg-susp-125ml',
    name: 'Motinorm 5mg/5ml Suspension 125ml',
    genericName: 'Domperidone',
    concentration: '1mg / 1ml',
    price: 31,
    matchKeywords: [
        'vomiting', 'nausea', 'motinorm', 'domperidone', 'gastric motility', 'bloating', 'reflux',
        'موتينورم', 'موتينورم شراب', 'دومبيريدون', 'قيء للأطفال', 'منظم حركة المعدة', 'ترجيع', 'انتفاخ'
    ],
    usage: 'منظم لحركة المعدة ومضاد للقيء للأطفال، وقد يفيد في الارتجاع.',
    timing: '٣ مرات يومياً قبل الأكل بـ١٥–٣٠ دقيقة – حتى ٧ أيام',
    category: Category.ANTIEMETIC,
    form: 'Suspension',

    minAgeMonths: 12,
    maxAgeMonths: 144,
    minWeight: 3,
    maxWeight: 40,
    
    calculationRule: (weight, ageMonths) => domperidoneSuspDose(weight, ageMonths, 1),
    
    warnings: DOMPERIDONE_WARNINGS
  },

// 5. Danset Ampoules
  {
    id: 'danset-4mg-amp',
    name: 'Danset 4mg/2ml 1 Ampoule',
    genericName: 'Ondansetron',
    concentration: '4mg / 2ml',
    price: 27.5, 
    matchKeywords: [
        'vomiting', 'nausea', 'ondansetron', 'danset', 'injection', 'ampoule', 'severe vomiting',
        'دانست', 'حقن دانست', 'حقنة ترجيع', 'اوندانسيترون', 'ترجيع شديد', 'نزلة معوية حادة'
    ],
    usage: 'مضاد قوي للقيء للحالات الطارئة (نزلات معوية شديدة تمنع تناول الدواء بالفم).',
    timing: 'عند اللزوم — جرعة إسعافية لوقف القيء المستمر.',
    category: Category.ANTIEMETIC, 
    form: 'Ampoule',
    
    minAgeMonths: 6, 
    maxAgeMonths: 1200,
    minWeight: 8,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => ondansetronInjectionDose(weight, ageMonths, 2, 2, 'IV/IM'),
    
    warnings: ONDANSETRON_WARNINGS
  },

  // ==========================================
// Section: Corticosteroids & Antiemetics (6-10)
// ==========================================

// 6. Epicopred 20mg
  {
    id: 'epicopred-20-odt',
    name: 'Epicopred 20mg 20 Orodispersible Tablets',
    genericName: 'Prednisolone', // [GREEN] Potent Glucocorticoid
    concentration: '20mg',
    price: 104, 
    matchKeywords: [
        'inflammation', 'asthma', 'allergy', 'prednisolone', 'epicopred', 'steroid', 'croup', 'odt',
        'إيبيكوبيريد', 'ايبكوبيريد', 'كورتيزون', 'بريدنيزولون', 'حساسية صدر', 'التهاب', 'تورم', 'أقراص تذوب في الفم'
    ],
    usage: 'مضاد قوي للالتهابات والحساسية. يستخدم في حالات أزمات الربو الحادة، الحساسية الشديدة، التورم، وبعض حالات الالتهابات المناعية، كما يوصف للأطفال في حالات "الكروپ" (التهاب الحنجرة).',
    timing: 'يفضل تناوله في الصباح (حوالي الساعة ٨ صباحاً) لمحاكاة إفراز الكورتيزون الطبيعي في الجسم، ويجب تناوله بعد الأكل مباشرة لتقليل تهيج المعدة.',
    category: Category.STEROIDS, 
    form: 'Orodispersible Tablet',
    
    minAgeMonths: 12, 
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => prednisoloneDose(weight, ageMonths, 20),
    
    warnings: PREDNISOLONE_WARNINGS
  },

// 7. Epicopred 5mg
  {
    id: 'epicopred-5-odt',
    name: 'Epicopred 5mg 30 Orodispersible Tablets',
    genericName: 'Prednisolone', // [GREEN] Standard Glucocorticoid
    concentration: '5mg',
    price: 69, 
    matchKeywords: [
        'inflammation', 'asthma', 'allergy', 'prednisolone', 'epicopred 5', 'steroid', 'croup', 'tapering',
        'إيبيكوبيريد ٥', 'ايبكوبيريد ٥', 'كورتيزون صغير', 'بريدنيزولون ٥', 'حساسية صدر', 'سحب الكورتيزون', 'أقراص تذوب في الفم'
    ],
    usage: 'مضاد للالتهاب والحساسية بتركيز منخفض يتيح دقة عالية في تحديد الجرعات للأطفال الصغار، أو يستخدم للبالغين عند الحاجة لتقليل الجرعة تدريجياً (Tapering) لتجنب الآثار الجانبية.',
    timing: 'يفضل تناوله في الصباح الباكر (الساعة ٨ صباحاً) مع وجبة الإفطار لتقليل التأثير على المعدة وعلى هرمونات الجسم الطبيعية.',
    category: Category.STEROIDS, 
    form: 'Orodispersible Tablet',
    
    minAgeMonths: 6, 
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => prednisoloneDose(weight, ageMonths, 5),
    
    warnings: PREDNISOLONE_WARNINGS
  },

// 8. Danset 4mg (3 Ampoules Pack)
  {
    id: 'danset-4mg-3amp',
    name: 'Danset 4mg/2ml 3 Ampoules',
    genericName: 'Ondansetron',
    concentration: '4mg / 2ml',
    price: 82.5, 
    matchKeywords: [
        'vomiting', 'nausea', 'ondansetron', 'danset', 'injection', 'ampoule', '3 amps',
        'دانست ٣ امبول', 'حقن دانست', 'اوندانسيترون', 'ترجيع', 'نزلة معوية', 'مضاد للقيء'
    ],
    usage: 'مضاد قوي للقيء للحالات الحادة والشديدة (نزلات معوية/بعد العمليات). العبوة تحتوي ٣ أمبولات.',
    timing: 'عند اللزوم — حقنة واحدة لوقف القيء المستمر.',
    category: Category.ANTIEMETIC, 
    form: 'Ampoule',
    
    minAgeMonths: 6, 
    maxAgeMonths: 1200,
    minWeight: 8,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => ondansetronInjectionDose(weight, ageMonths, 2, 2, 'IV/IM'),
    
    warnings: ONDANSETRON_WARNINGS
  },

// 9. Danset 8mg Ampoule
  {
    id: 'danset-8mg-amp',
    name: 'Danset 8mg/4ml 1 Ampoule',
    genericName: 'Ondansetron',
    concentration: '8mg / 4ml',
    price: 47.5, 
    matchKeywords: [
        'severe vomiting', 'nausea', 'ondansetron', 'danset 8', 'injection', 'ampoule', 'chemo nausea',
        'دانست ٨', 'حقن دانست ٨', 'حقنة ترجيع شديد', 'اوندانسيترون ٨', 'ترجيع العمليات', 'قيء شديد'
    ],
    usage: 'مضاد قوي للقيء بتركيز مضاعف (قيء شديد/كيماوي/عمليات كبرى).',
    timing: 'عند اللزوم — أو قبل الكيماوي/العملية بـ ٣٠ دقيقة.',
    category: Category.ANTIEMETIC, 
    form: 'Ampoule',
    
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (weight >= 40) {
            return ondansetronInjectionDose(weight, ageMonths, 2, 4, 'IV/IM');
        }
        if (weight >= 20) {
            return '٤ مجم (٢ مل) بالعضل أو الوريد البطئ.';
        }
        return 'للأوزان الأقل من ٢٠ كجم يُفضَّل تركيز ٤ مجم .';
    },
    
    warnings: [
        'الحد الأقصى لمرضى القصور الكبدي الشديد: ٨ مجم/يوم.',
        'تحذير QT: يُستخدم بحذر مع اضطراب النظم أو الأدوية المُطيلة لـQT.',
        'قد يسبب دواراً أو إمساكاً.',
        'يُحفظ بعيداً عن الضوء.'
    ]
  },

// 10. Danset 8mg (3 Ampoules Pack)
  {
    id: 'danset-8mg-3amp',
    name: 'Danset 8mg/4ml 3 Ampoules',
    genericName: 'Ondansetron',
    concentration: '8mg / 4ml',
    price: 142.5, 
    matchKeywords: [
        'severe vomiting', 'nausea', 'ondansetron', 'danset 8', 'injection', 'ampoule', '3 amps', 'chemo',
        'دانست ٨ مجم ٣ امبول', 'حقن دانست ٨', 'حقنة ترجيع شديد', 'اوندانسيترون ٨', 'ترجيع العمليات', 'مضاد للقيء'
    ],
    usage: 'العبوة تحتوي على ٣ أمبولات للحالات التي تحتاج جرعات متكررة مثل بروتوكولات العلاج الكيماوي، أو للسيطرة على القيء الشديد بعد العمليات الكبرى.',
    timing: 'تستخدم أمبولة واحدة عند اللزوم أو حسب الجدول الزمني المحدد من قبل طبيب الأورام أو الجراحة.',
    category: Category.ANTIEMETIC, 
    form: 'Ampoule',
    
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (weight >= 40) {
            return '٨ مجم (٤ مل) بالعضل أو الوريد البطئ؛ تكرر حسب التشخيص.';
        }
        if (weight >= 20) {
            return '٤ مجم (٢ مل) بالعضل أو الوريد البطئ.';
        }
        return 'للأوزان الأقل من ٢٠ كجم استخدم تركيز/شكل مناسب للأطفال.';
    },
    
    warnings: [
        'الحد الأقصى لمرضى القصور الكبدي الشديد: ٨ مجم/يوم.',
        'يُمنع مع Apomorphine.',
        'تحذير QT مع اضطراب النظم.',
        'قد يسبب إمساكاً مع تكرار الجرعات.',
        'تُحفظ بعيداً عن الضوء والحرارة.'
    ]
  },
// ==========================================
// Section: Antiemetics and Antivertigo (11-16)
// ==========================================

// 11. Motilium 10mg Tablets
  {
    id: 'motilium-10mg-tabs',
    name: 'Motilium 10mg 40 F.C. Tablets',
    genericName: 'Domperidone', // [GREEN] Peripheral Dopamine Antagonist
    concentration: '10mg',
    price: 100, 
    matchKeywords: [
        'nausea', 'vomiting', 'motilium', 'domperidone', 'gastric motility', 'bloating', 'reflux', 'dyspepsia',
        'موتيليوم', 'موتيليوم أقراص', 'دومبيريدون', 'قيء', 'منظم حركة المعدة', 'ترجيع', 'انتفاخ', 'عسر هضم'
    ],
    usage: 'منظم لحركة الأمعاء ومضاد للقيء. يستخدم لعلاج الغثيان والقيء، كما يساعد في تخفيف أعراض عدم الارتياح في المعدة، الشعور بالامتلاء، وارتجاع المريء.',
    timing: 'يجب تناوله قبل الأكل بـ ١٥ إلى ٣٠ دقيقة. إذا تم تناوله بعد الأكل، فقد يتأخر مفعوله قليلاً.',
    category: Category.ANTIEMETIC, 
    form: 'Tablet',
    
    minAgeMonths: 144, // 12 years and above
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (weight >= 35) {
            return '١٠ مجم قبل الأكل حتى ٣ مرات يومياً؛ الحد الأقصى ٣٠ مجم/يوم ولمدة قصيرة.';
        }
        return 'للأوزان الأقل يُستخدم الشراب بجرعة وزن-أساس.';
    },
    
    warnings: [
        'لا تتجاوز ٧ أيام دون مراجعة.',
        'يُمنع مع نزيف/انسداد الجهاز الهضمي.',
        'تحذير QT: يُتجنب مع اضطراب النظم أو أدوية تطيل QT.',
        'يُمنع في القصور الكبدي المتوسط/الشديد.',
        'تداخلات مهمة مع مضادات فطرية وماكروليدات قوية.'
    ]
  },

// 12. Navoproxin Plus Tablets
  {
    id: 'navoproxin-plus-tabs',
    name: 'Navoproxin Plus 20 F.C. Tablets',
    genericName: 'Doxylamine Succinate + Pyridoxine (Vit B6)',
    concentration: '10mg / 10mg', 
    price: 44, 
    matchKeywords: [
        'nausea', 'vomiting', 'pregnancy', 'morning sickness', 'vit b6', 'navoproxin plus', 'doxylamine',
        'نافوبروكسين بلس', 'نافوبروكسين', 'ترجيع الحمل', 'غثيان الحمل', 'فيتامين ب6', 'مضاد للقيء للحوامل'
    ],
    usage: 'يستخدم لعلاج الغثيان والقيء لدى النساء الحوامل (غثيان الصباح). يعمل كمضاد للهيستامين مهدئ مع فيتامين ب6 لتقليل الشعور بالدوار.',
    timing: 'الجرعة الأساسية تكون ليلاً (قبل النوم) على معدة فارغة لضمان مفعول الدواء في الصباح الباكر.',
    category: Category.ANTIEMETIC, 
    form: 'Tablet',
    
    minAgeMonths: 216, 
    maxAgeMonths: 600,
    minWeight: 45,
    maxWeight: 150,
    
    calculationRule: fixed('قرصان قبل النوم.\nإذا استمرت الأعراض: يمكن إضافة قرص صباحاً + قرص مساءً.\nالحد الأقصى: ٤ أقراص/يوم.'),
    
    warnings: PREGNANCY_NAUSEA_WARNINGS
  },

// 13. Emerest 4mg (5 Ampoules Pack)
  {
    id: 'emerest-4mg-5amp',
    name: 'Emerest 4mg/2ml 5 Ampoules',
    genericName: 'Ondansetron',
    concentration: '4mg / 2ml',
    price: 142.5, 
    matchKeywords: [
        'vomiting', 'nausea', 'ondansetron', 'emerest', 'injection', 'ampoule', '5 amps',
        'إيميرست', 'حقن إيميرست', 'حقنة ترجيع', 'اوندانسيترون', 'ترجيع شديد', 'نزلة معوية'
    ],
    usage: 'مضاد قوي للقيء للسيطرة على حالات القيء الشديدة المرتبطة بالنزلات المعوية، أو بعد العمليات الجراحية، أو كجزء من بروتوكول العلاج الكيماوي.',
    timing: 'تستخدم عند اللزوم كحل إسعافي لوقف القيء المستمر لتمكين المريض من شرب السوائل.',
    category: Category.ANTIEMETIC, 
    form: 'Ampoule',
    
    minAgeMonths: 6, 
    maxAgeMonths: 1200,
    minWeight: 8,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (weight >= 30) {
            return '٤ مجم (٢ مل) بالعضل أو الوريد البطئ.';
        }
        if (weight >= 15) {
            return '٢ مجم (١ مل) بالعضل أو الوريد البطئ.';
        }
        if (weight >= 8) {
            const doseVol = (weight * 0.15 / 2).toFixed(1);
            return `الجرعة ${doseVol} مل  —`;
        }
        return 'للأوزان أقل من ٨ كجم تُحسب الجرعة بدقة في المستشفى.';
    },
    
    warnings: [
        'تحذير QT مع اضطراب النظم.',
        'لا يغني عن علاج السبب وتعويض السوائل.',
        'قد يسبب صداعاً أو إمساكاً.',
        'يُمنع مع Apomorphine.',
        'يُحفظ بعيداً عن الضوء.'
    ]
  },

// 14. Emerest 4mg (2 Ampoules Pack)
  {
    id: 'emerest-4mg-2amp',
    name: 'Emerest 4mg/2ml 2 Ampoules',
    genericName: 'Ondansetron',
    concentration: '4mg / 2ml',
    price: 57, 
    matchKeywords: [
        'vomiting', 'nausea', 'ondansetron', 'emerest', 'injection', 'ampoule', '2 amps',
        'إيميرست ٢ امبول', 'حقن إيميرست', 'حقنة ترجيع', 'اوندانسيترون', 'ترجيع شديد'
    ],
    usage: 'عبوة طوارئ تحتوي على أمبولتين للسيطرة السريعة على حالات القيء الشديدة للأطفال والبالغين.',
    timing: 'تستخدم أمبولة واحدة عند اللزوم فور حدوث قيء شديد يمنع المريض من شرب السوائل.',
    category: Category.ANTIEMETIC, 
    form: 'Ampoule',
    
    minAgeMonths: 6, 
    maxAgeMonths: 1200,
    minWeight: 8,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (weight >= 30) {
            return '٤ مجم (٢ مل) بالعضل أو الوريد البطئ.';
        }
        if (weight >= 15) {
            return '٢ مجم (١ مل) بالعضل أو الوريد البطئ.';
        }
        return 'للأوزان الأصغر استخدم تركيز/شكل مناسب للأطفال.';
    },
    
    warnings: [
        'تحذير QT مع اضطراب النظم.',
        'لا يغني عن تعويض السوائل.',
        'لا يُخلط مع أدوية أخرى في نفس السرنجة.',
        'يُحفظ بعيداً عن الضوء والحرارة.'
    ]
  },

// 15. Meclizigo 25mg Films
  {
    id: 'meclizigo-25mg-film',
    name: 'Meclizigo 25mg 20 Orodispersible Films',
    genericName: 'Meclizine Hydrochloride', // [GREEN] H1-Antagonist for Vertigo
    concentration: '25mg',
    price: 90, 
    matchKeywords: [
        'vertigo', 'motion sickness', 'travel nausea', 'car sickness', 'dizziness', 'meclizine', 'meclizigo',
        'ميكليزجو', 'ميكليزين', 'دوار البحر', 'دوار السفر', 'دوخة', 'ترجيع السفر', 'غثيان الحركة'
    ],
    usage: 'يستخدم للوقاية وعلاج الغثيان والقيء والدوار المرتبط بدوار الحركة (السفر)، كما يستخدم في حالات اضطرابات التوازن والدوخة المرتبطة بالأذن الداخلية.',
    timing: 'للوقاية من دوار السفر، يجب تناول الفيلم قبل الرحلة بـ ٦٠ دقيقة لضمان المفعول. المفعول يدوم ٢٤ ساعة.',
    category: Category.ANTIEMETIC, 
    form: 'Orodispersible Film',
    
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        return 'فيلم واحد (٢٥ مجم) قبل السفر بساعة؛ يمكن تكرار جرعة واحدة بعد ٢٤ ساعة عند الحاجة.';
    },
    
    warnings: [
        'يسبب النعاس؛ تجنب القيادة.',
        'يُستخدم بحذر مع الجلوكوما أو تضخم البروستاتا.',
        'يُتجنب في أقل من ١٢ سنة إلا بجرعات معتمدة للعمر.',
        'تجنب المهدئات والكحول.',
        'قد يسبب جفاف الفم أو تشوش الرؤية.'
    ]
  },

// 16. Mornigag Tablets
  {
    id: 'mornigag-10-10-dr-tabs',
    name: 'Mornigag 10mg/10mg 30 Delayed Release Tablets',
    genericName: 'Doxylamine Succinate + Pyridoxine (Vit B6)',
    concentration: '10mg / 10mg', 
    price: 66, 
    matchKeywords: [
        'nausea', 'vomiting', 'pregnancy', 'morning sickness', 'mornigag', 'doxylamine', 'pyridoxine',
        'مورنيجاج', 'ترجيع الحمل', 'غثيان الصباح', 'دوكسيلامين', 'فيتامين ب6', 'مضاد للقيء للحوامل'
    ],
    usage: 'علاج حالات الغثيان والقيء المصاحبة للحمل. تركيبة آمنة تماماً للأم والجنين وتعمل ببطء لضمان مفعول ممتد.',
    timing: 'يؤخذ على معدة فارغة مع كوب ماء. الجرعة الأساسية تكون ليلاً (قبل النوم) للسيطرة على غثيان الصباح.',
    category: Category.ANTIEMETIC, 
    form: 'Delayed Release Tablet',
    
    minAgeMonths: 216, 
    maxAgeMonths: 600,
    minWeight: 45,
    maxWeight: 150,
    
    calculationRule: fixed('قرصان قبل النوم.\nإذا استمرت الأعراض: يمكن إضافة قرص صباحاً + قرص مساءً.\nالحد الأقصى: ٤ أقراص/يوم.'),
    
    warnings: PREGNANCY_NAUSEA_WARNINGS
    },
  // ==========================================
// Section: Antiemetics and Gastroprokinetics (17-20)
// ==========================================

// 17. Primperan 10mg Tablets
  {
    id: 'primperan-10mg-tabs',
    name: 'Primperan 10mg 10 Scored Tablets',
    genericName: 'Metoclopramide Hydrochloride', // [GREEN] Dopamine Antagonist / Prokinetic
    concentration: '10mg',
    price: 10.5, 
    matchKeywords: [
        'nausea', 'vomiting', 'primperan', 'metoclopramide', 'gastric emptying', 'prokinetic', 'hiccups',
        'بريمبيران', 'بريمبران', 'ميتوكلوبراميد', 'قيء', 'منظم حركة المعدة', 'ترجيع', 'زغطة', 'عسر هضم'
    ],
    usage: 'مضاد للقيء ومنظم لحركة الجهاز الهضمي العلوي. يساعد في تسريع تفريغ المعدة وتخفيف الغثيان المرتبط ببطء حركة الأمعاء، كما يستخدم لعلاج الزغطة المستمرة.',
    timing: 'يجب تناوله قبل الأكل بـ ٣٠ دقيقة للحصول على أقصى استفادة في تنظيم حركة المعدة.',
    category: Category.ANTIEMETIC, 
    form: 'Tablet',
    
    minAgeMonths: 216, // 18 years+ (Strict restrictions for younger ages due to EPS)
    maxAgeMonths: 1200,
    minWeight: 61, 
    maxWeight: 250,
    
    calculationRule: fixed('قرص واحد (١٠ مجم) — ٣ مرات يومياً قبل الأكل بـ ٣٠ دقيقة.\nالحد الأقصى: ٣٠ مجم/يوم ولمدة ٥ أيام فقط.'),
    
    warnings: METOCLOPRAMIDE_WARNINGS
  },

// 18. Zofran 8mg Ampoules (Original Brand)
  {
    id: 'zofran-8mg-8amp',
    name: 'Zofran 8mg/4ml 8 Ampoules for I.V./I.M. Injection',
    genericName: 'Ondansetron', // [GREEN] Reference Listed Drug
    concentration: '8mg / 4ml',
    price: 416, 
    matchKeywords: [
        'severe vomiting', 'nausea', 'ondansetron', 'zofran', 'gsk', 'chemotherapy', 'post-operative', 'injection',
        'زوفران', 'زوفران حقن', 'اوندانسيترون', 'ترجيع الكيماوي', 'قيء العمليات', 'حقن ترجيع مستورد'
    ],
    usage: 'المعيار الذهبي عالمياً للوقاية وعلاج القيء الشديد الناتج عن العلاج الكيماوي أو الإشعاعي، وللوقاية من القيء بعد العمليات الجراحية الكبرى.',
    timing: 'في حالات الكيماوي: تُعطى الجرعة قبل بدء الجلسة بـ ٣٠ دقيقة. في حالات العمليات: تُعطى عند بدء التخدير.',
    category: Category.ANTIEMETIC, 
    form: 'Ampoule',
    
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (weight >= 40) {
            return '٨ مجم بالوريد البطئ أو العضل؛ تكرر حسب التشخيص (حد أقصى ١٦ مجم/يوم للبالغين).';
        }
        const doseMg = (weight * 0.15).toFixed(1);
        return `الجرعة للأطفال: ${doseMg} مجم  بالوريد البطئ —`;
    },
    
    warnings: [
        'الحد الأقصى لمرضى القصور الكبدي الشديد: ٨ مجم/يوم.',
        'تحذير QT: يُفضل مراقبة ECG مع الجرعات العالية.',
        'لا يُخلط مع أدوية قلوية في نفس المحلول.',
        'يُحفظ بعيداً عن الضوء.'
    ]
  },

// 19. Ondametic 8mg Ampoules
  {
    id: 'ondametic-8mg-5amp',
    name: 'Ondametic 8mg/4ml 5 Ampoules',
    genericName: 'Ondansetron',
    concentration: '8mg / 4ml',
    price: 265, 
    matchKeywords: [
        'severe vomiting', 'nausea', 'ondansetron', 'ondametic', '8mg', 'chemotherapy', 'post-operative',
        'أوندامتيك', 'اوندامتيك', 'حقن أوندامتيك', 'ترجيع شديد', 'قيء مستمر', 'حقن اوندانسيترون ٨'
    ],
    usage: 'مضاد قوي للقيء بتركيز عالٍ، يستخدم للسيطرة على حالات القيء الشديد التي لا تستجيب للعلاجات العادية، خاصة بعد العمليات الجراحية أو العلاج الكيماوي.',
    timing: 'تُعطى الجرعة عند اللزوم أو حسب الجدول الزمني للمريض، ويفضل قبل الوجبات أو الجلسات العلاجية.',
    category: Category.ANTIEMETIC, 
    form: 'Ampoule',
    
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (weight >= 40) {
            return '٨ مجم بالعضل أو الوريد البطئ؛ الحد الأقصى ١٦ مجم/يوم.';
        }
        if (weight >= 20) {
            return '٤ مجم (٢ مل) بالعضل أو الوريد البطئ.';
        }
        return 'للأوزان الأصغر استخدم تركيز/شكل مناسب للأطفال.';
    },
    
    warnings: [
        'الحد الأقصى لمرضى القصور الكبدي الشديد: ٨ مجم/يوم.',
        'تحذير QT مع اضطراب النظم.',
        'قد يسبب صداعاً أو إمساكاً.',
        'لا يُخلط مع أدوية أخرى في نفس السرنجة.',
        'يُحفظ بعيداً عن الضوء.'
    ]
  },

// 20. Granitryl 2mg Tablets
  {
    id: 'granitryl-2mg-tabs',
    name: 'Granitryl 2mg 5 F.C. Tablets',
    genericName: 'Granisetron', // [GREEN] Long-acting 5-HT3 Antagonist
    concentration: '2mg',
    price: 300, 
    matchKeywords: [
        'chemotherapy', 'radiotherapy', 'severe vomiting', 'granisetron', 'granitryl', 'oncology',
        'جرانيتريل', 'جرانيتريل ٢', 'جرانيسترون', 'ترجيع الكيماوي', 'ترجيع الإشعاع', 'قيء شديد'
    ],
    usage: 'مضاد قوي جداً للقيء من الجيل المتطور. يستخدم للوقاية وعلاج القيء الشديد الناتج عن العلاج الكيماوي أو الإشعاعي، وللحالات المستعصية بعد العمليات.',
    timing: 'يؤخذ قبل بدء جلسة العلاج الكيماوي بـ ٦٠ دقيقة على الأقل حسب تعليمات طبيب الأورام.',
    category: Category.ANTIEMETIC, 
    form: 'Tablet',
    
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: fixed('قرص واحد (٢ مجم) مرة واحدة يومياً — قبل الكيماوي/الإشعاع بساعة.'),
    
    warnings: GRANISETRON_WARNINGS
  },

  // ==========================================
// Section: Advanced Antiemetics (21-25)
// ==========================================

// 21. Zofran 8mg Tablets (The Original Brand)
  {
    id: 'zofran-8mg-tabs',
    name: 'Zofran 8mg 10 Tablets',
    genericName: 'Ondansetron', // [GREEN] Reference Listed Drug (RLD)
    concentration: '8mg',
    price: 364, 
    matchKeywords: [
        'severe vomiting', 'nausea', 'ondansetron', 'zofran', 'gsk', 'chemotherapy', 'post-operative', 'oncology',
        'زوفران', 'زوفران أقراص', 'اوندانسيترون', 'ترجيع الكيماوي', 'قيء شديد', 'زوفران ٨', 'أقراص ترجيع مستورد'
    ],
    usage: 'أقراص مضادة للقيء عالية القوة. تستخدم للوقاية من القيء المرتبط بالعلاجات الكيماوية والإشعاعية، وللسيطرة على القيء الشديد بعد العمليات الجراحية.',
    timing: 'يؤخذ القرص قبل بدء المحفز للقيء (كالكيماوي) بـ ٣٠ إلى ٦٠ دقيقة، أو حسب الجدول الزمني للمريض.',
    category: Category.ANTIEMETIC, 
    form: 'Tablet',
    
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (weight >= 40) {
            return '٨ مجم مرة إلى مرتين يومياً حسب شدة القيء وبروتوكول الطبيب.';
        }
        return 'للأوزان الأقل يُفضَّل تركيز ٤ مجم أو جرعات وزن-أساس.';
    },
    
    warnings: [
        'الحد الأقصى لمرضى القصور الكبدي الشديد: ٨ مجم/يوم.',
        'تحذير QT مع اضطراب النظم أو أدوية تطيل QT.',
        'قد يسبب صداعاً أو إمساكاً.',
        'لا يُستخدم لدوار الحركة أو الغثيان البسيط.'
    ]
  },

// 22. Zofran 8mg (5 Ampoules Pack)
  {
    id: 'zofran-8mg-5amp',
    name: 'Zofran 8mg/4ml 5 Ampoules for I.V./I.M. Injection',
    genericName: 'Ondansetron',
    concentration: '8mg / 4ml',
    price: 260, 
    matchKeywords: [
        'severe vomiting', 'nausea', 'ondansetron', 'zofran', 'gsk', 'chemotherapy', 'post-operative', 'injection',
        'زوفران ٥ امبول', 'حقن زوفران ٨', 'اوندانسيترون حقن', 'ترجيع الكيماوي', 'قيء العمليات'
    ],
    usage: 'حقن أصلية (براند) للسيطرة السريعة على القيء الشديد. مثالية للاستخدام في المستشفيات ومراكز الأورام لضمان الفعالية القصوى.',
    timing: 'تُعطى الحقنة عند اللزوم أو قبل بدء جلسات العلاج بـ ٣٠ دقيقة.',
    category: Category.ANTIEMETIC, 
    form: 'Ampoule',
    
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (weight >= 40) {
            return '٨ مجم بالعضل أو الوريد البطئ؛ تكرر حسب التشخيص.';
        }
        return 'للأوزان الأصغر استخدم تركيز/شكل مناسب للأطفال.';
    },
    
    warnings: [
        'الحد الأقصى لمرضى القصور الكبدي الشديد: ٨ مجم/يوم.',
        'تحذير QT مع اضطراب النظم.',
        'لا يُخلط مع أدوية قلوية في نفس السرنجة.',
        'يُحفظ بعيداً عن الضوء والحرارة.'
    ]
  },

// 23. Ondametic 4mg/2ml 5 ampoules
  {
    id: 'ondametic-4mg-5amp',
    name: 'Ondametic 4mg/2ml 5 Ampoules',
    genericName: 'Ondansetron',
    concentration: '4mg / 2ml',
    price: 142.5, 
    matchKeywords: [
        'vomiting', 'nausea', 'ondansetron', 'ondametic', 'injection', 'ampoule', '5 amps',
        'أوندامتيك', 'حقن أوندامتيك', 'حقنة ترجيع', 'اوندانسيترون ٤', 'نزلة معوية'
    ],
    usage: 'مضاد للقيء يستخدم في حالات القيء المتوسطة والشديدة، خاصة في النزلات المعوية الحادة للأطفال والبالغين، أو بعد الجراحات الصغرى.',
    timing: 'تستخدم كجرعة إسعافية لوقف القيء لتمكين المريض من البدء في شرب السوائل ومحلول الجفاف.',
    category: Category.ANTIEMETIC, 
    form: 'Ampoule',
    
    minAgeMonths: 6, 
    maxAgeMonths: 1200,
    minWeight: 8,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (weight >= 30) {
            return '٤ مجم (٢ مل) بالعضل أو الوريد البطئ.';
        }
        if (weight >= 15) {
            return '٢ مجم (١ مل) بالعضل أو الوريد البطئ.';
        }
        const doseVol = (weight * 0.15 / 2).toFixed(1);
        return `الجرعة ${doseVol} مل  —`;
    },
    
    warnings: [
        'قد يسبب صداعاً أو إمساكاً.',
        'تحذير QT مع اضطراب النظم.',
        'لا يُخلط مع أدوية أخرى في نفس السرنجة.',
        'يُحفظ أقل من ٣٠°م بعيداً عن الضوء.'
    ]
  },

// 24. Setronomet 8 mg 10 oral dis. tabs.
  {
    id: 'setronomet-8mg-odt',
    name: 'Setronomet 8mg 10 Oral Dispersible Tablets',
    genericName: 'Ondansetron', // [GREEN] Advanced ODT Technology
    concentration: '8mg',
    price: 317, 
    matchKeywords: [
        'severe vomiting', 'nausea', 'ondansetron', 'setronomet', 'odt', 'oral disintegrating',
        'سترونوميت', 'سترونوميت ٨', 'أقراص تذوب في الفم', 'قيء شديد', 'ترجيع الكيماوي'
    ],
    usage: 'أقراص متطورة تذوب في الفم دون الحاجة للماء. مثالية للمرضى الذين يعانون من غثيان شديد يمنعهم من بلع الأقراص العادية.',
    timing: 'يوضع القرص على اللسان قبل الأكل أو قبل جلسة العلاج بـ ٣٠ إلى ٦٠ دقيقة.',
    category: Category.ANTIEMETIC, 
    form: 'Oral Dispersible Tablet',
    
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        return '٨ مجم مرة إلى مرتين يومياً حسب شدة القيء والتشخيص.';
    },
    
    warnings: [
        'الحد الأقصى لمرضى القصور الكبدي الشديد: ٨ مجم/يوم.',
        'تحذير QT مع اضطراب النظم.',
        'يُمنع مع Apomorphine.',
        'يُحفظ بعيداً عن الرطوبة.'
    ]
  },

// 25. Cortiplex b6 adult 3 amp.
  {
    id: 'cortiplex-b6-adult-3amp',
    name: 'Cortiplex B6 Adult 3 Ampoules',
    genericName: 'Dexamethasone + Pyridoxine (Vit B6)',
    concentration: 'Dexamethasone 4mg + Pyridoxine 100mg', 
    price: 48, 
    matchKeywords: [
        'vomiting', 'nausea', 'cortiplex', 'b6', 'dexamethasone', 'pregnancy vomiting',
        'كورتيبلكس', 'كورتيبلكس ب٦ كبار', 'حقنة ترجيع', 'كورتيزون مع ب٦', 'ترجيع الحمل الشديد'
    ],
    usage: 'تركيبة كورتيكوستيرويد مع فيتامين ب6 قد تُستخدم كعلاج مساعد في القيء الشديد —',
    timing: 'تُعطى حقنة واحدة يومياً في العضل للحالات الشديدة.',
    category: Category.ANTIEMETIC, 
    form: 'Ampoule',
    
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        return 'حقنة واحدة كاملة يومياً في العضل العميق. مخصصة للكبار فقط.';
    },
    
    warnings: [
        'يُستخدم بحذر في السكري وارتفاع الضغط.',
        'في الحمل: للضرورة القصوى و—',
        'يُمنع مع عدوى فطرية نشطة.',
        'لا يُستخدم لفترات طويلة دون متابعة.'
    ]
  },

  // ==========================================
// Section: Comprehensive Antiemetics (26-30)
// ==========================================

// 26. Emerest 8mg (3 Ampoules Pack)
  {
    id: 'emerest-8mg-3amp',
    name: 'Emerest 8mg/4ml 3 Ampoules',
    genericName: 'Ondansetron', // [GREEN] Potent 5-HT3 Antagonist
    concentration: '8mg / 4ml',
    price: 159, 
    matchKeywords: [
        'severe vomiting', 'nausea', 'ondansetron', 'emerest 8', 'injection', 'ampoule', '3 amps',
        'إيميرست ٨', 'ايميرست ٨', 'حقن إيميرست ٨', 'حقنة ترجيع شديد', 'اوندانسيترون ٨', 'ترجيع الكيماوي'
    ],
    usage: 'مضاد قوي جداً للقيء بتركيز مضاعف للسيطرة على حالات القيء الشديد والمستمر الناتج عن النزلات المعوية الحادة، العمليات الجراحية، أو جلسات الكيماوي.',
    timing: 'تؤخذ الحقنة عند اللزوم أو قبل بدء مسببات القيء بـ ٣٠ دقيقة.',
    category: Category.ANTIEMETIC, 
    form: 'Ampoule',
    
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (weight >= 40) {
            return '٨ مجم بالعضل أو الوريد البطئ حسب التشخيص.';
        }
        if (weight >= 20) {
            return '٤ مجم (٢ مل) بالعضل أو الوريد البطئ.';
        }
        return 'للأوزان الأصغر استخدم تركيز/شكل مناسب للأطفال.';
    },
    
    warnings: [
        'الحد الأقصى لمرضى القصور الكبدي الشديد: ٨ مجم/يوم.',
        'تحذير QT مع اضطراب النظم.',
        'قد يسبب صداعاً أو إمساكاً.',
        'يُحفظ بعيداً عن الضوء والحرارة.'
    ]
  },

// 27. Granitryl 3mg/3ml 6 amps. i.v.
  {
    id: 'granitryl-3mg-6amp',
    name: 'Granitryl 3mg/3ml 6 Ampoules for I.V. Injection',
    genericName: 'Granisetron', // [GREEN] Second-generation 5-HT3 Antagonist
    concentration: '3mg / 3ml',
    price: 1020, 
    matchKeywords: [
        'chemotherapy', 'radiotherapy', 'severe vomiting', 'granisetron', 'granitryl', 'oncology', 'iv injection',
        'جرانيتريل', 'حقن جرانيتريل', 'جرانيتريل ٣ مجم', 'ترجيع الكيماوي الشديد', 'قيء العمليات الكبرى'
    ],
    usage: 'مضاد قيء تخصصي طويل المفعول. يستخدم للوقاية من القيء الشديد المصاحب للعلاج الكيماوي والإشعاعي المكثف وللجراحات الكبرى. مفعوله يمتد لـ ٢٤ ساعة.',
    timing: 'تُعطى الحقنة وريدياً قبل بدء جلسة الكيماوي أو العمليات بـ ٣٠ دقيقة.',
    category: Category.ANTIEMETIC, 
    form: 'Ampoule',
    
    minAgeMonths: 24, 
    maxAgeMonths: 1200,
    minWeight: 12,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => granisetronInjectionDose(weight, ageMonths, 1),
    
    warnings: GRANISETRON_WARNINGS
  },

// 28. Setronomet 8 mg 4 oral dis. tabs. (As per user correction for Ampoules price)
  {
    id: 'setronomet-8mg-4amp',
    name: 'Setronomet 8mg/4ml 4 Ampoules for I.V./I.M. Injection',
    genericName: 'Ondansetron',
    concentration: '8mg / 4ml',
    price: 1030, 
    matchKeywords: [
        'severe vomiting', 'nausea', 'ondansetron', 'setronomet injection', '8mg', 'oncology',
        'سترونوميت حقن', 'سترونوميت ٨', 'حقن ترجيع شديد', 'ترجيع الكيماوي', 'قيء العمليات'
    ],
    usage: 'حقن مضادة للقيء شديدة القوة والفاعلية. تُستخدم للسيطرة الفورية على نوبات القيء المستعصية الناتجة عن الكيماوي أو العمليات الكبرى.',
    timing: 'تُعطى الحقنة قبل بدء المحفز للقيء بـ ٣٠ دقيقة أو في الحالات الطارئة.',
    category: Category.ANTIEMETIC, 
    form: 'Ampoule',
    
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        return '٨ مجم بالعضل أو الوريد البطئ حسب التشخيص (عادة مرة إلى مرتين يومياً).';
    },
    
    warnings: [
        'الحد الأقصى لمرضى القصور الكبدي الشديد: ٨ مجم/يوم.',
        'تحذير QT مع اضطراب النظم.',
        'لا يغني عن تعويض السوائل.',
        'يُحفظ بعيداً عن الضوء والحرارة.'
    ]
  },

// 29. Methabiogen 8mg Tablets
  {
    id: 'methabiogen-8mg-tabs',
    name: 'Methabiogen 8mg 30 Scored Tablets',
    genericName: 'Ondansetron',
    concentration: '8mg',
    price: 93, 
    matchKeywords: [
        'vomiting', 'nausea', 'ondansetron', 'methabiogen', 'chemo', 'post-operative',
        'ميثابيوجين', 'اوندانسيترون ٨', 'أقراص ترجيع اقتصادية', 'قيء شديد', 'ترجيع الكيماوي'
    ],
    usage: 'بديل محلي اقتصادي وفعال جداً لمضادات القيء القوية. يستخدم للوقاية من القيء الناتج عن الكيماوي أو العمليات الجراحية والنزلات المعوية للبالغين.',
    timing: 'يؤخذ القرص قبل الأكل أو قبل جلسة العلاج بـ ٣٠-٦٠ دقيقة.',
    category: Category.ANTIEMETIC, 
    form: 'Tablet',
    
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        return '٨ مجم مرة إلى مرتين يومياً حسب شدة القيء؛ يمكن استخدام نصف قرص (٤ مجم) إذا لزم.';
    },
    
    warnings: [
        'الحد الأقصى لمرضى القصور الكبدي الشديد: ٨ مجم/يوم.',
        'تحذير QT مع اضطراب النظم.',
        'قد يسبب صداعاً أو إمساكاً.',
        'يُمنع مع Apomorphine.'
    ]
  },

// 30. Gastromotil 1mg/ml oral susp. 200ml
  {
    id: 'gastromotil-1mg-susp',
    name: 'Gastromotil 1mg/ml Oral Suspension 200ml',
    genericName: 'Domperidone', // [GREEN] Standard for Pediatric Reflux/Vomiting
    concentration: '1mg / 1ml',
    price: 24, 
    matchKeywords: [
        'vomiting', 'nausea', 'gastromotil', 'domperidone', 'gastric motility', 'reflux', 'spitting up',
        'جاستروموتيل', 'جاستروموتيل شراب', 'ترجيع أطفال', 'منظم حركة المعدة', 'ارتجاع الرضع'
    ],
    usage: 'منظم لحركة المعدة ومضاد للقيء للأطفال. يعالج القيء، الغثيان، وارتجاع المريء (القشط المتكرر).',
    timing: '٣ مرات يومياً قبل الأكل بـ١٥–٣٠ دقيقة – حتى ٧ أيام',
    category: Category.ANTIEMETIC,
    form: 'Oral Suspension',

    minAgeMonths: 12,
    maxAgeMonths: 144,
    minWeight: 3,
    maxWeight: 40,
    
    calculationRule: (weight, ageMonths) => domperidoneSuspDose(weight, ageMonths, 1),
    
    warnings: DOMPERIDONE_WARNINGS
  },

  // ==========================================
// Section: Pro Antiemetics & ODT Corticosteroids (31-33)
// ==========================================

// 31. Zofran 4mg/2ml 5 Ampoules (The Original Brand)
  {
    id: 'zofran-4mg-5amp',
    name: 'Zofran 4mg/2ml 5 Ampoules for I.V./I.M. Injection',
    genericName: 'Ondansetron', // [GREEN] Reference Listed Drug (RLD)
    concentration: '4mg / 2ml',
    price: 137.55, 
    matchKeywords: [
        'vomiting', 'nausea', 'ondansetron', 'zofran', 'gsk', 'injection', 'ampoule', '5 amps',
        'زوفران حقن ٤', 'زوفران امبول', 'اوندانسيترون', 'ترجيع شديد', 'نزلة معوية', 'حقن ترجيع مستورد'
    ],
    usage: 'البراند الأصلي العالمي للسيطرة على القيء. يستخدم في حالات القيء الشديد الناتج عن النزلات المعوية، العمليات الجراحية، أو العلاج الكيماوي. يتميز بأعلى درجات النقاء والفعالية السريعة.',
    timing: 'تُعطى عند اللزوم لوقف القيء المستمر، أو قبل بدء مسببات القيء بـ ٣٠ دقيقة.',
    category: Category.ANTIEMETIC, 
    form: 'Ampoule',
    
    minAgeMonths: 6, 
    maxAgeMonths: 1200,
    minWeight: 8,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => ondansetronInjectionDose(weight, ageMonths, 2, 2, 'IV/IM'),
    
    warnings: ONDANSETRON_WARNINGS
  },

// 32. Zofran 4mg/2ml 10 Ampoules (Economy Pack)
  {
    id: 'zofran-4mg-10amp',
    name: 'Zofran 4mg/2ml 10 Ampoules for I.V./I.M. Injection',
    genericName: 'Ondansetron',
    concentration: '4mg / 2ml',
    price: 275, 
    matchKeywords: [
        'vomiting', 'nausea', 'ondansetron', 'zofran', 'gsk', 'injection', 'ampoule', '10 amps',
        'زوفران ١٠ امبول', 'زوفران حقن ٤', 'اوندانسيترون حقن', 'حقن ترجيع مستورد'
    ],
    usage: 'العبوة الاقتصادية من البراند الأصلي (١٠ أمبولات). مثالية للحالات التي تتطلب جرعات متكررة أو للمراكز الطبية لضمان استقرار حالة المريض ومنع القيء.',
    timing: 'تُعطى الجرعة عند اللزوم أو حسب الجدول الزمني (كل ٨ أو ١٢ ساعة) لضمان منع نوبات القيء.',
    category: Category.ANTIEMETIC, 
    form: 'Ampoule',
    
    minAgeMonths: 6, 
    maxAgeMonths: 1200,
    minWeight: 8,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => ondansetronInjectionDose(weight, ageMonths, 2, 2, 'IV/IM'),
    
    warnings: ONDANSETRON_WARNINGS
  },

// 33. Disprelone-OD 5mg 30 Orodispersible Tablets
  {
    id: 'disprelone-od-5mg-tabs',
    name: 'Disprelone-OD 5mg 30 Orodispersible Tablets',
    genericName: 'Prednisolone', // [GREEN] Corticosteroid
    concentration: '5mg',
    price: 84, 
    matchKeywords: [
        'allergy', 'inflammation', 'asthma', 'prednisolone', 'disprelone', 'odt', 'corticosteroid',
        'ديسبريلون', 'ديسبريلون أوديت', 'بريدنيزولون', 'حساسية الصدر', 'التهابات', 'أقراص تذوب في الفم', 'كورتيزون'
    ],
    usage: 'مضاد قوي للالتهابات والحساسية بتقنية التحلل الفموي. يستخدم لحالات الربو الشعبي، حساسية الجلد الشديدة، والتهابات المفاصل. يذوب فوراً على اللسان مما يجعله مثالياً للأطفال.',
    timing: 'يفضل تناوله في الصباح الباكر (حوالي الساعة ٨ صباحاً) ويفضل بعد الأكل.',
    category: Category.ORAL_CORTICOSTEROIDS, 
    form: 'Oral Dispersible Tablet',
    
    minAgeMonths: 24, 
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        return 'الجرعة تُحدد حسب الحالة: جرعة قصيرة المدى حسب الحالة.';
    },
    
    warnings: PREDNISOLONE_WARNINGS
  },
];

/* ─────────────────────────────────────────────────────────────
   Apply Sanitization to All Medications
   ───────────────────────────────────────────────────────────── */

const sanitizeMedication = (m: Medication): Medication => ({
    ...m,
    timing: stripDoctorPhrases(m.timing),
    warnings: m.warnings.map(w => stripDoctorPhrases(w)).filter(w => w.length > 0),
    calculationRule: (w, a) => stripDoctorPhrases(m.calculationRule(w, a)),
});

export const ANTIEMETIC_MEDS: Medication[] = ANTIEMETIC_MEDS_RAW.map(sanitizeMedication);

