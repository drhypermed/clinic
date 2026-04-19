import { Medication, Category } from '../../../types';

export const HEART_FAILURE_DIGOXIN_MEDS: Medication[] = [
  // 1. Cardixin 0.25mg 40 tablets
  {
    id: 'cardixin-0.25-tabs',
    name: 'Cardixin 0.25mg 40 tablets',
    genericName: 'Digoxin',
    concentration: '0.25mg',
    price: 36,
    matchKeywords: [
      'cardiac glycoside', 'digoxin', 'cardixin', 'heart failure', 'atrial fibrillation', 'afib', 'lanoxin', 'rate control', 'inotropic',
      'كارديكسين', 'ديجوكسين', 'لانكوسين', 'هبوط القلب', 'رفرفة اذينية', 'عدم انتظام الضربات', 'تقوية العضلة', 'فشل قلب', 'رجفان أذيني'
    ],
    usage: 'لزيادة قوة انقباض عضلة القلب (Inotropic) والتحكم في سرعة البطين أثناء الرجفان الأذيني (Rate Control).',
    timing: 'مرة يومياً – مزمن',
    category: Category.HEART_FAILURE, // Also fits ANTIARRHYTHMIC
    form: 'Tablet',

    minAgeMonths: 0, // Digoxin floor
    maxAgeMonths: 1200,
    minWeight: 30,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      if (ageMonths >= 216) {
        return '١ قرص ٠.٢٥ مجم مرة يومياً بدون اعتبار للأكل لمدة طويلة (مزمن)';
      } else {
        return 'للأطفال: يفضل استخدام الشراب لضبط الجرعة بالميكروجرام بدقة. في حالة الضرورة القصوى، تحسب الجرعة بـ ٨-١٠ ميكروجرام/كجم (بجرعات معتمدة).';
      }
    },

    warnings: [
      'هذا الدواء له "هامش أمان ضيق"؛ أي زيادة بسيطة قد تسبب تسمم ديجوكسين.',
      'أعراض التسمم تشمل: غثيان وقيء شديد، رؤية هالات صفراء حول الأضواء، أو بطء شديد في القلب.',
      'نقص البوتاسيوم في الدم يزيد من سمية الدواء (احذر من مدرات البول دون تعويض بوتاسيوم).',
      'ممنوع التوقف المفاجئ عن الدواء.',
      'يتفاعل مع الأميودارون والفيراباميل والكينيدين ويرفعون تركيزه بشكل خطير.',
      'يجب عمل تحليل مستوى الديجوكسين في الدم دورياً (Therapeutic Drug Monitoring).'
    ]
  },

  // 2. Cardixin 500 mcg/2ml 5 amp.
  {
    id: 'cardixin-500-amp',
    name: 'Cardixin 500 mcg/2ml 5 amp.',
    genericName: 'Digoxin',
    concentration: '0.5mg/2ml',
    price: 50,
    matchKeywords: [
      'cardiac glycoside', 'digoxin', 'injection', 'ampoule', 'iv', 'loading dose',
      'حقن كارديكسين', 'امبولات', 'ديجوكسين', 'وريد', 'طوارئ القلب'
    ],
    usage: 'يستخدم في المستشفيات للسيطرة السريعة على الرجفان الأذيني السريع (Rapid AF) أو جرعة تحميل (Digitalization) لمرضى هبوط القلب.',
    timing: 'جرعة تحميل داخل المستشفى',
    category: Category.HEART_FAILURE,
    form: 'Ampoule (IV/IM)',

    minAgeMonths: 0,
    maxAgeMonths: 1200,
    minWeight: 2,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      return '١ أمبول ٠.٥ مجم/٢ مل وريدي ببطء داخل المستشفى بدون اعتبار للأكل جرعة تحميل (قد تُكرر بجرعات أصغر كل ٦ ساعات حسب الحالة)';
    },

    warnings: [
      'يجب وضع المريض على جهاز مراقبة القلب (Monitor) أثناء الحقن.',
      'الحقن العضلي (IM) مؤلم جداً ويسبب تليفاً مكان الحقن، وامتصاصه غير منتظم (يفضل الوريد دائماً).',
      'تأكد من عدم وجود "إحصار قلبي" (Heart Block) قبل الإعطاء.',
      'خطر الوفاة في حالة الخطأ في الجرعة مرتفع جداً.'
    ]
  }
];

