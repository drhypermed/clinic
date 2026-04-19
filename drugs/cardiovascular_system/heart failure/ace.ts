import { Medication, Category } from '../../../types';

// Placeholder for ACE inhibitors tailored for heart failure.
export const HEART_FAILURE_ACE_MEDS: Medication[] = [
    // 1. Capoten 50 mg 10 tab.
{
  id: 'capoten-50-tabs',
  name: 'Capoten 50 mg 10 tab.',
  genericName: 'Captopril',
  concentration: '50mg',
  price: 24,
  matchKeywords: [
    'ace inhibitor', 'captopril', 'capoten', 'hypertension', 'heart failure', 'sublingual', 'renal protection', 'diabetic nephropathy',
    'كابوتن', 'كابتوبريل', 'ضغط عالي', 'تحت اللسان', 'طوارئ الضغط', 'هبوط القلب', 'فشل قلب', 'حماية الكلى', 'ضغط مرتفع'
  ],
  usage: 'علاج سريع المفعول لارتفاع ضغط الدم، فشل عضلة القلب، وحماية الكلى لمرضى السكري.',
  timing: '٢–٣ مرات يومياً – مزمن',
  category: Category.ACE_INHIBITORS,
  form: 'Scored Tablet',

  minAgeMonths: 1, // Captopril floor
  maxAgeMonths: 1200,
  minWeight: 10,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 144) { // Adults
      return '١ قرص ٥٠ مجم مرتين يومياً على معدة فارغة لمدة طويلة (مزمن)';
    } else {
      return 'للأطفال: يحسب بجرعة ٠.٣ إلى ٠.٥ مجم/كجم، ويحتاج لطحن القرص وإذابته بدقة شديدة.';
    }
  },

  warnings: [
    'ممنوع للحوامل (يسبب تشوهات كلوية للجنين).',
    'قد يسبب "كحة جافة" مستمرة (عرض جانبي مشهور للمجموعة).',
    'قد يسبب هبوطاً مفاجئاً في الضغط مع أول جرعة (First-dose hypotension)، يفضل أخذ أول جرعة قبل النوم.',
    'الطعام يقلل امتصاص الدواء بنسبة ٣٠-٤٠٪.',
    'قد يسبب ارتفاعاً في البوتاسيوم (Hyperkalemia)، تجنب مكملات البوتاسيوم وبدائل الملح.',
    'يجب متابعة وظائف الكلى والبوتاسيوم بانتظام.'
  ]
},

// 2. Capozide 50/25mg 30 tab.
{
  id: 'ezapril-10-20tabs',
  name: 'Ezapril 10mg 20 tablets',
  genericName: 'Enalapril Maleate',
  concentration: '10mg',
  price: 36,
  matchKeywords: [
    'ace inhibitor', 'enalapril', 'ezapril', 'renitec', 'heart failure', 'hypertension', 'renal protection',
    'ايزابريل', 'إينالابريل', 'ضغط', 'حماية الكلى', 'القلب', 'فشل قلب', 'ضغط عالي', 'ضغط مرتفع'
  ],
  usage: 'علاج فعال لضغط الدم وفشل القلب الاحتقاني. يتميز بمفعول أطول من الكابتوبريل.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ACE_INHIBITORS,
  form: 'Scored Tablet',

  minAgeMonths: 1, // Enalapril floor
  maxAgeMonths: 1200,
  minWeight: 10,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 144) {
      return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    } else {
      return 'للأطفال: جرعة دقيقة (٠.٠٨ مجم/كجم) مرة واحدة يومياً، تزاد حسب الحاجة بحد أقصى ٥ مجم.';
    }
  },

  warnings: [
    'ممنوع للحوامل.',
    'راقب حدوث تورم في الشفاه أو الوجه (حساسية نادرة لكن خطيرة).',
    'الكحة الجافة عرض جانبي شائع، إذا كانت مزعجة جداً أعد التقييم لتغيير الدواء.',
    'يجب متابعة وظائف الكلى والبوتاسيوم.'
  ]
},

// 4. Ezapril 10mg 30 tablets
{
  id: 'ezapril-10-30tabs',
  name: 'Ezapril 10mg 30 tablets',
  genericName: 'Enalapril Maleate',
  concentration: '10mg',
  price: 54,
  matchKeywords: [
    'ace inhibitor', 'enalapril', 'ezapril', 'pack',
    'ايزابريل', 'عبوة ٣٠', 'توفير'
  ],
  usage: 'علاج فعال لضغط الدم وفشل القلب (عبوة شهرية).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ACE_INHIBITORS,
  form: 'Scored Tablet',

  minAgeMonths: 1, // Enalapril floor
  maxAgeMonths: 1200,
  minWeight: 10,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'ممنوع للحوامل.',
    'تجنب استخدام بدائل الملح المحتوية على البوتاسيوم.'
  ]
},
// 5. Tritace 1.25mg 14 tab
{
  id: 'tritace-1.25-tabs',
  name: 'Tritace 1.25mg 14 tab',
  genericName: 'Ramipril',
  concentration: '1.25mg',
  price: 44,
  matchKeywords: [
    'ace inhibitor', 'ramipril', 'tritace', 'starting dose', 'heart failure', 'cardioprotection', 'post-mi',
    'تريتاس', 'راميبريل', 'ضغط', 'جرعة صغيرة', 'هبوط القلب', 'فشل قلب', 'ضغط عالي', 'ضغط مرتفع', 'حماية القلب'
  ],
  usage: 'أقل جرعة متاحة (Starting Dose)؛ تستخدم لبدء العلاج في المرضى الذين يعانون من هبوط حاد في القلب، أو كبار السن، أو مرضى الكلى لتجنب الهبوط المفاجئ.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ACE_INHIBITORS,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ١.٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'ممنوع للحوامل (يسبب تشوهات للجنين).',
    'يراقب ضغط الدم ووظائف الكلى بعد أسبوع من البدء.',
    'قد يسبب كحة جافة مستمرة.',
    'قد يسبب ارتفاعاً في البوتاسيوم - تجنب مكملات البوتاسيوم.'
  ]
},

// 6. Tritace 2.5mg 14 tab
{
  id: 'tritace-2.5-tabs',
  name: 'Tritace 2.5mg 14 tab',
  genericName: 'Ramipril',
  concentration: '2.5mg',
  price: 54,
  matchKeywords: [
    'ace inhibitor', 'ramipril', 'tritace', 'hypertension',
    'تريتاس ٢.٥', 'راميبريل', 'ضغط', 'حماية القلب'
  ],
  usage: 'الجرعة المعتادة لبدء علاج ضغط الدم المرتفع في الأشخاص العاديين، وللوقاية بعد الجلطات.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ACE_INHIBITORS,
  form: 'Scored Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٢.٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'ممنوع للحوامل (يسبب تشوهات للجنين).',
    'قد يسبب كحة جافة مستمرة.',
    'يجب متابعة وظائف الكلى والبوتاسيوم بانتظام.',
    'قد يسبب ارتفاعاً في البوتاسيوم.'
  ]
},

// 7. Tritace 5mg 14 tab
{
  id: 'tritace-5-tabs',
  name: 'Tritace 5mg 14 tab',
  genericName: 'Ramipril',
  concentration: '5mg',
  price: 76,
  matchKeywords: [
    'ace inhibitor', 'ramipril', 'tritace', 'maintenance',
    'تريتاس ٥', 'راميبريل', 'ضغط مرتفع', 'جرعة متوسطة'
  ],
  usage: 'جرعة الاستمرار (Maintenance Dose) لعلاج الضغط وحماية الكلى لدى مرضى السكري.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ACE_INHIBITORS,
  form: 'Scored Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'ممنوع للحوامل (يسبب تشوهات للجنين).',
    'تأكد من شرب سوائل كافية.',
    'قد يسبب كحة جافة مستمرة.',
    'قد يسبب ارتفاعاً في البوتاسيوم - تجنب مكملات البوتاسيوم.',
    'يجب متابعة وظائف الكلى والبوتاسيوم بانتظام.'
  ]
},

// 8. Zestril 10mg 10 tab
{
  id: 'zestril-10-tabs',
  name: 'Zestril 10mg 10 tab',
  genericName: 'Lisinopril',
  concentration: '10mg',
  price: 43,
  matchKeywords: [
    'ace inhibitor', 'lisinopril', 'zestril', 'hypertension',
    'زيستريل', 'ليسينوبريل', 'ضغط', 'كلى'
  ],
  usage: 'علاج فعال لضغط الدم المرتفع، ويتميز بأنه لا يحتاج لضبط الجرعة في مرضى الكبد (لأنه لا يمر بأيض الكبد).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ACE_INHIBITORS,
  form: 'Tablet',

  minAgeMonths: 1, // Lisinopril floor
  maxAgeMonths: 1200,
  minWeight: 20,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 144) {
      return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    } else {
      return 'للأطفال (٦ سنوات فأكثر): الجرعة تحسب بدقة (٠.٠٧ مجم/كجم) بجرعات معتمدة للعمر.';
    }
  },

  warnings: [
    'ممنوع للحوامل (يسبب تشوهات للجنين).',
    'يستخدم بحذر مع مدرات البول لتجنب الهبوط الحاد.',
    'قد يسبب كحة جافة مستمرة.',
    'قد يسبب ارتفاعاً في البوتاسيوم.',
    'راقب حدوث تورم في الشفاه أو الوجه (Angioedema).'
  ]
},

// 9. Captopril 25mg 20 tab
{
  id: 'captopril-25-tabs',
  name: 'Captopril 25mg 20 tab',
  genericName: 'Captopril',
  concentration: '25mg',
  price: 20,
  matchKeywords: [
    'ace inhibitor', 'captopril', 'generic', 'short acting',
    'كابتوبريل', 'نصر', 'عام', 'رخيص', 'طوارئ'
  ],
  usage: 'النسخة الجنيسة (Generic) من الكابوتن. يستخدم لعلاج الضغط وفشل القلب بجرعات مقسمة.',
  timing: '٢–٣ مرات يومياً – مزمن',
  category: Category.ACE_INHIBITORS,
  form: 'Scored Tablet',

  minAgeMonths: 1, // Captopril floor
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٢٥ مجم مرتين يومياً على معدة فارغة لمدة طويلة (مزمن)';
  },

  warnings: [
    'ممنوع للحوامل (يسبب تشوهات للجنين).',
    'أرخص بديل لكن يتطلب التزاماً صارماً بمواعيد الأكل ليعطي مفعولاً.',
    'قد يسبب كحة جافة مستمرة.',
    'قد يسبب ارتفاعاً في البوتاسيوم.',
    'يجب متابعة وظائف الكلى والبوتاسيوم.'
  ]
},

// 10. Ezapril 20mg 20 tab
{
  id: 'ezapril-20-20tabs',
  name: 'Ezapril 20mg 20 tablets',
  genericName: 'Enalapril Maleate',
  concentration: '20mg',
  price: 46,
  matchKeywords: [
    'ace inhibitor', 'enalapril', 'ezapril', 'high dose',
    'ايزابريل ٢٠', 'إينالابريل', 'ضغط عالي'
  ],
  usage: 'الجرعة القصوى المعتادة من الإينالابريل لعلاج الحالات المزمنة من ارتفاع ضغط الدم.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ACE_INHIBITORS,
  form: 'Scored Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٢٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'ممنوع للحوامل (يسبب تشوهات للجنين).',
    'راقب وظائف الكلى والبوتاسيوم.',
    'قد يسبب كحة جافة مستمرة.',
    'قد يسبب ارتفاعاً في البوتاسيوم.'
  ]
},

// 11. Ezapril 20mg 30 tab
{
  id: 'ezapril-20-30tabs',
  name: 'Ezapril 20mg 30 tablets',
  genericName: 'Enalapril Maleate',
  concentration: '20mg',
  price: 69,
  matchKeywords: ['ace inhibitor', 'ezapril', 'pack', 'ايزابريل', 'عبوة توفير'],
  usage: 'عبوة اقتصادية (٣٠ قرص) للجرعة ٢٠ مجم.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ACE_INHIBITORS,
  form: 'Scored Tablet',
  minAgeMonths: 216, maxAgeMonths: 1200, minWeight: 50, maxWeight: 250,
  calculationRule: (w, a) => '١ قرص ٢٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)',
  warnings: [
    'ممنوع للحوامل (يسبب تشوهات للجنين).',
    'قد يسبب كحة جافة.',
    'يجب متابعة وظائف الكلى والبوتاسيوم.'
  ]
},

// 12. Sinopril-co 12.5/20mg 30 tab
{
  id: 'sinopril-co-20-12.5',
  name: 'Sinopril-co 12.5/20mg 30 tab', // Usually labelled 20/12.5 in medical convention
  genericName: 'Lisinopril + Hydrochlorothiazide',
  concentration: '20mg/12.5mg',
  price: 105,
  matchKeywords: [
    'ace inhibitor', 'diuretic', 'sinopril', 'co', 'lisinopril',
    'سينوبريل كو', 'سينوبريل', 'مدر للبول', 'ضغط', 'ليسينوبريل'
  ],
  usage: 'علاج مزدوج للضغط: ليسينوبريل (٢٠ مجم) مع مدر للبول خفيف (١٢.٥ مجم).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ACE_INHIBITORS,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٢٠/١٢.٥ مجم مرة يومياً صباحاً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'ممنوع للحوامل.',
    'تأكد من عدم وجود حساسية لمركبات السلفا (بسبب مدر البول).',
    'شرب الماء ضروري.'
  ]
},

// 13. Tritace max 10/25mg 10 tab
{
  id: 'zestril-20-tabs',
  name: 'Zestril 20mg 10 tab',
  genericName: 'Lisinopril',
  concentration: '20mg',
  price: 68,
  matchKeywords: [
    'ace inhibitor', 'lisinopril', 'zestril', 'high dose', 'hypertension',
    'زيستريل ٢٠', 'ليسينوبريل', 'ضغط مرتفع', 'حماية الكلى'
  ],
  usage: 'الجرعة القصوى المعتادة من دواء زيستريل؛ تستخدم للحالات المزمنة والمستقرة لضبط الضغط وحماية القلب.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ACE_INHIBITORS,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٢٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'ممنوع للحوامل.',
    'راقب وظائف الكلى والبوتاسيوم بشكل دوري.',
    'إذا كنت تتناول مدرات للبول، راجع الجرعة والتداخلات قبل رفع الجرعة لهذا التركيز.'
  ]
},

// 16. Zestril 5mg 10 tab
{
  id: 'zestril-5-tabs',
  name: 'Zestril 5mg 10 tab',
  genericName: 'Lisinopril',
  concentration: '5mg',
  price: 27,
  matchKeywords: [
    'ace inhibitor', 'lisinopril', 'zestril', 'starting dose',
    'زيستريل ٥', 'ليسينوبريل', 'جرعة البداية', 'ضغط'
  ],
  usage: 'الجرعة الافتتاحية (Starting Dose) لبدء العلاج لمرضى الضغط، أو الجرعة العلاجية لقصور القلب.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ACE_INHIBITORS,
  form: 'Tablet',

  minAgeMonths: 1, // Lisinopril floor
  maxAgeMonths: 1200,
  minWeight: 20,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 144) {
      return '١ قرص ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    } else {
      return 'للأطفال (٦ سنوات فأكثر): تحسب الجرعة بـ ٠.٠٧ مجم/كجم مرة واحدة يومياً.';
    }
  },

  warnings: [
    'ممنوع للحوامل.',
    'أعد التقييم إن استمرت الكحة الجافة.'
  ]
},

// 17. Sinopril 10mg 30 tab
{
  id: 'sinopril-10-30tabs',
  name: 'Sinopril 10mg 30 tab',
  genericName: 'Lisinopril',
  concentration: '10mg',
  price: 69,
  matchKeywords: [
    'ace inhibitor', 'lisinopril', 'sinopril', 'generic',
    'سينوبريل', 'ليسينوبريل', 'بديل زيستريل', 'ضغط'
  ],
  usage: 'بديل محلي ممتاز (Generic) لعلاج ضغط الدم المرتفع (عبوة شهرية).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ACE_INHIBITORS,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'ممنوع للحوامل.',
    'نفس فعالية المستورد بسعر أقل، لكن تأكد من جودة الصناعة.'
  ]
},

// 18. Sinopril 20mg 10 tab
{
  id: 'sinopril-20-10tabs',
  name: 'Sinopril 20mg 10 tab',
  genericName: 'Lisinopril',
  concentration: '20mg',
  price: 16.8,
  matchKeywords: [
    'ace inhibitor', 'lisinopril', 'sinopril', 'high dose',
    'سينوبريل ٢٠', 'ليسينوبريل', 'ضغط عالي', 'رخيص'
  ],
  usage: 'تركيز عالي لعلاج الضغط المرتفع (شريط واحد اقتصادي).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ACE_INHIBITORS,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٢٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'ممنوع للحوامل.',
    'راقب الضغط بانتظام.'
  ]
},

// 19. Triacor 5/5 mg 10 f.c. tab
{
  id: 'triacor-5-5-tabs',
  name: 'Triacor 5/5 mg 10 f.c. tab',
  genericName: 'Ramipril + Felodipine',
  concentration: '5mg/5mg',
  price: 57,
  matchKeywords: [
    'ace inhibitor', 'ccb', 'calcium channel blocker', 'ramipril', 'felodipine', 'triacor',
    'ترياكور', 'راميبريل', 'فيلوديبين', 'ضغط مركب', 'توسيع الشرايين'
  ],
  usage: 'تركيبة ذكية تجمع بين (موسع للشرايين ومثبط للإنزيم)؛ فعالة جداً لمرضى الضغط الذين لا يستجيبون لدواء واحد، وتقلل من حدوث تورم القدمين.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ACE_INHIBITORS, // Could also be CALCIUM_CHANNEL_BLOCKER
  form: 'Film-coated Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٥/٥ مجم مرة يومياً صباحاً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'ممنوع للحوامل.',
    'يمنع تقسيم القرص (Extended Release) لأن ذلك يؤدي لخروج الدواء دفعة واحدة ويسبب هبوطاً حاداً.',
    'قد يسبب احمراراً في الوجه (Flushing) أو صداعاً في بداية الاستخدام.'
  ]
},

// 20. Tritace comp 5/25mg 14 tab
{
  id: 'capoten-25-tabs',
  name: 'Capoten 25mg 20 tab',
  genericName: 'Captopril',
  concentration: '25mg',
  price: 32,
  matchKeywords: [
    'ace inhibitor', 'captopril', 'capoten', 'short acting',
    'كابوتن ٢٥', 'كابتوبريل', 'ضغط', 'تحت اللسان'
  ],
  usage: 'الجرعة القياسية للكابوتن. يستخدم لعلاج الضغط، فشل القلب، وكدواء إسعافي (تحت اللسان) في حالات الارتفاع المفاجئ للضغط.',
  timing: '٢–٣ مرات يومياً – مزمن',
  category: Category.ACE_INHIBITORS,
  form: 'Scored Tablet',

  minAgeMonths: 1, // Captopril floor
  maxAgeMonths: 1200,
  minWeight: 30,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٢٥ مجم مرتين يومياً على معدة فارغة لمدة طويلة (مزمن)';
  },

  warnings: [
    'ممنوع للحوامل.',
    'الطعام يقلل مفعوله للنصف تقريباً.'
  ]
},

// 22. Capotril 50mg 20 tab
{
  id: 'capotril-50-tabs',
  name: 'Capotril 50mg 20 tab',
  genericName: 'Captopril',
  concentration: '50mg',
  price: 28,
  matchKeywords: [
    'ace inhibitor', 'captopril', 'generic', 'capotril',
    'كابوتريل', 'كابتوبريل', 'بديل كابوتن', 'ضغط عالي'
  ],
  usage: 'بديل محلي للكابوتن بتركيز عالي (٥٠ مجم).',
  timing: '٢–٣ مرات يومياً – مزمن',
  category: Category.ACE_INHIBITORS,
  form: 'Scored Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٥٠ مجم مرتين يومياً على معدة فارغة لمدة طويلة (مزمن)';
  },

  warnings: [
    'ممنوع للحوامل.',
    'نفس محاذير الكابوتن (معدة فارغة، كحة جافة، ممنوع للحمل).'
  ]
},

// 23. Sinopril 5mg 20 tab
{
  id: 'sinopril-5-20tabs',
  name: 'Sinopril 5mg 20 tab',
  genericName: 'Lisinopril',
  concentration: '5mg',
  price: 20,
  matchKeywords: [
    'ace inhibitor', 'lisinopril', 'sinopril', 'low dose',
    'سينوبريل ٥', 'ليسينوبريل', 'جرعة صغيرة'
  ],
  usage: 'جرعة البداية (Starting Dose) من السينوبريل.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ACE_INHIBITORS,
  form: 'Tablet',

  minAgeMonths: 1, // Lisinopril floor
  maxAgeMonths: 1200,
  minWeight: 20,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: ['ممنوع للحوامل.']
},

// 24. Tritace comp ls 2.5/12.5mg 14 tab
{
  id: 'tritace-protect-10-tabs',
  name: 'Tritace protect 10mg 20 tab',
  genericName: 'Ramipril',
  concentration: '10mg',
  price: 132,
  matchKeywords: [
    'ace inhibitor', 'ramipril', 'tritace', 'protect', 'high dose',
    'تريتاس بروتكت', 'راميبريل', 'حماية القلب', 'وقاية', 'جرعة قصوى'
  ],
  usage: 'أقصى جرعة من الراميبريل؛ صُممت خصيصاً لتوفير "حماية" قصوى للقلب والأوعية الدموية (Vascular Protection) وتقليل خطر الوفاة في المرضى المعرضين للخطر العالي.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ACE_INHIBITORS,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'ممنوع للحوامل.',
    'راقب وظائف الكلى والبوتاسيوم.',
    'إذا شعرت بسعال جاف لا يحتمل، أعد التقييم.'
  ]
},

// 26. Sedoretic 12.5/20mg 10 tabs
{
  id: 'sedoretic-20-12.5-tabs',
  name: 'Sedoretic 12.5/20mg 10 tabs',
  genericName: 'Lisinopril + Hydrochlorothiazide',
  concentration: '20mg/12.5mg',
  price: 13,
  matchKeywords: [
    'ace inhibitor', 'diuretic', 'sedoretic', 'cheap', 'generic',
    'سيدوريتك', 'بديل رخيص', 'ليسينوبريل', 'ضغط', 'سيديكو'
  ],
  usage: 'بديل اقتصادي جداً (Generic) لعلاج ضغط الدم المرتفع؛ يحتوي على نفس تركيبة "زيستوريتك" بفعالية جيدة وسعر في المتناول.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ACE_INHIBITORS,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٢٠/١٢.٥ مجم مرة يومياً صباحاً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'ممنوع للحوامل.',
    'نظراً لسعره المنخفض، تأكد من تخزينه بشكل جيد وعدم تعرض الأقراص للرطوبة.'
  ]
},

// 27. Captolink 5mg/5ml syrup 100 ml
{
  id: 'captolink-syrup',
  name: 'Captolink 5mg/5ml syrup 100 ml',
  genericName: 'Captopril',
  concentration: '5mg/5ml', // 1mg/1ml
  price: 34,
  matchKeywords: [
    'ace inhibitor', 'captopril', 'syrup', 'pediatric', 'heart failure', 'captolink',
    'كابتولينك', 'شراب كابتوبريل', 'ضغط اطفال', 'هبوط قلب اطفال', 'رضع'
  ],
  usage: 'الحل الأمثل والأدق لعلاج قصور عضلة القلب (Cardiomyopathy) وارتفاع ضغط الدم لدى الرضع والأطفال الذين لا يستطيعون بلع الأقراص.',
  timing: '٣ مرات يومياً – مزمن',
  category: Category.ACE_INHIBITORS,
  form: 'Syrup',

  minAgeMonths: 1, // Captopril floor
  maxAgeMonths: 144, // Up to 12 years (or adults with dysphagia)
  minWeight: 2,
  maxWeight: 100,

  calculationRule: (weight, ageMonths) => {
    const dose = (weight * 0.3).toFixed(1);
    return `${dose} مل (٠.٣ مجم/كجم) ٣ مرات يومياً على معدة فارغة لمدة طويلة (مزمن)`;
  },

  warnings: [
    'ممنوع للحوامل (تحذير للأمهات اللاتي قد يستخدمن الدواء بالخطأ).',
    'يجب متابعة وظائف الكلى للطفل بانتظام.',
    'انتبه: صلاحية الشراب بعد الفتح غالباً شهر واحد.'
  ]
},

// 28. Sinopril 5mg 30 tab
{
  id: 'sinopril-5-30tabs',
  name: 'Sinopril 5mg 30 tab',
  genericName: 'Lisinopril',
  concentration: '5mg',
  price: 42,
  matchKeywords: [
    'ace inhibitor', 'lisinopril', 'sinopril', 'low dose', 'pack',
    'سينوبريل ٥', 'عبوة توفير', 'شهرية'
  ],
  usage: 'عبوة اقتصادية (٣٠ قرص) لجرعة البداية من السينوبريل.',
  timing: 'مرة يومياً – مزمن',
  category: Category.ACE_INHIBITORS,
  form: 'Tablet',

  minAgeMonths: 1, // Lisinopril floor
  maxAgeMonths: 1200,
  minWeight: 20,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: ['ممنوع للحوامل.']
},

// 29. Lisitens 12.5/20mg 30 tab
{
  id: 'lisitens-20-12.5-tabs',
  name: 'Lisitens 12.5/20mg 30 tab',
  genericName: 'Lisinopril + Hydrochlorothiazide',
  concentration: '20mg/12.5mg',
  price: 79.5,
  matchKeywords: [
    'ace inhibitor', 'diuretic', 'lisitens', 'lisinopril',
    'ليزيتنس', 'ليسينوبريل', 'مدر', 'ضغط'
  ],
  usage: 'دواء مركب لعلاج الضغط (بديل جيد لزيستوريتك وسينوبريل كو).',
  timing: 'مرة يومياً – مزمن',
  category: Category.ACE_INHIBITORS,
  form: 'Tablet',

  minAgeMonths: 216,
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    return '١ قرص ٢٠/١٢.٥ مجم مرة يومياً صباحاً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'ممنوع للحوامل.',
    'تأكد من شرب السوائل.'
  ]
},

];

