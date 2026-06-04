import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_2_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch2-criteria',
    group: '2. Diagnosis and Classification of Diabetes',
    sourceIds: ['2-diagnosis-and-classification-of-diabetes-pdf', 'diagnosis'],
    tags: ['A1C', 'Diagnostic Criteria', 'FPG', 'OGTT'],
    title: {
      en: 'Diagnostic Criteria: When to Rely on Which Test?',
      ar: 'معايير التشخيص: متى نعتمد على أي تحليل؟'
    },
    summary: {
      en: 'Standard criteria are known (A1C ≥ 6.5%, FPG ≥ 126, OGTT ≥ 200, Random ≥ 200), but the guidelines highlight nuanced points regarding when A1C is misleading.',
      ar: 'الأساسيات معروفة للجميع (السكر التراكمي ≥ 6.5%، أو الصائم ≥ 126، أو بعد ساعتين من الفحص الفموي ≥ 200، أو العشوائي ≥ 200 مع أعراض كلاسيكية)، لكن الدليل يضع نقاطاً دقيقة متى يكون التراكمي مضللاً.'
    },
    points: {
      en: [
        'Beware of A1C: It depends on RBC lifespan and can be misleading in pregnancy, G6PD deficiency, HIV, dialysis, anemia, or hemoglobinopathies (e.g., sickle cell).',
        'Alternative to A1C: In such conditions, rely exclusively on plasma glucose (Fasting or OGTT) rather than A1C.',
        'Test Discordance: If there is discordance between A1C and plasma glucose, search for the underlying cause of the discrepancy and consider alternative markers like Fructosamine.'
      ],
      ar: [
        'احذر من التراكمي (A1C) في حالات معينة: السكر التراكمي يعتمد على دورة حياة خلايا الدم الحمراء، لذا قد يعطي نتائج مضللة في حالات: الحمل، نقص إنزيم (G6PD)، (HIV)، غسيل الكلى، الأنيميا، أو اختلالات الهيموجلوبين الجينية (خلات الخلية المنجلية).',
        'البديل للتراكمي: في هذه الحالات، يجب الاعتماد على قياس جلوكوز البلازما (الصائم أو الفحص الفموي) بدلاً من التراكمي.',
        'التعارض بين التحاليل: إذا كان هناك تعارض بين قراءة السكر في الدم والتراكمي، يجب البحث عن السبب الأساسي للتعارض، ويمكن اللجوء لمؤشرات أخرى مثل الفركتوزامين للمتابعة.'
      ]
    }
  },
  {
    id: 'ada-2026-ch2-classification',
    group: '2. Diagnosis and Classification of Diabetes',
    sourceIds: ['2-diagnosis-and-classification-of-diabetes-pdf', 'diagnosis'],
    tags: ['Misdiagnosis', 'Type 1 vs Type 2', 'AABBCC'],
    title: {
      en: 'Classification of Diabetes: Beyond Traditional Molds',
      ar: 'تصنيف السكري: وداعاً للقوالب القديمة!'
    },
    summary: {
      en: 'The traditional classification (Type 1 for kids, Type 2 for adults) is no longer accurate. Both types appear at all ages, leading to high misdiagnosis rates.',
      ar: 'يشير الدليل بقوة إلى أن التصنيف التقليدي (النوع الأول للأطفال والنوع الثاني للبالغين) لم يعد دقيقاً، فكلا النوعين يظهران في جميع الأعمار.'
    },
    points: {
      en: [
        'Common Adult Misdiagnosis: Up to 40% of adults newly presenting with Type 1 Diabetes are mistakenly diagnosed as Type 2.',
        'Differentiation: Use the AABBCC approach or look for clinical signs in adults: Age < 35, BMI < 25, unexplained weight loss, DKA, or initial glucose > 360 mg/dL.',
        'Diagnostic Confirmation: In cases of doubt, measure pancreatic autoantibodies (e.g., GAD, IA-2) and assess pancreatic reserve using C-peptide.'
      ],
      ar: [
        'الخطأ الشائع في تشخيص البالغين: نسبة تصل إلى 40% من البالغين المصابين حديثاً بالنوع الأول يتم تشخيصهم بالخطأ على أنهم نوع ثاني.',
        'كيف يتم التفريق؟ الانتباه لعلامات النوع الأول في البالغين: العمر أقل من 35، مؤشر كتلة الجسم (BMI) أقل من 25، فقدان وزن غير مبرر، وجود حموضة كيتونية (DKA)، وسكر ابتدائي أعلى من 360 مجم/ديسيلتر.',
        'تأكيد التشخيص: في حالات الشك، يجب قياس الأجسام المضادة (مثل GAD و IA-2) واختبار كفاءة البنكرياس (C-peptide).'
      ]
    }
  },
  {
    id: 'ada-2026-ch2-t1d-staging',
    group: '2. Diagnosis and Classification of Diabetes',
    sourceIds: ['2-diagnosis-and-classification-of-diabetes-pdf', 'diagnosis'],
    tags: ['Type 1 Staging', 'Autoantibodies', 'Teplizumab'],
    title: {
      en: 'Staging of Type 1 Diabetes',
      ar: 'مراحل السكري من النوع الأول (Staging of Type 1)'
    },
    summary: {
      en: 'Type 1 Diabetes is no longer diagnosed only at symptom onset; it progresses through three distinct stages that can be monitored.',
      ar: 'السكري من النوع الأول لم يعد يٌشخص فقط عند ظهور الأعراض، بل يمر بثلاث مراحل يمكن رصدها.'
    },
    points: {
      en: [
        'Stage 1: Presence of pancreatic autoantibodies (two or more) with normal blood glucose (asymptomatic).',
        'Stage 2: Presence of autoantibodies with dysglycemia (prediabetes) but still asymptomatic.',
        'Stage 3: Obvious clinical diabetes with symptoms and hyperglycemia.',
        'Clinical Value: Screening first-degree relatives allows early detection, prevents DKA, and opens the door for therapies that delay onset (e.g., Teplizumab).'
      ],
      ar: [
        'المرحلة 1: وجود أجسام مضادة للبنكرياس (اثنان أو أكثر) مع مستوى سكر طبيعي (بدون أعراض).',
        'المرحلة 2: وجود أجسام مضادة مع اختلال في مستويات السكر (مقدمات السكري) ولكن دون أعراض.',
        'المرحلة 3: السكري السريري الواضح بالأعراض وارتفاع السكر.',
        'الأهمية السريرية: فحص الأقارب يسمح باكتشاف المرض مبكراً وتجنب الحموضة الكيتونية، ويفتح الباب لاستخدام علاجات تؤخر ظهور المرض (مثل Teplizumab).'
      ]
    }
  },
  {
    id: 'ada-2026-ch2-screening',
    group: '2. Diagnosis and Classification of Diabetes',
    sourceIds: ['2-diagnosis-and-classification-of-diabetes-pdf', 'diagnosis'],
    tags: ['Screening', 'Prediabetes', 'T2D'],
    title: {
      en: 'Prediabetes and Type 2 Diabetes Screening',
      ar: 'فحص مقدمات السكري والنوع الثاني'
    },
    summary: {
      en: 'Guidelines dictate clear age and risk-based screening protocols, while highlighting medications that induce insulin resistance.',
      ar: 'يحدد الدليل بروتوكولات واضحة للفحص بناءً على العمر وعوامل الخطر، مع تسليط الضوء على الأدوية المسببة للسكري.'
    },
    points: {
      en: [
        'Screening Age: Routine screening should begin for everyone at age 35.',
        'Early Screening: Test adults of any age with overweight/obesity (BMI ≥ 25) and at least one risk factor (e.g., family history, hypertension, PCOS).',
        'Diabetes-Inducing Medications: It is important to monitor patients on medications that increase insulin resistance (Corticosteroids, Statins, Thiazides, 2nd-gen Antipsychotics, HIV meds).'
      ],
      ar: [
        'سن الفحص: يجب أن يبدأ الفحص الروتيني للجميع عند سن 35 عاماً.',
        'الفحص المبكر: يجب فحص البالغين في أي عمر إذا كان لديهم زيادة في الوزن أو سمنة (BMI ≥ 25) مع عامل خطر واحد على الأقل (مثل تاريخ عائلي، ضغط الدم، تكيس المبايض).',
        'الأدوية المسببة للسكري: يجب الانتباه للمرضى الذين يتناولون أدوية تزيد مقاومة الإنسولين، مثل: الكورتيزون، أدوية الكوليسترول (Statins)، مدرات البول، مضادات الذهان، وعلاجات HIV.'
      ]
    }
  },
  {
    id: 'ada-2026-ch2-oncology',
    group: '2. Diagnosis and Classification of Diabetes',
    sourceIds: ['2-diagnosis-and-classification-of-diabetes-pdf', 'diagnosis'],
    tags: ['Oncology', 'ICI', 'Anti-Cancer Therapy'],
    title: {
      en: 'Anti-Cancer Therapy-Induced Diabetes',
      ar: 'السكري الناتج عن علاجات الأورام الحديثة'
    },
    summary: {
      en: 'A highly critical and modern point for internal medicine and endocrinology regarding the metabolic side effects of newer immunotherapies.',
      ar: 'نقطة حديثة وبالغة الأهمية لأطباء الباطنة والغدد الصماء حول التدمير المناعي لخلايا بيتا بسبب علاجات الأورام الحديثة.'
    },
    points: {
      en: [
        'Immune Checkpoint Inhibitors (ICIs): Drugs like PD-1/PDL-1 inhibitors can cause rapid autoimmune destruction of beta cells, leading to sudden Type 1-like diabetes, often presenting with DKA and requiring lifelong insulin.',
        'Targeted Therapies: Routine glucose monitoring is mandatory for oncology patients receiving ICIs or PI3Kα and mTOR inhibitors to catch hyperglycemia early.'
      ],
      ar: [
        'العلاجات المناعية للأورام (ICIs): مثل (PD-1 / PDL-1) قد تسبب دماراً مناعياً سريعاً لخلايا بيتا، مما يؤدي لظهور سكري مفاجئ يشبه النوع الأول يترافق غالباً مع (DKA) ويحتاج لإنسولين مدى الحياة.',
        'المراقبة الدورية: يجب فحص السكر بشكل روتيني ودوري لمرضى الأورام الذين يتلقون هذه العلاجات أو مثبطات (PI3Kα) و(mTOR) لتدارك الأمر مبكراً.'
      ]
    }
  },
  {
    id: 'ada-2026-ch2-type3c',
    group: '2. Diagnosis and Classification of Diabetes',
    sourceIds: ['2-diagnosis-and-classification-of-diabetes-pdf', 'diagnosis'],
    tags: ['Type 3c', 'Pancreatitis', 'Exocrine'],
    title: {
      en: 'Pancreatic / Type 3c Diabetes',
      ar: 'سكري أمراض البنكرياس الخارجي (Type 3c)'
    },
    summary: {
      en: 'Diabetes resulting from pancreatic exocrine disease is frequently misdiagnosed as Type 2, requiring a fundamentally different management approach.',
      ar: 'يحدث نتيجة التهاب البنكرياس أو استئصاله، وغالباً ما يتم تشخيصه خطأً كنوع ثاني.'
    },
    points: {
      en: [
        'Causes: Results from acute/chronic pancreatitis, pancreatectomy, or Cystic Fibrosis.',
        'Diagnostic Clue: The differentiating marker from Type 2 is the presence of pancreatic exocrine insufficiency (malabsorption).',
        'Clinical Advice: In these patients, avoid diabetes medications that increase pancreatitis risk (like incretin therapies) and initiate insulin therapy early.'
      ],
      ar: [
        'الأسباب: يحدث نتيجة التهاب البنكرياس (الحاد أو المزمن)، استئصال البنكرياس، أو التليف الكيسي.',
        'العلامة الفارقة: يتم تشخيصه خطأً كنوع ثاني، والعلامة الفارقة هي قصور إفرازات البنكرياس الهاضمة (Exocrine insufficiency).',
        'نصيحة سريرية: يجب تجنب أدوية السكر التي قد تزيد من خطر التهاب البنكرياس (مثل علاجات الإنكريتين)، ويُنصح ببدء الإنسولين مبكراً.'
      ]
    }
  },
  {
    id: 'ada-2026-ch2-mody',
    group: '2. Diagnosis and Classification of Diabetes',
    sourceIds: ['2-diagnosis-and-classification-of-diabetes-pdf', 'diagnosis'],
    tags: ['MODY', 'Monogenic', 'Neonatal'],
    title: {
      en: 'Monogenic Diabetes (MODY) and Neonatal Diabetes',
      ar: 'السكري الجيني (Monogenic Diabetes / MODY)'
    },
    summary: {
      en: 'Monogenic diabetes represents <5% of cases. Identifying it drastically changes management, potentially eliminating the need for insulin injections.',
      ar: 'يمثل أقل من 5% من الحالات، ومتى يُشتبه في وجود خلل جيني وليس نوعاً أول أو ثاني؟'
    },
    points: {
      en: [
        'Neonatal Diabetes: Any infant diagnosed with diabetes before 6 months of age MUST undergo immediate genetic testing.',
        'Treatment Shift: Identifying specific mutations (e.g., KCNJ11) means the infant can be successfully treated with oral sulfonylureas instead of insulin injections.',
        'MODY: Suspect Maturity-Onset Diabetes of the Young if presenting with mild, stable diabetes at a young age (< 25 years), without obesity, negative autoantibodies, and a strong, multi-generational autosomal dominant family history.'
      ],
      ar: [
        'سكري حديثي الولادة: أي طفل يُشخص بالسكري قبل سن 6 أشهر يجب أن يخضع لفحص جيني فوراً.',
        'تغيير العلاج: تشخيص بعض الطفرات (مثل KCNJ11) يعني إمكانية علاج الطفل بـ "السلفونيل يوريا" الفموية بدلاً من حقن الإنسولين.',
        'الـ MODY: يُشتبه به عند ظهور سكري خفيف ومستقر في سن مبكر (قبل 25 عاماً) دون سمنة ودون أجسام مضادة، مع تاريخ عائلي قوي ومتسلسل (وراثة سائدة).'
      ]
    }
  },
  {
    id: 'ada-2026-ch2-ptdm',
    group: '2. Diagnosis and Classification of Diabetes',
    sourceIds: ['2-diagnosis-and-classification-of-diabetes-pdf', 'diagnosis'],
    tags: ['PTDM', 'Post-Transplant', 'Immunosuppressants'],
    title: {
      en: 'Post-Transplant Diabetes Mellitus (PTDM)',
      ar: 'سكري ما بعد زراعة الأعضاء (PTDM)'
    },
    summary: {
      en: 'High doses of corticosteroids and immunosuppressants post-transplant induce severe hyperglycemia, which requires careful diagnostic timing.',
      ar: 'يحدث ارتفاع كبير في السكر فور زراعة الأعضاء بسبب الكورتيزون وأدوية المناعة.'
    },
    points: {
      en: [
        'Diagnostic Timing: Guidelines advise against diagnosing a patient with definitive "PTDM" until they are stable on their maintenance immunosuppressive regimen (usually after 3 months).',
        'Testing Modality: The oral glucose tolerance test (OGTT) is preferred for an accurate diagnosis once stable.'
      ],
      ar: [
        'توقيت التشخيص: لا ينصح الدليل بتشخيص المريض بـ "سكري ما بعد الزراعة" إلا بعد أن تستقر حالته وخطة علاجه المناعي (عادة بعد 3 أشهر).',
        'طريقة الفحص: يفضل استخدام اختبار تحمل الجلوكوز الفموي (OGTT) للتشخيص الدقيق.'
      ]
    }
  },
  {
    id: 'ada-2026-ch2-gdm',
    group: '2. Diagnosis and Classification of Diabetes',
    sourceIds: ['2-diagnosis-and-classification-of-diabetes-pdf', 'diagnosis'],
    tags: ['GDM', 'Pregnancy', 'Postpartum'],
    title: {
      en: 'Gestational Diabetes Mellitus (GDM)',
      ar: 'سكري الحمل (Gestational Diabetes)'
    },
    summary: {
      en: 'Proper screening protocols during and after pregnancy are critical to preventing long-term maternal and fetal complications.',
      ar: 'بروتوكولات الفحص الصارمة أثناء وبعد الحمل لمنع المضاعفات الجسيمة على الأم والجنين.'
    },
    points: {
      en: [
        'Early Screening: Women with high risk factors (obesity, family history) should be screened early (<15 weeks) to detect undiagnosed pre-pregnancy diabetes.',
        'Routine Screening: Universal screening for all pregnant women occurs between 24 and 28 weeks.',
        'Postpartum Follow-up: Women with GDM face a massive lifetime risk for Type 2 Diabetes. They MUST be screened at 4-12 weeks postpartum, followed by lifelong screening every 1-3 years.'
      ],
      ar: [
        'الفحص المبكر: النساء ذوات عوامل الخطر العالية (مثل السمنة أو تاريخ عائلي) يجب فحصهن مبكراً (قبل الأسبوع 15) لاكتشاف أي سكري غير مشخص قبل الحمل.',
        'الفحص الروتيني: الفحص الروتيني لجميع الحوامل يتم بين الأسبوع 24 و28.',
        'نقطة هامة بعد الولادة: السيدات اللاتي أصبن بسكري الحمل لديهن خطر كبير جداً للإصابة بالنوع الثاني لاحقاً، ويجب فحصهن بعد 4-12 أسبوعاً، ثم فحص دوري مدى الحياة كل 1-3 سنوات.'
      ]
    }
  },
  {
    id: 'ada-2026-ch2-conclusion',
    group: '2. Diagnosis and Classification of Diabetes',
    sourceIds: ['2-diagnosis-and-classification-of-diabetes-pdf', 'diagnosis'],
    tags: ['Conclusion', 'Summary'],
    title: {
      en: 'Conclusion',
      ar: 'الخلاصة'
    },
    summary: {
      en: 'Chapter 2 emphasizes that classifying a diabetic patient is no longer a routine procedure. Identifying atypical signs (like antibodies in lean adults, pancreatitis history, or oncology meds) completely alters the treatment pathway, saving the patient from a costly misdiagnosis.',
      ar: 'يؤكد الفصل الثاني على أن التصنيف لم يعد روتينياً. البحث الدقيق عن العلامات غير التقليدية (كالأجسام المضادة في البالغين النحاف أو أدوية الأورام) يغير مسار العلاج وينقذ المريض من تشخيص خاطئ.'
    },
    points: {
      en: [],
      ar: []
    }
  }
];
