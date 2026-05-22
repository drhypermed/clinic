import type { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_SPECIAL_SITUATIONS_TOPICS: GuidelineTopic[] = [
  {
    id: 'older-adults',
    group: 'specialPopulations',
    title: {
      en: '13. Older Adults',
      ar: '13. كبار السن',
    },
    summary: {
      en: 'Guidelines for managing diabetes in older adults, focusing on comprehensive geriatric assessment, individualized glycemic goals, deintensification of therapy, and avoiding hypoglycemia.',
      ar: 'إرشادات إدارة السكري لدى كبار السن، مع التركيز على التقييم الشامل لأمراض الشيخوخة، تخصيص أهداف السكر، تقليل كثافة العلاج، وتجنب هبوط السكر.',
    },
    points: {
      en: [
        'Geriatric Assessment: Annually screen older adults for geriatric syndromes (cognitive impairment, depression, falls, frailty, polypharmacy). If present, these dictate treatment goals.',
        'Hypoglycemia Prevention: Address hypoglycemia risk at every visit. Deintensify complex regimens (e.g., stop sulfonylureas, simplify insulin) if risk is high. Recommend CGM for those on insulin.',
        'Healthy Older Adults: For those with few coexisting chronic illnesses and intact cognition/function, target A1C <7.0–7.5%, Fasting 90–130 mg/dL, Bedtime 90–150 mg/dL.',
        'Intermediate Health: For those with multiple chronic illnesses or mild cognitive/functional impairment, target A1C <8.0%, Fasting 90–150 mg/dL, Bedtime 100–180 mg/dL.',
        'Complex/Poor Health: For those in long-term care or with end-stage chronic illnesses/severe cognitive impairment, avoid strict targets. Focus solely on preventing symptomatic hyper/hypoglycemia. Fasting 100–180 mg/dL, Bedtime 110–200 mg/dL. A1C testing is often unnecessary.',
        'Blood Pressure: Target BP <130/80 mmHg if safely tolerated, but relax to <140/90 mmHg for those with multiple comorbidities or high risk of orthostatic hypotension/falls.',
        'End-of-Life & Palliative Care: Prioritize comfort. Discontinue strict glucose, blood pressure, and lipid-lowering therapies.',
      ],
      ar: [
        'تقييم الشيخوخة: افحص كبار السن سنوياً للبحث عن متلازمات الشيخوخة (الضعف الإدراكي، الاكتئاب، السقوط، الهشاشة، وتعدد الأدوية). وجودها يغير أهداف العلاج.',
        'الوقاية من الهبوط: قيم خطر نوبات الهبوط بكل زيارة. خفف خطط العلاج المعقدة (أوقف السلفونيل يوريا وبسط الإنسولين) إذا كان الخطر عالياً. يُنصح بحساسات السكر (CGM) لمستخدمي الإنسولين.',
        'المسنون الأصحاء: لمن لديهم القليل من الأمراض المزمنة مع قدرة عقلية وبدنية جيدة، استهدف تراكمي <7.0-7.5%، سكر صائم 90-130، وقبل النوم 90-150.',
        'الصحة المتوسطة: لمن لديهم أمراض مزمنة متعددة أو ضعف إدراكي/بدني بسيط، استهدف تراكمي <8.0%، سكر صائم 90-150، وقبل النوم 100-180.',
        'الصحة المتأخرة والهشة: في حالات الإعاقة الشديدة أو الخرف المتقدم، تجنب الأهداف الصارمة. ركز فقط على منع الهبوط أو الارتفاع العرضي (صائم 100-180). لا داعي لفحص التراكمي غالباً.',
        'ضغط الدم: استهدف <130/80 إذا تحمله المريض بأمان، وخففه إلى <140/90 إذا كان هناك خطر من السقوط أو هبوط الضغط عند الوقوف.',
        'نهاية الحياة: في الرعاية التلطيفية، الأولوية التامة لراحة المريض. أوقف جميع الأدوية الصارمة للسكر والضغط والدهون.',
      ],
    },
    practiceNote: {
      en: 'Deintensification is not giving up; it is an active decision to prioritize safety and quality of life over strict numbers in older or frail adults.',
      ar: 'تخفيف خطة العلاج ليس استسلاماً، بل قرار إيجابي لتغليب السلامة وجودة الحياة على الأرقام الصارمة لدى كبار السن والضعفاء.',
    },
    details: [
      {
        title: { en: 'Simplifying Insulin Regimens', ar: 'تبسيط نظام الإنسولين' },
        items: {
          en: [
            'Switch from multiple daily injections (MDI) to basal-only insulin.',
            'Discontinue mealtime insulin or switch to non-insulin agents with lower hypoglycemia risk if feasible.',
            'Use pre-mixed insulins with caution due to hypoglycemia risk, but they may be used if it simplifies administration for caregivers.',
          ],
          ar: [
            'التحول من الحقن المتعددة إلى الإنسولين القاعدي فقط.',
            'إيقاف إنسولين الوجبات أو استبداله بأدوية لا تسبب الهبوط إن أمكن.',
            'استخدم الإنسولين المخلوط بحذر لخطر الهبوط، لكن قد يستخدم لتسهيل الإعطاء بواسطة مقدمي الرعاية.',
          ],
        },
      },
    ],
    quickDecision: {
      when: {
        en: 'An older adult patient (≥65 years) presents with recurrent hypoglycemia or recent decline in cognitive/physical function.',
        ar: 'مريض مسن (≥65 عاماً) يعاني من تكرار هبوط السكر أو تدهور حديث في الوظائف الإدراكية أو الجسدية.',
      },
      start: {
        en: 'Screen for cognitive impairment and other geriatric syndromes. Adjust A1C goals to be less stringent (e.g., <8.0% or avoid symptomatic hyperglycemia only).',
        ar: 'افحص الضعف الإدراكي ومتلازمات الشيخوخة. اجعل أهداف التراكمي أكثر مرونة (مثلاً <8.0% أو فقط تجنب أعراض الارتفاع).',
      },
      followUp: {
        en: 'Deintensify the diabetes regimen by stopping sulfonylureas or reducing insulin doses. Implement CGM if still on insulin.',
        ar: 'خفف خطة العلاج بإيقاف السلفونيل يوريا أو تقليل الإنسولين. استخدم حساسات السكر (CGM) إذا استمر الإنسولين.',
      },
      warn: {
        en: 'Avoid complex sliding-scale insulin or strict adherence to guidelines meant for younger, healthier populations.',
        ar: 'تجنب أنظمة الإنسولين المعقدة ولا تلتزم بصرامة بالإرشادات المخصصة للأصغر سناً والأصحاء.',
      },
    },
    sourceIds: ['older-adults'],
    tags: ['older adults', 'geriatric', 'deintensification', 'hypoglycemia', 'cognitive impairment', 'palliative care'],
  },
  {
    id: 'children-dsmes-psychosocial',
    group: 'specialPopulations',
    title: {
      en: '14. Children & Adolescents: Education, Nutrition & Psychosocial Care',
      ar: '14. الأطفال والمراهقين: التثقيف والتغذية والرعاية النفسية',
    },
    summary: {
      en: 'Guidelines for comprehensive diabetes self-management education, medical nutrition therapy, physical activity, and psychosocial screening for children and adolescents.',
      ar: 'إرشادات التثقيف الشامل للسكري، العلاج الغذائي، النشاط البدني، والفحص النفسي والاجتماعي للأطفال والمراهقين.',
    },
    points: {
      en: [
        'Education & Nutrition: Emphasize carb counting and adjusting insulin for high-fat/protein meals.',
        'Activity: Recommend 60 mins of daily aerobic activity and teach hypoglycemia prevention during exercise.',
        'Psychosocial: Screen routinely for distress, depression, and disordered eating. Involve mental health professionals.',
        'Independence: Offer adolescents time alone with the provider.',
        'Reproductive Health: Provide preconception counseling for adolescent girls.',
      ],
      ar: [
        'التثقيف والتغذية: ركز على حساب الكربوهيدرات وتعديل الإنسولين للوجبات الدسمة.',
        'النشاط البدني: يُنصح بـ 60 دقيقة يومياً من الرياضة، مع التثقيف لمنع الهبوط وقت التمرين.',
        'الصحة النفسية: افحص الاكتئاب، التوتر، واضطرابات الأكل بشكل دوري. ادمج الأخصائي النفسي بالفريق.',
        'الاستقلالية: وفر للمراهقين وقتاً للجلوس بمفردهم مع الطبيب.',
        'الصحة الإنجابية: قدم استشارات ما قبل الحمل للفتيات المراهقات.',
      ],
    },
    sourceIds: ['children-adolescents'],
    tags: ['children', 'adolescents', 'DSMES', 'nutrition', 'psychosocial', 'exercise'],
  },
  {
    id: 'children-type1',
    group: 'specialPopulations',
    title: {
      en: '14. Children & Adolescents: Type 1 Diabetes Care, Technology & Goals',
      ar: '14. الأطفال والمراهقين: رعاية النوع الأول، التكنولوجيا وأهداف السكر',
    },
    summary: {
      en: 'Recommendations for the use of diabetes technology (CGM, AID, pumps) and individualized glycemic goals for children and adolescents with type 1 diabetes.',
      ar: 'توصيات استخدام تكنولوجيا السكري (حساسات السكر، المضخات الذكية) وتخصيص أهداف السكر للأطفال والمراهقين المصابين بالنوع الأول.',
    },
    points: {
      en: [
        'Technology: Offer CGM and automated insulin delivery (AID) at diagnosis. If AID is unavailable, offer open-loop pumps.',
        'Glycemic Goals: Target A1C <7% for most children. Target <7.5% if hypoglycemia unawareness exists. Target <6.5% if achievable without severe hypoglycemia.',
        'Monitoring: Use 14-day CGM metrics alongside A1C whenever possible.',
      ],
      ar: [
        'التكنولوجيا: وفر حساسات السكر (CGM) والمضخات الآلية (AID) فور التشخيص. إذا لم تتوفر، وفر المضخات التقليدية.',
        'أهداف التراكمي: الهدف <7% لمعظم الأطفال. <7.5% لمن لا يشعرون بالهبوط. <6.5% إذا أمكن دون هبوط شديد.',
        'المتابعة: استخدم قراءات حساس السكر لآخر 14 يوماً مع التراكمي لتقييم الحالة.',
      ],
    },
    sourceIds: ['children-adolescents'],
    tags: ['type 1', 'CGM', 'AID', 'pump', 'A1C', 'children'],
  },
  {
    id: 'children-type2',
    group: 'specialPopulations',
    title: {
      en: '14. Children & Adolescents: Type 2 Diabetes Management',
      ar: '14. الأطفال والمراهقين: إدارة السكري من النوع الثاني',
    },
    summary: {
      en: 'Screening, lifestyle interventions, pharmacologic therapy, and metabolic surgery guidelines for pediatric type 2 diabetes.',
      ar: 'فحص وعلاج السكري من النوع الثاني لدى الأطفال، بما في ذلك تغيير نمط الحياة، العلاج الدوائي، وجراحات السمنة.',
    },
    points: {
      en: [
        'Screening: Test youth with overweight/obesity (BMI ≥85th percentile) and ≥1 risk factor (maternal diabetes, family history, race/ethnicity, signs of insulin resistance). Autoantibodies must be tested to exclude Type 1.',
        'Lifestyle: Provide intensive, family-centered lifestyle programs aiming for a 7–10% decrease in excess weight.',
        'A1C Goals: Target an A1C of <6.5% if achievable without hypoglycemia, to prevent early-onset complications.',
        'Initial Therapy (A1C <8.5%): If asymptomatic, start metformin (titrate to 2000 mg/day max).',
        'Initial Therapy (A1C ≥8.5%): Start basal insulin (0.25-0.5 U/kg) and metformin simultaneously. If DKA is present, treat with IV insulin first.',
        'Intensification: If goals are not met on metformin, add a GLP-1 RA or SGLT2 inhibitor approved for youth (e.g., liraglutide, dulaglutide, empagliflozin).',
        'Metabolic Surgery: Consider for adolescents with severe obesity (BMI ≥35) and severe comorbidities despite lifestyle and pharmacotherapy.',
      ],
      ar: [
        'الفحص: افحص الأطفال الذين يعانون من زيادة الوزن (أعلى من المئين 85) ولديهم عامل خطر (تاريخ عائلي، سكري حملي للأم، علامات مقاومة الإنسولين). يجب فحص الأجسام المضادة لاستبعاد النوع الأول تماماً.',
        'نمط الحياة: وفر برامج مكثفة بمشاركة العائلة تهدف لإنقاص الوزن الزائد بنسبة 7-10%.',
        'أهداف التراكمي: استهدف تراكمي <6.5% (إذا كان ممكناً بدون هبوط) لمنع ظهور المضاعفات المبكرة الخطيرة.',
        'العلاج المبدئي (تراكمي <8.5%): للمرضى بدون أعراض، ابدأ الميتفورمين وارفع الجرعة تدريجياً لـ 2000 مجم يومياً كحد أقصى.',
        'العلاج المبدئي (تراكمي ≥8.5%): ابدأ الإنسولين القاعدي (0.25-0.5 وحدة/كجم) والميتفورمين معاً. وفي حالة وجود حموضة كيتونية، عالجها بالإنسولين الوريدي أولاً.',
        'تكثيف العلاج: إذا لم يصل المريض للهدف بالميتفورمين، أضف إبر (GLP-1 RA) أو أدوية (SGLT2i) المصرح بها للأطفال (مثل ليراجلوتيد أو إمباجليفلوزين).',
        'جراحة السمنة: فكر فيها للمراهقين المصابين بسمنة مفرطة (BMI ≥35) مع مضاعفات شديدة رغم العلاج الدوائي ونمط الحياة.',
      ],
    },
    quickDecision: {
      when: {
        en: 'A child or adolescent with overweight/obesity is newly diagnosed with marked hyperglycemia (A1C ≥8.5%).',
        ar: 'تشخيص طفل أو مراهق يعاني من السمنة/زيادة الوزن حديثاً بارتفاع شديد في السكر (تراكمي ≥8.5%).',
      },
      start: {
        en: 'Exclude type 1 diabetes with pancreatic autoantibodies. Start basal insulin and initiate metformin concurrently.',
        ar: 'استبعد النوع الأول بتحليل الأجسام المضادة. ابدأ الإنسولين القاعدي بالتزامن مع بدء الميتفورمين.',
      },
      followUp: {
        en: 'Once glycemic goals are met, consider weaning off insulin and relying on metformin, GLP-1 RA, and/or SGLT2i.',
        ar: 'بمجرد تحقيق أهداف السكر، فكر في سحب الإنسولين تدريجياً والاعتماد على الميتفورمين و/أو GLP-1 RA و/أو SGLT2i.',
      },
      warn: {
        en: 'Do not assume type 2 diabetes based solely on obesity; overlapping presentation is common.',
        ar: 'لا تفترض أنه نوع ثاني لمجرد وجود سمنة؛ فالتداخل في الأعراض وارد جداً.',
      },
    },
    sourceIds: ['children-adolescents'],
    tags: ['type 2', 'children', 'obesity', 'metformin', 'insulin', 'metabolic surgery'],
  },
  {
    id: 'children-complications',
    group: 'specialPopulations',
    title: {
      en: '14. Children & Adolescents: Complications & Associated Conditions',
      ar: '14. الأطفال والمراهقين: المضاعفات والأمراض المصاحبة',
    },
    summary: {
      en: 'Screening and management of cardiovascular risk factors (lipids, BP), microvascular complications (nephropathy, retinopathy, neuropathy), and associated conditions (celiac, thyroid, MASLD).',
      ar: 'فحص وعلاج عوامل الخطر القلبية (الدهون، الضغط)، المضاعفات الدقيقة (الكلى، الشبكية، الأعصاب)، والأمراض المصاحبة (حساسية القمح، الغدة الدرقية، الكبد الدهني).',
    },
    points: {
      en: [
        'Lipids: Screen at diagnosis (T2D) or age ≥2 (T1D). Target LDL <100 mg/dL. Use statins if lifestyle fails.',
        'Blood Pressure: Measure at every visit. Goal <90th percentile (or <130/80 if ≥13 years). Treat with lifestyle, then meds.',
        'Kidneys: Screen UACR at age 11/puberty (after 5 years for T1D, immediately for T2D). Treat with ACEi/ARB if UACR ≥30.',
        'Eyes & Feet: Dilated eye exam and foot exam starting at age 11/puberty (after 5 years for T1D, immediately for T2D).',
        'Liver & Sleep (T2D): Screen for MASLD (liver enzymes) and sleep apnea annually.',
        'Thyroid & Celiac (T1D): Screen TSH and celiac antibodies (IgA tTG) after diagnosis. Treat celiac with a gluten-free diet.',
      ],
      ar: [
        'الدهون: افحص عند التشخيص (النوع 2) أو بعد سنتين (النوع 1). هدف LDL <100. استخدم الستاتين إذا لم تنفع الحمية.',
        'الضغط: قس بكل زيارة. الهدف أقل من المئين 90 (أو <130/80 للمراهقين).',
        'الكلى: افحص الزلال عند البلوغ/11 سنة (بعد 5 سنوات للنوع 1، وفوراً للنوع 2). استخدم ACEi/ARB إذا كان الزلال ≥30.',
        'العيون والأقدام: فحص قاع العين والقدم عند البلوغ/11 سنة (بعد 5 سنوات للنوع 1، وفوراً للنوع 2).',
        'الكبد والنوم (للنوع الثاني): افحص إنزيمات الكبد وانقطاع النفس النومي سنوياً.',
        'الغدة والقمح (للنوع الأول): افحص الغدة (TSH) وحساسية القمح (IgA tTG). التزم بحمية خالية من الجلوتين للمصابين.',
      ],
    },
    sourceIds: ['children-adolescents'],
    tags: ['complications', 'lipids', 'hypertension', 'nephropathy', 'retinopathy', 'celiac', 'thyroid'],
  },
  {
    id: 'children-transition',
    group: 'specialPopulations',
    title: {
      en: '14. Children & Adolescents: Substance Use & Transition to Adult Care',
      ar: '14. الأطفال والمراهقين: استخدام المواد والانتقال لرعاية البالغين',
    },
    summary: {
      en: 'Guidelines on screening for substance use and preparing for the transition from pediatric to adult diabetes care.',
      ar: 'إرشادات الفحص عن التدخين واستخدام المواد، والتحضير للانتقال من رعاية الأطفال إلى رعاية البالغين.',
    },
    points: {
      en: [
        'Substance Use: Screen for tobacco, vaping, alcohol, and substance use regularly. Advise against recreational cannabis use.',
        'Transition: Prepare for the transition to adult care starting in early adolescence, at least 1 year before transfer.',
        'Decision-Making: Partner with adolescents to decide the timing of transition. There is no strict age cutoff.',
      ],
      ar: [
        'التدخين والمواد: افحص السجائر الإلكترونية، التدخين والكحول. انصح بعدم استخدام الحشيش الترفيهي.',
        'الانتقال: حضّر لانتقال الرعاية للبالغين مبكراً، قبل سنة على الأقل من النقل الفعلي.',
        'القرار: شارك المراهق وأسرته في تحديد موعد الانتقال، فلا يوجد عمر محدد صارم.',
      ],
    },
    sourceIds: ['children-adolescents'],
    tags: ['transition', 'substance use', 'vaping', 'adult care'],
  },
  {
    id: 'pregnancy-preconception',
    group: 'specialPopulations',
    title: {
      en: '15. Pregnancy: Preconception Counseling & Care',
      ar: '15. الحمل: الاستشارة والرعاية ما قبل الحمل',
    },
    summary: {
      en: 'Guidelines for preconception care, family planning, and optimizing glycemic control before pregnancy for individuals with preexisting diabetes.',
      ar: 'إرشادات الرعاية ما قبل الحمل، تنظيم الأسرة، وتحسين التحكم في السكر قبل الحمل للمصابات بالسكري المسبق.',
    },
    points: {
      en: [
        'Counseling & Contraception: Incorporate preconception counseling starting at puberty. Use effective contraception until A1C and treatment plan are optimized.',
        'A1C Goal: Aim for A1C <6.5% (if safe) to reduce risks of congenital anomalies and pregnancy complications.',
        'Team Care: Preexisting diabetes requires an interprofessional team (endocrinologist, maternal-fetal specialist, dietitian).',
        'Extra Focus: Emphasize nutrition, diabetes education, and screening for complications before conception.',
      ],
      ar: [
        'الاستشارة ومنع الحمل: ابدأ استشارات ما قبل الحمل من البلوغ. استخدمي وسيلة منع حمل فعالة حتى يتم ضبط التراكمي وخطة العلاج.',
        'هدف التراكمي: استهدفي تراكمي <6.5% (إن أمكن بأمان) لتقليل تشوهات الجنين ومضاعفات الحمل.',
        'فريق الرعاية: السكري المسبق يتطلب فريقاً متكاملاً (طبيب غدد، طبيب أمومة وجنين، أخصائي تغذية).',
        'عناية إضافية: ركزي على التغذية، التثقيف، وفحص مضاعفات السكري قبل الحمل.',
      ],
    },
    sourceIds: ['pregnancy-management'],
    tags: ['pregnancy', 'preconception', 'contraception', 'A1C'],
  },
  {
    id: 'pregnancy-glycemic-targets',
    group: 'specialPopulations',
    title: {
      en: '15. Pregnancy: Glycemic Targets & Monitoring',
      ar: '15. الحمل: أهداف السكر والمتابعة',
    },
    summary: {
      en: 'Glycemic goals (fasting, postprandial, and A1C) and continuous glucose monitoring (CGM) recommendations during pregnancy.',
      ar: 'أهداف السكر (الصائم، الفاطر، والتراكمي) وتوصيات حساسات السكر (CGM) أثناء الحمل.',
    },
    points: {
      en: [
        'Daily Goals (T1D & T2D): Fasting 70-95 mg/dL; 1-hour postprandial 110-140 mg/dL; 2-hour postprandial 100-120 mg/dL.',
        'A1C Goal: Target A1C <6.0% (if achievable without significant hypoglycemia) to reduce risks of preeclampsia, macrosomia, and congenital anomalies. Relax to <7.0% to prevent hypoglycemia if necessary.',
        'CGM Use: Highly recommended for pregnant individuals with T1D. Target Time in Range (TIR, 63-140 mg/dL) >70%, and Time Below Range (TBR, <63 mg/dL) <4%.',
        'Accuracy Warning: Do not use estimated A1C (eA1C) or Glucose Management Indicator (GMI) from CGM, as they underestimate A1C during pregnancy due to increased red blood cell turnover.',
      ],
      ar: [
        'الأهداف اليومية (النوع الأول والثاني): السكر الصائم 70-95؛ بعد الأكل بساعة 110-140؛ بعد الأكل بساعتين 100-120 مجم/ديسيلتر.',
        'هدف التراكمي: المثالي <6.0% (إن أمكن دون هبوط شديد) لمنع تسمم الحمل والعملقة والتشوهات. يمكن تخفيفه إلى <7.0% إذا تكرر هبوط السكر.',
        'الحساسات (CGM): موصى بها بشدة لحوامل النوع الأول. يجب استهداف (الوقت في النطاق 63-140) ليكون أعلى من 70%، و(الوقت تحت النطاق <63) أقل من 4%.',
        'تحذير الدقة: يمنع استخدام التراكمي التقديري (eA1C أو GMI) المستخرج من الحساسات أثناء الحمل لأنه يعطي قراءات غير دقيقة (أقل من الحقيقة) بسبب التغيرات الفسيولوجية للدم في الحمل.',
      ],
    },
    quickDecision: {
      when: {
        en: 'A pregnant patient with diabetes asks what their daily blood sugar targets should be.',
        ar: 'مريضة سكري حامل تسأل عن أهداف السكر اليومية المناسبة لها.',
      },
      start: {
        en: 'Aim for fasting <95 mg/dL, 1-hr post-meal <140 mg/dL, or 2-hr post-meal <120 mg/dL.',
        ar: 'الهدف: الصائم <95، وبعد الأكل بساعة <140، أو بعد الأكل بساعتين <120 مجم/ديسيلتر.',
      },
      followUp: {
        en: 'Target A1C <6.0% if it can be achieved without hypoglycemia; otherwise, relax up to <7.0%. For Type 1, initiate CGM to help achieve targets.',
        ar: 'استهدف تراكمي <6.0% إذا أمكن دون هبوط، وإلا خففه حتى <7.0%. لمريضات النوع الأول، ابدأ حساسات السكر (CGM) للمساعدة.',
      },
      warn: {
        en: 'Do not rely on CGM-derived estimated A1C (GMI) during pregnancy as it is inaccurate.',
        ar: 'لا تعتمد على التراكمي التقديري المستخرج من الحساسات (GMI) أثناء الحمل لعدم دقته.',
      },
    },
    sourceIds: ['pregnancy-management'],
    tags: ['pregnancy', 'targets', 'A1C', 'fasting', 'postprandial', 'CGM'],
  },
  {
    id: 'pregnancy-management',
    group: 'specialPopulations',
    title: {
      en: '15. Pregnancy: Management & Medications',
      ar: '15. الحمل: الإدارة والأدوية',
    },
    summary: {
      en: 'Lifestyle interventions, insulin therapy guidelines, and restrictions on oral glucose-lowering medications in pregnancy.',
      ar: 'تغيير نمط الحياة، إرشادات العلاج بالإنسولين، وقيود استخدام أدوية السكر الفموية أثناء الحمل.',
    },
    points: {
      en: [
        'Lifestyle Interventions: Medical Nutrition Therapy (MNT) and physical activity are essential for managing GDM and may suffice for many. Add medication if targets are not met.',
        'First-Line Medication: Insulin is the preferred medication for treating hyperglycemia in GDM and T2D in pregnancy because it does not cross the placenta to a measurable extent.',
        'Type 1 Diabetes: Insulin is mandatory. Multiple daily injections (MDI) or automated insulin delivery (AID) pumps should be used.',
        'Oral Medications Warning: Metformin and glyburide both cross the placenta. They should NOT be used as first-line agents due to lack of long-term safety data for the offspring (e.g., increased risk of neonatal hypoglycemia with glyburide).',
        'PCOS & Metformin: If a patient is taking metformin for Polycystic Ovary Syndrome (PCOS) to induce ovulation, it should be discontinued by the end of the first trimester.',
      ],
      ar: [
        'نمط الحياة: التغذية العلاجية والرياضة أساسيان لعلاج سكري الحمل وقد يكفيان وحدهما للوصول للهدف. يجب إضافة الأدوية إذا فشل نمط الحياة.',
        'العلاج الأول والأفضل: الإنسولين هو العلاج المفضل والأكثر أماناً لسكري الحمل والنوع الثاني أثناء الحمل لأنه لا يعبر المشيمة ولا يصل للجنين.',
        'النوع الأول: الإنسولين حتمي وإجباري. يمكن استخدام الحقن المتعددة أو المضخات الآلية (AID).',
        'تحذير من الأقراص الفموية: الميتفورمين والغليبنكلاميد (Daonil) يعبران المشيمة للجنين. لا يجب استخدامها كعلاج أساسي لغياب دراسات الأمان طويلة المدى على الأطفال، ولأن الغليبنكلاميد يزيد هبوط سكر المواليد.',
        'تكيس المبايض: إذا كانت المريضة تستخدم الميتفورمين لتنشيط التبويض بسبب تكيس المبايض، فيجب إيقافه بنهاية الشهر الثالث من الحمل.',
      ],
    },
    sourceIds: ['pregnancy-management'],
    tags: ['pregnancy', 'insulin', 'metformin', 'GDM', 'lifestyle'],
  },
  {
    id: 'pregnancy-complications-meds',
    group: 'specialPopulations',
    title: {
      en: '15. Pregnancy: Complications & Medication Safety',
      ar: '15. الحمل: المضاعفات وأمان الأدوية',
    },
    summary: {
      en: 'Guidelines for preventing preeclampsia and managing hypertension and dyslipidemia during pregnancy.',
      ar: 'إرشادات الوقاية من تسمم الحمل وعلاج ضغط الدم والدهون أثناء الحمل.',
    },
    points: {
      en: [
        'Preeclampsia: Prescribe low-dose aspirin (100–150 mg/day) starting at 12–16 weeks of gestation for T1D or T2D.',
        'Hypertension: Target BP <140/90 mmHg for better outcomes. Deintensify therapy if BP <90/60 mmHg.',
        'Harmful Meds: Stop ACE inhibitors and ARBs prior to conception.',
        'Statins: Stop lipid-lowering medications prior to conception unless benefits strongly outweigh risks (e.g., familial hypercholesterolemia).',
      ],
      ar: [
        'تسمم الحمل: اصرفي أسبرين بجرعة منخفضة (100-150 مجم/يوم) بدءاً من الأسبوع 12-16 للحوامل بالنوع الأول أو الثاني.',
        'ضغط الدم: استهدفي ضغط <140/90 ملم زئبق. خففي العلاج إذا انخفض الضغط عن 90/60.',
        'أدوية ضارة: أوقفي أدوية الضغط مثل ACEi و ARBs قبل الحمل.',
        'أدوية الدهون: أوقفي أدوية خفض الدهون (الستاتين) قبل الحمل إلا للضرورة القصوى.',
      ],
    },
    sourceIds: ['pregnancy-management'],
    tags: ['pregnancy', 'preeclampsia', 'aspirin', 'hypertension', 'ACE inhibitors', 'statins'],
  },
  {
    id: 'pregnancy-postpartum',
    group: 'specialPopulations',
    title: {
      en: '15. Pregnancy: Postpartum Care',
      ar: '15. الحمل: رعاية ما بعد الولادة',
    },
    summary: {
      en: 'Postpartum adjustment of insulin, breastfeeding recommendations, and long-term screening for individuals with a history of gestational diabetes.',
      ar: 'تعديل الإنسولين بعد الولادة، توصيات الرضاعة الطبيعية، والفحص المستمر لمن أُصبن بسكري الحمل.',
    },
    points: {
      en: [
        'Insulin Adjustment: Reduce insulin requirements immediately postpartum as resistance decreases dramatically.',
        'Breastfeeding & Contraception: Discuss a contraceptive plan. Recommend breastfeeding for all; it reduces future T2D risk for those with GDM.',
        'GDM Screening: Screen individuals with recent GDM at 4–12 weeks postpartum using a 75-g OGTT.',
        'Lifelong Care: Screen for diabetes every 1–3 years for those with a history of GDM. Offer lifestyle interventions/metformin for prediabetes.',
      ],
      ar: [
        'تعديل الإنسولين: خفضي جرعات الإنسولين فوراً بعد الولادة لزوال مقاومة الإنسولين.',
        'الرضاعة ومنع الحمل: ناقشي خطة منع الحمل. يُنصح بالرضاعة الطبيعية لتقليل خطر النوع الثاني مستقبلاً لمن عانين من سكري الحمل.',
        'فحص سكري الحمل: افحصي من أصبن بسكري الحمل بعد 4-12 أسبوعاً من الولادة باختبار تحمل الجلوكوز.',
        'رعاية مدى الحياة: افحصي السكري كل 1-3 سنوات لمن عانين من سكري الحمل. استخدمي تغيير نمط الحياة/الميتفورمين للوقاية إذا ظهرت مقدمات السكري.',
      ],
    },
    quickDecision: {
      when: {
        en: 'A patient with a recent history of Gestational Diabetes (GDM) is seen for a postpartum follow-up visit.',
        ar: 'مريضة أُصيبت حديثاً بسكري الحمل تحضر لزيارة المتابعة بعد الولادة.',
      },
      start: {
        en: 'Perform a 75-g OGTT at 4–12 weeks postpartum to check for prediabetes or diabetes.',
        ar: 'قم بعمل اختبار تحمل الجلوكوز (75 جرام) بعد 4-12 أسبوعاً من الولادة لفحص السكري أو مقدماته.',
      },
      followUp: {
        en: 'If normal, continue screening every 1–3 years lifelong. If prediabetes, start lifestyle interventions and/or metformin.',
        ar: 'إذا كان طبيعياً، أعد الفحص كل 1-3 سنوات مدى الحياة. إذا ظهرت مقدمات السكري، ابدأ نمط حياة صحي و/أو ميتفورمين.',
      },
      warn: {
        en: 'Insulin needs drop significantly right after delivery for those with preexisting diabetes; adjust doses immediately.',
        ar: 'حاجة الجسم للإنسولين تنخفض بشدة فور الولادة للمصابات بالسكري المسبق؛ يجب تعديل الجرعات فوراً.',
      },
    },
    sourceIds: ['pregnancy-management'],
    tags: ['pregnancy', 'postpartum', 'GDM', 'breastfeeding', 'screening'],
  },
  {
    id: 'hospital-admission-goals',
    group: 'specialPopulations',
    title: {
      en: '16. Hospital Care: Admission, Protocols & Glycemic Goals',
      ar: '16. رعاية المستشفى: الدخول، البروتوكولات، وأهداف السكر',
    },
    summary: {
      en: 'Guidelines for A1C testing upon admission, consulting diabetes teams, and glycemic goals for critically and noncritically ill patients.',
      ar: 'إرشادات قياس التراكمي عند الدخول، استشارة فرق السكري المتخصصة، وأهداف السكر للمرضى في الرعاية المركزة والأقسام العادية.',
    },
    points: {
      en: [
        'Admission A1C: Perform an A1C test on admission for anyone with diabetes or blood glucose >140 mg/dL (if no recent result in 3 months).',
        'Initiating Insulin: Start or intensify insulin for persistent hyperglycemia ≥180 mg/dL.',
        'ICU Goals: Target 140–180 mg/dL for critically ill patients.',
        'Non-ICU Goals: Target 100–180 mg/dL for noncritically ill patients, if achievable without hypoglycemia.',
      ],
      ar: [
        'التراكمي عند الدخول: قس التراكمي لأي مريض سكري أو لمن سكره >140 (إذا لم يتوفر فحص خلال آخر 3 أشهر).',
        'بدء الإنسولين: ابدأ الإنسولين إذا استمر ارتفاع السكر ≥180 مجم/ديسيلتر.',
        'العناية المركزة: الهدف 140-180 مجم/ديسيلتر لمرضى الحالات الحرجة.',
        'الأقسام العادية: الهدف 100-180 مجم/ديسيلتر إذا أمكن دون هبوط.',
      ],
    },
    sourceIds: ['hospital-care'],
    tags: ['hospital', 'admission', 'A1C', 'ICU', 'glycemic goals'],
  },
  {
    id: 'hospital-insulin-technology',
    group: 'specialPopulations',
    title: {
      en: '16. Hospital Care: Insulin Regimens & Technology',
      ar: '16. رعاية المستشفى: أنظمة الإنسولين والتكنولوجيا',
    },
    summary: {
      en: 'Insulin delivery methods for hospitalized patients, continuation of diabetes technology (CGM and pumps), and SGLT2i use.',
      ar: 'طرق إعطاء الإنسولين لمرضى المستشفى، استمرار استخدام تكنولوجيا السكري (الحساسات والمضخات)، واستخدام مثبطات SGLT2.',
    },
    points: {
      en: [
        'Diabetes Technology: Patients should be supported to safely continue using their personal CGM and insulin pumps during hospitalization, provided they have the cognitive capacity to manage them and hospital policies allow it.',
        'Critically Ill (ICU): Continuous intravenous (IV) insulin infusion is the most effective method for achieving glycemic targets in the ICU, requiring frequent glucose monitoring (every 1-2 hours).',
        'Noncritically Ill (Poor Intake): For patients who are taking nothing by mouth (NPO) or have poor oral intake, use basal insulin alone, or basal plus bolus correction insulin.',
        'Noncritically Ill (Good Intake): For patients with normal nutritional intake, use a proactive regimen consisting of basal, prandial (mealtime), and correction insulin components.',
        'Sliding Scale Warning: The sole use of sliding-scale (correction-only) insulin without basal insulin is strongly discouraged, as it leads to reactive and poor glycemic control.',
        'SGLT2i Caution: SGLT2 inhibitors should be discontinued during severe acute illness, surgery, or prolonged fasting due to the risk of euglycemic DKA. They may be initiated before discharge in stable patients with heart failure.',
      ],
      ar: [
        'تكنولوجيا السكري: يجب دعم المرضى للاستمرار في استخدام حساساتهم الشخصية (CGM) ومضخات الإنسولين أثناء التنويم، بشرط وعيهم الكامل وقدرتهم على إدارتها وموافقة سياسة المستشفى.',
        'العناية المركزة: تسريب الإنسولين الوريدي المستمر (عن طريق المضخة الوريدية) هو الطريقة الأفضل للتحكم بالسكر في العناية، مع قياس السكر كل ساعة أو ساعتين.',
        'الأقسام العادية (لا يأكلون): للمرضى الصائمين أو أكلهم ضعيف، استخدم الإنسولين القاعدي فقط، أو قاعدي مع إنسولين تصحيحي.',
        'الأقسام العادية (يأكلون جيداً): للمرضى الذين يأكلون بشكل طبيعي، استخدم نظاماً استباقياً يتكون من: إنسولين قاعدي + إنسولين مع الوجبات + جرعات تصحيحية عند اللزوم.',
        'تحذير من الجرعات المنزلقة: يُمنع منعاً باتاً الاعتماد على "نظام الجرعات المنزلقة" (إنسولين تصحيحي فقط عند الارتفاع) بدون وجود إنسولين قاعدي، لأنه يؤدي لتذبذب خطير في السكر.',
        'مخاطر SGLT2i: يجب إيقاف أدوية (SGLT2i) أثناء الأمراض الحادة، الجراحة، أو الصيام الطويل لتجنب "الحموضة الكيتونية ذات السكر الطبيعي". يمكن البدء بها قبل الخروج لمرضى هبوط القلب المستقرين.',
      ],
    },
    quickDecision: {
      when: {
        en: 'A noncritically ill patient is admitted to the hospital, and their blood glucose is persistently >180 mg/dL.',
        ar: 'مريض في الأقسام العادية لديه قراءات سكر مستمرة أعلى من 180 مجم/ديسيلتر.',
      },
      start: {
        en: 'Start basal, prandial, and correction insulin if they are eating normally. Use basal plus correction if oral intake is poor.',
        ar: 'ابدأ إنسولين قاعدي ووجبات وتصحيحي إذا كان يأكل جيداً. استخدم إنسولين قاعدي وتصحيحي فقط إذا كان أكله ضعيفاً.',
      },
      followUp: {
        en: 'Adjust doses to target blood glucose 100–180 mg/dL. Re-evaluate if any BG <70 mg/dL.',
        ar: 'عدّل الجرعات للوصول إلى هدف السكر 100-180. أعد التقييم فوراً إذا انخفض السكر عن 70.',
      },
      warn: {
        en: 'Do not use a sliding scale (correction-only insulin) without basal insulin.',
        ar: 'لا تستخدم الجرعات المنزلقة (إنسولين تصحيحي فقط) بدون إنسولين قاعدي.',
      },
    },
    sourceIds: ['hospital-care'],
    tags: ['hospital', 'insulin', 'CGM', 'pump', 'sliding scale', 'SGLT2i'],
  },
  {
    id: 'hospital-hypoglycemia-perioperative',
    group: 'specialPopulations',
    title: {
      en: '16. Hospital Care: Hypoglycemia & Perioperative Management',
      ar: '16. رعاية المستشفى: الهبوط وإدارة الفترة المحيطة بالجراحة',
    },
    summary: {
      en: 'Establishing hospital protocols for hypoglycemia and setting glycemic targets before and during surgery.',
      ar: 'إنشاء بروتوكولات للتعامل مع هبوط السكر في المستشفيات، وتحديد أهداف السكر قبل وأثناء الجراحات.',
    },
    points: {
      en: [
        'Protocol: Hospitals should adopt a hypoglycemia management protocol and track episodes for quality improvement.',
        'Action: Review and adjust treatment plans immediately for any blood glucose <70 mg/dL to prevent recurrence.',
        'Preoperative: For elective surgery, aim for a preoperative A1C <8% or a 14-day GMI <8% to improve outcomes.',
        'Perioperative: Maintain blood glucose between 100 and 180 mg/dL before, during, and after surgery.',
      ],
      ar: [
        'البروتوكول: يجب على المستشفيات تبني بروتوكول لعلاج الهبوط وتتبع النوبات لتحسين الجودة.',
        'الإجراء: راجعي وعدلي خطة العلاج فوراً عند توثيق أي سكر <70 مجم/ديسيلتر لمنع تكراره.',
        'قبل الجراحة: للعمليات المجدولة، استهدفي تراكمي <8% لتحسين النتائج.',
        'أثناء الجراحة: حافظي على السكر بين 100 و 180 قبل وأثناء وبعد الجراحة.',
      ],
    },
    sourceIds: ['hospital-care'],
    tags: ['hospital', 'hypoglycemia', 'surgery', 'perioperative'],
  },
  {
    id: 'hospital-dka-hhs-discharge',
    group: 'specialPopulations',
    title: {
      en: '16. Hospital Care: Diabetic Emergencies & Discharge Planning',
      ar: '16. رعاية المستشفى: طوارئ السكري والتخطيط للخروج',
    },
    summary: {
      en: 'Management of DKA and HHS, transition to subcutaneous insulin, and structured discharge planning.',
      ar: 'إدارة الحماض الكيتوني السكري (DKA) وحالة فرط الأسمولية (HHS)، الانتقال للإنسولين تحت الجلد، والتخطيط المنظم لخروج المريض.',
    },
    points: {
      en: [
        'Emergencies: Manage DKA and HHS with IV fluids, insulin, and electrolytes. Ensure a safe transition to subcutaneous insulin.',
        'Education: Discharge planning must include education on preventing and managing DKA/HHS.',
        'Discharge: Provide a structured discharge plan. Ensure receiving facilities have diabetes management capabilities.',
      ],
      ar: [
        'الطوارئ: عالجي DKA و HHS بالسوائل الوريدية، الإنسولين، والمعادن. تأكدي من الانتقال الآمن للإنسولين تحت الجلد.',
        'التثقيف: يجب أن يشمل التخطيط للخروج تثقيف المريض للوقاية من DKA/HHS.',
        'الخروج: وفري خطة خروج منظمة، وتأكدي من قدرة المراكز المنقول إليها المريض على إدارة السكري.',
      ],
    },
    sourceIds: ['hospital-care'],
    tags: ['hospital', 'DKA', 'HHS', 'discharge', 'emergencies'],
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
        'Reasonable Access: People with diabetes should have access to medications, devices, meals, and trained support at school and work.',
        'Driving: Decisions should be based on individualized safety and hypoglycemia risk, not blanket restrictions.',
        'Correctional Facilities: Should provide diabetes assessment, medication continuity, and emergency care.',
        'Clinician Role: Support patients by documenting medical necessity, safety plans, and needed accommodations.',
      ],
      ar: [
        'الوصول المعقول: يحق لمرضى السكري الحصول على الأدوية، الأجهزة، الوجبات، والدعم في المدرسة والعمل.',
        'القيادة: تُبنى القرارات على تقييم السلامة الفردية وخطر الهبوط بدلاً من المنع العام.',
        'أماكن الاحتجاز: يجب أن توفر تقييم السكري، استمرار الأدوية، ورعاية الطوارئ.',
        'دور الطبيب: ادعمي المريض بتوثيق الضرورة الطبية وخطط السلامة والتسهيلات المطلوبة.',
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
  }
];
