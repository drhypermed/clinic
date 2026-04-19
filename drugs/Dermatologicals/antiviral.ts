import { Medication, Category } from '../../types';

const TAGS = {
  antiviral: ['antiviral', '#antiviral', 'مضاد فيروسات', 'herpes', 'هربس', 'herpes simplex', 'حمو', 'قوباء'],
  nucleoside: ['nucleoside', '#nucleoside', 'acyclovir', 'أسيكلوفير', 'cold sore', 'قرحة باردة'],
};

export const TOPICAL_ANTIVIRAL_MEDS: Medication[] = [
  // =====================
  // TOPICAL ANTIVIRALS
  // =====================

  // 1. zovirax 5% topical cream 10 gm
  {
    id: 'zovirax-cream-10',
    name: 'zovirax 5% topical cream 10 gm',
    genericName: 'Acyclovir',
    concentration: '5%',
    price: 27,
    matchKeywords: ['zovirax', 'زوفيراكس', 'acyclovir', 'cold sore', 'lip herpes', 'fever blister', 'هربس شفايف', ...TAGS.antiviral, ...TAGS.nucleoside],
    usage: 'دهان موضعي لهربس الشفاه والوجه (Cold Sores) عند بداية الأعراض.',
    timing: 'كل ٤ ساعات – ٥ أيام',
    category: Category.ANTIVIRAL,
    form: 'Cream',
    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 200,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة كل ٤ ساعات (٥ مرات يومياً) لمدة ٥ أيام',
    warnings: ['تجنب العينين والأغشية المخاطية.', 'لا يُستخدم على جروح واسعة/حروق.', 'الحمل/الرضاعة: الامتصاص الموضعي ضئيل؛ يُستخدم عند الحاجة.', 'أعد التقييم إذا لم تتحسن خلال 5–7 أيام أو في الحالات المتكررة الشديدة.']
  },

  // 2. acyclovir-misr 5% topical cream 10 gm
  {
    id: 'acyclovir-misr-cream',
    name: 'acyclovir-misr 5% topical cream 10 gm',
    genericName: 'Acyclovir',
    concentration: '5%',
    price: 23,
    matchKeywords: ['acyclovir-misr', 'اسيكلوفير مصر', 'acyclovir', 'herpes cream', 'cold sore', ...TAGS.antiviral, ...TAGS.nucleoside],
    usage: 'كريم مضاد للفيروسات (أسيكلوفير) بديل اقتصادي لهربس الشفاه/الوجه عند بداية الأعراض.',
    timing: 'كل ٤ ساعات – ٥ أيام',
    category: Category.ANTIVIRAL,
    form: 'Cream',
    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 200,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة كل ٤ ساعات (٥ مرات يومياً) لمدة ٥ أيام',
    warnings: ['تجنب العينين والأغشية المخاطية.', 'الحمل/الرضاعة: الامتصاص الموضعي ضئيل؛ يُستخدم عند الحاجة.', 'أعد التقييم إذا لم تتحسن خلال 5–7 أيام.']
  },

  // 3. virustat 5% cream 5 gm
  {
    id: 'virustat-acyclovir-5-cream-5',
    name: 'virustat 5% cream 5 gm',
    genericName: 'Acyclovir',
    concentration: '5%',
    price: 13,
    matchKeywords: ['virustat', 'فيروستات', 'acyclovir', 'cold sore', 'lip herpes', 'fever blister', ...TAGS.antiviral, ...TAGS.nucleoside],
    usage: 'كريم مضاد للفيروسات (أسيكلوفير) لهربس الشفاه/الوجه (Cold sores) عند بداية الأعراض.',
    timing: 'كل ٤ ساعات – ٥ أيام',
    category: Category.ANTIVIRAL,
    form: 'Cream',
    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 200,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة كل ٤ ساعات (٥ مرات يومياً) لمدة ٥ أيام',
    warnings: ['تجنب العينين والأغشية المخاطية.', 'لا يُستخدم على جروح واسعة/حروق.', 'الحمل/الرضاعة: الامتصاص الموضعي ضئيل؛ يُستخدم عند الحاجة.', 'أعد التقييم إذا لم تتحسن خلال 5–7 أيام أو في الحالات المتكررة الشديدة.']
  }
];
