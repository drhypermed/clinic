import type { Medication } from '../../types';
import { Category } from '../../types';
import { enhanceGynMedicationList } from './gynEnhancer';

const fixed = (text: string) => (_weight: number, _ageMonths: number) => text;

const MENSTRUAL_PAIN_WARNINGS = [
  'يحتوي باراسيتامول: لا تتجاوز الجرعة القصوى اليومية 4 جم من الباراسيتامول من كل المصادر.',
  'في مرضى الكبد أو مع الكحول: استخدم أقل جرعة ولأقصر مدة؛ تجنب الكحول.',
];

const MENSTRUAL_PAIN_RELIEF_GROUP_RAW: Medication[] = [
  {
    id: 'menstrual-pain-1',
    name: 'jakmeston f.c.tabs.',
    genericName: 'paracetamol + pamabrom',
    concentration: '500mg/25mg',
    price: 16,
    usage: 'تخفيف آلام/تقلصات الدورة مع مدر خفيف للسوائل المصاحبة.',
    timing: 'كل ٦–٨ ساعات – بعد الأكل عند اللزوم',
    category: Category.MENSTRUAL_PAIN_RELIEF,
    form: 'F.C. Tablets',
    minAgeMonths: 144,
    maxAgeMonths: 720,
    minWeight: 40,
    maxWeight: 200,
    calculationRule: fixed('قرص واحد كل ٦–٨ ساعات بعد الأكل عند اللزوم – حد أقصى ٨ أقراص يومياً – لمدة ٢–٣ أيام خلال الدورة'),
    warnings: MENSTRUAL_PAIN_WARNINGS,
    matchKeywords: ['jakmeston', 'جاكمستون', 'paracetamol', 'pamabrom'],
  },
];

export const MENSTRUAL_PAIN_RELIEF_GROUP: Medication[] = enhanceGynMedicationList(MENSTRUAL_PAIN_RELIEF_GROUP_RAW);
