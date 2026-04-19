import { Medication, Category } from '../../types';

const fixed = (text: string) => (_w: number, _a: number) => text;

const W_ALLERGY = ['حساسية شديدة (طفح منتشر/تورم/ضيق تنفس) تستلزم الإيقاف والتقييم العاجل.'];
const W_RED_FLAGS_URINARY = [
  'علامات تستلزم تقييماً عاجلاً: دم واضح بالبول، ألم شديد مستمر بالخاصرة/أسفل البطن، قيء مستمر، حمى، أو احتباس بول.',
];

export const URINARY_ANTISPASMODIC_MEDS: Medication[] = [
  // ==========================================
  // URINARY ANTISPASMODIC & ANALGESIC
  // Usage: Dysuria, Bladder Spasms, Urinary Pain.
  // ==========================================

  // 1. Nephroflam 200 mg
  {
    id: 'nephroflam-200-tabs',
    name: 'Nephroflam 200 mg 30 f.c. tab.',
    genericName: 'Flavoxate HCl',
    concentration: '200mg',
    price: 66,
    matchKeywords: ['renal colic', 'dysuria', 'bladder spasm', 'urinary pain', 'cystitis pain', 'genurin', 'urispas', 'flavoxate', 'فلافوكسيت', 'نيفروفلام', 'مغص كلوي', 'حرقان بول', 'تقلصات المثانة', 'مثانة', '#urinary_care', '#antispasmodics'],
    usage: 'مضاد لتقلصات المسالك البولية ومسكن للألم (للمغص الكلوي، التهاب المثانة، والبروستاتا).',
    timing: '٣ مرات يومياً',
    category: Category.URINARY_CARE,
    form: 'Tablet',
    minAgeMonths: 144, // 12y+
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,
    calculationRule: fixed('١ قرص ٣ مرات يومياً بعد الأكل'),
    warnings: [
      ...W_ALLERGY,
      ...W_RED_FLAGS_URINARY,
      'قد يسبب زغللة في العين أو جفافاً بالفم.',
      'الجلوكوما (المياه الزرقاء) قد تجعل استخدامه غير مناسب.',
    ]
  }
];

