import { Medication, Category } from '../../../../types';

export const OSMOTIC_DIURETICS_MEDS: Medication[] = [
  // 1. Mannitol 10% (allmed) i.v. inf. 500 ml (rubber cap)
  {
    id: 'mannitol-10-rubber',
    name: 'Mannitol 10% (allmed) i.v. inf. 500 ml (rubber cap)',
    genericName: 'Mannitol',
    concentration: '10%',
    price: 14.25,
    matchKeywords: [
      'cerebral edema', 'glaucoma', 'icp', 'osmotic diuretic', 'mannitol',
      'مانيتول ١٠', 'وذمة المخ', 'ضغط العين', 'ارتشاح المخ', 'مدر اسموزي'
    ],
    usage: 'مدر للبول أسموزي. يستخدم لتقليل الضغط داخل الجمجمة (Intracranial Pressure) وعلاج وذمة الدماغ (Cerebral Edema)، ولخفض ضغط العين المرتفع جداً (Acute Glaucoma) قبل الجراحة.',
    timing: 'عند اللزوم',
    category: Category.DIURETIC, // Osmotic diuretic subgroup
    form: 'I.V. Infusion Vial',

    minAgeMonths: 1,
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      const doseGrams = weight * 0.5;
      const volumeMl = (doseGrams * 100) / 10;
      return `${volumeMl} مل من محلول ١٠٪ (٠.٥ جم/كجم) وريدي ببطء خلال ٣٠–٦٠ دقيقة عند اللزوم بدون اعتبار للأكل`;
    },

    warnings: [
      'يجب التأكد من سلامة وظائف الكلى وإخراج البول قبل الاستخدام.',
      'يمنع استخدامه في حالات النزيف الدماغي النشط (Active Intracranial Bleeding) إلا أثناء العمليات الجراحية.',
      'قد يسبب زيادة مبدئية في حجم الدم (Volume Expansion) مما يشكل خطراً على مرضى قصور القلب (Heart Failure).'
    ]
  },

  // 2. Mannitol 10% (allmed) i.v. inf. 500 ml
  {
    id: 'mannitol-10-normal',
    name: 'Mannitol 10% (allmed) i.v. inf. 500 ml',
    genericName: 'Mannitol',
    concentration: '10%',
    price: 13.5,
    matchKeywords: [
      'cerebral edema', 'mannitol 10', 'osmotic',
      'مانيتول', 'استسقاء الدماغ', 'ضغط المخ'
    ],
    usage: 'يستخدم لتقليل الوذمة الدماغية وضغط العين، ولتحفيز إدرار البول في المرحلة المبكرة من الفشل الكلوي الحاد (Oliguric phase) قبل حدوث تلف نهائي للكلى.',
    timing: 'عند اللزوم',
    category: Category.DIURETIC,
    form: 'I.V. Infusion Vial',

    minAgeMonths: 1,
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      const doseGrams = weight * 0.5;
      const volumeMl = (doseGrams * 100) / 10;
      return `${volumeMl} مل من محلول ١٠٪ (٠.٥ جم/كجم) وريدي ببطء خلال ٣٠–٦٠ دقيقة عند اللزوم بدون اعتبار للأكل`;
    },

    warnings: [
      'يمنع استخدامه في حالات الجفاف الشديد (Severe Dehydration).',
      'يجب مراقبة شوارد الدم (Electrolytes) خوفاً من حدوث خلل في الصوديوم والبوتاسيوم.',
      'التسريب خارج الوريد (Extravasation) قد يسبب تضرراً للأنسجة وتورماً والتهاباً.'
    ]
  },

  // 3. Mannitol 20% (allmed) i.v. inf. 500 ml
  {
    id: 'mannitol-20-normal',
    name: 'Mannitol 20% (allmed) i.v. inf. 500 ml',
    genericName: 'Mannitol',
    concentration: '20%',
    price: 17.25,
    matchKeywords: [
      'severe cerebral edema', 'mannitol 20', 'high concentration',
      'مانيتول ٢٠', 'تركيز عالي', 'ضغط المخ العالي'
    ],
    usage: 'تركيز مضاعف (٢٠٪) يوفر فعالية أسموزية أعلى بحجم سوائل أقل. الخيار المفضل لعلاج وذمة الدماغ الشديدة لتقليل الحمل الحجمي على القلب.',
    timing: 'عند اللزوم',
    category: Category.DIURETIC,
    form: 'I.V. Infusion Vial',

    minAgeMonths: 1,
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      const doseGrams = weight * 0.5;
      const volumeMl = (doseGrams * 100) / 20;
      return `${volumeMl} مل من محلول ٢٠٪ (٠.٥ جم/كجم) وريدي ببطء خلال ٣٠–٦٠ دقيقة عند اللزوم بدون اعتبار للأكل`;
    },

    warnings: [
      'يجب الحذر الشديد مع مرضى ضعف عضلة القلب، حيث يسحب السوائل بسرعة إلى الدم مما قد يسبب وذمة رئوية (Pulmonary Edema).',
      'يمنع استخدامه في حالة انقطاع البول التام (Anuria) الناتج عن مرض كلوي شديد.'
    ]
  },

  // 4. Mannitol 20% (allmed) i.v. inf. 500 ml (rubber cap)
  {
    id: 'mannitol-20-rubber',
    name: 'Mannitol 20% (allmed) i.v. inf. 500 ml (rubber cap)',
    genericName: 'Mannitol',
    concentration: '20%',
    price: 58,
    matchKeywords: [
      'cerebral edema', 'mannitol 20', 'rubber cap',
      'مانيتول ٢٠', 'غطاء مطاطي', 'عبوة خاصة'
    ],
    usage: 'محلول مانيتول مركز (٢٠٪) بعبوة ذات غطاء مطاطي (Rubber Cap) لسهولة التعامل والحقن المتكرر أو السحب المعقم.',
    timing: 'عند اللزوم',
    category: Category.DIURETIC,
    form: 'I.V. Infusion Vial',

    minAgeMonths: 1,
    maxAgeMonths: 1200,
    minWeight: 3,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      const doseGrams = weight * 0.5;
      const volumeMl = (doseGrams * 100) / 20;
      return `${volumeMl} مل من محلول ٢٠٪ (٠.٥ جم/كجم) وريدي ببطء خلال ٣٠–٦٠ دقيقة عند اللزوم بدون اعتبار للأكل`;
    },

    warnings: [
      'ارتفاع السعر في هذه العبوة (٥٨ ج.م) مقارنة بالعادية قد يرجع لنوع العبوة أو الشركة المصنعة، المادة الفعالة واحدة.',
      'يجب التوقف عن الدواء فوراً إذا تفاقم الفشل الكلوي أو ظهرت أعراض فشل القلب الاحتقاني.',
      'خطر التبلور وارد جداً، يجب الفحص البصري الدقيق قبل التعليق.'
    ]
  }
];

