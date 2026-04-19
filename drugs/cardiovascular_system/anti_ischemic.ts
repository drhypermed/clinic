
import { Medication, Category } from '../../types';

export const ANTI_ISCHEMIC_MEDS: Medication[] = [
  // ==========================================
  // ANTI-ANGINAL & VASODILATORS
  // Usage: Ischemic Heart Disease (IHD), Angina, Cerebral/Peripheral Ischemia.
  // ==========================================

  // 1. Nitromak Retard 2.5mg 60 caps
{
  id: 'nitromak-retard-2.5',
  name: 'Nitromak Retard 2.5mg 60 caps',
  genericName: 'Nitroglycerin',
  concentration: '2.5mg',
  price: 96,
  matchKeywords: [
    'angina', 'chest pain', 'ischemia', 'nitroglycerin', 'vasodilator', 'nitromak', 'coronary', 'IHD',
    'نيتروماك', 'نيتروجلسرين', 'ذبحة صدرية', 'قصور الشريان التاجي', 'ألم الصدر', 'توسيع الشرايين', 'نقص تروية'
  ],
  usage: 'الوقاية من نوبات الذبحة الصدرية المزمنة الناتجة عن قصور الشريان التاجي (ليس لعلاج النوبة الحادة).',
  timing: 'مرتين يومياً – مزمن',
  category: Category.ANTI_ISCHEMIC,
  form: 'Sustained-release Capsule',

  minAgeMonths: 216, // 18 years
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ كبسولة ٢.٥ مجم مرتين يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    return 'غير مخصص لمن دون ١٨ سنة.';
  },

  warnings: [
    'ممنوع تماماً استخدامه مع المنشطات الجنسية (مثل الفياجرا/سيلدينافيل) لأنه قد يسبب هبوطاً حاداً ومميتاً في الضغط.',
    'قد يسبب صداعاً شديداً في بداية العلاج، ويمكن علاجه بمسكن بسيط (باراسيتامول).',
    'لا يستخدم لعلاج نوبة الذبحة الحادة (يحتاج لنيتروجلسرين تحت اللسان في تلك الحالة).',
    'يجب الحذر عند القيام من وضع الجلوس لتجنب الدوخة (هبوط الضغط الانتصابي).'
  ]
},

// 2. Tebofortin Forte 80mg 30 f.c. tab.
{
  id: 'tebofortin-forte-80',
  name: 'Tebofortin Forte 80mg 30 f.c. tab.',
  genericName: 'Ginkgo Biloba Extract (EGb 761)',
  concentration: '80mg',
  price: 165,
  matchKeywords: [
    'cerebral circulatory', 'memory', 'tinnitus', 'vertigo', 'ginkgo', 'tebofortin', 'peripheral',
    'تيبوفورتين', 'جينكو بيلوبا', 'الذاكرة', 'طنين الاذن', 'الدوخة', 'قصور الدورة الدموية', 'تنشيط الذاكرة'
  ],
  usage: 'تحسين الدورة الدموية المخية (علاج الدوخة، طنين الأذن، ضعف الذاكرة) والقصور الشرياني الطرفي (برودة الأطراف).',
  timing: 'مرتين يومياً – مزمن',
  category: Category.ANTI_ISCHEMIC,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, // 18 years usually preferred
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ٨٠ مجم مرتين يومياً مع الأكل لمدة طويلة (مزمن)';
    return 'لا يُنصح به للأطفال.';
  },

  warnings: [
    'يجب استخدامه بحذر شديد مع أدوية السيولة (مثل الأسبرين، وارفارين، بلافيكس) لأنه قد يزيد خطر النزيف.',
    'يجب إيقاف الدواء قبل أي عملية جراحية بـ ٣٦ ساعة على الأقل.',
    'قد يسبب صداعاً خفيفاً أو اضطرابات هضمية بسيطة.',
    'لا يستخدم لمرضى الصرع إلا بتقييم التفاعلات لأنه قد يقلل عتبة التشنج.'
  ]
},

// 3. Metacardia MR 35mg 30 f.c. tab.
{
  id: 'metacardia-mr-35',
  name: 'Metacardia MR 35mg 30 f.c. tab.',
  genericName: 'Trimetazidine',
  concentration: '35mg',
  price: 165,
  matchKeywords: [
    'angina', 'metabolic agent', 'trimetazidine', 'metacardia', 'ischemia', 'IHD', 'coronary',
    'ميتاكارديا', 'ترايميتازيدين', 'ذبحة صدرية', 'قصور التاجي', 'حماية القلب', 'نقص تروية', 'ألم الصدر'
  ],
  usage: 'علاج إضافي (Add-on) لمرضى الذبحة الصدرية المستقرة الذين لم يتم التحكم في حالتهم بواسطة علاجات الخط الأول.',
  timing: 'مرتين يومياً – مزمن',
  category: Category.ANTI_ISCHEMIC,
  form: 'Sustained-release Film-coated Tablet',

  minAgeMonths: 216, // 18 years
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ٣٥ مجم مرتين يومياً مع الأكل لمدة طويلة (مزمن)';
    return 'غير مخصص للأطفال.';
  },

  warnings: [
    'هذا الدواء ليس علاجاً لنوبات الذبحة الصدرية الحادة ولا نوبات القلب.',
    'غير مناسب لمرضى الفشل الكلوي الحاد (Creatinine clearance < 30ml/min).',
    'يجب الحذر عند وصفه لكبار السن (فوق ٧٥ سنة)؛ قد يسبب أعراضاً مشابهة للشلل الرعاش (رعشة، تيبس) ويجب إيقافه فوراً في هذه الحالة.',
    'قد يسبب دواراً، لذا يجب الحذر عند القيادة.'
  ]
},

// 4. Tebonina Forte 40mg 20 f.c. tab
{
  id: 'tebonina-forte-40',
  name: 'Tebonina Forte 40mg 20 f.c. tab',
  genericName: 'Ginkgo Biloba Extract (EGb 761)',
  concentration: '40mg',
  price: 130,
  matchKeywords: [
    'cerebral circulatory', 'memory', 'tinnitus', 'tebonina', 'ginkgo',
    'تيبونينا', 'تنشيط الذهن', 'طنين', 'دوار', 'قصور الذاكرة'
  ],
  usage: 'تحسين أعراض القصور المخي المرتبط بالسن (ضعف التركيز والذاكرة) وعلاج مساعد لطنين الأذن والدوار.',
  timing: '٣ مرات يومياً – مزمن',
  category: Category.ANTI_ISCHEMIC,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٤٠ مجم ٣ مرات يومياً مع الأكل لمدة طويلة (مزمن)';
    } else {
      return 'غير مخصص للأطفال.';
    }
  },

  warnings: [
    'يجب تقييم التفاعلات في حال استخدامه مع مضادات التجلط.',
    'قد يزيد من خطر النزيف لدى المرضى الذين لديهم استعداد لذلك.',
    'نتائج التحسن قد تستغرق من ٢ إلى ٤ أسابيع للظهور بشكل ملحوظ.',
    'يجب إيقافه قبل الجراحات والأسنان بفترة كافية.'
  ]
},

// 5. Vastarel MR 35mg 30 f.c.tab.
{
  id: 'vastarel-mr-35',
  name: 'Vastarel MR 35mg 30 f.c.tab.',
  genericName: 'Trimetazidine',
  concentration: '35mg',
  price: 165,
  matchKeywords: [
    'angina', 'trimetazidine', 'vastarel', 'ischemia', 'metabolic',
    'فاستاريل', 'ترايميتازيدين', 'ذبحة', 'قلب', 'نقص التروية'
  ],
  usage: 'العلاج المرجعي (Originator) للذبحة الصدرية المستقرة كعلاج مساعد للتحكم في الأعراض.',
  timing: 'مرتين يومياً – مزمن',
  category: Category.ANTI_ISCHEMIC,
  form: 'Sustained-release Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ٣٥ مجم مرتين يومياً مع الأكل لمدة طويلة (مزمن)';
    return 'لا يُستخدم للأطفال.';
  },

  warnings: [
    'يمنع استخدامه لمرضى الشلل الرعاش (Parkinson’s disease) لأنه قد يزيد الأعراض سوءاً.',
    'يجب تخفيض الجرعة أو الحذر الشديد مع مرضى القصور الكلوي المتوسط.',
    'ليس علاجاً سريعاً لألم الصدر المفاجئ.',
    'قد يسبب اضطرابات هضمية بسيطة.'
  ]
},

// 6. Metacardia 20mg 30 f.c. tab.
{
  id: 'metacardia-20',
  name: 'Metacardia 20mg 30 f.c. tab.',
  genericName: 'Trimetazidine',
  concentration: '20mg',
  price: 130,
  matchKeywords: [
    'angina', 'metabolic agent', 'trimetazidine', 'metacardia', 'ischemia', 'short acting',
    'ميتاكارديا ٢٠', 'ترايميتازيدين', 'ذبحة', 'قصور الشريان'
  ],
  usage: 'علاج مساعد للذبحة الصدرية (مفعول سريع - غير ممتد المفعول).',
  timing: '٣ مرات يومياً – مزمن',
  category: Category.ANTI_ISCHEMIC,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ٢٠ مجم ٣ مرات يومياً مع الأكل لمدة طويلة (مزمن)';
    return 'غير مخصص للأطفال.';
  },

  warnings: [
    'نفس محاذير الميتاكارديا MR (الشلل الرعاش، القصور الكلوي).',
    'أقل ملاءمة للمرضى الذين ينسون الجرعات مقارنة بالتركيز ممتد المفعول.',
    'قد يسبب النعاس أو الدوار.'
  ]
},

// 7. Tebofortin 80mg 30 f.c.tab.
{
  id: 'tebofortin-80',
  name: 'Tebofortin 80mg 30 f.c.tab.',
  genericName: 'Ginkgo Biloba Extract',
  concentration: '80mg',
  price: 130,
  matchKeywords: [
    'cerebral circulatory', 'memory', 'tinnitus', 'ginkgo', 'tebofortin',
    'تيبوفورتين', 'ذاكرة', 'دورة دموية', 'تركيز'
  ],
  usage: 'تحسين الأداء الذهني والدورة الدموية المخية والطرفية.',
  timing: 'مرتين يومياً – مزمن',
  category: Category.ANTI_ISCHEMIC,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٨٠ مجم مرتين يومياً مع الأكل لمدة طويلة (مزمن)';
    } else {
      return 'لا يستخدم للأطفال.';
    }
  },

  warnings: [
    'الحذر مع مرضى السيولة.',
    'إيقاف الدواء قبل الجراحات.',
    'قد يسبب صداع عابر.'
  ]
},

// 8. Randil 10mg 30 tab.
{
  id: 'randil-10',
  name: 'Randil 10mg 30 tab.',
  genericName: 'Nicorandil',
  concentration: '10mg',
  price: 170,
  matchKeywords: [
    'angina', 'nicorandil', 'randil', 'potassium channel opener', 'vasodilator', 'IHD', 'coronary',
    'رانديل', 'نيكورانديل', 'ذبحة صدرية', 'موسع للشرايين', 'ألم الصدر', 'نقص تروية'
  ],
  usage: 'الوقاية وعلاج الذبحة الصدرية المستقرة (يعمل بآلية مزدوجة لتوسيع الشرايين).',
  timing: 'مرتين يومياً – مزمن',
  category: Category.ANTI_ISCHEMIC,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ١٠ مجم مرتين يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    return 'غير مخصص للأطفال.';
  },

  warnings: [
    'تحذير هام: قد يسبب هذا الدواء تقرحات في الجلد أو الأغشية المخاطية (الفم، المعدة، أو الشرج). يجب إبلاغ الطبيب فوراً عند ظهور أي قرحة.',
    'يسبب صداعاً شائعاً في بداية العلاج (بسبب توسع الشرايين).',
    'ممنوع استخدامه مع أدوية الانتصاب (مثل الفياجرا) لتجنب هبوط الضغط الخطير.',
    'لا ينصح به لمرضى الوذمة الرئوية (مياه على الرئة).'
  ]
},
// 9. Bradiprect 7.5 mg 28 f.c. tabs
{
  id: 'bradiprect-7.5',
  name: 'Bradiprect 7.5 mg 28 f.c. tabs',
  genericName: 'Ivabradine',
  concentration: '7.5mg',
  price: 176,
  matchKeywords: [
    'angina', 'heart failure', 'heart rate', 'sinus rhythm', 'bradiprect', 'ivabradine',
    'براديبريكت', 'ايفابرادين', 'تنظيم ضربات القلب', 'ذبحة صدرية', 'فشل القلب', 'سرعة الضربات'
  ],
  usage: 'لعلاج الذبحة الصدرية المزمنة وفشل القلب الاحتقاني (لتقليل معدل ضربات القلب وتحسين كفاءة العضلة).',
  timing: 'مرتين يومياً – مزمن',
  category: Category.ANTI_ISCHEMIC,
  form: 'Film-coated Tablet',

  minAgeMonths: 72, // Ivabradine floor 6yrs
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ٧.٥ مجم مرتين يومياً مع الأكل لمدة طويلة (مزمن)';
    return 'غير مخصص لمن دون ١٨ سنة.';
  },

  warnings: [
    'قد يسبب ظاهرة بصرية مؤقتة (رؤية ومضات ضوئية أو هالات ساطعة) خاصة عند الانتقال المفاجئ للضوء، وهي غير مقلقة.',
    'ممنوع استخدامه إذا كان نبض القلب وقت الراحة أقل من ٥٠ دقة/دقيقة قبل العلاج.',
    'لا يستخدم مع دواء (Diltiazem) أو (Verapamil) أو مضادات الفطريات القوية.',
    'يستخدم فقط للمرضى الذين لديهم نظم جيبي (Normal Sinus Rhythm) وليس لمرضى الرفرفة الأذينية (AF).'
  ]
},

// 10. Cerebromap 200 mg 30 caps
{
  id: 'cerebromap-200',
  name: 'Cerebromap 200 mg 30 caps',
  genericName: 'Naftidrofuryl Oxalate',
  concentration: '200mg',
  price: 225,
  matchKeywords: [
    'peripheral vascular', 'claudication', 'cerebral', 'naftidrofuryl', 'cerebromap',
    'سيريبروماب', 'قصور الدورة الدموية', 'عرج متقطع', 'ألم الساقين', 'قصور مخي'
  ],
  usage: 'تحسين تدفق الدم في الأوعية الطرفية (علاج ألم الساقين أثناء المشي/العرج المتقطع) والقصور المخي لدى كبار السن.',
  timing: '٣ مرات يومياً – مزمن',
  category: Category.ANTI_ISCHEMIC, // Or PERIPHERAL_VASODILATOR
  form: 'Capsule',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ كبسولة ٢٠٠ مجم ٣ مرات يومياً مع الأكل لمدة طويلة (مزمن)';
    return 'غير مخصص للأطفال.';
  },

  warnings: [
    'يجب شرب كميات كافية من الماء أثناء تناول الدواء لمنع تكون حصوات الكلى (أوكسالات).',
    'لا تتكأ أو تنم فور تناول الدواء لتجنب التهاب المريء.',
    'إذا لم يشعر المريض بتحسن في مسافة المشي بعد ٦ أشهر، يجب إعادة تقييم العلاج.'
  ]
},

// 11. Napibradine 5 mg 30 f.c. tabs
{
  id: 'napibradine-5',
  name: 'Napibradine 5 mg 30 f.c. tabs',
  genericName: 'Ivabradine',
  concentration: '5mg',
  price: 234,
  matchKeywords: [
    'angina', 'heart failure', 'napibradine', 'ivabradine', 'tachycardia',
    'نابيبرادين', 'ايفابرادين', 'ضربات القلب', 'هبوط القلب'
  ],
  usage: 'بداية العلاج لتنظيم معدل ضربات القلب في حالات الذبحة المستقرة وفشل القلب.',
  timing: 'مرتين يومياً – مزمن',
  category: Category.ANTI_ISCHEMIC,
  form: 'Film-coated Tablet',

  minAgeMonths: 72, // Ivabradine floor 6yrs
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 900) return '١/٢ قرص ٢.٥ مجم مرتين يومياً مع الأكل لمدة طويلة (مزمن)';
    if (ageMonths >= 216) return '١ قرص ٥ مجم مرتين يومياً مع الأكل لمدة طويلة (مزمن)';
    return 'غير مخصص للأطفال.';
  },

  warnings: [
    'راقب النبض: إذا انخفض عن ٥٠ دقة/دقيقة أو شعرت بدوار، يجب تقليل الجرعة وإعادة التقييم.',
    'تجنب عصير الجريب فروت أثناء العلاج لأنه يضاعف تركيز الدواء في الدم.',
    'نفس التحذير بخصوص الومضات الضوئية (Phosphenes).'
  ]
},

// 12. Napibradine 7.5 mg 30 f.c. tabs
{
  id: 'napibradine-7.5',
  name: 'Napibradine 7.5 mg 30 f.c. tabs',
  genericName: 'Ivabradine',
  concentration: '7.5mg',
  price: 243,
  matchKeywords: [
    'angina', 'heart failure', 'napibradine', 'ivabradine',
    'نابيبرادين', 'ايفابرادين', 'تركيز عالي'
  ],
  usage: 'الجرعة الاستمرارية (Maintenance Dose) لمرضى الذبحة وفشل القلب بعد تحمل جرعة الـ ٥ مجم.',
  timing: 'مرتين يومياً – مزمن',
  category: Category.ANTI_ISCHEMIC,
  form: 'Film-coated Tablet',

  minAgeMonths: 72, // Ivabradine floor 6yrs
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٧.٥ مجم مرتين يومياً مع الأكل لمدة طويلة (مزمن)';
    } else {
      return 'غير مخصص للأطفال.';
    }
  },

  warnings: [
    'لا توقف الدواء فجأة دون تقييم التفاعلات.',
    'أعد التقييم (طبيب عيون إن لزم) عند تغيرات الرؤية.'
  ]
},

// 13. Trental 400 SR 20 f.c. tabs
{
  id: 'trental-400',
  name: 'Trental 400 SR 20 f.c. tabs',
  genericName: 'Pentoxifylline',
  concentration: '400mg',
  price: 86,
  matchKeywords: [
    'claudication', 'blood flow', 'viscosity', 'trental', 'pentoxifylline', 'peripheral',
    'ترنتال', 'بنتوكسيفيللين', 'سيولة الدم', 'لزوجه الدم', 'قصور الاطراف', 'الغرغرينا'
  ],
  usage: 'تحسين سريان الدم عن طريق تقليل لزوجة الدم وزيادة مرونة كريات الدم الحمراء (لعلاج قصور الدورة الدموية الطرفية).',
  timing: '٣ مرات يومياً – مزمن',
  category: Category.ANTI_ISCHEMIC,
  form: 'Sustained-release Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ٤٠٠ مجم ٣ مرات يومياً مع الأكل لمدة طويلة (مزمن)';
    return 'غير مخصص للأطفال.';
  },

  warnings: [
    'قد يسبب غثيان أو انزعاج بالمعدة، لذا تناوله وسط وجبة دسمة.',
    'الحذر عند استخدامه مع مرضى ضغط الدم المنخفض أو مرضى الكلى.',
    'قد يزيد من مفعول أدوية الضغط والسكري (الأنسولين)، لذا قد نحتاج لتعديل جرعاتهم.'
  ]
},

// 14. Trivastal Retard 50 mg 30 tab
{
  id: 'trivastal-50',
  name: 'Trivastal Retard 50 mg 30 tab',
  genericName: 'Piribedil',
  concentration: '50mg',
  price: 47.5,
  matchKeywords: [
    'dopamine agonist', 'memory', 'dizziness', 'trivastal', 'parkinson', 'elderly',
    'تريفاستال', 'بيريبيديل', 'الذاكرة', 'الشيخوخة', 'رعشة', 'قصور الادراك'
  ],
  usage: 'علاج مساعد للقصور الإدراكي الحسي المرضي لدى كبار السن (ضعف الانتباه، الذاكرة) وعلاج مرض باركنسون.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTI_ISCHEMIC, // Often categorized here or Neurology
  form: 'Sustained-release Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ٥٠ مجم مرة يومياً بعد الأكل لمدة طويلة (مزمن)';
    return 'غير مخصص للأطفال.';
  },

  warnings: [
    'قد يسبب النعاس المفاجئ، لذا يمنع القيادة عند بدء العلاج.',
    'قد يسبب انخفاض في ضغط الدم خاصة عند الوقوف (Orthostatic hypotension).',
    'قد يسبب غثيان أو قيء بسيط في بداية الاستخدام.'
  ]
},

// 15. Randil 20 mg 30 tab
{
  id: 'randil-20',
  name: 'Randil 20 mg 30 tab',
  genericName: 'Nicorandil',
  concentration: '20mg',
  price: 114,
  matchKeywords: [
    'angina', 'nicorandil', 'randil', 'vasodilator',
    'رانديل ٢٠', 'نيكورانديل', 'موسع شرايين', 'ذبحة'
  ],
  usage: 'الوقاية وعلاج الذبحة الصدرية المستقرة (جرعة مضاعفة للحالات التي تحتاج تحكم أقوى).',
  timing: 'مرتين يومياً – مزمن',
  category: Category.ANTI_ISCHEMIC,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم مرتين يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    } else {
      return 'غير مخصص للأطفال.';
    }
  },

  warnings: [
    'تحذير هام جداً: خطر حدوث تقرحات (فم، شرج، جهاز هضمي). أوقف الدواء فوراً وأعد التقييم عند ظهور أي قرحة.',
    'ممنوع منعاً باتاً استخدامه مع الفياجرا ومشتقاتها (Sildenafil/Tadalafil) لتجنب الهبوط المميت.',
    'الصداع عرض جانبي شائع جداً ويمكن علاجه بالمسكنات.'
  ]
},

// 16. Bradiprect 5 mg 28 f.c. tabs
{
  id: 'bradiprect-5',
  name: 'Bradiprect 5 mg 28 f.c. tabs',
  genericName: 'Ivabradine',
  concentration: '5mg',
  price: 168,
  matchKeywords: [
    'angina', 'heart failure', 'bradiprect', 'ivabradine',
    'براديبريكت ٥', 'ايفابرادين', 'تنظيم ضربات القلب'
  ],
  usage: 'بداية العلاج لتنظيم ضربات القلب في الذبحة الصدرية وفشل القلب.',
  timing: 'مرتين يومياً – مزمن',
  category: Category.ANTI_ISCHEMIC,
  form: 'Film-coated Tablet',

  minAgeMonths: 72, // Ivabradine floor 6yrs
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 900) return '١/٢ قرص ٢.٥ مجم مرتين يومياً مع الأكل لمدة طويلة (مزمن)';
    if (ageMonths >= 216) return '١ قرص ٥ مجم مرتين يومياً مع الأكل لمدة طويلة (مزمن)';
    return 'غير مخصص للأطفال.';
  },

  warnings: [
    'يستخدم فقط إذا كان النبض > ٧٠ دقة/دقيقة والأعراض مستمرة.',
    'راقب حدوث الومضات الضوئية.',
    'تجنب مشروب الجريب فروت.'
  ]
},

// 17. Ginko 40 mg/ml oral soln 30 ml
{
  id: 'ginko-drops',
  name: 'Ginko 40 mg/ml oral soln 30 ml',
  genericName: 'Ginkgo Biloba Extract',
  concentration: '40mg/ml',
  price: 40,
  matchKeywords: [
    'memory', 'circulation', 'drops', 'ginko', 'liquid', 'tinnitus',
    'جينكو', 'نقط', 'شراب', 'ذاكرة', 'دورة دموية', 'النسيان', 'طنين'
  ],
  usage: 'تحسين الدورة الدموية المخية والذاكرة، مناسب لكبار السن الذين يجدون صعوبة في بلع الأقراص.',
  timing: '٣ مرات يومياً – مزمن',
  category: Category.ANTI_ISCHEMIC,
  form: 'Oral Drops',

  minAgeMonths: 216, // Usually adults
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ مل (٤٠ مجم) ٣ مرات يومياً بعد الأكل لمدة طويلة (مزمن)';
    } else {
      return 'غير موصى به للأطفال.';
    }
  },

  warnings: [
    'يحتوي على نسبة كحول، لذا يجب الحذر مع مرضى الكبد أو المتعافين من إدمان الكحول.',
    'الحذر مع أدوية السيولة.',
    'يوقف قبل الجراحة.'
  ]
},

// 18. Isomak Retard 20 mg 20 cap
{
  id: 'isomak-retard-20',
  name: 'Isomak Retard 20 mg 20 cap',
  genericName: 'Isosorbide Dinitrate',
  concentration: '20mg',
  price: 28,
  matchKeywords: [
    'angina', 'nitrate', 'isomak', 'ischemia', 'chest pain',
    'ايزوماك', 'نيترات', 'موسع للشرايين', 'ذبحة', 'ألم الصدر'
  ],
  usage: 'الوقاية طويلة المفعول من نوبات الذبحة الصدرية.',
  timing: 'مرتين يومياً – مزمن',
  category: Category.ANTI_ISCHEMIC,
  form: 'Sustained-release Capsule',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ كبسولة ٢٠ مجم مرتين يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    return 'غير مخصص للأطفال.';
  },

  warnings: [
    'ممنوع تماماً مع الفياجرا وأخواتها.',
    'يجب ترك "فترة خالية من النيترات" (Nitrate-free interval) يومياً (مثلاً تؤخذ الجرعة الأخيرة ٦ مساءً) حتى لا يفقد الدواء مفعوله.',
    'يسبب صداعاً (خاصة في أول أسبوع) ويمكن علاجه بالمسكنات ولا يستدعي وقف الدواء.'
  ]
},
// 19. Nitromak Retard 5mg 30 caps
{
  id: 'nitromak-retard-5',
  name: 'Nitromak Retard 5mg 30 caps',
  genericName: 'Nitroglycerin',
  concentration: '5mg',
  price: 72,
  matchKeywords: [
    'angina', 'chest pain', 'nitroglycerin', 'nitromak', 'vasodilator',
    'نيتروماك ٥', 'نيتروجلسرين', 'ذبحة صدرية', 'توسيع الشرايين'
  ],
  usage: 'الوقاية من نوبات الذبحة الصدرية (تركيز أعلى للحالات التي تحتاج حماية أقوى).',
  timing: 'مرتين يومياً – مزمن',
  category: Category.ANTI_ISCHEMIC,
  form: 'Sustained-release Capsule',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ كبسولة ٥ مجم مرتين يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    } else {
      return 'غير مخصص للأطفال.';
    }
  },

  warnings: [
    'ممنوع الاستخدام مع الفياجرا (Sildenafil) ومشتقاتها.',
    'قد يسبب صداع نابض في الرأس في الأيام الأولى.',
    'يسبب هبوط الضغط عند الوقوف المفاجئ.'
  ]
},

// 20. Procoralan 5mg 28 f.c. tabs
{
  id: 'procoralan-5',
  name: 'Procoralan 5mg 28 f.c. tabs',
  genericName: 'Ivabradine',
  concentration: '5mg',
  price: 352,
  matchKeywords: [
    'angina', 'heart failure', 'procoralan', 'ivabradine', 'originator',
    'بروكورالان', 'ايفابرادين', 'البراند', 'تنظيم ضربات القلب', 'فشل القلب'
  ],
  usage: 'الدواء الأصلي (Originator) لعلاج الذبحة المستقرة وفشل القلب عن طريق خفض معدل ضربات القلب.',
  timing: 'مرتين يومياً – مزمن',
  category: Category.ANTI_ISCHEMIC,
  form: 'Film-coated Tablet',

  minAgeMonths: 72, // Ivabradine floor 6yrs
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 900) { // Elderly > 75
      return '١/٢ قرص ٢.٥ مجم مرتين يومياً مع الأكل لمدة طويلة (مزمن)';
    } else if (ageMonths >= 216) {
      return '١ قرص ٥ مجم مرتين يومياً مع الأكل لمدة طويلة (مزمن)';
    } else {
      return 'غير مخصص للأطفال.';
    }
  },

  warnings: [
    'قد يسبب ومضات ضوئية (Phosphenes) في العين.',
    'ممنوع إذا كان النبض أقل من ٥٠ دقة/دقيقة.',
    'يمنع استخدامه مع مضادات الفطريات (Ketoconazole) والمضادات الحيوية (Macrolides).'
  ]
},

// 21. Tebofortin 40mg 30 f.c.tab
{
  id: 'tebofortin-40-tab',
  name: 'Tebofortin 40mg 30 f.c.tab',
  genericName: 'Ginkgo Biloba Extract',
  concentration: '40mg',
  price: 120,
  matchKeywords: [
    'cerebral', 'memory', 'ginkgo', 'tebofortin', 'circulation',
    'تيبوفورتين', 'ذاكرة', 'دورة دموية', 'النسيان', 'طنين'
  ],
  usage: 'تحسين الدورة الدموية المخية والطرفية (الجرعة القياسية).',
  timing: '٣ مرات يومياً – مزمن',
  category: Category.ANTI_ISCHEMIC,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٤٠ مجم ٣ مرات يومياً مع الأكل لمدة طويلة (مزمن)';
    } else {
      return 'غير مخصص للأطفال.';
    }
  },

  warnings: [
    'وقف الدواء قبل العمليات الجراحية.',
    'الحذر مع أدوية السيولة.'
  ]
},

// 22. Tebofortin 40mg/ml oral drops 30ml
{
  id: 'tebofortin-drops',
  name: 'Tebofortin 40mg/ml oral drops 30ml',
  genericName: 'Ginkgo Biloba Extract',
  concentration: '40mg/ml',
  price: 90,
  matchKeywords: [
    'cerebral', 'memory', 'drops', 'liquid', 'ginkgo',
    'تيبوفورتين نقط', 'نقط للفم', 'ذاكرة', 'كبار السن'
  ],
  usage: 'تحسين الدورة الدموية والذاكرة (شكل دوائي سائل مناسب لمن يجدون صعوبة في البلع).',
  timing: '٣ مرات يومياً – مزمن',
  category: Category.ANTI_ISCHEMIC,
  form: 'Oral Drops',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ مل (٤٠ مجم) ٣ مرات يومياً بعد الأكل لمدة طويلة (مزمن)';
    } else {
      return 'غير مخصص للأطفال.';
    }
  },

  warnings: [
    'يحتوي المحلول على كحول، يرجى مراعاة ذلك لمرضى الكبد.',
    'نفس محاذير الأقراص بخصوص النزيف والجراحة.'
  ]
},

// 23. Ivabragin 5mg 30 f.c. tabs
{
  id: 'ivabragin-5',
  name: 'Ivabragin 5mg 30 f.c. tabs',
  genericName: 'Ivabradine',
  concentration: '5mg',
  price: 234,
  matchKeywords: [
    'angina', 'heart failure', 'ivabragin', 'ivabradine',
    'ايفابراجين', 'ايفابرادين', 'تنظيم ضربات القلب'
  ],
  usage: 'بديل محلي لعلاج الذبحة الصدرية وفشل القلب عن طريق تنظيم النبض.',
  timing: 'مرتين يومياً – مزمن',
  category: Category.ANTI_ISCHEMIC,
  form: 'Film-coated Tablet',

  minAgeMonths: 72, // Ivabradine floor 6yrs
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 900) {
      return '١/٢ قرص ٢.٥ مجم مرتين يومياً مع الأكل لمدة طويلة (مزمن)';
    } else if (ageMonths >= 216) {
      return '١ قرص ٥ مجم مرتين يومياً مع الأكل لمدة طويلة (مزمن)';
    } else {
      return 'غير مخصص للأطفال.';
    }
  },

  warnings: [
    'تجنب القيادة ليلاً إذا حدثت اضطرابات بصرية (هالات ضوئية).',
    'تجنب شرب عصير الجريب فروت.'
  ]
},

// 24. Ivabragin 7.5mg 30 f.c. tabs
{
  id: 'ivabragin-7.5',
  name: 'Ivabragin 7.5mg 30 f.c. tabs',
  genericName: 'Ivabradine',
  concentration: '7.5mg',
  price: 243,
  matchKeywords: [
    'angina', 'heart failure', 'ivabragin', 'ivabradine',
    'ايفابراجين', 'تركيز عالي', 'نبض القلب'
  ],
  usage: 'الجرعة الاستمرارية لعلاج الذبحة وفشل القلب.',
  timing: 'مرتين يومياً – مزمن',
  category: Category.ANTI_ISCHEMIC,
  form: 'Film-coated Tablet',

  minAgeMonths: 72, // Ivabradine floor 6yrs
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٧.٥ مجم مرتين يومياً مع الأكل لمدة طويلة (مزمن)';
    } else {
      return 'غير مخصص للأطفال.';
    }
  },

  warnings: [
    'ممنوع لمرضى الرجفان الأذيني (Atrial Fibrillation).',
    'يجب متابعة النبض بانتظام.'
  ]
},

// 25. Dinitra 5mg 30 sublingual tab
{
  id: 'dinitra-5-sl',
  name: 'Dinitra 5mg 30 sublingual tab',
  genericName: 'Isosorbide Dinitrate',
  concentration: '5mg',
  price: 16,
  matchKeywords: [
    'angina attack', 'chest pain', 'sublingual', 'dinitra', 'emergency',
    'دانيترا', 'تحت اللسان', 'ذبحة صدرية', 'ألم الصدر', 'طوارئ القلب'
  ],
  usage: 'علاج طارئ وسريع لنوبة الذبحة الصدرية الحادة (ألم الصدر المفاجئ).',
  timing: 'عند اللزوم',
  category: Category.ANTI_ISCHEMIC,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم تحت اللسان عند اللزوم بدون اعتبار للأكل؛ يمكن التكرار بحد أقصى ٣ أقراص خلال ١٥ دقيقة';
    } else {
      return 'غير مخصص للأطفال.';
    }
  },

  warnings: [
    'الحد الأقصى ٣ أقراص خلال ١٥ دقيقة. إذا لم يزل الألم، فهذه حالة طوارئ (اشتباه جلطة).',
    'ممنوع نهائياً استخدامه إذا كان المريض قد تناول فياجرا أو سياليس خلال الـ ٢٤-٤٨ ساعة الماضية (خطر الموت).',
    'قد يسبب صداعاً شديداً فورياً.'
  ]
},

// 26. Nitroderm TTS 5mg 7 patches
{
  id: 'nitroderm-tts-5',
  name: 'Nitroderm TTS 5mg 7 patches',
  genericName: 'Nitroglycerin',
  concentration: '5mg/24h',
  price: 126,
  matchKeywords: [
    'angina', 'patch', 'transdermal', 'nitroderm', 'prevention',
    'نيترودرم', 'لزقة القلب', 'لصقة', 'ذبحة', 'وقاية'
  ],
  usage: 'لصقات جلدية للوقاية المستمرة من نوبات الذبحة الصدرية.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTI_ISCHEMIC,
  form: 'Film',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ لصقة ٥ مجم مرة يومياً على الجلد لمدة طويلة (مزمن)';
    } else {
      return 'غير مخصص للأطفال.';
    }
  },

  warnings: [
    'يجب تغيير مكان وضع اللصقة يومياً لتجنب التهاب الجلد.',
    'ممنوع مع الفياجرا.',
    'لا تقص أو تقطع اللصقة.',
    'تزال قبل التصوير بالرنين المغناطيسي (MRI) أو الصدمات الكهربائية للقلب.'
  ]
},

// 27. Pental 400mg 20 s.r.tab
{
  id: 'pental-400',
  name: 'Pental 400mg 20 s.r.tab',
  genericName: 'Pentoxifylline',
  concentration: '400mg',
  price: 74,
  matchKeywords: [
    'claudication', 'circulation', 'pental', 'pentoxifylline', 'blood flow',
    'بنتال', 'بنتوكسيفيللين', 'سيولة', 'دورة دموية', 'الغرغرينا'
  ],
  usage: 'تحسين تدفق الدم في الشعيرات الدقيقة وعلاج قصور الدورة الدموية الطرفية.',
  timing: '٣ مرات يومياً – مزمن',
  category: Category.ANTI_ISCHEMIC,
  form: 'Sustained-release Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٤٠٠ مجم ٣ مرات يومياً بعد الأكل لمدة طويلة (مزمن)';
    } else {
      return 'غير مخصص للأطفال.';
    }
  },

  warnings: [
    'قد يسبب اضطرابات في المعدة.',
    'قد يزيد من تأثير أدوية الضغط والسكري.'
  ]
},

// 28. Nitroderm TTS 10mg 7 patches
{
  id: 'nitroderm-tts-10',
  name: 'Nitroderm TTS 10mg 7 patches',
  genericName: 'Nitroglycerin',
  concentration: '10mg/24h',
  price: 133,
  matchKeywords: [
    'angina', 'patch', 'transdermal', 'nitroderm', 'high dose',
    'نيترودرم ١٠', 'لصقة 10', 'وقاية الذبحة'
  ],
  usage: 'لصقات جلدية بتركيز مضاعف للوقاية من الذبحة الصدرية للحالات التي لم تستجب لتركيز ٥ مجم.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTI_ISCHEMIC,
  form: 'Film',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 60,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ لصقة ١٠ مجم مرة يومياً على الجلد لمدة طويلة (مزمن)';
    } else {
      return 'غير مخصص للأطفال.';
    }
  },

  warnings: [
    'نفس المحاذير: ممنوع مع الفياجرا، ويجب إزالتها قبل النوم لتجنب التعود (Tolerance).',
    'قد تسبب صداعاً أقوى من تركيز ٥ مجم.'
  ]
},

// 29. Procoralan 7.5mg 28 f.c. tabs
{
  id: 'procoralan-7.5',
  name: 'Procoralan 7.5mg 28 f.c. tabs',
  genericName: 'Ivabradine',
  concentration: '7.5mg',
  price: 352,
  matchKeywords: [
    'angina', 'heart failure', 'procoralan', 'ivabradine', 'originator',
    'بروكورالان ٧.٥', 'ايفابرادين', 'البراند'
  ],
  usage: 'الدواء الأصلي (Originator) - جرعة الاستمرار لعلاج الذبحة وفشل القلب.',
  timing: 'مرتين يومياً – مزمن',
  category: Category.ANTI_ISCHEMIC,
  form: 'Film-coated Tablet',

  minAgeMonths: 72, // Ivabradine floor 6yrs
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٧.٥ مجم مرتين يومياً مع الأكل لمدة طويلة (مزمن)';
    } else {
      return 'غير مخصص للأطفال.';
    }
  },

  warnings: [
    'لا توقف الدواء فجأة.',
    'راقب النبض وتأكد أنه لا يقل عن ٥٠ دقة في الدقيقة.'
  ]
},
// 30. Adwistadine 5 mg 30 scored f.c.tabs.
{
  id: 'adwistadine-5',
  name: 'Adwistadine 5 mg 30 scored f.c.tabs.',
  genericName: 'Ivabradine',
  concentration: '5mg',
  price: 178.5,
  matchKeywords: [
    'angina', 'heart failure', 'ivabradine', 'adwistadine', 'heart rate',
    'أدويستادين', 'ايفابرادين', 'ضربات القلب', 'الذبحة الصدرية', 'هبوط القلب'
  ],
  usage: 'تنظيم معدل ضربات القلب لمرضى الذبحة الصدرية المستقرة وفشل القلب الاحتقاني.',
  timing: 'مرتين يومياً – مزمن',
  category: Category.ANTI_ISCHEMIC,
  form: 'Film-coated Tablet',

  minAgeMonths: 72, // Ivabradine floor 6yrs
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 900) { // Elderly > 75 years
      return '١/٢ قرص ٢.٥ مجم مرتين يومياً مع الأكل لمدة طويلة (مزمن)';
    } else if (ageMonths >= 216) {
      return '١ قرص ٥ مجم مرتين يومياً مع الأكل لمدة طويلة (مزمن)';
    } else {
      return 'لا يستخدم للأطفال والمراهقين أقل من ١٨ سنة.';
    }
  },

  warnings: [
    'يجب متابعة نبض القلب بانتظام؛ إذا قل عن ٥٠ دقة/دقيقة يجب إعادة التقييم لتقليل الجرعة.',
    'قد يلاحظ المريض ومضات ضوئية عند تغير الإضاءة فجأة (عرض مؤقت ولا يستدعي القلق).',
    'ممنوع استخدامه في حالات الرفرفة الأذينية (Atrial Fibrillation).',
    'تجنب تناول عصير الجريب فروت أثناء فترة العلاج.'
  ]
},

// 31. vasocare 400mg s.r. 20 tab.
{
  id: 'vasocare-400-sr',
  name: 'vasocare 400mg s.r. 20 tab.',
  genericName: 'Pentoxifylline',
  concentration: '400mg',
  price: 74,
  matchKeywords: [
    'peripheral vascular disease', 'intermittent claudication', 'pentoxifylline', 'vasocare', 'blood viscosity',
    'فازوكير', 'بنتوكسيفيللين', 'سيولة الدم', 'قصور الدورة الدموية الطرفية', 'ألم الساقين'
  ],
  usage: 'تحسين تدفق الدم في الأطراف وعلاج العرج المتقطع الناتجة عن ضيق الشرايين.',
  timing: '٣ مرات يومياً – مزمن',
  category: Category.ANTI_ISCHEMIC,
  form: 'Sustained-release Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٤٠٠ مجم ٣ مرات يومياً بعد الأكل لمدة طويلة (مزمن)';
    } else {
      return 'غير مخصص للاستخدام في الأطفال.';
    }
  },

  warnings: [
    'يستخدم بحذر شديد مع المرضى الذين لديهم تاريخ من النزيف أو قرحة المعدة.',
    'قد يسبب غثيان، دوار، أو اضطرابات هضمية بسيطة في بداية العلاج.',
    'يجب تعديل الجرعة في مرضى القصور الكلوي الحاد أو القصور الكبدي.',
    'راجع تداخلات المريض.'
  ]
}

];

