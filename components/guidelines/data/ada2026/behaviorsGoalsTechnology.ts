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
        'Medical Nutrition Therapy (MNT): Refer all patients to a registered dietitian. For overweight/obese patients, prescribe MNT targeting a 500-750 kcal/day deficit to achieve ≥5–7% weight loss. Mediterranean and plant-based diets are highly recommended.',
        'Macronutrients & Supplements: There is no single ideal % of calories from carbs/proteins/fats. Individualize based on metabolic goals. Routine use of vitamins, minerals, herbs, or cinnamon is NOT supported for glycemic control.',
        'Diet Restrictions: Limit sodium to <2300 mg/day. Strictly discourage very-low-carbohydrate (ketogenic) diets in patients using SGLT2 inhibitors or in T1D due to the high risk of euglycemic DKA.',
        'Physical Activity: Target ≥150 minutes/week of moderate-to-vigorous aerobic exercise. Break prolonged sitting every 30 minutes. Include resistance exercise 2–3 times/week. For older adults, add flexibility and balance training twice weekly to prevent falls.',
        'Psychosocial Care: Screen annually for diabetes distress, depression, anxiety, and disordered eating using validated tools (e.g., PAID, PHQ-9).',
        'Disordered Eating: Suspect disordered eating if a patient intentionally omits insulin or manipulates doses to cause glycosuria for weight loss (diabulimia). This is a life-threatening crisis requiring immediate psychiatric and medical intervention.',
        'Sleep Health: Screen for Obstructive Sleep Apnea (OSA) using STOP-BANG in all patients with obesity. OSA severely worsens insulin resistance and CV risk.',
        'Substance Use: Provide counseling for complete cessation of tobacco and e-cigarettes. Warn against recreational cannabis, which increases appetite, alters judgment, and increases the risk of severe DKA in T1D.',
        'Religious Fasting (Ramadan): Use the IDF-DAR risk calculator before fasting. Adjust medication timing and doses (e.g., reduce basal insulin by 15-30%, switch sulfonylureas to evening) to prevent hypoglycemia and dehydration.',
      ],
      ar: [
        'العلاج الغذائي الطبي (MNT): حوّل المرضى لأخصائي تغذية. ولمرضى السمنة، يجب خفض السعرات 500-750 سعرة يومياً لإنقاص الوزن ≥5-7%. حمية البحر المتوسط والأنظمة النباتية هي الأفضل.',
        'المغذيات والمكملات: لا توجد نسبة سحرية للكربوهيدرات/البروتين/الدهون، بل تُخصص لكل مريض. لا يوجد أي دليل علمي يدعم استخدام الفيتامينات أو الأعشاب أو القرفة لخفض السكر.',
        'محاذير التغذية: قلل الصوديوم لأقل من 2300 مجم/يوم. يحظر بشدة استخدام حمية (الكيتو) لمن يستخدمون أدوية SGLT2 أو مرضى النوع الأول بسبب خطر الحماض الكيتوني (DKA).',
        'النشاط البدني: 150 دقيقة/أسبوع من التمارين الهوائية. يجب قطع الجلوس المستمر كل 30 دقيقة. أضف تمارين مقاومة 2-3 مرات أسبوعياً، وللأعمار المتقدمة أضف تمارين توازن لمنع السقوط.',
        'الرعاية النفسية: افحص المريض سنوياً للتأكد من خلوه من "الاحتراق النفسي للسكري"، الاكتئاب، واضطرابات الأكل.',
        'اضطرابات الأكل (Diabulimia): اشتبه بها إذا كان المريض يقلل أو يوقف الأنسولين عمداً لإنقاص وزنه عن طريق تبول السكر. هذه حالة مهددة للحياة وتتطلب تدخلاً نفسياً وطبياً عاجلاً.',
        'صحة النوم: افحص انقطاع النفس النومي (OSA) لمرضى السمنة، لأنه يفاقم بشكل حاد من مقاومة الأنسولين ومخاطر القلب.',
        'التدخين والمخدرات: انصح بشدة بوقف التدخين والسجائر الإلكترونية. حذر من الماريجوانا لأنها تفتح الشهية وتزيد من غياب الوعي وخطر الإصابة بـ DKA، خاصة للنوع الأول.',
        'صيام رمضان: استخدم معايير (IDF-DAR) قبل رمضان. عدل الجرعات (مثلاً: تقليل الأنسولين القاعدي 15-30% ونقل السلفونيل يوريا للإفطار) لمنع الهبوط والجفاف.',
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
        'A1C Goals: Target A1C <7.0% (53 mmol/mol) for most nonpregnant adults without significant hypoglycemia. Target <6.5% for young, healthy patients with short disease duration. Relax to <8.0% for elderly or those with severe comorbidities/limited life expectancy.',
        'CGM Goals: Time in Range (TIR 70–180 mg/dL) >70%. Time Below Range (TBR <70 mg/dL) <4%. Strict TBR (<54 mg/dL) <1%. Time Above Range (TAR >180 mg/dL) <25%. For frail elderly, TIR >50% and TBR <1%.',
        'Hypoglycemia Levels: Level 1 (54-69 mg/dL). Level 2 (<54 mg/dL) indicates neuroglycopenia. Level 3 is any severe event requiring assistance from another person for recovery.',
        'Hypoglycemia Rescue: Treat Level 1 & 2 in conscious patients with the 15-15 rule (15-20g pure glucose, recheck in 15 mins). Do NOT use foods with added fat or protein (e.g., chocolate, peanut butter, ice cream) as they significantly delay glucose absorption.',
        'Glucagon: Prescribe glucagon (nasal powder, prefilled syringe, or auto-injector) to ALL individuals on insulin or at high risk for Level 2/3 hypoglycemia. Educate family, friends, and coworkers on its use.',
        'Immediate Action: One episode of Level 2 or 3 hypoglycemia MUST trigger an immediate reevaluation and deintensification of the treatment regimen (e.g., reducing insulin or sulfonylurea doses).',
        'Hypoglycemia Unawareness: If a patient cannot feel low blood sugar, raise their glycemic targets strictly to strictly avoid hypoglycemia for several weeks; this can partially restore awareness.',
        'DKA/HHS Prevention: Educate all Type 1 patients and Type 2 patients on SGLT2 inhibitors to check blood ketones during acute illness, stress, or unexplained nausea/vomiting, to detect and prevent DKA.',
      ],
      ar: [
        'أهداف التراكمي: <7.0% لمعظم البالغين. يمكن تشديده إلى <6.5% للشباب في بداية المرض. ويجب تخفيفه إلى <8.0% (أو أعلى) لكبار السن أو من يعانون من أمراض مصاحبة خطيرة وضعف الإدراك.',
        'أهداف CGM: الوقت في النطاق (TIR) > 70%. وقت الهبوط (<70) يجب أن يكون < 4%. الهبوط الشديد (<54) < 1%. لكبار السن الضعفاء: يكفي (TIR) > 50% ويجب أن يكون الهبوط < 1%.',
        'مستويات الهبوط: المستوى الأول (54-69). المستوى الثاني (<54). المستوى الثالث (هبوط شديد يفقد فيه المريض وعيه أو تركيزه ويحتاج لمساعدة شخص آخر).',
        'قاعدة الإنقاذ (15-15): للمريض الواعي، أعطه 15-20 جم من الجلوكوز السريع (عصير/سكر) وانتظر 15 دقيقة ثم أعد القياس. يمنع تماماً استخدام الشوكولاتة أو الدهون أو البروتينات لأنها تؤخر وصول السكر للدم.',
        'إبرة الجلوكاجون: يجب صرفها لجميع مستخدمي الأنسولين أو المعرضين لخطر الهبوط الشديد. يجب تدريب العائلة وزملاء العمل على استخدام البخاخ الأنفي أو الإبرة الجاهزة.',
        'قرار إجباري: حدوث نوبة هبوط واحدة من المستوى الثاني أو الثالث يُلزم الطبيب فوراً بتخفيف الخطة العلاجية (تقليل الأنسولين أو السلفونيل يوريا).',
        'فقدان الإحساس بالهبوط: إذا كان المريض لا يشعر بأعراض الهبوط، ارفع أهداف السكر لعدة أسابيع لمنع أي هبوط، مما يساعد الدماغ على استعادة القدرة على استشعار الإنذار المبكر.',
        'منع الحماض الكيتوني (DKA): علم مرضى النوع الأول، ومرضى النوع الثاني الذين يستخدمون SGLT2i، فحص "كيتون الدم" عند المرض، أو التوتر، أو الغثيان غير المبرر لتفادي أزمات الكيتون.',
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
        'CGM is Standard of Care: Recommend Continuous Glucose Monitoring (CGM) for ALL patients treated with insulin (basal or multiple daily injections) from the day of diagnosis to improve A1C and reduce hypoglycemia.',
        'CGM in Non-Insulin Users: CGM is also beneficial for patients on medications that cause hypoglycemia (like Sulfonylureas) and for lifestyle modification in diet-controlled T2D.',
        'Automated Insulin Delivery (AID): AID systems (which combine a pump, CGM, and an algorithm to automate basal and correction insulin) are the highly preferred standard of care for Type 1 diabetes and intensive-insulin Type 2 diabetes over traditional pumps and MDI.',
        'Smart Pens: For patients on Multiple Daily Injections (MDI), recommend smart connected insulin pens integrated with dose calculators to reduce mathematical errors and track active insulin on board.',
        'Skin Reactions: Monitor for contact dermatitis and skin allergies from CGM/pump adhesives. Advise rotating sites and using barrier films.',
        'Hospital Use of Personal Tech: Capable patients hospitalized for non-critical conditions should be strongly supported to continue using their personal CGM and AID systems. Standard capillary blood glucose (BGM) checks must still be used to confirm CGM alerts or hypoglycemia for official hospital records.',
        'Radiology Warning: Remind patients to remove CGMs and standard insulin pumps before MRI, CT, or Diathermy to prevent device destruction.',
      ],
      ar: [
        'CGM هو المعيار الذهبي: يُوصى بقياس السكر المستمر (CGM) لجميع المرضى الذين يستخدمون الأنسولين من اليوم الأول للتشخيص، لتحسين التراكمي ومنع الهبوط.',
        'CGM لغير مستخدمي الأنسولين: مفيد أيضاً لمستخدمي أدوية السلفونيل يوريا (لتفادي الهبوط) ولمرضى النوع الثاني لتصحيح نمط الحياة بناءً على قراءات السكر.',
        'مضخات AID هي المفضلة: أنظمة ضخ الأنسولين الآلية (التي تدمج المضخة مع الحساس وخوارزمية الذكاء الاصطناعي) هي الخيار الأفضل والموصى به عالمياً لمرضى النوع الأول ولمن يحتاجون حقناً متعددة من النوع الثاني.',
        'الأقلام الذكية: لمن يرفض المضخة ويستخدم الحقن (MDI)، أوصِ بالأقلام الذكية المتصلة بالهاتف والتي تحسب الجرعة الدقيقة وتتتبع كمية الأنسولين المتبقي في الجسم.',
        'التهاب الجلد: راقب تهيج الجلد أو الحساسية من لواصق الحساس والمضخة. انصح بتغيير أماكن التركيب واستخدام بخاخات عازلة لحماية الجلد.',
        'تكنولوجيا السكري في المستشفى: ادعم بقوة استمرار المرضى القادرين في استخدام أجهزة CGM ومضخات AID الخاصة بهم أثناء التنويم. لكن يجب استخدام الوخز العادي (BGM) لتأكيد الهبوط للتوثيق الطبي الرسمي بالمستشفى.',
        'تحذير الأشعة: نبه المرضى بضرورة إزالة الحساس والمضخة قبل الدخول لأجهزة الرنين المغناطيسي (MRI) أو الأشعة المقطعية لمنع تلفها.',
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
