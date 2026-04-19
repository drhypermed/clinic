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

export const MASSAGE_2_MEDS: Medication[] = [
  // 47
  {
    id: 'wellssage-massage-gel-50',
    name: 'wellssage massage gel 50 gm',
    genericName: 'Camphor oil + Peppermint oil + Eucalyptus oil',
    concentration: '50 gm',
    price: 75,
    matchKeywords: ['wellssage', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 48
  {
    id: 'top-relax-massage-cream',
    name: 'top relax massage cr',
    genericName: 'Lidocaine + Aescin + Methyl salicylate',
    concentration: 'N/A',
    price: 89,
    matchKeywords: ['top relax', 'massage cream', ...TAGS.massage, ...TAGS.topicalAnalgesic],
    usage: 'كريم/مستحضر مساج مع تأثير مسكن موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 49
  {
    id: 'runner-massage-gel-50',
    name: 'runner massage gel 50 ml',
    genericName: 'Menthol + Camphor + Eucalyptus + Avocado oil + Beeswax',
    concentration: '50 ml',
    price: 55,
    matchKeywords: ['runner', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 50
  {
    id: 'mobiease-cream-60',
    name: 'mobiease cream 60 gm',
    genericName: 'Glucosamine + Chondroitin + MSM + Vitamin C + Menthol + Camphor',
    concentration: '60 gm',
    price: 40,
    matchKeywords: ['mobiease', 'massage cream', ...TAGS.massage],
    usage: 'كريم مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 51
  {
    id: 'movelex-advance-caps-30',
    name: 'movelex advance 30 caps.',
    genericName: 'Glucosamine + Hydrolyzed marine collagen + Chondroitin',
    concentration: '30 caps',
    price: 295,
    matchKeywords: ['movelex advance', 'caps', 'collagen', ...TAGS.massage],
    usage: 'مكمل/منتج فموي لدعم المفاصل (حسب تعليمات المنتج).',
    timing: 'حسب العبوة (غالباً مرة–مرتين يومياً).',
    category: Category.SKIN_CARE,
    form: 'Capsules',
    ...baseExternal,
    calculationRule: () => 'حسب العبوة؛ غالباً كبسولة مرة–مرتين يومياً.',
    warnings: ['لا تتجاوز الجرعة الموصى بها.']
  },

  // 52
  {
    id: 'flexjo-massage-cream-100',
    name: 'flexjo 100 gm massage cream',
    genericName: 'Aquafresh + Eugenia caryophyllus flower extract + Menthol',
    concentration: '100 gm',
    price: 100,
    matchKeywords: ['flexjo', 'massage cream', ...TAGS.massage],
    usage: 'كريم مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 53
  {
    id: 'relacomp-spray-100',
    name: 'relacomp 100ml spray',
    genericName: 'Camphor + Menthol + Eucalyptus oil + Omega 3 + Olive oil',
    concentration: '100 ml',
    price: 120,
    matchKeywords: ['relacomp', 'spray', 'massage spray', ...TAGS.massage],
    usage: 'سبراي مساج/تسكين موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Spray',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 54
  {
    id: 'rostevo-massage-gel-50',
    name: 'rostevo 50 gm massage gel',
    genericName: 'Camphor oil + Menthol crystals + Eucalyptus oil',
    concentration: '50 gm',
    price: 60,
    matchKeywords: ['rostevo', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 55
  {
    id: 'eucal-gel-50',
    name: 'eucal gel 50 gm',
    genericName: 'Eucalyptus globulus + Gaultheria procumbens + Salvia',
    concentration: '50 gm',
    price: 75,
    matchKeywords: ['eucal', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 56
  {
    id: 'reva-lax-massage-gel-75',
    name: 'reva lax 75 gm massage gel',
    genericName: 'Camphor + Peppermint oil + Menthol crystals + Tea tree oil',
    concentration: '75 gm',
    price: 67,
    matchKeywords: ['reva lax', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 57
  {
    id: 'linex-spray-120',
    name: 'linex spray 120 ml',
    genericName: 'Massage formula',
    concentration: '120 ml',
    price: 120,
    matchKeywords: ['linex', 'spray', 'massage spray', ...TAGS.massage, ...TAGS.topicalAnalgesic, ...TAGS.muscle],
    usage: 'سبراي مساج/تسكين موضعي لآلام العضلات.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Spray',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 58
  {
    id: 'maxrone-massage-gel-50',
    name: 'maxrone massage gel 50 gm',
    genericName: 'Glucosamine + Chondroitin + Methyl sulfonyl methane',
    concentration: '50 gm',
    price: 78,
    matchKeywords: ['maxrone', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 59
  {
    id: 'osteforte-cream-60',
    name: 'osteforte cream 60 gm',
    genericName: 'Glucosamine sulfate + Chondroitin sulfate + Peppermint oil',
    concentration: '60 gm',
    price: 69.95,
    matchKeywords: ['osteforte', 'massage cream', ...TAGS.massage],
    usage: 'كريم مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 60
  {
    id: 'salex-gel-50',
    name: 'salex gel 50 gm',
    genericName: 'Menthol + Chamomile + Carbomer + Camphor + Methyl salicylate',
    concentration: '50 gm',
    price: 40,
    matchKeywords: ['salex', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 61
  {
    id: 'mobi-zome-gel-100',
    name: 'mobi zome 100 gm gel',
    genericName: 'Menthol + Camphor + Eucalyptus',
    concentration: '100 gm',
    price: 120,
    matchKeywords: ['mobi zome', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 62
  {
    id: 'fast-freeze-magnesium-spray-150',
    name: 'fast freeze magnesium massage spray 150 ml',
    genericName: 'Camphor + Menthol + Magnesium',
    concentration: '150 ml',
    price: 250,
    matchKeywords: ['fast freeze', 'magnesium', 'massage spray', ...TAGS.massage],
    usage: 'سبراي مساج (مغنيسيوم) للاستخدام الموضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Spray',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 63
  {
    id: 'everson-massage-spray-100',
    name: 'everson massage spray 100 ml',
    genericName: 'Camphor oil + Eucalyptus oil + Diethanolamine salicylate + Peppermint oil',
    concentration: '100 ml',
    price: 95,
    matchKeywords: ['everson', 'massage spray', ...TAGS.massage],
    usage: 'سبراي مساج/تسكين موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Spray',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 64
  {
    id: 'mentophor-massage-cream-100',
    name: 'mentophor massage cream 100 gm',
    genericName: 'Menthol crystals + Eucalyptus oil + Peppermint oil + Camphor',
    concentration: '100 gm',
    price: 100,
    matchKeywords: ['mentophor', 'massage cream', ...TAGS.massage],
    usage: 'كريم مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 65
  {
    id: 'azotec-max-gel-100',
    name: 'azotec max gel 100 gm',
    genericName: 'Tocopherol + Laurocapram + Menthol + Eucalyptus + Eugenol',
    concentration: '100 gm',
    price: 199,
    matchKeywords: ['azotec max', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 66
  {
    id: 'emux-cream-50',
    name: 'emux cream 50 gm',
    genericName: 'Emu oil + Beeswax + Clove oil + Mineral oil + Menthol',
    concentration: '50 gm',
    price: 56,
    matchKeywords: ['emux', 'massage cream', ...TAGS.massage],
    usage: 'كريم مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 67
  {
    id: 'eucal-cream-50',
    name: 'eucal cream 50 gm',
    genericName: 'Eucalyptus globulus + Gaultheria procumbens + Salvia',
    concentration: '50 gm',
    price: 75,
    matchKeywords: ['eucal', 'massage cream', ...TAGS.massage],
    usage: 'كريم مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 68
  {
    id: 'intarg-gel-75',
    name: 'intarg gel 75 gm',
    genericName: 'Equisetum arvense + Menthol + Thymus + Vitamin E + Eucalyptus',
    concentration: '75 gm',
    price: 70,
    matchKeywords: ['intarg', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 69
  {
    id: 'cordalen-oil-spray-100',
    name: 'cordalen 100 ml oil spray',
    genericName: 'Paraffinium liquidum + Clove oil + Menthol + Peppermint oil',
    concentration: '100 ml',
    price: 100,
    matchKeywords: ['cordalen', 'oil spray', 'massage spray', ...TAGS.massage],
    usage: 'سبراي/زيت مساج للاستخدام الموضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Spray',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 70
  {
    id: 'lusty-massage-gel-50',
    name: 'lusty massage gel 50 gm',
    genericName: 'Camphor oil + Clove oil + Eucalyptus + Menthol + Lidocaine',
    concentration: '50 gm',
    price: 55,
    matchKeywords: ['lusty', 'massage gel 50', ...TAGS.massage, ...TAGS.topicalAnalgesic],
    usage: 'جل مساج/تسكين موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 71
  {
    id: 'maestro-cream-75',
    name: 'maestro cream 75 gm',
    genericName: 'Methyl salicylate + Eucalyptus oil + Menthol + Camphor + Capsicum',
    concentration: '75 gm',
    price: 55,
    matchKeywords: ['maestro', 'massage cream', ...TAGS.massage, ...TAGS.topicalAnalgesic],
    usage: 'كريم مساج/تسكين موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 72
  {
    id: 'mestal-massage-gel-30',
    name: 'mestal massage gel 30 gm',
    genericName: 'Menthol + Camphor + Eucalyptus oil + Salix ext + Carbomer',
    concentration: '30 gm',
    price: 20,
    matchKeywords: ['mestal', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 73
  {
    id: 'reboss-massage-cream-50',
    name: 'reboss massage cream 50 gm',
    genericName: 'Camphor + Menthol + Methyl salicylate + Eucalyptus',
    concentration: '50 gm',
    price: 60,
    matchKeywords: ['reboss', 'massage cream', ...TAGS.massage],
    usage: 'كريم مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 74
  {
    id: 'rechamond-gel-60',
    name: 'rechamond gel 60 gm',
    genericName: 'Menthol + Camphor + Isopropanol + Triethanolamine',
    concentration: '60 gm',
    price: 90,
    matchKeywords: ['rechamond', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 75
  {
    id: 'rontax-cream-50',
    name: 'rontax cream 50 gm',
    genericName: 'Rosemary + Glycine + Lavender + Avocado oil + Grape fruit seed extract',
    concentration: '50 gm',
    price: 50,
    matchKeywords: ['rontax', 'massage cream', ...TAGS.massage],
    usage: 'كريم مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 76
  {
    id: 'rontax-cream-75',
    name: 'rontax cream 75 gm',
    genericName: 'Rosemary + Glycine + Lavender + Avocado oil + Grape fruit seed extract',
    concentration: '75 gm',
    price: 65,
    matchKeywords: ['rontax', 'massage cream 75', ...TAGS.massage],
    usage: 'كريم مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 77
  {
    id: 'urgent-massage-cream-50',
    name: 'urgent massage cream 50',
    genericName: 'Capsicum annuum + Camphor + Menthol + Methyl salicylate',
    concentration: '50 gm',
    price: 70,
    matchKeywords: ['urgent', 'massage cream', ...TAGS.massage, ...TAGS.topicalAnalgesic, ...TAGS.muscle],
    usage: 'كريم مساج حراري/تسكين موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 78
  {
    id: 'urgent-cream-75',
    name: 'urgent cream 75 gm',
    genericName: 'Capsicum annuum + Camphor + Menthol + Methyl salicylate',
    concentration: '75 gm',
    price: 95,
    matchKeywords: ['urgent', 'cream 75', 'massage cream', ...TAGS.massage, ...TAGS.topicalAnalgesic],
    usage: 'كريم مساج حراري/تسكين موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 79
  {
    id: 'zaffo-massage-gel-75',
    name: 'zaffo massage gel 75 gm',
    genericName: 'Camphor oil + Eucalyptus + Menthol crystal',
    concentration: '75 gm',
    price: 85,
    matchKeywords: ['zaffo', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 80
  {
    id: 'movelex-massage-cream-120',
    name: 'movelex massage cream 120 gm',
    genericName: 'Peppermint oil + Eucalyptus oil + Camphor + Tocopherol + Omega 3',
    concentration: '120 gm',
    price: 120,
    matchKeywords: ['movelex', 'massage cream 120', ...TAGS.massage],
    usage: 'كريم مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 81
  {
    id: 'movelex-massage-cream-50',
    name: 'movelex massage cream 50 gm',
    genericName: 'Peppermint oil + Eucalyptus oil + Camphor + Tocopherol + Omega 3',
    concentration: '50 gm',
    price: 95,
    matchKeywords: ['movelex', 'massage cream 50', ...TAGS.massage],
    usage: 'كريم مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 82
  {
    id: 'redomax-plus-gel',
    name: 'redomax plus gel',
    genericName: 'Thyme oil + Camphor oil + Clove oil + Peppermint oil + Cinnamon oil',
    concentration: 'N/A',
    price: 48,
    matchKeywords: ['redomax plus', 'gel', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 83
  {
    id: 'soojez-cream-50',
    name: 'soojez cream 50 gm',
    genericName: 'Menthol + Camphor + Eucalyptus',
    concentration: '50 gm',
    price: 39,
    matchKeywords: ['soojez', 'massage cream', ...TAGS.massage],
    usage: 'كريم مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 84
  {
    id: 'yoster-gel-50',
    name: 'yoster gel 50 gm',
    genericName: 'Camphor oil + Menthol oil + Methyl salicylate',
    concentration: '50 gm',
    price: 40,
    matchKeywords: ['yoster', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 85
  {
    id: 'parten-massage-spray',
    name: 'parten massage spray',
    genericName: 'Lidocaine + Aescin + Methyl salicylate',
    concentration: 'N/A',
    price: 110,
    matchKeywords: ['parten', 'massage spray', ...TAGS.massage, ...TAGS.topicalAnalgesic],
    usage: 'سبراي مساج/تسكين موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Spray',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 86
  {
    id: 'frontkeen-massage-cream-sachets-30',
    name: 'frontkeen massage cream 30 sachets',
    genericName: 'Peppermint oil + Eucalyptus oil + Vitamin E + Chlorhexidine',
    concentration: '30 sachets',
    price: 150,
    matchKeywords: ['frontkeen', 'sachets', 'massage cream', ...TAGS.massage],
    usage: 'مستحضر مساج (أكياس) للاستخدام الموضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Sachets',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 87
  {
    id: 'movelex-active-massage-foam-200',
    name: 'movelex active massage foam 200 ml',
    genericName: 'Emu oil + Aloe vera extract + Boswellia extract + Nigella sativa',
    concentration: '200 ml',
    price: 295,
    matchKeywords: ['movelex active', 'foam', 'massage foam', ...TAGS.massage],
    usage: 'فوم مساج للاستخدام الموضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Foam',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 88
  {
    id: 'flexfeel-massage-gel-75',
    name: 'flexfeel massage gel 75 gm',
    genericName: 'Eucalyptus oil + Menthol + Camphor oil + Clove oil + Cinnamon oil',
    concentration: '75 gm',
    price: 75,
    matchKeywords: ['flexfeel', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 89
  {
    id: 'ososage-massage-gel-50',
    name: 'ososage massage gel 50 gm',
    genericName: 'Camphor ext + Menthol ext + Eucalyptus + Thyme ext',
    concentration: '50 gm',
    price: 55,
    matchKeywords: ['ososage', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 90
  {
    id: 'rapgado-massage-gel-100',
    name: 'rapgado massage gel 100 gm',
    genericName: 'Glucosamine sulfate + Chondroitin sulfate + Methyl sulfonyl methane',
    concentration: '100 gm',
    price: 55,
    matchKeywords: ['rapgado', 'massage gel', ...TAGS.massage],
    usage: 'جل مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },

  // 91
  {
    id: 'reboss-massage-cream-30',
    name: 'reboss massage cream 30 gm',
    genericName: 'Camphor + Menthol + Methyl salicylate + Eucalyptus',
    concentration: '30 gm',
    price: 40,
    matchKeywords: ['reboss', 'massage cream 30', ...TAGS.massage],
    usage: 'كريم مساج موضعي.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    ...baseExternal,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  }
];

