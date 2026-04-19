import { Medication, Category } from '../../types';

const toAr = (n: number | string) => n.toString().replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
const roundTo = (n: number, step: number): number => {
    if (!Number.isFinite(n) || !Number.isFinite(step) || step <= 0) return n;
    return Math.round(n / step) * step;
};

const formatRange = (low: number, high: number, step = 1) => {
    const lowR = roundTo(low, step);
    const highR = roundTo(high, step);
    return `${toAr(lowR)}–${toAr(highR)}`;
};

const W_ALLERGY = ['حساسية شديدة (طفح منتشر/تورم/ضيق تنفس) تستلزم تقييماً عاجلاً.'];
const W_RED_FLAGS_LIVER = [
    'علامات تستلزم تقييماً عاجلاً: يرقان متزايد، ألم شديد أعلى البطن، حرارة، قيء مستمر، أو بول غامق مع حكة شديدة.',
];

export const LIVER_SUPPORT_SUPPLEMENTS: Medication[] = [

    // 1. Ursoplus 250mg 20 capsules
  {
    id: 'ursoplus-250-caps',
    name: 'Ursoplus 250mg 20 capsules',
    genericName: 'Ursodeoxycholic acid',
    concentration: '250mg',
    price: 174,
    matchKeywords: [
        'liver support', 'ursodeoxycholic acid', 'ursoplus', 'gallstones', 'cholestasis', 'bile duct',
        'أورسوبلس', 'أورسوديوكسي كوليك', 'مرارة', 'حصوات المرارة', 'تليف كبدي', 'دعم الكبد', 'سيولة الصفراء'
    ],
    usage: 'دواء حمض صفراوي (UDCA) يُستخدم لبعض أمراض الركود الصفراوي مثل التليف الصفراوي الأولي (PBC)، وقد يُستخدم لإذابة حصوات المرارة الكوليسترولية الصغيرة غير المتكلسة في حالات مختارة بعد تقييم وتشخيص.',
    timing: 'مقسمة على ٢–٣ جرعات يومياً مع الأكل – ٣–٦ أشهر',
    category: Category.LIVER_SUPPORT,
    form: 'Capsule',
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,
    calculationRule: (weight, ageMonths) => {
        const dailyDoseLow = weight * 10;
        const dailyDoseHigh = weight * 15;
        if (ageMonths < 72) {
            return 'أقل من ٦ سنوات: الشكل السائل أسهل للبلع لضبط الجرعة.';
        } else {
            const capsLow = Math.max(1, Math.round(dailyDoseLow / 250));
            const capsHigh = Math.max(1, Math.round(dailyDoseHigh / 250));
            return `${toAr(capsLow)}–${toAr(capsHigh)} كبسولة يومياً تُقسم على ٢–٣ جرعات مع الأكل لمدة ٣–٦ أشهر (الجرعة ${formatRange(dailyDoseLow, dailyDoseHigh)} مجم/يوم، أي ١٠–١٥ مجم/كجم/يوم).`;
        }
    },
    warnings: [
        'غير مناسب في: التهاب المرارة/القنوات المرارية الحاد، انسداد القنوات المرارية، أو المرارة غير الفعّالة.',
        'الحصوات المتكلسة أو الكبيرة غالباً لا تستجيب للإذابة؛ قرار إذابة الحصوات يعتمد على تقييم وتصوير.',
        'تداخلات تقلل الامتصاص: كوليسترامين/كوليستيبول/مضادات الحموضة المحتوية على ألومنيوم/فحم نشط؛ افصل 2-4 ساعات.',
        'الحمل/الرضاعة: بيانات الأمان محدودة؛ استخدامه يكون لأسباب واضحة وبعد تقييم.',
        ...W_RED_FLAGS_LIVER
    ]
  },

  // 2. Hipamax 20 capsules
  {
    id: 'hipamax-20-caps',
    name: 'Hipamax 20 capsules',
    genericName: 'Silymarin + Vitamin B Complex',
    concentration: 'Silymarin 140mg + B-Complex',
    price: 66,
    matchKeywords: [
        'liver support', 'silymarin', 'hipamax', 'hepatoprotective', 'fatty liver', 'vitamin b',
        'هيباماكس', 'سيليمارين', 'دعم الكبد', 'الكبد الدهني', 'فيتامين ب مركبة', 'حماية الكبد'
    ],
    usage: 'مكمل غذائي يحتوي على سيليمارين (Milk thistle) مع فيتامينات ب؛ قد يُستخدم كدعم غذائي في حالات إجهاد الكبد/الكبد الدهني مع الحمية وتقليل الوزن، ولا يُعد علاجاً لالتهاب/تليف الكبد.',
    timing: '٣ مرات يومياً بعد الأكل – ٤–٨ أسابيع',
    category: Category.LIVER_SUPPORT,
    form: 'Capsule',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) {
            return '١ كبسولة ٣ مرات يومياً بعد الوجبات لمدة ٤–٨ أسابيع.';
        } else {
            return 'لا توجد دراسات كافية لاستخدامه للأطفال دون ١٢ سنة.';
        }
    },
    warnings: [
        'غير مناسب عند حساسية لنبات السيليمارين أو عائلة الأقحوان.',
        ...W_ALLERGY,
        'قد يسبب اضطراباً هضمياً خفيفاً (غثيان/لين براز) أو طفحاً جلدياً.',
        'تداخلات محتملة: مميعات الدم (مثل وارفارين) وأدوية السكري قد تتطلب متابعة INR/سكر الدم عند الاستخدام المنتظم.',
        'الحمل/الرضاعة: بيانات الأمان غير كافية؛ الأفضل عدم الاستخدام.',
        'لا يغني عن علاج أسباب أمراض الكبد (فيروسات/دهون/أدوية/كحول) ولا يغني عن المتابعة الطبية.'
    ]
  },

  // 3. Hipamax Plus 20 capsules
  {
    id: 'hipamax-plus-20-caps',
    name: 'Hipamax plus 20 capsules',
    genericName: 'Silymarin + Antioxidants (Selenium, Vit E, Vit C, Zinc) + B-Complex',
    concentration: '140mg Silymarin + Multi-Antioxidants',
    price: 76,
    matchKeywords: [
        'liver support', 'antioxidants', 'hipamax plus', 'selenium', 'vitamin e', 'fatty liver',
        'هيباماكس بلس', 'سيليمارين بلس', 'سيلينيوم', 'كبد دهني', 'مضاد أكسدة', 'حماية الكبد'
    ],
    usage: 'مكمل غذائي (سيليمارين + مضادات أكسدة + فيتامينات/معادن) قد يُستخدم كدعم غذائي مع نمط الحياة في حالات الكبد الدهني. لا يُعد بديلاً لعلاج السبب أو للمتابعة الطبية.',
    timing: '٢–٣ مرات يومياً بعد الأكل – ٤–٨ أسابيع',
    category: Category.LIVER_SUPPORT,
    form: 'Capsule',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216) {
            return '١ كبسولة ٢–٣ مرات يومياً بعد الوجبات لمدة ٤–٨ أسابيع.';
        } else if (ageMonths >= 144) {
            return 'من ١٢ إلى أقل من ١٨ سنة: ١ كبسولة يومياً بعد الأكل لمدة ٤–٨ أسابيع.';
        } else {
            return 'غير مخصص للاستخدام للأطفال دون سن ١٢ عاماً.';
        }
    },
    warnings: [
        'غير مناسب عند حساسية لأي من المكونات.',
        ...W_ALLERGY,
        'الجرعات العالية قد تسبب سمّية السيلينيوم/الفيتامينات (خصوصاً E).',
        'تداخلات: فيتامين E قد يزيد خطر النزف مع مميعات الدم/مضادات الصفائح. الزنك قد يقلل امتصاص التتراسيكلين/الفلوروكينولون؛ افصل 2-4 ساعات.',
        'يستخدم بحذر مع اضطرابات الغدة الدرقية إذا كان يحتوي على سيلينيوم بجرعات مرتفعة.',
        'الحمل/الرضاعة: بيانات الأمان غير كافية؛ الأفضل عدم الاستخدام.'
    ]
  },

  // 4. Lolawest 3gm 6 sachets
  {
    id: 'lolawest-3gm-sachets',
    name: 'Lolawest 3gm 6 sachets',
    genericName: 'L-Ornithine L-Aspartate (LOLA)',
    concentration: '3gm',
    price: 96,
    matchKeywords: [
        'liver support', 'l-ornithine l-aspartate', 'lolawest', 'ammonia detox', 'hepatic encephalopathy',
        'لولاوست', 'أمونيا', 'غيبوبة كبدية', 'تليف الكبد', 'أورنيثين أسبارتات', 'فوار للكبد'
    ],
    usage: 'دواء (LOLA) قد يُستخدم لتقليل الأمونيا ودعم علاج اعتلال الدماغ الكبدي ضمن الخطة العلاجية (غالباً مع لاكتولوز ± ريفاكسيمين حسب الحالة).',
    timing: '١–٣ مرات يومياً مع الأكل – حسب الحالة',
    category: Category.LIVER_SUPPORT,
    form: 'Sachets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) {
            return '١ كيس يذاب في نصف كوب ماء ١–٣ مرات يومياً مع الأكل أو بعده مباشرة لمدة ١–٤ أسابيع.';
        } else {
            return 'لا توجد دراسات كافية لاستخدام LOLA في الأطفال.';
        }
    },
    warnings: [
        'غير مناسب في القصور الكلوي الشديد (خطر ارتفاع اليوريا/اضطراب الاستقلاب).',
        'قد يسبب غثياناً/قيئاً/ألم معدة.',
        'اعتلال الدماغ الكبدي حالة خطرة: أي تدهور بالوعي/نزيف/حمّى/قيء دموي يستلزم طوارئ.',
        'الحمل/الرضاعة: بيانات الأمان غير كافية؛ الأفضل عدم الاستخدام.'
    ]
  },

  // 5. Bional 30 capsules
  {
    id: 'bional-30-caps',
    name: 'Bional 30 capsules',
    genericName: 'Silymarin + Vitamin B Complex',
    concentration: 'Silymarin 140mg + B-Complex',
    price: 192,
    matchKeywords: [
        'liver support', 'silymarin', 'bional', 'hepatoprotective', 'fatty liver',
        'بيونال', 'سيليمارين', 'دعم الكبد', 'الكبد الدهني', 'تجديد الكبد', 'فيتامين ب'
    ],
    usage: 'مكمل غذائي يحتوي على سيليمارين مع فيتامينات ب؛ قد يُستخدم كدعم غذائي في حالات إجهاد الكبد/الكبد الدهني مع الحمية ونمط الحياة. لا يُعد علاجاً للتليف أو لالتهاب الكبد الفيروسي.',
    timing: '٣ مرات يومياً بعد الأكل – ٤–٨ أسابيع',
    category: Category.LIVER_SUPPORT,
    form: 'Capsule',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) {
            return '١ كبسولة ٣ مرات يومياً بعد الأكل لمدة ٤–٨ أسابيع.';
        } else {
            return 'غير مناسب للأطفال دون سن ١٢ عاماً.';
        }
    },
    warnings: [
        'غير مناسب عند حساسية لنبات "شوك الحليب".',
        ...W_ALLERGY,
        'قد يسبب اضطراباً معدياً خفيفاً أو طفحاً جلدياً.',
        'تداخلات محتملة: الحذر مع مميعات الدم (مثل وارفارين) وأدوية السكري (تابع INR/سكر الدم إذا لزم).',
        'الحمل/الرضاعة: بيانات الأمان غير كافية؛ الأفضل عدم الاستخدام.'
    ]
  },
];

