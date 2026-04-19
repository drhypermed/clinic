
import { Medication, Category } from '../../../../types';

export const CARBONIC_ANHYDRASE_INHIBITORS_MEDS: Medication[] = [
  // ==========================================
  // ACETAZOLAMIDE
  // Usage: Glaucoma, Intracranial Hypertension (IIH), Altitude Sickness, Metabolic Alkalosis.
  // Warning: Sulfa Allergy.
  // ==========================================

  // 1. Cidamex 250mg
  {
    id: 'cidamex-250-tabs',
    name: 'Cidamex 250mg 20 tab.',
    genericName: 'Acetazolamide',
    concentration: '250mg',
    price: 60,
    matchKeywords: ['glaucoma', 'intracranial pressure', 'altitude sickness', 'edema', 'pseudotumor cerebri', 'سيدامكس', 'مياه زرقاء', 'ضغط مخ', 'مرض مرتفعات'],
    usage: 'لعلاج المياه الزرقاء (الجلولوكوما)، ارتفاع ضغط المخ الحميد، وداء المرتفعات.',
    timing: 'مرة يومياً – مزمن',
    category: Category.CARBONIC_ANHYDRASE_INHIBITORS,
    form: 'Tablet',
    minAgeMonths: 24, // Approved for children > 2y (off-label younger)
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    calculationRule: (_) => '١ قرص ٢٥٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)',
    warnings: [
        'ممنوع لمن لديهم حساسية السلفا.',
        'يسبب تنميل في الأطراف (Paresthesia) وتغير في طعم المشروبات الغازية.',
        'قد يسبب حصوات كلى (شرب ماء كثير).',
        'يسبب نقص البوتاسيوم.'
    ]
  }
];

