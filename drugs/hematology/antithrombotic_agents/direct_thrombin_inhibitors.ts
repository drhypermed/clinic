
import { Medication, Category } from '../../../types';

export const DIRECT_THROMBIN_INHIBITORS: Medication[] = [
  // 1. Extrauma DNA cream 25 gm
  {
    id: 'extrauma-dna-25-cream',
    name: 'Extrauma DNA cream 25 gm',
    genericName: 'Recombinant Hirudin',
    concentration: 'Standard',
    price: 28,
    matchKeywords: [
      'hirudin', 'extrauma', 'bruises', 'hematoma', 'varicose veins',
      'اكستروما', 'كدمات', 'تجمعات دموية', 'دوالي', 'تورم'
    ],
    usage: 'كريم موضعي قوي لإذابة التجمعات الدموية (الكدمات) تحت الجلد، وعلاج التهاب الأوردة السطحي والدوالي.',
    timing: 'دهان موضعي ٢–٣ مرات يومياً – حتى تحسن الكدمة',
    category: Category.DIRECT_THROMBIN_INHIBITOR,
    form: 'Cream',

    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'طبقة رقيقة على مكان الكدمة مع تدليك خفيف ٢–٣ مرات يومياً حتى تحسن الكدمة.';
    },

    warnings: [
      'ممنوع وضعه على الجروح المفتوحة أو الأغشية المخاطية (العين/الفم).',
      'لا يُستخدم في حالات النزيف النشط.'
    ]
  },

  // 2. Thrombexx DNA 1120 i.u/100gm topical gel 40 gm
  {
    id: 'thrombexx-gel-40',
    name: 'Thrombexx DNA 1120 i.u/100gm topical gel 40 gm',
    genericName: 'Recombinant Hirudin',
    concentration: '1120 IU/100gm',
    price: 77,
    matchKeywords: [
      'hirudin', 'thrombexx', 'gel', 'sports injury', 'bruises',
      'ثرومبكس جل', 'كدمات الملاعب', 'دوالي', 'جل سريع الامتصاص'
    ],
    usage: 'جل سريع الامتصاص لعلاج الكدمات والالتواءات (خاصة للرياضيين). الجل يمتص أسرع ولا يترك أثراً دهني.',
    timing: 'دهان ٢–٣ مرات يومياً – حتى تحسن الكدمة',
    category: Category.DIRECT_THROMBIN_INHIBITOR,
    form: 'Gel',

    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'شريط ٣-٥ سم من الجل دهان موضعي ٢-٣ مرات يومياً حتى تحسن الكدمة.';
    },

    warnings: [
      'تجنب تغطية المكان برباط ضاغط قوي جداً بعد الدهان مباشرة.',
      'غسل اليدين جيداً بعد الاستخدام.'
    ]
  },

  // 3. Thrombexx DNA 1120 i.u/100gm cream 40 gm
  {
    id: 'thrombexx-cream-40',
    name: 'Thrombexx DNA 1120 i.u/100gm cream 40 gm',
    genericName: 'Recombinant Hirudin',
    concentration: '1120 IU/100gm',
    price: 77,
    matchKeywords: [
      'hirudin', 'thrombexx', 'cream', 'massage', 'hematoma',
      'ثرومبكس كريم', 'تدليك', 'تجمع دموي', 'دوالي'
    ],
    usage: 'نفس المادة الفعالة (هيرودين) في قاعدة كريم. يفضل استخدامه إذا كان الجلد جافاً أو عند الحاجة لتدليك المنطقة المصابة (مثل الدوالي).',
    timing: 'دهان ٢–٣ مرات يومياً – حتى تحسن الحالة',
    category: Category.DIRECT_THROMBIN_INHIBITOR,
    form: 'Cream',

    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'دهان مع تدليك خفيف من أسفل لأعلى ٢–٣ مرات يومياً حتى تحسن الحالة.';
    },

    warnings: [
      'لا يوضع على التقرحات الجلدية (Ulcers) إلا حسب التشخيص (على الحواف فقط).'
    ]
  },

  // 4. Extrauma DNA cream 40 gm
  {
    id: 'extrauma-dna-40-cream',
    name: 'Extrauma DNA cream 40 gm',
    genericName: 'Recombinant Hirudin',
    concentration: 'Standard',
    price: 30.5,
    matchKeywords: [
      'hirudin', 'extrauma', 'large pack', 'economy',
      'اكستروما كبير', 'كدمات', 'توفير'
    ],
    usage: 'عبوة 40 جم من اكستروما (اقتصادية).',
    timing: 'دهان ٢–٣ مرات يومياً – عند اللزوم',
    category: Category.DIRECT_THROMBIN_INHIBITOR,
    form: 'Cream',

    minAgeMonths: 12,
    maxAgeMonths: 1200,
    minWeight: 5,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return 'دهان موضعي ٢–٣ مرات يومياً عند اللزوم حتى تحسن الكدمة.';
    },

    warnings: [
      'الحساسية من مادة الهيرودين نادرة جداً، لكن توقف عن استخدامه إذا ظهر احمرار شديد وحكة.'
    ]
  }
];

