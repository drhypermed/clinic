import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_3_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch3-monitoring',
    group: '3. Prevention or Delay of Diabetes',
    sourceIds: ['3-prevention-or-delay-of-diabetes-and-associated-comorbidities-pdf', 'prevention'],
    tags: ['Prediabetes', 'Monitoring', 'Type 1 Staging'],
    title: {
      en: 'Monitoring and Screening Plan',
      ar: 'خطة المتابعة والفحص الدوري'
    },
    summary: {
      en: 'Proactive steps to prevent prediabetes or early stages of diabetes from progressing to overt clinical disease.',
      ar: 'هذا الفصل يركز على الخطوات الاستباقية لمنع تحول "مقدمات السكري" أو "المراحل المبكرة" إلى مرض صريح.'
    },
    points: {
      en: [
        'Prediabetes: These patients must be monitored at least annually, with the screening frequency adjusted based on individual risk assessment.',
        'Asymptomatic Type 1 (Stages 1 & 2): It is recommended to monitor disease progression using the A1C test every 6 months and perform an oral glucose tolerance test (OGTT) annually to anticipate and manage any deterioration early.'
      ],
      ar: [
        'مقدمات السكري (Prediabetes): يجب متابعة هؤلاء المرضى سنوياً على الأقل، مع تعديل وتيرة الفحص بناءً على تقييم المخاطر الفردية.',
        'النوع الأول غير المصحوب بأعراض (المرحلتان 1 و 2): يُنصح بمتابعة تطور المرض باستخدام فحص السكر التراكمي (A1C) كل 6 أشهر، وإجراء اختبار تحمل الجلوكوز الفموي (OGTT) سنوياً لتوقع وتدارك أي تدهور مبكراً.'
      ]
    }
  },
  {
    id: 'ada-2026-ch3-lifestyle',
    group: '3. Prevention or Delay of Diabetes',
    sourceIds: ['3-prevention-or-delay-of-diabetes-and-associated-comorbidities-pdf', 'prevention'],
    tags: ['Lifestyle', 'Diet', 'Sleep', 'Exercise'],
    title: {
      en: 'Lifestyle Modification: The Foundation of Type 2 Prevention',
      ar: 'تغيير نمط الحياة: الأساس للوقاية من النوع الثاني'
    },
    summary: {
      en: 'Diabetes Prevention Programs (DPP) have proven highly effective in reducing the risk of disease onset.',
      ar: 'برامج الوقاية من السكري (DPP) أثبتت فعاليتها العالية في تقليل خطر الإصابة.'
    },
    points: {
      en: [
        'Weight & Physical Activity: The primary goal is to lose 5-7% of body weight and engage in moderate-intensity physical activity for at least 150 minutes per week. Even if weight loss is not achieved, physical activity alone reduces the risk by 44%.',
        'Diet: There is no magic, universal ratio for carbohydrates, proteins, and fats. It is recommended to choose diets like the "Mediterranean Diet" or "Low-Carb" diets, focusing on food quality (whole grains, legumes, nuts) and reducing processed foods.',
        'Impact of Sleep: Sleep plays a pivotal role; ideal sleep is 7 hours daily. Lack of sleep (<6 hours), excess sleep (>9 hours), and a "night owl" lifestyle increase T2D risk by up to 50%.',
        'Telehealth Programs: Smart applications and approved telehealth programs can be relied upon to support patients in changing their lifestyle, as they are effective and convenient for facilitating follow-up.'
      ],
      ar: [
        'إنقاص الوزن والنشاط البدني: الهدف الأساسي هو إنقاص الوزن بنسبة 5-7% من وزن الجسم، وممارسة نشاط بدني متوسط الشدة لمدة 150 دقيقة على الأقل أسبوعياً. حتى في حال عدم تحقيق هدف إنقاص الوزن، فإن النشاط البدني وحده يقلل من خطر الإصابة بنسبة 44%.',
        'الأنظمة الغذائية: لا توجد نسبة سحرية وموحدة للكربوهيدرات والبروتينات والدهون. يُنصح باختيار أنظمة مثل "حمية البحر المتوسط" أو الأنظمة "منخفضة الكربوهيدرات"، مع التركيز على جودة الطعام (الحبوب الكاملة، البقوليات، المكسرات) وتقليل الأطعمة المصنعة.',
        'تأثير النوم: النوم يلعب دوراً محورياً؛ حيث أن النوم المثالي هو 7 ساعات يومياً. قلة النوم (أقل من 6 ساعات)، أو كثرته (أكثر من 9 ساعات)، وكذلك "السهر ليلاً" كنمط حياة، تزيد من خطر الإصابة بالنوع الثاني بنسبة تصل إلى 50%.',
        'البرامج التقنية (Telehealth): يمكن الاعتماد على التطبيقات الذكية وبرامج الرعاية عن بعد المعتمدة لدعم المرضى في تغيير نمط حياتهم، فهي فعالة ومناسبة لتسهيل المتابعة.'
      ]
    }
  },
  {
    id: 'ada-2026-ch3-pharmacologic',
    group: '3. Prevention or Delay of Diabetes',
    sourceIds: ['3-prevention-or-delay-of-diabetes-and-associated-comorbidities-pdf', 'prevention'],
    tags: ['Metformin', 'GLP-1', 'B12 Deficiency'],
    title: {
      en: 'Pharmacologic Interventions for Prevention',
      ar: 'التدخلات الدوائية للوقاية'
    },
    summary: {
      en: 'While lifestyle changes are foundational, some patients may require pharmacologic intervention.',
      ar: 'بينما يعتبر تغيير نمط الحياة هو الأساس، قد يحتاج بعض المرضى لتدخل دوائي.'
    },
    points: {
      en: [
        'Metformin: The most important and safest pharmacologic choice for preventing Type 2. Specifically recommended for high-risk groups: Age 25-59, BMI ≥ 35, fasting glucose ≥ 110, A1C ≥ 6.0%, and women with prior GDM.',
        'New Prophylactic Uses for Metformin: Strongly recommended proactively to prevent hyperglycemia in patients receiving certain cancer treatments (like PI3Kα inhibitors e.g. alpelisib) and patients on long-term high-dose corticosteroids.',
        'Important Metformin Warning: Long-term or high-dose use requires periodic checking of Vitamin B12 levels to avoid deficiency, especially in those with peripheral neuropathy or anemia.',
        'Weight Loss Drugs (e.g., GLP-1): Considered very useful for individuals with obesity and prediabetes to prevent disease progression.',
        'Medications Not Recommended: Testosterone or blood pressure meds (like valsartan) are not recommended for diabetes prevention due to lack of proven benefit. Also, despite some studies showing minor benefits for Vitamin D, routine prescription is not recommended to avoid risks like kidney stones and hypercalcemia.'
      ],
      ar: [
        'الميتفورمين (Metformin): هو الخيار الدوائي الأهم والأكثر أماناً للوقاية من النوع الثاني. يُنصح بوصفه تحديداً للفئات عالية الخطورة: العمر بين 25-59 عاماً، مؤشر كتلة الجسم (BMI) ≥ 35، مستوى جلوكوز صائم 110 أو أعلى، سكر تراكمي 6.0% أو أعلى، والسيدات اللاتي لديهن تاريخ مع سكري الحمل.',
        'استخدامات وقائية جديدة للميتفورمين: يُوصى بشدة باستخدام الميتفورمين بشكل استباقي لمنع حدوث ارتفاع السكر لدى المرضى الذين يتلقون علاجات معينة للأورام (مثل مثبطات PI3Kα كدواء alpelisib)، ولدى المرضى الذين يتلقون جرعات عالية من الكورتيزون لفترات طويلة.',
        'تحذير هام مع الميتفورمين: الاستخدام الطويل أو بجرعات عالية يتطلب فحصاً دورياً لمستويات فيتامين (B12) لتجنب نقصه، خاصة لمن يعانون من اعتلال عصبي محيطي أو أنيميا.',
        'أدوية إنقاص الوزن (مثل GLP-1): تعتبر مفيدة جداً للأشخاص الذين يعانون من السمنة ومقدمات السكري لمنع تطور المرض.',
        'أدوية لا يُنصح بها للوقاية: لا يُنصح باستخدام التستوستيرون أو أدوية الضغط (مثل valsartan) للوقاية من السكري لعدم ثبوت فائدتها لهذا الغرض. وكذلك، رغم أن بعض الدراسات أظهرت فائدة طفيفة لـ "فيتامين د"، إلا أنه لا يُنصح بوصفه بشكل روتيني للوقاية لتجنب مخاطره مثل حصوات الكلى وارتفاع الكالسيوم.'
      ]
    }
  },
  {
    id: 'ada-2026-ch3-cvd',
    group: '3. Prevention or Delay of Diabetes',
    sourceIds: ['3-prevention-or-delay-of-diabetes-and-associated-comorbidities-pdf', 'prevention'],
    tags: ['CVD', 'Statins', 'Pioglitazone'],
    title: {
      en: 'Cardiovascular Protection in Prediabetes',
      ar: 'حماية القلب والأوعية الدموية في مقدمات السكري'
    },
    summary: {
      en: 'Patients with prediabetes have an increased risk of cardiovascular disease.',
      ar: 'المرضى بمقدمات السكري لديهم خطر متزايد للإصابة بأمراض القلب.'
    },
    points: {
      en: [
        'Cholesterol Medications (Statins): The guidelines note that statins may slightly increase diabetes risk, but strictly forbid stopping or avoiding them for this reason, as their immense benefits in preventing clots and protecting the heart far outweigh the diabetes risk.',
        'Pioglitazone: Can be considered for patients with prediabetes, insulin resistance, and a history of stroke to reduce the risk of future strokes, but with caution regarding side effects like weight gain, edema, and increased fracture risk.'
      ],
      ar: [
        'أدوية الكوليسترول (Statins): يوضح الدليل أن استخدام مجموعة الستاتين قد يزيد قليلاً من خطر الإصابة بالسكري، ولكن يُمنع منعاً باتاً إيقافها أو تجنبها لهذا السبب؛ لأن فوائدها العظيمة في منع الجلطات وحماية القلب تتجاوز بكثير خطر الإصابة بالسكري.',
        'البيوجليتازون (Pioglitazone): يمكن اعتباره للمرضى الذين يعانون من مقدمات السكري ومقاومة إنسولين ولديهم تاريخ إصابة بجلطة دماغية لتقليل خطر حدوث جلطات مستقبلية، لكن مع الحذر من آثاره الجانبية مثل زيادة الوزن، التورم (Edema)، وزيادة خطر الكسور.'
      ]
    }
  },
  {
    id: 'ada-2026-ch3-t1d-delay',
    group: '3. Prevention or Delay of Diabetes',
    sourceIds: ['3-prevention-or-delay-of-diabetes-and-associated-comorbidities-pdf', 'prevention'],
    tags: ['Teplizumab', 'Type 1 Diabetes', 'Beta Cells'],
    title: {
      en: 'Delaying the Onset of Type 1 Diabetes',
      ar: 'تأخير ظهور السكري من النوع الأول'
    },
    summary: {
      en: 'This section sees significant development in delaying Type 1 Diabetes onset.',
      ar: 'هذا القسم يشهد تطوراً كبيراً في تأخير ظهور السكري من النوع الأول.'
    },
    points: {
      en: [
        'Drug Intervention: It is recommended to discuss administering Teplizumab-mzwv via IV infusion for individuals aged 8 and older in "Stage 2" T1D (autoantibodies present and dysglycemia without symptoms). This drug has proven capable of delaying clinical onset (Stage 3) for several years.',
        'Lifestyle Interventions for At-Risk Children: Studies show that increased physical activity slows disease progression, whereas high consumption of sugars and high-glycemic-index foods accelerates beta cell destruction and T1D onset.'
      ],
      ar: [
        'التدخل الدوائي: يُوصى بمناقشة إعطاء دواء (Teplizumab-mzwv) عن طريق التسريب الوريدي للأشخاص بعمر 8 سنوات فما فوق الذين هم في "المرحلة الثانية" من النوع الأول (لديهم أجسام مضادة واختلال في السكر بدون أعراض). هذا الدواء أثبت قدرته على تأخير ظهور المرض السريري (المرحلة الثالثة) لفترة تصل لعدة سنوات.',
        'التدخل في نمط الحياة للأطفال المعرضين للخطر: أظهرت الدراسات أن زيادة النشاط البدني يقلل من سرعة تطور المرض، بينما الاستهلاك العالي للسكريات والأطعمة ذات المؤشر الجلايسيمي المرتفع يسرع من تدمير خلايا بيتا وظهور السكري من النوع الأول.'
      ]
    }
  }
];
