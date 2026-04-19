
import { Medication, Category } from '../../../types';

export const BETA_BLOCKERS_MEDS: Medication[] = [
 
  // 1. Concor 5 mg 30 f.c. tabs
{
  id: 'concor-5-tabs',
  name: 'Concor 5 mg 30 f.c. tabs',
  genericName: 'Bisoprolol Fumarate',
  concentration: '5mg',
  price: 72,
  matchKeywords: [
    'hypertension', 'angina', 'heart failure', 'beta blocker', 'bisoprolol', 'concor', 'tachycardia', 'rate control',
    'كونكور', 'بيسوبرولول', 'ضغط مرتفع', 'تنظيم ضربات القلب', 'ذبحة صدرية', 'فشل عضلة القلب', 'ضغط عالي', 'خفقان', 'سرعة ضربات القلب'
  ],
  usage: 'الخيار الأول لعلاج ضغط الدم المرتفع، الذبحة الصدرية المستقرة، وفشل عضلة القلب المزمن. يتميز بأنه (Cardioselective) وتأثيره قليل على الرئة.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, // 18 years
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'غير مخصص للأطفال والمراهقين أقل من ١٨ سنة إلا بجرعات معتمدة لأمراض قلب الأطفال.';
    }
  },

  warnings: [
    'ممنوع التوقف المفاجئ عن الدواء (خطر حدوث ذبحة صدرية أو ارتفاع حاد في الضغط). يجب السحب تدريجياً.',
    'يستخدم بحذر شديد مع مرضى الربو الشعبي (Asthma).',
    'قد يخفي أعراض هبوط السكر (مثل الرعشة وزيادة ضربات القلب) لدى مرضى السكري.',
    'يمنع في حالات بطء القلب الشديد (Severe Bradycardia) أو صدمة القلب.'
  ]
},

// 2. Nevilob 2.5 mg 14 tab
{
  id: 'nevilob-2.5-tabs',
  name: 'Nevilob 2.5 mg 14 tab',
  genericName: 'Nebivolol',
  concentration: '2.5mg',
  price: 46,
  matchKeywords: [
    'hypertension', 'heart failure', 'nebivolol', 'nevilob', 'beta blocker', 'vasodilator',
    'نيفيلوب', 'نيبفولول', 'ضغط', 'فشل قلبي', 'تمدد الاوعية', 'ضعف الانتصاب'
  ],
  usage: 'جيل ثالث من حاصرات البيتا، يعمل كموسع للأوعية الدموية (NO-mediated) مما يجعله ممتازاً للضغط وتأثيره أقل سلبية على الانتصاب مقارنة بغيره.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'الاستخدام للأطفال غير موصى به.';
    }
  },

  warnings: [
    'ممنوع التوقف المفاجئ عن العلاج.',
    'آمن نسبياً لمرضى السكر والدهون مقارنة بمجموعته.',
    'يمنع استخدامه في حالات قصور وظائف الكبد الشديد.',
    'قد يسبب برودة في الأطراف أو دوخة بسيطة في بداية العلاج.'
  ]
},

// 3. Nevilob 5 mg 21 tab
{
  id: 'nevilob-5-21-tabs',
  name: 'Nevilob 5 mg 21 tab',
  genericName: 'Nebivolol',
  concentration: '5mg',
  price: 99,
  matchKeywords: [
    'hypertension', 'heart failure', 'nebivolol', 'nevilob', 'beta blocker',
    'نيفيلوب ٥', 'ضغط مرتفع', 'هبوط عضلة القلب'
  ],
  usage: 'لعلاج ارتفاع ضغط الدم الأساسي، وكعلاج مساعد في حالات الفشل القلبي المزمن البسيط والمتوسط لدى كبار السن (فوق ٧٠ سنة).',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'للبالغين فقط.';
    }
  },

  warnings: [
    'لا ينصح به أثناء الحمل والرضاعة.',
    'راقب النبض؛ إذا انخفض عن ٥٥/دقيقة أعد التقييم.',
    'التوقف المفاجئ قد يسبب ارتداداً لارتفاع الضغط.'
  ]
},

// 4. Nevilob 5 mg 14 tab
{
  id: 'nevilob-5-14-tabs',
  name: 'Nevilob 5 mg 14 tab',
  genericName: 'Nebivolol',
  concentration: '5mg',
  price: 66,
  matchKeywords: [
    'hypertension', 'heart failure', 'nebivolol', 'nevilob',
    'نيفيلوب', 'علبة صغيرة', 'ضغط'
  ],
  usage: 'نفس استخدامات نيفيلوب ٥ مجم (عبوة ١٤ قرص - تكفي أسبوعين).',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'تحذير: لا يجمع مع أدوية الكالسيوم (Verapamil/Diltiazem) إلا بحذر شديد.',
    'ممنوع التوقف المفاجئ.',
    'يستخدم بحذر شديد مع مرضى الربو الشعبي.',
    'قد يخفي أعراض هبوط السكر لدى مرضى السكري.'
  ]
},

// 5. Concor Plus 5/12.5mg 30 f.c. tabs
{
  id: 'concor-plus-5-12.5',
  name: 'Concor Plus 5/12.5mg 30 f.c. tabs',
  genericName: 'Bisoprolol + Hydrochlorothiazide',
  concentration: '5mg / 12.5mg',
  price: 72,
  matchKeywords: [
    'hypertension', 'diuretic', 'combination', 'bisoprolol', 'hctz', 'concor plus',
    'كونكور بلس', 'مدر للبول', 'ضغط', 'بيسوبرولول', 'هيدروكلوروثيازيد'
  ],
  usage: 'علاج مزدوج لارتفاع ضغط الدم الذي لا يستجيب للعلاج الأحادي. يجمع بين تنظيم ضربات القلب (Bisoprolol) وإدرار البول (HCTZ).',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'غير مناسب للأطفال.';
    }
  },

  warnings: [
    'يحتوي على مدر للبول: قد يسبب انخفاض البوتاسيوم والصوديوم (يجب عمل تحاليل دورية).',
    'غير مناسب لمرضى النقرس (Gout) لأنه قد يرفع حمض اليوريك.',
    'غير مناسب لمرضى الفشل الكلوي الحاد.',
    'قد يرفع مستوى السكر في الدم قليلاً بسبب مدر البول.'
  ]
},

// 6. Nevilob Plus 5/12.5 mg 20 tab
{
  id: 'seloken-zoc-100',
  name: 'Selokenzoc 100mg 28 prolonged rel. tabs',
  genericName: 'Metoprolol Succinate',
  concentration: '100mg',
  price: 112,
  matchKeywords: [
    'angina', 'heart failure', 'arrhythmia', 'metoprolol', 'seloken', 'zoc', 'beta blocker',
    'سيلوكين زوك', 'ميتوبرولول', 'رفرفة', 'عدم انتظام الضربات', 'ذبحة', 'ممتد المفعول'
  ],
  usage: 'الذهب المعياري (Gold Standard) لعلاج فشل عضلة القلب، الذبحة الصدرية، وعدم انتظام ضربات القلب. تقنية ZOC تضمن ثبات الدواء في الدم ٢٤ ساعة.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Prolonged Release Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'للكبار فقط.';
    }
  },

  warnings: [
    'مضغ القرص يدمر تقنية الـ ZOC ويؤدي لامتصاص الجرعة كلها فجأة مما يسبب هبوطاً خطيراً.',
    'يجب الحذر الشديد مع مرضى الربو.',
    'أفضل نوع Beta Blocker لمرضى فشل القلب (Heart Failure).'
  ]
},

// 9. Selokenzoc 50 mg 28 prolonged rel. tabs
{
  id: 'seloken-zoc-50',
  name: 'Selokenzoc 50 mg 28 prolonged rel. tabs',
  genericName: 'Metoprolol Succinate',
  concentration: '50mg',
  price: 94,
  matchKeywords: [
    'angina', 'heart failure', 'arrhythmia', 'metoprolol', 'seloken',
    'سيلوكين ٥٠', 'تنظيم ضربات القلب', 'وقاية'
  ],
  usage: 'علاج وقائي للذبحة الصدرية، تنظيم ضربات القلب، وعلاج ضغط الدم. تركيز متوسط يناسب بداية العلاج.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Prolonged Release Tablet',

  minAgeMonths: 72, // Can be used in some pediatric arrhythmias under strict supervision
  maxAgeMonths: 1200,
  minWeight: 20,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'للأطفال (فوق ٦ سنوات) في حالات اضطراب النظم: تحسب بدقة (١-٢ مجم/كجم) بواسطة استشاري قلب أطفال حصراً.';
    }
  },

  warnings: [
    'لا توقف الدواء فجأة.',
    'أعد التقييم إذا كان النبض أقل من ٥٠ في الدقيقة.',
    'تفاعل دوائي مع بعض مضادات الاكتئاب (مثل Paroxetine).'
  ]
},

// 10. Bisocard 5mg 30 f.c.tab
{
  id: 'bisocard-5-tabs',
  name: 'Bisocard 5mg 30 f.c.tab',
  genericName: 'Bisoprolol Fumarate',
  concentration: '5mg',
  price: 63,
  matchKeywords: [
    'hypertension', 'angina', 'bisoprolol', 'bisocard', 'economy',
    'بيسوكارد', 'بديل كونكور', 'بيسوبرولول', 'ضغط'
  ],
  usage: 'مثيل محلي للكونكور، يستخدم لعلاج ضغط الدم المرتفع والذبحة الصدرية بفعالية جيدة وسعر اقتصادي.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'نفس محاذير الكونكور (Concor).',
    'تجنب القيادة في الأيام الأولى للعلاج لاحتمالية حدوث دوخة.',
    'ممنوع لمرضى الانسداد الرئوي المزمن (COPD) الشديد.'
  ]
} ,

// 11. Concor 10mg 30 f.c. tablets
{
  id: 'concor-10-tabs',
  name: 'Concor 10mg 30 f.c. tablets',
  genericName: 'Bisoprolol Fumarate',
  concentration: '10mg',
  price: 99,
  matchKeywords: [
    'hypertension', 'angina', 'strong beta blocker', 'bisoprolol', 'concor 10',
    'كونكور ١٠', 'بيسوبرولول', 'ضغط مرتفع', 'التركيز العالي'
  ],
  usage: 'التركيز الأقصى لعلاج ارتفاع ضغط الدم والذبحة الصدرية. يستخدم للحالات التي لم تستجب لتركيز ٥ مجم.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'يمنع استخدامه لمرضى هبوط القلب الحاد (Uncompensated Heart Failure).',
    'يجب استبعاد مشاكل الدورة الدموية الطرفية (مثل مرض رينود) قبل الاستخدام المكثف.',
    'ممنوع التوقف المفاجئ.',
    'يستخدم بحذر شديد مع مرضى الربو الشعبي.',
    'قد يخفي أعراض هبوط السكر لدى مرضى السكري.'
  ]
},

// 12. Concor Cor 2.5mg 30 tablets
{
  id: 'concor-cor-2.5',
  name: 'Concor Cor 2.5mg 30 tablets',
  genericName: 'Bisoprolol Fumarate',
  concentration: '2.5mg',
  price: 60,
  matchKeywords: [
    'heart failure', 'titration', 'weak heart', 'bisoprolol', 'concor cor',
    'كونكور كور', 'فشل عضلة القلب', 'ضعف القلب', 'جرعة بدائية'
  ],
  usage: 'مخصص لبدء العلاج (Titration) في حالات فشل عضلة القلب المزمن المستقر (Stable Chronic Heart Failure). يساعد القلب على العمل بكفاءة أكبر بجهد أقل.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'في بداية العلاج قد يحدث هبوط مؤقت في الضغط أو دوخة.',
    'زيادة الجرعة يجب أن تتم ببطء شديد حسب التشخيص والمتابعة.',
    'يراقب النبض يومياً.'
  ]
},

// 13. Inderal 40mg 50 tablets
{
  id: 'inderal-40-tabs',
  name: 'Inderal 40mg 50 tablets',
  genericName: 'Propranolol',
  concentration: '40mg',
  price: 100,
  matchKeywords: [
    'tremors', 'migraine', 'anxiety', 'thyrotoxicosis', 'portal hypertension', 'non-selective', 'inderal',
    'إندرال', 'بروبرانولول', 'رعشة اليدين', 'صداع نصفي', 'قلق', 'نشاط الغدة الدرقية', 'دوالي المريء'
  ],
  usage: 'مختلف عن باقي المجموعة (Non-selective). يستخدم أساساً لعلاج رعشة اليدين، الوقاية من الصداع النصفي، السيطرة على أعراض القلق الجسدية (خفقان)، وأعراض زيادة نشاط الغدة الدرقية.',
  timing: '٣ مرات يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 144, // Used in pediatrics for specific conditions but generally 12+ for GP app context
  maxAgeMonths: 1200,
  minWeight: 35,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٤٠ مجم ٣ مرات يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'خطر جداً: ممنوع منعاً باتاً لمرضى الربو وحساسية الصدر (يسبب ضيق شعب هوائية).',
    'قد يسبب كوابيس أو أحلام مزعجة (لأنه يعبر للحاجز الدماغي).',
    'يخفي أعراض هبوط السكر بوضوح شديد.',
    'يستخدم لمرضى تليف الكبد لتقليل ضغط الوريد البابي.'
  ]
},

// 14. Bisocard 2.5mg 30 f.c.tab.
{
  id: 'bisocard-2.5-tabs',
  name: 'Bisocard 2.5mg 30 f.c.tab.',
  genericName: 'Bisoprolol Fumarate',
  concentration: '2.5mg',
  price: 51,
  matchKeywords: [
    'heart failure', 'hypertension', 'bisoprolol', 'bisocard',
    'بيسوكارد ٢.٥', 'ضغط بسيط', 'بداية العلاج'
  ],
  usage: 'مثيل اقتصادي للكونكور كور. يستخدم لبدء علاج فشل القلب أو لعلاج الضغط البسيط جداً لدى كبار السن.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'نفس محاذير مادة البيسوبرولول.',
    'تأكد من عدم وجود ربو شعبي شديد قبل الاستخدام.'
  ]
},

// 15. Bisolock 2.5mg 30 f.c.tab
{
  id: 'bisolock-2.5-tabs',
  name: 'Bisolock 2.5mg 30 f.c.tab',
  genericName: 'Bisoprolol Fumarate',
  concentration: '2.5mg',
  price: 48,
  matchKeywords: [
    'heart failure', 'bisolock', 'beta blocker',
    'بيسولوك', 'بيسوبرولول', 'بديل اقتصادي'
  ],
  usage: 'بديل محلي جيد السعر لمادة البيسوبرولول. مناسب لجرعات البداية.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'راقب الضغط والنبض بانتظام عند بدء استخدام بديل جديد.'
  ]
},

// 16. Bisolock 5mg 30 f.c.tabs.
{
  id: 'bisolock-5-tabs',
  name: 'Bisolock 5mg 30 f.c.tabs.',
  genericName: 'Bisoprolol Fumarate',
  concentration: '5mg',
  price: 57,
  matchKeywords: [
    'hypertension', 'angina', 'bisolock',
    'بيسولوك ٥', 'علاج الضغط'
  ],
  usage: 'علاج أساسي لضغط الدم والذبحة المستقرة بجرعة متوسطة وسعر مناسب.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'لا توقف الدواء دون إعادة التقييم.'
  ]
},

// 17. Egypro 5 mg 30 tablets
{
  id: 'egypro-5-tabs',
  name: 'Egypro 5 mg 30 tablets',
  genericName: 'Bisoprolol Fumarate',
  concentration: '5mg',
  price: 63,
  matchKeywords: [
    'hypertension', 'egypro', 'bisoprolol',
    'ايجيبرو', 'بيسوبرولول', 'ضغط'
  ],
  usage: 'خيار آخر لمادة البيسوبرولول، يستخدم للتحكم في معدل ضربات القلب وضغط الدم.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'قد يسبب شعوراً بالبرودة في اليدين والقدمين (عرض جانبي مشهور للبيتا بلوكرز).'
  ]
},

// 18. Mavilor 5 mg 30 tabs.
{
  id: 'mavilor-5-tabs',
  name: 'Mavilor 5 mg 30 tabs.',
  genericName: 'Nebivolol',
  concentration: '5mg',
  price: 105,
  matchKeywords: [
    'hypertension', 'vasodilator', 'nebivolol', 'mavilor', 'erectile friendly',
    'مافيلور', 'نيبفولول', 'ضغط', 'انتصاب', 'توسيع الشرايين'
  ],
  usage: 'بديل (Generic) لمادة النيبفولول. يتميز عن البيسوبرولول بأنه يوسع الأوعية الدموية وأقل تأثيراً سلبياً على الوظيفة الجنسية لدى الرجال.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'آمن نسبياً لمرضى السكر والدهون.',
    'نادر الحدوث ولكنه قد يسبب صداع بسيط في بداية العلاج.'
  ]
},

// 19. Mavilor 2.5 mg 30 tab.
{
  id: 'mavilor-2.5-tabs',
  name: 'Mavilor 2.5 mg 30 tab.',
  genericName: 'Nebivolol',
  concentration: '2.5mg',
  price: 72,
  matchKeywords: [
    'hypertension', 'elderly', 'nebivolol', 'mavilor',
    'مافيلور ٢.٥', 'ضغط كبار السن'
  ],
  usage: 'جرعة منخفضة من النيبفولول، مثالية لبدء العلاج لكبار السن أو لمرضى الكلى.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'يستخدم بحذر في حالات فشل الكبد.'
  ]
},

// 20. Blokium Diu 100/25mg 15 tab.
{
  id: 'blokium-diu',
  name: 'Blokium Diu 100/25mg 15 tab.',
  genericName: 'Atenolol + Chlorthalidone',
  concentration: '100mg / 25mg',
  price: 25,
  matchKeywords: [
    'hypertension', 'diuretic', 'atenolol', 'old generation', 'blokium',
    'بلوكيوم ديو', 'أتينولول', 'مدر للبول', 'ضغط', 'رخيص'
  ],
  usage: 'تركيبة كلاسيكية قوية لعلاج الضغط المرتفع (مدرسة قديمة). يحتوي على أتينولول (يقلل النبض والقوة) وكلورثاليدون (مدر بول طويل المفعول).',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ١٠٠ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'انتبه: الأتينولول يذوب في الماء ويخرج عن طريق الكلى (يجب تعديل الجرعة لمرضى الكلى).',
    'المدر (Chlorthalidone) قوي وقد يسبب نقص البوتاسيوم؛ ينصح بتناول الموز أو البرتقال.',
    'قد يرفع مستوى السكر وحمض اليوريك (النقرس) أكثر من المجموعات الحديثة.',
    'أقل تفضيلاً الآن كخيار أول مقارنة بالبيسوبرولول والنيبفولول.'
  ]
},
// 21. Concor Plus 10/25mg 30 f.c. tablets
{
  id: 'mavilor-plus-5-25',
  name: 'Mavilor Plus 5/25 mg 30 tabs',
  genericName: 'Nebivolol + Hydrochlorothiazide',
  concentration: '5mg / 25mg',
  price: 108,
  matchKeywords: [
    'hypertension', 'vasodilator', 'diuretic', 'mavilor plus',
    'مافيلور بلس', 'نيبفولول', 'مدر', 'ضغط'
  ],
  usage: 'تركيبة قوية تجمع بين توسيع الشرايين (Nebivolol) وإدرار البول بجرعة عالية (25mg HCTZ).',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٥ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'نفس محاذير مدرات البول (نقص الأملاح والجفاف).',
    'يتميز بتأثير أقل ضرراً على الانتصاب مقارنة بمدرات البول التقليدية وحدها.'
  ]
},

// 23. Teklo 30 tabs (Assuming Teklo 5/5 or 5/10 - Nebivolol + Amlodipine based on price category)
{
  id: 'nevilob-amlo-5-5',
  name: 'Nevilob Amlo 5/5 mg 30 tab',
  genericName: 'Nebivolol + Amlodipine',
  concentration: '5mg / 5mg',
  price: 138,
  matchKeywords: [
    'hypertension', 'premium', 'no diuretic', 'nevilob amlo',
    'نيفيلوب أملو', 'أملوديبين', 'نيبفولول', 'ضغط عنيد'
  ],
  usage: 'من أرقى علاجات الضغط. يجمع بين حماية الأوعية الدموية (Nebivolol) وقوة خفض الضغط (Amlodipine). ممتاز لمرضى الكلى والسكر.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٥ مجم / ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'عرض جانبي شائع: تورم القدمين (بسبب الأملوديبين)، إذا كان شديداً يجب إعادة التقييم.',
    'قد يسبب هبوطاً سريعاً في الضغط في الأيام الأولى.'
  ]
},

// 26. Mavilor Plus 5/12.5 mg 30 tabs
{
  id: 'mavilor-plus-5-12.5',
  name: 'Mavilor Plus 5/12.5 mg 30 tabs',
  genericName: 'Nebivolol + Hydrochlorothiazide',
  concentration: '5mg / 12.5mg',
  price: 108,
  matchKeywords: [
    'hypertension', 'diuretic', 'mavilor',
    'مافيلور بلس', 'تركيز متوسط'
  ],
  usage: 'لعلاج ضغط الدم الذي يحتاج لإضافة مدر للبول بجرعة خفيفة.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٥ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'الحذر مع مرضى حساسية السلفا.',
    'تجنب الوقوف المفاجئ لتفادي الدوار.'
  ]
},

// 27. Betacor 80mg 30 tab
{
  id: 'betacor-80',
  name: 'Betacor 80mg 30 tab',
  genericName: 'Sotalol',
  concentration: '80mg',
  price: 75,
  matchKeywords: [
    'arrhythmia', 'afib', 'atrial fibrillation', 'sotalol', 'betacor', 'rhythm control',
    'بيتاكور', 'سوتالول', 'رفرفة', 'عدم انتظام ضربات القلب', 'ذبذبة اذينية'
  ],
  usage: 'تنبيه: هذا دواء لتنظيم ضربات القلب (Antiarrhythmic Class III) أكثر منه دواء ضغط. يستخدم للوقاية من وعلاج الرفرفة الأذينية (AFib) وتسارع القلب البطيني.',
  timing: 'مرتين يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE, // Note: Also Antiarrhythmic
  form: 'Tablet',

  minAgeMonths: 144, // Sometimes used in pediatrics for arrhythmias under strict supervision
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٨٠ مجم مرتين يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'خطير جداً: قد يسبب استطالة في موجة QT في رسم القلب (QT Prolongation) مما يؤدي لتوقف القلب.',
    'ممنوع منعاً باتاً لمرضى الفشل الكلوي دون تعديل الجرعة بدقة.',
    'يجب عمل رسم قلب دوري وقياس نسبة البوتاسيوم والمغنيسيوم.'
  ]
},

// 28. Carvid 25mg 20 tab
{
  id: 'carvid-25-20',
  name: 'Carvid 25mg 20 tab',
  genericName: 'Carvedilol',
  concentration: '25mg',
  price: 54,
  matchKeywords: [
    'heart failure', 'hypertension', 'angina', 'carvedilol', 'carvid', 'post mi',
    'كارفيد', 'كارفيديلول', 'فشل القلب', 'ضعف العضلة', 'ضغط'
  ],
  usage: 'حجر الزاوية في علاج فشل عضلة القلب (Heart Failure) وجلطات القلب السابقة. يغلق مستقبلات ألفا وبيتا.',
  timing: 'مرتين يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٢٥ مجم مرتين يومياً على معدة فارغة لمدة طويلة (مزمن)';
  },

  warnings: [
    'يسبب هبوط ضغط انتصابي (دوخة عند الوقوف) إذا أُخذ على معدة فارغة.',
    'ممنوع لمرضى الربو الشعبي.',
    'يجب سحبه تدريجياً.'
  ]
},

// 29. Carvid 25mg 30 tab
{
  id: 'carvid-25-30',
  name: 'Carvid 25mg 30 tab',
  genericName: 'Carvedilol',
  concentration: '25mg',
  price: 81,
  matchKeywords: [
    'heart failure', 'carvedilol', 'carvid',
    'كارفيد ٢٥', 'عبوة ٣٠ قرص'
  ],
  usage: 'نفس استخدامات كارفيد ٢٥ مجم (عبوة أكبر تكفي ١٥ يوماً).',
  timing: 'مرتين يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٢٥ مجم مرتين يومياً مع الأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'راقب الوزن يومياً (زيادة الوزن المفاجئة قد تعني احتباس سوائل).'
  ]
},

// 30. Carvid 6.25mg 20 tab
{
  id: 'carvid-6.25',
  name: 'Carvid 6.25mg 20 tab',
  genericName: 'Carvedilol',
  concentration: '6.25mg',
  price: 30,
  matchKeywords: [
    'heart failure', 'start dose', 'titration', 'carvedilol', 'carvid',
    'كارفيد ٦.٢٥', 'بداية العلاج', 'فشل القلب'
  ],
  usage: 'جرعة البداية (Start dose) الشائعة لعلاج فشل عضلة القلب وارتفاع ضغط الدم. يتم البدء بها ثم مضاعفتها كل أسبوعين.',
  timing: 'مرتين يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٦.٢٥ مجم مرتين يومياً مع الأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'قد تشعر بدوخة خفيفة في الأيام الأولى، لا تقلق ستزول مع الوقت.',
    'أعد التقييم فوراً في حالة ضيق التنفس الشديد.'
  ]
},

// 31. Carvid 6.25mg 30 tab
{
  id: 'carvid-6.25-30',
  name: 'Carvid 6.25mg 30 tab',
  genericName: 'Carvedilol',
  concentration: '6.25mg',
  price: 45,
  matchKeywords: [
    'heart failure', 'titration', 'carvedilol', 'carvid',
    'كارفيد', 'فشل القلب', 'عبوة ٣٠', 'بداية جرعة'
  ],
  usage: 'العبوة الاقتصادية (٣٠ قرص) من جرعة البداية لعلاج ضعف عضلة القلب. توفر استمرارية العلاج لمدة أسبوعين بجرعة حبتين يومياً.',
  timing: 'مرتين يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٦.٢٥ مجم مرتين يومياً مع الأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'التزم بالجرعة بدقة ولا ترفعها من تلقاء نفسك.',
    'راقب ضغط الدم عند الوقوف (Postural Hypotension).'
  ]
},

// 32. Ateno 50mg 20 f.c.tab
{
  id: 'ateno-50-tabs',
  name: 'Ateno 50mg 20 f.c.tab',
  genericName: 'Atenolol',
  concentration: '50mg',
  price: 20,
  matchKeywords: [
    'hypertension', 'arrhythmia', 'atenolol', 'ateno', 'cheap',
    'اتينو', 'أتينولول', 'رخيص', 'ضغط'
  ],
  usage: 'بديل اقتصادي جداً للأتينولول. يستخدم لعلاج الضغط وتنظيم ضربات القلب، ولكنه ليس الخيار الأول حالياً للوقاية من جلطات القلب مقارنة بالأنواع الحديثة.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٥٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'تنبيه هام: يخرج عن طريق الكلى، يجب تقليل الجرعة لمرضى القصور الكلوي.',
    'قد يسبب شعوراً بالإرهاق والخمول أكثر من الأدوية الحديثة.'
  ]
},

// 33. Bisocard 10mg 30 f.c.tab
{
  id: 'bisocard-10-30',
  name: 'Bisocard 10mg 30 f.c.tab',
  genericName: 'Bisoprolol Fumarate',
  concentration: '10mg',
  price: 84,
  matchKeywords: [
    'hypertension', 'angina', 'strong', 'bisocard',
    'بيسوكارد ١٠', 'ضغط عالي', 'بيسوبرولول'
  ],
  usage: 'التركيز العالي من البيسوكارد لعلاج الحالات التي لم تستجب لتركيز ٥ مجم.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'لا تتوقف عن الدواء فجأة.',
    'تأكد من أن معدل النبض لا يقل عن ٥٥ في الدقيقة قبل تناول الجرعة.'
  ]
},

// 34. Bistol 5mg 20 f.c.tab
{
  id: 'bistol-5-tabs',
  name: 'Bistol 5mg 20 f.c.tab',
  genericName: 'Bisoprolol Fumarate',
  concentration: '5mg',
  price: 34,
  matchKeywords: [
    'hypertension', 'bistol', 'bisoprolol',
    'بيستول', 'بيسوبرولول', 'بديل'
  ],
  usage: 'منتج محلي آخر لمادة البيسوبرولول بسعر منافس. جيد لمرضى التأمين أو البحث عن بدائل اقتصادية.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'نفس محاذير الكونكور.'
  ]
},

// 35. Bisolock 10mg 30 f.c.tab
{
  id: 'bisolock-10-30',
  name: 'Bisolock 10mg 30 f.c.tab',
  genericName: 'Bisoprolol Fumarate',
  concentration: '10mg',
  price: 78,
  matchKeywords: [
    'hypertension', 'bisolock', 'strong',
    'بيسولوك ١٠', 'ضغط مرتفع'
  ],
  usage: 'لعلاج ضغط الدم المرتفع والذبحة الصدرية (عبوة ٣٠ قرص - تكفي شهر).',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'ممنوع لمرضى فشل القلب غير المستقر.'
  ]
},

// 36. Nebilet 5mg 14 tab
{
  id: 'nebilet-5-tabs',
  name: 'Nebilet 5mg 14 tab',
  genericName: 'Nebivolol',
  concentration: '5mg',
  price: 102,
  matchKeywords: [
    'hypertension', 'original brand', 'pfizer', 'vasodilator', 'nebilet', 'ed friendly',
    'نيبيليت', 'البراند', 'الأصلي', 'نيبفولول', 'ضغط', 'انتصاب'
  ],
  usage: 'الدواء الأصلي (Originator Brand). أعلى جودة في مادته الفعالة. يتميز بقدرة فريدة على إطلاق أكسيد النيتريك (NO) لتوسيع الشرايين، مما يجعله الأفضل لمرضى الضغط الشباب أو من يقلقون بشأن الضعف الجنسي.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'سعره مرتفع مقارنة بالبدائل، لكن فعاليته وقلة أعراضه الجانبية تبرر ذلك.',
    'ممنوع لمرضى الكبد الحاد.'
  ]
},

// 37. Tenormin 100mg 28 f.c.tab
{
  id: 'tenormin-100-tabs',
  name: 'Tenormin 100mg 28 f.c.tab',
  genericName: 'Atenolol',
  concentration: '100mg',
  price: 60,
  matchKeywords: [
    'hypertension', 'classic', 'atenolol', 'tenormin', 'brand',
    'تينورمين', 'اتينولول', 'القديم', 'البراند', 'ضغط'
  ],
  usage: 'البراند الأصلي للأتينولول. دواء قوي لعلاج الضغط والذبحة، ولكنه "مدرسة قديمة". لا يعبر للحاجز الدماغي بسهولة (Less CNS effects) ولكنه لا يحمي القلب بنفس كفاءة البيسوبرولول.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ١٠٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'هام: يتراكم في الجسم في حالات الفشل الكلوي (يجب تقليل الجرعة).',
    'قد يسبب برودة الأطراف بشكل ملحوظ.',
    'لا ينصح ببدء العلاج به حديثاً كخيار أول (Guidelines تفضل البيسوبرولول والنيبفولول).'
  ]
},

// 38. Tenormin 50mg 28 f.c.tab
{
  id: 'tenormin-50-tabs',
  name: 'Tenormin 50mg 28 f.c.tab',
  genericName: 'Atenolol',
  concentration: '50mg',
  price: 42,
  matchKeywords: [
    'hypertension', 'angina', 'atenolol', 'tenormin',
    'تينورمين ٥٠', 'اتينولول', 'ضغط'
  ],
  usage: 'الجرعة المتوسطة من التينورمين. تستخدم للسيطرة على الضغط ومعدل ضربات القلب.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٥٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'لا توقف الدواء فجأة لتجنب الذبحة المرتدة.',
    'اقل فعالية في منع السكتات الدماغية مقارنة بمجموعات الضغط الأخرى.'
  ]
},

// 39. Bisolock 10mg 20 f.c.tab
{
  id: 'bisolock-10-20',
  name: 'Bisolock 10mg 20 f.c.tab',
  genericName: 'Bisoprolol Fumarate',
  concentration: '10mg',
  price: 28,
  matchKeywords: [
    'hypertension', 'bisolock', 'economy pack',
    'بيسولوك ١٠', 'عبوة صغيرة'
  ],
  usage: 'عبوة اقتصادية أصغر (٢٠ قرص) من البيسولوك ١٠ مجم.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'تأكد من تاريخ الصلاحية وسلامة الشريط.'
  ]
},

// 40. Inderal 10 mg 50 tabs
{
  id: 'inderal-10-tabs',
  name: 'Inderal 10 mg 50 tabs',
  genericName: 'Propranolol',
  concentration: '10mg',
  price: 75,
  matchKeywords: [
    'anxiety', 'palpitations', 'tremors', 'migraine', 'thyrotoxicosis', 'inderal',
    'إندرال ١٠', 'قلق', 'رعشة', 'خفقان', 'امتحانات', 'غدة درقية'
  ],
  usage: 'الجرعة الصغيرة "الجوكر". تستخدم بكثرة للسيطرة على الأعراض الجسدية للقلق (الخفقان والرعشة) قبل المواقف الموترة، علاج الرعشة الأساسية، السيطرة على أعراض نشاط الغدة الدرقية، والوقاية من الصداع النصفي.',
  timing: '٣ مرات يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 72, // Can be used in children for specific indications like hemangioma or migraine under strict supervision
  maxAgeMonths: 1200,
  minWeight: 20,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths < 144) {
      return 'للأطفال: تُحدد الجرعة حسب التشخيص والوزن (مثلاً للصداع النصفي أو الورم الوعائي).';
  }
    return 'للقلق: قرص أو قرصين قبل الموقف بساعة. للرعشة والغدة: قرص واحد ٣ مرات يومياً.';
  },

  warnings: [
    'ممنوع لمرضى الربو (Asthma) حتى بجرعة ١٠ مجم.',
    'يسبب انخفاض الضغط، لذا لا يفضل لمرضى الضغط المنخفض.',
    'قد يسبب أحلاماً مزعجة.'
  ]
},
// 41. Nerkardou 2.5 mg 30 orodispersible films
{
  id: 'nerkardou-2.5-films',
  name: 'Nerkardou 2.5 mg 30 orodispersible films',
  genericName: 'Bisoprolol Fumarate',
  concentration: '2.5mg',
  price: 60,
  matchKeywords: [
    'hypertension', 'dysphagia', 'film', 'fast release', 'nerkardou',
    'نيركاردو', 'بيسوبرولول', 'فيلم يذوب', 'صعوبة البلع', 'كبار السن'
  ],
  usage: 'تكنولوجيا حديثة (أفلام تذوب في الفم) لمادة البيسوبرولول. الحل المثالي لمرضى كبار السن، مرضى السكتات الدماغية، أو من يعانون من صعوبة في بلع الأقراص (Dysphagia).',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Orodispersible Film',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ فيلم ٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'تأكد من جفاف اليدين قبل إمساك الفيلم.',
    'نفس محاذير أقراص الكونكور (الربو، بطء القلب).',
    'سريع الامتصاص نسبياً.'
  ]
},

// 42. Nerkardou 5 mg 30 orodispersible films
{
  id: 'nerkardou-5-films',
  name: 'Nerkardou 5 mg 30 orodispersible films',
  genericName: 'Bisoprolol Fumarate',
  concentration: '5mg',
  price: 90,
  matchKeywords: [
    'hypertension', 'angina', 'film', 'nerkardou',
    'نيركاردو ٥', 'ضغط', 'أفلام'
  ],
  usage: 'الجرعة المتوسطة من أفلام البيسوبرولول لعلاج الضغط والذبحة لمن لا يفضلون الأقراص.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Orodispersible Film',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ فيلم ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'حساس للرطوبة جداً، يجب استخدامه فور فتح الغلاف.',
    'ممنوع التوقف المفاجئ.'
  ]
},

// 43. Cosimprel 5/5 mg 15 f.c. tabs
{
  id: 'cosimprel-5-5',
  name: 'Cosimprel 5/5 mg 15 f.c. tabs',
  genericName: 'Bisoprolol + Perindopril',
  concentration: '5mg / 5mg',
  price: 140,
  matchKeywords: [
    'hypertension', 'cad', 'heart failure', 'ace inhibitor', 'combination', 'cosimprel',
    'كوسيمبريل', 'بيسوبرولول', 'بيريندوبريل', 'قصور الشريان التاجي', 'حماية القلب'
  ],
  usage: 'تركيبة "ثنائية الحماية" (Dual Blockade). يجمع بين (Beta Blocker) لراحة القلب و (ACE Inhibitor) لمنع إعادة تشكيل عضلة القلب (Remodeling). الخيار الأفضل لمرضى قصور الشريان التاجي وضغط الدم.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE, // Note: Also contains ACEI
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٥ مجم / ٥ مجم مرة يومياً قبل الأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'هام جداً: ممنوع تماماً للحوامل (يحتوي على ACE Inhibitor يسبب تشوهات جنينية).',
    'قد يسبب كحة جافة (Dry Cough) بسبب مادة البيريندوبريل.',
    'يجب متابعة وظائف الكلى والبوتاسيوم بانتظام.'
  ]
},

// 44. Bistol Plus 5/12.5 mg 20 f.c.tab
{
  id: 'bistol-plus-5-12.5',
  name: 'Bistol Plus 5/12.5 mg 20 f.c.tab',
  genericName: 'Bisoprolol + Hydrochlorothiazide',
  concentration: '5mg / 12.5mg',
  price: 36,
  matchKeywords: [
    'hypertension', 'diuretic', 'bistol plus',
    'بيستول بلس', 'مدر', 'رخيص'
  ],
  usage: 'بديل اقتصادي جداً للكونكور بلس. لعلاج ضغط الدم المتوسط.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٥ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'تأكد من شرب السوائل لتجنب الجفاف.'
  ]
},

// 45. Cosimprel 5/10 mg 15 f.c. tabs
{
  id: 'cosimprel-5-10',
  name: 'Cosimprel 5/10 mg 15 f.c. tabs',
  genericName: 'Bisoprolol + Perindopril',
  concentration: '5mg / 10mg',
  price: 140,
  matchKeywords: [
    'hypertension', 'strong ace inhibitor', 'cosimprel',
    'كوسيمبريل', 'بيريندوبريل ١٠', 'حماية قصوى'
  ],
  usage: 'يحتوي على جرعة مضاعفة من (ACE Inhibitor) لحماية أقوى للأوعية الدموية وعلاج الضغط المرتفع المصحوب بأمراض القلب.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٥ مجم / ١٠ مجم مرة يومياً قبل الأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'خطر حدوث هبوط حاد في الضغط (First dose hypotension) خاصة لمرضى نقص السوائل.',
    'نفس محاذير الحمل والكلى.'
  ]
},

// 46. Bisolock-D 5/12.5mg 20 f.c.tab
{
  id: 'bistol-plus-5-6.25',
  name: 'Bistol Plus 5/6.25mg 20 f.c.tab',
  genericName: 'Bisoprolol + Hydrochlorothiazide',
  concentration: '5mg / 6.25mg',
  price: 34,
  matchKeywords: [
    'hypertension', 'mild diuretic', 'elderly', 'bistol plus',
    'بيستول بلس', 'مدر خفيف', 'كبار السن', 'ضغط'
  ],
  usage: 'يتميز بجرعة منخفضة جداً من مدر البول (6.25mg). مثالي لكبار السن أو من يعانون من آثار جانبية للمدرات (مثل كثرة التبول الشديدة) ولكنهم بحاجة لضبط الضغط.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٥ مجم / ٦.٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'أقل احتمالية للتسبب في اضطراب الأملاح مقارنة بتركيز ١٢.٥ مجم.'
  ]
},

// 48. Concor Amlo 5/5 mg 30 tabs
{
  id: 'concor-amlo-5-5',
  name: 'Concor Amlo 5/5 mg 30 tabs',
  genericName: 'Bisoprolol + Amlodipine',
  concentration: '5mg / 5mg',
  price: 210,
  matchKeywords: [
    'hypertension', 'premium', 'calcium channel blocker', 'concor amlo', 'merck',
    'كونكور أملو', 'أملوديبين', 'ضغط', 'مستورد'
  ],
  usage: 'التركيبة "البريميوم" من شركة ميرك. تجمع بين كونكور وأملوديبين. قوة مزدوجة لخفض الضغط بدون مدر للبول. آمن وممتاز لمرضى السكر والربو الكامن.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٥ مجم / ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'راقب حدوث تورم في الكاحل (Side effect of Amlodipine).',
    'سعره مرتفع ولكنه يوفر حماية ممتازة.'
  ]
},

// 49. Mavilor 10mg 30 tab
{
  id: 'mavilor-10-tabs',
  name: 'Mavilor 10mg 30 tab',
  genericName: 'Nebivolol',
  concentration: '10mg',
  price: 159,
  matchKeywords: [
    'hypertension', 'high dose', 'mavilor', 'nebivolol',
    'مافيلور ١٠', 'نيبفولول', 'جرعة عالية'
  ],
  usage: 'الجرعة القصوى من مادة النيبفولول. تستخدم لحالات الضغط العنيد التي تحتاج لتوسيع قوي للشرايين مع تقليل عمل القلب.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 55,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'قد يسبب صداعاً أو خفقاناً بسيطاً في البداية نتيجة توسع الأوعية.',
    'تأكد من سلامة وظائف الكبد.'
  ]
},

// 50. Cardilol 25mg 30 tab
{
  id: 'cardilol-25-30',
  name: 'Cardilol 25mg 30 tab',
  genericName: 'Carvedilol',
  concentration: '25mg',
  price: 70.5,
  matchKeywords: [
    'heart failure', 'hypertension', 'carvedilol', 'cardilol',
    'كارديلول', 'كارفيديلول', 'فشل القلب'
  ],
  usage: 'بديل ممتاز للكارفيد. يستخدم للوصول للجرعة المستهدفة في علاج فشل عضلة القلب (Target Dose).',
  timing: 'مرتين يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٢٥ مجم مرتين يومياً مع الأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'ممنوع لمرضى حساسية الصدر.',
    'الانتقال لهذه الجرعة يجب أن يكون تدريجياً.'
  ]
},
// 51. Carvedilol 25mg 30 tab
{
  id: 'carvedilol-25-generic',
  name: 'Carvedilol 25mg 30 tab',
  genericName: 'Carvedilol',
  concentration: '25mg',
  price: 42,
  matchKeywords: [
    'heart failure', 'generic', 'carvedilol', 'hypertension',
    'كارفيديلول', 'جينيريك', 'فشل القلب', 'رخيص'
  ],
  usage: 'الاسم العلمي (Generic) للدواء. يستخدم كعلاج أساسي لفشل عضلة القلب وضغط الدم. يغلق مستقبلات ألفا وبيتا.',
  timing: 'مرتين يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٢٥ مجم مرتين يومياً مع الأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'ممنوع لمرضى الربو الشعبي.',
    'راقب الوزن يومياً لاكتشاف احتباس السوائل مبكراً.'
  ]
},

// 52. Dilatrol 6.25mg 30 tab
{
  id: 'dilatrol-6.25-30',
  name: 'Dilatrol 6.25mg 30 tab',
  genericName: 'Carvedilol',
  concentration: '6.25mg',
  price: 48,
  matchKeywords: [
    'heart failure', 'start dose', 'dilatrol', 'sedico',
    'ديلات رول', 'كارفيديلول', 'بداية', 'سيديكو'
  ],
  usage: 'منتج شركة "سيديكو". جرعة بداية ممتازة لمرضى ضعف عضلة القلب (Start low and go slow).',
  timing: 'مرتين يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٦.٢٥ مجم مرتين يومياً مع الأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'قد يسبب انخفاض ضغط مؤقت عند الوقوف.'
  ]
},

// 53. Cardilol 6.25mg 30 tab
{
  id: 'cardilol-6.25-30',
  name: 'Cardilol 6.25mg 30 tab',
  genericName: 'Carvedilol',
  concentration: '6.25mg',
  price: 39,
  matchKeywords: [
    'heart failure', 'titration', 'cardilol',
    'كارديلول ٦.٢٥', 'بداية العلاج'
  ],
  usage: 'خيار اقتصادي آخر لبدء علاج الكارفيديلول.',
  timing: 'مرتين يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٦.٢٥ مجم مرتين يومياً مع الأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'التزم بالعلامة التجارية الواحدة قدر الإمكان.'
  ]
},

// 54. Labipress 100 mg 30 f.c. tab.
{
  id: 'labipress-100',
  name: 'Labipress 100 mg 30 f.c. tab.',
  genericName: 'Labetalol',
  concentration: '100mg',
  price: 69,
  matchKeywords: [
    'pregnancy', 'preeclampsia', 'hypertension', 'labipress', 'labetalol', 'safe in pregnancy',
    'لابيبريس', 'لابيتالول', 'ضغط الحمل', 'تسمم الحمل', 'آمن للحامل'
  ],
  usage: 'الدواء رقم ١ لعلاج ارتفاع ضغط الدم أثناء الحمل (Pre-eclampsia). آمن جداً على الجنين. يعمل عن طريق غلق مستقبلات ألفا وبيتا.',
  timing: '٣ مرات يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE, // Alpha/Beta Blocker
  form: 'Film-coated Tablet',

  minAgeMonths: 192, // 16 years (often relevant for young pregnancies)
  maxAgeMonths: 600, // Typically up to 50s for this specific indication, but safe for all
  minWeight: 45,
  maxWeight: 150,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ١٠٠ مجم ٣ مرات يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'آمن للحمل والرضاعة.',
    'قد يسبب شعوراً بالتنميل في فروة الرأس (Scalp tingling) - عرض جانبي مميز وبسيط.',
    'ممنوع لمرضى الربو (Asthma).'
  ]
},

// 55. Ateno 100mg 20 f.c.tab.
{
  id: 'ateno-100-20',
  name: 'Ateno 100mg 20 f.c.tab.',
  genericName: 'Atenolol',
  concentration: '100mg',
  price: 26,
  matchKeywords: [
    'hypertension', 'strong', 'ateno', 'atenolol',
    'اتينو ١٠٠', 'اتينولول', 'ضغط عالي'
  ],
  usage: 'جرعة عالية من الأتينولول. تستخدم للمرضى المستقرين على هذا العلاج منذ سنوات.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ١٠٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'يجب تعديل الجرعة لمرضى الكلى.',
    'قد يسبب ضعفاً جنسياً أكثر من المجموعات الحديثة (Nebivolol).'
  ]
},

// 56. Bistol 2.5mg 20 f.c.tab.
{
  id: 'bistol-2.5-20',
  name: 'Bistol 2.5mg 20 f.c.tab.',
  genericName: 'Bisoprolol Fumarate',
  concentration: '2.5mg',
  price: 28,
  matchKeywords: [
    'heart failure', 'bistol', 'low dose',
    'بيستول ٢.٥', 'بداية', 'فشل قلب'
  ],
  usage: 'جرعة منخفضة لبدء العلاج.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'لا توقف الدواء فجأة.'
  ]
},

// 57. Nerkardou 10 mg 30 orodispersible films
{
  id: 'nerkardou-10-films',
  name: 'Nerkardou 10 mg 30 orodispersible films',
  genericName: 'Bisoprolol Fumarate',
  concentration: '10mg',
  price: 90,
  matchKeywords: [
    'hypertension', 'dysphagia', 'film', 'high dose', 'nerkardou',
    'نيركاردو ١٠', 'أفلام', 'جرعة عالية'
  ],
  usage: 'الجرعة القصوى من البيسوبرولول في صورة أفلام سريعة الذوبان.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Orodispersible Film',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ فيلم ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'تأكد من عدم وجود بطء شديد في القلب قبل تناول هذه الجرعة العالية.'
  ]
},

// 58. Nebasco 5 mg 30 tablets
{
  id: 'nebasco-5-30',
  name: 'Nebasco 5 mg 30 tablets',
  genericName: 'Nebivolol',
  concentration: '5mg',
  price: 105,
  matchKeywords: [
    'hypertension', 'vasodilator', 'nebasco', 'nebivolol',
    'نيباسكو', 'نيبفولول', 'ضغط'
  ],
  usage: 'نيبفولول بجودة عالية. يوسع الشرايين ويحافظ على كفاءة عضلة القلب.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'يعتبر من أقل أدوية الضغط تسبباً في الأعراض الجانبية.'
  ]
},

// 59. Normocard 10mg 30 tab.
{
  id: 'normocard-10',
  name: 'Normocard 10mg 30 tab.',
  genericName: 'Amlodipine Besylate', // Important Correction
  concentration: '10mg',
  price: 84,
  matchKeywords: [
    'hypertension', 'calcium channel blocker', 'amlodipine', 'normocard', 'edema',
    'نورموكارد ١٠', 'أملوديبين', 'كالسيوم', 'ضغط'
  ],
  usage: 'تنبيه: هذا دواء (Calcium Channel Blocker) وليس بيتا بلوكر. يستخدم لعلاج الضغط المرتفع والذبحة الصدرية عن طريق توسيع الشرايين بقوة.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE, // Changed Category
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'أشهر عرض جانبي: تورم في الكاحل والقدمين (Ankle Edema) - هذا طبيعي ولا يستدعي القلق إلا إذا كان شديداً.',
    'قد يسبب إمساكاً لدى كبار السن.',
    'لا يؤثر على ضربات القلب مثل البيتا بلوكرز.'
  ]
},

// 60. Normocard 5mg 30 tab.
{
  id: 'normocard-5',
  name: 'Normocard 5mg 30 tab.',
  genericName: 'Amlodipine Besylate',
  concentration: '5mg',
  price: 54,
  matchKeywords: [
    'hypertension', 'amlodipine', 'normocard',
    'نورموكارد ٥', 'أملوديبين'
  ],
  usage: 'علاج فعال لضغط الدم (CCB). مناسب لمرضى الربو ومرضى السكر لأنه لا يؤثر على الشعب الهوائية أو مستويات السكر.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE, // Changed Category
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'قد يسبب صداع (Vasodilation headache) في بداية الاستخدام.',
    'تورم القدمين عرض شائع.'
  ]
},
// 61. Cardivo-care 10/6.25mg 30 f.c.tab.
{
  id: 'dilatrol-25-30',
  name: 'Dilatrol 25mg 30 tab.',
  genericName: 'Carvedilol',
  concentration: '25mg',
  price: 75,
  matchKeywords: [
    'heart failure', 'hypertension', 'dilatrol', 'carvedilol',
    'ديلات رول ٢٥', 'كارفيديلول', 'فشل القلب'
  ],
  usage: 'الجرعة المستهدفة (Target Dose) لعلاج فشل عضلة القلب. الوصول لهذه الجرعة يعني حماية قصوى للقلب وتقليل الوفيات.',
  timing: 'مرتين يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٢٥ مجم مرتين يومياً مع الأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'لا تبدأ بهذه الجرعة أبداً لمريض لم يأخذ الدواء من قبل.'
  ]
},

// 64. Selokenzoc 25 mg 28 prolonged rel. tabs
{
  id: 'seloken-zoc-25',
  name: 'Selokenzoc 25 mg 28 prolonged rel. tabs',
  genericName: 'Metoprolol Succinate',
  concentration: '25mg',
  price: 94,
  matchKeywords: [
    'heart failure', 'angina', 'seloken', 'zoc', 'start dose',
    'سيلوكين زوك', 'بداية', 'فشل عضلة القلب', 'ميتوبرولول'
  ],
  usage: 'أهم جرعة لبدء علاج ضعف عضلة القلب (Heart Failure). تقنية الـ ZOC تضمن مستوى ثابت للدواء في الدم وتمنع التذبذب.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Prolonged Release Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'مضغ القرص يفسد تقنية الإفراج الممتد وقد يسبب هبوطاً.',
    'أفضل خيار لمرضى القلب الذين يعانون من الربو البسيط (أكثر أماناً من الكارفيديلول).'
  ]
},

// 65. Bistol 10mg 20 f.c. tab.
{
  id: 'bistol-10-20',
  name: 'Bistol 10mg 20 f.c. tab.',
  genericName: 'Bisoprolol Fumarate',
  concentration: '10mg',
  price: 42,
  matchKeywords: [
    'hypertension', 'strong', 'bistol',
    'بيستول ١٠', 'بيسوبرولول'
  ],
  usage: 'جرعة قوية من البيسوبرولول بسعر اقتصادي.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'تأكد من عدم وجود بطء في النبض.'
  ]
},

// 66. Blokium 100mg 15 tab.
{
  id: 'blokium-100-15',
  name: 'Blokium 100mg 15 tab.',
  genericName: 'Atenolol',
  concentration: '100mg',
  price: 11.8,
  matchKeywords: [
    'hypertension', 'classic', 'cheap', 'blokium',
    'بلوكيوم', 'رخيص جدا', 'أتينولول', 'ضغط'
  ],
  usage: 'الخيار الأرخص لعلاج الضغط. دواء قديم (Atenolol) ولكنه فعال للحالات المستقرة.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ١٠٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'يفرز عن طريق الكلى (Water Soluble)، لذا تتراكم جرعته في مرضى الكلى.',
    'أقل فاعلية في حماية القلب مقارنة بالأدوية الحديثة.'
  ]
},

// 67. Bisocard 2.5 mg 30 tab. (Listed as Normocard in image due to app error)
{
  id: 'bisocard-2.5-30',
  name: 'Bisocard 2.5 mg 30 tab.',
  genericName: 'Bisoprolol Fumarate',
  concentration: '2.5mg',
  price: 51,
  matchKeywords: [
    'heart failure', 'start dose', 'bisocard', 'bisoprolol',
    'بيسوكارد ٢.٥', 'بيسوبرولول', 'فشل قلب'
  ],
  usage: 'تم التصحيح: الصورة تظهر "Normocard" ولكن المادة الفعالة والسعر يؤكدان أنه "Bisocard". يستخدم لبدء علاج فشل القلب.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'انتبه: Normocard الفعلي هو (Amlodipine)، تأكد من العلبة.'
  ]
},

// 68. Napvol 5 mg 30 tabs.
{
  id: 'napvol-5-30',
  name: 'Napvol 5 mg 30 tabs.',
  genericName: 'Nebivolol',
  concentration: '5mg',
  price: 60,
  matchKeywords: [
    'hypertension', 'vasodilator', 'napvol', 'nebivolol',
    'نابفول', 'نيبفولول', 'ضغط'
  ],
  usage: 'بديل اقتصادي لمادة النيبفولول. ممتاز للضغط مع الحفاظ على الانتصاب.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'آمن لمرضى السكر.'
  ]
},

// 69. Ateno-C 50/25mg 20 tab.
{
  id: 'ateno-c-50-25',
  name: 'Ateno-C 50/25mg 20 tab.',
  genericName: 'Atenolol + Chlorthalidone',
  concentration: '50mg / 25mg',
  price: 14,
  matchKeywords: [
    'hypertension', 'diuretic', 'ateno c',
    'اتينو سي', 'مدر', 'رخيص'
  ],
  usage: 'تركيبة كلاسيكية لعلاج الضغط. تحتوي على مدر للبول قوي (Chlorthalidone).',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٥٠ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'قد يسبب نقص البوتاسيوم.'
  ]
},

// 70. Bisolock-D 10/25mg 20 f.c.tab
{
  id: 'bisolock-d-10-25',
  name: 'Bisolock-D 10/25mg 20 f.c.tab',
  genericName: 'Bisoprolol + Hydrochlorothiazide',
  concentration: '10mg / 25mg',
  price: 62,
  matchKeywords: [
    'hypertension', 'strong diuretic', 'bisolock d',
    'بيسولوك دي', 'مدر قوي', 'ضغط عالي'
  ],
  usage: 'جرعة عالية من البيسوبرولول والمدر. للضغط المرتفع العنيد.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ١٠ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'تابع وظائف الكلى والأملاح.'
  ]
},

// 71. Nebilet Plus 5/25mg 14 tab.
{
  id: 'nebilet-plus-5-12.5',
  name: 'Nebilet Plus 5/12.5mg 14 tab.',
  genericName: 'Nebivolol + Hydrochlorothiazide',
  concentration: '5mg / 12.5mg',
  price: 101,
  matchKeywords: [
    'hypertension', 'diuretic', 'nebilet plus',
    'نيبيليت بلس', 'مدر متوسط'
  ],
  usage: 'النسخة الأصلية بجرعة مدر للبول متوسطة.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٥ مجم / ١٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'مناسب لمرضى السكر.'
  ]
},

// 73. Tenoretic 100/25mg 14 f.c.tab.
{
  id: 'tenoretic-100-25',
  name: 'Tenoretic 100/25mg 14 f.c.tab.',
  genericName: 'Atenolol + Chlorthalidone',
  concentration: '100mg / 25mg',
  price: 37,
  matchKeywords: [
    'hypertension', 'classic', 'brand', 'tenoretic',
    'تينوريتيك', 'اتينولول', 'مدر', 'قديم'
  ],
  usage: 'الدواء الكلاسيكي الأشهر لعلاج الضغط. تركيبة قوية جداً ولكنها قديمة. تستخدم للحالات المستقرة عليها.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ١٠٠ مجم / ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'قد يسبب برودة الأطراف وكوابيس.',
    'Chlorthalidone مدر قوي جداً، تابع البوتاسيوم.'
  ]
},

// 74. Co-Dilatrol 30 tab.
{
  id: 'labipress-200',
  name: 'Labipress 200 mg 30 f.c.tab.',
  genericName: 'Labetalol',
  concentration: '200mg',
  price: 105,
  matchKeywords: [
    'pregnancy', 'preeclampsia', 'emergency', 'labipress', 'high dose',
    'لابيبريس ٢٠٠', 'ضغط الحمل', 'تسمم الحمل', 'جرعة عالية'
  ],
  usage: 'الجرعة المضاعفة لعلاج ضغط الحمل الشديد (Severe Preeclampsia) أو حالات الضغط الطارئة. آمن تماماً للأم والجنين.',
  timing: 'مرة يومياً – مزمن',
   category: Category.ANTIHYPERTENSIVE,
  form: 'Film-coated Tablet',

  minAgeMonths: 192,
  maxAgeMonths: 600,
  minWeight: 50,
  maxWeight: 150,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٢٠٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'قد يسبب تنميل في فروة الرأس.',
    'ممنوع لمرضى الربو.'
  ]
},

];

