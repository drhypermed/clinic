import { Medication, Category } from '../../../types';

const TAGS = {
  feetCare: ['feet care', '#feet care', 'foot', 'قدم', 'كعب', 'تشقق', 'heels', 'cracked heels', 'تشققات القدم', 'خشونة القدم', 'calluses', 'foot cream'],
  moisturizer: ['moisturizer', '#moisturizer', 'ترطيب', 'مرطب'],
  skinCare: ['skin care', '#skin care', 'عناية بالبشرة'],
};

export const FEET_CARE_MEDS: Medication[] = [
  {
    id: 'skinova-foot-cream-75',
    name: 'skinova foot cream 75 ml',
    genericName: 'Urea & Salicylic acid & Lactic acid & Shea butter & Tea tree oil',
    concentration: '75 ml',
    price: 195,
    matchKeywords: ['skinova foot', 'skinova', 'سكينوفا', 'urea', 'salicylic', 'lactic', 'tea tree', ...TAGS.feetCare, ...TAGS.moisturizer, ...TAGS.skinCare],
    usage: 'كريم قدم لتنعيم الجلد وتقليل التشققات والخشونة.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['للاستخدام الخارجي فقط. قد يسبب لسعاً بسبب الأحماض/اليوريا.']
  }
];

