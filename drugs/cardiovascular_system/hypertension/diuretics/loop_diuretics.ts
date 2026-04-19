
import { Medication, Category } from '../../../../types';

export const LOOP_DIURETICS_MEDS: Medication[] = [
 // 1. Examide 10 mg 30 tabs
{
  id: 'examide-10-tab',
  name: 'Examide 10 mg 30 tabs',
  genericName: 'Torsemide',
  concentration: '10mg',
  price: 117,
  matchKeywords: [
    'edema', 'heart failure', 'ascites', 'examide', 'loop diuretic',
    'اكساميد', 'تورسيميد', 'مدر للبول', 'تخزين ميه', 'تورم'
  ],
  usage: 'مدر للبول قوي (أقوى من الفورسيميد/اللازكس بأربع مرات). يستخدم لعلاج التورم المصاحب لفشل القلب، أمراض الكلى، أو الكبد.',
  timing: 'مرة يومياً – مزمن',
  category: Category.LOOP_DIURETICS,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    return 'غير مخصص للأطفال.';
  },

  warnings: [
    'قد يسبب انخفاضاً في مستوى البوتاسيوم والصوديوم في الدم، لذا يجب إجراء تحاليل دورية.',
    'يجب الحذر عند الوقوف المفاجئ لتجنب الدوار (هبوط الضغط).',
    'يمنع استخدامه في حالات انقطاع البول التام (Anuria).'
  ]
},

// 2. Lasilactone 50/20 mg 30 tabs.
{
  id: 'lasilactone-50-20',
  name: 'Lasilactone 50/20 mg 30 tabs.',
  genericName: 'Spironolactone + Furosemide',
  concentration: '50mg / 20mg',
  price: 126,
  matchKeywords: [
    'edema', 'ascites', 'lasilactone', 'potassium sparing',
    'لازيلاكتون', 'مدر للبول', 'استسقاء', 'تورم القدمين'
  ],
  usage: 'تركيبة ثنائية تجمع بين (Furosemide) المدر للبول و(Spironolactone) الحافظ للبوتاسيوم. مثالي لمرضى الاستسقاء الكبدي وتورم القدمين المزمن.',
  timing: 'مرة يومياً – مزمن',
  category: Category.LOOP_DIURETICS,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ٥٠ مجم / ٢٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    return 'غير مخصص للأطفال.';
  },

  warnings: [
    'يمنع استخدامه لمرضى الفشل الكلوي الحاد أو ارتفاع البوتاسيوم في الدم.',
    'قد يسبب تضخماً أو ألماً في الثدي لدى الرجال (Gynecomastia) عند الاستخدام لفترات طويلة بسبب السبيرونولاكتون.',
    'يجب تجنب بدائل الملح الغنية بالبوتاسيوم.'
  ]
},

// 3. Lasilactone 100/20mg 30 f.c.tab.
{
  id: 'lasilactone-100-20',
  name: 'Lasilactone 100/20mg 30 f.c.tab.',
  genericName: 'Spironolactone + Furosemide',
  concentration: '100mg / 20mg',
  price: 186,
  matchKeywords: [
    'ascites', 'liver cirrhosis', 'lasilactone 100', 'edema',
    'لازيلاكتون ١٠٠', 'تليف كبد', 'استسقاء البطن', 'مدر قوي'
  ],
  usage: 'يحتوي على جرعة عالية من السبيرونولاكتون (١٠٠ مجم). الخيار الأول لعلاج الاستسقاء (تجمع الماء في البطن) الناتج عن تليف الكبد.',
  timing: 'مرة يومياً – مزمن',
  category: Category.LOOP_DIURETICS,
  form: 'Film-coated Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ١٠٠ مجم / ٢٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    return 'غير مخصص للأطفال.';
  },

  warnings: [
    'خطر ارتفاع البوتاسيوم (Hyperkalemia) وارد، مما قد يؤثر على انتظام ضربات القلب.',
    'قد يسبب الدواء دواراً أو نعاساً، لذا يجب الحذر عند القيادة.',
    'يمنع استخدامه للحوامل والمرضعات.'
  ]
},

// 4. Lasix 20mg/2ml 3 amp.
{
  id: 'lasix-20-amp',
  name: 'Lasix 20mg/2ml 3 amp.',
  genericName: 'Furosemide',
  concentration: '20mg / 2ml',
  price: 36,
  matchKeywords: [
    'acute pulmonary edema', 'emergency', 'lasix amp', 'injection',
    'لازكس حقن', 'طوارئ', 'ارتشاح رئوي', 'مدر وريدي'
  ],
  usage: 'للاستخدام في الحالات الطارئة: وذمة الرئة الحادة (Pulmonary Edema)، أزمات الضغط المرتفع، أو التورم الشديد الذي لا يستجيب للأقراص.',
  timing: 'عند اللزوم',
  category: Category.LOOP_DIURETICS,
  form: 'Ampoule (IV/IM)',

  minAgeMonths: 1, 
  maxAgeMonths: 1200,
  minWeight: 3,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ أمبول ٢٠ مجم/٢ مل وريدي عند اللزوم بدون اعتبار للأكل';
  } else {
      return 'للأطفال: ١ مجم/كجم بالحقن الوريدي أو العضلي.';
    }
  },

  warnings: [
    'الحقن الوريدي السريع قد يسبب فقدان السمع (Ototoxicity) وتضرر الأذن الداخلية.',
    'يجب مراقبة ضغط الدم وتوازن السوائل بدقة أثناء الاستخدام.',
    'قد يسبب هبوطاً حاداً في ضغط الدم.'
  ]
},

// 5. Lasix 40mg 24 tab.
{
  id: 'lasix-40-tab',
  name: 'Lasix 40mg 24 tab.',
  genericName: 'Furosemide',
  concentration: '40mg',
  price: 30,
  matchKeywords: [
    'edema', 'lasix', 'sanofi', 'water pill',
    'لازكس', 'سانوفي', 'مدر للبول', 'أقراص'
  ],
  usage: 'أشهر مدر للبول (المعيار الذهبي). يستخدم لعلاج التورم الناتج عن أمراض القلب والكلى والكبد.',
  timing: 'مرتين يومياً – مزمن',
  category: Category.LOOP_DIURETICS,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ٤٠ مجم مرتين يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    return '١ قرص ٤٠ مجم مرتين يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  },

  warnings: [
    'يسبب نقصاً في البوتاسيوم (Hypokalemia)، ينصح بتناول أطعمة غنية بالبوتاسيوم (مثل الموز والبرتقال) أو مكملات غذائية.',
    'يجب شرب كميات معتدلة من الماء لتجنب الجفاف، ولكن دون إفراط يقلل فاعلية الدواء.',
    'قد يرفع مستوى السكر وحمض اليوريك في الدم.'
  ]
},

// 6. Torsamolex 10mg 20 tabs.
{
  id: 'torsamolex-10',
  name: 'Torsamolex 10mg 20 tabs.',
  genericName: 'Torsemide',
  concentration: '10mg',
  price: 44,
  matchKeywords: [
    'edema', 'torsamolex', 'torsemide', 'generic examide',
    'تورساموليكس', 'تورسيميد', 'بديل اكساميد', 'مدر'
  ],
  usage: 'بديل اقتصادي لمادة التورسيميد. يتميز بامتصاص أفضل ومفعول أطول من الفورسيميد (اللازكس).',
  timing: 'مرة يومياً – مزمن',
  category: Category.LOOP_DIURETICS,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    return 'غير مخصص للأطفال.';
  },

  warnings: [
    'قد يسبب جفافاً وانخفاضاً في ضغط الدم، خاصة لكبار السن.',
    'يجب متابعة وظائف الكلى.'
  ]
},

// 7. Torsamolex 20mg 20 tabs.
{
  id: 'torsamolex-20',
  name: 'Torsamolex 20mg 20 tabs.',
  genericName: 'Torsemide',
  concentration: '20mg',
  price: 62,
  matchKeywords: [
    'edema', 'severe edema', 'torsamolex', 'high dose',
    'تورساموليكس ٢٠', 'جرعة عالية', 'تورم شديد'
  ],
  usage: 'جرعة مضاعفة (٢٠ مجم) لعلاج حالات التورم الشديدة أو التي لم تستجب لجرعة ١٠ مجم.',
  timing: 'مرة يومياً – مزمن',
  category: Category.LOOP_DIURETICS,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ٢٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    return 'غير مخصص للأطفال.';
  },

  warnings: [
    'خطر حدوث اضطراب في شوارد الدم (Electrolytes) أعلى مع هذه الجرعة.',
    'يمنع استخدامه في حالات انخفاض ضغط الدم الشديد.'
  ]
},

// 8. Torsreretic 20mg 30 tabs.
{
  id: 'torsreretic-20',
  name: 'Torsreretic 20mg 30 tabs.',
  genericName: 'Torsemide',
  concentration: '20mg',
  price: 123,
  matchKeywords: [
    'edema', 'torsreretic', 'torsemide',
    'تورسيريتيك', 'تورسيميد', 'مدر للبول'
  ],
  usage: 'مستحضر آخر لمادة التورسيميد بتركيز ٢٠ مجم. فعال لعلاج الوذمة (Edema) المرتبطة بفشل القلب الاحتقاني.',
  timing: 'مرة يومياً – مزمن',
  category: Category.LOOP_DIURETICS,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ٢٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    return 'غير مخصص للأطفال.';
  },

  warnings: [
    'يجب التأكد من عدم وجود حساسية لمشتقات السلفونيل يوريا (Sulfa allergy).',
    'ينصح بمتابعة مستوى الماغنسيوم والبوتاسيوم في الدم.'
  ]
},

// 9. Examide 10mg/ml amp. for i.v inj.
{
  id: 'examide-amp',
  name: 'Examide 10mg/ml amp. for i.v inj.',
  genericName: 'Torsemide',
  concentration: '10mg / ml',
  price: 14.5,
  matchKeywords: [
    'emergency', 'examide amp', 'iv diuretic',
    'اكساميد حقن', 'حقن وريد', 'تورم حاد'
  ],
  usage: 'حقن تورسيميد وريدي. تستخدم عندما يكون الامتصاص الفموي غير كافٍ (مثل حالات فشل القلب الحاد والاحتقان المعوي) أو في الطوارئ.',
  timing: 'عند اللزوم',
  category: Category.LOOP_DIURETICS,
  form: 'Ampoule (IV)',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ أمبول ١٠ مجم / ml عند اللزوم بدون اعتبار للأكل';
    return 'غير مخصص للأطفال.';
  },

  warnings: [
    'يجب استبدال الحقن بالأقراص فور تحسن حالة المريض وقدرته على البلع وامتصاص الدواء.',
    'المراقبة المستمرة لضغط الدم ضرورية أثناء الحقن.'
  ]
},

// 10. Examide 5mg 30 tabs.
{
  id: 'examide-5-tab',
  name: 'Examide 5mg 30 tabs.',
  genericName: 'Torsemide',
  concentration: '5mg',
  price: 66,
  matchKeywords: [
    'edema', 'examide', 'start dose', 'mild htn',
    'اكساميد ٥', 'جرعة بسيطة', 'بداية العلاج'
  ],
  usage: 'الجرعة الأخف من التورسيميد. تستخدم في حالات التورم البسيط أو كعلاج مساعد لخفض ضغط الدم.',
  timing: 'مرة يومياً – مزمن',
  category: Category.LOOP_DIURETICS,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    return 'غير مخصص للأطفال.';
  },

  warnings: [
    'حتى مع الجرعات البسيطة، يجب الانتباه لعلامات الجفاف (العطش الشديد، جفاف الفم).',
    'قد يسبب الدوار.'
  ]
},
// 11. Torsreretic 10 mg 30 tabs.
{
  id: 'torsreretic-10',
  name: 'Torsreretic 10 mg 30 tabs.',
  genericName: 'Torsemide',
  concentration: '10mg',
  price: 93,
  matchKeywords: [
    'edema', 'heart failure', 'torsreretic', 'diuretic',
    'تورسيريتيك', 'تورسيميد', 'مدر للبول', 'تورم'
  ],
  usage: 'مدر للبول من فئة العروة (Loop Diuretic). يستخدم لعلاج الوذمة (تجمعات المياه) المصاحبة لفشل القلب الاحتقاني، أمراض الكلى، أو القصور الكبدي.',
  timing: 'مرة يومياً – مزمن',
  category: Category.LOOP_DIURETICS,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'غير مخصص للأطفال.';
    }
  },

  warnings: [
    'قد يسبب الدواء انخفاضاً في ضغط الدم، خاصة عند بداية العلاج.',
    'يجب متابعة وظائف الكلى ومستوى البوتاسيوم في الدم بشكل دوري.',
    'يراعى شرب كميات معتدلة من الماء لتجنب الجفاف.'
  ]
},

// 12. Torsreretic 100mg 30 tabs.
{
  id: 'torsreretic-100',
  name: 'Torsreretic 100mg 30 tabs.',
  genericName: 'Torsemide',
  concentration: '100mg',
  price: 261,
  matchKeywords: [
    'renal failure', 'ckd', 'severe edema', 'torsreretic 100', 'high dose',
    'تورسيريتيك ١٠٠', 'فشل كلوي', 'جرعة عالية جدا', 'قصور كلى'
  ],
  usage: 'جرعة عالية جداً مخصصة حصرياً لمرضى الفشل الكلوي المزمن (CKD) الذين يعانون من نقص حاد في معدل الترشيح الكبيبي (GFR < 20) ولا يستجيبون للجرعات العادية.',
  timing: 'مرة يومياً – مزمن',
  category: Category.LOOP_DIURETICS,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١٠٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'يمنع استخدامه للأطفال منعاً باتاً.';
    }
  },

  warnings: [
    'خطر حدوث جفاف حاد واضطراب شديد في شوارد الدم.',
    'يمنع استخدامه لمرضى القلب العاديين (بدون فشل كلوي) لتجنب الهبوط الحاد.',
    'يجب المتابعة الدقيقة لكمية البول اليومية.'
  ]
},

// 13. Edemex 1 mg 20 tabs
{
  id: 'edemex-1-tab',
  name: 'Edemex 1 mg 20 tabs',
  genericName: 'Bumetanide',
  concentration: '1mg',
  price: 44,
  matchKeywords: [
    'edema', 'bumetanide', 'edemex', 'potent diuretic', 'lasix alternative',
    'اديمكس', 'بيوميتانيد', 'مدر قوي', 'بديل لازكس', 'استسقاء'
  ],
  usage: 'مدر للبول قوي جداً (١ مجم يعادل ٤٠ مجم فورسيميد). يتميز بامتصاص كامل (Bioavailability) لا يتأثر بتورم الأمعاء، مما يجعله مثالياً للحالات المقاومة للازكس.',
  timing: 'مرتين يومياً – مزمن',
  category: Category.LOOP_DIURETICS,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ١ مجم مرتين يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'غير مخصص للأطفال.';
    }
  },

  warnings: [
    'يسبب فقداً سريعاً للسوائل، يجب الحذر من الجفاف.',
    'قد يسبب تقلصات عضلية (Cramps) نتيجة نقص البوتاسيوم والماغنسيوم.',
    'يجب استخدامه بحذر شديد مع كبار السن.'
  ]
},

// 14. Examide 20 mg 20 tabs
{
  id: 'examide-20-tab',
  name: 'Examide 20 mg 20 tabs',
  genericName: 'Torsemide',
  concentration: '20mg',
  price: 106,
  matchKeywords: [
    'edema', 'heart failure', 'examide', 'fluid retention',
    'اكساميد ٢٠', 'تورسيميد', 'مياه على الرئة', 'تورم القدمين'
  ],
  usage: 'جرعة مضاعفة لعلاج حالات الوذمة المتوسطة إلى الشديدة واحتقان الرئة الناتج عن ضعف عضلة القلب.',
  timing: 'مرة يومياً – مزمن',
  category: Category.LOOP_DIURETICS,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ٢٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    return 'غير مخصص للأطفال.';
  },

  warnings: [
    'قد يؤدي إلى انخفاض مستوى ضغط الدم الانتصابي (عند الوقوف).',
    'يجب مراقبة وظائف الكلى بانتظام.',
    'قد يرفع مستوى حمض اليوريك في الدم.'
  ]
},

// 15. Cardiotimide 20mg 20 tab
{
  id: 'cardiotimide-20',
  name: 'Cardiotimide 20mg 20 tab',
  genericName: 'Torsemide',
  concentration: '20mg',
  price: 45,
  matchKeywords: [
    'edema', 'cardiotimide', 'generic torsemide', 'economic',
    'كارديوتيميد', 'بديل اكساميد', 'سعر اقتصادي', 'تورسيميد'
  ],
  usage: 'بديل اقتصادي لمادة التورسيميد بتركيز ٢٠ مجم. يستخدم لعلاج التورم واحتباس السوائل.',
  timing: 'مرة يومياً – مزمن',
  category: Category.LOOP_DIURETICS,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 45,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ٢٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    return 'غير مخصص للأطفال.';
  },

  warnings: [
    'تأكد من عدم وجود حساسية لمادة السلفونيل يوريا.',
    'ينصح بتناول الأغذية الغنية بالبوتاسيوم (مثل الموز والتمر) خلال فترة العلاج.'
  ]
},

// 16. Examide 100 mg 20 tabs
{
  id: 'examide-100-tab',
  name: 'Examide 100 mg 20 tabs',
  genericName: 'Torsemide',
  concentration: '100mg',
  price: 144,
  matchKeywords: [
    'renal failure', 'nephrotic syndrome', 'examide 100', 'high dose',
    'اكساميد ١٠٠', 'فشل كلوي', 'متلازمة كلوية', 'جرعة قصوى'
  ],
  usage: 'جرعة عالية جداً لعلاج الوذمة الشديدة المرتبطة بالفشل الكلوي أو المتلازمة الكلوية (Nephrotic Syndrome).',
  timing: 'مرة يومياً – مزمن',
  category: Category.LOOP_DIURETICS,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ١٠٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    return 'يمنع للأطفال.';
  },

  warnings: [
    'خطر الإصابة بتسمم الأذن (Ototoxicity) يزداد مع الجرعات العالية جداً.',
    'يجب مراقبة ضغط الدم ووظائف الكلى بشكل مستمر.'
  ]
},

// 17. Cardiotimide 5mg 20 tab.
{
  id: 'cardiotimide-5',
  name: 'Cardiotimide 5mg 20 tab.',
  genericName: 'Torsemide',
  concentration: '5mg',
  price: 22.5,
  matchKeywords: [
    'mild edema', 'hypertension', 'cardiotimide', 'low dose',
    'كارديوتيميد ٥', 'ضغط', 'تورم بسيط'
  ],
  usage: 'جرعة منخفضة تستخدم لعلاج حالات التورم البسيطة أو كعلاج مساعد لخفض ضغط الدم المرتفع.',
  timing: 'مرة يومياً – مزمن',
  category: Category.LOOP_DIURETICS,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    return 'غير مخصص للأطفال.';
  },

  warnings: [
    'حتى مع الجرعات المنخفضة، قد يحدث انخفاض في مستوى البوتاسيوم.',
    'قد يسبب الشعور بالدوار.'
  ]
},

// 18. Exaretic 10 mg 30 tab
{
  id: 'exaretic-10-tab',
  name: 'Exaretic 10 mg 30 tab',
  genericName: 'Torsemide',
  concentration: '10mg',
  price: 108,
  matchKeywords: [
    'edema', 'exaretic', 'torsemide',
    'اكساريتيك', 'تورسيميد', 'مدر للبول'
  ],
  usage: 'علاج الوذمة (الاستسقاء) الناتج عن قصور القلب أو الكبد أو الكلى.',
  timing: 'مرة يومياً – مزمن',
  category: Category.LOOP_DIURETICS,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    return 'غير مخصص للأطفال.';
  },

  warnings: [
    'يجب التأكد من شرب كميات كافية من السوائل ما لم يمنع الطبيب ذلك.',
    'يجب الحذر عند استخدام الأدوية المسكنة (NSAIDs) لأنها قد تقلل من فاعلية الدواء.'
  ]
},

// 19. Exaretic 20 mg 30 tab.
{
  id: 'exaretic-20-tab',
  name: 'Exaretic 20 mg 30 tab.',
  genericName: 'Torsemide',
  concentration: '20mg',
  price: 141,
  matchKeywords: [
    'severe edema', 'exaretic 20', 'fluid overload',
    'اكساريتيك ٢٠', 'تورسيميد', 'احتباس سوائل'
  ],
  usage: 'جرعة قوية لعلاج احتباس السوائل الشديد. يتميز بفاعلية مستقرة وممتدة المفعول.',
  timing: 'مرة يومياً – مزمن',
  category: Category.LOOP_DIURETICS,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ٢٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    return 'غير مخصص للأطفال.';
  },

  warnings: [
    'قد يسبب انخفاضاً ملحوظاً في ضغط الدم.',
    'يجب مراقبة التوازن الإلكتروليتي (الصوديوم والبوتاسيوم) في الدم.'
  ]
},

// 20. Exaretic 20mg/2ml 3 amp
{
  id: 'exaretic-20-amp',
  name: 'Exaretic 20mg/2ml 3 amp',
  genericName: 'Torsemide',
  concentration: '20mg / 2ml',
  price: 48,
  matchKeywords: [
    'acute heart failure', 'pulmonary edema', 'exaretic amp', 'injection',
    'اكساريتيك حقن', 'وريد', 'طوارئ', 'ارتشاح رئوي'
  ],
  usage: 'حقن وريدية لعلاج حالات فشل القلب الحاد، الوذمة الرئوية، أو عندما يتعذر تناول الدواء عن طريق الفم.',
  timing: 'عند اللزوم',
  category: Category.LOOP_DIURETICS,
  form: 'Ampoule (IV)',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ أمبول ٢٠ مجم/٢ مل وريدي عند اللزوم بدون اعتبار للأكل';
  } else {
      return 'غير مخصص للأطفال.';
    }
  },

  warnings: [
    'الحقن السريع قد يسبب مشاكل في السمع.',
    'يجب تحويل المريض للعلاج بالأقراص فور استقرار حالته.',
    'يجب مراقبة ضغط الدم بدقة أثناء الحقن.'
  ]
},
// 21. Onced 5 mg 10 tab.
{
  id: 'onced-5-10',
  name: 'Onced 5 mg 10 tab.',
  genericName: 'Torsemide',
  concentration: '5mg',
  price: 17,
  matchKeywords: [
    'edema', 'onced', 'torsemide', 'small pack',
    'اونسي', 'تورسيميد', 'شريط واحد', 'تورم بسيط'
  ],
  usage: 'مدر للبول من مجموعة التورسيميد بجرعة مخففة. يستخدم كعلاج مساعد في حالات ارتفاع ضغط الدم أو التورم البسيط.',
  timing: 'مرة يومياً – مزمن',
  category: Category.LOOP_DIURETICS,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    return 'غير مخصص للأطفال.';
  },

  warnings: [
    'يجب الحذر من انخفاض ضغط الدم المفاجئ.',
    'ينصح بمتابعة التوازن الشاردي (خاصة البوتاسيوم) رغم أن تأثيره أقل حدة من الفورسيميد.'
  ]
},

// 22. Torsreretic 20mg/2ml 5 amp. i.v or inf.
{
  id: 'torsreretic-20-5amp',
  name: 'Torsreretic 20mg/2ml 5 amp. i.v or inf.',
  genericName: 'Torsemide',
  concentration: '20mg / 2ml',
  price: 75,
  matchKeywords: [
    'acute heart failure', 'torsreretic amp', 'iv infusion',
    'تورسيريتيك حقن', 'وريد', 'فشل قلب حاد', 'امبولات'
  ],
  usage: 'حقن وريدية (أو بالتنقيط الوريدي) لعلاج احتباس السوائل الحاد وفشل القلب الاحتقاني عندما يكون الإعطاء الفموي غير ممكن أو غير فعال.',
  timing: 'عند اللزوم',
  category: Category.LOOP_DIURETICS,
  form: 'Ampoule (IV)',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ أمبول ٢٠ مجم/٢ مل وريدي عند اللزوم بدون اعتبار للأكل';
  } else {
      return 'غير مخصص للأطفال.';
    }
  },

  warnings: [
    'يجب مراقبة ضغط الدم بدقة متناهية أثناء الحقن.',
    'خطر حدوث صدمة دموية (Hypovolemic Shock) في حال الاستجابة المفرطة.',
    'يجب التأكد من عدم وجود انسداد في المسالك البولية قبل الحقن.'
  ]
},

// 23. Torsreretic 5mg 30 tabs.
{
  id: 'torsreretic-5-30',
  name: 'Torsreretic 5mg 30 tabs.',
  genericName: 'Torsemide',
  concentration: '5mg',
  price: 60,
  matchKeywords: [
    'edema', 'torsreretic', 'start dose',
    'تورسيريتيك ٥', 'بداية العلاج', 'تورم'
  ],
  usage: 'جرعة البداية المعتادة لعلاج التورم، أو كجرعة صيانة (Maintenance) لمنع عودة تجمع السوائل.',
  timing: 'مرة يومياً – مزمن',
  category: Category.LOOP_DIURETICS,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    return 'غير مخصص للأطفال.';
  },

  warnings: [
    'تأكد من شرب كمية كافية من السوائل لتجنب الجفاف، ما لم ينصح الطبيب بتقليل السوائل.',
    'قد يسبب الدوار عند الوقوف.'
  ]
},

// 24. Cardiotimide 20mg/2ml 3 amp
{
  id: 'cardiotimide-20-amp',
  name: 'Cardiotimide 20mg/2ml 3 amp',
  genericName: 'Torsemide',
  concentration: '20mg / 2ml',
  price: 27,
  matchKeywords: [
    'emergency', 'cardiotimide amp', 'economic',
    'كارديوتيميد حقن', 'سعر اقتصادي', 'طوارئ'
  ],
  usage: 'بديل اقتصادي للحقن الوريدية للتورسيميد. يستخدم في حالات الطوارئ لعلاج الوذمة الرئوية وتجمع السوائل.',
  timing: 'عند اللزوم',
  category: Category.LOOP_DIURETICS,
  form: 'Ampoule (IV)',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ أمبول ٢٠ مجم/٢ مل وريدي عند اللزوم بدون اعتبار للأكل';
  } else {
      return 'غير مخصص للأطفال.';
    }
  },

  warnings: [
    'يجب الانتباه لتاريخ الصلاحية وسلامة الأمبول قبل الاستخدام.',
    'المتابعة الدقيقة للعلامات الحيوية ضرورية بعد الحقن.'
  ]
},

// 25. Furoretic 500 mg 20 tabs.
{
  id: 'furoretic-500',
  name: 'Furoretic 500 mg 20 tabs.',
  genericName: 'Furosemide',
  concentration: '500mg',
  price: 93,
  matchKeywords: [
    'renal failure', 'esrd', 'dialysis', 'furoretic 500', 'high dose',
    'فيوروريتيك ٥٠٠', 'فشل كلوي', 'جرعة عالية جدا', 'غسيل كلوي'
  ],
  usage: 'جرعة عالية جداً واستثنائية من الفورسيميد. مخصصة حصرياً لمرضى القصور الكلوي المزمن الشديد (Severe CKD / ESRD) لتحفيز إدرار البول المتبقي.',
  timing: 'مرة يومياً – مزمن',
  category: Category.LOOP_DIURETICS,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 50,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) {
      return '١ قرص ٥٠٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
  } else {
      return 'خطر مميت للأطفال. يمنع منعاً باتاً.';
    }
  },

  warnings: [
    'تحذير شديد اللهجة: تناول هذا الدواء لشخص لا يعاني من فشل كلوي قد يؤدي إلى جفاف قاتل وهبوط حاد في الدورة الدموية وفقدان دائم للسمع.',
    'يجب إجراء تحاليل وظائف الكلى والشوارد بصفة دورية ومستمرة.',
    'خطر تسمم الأذن (Ototoxicity) مرتفع جداً مع هذه الجرعة.'
  ]
},

// 26. Onced 10 mg 30 tab.
{
  id: 'onced-10-30',
  name: 'Onced 10 mg 30 tab.',
  genericName: 'Torsemide',
  concentration: '10mg',
  price: 75,
  matchKeywords: [
    'edema', 'onced 10', 'medium pack',
    'اونسي ١٠', 'تورسيميد', 'تورم'
  ],
  usage: 'الجرعة القياسية لعلاج الوذمة واحتقان السوائل المصاحب لفشل القلب.',
  timing: 'مرة يومياً – مزمن',
  category: Category.LOOP_DIURETICS,
  form: 'Tablet',

  minAgeMonths: 216, 
  maxAgeMonths: 1200,
  minWeight: 40,
  maxWeight: 250,

  calculationRule: (weight, ageMonths) => {
    if (ageMonths >= 216) return '١ قرص ١٠ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
    return 'غير مخصص للأطفال.';
  },

  warnings: [
    'راقب وزنك يومياً؛ الفقدان السريع للوزن قد يشير إلى فقدان مفرط للسوائل.',
    'يجب الحذر عند النهوض من السرير لتجنب الدوخة.'
  ]
}
];

