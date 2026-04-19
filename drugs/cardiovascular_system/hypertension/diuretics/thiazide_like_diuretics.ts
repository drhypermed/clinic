
import { Medication, Category } from '../../../../types';

export const THIAZIDE_LIKE_DIURETICS_MEDS: Medication[] = [
  // 1. Natrilix SR 1.5mg 30 coated tab
  {
    id: 'natrilix-sr-1-5',
    name: 'Natrilix SR 1.5mg 30 coated tab',
    genericName: 'Indapamide',
    concentration: '1.5mg',
    price: 55,
    matchKeywords: [
      'hypertension', 'natrilix', 'servier', 'indapamide', 'safe diuretic',
      'ناتريليكس', 'انداباميد', 'سيرفييه', 'مدر امن', 'ضغط', 'سكر'
    ],
    usage: 'علاج ارتفاع ضغط الدم الأساسي. يُعد من أفضل مدرات البول لمرضى السكري وكبار السن نظراً لعدم تأثيره السلبي على مستويات السكر والدهون في الدم.',
    timing: 'مرة يومياً – مزمن',
    category: Category.THIAZIDE_LIKE_DIURETICS,
    form: 'Sustained-release Film-coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      if (ageMonths >= 216) return '١ قرص ١.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
      return 'غير مخصص للأطفال.';
  },

    warnings: [
      'رغم أنه آمن نسبياً، إلا أنه قد يسبب انخفاضاً في مستوى البوتاسيوم في الدم.',
      'يمنع استخدامه لمرضى الفشل الكلوي الحاد (Anuria) أو القصور الكبدي الشديد.',
      'يجب التأكد من عدم وجود حساسية لمركبات السلفا.'
    ]
  },

  // 2. Coversyl Plus 5/1.25mg 15 tab
  {
    id: 'coversyl-plus-5-1-25',
    name: 'Coversyl Plus 5/1.25mg 15 tab',
    genericName: 'Perindopril Arginine + Indapamide',
    concentration: '5mg / 1.25mg',
    price: 84,
    matchKeywords: [
      'hypertension', 'coversyl plus', 'servier', 'ace inhibitor',
      'كوفرسيل بلس', 'بيريندوبريل', 'انداباميد', 'ضغط'
    ],
    usage: 'علاج ثنائي لضغط الدم يجمع بين (Perindopril) الموسع للشرايين و (Indapamide) المدر للبول. يوفر حماية قوية للقلب والأوعية الدموية.',
    timing: 'مرة يومياً – مزمن',
    category: Category.THIAZIDE_LIKE_DIURETICS,
    form: 'Film-coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      if (ageMonths >= 216) return '١ قرص ٥ مجم / ١.٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
      return 'يمنع للأطفال.';
  },

    warnings: [
      'يمنع استخدامه أثناء الحمل (فئة D).',
      'قد يسبب سعالاً جافاً ومستمراً (Dry Cough) بسبب مادة البيريندوبريل.',
      'يجب الحذر من خطر التورم الوعائي (Angioedema) وتورم الوجه.'
    ]
  },

  // 3. Coversyl Plus 10/2.5 mg 15 tab
  {
    id: 'coversyl-plus-10-2-5',
    name: 'Coversyl Plus 10/2.5 mg 15 tab',
    genericName: 'Perindopril Arginine + Indapamide',
    concentration: '10mg / 2.5mg',
    price: 118,
    matchKeywords: [
      'hypertension', 'coversyl plus', 'strong', 'max dose',
      'كوفرسيل بلس', 'جرعة عالية', 'سيرفييه', 'ضغط'
    ],
    usage: 'الجرعة القصوى من الكوفرسيل بلس (١٠ مجم بيريندوبريل + ٢.٥ مجم إنداباميد). يستخدم لمرضى الضغط المرتفع الذين يحتاجون لسيطرة قوية.',
    timing: 'مرة يومياً – مزمن',
    category: Category.THIAZIDE_LIKE_DIURETICS,
    form: 'Film-coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 55,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      if (ageMonths >= 216) return '١ قرص ١٠ مجم / ٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
      return 'يمنع للأطفال.';
  },

    warnings: [
      'يمنع استخدامه للحوامل.',
      'يجب شرب كميات كافية من الماء ومتابعة وظائف الكلى.',
      'قد يسبب هبوطاً في الضغط عند بداية الاستخدام.'
    ]
  },

  // 4. Efectinix 5 mg 20 tabs
  {
    id: 'efectinix-5',
    name: 'Efectinix 5 mg 20 tabs',
    genericName: 'Metolazone',
    concentration: '5mg',
    price: 64,
    matchKeywords: [
      'edema', 'resistant edema', 'metolazone', 'efectinix', 'strong diuretic',
      'ايفيكتينكس', 'ميتولازون', 'مدر قوي', 'تورم مقاوم', 'تجميع ميه'
    ],
    usage: 'مدر للبول قوي المفعول (Thiazide-like). يتميز بفعاليته حتى في حالات القصور الكلوي (عندما يكون معدل الترشيح < 30). يستخدم غالباً مع (اللازكس) لعلاج التورم المقاوم.',
    timing: 'مرة يومياً – مزمن',
    category: Category.THIAZIDE_LIKE_DIURETICS,
    form: 'Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      if (ageMonths >= 216) {
        return '١ قرص ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
        return 'يمنع استخدامه للأطفال.';
      }
    },

    warnings: [
      'خطر حدوث اضطراب شديد في الأملاح (نقص حاد في البوتاسيوم والصوديوم) وارد جداً، خاصة عند دمجه مع مدرات أخرى.',
      'يجب إجراء تحاليل دورية للشوارد ووظائف الكلى.',
      'يجب الحذر من الجفاف الشديد.'
    ]
  },

  // 5. Natrixam m.r. 1.5/10mg 28 f.c. tabs
  {
    id: 'natrixam-1-5-10',
    name: 'Natrixam m.r. 1.5/10mg 28 f.c. tabs',
    genericName: 'Indapamide + Amlodipine',
    concentration: '1.5mg / 10mg',
    price: 102,
    matchKeywords: [
      'hypertension', 'natrixam', 'servier', 'safe combo',
      'ناتريكسام', 'انداباميد', 'أملوديبين', 'ضغط'
    ],
    usage: 'تركيبة فريدة تجمع بين الإنداباميد (مدر للبول آمن) وجرعة عالية من الأملوديبين (١٠ مجم) لتوسيع الشرايين.',
    timing: 'مرة يومياً – مزمن',
    category: Category.THIAZIDE_LIKE_DIURETICS,
    form: 'Sustained-release Film-coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      if (ageMonths >= 216) {
        return '١ قرص ١.٥ مجم / ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
        return 'يمنع استخدامه للأطفال.';
      }
    },

    warnings: [
      'يمنع استخدامه للحوامل.',
      'قد يسبب تورم القدمين (بسبب الأملوديبين).',
      'يجب متابعة مستوى البوتاسيوم.'
    ]
  },

  // 6. Natrixam m.r. 1.5/5mg 28 f.c. tabs
  {
    id: 'natrixam-1-5-5',
    name: 'Natrixam m.r. 1.5/5mg 28 f.c. tabs',
    genericName: 'Indapamide + Amlodipine',
    concentration: '1.5mg / 5mg',
    price: 88,
    matchKeywords: [
      'hypertension', 'natrixam', 'start dose',
      'ناتريكسام', 'أملوديبين ٥', 'ضغط'
    ],
    usage: 'علاج ثنائي لضغط الدم بجرعة أملوديبين متوسطة (٥ مجم) لتقليل الآثار الجانبية.',
    timing: 'مرة يومياً – مزمن',
    category: Category.THIAZIDE_LIKE_DIURETICS,
    form: 'Sustained-release Film-coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      if (ageMonths >= 216) {
        return '١ قرص ١.٥ مجم / ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
        return 'يمنع استخدامه للأطفال.';
      }
    },

    warnings: [
      'يمنع استخدامه للحوامل.',
      'يعتبر من أكثر أدوية الضغط أماناً على التمثيل الغذائي (السكر والدهون).'
    ]
  },

  // 7. Demafight 5 mg 30 scored tabs
  {
    id: 'demafight-5',
    name: 'Demafight 5 mg 30 scored tabs',
    genericName: 'Metolazone',
    concentration: '5mg',
    price: 96,
    matchKeywords: [
      'edema', 'resistant edema', 'demafight', 'metolazone', 'ckd',
      'ديمافايت', 'ميتولازون', 'مدر قوي', 'فشل كلوي', 'تورم'
    ],
    usage: 'ميتولازون بجرعة ٥ مجم. يستخدم لعلاج حالات الوذمة (الاستسقاء) المستعصية، خاصة المصاحبة لأمراض الكلى المتقدمة وفشل القلب.',
    timing: 'مرة يومياً – مزمن',
    category: Category.THIAZIDE_LIKE_DIURETICS,
    form: 'Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      if (ageMonths >= 216) {
        return '١ قرص ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
        return 'يمنع استخدامه للأطفال.';
      }
    },

    warnings: [
      'خطر حدوث جفاف وهبوط حاد في الشوارد (البوتاسيوم، الصوديوم، الكلوريد).',
      'يجب المتابعة المستمرة لوظائف الكلى.',
      'قد يسبب ارتفاعاً في مستوى السكر وحمض اليوريك.'
    ]
  }
];

