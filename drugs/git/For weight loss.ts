import { Medication, Category } from '../../types';

const ORLISTAT_DOSE_RULE: Medication['calculationRule'] = (_weight, ageMonths) => {
    if (ageMonths >= 144) {
        return '١ كبسولة (١٢٠ مجم) مع كل وجبة رئيسية تحتوي على دهون أو خلال ساعة بعدها ٣ مرات يومياً لمدة ٤–١٢ أسبوع (حد أقصى ٣ كبسولات/يوم).';
    }

    return 'غير موصى به أقل من ١٢ سنة.';
};

const W_ORLISTAT: Medication['warnings'] = [
    'الحمل والرضاعة: غير مناسب (إنقاص الوزن غير موصى به أثناء الحمل، وقد يقلل امتصاص المغذيات).',
    'التداخلات: ليفوثيروكسين—يلزم فصل ٤ ساعات، وقد تظهر/تسوء أعراض قصور الغدة.',
    'التداخلات: سيكلوسبورين—قد تنخفض المستويات؛ يحتاج فصل زمني ومتابعة مستويات الدواء.',
    'التداخلات: وارفارين/مضادات التجلط—قد يتغير التأثير عبر فيتامين K؛ قد تلزم متابعة INR.',
    'تحذيرات: غير مناسب في متلازمة سوء الامتصاص المزمن أو الركود الصفراوي.',
    'علامات تستلزم تقييماً عاجلاً: ألم بطني شديد، يرقان، بول غامق.',
    'آثار شائعة: براز دهني/غازات/إلحاح تبرز، وتزيد مع الوجبات عالية الدهون.',
    'الفيتامينات الذائبة في الدهون (A,D,E,K): مكمل متعدد الفيتامينات مثل "Multivitamin" يُفضل قبل النوم وبفاصل ساعتين على الأقل.',
    'الحذر مع تاريخ حصوات كلى/قصور كلوي (قد يزيد خطر حصوات أوكسالات لدى بعض المرضى).'
];

export const WEIGHT_LOSS_MEDS: Medication[] = [

    // 1. Quick-Slim 120mg 30 caps.
  {
    id: 'quick-slim-120-caps',
    name: 'Quick-Slim 120mg 30 Capsules',
    genericName: 'Orlistat',
    concentration: '120mg',
    price: 240,
    matchKeywords: [
        'weight loss', 'obesity', 'orlistat', 'quick slim', 'fat blocker', 'lipase inhibitor', 'bmi', 'fat absorption',
        'كويك سليم', 'أورليستات', 'تخسيس', 'إنقاص وزن', 'علاج السمنة', 'حارق دهون', 'موانع امتصاص الدهون', 'تنحيف'
    ],
    usage: 'دواء لإنقاص الوزن مع حمية قليلة السعرات: يقلل امتصاص الدهون الغذائية عبر تثبيط إنزيمات الليباز في المعدة/الأمعاء (يعمل موضعياً).',
    timing: '٣ مرات يومياً مع الوجبة الرئيسية/خلال ساعة بعدها – ٤–١٢ أسبوع',
    category: Category.WEIGHT_LOSS,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: ORLISTAT_DOSE_RULE,

    warnings: W_ORLISTAT
  },

  // 2. Regimax 120mg 30 caps.
  {
    id: 'regimax-120-caps',
    name: 'Regimax 120mg 30 Capsules',
    genericName: 'Orlistat',
    concentration: '120mg',
    price: 240,
    matchKeywords: [
        'weight loss', 'obesity', 'orlistat', 'regimax', 'fat blocker', 'lipase inhibitor', 'weight management',
        'ريجيماكس', 'أورليستات', 'تخسيس', 'إنقاص وزن', 'علاج السمنة', 'موانع امتصاص الدهون', 'تنحيف'
    ],
    usage: 'دواء لإنقاص الوزن مع حمية قليلة السعرات: يقلل امتصاص الدهون الغذائية عبر تثبيط إنزيمات الليباز.',
    timing: '٣ مرات يومياً مع الوجبة الرئيسية/خلال ساعة بعدها – ٤–١٢ أسبوع',
    category: Category.WEIGHT_LOSS,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: ORLISTAT_DOSE_RULE,

    warnings: W_ORLISTAT
  },

  // 3. Royal regime herbal tea 2 gm*25 filter bags
  {
    id: 'royal-regime-tea-25-bags',
    name: 'Royal Regime Herbal Tea 2 gm 25 filter bags',
    genericName: 'Chicory + Senna + Fennel',
    concentration: '2gm per bag',
    price: 25,
    matchKeywords: [
        'weight loss', 'slimming tea', 'laxative', 'herbal tea', 'royal regime', 'senna', 'constipation', 'detox',
        'رويال ريجيم', 'شاي ريجيم', 'شاي تخسيس', 'أعشاب تخسيس', 'ملين', 'سنامكي', 'شيكوريا', 'شمر'
    ],
    usage: 'شاي أعشاب ذو تأثير مُلين (بسبب السنا) قد يفيد في الإمساك العارض. لا يُعد علاجاً للسمنة؛ نزول الوزن يكون غالباً سوائل/محتوى أمعاء وليس دهوناً.',
    timing: 'كيس مساءً – حتى ٧ أيام عند الحاجة',
    category: Category.WEIGHT_LOSS,
    form: 'Sachets',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (_weight, ageMonths) => {
        if (ageMonths >= 144) {
            return '١ كيس يُنقع في ماء مغلي ٥–١٠ دقائق ويُشرب مساءً عند الحاجة للإمساك العارض لمدة حتى ٧ أيام متتالية فقط.';
        }

        return 'غير موصى به أقل من ١٢ سنة.';
    },

    warnings: [
        'الحمل: غير مناسب (السنا مُلين منشّط وقد يسبب تقلصات/إسهال وجفاف واضطراب أملاح).',
        'التداخلات: الإسهال/نقص البوتاسيوم قد يزيد سمّية الديجوكسين واضطراب النظم؛ ويزداد خطر نقص البوتاسيوم مع المدرات/الكورتيكوستيرويدات.',
        'تحذيرات: غير مناسب عند ألم بطني شديد غير مُشخّص، انسداد/شلل الأمعاء، التهاب قولون نشط، أو الجفاف الشديد.',
        'الاستخدام المتواصل يزيد خطر تعوّد/كسل أمعاء واضطراب أملاح. استمرار الإمساك أكثر من أسبوع يستلزم تقييماً.',
        'مغص/إسهال قد يحدثان؛ الإسهال الشديد يستلزم الإيقاف وتقليل المدة/الجرعة لاحقاً.'
    ]
  },

  // 4. Royal regime herbal tea 2 gm*50 filter bags
  {
    id: 'royal-regime-tea-50-bags',
    name: 'Royal Regime Herbal Tea 2 gm 50 filter bags',
    genericName: 'Chicory + Senna + Fennel',
    concentration: '2gm per bag',
    price: 45,
    matchKeywords: [
        'weight loss', 'slimming tea', 'laxative', 'herbal tea', 'royal regime', 'senna', 'savings pack', 'digestive health',
        'رويال ريجيم', 'شاي ريجيم', 'شاي تخسيس', 'أعشاب تخسيس', 'ملين', 'عبوة اقتصادية', '٥٠ كيس', 'صحة الهضم'
    ],
    usage: 'شاي أعشاب ذو تأثير مُلين (بسبب السنا) قد يفيد في الإمساك العارض. لا يُعد علاجاً للسمنة.',
    timing: 'كيس مساءً – حتى ٧ أيام عند الحاجة',
    category: Category.WEIGHT_LOSS,
    form: 'Sachets',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (_weight, ageMonths) => {
        if (ageMonths >= 144) {
            return '١ كيس يُنقع في ماء مغلي ٥–١٠ دقائق ويُشرب مساءً عند الحاجة لمدة حتى ٧ أيام متتالية فقط.';
        }

        return 'غير موصى به أقل من ١٢ سنة.';
    },

    warnings: [
        'الحمل: غير مناسب (ملين منشّط).',
        'التداخلات: نقص البوتاسيوم مع المدرات/الكورتيكوستيرويدات قد يزيد اضطراب النظم أو سمّية الديجوكسين.',
        'تحذيرات: غير مناسب عند ألم بطني شديد غير مُشخّص، انسداد/شلل أمعاء، التهاب قولون نشط، أو جفاف.',
        'الاستخدام المتواصل يزيد خطر تعوّد واضطراب أملاح. الاحتياج المتكرر يستلزم تقييماً.'
    ]
  },

  // 5. Delfat 500 mg 30 caps.
  {
    id: 'delfat-500-caps',
    name: 'Delfat 500 mg 30 Capsules',
    genericName: 'Chitosan',
    concentration: '500mg',
    price: 49.5,
    matchKeywords: [
        'weight loss', 'obesity', 'chitosan', 'delfat', 'fat binder', 'fiber', 'natural weight loss', 'cholesterol',
        'دلفات', 'شيتوزان', 'تخسيس', 'إنقاص وزن', 'موانع امتصاص الدهون', 'ألياف طبيعية', 'سمنة', 'كوليسترول'
    ],
    usage: 'مكمل غذائي من ألياف (شيتوزان) قد يساعد بعض الأشخاص في تقليل تناول الدهون/زيادة الشبع. لا يُعتمد عليه وحده لإنقاص الوزن.',
    timing: '٣ مرات يومياً قبل الأكل بـ ١٥–٣٠ دقيقة – ٤–٨ أسابيع',
    category: Category.WEIGHT_LOSS,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (_weight, ageMonths) => {
        if (ageMonths >= 144) {
            return '١ كبسولة قبل الوجبات الرئيسية بـ ١٥–٣٠ دقيقة مع كوب ماء كبير ٣ مرات يومياً لمدة ٤–٨ أسابيع (يمكن ٢ كبسولة قبل الوجبة حسب التحمل).';
        }

        return 'غير موصى به أقل من ١٢ سنة.';
    },

    warnings: [
        'الحمل: بيانات غير كافية، وإنقاص الوزن غير مناسب أثناء الحمل.',
        'التداخلات: قد يقلل امتصاص بعض الأدوية والفيتامينات الذائبة في الدهون—الفصل ساعتين على الأقل عن الأدوية الأخرى يقلل ذلك.',
        'تحذيرات: غير مناسب عند حساسية القشريات/المأكولات البحرية (قد يكون مستخلصاً منها).',
        'قد يسبب إمساكاً/انتفاخاً إذا قل شرب الماء؛ ألم بطني شديد أو إمساك شديد يستلزم الإيقاف والتقييم.'
    ]
  },
  // 6. Organo-orlistat 120 mg 20 capsules
  {
    id: 'organo-orlistat-120-caps',
    name: 'Organo-orlistat 120 mg 20 Capsules',
    genericName: 'Orlistat',
    concentration: '120mg',
    price: 66.5,
    matchKeywords: [
        'weight loss', 'obesity', 'orlistat', 'organo orlistat', 'fat blocker', 'lipase inhibitor', 'weight control',
        'أورجانو أورليستات', 'أورليستات', 'تخسيس', 'إنقاص وزن', 'علاج السمنة', 'موانع امتصاص الدهون', 'تنحيف'
    ],
    usage: 'دواء لإنقاص الوزن مع حمية قليلة السعرات: يقلل امتصاص الدهون الغذائية عبر تثبيط إنزيمات الليباز (يعمل موضعياً).',
    timing: '٣ مرات يومياً مع الوجبة الرئيسية/خلال ساعة بعدها – ٤–١٢ أسبوع',
    category: Category.WEIGHT_LOSS,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: ORLISTAT_DOSE_RULE,

    warnings: W_ORLISTAT
  },

  // 7. Orlistat 120mg 30 capsules
  {
    id: 'orlistat-eva-120-caps',
    name: 'Orlistat 120mg 30 Capsules',
    genericName: 'Orlistat',
    concentration: '120mg',
    price: 249,
    matchKeywords: [
        'weight loss', 'obesity', 'orlistat', 'eva pharma', 'fat blocker', 'lipase inhibitor', 'bmi reduction',
        'أورليستات', 'أورليستات إيفا', 'تخسيس', 'إنقاص وزن', 'علاج السمنة', 'حارق دهون', 'موانع امتصاص الدهون'
    ],
    usage: 'دواء لإنقاص الوزن مع حمية قليلة السعرات: يقلل امتصاص الدهون الغذائية عبر تثبيط إنزيمات الليباز.',
    timing: '٣ مرات يومياً مع الوجبة الرئيسية/خلال ساعة بعدها – ٤–١٢ أسبوع',
    category: Category.WEIGHT_LOSS,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: ORLISTAT_DOSE_RULE,

    warnings: W_ORLISTAT
  },

  // 8. Sylvester 1 - 20 caps.
  {
    id: 'sylvester-1-20-caps',
    name: 'Sylvester 1 - 20 Capsules',
    genericName: 'Chromium (e.g., picolinate) + Garcinia cambogia extract + Gymnema sylvestre extract',
    concentration: 'Multi-Ingredient',
    price: 150,
    matchKeywords: [
        'weight loss', 'obesity', 'sylvester 1', 'appetite suppressant', 'sugar craving', 'fat burner', 'metabolism',
        'سيلفستر ١', 'سيلفستر وان', 'سد الشهية', 'تخسيس', 'إنقاص وزن', 'حرق سكريات', 'جارسينيا', 'كروميوم'
    ],
    usage: 'مكمل غذائي قد يساعد بعض الأشخاص في تقليل الشهية/الرغبة في السكريات ودعم التحكم في الوزن مع الحمية والرياضة. لا يُعد بديلاً للعلاج الطبي للسمنة أو السكري.',
    timing: '٢–٣ مرات يومياً قبل الأكل بـ ٣٠–٦٠ دقيقة – ٤–٨ أسابيع',
    category: Category.WEIGHT_LOSS,
    form: 'Capsule',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (_weight, ageMonths) => {
        if (ageMonths >= 216) {
            return '١ كبسولة قبل الأكل بـ ٣٠–٦٠ دقيقة ٢–٣ مرات يومياً لمدة ٤–٨ أسابيع (تجنب الجرعة المتأخرة إذا سبب أرق).';
        }

        return 'غير موصى به أقل من ١٨ سنة.';
    },

    warnings: [
        'الحمل والرضاعة: يُتجنب (بيانات الأمان غير كافية، وإنقاص الوزن غير مناسب أثناء الحمل).',
                'التداخلات: قد يزيد خطر هبوط السكر عند تناوله مع أدوية السكري/الإنسولين؛ قد يلزم متابعة سكر الدم وتعديل العلاج.',
                'تحذيرات: أمراض كبد/كلى شديدة قد تجعل استخدامه غير مناسب. أعراض كبدية (اصفرار/بول غامق/ألم أعلى البطن) تستلزم تقييماً عاجلاً.',
        'قد يسبب اضطراب معدة أو صداع/أرق لدى بعض الأشخاص.'
    ]
  },

  // 9. Orly 120mg 30 caps.
  {
    id: 'orly-120-caps',
    name: 'Orly 120mg 30 Capsules',
    genericName: 'Orlistat',
    concentration: '120mg',
    price: 240,
    matchKeywords: [
        'weight loss', 'obesity', 'orlistat', 'orly', 'sigma', 'fat blocker', 'lipase inhibitor', 'slimming',
        'أورلي', 'أورليستات', 'تخسيس', 'إنقاص وزن', 'علاج السمنة', 'حارق دهون', 'موانع امتصاص الدهون', 'سيجما'
    ],
    usage: 'دواء لإنقاص الوزن مع حمية قليلة السعرات: يقلل امتصاص الدهون الغذائية عبر تثبيط إنزيمات الليباز.',
    timing: '٣ مرات يومياً مع الوجبة الرئيسية/خلال ساعة بعدها – ٤–١٢ أسبوع',
    category: Category.WEIGHT_LOSS,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: ORLISTAT_DOSE_RULE,

    warnings: W_ORLISTAT
  },

  // 10. Tulango-slim 30 caps.
  {
    id: 'tulango-slim-30-caps',
    name: 'Tulango-slim 30 Capsules',
    genericName: 'Green coffee bean extract + Green tea extract + Garcinia cambogia extract + Chromium',
    concentration: 'Natural Extract Blend',
    price: 295,
    matchKeywords: [
        'weight loss', 'obesity', 'tulango slim', 'appetite suppressant', 'metabolism booster', 'fat burner', 'natural slimming',
        'تولانجو سليم', 'تولانجو', 'تولانجو كبسول', 'سد الشهية', 'تخسيس', 'إنقاص وزن', 'حارق دهون', 'مكونات طبيعية'
    ],
    usage: 'مكمل غذائي قد يدعم التحكم في الوزن مع الحمية والرياضة. يحتوي عادةً على منبهات (كافيين من الشاي/القهوة) وقد لا يناسب بعض المرضى.',
    timing: '٢–٣ مرات يومياً قبل الأكل بـ ٣٠–٦٠ دقيقة – ٤–٨ أسابيع',
    category: Category.WEIGHT_LOSS,
    form: 'Capsule',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (_weight, ageMonths) => {
        if (ageMonths >= 216) {
            return '١ كبسولة قبل الإفطار وقبل الغداء بـ ٣٠–٦٠ دقيقة (ويمكن ١ كبسولة قبل العشاء بشرط عدم التأخر لتجنب الأرق) لمدة ٤–٨ أسابيع.';
        }

        return 'غير موصى به أقل من ١٨ سنة.';
    },

    warnings: [
        'الحمل والرضاعة: يُتجنب (بيانات الأمان غير كافية، وقد يحتوي كافيين/مستخلصات).',
        'التداخلات: قد يزيد خطر هبوط السكر عند مرضى السكري مع أدوية السكر (بسبب الكروم)؛ راقب سكر الدم.',
        'تحذيرات: الحذر مع ضغط مرتفع غير منضبط، اضطراب نظم/خفقان، قلق شديد أو أرق.',
                'قد يسبب أرقاً/خفقاناً/اضطراب معدة؛ شدة الأعراض تستلزم الإيقاف والتقييم.'
    ]
  },
  // 11. Orlismart 120mg 10 caps.
  {
    id: 'orlismart-120-caps',
    name: 'Orlismart 120mg 10 Capsules',
    genericName: 'Orlistat',
    concentration: '120mg',
    price: 55.5,
    matchKeywords: [
        'weight loss', 'obesity', 'orlistat', 'orlismart', 'fat blocker', 'lipase inhibitor', 'weight management',
        'أورلي سمارت', 'أورليسمارت', 'أورليستات', 'تخسيس', 'إنقاص وزن', 'علاج السمنة', 'موانع امتصاص الدهون'
    ],
    usage: 'دواء لإنقاص الوزن مع حمية قليلة السعرات: يقلل امتصاص الدهون الغذائية عبر تثبيط إنزيمات الليباز.',
    timing: '٣ مرات يومياً مع الوجبة الرئيسية/خلال ساعة بعدها – ٤–١٢ أسبوع',
    category: Category.WEIGHT_LOSS,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: ORLISTAT_DOSE_RULE,

    warnings: W_ORLISTAT
  },

  // 12. Grapexon advance 30 caps.
  {
    id: 'grapexon-advance-30-caps',
    name: 'Grapexon advance 30 Capsules',
    genericName: 'Grape seed extract + Green coffee extract + Green tea extract + Chromium',
    concentration: 'Natural Formula',
    price: 285,
    matchKeywords: [
        'weight loss', 'obesity', 'grapexon advance', 'antioxidant', 'metabolism', 'fat burner', 'natural slimming',
        'جرابيكسون أدفانس', 'جرابيكسون', 'تخسيس', 'إنقاص وزن', 'حرق دهون', 'مضاد أكسدة', 'خلاصة بذور العنب'
    ],
    usage: 'مكمل غذائي قد يدعم التحكم في الوزن/النشاط الأيضي لدى بعض الأشخاص. لا يغني عن الحمية والرياضة، وليس علاجاً للسكري أو الدهون.',
    timing: '٢–٣ مرات يومياً قبل الأكل بـ ٣٠ دقيقة – ٤–٨ أسابيع',
    category: Category.WEIGHT_LOSS,
    form: 'Capsule',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (_weight, ageMonths) => {
        if (ageMonths >= 216) {
            return '١ كبسولة قبل الإفطار وقبل الغداء بـ ٣٠ دقيقة (ويمكن ١ كبسولة قبل العشاء إذا لم تسبب أرقاً) لمدة ٤–٨ أسابيع.';
        }

        return 'غير موصى به أقل من ١٨ سنة.';
    },

    warnings: [
        'الحمل والرضاعة: يُتجنب (بيانات الأمان غير كافية).',
        'التداخلات: قد يزيد خطر هبوط السكر مع أدوية السكري (بسبب الكروم)؛ راقب سكر الدم.',
        'تحذيرات: الحذر مع الضغط المرتفع غير المنضبط، اضطراب نظم/خفقان، قلق شديد أو أرق (لاحتمال وجود كافيين).',
                'تحذيرات: أعراض حساسية أو أعراض كبدية (اصفرار/بول غامق/ألم أعلى البطن) تستلزم الإيقاف والتقييم.'
    ]
  },

  // 13. Orlismart 120mg 30 caps.
  {
    id: 'orlismart-120-30-caps',
    name: 'Orlismart 120mg 30 Capsules',
    genericName: 'Orlistat',
    concentration: '120mg',
    price: 249,
    matchKeywords: [
        'weight loss', 'obesity', 'orlistat', 'orlismart', 'fat blocker', 'lipase inhibitor', 'weight management', 'savings pack',
        'أورلي سمارت', 'أورليسمارت', 'أورليستات', 'تخسيس', 'إنقاص وزن', 'علاج السمنة', 'موانع امتصاص الدهون', 'عبوة ٣٠ كبسولة'
    ],
    usage: 'دواء لإنقاص الوزن مع حمية قليلة السعرات: يقلل امتصاص الدهون الغذائية عبر تثبيط إنزيمات الليباز.',
    timing: '٣ مرات يومياً مع الوجبة الرئيسية/خلال ساعة بعدها – ٤–١٢ أسبوع',
    category: Category.WEIGHT_LOSS,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: ORLISTAT_DOSE_RULE,

    warnings: W_ORLISTAT
  },

  // 14. Slim safe 120mg 30 caps.
  {
    id: 'slim-safe-120-caps',
    name: 'Slim safe 120mg 30 Capsules',
    genericName: 'Orlistat',
    concentration: '120mg',
    price: 162,
    matchKeywords: [
        'weight loss', 'obesity', 'orlistat', 'slim safe', 'fat blocker', 'lipase inhibitor', 'weight management',
        'سليم سيف', 'أورليستات', 'تخسيس', 'إنقاص وزن', 'علاج السمنة', 'موانع امتصاص الدهون', 'تنحيف'
    ],
    usage: 'دواء لإنقاص الوزن مع حمية قليلة السعرات: يقلل امتصاص الدهون الغذائية عبر تثبيط إنزيمات الليباز.',
    timing: '٣ مرات يومياً مع الوجبة الرئيسية/خلال ساعة بعدها – ٤–١٢ أسبوع',
    category: Category.WEIGHT_LOSS,
    form: 'Capsule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: ORLISTAT_DOSE_RULE,

    warnings: W_ORLISTAT
  },

  // 15. Topging advance 30 caps.
  {
    id: 'topging-advance-30-caps',
    name: 'Topging advance 30 Capsules',
    genericName: 'Garcinia cambogia extract + Green tea extract + Ginger + Chromium',
    concentration: 'Natural Formula',
    price: 360,
    matchKeywords: [
        'weight loss', 'obesity', 'topging advance', 'metabolism booster', 'fat burner', 'appetite control', 'ginger',
        'توب جينج أدفانس', 'توب جينج', 'تخسيس', 'إنقاص وزن', 'حرق دهون', 'سد شهية', 'زنجبيل', 'شاي أخضر'
    ],
    usage: 'مكمل غذائي قد يدعم التحكم في الوزن/الشهية لدى بعض الأشخاص. لا يُعد علاجاً للسكري أو ضغط الدم، ولا يغني عن الحمية والرياضة.',
    timing: '٢–٣ مرات يومياً قبل الأكل بـ ٣٠ دقيقة – ٤–٨ أسابيع',
    category: Category.WEIGHT_LOSS,
    form: 'Capsule',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (_weight, ageMonths) => {
        if (ageMonths >= 216) {
            return '١ كبسولة قبل الإفطار وقبل الغداء بـ ٣٠ دقيقة (ويمكن ١ كبسولة قبل العشاء إذا لم تسبب أرقاً/خفقاناً) لمدة ٤–٨ أسابيع.';
        }

        return 'غير موصى به أقل من ١٨ سنة.';
    },

    warnings: [
        'الحمل والرضاعة: يُتجنب (بيانات الأمان غير كافية).',
        'التداخلات: قد يزيد خطر هبوط السكر مع أدوية السكري (بسبب الكروم)—راقب سكر الدم.',
        'تحذيرات: الحذر مع الضغط المرتفع غير منضبط/خفقان/اضطراب نظم (لاحتمال وجود كافيين).',
                'تحذيرات: أعراض كبدية (اصفرار/بول غامق/ألم أعلى البطن) أو نزيف غير معتاد تستلزم الإيقاف والتقييم.',
                'قد يسبب تهيج معدة؛ قرحة نشطة قد تجعل استخدامه غير مناسب.'
    ]
  },

  // 16. Slimanizer 30 caps.
  {
    id: 'slimanizer-30-caps',
    name: 'Slimanizer 30 Capsules',
    genericName: 'Psyllium husk (fiber) + Apple pectin (fiber) + Chromium + Garcinia cambogia extract',
    concentration: 'Natural Fiber Blend',
    price: 300,
    matchKeywords: [
        'weight loss', 'obesity', 'slimanizer', 'appetite suppressant', 'satiety', 'fiber', 'natural slimming',
        'سليمانايزر', 'سليمانيزر', 'تخسيس', 'إنقاص وزن', 'سد شهية', 'ألياف طبيعية', 'إحساس بالشبع', 'سمنة'
    ],
    usage: 'مكمل غني بالألياف لزيادة الإحساس بالشبع وقد يساعد على تقليل الشهية لدى بعض الأشخاص. لا يُستخدم كبديل لنظام غذائي متوازن.',
    timing: 'مرتين يومياً قبل الأكل بـ ٣٠–٦٠ دقيقة – ٤–٨ أسابيع',
    category: Category.WEIGHT_LOSS,
    form: 'Capsule',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (_weight, ageMonths) => {
        if (ageMonths >= 216) {
            return '١ كبسولة قبل الغداء و١ كبسولة قبل العشاء بـ ٣٠–٦٠ دقيقة مع كوب ماء كبير لمدة ٤–٨ أسابيع (يمكن ٢ كبسولة قبل الوجبة حسب التحمل).';
        }

        return 'غير موصى به أقل من ١٨ سنة.';
    },

    warnings: [
        'الحمل والرضاعة: يُتجنب (لوجود خليط أعشاب/كروم، وإنقاص الوزن غير مناسب أثناء الحمل).',
        'التداخلات: الألياف قد تقلل امتصاص أدوية كثيرة (مثل ليفوثيروكسين/حديد/بعض الأدوية الفموية)—افصل ساعتين على الأقل.',
                'تحذيرات: غير مناسب في ضيق المريء أو صعوبة بلع أو انسداد أمعاء. خطر اختناق/انسداد يزيد عند عدم وجود ماء كافٍ مع الجرعة.',
        'قد يسبب انتفاخاً/غازات في البداية؛ ابدأ بجرعة أقل وزد تدريجياً.',
        'مرضى السكري: راقب سكر الدم لاحتمال تحسن الحساسية للأنسولين مع الكروم.'
    ]
  },
];

