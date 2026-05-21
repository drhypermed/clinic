import type { GuidelineTopic } from '../../guidelinesData';

export const GINA_2025_GENERAL_PRINCIPLES_TOPICS: GuidelineTopic[] = [
  {
    id: 'essential-asthma-medicines',
    group: 'ginaGeneral',
    title: {
      en: 'Essential Asthma Medicines (The Danger of SABA-only)',
      ar: 'الأدوية الأساسية للربو (وخطورة الاعتماد على موسع الشعب فقط)',
    },
    summary: {
      en: 'Every patient must receive an inhaled corticosteroid (ICS). Treating asthma with SABA alone is dangerous and no longer recommended.',
      ar: 'كل مريض ربو يجب أن يحصل على كورتيزون مستنشق (ICS). علاج الربو بموسع الشعب فقط (SABA) أصبح خطراً وممنوعاً.',
    },
    points: {
      en: [
        'ICS-containing medication should be started as soon as possible after diagnosis to reduce hospitalizations, deaths, and severe exacerbations.',
        'Even patients with "mild" or infrequent symptoms can have fatal exacerbations if not protected by ICS.',
        'Low-dose ICS-formoterol is the preferred reliever for adults and adolescents instead of SABA.',
        'SABA-only treatment is associated with increased airway inflammation, reduced bronchodilator response, and increased risk of asthma death.',
        'Dispensing ≥3 SABA canisters per year increases the risk of severe exacerbations. Dispensing ≥12 canisters/year increases the risk of death.',
      ],
      ar: [
        'يجب البدء في الكورتيزون المستنشق (ICS) فور التشخيص لتقليل الحجز بالمستشفيات وتقليل الوفيات والانتكاسات.',
        'حتى مرضى الربو "الخفيف" أو الذين تأتيهم الأعراض نادراً قد يتعرضون لانتكاسات قاتلة إن لم يكونوا محميين بـ ICS.',
        'بخاخة (ICS-formoterol) بجرعة منخفضة هي البخاخة الإسعافية المُفضلة للبالغين والمراهقين بدلاً من الفينتولين (SABA).',
        'الاعتماد على الفينتولين وحده (SABA-only) يسبب زيادة التهاب الشعب الهوائية، تقليل الاستجابة لموسع الشعب، وزيادة خطر الوفاة.',
        'استهلاك 3 بخاخات فينتولين أو أكثر سنوياً يزيد خطر الانتكاسات الشديدة. واستهلاك 12 بخاخة أو أكثر يزيد خطر الموت بسبب الربو.',
      ],
    },
    quickDecision: {
      warn: {
        en: 'For safety, GINA recommends that asthma should NEVER be treated solely with as-needed SABA.',
        ar: 'لأجل سلامة المريض، تمنع GINA منعاً باتاً علاج الربو بموسع الشعب فقط (الفينتولين) عند اللزوم.',
      }
    },
    sourceIds: ['gina-2025-general'],
    tags: ['SABA', 'ICS', 'mortality', 'inflammation'],
  },
  {
    id: 'principles-selecting-treatment',
    group: 'ginaGeneral',
    title: {
      en: 'Principles of Selecting & Adjusting Treatment',
      ar: 'مبادئ اختيار وتعديل العلاج',
    },
    summary: {
      en: 'How to select the right inhaler, use the stepwise approach, and run the Assess-Adjust-Review cycle.',
      ar: 'كيفية اختيار البخاخة المناسبة، استخدام النهج المتدرج (Steps)، وإدارة دورة (تقييم - تعديل - مراجعة).',
    },
    points: {
      en: [
        'Treatment is presented in "Steps" (1 to 5). Step 5 represents the highest intensity.',
        'Treatment can be stepped up or down. Step down when asthma is well controlled for 2-3 months.',
        'The Assess-Adjust-Review cycle must be continuous. Review 1-3 months after starting, then every 3-12 months (4-6 weeks in pregnancy).',
        'Choosing Inhalers: Check physical ability (arthritis), skills, and cost. Patients using pMDI should use a spacer.',
        'Always check inhaler technique by physically watching the patient use it at every visit. Correct errors immediately.',
      ],
      ar: [
        'يتم عرض العلاج في درجات (Steps) من 1 إلى 5. الدرجة 5 هي الأقوى.',
        'يمكن زيادة العلاج أو تقليله. يُفضل تقليل العلاج (Step-down) إذا كانت الحالة مستقرة ومسيطر عليها لمدة 2-3 أشهر.',
        'دورة (التقييم - التعديل - المراجعة) مستمرة. يُراجع المريض بعد 1-3 أشهر من بدء العلاج، ثم كل 3-12 شهر (كل 4-6 أسابيع للحوامل).',
        'اختيار البخاخة: راعِ قدرة المريض الجسدية (مثل التهاب المفاصل)، مهارته، وتكلفة الدواء. يجب استخدام (Spacer) مع البخاخات المضغوطة (pMDI).',
        'اختبر دائماً طريقة استخدام البخاخة بأن تطلب من المريض أن يستخدمها أمامك، وصحح له الأخطاء مباشرة.',
      ],
    },
    sourceIds: ['gina-2025-general'],
    tags: ['inhalers', 'steps', 'review cycle'],
  },
  {
    id: 'non-pharmacological-management',
    group: 'ginaGeneral',
    title: {
      en: 'Non-pharmacological Management & Adherence',
      ar: 'الإدارة غير الدوائية وتقييم الالتزام',
    },
    summary: {
      en: 'Essential lifestyle advice and strategies to ensure patients stick to their prescribed treatment.',
      ar: 'نصائح أسلوب الحياة الضرورية واستراتيجيات لضمان التزام المريض بالعلاج الموصوف.',
    },
    points: {
      en: [
        'Smoking Cessation: Strongly encourage quitting at every visit. Advise parents not to smoke around children with asthma.',
        'Physical Activity: Encourage regular exercise. Advise patients on how to manage exercise-induced bronchoconstriction.',
        'Allergens: Blanket allergen avoidance is NOT recommended. Avoid only confirmed specific triggers if possible.',
        'Check adherence empathetically: E.g., "Most patients do not take their inhaler exactly as prescribed. In the past week, how many days did you take it?"',
        'Identify reasons for non-adherence: Cost, fear of side effects (steroid phobia), forgetfulness, or misunderstanding the necessity of daily medication.',
      ],
      ar: [
        'الإقلاع عن التدخين: انصح به بشدة، وحذر الآباء من التدخين في غرف أو سيارات أطفالهم مرضى الربو.',
        'الرياضة: شجع المريض على ممارسة الرياضة، وعلمه كيف يتعامل مع النهجان الذي يسببه المجهود.',
        'مسببات الحساسية: لا تنصح المريض بتجنب كل شيء! يُنصح بتجنب الأشياء التي أثبتت التحاليل أو التجربة أنها تثير أزمته تحديداً فقط.',
        'راجع الالتزام بالعلاج بذكاء: لا تقل للمريض "هل تأخذ العلاج؟"، بل قل "معظم المرضى ينسون جرعاتهم.. كام يوم الأسبوع اللي فات أخذت البخاخة؟".',
        'اكتشف سبب عدم الالتزام: هل بسبب التكلفة المادية؟ أم الخوف الوهمي من الكورتيزون؟ أم مجرد نسيان؟ أم أنه لا يعلم أن البخاخة الوقائية يجب أن تؤخذ يومياً حتى بدون أعراض؟',
      ],
    },
    sourceIds: ['gina-2025-general'],
    tags: ['adherence', 'smoking', 'exercise', 'allergens'],
  }
];