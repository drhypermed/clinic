import type { GuidelineTopic } from '../../guidelinesData';

export const GINA_2025_SPECIFIC_POPULATIONS_TOPICS: GuidelineTopic[] = [
  {
    id: 'specific-populations-rhinitis-obesity',
    group: 'ginaSpecificPopulations',
    title: {
      en: 'Allergic Rhinitis, GERD & Obesity',
      ar: 'حساسية الأنف، ارتجاع المريء، والسمنة',
    },
    summary: {
      en: 'Common comorbidities that complicate asthma management and how to approach them.',
      ar: 'الأمراض المصاحبة الشائعة التي تعقد علاج الربو وكيفية التعامل معها.',
    },
    points: {
      en: [
        'Allergic rhinitis: Very common. Treat with intranasal corticosteroids.',
        'Chronic rhinosinusitis with nasal polyps: Associated with severe asthma. Some biologics (Anti-IgE, IL4Ra, IL5) treat both conditions.',
        'Obesity: Makes asthma difficult to control. Weight loss of even 5-10% significantly improves asthma control.',
        'GERD: Asymptomatic GERD does NOT cause poor asthma control. Only treat symptomatic reflux.',
      ],
      ar: [
        'حساسية الأنف: شائعة جداً ويجب علاجها ببخاخات الكورتيزون للأنف بالتوازي مع علاج الربو.',
        'التهاب الجيوب الأنفية المزمن مع اللحمية (Nasal Polyps): يرتبط بالربو الشديد. بعض الأدوية البيولوجية تعالج المرضين معاً في نفس الوقت.',
        'السمنة: تجعل الربو صعب السيطرة. فقدان المريض لـ 5% إلى 10% فقط من وزنه يُحسن حالته بشكل ملحوظ.',
        'ارتجاع المريء: الارتجاع (الصامت/بدون أعراض) لا يسبب تدهور الربو كما يُشاع. لا تعالج الارتجاع إلا لو كان المريض يشتكي من أعراضه.',
        'كبار السن: الأمراض الأخرى وأدويتها تعقد العلاج. راعِ مشاكل المفاصل، ضعف النظر، وضعف قوة الشفط عند اختيار نوع البخاخة المناسبة لهم.',
      ],
    },
    sourceIds: ['gina-2025-specific'],
    tags: ['rhinitis', 'obesity', 'GERD', 'comorbidities'],
  },
  {
    id: 'specific-populations-pregnancy',
    group: 'ginaSpecificPopulations',
    title: {
      en: 'Asthma in Pregnancy',
      ar: 'الربو أثناء الحمل',
    },
    summary: {
      en: 'Critical considerations for managing asthma in pregnant women.',
      ar: 'اعتبارات حاسمة لعلاج الربو لدى السيدات الحوامل.',
    },
    points: {
      en: [
        'Asthma control often changes during pregnancy (1/3 improve, 1/3 worsen, 1/3 stay the same).',
        'Uncontrolled asthma puts the baby at high risk of prematurity, low birth weight, and perinatal mortality.',
        'It is safer for pregnant women to take asthma medications than to have asthma exacerbations.',
        'NEVER stop ICS during pregnancy. Review asthma control every 4-6 weeks.',
      ],
      ar: [
        'السيطرة على الربو تتغير غالباً أثناء الحمل (الثلث يتحسن، الثلث يتدهور، الثلث يبقى كما هو).',
        'الربو غير المسيطر عليه يعرض الجنين لخطر الولادة المبكرة، نقص الوزن، أو حتى الوفاة.',
        'تناول أدوية الربو أثناء الحمل (آمن تماماً) وهو أفضل بكثير من ترك الأم تتعرض لانتكاسات ونقص أكسجين.',
        'إياك أن توقف الكورتيزون المستنشق (ICS) أثناء الحمل. راجع حالة الحامل كل 4-6 أسابيع.',
      ],
    },
    quickDecision: {
      warn: {
        en: 'Never step down or stop asthma controller medication (ICS) simply because the patient is pregnant.',
        ar: 'ممنوع تقليل أو إيقاف الأدوية الوقائية للربو لمجرد أن المريضة أصبحت حاملاً.',
      }
    },
    sourceIds: ['gina-2025-specific'],
    tags: ['pregnancy', 'maternal health'],
  },
  {
    id: 'gina-specific-aerd-food-allergy',
    group: 'ginaSpecificPopulations',
    title: {
      en: 'Aspirin-Exacerbated Respiratory Disease & Food Allergy',
      ar: 'الربو المحفز بالأسبرين وحساسية الطعام',
    },
    summary: {
      en: 'Managing AERD (NSAID hypersensitivity) and food allergies in asthma patients.',
      ar: 'التعامل مع التحسس من الأسبرين/المسكنات، وحساسية الطعام وارتباطها بالربو.',
    },
    points: {
      en: [
        'AERD: Strongly suspected if asthma exacerbates after taking aspirin/NSAIDs. Often linked to severe asthma and nasal polyps. Advise patient to AVOID ALL NSAIDs. Challenge testing or desensitization must only be done in a specialized center with resuscitation facilities.',
        'LTRA in AERD: Adding a leukotriene receptor antagonist (e.g., montelukast) may improve symptoms, but be cautious of neuropsychiatric side effects.',
        'Food Allergy: Rarely triggers asthma symptoms directly, but confirmed food allergy is a major risk factor for ASTHMA-RELATED DEATH. Patients must have an anaphylaxis plan and injectable epinephrine.',
      ],
      ar: [
        'الربو المحفز بالأسبرين (AERD): يُشتبه به بقوة إذا حدثت انتكاسة بعد أخذ أسبرين أو مسكنات (NSAIDs). غالباً يصاحبه ربو شديد ولحميات أنفية. انصح المريض بتجنب كل المسكنات تماماً. اختبارات التحسس تُجرى فقط في مراكز متخصصة مجهزة للإنعاش.',
        'المونتيلوكاست في (AERD): إضافته للعلاج قد تُحسن الأعراض بقوة، لكن احذر من أعراضه الجانبية النفسية.',
        'حساسية الطعام: نادراً ما تسبب أزمة ربو مباشرة، لكن وجود حساسية طعام مؤكدة هو عامل خطر رئيسي لـ (الوفاة بسبب الربو). يجب أن يمتلك المريض حقنة إبينفرين (Epinephrine) وخطة طوارئ للحساسية المفرطة.',
      ],
    },
    quickDecision: {
      warn: {
        en: 'Food allergy in an asthma patient increases the risk of fatal asthma. Ensure they have injectable epinephrine.',
        ar: 'حساسية الطعام لدى مريض الربو تزيد من خطر الوفاة. تأكد من توافر حقنة الإبينفرين (قلم الحساسية) لديه.',
      }
    },
    sourceIds: ['gina-2025-specific'],
    tags: ['AERD', 'aspirin', 'NSAIDs', 'food allergy', 'anaphylaxis'],
  },
  {
    id: 'gina-specific-surgery-covid',
    group: 'ginaSpecificPopulations',
    title: {
      en: 'Surgery & Respiratory Infections (COVID-19)',
      ar: 'العمليات الجراحية والالتهابات التنفسية (كوفيد-19)',
    },
    summary: {
      en: 'Peri-operative asthma management and guidelines during viral respiratory outbreaks.',
      ar: 'تجهيز مريض الربو للعمليات الجراحية، والتعليمات أثناء تفشي الفيروسات التنفسية.',
    },
    points: {
      en: [
        'Surgery: Perform when asthma is well-controlled. CONTINUE all ICS-containing treatments peri-operatively. If patient is on long-term high-dose ICS, or had >2 weeks of oral corticosteroids in the past 6 months, give intra-operative hydrocortisone to prevent adrenal crisis.',
        'COVID-19 / Viruses: Well-controlled asthma does NOT increase the risk of severe COVID-19 or death. However, severe asthma (recent OCS use or hospitalization) DOES increase death risk.',
        'Medication during infections: Patients MUST continue taking their prescribed ICS. Keep respiratory vaccines up to date (influenza, COVID-19, RSV, pneumococcus).',
        'Nebulizers: AVOID using nebulizers for patients with respiratory infections to prevent spreading the virus. Use pMDI with a spacer (and face mask if needed) instead.',
        'Spirometry: Avoid in confirmed/suspected COVID-19 patients.',
      ],
      ar: [
        'العمليات الجراحية: تُجرى عندما يكون الربو مستقراً. يجب استمرار استخدام بخاخات الكورتيزون (ICS) قبل وبعد العملية. إذا كان المريض على جرعات كورتيزون عالية أو أخذ كورتيزون بالفم لأكثر من أسبوعين خلال الـ 6 أشهر الماضية، يجب إعطاؤه "هيدروكورتيزون" أثناء العملية لمنع صدمة الغدة الكظرية.',
        'كوفيد-19 والفيروسات: الربو المستقر لا يزيد خطر الوفاة بكوفيد. لكن الربو الشديد (من يحتاجون كورتيزون بالفم أو حجز بالمستشفى) يزيد من خطر الوفاة.',
        'الأدوية أثناء العدوى: يجب على المريض (الاستمرار) في أخذ بخاخاته الوقائية (ICS) بانتظام تام. احرص على تطعيماته (الإنفلونزا، كورونا، المكورات الرئوية).',
        'أجهزة النيبولايزر: تجنب استخدام جلسات النيبولايزر لمرضى الالتهابات التنفسية لمنع نشر العدوى في الهواء. استخدم البخاخة المضغوطة (pMDI) مع قمع (Spacer) كبديل آمن وفعال.',
        'قياس وظائف الرئة (Spirometry): تجنب إجرائه للمشتبه بإصابتهم بكوفيد.',
      ],
    },
    sourceIds: ['gina-2025-specific'],
    tags: ['surgery', 'hydrocortisone', 'COVID-19', 'nebulizers', 'vaccines'],
  }
];