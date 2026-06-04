const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'components', 'guidelines', 'data', 'ada2026');

const files = {
  'ch5-behaviors.ts': `import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_5_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch5-dsmes',
    group: '5. Facilitating Positive Health Behaviors',
    sourceIds: ['5-facilitating-positive-health-behaviors-and-well-being-to-improve-health-outcomes-pdf', 'behaviors'],
    tags: ['DSMES', 'Education', 'MNT'],
    title: {
      en: 'Diabetes Self-Management Education and Support (DSMES) & MNT',
      ar: 'التثقيف والدعم للإدارة الذاتية (DSMES) والعلاج الغذائي (MNT)'
    },
    summary: {
      en: 'DSMES and Medical Nutrition Therapy (MNT) are foundational to diabetes care. They provide patients with the knowledge, skills, and ability necessary for self-care, leading to improved clinical outcomes and quality of life.',
      ar: 'يعد التثقيف والإدارة الذاتية (DSMES) والعلاج الغذائي (MNT) أساسيين في رعاية السكري. يزودون المرضى بالمعرفة والمهارات اللازمة للعناية الذاتية، مما يحسن النتائج السريرية ونوعية الحياة.'
    },
    points: {
      en: [
        'Four Critical Times for DSMES: At diagnosis, annually and/or when not meeting treatment targets, when complicating factors develop (medical, physical, psychosocial), and when transitions in life and care occur.',
        'MNT Effectiveness: Intensive MNT by a registered dietitian can decrease A1C by 0.3–2.0% in T2D. There is no ideal percentage of calories from carbohydrates, protein, and fat for all people; macronutrient distribution should be individualized.',
        'Carbohydrate Quality: Emphasize nonstarchy vegetables, whole grains, fruits, and dairy over refined carbohydrates and added sugars. Minimize consumption of sugar-sweetened beverages.',
        'Sodium: Limit sodium consumption to <2,300 mg/day for the general population; further restriction may be appropriate for individuals with hypertension.',
        'Alcohol: If adults choose to drink alcohol, limit intake to ≤1 drink/day for women and ≤2 drinks/day for men. Emphasize that alcohol increases the risk of delayed hypoglycemia, especially if taking insulin or secretagogues.'
      ],
      ar: [
        'الأوقات الأربعة الحرجة للتثقيف DSMES: عند التشخيص، سنوياً و/أو عند عدم تحقيق الأهداف العلاجية، عند تطور مضاعفات جديدة، وعند حدوث تغيرات في ظروف الحياة أو الرعاية.',
        'فعالية MNT: العلاج الغذائي المكثف يمكن أن يخفض التراكمي بنسبة 0.3-2.0%. لا يوجد نسبة مئوية مثالية للنشويات والبروتين والدهون تناسب الجميع؛ يجب تخصيصها.',
        'جودة النشويات: التركيز على الخضروات غير النشوية، الحبوب الكاملة، الفواكه بدلاً من الكربوهيدرات المكررة والسكريات المضافة. منع المشروبات المحلاة بالسكر.',
        'الصوديوم: الحد من تناول الصوديوم إلى أقل من 2300 مجم/يوم؛ وقد يتطلب الأمر تقييداً إضافياً لمرضى الضغط.',
        'الكحوليات: يزيد الكحول من خطر هبوط السكر المتأخر، خاصة لمن يستخدمون الأنسولين أو محفزات إفرازه. يجب الحد من استهلاكه تماماً.'
      ]
    }
  },
  {
    id: 'ada-2026-ch5-psychosocial',
    group: '5. Facilitating Positive Health Behaviors',
    sourceIds: ['5-facilitating-positive-health-behaviors-and-well-being-to-improve-health-outcomes-pdf', 'behaviors'],
    tags: ['Psychosocial', 'Distress', 'Depression', 'Sleep'],
    title: {
      en: 'Psychosocial Care and Behavioral Health',
      ar: 'الرعاية النفسية الاجتماعية والصحة السلوكية'
    },
    summary: {
      en: 'Psychosocial care should be integrated with a collaborative, patient-centered approach. Diabetes distress, depression, anxiety, and eating disorders are highly prevalent and significantly impact disease management.',
      ar: 'يجب دمج الرعاية النفسية الاجتماعية بنهج تعاوني يركز على المريض. ضائقة السكري والاكتئاب واضطرابات الأكل شائعة جداً وتؤثر بشكل كبير على التحكم في المرض.'
    },
    points: {
      en: [
        'Diabetes Distress: Very common. Refers to the emotional burden and worries specific to living with diabetes. Assess periodically using validated tools (e.g., PAID or DDS). It is distinct from clinical depression.',
        'Depression & Anxiety: Screen for depression (e.g., PHQ-9) and anxiety (e.g., GAD-7) at initial visit, periodically, and when there is a change in disease, treatment, or life circumstance.',
        'Disordered Eating: Consider screening for disordered eating behaviors (e.g., binge eating, insulin omission for weight loss/diabulimia) when A1C is consistently unachieved or unexplained weight changes occur.',
        'Cognitive Capacity: Screen for cognitive impairment in older adults or those with severe hypoglycemia history, as it affects adherence to complex regimens.',
        'Sleep Health: Assess sleep pattern and duration; poor sleep quality (e.g., insomnia, OSA) impairs glucose metabolism and blood pressure regulation.'
      ],
      ar: [
        'ضائقة السكري (Diabetes Distress): شائعة جداً، وتشير للعبء العاطفي للتعايش مع السكري. تختلف عن الاكتئاب السريري. يجب تقييمها دورياً باستخدام مقاييس معتمدة.',
        'الاكتئاب والقلق: افحص الاكتئاب والقلق (مثل مقياس PHQ-9) في الزيارة الأولى وبشكل دوري.',
        'اضطرابات الأكل: افحص سلوكيات الأكل المضطربة (مثل الشره المرضي أو تقليل جرعات الأنسولين لإنقاص الوزن) عندما لا يتحسن التراكمي أبداً أو يحدث تغير غير مبرر في الوزن.',
        'القدرة الإدراكية: فحص الضعف الإدراكي لدى كبار السن، لأنه يؤثر على الالتزام بجدول الأدوية المعقد.',
        'صحة النوم: تقييم جودة النوم، حيث أن قلة النوم (مثل الأرق، توقف التنفس أثناء النوم) تضعف استقلاب الجلوكوز وتنظيم ضغط الدم.'
      ]
    }
  }
];`,

  'ch6-glycemic.ts': `import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_6_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch6-targets',
    group: '6. Glycemic Goals and Hypoglycemia',
    sourceIds: ['6-glycemic-goals-and-hypoglycemia-pdf', 'glycemic'],
    tags: ['A1C', 'TIR', 'Glycemic Targets'],
    title: {
      en: 'Individualized Glycemic Targets',
      ar: 'أهداف السكر الفردية المخصصة'
    },
    summary: {
      en: 'Glycemic management is evaluated by A1C and continuous glucose monitoring (CGM) metrics. Goals must be individualized based on the patient\\'s risk of hypoglycemia, disease duration, and life expectancy.',
      ar: 'يتم تقييم التحكم في السكر بواسطة التراكمي ومقاييس المراقبة المستمرة (CGM). يجب تخصيص الأهداف الفردية بناءً على خطر هبوط السكر، ومدة المرض، ومتوسط العمر المتوقع.'
    },
    points: {
      en: [
        'A1C Goal <7.0%: Appropriate for many nonpregnant adults without significant hypoglycemia. Targets fasting/preprandial glucose of 80–130 mg/dL and 1-2 hour postprandial glucose <180 mg/dL.',
        'More Stringent Goal (<6.5%): May be appropriate for selected individuals (short disease duration, T2D treated with lifestyle/metformin, long life expectancy, no significant CVD) if achievable safely.',
        'Less Stringent Goal (<8.0%): Appropriate for patients with history of severe hypoglycemia, limited life expectancy, advanced micro/macrovascular complications, or extensive comorbid conditions.',
        'CGM Time in Range (TIR): For most adults using CGM, aim for >70% of time in target range (70–180 mg/dL).',
        'CGM Time Below Range (TBR): Crucial metric. Aim for <4% of time below 70 mg/dL, and <1% below 54 mg/dL to minimize hypoglycemia risk.'
      ],
      ar: [
        'هدف التراكمي <7.0%: مناسب للعديد من البالغين. يستهدف سكر صائم 80-130 مجم/ديسيلتر، وسكر بعد الأكل بساعتين أقل من 180.',
        'أهداف أكثر صرامة (<6.5%): مناسبة للمرضى الجدد (تاريخ مرضي قصير)، بدون مضاعفات للقلب، وإذا كان يمكن تحقيقه بدون خطر الهبوط.',
        'أهداف أقل صرامة (<8.0%): مناسبة لمن لديهم تاريخ من الهبوط الشديد، أو متوسط عمر متوقع محدود، أو مضاعفات متقدمة للقلب أو الكلى.',
        'الوقت في النطاق المستهدف (TIR): لمستخدمي CGM، يجب استهداف قضاء >70% من الوقت في النطاق (70-180 مجم/ديسيلتر).',
        'الوقت تحت النطاق (TBR): مقياس حاسم. استهدف نسبة <4% من الوقت تحت 70 مجم/ديسيلتر لتجنب الهبوط.'
      ]
    }
  },
  {
    id: 'ada-2026-ch6-hypoglycemia',
    group: '6. Glycemic Goals and Hypoglycemia',
    sourceIds: ['6-glycemic-goals-and-hypoglycemia-pdf', 'glycemic'],
    tags: ['Hypoglycemia', 'Glucagon', 'Level 3'],
    title: {
      en: 'Classification and Management of Hypoglycemia',
      ar: 'تصنيف وعلاج هبوط السكر (Hypoglycemia)'
    },
    summary: {
      en: 'Hypoglycemia is the major limiting factor in the glycemic management of type 1 and type 2 diabetes. Severe hypoglycemia is a medical emergency requiring assistance from another person.',
      ar: 'هبوط السكر هو العامل المحدد الرئيسي في السيطرة على السكري. هبوط السكر الشديد هو حالة طبية طارئة تتطلب مساعدة من شخص آخر.'
    },
    points: {
      en: [
        'Level 1 Hypoglycemia: Glucose <70 mg/dL and ≥54 mg/dL. Treat with fast-acting carbohydrates.',
        'Level 2 Hypoglycemia: Glucose <54 mg/dL. Clinically significant; threshold for neuroglycopenic symptoms.',
        'Level 3 Hypoglycemia: Severe cognitive impairment requiring external assistance for recovery. No specific glucose threshold.',
        'Rule of 15: For Level 1/2 in conscious patients, consume 15 g of fast-acting carbohydrate (e.g., 4 glucose tablets, 4 oz juice). Recheck in 15 minutes. Repeat if still <70 mg/dL.',
        'Glucagon Prescription: Glucagon MUST be prescribed for all individuals at increased risk of level 2 or 3 hypoglycemia. Ready-to-use nasal powder or auto-injectors are preferred over traditional reconstitution kits.'
      ],
      ar: [
        'هبوط السكر المستوى الأول: بين 54 إلى أقل من 70 مجم/ديسيلتر. يعالج بالكربوهيدرات سريعة الامتصاص.',
        'هبوط السكر المستوى الثاني: أقل من 54 مجم/ديسيلتر. هبوط سريري حرج تظهر فيه الأعراض العصبية بوضوح.',
        'هبوط السكر المستوى الثالث: ضعف إدراكي شديد يتطلب مساعدة خارجية (شخص آخر) للتعافي. (غيبوبة أو تشنج).',
        'قاعدة الـ 15: في حالات الوعي، تناول 15 جرام كربوهيدرات سريعة (عصير أو أقراص جلوكوز). أعد الفحص بعد 15 دقيقة، وكرر إذا لزم الأمر.',
        'وصفة الجلوكاجون: يجب وصف إبرة الجلوكاجون أو بخاخ الأنف لأي مريض معرض لخطر الهبوط من المستوى 2 أو 3، لإنقاذه في حالات فقدان الوعي.'
      ]
    }
  }
];`,

  'ch7-technology.ts': `import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_7_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch7-cgm',
    group: '7. Diabetes Technology',
    sourceIds: ['7-diabetes-technology-pdf', 'technology'],
    tags: ['CGM', 'rtCGM', 'isCGM'],
    title: {
      en: 'Continuous Glucose Monitoring (CGM) Systems',
      ar: 'أنظمة المراقبة المستمرة للجلوكوز (CGM)'
    },
    summary: {
      en: 'CGM systems have revolutionized diabetes care by providing real-time glucose data, trend arrows, and alarms for hypoglycemia/hyperglycemia. They are now considered standard of care for many patient groups.',
      ar: 'أحدثت أنظمة المراقبة المستمرة (CGM) ثورة في الرعاية من خلال توفير قراءات فورية واتجاهات وإنذارات. تعتبر الآن الرعاية القياسية للعديد من الفئات.'
    },
    points: {
      en: [
        'Indications for T1D: Real-time CGM (rtCGM) or intermittently scanned CGM (isCGM) should be offered to ALL adults and youth with type 1 diabetes.',
        'Indications for T2D (Insulin): CGM is recommended for adults with type 2 diabetes on multiple daily injections (MDI) AND for those on basal insulin only, to improve A1C and reduce hypoglycemia.',
        'Indications for T2D (Non-insulin): CGM can be beneficial for adults with T2D not on insulin to improve dietary behaviors and provide insight into the impact of lifestyle choices.',
        'Pregnancy: rtCGM is strongly recommended in pregnant women with T1D, as it is associated with improved neonatal outcomes (less macrosomia and NICU admissions).',
        'Skin Reactions: Clinicians must be aware of potential contact dermatitis or skin irritation from CGM adhesives and manage them proactively.'
      ],
      ar: [
        'دواعي الاستخدام للنوع الأول: يجب تقديم أنظمة CGM (المباشرة أو بالمسح المتقطع) لجميع البالغين والشباب المصابين بالنوع الأول.',
        'دواعي الاستخدام للنوع الثاني (مستخدمي الأنسولين): يوصى بـ CGM للبالغين الذين يستخدمون حقن متعددة أو حتى أنسولين قاعدي فقط لتحسين التراكمي وتجنب الهبوط.',
        'النوع الثاني (بدون أنسولين): قد يكون الـ CGM مفيداً كأداة تعليمية وتعديل سلوكي لتوضيح تأثير النظام الغذائي.',
        'فترة الحمل: يوصى بشدة باستخدام CGM للنساء الحوامل المصابات بالنوع الأول لتحسين مخرجات الولادة وتقليل مضاعفات الجنين.',
        'تفاعلات الجلد: يجب الانتباه لحساسية الجلد الناتجة عن المواد اللاصقة لأجهزة الاستشعار (السنسور) ومعالجتها بشكل استباقي.'
      ]
    }
  },
  {
    id: 'ada-2026-ch7-aid',
    group: '7. Diabetes Technology',
    sourceIds: ['7-diabetes-technology-pdf', 'technology'],
    tags: ['AID', 'Insulin Pumps', 'Smart Pens'],
    title: {
      en: 'Automated Insulin Delivery (AID) and Smart Pens',
      ar: 'إعطاء الأنسولين الآلي (AID) والأقلام الذكية'
    },
    summary: {
      en: 'Advanced insulin delivery mechanisms, particularly Automated Insulin Delivery (AID) systems (artificial pancreas), combine CGM data with pump algorithms to automatically adjust insulin basal rates and correction boluses.',
      ar: 'تجمع أنظمة إعطاء الأنسولين الآلية (البنكرياس الصناعي) بين بيانات CGM وخوارزميات المضخة لضبط الأنسولين القاعدي والجرعات التصحيحية تلقائياً.'
    },
    points: {
      en: [
        'AID Systems: Should be offered for diabetes management to youth and adults with type 1 diabetes. They consistently outperform traditional pumps and MDI in maximizing Time in Range (TIR) and minimizing hypoglycemia.',
        'CSII (Traditional Pumps): Continuous subcutaneous insulin infusion (CSII) is an option for adults and youth who are unable to use AID or prefer not to.',
        'Smart Pens: Connected insulin pens (smart pens) should be considered for patients on MDI. They track insulin doses and timing, helping to prevent insulin stacking and missed doses.',
        'Backup Plan: All patients using insulin pumps/AID MUST have a clearly written backup plan (and supplies) for reverting to basal-bolus injections in case of pump failure or site issues (e.g., DKA risk).'
      ],
      ar: [
        'أنظمة AID (البنكرياس الصناعي): يجب توفيرها للشباب والبالغين ذوي النوع الأول. تتفوق بشكل هائل على المضخات التقليدية في زيادة الوقت في النطاق المستهدف وتقليل الهبوط.',
        'المضخات التقليدية (CSII): خيار لمن لا يمكنهم أو لا يفضلون استخدام الأنظمة الآلية بالكامل.',
        'الأقلام الذكية (Smart Pens): يوصى بها لمستخدمي الحقن المتعددة. تسجل وقت وكمية الجرعة مما يمنع نسيان الجرعات أو أخذ جرعات مزدوجة (تراكم الأنسولين).',
        'خطة الطوارئ: يجب أن يمتلك جميع مستخدمي المضخات خطة طوارئ مكتوبة وأقلام أنسولين بديلة للعودة للحقن اليدوي فوراً في حال تعطل المضخة (لتجنب خطر الحموضة الكيتونية DKA).'
      ]
    }
  }
];`,

  'ch8-obesity.ts': `import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_8_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch8-assessment',
    group: '8. Obesity and Weight Management',
    sourceIds: ['8-obesity-and-weight-management-for-the-treatment-of-type-2-diabetes-pdf', 'obesity'],
    tags: ['Obesity', 'BMI', 'Weight Loss'],
    title: {
      en: 'Assessment and Goals of Weight Management',
      ar: 'تقييم وأهداف إدارة الوزن لمرضى السكري'
    },
    summary: {
      en: 'Obesity is a chronic, progressive disease. In patients with type 2 diabetes and overweight/obesity, intentional weight loss significantly improves glycemic control, cardiovascular risk, and can even induce diabetes remission.',
      ar: 'السمنة مرض مزمن. بالنسبة لمرضى النوع الثاني الذين يعانون من السمنة، يؤدي فقدان الوزن المتعمد إلى تحسين التحكم في السكر ومخاطر القلب بشكل كبير، وقد يؤدي إلى تراجع المرض (Remission).'
    },
    points: {
      en: [
        'Assessment: Calculate BMI annually. Note that BMI cutoffs for overweight/obesity are lower in Asian American populations (≥23 kg/m2 and ≥27.5 kg/m2 respectively).',
        'Weight Loss Targets: A loss of 3–7% of body weight improves glycemia and CVD risk factors. Larger, sustained weight loss (>10-15%) can have disease-modifying effects and potentially lead to remission of type 2 diabetes.',
        'Stigma: Use person-first, non-stigmatizing language (e.g., "patient with obesity" rather than "obese patient").',
        'Diet and Lifestyle: An energy deficit of 500–750 kcal/day is standard. Combine with at least 150 min/week of moderate physical activity.'
      ],
      ar: [
        'التقييم: احسب مؤشر كتلة الجسم (BMI) سنوياً. (تختلف معايير السمنة في بعض الأعراق الآسيوية لتكون أقل من المعتاد).',
        'أهداف فقدان الوزن: خسارة 3-7% من الوزن تحسن السكر ومخاطر القلب. خسارة الوزن الكبيرة والمستدامة (>10-15%) يمكن أن تغير مسار المرض وقد تؤدي للشفاء التام (Remission) من النوع الثاني.',
        'تجنب الوصمة: استخدم لغة محترمة وغير وصمة للمريض (مثل "مريض يعاني من السمنة" وليس "مريض سمين").',
        'النظام الغذائي: خفض السعرات بمقدار 500-750 سعرة حرارية يومياً هو المعيار، مع نشاط بدني 150 دقيقة أسبوعياً.'
      ]
    }
  },
  {
    id: 'ada-2026-ch8-pharmacology',
    group: '8. Obesity and Weight Management',
    sourceIds: ['8-obesity-and-weight-management-for-the-treatment-of-type-2-diabetes-pdf', 'obesity'],
    tags: ['Anti-obesity', 'GLP-1', 'GIP', 'Bariatric Surgery'],
    title: {
      en: 'Pharmacotherapy and Metabolic Surgery for Weight Management',
      ar: 'العلاج الدوائي والجراحة الأيضية لإدارة الوزن'
    },
    summary: {
      en: 'Highly effective anti-obesity medications and metabolic surgery are strongly recommended tools for achieving substantial weight loss in eligible patients with T2D.',
      ar: 'تعد أدوية السمنة عالية الفعالية والجراحات الأيضية (جراحات السمنة) أدوات موصى بها بقوة لتحقيق فقدان وزن كبير للمرضى المؤهلين.'
    },
    points: {
      en: [
        'Anti-Obesity Medications: Consider for patients with BMI ≥27 kg/m2. GLP-1 RAs (Semaglutide, Liraglutide) and dual GIP/GLP-1 RAs (Tirzepatide) are preferred due to their profound dual efficacy on weight and A1C.',
        'Medication Evaluation: Assess weight loss efficacy at 3 months. If weight loss is <5%, consider discontinuing the medication and switching to a different agent or approach.',
        'Metabolic Surgery Indications: Recommended as a treatment option for T2D in patients with BMI ≥30 kg/m2 (≥27.5 kg/m2 in Asian Americans) who do not achieve durable weight loss and comorbidities improvement with reasonable nonsurgical methods.',
        'Surgery Types: Roux-en-Y gastric bypass, sleeve gastrectomy, and adjustable gastric banding. They provide dramatic A1C improvements and CVD risk reduction.',
        'Post-Surgery Monitoring: Patients require lifelong support, regular micronutrient screening (B12, iron, calcium, vitamin D), and monitoring for post-bariatric hypoglycemia.'
      ],
      ar: [
        'أدوية السمنة: يوصى بها لمن لديهم BMI ≥27. يُفضل استخدام منبهات GLP-1 (مثل سيماجلوتيد) والمزدوجة GIP/GLP-1 (مثل تيرزيباتيد) لفعاليتها الهائلة على الوزن والتراكمي.',
        'تقييم الأدوية: قم بتقييم الاستجابة بعد 3 أشهر من الوصول للجرعة العلاجية. إذا كان فقدان الوزن <5%، فكر في إيقاف الدواء والتحويل لخيار آخر.',
        'دواعي الجراحة الأيضية (التكميم/تحويل المسار): موصى بها لمرضى النوع الثاني الذين لديهم BMI ≥30 ولم ينجحوا في تحقيق الأهداف بالطرق غير الجراحية.',
        'فوائد الجراحة: توفر تحسناً دراماتيكياً في التراكمي وتخفيضاً كبيراً في مخاطر الوفاة بأمراض القلب.',
        'متابعة ما بعد الجراحة: يحتاج المرضى لدعم مدى الحياة، وفحص دوري للفيتامينات (B12، الحديد، الكالسيوم، فيتامين د)، ومراقبة لحالات الهبوط الشديد المتأخر بعد الجراحة.'
      ]
    }
  }
];`
};

for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(dataDir, filename), content);
}
console.log('Done chapters 5-8');
