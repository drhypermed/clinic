import { Medication, Category } from '../../../types';

export const HEART_FAILURE_ARB_MEDS: Medication[] = [
 // 1. Atacand 16mg 14 f.c. tab
{
  id: 'atacand-16-tabs',
  name: 'Atacand 16mg 14 f.c. tab',
  genericName: 'Candesartan Cilexetil',
  concentration: '16mg',
  price: 116,
  matchKeywords: [
    'arb', 'candesartan', 'atacand', 'hypertension', 'heart failure', 'strong', 'angiotensin receptor blocker',
    'اتاكاند', 'كانديسارتان', 'ضغط', 'هبوط القلب', 'بديل تريتاس', 'ضغط عالي', 'ضغط مرتفع', 'فشل قلب'
  ],
  usage: 'من أقوى أدوية الضغط في فئته؛ يستخدم لعلاج ارتفاع ضغط الدم وقصور عضلة القلب (Heart Failure) بكفاءة عالية.',
  timing: 'مرة يومياً – مزمن',
  category: Category.HEART_FAILURE,
  form: 'Film-coated Tablet',

  minAgeMonths: 12, // Candesartan floor
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ١٦ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'ممنوع للحوامل نهائياً (Category D).',
    'يجب متابعة وظائف الكلى والبوتاسيوم.',
    'لا يسبب الكحة الجافة مثل أدوية ACEIs.'
  ]
},

// 2. Atacand 4mg 14 tab
{
  id: 'atacand-4-tabs',
  name: 'Atacand 4mg 14 tab',
  genericName: 'Candesartan Cilexetil',
  concentration: '4mg',
  price: 39.75,
  matchKeywords: [
    'arb', 'candesartan', 'atacand', 'starting dose', 'heart failure',
    'اتاكاند ٤', 'جرعة البداية', 'ضعف العضلة'
  ],
  usage: 'الجرعة الافتتاحية (Starting Dose) لمرضى قصور القلب (Heart Failure) لتعويد الجسم، أو لمرضى الضغط كبار السن.',
  timing: 'مرة يومياً – مزمن',
  category: Category.HEART_FAILURE,
  form: 'Tablet',

  minAgeMonths: 12, // Candesartan floor
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: () => '١ قرص ٤ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)',

  warnings: [
    'ممنوع للحوامل.',
    'يراقب الضغط بدقة في بداية العلاج.'
  ]
},

// 3. Atacand 8mg 14 tab
{
  id: 'atacand-8-tabs',
  name: 'Atacand 8mg 14 tab',
  genericName: 'Candesartan Cilexetil',
  concentration: '8mg',
  price: 83,
  matchKeywords: [
    'arb', 'candesartan', 'atacand', 'hypertension',
    'اتاكاند ٨', 'ضغط متوسط', 'كانديسارتان'
  ],
  usage: 'الجرعة المتوسطة والمعتادة لعلاج ضغط الدم المرتفع.',
  timing: 'مرة يومياً – مزمن',
  category: Category.HEART_FAILURE,
  form: 'Tablet',

  minAgeMonths: 12, // Candesartan floor
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٨ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'ممنوع للحوامل (Category D).',
    'يجب متابعة وظائف الكلى والبوتاسيوم.',
    'قد يسبب دواراً عند الوقوف المفاجئ.'
  ]
},

// 4. Losazide 50/12.5mg 30 f.c. tab
{
  id: 'losazide-50-12.5-tabs',
  name: 'Losazide 50/12.5mg 30 f.c. tab',
  genericName: 'Losartan + Hydrochlorothiazide',
  concentration: '50mg/12.5mg',
  price: 66,
  matchKeywords: [
    'arb', 'diuretic', 'losazide', 'losartan', 'gout', 'uric acid',
    'لوزازيد', 'لوزارتان', 'مدر للبول', 'ضغط', 'نقرس'
  ],
  usage: 'علاج فعال للضغط، ويتميز اللوزارتان بأنه الوحيد في عائلته الذي يساعد في خفض حمض اليوريك (مفيد لمرضى النقرس).',
  timing: 'مرة يومياً – مزمن',
  category: Category.HEART_FAILURE,
  form: 'Film-coated Tablet',

  minAgeMonths: 12, // Losartan floor
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٥٠/١٢.٥ مجم مرة يومياً صباحاً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'ممنوع للحوامل (Category D).',
    'تأكد من عدم وجود حساسية لمركبات السلفا (بسبب مدر البول).',
    'يجب متابعة مستوى البوتاسيوم والصوديوم بانتظام.',
    'المدر للبول (HCTZ) قد يرفع مستوى السكر وحمض اليوريك.'
  ]
},

// 5. Geocand Plus 16/12.5mg 21 tab
{
  id: 'geocand-plus-16-12.5',
  name: 'Geocand plus 16/12.5mg 21 tab',
  genericName: 'Candesartan + Hydrochlorothiazide',
  concentration: '16mg/12.5mg',
  price: 108,
  matchKeywords: [
    'arb', 'diuretic', 'geocand', 'candesartan',
    'جيوكاند بلس', 'جيوكاند', 'ضغط', 'كانديسارتان'
  ],
  usage: 'تركيبة قوية لضبط الضغط (كانديسارتان ١٦ مجم + مدر بول).',
  timing: 'مرة يومياً – مزمن',
  category: Category.HEART_FAILURE,
  form: 'Tablet',

  minAgeMonths: 12, // Candesartan floor
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ١٦/١٢.٥ مجم مرة يومياً صباحاً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'ممنوع للحوامل.',
    'متابعة البوتاسيوم ضرورية.'
  ]
},

// 6. Albustix D 32/12.5mg 30 tab
{
  id: 'albustix-d-32-12.5',
  name: 'Albustix D 32/12.5mg 30 tab', // Correction: Usually spelled Albutix/Albustix depending on registry
  genericName: 'Candesartan + Hydrochlorothiazide',
  concentration: '32mg/12.5mg',
  price: 216,
  matchKeywords: [
    'arb', 'diuretic', 'high dose', 'albustix', 'albutix',
    'البوستيكس دي', 'البوتيكس', 'جرعة قصوى', 'ضغط عنيد'
  ],
  usage: 'أقصى جرعة من الكانديسارتان (٣٢ مجم) مع مدر للبول. يستخدم للحالات المستعصية جداً (Resistant Hypertension).',
  timing: 'مرة يومياً – مزمن',
  category: Category.HEART_FAILURE,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 60,
  maxWeight: 300,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٣٢/١٢.٥ مجم مرة يومياً صباحاً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'ممنوع للحوامل.',
    'خطر حدوث هبوط في الضغط (Hypotension) وارد جداً، يجب قياس الضغط بانتظام.',
    'ممنوع لمرضى الفشل الكلوي الحاد.'
  ]
},

// 7. Loraz 50/12.5 mg 14 tablets
{
  id: 'atacand-8-28-tabs',
  name: 'Atacand 8mg 28 tab.',
  genericName: 'Candesartan Cilexetil',
  concentration: '8mg',
  price: 166,
  matchKeywords: [
    'arb', 'candesartan', 'atacand', 'pack', 'maintenance',
    'اتاكاند ٨', 'عبوة شهرية', 'ضغط', 'كانديسارتان'
  ],
  usage: 'الجرعة المتوسطة من أتاكاند (عبوة شهرية ٢٨ قرص)؛ لعلاج ضغط الدم والوقاية من تضخم عضلة القلب.',
  timing: 'مرة يومياً – مزمن',
  category: Category.HEART_FAILURE,
  form: 'Tablet',

  minAgeMonths: 12, // Candesartan floor
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٨ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: ['ممنوع للحوامل.']
},

// 11. Candeblock- D 16/12.5mg 20 tab.
{
  id: 'candeblock-d-16-12.5',
  name: 'Candeblock- d 16/12.5mg 20 tab.',
  genericName: 'Candesartan + Hydrochlorothiazide',
  concentration: '16mg/12.5mg',
  price: 106,
  matchKeywords: [
    'arb', 'diuretic', 'candeblock', 'candesartan',
    'كانديبلوك دي', 'كانديسارتان', 'مدر', 'ضغط'
  ],
  usage: 'علاج مركب لضغط الدم (يحتوي على مدر للبول)؛ بديل جيد للأتاكاند بلس.',
  timing: 'مرة يومياً – مزمن',
  category: Category.HEART_FAILURE,
  form: 'Tablet',

  minAgeMonths: 12, // Candesartan floor
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ١٦/١٢.٥ مجم مرة يومياً صباحاً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'ممنوع للحوامل.',
    'تابع مستوى البوتاسيوم.'
  ]
},

// 14. Losazide 50/12.5mg 10 f.c.tabs.
{
  id: 'albustix-8-tabs',
  name: 'Albustix 8 mg 30 tabs.',
  genericName: 'Candesartan Cilexetil',
  concentration: '8mg',
  price: 81,
  matchKeywords: [
    'arb', 'candesartan', 'albustix', 'pure',
    'البوستيكس ٨', 'كانديسارتان', 'صافي', 'بدون مدر'
  ],
  usage: 'كانديسارتان صافي (بدون مدر للبول)؛ مناسب لمرضى الضغط الذين لا يتحملون مدرات البول أو مرضى النقرس.',
  timing: 'مرة يومياً – مزمن',
  category: Category.HEART_FAILURE,
  form: 'Tablet',

  minAgeMonths: 12, // Candesartan floor
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٨ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'ممنوع للحوامل (Category D).',
    'يجب متابعة وظائف الكلى والبوتاسيوم.',
    'لا يسبب الكحة الجافة مثل أدوية ACEIs.'
  ]
},

// 17. Amosar 50mg 30 f.c. tabs.
{
  id: 'amosar-50-tabs',
  name: 'Amosar 50mg 30 f.c. tabs.',
  genericName: 'Losartan Potassium',
  concentration: '50mg',
  price: 51,
  matchKeywords: [
    'arb', 'losartan', 'amosar', 'gout', 'uric acid',
    'اموسار', 'لوزارتان', 'نقرس', 'يوريك اسيد', 'ضغط'
  ],
  usage: 'لوزارتان صافي؛ الخيار المفضل لمرضى الضغط المصابين بالنقرس لأنه يساعد في إخراج حمض اليوريك.',
  timing: 'مرة يومياً – مزمن',
  category: Category.HEART_FAILURE,
  form: 'Film-coated Tablet',

  minAgeMonths: 12, // Losartan floor
  maxAgeMonths: 1200,
  minWeight: 20,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 192) { // Adults/Adolescents
       return '١ قرص ٥٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    } else {
       return 'للأطفال (٦-١٦ سنة): تحسب الجرعة بـ ٠.٧ مجم/كجم مرة واحدة يومياً (بجرعة محددة حسب الوزن).';
    }
  },

  warnings: [
    'ممنوع للحوامل.',
    'يعتبر الأقل تأثيراً في خفض الضغط مقارنة بالكانديسارتان والفالسارتان، لذا قد نحتاج لجرعات أعلى.'
  ]
},

// 18. Atacand plus 32/25 mg 14 tab
{
  id: 'atacand-plus-32-25-tabs',
  name: 'Atacand plus 32/25 mg 14 tab',
  genericName: 'Candesartan + Hydrochlorothiazide',
  concentration: '32mg/25mg',
  price: 179,
  matchKeywords: [
    'arb', 'diuretic', 'max dose', 'atacand', 'plus', 'very strong',
    'اتاكاند بلس ٣٢/٢٥', 'اتاكاند قوي', 'اقصى جرعة', 'ضغط مستعصي'
  ],
  usage: 'أقوى تركيز متاح في عائلة الأتاكاند (Max/Max)؛ يستخدم فقط لحالات الضغط الشديدة والمستعصية.',
  timing: 'مرة يومياً – مزمن',
  category: Category.HEART_FAILURE,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 60,
  maxWeight: 300,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٣٢/٢٥ مجم مرة يومياً صباحاً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'ممنوع للحوامل.',
    'خطر حدوث خلل في أملاح الدم (نقص صوديوم/بوتاسيوم) مرتفع.',
    'يجب عمل تحاليل وظائف كلى دورية.'
  ]
},

// 19. Globacand 16mg 28 f.c. tab.
{
  id: 'globacand-16-tabs',
  name: 'Globacand 16mg 28 f.c. tab.',
  genericName: 'Candesartan Cilexetil',
  concentration: '16mg',
  price: 40,
  matchKeywords: [
    'arb', 'candesartan', 'globacand', 'cheap', 'generic',
    'جلوباكان', 'جلوباكاند', 'كانديسارتان', 'رخيص', 'بديل اتاكاند'
  ],
  usage: 'بديل اقتصادي جداً للأتاكاند (بنفس التركيز ١٦ مجم)؛ سعر ممتاز وفعالية جيدة.',
  timing: 'مرة يومياً – مزمن',
  category: Category.HEART_FAILURE,
  form: 'Film-coated Tablet',

  minAgeMonths: 12, // Candesartan floor
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ١٦ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'ممنوع للحوامل (Category D).',
    'يجب متابعة وظائف الكلى والبوتاسيوم.',
    'قد يسبب دواراً عند الوقوف المفاجئ.'
  ]
},
// 20. Albustix 4mg 30 tab.
{
  id: 'albustix-4-30tabs',
  name: 'Albustix 4mg 30 tab.',
  genericName: 'Candesartan Cilexetil',
  concentration: '4mg',
  price: 51,
  matchKeywords: [
    'arb', 'candesartan', 'albustix', 'low dose',
    'البوستيكس ٤', 'كانديسارتان', 'جرعة صغيرة', 'ضغط'
  ],
  usage: 'جرعة صغيرة من الكانديسارتان؛ تستخدم كبداية علاج لكبار السن جداً أو لمرضى قصور القلب (Heart Failure) لرفع الجرعة تدريجياً.',
  timing: 'مرة يومياً – مزمن',
  category: Category.HEART_FAILURE,
  form: 'Tablet',

  minAgeMonths: 12, // Candesartan floor
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٤ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: ['ممنوع للحوامل.']
},

// 21. Amosar Forte 100/25 mg 30 f.c.tab.
{
  id: 'amosar-forte-100-25',
  name: 'Amosar forte 100/25 mg 30 f.c.tab.',
  genericName: 'Losartan + Hydrochlorothiazide',
  concentration: '100mg/25mg',
  price: 117,
  matchKeywords: [
    'arb', 'diuretic', 'strong', 'amosar', 'forte', 'gout',
    'اموسار فورت', 'لوزارتان', 'مدر قوي', 'ضغط عالي', 'نقرس'
  ],
  usage: 'أقوى تركيز في عائلة الأموسار؛ يستخدم لمرضى الضغط المرتفع جداً (خاصة مرضى النقرس والسكر).',
  timing: 'مرة يومياً – مزمن',
  category: Category.HEART_FAILURE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 70,
  maxWeight: 300,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ١٠٠/٢٥ مجم مرة يومياً صباحاً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },
  warnings: [
    'ممنوع للحوامل.',
    'مدر البول في هذا التركيز قد يقلل من فائدة اللوزارتان لمرضى النقرس قليلاً، لذا تجب المتابعة.'
  ]
},

// 22. Entresto 200 mg (Repeated Entry)
{
  id: 'entresto-200-tabs-batch2', // Unique ID for this entry
  name: 'Entresto 200 mg (97/103 mg) 56 f.c. tabs.',
  genericName: 'Sacubitril + Valsartan',
  concentration: '97mg/103mg',
  price: 3559,
  matchKeywords: [
    'arni', 'entresto', 'pack', 'maintenance',
    'انتريستو ٢٠٠', 'عبوة كبيرة', 'شهرين'
  ],
  usage: 'عبوة كبيرة (٥٦ قرص تكفي شهر تقريباً) من الجرعة المستهدفة لعلاج فشل عضلة القلب.',
  timing: 'مرتين يومياً – مزمن',
  category: Category.HEART_FAILURE,
  form: 'Film-coated Tablet',

  minAgeMonths: 12, // Sacubitril-valsartan floor
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٩٧/١٠٣ مجم مرتين يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: ['ممنوع للحوامل.', 'افصل ٣٦ ساعة عن أي دواء ACEI.']
},

// 23. Loraz Forte 100/25mg 28 tab.
{
  id: 'albustix-16-30tabs',
  name: 'Albustix 16 mg 30 tabs.',
  genericName: 'Candesartan Cilexetil',
  concentration: '16mg',
  price: 84,
  matchKeywords: [
    'arb', 'candesartan', 'albustix', 'standard',
    'البوستيكس ١٦', 'كانديسارتان', 'ضغط', 'بدون مدر'
  ],
  usage: 'الجرعة القياسية القوية من الكانديسارتان (بدون مدر بول).',
  timing: 'مرة يومياً – مزمن',
  category: Category.HEART_FAILURE,
  form: 'Tablet',

  minAgeMonths: 12, // Candesartan floor
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ١٦ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: ['ممنوع للحوامل.']
},

// 25. Amosar 100mg 30 f.c. tabs.
{
  id: 'amosar-100-tabs',
  name: 'Amosar 100mg 30 f.c. tabs.',
  genericName: 'Losartan Potassium',
  concentration: '100mg',
  price: 75,
  matchKeywords: [
    'arb', 'losartan', 'amosar', 'high dose',
    'اموسار ١٠٠', 'لوزارتان', 'جرعة عالية', 'نقرس'
  ],
  usage: 'لوزارتان بجرعة عالية (١٠٠ مجم)؛ ممتاز لمرضى الضغط المصابين بالنقرس.',
  timing: 'مرة يومياً – مزمن',
  category: Category.HEART_FAILURE,
  form: 'Film-coated Tablet',

  minAgeMonths: 12, // Losartan floor
  maxAgeMonths: 1200,
  minWeight: 60,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ١٠٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: ['ممنوع للحوامل.']
},

// 26. Diovan 80mg 28 cap (Repeated Entry)
{
  id: 'diovan-80-caps-refill',
  name: 'Diovan 80mg 28 cap',
  genericName: 'Valsartan',
  concentration: '80mg',
  price: 86,
  matchKeywords: [
    'arb', 'valsartan', 'diovan', 'brand',
    'ديوفان', 'فالسارتان', 'الاصلي'
  ],
  usage: 'الدواء الأصلي للفالسارتان. يستخدم للضغط وقصور القلب.',
  timing: 'مرة يومياً – مزمن',
  category: Category.HEART_FAILURE,
  form: 'Capsule',
  minAgeMonths: 12, maxAgeMonths: 1200, minWeight: 30, maxWeight: 250,
  calculationRule: (w, a) => '١ كبسولة ٨٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)',
  warnings: ['ممنوع للحوامل.']
},

// 27. Globacand 8 mg 28 f.c. tab.
{
  id: 'globacand-8-tabs',
  name: 'Globacand 8 mg 28 f.c. tab.',
  genericName: 'Candesartan Cilexetil',
  concentration: '8mg',
  price: 24,
  matchKeywords: [
    'arb', 'candesartan', 'globacand', 'very cheap', 'budget',
    'جلوباكان', 'جلوباكاند ٨', 'رخيص جدا', 'اقتصادي'
  ],
  usage: 'أرخص بديل للكانديسارتان في القائمة؛ خيار ممتاز للمرضى ذوي الدخل المحدود.',
  timing: 'مرة يومياً – مزمن',
  category: Category.HEART_FAILURE,
  form: 'Film-coated Tablet',

  minAgeMonths: 12, // Candesartan floor
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٨ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: ['ممنوع للحوامل.']
},

// 28. Hyzaar 50/12.5mg 14 f.c. tab.
{
  id: 'losartan-50-14tabs',
  name: 'Losartan 50mg 14 tab.',
  genericName: 'Losartan Potassium',
  concentration: '50mg',
  price: 18,
  matchKeywords: [
    'arb', 'losartan', 'generic', 'cheapest',
    'لوزارتان', 'رخيص', 'بديل اموسار', 'ضغط'
  ],
  usage: 'بديل اقتصادي جداً (سعر الشريط رخيص للغاية)؛ مناسب للجمعيات الخيرية والمستوصفات.',
  timing: 'مرة يومياً – مزمن',
  category: Category.HEART_FAILURE,
  form: 'Tablet',

  minAgeMonths: 12, // Losartan floor
  maxAgeMonths: 1200,
  minWeight: 20,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٥٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: ['ممنوع للحوامل.']
},

// 30. Blopress 16mg 28 tab.
{
  id: 'blopress-16-tabs',
  name: 'Blopress 16mg 28 tab.',
  genericName: 'Candesartan Cilexetil',
  concentration: '16mg',
  price: 230,
  matchKeywords: [
    'arb', 'candesartan', 'blopress', 'brand', 'originator', 'expensive',
    'بلوبرس', 'الاصلي', 'كانديسارتان', 'تاكيدا', 'ضغط'
  ],
  usage: 'الدواء الأصلي (Brand) للكانديسارتان؛ يعتبر "المرجع" في الجودة والفعالية، لكن سعره مرتفع.',
  timing: 'مرة يومياً – مزمن',
  category: Category.HEART_FAILURE,
  form: 'Tablet',

  minAgeMonths: 12, // Candesartan floor
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ١٦ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: ['ممنوع للحوامل.']
},

// 31. Losar 50mg 28 f.c. tab.
{
  id: 'losar-50-28tabs',
  name: 'Losar 50mg 28 f.c. tab.',
  genericName: 'Losartan Potassium',
  concentration: '50mg',
  price: 82,
  matchKeywords: [
    'arb', 'losartan', 'losar', 'generic',
    'لوسار', 'لوزار', 'لوزارتان', 'ضغط'
  ],
  usage: 'منتج محلي عالي الجودة لعلاج الضغط.',
  timing: 'مرة يومياً – مزمن',
  category: Category.HEART_FAILURE,
  form: 'Film-coated Tablet',

  minAgeMonths: 12, // Losartan floor
  maxAgeMonths: 1200,
  minWeight: 20,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٥٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: ['ممنوع للحوامل.']
},

// 32. Losar plus 8 f.c. tab
{
  id: 'losartan-100-14tabs',
  name: 'Losartan 100mg 14 scored f.c.tab.',
  genericName: 'Losartan Potassium',
  concentration: '100mg',
  price: 36,
  matchKeywords: [
    'arb', 'losartan', 'generic', 'high dose', 'cheap',
    'لوزارتان ١٠٠', 'رخيص', 'جرعة عالية'
  ],
  usage: 'جرعة عالية من اللوزارتان بسعر اقتصادي جداً (قرص يمكن قسمه).',
  timing: 'مرة يومياً – مزمن',
  category: Category.HEART_FAILURE,
  form: 'Scored Tablet',

  minAgeMonths: 12, // Losartan floor
  maxAgeMonths: 1200,
  minWeight: 60,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ١٠٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: ['ممنوع للحوامل.']
},

];

