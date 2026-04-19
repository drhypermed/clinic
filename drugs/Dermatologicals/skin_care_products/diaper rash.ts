import { Medication, Category } from '../../../types';

const TAGS = {
  diaperRash: ['diaper rash', '#diaper rash', 'حفاض', 'تسلخات', 'rash', 'nappy rash', 'طفح الحفاض', 'التهاب منطقة الحفاض', 'diaper dermatitis', 'حفاضات'],
  soothing: ['soothing topical', '#soothing topical', 'soothing', 'مهدئ'],
  skinCare: ['skin care', '#skin care', 'عناية بالبشرة'],
};

export const DIAPER_RASH_MEDS: Medication[] = [
  // 1
  {
    id: 'baby-care-cream-30',
    name: 'baby care cream 30 gm',
    genericName: 'Calamine & Dimethicone & Zinc oxide',
    concentration: '30 gm',
    price: 45,
    matchKeywords: ['baby care', 'بيبي كير', 'calamine', 'dimethicone', 'zinc oxide', ...TAGS.diaperRash, ...TAGS.soothing],
    usage: 'كريم واقٍ لمنطقة الحفاض لتقليل التهيج والتسلخات.',
    timing: '١–٢ مرة يومياً',
    category: Category.DERMA_CARE,
    form: 'Cream',
    minAgeMonths: 0,
    maxAgeMonths: 60,
    minWeight: 3,
    maxWeight: 25,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },
  // 2
  {
    id: 'baby-cream-30',
    name: 'baby cream 30 gm',
    genericName: 'Olive oil & Zinc oxide',
    concentration: '30 gm',
    price: 45,
    matchKeywords: ['baby cream 30', 'بيبي كريم', 'olive oil', 'zinc oxide', ...TAGS.diaperRash],
    usage: 'كريم حاجز لمنطقة الحفاض.',
    timing: '١–٢ مرة يومياً',
    category: Category.DERMA_CARE,
    form: 'Cream',
    minAgeMonths: 0,
    maxAgeMonths: 60,
    minWeight: 3,
    maxWeight: 25,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },
  // 3
  {
    id: 'no-rash-white-cream-100',
    name: 'no rash white cream 100 ml',
    genericName: 'Titanium oxide & Zinc oxide & Olive oil',
    concentration: '100 ml',
    price: 120,
    matchKeywords: ['no rash', 'نو راش', 'titanium', 'zinc oxide', 'olive oil', ...TAGS.diaperRash],
    usage: 'كريم واقٍ لمنطقة الحفاض.',
    timing: '١–٢ مرة يومياً',
    category: Category.DERMA_CARE,
    form: 'Cream',
    minAgeMonths: 0,
    maxAgeMonths: 60,
    minWeight: 3,
    maxWeight: 25,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },
  // 4
  {
    id: 'klenken-cream-100',
    name: 'klenken 100gm cream',
    genericName: 'Zinc oxide & Lanolin & Beeswax & Tocopherol & Aloe vera',
    concentration: '100 gm',
    price: 98,
    matchKeywords: ['klenken', 'كلينكن', 'lanolin', 'beeswax', 'vitamin e', 'aloe vera', 'zinc oxide', ...TAGS.diaperRash, ...TAGS.skinCare],
    usage: 'كريم حاجز ومرطب يساعد على حماية الجلد.',
    timing: '١–٢ مرة يومياً',
    category: Category.DERMA_CARE,
    form: 'Cream',
    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },
  // 5
  {
    id: 'baby-cream-60',
    name: 'baby cream 60 gm',
    genericName: 'Olive oil & Zinc oxide',
    concentration: '60 gm',
    price: 75,
    matchKeywords: ['baby cream 60', 'olive oil', 'zinc oxide', ...TAGS.diaperRash],
    usage: 'كريم حاجز لمنطقة الحفاض.',
    timing: '١–٢ مرة يومياً',
    category: Category.DERMA_CARE,
    form: 'Cream',
    minAgeMonths: 0,
    maxAgeMonths: 60,
    minWeight: 3,
    maxWeight: 25,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },
  // 6
  {
    id: 'infajoy-ointment-50',
    name: 'infajoy oint. 50 gm',
    genericName: 'Nigella sativa & Zinc oxide',
    concentration: '50 gm',
    price: 65,
    matchKeywords: ['infajoy', 'انفاجوي', 'nigella', 'حبة البركة', 'zinc oxide', ...TAGS.diaperRash],
    usage: 'مرهم واقٍ لمنطقة الحفاض ودعم تهدئة التهيج.',
    timing: '١–٢ مرة يومياً',
    category: Category.DERMA_CARE,
    form: 'Ointment',
    minAgeMonths: 0,
    maxAgeMonths: 60,
    minWeight: 3,
    maxWeight: 25,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },
  // 7
  {
    id: 'ben-ten-topical-lotion-60',
    name: 'ben ten topical lotion 60 ml',
    genericName: 'Zinc oxide & Wheat germ oil & Liquid paraffin & Olive oil & Panthenol',
    concentration: '60 ml',
    price: 30,
    matchKeywords: ['ben ten', 'بين تن', 'panthenol', 'liquid paraffin', 'zinc oxide', ...TAGS.diaperRash],
    usage: 'لوشن واقٍ ومهدئ للجلد (خصوصاً التسلخات).',
    timing: '١–٢ مرة يومياً',
    category: Category.DERMA_CARE,
    form: 'Lotion',
    minAgeMonths: 0,
    maxAgeMonths: 60,
    minWeight: 3,
    maxWeight: 25,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },
  // 8
  {
    id: 'lujy-baby-cream-50',
    name: 'lujy baby cream 50 gm',
    genericName: 'Olive oil & Zinc oxide & Glycerin & Jojoba oil & Almond oil & Calendula extract',
    concentration: '50 gm',
    price: 55,
    matchKeywords: ['lujy', 'لوجي', 'calendula', 'jojoba', 'almond', 'zinc oxide', ...TAGS.diaperRash],
    usage: 'كريم واقٍ ومرطب لمنطقة الحفاض.',
    timing: '١–٢ مرة يومياً',
    category: Category.DERMA_CARE,
    form: 'Cream',
    minAgeMonths: 0,
    maxAgeMonths: 60,
    minWeight: 3,
    maxWeight: 25,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },
  // 9
  {
    id: 'olizino-cream-50',
    name: 'olizino cream 50 gm',
    genericName: 'Nano zinc oxide & Olive oil & Panthenol & Chamomile',
    concentration: '50 gm',
    price: 38,
    matchKeywords: ['olizino', 'اوليزينو', 'nano zinc', 'panthenol', 'chamomile', ...TAGS.diaperRash],
    usage: 'كريم واقٍ ومهدئ للتسلخات والتهيج.',
    timing: '١–٢ مرة يومياً',
    category: Category.DERMA_CARE,
    form: 'Cream',
    minAgeMonths: 0,
    maxAgeMonths: 60,
    minWeight: 3,
    maxWeight: 25,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  }
];

