import type { Medication } from '../../types';
import { Category } from '../../types';
import { enhanceGynMedicationList } from './gynEnhancer';

const fixed = (text: string) => (_weight: number, _ageMonths: number) => text;

const HCG_WARNINGS = [
  'لتفجير البويضة أو دعم الطور الأصفر؛ بجرعة محددة مع متابعة سونار/تحاليل.',
  'قد يزيد خطر فرط تنبيه المبيض (OHSS) مع المنشطات.',
  'يُحفظ وفق تعليمات العبوة.',
];

const HCG_GROUP_RAW: Medication[] = [
  {
    id: 'epifasi-5000-iu-amp',
    name: 'epifasi 5000 i.u. amp.',
    genericName: 'human chorionic gonadotropin (hcg)',
    concentration: '5000 IU',
    price: 500,
    usage: 'هرمون HCG لتفجير البويضة/دعم حسب التشخيص والسونار.',
    timing: 'حقنة واحدة – في اليوم المحدد من الدورة',
    category: Category.INFERTILITY_HCG,
    form: 'Ampoule (IV/IM)',
    minAgeMonths: 216,
    maxAgeMonths: 720,
    minWeight: 45,
    maxWeight: 200,
    calculationRule: fixed('٥٠٠٠ وحدة دولية حقنة عضل – جرعة واحدة للتفجير في اليوم المحدد من الدورة حسب السونار'),
    warnings: HCG_WARNINGS,
    matchKeywords: ['epifasi', 'ايبيفاسي', 'hcg', 'human chorionic gonadotropin', 'trigger'],
  },
];

export const HCG_GROUP: Medication[] = enhanceGynMedicationList(HCG_GROUP_RAW);
