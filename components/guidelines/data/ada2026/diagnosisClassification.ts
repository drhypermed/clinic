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
        'FPG ≥126 mg/dL, or 2-h PG ≥200 mg/dL during OGTT, or A1C ≥6.5%, or Random PG ≥200 mg/dL with classic symptoms.',
        'Always confirm with a second test unless unequivocally symptomatic.',
        'If blood glucose and A1C are discordant, trust plasma glucose.',
        'Use plasma glucose (not A1C) in pregnancy, G6PD deficiency, HIV, or altered RBC turnover.',
      ],
      ar: [
        'التشخيص: صائم ≥126، أو بعد ساعتين (OGTT) ≥200، أو تراكمي ≥6.5%، أو عشوائي ≥200 مع أعراض كلاسيكية.',
        'قم دائماً بتأكيد التشخيص باختبار ثانٍ، إلا إذا كانت الأعراض قاطعة وواضحة.',
        'إذا كان هناك تعارض بين قراءات السكر والتراكمي، اعتمد على جلوكوز البلازما.',
        'استخدم جلوكوز البلازما (وليس التراكمي) في حالات الحمل، نقص G6PD، الـ HIV، وتكسر الدم.',
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
        'Screen asymptomatic patients for Type 1 if they have a family history or known high genetic risk using autoantibodies (IA, GAD, IA-2, ZnT8).',
        'If one or more autoantibodies are positive, evaluate closely for progression to clinical Type 1.',
        'Refer patients with multiple autoantibodies to a specialized center immediately.',
      ],
      ar: [
        'افحص الأقارب من الدرجة الأولى أو المعرضين لخطر جيني عالٍ باستخدام الأجسام المضادة (IA, GAD, IA-2, ZnT8) لاكتشاف النوع الأول مبكراً.',
        'إذا ظهرت نتيجة إيجابية لجسم مضاد أو أكثر، راقب المريض عن كثب لتطور السكري السريري.',
        'قم بإحالة المرضى الذين لديهم عدة أجسام مضادة إيجابية لمركز متخصص فوراً لارتفاع خطر تقدم المرض.',
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
        'Screen ALL adults starting at age 35.',
        'Screen ANY adult regardless of age if Overweight/Obese (BMI ≥25, or ≥23 in Asian Americans) AND has 1+ risk factor.',
        'Use FPG, A1C, or OGTT. If normal, repeat at least every 3 years.',
        'Youth: Screen if Overweight/Obese + 1 risk factor, starting at puberty or age 10.',
      ],
      ar: [
        'افحص جميع البالغين بدءاً من سن 35 عاماً.',
        'افحص في أي عمر إذا كان المريض يعاني من زيادة الوزن (BMI ≥25) مع وجود عامل خطورة واحد على الأقل.',
        'استخدم السكر الصائم، التراكمي، أو OGTT. إذا كانت النتيجة طبيعية، أعد الفحص كل 3 سنوات.',
        'الأطفال: افحص بعد سن 10 أو عند البلوغ إذا كان هناك زيادة وزن مع عامل خطورة إضافي.',
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
        'High-Risk Drugs: Screen patients on statins, thiazides, atypical antipsychotics, or prolonged glucocorticoids.',
        'HIV: Screen with FPG before starting/switching ART, at 3–6 months, then annually.',
        'Post-Transplant: Use OGTT to diagnose PTDM once the patient is stable on immunosuppression.',
        'Cystic Fibrosis: Annual screening with OGTT starting by age 10.',
      ],
      ar: [
        'الأدوية عالية الخطورة: افحص من يتعاطون الستاتينات، الثيازايد، مضادات الذهان، أو الكورتيزون لفترات طويلة.',
        'مرضى HIV: افحص السكر الصائم قبل بدء/تغيير العلاج، وبعد 3-6 أشهر، ثم سنوياً.',
        'بعد زراعة الأعضاء: استخدم OGTT لتشخيص السكري بعد استقرار حالة المريض على مثبطات المناعة.',
        'التليف الكيسي: فحص سنوي بـ OGTT بدءاً من سن 10 سنوات.',
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
        'Test ALL infants diagnosed with diabetes in the first 6 months of life for neonatal diabetes genetics.',
        'Suspect MODY in children/young adults lacking typical Type 1 or Type 2 features, especially with a strong multi-generation family history.',
      ],
      ar: [
        'قم بإجراء فحص جيني لجميع الرضع الذين يُشخصون بالسكري في أول 6 أشهر من حياتهم.',
        'اشتبه في MODY للأطفال والشباب الذين لا تظهر عليهم صفات النوع الأول أو الثاني، خاصة مع وجود تاريخ عائلي قوي عبر عدة أجيال.',
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
        'Screen before 15 weeks if high-risk. Screen universally at 24–28 weeks.',
        'Postpartum: Screen all GDM patients at 4–12 weeks using 75-g OGTT.',
        'Lifelong follow-up: Screen every 1–3 years for patients with a history of GDM.',
      ],
      ar: [
        'افحص الحوامل ذوات عوامل الخطورة قبل الأسبوع 15. افحص الجميع روتينياً في الأسبوع 24-28.',
        'بعد الولادة: افحص جميع المصابات بـ GDM بعد 4-12 أسبوعاً باستخدام OGTT 75g.',
        'متابعة مدى الحياة: افحص دورياً كل 1-3 سنوات لأي امرأة أصيبت بـ GDM سابقاً.',
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
