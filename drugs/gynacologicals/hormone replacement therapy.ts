import type { Medication } from '../../types';
import { Category } from '../../types';
import { enhanceGynMedicationList } from './gynEnhancer';

const fixed = (text: string) => (_weight: number, _ageMonths: number) => text;

const HRT_WARNINGS = [
  'يُستخدم بحذر مع تاريخ جلطات/أمراض كبد/سرطان ثدي؛ أقل جرعة وأقصر مدة.',
  'قد يحدث نزيف/تنقيط في البداية؛ المتابعة ضرورية إذا استمر.',
];

const HORMONE_REPLACEMENT_THERAPY_GROUP_RAW: Medication[] = [
  {
    id: 'valgestril-21-fc-tabs-biphasic',
    name: 'valgestril 21 f.c. tabs (biphasic)',
    genericName: 'estradiol valerate & norgestrel',
    concentration: '21 f.c. tablets (biphasic)',
    price: 34,
    usage: 'علاج هرموني تعويضي (HRT)؛ الجرعة والمدة حسب الأعراض والتحاليل.',
    timing: 'مرة يومياً – ٢١ يوم',
    category: Category.HORMONE_REPLACEMENT_THERAPY,
    form: 'F.C. Tablets',
    minAgeMonths: 480,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,
    calculationRule: fixed('١ قرص مرة يومياً في نفس الوقت حسب ترتيب الشريط – ٢١ يوم ثم راحة حسب العبوة أو التشخيص'),
    warnings: HRT_WARNINGS,
    matchKeywords: ['valgestril', 'فالجيستريل', 'hrt'],
  },
  {
    id: 'cyclo-progynova-21-fc-tabs-biphasic',
    name: 'cyclo-progynova 21 f.c. tab. (biphasic)',
    genericName: 'estradiol valerate & norgestrel',
    concentration: '21 f.c. tablets (biphasic)',
    price: 76,
    usage: 'علاج هرموني تعويضي (HRT)؛ الجرعة والمدة حسب الأعراض والتحاليل.',
    timing: 'مرة يومياً – ٢١ يوم',
    category: Category.HORMONE_REPLACEMENT_THERAPY,
    form: 'F.C. Tablets',
    minAgeMonths: 480,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 200,
    calculationRule: fixed('١ قرص مرة يومياً في نفس الوقت حسب ترتيب الشريط – ٢١ يوم ثم راحة حسب العبوة أو التشخيص'),
    warnings: HRT_WARNINGS,
    matchKeywords: ['cyclo-progynova', 'سيكلو بروجينوفا', 'hrt'],
  },
];

export const HORMONE_REPLACEMENT_THERAPY_GROUP: Medication[] = enhanceGynMedicationList(
  HORMONE_REPLACEMENT_THERAPY_GROUP_RAW
);
