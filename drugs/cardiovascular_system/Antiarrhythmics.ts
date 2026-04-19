import { Medication, Category } from '../../types';

export const ANTIARRHYTHMIC_MEDS: Medication[] = [
  // 1. Rytmonorm 150mg 30 f.c. tabs.
  {
    id: 'rytmonorm-150-tabs',
    name: 'Rytmonorm 150mg 30 f.c. tabs.',
    genericName: 'Propafenone HCl',
    concentration: '150mg',
    price: 130,
    matchKeywords: [
      'antiarrhythmic', 'propafenone', 'rytmonorm', 'afib', 'svt', 'palpitations', 'arrhythmia', 'atrial fibrillation',
      'ريتمونورم', 'بروبافينون', 'رفرفة قلبية', 'عدم انتظام ضربات القلب', 'تسارع نبضات القلب', 'خفقان', 'اضطراب نظم القلب'
    ],
    usage: 'منظم لضربات القلب (Class IC) يستخدم لعلاج والوقاية من تسارع النبض البطيني وفوق البطيني (SVT) والرجفان الأذيني.',
    timing: 'كل ٨ ساعات – مزمن',
    category: Category.ANTIARRHYTHMIC,
    form: 'Film-coated Tablet',

    minAgeMonths: 144, // Generally 12+ years strictly
    maxAgeMonths: 1200,
    minWeight: 40,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      if (ageMonths >= 144) return '١ قرص ١٥٠ مجم كل ٨ ساعات مع الأكل لمدة طويلة (مزمن)';
      return 'لا يُستخدم للأطفال إلا بجرعات معتمدة دقيقة.';
    },

    warnings: [
      'ممنوع استخدامه لمرضى ضعف عضلة القلب الشديد (Heart Failure) أو مرضى الربو الشعبي.',
      'يجب الالتزام بمواعيد الدواء بدقة متناهية لضمان انتظام ضربات القلب.',
      'قد يسبب طعماً معدنياً في الفم أو دواراً في بداية الاستخدام.',
      'يجب عمل تخطيط قلب (ECG) بشكل دوري لمتابعة تأثير الدواء.'
    ]
  },

  // 2. Cordarone 200 mg 30 scored tabs.
  {
    id: 'cordarone-200-tabs',
    name: 'Cordarone 200 mg 30 scored tabs.',
    genericName: 'Amiodarone HCl',
    concentration: '200mg',
    price: 102,
    matchKeywords: [
      'antiarrhythmic', 'amiodarone', 'cordarone', 'atrial fibrillation', 'vt', 'vf', 'arrhythmia', 'ventricular tachycardia',
      'كوردارون', 'أميودارون', 'منظم ضربات القلب', 'الرجفان الأذيني', 'تسارع القلب', 'خفقان', 'اضطراب نظم القلب', 'تسارع بطيني'
    ],
    usage: 'أقوى منظم لضربات القلب (Class III) يستخدم للحالات المستعصية من عدم انتظام الضربات البطينية والأذينية.',
    timing: 'مرة يومياً – مزمن',
    category: Category.ANTIARRHYTHMIC,
    form: 'Scored Tablet',

    minAgeMonths: 0, // Amiodarone floor
    maxAgeMonths: 1200,
    minWeight: 50,
    maxWeight: 250,

    calculationRule: (weight, ageMonths) => {
      if (ageMonths >= 216) return '١ قرص ٢٠٠ مجم مرة يومياً بعد الأكل لمدة طويلة (مزمن)';
      return 'غير مخصص للأطفال (أقراص).';
    },

    warnings: [
      'يسبب الدواء حساسية شديدة لضوء الشمس؛ يجب استخدام واقي شمس وتجنب التعرض المباشر للشمس.',
      'يستمر مفعول الدواء في الجسم لعدة أسابيع حتى بعد إيقافه (Long Half-life).',
      'يجب فحص وظائف الغدة الدرقية والكبد وكفاءة الرئة بشكل دوري (كل ٦ أشهر) أثناء العلاج.',
      'ممنوع تناول عصير الجريب فروت مع هذا الدواء لأنه يزيد من تركيزه في الدم لدرجة السمية.',
      'قد يسبب اضطرابات في الرؤية (رؤية هالات زرقاء) - أعد التقييم فوراً عند حدوث ذلك.',
      'يتفاعل مع الديجوكسين والوارفارين ويرفع تركيزهما في الدم بشكل خطير.'
    ]
  },

  // 3. Cardixin 0.25mg 40 tablets
  
];

