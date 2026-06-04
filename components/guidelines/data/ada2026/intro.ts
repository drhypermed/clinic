import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_1_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch1-principles',
    group: '1. Improving Care and Promoting Health in Populations',
    sourceIds: ['1-improving-care-and-promoting-health-in-populations-pdf', 'improving care'],
    tags: ['CCM', 'Team-based Care', 'Evidence-based'],
    title: {
      en: 'Basic Principles and Support Systems for Care',
      ar: 'المبادئ الأساسية والأنظمة الداعمة للرعاية'
    },
    summary: {
      en: 'Guidelines recommend adopting health systems that support evidence-based decisions, the Chronic Care Model (CCM), and team-based care to avoid therapeutic inertia.',
      ar: 'لتحسين صحة السكان، توصي الإرشادات بتبني أنظمة صحية تدعم القرارات المبنية على الأدلة، ونموذج الرعاية المزمنة، والرعاية القائمة على فريق العمل لتجنب القصور العلاجي.'
    },
    points: {
      en: [
        'Evidence-based and Timely Decisions: Treatment plans must rely on the latest evidence, integrating patient values, preferences, and financial circumstances.',
        'Chronic Care Model (CCM): Transition from reactive care to proactive care. This model includes 6 core elements: delivery system design, self-management support, decision support, clinical information systems, community resources, and health systems supporting quality. It is proven to lower A1C.',
        'Team-based Care: Care must involve an integrated team (PCP, endocrinologist, dietitian, diabetes educator, clinical pharmacist, and mental health professional) to avoid Therapeutic Inertia and adjust plans when needed.'
      ],
      ar: [
        'القرارات المبنية على الأدلة وفي الوقت المناسب: يجب أن تعتمد الخطة العلاجية على أحدث الأدلة، مع دمج قيم المريض وتفضيلاته وظروفه المادية.',
        'نموذج الرعاية المزمنة (CCM): الانتقال من الرعاية التفاعلية إلى الرعاية الاستباقية. يتضمن هذا النموذج 6 عناصر أساسية وأثبت فعاليته في خفض مستوى السكر التراكمي (A1C).',
        'الرعاية القائمة على فريق العمل: يجب ألا تقتصر الرعاية على الطبيب المعالج فقط، بل تتطلب فريقاً متكاملاً (طبيب رعاية أولية، طبيب غدد صماء، أخصائي تغذية، أخصائي تثقيف، صيدلي، وأخصائي صحة نفسية) لتجنب "القصور العلاجي" (Therapeutic Inertia).'
      ]
    }
  },
  {
    id: 'ada-2026-ch1-sdoh',
    group: '1. Improving Care and Promoting Health in Populations',
    sourceIds: ['1-improving-care-and-promoting-health-in-populations-pdf', 'improving care'],
    tags: ['SDOH', 'Food Insecurity', 'Financial Barriers'],
    title: {
      en: 'Social Determinants of Health (SDOH)',
      ar: 'محددات الصحة الاجتماعية (SDOH)'
    },
    summary: {
      en: 'Consultations must not be limited to prescriptions; routine assessment of social circumstances that hinder adherence is crucial. Connect patients with available community resources.',
      ar: 'يجب ألا تقتصر الاستشارة على الوصفة الطبية، بل يجب التقييم الروتيني للظروف الاجتماعية التي تعيق التزام المريض. يجب تقييم العوامل وربط المريض بالموارد المجتمعية المتاحة.'
    },
    points: {
      en: [
        'Food Insecurity: Affects the ability to buy healthy food, pushing patients to consume cheap high-carb foods (causing hyperglycemia) or skipping meals after insulin (causing severe hypoglycemia).',
        'Housing Insecurity: Prevents safe storage of insulin (in the fridge) or keeping treatment tools, doubling the difficulty of adherence.',
        'Financial Barriers: Consultants must explicitly discuss financial burdens. Many patients (e.g., 18.6% of Type 1) ration insulin to save money. High-deductible plans risk delayed tests and acute complications.',
        'Health Literacy & Language: Use professional interpreters and avoid relying on family members. Simplify treatment plans to match patient comprehension.'
      ],
      ar: [
        'انعدام الأمن الغذائي (Food Insecurity): يؤثر على القدرة على شراء طعام صحي، مما يدفع لاستهلاك أطعمة رخيصة غنية بالكربوهيدرات أو تخطي الوجبات بعد أخذ الإنسولين (يسبب هبوط حاد).',
        'عدم استقرار السكن (Housing Insecurity): يمنع المريض من إيجاد مكان آمن لتخزين الإنسولين (في الثلاجة) أو الاحتفاظ بأدوات العلاج، مما يضاعف من صعوبة الالتزام.',
        'التكلفة المالية (Financial Barriers): يجب مناقشة الأعباء المالية صراحةً؛ حيث يلجأ الكثيرون لتقليل جرعات الإنسولين لتوفير المال (Rationing).',
        'ضعف المعرفة الصحية واللغوية: يُنصح باستخدام مترجمين محترفين وتجنب الاعتماد على الأسرة للترجمة، وتبسيط الخطط العلاجية لتناسب مستوى استيعاب المرضى.'
      ]
    }
  },
  {
    id: 'ada-2026-ch1-telehealth',
    group: '1. Improving Care and Promoting Health in Populations',
    sourceIds: ['1-improving-care-and-promoting-health-in-populations-pdf', 'improving care'],
    tags: ['Telehealth', 'Digital Divide'],
    title: {
      en: 'Integration of Technology and Telehealth',
      ar: 'دمج التكنولوجيا وخدمات الرعاية عن بعد (Telehealth)'
    },
    summary: {
      en: 'Telehealth is highly effective in reducing A1C and blood pressure, but it is complementary to in-person care and providers must be wary of the digital divide.',
      ar: 'الرعاية عن بعد والطب الاتصالي تعتبر مكملة للرعاية الشخصية وليست بديلاً عنها تماماً، مع ضرورة الحذر من الفجوة الرقمية.'
    },
    points: {
      en: [
        'Complementary, not a replacement: Telehealth and telemedicine are complementary to personal care and not a complete substitute.',
        'Efficacy: Strongly proven to lower A1C and blood pressure, and very useful for patients in rural or marginalized areas.',
        'Digital Divide: The guidelines warn against blind reliance on technology without assessing the patient\'s access to the internet or smart devices, to avoid deepening care inequality.'
      ],
      ar: [
        'تكملة لا بديل: الرعاية عن بعد والطب الاتصالي تعتبر مكملة للرعاية الشخصية وليست بديلاً عنها تماماً.',
        'الفعالية: أثبتت فعاليتها بقوة في خفض السكر التراكمي (A1C) وتخفيض ضغط الدم، وهي مفيدة جداً للمرضى في المناطق الريفية أو المهمشة.',
        'الفجوة الرقمية (Digital Divide): يُحذر الدليل الأطباء من الاعتماد الأعمى على التكنولوجيا دون تقييم قدرة المريض على الوصول للإنترنت أو امتلاك أجهزة ذكية.'
      ]
    }
  },
  {
    id: 'ada-2026-ch1-community',
    group: '1. Improving Care and Promoting Health in Populations',
    sourceIds: ['1-improving-care-and-promoting-health-in-populations-pdf', 'improving care'],
    tags: ['CHW', 'Community Support'],
    title: {
      en: 'Community Support and Health Workers',
      ar: 'إشراك العمالة المجتمعية والمثقفين'
    },
    summary: {
      en: 'The guidelines recommend engaging Community Health Workers (CHWs) and peer supporters, especially in underserved communities.',
      ar: 'تُوصي الإرشادات بإشراك العاملين في مجال صحة المجتمع (CHWs) والمسعفين المجتمعيين وزملاء الدعم، خاصة في المجتمعات المحرومة.'
    },
    points: {
      en: [
        'Crucial Role: These individuals play a critical role in linking patients to clinics, providing social support, and monitoring lifestyle, which reduces the burden on medical clinics.'
      ],
      ar: [
        'دور حاسم: هؤلاء الأشخاص يلعبون دوراً حاسماً في ربط المرضى بالعيادات، تقديم الدعم الاجتماعي، ومتابعة نمط الحياة، مما يقلل من العبء على العيادات الطبية.'
      ]
    }
  },
  {
    id: 'ada-2026-ch1-qi',
    group: '1. Improving Care and Promoting Health in Populations',
    sourceIds: ['1-improving-care-and-promoting-health-in-populations-pdf', 'improving care'],
    tags: ['QI', 'Quality Improvement'],
    title: {
      en: 'Continuous Quality Improvement (QI)',
      ar: 'التطوير المستمر لجودة الرعاية (QI)'
    },
    summary: {
      en: 'Success in diabetes management in 2026 requires evaluating patients as humans in specific environments, blending medical recommendations with support for systemic quality improvement.',
      ar: 'النجاح في إدارة السكري يتطلب تقييماً شاملاً للمريض كإنسان يعيش في بيئة معينة. التدخل الناجح يجمع بين التوصيات الطبية وتوفير الدعم ضمن فريق طبي.'
    },
    points: {
      en: [
        'Evaluation Metrics: Healthcare institutions must assess diabetes patient outcomes using reliable metrics (e.g., meeting glucose and blood pressure goals).',
        'QI Teams: Form Quality Improvement (QI) teams that rely on data analysis to identify care gaps, especially those based on race, income, or insurance type, to make systemic corrections.'
      ],
      ar: [
        'مقاييس التقييم: يجب على المؤسسات الصحية تقييم نتائج مرضى السكري باستخدام مقاييس موثوقة (مثل نسبة تحقيق أهداف السكر وضغط الدم).',
        'فرق الجودة (QI Teams): يجب تشكيل فرق لتحسين الجودة تعتمد على تحليل البيانات لتحديد الفجوات في الرعاية، لاتخاذ قرارات نظامية تصحح الخلل.'
      ]
    }
  },
  {
    id: 'ada-2026-ch1-conclusion',
    group: '1. Improving Care and Promoting Health in Populations',
    sourceIds: ['1-improving-care-and-promoting-health-in-populations-pdf', 'improving care'],
    tags: ['Conclusion', 'Summary'],
    title: {
      en: 'Conclusion',
      ar: 'الخلاصة'
    },
    summary: {
      en: 'Management no longer relies solely on prescribing the latest drugs; it demands a comprehensive evaluation of cost, housing, and food barriers within a multidisciplinary team.',
      ar: 'النجاح في الإدارة لم يعد يعتمد فقط على أحدث الأدوية، بل يتطلب تقييماً شاملاً للمريض. التدخل الناجح يجمع بين التوصيات الدقيقة، والدعم لتخطي حواجز التكلفة والسكن.'
    },
    points: {
      en: [],
      ar: []
    }
  }
];
