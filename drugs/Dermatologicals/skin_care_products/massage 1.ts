import { Medication, Category } from '../../../types';

const TAGS = {
  massage: ['massage', '#massage', 'مساج', 'تدليك', 'massage cream', 'massage gel', 'آلام المفاصل', 'joint pain'],
  topicalAnalgesic: ['topical analgesic', '#topical analgesic', 'مسكن موضعي', 'دهان مسكن', 'pain relief'],
  muscle: ['muscle', '#muscle', 'muscle pain', 'myalgia', 'عضلات', 'آلام عضلات', 'شد عضلي', 'التواء', 'sprain']
} as const;

const baseExternal = {
  minAgeMonths: 144,
  maxAgeMonths: 1200,
  minWeight: 30,
  maxWeight: 250
} as const;

export const MASSAGE_1_MEDS: Medication[] = [
  // 1
  {
    id: 'massage-rx-cream-50',
    name: 'rx massage cream 50 gm',
    genericName: 'Glucosamine + Chondroitin + MSM + Ginkgo',
    concentration: '50 gm',
    price: 75,
    matchKeywords: ['rx', 'rx massage', 'massage cream', ...TAGS.massage],
    usage: 'كريم مساج لتخفيف آلام العضلات والمفاصل (مستحضر موضعي).',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط. أوقفه عند حدوث تهيّج/حساسية.']
  },

  // 2
  {
    id: 'massage-rx-gel-50',
    name: 'rx massage gel 50 gm',
    genericName: 'Glucosamine + Chondroitin + MSM + Ginkgo',
    concentration: '50 gm',
    price: 80,
    matchKeywords: ['rx', 'rx massage', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج لتخفيف آلام العضلات والمفاصل (مستحضر موضعي).',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 3
  {
    id: 'sulfax-plus-massage-gel-120',
    name: 'sulfax plus massage gel 120 gm',
    genericName: 'Eucalyptus oil + Menthol + Camphor oil + Cetyl myristoleate',
    concentration: '120 gm',
    price: 170,
    matchKeywords: ['sulfax', 'سلفاكس', 'sulfax plus', 'massage gel', ...TAGS.massage, ...TAGS.topicalAnalgesic, ...TAGS.muscle],
    usage: 'جل مساج/مسكن موضعي لآلام العضلات.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط. قد يسبب تهيّجاً.']
  },

  // 4
  {
    id: 'sulfax-plus-massage-gel-60',
    name: 'sulfax plus massage gel 60 gm',
    genericName: 'Eucalyptus oil + Menthol + Camphor oil + Cetyl myristoleate',
    concentration: '60 gm',
    price: 100,
    matchKeywords: ['sulfax', 'سلفاكس', 'sulfax plus', 'massage gel 60', ...TAGS.massage],
    usage: 'جل مساج موضعي لآلام العضلات.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 5
  {
    id: 'moscow-massage-cream-100',
    name: 'moscow massage cream 100 gm',
    genericName: 'Glucosamine + Methyl salicylate + Menthol + Camphor + Vitamin E',
    concentration: '100 gm',
    price: 95,
    matchKeywords: ['moscow', 'massage cream', ...TAGS.massage],
    usage: 'كريم مساج لتخفيف آلام العضلات والمفاصل.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 6
  {
    id: 'massage-rx-cream-100',
    name: 'rx massage cream 100 gm',
    genericName: 'Glucosamine + Chondroitin + MSM + Ginkgo',
    concentration: '100 gm',
    price: 80,
    matchKeywords: ['rx', 'rx massage', 'massage cream 100', ...TAGS.massage],
    usage: 'كريم مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 7
  {
    id: 'faster-gel-80',
    name: 'faster gel 80 gm',
    genericName: 'Menthol + Camphor',
    concentration: '80 gm',
    price: 40,
    matchKeywords: ['faster', 'فاستر', 'menthol', 'camphor', ...TAGS.massage],
    usage: 'جل مساج لتبريد/تسكين موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 8
  {
    id: 'massage-rx-gel-100',
    name: 'rx massage gel 100 gm',
    genericName: 'Glucosamine + Chondroitin + MSM + Ginkgo',
    concentration: '100 gm',
    price: 110,
    matchKeywords: ['rx', 'rx massage', 'massage gel 100', ...TAGS.massage],
    usage: 'جل مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 9
  {
    id: 'hi-cool-massage-cream-100',
    name: 'hi-cool massage cream 100 gm',
    genericName: 'Camphor + Menthol + Eucalyptus + Methyl salicylate',
    concentration: '100 gm',
    price: 79,
    matchKeywords: ['hi-cool', 'hicool', 'massage cream', ...TAGS.massage],
    usage: 'كريم مساج لتخفيف آلام العضلات.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 10
  {
    id: 'myocool-cream-60',
    name: 'myocool cream 60 gm',
    genericName: 'Winter green oil + Peppermint oil + Silicon oil + Cetyl alcohol + Menthol',
    concentration: '60 gm',
    price: 85,
    matchKeywords: ['myocool', 'massage cream', ...TAGS.massage],
    usage: 'كريم مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 11
  {
    id: 'universal-massage-spray-100',
    name: 'universal massage spray 100 ml',
    genericName: 'Glucosamine + Chondroitin sulphate + MSM + Emu oil + Menthol',
    concentration: '100 ml',
    price: 145,
    matchKeywords: ['universal', 'massage spray', ...TAGS.massage, ...TAGS.topicalAnalgesic, ...TAGS.muscle],
    usage: 'سبراي مساج/تسكين موضعي لآلام العضلات.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Spray',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 12
  {
    id: 'yogin-cream-100',
    name: 'yogin 100 gm cream',
    genericName: 'Stearic acid + Triethanolamine + Menthol + Camphor',
    concentration: '100 gm',
    price: 68,
    matchKeywords: ['yogin', 'massage cream', ...TAGS.massage],
    usage: 'كريم مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 13
  {
    id: 'cybreak-massage-spray-100',
    name: 'cybreak massage spray 100 ml',
    genericName: 'Menthol + Eucalyptus + Thyme oil + Tea tree oil + Ginkgo biloba',
    concentration: '100 ml',
    price: 85,
    matchKeywords: ['cybreak', 'massage spray', ...TAGS.massage],
    usage: 'سبراي مساج/تسكين موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Spray',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 14
  {
    id: 'oneceutik-massage-gel-50',
    name: 'oneceutik massage gel 50 gm',
    genericName: 'Menthol + Ginkgo biloba leaf extract + Thymus vulgaris oil + Camphor',
    concentration: '50 gm',
    price: 65,
    matchKeywords: ['oneceutik', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 15
  {
    id: 'pomirja-gel-100',
    name: 'pomirja gel 100 gm',
    genericName: 'Menthol crystals + Methyl salicylate + Vitamin E + Camphor',
    concentration: '100 gm',
    price: 149,
    matchKeywords: ['pomirja', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج لتخفيف آلام العضلات.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 16
  {
    id: 'pomirja-gel-50',
    name: 'pomirja gel 50 gm',
    genericName: 'Menthol + Vitamin E + Camphor oil + Eucalyptus oil + Peppermint',
    concentration: '50 gm',
    price: 65,
    matchKeywords: ['pomirja', 'massage gel 50', ...TAGS.massage],
    usage: 'جل مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 17
  {
    id: 'relax-cream-50',
    name: 'relax cream 50 gm',
    genericName: 'Massage cream',
    concentration: '50 gm',
    price: 75,
    matchKeywords: ['relax', 'massage cream', ...TAGS.massage],
    usage: 'كريم مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 18
  {
    id: 'spunky-massage-gel-50',
    name: 'spunky massage gel 50 gm',
    genericName: 'Menthol + PEG 400 + Eucalyptus',
    concentration: '50 gm',
    price: 90,
    matchKeywords: ['spunky', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج/تسكين موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 19
  {
    id: 'sulfax-cmo-massage-cream-120',
    name: 'sulfax (cmo formula) massage cream 120 gm',
    genericName: 'Eucalyptus oil + Menthol + Camphor oil + Cetyl myristoleate',
    concentration: '120 gm',
    price: 120,
    matchKeywords: ['sulfax', 'cmo', 'massage cream', ...TAGS.massage],
    usage: 'كريم مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 20
  {
    id: 'tulataj-gel-60',
    name: 'tulataj gel 60 gm',
    genericName: 'Thyme ext + Camphor + Clove oil + Canola oil + Peppermint oil',
    concentration: '60 gm',
    price: 68,
    matchKeywords: ['tulataj', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 21
  {
    id: 'fast-freeze-gel-100',
    name: 'fast freeze gel 100 gm',
    genericName: 'Camphor + Menthol',
    concentration: '100 gm',
    price: 160,
    matchKeywords: ['fast freeze', 'freeze gel', ...TAGS.massage],
    usage: 'جل مساج مبرد/مسكن موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 22
  {
    id: 'movelex-plus-massage-gel-100',
    name: 'movelex plus massage gel 100 gm',
    genericName: 'Magnesium',
    concentration: '100 gm',
    price: 150,
    matchKeywords: ['movelex', 'movelex plus', 'magnesium', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج (مغنيسيوم) للاستخدام الموضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 23
  {
    id: 'woody-massage-gel-60',
    name: 'woody massage gel 60 gm',
    genericName: 'Panthenol + Thyme oil + Peppermint oil + Cinnamon oil',
    concentration: '60 gm',
    price: 80,
    matchKeywords: ['woody', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 24
  {
    id: 'qrockal-massage-cream-50',
    name: 'qrockal massage cream 50 gm',
    genericName: 'Menthol + Camphor oil + Eucalyptus oil + Clove oil + Lemon oil',
    concentration: '50 gm',
    price: 55,
    matchKeywords: ['qrockal', 'massage cream', ...TAGS.massage],
    usage: 'كريم مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 25
  {
    id: 'saj-relax-massage-gel-50',
    name: 'saj relax massage gel 50 gm',
    genericName: 'Menthol + Arnica + Camphor + Clove oil + Eucalyptus',
    concentration: '50 gm',
    price: 65,
    matchKeywords: ['saj', 'relax', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 26
  {
    id: 'cosamine-massage-cream-50',
    name: 'cosamine massage cream 50 gm',
    genericName: 'Glucosamine sulfate + Chondroitin sulfate + MSM + Menthol',
    concentration: '50 gm',
    price: 75,
    matchKeywords: ['cosamine', 'massage cream', ...TAGS.massage],
    usage: 'كريم مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 27
  {
    id: 'eucal-cream-30',
    name: 'eucal cream 30 gm',
    genericName: 'Eucalyptus globulus + Gaultheria procumbens + Salvia',
    concentration: '30 gm',
    price: 60,
    matchKeywords: ['eucal', 'massage cream', ...TAGS.massage],
    usage: 'كريم مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 28
  {
    id: 'mobiease-gel-60',
    name: 'mobiease gel 60 gm',
    genericName: 'Glucosamine + Chondroitin + MSM + Vitamin C + Menthol + Camphor',
    concentration: '60 gm',
    price: 80,
    matchKeywords: ['mobiease', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 29
  {
    id: 'mobinorm-cream-60',
    name: 'mobinorm cream 60 gm',
    genericName: 'Camphor + Horse chestnut + Rosemary oil + Lemon grass oil',
    concentration: '60 gm',
    price: 75,
    matchKeywords: ['mobinorm', 'massage cream', ...TAGS.massage],
    usage: 'كريم مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 30
  {
    id: 'lusty-massage-gel-75',
    name: 'lusty massage gel 75 gm',
    genericName: 'Camphor oil + Clove oil + Eucalyptus + Menthol + Lidocaine',
    concentration: '75 gm',
    price: 70,
    matchKeywords: ['lusty', 'massage gel', ...TAGS.massage, ...TAGS.topicalAnalgesic],
    usage: 'جل مساج/تسكين موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 31
  {
    id: 'sulfax-magnesium-cream-120',
    name: 'sulfax magnesium cream 120 gm',
    genericName: 'Eucalyptus oil + Menthol + Camphor oil + Cetyl myristoleate + Magnesium',
    concentration: '120 gm',
    price: 170,
    matchKeywords: ['sulfax', 'magnesium', 'massage cream', ...TAGS.massage],
    usage: 'كريم مساج (مغنيسيوم) للاستخدام الموضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 32
  {
    id: 'lusty-joint-tabs-30',
    name: 'lusty joint 30 tabs',
    genericName: 'Camphor oil + Clove oil + Eucalyptus + Menthol + Lidocaine',
    concentration: '30 tabs',
    price: 270,
    matchKeywords: ['lusty joint', 'joint', 'tabs', ...TAGS.massage],
    usage: 'منتج فموي (حسب تعليمات المنتج) لدعم المفاصل.',
    timing: 'حسب العبوة (غالباً مرة–مرتين يومياً).',
    category: Category.SKIN_CARE,
    form: 'Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'حسب العبوة؛ غالباً قرص مرة–مرتين يومياً.',
    warnings: ['لا تتجاوز الجرعة الموصى بها.']
  },

  // 33
  {
    id: 'saj-relax-massage-cream-60',
    name: 'saj relax massage cream 60 gm',
    genericName: 'Stearic acid + Beeswax + Camphor oil + Fennel oil + Methyl salicylate',
    concentration: '60 gm',
    price: 70,
    matchKeywords: ['saj', 'relax', 'massage cream', ...TAGS.massage],
    usage: 'كريم مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 34
  {
    id: 'repaion-n-spray-120',
    name: 'repaion-n spray 120 ml',
    genericName: 'Camphor oil + Menthol crystals + Eucalyptus oil + Salicylic acid',
    concentration: '120 ml',
    price: 130,
    matchKeywords: ['repaion-n', 'repaion', 'spray', ...TAGS.massage],
    usage: 'سبراي مساج/تسكين موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Spray',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 35
  {
    id: 'rayen-gel-120',
    name: 'rayen gel 120 gm',
    genericName: 'Glucosamine + Chondroitin sulfate + MSM + Ginkgo + Menthol',
    concentration: '120 gm',
    price: 120,
    matchKeywords: ['rayen', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 36
  {
    id: 'eucal-gel-30',
    name: 'eucal gel 30 gm',
    genericName: 'Eucalyptus oil + Peppermint oil + Camphor oil + Common juniper',
    concentration: '30 gm',
    price: 60,
    matchKeywords: ['eucal', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 37
  {
    id: 'finitrue-topical-gel-80',
    name: 'finitrue topical gel 80 gm',
    genericName: 'Menthol oil + Camphor oil + Clove oil + Eucalyptus oil + Vitamin E',
    concentration: '80 gm',
    price: 89,
    matchKeywords: ['finitrue', 'topical gel', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج/تسكين موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 38
  {
    id: 'relironz-massage-gel-50',
    name: 'relironz massage gel 50 gm',
    genericName: 'Menthol + Camphor oil + Clove oil + Herbal extracts + Methyl salicylate',
    concentration: '50 gm',
    price: 59,
    matchKeywords: ['relironz', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 39
  {
    id: 'maxi-care-cream-75',
    name: 'maxi care cream 75 gm',
    genericName: 'Gaultheria oil + Clove oil + Eucalyptus oil + Turpentine + Peppermint',
    concentration: '75 gm',
    price: 137,
    matchKeywords: ['maxi care', 'massage cream', ...TAGS.massage],
    usage: 'كريم مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 40
  {
    id: 'myocool-cream-100',
    name: 'myocool cream 100 gm',
    genericName: 'Winter green oil + Peppermint oil + Silicon oil + Cetyl alcohol + Menthol',
    concentration: '100 gm',
    price: 125,
    matchKeywords: ['myocool', 'massage cream 100', ...TAGS.massage],
    usage: 'كريم مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 41
  {
    id: 'radian-massage-cream-100',
    name: 'radian massage cream 100 gm',
    genericName: 'Camphor + Camphor oil white + Capsicum oleoresin + Menthol',
    concentration: '100 gm',
    price: 42.5,
    matchKeywords: ['radian', 'massage cream', ...TAGS.massage],
    usage: 'كريم مساج حراري لتخفيف آلام العضلات.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط. قد يسبب سخونة/احمرار.']
  },

  // 42
  {
    id: 'sulfax-cmo-massage-cream-60',
    name: 'sulfax (cmo formula) massage cream 60 gm',
    genericName: 'Eucalyptus oil + Menthol + Camphor oil + Cetyl myristoleate',
    concentration: '60 gm',
    price: 75,
    matchKeywords: ['sulfax', 'cmo', 'massage cream 60', ...TAGS.massage],
    usage: 'كريم مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 43
  {
    id: 'massage-rx-spray-100',
    name: 'rx spray 100 ml',
    genericName: 'Glucosamine + Chondroitin + MSM + Ginkgo',
    concentration: '100 ml',
    price: 95,
    matchKeywords: ['rx', 'rx spray', 'massage spray', ...TAGS.massage],
    usage: 'سبراي مساج/تسكين موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Spray',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 44
  {
    id: 'universal-cream-50',
    name: 'universal cream 50 gm',
    genericName: 'Glucosamine + Chondroitin sulphate + MSM + Emu oil + Menthol',
    concentration: '50 gm',
    price: 75,
    matchKeywords: ['universal', 'massage cream', ...TAGS.massage],
    usage: 'كريم مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 45
  {
    id: 'universal-massage-gel-50',
    name: 'universal massage gel 50 gm',
    genericName: 'Glucosamine + Chondroitin sulphate + MSM + Emu oil + Menthol',
    concentration: '50 gm',
    price: 69,
    matchKeywords: ['universal', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 46
  {
    id: 'velaback-cream-50',
    name: 'velaback cream 50 gm',
    genericName: 'Glucosamine + Chondroitin + MSM + Ginkgo',
    concentration: '50 gm',
    price: 55,
    matchKeywords: ['velaback', 'massage cream', ...TAGS.massage],
    usage: 'كريم مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  }
];

