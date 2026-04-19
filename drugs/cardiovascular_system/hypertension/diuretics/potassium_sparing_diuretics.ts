
import { Medication, Category } from '../../../../types';

export const POTASSIUM_SPARING_DIURETICS_MEDS: Medication[] = [
 
 // 1. Teklo 30 tabs
{
  id: 'teklo-30-tab',
  name: 'Teklo 30 tabs',
  genericName: 'Chlorthalidone', 
  concentration: '25mg',
  price: 81, 
  matchKeywords: [
    'hypertension', 'chlorthalidone', 'teklo', 'thiazide-like', 'long acting diuretic',
    'تيكلو', 'كلورثاليدون', 'مدر للبول', 'ضغط مرتفع', 'طويل المفعول'
  ],
  usage: 'علاج ارتفاع ضغط الدم الأساسي. يتميز بمفعوله الطويل جداً الذي يضمن سيطرة مستمرة على ضغط الدم لمدة تزيد عن ٢٤ ساعة، وهو الخيار المفضل في المبادئ التوجيهية المعتمدة لتقليل مخاطر السكتة الدماغية وفشل القلب.',
  timing: 'مرة يومياً – مزمن',
  category: Category.THIAZIDE_LIKE_DIURETICS,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    return 'غير مخصص لمن دون ١٨ سنة.';
  },

  warnings: [
    'قد يسبب انخفاضاً ملحوظاً في مستوى البوتاسيوم والماغنسيوم في الدم أكثر من مدرات البول الأخرى.',
    'يجب استخدامه بحذر مع مرضى النقرس لأنه قد يرفع مستوى حمض اليوريك.',
    'قد يؤثر على مستوى السكر في الدم لدى مرضى السكري، لذا يلزم المتابعة.',
    'يمنع استخدامه في حالات الفشل الكلوي الحاد أو الحساسية لمركبات السلفا.'
  ]
},

 // 2. Lasilactone 50/20 mg 30 tabs
{
  id: 'lasilactone-50-20',
  name: 'Lasilactone 50/20 mg 30 tabs',
  genericName: 'Spironolactone + Furosemide',
  concentration: '50mg / 20mg',
  price: 126,
  matchKeywords: [
    'edema', 'ascites', 'lasilactone', 'liver cirrhosis', 'diuretic',
    'لازيلاكتون', 'سبيرونولاكتون', 'استسقاء', 'تليف كبد', 'مدر'
  ],
  usage: 'تركيبة متوازنة لعلاج التورم والاستسقاء (خاصة لمرضى الكبد). السبيرونولاكتون (٥٠ مجم) يعادل فقد البوتاسيوم الناتج عن الفورسيميد.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ALDOSTERONE_ANTAGONISTS,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ٥٠ مجم / ٢٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    return 'غير مخصص للأطفال.';
  },

  warnings: [
    'يجب متابعة مستوى البوتاسيوم في الدم (خطر الارتفاع Hyperkalemia).',
    'يمنع استخدامه في حالات الفشل الكلوي الحاد.',
    'قد يسبب تثدي الرجال (Gynecomastia) عند الاستخدام الطويل.'
  ]
},

// 3. Lasilactone 100/20 mg 30 f.c.tab
{
  id: 'lasilactone-100-20',
  name: 'Lasilactone 100/20 mg 30 f.c.tab',
  genericName: 'Spironolactone + Furosemide',
  concentration: '100mg / 20mg',
  price: 186,
  matchKeywords: [
    'ascites', 'liver cirrhosis', 'lasilactone 100', 'strong diuretic',
    'لازيلاكتون ١٠٠', 'استسقاء البطن', 'تليف الكبد', 'مدر قوي'
  ],
  usage: 'يحتوي على جرعة عالية من السبيرونولاكتون (١٠٠ مجم). هو الخيار الأمثل والأساسي لعلاج الاستسقاء الناتج عن تليف الكبد (Liver Cirrhosis Ascites).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ALDOSTERONE_ANTAGONISTS,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ١٠٠ مجم / ٢٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    return 'غير مخصص للأطفال.';
  },

  warnings: [
    'خطر ارتفاع البوتاسيوم (Hyperkalemia) وارد جداً، مما قد يؤثر على القلب.',
    'يسبب النعاس والدوار، يرجى الحذر عند القيادة.',
    'التثدي (تضخم الثدي عند الرجال) عرض جانبي شائع مع جرعة ١٠٠ مجم.'
  ]
},

// 4. Eraloner 25 mg 20 f.c.tab
{
  id: 'eraloner-25',
  name: 'Eraloner 25 mg 20 f.c.tab',
  genericName: 'Eplerenone',
  concentration: '25mg',
  price: 136,
  matchKeywords: [
    'heart failure', 'eraloner', 'eplerenone', 'selective', 'no gynecomastia',
    'يرالونر', 'ابليرينون', 'فشل القلب', 'بديل الدكتون', 'بدون تثدي'
  ],
  usage: 'مضاد انتقائي للألدوستيرون (Selective Aldosterone Antagonist). يستخدم أساساً لتقليل الوفيات وتحسين عضلة القلب بعد الجلطات (Post-MI) وفي حالات فشل القلب، دون الآثار الجانبية الهرمونية للسبيرونولاكتون.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ALDOSTERONE_ANTAGONISTS, // Also CARDIAC_THERAPY
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'غير مخصص للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه إذا كان البوتاسيوم في الدم > 5.0 mEq/L.',
    'يمنع استخدامه لمرضى الفشل الكلوي الشديد (CrCl < 30).',
    'يجب تجنب الأدوية التي ترفع البوتاسيوم ومكملات البوتاسيوم.'
  ]
},

// 5. Eraloner 50 mg 20 f.c.tab
{
  id: 'eraloner-50',
  name: 'Eraloner 50 mg 20 f.c.tab',
  genericName: 'Eplerenone',
  concentration: '50mg',
  price: 198,
  matchKeywords: [
    'heart failure', 'eraloner 50', 'eplerenone',
    'يرالونر ٥٠', 'ابليرينون', 'ضعف عضلة القلب'
  ],
  usage: 'الجرعة المستهدفة (Target Dose) لعلاج فشل القلب للحماية من تليف عضلة القلب وتقليل الاستشفاء.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ALDOSTERONE_ANTAGONISTS,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'غير مخصص للأطفال.';
    }
  },

  warnings: [
    'خطر ارتفاع البوتاسيوم.',
    'يتفاعل مع بعض المضادات الحيوية ومضادات الفطريات (CYP3A4 inhibitors)، يرجى إخبار الطبيب بكل الأدوية التي تتناولها.'
  ]
},

// 6. Carfalone 25 mg 20 f.c.tabs
{
  id: 'carfalone-25',
  name: 'Carfalone 25 mg 20 f.c.tabs',
  genericName: 'Eplerenone',
  concentration: '25mg',
  price: 132,
  matchKeywords: [
    'heart failure', 'carfalone', 'eplerenone', 'generic inspra',
    'كارفالون', 'ابليرينون', 'فشل القلب', 'ضغط'
  ],
  usage: 'بديل للإيرالونر والإنسبرا. يستخدم لعلاج هبوط عضلة القلب وارتفاع ضغط الدم.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ALDOSTERONE_ANTAGONISTS,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'غير مخصص للأطفال.';
    }
  },

  warnings: [
    'يمنع استخدامه مع مدرات البول الحافظة للبوتاسيوم الأخرى.',
    'يجب مراقبة وظائف الكلى.'
  ]
},

// 7. Carfalone 50 mg 20 f.c.tabs
{
  id: 'carfalone-50',
  name: 'Carfalone 50 mg 20 f.c.tabs',
  genericName: 'Eplerenone',
  concentration: '50mg',
  price: 198,
  matchKeywords: [
    'heart failure', 'carfalone 50', 'high dose',
    'كارفالون ٥٠', 'ابليرينون', 'جرعة كاملة'
  ],
  usage: 'الجرعة العلاجية الكاملة من الإبليرينون لمرضى قصور القلب.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ALDOSTERONE_ANTAGONISTS,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'غير مخصص للأطفال.';
    }
  },

  warnings: [
    'إذا شعرت بتنميل في الأطراف أو خفقان في القلب (أعراض ارتفاع البوتاسيوم)، أعد التقييم فوراً.',
    'يمنع للحوامل.'
  ]
},

// 8. Spectone 100 mg 20 tab
{
  id: 'spectone-100',
  name: 'Spectone 100 mg 20 tab',
  genericName: 'Spironolactone',
  concentration: '100mg',
  price: 90,
  matchKeywords: [
    'ascites', 'spectone', 'aldactone generic', 'acne', 'hirsutism',
    'سبكتون', 'الداكتون', 'استسقاء', 'حب الشباب', 'شعر زائد'
  ],
  usage: 'سبيرونولاكتون بجرعة عالية. يستخدم لعلاج الاستسقاء الكبدي، التورم الشديد، وأحياناً لعلاج حب الشباب والشعر الزائد (Hirsutism) لدى النساء (Off-label).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ALDOSTERONE_ANTAGONISTS,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'غير مخصص للأطفال.';
    }
  },

  warnings: [
    'يسبب التثدي (Gynecomastia) واضطراب الدورة الشهرية لدى النساء.',
    'خطر ارتفاع البوتاسيوم.',
    'يمنع للحوامل (يسبب تشوه الأجنة - تأنيث الجنين الذكر).'
  ]
},

// 9. Spectone 25 mg 20 tab
{
  id: 'spectone-25',
  name: 'Spectone 25 mg 20 tab',
  genericName: 'Spironolactone',
  concentration: '25mg',
  price: 36,
  matchKeywords: [
    'heart failure', 'spectone', 'hypertension', 'resistant htn',
    'سبكتون ٢٥', 'ضغط مقاوم', 'فشل القلب'
  ],
  usage: 'الجرعة القياسية لعلاج فشل القلب (لتقليل الوفيات) وكعلاج إضافي للضغط المقاوم (Resistant Hypertension).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ALDOSTERONE_ANTAGONISTS,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'غير مخصص للأطفال.';
    }
  },

  warnings: [
    'يجب متابعة البوتاسيوم.',
    'قد يسبب ألماً في الثدي.'
  ]
},

// 10. Aldactone 25 mg 20 tab
{
  id: 'aldactone-25-20',
  name: 'Aldactone 25 mg 20 tab',
  genericName: 'Spironolactone',
  concentration: '25mg',
  price: 11,
  matchKeywords: [
    'hypertension', 'heart failure', 'aldactone', 'original', 'cheap',
    'الداكتون', 'الاصلي', 'رخيص جدا', 'ضغط', 'مدر'
  ],
  usage: 'المستحضر الأصلي (فايزر). سعر زهيد جداً (١١ جنيه). يستخدم بكثرة لعلاج ضعف عضلة القلب والضغط المقاوم.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ALDOSTERONE_ANTAGONISTS,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'غير مخصص للأطفال.';
    }
  },

  warnings: [
    'سعره الرخيص يجعله متوفراً، لكن يجب الحذر من استخدامه العشوائي دون تحليل بوتاسيوم.',
    'يسبب التثدي عند الرجال.'
  ]
},

// 11. Cholaflux 50 mg 10 f.c.tabs
{
  id: 'cholaflux-50',
  name: 'Cholaflux 50 mg 10 f.c.tabs',
  genericName: 'Eplerenone',
  concentration: '50mg',
  price: 74.5,
  matchKeywords: [
    'heart failure', 'eplerenone', 'aldosterone antagonist', 'post-mi',
    'إبليرينون', 'فشل القلب', 'ضعف عضلة القلب', 'بعد الجلطة'
  ],
  usage: 'Selective Aldosterone Antagonist — يستخدم لتحسين فرص النجاة وتقليل الاستشفاء لمرضى فشل القلب (HFrEF) ولمرضى ما بعد نوبة القلب الحادة الذين يعانون من ضعف في البطين الأيسر.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ALDOSTERONE_ANTAGONISTS, // Aldosterone Antagonist
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'غير مخصص للأطفال والمراهقين أقل من ١٨ عاماً.';
    }
  },

  warnings: [
    'متابعة مستوى البوتاسيوم هو الأولوية القصوى؛ يجب فحص مستوى البوتاسيوم قبل البدء وبعد أسبوع ثم دورياً.',
    'يمنع استخدامه إذا كان مستوى البوتاسيوم في الدم أكثر من ٥.٠ مللي مكافئ/لتر عند بدء العلاج.',
    'يمنع استخدامه لمرضى الفشل الكلوي الشديد (معدل الترشيح أقل من ٣٠ مل/دقيقة).',
    'يجب تجنب تناول عصير الجريب فروت لأنه قد يرفع تركيز الدواء في الدم لمستويات خطيرة.'
  ]
}
];

