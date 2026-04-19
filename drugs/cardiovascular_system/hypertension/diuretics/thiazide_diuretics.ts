
import { Medication, Category } from '../../../../types';

export const THIAZIDE_DIURETICS_MEDS: Medication[] = [
  // 1. Candalkan Plus 32/12.5mg 14 f.c. tab.
{
  id: 'candalkan-plus-32-12-5',
  name: 'Candalkan Plus 32/12.5mg 14 f.c. tab.',
  genericName: 'Candesartan + Hydrochlorothiazide',
  concentration: '32mg / 12.5mg',
  price: 102,
  matchKeywords: [
    'hypertension', 'candalkan', 'candesartan', 'arb', 'diuretic',
    'كاندالكان بلس', 'كانديسارتان', 'ضغط عالي', 'مدر للبول'
  ],
  usage: 'علاج ارتفاع ضغط الدم بتركيز قوي من الكانديسارتان (٣٢ مجم) مع مدر للبول. يوفر حماية فائقة لعضلة القلب.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٣٢ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال أقل من ١٨ عاماً.';
    }
  },

  warnings: [
    'يمنع استخدامه أثناء الحمل (فئة D).',
    'يستخدم بحذر مع مرضى النقرس لأن الثيازيد قد يرفع مستوى حمض اليوريك.',
    'يجب متابعة وظائف الكلى والبوتاسيوم بانتظام.'
  ]
},

// 2. Concor Plus 5/12.5mg 30 f.c. tabs.
{
  id: 'concor-plus-5-12-5',
  name: 'Concor Plus 5/12.5mg 30 f.c. tabs.',
  genericName: 'Bisoprolol + Hydrochlorothiazide',
  concentration: '5mg / 12.5mg',
  price: 72,
  matchKeywords: [
    'hypertension', 'tachycardia', 'concor plus', 'beta blocker',
    'كونكور بلس', 'بيزوبرولول', 'سرعة ضربات القلب', 'ضغط'
  ],
  usage: 'تركيبة تجمع بين تنظيم ضربات القلب (بيتا بلوكر) وخفض الضغط (مدر للبول). مثالي لمرضى الضغط المصابين بالتوتر أو تسارع النبض.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ٥ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    return 'غير مخصص للأطفال.';
  },

  warnings: [
    'التوقف المفاجئ قد يسبب ارتداداً خطيراً في ضغط الدم وتسارعاً في القلب.',
    'يمنع استخدامه لمرضى الربو الشعبي (Asthma).',
    'قد يرفع مستوى السكر في الدم قليلاً، لذا ينصح بمتابعته لمرضى السكري.'
  ]
},

// 3. Erastapex Plus 20mg/12.5mg 30 tab
{
  id: 'erastapex-plus-20-12-5',
  name: 'Erastapex Plus 20mg/12.5mg 30 tab',
  genericName: 'Olmesartan + Hydrochlorothiazide',
  concentration: '20mg / 12.5mg',
  price: 78,
  matchKeywords: [
    'hypertension', 'erastapex plus', 'olmesartan',
    'اراستابكس بلس', 'اولميسارتان', 'ضغط', 'مدر'
  ],
  usage: 'علاج ثنائي للضغط المتوسط؛ يجمع بين كفاءة الأولميسارتان والمدر للبول.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'قد يسبب الدوار عند الوقوف المفاجئ (Orthostatic hypotension).',
    'تأكد من شرب كميات كافية من الماء لتجنب الجفاف.'
  ]
},

// 4. Erastapex Trio 5/20/12.5mg 30 f.c. tab
{
  id: 'erastapex-trio-5-20-12-5-thz',
  name: 'Erastapex Trio 5/20/12.5mg 30 f.c. tab',
  genericName: 'Amlodipine + Olmesartan + Hydrochlorothiazide',
  concentration: '5mg / 20mg / 12.5mg',
  price: 114,
  matchKeywords: [
    'hypertension', 'erastapex trio', 'triple therapy',
    'اراستابكس تريو', 'ثلاثي', 'ضغط عالي'
  ],
  usage: 'علاج ثلاثي المفعول (موسع شرايين + مانع انقباض + مدر للبول). يستخدم للحالات التي لا تستجيب للعلاج الثنائي.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم / ٢٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يجب متابعة وظائف الكلى والشوارد بانتظام.',
    'هذا الدواء قوي المفعول، يجب مراقبة الضغط بدقة في بداية العلاج.'
  ]
},

// 5. Erastapex Plus 40mg/12.5mg 30 tab
{
  id: 'erastapex-plus-40-12-5',
  name: 'Erastapex Plus 40mg/12.5mg 30 tab',
  genericName: 'Olmesartan + Hydrochlorothiazide',
  concentration: '40mg / 12.5mg',
  price: 96,
  matchKeywords: [
    'hypertension', 'erastapex plus', 'high olmesartan',
    'اراستابكس بلس', 'اولميسارتان ٤٠', 'ضغط عالي'
  ],
  usage: 'يحتوي على ضعف جرعة الأولميسارتان (٤٠ مجم) لسيطرة أقوى على الضغط المرتفع.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٤٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'خطر حدوث هبوط في الضغط أعلى مع هذا التركيز، خاصة لدى كبار السن.'
  ]
},

// 6. Ezapril-Co 20/12.5mg 30 tabs.
{
  id: 'ezapril-co-20-12-5',
  name: 'Ezapril-Co 20/12.5mg 30 tabs.',
  genericName: 'Enalapril + Hydrochlorothiazide',
  concentration: '20mg / 12.5mg',
  price: 72,
  matchKeywords: [
    'hypertension', 'ezapril co', 'ace inhibitor', 'cough',
    'ايزابريل كو', 'انالابريل', 'ضغط', 'كحة ناشفة'
  ],
  usage: 'علاج ثنائي تقليدي وفعال، يجمع بين مثبطات الإنزيم المحول (ACE Inhibitor) ومدر للبول.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'قد يسبب سعالاً جافاً (كحة ناشفة) مستمرة. في هذه الحالة يجب إعادة التقييم لتغيير الدواء.',
    'يمنع استخدامه للحوامل.',
    'احتمالية حدوث تحسس وتورم في الوجه (Angioedema) واردة نادرة.'
  ]
},

// 7. Candalkan Plus 16/12.5mg 14 f.c.tab.
{
  id: 'candalkan-plus-16-12-5',
  name: 'Candalkan Plus 16/12.5mg 14 f.c.tab.',
  genericName: 'Candesartan + Hydrochlorothiazide',
  concentration: '16mg / 12.5mg',
  price: 74,
  matchKeywords: [
    'hypertension', 'candalkan', 'start dose',
    'كاندالكان بلس', 'بداية العلاج', 'ضغط'
  ],
  usage: 'جرعة البداية المثالية للعلاج الثنائي بالكانديسارتان. مناسب لضبط الضغط المتوسط.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٦ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يجب مراقبة وظائف الكلى.'
  ]
},

// 8. Erastapex Trio 5/40/12.5mg 30 f.c. tabs
{
  id: 'erastapex-trio-5-40-12-5-thz',
  name: 'Erastapex Trio 5/40/12.5mg 30 f.c. tabs',
  genericName: 'Amlodipine + Olmesartan + Hydrochlorothiazide',
  concentration: '5mg / 40mg / 12.5mg',
  price: 144,
  matchKeywords: [
    'hypertension', 'erastapex trio', 'strong',
    'اراستابكس تريو', 'ثلاثي قوي', 'ضغط'
  ],
  usage: 'تركيبة ثلاثية معززة بجرعة أولميسارتان عالية (٤٠ مجم) لمرضى الضغط الذين يحتاجون سيطرة أكبر.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم / ٤٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'خطر الهبوط المفاجئ وارد، لذا يرجى الحذر عند القيام من وضع الجلوس.'
  ]
},

// 9. Nevilob Plus 5/12.5 mg 20 tab
{
  id: 'nevilob-plus-5-12-5',
  name: 'Nevilob Plus 5/12.5 mg 20 tab',
  genericName: 'Nebivolol + Hydrochlorothiazide',
  concentration: '5mg / 12.5mg',
  price: 86,
  matchKeywords: [
    'hypertension', 'nevilob plus', 'nebivolol', 'beta blocker',
    'نيفيلوب بلس', 'نيبفولول', 'بيتا بلوكر', 'ضغط'
  ],
  usage: 'الجيل الثالث من البيتا بلوكرز (Nebivolol) مع مدر للبول. يتميز بتوسيع الأوعية الدموية وقلة التأثير السلبي على القدرة الجنسية مقارنة بالأنواع القديمة.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع التوقف المفاجئ عن الدواء.',
    'يجب مراقبة معدل ضربات القلب.',
    'أكثر أماناً لمرضى السكر والدهون من الكونكور والأنواع القديمة.'
  ]
},

// 10. Nevilob Plus 5/25 mg 20 tab
{
  id: 'nevilob-plus-5-25',
  name: 'Nevilob Plus 5/25 mg 20 tab',
  genericName: 'Nebivolol + Hydrochlorothiazide',
  concentration: '5mg / 25mg',
  price: 92,
  matchKeywords: [
    'hypertension', 'nevilob plus', 'high diuretic',
    'نيفيلوب بلس', 'مدر عالي', 'نيبفولول'
  ],
  usage: 'يحتوي على جرعة مضاعفة من مدر البول (٢٥ مجم) لمرضى الضغط الذين يعانون من احتباس سوائل أكثر.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'قد يرفع مستوى السكر وحمض اليوريك بسبب زيادة جرعة الثيازيد.',
    'يمنع التوقف المفاجئ.',
    'يجب متابعة وظائف الكلى.'
  ]
},
// 11. X-tension Plus 150/12.5mg 28 scored tab.
{
  id: 'x-tension-plus-150-12-5',
  name: 'X-tension Plus 150/12.5mg 28 scored tab.',
  genericName: 'Irbesartan + Hydrochlorothiazide',
  concentration: '150mg / 12.5mg',
  price: 108,
  matchKeywords: [
    'hypertension', 'x-tension', 'irbesartan', 'arb', 'kidney protection',
    'اكس تنشن بلس', 'اربيسارتان', 'ضغط', 'حماية الكلى'
  ],
  usage: 'علاج ارتفاع ضغط الدم بتركيبة ثنائية (إربيسارتان + مدر للبول). يتميز الإربيسارتان بفاعليته في حماية الكلى لدى مرضى السكري.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Scored Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٥٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال أقل من ١٨ عاماً.';
    }
  },

  warnings: [
    'يمنع استخدامه أثناء الحمل (فئة D).',
    'يجب التأكد من عدم وجود جفاف قبل البدء بالعلاج.',
    'يراعى متابعة وظائف الكلى والبوتاسيوم بشكل دوري.'
  ]
},

// 12. X-tension Plus 300/12.5mg 28 scored tab.
{
  id: 'x-tension-plus-300-12-5',
  name: 'X-tension Plus 300/12.5mg 28 scored tab.',
  genericName: 'Irbesartan + Hydrochlorothiazide',
  concentration: '300mg / 12.5mg',
  price: 148,
  matchKeywords: [
    'hypertension', 'x-tension', 'irbesartan 300', 'high dose',
    'اكس تنشن بلس', 'اربيسارتان ٣٠٠', 'جرعة عالية'
  ],
  usage: 'يحتوي على الجرعة القصوى من الإربيسارتان (٣٠٠ مجم) لضبط ضغط الدم المرتفع الذي لم يستجب لتركيز ١٥٠ مجم.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Scored Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٣٠٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'قد يسبب انخفاضاً ملحوظاً في ضغط الدم عند بداية الاستخدام، لذا ينصح بالحذر عند الوقوف.',
    'يجب مراقبة مستويات البوتاسيوم ووظائف الكلى.'
  ]
},

// 13. Atacand Plus 16/12.5 mg 14 tabs.
{
  id: 'atacand-plus-16-12-5',
  name: 'Atacand Plus 16/12.5 mg 14 tabs.',
  genericName: 'Candesartan Cilexetil + Hydrochlorothiazide',
  concentration: '16mg / 12.5mg',
  price: 116,
  matchKeywords: [
    'hypertension', 'atacand', 'astrazeneca', 'original', 'candesartan',
    'اتاكاند بلس', 'استرازينيكا', 'كانديسارتان', 'الاصلي', 'ضغط'
  ],
  usage: 'المستحضر الأصلي (Brand) لمادة الكانديسارتان مع مدر للبول. يعتبر من أكفأ أدوية الضغط وأقلها آثاراً جانبية.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٦ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يجب الحذر عند استخدامه لمرضى القصور الكلوي الشديد.'
  ]
},

// 14. Capozide 50/25mg 30 tab.
{
  id: 'capozide-50-25',
  name: 'Capozide 50/25mg 30 tab.',
  genericName: 'Captopril + Hydrochlorothiazide',
  concentration: '50mg / 25mg',
  price: 93,
  matchKeywords: [
    'hypertension', 'capozide', 'captopril', 'ace inhibitor', 'old school',
    'كابوزايد', 'كابتوبريل', 'ضغط', 'كلاسيك'
  ],
  usage: 'تركيبة كلاسيكية قوية تحتوي على الكابتوبريل (ACE inhibitor) وجرعة عالية من مدر البول (٢٥ مجم).',
  timing: 'مرتين يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥٠ مجم / ٢٥ مجم مرتين يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'قد يسبب سعالاً جافاً (كحة ناشفة).',
    'يمنع استخدامه للحوامل.',
    'قد يسبب تغيراً في حاسة التذوق بشكل مؤقت.',
    'يحتوي على ٢٥ مجم هيدروكلوروثيازيد، مما قد يرفع حمض اليوريك والسكر.'
  ]
},

// 15. Concor Plus 10/25mg 30 f.c. tablets
{
  id: 'concor-plus-10-25',
  name: 'Concor Plus 10/25mg 30 f.c. tablets',
  genericName: 'Bisoprolol + Hydrochlorothiazide',
  concentration: '10mg / 25mg',
  price: 108,
  matchKeywords: [
    'hypertension', 'concor plus', 'high dose', 'beta blocker',
    'كونكور بلس', 'بيزوبرولول ١٠', 'مدر ٢٥', 'ضغط عالي', 'ضربات قلب'
  ],
  usage: 'أقصى تركيز من الكونكور بلس (بيزوبرولول ١٠ مجم + هيدروكلوروثيازيد ٢٥ مجم). يستخدم للحالات التي تحتاج لسيطرة قوية على الضغط ومعدل ضربات القلب.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'تحذير هام: التوقف المفاجئ قد يسبب أزمة قلبية أو ارتفاعاً خطيراً في الضغط.',
    'يمنع لمرضى الربو الشعبي وبطء القلب الشديد (Bradycardia).',
    'الجرعة العالية من المدر (٢٥ مجم) قد تؤثر على سكر الدم ودهنيات الدم، لذا يرجى المتابعة.'
  ]
},

// 16. Ezapril-Co 20/12.5mg 20 tabs.
{
  id: 'ezapril-co-20-12-5-20tabs',
  name: 'Ezapril-Co 20/12.5mg 20 tabs.',
  genericName: 'Enalapril + Hydrochlorothiazide',
  concentration: '20mg / 12.5mg',
  price: 48,
  matchKeywords: [
    'hypertension', 'ezapril co', 'small pack', 'ace inhibitor',
    'ايزابريل كو', 'عبوة ٢٠', 'انالابريل', 'ضغط'
  ],
  usage: 'علاج ثنائي للضغط (إينالابريل + مدر للبول). (عبوة اقتصادية ٢٠ قرص).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'قد يسبب السعال الجاف.',
    'يمنع استخدامه للحوامل.',
    'راقب ضغط الدم بانتظام.'
  ]
},

// 17. Kansartan Plus 150/12.5mg 30 f.c. tabs.
{
  id: 'kansartan-plus-150-12-5',
  name: 'Kansartan Plus 150/12.5mg 30 f.c. tabs.',
  genericName: 'Irbesartan + Hydrochlorothiazide',
  concentration: '150mg / 12.5mg',
  price: 111,
  matchKeywords: [
    'hypertension', 'kansartan', 'irbesartan', 'generic aprovel',
    'كانسارتان بلس', 'اربيسارتان', 'بديل ابروفيل', 'ضغط'
  ],
  usage: 'بديل ممتاز لـ (Aprovel Plus/X-tension Plus) يحتوي على إربيسارتان ومدر للبول.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٥٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'مناسب لمرضى السكري لحماية الكلى.',
    'تأكد من شرب السوائل لتجنب الجفاف.'
  ]
},
// 18. Mavilor Plus 5/25 mg 30 tabs.
{
  id: 'mavilor-plus-5-25',
  name: 'Mavilor Plus 5/25 mg 30 tabs.',
  genericName: 'Nebivolol + Hydrochlorothiazide',
  concentration: '5mg / 25mg',
  price: 108,
  matchKeywords: [
    'hypertension', 'mavilor plus', 'nebivolol', 'high diuretic',
    'مافيلور بلس', 'نيبفولول', 'مدر للبول عالي', 'ضغط'
  ],
  usage: 'علاج لارتفاع ضغط الدم يجمع بين النيبفولول (الجيل الثالث من حاصرات بيتا الموسعة للأوعية) وجرعة عالية من مدر البول (٢٥ مجم) للسيطرة على الضغط واحتباس السوائل.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع التوقف المفاجئ عن تناول الدواء لتجنب حدوث تسارع في ضربات القلب أو ارتفاع مفاجئ في الضغط.',
    'بسبب احتوايه على ٢٥ مجم هيدروكلوروثيازيد، قد يرفع مستوى السكر وحمض اليوريك، لذا يرجى المتابعة.',
    'يمنع استخدامه لمرضى الربو الشعبي وبطء ضربات القلب الشديد.'
  ]
},

// 19. Sarcozide 16/12.5mg 20 tabs.
{
  id: 'sarcozide-16-12-5',
  name: 'Sarcozide 16/12.5mg 20 tabs.',
  genericName: 'Candesartan + Hydrochlorothiazide',
  concentration: '16mg / 12.5mg',
  price: 82,
  matchKeywords: [
    'hypertension', 'sarcozide', 'candesartan', 'heart failure',
    'ساركوزايد', 'كانديسارتان', 'بديل اتاكاند', 'ضغط'
  ],
  usage: 'علاج ثنائي لضغط الدم (كانديسارتان + مدر للبول). يتميز بفاعليته العالية في خفض الضغط وحماية عضلة القلب (خاصة لمرضى ضعف عضلة القلب).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٦ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه أثناء الحمل (فئة D).',
    'يجب التأكد من وظائف الكلى ومستوى البوتاسيوم قبل البدء بالعلاج.',
    'قد يسبب الدوار في بداية الاستخدام.'
  ]
},

// 20. Alkapress trio 5/160/25mg 14 f.c. tabs.
{
  id: 'alkapress-trio-5-160-25-thz',
  name: 'Alkapress trio 5/160/25mg 14 f.c. tabs.',
  genericName: 'Amlodipine + Valsartan + Hydrochlorothiazide',
  concentration: '5mg / 160mg / 25mg',
  price: 110,
  matchKeywords: [
    'hypertension', 'alkapress trio', 'high diuretic', 'triple therapy',
    'الكابرس تريو', 'ثلاثي', 'مدر للبول عالي', 'ضغط مقاوم'
  ],
  usage: 'علاج ثلاثي المفعول يحتوي على جرعة عالية من مدر البول (٢٥ مجم) للسيطرة على حالات الضغط المقاومة التي يصاحبها احتباس سوائل.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم / ١٦٠ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'خطر حدوث الجفاف واضطراب الشوارد (نقص البوتاسيوم والصوديوم) مرتفع مع جرعة ٢٥ مجم مدر للبول.',
    'يجب الحذر عند الوقوف المفاجئ لتجنب الدوخة.'
  ]
},

// 21. Vecovartec Plus 40/12.5mg 28 f.c. tab.
{
  id: 'vecovartec-plus-40-12-5',
  name: 'Vecovartec Plus 40/12.5mg 28 f.c. tab.',
  genericName: 'Olmesartan + Hydrochlorothiazide',
  concentration: '40mg / 12.5mg',
  price: 76,
  matchKeywords: [
    'hypertension', 'vecovartec', 'olmesartan 40', 'strong',
    'فيكوفارتك بلس', 'اولميسارتان ٤٠', 'ضغط عالي', 'رخيص'
  ],
  usage: 'بديل اقتصادي وفعال يحتوي على جرعة عالية من الأولميسارتان (٤٠ مجم) مع مدر للبول لضبط الضغط المرتفع.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٤٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'قد يسبب أعراضاً معوية (إسهال) في حالات نادرة مرتبطة بمادة الأولميسارتان.',
    'يجب مراقبة وظائف الكلى.'
  ]
},

// 22. Alkapress trio 5/160/12.5mg 14 f.c. tabs.
{
  id: 'alkapress-trio-5-160-12-5-thz',
  name: 'Alkapress trio 5/160/12.5mg 14 f.c. tabs.',
  genericName: 'Amlodipine + Valsartan + Hydrochlorothiazide',
  concentration: '5mg / 160mg / 12.5mg',
  price: 97,
  matchKeywords: [
    'hypertension', 'alkapress trio', 'medium dose',
    'الكابرس تريو', 'ثلاثي', 'جرعة متوسطة'
  ],
  usage: 'علاج ثلاثي بجرعة مدر للبول قياسية (١٢.٥ مجم). خيار متوازن للضغط المرتفع.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم / ١٦٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'آمن نسبياً مقارنة بالتركيزات الأعلى، ولكن المتابعة الدورية مطلوبة.'
  ]
},

// 23. Bisocard Plus 5/12.5mg 30 f.c.tab
{
  id: 'bisocard-plus-5-12-5',
  name: 'Bisocard Plus 5/12.5mg 30 f.c.tab',
  genericName: 'Bisoprolol + Hydrochlorothiazide',
  concentration: '5mg / 12.5mg',
  price: 63,
  matchKeywords: [
    'hypertension', 'bisocard', 'concor generic', 'beta blocker',
    'بيزوكارد بلس', 'بديل كونكور', 'بيتا بلوكر', 'ضغط'
  ],
  usage: 'بديل اقتصادي ممتاز للـ (Concor Plus). يستخدم لعلاج الضغط المرتفع المصحوب بزيادة في ضربات القلب.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع التوقف المفاجئ تجنباً لحدوث انتكاسة في حالة القلب.',
    'يمنع لمرضى حساسية الصدر (الربو).',
    'قد يسبب برودة في الأطراف.'
  ]
},

// 24. Vecovartec Plus 20/12.5mg 21 f.c.tabs.
{
  id: 'vecovartec-plus-20-12-5',
  name: 'Vecovartec Plus 20/12.5mg 21 f.c.tabs.',
  genericName: 'Olmesartan + Hydrochlorothiazide',
  concentration: '20mg / 12.5mg',
  price: 30,
  matchKeywords: [
    'hypertension', 'vecovartec', 'start dose', 'very cheap',
    'فيكوفارتك بلس', 'سعر اقتصادي جدا', 'بداية العلاج', 'ضغط'
  ],
  usage: 'بداية العلاج بجرعة أولميسارتان متوسطة (٢٠ مجم) مع مدر للبول. يعتبر من أرخص أدوية الضغط الفعالة في السوق.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يجب التأكد من توفر العبوة التالية قبل انتهاء الشريط لضمان استمرارية العلاج.'
  ]
},
// 25. Kansartan Plus 300/12.5mg 30 f.c. tabs.
{
  id: 'kansartan-plus-300-12-5',
  name: 'Kansartan Plus 300/12.5mg 30 f.c. tabs.',
  genericName: 'Irbesartan + Hydrochlorothiazide',
  concentration: '300mg / 12.5mg',
  price: 156,
  matchKeywords: [
    'hypertension', 'kansartan', 'irbesartan 300', 'high dose',
    'كانسارتان بلس', 'اربيسارتان ٣٠٠', 'جرعة عالية', 'ضغط'
  ],
  usage: 'يحتوي على الجرعة القصوى من الإربيسارتان (٣٠٠ مجم) مع مدر للبول. فعال جداً لمرضى الضغط المرتفع خاصة المصابين بالسكري لحماية الكلى.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٣٠٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل (فئة D).',
    'يجب الحذر عند الانتقال من وضع الجلوس إلى الوقوف لتجنب الدوار.',
    'ينصح بمتابعة وظائف الكلى والبوتاسيوم.'
  ]
},

// 26. Lezberg Plus 20/12.5mg 30 f.c.tab
{
  id: 'lezberg-plus-20-12-5',
  name: 'Lezberg Plus 20/12.5mg 30 f.c.tab',
  genericName: 'Olmesartan + Hydrochlorothiazide',
  concentration: '20mg / 12.5mg',
  price: 99,
  matchKeywords: [
    'hypertension', 'lezberg plus', 'start dose',
    'ليزبرج بلس', 'اولميسارتان', 'بداية العلاج', 'ضغط'
  ],
  usage: 'علاج ثنائي لضغط الدم بجرعة أولميسارتان متوسطة. (بديل اقتصادي لمجموعة Sevikar/Erastapex Plus).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يجب التأكد من عدم وجود حساسية لمركبات السلفا (بسبب الثيازيد).'
  ]
},

// 27. Lezberg Plus 40/12.5mg 30 f.c.tab
{
  id: 'lezberg-plus-40-12-5',
  name: 'Lezberg Plus 40/12.5mg 30 f.c.tab',
  genericName: 'Olmesartan + Hydrochlorothiazide',
  concentration: '40mg / 12.5mg',
  price: 117,
  matchKeywords: [
    'hypertension', 'lezberg plus', 'olmesartan 40',
    'ليزبرج بلس', 'اولميسارتان ٤٠', 'ضغط عالي'
  ],
  usage: 'يحتوي على جرعة عالية من الأولميسارتان (٤٠ مجم) لضبط الضغط المرتفع.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٤٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'قد يسبب انخفاضاً ملحوظاً في الضغط لكبار السن.'
  ]
},

// 28. Lezberg Plus 40/25mg 30 f.c.tab
{
  id: 'lezberg-plus-40-25',
  name: 'Lezberg Plus 40/25mg 30 f.c.tab',
  genericName: 'Olmesartan + Hydrochlorothiazide',
  concentration: '40mg / 25mg',
  price: 117,
  matchKeywords: [
    'hypertension', 'lezberg plus', 'high diuretic', 'max dose',
    'ليزبرج بلس', 'مدر للبول عالي', 'أقصى جرعة', 'ضغط'
  ],
  usage: 'الجرعة القصوى من المكونين (أولميسارتان ٤٠ + هيدروكلوروثيازيد ٢٥). مخصص للحالات التي تعاني من احتباس سوائل شديد وضغط مرتفع.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٤٠ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'قد يؤدي إلى ارتفاع في سكر الدم وحمض اليوريك، لذا يجب المتابعة الدورية.',
    'خطر حدوث اضطراب في شوارد الدم (Electrolytes) وارد.'
  ]
},

// 29. Marvitense 40/10/12.5mg 30 f.c. tabs.
{
  id: 'marvitense-40-10-12-5-thz',
  name: 'Marvitense 40/10/12.5mg 30 f.c. tabs.',
  genericName: 'Olmesartan + Amlodipine + Hydrochlorothiazide',
  concentration: '40mg / 10mg / 12.5mg',
  price: 123,
  matchKeywords: [
    'hypertension', 'marvitense', 'triple therapy',
    'مارفيتنس', 'ثلاثي', 'ضغط عالي'
  ],
  usage: 'علاج ثلاثي قوي جداً يحتوي على أملوديبين (١٠ مجم) وأولميسارتان (٤٠ مجم) ومدر للبول.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٤٠ مجم / ١٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'قد يسبب تورم القدمين (بسبب الأملوديبين).',
    'يجب الحذر من هبوط الضغط.'
  ]
},

// 30. Marvitense 40/5/12.5mg 30 f.c. tab
{
  id: 'marvitense-40-5-12-5-thz',
  name: 'Marvitense 40/5/12.5mg 30 f.c. tab',
  genericName: 'Olmesartan + Amlodipine + Hydrochlorothiazide',
  concentration: '40mg / 5mg / 12.5mg',
  price: 108,
  matchKeywords: [
    'hypertension', 'marvitense', 'triple therapy', 'medium dose',
    'مارفيتنس', 'ثلاثي', 'جرعة متوسطة'
  ],
  usage: 'علاج ثلاثي بجرعة أملوديبين متوسطة (٥ مجم) لتقليل الآثار الجانبية.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٤٠ مجم / ٥ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يجب شرب السوائل بانتظام.'
  ]
},

// 31. Modazar 25/100mg 8 f.c. tabs.
{
  id: 'modazar-25-100',
  name: 'Modazar 25/100mg 8 f.c. tabs.',
  genericName: 'Losartan + Hydrochlorothiazide',
  concentration: '100mg / 25mg',
  price: 41,
  matchKeywords: [
    'hypertension', 'modazar', 'losartan', 'gout',
    'مودازار', 'لوسارتان', 'نقرس', 'ضغط'
  ],
  usage: 'علاج ثنائي لضغط الدم. يتميز اللوسارتان بقدرته الفريدة على خفض حمض اليوريك، مما يجعله الخيار الأفضل لمرضى الضغط المصابين بالنقرس (ليعادل تأثير مدر البول).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠٠ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل (فئة D).',
    'العبوة صغيرة (٨ أقراص)، يجب التأكد من توفر الدواء بانتظام.',
    'يجب متابعة ضغط الدم للتأكد من فاعليته، حيث أن اللوسارتان قد يكون أقل قوة من بعض البدائل الحديثة.'
  ]
},

// 32. Tribatens 40/10/12.5mg 30 f.c. tabs
{
  id: 'tribatens-40-10-12-5-thz',
  name: 'Tribatens 40/10/12.5mg 30 f.c. tabs',
  genericName: 'Olmesartan + Amlodipine + Hydrochlorothiazide',
  concentration: '40mg / 10mg / 12.5mg',
  price: 126,
  matchKeywords: [
    'hypertension', 'tribatens', 'triple therapy',
    'تريباتنس', 'ثلاثي', 'ضغط عالي'
  ],
  usage: 'علاج ثلاثي مماثل للمارفيتنس والأراستابكس تريو. جرعة قوية.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٤٠ مجم / ١٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يراعى متابعة التورم في القدمين.'
  ]
},

// 33. Tribatens 40/10/25mg 30 f.c. tabs.
{
  id: 'tribatens-40-10-25-thz',
  name: 'Tribatens 40/10/25mg 30 f.c. tabs.',
  genericName: 'Olmesartan + Amlodipine + Hydrochlorothiazide',
  concentration: '40mg / 10mg / 25mg',
  price: 132,
  matchKeywords: [
    'hypertension', 'tribatens', 'max diuretic', 'resistant hypertension',
    'تريباتنس', 'مدر عالي', 'اقصى جرعة', 'ضغط مقاوم'
  ],
  usage: 'أقصى جرعة ثلاثية (بزيادة مدر البول لـ ٢٥ مجم). للضغط المقاوم جداً.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٤٠ مجم / ١٠ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'خطر الجفاف وهبوط الضغط مرتفع.',
    'قد يرفع حمض اليوريك.'
  ]
},

// 34. Tribatens 40/5/12.5mg 30 f.c. tabs
{
  id: 'tribatens-40-5-12-5-thz',
  name: 'Tribatens 40/5/12.5mg 30 f.c. tabs',
  genericName: 'Olmesartan + Amlodipine + Hydrochlorothiazide',
  concentration: '40mg / 5mg / 12.5mg',
  price: 120,
  matchKeywords: [
    'hypertension', 'tribatens', 'medium triple',
    'تريباتنس', 'ثلاثي', 'جرعة متوسطة'
  ],
  usage: 'علاج ثلاثي بجرعات متوازنة.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٤٠ مجم / ٥ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'آمن نسبياً مقارنة بالجرعات الأعلى.'
  ]
},

// 35. Vecovartec Plus 40/12.5mg 21 f.c.tab.
{
  id: 'vecovartec-plus-40-12-5-21',
  name: 'Vecovartec Plus 40/12.5mg 21 f.c.tab.',
  genericName: 'Olmesartan + Hydrochlorothiazide',
  concentration: '40mg / 12.5mg',
  price: 42,
  matchKeywords: [
    'hypertension', 'vecovartec', 'cheap', '3 weeks',
    'فيكوفارتك بلس', 'سعر اقتصادي', 'ضغط'
  ],
  usage: 'علاج ثنائي قوي (أولميسارتان ٤٠ مجم + مدر) بعبوة اقتصادية جداً (٢١ قرص تكفي ٣ أسابيع).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٤٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يجب مراقبة وظائف الكلى.'
  ]
},
// 36. Mavilor Plus 5/12.5 mg 30 tabs.
{
  id: 'mavilor-plus-5-12-5',
  name: 'Mavilor Plus 5/12.5 mg 30 tabs.',
  genericName: 'Nebivolol + Hydrochlorothiazide',
  concentration: '5mg / 12.5mg',
  price: 108,
  matchKeywords: [
    'hypertension', 'mavilor plus', 'nebivolol', 'beta blocker',
    'مافيلور بلس', 'نيبفولول', 'بيتا بلوكر', 'ضغط'
  ],
  usage: 'علاج ثنائي لضغط الدم يجمع بين (Nebivolol) الموسع للأوعية والمنظم لضربات القلب، ومدر للبول بجرعة قياسية.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع التوقف المفاجئ عن الدواء لتجنب الارتفاع الارتدادي في الضغط.',
    'يمنع لمرضى الربو والانسداد الرئوي المزمن (COPD).',
    'يجب مراقبة سكر الدم.'
  ]
},

// 37. Angiosartan Plus 20/25mg 28 f.c. tabs.
{
  id: 'angiosartan-plus-20-25',
  name: 'Angiosartan Plus 20/25mg 28 f.c. tabs.',
  genericName: 'Olmesartan + Hydrochlorothiazide',
  concentration: '20mg / 25mg',
  price: 66,
  matchKeywords: [
    'hypertension', 'angiosartan', 'high diuretic',
    'انجيوسارتان بلس', 'مدر عالي', 'اولميسارتان ٢٠'
  ],
  usage: 'تركيبة مميزة تحتوي على جرعة أولميسارتان متوسطة (٢٠ مجم) مع جرعة مدر للبول عالية (٢٥ مجم). مناسب للمرضى الذين يعانون من احتباس سوائل شديد ولا يتحملون جرعة ٤٠ مجم أولميسارتان.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'قد يسبب انخفاضاً في البوتاسيوم وارتفاعاً في حمض اليوريك.',
    'سعر اقتصادي جداً (٦٦ جنيه).'
  ]
},

// 38. Angiosartan Plus 40/12.5mg 28 f.c. tabs.
{
  id: 'angiosartan-plus-40-12-5',
  name: 'Angiosartan Plus 40/12.5mg 28 f.c. tabs.',
  genericName: 'Olmesartan + Hydrochlorothiazide',
  concentration: '40mg / 12.5mg',
  price: 104,
  matchKeywords: [
    'hypertension', 'angiosartan', 'olmesartan 40',
    'انجيوسارتان بلس', 'اولميسارتان ٤٠', 'ضغط عالي'
  ],
  usage: 'علاج ثنائي قوي بجرعة أولميسارتان عالية (٤٠ مجم) ومدر للبول قياسي. فعال جداً لضبط الضغط المرتفع.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٤٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يجب الحذر عند الوقوف السريع لتجنب الدوخة.'
  ]
},

// 39. Angiosartan Plus 40/25mg 28 f.c. tabs.
{
  id: 'angiosartan-plus-40-25',
  name: 'Angiosartan Plus 40/25mg 28 f.c. tabs.',
  genericName: 'Olmesartan + Hydrochlorothiazide',
  concentration: '40mg / 25mg',
  price: 108,
  matchKeywords: [
    'hypertension', 'angiosartan', 'max dose',
    'انجيوسارتان بلس', 'أقصى جرعة', 'ضغط مقاوم'
  ],
  usage: 'الجرعة القصوى من الأولميسارتان والمدر للبول. يستخدم لحالات الضغط العنيد والمقاوم للعلاج.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٤٠ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'خطر الجفاف واضطراب وظائف الكلى وارد، يرجى المتابعة الدورية.'
  ]
},

// 40. Bistol Plus 5/12.5 mg 20 f.c.tab.
{
  id: 'bistol-plus-5-12-5',
  name: 'Bistol Plus 5/12.5 mg 20 f.c.tab.',
  genericName: 'Bisoprolol + Hydrochlorothiazide',
  concentration: '5mg / 12.5mg',
  price: 36,
  matchKeywords: [
    'hypertension', 'bistol', 'economic', 'concor generic',
    'بيستول بلس', 'بديل كونكور', 'رخيص', 'ضغط'
  ],
  usage: 'بديل اقتصادي جداً (Concor Plus Generic). لعلاج الضغط المرتفع مع تنظيم ضربات القلب.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع التوقف المفاجئ.',
    'يمنع لمرضى الحساسية الصدرية.',
    'قد يسبب برودة الأطراف.'
  ]
},

// 41. Co-Tareg 160/12.5mg 28 f.c. tab.
{
  id: 'co-tareg-160-12-5-28',
  name: 'Co-Tareg 160/12.5mg 28 f.c. tab.',
  genericName: 'Valsartan + Hydrochlorothiazide',
  concentration: '160mg / 12.5mg',
  price: 300,
  matchKeywords: [
    'hypertension', 'co-tareg', 'novartis', 'original',
    'كوتارج', 'نوفارتس', 'الاصلي', 'فالسارتان'
  ],
  usage: 'المستحضر الأصلي (Brand) للفالسارتان مع مدر للبول. يتميز بأعلى معايير الجودة والفعالية في ضبط الضغط.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٦٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل (فئة D).',
    'سعره مرتفع (٣٠٠ جنيه)، تأكد من قدرة المريض المادية قبل وصفه.',
    'آمن جداً على الكلى (Nephroprotective) لمرضى السكري.'
  ]
},

// 42. Co-Tareg 160/12.5mg 14 f.c. tab.
{
  id: 'co-tareg-160-12-5-14',
  name: 'Co-Tareg 160/12.5mg 14 f.c. tab.',
  genericName: 'Valsartan + Hydrochlorothiazide',
  concentration: '160mg / 12.5mg',
  price: 150,
  matchKeywords: [
    'hypertension', 'co-tareg', 'novartis', '2 weeks',
    'كوتارج', 'عبوة صغيرة', 'نوفارتس'
  ],
  usage: 'نفس المستحضر الأصلي (عبوة ١٤ قرص تكفي أسبوعين).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٦٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يجب متابعة وظائف الكلى.'
  ]
},

// 43. Geocand Plus 16/12.5mg 21 tab.
{
  id: 'geocand-plus-16-12-5',
  name: 'Geocand Plus 16/12.5mg 21 tab.',
  genericName: 'Candesartan + Hydrochlorothiazide',
  concentration: '16mg / 12.5mg',
  price: 108,
  matchKeywords: [
    'hypertension', 'geocand', 'candesartan', '3 weeks',
    'جيوكاند بلس', 'كانديسارتان', 'ضغط'
  ],
  usage: 'بديل أتاكاند بلس. يحتوي على كانديسارتان بجرعة ١٦ مجم. (عبوة ٢١ قرص).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٦ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'العبوة تكفي ٣ أسابيع فقط.',
    'يعتبر الكانديسارتان من أقل الأدوية تسبباً في الصداع.'
  ]
},

// 44. Albustix D 32/12.5mg 30 tab.
{
  id: 'albustix-d-32-12-5',
  name: 'Albustix D 32/12.5mg 30 tab.',
  genericName: 'Candesartan + Hydrochlorothiazide',
  concentration: '32mg / 12.5mg',
  price: 216,
  matchKeywords: [
    'hypertension', 'albustix', 'candesartan 32', 'albuminuria',
    'البوستيكس دي', 'كانديسارتان ٣٢', 'زلال', 'حماية الكلى'
  ],
  usage: 'يحتوي على جرعة عالية جداً من الكانديسارتان (٣٢ مجم). فعال للغاية في خفض الضغط وتقليل زلال البول (Albuminuria) وحماية الكلى.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٣٢ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'قد يرفع مستوى البوتاسيوم بشكل ملحوظ، يرجى التحليل الدوري.',
    'قد يسبب الدوار عند بداية العلاج.'
  ]
},

// 45. Loraz 50/12.5 mg 14 tablets
{
  id: 'loraz-50-12-5',
  name: 'Loraz 50/12.5 mg 14 tablets',
  genericName: 'Losartan + Hydrochlorothiazide',
  concentration: '50mg / 12.5mg',
  price: 36,
  matchKeywords: [
    'hypertension', 'loraz', 'losartan', 'cheap', 'gout',
    'لوراز', 'لوسارتان', 'رخيص', 'نقرس', 'ضغط'
  ],
  usage: 'بديل اقتصادي (Hyzaar Generic). اللوسارتان مفيد لمرضى النقرس لأنه يساعد في إخراج حمض اليوريك.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'فعاليته في خفض الضغط قد تكون أقل قليلاً من الكانديسارتان والأولميسارتان، لذا يجب متابعة القياس.'
  ]
},
// 46. Sinopril-Co 12.5/20mg 30 tab.
{
  id: 'sinopril-co-12-5-20',
  name: 'Sinopril-Co 12.5/20mg 30 tab.',
  genericName: 'Lisinopril + Hydrochlorothiazide',
  concentration: '20mg / 12.5mg',
  price: 105,
  matchKeywords: [
    'hypertension', 'sinopril co', 'ace inhibitor', 'lisinopril',
    'سينوبيريل كو', 'ليزينوبريل', 'ضغط', 'مدر للبول'
  ],
  usage: 'علاج ارتفاع ضغط الدم، يجمع بين الليزينوبريل (ACE Inhibitor) ومدر للبول. فعال في حماية الكلى لدى مرضى السكري (في حال عدم وجود موانع).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'قد يسبب سعالاً جافاً ومستمراً (Dry Cough) بسبب الليزينوبريل؛ أعد التقييم لاستبدال الدواء (مثلاً ARB).',
    'يمنع استخدامه للحوامل (فئة D).',
    'احتمالية حدوث تورم وعائي (Angioedema) في الوجه واللسان واردة، وهي حالة طارئة تستدعي وقف الدواء فوراً.'
  ]
},

// 47. Tritace Max 10/25mg 10 tab
{
  id: 'tritace-max-10-25',
  name: 'Tritace Max 10/25mg 10 tab',
  genericName: 'Ramipril + Hydrochlorothiazide',
  concentration: '10mg / 25mg',
  price: 83,
  matchKeywords: [
    'hypertension', 'tritace max', 'ramipril', 'strong diuretic',
    'تريتاس ماكس', 'راميبريل', 'مدر عالي', 'ضغط مقاوم'
  ],
  usage: 'أقوى تركيز في عائلة التريتاس. يحتوي على راميبريل (١٠ مجم) مع جرعة عالية من مدر البول (٢٥ مجم). مخصص لمرضى الضغط المرتفع جداً أو المقاوم.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'الجرعة العالية من مدر البول (٢٥ مجم) قد ترفع مستويات السكر وحمض اليوريك وتخفض البوتاسيوم.',
    'يجب الحذر الشديد من انخفاض ضغط الدم المفاجئ عند بدء العلاج.'
  ]
},

// 48. Zestoretic 20mg 10 tab
{
  id: 'zestoretic-20',
  name: 'Zestoretic 20mg 10 tab',
  genericName: 'Lisinopril + Hydrochlorothiazide',
  concentration: '20mg / 12.5mg',
  price: 68,
  matchKeywords: [
    'hypertension', 'zestoretic', 'astrazeneca', 'original', 'lisinopril',
    'زيستوريتك', 'استرازينيكا', 'ليزينوبريل', 'الاصلي', 'ضغط'
  ],
  usage: 'المستحضر الأصلي (Brand) لليزينوبريل مع مدر للبول. يعتبر المعيار الذهبي في فئته لعلاج الضغط وحماية القلب.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'السعال الجاف عرض جانبي شائع.',
    'يجب مراقبة وظائف الكلى والبوتاسيوم بانتظام.'
  ]
},

// 49. Albustix D 8/12.5mg 30 tab.
{
  id: 'albustix-d-8-12-5',
  name: 'Albustix D 8/12.5mg 30 tab.',
  genericName: 'Candesartan + Hydrochlorothiazide',
  concentration: '8mg / 12.5mg',
  price: 39,
  matchKeywords: [
    'hypertension', 'albustix', 'candesartan 8', 'start dose',
    'البوستيكس دي', 'كانديسارتان ٨', 'بداية العلاج', 'ضغط'
  ],
  usage: 'جرعة البداية من الكانديسارتان مع مدر للبول. يتميز بفعالية عالية في حماية الكلى وتقليل الزلال (Microalbuminuria).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٨ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'آمن جداً لمرضى السكري والقلب.',
    'أقل تسبباً في السعال مقارنة ببدائل الـ ACE Inhibitors.'
  ]
},

// 50. Albustix D 16/12.5mg 30 tab.
{
  id: 'albustix-d-16-12-5',
  name: 'Albustix D 16/12.5mg 30 tab.',
  genericName: 'Candesartan + Hydrochlorothiazide',
  concentration: '16mg / 12.5mg',
  price: 156,
  matchKeywords: [
    'hypertension', 'albustix', 'candesartan 16',
    'البوستيكس دي', 'كانديسارتان ١٦', 'ضغط'
  ],
  usage: 'الجرعة القياسية للكانديسارتان (١٦ مجم) مع مدر للبول لضبط الضغط المرتفع.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٦ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يجب التأكد من وظائف الكلى قبل الاستخدام.',
    'قد يسبب الدوار في بداية العلاج.'
  ]
},
// 51. Bisolock-D 5/12.5mg 20 f.c.tab
{
  id: 'bisolock-d-5-12-5',
  name: 'Bisolock-D 5/12.5mg 20 f.c.tab',
  genericName: 'Bisoprolol + Hydrochlorothiazide',
  concentration: '5mg / 12.5mg',
  price: 42,
  matchKeywords: [
    'hypertension', 'bisolock', 'concor generic', 'beta blocker',
    'بيزولوك دي', 'بيزوبرولول', 'بديل كونكور', 'ضغط'
  ],
  usage: 'علاج ارتفاع ضغط الدم المصحوب بزيادة معدل ضربات القلب. (بديل اقتصادي للكونكور بلس).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع التوقف المفاجئ عن الدواء لتجنب حدوث ذبحة صدرية أو تسارع في القلب.',
    'يمنع لمرضى الربو الشعبي.',
    'قد يسبب برودة في اليدين والقدمين.'
  ]
},

// 52. Bistol Plus 5/6.25mg 20 f.c.tab.
{
  id: 'bistol-plus-5-6-25',
  name: 'Bistol Plus 5/6.25mg 20 f.c.tab.',
  genericName: 'Bisoprolol + Hydrochlorothiazide',
  concentration: '5mg / 6.25mg',
  price: 34,
  matchKeywords: [
    'hypertension', 'bistol', 'low diuretic', 'elderly',
    'بيستول بلس', 'مدر خفيف', 'ضغط', 'كبار السن'
  ],
  usage: 'يتميز بوجود نصف الجرعة المعتادة من مدر البول (٦.٢٥ مجم). مثالي لكبار السن أو المرضى المعرضين للجفاف وانخفاض الضغط.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم / ٦.٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع التوقف المفاجئ عن الدواء.',
    'يجب متابعة النبض والضغط بانتظام.'
  ]
},

// 53. Candeblock-D 16/12.5mg 20 tab.
{
  id: 'candeblock-d-16-12-5',
  name: 'Candeblock-D 16/12.5mg 20 tab.',
  genericName: 'Candesartan + Hydrochlorothiazide',
  concentration: '16mg / 12.5mg',
  price: 106,
  matchKeywords: [
    'hypertension', 'candeblock', 'candesartan',
    'كانديبلوك دي', 'كانديسارتان', 'ضغط'
  ],
  usage: 'علاج ثنائي لضغط الدم. الكانديسارتان فعال في حماية الكلى وتقليل احتمالية حدوث السكتات الدماغية.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٦ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'قد يسبب الدوار، خاصة في الأيام الأولى للعلاج.'
  ]
},

// 54. Co-Tareg 80/12.5mg 14 f.c.tab.
{
  id: 'co-tareg-80-12-5',
  name: 'Co-Tareg 80/12.5mg 14 f.c.tab.',
  genericName: 'Valsartan + Hydrochlorothiazide',
  concentration: '80mg / 12.5mg',
  price: 132,
  matchKeywords: [
    'hypertension', 'co-tareg', 'novartis', 'start dose',
    'كوتارج', 'جرعة متوسطة', 'فالسارتان ٨٠', 'ضغط'
  ],
  usage: 'المستحضر الأصلي (Brand) بجرعة فالسارتان متوسطة (٨٠ مجم). مناسب لبدء العلاج الثنائي.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٨٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يجب التأكد من وظائف الكلى قبل الاستخدام.'
  ]
},

// 55. Chartoreg Plus 40/12.5mg 28 tabs.
{
  id: 'chartoreg-plus-40-12-5',
  name: 'Chartoreg Plus 40/12.5mg 28 tabs.',
  genericName: 'Telmisartan + Hydrochlorothiazide',
  concentration: '40mg / 12.5mg',
  price: 144,
  matchKeywords: [
    'hypertension', 'chartoreg', 'telmisartan', 'micardis generic',
    'شارتوريج بلس', 'تيلميسارتان', 'بديل ميكارديس', 'طويل المفعول'
  ],
  usage: 'علاج ضغط الدم المرتفع. يتميز التيلميسارتان بمفعول طويل الأمد يغطي ٢٤ ساعة كاملة (أطول نصف عمر في المجموعة).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٤٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'قد يرفع مستوى البوتاسيوم في الدم، لذا ينصح بالتحليل الدوري.'
  ]
},

// 56. Chartoreg Plus 80/12.5mg 28 tabs.
{
  id: 'chartoreg-plus-80-12-5',
  name: 'Chartoreg Plus 80/12.5mg 28 tabs.',
  genericName: 'Telmisartan + Hydrochlorothiazide',
  concentration: '80mg / 12.5mg',
  price: 158,
  matchKeywords: [
    'hypertension', 'chartoreg', 'telmisartan 80',
    'شارتوريج بلس', 'تيلميسارتان ٨٠', 'ضغط عالي'
  ],
  usage: 'يحتوي على الجرعة القياسية العالية من التيلميسارتان (٨٠ مجم) مع مدر للبول. فعال جداً للتحكم في الضغط على مدار اليوم والليل.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٨٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يجب الحذر عند استخدامه مع كبار السن لتجنب الهبوط.'
  ]
},

// 57. Chartoreg Trio 5/12.5/80mg 28 tabs.
{
  id: 'chartoreg-trio-5-12-5-80',
  name: 'Chartoreg Trio 5/12.5/80mg 28 tabs.',
  genericName: 'Telmisartan + Amlodipine + Hydrochlorothiazide',
  concentration: '80mg / 5mg / 12.5mg',
  price: 208,
  matchKeywords: [
    'hypertension', 'chartoreg trio', 'triple therapy', 'telmisartan',
    'شارتوريج تريو', 'ثلاثي', 'تيلميسارتان', 'ضغط عالي'
  ],
  usage: 'علاج ثلاثي قوي جداً يجمع بين (تيلميسارتان طويل المفعول + أملوديبين + مدر للبول). للحالات التي تحتاج سيطرة قصوى.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٨٠ مجم / ٥ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'خطر حدوث الدوار وهبوط الضغط وارد جداً.',
    'يجب متابعة وظائف الكلى والشوارد (Electrolytes).'
  ]
},

// 58. Chartoreg Plus 80/25mg 28 tabs.
{
  id: 'chartoreg-plus-80-25',
  name: 'Chartoreg Plus 80/25mg 28 tabs.',
  genericName: 'Telmisartan + Hydrochlorothiazide',
  concentration: '80mg / 25mg',
  price: 158,
  matchKeywords: [
    'hypertension', 'chartoreg', 'high diuretic',
    'شارتوريج بلس', 'مدر عالي', 'تيلميسارتان', 'ضغط'
  ],
  usage: 'الجرعة القصوى من التيلميسارتان مع جرعة مضاعفة من مدر البول (٢٥ مجم). مخصص للضغط المقاوم المصحوب باحتباس سوائل.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 60,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٨٠ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'قد يسبب ارتفاعاً في حمض اليوريك والسكر.',
    'يجب التأكد من سلامة وظائف الكلى.'
  ]
},

// 59. Irbefutal Co 150/12.5mg 30 tab.
{
  id: 'irbefutal-co-150-12-5',
  name: 'Irbefutal Co 150/12.5mg 30 tab.',
  genericName: 'Irbesartan + Hydrochlorothiazide',
  concentration: '150mg / 12.5mg',
  price: 111,
  matchKeywords: [
    'hypertension', 'irbefutal', 'irbesartan', 'kidney protection',
    'ايربيفيوتال كو', 'اربيسارتان', 'حماية الكلى', 'ضغط'
  ],
  usage: 'علاج ضغط الدم لمرضى السكري والضغط، حيث يوفر الإربيسارتان حماية للكلى.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٥٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يراعى متابعة مستوى البوتاسيوم.'
  ]
},

// 60. Irbefutal Co 300/12.5mg 30 tab.
{
  id: 'irbefutal-co-300-12-5',
  name: 'Irbefutal Co 300/12.5mg 30 tab.',
  genericName: 'Irbesartan + Hydrochlorothiazide',
  concentration: '300mg / 12.5mg',
  price: 156,
  matchKeywords: [
    'hypertension', 'irbefutal', 'high dose',
    'ايربيفيوتال كو', 'اربيسارتان ٣٠٠', 'جرعة عالية'
  ],
  usage: 'يحتوي على الجرعة القصوى من الإربيسارتان (٣٠٠ مجم) لضبط الضغط المرتفع.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٣٠٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'قد يسبب الدوار عند الوقوف المفاجئ.'
  ]
},

// 61. Losazide 50/12.5mg 10 f.c.tabs.
{
  id: 'losazide-50-12-5',
  name: 'Losazide 50/12.5mg 10 f.c.tabs.',
  genericName: 'Losartan + Hydrochlorothiazide',
  concentration: '50mg / 12.5mg',
  price: 22,
  matchKeywords: [
    'hypertension', 'losazide', 'cheap', 'gout',
    'لوزازيد', 'لوسارتان', 'رخيص', 'نقرس', 'ضغط'
  ],
  usage: 'بديل اقتصادي جداً (Hyzaar Generic). اللوسارتان مفيد لمرضى النقرس لأنه يساعد في إخراج حمض اليوريك.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'تأكد من شراء كمية كافية لضمان استمرار العلاج.'
  ]
},
// 62. Marvitense 20/5/12.5mg 30 f.c. tabs
{
  id: 'marvitense-20-5-12-5',
  name: 'Marvitense 20/5/12.5mg 30 f.c. tabs',
  genericName: 'Olmesartan + Amlodipine + Hydrochlorothiazide',
  concentration: '20mg / 5mg / 12.5mg',
  price: 87,
  matchKeywords: [
    'hypertension', 'marvitense', 'triple therapy', 'start dose',
    'مارفيتنس', 'ثلاثي', 'بداية العلاج', 'ضغط'
  ],
  usage: 'بداية العلاج الثلاثي (أولميسارتان ٢٠ + أملوديبين ٥ + مدر للبول). مثالي للمريض الذي يحتاج لأكثر من دواء ولكن بجرعات غير مرهقة.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم / ٥ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يجب التأكد من عدم وجود جفاف قبل البدء بالعلاج.'
  ]
},

// 63. Olmespironva 20/12.5mg 30 tab
{
  id: 'olmespironva-20-12-5',
  name: 'Olmespironva 20/12.5mg 30 tab',
  genericName: 'Olmesartan + Hydrochlorothiazide',
  concentration: '20mg / 12.5mg',
  price: 75,
  matchKeywords: [
    'hypertension', 'olmespironva', 'olmesartan', 'generic',
    'اولمسبيرونفا', 'اولميسارتان', 'ضغط', 'مدر'
  ],
  usage: 'علاج ثنائي لضغط الدم بجرعة أولميسارتان متوسطة (٢٠ مجم) ومدر للبول.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يجب الحذر عند الوقوف المفاجئ لتجنب الدوخة.'
  ]
},

// 64. Olmespironva 20/25mg 30 f.c. tab.
{
  id: 'olmespironva-20-25',
  name: 'Olmespironva 20/25mg 30 f.c. tab.',
  genericName: 'Olmesartan + Hydrochlorothiazide',
  concentration: '20mg / 25mg',
  price: 78,
  matchKeywords: [
    'hypertension', 'olmespironva', 'high diuretic',
    'اولمسبيرونفا', 'مدر عالي', 'ضغط'
  ],
  usage: 'يتميز بجرعة عالية من مدر البول (٢٥ مجم) مع جرعة متوسطة من الأولميسارتان. مناسب لمرضى الضغط المصابين باحتباس سوائل شديد.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'قد يرفع مستوى السكر وحمض اليوريك (بسبب جرعة الثيازيد ٢٥ مجم).',
    'يجب متابعة شوارد الدم (البوتاسيوم والصوديوم).'
  ]
},

// 65. Tribatens 20/5/12.5mg 30 f.c. tabs.
{
  id: 'tribatens-20-5-12-5',
  name: 'Tribatens 20/5/12.5mg 30 f.c. tabs.',
  genericName: 'Olmesartan + Amlodipine + Hydrochlorothiazide',
  concentration: '20mg / 5mg / 12.5mg',
  price: 90,
  matchKeywords: [
    'hypertension', 'tribatens', 'triple therapy', 'start dose',
    'تريباتنس', 'ثلاثي', 'بداية العلاج', 'ضغط'
  ],
  usage: 'بداية العلاج الثلاثي (بديل Sevikar HCT / Marvitense). جرعات أولية للسيطرة على الضغط دون آثار جانبية شديدة.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم / ٥ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يجب التأكد من وظائف الكلى.'
  ]
},

// 66. Tribatens 40/5/25mg 30 f.c. tabs.
{
  id: 'tribatens-40-5-25',
  name: 'Tribatens 40/5/25mg 30 f.c. tabs.',
  genericName: 'Olmesartan + Amlodipine + Hydrochlorothiazide',
  concentration: '40mg / 5mg / 25mg',
  price: 126,
  matchKeywords: [
    'hypertension', 'tribatens', 'high diuretic', 'low amlo',
    'تريباتنس', 'مدر عالي', 'أملوديبين منخفض', 'ضغط مقاوم'
  ],
  usage: 'تركيبة ذكية جداً: أولميسارتان عالي (٤٠) ومدر للبول عالي (٢٥) للسيطرة القصوى، مع أملوديبين منخفض (٥) لتجنب تورم القدمين.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٤٠ مجم / ٥ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'خطر حدوث الجفاف واضطراب الشوارد مرتفع.',
    'قد يرفع مستوى حمض اليوريك.'
  ]
},

// 67. Tritace Comp 5/25mg 14 tab
{
  id: 'tritace-comp-5-25',
  name: 'Tritace Comp 5/25mg 14 tab',
  genericName: 'Ramipril + Hydrochlorothiazide',
  concentration: '5mg / 25mg',
  price: 118,
  matchKeywords: [
    'hypertension', 'tritace comp', 'sanofi', 'high diuretic',
    'تريتاس كومب', 'راميبريل', 'مدر عالي', 'سانوفي'
  ],
  usage: 'يجمع بين الراميبريل (ACE Inhibitor) بجرعة ٥ مجم وجرعة عالية من مدر البول (٢٥ مجم). للضغط المقاوم.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل (خطر تشوه الأجنة).',
    'قد يسبب سعالاً جافاً (Dry Cough).',
    'يجب الحذر الشديد من انخفاض الضغط المفاجئ ونقص البوتاسيوم.'
  ]
},

// 68. Vecovartec Plus 20/12.5mg 28 f.c. tab.
{
  id: 'vecovartec-plus-20-12-5-28',
  name: 'Vecovartec Plus 20/12.5mg 28 f.c. tab.',
  genericName: 'Olmesartan + Hydrochlorothiazide',
  concentration: '20mg / 12.5mg',
  price: 56,
  matchKeywords: [
    'hypertension', 'vecovartec', 'cheap',
    'فيكوفارتك بلس', 'سعر اقتصادي', 'ضغط'
  ],
  usage: 'بديل اقتصادي للأولميسارتان مع مدر البول. (عبوة ٢٨ قرص).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'فعال واقتصادي، تأكد من استمرارية العلاج.'
  ]
},

// 69. Targomash Comb 160/12.5mg 30 f.c. tabs.
{
  id: 'targomash-comb-160-12-5',
  name: 'Targomash Comb 160/12.5mg 30 f.c. tabs.',
  genericName: 'Valsartan + Hydrochlorothiazide',
  concentration: '160mg / 12.5mg',
  price: 96,
  matchKeywords: [
    'hypertension', 'targomash', 'valsartan', 'generic co-tareg',
    'تارجوماش كومب', 'فالسارتان', 'بديل كوتارج', 'ضغط'
  ],
  usage: 'بديل ممتاز للـ (Co-Tareg). يحتوي على ١٦٠ مجم فالسارتان مع مدر للبول. فعال في ضبط الضغط وحماية القلب.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٦٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يجب متابعة وظائف الكلى بشكل دوري.'
  ]
},

// 70. Targomash Comb 80/12.5mg 30 f.c. tab.
{
  id: 'targomash-comb-80-12-5',
  name: 'Targomash Comb 80/12.5mg 30 f.c. tab.',
  genericName: 'Valsartan + Hydrochlorothiazide',
  concentration: '80mg / 12.5mg',
  price: 84,
  matchKeywords: [
    'hypertension', 'targomash', 'start dose',
    'تارجوماش كومب', 'فالسارتان ٨٠', 'ضغط'
  ],
  usage: 'جرعة فالسارتان متوسطة (٨٠ مجم) مع مدر للبول. مناسبة لبدء العلاج الثنائي أو لكبار السن.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٨٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يجب التأكد من عدم وجود جفاف قبل البدء.'
  ]
},
// 71. Losazide 100/25mg 10 f.c. tabs.
{
  id: 'losazide-100-25-10',
  name: 'Losazide 100/25mg 10 f.c. tabs.',
  genericName: 'Losartan + Hydrochlorothiazide',
  concentration: '100mg / 25mg',
  price: 25,
  matchKeywords: [
    'hypertension', 'losazide', 'gout', 'cheap', 'max dose',
    'لوزازيد', 'لوسارتان', 'نقرس', 'أقصى جرعة', 'رخيص'
  ],
  usage: 'يحتوي على الجرعة القصوى من اللوسارتان (١٠٠ مجم) ومدر البول (٢٥ مجم). خيار اقتصادي وممتاز لمرضى الضغط المصابين بالنقرس.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠٠ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل (فئة D).',
    'خطر حدوث جفاف وهبوط في الضغط، خاصة في الأيام الأولى.',
    'يجب التأكد من سلامة وظائف الكلى.'
  ]
},

// 72. Atacand Plus 32/25mg 14 tab
{
  id: 'atacand-plus-32-25',
  name: 'Atacand Plus 32/25mg 14 tab',
  genericName: 'Candesartan Cilexetil + Hydrochlorothiazide',
  concentration: '32mg / 25mg',
  price: 179,
  matchKeywords: [
    'hypertension', 'atacand', 'astrazeneca', 'max dose', 'strongest',
    'اتاكاند بلس', 'استرازينيكا', 'أقصى جرعة', 'أقوى ضغط'
  ],
  usage: 'أعلى تركيز في عائلة الأتاكاند (Brand). يجمع بين أقصى جرعة كانديسارتان (٣٢) وأقصى جرعة مدر للبول (٢٥). للسيطرة على الضغط العنيد جداً.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 60,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٣٢ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'قد يسبب اضطراباً في شوارد الدم (البوتاسيوم والصوديوم) وارتفاعاً في وظائف الكلى.',
    'يجب الحذر عند وصفه لكبار السن.'
  ]
},

// 73. Cardivo-care 10/6.25mg 30 f.c.tab.
{
  id: 'cardivo-care-10-6-25',
  name: 'Cardivo-care 10/6.25mg 30 f.c.tab.',
  genericName: 'Bisoprolol + Hydrochlorothiazide',
  concentration: '10mg / 6.25mg',
  price: 60,
  matchKeywords: [
    'hypertension', 'cardivo', 'beta blocker', 'low diuretic',
    'كارديفو كير', 'بيزوبرولول ١٠', 'مدر خفيف', 'ضغط'
  ],
  usage: 'تركيبة مميزة تحتوي على جرعة عالية من البيزوبرولول (١٠ مجم) للتحكم في القلب، مع جرعة خفيفة جداً من مدر البول (٦.٢٥ مجم) لتجنب الجفاف.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠ مجم / ٦.٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع التوقف المفاجئ لتجنب المضاعفات القلبية.',
    'يمنع لمرضى الربو الشعبي.',
    'آمن نسبياً من حيث أعراض الجفاف واضطراب الأملاح مقارنة بالجرعات الأعلى.'
  ]
},

// 74. Irbefutal Co 300/25mg 30 tab.
{
  id: 'irbefutal-co-300-25',
  name: 'Irbefutal Co 300/25mg 30 tab.',
  genericName: 'Irbesartan + Hydrochlorothiazide',
  concentration: '300mg / 25mg',
  price: 117,
  matchKeywords: [
    'hypertension', 'irbefutal', 'max dose', 'irbesartan 300',
    'ايربيفيوتال كو', 'أقصى جرعة', 'اربيسارتان', 'ضغط مقاوم'
  ],
  usage: 'الجرعة القصوى من الإربيسارتان (٣٠٠ مجم) مع جرعة عالية من مدر البول (٢٥ مجم). مخصص لمرضى الضغط المقاوم.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 60,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٣٠٠ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'قد يسبب الدوخة عند الوقوف (Orthostatic hypotension).',
    'يجب متابعة وظائف الكلى ومستوى البوتاسيوم.'
  ]
},

// 75. Tritace Comp LS 2.5/12.5mg 14 tab
{
  id: 'tritace-comp-ls-2-5-12-5',
  name: 'Tritace Comp LS 2.5/12.5mg 14 tab',
  genericName: 'Ramipril + Hydrochlorothiazide',
  concentration: '2.5mg / 12.5mg',
  price: 70,
  matchKeywords: [
    'hypertension', 'tritace ls', 'low strength', 'start dose',
    'تريتاس ال اس', 'جرعة خفيفة', 'راميبريل', 'ضغط'
  ],
  usage: 'تركيبة مخففة (LS = Low Strength). تحتوي على راميبريل ٢.٥ مجم مع مدر للبول. مناسبة لبدء العلاج أو لكبار السن.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢.٥ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'قد يسبب سعالاً جافاً.',
    'يجب الحذر من انخفاض الضغط في الجرعات الأولى.'
  ]
},

// 76. Angioblock 150/12.5mg 30 f.c. tabs.
{
  id: 'angioblock-150-12-5',
  name: 'Angioblock 150/12.5mg 30 f.c. tabs.',
  genericName: 'Irbesartan + Hydrochlorothiazide',
  concentration: '150mg / 12.5mg',
  price: 111,
  matchKeywords: [
    'hypertension', 'angioblock', 'irbesartan',
    'انجيوبلوك', 'اربيسارتان', 'ضغط'
  ],
  usage: 'علاج ثنائي لضغط الدم يحتوي على إربيسارتان ١٥٠ مجم ومدر للبول.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٥٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يجب التأكد من وظائف الكلى.'
  ]
},

// 77. Amosar Forte 100/25mg 30 f.c.tab.
{
  id: 'amosar-forte-100-25',
  name: 'Amosar Forte 100/25mg 30 f.c.tab.',
  genericName: 'Losartan + Hydrochlorothiazide',
  concentration: '100mg / 25mg',
  price: 117,
  matchKeywords: [
    'hypertension', 'amosar forte', 'losartan', 'gout',
    'اموسار فورت', 'لوسارتان', 'أقصى جرعة', 'نقرس'
  ],
  usage: 'الجرعة القصوى من اللوسارتان (١٠٠ مجم) مع مدر للبول. ممتاز لمرضى الضغط والنقرس معاً.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠٠ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'خطر حدوث هبوط في الضغط وتغير في وظائف الكلى وارد.',
    'تأكد من شرب الماء بانتظام.'
  ]
},

// 78. Angiosartan Plus 20/12.5mg 28 f.c. tabs.
{
  id: 'angiosartan-plus-20-12-5',
  name: 'Angiosartan Plus 20/12.5mg 28 f.c. tabs.',
  genericName: 'Olmesartan + Hydrochlorothiazide',
  concentration: '20mg / 12.5mg',
  price: 88,
  matchKeywords: [
    'hypertension', 'angiosartan', 'start dose',
    'انجيوسارتان بلس', 'اولميسارتان', 'بداية العلاج'
  ],
  usage: 'علاج ثنائي لضغط الدم بجرعة أولميسارتان متوسطة. فعال في خفض الضغط.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'قد يسبب الدوخة.',
    'يجب الانتباه لأي أعراض هضمية شديدة (إسهال) مرتبطة بالأولميسارتان.'
  ]
},

// 79. Angioblock 300/12.5mg 30 f.c. tabs.
{
  id: 'angioblock-300-12-5',
  name: 'Angioblock 300/12.5mg 30 f.c. tabs.',
  genericName: 'Irbesartan + Hydrochlorothiazide',
  concentration: '300mg / 12.5mg',
  price: 159,
  matchKeywords: [
    'hypertension', 'angioblock', 'irbesartan 300',
    'انجيوبلوك', 'اربيسارتان ٣٠٠', 'ضغط'
  ],
  usage: 'يحتوي على جرعة عالية من الإربيسارتان (٣٠٠ مجم) لضبط الضغط المرتفع.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٣٠٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يجب متابعة وظائف الكلى والبوتاسيوم.'
  ]
},
// 80. Bistol Plus 2.5/6.25mg 20 f.c.tab.
{
  id: 'bistol-plus-2-5-6-25',
  name: 'Bistol Plus 2.5/6.25mg 20 f.c.tab.',
  genericName: 'Bisoprolol + Hydrochlorothiazide',
  concentration: '2.5mg / 6.25mg',
  price: 30,
  matchKeywords: [
    'hypertension', 'bistol', 'micro dose', 'elderly',
    'بيستول بلس', 'جرعة خفيفة جدا', 'كبار السن', 'بيزوبرولول'
  ],
  usage: 'أقل تركيز متاح في هذه الفئة ("Baby dose"). مثالي لكبار السن جداً أو للمرضى ذوي الأوزان المنخفضة، أو عند سحب الدواء تدريجياً.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢.٥ مجم / ٦.٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع التوقف المفاجئ عن الدواء (لأنه يحتوي على بيتا بلوكر).',
    'يمنع لمرضى الربو الشعبي.'
  ]
},

// 81. Coaprovel 150/12.5 mg 14 tab.
{
  id: 'coaprovel-150-12-5',
  name: 'Coaprovel 150/12.5 mg 14 tab.',
  genericName: 'Irbesartan + Hydrochlorothiazide',
  concentration: '150mg / 12.5mg',
  price: 117,
  matchKeywords: [
    'hypertension', 'coaprovel', 'sanofi', 'original', 'kidney protection',
    'كوابروفيل', 'سانوفي', 'الاصلي', 'اربيسارتان', 'ضغط'
  ],
  usage: 'المستحضر الأصلي (Brand) للإربيسارتان مع مدر للبول. يعتبر الخيار الأول لحماية الكلى لدى مرضى السكري وضغط الدم.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٥٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل (فئة D) لتسببه في تشوهات جنينية.',
    'يجب متابعة وظائف الكلى والبوتاسيوم بشكل دوري.',
    'العبوة تحتوي على ١٤ قرصاً (تكفي أسبوعين).'
  ]
},

// 82. Coaprovel 300/12.5 mg 14 tab.
{
  id: 'coaprovel-300-12-5',
  name: 'Coaprovel 300/12.5 mg 14 tab.',
  genericName: 'Irbesartan + Hydrochlorothiazide',
  concentration: '300mg / 12.5mg',
  price: 140,
  matchKeywords: [
    'hypertension', 'coaprovel', 'sanofi', 'high dose',
    'كوابروفيل', 'سانوفي', 'جرعة عالية', 'اربيسارتان ٣٠٠'
  ],
  usage: 'الجرعة المضاعفة من الإربيسارتان (٣٠٠ مجم) مع مدر للبول. لضبط الضغط الذي لم يستجب لتركيز ١٥٠ مجم.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٣٠٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'قد يسبب الدوار عند الوقوف المفاجئ (Orthostatic hypotension).',
    'يجب التأكد من عدم وجود جفاف قبل البدء في العلاج.'
  ]
},

// 83. Co-Tareg 160/25mg 15 f.c. tabs.
{
  id: 'co-tareg-160-25',
  name: 'Co-Tareg 160/25mg 15 f.c. tabs.',
  genericName: 'Valsartan + Hydrochlorothiazide',
  concentration: '160mg / 25mg',
  price: 91.5,
  matchKeywords: [
    'hypertension', 'co-tareg', 'novartis', 'high diuretic',
    'كوتارج', 'نوفارتس', 'مدر عالي', 'فالسارتان'
  ],
  usage: 'المستحضر الأصلي (نوفارتس). يحتوي على جرعة عالية من مدر البول (٢٥ مجم) للسيطرة على احتباس السوائل والضغط.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٦٠ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'قد يؤدي إلى نقص البوتاسيوم وارتفاع حمض اليوريك.',
    'العبوة تحتوي على ١٥ قرصاً.'
  ]
},

// 84. Co-Tareg 320/12.5mg 14 f.c. tabs.
{
  id: 'co-tareg-320-12-5',
  name: 'Co-Tareg 320/12.5mg 14 f.c. tabs.',
  genericName: 'Valsartan + Hydrochlorothiazide',
  concentration: '320mg / 12.5mg',
  price: 222,
  matchKeywords: [
    'hypertension', 'co-tareg', 'max valsartan',
    'كوتارج', 'فالسارتان ٣٢٠', 'اقصى جرعة فالسارتان'
  ],
  usage: 'يحتوي على الجرعة القصوى من الفالسارتان (٣٢٠ مجم) لحماية القلب والأوعية، مع جرعة مدر للبول قياسية.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 60,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٣٢٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يجب الحذر من هبوط الضغط عند استخدامه لكبار السن.'
  ]
},

// 85. Co-Tareg 320/25mg 14 f.c. tab.
{
  id: 'co-tareg-320-25',
  name: 'Co-Tareg 320/25mg 14 f.c. tab.',
  genericName: 'Valsartan + Hydrochlorothiazide',
  concentration: '320mg / 25mg',
  price: 198,
  matchKeywords: [
    'hypertension', 'co-tareg', 'max dose', 'resistant hypertension',
    'كوتارج', 'أقصى جرعة', 'ضغط مقاوم', 'نوفارتس'
  ],
  usage: 'أقوى تركيز في عائلة كوتارج (٣٢٠ فالسارتان + ٢٥ مدر). يستخدم لحالات الضغط المرتفع جداً والمقاوم للعلاج.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 60,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٣٢٠ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'خطر حدوث الجفاف واضطراب الأملاح مرتفع.',
    'يجب مراقبة وظائف الكلى بدقة.'
  ]
},

// 86. Loraz Forte 100/25mg 28 tab.
{
  id: 'loraz-forte-100-25',
  name: 'Loraz Forte 100/25mg 28 tab.',
  genericName: 'Losartan + Hydrochlorothiazide',
  concentration: '100mg / 25mg',
  price: 108,
  matchKeywords: [
    'hypertension', 'loraz forte', 'losartan', 'gout',
    'لوراز فورت', 'لوسارتان', 'نقرس', 'ضغط'
  ],
  usage: 'الجرعة القصوى من اللوسارتان ومدر البول. مثالي لمرضى الضغط والنقرس.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠٠ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يجب التأكد من عدم وجود حساسية لمركبات السلفا.'
  ]
},

// 87. Sedoretic 12.5/20mg 10 tabs.
{
  id: 'sedoretic-12-5-20',
  name: 'Sedoretic 12.5/20mg 10 tabs.',
  genericName: 'Lisinopril + Hydrochlorothiazide',
  concentration: '20mg / 12.5mg',
  price: 13,
  matchKeywords: [
    'hypertension', 'sedoretic', 'ace inhibitor', 'cheap',
    'سيدوريتك', 'ليزينوبريل', 'رخيص جدا', 'ضغط'
  ],
  usage: 'علاج ثنائي كلاسيكي للضغط (ليزينوبريل + مدر للبول). سعر اقتصادي جداً (١٣ جنيه).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'قد يسبب سعالاً جافاً (Dry Cough).',
    'يمنع استخدامه للحوامل.',
    'نظراً لسعره المنخفض، يعتبر خياراً أساسياً في المستشفيات والوحدات الصحية، لكن يجب مراقبة الأعراض الجانبية.'
  ]
},

// 88. Yostiretic 30 tab.
{
  id: 'yostiretic-30-tab',
  name: 'Yostiretic 30 tab.',
  genericName: 'Amiloride + Hydrochlorothiazide',
  concentration: '5mg / 50mg',
  price: 12,
  matchKeywords: [
    'edema', 'yostiretic', 'moduretic generic', 'potassium sparing', 'cheap',
    'يوستيريتك', 'موديوريتك', 'رخيص', 'تورم', 'مدر للبول'
  ],
  usage: 'مدر للبول مركب (شبيه بـ Moduretic). يحتوي على (Amiloride) الحافظ للبوتاسيوم، وجرعة عالية جداً من (Hydrochlorothiazide 50mg). يستخدم أساساً لعلاج التورم (Edema) واحتباس السوائل.',
  timing: 'مرة يومياً – مزمن',
  category: Category.DIURETIC,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم / ٥٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يجب الحذر من ارتفاع البوتاسيوم في الدم (Hyperkalemia) بسبب وجود الأميلوريد، خاصة لمرضى الكلى.',
    'يمنع استخدام بدائل الملح التي تحتوي على البوتاسيوم.',
    'سعره رخيص جداً (١٢ جنيه للعبوة ٣٠ قرص)، مما يجعله شائع الاستخدام ولكن يجب الحذر من قوته.'
  ]
},
// 89. Bisolock-D 10/25mg 20 f.c.tab.
{
  id: 'bisolock-d-10-25',
  name: 'Bisolock-D 10/25mg 20 f.c.tab.',
  genericName: 'Bisoprolol + Hydrochlorothiazide',
  concentration: '10mg / 25mg',
  price: 62,
  matchKeywords: [
    'hypertension', 'bisolock', 'high dose', 'beta blocker',
    'بيزولوك دي', 'بيزوبرولول ١٠', 'مدر عالي', 'ضغط'
  ],
  usage: 'يحتوي على أقصى جرعة من البيزوبرولول (١٠ مجم) للتحكم في ضربات القلب، وأقصى جرعة من مدر البول (٢٥ مجم) لضبط الضغط المرتفع جداً.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع التوقف المفاجئ عن الدواء لتجنب الانتكاسة القلبية.',
    'خطر ارتفاع السكر وحمض اليوريك وارد بسبب جرعة الثيازيد العالية.',
    'يمنع لمرضى الربو الشعبي وبطء القلب الشديد.'
  ]
},

// 90. Co-Dilatrol 30 tab.
{
  id: 'co-dilatrol-30',
  name: 'Co-Dilatrol 30 tab.',
  genericName: 'Carvedilol + Hydrochlorothiazide',
  concentration: '25mg / 12.5mg',
  price: 75,
  matchKeywords: [
    'hypertension', 'heart failure', 'co-dilatrol', 'carvedilol',
    'كوديلاتيرول', 'كارفيديلول', 'فشل القلب', 'ضغط'
  ],
  usage: 'تركيبة قوية تجمع بين الكارفيديلول (مغلق لمستقبلات ألفا وبيتا) ومدر للبول. مفيد جداً لمرضى ارتفاع الضغط المصحوب بضعف عضلة القلب.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٥ مجم / ١٢.٥ مجم مرة يومياً مع الأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع لمرضى حساسية الصدر (الربو) وضيق الشعب الهوائية.',
    'قد يسبب هبوطاً ملحوظاً في الضغط عند الوقوف (Orthostatic Hypotension).',
    'لا يوقف فجأة.'
  ]
},

// 91. Nebilet Plus 5/25mg 14 tab.
{
  id: 'nebilet-plus-5-25',
  name: 'Nebilet Plus 5/25mg 14 tab.',
  genericName: 'Nebivolol + Hydrochlorothiazide',
  concentration: '5mg / 25mg',
  price: 101,
  matchKeywords: [
    'hypertension', 'nebilet plus', 'menarini', 'high diuretic',
    'نيبيليت بلس', 'نيبفولول', 'مدر عالي', 'ضغط'
  ],
  usage: 'المستحضر الأصلي (Brand). يجمع بين النيبفولول (الذي يوسع الأوعية الدموية) وجرعة عالية من مدر البول (٢٥ مجم) لفاعلية قصوى.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع التوقف المفاجئ.',
    'يجب شرب كميات كافية من الماء.',
    'يجب متابعة وظائف الكلى والسكر.'
  ]
},

// 92. Hyzaar 50/12.5mg 14 f.c. tab.
{
  id: 'hyzaar-50-12-5',
  name: 'Hyzaar 50/12.5mg 14 f.c. tab.',
  genericName: 'Losartan + Hydrochlorothiazide',
  concentration: '50mg / 12.5mg',
  price: 83,
  matchKeywords: [
    'hypertension', 'hyzaar', 'merck', 'original', 'losartan',
    'هايزيد', 'هايزاار', 'ميرك', 'لوسارتان', 'الاصلي'
  ],
  usage: 'المستحضر الأصلي للوسارتان مع مدر للبول. الخيار الأمثل لمرضى الضغط والنقرس (Uricosuric effect).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل (فئة D).',
    'سعره مرتفع نسبياً لعبوة ١٤ قرص.',
    'يجب متابعة وظائف الكلى.'
  ]
},

// 93. Valsatens Plus 160/12.5mg 30 tab
{
  id: 'valsatens-plus-160-12-5',
  name: 'Valsatens Plus 160/12.5mg 30 tab',
  genericName: 'Valsartan + Hydrochlorothiazide',
  concentration: '160mg / 12.5mg',
  price: 117,
  matchKeywords: [
    'hypertension', 'valsatens', 'valsartan', 'generic co-tareg',
    'فالسارتينس بلس', 'فالسارتان', 'بديل كوتارج', 'ضغط'
  ],
  usage: 'بديل اقتصادي وفعال للكوتارج. يحتوي على ١٦٠ مجم فالسارتان لضبط الضغط وحماية القلب.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٦٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يجب التأكد من عدم وجود جفاف.'
  ]
},

// 94. Valsatens Plus 80/12.5mg 30 f.c. tab.
{
  id: 'valsatens-plus-80-12-5',
  name: 'Valsatens Plus 80/12.5mg 30 f.c. tab.',
  genericName: 'Valsartan + Hydrochlorothiazide',
  concentration: '80mg / 12.5mg',
  price: 69,
  matchKeywords: [
    'hypertension', 'valsatens', 'start dose', 'cheap',
    'فالسارتينس بلس', 'سعر اقتصادي', 'بداية العلاج'
  ],
  usage: 'جرعة بداية اقتصادية جداً (فالسارتان ٨٠ مجم). مناسب للمرضى الذين يحتاجون لعلاج ثنائي بتكلفة منخفضة.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٨٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يجب متابعة قياس الضغط للتأكد من كفاية الجرعة.'
  ]
},

// 95. Amlosazide 10/25/40mg 10 f.c. tabs
{
  id: 'amlosazide-10-25-40-10-v2',
  name: 'Amlosazide 10/25/40mg 10 f.c. tabs',
  genericName: 'Olmesartan + Amlodipine + Hydrochlorothiazide',
  concentration: '40mg / 10mg / 25mg',
  price: 141,
  matchKeywords: [
    'hypertension', 'amlosazide', 'max dose', 'resistant hypertension',
    'املوسازيد', 'أقصى جرعة', 'ضغط مقاوم', 'ثلاثي'
  ],
  usage: 'الجرعة الثلاثية القصوى (أولميسارتان ٤٠ + أملوديبين ١٠ + هيدروكلوروثيازيد ٢٥). للحالات المستعصية جداً.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 60,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٤٠ مجم / ١٠ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'خطر حدوث هبوط حاد في الضغط واضطراب في وظائف الكلى.',
    'يجب الانتباه لأي أعراض إسهال مزمن.'
  ]
},

// 96. Coaprovel 300/25mg 14 f.c.tab.
{
  id: 'coaprovel-300-25',
  name: 'Coaprovel 300/25mg 14 f.c.tab.',
  genericName: 'Irbesartan + Hydrochlorothiazide',
  concentration: '300mg / 25mg',
  price: 150,
  matchKeywords: [
    'hypertension', 'coaprovel', 'sanofi', 'max dose',
    'كوابروفيل', 'أقصى جرعة', 'اربيسارتان', 'ضغط'
  ],
  usage: 'المستحضر الأصلي (سانوفي) بأقصى تركيز للإربيسارتان ومدر البول. يوفر حماية قوية للكلى مع خفض قوي للضغط.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 60,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٣٠٠ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'قد يسبب الدوار عند الوقوف.',
    'يجب مراقبة مستويات البوتاسيوم ووظائف الكلى.'
  ]
},

// 97. Lisitens 12.5/20mg 30 tab.
{
  id: 'lisitens-12-5-20',
  name: 'Lisitens 12.5/20mg 30 tab.',
  genericName: 'Lisinopril + Hydrochlorothiazide',
  concentration: '20mg / 12.5mg',
  price: 79.5,
  matchKeywords: [
    'hypertension', 'lisitens', 'zestoretic generic', 'ace inhibitor',
    'ليزيتنس', 'ليزينوبريل', 'بديل زيستوريتك', 'ضغط'
  ],
  usage: 'بديل اقتصادي للزيستوريتك. علاج فعال للضغط وحماية القلب.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'قد يسبب سعالاً جافاً (Dry Cough).',
    'احتمالية حدوث تورم في الوجه (Angioedema) نادرة ولكن خطيرة.'
  ]
},
// 98. Losar Plus 8 f.c. tab
{
  id: 'losar-plus-8',
  name: 'Losar Plus 8 f.c. tab',
  genericName: 'Losartan + Hydrochlorothiazide',
  concentration: '50mg / 12.5mg',
  price: 34,
  matchKeywords: [
    'hypertension', 'losar plus', 'orchidia', 'small pack', 'gout',
    'لوزار بلس', 'اوركيد', 'عبوة صغيرة', 'شريط واحد', 'نقرس'
  ],
  usage: 'علاج ثنائي لضغط الدم (لوسارتان + مدر للبول). اللوسارتان خيار مفضل لمرضى الضغط المصابين بارتفاع حمض اليوريك (النقرس).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل (فئة D).',
    'يجب التأكد من عدم وجود جفاف قبل البدء في العلاج.',
    'قد يسبب الدوار في الأيام الأولى.'
  ]
},

// 99. Valsatens Plus 160/25mg 30 f.c. tab.
{
  id: 'valsatens-plus-160-25',
  name: 'Valsatens Plus 160/25mg 30 f.c. tab.',
  genericName: 'Valsartan + Hydrochlorothiazide',
  concentration: '160mg / 25mg',
  price: 156,
  matchKeywords: [
    'hypertension', 'valsatens', 'high diuretic',
    'فالسارتينس بلس', 'مدر عالي', 'فالسارتان', 'ضغط'
  ],
  usage: 'يحتوي على جرعة عالية من مدر البول (٢٥ مجم) مع فالسارتان. مناسب لمرضى الضغط الذين يعانون من احتباس السوائل.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٦٠ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'الجرعة العالية من المدر (٢٥ مجم) قد ترفع مستويات السكر وحمض اليوريك.',
    'يجب مراقبة وظائف الكلى بانتظام.'
  ]
},

// 100. Angioblock 150/12.5 mg 21 f.c. tabs.
{
  id: 'angioblock-150-12-5-21',
  name: 'Angioblock 150/12.5 mg 21 f.c. tabs.',
  genericName: 'Irbesartan + Hydrochlorothiazide',
  concentration: '150mg / 12.5mg',
  price: 81,
  matchKeywords: [
    'hypertension', 'angioblock', 'irbesartan', '3 weeks',
    'انجيوبلوك', 'اربيسارتان', 'عبوة ٢١', 'ضغط'
  ],
  usage: 'علاج ثنائي لضغط الدم يحتوي على إربيسارتان (حماية للكلى) ومدر للبول. (عبوة ٢١ قرص تكفي ٣ أسابيع).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٥٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يجب التأكد من توفر العبوة التالية قبل انتهاء الشريط لضمان استمرار العلاج دون انقطاع.'
  ]
}
];

