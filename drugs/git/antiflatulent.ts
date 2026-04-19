import { Medication, Category } from '../../types';

const toAr = (n: number | string) => n.toString().replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);

const roundTo = (n: number, step: number): number => {
    if (!Number.isFinite(n) || !Number.isFinite(step) || step <= 0) return n;
    return Math.round(n / step) * step;
};

const mgFromMl = (ml: number, mgPerMl: number, roundStepMg = 1): number => roundTo(ml * mgPerMl, roundStepMg);

const formatDoseMlMg = (ml: number, mgPerMl: number, roundStepMl = 0.5): string => {
    const roundedMl = roundTo(ml, roundStepMl);
    const mg = mgFromMl(roundedMl, mgPerMl, 1);
    return `${toAr(roundedMl)} مل (${toAr(mg)} مجم)`;
};

const formatRangeMlMg = (minMl: number, maxMl: number, mgPerMl: number, roundStepMl = 0.5): string => {
    return `${formatDoseMlMg(minMl, mgPerMl, roundStepMl)} – ${formatDoseMlMg(maxMl, mgPerMl, roundStepMl)}`;
};

const formatRangeUnitsMg = (minUnits: number, maxUnits: number, mgPerUnit: number): string => {
    const minMg = roundTo(minUnits * mgPerUnit, 1);
    const maxMg = roundTo(maxUnits * mgPerUnit, 1);
    return `${toAr(minUnits)}–${toAr(maxUnits)} (${toAr(minMg)}–${toAr(maxMg)} مجم)`;
};

const W_ALLERGY = ['حساسية شديدة (طفح منتشر/تورم/ضيق تنفس) تستلزم إيقاف الدواء وتقييماً عاجلاً.'];

const W_RED_FLAGS_ABDOMEN = [
    'علامات تستلزم تقييماً عاجلاً: ألم بطن شديد/متزايد، قيء متكرر، دم بالبراز، حرارة مرتفعة، أو انتفاخ شديد مستمر.',
    'استمرار الانتفاخ/المغص أكثر من ١٤ يوم بدون تحسن واضح يستلزم تقييماً.'
];

const W_THYROXINE_SPACING = [
    'ليفوثيروكسين: فاصل ٤ ساعات على الأقل عن السيميثيكون/الفحم لتقليل تأثيره على الامتصاص.'
];

const W_CHARCOAL_SPACING = [
    'الفحم قد يقلل امتصاص أدوية كثيرة؛ فاصل ساعتين على الأقل عن أي دواء فموي آخر.'
];

const SIMETHICONE_DROPS_MG_PER_ML = 20; // 2% = 20mg/ml
const SIMETHICONE_SUSP_MG_PER_ML = 8; // 40mg/5ml = 8mg/ml
const SIMETHICONE_TAB_MG = 40;
const SIMETHICONE_FILM_MG = 62.5;

const simethiconeDropsDoseText = (ageMonths: number): string => {
    if (ageMonths < 24) {
        return `${formatRangeMlMg(1, 2, SIMETHICONE_DROPS_MG_PER_ML)} مع أو بعد الرضعة — حتى ٦ مرات/يوم`;
    }
    if (ageMonths < 144) {
        return `${formatRangeMlMg(1, 2, SIMETHICONE_DROPS_MG_PER_ML)} بعد الأكل وعند النوم — حتى ٤ مرات/يوم`;
    }
    return `${formatRangeMlMg(5, 12.5, SIMETHICONE_DROPS_MG_PER_ML)} بعد الأكل وعند النوم — حتى ٤ مرات/يوم`;
};

const simethiconeSuspDoseText = (ageMonths: number): string => {
    if (ageMonths < 24) return 'لمن هم أقل من سنتين: تفضيل النقط لضبط الجرعة.';
    if (ageMonths < 72) return `${formatDoseMlMg(5, SIMETHICONE_SUSP_MG_PER_ML)} بعد الأكل وعند النوم — حتى ٤ مرات/يوم`;
    if (ageMonths < 144) return `${formatDoseMlMg(10, SIMETHICONE_SUSP_MG_PER_ML)} بعد الأكل وعند النوم — حتى ٤ مرات/يوم`;
    return `${formatRangeMlMg(5, 15, SIMETHICONE_SUSP_MG_PER_ML)} بعد الأكل وعند النوم — حتى ٤ مرات/يوم`;
};

export const ANTIFLATULENT_MEDS: Medication[] = [


    // 1. Simethicone-MUP 2% emulsion oral drops 30 ml
{
    id: 'simethicone-mup-2-drops', // [GREEN] Replace with unique ID if needed
    name: 'Simethicone-MUP 2% emulsion oral drops 30 ml',
    genericName: 'Simethicone', 
    concentration: '20 mg / 1 ml (2%)',
    price: 27, 
    matchKeywords: [
        'flatulence', 'gas', 'bloating', 'infantile colic', 'simethicone', 'antiflatulent', 'mup',
        'سيميثيكون', 'ميب', 'طارد للغازات', 'مغص الرضع', 'انتفاخ', 'علاج الغازات', 'نقط للبطن'
    ],
    usage: 'علاج أعراض الانتفاخ، وتراكم الغازات في الجهاز الهضمي، وتقلصات البطن (المغص) الناتجة عن الهواء عند الرضع والأطفال والكبار.',
    timing: 'بعد الأكل وعند النوم – عند الحاجة',
    category: Category.ANTIFLATULENT,
    form: 'Oral Drops',

    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        return simethiconeDropsDoseText(ageMonths);
    },

    warnings: [
        'الحمل والرضاعة: آمن عادةً لأن السيميثيكون يعمل موضعياً داخل الأمعاء.',
        ...W_THYROXINE_SPACING,
        ...W_ALLERGY,
        ...W_RED_FLAGS_ABDOMEN
    ]
},

// 2. Eucarbon 30 tablets
{
    id: 'eucarbon-30-tabs', // [GREEN] Replace with unique ID if needed
    name: 'Eucarbon 30 tablets',
    genericName: 'Vegetable Carbon + Senna Leaves + Rhubarb Root + Purified Sulfur + Peppermint/Fennel Oil', 
    concentration: 'Carbo ligni 180mg + Senna 105mg + Rhubarb extract 25mg + Sulfur 50mg (per tablet)',
    price: 105, 
    matchKeywords: [
        'antiflatulent', 'charcoal', 'eucarbon', 'bloating', 'constipation', 'indigestion', 'gas',
        'اوكربون', 'فحم', 'حبوب الفحم', 'انتفاخ', 'غازات', 'امساك بسيط', 'عسر هضم', 'منظم للامعاء'
    ],
    usage: 'مكمل غذائي ومنظم لوظائف الأمعاء؛ يستخدم لعلاج الانتفاخ والغازات وحالات الإمساك البسيطة، كما يساعد في تنظيف الأمعاء.',
    timing: 'حتى ٣ مرات يومياً مع/بعد الأكل – حتى ٧ أيام',
    category: Category.ANTIFLATULENT,
    form: 'Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216) { // Adults
            return '١–٢ قرص حتى ٣ مرات يومياً مع/بعد الأكل لمدة حتى ٧ أيام (يمكن زيادة الجرعة المسائية إلى ٣–٤ أقراص عند الحاجة).';
        }
        return 'غير مناسب لمن هم أقل من ١٨ سنة.';
    },

    warnings: [
        'الحمل والرضاعة: بيانات الأمان غير كافية؛ الأفضل عدم الاستخدام.',
        ...W_CHARCOAL_SPACING,
        ...W_RED_FLAGS_ABDOMEN,
        'تداخلات: قد يتداخل مع مدرات البول، الستيرويدات الفموية، والديجوكسين بسبب اضطراب الأملاح.',
        'تداخلات: الجمع مع مستحضرات عرق السوس (Liquorice root) قد يزيد خطر اضطراب الأملاح.',
        'غير مناسب في حالات: انسداد الأمعاء، آلام بطن شديدة/غير مفسرة، الجفاف الشديد، التهابات الأمعاء (كرون/التهاب القولون التقرحي)، التهاب الزائدة، أو مشاكل قلب/كلية.'
    ]
},

// 3. Flatidyl 40mg 30 chewable tabs
{
    id: 'flatidyl-40-chew-tabs', // [GREEN] Replace with unique ID if needed
    name: 'Flatidyl 40mg 30 chewable tabs',
    genericName: 'Simethicone', 
    concentration: '40mg',
    price: 54, 
    matchKeywords: [
        'flatidyl', 'simethicone', 'antiflatulent', 'gas', 'bloating', 'indigestion', 'chewable',
        'فلاتيديل', 'سيميثيكون', 'انتفاخ', 'غازات', 'حبوب مضغ للغازات', 'تقلصات', 'عسر هضم'
    ],
    usage: 'تخفيف سريع لأعراض الانتفاخ والضغط والامتلاء الناتج عن وجود غازات في المعدة أو الأمعاء.',
    timing: 'بعد الأكل وعند النوم – عند الحاجة',
    category: Category.ANTIFLATULENT,
    form: 'Chewable Tablets',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) return `${formatRangeUnitsMg(3, 6, SIMETHICONE_TAB_MG)} قرص للمضغ بعد الأكل وعند النوم حتى ٤ مرات يومياً (حد أقصى ٦ أقراص/جرعة) – عند الحاجة`;
        return 'الأصغر من ١٢ سنة: تفضيل النقط لضبط الجرعة.';
    },

    warnings: [
        'الحمل والرضاعة: آمن عادةً لأن السيميثيكون يعمل موضعياً داخل الأمعاء.',
        ...W_THYROXINE_SPACING,
        ...W_ALLERGY,
        ...W_RED_FLAGS_ABDOMEN
    ]
},

// 4. Simethicone 2% oral drops (30ml)
{
    id: 'simethicone-generic-2-drops', // [GREEN] Replace with unique ID if needed
    name: 'Simethicone 2% oral drops (30ml)',
    genericName: 'Simethicone', 
    concentration: '20 mg / 1 ml (2%)',
    price: 24, 
    matchKeywords: [
        'flatulence', 'gas', 'bloating', 'infantile colic', 'simethicone', 'antiflatulent',
        'سيميثيكون', 'طارد للغازات', 'مغص الرضع', 'انتفاخ', 'علاج الغازات', 'نقط للبطن', 'مغص أطفال'
    ],
    usage: 'علاج موضعي لتقليل التوتر السطحي لفقاعات الغازات، مما يسهل خروجها ويخفف من آلام الانتفاخ والمغص عند الرضع والأطفال والكبار.',
    timing: 'بعد الأكل/الرضاعة وعند النوم – عند الحاجة',
    category: Category.ANTIFLATULENT,
    form: 'Oral Drops',

    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        return simethiconeDropsDoseText(ageMonths);
    },

    warnings: [
        'الحمل والرضاعة: آمن عادةً لأن السيميثيكون يعمل موضعياً داخل الأمعاء.',
        ...W_THYROXINE_SPACING,
        ...W_ALLERGY,
        ...W_RED_FLAGS_ABDOMEN
    ]
}, 

// 5. Simethicone emulsion 120 ml
{
    id: 'simethicone-emulsion-120ml', // [GREEN] Replace with unique ID if needed
    name: 'Simethicone emulsion 120 ml',
    genericName: 'Simethicone', 
    concentration: '40mg / 5ml', 
    price: 28, 
    matchKeywords: [
        'simethicone', 'antiflatulent', 'emulsion', 'gas', 'bloating', 'indigestion', 'large bottle',
        'سيميثيكون شراب', 'سيميثيكون مستحلب', 'طارد للغازات', 'انتفاخ', 'عسر هضم', 'مغص', 'توفير'
    ],
    usage: 'طارد للغازات ومضاد للانتفاخ، يعمل عن طريق تفتيت فقاعات الهواء داخل المعدة والأمعاء لتسهيل التخلص منها.',
    timing: 'بعد الوجبات وعند النوم – عند الحاجة',
    category: Category.ANTIFLATULENT,
    form: 'Oral Suspension',

    minAgeMonths: 24,
    maxAgeMonths: 1200,
    minWeight: 12,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        return simethiconeSuspDoseText(ageMonths);
    },

    warnings: [
        'الحمل والرضاعة: آمن عادةً لأن السيميثيكون يعمل موضعياً داخل الأمعاء.',
        ...W_THYROXINE_SPACING,
        ...W_ALLERGY,
        ...W_RED_FLAGS_ABDOMEN
    ]
},

// 6. Neocarbon 30 capsules
{
    id: 'neocarbon-30-caps', // [GREEN] Replace with unique ID if needed
    name: 'Neocarbon 30 capsules',
    genericName: 'Activated Charcoal + Anise Oil + Peppermint Oil', 
    concentration: 'Charcoal + Anise + Peppermint (capsules)',
    price: 185, 
    matchKeywords: [
        'antiflatulent', 'charcoal', 'neocarbon', 'marnys', 'anise', 'peppermint', 'bloating', 'gas',
        'نيوكربون', 'فحم', 'ينسون', 'نعناع', 'انتفاخ', 'غازات', 'تقلصات قولون', 'مارنيز'
    ],
    usage: 'تركيبة طبيعية مزدوجة تمتص الغازات المعوية وتخفف من تشنجات الجهاز الهضمي والانتفاخ، مما يعطي شعوراً بالراحة بعد الوجبات الدسمة.',
    timing: 'بعد كل وجبة بـ ٣٠–٦٠ دقيقة – حتى ٧ أيام',
    category: Category.ANTIFLATULENT,
    form: 'Capsule',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216) { // Adults
            return '٣–٥ كبسولات بعد كل وجبة بـ ٣٠–٦٠ دقيقة لمدة حتى ٧ أيام.';
        }
        return 'غير مناسب لمن هم أقل من ١٨ سنة.';
    },

    warnings: [
        'الحمل والرضاعة: بيانات الأمان غير كافية؛ الأفضل عدم الاستخدام.',
        ...W_CHARCOAL_SPACING,
        ...W_RED_FLAGS_ABDOMEN,
        ...W_ALLERGY,
        'المنتج مكمل غذائي وليس بديلاً لعلاج سبب مرضي.'
    ]
},

// 7. Dentinox 2.65% infant colic drops 100 ml
{
    id: 'dentinox-infant-colic-100ml', // [GREEN] Replace with unique ID if needed
    name: 'Dentinox 2.65% infant colic drops 100 ml',
    genericName: 'Activated Dimeticone (Dimethicone)', 
    concentration: 'Activated Dimeticone (per 2.5 ml dose)',
    price: 103, 
    matchKeywords: [
        'dentinox', 'infant colic', 'dimethicone', 'dill oil', 'gas', 'griping pain', 'bloating',
        'دينتينوكس', 'مغص الرضع', 'مغص حديثي الولادة', 'غازات الاطفال', 'زيت الشبت', 'انتفاخ'
    ],
    usage: 'علاج فعال ومجرب للتخلص من مغص الرضع والآلام الناتجة عن حبس الغازات، يساعد في تفتيت فقاعات الهواء المسببة للمغص.',
    timing: 'أثناء/بعد الرضعة – عند الحاجة (حد أقصى ٦ مرات/يوم)',
    category: Category.ANTIFLATULENT,
    form: 'Oral Drops',

    minAgeMonths: 0,
    maxAgeMonths: 24,
    minWeight: 2.5,
    maxWeight: 15,

    calculationRule: (weight, ageMonths) => {
        return '٢.٥ مل (نقط) مع أو بعد الرضعة مباشرة حتى ٦ مرات يومياً عند الحاجة.';
    },

    warnings: [
        'الحمل: غير مطبّق (مخصص للرضع).',
        'الرضاعة: غير مطبّق (مخصص للرضع).',
        'وجود أدوية أخرى للطفل يستلزم مراجعة التداخلات المحتملة.',
        'غير مناسب عند حساسية للدايميثيكون أو أي مكوّن بالتركيبة.',
        'استمرار المغص أو تدهوره يستلزم تقييماً.'
    ]
},
// 8. Gasiflatyl 30 chewable tabs
{
    id: 'gasiflatyl-40-chew-tabs', // [GREEN] Replace with unique ID if needed
    name: 'Gasiflatyl 30 chewable tabs',
    genericName: 'Simethicone', 
    concentration: '40mg',
    price: 54, 
    matchKeywords: [
        'gasiflatyl', 'simethicone', 'antiflatulent', 'gas', 'bloating', 'indigestion', 'chewable',
        'جاسيفلاتيل', 'سيميثيكون', 'انتفاخ', 'غازات', 'حبوب مضغ', 'تقلصات', 'عسر هضم'
    ],
    usage: 'يستخدم لتخفيف الآلام الناتجة عن زيادة الغازات في المعدة والأمعاء، ويساعد في التخلص من الشعور بالانتفاخ والضغط بعد الأكل.',
    timing: 'بعد الأكل وعند النوم – عند الحاجة',
    category: Category.ANTIFLATULENT,
    form: 'Chewable Tablets',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) return `${formatRangeUnitsMg(3, 6, SIMETHICONE_TAB_MG)} قرص للمضغ بعد الأكل وعند النوم حتى ٤ مرات يومياً (حد أقصى ٦ أقراص/جرعة) – عند الحاجة`;
        return 'الأصغر من ١٢ سنة: تفضيل النقط لضبط الجرعة.';
    },

    warnings: [
        'الحمل والرضاعة: آمن عادةً لأن السيميثيكون يعمل موضعياً داخل الأمعاء.',
        ...W_THYROXINE_SPACING,
        ...W_ALLERGY,
        ...W_RED_FLAGS_ABDOMEN
    ]
},

// 9. Aqua collo syrup 120 ml
{
    id: 'aqua-collo-syrup-120ml', // [GREEN] Replace with unique ID if needed
    name: 'Aqua collo syrup 120 ml',
    genericName: 'Sodium Bicarbonate + Dill Oil + Ginger Oil', 
    concentration: 'Standard Formula',
    price: 40, 
    matchKeywords: [
        'aqua collo', 'gripe water', 'infantile colic', 'flatulence', 'acidity', 'natural',
        'اكوا كولو', 'ماء غريب', 'مغص الرضع', 'انتفاخات', 'علاج المغص', 'طارد للغازات', 'اعشاب للمغص'
    ],
    usage: 'شراب مهدئ للمغص والتقلصات المعوية عند الرضع والأطفال، يساعد في طرد الغازات ومعادلة حموضة المعدة البسيطة.',
    timing: 'أثناء/بعد الرضاعة – عند الحاجة (حتى ٦ مرات/يوم)',
    category: Category.ANTIFLATULENT,
    form: 'Syrup',

    minAgeMonths: 1,
    maxAgeMonths: 144,
    minWeight: 3.5,
    maxWeight: 60,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 12) { // 1 to 2 years and older
            return '١٠–١٥ مل (معلقة كبيرة) شراب ٣ مرات يومياً أثناء/بعد الأكل عند الحاجة.';
        } else if (ageMonths >= 6 && ageMonths < 12) { // 6 to 12 months
            return '١٠ مل (معلقتين صغيرتين) شراب حتى ٦ مرات يومياً أثناء/بعد الرضاعة عند الحاجة.';
        } else if (ageMonths >= 1 && ageMonths < 6) { // 1 to 6 months
            return '٥ مل (معلقة صغيرة) شراب حتى ٦ مرات يومياً أثناء/بعد الرضاعة عند الحاجة.';
        }
        return 'أقل من شهر: الأفضل عدم استخدام المستحضرات المركبة.';
    },

    warnings: [
        'الحمل والرضاعة: بيانات الأمان غير كافية؛ الأفضل عدم الاستخدام.',
        ...W_ALLERGY,
        ...W_RED_FLAGS_ABDOMEN,
        'تداخلات: بيانات التداخلات محدودة؛ وجود أدوية مزمنة يستلزم مراجعة التداخلات.',
        'التركيبة قد تختلف بين الشركات؛ الجرعات وحدود العمر تُراجع حسب نشرة المنتج.'
    ]
},

// 10. Calminal syrup 120 ml
{
    id: 'calminal-syrup-120ml', // [GREEN] Replace with unique ID if needed
    name: 'Calminal syrup 120 ml',
    genericName: 'Thyme + Fennel + Chamomile extracts', 
    concentration: 'Natural Herbal Formula',
    price: 52, 
    matchKeywords: [
        'calminal', 'herbal', 'colic', 'flatulence', 'antispasmodic', 'natural', 'bloating',
        'كالمينال', 'أعشاب للمغص', 'طارد للغازات', 'مهدئ للتقلصات', 'مغص الرضع', 'انتفاخ'
    ],
    usage: 'شراب عشبي طبيعي يستخدم لتهدئة تقلصات الجهاز الهضمي، وطرد الغازات، وتخفيف آلام المغص عند الرضع والأطفال.',
    timing: '٣ مرات يومياً قبل الأكل بـ ١٥ دقيقة – عند الحاجة',
    category: Category.ANTIFLATULENT,
    form: 'Syrup',

    minAgeMonths: 1,
    maxAgeMonths: 1200,
    minWeight: 4,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) { // Adults and Teens
            return '١٠–١٥ مل (معلقة كبيرة) شراب ٣ مرات يومياً قبل الأكل بـ ١٥ دقيقة عند الحاجة.';
        } else if (ageMonths >= 60 && ageMonths < 144) { // 5 to 12 years
            return '١٠ مل (معلقتين صغيرتين) شراب ٣ مرات يومياً قبل الأكل بـ ١٥ دقيقة عند الحاجة.';
        } else if (ageMonths >= 12 && ageMonths < 60) { // 1 to 5 years
            return '٥ مل (معلقة صغيرة) شراب ٣ مرات يومياً قبل الأكل بـ ١٥ دقيقة عند الحاجة.';
        } else if (ageMonths >= 1 && ageMonths < 12) { // 1 month to 1 year
            return '٢.٥ مل (نصف معلقة صغيرة) شراب ٣ مرات يومياً قبل الرضاعة بـ ١٥ دقيقة عند الحاجة.';
        }
        return 'أقل من شهر: الأفضل عدم استخدام المستحضرات العشبية المركبة.';
    },

    warnings: [
        'الحمل والرضاعة: بيانات الأمان غير كافية؛ الأفضل عدم الاستخدام.',
        ...W_ALLERGY,
        ...W_RED_FLAGS_ABDOMEN,
        'تداخلات: بيانات التداخلات محدودة؛ وجود أدوية مزمنة يستلزم مراجعة التداخلات.',
        'غير مناسب عند حساسية لأي من المكوّنات العشبية (مثل الزعتر أو الشمر أو البابونج).'
    ]
},

// 11. Spasulance 62.5 mg 20 orodispersible films
{
    id: 'spasulance-62-5-odf', // [GREEN] Replace with unique ID if needed
    name: 'Spasulance 62.5 mg 20 orodispersible films',
    genericName: 'Simethicone', 
    concentration: '62.5 mg',
    price: 90, 
    matchKeywords: [
        'spasulance', 'simethicone', 'odf', 'orodispersible film', 'gas', 'bloating', 'fast relief',
        'سبازولانس', 'سيميثيكون', 'فيلم يذوب في الفم', 'انتفاخ', 'غازات', 'عسر هضم', 'سرعة مفعول'
    ],
    usage: 'أحدث وسيلة لعلاج الانتفاخ وتراكم الغازات؛ أفلام رقيقة تذوب فوراً على اللسان لتقليل التوتر السطحي لفقاعات الغازات وتخفيف الضغط والامتلاء بسرعة.',
    timing: 'بعد الأكل وعند النوم – عند الحاجة',
    category: Category.ANTIFLATULENT,
    form: 'Orodispersible Film',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) return `${formatRangeUnitsMg(2, 4, SIMETHICONE_FILM_MG)} فيلم يوضع على اللسان بعد الأكل وعند النوم حتى ٤ مرات يومياً (حد أقصى ٤ أفلام/جرعة) – عند الحاجة`;
        return 'الأصغر من ١٢ سنة: تفضيل النقط لضبط الجرعة.';
    },

    warnings: [
        'الحمل والرضاعة: آمن عادةً لأن السيميثيكون يعمل موضعياً داخل الأمعاء.',
        ...W_THYROXINE_SPACING,
        ...W_ALLERGY,
        ...W_RED_FLAGS_ABDOMEN,
        'ملامسة الفيلم بأيدٍ جافة تقلل ذوبانه قبل الاستخدام.'
    ]
},
];

