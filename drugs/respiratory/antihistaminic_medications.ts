import { Medication, Category } from '../../types';

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITY FUNCTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

const fixed = (text: string) => (_w: number, _a: number) => text;

/* ═══════════════════════════════════════════════════════════════════════════
   COMMON WARNINGS - تحذيرات ثابتة مشتركة
   ═══════════════════════════════════════════════════════════════════════════ */

/** تحذيرات السيتريزين (الجيل الثاني) */
const CETIRIZINE_WARNINGS = [
    'قد يسبب نعاساً — تجنب القيادة/الآلات حتى تتأكد من تأثيره.',
    'لا تتجاوز الجرعة الموصى بها.',
    'تجنب الكحول والمهدئات.',
    'حذر مع مرضى الكلى/الكبد.'
];

/** تحذيرات الليفوسيتريزين (الجيل الثالث) */
const LEVOCETIRIZINE_WARNINGS = [
    'قد يسبب نعاساً — تجنب القيادة/الآلات.',
    'ممنوع للأطفال ٦ شهور-١١ سنة مع قصور كلوي.',
    'تجنب الكحول والمهدئات.',
    'قد يلزم تعديل الجرعة في القصور الكلوي.'
];

/** تحذيرات الفيكسوفينادين (الجيل الثالث - لا يسبب نعاس) */
const FEXOFENADINE_WARNINGS = [
    'لا تتناوله مع عصائر الفاكهة (تفاح/برتقال/جريب فروت).',
    'لا تتناوله مع مضادات الحموضة (ألومنيوم/ماغنسيوم).',
    'حذر مع مرضى الكلى — قد تحتاج جرعة مختلفة.',
    'لا تتجاوز الجرعة الموصى بها.'
];

/** تحذيرات اللوراتادين (الجيل الثاني - قليل النعاس) */
const LORATADINE_WARNINGS = [
    'نادراً ما يسبب نعاساً — لكن راقب تأثيره عليك.',
    'حذر مع مرضى الكبد الشديد.',
    'لا تتجاوز الجرعة الموصى بها.',
    'تجنب الكحول.'
];

/** تحذيرات الديسلوراتادين (الجيل الثالث) */
const DESLORATADINE_WARNINGS = [
    'نادراً ما يسبب نعاساً.',
    'حذر مع مرضى الكلى/الكبد الشديد.',
    'لا تتجاوز الجرعة الموصى بها.',
    'الحمل/الرضاعة: حسب الضرورة فقط.'
];

/** تحذيرات مضادات الهيستامين المُنعِسة (الجيل الأول) */
const SEDATING_ANTIHISTAMINE_WARNINGS = [
    'يسبب نعاساً شديداً — تجنب القيادة/الآلات.',
    'تجنب الكحول والمهدئات.',
    'حذر مع: الجلوكوما، تضخم البروستاتا، احتباس البول.',
    'لا يُستخدم لكبار السن إلا للضرورة.'
];

/** تحذيرات الكلورفينيرامين */
const CHLORPHENIRAMINE_WARNINGS = [
    'يسبب نعاساً — تجنب القيادة/الآلات.',
    'ممنوع لحديثي الولادة والخدج.',
    'حذر مع: الربو، الجلوكوما، تضخم البروستاتا.',
    'لا يُستخدم مع مثبطات MAO.'
];

/* ═══════════════════════════════════════════════════════════════════════════
   DOSE CALCULATION HELPERS - دوال حساب الجرعات
   ═══════════════════════════════════════════════════════════════════════════ */

const cetirizineTabDose = (_weight: number, ageMonths: number): string => {
    if (ageMonths >= 144) {
        return 'قرص واحد (١٠ مجم) فموياً مرة يومياً مساءً – بدون اعتبار للأكل – لمدة ٥–٧ أيام (أو حسب الحاجة)';
    }
    if (ageMonths >= 72) {
        return 'نصف–قرص واحد (٥–١٠ مجم) فموياً مرة يومياً مساءً – بدون اعتبار للأكل – لمدة ٥–٧ أيام';
    }
    return 'للأطفال < ٦ سنوات: استخدم الشراب';
};

const cetirizineSyrupDose = (_weight: number, ageMonths: number): string => {
    if (ageMonths >= 72) {
        return '٥–١٠ مل شراب فموي مرة يومياً مساءً (حد أقصى ١٠ مل/يوم) – بدون اعتبار للأكل – لمدة ٥–٧ أيام';
    }
    if (ageMonths >= 24) {
        return '٢.٥ مل شراب فموي مرة–مرتين يومياً (حد أقصى ٥ مل/يوم) – بدون اعتبار للأكل – لمدة ٥–٧ أيام';
    }
    if (ageMonths >= 6) {
        return '٢.٥ مل شراب فموي مرة يومياً (يمكن لمرتين، حد أقصى ٥ مل/يوم) – بدون اعتبار للأكل – لمدة ٥–٧ أيام';
    }
    return 'لا يناسب الرضع < ٦ أشهر';
};

const levocetirizineTabDose = (_weight: number, ageMonths: number): string => {
    if (ageMonths >= 144) {
        return 'قرص واحد (٥ مجم) فموياً مرة يومياً مساءً – بدون اعتبار للأكل – لمدة ٥–٧ أيام';
    }
    if (ageMonths >= 72) {
        return 'نصف قرص (٢.٥ مجم) فموياً مرة يومياً مساءً – بدون اعتبار للأكل – لمدة ٥–٧ أيام';
    }
    return 'للأطفال < ٦ سنوات: استخدم الشراب/النقط';
};

const levocetirizineSyrupDose = (_weight: number, ageMonths: number): string => {
    if (ageMonths >= 144) {
        return '١٠ مل شراب فموي مرة يومياً مساءً – بدون اعتبار للأكل – لمدة ٥–٧ أيام';
    }
    if (ageMonths >= 72) {
        return '٥ مل شراب فموي مرة يومياً مساءً – بدون اعتبار للأكل – لمدة ٥–٧ أيام';
    }
    if (ageMonths >= 6) {
        return '٢.٥ مل شراب فموي مرة يومياً مساءً – بدون اعتبار للأكل – لمدة ٥–٧ أيام';
    }
    return 'لا يناسب الرضع < ٦ أشهر';
};

const fexofenadineSuspDose = (_weight: number, ageMonths: number): string => {
    if (ageMonths >= 24 && ageMonths < 144) {
        return '٥ مل (٣٠ مجم) شراب فموي كل ١٢ ساعة (حد أقصى ١٠ مل/يوم) – بدون عصائر فاكهة أو مضادات حموضة – لمدة ٥–٧ أيام';
    }
    if (ageMonths >= 144) {
        return 'للبالغين/≥١٢ سنة: استخدم الأقراص';
    }
    return 'لا يناسب الأطفال < سنتين';
};

/**
 * Fexofenadine Tablet Dose (120mg or 180mg)
 * Adults and children ≥12 years
 */
const fexofenadineTabDose = (conc: number) => (_weight: number, ageMonths: number): string => {
    if (ageMonths >= 144) {
        const c = conc === 180 ? '١٨٠' : '١٢٠';
        return `قرص واحد (${c} مجم) فموياً مرة يومياً – بدون عصائر فاكهة أو مضادات حموضة – لمدة ٥–٧ أيام`;
    }
    return 'للأطفال < ١٢ سنة: استخدم الشراب';
};

const loratadineTabDose = (_weight: number, ageMonths: number): string => {
    if (ageMonths >= 144) {
        return 'قرص واحد (١٠ مجم) فموياً مرة يومياً – بدون اعتبار للأكل – لمدة ٥–٧ أيام';
    }
    if (ageMonths >= 72) {
        return 'نصف قرص (٥ مجم) فموياً مرة يومياً – بدون اعتبار للأكل – لمدة ٥–٧ أيام';
    }
    return 'للأطفال < ٦ سنوات: استخدم الشراب';
};

const loratadineSyrupDose = (weight: number, ageMonths: number): string => {
    if (ageMonths >= 144 || weight >= 30) {
        return '١٠ مل شراب فموي مرة يومياً – بدون اعتبار للأكل – لمدة ٥–٧ أيام';
    }
    if (ageMonths >= 24 && weight < 30) {
        return '٥ مل شراب فموي مرة يومياً – بدون اعتبار للأكل – لمدة ٥–٧ أيام';
    }
    return 'لا يناسب الأطفال < سنتين';
};

const desloratadineTabDose = (_weight: number, ageMonths: number): string => {
    if (ageMonths >= 144) {
        return 'قرص واحد (٥ مجم) فموياً مرة يومياً – بدون اعتبار للأكل – لمدة ٥–٧ أيام';
    }
    return 'للأطفال < ١٢ سنة: استخدم الشراب';
};

const desloratadineSyrupDose = (_weight: number, ageMonths: number): string => {
    if (ageMonths >= 144) {
        return '١٠ مل شراب فموي مرة يومياً – بدون اعتبار للأكل – لمدة ٥–٧ أيام';
    }
    if (ageMonths >= 72) {
        return '٥ مل شراب فموي مرة يومياً – بدون اعتبار للأكل – لمدة ٥–٧ أيام';
    }
    if (ageMonths >= 12) {
        return '٢.٥ مل شراب فموي مرة يومياً – بدون اعتبار للأكل – لمدة ٥–٧ أيام';
    }
    return 'لا يناسب أقل من ١٢ شهراً';
};

const chlorpheniramineSyrupDose = (_weight: number, ageMonths: number): string => {
    if (ageMonths >= 144) {
        return '٥–١٠ مل شراب فموي كل ٤–٦ ساعات (حد أقصى ٢٤ مجم/يوم) – بدون اعتبار للأكل – لمدة ٥–٧ أيام';
    }
    if (ageMonths >= 72) {
        return '٥ مل شراب فموي كل ٤–٦ ساعات (حد أقصى ١٢ مجم/يوم) – بدون اعتبار للأكل – لمدة ٥–٧ أيام';
    }
    if (ageMonths >= 24) {
        return '٢.٥ مل شراب فموي كل ٤–٦ ساعات (حد أقصى ٦ مجم/يوم) – بدون اعتبار للأكل – لمدة ٥–٧ أيام';
    }
    if (ageMonths >= 12) {
        return '٢.٥ مل شراب فموي مرتين يومياً (حد أقصى ٢ مجم/يوم) – بدون اعتبار للأكل – لمدة ٥–٧ أيام';
    }
    return 'لا يناسب الرضع < سنة';
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
    t = t.replace(/استشر(?:ي)?\s+الطبيب[^.]*\./g, '.');
    t = t.replace(/استشارة\s+(?:طبية|الطبيب)[^.]*\./g, '.');
    t = t.replace(/حسب\s+(?:توجيه|تعليمات|إرشادات|وصف)\s+الطبيب/g, '');
    t = t.replace(/اسأل\s+الطبيب[^.]*\./g, '.');
    t = t.replace(/\(اسأل الطبيب\)/g, '');
    t = t.replace(/بإرشاد\s+طبي/g, '');
    return normalizeSpaces(t);
};

const sanitizeMedication = (m: Medication): Medication => ({
    ...m,
    timing: stripDoctorPhrases(m.timing),
    warnings: m.warnings.map(w => stripDoctorPhrases(w)).filter(w => w.length > 0),
    calculationRule: (w, a) => stripDoctorPhrases(m.calculationRule(w, a)),
});

/* ═══════════════════════════════════════════════════════════════════════════
   MEDICATIONS DATA
   ═══════════════════════════════════════════════════════════════════════════ */

const ANTIHISTAMINIC_MEDICATIONS_RAW: Medication[] = [
  // ==========================================
  // ANTIHISTAMINES (Allergy & Cold)
  // ==========================================

  
// 1. Histazine-1 10mg
  {
    id: 'histazine-1-10-30',
    name: 'Histazine-1 10 mg 30 Tabs',
    genericName: 'Cetirizine Hydrochloride', // [GREEN] Non-sedating second-generation antihistamine
    concentration: '10mg',
    price: 102, // [GREEN] Current price for 3 strips (30 tablets)
    matchKeywords: [
        'allergy', 'histazine', 'cetirizine', 'itching', 'sneezing', 'runny nose', 'urticaria',
        'هيستازين', 'حساسية', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'حساسية جيوب انفية', 'مضاد هيستامين'
    ],
    usage: 'مضاد هيستامين (سيتريزين) لتخفيف أعراض حساسية الأنف والأرتيكاريا والحكة.',
    timing: 'مرة يومياً مساءً – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'Tablets',
    
    minAgeMonths: 72, // 6 years (Standard for 10mg tablets)
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    
    calculationRule: cetirizineTabDose,
    
    
    warnings: CETIRIZINE_WARNINGS
  },

  // 2. Histazine-1 10mg (10 tabs)
  {
    id: 'histazine-1-10-10', // [GREEN] ID for 10 tabs pack
    name: 'Histazine-1 10 mg 10 Tabs', // [GREEN] 10 Tablets version
    genericName: 'Cetirizine Hydrochloride', 
    concentration: '10mg',
    price: 34, // [GREEN] Current price for 1 strip (10 tablets)
    matchKeywords: [
        'allergy', 'histazine', 'cetirizine', 'itching', 'sneezing', 'runny nose', 'urticaria',
        'هيستازين', 'حساسية', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'حساسية جيوب انفية', 'مضاد هيستامين'
    ],
    usage: 'مضاد هيستامين (سيتريزين) لتخفيف أعراض حساسية الأنف والأرتيكاريا والحكة.',
    timing: 'مرة يومياً مساءً – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'Tablets',
    
    minAgeMonths: 72, 
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    
    calculationRule: cetirizineTabDose,
    
    
    warnings: CETIRIZINE_WARNINGS
  },
// 3. Histazine-1 0.1% Syrup
  {
    id: 'histazine-1-syrup-100', // [GREEN] ID for syrup 100ml
    name: 'Histazine-1 0.1% Syrup 100ml', // [GREEN] Syrup form name
    genericName: 'Cetirizine Hydrochloride', // [GREEN] 1mg/ml concentration
    concentration: '1mg/ml (0.1%)',
    price: 34, // [GREEN] Current price for 100ml bottle
    matchKeywords: [
        'allergy', 'histazine syrup', 'cetirizine syrup', 'itching', 'sneezing', 'runny nose', 'urticaria', 'pediatric allergy',
        'هيستازين شراب', 'حساسية أطفال', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'حساسية جيوب انفية', 'مضاد هيستامين للاطفال'
    ],
    usage: 'مضاد هيستامين (سيتريزين) لتخفيف أعراض الحساسية والارتيكاريا عند الأطفال.',
    timing: 'مرة–مرتين يومياً – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'Syrup',
    
    minAgeMonths: 12, // [GREEN] Safe from 6 months and above
    maxAgeMonths: 144, // Usually used up to 12 years
    minWeight: 7,
    maxWeight: 50,
    
    calculationRule: cetirizineSyrupDose,
    
    
    warnings: CETIRIZINE_WARNINGS
  },
// 4. Telfast 30mg/5ml Suspension (Updated Accurate Dosing)
  {
    id: 'telfast-susp-30-100',
    name: 'Telfast 30mg/5ml Susp. 100 ml',
    genericName: 'Fexofenadine Hydrochloride', // [GREEN] Non-sedating Third Generation
    concentration: '30mg/5ml',
    price: 50, 
    matchKeywords: [
        'allergy', 'telfast syrup', 'fexofenadine', 'itching', 'sneezing', 'runny nose', 'urticaria',
        'تلفاست شراب', 'حساسية اطفال', 'هرش', 'عطس', 'رشح', 'ارتيكاريا مزمنة', 'جيوب انفية'
    ],
    usage: 'مضاد حساسية جيل ثالث (الأكثر أماناً من حيث عدم التسبب في النعاس)، يعالج حساسية الأنف الموسمية والأرتيكاريا المزمنة.',
    timing: 'كل ١٢ ساعة – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'Suspension',
    
    minAgeMonths: 24,
    maxAgeMonths: 144,
    minWeight: 7,
    maxWeight: 50,
    
    calculationRule: fexofenadineSuspDose,
    
    
    warnings: FEXOFENADINE_WARNINGS
  },
// 5. Zyrtec 10mg (20 tablets)
  {
    id: 'zyrtec-10-20',
    name: 'Zyrtec 10 mg 20 Tablets',
    genericName: 'Cetirizine Hydrochloride', // [GREEN] The original brand (Innovator) second-generation antihistamine
    concentration: '10mg',
    price: 100, // [GREEN] Updated price for 2 strips (20 tablets)
    matchKeywords: [
        'allergy', 'zyrtec', 'cetirizine', 'itching', 'sneezing', 'runny nose', 'urticaria', 'original brand',
        'زيرتك', 'حساسية', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'البراند الاصلي', 'جيوب انفية'
    ],
    usage: 'مضاد حساسية قوي وسريع المفعول (البراند الأصلي)، يستخدم لعلاج أعراض حساسية الأنف والجلد والارتيكاريا.',
    timing: 'مرة يومياً مساءً – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'Tablets',
    
    minAgeMonths: 72, // 6 years for 10mg tablets
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    
    calculationRule: cetirizineTabDose,
    
    
    warnings: CETIRIZINE_WARNINGS
  },
// 6. Zyrtec 0.1% Syrup
  {
    id: 'zyrtec-syrup-100', // [GREEN] ID for Zyrtec syrup 100ml
    name: 'Zyrtec 0.1% Syrup 100ml', // [GREEN] Brand name and form
    genericName: 'Cetirizine Hydrochloride', // [GREEN] Original brand (1mg/ml)
    concentration: '1mg/ml (0.1%)',
    price: 51, // [GREEN] Current price for 100ml bottle
    matchKeywords: [
        'allergy', 'zyrtec syrup', 'cetirizine syrup', 'itching', 'sneezing', 'runny nose', 'urticaria', 'pediatric allergy',
        'زيرتك شراب', 'حساسية أطفال', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'مضاد هيستامين براند'
    ],
    usage: 'مضاد حساسية جيل ثاني فائق الجودة، يستخدم لعلاج أعراض الحساسية الأنفية، الرمد الربيعي، وحكة الجلد للأطفال.',
    timing: 'مرة–مرتين يومياً – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'Syrup',
    
    minAgeMonths: 12, // [GREEN] Clinically safe from 6 months
    maxAgeMonths: 144, 
    minWeight: 7,
    maxWeight: 60,
    
    calculationRule: cetirizineSyrupDose,
    
    
    warnings: CETIRIZINE_WARNINGS
  },
// 7. Vomibreak Delayed Release Tablets
  {
    id: 'vomibreak-30-dr', // [GREEN] ID for Vomibreak 30 tablets pack
    name: 'Vomibreak 30 Delayed Release F.C. Tablets', // [GREEN] Delayed release formulation
    genericName: 'Doxylamine Succinate 10mg + Pyridoxine HCl (Vit B6) 10mg', // [GREEN] Combined Antihistamine and Vitamin B6
    concentration: '10mg / 10mg',
    price: 66, // [GREEN] Current price for 30 tablets pack
    matchKeywords: [
        'nausea', 'vomiting', 'pregnancy', 'morning sickness', 'vomibreak', 'doxylamine', 'pyridoxine',
        'فومى بريك', 'ترجيع الحوامل', 'غممان نفس', 'دوخة الصباح', 'مضاد قيء', 'دوكسيلامين'
    ],
    usage: 'تركيبة (دوكسيلامين + بيريدوكسين) لعلاج الغثيان والقيء المصاحبين للحمل عند عدم الاستجابة للإجراءات غير الدوائية؛ جرعة التدرج حسب البروتوكول/الطبيب.',
    timing: 'مرة يومياً قبل النوم – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, // Categorized here as it contains Doxylamine (1st gen Antihistamine)
    form: 'F.C. Tablets',
    
    minAgeMonths: 216, // [GREEN] Adults only (Pregnancy related)
    maxAgeMonths: 600,
    minWeight: 45,
    maxWeight: 150,
    
    calculationRule: fixed('قرصين قبل النوم (تتدرج لـ ٤ أقراص/يوم حسب الاستجابة) – بدون اعتبار للأكل – طوال فترة الأعراض'),
    
    
    warnings: SEDATING_ANTIHISTAMINE_WARNINGS
  },
// 8. Histazine-1 10mg (20 tabs)
  {
    id: 'histazine-1-10-20', // [GREEN] ID for 20 tabs pack
    name: 'Histazine-1 10 mg 20 Tabs', // [GREEN] 20 Tablets version
    genericName: 'Cetirizine Hydrochloride', 
    concentration: '10mg',
    price: 68, // [GREEN] Updated price for 2 strips (20 tablets)
    matchKeywords: [
        'allergy', 'histazine', 'cetirizine', 'itching', 'sneezing', 'runny nose', 'urticaria',
        'هيستازين', 'حساسية', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'حساسية جيوب انفية', 'مضاد هيستامين'
    ],
    usage: 'مضاد قوي للحساسية (جيل ثاني) يستخدم لعلاج أعراض حساسية الأنف، الرمد الربيعي، وحالات الأرتيكاريا والحكة الجلدية.',
    timing: 'مرة يومياً مساءً – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'Tablets',
    
    minAgeMonths: 72, 
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    
    calculationRule: cetirizineTabDose,
    
    
    warnings: CETIRIZINE_WARNINGS
  },
// 9. Levohistam 5mg/10ml Syrup
  {
    id: 'levohistam-syrup-120', // [GREEN] ID for Levohistam 120ml syrup
    name: 'Levohistam 5mg/10ml Syrup 120ml', // [GREEN] Brand name and concentration
    genericName: 'Levocetirizine Dihydrochloride', // [GREEN] Third-generation potent antihistamine
    concentration: '0.5mg/1ml (5mg/10ml)',
    price: 39, // [GREEN] Current price for 120ml bottle
    matchKeywords: [
        'allergy', 'levohistam', 'levocetirizine', 'itching', 'sneezing', 'runny nose', 'urticaria', 'pediatric allergy',
        'ليفوهيستام', 'ليفوسيتريزين', 'حساسية أطفال', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'مضاد هيستامين متطور'
    ],
    usage: 'مضاد حساسية جيل ثالث قوي جداً، يستخدم بجرعات صغيرة لعلاج حساسية الأنف الوراثية والحكة الجلدية والأرتيكاريا.',
    timing: 'مرة يومياً قبل النوم – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'Syrup',
    
    minAgeMonths: 6,
    maxAgeMonths: 144,
    minWeight: 7,
    maxWeight: 60,

    calculationRule: levocetirizineSyrupDose,


    warnings: LEVOCETIRIZINE_WARNINGS
  },

  // 10. Levohistam 5mg/ml Oral Drops
  {
    id: 'levohistam-drops-10', // [GREEN] ID for Levohistam 10ml drops
    name: 'Levohistam 5mg/ml Oral Drops 10 ml', // [GREEN] Brand name and form
    genericName: 'Levocetirizine Dihydrochloride', // [GREEN] Potent 3rd generation antihistamine
    concentration: '5mg/ml',
    price: 13.25, // [GREEN] Current price for 10ml bottle
    matchKeywords: [
        'allergy', 'levohistam drops', 'levocetirizine', 'itching', 'sneezing', 'runny nose', 'urticaria', 'infant allergy',
        'ليفوهيستام نقط', 'ليفوسيتريزين نقط', 'حساسية رضع', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'نقط حساسية'
    ],
    usage: 'مضاد حساسية متطور وقوي جداً، مثالي للرضع والأطفال لعلاج أعراض الحساسية الجلدية والأنفية بجرعات دقيقة.',
    timing: 'مرة يومياً قبل النوم – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'Oral Drops',
    
    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 7,
    maxWeight: 200,

    calculationRule: levocetirizineSyrupDose,
    
    
    warnings: LEVOCETIRIZINE_WARNINGS
  },


// 11. Levcet 2.5mg/5ml Syrup
  {
    id: 'levcet-syrup-120', // [GREEN] ID for Levcet 120ml syrup
    name: 'Levcet 2.5mg/5ml Syrup 120 ml', // [GREEN] Brand name and concentration
    genericName: 'Levocetirizine Dihydrochloride', // [GREEN] Third-generation antihistamine
    concentration: '0.5mg/1ml (2.5mg/5ml)',
    price: 30, // [GREEN] Current price for 120ml bottle
    matchKeywords: [
        'allergy', 'levcet syrup', 'levocetirizine', 'itching', 'sneezing', 'runny nose', 'urticaria', 'pediatric allergy',
        'ليفسيت شراب', 'ليفوسيتريزين', 'حساسية أطفال', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'مضاد هيستامين اقتصادي'
    ],
    usage: 'مضاد حساسية متطور (جيل ثالث)، فعال جداً في تقليل أعراض الرشح والحكة الجلدية والأرتيكاريا للأطفال.',
    timing: 'مرة يومياً قبل النوم – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'Syrup',
    
    minAgeMonths: 6,
    maxAgeMonths: 144,
    minWeight: 7,
    maxWeight: 60,

    calculationRule: levocetirizineSyrupDose,
    
    
    warnings: LEVOCETIRIZINE_WARNINGS
  },
  // 12. Levcet 5mg (20 tablets)
  {
    id: 'levcet-5-20', // [GREEN] ID for Levcet 20 tabs pack
    name: 'Levcet 5mg 20 Tablets', // [GREEN] Brand name and form
    genericName: 'Levocetirizine Dihydrochloride', // [GREEN] Potent 3rd generation antihistamine
    concentration: '5mg',
    price: 85, // [GREEN] Current price for 2 strips (20 tablets)
    matchKeywords: [
        'allergy', 'levcet', 'levocetirizine', 'itching', 'sneezing', 'runny nose', 'urticaria',
        'ليفسيت أقراص', 'ليفوسيتريزين', 'حساسية', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'مضاد هيستامين متطور'
    ],
    usage: 'مضاد حساسية جيل ثالث قوي وممتد المفعول، يستخدم لعلاج التهاب الأنف التحسسي وحالات الأرتيكاريا الجلدية.',
    timing: 'مرة يومياً مساءً – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'Tablets',
    
    minAgeMonths: 72, // 6 years and above for tablets
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    
    calculationRule: levocetirizineTabDose,
    
    
    warnings: LEVOCETIRIZINE_WARNINGS
  },
  // 13. Levohistam 5 mg (30 tabs)
  {
    id: 'levohistam-5-30', // [GREEN] ID for Levohistam 30 tabs pack
    name: 'Levohistam 5 mg 30 F.C. Tabs', // [GREEN] Brand name and full pack size
    genericName: 'Levocetirizine Dihydrochloride', // [GREEN] Potent 3rd generation antihistamine
    concentration: '5mg',
    price: 117, // [GREEN] Current price for 3 strips (30 tablets)
    matchKeywords: [
        'allergy', 'levohistam', 'levocetirizine', 'itching', 'sneezing', 'runny nose', 'urticaria',
        'ليفوهيستام أقراص', 'ليفوسيتريزين', 'حساسية', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'مضاد هيستامين متطور'
    ],
    usage: 'مضاد حساسية متطور (جيل ثالث) يعالج التهاب الأنف التحسسي، العطس، الرشح، وحالات الأرتيكاريا الجلدية المزمنة.',
    timing: 'مرة يومياً مساءً – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'F.C. Tablets',
    
    minAgeMonths: 72, // 6 years and above for tablets
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    
    calculationRule: levocetirizineTabDose,
    
    
    warnings: LEVOCETIRIZINE_WARNINGS
  },
  // 14. Telfast 120mg (20 tabs)
  {
    id: 'telfast-120-20', // [GREEN] ID for Telfast 120mg 20 tabs
    name: 'Telfast 120mg 20 F.C. Tab', // [GREEN] Brand name and 2 strips pack
    genericName: 'Fexofenadine Hydrochloride', // [GREEN] Non-sedating 3rd generation antihistamine
    concentration: '120mg',
    price: 116, // [GREEN] Current price for 2 strips (20 tablets)
    matchKeywords: [
        'allergy', 'telfast', 'fexofenadine', 'sneezing', 'runny nose', 'hay fever', 'non-drowsy',
        'تلفاست ١٢٠', 'فيكسوفينادين', 'حساسية جيوب انفية', 'عطس', 'رشح', 'مضاد هيستامين لا يسبب النعاس'
    ],
    usage: 'مضاد حساسية متطور جداً، يستخدم لعلاج أعراض حساسية الأنف الموسمية مثل العطس، الرشح، وحكة الأنف والزور والدموع.',
    timing: 'مرة يومياً – على معدة فارغة – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'F.C. Tablets',
    
    minAgeMonths: 144, // [GREEN] 12 years and above
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: fexofenadineTabDose(120),
    
    
    warnings: FEXOFENADINE_WARNINGS
  },
  // 15. Telfast 180mg (20 tabs)
  {
    id: 'telfast-180-20', // [GREEN] ID for Telfast 180mg 20 tabs
    name: 'Telfast 180mg 20 F.C. Tabs', // [GREEN] Brand name and strength
    genericName: 'Fexofenadine Hydrochloride', // [GREEN] High-potency non-sedating antihistamine
    concentration: '180mg',
    price: 160, // [GREEN] Current price for 2 strips (20 tablets)
    matchKeywords: [
        'allergy', 'telfast 180', 'fexofenadine', 'urticaria', 'itching', 'hives', 'skin allergy', 'non-drowsy',
        'تلفاست ١٨٠', 'فيكسوفينادين', 'حساسية جلدية', 'ارتيكاريا', 'هرش شدييد', 'مضاد هيستامين قوى'
    ],
    usage: 'فيكسوفينادين (مضاد هيستامين) لتخفيف أعراض الحساسية والأرتيكاريا/الحكة.',
    timing: 'مرة يومياً – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'F.C. Tablets',
    
    minAgeMonths: 144, // 12 years and above
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: fexofenadineTabDose(180),
    
    
    warnings: FEXOFENADINE_WARNINGS
  },
  // 16. Tussivan-n Syrup
  {
    id: 'tussivan-n-syrup-125', // [GREEN] ID for Tussivan-n 125ml
    name: 'Tussivan-n Syrup 125ml', // [GREEN] Brand name and size
    genericName: 'Dextromethorphan + Guaifenesin + Chlorpheniramine', // [GREEN] Antitussive + Expectorant + Antihistamine
    concentration: 'Multi-ingredient formula',
    price: 34, // [GREEN] Current price for 125ml bottle
    matchKeywords: [
        'cough', 'tussivan', 'dry cough', 'expectorant', 'runny nose', 'allergy cough',
        'توسيفان ن', 'كحة ناشفة', 'طارد للبلغم', 'كحة وبلغم', 'برد ورشح', 'مضاد هيستامين للكحة'
    ],
    usage: 'شراب مهدئ للسعال ومطهر للشعب الهوائية، يعالج الكحة الجافة أو المصحوبة ببلغم خفيف مع أعراض الرشح والحساسية.',
    timing: 'كل ٨ ساعات – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, // Categorized here due to Chlorpheniramine content
    form: 'Syrup',
    
    minAgeMonths: 72, // [GREEN] Standard for many cough syrups (6 years and above)
    maxAgeMonths: 1440,
    minWeight: 20,
    maxWeight: 250,
    
    calculationRule: chlorpheniramineSyrupDose,
    
    
    warnings: CHLORPHENIRAMINE_WARNINGS
  },
  // 17. Evastine 10mg (20 tabs)
  {
    id: 'evastine-10-20', // [GREEN] ID for Evastine 10mg 20 tabs
    name: 'Evastine 10mg 20 F.C. Tab', // [GREEN] Brand name and strength
    genericName: 'Ebastine', // [GREEN] Long-acting second-generation antihistamine
    concentration: '10mg',
    price: 54, // [GREEN] Current price for 2 strips (20 tablets)
    matchKeywords: [
        'allergy', 'evastine', 'ebastine', 'itching', 'sneezing', 'runny nose', 'urticaria',
        'ايفاستين', 'ايباستين', 'حساسية', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'مضاد هيستامين'
    ],
    usage: 'مضاد حساسية ممتد المفعول، يعالج أعراض التهاب الأنف التحسسي (الموسمي والدائم) وحالات الأرتيكاريا الجلدية.',
    timing: 'مرة يومياً – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'F.C. Tablets',
    
    minAgeMonths: 144, // [GREEN] Usually indicated for 12 years and above for the 10mg tablet
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: fixed('قرص واحد (١٠ مجم) فموياً مرة يومياً – بدون اعتبار للأكل – لمدة ٥–٧ أيام'),
    
    
    warnings: LORATADINE_WARNINGS
  },
  // 18. Levohistam 5mg/ml Oral Drops (20ml)
  {
    id: 'levohistam-drops-20', // [GREEN] ID for Levohistam 20ml drops
    name: 'Levohistam 5mg/ml Oral Drops 20 ml', // [GREEN] Brand name and large volume
    genericName: 'Levocetirizine Dihydrochloride', // [GREEN] Potent 3rd generation antihistamine
    concentration: '5mg/ml',
    price: 46, // [GREEN] Current price for 20ml bottle
    matchKeywords: [
        'allergy', 'levohistam drops', 'levocetirizine', 'itching', 'sneezing', 'runny nose', 'urticaria', 'infant allergy',
        'ليفوهيستام نقط', 'ليفوسيتريزين نقط', 'حساسية رضع', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'نقط حساسية كبيرة'
    ],
    usage: 'مضاد حساسية جيل ثالث متطور، مخصص للرضع والأطفال بجرعات دقيقة جداً لعلاج أعراض الحساسية الجلدية والأنفية.',
    timing: 'مرة يومياً قبل النوم – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'Oral Drops',
    
    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 7,
    maxWeight: 200,

    calculationRule: levocetirizineSyrupDose,


    warnings: LEVOCETIRIZINE_WARNINGS
  },
  // 19. Zyrtec 10mg/ml Oral Drops
  {
    id: 'zyrtec-drops-10', // [GREEN] ID for Zyrtec 10ml drops
    name: 'Zyrtec 10mg/ml Oral Drops 10 ml', // [GREEN] Brand name and form
    genericName: 'Cetirizine Hydrochloride', // [GREEN] The gold standard brand (10mg/ml)
    concentration: '10mg/ml',
    price: 43, // [GREEN] Current price for 10ml bottle
    matchKeywords: [
        'allergy', 'zyrtec drops', 'cetirizine drops', 'infant allergy', 'itching', 'sneezing', 'urticaria',
        'زيرتك نقط', 'سيتريزين نقط', 'حساسية رضع', 'هرش للاطفال', 'نقط حساسية براند', 'زيرتك للرضع'
    ],
    usage: 'مضاد حساسية جيل ثاني (البراند الأصلي)، فعال جداً وسريع المفعول لعلاج أعراض الحساسية والارتيكاريا عند الرضع والأطفال.',
    timing: 'مرة–مرتين يومياً مساءً – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'Oral Drops',
    
    minAgeMonths: 12, // [GREEN] Clinically used from 6 months and above
    maxAgeMonths: 144, 
    minWeight: 7,
    maxWeight: 50,
    
    calculationRule: cetirizineSyrupDose,
    
    
    warnings: CETIRIZINE_WARNINGS
  },
  // 20. Avil 45.5mg/2ml Amps
  {
    id: 'avil-45-5-6-amps', // [GREEN] ID for Avil 6 amps pack
    name: 'Avil 45.5mg/2ml 6 I.M. Amps', // [GREEN] Brand name and injection form
    genericName: 'Pheniramine maleate', // [GREEN] First-generation antihistamine (Potent & Sedating)
    concentration: '22.75mg/ml (45.5mg/2ml)',
    price: 57, // [GREEN] Current price for 6 ampoules
    matchKeywords: [
        'emergency', 'avil', 'injection', 'pheniramine', 'acute allergy', 'hives',
        'افيل', 'حقنة افيل', 'حساسية شديدة', 'طوارئ', 'حقنة هرش', 'فينيرامين'
    ],
    usage: 'مضاد هيستامين من الجيل الأول للحساسية الحادة/الأرتيكاريا؛ للاستخدام بالمستشفى/العيادة—حقن عضلي أو وريدي مخفف وببطء.',
    timing: 'كل ٨–١٢ ساعة – عند الحاجة',
    category: Category.ANTIHISTAMINIC, 
    form: 'Ampoules',
    
    minAgeMonths: 36, // [GREEN] Standard safety for IM injection in children (3 years and above)
    maxAgeMonths: 1200,
    minWeight: 15,
    maxWeight: 250,
    
    calculationRule: fixed('أمبول واحد (٢ مل) عضلياً للبالغين، أو ٠.٥–١ مل للأطفال ٣–١١ سنة، كل ٨–١٢ ساعة عند الحاجة (حد أقصى ٣ أمبولات/يوم)'),
    
    
    warnings: SEDATING_ANTIHISTAMINE_WARNINGS
  },
  // 21. Claritine 10mg (20 tablets)
  {
    id: 'claritine-10-20',
    name: 'Claritine 10mg 20 Tablets',
    genericName: 'Loratadine',
    concentration: '10mg',
    price: 110,
    matchKeywords: [
        'allergy', 'claritine', 'loratadine', 'itching', 'sneezing', 'runny nose', 'urticaria', 'non-drowsy',
        'كلاريتين', 'لوراتادين', 'حساسية', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'مضاد هيستامين براند'
    ],
    usage: 'علاج أعراض التهاب الأنف التحسسي الموسمي والدائم (العطس، سيلان وحكة الأنف، احمرار ودموع العين)، والأرتيكاريا مجهولة السبب المزمنة.',
    timing: 'مرة يومياً – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'Tablets',
    
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    
    calculationRule: loratadineTabDose,
    
    
    warnings: LORATADINE_WARNINGS
  },
  // 22. Dramenex 50mg (20 tablets)
  {
    id: 'dramenex-50-20',
    name: 'Dramenex 50mg 20 Tablets',
    genericName: 'Dimenhydrinate',
    concentration: '50mg',
    price: 28,
    matchKeywords: [
        'motion sickness', 'dramenex', 'dimenhydrinate', 'vomiting', 'dizziness', 'travel sickness',
        'درامينكس', 'دوار الحركة', 'دوخة السفر', 'ترجيع السفر', 'دوار البحر', 'مضاد قيء'
    ],
    usage: 'الوقاية والعلاج من الغثيان والقيء والدوار المصاحب لدوار الحركة (السفر بالسيارة، الطائرة، أو السفينة) واضطرابات الأذن الداخلية.',
    timing: 'كل ٤–٦ ساعات – عند الحاجة',
    category: Category.ANTIHISTAMINIC, 
    form: 'Tablets',
    
    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 12,
    maxWeight: 250,
    
    calculationRule: fixed('قرص–٢ قرص كل ٤–٦ ساعات للبالغين (حد أقصى ٤٠٠ مجم/يوم) – بدون اعتبار للأكل – عند الحاجة'),
    
    
    warnings: SEDATING_ANTIHISTAMINE_WARNINGS
  },
  // 23. Evastine 5mg/5ml Syrup
  {
    id: 'evastine-syrup-100',
    name: 'Evastine 5mg/5ml Syrup 100ml',
    genericName: 'Ebastine',
    concentration: '1mg/ml (5mg/5ml)',
    price: 28,
    matchKeywords: [
        'allergy', 'evastine syrup', 'ebastine', 'itching', 'sneezing', 'runny nose', 'urticaria', 'pediatric allergy',
        'ايفاستين شراب', 'ايباستين', 'حساسية أطفال', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'مضاد هيستامين طويل المفعول'
    ],
    usage: 'علاج التهاب الأنف التحسسي الموسمي والدائم (العطس، سيلان الأنف، الحكة) والأرتيكاريا المزمنة مجهولة السبب عند الأطفال.',
    timing: 'مرة يومياً – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'Syrup',
    
    minAgeMonths: 24,
    maxAgeMonths: 216,
    minWeight: 10,
    maxWeight: 70,
    
    calculationRule: (_weight: number, ageMonths: number): string => {
        if (ageMonths >= 144) return '١٠ مل (١٠ مجم) مرة واحدة يومياً. قد تُزاد لـ ٢٠ مل (٢٠ مجم) حسب الاستجابة.';
        if (ageMonths >= 72) return '٥ مل (٥ مجم) مرة واحدة يومياً.';
        if (ageMonths >= 24) return '٢٫٥ مل (٢٫٥ مجم) مرة واحدة يومياً.';
        return 'ممنوع للأطفال أقل من سنتين.';
    },
    
    
    warnings: [
        'نادراً ما يسبب نعاساً — لكن راقب تأثيره.',
        'قد يطيل QT interval مع مثبطات CYP3A4 (كيتوكونازول، إريثرومايسين)—تجنب الجمع.',
        'حذر مع مرضى الكبد.',
        'لا تتجاوز الجرعة الموصى بها.',
    ]
  },
  // 24. Histazine-1 10mg/ml Oral Drops
  {
    id: 'histazine-1-drops-10',
    name: 'Histazine-1 100mg/10ml Oral Drops 10 ml',
    genericName: 'Cetirizine Hydrochloride',
    concentration: '10mg/ml',
    price: 29,
    matchKeywords: [
        'allergy', 'histazine drops', 'cetirizine drops', 'infant allergy', 'itching', 'sneezing', 'urticaria',
        'هيستازين نقط', 'سيتريزين نقط', 'حساسية رضع', 'هرش للاطفال', 'نقط حساسية اقتصادية', 'هيستازين للرضع'
    ],
    usage: 'علاج أعراض التهاب الأنف التحسسي والأرتيكاريا المزمنة مجهولة السبب عند الرضع والأطفال.',
    timing: 'مرة–مرتين يومياً مساءً – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'Oral Drops',
    
    minAgeMonths: 12,
    maxAgeMonths: 144,
    minWeight: 7,
    maxWeight: 50,
    
    calculationRule: cetirizineSyrupDose,
    
    
    warnings: CETIRIZINE_WARNINGS
  },
  // 25. Ryaltris Nasal Spray
  {
    id: 'ryaltris-spray-240',
    name: 'Ryaltris Nasal Spray 240 Metered Sprays',
    genericName: 'Olopatadine 665mcg + Mometasone Furoate 25mcg',
    concentration: '665mcg + 25mcg per spray',
    price: 403,
    matchKeywords: [
        'allergy', 'ryaltris', 'nasal spray', 'mometasone', 'olopatadine', 'rhinitis', 'stuffy nose',
        'ريالترس', 'بخاخة انف', 'حساسية جيوب انفية', 'انسداد الانف', 'كورتيزون ومضاد هيستامين', 'بخاخة مزدوجة'
    ],
    usage: 'علاج أعراض التهاب الأنف التحسسي الموسمي (الانسداد، السيلان، الحكة، العطس) بتركيبة مزدوجة تجمع مضاد هيستامين وكورتيكوستيرويد.',
    timing: 'كل ١٢ ساعة – علاج مستمر',
    category: Category.ANTIHISTAMINIC,
    form: 'Nasal Spray',
    
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: fixed('بختين في كل فتحة أنف مرتين يومياً (إجمالي ٨ بخات/يوم) – بدون اعتبار للأكل – علاج مستمر للسيطرة'),
    
    
    warnings: FEXOFENADINE_WARNINGS
  },
  // 26. Ryaltris Nasal Spray (120 sprays)
  {
    id: 'ryaltris-spray-120',
    name: 'Ryaltris Nasal Spray 120 Metered Sprays',
    genericName: 'Olopatadine 665mcg + Mometasone Furoate 25mcg',
    concentration: '665mcg + 25mcg per spray',
    price: 230,
    matchKeywords: [
        'allergy', 'ryaltris', 'nasal spray', 'mometasone', 'olopatadine', 'rhinitis', 'stuffy nose',
        'ريالترس', 'بخاخة انف', 'حساسية جيوب انفية', 'انسداد الانف', 'كورتيزون ومضاد هيستامين', 'بخاخة مزدوجة'
    ],
    usage: 'علاج أعراض التهاب الأنف التحسسي الموسمي (الانسداد، السيلان، الحكة، العطس) بتركيبة مزدوجة تجمع مضاد هيستامين وكورتيكوستيرويد.',
    timing: 'كل ١٢ ساعة – علاج مستمر',
    category: Category.ANTIHISTAMINIC,
    form: 'Nasal Spray',
    
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: fixed('بختين في كل فتحة أنف مرتين يومياً (إجمالي ٨ بخات/يوم) – بدون اعتبار للأكل – علاج مستمر للسيطرة'),
    
    
    warnings: FEXOFENADINE_WARNINGS
  },
  // 27. Xaltec 5mg (20 tablets)
  {
    id: 'xaltec-5-20',
    name: 'Xaltec 5mg 20 Tablets',
    genericName: 'Levocetirizine Dihydrochloride',
    concentration: '5mg',
    price: 40,
    matchKeywords: [
        'allergy', 'xaltec', 'levocetirizine', 'itching', 'sneezing', 'runny nose', 'urticaria',
        'زالتيك', 'ليفوسيتريزين', 'حساسية', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'مضاد هيستامين اقتصادي'
    ],
    usage: 'علاج التهاب الأنف التحسسي (الموسمي والدائم) والأرتيكاريا المزمنة مجهولة السبب عند البالغين والأطفال فوق 6 سنوات.',
    timing: 'مرة يومياً قبل النوم – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'Tablets',
    
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    
    calculationRule: levocetirizineTabDose,
    
    
    warnings: LEVOCETIRIZINE_WARNINGS
  },
  // 28. Delarex 5mg (20 tablets)
  {
    id: 'delarex-5-20',
    name: 'Delarex 5mg 20 F.C. Tab',
    genericName: 'Desloratadine',
    concentration: '5mg',
    price: 48,
    matchKeywords: [
        'allergy', 'delarex', 'desloratadine', 'itching', 'sneezing', 'runny nose', 'urticaria', 'non-drowsy',
        'ديالاريكس', 'ديسلوراتادين', 'حساسية', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'مضاد هيستامين لا يسبب النعاس'
    ],
    usage: 'علاج التهاب الأنف التحسسي (العطس، سيلان وحكة الأنف، احمرار ودموع العين) والأرتيكاريا المزمنة مجهولة السبب.',
    timing: 'مرة يومياً – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'F.C. Tablets',
    
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: desloratadineTabDose,
    
    
    warnings: DESLORATADINE_WARNINGS
  },
  // 29. Allerban 1mg/5ml Syrup
  {
    id: 'allerban-syrup-100',
    name: 'Allerban 1mg/5ml Syrup 100 ml',
    genericName: 'Ketotifen Fumarate',
    concentration: '0.2mg/ml (1mg/5ml)',
    price: 33,
    matchKeywords: [
        'allergy', 'allerban', 'ketotifen', 'asthma prevention', 'itching', 'sneezing', 'pediatric allergy',
        'أليربان', 'كيتوتيفين', 'حساسية صدر', 'وقاية من الربو', 'هرش', 'عطس', 'شراب حساسية أطفال'
    ],
    usage: 'الوقاية من نوبات الربو الشعبي (علاج وقائي طويل الأمد) وعلاج أعراض التهاب الأنف التحسسي والأرتيكاريا المزمنة.',
    timing: 'كل ١٢ ساعة مع الأكل – علاج مستمر',
    category: Category.ANTIHISTAMINIC,
    form: 'Syrup',

    minAgeMonths: 6,
    maxAgeMonths: 216,
    minWeight: 7,
    maxWeight: 70,

    calculationRule: (_w, ageMonths) => {
        if (ageMonths >= 36) return '٥ مل شراب فموي كل ١٢ ساعة (حد أقصى ٢ مجم/يوم) – مع الأكل – علاج مستمر للسيطرة';
        return '٢.٥ مل شراب فموي كل ١٢ ساعة (حد أقصى ١ مجم/يوم) – مع الأكل – علاج مستمر للسيطرة';
    },
    
    
    warnings: SEDATING_ANTIHISTAMINE_WARNINGS
  },
  // 30. Delarex 5mg (30 tablets)
  {
    id: 'delarex-5-30',
    name: 'Delarex 5mg 30 F.C. Tab',
    genericName: 'Desloratadine',
    concentration: '5mg',
    price: 72,
    matchKeywords: [
        'allergy', 'delarex', 'desloratadine', 'itching', 'sneezing', 'runny nose', 'urticaria', 'non-drowsy',
        'ديالاريكس', 'ديسلوراتادين', 'حساسية', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'مضاد هيستامين موفر'
    ],
    usage: 'علاج التهاب الأنف التحسسي (العطس، سيلان وحكة الأنف، احمرار ودموع العين) والأرتيكاريا المزمنة مجهولة السبب.',
    timing: 'مرة يومياً – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'F.C. Tablets',
    
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: desloratadineTabDose,
    
    
    warnings: DESLORATADINE_WARNINGS
  },
  // 31. Deslorex 5mg (10 tablets)
  {
    id: 'deslorex-5-10',
    name: 'Deslorex 5mg 10 Tablets',
    genericName: 'Desloratadine',
    concentration: '5mg',
    price: 9.25,
    matchKeywords: [
        'allergy', 'deslorex', 'desloratadine', 'itching', 'sneezing', 'runny nose', 'urticaria', 'non-drowsy',
        'ديسلوريكس', 'ديسلوراتادين', 'حساسية', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'ارخص مضاد هيستامين'
    ],
    usage: 'علاج التهاب الأنف التحسسي والأرتيكاريا المزمنة مجهولة السبب بتركيبة اقتصادية فعالة.',
    timing: 'مرة يومياً – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'Tablets',
    
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: desloratadineTabDose,
    
    
    warnings: DESLORATADINE_WARNINGS
  },
  // 32. Levcet 5mg/ml Oral Drops (20ml)
  {
    id: 'levcet-drops-20', // [GREEN] ID for Levcet 20ml drops
    name: 'Levcet 5mg/ml Oral Drops 20 ml', // [GREEN] Brand name and large volume
    genericName: 'Levocetirizine Dihydrochloride', // [GREEN] Potent 3rd generation antihistamine
    concentration: '5mg/ml',
    price: 36, // [GREEN] Current price for 20ml bottle
    matchKeywords: [
        'allergy', 'levcet drops', 'levocetirizine', 'itching', 'sneezing', 'runny nose', 'urticaria', 'infant allergy',
        'ليفسيت نقط', 'ليفوسيتريزين نقط', 'حساسية رضع', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'نقط حساسية اقتصادية'
    ],
    usage: 'مضاد حساسية متطور وقوي، يستخدم بجرعات دقيقة جداً لعلاج أعراض الحساسية الجلدية والأنفية عند الرضع والأطفال.',
    timing: 'مرة يومياً قبل النوم – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'Oral Drops',
    
    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 7,
    maxWeight: 200,

    calculationRule: levocetirizineSyrupDose,


    warnings: LEVOCETIRIZINE_WARNINGS
  },
  // 33. Meclizigo 25mg (20 Orodispersible films)
  {
    id: 'meclizigo-25-20-films', // [GREEN] ID for Meclizigo 20 films pack
    name: 'Meclizigo 25 mg 20 Orodispersible Films', // [GREEN] Brand name and innovative form
    genericName: 'Meclizine Hydrochloride', // [GREEN] Antihistamine for vertigo and motion sickness
    concentration: '25mg',
    price: 90, // [GREEN] Current price for 20 films
    matchKeywords: [
        'motion sickness', 'meclizigo', 'meclizine', 'vertigo', 'vomiting', 'dizziness', 'travel sickness', 'film',
        'ميكليزيكو', 'دوار الحركة', 'دوخة السفر', 'فيلم للسان', 'دوار البحر', 'مضاد دوخة', 'ترجيع السفر'
    ],
    usage: 'أفلام سريعة الذوبان لعلاج دوار الحركة والدوخة والغثيان والقيء بمفعول قوي وسريع.',
    timing: 'كل ٤–٦ ساعات – عند الحاجة',
    category: Category.ANTIHISTAMINIC, 
    form: 'Film',
    
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: fixed('فيلم واحد (٢٥ مجم) كل ٤–٦ ساعات (حد أقصى فيلمان/يوم) – بدون اعتبار للأكل – عند الحاجة'),
    
    
    warnings: SEDATING_ANTIHISTAMINE_WARNINGS
  },
  // 34. Mornigag 10/10mg (30 tabs)
  {
    id: 'mornigag-10-10-30', // [GREEN] ID for Mornigag 30 tabs pack
    name: 'Mornigag 10/10mg 30 Delayed Rel. Tabs', // [GREEN] Brand name and special form
    genericName: 'Doxylamine Succinate + Pyridoxine HCl (Vit B6)', // [GREEN] Antihistamine + Vitamin B6 for NVP
    concentration: '10mg / 10mg',
    price: 66, // [GREEN] Current price for 3 strips (30 tablets)
    matchKeywords: [
        'morning sickness', 'mornigag', 'pregnancy nausea', 'vomiting in pregnancy', 'doxylamine', 'pyridoxine',
        'مورنيجاج', 'غثيان الصباح', 'ترجيع الحمل', 'ترجيع الحوامل', 'مضاد ترجيع للحمل'
    ],
    usage: 'علاج غثيان وقيء الصباح (Morning Sickness) الناتج عن الحمل في الحالات التي لا تستجيب للعلاجات الأخرى. يجمع تأثير مهدئ مع فيتامين B6.',
    timing: 'مرة يومياً قبل النوم – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC,
    form: 'Delayed Release Tablet',
    
    minAgeMonths: 216,
    maxAgeMonths: 600,
    minWeight: 45,
    maxWeight: 150,
    
    calculationRule: fixed('قرصين قبل النوم (تتدرج لـ ٤ أقراص/يوم حسب الاستجابة) – بدون اعتبار للأكل – طوال فترة الأعراض'),
    
    
    warnings: SEDATING_ANTIHISTAMINE_WARNINGS
  },
  // 35. Mosedin 10mg (20 tablets)
  {
    id: 'mosedin-10-20', // [GREEN] ID for Mosedin 20 tabs pack
    name: 'Mosedin 10mg 20 Tablets', // [GREEN] Brand name and strength
    genericName: 'Loratadine', // [GREEN] Non-sedating 2nd generation antihistamine
    concentration: '10mg',
    price: 70, // [GREEN] Current price for 2 strips (20 tablets)
    matchKeywords: [
        'allergy', 'mosedin', 'loratadine', 'itching', 'sneezing', 'runny nose', 'urticaria', 'non-drowsy',
        'موسيدين', 'لوراتادين', 'حساسية', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'مضاد هيستامين مصري'
    ],
    usage: 'مضاد حساسية فعال لا يسبب النعاس، يستخدم لعلاج أعراض التهاب الأنف التحسسي والأرتيكاريا الجلدية والحكة.',
    timing: 'مرة يومياً – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'Tablets',
    
    minAgeMonths: 72, // 6 years and above for 10mg tablets
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    
    calculationRule: loratadineTabDose,
    
    
    warnings: LORATADINE_WARNINGS
  },
  // 36. Meclizigo 25mg (30 Orodispersible films)
  {
    id: 'meclizigo-25-30-films', // [GREEN] ID for Meclizigo 30 films pack
    name: 'Meclizigo 25 mg 30 Orodispersible Films', // [GREEN] Brand name and 30 films pack
    genericName: 'Meclizine Hydrochloride', // [GREEN] Antihistamine for vertigo and motion sickness
    concentration: '25mg',
    price: 75, // [GREEN] Current price for 3 strips (30 films)
    matchKeywords: [
        'motion sickness', 'meclizigo', 'meclizine', 'vertigo', 'vomiting', 'dizziness', 'travel sickness', 'film',
        'ميكليزيكو', 'دوار الحركة', 'دوخة السفر', 'فيلم للسان', 'دوار البحر', 'مضاد دوخة', 'ترجيع السفر'
    ],
    usage: 'أفلام سريعة الذوبان بالفم لعلاج الدوار، الدوخة، والوقاية من الغثيان والقيء المصاحب لدوار الحركة.',
    timing: 'مرة قبل السفر بساعة – عند الحاجة',
    category: Category.ANTIHISTAMINIC, 
    form: 'Film',
    
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: fixed('فيلم–فيلمين على اللسان مرة قبل السفر بساعة – بدون اعتبار للأكل – عند الحاجة'),
    
    
    warnings: SEDATING_ANTIHISTAMINE_WARNINGS
  },
  // 37. Cogintol 2mg (20 tablets)
  {
    id: 'cogintol-2-20', // [GREEN] ID for Cogintol 20 tabs pack
    name: 'Cogintol 20 Tablets', // [GREEN] Brand name and pack size
    genericName: 'Benztropine Mesylate', // [GREEN] Anticholinergic agent
    concentration: '2mg',
    price: 40, // [GREEN] Current price for 2 strips (20 tablets)
    matchKeywords: [
        'parkinson', 'cogintol', 'benztropine', 'tremors', 'eps', 'muscle stiffness',
        'كوجينتول', 'رعشة', 'باركنسون', 'تشنج عضلي', 'شلل رعاش', 'تنظيم حركة'
    ],
    usage: 'علاج أعراض مرض باركنسون والتحكم في الآثار الجانبية الحركية (مثل الرعشة وتيبس العضلات) الناتجة عن بعض الأدوية النفسية.',
    timing: 'مرة–مرتين يومياً – علاج مستمر',
    category: Category.ANTICHOLINERGICS, 
    form: 'Tablets',
    
    minAgeMonths: 36, // [GREEN] Not recommended for children under 3 years
    maxAgeMonths: 1200,
    minWeight: 15,
    maxWeight: 250,
    
    calculationRule: fixed('نصف–١ قرص (١–٢ مجم) فموياً مرة–مرتين يومياً (تدريجياً، حد أقصى ٦ مجم/يوم) – بدون اعتبار للأكل – علاج مستمر'),
    
    
    warnings: [
        'يسبب نعاساً شديداً — تجنب القيادة/الآلات.',
        'ممنوع مع: الجلوكوما ضيقة الزاوية، تضخم البروستاتا، احتباس البول، انسداد الأمعاء.',
        'تجنب الكحول والمهدئات.',
        'لا يُستخدم للأطفال أقل من ٣ سنوات.',
        'قد يسبب جفاف الفم/إمساك/تشوش الرؤية (أعراض أنتيكولينرجية).',
        'لا يُوقف فجأة بعد الاستخدام المزمن.',
    ]
  },
  // 38. Desa 5mg (20 tablets)
  {
    id: 'desa-5-20', // [GREEN] ID for Desa 20 tabs pack
    name: 'Desa 5mg 20 F.C. Tabs', // [GREEN] Brand name and form
    genericName: 'Desloratadine', // [GREEN] Non-sedating 3rd generation antihistamine
    concentration: '5mg',
    price: 70, // [GREEN] Current price for 2 strips (20 tablets)
    matchKeywords: [
        'allergy', 'desa', 'desloratadine', 'itching', 'sneezing', 'runny nose', 'urticaria', 'non-drowsy',
        'ديسا', 'ديسلوراتادين', 'حساسية', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'مضاد هيستامين لا يسبب النعاس'
    ],
    usage: 'مضاد حساسية جيل ثالث متطور، يستخدم لعلاج أعراض التهاب الأنف التحسسي والأرتيكاريا المزمنة دون التأثير على اليقظة.',
    timing: 'مرة يومياً – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'F.C. Tablets',
    
    minAgeMonths: 144, // 12 years and above for tablets
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: desloratadineTabDose,
    
    
    warnings: DESLORATADINE_WARNINGS
  },
  // 39. Dolo-D Oral Susp. 115 ml
  {
    id: 'dolo-d-susp-115', // [GREEN] ID for Dolo-D 115ml suspension
    name: 'Dolo-D Oral Susp. 115 ml', // [GREEN] Brand name and volume
    genericName: 'Ibuprofen + Pseudoephedrine Hydrochloride', // [GREEN] Combination of NSAID and Decongestant
    concentration: '100mg + 15mg / 5ml',
    price: 37, // [GREEN] Current price for 115ml bottle
    matchKeywords: [
        'cold', 'flu', 'fever', 'congestion', 'dolo-d', 'runny nose', 'ibuprofen',
        'دولو دي', 'برد', 'انفلونزا', 'سخونية', 'احتقان انف', 'رشح', 'خافض حرارة'
    ],
    usage: 'علاج أعراض البرد والإنفلونزا: خافض للحرارة ومسكن للألم ومزيل احتقان الأنف والجيوب الأنفية.',
    timing: 'كل ٦–٨ ساعات – عند الحاجة',
    category: Category.COMMON_COLD,
    form: 'Oral Suspension',
    
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 21.4,
    maxWeight: 100,
    
    calculationRule: fixed('١٠ مل شراب فموي كل ٦–٨ ساعات للبالغين (حد أقصى ٥ جرعات/يوم) – بدون اعتبار للأكل – لمدة ٥–٧ أيام'),
    
    
    warnings: [
        'يحتوي ايبوبروفين: ممنوع مع قرحة المعدة/نزيف معدي/فشل كلوي شديد.',
        'لا يُعطى مع أسبرين/مميعات الدم إلا بإشراف طبي.',
        'يحتوي سودوإيفيدرين: ممنوع مع ارتفاع ضغط الدم الشديد/أمراض القلب/فرط الغدة الدرقية.',
        'لا يُستخدم > ١٠ أيام دون مراجعة طبية.',
        'ممنوع أثناء الحمل (خصوصاً الثلث الأخير).',
    ]
  },
  // 40. Fastel 180mg (20 tablets)
  {
    id: 'fastel-180-20', // [GREEN] ID for Fastel 20 tabs pack
    name: 'Fastel 180mg 20 F.C. Tab', // [GREEN] Brand name and strength
    genericName: 'Fexofenadine Hydrochloride', // [GREEN] Third-generation non-sedating antihistamine
    concentration: '180mg',
    price: 84, // [GREEN] Current price for 2 strips (20 tablets)
    matchKeywords: [
        'allergy', 'fastel', 'fexofenadine', 'itching', 'sneezing', 'runny nose', 'urticaria', 'non-drowsy',
        'فاستيل', 'فيكسوفينادين', 'حساسية', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'مضاد هيستامين لا يسبب النعاس'
    ],
    usage: 'علاج التهاب الأنف التحسسي والأرتيكاريا بتركيز عالي لا يسبب النعاس.',
    timing: 'مرة يومياً – على معدة فارغة – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'F.C. Tablets',
    
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: fexofenadineTabDose(180),
    
    
    warnings: FEXOFENADINE_WARNINGS
  },
  // 41. Bilastigec 20mg (20 tablets)
  {
    id: 'bilastigec-20-20', // [GREEN] ID for Bilastigec 20 tabs pack
    name: 'Bilastigec 20 mg 20 Tablets', // [GREEN] Brand name and strength
    genericName: 'Bilastine', // [GREEN] Newest generation non-sedating antihistamine
    concentration: '20mg',
    price: 70, // [GREEN] Current price for 2 strips (20 tablets)
    matchKeywords: [
        'allergy', 'bilastigec', 'bilastine', 'itching', 'sneezing', 'runny nose', 'urticaria', 'non-drowsy',
        'بيلاستيجيك', 'بيلاستين', 'حساسية', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'مضاد هيستامين حديث'
    ],
    usage: 'علاج التهاب الأنف التحسسي والأرتيكاريا بأحدث مضاد هيستامين (الجيل الرابع) لا يسبب النعاس.',
    timing: 'مرة يومياً – على معدة فارغة – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'Tablets',
    
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: fixed('قرص واحد (٢٠ مجم) فموياً مرة يومياً – على معدة فارغة (ساعة قبل/ساعتين بعد الأكل) – لمدة ٥–٧ أيام'),
    
    
    warnings: FEXOFENADINE_WARNINGS
  },
  // 42. Fastel 180mg (10 tablets)
  {
    id: 'fastel-180-10', // [GREEN] ID for Fastel 1 strip pack
    name: 'Fastel 180mg 10 F.C. Tab', // [GREEN] Brand name and 10 tabs strip
    genericName: 'Fexofenadine Hydrochloride', // [GREEN] Selective H1-receptor antagonist - non-sedating 3rd generation antihistamine
    concentration: '180mg',
    price: 42, // [GREEN] Current price for 1 strip (10 tablets)
    matchKeywords: [
        'allergy', 'fastel', 'fexofenadine', 'itching', 'sneezing', 'runny nose', 'urticaria', 'non-drowsy',
        'فاستيل', 'فيكسوفينادين', 'حساسية', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'مضاد هيستامين موثوق'
    ],
    usage: 'علاج أعراض التهاب الأنف التحسسي (العطس، الرشح، الحكة) والأرتيكاريا الجلدية بفاعلية عالية دون النعاس.',
    timing: 'مرة يومياً – على معدة فارغة – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'F.C. Tablets',
    
    minAgeMonths: 144, // 12 years and above for 180mg dose
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: fexofenadineTabDose(180),
    
    
    warnings: FEXOFENADINE_WARNINGS
  },
  // 43. Lergicare 5mg (30 tablets)
  {
    id: 'lergicare-5-30', // [GREEN] ID for Lergicare 30 tabs pack
    name: 'Lergicare 5 mg 30 F.C. Tabs', // [GREEN] Brand name and pack size
    genericName: 'Levocetirizine Dihydrochloride', // [GREEN] Potent 3rd generation antihistamine
    concentration: '5mg',
    price: 42, // [GREEN] Current price for 3 strips (30 tablets)
    matchKeywords: [
        'allergy', 'lergicare', 'levocetirizine', 'itching', 'sneezing', 'runny nose', 'urticaria',
        'ليرجيكير', 'ليفوسيتريزين', 'حساسية', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'مضاد هيستامين اقتصادي'
    ],
    usage: 'علاج التهاب الأنف التحسسي الموسمي والدائم والأرتيكاريا بتركيبة اقتصادية.',
    timing: 'مرة يومياً – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'F.C. Tablets',
    
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    
    calculationRule: levocetirizineTabDose,
    
    
    warnings: LEVOCETIRIZINE_WARNINGS
  },
  // 44. Levoctivan 0.5mg/ml Syrup (120ml)
  {
    id: 'levoctivan-syrup-120', // [GREEN] ID for Levoctivan 120ml syrup
    name: 'Levoctivan 0.5mg/ml Syrup 120 ml', // [GREEN] Brand name and large volume
    genericName: 'Levocetirizine Dihydrochloride', // [GREEN] Potent 3rd generation antihistamine
    concentration: '0.5mg/ml',
    price: 39, // [GREEN] Current price for 120ml bottle
    matchKeywords: [
        'allergy', 'levoctivan syrup', 'levocetirizine syrup', 'itching', 'sneezing', 'runny nose', 'urticaria',
        'ليفوكتيفان شراب', 'ليفوسيتريزين شراب', 'حساسية أطفال', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'شراب حساسية موفر'
    ],
    usage: 'علاج التهاب الأنف التحسسي والأرتيكاريا عند الأطفال بشراب طعم جيد وآمن.',
    timing: 'مرة يومياً قبل النوم – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'Syrup',
    
    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 100,

    calculationRule: levocetirizineSyrupDose,
    
    
    warnings: LEVOCETIRIZINE_WARNINGS
  },
  // 45. Neurazine 100mg (20 tablets)
  {
    id: 'neurazine-100-20', // [GREEN] ID for Neurazine 20 tabs pack
    name: 'Neurazine 100 mg 20 Tablets', // [GREEN] Brand name and high strength
    genericName: 'Chlorpromazine Hydrochloride', // [GREEN] First-generation antipsychotic with strong antiemetic & anticholinergic properties
    concentration: '100mg',
    price: 46, // [GREEN] Current price for 2 strips (20 tablets)
    matchKeywords: [
        'psychosis', 'neurazine', 'chlorpromazine', 'hiccups', 'severe vomiting', 'schizophrenia', 'agitation',
        'نيورازين', 'كلوربرومازين', 'ذهان', 'زغطة مستمرة', 'ترجيع مستعصي', 'هدئ نفسي', 'علاج ذهان'
    ],
    usage: 'دواء ذهاني قوي يستخدم لعلاج الاضطرابات النفسية (الذهان، الشيزوفرينيا)، والهياج الحاد، وكعلاج مساعد للغثيان والقيء الشديد والفواق المستعصي.',
    timing: 'مرتين يومياً (صباحاً ومساءً) – علاج مستمر',
    category: Category.ANTIPSYCHOTIC, // [GREEN] Primary medical category
    form: 'Tablets',
    
    minAgeMonths: 216, // [GREEN] 18 years and above for this high strength
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    
    calculationRule: fixed('٢٥–٥٠ مجم فموياً تدريجياً (الذهان: ٢٠٠–٨٠٠ مجم/يوم مقسمة) – بدون اعتبار للأكل – علاج مستمر تحت إشراف'),
    
    
    warnings: [
        'يسبب نعاساً شديداً — تجنب القيادة/الآلات.',
        'خطر متلازمة الذهان الخبيثة (NMS): حمى شديدة/تيبس عضلي/تغير وعي → طوارئ فوراً.',
        'خطر خلل الحركة المتأخر (Tardive Dyskinesia) مع الاستعمال المطوّل.',
        'يطيل QT—حذر مع أدوية القلب/نقص بوتاسيوم/ماغنسيوم.',
        'قد يسبب هبوط ضغط انتصابي شديد—انهض ببطء.',
        'يسبب حساسية للضوء—استخدم واقي شمس.',
        'ممنوع مع: غيبوبة، اكتئاب شديد بالجهاز العصبي، ورم القواتم.',
        'لا يُوقف فجأة بعد الاستخدام المزمن (أعراض انسحاب).',
    ]
  },
  // 46. Allerban S.R. 2mg (20 tablets)
  {
    id: 'allerban-sr-2-20', // [GREEN] ID for Allerban S.R. 20 tabs pack
    name: 'Allerban S.R. 2 mg 20 Tablets', // [GREEN] Brand name and Sustained Release form
    genericName: 'Ketotifen', // [GREEN] Antihistamine and Mast cell stabilizer
    concentration: '2mg (Sustained Release)',
    price: 38, // [GREEN] Current price for 2 strips (20 tablets)
    matchKeywords: [
        'allergy', 'allerban sr', 'ketotifen', 'asthma prevention', 'itching', 'sneezing', 'urticaria',
        'أليربان اس ار', 'كيتوتيفين', 'حساسية صدر', 'وقاية من الربو', 'هرش', 'عطس', 'مضاد هيستامين ممتد المفعول'
    ],
    usage: 'مثبت الخلايا الصارية وعامل وقائي (prophylactic) قوي، يستخدم للوقاية من أزمات الربو الشعبي وعلاج أعراض الحساسية الأنفية والجلدية المزمنة.',
    timing: 'مرة يومياً قبل النوم – علاج مستمر',
    category: Category.ANTIHISTAMINIC, 
    form: 'Tablets',
    
    minAgeMonths: 216, // [GREEN] Generally recommended for adults and adolescents
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: fixed('قرص واحد (٢ مجم) فموياً مرة يومياً مساءً – بدون اعتبار للأكل – علاج وقائي مستمر'),
    
    
    warnings: SEDATING_ANTIHISTAMINE_WARNINGS
  },
  // 47. Allerfen 180mg (20 tablets)
  {
    id: 'allerfen-180-20', // [GREEN] ID for Allerfen 20 tabs pack
    name: 'Allerfen 180 mg 20 F.C. Tabs', // [GREEN] Brand name and strength
    genericName: 'Fexofenadine Hydrochloride', // [GREEN] High-potency non-sedating antihistamine
    concentration: '180mg',
    price: 84, // [GREEN] Current price for 2 strips (20 tablets)
    matchKeywords: [
        'allergy', 'allerfen', 'fexofenadine', 'itching', 'sneezing', 'runny nose', 'urticaria', 'non-drowsy',
        'أليرفين', 'فيكسوفينادين', 'حساسية', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'مضاد هيستامين قوى'
    ],
    usage: 'علاج أعراض التهاب الأنف التحسسي (العطس، الرشح، الحكة) والأرتيكاريا الجلدية بفاعلية عالية دون التأثير على اليقظة العقلية.',
    timing: 'مرة يومياً – على معدة فارغة – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'F.C. Tablets',
    
    minAgeMonths: 144, // 12 years and above for 180mg dose
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) {
            return 'قرص واحد (١٨٠ مجم) فموياً مرة يومياً – على معدة فارغة (بدون عصائر فاكهة) – لمدة ٥–٧ أيام';
        }
        return 'التركيز ١٨٠ مجم لا يناسب أقل من ١٢ سنة؛ استخدم تركيز ٦٠/١٢٠ مجم';
    },
    
    
    warnings: [
        'الحمل (Category C): لا توجد دراسات كافية؛ استخدمي عند الضرورة فقط، بأقل جرعة وأقصر مدة.',
        'التداخلات الحرجة: تجنبي عصائر الفاكهة وخاصة الجريب فروت تماماً (تقلل الامتصاص بنسبة 50%). لا تأخذي مضادات حموضة (ألومنيوم/ماغنسيوم) معها.',
        'قصور كلوي: عدّل الجرعة أو المسافة بين الجرعات حسب الـ GFR (حسب GFR—جدول تعديل الجرعة).',
        'نادراً: قد يسبب صداع أو دوخة خفيفة؛ تجنبي القيادة أول استخدام.',
        'الرضاعة: آمنة نسبياً.'
    ]
  },
  // 48. Lorafast 2.5mg/5ml Syrup (100ml)
  {
    id: 'lorafast-syrup-100', // [GREEN] ID for Lorafast 100ml syrup
    name: 'Lorafast 2.5mg/5ml Syrup 100 ml', // [GREEN] Brand name and concentration
    genericName: 'Desloratadine', // [GREEN] Non-sedating 3rd generation antihistamine
    concentration: '2.5mg/5ml',
    price: 26, // [GREEN] Current price for 100ml bottle
    matchKeywords: [
        'allergy', 'lorafast', 'desloratadine syrup', 'itching', 'sneezing', 'runny nose', 'urticaria',
        'لورافاست شراب', 'ديسلوراتادين شراب', 'حساسية أطفال', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'ارخص شراب حساسية'
    ],
    usage: 'علاج أعراض التهاب الأنف التحسسي والأرتيكاريا عند الأطفال والرضع بصيغة شراب طعم جيد وآمن وفعال.',
    timing: 'مرة يومياً مساءً – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'Syrup',
    
    minAgeMonths: 12, // [GREEN] Safe for infants from 6 months and above
    maxAgeMonths: 144, 
    minWeight: 7,
    maxWeight: 60,
    
    calculationRule: desloratadineSyrupDose,
    
    
    warnings: DESLORATADINE_WARNINGS
  },
  // 49. Xaltec 0.5mg/ml Syrup (120ml)
  {
    id: 'xaltec-syrup-120', // [GREEN] ID for Xaltec 120ml syrup
    name: 'Xaltec 0.5 mg/ml Syrup 120 ml', // [GREEN] Brand name and large size
    genericName: 'Levocetirizine Dihydrochloride', // [GREEN] Fast-acting 3rd generation antihistamine
    concentration: '0.5mg/ml',
    price: 34, // [GREEN] Current price for 120ml bottle
    matchKeywords: [
        'allergy', 'xaltec syrup', 'levocetirizine syrup', 'itching', 'sneezing', 'runny nose', 'urticaria',
        'زاليتيك شراب', 'ليفوسيتريزين شراب', 'حساسية أطفال', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'شراب حساسية موفر'
    ],
    usage: 'مضاد حساسية جيل ثالث متطور وقوي وفعال جداً، يستخدم لعلاج التهاب الأنف التحسسي والأرتيكاريا الجلدية بفاعلية عالية وسريعة.',
    timing: 'مرة يومياً قبل النوم – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'Syrup',
    
    minAgeMonths: 6,
    maxAgeMonths: 144,
    minWeight: 7,
    maxWeight: 60,

    calculationRule: levocetirizineSyrupDose,
    
    
    warnings: LEVOCETIRIZINE_WARNINGS
  },
  // 50. Alergoliber 10mg (20 tablets)
  {
    id: 'alergoliber-10-20', // [GREEN] ID for Alergoliber 20 tabs pack
    name: 'Alergoliber 10mg 20 F.C. Tabs', // [GREEN] Brand name and form
    genericName: 'Rupatadine', // [GREEN] Second-generation antihistamine and PAF antagonist
    concentration: '10mg',
    price: 60, // [GREEN] Current price for 2 strips (20 tablets)
    matchKeywords: [
        'allergy', 'alergoliber', 'rupatadine', 'itching', 'sneezing', 'runny nose', 'urticaria', 'non-drowsy',
        'أليرجوليبر', 'روباتادين', 'حساسية', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'مضاد حساسية ثنائي المفعول'
    ],
    usage: 'روباتادين (مضاد هيستامين+ مناهض PAF) لتخفيف أعراض التهاب الأنف التحسسي والأرتيكاريا بمفعول مزدوج.',
    timing: 'مرة يومياً مع الأكل – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'F.C. Tablets',
    
    minAgeMonths: 144, // 12 years and above for 10mg tablets
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: fixed('قرص واحد (١٠ مجم) فموياً مرة يومياً – بدون اعتبار للأكل – لمدة ٥–٧ أيام'),
    
    
    warnings: LORATADINE_WARNINGS
  },
  // 51. Astin 20mg (10 tablets)
  {
    id: 'astin-20-10', // [GREEN] Unique ID for Astin 10 tabs strip
    name: 'Astin 20mg 10 F.C. Tab', // [GREEN] Brand name and high strength
    genericName: 'Ebastine', // [GREEN] Long-acting 2nd generation antihistamine
    concentration: '20mg',
    price: 14.4, // [GREEN] Current price for 1 strip (10 tablets)
    matchKeywords: [
        'allergy', 'astin', 'ebastine', 'itching', 'sneezing', 'runny nose', 'urticaria', 'non-drowsy',
        'أستين', 'إيباستين', 'حساسية', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'أرخص مضاد حساسية ٢٠ مجم'
    ],
    usage: 'مضاد حساسية قوي ممتد المفعول بجيل ثاني، يعالج التهاب الأنف التحسسي والأرتيكاريا الجلدية بفاعلية تستمر ٢٤ ساعة بجرعة واحدة.',
    timing: 'مرة يومياً مع الأكل – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'F.C. Tablets',
    
    minAgeMonths: 144, // [GREEN] 12 years and above for the 20mg dose
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: fixed('قرص واحد (٢٠ مجم) مرة واحدة يومياً.\n(للبالغين ≥١٢ سنة)'),
    
    
    warnings: LORATADINE_WARNINGS
  },
  // 52. Cetrak 10mg (20 tablets)
  {
    id: 'cetrak-10-20', // [GREEN] ID for Cetrak 20 tabs pack
    name: 'Cetrak 10mg 20 Tablets', // [GREEN] Brand name and strength
    genericName: 'Cetirizine Hydrochloride', // [GREEN] Potent 2nd generation antihistamine
    concentration: '10mg',
    price: 68, // [GREEN] Current price for 2 strips (20 tablets)
    matchKeywords: [
        'allergy', 'cetrak', 'cetirizine', 'itching', 'sneezing', 'runny nose', 'urticaria',
        'سيتراك', 'سيتريزين', 'حساسية', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'مضاد هيستامين قوي'
    ],
    usage: 'مضاد حساسية قوي جداً وفعال، يستخدم لعلاج أعراض التهاب الأنف التحسسي والأرتيكاريا الجلدية المزمنة والحكة بفاعلية عالية.',
    timing: 'مرة يومياً قبل النوم – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'Tablets',
    
    minAgeMonths: 72, // 6 years and above for 10mg tablets
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    
    calculationRule: cetirizineTabDose,
    
    
    warnings: CETIRIZINE_WARNINGS
  },
  // 53. Fastel 120mg (20 tablets)
  {
    id: 'fastel-120-20', // [GREEN] ID for Fastel 120mg 20 tabs pack
    name: 'Fastel 120mg 20 F.C. Tab', // [GREEN] Brand name and medium strength
    genericName: 'Fexofenadine Hydrochloride', // [GREEN] Non-sedating 3rd generation antihistamine
    concentration: '120mg',
    price: 66, // [GREEN] Current price for 2 strips (20 tablets)
    matchKeywords: [
        'allergy', 'fastel', 'fexofenadine', 'itching', 'sneezing', 'runny nose', 'hay fever', 'non-drowsy',
        'فاستيل', 'فيكسوفينادين', 'حساسية', 'هرش', 'عطس', 'رشح', 'حساسية الانف', 'مضاد هيستامين لا يسبب النعاس'
    ],
    usage: 'فيكسوفينادين (مضاد هيستامين جيل ثالث) لتخفيف أعراض التهاب الأنف التحسسي الموسمي والدائم بفاعلية وآمان.',
    timing: 'مرة يومياً – على معدة فارغة – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'F.C. Tablets',
    
    minAgeMonths: 144, // 12 years and above for 120mg dose
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: fexofenadineTabDose(120),
    
    
    warnings: FEXOFENADINE_WARNINGS
  },
  // 54. Histafree 120mg (10 tablets)
  {
    id: 'histafree-120-10', // [GREEN] ID for Histafree 1 strip pack
    name: 'Histafree 120mg 10 Tablets', // [GREEN] Brand name and strength
    genericName: 'Fexofenadine Hydrochloride', // [GREEN] Non-sedating 3rd generation antihistamine
    concentration: '120mg',
    price: 33, // [GREEN] Current price for 1 strip (10 tablets)
    matchKeywords: [
        'allergy', 'histafree', 'fexofenadine', 'itching', 'sneezing', 'runny nose', 'hay fever', 'non-drowsy',
        'هستافري', 'فيكسوفينادين', 'حساسية', 'هرش', 'عطس', 'رشح', 'حساسية الانف', 'مضاد هيستامين لا يسبب النعاس'
    ],
    usage: 'فيكسوفينادين (مضاد هيستامين جيل ثالث) لتخفيف أعراض التهاب الأنف التحسسي بسهولة واقتصادية.',
    timing: 'مرة يومياً – على معدة فارغة – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'Tablets',
    
    minAgeMonths: 144, // 12 years and above for 120mg dose
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: fexofenadineTabDose(120),
    
    
    warnings: FEXOFENADINE_WARNINGS
  },
  // 55. Levoctivan 5mg (30 tablets)
  {
    id: 'levoctivan-5-30', // [GREEN] ID for Levoctivan 30 tabs pack
    name: 'Levoctivan 5mg 30 F.C. Tab', // [GREEN] Brand name and 30-tablet pack
    genericName: 'Levocetirizine Dihydrochloride', // [GREEN] Potent 3rd generation antihistamine
    concentration: '5mg',
    price: 69, // [GREEN] Current price for 3 strips (30 tablets)
    matchKeywords: [
        'allergy', 'levoctivan', 'levocetirizine', 'itching', 'sneezing', 'runny nose', 'urticaria', 'non-drowsy',
        'ليفوكتيفان أقراص', 'ليفوسيتريزين', 'حساسية', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'مضاد هيستامين قوى'
    ],
    usage: 'ليفوسيتيريزين (مضاد هيستامين جيل ثالث انتقائي) لتخفيف الحكة والعطس والرشح في التهاب الأنف التحسسي والحساسية الجلدية.',
    timing: 'مرة يومياً مساءً – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC,
    form: 'F.C. Tablets',
    
    minAgeMonths: 72, // 6 years and above (half dose), full dose for 12+
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    
    calculationRule: levocetirizineTabDose,
    
    
    warnings: LEVOCETIRIZINE_WARNINGS
  },
  // 56. Triactin 4mg (20 tablets)
  {
    id: 'triactin-4-20', // [GREEN] ID for Triactin 2 strips pack
    name: 'Triactin 4mg 20 Tablets', // [GREEN] Brand name and strength
    genericName: 'Cyproheptadine Hydrochloride', // [GREEN] 1st generation antihistamine & Antiserotonergic
    concentration: '4mg',
    price: 46, // [GREEN] Current price for 20 tablets
    matchKeywords: [
        'allergy', 'triactin', 'cyproheptadine', 'appetite stimulant', 'itching', 'weight gain', 'serotonin antagonist',
        'ترياكتين', 'سيبروهيبتادين', 'حساسية', 'هرش', 'فاتح شهية', 'زيادة وزن', 'علاج النحافة'
    ],
    usage: 'سيبروهيبتادين للحساسية الجلدية/الأنفية وكفاتح للشهية. الجرعة: ٤ مجم × ٢–٣ يومياً للبالغين؛ للأطفال: ٢ مجم × ٢–٣. كفاتح شهية: ٤ مجم × ٣ قبل الأكل لمدة محدودة.',
    timing: 'مرة يومياً ليلاً – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'Tablets',
    
    minAgeMonths: 24, // Not recommended for children under 2 years
    maxAgeMonths: 1200,
    minWeight: 12,
    maxWeight: 250,
    
    calculationRule: fixed('قرص–٢ قرص فموياً ٢–٣ مرات يومياً للبالغين (الأطفال ٧–١٤: قرص ١–٢ مرة، ٢–٦: نصف قرص ١–٢ مرة) – بدون اعتبار للأكل – لمدة ٥–٧ أيام'),
    
    
    warnings: SEDATING_ANTIHISTAMINE_WARNINGS
  },
  // 57. Zylofen 1mg (20 tablets)
  {
    id: 'zylofen-1-20', // [GREEN] ID for Zylofen 20 tablets pack
    name: 'Zylofen 1mg 20 Tablets', // [GREEN] Brand name and concentration
    genericName: 'Ketotifen', // [GREEN] Antihistamine and Mast cell stabilizer
    concentration: '1mg',
    price: 16, // [GREEN] Current price for 2 strips (20 tablets)
    matchKeywords: [
        'allergy', 'zylofen', 'ketotifen', 'asthma prevention', 'itching', 'sneezing', 'urticaria',
        'زيلوفين', 'كيتوتيفين', 'حساسية صدر', 'وقاية من الربو', 'هرش', 'عطس', 'ارخص مضاد هيستامين وقائي'
    ],
    usage: 'كيتوتيفين (مضاد هيستامين + مثبت للخلايا الصارية) يستخدم للوقاية من أزمات الربو الشعبي والحساسية الجلدية والأنفية.',
    timing: 'كل ١٢ ساعة – علاج مستمر',
    category: Category.ANTIHISTAMINIC, 
    form: 'Tablets',
    
    minAgeMonths: 36, // [GREEN] Tablets are generally for children 3 years and above
    maxAgeMonths: 1200,
    minWeight: 14,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 36) {
            return 'قرص واحد (١ مجم) فموياً كل ١٢ ساعة (صباحاً ومساءً) – بدون اعتبار للأكل – علاج وقائي مستمر (٢–٤ أسابيع للنتيجة الكاملة)';
        }
        return 'للأطفال أقل من ٣ سنوات: استخدم الشراب';
    },
    
    
    warnings: [
        'الحمل (Category C): استخدمي عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
        'النعاس الملحوظ في بداية العلاج (تقل مع الاستمرار) - تجنبي القيادة أول الأسبوع.',
        'زيادة الشهية والوزن عند كثير من المرضى - راقبي وزنك.',
        'وقائي فقط: لا يعالج الأزمات الحادة - يجب توفر موسّع للقصبات في المنزل.',
        'الرضاعة: يفرز في الحليب بكميات صغيرة؛ استخدمي عند الضرورة بأقل جرعة، أو أرضعي قبل الجرعة.'
    ]
  },
  // 58. Contrahistadin 20mg (30 tablets)
  {
    id: 'contrahistadin-20-30', // [GREEN] ID for Contrahistadin 30 tabs pack
    name: 'Contrahistadin 20mg 30 Tablets', // [GREEN] Brand name and strength
    genericName: 'Bilastine', // [GREEN] Second-generation non-sedating antihistamine
    concentration: '20mg',
    price: 120, // [GREEN] Current price for 3 strips (30 tablets)
    matchKeywords: [
        'allergy', 'contrahistadin', 'bilastine', 'itching', 'sneezing', 'runny nose', 'urticaria', 'non-drowsy',
        'كنتراهيستادين', 'بيلاستين', 'حساسية', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'مضاد هيستامين قوى'
    ],
    usage: 'بيلاستين (مضاد هيستامين جيل ثالث غير مهدئ) لتخفيف أعراض التهاب الأنف التحسسي والحكة والعطس والرشح والأرتيكاريا الجلدية.',
    timing: 'مرة يومياً – على معدة فارغة – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'Tablets',
    
    minAgeMonths: 144, // 12 years and above for 20mg dose
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: fixed('قرص واحد (٢٠ مجم) فموياً مرة يومياً – على معدة فارغة (ساعة قبل/ساعتين بعد الأكل) – لمدة ٥–٧ أيام'),
    
    
    warnings: FEXOFENADINE_WARNINGS
  },
  // 59. Aerius 5mg (20 tablets)
  {
    id: 'aerius-5-20', // [GREEN] ID for Aerius 20 tabs original pack
    name: 'Aerius 5 mg 20 F.C. Tabs', // [GREEN] Brand name and strength
    genericName: 'Desloratadine', // [GREEN] Original non-sedating 3rd generation antihistamine
    concentration: '5mg',
    price: 118, // [GREEN] Current price for 2 strips (20 tablets)
    matchKeywords: [
        'allergy', 'aerius', 'desloratadine', 'itching', 'sneezing', 'runny nose', 'urticaria', 'non-drowsy', 'original',
        'إيريوس', 'ديسلوراتادين', 'حساسية', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'مضاد هيستامين أصلي'
    ],
    usage: 'ديسلوراتادين (مضاد هيستامين جيل ثالث انتقائي غير مهدئ) - الأصلي والعلامة التجارية الموثوقة - لعلاج أعراض التهاب الأنف التحسسي والأرتيكاريا والحكة.',
    timing: 'مرة يومياً – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'F.C. Tablets',
    
    minAgeMonths: 144, // 12 years and above for tablets
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: desloratadineTabDose,
    
    
    warnings: DESLORATADINE_WARNINGS
  },
  // 60. Contrahistadin 20mg (20 tablets)
  {
    id: 'contrahistadin-20-20', // [GREEN] ID for Contrahistadin 2 strips pack
    name: 'Contrahistadin 20mg 20 Tablets', // [GREEN] Brand name and 20-tab pack size
    genericName: 'Bilastine', // [GREEN] Second-generation non-sedating antihistamine
    concentration: '20mg',
    price: 55, // [GREEN] Current price for 2 strips (20 tablets)
    matchKeywords: [
        'allergy', 'contrahistadin', 'bilastine', 'itching', 'sneezing', 'runny nose', 'urticaria', 'non-drowsy',
        'كنتراهيستادين', 'بيلاستين', 'حساسية', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'مضاد هيستامين قوى'
    ],
    usage: 'بيلاستين (مضاد هيستامين جيل ثالث غير مهدئ) - عبوة صغيرة موفرة - لعلاج أعراض التهاب الأنف التحسسي والأرتيكاريا.',
    timing: 'مرة يومياً – على معدة فارغة – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'Tablets',
    
    minAgeMonths: 144, // 12 years and above for 20mg dose
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: fixed('قرص واحد (٢٠ مجم) فموياً مرة يومياً – على معدة فارغة (ساعة قبل/ساعتين بعد الأكل) – لمدة ٥–٧ أيام'),
    
    
    warnings: FEXOFENADINE_WARNINGS
  },
  // 61. Deslorastamine 0.5mg/ml Syrup (120ml)
  {
    id: 'deslorastamine-syrup-120', // [GREEN] ID for Deslorastamine 120ml syrup
    name: 'Deslorastamine 0.5mg/ml Syrup 120 ml', // [GREEN] Brand name and large volume
    genericName: 'Desloratadine', // [GREEN] Potent non-sedating 3rd generation antihistamine
    concentration: '0.5mg/ml',
    price: 34, // [GREEN] Current price for 120ml bottle
    matchKeywords: [
        'allergy', 'deslorastamine', 'desloratadine syrup', 'itching', 'sneezing', 'runny nose', 'urticaria',
        'ديسلوراستامين شراب', 'ديسلوراتادين شراب', 'حساسية أطفال', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'شراب حساسية موفر'
    ],
    usage: 'ديسلوراتادين (مضاد هيستامين جيل ثالث غير مهدئ) - شراب للأطفال والرضع - لعلاج أعراض التهاب الأنف التحسسي والأرتيكاريا والحكة.',
    timing: 'مرة يومياً – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'Syrup',
    
    minAgeMonths: 12, // [GREEN] Safe for infants starting from 6 months
    maxAgeMonths: 144, 
    minWeight: 7,
    maxWeight: 60,
    
    calculationRule: desloratadineSyrupDose,
    
    
    warnings: DESLORATADINE_WARNINGS
  },
  // 62. Fastel 120mg (10 tablets)
  {
    id: 'fastel-120-10', // [GREEN] ID for Fastel 120mg 1 strip pack
    name: 'Fastel 120mg 10 F.C. Tab', // [GREEN] Brand name and 10-tablet strip
    genericName: 'Fexofenadine Hydrochloride', // [GREEN] Second-generation non-sedating antihistamine
    concentration: '120mg',
    price: 15, // [GREEN] Current price for 1 strip (10 tablets)
    matchKeywords: [
        'allergy', 'fastel', 'fexofenadine', 'itching', 'sneezing', 'runny nose', 'hay fever', 'non-drowsy',
        'فاستيل', 'فيكسوفينادين', 'حساسية', 'هرش', 'عطس', 'رشح', 'حساسية الانف', 'مضاد هيستامين لا يسبب النعاس'
    ],
    usage: 'فيكسوفينادين (مضاد هيستامين جيل ثالث غير مهدئ) - عبوة موفرة (شريط واحد) - لتخفيف أعراض التهاب الأنف التحسسي والحكة والعطس والرشح.',
    timing: 'مرة يومياً – على معدة فارغة – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'F.C. Tablets',
    
    minAgeMonths: 144, // 12 years and above for 120mg dose
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: fexofenadineTabDose(120),
    
    
    warnings: FEXOFENADINE_WARNINGS
  },
  
  // 63. Alerid 10mg (30 tablets)
  {
    id: 'alerid-10-30', // [GREEN] ID for Alerid 30 tabs pack
    name: 'Alerid 10 mg 30 F.C. Tabs', // [GREEN] Brand name and strength
    genericName: 'Cetirizine Hydrochloride', // [GREEN] Potent 2nd generation antihistamine
    concentration: '10mg',
    price: 93, // [GREEN] Current price for 3 strips (30 tablets)
    matchKeywords: [
        'allergy', 'alerid', 'cetirizine', 'itching', 'sneezing', 'runny nose', 'urticaria',
        'أليريد', 'سيتريزين', 'حساسية', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'مضاد هيستامين قوي'
    ],
    usage: 'سيتيريزين (مضاد هيستامين جيل ثاني انتقائي قوي) - صيغة معتمدة - لعلاج أعراض التهاب الأنف التحسسي والأرتيكاريا والحكة المزمنة.',
    timing: 'مرة يومياً قبل النوم – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'F.C. Tablets',
    
    minAgeMonths: 72, // 6 years and above for 10mg tablets
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    
    calculationRule: cetirizineTabDose,
    
    
    warnings: CETIRIZINE_WARNINGS
  },
    // 64. Astin 20mg (20 tablets)
  {
    id: 'astin-20-20', // [GREEN] ID for Astin 20 tabs pack
    name: 'Astin 20 mg 20 F.C. Tabs', // [GREEN] Brand name and full pack size
    genericName: 'Ebastine', // [GREEN] Long-acting 2nd generation antihistamine
    concentration: '20mg',
    price: 46, // [GREEN] Current price for 2 strips (20 tablets)
    matchKeywords: [
        'allergy', 'astin', 'ebastine', 'itching', 'sneezing', 'runny nose', 'urticaria', 'non-drowsy',
        'أستين', 'إيباستين', 'حساسية', 'هرش', 'عطس', 'رشح', 'ارتيكاريا'
    ],
    usage: 'إيباستين (مضاد هيستامين جيل ثاني ممتد المفعول ٢٤ ساعة) - صيغة كاملة ٢٠ قرص - لعلاج التهاب الأنف التحسسي والأرتيكاريا.',
    timing: 'مرة يومياً – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'F.C. Tablets',
    
    minAgeMonths: 144, // 12 years and above for 20mg dose
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: fixed('قرص واحد (٢٠ مجم) مرة واحدة يومياً.\n(للبالغين ≥١٢ سنة)'),
    
    
    warnings: LORATADINE_WARNINGS
  },
  // 65. Ramatrizine 5mg (30 tablets)
  {
    id: 'ramatrizine-5-30', // [GREEN] ID for Ramatrizine 30 tabs pack
    name: 'Ramatrizine 5 mg 30 F.C. Tabs', // [GREEN] Brand name and pack size
    genericName: 'Levocetirizine Dihydrochloride', // [GREEN] Potent 3rd generation antihistamine
    concentration: '5mg',
    price: 96, // [GREEN] Current price for 3 strips (30 tablets)
    matchKeywords: [
        'allergy', 'ramatrizine', 'levocetirizine', 'itching', 'sneezing', 'runny nose', 'urticaria',
        'راماتريزين', 'ليفوسيتريزين', 'حساسية', 'هرش', 'عطس', 'رشح', 'ارتيكاريا', 'مضاد هيستامين متطور'
    ],
    usage: 'ليفوسيتيريزين (مضاد هيستامين جيل ثالث انتقائي ممتد المفعول) - عبوة ٣٠ قرص - لعلاج أعراض التهاب الأنف التحسسي والأرتيكاريا والحكة.',
    timing: 'مرة يومياً قبل النوم – ٥–٧ أيام',
    category: Category.ANTIHISTAMINIC, 
    form: 'F.C. Tablets',
    
    minAgeMonths: 72, // 6 years and above for tablets
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    
    calculationRule: levocetirizineTabDose,
    
    
    warnings: LEVOCETIRIZINE_WARNINGS
  }
];

/* ═══════════════════════════════════════════════════════════════════════════
   APPLY SANITIZATION & EXPORT
   ═══════════════════════════════════════════════════════════════════════════ */

export const ANTIHISTAMINIC_MEDICATIONS: Medication[] = ANTIHISTAMINIC_MEDICATIONS_RAW.map(sanitizeMedication);
