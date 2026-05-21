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
        'Base clinical choices on individual values, comorbidities, and realistic financial constraints.',
        'Avoid clinical inertia: timely treatment adjustments are critical.',
        'Individualize care across the life span; do not use a one-size-fits-all approach.',
      ],
      ar: [
        'يجب أن تعتمد اختيارات العلاج على قيم المريض، الأمراض المصاحبة، وقدرته المادية الواقعية.',
        'تجنب القصور السريري (Clinical Inertia): تعديل العلاج في الوقت المناسب أمر بالغ الأهمية.',
        'قم بتخصيص خطة الرعاية حسب عمر وحالة كل مريض؛ لا توجد خطة واحدة تناسب الجميع.',
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
        'Leverage virtual care (telehealth) when in-person visits are a barrier.',
        'Use patient registries and proactive outreach to catch patients lost to follow-up.',
      ],
      ar: [
        'استفد من الرعاية عن بُعد (Telehealth) عندما تكون الزيارات الحضورية عائقاً للمريض.',
        'استخدم سجلات المرضى والتواصل الاستباقي للوصول للمرضى المنقطعين عن المتابعة.',
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
        'Use objective data (A1C, BP, LDL) to benchmark clinic performance.',
        'Address treatment burden and cost in every chronic care visit.',
      ],
      ar: [
        'استخدم البيانات الموضوعية (كالتراكمي، ضغط الدم، والكوليسترول) لتقييم أداء العيادة بانتظام.',
        'ناقش عبء العلاج والتكلفة المادية مع المريض في كل زيارة متابعة.',
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
        'Screen for food and housing insecurity; they directly impact medication adherence.',
        'Refer to community health workers or lay navigators for patients struggling with SDOH.',
      ],
      ar: [
        'ابحث عن مؤشرات انعدام الأمن الغذائي أو السكني؛ فهي تؤثر بشكل مباشر على الالتزام بالعلاج.',
        'وجّه المرضى الذين يواجهون تحديات اجتماعية إلى مؤسسات دعم المجتمع أو الرعاية الاجتماعية المحلية.',
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
        'Youth: Coordinate with schools/caregivers and transition self-management responsibilities gradually.',
        'Older Adults: Assess cognition, mobility, vision, and adjust A1C targets to avoid hypoglycemia.',
        'Pregnancy: Immediate coordination with maternal-fetal specialists and strict postpartum follow-up is required.',
      ],
      ar: [
        'الأطفال والمراهقون: نسق مع المدارس والأهل، وقم بنقل مسؤولية الإدارة الذاتية تدريجياً.',
        'كبار السن: قيّم القدرة الإدراكية، الحركة، والنظر، وقم بتخفيف أهداف السكر لتجنب الهبوط.',
        'الحوامل: يتطلب الأمر تنسيقاً فورياً مع طبيب النساء والمتابعة الدقيقة جداً بعد الولادة.',
      ],
    },
    sourceIds: ['improving-care'],
    tags: ['subpopulations', 'youth', 'older adults', 'pregnancy', 'team roles'],
  },
];
