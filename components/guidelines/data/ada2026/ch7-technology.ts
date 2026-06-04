import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_7_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch7-principles',
    group: '7. Diabetes Technology',
    sourceIds: ['7-diabetes-technology-pdf', 'technology'],
    tags: ['Technology', 'Education', 'CGM'],
    title: {
      en: 'General Principles of Technology Use',
      ar: 'المبادئ العامة لاستخدام التكنولوجيا'
    },
    summary: {
      en: 'Technology must be offered with continuous education for maximum safe benefit.',
      ar: 'يجب عرض التكنولوجيا على المرضى مع تعليم مستمر لضمان أقصى استفادة بأمان تام.'
    },
    points: {
      en: [
        'Patient Right: Technological devices must be offered and made available to people with diabetes.',
        'Early Start: It is recommended to start using Continuous Glucose Monitoring (CGM) devices and pumps immediately upon diagnosis. Reaching a specific A1C level, C-peptide level, or having autoantibodies should not be a prerequisite to approve their use.',
        'Continuous Education: No device operates efficiently without continuous training. Patients and caregivers must be trained on how to use it, extract data, and act in emergencies (such as device failure).'
      ],
      ar: [
        'حق للمريض: يجب عرض الأجهزة التكنولوجية على الأشخاص المصابين بالسكري وتوفيرها لهم.',
        'البدء المبكر: يُنصح بالبدء في استخدام أجهزة المراقبة المستمرة (CGM) والمضخات فور التشخيص، ولا ينبغي اشتراط مستوى معين من السكر التراكمي (A1C) أو مستوى (C-peptide) أو وجود أجسام مضادة للموافقة على بدء استخدامها.',
        'التعليم المستمر: لا يوجد جهاز يعمل بكفاءة دون تدريب مستمر. يجب تدريب المرضى ومقدمي الرعاية على كيفية الاستخدام، استخراج البيانات، والتصرف في حالات الطوارئ (مثل تعطل الجهاز).'
      ]
    }
  },
  {
    id: 'ada-2026-ch7-bgm',
    group: '7. Diabetes Technology',
    sourceIds: ['7-diabetes-technology-pdf', 'technology'],
    tags: ['BGM', 'Blood Glucose', 'Interferences'],
    title: {
      en: 'Traditional Blood Glucose Monitoring (BGM)',
      ar: 'المراقبة التقليدية للسكر في الدم (BGM)'
    },
    summary: {
      en: 'Despite technological advancements, traditional fingerstick devices remain necessary.',
      ar: 'رغم تطور التكنولوجيا، تظل أجهزة الوخز التقليدية ضرورية.'
    },
    points: {
      en: [
        'Indispensable Backup: All users of Continuous Glucose Monitoring (CGM) must have a traditional meter as a backup, to use when doubting CGM accuracy, during the sensor\'s "warm-up" period, or during very rapid changes in blood sugar levels.',
        'Beware of Interferences (Interfering Substances) - Oxygen Level: Some devices are affected by hypoxia or hyperoxia (like high altitudes or oxygen therapy).',
        'Beware of Interferences - Medications and Chemicals: Vitamin C (in high doses), Paracetamol (Acetaminophen), and some other medications can cause incorrect glucose readings.',
        'Warning on Used Strips: Patients must be warned against buying used test strips or those from unknown sources (sold by unlicensed entities) to ensure accuracy.'
      ],
      ar: [
        'احتياطي لا غنى عنه: يجب أن يمتلك جميع مستخدمي أجهزة المراقبة المستمرة (CGM) جهاز قياس تقليدي كاحتياطي، لاستخدامه عند الشك في دقة الـ CGM، أثناء فترة "إحماء" الحساس، أو عند التغير السريع جداً في مستوى السكر.',
        'مستوى الأكسجين: بعض الأجهزة تتأثر بنقص أو زيادة الأكسجين (مثل حالات المرتفعات العالية أو العلاج بالأكسجين).',
        'الأدوية والمواد الكيميائية: فيتامين سي (بجرعات عالية)، الباراسيتامول (أسيتامينوفين)، وبعض الأدوية قد تسبب قراءات خاطئة للسكر.',
        'تحذير من الشرائط المستعملة: يجب تحذير المرضى من شراء شرائط القياس المستعملة أو مجهولة المصدر (التي تباع من جهات غير مرخصة) لضمان دقتها.'
      ]
    }
  },
  {
    id: 'ada-2026-ch7-cgm',
    group: '7. Diabetes Technology',
    sourceIds: ['7-diabetes-technology-pdf', 'technology'],
    tags: ['CGM', 'Interferences', 'Pregnancy', 'Skin Reactions'],
    title: {
      en: 'Continuous Glucose Monitoring (CGM)',
      ar: 'المراقبة المستمرة للجلوكوز (CGM)'
    },
    summary: {
      en: 'CGM devices have become the gold standard and are categorized into multiple types.',
      ar: 'أصبحت أجهزة المراقبة المستمرة (CGM) هي المعيار الأساسي وتُصنف إلى عدة أنواع.'
    },
    points: {
      en: [
        'Proven Benefits: Their use lowers A1C, increases "Time in Range" (TIR), and significantly reduces episodes of severe hypoglycemia and Diabetic Ketoacidosis (DKA) in Type 1 and Type 2 patients.',
        'Use During Pregnancy: Recommendations have been expanded to primarily include the use of CGM during pregnancy to achieve precise goals and avoid complications.',
        'Dangerous CGM Interferences: Patient medications must be reviewed carefully, as some falsely elevate the device reading (showing high glucose when it is normal or low). Most notable are: Vitamin C (Ascorbic acid) in doses exceeding 500 or 1000 mg/day (depending on the device type), and the oncology drug (Hydroxyurea) which causes false elevations in many devices.',
        'Skin Reactions: Device adhesives may cause irritation or contact dermatitis (due to substances like isobornyl acrylate). The skin must be checked periodically, and the adhesive type changed if necessary to ensure patient comfort.'
      ],
      ar: [
        'الفوائد المثبتة: استخدامها يقلل من السكر التراكمي، يزيد من "الوقت في النطاق المستهدف" (TIR)، ويقلل بشكل كبير من نوبات الهبوط الحاد والحموضة الكيتونية (DKA) لدى مرضى النوع الأول والثاني.',
        'الاستخدام أثناء الحمل: تم توسيع التوصيات لتشمل استخدام الـ CGM بشكل أساسي أثناء الحمل لتحقيق الأهداف الدقيقة وتجنب المضاعفات.',
        'تداخلات خطيرة مع الـ CGM: يجب مراجعة أدوية المريض بعناية، لأن بعضها يرفع قراءة الجهاز بشكل خادع (يُظهر السكر مرتفعاً بينما هو طبيعي أو منخفض)، ومن أهمها: فيتامين سي (Ascorbic acid) بجرعات تتجاوز 500 أو 1000 مجم/يوم، ودواء الأورام (Hydroxyurea) الذي يسبب ارتفاعاً كاذباً في قراءات العديد من الأجهزة.',
        'تفاعلات الجلد: قد تسبب المواد اللاصقة للأجهزة تهيجاً أو حساسية تلامسية (بسبب مواد مثل isobornyl acrylate). يجب فحص الجلد دورياً وتغيير نوع اللاصق إذا لزم الأمر لضمان راحة المريض.'
      ]
    }
  },
  {
    id: 'ada-2026-ch7-delivery',
    group: '7. Diabetes Technology',
    sourceIds: ['7-diabetes-technology-pdf', 'technology'],
    tags: ['Insulin Delivery', 'Smart Pens', 'AID'],
    title: {
      en: 'Evolution of Insulin Delivery',
      ar: 'تطور طرق حقن الإنسولين'
    },
    summary: {
      en: 'The transition from traditional syringes to smart pens and automated delivery systems.',
      ar: 'الانتقال من الحقن التقليدية إلى الأقلام الذكية وأنظمة التوصيل الآلي.'
    },
    points: {
      en: [
        'Smart Pens (Connected Pens): It is highly preferred to transition from regular syringes to insulin pens, especially connected smart pens that record insulin doses, the time they were taken, and link to smartphone apps. These pens improve outcomes and prevent forgotten or accidentally duplicated doses.',
        'Automated Insulin Delivery (AID) Systems: These systems (consisting of a smart pump, a CGM sensor, and an algorithm for adjusting doses) have become the primary first choice for Type 1 patients, as well as for many Type 2 patients relying on multiple injections.',
        'AID Functionality: They adjust the basal insulin infusion every 5 minutes based on glucose readings and predictions, which protects the patient from hypoglycemia during sleep and exercise.'
      ],
      ar: [
        'الأقلام الذكية (Connected Pens): يُفضل بشدة الانتقال من السرنجات العادية إلى أقلام الإنسولين، وخاصة الأقلام الذكية المتصلة التي تسجل جرعات الإنسولين ووقت أخذها وترتبط بتطبيقات الهاتف. هذه الأقلام تحسن النتائج وتمنع نسيان الجرعات أو تكرارها بالخطأ.',
        'أنظمة التوصيل الآلي للإنسولين (AID Systems): هذه الأنظمة (التي تتكون من مضخة ذكية وحساس CGM وخوارزمية لضبط الجرعات) أصبحت المفضل الأول لمرضى النوع الأول، وكذلك للكثير من مرضى النوع الثاني المعتمدين على حقن متعددة.',
        'تقوم بتعديل ضخ الإنسولين القاعدي كل 5 دقائق بناءً على قراءات السكر وتوقعاته، مما يحمي المريض من الهبوط أثناء النوم والرياضة.'
      ]
    }
  },
  {
    id: 'ada-2026-ch7-opensource',
    group: '7. Diabetes Technology',
    sourceIds: ['7-diabetes-technology-pdf', 'technology'],
    tags: ['Open-Source', 'Loop', 'OpenAPS'],
    title: {
      en: 'Open-Source AID Systems',
      ar: 'الأنظمة مفتوحة المصدر (Open-Source AID)'
    },
    summary: {
      en: 'A very important point for dealing with tech-savvy patients.',
      ar: 'نقطة هامة جداً للتعامل مع المرضى المتعمقين في التكنولوجيا.'
    },
    points: {
      en: [
        'Some patients and programmers have developed "open-source" systems to connect pumps to sensors themselves (like Loop or OpenAPS systems) instead of waiting for companies.',
        'The Medical Rule: "Do not reject these systems and do not leave the patient alone." It is strongly recommended to provide medical support, monitor the readings, and assist the patient in adjusting the settings for these systems to ensure their safety.'
      ],
      ar: [
        'بعض المرضى والمبرمجين قاموا بتطوير أنظمة "مفتوحة المصدر" لربط المضخات بالحساسات بأنفسهم (مثل أنظمة Loop أو OpenAPS) بدلاً من انتظار الشركات.',
        'القاعدة الطبية هنا هي: لا ترفض هذه الأنظمة ولا تترك المريض وحده. يُوصى بشدة بتقديم الدعم الطبي، ومتابعة القراءات، ومساعدة المريض في ضبط الإعدادات لهذه الأنظمة لضمان سلامته.'
      ]
    }
  },
  {
    id: 'ada-2026-ch7-inpatient',
    group: '7. Diabetes Technology',
    sourceIds: ['7-diabetes-technology-pdf', 'technology'],
    tags: ['Inpatient', 'Hospital'],
    title: {
      en: 'Technology in Inpatient Care',
      ar: 'التكنولوجيا أثناء التنويم بالمستشفى (Inpatient Care)'
    },
    summary: {
      en: 'Modern guidelines encourage continuing the use of personal devices in the hospital.',
      ar: 'الإرشادات الحديثة توصي باستمرار استخدام المريض لأجهزته داخل المستشفى.'
    },
    points: {
      en: [
        'In the past, patients were asked to remove their devices (pumps and sensors) upon entering the hospital. Modern guidelines recommend that patients continue using their devices (CGM and AID) inside the hospital whenever clinically appropriate for their health condition, provided an institutional protocol exists allowing this, to avoid glucose deterioration resulting from reliance on traditional hospital methods.'
      ],
      ar: [
        'في السابق، كان يُطلب من المريض إزالة أجهزته (المضخات والحساسات) فور دخوله المستشفى. الإرشادات الحديثة توصي باستمرار استخدام المريض لأجهزته (CGM و AID) داخل المستشفى متى كان ذلك ملائماً لحالته الصحية، وبشرط توفر بروتوكول مؤسسي يسمح بذلك لتجنب تدهور مستويات السكر نتيجة الاعتماد على الطرق التقليدية للمستشفى.'
      ]
    }
  },
  {
    id: 'ada-2026-ch7-conclusion',
    group: '7. Diabetes Technology',
    sourceIds: ['7-diabetes-technology-pdf', 'technology'],
    tags: ['Conclusion', 'Summary'],
    title: {
      en: 'Conclusion',
      ar: 'الخلاصة'
    },
    summary: {
      en: 'Technology in 2026 is no longer a luxury, but an essential part of treatment. However, technology alone is not enough without conscious human intervention; choosing the appropriate device for the patient\'s lifestyle, training them on it, and monitoring drug interactions and skin issues are the true steps to turning these devices into an effective tool for improving quality of life.',
      ar: 'التكنولوجيا في عام 2026 لم تعد رفاهية، بل هي جزء أساسي من العلاج. لكن التكنولوجيا وحدها لا تكفي دون تدخل بشري واعي؛ فاختيار الجهاز المناسب لأسلوب حياة المريض، وتدريبه عليه، ومراقبة التداخلات الدوائية ومشاكل الجلد، هي الخطوات الحقيقية لتحويل هذه الأجهزة إلى أداة فعالة لتحسين جودة الحياة.'
    },
    points: {
      en: [],
      ar: []
    }
  }
];
