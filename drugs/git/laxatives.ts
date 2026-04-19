import { Medication, Category } from '../../types';

const toAr = (n: number | string) => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
const fixed = (text: string) => (_w: number, _a: number) => text;

/* ═══════════════════════════════════════════════════════════════════════════
   COMMON WARNINGS - تحذيرات ثابتة مشتركة
   ═══════════════════════════════════════════════════════════════════════════ */

const GLYCERIN_SUPP_WARNINGS = [
    'ممنوع للرضع أقل من شهر.',
    'للاستخدام عند اللزوم فقط — الاستخدام المتكرر يسبب اعتماداً.',
    'يُمنع في: نزيف شرجي غير مُفسر، اشتباه انسداد، ألم بطني شديد.',
    'يُحفظ في مكان بارد (الثلاجة في الصيف).'
];

const STIMULANT_LAXATIVE_WARNINGS = [
    'ممنوع للأطفال أقل من ٤ سنوات.',
    'لا يُستخدم أكثر من ٥-٧ أيام متتالية.',
    'يُمنع في: ألم بطن غير مُفسر، غثيان/قيء، اشتباه انسداد.',
    'الاستخدام الطويل يسبب اعتماداً واضطراب أملاح.'
];

const OSMOTIC_LAXATIVE_WARNINGS = [
    'اشرب كمية كافية من الماء مع الجرعة.',
    'قد يسبب غازات/انتفاخ في أول يومين.',
    'يُمنع في: انسداد الأمعاء، حساسية الجالاكتوز.',
    'للاعتلال الكبدي: الجرعة تُحدد حسب الحالة.'
];

const BULK_LAXATIVE_WARNINGS = [
    'يجب شرب كوب ماء كامل بعد الجرعة.',
    'يُؤخذ قبل النوم أو صباحاً.',
    'يُمنع في: صعوبة البلع، انسداد الأمعاء.',
    'قد يسبب انتفاخاً مؤقتاً.'
];

const LACTULOSE_WARNINGS = [
    'يُمنع في: انسداد الأمعاء، حساسية الجالاكتوز.',
    'قد يسبب غازات/انتفاخ في أول يومين — يزول بالاستمرار.',
    'خفّض الجرعة فوراً إذا حدث إسهال.',
    'اشرب ٦-٨ أكواب ماء يومياً.'
];

const PICOSULFATE_WARNINGS = [
    'ممنوع للأطفال أقل من ٤ سنوات.',
    'لا يُستخدم أكثر من ٥-٧ أيام.',
    'يُمنع في: ألم بطن غير مُفسر، غثيان/قيء، جفاف شديد.',
    'الإفراط يسبب اضطراب أملاح (خاصة البوتاسيوم).'
];

const SENNA_WARNINGS = [
    'ممنوع للأطفال أقل من ١٢ سنة.',
    'لا يُستخدم أكثر من ٥-٧ أيام.',
    'قد يسبب مغص/تقلصات.',
    'يُمنع في: انسداد الأمعاء، التهاب الزائدة.'
];

/* ═══════════════════════════════════════════════════════════════════════════
   DOSE CALCULATION HELPERS - دوال حساب الجرعات
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Glycerin Infantile Suppository Dose
 * 0.91g/supp - for infants and children up to 6 years
 */
const glycerinInfantileDose = (_weight: number, ageMonths: number): string => {
    if (ageMonths < 1) return 'ممنوع لحديثي الولادة أقل من شهر.';
    if (ageMonths < 12) return 'لبوسة واحدة عند اللزوم (يمكن نصف لبوسة طولياً للحالات البسيطة).';
    return 'لبوسة واحدة عند اللزوم — مرة يومياً كحد أقصى.';
};

/**
 * Glycerin Adult Suppository Dose
 * 2g/supp - for adults 12+ years
 */
const glycerinAdultDose = (_weight: number, ageMonths: number): string => {
    if (ageMonths < 144) return 'هذا التركيز للبالغين فقط — استخدم نوع (Infantile) للأطفال.';
    return 'لبوسة واحدة عند اللزوم.\nيمكن تكرارها بعد ٣٠ دقيقة إذا لم يحدث إخراج (حد أقصى ٢ لبوسة/يوم).';
};

/**
 * Lactulose Syrup Dose (667mg/ml or 3.35g/5ml)
 * For constipation treatment
 */
const lactuloseDose = (_weight: number, ageMonths: number): string => {
    if (ageMonths < 12) {
        return `٢٫٥ - ٥ مل مرة يومياً.`;
    }
    if (ageMonths < 84) { // 1-6 years
        return `٥ - ١٠ مل مرة يومياً.`;
    }
    if (ageMonths < 168) { // 7-13 years
        return `١٠ - ١٥ مل مرة يومياً.`;
    }
    // Adults
    return `جرعة البداية: ١٥ - ٣٠ مل مرة يومياً.\nجرعة الاستمرار: ١٥ مل يومياً.`;
};

/**
 * Sodium Picosulfate Drops Dose (7.5mg/ml)
 * 15 drops = 1ml = 7.5mg
 */
const picosulfateDropsDose = (_weight: number, ageMonths: number): string => {
    if (ageMonths < 48) return 'ممنوع للأطفال أقل من ٤ سنوات.';
    if (ageMonths < 144) { // 4-11 years
        return `٥ - ١٠ نقاط قبل النوم.\n(المفعول خلال ٨-١٢ ساعة)`;
    }
    // 12+ years and adults
    return `١٠ - ٢٠ نقطة قبل النوم.\n(المفعول خلال ٨-١٢ ساعة)`;
};

/**
 * Sodium Picosulfate Tablet Dose (5mg/tab)
 */
const picosulfateTabDose = (_weight: number, ageMonths: number): string => {
    if (ageMonths < 48) return 'ممنوع للأطفال أقل من ٤ سنوات.';
    if (ageMonths < 144) { // 4-11 years
        return `نصف قرص إلى قرص واحد (٢٫٥ - ٥ مجم) قبل النوم.`;
    }
    // 12+ years and adults
    return `قرص واحد أو قرصين (٥ - ١٠ مجم) قبل النوم.\n(المفعول خلال ٦-١٢ ساعة)`;
};

/**
 * Bisacodyl Suppository Dose
 * Adult: 10mg, Children: 5mg
 */
const bisacodylSuppDose = (_weight: number, ageMonths: number): string => {
    if (ageMonths < 24) return 'ممنوع للأطفال أقل من سنتين.';
    if (ageMonths < 144) { // 2-11 years
        return `لبوسة أطفال (٥ مجم) مرة واحدة عند اللزوم.\n(المفعول خلال ١٥-٦٠ دقيقة)`;
    }
    // 12+ years and adults
    return `لبوسة واحدة (١٠ مجم) عند اللزوم.\n(المفعول خلال ١٥-٦٠ دقيقة)`;
};

/**
 * Bisacodyl Tablet Dose (5mg/tab)
 */
const bisacodylTabDose = (_weight: number, ageMonths: number): string => {
    if (ageMonths < 48) return 'ممنوع للأطفال أقل من ٤ سنوات.';
    if (ageMonths < 144) { // 4-11 years
        return `قرص واحد (٥ مجم) قبل النوم.`;
    }
    // 12+ years and adults
    return `قرص واحد أو قرصين (٥ - ١٠ مجم) قبل النوم.\n(المفعول خلال ٦-١٢ ساعة)`;
};

/**
 * Senna Tablet Dose
 * For adults and children 12+ years
 */
const sennaTabDose = (_weight: number, ageMonths: number): string => {
    if (ageMonths < 144) return 'ممنوع للأطفال أقل من ١٢ سنة.';
    return `١ - ٢ قرص قبل النوم عند اللزوم.\n(المفعول خلال ٦-١٢ ساعة)`;
};

/**
 * Docusate + Senna Combination Dose
 */
const docusateSennaDose = (_weight: number, ageMonths: number): string => {
    if (ageMonths < 144) return 'ممنوع للأطفال أقل من ١٢ سنة.';
    return `قرص أو قرصين قبل النوم عند اللزوم.\n(المفعول خلال ٦-١٢ ساعة)`;
};

/**
 * Prucalopride Tablet Dose (1mg, 2mg)
 */
const prucaloprideDose = (conc: number) => (_weight: number, ageMonths: number): string => {
    if (ageMonths < 216) return 'للبالغين ١٨+ سنة فقط.'; // 18+ years
    if (ageMonths >= 780) { // 65+ years
        return `قرص واحد (${toAr(conc)} مجم) مرة يومياً.\n(كبار السن يبدأون بـ ١ مجم).`;
    }
    return `قرص واحد (${toAr(conc)} مجم) مرة يومياً.`;
};

/* ═══════════════════════════════════════════════════════════════════════════
   TEXT SANITIZERS
   ═══════════════════════════════════════════════════════════════════════════ */

const normalizeSpaces = (s: string) =>
    s.replace(/\s+/g, ' ').replace(/\s+([،.])/g, '$1').trim();

const stripDoctorPhrases = (s: string) => {
    let t = s;
    t = t.replace(/تحت\s*إشراف\s*(?:طبي|الطبيب)/g, '');
    t = t.replace(/(?:إلا\s+)?بتوجيه\s+طبي/g, '');
    t = t.replace(/(?:إلا\s+)?بوصفة\s+طبيب/g, '');
    t = t.replace(/واستشارة\s+طبيب\s+مختص/g, '');
    t = t.replace(/دون\s+استشارة\s+طبية/g, '');
    t = t.replace(/حسب\s+الطبيب/g, '');
    t = t.replace(/يفضّل\s+تجنبه\s+إلا/g, 'يُتجنب إلا للضرورة.');
    t = t.replace(/وتحت\s+إشراف\s+طبي/g, '');
    return normalizeSpaces(t);
};

const sanitizeMedication = (m: Medication): Medication => ({
    ...m,
    timing: stripDoctorPhrases(m.timing),
    warnings: m.warnings.map(w => stripDoctorPhrases(w)).filter(w => w.length > 0),
    calculationRule: (w, a) => stripDoctorPhrases(m.calculationRule(w, a)),
});

const LAXATIVE_MEDS_RAW: Medication[] = [

  // 1. Glycerin Infantile (Glaxo)
  {
    id: 'glycerin-infantile-supp-10',
    name: 'Glycerin Infantile 10 Suppositories (Glaxo)',
    genericName: 'Glycerol (Glycerin)', // [Laxative] Osmotic Laxative
    concentration: '0.91g / Supp',
    price: 19, 
    matchKeywords: [
        'constipation', 'glycerin', 'infantile', 'suppository', 'laxative', 'hard stool',
        'جليسرين', 'لبوس جليسرين', 'أطفال', 'رضع', 'إمساك', 'ملين', 'صعوبة تبرز'
    ],
    usage: 'ملين موضعي يُستخدم للإمساك العارض لتليين البراز داخل المستقيم وتسهيل الإخراج.',
    timing: 'عند اللزوم (ليس للاستخدام اليومي المزمن).',
    category: Category.LAXATIVES, 
    form: 'Suppositories',
    
    minAgeMonths: 1, 
    maxAgeMonths: 72, 
    minWeight: 3,
    maxWeight: 25,
    
    calculationRule: glycerinInfantileDose,
    
    warnings: GLYCERIN_SUPP_WARNINGS
    },

  // 2. Glycerin Adult (Pharco)
  {
    id: 'glycerin-adult-supp-5',
    name: 'Glycerin Adult 5 Suppositories (Pharco)',
    genericName: 'Glycerol (Glycerin)', // [Laxative] Hyperosmotic Laxative
    concentration: '2g / Supp',
    price: 12, 
    matchKeywords: [
        'constipation', 'glycerin adult', 'pharco', 'suppository', 'laxative', 'hard stool', 'fecal impaction',
        'جليسرين كبار', 'لبوس جليسرين', 'إمساك حاد', 'ملين للكبار', 'صعوبة إخراج', 'فاركو'
    ],
    usage: 'ملين موضعي سريع المفعول لتليين البراز داخل المستقيم وتسهيل الإخراج.',
    timing: 'عند اللزوم (عادة ما يبدأ المفعول خلال ١٥ إلى ٣٠ دقيقة).',
    category: Category.LAXATIVES, 
    form: 'Suppositories',
    
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: glycerinAdultDose,
    
    warnings: [
        'يُمنع في: ألم بطن غير مُفسر، غثيان/قيء، اشتباه انسداد.',
        'الاستخدام المتكرر يسبب اعتماداً.',
        'اشرب ٨ أكواب ماء يومياً مع الملينات.',
        'يُحفظ في مكان بارد.'
    ]
    },

  // 3. Glycerin Adult (Glaxo)
  {
    id: 'glycerin-adult-supp-10',
    name: 'Glycerin Adult 10 Suppositories (Glaxo)',
    genericName: 'Glycerol (Glycerin)', 
    concentration: '2.1g / Supp',
    price: 22, 
    matchKeywords: [
        'constipation', 'glycerin adult', 'glaxo', 'gsk', 'suppository', 'laxative', 'hard stool',
        'جليسرين كبار', 'لبوس جليسرين', 'إمساك', 'ملين', 'جلاكسو', 'صعوبة تبرز'
    ],
    usage: 'ملين موضعي (أسموزي/مزلّق) لتليين البراز داخل المستقيم وتسريع الإخراج.',
    timing: 'عند اللزوم، ويفضل استخدامه قبل وقت التبرز المعتاد بـ ٢٠ دقيقة.',
    category: Category.LAXATIVES, 
    form: 'Suppositories',
    
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: glycerinAdultDose,
    
    warnings: [
        'حذر مع البواسير الملتهبة أو الشروخ الشرجية.',
        'أوقفه إذا ظهر دم بالبراز أو استمر الإمساك > أسبوعين.',
        'زيادة الألياف والماء تحسن النتائج.',
        'يُحفظ في مكان بارد — ضعه في الثلاجة إذا أصبح ليناً.'
    ]
    },

  // 4. Glycerin Infantile (Pharco)
  {
    id: 'glycerin-infantile-supp-5',
    name: 'Glycerin Infantile 5 Suppositories (Pharco)',
    genericName: 'Glycerol (Glycerin)', 
    concentration: '0.91g / Supp',
    price: 12, 
    matchKeywords: [
        'constipation', 'glycerin', 'infantile', 'suppository', 'laxative', 'pharco', 'baby constipation',
        'جليسرين', 'لبوس جليسرين', 'أطفال', 'رضع', 'إمساك', 'ملين', 'فاركو', 'حزق'
    ],
    usage: 'ملين موضعي للأطفال يُستخدم للإمساك العارض لتليين البراز داخل المستقيم وتسهيل الإخراج.',
    timing: 'عند اللزوم (عند ملاحظة صعوبة في الإخراج أو تحجر البراز).',
    category: Category.LAXATIVES, 
    form: 'Suppositories',
    
    minAgeMonths: 1, 
    maxAgeMonths: 72, 
    minWeight: 3,
    maxWeight: 25,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 6) { 
            return 'نصف لبوسة (تقطع طولياً) عند اللزوم حسب التشخيص.';
        } else if (ageMonths >= 6 && ageMonths <= 72) {
            return 'قمع واحد (لبوسة كاملة) عند اللزوم.';
        } else {
            return 'للأطفال أكبر من ٦ سنوات أو البالغين، يفضل استخدام تركيز الـ (Adult).';
        }
    },
    
    warnings: [
        'للرضّع أقل من شهر: يفضّل تجنبه إلا حسب التشخيص.',
        'يُمنع في وجود نزيف شرجي غير مُفسّر أو اشتباه انسداد/انحشار برازي.',
        'الاستخدام المتكرر جداً قد يسبب تهيجاً شرجياً أو اعتماداً على التحفيز.',
        'يُحفظ في مكان بارد؛ وفي حالة ليونة اللبوسة يتم وضعها في الثلاجة قبل الاستخدام لتتماسك.'
    ]
  },

  // 5. Glycerol Adult (B.P. 2003)
  {
    id: 'glycerol-adult-supp-6',
    name: 'Glycerol Adult 6 Suppositories (B.P. 2003)',
    genericName: 'Glycerol (Glycerin)', 
    concentration: '2g / Supp',
    price: 3.75, 
    matchKeywords: [
        'constipation', 'glycerol', 'adult', 'cheap laxative', 'suppository', 'fecal impaction',
        'جليسرول', 'جليسرين كبار', 'لبوس إمساك', 'سعره رخيص', 'صيدلية', 'تحاميل شرجية'
    ],
    usage: 'ملين موضعي اقتصادي يعمل على تزييق وتليين الفضلات الصلبة وتحفيز المستقيم لعملية الإخلاء.',
    timing: 'عند اللزوم، ويفضل استخدامه قبل محاولة التبرز بـ ١٥-٣٠ دقيقة.',
    category: Category.LAXATIVES, 
    form: 'Suppositories',
    
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) {
            return 'قمع واحد (لبوسة) عند الحاجة. يمكن تكرارها مرة أخرى إذا لم يحدث إفراغ كامل للأمعاء.';
        } else {
            return 'لا يفضل استخدامه للأطفال تحت ١٢ سنة؛ يرجى استخدام تركيز "Infantile" لتجنب تهيج الأغشية المخاطية.';
        }
    },
    
    warnings: [
        'نظراً لعدم وجود إضافات مللطفة في التركيبات الاقتصادية، قد يشعر المريض بحرقان بسيط مؤقت في منطقة الشرج.',
        'يمنع استخدامه في حالة وجود حساسية للمادة الفعالة أو وجود نزيف شرجي غير معلوم السبب.',
        'إذا كان الإمساك متكرراً أو مصحوباً بألم شديد/قيء/حمّى/نقص وزن: يلزم تقييم طبي.',
        'لا يستخدم كعلاج دائم للإمساك؛ الحل الجذري يكون بتغيير النظام الغذائي وزيادة الألياف.'
    ]
  },

  // 6. Epimag Effervescent Salts
  {
    id: 'epimag-sachets-12',
    name: 'Epimag 12 Effervescent Granules in Sachets',
    genericName: 'Magnesium Citrate', 
    concentration: '2.125g / Sachet',
    price: 26, 
    matchKeywords: [
        'constipation', 'oxalate crystals', 'kidney stones', 'epimag', 'magnesium citrate', 'effervescent',
        'ايبيماج', 'فوار أملاح', 'املاح اوكسالات', 'ملين فوار', 'حصوات الكلى', 'المسالك البولية'
    ],
    usage: 'يُستخدم كملين أسموزي قصير المدى للإمساك العارض، وقد يُستخدم كمكمّل/أملاح حسب التشخيص.',
    timing: 'للإمساك: جرعة واحدة مساءً أو حسب الحاجة (قصير المدى). يُذاب الكيس في نصف كوب ماء ويؤخذ أثناء الفوران.',
    category: Category.LAXATIVES, 
    form: 'Sachets',
    
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) {
            return 'للإمساك: كيس واحد يذاب في نصف كوب ماء مرة واحدة يومياً عند اللزوم (قصير المدى).';
        } else if (ageMonths >= 72 && ageMonths < 144) {
            return 'لا يُستخدم للأطفال ٦–١٢ سنة إلا حسب التشخيص.';
        } else {
            return 'لا يُستخدم للأطفال دون ٦ سنوات إلا حسب التشخيص.';
        }
    },
    
    warnings: [
        'يُمنع/يُتجنب في القصور الكلوي الشديد لتجنب تراكم المغنيسيوم.',
        'قد يسبب إسهالاً أو تقلصات؛ أوقفه وأعد التقييم إذا حدث إسهال شديد أو علامات جفاف.',
        'قد يقلل امتصاص بعض الأدوية (مثل التتراسيكلين/الفلوروكينولون/الحديد/ليفوثيروكسين): افصل 2–4 ساعات.',
        'يُمنع عند الاشتباه في انسداد معوي أو ألم بطني شديد غير مُشخّص.'
    ]
  },

  // 7. Magnesium Citrate (EG) Effervescent 
  {
    id: 'magnesium-citrate-eg-12',
    name: 'Magnesium Citrate 12 Sachets (EG)',
    genericName: 'Magnesium Citrate',
    concentration: '2.125g / Sachet',
    price: 15, // Suggested average for similar local brands
    matchKeywords: [
        'constipation', 'oxalate', 'kidney stones', 'magnesium citrate', 'effervescent',
        'سترات المغنيسيوم', 'فوار أملاح', 'أوكسالات', 'ملين', 'حصوات'
    ],
    usage: 'يُستخدم كملين أسموزي قصير المدى للإمساك العارض، وقد يُستخدم كمكمّل مغنيسيوم حسب التشخيص.',
    timing: 'للإمساك: مرة واحدة يومياً عند اللزوم (قصير المدى).',
    category: Category.LAXATIVES,
    form: 'Sachets',
    
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) {
            return 'كيس واحد يذاب في نصف كوب ماء مرة واحدة يومياً عند اللزوم (قصير المدى).';
        } else {
            return 'لا يُستخدم للأطفال دون توجيه طبي.';
        }
    },
    
    warnings: [
        'يُتجنب في القصور الكلوي الشديد.',
        'قد يقلل امتصاص بعض الأدوية (مثل التتراسيكلين/الفلوروكينولون/الحديد/ليفوثيروكسين): افصل 2–4 ساعات.',
        'لا يستخدم كملين لفترات طويلة دون تقييم طبي لتجنب اضطراب الأملاح.',
        'يحفظ في مكان جاف بعيداً عن الرطوبة.'
    ]
  } ,
 
  // 8. Laxeol PI 5mg
  {
    id: 'laxeol-pi-5-tab-20',
    name: 'Laxeol PI 5mg 20 Tablets',
    genericName: 'Sodium Picosulfate', // [Laxative] Stimulant Laxative
    concentration: '5mg / Tablet',
    price: 24, 
    matchKeywords: [
        'constipation', 'laxeol pi', 'sodium picosulfate', 'stimulant laxative', 'chronic constipation',
        'لاكسيول بي', 'بيكوسلفات الصوديوم', 'ملين', 'إمساك مزمن', 'منشط للأمعاء', 'برشام ملين'
    ],
    usage: 'ملين منشط للأمعاء، يعمل عن طريق تحفيز النهايات العصبية في جدار القولون لزيادة الحركة الدودية وتسهيل عملية الإخراج.',
    timing: 'يفضل تناوله ليلاً قبل النوم (ليحدث المفعول في الصباح التالي، عادة بعد ٦-١٢ ساعة).',
    category: Category.LAXATIVES, 
    form: 'Tablet',
    
    minAgeMonths: 48, // 4 years+
    maxAgeMonths: 1200,
    minWeight: 15,
    maxWeight: 250,
    
    calculationRule: picosulfateTabDose,
    
    warnings: PICOSULFATE_WARNINGS
  },

  // 9. Duphalac 15ml Sachets
  {
    id: 'duphalac-sachets-15-20',
    name: 'Duphalac 667mg/ml Syrup 20 Sachets * 15ml',
    genericName: 'Lactulose', // [Laxative] Osmotic Laxative
    concentration: '667mg / ml (10g per 15ml sachet)',
    price: 60, 
    matchKeywords: [
        'constipation', 'duphalac', 'lactulose', 'osmotic laxative', 'chronic constipation', 'sachet',
        'دوفالاك', 'لاكتولوز', 'ملين أكياس', 'إمساك مزمن', 'شراب أكياس', 'ملين آمن'
    ],
    usage: 'ملين أسموزي يسحب الماء إلى الأمعاء لتليين البراز وتسهيل الإخراج.',
    timing: 'يفضل تناوله في نفس الموعد يومياً (مثلاً بعد الإفطار). يمكن شربه مباشرة أو خلطه مع عصير أو زبادي.',
    category: Category.LAXATIVES, 
    form: 'Sachets',
    
    minAgeMonths: 1, 
    maxAgeMonths: 1200,
    minWeight: 4,
    maxWeight: 250,
    
    calculationRule: lactuloseDose,
    
    warnings: LACTULOSE_WARNINGS
  },

  // 10. Duphalac 200ml Syrup
  {
    id: 'duphalac-syrup-200ml',
    name: 'Duphalac 667mg/ml Syrup 200ml',
    genericName: 'Lactulose', // [Laxative] Osmotic Laxative
    concentration: '667mg / ml',
    price: 143, 
    matchKeywords: [
        'constipation', 'duphalac syrup', 'lactulose', 'osmotic laxative', 'chronic constipation', 'bottled syrup',
        'دوفالاك شراب', 'لاكتولوز', 'شراب ملين', 'إمساك مزمن', 'ملين آمن للحوامل', 'ملين للرضع'
    ],
    usage: 'ملين أسموزي لتليين البراز، وقد يُستخدم بجرعات يحددها الطبيب في حالات اعتلال الدماغ الكبدي.',
    timing: 'يفضل تناوله مرة واحدة يومياً أثناء الإفطار. يمكن تناوله مركزا أو مخففا بالماء أو العصير.',
    category: Category.LAXATIVES, 
    form: 'Syrup',
    
    minAgeMonths: 1, 
    maxAgeMonths: 1200,
    minWeight: 4,
    maxWeight: 250,
    
    calculationRule: lactuloseDose,
    
    warnings: LACTULOSE_WARNINGS
  } ,
  
  // 11. Minalax Tablets
  {
    id: 'minalax-tablets-10',
    name: 'Minalax 10 Tablets',
    genericName: 'Bisacodyl + Dioctyl Sodium Sulfosuccinate (Docusate Sodium)', // [Stimulant + Emollient]
    concentration: '5mg / 100mg',
    price: 20, 
    matchKeywords: [
        'constipation', 'minalax', 'bisacodyl', 'docusate', 'stool softener', 'laxative',
        'مينالاكس', 'بيساكوديل', 'دوكيوسات', 'ملين مزدوج', 'إمساك شديد', 'ملين للبراز الناشف'
    ],
    usage: 'ملين مزدوج المفعول؛ يحتوي على مادة "بيساكوديل" التي تنشط حركة القولون، ومادة "دوكيوسات" التي تعمل كمنعم للبراز لسهولة خروجه دون ألم.',
    timing: 'يفضل تناول القرص قبل النوم ليحدث المفعول في الصباح التالي (بعد ٦-١٠ ساعات).',
    category: Category.LAXATIVES, 
    form: 'Tablet',
    
    minAgeMonths: 144, // 12 years and above
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: bisacodylTabDose,
    
    warnings: STIMULANT_LAXATIVE_WARNINGS
  },

  // 12. Picolax Oral Drops
  {
    id: 'picolax-drops-15ml',
    name: 'Picolax 0.75% Oral Drops 15ml',
    genericName: 'Sodium Picosulfate', // [Laxative] Stimulant Laxative
    concentration: '7.5mg / ml (Each 1ml = 15 drops)',
    price: 24, 
    matchKeywords: [
        'constipation', 'picolax', 'sodium picosulfate', 'laxative drops', 'stimulant',
        'بيكولاكس', 'نقاط ملينة', 'بيكوسلفات الصوديوم', 'إمساك', 'ملين للنقط', 'صعوبة تبرز'
    ],
    usage: 'ملين منشط يعمل على القولون لتحفيز الحركة وتسهيل الإخراج.',
    timing: 'يفضل تناوله ليلاً قبل النوم لضمان حدوث الإخراج في الصباح التالي.',
    category: Category.LAXATIVES, 
    form: 'Drops',
    
    minAgeMonths: 48, // 4 years+
    maxAgeMonths: 1200,
    minWeight: 15,
    maxWeight: 250,
    
    calculationRule: picosulfateDropsDose,
    
    warnings: PICOSULFATE_WARNINGS
  },

  // 13. Laxeol PI 5mg (Bulk Pack)
  {
    id: 'laxeol-pi-5-bulk-250',
    name: 'Laxeol PI 5mg 25 Strips x 10 Tablets',
    genericName: 'Sodium Picosulfate', // [Laxative] Stimulant Laxative
    concentration: '5mg / Tablet',
    price: 300, 
    matchKeywords: [
        'constipation', 'laxeol pi bulk', 'sodium picosulfate', 'stimulant laxative', 'chronic constipation',
        'لاكسيول بي علبة كبيرة', 'بيكوسلفات الصوديوم', 'ملين', 'إمساك مزمن', 'منشط للأمعاء', 'لاكسيول ٢٥ شريط'
    ],
    usage: 'ملين منشط للأمعاء يُستخدم للإمساك العارض قصير المدى. تفريغ الأمعاء قبل الفحوصات يكون وفق بروتوكول طبي.',
    timing: 'يفضل تناوله ليلاً قبل النوم (ليعمل خلال ٦-١٢ ساعة أثناء الصباح).',
    category: Category.LAXATIVES, 
    form: 'Tablet',
    
    minAgeMonths: 48, 
    maxAgeMonths: 1200,
    minWeight: 15,
    maxWeight: 250,
    
    calculationRule: picosulfateTabDose,
    
    warnings: PICOSULFATE_WARNINGS
  },

  // 14. Prucasoft 2mg
  {
    id: 'prucasoft-2mg-14-tab',
    name: 'Prucasoft 2mg 14 F.C. Tablets',
    genericName: 'Prucalopride', // [Gastrointestinal Prokinetic] 5-HT4 Receptor Agonist
    concentration: '2mg / Tablet',
    price: 118, 
    matchKeywords: [
        'chronic constipation', 'prucasoft', 'prucalopride', 'prokinetic', 'motility',
        'بروكاسوفيت', 'بروكالوبريد', 'حركة الأمعاء', 'إمساك مزمن', 'منشط حركة القولون', 'علاج إمساك حديث'
    ],
    usage: 'منشّط لحركة الأمعاء (5-HT4 agonist) يُستخدم للإمساك المزمن لدى البالغين عند عدم الاستجابة للبدائل الأبسط.',
    timing: 'قرص واحد يومياً في أي وقت (مع الأكل أو بدونه).',
    category: Category.LAXATIVES, 
    form: 'Tablet',
    
    minAgeMonths: 216, // 18 years
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: prucaloprideDose(2),
    
    warnings: [
        'قد يسبب صداع/غثيان/إسهال في بداية العلاج.',
        'يُمنع في: انسداد/ثقب الأمعاء، التهابات شديدة.',
        'قصور كلوي شديد: قد تُخفض الجرعة.',
        'للبالغين ١٨+ سنة فقط.'
    ]
  },

  // 15. Glycerin Infantile (El-Nile)
  {
    id: 'glycerin-infantile-supp-6-nile',
    name: 'Glycerin Infantile 6 Suppositories (El-Nile)',
    genericName: 'Glycerol (Glycerin)', // [Laxative] Osmotic Laxative
    concentration: '0.91g / Supp',
    price: 11, 
    matchKeywords: [
        'constipation', 'glycerin', 'infantile', 'suppository', 'laxative', 'el-nile',
        'جليسرين النيل', 'لبوس جليسرين أطفال', 'إمساك رضع', 'ملين اطفال', 'شركة النيل'
    ],
    usage: 'ملين موضعي للأطفال يُستخدم للإمساك العارض لتليين البراز داخل المستقيم وتسهيل الإخراج.',
    timing: 'عند اللزوم (عند وجود إمساك أو صعوبة في التبرز).',
    category: Category.LAXATIVES, 
    form: 'Suppositories',
    
    minAgeMonths: 1, 
    maxAgeMonths: 72, 
    minWeight: 3,
    maxWeight: 25,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 12) { 
            return 'قمع واحد (لبوسة) عند اللزوم للرضع. يمكن للأم تقسيم اللبوسة طولياً في الشهور الأولى.';
        } else { 
            return 'قمع واحد (لبوسة) يومياً عند الحاجة للأطفال من سنة إلى ٦ سنوات.';
        }
    },
    
    warnings: [
        'للرضّع أقل من شهر: يفضّل تجنبه إلا حسب التشخيص.',
        'لا ينصح باستخدامه بشكل يومي ومستمر؛ إذا كان الإمساك متكرراً يلزم تقييم السبب.',
        'أوقفه وأعد التقييم إذا وُجد دم بالبراز أو ألم شديد أو قيء.',
        'يُحفظ في مكان بارد وجاف؛ وفي الصيف يفضل وضعه في الثلاجة للحفاظ على تماسك القمع.'
    ]
  },
  
  // 16. Glycerine 1.61gm 10 Adult Suppositories
  {
    id: 'glycerine-adult-supp-10-low-price',
    name: 'Glycerine 1.61gm 10 Adult Suppositories',
    genericName: 'Glycerol (Glycerin)', // [Laxative] Osmotic Laxative
    concentration: '1.61g / Supp',
    price: 5, 
    matchKeywords: [
        'constipation', 'glycerine adult', 'suppository', 'laxative', 'hard stool', 'cheap glycerin',
        'جليسرين كبار', 'لبوس جليسرين كبار', 'إمساك', 'ملين رخيص', 'صعوبة تبرز', 'لبوس ٥ جنيه'
    ],
    usage: 'ملين موضعي يعمل على تزييت وتليين الكتلة البرازية وتحفيز حركة الأمعاء في منطقة المستقيم لتسهيل عملية الإخراج.',
    timing: 'عند اللزوم (المفعول يبدأ عادة خلال ١٥-٤٥ دقيقة من الاستخدام).',
    category: Category.LAXATIVES, 
    form: 'Suppositories',
    
    minAgeMonths: 144, // 12 years and above
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: glycerinAdultDose,
    
    warnings: [
        'يُمنع في: ألم بطن حاد، غثيان/قيء غير مُفسر.',
        'الاستخدام المتكرر يسبب تهيجاً واعتماداً.',
        'يُحفظ في مكان بارد (< ٢٥°م).',
        'زيادة الماء والألياف أفضل من الاعتماد على الملينات.'
    ]
  },

  // 17. Agiolax 12 Sachets
  {
    id: 'agiolax-sachets-12',
    name: 'Agiolax 12 Granules in Sachets',
    genericName: 'Plantago Ovata (Psyllium Husk) + Senna Fruit', // [Bulk-forming + Stimulant Laxative]
    concentration: '5g per Sachet',
    price: 100, 
    matchKeywords: [
        'constipation', 'agiolax', 'herbal laxative', 'psyllium', 'senna', 'natural laxative',
        'اجيولاكس', 'أجيولاكس أكياس', 'ملين طبيعي', 'ألياف', 'سينا', 'إمساك مزمن', 'منظم حركة الأمعاء'
    ],
    usage: 'مزيج ألياف (psyllium) مع مُلين منشّط (senna) يُستخدم للإمساك عندما لا تكفي الألياف وحدها، ويفضل لفترة قصيرة.',
    timing: 'يفضل تناوله في المساء (بعد العشاء). يبدأ المفعول عادة خلال ٨-١٢ ساعة.',
    category: Category.LAXATIVES, 
    form: 'Sachets',
    
    minAgeMonths: 144, // 12 years and above
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: fixed('كيس واحد بعد العشاء.\n(حالات شديدة: كيس صباحاً + كيس مساءً).\nالمفعول خلال ٨-١٢ ساعة.'),
    
    warnings: [
        'اشرب سوائل كافية لتجنب انسداد الأمعاء.',
        'يُمنع في: انسداد معوي، ضيق المريء، التهابات حادة.',
        'لا يُستخدم > ٧ أيام بسبب السنا.',
        'ممنوع للأطفال أقل من ١٢ سنة.'
    ]
  },

  // 18. Bowelocare Oral Drops
  {
    id: 'bowelocare-drops-15ml',
    name: 'Bowelocare 0.75% Oral Drops 15ml',
    genericName: 'Sodium Picosulfate', // [Laxative] Stimulant Laxative
    concentration: '7.5mg / ml',
    price: 24, 
    matchKeywords: [
        'constipation', 'bowelocare', 'sodium picosulfate', 'laxative drops', 'bowel care',
        'باولو كير', 'باولوكير', 'نقاط ملينة', 'بيكوسلفات الصوديوم', 'إمساك', 'ملين نقط'
    ],
    usage: 'ملين منشط يعمل على القولون لعلاج الإمساك قصير المدى.',
    timing: 'يفضل تناوله ليلاً (قبل النوم) ليبدأ مفعوله في الصباح بعد حوالي ٨-١٢ ساعة.',
    category: Category.LAXATIVES, 
    form: 'Drops',
    
    minAgeMonths: 48, // 4 years+
    maxAgeMonths: 1200,
    minWeight: 15,
    maxWeight: 250,
    
    calculationRule: picosulfateDropsDose,
    
    warnings: PICOSULFATE_WARNINGS
  },

  // 19. Laxolac 120ml Syrup
  {
    id: 'laxolac-syrup-120ml',
    name: 'Laxolac 3.35g/5ml Syrup 120ml',
    genericName: 'Lactulose', // [Laxative] Osmotic Laxative
    concentration: '3.35g / 5ml',
    price: 83, 
    matchKeywords: [
        'constipation', 'laxolac', 'lactulose syrup', 'osmotic laxative', 'chronic constipation',
        'لاكسولاك', 'لاكتولوز شراب', 'ملين آمن', 'إمساك مزمن', 'شراب للإمساك', 'ملين للحوامل'
    ],
    usage: 'ملين اسموزي يعمل على سحب الماء إلى الأمعاء لزيادة حجم وتليين البراز، مما يحفز الحركة الطبيعية للقولون.',
    timing: 'يفضل تناوله مرة واحدة يومياً بعد الإفطار مباشرة. تظهر النتائج عادة خلال ٢٤ إلى ٤٨ ساعة.',
    category: Category.LAXATIVES, 
    form: 'Syrup',
    
    minAgeMonths: 1, 
    maxAgeMonths: 1200,
    minWeight: 4,
    maxWeight: 250,
    
    calculationRule: lactuloseDose,
    
    warnings: LACTULOSE_WARNINGS
  },

  // 20. Laxolac 300ml Syrup
  {
    id: 'laxolac-syrup-300ml',
    name: 'Laxolac 3.35g/5ml Syrup 300ml',
    genericName: 'Lactulose', // [Laxative] Osmotic Laxative
    concentration: '3.35g / 5ml',
    price: 40, 
    matchKeywords: [
        'constipation', 'laxolac 300', 'lactulose syrup', 'osmotic laxative', 'chronic constipation',
        'لاكسولاك كبير', 'لاكتولوز ٣٠٠ مل', 'ملين آمن', 'إمساك مزمن', 'شراب عائلي', 'ملين كبدي'
    ],
    usage: 'ملين أسموزي لتليين البراز، وقد يُستخدم بجرعات يحددها الطبيب في حالات اعتلال الدماغ الكبدي.',
    timing: 'مرة واحدة يومياً (يفضل بعد الإفطار). المفعول يبدأ خلال ٢٤-٤٨ ساعة.',
    category: Category.LAXATIVES, 
    form: 'Syrup',
    
    minAgeMonths: 1, 
    maxAgeMonths: 1200,
    minWeight: 4,
    maxWeight: 250,
    
    calculationRule: lactuloseDose,
    
    warnings: LACTULOSE_WARNINGS
  },
  // 21. Purgaton 20mg Tablets
  {
    id: 'purgaton-20mg-30-tab',
    name: 'Purgaton 20mg 30 Tablets',
    genericName: 'Senna Glycosides (Sennosides)', // [Laxative] Stimulant Laxative
    concentration: '20mg / Tablet',
    price: 51, 
    matchKeywords: [
        'constipation', 'purgaton', 'senna', 'sennosides', 'herbal laxative', 'stimulant',
        'بورجاتون', 'سنا', 'سينوزايد', 'ملين نباتي', 'إمساك', 'أقراص ملينة', 'منشط أمعاء'
    ],
    usage: 'ملين منشط (سنا) للإمساك العارض قصير المدى.',
    timing: 'يفضل تناوله ليلاً قبل النوم (ليعطي مفعولاً خلال ٦-١٢ ساعة، أي عند الاستيقاظ صباحاً).',
    category: Category.LAXATIVES, 
    form: 'Tablet',
    
    minAgeMonths: 144, // 12 years and above
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: sennaTabDose,
    
    warnings: SENNA_WARNINGS
  },

  // 22. Egycusate Plus Tablets
  {
    id: 'egycusate-plus-30-tab',
    name: 'Egycusate Plus 30 F.C. Tablets',
    genericName: 'Docusate Sodium + Sennosides', // [Stool Softener + Stimulant Laxative]
    concentration: '100mg / 8.6mg',
    price: 48, 
    matchKeywords: [
        'constipation', 'egycusate plus', 'docusate', 'senna', 'stool softener', 'dual action laxative',
        'إيجيكوسات بلس', 'دوكيوسات', 'سنا', 'ملين مزدوج', 'إمساك شديد', 'منعم براز', 'ايجيكوسات'
    ],
    usage: 'ملين مزدوج المفعول؛ يحتوي على "دوكيوسات" التي تعمل كمنعم للبراز عبر زيادة محتواه المائي، و"السنا" التي تنشط حركة القولون لدفع الفضلات.',
    timing: 'يفضل تناوله ليلاً قبل النوم (المفعول يظهر عادة خلال ٦-١٢ ساعة).',
    category: Category.LAXATIVES, 
    form: 'Tablet',
    
    minAgeMonths: 144, // 12 years and above
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: docusateSennaDose,
    
    warnings: SENNA_WARNINGS
  },

  // 23. Prucasoft 1mg
  {
    id: 'prucasoft-1mg-14-tab',
    name: 'Prucasoft 1mg 14 F.C. Tablets',
    genericName: 'Prucalopride', // [Gastrointestinal Prokinetic] 5-HT4 Receptor Agonist
    concentration: '1mg / Tablet',
    price: 118, 
    matchKeywords: [
        'chronic constipation', 'prucasoft 1mg', 'prucalopride', 'prokinetic', 'motility',
        'بروكاسوفيت ١ مجم', 'بروكالوبريد', 'حركة الأمعاء', 'إمساك مزمن', 'منشط حركة القولون', 'علاج إمساك حديث'
    ],
    usage: 'محفز انتقائي لمستقبلات السيروتونين يعمل على تنشيط حركة الأمعاء الدودية؛ مخصص لعلاج حالات الإمساك المزمن التي لا تستجيب للملينات العادية.',
    timing: 'قرص واحد يومياً في أي وقت، مع الطعام أو بدونه.',
    category: Category.LAXATIVES, 
    form: 'Tablet',
    
    minAgeMonths: 216, // 18 years (Adults only)
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216) { 
            return 'قرص واحد (١ مجم) مرة واحدة يومياً. يستخدم هذا التركيز غالباً كجرعة بداية لكبار السن (فوق ٦٥ سنة) أو مرضى الكلى والكبد.';
        } else {
            return 'لا يستخدم للأطفال أو المراهقين دون سن ١٨ عاماً.';
        }
    },
    
    warnings: [
        'الأعراض الجانبية الأكثر شيوعاً هي الصداع المؤقت، الغثيان، والإسهال عند بداية العلاج.',
        'يُمنع استخدامه في حالات انسداد أو ثقب الأمعاء أو التهابات الأمعاء الشديدة مثل مرض كراون.',
        'يجب تعديل الجرعة أو الحذر الشديد لدى مرضى القصور الكلوي الحاد.',
        'لا ينصح باستخدامه أثناء فترة الحمل أو الرضاعة الطبيعية.'
    ]
  },
  // 24. Bilino 15ml Oral Drops
  {
    id: 'bilino-drops-15ml',
    name: 'Bilino 15ml Oral Drops',
    genericName: 'Lactulose', // [Laxative] Osmotic Laxative
    concentration: 'Concentrated Lactulose Drops',
    price: 69, 
    matchKeywords: [
        'constipation', 'bilino', 'lactulose drops', 'osmotic laxative', 'infant constipation',
        'بيلينو', 'بيلينو نقط', 'لاكتولوز نقط', 'ملين للرضع', 'إمساك الأطفال', 'نقط ملينة'
    ],
    usage: 'ملين أسموزي (لاكتولوز) لتليين البراز وتسهيل الإخراج.',
    timing: 'يفضل تناوله مرة واحدة يومياً، ويفضل أن يكون ذلك في نفس الموعد (مثلاً صباحاً بعد الرضاعة أو الإفطار).',
    category: Category.LAXATIVES,
    form: 'Drops',
    
    minAgeMonths: 1,
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 12) { 
            return 'للرضع: يحدد الطبيب الجرعة.';
        } else if (ageMonths >= 12 && ageMonths < 72) {
            return 'تحدد الجرعة حسب العمر وشدة الإمساك (اتبع تعليمات العبوة أو التشخيص).';
        } else {
            return 'تحدد الجرعة حسب الاستجابة (اتبع تعليمات العبوة أو التشخيص).';
        }
    },
    
    warnings: [
        'قد يسبب غازات بسيطة في بداية الاستخدام، وهذا مؤشر على استجابة الأمعاء للدواء.',
        'يُمنع استخدامه في حالات انسداد الأمعاء أو الحساسية تجاه سكر الجالاكتوز.',
        'يُحفظ في درجة حرارة الغرفة (بعيداً عن الثلاجة) لتجنب تبلور السكر.',
        'في حالة حدوث إسهال، يجب تقليل الجرعة فوراً.'
    ]
  },

  // 25. Enemax Enema 120ml
  {
    id: 'enemax-enema-120ml',
    name: 'Enemax Enema 120ml',
    genericName: 'Sodium Phosphate (Monobasic + Dibasic)', // [Saline Laxative]
    concentration: '19g / 7g per 118ml',
    price: 40, 
    matchKeywords: [
        'constipation', 'enemax', 'enema', 'sodium phosphate', 'saline laxative', 'rapid relief',
        'إنماكس', 'حقنة شرجية', 'صوديوم فوسفات', 'إمساك حاد', 'تفريغ القولون', 'تسهيل إخراج سريع'
    ],
    usage: 'حقنة شرجية ملحية تُستخدم للإمساك الشديد/الانحشار البرازي كخيار إسعافي قصير المدى أو ضمن بروتوكول التحضير للفحوصات.',
    timing: 'عند اللزوم فقط (ليس للاستخدام المتكرر).',
    category: Category.LAXATIVES, 
    form: 'Solution',
    
    minAgeMonths: 144, // 12 years and above
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) {
            return 'عبوة واحدة (١٢٠ مل) عن طريق الشرج مرة واحدة يومياً عند الحاجة القصوى.';
        } else {
            return 'لا تستخدم للأطفال دون سن ١٢ عاماً؛ يفضل استخدام الأنواع المخصصة للأطفال.';
        }
    },
    
    warnings: [
        'قد يسبب اضطراباً خطيراً في الأملاح (فوسفات/كالسيوم/صوديوم) خصوصاً مع الجفاف.',
        'يُمنع/يُتجنب في القصور الكلوي، فشل القلب، الجفاف، أو كبار السن دون متابعة.',
        'لا تكرر الجرعة خلال 24 ساعة، ولا تستخدمه بشكل متكرر دون تقييم طبي.',
        'يُمنع في الاشتباه بانسداد/ثقب معوي أو ألم بطني شديد غير مُشخّص.'
    ]
  },

  // 26. Amiprostone 24mcg
    {
    id: 'amiprostone-24-caps-20',
    name: 'Amiprostone 24mcg 20 Capsules',
    genericName: 'Lubiprostone', // [Chloride Channel Activator]
    concentration: '24mcg / Capsule',
    price: 106, 
    matchKeywords: [
        'chronic constipation', 'amiprostone', 'lubiprostone', 'cic', 'ibs-c', 'chloride channel',
        'أميبروستون', 'لوبيبروستون', 'إمساك مزمن', 'متلازمة القولون العصبي المصحوبة بإمساك', 'كبسولات ملينة متطورة'
    ],
    usage: 'منشّط لقنوات الكلوريد يزيد إفراز السوائل داخل الأمعاء ويساعد على تليين البراز؛ يُستخدم للإمساك المزمن مجهول السبب لدى البالغين وقد يُستخدم للإمساك المصاحب للمواد الأفيونية حسب التشخيص.',
    timing: 'كبسولة واحدة مرتين يومياً (صباحاً ومساءً) مع الطعام والماء.',
    category: Category.LAXATIVES, 
    form: 'Capsule',
    
    minAgeMonths: 216, // 18 years
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216) {
            return 'كبسولة واحدة (٢٤ ميكروجرام) مرتين يومياً للبالغين.';
        } else {
            return 'لا ينصح باستخدامه للأطفال والمراهقين دون سن ١٨ عاماً.';
        }
    },
    
    warnings: [
        'الغثيان عرض جانبي شائع؛ تناول الكبسولة مع الطعام يقلل من هذا الشعور.',
        'يُمنع استخدامه لمرضى انسداد الأمعاء المعروف أو المشتبه به.',
        'قد يسبب ضيقاً/شدّاً عابراً بالصدر أو دوخة بعد الجرعة الأولى لدى بعض المرضى.',
        'الحمل/الرضاعة: لا يُنصح به عادةً. أوقفه وأعد التقييم إذا حدث إسهال شديد.'
    ]
  },
  // 27. Constipride 2mg 28 Tablets
  {
    id: 'constipride-2mg-28-tab',
    name: 'Constipride 2mg 28 F.C. Tablets',
    genericName: 'Prucalopride', // [Gastrointestinal Prokinetic]
    concentration: '2mg / Tablet',
    price: 185.75, 
    matchKeywords: [
        'chronic constipation', 'constipride', 'prucalopride', 'prokinetic', 'bowel movement',
        'كونستبرايد', 'بروكالوبريد', 'حركة القولون', 'إمساك مزمن', 'منشط حركة الأمعاء', 'كونستبريد'
    ],
    usage: 'منشّط لحركة الأمعاء (5-HT4 agonist) يُستخدم للإمساك المزمن لدى البالغين عند عدم الاستجابة للبدائل الأبسط.',
    timing: 'قرص واحد يومياً في أي وقت من اليوم، مع الطعام أو بدونه.',
    category: Category.LAXATIVES, 
    form: 'Tablet',
    
    minAgeMonths: 216, // 18 years
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 216) {
            return 'يجب عدم استخدامه في الأطفال والمراهقين دون سن ١٨ عاماً.';
        }
        if (ageMonths >= 216 && ageMonths <= 780) { // Adult 18-65y
            return 'الجرعة الموصى بها للبالغين هي ٢ ملغ (قرص واحد) مرة واحدة يومياً.';
        }
        if (ageMonths > 780) { // Elderly >65y
            return 'قد يبدأ الطبيب بجرعة ١ ملغ مرة واحدة يومياً لكبار السن أو حسب الحالة.';
        }
        return 'قرص واحد (٢ مجم) مرة واحدة يومياً، وقد تُخفض الجرعة في القصور الكلوي الشديد حسب التشخيص والتحاليل.';
    },
    
    warnings: [
        'قد يسبب صداعاً أو غثياناً أو إسهالاً في بداية العلاج.',
        'يُمنع في انسداد/ثقب الأمعاء أو التهابات الأمعاء الشديدة.',
        'قصور كلوي شديد: قد يلزم خفض الجرعة؛ اتبع التشخيص والتحاليل.',
        'أعد التقييم عند تغيرات مزاجية شديدة أو أفكار إيذاء النفس. الحمل/الرضاعة: لا يُنصح به عادةً.'
    ]
  },

  // 28. Movicol 20 Sachets
  {
    id: 'movicol-20-sachets',
    name: 'Movicol 20 Sachets',
    genericName: 'Macrogol 3350 + Electrolytes', // [Osmotic Laxative]
    concentration: '13.125g Macrogol per Sachet',
    price: 273, 
    matchKeywords: [
        'constipation', 'movicol', 'macrogol', 'osmotic', 'stool softener',
        'موفيكول', 'ماكروجول', 'أكياس ملينة', 'إمساك مزمن', 'ملين آمن', 'تنظيف القولون'
    ],
    usage: 'ملين أسموزي (Macrogol) يربط الماء بالبراز لتليينه وتسهيل الإخراج.',
    timing: 'يمكن تناوله في أي وقت. في حالات الإمساك المزمن يفضل استخدامه يومياً بانتظام.',
    category: Category.LAXATIVES, 
    form: 'Sachets',
    
    minAgeMonths: 144, // 12 years and above
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) {
            return 'للإمساك المزمن: كيس واحد ١-٣ مرات يومياً حسب الشدة. للاستمرار: ١-٢ كيس يومياً.';
        } else {
            return 'هذا النوع مخصص للكبار؛ للأطفال يرجى استخدام موفيكول أطفال.';
        }
    },
    
    warnings: [
        'يمنع في حالات انسداد الأمعاء أو ثقب جدار الأمعاء.',
        'قد يسبب انتفاخاً/غثياناً/إسهالاً حسب الجرعة.',
        'أعد التقييم لمرضى القلب والكلى عند استخدام جرعات عالية جداً.'
    ]
  },

  // 29. Movicol Paediatric 30 Sachets
  {
    id: 'movicol-paediatric-30-sachets',
    name: 'Movicol Paediatric 30 Sachets',
    genericName: 'Macrogol 3350 + Electrolytes', // [Pediatric Osmotic Laxative]
    concentration: '6.563g Macrogol per Sachet',
    price: 221, 
    matchKeywords: [
        'constipation children', 'movicol paediatric', 'macrogol kids', 'infant constipation',
        'موفيكول أطفال', 'ماكروجول أطفال', 'إمساك الرضع', 'ملين آمن للأطفال', 'أكياس إمساك أطفال'
    ],
    usage: 'ملين أسموزي للأطفال لتليين البراز وتسهيل الإخراج (قد يُستخدم ضمن خطة علاج الإمساك المزمن عند الأطفال حسب التشخيص).',
    timing: 'مرة واحدة يومياً، أو مقسمة حسب تعليمات الطبيب.',
    category: Category.LAXATIVES,
    form: 'Sachets',
    
    minAgeMonths: 24, // 2 years+
    maxAgeMonths: 144,
    minWeight: 10,
    maxWeight: 40,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 24 && ageMonths < 72) { // 2-6 years
            return 'كيس واحد يومياً كجرعة بداية.';
        } else if (ageMonths >= 72 && ageMonths <= 144) { // 6-11 years
            return 'كيسين يومياً (كيس صباحاً وكيس مساءً).';
        } else {
            return 'أعد التقييم لتحديد الجرعة المناسبة لعمر الطفل.';
        }
    },
    
    warnings: [
        'قد يسبب إسهالاً إذا زادت الجرعة؛ عدّل الجرعة حسب الاستجابة.',
        'تأكد من شرب الطفل سوائل كافية.',
        'يُمنع في حالات انسداد الأمعاء أو ألم بطني شديد غير مُشخّص.',
        'إذا استمر الإمساك أو حدث تبرز دموي/قيء/حمّى: أعد التقييم.'
    ]
  },

    // 30. Egycusate 20mg/5ml Syrup 100ml
    {
        id: 'egycusate-syrup-100ml',
    name: 'Egycusate 20mg/5ml Syrup 100ml',
    genericName: 'Docusate Sodium', // [Stool Softener]
    concentration: '20mg / 5ml',
    price: 25, 
    matchKeywords: [
        'constipation', 'egycusate syrup', 'docusate sodium', 'stool softener', 'pediatric laxative',
        'إيجيكوسات شراب', 'دوكيوسات صوديوم', 'منعم براز', 'ملين للأطفال', 'شراب للإمساك'
    ],
    usage: 'منعم للبراز (Docusate) يساعد على دخول الماء إلى البراز لتسهيل خروجه خاصةً مع البواسير/الشرخ.',
    timing: 'يفضل تناوله ليلاً قبل النوم، أو مقسماً على جرعات خلال اليوم.',
    category: Category.LAXATIVES, 
    form: 'Syrup',
    
    minAgeMonths: 6, 
    maxAgeMonths: 1200,
    minWeight: 7,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) {
            return '١٠ مل إلى ٣٠ مل (٢-٦ ملاعق صغيرة) يومياً.';
        } else if (ageMonths >= 72 && ageMonths < 144) {
            return '٥ مل إلى ١٥ مل يومياً.';
        } else if (ageMonths >= 24 && ageMonths < 72) {
            return '٥ مل (ملعقة صغيرة) يومياً.';
        } else {
            return 'للأطفال تحت سنتين: ٢.٥ مل يومياً أو حسب التشخيص والعمر.';
        }
    },
    
    warnings: [
        'لا يستخدم مع زيت البارافين (الزيوت المعدنية).',
        'يُمنع في الاشتباه بانسداد/انحشار برازي شديد أو ألم بطني غير مُشخّص.',
        'إذا احتجته لفترة طويلة أو لم يتحسن الإمساك خلال أيام، يلزم تقييم السبب.',
        'توقف عن الاستخدام في حال ظهور طفح جلدي أو إسهال شديد.'
    ]
  },
  
  // 31. Glycerol Paediatric (Economic Pack)
  {
    id: 'glycerol-paed-supp-6-cheap',
    name: 'Glycerol Paediatric 6 Suppositories B.P. 2003',
    genericName: 'Glycerol (Glycerin)', // [Laxative] Osmotic Laxative
    concentration: '0.91g / Supp',
    price: 3.75, 
    matchKeywords: [
        'constipation', 'glycerol', 'paediatric', 'suppository', 'laxative', 'cheap',
        'جليسرين أطفال', 'لبوس جليسرين رخيص', 'إمساك رضع', 'ملين أطفال', 'تحاميل جليسرين', 'لبوس ٣ جنيه'
    ],
    usage: 'ملين موضعي لطيف يسحب الماء للمستقيم لتليين البراز وتحفيز الإخراج لدى الأطفال والرضع دون الحاجة لأدوية بالفم.',
    timing: 'عند اللزوم (المفعول سريع خلال ١٥-٣٠ دقيقة).',
    category: Category.LAXATIVES, 
    form: 'Suppositories',
    
    minAgeMonths: 1, 
    maxAgeMonths: 72, 
    minWeight: 3,
    maxWeight: 25,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 12) { 
            return 'قمع واحد (لبوسة) عند اللزوم للرضع. يمكن تقسيمها طولياً في الشهور الأولى.';
        } else { 
            return 'قمع واحد (لبوسة) يومياً عند الحاجة للأطفال من سنة إلى ٦ سنوات.';
        }
    },
    
    warnings: [
        'للرضّع أقل من شهر: يفضّل تجنبه إلا حسب التشخيص.',
        'لا يُستخدم بشكل يومي مزمن؛ إذا كان الإمساك متكرراً يلزم تقييم السبب.',
        'يُحفظ في مكان بارد (أقل من ٢٥ درجة مئوية).',
        'يُمنع في وجود نزيف شرجي غير مُفسّر أو شروخ شديدة مؤلمة.'
    ]
  },

  // 32. Lactulose HEK 300ml Syrup
  {
    id: 'lactulose-hek-300ml',
    name: 'Lactulose HEK 65% Syrup 300ml',
    genericName: 'Lactulose', // [Laxative] Osmotic Laxative
    concentration: '65% (Equivalent to 3.35g/5ml)',
    price: 92, 
    matchKeywords: [
        'constipation', 'lactulose hek', 'hek syrup', 'osmotic laxative', 'chronic constipation',
        'لاكتولوز هيك', 'هيك شراب', 'لاكتولوز ٣٠٠ مل', 'إمساك مزمن', 'ملين كبدي', 'ملين آمن'
    ],
    usage: 'ملين اسموزي عالي الجودة لتليين الفضلات، ويستخدم أيضاً في حالات الكبد لتقليل مستويات الأمونيا في الدم.',
    timing: 'يفضل تناوله كجرعة واحدة يومياً بعد الإفطار. يبدأ المفعول خلال ٢٤-٤٨ ساعة.',
    category: Category.LAXATIVES, 
    form: 'Syrup',
    
    minAgeMonths: 1, 
    maxAgeMonths: 1200,
    minWeight: 4,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 168) { // Adults
            return 'جرعة البداية ١٥-٤٥ مل (١-٣ ملاعق كبيرة) يومياً، ثم تثبت على ١٥-٣٠ مل.';
        } else if (ageMonths >= 84 && ageMonths < 168) { // 7-14 years
            return '١٠ - ١٥ مل يومياً.';
        } else if (ageMonths >= 12 && ageMonths < 84) { // 1-6 years
            return '٥ - ١٠ مل يومياً.';
        } else { // Infants
            return '٢.٥ مل إلى ٥ مل يومياً حسب التشخيص.';
        }
    },
    
    warnings: [
        'قد يسبب غازات مؤقتة في بداية العلاج تزول مع الاستمرار.',
        'يُمنع لمرضى انسداد الأمعاء أو حساسية سكر الجالاكتوز.',
        'يجب الحذر لمرضى السكري في حالة الجرعات العالية لفترات طويلة.',
        'في حالة حدوث إسهال، يجب تقليل الجرعة فوراً.'
    ]
  },

  // 33. Nassar 8 Tablets (1 Strip)
  {
    id: 'nassar-8-tabs-1-strip',
    name: 'Nassar 8 Tablets (1 Strip)',
    genericName: 'Sennosides + Aloe + Belladonna', // [Herbal Stimulant Laxative]
    concentration: 'Standard Herbal Blend',
    price: 13, 
    matchKeywords: [
        'constipation', 'nassar tablets', 'herbal laxative', 'senna', 'aloe',
        'أقراص نصار', 'برشام نصار', 'ملين نصار', 'ملين نباتي', 'إمساك', 'شريط نصار'
    ],
    usage: 'ملين نباتي منشط للإمساك العارض (يحتوي على سنا)، مع مكونات قد تسبب آثاراً مضادة للكولين (belladonna).',
    timing: 'يفضل تناول الجرعة ليلاً قبل النوم ليظهر المفعول في الصباح (بعد ٨-١٢ ساعة).',
    category: Category.LAXATIVES, 
    form: 'Tablet',
    
    minAgeMonths: 144, // 12 years and above
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) {
            return '١-٢ قرص قبل النوم يومياً عند اللزوم.';
        } else {
            return 'لا يوصى باستخدامه للأطفال دون سن ١٢ عاماً إلا حسب التشخيص.';
        }
    },
    
    warnings: [
        'قد يسبب مغصاً/إسهالاً واضطراب أملاح عند الإفراط.',
        'يُمنع في انسداد الأمعاء/التهاب الزائدة/ألم بطني شديد غير مُشخّص.',
        'مضاد كولين (Belladonna): الحذر مع جلوكوما ضيقة الزاوية/احتباس بول/تضخم بروستاتا، ومع الأدوية المضادة للكولين.',
        'الحمل/الرضاعة: يفضّل تجنبه. لا يستخدم لفترات طويلة دون تقييم طبي.'
    ]
  } ,
  
  // 34. Amiprostone 24mcg 30 Capsules
  {
    id: 'amiprostone-24-caps-30',
    name: 'Amiprostone 24mcg 30 Capsules',
    genericName: 'Lubiprostone', // [Chloride Channel Activator]
    concentration: '24mcg / Capsule',
    price: 159, 
    matchKeywords: [
        'chronic constipation', 'amiprostone 30', 'lubiprostone', 'cic', 'ibs-c',
        'أميبروستون ٣٠', 'لوبيبروستون', 'إمساك مزمن', 'القولون العصبي الإمساكي', 'عبوة توفير'
    ],
    usage: 'منشّط لقنوات الكلوريد يزيد إفراز السوائل داخل الأمعاء ويساعد على تليين البراز؛ يُستخدم للإمساك المزمن مجهول السبب لدى البالغين وقد يُستخدم للإمساك المصاحب للمواد الأفيونية حسب التشخيص.',
    timing: 'كبسولة واحدة مرتين يومياً (صباحاً ومساءً) مع الوجبات الرئيسية.',
    category: Category.LAXATIVES, 
    form: 'Capsule',
    
    minAgeMonths: 216, // 18 years
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216) {
            return 'كبسولة واحدة (٢٤ ميكروجرام) مرتين يومياً للبالغين.';
        } else {
            return 'لا يستخدم للأطفال أو المراهقين دون سن ١٨ عاماً.';
        }
    },
    
    warnings: [
        'الغثيان هو العرض الجانبي الأكثر شيوعاً، وتناوله مع الطعام يقلل ذلك بشكل كبير.',
        'يُمنع في حالات انسداد الأمعاء المعروف أو المشتبه به.',
        'الحمل/الرضاعة: لا يُنصح به عادةً. أعد التقييم عند الاشتباه في الحمل.',
        'قد يسبب ضيقاً/شدّاً عابراً بالصدر أو دوخة بعد الجرعة الأولى لدى بعض المرضى.'
    ]
  },

  // 35. Lactulose HEK 65% Syrup 120ml
  {
    id: 'lactulose-hek-120ml',
    name: 'Lactulose HEK 65% Syrup 120ml',
    genericName: 'Lactulose', // [Laxative] Osmotic Laxative
    concentration: '65% (Equivalent to 3.35g/5ml)',
    price: 83, 
    matchKeywords: [
        'constipation', 'lactulose hek 120', 'hek syrup', 'osmotic laxative', 'chronic constipation',
        'لاكتولوز هيك ١٢٠', 'هيك شراب صغير', 'لاكتولوز شراب', 'إمساك', 'ملين آمن للحوامل', 'ملين أطفال'
    ],
    usage: 'ملين أسموزي (لاكتولوز) لسحب الماء للأمعاء وتسهيل الإخراج، وقد يُستخدم بجرعات يحددها الطبيب في حالات اعتلال الدماغ الكبدي.',
    timing: 'يفضل تناوله كجرعة واحدة يومياً بعد الإفطار. المفعول يظهر خلال ٢٤-٤٨ ساعة.',
    category: Category.LAXATIVES, 
    form: 'Syrup',
    
    minAgeMonths: 1, 
    maxAgeMonths: 1200,
    minWeight: 4,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 168) { // Adults
            return '١٥ - ٣٠ مل (١-٢ ملعقة كبيرة) يومياً كجرعة مداومة.';
        } else if (ageMonths >= 84 && ageMonths < 168) { // 7 to 14 years
            return '١٠ - ١٥ مل يومياً.';
        } else if (ageMonths >= 12 && ageMonths < 84) { // 1 to 6 years
            return '٥ - ١٠ مل يومياً.';
        } else { // Infants
            return '٢.٥ مل إلى ٥ مل يومياً حسب التشخيص.';
        }
    },
    
    warnings: [
        'قد يسبب غازات أو نفخة في أول يومين من الاستخدام.',
        'يُمنع في حالات انسداد الأمعاء أو الحساسية لسكر الجالاكتوز.',
        'يجب الحذر لمرضى السكري عند الاستخدام بجرعات عالية لفترات طويلة.',
        'تقليل الجرعة فوراً في حالة حدوث إسهال.'
    ]
  },

  // 36. Constipride 1mg 28 Tablets
  {
    id: 'constipride-1mg-28-tab',
    name: 'Constipride 1mg 28 F.C. Tablets',
    genericName: 'Prucalopride', // [Gastrointestinal Prokinetic]
    concentration: '1mg / Tablet',
    price: 121.5, 
    matchKeywords: [
        'chronic constipation', 'constipride 1mg', 'prucalopride', 'prokinetic',
        'كونستبرايد ١ مجم', 'بروكالوبريد', 'إمساك مزمن', 'منشط حركة القولون'
    ],
    usage: 'منشّط لحركة الأمعاء (5-HT4 agonist)؛ تركيز ١ مجم قد يُستخدم كبداية لكبار السن أو في القصور الكلوي الشديد حسب التشخيص.',
    timing: 'قرص واحد (١ مجم) مرة واحدة يومياً، في أي وقت، مع الطعام أو بدونه.',
    category: Category.LAXATIVES, 
    form: 'Tablet',
    
    minAgeMonths: 216, // 18 years
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 216) {
            return 'يجب عدم استخدامه للأطفال والمراهقين دون سن ١٨ عاماً.';
        }
        if (ageMonths > 780) { // Elderly (> 65 years)
            return 'الجرعة الموصى بها لكبار السن هي ١ ملغ (قرص واحد) مرة واحدة يومياً.';
        }
        return 'قد يُستخدم هذا التركيز (١ ملغ) كبداية لكبار السن أو في القصور الكلوي الشديد حسب التشخيص والتحاليل.';
    },
    
    warnings: [
        'قد يسبب صداعاً أو غثياناً أو إسهالاً في بداية العلاج.',
        'يُمنع في انسداد/ثقب الأمعاء أو التهابات الأمعاء الشديدة.',
        'قصور كلوي شديد: اتبع جرعة الطبيب.',
        'أعد التقييم عند تغيرات مزاجية شديدة أو أفكار إيذاء النفس. الحمل/الرضاعة: لا يُنصح به عادةً.'
    ]
    },

  
  // 37. Colospatoraz 135mg 30 Tablets
  {
    id: 'colospatoraz-135mg-30-tab',
    name: 'Colospatoraz 135mg 30 Tablets',
    genericName: 'Mebeverine Hydrochloride', // [Antispasmodic]
    concentration: '135mg / Tablet',
    price: 81, 
    matchKeywords: [
        'irritable bowel syndrome', 'ibs', 'colospatoraz', 'mebeverine', 'antispasmodic', 'colon cramps',
        'كولوسباتوراز', 'ميبفرين', 'تشنج القولون', 'مضاد للتقلصات', 'القولون العصبي', 'مغص القولون'
    ],
    usage: 'مضاد للتقلصات يعمل على إرخاء العضلات الملساء؛ يستخدم لتخفيف أعراض القولون العصبي مثل المغص والتقلصات.',
    timing: 'قرص واحد ٣ مرات يومياً، ويفضل تناوله قبل الأكل بـ ٢٠ دقيقة.',
    category: Category.ANTISPASMODIC, 
    form: 'Tablet',
    
    minAgeMonths: 216, // 18 years
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216) {
            return 'قرص واحد (١٣٥ مجم) ٣ مرات يومياً قبل الوجبات بـ ٢٠ دقيقة.';
        } else {
            return 'لا يوصى باستخدامه للأطفال والمراهقين دون سن ١٨ عاماً.';
        }
    },
    
    warnings: [
        'آمن جداً ونادر الأعراض الجانبية؛ قد يظهر طفح جلدي في حالات نادرة جداً.',
        'يُمنع في حالة الحساسية لمادة الميبفرين.',
        'الحمل/الرضاعة: يفضّل تجنبه إلا للضرورة حسب التشخيص.',
        'لا يؤثر على حركة الأمعاء الطبيعية ولا يسبب إمساكاً.'
    ]
  },

  // 38. Lactulose-Aug Pharma 320ml Syrup
  {
    id: 'lactulose-aug-320ml',
    name: 'Lactulose-Aug Pharma 3.35g/5ml Syrup 320ml',
    genericName: 'Lactulose', // [Laxative] Osmotic Laxative
    concentration: '3.35g / 5ml',
    price: 170, 
    matchKeywords: [
        'constipation', 'lactulose aug', 'aug pharma', 'large bottle', '320ml',
        'لاكتولوز أوج', 'لاكتولوز ٣٢٠ مل', 'أكبر حجم لاكتولوز', 'إمساك مزمن', 'ملين كبدي', 'شراب ملين'
    ],
    usage: 'ملين أسموزي لتليين البراز، وقد يُستخدم بجرعات يحددها الطبيب في حالات اعتلال الدماغ الكبدي.',
    timing: 'يفضل تناوله كجرعة واحدة يومياً بعد الإفطار، أو حسب تقسيم الطبيب لمرضى الكبد.',
    category: Category.LAXATIVES, 
    form: 'Syrup',
    
    minAgeMonths: 1, 
    maxAgeMonths: 1200,
    minWeight: 4,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 168) { // Adults
            return '١٥ - ٤٥ مل (١-٣ ملاعق كبيرة) يومياً كجرعة بداية.';
        } else if (ageMonths >= 84 && ageMonths < 168) { // 7-14 years
            return '١٠ - ١٥ مل يومياً.';
        } else if (ageMonths >= 12 && ageMonths < 84) { // 1-6 years
            return '٥ - ١٠ مل يومياً.';
        } else { // Infants
            return '٢.٥ مل إلى ٥ مل يومياً حسب التشخيص.';
        }
    },
    
    warnings: [
        'قد يسبب غازات أو شعوراً بالامتلاء في أول يومين من العلاج.',
        'يُمنع في حالات انسداد الأمعاء أو الحساسية لسكر الجالاكتوز.',
        'لا يحفظ في الثلاجة لمنع تبلور السكر (يحفظ في درجة حرارة الغرفة).',
        'للاعتلال الكبدي: الجرعة تُحدد حسب الحالة.'
    ]
  }
];

export const LAXATIVE_MEDS: Medication[] = LAXATIVE_MEDS_RAW.map(sanitizeMedication);
export default LAXATIVE_MEDS;

