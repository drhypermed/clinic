
import { Medication, Category } from '../../../types';

export const ANTIPLATELETS_GROUP: Medication[] = [
  // 1. Brilique 90mg 56 f.c. tabs
  {
    id: 'brilique-90-56-tabs',
    name: 'Brilique 90mg 56 f.c. tabs',
    genericName: 'Ticagrelor',
    concentration: '90mg',
    price: 1064,
    matchKeywords: [
      'ticagrelor', 'brilique', 'stent', 'acs', 'antiplatelet', 'thrombosis', 'platelet inhibitor',
      'بريليك', 'تيكاجريلور', 'دعامة', 'جلطة القلب', 'سيولة', 'جلطة', 'مضاد صفائح', 'تجلط'
    ],
    usage: 'أحدث وأقوى مضاد للصفائح (P2Y12 inhibitor). يستخدم الزاميًا مع الأسبرين لمدة سنة بعد تركيب الدعامات الدوائية (DES) أو بعد جلطات القلب الحادة (ACS).',
    timing: 'كل ١٢ ساعة – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٩٠ مجم كل ١٢ ساعة (صباحاً ومساءً) – علاج مزمن.';
    },

    warnings: [
      'ضيق تنفس (Dyspnea) عرض شائع غالباً يختفي مع الوقت؛ طمئن المريض.',
      'ممنوع إيقافه دون إذن طبيب القلب (خطر انسداد الدعامة).',
      'خطر نزيف مرتفع: راقب علامات النزيف (لثة، أنف، بول، براز).',
      'تجنب الجمع مع NSAIDs (مضادات الالتهاب غير الستيرويدية) لزيادة خطر النزيف.',
      'لا توقفه قبل أي عملية جراحية دون استشارة طبيب القلب (إيقاف ٥ أيام قبل الجراحات الكبرى).'
    ]
  },

  // 2. Plavix 75 mg 28 f.c.tabs.
  {
    id: 'plavix-75-28-tabs',
    name: 'Plavix 75 mg 28 f.c.tabs.',
    genericName: 'Clopidogrel',
    concentration: '75mg',
    price: 311,
    matchKeywords: [
      'clopidogrel', 'plavix', 'stroke', 'stent', 'pad', 'antiplatelet', 'thrombosis',
      'بلافيكس', 'كلوبيدوجريل', 'جلطة المخ', 'قصور الشرايين', 'سيولة', 'جلطة', 'مضاد صفائح', 'تجلط'
    ],
    usage: 'الدواء "القياسي" (Gold Standard) للوقاية من الجلطات في مرضى القلب، المخ، والشرايين الطرفية.',
    timing: 'مرة يومياً – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٧٥ مجم مرة يومياً (علاج مزمن). جرعة تحميل: ٤ أقراص مرة واحدة في الذبحة الحادة.';
    },

    warnings: [
      'يتفاعل مع أوميبرازول ويقلل الفعالية؛ يُفضّل Pantoprazole لحماية المعدة.',
      'إيقاف الدواء قبل العمليات 5–7 أيام (لا توقفه دون استشارة الطبيب).',
      'خطر نزيف الجهاز الهضمي: راقب البراز الأسود أو القيء الدموي.',
      'تجنب الجمع مع NSAIDs لزيادة خطر النزيف.'
    ]
  },

  // 3. Myogrel 75mg 30 f.c. tab
  {
    id: 'myogrel-75-30-tabs',
    name: 'Myogrel 75mg 30 f.c. tab',
    genericName: 'Clopidogrel',
    concentration: '75mg',
    price: 120,
    matchKeywords: [
      'clopidogrel', 'myogrel', 'economy', 'generic plavix', 'antiplatelet', 'thrombosis',
      'مايوجريل', 'بديل بلافيكس', 'رخيص', 'سيولة', 'جلطة', 'مضاد صفائح', 'تجلط'
    ],
    usage: 'بديل محلي ممتاز للبلافيكس بسعر اقتصادي (١٢٠ جنيه). نفس المادة الفعالة والكفاءة.',
    timing: 'مرة يومياً – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٧٥ مجم مرة يومياً (علاج مزمن).';
    },

    warnings: [
      'نفس تحذيرات البلافيكس بخصوص التفاعل مع أدوية المعدة (PPIs).',
      'تجنب الجمع مع NSAIDs لزيادة خطر النزيف.',
      'لا توقفه قبل أي جراحة دون استشارة الطبيب.'
    ]
  },

  // 4. Myogrel plus 75/75mg 30 f.c. tab
  {
    id: 'myogrel-plus-30-tabs',
    name: 'Myogrel plus 75/75mg 30 f.c. tab',
    genericName: 'Clopidogrel + Acetylsalicylic Acid (Aspirin)',
    concentration: '75mg/75mg',
    price: 207,
    matchKeywords: [
      'clopidogrel', 'aspirin', 'dual antiplatelet', 'myogrel plus', 'DAPT', 'thrombosis',
      'مايوجريل بلس', 'اسبرين', 'سيولة مزدوجة', 'دعامة', 'جلطة', 'مضاد صفائح مزدوج', 'تجلط'
    ],
    usage: 'قرص مركب (Dual Therapy) يحتوي على كلوبيدوجريل وأسبرين معاً. يسهل الالتزام بالعلاج لمرضى الدعامات الذين يحتاجون للدواءين.',
    timing: 'مرة يومياً مع الأكل – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص مرة يومياً بعد الغداء (مع الأكل) – علاج مزمن.';
    },

    warnings: [
      'خطر النزيف أعلى من الأحادية. راقب علامات نزيف الجهاز الهضمي (براز أسود/قيء دموي).',
      'ممنوع تماماً لمرضى حساسية الأسبرين أو الربو الشعبي المرتبط بالأسبرين.',
      'تجنب الجمع مع NSAIDs لزيادة خطر النزيف بشكل كبير.',
      'لا توقفه قبل أي جراحة دون استشارة طبيب القلب.'
    ]
  },
  // 5. Borgavix 75mg 30 f.c. tablets
  {
    id: 'borgavix-75-30-tabs',
    name: 'Borgavix 75mg 30 f.c. tablets',
    genericName: 'Clopidogrel',
    concentration: '75mg',
    price: 66,
    matchKeywords: [
      'clopidogrel', 'borgavix', 'cheap', 'stent', 'antiplatelet', 'thrombosis',
      'بورجافيكس', 'كلوبيدوجريل', 'بديل بلافيكس', 'رخيص', 'سيولة', 'جلطة', 'مضاد صفائح', 'تجلط'
    ],
    usage: 'أرخص بديل محلي للكلوبيدوجريل (٦٦ جنيه). يستخدم للوقاية من الجلطات بعد تركيب الدعامات أو لمرضى قصور الشرايين.',
    timing: 'مرة يومياً – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٧٥ مجم مرة يومياً (علاج مزمن).';
    },

    warnings: [
      'تأكد من عدم وجود قرحة معدة نشطة.',
      'يتفاعل مع أوميبرازول؛ يُفضّل Pantoprazole لحماية المعدة.',
      'تجنب الجمع مع NSAIDs. لا توقفه قبل الجراحة دون استشارة الطبيب.'
    ]
  },

  // 6. Clopex grel 75mg 30 f.c.tab
  {
    id: 'clopex-grel-75-30-tabs',
    name: 'Clopex grel 75mg 30 f.c.tab',
    genericName: 'Clopidogrel',
    concentration: '75mg',
    price: 150,
    matchKeywords: [
      'clopidogrel', 'clopex grel', 'antiplatelet', 'thrombosis', 'stent',
      'كلوبكس جريل', 'سيولة', 'دعامة', 'جلطة', 'مضاد صفائح', 'تجلط'
    ],
    usage: 'بديل آخر للكلوبيدوجريل بسعر متوسط (١٥٠ جنيه). يستخدم في بروتوكولات علاج متلازمة الشريان التاجي الحادة.',
    timing: 'مرة يومياً – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٧٥ مجم مرة يومياً في نفس الموعد (علاج مزمن).';
    },

    warnings: [
      'وقف الدواء قبل خلع الأسنان بـ ٥ أيام على الأقل (لا توقفه دون استشارة الطبيب).',
      'يتفاعل مع أوميبرازول؛ يُفضّل Pantoprazole. تجنب الجمع مع NSAIDs.'
    ]
  },

  // 7. Brilique 60mg 56 f.c. tabs.
  {
    id: 'brilique-60-56-tabs',
    name: 'Brilique 60mg 56 f.c. tabs.',
    genericName: 'Ticagrelor',
    concentration: '60mg',
    price: 888,
    matchKeywords: [
      'ticagrelor', 'brilique 60', 'extended therapy', 'post mi', 'antiplatelet', 'thrombosis',
      'بريليك ٦٠', 'تيكاجريلور', 'بعد سنة', 'وقاية ممتدة', 'جلطة', 'مضاد صفائح', 'تجلط'
    ],
    usage: 'تركيز مخفف (٦٠ مجم) يستخدم كـ "علاج ممتد" (Extended Therapy) للمرضى الذين مر عليهم أكثر من سنة على الجلطة القلبية (MI) وما زالوا في خطر عالي.',
    timing: 'كل ١٢ ساعة – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٦٠ مجم كل ١٢ ساعة (صباحاً ومساءً) – علاج مزمن ممتد.';
    },

    warnings: [
      'لا يستخدم كبداية علاج في الجلطات الحادة (يستخدم الـ ٩٠ مجم).',
      'قد يسبب ضيق تنفس بسيط.',
      'تجنب الجمع مع NSAIDs. لا توقفه دون استشارة طبيب القلب.'
    ]
  },

  // 8. Clatex 75mg 30 f.c.tab.
  {
    id: 'clatex-75-30-tabs',
    name: 'Clatex 75mg 30 f.c.tab.',
    genericName: 'Clopidogrel',
    concentration: '75mg',
    price: 117,
    matchKeywords: [
      'clopidogrel', 'clatex', 'ischemia', 'stroke', 'antiplatelet', 'thrombosis',
      'كلاتكس', 'كلوبيدوجريل', 'جلطة', 'سيولة', 'مضاد صفائح', 'تجلط'
    ],
    usage: 'كلوبيدوجريل بتركيز ٧٥ مجم. خيار اقتصادي جيد (١١٧ جنيه) للوقاية الثانوية من الجلطات.',
    timing: 'مرة يومياً – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٧٥ مجم مرة يومياً (علاج مزمن).';
    },

    warnings: [
      'تجنب تناول عصير الجريب فروت بكثرة لأنه قد يؤثر على عمل الإنزيمات المحولة للدواء.',
      'يتفاعل مع أوميبرازول؛ يُفضّل Pantoprazole. تجنب الجمع مع NSAIDs.'
    ]
  },

  // 9. Pletaal 100mg 20 tab.
  {
    id: 'pletaal-100-20-tabs',
    name: 'Pletaal 100mg 20 tab.',
    genericName: 'Cilostazol',
    concentration: '100mg',
    price: 160,
    matchKeywords: [
      'cilostazol', 'pletaal', 'intermittent claudication', 'leg pain', 'vasodilator', 'peripheral artery disease', 'antiplatelet',
      'بليتال ١٠٠', 'سيلوستازول', 'العرج المتقطع', 'الم المشي', 'قصور الشرايين الطرفية', 'مضاد صفائح', 'موسع شرايين'
    ],
    usage: 'دواء مميز يعمل كمضاد للصفائح وموسع للشرايين الطرفية. هو العلاج الأساسي لـ "العرج المتقطع" (ألم الساق عند المشي) لزيادة مسافة المشي.',
    timing: 'كل ١٢ ساعة قبل الأكل – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ١٠٠ مجم كل ١٢ ساعة على معدة فارغة (قبل الأكل بـ ٣٠ دقيقة أو بعده بساعتين) – علاج مزمن.';
    },

    warnings: [
      'ممنوع تماماً لمرضى فشل عضلة القلب (Heart Failure) بكل درجاته.',
      'الصداع والخفقان (زيادة ضربات القلب) أعراض شائعة جداً في أول أسبوع، ويمكن تقليلها بالبدء بجرعة ٥٠ مجم.',
      'قد يسبب ليونة في الإخراج (Diarrhea).'
    ]
  },

  // 10. Pletaal 50mg 20 tab.
  {
    id: 'pletaal-50-20-tabs',
    name: 'Pletaal 50mg 20 tab.',
    genericName: 'Cilostazol',
    concentration: '50mg',
    price: 122,
    matchKeywords: [
      'cilostazol', 'pletaal 50', 'titration', 'peripheral artery disease',
      'بليتال ٥٠', 'سيلوستازول', 'جرعة تدريجية'
    ],
    usage: 'تركيز مخفف (٥٠ مجم). يستخدم كبداية للعلاج (Titration) لتجنب الصداع، أو للمرضى الذين يتناولون أدوية تتفاعل معه (مثل ديلتيازيم أو إريثروميسين).',
    timing: 'كل ١٢ ساعة قبل الأكل – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٥٠ مجم كل ١٢ ساعة على معدة فارغة – علاج مزمن.';
    },

    warnings: [
      'يمنع في حالات هبوط القلب الاحتقاني.',
      'يستغرق من ٢ إلى ٤ أسابيع لظهور تحسن في مسافة المشي، ومن ١٢ أسبوعاً لأقصى مفعول (لا تحكم عليه بالفشل سريعاً).'
    ]
  },

  // 11. Stroka 75mg 30 f.c. tab
  {
    id: 'stroka-75-30-tabs',
    name: 'Stroka 75mg 30 f.c. tab',
    genericName: 'Clopidogrel',
    concentration: '75mg',
    price: 145,
    matchKeywords: [
      'clopidogrel', 'stroka', 'generic plavix', 'antiplatelet', 'thrombosis',
      'ستروكا', 'كلوبيدوجريل', 'سيولة', 'جلطة', 'مضاد صفائح', 'تجلط'
    ],
    usage: 'منتج كلوبيدوجريل محلي بجودة عالية. يستخدم للوقاية من تكرار الجلطات الدماغية والقلبية.',
    timing: 'مرة يومياً – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٧٥ مجم مرة يومياً (علاج مزمن).';
    },

    warnings: [
      'أعد التقييم عند نزيف غير معتاد (مثل نزيف الأنف المتكرر).',
      'يتفاعل مع أوميبرازول؛ يُفضّل Pantoprazole. تجنب الجمع مع NSAIDs.'
    ]
  },
  // 12. Cilosort 100 mg 30 tab.
  {
    id: 'cilosort-100-30-tabs',
    name: 'Cilosort 100 mg 30 tab.',
    genericName: 'Cilostazol',
    concentration: '100mg',
    price: 93,
    matchKeywords: [
      'cilostazol', 'cilosort', 'claudication', 'leg pain',
      'سيلوسورت', 'سيلوستازول', 'العرج المتقطع', 'الم الساق'
    ],
    usage: 'بديل اقتصادي ممتاز (٩٣ جنيه) للسيلوستازول. يستخدم لتحسين مسافة المشي لمرضى قصور الشرايين الطرفية (العرج المتقطع).',
    timing: 'كل ١٢ ساعة قبل الأكل – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ١٠٠ مجم قبل الإفطار والعشاء بـ ٣٠ دقيقة (مرتين يومياً على معدة فارغة) – علاج مزمن.';
    },

    warnings: [
      'ممنوع لمرضى ضعف عضلة القلب (Heart Failure).',
      'قد يسبب إسهالاً بسيطاً في بداية العلاج.'
    ]
  },

  // 13. Plavicard 75mg 30 f.c. tab
  {
    id: 'plavicard-75-30-tabs',
    name: 'Plavicard 75mg 30 f.c. tab',
    genericName: 'Clopidogrel',
    concentration: '75mg',
    price: 117,
    matchKeywords: [
      'clopidogrel', 'plavicard', 'stent', 'heart attack', 'antiplatelet', 'thrombosis',
      'بلافيكارد', 'كلوبيدوجريل', 'دعامة', 'جلطة', 'سيولة', 'مضاد صفائح', 'تجلط'
    ],
    usage: 'كلوبيدوجريل بجودة عالية وسعر متوسط (١١٧ جنيه). أساسي لمرضى الدعامات والذبحات.',
    timing: 'مرة يومياً – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٧٥ مجم مرة يومياً في نفس الموعد (علاج مزمن).';
    },

    warnings: [
      'يتعارض مع بعض أدوية المعدة (Omeprazole)، استبدله بـ (Pantoprazole).',
      'تجنب الجمع مع NSAIDs. لا توقفه قبل الجراحة دون استشارة.'
    ]
  },

  // 14. Plavictonal 75mg 20 f.c. tab.
  {
    id: 'plavictonal-75-20-tabs',
    name: 'Plavictonal 75mg 20 f.c. tab.',
    genericName: 'Clopidogrel',
    concentration: '75mg',
    price: 78,
    matchKeywords: [
      'clopidogrel', 'plavictonal', 'economy', 'small pack', 'antiplatelet', 'thrombosis',
      'بلافيكتونال', 'كلوبيدوجريل', 'رخيص', 'عبوة صغيرة', 'سيولة', 'جلطة', 'مضاد صفائح', 'تجلط'
    ],
    usage: 'عبوة ٢٠ قرص بسعر اقتصادي (٧٨ جنيه). مناسبة جداً للمتابعة الشهرية للمرضى محدودي الدخل.',
    timing: 'مرة يومياً – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٧٥ مجم مرة يومياً (علاج مزمن).';
    },

    warnings: [
      'العبوة تكفي ٢٠ يوماً فقط.',
      'يتفاعل مع أوميبرازول؛ يُفضّل Pantoprazole. تجنب الجمع مع NSAIDs.'
    ]
  },

  // 15. Clopacirc 75 mg 30 f.c.tabs.
  {
    id: 'clopacirc-75-30-tabs',
    name: 'Clopacirc 75 mg 30 f.c.tabs.',
    genericName: 'Clopidogrel',
    concentration: '75mg',
    price: 117,
    matchKeywords: [
      'clopidogrel', 'clopacirc', 'antiplatelet', 'thrombosis',
      'كلوباسيرك', 'كلوبيدوجريل', 'سيولة', 'جلطة', 'مضاد صفائح', 'تجلط'
    ],
    usage: 'منتج آخر للكلوبيدوجريل بنفس السعر التنافسي (١١٧ جنيه). يوسع خيارات المريض حسب المتوفر.',
    timing: 'مرة يومياً – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٧٥ مجم مرة يومياً (علاج مزمن).';
    },

    warnings: [
      'راجع قبل إجراءات الأسنان (سيولة/إيقاف حسب التشخيص).',
      'يتفاعل مع أوميبرازول؛ يُفضّل Pantoprazole. تجنب الجمع مع NSAIDs.'
    ]
  },

  // 16. Westagrelor 90mg 10 f.c. tabs.
  {
    id: 'westagrelor-90-10-tabs',
    name: 'Westagrelor 90mg 10 f.c. tabs.',
    genericName: 'Ticagrelor',
    concentration: '90mg',
    price: 93.5,
    matchKeywords: [
      'ticagrelor', 'westagrelor', 'brilique generic', 'small pack', 'antiplatelet', 'thrombosis', 'acs',
      'ويستاجريلور', 'تيكاجريلور', 'بديل بريليك', 'شريط', 'جلطة', 'مضاد صفائح', 'تجلط'
    ],
    usage: 'بديل "تيكاجريلور" (بديل بريليك) في عبوة صغيرة (١٠ أقراص). ممتاز كـ "شريط طوارئ" أو للتجربة، بسعر ٩٣.٥ جنيه.',
    timing: 'كل ١٢ ساعة – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٩٠ مجم كل ١٢ ساعة (صباحاً ومساءً) – علاج مزمن.';
    },

    warnings: [
      'العبوة ١٠ أقراص تكفي ٥ أيام فقط! (لأن الجرعة قرصين يومياً). يجب شراء كمية كافية لضمان عدم الانقطاع.',
      'تجنب الجمع مع NSAIDs. لا توقفه دون استشارة طبيب القلب.'
    ]
  },

  // 17. Westgrelor 90mg 10 f.c.tabs.
  {
    id: 'westgrelor-90-10-tabs',
    name: 'Westgrelor 90mg 10 f.c.tabs.',
    genericName: 'Ticagrelor',
    concentration: '90mg',
    price: 100,
    matchKeywords: [
      'ticagrelor', 'westgrelor', 'brilique generic', 'antiplatelet', 'thrombosis', 'acs',
      'ويستجريلور', 'تيكاجريلور', 'بديل', 'جلطة', 'مضاد صفائح', 'تجلط'
    ],
    usage: 'يبدو كنسخة أخرى أو تشغيلة مختلفة من الـ Westagrelor بسعر ١٠٠ جنيه. نفس الاستخدام (ACS/Stents).',
    timing: 'كل ١٢ ساعة – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Film Coated Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٩٠ مجم كل ١٢ ساعة (علاج مزمن).';
    },

    warnings: [
      'ضيق التنفس عرض جانبي محتمل وغير مقلق غالباً.',
      'تجنب الجمع مع NSAIDs. لا توقفه دون استشارة طبيب القلب.'
    ]
  },

  // 18. Contrastroke 75mg 30 tabs.
  {
    id: 'contrastroke-75-30-tabs',
    name: 'Contrastroke 75mg 30 tabs.',
    genericName: 'Clopidogrel',
    concentration: '75mg',
    price: 145.5,
    matchKeywords: [
      'clopidogrel', 'contrastroke', 'stroke prevention', 'antiplatelet', 'thrombosis',
      'كونتراستروك', 'كلوبيدوجريل', 'وقاية السكتة', 'جلطة', 'مضاد صفائح', 'تجلط', 'سيولة'
    ],
    usage: 'كلوبيدوجريل بتركيز ٧٥ مجم. الاسم التجاري يوحى باستخدامه للوقاية من السكتات الدماغية (Contra-Stroke)، لكنه للقلب أيضاً.',
    timing: 'مرة يومياً – مزمن',
    category: Category.ANTIPLATELET,
    form: 'Tablet',

    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ قرص ٧٥ مجم مرة يومياً (علاج مزمن).';
    },

    warnings: [
      'يستخدم بحذر مع مسيلات الدم الأخرى.',
      'يتفاعل مع أوميبرازول؛ يُفضّل Pantoprazole. تجنب الجمع مع NSAIDs.',
      'لا توقفه قبل الجراحة دون استشارة الطبيب.'
    ]
  }
];

