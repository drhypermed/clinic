const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'components', 'guidelines', 'data', 'ada2026');

const files = {
  'ch13-older.ts': `import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_13_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch13-assessment',
    group: '13. Older Adults',
    sourceIds: ['13-older-adults-pdf', 'older'],
    tags: ['Geriatrics', 'Cognition', 'Frailty'],
    title: {
      en: 'Geriatric Assessment and Cognitive Function',
      ar: 'التقييم لمرضى الشيخوخة والوظائف الإدراكية'
    },
    summary: {
      en: 'Older adults are highly heterogeneous. Comprehensive geriatric assessment is required to identify cognitive impairment, physical frailty, and polypharmacy, which dictate the individualization of glycemic targets and therapeutic choices.',
      ar: 'كبار السن فئة غير متجانسة إطلاقاً. التقييم الشامل للشيخوخة مطلوب لتحديد الضعف الإدراكي، والهشاشة الجسدية، وتعدد الأدوية، مما يحدد الأهداف العلاجية.'
    },
    points: {
      en: [
        'Cognitive Screening: Screen for cognitive impairment using tools like the Mini-Mental State Examination (MMSE) or Montreal Cognitive Assessment (MoCA), as cognitive decline directly impacts the ability to perform complex self-care tasks (e.g., insulin dosing).',
        'Frailty and Falls: Assess for physical frailty and risk of falls. Hypoglycemia is a major driver of falls and subsequent fractures in older adults.',
        'Deintensification: Simplification (deintensification) of complex regimens is recommended to reduce the risk of hypoglycemia and polypharmacy, provided it does not lead to symptomatic hyperglycemia.',
        'Avoid Overtreatment: Overtreatment of diabetes is common in older adults and should be avoided. Focus on preserving quality of life.'
      ],
      ar: [
        'الفحص الإدراكي: استخدم أدوات مثل (MoCA) للبحث عن تدهور الإدراك، لأنه يؤثر على قدرة المريض على الرعاية الذاتية (كحساب جرعات الأنسولين).',
        'الهشاشة والسقوط: قم بتقييم الهشاشة. هبوط السكر هو المحرك الرئيسي لسقوط كبار السن وتعرضهم للكسور.',
        'تبسيط العلاج (Deintensification): يوصى بتبسيط الأنظمة المعقدة لتقليل خطر الهبوط وتعدد الأدوية، طالما أن ذلك لا يؤدي إلى ارتفاع السكر المصحوب بأعراض.',
        'تجنب العلاج المفرط (Overtreatment): العلاج المفرط الشديد شائع ويجب تجنبه. التركيز الأساسي يجب أن يكون على جودة الحياة وليس الأرقام الصارمة.'
      ]
    }
  },
  {
    id: 'ada-2026-ch13-targets',
    group: '13. Older Adults',
    sourceIds: ['13-older-adults-pdf', 'older'],
    tags: ['A1C', 'Hypoglycemia', 'Polypharmacy'],
    title: {
      en: 'Targets and Pharmacologic Considerations',
      ar: 'الأهداف والاعتبارات الدوائية لكبار السن'
    },
    summary: {
      en: 'Glycemic targets in older adults rely heavily on health status. Healthy individuals may have targets similar to younger adults, while those with complex health issues require relaxed targets.',
      ar: 'تعتمد أهداف السكر لكبار السن بشدة على حالتهم الصحية. الأصحاء قد يتشابهون مع الشباب، لكن المعقدين صحياً يحتاجون لأهداف مخففة.'
    },
    points: {
      en: [
        'Healthy (Intact cognition/function): A1C target <7.0–7.5%. Fasting 90–130 mg/dL. Bedtime 90–150 mg/dL.',
        'Complex/Intermediate (Mild cognitive/functional impairment): A1C target <8.0%. Fasting 90–150 mg/dL. Bedtime 100–180 mg/dL.',
        'Very Complex/Poor Health (LTC, end-stage illness): A1C target avoids reliance on A1C; focus on avoiding symptomatic hyperglycemia and hypoglycemia. Fasting 100–180 mg/dL. Bedtime 110–200 mg/dL.',
        'Medication Selection: Metformin is the first-line agent if eGFR is adequate. SGLT2i and GLP-1 RAs should be used for cardiovascular/renal benefits, but GLP-1 RAs require caution in malnourished or frail patients due to weight loss and GI side effects.',
        'Drugs to Avoid: Glyburide and other long-acting sulfonylureas should be avoided due to the unacceptably high risk of severe, prolonged hypoglycemia.'
      ],
      ar: [
        'الأصحاء (إدراك/وظائف سليمة): هدف التراكمي <7.0-7.5%. الصائم 90-130.',
        'المرضى المعقدون (ضعف إدراكي/وظيفي خفيف): هدف التراكمي <8.0%. الصائم 90-150.',
        'حالة صحية سيئة جداً (رعاية المسنين/مرض نهاية العمر): التركيز على تجنب أعراض الارتفاع والهبوط وتجاهل رقم التراكمي. الصائم 100-180.',
        'اختيار الأدوية: الميتفورمين خط أول. يمكن استخدام SGLT2 و GLP-1 لفوائدهما، لكن احذر من استخدام GLP-1 مع المرضى الضعفاء أو الذين يعانون من سوء التغذية لأنه يسبب فقدان الوزن وضعف الشهية.',
        'أدوية يمنع استخدامها: يجب تجنب عقار (جليبوريد / داونيل) والسلفونيليوريا طويلة المفعول تماماً لكبار السن لتجنب الهبوط الشديد المستمر.'
      ]
    }
  }
];`,

  'ch14-children.ts': `import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_14_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch14-t1d',
    group: '14. Children and Adolescents',
    sourceIds: ['14-children-and-adolescents-pdf', 'youth'],
    tags: ['T1D', 'DKA', 'School'],
    title: {
      en: 'Type 1 Diabetes Management in Youth',
      ar: 'إدارة السكري من النوع الأول لدى الشباب'
    },
    summary: {
      en: 'Managing T1D in children involves addressing rapid growth, unpredictable eating, physical activity, and psychosocial vulnerabilities. A multidisciplinary team and family involvement are essential.',
      ar: 'إدارة النوع الأول لدى الأطفال تتضمن التعامل مع النمو السريع، والأكل غير المتوقع، والهشاشة النفسية. وجود فريق متعدد التخصصات وإشراك الأسرة أمر ضروري.'
    },
    points: {
      en: [
        'A1C Target: An A1C goal of <7.0% is appropriate for most children and adolescents, provided it can be achieved without severe hypoglycemia.',
        'Technology: Automated Insulin Delivery (AID) systems and Continuous Glucose Monitors (CGM) should be offered to ALL youth with T1D to improve glycemic control and reduce hypoglycemia.',
        'Diabetic Ketoacidosis (DKA): Provide extensive education on sick-day management, ketone testing (blood ketones preferred over urine), and when to call the diabetes team to prevent DKA.',
        'School Care: Diabetes management must be supported at school via an individualized Diabetes Medical Management Plan (DMMP).',
        'Autoimmune Screening: Screen youth with T1D for thyroid disease (TSH) and celiac disease (tissue transglutaminase IgA) soon after diagnosis.'
      ],
      ar: [
        'هدف التراكمي: <7.0% مناسب لمعظم الأطفال إذا تم تحقيقه دون هبوط شديد.',
        'التكنولوجيا: يجب توفير البنكرياس الصناعي (AID) وأجهزة المراقبة (CGM) لجميع الشباب والاطفال لتحسين السكر وتقليل الهبوط.',
        'الحماض الكيتوني (DKA): توفير تثقيف مكثف لإدارة "أيام المرض"، وفحص الكيتونات (في الدم أفضل من البول) لتجنب الغيبوبة الكيتونية.',
        'الرعاية المدرسية: يجب دعم الطفل في المدرسة من خلال "خطة الإدارة الطبية للسكري" مكتوبة ومخصصة.',
        'فحص المناعة الذاتية: افحص الشباب المصابين عن أمراض الغدة الدرقية ومرض حساسية القمح (Celiac) مباشرة بعد التشخيص.'
      ]
    }
  },
  {
    id: 'ada-2026-ch14-t2d',
    group: '14. Children and Adolescents',
    sourceIds: ['14-children-and-adolescents-pdf', 'youth'],
    tags: ['T2D', 'Metformin', 'Obesity', 'Youth'],
    title: {
      en: 'Type 2 Diabetes in Youth',
      ar: 'السكري من النوع الثاني لدى الشباب'
    },
    summary: {
      en: 'Type 2 diabetes in youth is a highly aggressive disease compared to adults, with a faster decline in beta-cell function and early onset of severe microvascular and macrovascular complications.',
      ar: 'النوع الثاني لدى الشباب مرض شرس جداً مقارنة بالبالغين، مع تدهور أسرع في خلايا بيتا وظهور مبكر للمضاعفات الكبرى والصغرى.'
    },
    points: {
      en: [
        'Pharmacotherapy Initiation: Metformin is the initial pharmacologic treatment of choice if renal function is normal and A1C is <8.5% and patient is asymptomatic.',
        'Insulin Initiation: If A1C is ≥8.5%, or if the patient is symptomatic (polyuria, polydipsia, weight loss), basal insulin should be initiated alongside Metformin.',
        'GLP-1 RAs: Approved GLP-1 RAs (e.g., Liraglutide, Exenatide extended-release, Semaglutide) should be considered for youth with T2D who do not meet glycemic targets with Metformin/insulin, or for weight management.',
        'Complications: Screen for nephropathy (UACR), hypertension, dyslipidemia, and retinopathy at diagnosis and annually thereafter. Liver disease (MASLD) should also be screened.'
      ],
      ar: [
        'بدء العلاج الدوائي: الميتفورمين هو الخيار الأول إذا كان التراكمي <8.5% والمريض لا يعاني من أعراض.',
        'بدء الأنسولين: إذا كان التراكمي ≥8.5%، أو كان المريض يعاني من أعراض (تبول متكرر، عطش، فقدان وزن)، يجب البدء بالأنسولين القاعدي مع الميتفورمين فوراً.',
        'منبهات GLP-1: يجب إضافتها (مثل سيماجلوتيد) للشباب الذين لم يصلوا لأهدافهم بالميتفورمين، ولمعالجة السمنة.',
        'المضاعفات: يجب فحص الكلى، الضغط، الكوليسترول، وشبكية العين فوراً عند التشخيص وسنوياً بعد ذلك لخطورة وسرعة تدهور المرض لدى هذه الفئة.'
      ]
    }
  }
];`,

  'ch15-pregnancy.ts': `import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_15_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch15-gdm',
    group: '15. Management of Diabetes in Pregnancy',
    sourceIds: ['15-management-of-diabetes-in-pregnancy-pdf', 'pregnancy'],
    tags: ['GDM', 'Pregnancy', 'Insulin', 'Targets'],
    title: {
      en: 'Gestational Diabetes Mellitus (GDM) and Targets',
      ar: 'سكري الحمل (GDM) وأهداف السيطرة'
    },
    summary: {
      en: 'Gestational diabetes carries risks for both mother and fetus, including preeclampsia, macrosomia, and neonatal hypoglycemia. Strict glycemic targets are essential, and insulin is the first-line medication.',
      ar: 'يحمل سكري الحمل مخاطر للأم والجنين كالتسمم، عملقة الجنين، وهبوط سكر حديثي الولادة. الأهداف الصارمة ضرورية والأنسولين هو الخط العلاجي الأول.'
    },
    points: {
      en: [
        'Glycemic Targets in Pregnancy: Fasting <95 mg/dL. One-hour postprandial <140 mg/dL. Two-hour postprandial <120 mg/dL.',
        'First-Line Medication: Insulin is the preferred medication for treating hyperglycemia in GDM as it does not cross the placenta to a measurable extent.',
        'Oral Agents: Metformin and Glyburide should NOT be used as first-line agents, as both cross the placenta. Metformin may be used for women with PCOS seeking pregnancy, but discontinued by the end of the first trimester.',
        'A1C in Pregnancy: The A1C target in pregnancy is <6.0% if it can be achieved without significant hypoglycemia. A1C is slightly lower in normal pregnancy due to increased red blood cell turnover.'
      ],
      ar: [
        'أهداف السكر في الحمل: الصائم <95 مجم/ديسيلتر. بعد الأكل بساعة <140. بعد الأكل بساعتين <120.',
        'الدواء الأول: الأنسولين هو الدواء المفضل لسكري الحمل، لأنه لا يعبر المشيمة للجنين.',
        'الأدوية الفموية: يمنع استخدام الميتفورمين وجليبوريد كخط أول لأنهما يعبران المشيمة. (قد يُستخدم الميتفورمين لمرضى تكيس المبايض ويوقف بنهاية الثلث الأول).',
        'التراكمي في الحمل: الهدف هو <6.0% (لأن التراكمي ينخفض طبيعياً في الحمل بسبب دورة خلايا الدم السريعة).'
      ]
    }
  },
  {
    id: 'ada-2026-ch15-preconception',
    group: '15. Management of Diabetes in Pregnancy',
    sourceIds: ['15-management-of-diabetes-in-pregnancy-pdf', 'pregnancy'],
    tags: ['Preexisting', 'Teratogenic', 'Postpartum'],
    title: {
      en: 'Preexisting Diabetes and Postpartum Care',
      ar: 'السكري الموجود قبل الحمل والرعاية بعد الولادة'
    },
    summary: {
      en: 'Women with preexisting type 1 or type 2 diabetes must achieve excellent glycemic control prior to conception to minimize the risk of congenital anomalies. Postpartum care is crucial for long-term health.',
      ar: 'يجب على مريضات النوع الأول أو الثاني تحقيق تحكم ممتاز قبل الحمل لتقليل خطر التشوهات الخلقية. الرعاية بعد الولادة حاسمة للصحة طويلة الأمد.'
    },
    points: {
      en: [
        'Preconception A1C: Counsel women with preexisting diabetes to achieve an A1C <6.5% before conception.',
        'Medication Review: Discontinue potentially teratogenic medications before conception, including ACE inhibitors, ARBs, and statins.',
        'Postpartum Insulin Needs: Insulin requirements drop dramatically and immediately postpartum. Doses should be reduced by 50% or more to prevent severe hypoglycemia.',
        'Postpartum GDM Follow-up: Screen women with recent GDM for prediabetes or T2D at 4–12 weeks postpartum using a 75-g OGTT. Lifelong screening every 1–3 years thereafter is required.'
      ],
      ar: [
        'التراكمي قبل الحمل: تقديم المشورة للمريضات لتحقيق تراكمي <6.5% قبل التفكير بالحمل.',
        'مراجعة الأدوية: أوقف الأدوية المشوهة للأجنة قبل الحمل (مثل أدوية الضغط ACEi/ARB وأدوية الكوليسترول Statins).',
        'الأنسولين بعد الولادة: تنخفض الحاجة للأنسولين بشكل هائل ومفاجئ بعد الولادة مباشرة. يجب خفض الجرعات بنسبة 50% أو أكثر لتجنب الهبوط الشديد.',
        'متابعة سكري الحمل: افحص النساء اللاتي أصبن بسكري الحمل في غضون 4-12 أسبوعاً بعد الولادة باستخدام (OGTT). ويجب استمرار الفحص مدى الحياة كل 1-3 سنوات لأنهن عرضة جداً للنوع الثاني.'
      ]
    }
  }
];`,

  'ch16-hospital.ts': `import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_16_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch16-targets',
    group: '16. Diabetes Care in the Hospital',
    sourceIds: ['16-diabetes-care-in-the-hospital-pdf', 'hospital'],
    tags: ['Inpatient', 'Hyperglycemia', 'Critical Care'],
    title: {
      en: 'Inpatient Glycemic Targets and Protocols',
      ar: 'أهداف وبروتوكولات سكر الدم للمرضى المنومين'
    },
    summary: {
      en: 'Hyperglycemia in hospitalized patients—with or without a prior diagnosis of diabetes—is associated with adverse outcomes including increased mortality and infection rates.',
      ar: 'يرتبط ارتفاع السكر للمرضى المنومين (سواء كانوا مصابين بالسكري مسبقاً أم لا) بنتائج ضارة منها زيادة الوفيات والالتهابات.'
    },
    points: {
      en: [
        'Initiation Threshold: Insulin therapy should be initiated for treatment of persistent hyperglycemia starting at a threshold ≥180 mg/dL (10.0 mmol/L).',
        'Target Range: Once insulin is started, a target glucose range of 140–180 mg/dL is recommended for the majority of critically ill and noncritically ill patients.',
        'More Stringent Targets: Targets of 110–140 mg/dL may be appropriate for selected patients (e.g., cardiac surgery) if achievable without significant hypoglycemia.',
        'Continuous Insulin Infusion: Intravenous insulin infusion with validated protocols is the preferred method for managing critically ill patients (ICU).'
      ],
      ar: [
        'عتبة بدء العلاج: يجب البدء في العلاج بالأنسولين لعلاج الارتفاع المستمر للسكر عند عتبة ≥180 مجم/ديسيلتر.',
        'النطاق المستهدف: بمجرد بدء الأنسولين، فإن الهدف هو 140-180 مجم/ديسيلتر لمعظم الحالات في العناية المركزة أو الأقسام العادية.',
        'أهداف أكثر صرامة: أهداف 110-140 قد تناسب مرضى محددين (مثل جراحات القلب) إذا أمكن تحقيقها بأمان.',
        'التسريب المستمر: الأنسولين الوريدي المستمر (عبر مضخات) هو الطريقة المفضلة للمرضى في العناية المركزة (ICU).'
      ]
    }
  },
  {
    id: 'ada-2026-ch16-management',
    group: '16. Diabetes Care in the Hospital',
    sourceIds: ['16-diabetes-care-in-the-hospital-pdf', 'hospital'],
    tags: ['Basal-Bolus', 'Non-insulin', 'Discharge'],
    title: {
      en: 'Non-Critically Ill Management and Discharge',
      ar: 'إدارة الحالات غير الحرجة وخطة الخروج'
    },
    summary: {
      en: 'For non-critically ill patients, a scheduled basal-bolus insulin regimen is highly preferred over the reactive sliding-scale method, which is strongly discouraged.',
      ar: 'للحالات غير الحرجة، يفضل جداً نظام الأنسولين المجدول (قاعدي-طعامي) بدلاً من مقياس الانزلاق التفاعلي (Sliding scale) الذي لا ينصح به أبداً.'
    },
    points: {
      en: [
        'Basal-Bolus Regimen: A basal-bolus (plus correction) insulin regimen is the preferred treatment for non-critically ill patients with poor oral intake or taking nothing by mouth (NPO).',
        'Sliding Scale: Sole use of sliding scale insulin (correction insulin only) in the inpatient hospital setting is strongly discouraged as it results in wide glucose fluctuations.',
        'Non-Insulin Agents: Use of non-insulin glucose-lowering therapies (e.g., Metformin, SGLT2i) in the hospital setting is generally not recommended due to risks of AKI, euglycemic DKA, and lactic acidosis.',
        'Discharge Planning: A structured discharge plan tailored to the patient\\'s cognitive and financial status should be provided. Reconcile medications and schedule follow-up within 1 month.'
      ],
      ar: [
        'نظام قاعدي-طعامي (Basal-Bolus): هو العلاج المفضل لمرضى الأقسام العادية، خاصة لمن لا يأكلون جيداً أو الصائمين (NPO).',
        'مقياس الانزلاق (Sliding Scale): الاعتماد على الأنسولين التصحيحي فقط ممنوع بشدة لأنه يسبب تذبذباً حاداً في السكر صعوداً وهبوطاً.',
        'الأدوية غير الأنسولين: يمنع استخدام أقراص السكري (مثل الميتفورمين و SGLT2) داخل المستشفى لتجنب مخاطر القصور الكلوي والحماض الكيتوني.',
        'خطة الخروج: يجب توفير خطة واضحة ومخصصة لحالة المريض، مع مراجعة أدويته وتحديد موعد متابعة خلال شهر.'
      ]
    }
  }
];`
};

for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(dataDir, filename), content);
}
console.log('Done chapters 13-16');
