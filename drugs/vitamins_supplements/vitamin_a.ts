
import { Medication, Category } from '../../types';

export const VITAMIN_A_GROUP: Medication[] = [
  // 1. Infarais Oral Drops (Vitamin D3)
  {
    id: 'infarais-drops',
    name: 'Infarais Oral Drops 15ml',
    genericName: 'Vitamin D3 (Cholecalciferol)',
    concentration: 'Drops',
    price: 65,
    matchKeywords: ['rickets', 'vitamin d', 'vitamin d3', 'cholecalciferol', 'bones', 'growth', 'immunity', 'teething', 'walking', 'فيتامين د', 'فيتامين د٣', 'كساح', 'عظام', 'تسنين', 'لين عظام', 'نقص فيتامين د', '#vitamin_d', '#calcium_growth'],
    usage: 'نقط فيتامين د٣ للرضع والأطفال (للوقاية من الكساح ولين العظام).',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Drops',
    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 2,
    maxWeight: 200,
    // Dosage Guidelines (Prophylactic):
    // < 1 year: 400 IU (4 drops).
    // > 1 year: 600 IU (6 drops).
    calculationRule: (_, ageMonths) => {
        if (ageMonths < 12) return '٤ نقط (٤٠٠ وحدة دولية) مرة يومياً';
        return '٦ نقط (٦٠٠ وحدة دولية) مرة يومياً';
    },
    warnings: ['الجرعات المذكورة هي جرعات وقائية.', 'لعلاج الكساح النشط، يحدد الطبيب الجرعة بناءً على التحليل.', 'الجرعة الزائدة من فيتامين د قد تسبب ارتفاع الكالسيوم (غثيان/عطش شديد/ضعف/تشوش) وتستلزم تقييماً.']
  },

  // 2. A-viton 50.000 I.U. (Vitamin A)
  {
    id: 'a-viton-50000-caps',
    name: 'A-viton 50.000 I.U. 20 caps.',
    genericName: 'Vitamin A (Retinol Palmitate)',
    concentration: '50,000 IU',
    price: 19,
    matchKeywords: ['acne', 'night blindness', 'skin dryness', 'keratosis pilaris', 'measles', 'vitamin a', 'retinol', 'فيتامين أ', 'فيتامين ا', 'حب الشباب', 'عشى ليلي', 'بشرة', 'جلد الوزة', 'حصبة', '#vitamin_a'],
    usage: 'لعلاج حب الشباب، جفاف الجلد الشديد (جلد الوزة)، والعشى الليلي.',
    timing: 'مرة واحدة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Capsule',
    minAgeMonths: 144, // 12y+ (High therapeutic dose)
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,
    calculationRule: (_) => 'كبسولة واحدة',
    warnings: [
        'تحذير هام: ممنوع نهائياً للحوامل (يسبب تشوهات للجنين Category X). الحد الأقصى في الحمل ١٠٠٠٠ وحدة دولية/يوم.',
        'يجب استخدام وسيلة منع حمل فعالة للنساء أثناء فترة العلاج ولمدة شهر بعد الإيقاف.',
        'الجرعات العالية لفترات طويلة قد تسبب سمية (تراكمي): صداع، غثيان، جفاف جلد، تساقط شعر.',
        'يُستخدم بحذر لمرضى الكبد.',
        'أعراض السُمّية: صداع شديد/غثيان مستمر/زغللة تستلزم الإيقاف والتقييم.'
    ]
  }
];

