import { Category, Medication } from '../../types';

const toAr = (n: number | string) => n.toString().replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const roundVol = (vol: number): number => Math.round(vol * 2) / 2;

const roundTo = (n: number, step: number): number => {
    if (!Number.isFinite(n) || !Number.isFinite(step) || step <= 0) return n;
    return Math.round(n / step) * step;
};

const mgPerMlFromLabel = (mg: number, ml: number): number => {
    if (ml <= 0) return 0;
    return mg / ml;
};

const doseMgFromMgPerKg = (
    weightKg: number,
    mgPerKg: number,
    opts?: { minMg?: number; maxMg?: number; roundStepMg?: number }
): number => {
    const raw = weightKg * mgPerKg;
    const clamped = clamp(raw, opts?.minMg ?? 0, opts?.maxMg ?? Number.POSITIVE_INFINITY);
    return roundTo(clamped, opts?.roundStepMg ?? 1);
};

const doseMlFromDoseMg = (doseMg: number, concentrationMgPerMl: number, roundStepMl = 0.5): number => {
    if (concentrationMgPerMl <= 0) return 0;
    return roundTo(doseMg / concentrationMgPerMl, roundStepMl);
};

// Injection helpers (for future injectable entries: IV/IM)
const reconstitutedMgPerMl = (vialMg: number, diluentAddedMl: number): number => {
    if (diluentAddedMl <= 0) return 0;
    return vialMg / diluentAddedMl;
};

const injectionDrawVolumeMl = (doseMg: number, mgPerMl: number, roundStepMl = 0.1): number => {
    if (mgPerMl <= 0) return 0;
    return roundTo(doseMg / mgPerMl, roundStepMl);
};

type InjectionRoute = 'IV' | 'IM' | 'IV infusion';

const buildInjectionPreparationInstructions = (params: {
    route: InjectionRoute;
    vialLabel: string;
    diluentLabel?: string;
    reconstitutionText: string;
    administrationText: string;
    notes?: string[];
}): string => {
    const parts: string[] = [
        `التحضير (${params.vialLabel}): ${params.reconstitutionText}`,
        `طريقة الإعطاء (${params.route}): ${params.administrationText}`
    ];
    if (params.diluentLabel) parts.push(`المذيب: ${params.diluentLabel}`);
    if (params.notes?.length) parts.push(`ملاحظات: ${params.notes.join(' | ')}`);
    return parts.join('. ');
};

// Shared warnings (reused across multiple antidiarrheal entries)
const W_DEHYDRATION = [
    'الجفاف أخطر من الإسهال ذاته؛ تعويض السوائل بمحلول الجفاف (ORS) أساس العلاج، خصوصاً للأطفال وكبار السن.',
    'علامات خطر تحتاج تقييماً عاجلاً: خمول شديد، قلة بول واضحة، عطش شديد، عينان غائرتان، عدم القدرة على الاحتفاظ بالسوائل، أو جفاف شديد بالفم.'
];

const W_RED_FLAGS_GI = [
    'علامات تستلزم تقييماً عاجلاً: دم بالبراز، حرارة مرتفعة مستمرة، ألم بطن شديد، أو قيء متكرر يمنع شرب السوائل.',
    'استمرار الإسهال أكثر من ٤٨ ساعة بدون تحسن واضح يستلزم تقييماً.'
];

const W_ALLERGY = ['ظهور حساسية شديدة (طفح منتشر/تورم/ضيق تنفس) يستلزم إيقاف الدواء وتقييماً عاجلاً.'];

// Injection preparation & administration templates (used when an entry is an injectable form)
// ملاحظة مهمة: اختبار الحساسية ليس إجراءً ثابتاً لكل الحقن؛ يُذكر فقط عند كونه جزءاً من بروتوكول دواء بعينه.
const INJECTION_PREP_COMMON = [
    'تحضير الدواء يتم بتقنية معقمة (Aseptic technique) مع فحص الاسم/التركيز/تاريخ الصلاحية وسلامة العبوة قبل التحضير.',
    'بعد التحضير: فحص المحلول (صفاء/عدم وجود راسب/تغير لون). أي تغير غير طبيعي يستلزم عدم الاستخدام.',
    'اختيار المذيب والتخفيف (Water for Injection/Normal Saline/D5W) يختلف حسب الدواء؛ التوافق والثبات يتبعان نشرة المنتج.',
    'تسجيل وقت التحضير مفيد لأن الثبات يختلف حسب التركيز ودرجة الحرارة ونوع المذيب.'
];

const INJECTION_ADMIN_IV_SLOW = [
    'الحقن الوريدي البطيء (IV slow): سحب الحجم المحسوب بعد التحضير، ثم إعطاء ببطء وفق زمن مذكور للدواء لتقليل تهيج الوريد.',
    'الخلط في نفس السرنجة/الخط الوريدي مع أدوية غير متوافقة قد يسبب تداخلاً/ترسباً؛ الشطف بـ Normal Saline بين الأدوية يقلل ذلك.'
];

const INJECTION_ADMIN_IV_INFUSION = [
    'التسريب الوريدي (IV infusion): تخفيف الجرعة في كيس محلول مناسب بالحجم والتركيز المذكورين للدواء، ثم التسريب خلال زمن محدد.',
    'تأمين خط وريدي جيد وتقليل التركيز/زيادة زمن التسريب يقللان ألم الوريد في بعض الأدوية.'
];

const INJECTION_ADMIN_IM = [
    'الحقن العضلي (IM): حقن عضلي عميق في موضع مناسب، مع مراعاة عدم الحقن داخل الأوعية (Aspiration عند اللزوم حسب الحاجة).',
    'الحد الأقصى لحجم الحقن العضلي في موضع واحد يعتمد على العمر/العضلة؛ توزيع الجرعة على أكثر من موضع عند الحاجة.'
];

export const ANTIDIARRHEAL_MEDS: Medication[] = [


  // 1. Streptoquin Tablets
  {
    id: 'streptoquin-20-tabs',
    name: 'Streptoquin 20 Tablets',
    genericName: 'Diiodohydroxyquinoline + Phthalylsulfathiazole + Streptomycin sulfate + Atropine sulfate',
    concentration: '200mg + 200mg + 100mg + 0.05mg',
    price: 60,
    matchKeywords: [
        'diarrhea', 'antidiarrheal', 'amoebiasis', 'intestinal antiseptic', 'streptoquin', 'cramps',
        'ستربتوكين', 'اسهال', 'مطهر معوي', 'اميبا', 'مغص', 'عدوى معوية'
    ],
    usage: 'مطهر معوي مركب لعلاج الإسهال البكتيري أو الأميبي الحاد المصحوب بمغص، يستخدم للبالغين فقط.',
    timing: 'بعد الأكل مباشرة لتقليل تهيج المعدة.',
    category: Category.ANTIDIARRHEAL,
    form: 'Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144 && weight >= 40) {
            return 'قرص واحد كل ٨ ساعات بعد الأكل (صباح/عصر/مساء) — المدة: ٥–٧ أيام (بحد أقصى ٤ أقراص/يوم)';
        }
        return 'لا ينصح به للأطفال أو المراهقين—يفضل بدائل أكثر أماناً (مثل نيتازوكسانيد أو ميترونيدازول شراب).';
    },
    warnings: [
        'الحمل والرضاعة: غير موصى به لعدم توافر أمان كافٍ (يُتجنب خاصة في الثلث الأول).',
        'يتداخل مع المضادات الحيوية من فئة الأمينوغليكوزيد الأخرى (زيادة سُمية السمع والكلى مع الستربتومايسين).',
        'غير مناسب في الوهن العضلي الوبيل أو انسداد الأمعاء أو تاريخ حساسية لليود أو السلفا.',
        'يُستخدم بحذر في القصور الكلوي أو الكبدي؛ إيقافه عند ظهور طنين أذن أو دوار شديد (علامات سمّية ستربتومايسين).'
    ]
  },

  // 2. Nanazoxid Suspension
  {
    id: 'nanazoxid-100-susp',
    name: 'Nanazoxid 100mg/5ml Oral Susp. 60ml',
    genericName: 'Nitazoxanide',
    concentration: '100mg/5ml',
    price: 39,
    matchKeywords: [
        'diarrhea', 'nitazoxanide', 'nanazoxid', 'parasites', 'cryptosporidium', 'giardia', 'protozoa', 'antiprotozoal',
        'ننازوكسيد', 'اسهال', 'طفيليات', 'ميكروب معوي', 'مطهر معوي', 'اميبا', 'جيارديا'
    ],
    usage: 'مضاد للطفيليات (الأميبا، الجيارديا، كريبتوسبوريديوم) المسببة للإسهال الحاد.',
    timing: 'مع الطعام مرتين يومياً (وسط الوجبة) لزيادة الامتصاص.',
    category: Category.ANTIDIARRHEAL,
    form: 'Suspension',
    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 8,
    maxWeight: 250,
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) {
            return '٢٥ مل (٥٠٠ مجم) كل ١٢ ساعة مع الأكل (صباح/مساء) — المدة: ٣ أيام. يُفضل التحول للأقراص لنفس الجرعة.';
        }
        if (ageMonths >= 48) {
            return '١٠ مل كل ١٢ ساعة مع الأكل (صباح/مساء) — المدة: ٣ أيام';
        }
        if (ageMonths >= 12) {
            return '٥ مل كل ١٢ ساعة مع الأكل (صباح/مساء) — المدة: ٣ أيام';
        }
        return 'غير موصى به أقل من ١٢ شهراً.';
    },
    warnings: [
        'الحمل: بيانات محدودة؛ يُتجنب خاصة في الثلث الأول. الرضاعة: بيانات غير كافية.',
        'تناوله مع الطعام ضروري لامتصاص فعال؛ تناوله على معدة فارغة يقلل التركيز الدوائي.',
        'قد يسبب تلون البول بالأصفر الداكن مؤقتاً؛ غير مقلق.',
        'يُستخدم خلال ٧ أيام من التحضير ويحفظ في درجة حرارة الغرفة بعيداً عن الحرارة المباشرة.'
    ]
  },

  // 3. Xithrone 500mg Tablets
  {
    id: 'xithrone-500-tabs',
    name: 'Xithrone 500mg 3 F.C. Tablets',
    genericName: 'Azithromycin',
    concentration: '500mg',
    price: 63,
    matchKeywords: [
        'antibiotic', 'azithromycin', 'xithrone', 'throat infection', 'tonsillitis', 'pneumonia', 'sinusitis', 'macrolide',
        'زيثيرون', 'مضاد حيوي', 'مضاد حيوي ٣ ايام', 'التهاب لوز', 'احتقان زور', 'عدوى صدرية'
    ],
    usage: 'مضاد حيوي ماكروليد لعلاج عدوى الجهاز التنفسي العلوي والسفلي وعدوى الجلد للبالغين.',
    timing: 'ساعة قبل الأكل أو بعده بساعتين (جرعة واحدة يومياً).',
    category: Category.ANTIBIOTICS,
    form: 'Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: (weight, ageMonths) => {
        if (weight >= 45 && ageMonths >= 144) {
            return 'قرص ٥٠٠ مجم مرة واحدة يومياً (نفس الموعد كل ٢٤ ساعة) — المدة: ٣ أيام.';
        }
        return 'للأطفال <٤٥ كجم تُحسب الجرعة ١٠ مجم/كجم مرة يومياً لمدة ٣ أيام باستخدام الشراب ٢٠ مجم/مل أو ١٠٠ مجم/٥ مل.';
    },
    warnings: [
        'الحمل فئة B: يستخدم فقط عند الضرورة—الرضاعة يمر بكميات قليلة فالحذر واجب.',
        'فاصل ساعتين عن مضادات الحموضة المحتوية على ألومنيوم/مغنيسيوم.',
        'تحذير اضطراب نظم القلب (إطالة QT): يُتجنب في مرضى اضطراب النظم أو مع أدوية تطيل QT.',
        'يُعدّل أو يُوقف إذا ظهرت أعراض كبدية (اصفرار، بول داكن، ألم أعلى يمين البطن).'
    ]
  },

  // 4. Zisrocin 500mg Capsules
  {
    id: 'zisrocin-500-caps',
    name: 'Zisrocin 500mg 3 Capsules',
    genericName: 'Azithromycin',
    concentration: '500mg',
    price: 71,
    matchKeywords: [
        'antibiotic', 'azithromycin', 'zisrocin', 'respiratory tract infection', 'throat', 'bacterial infection',
        'زيزروكين', 'زيزروسين', 'مضاد حيوي', 'جرعة واحدة', 'التهاب الشعب', 'مضاد حيوي ٣ كبسولات'
    ],
    usage: 'مضاد حيوي ماكروليد لعلاج عدوى الجهاز التنفسي والجلدية للبالغين.',
    timing: 'قبل الأكل بساعة أو بعده بساعتين مرة يومياً.',
    category: Category.ANTIBIOTICS,
    form: 'Capsule',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144 && weight >= 45) {
            return 'كبسولة واحدة (٥٠٠ مجم) مرة واحدة يومياً (صباحاً) — المدة: ٣ أيام (نفس الموعد كل ٢٤ ساعة)';
        }
        const doseMg = doseMgFromMgPerKg(weight, 10, { maxMg: 500, roundStepMg: 1 });
        return `للأطفال: ${doseMg > 0 ? doseMg : 'جرعة خاصة'} مجم مرة يومياً — المدة: ٣ أيام (يُستخدم الشراب وليس الكبسولات)`;
    },
    warnings: [
        'الحمل فئة B: لا يُستخدم إلا للضرورة—يُفضل تجنبه في الثلث الأول.',
        'تحذير إطالة QT؛ يُتجنب مع أدوية مثل الأميودارون أو الليفوفلوكساسين أو مرضى تاريخ نظم القلب.',
        'يفصل ساعتين عن مضادات الحموضة المحتوية على ألومنيوم/مغنيسيوم.',
        'يُوقف فوراً عند ظهور طفح شديد أو تورم بالوجه أو صعوبة تنفس (احتمال تفاعل تحسسي).'
    ]
  },

  // 5. Flagyl 125mg Suspension
  {
    id: 'flagyl-125-susp',
    name: 'Flagyl 125mg/5ml Suspension 100ml',
    genericName: 'Metronidazole',
    concentration: '125mg/5ml',
    price: 26,
    matchKeywords: [
        'antiprotozoal', 'metronidazole', 'flagyl', 'amoebiasis', 'giardiasis', 'anaerobic infection', 'intestinal antiseptic',
        'فلاجيل', 'مطهر معوي', 'اسهال', 'اميبا', 'جيارديا', 'رائحة فم كريهة', 'مضاد طفيليات'
    ],
    usage: 'مطهر معوي ومضاد للطفيليات (أميبا وجيارديا) وللبكتيريا اللاهوائية لدى الأطفال.',
    timing: 'كل ٨ ساعات بعد الطعام.',
    category: Category.ANTIDIARRHEAL,
    form: 'Suspension',
    minAgeMonths: 2,
    maxAgeMonths: 180,
    minWeight: 4,
    maxWeight: 60,
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 2 || weight < 4) {
            return 'جرعة خاصة للأطفال أصغر من ذلك.';
        }
        const doseMl = roundVol(weight * 0.3); // 7.5mg/kg/جرعة كل 8 ساعات = 0.3 مل/كجم/جرعة
        const doseMlClamped = Math.min(doseMl, 5); // جرعة قصوى ٥ مل
        const doseMg = Math.round(doseMlClamped * 25); // 125mg/5ml = 25mg/ml
        return `${toAr(doseMlClamped)} مل (≈ ${toAr(doseMg)} مجم) كل ٨ ساعات بعد الأكل (صباح/عصر/مساء) — المدة: ٧–١٠ أيام`;
    },
    warnings: [
        'الحمل: يُتجنب في الثلث الأول، ويُستخدم بحذر بعد ذلك. الرضاعة: يفضل الفصل أو الإيقاف مؤقتاً حسب شدة الحالة.',
        'تحذير كحول: الكحول أو الأدوية المحتوية عليه غير مناسبة أثناء العلاج ولمدة ٤٨ ساعة بعد آخر جرعة (تفاعل ديسلفيرام).',
        'قد يسبب طعماً معدنياً أو غثياناً وتغير لون البول للبني المحمر؛ أعراض مؤقتة.',
        'يُستخدم بحذر في قصور الكبد أو تاريخ اختلاجات؛ إيقاف الدواء عند حدوث تنميل شديد أو دوار غير معتاد.'
    ]
  },

  // 6. Flagyl 500mg Tablets
  {
    id: 'flagyl-500-tabs',
    name: 'Flagyl 500mg 20 Tablets',
    genericName: 'Metronidazole',
    concentration: '500mg',
    price: 34,
    matchKeywords: [
        'antiprotozoal', 'metronidazole', 'flagyl', 'amoebiasis', 'anaerobic infection', 'dental infection', 'intestinal antiseptic',
        'فلاجيل', 'مطهر معوي', 'اميبا', 'جيارديا', 'خراج اسنان', 'التهاب لثة', 'اسهال'
    ],
    usage: 'مضاد للطفيليات والبكتيريا اللاهوائية للبالغين (أميبا معوية، خراج لثة، التهابات فموية وجهاز هضمي).',
    timing: 'كل ٨ ساعات مع الأكل أو بعده مباشرة.',
    category: Category.ANTIDIARRHEAL,
    form: 'Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144 && weight >= 40) {
            return 'قرص واحد (٥٠٠ مجم) كل ٨ ساعات بعد الأكل (صباح/عصر/مساء) — المدة: ٧–١٠ أيام. في الحالات الشديدة: ٧٥٠ مجم كل ٨ ساعات.';
        }
        return 'للأطفال تُستخدم الصورة المعلقة بجرعة ٧.٥ مجم/كجم كل ٨ ساعات كما هو موضح في تركيز ١٢٥ مجم/٥ مل.';
    },
    warnings: [
        'تحذير كحول: ممنوع الكحول أثناء العلاج ولمدة ٤٨ ساعة بعد آخر جرعة لتجنب تفاعل شبيه بالديسلفيرام.',
        'الحمل: يُتجنب في الثلث الأول، ويُستخدم بحذر بعد ذلك. الرضاعة: قد يلزم إيقاف الرضاعة مؤقتاً أثناء الكورس.',
        'قد يسبب طعماً معدنياً أو غثياناً وتلون بول داكن؛ أعراض عابرة. يُوقف عند تنميل شديد أو أعراض عصبية.',
                'يُستخدم بحذر مع أدوية مميعة للدم (وارفارين) لاحتمال زيادة الـINR؛ متابعة INR مهمة.'
    ]
  },

  // 7. Enterogermina 2 Billion Oral Suspension
  {
    id: 'enterogermina-2b-10-vials',
    name: 'Enterogermina 2 billion/5ml 10 Mini Bottles',
    genericName: 'Bacillus clausii spores',
    concentration: '2 billion spores / 5ml',
    price: 180,
    matchKeywords: [
        'probiotic', 'diarrhea', 'bacillus clausii', 'intestinal flora', 'enterogermina', 'antibiotic-associated diarrhea',
        'انتروجيرمينا', 'بكتيريا نافعة', 'اسهال', 'استعادة توازن الامعاء', 'بعد المضاد الحيوي'
    ],
    usage: 'بروبيوتك لإعادة توازن بكتيريا الأمعاء ومنع الإسهال المصاحب للمضادات الحيوية للرضع والأطفال والبالغين.',
    timing: 'بين الوجبات في مواعيد ثابتة؛ يُفصل ساعتين عن المضاد الحيوي.',
    category: Category.ANTIDIARRHEAL,
    form: 'Oral Suspension',
    minAgeMonths: 1,
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 250,
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216) {
            return 'قنينة واحدة ٢–٣ مرات يومياً (كل ٨–١٢ ساعة) — المدة: ٥–٧ أيام';
        }
        if (ageMonths >= 24) {
            return 'قنينة واحدة مرتين يومياً (كل ١٢ ساعة) — المدة: ٥–٧ أيام';
        }
        if (ageMonths >= 1) {
            return 'قنينة واحدة مرة يومياً — يمكن تقسيمها على جرعتين متساويتين خلال اليوم';
        }
        return 'جرعة خاصة لحديثي الولادة.';
    },
    warnings: [
        'للاستخدام الفموي فقط؛ غير مناسب للحقن أو الاستنشاق.',
        'فاصل ساعتين على الأقل عن جرعة أي مضاد حيوي لتقليل التداخل.',
        'يُحفظ في درجة حرارة الغرفة بعيداً عن أشعة الشمس المباشرة (لا يحتاج ثلاجة).',
        ...W_RED_FLAGS_GI
    ]
  },

  // 8. Ciprocin 500mg F.C. Tablets
  {
    id: 'ciprocin-500-tabs',
    name: 'Ciprocin 500mg 10 F.C. Tablets',
    genericName: 'Ciprofloxacin',
    concentration: '500mg',
    price: 53,
    matchKeywords: [
        'antibiotic', 'ciprofloxacin', 'ciprocin', 'uti', 'urinary tract infection', 'prostatitis', 'typhoid', 'bone infection',
        'سيبروسين', 'مضاد حيوي', 'التهاب مسالك بولية', 'سيبروفلوكساسين', 'صديد بول', 'نزلات معوية حادة'
    ],
    usage: 'فلوروكينولون لعلاج التهابات المسالك البولية والكلى والبروستاتا وعدوى الجهاز الهضمي للبالغين فقط.',
    timing: 'كل ١٢ ساعة على معدة فارغة (ساعة قبل الأكل أو ساعتين بعده).',
    category: Category.ANTIBIOTICS,
    form: 'F.C. Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216 && weight >= 50) {
            return 'قرص واحد (٥٠٠ مجم) كل ١٢ ساعة على معدة فارغة (صباح/مساء) — المدة: ٥–٧ أيام للعدوى الخفيفة-المتوسطة، ١٤ يوماً في العدوى الشديدة أو البروستاتا';
        }
        return 'يُتجنب تماماً تحت ١٨ سنة بسبب مخاطر الأوتار والغضاريف.';
    },
    warnings: [
        'الحمل والرضاعة: غير موصى به (مخاطر على الغضاريف)، يُستبدل بمضاد آمن.',
        'تحذير الأوتار: ألم وتر الكعب/الكتف يستلزم إيقاف الدواء؛ يتضاعف الخطر مع الكورتيكوستيرويدات.',
        'يتداخل مع أملاح الكالسيوم/الحديد/الزنك ومضادات الحموضة (يُفصل ساعتين قبل أو ٤ ساعات بعد).',
        'يزيد حساسية الجلد للشمس؛ تقليل التعرض المباشر + واقٍ شمسي.'
    ]
  },

  // 9. Infectomycin 500mg F.C. Tablets
  {
    id: 'infectomycin-500-tabs',
    name: 'Infectomycin 500mg 6 F.C. Tablets',
    genericName: 'Clarithromycin',
    concentration: '500mg',
    price: 97,
    matchKeywords: [
        'antibiotic', 'clarithromycin', 'infectomycin', 'respiratory infection', 'sinusitis', 'h.pylori', 'macrolide',
        'انفيكتومايسين', 'كلاريثروميسين', 'مضاد حيوي', 'جرثومة المعدة', 'التهاب رئوي', 'التهاب حلق'
    ],
    usage: 'مضاد حيوي ماكروليد لعلاج التهابات الجهاز التنفسي العلوي/السفلي، وللاشتراك في علاج جرثومة المعدة.',
    timing: 'كل ١٢ ساعة بعد الأكل.',
    category: Category.ANTIBIOTICS,
    form: 'F.C. Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144 && weight >= 40) {
            return '٥٠٠ مجم كل ١٢ ساعة لمدة ٧-١٤ يوماً حسب نوع العدوى؛ في جرثومة المعدة ضمن نظام ثلاثي/رباعي لمدة ١٤ يوماً.';
        }
        return 'للأطفال <١٢ سنة تُحسب الجرعة ٧.٥ مجم/كجم كل ١٢ ساعة باستخدام الشراب مناسب التركيز.';
    },
    warnings: [
        'تحذير إطالة QT: غير مناسب لمرضى اضطراب نظم القلب أو مع أدوية تطيل QT (مثل أميودارون).',
        'تفاعلات هامة مع الستاتين (سمية عضلية) والوارفارين (زيادة INR) والكاربا مازيبين؛ يلزم متابعة.',
        'الحمل فئة C؛ يُستخدم فقط إذا فاقت الفائدة الخطر. يُفرز في اللبن ويُستخدم بحذر أثناء الرضاعة.',
        'قد يسبب طعماً معدنياً أو غثياناً خفيفاً؛ يُوقف عند ظهور يرقان أو ألم بطني شديد (علامات كبدية).'
    ]
  },

  // 10. Nanazoxid 500mg F.C. Tablets
  {
    id: 'nanazoxid-500-tabs',
    name: 'Nanazoxid 500mg 18 F.C. Tablets',
    genericName: 'Nitazoxanide',
    concentration: '500mg',
    price: 114,
    matchKeywords: [
        'antiprotozoal', 'nitazoxanide', 'nanazoxid', 'amoebiasis', 'giardiasis', 'cryptosporidium', 'intestinal antiseptic',
        'ننازوكسيد', 'مطهر معوي', 'اميبا', 'جيارديا', 'طفيليات', 'اسهال نتيجه عدوى'
    ],
    usage: 'مضاد للطفيليات (أميبا، جيارديا، كريبتوسبوريديوم) للبالغين والمراهقين ≥١٢ سنة.',
    timing: 'كل ١٢ ساعة مع وجبة (وسط الأكل).',
    category: Category.ANTIDIARRHEAL,
    form: 'F.C. Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144 && weight >= 40) {
            return 'قرص واحد (٥٠٠ مجم) كل ١٢ ساعة مع الطعام (صباح/مساء) — المدة: ٣ أيام متتالية';
        }
        if (ageMonths >= 48) {
            return '١٠ مل كل ١٢ ساعة مع الطعام (صباح/مساء) — المدة: ٣ أيام';
        }
        if (ageMonths >= 12) {
            return '٥ مل كل ١٢ ساعة مع الطعام (صباح/مساء) — المدة: ٣ أيام';
        }
        return 'غير موصى به أقل من ١٢ شهراً.';
    },
    warnings: [
        'تناوله مع الطعام ضروري لتحقيق التركيز العلاجي؛ الجرعة على معدة فارغة تقلل الامتصاص.',
        'قد يسبب تلون البول للأصفر الداكن مؤقتاً؛ غير خطير.',
        'يُستخدم بحذر في القصور الكبدي أو الكلوي، ومع مرضى السكري إذا كانت الأقراص تحتوي على لاكتوز.',
        'الحمل: بيانات محدودة؛ يُفضل تجنبه في الثلث الأول ويُستخدم لاحقاً عند الضرورة فقط.'
    ]
  },
  // 11. Nitazode 100mg/5ml Suspension
  {
    id: 'nitazode-100-susp',
    name: 'Nitazode 100mg/5ml Susp. 60ml',
    genericName: 'Nitazoxanide',
    concentration: '100mg/5ml',
    price: 44,
    matchKeywords: [
        'diarrhea', 'nitazoxanide', 'nitazode', 'parasites', 'antiprotozoal', 'amoeba', 'giardia',
        'نيتازود', 'نيتازوكسانيد', 'اسهال', 'طفيليات', 'مطهر معوي', 'اميبا', 'نزلات معوية'
    ],
    usage: 'مضاد للطفيليات (أميبا، جيارديا، كريبتوسبوريديوم) للأطفال.',
    timing: 'كل ١٢ ساعة مع الطعام.',
    category: Category.ANTIDIARRHEAL, 
    form: 'Suspension',
    
    minAgeMonths: 12, // 1 year
    maxAgeMonths: 1200,
    minWeight: 8,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        // Nitazoxanide standard pediatric dosing (3-day protocol)
        if (ageMonths >= 144) {
            return '٢٥ مل (٥٠٠ مجم) كل ١٢ ساعة مع الطعام لمدة ٣ أيام؛ يمكن استخدام الأقراص لنفس الجرعة.';
        }
        if (ageMonths >= 48) {
            return '١٠ مل كل ١٢ ساعة مع الطعام لمدة ٣ أيام.';
        }
        if (ageMonths >= 12) {
            return '٥ مل كل ١٢ ساعة مع الطعام لمدة ٣ أيام.';
        }
        return 'غير موصى به أقل من ١٢ شهراً.';
    },
    
    warnings: [
        'مع الطعام لتحسين الامتصاص وتقليل اضطراب المعدة.',
        'قد يسبب تلون البول بالأصفر الداكن مؤقتاً؛ غير مقلق.',
        'يُستخدم بحذر مع مرضى السكري إذا كان المعلق يحتوي سكروز؛ متابعة سكر الدم مفيدة.',
        'الحمل: بيانات محدودة؛ يُتجنب في الثلث الأول.'
    ]
  },

  // 12. ORS (Oral Rehydration Salts)
  {
    id: 'ors-10-sachets',
    name: 'ORS 10 Sachets',
        genericName: 'Oral Rehydration Salts (WHO Formula)',
    concentration: 'Standard Formula',
        price: 40,
    matchKeywords: [
        'dehydration', 'rehydration', 'diarrhea', 'vomiting', 'electrolytes', 'ors', 'pediatric',
        'محلول جفاف', 'املاح تعويضية', 'اسهال', 'ترجيع', 'جفاف', 'أو أر إس'
    ],
    usage: 'تعويض السوائل والأملاح المفقودة نتيجة الإسهال أو القيء للوقاية من الجفاف وعلاجه.',
    timing: 'بعد كل مرة إسهال أو قيء (على مدار اليوم).',
    category: Category.ANTIDIARRHEAL, 
    form: 'Sachets',
    
    minAgeMonths: 0, // Safe from birth
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 24) {
            return '٥٠–١٠٠ مل (حوالي نصف كوب) ببطء بعد كل نوبة إسهال أو قيء — حتى توقف الإسهال';
        }
        if (ageMonths >= 24 && ageMonths < 120) {
            return '١٠٠–٢٠٠ مل (نصف إلى كوب كامل) بعد كل نوبة إسهال أو قيء — حتى توقف الإسهال';
        }
        return '٢٠٠–٤٠٠ مل بعد كل نوبة إسهال + سوائل حسب العطش — حتى توقف الإسهال';
    },
    
    warnings: [
        ...W_DEHYDRATION,
        ...W_RED_FLAGS_GI,
        'إضافة سكر/نكهات أو الغلي بعد التحضير يغيّر التركيبة وقد يرفع الإسهال.',
        'الخلط باللبن أو العصير يغيّر التركيز؛ الماء فقط لضمان التركيز الصحيح.',
        'في وجود قيء: رشفات صغيرة متقاربة (مثل ملعقة صغيرة كل دقيقة) تقلل الترجيع.'
    ]
  },

  // 13. Antinal 200mg Capsules
  {
    id: 'antinal-200-caps',
    name: 'Antinal 200mg 24 Capsules',
    genericName: 'Nifuroxazide',
    concentration: '200mg',
    price: 52,
    matchKeywords: [
        'antidiarrheal', 'nifuroxazide', 'antinal', 'intestinal antiseptic', 'gastroenteritis', 'diarrhea',
        'انتيناال', 'انتينال', 'مطهر معوي', 'اسهال', 'نزلة معوية', 'ميكروب معوي', 'مغص'
    ],
    usage: 'مطهر معوي غير ممتص لعلاج الإسهال البكتيري الحاد للبالغين.',
    timing: 'كل ٦ ساعات مع الطعام أو بدونه.',
    category: Category.ANTIDIARRHEAL, 
    form: 'Capsule',
    
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144 && weight >= 40) {
            return 'كبسولة واحدة (٢٠٠ مجم) كل ٦ ساعات (صباح/ظهيرة/عصر/مساء) — المدة: ٣–٥ أيام (الحد الأقصى: ٨٠٠ مجم/يوم)';
        }
        const doseMl = roundVol((weight * 7.5) / 44); // 7.5mg/kg per dose, 220mg/5ml = 44mg/ml
        return `للأطفال: ${toAr(doseMl)} مل كل ٦ ساعات — المدة: ٣–٥ أيام (يُستخدم الشراب ٢٢٠ مجم/٥ مل)`;
    },
    
    warnings: [
        ...W_DEHYDRATION,
        ...W_RED_FLAGS_GI,
        'الحمل: يفضل تجنبه في الثلث الأول لعدم توافر بيانات كافية رغم الامتصاص المحدود.',
        'لا يُستخدم إذا وُجد نزيف شرجي أو ألم بطن حاد مفاجئ.'
    ]
  },

  // 14. Antinal 220mg/5ml Suspension
  {
    id: 'antinal-220-susp',
    name: 'Antinal 220mg/5ml Susp. 60ml',
    genericName: 'Nifuroxazide',
    concentration: '220mg/5ml',
    price: 24,
    matchKeywords: [
        'antidiarrheal', 'nifuroxazide', 'antinal', 'intestinal antiseptic', 'gastroenteritis', 'diarrhea', 'pediatric',
        'انتينال شراب', 'انتيناال', 'مطهر معوي للأطفال', 'اسهال', 'نزلة معوية', 'ميكروب معوي'
    ],
    usage: 'مطهر معوي غير ممتص لعلاج الإسهال البكتيري عند الرضع والأطفال.',
    timing: '٢-٣ مرات يومياً حسب العمر، مع الأكل أو بدونه.',
    category: Category.ANTIDIARRHEAL, 
    form: 'Suspension',
    
    minAgeMonths: 2, 
    maxAgeMonths: 180,
    minWeight: 5,
    maxWeight: 60,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 72) {
            return '٥ مل (٢٢٠ مجم) كل ٨ ساعات (صباح/عصر/مساء) — المدة: ٣–٥ أيام';
        }
        if (ageMonths >= 6) {
            return '٢.٥–٥ مل (١١٠–٢٢٠ مجم) كل ٨ ساعات (صباح/عصر/مساء) — المدة: ٣–٥ أيام';
        }
        if (ageMonths >= 2) {
            return '٢.٥ مل (١١٠ مجم) كل ١٢ ساعة (صباح/مساء) — المدة: ٣–٥ أيام';
        }
        return 'جرعة خاصة للأطفال أقل من شهرين.';
    },
    
    warnings: [
        ...W_DEHYDRATION,
        ...W_RED_FLAGS_GI,
        'يُحفظ أقل من ٣٠ درجة ويُفضل استخدامه خلال ٣٠ يوماً من الفتح.',
        'لا يعالج العدوى خارج الأمعاء لأنه غير ممتص؛ إيقافه إذا لم يحدث تحسن خلال ٤٨-٧٢ ساعة.'
    ]
  },

  // 15. Nitazoxin 100mg/5ml Suspension
  {
    id: 'nitazoxin-100-susp',
    name: 'Nitazoxin 100mg/5ml pd. for oral susp. 60ml',
    genericName: 'Nitazoxanide',
    concentration: '100mg/5ml',
    price: 22,
    matchKeywords: [
        'diarrhea', 'nitazoxanide', 'nitazoxin', 'parasites', 'antiprotozoal', 'amoeba', 'giardia', 'protozoa',
        'نيتازوكسين', 'نيتازوكسانيد', 'اسهال', 'طفيليات', 'مطهر معوي', 'اميبا', 'نزلات معوية'
    ],
    usage: 'مضاد للطفيليات (أميبا، جيارديا، كريبتوسبوريديوم) للأطفال.',
    timing: 'كل ١٢ ساعة مع الطعام.',
    category: Category.ANTIDIARRHEAL, 
    form: 'Suspension',
    
    minAgeMonths: 12, 
    maxAgeMonths: 144, 
    minWeight: 8,
    maxWeight: 45,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 48) {
            return '١٠ مل كل ١٢ ساعة مع الطعام (صباح/مساء) — المدة: ٣ أيام';
        }
        if (ageMonths >= 12) {
            return '٥ مل كل ١٢ ساعة مع الطعام (صباح/مساء) — المدة: ٣ أيام';
        }
        return 'غير موصى به أقل من سنة.';
    },
    
    warnings: [
        'تناوله مع الطعام ضروري لامتصاص مناسب وتقليل اضطراب المعدة.',
        'قد يسبب تلون البول للأصفر الداكن مؤقتاً؛ غير مقلق.',
        'صلاحية المعلق بعد التحضير ٧ أيام في درجة حرارة الغرفة بعيداً عن الحرارة.',
        'الحمل: بيانات محدودة؛ يُتجنب في الثلث الأول.'
    ]
  },


// 16. Zisrocin 100mg/5ml Suspension
  {
    id: 'zisrocin-100-susp',
    name: 'Zisrocin 100mg/5ml Susp. 30ml',
    genericName: 'Azithromycin',
    concentration: '100mg/5ml',
    price: 45,
    matchKeywords: [
        'antibiotic', 'azithromycin', 'zisrocin', 'tonsillitis', 'respiratory infection', 'otitis media',
        'زيزروكين', 'زيزروسين شراب', 'مضاد حيوي ٣ أيام', 'التهاب اللوز', 'عدوى بكتيرية', 'مضاد واسع المدى'
    ],
    usage: 'مضاد حيوي ماكروليد للأطفال لعلاج التهابات اللوزتين والحلق والجيوب وعدوى الجهاز التنفسي.',
    timing: 'مرة واحدة يومياً (كل ٢٤ ساعة) ويفضل على معدة فارغة.',
    category: Category.ANTIBIOTICS, 
    form: 'Suspension',
    
    minAgeMonths: 6, 
    maxAgeMonths: 180, 
    minWeight: 5,
    maxWeight: 45,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths < 6 || weight < 5) {
            return 'جرعة خاصة للرضع أقل من ٦ أشهر.';
        }
        const doseMl = roundVol(Math.min(weight * 0.5, 12)); // 10mg/kg/يوم = 0.5 مل/كجم/يوم
        return `${toAr(doseMl)} مل (≈ ${toAr(Math.round(weight * 10))} مجم) مرة واحدة يومياً (صباحاً) — المدة: ٣ أيام`;
    },
    
    warnings: [
        'يُفصل ساعتين عن مضادات الحموضة المحتوية على ألومنيوم/مغنيسيوم لتجنب تقليل الامتصاص.',
        'تحذير إطالة QT: يُستخدم بحذر مع تاريخ عائلي لاضطراب نظم القلب أو أدوية تطيل QT.',
        'يُستخدم بحذر في القصور الكبدي؛ إيقافه عند ظهور يرقان أو بول داكن.',
        'صلاحية المعلق بعد التحضير/الفتح ٥ إلى ١٠ أيام؛ يُحفظ مبرَّداً إن أمكن.'
    ]
  },

  // 17. Diasmect 20% Suspension
  {
    id: 'diasmect-20-susp',
    name: 'Diasmect 20% Susp. 60ml',
    genericName: 'Diosmectite',
    concentration: '1g/5ml (20%)',
    price: 23,
    matchKeywords: [
        'antidiarrheal', 'diosmectite', 'diasmect', 'smectite', 'adsorbent', 'diarrhea', 'intestinal pain',
        'دياسمكت', 'ديازمكت', 'سميكتا', 'اسهال', 'مغص', 'نزلة معوية', 'حماية الامعاء'
    ],
    usage: 'ممتز للسموم يحمي جدار الأمعاء ويقلل الإسهال والألم البطني، آمن للأطفال والبالغين.',
    timing: '٢-٣ مرات يومياً ويفضل بين الوجبات.',
    category: Category.ANTIDIARRHEAL, 
    form: 'Suspension',
    
    minAgeMonths: 1, 
    maxAgeMonths: 1200,
    minWeight: 4,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216) {
            return '١٥ مل (ملعقة كبيرة) ٣ مرات يومياً بين الوجبات (صباح/ظهيرة/مساء) — المدة: حتى توقف الإسهال. في الإسهال الحاد: جرعة مضاعفة أول يوم (٣٠ مل ٣ مرات)';
        }
        if (ageMonths >= 24) {
            return '١٠ مل ٣ مرات يومياً بين الوجبات (صباح/ظهيرة/مساء) — المدة: حتى توقف الإسهال';
        }
        if (ageMonths >= 12) {
            return '٥ مل ٣ مرات يومياً بين الوجبات (صباح/ظهيرة/مساء) — المدة: حتى توقف الإسهال';
        }
        return '٥ مل مرتين يومياً بين الوجبات (صباح/مساء) — المدة: حتى توقف الإسهال';
    },
    
    warnings: [
        'يفصل عن الأدوية الأخرى بساعتين على الأقل لأنه قد يقلل امتصاصها.',
        ...W_RED_FLAGS_GI,
        ...W_DEHYDRATION,
        'قد يسبب إمساكاً خفيفاً.',
        'إمساك شديد: الجرعات تُوقف.',
        'يُستخدم بحذر في تاريخ انسداد معوي أو إمساك مزمن.'
    ]
  },

  // 18. Lacteol Forte 10 Billion Sachets
  {
    id: 'lacteol-forte-6-sachets',
    name: 'Lacteol forte 10 billion 6 sachet',
    genericName: 'Lactobacillus LB (Inactivated)',
    concentration: '10 Billion Cells',
    price: 120,
    matchKeywords: [
        'probiotic', 'diarrhea', 'lacteol forte', 'intestinal flora', 'digestive health',
        'لاكتيول فورت', 'بكتيريا نافعة', 'اسهال', 'توازن الامعاء', 'علاج الاسهال', 'خمائر معوية'
    ],
    usage: 'بروبيوتك/بوستبيوتك لاستعادة توازن الأمعاء وتقليل الإسهال الحاد والمصاحب للمضادات الحيوية.',
    timing: 'قبل الأكل أو مع الوجبة.',
    category: Category.ANTIDIARRHEAL, 
    form: 'Sachets',
    
    minAgeMonths: 0, 
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216) {
            return 'كيس واحد مرتين يومياً (صباح/مساء) — المدة: ٥–٧ أيام. في الإسهال الحاد: كيسين دفعة واحدة في اليوم الأول ثم كيس واحد مرتين يومياً';
        }
        return 'كيس واحد مرة إلى مرتين يومياً (صباح/مساء) — المدة: ٥–٧ أيام حسب شدة الإسهال';
    },
    
    warnings: [
        'المشروبات الساخنة أو الكحولية قد تقلل فاعلية المكونات.',
        'فاصل ساعتين عن جرعة المضاد الحيوي يقلل التداخل.',
        'يُستخدم بحذر في ضعف المناعة الشديد أو بعد زرع نخاع.',
        ...W_RED_FLAGS_GI
    ]
  },

  // 19. Gastrobiotic 550mg F.C. Tablets
  {
    id: 'gastrobiotic-550-tabs',
    name: 'Gastrobiotic 550mg 30 F.C. Tablets',
    genericName: 'Rifaximin',
    concentration: '550mg',
    price: 516,
    matchKeywords: [
        'antibiotic', 'rifaximin', 'gastrobiotic', 'ibs-d', 'hepatic encephalopathy', 'sibo', 'traveler diarrhea',
        'جاستروبيوتك', 'ريفاكسيمين', 'قولون عصبي', 'اسهال المسافرين', 'غيبوبة كبدية', 'بكتيريا الامعاء'
    ],
    usage: 'مضاد حيوي غير ممتص لعلاج القولون العصبي المصحوب بإسهال (IBS-D)، فرط نمو بكتيريا الأمعاء، والوقاية من الاعتلال الدماغي الكبدي.',
    timing: 'حسب الاستطباب: كل ٨ ساعات (IBS-D) أو كل ١٢ ساعة (اعتلال دماغي كبدي) بغض النظر عن الطعام.',
    category: Category.ANTIBIOTICS, 
    form: 'F.C. Tablets',
    
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216 && weight >= 40) {
            return 'IBS-D/SIBO: ٥٥٠ مجم كل ٨ ساعات لمدة ١٤ يوم. اعتلال دماغي كبدي: ٥٥٠ مجم كل ١٢ ساعة بانتظام طويل المدى.';
        }
        return 'لا يُنصح به أقل من ١٨ سنة لعدم توافر بيانات كافية.';
    },
    
    warnings: [
        'الحمل: بيانات محدودة؛ يُستخدم فقط إذا فاقت الفائدة الخطر. الرضاعة: الحذر واجب رغم الامتصاص الضئيل.',
        'قد يسبب ارتفاعاً خفيفاً في أنزيمات الكبد؛ متابعة إنزيمات الكبد مفيدة في مرضى الكبد، مع الحذر في Child-Pugh C.',
        'إذا ظهر إسهال مائي شديد أو دموي أثناء/بعد الكورس: احتمال التهاب قولون مرتبط بمضاد حيوي؛ إيقاف الدواء.',
        'الاستعمال المطوّل قد يزيد خطر المقاومة البكتيرية.'
    ]
  },

  // 20. Enterogermina 4 Billion Oral Suspension
  {
    id: 'enterogermina-4b-10-vials',
    name: 'Enterogermina 4 billion/5ml 10 Mini Bottles',
    genericName: 'Bacillus clausii spores',
    concentration: '4 billion spores / 5ml',
    price: 200,
    matchKeywords: [
        'probiotic', 'diarrhea', 'bacillus clausii', 'intestinal flora', 'enterogermina 4000', 'antibiotic-associated diarrhea',
        'انتروجيرمينا ٤ مليار', 'بكتيريا نافعة', 'اسهال شديد', 'ترميم الامعاء', 'بعد المضاد الحيوي'
    ],
    usage: 'بروبيوتك بتركيز أعلى لاستعادة التوازن المعوي في الإسهال الشديد أو المصاحب للمضادات الحيوية.',
    timing: 'مرة واحدة يومياً بين الوجبات (كل ٢٤ ساعة) ويمكن زيادتها إلى مرتين يومياً في الحالات الشديدة.',
    category: Category.ANTIDIARRHEAL, 
    form: 'Oral Suspension',
    
    minAgeMonths: 1, 
    maxAgeMonths: 1200,
    minWeight: 4,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216) {
            return 'قنينة واحدة مرة يومياً بين الوجبات — المدة: ٥–٧ أيام. في الحالات الشديدة: قنينتين يومياً (صباح/مساء)';
        }
        if (ageMonths >= 1) {
            return 'قنينة واحدة يومياً بين الوجبات — المدة: ٥–٧ أيام. للرضع: يمكن تقسيمها على جرعتين في اليوم';
        }
        return 'جرعة خاصة لحديثي الولادة/المبتسرين.';
    },
    
    warnings: [
        'تحذير شديد: للاستخدام عن طريق الفم فقط؛ غير مناسب للحقن تحت أي ظرف.',
        'فاصل ساعتين على الأقل عن جرعة المضاد الحيوي.',
        'لا يحتاج للحفظ في الثلاجة (يتحمل حتى ٣٠ درجة مئوية).',
        'قد تظهر تكتلات بسيطة داخل القنينة نتيجة تجمع الأبواغ، وهذا لا يؤثر على جودة الدواء.'
    ]
  },
  
// 21. Imoflora 2/125mg 20 Tablets
  {
    id: 'imoflora-2-125-20-tabs',
    name: 'Imoflora 2/125mg 20 Tablets',
        genericName: 'Loperamide + Simethicone',
    concentration: '2mg / 125mg',
        price: 64,
    matchKeywords: [
        'antidiarrheal', 'loperamide', 'simethicone', 'imoflora', 'bloating', 'diarrhea relief', 'cramps',
        'ايموفلورا', 'ايموفلورا بلس', 'وقف الاسهال', 'مضاد للاسهال', 'انتفاخات', 'غازات مع الاسهال'
    ],
    usage: 'لتخفيف الإسهال الحاد غير المصحوب بعدوى معوية مع غازات وتقلصات.',
    timing: 'عند اللزوم بعد أول براز رخو.',
    category: Category.ANTIDIARRHEAL, 
    form: 'Tablet',
    
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) {
            return 'قرصان في البداية، ثم قرص واحد بعد كل براز رخو — الحد الأقصى: ٤ أقراص/يوم (٨ مجم لوبراميد) وبحد أقصى ٤٨ ساعة';
        } else {
            return 'غير مناسب للأطفال أقل من ١٢ سنة.';
        }
    },
    
    warnings: [
        ...W_RED_FLAGS_GI,
        ...W_DEHYDRATION,
        'لا يُستخدم في التهاب القولون التقرحي النشط أو إسهال بعد المضادات الحيوية (احتمال C. difficile).',
        'الجرعات الزائدة قد تسبب اضطراب نظم القلب؛ الحد الأقصى: ٤ أقراص/يوم.',
        'يُستخدم بحذر في مرضى الكبد.'
    ]
  },

  // 22. Gastrobiotic 200mg F.C. Tablets
  {
    id: 'gastrobiotic-200-tabs',
    name: 'Gastrobiotic 200mg 30 F.C. Tablets',
        genericName: 'Rifaximin',
    concentration: '200mg',
        price: 243,
    matchKeywords: [
        'antibiotic', 'rifaximin', 'gastrobiotic', 'traveler diarrhea', 'ibs-d', 'intestinal antiseptic',
        'جاستروبيوتك ٢٠٠', 'ريفاكسيمين', 'اسهال المسافرين', 'قولون عصبي', 'مطهر معوي', 'بكتيريا الامعاء'
    ],
    usage: 'مضاد حيوي غير ممتص لعلاج إسهال المسافرين غير المصحوب بدم/حمى (عادة بسبب E. coli).',
    timing: 'كل ٨ ساعات (٣ مرات يومياً) مع أو بدون طعام.',
    category: Category.ANTIBIOTICS, 
    form: 'F.C. Tablets',
    
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) {
            return 'قرص واحد (٢٠٠ مجم) كل ٨ ساعات (صباح/عصر/مساء) — المدة: ٣ أيام متتالية';
        } else {
            return 'لا ينصح باستخدامه للأطفال أقل من ١٢ سنة.';
        }
    },
    
    warnings: [
        'لا يُستخدم إذا كان الإسهال مصحوباً بحرارة أو دم أو أعراض عدوى غازية.',
        'الحمل: بيانات محدودة؛ يُستخدم عند الضرورة فقط.',
        'يُستخدم بحذر في القصور الكبدي الشديد (Child-Pugh C).',
        'علامات تحتاج تقييم: عدم تحسن الإسهال خلال ٤٨ ساعة.'
    ]
  },

  // 23. Hidrasec 100mg Capsules
  {
    id: 'hidrasec-100-caps',
    name: 'Hidrasec 100mg 10 Capsules',
        genericName: 'Racecadotril',
    concentration: '100mg',
        price: 109,
    matchKeywords: [
        'antidiarrheal', 'racecadotril', 'hidrasec', 'antisecretory', 'acute diarrhea',
        'هيدراسيك', 'اسهال حاد', 'منظم لافرازات الامعاء', 'مضاد للاسهال', 'هيدراسيك ١٠٠'
    ],
    usage: 'علاج عرضي للإسهال الحاد لدى البالغين بتقليل إفراز السوائل المعوية دون إبطاء حركة الأمعاء.',
    timing: 'قبل الوجبات ٣ مرات يومياً (كل ٨ ساعات).',
    category: Category.ANTIDIARRHEAL, 
    form: 'Capsule',
    
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216) {
            return 'كبسولة واحدة (١٠٠ مجم) في البداية، ثم كبسولة واحدة قبل كل وجبة (٣ مرات يومياً) — المدة: حتى يتوقف الإسهال (بحد أقصى ٧ أيام)';
        } else {
            return 'للأطفال: يُستخدم أكياس "هيدراسيك أطفال" (١٠ مجم أو ٣٠ مجم) حسب الوزن.';
        }
    },
    
    warnings: [
        ...W_RED_FLAGS_GI,
        ...W_DEHYDRATION,
        'الإسهال المرتبط بالمضادات الحيوية يحتاج تقييم السبب (احتمال C. difficile) قبل العلاج العرضي.',
        'الحمل والرضاعة: يُستخدم بحذر وعند الضرورة فقط.',
        'حد أقصى لمدة العلاج: ٧ أيام.'
    ]
  },

  // 24. Imoflora 2/125mg 10 Tablets
  {
    id: 'imoflora-2-125-10-tabs',
    name: 'Imoflora 2/125mg 10 Tablets',
        genericName: 'Loperamide + Simethicone',
    concentration: '2mg / 125mg',
        price: 32,
    matchKeywords: [
        'antidiarrheal', 'loperamide', 'simethicone', 'imoflora', 'bloating', 'diarrhea relief', 'cramps',
        'ايموفلورا', 'ايموفلورا بلس', 'وقف الاسهال', 'مضاد للاسهال', 'انتفاخات', 'غازات مع الاسهال'
    ],
    usage: 'لتخفيف الإسهال الحاد غير المصحوب بعدوى مع غازات وتقلصات (عبوة ١٠ أقراص).',
    timing: 'عند اللزوم بعد أول براز رخو.',
    category: Category.ANTIDIARRHEAL, 
    form: 'Tablet',
    
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) {
            return 'قرصان في البداية، ثم قرص واحد بعد كل براز رخو — الحد الأقصى: ٤ أقراص/يوم وبحد أقصى ٤٨ ساعة';
        } else {
            return 'غير مناسب للأطفال أقل من ١٢ سنة.';
        }
    },
    
    warnings: [
        ...W_RED_FLAGS_GI,
        ...W_DEHYDRATION,
        'لا يُستخدم في التهاب القولون التقرحي النشط أو إسهال بعد المضادات الحيوية.',
        'الجرعة الزائدة قد تسبب اضطراب نظم القلب؛ الحد الأقصى: ٤ أقراص/يوم.'
    ]
  },

  // 25. Delzosin 600mg F.C. Tablets
  {
    id: 'delzosin-600-tabs',
    name: 'Delzosin 600mg 3 F.C. Tablets',
        genericName: 'Azithromycin',
    concentration: '600mg',
        price: 52,
    matchKeywords: [
        'antibiotic', 'azithromycin', 'delzosin', 'tonsillitis', 'sinusitis', 'respiratory infection',
        'ديلزوسين', 'دلوزوسين', 'مضاد حيوي', 'مضاد حيوي ٣ ايام', 'التهاب اللوز', 'عدوى تنفسية'
    ],
    usage: 'مضاد حيوي ماكروليد لعلاج التهابات الجهاز التنفسي العلوي/السفلي عند البالغين.',
    timing: 'مرة واحدة يومياً (كل ٢٤ ساعة) في موعد ثابت، قبل الأكل بساعة أو بعده بساعتين.',
    category: Category.ANTIBIOTICS, 
    form: 'F.C. Tablets',
    
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144 && weight >= 45) {
            return 'قرص واحد (٦٠٠ مجم) مرة يومياً (صباحاً) — المدة: ٣ أيام متتالية (نفس الموعد كل ٢٤ ساعة)';
        } else {
            const doseMg = doseMgFromMgPerKg(weight, 10, { maxMg: 600, roundStepMg: 1 });
            return `للأطفال: ${doseMg > 0 ? doseMg : 'جرعة خاصة'} مجم مرة يومياً — المدة: ٣ أيام (يُفضل استخدام الشراب)`;
        }
    },
    
    warnings: [
        'إطالة QT محتملة؛ يُتجنب مع أدوية تطيل QT أو اضطراب نظم القلب.',
        'يُفصل ساعتين عن مضادات الحموضة المحتوية على ألومنيوم/مغنيسيوم.',
        'الحمل والرضاعة: يُستخدم عند الضرورة.',
        'إيقاف الدواء إذا ظهرت أعراض كبدية (يرقان/بول داكن/ألم أعلى يمين البطن).'
    ]
  },

  // 26. Cipro 500mg 10 F.C. Tablets
  {
    id: 'cipro-500-tabs',
    name: 'Cipro 500mg 10 F.C. Tablets',
        genericName: 'Ciprofloxacin',
    concentration: '500mg',
        price: 53,
    matchKeywords: [
        'antibiotic', 'ciprofloxacin', 'cipro', 'uti', 'prostatitis', 'typhoid', 'bacterial infection',
        'سيبرو', 'سيبروفلوكساسين', 'مضاد حيوي', 'التهاب مسالك بولية', 'عدوى بكتيرية', 'صديد بول'
    ],
    usage: 'فلوروكينولون للبالغين لعلاج التهابات المسالك البولية والكلى والبروستاتا وعدوى الجهاز الهضمي.',
    timing: 'كل ١٢ ساعة على معدة فارغة (ساعة قبل الأكل أو ساعتين بعده).',
    category: Category.ANTIBIOTICS, 
    form: 'F.C. Tablets',
    
    minAgeMonths: 216, 
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216 && weight >= 50) {
            return 'قرص واحد (٥٠٠ مجم) كل ١٢ ساعة على معدة فارغة (صباح/مساء) — المدة: ٥–٧ أيام للعدوى البسيطة-المتوسطة، ١٤ يوماً للعدوى الشديدة أو البروستاتا';
        } else {
            return 'غير مناسب لمن هم تحت سن ١٨ عاماً بسبب مخاطر الأوتار والغضاريف.';
        }
    },
    
    warnings: [
        'يُفصل ساعتين قبل أو ٤ ساعات بعد أملاح الكالسيوم/الحديد/الزنك ومضادات الحموضة.',
        'تحذير الأوتار: ألم بالأوتار يستلزم إيقاف الدواء؛ يزيد الخطر مع الكورتيكوستيرويدات وكبار السن.',
        'الحمل والرضاعة: غير موصى به بسبب مخاطر على الغضاريف.',
        'يزيد حساسية الجلد للشمس؛ تقليل التعرض المباشر + واقٍ شمسي.'
    ]
  },

  // 27. Cryptonaz 100mg/5ml Suspension
  {
    id: 'cryptonaz-100-susp',
    name: 'Cryptonaz 100mg/5ml Susp. 60ml',
        genericName: 'Nitazoxanide',
    concentration: '100mg/5ml',
        price: 39,
    matchKeywords: [
        'antiprotozoal', 'nitazoxanide', 'cryptonaz', 'cryptosporidium', 'giardiasis', 'amoebiasis', 'diarrhea',
        'كريبتوناز', 'نيتازوكسانيد', 'مطهر معوي', 'اسهال طفيلي', 'اميبا', 'جيارديا', 'نزلات معوية'
    ],
    usage: 'مضاد للطفيليات (أميبا، جيارديا، كريبتوسبوريديوم) للأطفال.',
    timing: 'كل ١٢ ساعة مع الطعام.',
    category: Category.ANTIDIARRHEAL, 
    form: 'Suspension',
    
    minAgeMonths: 12, 
    maxAgeMonths: 144, 
    minWeight: 8,
    maxWeight: 45,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) {
            return '٢٥ مل (٥٠٠ مجم) كل ١٢ ساعة مع الطعام (صباح/مساء) — المدة: ٣ أيام. يُفضل التحول للأقراص لهذه الفئة.';
        }
        if (ageMonths >= 48) {
            return '١٠ مل كل ١٢ ساعة مع الطعام (صباح/مساء) — المدة: ٣ أيام';
        }
        if (ageMonths >= 12) {
            return '٥ مل كل ١٢ ساعة مع الطعام (صباح/مساء) — المدة: ٣ أيام';
        }
        return 'غير موصى به أقل من ١٢ شهراً.';
    },
    
    warnings: [
        'مع الطعام لزيادة الامتصاص وتقليل اضطراب المعدة.',
        'قد يسبب تلون البول بالأصفر الداكن مؤقتاً؛ غير مقلق.',
        'يُستخدم خلال ٧ أيام من التحضير ويحفظ في درجة حرارة الغرفة.',
        'الحمل: بيانات محدودة؛ يُتجنب في الثلث الأول.'
    ]
  },

  // 28. Delzosin 600mg 6 F.C. Tablets
  {
    id: 'delzosin-600-6-tabs',
    name: 'Delzosin 600mg 6 F.C. Tablets',
        genericName: 'Azithromycin',
    concentration: '600mg',
        price: 104,
    matchKeywords: [
        'antibiotic', 'azithromycin', 'delzosin', 'tonsillitis', 'sinusitis', 'respiratory infection',
        'ديلزوسين', 'دلوزوسين', 'مضاد حيوي', 'التهاب اللوز', 'عدوى تنفسية'
    ],
    usage: 'مضاد حيوي ماكروليد لعلاج التهابات الجهاز التنفسي العلوي/السفلي للبالغين.',
    timing: 'مرة واحدة يومياً (كل ٢٤ ساعة) في موعد ثابت، قبل الأكل بساعة أو بعده بساعتين.',
    category: Category.ANTIBIOTICS, 
    form: 'F.C. Tablets',
    
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144 && weight >= 45) {
            return 'قرص واحد (٦٠٠ مجم) مرة يومياً (صباحاً) — المدة: ٣ أيام متتالية (نفس الموعد كل ٢٤ ساعة)';
        } else {
            const doseMg = doseMgFromMgPerKg(weight, 10, { maxMg: 600, roundStepMg: 1 });
            return `للأطفال: ${doseMg > 0 ? doseMg : 'جرعة خاصة'} مجم مرة يومياً — المدة: ٣ أيام (يُفضل استخدام الشراب)`;
        }
    },
    
    warnings: [
        'تحذير إطالة QT؛ يُتجنب مع اضطراب نظم القلب أو أدوية تطيل QT.',
        'يُفصل ساعتين عن مضادات الحموضة المحتوية على ألومنيوم/مغنيسيوم.',
        'الحمل/الرضاعة: بيانات محدودة؛ الاستخدام عند الضرورة فقط.',
        'إيقافه عند ظهور أعراض كبدية أو حساسية شديدة.'
    ]
  },

  // 29. Azithromycin-aug 500mg 6 F.C. Tablets
  {
    id: 'azithromycin-aug-500-tabs',
    name: 'Azithromycin-aug 500mg 6 F.C. Tablets',
        genericName: 'Azithromycin',
    concentration: '500mg',
        price: 126,
    matchKeywords: [
        'antibiotic', 'azithromycin', 'azithromycin-aug', 'tonsillitis', 'respiratory infection', 'macrolide',
        'أزيثروميسين أوج', 'مضاد حيوي', 'أزيثروميسين', 'التهاب اللوز', 'عدوى تنفسية'
    ],
    usage: 'مضاد حيوي ماكروليد لعلاج التهابات الجهاز التنفسي والجلد لدى البالغين.',
    timing: 'مرة واحدة يومياً في موعد ثابت (قبل الأكل بساعة أو بعده بساعتين).',
    category: Category.ANTIBIOTICS, 
    form: 'F.C. Tablets',
    
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144 && weight >= 45) {
            return 'قرص واحد (٥٠٠ مجم) مرة يومياً (صباحاً) — المدة: ٣ أيام (نفس الموعد كل ٢٤ ساعة)';
        } else {
            const doseMg = doseMgFromMgPerKg(weight, 10, { maxMg: 500, roundStepMg: 1 });
            return `للأطفال: ${doseMg > 0 ? doseMg : 'جرعة خاصة'} مجم مرة يومياً — المدة: ٣ أيام (يُفضل استخدام الشراب)`;
        }
    },
    
    warnings: [
        'تحذير إطالة QT؛ يُتجنب مع أدوية تطيل QT أو اضطراب نظم القلب.',
        'يُفصل ساعتين عن مضادات الحموضة المحتوية على ألومنيوم/مغنيسيوم.',
        'الحمل/الرضاعة: بيانات محدودة؛ الاستخدام عند الضرورة فقط.',
        'إيقافه عند ظهور حساسية شديدة أو أعراض كبدية.'
    ]
  },

  // 30. Diax 220mg/5ml Suspension
  {
    id: 'diax-220-susp',
    name: 'Diax 220mg/5ml Susp. 60ml',
        genericName: 'Nifuroxazide',
    concentration: '220mg/5ml',
        price: 32,
    matchKeywords: [
        'antidiarrheal', 'nifuroxazide', 'diax', 'intestinal antiseptic', 'gastroenteritis', 'diarrhea', 'pediatric',
        'دياكس شراب', 'دياكس', 'مطهر معوي للأطفال', 'اسهال', 'نزلة معوية', 'ميكروب معوي'
    ],
    usage: 'مطهر معوي غير ممتص لعلاج الإسهال البكتيري عند الرضع والأطفال.',
    timing: '٢-٣ مرات يومياً حسب العمر، مع الأكل أو بدونه.',
    category: Category.ANTIDIARRHEAL, 
    form: 'Suspension',
    
    minAgeMonths: 2, 
    maxAgeMonths: 180, 
    minWeight: 5,
    maxWeight: 60,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 72) {
            return '٥ مل (٢٢٠ مجم) كل ٨ ساعات (صباح/عصر/مساء) — المدة: ٣–٥ أيام';
        }
        if (ageMonths >= 6) {
            return '٢.٥–٥ مل (١١٠–٢٢٠ مجم) كل ٨ ساعات (صباح/عصر/مساء) — المدة: ٣–٥ أيام';
        }
        if (ageMonths >= 2) {
            return '٢.٥ مل (١١٠ مجم) كل ١٢ ساعة (صباح/مساء) — المدة: ٣–٥ أيام';
        }
        return 'جرعة خاصة للأطفال أقل من شهرين.';
    },
    
    warnings: [
        ...W_DEHYDRATION,
        ...W_RED_FLAGS_GI,
        'عدم التحسن خلال ٤٨–٧٢ ساعة يستلزم تقييماً.',
        'يُحفظ أقل من ٣٠° ويُفضل استخدامه خلال ٣٠ يوماً من الفتح.',
        'لا يعالج العدوى خارج الأمعاء لأنه غير ممتص.'
    ]
  },

// 31. Lacteol Forte 5 Billion 12 Capsules
  {
    id: 'lacteol-forte-5b-12-caps',
    name: 'Lacteol forte 5 billion 12 cap',
        genericName: 'Lactobacillus LB (Inactivated)',
    concentration: '5 Billion Cells',
        price: 126,
    matchKeywords: [
        'probiotic', 'diarrhea', 'lacteol forte', 'intestinal flora', 'digestive health', 'capsules',
        'لاكتيول فورت كبسول', 'بكتيريا نافعة', 'اسهال', 'توازن الامعاء', 'علاج الاسهال', 'خمائر معوية'
    ],
    usage: 'بروبيوتك/بوستبيوتك للمساعدة في تقليل الإسهال واستعادة توازن الأمعاء.',
    timing: 'قبل الأكل أو مع الوجبة.',
    category: Category.ANTIDIARRHEAL, 
    form: 'Capsule',
    
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) {
            return 'كبسولة واحدة مرتين يومياً (صباح/مساء) — المدة: ٥–٧ أيام. في الإسهال الحاد: كبسولتين في اليوم الأول ثم كبسولة واحدة مرتين يومياً';
        } else if (ageMonths >= 72 && ageMonths < 144) {
            return 'كبسولة واحدة مرتين يومياً (صباح/مساء) — المدة: ٥–٧ أيام';
        } else {
            return 'للأطفال الأصغر: يُفضل استخدام "الأكياس" لسهولة الاستخدام أو فتح الكبسولة وإذابة محتواها في الماء.';
        }
    },
    
    warnings: [
        'المشروبات الساخنة تقلل فاعلية المكونات؛ الخلط يكون بماء/لبن/زبادي بارد أو بدرجة الغرفة.',
        'يمكن تناوله مع المضادات الحيوية؛ فاصل ساعتين يقلل التداخل.',
        'يُستخدم بحذر في ضعف المناعة الشديد أو بعد زرع أعضاء.',
        ...W_RED_FLAGS_GI
    ]
  },

  // 32. Diomacte 10 Sachets
  {
    id: 'diomacte-10-sachets',
    name: 'Diomacte 10 Sachets',
        genericName: 'Diosmectite',
    concentration: '3g',
        price: 18.5,
    matchKeywords: [
        'antidiarrheal', 'diosmectite', 'diomacte', 'smecta', 'adsorbent', 'diarrhea', 'gastritis',
        'ديوماكت', 'ديوماكت أكياس', 'سميكتا', 'اسهال', 'مطهر معوي', 'حماية المعدة', 'نزلات معوية'
    ],
    usage: 'ممتز للسموم يحمي الغشاء المخاطي ويقلل الإسهال.',
    timing: '٣ مرات يومياً (يفضل بين الوجبات).',
    category: Category.ANTIDIARRHEAL, 
    form: 'Sachets',
    
    minAgeMonths: 0, 
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) {
            return 'كيس واحد ٣ مرات يومياً؛ يمكن مضاعفة الجرعة في أول يوم إذا كان الإسهال شديداً.';
        }
        if (ageMonths >= 24) {
            return 'كيس واحد ٢-٣ مرات يومياً.';
        }
        if (ageMonths >= 12) {
            return 'كيس واحد يومياً إلى كيسين يومياً (يُقسم على جرعات).';
        }
        return 'كيس واحد يومياً يُقسم على جرعات صغيرة.';
    },
    
    warnings: [
        'يفصل عن الأدوية الأخرى بساعتين على الأقل لأنه قد يقلل امتصاصها.',
        ...W_RED_FLAGS_GI,
        ...W_DEHYDRATION,
        'قد يسبب إمساكاً؛ تُخفض الجرعة إذا حدث ذلك.'
    ]
  },

  // 33. Cipro 500mg 20 F.C. Tablets
  {
    id: 'cipro-500-20-tabs',
    name: 'Cipro 500mg 20 F.C. Tablets',
        genericName: 'Ciprofloxacin',
    concentration: '500mg',
        price: 54,
    matchKeywords: [
        'antibiotic', 'ciprofloxacin', 'cipro', 'uti', 'prostatitis', 'typhoid', 'bacterial infection',
        'سيبرو', 'سيبروفلوكساسين', 'مضاد حيوي', 'التهاب مسالك بولية', 'عدوى بكتيرية', 'صديد بول', 'سيبرو ٥٠٠'
    ],
    usage: 'فلوروكينولون للبالغين لعلاج التهابات المسالك البولية المعقدة والبروستاتا وعدوى الجهاز الهضمي.',
    timing: 'كل ١٢ ساعة على معدة فارغة (ساعة قبل الأكل أو ساعتين بعده).',
    category: Category.ANTIBIOTICS, 
    form: 'F.C. Tablets',
    
    minAgeMonths: 216, 
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216 && weight >= 50) {
            return '٥٠٠ مجم كل ١٢ ساعة لمدة ٧-١٤ يوماً حسب شدة العدوى.';
        } else {
            return 'غير مفضل لمن هم تحت سن ١٨ عاماً.';
        }
    },
    
    warnings: [
        'يُفصل ساعتين قبل أو ٤ ساعات بعد أملاح الكالسيوم/الحديد/الزنك ومضادات الحموضة.',
        'تحذير الأوتار: ألم بالأوتار يستلزم إيقاف الدواء؛ يزداد الخطر مع الكورتيكوستيرويدات.',
        'الحمل والرضاعة: غير موصى به.',
        'يزيد حساسية الجلد للشمس؛ تقليل التعرض المباشر + واقٍ شمسي.'
    ]
  },

  // 34. Coloverin SR 200mg 30 Capsules
  {
    id: 'coloverin-sr-200-caps',
    name: 'Coloverin SR 200mg 30 Capsules',
        genericName: 'Mebeverine Hydrochloride',
    concentration: '200mg',
        price: 63,
    matchKeywords: [
        'antispasmodic', 'mebeverine', 'coloverin sr', 'ibs', 'irritable bowel syndrome', 'abdominal pain',
        'كولوفيرين اس ار', 'كولوفيرين', 'ميبفرين', 'قولون عصبي', 'تشنجات الامعاء', 'مغص', 'تقلصات'
    ],
    usage: 'مضاد للتقلصات لعلاج أعراض القولون العصبي وتشنجات الأمعاء لدى البالغين.',
    timing: 'مرتين يومياً قبل الأكل بـ ٢٠ دقيقة.',
    category: Category.ANTISPASMODIC, 
    form: 'S.R. Capsule',
    
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216) {
            return 'كبسولة واحدة مرتين يومياً (كل ١٢ ساعة) قبل الأكل بـ ٢٠ دقيقة.';
        } else {
            return 'لا يوصى باستخدامه للأطفال والمراهقين تحت ١٨ سنة؛ ويفضل استخدام "كولوفيرين" العادي أو الشراب.';
        }
    },
    
    warnings: [
        'غير مناسب في حالات شلل الأمعاء.',
        'الحمل/الرضاعة: بيانات محدودة؛ الاستخدام عند الضرورة فقط.',
        'عدم التحسن خلال أسبوعين يستلزم إعادة التقييم.',
        'قد يسبب دوخة خفيفة؛ الحذر عند القيادة إذا حدث ذلك.'
    ]
  },

  // 35. Doxydox 100mg 10 Capsules
  {
    id: 'doxydox-100-caps',
    name: 'Doxydox 100mg 10 Capsules',
        genericName: 'Doxycycline',
    concentration: '100mg',
        price: 23,
    matchKeywords: [
        'antibiotic', 'doxycycline', 'doxydox', 'acne', 'respiratory infection', 'malaria prophylaxis', 'tetracycline',
        'دوكسيدوكس', 'دوكسيسيكلين', 'مضاد حيوي', 'حب الشباب', 'عدوى بكتيرية', 'التهاب الشعب الهوائية'
    ],
    usage: 'مضاد حيوي واسع المدى لعلاج التهابات الجهاز التنفسي وبعض العدوى الجلدية وحب الشباب والوقاية من الملاريا.',
    timing: 'مرة أو مرتين يومياً بعد الأكل مع كوب ماء كبير.',
    category: Category.ANTIBIOTICS, 
    form: 'Capsule',
    
    minAgeMonths: 96, 
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { // 12 years and above
            return 'اليوم الأول: ١٠٠ مجم كل ١٢ ساعة. من اليوم الثاني: ١٠٠ مجم يومياً (أو كل ١٢ ساعة في الحالات الشديدة).';
        } else if (ageMonths >= 96 && ageMonths < 144) { // 8 to 12 years
            return 'يتم حساب الجرعة بدقة: ٤ مجم لكل كجم من وزن الطفل تقسم على جرعتين في اليوم الأول، ثم ٢ مجم لكل كجم يومياً.';
        } else {
            return 'غير مناسب للأطفال أقل من ٨ سنوات لأنه قد يسبب تصبغاً دائماً للأسنان وتأثيراً على نمو العظام.';
        }
    },
    
    warnings: [
        'غير مناسب في الحمل والرضاعة والأطفال <٨ سنوات (خطر على الأسنان والعظام).',
        'يفصل ساعتين عن الحليب والكالسيوم/الحديد ومضادات الحموضة.',
        'يزيد حساسية الجلد للشمس؛ تقليل التعرض المباشر + واقٍ شمسي.',
        'قد يسبب اضطراب معدي؛ تناوله بعد الطعام يقلل ذلك.'
    ]
  },

  // 36. Wellocryptase 100mg/5ml pd. for oral susp. 60 ml
  {
    id: 'wellocryptase-100-susp',
    name: 'Wellocryptase 100mg/5ml pd. for oral susp. 60 ml',
        genericName: 'Nitazoxanide',
    concentration: '100mg/5ml',
        price: 39,
    matchKeywords: [
        'diarrhea', 'nitazoxanide', 'wellocryptase', 'parasites', 'antiprotozoal', 'amoeba', 'giardia',
        'ويلوكريبتاز', 'نيتازوكسانيد', 'اسهال', 'طفيليات', 'مطهر معوي', 'اميبا', 'نزلات معوية'
    ],
    usage: 'مضاد للطفيليات (أميبا، جيارديا، كريبتوسبوريديوم) للأطفال.',
    timing: 'كل ١٢ ساعة مع الطعام.',
    category: Category.ANTIDIARRHEAL, 
    form: 'Suspension',
    
    minAgeMonths: 12, 
    maxAgeMonths: 1200,
    minWeight: 8,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) {
            return '٢٥ مل (٥٠٠ مجم) كل ١٢ ساعة مع الطعام لمدة ٣ أيام؛ يُفضل الأقراص لهذه الفئة.';
        }
        if (ageMonths >= 48) {
            return '١٠ مل كل ١٢ ساعة مع الطعام لمدة ٣ أيام.';
        }
        if (ageMonths >= 12) {
            return '٥ مل كل ١٢ ساعة مع الطعام لمدة ٣ أيام.';
        }
        return 'غير موصى به أقل من ١٢ شهراً.';
    },
    
    warnings: [
        'مع الطعام لتحسين الامتصاص.',
        'قد يسبب تلون البول بالأصفر الداكن مؤقتاً.',
        'صلاحية المعلق بعد التحضير ٧ أيام في درجة حرارة الغرفة.',
        'الحمل: بيانات محدودة؛ يُتجنب في الثلث الأول.'
    ]
  },

  // 37. Diax 200mg 12 Capsules
  {
    id: 'diax-200-caps',
    name: 'Diax 200mg 12 Capsules',
        genericName: 'Nifuroxazide',
    concentration: '200mg',
        price: 21,
    matchKeywords: [
        'antidiarrheal', 'nifuroxazide', 'diax', 'intestinal antiseptic', 'gastroenteritis', 'diarrhea',
        'دياكس كبسول', 'دياكس ٢٠٠', 'مطهر معوي', 'اسهال', 'نزلة معوية', 'ميكروب معوي'
    ],
    usage: 'مطهر معوي غير ممتص لعلاج الإسهال البكتيري الحاد للبالغين.',
    timing: 'كل ٦ ساعات (٤ مرات يومياً).',
    category: Category.ANTIDIARRHEAL, 
    form: 'Capsule',
    
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144 && weight >= 40) {
            return '٢٠٠ مجم كل ٦ ساعات لمدة ٣ إلى ٥ أيام؛ الحد الأقصى ٨٠٠ مجم/يوم.';
        } else {
            return 'للأطفال تُستخدم المعلقات بجرعات مناسبة للعمر.';
        }
    },
    
    warnings: [
        ...W_DEHYDRATION,
        ...W_RED_FLAGS_GI,
        'الحمل: يُفضل تجنبه في الثلث الأول لعدم كفاية البيانات.',
        'لا يُستخدم إذا وُجد دم بالبراز أو حرارة مرتفعة.'
    ]
  },

  // 38. Stoprrhea 2 mg 10 orodispersible tabs.
  {
    id: 'stoprrhea-2-odt',
    name: 'Stoprrhea 2 mg 10 orodispersible tabs.',
        genericName: 'Loperamide',
    concentration: '2mg',
        price: 10,
    matchKeywords: [
        'antidiarrheal', 'loperamide', 'stoprrhea', 'odt', 'orodispersible', 'fast melt', 'diarrhea',
        'ستوبريا', 'لوبراميد', 'وقف الاسهال', 'مضاد للاسهال', 'أقراص تذوب في الفم', 'إسهال مفاجئ'
    ],
    usage: 'علاج عرضي للإسهال الحاد غير المصحوب بعدوى (بدون دم/حمى).',
    timing: 'عند اللزوم بعد أول براز رخو.',
    category: Category.ANTIDIARRHEAL, 
    form: 'Orodispersible Tablet',
    
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) {
            return 'قرصان في البداية، ثم قرص واحد بعد كل براز رخو. الحد الأقصى ٤ أقراص/يوم وبحد أقصى ٤٨ ساعة.';
        } else {
            return 'غير مناسب للأطفال أقل من ١٢ سنة.';
        }
    },
    
    warnings: [
        ...W_RED_FLAGS_GI,
        ...W_DEHYDRATION,
        'الجرعات الزائدة قد تسبب اضطراب نظم القلب (إطالة QT).',
        'الإمساك أو الانتفاخ الشديد: الجرعات تُوقف.',
        'الحد الأقصى: ٤ أقراص/يوم وبحد أقصى ٤٨ ساعة.'
    ]
  },

  // 39. Stoprrhea 2 mg 30 orodispersible tabs.
  {
    id: 'stoprrhea-2-30-odt',
    name: 'Stoprrhea 2 mg 30 orodispersible tabs.',
        genericName: 'Loperamide',
    concentration: '2mg',
        price: 96,
    matchKeywords: [
        'antidiarrheal', 'loperamide', 'stoprrhea', 'odt', 'orodispersible', 'fast melt', 'diarrhea',
        'ستوبريا', 'لوبراميد', 'وقف الاسهال', 'مضاد للاسهال', 'أقراص تذوب في الفم', 'عبوة توفير'
    ],
    usage: 'علاج عرضي للإسهال الحاد غير المصحوب بعدوى (عبوة ٣٠ قرص).',
    timing: 'عند اللزوم بعد أول براز رخو.',
    category: Category.ANTIDIARRHEAL, 
    form: 'Orodispersible Tablet',
    
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) {
            return 'قرصان في البداية، ثم قرص واحد بعد كل براز رخو. الحد الأقصى ٤ أقراص/يوم وبحد أقصى ٤٨ ساعة.';
        } else {
            return 'غير مناسب للأطفال أقل من ١٢ سنة.';
        }
    },
    
    warnings: [
        ...W_RED_FLAGS_GI,
        ...W_DEHYDRATION,
        'الجرعات الزائدة قد تسبب اضطراب نظم القلب؛ الحد الأقصى: ٤ أقراص/يوم.',
        'الإمساك أو الانتفاخ الشديد: الجرعات تُوقف.',
        'الحد الأقصى لمدة الاستخدام: ٤٨ ساعة.'
    ]
  },

  // 40. Lopranest 2 mg 20 orodispersible films
  {
    id: 'lopranest-2-20-odf',
    name: 'Lopranest 2 mg 20 orodispersible films',
        genericName: 'Loperamide',
    concentration: '2mg',
        price: 90,
    matchKeywords: [
        'antidiarrheal', 'loperamide', 'lopranest', 'odf', 'orodispersible film', 'diarrhea', 'fast relief',
        'لوبرانيست', 'لوبراميد', 'فيلم يذوب في الفم', 'وقف الاسهال', 'إسهال حاد', 'أفلام رقيقة'
    ],
    usage: 'علاج عرضي للإسهال الحاد غير المصحوب بعدوى باستخدام شرائح فموية ذائبة.',
    timing: 'عند اللزوم بعد أول براز رخو.',
    category: Category.ANTIDIARRHEAL, 
    form: 'Orodispersible Film',
    
    minAgeMonths: 144, 
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) {
            return 'فيلمان في البداية، ثم فيلم واحد بعد كل براز رخو. الحد الأقصى ٤ أفلام/يوم وبحد أقصى ٤٨ ساعة.';
        } else {
            return 'غير مناسب للأطفال أقل من ١٢ سنة.';
        }
    },
    
    warnings: [
        ...W_RED_FLAGS_GI,
        ...W_DEHYDRATION,
        'الجرعات الزائدة قد تسبب اضطراب نظم القلب؛ الحد الأقصى: ٤ أفلام/يوم.',
        'الإمساك أو الانتفاخ الشديد: الجرعات تُوقف.',
        'الحد الأقصى لمدة الاستخدام: ٤٨ ساعة.'
    ]
  },


];

