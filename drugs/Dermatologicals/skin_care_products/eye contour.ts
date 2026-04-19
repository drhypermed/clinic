import { Medication, Category } from '../../../types';

const TAGS = {
  eyeContour: ['eye contour', '#eye contour', 'eye', 'around eyes', 'تحت العين', 'الهالات', 'هالات سوداء', 'dark circles', 'تجاعيد العين', 'eye wrinkles', 'انتفاخ العين', 'puffy eyes'],
  skinCare: ['skin care', '#skin care', 'عناية بالبشرة'],
};

export const EYE_CONTOUR_MEDS: Medication[] = [
  // 1
  {
    id: 'kolagra-oily-skin-cleanser-200',
    name: 'kolagra oily skin cleanser 200 ml',
    genericName: 'Caffeine & Vitamin K & Vitamin C & Vitamin E',
    concentration: '200 ml',
    price: 159,
    matchKeywords: ['kolagra', 'كولاجرا', 'cleanser', 'caffeine', 'vitamin k', ...TAGS.eyeContour, ...TAGS.skinCare],
    usage: 'منظف/مستحضر عناية موجه لمنطقة حول العين حسب وصف المنتج.',
    timing: 'مرة–مرتين يومياً',
    category: Category.SKIN_CARE,
    form: 'Cleanser',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },
  // 2
  {
    id: 'alejon-eye-contour-serum-30',
    name: 'alejon eye contour serum 30 ml',
    genericName: 'Peptide complex & Vitamin K & Collalift 18 & Alpha arbutin & Caffeine & Hyaluronic acid',
    concentration: '30 ml',
    price: 290,
    matchKeywords: ['alejon', 'اليجون', 'serum', 'peptide', 'arbutin', 'hyaluronic', ...TAGS.eyeContour],
    usage: 'سيروم لمنطقة حول العين.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Solution',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },
  // 3
  {
    id: 'b-and-b-eye-contour-cream-30',
    name: 'b & b eye contour cream 30 gm',
    genericName: 'Calendula & Chamomile & Vitamin A & Vitamin E & Vitamin C & Caffeine',
    concentration: '30 gm',
    price: 349,
    matchKeywords: ['b & b', 'b and b', 'calendula', 'chamomile', 'caffeine', ...TAGS.eyeContour],
    usage: 'كريم لمنطقة حول العين.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },
  // 4
  {
    id: 'eye-mix-eye-contour-gel-30',
    name: 'eye mix eye contour gel 30 gm',
    genericName: 'Caffeine & Glutathion & Glycolic acid & Coenzyme Q10',
    concentration: '30 gm',
    price: 295,
    matchKeywords: ['eye mix', 'اى ميكس', 'glutathione', 'glycolic', 'q10', ...TAGS.eyeContour],
    usage: 'جل لمنطقة حول العين.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    minAgeMonths: 180,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },
  // 5
  {
    id: 'prettier-eye-contour-gel-35',
    name: 'prettier eye contour gel 35 gm',
    genericName: 'Liquorice & Chamomile & Vitamin C & Vitamin E & Panthenol & Caffeine & Aloe vera',
    concentration: '35 gm',
    price: 120,
    matchKeywords: ['prettier', 'بريتيير', 'liquorice', 'panthenol', 'aloe vera', 'caffeine', ...TAGS.eyeContour],
    usage: 'جل لمنطقة حول العين.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  },
  // 6
  {
    id: 'akiva-dc-gel',
    name: 'akiva dc gel',
    genericName: 'Hydrolyzed collagen & Caffeine & Vitamin K & Hyaluronic acid & Green tea extract',
    concentration: 'Gel',
    price: 300,
    matchKeywords: ['akiva', 'اكيفا', 'dc gel', 'collagen', 'green tea', 'hyaluronic', ...TAGS.eyeContour],
    usage: 'جل لمنطقة حول العين.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.SKIN_CARE,
    form: 'Gel',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['للاستخدام الخارجي فقط.']
  },
  // 7
  {
    id: 'kolagra-vitamin-c-eye-contour-cream-30',
    name: 'kolagra vitamin c eye contour cream 30 ml',
    genericName: 'Caffeine & Vitamin K & Vitamin C & Vitamin E',
    concentration: '30 ml',
    price: 199,
    matchKeywords: ['kolagra vitamin c', 'كولاجرا فيتامين سي', 'caffeine', 'vitamin k', ...TAGS.eyeContour, ...TAGS.skinCare],
    usage: 'كريم/مستحضر لمنطقة حول العين.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط.']
  }
];

