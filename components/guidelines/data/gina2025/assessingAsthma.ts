import type { GuidelineTopic } from '../../guidelinesData';

export const GINA_2025_ASSESSMENT_TOPICS: GuidelineTopic[] = [
  {
    id: 'assessing-asthma-control',
    group: 'ginaAssessment',
    title: {
      en: 'Assessing Asthma Control',
      ar: 'تقييم التحكم في الربو',
    },
    summary: {
      en: 'Asthma control involves assessing both symptom control over the past 4 weeks and future risk factors for exacerbations.',
      ar: 'تقييم التحكم في الربو يعتمد على شقين: السيطرة على الأعراض خلال آخر 4 أسابيع، وتقييم عوامل الخطر المستقبلية لحدوث انتكاسات.',
    },
    points: {
      en: [
        'Assess asthma at every visit, especially after an exacerbation or when prescribing new medication. Assess at least annually even if asymptomatic.',
        'Symptom control assessment (past 4 weeks): 1) Daytime symptoms > twice/week? 2) Night waking due to asthma? 3) SABA reliever needed > twice/week? 4) Activity limitation due to asthma? The SABA question applies only to patients using SABA reliever, not ICS-formoterol reliever.',
        'Level of control: Well controlled (0 items), Partly controlled (1-2 items), Uncontrolled (3-4 items).',
        'Lung function monitoring: Measure before starting ICS, 3-6 months later, then every 1-2 years (more frequently in high-risk patients).',
        'Always check inhaler technique, adherence, written action plan, and multimorbidities (e.g., GERD, obesity, sleep apnea).',
      ],
      ar: [
        'يجب تقييم الربو في كل زيارة، وخاصة بعد حدوث انتكاسة أو عند كتابة روشتة جديدة. ويُقيم مرة سنوياً على الأقل حتى لو لم توجد أعراض.',
        'السيطرة على الأعراض (آخر 4 أسابيع): هل يوجد 1) أعراض نهارية أكثر من مرتين بالأسبوع؟ 2) استيقاظ بالليل بسبب الربو؟ 3) احتياج لموسع الشعب SABA أكثر من مرتين بالأسبوع؟ 4) تقييد في النشاط اليومي؟ سؤال SABA ينطبق فقط على مستخدمي SABA وليس مستخدمي ICS-formoterol كمسكن.',
        'درجة التحكم: مسيطر عليه (ولا واحدة من السابق)، مسيطر عليه جزئياً (1-2 مما سبق)، غير مسيطر عليه (3-4 مما سبق).',
        'متابعة وظائف الرئة: تُقاس قبل بدء الكورتيزون المستنشق، ثم بعد 3-6 أشهر، ثم كل 1-2 سنة (أو أكثر للمرضى الأكثر عرضة للمخاطر).',
        'تأكد دائماً من: طريقة استخدام البخاخة، التزام المريض بالجرعات، وجود خطة عمل مكتوبة، والأمراض المصاحبة (كارتجاع المريء والسمنة).',
      ],
    },
    sourceIds: ['gina-2025-assessment'],
    tags: ['assessment', 'control', 'lung function', 'adherence'],
  },
  {
    id: 'risk-factors-exacerbations',
    group: 'ginaAssessment',
    title: {
      en: 'Risk Factors for Exacerbations',
      ar: 'عوامل الخطر لحدوث انتكاسات (Asthma Attacks)',
    },
    summary: {
      en: 'Identifying features that increase the patient’s future risk of having exacerbations, loss of lung function, or medication side-effects.',
      ar: 'تحديد العوامل التي تزيد من خطر تعرض المريض لانتكاسات، أو تدهور وظائف الرئة، أو الأعراض الجانبية للأدوية.',
    },
    points: {
      en: [
        'Uncontrolled asthma symptoms are a major risk factor for exacerbations.',
        'Over-use of SABA (≥3 canisters/year) increases risk of exacerbations; extremely high use (≥12 canisters/year) increases mortality.',
        'Inadequate ICS (not prescribed, poor adherence, incorrect inhaler technique).',
        'Medical conditions: Obesity, chronic rhinosinusitis, GERD, confirmed food allergy, pregnancy.',
        'Other risks: Exposure to tobacco smoke or allergens, major psychological problems, low FEV1 (<60%), Type 2 inflammatory markers (high FeNO or blood eosinophils), or a history of severe exacerbation in the past year.',
      ],
      ar: [
        'الأعراض غير المسيطر عليها تعتبر من أهم عوامل الخطر لحدوث الانتكاسات.',
        'الإفراط في استخدام موسع الشعب SABA (3 بخاخات أو أكثر في السنة) يزيد خطر الانتكاسة؛ والاستخدام المفرط جداً (12 بخاخة أو أكثر) يزيد خطر الوفاة.',
        'نقص أو غياب الكورتيزون المستنشق (ICS) بسبب عدم وصفه طبياً، عدم التزام المريض، أو استخدامه للبخاخة بشكل خاطئ.',
        'أمراض أخرى مصاحبة: السمنة، التهاب الجيوب الأنفية المزمن، الارتجاع المريئي، حساسية الطعام المؤكدة، والحمل.',
        'مخاطر أخرى: التدخين، التعرض لمسببات الحساسية، المشاكل النفسية الكبيرة، ضعف وظائف الرئة (FEV1 < 60%)، ارتفاع مؤشرات الالتهاب، أو وجود تاريخ لانتكاسة شديدة في السنة الماضية.',
      ],
    },
    sourceIds: ['gina-2025-assessment'],
    tags: ['risk factors', 'exacerbations', 'SABA over-use'],
  },
  {
    id: 'asthma-severity',
    group: 'ginaAssessment',
    title: {
      en: 'Assessing Asthma Severity',
      ar: 'تقييم شدة الربو (Severity)',
    },
    summary: {
      en: 'Asthma severity is assessed retrospectively based on the level of treatment needed to control symptoms and prevent exacerbations.',
      ar: 'شدة الربو تُقيّم بأثر رجعي بناءً على مستوى العلاج المطلوب للسيطرة على الأعراض ومنع الانتكاسات.',
    },
    points: {
      en: [
        'Asthma severity is usually assessed after several months of continuous treatment.',
        'Difficult-to-treat asthma: Uncontrolled despite medium/high-dose ICS+LABA. Often due to modifiable factors (poor inhaler technique, non-adherence, smoking, incorrect diagnosis).',
        'Severe asthma: Uncontrolled DESPITE optimized high-dose ICS+LABA and management of contributory factors.',
        'Mild asthma: A misleading term. Even patients with "mild" or infrequent symptoms can have severe/fatal exacerbations if treated with SABA alone. It should be controlled with low-dose ICS-formoterol as needed or daily low-dose ICS.',
        'How to investigate uncontrolled asthma: 1) Watch inhaler technique. 2) Discuss adherence empathetically. 3) Confirm diagnosis. 4) Manage comorbidities. 5) Consider step-up treatment.',
      ],
      ar: [
        'شدة الربو تُقيّم (بأثر رجعي) بعد عدة أشهر من العلاج المستمر للوصول للسيطرة.',
        'الربو صعب العلاج (Difficult-to-treat): يكون غير مسيطر عليه بالرغم من العلاج، لكن السبب غالباً قابل للتعديل (استخدام خاطئ للبخاخة، عدم الالتزام بالجرعات، التدخين، التشخيص الخاطئ).',
        'الربو الشديد (Severe): يظل غير مسيطر عليه حتى مع الالتزام التام بأقصى جرعات العلاج (High-dose ICS+LABA) وعلاج كل العوامل المصاحبة.',
        'الربو الخفيف (Mild): مصطلح خادع، فالمريض قد يتعرض لانتكاسة قاتلة إذا اعتمد على موسع الشعب فقط (SABA). الحل هو استخدام ICS-formoterol عند اللزوم أو ICS يومياً.',
        'خطوات استكشاف عدم السيطرة: 1) راقب المريض وهو يستخدم البخاخة. 2) ناقش التزامه بالعلاج بتعاطف. 3) تأكد من التشخيص. 4) عالج الأمراض المصاحبة. 5) ارفع جرعة العلاج (Step-up).',
      ],
    },
    quickDecision: {
      customBlocks: [
        {
          title: { en: 'Rule of Thumb', ar: 'قاعدة هامة' },
          content: {
            en: 'Always check inhaler technique and adherence first before stepping up treatment.',
            ar: 'دائماً افحص طريقة استخدام المريض للبخاخة والتزامه بالجرعات (قبل) أن تفكر في زيادة العلاج.',
          },
          color: 'blue'
        }
      ]
    },
    sourceIds: ['gina-2025-assessment'],
    tags: ['severity', 'severe asthma', 'mild asthma', 'difficult-to-treat', 'adherence'],
  }
];
