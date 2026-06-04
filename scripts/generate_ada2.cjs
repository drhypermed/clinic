const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'components', 'guidelines', 'data', 'ada2026');

const files = {
  'ch4-evaluation.ts': `import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_4_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch4-evaluation',
    group: '4. Comprehensive Medical Evaluation',
    sourceIds: ['4-comprehensive-medical-evaluation-and-assessment-of-comorbidities-pdf', 'comprehensive medical evaluation'],
    tags: ['Medical Evaluation', 'Comorbidities', 'Immunization'],
    title: {
      en: 'Comprehensive Medical Evaluation',
      ar: 'التقييم الطبي الشامل'
    },
    summary: {
      en: 'A complete medical evaluation should be performed at the initial visit to confirm the diagnosis, screen for complications, and establish a personalized management plan. Ongoing assessment of comorbidities is essential.',
      ar: 'يجب إجراء تقييم طبي كامل في الزيارة الأولى لتأكيد التشخيص وفحص المضاعفات ووضع خطة إدارة شخصية. التقييم المستمر للأمراض المصاحبة أمر ضروري.'
    },
    points: {
      en: [
        'A complete medical evaluation should be performed at the initial visit.',
        'Follow-up visits should include most components of the initial comprehensive evaluation, emphasizing areas of change or concern.',
        'Provide immunizations routinely for children and adults with diabetes, including influenza, pneumococcal, and COVID-19 vaccines.',
        'Screen for cognitive impairment in older adults as it affects diabetes self-management.'
      ],
      ar: [
        'يجب إجراء تقييم طبي كامل في الزيارة الأولى.',
        'يجب أن تتضمن زيارات المتابعة معظم مكونات التقييم الشامل الأولي، مع التركيز على مجالات التغيير أو القلق.',
        'توفير التطعيمات بشكل روتيني للأطفال والبالغين المصابين بالسكري، بما في ذلك لقاحات الإنفلونزا والمكورات الرئوية وكوفيد-19.',
        'فحص الضعف الإدراكي لدى كبار السن لأنه يؤثر على الإدارة الذاتية للسكري.'
      ]
    }
  }
];`,

  'ch5-behaviors.ts': `import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_5_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch5-dsmes',
    group: '5. Facilitating Positive Health Behaviors',
    sourceIds: ['5-facilitating-positive-health-behaviors-and-well-being-to-improve-health-outcomes-pdf', 'facilitating positive health behaviors'],
    tags: ['DSMES', 'Behavioral Health', 'Well-being'],
    title: {
      en: 'Diabetes Self-Management Education and Support (DSMES)',
      ar: 'التثقيف والدعم للإدارة الذاتية للسكري (DSMES)'
    },
    summary: {
      en: 'DSMES programs and behavioral health integration are foundational to diabetes care. They empower patients to make informed decisions and cope with the psychosocial demands of the disease.',
      ar: 'برامج التثقيف والدعم للإدارة الذاتية للسكري (DSMES) ودمج الصحة السلوكية هي أساس رعاية السكري. إنها تمكن المرضى من اتخاذ قرارات مستنيرة والتعامل مع المتطلبات النفسية والاجتماعية للمرض.'
    },
    points: {
      en: [
        'All people with diabetes should participate in DSMES at diagnosis and as needed thereafter.',
        'Address psychosocial issues such as diabetes distress, depression, anxiety, and eating disorders using validated screening tools.',
        'Incorporate behavioral health professionals into the diabetes care team.',
        'Promote sleep health, as sleep disturbances are common and negatively affect glycemic control.'
      ],
      ar: [
        'يجب أن يشارك جميع المصابين بالسكري في برامج DSMES عند التشخيص وحسب الحاجة بعد ذلك.',
        'معالجة القضايا النفسية والاجتماعية مثل ضائقة السكري والاكتئاب والقلق واضطرابات الأكل باستخدام أدوات فحص معتمدة.',
        'دمج متخصصي الصحة السلوكية في فريق رعاية السكري.',
        'تعزيز صحة النوم، حيث أن اضطرابات النوم شائعة وتؤثر سلباً على التحكم في السكر.'
      ]
    }
  }
];`,

  'ch6-glycemic.ts': `import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_6_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch6-targets',
    group: '6. Glycemic Goals and Hypoglycemia',
    sourceIds: ['6-glycemic-goals-and-hypoglycemia-pdf', 'glycemic goals'],
    tags: ['A1C', 'TIR', 'Hypoglycemia'],
    title: {
      en: 'Glycemic Targets and Hypoglycemia',
      ar: 'أهداف السكر في الدم وهبوط السكر'
    },
    summary: {
      en: 'Glycemic targets must be individualized based on age, comorbidities, and hypoglycemia risk. Time in Range (TIR) from CGM is increasingly used alongside A1C as a primary metric for glycemic control.',
      ar: 'يجب تخصيص أهداف السكر بناءً على العمر والأمراض المصاحبة ومخاطر هبوط السكر. يتم استخدام الوقت في النطاق المستهدف (TIR) من أجهزة المراقبة المستمرة بشكل متزايد إلى جانب التراكمي كمقياس أساسي للتحكم.'
    },
    points: {
      en: [
        'An A1C goal for many nonpregnant adults of <7.0% (53 mmol/mol) without significant hypoglycemia is appropriate.',
        'More stringent goals (e.g., <6.5%) may be appropriate for selected patients if achievable without significant hypoglycemia.',
        'Less stringent goals (e.g., <8.0%) may be appropriate for patients with limited life expectancy or severe comorbidities.',
        'For CGM users, aim for Time in Range (TIR, 70-180 mg/dL) >70% and Time Below Range (TBR, <70 mg/dL) <4%.',
        'Glucagon should be prescribed for all individuals at increased risk of level 2 or 3 hypoglycemia.'
      ],
      ar: [
        'الهدف المناسب للتراكمي للعديد من البالغين غير الحوامل هو <7.0% بدون هبوط شديد في السكر.',
        'قد تكون الأهداف الأكثر صرامة (مثل <6.5%) مناسبة لمرضى محددين إذا أمكن تحقيقها دون هبوط شديد.',
        'قد تكون الأهداف الأقل صرامة (مثل <8.0%) مناسبة للمرضى الذين لديهم أمراض مصاحبة شديدة أو متوسط عمر متوقع محدود.',
        'لمستخدمي CGM، استهدف الوقت في النطاق (TIR) >70% والوقت تحت النطاق (TBR) <4%.',
        'يجب وصف الجلوكاجون لجميع الأفراد المعرضين لخطر متزايد للإصابة بهبوط السكر من المستوى 2 أو 3.'
      ]
    }
  }
];`,

  'ch7-technology.ts': `import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_7_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch7-cgm',
    group: '7. Diabetes Technology',
    sourceIds: ['7-diabetes-technology-pdf', 'diabetes technology'],
    tags: ['CGM', 'Insulin Pumps', 'AID'],
    title: {
      en: 'Continuous Glucose Monitoring and Insulin Delivery',
      ar: 'المراقبة المستمرة للجلوكوز وإعطاء الأنسولين'
    },
    summary: {
      en: 'Diabetes technology, including CGM and Automated Insulin Delivery (AID) systems, is standard of care for many people with diabetes, significantly improving glycemic outcomes and quality of life.',
      ar: 'تكنولوجيا السكري، بما في ذلك المراقبة المستمرة (CGM) وأنظمة إعطاء الأنسولين الآلية (AID)، هي الرعاية القياسية للعديد من المرضى، مما يحسن بشكل كبير نتائج السكر ونوعية الحياة.'
    },
    points: {
      en: [
        'Real-time CGM or intermittently scanned CGM should be offered to all adults with diabetes on multiple daily injections or continuous subcutaneous insulin infusion.',
        'AID systems should be offered for diabetes management to youth and adults with type 1 diabetes.',
        'CGM is recommended for adults with type 2 diabetes on basal insulin to improve A1C and reduce hypoglycemia.',
        'Patients using diabetes technology must receive ongoing education and training on device use and data interpretation.'
      ],
      ar: [
        'يجب تقديم CGM (سواء المباشر أو المتقطع) لجميع البالغين المصابين بالسكري الذين يستخدمون حقن الأنسولين المتعددة أو مضخات الأنسولين.',
        'يجب تقديم أنظمة AID لإدارة السكري للشباب والبالغين المصابين بالسكري من النوع الأول.',
        'يوصى بـ CGM للبالغين المصابين بالسكري من النوع الثاني الذين يستخدمون الأنسولين القاعدي لتحسين التراكمي وتقليل الهبوط.',
        'يجب أن يتلقى المرضى الذين يستخدمون تكنولوجيا السكري تثقيفاً وتدريباً مستمراً على استخدام الأجهزة وتفسير البيانات.'
      ]
    }
  }
];`,

  'ch10-cvd.ts': `import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_10_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch10-cvd',
    group: '10. Cardiovascular Disease and Risk Management',
    sourceIds: ['10-cardiovascular-disease-and-risk-management-pdf', 'cardiovascular disease'],
    tags: ['CVD', 'Hypertension', 'Lipids', 'Aspirin'],
    title: {
      en: 'Cardiovascular Risk Management',
      ar: 'إدارة مخاطر أمراض القلب والأوعية الدموية'
    },
    summary: {
      en: 'Cardiovascular disease is the leading cause of morbidity and mortality for individuals with diabetes. Comprehensive risk factor management, including BP, lipids, and antiplatelet therapy, is critical.',
      ar: 'أمراض القلب والأوعية الدموية هي السبب الرئيسي للمراضة والوفيات للمصابين بالسكري. تعد الإدارة الشاملة لعوامل الخطر، بما في ذلك ضغط الدم والدهون والعلاج المضاد للصفائح الدموية، أمراً بالغ الأهمية.'
    },
    points: {
      en: [
        'Blood pressure should be measured at every routine clinical visit. Target BP is generally <130/80 mmHg.',
        'For patients with diabetes and ASCVD or 10-year ASCVD risk >20%, high-intensity statin therapy is recommended to achieve LDL-C reduction of ≥50% and an LDL-C goal of <55 mg/dL.',
        'Aspirin therapy (75–162 mg/day) is recommended as secondary prevention in those with a history of ASCVD.',
        'Screen for heart failure with a careful history and physical exam at every visit; measure BNP or NT-proBNP if symptomatic.'
      ],
      ar: [
        'يجب قياس ضغط الدم في كل زيارة سريرية روتينية. الهدف العام لضغط الدم هو <130/80 ملم زئبق.',
        'للمرضى المصابين بالسكري وأمراض القلب أو لديهم خطر الإصابة بها خلال 10 سنوات >20%، يوصى بعلاج الستاتين عالي الكثافة لتحقيق خفض LDL بنسبة ≥50% والوصول لـ LDL <55 مجم/ديسيلتر.',
        'يوصى بعلاج الأسبرين (75-162 مجم/يوم) كوقاية ثانوية لأولئك الذين لديهم تاريخ من أمراض القلب.',
        'فحص فشل القلب بأخذ تاريخ مرضي دقيق وفحص بدني في كل زيارة؛ وقياس BNP إذا كانت هناك أعراض.'
      ]
    }
  }
];`,

  'ch11-ckd.ts': `import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_11_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch11-ckd',
    group: '11. Chronic Kidney Disease and Risk Management',
    sourceIds: ['11-chronic-kidney-disease-and-risk-management-pdf', 'chronic kidney disease'],
    tags: ['CKD', 'Nephropathy', 'UACR', 'eGFR'],
    title: {
      en: 'Chronic Kidney Disease (CKD) Management',
      ar: 'إدارة أمراض الكلى المزمنة (CKD)'
    },
    summary: {
      en: 'CKD occurs in a significant proportion of people with diabetes. Routine screening with UACR and eGFR, along with optimal glycemic and blood pressure control, and use of renoprotective agents (SGLT2i, nsMRAs), is essential.',
      ar: 'يحدث مرض الكلى المزمن في نسبة كبيرة من المصابين بالسكري. الفحص الروتيني باستخدام UACR و eGFR، إلى جانب التحكم الأمثل في السكر وضغط الدم، واستخدام الأدوية الواقية للكلى، أمر ضروري.'
    },
    points: {
      en: [
        'Screen at least annually using urinary albumin-to-creatinine ratio (UACR) and estimated glomerular filtration rate (eGFR) in patients with type 1 diabetes with duration ≥5 years and in all patients with type 2 diabetes.',
        'Optimize blood pressure control and reduce dietary protein intake if high.',
        'For patients with T2D and diabetic kidney disease, an SGLT2 inhibitor is recommended to reduce CKD progression and cardiovascular events.',
        'Use ACE inhibitors or ARBs for the treatment of nonpregnant patients with diabetes and moderately to severely increased albuminuria.'
      ],
      ar: [
        'قم بالفحص سنوياً على الأقل باستخدام نسبة الألبومين إلى الكرياتينين في البول (UACR) ومعدل الترشيح الكبيبي (eGFR) لمرضى النوع الأول (مدة ≥5 سنوات) وجميع مرضى النوع الثاني.',
        'تحسين السيطرة على ضغط الدم وتقليل تناول البروتين الغذائي إذا كان مرتفعاً.',
        'لمرضى النوع الثاني مع مرض الكلى السكري، يوصى بمثبطات SGLT2 لتقليل تطور المرض الكلوي والأحداث القلبية.',
        'استخدم مثبطات ACE أو ARB لعلاج المرضى (غير الحوامل) الذين يعانون من زيادة متوسطة إلى شديدة في البيلة الألبومينية.'
      ]
    }
  }
];`,

  'ch12-microvascular.ts': `import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_12_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch12-microvascular',
    group: '12. Retinopathy, Neuropathy, and Foot Care',
    sourceIds: ['12-retinopathy-neuropathy-and-foot-care-pdf', 'retinopathy'],
    tags: ['Retinopathy', 'Neuropathy', 'Foot Care'],
    title: {
      en: 'Microvascular Complications and Foot Care',
      ar: 'مضاعفات الأوعية الدموية الدقيقة ورعاية القدم'
    },
    summary: {
      en: 'Screening for retinopathy, neuropathy, and foot complications allows for early intervention, preventing severe vision loss, pain, and amputations.',
      ar: 'يسمح الفحص للكشف عن اعتلال الشبكية والاعتلال العصبي ومضاعفات القدم بالتدخل المبكر، مما يمنع فقدان البصر الشديد والألم وبتر الأطراف.'
    },
    points: {
      en: [
        'Perform a comprehensive eye examination within 5 years of onset of T1D, and at the time of diagnosis of T2D, and annually thereafter.',
        'All patients should be assessed for diabetic peripheral neuropathy starting at diagnosis of T2D and 5 years after the diagnosis of T1D and at least annually thereafter.',
        'Perform a comprehensive foot evaluation at least annually to identify risk factors for ulcers and amputations.',
        'Patients with sensory loss, prior ulceration, or amputation should have their feet inspected at every visit.'
      ],
      ar: [
        'قم بإجراء فحص شامل للعين في غضون 5 سنوات من ظهور النوع الأول، وعند تشخيص النوع الثاني، وسنوياً بعد ذلك.',
        'يجب تقييم جميع المرضى للكشف عن الاعتلال العصبي المحيطي السكري بدءاً من تشخيص النوع الثاني وبعد 5 سنوات للنوع الأول، وسنوياً على الأقل.',
        'قم بإجراء تقييم شامل للقدم سنوياً على الأقل لتحديد عوامل الخطر للقرح والبتر.',
        'المرضى الذين يعانون من فقدان الإحساس أو تقرحات سابقة أو بتر، يجب فحص أقدامهم في كل زيارة.'
      ]
    }
  }
];`,

  'ch13-older.ts': `import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_13_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch13-older',
    group: '13. Older Adults',
    sourceIds: ['13-older-adults-pdf', 'older adults'],
    tags: ['Geriatrics', 'Frail', 'Cognition'],
    title: {
      en: 'Diabetes Care in Older Adults',
      ar: 'رعاية السكري لدى كبار السن'
    },
    summary: {
      en: 'Older adults with diabetes have higher rates of premature death, functional disability, and coexisting illnesses. Management must be tailored to consider functional and cognitive status, focusing on avoiding hypoglycemia and improving quality of life.',
      ar: 'يعاني كبار السن المصابون بالسكري من معدلات أعلى للوفاة المبكرة والإعاقة الوظيفية والأمراض المصاحبة. يجب تكييف الإدارة لمراعاة الحالة الوظيفية والإدراكية، مع التركيز على تجنب الهبوط وتحسين جودة الحياة.'
    },
    points: {
      en: [
        'Consider assessment of medical, psychological, functional (self-management abilities), and social geriatric domains to provide a framework to determine targets and therapeutic approaches.',
        'Deintensification (or simplification) of complex regimens is recommended to reduce the risk of hypoglycemia and polypharmacy, if it can be achieved within the individualized A1C target.',
        'Avoid reliance on A1C alone for older adults; use continuous glucose monitoring (CGM) where appropriate.',
        'Screen for cognitive impairment and depression, as they significantly impact diabetes self-care.'
      ],
      ar: [
        'فكر في تقييم المجالات الطبية والنفسية والوظيفية (قدرات الإدارة الذاتية) والاجتماعية لتوفير إطار لتحديد الأهداف والأساليب العلاجية.',
        'يوصى بتبسيط الأنظمة المعقدة لتقليل خطر الهبوط وتعدد الأدوية، إذا كان يمكن تحقيقه ضمن الهدف الفردي للتراكمي.',
        'تجنب الاعتماد على التراكمي وحده لكبار السن؛ استخدم المراقبة المستمرة (CGM) عند الاقتضاء.',
        'فحص الضعف الإدراكي والاكتئاب، حيث يؤثران بشكل كبير على الرعاية الذاتية.'
      ]
    }
  }
];`,

  'ch14-children.ts': `import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_14_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch14-children',
    group: '14. Children and Adolescents',
    sourceIds: ['14-children-and-adolescents-pdf', 'children and adolescents'],
    tags: ['Pediatrics', 'Type 1', 'Type 2'],
    title: {
      en: 'Diabetes Care in Children and Adolescents',
      ar: 'رعاية السكري لدى الأطفال والمراهقين'
    },
    summary: {
      en: 'Management of diabetes in youth requires a multidisciplinary approach involving family and schools. Glycemic targets (typically A1C <7.0%) must balance long-term complication risk with the risk of severe hypoglycemia.',
      ar: 'تتطلب إدارة السكري لدى الشباب نهجاً متعدد التخصصات يشمل الأسرة والمدارس. يجب أن توازن أهداف السكر (التراكمي <7.0% عادةً) بين خطر المضاعفات طويلة الأمد وخطر هبوط السكر الشديد.'
    },
    points: {
      en: [
        'An A1C goal of <7.0% (53 mmol/mol) is appropriate for many children and adolescents.',
        'Intensive management via continuous subcutaneous insulin infusion or multiple daily injections should be initiated at diagnosis of T1D.',
        'For youth with type 2 diabetes, metformin and basal insulin are initial options depending on presentation severity; GLP-1 RAs are increasingly used for weight management.',
        'Screen for psychosocial distress, eating disorders, and autoimmune conditions (e.g., celiac disease, thyroid disease) routinely.'
      ],
      ar: [
        'يعد هدف التراكمي <7.0% مناسباً للعديد من الأطفال والمراهقين.',
        'يجب البدء في الإدارة المكثفة عبر مضخة الأنسولين أو الحقن المتعددة عند تشخيص النوع الأول.',
        'للشباب المصابين بالنوع الثاني، يُعتبر الميتفورمين والأنسولين القاعدي خيارات أولية حسب شدة الحالة؛ وتستخدم منبهات GLP-1 بشكل متزايد للتحكم في الوزن.',
        'قم بالفحص الروتيني للضائقة النفسية، واضطرابات الأكل، وحالات المناعة الذاتية (مثل مرض الاضطرابات الهضمية، وأمراض الغدة الدرقية).'
      ]
    }
  }
];`,

  'ch15-pregnancy.ts': `import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_15_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch15-pregnancy',
    group: '15. Management of Diabetes in Pregnancy',
    sourceIds: ['15-management-of-diabetes-in-pregnancy-pdf', 'management of diabetes in pregnancy'],
    tags: ['Pregnancy', 'GDM', 'Preconception'],
    title: {
      en: 'Diabetes Management in Pregnancy',
      ar: 'إدارة السكري أثناء الحمل'
    },
    summary: {
      en: 'Preconception counseling and strict glycemic control before and during pregnancy are vital to reduce the risk of congenital anomalies and maternal/fetal complications.',
      ar: 'تقديم المشورة قبل الحمل والتحكم الصارم في السكر قبل وأثناء الحمل أمران حيويان لتقليل مخاطر التشوهات الخلقية ومضاعفات الأم والجنين.'
    },
    points: {
      en: [
        'Preconception counseling should address the importance of achieving A1C levels as close to normal as safely possible, ideally <6.5%.',
        'Insulin is the preferred medication for treating hyperglycemia in gestational diabetes mellitus (GDM); metformin and glyburide should not be used as first-line agents.',
        'Target glucose levels in pregnancy: Fasting <95 mg/dL, 1-hour postprandial <140 mg/dL, 2-hour postprandial <120 mg/dL.',
        'Postpartum screening for T2D should be performed 4–12 weeks after delivery for women with GDM.'
      ],
      ar: [
        'يجب أن تتناول استشارة ما قبل الحمل أهمية الوصول بالتراكمي لأقرب ما يمكن إلى الطبيعي بأمان، بشكل مثالي <6.5%.',
        'الأنسولين هو الدواء المفضل لعلاج سكري الحمل (GDM)؛ لا ينبغي استخدام الميتفورمين وجليبوريد كخط أول.',
        'مستويات السكر المستهدفة أثناء الحمل: الصائم <95، بعد الأكل بساعة <140، بعد الأكل بساعتين <120 مجم/ديسيلتر.',
        'يجب فحص النوع الثاني بعد 4-12 أسبوعاً من الولادة للنساء اللاتي أُصبن بسكري الحمل.'
      ]
    }
  }
];`,

  'ch16-hospital.ts': `import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_16_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch16-hospital',
    group: '16. Diabetes Care in the Hospital',
    sourceIds: ['16-diabetes-care-in-the-hospital-pdf', 'diabetes care in the hospital'],
    tags: ['Inpatient', 'Insulin', 'Hospitalization'],
    title: {
      en: 'Inpatient Diabetes Management',
      ar: 'إدارة السكري للمرضى المنومين في المستشفى'
    },
    summary: {
      en: 'Hyperglycemia in hospitalized patients is associated with poor clinical outcomes. Insulin therapy using a basal-bolus regimen is the preferred treatment for non-critically ill patients, while continuous insulin infusion is indicated for critically ill patients.',
      ar: 'يرتبط ارتفاع السكر لدى المرضى المنومين بنتائج سريرية سيئة. يُفضل العلاج بالأنسولين بنظام قاعدي-طعامي (basal-bolus) للمرضى ذوي الحالات غير الحرجة، بينما يُشار إلى التسريب المستمر للأنسولين للمرضى في الرعاية الحرجة.'
    },
    points: {
      en: [
        'Target glucose range for the majority of critically and non-critically ill patients is 140–180 mg/dL (7.8–10.0 mmol/L).',
        'Insulin therapy should be initiated for treatment of persistent hyperglycemia starting at a threshold ≥180 mg/dL (10.0 mmol/L).',
        'Sole use of sliding scale insulin in the inpatient hospital setting is strongly discouraged.',
        'A comprehensive discharge plan should be formulated 1–2 days before discharge.'
      ],
      ar: [
        'النطاق المستهدف لمعظم المرضى (في الحالات الحرجة وغير الحرجة) هو 140-180 مجم/ديسيلتر.',
        'يجب البدء في العلاج بالأنسولين لعلاج الارتفاع المستمر للسكر عند وصوله إلى عتبة ≥180 مجم/ديسيلتر.',
        'لا يُنصح بشدة بالاعتماد فقط على المقياس المتدرج للأنسولين (Sliding scale) في المستشفى.',
        'يجب صياغة خطة خروج شاملة قبل 1-2 يوم من الخروج.'
      ]
    }
  }
];`
};

for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(dataDir, filename), content);
}

// Update guidelinesData.ts
const mainFile = path.join(__dirname, '..', 'components', 'guidelines', 'guidelinesData.ts');
let mainContent = fs.readFileSync(mainFile, 'utf8');

const imports = [
  "import { ADA_2026_CHAPTER_4_TOPICS } from './data/ada2026/ch4-evaluation';",
  "import { ADA_2026_CHAPTER_5_TOPICS } from './data/ada2026/ch5-behaviors';",
  "import { ADA_2026_CHAPTER_6_TOPICS } from './data/ada2026/ch6-glycemic';",
  "import { ADA_2026_CHAPTER_7_TOPICS } from './data/ada2026/ch7-technology';",
  "import { ADA_2026_CHAPTER_10_TOPICS } from './data/ada2026/ch10-cvd';",
  "import { ADA_2026_CHAPTER_11_TOPICS } from './data/ada2026/ch11-ckd';",
  "import { ADA_2026_CHAPTER_12_TOPICS } from './data/ada2026/ch12-microvascular';",
  "import { ADA_2026_CHAPTER_13_TOPICS } from './data/ada2026/ch13-older';",
  "import { ADA_2026_CHAPTER_14_TOPICS } from './data/ada2026/ch14-children';",
  "import { ADA_2026_CHAPTER_15_TOPICS } from './data/ada2026/ch15-pregnancy';",
  "import { ADA_2026_CHAPTER_16_TOPICS } from './data/ada2026/ch16-hospital';"
];

// Insert imports
mainContent = mainContent.replace(
  "import { ADA_2026_CHAPTER_9_TOPICS } from './data/ada2026/ch9-pharmacologic';",
  "import { ADA_2026_CHAPTER_9_TOPICS } from './data/ada2026/ch9-pharmacologic';\n" + imports.join('\n')
);

// Insert topics pushes
mainContent = mainContent.replace(
  "topics.push(...ADA_2026_CHAPTER_9_TOPICS);",
  "topics.push(...ADA_2026_CHAPTER_9_TOPICS);\n    topics.push(...ADA_2026_CHAPTER_4_TOPICS);\n    topics.push(...ADA_2026_CHAPTER_5_TOPICS);\n    topics.push(...ADA_2026_CHAPTER_6_TOPICS);\n    topics.push(...ADA_2026_CHAPTER_7_TOPICS);\n    topics.push(...ADA_2026_CHAPTER_10_TOPICS);\n    topics.push(...ADA_2026_CHAPTER_11_TOPICS);\n    topics.push(...ADA_2026_CHAPTER_12_TOPICS);\n    topics.push(...ADA_2026_CHAPTER_13_TOPICS);\n    topics.push(...ADA_2026_CHAPTER_14_TOPICS);\n    topics.push(...ADA_2026_CHAPTER_15_TOPICS);\n    topics.push(...ADA_2026_CHAPTER_16_TOPICS);"
);

fs.writeFileSync(mainFile, mainContent);
console.log('Done generating all remaining chapters');
