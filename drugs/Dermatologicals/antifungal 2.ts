import { Medication, Category } from '../../types';

export const DERM_ANTIFUNGALS_2: Medication[] = [
  // ================================
  // VAGINAL ANTIFUNGALS (Azoles)
  // ================================

  // 70. gyno-daktarin 2% vaginal cream 40 gm
  {
    id: 'vagizole-butoconazole-vag-cream-2-15',
    name: 'vagizole 2% vaginal cream 15 gm+3 applicat...',
    genericName: 'Butoconazole',
    concentration: '2%',
    price: 123,
    matchKeywords: ['vagizole', 'butoconazole', 'بيوتوكونازول', 'فاجيزول', 'فطريات مهبل', 'كانديدا', 'candida', 'vulvovaginal candidiasis', 'التهاب مهبلي فطري', 'مضاد فطريات'],
    usage: 'لعلاج داء المبيضات المهبلي/الفرجي (Vulvovaginal candidiasis) كعلاج قصير.',
    timing: 'ليلاً',
    category: Category.ANTIFUNGAL,
    form: 'Cream',
    minAgeMonths: 144,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,
    calculationRule: () => 'لبوسة مهبلية ليلاً لمدة ٣–٧ أيام حسب البروتوكول',
    warnings: [
      'الحمل: يُستخدم بحذر (بيانات الحمل محدودة) ويُفضَّل اختيار بدائل موضعية أكثر خبرة حسب البروتوكول.',
      'تداخلات: تأثيرات جهازية عادة محدودة، لكن راجع تداخلات المريض (مضادات التخثر).',
      'تحذيرات: إذا لم تتحسن الأعراض خلال ٣ أيام أو استمرت أكثر من ٧ أيام، يلزم إعادة التقييم؛ قد تكون عدوى مختلفة أو مقاومة.'
    ]
  },

  // 81. andocandoxin 200 mg 3 vaginal caps.
  
];

