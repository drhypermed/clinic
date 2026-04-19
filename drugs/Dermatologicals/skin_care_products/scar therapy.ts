import { Medication, Category } from '../../../types';

const TAGS = {
  scarTherapy: ['scar therapy', '#scar therapy', '#scar-therapy', 'scar', 'scars', 'ندبات', 'اثر جرح', 'اثر حرق', 'keloid', 'hypertrophic scar', 'جرح', 'حروق', 'burns', 'wound', 'آثار', 'علاج ندبات'],
  silicone: ['silicone', 'silicon', 'polydimethylsiloxane', 'dimethicone', 'polysiloxane', 'سيليكون', 'جل سيليكون'],
  onion: ['onion extract', 'cepa', 'cepae', 'onion oil', 'بصل', 'مستخلص بصل'],
};

export const SCAR_THERAPY_MEDS: Medication[] = [
  // ==================
  // SCAR THERAPY
  // ==================

  // 1. scaro plus cream 50gm
  {
    id: 'scaro-plus-cream-50',
    name: 'scaro plus cream 50gm',
    genericName: 'Silicon fluid + Polydimethylsiloxane copolymer + Silicone dioxide + Onion extract + Vitamin E + Vitamin A',
    concentration: '50gm',
    price: 300,
    matchKeywords: ['scaro plus', 'سكارو بلس', 'scaro', 'scar', 'cream', ...TAGS.scarTherapy, ...TAGS.silicone, ...TAGS.onion],
    usage: 'كريم/جل سيليكون للمساعدة في تحسين مظهر الندبات بعد الجروح/الحروق وبعد العمليات (بعد التئام الجلد).',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['قد يسبب تهيجاً بسيطاً في البداية. توقف إذا حدث احمرار/حكة شديدة.']
  },

  // 2. haxida intact 25 gm gel
  {
    id: 'haxida-intact-gel-25',
    name: 'haxida intact 25 gm gel',
    genericName: 'Polysiloxane + Sesame oil + Onion oil + Vitamin E + Dimethicone',
    concentration: '25gm',
    price: 250,
    matchKeywords: ['haxida', 'هاكسيدا', 'intact', 'gel', ...TAGS.scarTherapy, ...TAGS.silicone, ...TAGS.onion],
    usage: 'جل للمساعدة في تحسين مظهر الندبات (سيليكون + زيوت) بعد التئام الجروح.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['تجنب العينين والأغشية المخاطية.', 'لا يوضع على التهابات جلدية نشطة.']
  },

  // 3. contractubex 20 gm gel imported
  {
    id: 'contractubex-imported-gel-20',
    name: 'contractubex 20 gm gel imported',
    genericName: 'Cepa extract + Heparin sodium + Allantoin',
    concentration: '20gm',
    price: 130,
    matchKeywords: ['contractubex imported', 'كونتراكتيوبكس مستورد', 'contractubex', 'gel', 'heparin', 'allantoin', ...TAGS.scarTherapy, ...TAGS.onion],
    usage: 'جل للندبات (مستخلص بصل + هيبارين + ألانتوين) لتحسين مظهر الندبات القديمة/الجديدة بعد التئام الجلد.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.SKIN_CARE,
    form: 'Gel',
    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['لا يوضع على جروح مفتوحة.', 'قد يسبب تهيجاً/حكة خفيفة.']
  },

  // 4. neova cream 75 gm
  {
    id: 'neova-cream-75',
    name: 'neova cream 75 gm',
    genericName: 'Silicon + Onion extract + Dimethicone + Allantoin + Aloe vera',
    concentration: '75gm',
    price: 75,
    matchKeywords: ['neova', 'نيوفا', 'cream', 'aloe', 'allantoin', ...TAGS.scarTherapy, ...TAGS.silicone, ...TAGS.onion],
    usage: 'كريم للمساعدة في تهدئة وتحسين مظهر آثار الجروح/الندبات بعد التئام الجلد.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['توقف إذا حدث تهيج شديد.']
  },

  // 5. nolaver anti-scar gel 50 gm
  {
    id: 'nolaver-anti-scar-gel-50',
    name: 'nolaver anti-scar gel 50 gm',
    genericName: 'Silicone + Onion extract',
    concentration: '50gm',
    price: 395,
    matchKeywords: ['nolaver', 'نولافر', 'anti-scar', 'gel', ...TAGS.scarTherapy, ...TAGS.silicone, ...TAGS.onion],
    usage: 'جل سيليكون للندبات لتقليل بروز الندبة والاحمرار مع الوقت.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['لا يوضع على جروح مفتوحة.']
  },

  // 6. silicar skin serum 50 gm
  {
    id: 'silicar-skin-serum-50',
    name: 'silicar skin serum 50 gm',
    genericName: 'Polydimethylsiloxane + Cyclopentasiloxane',
    concentration: '50gm',
    price: 550,
    matchKeywords: ['silicar', 'سيليكار', 'serum', 'scar', ...TAGS.scarTherapy, ...TAGS.silicone],
    usage: 'سيروم سيليكون للمساعدة في تحسين مظهر الندبات بعد التئام الجلد.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Solution',
    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['تجنب ملامسة العينين.']
  },

  // 7. delecar gel 50 gm
  {
    id: 'delecar-gel-50',
    name: 'delecar gel 50 gm',
    genericName: 'Scarfade complex (silicone blend)',
    concentration: '50gm',
    price: 550,
    matchKeywords: ['delecar', 'ديليكار', 'gel', 'scarfade', ...TAGS.scarTherapy, ...TAGS.silicone],
    usage: 'جل سيليكون للندبات (ScarFade complex) لتحسين مظهر الندبة مع الاستخدام المنتظم.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['قد يسبب تهيجاً بسيطاً.']
  },

  // 8. delecar cream 50 gm
  {
    id: 'delecar-cream-50',
    name: 'delecar cream 50 gm',
    genericName: 'Scarfade complex',
    concentration: '50gm',
    price: 199,
    matchKeywords: ['delecar cream', 'ديليكار كريم', ...TAGS.scarTherapy, ...TAGS.silicone],
    usage: 'كريم للمساعدة في تحسين مظهر الندبات (ScarFade complex).',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Cream',
    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['لا يوضع على جروح مفتوحة.']
  },

  // 9. contractubex top. gel 20 gm
  {
    id: 'contractubex-topical-gel-20',
    name: 'contractubex top. gel 20 gm',
    genericName: 'Allantoin + Heparin sodium + Cepae fluid extract',
    concentration: '20gm',
    price: 66,
    matchKeywords: ['contractubex', 'كونتراكتيوبكس', 'gel', 'allantoin', 'heparin', ...TAGS.scarTherapy, ...TAGS.onion],
    usage: 'جل للندبات للمساعدة في تقليل الاحمرار/السُمك وتحسين الملمس بعد التئام الجلد.',
    timing: 'مرتين يومياً – ٢–٤ أسابيع',
    category: Category.SKIN_CARE,
    form: 'Gel',
    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'طبقة رقيقة على المنطقة المصابة ٢ مرات يومياً لمدة ٢–٤ أسابيع',
    warnings: ['تجنب الجروح المفتوحة.']
  },

  // 10. nu.trix gel 50 gm
  {
    id: 'nu-trix-gel-50',
    name: 'nu.trix gel 50 gm',
    genericName: 'Honey + Calendula + Panthenol + Triclosan + Chlorhexidine + Vitamin E + Vitamin C',
    concentration: '50gm',
    price: 65,
    matchKeywords: ['nu.trix', 'نيوتريكس', 'panthenol', 'honey', 'gel', 'wound care', ...TAGS.scarTherapy],
    usage: 'جل للعناية بالجلد والمساعدة في تهدئة الجلد وتحسين آثار بسيطة بعد التئام الجروح السطحية (حسب الاستخدام).',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['قد يسبب تهيجاً لمن لديهم حساسية من العسل/الأعشاب.']
  },

  // 11. scaro gel 50 gm
  {
    id: 'scaro-gel-50',
    name: 'scaro gel 50 gm',
    genericName: 'Decamethyltetrasiloxane + Polydimethylsiloxane + Cyclopentasiloxane',
    concentration: '50gm',
    price: 850,
    matchKeywords: ['scaro gel', 'سكارو جل', 'scar', ...TAGS.scarTherapy, ...TAGS.silicone],
    usage: 'جل سيليكون للندبات للمساعدة في تحسين مظهر الندبة مع الاستمرار.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['تجنب العينين.']
  },

  // 12. seam-lite scar gel 50 gm
  {
    id: 'seam-lite-scar-gel-50',
    name: 'seam-lite scar gel 50 gm',
    genericName: 'Decamethyltetrasiloxane + Polydimethylsiloxane + Cyclopentasiloxane',
    concentration: '50gm',
    price: 550,
    matchKeywords: ['seam-lite', 'seam lite', 'scar gel', 'سيملِيت', ...TAGS.scarTherapy, ...TAGS.silicone],
    usage: 'جل سيليكون للندبات لتحسين المظهر والملمس وتقليل الاحمرار مع الوقت.',
    timing: '١–٢ مرة يومياً',
    category: Category.SKIN_CARE,
    form: 'Gel',
    minAgeMonths: 6,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,
    calculationRule: () => 'يُوضع على البشرة ١–٢ مرة يومياً',
    warnings: ['لا يوضع على جروح مفتوحة.']
  }
];

