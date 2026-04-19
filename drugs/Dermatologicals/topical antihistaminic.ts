import { Medication, Category } from '../../types';

const TAGS = {
  antiHistaminic: ['anti-histaminic', '#anti-histaminic', 'antihistaminic', 'مضاد حساسية', 'حساسية جلد', 'skin allergy'],
  antiAllergic: ['anti-allergic', '#anti-allergic', 'anti allergic', 'حساسية', 'حكة', 'itching', 'حب شباب', 'acne', 'وردية', 'rosacea'],
};

export const TOPICAL_ANTIHISTAMINIC_MEDS: Medication[] = [
  // ==================================
  // TOPICAL "ANTIHISTAMINIC" (As requested)
  // ==================================

  // 1. azaderm 20% cream 30 gm
  {
    id: 'azaderm-azelaic-acid-20-cream-30',
    name: 'azaderm 20% cream 30 gm',
    genericName: 'Azelaic acid',
    concentration: '20%',
    price: 87,
    matchKeywords: ['azaderm', 'ازاديرم', 'azelaic', 'azelaic acid', 'acne', 'rosacea', 'melasma', 'حب شباب', 'كلف', 'تصبغات', ...TAGS.antiHistaminic, ...TAGS.antiAllergic],
    usage: 'كريم أزيليك أسيد 20% لتحسين حب الشباب/آثار الحبوب وقد يفيد في الوردية والتصبغات الخفيفة حسب التشخيص.',
    timing: 'ليلاً – ٤–٦ أسابيع',
    category: Category.DERMA_CARE,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'نقطة على الحبوب ليلاً لمدة ٤–٦ أسابيع',
    warnings: [
      'الحمل/الرضاعة: غالباً آمن موضعياً؛ تقييم الفائدة والخطر خصوصاً مع الاستخدام الواسع.',
      'تداخلات: تجنب الجمع مع مقشرات قوية/ريتينويد بنفس الوقت إذا سبب تهيج.',
      'تحذيرات: قد يسبب لسع/حرقان/احمرار في البداية. توقف إذا حدث تهيج شديد.'
    ]
  },

  // 2. skinoren 20% cream 30 gm
  {
    id: 'skinoren-azelaic-acid-20-cream-30',
    name: 'skinoren 20% cream 30 gm',
    genericName: 'Azelaic acid',
    concentration: '20%',
    price: 35.5,
    matchKeywords: ['skinoren', 'سكينورين', 'azelaic', 'acne', 'rosacea', 'melasma', 'حب شباب', 'كلف', 'تصبغات', ...TAGS.antiHistaminic, ...TAGS.antiAllergic],
    usage: 'كريم أزيليك أسيد 20% (بديل/اسم تجاري آخر) لحب الشباب وآثاره وقد يفيد في الوردية حسب الحالة.',
    timing: 'ليلاً – ٤–٦ أسابيع',
    category: Category.DERMA_CARE,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,
    calculationRule: () => 'نقطة على الحبوب ليلاً لمدة ٤–٦ أسابيع',
    warnings: ['الحمل: غالباً آمن موضعياً.', 'تداخلات: تجنب المقشرات القوية إذا سبب تهيج.', 'تحذيرات: لسع/احمرار في بداية الاستخدام شائع.']
  }
];

