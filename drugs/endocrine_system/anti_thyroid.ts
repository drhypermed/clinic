
import { Medication, Category } from '../../types';

export const ANTI_THYROID_MEDICATIONS: Medication[] = [
  // ==========================================
  // ANTI-THYROID AGENTS (Hyperthyroidism)
  // Usage: Treatment of Graves' disease and hyperthyroidism.
  // ==========================================

  // 1. Thyrocil 50mg
  {
    id: 'thyrocil-50-tabs',
    name: 'Thyrocil 50mg 30 tab.',
    genericName: 'Propylthiouracil (PTU)',
    concentration: '50mg',
    price: 72,
    matchKeywords: ['hyperthyroidism', 'graves disease', 'thyroid storm', 'overactive thyroid', 'ثيروسيل', 'نشاط الغدة', 'تسمم غدة', 'بروبيل ثيويوراسيل', 'غدة درقية', 'الغدة الدرقية', 'thyroid', 'anti-thyroid', 'PTU', 'propylthiouracil', 'فرط نشاط', 'زيادة نشاط الغدة'],
    usage: 'علاج زيادة نشاط الغدة الدرقية (Hyperthyroidism).',
    timing: '٢ مرات يومياً مع الأكل – ٦–١٢ شهر',
    category: Category.DIABETES, // Endocrine category
    form: 'Tablet',
    minAgeMonths: 72, // 6y+ (Specialist supervision required for children)
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: (_) => '١ قرص ٢ مرات يومياً مع الأكل لمدة ٦–١٢ شهر (حسب الحالة)',
    warnings: [
        'الدواء المفضل في الثلاثة أشهر الأولى من الحمل (First Trimester).',
        'يجب وقف الدواء فوراً وإعادة التقييم عند حدوث التهاب بالحلق أو سخونية (خطر ندرة المحببات/Agranulocytosis).',
        'يجب متابعة وظائف الكبد بانتظام.',
        'يُنصح بعمل صورة دم كاملة (CBC) قبل البدء ودورياً أثناء العلاج.'
    ]
  }
];
