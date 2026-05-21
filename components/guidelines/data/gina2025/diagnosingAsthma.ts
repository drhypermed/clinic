import type { GuidelineTopic } from '../../guidelinesData';

export const GINA_2025_DIAGNOSIS_TOPICS: GuidelineTopic[] = [
  {
    id: 'diagnosing-asthma-criteria',
    group: 'ginaDiagnosis',
    title: {
      en: 'Diagnosing Asthma & Clinical Features',
      ar: 'تشخيص الربو والأعراض السريرية',
    },
    summary: {
      en: 'Asthma is defined by a history of variable respiratory symptoms and evidence of variable expiratory airflow.',
      ar: 'يتم تشخيص الربو بناءً على تاريخ مرضي لأعراض تنفسية متغيرة مع وجود دليل على تذبذب تدفق الهواء الزفيري.',
    },
    points: {
      en: [
        'Asthma has two defining features: 1) History of typical variable respiratory symptoms (wheeze, shortness of breath, chest tightness, cough). 2) Variable expiratory airflow.',
        'Symptoms vary over time and in intensity, often worsening at night or upon waking.',
        'Symptoms are triggered by exercise, laughter, allergens, cold air, or viral infections.',
        'Physical examination is often normal, but wheezing may be heard during forced expiration.',
        'Do not rely on symptoms alone; diagnosis should be confirmed with spirometry or PEF before starting chronic treatment if possible.',
      ],
      ar: [
        'التشخيص يعتمد على ركنين: 1) أعراض تنفسية متغيرة (تزييق، نهجان، ضيق بالصدر، كحة). 2) تذبذب في تدفق الهواء أثناء الزفير.',
        'الأعراض تتغير في شدتها ووقت حدوثها، وغالباً ما تزيد بالليل أو عند الاستيقاظ.',
        'مثيرات الأعراض (Triggers) تشمل: المجهود، الضحك، مسببات الحساسية، الهواء البارد، والعدوى الفيروسية.',
        'الفحص السريري (بالسماعة) غالباً ما يكون طبيعياً، لكن قد يُسمع صوت تزييق (Wheezing) أثناء الزفير القوي.',
        'لا تعتمد على الأعراض فقط؛ يجب تأكيد التشخيص باستخدام قياس كفاءة الرئة (Spirometry) أو قياس قوة الزفير (PEF) قبل بدء العلاج الدائم إن أمكن.',
      ],
    },
    sourceIds: ['gina-2025-diagnosis'],
    tags: ['diagnosis', 'symptoms', 'spirometry', 'PEF'],
  },
  {
    id: 'definitions-triggers',
    group: 'ginaDiagnosis',
    title: {
      en: 'Definitions & Triggers',
      ar: 'التعريفات ومثيرات الربو',
    },
    summary: {
      en: 'Understanding the basic definitions of asthma, its triggers, and what constitutes an exacerbation.',
      ar: 'فهم التعريفات الأساسية للربو، مثيراته، وما الذي يشكل انتكاسة (نوبة) الربو.',
    },
    points: {
      en: [
        'Asthma: A chronic respiratory disease usually characterized by chronic airway inflammation. Airways become narrower (bronchoconstriction), walls thicken, and there is more mucus.',
        'Triggers: Viral infections, allergens (dust mites, pets, pollen), tobacco smoke, exercise, and stress. Some medicines (beta-blockers, NSAIDs) can also trigger symptoms.',
        'Asthma Exacerbation: Acute or sub-acute worsening in symptoms and lung function compared with the patient\'s usual condition.',
      ],
      ar: [
        'الربو: مرض تنفسي مزمن يتميز بالتهاب مزمن في الممرات الهوائية. تضيق الممرات (انقباض الشعب)، وتزداد سماكة جدرانها، ويزيد إفراز المخاط.',
        'مثيرات الربو: العدوى الفيروسية، مسببات الحساسية (عث الغبار، الحيوانات الأليفة، حبوب اللقاح)، دخان التبغ، المجهود، والضغط النفسي. بعض الأدوية (مثل حاصرات بيتا ومسكنات الألم) قد تثير الأعراض.',
        'انتكاسة الربو (الأزمة): تدهور حاد أو تدريجي في الأعراض ووظائف الرئة مقارنة بالحالة المعتادة للمريض.',
      ],
    },
    sourceIds: ['gina-2025-diagnosis'],
    tags: ['definitions', 'triggers', 'exacerbations'],
  },
  {
    id: 'diagnosis-steps-adults',
    group: 'ginaDiagnosis',
    title: {
      en: 'Steps for Confirming Diagnosis',
      ar: 'خطوات تأكيد التشخيص',
    },
    summary: {
      en: 'Criteria and exact values for confirming variable expiratory airflow in adults and children.',
      ar: 'المعايير والقيم الدقيقة لتأكيد تذبذب تدفق الهواء الزفيري لدى البالغين والأطفال.',
    },
    points: {
      en: [
        'Bronchodilator Reversibility (Spirometry): FEV1 increases by ≥12% and ≥200 mL in adults (or ≥12% in children) after taking a bronchodilator.',
        'PEF Variability: Excessive daily variability over 2 weeks (>10% in adults, >13% in children).',
        'Significant response to ICS: FEV1 increases by ≥12% and ≥200 mL after 4 weeks of ICS treatment.',
        'Role of Type 2 Biomarkers: Elevated FeNO or blood eosinophils can support the diagnosis of Type 2 asthma if lung function tests are not definitive, but low levels do not rule out asthma.',
      ],
      ar: [
        'استجابة موسع الشعب (Spirometry): زيادة حجم الزفير القسري (FEV1) بنسبة ≥12% وبمقدار ≥200 مل في البالغين (أو ≥12% في الأطفال) بعد استخدام موسع الشعب.',
        'تذبذب قياس قوة الزفير (PEF): تذبذب يومي مفرط على مدار أسبوعين (أكثر من 10% للبالغين، أكثر من 13% للأطفال).',
        'الاستجابة لـ ICS: تحسن FEV1 بنسبة ≥12% وبمقدار ≥200 مل بعد العلاج بالكورتيزون المستنشق لمدة 4 أسابيع.',
        'دور المؤشرات الحيوية (Biomarkers): ارتفاع الـ FeNO أو الخلايا الحمضية (Eosinophils) بالدم قد يدعم تشخيص الربو من النوع 2، لكن النسب الطبيعية لا تنفي وجود الربو.',
      ],
    },
    sourceIds: ['gina-2025-diagnosis'],
    tags: ['spirometry', 'PEF', 'biomarkers', 'FeNO'],
  },
  {
    id: 'diagnosing-specific-populations',
    group: 'ginaDiagnosis',
    title: {
      en: 'Diagnosing Asthma in Specific Populations',
      ar: 'تشخيص الربو في حالات خاصة',
    },
    summary: {
      en: 'Important considerations for diagnosing asthma in pregnant women, the elderly, those with persistent cough, or patients already on ICS.',
      ar: 'اعتبارات هامة لتشخيص الربو لدى الحوامل، كبار السن، المرضى الذين يعانون من سعال مستمر، أو المرضى الذين يستخدمون الـ ICS بالفعل.',
    },
    points: {
      en: [
        'Persistent Cough: Cough-variant asthma may only present with a dry cough. Treat with ICS like other asthma phenotypes. Rule out GERD and ACE inhibitors.',
        'Pregnant Women: NEVER stop or reduce ICS treatment during pregnancy. It is essential for the baby\'s health. Postpone bronchial provocation testing until after delivery.',
        'Older Adults: Often under-diagnosed. Distinguish from heart failure and COPD. Asthma+COPD overlap requires ICS treatment.',
        'Patients already on ICS: If uncontrolled, step up treatment and check after 3 months. If controlled, consider stepping down to confirm diagnosis.',
      ],
      ar: [
        'السعال المستمر: قد يكون السعال الجاف هو العرض الوحيد للربو (Cough-variant asthma). يُعالج بالـ ICS. يجب استبعاد ارتجاع المريء وأدوية الضغط (ACE inhibitors).',
        'الحوامل: إياك أن توقف أو تقلل جرعة الـ ICS أثناء الحمل لحماية الجنين. يُمنع إجراء اختبارات التحدي التنفسي أثناء الحمل، وانتظر لبعد الولادة.',
        'كبار السن: غالباً ما يُشخص الربو خطأ لديهم. يجب التفريق بينه وبين ضعف عضلة القلب والسدة الرئوية (COPD). تداخل الربو مع COPD يستلزم العلاج بـ ICS.',
        'المرضى الذين يستخدمون ICS: إذا كانت الأعراض غير مسيطر عليها، ارفع الجرعة لمدة 3 أشهر ثم أعد التقييم. إذا كانت مسيطراً عليها، يمكنك محاولة تقليل الجرعة لتأكيد التشخيص.',
      ],
    },
    quickDecision: {
      warn: {
        en: 'Never stop ICS in pregnant women. Do not perform bronchial provocation testing during pregnancy.',
        ar: 'ممنوع إيقاف الكورتيزون المستنشق (ICS) للحامل، وممنوع عمل اختبار التحدي التنفسي (Provocation test) أثناء الحمل.',
      }
    },
    sourceIds: ['gina-2025-diagnosis'],
    tags: ['pregnancy', 'elderly', 'cough', 'COPD'],
  }
];