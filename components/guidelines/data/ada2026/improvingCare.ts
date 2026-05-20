import type { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_IMPROVING_CARE_TOPICS: GuidelineTopic[] = [
  {
    id: 'population-health-core',
    group: 'populationCare',
    title: {
      en: 'Population Health and Person-Centered Care',
      ar: 'صحة السكان والرعاية المتمركزة حول الشخص',
    },
    summary: {
      en: 'ADA emphasizes that population health requires policy, system, and person-level approaches, ensuring care is person-centered and aligned with the Quadruple Aim.',
      ar: 'تؤكد ADA أن صحة السكان تتطلب منهجيات على مستوى السياسات والنظام والشخص، لضمان رعاية متمركزة حول المريض تتماشى مع الأهداف الرباعية لجودة الرعاية (Quadruple Aim).',
    },
    points: {
      en: [
        'Ensure treatment decisions are timely, rely on evidence-based guidelines, address social determinants of health, and incorporate shared decision-making. (B)',
        'Clinical choices should account for individual values, preferences, prognoses, comorbidities, and informed financial considerations. (B)',
        'Align approaches to diabetes management with evidence-based care models emphasizing person-centered team care and ongoing collaborative goal setting. (A)',
        'Diabetes care must be individualized for each person\'s context across the life span.',
      ],
      ar: [
        'يجب أن تكون قرارات العلاج في وقتها المناسب، مبنية على الدليل، وتعالج محددات الصحة الاجتماعية، وتشمل القرار المشترك. (B)',
        'ينبغي أن تراعي الخيارات السريرية قيم الفرد، تفضيلاته، توقعات سيره المرضي، أمراضه المصاحبة، والاعتبارات المالية المستنيرة. (B)',
        'يجب مواءمة منهجيات إدارة السكري مع نماذج الرعاية المبنية على الدليل، والتي تركز على رعاية الفريق المتمركزة حول المريض وتحديد الأهداف التعاونية المستمرة. (A)',
        'يجب تخصيص رعاية السكري لتناسب سياق كل شخص على مدار مراحل حياته.',
      ],
    },
    details: [
      {
        title: { en: 'Practical Application', ar: 'تطبيق عملي' },
        items: {
          en: [
            'Assess treatment burden and costs alongside clinical guidelines to prevent cost-related medication nonadherence.',
            'Document limitations if ideal therapies are unaffordable, and prioritize high-value basics safely.',
          ],
          ar: [
            'قم بتقييم عبء وتكلفة العلاج بجانب الأدلة السريرية لمنع التوقف عن تناول الدواء لأسباب مادية.',
            'وثّق المعوقات إذا كانت العلاجات المثالية غير متاحة مادياً، وركز على الأساسيات عالية القيمة بأمان.',
          ],
        },
      },
    ],
    sourceIds: ['improving-care'],
    tags: ['population health', 'person-centered care', 'shared decision-making', 'cost'],
  },
  {
    id: 'care-models-teams',
    group: 'populationCare',
    title: {
      en: 'Care Delivery Models and Team-Based Care',
      ar: 'نماذج تقديم الرعاية والرعاية القائمة على الفريق',
    },
    summary: {
      en: 'Diabetes management should align with evidence-based Chronic Care Models emphasizing integrated long-term treatment and collaborative communication.',
      ar: 'يجب أن تتماشى إدارة السكري مع نماذج الرعاية المزمنة المبنية على الدليل، والتي تركز على العلاج طويل الأمد المتكامل والتواصل التعاوني.',
    },
    points: {
      en: [
        'Care systems should facilitate in-person and virtual team-based care. (B)',
        'Include those knowledgeable and experienced in diabetes management as part of the care team. (B)',
        'Utilize patient registries, decision support tools, proactive care planning, and community involvement to meet the needs of individuals with diabetes. (B)',
      ],
      ar: [
        'ينبغي للأنظمة الصحية أن تسهل الرعاية الجماعية حضورياً وافتراضياً (عن بُعد). (B)',
        'يجب أن يضم فريق الرعاية محترفين ذوي معرفة وخبرة في إدارة السكري. (B)',
        'ينبغي استخدام سجلات المرضى، أدوات دعم القرار، التخطيط الاستباقي للرعاية، وإشراك المجتمع لتلبية احتياجات المصابين بالسكري. (B)',
      ],
    },
    sourceIds: ['improving-care'],
    tags: ['team care', 'chronic care model', 'registries', 'virtual care'],
  },
  {
    id: 'quality-improvement',
    group: 'populationCare',
    title: {
      en: 'Quality Improvement and Measurement',
      ar: 'تحسين الجودة والقياس',
    },
    summary: {
      en: 'Health systems should adopt a culture of continuous quality improvement and implement benchmarking programs to improve care processes.',
      ar: 'ينبغي على الأنظمة الصحية تبني ثقافة التحسين المستمر للجودة وتطبيق برامج المقارنة المرجعية لتحسين مسارات الرعاية.',
    },
    points: {
      en: [
        'Assess diabetes management, risk factors, and complications using reliable and relevant data metrics to improve processes of care and health outcomes. (B)',
        'Ensure attention to individual values, preferences, goals for care, and treatment burden, including costs of care. (B)',
        'Health systems should adopt a culture of continuous quality improvement and implement benchmarking programs. (A)',
        'Engage interprofessional teams to support sustainable and scalable process changes to improve quality of care and health outcomes. (A)',
      ],
      ar: [
        'يجب تقييم إدارة السكري، عوامل الخطورة، والمضاعفات باستخدام مؤشرات بيانات موثوقة وذات صلة لتحسين مسارات الرعاية والنتائج الصحية. (B)',
        'تأكد من الاهتمام بقيم الفرد، وتفضيلاته، وأهداف الرعاية، وعبء العلاج، بما في ذلك تكاليف الرعاية. (B)',
        'ينبغي للأنظمة الصحية تبني ثقافة التحسين المستمر للجودة وتطبيق برامج المقارنة المرجعية. (A)',
        'قم بإشراك فرق متعددة التخصصات لدعم التغييرات المستدامة والقابلة للتوسع في مسارات العمل لتحسين جودة الرعاية والنتائج الصحية. (A)',
      ],
    },
    sourceIds: ['improving-care'],
    tags: ['quality improvement', 'benchmarking', 'metrics', 'data'],
  },
  {
    id: 'sdoh-disparities',
    group: 'populationCare',
    title: {
      en: 'Social Determinants of Health (SDOH) and Inequities',
      ar: 'محددات الصحة الاجتماعية (SDOH) والفجوات الصحية',
    },
    summary: {
      en: 'Systems and clinicians must actively assess and address SDOH, such as food and housing insecurity, to mitigate health inequities and inform treatment decisions.',
      ar: 'يجب على الأنظمة والأطباء تقييم ومعالجة محددات الصحة الاجتماعية بفعالية، مثل انعدام الأمن الغذائي والسكن، لتقليل الفجوات الصحية وتوجيه قرارات العلاج.',
    },
    points: {
      en: [
        'Health systems should assess and address gaps in diabetes care and health outcomes by stratifying clinical quality data by factors such as insurance status, race, ethnicity, preferred language, disability, and SDOH. (B)',
        'Provide people with diabetes additional self-management support from lay health coaches, navigators, or community health workers when available. (B)',
        'Consider digital self-management tools or coaches as appropriate. (B)',
        'Consider the involvement of community health workers to support management of diabetes and cardiovascular and kidney risk factors, especially in underserved communities. (B)',
      ],
      ar: [
        'ينبغي للأنظمة الصحية تقييم ومعالجة الفجوات في رعاية السكري عبر تصنيف بيانات الجودة السريرية حسب التأمين، العرق، اللغة، الإعاقة، ومحددات الصحة الاجتماعية (SDOH). (B)',
        'قم بتوفير دعم إضافي للإدارة الذاتية عبر الموجهين الصحيين، الملاحين، أو العاملين في صحة المجتمع عند توفرهم. (B)',
        'يمكن التفكير في استخدام أدوات أو موجهين رقميين للإدارة الذاتية حسبما يكون مناسباً. (B)',
        'ضع في اعتبارك إشراك العاملين في صحة المجتمع لدعم إدارة السكري وعوامل الخطورة للقلب والكلى، خاصة في المجتمعات المحرومة. (B)',
      ],
    },
    sourceIds: ['improving-care'],
    tags: ['SDOH', 'food insecurity', 'health equity', 'community health workers'],
  },
  {
    id: 'patient-subgroups',
    group: 'populationCare',
    title: {
      en: 'Interprofessional Team Support by Subpopulation',
      ar: 'دعم الفريق متعدد التخصصات حسب فئة المرضى',
    },
    summary: {
      en: 'Table 1.1 outlines unique care considerations and team engagement strategies across the life span, from youth to older adults and pregnancy.',
      ar: 'يوضح الجدول 1.1 الاعتبارات الخاصة بالرعاية واستراتيجيات إشراك الفريق عبر مراحل الحياة، من الأطفال وحتى كبار السن والحمل.',
    },
    points: {
      en: [
        'Intensive insulin therapy requires clinicians experienced in advanced diabetes management and technology.',
        'Children and adolescents need coordination with schools, caregivers, and gradual transition of self-management.',
        'Older adults require assessment of nutritional status, vision, hearing, dexterity, cognition, and mobility.',
        'Pregnant individuals need coordination with maternal-fetal medicine specialists, CDCES, and a planned transition to primary care postpartum.',
      ],
      ar: [
        'العلاج المكثف بالإنسولين يتطلب أطباء ذوي خبرة في الإدارة المتقدمة للسكري والتكنولوجيا.',
        'الأطفال والمراهقون يحتاجون تنسيقاً مع المدارس ومقدمي الرعاية، ونقلاً تدريجياً لمسؤولية الإدارة الذاتية.',
        'كبار السن يحتاجون تقييماً للحالة الغذائية، النظر، السمع، المهارة اليدوية، الإدراك، والحركة.',
        'الحوامل يحتجن تنسيقاً مع مختصي طب الجنين، ومثقفي السكري (CDCES)، وخطة انتقال منظمة للرعاية الأولية بعد الولادة.',
      ],
    },
    sourceIds: ['improving-care'],
    tags: ['subpopulations', 'youth', 'older adults', 'pregnancy', 'team roles'],
  },
];
