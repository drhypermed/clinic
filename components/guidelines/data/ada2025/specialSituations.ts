import type { GuidelineTopic } from '../../guidelinesData';

export const ADA_2025_SPECIAL_SITUATIONS_TOPICS: GuidelineTopic[] = [
  {
    id: 'older-adults-full',
    group: 'specialPopulations',
    title: { en: '13. Older Adults', ar: '13. كبار السن' },
    summary: {
      en: 'Older-adult diabetes care prioritizes function, cognition, hypoglycemia avoidance, deintensification when needed, and realistic individualized targets.',
      ar: 'رعاية السكري في كبار السن تركز على الوظيفة والإدراك وتجنب نقص السكر وتخفيف العلاج عند الحاجة وأهداف فردية واقعية.',
    },
    points: {
      en: [
        'Screen for geriatric syndromes that affect diabetes care, including cognitive impairment, depression, falls, frailty, polypharmacy, pain, and urinary incontinence.',
        'Glycemic targets should reflect health status: healthier older adults may use tighter goals, while complex or poor health requires safer, less burdensome goals.',
        'Avoid hypoglycemia-causing regimens when possible and simplify insulin or medication plans if treatment burden exceeds benefit.',
        'Nutrition, social support, vision, dexterity, hearing, transportation, finances, and caregiver capacity should shape the care plan.',
      ],
      ar: [
        'يتم فحص متلازمات الشيخوخة المؤثرة على رعاية السكري مثل ضعف الإدراك، والاكتئاب، والسقوط، والهشاشة، وتعدد الأدوية، والألم، وسلس البول.',
        'أهداف السكر تعكس الحالة الصحية: كبار السن الأصحاء قد يناسبهم هدف أضيق، بينما الحالات المعقدة أو الضعيفة تحتاج أهدافا أكثر أمانا وأقل عبئا.',
        'تجنب الأنظمة المسببة لنقص السكر قدر الإمكان، وبسط الإنسولين أو الأدوية إذا كان عبء العلاج أكبر من فائدته.',
        'التغذية، والدعم الاجتماعي، والبصر، والمهارة اليدوية، والسمع، والمواصلات، والقدرة المالية، وقدرة مقدم الرعاية كلها تؤثر على الخطة.',
      ],
    },
    details: [
      {
        title: { en: 'Older adult glycemic goal framework', ar: 'إطار أهداف السكر في كبار السن' },
        items: {
          en: [
            'Healthy older adults: reasonable A1C goal <7.0-7.5%, fasting/premeal 80-130 mg/dL, bedtime 80-180 mg/dL, if safely achieved.',
            'Complex/intermediate health: reasonable A1C goal <8.0%, fasting/premeal 90-150 mg/dL, bedtime 100-180 mg/dL.',
            'Very complex/poor health or long-term care: avoid reliance on A1C; focus on avoiding hypoglycemia and symptomatic hyperglycemia, with fasting/premeal 100-180 mg/dL and bedtime 110-200 mg/dL.',
          ],
          ar: [
            'كبير السن الصحيح نسبيا: هدف HbA1c مناسب <7.0-7.5%، وسكر صائم/قبل الأكل 80-130 mg/dL، وقبل النوم 80-180 mg/dL إذا تحقق بأمان.',
            'حالة صحية معقدة/متوسطة: هدف HbA1c مناسب <8.0%، وسكر صائم/قبل الأكل 90-150 mg/dL، وقبل النوم 100-180 mg/dL.',
            'حالة شديدة التعقيد أو رعاية طويلة الأمد: لا يعتمد على HbA1c وحده؛ الهدف منع نقص السكر وفرط السكر العرضي، مع صائم/قبل الأكل 100-180 وقبل النوم 110-200 mg/dL.',
          ],
        },
      },
      {
        title: { en: 'Medication safety priorities', ar: 'أولويات أمان الدواء' },
        items: {
          en: [
            'Avoid overtreatment; deintensify insulin, sulfonylureas, or meglitinides when hypoglycemia risk or treatment burden outweighs benefit.',
            'Simplify complex insulin plans when possible and preserve agents with cardiovascular or kidney benefit when indicated and tolerated.',
          ],
          ar: [
            'تجنب الإفراط العلاجي؛ خفف الإنسولين أو sulfonylureas أو meglitinides عندما تصبح خطورة نقص السكر أو عبء العلاج أكبر من الفائدة.',
            'بسط خطط الإنسولين المعقدة عند الإمكان، وحافظ على الأدوية ذات الفائدة القلبية أو الكلوية عند الاستطباب والتحمل.',
          ],
        },
      },
    ],
    visuals: [
      {
        title: {
          en: 'Framework for glycemic goals and health status in older adults',
          ar: 'إطار أهداف السكر حسب الحالة الصحية في كبار السن',
        },
        label: 'Table 13.1',
        imageSrc: '/guidelines/ada2025/table-13-1-older-adult-targets.png',
        sourceId: 'older-adults',
        page: 6,
        takeaways: {
          en: [
            'Healthy older adults can often use A1C <7.0-7.5%, fasting/premeal 80-130 mg/dL, and bedtime 80-180 mg/dL if this is safe.',
            'Complex/intermediate health usually shifts toward A1C <8.0%, fasting/premeal 90-150 mg/dL, and bedtime 100-180 mg/dL.',
            'Very complex/poor health or long-term care should avoid relying on A1C alone; focus on avoiding hypoglycemia and symptomatic hyperglycemia, often with fasting/premeal 100-180 mg/dL and bedtime 110-200 mg/dL.',
            'The table adds CGM thinking to older-adult targets: prioritize low time below range and choose goals according to cognition, function, frailty, comorbidities, life expectancy, and patient preference.',
          ],
          ar: [
            'كبير السن الصحيح نسبيًا يمكن غالبًا استهداف HbA1c <7.0-7.5%، وسكر صائم/قبل الأكل 80-130 mg/dL، وقبل النوم 80-180 mg/dL إذا كان ذلك آمنًا.',
            'في الحالة المعقدة/المتوسطة يتحول الهدف عادة إلى HbA1c <8.0%، وصائم/قبل الأكل 90-150 mg/dL، وقبل النوم 100-180 mg/dL.',
            'في الحالة شديدة التعقيد أو الرعاية طويلة الأمد لا نعتمد على HbA1c وحده؛ الأولوية منع نقص السكر وفرط السكر العرضي، غالبًا مع صائم/قبل الأكل 100-180 mg/dL وقبل النوم 110-200 mg/dL.',
            'الجدول يضيف منطق CGM لأهداف كبار السن: قلل الوقت تحت المدى واختر الهدف حسب الإدراك والوظيفة والهشاشة والأمراض المصاحبة والعمر المتوقع وتفضيل المريض.',
          ],
        },
      },
      {
        title: {
          en: 'Algorithm to simplify insulin administration plans',
          ar: 'خوارزمية تبسيط خطط إعطاء الإنسولين',
        },
        label: 'Figure 13.2',
        imageSrc: '/guidelines/ada2025/figure-13-2-insulin-simplification.png',
        sourceId: 'older-adults',
        page: 9,
        takeaways: {
          en: [
            'Use the algorithm when the insulin plan is more complex than the person or caregiver can safely manage, especially with hypoglycemia, cognitive decline, functional decline, or changing support.',
            'The practical goal is often to preserve necessary basal insulin while reducing or stopping prandial insulin when possible and adding safer noninsulin agents based on eGFR and comorbidities.',
            'For prandial insulin >10 units/dose, the pathway commonly starts with a 50% dose reduction plus a noninsulin agent, then titrates prandial insulin down with the aim of discontinuation when safe.',
            'Simplification is not undertreatment: the target is fewer errors, less hypoglycemia, less distress, and acceptable individualized glycemic outcomes.',
          ],
          ar: [
            'استخدم الخوارزمية عندما تكون خطة الإنسولين أعقد من قدرة المريض أو مقدم الرعاية على تنفيذها بأمان، خصوصًا مع نقص السكر أو تراجع الإدراك أو الوظيفة أو تغير الدعم.',
            'الهدف العملي غالبًا هو الحفاظ على basal insulin الضروري، مع تقليل أو إيقاف prandial insulin إن أمكن، وإضافة أدوية غير إنسولين أكثر أمانًا حسب eGFR والأمراض المصاحبة.',
            'إذا كانت جرعة prandial insulin أكثر من 10 وحدات/جرعة، يبدأ المسار غالبًا بخفضها 50% مع إضافة دواء غير إنسولين، ثم تقليلها تدريجيًا بهدف إيقافها عند الأمان.',
            'التبسيط ليس إهمالًا للعلاج؛ الهدف أخطاء أقل، نقص سكر أقل، ضيق علاجي أقل، ونتائج سكر مقبولة حسب الهدف الفردي.',
          ],
        },
      },
    ],
    quickDecision: {
      when: {
        en: 'During any visit for an older adult patient (e.g., aged >= 65).',
        ar: 'أثناء أي زيارة لمريض مسن (مثلاً بعمر >= 65 عاماً).',
      },
      start: {
        en: 'Assess frailty, cognition, and hypoglycemia risk to set individualized safe targets.',
        ar: 'قيم الهشاشة، الإدراك، وخطر نقص السكر لتحديد أهداف آمنة وفردية.',
      },
      followUp: {
        en: 'Continually aim to simplify insulin regimens if the treatment burden exceeds the benefit.',
        ar: 'اسعَ دائماً لتبسيط أنظمة الإنسولين إذا كان عبء العلاج يفوق فائدته.',
      },
      warn: {
        en: 'Do not enforce strict A1C targets if the patient suffers from hypoglycemia or complex comorbidities.',
        ar: 'لا تفرض أهدافاً صارمة للسكر التراكمي إذا كان المريض يعاني من نقص السكر أو أمراض مصاحبة معقدة.',
      },
    },
    sourceIds: ['older-adults'],
    tags: ['older adults', 'frailty', 'deintensification', 'hypoglycemia'],
  },
  {
    id: 'children-adolescents-full',
    group: 'specialPopulations',
    title: { en: '14. Children and Adolescents', ar: '14. الأطفال والمراهقون' },
    summary: {
      en: 'Pediatric diabetes care combines family-centered treatment, technology, school planning, complication screening, psychosocial care, and structured transition to adult care.',
      ar: 'رعاية سكري الأطفال تجمع بين علاج متمركز حول الأسرة، والتكنولوجيا، وخطة المدرسة، وفحص المضاعفات، والرعاية النفسية الاجتماعية، والانتقال المنظم لرعاية البالغين.',
    },
    points: {
      en: [
        'Care should be delivered by teams experienced in pediatric diabetes, with family and school/daycare involvement.',
        'Glycemic targets, insulin plans, technology, nutrition, and activity advice must match developmental stage and family capacity.',
        'Screening for complications and associated conditions should follow diabetes type, age, pubertal status, and duration.',
        'Mental health, diabetes distress, eating disorders, risk behaviors, and social determinants should be actively assessed.',
        'Transition to adult care should be planned gradually, not left to a single final pediatric visit.',
      ],
      ar: [
        'الرعاية تقدم بواسطة فرق لديها خبرة في سكري الأطفال، مع إشراك الأسرة والمدرسة أو الحضانة.',
        'أهداف السكر وخطط الإنسولين والتكنولوجيا والتغذية والنشاط يجب أن تناسب مرحلة النمو وقدرة الأسرة.',
        'فحص المضاعفات والحالات المصاحبة يتبع نوع السكري والعمر والبلوغ ومدة المرض.',
        'الصحة النفسية، وضيق السكري، واضطرابات الأكل، والسلوكيات الخطرة، ومحددات الصحة الاجتماعية يجب تقييمها بنشاط.',
        'الانتقال لرعاية البالغين يجب التخطيط له تدريجيا، وليس تركه لآخر زيارة أطفال فقط.',
      ],
    },
    details: [
      {
        title: { en: 'Pediatric glycemic targets', ar: 'أهداف السكر في الأطفال والمراهقين' },
        items: {
          en: [
            'For many children and adolescents, an A1C target <7% is appropriate when achievable without significant hypoglycemia or excessive treatment burden.',
            'Less stringent targets such as <7.5% or <8% may be appropriate with hypoglycemia unawareness, limited technology/support, severe hypoglycemia, major comorbidity, or high treatment burden.',
            'Before exercise, a practical glucose range of about 126-180 mg/dL is commonly used, with individualized plans for carbs, insulin adjustment, and ketone checks when needed.',
          ],
          ar: [
            'في كثير من الأطفال والمراهقين، يكون هدف HbA1c أقل من 7% مناسبا إذا تحقق دون نقص سكر مهم أو عبء علاجي زائد.',
            'أهداف أقل صرامة مثل <7.5% أو <8% قد تناسب وجود عدم الإحساس بنقص السكر، أو ضعف توفر التكنولوجيا/الدعم، أو نقص السكر الشديد، أو أمراض مصاحبة مهمة، أو عبء علاجي مرتفع.',
            'قبل الرياضة، يستخدم غالبا نطاق عملي للسكر حوالى 126-180 mg/dL، مع خطة فردية للكربوهيدرات وتعديل الإنسولين وفحص الكيتون عند اللزوم.',
          ],
        },
      },
      {
        title: { en: 'Screening anchors by diabetes type', ar: 'مرتكزات الفحص حسب نوع السكري' },
        items: {
          en: [
            'In type 1 diabetes, consider thyroid autoantibodies soon after diagnosis and measure TSH after clinical stability, then repeat if antibodies are positive or symptoms/growth changes appear.',
            'Screen youth with type 1 diabetes for celiac disease using IgA tissue transglutaminase with total IgA, and repeat when symptoms, growth failure, unexplained glycemic instability, or a first-degree relative with celiac disease is present.',
            'In youth-onset type 2 diabetes, assess blood pressure, nephropathy, retinopathy, neuropathy, and lipids from diagnosis or soon after, because complications may already be present.',
          ],
          ar: [
            'في النوع الأول، يفضل التفكير في أجسام مضادة للغدة الدرقية قرب التشخيص وقياس TSH بعد الاستقرار السريري، ثم الإعادة عند إيجابية الأجسام المضادة أو ظهور أعراض/تغير في النمو.',
            'يفحص الأطفال المصابون بالنوع الأول لاحتمال السيلياك باستخدام IgA tissue transglutaminase مع total IgA، وتتم الإعادة عند وجود أعراض، ضعف نمو، اضطراب سكر غير مفسر، أو قريب درجة أولى مصاب بالسيلياك.',
            'في النوع الثاني عند الشباب، يتم تقييم الضغط، الكلى، الشبكية، الأعصاب، والدهون من وقت التشخيص أو قريبا منه، لأن المضاعفات قد تكون موجودة بالفعل.',
          ],
        },
      },
    ],
    quickDecision: {
      when: {
        en: 'At diagnosis, during routine care, and well before transitioning to adult care.',
        ar: 'عند التشخيص، خلال الرعاية الروتينية، وقبل فترة كافية من الانتقال لرعاية البالغين.',
      },
      start: {
        en: 'Involve the family and school, and set targets appropriate for the child’s developmental stage.',
        ar: 'أشرك الأسرة والمدرسة، وحدد أهدافاً تناسب المرحلة العمرية للطفل.',
      },
      followUp: {
        en: 'Screen routinely for thyroid and celiac diseases (Type 1) and psychosocial distress.',
        ar: 'افحص بشكل روتيني أمراض الغدة الدرقية والسيلياك (النوع الأول) والضغوط النفسية.',
      },
      warn: {
        en: 'Do not delay transition planning to the final pediatric visit; it must be a gradual process.',
        ar: 'لا تؤجل التخطيط للانتقال إلى آخر زيارة لطبيب الأطفال؛ يجب أن تكون عملية تدريجية.',
      },
    },
    sourceIds: ['children-adolescents'],
    tags: ['pediatrics', 'A1C', 'school', 'transition', 'technology', 'thyroid', 'celiac', 'lipids', 'psychosocial'],
  },
  {
    id: 'pregnancy-management-full',
    group: 'specialPopulations',
    title: { en: '15. Management of Diabetes in Pregnancy', ar: '15. إدارة السكري في الحمل' },
    summary: {
      en: 'Pregnancy care emphasizes preconception planning, safer medications, tight but safe glucose targets, fetal-maternal monitoring, and postpartum follow-up.',
      ar: 'رعاية الحمل تركز على التخطيط قبل الحمل، والأدوية الآمنة، وأهداف سكر دقيقة وآمنة، ومتابعة الأم والجنين، والمتابعة بعد الولادة.',
    },
    points: {
      en: [
        'Preconception counseling should address glycemia, complications, medications, contraception until ready, folic acid, and pregnancy risks.',
        'Insulin is preferred for type 1 diabetes in pregnancy and is commonly used when medication therapy is needed for hyperglycemia in pregnancy.',
        'Glucose targets in pregnancy are tighter than usual but must be balanced against hypoglycemia risk.',
        'Review retinopathy, kidney disease, hypertension, thyroid disease, and medications before and during pregnancy.',
        'After gestational diabetes, postpartum glucose testing and long-term diabetes prevention are essential.',
      ],
      ar: [
        'الإرشاد قبل الحمل يشمل السكر، والمضاعفات، والأدوية، ومنع الحمل حتى الجاهزية، وحمض الفوليك، ومخاطر الحمل.',
        'الإنسولين هو المفضل في النوع الأول أثناء الحمل، ويستخدم كثيرا عند الحاجة لعلاج دوائي لفرط السكر في الحمل.',
        'أهداف السكر في الحمل أضيق من المعتاد لكنها توازن دائما مع خطر نقص السكر.',
        'تراجع الشبكية والكلى والضغط والغدة الدرقية والأدوية قبل الحمل وأثناءه.',
        'بعد سكري الحمل، اختبار السكر بعد الولادة والوقاية طويلة المدى من السكري أمران أساسيان.',
      ],
    },
    details: [
      {
        title: { en: 'Pregnancy glucose targets', ar: 'أهداف السكر في الحمل' },
        items: {
          en: [
            'Common pregnancy targets: fasting glucose <95 mg/dL, 1-h postprandial <140 mg/dL, or 2-h postprandial <120 mg/dL, individualized to avoid significant hypoglycemia.',
            'For type 1 or type 2 diabetes in pregnancy, ADA table targets show fasting 70-95 mg/dL, 1-h postprandial 110-140 mg/dL, and 2-h postprandial 100-120 mg/dL when safely achievable.',
            'Preconception A1C target is ideally <6.5% if it can be achieved without significant hypoglycemia.',
            'During pregnancy, A1C is physiologically lower; an A1C <6% is ideal if safely achieved, but the goal may be relaxed to <7% to prevent hypoglycemia.',
            'Hypoglycemia thresholds in pregnancy commonly include blood glucose <70 mg/dL and sensor glucose <63 mg/dL, while clinical individualization remains essential.',
          ],
          ar: [
            'الأهداف الشائعة في الحمل: صائم <95 mg/dL، أو بعد ساعة <140 mg/dL، أو بعد ساعتين <120 mg/dL، مع التفريد لتجنب نقص السكر المهم.',
            'في النوع الأول أو الثاني أثناء الحمل، يعرض جدول ADA أهدافا: صائم 70-95 mg/dL، وبعد ساعة 110-140 mg/dL، وبعد ساعتين 100-120 mg/dL إذا أمكن تحقيقها بأمان.',
            'قبل الحمل، يفضل أن يكون HbA1c <6.5% إذا أمكن تحقيقه دون نقص سكر مهم.',
            'أثناء الحمل يكون HbA1c أقل فسيولوجيا؛ الهدف المثالي <6% إذا تحقق بأمان، ويمكن إرخاؤه إلى <7% لمنع نقص السكر.',
            'عتبات نقص السكر في الحمل تشمل غالبا سكر الدم <70 mg/dL وسكر الحساس <63 mg/dL، مع بقاء التفريد السريري ضروريا.',
          ],
        },
      },
      {
        title: { en: 'Postpartum after GDM', ar: 'بعد الولادة عقب سكري الحمل' },
        items: {
          en: [
            'After GDM, screen for persistent diabetes or prediabetes at 4-12 weeks postpartum, usually with a 75-g OGTT.',
            'Long-term follow-up is needed because prior GDM markedly increases future type 2 diabetes risk; prevention planning should be documented.',
          ],
          ar: [
            'بعد GDM، يفحص استمرار السكري أو ما قبل السكري خلال 4-12 أسبوعا بعد الولادة، وغالبا باستخدام OGTT 75 g.',
            'المتابعة طويلة المدى ضرورية لأن تاريخ GDM يرفع بشدة خطر النوع الثاني مستقبلا؛ ويجب توثيق خطة الوقاية.',
          ],
        },
      },
    ],
    visuals: [
      {
        title: {
          en: 'Blood glucose goals in pregnancies associated with diabetes',
          ar: 'أهداف سكر الدم في الحمل المصاحب للسكري',
        },
        label: 'Table 15.2',
        imageSrc: '/guidelines/ada2025/table-15-2-pregnancy-glucose-goals.png',
        sourceId: 'pregnancy-management',
        page: 5,
        takeaways: {
          en: [
            'For type 1 or type 2 diabetes in pregnancy, and for insulin-treated GDM, the table target is fasting 70-95 mg/dL, 1-h postprandial 110-140 mg/dL, and 2-h postprandial 100-120 mg/dL when safely achievable.',
            'For GDM not treated with insulin, the targets are fasting <95 mg/dL, 1-h postprandial <140 mg/dL, and 2-h postprandial <120 mg/dL.',
            'The lower limits do not apply to people with type 2 diabetes treated with nutrition alone; relax goals if they cannot be achieved without significant hypoglycemia.',
            'Use either the 1-h or 2-h postprandial target consistently according to the plan, rather than mixing targets without context.',
          ],
          ar: [
            'في النوع الأول أو الثاني أثناء الحمل، وكذلك GDM المعالج بالإنسولين، هدف الجدول: صائم 70-95 mg/dL، وبعد ساعة 110-140 mg/dL، وبعد ساعتين 100-120 mg/dL إذا أمكن بأمان.',
            'في GDM غير المعالج بالإنسولين: صائم <95 mg/dL، وبعد ساعة <140 mg/dL، وبعد ساعتين <120 mg/dL.',
            'الحدود الدنيا لا تطبق على النوع الثاني المعالج بالتغذية فقط؛ خفف الأهداف إذا لم تتحقق دون نقص سكر مهم.',
            'استخدم هدف ما بعد الأكل بعد ساعة أو بعد ساعتين بشكل ثابت حسب الخطة، بدل خلط الأهداف بلا سياق.',
          ],
        },
      },
    ],
    quickDecision: {
      when: {
        en: 'During preconception counseling, pregnancy, and 4-12 weeks postpartum.',
        ar: 'خلال الاستشارة قبل الحمل، وأثناء الحمل، و 4-12 أسبوعاً بعد الولادة.',
      },
      start: {
        en: 'Target tight but safe glucose control. Prefer insulin for Type 1 and GDM requiring medication.',
        ar: 'استهدف ضبطاً دقيقاً لكن آمناً للسكر. الإنسولين هو المفضل للنوع الأول و GDM المحتاج لعلاج.',
      },
      followUp: {
        en: 'Monitor frequently during pregnancy, and perform a 75-g OGTT postpartum for GDM.',
        ar: 'تابع بشكل مكثف أثناء الحمل، وأجرِ اختبار OGTT بعد الولادة لمرضى سكري الحمل.',
      },
      warn: {
        en: 'Relax glycemic targets if achieving them causes significant maternal hypoglycemia.',
        ar: 'خفف أهداف السكر إذا كان تحقيقها يسبب نقصاً شديداً في سكر الأم.',
      },
    },
    sourceIds: ['pregnancy-management'],
    tags: ['pregnancy', 'GDM', 'preconception', 'insulin', 'postpartum'],
  },
  {
    id: 'hospital-care-full',
    group: 'specialPopulations',
    title: { en: '16. Diabetes Care in the Hospital', ar: '16. رعاية السكري في المستشفى' },
    summary: {
      en: 'Inpatient diabetes care requires protocols for glucose targets, insulin use, nutrition status, devices, procedures, DKA/HHS, and discharge transition.',
      ar: 'رعاية السكري داخل المستشفى تحتاج بروتوكولات لأهداف السكر، والإنسولين، وحالة التغذية، والأجهزة، والإجراءات، وDKA/HHS، وخطة الخروج.',
    },
    points: {
      en: [
        'Most critically ill adults have a glucose target of 140-180 mg/dL; many noncritically ill adults can target 100-180 mg/dL if achievable without significant hypoglycemia.',
        'Scheduled insulin regimens are generally preferred for persistent inpatient hyperglycemia, with correction insulin used as part of a structured plan.',
        'Continue personal pumps or automated insulin delivery only when clinically appropriate and hospital policy, supplies, and patient ability allow.',
        'DKA and HHS need standardized diagnosis, fluid, insulin, electrolyte, transition, and discharge protocols.',
        'Discharge planning should reconcile medications, supplies, education, follow-up, and affordability before the patient leaves.',
      ],
      ar: [
        'معظم البالغين في الرعاية الحرجة هدفهم 140-180 mg/dL؛ وكثير من غير الحرجة يمكن استهداف 100-180 mg/dL إذا أمكن دون نقص سكر مهم.',
        'أنظمة الإنسولين المجدولة تفضل غالبا عند استمرار فرط السكر داخل المستشفى، مع استخدام correction insulin ضمن خطة منظمة.',
        'تستمر المضخات أو automated insulin delivery فقط عندما يكون ذلك ملائما سريريا وتسمح سياسة المستشفى والمستلزمات وقدرة المريض.',
        'DKA وHHS يحتاجان بروتوكولات موحدة للتشخيص والسوائل والإنسولين والإلكتروليتات والانتقال وخطة الخروج.',
        'خطة الخروج يجب أن تراجع الأدوية والمستلزمات والتعليم والمتابعة والقدرة على تحمل التكلفة قبل مغادرة المريض.',
      ],
    },
    details: [
      {
        title: { en: 'Inpatient glucose thresholds', ar: 'عتبات السكر داخل المستشفى' },
        items: {
          en: [
            'For most critically ill patients, initiate or intensify insulin for persistent hyperglycemia starting at >=180 mg/dL confirmed on two occasions within 24 h.',
            'Once therapy is started, most critically ill adults use a target range of 140-180 mg/dL.',
            'For noncritically ill adults, a glucose goal of 100-180 mg/dL is recommended when achievable without significant hypoglycemia.',
          ],
          ar: [
            'في معظم مرضى الرعاية الحرجة، يبدأ أو يكثف الإنسولين عند فرط سكر مستمر >=180 mg/dL مؤكد مرتين خلال 24 ساعة.',
            'بعد بدء العلاج، يكون هدف معظم البالغين في الرعاية الحرجة 140-180 mg/dL.',
            'في غير الرعاية الحرجة، يوصى بهدف 100-180 mg/dL إذا تحقق دون نقص سكر مهم.',
          ],
        },
      },
      {
        title: { en: 'DKA and HHS diagnostic anchors', ar: 'مرتكزات تشخيص DKA وHHS' },
        items: {
          en: [
            'DKA is anchored by diabetes or glucose >=200 mg/dL, ketosis, and metabolic acidosis; severity is driven by pH, bicarbonate, beta-hydroxybutyrate, mental status, and clinical context.',
            'HHS is suggested by severe hyperglycemia, hyperosmolality, dehydration, and absent or mild ketosis/acidosis; it needs protocolized fluid, insulin, electrolyte, and transition planning.',
            'After DKA/HHS, document the precipitating factor, insulin access, sick-day rules, ketone testing plan when relevant, and early follow-up.',
          ],
          ar: [
            'تشخيص DKA يرتكز على وجود سكري أو سكر >=200 mg/dL، مع كيتوزيس وحماض أيضي؛ وتحدد الشدة حسب pH وbicarbonate وbeta-hydroxybutyrate والحالة الذهنية والسياق السريري.',
            'HHS يرجح مع فرط سكر شديد، فرط أسمولية، جفاف، وغياب أو خفة الكيتوزيس/الحماض؛ ويحتاج بروتوكول سوائل وإنسولين وإلكتروليتات وخطة انتقال.',
            'بعد DKA/HHS، وثق السبب المحفز، توفر الإنسولين، قواعد أيام المرض، خطة فحص الكيتون عند اللزوم، والمتابعة المبكرة.',
          ],
        },
      },
      {
        title: { en: 'Discharge safety checklist', ar: 'قائمة أمان الخروج' },
        items: {
          en: [
            'Before discharge, reconcile insulin and noninsulin drugs, stop unsafe inpatient-only orders, and provide prescriptions for meters/CGM supplies, strips, needles, glucagon, and ketone tools when indicated.',
            'Document follow-up timing, sick-day rules, hypoglycemia treatment, medication affordability, and who will adjust therapy after discharge.',
          ],
          ar: [
            'قبل الخروج، راجع الإنسولين والأدوية غير الإنسولين، أوقف أوامر المستشفى غير المناسبة للمنزل، ووفر وصفات جهاز القياس/CGM والشرائط والإبر والجلوكاجون وأدوات الكيتون عند اللزوم.',
            'وثق موعد المتابعة، قواعد أيام المرض، علاج نقص السكر، القدرة على تحمل تكلفة الدواء، ومن سيعدل العلاج بعد الخروج.',
          ],
        },
      },
    ],
    visuals: [
      {
        title: {
          en: 'Diagnostic criteria for DKA and HHS',
          ar: 'معايير تشخيص DKA وHHS',
        },
        label: 'Table 6.8',
        imageSrc: '/guidelines/ada2025/table-6-8-dka-hhs-criteria.png',
        sourceId: 'glycemic-goals',
        page: 12,
        takeaways: {
          en: [
            'DKA requires diabetes or glucose >=200 mg/dL/prior diabetes, ketosis with beta-hydroxybutyrate >=3.0 mmol/L or urine ketones 2+ or greater, and metabolic acidosis with pH <7.3 and/or bicarbonate <18 mmol/L.',
            'HHS requires severe hyperglycemia with plasma glucose >=600 mg/dL, hyperosmolarity, no significant ketonemia, and no significant acidosis.',
            'HHS hyperosmolarity is effective osmolality >300 mOsm/kg or total osmolality >320 mOsm/kg; absence of acidosis means pH >=7.3 and bicarbonate >=15 mmol/L.',
            'Mixed DKA/HHS can occur, so pair the criteria with clinical context: dehydration, mental status, potassium, ketones/acidosis, and precipitating cause.',
          ],
          ar: [
            'تشخيص DKA يحتاج سكري أو سكر >=200 mg/dL/تاريخ سابق للسكري، مع كيتوزيس beta-hydroxybutyrate >=3.0 mmol/L أو كيتون بول 2+ فأكثر، وحماض أيضي pH <7.3 و/أو bicarbonate <18 mmol/L.',
            'تشخيص HHS يحتاج فرط سكر شديد plasma glucose >=600 mg/dL، وفرط أسمولية، وغياب كيتونيميا مهمة، وغياب حماض مهم.',
            'فرط الأسمولية في HHS يعني effective osmolality >300 mOsm/kg أو total osmolality >320 mOsm/kg؛ وغياب الحماض يعني pH >=7.3 وbicarbonate >=15 mmol/L.',
            'قد يوجد تداخل DKA/HHS، لذلك اربط المعايير بالسياق السريري: الجفاف، الحالة الذهنية، البوتاسيوم، الكيتونات/الحماض، والسبب المحفز.',
          ],
        },
      },
      {
        title: {
          en: 'Treatment pathways for DKA and HHS',
          ar: 'مسارات علاج DKA وHHS',
        },
        label: 'Figure 16.1',
        imageSrc: '/guidelines/ada2025/figure-16-1-dka-hhs-treatment-pathways.png',
        sourceId: 'hospital-care',
        page: 9,
        takeaways: {
          en: [
            'Mild DKA may be managed with scheduled subcutaneous rapid-acting insulin in appropriate settings; moderate/severe DKA and HHS generally need IV insulin protocols.',
            'Before and during insulin, fluids and potassium safety drive the pathway: establish renal function, replace potassium when low, and avoid starting insulin in significant hypokalemia until potassium is corrected.',
            'During resolution, the pathway keeps DKA glucose between 150 and 200 mg/dL and targets HHS glucose between 200 and 250 mg/dL while acidosis/osmolality and clinical status recover.',
            'Transition to subcutaneous insulin only after resolution criteria are met, nutrition is addressed, and there is an overlap/plan that prevents rebound hyperglycemia or recurrent ketosis.',
          ],
          ar: [
            'DKA الخفيف يمكن علاجه بإنسولين سريع تحت الجلد بجدول واضح في المكان المناسب؛ أما DKA المتوسط/الشديد وHHS فيحتاجان غالبًا بروتوكول إنسولين وريدي.',
            'قبل وأثناء الإنسولين، السوائل والبوتاسيوم هما صمام الأمان: تأكد من وظيفة الكلى، عوض البوتاسيوم عند انخفاضه، ولا تبدأ الإنسولين مع نقص بوتاسيوم مهم قبل التصحيح.',
            'أثناء التحسن، يحافظ المسار على سكر DKA بين 150 و200 mg/dL، ويستهدف سكر HHS بين 200 و250 mg/dL إلى أن يتحسن الحماض/الأسمولية والحالة الإكلينيكية.',
            'الانتقال لإنسولين تحت الجلد يكون بعد تحقق معايير التحسن، وضبط التغذية، ووجود تداخل/خطة تمنع ارتداد فرط السكر أو رجوع الكيتوزيس.',
          ],
        },
      },
    ],
    quickDecision: {
      when: {
        en: 'Upon hospital admission or when treating inpatient hyperglycemia or DKA/HHS.',
        ar: 'عند الدخول للمستشفى أو عند علاج فرط السكر أو DKA/HHS بالداخل.',
      },
      start: {
        en: 'Use scheduled insulin (target 140-180 mg/dL for most) and protocol-driven fluids/electrolytes for DKA.',
        ar: 'استخدم إنسولين مجدول (الهدف 140-180 للغالبية) وبروتوكول سوائل لحالات DKA.',
      },
      followUp: {
        en: 'Reconcile medications and ensure affordability and access before discharge.',
        ar: 'راجع الأدوية وتأكد من قدرة المريض على الحصول عليها قبل الخروج.',
      },
      warn: {
        en: 'Do not rely solely on sliding-scale insulin; it is reactive and often inadequate.',
        ar: 'لا تعتمد فقط على "sliding-scale" للإنسولين؛ فهو أسلوب رد فعل وغالباً غير كافٍ.',
      },
    },
    sourceIds: ['hospital-care', 'glycemic-goals'],
    tags: ['hospital', 'inpatient', 'DKA', 'HHS', 'discharge'],
  },
  {
    id: 'advocacy-full',
    group: 'specialPopulations',
    title: { en: '17. Diabetes Advocacy', ar: '17. الدعم الحقوقي لمرضى السكري' },
    summary: {
      en: 'Advocacy guidance protects safe diabetes care in schools, work, driving, correctional settings, and other environments where policy affects health.',
      ar: 'يركز هذا الجزء على حماية رعاية السكري الآمنة في المدرسة والعمل والقيادة وأماكن الاحتجاز وغيرها من البيئات التي تؤثر فيها السياسات على الصحة.',
    },
    points: {
      en: [
        'People with diabetes should have reasonable access to medications, devices, monitoring, meals, water, restrooms, and trained support in school and work settings.',
        'Driving guidance focuses on individualized safety, hypoglycemia prevention, and fair evaluation rather than blanket restriction.',
        'Correctional and detention facilities should provide diabetes assessment, medication continuity, monitoring, nutrition, emergency care, and transition planning.',
        'Clinicians can support advocacy by documenting medical necessity, safety plans, accommodations, and individualized risk.',
      ],
      ar: [
        'ينبغي أن تتاح لمرضى السكري الأدوية والأجهزة والمتابعة والوجبات والماء ودورات المياه والدعم المدرب في المدرسة والعمل بشكل معقول.',
        'إرشادات القيادة تركز على السلامة الفردية، والوقاية من نقص السكر، والتقييم العادل بدلا من المنع العام.',
        'أماكن الاحتجاز يجب أن توفر تقييم السكري، واستمرار الأدوية، والمتابعة، والتغذية، والطوارئ، وخطة الانتقال.',
        'يستطيع الطبيب دعم الحقوق بتوثيق الضرورة الطبية وخطط السلامة والتسهيلات والخطر الفردي.',
      ],
    },
    quickDecision: {
      when: {
        en: 'When a patient faces barriers at school, work, or while driving due to diabetes.',
        ar: 'عندما يواجه المريض عوائق في المدرسة، العمل، أو أثناء القيادة بسبب السكري.',
      },
      start: {
        en: 'Provide medical documentation outlining necessary safety accommodations.',
        ar: 'وفر وثائق طبية توضح التسهيلات اللازمة لسلامة المريض.',
      },
      followUp: {
        en: 'Update accommodations as the patient’s health or treatment regimen changes.',
        ar: 'حدث التسهيلات كلما تغيرت حالة المريض الصحية أو العلاجية.',
      },
      warn: {
        en: 'Avoid blanket driving restrictions; assess individually for hypoglycemia unawareness.',
        ar: 'تجنب منع القيادة بشكل عام؛ قيم الحالة فردياً بناءً على فقدان الإحساس بنقص السكر.',
      },
    },
    sourceIds: ['advocacy'],
    tags: ['advocacy', 'school', 'driving', 'detention', 'accommodations'],
  },
];
