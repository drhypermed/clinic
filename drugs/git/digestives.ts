import { Medication, Category } from '../../types';

const toAr = (n: number | string) => n.toString().replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);

const W_ALLERGY = ['حساسية شديدة (طفح منتشر/تورم/ضيق تنفس) تستلزم إيقاف الدواء وتقييماً عاجلاً.'];
const W_RED_FLAGS_GI = [
  'علامات تستلزم تقييماً عاجلاً: قيء مستمر، نزف (قيء دموي/براز أسود)، ألم شديد مستمر، صعوبة بلع، أو نقص وزن غير مبرر.',
];

export const DIGESTIVES_MEDS: Medication[] = [

// 1. Spasmo-digestin 30 tabs.
{
  id: 'spasmo-digestin-30-tabs',
  name: 'Spasmo-digestin 30 tabs.',
  genericName: 'Papain + Sanzyme 2000 + Sodium Dehydrocholate + Simethicone + Dicyclomine HCl', // [GREEN] Multienzyme and Antispasmodic Complex
  concentration: 'Standard formulation',
  price: 78, 
  matchKeywords: [
      'indigestion', 'bloating', 'spasms', 'flatulence', 'digestive enzymes', 'spasmo-digestin', 'dicyclomine',
      'سبازمو ديجستين', 'عسر هضم', 'انتفاخ', 'تقلصات', 'إنزيمات هاضمة', 'تهيج القولون', 'غازات'
  ],
  usage: 'مركب إنزيمات هاضمة + طارد غازات + مضاد تقلصات؛ يُستخدم لتخفيف عسر الهضم الوظيفي والانتفاخ/الغازات المصحوبة بتقلصات كعلاج عرضي.',
  timing: '٣ مرات يومياً قبل الأكل بـ ١٠–٢٠ دقيقة – ٥–٧ أيام',
  category: Category.DIGESTIVE, // [GREEN] Digestive and Antispasmodic
  form: 'Tablet',

  minAgeMonths: 144,
  maxAgeMonths: 1200,
  minWeight: 35,
  maxWeight: 250,

  calculationRule: (_weight, ageMonths) => {
    if (ageMonths >= 144) {
      return '١ قرص قبل الأكل بـ ١٠–٢٠ دقيقة ٣ مرات يومياً لمدة ٥–٧ أيام (عند اللزوم: ٢ قرص قبل الوجبة، حد أقصى ٦ أقراص/يوم).';
    }

    return 'غير موصى به للأطفال أقل من ١٢ سنة (لاحتوائه على ديسيكلومين ذو تأثير مضاد للكولين).';
  },

  warnings: [
    'الحمل والرضاعة: بيانات الأمان محدودة لوجود ديسيكلومين (مضاد كولين).',
    'التداخلات: يزيد الجفاف/الإمساك/احتباس البول وزغللة النظر عند تناوله مع أدوية مضادة للكولين (مضادات الحساسية المهدئة، مضادات الاكتئاب ثلاثية الحلقات، مضادات الذهان).',
    'التداخلات: مضادات التقلصات/مضادات الكولين تقلل تأثير أدوية حركة المعدة، وقد يزيد الإمساك عند الجمع مع الأفيونات.',
    'غير مناسب في الجلوكوما ضيقة الزاوية، واحتباس البول/تضخم البروستاتا المصحوب بصعوبة التبول، والانسداد/شلل الأمعاء.',
    'دوخة/زغللة وجفاف فم قد تحدث؛ القيادة قد تكون غير مناسبة عند ظهور هذه الأعراض.'
  ]
},

// 2. Digenorm syrup 120 ml
{
  id: 'digenorm-120-syrup', // [GREEN] Unique identifier
  name: 'Digenorm syrup 120 ml',
  genericName: 'Papain + Pepsin + Sanzyme 2000', // [GREEN] Digestive Enzymes Complex
  concentration: '80mg + 40mg + 30mg per 5ml',
  price: 55, 
  matchKeywords: [
      'digestive', 'enzymes', 'indigestion', 'digenorm', 'appetizer', 'malabsorption', 'stomach',
      'ديجنورم شراب', 'مهضم', 'فاتح شهية', 'عسر هضم', 'إنزيمات هاضمة', 'امتصاص الطعام', 'انتفاخ'
  ],
  usage: 'إنزيمات هاضمة للمساعدة في تخفيف عسر الهضم الوظيفي وثِقَل المعدة والانتفاخ بعد الوجبات. لا يُستخدم لعلاج سبب عضوي خطير.',
  timing: '٣ مرات يومياً أثناء/بعد الأكل – ٧–١٤ يوم',
  category: Category.DIGESTIVE, // [GREEN] Digestive Aid
  form: 'Syrup',

  minAgeMonths: 0,
  maxAgeMonths: 1200,
  minWeight: 3,
  maxWeight: 250,

  calculationRule: (_weight, ageMonths) => {
    if (ageMonths >= 144) {
      return '١٠–١٥ مل (ملعقة كبيرة) شراب ٣ مرات يومياً أثناء/بعد الأكل مباشرة لمدة ٧–١٤ يوم.';
    }

    if (ageMonths >= 72 && ageMonths < 144) {
      return '٥ مل (ملعقة صغيرة) شراب ٣ مرات يومياً أثناء/بعد الأكل مباشرة لمدة ٧–١٤ يوم.';
    }

    if (ageMonths >= 12 && ageMonths < 72) {
      return '٢.٥–٥ مل شراب ٣ مرات يومياً أثناء/بعد الأكل مباشرة لمدة ٧–١٤ يوم.';
    }

    return 'للرضع: الاستخدام الروتيني غير مفضل؛ القياس بسرنجة مدرّجة أدق لضبط الجرعة.';
  },

  warnings: [
    'الحمل والرضاعة: منخفض الخطورة غالباً (امتصاص إنزيمات الهضم محدود) لكن البيانات ليست قوية.',
    'التداخلات: لا توجد تداخلات دوائية شائعة ذات أهمية كبيرة عادةً؛ فاصل ١–٢ ساعة مفيد عند تناول عدة أدوية فموية.',
    ...W_ALLERGY,
    ...W_RED_FLAGS_GI,
    'استمرار الأعراض أكثر من ١–٢ أسبوع يستلزم تقييماً.'
  ]
},

// 3. Digestozyme 20 e.c. tabs.
{
  id: 'digestozyme-20-ec-tabs', // [GREEN] Unique identifier
  name: 'Digestozyme 20 e.c. tabs.',
  genericName: 'Pancreatin + Papain', // [GREEN] Digestive Enzyme Complex (Proteolytic & Lipolytic)
  concentration: 'Standard Enteric Coated Formulation',
  price: 62, 
  matchKeywords: [
      'digestion', 'enzymes', 'pancreatin', 'papain', 'digestozyme', 'bloating', 'fatty meals',
      'ديجستوزيم', 'إنزيمات هاضمة', 'عسر هضم', 'انتفاخ', 'بنكرياتين', 'باباين', 'هضم الدهون', 'وجبات دسمة'
  ],
  usage: 'مستحضر إنزيمات هاضمة مغلف معوياً للمساعدة في هضم الوجبات الدسمة وتقليل ثِقَل المعدة/الانتفاخ. لا يُستخدم لعلاج التهاب البنكرياس الحاد.',
  timing: '٣ مرات يومياً مع/بعد الأكل – ٧–١٤ يوم',
  category: Category.DIGESTIVE, // [GREEN] Digestive Enzymes
  form: 'Enteric Coated Tablets',

  minAgeMonths: 144,
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (_weight, ageMonths) => {
    if (ageMonths >= 144) {
      return '١ قرص مع كل وجبة رئيسية أو بعدها مباشرة ٣ مرات يومياً لمدة ٧–١٤ يوم (يمكن زيادتها إلى ٢ قرص مع الوجبات الدسمة عند اللزوم).';
    }

    return 'غير موصى به عادةً للأطفال أقل من ١٢ سنة (شكل مغلف معوي وقد يصعب بلعه؛ والجرعات المتخصصة تُحدد طبياً).';
  },

  warnings: [
    'الحمل والرضاعة: منخفض الخطورة غالباً (امتصاص إنزيمات البنكرياس محدود)، لكن البيانات محدودة للاستخدام الطويل.',
    'التداخلات: قد يقلل تأثير مثبطات ألفا-جلوكوزيداز (مثل أكاربوز/ميجليتول) نظرياً—مراقبة سكر الدم مفيدة.',
    'غير مناسب في التهاب البنكرياس الحاد أو تفاقم التهاب البنكرياس المزمن.',
    'تحذيرات: تحسس من مصدر حيواني (غالباً خنزيري)—يُتجنب عند الحساسية.',
    'مضغ/كسر القرص قد يسبب تهيج الفم ويقلل الفاعلية.'
  ]
},

// 4. Metapsin 10 f.c. tabs.
{
  id: 'metapsin-10-fc-tabs', // [GREEN] Unique identifier
  name: 'Metapsin 10 f.c. tabs.',
  genericName: 'Metoclopramide 10mg + Pepsin', // [GREEN] Prokinetic and Proteolytic enzyme
  concentration: '10mg / Standard Pepsin unit',
  price: 110, 
  matchKeywords: [
      'prokinetic', 'digestion', 'nausea', 'vomiting', 'metapsin', 'pepsin', 'metoclopramide', 'bloating',
      'ميتابسين', 'منظم لحركة المعدة', 'عسر هضم', 'غثيان', 'ترجيع', 'هضم البروتينات', 'ثقل المعدة'
  ],
  usage: 'منظم لحركة المعدة/مضاد قيء (ميتوكلوبراميد) مع ببسين كمساعد للهضم؛ يُستخدم لفترة قصيرة لعسر الهضم المصحوب بغثيان/امتلاء أو قيء وفق تقييم طبي.',
  timing: '٣ مرات يومياً قبل الأكل بـ ٣٠ دقيقة – حتى ٥ أيام',
  category: Category.DIGESTIVE, // [GREEN] Digestive and Prokinetic
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (_weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص (١٠ مجم) قبل الأكل بـ ٣٠ دقيقة ٣ مرات يومياً لمدة حتى ٥ أيام فقط (حد أقصى ٣ أقراص/يوم = ٣٠ مجم).';
    }

    return 'غير موصى به عادةً أقل من ١٨ سنة في هذا المستحضر المركب إلا بوصفة مختص؛ الميتوكلوبراميد قد يسبب أعراضاً حركية خاصة في الأعمار الأصغر.';
  },

  warnings: [
    'الحمل والرضاعة: يُعد منخفض الخطورة نسبياً ويُستخدم طبياً للغثيان عند الحاجة، مع أقل جرعة لأقصر مدة.',
    'التداخلات: غير مناسب مع ليفودوبا/منبهات الدوبامين (تعاكس في التأثير). ويزيد خطر الأعراض الحركية عند الجمع مع مضادات الذهان.',
    'التداخلات: مضادات الكولين (مثل ديسيكلومين/هيوسين) والمسكنات الأفيونية قد تقلل تأثيره المحرك للمعدة. الكحول/المهدئات قد تزيد النعاس.',
    'غير مناسب عند نزيف/انسداد/ثقب بالجهاز الهضمي، أو ورم القواتم (pheochromocytoma)، أو الصرع، أو تاريخ خلل الحركة المتأخر.',
    'يزيد خطر التشنجات/الخلل الحركي خصوصاً في كبار السن والجرعات العالية—حد أقصى ٣٠ مجم/يوم.'
  ]
},

// 5. Digestin 20 tablets
{
  id: 'digestin-20-tabs', // [GREEN] Unique identifier
  name: 'Digestin 20 tablets',
  genericName: 'Pepsin + Papain + Sanzyme 2000', // [GREEN] Multienzyme Digestive Formula
  concentration: 'Standard formulation',
  price: 42, 
  matchKeywords: [
      'digestin', 'enzymes', 'indigestion', 'appetizer', 'bloating', 'pepsin', 'papain',
      'ديجستين أقراص', 'مهضم', 'فاتح شهية', 'عسر هضم', 'إنزيمات هاضمة', 'انتفاخ المعدة'
  ],
  usage: 'إنزيمات هاضمة للمساعدة في تخفيف عسر الهضم وثِقَل المعدة بعد الوجبات. لا يُنصح باعتباره “فاتح شهية” كاستطباب أساسي.',
  timing: '٣ مرات يومياً أثناء/بعد الأكل – ٧–١٤ يوم',
  category: Category.DIGESTIVE, // [GREEN] Digestive Aid
  form: 'Tablet',

  minAgeMonths: 144,
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (_weight, ageMonths) => {
    if (ageMonths >= 144) {
      return '١ قرص أثناء/بعد الأكل مباشرة ٣ مرات يومياً لمدة ٧–١٤ يوم.';
    }

    return 'للأطفال يُفضل الشكل السائل/شراب إذا كان متاحاً لضبط الجرعة وسهولة التناول.';
  },

  warnings: [
    'الحمل: منخفض الخطورة غالباً (امتصاص إنزيمات الهضم محدود)، لكن أعدي التقييم عند الاستخدام المتكرر.',
    'التداخلات: لا توجد تداخلات دوائية شائعة مهمة عادةً؛ اترك فاصل ١–٢ ساعة عن الأدوية الفموية الأخرى إن كنت تتناول عدة أدوية.',
    'غير مناسب عند الحساسية لأي مكوّن.',
    ...W_ALLERGY,
    'أعراض إنذار (ألم شديد مستمر/قيء متكرر/نزف/نقص وزن) تستلزم تقييماً.'
  ]
},

// 6. Digenorm 20 enteric coated tab. (Now Digestozyme)
{
  id: 'digestozyme-20-ec-tabs', // [GREEN] Unique identifier
  name: 'Digestozyme 20 enteric coated tab.',
  genericName: 'Pancreatin + Papain', // [GREEN] Multienzyme Complex (Enteric Coated)
  concentration: 'Standard Formulation',
  price: 62, 
  matchKeywords: [
      'digenorm', 'digestozyme', 'enzymes', 'digestive', 'indigestion', 'bloating', 'pancreatin',
      'ديجنورم أقراص', 'ديجستوزيم', 'إنزيمات هاضمة', 'عسر هضم', 'انتفاخ', 'هضم الدهون', 'أقراص مغلفة معوياً'
  ],
  usage: 'مستحضر إنزيمات هاضمة مغلف معوياً للمساعدة في هضم الوجبات الدسمة وتقليل الانتفاخ/ثِقَل المعدة.',
  timing: '٣ مرات يومياً مع/بعد الأكل – ٧–١٤ يوم',
  category: Category.DIGESTIVE, // [GREEN] Digestive Enzymes
  form: 'Enteric Coated Tablets',

  minAgeMonths: 144,
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (_weight, ageMonths) => {
    if (ageMonths >= 144) {
      return '١ قرص مع كل وجبة رئيسية أو بعدها مباشرة ٣ مرات يومياً لمدة ٧–١٤ يوم (يمكن ٢ قرص مع الوجبات الدسمة عند اللزوم).';
    }

    return 'غير موصى به عادةً للأطفال أقل من ١٢ سنة (شكل مغلف معوي/صعوبة بلع؛ والجرعات المتخصصة تُحدد طبياً).';
  },

  warnings: [
    'الحمل: منخفض الخطورة غالباً (امتصاص الإنزيمات محدود)، لكن يُستشار الطبيب خصوصاً مع الاستخدام الطويل.',
    'التداخلات: قد يقلل تأثير أكاربوز/ميجليتول (أدوية سكر) نظرياً—راقب سكر الدم.',
    'غير مناسب في التهاب البنكرياس الحاد أو تفاقم التهاب البنكرياس المزمن.',
    'تحذيرات: يُتجنب عند حساسية لمصدر حيواني. مضغ/تكسير القرص قد يسبب تهيج الفم ويقلل الفاعلية.'
  ]
},

// 7. Lactase 750 15ml oral drops
{
  id: 'lactase-750-15ml-drops', // [GREEN] Unique identifier
  name: 'Lactase 750 15ml oral drops',
  genericName: 'Lactase enzyme (Beta-galactosidase)', // [GREEN] Enzyme for lactose digestion
  concentration: '750 units per ml',
  price: 99, 
  matchKeywords: [
      'lactase', 'lactose intolerance', 'colic', 'infant gas', 'bloating', 'diarrhea', 'drops',
      'لاكتيز ٧٥٠', 'إنزيم لاكتيز', 'نقط للرضع', 'مغص الرضع', 'عدم تحمل اللاكتوز', 'غازات الرضع', 'حساسية اللبن'
  ],
  usage: 'إنزيم لاكتيز للمساعدة في هضم سكر اللاكتوز وتقليل أعراض عدم تحمل اللاكتوز (غازات/انتفاخ/إسهال/مغص) عند الرضع والأطفال والبالغين.',
  timing: 'قبل كل رضعة/وجبة ألبان – مستمر',
  category: Category.DIGESTIVE, // [GREEN] Digestive Enzyme
  form: 'Oral Drops',

  minAgeMonths: 0,
  maxAgeMonths: 1200,
  minWeight: 2,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths < 12) {
      return '٤–٥ نقاط تُخلط مع قليل من لبن الأم أو تُضاف للبن الصناعي الدافئ قبل كل رضعة مباشرة (مستمر مع اللاكتوز).';
    } else if (ageMonths >= 12 && ageMonths < 144) {
      return '٥–١٠ نقاط مع كل كوب حليب أو وجبة منتجات ألبان (قبل الوجبة).';
    } else {
      return '١٠–١٥ نقطة مع وجبات منتجات الألبان (قبل الوجبة).';
    }
  },

  warnings: [
    'الحمل: منخفض الخطورة (إنزيم موضعي داخل الأمعاء) عند الحاجة.',
    'التداخلات: لا توجد تداخلات دوائية شائعة ذات أهمية كبيرة.',
    'تحذيرات: هذا المنتج لا يعالج حساسية بروتين لبن البقر—دم بالبراز/إكزيما شديدة/فشل نمو تستلزم تقييماً.',
    'تحذيرات: استمرار الأعراض أو ظهور علامات جفاف/إسهال شديد يستلزم تقييماً.'
  ]
},

// 8. Lactase oral drops 30 ml
{
  id: 'lactase-30ml-drops', // [GREEN] Unique identifier
  name: 'Lactase oral drops 30 ml',
  genericName: 'Lactase enzyme (Beta-galactosidase)', // [GREEN] Enzyme for lactose digestion
  concentration: '750 units per ml',
  price: 160, 
  matchKeywords: [
      'lactase', 'lactose intolerance', 'infant colic', 'bloating', 'gas', 'diarrhea', 'drops', '30ml',
      'لاكتيز ٣٠ مل', 'إنزيم لاكتيز', 'نقط للرضع', 'مغص الرضع', 'عدم تحمل اللاكتوز', 'غازات الرضع', 'عبوة توفير'
  ],
  usage: 'إنزيم لاكتيز للمساعدة في هضم اللاكتوز وتقليل أعراض عدم تحمله (غازات/انتفاخ/إسهال/مغص).',
  timing: 'قبل كل رضعة/وجبة ألبان – مستمر',
  category: Category.DIGESTIVE, // [GREEN] Digestive Enzyme
  form: 'Oral Drops',

  minAgeMonths: 0,
  maxAgeMonths: 1200,
  minWeight: 2,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths < 12) {
      return '٤–٥ نقاط مع كل رضعة (طبيعية/صناعية)، تُضاف للبن الدافئ أو تُعطى بالملعقة قبل الرضاعة مباشرة (مستمر مع اللاكتوز).';
    } else if (ageMonths >= 12 && ageMonths < 144) {
      return '٥–١٠ نقاط مع كل كوب حليب أو وجبة ألبان (قبل الوجبة).';
    } else {
      return '١٠–١٥ نقطة مع وجبات منتجات الألبان (قبل الوجبة).';
    }
  },

  warnings: [
    'الحمل: منخفض الخطورة (إنزيم موضعي داخل الأمعاء) عند الحاجة.',
    'التداخلات: لا توجد تداخلات دوائية شائعة ذات أهمية كبيرة.',
    'تحذيرات: لا يعالج حساسية بروتين اللبن. أعراض شديدة أو دم بالبراز/فشل نمو تستلزم تقييماً.',
    'تعليمات الحفظ على العبوة مهمة للحفاظ على فعالية الإنزيم.'
  ]
},

// 9. Jomogestive 20 e.c. tabs.
{
  id: 'jomogestive-20-ec-tabs', // [GREEN] Unique identifier
  name: 'Jomogestive 20 e.c. tabs.',
  genericName: 'Pancreatin + Papain + Simethicone', // [GREEN] Multienzyme and Anti-flatulent complex
  concentration: 'Standard Multi-Enzyme Formula',
  price: 120, 
  matchKeywords: [
      'jomogestive', 'enzymes', 'pancreatin', 'simethicone', 'bloating', 'indigestion', 'fatty meals',
      'جوموجيستيف', 'جومو جستيف', 'إنزيمات هاضمة', 'عسر هضم', 'انتفاخ', 'غازات', 'هضم الدهون', 'البنكرياس'
  ],
  usage: 'إنزيمات هاضمة + طارد غازات للمساعدة في عسر الهضم والانتفاخ بعد الوجبات الدسمة.',
  timing: '٣ مرات يومياً مع/بعد الأكل – ٧–١٤ يوم',
  category: Category.DIGESTIVE, // [GREEN] Digestive and Anti-flatulent
  form: 'Enteric Coated Tablets',

  minAgeMonths: 144,
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (_weight, ageMonths) => {
    if (ageMonths >= 144) {
      return '١ قرص مع كل وجبة رئيسية ٣ مرات يومياً لمدة ٧–١٤ يوم (يمكن ٢ قرص مع الوجبات الدسمة عند اللزوم).';
    }

    return 'غير موصى به عادةً للأطفال أقل من ١٢ سنة (شكل مغلف معوي/صعوبة بلع).';
  },

  warnings: [
    'الحمل: منخفض الخطورة غالباً، لكن يُستشار الطبيب خصوصاً عند الاستخدام المتكرر.',
    'التداخلات: لا توجد تداخلات مهمة شائعة للسيـميثيكون عادةً؛ وقد يقل تأثير أكاربوز/ميجليتول نظرياً بسبب مكونات الإنزيمات.',
    'غير مناسب في التهاب البنكرياس الحاد أو تفاقمه، ويُتجنب عند حساسية لمصدر حيواني.',
    'مضغ/تكسير القرص قد يسبب تهيج الفم ويقلل الفاعلية.'
  ]
},

// 10. Wiferment 10 capsules
{
  id: 'wiferment-10-caps', // [GREEN] Unique identifier
  name: 'Wiferment 10 capsules',
  genericName: 'Fungal Diastase + Papain', // [GREEN] Digestive Enzyme Complex
  concentration: 'Standard Enzyme Formulation',
  price: 96, 
  matchKeywords: [
      'wiferment', 'digestive enzymes', 'diastase', 'papain', 'indigestion', 'bloating', 'dyspepsia',
      'وايفيرمينت', 'واي فيرمنت', 'إنزيمات هاضمة', 'عسر هضم', 'انتفاخ', 'هضم النشويات', 'هضم البروتينات'
  ],
  usage: 'إنزيمات هاضمة للمساعدة في تقليل ثِقَل المعدة والانتفاخ بعد الوجبات.',
  timing: '٣ مرات يومياً مع/بعد الأكل – ٧–١٤ يوم',
  category: Category.DIGESTIVE, // [GREEN] Digestive Aid
  form: 'Capsule',

  minAgeMonths: 144,
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (_weight, ageMonths) => {
    if (ageMonths >= 144) {
      return '١ كبسولة مع كل وجبة رئيسية ٣ مرات يومياً لمدة ٧–١٤ يوم.';
    }

    return 'غير موصى به عادةً للأطفال أقل من ١٢ سنة إلا حسب التشخيص والسن.';
  },

  warnings: [
    'الحمل والرضاعة: منخفض الخطورة غالباً (امتصاص الإنزيمات محدود) لكن البيانات محدودة مع الاستخدام المتكرر.',
    'التداخلات: لا توجد تداخلات دوائية شائعة ذات أهمية كبيرة عادةً.',
    'غير مناسب في التهاب البنكرياس الحاد أو عند الحساسية لأي مكوّن.',
    ...W_ALLERGY,
    ...W_RED_FLAGS_GI,
    'استمرار الأعراض أو وجود علامات إنذار يستلزم تقييماً.'
  ]
},

// 11. Zymagallin 30 tablets
{
  id: 'zymagallin-30-tabs', // [GREEN] Unique identifier
  name: 'Zymagallin 30 tablets',
  genericName: 'Pancreatin + Papain', // [GREEN] Digestive Enzyme Complex
  concentration: '200mg + 50mg',
  price: 48, 
  matchKeywords: [
      'zymagallin', 'enzymes', 'pancreatin', 'papain', 'digestion', 'indigestion', 'bloating',
      'زايماجالين', 'زايما جالين', 'إنزيمات هاضمة', 'عسر هضم', 'انتفاخ', 'هضم البروتينات', 'هضم الدهون'
  ],
  usage: 'إنزيمات هاضمة مغلفة معوياً للمساعدة في عسر الهضم والانتفاخ بعد الوجبات، وقد تُستخدم طبياً في قصور البنكرياس حسب التشخيص.',
  timing: '٣ مرات يومياً مع/بعد الأكل – ٧–١٤ يوم',
  category: Category.DIGESTIVE, // [GREEN] Digestive Aid
  form: 'Enteric Coated Tablets',

  minAgeMonths: 144, // 12 years
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (_weight, ageMonths) => {
    if (ageMonths >= 144) { // Adults and children over 12 years
      return '١ قرص مع كل وجبة رئيسية ٣ مرات يومياً لمدة ٧–١٤ يوم (يمكن ٢ قرص مع الوجبات الدسمة عند اللزوم).';
    }

    return 'غير موصى به عادةً للأطفال أقل من ١٢ سنة (شكل مغلف معوي/صعوبة بلع؛ والجرعات المتخصصة تُحدد طبياً).';
  },

  warnings: [
    'الحمل: منخفض الخطورة غالباً (امتصاص الإنزيمات محدود)، لكن يُستشار الطبيب خصوصاً مع الاستخدام الطويل.',
    'التداخلات: قد يقل تأثير أكاربوز/ميجليتول نظرياً—راقب سكر الدم.',
    'غير مناسب في التهاب البنكرياس الحاد أو تفاقمه، ويُتجنب عند حساسية لمصدر حيواني.',
    'مضغ/تكسير القرص قد يسبب تهيج الفم ويقلل الفاعلية.'
  ]
},


// 12. Gelogar drops 15ml
{
  id: 'gelogar-15ml-drops', // [GREEN] Unique identifier
  name: 'Gelogar drops 15ml',
  genericName: 'Lactase enzyme (beta-galactosidase)', // [GREEN] Enzyme for lactose digestion
  concentration: 'Standard formulation',
  price: 98, 
  matchKeywords: [
      'gelogar', 'lactase', 'infant colic', 'gas', 'bloating', 'lactose intolerance', 'drops',
      'جيلوجار', 'جيلو جار', 'إنزيم لاكتيز', 'مغص الرضع', 'غازات الرضع', 'حساسية اللاكتوز', 'نقط للفم'
  ],
  usage: 'إنزيم لاكتيز للمساعدة في هضم سكر اللاكتوز وتقليل أعراض عدم تحمله (مغص/غازات/انتفاخ/إسهال) عند الرضع والأطفال والبالغين.',
  timing: 'قبل كل رضعة/وجبة ألبان – مستمر',
  category: Category.DIGESTIVE, // [GREEN] Digestive Enzyme
  form: 'Oral Drops',

  minAgeMonths: 0,
  maxAgeMonths: 1200,
  minWeight: 2,
  maxWeight: 250,

  calculationRule: (_weight, ageMonths) => {
    if (ageMonths < 12) { // Infants
      return '٤–٥ نقاط قبل كل رضعة مباشرة (طبيعية بالملعقة مع قليل من لبن الأم، صناعية تُضاف للبن الدافئ) – مستمر مع اللاكتوز.';
    }

    return '٥–١٠ نقاط مع كل كوب حليب/وجبة ألبان (قبل الوجبة).';
  },

  warnings: [
    'الحمل: منخفض الخطورة (إنزيم موضعي داخل الأمعاء) عند الحاجة.',
    'التداخلات: لا توجد تداخلات دوائية شائعة ذات أهمية كبيرة.',
    'تحذيرات: لا يعالج حساسية بروتين اللبن. إذا وُجد دم بالبراز/إكزيما شديدة/فشل نمو يلزم تقييم طبي.',
    'تعليمات التخزين على العبوة مهمة للحفاظ على فعالية الإنزيم.'
  ]
},


];

