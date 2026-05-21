import type { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_SPECIAL_SITUATIONS_TOPICS: GuidelineTopic[] = [
  {
    id: 'older-adults',
    group: 'specialPopulations',
    title: {
      en: '13. Older Adults',
      ar: '13. كبار السن',
    },
    summary: {
      en: 'Guidelines for managing diabetes in older adults, focusing on comprehensive geriatric assessment, individualized glycemic goals, deintensification of therapy, and avoiding hypoglycemia.',
      ar: 'إرشادات إدارة السكري لدى كبار السن، مع التركيز على التقييم الشامل لأمراض الشيخوخة، تخصيص أهداف السكر، تقليل كثافة العلاج، وتجنب هبوط السكر.',
    },
    points: {
      en: [
        'Assessment: Annually screen for geriatric syndromes (cognitive impairment, depression, falls, frailty), polypharmacy, and hypoglycemia.',
        'Hypoglycemia: Address hypoglycemia at every visit. Recommend CGM for those on insulin.',
        'Glycemic Goals: A1C <7.0–7.5% for healthy older adults. <8.0% for intermediate health. For complex/poor health, avoid strict targets and focus only on preventing symptomatic hyper/hypoglycemia.',
        'Complications & Lifestyle: Relax BP targets (e.g., <140/90) if needed. Encourage protein (≥0.8 g/kg) and exercise to maintain muscle mass.',
        'Medications: Deintensify complex regimens (especially insulin/sulfonylureas) if hypoglycemia risk is high. Prioritize medications with low hypoglycemia risk.',
        'End-of-Life: In palliative care, prioritize comfort. Stop strict glucose/BP/lipid control.',
      ],
      ar: [
        'التقييم: افحص سنوياً متلازمات الشيخوخة (الضعف الإدراكي، الاكتئاب، السقوط، الهشاشة)، وتعدد الأدوية، ونوبات الهبوط.',
        'الهبوط: تأكد من وعالج نوبات الهبوط بكل زيارة. يوصى بحساسات السكر (CGM) لمستخدمي الإنسولين.',
        'أهداف السكر: تراكمي <7.0-7.5% للأصحاء. <8.0% للصحة المتوسطة. للحالات المتأخرة، تجنب الأهداف الصارمة وركز فقط على منع الهبوط والارتفاع العرضي.',
        'المضاعفات ونمط الحياة: يمكن تخفيف هدف الضغط (<140/90) إذا لزم الأمر. شجع البروتين (≥0.8 جم/كجم) والرياضة لحفظ العضلات.',
        'الأدوية: خفف خطط العلاج المعقدة (خاصة الإنسولين والسلفونيل يوريا) لمنع الهبوط. اختر أدوية آمنة لا تسبب هبوطاً.',
        'نهاية الحياة: في الرعاية التلطيفية، الأولوية لراحة المريض. أوقف الضبط الصارم للسكر والضغط والدهون.',
      ],
    },
    practiceNote: {
      en: 'Deintensification is not giving up; it is an active decision to prioritize safety and quality of life over strict numbers in older or frail adults.',
      ar: 'تخفيف خطة العلاج ليس استسلاماً، بل قرار إيجابي لتغليب السلامة وجودة الحياة على الأرقام الصارمة لدى كبار السن والضعفاء.',
    },
    details: [
      {
        title: { en: 'Simplifying Insulin Regimens', ar: 'تبسيط نظام الإنسولين' },
        items: {
          en: [
            'Switch from multiple daily injections (MDI) to basal-only insulin.',
            'Discontinue mealtime insulin or switch to non-insulin agents with lower hypoglycemia risk if feasible.',
            'Use pre-mixed insulins with caution due to hypoglycemia risk, but they may be used if it simplifies administration for caregivers.',
          ],
          ar: [
            'التحول من الحقن المتعددة إلى الإنسولين القاعدي فقط.',
            'إيقاف إنسولين الوجبات أو استبداله بأدوية لا تسبب الهبوط إن أمكن.',
            'استخدم الإنسولين المخلوط بحذر لخطر الهبوط، لكن قد يستخدم لتسهيل الإعطاء بواسطة مقدمي الرعاية.',
          ],
        },
      },
    ],
    quickDecision: {
      when: {
        en: 'An older adult patient (≥65 years) presents with recurrent hypoglycemia or recent decline in cognitive/physical function.',
        ar: 'مريض مسن (≥65 عاماً) يعاني من تكرار هبوط السكر أو تدهور حديث في الوظائف الإدراكية أو الجسدية.',
      },
      start: {
        en: 'Screen for cognitive impairment and other geriatric syndromes. Adjust A1C goals to be less stringent (e.g., <8.0% or avoid symptomatic hyperglycemia only).',
        ar: 'افحص الضعف الإدراكي ومتلازمات الشيخوخة. اجعل أهداف التراكمي أكثر مرونة (مثلاً <8.0% أو فقط تجنب أعراض الارتفاع).',
      },
      followUp: {
        en: 'Deintensify the diabetes regimen by stopping sulfonylureas or reducing insulin doses. Implement CGM if still on insulin.',
        ar: 'خفف خطة العلاج بإيقاف السلفونيل يوريا أو تقليل الإنسولين. استخدم حساسات السكر (CGM) إذا استمر الإنسولين.',
      },
      warn: {
        en: 'Avoid complex sliding-scale insulin or strict adherence to guidelines meant for younger, healthier populations.',
        ar: 'تجنب أنظمة الإنسولين المعقدة ولا تلتزم بصرامة بالإرشادات المخصصة للأصغر سناً والأصحاء.',
      },
    },
    sourceIds: ['older-adults'],
    tags: ['older adults', 'geriatric', 'deintensification', 'hypoglycemia', 'cognitive impairment', 'palliative care'],
  },
  {
    id: 'children-dsmes-psychosocial',
    group: 'specialPopulations',
    title: {
      en: '14. Children & Adolescents: Education, Nutrition & Psychosocial Care',
      ar: '14. الأطفال والمراهقين: التثقيف والتغذية والرعاية النفسية',
    },
    summary: {
      en: 'Guidelines for comprehensive diabetes self-management education, medical nutrition therapy, physical activity, and psychosocial screening for children and adolescents.',
      ar: 'إرشادات التثقيف الشامل للسكري، العلاج الغذائي، النشاط البدني، والفحص النفسي والاجتماعي للأطفال والمراهقين.',
    },
    points: {
      en: [
        'Education & Nutrition: Emphasize carb counting and adjusting insulin for high-fat/protein meals.',
        'Activity: Recommend 60 mins of daily aerobic activity and teach hypoglycemia prevention during exercise.',
        'Psychosocial: Screen routinely for distress, depression, and disordered eating. Involve mental health professionals.',
        'Independence: Offer adolescents time alone with the provider.',
        'Reproductive Health: Provide preconception counseling for adolescent girls.',
      ],
      ar: [
        'التثقيف والتغذية: ركز على حساب الكربوهيدرات وتعديل الإنسولين للوجبات الدسمة.',
        'النشاط البدني: يُنصح بـ 60 دقيقة يومياً من الرياضة، مع التثقيف لمنع الهبوط وقت التمرين.',
        'الصحة النفسية: افحص الاكتئاب، التوتر، واضطرابات الأكل بشكل دوري. ادمج الأخصائي النفسي بالفريق.',
        'الاستقلالية: وفر للمراهقين وقتاً للجلوس بمفردهم مع الطبيب.',
        'الصحة الإنجابية: قدم استشارات ما قبل الحمل للفتيات المراهقات.',
      ],
    },
    sourceIds: ['children-adolescents'],
    tags: ['children', 'adolescents', 'DSMES', 'nutrition', 'psychosocial', 'exercise'],
  },
  {
    id: 'children-type1',
    group: 'specialPopulations',
    title: {
      en: '14. Children & Adolescents: Type 1 Diabetes Care, Technology & Goals',
      ar: '14. الأطفال والمراهقين: رعاية النوع الأول، التكنولوجيا وأهداف السكر',
    },
    summary: {
      en: 'Recommendations for the use of diabetes technology (CGM, AID, pumps) and individualized glycemic goals for children and adolescents with type 1 diabetes.',
      ar: 'توصيات استخدام تكنولوجيا السكري (حساسات السكر، المضخات الذكية) وتخصيص أهداف السكر للأطفال والمراهقين المصابين بالنوع الأول.',
    },
    points: {
      en: [
        'Technology: Offer CGM and automated insulin delivery (AID) at diagnosis. If AID is unavailable, offer open-loop pumps.',
        'Glycemic Goals: Target A1C <7% for most children. Target <7.5% if hypoglycemia unawareness exists. Target <6.5% if achievable without severe hypoglycemia.',
        'Monitoring: Use 14-day CGM metrics alongside A1C whenever possible.',
      ],
      ar: [
        'التكنولوجيا: وفر حساسات السكر (CGM) والمضخات الآلية (AID) فور التشخيص. إذا لم تتوفر، وفر المضخات التقليدية.',
        'أهداف التراكمي: الهدف <7% لمعظم الأطفال. <7.5% لمن لا يشعرون بالهبوط. <6.5% إذا أمكن دون هبوط شديد.',
        'المتابعة: استخدم قراءات حساس السكر لآخر 14 يوماً مع التراكمي لتقييم الحالة.',
      ],
    },
    sourceIds: ['children-adolescents'],
    tags: ['type 1', 'CGM', 'AID', 'pump', 'A1C', 'children'],
  },
  {
    id: 'children-type2',
    group: 'specialPopulations',
    title: {
      en: '14. Children & Adolescents: Type 2 Diabetes Management',
      ar: '14. الأطفال والمراهقين: إدارة السكري من النوع الثاني',
    },
    summary: {
      en: 'Screening, lifestyle interventions, pharmacologic therapy, and metabolic surgery guidelines for pediatric type 2 diabetes.',
      ar: 'فحص وعلاج السكري من النوع الثاني لدى الأطفال، بما في ذلك تغيير نمط الحياة، العلاج الدوائي، وجراحات السمنة.',
    },
    points: {
      en: [
        'Screening: Test youth with overweight/obesity and hyperglycemia. Test pancreatic autoantibodies to exclude Type 1.',
        'Lifestyle: Provide programs aiming for a 7–10% decrease in excess weight.',
        'Goals: Consider an A1C goal of <6.5% if achievable without hypoglycemia.',
        'Metformin: First-line therapy for asymptomatic patients with A1C <8.5%.',
        'Insulin: Start basal insulin (with metformin) if A1C ≥8.5%. If DKA is present, treat with insulin first, then start metformin after resolution.',
        'Intensification: Add GLP-1 RA or SGLT2i if metformin (with or without insulin) fails to meet goals.',
        'Surgery: Consider metabolic surgery for adolescents with BMI ≥35 and severe comorbidities.',
      ],
      ar: [
        'الفحص: افحص الأطفال الذين يعانون من السمنة وارتفاع السكر. وافحص الأجسام المضادة لاستبعاد النوع الأول.',
        'نمط الحياة: وفر برامج تهدف لإنقاص الوزن الزائد بنسبة 7-10%.',
        'الأهداف: التراكمي <6.5% هو الهدف إذا كان ممكناً بدون هبوط.',
        'الميتفورمين: الخط الأول للمرضى بدون أعراض والتراكمي <8.5%.',
        'الإنسولين: ابدأ الإنسولين القاعدي إذا التراكمي ≥8.5%. في حالة الحموضة الكيتونية، عالجها بالإنسولين أولاً ثم ابدأ الميتفورمين.',
        'تكثيف العلاج: أضف إبر GLP-1 أو SGLT2i إذا لم يتحقق الهدف.',
        'الجراحة: فكر في جراحة السمنة للمراهقين (BMI ≥35) مع مضاعفات شديدة.',
      ],
    },
    quickDecision: {
      when: {
        en: 'A child or adolescent with overweight/obesity is newly diagnosed with marked hyperglycemia (A1C ≥8.5%).',
        ar: 'تشخيص طفل أو مراهق يعاني من السمنة/زيادة الوزن حديثاً بارتفاع شديد في السكر (تراكمي ≥8.5%).',
      },
      start: {
        en: 'Exclude type 1 diabetes with pancreatic autoantibodies. Start basal insulin and initiate metformin concurrently.',
        ar: 'استبعد النوع الأول بتحليل الأجسام المضادة. ابدأ الإنسولين القاعدي بالتزامن مع بدء الميتفورمين.',
      },
      followUp: {
        en: 'Once glycemic goals are met, consider weaning off insulin and relying on metformin, GLP-1 RA, and/or SGLT2i.',
        ar: 'بمجرد تحقيق أهداف السكر، فكر في سحب الإنسولين تدريجياً والاعتماد على الميتفورمين و/أو GLP-1 RA و/أو SGLT2i.',
      },
      warn: {
        en: 'Do not assume type 2 diabetes based solely on obesity; overlapping presentation is common.',
        ar: 'لا تفترض أنه نوع ثاني لمجرد وجود سمنة؛ فالتداخل في الأعراض وارد جداً.',
      },
    },
    sourceIds: ['children-adolescents'],
    tags: ['type 2', 'children', 'obesity', 'metformin', 'insulin', 'metabolic surgery'],
  },
  {
    id: 'children-complications',
    group: 'specialPopulations',
    title: {
      en: '14. Children & Adolescents: Complications & Associated Conditions',
      ar: '14. الأطفال والمراهقين: المضاعفات والأمراض المصاحبة',
    },
    summary: {
      en: 'Screening and management of cardiovascular risk factors (lipids, BP), microvascular complications (nephropathy, retinopathy, neuropathy), and associated conditions (celiac, thyroid, MASLD).',
      ar: 'فحص وعلاج عوامل الخطر القلبية (الدهون، الضغط)، المضاعفات الدقيقة (الكلى، الشبكية، الأعصاب)، والأمراض المصاحبة (حساسية القمح، الغدة الدرقية، الكبد الدهني).',
    },
    points: {
      en: [
        'Lipids: Screen at diagnosis (T2D) or age ≥2 (T1D). Target LDL <100 mg/dL. Use statins if lifestyle fails.',
        'Blood Pressure: Measure at every visit. Goal <90th percentile (or <130/80 if ≥13 years). Treat with lifestyle, then meds.',
        'Kidneys: Screen UACR at age 11/puberty (after 5 years for T1D, immediately for T2D). Treat with ACEi/ARB if UACR ≥30.',
        'Eyes & Feet: Dilated eye exam and foot exam starting at age 11/puberty (after 5 years for T1D, immediately for T2D).',
        'Liver & Sleep (T2D): Screen for MASLD (liver enzymes) and sleep apnea annually.',
        'Thyroid & Celiac (T1D): Screen TSH and celiac antibodies (IgA tTG) after diagnosis. Treat celiac with a gluten-free diet.',
      ],
      ar: [
        'الدهون: افحص عند التشخيص (النوع 2) أو بعد سنتين (النوع 1). هدف LDL <100. استخدم الستاتين إذا لم تنفع الحمية.',
        'الضغط: قس بكل زيارة. الهدف أقل من المئين 90 (أو <130/80 للمراهقين).',
        'الكلى: افحص الزلال عند البلوغ/11 سنة (بعد 5 سنوات للنوع 1، وفوراً للنوع 2). استخدم ACEi/ARB إذا كان الزلال ≥30.',
        'العيون والأقدام: فحص قاع العين والقدم عند البلوغ/11 سنة (بعد 5 سنوات للنوع 1، وفوراً للنوع 2).',
        'الكبد والنوم (للنوع الثاني): افحص إنزيمات الكبد وانقطاع النفس النومي سنوياً.',
        'الغدة والقمح (للنوع الأول): افحص الغدة (TSH) وحساسية القمح (IgA tTG). التزم بحمية خالية من الجلوتين للمصابين.',
      ],
    },
    sourceIds: ['children-adolescents'],
    tags: ['complications', 'lipids', 'hypertension', 'nephropathy', 'retinopathy', 'celiac', 'thyroid'],
  },
  {
    id: 'children-transition',
    group: 'specialPopulations',
    title: {
      en: '14. Children & Adolescents: Substance Use & Transition to Adult Care',
      ar: '14. الأطفال والمراهقين: استخدام المواد والانتقال لرعاية البالغين',
    },
    summary: {
      en: 'Guidelines on screening for substance use and preparing for the transition from pediatric to adult diabetes care.',
      ar: 'إرشادات الفحص عن التدخين واستخدام المواد، والتحضير للانتقال من رعاية الأطفال إلى رعاية البالغين.',
    },
    points: {
      en: [
        'Substance Use: Screen for tobacco, vaping, alcohol, and substance use regularly. Advise against recreational cannabis use.',
        'Transition: Prepare for the transition to adult care starting in early adolescence, at least 1 year before transfer.',
        'Decision-Making: Partner with adolescents to decide the timing of transition. There is no strict age cutoff.',
      ],
      ar: [
        'التدخين والمواد: افحص السجائر الإلكترونية، التدخين والكحول. انصح بعدم استخدام الحشيش الترفيهي.',
        'الانتقال: حضّر لانتقال الرعاية للبالغين مبكراً، قبل سنة على الأقل من النقل الفعلي.',
        'القرار: شارك المراهق وأسرته في تحديد موعد الانتقال، فلا يوجد عمر محدد صارم.',
      ],
    },
    sourceIds: ['children-adolescents'],
    tags: ['transition', 'substance use', 'vaping', 'adult care'],
  },
  {
    id: 'pregnancy-preconception',
    group: 'specialPopulations',
    title: {
      en: '15. Pregnancy: Preconception Counseling & Care',
      ar: '15. الحمل: الاستشارة والرعاية ما قبل الحمل',
    },
    summary: {
      en: 'Guidelines for preconception care, family planning, and optimizing glycemic control before pregnancy for individuals with preexisting diabetes.',
      ar: 'إرشادات الرعاية ما قبل الحمل، تنظيم الأسرة، وتحسين التحكم في السكر قبل الحمل للمصابات بالسكري المسبق.',
    },
    points: {
      en: [
        'Counseling & Contraception: Incorporate preconception counseling starting at puberty. Use effective contraception until A1C and treatment plan are optimized.',
        'A1C Goal: Aim for A1C <6.5% (if safe) to reduce risks of congenital anomalies and pregnancy complications.',
        'Team Care: Preexisting diabetes requires an interprofessional team (endocrinologist, maternal-fetal specialist, dietitian).',
        'Extra Focus: Emphasize nutrition, diabetes education, and screening for complications before conception.',
      ],
      ar: [
        'الاستشارة ومنع الحمل: ابدأ استشارات ما قبل الحمل من البلوغ. استخدمي وسيلة منع حمل فعالة حتى يتم ضبط التراكمي وخطة العلاج.',
        'هدف التراكمي: استهدفي تراكمي <6.5% (إن أمكن بأمان) لتقليل تشوهات الجنين ومضاعفات الحمل.',
        'فريق الرعاية: السكري المسبق يتطلب فريقاً متكاملاً (طبيب غدد، طبيب أمومة وجنين، أخصائي تغذية).',
        'عناية إضافية: ركزي على التغذية، التثقيف، وفحص مضاعفات السكري قبل الحمل.',
      ],
    },
    sourceIds: ['pregnancy-management'],
    tags: ['pregnancy', 'preconception', 'contraception', 'A1C'],
  },
  {
    id: 'pregnancy-glycemic-targets',
    group: 'specialPopulations',
    title: {
      en: '15. Pregnancy: Glycemic Targets & Monitoring',
      ar: '15. الحمل: أهداف السكر والمتابعة',
    },
    summary: {
      en: 'Glycemic goals (fasting, postprandial, and A1C) and continuous glucose monitoring (CGM) recommendations during pregnancy.',
      ar: 'أهداف السكر (الصائم، الفاطر، والتراكمي) وتوصيات حساسات السكر (CGM) أثناء الحمل.',
    },
    points: {
      en: [
        'Daily Goals: Fasting <95 mg/dL, 1-h postprandial <140 mg/dL, or 2-h postprandial <120 mg/dL.',
        'A1C Goal: Ideal A1C <6.0%, but may be relaxed to <7.0% to prevent hypoglycemia.',
        'CGM: Recommended for pregnant individuals with type 1 diabetes to improve neonatal outcomes. Use alongside BGM.',
        'Warnings: Do not use estimated A1C (eA1C) or glucose management indicator (GMI) as they are inaccurate during pregnancy.',
      ],
      ar: [
        'الأهداف اليومية: الصائم <95 مجم/ديسيلتر، بعد الأكل بساعة <140، أو بعد الأكل بساعتين <120.',
        'هدف التراكمي: المثالي <6.0%، لكن يمكن تخفيفه إلى <7.0% لمنع الهبوط.',
        'الحساسات (CGM): يُنصح بها للنوع الأول لتحسين نتائج المواليد، وتُستخدم مع قياسات الدم.',
        'تحذيرات: لا تعتمدي على التراكمي التقديري (eA1C أو GMI) لعدم دقته أثناء الحمل.',
      ],
    },
    quickDecision: {
      when: {
        en: 'A pregnant patient with diabetes asks what their daily blood sugar targets should be.',
        ar: 'مريضة سكري حامل تسأل عن أهداف السكر اليومية المناسبة لها.',
      },
      start: {
        en: 'Aim for fasting <95 mg/dL, 1-hr post-meal <140 mg/dL, or 2-hr post-meal <120 mg/dL.',
        ar: 'الهدف: الصائم <95، وبعد الأكل بساعة <140، أو بعد الأكل بساعتين <120 مجم/ديسيلتر.',
      },
      followUp: {
        en: 'Target A1C <6.0% if it can be achieved without hypoglycemia; otherwise, relax up to <7.0%. For Type 1, initiate CGM to help achieve targets.',
        ar: 'استهدف تراكمي <6.0% إذا أمكن دون هبوط، وإلا خففه حتى <7.0%. لمريضات النوع الأول، ابدأ حساسات السكر (CGM) للمساعدة.',
      },
      warn: {
        en: 'Do not rely on CGM-derived estimated A1C (GMI) during pregnancy as it is inaccurate.',
        ar: 'لا تعتمد على التراكمي التقديري المستخرج من الحساسات (GMI) أثناء الحمل لعدم دقته.',
      },
    },
    sourceIds: ['pregnancy-management'],
    tags: ['pregnancy', 'targets', 'A1C', 'fasting', 'postprandial', 'CGM'],
  },
  {
    id: 'pregnancy-management',
    group: 'specialPopulations',
    title: {
      en: '15. Pregnancy: Management & Medications',
      ar: '15. الحمل: الإدارة والأدوية',
    },
    summary: {
      en: 'Lifestyle interventions, insulin therapy guidelines, and restrictions on oral glucose-lowering medications in pregnancy.',
      ar: 'تغيير نمط الحياة، إرشادات العلاج بالإنسولين، وقيود استخدام أدوية السكر الفموية أثناء الحمل.',
    },
    points: {
      en: [
        'Lifestyle: Essential for GDM and may suffice for many. Add insulin if needed to achieve targets.',
        'Insulin: Preferred for GDM and T2D in pregnancy; mandatory for T1D (MDI or pumps). Automated insulin delivery (AID) is recommended for T1D.',
        'Oral Meds: Metformin and glyburide cross the placenta and are not first-line. Other oral/injectable medications lack safety data.',
        'PCOS: Discontinue metformin used for PCOS ovulation induction by the end of the first trimester.',
      ],
      ar: [
        'نمط الحياة: أساسي لسكري الحمل وقد يكفي وحده. أضيفي الإنسولين إذا لزم الأمر.',
        'الإنسولين: الخيار المفضل لسكري الحمل والنوع الثاني، وحتمي للنوع الأول. يُنصح بالمضخات الآلية (AID) للنوع الأول.',
        'الأدوية الفموية: الميتفورمين والغليبنكلاميد يعبران المشيمة وليسا خياراً أولاً. الأدوية الأخرى تفتقر لبيانات الأمان.',
        'تكيس المبايض: أوقفي الميتفورمين المستخدم لتنشيط التبويض بنهاية الثلث الأول من الحمل.',
      ],
    },
    sourceIds: ['pregnancy-management'],
    tags: ['pregnancy', 'insulin', 'metformin', 'GDM', 'lifestyle'],
  },
  {
    id: 'pregnancy-complications-meds',
    group: 'specialPopulations',
    title: {
      en: '15. Pregnancy: Complications & Medication Safety',
      ar: '15. الحمل: المضاعفات وأمان الأدوية',
    },
    summary: {
      en: 'Guidelines for preventing preeclampsia and managing hypertension and dyslipidemia during pregnancy.',
      ar: 'إرشادات الوقاية من تسمم الحمل وعلاج ضغط الدم والدهون أثناء الحمل.',
    },
    points: {
      en: [
        'Preeclampsia: Prescribe low-dose aspirin (100–150 mg/day) starting at 12–16 weeks of gestation for T1D or T2D.',
        'Hypertension: Target BP <140/90 mmHg for better outcomes. Deintensify therapy if BP <90/60 mmHg.',
        'Harmful Meds: Stop ACE inhibitors and ARBs prior to conception.',
        'Statins: Stop lipid-lowering medications prior to conception unless benefits strongly outweigh risks (e.g., familial hypercholesterolemia).',
      ],
      ar: [
        'تسمم الحمل: اصرفي أسبرين بجرعة منخفضة (100-150 مجم/يوم) بدءاً من الأسبوع 12-16 للحوامل بالنوع الأول أو الثاني.',
        'ضغط الدم: استهدفي ضغط <140/90 ملم زئبق. خففي العلاج إذا انخفض الضغط عن 90/60.',
        'أدوية ضارة: أوقفي أدوية الضغط مثل ACEi و ARBs قبل الحمل.',
        'أدوية الدهون: أوقفي أدوية خفض الدهون (الستاتين) قبل الحمل إلا للضرورة القصوى.',
      ],
    },
    sourceIds: ['pregnancy-management'],
    tags: ['pregnancy', 'preeclampsia', 'aspirin', 'hypertension', 'ACE inhibitors', 'statins'],
  },
  {
    id: 'pregnancy-postpartum',
    group: 'specialPopulations',
    title: {
      en: '15. Pregnancy: Postpartum Care',
      ar: '15. الحمل: رعاية ما بعد الولادة',
    },
    summary: {
      en: 'Postpartum adjustment of insulin, breastfeeding recommendations, and long-term screening for individuals with a history of gestational diabetes.',
      ar: 'تعديل الإنسولين بعد الولادة، توصيات الرضاعة الطبيعية، والفحص المستمر لمن أُصبن بسكري الحمل.',
    },
    points: {
      en: [
        'Insulin Adjustment: Reduce insulin requirements immediately postpartum as resistance decreases dramatically.',
        'Breastfeeding & Contraception: Discuss a contraceptive plan. Recommend breastfeeding for all; it reduces future T2D risk for those with GDM.',
        'GDM Screening: Screen individuals with recent GDM at 4–12 weeks postpartum using a 75-g OGTT.',
        'Lifelong Care: Screen for diabetes every 1–3 years for those with a history of GDM. Offer lifestyle interventions/metformin for prediabetes.',
      ],
      ar: [
        'تعديل الإنسولين: خفضي جرعات الإنسولين فوراً بعد الولادة لزوال مقاومة الإنسولين.',
        'الرضاعة ومنع الحمل: ناقشي خطة منع الحمل. يُنصح بالرضاعة الطبيعية لتقليل خطر النوع الثاني مستقبلاً لمن عانين من سكري الحمل.',
        'فحص سكري الحمل: افحصي من أصبن بسكري الحمل بعد 4-12 أسبوعاً من الولادة باختبار تحمل الجلوكوز.',
        'رعاية مدى الحياة: افحصي السكري كل 1-3 سنوات لمن عانين من سكري الحمل. استخدمي تغيير نمط الحياة/الميتفورمين للوقاية إذا ظهرت مقدمات السكري.',
      ],
    },
    quickDecision: {
      when: {
        en: 'A patient with a recent history of Gestational Diabetes (GDM) is seen for a postpartum follow-up visit.',
        ar: 'مريضة أُصيبت حديثاً بسكري الحمل تحضر لزيارة المتابعة بعد الولادة.',
      },
      start: {
        en: 'Perform a 75-g OGTT at 4–12 weeks postpartum to check for prediabetes or diabetes.',
        ar: 'قم بعمل اختبار تحمل الجلوكوز (75 جرام) بعد 4-12 أسبوعاً من الولادة لفحص السكري أو مقدماته.',
      },
      followUp: {
        en: 'If normal, continue screening every 1–3 years lifelong. If prediabetes, start lifestyle interventions and/or metformin.',
        ar: 'إذا كان طبيعياً، أعد الفحص كل 1-3 سنوات مدى الحياة. إذا ظهرت مقدمات السكري، ابدأ نمط حياة صحي و/أو ميتفورمين.',
      },
      warn: {
        en: 'Insulin needs drop significantly right after delivery for those with preexisting diabetes; adjust doses immediately.',
        ar: 'حاجة الجسم للإنسولين تنخفض بشدة فور الولادة للمصابات بالسكري المسبق؛ يجب تعديل الجرعات فوراً.',
      },
    },
    sourceIds: ['pregnancy-management'],
    tags: ['pregnancy', 'postpartum', 'GDM', 'breastfeeding', 'screening'],
  },
  {
    id: 'hospital-admission-goals',
    group: 'specialPopulations',
    title: {
      en: '16. Hospital Care: Admission, Protocols & Glycemic Goals',
      ar: '16. رعاية المستشفى: الدخول، البروتوكولات، وأهداف السكر',
    },
    summary: {
      en: 'Guidelines for A1C testing upon admission, consulting diabetes teams, and glycemic goals for critically and noncritically ill patients.',
      ar: 'إرشادات قياس التراكمي عند الدخول، استشارة فرق السكري المتخصصة، وأهداف السكر للمرضى في الرعاية المركزة والأقسام العادية.',
    },
    points: {
      en: [
        'Admission A1C: Perform an A1C test on admission for anyone with diabetes or blood glucose >140 mg/dL (if no recent result in 3 months).',
        'Initiating Insulin: Start or intensify insulin for persistent hyperglycemia ≥180 mg/dL.',
        'ICU Goals: Target 140–180 mg/dL for critically ill patients.',
        'Non-ICU Goals: Target 100–180 mg/dL for noncritically ill patients, if achievable without hypoglycemia.',
      ],
      ar: [
        'التراكمي عند الدخول: قس التراكمي لأي مريض سكري أو لمن سكره >140 (إذا لم يتوفر فحص خلال آخر 3 أشهر).',
        'بدء الإنسولين: ابدأ الإنسولين إذا استمر ارتفاع السكر ≥180 مجم/ديسيلتر.',
        'العناية المركزة: الهدف 140-180 مجم/ديسيلتر لمرضى الحالات الحرجة.',
        'الأقسام العادية: الهدف 100-180 مجم/ديسيلتر إذا أمكن دون هبوط.',
      ],
    },
    sourceIds: ['hospital-care'],
    tags: ['hospital', 'admission', 'A1C', 'ICU', 'glycemic goals'],
  },
  {
    id: 'hospital-insulin-technology',
    group: 'specialPopulations',
    title: {
      en: '16. Hospital Care: Insulin Regimens & Technology',
      ar: '16. رعاية المستشفى: أنظمة الإنسولين والتكنولوجيا',
    },
    summary: {
      en: 'Insulin delivery methods for hospitalized patients, continuation of diabetes technology (CGM and pumps), and SGLT2i use.',
      ar: 'طرق إعطاء الإنسولين لمرضى المستشفى، استمرار استخدام تكنولوجيا السكري (الحساسات والمضخات)، واستخدام مثبطات SGLT2.',
    },
    points: {
      en: [
        'Technology: Continue personal CGM and insulin pumps during hospitalization if institutional protocols support it.',
        'ICU Insulin: Continuous IV insulin infusion is recommended for critically ill individuals.',
        'Non-ICU Poor Intake: Use basal insulin or basal-plus-correction for patients with poor oral intake.',
        'Non-ICU Good Intake: Use basal, prandial, and correction insulin components for patients eating normally.',
        'Sliding Scale: Sole use of sliding-scale (correction) insulin without basal is discouraged.',
        'SGLT2i: Initiate or continue SGLT2 inhibitors if indicated for heart failure (without contraindications).',
      ],
      ar: [
        'التكنولوجيا: يمكن الاستمرار باستخدام حساسات السكر (CGM) والمضخات إذا سمح بروتوكول المستشفى.',
        'العناية المركزة: يُنصح بتسريب الإنسولين الوريدي المستمر.',
        'الأقسام العادية (لا يأكلون): استخدم الإنسولين القاعدي أو القاعدي-مع-تصحيح.',
        'الأقسام العادية (يأكلون جيداً): استخدم نظام إنسولين قاعدي + وجبات + تصحيحي.',
        'الجرعات المنزلقة: لا يُنصح بالإنسولين التصحيحي فقط بدون إنسولين قاعدي.',
        'مثبطات SGLT2: استمر أو ابدأ استخدامها لمرضى فشل القلب (ما لم توجد موانع).',
      ],
    },
    quickDecision: {
      when: {
        en: 'A noncritically ill patient is admitted to the hospital, and their blood glucose is persistently >180 mg/dL.',
        ar: 'مريض في الأقسام العادية لديه قراءات سكر مستمرة أعلى من 180 مجم/ديسيلتر.',
      },
      start: {
        en: 'Start basal, prandial, and correction insulin if they are eating normally. Use basal plus correction if oral intake is poor.',
        ar: 'ابدأ إنسولين قاعدي ووجبات وتصحيحي إذا كان يأكل جيداً. استخدم إنسولين قاعدي وتصحيحي فقط إذا كان أكله ضعيفاً.',
      },
      followUp: {
        en: 'Adjust doses to target blood glucose 100–180 mg/dL. Re-evaluate if any BG <70 mg/dL.',
        ar: 'عدّل الجرعات للوصول إلى هدف السكر 100-180. أعد التقييم فوراً إذا انخفض السكر عن 70.',
      },
      warn: {
        en: 'Do not use a sliding scale (correction-only insulin) without basal insulin.',
        ar: 'لا تستخدم الجرعات المنزلقة (إنسولين تصحيحي فقط) بدون إنسولين قاعدي.',
      },
    },
    sourceIds: ['hospital-care'],
    tags: ['hospital', 'insulin', 'CGM', 'pump', 'sliding scale', 'SGLT2i'],
  },
  {
    id: 'hospital-hypoglycemia-perioperative',
    group: 'specialPopulations',
    title: {
      en: '16. Hospital Care: Hypoglycemia & Perioperative Management',
      ar: '16. رعاية المستشفى: الهبوط وإدارة الفترة المحيطة بالجراحة',
    },
    summary: {
      en: 'Establishing hospital protocols for hypoglycemia and setting glycemic targets before and during surgery.',
      ar: 'إنشاء بروتوكولات للتعامل مع هبوط السكر في المستشفيات، وتحديد أهداف السكر قبل وأثناء الجراحات.',
    },
    points: {
      en: [
        'Protocol: Hospitals should adopt a hypoglycemia management protocol and track episodes for quality improvement.',
        'Action: Review and adjust treatment plans immediately for any blood glucose <70 mg/dL to prevent recurrence.',
        'Preoperative: For elective surgery, aim for a preoperative A1C <8% or a 14-day GMI <8% to improve outcomes.',
        'Perioperative: Maintain blood glucose between 100 and 180 mg/dL before, during, and after surgery.',
      ],
      ar: [
        'البروتوكول: يجب على المستشفيات تبني بروتوكول لعلاج الهبوط وتتبع النوبات لتحسين الجودة.',
        'الإجراء: راجعي وعدلي خطة العلاج فوراً عند توثيق أي سكر <70 مجم/ديسيلتر لمنع تكراره.',
        'قبل الجراحة: للعمليات المجدولة، استهدفي تراكمي <8% لتحسين النتائج.',
        'أثناء الجراحة: حافظي على السكر بين 100 و 180 قبل وأثناء وبعد الجراحة.',
      ],
    },
    sourceIds: ['hospital-care'],
    tags: ['hospital', 'hypoglycemia', 'surgery', 'perioperative'],
  },
  {
    id: 'hospital-dka-hhs-discharge',
    group: 'specialPopulations',
    title: {
      en: '16. Hospital Care: Diabetic Emergencies & Discharge Planning',
      ar: '16. رعاية المستشفى: طوارئ السكري والتخطيط للخروج',
    },
    summary: {
      en: 'Management of DKA and HHS, transition to subcutaneous insulin, and structured discharge planning.',
      ar: 'إدارة الحماض الكيتوني السكري (DKA) وحالة فرط الأسمولية (HHS)، الانتقال للإنسولين تحت الجلد، والتخطيط المنظم لخروج المريض.',
    },
    points: {
      en: [
        'Emergencies: Manage DKA and HHS with IV fluids, insulin, and electrolytes. Ensure a safe transition to subcutaneous insulin.',
        'Education: Discharge planning must include education on preventing and managing DKA/HHS.',
        'Discharge: Provide a structured discharge plan. Ensure receiving facilities have diabetes management capabilities.',
      ],
      ar: [
        'الطوارئ: عالجي DKA و HHS بالسوائل الوريدية، الإنسولين، والمعادن. تأكدي من الانتقال الآمن للإنسولين تحت الجلد.',
        'التثقيف: يجب أن يشمل التخطيط للخروج تثقيف المريض للوقاية من DKA/HHS.',
        'الخروج: وفري خطة خروج منظمة، وتأكدي من قدرة المراكز المنقول إليها المريض على إدارة السكري.',
      ],
    },
    sourceIds: ['hospital-care'],
    tags: ['hospital', 'DKA', 'HHS', 'discharge', 'emergencies'],
  },
  {
    id: 'advocacy-full',
    group: 'specialPopulations',
    title: { en: '17. Diabetes Advocacy', ar: '17. الدعم الحقوقي لمرضى السكري' },
    summary: {
      en: 'Advocacy guidance protects safe diabetes care in schools, work, driving, correctional settings, and other environments where policy affects health.',
      ar: 'يركز هذا الجزء على حماية رعاية السكري الآمنة في المدرسة والعمل والقيادة وأماكن الاحتجاز وغيرها من البيئات التي تؤثر فيها السياسات على الصحة.',
    },
    points: {
      en: [
        'Reasonable Access: People with diabetes should have access to medications, devices, meals, and trained support at school and work.',
        'Driving: Decisions should be based on individualized safety and hypoglycemia risk, not blanket restrictions.',
        'Correctional Facilities: Should provide diabetes assessment, medication continuity, and emergency care.',
        'Clinician Role: Support patients by documenting medical necessity, safety plans, and needed accommodations.',
      ],
      ar: [
        'الوصول المعقول: يحق لمرضى السكري الحصول على الأدوية، الأجهزة، الوجبات، والدعم في المدرسة والعمل.',
        'القيادة: تُبنى القرارات على تقييم السلامة الفردية وخطر الهبوط بدلاً من المنع العام.',
        'أماكن الاحتجاز: يجب أن توفر تقييم السكري، استمرار الأدوية، ورعاية الطوارئ.',
        'دور الطبيب: ادعمي المريض بتوثيق الضرورة الطبية وخطط السلامة والتسهيلات المطلوبة.',
      ],
    },
    quickDecision: {
      when: {
        en: 'When a patient faces barriers at school, work, or while driving due to diabetes.',
        ar: 'عندما يواجه المريض عوائق في المدرسة، العمل، أو أثناء القيادة بسبب السكري.',
      },
      start: {
        en: 'Provide medical documentation outlining necessary safety accommodations.',
        ar: 'وفر وثائق طبية توضح التسهيلات اللازمة لسلامة المريض.',
      },
      followUp: {
        en: 'Update accommodations as the patient’s health or treatment regimen changes.',
        ar: 'حدث التسهيلات كلما تغيرت حالة المريض الصحية أو العلاجية.',
      },
      warn: {
        en: 'Avoid blanket driving restrictions; assess individually for hypoglycemia unawareness.',
        ar: 'تجنب منع القيادة بشكل عام؛ قيم الحالة فردياً بناءً على فقدان الإحساس بنقص السكر.',
      },
    },
    sourceIds: ['advocacy'],
    tags: ['advocacy', 'school', 'driving', 'detention', 'accommodations'],
  }
];
