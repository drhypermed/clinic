
import { Medication, Category } from '../../types';

export const PROLACTIN_INHIBITORS: Medication[] = [
  // ==========================================
  // PROLACTIN INHIBITORS (Cabergoline)
  // Usage: Hyperprolactinemia, Inhibition of Lactation.
  // ==========================================

  // 1. Elonda 0.5mg
  {
    id: 'elonda-0.5-2-tabs',
    name: 'Elonda 0.5mg 2 tab.',
    genericName: 'Cabergoline',
    concentration: '0.5mg',
    price: 125,
    matchKeywords: ['high prolactin', 'milk drying', 'infertility', 'galactorrhea', 'cabergoline', 'هرمون الحليب', 'تنشيف اللبن', 'ايلوندا', 'برولاكتين', 'prolactin', 'hyperprolactinemia', 'ارتفاع هرمون الحليب'],
    usage: 'لعلاج ارتفاع هرمون الحليب (البرولاكتين) ووقف الرضاعة.',
    timing: 'نصف قرص مرتين أسبوعياً – مزمن',
    category: Category.DIABETES, // Endocrine category
    form: 'Tablet',
    minAgeMonths: 216, // 18y+ (prolactinoma)
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,
    calculationRule: (_) => 'نصف قرص ٠.٥ مجم عن طريق الفم قبل النوم مرتين أسبوعياً (مزمن)',
    warnings: [
        'يسبب دوخة وهبوط في الضغط (يؤخذ قبل النوم).',
        'الجرعة تحدد بدقة (مثلاً نصف قرص مرتين أسبوعياً).',
        'ممنوع لمرضى صمامات القلب.'
    ]
  },

  // 2. Jakaranda 0.5mg
  {
    id: 'jakaranda-0.5-4-tabs',
    name: 'Jakaranda 0.5mg 4 tab',
    genericName: 'Cabergoline',
    concentration: '0.5mg',
    price: 204,
    matchKeywords: ['hyperprolactinemia', 'breast milk', 'infertility women', 'جاكاراندا', 'لبن', 'برولاكتين', 'prolactin', 'cabergoline', 'هرمون الحليب', 'تنشيف اللبن'],
    usage: 'مثبط لهرمون البرولاكتين (لعلاج العقم الناتج عن ارتفاع الهرمون).',
    timing: 'نصف قرص مرتين أسبوعياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216, // 18y+ (prolactinoma)
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,
    calculationRule: (_) => 'نصف قرص ٠.٥ مجم عن طريق الفم قبل النوم مرتين أسبوعياً (مزمن) – حسب البرولاكتين',
    warnings: ['يسبب النعاس والدوخة.', 'ممنوع/بحذر مع أمراض صمامات القلب.', 'دوخة/هبوط ضغط محتمل—يفضل أخذه قبل النوم.']
  },

  // 3. Dostinex 0.5mg (Original)
  {
    id: 'dostinex-0.5-2-tabs',
    name: 'Dostinex 0.5 mg 2 tabs.',
    genericName: 'Cabergoline',
    concentration: '0.5mg',
    price: 172,
    matchKeywords: ['prolactinoma', 'stop lactation', 'dostinex', 'دوستينيكس', 'فطام', 'برولاكتين', 'prolactin', 'cabergoline', 'هرمون الحليب', 'تنشيف اللبن', 'hyperprolactinemia'],
    usage: 'الدواء الأصلي لعلاج ارتفاع هرمون الحليب وتنشيف اللبن (الفطام).',
    timing: 'نصف قرص كل ٣ أيام – للتنشيف',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216, // 18y+ (prolactinoma)
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,
    calculationRule: (_) => 'نصف قرص ٠.٥ مجم عن طريق الفم قبل النوم كل ٣ أيام (للتنشيف)',
    warnings: ['الجرعات العلاجية لارتفاع الهرمون تكون طويلة المدى (أسبوعياً).', 'ممنوع/بحذر مع أمراض صمامات القلب.', 'دوخة/هبوط ضغط محتمل—يفضل أخذه قبل النوم.']
  },

  // 4. Nostifix 0.5mg
  {
    id: 'nostifix-0.5-2-tabs',
    name: 'Nostifix 0.5mg 2 tablets',
    genericName: 'Cabergoline',
    concentration: '0.5mg',
    price: 68,
    matchKeywords: ['cabergoline cheap', 'milk secretion', 'نوستيفكس', 'هرمون اللبن', 'برولاكتين', 'prolactin', 'cabergoline', 'هرمون الحليب', 'تنشيف اللبن', 'hyperprolactinemia'],
    usage: 'بديل اقتصادي لعلاج ارتفاع هرمون الحليب.',
    timing: 'نصف قرص مرتين أسبوعياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216, // 18y+ (prolactinoma)
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,
    calculationRule: (_) => 'نصف قرص ٠.٥ مجم عن طريق الفم قبل النوم مرتين أسبوعياً (مزمن)',
    warnings: [
      'دوخة وهبوط في الضغط—يُفضَّل أخذه قبل النوم.',
      'ممنوع أو بحذر شديد مع أمراض صمامات القلب.',
      'يُمنع على المريض التوقف عن الدواء بدون استشارة الطبيب.',
    ]
  },

  // 5. Cabergamoun 0.5mg
  {
    id: 'cabergamoun-0.5-2-tabs',
    name: 'Cabergamoun 0.5 mg 2 tabs.',
    genericName: 'Cabergoline',
    concentration: '0.5mg',
    price: 78,
    matchKeywords: ['cabergoline', 'hyperprolactinemia', 'cabergamoun', 'كابيرجامون', 'هرمون الحليب', 'تنشيف اللبن'],
    usage: 'مثبط لهرمون البرولاكتين لعلاج ارتفاع هرمون الحليب.',
    timing: 'نصف قرص مرتين أسبوعياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216, // 18y+ (prolactinoma)
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,
    calculationRule: (_) => 'نصف قرص ٠.٥ مجم عن طريق الفم قبل النوم مرتين أسبوعياً (مزمن) – تعديل حسب البرولاكتين',
    warnings: ['دوخة/هبوط ضغط محتمل.', 'ممنوع/بحذر مع أمراض صمامات القلب (حسب التشخيص والحالة).'],
  },

  // 6. Hypolact 0.5mg
  {
    id: 'hypolact-0.5-2-tabs',
    name: 'Hypolact 0.5 mg 2 tablets',
    genericName: 'Cabergoline',
    concentration: '0.5mg',
    price: 103,
    matchKeywords: ['cabergoline', 'hypolact', 'هايبو لاكت', 'hyperprolactinemia', 'هرمون الحليب'],
    usage: 'مثبط للبرولاكتين لعلاج ارتفاع هرمون الحليب.',
    timing: 'نصف قرص مرتين أسبوعياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216, // 18y+ (prolactinoma)
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,
    calculationRule: (_) => 'نصف قرص ٠.٥ مجم عن طريق الفم قبل النوم مرتين أسبوعياً (مزمن)',
    warnings: ['دوخة/غثيان محتمل.'],
  },

  // 7. Dostilact 0.5mg
  {
    id: 'dostilact-0.5-2-tabs',
    name: 'Dostilact 0.5 mg 2 tabs.',
    genericName: 'Cabergoline',
    concentration: '0.5mg',
    price: 105,
    matchKeywords: ['cabergoline', 'dostilact', 'دوستيلاكت', 'hyperprolactinemia', 'هرمون الحليب'],
    usage: 'مثبط للبرولاكتين لعلاج ارتفاع هرمون الحليب.',
    timing: 'نصف قرص مرتين أسبوعياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216, // 18y+ (prolactinoma)
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,
    calculationRule: (_) => 'نصف إلى ١ قرص ٠.٥ مجم عن طريق الفم قبل النوم مرتين أسبوعياً (مزمن) – تعديل حسب التحاليل',
    warnings: ['لا تبدأ/توقف دون إعادة تقييم.'],
  },

  // 8. Jakaranda 0.5mg (2 tabs)
  {
    id: 'jakaranda-0.5-2-tabs',
    name: 'Jakaranda 0.5mg 2 tab',
    genericName: 'Cabergoline',
    concentration: '0.5mg',
    price: 102,
    matchKeywords: ['cabergoline', 'jakaranda', 'جاكاراندا', '2 tab', 'hyperprolactinemia'],
    usage: 'مثبط للبرولاكتين لعلاج ارتفاع هرمون الحليب.',
    timing: 'نصف قرص مرتين أسبوعياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216, // 18y+ (prolactinoma)
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,
    calculationRule: (_) => 'نصف قرص ٠.٥ مجم عن طريق الفم قبل النوم مرتين أسبوعياً (مزمن)',
    warnings: ['دوخة/هبوط ضغط محتمل.'],
  },

  // 9. Golinosab 0.5mg (4 tabs)
  {
    id: 'golinosab-0.5-4-tabs',
    name: 'Golinosab 0.5 mg 4 tabs.',
    genericName: 'Cabergoline',
    concentration: '0.5mg',
    price: 153,
    matchKeywords: ['cabergoline', 'golinosab', 'جولينوساب', 'hyperprolactinemia', 'هرمون الحليب'],
    usage: 'مثبط لهرمون البرولاكتين لعلاج ارتفاع هرمون الحليب.',
    timing: 'نصف قرص مرتين أسبوعياً – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216, // 18y+ (prolactinoma)
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,
    calculationRule: (_) => 'نصف إلى ١ قرص ٠.٥ مجم عن طريق الفم قبل النوم مرتين أسبوعياً (مزمن) – تعديل حسب التحاليل',
    warnings: ['ممنوع/بحذر مع أمراض صمامات القلب (حسب التشخيص والحالة).'],
  },

  // 10. Lactodel 2.5mg (Bromocriptine)
  {
    id: 'lactodel-2.5-20-tab',
    name: 'Lactodel 2.5mg 20 tab',
    genericName: 'Bromocriptine',
    concentration: '2.5mg (20 tablets)',
    price: 72,
    matchKeywords: ['bromocriptine', 'lactodel', 'لاكتوديل', 'dopamine agonist', 'hyperprolactinemia', 'تنشيف اللبن'],
    usage: 'ناهض للدوبامين (بروموكريبتين) لعلاج ارتفاع هرمون الحليب/تنشيف اللبن (حسب التشخيص والحالة).',
    timing: '٢ مرات يومياً مع الأكل – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216, // 18y+ (prolactinoma)
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,
    calculationRule: (_) => '١ قرص ٢.٥ مجم عن طريق الفم مع الأكل مرتين يومياً (مزمن) – بداية ½ قرص مساءً وتدرج',
    warnings: ['قد يسبب غثيان/دوخة/هبوط ضغط.', 'يُمنع في بعض حالات ارتفاع الضغط بعد الولادة—أعد التقييم.'],
  },

  // 11. Ramixole 0.25mg
  {
    id: 'ramixole-0.25-30-tabs',
    name: 'Ramixole 0.25mg 30 tabs.',
    genericName: 'Pramipexole',
    concentration: '0.25mg (30 tablets)',
    price: 48,
    matchKeywords: ["#parkinson's disease", '#dopamine agonist', 'pramipexole', 'ramixole', 'راميكسول', 'باركنسون'],
    usage: 'ناهض للدوبامين (براميبيكسول) لمرض باركنسون/متلازمة تململ الساقين (ليس علاجاً للبرولاكتين عادة).',
    timing: '٣ مرات يومياً مع الأكل – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,
    calculationRule: (_) => '١ قرص ٠.٢٥ مجم عن طريق الفم مع الأكل ٣ مرات يومياً (مزمن) – تُزاد تدريجياً',
    warnings: ['قد يسبب نعاس مفاجئ/دوخة.', 'لا توقفه فجأة دون إعادة تقييم.'],
  },

  // 12. Ramixole 1mg
  {
    id: 'ramixole-1mg-30-tab',
    name: 'Ramixole 1 mg 30 tab.',
    genericName: 'Pramipexole',
    concentration: '1mg (30 tablets)',
    price: 159,
    matchKeywords: ["#parkinson's disease", '#dopamine agonist', 'pramipexole', 'ramixole', 'راميكسول', '1mg'],
    usage: 'ناهض للدوبامين (براميبيكسول) لمرض باركنسون/تململ الساقين حسب التشخيص والحالة.',
    timing: '٣ مرات يومياً مع الأكل – مزمن',
    category: Category.DIABETES,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,
    calculationRule: (_) => '١ قرص ١ مجم عن طريق الفم مع الأكل ٣ مرات يومياً (مزمن) – الجرعة بالتدرج حسب الحالة',
    warnings: ['نعاس/هلاوس ممكنة لدى بعض المرضى.'],
  }
];
