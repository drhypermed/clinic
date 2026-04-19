
import { Medication, Category } from '../../../types';

const toAr = (n: number | string) => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
const fixed = (text: string) => (_w: number, _a: number) => text;

export const ANTI_PARKINSON_DRUGS: Medication[] = [
  // 1) cogintol 20 tab.
  {
    id: 'cogintol-2-20-tabs-ap',
    name: 'cogintol 20 tab.',
    genericName: 'benztropine',
    concentration: '2mg',
    price: 40,
    matchKeywords: [
      'cogintol', 'cogintol 20', 'cogentin', 'benztropine',
      'parkinson', 'parkinsonism', 'drug induced parkinsonism', 'eps', 'extrapyramidal',
      'tremor', 'rigidity', 'stiffness',
      'باركنسون', 'الشلل الرعاش', 'رعشة', 'تيبس', 'أعراض خارج هرمية', 'رعشة دوائية',
      '#parkinson\'s disease', '#antimuscarinic'
    ],
    usage: 'بنزتروبين لعلاج الباركنسونية/الرعشة الدوائية (أعراض خارج هرمية).',
    timing: 'مرتين يومياً – مزمن',
    category: Category.ANTI_PARKINSON,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('٠٫٥ مجم (قرص) — مرتين يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: ['قد يسبب جفاف الفم/إمساك/زغللة.', 'يُحذر في الجلوكوما ضيقة الزاوية واحتباس البول/تضخم البروستاتا.', 'قد يزيد الارتباك لدى كبار السن.']
  },

  // 2) parkintreat 1mg 30 tabs.
  {
    id: 'parkintreat-1-30-tabs-ap',
    name: 'parkintreat 1mg 30 tabs.',
    genericName: 'rasagiline',
    concentration: '1mg',
    price: 195,
    matchKeywords: [
      'parkintreat 1', 'rasagiline', 'azilect', 'mao-b inhibitor', 'maob', 'MAO B',
      'parkinson', 'bradykinesia', 'rigidity',
      'رازاجيلين', 'مثبط mao-b', 'باركنسون', 'بطء الحركة', 'تيبس',
      '#parkinson\'s disease', '#mao-b inhibitor'
    ],
    usage: 'رازاجيلين (مثبط MAO-B) لتحسين أعراض باركنسون (لوحده أو مع ليفودوبا).',
    timing: 'مرة يومياً – مزمن',
    category: Category.ANTI_PARKINSON,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('١ مجم (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: ['تداخلات دوائية مهمة (مضادات اكتئاب، ترامادول، ديكستروميثورفان).', 'قد يسبب صداع/دوخة.', 'يلزم حذر مع أمراض الكبد.']
  },

  // 3) sinemet 25/250 mg 20 tabs.
  {
    id: 'sinemet-25-250-20-tabs-ap',
    name: 'sinemet 25/250 mg 20 tabs.',
    genericName: 'levodopa & carbidopa',
    concentration: '25/250mg',
    price: 122,
    matchKeywords: [
      'sinemet 25/250 20', 'sinemet', 'levodopa carbidopa', 'carbidopa levodopa', 'ld cd',
      'parkinson', 'parkinson\'s disease', 'tremor', 'rigidity', 'bradykinesia', 'akinesia',
      'سينيميت', 'ليفودوبا', 'كاربيدوبا', 'باركنسون', 'بطء الحركة', 'تيبس', 'رعشة',
      '#parkinson\'s disease', '#dopamine agonist'
    ],
    usage: 'ليفودوبا + كاربيدوبا (العلاج الأساسي لتحسين الحركة وتقليل التيبس/الرعشة).',
    timing: 'كل ٦ ساعات – مزمن',
    category: Category.ANTI_PARKINSON,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('٢٥/٢٥٠ مجم (قرص) — كل ٦ ساعات — بدون اعتبار للأكل — مزمن.'),
    warnings: ['قد يسبب غثيان/دوخة/هبوط ضغط عند الوقوف.', 'قد يسبب حركات لا إرادية (Dyskinesia) مع الجرعات العالية.', 'الإيقاف المفاجئ خطر (تيبس شديد/حرارة).']
  },

  // 4) ramixole 0.25mg 30 tabs.
  {
    id: 'procykinol-5-100-tabs-ap',
    name: 'procykinol 5 mg 100 tabs.',
    genericName: 'procyclidine hydrochloride',
    concentration: '5mg',
    price: 86,
    matchKeywords: [
      'procykinol 5 100', 'procyclidine', 'kemadrin',
      'parkinsonism', 'drug induced parkinsonism', 'eps', 'extrapyramidal', 'tremor', 'rigidity',
      'بروسيكلدين', 'بروسيكينول', 'رعشة', 'تيبس', 'أعراض خارج هرمية',
      '#parkinson\'s disease'
    ],
    usage: 'بروسيكلدين لتقليل الرعشة/التيبس في الباركنسونية أو الأعراض الدوائية (EPS).',
    timing: 'كل ٨ ساعات – مزمن',
    category: Category.ANTI_PARKINSON,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('٢٫٥ مجم (قرص) — كل ٨ ساعات — بدون اعتبار للأكل — مزمن.'),
    warnings: ['جفاف فم/إمساك/زغللة.', 'يُحذر في الجلوكوما واحتباس البول.', 'قد يسبب دوخة/نعاس.']
  },

  // 6) procykinol 5 mg 50 tabs.
  {
    id: 'procykinol-5-50-tabs-ap',
    name: 'procykinol 5 mg 50 tabs.',
    genericName: 'procyclidine hydrochloride',
    concentration: '5mg',
    price: 58,
    matchKeywords: [
      'procykinol 5 50', 'procyclidine', 'kemadrin',
      'parkinsonism', 'eps', 'extrapyramidal', 'بروسيكينول ٥٠', 'أعراض خارج هرمية',
      '#parkinson\'s disease'
    ],
    usage: 'بروسيكلدين لتقليل الرعشة/التيبس (عبوة ٥٠ قرص).',
    timing: 'كل ٨ ساعات – مزمن',
    category: Category.ANTI_PARKINSON,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('٥ مجم (قرص) — كل ٨ ساعات — بدون اعتبار للأكل — مزمن.'),
    warnings: ['جفاف فم/إمساك/زغللة.', 'يُحذر في الجلوكوما واحتباس البول.']
  },

  // 7) achtenon 2 mg 30 tabs.
  {
    id: 'achtenon-2-30-tabs-ap',
    name: 'achtenon 2 mg 30 tabs.',
    genericName: 'biperiden',
    concentration: '2mg',
    price: 51,
    matchKeywords: [
      'achtenon 2 30', 'achtenon', 'biperiden', 'akineton',
      'parkinson', 'parkinsonism', 'eps', 'extrapyramidal', 'drug induced tremor',
      'اكتينون', 'بيبريدين', 'اكنيتون', 'أعراض خارج هرمية', 'رعشة', 'تيبس',
      '#antiparkinson agents', '#muscarinic antagonists'
    ],
    usage: 'بيبريدين (مضاد مسكاريني) لعلاج الرعشة/التيبس وأعراض EPS.',
    timing: 'كل ٨ ساعات – مزمن',
    category: Category.ANTI_PARKINSON,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('٢ مجم (قرص) — كل ٨ ساعات — بدون اعتبار للأكل — مزمن.'),
    warnings: ['جفاف فم/زغللة/إمساك.', 'يُحذر في الجلوكوما واحتباس البول.', 'قد يسبب دوخة/نعاس.']
  },

  // 8) biperiden 2mg 30 tab.
  {
    id: 'biperiden-2-30-tabs-ap',
    name: 'biperiden 2mg 30 tab.',
    genericName: 'biperiden',
    concentration: '2mg',
    price: 51,
    matchKeywords: [
      'biperiden 2 30', 'biperiden', 'akineton', 'achtenon',
      'parkinsonism', 'eps', 'extrapyramidal', 'رعشة دوائية', 'أعراض خارج هرمية',
      'بيبريدين', 'باركنسون',
      '#antiparkinson agents', '#muscarinic antagonists'
    ],
    usage: 'بيبريدين لعلاج الرعشة/التيبس وأعراض EPS.',
    timing: 'كل ٨ ساعات – مزمن',
    category: Category.ANTI_PARKINSON,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('٢ مجم (قرص) — كل ٨ ساعات — بدون اعتبار للأكل — مزمن.'),
    warnings: ['جفاف فم/زغللة/إمساك.', 'يُحذر في الجلوكوما واحتباس البول.']
  },

  // 9) achtenon 2 mg 20 tabs.
  {
    id: 'achtenon-2-20-tabs-ap',
    name: 'achtenon 2 mg 20 tabs.',
    genericName: 'biperiden',
    concentration: '2mg',
    price: 51,
    matchKeywords: [
      'achtenon 2 20', 'achtenon', 'biperiden',
      'parkinsonism', 'eps', 'extrapyramidal', 'اكتينون ٢٠', 'بيبريدين',
      '#antiparkinson agents', '#muscarinic antagonists'
    ],
    usage: 'بيبريدين لعلاج الرعشة/التيبس وأعراض EPS (عبوة ٢٠ قرص).',
    timing: 'كل ٨ ساعات – مزمن',
    category: Category.ANTI_PARKINSON,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('٢ مجم (قرص) — كل ٨ ساعات — بدون اعتبار للأكل — مزمن.'),
    warnings: ['جفاف فم/زغللة/إمساك.', 'يُحذر في الجلوكوما واحتباس البول.']
  },

  // 10) futaparky 25/250 mg 30 tabs
  {
    id: 'futaparky-25-250-30-tabs-ap',
    name: 'futaparky 25/250 mg 30 tabs',
    genericName: 'carbidopa & levodopa',
    concentration: '25/250mg',
    price: 153,
    matchKeywords: [
      'futaparky 25/250 30', 'carbidopa levodopa', 'levodopa carbidopa',
      'parkinson', 'rigidity', 'bradykinesia', 'tremor',
      'فوتاباركي', 'ليفودوبا', 'كاربيدوبا', 'باركنسون', 'رعشة', 'تيبس',
      '#parkinson\'s disease', '#dopamine agonist'
    ],
    usage: 'كاربيدوبا + ليفودوبا لتحسين أعراض باركنسون.',
    timing: 'كل ٦ ساعات – مزمن',
    category: Category.ANTI_PARKINSON,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('25/250mg (قرص) — كل ٦ ساعات — بدون اعتبار للأكل — مزمن.'),
    warnings: ['غثيان/دوخة/هبوط ضغط عند الوقوف.', 'حركات لا إرادية مع الجرعات العالية.', 'الإيقاف المفاجئ خطر.']
  },

  // 11) ramixole 1 mg 30 tab.
  {
    id: 'parkicarlevo-250-25-30-tabs-ap',
    name: 'parkicarlevo 250/25 mg 30 tab.',
    genericName: 'levodopa & carbidopa',
    concentration: '250/25mg',
    price: 147,
    matchKeywords: [
      'parkicarlevo 250/25 30', 'carbidopa levodopa', 'levodopa carbidopa',
      'parkinson', 'tremor', 'rigidity', 'bradykinesia',
      'باركيكارليفو', 'ليفودوبا', 'كاربيدوبا', 'باركنسون', 'رعشة', 'تيبس',
      '#parkinson\'s disease', '#dopamine agonist'
    ],
    usage: 'ليفودوبا + كاربيدوبا لتحسين أعراض باركنسون.',
    timing: 'كل ٦ ساعات – مزمن',
    category: Category.ANTI_PARKINSON,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('٢٥/٢٥٠ مجم (قرص) — كل ٦ ساعات — بدون اعتبار للأكل — مزمن.'),
    warnings: ['غثيان/دوخة/هبوط ضغط عند الوقوف.', 'حركات لا إرادية مع الجرعات العالية.', 'الإيقاف المفاجئ خطر.']
  },

  // 13) akineton 2 mg 20 tabs.
  {
    id: 'akineton-2-20-tabs-ap',
    name: 'akineton 2 mg 20 tabs.',
    genericName: 'biperiden',
    concentration: '2mg',
    price: 11,
    matchKeywords: [
      'akineton 2 20', 'akineton', 'biperiden',
      'parkinsonism', 'eps', 'extrapyramidal',
      'اكنيتون', 'اكينيتون', 'بيبريدين', 'أعراض خارج هرمية',
      '#antiparkinson agents', '#muscarinic antagonists'
    ],
    usage: 'بيبريدين (أصل) لعلاج الرعشة/التيبس وأعراض EPS.',
    timing: 'كل ٨ ساعات – مزمن',
    category: Category.ANTI_PARKINSON,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('٢ مجم (قرص) — كل ٨ ساعات — بدون اعتبار للأكل — مزمن.'),
    warnings: ['قد يسبب دوخة/نعاس.', 'جفاف فم/زغللة/إمساك.', 'يُحذر في الجلوكوما واحتباس البول.']
  },

  // 14) levocar 250/25 mg 30 tab
  {
    id: 'levocar-250-25-30-tabs-ap',
    name: 'levocar 250/25 mg 30 tab',
    genericName: 'levodopa & carbidopa',
    concentration: '250/25mg',
    price: 129,
    matchKeywords: [
      'levocar 250/25 30', 'levocar', 'carbidopa levodopa',
      'parkinson', 'rigidity', 'bradykinesia', 'tremor',
      'ليفوكار', 'ليفودوبا', 'كاربيدوبا', 'باركنسون',
      '#parkinson\'s disease', '#dopamine agonist'
    ],
    usage: 'ليفودوبا + كاربيدوبا لتحسين أعراض باركنسون.',
    timing: 'كل ٦ ساعات – مزمن',
    category: Category.ANTI_PARKINSON,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('٢٥/٢٥٠ مجم (قرص) — كل ٦ ساعات — بدون اعتبار للأكل — مزمن.'),
    warnings: ['غثيان/دوخة/هبوط ضغط.', 'حركات لا إرادية مع الجرعات العالية.', 'الإيقاف المفاجئ خطر.']
  },

  // 15) shatoo 50/200mg 7 c.r. f.c. tabs.
  {
    id: 'shatoo-cr-50-200-7-tabs-ap',
    name: 'shatoo 50/200mg 7 c.r. f.c. tabs.',
    genericName: 'carbidopa & levodopa',
    concentration: '50/200mg',
    price: 52,
    matchKeywords: [
      'shatoo 50/200 7', 'shatoo cr', 'carbidopa levodopa cr', 'controlled release', 'sustained release',
      'parkinson', 'wearing off',
      'شاتو', 'ممتد المفعول', 'باركنسون',
      '#parkinson\'s disease', '#dopamine agonist'
    ],
    usage: 'كاربيدوبا + ليفودوبا ممتد/متحكم الإطلاق لتقليل تذبذب الأعراض (Wearing-off).',
    timing: 'مرتين يومياً – مزمن',
    category: Category.ANTI_PARKINSON,
    form: 'Sustained-release Film-coated Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('١٦٠٠ مجم (قرص) — مرتين يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: ['قد يسبب دوخة/هبوط ضغط.', 'قد يسبب حركات لا إرادية مع الجرعات العالية.', 'البروتين يقلل الامتصاص.']
  },

  // 16) sonismapex 25/250 mg 30 f.c. tabs.
  {
    id: 'sonismapex-25-250-30-tabs-ap',
    name: 'sonismapex 25/250 mg 30 f.c. tabs.',
    genericName: 'levodopa & carbidopa',
    concentration: '25/250mg',
    price: 129,
    matchKeywords: [
      'sonismapex 25/250 30', 'levodopa carbidopa', 'carbidopa levodopa',
      'parkinson', 'tremor', 'rigidity', 'bradykinesia',
      'سونيـسمابيكس', 'ليفودوبا', 'كاربيدوبا', 'باركنسون',
      '#parkinson\'s disease', '#dopamine agonist'
    ],
    usage: 'ليفودوبا + كاربيدوبا لتحسين أعراض باركنسون.',
    timing: 'كل ٦ ساعات – مزمن',
    category: Category.ANTI_PARKINSON,
    form: 'Film-coated Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('٢٥/٢٥٠ مجم (قرص) — كل ٦ ساعات — بدون اعتبار للأكل — مزمن.'),
    warnings: ['غثيان/دوخة/هبوط ضغط.', 'حركات لا إرادية مع الجرعات العالية.', 'الإيقاف المفاجئ خطر.']
  },

  // 17) levocar 100/25mg 10 tab
  {
    id: 'levocar-100-25-10-tabs-ap',
    name: 'levocar 100/25mg 10 tab',
    genericName: 'carbidopa & levodopa',
    concentration: '100/25mg',
    price: 18.75,
    matchKeywords: [
      'levocar 100/25 10', 'levocar', 'carbidopa levodopa 100/25',
      'parkinson', 'tremor', 'rigidity', 'bradykinesia',
      'ليفوكار ١٠', 'ليفودوبا', 'كاربيدوبا', 'باركنسون',
      '#parkinson\'s disease', '#dopamine agonist'
    ],
    usage: 'ليفودوبا + كاربيدوبا (جرعة أقل) لبدء العلاج أو ضبط الجرعة.',
    timing: 'كل ٨ ساعات – مزمن',
    category: Category.ANTI_PARKINSON,
    form: 'Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('١٠٠/٢٥ مجم (قرص) — كل ٨ ساعات — بدون اعتبار للأكل — مزمن.'),
    warnings: ['غثيان/دوخة/هبوط ضغط.', 'قد يسبب أحلام مزعجة/هلوسة عند بعض المرضى.']
  },

  // 18) carledopa plus 100/25/200mg 30 f.c. tabs
  {
    id: 'carledopa-plus-100-25-200-30-tabs-ap',
    name: 'carledopa plus 100/25/200mg 30 f.c. tabs',
    genericName: 'carbidopa & levodopa & entacapone',
    concentration: '100/25/200mg',
    price: 288,
    matchKeywords: [
      'carledopa plus 100/25/200 30', 'entacapone', 'stalevo generic',
      'carbidopa levodopa entacapone', 'wearing off', 'on off',
      'باركنسون', 'انتاكابون', 'ستاليفو', 'تقلبات الجرعة', 'وِيرنج أوف',
      '#parkinson\'s disease'
    ],
    usage: 'تركيبة ليفودوبا/كاربيدوبا/إنتاكابون لتقليل ظاهرة انتهاء المفعول (Wearing-off).',
    timing: 'مرة يومياً – مزمن',
    category: Category.ANTI_PARKINSON,
    form: 'Film-coated Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('100/25/200mg (قرص) — مرة يومياً — بدون اعتبار للأكل — مزمن.'),
    warnings: ['قد يسبب إسهال/مغص.', 'قد يزيد حركات لا إرادية مع زيادة تأثير ليفودوبا.', 'تداخلات دوائية: مثبطات MAO غير الانتقائية ممنوعة.']
  },

  // 19) karinoba 250/25 mg 20 oral disinteg. tabs.
  {
    id: 'karinoba-250-25-20-odt-ap',
    name: 'karinoba 250/25 mg 20 oral disinteg. tabs.',
    genericName: 'carbidopa & levodopa',
    concentration: '250/25mg',
    price: 110,
    matchKeywords: [
      'karinoba 250/25 20', 'orodispersible', 'odt', 'oral disintegrating',
      'carbidopa levodopa', 'levodopa carbidopa',
      'parkinson', 'difficulty swallowing',
      'كارينوبا', 'قرص يذوب بالفم', 'باركنسون', 'صعوبة بلع',
      '#parkinson\'s disease', '#dopamine agonist'
    ],
    usage: 'ليفودوبا + كاربيدوبا قرص متحلل بالفم (مناسب عند صعوبة البلع).',
    timing: 'كل ٦ ساعات – مزمن',
    category: Category.ANTI_PARKINSON,
    form: 'Orodispersible Tablet',
    minAgeMonths: 216,
    maxAgeMonths: 1200,
    minWeight: 45,
    maxWeight: 250,
    calculationRule: fixed('٢٥/٢٥٠ مجم (قرص) — كل ٦ ساعات — بدون اعتبار للأكل — مزمن.'),
    warnings: ['غثيان/دوخة/هبوط ضغط.', 'حركات لا إرادية مع الجرعات العالية.', 'الإيقاف المفاجئ خطر.']
  },
];

