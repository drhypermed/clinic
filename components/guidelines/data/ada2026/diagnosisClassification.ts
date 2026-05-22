import type { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_DIAGNOSIS_TOPICS: GuidelineTopic[] = [
  {
    id: 'diagnostic-criteria',
    group: 'diagnosisClassification',
    title: {
      en: 'Diagnostic Criteria and A1C Limitations',
      ar: 'معايير التشخيص وقيود فحص HbA1c',
    },
    summary: {
      en: 'Guidelines for diagnosing diabetes using A1C or plasma glucose, emphasizing confirmatory testing and identifying A1C limitations.',
      ar: 'إرشادات تشخيص السكري باستخدام HbA1c أو الجلوكوز في البلازما، مع التأكيد على الاختبارات التأكيدية وتحديد قيود فحص HbA1c.',
    },
    points: {
      en: [
        'Diagnostic Criteria: Fasting Plasma Glucose (FPG) ≥126 mg/dL (7.0 mmol/L), OR 2-h PG ≥200 mg/dL (11.1 mmol/L) during 75-g OGTT, OR A1C ≥6.5% (48 mmol/mol).',
        'Symptomatic Diagnosis: Random Plasma Glucose ≥200 mg/dL (11.1 mmol/L) in a patient with classic symptoms of hyperglycemia or hyperglycemic crisis.',
        'Confirmation: Unless unequivocally symptomatic, always confirm the diagnosis by testing two separate samples (e.g., FPG and A1C from the same sample, or repeating the test on a different day).',
        'Prediabetes: FPG 100-125 mg/dL (IFG), OR 2-h PG 140-199 mg/dL (IGT), OR A1C 5.7-6.4%.',
        'A1C Discordance: If FPG and A1C are discordant, repeat the test that is above the diagnostic threshold. If A1C does not match the clinical picture, trust plasma glucose.',
        'A1C Limitations: Do NOT use A1C for diagnosis in conditions with altered RBC turnover: pregnancy (2nd/3rd trimester), hemodialysis, recent blood loss or transfusion, erythropoietin therapy, sickle cell disease, or G6PD deficiency. Use plasma glucose instead.',
      ],
      ar: [
        'معايير التشخيص: سكر صائم (FPG) ≥ 126 مجم/ديسيلتر، أو بعد ساعتين من اختبار (OGTT 75g) ≥ 200 مجم/ديسيلتر، أو التراكمي (A1C) ≥ 6.5%.',
        'تشخيص الأعراض: سكر عشوائي ≥ 200 مجم/ديسيلتر في مريض يعاني من أعراض ارتفاع السكر الكلاسيكية أو أزمة سكر (Hyperglycemic crisis).',
        'التأكيد: يجب تأكيد التشخيص بعينتين (مثل صائم وتراكمي من نفس العينة، أو إعادة الفحص في يوم آخر)، إلا إذا كانت الأعراض قاطعة.',
        'ما قبل السكري (Prediabetes): صائم 100-125، أو بعد ساعتين 140-199، أو التراكمي 5.7-6.4%.',
        'تضارب القراءات: إذا اختلفت قراءة الصائم مع التراكمي، أعد الاختبار الذي تجاوز خط التشخيص. وإذا كان التراكمي لا يطابق الصورة السريرية، اعتمد دائماً على سكر الدم (FPG/OGTT).',
        'قيود التراكمي: يُمنع استخدام التراكمي للتشخيص في الحالات التي يتأثر فيها عمر خلايا الدم الحمراء: الحمل (الثلث الثاني والثالث)، الغسيل الكلوي، النزيف أو نقل الدم الحديث، العلاج بالإريثروبويتين، الأنيميا المنجلية، ونقص G6PD.',
      ],
    },
    quickDecision: {
      customBlocks: [
        {
          title: { en: 'Diagnosis Criteria', ar: 'معايير التشخيص' },
          content: {
            en: 'Diagnose if: FPG ≥126, 2h-PG ≥200, A1C ≥6.5%, or Random ≥200 with symptoms. Confirm with a second test.',
            ar: 'التشخيص المؤكد: صائم ≥126، أو بعد ساعتين ≥200، أو تراكمي ≥6.5%، أو عشوائي ≥200 مع أعراض. أعد الفحص للتأكيد.',
          },
          color: 'blue'
        }
      ]
    },
    sourceIds: ['diagnosis-classification'],
    tags: ['diagnosis', 'A1C', 'FPG', 'OGTT', 'confirmation', 'interference'],
  },
  {
    id: 'classification-type1',
    group: 'diagnosisClassification',
    title: {
      en: 'Classification and Type 1 Diabetes Screening',
      ar: 'التصنيف وفحص السكري من النوع الأول',
    },
    summary: {
      en: 'Recommendations for classifying diabetes and screening for presymptomatic type 1 diabetes using autoantibodies.',
      ar: 'توصيات تصنيف السكري وفحص ما قبل ظهور أعراض النوع الأول باستخدام الأجسام المضادة.',
    },
    points: {
      en: [
        'Autoantibody Testing: Screen for presymptomatic Type 1 diabetes by testing autoantibodies against insulin (IA), glutamic acid decarboxylase (GAD), islet antigen 2 (IA-2), or zinc transporter 8 (ZnT8).',
        'Who to Screen: Screening should be offered to first-degree family members of a proband with T1D, and considered in the general population via clinical trials or approved screening programs.',
        'Multiple Autoantibodies: Presence of multiple autoantibodies defines Stage 1 or Stage 2 Type 1 diabetes. These patients have a near 100% lifetime risk of developing clinical T1D.',
        'Referral & Delay: Refer individuals with positive autoantibodies to a specialized center. Consider therapies like Teplizumab to delay the onset of Stage 3 (clinical) Type 1 diabetes in eligible patients.',
        'LADA: Distinguish Latent Autoimmune Diabetes in Adults (LADA) from T2D. Measure GAD autoantibodies in adults lacking typical T2D features (e.g., normal BMI, personal/family history of autoimmune diseases).',
      ],
      ar: [
        'فحص الأجسام المضادة: افحص الأفراد بلا أعراض للنوع الأول عبر الأجسام المضادة: (IA, GAD, IA-2, ZnT8).',
        'من يستحق الفحص: يجب تقديمه لأقارب الدرجة الأولى لمرضى النوع الأول، ويمكن دراسته لعامة الناس عبر برامج الفحص المعتمدة.',
        'الأجسام المضادة المتعددة: وجود أكثر من جسم مضاد يُمثل المرحلة الأولى أو الثانية من النوع الأول، وهؤلاء لديهم خطر شبه مؤكد بنسبة 100% للإصابة السريرية.',
        'الإحالة والتأخير: حوّل المرضى بإيجابية للأجسام المضادة لمركز متخصص. يمكن استخدام علاج (Teplizumab) لتأخير ظهور السكري السريري (المرحلة 3) للمرضى المؤهلين.',
        'سكري لادا (LADA): ميّزه عن النوع الثاني بإجراء فحص الأجسام المضادة (GAD) للبالغين الذين لا تنطبق عليهم صفات النوع الثاني الكلاسيكية (مثل: وزن طبيعي، وتاريخ لأمراض مناعية).',
      ],
    },
    sourceIds: ['diagnosis-classification'],
    tags: ['classification', 'type 1 diabetes', 'autoantibodies', 'GAD', 'ZnT8', 'IA-2'],
  },
  {
    id: 'prediabetes-type2-screening',
    group: 'diagnosisClassification',
    title: {
      en: 'Prediabetes and Type 2 Diabetes Screening',
      ar: 'فحص ما قبل السكري والنوع الثاني',
    },
    summary: {
      en: 'Screening criteria based on age, BMI, and specific risk factors for asymptomatic adults and youth.',
      ar: 'معايير الفحص المعتمدة على العمر والوزن وعوامل الخطورة للبالغين والشباب بلا أعراض.',
    },
    points: {
      en: [
        'Universal Screening: Screen ALL asymptomatic adults starting at age 35.',
        'Risk-Based Adult Screening: Screen adults of any age if overweight/obese (BMI ≥25 kg/m2, or ≥23 in Asian populations) AND have ≥1 risk factor (e.g., 1st degree relative, hypertension, HDL <35, TG >250, PCOS, history of ASCVD).',
        'HIV & GDM: Screen anyone with HIV or a history of Gestational Diabetes (GDM) regardless of age/BMI.',
        'Frequency: If normal, repeat screening at a minimum of 3-year intervals. For people with prediabetes, screen yearly.',
        'Pediatric Screening: Screen asymptomatic youth starting at age 10 (or onset of puberty) if overweight/obese (BMI ≥85th percentile) AND have ≥1 risk factor (maternal GDM, family history, signs of insulin resistance).',
        'Screening Tests: FPG, 2-h PG (OGTT), and A1C are equally appropriate for screening.',
      ],
      ar: [
        'الفحص الشامل: افحص جميع البالغين بدءاً من سن 35 عاماً، حتى بدون أعراض.',
        'الفحص المبني على المخاطر: افحص في أي عمر إذا كان المريض يعاني من زيادة الوزن (BMI ≥25، أو ≥23 للآسيويين) مع عامل خطورة واحد (مثل: قريب درجة أولى، ضغط الدم، كوليسترول نافع <35، دهون ثلاثية >250، تكيس مبايض، أو تاريخ لجلطة).',
        'الـ HIV وسكري الحمل: افحص مرضى نقص المناعة، وأي سيدة لديها تاريخ سكري حمل، بغض النظر عن العمر أو الوزن.',
        'التكرار: إذا كانت النتيجة طبيعية، أعد الفحص كل 3 سنوات كحد أدنى. ولمرضى ما قبل السكري (Prediabetes)، افحصهم سنوياً.',
        'فحص الأطفال: افحص الطفل بعد سن 10 أو عند البلوغ إذا كان وزنه زائداً (BMI ≥ الشريحة 85) مع عامل خطورة إضافي (تاريخ عائلي، سكري حمل للأم، أو علامات مقاومة الأنسولين).',
        'الاختبارات: السكر الصائم، فحص التحمل السكري (OGTT)، والتراكمي مناسبون متساوون في كفاءة الفحص.',
      ],
    },
    quickDecision: {
      when: {
        en: 'Screening triggers: Age ≥35 OR (BMI ≥25 + 1 Risk Factor).',
        ar: 'دواعي الفحص: العمر ≥35 أو (زيادة وزن + عامل خطورة).',
      },
      followUp: {
        en: 'Repeat every 3 years if normal.',
        ar: 'أعد الفحص كل 3 سنوات إذا كان طبيعياً.',
      }
    },
    sourceIds: ['diagnosis-classification'],
    tags: ['prediabetes', 'type 2 diabetes', 'screening', 'risk factors', 'youth'],
  },
  {
    id: 'medication-disease-screening',
    group: 'diagnosisClassification',
    title: {
      en: 'Screening in Specific Conditions and Medication Use',
      ar: 'الفحص في حالات خاصة وعند استخدام أدوية معينة',
    },
    summary: {
      en: 'Screening recommendations for individuals on high-risk medications, with HIV, pancreatitis, cystic fibrosis, or organ transplants.',
      ar: 'توصيات الفحص لمن يتناولون أدوية عالية الخطورة، والمصابين بـ HIV، التهاب البنكرياس، التليف الكيسي، أو زراعة الأعضاء.',
    },
    points: {
      en: [
        'High-Risk Drugs: Screen for diabetes in individuals treated with statins, thiazides, atypical antipsychotics, or prolonged glucocorticoids.',
        'HIV: Screen with FPG before starting or switching antiretroviral therapy (ART), at 3–6 months after starting/switching, and annually thereafter.',
        'Post-Transplant (PTDM): Screen kidney transplant patients using OGTT, as A1C can be falsely low due to altered RBC turnover and immunosuppression. Diagnose PTDM only once the patient is stable on maintenance immunosuppression.',
        'Cystic Fibrosis (CFRD): Perform annual screening with a 2-hour OGTT starting by age 10. A1C is NOT recommended for CFRD screening due to low sensitivity.',
        'Pancreatitis: Screen for pancreatogenic diabetes (Type 3c) following acute pancreatitis or in chronic pancreatitis.',
      ],
      ar: [
        'الأدوية عالية الخطورة: افحص السكري في المرضى الذين يتعاطون الستاتينات، الثيازايد، مضادات الذهان غير النمطية، أو الكورتيزون لفترات طويلة.',
        'مرضى HIV: افحص السكر الصائم قبل بدء أو تغيير العلاج المضاد للفيروسات (ART)، وبعد 3-6 أشهر، ثم افحصهم سنوياً.',
        'بعد زراعة الأعضاء (PTDM): استخدم اختبار تحمل الجلوكوز (OGTT) حصراً لتشخيص سكري زراعة الكلى. (يُمنع التراكمي لأنه يعطي قراءة خادعة). لا تُشخِّص المرض إلا بعد استقرار المريض على جرعات مثبطات المناعة الدائمة.',
        'التليف الكيسي (CFRD): فحص سنوي باستخدام OGTT بدءاً من سن 10 سنوات. التراكمي (A1C) غير مستحسن لأنه يفشل في اكتشاف السكري المبكر في هؤلاء المرضى.',
        'التهاب البنكرياس: افحص السكري البنكرياسي (النوع 3c) بعد نوبات التهاب البنكرياس الحاد أو في حالات الالتهاب المزمن.',
      ],
    },
    sourceIds: ['diagnosis-classification'],
    tags: ['medications', 'HIV', 'pancreatitis', 'cystic fibrosis', 'transplant', 'cancer therapy'],
  },
  {
    id: 'monogenic-diabetes',
    group: 'diagnosisClassification',
    title: {
      en: 'Monogenic Diabetes',
      ar: 'السكري أحادي الجين (Monogenic Diabetes)',
    },
    summary: {
      en: 'Testing criteria for neonatal diabetes and maturity-onset diabetes of the young (MODY).',
      ar: 'معايير الفحص الجيني لسكري الأطفال حديثي الولادة وسكري البالغين الذي يظهر في الشباب (MODY).',
    },
    points: {
      en: [
        'Neonatal Diabetes: Genetic testing is mandatory for ALL infants diagnosed with diabetes in the first 6 months of life. It should also be considered for those diagnosed between 6 and 12 months.',
        'Why it matters: Many forms of neonatal diabetes (like KCNJ11 or ABCC8 mutations) can be effectively treated with oral high-dose sulfonylureas instead of insulin injections.',
        'MODY Suspicion: Suspect Maturity-Onset Diabetes of the Young (MODY) in young patients lacking typical T1D/T2D features, especially if they have a strong multi-generation autosomal dominant family history.',
        'MODY Management: Correct diagnosis alters treatment drastically. HNF1A-MODY responds excellently to low-dose sulfonylureas, while GCK-MODY typically requires no pharmacological treatment at all.',
      ],
      ar: [
        'سكري حديثي الولادة: الفحص الجيني إلزامي لجميع الرضع المشخصين بالسكري في أول 6 أشهر من حياتهم. ويُنصح به لمن يشخصون بين 6 إلى 12 شهراً.',
        'لماذا هو مهم؟ أشكال كثيرة من سكري الرضع (طفرات KCNJ11/ABCC8) تُعالج بأقراص السلفونيل يوريا بجرعات عالية وبفعالية، مما يغني الرضيع عن إبر الأنسولين.',
        'الاشتباه بـ MODY: اشتبه به في الشباب والأطفال الذين لا يحملون خصائص النوع الأول أو الثاني، وخاصة إذا كان السكري يتوارث في العائلة عبر أجيال متتالية (وراثة سائدة).',
        'إدارة MODY: التشخيص الصحيح يغير العلاج تماماً. مرضى HNF1A-MODY يستجيبون بامتياز لجرعة صغيرة من السلفونيل يوريا، بينما مرضى GCK-MODY غالباً لا يحتاجون لأي علاج دوائي.',
      ],
    },
    sourceIds: ['diagnosis-classification'],
    tags: ['monogenic', 'MODY', 'neonatal diabetes', 'genetic testing'],
  },
  {
    id: 'gdm-diagnosis',
    group: 'diagnosisClassification',
    title: {
      en: 'Gestational Diabetes Screening and Diagnosis',
      ar: 'فحص وتشخيص سكري الحمل (GDM)',
    },
    summary: {
      en: 'Screening and diagnosis strategies for pregnant individuals, including postpartum follow-up.',
      ar: 'استراتيجيات الفحص والتشخيص للحوامل، ومتابعة ما بعد الولادة.',
    },
    points: {
      en: [
        'Early Screening: Screen individuals with risk factors for diabetes at their first prenatal visit (ideally <15 weeks). If diagnosed before 15 weeks, classify as pre-existing Type 2 diabetes, not GDM.',
        'Universal Screening: Screen ALL pregnant individuals not previously known to have diabetes at 24–28 weeks of gestation using either a 1-step (75g OGTT) or 2-step (50g followed by 100g OGTT) approach.',
        'OGTT 1-Step Cutoffs (Fasting/1h/2h): ≥92, ≥180, ≥153 mg/dL. One abnormal value confirms GDM.',
        'Postpartum Screening: Screen women with a history of GDM at 4–12 weeks postpartum for prediabetes/diabetes using a 75-g OGTT (A1C is NOT recommended this early).',
        'Lifelong Follow-up: Women with a history of GDM should have lifelong screening every 1–3 years. If they develop prediabetes, intensive lifestyle interventions and Metformin are strongly recommended to prevent T2D.',
      ],
      ar: [
        'الفحص المبكر: افحص الحوامل ذوات عوامل الخطورة في أول زيارة للحمل (يفضل قبل الأسبوع 15). إذا شُخّصت قبل الأسبوع 15، يُعتبر سكري نوع ثاني مسبق وليس سكري حمل.',
        'الفحص الشامل (الروتين): افحص جميع الحوامل في الأسبوع 24-28 باستخدام اختبار 75 جم (1-step) أو اختبار الخطوتين (50 جم ثم 100 جم).',
        'معايير OGTT (خطوة واحدة): صائم ≥ 92، أو بعد ساعة ≥ 180، أو بعد ساعتين ≥ 153 مجم/ديسيلتر. قيمة واحدة غير طبيعية تكفي لتأكيد سكري الحمل.',
        'بعد الولادة: افحص جميع من أُصبن بسكري الحمل بعد 4-12 أسبوعاً باستخدام (OGTT). لا يُعتمد على التراكمي في هذه الفترة المبكرة.',
        'متابعة مدى الحياة: النساء ذوات تاريخ سكري حمل يحتجن لفحص دوري كل 1-3 سنوات. إذا ظهر لديهن "ما قبل السكري"، يُنصح بشدة بالميتفورمين وننمط الحياة المكثف لمنع النوع الثاني.',
      ],
    },
    quickDecision: {
      when: {
        en: 'High risk? Screen <15 weeks. Universal screen: 24-28 weeks.',
        ar: 'عوامل خطورة؟ افحص قبل 15 أسبوع. الروتين للجميع: 24-28 أسبوع.',
      },
      followUp: {
        en: 'Postpartum: 4-12 weeks OGTT.',
        ar: 'بعد الولادة: 4-12 أسبوع بـ OGTT.',
      }
    },
    sourceIds: ['diagnosis-classification'],
    tags: ['GDM', 'pregnancy', 'postpartum', 'screening'],
  },
];
