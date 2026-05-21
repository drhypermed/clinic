import type { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_BEHAVIORS_GOALS_TECH_TOPICS: GuidelineTopic[] = [
  {
    id: 'health-behaviors-well-being',
    group: 'behaviorsGoalsTech',
    title: {
      en: '5. Facilitating Positive Health Behaviors and Well-being',
      ar: '5. تسهيل السلوكيات الصحية الإيجابية والرفاهية',
    },
    summary: {
      en: 'Comprehensive guidance on DSMES, medical nutrition therapy, physical activity, tobacco cessation, psychosocial care, disordered eating, and sleep health for optimal diabetes management.',
      ar: 'توجيهات شاملة حول التثقيف والدعم الذاتي للسكري، العلاج الغذائي الطبي، النشاط البدني، الإقلاع عن التبغ، الرعاية النفسية والاجتماعية، اضطرابات الأكل، وصحة النوم لإدارة مثالية للسكري.',
    },
    points: {
      en: [
        'MNT: Prescribe individualized Medical Nutrition Therapy focusing on 5-7% weight loss and Mediterranean/plant-based patterns. Do NOT rely on routine vitamin/herbal supplements for glycemic control.',
        'Diet Restrictions: Limit sodium (<2300 mg/day). Discourage ketogenic diets if using SGLT2i (DKA risk).',
        'Physical Activity: Break prolonged sitting every 30 mins. Aim for ≥150 mins/week plus resistance/balance training.',
        'Psychosocial: Screen annually for diabetes distress, depression, and disordered eating. Intentional insulin omission for weight loss requires immediate intervention.',
        'Sleep: Screen for Obstructive Sleep Apnea (OSA) which worsens insulin resistance.',
        'Substance Use: Strongly advise complete tobacco/vape cessation. Warn against recreational cannabis, especially for those at risk of DKA.',
        'Fasting: Use IDF-DAR criteria to risk-stratify before religious fasting (e.g., Ramadan).',
      ],
      ar: [
        'التغذية (MNT): صِف علاجاً غذائياً يركز على إنقاص الوزن 5-7% وحمية البحر المتوسط. لا تعتمد على الفيتامينات أو الأعشاب روتينياً لخفض السكر.',
        'المحاذير الغذائية: قلل الصوديوم (<2300 مجم). حذر من حمية الكيتو لمستخدمي SGLT2i (خطر DKA).',
        'النشاط البدني: اقطع الجلوس كل 30 دقيقة. استهدف 150 دقيقة/أسبوع مع تمارين مقاومة وتوازن.',
        'الصحة النفسية: افحص سنوياً عن الإجهاد، الاكتئاب، واضطرابات الأكل (تقليل الأنسولين عمداً لإنقاص الوزن يتطلب تدخلاً عاجلاً).',
        'النوم: افحص انقطاع النفس النومي (OSA) لأنه يفاقم مقاومة الأنسولين.',
        'التدخين: انصح بصرامة بالإقلاع التام عن التبغ والسجائر الإلكترونية والماريجوانا.',
        'الصيام: استخدم معايير IDF-DAR لتقييم المخاطر وتعديل الجرعات قبل صيام رمضان.',
      ],
    },
    practiceNote: {
      en: 'Incorporate routine psychosocial, sleep, and physical activity screenings alongside A1C and BMI checks during annual reviews.',
      ar: 'ادمج فحوصات الصحة النفسية، واضطرابات النوم، والنشاط البدني بجانب قياس التراكمي والوزن في المراجعات السنوية.',
    },
    details: [
      {
        title: { en: 'Medical Nutrition Therapy (MNT)', ar: 'العلاج الغذائي الطبي' },
        items: {
          en: [
            'Refer all patients to a registered dietitian nutritionist for MNT.',
            'No single ideal distribution of calories exists; individualize macronutrient composition based on goals and preferences.',
            'A Mediterranean-style eating pattern and plant-based diets are highly recommended to reduce CVD risk and improve glucose metabolism.',
            'Discourage ketogenic diets in those using SGLT2i due to the risk of DKA.',
          ],
          ar: [
            'أحل جميع المرضى إلى أخصائي تغذية للحصول على علاج غذائي طبي.',
            'لا يوجد توزيع مثالي واحد للسعرات؛ خصص نسب المغذيات الكبرى حسب أهداف المريض وتفضيلاته.',
            'يُنصح بشدة بنمط غذاء البحر المتوسط والأنظمة النباتية لتقليل الخطر القلبي وتحسين السكر.',
            'لا يُنصح بحمية الكيتو لمن يستخدمون أدوية SGLT2i بسبب خطر حدوث الحماض الكيتوني (DKA).',
          ],
        },
      },
      {
        title: { en: 'Psychosocial Care & Sleep', ar: 'الرعاية النفسية واضطرابات النوم' },
        items: {
          en: [
            'Diabetes Distress: Distinct from depression; relates to the emotional burden of diabetes management. Screen regularly.',
            'Disordered Eating: Intentional omission of insulin for weight loss is a serious sign. Reevaluate treatment to minimize harm and refer to specialists.',
            'Sleep Health: OSA is common (~55% in T2D) and worsens insulin resistance. Screen and refer to sleep medicine when indicated.',
          ],
          ar: [
            'الإجهاد المرتبط بالسكري: يختلف عن الاكتئاب، ويتعلق بالعبء النفسي لإدارة السكري. يجب فحصه بانتظام.',
            'اضطرابات الأكل: تعمد تفويت الأنسولين لإنقاص الوزن علامة خطيرة. أعد تقييم العلاج لتقليل الضرر وأحل المريض للمختصين.',
            'صحة النوم: انقطاع النفس النومي (OSA) شائع في النوع الثاني (~55%) ويزيد من مقاومة الأنسولين. افحصه وأحل المريض لطبيب النوم عند الحاجة.',
          ],
        },
      },
      {
        title: { en: 'Physical Activity & Fasting', ar: 'النشاط البدني والصيام' },
        items: {
          en: [
            'Break up sedentary time every 30 minutes.',
            'Include 2-3 sessions per week of resistance exercise and flexibility/balance training for older adults.',
            'For religious fasting (e.g., Ramadan), use the IDF-DAR risk assessment and modify medications to reduce the risk of hypoglycemia and dehydration.',
          ],
          ar: [
            'اقطع أوقات الجلوس الطويلة كل 30 دقيقة.',
            'يجب إدراج تمارين المقاومة 2-3 مرات أسبوعياً بالإضافة لتمارين المرونة والتوازن لكبار السن.',
            'للصيام الديني (مثل رمضان)، استخدم تقييم IDF-DAR لتقدير المخاطر وعدل الأدوية لتقليل خطر الهبوط والجفاف.',
          ],
        },
      },
    ],
    quickDecision: {
      when: {
        en: 'At diagnosis, annually, when treatment targets are not met, during life transitions, or when complicating factors develop.',
        ar: 'عند التشخيص، وسنوياً، وعند عدم تحقيق أهداف العلاج، وفي الفترات الانتقالية من الحياة، أو عند ظهور مضاعفات.',
      },
      start: {
        en: 'Refer to DSMES and MNT. Assess physical activity, smoking status, and screen for diabetes distress and sleep disorders.',
        ar: 'أحل المريض للتثقيف الذاتي والتغذية العلاجية. قَيّم النشاط البدني، حالة التدخين، وافحص الإجهاد النفسي واضطرابات النوم.',
      },
      followUp: {
        en: 'Follow up consistently to reassess behavioral goals, adjust MNT based on weight and A1C responses, and monitor psychosocial well-being.',
        ar: 'تابع بانتظام لإعادة تقييم الأهداف السلوكية، وعدّل التغذية حسب الاستجابة للوزن والتراكمي، وراقب الحالة النفسية.',
      },
      warn: {
        en: 'Avoid labeling patients with eating disorders if disrupted eating is a result of extreme dietary restrictions; instead, adjust the regimen. Monitor SGLT2i users on low-carb diets closely for DKA.',
        ar: 'تجنب تصنيف المريض باضطراب أكل إذا كان سببه حمية قاسية مفروضة عليه؛ بل عدّل خطة علاجه. راقب بشدة مرضى SGLT2i إذا كانوا على حمية قليلة الكربوهيدرات لخطر DKA.',
      },
    },
    sourceIds: ['health-behaviors'],
    tags: ['DSMES', 'nutrition', 'MNT', 'physical activity', 'tobacco', 'psychosocial', 'eating disorders', 'sleep'],
  },
  {
    id: 'glycemic-goals-hypoglycemia-full',
    group: 'behaviorsGoalsTech',
    title: {
      en: '6. Glycemic Goals, Hypoglycemia, and Hyperglycemic Crises',
      ar: '6. أهداف السكر، هبوط السكر، ونوبات الارتفاع الشديد',
    },
    summary: {
      en: 'Guidelines on assessing glycemic status, individualizing A1C and Time in Range goals, managing hypoglycemia risk, and preventing hyperglycemic crises (DKA/HHS).',
      ar: 'إرشادات حول تقييم حالة السكر، وتخصيص أهداف التراكمي والوقت في النطاق المستهدف، وإدارة خطر هبوط السكر، والوقاية من أزمات ارتفاع السكر (DKA/HHS).',
    },
    points: {
      en: [
        'Goals: Target A1C <7.0% for most adults. For CGM users: Time In Range (TIR) >70%, Time Below Range (<70 mg/dL) <4%, and strict TBR (<54 mg/dL) <1%.',
        'Individualize: Relax goals (<8.0% or higher) for the elderly, frail, or cognitively impaired to avoid dangerous hypoglycemia.',
        'Hypoglycemia Treatment: Use the 15-15 rule for conscious patients (15g pure glucose, wait 15 mins). Avoid fat/protein (e.g., chocolate) as they delay absorption.',
        'Glucagon: Prescribe glucagon for ALL patients on insulin or at high risk of severe hypoglycemia. Educate family on use.',
        'Action: Any Level 2 or 3 hypoglycemia must prompt immediate treatment deintensification (reduce insulin, SU, or glinides).',
        'DKA/HHS: Educate Type 1 and SGLT2i users on ketone checking to prevent DKA.',
      ],
      ar: [
        'الأهداف: التراكمي <7.0% لمعظم البالغين. لمستخدمي CGM: الوقت في النطاق (TIR) >70%، والهبوط (<70) يجب أن يكون <4%، والهبوط الشديد (<54) <1%.',
        'التخصيص: خفف الأهداف (<8.0% أو أعلى) لكبار السن أو من يعانون من ضعف إدراكي لتجنب الهبوط الخطير.',
        'علاج الهبوط: قاعدة 15-15 (15 جم جلوكوز نقي، انتظر 15 دقيقة). تجنب الشوكولاتة لأن الدهون تبطئ امتصاص السكر.',
        'الجلوكاجون: اصرفه لجميع مستخدمي الأنسولين أو المعرضين لهبوط شديد، ودرب أسرهم على استخدامه.',
        'القرار السريع: أي هبوط من المستوى 2 أو 3 يتطلب تقليلاً فورياً لجرعات الأدوية المسببة للهبوط.',
        'DKA: ثقف مرضى النوع الأول ومستخدمي SGLT2i على قياس الكيتونات للوقاية من الحماض الكيتوني.',
      ],
    },
    practiceNote: {
      en: 'Utilize the 15-15 rule for conscious hypoglycemia. Deintensify therapy actively if severe or recurrent hypoglycemia occurs, or if Time Below Range goals are not met.',
      ar: 'استخدم قاعدة "15-15" لعلاج الهبوط للمريض الواعي. بادر بتخفيف العلاج إذا تكرر الهبوط الشديد أو لم تتحقق أهداف "الوقت تحت النطاق" (TBR).',
    },
    details: [
      {
        title: { en: 'Glycemic Goals (CGM Metrics)', ar: 'أهداف السكر (مؤشرات CGM)' },
        items: {
          en: [
            'Time in Range (TIR) (70-180 mg/dL): Goal >70%.',
            'Time Below Range (TBR) (<70 mg/dL): Goal <4%. For older adults, strict <1%.',
            'Time Below Range (TBR) (<54 mg/dL): Goal <1%.',
            'A1C equivalent target: generally <7.0%.',
          ],
          ar: [
            'الوقت في النطاق (TIR) (70-180 مجم/ديسيلتر): الهدف >70%.',
            'الوقت تحت النطاق (TBR) (<70 مجم/ديسيلتر): الهدف <4%. ولكبار السن بصرامة <1%.',
            'الوقت تحت النطاق (TBR) (<54 مجم/ديسيلتر): الهدف <1%.',
            'الهدف المكافئ للتراكمي: عموماً <7.0%.',
          ],
        },
      },
      {
        title: { en: 'Hypoglycemia Treatment', ar: 'علاج هبوط السكر' },
        items: {
          en: [
            'Glucose (15-20g) is the preferred treatment. Avoid chocolate, peanut butter, or other high-fat foods for immediate rescue as they delay glucose absorption.',
            'Prescribe glucagon for severe hypoglycemia risk. Nasal or auto-injectable pre-mixed glucagon is preferred for ease of use by bystanders.',
          ],
          ar: [
            'الجلوكوز (15-20 جم) هو العلاج المفضل. تجنب الشوكولاتة أو زبدة الفول السوداني أو الأطعمة الدهنية في الإنقاذ السريع لأنها تبطئ امتصاص السكر.',
            'اصرف الجلوكاجون لخطر الهبوط الشديد. يُفضل البخاخ الأنفي أو الجلوكاجون الجاهز للحقن لسهولة استخدامه من قبل المحيطين.',
          ],
        },
      },
      {
        title: { en: 'Hyperglycemic Crises (DKA/HHS)', ar: 'أزمات ارتفاع السكر (DKA/HHS)' },
        items: {
          en: [
            'Monitor for DKA explicitly in patients using SGLT2 inhibitors, especially those with type 1 diabetes (where it is used off-label) or during acute illness/surgery.',
            'Provide structured education on checking blood ketones for at-risk individuals.',
          ],
          ar: [
            'راقب بدقة حدوث الحماض الكيتوني (DKA) لدى مستخدمي مثبطات SGLT2، خاصة مرضى النوع الأول (استخدام غير مصرح به) أو أثناء المرض الشديد/الجراحة.',
            'وفر تثقيفاً منظماً حول قياس كيتونات الدم للأشخاص المعرضين للخطر.',
          ],
        },
      },
    ],
    quickDecision: {
      when: {
        en: 'Routinely every 3-6 months, or whenever there is a history of recent hypoglycemia, changes in cognition, or new diabetes medications.',
        ar: 'بشكل روتيني كل 3-6 أشهر، أو عند وجود تاريخ حديث لهبوط السكر، أو تغيرات في القدرات الإدراكية، أو عند إضافة أدوية جديدة.',
      },
      start: {
        en: 'Assess TIR/TBR via CGM reports if available, or A1C. Review all recent hypoglycemia episodes and evaluate awareness.',
        ar: 'قَيّم تقارير CGM (الوقت في النطاق/تحت النطاق) إن توفرت، أو التراكمي. راجع جميع نوبات الهبوط الأخيرة وقيم مدى الإحساس بها.',
      },
      followUp: {
        en: 'Adjust target A1C/TIR based on patient age, frailty, and life expectancy. Step down therapy if hypoglycemia occurs.',
        ar: 'عدل أهداف التراكمي/TIR بناءً على عمر المريض، الحالة الصحية، ومتوسط العمر المتوقع. خفف العلاج إذا حدث هبوط.',
      },
      warn: {
        en: 'Do not use A1C alone for patients with frequent hypoglycemia; A1C does not capture hypoglycemia or glucose variability. Use CGM if possible.',
        ar: 'لا تعتمد على التراكمي وحده للمرضى المتعرضين للهبوط المتكرر؛ لأنه لا يعكس الهبوط أو تذبذب السكر. استخدم CGM إن أمكن.',
      },
    },
    sourceIds: ['glycemic-goals'],
    tags: ['A1C', 'CGM', 'TIR', 'TBR', 'hypoglycemia', 'glucagon', 'DKA', 'hyperglycemia'],
  },
  {
    id: 'diabetes-technology-full',
    group: 'behaviorsGoalsTech',
    title: {
      en: '7. Diabetes Technology',
      ar: '7. تكنولوجيا السكري',
    },
    summary: {
      en: 'Guidance on the use of continuous glucose monitors (CGM), blood glucose meters (BGM), insulin pens, pumps, and automated insulin delivery (AID) systems across various populations.',
      ar: 'إرشادات حول استخدام أجهزة قياس السكر المستمر (CGM)، وأجهزة قياس الدم (BGM)، وأقلام ومضخات الأنسولين، وأنظمة توصيل الأنسولين التلقائية (AID) لمختلف الفئات.',
    },
    points: {
      en: [
        'CGM is standard: Recommend Continuous Glucose Monitoring for ALL patients on insulin from the day of diagnosis.',
        'AID is preferred: Automated Insulin Delivery (AID) systems are now the preferred standard of care over traditional pumps and MDI for Type 1 and intensive insulin Type 2 patients.',
        'Insulin Pens > Syringes: Recommend smart connected pens with dose calculators for those on injections.',
        'Hospitalization: Allow competent patients to continue using personal CGM and AID in the hospital, supplemented by capillary blood glucose for official documentation.',
      ],
      ar: [
        'CGM هو المعيار: أوصِ بقياس السكر المستمر لجميع مستخدمي الأنسولين منذ يوم التشخيص.',
        'أنظمة AID مفضلة: أصبحت أنظمة ضخ الأنسولين التلقائية الخيار المفضل على المضخات التقليدية والحقن المتعددة.',
        'الأقلام > الحقن العادية: استخدم الأقلام الذكية المتصلة بحاسبات الجرعات بدلاً من الإبر التقليدية.',
        'في المستشفى: اسمح للمرضى القادرين بالاستمرار في استخدام CGM و AID الخاصة بهم أثناء التنويم، مع تأكيد القراءات بوخز الإصبع (BGM) للتوثيق.',
      ],
    },
    practiceNote: {
      en: 'Always ensure patients have a backup conventional method (BGM, insulin pens/syringes, basal insulin plan) in case of device failure.',
      ar: 'تأكد دائماً أن لدى المريض خطة بديلة تقليدية (جهاز قياس دم، أقلام أنسولين، خطة أنسولين قاعدي) في حال تعطل الأجهزة التكنولوجية.',
    },
    details: [
      {
        title: { en: 'Continuous Glucose Monitoring (CGM)', ar: 'قياس السكر المستمر (CGM)' },
        items: {
          en: [
            'Recommended from the onset of diabetes for anyone on insulin.',
            'Useful during pregnancy to achieve tight targets and reduce macrosomia.',
            'Requires regular education on interpreting arrows, alarms, and the AGP (Ambulatory Glucose Profile) report.',
            'Address skin reactions (allergy/irritation) promptly to ensure continued use.',
          ],
          ar: [
            'موصى به من بداية تشخيص السكري لأي مريض يستخدم الأنسولين.',
            'مفيد جداً أثناء الحمل لتحقيق الأهداف الدقيقة وتقليل تضخم الجنين.',
            'يتطلب تثقيفاً مستمراً حول كيفية قراءة الأسهم، والإنذارات، وتقرير AGP.',
            'عالج تفاعلات الجلد (حساسية أو تهيج) بسرعة لضمان استمرار الاستخدام.',
          ],
        },
      },
      {
        title: { en: 'Automated Insulin Delivery (AID)', ar: 'أنظمة توصيل الأنسولين التلقائية (AID)' },
        items: {
          en: [
            'Now the preferred standard of care over traditional pumps and multiple daily injections for eligible patients.',
            'Users still need training on carb counting, site rotation, and handling system disconnections or DKA risk.',
            'Open-source systems (e.g., DIY Looping) should be supported by healthcare providers, not discouraged, if the patient chooses them safely.',
          ],
          ar: [
            'أصبحت الآن المعيار المفضل للرعاية بدلاً من المضخات التقليدية أو الحقن المتعددة للمرضى المؤهلين.',
            'لا يزال المستخدمون بحاجة للتدريب على حساب الكربوهيدرات، تدوير أماكن الحقن، والتصرف عند تعطل النظام أو خطر DKA.',
            'الأنظمة مفتوحة المصدر (مثل DIY Looping) يجب أن يدعمها مقدمو الرعاية الصحية ولا يُحبط المريض من استخدامها إذا استخدمها بأمان.',
          ],
        },
      },
      {
        title: { en: 'Hospitalization & Technology', ar: 'التنويم في المستشفى والتكنولوجيا' },
        items: {
          en: [
            'Patients competent in using their devices should be allowed to continue using CGM and AID in the hospital.',
            'A hospital protocol must be in place, and capillary blood glucose (BGM) should still be used for official hospital documentation and confirmation of hypoglycemia.',
          ],
          ar: [
            'المرضى القادرون على إدارة أجهزتهم يجب السماح لهم بالاستمرار في استخدام CGM و AID داخل المستشفى.',
            'يجب أن يكون لدى المستشفى سياسة واضحة لذلك، ويجب الاستمرار في قياس السكر بالدم (BGM) للتوثيق الرسمي وتأكيد حالات الهبوط.',
          ],
        },
      },
    ],
    quickDecision: {
      when: {
        en: 'At diagnosis, during treatment intensification (starting insulin), or when current therapy fails to meet glycemic goals safely.',
        ar: 'عند التشخيص، أو عند تكثيف العلاج (بدء الأنسولين)، أو عندما تفشل الخطة الحالية في تحقيق الأهداف بأمان.',
      },
      start: {
        en: 'Prescribe CGM for all patients on insulin. Offer connected pens or AID systems based on patient preference and capability.',
        ar: 'اصرف CGM لجميع مستخدمي الأنسولين. اعرض خيارات الأقلام الذكية أو أنظمة AID حسب تفضيل المريض وقدرته.',
      },
      followUp: {
        en: 'Review AGP reports at every visit. Re-evaluate education needs, skin issues, and device wear-time.',
        ar: 'راجع تقارير AGP في كل زيارة. أعد تقييم احتياجات التثقيف، ومشاكل الجلد، ومدة ارتداء الجهاز.',
      },
      warn: {
        en: 'Be aware of interfering substances for BGM/CGM (e.g., high-dose Vitamin C, hydroxyurea, acetaminophen) depending on the specific device brand.',
        ar: 'احذر من المواد المتداخلة مع قراءات BGM/CGM (مثل الجرعات العالية من فيتامين C، هيدروكسي يوريا، باراسيتامول) حسب نوع الجهاز.',
      },
    },
    sourceIds: ['diabetes-technology'],
    tags: ['CGM', 'BGM', 'AID', 'insulin pump', 'insulin pens', 'AGP', 'hospitalization'],
  }
];
