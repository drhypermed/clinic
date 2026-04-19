
import { Medication, Category } from '../../types';

const fixed = (text: string) => (_w: number, _a: number) => text;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Vitamin K1 (phytomenadione) common practical dosing guide
// - Neonates prophylaxis: 1 mg IM once
// - Children: 0.3 mg/kg IM (max 10 mg)
// - Adults: 10 mg IM/IV slow
const VITAMIN_K1_INJECTION_RULE = (weightKg: number, ageMonths: number) => {
  if (ageMonths < 1) return '١ مجم = ٠.١ مل حقنة عضل جرعة واحدة';
  const safeWeight = clamp(weightKg, 3, 200);
  const doseMg = clamp(safeWeight * 0.3, 1, 10);
  const doseMl = doseMg / 10;
  return `${doseMg.toFixed(1)} مجم = ${doseMl.toFixed(2)} مل (تركيز ١٠ مجم/مل) جرعة واحدة`;
};

const VITAMIN_K1_ORAL_10MG_RULE = (weightKg: number, _ageMonths: number) => (weightKg < 30 ? '٥ مجم = نصف قرص مرة يومياً' : '١٠ مجم = قرص واحد مرة يومياً');

export const VITAMIN_K_GROUP: Medication[] = [
  // 1
  {
    id: 'cona-adione-10mg-30-chewable-tabs-vk',
    name: 'cona-adione 10mg 30 chewable tab.',
    genericName: 'phytomenadione, vitamin k{1}',
    concentration: '10mg (30 chewable tabs)',
    price: 54,
    matchKeywords: ['cona-adione', 'cona adione', 'كونا اديون', 'كوناديون', 'vitamin k', 'vitamin k1', 'phytomenadione', 'bleeding', 'نزيف', 'سيولة', 'warfarin reversal', 'عكس الوارفارين', 'neonatal hemorrhage', 'نزيف الولادة', '#vitamin_k', '#coagulation'],
    usage: 'فيتامين K1 أقراص مضغ لعلاج نقص فيتامين ك وتقليل الميل للنزيف.',
    timing: 'مرة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Chewable Tablets',
    minAgeMonths: 48,
    maxAgeMonths: 1200,
    minWeight: 15,
    maxWeight: 200,
    calculationRule: VITAMIN_K1_ORAL_10MG_RULE,
    warnings: ['إذا كنت تستخدم وارفارين/مضادات التجلط: فيتامين ك قد يقلل تأثيرها؛ يلزم متابعة INR.'],
  },

  // 2
  {
    id: 'cona-adione-10mg-100-chewable-tabs-vk',
    name: 'cona-adione 10mg 100 chewable tablets',
    genericName: 'phytomenadione, vitamin k{1}',
    concentration: '10mg (100 chewable tabs)',
    price: 83,
    matchKeywords: ['cona-adione', 'cona adione', 'كوناديون 100', 'vitamin k', 'vitamin k1', 'phytomenadione', 'bleeding', 'bruising', 'rhinorrhage', 'نزيف', 'رعاف', 'كدمات', 'warfarin reversal', 'عكس الوارفارين', '#vitamin_k', '#bleeding', '#coagulation'],
    usage: 'فيتامين K1 أقراص مضغ لعلاج نقص فيتامين ك وتقليل الميل للنزيف والكدمات.',
    timing: 'مرة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Chewable Tablets',
    minAgeMonths: 48,
    maxAgeMonths: 1200,
    minWeight: 15,
    maxWeight: 200,
    calculationRule: VITAMIN_K1_ORAL_10MG_RULE,
    warnings: ['إذا كنت تستخدم وارفارين/مضادات التجلط: فيتامين ك قد يقلل تأثيرها؛ يلزم متابعة INR.'],
  },

  // 3
  {
    id: 'epikavit-10mg-ml-3-amp-vk',
    name: 'epikavit 10mg/ml 3 amp.',
    genericName: 'phytomenadione, vitamin k{1}',
    concentration: '10mg/ml (3 ampoules)',
    price: 36,
    matchKeywords: ['epikavit', 'epi kavit', 'ايبيكافيت', 'vitamin k injection', 'vitamin k1', 'phytomenadione', 'ampoule', 'نزيف', 'سيولة', 'neonatal hemorrhage', 'نزيف الوليد', 'warfarin reversal', 'عكس الوارفارين', 'INR', '#vitamin_k', '#coagulation'],
    usage: 'فيتامين K1 أمبولات لعلاج النزيف الناتج عن نقص فيتامين ك، الوقاية من نزيف الوليد، أو عكس تأثير الوارفارين.',
    timing: 'جرعة واحدة.',
    category: Category.VITAMINS_MINERALS,
    form: 'Ampoules',
    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 2,
    maxWeight: 200,
    calculationRule: VITAMIN_K1_INJECTION_RULE,
    warnings: ['الحقن الوريدي السريع قد يسبب تفاعل تحسسي شديد.', 'إذا يوجد تاريخ حساسية: يُستخدم بحذر.'],
  },

  // 4
  {
    id: 'phyto-k-10mg-50-fc-tabs-vk',
    name: 'phyto k 10 mg 50 f.c.tab.',
    genericName: 'phytomenadione, vitamin k{1}',
    concentration: '10mg (50 F.C. tabs)',
    price: 115,
    matchKeywords: ['phyto k', 'phyto-k', 'فيتو ك', 'vitamin k', 'vitamin k1', 'phytomenadione', 'f.c.', 'film coated', 'نزيف', 'warfarin reversal', 'عكس الوارفارين', '#vitamin_k', '#coagulation'],
    usage: 'فيتامين K1 أقراص مغلفة لعلاج نقص فيتامين ك واضطراب التجلط.',
    timing: 'مرة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'F.C. Tablets',
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: VITAMIN_K1_ORAL_10MG_RULE,
    warnings: ['إذا كنت تستخدم وارفارين/مضادات التجلط: فيتامين ك قد يقلل تأثيرها.'],
  },

  // 5
  {
    id: 'amri-k-10mg-ml-5-amp-im-vk',
    name: 'amri-k 10mg/ml 5 amp. i.m.',
    genericName: 'phytomenadione, vitamin k{1}',
    concentration: '10mg/ml (5 ampoules)',
    price: 40,
    matchKeywords: ['amri-k', 'amri k', 'امري ك', 'vitamin k injection', 'vitamin k1', 'phytomenadione', 'bleeding', 'warfarin', 'INR', 'نزيف', 'سيولة', 'neonatal hemorrhage', 'نزيف الوليد', 'warfarin reversal', 'عكس الوارفارين', '#vitamin_k', '#coagulation'],
    usage: 'فيتامين K1 حقن لعلاج النزيف، الوقاية من نزيف الوليد، أو عكس تأثير الوارفارين.',
    timing: 'جرعة واحدة.',
    category: Category.VITAMINS_MINERALS,
    form: 'Ampoule (IV/IM)',
    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 2,
    maxWeight: 200,
    calculationRule: VITAMIN_K1_INJECTION_RULE,
    warnings: ['الحقن الوريدي السريع قد يسبب تفاعل تحسسي شديد.', 'إذا كنت تستخدم وارفارين/مضادات التجلط: يلزم متابعة INR.'],
  },

  // 6
  {
    id: 'k-viton-10mg-20-sugar-coated-tabs-vk',
    name: 'k-viton 10mg 20 sugar coated tab.',
    genericName: 'acetomenaphthone',
    concentration: '10mg (20 sugar coated tabs)',
    price: 14,
    matchKeywords: ['k-viton', 'k viton', 'كي فيتون', 'vitamin k', 'menadione', 'acetomenaphthone', 'نزيف', 'سيولة', 'warfarin reversal', '#vitamin_k', '#coagulation'],
    usage: 'مركب فيتامين ك للمساعدة في تقليل النزيف الناتج عن نقص فيتامين ك.',
    timing: 'مرة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Sugar Coated Tablets',
    minAgeMonths: 72,
    maxAgeMonths: 1200,
    minWeight: 20,
    maxWeight: 200,
    calculationRule: fixed('قرص واحد يومياً بعد الأكل.'),
    warnings: ['إذا كنت تستخدم وارفارين/مضادات التجلط: فيتامين ك قد يقلل تأثيرها.'],
  },

  // 7
  {
    id: 'k-dion-10mg-30-chewable-tabs-vk',
    name: 'k-dion 10mg 30 chewable tab.',
    genericName: 'phytomenadione, vitamin k{1}',
    concentration: '10mg (30 chewable tabs)',
    price: 33,
    matchKeywords: ['k-dion', 'k dion', 'كي ديون', 'vitamin k', 'vitamin k1', 'phytomenadione', 'chewable', 'نزيف', 'كدمات', 'warfarin reversal', '#vitamin_k', '#coagulation'],
    usage: 'فيتامين K1 أقراص مضغ لعلاج نقص فيتامين ك وتقليل الميل للنزيف.',
    timing: 'مرة يومياً.',
    category: Category.VITAMINS_MINERALS,
    form: 'Chewable Tablets',
    minAgeMonths: 48,
    maxAgeMonths: 1200,
    minWeight: 15,
    maxWeight: 200,
    calculationRule: VITAMIN_K1_ORAL_10MG_RULE,
    warnings: ['إذا كنت تستخدم وارفارين/مضادات التجلط: فيتامين ك قد يقلل تأثيرها.'],
  },
];

