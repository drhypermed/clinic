import type { GuidelineTopic } from '../../guidelinesData';

export const ADA_2025_BEHAVIORS_GOALS_TECH_TOPICS: GuidelineTopic[] = [
  {
    id: 'health-behaviors-full',
    group: 'behaviorsGoalsTech',
    title: {
      en: '5. Positive Health Behaviors and Well-being',
      ar: '5. السلوكيات الصحية الإيجابية والرفاه',
    },
    summary: {
      en: 'Diabetes outcomes depend heavily on DSMES, nutrition therapy, physical activity, sleep, psychosocial support, and practical barriers to self-care.',
      ar: 'نتائج السكري تعتمد بقوة على التثقيف والدعم الذاتي، والعلاج الغذائي، والنشاط البدني، والنوم، والدعم النفسي الاجتماعي، والعوائق العملية للرعاية الذاتية.',
    },
    points: {
      en: [
        'Diabetes self-management education and support should be offered at diagnosis, annually, when complications or transitions occur, and whenever barriers to care appear.',
        'Medical nutrition therapy should be individualized around preferences, culture, health literacy, metabolic goals, weight goals, cost, and access.',
        'Physical activity recommendations should combine aerobic activity, resistance training, reduced sedentary time, and safety planning for hypoglycemia or complications.',
        'Psychosocial assessment and referral are important when distress, depression, anxiety, disordered eating, cognitive issues, or social barriers affect care.',
        'Sleep quality, duration, and timing can influence glycemia and should be considered as part of behavior change and risk management.',
      ],
      ar: [
        'ينبغي تقديم تثقيف ودعم الإدارة الذاتية عند التشخيص، وسنويا، وعند ظهور مضاعفات أو انتقالات علاجية، وكلما ظهرت عوائق للرعاية.',
        'العلاج الغذائي الطبي يجب أن يكون فرديا حسب التفضيلات والثقافة والثقافة الصحية والأهداف الأيضية وأهداف الوزن والتكلفة والإتاحة.',
        'توصيات النشاط البدني تجمع بين النشاط الهوائي، وتمارين المقاومة، وتقليل الجلوس، وخطة أمان لنقص السكر أو المضاعفات.',
        'التقييم النفسي الاجتماعي والإحالة مهمان عند وجود ضيق سكري، أو اكتئاب، أو قلق، أو اضطراب أكل، أو مشكلات إدراك، أو عوائق اجتماعية تؤثر على الرعاية.',
        'جودة النوم ومدته وتوقيته قد تؤثر على السكر، ويجب النظر إليها ضمن تغيير السلوك وإدارة الخطورة.',
      ],
    },
    details: [
      {
        title: { en: 'DSMES timing and content', ar: 'توقيت ومحتوى التثقيف والدعم الذاتي' },
        items: {
          en: [
            'DSMES is not a one-time lecture: offer it at diagnosis, annually or when goals are not met, when complications or life transitions occur, and when care barriers appear.',
            'Core DSMES content should cover glucose monitoring, medication use, hypoglycemia prevention, sick-day rules, nutrition, activity, problem solving, coping, and when to seek urgent care.',
            'Telehealth, group education, community workers, pharmacists, and digital tools can be used when access to certified educators is limited.',
          ],
          ar: [
            'DSMES ليس محاضرة مرة واحدة: يقدم عند التشخيص، وسنويا أو عند عدم تحقق الأهداف، وعند ظهور مضاعفات أو انتقالات حياتية، وعند وجود عوائق للرعاية.',
            'المحتوى الأساسي يشمل قياس السكر، استخدام الدواء، منع نقص السكر، قواعد أيام المرض، التغذية، النشاط، حل المشكلات، التكيف النفسي، ومتى يطلب المريض رعاية عاجلة.',
            'يمكن استخدام التثقيف عن بعد، الجلسات الجماعية، العاملين المجتمعيين، الصيادلة، والأدوات الرقمية عندما يصعب الوصول لمثقف سكري متخصص.',
          ],
        },
      },
      {
        title: { en: 'Nutrition, activity, sleep, and tobacco', ar: 'التغذية والنشاط والنوم والتدخين' },
        items: {
          en: [
            'Nutrition therapy should be individualized; emphasize nonstarchy vegetables, minimally processed foods, lean protein sources, healthier fats, and reduced refined carbohydrates and sugar-sweetened beverages.',
            'Physical activity targets include at least 150 min/week moderate-to-vigorous aerobic activity, spread over at least 3 days with no more than 2 consecutive days without activity, plus resistance training 2-3 sessions/week when feasible.',
            'Screen for sleep problems, diabetes distress, depression, anxiety, fear of hypoglycemia, tobacco/vaping, and food insecurity because each can directly block glycemic control.',
          ],
          ar: [
            'العلاج الغذائي يفرد للمريض؛ مع التركيز على الخضروات غير النشوية، الأطعمة الأقل معالجة، مصادر بروتين مناسبة، دهون أفضل، وتقليل النشويات المكررة والمشروبات المحلاة.',
            'هدف النشاط: 150 دقيقة أسبوعيا على الأقل من نشاط هوائي متوسط إلى قوي، موزعة على 3 أيام على الأقل دون أكثر من يومين متتاليين بلا نشاط، مع مقاومة 2-3 مرات أسبوعيا عند الإمكان.',
            'افحص مشاكل النوم، ضيق السكري، الاكتئاب، القلق، الخوف من نقص السكر، التدخين/الفيب، وانعدام الأمن الغذائي لأنها قد تمنع ضبط السكر مباشرة.',
          ],
        },
      },
    ],
    sourceIds: ['health-behaviors'],
    tags: ['DSMES', 'nutrition', 'activity', 'sleep', 'psychosocial'],
  },
  {
    id: 'glycemic-goals-full',
    group: 'behaviorsGoalsTech',
    title: {
      en: '6. Glycemic Goals and Hypoglycemia',
      ar: '6. أهداف السكر ونقص السكر',
    },
    summary: {
      en: 'Targets are individualized: A1C, CGM metrics, hypoglycemia risk, treatment burden, comorbidities, and patient goals all shape the final target.',
      ar: 'الأهداف فردية: HbA1c، ومؤشرات CGM، وخطر نقص السكر، وعبء العلاج، والأمراض المصاحبة، وأهداف المريض كلها تشكل الهدف النهائي.',
    },
    points: {
      en: [
        'For many nonpregnant adults, an A1C target below 7% is appropriate if it can be achieved without significant hypoglycemia or excessive treatment burden.',
        'Less stringent targets may be appropriate with limited life expectancy, advanced complications, major comorbidities, frailty, or high hypoglycemia risk.',
        'More stringent targets may be reasonable when safely achievable, especially early in disease and when hypoglycemia risk is low.',
        'CGM metrics such as time in range, time below range, time above range, glucose management indicator, and glucose variability can complement A1C.',
        'Clinicians should routinely assess hypoglycemia history, impaired awareness, fear of hypoglycemia, and treatment plans for prevention and rescue.',
      ],
      ar: [
        'في كثير من البالغين غير الحوامل، يكون هدف HbA1c أقل من 7% مناسبا إذا أمكن تحقيقه دون نقص سكر مهم أو عبء علاج زائد.',
        'يمكن قبول أهداف أقل صرامة عند قصر العمر المتوقع، أو المضاعفات المتقدمة، أو الأمراض المصاحبة الكبيرة، أو الهشاشة، أو ارتفاع خطر نقص السكر.',
        'يمكن التفكير في أهداف أكثر صرامة إذا كانت آمنة، خصوصا مبكرا في المرض ومع انخفاض خطر نقص السكر.',
        'مؤشرات CGM مثل time in range وtime below range وtime above range وGMI والتذبذب تكمل HbA1c ولا تلغيه.',
        'ينبغي تقييم تاريخ نقص السكر، وضعف الإحساس به، والخوف منه، وخطة الوقاية والإنقاذ بشكل روتيني.',
      ],
    },
    practiceNote: {
      en: 'A good target is not only low; it is safe, explainable, measurable, and acceptable to the person living with diabetes.',
      ar: 'الهدف الجيد ليس الأقل فقط؛ بل الآمن، والمفهوم، والقابل للقياس، والمقبول للشخص المصاب بالسكري.',
    },
    details: [
      {
        title: { en: 'Common adult glycemic targets', ar: 'أهداف السكر الشائعة للبالغين' },
        items: {
          en: [
            'Many nonpregnant adults: A1C <7% if achieved without severe or frequent hypoglycemia affecting health or quality of life.',
            'CGM users: time in range 70-180 mg/dL >70% is appropriate for many nonpregnant adults.',
            'Common CGM safety targets: time >250 mg/dL <5%, time 181-250 mg/dL <25%, glucose CV <=36%, and at least 70% active CGM time over 14 days for pattern review.',
            'Hypoglycemia prevention on CGM: time <70 mg/dL <4% and time <54 mg/dL <1%; for older adults, time <70 mg/dL target is often <1%.',
          ],
          ar: [
            'كثير من البالغين غير الحوامل: HbA1c <7% إذا تحقق دون نقص سكر شديد أو متكرر يؤثر في الصحة أو جودة الحياة.',
            'مستخدمو CGM: الوقت داخل المدى 70-180 mg/dL أكثر من 70% مناسب لكثير من البالغين غير الحوامل.',
            'أهداف أمان CGM الشائعة: الوقت >250 mg/dL أقل من 5%، والوقت 181-250 mg/dL أقل من 25%، ومعامل التذبذب CV <=36%، وارتداء نشط لا يقل عن 70% خلال 14 يوما لتحليل الأنماط.',
            'منع نقص السكر في CGM: الوقت أقل من 70 mg/dL يكون <4% والوقت أقل من 54 mg/dL يكون <1%؛ وفي كبار السن يكون هدف الوقت أقل من 70 غالبا <1%.',
          ],
        },
      },
      {
        title: { en: 'Hypoglycemia levels', ar: 'مستويات نقص السكر' },
        items: {
          en: [
            'Level 1 hypoglycemia: glucose <70 mg/dL and >=54 mg/dL; it is an alert value requiring attention.',
            'Level 2 hypoglycemia: glucose <54 mg/dL; clinically significant and should trigger treatment-plan review.',
            'Level 3 hypoglycemia: severe event with altered mental and/or physical functioning requiring assistance, regardless of measured glucose.',
            'Treat conscious hypoglycemia with fast-acting carbohydrate, recheck glucose after 15 minutes, and repeat treatment if still low; prescribe glucagon for people at risk of level 2 or 3 hypoglycemia.',
          ],
          ar: [
            'المستوى 1: سكر أقل من 70 mg/dL وحتى 54 mg/dL أو أكثر؛ قيمة إنذار تحتاج انتباها.',
            'المستوى 2: سكر أقل من 54 mg/dL؛ نقص مهم سريريا ويستدعي مراجعة الخطة العلاجية.',
            'المستوى 3: نقص شديد مع تغير في القدرة الذهنية أو الجسدية ويحتاج مساعدة من شخص آخر، بغض النظر عن الرقم المقاس.',
            'يعالج نقص السكر الواعي بكربوهيدرات سريعة، ثم يعاد القياس بعد 15 دقيقة وتكرر المعالجة إذا ظل منخفضا؛ ويوصف glucagon لمن لديهم خطر نقص سكر مستوى 2 أو 3.',
          ],
        },
      },
    ],
    visuals: [
      {
        title: {
          en: 'CGM metrics for clinical care in nonpregnant adults',
          ar: 'مؤشرات CGM المستخدمة سريريا في غير الحوامل',
        },
        label: 'Table 6.2',
        imageSrc: '/guidelines/ada2025/table-6-2-cgm-metrics.png',
        sourceId: 'glycemic-goals',
        page: 4,
        takeaways: {
          en: [
            'For CGM interpretation, aim for at least 14 days of data and at least 70% active sensor time before making pattern-based decisions.',
            'For many nonpregnant adults: TIR 70-180 mg/dL >70%, TAR 181-250 mg/dL <25%, TAR >250 mg/dL <5%, TBR 54-69 mg/dL <4%, TBR <54 mg/dL <1%, and glucose CV <=36%.',
            'For many older or high-risk adults, the visual emphasizes safer, less stringent CGM goals, especially TBR <70 mg/dL <1% and more tolerance for time above range.',
          ],
          ar: [
            'لتفسير CGM بشكل عملي، الأفضل وجود 14 يومًا على الأقل من البيانات مع عمل الحساس 70% من الوقت على الأقل قبل اتخاذ قرارات مبنية على الأنماط.',
            'في كثير من البالغين غير الحوامل: TIR 70-180 mg/dL أكثر من 70%، وTAR 181-250 أقل من 25%، وTAR >250 أقل من 5%، وTBR 54-69 أقل من 4%، وTBR <54 أقل من 1%، وCV <=36%.',
            'في كبار السن أو مرتفعي الخطورة، الخلاصة الأهم هي أمان الهدف: تقليل الوقت تحت 70 mg/dL إلى أقل من 1% مع قبول وقت أعلى فوق المدى عند الحاجة.',
          ],
        },
      },
    ],
    quickDecision: {
      when: {
        en: 'When establishing or reviewing the glycemic target for any patient.',
        ar: 'عند تحديد أو مراجعة هدف السكر لأي مريض.',
      },
      start: {
        en: 'Aim for A1C < 7% (or TIR > 70%) for most non-pregnant adults if achievable safely.',
        ar: 'استهدف HbA1c < 7% (أو وقت داخل المدى TIR > 70%) لمعظم البالغين غير الحوامل إذا أمكن تحقيقه بأمان.',
      },
      followUp: {
        en: 'Reassess targets if the patient develops comorbidities, frailty, or high hypoglycemia risk.',
        ar: 'أعد تقييم الأهداف إذا ظهرت أمراض مصاحبة، هشاشة، أو خطر عالٍ لنقص السكر.',
      },
      warn: {
        en: 'Avoid aggressive targets if the patient has recurrent or unaware hypoglycemia.',
        ar: 'تجنب الأهداف الصارمة إذا كان المريض يعاني من نقص سكر متكرر أو لا يشعر به.',
      },
    },
    sourceIds: ['glycemic-goals'],
    tags: ['A1C', 'CGM', 'time in range', 'hypoglycemia', 'individualization'],
  },
  {
    id: 'technology-full',
    group: 'behaviorsGoalsTech',
    title: {
      en: '7. Diabetes Technology',
      ar: '7. تكنولوجيا السكري',
    },
    summary: {
      en: 'Technology should be considered early and matched to user preference, ability, safety, education, and access.',
      ar: 'ينبغي التفكير في التكنولوجيا مبكرا وتكييفها حسب تفضيل المستخدم وقدرته وسلامته وتعليمه وإتاحتها له.',
    },
    points: {
      en: [
        'Device selection should be individualized and reassessed as age, skills, support, cost, and clinical needs change.',
        'CGM can improve glucose visibility and treatment adjustment in people using insulin and in selected noninsulin-treated individuals.',
        'Insulin pumps and automated insulin delivery systems can improve outcomes when used by people who can use them safely and consistently.',
        'Standardized reports, including ambulatory glucose profile and summary metrics, help clinicians interpret device data consistently.',
        'Education, troubleshooting, data review, backup plans, and attention to device burden are essential parts of prescribing technology.',
      ],
      ar: [
        'اختيار الجهاز يجب أن يكون فرديا ويعاد تقييمه مع تغير العمر والمهارات والدعم والتكلفة والاحتياجات السريرية.',
        'CGM يحسن رؤية السكر وتعديل العلاج عند مستخدمي الإنسولين وفي فئات مختارة لا تستخدم الإنسولين.',
        'مضخات الإنسولين وأنظمة automated insulin delivery قد تحسن النتائج عند من يستطيعون استخدامها بأمان وانتظام.',
        'التقارير الموحدة، مثل ambulatory glucose profile والمؤشرات الملخصة، تساعد الطبيب على تفسير بيانات الأجهزة بثبات.',
        'التعليم، وحل المشكلات، ومراجعة البيانات، وخطط الطوارئ، والانتباه لعبء الجهاز عناصر أساسية عند وصف التكنولوجيا.',
      ],
    },
    details: [
      {
        title: { en: 'What to document when prescribing technology', ar: 'ما يجب توثيقه عند وصف التكنولوجيا' },
        items: {
          en: [
            'Document device type, indication, user ability/support, education provided, data-sharing plan, alert settings when relevant, and backup plan for device failure.',
            'Review CGM/pump data with standardized metrics rather than isolated readings: TIR, TBR, TAR, mean glucose, GMI, variability, sensor wear, and pattern timing.',
          ],
          ar: [
            'وثق نوع الجهاز، سبب استخدامه، قدرة المستخدم والدعم المتاح، التعليم المقدم، خطة مشاركة البيانات، إعدادات التنبيهات عند اللزوم، وخطة بديلة عند تعطل الجهاز.',
            'راجع بيانات CGM أو المضخة بمؤشرات موحدة لا بقراءات منفردة: TIR وTBR وTAR ومتوسط السكر وGMI والتذبذب ومدة ارتداء الحساس وتوقيت الأنماط.',
          ],
        },
      },
      {
        title: { en: 'Safety checks', ar: 'فحوص الأمان' },
        items: {
          en: [
            'Assess skin reactions, alarm fatigue, access to supplies, ability to respond to hypoglycemia alarms, and whether device burden is worsening distress.',
            'People using pumps or automated insulin delivery need a written plan for infusion-set failure, unexplained hyperglycemia, ketone checks, and temporary transition to injections.',
          ],
          ar: [
            'قيم تفاعلات الجلد، إرهاق التنبيهات، توفر المستلزمات، القدرة على التعامل مع إنذارات نقص السكر، وهل عبء الجهاز يزيد الضيق النفسي.',
            'مستخدمو المضخات أو AID يحتاجون خطة مكتوبة لفشل طقم الضخ، فرط السكر غير المفسر، فحص الكيتون، والانتقال المؤقت للحقن.',
          ],
        },
      },
    ],
    sourceIds: ['diabetes-technology'],
    tags: ['CGM', 'pump', 'AID', 'AGP', 'device burden'],
  },
];
