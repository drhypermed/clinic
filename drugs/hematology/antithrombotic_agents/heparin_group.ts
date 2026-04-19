
import { Medication, Category } from '../../../types';

export const HEPARIN_GROUP: Medication[] = [
  // 1. Cal-Heparin 5000 I.U. amp.
  {
    id: 'cal-heparin-5000-amp',
    name: 'Cal-Heparin 5000 I.U. amp.',
    genericName: 'Heparin Calcium',
    concentration: '5000 IU/ml',
    price: 79,
    matchKeywords: [
      'heparin calcium', 'anticoagulant', 'dvt prophylaxis', 'cal heparin', 'blood thinner',
      'كال هيبارين', 'هيبارين كالسيوم', 'سيولة', 'جلطات', 'وقاية'
    ],
    usage: 'هيبارين (كالسيوم) للحقن تحت الجلد. يستخدم بشكل أساسي للوقاية من الجلطات (DVT) قبل وبعد العمليات الجراحية وللمرضى طريحي الفراش.',
    timing: 'كل ٨–١٢ ساعة – ٧–١٠ أيام',
    category: Category.ANTICOAGULANT,
    form: 'Injection (SC/IV)',

    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 2,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '٥٠٠٠ وحدة دولية تحت الجلد كل ٨–١٢ ساعة لمدة ٧–١٠ أيام (وقاية).';
    },

    warnings: [
      'هيبارين الكالسيوم يسبب ألماً وكدمات أقل قليلاً من هيبارين الصوديوم عند الحقن تحت الجلد.',
      'يجب متابعة صفائح الدم (Platelets) خوفاً من نقص الصفائح المناعي (HIT).',
      'يستخدم بحذر شديد مع مرضى القرحة النشطة أو نزيف حديث.'
    ]
  },

  // 2. Clexane 100mg/ml 2 prefilled syringes
  {
    id: 'clexane-100-syringes',
    name: 'Clexane 100mg/ml 2 prefilled syringes',
    genericName: 'Enoxaparin Sodium',
    concentration: '100mg/1ml',
    price: 507,
    matchKeywords: [
      'enoxaparin', 'clexane', 'lmwh', 'dvt treatment', 'pe',
      'كليكسان ١٠٠', 'اينوكسابارين', 'حقن سيولة', 'علاج الجلطة', 'الرئة'
    ],
    usage: 'حقن (إينوكسابارين) بتركيز علاجي عالي (١٠٠ مجم). تستخدم لعلاج الجلطات الوريدية العميقة (DVT) والجلطات الرئوية (PE) وذبحات الصدر غير المستقرة.',
    timing: 'كل ١٢ ساعة – ٧–١٠ أيام',
    category: Category.ANTICOAGULANT,
    form: 'Injection (SC/IV)',

    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ مجم/كجم تحت الجلد كل ١٢ ساعة لمدة ٧–١٠ أيام (مثلاً ١٠٠ كجم → حقنة ١٠٠ مجم صباحاً ومساءً).';
    },

    warnings: [
      'خطر النزيف مرتفع مع هذه الجرعة، راقب علامات النزيف (لثة، بول، براز).',
      'يجب تعديل الجرعة لمرضى الفشل الكلوي (Creatinine Clearance < 30).',
      'السعر (٥٠٧ جنيه) للحقنتين.'
    ]
  },

  // 3. Clexane 60mg/0.6ml 2 prefilled syringe
  {
    id: 'clexane-60-syringes',
    name: 'Clexane 60mg/0.6ml 2 prefilled syringe',
    genericName: 'Enoxaparin Sodium',
    concentration: '60mg/0.6ml',
    price: 367,
    matchKeywords: [
      'enoxaparin', 'clexane', 'anticoagulant', 'post-op',
      'كليكسان ٦٠', 'سيولة', 'بعد العمليات', 'جلطة الساق'
    ],
    usage: 'تركيز متوسط (٦٠ مجم) يستخدم كجرعة علاجية للأوزان المتوسطة (٦٠ كجم) أو جرعة وقائية عالية الخطورة (High Risk Prophylaxis).',
    timing: 'كل ١٢ ساعة – ٧–١٠ أيام',
    category: Category.ANTICOAGULANT,
    form: 'Injection (SC/IV)',

    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '٦٠ مجم تحت الجلد كل ١٢ ساعة لمدة ٧–١٠ أيام (علاجياً لوزن ٦٠ كجم).';
    },

    warnings: [
      'ممنوع الحقن بالعضل (IM) تماماً (يسبب تجمع دموياً خطيراً Hematoma).',
      'أعيد التقييم فوراً عند نزيف لا يتوقف.'
    ]
  },

  // 4. Clexane 20mg/0.2ml 2 prefilled syringes
  {
    id: 'clexane-20-syringes',
    name: 'Clexane 20mg/0.2ml 2 prefilled syringes',
    genericName: 'Enoxaparin Sodium',
    concentration: '20mg/0.2ml',
    price: 183,
    matchKeywords: [
      'enoxaparin', 'clexane', 'prophylaxis', 'kidney patient',
      'كليكسان ٢٠', 'وقاية', 'مرضى الكلى', 'سيولة بسيطة'
    ],
    usage: 'أقل تركيز من الكليكسان. يستخدم للوقاية من الجلطات (Prophylaxis) في الحالات منخفضة ومتوسطة الخطورة، وهو الخيار الآمن لمرضى الكلى (CrCl < 30).',
    timing: 'مرة يومياً – ٧–١٠ أيام',
    category: Category.ANTICOAGULANT,
    form: 'Injection (SC/IV)',

    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '٢٠ مجم تحت الجلد مرة يومياً لمدة ٧–١٠ أيام.';
    },

    warnings: [
      'الجرعة الآمنة الوحيدة لمرضى الغسيل الكلوي أو الفشل الكلوي الشديد كوقاية.'
    ]
  },

  // 5. Clexane 40mg/0.4ml 2 prefilled syringe
  {
    id: 'clexane-40-syringes',
    name: 'Clexane 40mg/0.4ml 2 prefilled syringe',
    genericName: 'Enoxaparin Sodium',
    concentration: '40mg/0.4ml',
    price: 311,
    matchKeywords: [
      'enoxaparin', 'clexane', 'prophylaxis', 'surgery', 'pregnancy',
      'كليكسان ٤٠', 'حقن التثبيت', 'حمل', 'بعد الولادة', 'وقاية'
    ],
    usage: 'الجرعة القياسية للوقاية من الجلطات (Standard Prophylaxis) بعد العمليات الجراحية العامة وللحوامل (لمنع الإجهاض بسبب التجلط).',
    timing: 'مرة يومياً – ٧–١٠ أيام',
    category: Category.ANTICOAGULANT,
    form: 'Injection (SC/IV)',

    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 10,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '٤٠ مجم تحت الجلد مرة يومياً لمدة ٧–١٠ أيام.';
    },

    warnings: [
      'إيقاف الحقن قبل العملية أو الولادة بـ 12 ساعة على الأقل (أو 24 ساعة حسب الحالة).'
    ]
  },

  // 6. Arixtra 2.5mg/0.5ml 10 s.c. prefilled syringes
  {
    id: 'arixtra-2.5-syringes',
    name: 'Arixtra 2.5mg/0.5ml 10 s.c. prefilled syringes',
    genericName: 'Fondaparinux Sodium',
    concentration: '2.5mg/0.5ml',
    price: 1382,
    matchKeywords: [
      'fondaparinux', 'arixtra', 'hit', 'orthopedic surgery', 'acs',
      'اريكسترا', 'فوندابارينوكس', 'بديل الهيبارين', 'حساسية الهيبارين'
    ],
    usage: 'مضاد تجلط متطور (Synthetic). يستخدم للوقاية في جراحات العظام الكبرى (المفاصل) وعلاج ذبحات القلب. هو البديل الآمن لمن عندهم حساسية من الهيبارين (HIT).',
    timing: 'مرة يومياً – ٥–٩ أيام',
    category: Category.ANTICOAGULANT,
    form: 'Injection (SC/IV)',

    minAgeMonths: 216, // Adults
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '٢٫٥ مجم تحت الجلد مرة يومياً لمدة ٥–٩ أيام (وقاية أو علاج ACS).';
    },

    warnings: [
      'ممنوع إذا CrCl أقل من 30 (تتراكم وتسبب نزيفاً).',
      'العبوة تحتوي على ١٠ حقن.'
    ]
  },

  // 7. Heparin Sodium-CID 5000 I.U./ml 100 s.c. amp.
  {
    id: 'heparin-cid-100-amp',
    name: 'Heparin Sodium-CID 5000 I.U./ml 100 s.c. amp.',
    genericName: 'Heparin Sodium',
    concentration: '5000 IU/ml',
    price: 1350,
    matchKeywords: [
      'heparin sodium', 'hospital pack', 'anticoagulant', 'cid',
      'هيبارين سيد', 'عبوة مستشفيات', 'سيولة', 'حقن'
    ],
    usage: 'عبوة توفير للمستشفيات (١٠٠ أمبول). هيبارين صوديوم يستخدم للوقاية والعلاج (بالوريد) للجلطات.',
    timing: 'كل ٨–١٢ ساعة – ٧–١٠ أيام',
    category: Category.ANTICOAGULANT,
    form: 'Injection (SC/IV)',

    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 2,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '٥٠٠٠ وحدة تحت الجلد كل ٨–١٢ ساعة لمدة ٧–١٠ أيام (وقاية)، أو IV ثم تسريب حسب PTT للعلاج.';
    },

    warnings: [
      'يتطلب متابعة دقيقة لتحليل الـ aPTT لضبط الجرعة العلاجية.',
      'ممنوع لمرضى نزيف المخ أو القرحة النازفة.'
    ]
  },

  // 8. Clexane 80 mg/0.8ml 2 prefilled syringe.
  {
    id: 'clexane-80-syringes',
    name: 'Clexane 80 mg/0.8ml 2 prefilled syringe.',
    genericName: 'Enoxaparin Sodium',
    concentration: '80mg/0.8ml',
    price: 417,
    matchKeywords: [
      'enoxaparin', 'clexane', 'high dose', 'treatment',
      'كليكسان ٨٠', 'جرعة علاجية', 'جلطة رئوية', 'سيولة'
    ],
    usage: 'تركيز علاجي (٨٠ مجم) للمرضى بوزن حوالي ٨٠ كجم، أو جرعة وقائية مكثفة جداً.',
    timing: 'كل ١٢ ساعة – ٧–١٠ أيام',
    category: Category.ANTICOAGULANT,
    form: 'Injection (SC/IV)',

    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '٨٠ مجم تحت الجلد كل ١٢ ساعة لمدة ٧–١٠ أيام (علاج لوزن ٧٥–٨٥ كجم).';
    },

    warnings: [
      'في كبار السن (فوق ٧٥ سنة)، قد يتم تقليل الجرعة لتجنب النزيف.',
      'السعر (٤١٧ جنيه) للحقنتين.'
    ]
  },

  // 9. Heparin Sodium 5000 I.U./ml 100 s.c. amp.
  {
    id: 'heparin-sodium-generic-100',
    name: 'Heparin Sodium 5000 I.U./ml 100 s.c. amp.',
    genericName: 'Heparin Sodium',
    concentration: '5000 IU/ml',
    price: 1350,
    matchKeywords: [
      'heparin', 'generic', 'anticoagulant', 'hospital',
      'هيبارين صوديوم', 'عبوة كبيرة', 'سيولة'
    ],
    usage: 'هيبارين صوديوم (عبوة مستشفيات ١٠٠ أمبول). نفس استخدامات الهيبارين سيد.',
    timing: 'كل ٨–١٢ ساعة – ٧–١٠ أيام',
    category: Category.ANTICOAGULANT,
    form: 'Injection (SC/IV)',

    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 2,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '٥٠٠٠ وحدة تحت الجلد كل ١٢ ساعة لمدة ٧–١٠ أيام (وقاية).';
    },

    warnings: [
      'الجرعات العالية لفترات طويلة (شهور) قد تسبب هشاشة عظام.'
    ]
  },

  // 10. Heparin Sodium-Nile 5000 I.U./ml 3 amps.
  {
    id: 'heparin-nile-3-amp',
    name: 'Heparin Sodium-Nile 5000 I.U./ml 3 amps. usp27',
    genericName: 'Heparin Sodium',
    concentration: '5000 IU/ml',
    price: 162,
    matchKeywords: [
      'heparin nile', 'small pack', 'dialysis', 'catheter flush',
      'هيبارين النيل', 'هيبارين مصري', 'غسيل كلوي', 'تسليك القسطرة'
    ],
    usage: 'عبوة صغيرة (٣ أمبولات) من الهيبارين. مناسبة للاستخدام المنزلي القصير أو لتسليك القسطرة الوريدية (Heparin Lock) بجرعات مخففة.',
    timing: 'كل ١٢ ساعة – حسب الحاجة',
    category: Category.ANTICOAGULANT,
    form: 'Injection (SC/IV)',

    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 2,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '٥٠٠٠ وحدة (أمبول) تحت الجلد كل ١٢ ساعة (وقاية)، أو تخفف (١٠–١٠٠ وحدة/مل) لغسيل القسطرة.';
    },

    warnings: [
      'لا تستخدم قوة مفرطة عند كسر الأمبول.'
    ]
  },

  // 11. Heparin Sodium-CID 5000 I.U./ml 6 s.c. amp.
  {
    id: 'heparin-cid-6-amp',
    name: 'Heparin Sodium-CID 5000 I.U./ml 6 s.c. amp.',
    genericName: 'Heparin Sodium',
    concentration: '5000 IU/ml',
    price: 324,
    matchKeywords: [
      'heparin cid', '6 amps', 'anticoagulant',
      'هيبارين سيد', '٦ امبولات', 'سيولة'
    ],
    usage: 'عبوة 6 أمبولات (وقاية نحو 3 أيام).',
    timing: 'كل ١٢ ساعة – ٣ أيام',
    category: Category.ANTICOAGULANT,
    form: 'Injection (SC/IV)',

    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 2,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '٥٠٠٠ وحدة (أمبول) تحت الجلد كل ١٢ ساعة لمدة ٣ أيام.';
    },

    warnings: [
      'تغير لون الجلد للأزرق مكان الحقن وارد، لكن إذا كان مؤلماً جداً أو متورماً، غير مكان الحقن.'
    ]
  },

  // 12. Arixtra 10mg/0.8ml 10 s.c. prefilled syringe
  {
    id: 'arixtra-10-syringes',
    name: 'Arixtra 10mg/0.8ml 10 s.c. prefilled syringe',
    genericName: 'Fondaparinux Sodium',
    concentration: '10mg/0.8ml',
    price: 1050,
    matchKeywords: [
      'arixtra 10', 'high dose', 'obesity', 'dvt treatment',
      'اريكسترا ١٠', 'جرعة عالية', 'علاج الجلطة', 'سمنة'
    ],
    usage: 'جرعة علاجية عالية (١٠ مجم) من الأريكسيترا. مخصصة لعلاج الجلطات (DVT/PE) للمرضى ذوي الأوزان الثقيلة (أكثر من ١٠٠ كجم).',
    timing: 'مرة يومياً – ٥–٩ أيام',
    category: Category.ANTICOAGULANT,
    form: 'Injection (SC/IV)',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 100, // Specific for >100kg
    maxWeight: 300,

    calculationRule: (weight, ageMonths) => {
      return '١٠ مجم تحت الجلد مرة يومياً لمدة ٥–٩ أيام (لمرضى >١٠٠ كجم).';
    },

    warnings: [
      'ممنوع لمرضى الفشل الكلوي.',
      'خطر النزيف عالٍ جداً، راقب المريض جيداً.'
    ]
  }
];

