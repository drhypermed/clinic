import { Category, Medication } from '../../types';

const toAr = (n: number | string) => n.toString().replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const fixed = (text: string) => (_w: number, _a: number) => text;

/* ═══════════════════════════════════════════════════════════════════════════
   COMMON WARNINGS - تحذيرات ثابتة مشتركة
   ═══════════════════════════════════════════════════════════════════════════ */

const MEBEVERINE_WARNINGS = [
    'نادراً: طفح جلدي أو حساسية — أوقفه إذا ظهرت أعراض حساسية.',
    'آمن نسبياً — لا يسبب جفاف أو احتباس بول أو نعاس.',
    'أعد التقييم إذا: ألم شديد/حمى/قيء مستمر/دم في البراز/نقص وزن.'
];

const TRIMEBUTINE_WARNINGS = [
    'قد يسبب غثيان/إمساك/إسهال خفيف.',
    'نادراً: طفح جلدي أو حساسية.',
    'أعد التقييم إذا: ألم شديد/حمى/دم في البراز/نقص وزن.'
];

const LIBRAX_WARNINGS = [
    'يحتوي بنزوديازيبين — خطر الاعتماد مع الاستخدام الطويل.',
    'قد يسبب نعاس/دوخة — تجنب القيادة.',
    'ممنوع: الجلوكوما ضيقة الزاوية، احتباس البول، انسداد الأمعاء.',
    'تداخلات: يتضاعف النعاس مع الكحول/الأفيونات/مضادات الهيستامين.',
    'الحمل والرضاعة: يُتجنب.',
    'كبار السن: ابدأ بأقل جرعة (خطر السقوط/الارتباك).'
];

const PINAVERIUM_WARNINGS = [
    'يُؤخذ مع الطعام لتجنب تهيج المريء.',
    'لا يُمضغ أو يُكسر القرص.',
    'نادراً: غثيان/ألم بطن خفيف.',
    'أعد التقييم إذا: ألم شديد/حمى/دم في البراز.'
];

const OTILONIUM_WARNINGS = [
    'قد يسبب غثيان/صداع خفيف نادراً.',
    'أعد التقييم إذا: ألم شديد/حمى/دم في البراز/نقص وزن.'
];

/* ═══════════════════════════════════════════════════════════════════════════
   TEXT SANITIZERS
   ═══════════════════════════════════════════════════════════════════════════ */

const normalizeSpaces = (s: string) =>
    s.replace(/\s+/g, ' ').replace(/\s+([،.])/g, '$1').trim();

const stripDoctorPhrases = (s: string) => {
    let t = s;
    t = t.replace(/تحت\s*إشراف\s*طبي(?:\s*دقيق)?/g, '');
    t = t.replace(/(?:بعد\s+)?استشارة\s+(?:طبية|الطبيب)/g, '');
    t = t.replace(/استشر\s+الطبيب(?:ك)?/g, '');
    t = t.replace(/يُفضّل\s+استشارة\s+الطبيب[^.]*\./g, '');
    t = t.replace(/حسب\s+(?:توجيه|تعليمات|إرشادات|قرار|وصف)\s+الطبيب/g, '');
    t = t.replace(/بوصفة\s+طبيب/g, '');
    t = t.replace(/وبأمر\s+الطبيب/g, '');
    t = t.replace(/بأمر\s+الطبيب/g, '');
    t = t.replace(/إلا\s+(?:إذا\s+)?(?:قرر|أوصى)\s+الطبيب[^.]*\./g, '.');
    t = t.replace(/وتحت\s+متابعة\s+طبيب/g, '');
    t = t.replace(/إلا\s+للضرورة\s+و/g, 'للضرورة فقط.');
    t = t.replace(/يُستخدم\s+فقط\s+عند\s+الضرورة\s*و?/g, 'للضرورة فقط —');
    t = t.replace(/\(\s*\)/g, '');
    t = t.replace(/\s*؛\s*\./g, '.');
    return normalizeSpaces(t);
};

const sanitizeMedication = (m: Medication): Medication => ({
    ...m,
    timing: stripDoctorPhrases(m.timing),
    warnings: m.warnings.map(w => stripDoctorPhrases(w)).filter(w => w.length > 0),
    calculationRule: (w, a) => stripDoctorPhrases(m.calculationRule(w, a)),
});

const IBS_SPASTIC_COLON_MEDS_RAW: Medication[] = [

// 1. Librax 30 sugar coated tab.
  {
    id: 'librax-30-tab',
    name: 'Librax 30 sugar coated tab',
    genericName: 'Chlordiazepoxide 5mg + Clidinium bromide 2.5mg', 
    concentration: '5mg / 2.5mg',
    price: 48, 
    matchKeywords: [
        'IBS', 'spastic colon', 'librax', 'chlordiazepoxide', 'clidinium', 'stomach cramps', 'peptic ulcer',
        'ليبراكس', 'القولون العصبي', 'تقلصات المعدة', 'مغص', 'قرحة المعدة', 'مهدئ للقولون', 'تشنج القولون'
    ],
    usage: 'علاج عرضي/مساعد لتقلصات الجهاز الهضمي المرتبطة بالقولون العصبي أو اضطرابات المعدة عند وجود مكوّن توتري/قلق. يحتوي على مضاد للتقلصات + بنزوديازيبين مهدئ.',
    timing: '٣–٤ مرات يومياً قبل الأكل بـ ٣٠–٦٠ دقيقة – ٢–٤ أسابيع',
    category: Category.IBS_SPASTIC_COLON,
    form: 'Sugar Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,

    calculationRule: fixed('١ قرص ٣–٤ مرات يومياً قبل الأكل بـ ٣٠–٦٠ دقيقة (مع جرعة قبل النوم عند الحاجة) لمدة ٢–٤ أسابيع (استخدام قصير المدى).'),

    warnings: LIBRAX_WARNINGS
  },

  // 2. Coloverin D 135mg 30 tab
  {
    id: 'coloverin-d-30-tab',
    name: 'Coloverin D 135mg 30 tab',
    genericName: 'Mebeverine 135mg + Dimethicone 40mg', 
    concentration: '135mg / 40mg',
    price: 105, 
    matchKeywords: [
        'IBS', 'spastic colon', 'coloverin d', 'mebeverine', 'dimethicone', 'bloating', 'flatulence', 'gases',
        'كولوفيرين د', 'كولوفيرين', 'قولون عصبي', 'انتفاخ', 'غازات القولون', 'تقلصات', 'مضاد للتقلصات'
    ],
    usage: 'لتخفيف تقلصات القولون العصبي مع الانتفاخ/الغازات: ميبيفرين (مضاد تقلصات) + دايميثيكون (مضاد للغازات).',
    timing: '٣ مرات يومياً قبل الأكل بـ ٢٠ دقيقة – ٢–٤ أسابيع',
    category: Category.IBS_SPASTIC_COLON,
    form: 'Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,

    calculationRule: fixed('١ قرص ٣ مرات يومياً قبل الأكل بـ ٢٠ دقيقة لمدة ٢–٤ أسابيع.'),
    
    warnings: MEBEVERINE_WARNINGS
  },

  // 3. Gast-reg 200 mg 30 tabs.
  {
    id: 'gast-reg-200-tab',
    name: 'Gast-reg 200 mg 30 tabs.',
    genericName: 'Trimebutine maleate', 
    concentration: '200mg',
    price: 84, 
    matchKeywords: [
        'IBS', 'spastic colon', 'gast-reg', 'trimebutine', 'motility regulator', 'dyspepsia', 'abdominal pain',
        'جاست ريج', 'ترايمبيوتين', 'منظم حركة الأمعاء', 'عسر هضم', 'قولون عصبي', 'مغص', 'التهاب القولون'
    ],
    usage: 'منظم لحركة الجهاز الهضمي لتخفيف ألم البطن/الانتفاخ واضطراب الإخراج المرتبط باضطراب الحركة (مثل أعراض القولون العصبي).',
    timing: '٣ مرات يومياً قبل الأكل بـ ١٥–٣٠ دقيقة – ٢–٤ أسابيع',
    category: Category.IBS_SPASTIC_COLON,
    form: 'Tablet',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (_weight, ageMonths) => {
        if (ageMonths >= 216) {
            return '١ قرص (٢٠٠ مجم) ٣ مرات يومياً قبل الأكل بـ ١٥–٣٠ دقيقة لمدة ٢–٤ أسابيع.';
        }
        if (ageMonths >= 144) {
            return '١ قرص (٢٠٠ مجم) ٢–٣ مرات يومياً قبل الأكل بـ ١٥–٣٠ دقيقة لمدة ٢–٤ أسابيع.';
        }
        return 'للأطفال أقل من ١٢ سنة — استخدم الشراب لضبط الجرعة بدقة.';
    },

    warnings: TRIMEBUTINE_WARNINGS
  },

  // 4. Buscopan 10 mg 20 sugar c.tabs.
  {
    id: 'buscopan-10-tab',
    name: 'Buscopan 10 mg 20 sugar c.tabs.',
    genericName: 'Hyoscine butylbromide', 
    concentration: '10mg',
    price: 56, 
    matchKeywords: [
        'buscopan', 'hyoscine', 'antispasmodic', 'cramps', 'abdominal pain', 'colic', 'IBS', 'spasms',
        'بوسكوبان', 'هيوسين', 'مضاد للتقلصات', 'مغص', 'تقلصات البطن', 'آلام الجهاز الهضمي', 'قولون عصبي', 'مغص مراري', 'مغص كلوي'
    ],
    usage: 'مضاد فعال للتقلصات يعمل عن طريق إرخاء العضلات الملساء في الجهاز الهضمي والبولي والمراري. يستخدم لتخفيف آلام المغص والتقلصات المرتبطة بالقولون العصبي، والمغص الكلوي والمراري.',
    timing: '٣–٥ مرات يومياً – عند الحاجة',
    category: Category.IBS_SPASTIC_COLON,
    form: 'Sugar Coated Tablet',

    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,

    calculationRule: (_weight, ageMonths) => {
        if (ageMonths >= 144) {
            return '١–٢ قرص ٣–٥ مرات يومياً عند الحاجة (حد أقصى ١٠٠ مجم = ١٠ أقراص/يوم).';
        } else if (ageMonths >= 72 && ageMonths < 144) {
            return '١ قرص ٣ مرات يومياً عند الحاجة.';
        } else {
            return 'لا يوصى باستخدام الأقراص للأطفال دون سن ٦ سنوات؛ يفضل استخدام الأشكال الدوائية المناسبة لسنهم.';
        }
    },
    
    warnings: [
        'الحمل والرضاعة: يُستخدم فقط عند الضرورة حسب التشخيص.',
        'موانع/احتياطات مضاد الكولين: جلوكوما ضيقة الزاوية، احتباس بول/تضخم بروستاتا، الوهن العضلي الوبيل، أو انسداد/شلل الأمعاء.',
        'قد يسبب جفاف فم/نقص تعرّق/تسارع قلب/زغللة؛ تجنب الحرارة الشديدة إذا حدث نقص تعرّق.',
        'يُستخدم بحذر لمرضى اضطراب النظم/سرعة ضربات القلب.'
    ]
  },

  // 5. Duspatalin retard 200 mg 30 caps.
  {
    id: 'duspatalin-retard-200-cap',
    name: 'Duspatalin retard 200 mg 30 caps.',
    genericName: 'Mebeverine hydrochloride', 
    concentration: '200mg',
    price: 138, 
    matchKeywords: [
        'IBS', 'spastic colon', 'duspatalin', 'mebeverine', 'retard', 'antispasmodic', 'chronic irritable colon',
        'دوسباتالين', 'دوسباتالين ريتارد', 'ميبيفرين', 'قولون عصبي', 'تشنج القولون', 'مضاد للتقلصات', 'مفعول ممتد'
    ],
    usage: 'مضاد للتقلصات ذو مفعول ممتد يعمل مباشرة على العضلات الملساء في الأمعاء لإرخائها دون التأثير على حركة الأمعاء الطبيعية. يستخدم لعلاج أعراض القولون العصبي، والآلام الناتجة عن تشنج القولون المزمن.',
    timing: 'مرتين يومياً قبل الأكل بـ ٢٠ دقيقة – ٤–٨ أسابيع',
    category: Category.IBS_SPASTIC_COLON,
    form: 'Sustained-release Capsule',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216) {
            return '١ كبسولة (٢٠٠ مجم ممتدة المفعول) مرتين يومياً صباحاً ومساءً قبل الأكل بـ ٢٠ دقيقة لمدة ٤–٨ أسابيع.';
        } else {
            return 'لا يوصى باستخدام كبسولات الـ ٢٠٠ ملجم (الممتدة المفعول) للأطفال والمراهقين تحت سن ١٨ سنة.';
        }
    },
    
    warnings: [
        'الحمل: يُفضّل تجنبه إلا إذا قرر الطبيب ذلك.',
        'الرضاعة: يُفضّل تقييم الفائدة/الخطر قبل الاستخدام.',
        'تحذيرات: أوقفه إذا ظهرت أعراض حساسية (طفح/تورم/ضيق نفس).',
        'عادةً لا يسبب آثاراً مضادة للكولين مثل جفاف الفم/زغللة العين مقارنة ببعض مضادات التقلصات الأخرى.'
    ]
  },

// 6. Buscopan 10mg 10 supp.
  {
    id: 'buscopan-10-supp',
    name: 'Buscopan 10mg 10 supp.',
    genericName: 'Hyoscine butylbromide', 
    concentration: '10mg',
    price: 3.25, 
    matchKeywords: [
        'buscopan', 'hyoscine', 'suppository', 'antispasmodic', 'colic', 'IBS', 'rapid relief',
        'بوسكوبان لبوس', 'هيوسين', 'لبوس للتقلصات', 'مغص', 'تقلصات شديدة', 'مغص كلوي', 'مغص مراري'
    ],
    usage: 'مضاد سريع للتقلصات في شكل أقماع شرجية، يستخدم لتخفيف الآلام الحادة للقولون العصبي، والمغص المراري والكلوي، ويتميز بسرعة المفعول وتجنب المرور عبر المعدة (مثالي في حالات الغثيان).',
    timing: '٣–٤ مرات يومياً شرجياً – عند الحاجة',
    category: Category.IBS_SPASTIC_COLON,
    form: 'Suppository',

    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 250,

    calculationRule: (_weight, ageMonths) => {
        if (ageMonths >= 144) {
            return '١ لبوسة (١٠ مجم) شرجياً ٣–٤ مرات يومياً عند الحاجة.';
        } else if (ageMonths >= 72 && ageMonths < 144) {
            return '١ لبوسة (١٠ مجم) شرجياً ٢–٣ مرات يومياً عند الحاجة.';
        } else {
            return 'لا يفضل استخدام تركيز ١٠ ملجم للأطفال دون ٦ سنوات؛ يُستشار الطبيب لاستخدام تركيزات الأطفال الأقل.';
        }
    },
    
    warnings: [
        'الحمل والرضاعة: يُستخدم فقط عند الضرورة حسب التشخيص.',
        'موانع/احتياطات مضاد الكولين: جلوكوما ضيقة الزاوية، احتباس بول/تضخم بروستاتا، الوهن العضلي الوبيل، أو انسداد/شلل الأمعاء.',
        'قد يسبب جفافاً/زغللة/تسارع قلب؛ أوقفه إذا ظهرت أعراض شديدة.'
    ]
  },

  // 7. Colona 30 f.c.tab.
  {
    id: 'colona-30-tab',
    name: 'Colona 30 f.c.tab',
    genericName: 'Mebeverine 100mg + Sulpiride 25mg', 
    concentration: '100mg / 25mg',
    price: 69, 
    matchKeywords: [
        'IBS', 'spastic colon', 'colona', 'mebeverine', 'sulpiride', 'psychosomatic colon', 'anxiety colon',
        'كولونا', 'قولون عصبي', 'تقلصات القولون', 'المغص النفسي', 'ميبيفرين', 'سولبيريد', 'انتفاخ القولون'
    ],
    usage: 'لتخفيف أعراض القولون العصبي عند وجود مكوّن قلق/توتر: ميبيفرين (مضاد تقلصات) + سولبيريد بجرعة منخفضة (مضاد ذهان/مضاد دوبامين) وقد يساعد في أعراض وظيفية لدى بعض المرضى.',
    timing: '٣–٤ مرات يومياً قبل الأكل بـ ٢٠ دقيقة – ٢–٤ أسابيع',
    category: Category.IBS_SPASTIC_COLON,
    form: 'Film-coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,

    calculationRule: (_weight, ageMonths) => {
        if (ageMonths >= 216) {
            return '١ قرص ٣–٤ مرات يومياً قبل الأكل بـ ٢٠ دقيقة لمدة ٢–٤ أسابيع.';
        } else {
            return 'لا ينصح باستخدامه للأطفال والمراهقين دون سن ١٨ سنة لعدم كفاية الدراسات حول مادة السولبيريد لهذه الفئة.';
        }
    },
    
    warnings: [
        'الحمل: يُتجنب (خصوصاً مع وجود سولبيريد) إلا إذا قرر الطبيب ذلك.',
        'الرضاعة: يُتجنب/غير مُفضل لأن سولبيريد قد يفرز في اللبن وقد يسبب آثاراً على الرضيع.',
        'تداخلات مهمة: يُمنع/لا يُجمع مع ليفودوبا (تعارض دوائي).',
        'تحذيرات: قد يسبب نعاساً/دواراً. وقد يرفع البرولاكتين (اضطراب دورة/إفراز لبن) خاصة مع الاستخدام الطويل.',
        'تحذيرات قلبية: الحذر مع اضطراب نظم/QT أو أدوية تُطيل QT.',
        'تحذيرات عصبية: أعد التقييم إذا ظهرت أعراض خارج هرمية (رعشة/تيبس) أو حرارة/تيبس شديد (اشتباه NMS).'
    ]
  },

  // 8. Colovatil 30 f.c. tabs
  {
    id: 'colovatil-30-tab',
    name: 'Colovatil 30 f.c. tabs',
    genericName: 'Mebeverine 100mg + Sulpiride 25mg', 
    concentration: '100mg / 25mg',
    price: 63, 
    matchKeywords: [
        'IBS', 'spastic colon', 'colovatil', 'mebeverine', 'sulpiride', 'psychosomatic', 'flatulence',
        'كولوفاتيل', 'ميبيفرين', 'سولبيريد', 'قولون عصبي', 'مغص ونفسية', 'تقلصات المعدة', 'انتفاخ'
    ],
    usage: 'لتخفيف أعراض القولون العصبي عند وجود مكوّن قلق/توتر: ميبيفرين (مضاد تقلصات) + سولبيريد بجرعة منخفضة.',
    timing: '٣ مرات يومياً قبل الأكل بـ ٢٠ دقيقة – ٢–٤ أسابيع',
    category: Category.IBS_SPASTIC_COLON,
    form: 'Film-coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,

    calculationRule: (_weight, ageMonths) => {
        if (ageMonths >= 216) {
            return '١ قرص ٣ مرات يومياً قبل الأكل بـ ٢٠ دقيقة لمدة ٢–٤ أسابيع.';
        } else {
            return 'لا ينصح باستخدامه للأطفال والمراهقين دون سن ١٨ سنة.';
        }
    },
    
    warnings: [
        'الحمل: يُتجنب (خصوصاً مع وجود سولبيريد) إلا إذا قرر الطبيب ذلك.',
        'الرضاعة: يُتجنب/غير مُفضل لأن سولبيريد قد يفرز في اللبن.',
        'تداخلات مهمة: يُمنع/لا يُجمع مع ليفودوبا (تعارض دوائي).',
        'تحذيرات: قد يرفع البرولاكتين (اضطراب دورة/إفراز لبن) وقد يسبب نعاساً/دواراً.',
        'تحذيرات قلبية: الحذر مع اضطراب نظم/QT أو أدوية تُطيل QT. الحذر في مرضى الفشل الكلوي وكبار السن.'
    ]
  },

  // 9. Gast-reg 100 mg 30 tabs.
  {
    id: 'gast-reg-100-tab',
    name: 'Gast-reg 100 mg 30 tabs.',
    genericName: 'Trimebutine maleate', 
    concentration: '100mg',
    price: 72, 
    matchKeywords: [
        'IBS', 'spastic colon', 'gast-reg', 'trimebutine', 'motility regulator', 'abdominal pain',
        'جاست ريج ١٠٠', 'ترايمبيوتين', 'منظم حركة الأمعاء', 'عسر هضم', 'قولون عصبي', 'تقلصات المعوية'
    ],
    usage: 'منظم لحركة الجهاز الهضمي لتخفيف ألم البطن/الانتفاخ واضطراب الإخراج المرتبط باضطراب الحركة (مثل أعراض القولون العصبي).',
    timing: '٣ مرات يومياً قبل الأكل بـ ١٥–٣٠ دقيقة – ٢–٤ أسابيع',
    category: Category.IBS_SPASTIC_COLON,
    form: 'Tablet',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,

    calculationRule: (_weight, ageMonths) => {
        if (ageMonths >= 144) {
            return '١–٢ قرص (١٠٠–٢٠٠ مجم) ٣ مرات يومياً قبل الأكل بـ ١٥–٣٠ دقيقة لمدة ٢–٤ أسابيع (الجرعة المعتادة ٢ قرص ٣ مرات يومياً).';
        } else {
            return 'للأطفال تحت ١٢ سنة، يفضل استخدام "جاست ريج شراب" لسهولة البلع ودقة الجرعة المحسوبة بالوزن.';
        }
    },
    
    warnings: [
        'الحمل: يُتجنب في الثلث الأول كإجراء احترازي، ويُستخدم فقط إذا قرر الطبيب ذلك.',
        'الرضاعة: يُفضّل تقييم الفائدة/الخطر قبل الاستخدام.',
        'قد يسبب جفاف فم/دوخة خفيفة لدى بعض المرضى.',
        'يُمنع عند الحساسية للترايمبيوتين.'
    ]
  },

  // 10. Gast-reg 100mg 5 supp.
  {
    id: 'gast-reg-100-supp',
    name: 'Gast-reg 100mg 5 supp.',
    genericName: 'Trimebutine maleate', 
    concentration: '100mg',
    price: 5.3, 
    matchKeywords: [
        'IBS', 'spastic colon', 'gast-reg', 'trimebutine', 'suppository', 'motility regulator', 'vomiting',
        'جاست ريج لبوس', 'ترايمبيوتين أقماع', 'منظم حركة الأمعاء', 'لبوس للقولون', 'عسر هضم', 'مغص'
    ],
    usage: 'منظم لحركة الجهاز الهضمي في شكل أقماع شرجية لتخفيف التقلصات/ألم البطن عند تعذر تناول الدواء بالفم.',
    timing: '٢–٣ مرات يومياً شرجياً قبل الأكل – ٣–٧ أيام',
    category: Category.IBS_SPASTIC_COLON,
    form: 'Suppository',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (_weight, ageMonths) => {
        if (ageMonths >= 144) {
            return '١ لبوسة (١٠٠ مجم) شرجياً ٢–٣ مرات يومياً قبل الأكل لمدة ٣–٧ أيام.';
        } else {
            return 'لهذا السن، يفضل تقييم الفائدة/الخطر لاستخدام "جاست ريج شراب" أو الأقماع بتركيز أقل (٥٠ ملجم) المخصصة للأطفال.';
        }
    },
    
    warnings: [
        'الحمل: يُتجنب في الثلث الأول كإجراء احترازي، ويُستخدم فقط إذا قرر الطبيب ذلك.',
        'الرضاعة: يُفضّل تقييم الفائدة/الخطر قبل الاستخدام.',
        'يُمنع عند الحساسية للترايمبيوتين.',
        'قد يسبب طفحاً/حكة أو نعاساً خفيفاً لدى بعض المرضى.'
    ]
  },
  // 11. Coloverin A 30 tablets
  {
    id: 'coloverin-a-30-tab',
    name: 'Coloverin A 30 tablets',
    genericName: 'Mebeverine 135mg + Chlordiazepoxide 5mg', 
    concentration: '135mg / 5mg',
    price: 99, 
    matchKeywords: [
        'IBS', 'spastic colon', 'coloverin a', 'mebeverine', 'chlordiazepoxide', 'anxiety', 'psychosomatic',
        'كولوفيرين أ', 'كولوفيرين ا', 'قولون عصبي', 'مغص توتري', 'ميبيفرين', 'كلورديازيبوكسيد', 'مهدئ قولون'
    ],
    usage: 'لتخفيف أعراض القولون العصبي عند وجود قلق/توتر: ميبيفرين (مضاد تقلصات) + كلورديازيبوكسيد (بنزوديازيبين مهدئ).',
    timing: '٣–٤ مرات يومياً قبل الأكل بـ ٢٠ دقيقة – ٢–٤ أسابيع',
    category: Category.IBS_SPASTIC_COLON,
    form: 'Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,

    calculationRule: (_weight, ageMonths) => {
        if (ageMonths >= 216) {
            return '١ قرص ٣–٤ مرات يومياً قبل الأكل بـ ٢٠ دقيقة لمدة ٢–٤ أسابيع (استخدام قصير المدى).';
        } else {
            return 'لا يوصى باستخدامه للأطفال والمراهقين دون سن ١٨ سنة بسبب وجود مادة الكلورديازيبوكسيد المهدئة.';
        }
    },
    
    warnings: [
        'الحمل: يُتجنب (خصوصاً الثلث الأول) إلا إذا قرر الطبيب ذلك.',
        'الرضاعة: يُتجنب لأن المكوّن المهدئ قد يسبب نعاساً/تثبيطاً للرضيع.',
        'تحذيرات: قد يسبب نعاساً/دوخة؛ تجنب القيادة أو تشغيل آلات حتى تعرف تأثيره عليك.',
        'تحذيرات: خطر الاعتماد/التعوّد مع الاستخدام الطويل (بنزوديازيبين). لا توقفه فجأة بعد استعمال ممتد إلا حسب التشخيص.',
        'تداخلات: الكحول، الأفيونات، مضادات الهيستامين المهدئة، وأدوية النوم تزيد التهدئة.',
        'موانع/احتياطات مضاد الكولين: جلوكوما ضيقة الزاوية، احتباس بول/تضخم بروستاتا، انسداد/شلل الأمعاء.',
        'كبار السن: ابدأ بأقل جرعة فعالة بسبب خطر السقوط/الارتباك.'
    ]
  },

  // 12. Gast-reg 50mg/5ml i.v./i.m. 3 amp.
  {
    id: 'gast-reg-50-amp',
    name: 'Gast-reg 50mg/5ml i.v./i.m. 3 amp.',
    genericName: 'Trimebutine maleate', 
    concentration: '50mg/5ml',
    price: 33, 
    matchKeywords: [
        'IBS', 'spastic colon', 'gast-reg injection', 'trimebutine ampoule', 'acute spasm', 'postoperative ileus', 'motility regulator',
        'جاست ريج حقن', 'ترايمبيوتين أمبول', 'مغص حاد', 'منظم حركة الأمعاء', 'حقن عضل', 'حقن وريد', 'تقلصات شديدة'
    ],
    usage: 'حقن منظم لحركة الجهاز الهضمي لتخفيف التقلصات/ألم البطن في الحالات الحادة حسب التشخيص (وقد يُستخدم في شلل الأمعاء الوظيفي بعد العمليات حسب التشخيص).',
    timing: 'كل ٨–١٢ ساعة – عند الحاجة (حالات حادة)',
    category: Category.IBS_SPASTIC_COLON,
    form: 'Ampoule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (_weight, ageMonths) => {
        if (ageMonths >= 216) {
            return '١–٢ أمبول (٥٠–١٠٠ مجم) حقن عضلي/وريدي بطيء كل ٨–١٢ ساعة عند الحاجة (حد أقصى ٣٠٠ مجم = ٦ أمبولات/يوم).';
        } else if (ageMonths >= 144 && ageMonths < 216) {
            return '١ أمبول (٥٠ مجم) حقن عضلي/وريدي بطيء مرتين يومياً عند الحاجة.';
        } else {
            return 'للأطفال تحت ١٢ سنة، يمنع استخدام الحقن إلا في المستشفيات حسب التشخيص دقيق وبجرعات محسوبة بدقة (عادة ١ ملجم/كجم من الوزن).';
        }
    },
    
    warnings: [
        'الحمل: يُتجنب في الثلث الأول كإجراء احترازي، ويُستخدم فقط إذا قرر الطبيب ذلك.',
        'الرضاعة: يُفضّل تقييم الفائدة/الخطر قبل الاستخدام.',
        'تحذيرات: يُمنع عند الحساسية للترايمبيوتين.',
        'الحقن الوريدي يجب أن يكون ببطء لتجنب دوخة/هبوط ضغط. يُفضّل أن يكون المريض مستلقياً.',
        'قد يسبب نعاساً/جفاف فم/طفح جلدي نادراً.'
    ]
  },

  // 13. Tritone 200mg 30 tab
  {
    id: 'tritone-200-tab',
    name: 'Tritone 200mg 30 tab',
    genericName: 'Trimebutine maleate', 
    concentration: '200mg',
    price: 123, 
    matchKeywords: [
        'IBS', 'spastic colon', 'tritone', 'trimebutine', 'motility regulator', 'abdominal pain', 'colic',
        'ترايتون', 'ترايتون ٢٠٠', 'ترايمبيوتين', 'منظم حركة الأمعاء', 'قولون عصبي', 'مغص', 'عسر هضم'
    ],
    usage: 'منظم لحركة الجهاز الهضمي لتخفيف ألم البطن/الانتفاخ واضطراب الإخراج المرتبط باضطراب الحركة (مثل أعراض القولون العصبي).',
    timing: '٢–٣ مرات يومياً قبل الأكل بـ ٢٠ دقيقة – ٢–٤ أسابيع',
    category: Category.IBS_SPASTIC_COLON,
    form: 'Tablet',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (_weight, ageMonths) => {
        if (ageMonths >= 216) {
            return '١ قرص (٢٠٠ مجم) ٣ مرات يومياً قبل الأكل بـ ٢٠ دقيقة لمدة ٢–٤ أسابيع (يمكن رفع الجرعة إلى ٦٠٠ مجم/يوم في الحالات الشديدة).';
        } else if (ageMonths >= 144 && ageMonths < 216) {
            return '١ قرص (٢٠٠ مجم) مرتين يومياً قبل الأكل بـ ٢٠ دقيقة لمدة ٢–٤ أسابيع.';
        } else {
            return 'لهذا السن، يفضل استخدام "ترايتون شراب" لضبط الجرعة بدقة حسب وزن الطفل.';
        }
    },
    
    warnings: [
        'الحمل: يُتجنب في الثلث الأول كإجراء احترازي، ويُستخدم فقط إذا قرر الطبيب ذلك.',
        'الرضاعة: يُفضّل تقييم الفائدة/الخطر قبل الاستخدام.',
        'يُمنع عند الحساسية للترايمبيوتين.',
        'قد يسبب جفاف فم/تغير مذاق/طفح جلدي نادراً.'
    ]
  },

  // 14. Gast-reg 24mg/5ml 125ml susp.
  {
    id: 'gast-reg-24-susp',
    name: 'Gast-reg 24mg/5ml 125ml susp.',
    genericName: 'Trimebutine maleate', 
    concentration: '24mg/5ml',
    price: 33, 
    matchKeywords: [
        'IBS', 'spastic colon', 'gast-reg suspension', 'trimebutine pediatric', 'colic', 'vomiting', 'motility regulator',
        'جاست ريج شراب', 'ترايمبيوتين للأطفال', 'منظم حركة الأمعاء للأطفال', 'ترجيع', 'انتفاخ للأطفال', 'مغص سنتين'
    ],
    usage: 'معلق فموي للأطفال منظم لحركة الجهاز الهضمي لتخفيف المغص/ألم البطن واضطرابات الحركة عند الأطفال حسب التشخيص.',
    timing: '٣ مرات يومياً قبل الأكل بـ ١٥–٢٠ دقيقة – ٧–١٤ يوم',
    category: Category.IBS_SPASTIC_COLON,
    form: 'Oral Suspension',

    minAgeMonths: 24,
    maxAgeMonths: 144,
    minWeight: 12,
    maxWeight: 40,

    calculationRule: (_weight, ageMonths) => {
        if (ageMonths >= 60) {
            return '١٠ مل (ملعقتان صغيرتان) شراب ٣ مرات يومياً قبل الأكل بـ ١٥–٢٠ دقيقة لمدة ٧–١٤ يوم.';
        } else if (ageMonths >= 24 && ageMonths < 60) {
            return '٥ مل (ملعقة صغيرة) شراب ٣ مرات يومياً قبل الأكل بـ ١٥–٢٠ دقيقة لمدة ٧–١٤ يوم.';
        } else {
            return 'هذا الشكل الدوائي محدد للاستخدام من عمر سنتين فما فوق في هذا التطبيق.';
        }
    },
    
    warnings: [
        'يُمنع عند الحساسية للترايمبيوتين.',
        'الحمل/الرضاعة: هذا المستحضر للأطفال وليس مخصصاً للبالغين.',
        'تحذيرات: أعد التقييم إذا استمر الألم/القيء أو ظهرت علامات جفاف/دم بالبراز.',
        'قد يسبب طفحاً جلدياً/حكة نادراً—أوقفه إذا ظهرت أعراض حساسية.',
        'اتبع صلاحية ما بعد التحضير والتخزين حسب العبوة.'
    ]
  },

  // 15. Mebefac 200 mg sr 30 f.c. tabs
  {
    id: 'mebefac-200-sr-tab',
    name: 'Mebefac 200 mg sr 30 f.c. tabs',
    genericName: 'Mebeverine hydrochloride', 
    concentration: '200mg',
    price: 99, 
    matchKeywords: [
        'IBS', 'spastic colon', 'mebefac', 'mebeverine', 'sr', 'sustained release', 'antispasmodic',
        'ميبيفاك', 'ميبيفرين', 'قولون عصبي', 'تشنج القولون', 'مضاد للتقلصات', 'مفعول ممتد', 'مغص'
    ],
    usage: 'مضاد للتقلصات ذو تأثير مباشر وقوي على العضلات الملساء في الأمعاء؛ يستخدم لعلاج آلام البطن الناتجة عن تشنج القولون، وأعراض القولون العصبي المزمنة، والاضطرابات الوظيفية للجهاز الهضمي.',
    timing: 'مرتين يومياً قبل الأكل بـ ٢٠ دقيقة – ٤–٨ أسابيع',
    category: Category.IBS_SPASTIC_COLON,
    form: 'Sustained-release Film-coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216) {
            return '١ قرص (٢٠٠ مجم ممتد المفعول) مرتين يومياً قبل الإفطار وقبل العشاء بـ ٢٠ دقيقة لمدة ٤–٨ أسابيع.';
        } else {
            return 'لا يوصى باستخدام أقراص الـ ٢٠٠ ملجم (الممتدة المفعول) لمن هم دون ١٨ سنة.';
        }
    },
    
    warnings: [
        'الحمل: يُفضّل تجنبه إلا إذا قرر الطبيب ذلك.',
        'الرضاعة: يُفضّل تقييم الفائدة/الخطر قبل الاستخدام.',
        'يُمنع عند الحساسية للميبيفرين.',
        'أوقفه إذا ظهرت أعراض حساسية (طفح/تورم/ضيق نفس).'
    ]
  },
  // 16. Amiprostone 24mcg 20 caps
  {
    id: 'amiprostone-24-cap',
    name: 'Amiprostone 24mcg 20 caps',
    genericName: 'Lubiprostone', 
    concentration: '24mcg',
    price: 106, 
    matchKeywords: [
        'IBS-C', 'chronic constipation', 'lubiprostone', 'amiprostone', 'chloride channel activator', 'OIC',
        'اميبروستين', 'لوبيبروستون', 'إمساك مزمن', 'إمساك القولون العصبي', 'منشط قنوات الكلوريد'
    ],
    usage: 'منشّط لقنوات الكلوريد بالأمعاء يزيد إفراز السوائل المعوية ويساعد على تليين البراز. تركيز ٢٤ ميكروجرام يُستخدم عادةً للإمساك المزمن مجهول السبب (CIC) وبعض حالات الإمساك الناتج عن الأفيونات (OIC) حسب التشخيص.',
    timing: 'مرتين يومياً مع الأكل – ٤–٨ أسابيع',
    category: Category.IBS_SPASTIC_COLON,
    form: 'Soft Gelatin Capsule',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,

    calculationRule: (_weight, ageMonths) => {
        if (ageMonths >= 216) {
            return '١ كبسولة (٢٤ ميكروجرام) مرتين يومياً صباحاً ومساءً مع الوجبات والماء لمدة ٤–٨ أسابيع.';
        } else {
            return 'لا يوصى باستخدامه للأطفال والمراهقين دون سن ١٨ سنة لعدم ثبوت الأمان والفعالية.';
        }
    },
    
    warnings: [
        'ممنوع عند انسداد معوي ميكانيكي معروف/مشتبه به—يلزم تقييم طبي أولاً.',
        'الحمل: يُتجنب إلا إذا قرر الطبيب ذلك (إنقاص الوزن/ملينات قوية غير مناسبة، وبيانات الأمان محدودة).',
        'الرضاعة: يُفضّل تقييم الفائدة/الخطر قبل الاستخدام.',
        'أعراض شائعة: غثيان—تناوله مع الطعام يقلل الغثيان. أوقفه إذا حدث إسهال شديد.',
        'قد يحدث ضيق تنفس مؤقت بعد الجرعة الأولى لدى بعض المرضى؛ إذا كان شديداً/متكرراً أعد التقييم.'
    ]
  },

  // 17. Colospasmin forte 135mg 20 sugar coated tab.
  {
    id: 'colospasmin-forte-135-tab',
    name: 'Colospasmin forte 135mg 20 sugar coated tab.',
    genericName: 'Mebeverine hydrochloride', 
    concentration: '135mg',
    price: 51, 
    matchKeywords: [
        'IBS', 'spastic colon', 'colospasmin', 'colospasmin forte', 'mebeverine', 'antispasmodic', 'abdominal pain',
        'كولوسبازمين', 'كولوسبازمين فورت', 'ميبيفرين', 'قولون عصبي', 'تشنج القولون', 'مضاد للتقلصات'
    ],
    usage: 'مضاد للتقلصات يعمل مباشرة على العضلات الملساء في الأمعاء الغليظة لإرخائها؛ يستخدم لعلاج آلام القولون العصبي والمغص المعوي.',
    timing: '٣ مرات يومياً قبل الأكل بـ ٢٠ دقيقة – ٢–٤ أسابيع',
    category: Category.IBS_SPASTIC_COLON,
    form: 'Sugar Coated Tablet',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) {
            return '١ قرص (١٣٥ مجم) ٣ مرات يومياً قبل الوجبات الرئيسية بـ ٢٠ دقيقة لمدة ٢–٤ أسابيع.';
        } else {
            return 'لا يوصى باستخدام أقراص الـ ١٣٥ ملجم للأطفال دون سن ١٢ سنة.';
        }
    },
    
    warnings: [
        'الحمل: يُفضّل تجنبه إلا إذا قرر الطبيب ذلك.',
        'الرضاعة: يُفضّل تقييم الفائدة/الخطر قبل الاستخدام.',
        'يُمنع عند الحساسية للميبيفرين.',
        'قد لا يناسب مرضى عدم تحمل بعض السكريات/عدم تحمل الفركتوز بسبب الغلاف السكري.'
    ]
  },

  // 18. Coloverin sr 200mg 30 capsules
  {
    id: 'coloverin-sr-200-cap',
    name: 'Coloverin sr 200mg 30 capsules',
    genericName: 'Mebeverine hydrochloride', 
    concentration: '200mg',
    price: 63, 
    matchKeywords: [
        'IBS', 'spastic colon', 'coloverin sr', 'mebeverine', 'antispasmodic', 'abdominal pain', 'cramps',
        'كولوفيرين اس ار', 'كولوفيرين ٢٠٠', 'ميبيفرين', 'قولون عصبي', 'تشنج القولون', 'ممتد المفعول'
    ],
    usage: 'مضاد للتقلصات ممتد المفعول؛ يستخدم لعلاج أعراض القولون العصبي والمغص المعوي المزمن، ويوفر مفعولاً مستمراً على مدار اليوم.',
    timing: 'مرتين يومياً قبل الأكل بـ ٢٠ دقيقة – ٤–٨ أسابيع',
    category: Category.IBS_SPASTIC_COLON,
    form: 'Sustained-release Capsule',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 216) {
            return '١ كبسولة (٢٠٠ مجم ممتدة المفعول) مرتين يومياً صباحاً ومساءً قبل الأكل بـ ٢٠ دقيقة لمدة ٤–٨ أسابيع.';
        } else {
            return 'لا يوصى باستخدامه للأطفال والمراهقين دون سن ١٨ سنة.';
        }
    },
    
    warnings: [
        'الحمل: يُفضّل تجنبه إلا إذا قرر الطبيب ذلك.',
        'الرضاعة: يُفضّل تقييم الفائدة/الخطر قبل الاستخدام.',
        'يُمنع عند الحساسية للميبيفرين.'
    ]
  },

  // 19. Tritone 50mg/5ml i.v./i.m. 5 amp.
  {
    id: 'tritone-50-amp',
    name: 'Tritone 50mg/5ml i.v./i.m. 5 amp.',
    genericName: 'Trimebutine maleate', 
    concentration: '50mg/5ml',
    price: 60, 
    matchKeywords: [
        'IBS', 'spastic colon', 'tritone injection', 'trimebutine ampoule', 'acute spasm', 'motility regulator',
        'ترايتون حقن', 'ترايتون أمبول', 'ترايمبيوتين', 'مغص حاد', 'منظم حركة الأمعاء', 'حقن عضل ووريد'
    ],
    usage: 'حقن منظم لحركة الجهاز الهضمي لتخفيف التقلصات/المغص في الحالات الحادة حسب التشخيص.',
    timing: 'حسب الحاجة في الحالات الحادة',
    category: Category.IBS_SPASTIC_COLON,
    form: 'Ampoule',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (_weight, ageMonths) => {
        if (ageMonths >= 216) {
            return '١ أمبول (٥٠ مجم) حقن عضلي/وريدي بطيء عند الحاجة (حد أقصى ٦ أمبولات/يوم).';
        } else if (ageMonths >= 144 && ageMonths < 216) {
            return '١ أمبول (٥٠ مجم) حقن عضلي/وريدي بطيء مرتين يومياً كحد أقصى عند الحاجة.';
        } else {
            return 'لا يستخدم للأطفال تحت ١٢ سنة إلا في ظروف خاصة وبجرعة ١ ملجم/كجم من الوزن في منشأة صحية.';
        }
    },
    
    warnings: [
        'الحمل: يُتجنب في الثلث الأول كإجراء احترازي، ويُستخدم فقط إذا قرر الطبيب ذلك.',
        'الرضاعة: يُفضّل تقييم الفائدة/الخطر قبل الاستخدام.',
        'يُمنع عند الحساسية للترايمبيوتين.',
        'تجنب الحقن الوريدي السريع لتفادي الدوخة/هبوط الضغط.'
    ]
  },

  // 20. Coloverin 135mg 30 tablets
  {
    id: 'coloverin-135-tab',
    name: 'Coloverin 135mg 30 tablets',
    genericName: 'Mebeverine hydrochloride', 
    concentration: '135mg',
    price: 78, 
    matchKeywords: [
        'IBS', 'spastic colon', 'coloverin', 'mebeverine', 'antispasmodic', 'abdominal pain',
        'كولوفيرين', 'كولوفيرين ١٣٥', 'ميبيفرين', 'قولون عصبي', 'تشنج القولون', 'مضاد للتقلصات'
    ],
    usage: 'مضاد للتقلصات يعمل بشكل مباشر على عضلات الأمعاء؛ يستخدم لعلاج تشنجات القولون العصبي والآلام والانتفاخات المرتبطة به.',
    timing: '٣ مرات يومياً قبل الأكل بـ ٢٠ دقيقة – ٢–٤ أسابيع',
    category: Category.IBS_SPASTIC_COLON,
    form: 'Tablet',

    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
        if (ageMonths >= 144) {
            return '١ قرص (١٣٥ مجم) ٣ مرات يومياً قبل الأكل بـ ٢٠ دقيقة لمدة ٢–٤ أسابيع.';
        } else {
            return 'لا يوصى باستخدامه للأطفال والمراهقين دون سن ١٢ سنة.';
        }
    },
    
    warnings: [
        'الحمل: يُفضّل تجنبه إلا إذا قرر الطبيب ذلك.',
        'الرضاعة: يُفضّل تقييم الفائدة/الخطر قبل الاستخدام.',
        'يُمنع عند الحساسية للميبيفرين.'
    ]
  }
];

export const IBS_SPASTIC_COLON_MEDS: Medication[] = IBS_SPASTIC_COLON_MEDS_RAW.map(sanitizeMedication);
export default IBS_SPASTIC_COLON_MEDS;

