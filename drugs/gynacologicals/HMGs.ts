import type { Medication } from '../../types';
import { Category } from '../../types';
import { enhanceGynMedicationList } from './gynEnhancer';

const fixed = (text: string) => (_weight: number, _ageMonths: number) => text;

const INFERTILITY_INJECTABLE_WARNINGS = [
  'لتنشيط المبيض/IVF؛ بجرعة محددة مع متابعة سونار وتحاليل.',
  'قد يسبب فرط تنبيه المبيض (OHSS) — أعدي التقييم عند ألم شديد/انتفاخ/ضيق نفس.',
  'يُحفظ وفق تعليمات العبوة.',
];

const HMG_GROUP_RAW: Medication[] = [
  {
    id: 'meriofert-150-iu-vial',
    name: 'meriofert 150 i.u. vial',
    genericName: 'menotropins',
    concentration: '150 IU',
    price: 1320,
    usage: 'منشطات (HMG/menotropins) لعلاج العقم وتنشيط المبيض/الخصية؛ الجرعة حسب البروتوكول والسونار.',
    timing: 'حقنة يومياً – حسب السونار',
    category: Category.INFERTILITY_HMG,
    form: 'Vial',
    minAgeMonths: 216,
    maxAgeMonths: 720,
    minWeight: 45,
    maxWeight: 200,
    calculationRule: fixed('١٥٠ وحدة دولية حقنة تحت الجلد أو عضل يومياً – في الأيام المحددة من الدورة – تُعدّل حسب السونار'),
    warnings: INFERTILITY_INJECTABLE_WARNINGS,
    matchKeywords: ['meriofert', 'ميريوفيرت', 'menotropins', 'hmg', 'infertility'],
  },
];

export const HMG_GROUP: Medication[] = enhanceGynMedicationList(HMG_GROUP_RAW);
