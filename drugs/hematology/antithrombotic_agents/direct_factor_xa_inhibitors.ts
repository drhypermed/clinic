
import { Medication, Category } from '../../../types';

export const DIRECT_FACTOR_XA_INHIBITORS: Medication[] = [
  // 1. Eliquis 2.5 mg 20 f.c. tabs.
  {
    id: 'eliquis-2.5-20-tabs',
    name: 'Eliquis 2.5 mg 20 f.c. tabs.',
    genericName: 'Apixaban',
    concentration: '2.5mg',
    price: 532,
    matchKeywords: [
      'apixaban', 'eliquis', 'afib', 'dvt prophylaxis', 'blood thinner', 'anticoagulant', 'DOAC', 'thrombosis',
      'اليكويس', 'ابيكسابان', 'سيولة', 'وقاية', 'ذبحة اذينية', 'جلطة', 'مضاد تجلط', 'تجلط'
    ],
    usage: 'مضاد للتجلط للوقاية من الجلطات بعد جراحات العظام (ركبة/فخذ)، أو لمرضى الذبحة الأذينية (AFib) الذين تنطبق عليهم شروط تخفيض الجرعة.',
    timing: 'كل ١٢ ساعة مع الأكل – مزمن',
    category: Category.ANTICOAGULANT,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٢٫٥ مجم مرتين يومياً مع الأكل (مزمن) – جرعة مخففة لعمر ≥٨٠ أو وزن ≤٦٠ كجم أو كرياتينين ≥١٫٥.';
    },

    warnings: [
      'التوقف المفاجئ قد يؤدي لجلطة دماغية فورية.',
      'ممنوع لمرضى الصمامات الصناعية المعدنية (Mechanical Valves).',
      'يجب تعديل الجرعة بدقة لمرضى الفشل الكلوي (CrCl < 25 ممنوع).',
      'تجنب الجمع مع NSAIDs (خطر نزيف مرتفع).',
      'ممنوع أثناء الحمل والرضاعة.'
    ]
  },

  // 2. Eliquis 5mg 20 f.c. tabs.
  {
    id: 'eliquis-5-20-tabs',
    name: 'Eliquis 5mg 20 f.c. tabs.',
    genericName: 'Apixaban',
    concentration: '5mg',
    price: 532,
    matchKeywords: [
      'apixaban', 'eliquis 5', 'stroke prevention', 'dvt treatment', 'anticoagulant', 'DOAC', 'thrombosis',
      'اليكويس ٥', 'جلطة الساق', 'جلطة الرئة', 'سكتة دماغية', 'مضاد تجلط', 'تجلط'
    ],
    usage: 'الجرعة القياسية (Standard Dose) للوقاية من السكتات الدماغية في مرضى الرجفان الأذيني (AFib) وعلاج جلطات الساق والرئة (DVT/PE).',
    timing: 'كل ١٢ ساعة مع الأكل – مزمن',
    category: Category.ANTICOAGULANT,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 60,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٥ مجم مرتين يومياً (كل ١٢ ساعة) مع الأكل (مزمن).';
    },

    warnings: [
      'السعر (٥٣٢ جنيه) للعلبة ٢٠ قرص (تكفي ١٠ أيام فقط)، يجب تنبيه المريض للتكلفة لضمان الاستمرارية.',
      'تجنب الجمع مع NSAIDs (خطر نزيف مرتفع).',
      'يجب تعديل الجرعة لمرضى الكلى. ممنوع للصمامات المعدنية.',
      'ممنوع أثناء الحمل والرضاعة.'
    ]
  },

  // 3. Iksaront 2.5 mg 30 f.c. tablets
  {
    id: 'iksaront-2.5-30-tabs',
    name: 'Iksaront 2.5 mg 30 f.c. tablets',
    genericName: 'Apixaban',
    concentration: '2.5mg',
    price: 330,
    matchKeywords: [
      'apixaban', 'iksaront', 'generic eliquis', 'anticoagulant',
      'اكسارونت', 'بديل اليكويس', 'ابيكسابان', 'سيولة'
    ],
    usage: 'بديل محلي للـ (Eliquis) بنفس المادة الفعالة. يستخدم لتقليل جرعة السيولة لكبار السن ومرضى الكلى.',
    timing: 'كل ١٢ ساعة مع الأكل – مزمن',
    category: Category.ANTICOAGULANT,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٢٫٥ مجم مرتين يومياً (كل ١٢ ساعة) مع الأكل (مزمن).';
    },

    warnings: [
      'التحويل من/إلى الوارفارين: أوقف الدواء وانتظر ٢٤–٤٨ ساعة (حسب الدواء والوظيفة الكلوية) ثم ابدأ الوارفارين؛ راقب INR حتى ٢–٣ قبل إيقاف مضاد Xa. العكس: أوقف الوارفارين، انتظر حتى INR <٢، ثم ابدأ مضاد Xa.'
    ]
  },

  // 4. Iksaront 5 mg 30 f.c. tabs.
  {
    id: 'iksaront-5-30-tabs',
    name: 'Iksaront 5 mg 30 f.c. tabs.',
    genericName: 'Apixaban',
    concentration: '5mg',
    price: 357,
    matchKeywords: [
      'apixaban', 'iksaront 5', 'dvt', 'pe', 'afib',
      'اكسارونت ٥', 'علاج الجلطة', 'سيولة', 'رفرفة قلب'
    ],
    usage: 'علاج جلطات الأوردة العميقة والوقاية من جلطات المخ. البديل الاقتصادي للإليكويس ٥ مجم.',
    timing: 'كل ١٢ ساعة مع الأكل – مزمن',
    category: Category.ANTICOAGULANT,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 60,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'علاج الجلطة الحادة: ٢ قرص (١٠ مجم) مرتين يومياً لمدة ٧ أيام، ثم ١ قرص (٥ مجم) مرتين يومياً (مزمن).';
    },

    warnings: [
      'ممنوع لمرضى الكبد المتقدم (Child-Pugh Class B or C).'
    ]
  },

  // 5. Vaxato 2.5mg 30 tabs
  {
    id: 'vaxato-2.5-30-tabs',
    name: 'Vaxato 2.5mg 30 tabs',
    genericName: 'Rivaroxaban',
    concentration: '2.5mg',
    price: 96.75,
    matchKeywords: [
      'rivaroxaban', 'vaxato', 'cad', 'pad', 'vascular protection', 'anticoagulant', 'DOAC', 'thrombosis',
      'فاكساتو', 'ريفاروكسابان', 'قصور الشرايين', 'سيولة الشرايين', 'جلطة', 'مضاد تجلط', 'تجلط'
    ],
    usage: 'جرعة وعائية (Vascular Dose). تستخدم عادة مع الأسبرين لمرضى قصور الشرايين التاجية (CAD) أو الطرفية (PAD) المزمنة لتقليل خطر الجلطات.',
    timing: 'كل ١٢ ساعة مع الأكل – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٢٫٥ مجم مرتين يومياً مع الأكل (مزمن) – غالباً مع أسبرين ٧٥–١٠٠ مجم.';
    },

    warnings: [
      'سعر اقتصادي جداً (٩٦.٧٥ جنيه) مقارنة بالمثيل المستورد (Xarelto).'
    ]
  },

  // 6. Rivarospire 10 mg 20 f.c. tab.
  {
    id: 'rivarospire-10-20-tabs',
    name: 'Rivarospire 10 mg 20 f.c. tab.',
    genericName: 'Rivaroxaban Micronized',
    concentration: '10mg',
    price: 254,
    matchKeywords: [
      'rivaroxaban', 'micronized', 'rivarospire', 'orthopedic prophylaxis',
      'ريفاروسباير', 'ريفاروكسابان', 'وقاية العظام', 'بعد العمليات'
    ],
    usage: 'للوقاية من الجلطات بعد عمليات تغيير مفصل الركبة أو الفخذ. (Micronized) تعني جزيئات دقيقة لامتصاص أسرع.',
    timing: 'مرة يومياً – ١٤–٣٥ يوم',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ١٠ مجم مرة يومياً لمدة ١٤ يوم (ركبة) أو ٣٥ يوم (فخذ). يبدأ بعد العملية بـ ٦–١٠ ساعات.';
    },

    warnings: [
      'مدة العلاج: أسبوعان للركبة، 5 أسابيع للفخذ.'
    ]
  },

  // 7. Rivarospire 2.5 mg 20 f.c. tab.
  {
    id: 'rivarospire-2.5-20-tabs',
    name: 'Rivarospire 2.5 mg 20 f.c. tab.',
    genericName: 'Rivaroxaban Micronized',
    concentration: '2.5mg',
    price: 66,
    matchKeywords: [
      'rivaroxaban', 'rivarospire', 'vascular dose', 'cad',
      'ريفاروسباير ٢.٥', 'سيولة', 'شرايين تاجية'
    ],
    usage: 'نفس استخدام (Vaxato 2.5) لحماية الشرايين التاجية والطرفية. عبوة ٢٠ قرص.',
    timing: 'كل ١٢ ساعة مع الأكل – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٢٫٥ مجم مرتين يومياً مع الأكل (مزمن).';
    },

    warnings: [
      'يجب الحذر عند الجمع بينه وبين الأسبرين والبلافيكس (خطر النزيف يتضاعف).'
    ]
  },

  // 8. Rivarospire 20 mg 28 f.c.tabs.
  {
    id: 'rivarospire-20-28-tabs',
    name: 'rivarospire 20 mg 28 f.c.tabs.',
    genericName: 'Rivaroxaban Micronized',
    concentration: '20mg',
    price: 364,
    matchKeywords: [
      'rivaroxaban', 'rivarospire 20', 'stroke prevention', 'afib', 'dvt',
      'ريفاروسباير ٢٠', 'جلطة', 'ذبحة اذينية', 'سيولة'
    ],
    usage: 'الجرعة العلاجية الكاملة لمرضى الـ AFib (للوقاية من السكتة) وعلاج الـ DVT/PE.',
    timing: 'مرة يومياً مع العشاء – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٢٠ مجم مرة يومياً مع وجبة العشاء الدسمة (مزمن) – يجب التأكد أن CrCl > ٥٠.';
    },

    warnings: [
      'العبوة ٢٨ قرص (تكفي ٤ أسابيع بالضبط).',
      'ممنوع لمرضى الفشل الكلوي (CrCl < 15).'
    ]
  },

  // 9. Vaxato 10 mg 10 tabs.
  {
    id: 'vaxato-10-10-tabs',
    name: 'Vaxato 10 mg 10 tabs.',
    genericName: 'Rivaroxaban',
    concentration: '10mg',
    price: 170,
    matchKeywords: [
      'rivaroxaban', 'vaxato 10', 'prophylaxis',
      'فاكساتو ١٠', 'وقاية', 'بعد العمليات'
    ],
    usage: 'عبوة صغيرة (١٠ أقراص) للوقاية من الجلطات بعد الجراحات المتوسطة أو فترات الرقود القصيرة.',
    timing: 'مرة يومياً – ١٤–٣٥ يوم',
    category: Category.ANTIPLATELET,
    form: 'Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ١٠ مجم مرة يومياً لمدة ١٤–٣٥ يوم (حسب نوع الجراحة).';
    },

    warnings: [
      'السعر (١٧٠ جنيه) لـ ١٠ أقراص فقط.'
    ]
  },

  // 10. Vaxato 15 mg 30 tabs.
  {
    id: 'vaxato-15-30-tabs',
    name: 'Vaxato 15 mg 30 tabs.',
    genericName: 'Rivaroxaban',
    concentration: '15mg',
    price: 390,
    matchKeywords: [
      'rivaroxaban', 'vaxato 15', 'loading dose', 'kidney dose',
      'فاكساتو ١٥', 'جرعة الكلى', 'بداية العلاج'
    ],
    usage: 'تستخدم كجرعة تحميل (Loading Dose) لعلاج الجلطات الحادة (أول ٣ أسابيع)، أو كجرعة دائمة لمرضى الكلى المتوسطين (CrCl 15-50).',
    timing: 'كل ١٢ ساعة مع الأكل – ٢١ يوم ثم مرة يومياً',
    category: Category.ANTIPLATELET,
    form: 'Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ١٥ مجم مرتين يومياً مع الأكل لمدة ٢١ يوم لعلاج الجلطة، ثم التحول لـ ٢٠ مجم مرة يومياً (مزمن).';
    },

    warnings: [
      'الخبط في المواعيد في أول ٣ أسابيع من علاج الجلطة خطر جداً (فترة إعادة التجلط).'
    ]
  },

  // 11. Vaxato 20 mg 30 tabs.
  {
    id: 'vaxato-20-30-tabs',
    name: 'Vaxato 20 mg 30 tabs.',
    genericName: 'Rivaroxaban',
    concentration: '20mg',
    price: 390,
    matchKeywords: [
      'rivaroxaban', 'vaxato 20', 'afib', 'dvt',
      'فاكساتو ٢٠', 'سيولة', 'جلطة'
    ],
    usage: 'الجرعة القياسية المستمرة للوقاية من السكتة الدماغية وعلاج الجلطات الوريدية.',
    timing: 'مرة يومياً مع العشاء – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٢٠ مجم مرة يومياً مع وجبة رئيسية (الغداء أو العشاء) – مزمن.';
    },

    warnings: [
      'لا تنس الجرعة، مفعول الدواء يختفي خلال ٢٤ ساعة (Short half-life).'
    ]
  },

  // 12. Rivarospire 2.5 mg 30 f.c.tabs.
  {
    id: 'rivarospire-2.5-30-tabs',
    name: 'Rivarospire 2.5 mg 30 f.c.tabs.',
    genericName: 'Rivaroxaban Micronized',
    concentration: '2.5mg',
    price: 99,
    matchKeywords: [
      'rivaroxaban', 'rivarospire', 'vascular',
      'ريفاروسباير', 'سيولة', 'شرايين'
    ],
    usage: 'عبوة ٣٠ قرص من ريفاروسباير ٢.٥ مجم. تستخدم لحماية الأوعية الدموية في مرضى القلب.',
    timing: 'كل ١٢ ساعة مع الأكل – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٢٫٥ مجم كل ١٢ ساعة مع الأكل (مزمن).';
    },

    warnings: [
      'الجرعة الزائدة تسبب نزيفاً يصعب إيقافه.'
    ]
  },
  // 13. Xarelto 15 mg 28 f.c. tab.
  {
    id: 'xarelto-15-28-tabs',
    name: 'Xarelto 15 mg 28 f.c. tab.',
    genericName: 'Rivaroxaban',
    concentration: '15mg',
    price: 1174,
    matchKeywords: [
      'rivaroxaban', 'xarelto', 'bayer', 'blood thinner', 'afib',
      'زاريلتو ١٥', 'ريفاروكسابان', 'سيولة', 'الماني', 'جلطة'
    ],
    usage: 'الدواء الأصلي (Brand) لعلاج الجلطات والوقاية من السكتات الدماغية. تركيز ١٥ مجم يستخدم كجرعة تحميل (أول ٣ أسابيع) أو كجرعة دائمة لمرضى الكلى.',
    timing: 'مرة أو مرتين يومياً مع الأكل – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'علاج الجلطة الحادة: ١ قرص ١٥ مجم مرتين يومياً لمدة ٢١ يوم مع الأكل. لمرضى القصور الكلوي (CrCl 15-49): ١ قرص ١٥ مجم مرة يومياً مع الأكل (مزمن).';
    },

    warnings: [
      'السعر مرتفع (١١٧٤ جنيه)، تأكد من قدرة المريض على الاستمرار عليه قبل كتابته.',
      'العلبة تحتوي على ٢٨ قرصاً (شريطين).'
    ]
  },

  // 14. Xarelto 15mg 14 f.c. tab.
  {
    id: 'xarelto-15-14-tabs',
    name: 'Xarelto 15mg 14 f.c. tab.',
    genericName: 'Rivaroxaban',
    concentration: '15mg',
    price: 589,
    matchKeywords: [
      'rivaroxaban', 'xarelto', 'small pack',
      'زاريلتو ١٤', 'عبوة صغيرة', 'نصف شهر'
    ],
    usage: 'عبوة صغيرة (١٤ قرص) من الزاريلتو ١٥ مجم. مناسبة لبدء العلاج أو للتجربة.',
    timing: 'مرة أو مرتين يومياً مع الأكل – حسب الحالة',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ١٥ مجم مرة يومياً مع الأكل لمرضى الكلى (مزمن)، أو مرتين يومياً مع الأكل لعلاج الجلطة الحاد (٢١ يوم).';
    },

    warnings: [
      'تكفي أسبوعاً واحداً فقط إذا كانت الجرعة (قرصين يومياً) في بداية علاج الجلطة.'
    ]
  },

  // 15. Andorivaban 20 mg 20 f.c. tabs.
  {
    id: 'andorivaban-20-20-tabs',
    name: 'Andorivaban 20 mg 20 f.c. tabs.',
    genericName: 'Rivaroxaban',
    concentration: '20mg',
    price: 260,
    matchKeywords: [
      'rivaroxaban', 'andorivaban', 'generic xarelto', 'dvt',
      'اندوريفابان', 'بديل زاريلتو', 'سيولة', 'جلطة'
    ],
    usage: 'بديل اقتصادي للزاريلتو ٢٠ مجم (الجرعة القياسية). سعر القرص (١٣ جنيه) ممتاز مقارنة بالمستورد (٤٢ جنيه).',
    timing: 'مرة يومياً مع العشاء – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٢٠ مجم مرة يومياً مع وجبة العشاء (مزمن).';
    },

    warnings: [
      'العبوة ٢٠ قرص فقط (لا تكفي شهراً كاملاً). يجب التنبيه على المريض بتجديد العلبة قبل انتهائها بـ ٥ أيام.'
    ]
  },

  // 16. Orgoroxaban 20 mg 30 f.c. tab
  {
    id: 'orgoroxaban-20-30-tabs',
    name: 'Orgoroxaban 20 mg 30 f.c. tab',
    genericName: 'Rivaroxaban',
    concentration: '20mg',
    price: 513,
    matchKeywords: [
      'rivaroxaban', 'orgoroxaban', 'monthly pack',
      'اورجوروكسابان', 'سيولة', 'عبوة شهرية'
    ],
    usage: 'ريفاروكسابان بتركيز ٢٠ مجم في عبوة شهرية كاملة (٣٠ قرص). خيار مريح للمريض المزمن.',
    timing: 'مرة يومياً مع الأكل – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٢٠ مجم مرة يومياً مع الطعام (مزمن).';
    },

    warnings: [
      'سعره (٥١٣ جنيه) متوسط بين المحلي الرخيص والمستورد الغالي.'
    ]
  },

  // 17. Rivarospire 15mg 42 f.c. tab.
  {
    id: 'rivarospire-15-42-tabs',
    name: 'Rivarospire 15mg 42 f.c. tab.',
    genericName: 'Rivaroxaban Micronized',
    concentration: '15mg',
    price: 534,
    matchKeywords: [
      'rivaroxaban', 'rivarospire', 'large pack', 'loading dose pack',
      'ريفاروسباير ١٥', 'عبوة كبيرة', 'كورس الجلطة'
    ],
    usage: 'عبوة ذكية جداً (٤٢ قرص). مصممة خصيصاً لتغطي فترة "علاج الجلطة الحادة" الأولى (٣ أسابيع × قرصين يومياً = ٤٢ قرص).',
    timing: 'كل ١٢ ساعة مع الأكل – ٢١ يوم',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ١٥ مجم كل ١٢ ساعة مع الأكل لمدة ٢١ يوم (علاج مكثف للـ DVT/PE).';
    },

    warnings: [
      'يجب تناول القرصين يومياً بانتظام شديد في هذه المرحلة الحرجة.'
    ]
  },

  // 18. Xarelto 15 mg 42 f.c. tab.
  {
    id: 'xarelto-15-42-tabs',
    name: 'Xarelto 15 mg 42 f.c. tab.',
    genericName: 'Rivaroxaban',
    concentration: '15mg',
    price: 1761,
    matchKeywords: [
      'rivaroxaban', 'xarelto 42', 'loading dose', 'original',
      'زاريلتو ٤٢', 'كورس مكثف', 'الماني'
    ],
    usage: 'عبوة الزاريلتو الكبيرة (٤٢ قرص) المخصصة لكورس الـ Loading Dose (٢١ يوم).',
    timing: 'كل ١٢ ساعة مع الأكل – ٢١ يوم',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ١٥ مجم كل ١٢ ساعة مع الأكل لمدة ٣ أسابيع.';
    },

    warnings: [
      'تناوله مع الأكل ضروري جداً.'
    ]
  },

  // 19. Orgoroxaban 15 mg 20 f.c.tabs.
  {
    id: 'orgoroxaban-15-20-tabs',
    name: 'Orgoroxaban 15 mg 20 f.c.tabs.',
    genericName: 'Rivaroxaban',
    concentration: '15mg',
    price: 342,
    matchKeywords: [
      'rivaroxaban', 'orgoroxaban', 'kidney dose',
      'اورجوروكسابان ١٥', 'سيولة', 'مرضى الكلى'
    ],
    usage: 'ريفاروكسابان ١٥ مجم لمرضى القصور الكلوي المزمن (كجرعة دائمة).',
    timing: 'مرة يومياً مع الأكل – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ١٥ مجم مرة يومياً مع الطعام (مزمن).';
    },

    warnings: [
      'ممنوع إذا كان الكرياتينين كليرانس أقل من ١٥.'
    ]
  },

  // 20. Strakopina 2.5 mg 30 f.c. tabs.
  {
    id: 'strakopina-2.5-30-tabs',
    name: 'Strakopina 2.5 mg 30 f.c. tabs.',
    genericName: 'Apixaban',
    concentration: '2.5mg',
    price: 444,
    matchKeywords: [
      'apixaban', 'strakopina', 'eliquis generic',
      'ستراكوبينا', 'ابيكسابان', 'بديل اليكويس'
    ],
    usage: 'بديل للإليكويس ٢.٥ مجم. يستخدم بجرعة مخفضة لكبار السن ومرضى الكلى.',
    timing: 'كل ١٢ ساعة مع الأكل – مزمن',
    category: Category.ANTICOAGULANT,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٢٫٥ مجم مرتين يومياً مع الأكل (مزمن).';
    },

    warnings: [
      'سعره (٤٤٤ جنيه) قريب من المستورد (٥٣٢ جنيه)، الفارق ليس كبيراً جداً.'
    ]
  },

  // 21. Apixatrack 2.5 mg 30 f.c. tabs.
  {
    id: 'apixatrack-2.5-30-tabs',
    name: 'Apixatrack 2.5 mg 30 f.c. tabs.',
    genericName: 'Apixaban',
    concentration: '2.5mg',
    price: 366,
    matchKeywords: [
      'apixaban', 'apixatrack', 'economy',
      'ابيكساتراك', 'ابيكسابان', 'سعر جيد'
    ],
    usage: 'بديل اقتصادي للأبيكسابان (إليكويس). سعر منافس (٣٦٦ جنيه) لعبوة ٣٠ قرص (تكفي ١٥ يوم).',
    timing: 'كل ١٢ ساعة مع الأكل – مزمن',
    category: Category.ANTICOAGULANT,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٢٫٥ مجم مرتين يومياً مع الأكل (مزمن).';
    },

    warnings: [
      'لا توقف الدواء فجأة.'
    ]
  },

  // 22. Apixatrack 5 mg 30 f.c. tabs
  {
    id: 'apixatrack-5-30-tabs',
    name: 'Apixatrack 5 mg 30 f.c. tabs',
    genericName: 'Apixaban',
    concentration: '5mg',
    price: 366,
    matchKeywords: [
      'apixaban', 'apixatrack 5', 'standard dose',
      'ابيكساتراك ٥', 'ابيكسابان', 'جرعة كاملة'
    ],
    usage: 'الجرعة القياسية (٥ مجم) لعلاج الجلطات والوقاية من السكتة في مرضى الـ AFib. نفس سعر تركيز ٢.٥ مجم.',
    timing: 'كل ١٢ ساعة مع الأكل – مزمن',
    category: Category.ANTICOAGULANT,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 60,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٥ مجم مرتين يومياً مع الأكل (مزمن).';
    },

    warnings: [
      'العبوة ٣٠ قرص تكفي أسبوعين فقط.'
    ]
  },

  // 23. Artixiban 5 mg 30 f.c. tabs.
  {
    id: 'artixiban-5-30-tabs',
    name: 'Artixiban 5 mg 30 f.c. tabs.',
    genericName: 'Apixaban',
    concentration: '5mg',
    price: 444,
    matchKeywords: [
      'apixaban', 'artixiban', 'anticoagulant',
      'ارتيكسيبان', 'ابيكسابان', 'سيولة'
    ],
    usage: 'بديل آخر للأبيكسابان بتركيز ٥ مجم. يوسع خيارات المريض حسب التوفر في الصيدلية.',
    timing: 'كل ١٢ ساعة مع الأكل – مزمن',
    category: Category.ANTICOAGULANT,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 60,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٥ مجم مرتين يومياً مع الأكل (مزمن).';
    },

    warnings: [
      'سعره (٤٤٤ جنيه) أعلى قليلاً من بعض البدائل المحلية الأخرى.'
    ]
  },

  // 24. Elimbosis 2.5 mg 10 f.c. tabs.
  {
    id: 'elimbosis-2.5-10-tabs',
    name: 'Elimbosis 2.5 mg 10 f.c. tabs.',
    genericName: 'Apixaban',
    concentration: '2.5mg',
    price: 82.75,
    matchKeywords: [
      'apixaban', 'elimbosis', 'small pack', 'cheap',
      'اليمبوسيس', 'عبوة صغيرة', 'رخيص', 'تجربة'
    ],
    usage: 'عبوة صغيرة جداً (١٠ أقراص = ٥ أيام علاج). ممتازة للمريض الذي يريد تجربة الدواء أو لا يملك ثمن العلبة الكاملة.',
    timing: 'كل ١٢ ساعة مع الأكل – ٥ أيام',
    category: Category.ANTICOAGULANT,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٢٫٥ مجم مرتين يومياً مع الأكل (العبوة تكفي ٥ أيام).';
    },

    warnings: [
      'تنتهي بسرعة (٥ أيام)، يجب شراء عبوة جديدة فوراً.'
    ]
  },

  // 25. Elimbosis 2.5 mg 30 f.c. tabs.
  {
    id: 'elimbosis-2.5-30-tabs',
    name: 'Elimbosis 2.5 mg 30 f.c. tabs.',
    genericName: 'Apixaban',
    concentration: '2.5mg',
    price: 248.25,
    matchKeywords: [
      'apixaban', 'elimbosis 30', 'best value',
      'اليمبوسيس ٣٠', 'أوفر سعر', 'اقتصادي'
    ],
    usage: 'أوفر بديل للإليكويس في القائمة (٢٤٨ جنيه لـ ٣٠ قرص). خيار مثالي للمرضى محدودي الدخل.',
    timing: 'كل ١٢ ساعة مع الأكل – مزمن',
    category: Category.ANTICOAGULANT,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٢٫٥ مجم مرتين يومياً مع الأكل (مزمن).';
    },

    warnings: [
      'تأكد من توافره في الصيدليات المحيطة.'
    ]
  },
  // 26. Elimbosis 5 mg 30 f.c. tabs.
  {
    id: 'elimbosis-5-30-tabs',
    name: 'Elimbosis 5 mg 30 f.c. tabs.',
    genericName: 'Apixaban',
    concentration: '5mg',
    price: 269.25,
    matchKeywords: [
      'apixaban', 'elimbosis 5', 'standard dose', 'economy',
      'اليمبوسيس ٥', 'ابيكسابان', 'جرعة كاملة', 'رخيص'
    ],
    usage: 'الجرعة القياسية (٥ مجم) من الأبيكسابان بسعر اقتصادي جداً (٢٦٩ جنيه). يستخدم لعلاج الجلطات الوريدية (DVT/PE) والوقاية من السكتة في مرضى الـ AFib.',
    timing: 'كل ١٢ ساعة مع الأكل – مزمن',
    category: Category.ANTICOAGULANT,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 60,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٥ مجم مرتين يومياً مع الأكل بانتظام (مزمن).';
    },

    warnings: [
      'الجرعة المنسية يجب أخذها فوراً، لكن لا تضاعف الجرعة التالية أبداً.'
    ]
  },

  // 27. Pixaspire 2.5 mg 30 f.c. tabs
  {
    id: 'pixaspire-2.5-30-tabs',
    name: 'Pixaspire 2.5 mg 30 f.c. tabs',
    genericName: 'Apixaban',
    concentration: '2.5mg',
    price: 269.25,
    matchKeywords: [
      'apixaban', 'pixaspire', 'kidney dose', 'elderly',
      'بيكساسباير', 'ابيكسابان', 'جرعة مخفضة', 'كبار السن'
    ],
    usage: 'أبيكسابان بجرعة مخفضة (٢.٥ مجم). مخصص لمرضى الكلى، كبار السن (فوق ٨٠ سنة)، أو ذوي الأوزان المنخفضة (أقل من ٦٠ كجم).',
    timing: 'كل ١٢ ساعة مع الأكل – مزمن',
    category: Category.ANTICOAGULANT,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٢٫٥ مجم مرتين يومياً مع الأكل (مزمن) – لمن تنطبق عليهم شروط تخفيض الجرعة (ABC Criteria).';
    },

    warnings: [
      'سعره (٢٦٩.٢٥) نفس سعر تركيز ٥ مجم، ودي نقطة مهمة للتوضيح للمريض.'
    ]
  },

  // 28. Pixaspire 5 mg 30 f.c. tabs.
  {
    id: 'pixaspire-5-30-tabs',
    name: 'Pixaspire 5 mg 30 f.c. tabs.',
    genericName: 'Apixaban',
    concentration: '5mg',
    price: 269.25,
    matchKeywords: [
      'apixaban', 'pixaspire 5', 'anticoagulant',
      'بيكساسباير ٥', 'ابيكسابان', 'سيولة'
    ],
    usage: 'بديل آخر للأبيكسابان بتركيز ٥ مجم، بنفس السعر الاقتصادي (٢٦٩.٢٥ جنيه). يوسع دائرة الاختيار حسب التوفر.',
    timing: 'كل ١٢ ساعة مع الأكل – مزمن',
    category: Category.ANTICOAGULANT,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 60,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٥ مجم مرتين يومياً مع الأكل (مزمن).';
    },

    warnings: [
      'وقف الدواء قبل الجراحة/خلع الأسنان: ريفاروكسابان ٢٤ ساعة؛ أبيكسابان ٢٤–٤٨ ساعة؛ إيدوكسابان ٢٤ ساعة. في الجراحات عالية الخطورة أو خلل كلوي قد يلزم ٤٨–٩٦ ساعة.'
    ]
  },

  // 29. Strakopina 2.5 mg 20 f.c. tabs.
  {
    id: 'strakopina-2.5-20-tabs',
    name: 'Strakopina 2.5 mg 20 f.c. tabs.',
    genericName: 'Apixaban',
    concentration: '2.5mg',
    price: 296,
    matchKeywords: [
      'apixaban', 'strakopina', 'small pack',
      'ستراكوبينا', 'عبوة صغيرة', 'ابيكسابان'
    ],
    usage: 'عبوة ٢٠ قرص (تكفي ١٠ أيام) من ستراكوبينا. سعرها (٢٩٦ جنيه) يعتبر مرتفعاً قليلاً مقارنة ببدائل الـ ٣٠ قرص الأخرى.',
    timing: 'كل ١٢ ساعة مع الأكل – مزمن',
    category: Category.ANTICOAGULANT,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٢٫٥ مجم مرتين يومياً مع الأكل (مزمن).';
    },

    warnings: [
      'العبوة صغيرة وتنتهي بسرعة.'
    ]
  },

  // 30. Strakopina 5 mg 30 f.c.tabs.
  {
    id: 'strakopina-5-30-tabs',
    name: 'Strakopina 5 mg 30 f.c.tabs.',
    genericName: 'Apixaban',
    concentration: '5mg',
    price: 444,
    matchKeywords: [
      'apixaban', 'strakopina 5', 'anticoagulant',
      'ستراكوبينا ٥', 'ابيكسابان', 'سيولة'
    ],
    usage: 'الجرعة القياسية من ستراكوبينا. السعر (٤٤٤ جنيه) يضعه في الفئة السعرية المتوسطة.',
    timing: 'كل ١٢ ساعة مع الأكل – مزمن',
    category: Category.ANTICOAGULANT,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 60,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٥ مجم مرتين يومياً مع الأكل (مزمن).';
    },

    warnings: [
      'ممنوع لمرضى الفشل الكبدي الشديد.'
    ]
  },

  // 31. Andorivaban 10 mg 20 tabs
  {
    id: 'andorivaban-10-20-tabs',
    name: 'Andorivaban 10 mg 20 tabs',
    genericName: 'Rivaroxaban',
    concentration: '10mg',
    price: 152,
    matchKeywords: [
      'rivaroxaban', 'andorivaban', 'prophylaxis', 'post-op',
      'اندوريفابان ١٠', 'وقاية', 'بعد العمليات', 'رخيص'
    ],
    usage: 'ريفاروكسابان بجرعة وقائية (١٠ مجم). يستخدم عادة لمدة أسبوعين إلى ٥ أسابيع بعد جراحات تغيير المفاصل (الركبة/الفخذ).',
    timing: 'مرة يومياً – ١٤–٣٥ يوم',
    category: Category.ANTIPLATELET,
    form: 'Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ١٠ مجم مرة يومياً لمدة ١٤–٣٥ يوم. يمكن أخذه مع أو بدون طعام.';
    },

    warnings: [
      'غير مخصص لعلاج الجلطة الرئوية أو الذبحة الأذينية (يحتاج تركيز ٢٠ مجم).'
    ]
  },

  // 32. Andorivaban 15 mg 20 tabs
  {
    id: 'andorivaban-15-20-tabs',
    name: 'Andorivaban 15 mg 20 tabs',
    genericName: 'Rivaroxaban',
    concentration: '15mg',
    price: 260,
    matchKeywords: [
      'rivaroxaban', 'andorivaban 15', 'kidney dose',
      'اندوريفابان ١٥', 'جرعة الكلى', 'سيولة'
    ],
    usage: 'تركيز ١٥ مجم يستخدم كجرعة دائمة لمرضى القصور الكلوي المتوسط، أو في بداية علاج الجلطة (Loading Phase).',
    timing: 'مرة أو مرتين يومياً مع الأكل – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ١٥ مجم مرة يومياً مع الطعام لمرضى الكلى (مزمن).';
    },

    warnings: [
      'تناوله على معدة فارغة يقلل فاعليته بشكل خطير.'
    ]
  },

  // 33. Rivaflowva 20mg 20 film coated tab
  {
    id: 'rivaflowva-20-20-tabs',
    name: 'Rivaflowva 20mg 20 film coated tab',
    genericName: 'Rivaroxaban',
    concentration: '20mg',
    price: 260,
    matchKeywords: [
      'rivaroxaban', 'rivaflowva 20', 'standard dose', 'afib',
      'ريفافلوفا ٢٠', 'سيولة', 'جلطة', 'ذبحة اذينية'
    ],
    usage: 'الجرعة العلاجية القياسية (٢٠ مجم) للوقاية من السكتة وعلاج الجلطات. بديل اقتصادي بنفس سعر الأندوريفابان.',
    timing: 'مرة يومياً مع العشاء – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٢٠ مجم مرة يومياً مع وجبة العشاء (مزمن).';
    },

    warnings: [
      'العبوة ٢٠ قرص، يجب تجديدها كل ٣ أسابيع تقريباً.'
    ]
  },

  // 34. Rivaflowva 10mg 20 film coated tab
  {
    id: 'rivaflowva-10-20-tabs',
    name: 'Rivaflowva 10mg 20 film coated tab',
    genericName: 'Rivaroxaban',
    concentration: '10mg',
    price: 210,
    matchKeywords: [
      'rivaroxaban', 'rivaflowva 10', 'prophylaxis',
      'ريفافلوفا ١٠', 'وقاية', 'عمليات'
    ],
    usage: 'ريفاروكسابان ١٠ مجم للوقاية بعد العمليات. سعره (٢١٠ جنيه) أغلى قليلاً من الأندوريفابان (١٥٢ جنيه).',
    timing: 'مرة يومياً – ١٤–٣٥ يوم',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ١٠ مجم مرة يومياً لمدة ١٤ يوم (ركبة) أو ٣٥ يوم (فخذ).';
    },

    warnings: [
      'المدة المعتادة للعلاج: ٣٥ يوماً بعد جراحة الفخذ، و١٤ يوماً بعد جراحة الركبة.'
    ]
  },

  // 35. Orgoroxaban 10 mg 20 f.c.tabs.
  {
    id: 'orgoroxaban-10-20-tabs',
    name: 'Orgoroxaban 10 mg 20 f.c.tabs.',
    genericName: 'Rivaroxaban',
    concentration: '10mg',
    price: 278,
    matchKeywords: [
      'rivaroxaban', 'orgoroxaban 10', 'prophylaxis',
      'اورجوروكسابان ١٠', 'وقاية', 'سيولة'
    ],
    usage: 'خيار آخر للوقاية بجرعة ١٠ مجم. سعره (٢٧٨ جنيه) هو الأعلى في فئة الـ ١٠ مجم المحلية.',
    timing: 'مرة يومياً – ١٤–٣٥ يوم',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ١٠ مجم مرة يومياً لمدة ١٤–٣٥ يوم.';
    },

    warnings: [
      'السعر مرتفع نسبياً مقارنة بالمنافسين المحليين.'
    ]
  },
  // 36. Xarelto 20 mg 14 f.c. tab.
  {
    id: 'xarelto-20-14-tabs',
    name: 'Xarelto 20 mg 14 f.c. tab.',
    genericName: 'Rivaroxaban',
    concentration: '20mg',
    price: 589,
    matchKeywords: [
      'rivaroxaban', 'xarelto', 'original', 'half month',
      'زاريلتو ٢٠', 'نصف شهر', 'أصلي', 'سيولة'
    ],
    usage: 'نصف عبوة (١٤ قرص) من الزاريلتو الأصلي. خيار جيد للمريض الذي لا يستطيع دفع ثمن العلبة الكاملة (١١٧٤ جنيه) دفعة واحدة.',
    timing: 'مرة يومياً مع العشاء – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٢٠ مجم مرة يومياً مع وجبة العشاء (مزمن).';
    },

    warnings: [
      'تكفي أسبوعين فقط.'
    ]
  },

  // 37. Xanoxiban 20 mg 30 f.c. tabs.
  {
    id: 'xanoxiban-20-30-tabs',
    name: 'Xanoxiban 20 mg 30 f.c. tabs.',
    genericName: 'Rivaroxaban',
    concentration: '20mg',
    price: 513,
    matchKeywords: [
      'rivaroxaban', 'xanoxiban', 'monthly pack',
      'زانوكسيبان', 'بديل زاريلتو', 'سيولة'
    ],
    usage: 'بديل محلي للزاريلتو ٢٠ مجم في عبوة شهرية كاملة (٣٠ قرص). سعره (٥١٣ جنيه) يعتبر في الفئة المتوسطة العليا.',
    timing: 'مرة يومياً مع الأكل – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٢٠ مجم مرة يومياً مع الطعام (مزمن).';
    },

    warnings: [
      'ممنوع لمرضى الفشل الكلوي المتقدم.'
    ]
  },

  // 38. Xarelto 20 mg 28 f.c. tab.
  {
    id: 'xarelto-20-28-tabs',
    name: 'Xarelto 20 mg 28 f.c. tab.',
    genericName: 'Rivaroxaban',
    concentration: '20mg',
    price: 1174,
    matchKeywords: [
      'rivaroxaban', 'xarelto', 'original', 'bayer',
      'زاريلتو ٢٠', 'العلبة الكاملة', 'الماني'
    ],
    usage: 'العلبة القياسية للدواء الأصلي (٢٨ قرص). المعيار الذهبي في علاج الجلطات والوقاية من السكتات.',
    timing: 'مرة يومياً مع الأكل – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٢٠ مجم مرة يومياً مع أكبر وجبة في اليوم (مزمن).';
    },

    warnings: [
      'العلبة (٢٨ قرص) تنتهي قبل الشهر بيومين، يجب الانتباه للتجديد.'
    ]
  },

  // 39. Artixiban 2.5 mg 30 f.c. tablets
  {
    id: 'artixiban-2.5-30-tabs',
    name: 'Artixiban 2.5 mg 30 f.c. tablets',
    genericName: 'Apixaban',
    concentration: '2.5mg',
    price: 426,
    matchKeywords: [
      'apixaban', 'artixiban', 'low dose',
      'ارتيكسيبان', 'ابيكسابان', 'جرعة مخفضة'
    ],
    usage: 'أبيكسابان بجرعة مخفضة (٢.٥ مجم). سعره (٤٢٦ جنيه) يقترب من المستورد، مما يجعله خياراً لمن لا يجد الإليكويس.',
    timing: 'كل ١٢ ساعة مع الأكل – مزمن',
    category: Category.ANTICOAGULANT,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٢٫٥ مجم مرتين يومياً مع الأكل (مزمن).';
    },

    warnings: [
      'يجب الالتزام بالجرعة مرتين يومياً.'
    ]
  },

  // 40. Elimbosis 5 mg 10 f.c. tabs.
  {
    id: 'elimbosis-5-10-tabs',
    name: 'Elimbosis 5 mg 10 f.c. tabs.',
    genericName: 'Apixaban',
    concentration: '5mg',
    price: 89.75,
    matchKeywords: [
      'apixaban', 'elimbosis', 'emergency pack', 'cheap',
      'اليمبوسيس ٥', 'شريط واحد', 'رخيص', 'طوارئ'
    ],
    usage: 'أصغر عبوة أبيكسابان (١٠ أقراص = ٥ أيام). "طوق نجاة" للمريض الذي نفد علاجه ولا يملك ثمن العلبة الكبيرة.',
    timing: 'كل ١٢ ساعة مع الأكل – ٥ أيام',
    category: Category.ANTICOAGULANT,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 60,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٥ مجم مرتين يومياً مع الأكل (العبوة تكفي ٥ أيام).';
    },

    warnings: [
      'تنتهي خلال ٥ أيام فقط.'
    ]
  },

  // 41. Endlixaban 2.5 mg 20 f.c. tabs
  {
    id: 'endlixaban-2.5-20-tabs',
    name: 'Endlixaban 2.5 mg 20 f.c. tabs',
    genericName: 'Apixaban',
    concentration: '2.5mg',
    price: 166,
    matchKeywords: [
      'apixaban', 'endlixaban', 'small pack',
      'اندليكسابان', 'ابيكسابان', 'عبوة صغيرة'
    ],
    usage: 'عبوة ٢٠ قرص (١٠ أيام علاج). سعر اقتصادي (١٦٦ جنيه).',
    timing: 'كل ١٢ ساعة مع الأكل – مزمن',
    category: Category.ANTICOAGULANT,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٢٫٥ مجم مرتين يومياً مع الأكل (مزمن).';
    },

    warnings: [
      'تأكد من توافره بانتظام.'
    ]
  },

  // 42. Endlixaban 5 mg 30 f.c. tabs.
  {
    id: 'endlixaban-5-30-tabs',
    name: 'Endlixaban 5 mg 30 f.c. tabs.',
    genericName: 'Apixaban',
    concentration: '5mg',
    price: 268.5,
    matchKeywords: [
      'apixaban', 'endlixaban 30', 'monthly pack', 'economy',
      'اندليكسابان ٥', 'عبوة شهرية', 'رخيص'
    ],
    usage: 'أحد أرخص بدائل الأبيكسابان الشهرية (٢٦٨.٥ جنيه لـ ٣٠ قرص). منافس قوي للـ Elimbosis و Pixaspire.',
    timing: 'كل ١٢ ساعة مع الأكل – مزمن',
    category: Category.ANTICOAGULANT,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 60,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٥ مجم مرتين يومياً مع الأكل (مزمن).';
    },

    warnings: [
      'العبوة ٣٠ قرص (تكفي نصف شهر للجرعة القياسية).'
    ]
  },

  // 43. Strakopina 5 mg 20 f.c.tabs.
  {
    id: 'strakopina-5-20-tabs',
    name: 'Strakopina 5 mg 20 f.c.tabs.',
    genericName: 'Apixaban',
    concentration: '5mg',
    price: 296,
    matchKeywords: [
      'apixaban', 'strakopina', 'small pack',
      'ستراكوبينا', 'عبوة صغيرة'
    ],
    usage: 'عبوة ٢٠ قرص من ستراكوبينا. سعرها (٢٩٦ جنيه) يعتبر مرتفعاً مقارنة ببدائل الـ ٣٠ قرص.',
    timing: 'كل ١٢ ساعة مع الأكل – مزمن',
    category: Category.ANTICOAGULANT,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 60,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٥ مجم مرتين يومياً مع الأكل (مزمن).';
    },

    warnings: [
      'تكفي ١٠ أيام فقط.'
    ]
  },

  // 44. Endlixaban 2.5 mg 30 f.c. tabs.
  {
    id: 'endlixaban-2.5-30-tabs',
    name: 'Endlixaban 2.5 mg 30 f.c. tabs.',
    genericName: 'Apixaban',
    concentration: '2.5mg',
    price: 249,
    matchKeywords: [
      'apixaban', 'endlixaban', 'kidney dose',
      'اندليكسابان', 'جرعة الكلى', 'رخيص'
    ],
    usage: 'عبوة ٣٠ قرص للجرعة المخفضة. سعرها (٢٤٩ جنيه) ممتاز جداً (أرخص من تركيز ٥ مجم).',
    timing: 'كل ١٢ ساعة مع الأكل – مزمن',
    category: Category.ANTICOAGULANT,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٢٫٥ مجم مرتين يومياً مع الأكل (مزمن).';
    },

    warnings: [
      'الجرعة المخفضة لا تحمي المرضى الأصحاء تماماً، تستخدم فقط للفئات المحددة.'
    ]
  },

  // 45. Andorivaban 2.5 mg 20 f.c. tabs
  {
    id: 'andorivaban-2.5-20-tabs',
    name: 'Andorivaban 2.5 mg 20 f.c. tabs',
    genericName: 'Rivaroxaban',
    concentration: '2.5mg',
    price: 64,
    matchKeywords: [
      'rivaroxaban', 'andorivaban', 'vascular', 'very cheap',
      'اندوريفابان', 'شرايين', 'رخيص جدا'
    ],
    usage: 'أرخص ريفاروكسابان في السوق (٦٤ جنيه). يستخدم لحماية الشرايين التاجية والطرفية (Vascular Protection).',
    timing: 'كل ١٢ ساعة مع الأكل – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٢٫٥ مجم مرتين يومياً مع الأكل (مزمن).';
    },

    warnings: [
      'يضاف للأسبرين غالباً، مما يزيد خطر النزيف.'
    ]
  },

  // 46. Xanoxiban 10 mg 10 f.c. tabs.
  {
    id: 'xanoxiban-10-10-tabs',
    name: 'Xanoxiban 10 mg 10 f.c. tabs.',
    genericName: 'Rivaroxaban',
    concentration: '10mg',
    price: 130,
    matchKeywords: [
      'rivaroxaban', 'xanoxiban', 'prophylaxis',
      'زانوكسيبان', 'وقاية', '١٠ اقراص'
    ],
    usage: 'عبوة صغيرة للوقاية بعد العمليات. السعر (١٣٠ جنيه) مقبول لـ ١٠ أقراص.',
    timing: 'مرة يومياً – ١٤–٣٥ يوم',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ١٠ مجم مرة يومياً لمدة ١٤–٣٥ يوم.';
    },

    warnings: [
      'يكفي ١٠ أيام فقط.'
    ]
  },

  // 47. Xanoxiban 15 mg 50 f.c. tabs.
  {
    id: 'xanoxiban-15-50-tabs',
    name: 'Xanoxiban 15 mg 50 f.c. tabs.',
    genericName: 'Rivaroxaban',
    concentration: '15mg',
    price: 855,
    matchKeywords: [
      'rivaroxaban', 'xanoxiban', 'large pack', 'bulk',
      'زانوكسيبان', 'عبوة كبيرة', 'توفير'
    ],
    usage: 'عبوة ضخمة (٥٠ قرص). مخصصة للمرضى المستقرين على جرعة ١٥ مجم (مرضى الكلى) أو لتغطية كورس الجلطة المكثف (٤٢ قرص) مع بقاء أقراص احتياطية.',
    timing: 'مرة أو مرتين يومياً مع الأكل – حسب الحالة',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ١٥ مجم مرة يومياً مع الأكل (صيانة – مزمن)، أو مرتين يومياً مع الأكل (تحميل – ٢١ يوم).';
    },

    warnings: [
      'تناوله مع الأكل إجباري.'
    ]
  },

  // 48. Xarelto 10mg 10 f.c. tab.
  {
    id: 'xarelto-10-10-tabs',
    name: 'Xarelto 10mg 10 f.c. tab.',
    genericName: 'Rivaroxaban',
    concentration: '10mg',
    price: 421,
    matchKeywords: [
      'rivaroxaban', 'xarelto 10', 'original', 'prophylaxis',
      'زاريلتو ١٠', 'أصلي', 'وقاية'
    ],
    usage: 'الدواء الأصلي للوقاية بعد جراحات العظام. سعر الشريط (٤٢١ جنيه) مرتفع جداً.',
    timing: 'مرة يومياً – ١٤–٣٥ يوم',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ١٠ مجم مرة يومياً لمدة ١٤–٣٥ يوم.';
    },

    warnings: [
      'البدائل المحلية تؤدي نفس الغرض بربع الثمن تقريباً.'
    ]
  },

  // 49. Orgoroxaban 2.5 mg 30 f.c.tabs.
  {
    id: 'orgoroxaban-2.5-30-tabs',
    name: 'Orgoroxaban 2.5 mg 30 f.c.tabs.',
    genericName: 'Rivaroxaban',
    concentration: '2.5mg',
    price: 132,
    matchKeywords: [
      'rivaroxaban', 'orgoroxaban', 'vascular',
      'اورجوروكسابان', 'سيولة', 'شرايين'
    ],
    usage: 'ريفاروكسابان ٢.٥ مجم لحماية القلب والشرايين.',
    timing: 'كل ١٢ ساعة مع الأكل – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٢٫٥ مجم مرتين يومياً مع الأكل (مزمن).';
    },

    warnings: [
      'خطر النزيف.'
    ]
  },

  // 50. Endlixaban 5 mg 20 f.c. tabs.
  {
    id: 'endlixaban-5-20-tabs',
    name: 'Endlixaban 5 mg 20 f.c. tabs.',
    genericName: 'Apixaban',
    concentration: '5mg',
    price: 179,
    matchKeywords: [
      'apixaban', 'endlixaban', 'small pack',
      'اندليكسابان', 'عبوة صغيرة'
    ],
    usage: 'عبوة ٢٠ قرص (١٠ أيام). سعرها (١٧٩ جنيه) جيد.',
    timing: 'كل ١٢ ساعة مع الأكل – مزمن',
    category: Category.ANTICOAGULANT,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 60,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٥ مجم مرتين يومياً مع الأكل (مزمن).';
    },

    warnings: [
      'تنتهي بسرعة.'
    ]
  }
];

