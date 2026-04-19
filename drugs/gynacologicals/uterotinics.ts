import type { Medication } from '../../types';
import { Category } from '../../types';
import { enhanceGynMedicationList } from './gynEnhancer';

const fixed = (text: string) => (_weight: number, _ageMonths: number) => text;

const UTEROTONIC_WARNINGS = [
  'بعد الولادة/الإجهاض؛ بجرعة ومدة محددة (oxytocin عادة وريدي بالمستشفى).',
  'يُمنع في ارتفاع ضغط الدم/تسمم الحمل وأمراض القلب التاجية.',
  'قد يسبب تقلصات شديدة، غثيان، صداع.',
];

const UTEROTONICS_GROUP_RAW: Medication[] = [
  {
    id: 'uterotonics-1',
    name: 'methergin 0.125mg 30 sugar coated tab.',
    genericName: 'methylergometrine',
    concentration: '0.125mg',
    price: 43,
    usage: 'مقبض/منشط للرحم لعلاج نزيف ما بعد الولادة؛ الجرعة حسب التشخيص والحالة (غالباً وريدي).',
    timing: '٣ مرات يومياً – بعد الأكل',
    category: Category.UTEROTONICS,
    form: 'Sugar Coated Tablets',
    minAgeMonths: 216,
    maxAgeMonths: 720,
    minWeight: 45,
    maxWeight: 200,
    calculationRule: fixed('قرص ٠.١٢٥ مجم ٣ مرات يومياً فموياً بعد الأكل – لمدة ٢–٧ أيام حسب الحالة'),
    warnings: UTEROTONIC_WARNINGS,
    matchKeywords: ['methergin', 'ميثرجين', 'methylergometrine'],
  },
];

export const UTEROTONICS_GROUP: Medication[] = enhanceGynMedicationList(UTEROTONICS_GROUP_RAW);
