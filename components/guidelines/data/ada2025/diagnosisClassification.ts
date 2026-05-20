import type { GuidelineTopic } from '../../guidelinesData';

export const ADA_2025_DIAGNOSIS_TOPICS: GuidelineTopic[] = [
  {
    id: 'diagnostic-criteria',
    group: 'diagnosisClassification',
    title: {
      en: 'Diagnostic Criteria in Nonpregnant Individuals',
      ar: 'معايير التشخيص خارج الحمل',
    },
    summary: {
      en: 'Diabetes can be diagnosed by A1C or venous plasma glucose criteria, with confirmation unless hyperglycemia is unequivocal.',
      ar: 'يمكن تشخيص السكري باستخدام HbA1c أو قياسات الجلوكوز في البلازما الوريدية، مع تأكيد التشخيص ما لم يكن فرط السكر واضحا بلا لبس.',
    },
    points: {
      en: [
        'Diagnostic thresholds are A1C >=6.5%, fasting plasma glucose >=126 mg/dL, 2-hour plasma glucose during 75-g OGTT >=200 mg/dL, or random plasma glucose >=200 mg/dL with classic symptoms or hyperglycemic crisis.',
        'Fasting means no caloric intake for at least 8 hours.',
        'In the absence of unequivocal hyperglycemia, diagnosis requires two abnormal results, either from different tests at the same time or the same test at different time points.',
        'If two tests are discordant, repeat the abnormal test and interpret A1C or glucose with attention to conditions that may affect accuracy.',
        'Near-threshold results should prompt education about symptoms and repeat testing in 3-6 months.',
      ],
      ar: [
        'عتبات التشخيص هي HbA1c >=6.5%، أو FPG >=126 mg/dL، أو سكر ساعتين في OGTT 75 g >=200 mg/dL، أو سكر عشوائي >=200 mg/dL مع أعراض كلاسيكية أو أزمة فرط سكر.',
        'الصيام يعني عدم تناول سعرات لمدة 8 ساعات على الأقل.',
        'في غياب فرط سكر واضح بلا لبس، يحتاج التشخيص نتيجتين غير طبيعيتين؛ إما من اختبارين مختلفين في نفس الوقت أو من نفس الاختبار في توقيتين مختلفين.',
        'إذا كانت النتائج متعارضة، يعاد الاختبار غير الطبيعي مع الانتباه للعوامل التي قد تؤثر على دقة HbA1c أو الجلوكوز.',
        'النتائج القريبة من الحد التشخيصي تستدعي توعية المريض بالأعراض وإعادة الاختبار خلال 3-6 أشهر.',
      ],
    },
    details: [
      {
        title: { en: 'Diagnostic cutoffs to show in the clinic', ar: 'الحدود التشخيصية التي تظهر للطبيب' },
        items: {
          en: [
            'Diabetes: A1C >=6.5%, FPG >=126 mg/dL, 2-h PG during 75-g OGTT >=200 mg/dL, or random plasma glucose >=200 mg/dL with classic symptoms or crisis.',
            'Prediabetes: A1C 5.7-6.4%, FPG 100-125 mg/dL, or 2-h PG 140-199 mg/dL during 75-g OGTT.',
            'A diagnostic OGTT should use 75 g anhydrous glucose equivalent dissolved in water and venous plasma glucose measurement.',
          ],
          ar: [
            'السكري: HbA1c >=6.5% أو FPG >=126 mg/dL أو سكر ساعتين في OGTT 75 g >=200 mg/dL أو سكر عشوائي >=200 mg/dL مع أعراض كلاسيكية أو أزمة فرط سكر.',
            'ما قبل السكري: HbA1c 5.7-6.4% أو FPG 100-125 mg/dL أو سكر ساعتين 140-199 mg/dL في OGTT 75 g.',
            'اختبار OGTT التشخيصي يستخدم ما يعادل 75 g جلوكوز لا مائي مذاب في الماء مع قياس الجلوكوز في البلازما الوريدية.',
          ],
        },
      },
      {
        title: { en: 'Confirmation logic', ar: 'منطق تأكيد التشخيص' },
        items: {
          en: [
            'If there is no unequivocal hyperglycemia, confirm with two abnormal results from the same sample, two different tests, or repeat testing.',
            'If A1C and glucose disagree, repeat the abnormal result and evaluate for A1C interference, altered red-cell turnover, or laboratory issues.',
          ],
          ar: [
            'عند غياب فرط سكر واضح، يؤكد التشخيص بنتيجتين غير طبيعيتين: من نفس العينة باختبارين، أو من اختبارين مختلفين، أو بإعادة الاختبار.',
            'إذا تعارض HbA1c مع الجلوكوز، يعاد الاختبار غير الطبيعي ويتم تقييم تداخلات HbA1c أو تغير دوران كريات الدم أو مشاكل المعمل.',
          ],
        },
      },
    ],
    practiceNote: {
      en: 'Do not diagnose from a single borderline lab in an asymptomatic person; repeat and look for interference or discordance.',
      ar: 'لا تشخص من تحليل واحد حدودي عند شخص بلا أعراض؛ أعد الاختبار وابحث عن التداخل أو التعارض بين النتائج.',
    },
    quickDecision: {
      when: {
        en: 'When a patient presents with symptoms or routine lab results showing elevated glucose.',
        ar: 'عند قدوم المريض بأعراض أو نتائج معملية روتينية تظهر ارتفاع السكر.',
      },
      start: {
        en: 'Request FPG, A1C, or OGTT, and look for a second abnormal result for confirmation.',
        ar: 'اطلب FPG أو HbA1c أو OGTT، وابحث عن نتيجة ثانية غير طبيعية لتأكيد التشخيص.',
      },
      followUp: {
        en: 'In 3-6 months if results are borderline.',
        ar: 'بعد 3-6 أشهر إذا كانت النتائج على الحدود.',
      },
      warn: {
        en: 'Never diagnose an asymptomatic patient based on a single borderline laboratory test.',
        ar: 'لا تشخص مريضا بلا أعراض بناءً على تحليل معملي واحد حدودي أبداً.',
      },
    },
    sourceIds: ['diagnosis-classification'],
    tags: ['diagnosis', 'A1C', 'FPG', 'OGTT', 'confirmation'],
  },
  {
    id: 'a1c-use-limitations',
    group: 'diagnosisClassification',
    title: {
      en: 'Using A1C Safely',
      ar: 'الاستخدام الآمن لـ HbA1c',
    },
    summary: {
      en: 'A1C is useful, but ADA 2025 stresses assay quality and situations where plasma glucose criteria are preferred.',
      ar: 'HbA1c مفيد، لكن ADA 2025 تؤكد جودة طريقة القياس والحالات التي يفضل فيها الاعتماد على قياسات الجلوكوز.',
    },
    points: {
      en: [
        'A1C should be measured by an NGSP-certified method traceable to the DCCT reference assay.',
        'Point-of-care A1C for screening or diagnosis should be limited to FDA-approved diagnostic devices in appropriately certified laboratories with trained personnel.',
        'Major discordance between glucose values and A1C should trigger evaluation for assay or biologic interference.',
        'Use plasma glucose criteria in conditions that alter the relationship between A1C and glycemia, including some hemoglobin variants, pregnancy, G6PD deficiency, HIV, hemodialysis, recent blood loss or transfusion, hemolysis, or erythropoietin therapy.',
      ],
      ar: [
        'ينبغي قياس HbA1c بطريقة معتمدة من NGSP ومطابقة لمرجعية DCCT.',
        'استخدام HbA1c السريع في نقطة الرعاية للفحص أو التشخيص يجب أن يقتصر على أجهزة معتمدة تشخيصيا من FDA داخل معامل مؤهلة وبواسطة أفراد مدربين.',
        'أي تعارض كبير ومستمر بين قراءات الجلوكوز وHbA1c يستدعي البحث عن تداخل في الاختبار أو سبب بيولوجي.',
        'يفضل استخدام معايير الجلوكوز في الحالات التي تغير علاقة HbA1c بالسكر مثل بعض متغيرات الهيموجلوبين، والحمل، ونقص G6PD، وHIV، والغسيل الكلوي، والنزف أو نقل الدم الحديث، والانحلال الدموي، أو علاج erythropoietin.',
      ],
    },
    sourceIds: ['diagnosis-classification'],
    tags: ['A1C', 'NGSP', 'DCCT', 'interference', 'plasma glucose'],
  },
  {
    id: 'classification-type1',
    group: 'diagnosisClassification',
    title: {
      en: 'Classification and Type 1 Diabetes Screening',
      ar: 'التصنيف وفحص السكري من النوع الأول',
    },
    summary: {
      en: 'ADA 2025 emphasizes pragmatic classification and autoantibody-based screening when type 1 diabetes risk or overlap is present.',
      ar: 'تؤكد ADA 2025 التصنيف العملي، واستخدام فحص الأجسام المضادة عند وجود خطر للنوع الأول أو تداخل في الصفات.',
    },
    points: {
      en: [
        'Hyperglycemia should be classified into the most appropriate diagnostic category to support personalized management.',
        'Conventional categories include type 1 diabetes, type 2 diabetes, specific diabetes types from other causes, and gestational diabetes.',
        'Screening for presymptomatic type 1 diabetes may use autoantibodies to insulin, GAD, IA-2, or ZnT8.',
        'Autoantibody screening should be offered to people with a family history of type 1 diabetes or otherwise known elevated genetic risk.',
        'Multiple confirmed islet autoantibodies indicate increased clinical diabetes risk; dysglycemia testing helps forecast near-term risk and should prompt consideration of specialist referral.',
        'In adults with overlapping features, such as younger age, unintentional weight loss, ketoacidosis, or rapid need for insulin, standardized islet autoantibody tests are recommended for classification.',
      ],
      ar: [
        'ينبغي تصنيف فرط السكر في الفئة التشخيصية الأنسب لدعم الإدارة الفردية.',
        'الفئات التقليدية تشمل النوع الأول، والنوع الثاني، وأنواعا محددة بسبب أسباب أخرى، وسكري الحمل.',
        'يمكن فحص النوع الأول قبل الأعراض بقياس الأجسام المضادة للإنسولين أو GAD أو IA-2 أو ZnT8.',
        'ينبغي عرض فحص الأجسام المضادة على من لديهم تاريخ عائلي للنوع الأول أو خطر جيني مرتفع معروف.',
        'وجود عدة أجسام مضادة مؤكدة لخلايا الجزر يعني خطرا أعلى لظهور السكري؛ واختبار dysglycemia يساعد في تقدير الخطر القريب ويستدعي التفكير في إحالة متخصصة.',
        'في البالغين ذوي الصفات المتداخلة، مثل السن الأصغر، أو فقدان الوزن غير المقصود، أو ketoacidosis، أو الحاجة السريعة للإنسولين، يوصى بفحوصات الأجسام المضادة القياسية للمساعدة في التصنيف.',
      ],
    },
    practiceNote: {
      en: 'AABBCC is a practical reminder for adult classification: Age, Autoimmunity, Body habitus, Background, Control goals, and Comorbidities.',
      ar: 'AABBCC تذكرة عملية لتصنيف البالغين: العمر، المناعة الذاتية، بنية الجسم، الخلفية العائلية، تحقيق الأهداف، والأمراض المصاحبة.',
    },
    quickDecision: {
      when: {
        en: 'When the diabetes type is unclear, or in cases of young age, DKA, or rapid need for insulin.',
        ar: 'عندما يكون نوع السكري غير واضح، أو في السن الصغير، أو حدوث DKA، أو الحاجة السريعة للإنسولين.',
      },
      start: {
        en: 'Assess using AABBCC and order an autoantibody panel (GAD, IA-2, ZnT8).',
        ar: 'قيم الحالة باستخدام AABBCC واطلب تحاليل الأجسام المضادة (GAD, IA-2, ZnT8).',
      },
      followUp: {
        en: 'Consider specialist referral if autoantibodies are positive or dysglycemia progresses.',
        ar: 'فكر في الإحالة لطبيب متخصص إذا كانت الأجسام المضادة إيجابية أو تطور اضطراب السكر.',
      },
      warn: {
        en: 'Do not assume Type 2 diabetes simply based on adult age if features overlap.',
        ar: 'لا تفترض أن السكري من النوع الثاني لمجرد أن المريض بالغ إذا كانت الصفات متداخلة.',
      },
    },
    sourceIds: ['diagnosis-classification'],
    tags: ['classification', 'type 1 diabetes', 'autoantibodies', 'GAD', 'ZnT8'],
  },
  {
    id: 'prediabetes-type2-screening',
    group: 'diagnosisClassification',
    title: {
      en: 'Prediabetes and Type 2 Diabetes Screening',
      ar: 'فحص ما قبل السكري والنوع الثاني',
    },
    summary: {
      en: 'Screening is risk-based before age 35 and universal from age 35, with repeat intervals shaped by results, symptoms, and risk change.',
      ar: 'الفحص يعتمد على الخطورة قبل سن 35، ويبدأ للجميع من سن 35، مع تكرار الفحص حسب النتيجة والأعراض وتغير الخطورة.',
    },
    points: {
      en: [
        'Asymptomatic adults should be screened for prediabetes and type 2 diabetes risk using risk-factor assessment or a validated risk calculator.',
        'Testing should be considered at any adult age in people with overweight or obesity plus at least one risk factor.',
        'For everyone else, screening should begin at age 35 years.',
        'If screening is normal, repeating at least every 3 years is reasonable; repeat sooner if symptoms appear or risk changes, such as weight gain.',
        'FPG, 2-hour plasma glucose during 75-g OGTT, and A1C are each appropriate screening tests.',
        'When OGTT is used, ensure at least 150 g/day carbohydrate intake for 3 days before the test.',
      ],
      ar: [
        'ينبغي فحص خطر ما قبل السكري والنوع الثاني في البالغين بلا أعراض باستخدام تقييم عوامل الخطورة أو حاسبة خطورة معتمدة.',
        'ينبغي التفكير في الاختبار في أي عمر بالغ عند وجود زيادة وزن أو سمنة مع عامل خطورة واحد على الأقل.',
        'لغير ذلك، يبدأ الفحص من سن 35 سنة.',
        'إذا كان الفحص طبيعيا، فمن المعقول تكراره كل 3 سنوات على الأقل، أو أبكر عند ظهور أعراض أو تغير الخطورة مثل زيادة الوزن.',
        'كل من FPG وOGTT ساعتين بعد 75 g وHbA1c مناسب للفحص.',
        'عند استخدام OGTT، يجب التأكد من تناول كربوهيدرات لا تقل عن 150 g/day لمدة 3 أيام قبل الاختبار.',
      ],
    },
    quickDecision: {
      when: {
        en: 'All adults >= 35, or any age if overweight/obese with 1+ risk factor.',
        ar: 'جميع البالغين من سن 35 فما فوق، أو في أي عمر لمن يعانون من زيادة الوزن/السمنة مع عامل خطورة واحد على الأقل.',
      },
      start: {
        en: 'Screen using A1C, FPG, or OGTT.',
        ar: 'افحص باستخدام HbA1c، أو FPG، أو OGTT.',
      },
      followUp: {
        en: 'Every 3 years if normal; sooner if weight increases or symptoms appear.',
        ar: 'كل 3 سنوات إذا كان طبيعياً؛ أو قبل ذلك إذا زاد الوزن أو ظهرت أعراض.',
      },
      warn: {
        en: 'Do not wait for symptoms to begin screening for Type 2 diabetes.',
        ar: 'لا تنتظر ظهور الأعراض لتبدأ فحص السكري من النوع الثاني.',
      },
    },
    sourceIds: ['diagnosis-classification'],
    tags: ['prediabetes', 'type 2 diabetes', 'screening', 'risk calculator', 'OGTT'],
  },
  {
    id: 'prediabetes-definition',
    group: 'diagnosisClassification',
    title: {
      en: 'Prediabetes Definition and Risk Meaning',
      ar: 'تعريف ما قبل السكري ودلالته الخطورية',
    },
    summary: {
      en: 'Prediabetes is not benign; it signals dysglycemia and higher risk for diabetes, cardiovascular disease, and cardiometabolic burden.',
      ar: 'ما قبل السكري ليس حالة بسيطة؛ فهو يدل على اضطراب سكر وخطر أعلى للسكري وأمراض القلب والعبء القلبي الأيضي.',
    },
    points: {
      en: [
        'Prediabetes includes impaired fasting glucose, impaired glucose tolerance, and/or A1C 5.7-6.4%.',
        'IFG is fasting plasma glucose 100-125 mg/dL.',
        'IGT is 2-hour plasma glucose during 75-g OGTT 140-199 mg/dL.',
        'Prediabetes should prompt comprehensive cardiovascular risk-factor assessment, especially obesity, dyslipidemia, and hypertension.',
        'Very high-risk patterns, such as A1C >6.0% or combined IFG and IGT, need more aggressive intervention and vigilant follow-up.',
      ],
      ar: [
        'ما قبل السكري يشمل IFG أو IGT أو HbA1c بين 5.7-6.4%.',
        'IFG يعني FPG بين 100-125 mg/dL.',
        'IGT يعني سكر ساعتين في OGTT 75 g بين 140-199 mg/dL.',
        'وجود ما قبل السكري يستدعي تقييما شاملا لعوامل خطورة القلب، خاصة السمنة واضطراب الدهون وارتفاع الضغط.',
        'الأنماط الأعلى خطورة، مثل HbA1c >6.0% أو اجتماع IFG وIGT، تحتاج تدخلا أقوى ومتابعة أدق.',
      ],
    },
    sourceIds: ['diagnosis-classification'],
    tags: ['prediabetes', 'IFG', 'IGT', 'cardiovascular risk', 'A1C'],
  },
  {
    id: 'gdm-diagnosis',
    group: 'diagnosisClassification',
    title: {
      en: 'Gestational Diabetes Screening and Diagnosis',
      ar: 'فحص وتشخيص سكري الحمل',
    },
    summary: {
      en: 'The 2025 chapter was updated to make current GDM diagnostic approaches easier to understand and implement.',
      ar: 'تم تحديث جزء سكري الحمل في 2025 لتسهيل فهم وتطبيق طرق الفحص والتشخيص الحالية.',
    },
    points: {
      en: [
        'Before 15 weeks of gestation, test people with risk factors and consider testing all people for undiagnosed diabetes at the first prenatal visit if they were not screened before conception.',
        'Standard nonpregnant diagnostic criteria are used to identify undiagnosed diabetes early in pregnancy.',
        'At 24-28 weeks, GDM can be diagnosed using either a one-step 75-g OGTT strategy or a two-step approach with a 50-g glucose load test followed by a 100-g OGTT if positive.',
        'One-step 75-g OGTT thresholds are fasting 92 mg/dL, 1-hour 180 mg/dL, and 2-hour 153 mg/dL; meeting or exceeding any value diagnoses GDM.',
        'Two-step testing uses a 50-g nonfasting screen, then fasting 100-g OGTT; Carpenter-Coustan thresholds are fasting 95, 1-hour 180, 2-hour 155, and 3-hour 140 mg/dL.',
      ],
      ar: [
        'قبل 15 أسبوعا من الحمل، يتم اختبار من لديهم عوامل خطورة، ويمكن التفكير في اختبار الجميع للسكري غير المشخص في أول زيارة حمل إذا لم يتم الفحص قبل الحمل.',
        'تستخدم معايير التشخيص المعتادة خارج الحمل لاكتشاف السكري غير المشخص مبكرا في الحمل.',
        'بين 24-28 أسبوعا، يمكن تشخيص سكري الحمل بطريقة خطوة واحدة OGTT 75 g أو بطريقة خطوتين: اختبار تحميل 50 g ثم OGTT 100 g إذا كان الاختبار إيجابيا.',
        'عتبات طريقة الخطوة الواحدة 75 g هي: صائم 92 mg/dL، بعد ساعة 180، بعد ساعتين 153؛ بلوغ أو تجاوز أي قيمة يشخص سكري الحمل.',
        'طريقة الخطوتين تبدأ بفحص 50 g بدون صيام، ثم OGTT 100 g صائم؛ وعتبات Carpenter-Coustan هي صائم 95، بعد ساعة 180، بعد ساعتين 155، وبعد 3 ساعات 140 mg/dL.',
      ],
    },
    practiceNote: {
      en: 'Because accepted GDM strategies differ, the clinic should standardize one pathway and document which criteria were used.',
      ar: 'لأن طرق تشخيص سكري الحمل المعتمدة تختلف، من الأفضل أن توحد العيادة مسارا واضحا وتوثق المعايير المستخدمة.',
    },
    details: [
      {
        title: { en: '24-28 week diagnostic pathways', ar: 'مسارات التشخيص بين 24-28 أسبوعا' },
        items: {
          en: [
            'One-step: 75-g fasting OGTT; diagnose GDM if fasting 92 mg/dL, 1-h 180 mg/dL, or 2-h 153 mg/dL is met or exceeded.',
            'Two-step: 50-g nonfasting GLT, commonly positive at 130, 135, or 140 mg/dL depending on local policy, then 100-g fasting OGTT.',
            'Carpenter-Coustan 100-g OGTT thresholds: fasting 95, 1-h 180, 2-h 155, 3-h 140 mg/dL; two abnormal values diagnose GDM, while ACOG notes one abnormal value may be used.',
          ],
          ar: [
            'خطوة واحدة: OGTT صائم 75 g؛ يشخص سكري الحمل إذا بلغت أو تجاوزت القيمة 92 mg/dL صائم أو 180 mg/dL بعد ساعة أو 153 mg/dL بعد ساعتين.',
            'خطوتان: GLT غير صائم 50 g، وتحدد الإيجابية غالبا عند 130 أو 135 أو 140 mg/dL حسب سياسة المكان، ثم OGTT صائم 100 g.',
            'عتبات Carpenter-Coustan لاختبار 100 g: صائم 95، بعد ساعة 180، بعد ساعتين 155، بعد 3 ساعات 140 mg/dL؛ وجود قيمتين غير طبيعيتين يشخص GDM، مع ملاحظة أن ACOG يجيز استخدام قيمة واحدة.',
          ],
        },
      },
      {
        title: { en: 'Early pregnancy testing', ar: 'الفحص المبكر في الحمل' },
        items: {
          en: [
            'At the first prenatal visit, identify undiagnosed diabetes using nonpregnant diagnostic criteria when the person was not screened before conception.',
            'Before 15 weeks, abnormal glucose metabolism such as fasting glucose 110-125 mg/dL or A1C 5.9-6.4% identifies higher obstetric and later GDM risk.',
          ],
          ar: [
            'في أول زيارة حمل، يتم البحث عن سكري غير مشخص سابقا باستخدام معايير التشخيص خارج الحمل إذا لم يتم الفحص قبل الحمل.',
            'قبل 15 أسبوعا، اضطراب الجلوكوز مثل FPG 110-125 mg/dL أو HbA1c 5.9-6.4% يشير إلى خطورة أعلى لمضاعفات الحمل ولاحتمال GDM لاحقا.',
          ],
        },
      },
    ],
    quickDecision: {
      when: {
        en: 'At 24-28 weeks of gestation for all, or at the first prenatal visit for high-risk individuals.',
        ar: 'بين الأسبوع 24-28 من الحمل للجميع، أو في أول زيارة حمل للحوامل الأكثر عرضة للخطورة.',
      },
      start: {
        en: 'Implement either the one-step (75-g OGTT) or two-step testing pathway.',
        ar: 'ابدأ باستخدام إما خطوة الـ 75 جم OGTT أو مسار الخطوتين.',
      },
      followUp: {
        en: 'Screen postpartum for persistent diabetes or prediabetes.',
        ar: 'افحص بعد الولادة للتأكد من عدم استمرار السكري أو ما قبل السكري.',
      },
      warn: {
        en: 'Early abnormal glucose (before 15 weeks) strongly indicates high risk for obstetric complications.',
        ar: 'اضطراب الجلوكوز المبكر (قبل 15 أسبوع) مؤشر قوي لخطورة حدوث مضاعفات في الحمل.',
      },
    },

    sourceIds: ['diagnosis-classification'],
    tags: ['GDM', 'pregnancy', 'OGTT', 'one-step', 'two-step'],
  },
];
