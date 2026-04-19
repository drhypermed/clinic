
import { Medication, Category } from '../../../types';

export const CALCIUM_CHANNEL_BLOCKERS_MEDS: Medication[] = [
  // 1. Erastapex Trio 5/20/12.5mg 30 f.c. tab
{
  id: 'windipine-10-tab',
  name: 'Windipine 10mg 30 tab',
  genericName: 'Amlodipine',
  concentration: '10mg',
  price: 33,
  matchKeywords: [
    'hypertension', 'angina', 'amlodipine', 'windipine', 'calcium channel blocker', 'ccb', 'dihydropyridine',
    'وينديبين', 'أملوديبين', 'ضغط', 'ذبحة صدرية', 'توسيع الشرايين', 'ضغط عالي', 'ضغط مرتفع'
  ],
  usage: 'علاج ارتفاع ضغط الدم (الجرعة القصوى) والذبحة الصدرية المستقرة.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 72, // 6 years
  maxAgeMonths: 1200,
  minWeight: 20,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) { // Adults
      return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 72) { // Children 6-17 years
      return 'الجرعة عالية للأطفال. يفضل البدء بتركيز ٢.٥ مجم أو ٥ مجم. يستخدم الـ ١٠ مجم فقط في الحالات الشديدة جداً حسب التشخيص.';
    } else {
      return 'غير موصى به للأطفال أقل من ٦ سنوات.';
    }
  },

  warnings: [
    'قد يسبب تورم في الكاحلين (Ankle Edema) كعرض جانبي شائع ولكنه غير خطير - يزداد مع الجرعة العالية (١٠ مجم).',
    'يستخدم بحذر مع مرضى فشل القلب الاحتقاني.',
    'لا يسبب كحة جافة عكس أدوية الـ ACE inhibitors.',
    'قد يسبب صداعاً واحمراراً في الوجه (Flushing) في بداية الاستخدام.'
  ]
},

// 3. Windipine 5mg 30 tab
{
  id: 'windipine-5-tab',
  name: 'Windipine 5mg 30 tab',
  genericName: 'Amlodipine',
  concentration: '5mg',
  price: 21,
  matchKeywords: [
    'hypertension', 'angina', 'amlodipine', 'windipine', 'calcium channel blocker',
    'وينديبين ٥', 'أملوديبين', 'ضغط', 'وقاية من الذبحة'
  ],
  usage: 'علاج أولي لارتفاع ضغط الدم وللوقاية من نوبات الذبحة الصدرية.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 72, // 6 years
  maxAgeMonths: 1200,
  minWeight: 20,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) { // Adults
      return '١ قرص ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 72) { // Children 6-17 years
      return 'الجرعة المعتادة للأطفال: ٢.٥ مجم إلى ٥ مجم مرة واحدة يومياً.';
    } else {
      return 'غير موصى به للأطفال أقل من ٦ سنوات.';
    }
  },

  warnings: [
    'قد يسبب صداع بسيط أو احمرار في الوجه في بداية الاستخدام.',
    'آمن لمرضى الربو الشعبي (لا يسبب ضيق تنفس).',
    'تورم القدمين عرض وارد ويختفي غالباً عند تقليل الجرعة أو رفع القدمين.'
  ]
},

// 4. Erastapex Trio 5/40/12.5mg 30 f.c. tabs
{
  id: 'alkapress-5-tab',
  name: 'Alkapress 5mg 20 tab',
  genericName: 'Amlodipine',
  concentration: '5mg',
  price: 58,
  matchKeywords: [
    'hypertension', 'amlodipine', 'alkapress', 'ccb',
    'الكابرس', 'أملوديبين', 'ضغط', 'نورفاسك جينيرك'
  ],
  usage: 'السيطرة على ضغط الدم المرتفع وتوسيع الشرايين التاجية.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 72, 
  maxAgeMonths: 1200,
  minWeight: 20,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) { 
      return '١ قرص ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 72) { 
      return 'للأطفال (٦-١٧ سنة): الجرعة تتراوح بين ٢.٥ مجم إلى ٥ مجم يومياً.';
    } else {
      return 'غير مخصص للأطفال أقل من ٦ سنوات.';
    }
  },

  warnings: [
    'انتبه: سعره أعلى نسبياً من بدائل أخرى لنفس المادة الفعالة.',
    'قد يسبب خفقان (زيادة ضربات القلب) بسيط في البداية.',
    'آمن تماماً على وظائف الكلى.'
  ]
},

// 6. Alkapress Plus 5/160mg 14 f.c. tabs
{
  id: 'alkapress-plus-5-160',
  name: 'Alkapress Plus 5/160mg 14 f.c. tabs',
  genericName: 'Amlodipine + Valsartan',
  concentration: '5mg / 160mg',
  price: 80,
  matchKeywords: [
    'hypertension', 'alkapress plus', 'valsartan', 'amlodipine', 'combo',
    'الكابرس بلس', 'فالسارتان', 'ضغط', 'علاج ثنائي'
  ],
  usage: 'علاج ثنائي لضغط الدم؛ يجمع بين توسيع الشرايين (Amlodipine) ومنع انقباضها (Valsartan).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) { 
      return '١ قرص ٥ مجم / ١٦٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'لا يفضل استخدامه للأطفال (أقل من ١٨ سنة) إلا بتوصية استشاري قلب.';
    }
  },

  warnings: [
    'ممنوع للحامل (Category D - Valsartan يسبب تشوهات وموت الجنين).',
    'يجب متابعة وظائف الكلى والبوتاسيوم (Valsartan قد يرفع البوتاسيوم).',
    'أقل عرضة لتورم القدمين مقارنة بالأملوديبين لوحده.',
    'لا تستخدمه مع مثبطات الإنزيم المحول (ACE Inhibitors) لتجنب الفشل الكلوي.'
  ]
},

// 7. Blokatens 10/160mg 28 f.c. tabs
{
  id: 'blokatens-10-160',
  name: 'Blokatens 10/160mg 28 f.c. tabs',
  genericName: 'Amlodipine + Valsartan',
  concentration: '10mg / 160mg',
  price: 160,
  matchKeywords: [
    'hypertension', 'blokatens', 'valsartan', 'exforge generic',
    'بلوكاتنس', 'ضغط عالي', 'بديل اكسفورج', 'فالسارتان'
  ],
  usage: 'للضغط المرتفع الذي لم يستجب للجرعات الأقل (يحتوي على ١٠ مجم أملوديبين).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) { 
      return '١ قرص ١٠ مجم / ١٦٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'ممنوع للأطفال.';
    }
  },

  warnings: [
    'احتمالية تورم القدمين تزيد مع جرعة ١٠ مجم أملوديبين.',
    'ممنوع استخدامه مع مثبطات ACE (مثل الكاباتوبريل) لتجنب الفشل الكلوي.',
    'ممنوع للحامل.'
  ]
},

// 8. Erastapex Co 10/40mg 30 f.c. tabs
{
  id: 'erastapex-co-10-40',
  name: 'Erastapex Co 10/40mg 30 f.c. tabs',
  genericName: 'Amlodipine + Olmesartan',
  concentration: '10mg / 40mg',
  price: 165,
  matchKeywords: [
    'hypertension', 'erastapex co', 'olmesartan', 'high dose',
    'اراستابكس كو', 'ضغط', 'اولميسارتان', 'أقصى جرعة'
  ],
  usage: 'أقصى قوة في هذه الفئة (بدون مدر بول) لعلاج الضغط المرتفع العنيد.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) { 
      return '١ قرص ١٠ مجم / ٤٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'ممنوع للأطفال.';
    }
  },

  warnings: [
    'قد يسبب صداع أو دوار شديد في الأيام الأولى.',
    'ممنوع للحامل.',
    'يجب التأكد من عدم وجود جفاف قبل البدء في الجرعات العالية.'
  ]
},

// 9. Erastapex Co 5/20mg 30 f.c. tabs
{
  id: 'erastapex-co-5-20',
  name: 'Erastapex Co 5/20mg 30 f.c. tabs',
  genericName: 'Amlodipine + Olmesartan',
  concentration: '5mg / 20mg',
  price: 114,
  matchKeywords: [
    'hypertension', 'erastapex co', 'start dose',
    'اراستابكس كو', 'بداية العلاج', 'ضغط متوسط'
  ],
  usage: 'بداية ممتازة للعلاج الثنائي لمرضى الضغط الذين لا يكفيهم دواء واحد.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) { 
      return '١ قرص ٥ مجم / ٢٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'ممنوع للأطفال.';
    }
  },

  warnings: [
    'ممنوع للحامل.',
    'نادراً ما يسبب اضطرابات معوية (Sprue-like enteropathy) مرتبطة بالأولميسارتان (إسهال شديد وفقدان وزن) - أعد التقييم فوراً في هذه الحالة.'
  ]
},

// 10. Erastapex Co 5/40mg 30 f.c. tabs
{
  id: 'erastapex-co-5-40',
  name: 'Erastapex Co 5/40mg 30 f.c. tabs',
  genericName: 'Amlodipine + Olmesartan',
  concentration: '5mg / 40mg',
  price: 144,
  matchKeywords: [
    'hypertension', 'erastapex co', 'olmesartan 40',
    'اراستابكس كو', 'ضغط', 'جرعة متوسطة'
  ],
  usage: 'للتحكم الإضافي في الضغط عن طريق زيادة جرعة الأولميسارتان مع تثبيت الأملوديبين.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) { 
      return '١ قرص ٥ مجم / ٤٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'ممنوع للأطفال.';
    }
  },

  warnings: [
    'ممنوع للحامل.',
    'يجب الحذر عند وصفه لكبار السن لتجنب الهبوط المفاجئ.',
    'يفضل متابعة وظائف الكلى دورياً.'
  ]
},
// 11. Erastapex trio 10/40/25mg 30 f.c. tabs.
{
  id: 'erastapex-trio-10-40-25',
  name: 'Erastapex trio 10/40/25mg 30 f.c. tabs.',
  genericName: 'Amlodipine + Olmesartan + Hydrochlorothiazide',
  concentration: '10mg / 40mg / 25mg',
  price: 162,
  matchKeywords: [
    'hypertension', 'resistant hypertension', 'erastapex trio', 'max dose', 'olmesartan',
    'اراستابكس تريو', 'ضغط عالي جدا', 'اقصى جرعة', 'ثلاثي', 'مدر للبول'
  ],
  usage: 'أقوى تركيز في هذه المجموعة لعلاج ضغط الدم المقاوم للعلاجات الأخرى (الجرعة القصوى من المكونات الثلاثة).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, // 18 years
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠ مجم / ٤٠ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'ممنوع تماماً للأطفال والمراهقين.';
    }
  },

  warnings: [
    'خطر حدوث جفاف وهبوط حاد في الضغط لكبار السن.',
    'ممنوع للحامل (Category D).',
    'يجب التأكد من وظائف الكلى (Creatinine) قبل صرف هذه الجرعة العالية.'
  ]
},

// 12. Exforge 10mg/160mg 14 f.c. tab.
{
  id: 'exforge-10-160',
  name: 'Exforge 10mg/160mg 14 f.c. tab.',
  genericName: 'Amlodipine + Valsartan',
  concentration: '10mg / 160mg',
  price: 218,
  matchKeywords: [
    'hypertension', 'exforge', 'novartis', 'valsartan', 'original',
    'اكسفورج', 'فالسارتان', 'ضغط', 'نوفارتس', 'المستورد'
  ],
  usage: 'علاج قوي لضغط الدم (المنتج الأصلي) يجمع بين أملوديبين (أقصى جرعة) وفالسارتان.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠ مجم / ١٦٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'غير مصرح به للأطفال.';
    }
  },

  warnings: [
    'السعر مرتفع مقارنة بالبدائل المحلية.',
    'قد يسبب تورم القدمين (Ankle Edema) بسبب جرعة الأملوديبين ١٠ مجم.',
    'ممنوع للحامل.'
  ]
},

// 13. Exforge 5mg/160mg 14 f.c. tab.
{
  id: 'exforge-5-160',
  name: 'Exforge 5mg/160mg 14 f.c. tab.',
  genericName: 'Amlodipine + Valsartan',
  concentration: '5mg / 160mg',
  price: 218,
  matchKeywords: [
    'hypertension', 'exforge', 'novartis', 'valsartan',
    'اكسفورج ٥', 'ضغط', 'نوفارتس'
  ],
  usage: 'علاج ثنائي للضغط (المنتج الأصلي) بجرعة أملوديبين متوسطة لتقليل الآثار الجانبية.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم / ١٦٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'غير مصرح به للأطفال.';
    }
  },

  warnings: [
    'ممنوع للحامل.',
    'يجب الحذر عند استخدامه مع بدائل البوتاسيوم (Potassium supplements) لأن الفالسارتان يحفظ البوتاسيوم.'
  ]
},

// 14. Exforge hct 10/160/25mg 14 f.c. tab
{
  id: 'exforge-hct-10-160-25',
  name: 'Exforge hct 10/160/25mg 14 f.c. tab',
  genericName: 'Amlodipine + Valsartan + Hydrochlorothiazide',
  concentration: '10mg / 160mg / 25mg',
  price: 270,
  matchKeywords: [
    'hypertension', 'exforge hct', 'triple therapy', 'severe htn',
    'اكسفورج اتش سي تي', 'ضغط ثلاثي', 'مدر للبول', 'نوفارتس'
  ],
  usage: 'علاج ثلاثي قوي جداً (المنتج الأصلي) لحالات الضغط الشديدة والمعقدة.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠ مجم / ١٦٠ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'ممنوع للأطفال.';
    }
  },

  warnings: [
    'أغلى دواء في هذه القائمة، تأكد من قدرة المريض المادية.',
    'ممنوع للحامل.',
    'يجب متابعة وظائف الكلى والبوتاسيوم والصوديوم بانتظام.'
  ]
},

// 15. Exforge hct 5/160/12.5mg 14 f.c. tab
{
  id: 'exforge-hct-5-160-12-5',
  name: 'Exforge hct 5/160/12.5mg 14 f.c. tab',
  genericName: 'Amlodipine + Valsartan + Hydrochlorothiazide',
  concentration: '5mg / 160mg / 12.5mg',
  price: 270,
  matchKeywords: [
    'hypertension', 'exforge hct', 'triple therapy', 'start dose',
    'اكسفورج اتش سي تي', 'ضغط', 'بداية الثلاثي'
  ],
  usage: 'بداية العلاج الثلاثي (المنتج الأصلي) بجرعات متوازنة.',
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
      return 'ممنوع للأطفال.';
    }
  },

  warnings: [
    'السعر مرتفع.',
    'ممنوع للحامل.',
    'قد يسبب دوار عند الوقوف (Orthostatic Hypotension).'
  ]
},

// 16. Isoptin 80 mg 30 f.c. tabs.
{
  id: 'isoptin-80',
  name: 'Isoptin 80 mg 30 f.c. tabs.',
  genericName: 'Verapamil',
  concentration: '80mg',
  price: 50,
  matchKeywords: [
    'angina', 'arrhythmia', 'svt', 'hypertension', 'verapamil', 'isoptin',
    'ايزوبتن', 'فيراباميل', 'تسارع ضربات القلب', 'ذبحة', 'عدم انتظام الضربات'
  ],
  usage: 'يختلف عن باقي القائمة: يستخدم لعلاج الضغط، الذبحة الصدرية، وبعض أنواع تسارع ضربات القلب (SVT). يقلل ضربات القلب.',
  timing: '٣ مرات يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE, // Also Antiarrhythmic
  form: 'Film-coated Tablet',

  minAgeMonths: 12, // Can be used in peds for arrhythmias under expert supervision, but here restricted for safety
  maxAgeMonths: 1200,
  minWeight: 10,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 144) { // 12 years+ & Adults
      return '١ قرص ٨٠ مجم ٣ مرات يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'للأطفال: يحسب بجرعة ٤-٨ مجم/كجم يومياً مقسمة على ٣ جرعات، ولكن يمنع صرفه إلا بروشتة استشاري قلب أطفال.';
    }
  },

  warnings: [
    'هام جداً: يسبب إمساك شديد (Constipation) كأشهر عرض جانبي.',
    'ممنوع تماماً لمرضى ضعف عضلة القلب الشديد (Heart Failure) أو بطء القلب (Bradycardia).',
    'لا يخلط مع الـ Beta-blockers (مثل الكونكور) إلا بحذر شديد جداً لتجنب توقف القلب.'
  ]
},

// 17. Isoptin retard 240mg 30 f.c.tab.
{
  id: 'isoptin-retard-240',
  name: 'Isoptin retard 240mg 30 f.c.tab.',
  genericName: 'Verapamil',
  concentration: '240mg',
  price: 170,
  matchKeywords: [
    'hypertension', 'angina', 'prophylaxis', 'verapamil sr', 'isoptin',
    'ايزوبتن ريتارد', 'ممتد المفعول', 'وقاية من الصداع النصفي'
  ],
  usage: 'أقراص ممتدة المفعول لعلاج الضغط والذبحة والوقاية من الصداع النصفي (Migraine Prophylaxis).',
  timing: 'مرتين يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'F.C. Tablets',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٤٠ مجم مرتين يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'غير مخصص للأطفال.';
    }
  },

  warnings: [
    'يسبب الإمساك بشكل ملحوظ، ينصح بالإكثار من الألياف والسوائل.',
    'ممنوع مع عصير الجريب فروت.',
    'يحظر استخدامه مع مرضى فشل القلب الاحتقاني.'
  ]
},

// 18. Norvasc 10mg 15 tab.
{
  id: 'norvasc-10-tab',
  name: 'Norvasc 10mg 15 tab.',
  genericName: 'Amlodipine',
  concentration: '10mg',
  price: 96,
  matchKeywords: [
    'hypertension', 'angina', 'norvasc', 'pfizer', 'original',
    'نورفاسك', 'فايزر', 'أملوديبين', 'الأصلي'
  ],
  usage: 'الدواء الأصلي (Brand) لمادة الأملوديبين. المعيار الذهبي لعلاج الضغط والذبحة الصدرية.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 72, // 6 years
  maxAgeMonths: 1200,
  minWeight: 20,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 72) {
      return 'للأطفال (٦-١٧ سنة): الجرعة القصوى ٥ مجم، يستخدم الـ ١٠ مجم فقط في حالات نادرة جداً ومقاومة.';
    } else {
      return 'غير موصى به للأطفال أقل من ٦ سنوات.';
    }
  },

  warnings: [
    'تورم الكاحلين (Edema) عرض جانبي شائع جداً مع تركيز ١٠ مجم.',
    'سعره مرتفع مقارنة بالجينيرك (المثيل) ولكنه موثوق الفعالية.',
    'آمن لمرضى السكر والربو.'
  ]
},

// 19. Alkapress trio 5/160/25mg 14 f.c. tabs.
{
  id: 'lezberg-trio-20-5-12-5',
  name: 'Lezberg trio 20/5/12.5mg 30 f.c.tabs.',
  genericName: 'Olmesartan + Amlodipine + Hydrochlorothiazide',
  concentration: '20mg / 5mg / 12.5mg',
  price: 114,
  matchKeywords: [
    'hypertension', 'lezberg', 'triple therapy', 'low dose triple',
    'ليزبرج', 'اراستابكس بديل', 'ثلاثي مخفف'
  ],
  usage: 'تركيبة ثلاثية بجرعات "خفيفة". مثالية كبداية للعلاج الثلاثي لمن لا يتحمل الجرعات العالية.',
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
      return 'ممنوع للأطفال.';
    }
  },

  warnings: [
    'ممنوع للحامل.',
    'يستخدم بحذر مع كبار السن.',
    'يراعى شرب الماء باعتدال.'
  ]
},
// 21. Alkapress 10mg 30 tab
{
  id: 'alkapress-10-tab',
  name: 'Alkapress 10mg 30 tab',
  genericName: 'Amlodipine',
  concentration: '10mg',
  price: 108,
  matchKeywords: [
    'hypertension', 'angina', 'alkapress', 'amlodipine', 'generic norvasc',
    'الكابرس', 'أملوديبين', 'ضغط عالي', 'جرعة قصوى'
  ],
  usage: 'الجرعة القصوى من الأملوديبين لعلاج الضغط المرتفع والذبحة الصدرية (بديل اقتصادي للنورفاسك).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 72, // 6 years
  maxAgeMonths: 1200,
  minWeight: 20,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 72) {
      return 'للأطفال: نادراً ما نحتاج لتركيز ١٠ مجم، يفضل البدء بـ ٢.٥ أو ٥ مجم.';
    } else {
      return 'غير موصى به للأطفال أقل من ٦ سنوات.';
    }
  },

  warnings: [
    'احتمالية تورم القدمين (Ankle Edema) عالية مع تركيز ١٠ مجم.',
    'قد يسبب صداع عابر في بداية الاستخدام.',
    'يستخدم بحذر مع مرضى هبوط عضلة القلب.'
  ]
},

// 22. Alkapress Plus 10/160mg 20 f.c. tabs
{
  id: 'alkapress-plus-10-160',
  name: 'Alkapress Plus 10/160mg 20 f.c. tabs',
  genericName: 'Amlodipine + Valsartan',
  concentration: '10mg / 160mg',
  price: 102,
  matchKeywords: [
    'hypertension', 'alkapress plus', 'valsartan', 'exforge generic',
    'الكابرس بلس', 'فالسارتان', 'ضغط مرتفع', 'ثنائي'
  ],
  usage: 'علاج ثنائي قوي (بديل Exforge) يحتوي على الجرعة القصوى من الأملوديبين مع الفالسارتان.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠ مجم / ١٦٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'ممنوع للأطفال والمراهقين.';
    }
  },

  warnings: [
    'ممنوع للحامل.',
    'يجب مراقبة وظائف الكلى والبوتاسيوم.',
    'تورم القدمين عرض وارد جداً بسبب الـ ١٠ مجم أملوديبين.'
  ]
},

// 23. Alkapress trio 5/160/12.5mg 14 f.c. tabs
{
  id: 'alkapress-trio-5-160-12-5',
  name: 'Alkapress trio 5/160/12.5mg 14 f.c. tabs',
  genericName: 'Amlodipine + Valsartan + Hydrochlorothiazide',
  concentration: '5mg / 160mg / 12.5mg',
  price: 97,
  matchKeywords: [
    'hypertension', 'alkapress trio', 'triple therapy', 'diuretic',
    'الكابرس تريو', 'ثلاثي', 'مدر للبول', 'اكسفورج بديل'
  ],
  usage: 'علاج ثلاثي متوازن (بديل Exforge HCT) بجرعة أملوديبين متوسطة لتقليل التورم.',
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
      return 'ممنوع للأطفال.';
    }
  },

  warnings: [
    'ممنوع للحامل.',
    'قد يسبب جفافاً بسيطاً، ينصح بشرب الماء.',
    'غير مناسب لمرضى النقرس (Gout) بسبب الهيدروكلوروثيازيد.'
  ]
},

// 24. Averothiazide 10/40/12.5mg 30 f.c. tab
{
  id: 'averothiazide-10-40-12-5',
  name: 'Averothiazide 10/40/12.5mg 30 f.c. tab',
  genericName: 'Amlodipine + Olmesartan + Hydrochlorothiazide',
  concentration: '10mg / 40mg / 12.5mg',
  price: 126,
  matchKeywords: [
    'hypertension', 'averothiazide', 'erastapex trio generic', 'strong',
    'افيروثيازيد', 'اولميسارتان', 'ضغط عالي', 'بديل اراستابكس'
  ],
  usage: 'علاج ثلاثي قوي جداً (بديل Erastapex Trio) بتركيز عالي من الأملوديبين والأولميسارتان.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠ مجم / ٤٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'ممنوع للأطفال.';
    }
  },

  warnings: [
    'ممنوع للحامل.',
    'خطر حدوث هبوط حاد في الضغط (Hypotension).',
    'قد يرفع وظائف الكلى قليلاً في البداية.'
  ]
},

// 25. Averothiazide 5/20/12.5mg 30 f.c. tabs
{
  id: 'averothiazide-5-20-12-5',
  name: 'Averothiazide 5/20/12.5mg 30 f.c. tabs',
  genericName: 'Amlodipine + Olmesartan + Hydrochlorothiazide',
  concentration: '5mg / 20mg / 12.5mg',
  price: 93,
  matchKeywords: [
    'hypertension', 'averothiazide', 'start triple',
    'افيروثيازيد', 'ثلاثي خفيف', 'بداية العلاج'
  ],
  usage: 'أخف جرعة في العلاج الثلاثي (بديل Erastapex Trio)، ممتازة كبداية لمن يحتاج ٣ مواد فعالة.',
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
      return 'ممنوع للأطفال.';
    }
  },

  warnings: [
    'ممنوع للحامل.',
    'يجب التأكد من عدم وجود حساسية لمركبات السلفا (بسبب الثيازيد).'
  ]
},

// 26. Averothiazide 5/40/12.5mg 30 f.c. tab
{
  id: 'averothiazide-5-40-12-5',
  name: 'Averothiazide 5/40/12.5mg 30 f.c. tab',
  genericName: 'Amlodipine + Olmesartan + Hydrochlorothiazide',
  concentration: '5mg / 40mg / 12.5mg',
  price: 123,
  matchKeywords: [
    'hypertension', 'averothiazide', 'olmesartan 40',
    'افيروثيازيد', 'اولميسارتان عالي', 'ضغط'
  ],
  usage: 'جرعة متوسطة القوة؛ تعتمد على زيادة الأولميسارتان (٤٠ مجم) مع إبقاء الأملوديبين منخفضاً (٥ مجم) لتجنب التورم.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم / ٤٠ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'ممنوع للأطفال.';
    }
  },

  warnings: [
    'ممنوع للحامل.',
    'يجب شرب السوائل بانتظام.'
  ]
},

// 27. Blokatens 5/160mg 28 f.c. tab
{
  id: 'blokatens-5-160',
  name: 'Blokatens 5/160mg 28 f.c. tab',
  genericName: 'Amlodipine + Valsartan',
  concentration: '5mg / 160mg',
  price: 150,
  matchKeywords: [
    'hypertension', 'blokatens', 'valsartan', 'exforge generic',
    'بلوكاتنس', 'فالسارتان', 'ضغط', 'ثنائي'
  ],
  usage: 'علاج ثنائي كلاسيكي للضغط (بديل Exforge) بجرعة متوازنة.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم / ١٦٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'ممنوع للأطفال.';
    }
  },

  warnings: [
    'ممنوع للحامل.',
    'آمن نسبياً من حيث الأعراض الجانبية مقارنة بالتركيزات الأعلى.'
  ]
},

// 28. Blokatens 5/80mg 28 f.c. tab
{
  id: 'blokatens-5-80',
  name: 'Blokatens 5/80mg 28 f.c. tab',
  genericName: 'Amlodipine + Valsartan',
  concentration: '5mg / 80mg',
  price: 122,
  matchKeywords: [
    'hypertension', 'blokatens', 'valsartan 80', 'low dose',
    'بلوكاتنس', 'جرعة خفيفة', 'فالسارتان ٨٠', 'ضغط لكبار السن'
  ],
  usage: 'أقل تركيز في هذه المجموعة. ممتاز لكبار السن أو كبداية للعلاج الثنائي.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم / ٨٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'ممنوع للأطفال.';
    }
  },

  warnings: [
    'ممنوع للحامل.',
    'يجب التأكد من عدم وجود حمل قبل البدء فيه.'
  ]
},

// 29. Norvasc 5mg 10 tab
{
  id: 'norvasc-5-tab',
  name: 'Norvasc 5mg 10 tab',
  genericName: 'Amlodipine',
  concentration: '5mg',
  price: 54,
  matchKeywords: [
    'hypertension', 'angina', 'norvasc', 'pfizer', 'original',
    'نورفاسك ٥', 'فايزر', 'الاصلي', 'أملوديبين'
  ],
  usage: 'النسخة الأصلية (Brand) بجرعة ٥ مجم. المعيار الذهبي لبداية علاج الضغط.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 72, // 6 years
  maxAgeMonths: 1200,
  minWeight: 20,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 72) {
      return 'للأطفال (٦-١٧ سنة): ٢.٥ مجم إلى ٥ مجم مرة واحدة يومياً.';
    } else {
      return 'غير موصى به للأطفال أقل من ٦ سنوات.';
    }
  },

  warnings: [
    'أقل عرضة لإحداث تورم القدمين مقارنة بجرعة الـ ١٠ مجم.',
    'السعر للقرص الواحد مرتفع مقارنة بالبدائل.'
  ]
},

// 30. Isoptin retard 240mg 20 f.c.tab
{
  id: 'isoptin-retard-240-20',
  name: 'Isoptin retard 240mg 20 f.c.tab',
  genericName: 'Verapamil',
  concentration: '240mg',
  price: 42,
  matchKeywords: [
    'hypertension', 'angina', 'migraine', 'verapamil', 'isoptin',
    'ايزوبتن ريتارد', 'فيراباميل', 'وقاية صداع نصفي', 'امساك'
  ],
  usage: 'قرص ممتد المفعول لعلاج الضغط والذبحة والوقاية من الصداع النصفي. (عبوة ٢٠ قرص).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'F.C. Tablets',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٤٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'غير مخصص للأطفال.';
    }
  },

  warnings: [
    'يسبب الإمساك (Constipation) بشكل ملحوظ جداً.',
    'ممنوع لمرضى فشل القلب الاحتقاني.',
    'يجب مراقبة النبض، إذا قل عن ٥٠ دقة/دقيقة يرجى إعادة التقييم.'
  ]
},
// 31. Lezberg-amlo 5/20mg 30 f.c. tabs.
{
  id: 'lezberg-amlo-5-20',
  name: 'Lezberg-amlo 5/20mg 30 f.c. tabs.',
  genericName: 'Amlodipine + Olmesartan',
  concentration: '5mg / 20mg',
  price: 99,
  matchKeywords: [
    'hypertension', 'lezberg', 'dual therapy', 'start dose',
    'ليزبرج املو', 'ضغط', 'ثنائي', 'بداية العلاج'
  ],
  usage: 'علاج ثنائي لضغط الدم؛ بداية ممتازة لمن لا يكفيهم دواء واحد، بجرعات أولية لتقليل الآثار الجانبية.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم / ٢٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'ممنوع للأطفال.';
    }
  },

  warnings: [
    'ممنوع للحامل (يسبب تشوهات).',
    'يراعى عدم وجود جفاف قبل البدء في العلاج.',
    'قد يسبب دواراً بسيطاً في أول أيام الاستخدام.'
  ]
},

// 32. Lezberg-amlo 5/40mg 30 f.c. tabs
{
  id: 'lezberg-amlo-5-40',
  name: 'Lezberg-amlo 5/40mg 30 f.c. tabs',
  genericName: 'Amlodipine + Olmesartan',
  concentration: '5mg / 40mg',
  price: 123,
  matchKeywords: [
    'hypertension', 'lezberg', 'olmesartan 40',
    'ليزبرج املو', 'اولميسارتان ٤٠', 'ضغط مرتفع'
  ],
  usage: 'علاج ثنائي يعتمد على قوة الأولميسارتان (٤٠ مجم) مع الحفاظ على الأملوديبين (٥ مجم) لتجنب تورم القدمين.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم / ٤٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'ممنوع للأطفال.';
    }
  },

  warnings: [
    'ممنوع للحامل.',
    'يجب متابعة وظائف الكلى دورياً عند استخدام جرعة ٤٠ مجم من الأولميسارتان.'
  ]
},

// 33. Marvitense 40/10/12.5mg 30 f.c. tabs.
{
  id: 'nevilob-amlo-5-5',
  name: 'Nevilob amlo 5/5 mg 30 tab.',
  genericName: 'Nebivolol + Amlodipine',
  concentration: '5mg / 5mg',
  price: 138,
  matchKeywords: [
    'hypertension', 'nevilob', 'beta blocker', 'tachycardia', 'cad',
    'نيفيلوب املو', 'نيبفولول', 'بيتا بلوكر', 'سرعة ضربات القلب', 'قصور الشريان التاجي'
  ],
  usage: 'تركيبة مميزة جداً تجمع بين (Nebivolol) مهديء لضربات القلب وموسع للشرايين، و(Amlodipine). مثالي لمرضى الضغط المصابين بتسارع ضربات القلب أو قصور الشريان التاجي.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم / ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'ممنوع للأطفال.';
    }
  },

  warnings: [
    'ممنوع التوقف المفاجئ (خطر حدوث Rebound Hypertension وتسارع شديد في القلب).',
    'يمنع لمرضى الربو الشعبي الشديد (رغم أنه Selective، الحذر واجب).',
    'يسبب بطء في ضربات القلب (Bradycardia)، أعد التقييم لو النبض قل عن ٥٥.'
  ]
},

// 36. Tribatens 40/10/12.5mg 30 f.c. tabs
{
  id: 'triplixam-10-2-5-10',
  name: 'Triplixam 10/2.5/10mg 15 f.c. tabs.',
  genericName: 'Perindopril + Indapamide + Amlodipine',
  concentration: '10mg / 2.5mg / 10mg',
  price: 234,
  matchKeywords: [
    'hypertension', 'triplixam', 'servier', 'ace inhibitor', 'indapamide',
    'تريبليكسام', 'سيرفييه', 'ثلاثي', 'ضغط', 'بيريندوبريل'
  ],
  usage: 'الكوكتيل الفرنسي القوي (Servier): يجمع بين مثبط للإنزيم المحول (ACEi) ومدر بول (Indapamide) وموسع للشرايين (CCB). الجرعة القصوى.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠ مجم / ٢.٥ مجم / ١٠ مجم مرة يومياً قبل الأكل لمدة طويلة (مزمن)';
  } else {
      return 'ممنوع للأطفال.';
    }
  },

  warnings: [
    'انتبه: قد يسبب "كحة ناشفة" (Dry Cough) بسبب مادة البيريندوبريل. إذا كانت مزعجة جداً يجب تغيير الدواء.',
    'ممنوع للحامل تماماً.',
    'خطر حدوث تورم في الوجه والشفاه (Angioedema) نادر ولكنه خطير ويستوجب وقف الدواء فوراً.'
  ]
},

// 40. Triplixam 5/1.25/5mg 15 f.c. tabs
{
  id: 'triplixam-5-1-25-5',
  name: 'Triplixam 5/1.25/5mg 15 f.c. tabs',
  genericName: 'Perindopril + Indapamide + Amlodipine',
  concentration: '5mg / 1.25mg / 5mg',
  price: 146,
  matchKeywords: [
    'hypertension', 'triplixam', 'start dose',
    'تريبليكسام', 'بداية العلاج', 'ضغط'
  ],
  usage: 'بداية العلاج الثلاثي المتميز من Servier. جرعات متوازنة لضبط الضغط وحماية الأوعية الدموية.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم / ١.٢٥ مجم / ٥ مجم مرة يومياً قبل الأكل لمدة طويلة (مزمن)';
  } else {
      return 'ممنوع للأطفال.';
    }
  },

  warnings: [
    'الكحة الجافة عرض جانبي محتمل.',
    'ممنوع للحامل.',
    'تورم القدمين أقل حدوثاً مع هذه الجرعة (٥ مجم أملوديبين).'
  ]
},
// 41. Zetakardoval 10/160mg 15 f.c. tabs.
{
  id: 'zetakardoval-10-160-15',
  name: 'Zetakardoval 10/160mg 15 f.c. tabs.',
  genericName: 'Amlodipine + Valsartan',
  concentration: '10mg / 160mg',
  price: 37.5,
  matchKeywords: [
    'hypertension', 'zetakardoval', 'valsartan', 'amlodipine', 'cheap',
    'زيتاكاردوفال', 'ضغط عالي', 'عبوة صغيرة', 'سعر قديم'
  ],
  usage: 'علاج ثنائي قوي لضغط الدم المرتفع (أملوديبين ١٠ مجم + فالسارتان). (عبوة ١٥ قرص).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠ مجم / ١٦٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'ممنوع للأطفال.';
    }
  },

  warnings: [
    'ممنوع للحامل.',
    'لو حسيت بدوخة لما تقوم من مكانك، اقعد شوية وقوم بالراحة.',
    'ممكن تلاحظ ورم بسيط في كعب الرجل، ده عرض طبيعي للدواء.'
  ]
},

// 42. Zetakardoval 5/160mg 15 f.c. tabs.
{
  id: 'zetakardoval-5-160-15',
  name: 'Zetakardoval 5/160mg 15 f.c. tabs.',
  genericName: 'Amlodipine + Valsartan',
  concentration: '5mg / 160mg',
  price: 34.5,
  matchKeywords: [
    'hypertension', 'zetakardoval', 'start dose',
    'زيتاكاردوفال', 'ضغط', 'بداية العلاج'
  ],
  usage: 'علاج ثنائي لضغط الدم بجرعة أملوديبين مخففة لتقليل التورم. (عبوة ١٥ قرص).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم / ١٦٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'ممنوع للأطفال.';
    }
  },

  warnings: [
    'ممنوع للحامل.',
    'الدواء ده بيحافظ على الضغط وب يحمي الكلى، بس لازم نتابع التحاليل كل فترة.'
  ]
},

// 43. Zetakardoval 5/320mg 15 f.c. tabs.
{
  id: 'zetakardoval-5-320-15',
  name: 'Zetakardoval 5/320mg 15 f.c. tabs.',
  genericName: 'Amlodipine + Valsartan',
  concentration: '5mg / 320mg',
  price: 42,
  matchKeywords: [
    'hypertension', 'zetakardoval', 'valsartan 320', 'high dose',
    'زيتاكاردوفال', 'فالسارتان عالي', 'أقصى جرعة فالسارتان'
  ],
  usage: 'تركيز مميز يحتوي على أقصى جرعة من الفالسارتان (٣٢٠ مجم) للتحكم القوي في الضغط وحماية القلب.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم / ٣٢٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'ممنوع للأطفال.';
    }
  },

  warnings: [
    'ممنوع للحامل.',
    'ممنوع استخدام بدائل الملح اللي فيها بوتاسيوم مع الدواء ده.'
  ]
},

// 44. Lezberg Trio 40/5/12.5mg 30 f.c.tabs.
{
  id: 'lezberg-trio-40-5-12-5',
  name: 'Lezberg Trio 40/5/12.5mg 30 f.c.tabs.',
  genericName: 'Olmesartan + Amlodipine + Hydrochlorothiazide',
  concentration: '40mg / 5mg / 12.5mg',
  price: 144,
  matchKeywords: [
    'hypertension', 'lezberg trio', 'triple therapy',
    'ليزبرج تريو', 'ثلاثي', 'ضغط عالي', 'مدر للبول'
  ],
  usage: 'علاج ثلاثي (أولميسارتان عالي + أملوديبين وسط + مدر للبول).',
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
      return 'ممنوع للأطفال.';
    }
  },

  warnings: [
    'ممنوع للحامل.',
    'اشرب ميه وعصاير طبيعية عشان تعوض السوائل.'
  ]
},

// 45. Zetakardoval 5/160mg 30 f.c. tabs.
{
  id: 'zetakardoval-5-160-30',
  name: 'Zetakardoval 5/160mg 30 f.c. tabs.',
  genericName: 'Amlodipine + Valsartan',
  concentration: '5mg / 160mg',
  price: 159,
  matchKeywords: [
    'hypertension', 'zetakardoval', 'monthly pack',
    'زيتاكاردوفال', 'عبوة شهرية', 'ضغط'
  ],
  usage: 'علاج ثنائي للضغط (عبوة شهرية ٣٠ قرص).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم / ١٦٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'ممنوع للأطفال.';
    }
  },

  warnings: [
    'ممنوع للحامل.',
    'السعر يختلف عن العبوة الصغيرة (١٥ قرص)، تأكد من الصيدلي.'
  ]
},

// 46. Zetakardoval 5/320mg 30 f.c. tabs.
{
  id: 'zetakardoval-5-320-30',
  name: 'Zetakardoval 5/320mg 30 f.c. tabs.',
  genericName: 'Amlodipine + Valsartan',
  concentration: '5mg / 320mg',
  price: 219,
  matchKeywords: [
    'hypertension', 'zetakardoval', 'valsartan 320', 'monthly pack',
    'زيتاكاردوفال', 'عبوة توفير', 'تركيز عالي'
  ],
  usage: 'أقصى جرعة فالسارتان مع أملوديبين (عبوة شهرية ٣٠ قرص).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم / ٣٢٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'ممنوع للأطفال.';
    }
  },

  warnings: [
    'ممنوع للحامل.',
    'قد يسبب دوخة بسيطة في أول يومين استخدام.'
  ]
},

// 47. Zetakardoval 10/160mg 30 f.c. tabs.
{
  id: 'zetakardoval-10-160-30',
  name: 'Zetakardoval 10/160mg 30 f.c. tabs.',
  genericName: 'Amlodipine + Valsartan',
  concentration: '10mg / 160mg',
  price: 168,
  matchKeywords: [
    'hypertension', 'zetakardoval', 'monthly pack', 'strong',
    'زيتاكاردوفال', 'عبوة ٣٠', 'ضغط عالي'
  ],
  usage: 'الجرعة القصوى من الأملوديبين (١٠ مجم) للسيطرة على الضغط (عبوة شهرية).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠ مجم / ١٦٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'ممنوع للأطفال.';
    }
  },

  warnings: [
    'ممنوع للحامل.',
    'انتبه للسعر المرتفع مقارنة بالعبوة الـ ١٥ قرص.'
  ]
},

// 48. Norvasc 10 mg 10 tab.
{
  id: 'norvasc-10-10tab',
  name: 'Norvasc 10 mg 10 tab.',
  genericName: 'Amlodipine',
  concentration: '10mg',
  price: 64,
  matchKeywords: [
    'hypertension', 'norvasc', 'pfizer', 'small pack',
    'نورفاسك', 'فايزر', 'شريط واحد'
  ],
  usage: 'البراند الأصلي للأملوديبين (عبوة صغيرة ١٠ أقراص).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 72, 
  maxAgeMonths: 1200,
  minWeight: 20,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 72) {
      return 'للأطفال (٦-١٧ سنة): الجرعة تُحدد حسب التشخيص والوزن (غالباً نص قرص ٥ مجم)، الـ ١٠ مجم جرعة كبيرة.';
    } else {
      return 'غير موصى به للأطفال أقل من ٦ سنوات.';
    }
  },

  warnings: [
    'النوع ده (الأصلي) فعال جداً، فلو كنت بتاخد بديل تاني وغيرت لده، تابع ضغطك كويس.',
    'تورم الرجل عرض مشهور للدواء ده.'
  ]
},

// 49. Altiazem 60mg 40 tab
{
  id: 'altiazem-60-40',
  name: 'Altiazem 60mg 40 tab',
  genericName: 'Diltiazem',
  concentration: '60mg',
  price: 68,
  matchKeywords: [
    'angina', 'arrhythmia', 'rate control', 'diltiazem', 'altiazem',
    'التيازيم', 'دلتيازيم', 'ذبحة صدرية', 'رفرفة القلب', 'تنظيم ضربات القلب'
  ],
  usage: 'يختلف عن باقي القائمة: يستخدم لتهدئة ضربات القلب السريعة، وعلاج الذبحة، والضغط. (Non-DHP CCB).',
  timing: '٣ مرات يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE, // Also Antiarrhythmic
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٦٠ مجم ٣ مرات يومياً قبل الأكل لمدة طويلة (مزمن)';
  } else {
      return 'لا يستخدم للأطفال إلا بجرعات معتمدة لأمراض قلب الأطفال.';
    }
  },

  warnings: [
    'ممنوع تماماً تاخده مع أدوية "الكونكور" أو أي (Beta-blocker) إلا لو أنا كاتبلك الاتنين سوا، عشان ما يهبطش القلب زيادة.',
    'ممنوع تشرب معاه عصير جريب فروت.',
    'لو حسيت بضربات قلبك بطيئة جداً أو دوخة مستمرة، وقف الدواء وراجعني.'
  ]
},

// 50. Amilo 5 mg 30 tab.
{
  id: 'amilo-5-30',
  name: 'Amilo 5 mg 30 tab.',
  genericName: 'Amlodipine',
  concentration: '5mg',
  price: 54,
  matchKeywords: [
    'hypertension', 'amilo', 'generic amlodipine',
    'اميلو', 'أملوديبين', 'سعر اقتصادي'
  ],
  usage: 'بديل اقتصادي ممتاز للأملوديبين بتركيز ٥ مجم.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 72, 
  maxAgeMonths: 1200,
  minWeight: 20,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 72) {
      return 'للأطفال (٦-١٧ سنة): ٢.٥ مجم إلى ٥ مجم مرة واحدة يومياً.';
    } else {
      return 'غير موصى به للأطفال أقل من ٦ سنوات.';
    }
  },

  warnings: [
    'يعتبر من أخف أدوية الضغط في الأعراض الجانبية.',
    'لو بتشتكي من حموضة، ممكن تاخده وسط الأكل.'
  ]
},
// 51. Amlodipine 10mg 20 tabs.
{
  id: 'amlodipine-10-20tabs',
  name: 'Amlodipine 10mg 20 tabs.',
  genericName: 'Amlodipine',
  concentration: '10mg',
  price: 44,
  matchKeywords: [
    'hypertension', 'angina', 'amlodipine', 'generic', 'calcium channel blocker',
    'أملوديبين', 'ضغط مرتفع', 'ذبحة صدرية', 'موسع للشرايين'
  ],
  usage: 'يستخدم لعلاج ارتفاع ضغط الدم (الجرعة القصوى من المادة الفعالة)، ولعلاج الذبحة الصدرية المستقرة والمتحولة (Prinzmetal\'s angina).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 72, // 6 years
  maxAgeMonths: 1200,
  minWeight: 20,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 10mg مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 72) {
      return 'للأطفال والمراهقين: يفضل البدء بجرعة ٢.٥ مجم أو ٥ مجم. استخدام جرعة ١٠ مجم يتطلب متابعة الضغط والتحاليل.';
    } else {
      return 'لا ينصح باستخدامه للأطفال أقل من ٦ سنوات.';
    }
  },

  warnings: [
    'قد يسبب الدواء تورماً في الكاحلين (Ankle Edema) كعرض جانبي شائع، خاصة مع جرعة ١٠ مجم.',
    'يستخدم بحذر مع مرضى هبوط عضلة القلب (Heart Failure).',
    'يجب الحذر عند القيادة أو تشغيل الآلات في بداية العلاج لاحتمالية حدوث دوار.'
  ]
},

// 52. Coveram 10/5mg 15 tabs.
{
  id: 'coveram-10-5',
  name: 'Coveram 10/5mg 15 tabs.',
  genericName: 'Perindopril Arginine + Amlodipine',
  concentration: '10mg / 5mg',
  price: 184,
  matchKeywords: [
    'hypertension', 'coveram', 'servier', 'ace inhibitor', 'cad',
    'كوفيرام', 'سيرفييه', 'ضغط', 'بيريندوبريل', 'شرايين تاجية'
  ],
  usage: 'علاج ثنائي قوي يجمع بين مثبطات الإنزيم المحول (Perindopril) بجرعة عالية وموسع للشرايين (Amlodipine). يستخدم للضغط ومرضى الشريان التاجي المستقر.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 10mg / 5mg مرة يومياً على معدة فارغة لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال والمراهقين.';
    }
  },

  warnings: [
    'يحظر استخدامه تماماً أثناء الحمل والرضاعة (فئة D).',
    'قد يسبب سعالاً جافاً ومستمراً (Dry Cough). في حال كان السعال مزعجاً جداً، يرجى إعادة التقييم لاستبدال الدواء.',
    'يجب الحذر من خطر التورم الوعائي (Angioedema) وتورم الشفاه أو اللسان.'
  ]
},

// 53. Coveram 5/5mg 15 tabs.
{
  id: 'coveram-5-5',
  name: 'Coveram 5/5mg 15 tabs.',
  genericName: 'Perindopril Arginine + Amlodipine',
  concentration: '5mg / 5mg',
  price: 125,
  matchKeywords: [
    'hypertension', 'coveram', 'start dose', 'servier',
    'كوفيرام', 'بداية العلاج', 'ضغط', 'حماية القلب'
  ],
  usage: 'بداية العلاج الثنائي بجرعات متوازنة (٥ مجم لكل مادة) للسيطرة على ضغط الدم وتقليل مخاطر أمراض القلب.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 5mg / 5mg مرة يومياً على معدة فارغة لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'قد يسبب انخفاضاً مفاجئاً في ضغط الدم بعد الجرعة الأولى، لذا ينصح بالراحة بعد تناولها.',
    'يجب متابعة وظائف الكلى والبوتاسيوم بشكل دوري.'
  ]
},

// 54. Epilat retard 20mg sr. 20 f.c.tab.
{
  id: 'epilat-retard-20',
  name: 'Epilat retard 20mg sr. 20 f.c.tab.',
  genericName: 'Nifedipine',
  concentration: '20mg',
  price: 22,
  matchKeywords: [
    'hypertension', 'angina', 'nifedipine', 'epilat', 'retard', 'sr',
    'ابيبلات ريتارد', 'نيفيديبين', 'ذبحة', 'ضغط', 'تقلصات الرحم'
  ],
  usage: 'علاج ارتفاع ضغط الدم والذبحة الصدرية. (نيقيديبين ممتد المفعول). يختلف عن الأملوديبين في قصر مدة مفعوله نسبياً حتى مع تقنية Retard.',
  timing: 'مرتين يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'F.C. Tablets',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 20mg مرتين يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'غير مخصص للأطفال.';
    }
  },

  warnings: [
    'قد يسبب زيادة رد فعلية في ضربات القلب (Reflex Tachycardia).',
    'يسبب تورم اللثة (Gingival Hyperplasia) مع الاستخدام الطويل، لذا ينصح بالعناية الفائقة بنظافة الفم.',
    'قد يسبب احمراراً ووهجاً في الوجه (Flushing) وصداعاً.'
  ]
},

// 55. Norvasc 5mg 30 tab.
{
  id: 'norvasc-5-30tab',
  name: 'Norvasc 5mg 30 tab.',
  genericName: 'Amlodipine',
  concentration: '5mg',
  price: 162,
  matchKeywords: [
    'hypertension', 'norvasc', 'pfizer', 'original', 'monthly pack',
    'نورفاسك', 'فايزر', 'عبوة شهرية', 'أملوديبين'
  ],
  usage: 'المستحضر الأصلي (Brand) للأملوديبين. يستخدم كعلاج أولي لضغط الدم المرتفع والذبحة الصدرية. (عبوة ٣٠ قرص).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 72, 
  maxAgeMonths: 1200,
  minWeight: 20,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 5mg مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else if (ageMonths >= 72) {
      return 'للأطفال (٦-١٧ سنة): الجرعة الاعتيادية ٢.٥ مجم إلى ٥ مجم مرة واحدة يومياً.';
    } else {
      return 'لا ينصح به للأطفال أقل من ٦ سنوات.';
    }
  },

  warnings: [
    'يعتبر الخيار الأكثر أماناً لمرضى الفشل الكلوي ومرضى الربو.',
    'على الرغم من ندرة الآثار الجانبية مع جرعة ٥ مجم، إلا أن الصداع وتورم القدمين وارد الحدوث.',
    'يتميز هذا المستحضر (الأصلي) بثبات الفعالية الدوائية.'
  ]
},

// 56. Alkapress trio 10/320/25mg 14 f.c. tabs.
{
  id: 'alkapress-trio-10-320-25',
  name: 'Alkapress trio 10/320/25mg 14 f.c. tabs.',
  genericName: 'Amlodipine + Valsartan + Hydrochlorothiazide',
  concentration: '10mg / 320mg / 25mg',
  price: 118,
  matchKeywords: [
    'hypertension', 'alkapress trio', 'max dose', 'resistant hypertension',
    'الكابرس تريو', 'أقصى جرعة', 'ضغط مقاوم', 'ثلاثي'
  ],
  usage: 'علاج ثلاثي بأقصى تركيز لجميع المكونات (أملوديبين ١٠، فالسارتان ٣٢٠، هيدروكلوروثيازيد ٢٥). مخصص حصرياً لحالات الضغط المقاومة جداً للعلاج.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 60,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 10mg / 320mg / 25mg مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال نهائياً.';
    }
  },

  warnings: [
    'يحظر استخدامه أثناء الحمل.',
    'خطر حدوث جفاف واضطراب في شوارد الدم (الصوديوم والبوتاسيوم) مرتفع مع هذا التركيز، لذا يجب إجراء تحاليل دورية.',
    'يجب الحذر الشديد عند الوقوف المفاجئ لتجنب الدوخة والهبوط (Orthostatic Hypotension).'
  ]
},

// 57. Lezberg Trio 40/10/25mg 30 f.c.tabs.
{
  id: 'lezberg-trio-40-10-25',
  name: 'Lezberg Trio 40/10/25mg 30 f.c.tabs.',
  genericName: 'Olmesartan + Amlodipine + Hydrochlorothiazide',
  concentration: '40mg / 10mg / 25mg',
  price: 162,
  matchKeywords: [
    'hypertension', 'lezberg trio', 'max dose', 'olmesartan',
    'ليزبرج تريو', 'ضغط عالي', 'أقصى تركيز', 'اولميسارتان'
  ],
  usage: 'أقصى قوة علاجية ثلاثية في هذه المجموعة (أولميسارتان ٤٠ + أملوديبين ١٠ + مدر للبول ٢٥). يستخدم لعلاج ضغط الدم المرتفع الذي لم يستجب للجرعات الأقل.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 60,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 40mg / 10mg / 25mg مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل (يسبب أضراراً بالغة للجنين).',
    'قد يسبب فقدان الوزن الشديد والإسهال المزمن في حالات نادرة مرتبطة بمادة الأولميسارتان (Enteropathy).',
    'يجب مراقبة وظائف الكلى (Creatinine) بانتظام.'
  ]
},

// 58. Amlosazide 5/12.5/20 mg 30 f.c. tabs.
{
  id: 'amlosazide-5-12-5-20',
  name: 'Amlosazide 5/12.5/20 mg 30 f.c. tabs.',
  genericName: 'Olmesartan + Amlodipine + Hydrochlorothiazide',
  concentration: '20mg / 5mg / 12.5mg',
  price: 99,
  matchKeywords: [
    'hypertension', 'amlosazide', 'triple therapy', 'start dose',
    'املوسازيد', 'ثلاثي', 'بداية العلاج', 'ضغط'
  ],
  usage: 'علاج ثلاثي بجرعات أولية (أولميسارتان ٢٠ + أملوديبين ٥ + هيدروكلوروثيازيد ١٢.٥). مناسب للبدء في العلاج الثلاثي.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 20mg / 5mg / 12.5mg مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يستخدم بحذر مع كبار السن لتجنب الهبوط المفاجئ.',
    'تأثيره المدر للبول قد يتطلب تعديل جرعات أدوية السكر (في حالات نادرة).'
  ]
},

// 59. Amlosazide 5/12.5/40 mg 30 f.c. tabs.
{
  id: 'amlosazide-5-12-5-40',
  name: 'Amlosazide 5/12.5/40 mg 30 f.c. tabs.',
  genericName: 'Olmesartan + Amlodipine + Hydrochlorothiazide',
  concentration: '40mg / 5mg / 12.5mg',
  price: 123,
  matchKeywords: [
    'hypertension', 'amlosazide', 'olmesartan 40',
    'املوسازيد', 'اولميسارتان ٤٠', 'ضغط'
  ],
  usage: 'تركيبة ثلاثية تعتمد على رفع جرعة الأولميسارتان إلى ٤٠ مجم مع الحفاظ على جرعة الأملوديبين منخفضة (٥ مجم) لتجنب الآثار الجانبية الوعائية.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 40mg / 5mg / 12.5mg مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'خيار جيد للمرضى الذين يعانون من تورم القدمين مع الأملوديبين ١٠ مجم، حيث يوفر هذا الدواء فعالية عالية بجرعة أملوديبين أقل.'
  ]
},

// 60. Averothiazide 5/40/25mg 30 f.c. tabs.
{
  id: 'averothiazide-5-40-25',
  name: 'Averothiazide 5/40/25mg 30 f.c. tabs.',
  genericName: 'Olmesartan + Amlodipine + Hydrochlorothiazide',
  concentration: '40mg / 5mg / 25mg',
  price: 123,
  matchKeywords: [
    'hypertension', 'averothiazide', 'high diuretic',
    'افيروثيازيد', 'مدر للبول عالي', 'اولميسارتان ٤٠'
  ],
  usage: 'علاج ثلاثي يحتوي على جرعة عالية من مدر البول (٢٥ مجم) والأولميسارتان (٤٠ مجم)، مع جرعة أملوديبين مخففة (٥ مجم).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 40mg / 5mg / 25mg مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'قد يسبب هذا التركيز (٢٥ مجم هيدروكلوروثيازيد) ارتفاعاً في حمض اليوريك (Uric Acid) والسكر في الدم، لذا يرجى المتابعة.',
    'يجب التأكد من سلامة وظائف الكلى قبل البدء بالعلاج.'
  ]
},
// 61. Avivavasc 10/160mg 28 f.c. tab.
{
  id: 'avivavasc-10-160',
  name: 'Avivavasc 10/160mg 28 f.c. tab.',
  genericName: 'Amlodipine + Valsartan',
  concentration: '10mg / 160mg',
  price: 140,
  matchKeywords: [
    'hypertension', 'avivavasc', 'valsartan', 'amlodipine', 'exforge generic',
    'افيفافاسك', 'فالسارتان', 'أملوديبين', 'ضغط مرتفع', 'بديل اكسفورج'
  ],
  usage: 'علاج ثنائي لارتفاع ضغط الدم، يحتوي على الجرعة القصوى من الأملوديبين (١٠ مجم) لفعالية قصوى، مع الفالسارتان.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 10mg / 160mg مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يحظر استخدامه للأطفال والمراهقين أقل من ١٨ عاماً.';
    }
  },

  warnings: [
    'يمنع استخدامه منعاً باتاً أثناء الحمل (فئة D) لما يسببه من ضرر وتشوهات للجنين.',
    'قد يسبب تورماً ملحوظاً في الكاحلين (Ankle Edema) بسبب جرعة الأملوديبين ١٠ مجم.',
    'يجب الحذر عند النهوض السريع لتجنب انخفاض الضغط الانتصابي.'
  ]
},

// 62. Avivavasc 5/160mg 28 f.c. tab.
{
  id: 'avivavasc-5-160',
  name: 'Avivavasc 5/160mg 28 f.c. tab.',
  genericName: 'Amlodipine + Valsartan',
  concentration: '5mg / 160mg',
  price: 124,
  matchKeywords: [
    'hypertension', 'avivavasc', 'start dose',
    'افيفافاسك', 'بداية العلاج', 'ضغط'
  ],
  usage: 'علاج ضغط الدم بتركيبة ثنائية متوازنة، تقلل من احتمالية حدوث تورم القدمين مقارنة بالتركيزات الأعلى.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 5mg / 160mg مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يحظر استخدامه للحوامل.',
    'يجب متابعة وظائف الكلى ومستوى البوتاسيوم في الدم بشكل دوري.',
    'يعتبر خياراً مناسباً لمرضى السكري لحماية الكلى (بفضل مادة الفالسارتان).'
  ]
},

// 63. Triplixam 10/2.5/5mg 15 f.c.tabs.
{
  id: 'triplixam-10-2-5-5',
  name: 'Triplixam 10/2.5/5mg 15 f.c.tabs.',
  genericName: 'Perindopril + Indapamide + Amlodipine',
  concentration: '10mg / 2.5mg / 5mg',
  price: 176,
  matchKeywords: [
    'hypertension', 'triplixam', 'servier', 'smart combo',
    'تريبليكسام', 'سيرفييه', 'تركيبة ذكية', 'ضغط'
  ],
  usage: 'تركيبة ذكية جداً من Servier: تحتوي على جرعة عالية من الـ Perindopril والـ Indapamide للسيطرة القوية، مع جرعة منخفضة من Amlodipine (٥ مجم) لتجنب تورم القدمين.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 10mg / 2.5mg / 5mg مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'قد يسبب سعالاً جافاً (Dry Cough) بسبب مادة البيريندوبريل.',
    'يمنع استخدامه للحوامل.',
    'يجب الحذر من الجفاف، وينصح بشرب كميات كافية من الماء.'
  ]
},

// 64. Concor amlo 5/5 mg 30 tabs
{
  id: 'covaprendo-10-10',
  name: 'Covaprendo 10/10mg 30 tabs.',
  genericName: 'Perindopril Arginine + Amlodipine',
  concentration: '10mg / 10mg',
  price: 201,
  matchKeywords: [
    'hypertension', 'covaprendo', 'max dose', 'coveram generic',
    'كوفابريندو', 'بديل كوفيرام', 'أقصى جرعة', 'ضغط'
  ],
  usage: 'بديل (Coveram) بتركيز أقصى للمادتين الفعالتين (١٠/١٠). يستخدم لحالات الضغط المرتفع جداً أو مرضى الشريان التاجي.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 10mg / 10mg مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'احتمالية تورم الكاحلين عالية جداً مع هذا التركيز.',
    'قد يسبب الدوار عند بداية الاستخدام.'
  ]
},

// 66. Covaprendo 10/5mg 30 tabs.
{
  id: 'covaprendo-10-5',
  name: 'Covaprendo 10/5mg 30 tabs.',
  genericName: 'Perindopril Arginine + Amlodipine',
  concentration: '10mg / 5mg',
  price: 186,
  matchKeywords: [
    'hypertension', 'covaprendo', 'high ace', 'coveram generic',
    'كوفابريندو', 'بيريندوبريل عالي', 'ضغط'
  ],
  usage: 'تركيبة تعتمد على جرعة عالية من البيريندوبريل (١٠ مجم) لحماية القلب والأوعية، مع جرعة أملوديبين متوسطة (٥ مجم).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 10mg / 5mg مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'السعال الجاف عرض جانبي وارد.',
    'أقل تسبباً في تورم القدمين مقارنة بتركيز ١٠/١٠.'
  ]
},

// 67. Covaprendo 5/10mg 30 tabs.
{
  id: 'covaprendo-5-10',
  name: 'Covaprendo 5/10mg 30 tabs.',
  genericName: 'Perindopril Arginine + Amlodipine',
  concentration: '5mg / 10mg',
  price: 150,
  matchKeywords: [
    'hypertension', 'covaprendo', 'high amlo',
    'كوفابريندو', 'أملوديبين عالي', 'ضغط'
  ],
  usage: 'تركيبة تعتمد على قوة توسيع الشرايين بجرعة أملوديبين عالية (١٠ مجم) مع جرعة بيريندوبريل وقائية (٥ مجم).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 5mg / 10mg مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يجب مراقبة حدوث تورم في القدمين.',
    'يستخدم بحذر مع مرضى قصور وظائف الكلى.'
  ]
},

// 68. Coveram 10/10mg 15 tab.
{
  id: 'coveram-10-10',
  name: 'Coveram 10/10mg 15 tab.',
  genericName: 'Perindopril Arginine + Amlodipine',
  concentration: '10mg / 10mg',
  price: 188,
  matchKeywords: [
    'hypertension', 'coveram', 'servier', 'original', 'max dose',
    'كوفيرام', 'سيرفييه', 'الأصلي', 'أقصى جرعة'
  ],
  usage: 'المستحضر الأصلي (Brand) بأقصى تركيز للمادتين. يعتبر المعيار الذهبي لعلاج الضغط المرتفع المصحوب بأمراض القلب.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 10mg / 10mg مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'قد يسبب هبوطاً في الضغط عند بداية الاستخدام خاصة لدى كبار السن.',
    'يتميز بجودة التصنيع وثبات المادة الفعالة (Original Brand).'
  ]
},

// 69. Coveram 5/10mg 15 tabs.
{
  id: 'coveram-5-10',
  name: 'Coveram 5/10mg 15 tabs.',
  genericName: 'Perindopril Arginine + Amlodipine',
  concentration: '5mg / 10mg',
  price: 133,
  matchKeywords: [
    'hypertension', 'coveram', 'servier', 'original',
    'كوفيرام', 'أملوديبين عالي', 'ضغط'
  ],
  usage: 'المستحضر الأصلي بجرعة أملوديبين عالية (١٠ مجم) للسيطرة على الضغط، وجرعة بيريندوبريل متوسطة (٥ مجم).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 5mg / 10mg مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'عرضة لإحداث تورم في الساقين.',
    'يجب تقييم أولي في حال حدوث سعال جاف مستمر.'
  ]
},

// 70. Chartoreg co 80 / 5 mg 28 tabs.
{
  id: 'chartoreg-co-80-5',
  name: 'Chartoreg co 80 / 5 mg 28 tabs.',
  genericName: 'Telmisartan + Amlodipine',
  concentration: '80mg / 5mg',
  price: 192,
  matchKeywords: [
    'hypertension', 'chartoreg', 'telmisartan', 'long acting',
    'شارتوريج كو', 'تيلميسارتان', 'طويل المفعول', 'ضغط'
  ],
  usage: 'تركيبة مميزة تحتوي على (Telmisartan) المعروف بمفعوله الطويل جداً (٢٤ ساعة حقيقية) مع الأملوديبين. علاج قوي للضغط.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 80mg / 5mg مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل (فئة D).',
    'قد يرفع مستوى البوتاسيوم في الدم (Hyperkalemia)، لذا ينصح بالتحليل الدوري.',
    'يعتبر بديلاً ممتازاً لمن يعانون من السعال مع أدوية مثبطات الإنزيم المحول (مثل الكوفيرام).'
  ]
},
// 71. Covaprendo 5/5mg 30 tabs.
{
  id: 'covaprendo-5-5',
  name: 'Covaprendo 5/5mg 30 tabs.',
  genericName: 'Perindopril Arginine + Amlodipine',
  concentration: '5mg / 5mg',
  price: 138,
  matchKeywords: [
    'hypertension', 'covaprendo', 'start dose', 'ace inhibitor',
    'كوفابريندو', 'بداية العلاج', 'ضغط', 'حماية القلب'
  ],
  usage: 'علاج ثنائي لضغط الدم يحتوي على جرعات أولية متوازنة (٥ مجم لكل مادة). مناسب لبدء العلاج للمرضى الذين يحتاجون لأكثر من دواء.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 5mg / 5mg مرة يومياً على معدة فارغة لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه منعاً باتاً للحوامل (فئة D).',
    'قد يسبب سعالاً جافاً (Dry Cough)؛ في حال استمراره بشكل مزعج يرجى إعادة التقييم.',
    'يجب توخي الحذر عند استخدامه مع مدرات البول الحافظة للبوتاسيوم.'
  ]
},

// 72. Kemiforge 10/160mg 20 f.c. tab.
{
  id: 'kemiforge-10-160',
  name: 'Kemiforge 10/160mg 20 f.c. tab.',
  genericName: 'Amlodipine + Valsartan',
  concentration: '10mg / 160mg',
  price: 69,
  matchKeywords: [
    'hypertension', 'kemiforge', 'valsartan', 'exforge generic',
    'كيميفورج', 'فالسارتان', 'أملوديبين', 'ضغط مرتفع'
  ],
  usage: 'بديل اقتصادي (للإكسفورج) بتركيز عالٍ من الأملوديبين (١٠ مجم) للسيطرة القوية على ضغط الدم المرتفع.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 10mg / 160mg مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'نسبة حدوث تورم القدمين (Edema) مرتفعة مع هذا التركيز.',
    'يجب الحذر عند القيام المفاجئ لتجنب الدوخة.'
  ]
},

// 73. Plendil 10mg 30 prolonged release f.c.
{
  id: 'plendil-10-pr',
  name: 'Plendil 10mg 30 prolonged release f.c.',
  genericName: 'Felodipine',
  concentration: '10mg',
  price: 112.5,
  matchKeywords: [
    'hypertension', 'angina', 'plendil', 'felodipine', 'astrazeneca',
    'بلينديل', 'فيلوديبين', 'ممتد المفعول', 'ضغط', 'استرازينيكا'
  ],
  usage: 'علاج ارتفاع ضغط الدم والذبحة الصدرية. ينتمي لمجموعة حاصرات قنوات الكالسيوم (DHP) ولكنه يختلف كيميائياً عن الأملوديبين.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Prolonged Release Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 10mg مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'غير مخصص للأطفال.';
    }
  },

  warnings: [
    'قد يسبب تضخماً في اللثة (Gingival Hyperplasia) أكثر من الأملوديبين، لذا ينصح بالعناية الفائقة بنظافة الفم.',
    'يمنع تناوله مع عصير الجريب فروت.',
    'قد يسبب احمراراً في الوجه (Flushing) وصداعاً في بداية العلاج.'
  ]
},

// 74. Twynsta 80/10mg 28 tab.
{
  id: 'twynsta-80-10',
  name: 'Twynsta 80/10mg 28 tab.',
  genericName: 'Telmisartan + Amlodipine',
  concentration: '80mg / 10mg',
  price: 192,
  matchKeywords: [
    'hypertension', 'twynsta', 'telmisartan', 'micardis', 'boehringer',
    'توينستا', 'تيلميسارتان', 'أقصى جرعة', 'الاصلي', 'ضغط'
  ],
  usage: 'المستحضر الأصلي (Brand) بجرعة قصوى للمادتين. يتميز التيلميسارتان بأطول مفعول في فئته (Half-life > 24 hours) مما يضمن ثبات الضغط.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 80mg / 10mg مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'قد يسبب تورم الساقين بسبب جرعة الأملوديبين (١٠ مجم).',
    'يتميز التيلميسارتان بخصائص مفيدة للأيض (Metabolic properties) ولا يرفع السكر.'
  ]
},

// 75. Twynsta 80/5mg 28 tab.
{
  id: 'twynsta-80-5',
  name: 'Twynsta 80/5mg 28 tab.',
  genericName: 'Telmisartan + Amlodipine',
  concentration: '80mg / 5mg',
  price: 192,
  matchKeywords: [
    'hypertension', 'twynsta', 'telmisartan', 'boehringer',
    'توينستا', 'تيلميسارتان', 'ضغط', 'حماية الكلى'
  ],
  usage: 'تركيبة تعتمد على الجرعة القصوى للتيلميسارتان (٨٠ مجم) لحماية القلب والكلى، مع جرعة أملوديبين متوسطة (٥ مجم) لتقليل التورم.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 80mg / 5mg مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يجب متابعة مستوى البوتاسيوم في الدم دورياً.',
    'سعره مرتفع ولكنه يعتبر من أفضل أدوية الضغط عالمياً.'
  ]
},

// 76. Amlosazide 5/25/40 mg 30 f.c. tabs.
{
  id: 'amlosazide-5-25-40-30',
  name: 'Amlosazide 5/25/40 mg 30 f.c. tabs.',
  genericName: 'Olmesartan + Amlodipine + Hydrochlorothiazide',
  concentration: '40mg / 5mg / 25mg',
  price: 123,
  matchKeywords: [
    'hypertension', 'amlosazide', 'triple therapy', 'high diuretic',
    'املوسازيد', 'ثلاثي', 'مدر للبول عالي', 'اولميسارتان ٤٠'
  ],
  usage: 'علاج ثلاثي يحتوي على جرعة عالية من مدر البول (٢٥ مجم) مع الأولميسارتان (٤٠ مجم) للسيطرة على الضغط المقاوم.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 40mg / 5mg / 25mg مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'قد يسبب ارتفاعاً في حمض اليوريك (مما قد يهيج النقرس) واضطراباً في سكر الدم بسبب جرعة الـ ٢٥ مجم من الثيازيد.',
    'يجب التأكد من وظائف الكلى قبل الاستخدام.'
  ]
},

// 77. Improflow 10/40 mg 20 f.c. tabs.
{
  id: 'improflow-10-40',
  name: 'Improflow 10/40 mg 20 f.c. tabs.',
  genericName: 'Amlodipine + Olmesartan',
  concentration: '10mg / 40mg',
  price: 60,
  matchKeywords: [
    'hypertension', 'improflow', 'olmesartan 40', 'sevikar generic',
    'امبروفلو', 'اولميسارتان', 'بديل سيفيكار', 'ضغط عالي'
  ],
  usage: 'علاج ثنائي قوي (بديل Sevikar) بتركيز أقصى للمادتين (أملوديبين ١٠ + أولميسارتان ٤٠). سعر اقتصادي جداً.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 10mg / 40mg مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'قد يسبب تورماً في القدمين.',
    'يجب الانتباه لأي أعراض معوية شديدة (إسهال مزمن) مرتبطة بالأولميسارتان.'
  ]
},

// 78. Amlosazide 10/25/40mg 10 f.c. tabs.
{
  id: 'amlosazide-10-25-40-10',
  name: 'Amlosazide 10/25/40mg 10 f.c. tabs.',
  genericName: 'Olmesartan + Amlodipine + Hydrochlorothiazide',
  concentration: '40mg / 10mg / 25mg',
  price: 141,
  matchKeywords: [
    'hypertension', 'amlosazide', 'max dose', 'resistant hypertension',
    'املوسازيد', 'أقصى جرعة', 'ضغط مقاوم', 'شريط واحد'
  ],
  usage: 'الجرعة القصوى المطلقة في هذه الفئة (ثلاثي). مخصص للضغط العنيد جداً. (عبوة صغيرة ١٠ أقراص).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 60,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 40mg / 10mg / 25mg مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'خطر حدوث هبوط حاد في الضغط وجفاف، خاصة لكبار السن.',
    'يمنع استخدامه للحوامل.',
    'يجب إجراء تحليل وظائف كلى وشوارد الدم (Electrolytes) بصفة دورية.'
  ]
},

// 79. Elimolivan 5/160mg 10 f.c. tabs.
{
  id: 'elimolivan-5-160-10',
  name: 'Elimolivan 5/160mg 10 f.c. tabs.',
  genericName: 'Amlodipine + Valsartan',
  concentration: '5mg / 160mg',
  price: 32.4,
  matchKeywords: [
    'hypertension', 'elimolivan', 'small pack', 'valsartan',
    'اليموليفان', 'عبوة صغيرة', 'فالسارتان', 'ضغط'
  ],
  usage: 'علاج ثنائي اقتصادي للضغط (عبوة صغيرة ١٠ أقراص).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 5mg / 160mg مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يعتبر بديلاً جيداً واقتصادياً للبراندات المستوردة.'
  ]
},

// 80. Kemiforge 10/320mg 20 f.c. tab.
{
  id: 'kemiforge-10-320',
  name: 'Kemiforge 10/320mg 20 f.c. tab.',
  genericName: 'Amlodipine + Valsartan',
  concentration: '10mg / 320mg',
  price: 95,
  matchKeywords: [
    'hypertension', 'kemiforge', 'valsartan 320', 'max dose',
    'كيميفورج', 'فالسارتان ٣٢٠', 'أقصى جرعة', 'ضغط عالي'
  ],
  usage: 'يحتوي على أعلى جرعة من الفالسارتان (٣٢٠ مجم) مع أملوديبين (١٠ مجم) لضبط الضغط المرتفع وحماية عضلة القلب.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 60,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 10mg / 320mg مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يجب الحذر من هبوط الضغط، وينصح بالنهوض التدريجي من وضع الجلوس.',
    'يجب متابعة البوتاسيوم في الدم.'
  ]
},

// 81. Elimolivan 10/160mg 28 f.c. tabs.
{
  id: 'elimolivan-10-160-28',
  name: 'Elimolivan 10/160mg 28 f.c. tabs.',
  genericName: 'Amlodipine + Valsartan',
  concentration: '10mg / 160mg',
  price: 148,
  matchKeywords: [
    'hypertension', 'elimolivan', 'monthly pack', 'strong',
    'اليموليفان', 'عبوة شهرية', 'ضغط عالي'
  ],
  usage: 'علاج ثنائي قوي للضغط (عبوة شهرية ٢٨ قرص).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 10mg / 160mg مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'قد يسبب الصداع وتورم القدمين.'
  ]
},

// 82. Elimolivan 10/160mg 14 f.c. tabs.
{
  id: 'elimolivan-10-160-14',
  name: 'Elimolivan 10/160mg 14 f.c. tabs.',
  genericName: 'Amlodipine + Valsartan',
  concentration: '10mg / 160mg',
  price: 74,
  matchKeywords: [
    'hypertension', 'elimolivan', '2 weeks',
    'اليموليفان', '١٤ قرص', 'ضغط'
  ],
  usage: 'علاج ثنائي قوي للضغط (عبوة ١٤ قرص تكفي أسبوعين).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 10mg / 160mg مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'يجب مراقبة الضغط بانتظام.'
  ]
},

// 83. Amlosazide 5/25/40 mg 20 f.c. tabs.
{
  id: 'amlosazide-5-25-40-20',
  name: 'Amlosazide 5/25/40 mg 20 f.c. tabs.',
  genericName: 'Olmesartan + Amlodipine + Hydrochlorothiazide',
  concentration: '40mg / 5mg / 25mg',
  price: 60,
  matchKeywords: [
    'hypertension', 'amlosazide', 'small pack', 'high diuretic',
    'املوسازيد', 'عبوة ٢٠', 'مدر للبول عالي'
  ],
  usage: 'علاج ثلاثي بجرعة مدر للبول عالية (٢٥ مجم) للسيطرة على الضغط (عبوة ٢٠ قرص).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص 40mg / 5mg / 25mg مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه للحوامل.',
    'سعر القرص في هذه العبوة اقتصادي جداً (٣ جنيه) مقارنة بالبدائل.',
    'يجب الحذر من الجفاف.'
  ]
},

];

