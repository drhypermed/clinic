
import { Medication, Category } from '../../../types';

export const VASODILATORS_MEDS: Medication[] = [
  // 1. Aldomet 250 mg 30 tab
{
  id: 'aldomet-250-tab',
  name: 'Aldomet 250 mg 30 tab',
  genericName: 'Methyldopa',
  concentration: '250mg',
  price: 111,
  matchKeywords: [
    'hypertension', 'methyldopa', 'aldomet', 'pregnancy hypertension', 'blood pressure',
    'الدومت', 'ميثيل دوبا', 'ضغط الحمل', 'ارتفاع ضغط الدم', 'ضغط مرتفع'
  ],
  usage: 'علاج ارتفاع ضغط الدم، ويعتبر الخيار الأول والأكثر أماناً لعلاج ضغط الدم المرتفع أثناء الحمل.',
  timing: '٣ مرات يومياً – مزمن',
  category: Category.VASODILATORS,
  form: 'Tablet',

  minAgeMonths: 144, // 12 years (Rarely used for younger unless specified)
  maxAgeMonths: 1200,
  minWeight: 35,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 144) return '١ قرص ٢٥٠ مجم ٣ مرات يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    return '١ قرص ٢٥٠ مجم ٣ مرات يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'قد يسبب النعاس والدوار خاصة في بداية العلاج، لذا يجب الحذر عند القيادة.',
    'قد يسبب تغيراً في لون البول للداكن عند تعرضه للهواء (عرض غير ضار).',
    'يجب عمل اختبار وظائف كبد وصورة دم (Coombs test) بشكل دوري عند الاستخدام لفترات طويلة.',
    'آمن تماماً للحامل والمرضع (Category B).'
  ]
},

// 2. Cardura 4mg 14 tab
{
  id: 'cardura-4-tab',
  name: 'Cardura 4mg 14 tab',
  genericName: 'Doxazosin',
  concentration: '4mg',
  price: 80,
  matchKeywords: [
    'hypertension', 'doxazosin', 'cardura', 'bph', 'prostate', 'alpha blocker',
    'كاردورا', 'دوكسازوسين', 'تضخم البروستاتا', 'ضغط الدم', 'حاصرات ألفا'
  ],
  usage: 'علاج ارتفاع ضغط الدم، وعلاج أعراض تضخم البروستاتا الحميد (BPH).',
  timing: 'مرة يومياً – مزمن',
  category: Category.VASODILATORS,
  form: 'Tablet',

  minAgeMonths: 216, // 18 years
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ٤ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    return 'غير مخصص للأطفال.';
  },

  warnings: [
    'لا يُبدأ العلاج بتركيز ٤ مجم مباشرة لتجنب هبوط الضغط الحاد (First-dose phenomenon).',
    'يجب الحذر عند القيام من وضع الجلوس أو النوم لتجنب الدوخة (Orthostatic Hypotension).',
    'يستخدم بحذر لمرضى الكبد.',
    'قد يسبب خمولاً بسيطاً أو صداعاً.'
  ]
},

// 3. Cardura XL 4mg 28 prolonged release
{
  id: 'cardura-xl-4-tab',
  name: 'Cardura XL 4mg 28 prolonged release',
  genericName: 'Doxazosin',
  concentration: '4mg',
  price: 255,
  matchKeywords: [
    'hypertension', 'doxazosin', 'cardura xl', 'extended release', 'bph',
    'كاردورا اكس ال', 'ممتد المفعول', 'البروستاتا', 'ضغط الدم'
  ],
  usage: 'قرص ممتد المفعول لعلاج ارتفاع ضغط الدم وتضخم البروستاتا بجرعة واحدة يومياً مع ثبات مستوى الدواء في الدم.',
  timing: 'مرة يومياً – مزمن',
  category: Category.VASODILATORS,
  form: 'Prolonged Release Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٤ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'غير مخصص للاستخدام في الأطفال.';
    }
  },

  warnings: [
    'قد يلاحظ المريض خروج هيكل القرص فارغاً في البراز (Ghost Tablet)، وهذا طبيعي ولا يعني عدم الامتصاص.',
    'أقل تأثيراً في إحداث هبوط الضغط المفاجئ مقارنة بالأقراص العادية، لكن الحذر واجب.',
    'يمنع استخدامه لمن لديهم تاريخ مع انسداد الجهاز الهضمي.'
  ]
},

// 4. Dosin 2mg 20 tab
{
  id: 'dosin-2-tab',
  name: 'Dosin 2mg 20 tab',
  genericName: 'Doxazosin',
  concentration: '2mg',
  price: 32,
  matchKeywords: [
    'hypertension', 'doxazosin', 'dosin', 'bph',
    'دوسين', 'دوكسازوسين', 'ضغط الدم', 'بروستاتا'
  ],
  usage: 'بديل اقتصادي لعلاج ضغط الدم وتضخم البروستاتا (نفس المادة الفعالة لكاردورا).',
  timing: 'مرة يومياً – مزمن',
  category: Category.VASODILATORS,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: () => '١ قرص ٢ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)',

  warnings: [
    'يسبب انخفاض ضغط الدم الانتصابي، لذا يجب الحذر عند الوقوف المفاجئ.',
    'إذا توقف المريض عن الدواء لعدة أيام، يجب البدء مجدداً بتركيز ١ مجم.'
  ]
},

// 5. Dosin 4mg 20 tab
{
  id: 'dosin-4-tab',
  name: 'Dosin 4mg 20 tab',
  genericName: 'Doxazosin',
  concentration: '4mg',
  price: 46,
  matchKeywords: [
    'hypertension', 'doxazosin', 'dosin', 'bph',
    'دوسين ٤', 'ضغط', 'بروستاتا'
  ],
  usage: 'علاج ارتفاع ضغط الدم وأعراض تضخم البروستاتا (جرعة الصيانة المعتادة).',
  timing: 'مرة يومياً – مزمن',
  category: Category.VASODILATORS,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: () => '١ قرص ٤ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)',

  warnings: [
    'تنبيه: لا تبدأ العلاج بهذا التركيز مباشرة لمريض جديد.',
    'يجب مراقبة ضغط الدم بانتظام أثناء المعالجة.',
    'قد يسبب خفقان بسيط في القلب كأثر جانبي.'
  ]
},

// 6. Cardura 1mg 21 tab
{
  id: 'cardura-1-tab',
  name: 'Cardura 1mg 21 tab',
  genericName: 'Doxazosin',
  concentration: '1mg',
  price: 78,
  matchKeywords: [
    'hypertension', 'doxazosin', 'cardura', 'start dose', 'bph',
    'كاردورا ١', 'بداية العلاج', 'ضغط', 'بروستاتا'
  ],
  usage: 'الجرعة الابتدائية (Starting Dose) لبدء علاج ضغط الدم أو البروستاتا بأمان.',
  timing: 'مرة يومياً – مزمن',
  category: Category.VASODILATORS,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: () => '١ قرص ١ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)',

  warnings: [
    'خطر حدوث "إغماء الجرعة الأولى" وارد جداً، لذا يمنع القيام بأي مجهود أو قيادة بعد تناول أول جرعة.',
    'يستخدم للتدريج الدوائي للوصول للجرعة الفعالة بأقل آثار جانبية.'
  ]
},

// 7. Dosin 1mg 20 tab
{
  id: 'dosin-1-tab',
  name: 'Dosin 1mg 20 tab',
  genericName: 'Doxazosin',
  concentration: '1mg',
  price: 22,
  matchKeywords: [
    'hypertension', 'doxazosin', 'dosin', 'start dose',
    'دوسين ١', 'بداية جرعة', 'ضغط'
  ],
  usage: 'الجرعة الابتدائية الاقتصادية لبدء علاج ضغط الدم أو البروستاتا.',
  timing: 'مرة يومياً – مزمن',
  category: Category.VASODILATORS,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: () => '١ قرص ١ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)',

  warnings: [
    'نفس محاذير الكاردورا ١ مجم: انتبه من الدوخة المفاجئة عند الوقوف.',
    'إذا نسيت الدواء لعدة أيام، ابدأ بهذا التركيز مرة أخرى ولا تأخذ التركيزات الأعلى فوراً.'
  ]
},

// 8. Methyldopa 250mg 30 f.c. tabs
{
  id: 'methyldopa-250-stada',
  name: 'Methyldopa 250mg 30 f.c. tabs',
  genericName: 'Methyldopa',
  concentration: '250mg',
  price: 111,
  matchKeywords: [
    'hypertension', 'methyldopa', 'stada', 'pregnancy',
    'ميثيل دوبا', 'ستادا', 'ضغط الحمل', 'امان للحامل'
  ],
  usage: 'علاج ارتفاع ضغط الدم (مثيل للدواء "ألدومت")، الخيار الأفضل لحالات تسمم الحمل وضغط الدم المزمن أثناء الحمل.',
  timing: '٣ مرات يومياً – مزمن',
  category: Category.VASODILATORS,
  form: 'Film-coated Tablet',

  minAgeMonths: 144,
  maxAgeMonths: 1200,
  minWeight: 35,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 144) return '١ قرص ٢٥٠ مجم ٣ مرات يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    return '١ قرص ٢٥٠ مجم ٣ مرات يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'قد يسبب جفافاً في الفم واحتقان في الأنف.',
    'ممنوع لمرضى التهاب الكبد النشط أو تليف الكبد.',
    'آمن جداً للجنين ولا يؤثر على تدفق الدم للمشيمة.'
  ]
}
];

