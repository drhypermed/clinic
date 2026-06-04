const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'components', 'guidelines', 'data', 'ada2026');

const files = {
  'ch9-pharmacologic.ts': `import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_9_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch9-firstline',
    group: '9. Pharmacologic Approaches to Glycemic Treatment',
    sourceIds: ['9-pharmacologic-approaches-to-glycemic-treatment-pdf', 'pharmacologic'],
    tags: ['First-line', 'Metformin', 'GLP-1', 'SGLT2'],
    title: {
      en: 'First-Line Therapy and Comorbidity-Driven Selection',
      ar: 'الخط العلاجي الأول واختيار الأدوية بناءً على الأمراض المصاحبة'
    },
    summary: {
      en: 'The approach to type 2 diabetes has shifted from a purely glucose-centric model to a comorbidity-driven model. Metformin is no longer the automatic first choice for everyone; the presence of CVD, heart failure, or CKD dictates the initial agent.',
      ar: 'تحول نهج علاج النوع الثاني من التركيز على السكر فقط إلى نموذج يعتمد على الأمراض المصاحبة. لم يعد الميتفورمين الخيار الأول التلقائي للجميع؛ فوجود أمراض القلب أو الكلى يحدد الدواء الأولي.'
    },
    points: {
      en: [
        'ASCVD or High Risk: In patients with established ASCVD or indicators of high risk, a GLP-1 RA or SGLT2 inhibitor with proven cardiovascular benefit is recommended, independent of baseline A1C or metformin use.',
        'Heart Failure: In patients with heart failure (HFrEF or HFpEF), an SGLT2 inhibitor is strongly recommended to reduce the risk of worsening heart failure and cardiovascular death, independent of A1C.',
        'Chronic Kidney Disease: In patients with CKD, an SGLT2 inhibitor is recommended to reduce CKD progression and CV events. If SGLT2i is contraindicated, a GLP-1 RA with proven CVD benefit is recommended.',
        'Cost/Access Issues: If cost is a major barrier, Metformin and Sulfonylureas (or TZDs) are viable options, though they lack the organ-protective benefits of newer classes. Avoid Sulfonylureas in older adults due to hypoglycemia risk.'
      ],
      ar: [
        'أمراض القلب (ASCVD) أو الخطر العالي: للمرضى المصابين، يوصى ببدء GLP-1 أو SGLT2 بغض النظر عن التراكمي أو استخدام الميتفورمين، لفوائدهما المثبتة للقلب.',
        'قصور (فشل) القلب: يوصى بشدة باستخدام مثبط SGLT2 لتقليل تفاقم قصور القلب والوفاة، بغض النظر عن مستوى التراكمي.',
        'أمراض الكلى المزمنة: يوصى باستخدام SGLT2 لتقليل تدهور الكلى. وإذا كان غير مناسب، يُستخدم GLP-1.',
        'التكلفة: إذا كانت التكلفة عائقاً، يمكن استخدام الميتفورمين والسلفونيليوريا (أو TZD)، مع الحذر من السلفونيليوريا لكبار السن بسبب خطر الهبوط.'
      ]
    }
  },
  {
    id: 'ada-2026-ch9-insulin',
    group: '9. Pharmacologic Approaches to Glycemic Treatment',
    sourceIds: ['9-pharmacologic-approaches-to-glycemic-treatment-pdf', 'pharmacologic'],
    tags: ['Insulin', 'Basal', 'Prandial', 'Overbasalization'],
    title: {
      en: 'Insulin Therapy Initiation and Intensification',
      ar: 'بدء وتكثيف العلاج بالأنسولين'
    },
    summary: {
      en: 'Insulin is the most potent glucose-lowering agent. It should be initiated promptly when severe hyperglycemia is present, but over-reliance on basal insulin (overbasalization) without adding prandial control must be avoided.',
      ar: 'الأنسولين هو الأقوى لخفض السكر. يجب البدء به فوراً عند الارتفاع الشديد، ولكن يجب تجنب الاعتماد المفرط على الأنسولين القاعدي (Overbasalization) دون إضافة تحكم في الوجبات.'
    },
    points: {
      en: [
        'Early Introduction: Consider early introduction of insulin if there is evidence of ongoing catabolism (weight loss), symptoms of hyperglycemia are present, or A1C levels (>10%) or blood glucose levels (≥300 mg/dL) are very high.',
        'Basal Insulin Initiation: Start with basal insulin at 10 units/day OR 0.1–0.2 units/kg/day. Titrate by 2 units every 3 days until fasting target is reached.',
        'Avoid Overbasalization: Clinical signals include a basal dose >0.5 units/kg/day, high bedtime-morning or post-preprandial glucose differential, or hypoglycemia. Do NOT just keep increasing basal insulin if fasting targets are met but A1C is high.',
        'Prandial Intensification: When A1C remains above target despite adequate basal insulin, add prandial (mealtime) insulin starting with 1 dose (4 units or 10% of basal dose) at the largest meal.',
        'GLP-1 RA before Prandial: Before adding prandial insulin, consider adding a GLP-1 RA if not already prescribed, as it provides weight loss and limits the need for complex insulin regimens.'
      ],
      ar: [
        'البدء المبكر: فكر في الأنسولين فوراً إذا كانت هناك علامات تكسير (فقدان الوزن السريع)، أو أعراض شديدة، أو تراكمي >10% أو سكر >300 مجم/ديسيلتر.',
        'جرعة الأنسولين القاعدي الأولية: ابدأ بـ 10 وحدات/يوم أو 0.1-0.2 وحدة/كجم/يوم. زد الجرعة بمقدار وحدتين كل 3 أيام حتى نصل للهدف الصائم.',
        'تجنب فرط القاعدي (Overbasalization): من علاماته تجاوز الجرعة 0.5 وحدة/كجم، أو فروقات كبيرة بين سكر قبل وبعد الوجبة. لا تستمر في زيادة القاعدي إذا كان الصائم طبيعياً بينما التراكمي ما زال مرتفعاً.',
        'التكثيف بالوجبات (Prandial): إذا ظل التراكمي مرتفعاً، أضف جرعة أنسولين سريع (4 وحدات أو 10% من القاعدي) مع الوجبة الأكبر.',
        'استخدام GLP-1 قبل التكثيف بالأنسولين: قبل إضافة الأنسولين السريع للوجبات، جرب إضافة حقن GLP-1 لتقليل الوزن وتجنب تعقيد الأنسولين.'
      ]
    }
  }
];`,

  'ch10-cvd.ts': `import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_10_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch10-bp',
    group: '10. Cardiovascular Disease and Risk Management',
    sourceIds: ['10-cardiovascular-disease-and-risk-management-pdf', 'cvd'],
    tags: ['Hypertension', 'BP Targets', 'ACE', 'ARB'],
    title: {
      en: 'Blood Pressure Management in Diabetes',
      ar: 'إدارة ضغط الدم لدى مرضى السكري'
    },
    summary: {
      en: 'Hypertension is highly prevalent in diabetes and is a major risk factor for both ASCVD and microvascular complications. Strict BP control is mandatory.',
      ar: 'ارتفاع ضغط الدم منتشر جداً بين مرضى السكري وهو عامل خطر رئيسي لأمراض القلب ومضاعفات الأوعية الدقيقة. السيطرة الصارمة عليه إلزامية.'
    },
    points: {
      en: [
        'BP Target: The general BP target is <130/80 mmHg, if it can be safely achieved. (Note: Older guidelines used <140/90, but evidence strongly supports the lower target).',
        'Measurement: Blood pressure should be measured at every routine clinical visit. Patients with elevated BP should have BP confirmed using multiple readings, including out-of-office measurements.',
        'Pharmacotherapy: Initiate treatment for BP ≥130/80 mmHg. For BP ≥150/90 mmHg, initiate two drugs immediately.',
        'Drug Classes: First-line includes ACE inhibitors, ARBs, thiazide-like diuretics, or dihydropyridine calcium channel blockers. Do NOT combine ACE inhibitors and ARBs.',
        'UACR and BP: An ACE inhibitor or ARB is strongly recommended for patients with diabetes and hypertension who also have albuminuria (UACR ≥30 mg/g).'
      ],
      ar: [
        'هدف الضغط: الهدف العام هو أقل من 130/80 ملم زئبق (إذا تم تحقيقه بأمان). الأهداف القديمة كانت 140/90 لكن الأدلة الحديثة تدعم خفضه.',
        'القياس: يجب قياس الضغط في كل زيارة طبية. يجب التأكيد بقياسات متعددة (بما فيها قياسات المنزل) قبل بدء العلاج.',
        'العلاج الدوائي: ابدأ العلاج إذا كان الضغط ≥130/80. وإذا كان ≥150/90، ابدأ بدواءين معاً من البداية.',
        'فئات الأدوية: تشمل الخطوط الأولى مثبطات الإنزيم (ACEi)، أو حاصرات المستقبلات (ARB)، أو مدرات البول، أو حاصرات قنوات الكالسيوم. يمنع منعاً باتاً الجمع بين ACEi و ARB معاً.',
        'الألبومين والضغط: يوصى بشدة باستخدام ACEi أو ARB لمرضى السكري والضغط الذين لديهم زلال في البول (UACR ≥30 مجم/جم).'
      ]
    }
  },
  {
    id: 'ada-2026-ch10-lipids',
    group: '10. Cardiovascular Disease and Risk Management',
    sourceIds: ['10-cardiovascular-disease-and-risk-management-pdf', 'cvd'],
    tags: ['Lipids', 'Statins', 'LDL', 'Aspirin'],
    title: {
      en: 'Lipid Management and Antiplatelet Therapy',
      ar: 'إدارة الدهون الكوليسترول والعلاج المضاد للصفائح'
    },
    summary: {
      en: 'Statins remain the cornerstone of lipid-lowering therapy. Targets for LDL cholesterol are becoming increasingly stringent for high-risk individuals.',
      ar: 'تظل الستاتينات (أدوية الكوليسترول) حجر الزاوية. أصبحت أهداف الكوليسترول الضار (LDL) أكثر صرامة للأشخاص المعرضين لمخاطر عالية.'
    },
    points: {
      en: [
        'Primary Prevention (Age 40-75): Use moderate-intensity statin therapy. Aim for LDL-C reduction of ≥50% and target LDL-C <70 mg/dL.',
        'Secondary Prevention (Established ASCVD): High-intensity statin therapy is recommended. Target LDL-C reduction of ≥50% and LDL-C <55 mg/dL. Add Ezetimibe or a PCSK9 inhibitor if target is not met on max tolerated statin.',
        'Aged >75 Years: It is reasonable to continue statin therapy. In those not on statins, consider initiation after discussing risks and benefits.',
        'Hypertriglyceridemia: For patients with ASCVD or other cardiovascular risk factors on a statin with controlled LDL-C but elevated triglycerides (135–499 mg/dL), consider adding Icosapent Ethyl.',
        'Antiplatelet (Aspirin): Use aspirin (75–162 mg/day) as secondary prevention in those with a history of ASCVD. For primary prevention, aspirin may be considered in those at high CV risk after a comprehensive discussion of bleeding risks.'
      ],
      ar: [
        'الوقاية الأولية (للعمر 40-75 بدون جلطات سابقة): استخدم ستاتين متوسط الكثافة. الهدف هو خفض LDL بنسبة ≥50% والوصول لـ LDL <70 مجم/ديسيلتر.',
        'الوقاية الثانوية (جلطات سابقة): ستاتين عالي الكثافة إلزامي. الهدف خفض LDL ≥50% والوصول لـ LDL <55 مجم/ديسيلتر. إذا لم يتحقق، أضف Ezetimibe أو حقن PCSK9.',
        'لمن هم فوق 75 عاماً: من المنطقي الاستمرار في الستاتين. ولمن لم يبدأ، يمكن البدء بعد تقييم الفوائد والمخاطر.',
        'الدهون الثلاثية: إذا كان LDL مضبوطاً والدهون الثلاثية مرتفعة (135-499 مجم/ديسيلتر) لمريض قلب، فكر في إضافة دواء Icosapent Ethyl.',
        'الأسبرين: يستخدم كوقاية ثانوية (75-162 مجم/يوم) لمن لديه جلطات سابقة. في الوقاية الأولية، يستخدم فقط للأشخاص ذوي الخطورة العالية جداً بعد تقييم خطر النزيف.'
      ]
    }
  }
];`,

  'ch11-ckd.ts': `import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_11_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch11-ckd-screen',
    group: '11. Chronic Kidney Disease and Risk Management',
    sourceIds: ['11-chronic-kidney-disease-and-risk-management-pdf', 'ckd'],
    tags: ['CKD', 'Screening', 'UACR', 'eGFR'],
    title: {
      en: 'Screening and Diagnosis of Diabetic Kidney Disease',
      ar: 'فحص وتشخيص مرض الكلى السكري'
    },
    summary: {
      en: 'Diabetic kidney disease (DKD) is a clinical diagnosis based on the presence of albuminuria and/or reduced eGFR in the absence of signs or symptoms of other primary causes of kidney damage.',
      ar: 'مرض الكلى السكري هو تشخيص سريري يعتمد على وجود زلال في البول و/أو انخفاض معدل الترشيح (eGFR) في غياب أسباب أخرى لتلف الكلى.'
    },
    points: {
      en: [
        'Annual Screening: Screen at least annually using spot Urinary Albumin-to-Creatinine Ratio (UACR) AND estimated Glomerular Filtration Rate (eGFR).',
        'Who to Screen: All patients with T2D (starting at diagnosis), patients with T1D for ≥5 years, and all patients with comorbid hypertension.',
        'Confirmation: Two of three UACR specimens collected within a 3- to 6-month period should be abnormal (≥30 mg/g) before making a diagnosis, as exercise, infection, fever, and CHF can cause transient elevation.',
        'Staging: CKD is staged comprehensively based on both the GFR category (G1-G5) and Albuminuria category (A1-A3) to determine frequency of monitoring and risk of progression.',
        'Dietary Protein: For people with non-dialysis-dependent CKD, target dietary protein intake to 0.8 g/kg body weight per day. Do not restrict below this level.'
      ],
      ar: [
        'الفحص السنوي: افحص سنوياً على الأقل باستخدام نسبة الألبومين للكرياتينين (UACR) ومعدل الترشيح الكبيبي (eGFR).',
        'من يجب فحصه: جميع مرضى النوع الثاني (منذ التشخيص)، النوع الأول (بعد 5 سنوات)، وأي مريض سكري لديه ضغط دم مرتفع.',
        'التأكيد: يجب أن تكون نتيجتان من أصل 3 عينات للبول (خلال 3-6 أشهر) غير طبيعية (≥30 مجم/جم) لتأكيد التشخيص، لأن الرياضة والحمى والالتهابات ترفع الزلال مؤقتاً.',
        'تصنيف المراحل: يتم تصنيف CKD بناءً على فئة GFR وفئة زلال البول معاً لتحديد خطورة التدهور وتكرار المتابعة.',
        'البروتين الغذائي: لمرضى الكلى غير المعتمدين على الغسيل، استهدف بروتين غذائي بمقدار 0.8 جم/كجم يومياً، ولا تقلل عنه.'
      ]
    }
  },
  {
    id: 'ada-2026-ch11-ckd-treat',
    group: '11. Chronic Kidney Disease and Risk Management',
    sourceIds: ['11-chronic-kidney-disease-and-risk-management-pdf', 'ckd'],
    tags: ['SGLT2i', 'nsMRA', 'ACEi', 'Finerenone'],
    title: {
      en: 'Therapeutic Management to Delay CKD Progression',
      ar: 'الإدارة العلاجية لتأخير تدهور الكلى'
    },
    summary: {
      en: 'Management of CKD has evolved dramatically with the introduction of SGLT2 inhibitors and nonsteroidal mineralocorticoid receptor antagonists (nsMRAs), which provide specific renoprotective effects independent of glucose lowering.',
      ar: 'تطورت إدارة أمراض الكلى بشكل هائل مع دخول مثبطات SGLT2 ومضادات القشرانيات المعدنية (nsMRAs) التي تحمي الكلى بشكل مباشر.'
    },
    points: {
      en: [
        'SGLT2 Inhibitors: Strongly recommended for all patients with T2D and CKD (eGFR ≥20 mL/min/1.73 m2 and UACR ≥200 mg/g) to reduce CKD progression. Also recommended for patients with UACR 30-299 mg/g.',
        'Finerenone (nsMRA): Recommended for patients with T2D and CKD with albuminuria who are on maximum tolerated ACEi/ARB to reduce cardiovascular events and CKD progression. Monitor potassium closely.',
        'ACEi or ARB: Use for patients with hypertension and UACR ≥30 mg/g. Monitor serum creatinine and potassium. Do not discontinue for minor increases in creatinine (<30%).',
        'GLP-1 RAs: If SGLT2i are not tolerated or contraindicated, GLP-1 RAs are recommended to reduce cardiovascular risk and slow albuminuria progression.',
        'Referral to Nephrology: Refer when eGFR <30 mL/min/1.73 m2, or if there is uncertainty about etiology, difficult management issues (e.g., anemia, hyperkalemia), or rapidly progressing kidney disease.'
      ],
      ar: [
        'مثبطات SGLT2: موصى بها بشدة لمرضى النوع الثاني مع مرض كلوي (زلال أعلى من 200) لتقليل التدهور، وتستخدم حتى لو كان eGFR يصل إلى 20. وكذلك لمن لديهم زلال 30-299.',
        'دواء Finerenone: يوصى به لمرضى النوع الثاني مع زلال البول والذين يستخدمون أقصى جرعة من ACEi/ARB لتقليل الأحداث القلبية وتدهور الكلى. يجب مراقبة البوتاسيوم.',
        'أدوية ACEi/ARB: للضغط مع زلال البول. راقب الكرياتينين والبوتاسيوم، ولا توقف الدواء لمجرد ارتفاع بسيط في الكرياتينين (<30%).',
        'حقن GLP-1: إذا كانت أدوية SGLT2 غير مناسبة، استخدم GLP-1 لتقليل الزلال ومخاطر القلب.',
        'الإحالة لأخصائي الكلى: عندما يصبح eGFR <30، أو عند التدهور السريع للوظائف، أو وجود مشاكل معقدة (أنيميا الكلى، ارتفاع البوتاسيوم الشديد).'
      ]
    }
  }
];`,

  'ch12-microvascular.ts': `import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_12_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch12-retinopathy',
    group: '12. Retinopathy, Neuropathy, and Foot Care',
    sourceIds: ['12-retinopathy-neuropathy-and-foot-care-pdf', 'microvascular'],
    tags: ['Retinopathy', 'Macular Edema', 'Eye Exam'],
    title: {
      en: 'Diabetic Retinopathy Screening and Treatment',
      ar: 'فحص وعلاج اعتلال الشبكية السكري'
    },
    summary: {
      en: 'Diabetic retinopathy is a leading cause of preventable blindness. Optimal glycemic and blood pressure control can slow its progression. Timely screening is critical because early stages are asymptomatic.',
      ar: 'اعتلال الشبكية السكري سبب رئيسي للعمى الممكن الوقاية منه. الفحص الدائم أمر بالغ الأهمية لأن مراحله المبكرة بلا أعراض.'
    },
    points: {
      en: [
        'Screening Timeline (T1D): Initial comprehensive eye exam within 5 years after onset.',
        'Screening Timeline (T2D): Initial comprehensive eye exam at the time of diabetes diagnosis.',
        'Frequency: If there is no evidence of retinopathy for one or more annual eye exams, testing every 1–2 years may be considered. If retinopathy is present, subsequent exams should be at least annually or more frequently.',
        'Pregnancy: Women with preexisting diabetes planning pregnancy should have a baseline eye exam and be counseled on the risk of development/progression of retinopathy. Exams should occur in the first trimester and follow-up during pregnancy and 1-year postpartum.',
        'Treatment: Intravitreal injections of anti-vascular endothelial growth factor (anti-VEGF) are highly effective and often the first-line treatment for diabetic macular edema and some forms of proliferative retinopathy. Laser photocoagulation remains a cornerstone for high-risk proliferative retinopathy.'
      ],
      ar: [
        'توقيت الفحص للنوع الأول: فحص كامل للعين خلال 5 سنوات من بداية المرض.',
        'توقيت الفحص للنوع الثاني: فحص كامل للعين وقت تشخيص السكري مباشرة.',
        'تكرار الفحص: إذا لم يكن هناك اعتلال، يمكن الفحص كل سنة إلى سنتين. وإذا وجد، فكل سنة أو أقل.',
        'الحمل: مريضات السكري قبل الحمل يجب فحص قاع العين لهن، ومتابعتهن في الثلث الأول وطوال الحمل وحتى عام بعد الولادة، لأن الحمل قد يسرع تدهور الشبكية.',
        'العلاج: حقن العين المضادة لعامل نمو الأوعية (anti-VEGF) فعالة جداً كخط أول لارتشاح البقعة الصفراء. العلاج بالليزر لا يزال أساسياً للمراحل المتقدمة.'
      ]
    }
  },
  {
    id: 'ada-2026-ch12-neuropathy',
    group: '12. Retinopathy, Neuropathy, and Foot Care',
    sourceIds: ['12-retinopathy-neuropathy-and-foot-care-pdf', 'microvascular'],
    tags: ['Neuropathy', 'DPN', 'Autonomic', 'Foot Care'],
    title: {
      en: 'Neuropathy and Comprehensive Foot Care',
      ar: 'الاعتلال العصبي والرعاية الشاملة للقدم'
    },
    summary: {
      en: 'Diabetic Peripheral Neuropathy (DPN) and Diabetic Autonomic Neuropathy (DAN) lead to profound morbidity, including foot ulcers, amputations, and cardiovascular instability. Daily foot inspection by the patient and annual clinical evaluation are imperative.',
      ar: 'الاعتلال العصبي المحيطي والذاتي يؤديان لمضاعفات كبرى كقرح القدم والبتر. الفحص اليومي للقدم من المريض والتقييم السريري السنوي ضروريان.'
    },
    points: {
      en: [
        'DPN Screening: Assess at diagnosis of T2D and 5 years after T1D. Use 10-g monofilament testing plus at least one other test (pinprick, temperature, or vibration using 128-Hz tuning fork) to detect loss of protective sensation (LOPS).',
        'Treatment of Neuropathic Pain: Initial pharmacologic treatments for DPN pain include Pregabalin, Duloxetine, or Gabapentin. Note that these do not reverse the underlying nerve damage.',
        'Autonomic Neuropathy: Assess for signs of DAN, including orthostatic hypotension, resting tachycardia, gastroparesis (delayed gastric emptying), constipation, diarrhea, and erectile dysfunction.',
        'Foot Evaluation: Perform a comprehensive foot evaluation at least annually. High-risk patients (history of ulcer, amputation, LOPS, PAD) require exams at every visit.',
        'Peripheral Arterial Disease (PAD): Assess pedal pulses. Consider Ankle-Brachial Index (ABI) testing in patients >50 years or with claudication symptoms. Refer to vascular surgery if PAD is severe.'
      ],
      ar: [
        'فحص DPN: افحص باستخدام خيط 10 جرام الأحادي (Monofilament) مع فحص آخر مثل الشوكة الرنانة (128-Hz) للكشف عن فقدان الإحساس الواقي.',
        'علاج آلام الأعصاب: تشمل الأدوية بريجابالين، دولوكستين، أو جابابنتين. هذه الأدوية تخفف الألم لكنها لا تعالج التلف العصبي.',
        'الاعتلال الذاتي: ابحث عن الهبوط الوضعي، تسارع النبض وقت الراحة، خزل المعدة (Gastroparesis)، والضعف الجنسي.',
        'تقييم القدم: فحص شامل للقدم سنوياً. المرضى المعرضون للخطر (فقدان الإحساس، قرحة سابقة) يجب فحص أقدامهم في كل زيارة طبية.',
        'أمراض الشرايين الطرفية (PAD): جس النبض في القدم. استخدم فحص ABI لمن فوق 50 عاماً أو يعانون من ألم الساق عند المشي (العرج).'
      ]
    }
  }
];`
};

for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(dataDir, filename), content);
}
console.log('Done chapters 9-12');
