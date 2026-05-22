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
        'Bronchodilator reversibility: in adults, FEV1 or FVC increases by >=12% and >=200 mL after bronchodilator; in children, FEV1 increases by >=12% predicted (or PEF by >=15%).',
        'PEF Variability: Excessive daily variability over 2 weeks (>10% in adults, >13% in children).',
        'Significant response to ICS: in adults, FEV1 or FVC increases by >=12% and >=200 mL after 4 weeks of ICS treatment; in children, FEV1 increases by >=12% predicted (or PEF by >=15%).',
        'Role of Type 2 biomarkers: elevated FeNO (>50 ppb in adults/adolescents, >35 ppb in children) or blood eosinophils can support Type 2 asthma if lung function tests are unavailable or negative; low levels do not rule out asthma.',
      ],
      ar: [
        'استجابة موسع الشعب: في البالغين يزيد FEV1 أو FVC بنسبة >=12% وبمقدار >=200 مل بعد موسع الشعب؛ وفي الأطفال يزيد FEV1 بنسبة >=12% من المتوقع (أو يزيد PEF بنسبة >=15%).',
        'تذبذب قياس قوة الزفير (PEF): تذبذب يومي مفرط على مدار أسبوعين (أكثر من 10% للبالغين، أكثر من 13% للأطفال).',
        'الاستجابة لـ ICS: في البالغين يتحسن FEV1 أو FVC بنسبة >=12% وبمقدار >=200 مل بعد 4 أسابيع من ICS؛ وفي الأطفال يزيد FEV1 بنسبة >=12% من المتوقع (أو يزيد PEF بنسبة >=15%).',
        'دور المؤشرات الحيوية: ارتفاع FeNO (>50 ppb في البالغين/المراهقين، >35 ppb في الأطفال) أو ارتفاع الإيزينوفيل بالدم قد يدعم تشخيص ربو Type 2 عند عدم توفر اختبارات وظائف الرئة أو سلبيتها؛ القيم المنخفضة لا تنفي الربو.',
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
        'Pregnant women: Advise that ICS-containing treatment during pregnancy is important for the baby\'s health, and do not stop or reduce ICS. Postpone bronchial provocation testing until after delivery.',
        'Older Adults: Often under-diagnosed. Distinguish from heart failure and COPD. Asthma+COPD overlap requires ICS treatment.',
        'Patients already on ICS: If uncontrolled, step up treatment and check after 3 months. If controlled, consider stepping down to confirm diagnosis.',
      ],
      ar: [
        'السعال المستمر: قد يكون السعال الجاف هو العرض الوحيد للربو (Cough-variant asthma). يُعالج بالـ ICS. يجب استبعاد ارتجاع المريء وأدوية الضغط (ACE inhibitors).',
        'الحوامل: وضّح أن العلاج المحتوي على ICS أثناء الحمل مهم لصحة الجنين، ولا توقف أو تقلل ICS أثناء الحمل. أجّل اختبارات التحدي التنفسي إلى ما بعد الولادة.',
        'كبار السن: غالباً ما يُشخص الربو خطأ لديهم. يجب التفريق بينه وبين ضعف عضلة القلب والسدة الرئوية (COPD). تداخل الربو مع COPD يستلزم العلاج بـ ICS.',
        'المرضى الذين يستخدمون ICS: إذا كانت الأعراض غير مسيطر عليها، ارفع الجرعة لمدة 3 أشهر ثم أعد التقييم. إذا كانت مسيطراً عليها، يمكنك محاولة تقليل الجرعة لتأكيد التشخيص.',
      ],
    },
    quickDecision: {
      warn: {
        en: 'Do not stop or reduce ICS in pregnant women, and do not perform bronchial provocation testing during pregnancy.',
        ar: 'لا توقف أو تقلل الكورتيزون المستنشق (ICS) للحامل، ولا تُجرِ اختبار التحدي التنفسي (Provocation test) أثناء الحمل.',
      }
    },
    sourceIds: ['gina-2025-diagnosis'],
    tags: ['pregnancy', 'elderly', 'cough', 'COPD'],
  }
];
