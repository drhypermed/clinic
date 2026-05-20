import type { GuidelineTopic } from '../../guidelinesData';

export const ADA_2025_WEIGHT_PHARMACOLOGY_TOPICS: GuidelineTopic[] = [
  {
    id: 'obesity-weight-full',
    group: 'weightPharmacology',
    title: {
      en: '8. Obesity and Weight Management',
      ar: '8. السمنة وإدارة الوزن',
    },
    summary: {
      en: 'Weight management is treated as disease-modifying diabetes care, not cosmetic advice.',
      ar: 'إدارة الوزن هنا جزء علاجي يغير مسار السكري، وليست نصيحة شكلية أو تجميلية.',
    },
    points: {
      en: [
        'Body weight, BMI, weight trajectory, anthropometric measures, and weight-related complications should be assessed without stigma.',
        'Nutrition, physical activity, behavioral support, sleep, and medication review form the base of weight management.',
        'Anti-obesity medications should be considered when benefits outweigh risks and should be monitored for effectiveness, tolerability, access, and long-term maintenance.',
        'Metabolic surgery should be considered for eligible people with diabetes and obesity when it fits risk, preference, and local expertise.',
        'Follow-up should continue after weight loss because weight regain, nutritional deficiency, sarcopenia, and cardiometabolic worsening can occur.',
      ],
      ar: [
        'ينبغي تقييم الوزن وBMI ومسار الوزن والقياسات الجسمية والمضاعفات المرتبطة بالوزن دون وصمة أو لوم.',
        'التغذية والنشاط والدعم السلوكي والنوم ومراجعة الأدوية تمثل قاعدة إدارة الوزن.',
        'ينبغي التفكير في أدوية علاج السمنة عندما تتفوق الفائدة على المخاطر، مع متابعة الفاعلية والتحمل والإتاحة والاستمرار طويل المدى.',
        'جراحة الأيض يمكن التفكير فيها لمن تنطبق عليهم الشروط من مرضى السكري والسمنة حسب الخطورة والتفضيل والخبرة المحلية.',
        'المتابعة تستمر بعد نقص الوزن لأن استرجاع الوزن ونقص التغذية ونقص الكتلة العضلية والتدهور القلبي الأيضي ممكنة.',
      ],
    },
    details: [
      {
        title: { en: 'Weight-loss effect thresholds', ar: 'عتبات فائدة نقص الوزن' },
        items: {
          en: [
            'Weight loss of 3-7% improves glycemia and intermediate cardiovascular risk factors; sustained >10% body-weight loss usually produces larger benefits and may have disease-modifying effects in type 2 diabetes.',
            'Do not use BMI alone to stage risk; include waist/anthropometric measures, complications, function, medication contributors, and patient priorities.',
          ],
          ar: [
            'نقص 3-7% من الوزن يحسن السكر وبعض عوامل الخطورة القلبية الوعائية، بينما نقص أكثر من 10% بشكل مستدام غالبا يعطي فوائد أكبر وقد يغير مسار النوع الثاني.',
            'لا تستخدم BMI وحده لتحديد الخطورة؛ أضف محيط/قياسات الجسم، المضاعفات، الوظيفة، الأدوية المسببة للزيادة، وأولويات المريض.',
          ],
        },
      },
      {
        title: { en: 'Treatment escalation options', ar: 'خيارات تصعيد علاج الوزن' },
        items: {
          en: [
            'Initial obesity treatment should be individualized across nutrition, activity, behavioral therapy, anti-obesity medication, and metabolic surgery.',
            'After pharmacotherapy or surgery, monitor for efficacy, adverse effects, access, weight regain, nutritional deficiency, gallbladder disease, dehydration, and sarcopenia risk.',
          ],
          ar: [
            'بداية علاج السمنة تفرد بين التغذية، النشاط، العلاج السلوكي، أدوية السمنة، وجراحة الأيض.',
            'بعد الدواء أو الجراحة، راقب الفاعلية، الآثار الجانبية، الإتاحة، استرجاع الوزن، نقص التغذية، أمراض المرارة، الجفاف، وخطر نقص الكتلة العضلية.',
          ],
        },
      },
    ],
    quickDecision: {
      when: {
        en: 'When a patient with diabetes or prediabetes presents with overweight or obesity.',
        ar: 'عند مراجعة مريض سكري أو ما قبل السكري يعاني من زيادة الوزن أو السمنة.',
      },
      start: {
        en: 'Prescribe lifestyle changes and consider anti-obesity medications or surgery if eligible.',
        ar: 'صف تغييرات نمط الحياة وفكر في أدوية علاج السمنة أو الجراحة لمن تنطبق عليهم الشروط.',
      },
      followUp: {
        en: 'Continually, even after successful weight loss, to prevent regain and sarcopenia.',
        ar: 'باستمرار، حتى بعد إنقاص الوزن بنجاح، لمنع استرجاع الوزن ونقص الكتلة العضلية.',
      },
      warn: {
        en: 'Do not use BMI as the sole indicator; include waist circumference and complications.',
        ar: 'لا تستخدم مؤشر كتلة الجسم (BMI) كمؤشر وحيد؛ أضف محيط الخصر والمضاعفات للتقييم.',
      },
    },

    sourceIds: ['obesity-weight'],
    tags: ['obesity', 'weight management', 'anti-obesity medication', 'metabolic surgery'],
  },
  {
    id: 'pharmacologic-treatment-full',
    group: 'weightPharmacology',
    title: {
      en: '9. Pharmacologic Approaches to Glycemic Treatment',
      ar: '9. العلاج الدوائي لخفض السكر',
    },
    summary: {
      en: 'Medication choice is now strongly outcome-oriented: glucose, cardiovascular risk, kidney risk, weight, hypoglycemia, cost, and access are considered together.',
      ar: 'اختيار الدواء أصبح موجها بالنتائج: السكر، وخطر القلب، والكلى، والوزن، ونقص السكر، والتكلفة، والإتاحة تؤخذ معا.',
    },
    points: {
      en: [
        'Type 1 diabetes requires insulin replacement, education, glucose monitoring, hypoglycemia prevention, and technology consideration when appropriate.',
        'In type 2 diabetes, therapy should be person-centered and reassessed regularly for efficacy, safety, tolerability, cost, access, and treatment burden.',
        'For type 2 diabetes with ASCVD, high ASCVD risk, heart failure, or CKD, use agents with proven outcome benefit irrespective of baseline A1C when indicated.',
        'GLP-1 receptor agonists, dual GIP/GLP-1 receptor agonists, SGLT2 inhibitors, insulin, and other agents are selected according to goals and comorbidities rather than a single stepwise pathway.',
        'Avoid therapeutic inertia: intensify when goals are not met, and deintensify or simplify when hypoglycemia, frailty, cost, or burden outweigh benefit.',
      ],
      ar: [
        'النوع الأول يحتاج تعويضا بالإنسولين، وتعليما، ومتابعة للسكر، ووقاية من نقص السكر، والتفكير في التكنولوجيا عند الملاءمة.',
        'في النوع الثاني، العلاج متمركز حول الشخص ويعاد تقييمه بانتظام من حيث الفاعلية والسلامة والتحمل والتكلفة والإتاحة وعبء العلاج.',
        'في النوع الثاني مع ASCVD أو خطره العالي أو فشل القلب أو CKD، تستخدم أدوية ذات فائدة مثبتة على النتائج بغض النظر عن HbA1c الأساسي عندما تكون مستطبة.',
        'اختيار GLP-1 receptor agonists وdual GIP/GLP-1 receptor agonists وSGLT2 inhibitors والإنسولين وغيرها يكون حسب الأهداف والأمراض المصاحبة، لا كسلم واحد جامد.',
        'تجنب الجمود العلاجي: كثف العلاج عند عدم تحقق الأهداف، وخفف أو بسط العلاج عندما يتجاوز خطر نقص السكر أو الهشاشة أو التكلفة أو العبء الفائدة.',
      ],
    },
    practiceNote: {
      en: 'For each medication decision, write the reason: glucose lowering, heart protection, kidney protection, weight, hypoglycemia avoidance, cost, or access.',
      ar: 'مع كل قرار دوائي، اكتب السبب: خفض السكر، حماية القلب، حماية الكلى، الوزن، تجنب نقص السكر، التكلفة، أو الإتاحة.',
    },
    details: [
      {
        title: { en: 'Therapy review cadence', ar: 'إيقاع مراجعة العلاج' },
        items: {
          en: [
            'Reevaluate medication plan and medication-taking behavior every 3-6 months, including efficacy, side effects, hypoglycemia, weight, cost, access, and treatment burden.',
            'Do not delay treatment modification when individualized goals are not met, but deintensify when hypoglycemia, weight loss, frailty, cost, or burden makes the plan unsafe or unnecessary.',
          ],
          ar: [
            'راجع الخطة الدوائية وسلوك أخذ الدواء كل 3-6 أشهر، بما يشمل الفاعلية، الآثار الجانبية، نقص السكر، الوزن، التكلفة، الإتاحة، وعبء العلاج.',
            'لا تؤخر تعديل العلاج عند عدم تحقق الأهداف الفردية، لكن خفف العلاج عند نقص السكر أو نقص الوزن أو الهشاشة أو التكلفة أو العبء الزائد.',
          ],
        },
      },
      {
        title: { en: 'Key pharmacology rules', ar: 'قواعد دوائية مهمة' },
        items: {
          en: [
            'Initial combination therapy should be considered when A1C is 1.5-2.0% above the individualized goal.',
            'Consider insulin as the first injectable when there is ongoing catabolism, symptoms of hyperglycemia, A1C >10%, blood glucose >=300 mg/dL, or possible type 1 diabetes.',
            'For type 2 diabetes with CKD, an SGLT2 inhibitor or GLP-1 RA with demonstrated benefit is used for kidney and cardiovascular risk reduction; glucose-lowering from SGLT2 inhibitors is minimal at eGFR <45 mL/min/1.73 m2, while selected agents may continue for cardiorenal benefit until dialysis or transplant.',
            'When starting GLP-1 RA or dual GIP/GLP-1 RA, do not combine with DPP-4 inhibitor; reassess insulin or sulfonylurea doses to reduce hypoglycemia.',
            'If injectable intensification is needed in type 2 diabetes, consider GLP-1 RA or dual GIP/GLP-1 RA before prandial insulin when appropriate.',
          ],
          ar: [
            'يناقش العلاج المركب منذ البداية عندما يكون HbA1c أعلى من الهدف الفردي بمقدار 1.5-2.0%.',
            'فكر في الإنسولين كأول علاج حقني عند وجود هدم/نقص وزن مستمر، أعراض فرط سكر، HbA1c >10%، سكر >=300 mg/dL، أو احتمال النوع الأول.',
            'في النوع الثاني مع CKD، يستخدم SGLT2 inhibitor أو GLP-1 RA ذو فائدة مثبتة لتقليل خطورة الكلى والقلب؛ تأثير SGLT2 على خفض السكر يصبح محدودا عند eGFR <45 mL/min/1.73 m2، مع إمكانية استمرار بعض الأدوية للفائدة القلبية الكلوية حتى الغسيل أو الزرع.',
            'عند بدء GLP-1 RA أو dual GIP/GLP-1 RA، لا تجمعه مع DPP-4 inhibitor؛ وراجع جرعات الإنسولين أو sulfonylurea لتقليل نقص السكر.',
            'إذا احتاج النوع الثاني إلى تصعيد حقني، فكر في GLP-1 RA أو dual GIP/GLP-1 RA قبل إنسولين الوجبات عند الملاءمة.',
          ],
        },
      },
    ],
    visuals: [
      {
        title: {
          en: 'Glucose-lowering medication selection in type 2 diabetes',
          ar: 'اختيار أدوية خفض السكر في النوع الثاني',
        },
        label: 'Figure 9.3',
        imageSrc: '/guidelines/ada2025/figure-9-3-type-2-medication-algorithm.png',
        sourceId: 'pharmacologic-treatment',
        page: 10,
        takeaways: {
          en: [
            'Read the algorithm in two lanes: first protect organs and reduce complications, then optimize weight and glycemia.',
            'With ASCVD or high ASCVD risk, favor GLP-1 RA and/or SGLT2 inhibitor with proven cardiovascular benefit; with heart failure, prioritize an SGLT2 inhibitor when clinically appropriate.',
            'With CKD, use SGLT2 inhibitor or GLP-1 RA with demonstrated benefit based on eGFR and albuminuria; with MASLD/MASH and overweight or obesity, consider GLP-1 RA, dual GIP/GLP-1 RA, or pioglitazone when appropriate.',
            'When the main target is weight or stronger glucose lowering, GLP-1 RA/dual GIP-GLP-1 RA and insulin are weighed against hypoglycemia, adverse effects, cost, and access.',
          ],
          ar: [
            'اقرأ الخوارزمية كمسارين: أولًا حماية القلب والكلى والكبد وتقليل المضاعفات، ثم تحسين الوزن والسكر.',
            'مع ASCVD أو خطورته العالية، الأفضلية لدواء GLP-1 RA و/أو SGLT2 inhibitor ذي فائدة قلبية مثبتة؛ ومع فشل القلب تكون أولوية SGLT2 inhibitor عند الملاءمة.',
            'مع CKD، استخدم SGLT2 inhibitor أو GLP-1 RA بفائدة مثبتة حسب eGFR والزلال؛ ومع MASLD/MASH مع زيادة وزن أو سمنة يمكن التفكير في GLP-1 RA أو dual GIP/GLP-1 RA أو pioglitazone عند الملاءمة.',
            'لو الهدف الأساسي الوزن أو خفض السكر بقوة، تتم الموازنة بين GLP-1 RA/dual GIP-GLP-1 RA والإنسولين وبين نقص السكر والآثار الجانبية والتكلفة والإتاحة.',
          ],
        },
      },
      {
        title: {
          en: 'Features and safety considerations for glucose-lowering medications',
          ar: 'خصائص واعتبارات أمان أدوية خفض السكر',
        },
        label: 'Table 9.2',
        imageSrc: '/guidelines/ada2025/table-9-2-glucose-lowering-medications.png',
        sourceId: 'pharmacologic-treatment',
        page: 11,
        takeaways: {
          en: [
            'The table compares each class by glucose-lowering power, hypoglycemia risk, weight effect, cardiovascular and kidney effects, MASH relevance, dosing limits, and adverse effects.',
            'Metformin remains high-efficacy, low-hypoglycemia, and weight-neutral/modestly weight-lowering, but avoid it at eGFR <30 mL/min/1.73 m2 and monitor B12 when clinically relevant.',
            'SGLT2 inhibitors are especially useful for heart failure and kidney protection but require attention to genital infections, volume status, perioperative holding, and ketoacidosis risk.',
            'GLP-1 RA and dual GIP/GLP-1 RA provide strong glucose and weight effects with low hypoglycemia risk, while insulin and sulfonylureas have higher hypoglycemia and weight-gain burden.',
          ],
          ar: [
            'الجدول يقارن كل فئة حسب قوة خفض السكر، خطر نقص السكر، تأثير الوزن، فوائد القلب والكلى، علاقة MASH، حدود الجرعات، والآثار الجانبية.',
            'Metformin فعاليته عالية وخطر نقص السكر معه منخفض وتأثيره على الوزن محايد أو خافض بسيط، لكن يتجنب عند eGFR <30 mL/min/1.73 m2 وتراجع B12 عند اللزوم.',
            'SGLT2 inhibitors مهمة خصوصًا لفشل القلب وحماية الكلى، لكن انتبه لعدوى الأعضاء التناسلية، الجفاف/نقص الحجم، إيقافها حول العمليات، وخطر ketoacidosis.',
            'GLP-1 RA وdual GIP/GLP-1 RA يقدمان خفضًا قويًا للسكر والوزن مع خطر نقص سكر منخفض، بينما الإنسولين وsulfonylureas يحملان عبئًا أعلى من نقص السكر وزيادة الوزن.',
          ],
        },
      },
    ],
    quickDecision: {
      when: {
        en: 'At diagnosis and every 3-6 months to assess medication efficacy and safety.',
        ar: 'عند التشخيص وكل 3-6 أشهر لتقييم فاعلية وأمان الأدوية.',
      },
      start: {
        en: 'Prescribe organ-protecting agents (SGLT2i, GLP-1 RA) if ASCVD, HF, or CKD are present, regardless of A1C.',
        ar: 'صف أدوية حماية الأعضاء (SGLT2i, GLP-1 RA) في حال وجود ASCVD أو فشل القلب أو CKD، بغض النظر عن قيمة HbA1c.',
      },
      followUp: {
        en: 'Every 3-6 months to intensify or deintensify therapy based on goals and side effects.',
        ar: 'كل 3-6 أشهر لتكثيف العلاج أو تخفيفه بناءً على الأهداف والآثار الجانبية.',
      },
      warn: {
        en: 'Avoid therapeutic inertia, but actively deintensify if the patient faces hypoglycemia or high burden.',
        ar: 'تجنب الجمود العلاجي، لكن خفف العلاج فوراً إذا تعرض المريض لنقص السكر أو عبء علاجي زائد.',
      },
    },

    sourceIds: ['pharmacologic-treatment'],
    tags: ['pharmacology', 'GLP-1', 'SGLT2', 'insulin', 'ASCVD', 'CKD'],
  },
];
