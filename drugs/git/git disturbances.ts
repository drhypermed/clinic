import { Category, Medication } from '../../types';

/* ═══════════════════════════════════════════════════════════════════════════
   COMMON WARNINGS - تحذيرات ثابتة مشتركة
   ═══════════════════════════════════════════════════════════════════════════ */

const GRIPE_WATER_WARNINGS = [
    'ممنوع للرضع أقل من شهر.',
    'يحتوي بيكربونات صوديوم — حذر مع مرضى الكلى/اضطراب الأملاح.',
    'أوقفه وأعد التقييم عند: قيء متكرر/حرارة/خمول/رفض الرضاعة/دم بالبراز/انتفاخ شديد.',
    'حد أقصى ٦ جرعات/٢٤ ساعة. للاستخدام قصير المدى فقط.'
];

const DIGESTIVE_ENZYME_WARNINGS = [
    'يؤخذ مع الطعام أو بعده مباشرة.',
    'قد يسبب غثيان خفيف نادراً.',
    'يُمنع عند حساسية لإنزيمات البنكرياس أو الباباين.'
];

const PROBIOTIC_WARNINGS = [
    'يُحفظ في الثلاجة للحفاظ على البكتيريا النافعة.',
    'فاصل ساعتين عن المضادات الحيوية.',
    'قد يسبب غازات خفيفة في أول يومين.',
    'يُمنع لمرضى نقص المناعة الشديد.'
];

/* ═══════════════════════════════════════════════════════════════════════════
   DOSE CALCULATION HELPERS - دوال حساب الجرعات
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Gripe Water / Colic Water Dose
 * For infants and children - age-based dosing
 */
const gripeWaterDose = (_weight: number, ageMonths: number): string => {
    if (ageMonths < 1) return 'ممنوع لحديثي الولادة أقل من شهر.';
    if (ageMonths < 6) return `٥ مل عند اللزوم — حتى ٣ مرات يومياً.`;
    if (ageMonths < 12) return `١٠ مل عند اللزوم — حتى ٣ مرات يومياً.`;
    return `١٠ - ١٥ مل عند اللزوم — حتى ٣ مرات يومياً.`;
};

/**
 * Digestive Enzymes Capsule Dose
 * For adults 12+ years
 */
const digestiveEnzymeDose = (_weight: number, ageMonths: number): string => {
    if (ageMonths < 144) return 'للبالغين ١٢+ سنة فقط.';
    return `كبسولة واحدة مع الوجبة أو بعدها.\n(يمكن زيادتها لكبسولتين حسب الحاجة — حتى ٣ مرات يومياً)`;
};

/**
 * Probiotic Sachet Dose (Lacteol Fort, etc.)
 * Age-based dosing
 */
const probioticSachetDose = (_weight: number, ageMonths: number): string => {
    if (ageMonths < 6) return 'ممنوع للرضع أقل من ٦ أشهر.';
    if (ageMonths < 24) return `كيس واحد يومياً — يُذاب في ماء أو حليب.`;
    if (ageMonths < 144) return `كيس واحد مرة أو مرتين يومياً.`;
    return `كيس واحد إلى كيسين — ١-٢ مرة يومياً.`;
};

/* ═══════════════════════════════════════════════════════════════════════════
   TEXT SANITIZERS
   ═══════════════════════════════════════════════════════════════════════════ */

const normalizeSpaces = (s: string) =>
    s.replace(/\s+/g, ' ').replace(/\s+([،.])/g, '$1').trim();

const stripDoctorPhrases = (s: string) => {
    let t = s;
    t = t.replace(/تحت\s*إشراف\s*طبي/g, '');
    t = t.replace(/(?:إلا\s+)?بتوجيه\s+طبي/g, '');
    t = t.replace(/استشارة\s+طبيب[^.]*\./g, '.');
    t = t.replace(/يُفضّل\s+تجنبه\//g, 'يُتجنب/');
    t = t.replace(/حسب\s+(?:توجيه|تعليمات|إرشادات)\s+الطبيب/g, '');
    t = t.replace(/غير مخصص للبالغين\/الحمل والرضاعة إلا/g, 'للرضع والأطفال فقط —');
    return normalizeSpaces(t);
};

const sanitizeMedication = (m: Medication): Medication => ({
    ...m,
    timing: stripDoctorPhrases(m.timing),
    warnings: m.warnings.map(w => stripDoctorPhrases(w)).filter(w => w.length > 0),
    calculationRule: (w, a) => stripDoctorPhrases(m.calculationRule(w, a)),
});

const GIT_DISTURBANCES_MEDS_RAW: Medication[] = [

    // 1. Aqua Plus Syrup 100 ml
{
  id: 'aqua-plus-syrup-100',
  name: 'Aqua Plus Syrup 100 ml',
  genericName: 'Dill Oil + Fennel Oil + Sodium Bicarbonate', 
  concentration: 'Natural Blend',
  price: 45, 
  matchKeywords: [
    'colic', 'gases', 'flatulence', 'infant colic', 'gripe water', 'aqua plus', 'distension',
    'اكوا بلس', 'مغص الرضع', 'غازات', 'انتفاخ', 'ماء غريب', 'تقلصات معوية'
  ],
  usage: 'مستحضر/مكمل لطرد الغازات وتخفيف المغص البسيط المرتبط بالغازات عند الرضع والأطفال (لا يعالج أسباب المغص الخطرة).',
  timing: 'بعد الرضاعة/الأكل – عند الحاجة',
  category: Category.GIT_DISTURBANCE,
  form: 'Syrup',

  minAgeMonths: 1,
  maxAgeMonths: 120,
  minWeight: 3,
  maxWeight: 40,

  calculationRule: gripeWaterDose,

  warnings: GRIPE_WATER_WARNINGS
},

// 2. Digest eze 20 Capsules
{
  id: 'digest-eze-20-caps',
  name: 'Digest eze 20 Capsules',
  genericName: 'Pancreatin + Papain + Simethicone', 
  concentration: 'Enzyme Complex',
  price: 94, 
  matchKeywords: [
    'digestion', 'indigestion', 'enzymes', 'flatulence', 'dyspepsia', 'bloating', 'digest eze',
    'دايجست ايزي', 'عسر هضم', 'انزيمات هاضمة', 'غازات', 'انتفاخ', 'ثقل المعدة', 'بعد الاكل'
  ],
  usage: 'إنزيمات هاضمة + سيميثيكون لتخفيف عسر الهضم/الامتلاء والانتفاخ المرتبط بالغازات بعد الوجبات (علاج عرضي).',
  timing: 'حتى ٣ مرات يومياً مع/بعد الأكل – حتى ٧–١٤ يوم',
  category: Category.GIT_DISTURBANCE,
  form: 'Capsule',

  minAgeMonths: 144,
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: digestiveEnzymeDose,

  warnings: DIGESTIVE_ENZYME_WARNINGS
},

// 3. Gripe Water Smile Syrup 120 ml
{
  id: 'gripe-water-smile-120-syrup',
  name: 'Gripe Water Smile Syrup 120 ml',
  genericName: 'Sodium Bicarbonate + Dill Oil + Fennel Oil', 
  concentration: 'Natural Formula',
  price: 48,
  matchKeywords: [
    'gripe water', 'smile', 'colic', 'infant gases', 'flatulence', 'sodium bicarbonate',
    'جرايب ووتر', 'سمايل', 'ماء غريب', 'مغص الرضع', 'انتفاخ البيبهات', 'طارد للغازات'
  ],
  usage: 'مستحضر/مكمل لطرد الغازات وتخفيف المغص البسيط المرتبط بالغازات عند الرضع والأطفال.',
  timing: 'بعد الرضاعة/الأكل – عند الحاجة',
  category: Category.GIT_DISTURBANCE,
  form: 'Syrup',

  minAgeMonths: 1, 
  maxAgeMonths: 120,
  minWeight: 3,
  maxWeight: 40,

  calculationRule: gripeWaterDose,

  warnings: GRIPE_WATER_WARNINGS
},

// 4. Gripe water bambino syrup 120 ml
{
  id: 'gripe-water-bambino-120-syrup',
  name: 'Gripe water bambino syrup 120 ml',
  genericName: 'Dill Oil + Ginger Oil + Sodium Bicarbonate', 
  concentration: 'Natural Extracts',
  price: 75,
  matchKeywords: [
    'gripe water', 'bambino', 'colic', 'infant gases', 'flatulence', 'ginger oil',
    'بامبينو', 'جرايب ووتر', 'ماء غريب', 'مغص الرضع', 'انتفاخ', 'غازات', 'تقلصات'
  ],
  usage: 'مستحضر/مكمل لتخفيف المغص البسيط والانتفاخ المرتبط بالغازات عند الرضع والأطفال.',
  timing: 'بعد الرضاعة/الأكل – عند الحاجة',
  category: Category.GIT_DISTURBANCE,
  form: 'Syrup',

  minAgeMonths: 1, 
  maxAgeMonths: 120,
  minWeight: 3,
  maxWeight: 40,

  calculationRule: gripeWaterDose,

  warnings: GRIPE_WATER_WARNINGS
},

// 5. My sweet baby n syrup 125 ml
{
  id: 'my-sweet-baby-n-125-syrup',
  name: 'My sweet baby n syrup 125 ml',
  genericName: 'Dill Oil + Fennel Oil + Ginger Oil + Chamomile', 
  concentration: 'Natural Herbal Formula',
  price: 50,
  matchKeywords: [
    'my sweet baby', 'colic', 'gases', 'flatulence', 'infant', 'n-syrup', 'distension',
    'ماي سويت بيبي', 'مغص الرضع', 'غازات', 'انتفاخ', 'تقلصات', 'طارد للغازات', 'أعشاب للمغص'
  ],
  usage: 'مستحضر/مكمل عشبي لتخفيف المغص البسيط والانتفاخ المرتبط بالغازات عند الرضع والأطفال (لا يغني عن التقييم عند الأعراض الشديدة).',
  timing: 'بعد الرضاعة/الأكل – عند الحاجة',
  category: Category.GIT_DISTURBANCE,
  form: 'Syrup',

  minAgeMonths: 1, 
  maxAgeMonths: 120,
  minWeight: 3,
  maxWeight: 40,

  calculationRule: gripeWaterDose,

  warnings: GRIPE_WATER_WARNINGS
},

// 6. Nono Water Syrup 120 ml
{
  id: 'nono-water-120-syrup',
  name: 'Nono Water Syrup 120 ml',
  genericName: 'Dill Oil + Sodium Bicarbonate', 
  concentration: 'Natural Formula',
  price: 42,
  matchKeywords: [
    'nono water', 'colic', 'infant gases', 'flatulence', 'sodium bicarbonate', 'gripe water',
    'نونو ووتر', 'ماء نونو', 'مغص الرضع', 'انتفاخ', 'غازات', 'تقلصات معوية', 'ماء غريب'
  ],
  usage: 'مستحضر/مكمل لتخفيف المغص البسيط والانتفاخ المرتبط بالغازات عند الرضع والأطفال.',
  timing: 'بعد الرضاعة/الأكل – عند الحاجة',
  category: Category.GIT_DISTURBANCE,
  form: 'Syrup',

  minAgeMonths: 1, 
  maxAgeMonths: 120,
  minWeight: 3,
  maxWeight: 40,

  calculationRule: gripeWaterDose,

  warnings: GRIPE_WATER_WARNINGS
},

// 7. Gripe baby water syrup 120 ml
{
  id: 'gripe-baby-water-120-syrup',
  name: 'Gripe baby water syrup 120 ml',
  genericName: 'Dill Oil + Sodium Bicarbonate', 
  concentration: 'Standard Gripe Formula',
  price: 8,
  matchKeywords: [
    'gripe baby water', 'colic', 'infant', 'gas', 'flatulence', 'sodium bicarbonate',
    'جرايب بيبي ووتر', 'ماء غريب بيبي', 'مغص الرضع', 'انتفاخ', 'غازات', 'تقلصات'
  ],
  usage: 'مستحضر/مكمل لتخفيف المغص البسيط والانتفاخ المرتبط بالغازات عند الرضع والأطفال.',
  timing: 'بعد الرضاعة/الأكل – عند الحاجة',
  category: Category.GIT_DISTURBANCE,
  form: 'Syrup',

  minAgeMonths: 1, 
  maxAgeMonths: 120,
  minWeight: 3,
  maxWeight: 40,

  calculationRule: gripeWaterDose,

  warnings: GRIPE_WATER_WARNINGS
},

// 8. Kidzona S Syrup 120 ml
{
  id: 'kidzona-s-120-syrup',
  name: 'Kidzona S Syrup 120 ml',
  genericName: 'Chamomile + Fennel + Dill + Ginger Oils', 
  concentration: 'Natural Herbal Formula',
  price: 55,
  matchKeywords: [
    'kidzona s', 'digestive aid', 'colic', 'flatulence', 'bloating', 'herbal syrup',
    'كيدزونا اس', 'مغص', 'انتفاخ', 'عسر هضم للأطفال', 'طارد للغازات', 'مهدئ للمعدة'
  ],
  usage: 'مكمل عشبي لتخفيف المغص البسيط والانتفاخ المرتبط بالغازات عند الأطفال.',
  timing: 'بعد الأكل/الرضاعة – عند الحاجة',
  category: Category.GIT_DISTURBANCE,
  form: 'Syrup',

  minAgeMonths: 1, 
  maxAgeMonths: 144,
  minWeight: 3,
  maxWeight: 50,

  calculationRule: (_weight, ageMonths) => {
    if (ageMonths < 1) return 'ممنوع لحديثي الولادة أقل من شهر.';
    if (ageMonths < 6) return '٢٫٥ مل عند اللزوم — حتى ٣ مرات يومياً.';
    if (ageMonths < 12) return '٥ مل عند اللزوم — حتى ٣ مرات يومياً.';
    if (ageMonths < 36) return '٧٫٥ مل عند اللزوم — حتى ٣ مرات يومياً.';
    return '١٠ مل عند اللزوم — حتى ٣ مرات يومياً.';
  },

  warnings: GRIPE_WATER_WARNINGS
},

// 9. Calma King Syrup 120 ml
{
  id: 'calma-king-120-syrup',
  name: 'Calma King Syrup 120 ml',
  genericName: 'Chamomile + Fennel + Dill + Caraway + Sodium Bicarbonate', 
  concentration: 'Natural Herbal Formula',
  price: 60,
  matchKeywords: [
    'calma king', 'colic', 'infant gases', 'flatulence', 'herbal syrup', 'bloating',
    'كالما كينج', 'مغص الرضع', 'انتفاخ', 'غازات', 'تقلصات', 'طارد للغازات', 'أعشاب للأطفال'
  ],
  usage: 'مستحضر/مكمل لتخفيف المغص البسيط والانتفاخ المرتبط بالغازات عند الرضع والأطفال.',
  timing: 'بعد الرضاعة/الأكل – عند الحاجة',
  category: Category.GIT_DISTURBANCE,
  form: 'Syrup',

  minAgeMonths: 1, 
  maxAgeMonths: 120,
  minWeight: 3,
  maxWeight: 40,

  calculationRule: gripeWaterDose,

  warnings: GRIPE_WATER_WARNINGS
},

// 10. Bovix 10 Sachets
{
  id: 'bovix-10-sachets',
  name: 'Bovix 10 Sachets',
  genericName: 'Lactoferrin + Probiotics + Zinc', 
  concentration: 'Immune & Digestive Support Formula',
  price: 100,
  matchKeywords: [
    'bovix', 'lactoferrin', 'probiotics', 'zinc', 'diarrhea', 'immunity', 'sachets',
    'بوفيكس', 'أكياس بوفيكس', 'لاكتوفيرين', 'بكتيريا نافعة', 'إسهال', 'تقوية المناعة', 'نزلات معوية'
  ],
  usage: 'مكمل يحتوي على بروبيوتك + زنك وقد يساعد في تقليل مدة الإسهال البسيط/إسهال ما بعد المضادات الحيوية ودعم توازن الجهاز الهضمي (لا يغني عن محاليل الإماهة).',
  timing: 'مرة يومياً قبل الأكل/بين الوجبات – ٥–٧ أيام',
  category: Category.GIT_DISTURBANCE,
  form: 'Sachets',

  minAgeMonths: 6, 
  maxAgeMonths: 1200,
  minWeight: 7,
  maxWeight: 250,

  calculationRule: probioticSachetDose,

  warnings: PROBIOTIC_WARNINGS
},

// 11. Sansobaby water 50 ml
{
  id: 'sansobaby-water-50ml',
  name: 'Sansobaby water 50 ml',
  genericName: 'Sodium Bicarbonate + Dill Oil', 
  concentration: 'Standard Gripe Formula',
  price: 7.5,
  matchKeywords: [
    'sansobaby', 'gripe water', 'colic', 'infant gas', 'flatulence', 'sodium bicarbonate',
    'سانسو بيبي', 'ماء غريب', 'مغص الرضع', 'انتفاخ', 'غازات', 'تقلصات معوية'
  ],
  usage: 'مستحضر/مكمل لتخفيف المغص البسيط والانتفاخ المرتبط بالغازات عند الرضع والأطفال.',
  timing: 'بعد الرضاعة/الأكل – عند الحاجة',
  category: Category.GIT_DISTURBANCE,
  form: 'Syrup',

  minAgeMonths: 1, 
  maxAgeMonths: 120,
  minWeight: 3,
  maxWeight: 40,

  calculationRule: gripeWaterDose,

  warnings: GRIPE_WATER_WARNINGS
}
];

export const GIT_DISTURBANCES_MEDS: Medication[] = GIT_DISTURBANCES_MEDS_RAW.map(sanitizeMedication);
export default GIT_DISTURBANCES_MEDS;

