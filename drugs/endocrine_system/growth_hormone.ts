
import { Medication, Category } from '../../types';

export const GROWTH_HORMONE_MEDICATIONS: Medication[] = [
  // ==========================================
  // GROWTH HORMONE (Somatropin)
  // Usage: Treatment of Growth Hormone Deficiency (GHD), Turner Syndrome, SGA.
  // ==========================================

  // 1. Somatropin 4 I.U.
  {
    id: 'somatropin-4-iu-vial',
    name: 'Somatropin 4 I.U./ vial',
    genericName: 'Somatropin (rDNA origin)',
    concentration: '4 IU',
    price: 321,
    matchKeywords: ['growth hormone', 'short stature', 'gh deficiency', 'turner syndrome', 'somatropin', 'هرمون نمو', 'قصر قامة', 'سوماتروبين', 'تأخر نمو', 'هرمون النمو', 'GH', 'نقص هرمون النمو', 'غدة نخامية', 'SGA', 'نمو'],
    usage: 'هرمون النمو لعلاج قصر القامة الناتج عن نقص الهرمون.',
    timing: 'مرة يومياً مساءً – مزمن',
    category: Category.DIABETES, // Endocrine category
    form: 'Vial',
    minAgeMonths: 24, // Typically diagnosed and treated > 2 years
    maxAgeMonths: 216, // Until puberty/bone fusion
    minWeight: 10,
    maxWeight: 100,
    calculationRule: () => 'جرعة حسب الوزن تحت الجلد مرة يومياً مساءً (مزمن) – حسب وصف استشاري الغدد',
    warnings: [
        'يحفظ في الثلاجة (٢-٨ درجة مئوية) قبل وبعد الحل.',
        'لا ترج العبوة بعنف (تقلب برفق).',
        'يستخدم مع متابعة التحاليل لمتابعة وظائف الغدة الدرقية والسكر.',
        'ممنوع في حالات الأورام النشطة (Active malignancy).',
        'يلزم متابعة IGF-1 وعمر العظام دورياً.'
    ]
  }
];

