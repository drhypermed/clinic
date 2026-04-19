
import { Medication, Category } from '../../types';

export const SOMATOSTATIN_MEDICATIONS: Medication[] = [
  // ==========================================
  // SOMATOSTATIN & ANALOGS (Anti-Growth Hormone / GI Bleeding)
  // Usage: Acromegaly, Bleeding Esophageal Varices, Pancreatitis.
  // ==========================================

  // 1. Somatostatin Lyomark
  {
    id: 'somatostatin-lyomark-3mg',
    name: 'Somatostatin Lyomark 3mg/3ml amp.',
    genericName: 'Somatostatin',
    concentration: '3mg/3ml',
    price: 130,
    matchKeywords: ['bleeding varices', 'pancreatitis', 'fistula', 'gi bleeding', 'somatostatin', 'نزيف دوالي', 'التهاب بنكرياس', 'ناسور'],
    usage: 'يستخدم أساساً لوقف نزيف دوالي المريء وقرحة المعدة وعلاج الناسور المعوي.',
    timing: 'تسريب وريدي مستمر – بالمستشفى',
    category: Category.DIABETES, // Endocrine category
    form: 'Vial',
    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 200,
    calculationRule: () => '٣.٥ ميكروجرام/كجم/ساعة تسريب وريدي (IV) مستمر – بالمستشفى حتى توقف النزيف',
    warnings: [
        'عمر النصف قصير جداً (لذا يلزم التسريب المستمر).',
        'يجب مراقبة مستوى السكر في الدم بدقة.',
        'للاستخدام داخل المستشفيات فقط.'
    ]
  },

  // 2. Sandostatin 0.1mg (Octreotide)
  {
    id: 'sandostatin-0.1-amp',
    name: 'Sandostatin 0.1mg/ml 5 s.c. amp.',
    genericName: 'Octreotide (Somatostatin Analog)',
    concentration: '0.1mg/ml',
    price: 406,
    matchKeywords: ['acromegaly', 'carcinoid tumor', 'severe diarrhea', 'esophageal varices', 'octreotide', 'ساندوستاتين', 'عملقة', 'تضخم اطراف'],
    usage: 'لعلاج تضخم الأطراف (Acromegaly) والأورام العصبية الصماء والوقاية من نزيف الدوالي.',
    timing: '٢–٣ مرات يومياً – مزمن',
    category: Category.DIABETES,
    form: 'Vial',
    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 200,
    calculationRule: (_) => '٥٠–١٠٠ ميكروجرام تحت الجلد (S.C) ٢–٣ مرات يومياً (مزمن)',
    warnings: [
        'يحفظ في الثلاجة (٢-٨ درجة مئوية).',
        'يقلل من انقباض المرارة (خطر تكوين حصوات عند الاستخدام الطويل).',
        'يجب تغيير مكان الحقن لتجنب الألم.'
    ]
  }
];

