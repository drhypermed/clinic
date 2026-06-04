import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_6_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch6-assessment',
    group: '6. Glycemic Goals and Hypoglycemia',
    sourceIds: ['6-glycemic-goals-and-hypoglycemia-pdf', 'glycemic'],
    tags: ['A1C', 'CGM', 'TIR', 'Fructosamine'],
    title: {
      en: 'Glycemic Assessment',
      ar: 'تقييم مستوى السكر (Glycemic Assessment)'
    },
    summary: {
      en: 'When to rely on A1C and when to avoid it, along with the shift towards Continuous Glucose Monitoring (CGM) and Time in Range (TIR).',
      ar: 'متى نعتمد على السكر التراكمي (A1C) ومتى نتجنبه؟ وما هو دور المراقبة المستمرة للسكر (CGM) والابتعاد عن التراكمي كمعيار وحيد؟'
    },
    points: {
      en: [
        'A1C Frequency: A1C should be measured at least twice a year, and every 3 months for those who haven\'t met their targets or whose treatment plan has changed.',
        'Cases of Deception: A1C relies on red blood cells, so it can give false readings in cases like: pregnancy, hemolytic anemia, G6PD deficiency, dialysis, and recent blood transfusion.',
        'The Alternative: In these cases, it is recommended to use alternatives like Continuous Glucose Monitoring (CGM) devices, or a "Fructosamine" test, which measures average glucose over the last two to 4 weeks.',
        'Continuous Glucose Monitoring (CGM): The focus has now shifted to the metric "Time in Range (TIR)".',
        'Time in Range (TIR) Targets: For most adults, glucose should remain between (70-180 mg/dL) for more than 70% of the time (which equates to an A1C of approximately 7%).',
        'Time Below Range: The percentage of "low" time (below 70) must not exceed 4% of the day.'
      ],
      ar: [
        'يجب قياس التراكمي مرتين سنوياً على الأقل، وكل 3 أشهر لمن لم يحققوا الهدف أو تم تغيير خطتهم العلاجية.',
        'حالات الخداع: التراكمي يعتمد على خلايا الدم الحمراء، لذا قد يعطي قراءات خاطئة في حالات مثل: الحمل، الأنيميا التحللية، نقص إنزيم (G6PD)، غسيل الكلى، ونقل الدم الحديث.',
        'البديل: في هذه الحالات يُنصح باستخدام بدائل مثل أجهزة القياس المستمر (CGM)، أو تحليل "الفركتوزامين" (Fructosamine) الذي يقيس متوسط السكر خلال آخر أسبوعين إلى 4 أسابيع.',
        'المراقبة المستمرة للسكر (CGM) والابتعاد عن التراكمي كمعيار وحيد: أصبح التركيز الآن على مقياس "الوقت في النطاق المستهدف" (Time in Range - TIR).',
        'لأغلب البالغين: يجب أن يظل السكر بين (70-180 مجم/ديسيلتر) لأكثر من 70% من الوقت (وهذا يعادل تقريباً سكر تراكمي 7%).',
        'يجب ألا تزيد نسبة وقت "الهبوط" (أقل من 70) عن 4% من اليوم.'
      ]
    }
  },
  {
    id: 'ada-2026-ch6-individualization',
    group: '6. Glycemic Goals and Hypoglycemia',
    sourceIds: ['6-glycemic-goals-and-hypoglycemia-pdf', 'glycemic'],
    tags: ['Goals', 'Deintensification'],
    title: {
      en: 'Individualizing Goals: Not All Patients Need A1C < 7%',
      ar: 'تخصيص الأهداف: ليس كل المرضى بحاجة لتراكمي أقل من 7%'
    },
    summary: {
      en: 'The guide strongly emphasizes the need to customize goals (Individualization) based on the patient\'s condition.',
      ar: 'يؤكد الدليل بقوة على ضرورة تفصيل الأهداف (Individualization) بناءً على حالة المريض.'
    },
    points: {
      en: [
        'Strict Goals (A1C < 6.5%): Recommended for the young, newly diagnosed, those without heart disease or complications, and especially if they are taking medications that do not cause hypoglycemia (like Metformin, GLP-1, or SGLT2).',
        'Flexible Goals (A1C 7% - 8%): Recommended for the elderly, or those with severe comorbidities, or a history of recurrent hypoglycemia.',
        'Treatment Deintensification: The guide recommends the necessity to "reduce or stop" medications that cause hypoglycemia (like Insulin and Sulfonylureas) or replace them with safer drugs if the patient is prone to recurrent hypoglycemia, as the risk of hypos outweighs the benefits of lowering glucose.'
      ],
      ar: [
        'أهداف صارمة (تراكمي أقل من 6.5%): تُنصح للشباب، حديثي الإصابة، الذين لا يعانون من أمراض قلبية أو تعقيدات، وخاصة إذا كانوا يتناولون أدوية لا تسبب هبوطاً في السكر (مثل الميتفورمين، GLP-1، أو SGLT2).',
        'أهداف مرنة (تراكمي 7% - 8%): تُنصح لكبار السن، أو من لديهم أمراض مصاحبة شديدة، أو تاريخ من هبوط السكر المتكرر.',
        'تخفيف العلاج (Deintensification): يوصي الدليل بضرورة "تقليل أو إيقاف" الأدوية المسببة للهبوط (مثل الإنسولين والسلفونيل يوريا) أو استبدالها بأدوية أكثر أماناً إذا كان المريض عرضة للهبوط المتكرر، حيث أن خطر الهبوط يفوق فوائد خفض السكر.'
      ]
    }
  },
  {
    id: 'ada-2026-ch6-hypoglycemia',
    group: '6. Glycemic Goals and Hypoglycemia',
    sourceIds: ['6-glycemic-goals-and-hypoglycemia-pdf', 'glycemic'],
    tags: ['Hypoglycemia', 'Glucagon', 'Rule of 15'],
    title: {
      en: 'Hypoglycemia: The Greatest Danger',
      ar: 'هبوط السكر (Hypoglycemia): الخطر الأكبر'
    },
    summary: {
      en: 'Hypoglycemia is divided into 3 levels that must be monitored, with strict rules for handling it.',
      ar: 'تم تقسيم الهبوط إلى 3 مستويات يجب الانتباه لها، مع قواعد للتعامل مع الهبوط.'
    },
    points: {
      en: [
        'Level 1 (54 - 69 mg/dL): Hypoglycemia that requires prompt treatment.',
        'Level 2 (Less than 54 mg/dL): Neurological symptoms appear, posing a significant risk.',
        'Level 3 (Severe Hypoglycemia): Any hypo event requiring assistance from another person to recover the patient (regardless of the specific number).',
        'Treating Hypoglycemia: The rule is to give 15 grams of carbohydrates (pure glucose is preferred). Important Warning: You must avoid giving foods containing fats or proteins (like chocolate or whole milk) as an initial treatment for hypos, because they slow down sugar absorption and prolong the hypo period. Recheck after 15 minutes.',
        'Glucagon: Must be prescribed to every patient using insulin or at a high risk of hypos. Modern ready-to-use types (like nasal sprays or prefilled pens) are highly preferred as they are faster and easier during emergencies. Family members, coworkers, and school staff must be trained to use it, emphasizing they should never give the patient insulin during a coma.',
        'Impaired Awareness of Hypoglycemia: Some patients lose the ability to feel hypoglycemia symptoms (like tremors and sweating). These individuals are at risk of sudden comas. The best treatment for them is to temporarily relax glucose targets for several weeks to avoid any hypos, which restores the body\'s ability to feel the early warning signs.'
      ],
      ar: [
        'المستوى الأول (54 - 69 مجم/ديسيلتر): هبوط يستدعي العلاج السريع.',
        'المستوى الثاني (أقل من 54 مجم/ديسيلتر): تظهر فيه الأعراض العصبية ويشكل خطراً كبيراً.',
        'المستوى الثالث (الهبوط الشديد): أي هبوط يتطلب مساعدة شخص آخر لإسعاف المريض (بغض النظر عن الرقم).',
        'علاج الهبوط: القاعدة هي إعطاء 15 جراماً من الكربوهيدرات (يفضل الجلوكوز النقي). تحذير هام: يجب تجنب إعطاء أطعمة تحتوي على دهون أو بروتينات (مثل الشوكولاتة أو الحليب كامل الدسم) كعلاج أولي للهبوط، لأنها تبطئ امتصاص السكر وتطيل فترة الهبوط. يجب إعادة القياس بعد 15 دقيقة.',
        'الجلوكاجون (Glucagon): يجب وصفه لكل مريض يستخدم الإنسولين أو معرض لخطر هبوط عالٍ. يُفضل بشدة استخدام الأنواع الحديثة الجاهزة للاستخدام (مثل البخاخ الأنفي أو الأقلام سابقة التعبئة) لأنها أسرع وأسهل وقت الطوارئ. يجب تدريب أفراد الأسرة، وزملاء العمل، وموظفي المدارس على استخدامه، مع التأكيد عليهم بألا يعطوا المريض إنسولين أبداً وقت الغيبوبة.',
        'فقدان الشعور بالهبوط (Impaired Awareness): بعض المرضى يفقدون القدرة على الشعور بأعراض الهبوط (مثل الرعشة والتعرق). هؤلاء معرضون لخطر الغيبوبة المفاجئة. العلاج الأفضل لهم هو تخفيف أهداف السكر مؤقتاً لعدة أسابيع لتجنب أي هبوط، مما يعيد للجسم قدرته على الشعور بالإنذار المبكر.'
      ]
    }
  },
  {
    id: 'ada-2026-ch6-emergencies',
    group: '6. Glycemic Goals and Hypoglycemia',
    sourceIds: ['6-glycemic-goals-and-hypoglycemia-pdf', 'glycemic'],
    tags: ['DKA', 'HHS', 'Sick Days', 'SGLT2'],
    title: {
      en: 'Hyperglycemic Crises (DKA & HHS) and Sick Days',
      ar: 'أزمات ارتفاع السكر (DKA & HHS) وأيام المرض (Sick Days)'
    },
    summary: {
      en: 'Risks of SGLT2 inhibitors and managing diabetes during "Sick Days".',
      ar: 'خطر مجموعة أدوية (SGLT2 inhibitors) وإدارة السكري في "أيام المرض".'
    },
    points: {
      en: [
        'SGLT2 inhibitors Risk (Type 1): These drugs significantly increase the risk of Diabetic Ketoacidosis (DKA) in Type 1 patients (they are not approved for them, but if used, the risk multiplies 5 to 17 times).',
        'SGLT2 inhibitors Risk (Type 2): The risk is low but present, especially during prolonged fasting, dehydration, or following very low-carb diets (like keto).',
        'Sick Days - Basal Insulin: Never stop Basal Insulin, even if the patient is not eating.',
        'Sick Days - Monitoring: Glucose and ketones must be monitored frequently.',
        'Sick Days - Stopping Meds: Certain medications must be stopped immediately in the event of vomiting or severe dehydration, such as: Metformin and SGLT2 drugs, to avoid acute kidney failure or DKA.',
        'Sick Days - GLP-1: GLP-1 drugs may also need to be stopped if there are severe gastrointestinal symptoms (like persistent vomiting).'
      ],
      ar: [
        'خطر مجموعة أدوية (SGLT2 inhibitors) في النوع الأول: هذه الأدوية تزيد من خطر حدوث "الحموضة الكيتونية السكرية" (DKA) بشكل كبير لدى مرضى النوع الأول (غير مصرح باستخدامها لهم، ولكن في حال الاستخدام يكون الخطر مضاعفاً 5 إلى 17 مرة).',
        'خطر أدوية SGLT2 في النوع الثاني: الخطر قليل ولكنه موجود، خاصة عند الصيام لفترات طويلة، أو الجفاف، أو اتباع حميات منخفضة الكربوهيدرات جداً (مثل الكيتو).',
        'إدارة السكري في أيام المرض (Sick Days): عند إصابة المريض بعدوى أو مرض طارئ، لا توقف الإنسولين القاعدي (Basal Insulin) أبداً حتى لو كان المريض لا يأكل.',
        'يجب مراقبة السكر والكيتونات بشكل متكرر أثناء المرض.',
        'يجب إيقاف أدوية معينة فوراً عند حدوث قيء أو جفاف شديد، مثل: الميتفورمين وأدوية (SGLT2)، وذلك لتجنب حدوث فشل كلوي حاد أو حموضة كيتونية.',
        'أدوية (GLP-1) قد تحتاج للإيقاف أيضاً إذا كان هناك أعراض هضمية شديدة (مثل القيء المستمر).'
      ]
    }
  },
  {
    id: 'ada-2026-ch6-conclusion',
    group: '6. Glycemic Goals and Hypoglycemia',
    sourceIds: ['6-glycemic-goals-and-hypoglycemia-pdf', 'glycemic'],
    tags: ['Conclusion', 'Summary'],
    title: {
      en: 'Conclusion',
      ar: 'الخلاصة'
    },
    summary: {
      en: 'Chapter 6 emphasizes that numbers are not merely rigid targets to reach at any cost. Safety comes first; by avoiding hypoglycemia in every way, simplifying treatments for those at risk, and intensively educating patients and their surroundings on how to act in diabetes emergencies and adjust medications during illness.',
      ar: 'الفصل السادس يؤكد أن الأرقام ليست مجرد أهداف جامدة يجب الوصول إليها بأي ثمن. السلامة تأتي أولاً؛ من خلال تجنب الهبوط بشتى الطرق، تبسيط العلاجات لمن هم في خطر، وتثقيف المرضى ومحيطهم بشكل مكثف حول كيفية التصرف في حالات طوارئ السكري وتعديل الأدوية وقت المرض.'
    },
    points: {
      en: [],
      ar: []
    }
  }
];
