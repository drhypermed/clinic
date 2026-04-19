import { Medication, Category } from '../../types';

const TAGS = {
  boneCare: ['bone care', '#bone care', 'bone', 'عظام', 'هشاشة', 'تقوية العظام'],
  boneSupport: ['bone support', '#bone support', 'bone support', 'دعم العظام'],
  cartilage: ['cartilage', '#cartilage', 'joint', 'joints', 'غضاريف', 'مفاصل'],
  jointHealth: ['joint health', '#joint health', 'joint', 'joints', 'صحة المفاصل'],
  jointSupplement: ['joint supplement', '#joint supplement', 'supplement', 'مكمل', 'مكمل للمفاصل'],
  calcium: ['calcium', 'كالسيوم', 'Ca'],
  vitaminD: ['vitamin d', 'vit d', 'd3', 'فيتامين د'],
};

const commonBoneSupportWarnings = [
  'الحمل/الرضاعة: يُستخدم عند الضرورة فقط؛ أقل جرعة وأقصر مدة.',
  'إذا لديك حصوات كلى/قصور كلوي/ارتفاع كالسيوم: استخدم بحذر وراجع الجرعة والتداخلات.',
  'افصل مكملات الكالسيوم/المعادن 2–4 ساعات عن بعض المضادات الحيوية وأدوية الغدة (حسب البروتوكول والتداخلات).',
];

export const BONE_SUPPORT: Medication[] = [
  // 1) jointonex 30 tabs
  {
    id: 'jointonex-collagen-type2-glucosamine-chondroitin-ginger-folic-acid-tabs-30',
    name: 'jointonex 30 tabs',
    genericName: 'collagen type 2 & glucosamine & chondroitin & ginger root extract & folic acid',
    concentration: 'Tablets',
    price: 300,
    matchKeywords: ['jointonex', 'جوينتونكس', 'collagen type 2', 'glucosamine', 'chondroitin', 'ginger', 'folic acid', ...TAGS.boneCare, ...TAGS.cartilage],
    usage: 'مكمل لدعم الغضاريف والمفاصل كعلاج مساعد.',
    timing: 'يُستخدم يومياً حسب التشخيص والحالة.',
    category: Category.BONE_SUPPORT,
    form: 'Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'غالباً 1–2 قرص يومياً بعد الأكل أو حسب التشخيص والحالة.',
    warnings: [...commonBoneSupportWarnings, 'إذا تستخدم مميعات دم أو لديك حساسية من مشتقات بحرية/محار: راجع الجرعة والتداخلات قبل الاستخدام.'],
  },

  // 2) monoqrest 20 film coated tablets
  {
    id: 'monoqrest-vitd3-vitk-calcium-film-coated-tabs-20',
    name: 'monoqrest 20 film coated tablets',
    genericName: 'vitamin d3 & vitamin k & calcium',
    concentration: 'Film-coated Tablets',
    price: 84,
    matchKeywords: ['monoqrest', 'مونوكريست', 'vitamin d3', 'vitamin k', 'calcium', ...TAGS.boneSupport, ...TAGS.jointHealth, ...TAGS.calcium, ...TAGS.vitaminD],
    usage: 'دعم العظام (كالسيوم + فيتامينات) حسب الاحتياج الطبي.',
    timing: 'مرة يومياً أو حسب التشخيص والحالة.',
    category: Category.BONE_SUPPORT,
    form: 'Film-coated Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    calculationRule: () => 'غالباً قرص واحد يومياً بعد الأكل أو حسب التشخيص والحالة.',
    warnings: [...commonBoneSupportWarnings, 'لا تتجاوز جرعات فيتامين د/كالسيوم اليومية بدون متابعة تحاليل إذا كنت تتناول منتجات أخرى مشابهة.'],
  },

  // 3) caro plus 20 tabs
  {
    id: 'caro-plus-calcium-vitamin-d-tabs-20',
    name: 'caro plus 20 tabs',
    genericName: 'calcium & vitamin d',
    concentration: 'Tablets',
    price: 125,
    matchKeywords: ['caro plus', 'كاروبلس', 'calcium', 'vitamin d', ...TAGS.boneCare, ...TAGS.calcium, ...TAGS.vitaminD],
    usage: 'مكمل كالسيوم + فيتامين د لدعم العظام حسب الحاجة.',
    timing: 'يُستخدم يومياً حسب التشخيص والحالة.',
    category: Category.BONE_SUPPORT,
    form: 'Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    calculationRule: () => 'غالباً قرص 1–2 يومياً بعد الأكل أو حسب التشخيص والحالة.',
    warnings: [...commonBoneSupportWarnings],
  },

  // 4) spondex 18 capsules
  {
    id: 'spondex-d-alpha-tocopherol-caps-18',
    name: 'spondex 18 capsules',
    genericName: 'd-alpha tocopherol',
    concentration: 'Capsules',
    price: 72,
    matchKeywords: ['spondex', 'سبوندكس', 'd-alpha tocopherol', 'vitamin e', 'فيتامين هـ', ...TAGS.boneCare],
    usage: 'مكمل (فيتامين هـ) كمضاد أكسدة/دعم عام حسب التشخيص والحالة.',
    timing: 'مرة يومياً أو حسب التشخيص والحالة.',
    category: Category.BONE_SUPPORT,
    form: 'Capsules',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    calculationRule: () => 'عادةً كبسولة واحدة يومياً بعد الأكل.',
    warnings: [...commonBoneSupportWarnings, 'قد يزيد خطر النزيف مع مميعات الدم بجرعات عالية من فيتامين هـ: راجع الجرعة والتداخلات.'],
  },

  // 5) tulkal 20 tabs
  {
    id: 'tulkal-calcium-tabs-20',
    name: 'tulkal 20 tabs',
    genericName: 'calcium',
    concentration: 'Tablets',
    price: 65,
    matchKeywords: ['tulkal', 'تولكال', 'calcium', 'كالسيوم', ...TAGS.boneCare, ...TAGS.calcium],
    usage: 'مكمل كالسيوم لدعم العظام حسب الحاجة.',
    timing: 'حسب التشخيص والحالة.',
    category: Category.BONE_SUPPORT,
    form: 'Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 35,
    maxWeight: 250,
    calculationRule: () => 'غالباً قرص 1–2 يومياً بعد الأكل أو حسب التشخيص والحالة.',
    warnings: [...commonBoneSupportWarnings],
  },

  // 6) movacartin 30 capsules
  {
    id: 'movacartin-hyaluronic-acid-chondroitin-hydrolyzed-collagen-type2-caps-30',
    name: 'movacartin 30 capsules',
    genericName: 'hyaluronic acid & chondroitin & hydrolyzed type 2 collagen',
    concentration: 'Capsules',
    price: 375,
    matchKeywords: ['movacartin', 'موفاكارتين', 'hyaluronic acid', 'chondroitin', 'collagen type 2', ...TAGS.boneSupport, ...TAGS.jointSupplement, ...TAGS.cartilage],
    usage: 'مكمل لدعم المفاصل والغضاريف كعلاج مساعد.',
    timing: 'يُستخدم يومياً حسب التشخيص والحالة.',
    category: Category.BONE_SUPPORT,
    form: 'Capsules',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,
    calculationRule: () => 'غالباً كبسولة واحدة يومياً بعد الأكل أو حسب التشخيص والحالة.',
    warnings: [...commonBoneSupportWarnings],
  },
];

