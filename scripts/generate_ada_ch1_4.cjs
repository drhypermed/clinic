const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'components', 'guidelines', 'data', 'ada2026');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const files = {
  'ch1-improving.ts': `import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_1_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch1-sdoh',
    group: '1. Improving Care and Promoting Health in Populations',
    sourceIds: ['1-improving-care-and-promoting-health-in-populations-pdf', 'improving care'],
    tags: ['SDOH', 'Health Equity', 'Population Health'],
    title: {
      en: 'Social Determinants of Health (SDOH) and Health Equity',
      ar: 'المحددات الاجتماعية للصحة (SDOH) والعدالة الصحية'
    },
    summary: {
      en: 'Addressing social determinants of health is paramount for effective diabetes management. Healthcare systems must systematically assess SDOH to identify barriers to care, reduce health disparities, and tailor treatment plans to the patient\\'s social and economic context.',
      ar: 'تُعد معالجة المحددات الاجتماعية للصحة أمراً بالغ الأهمية للإدارة الفعالة لمرض السكري. يجب على أنظمة الرعاية الصحية تقييم SDOH بشكل منهجي لتحديد العوائق التي تعترض الرعاية، وتقليل الفوارق الصحية، وتكييف خطط العلاج مع السياق الاجتماعي والاقتصادي للمريض.'
    },
    points: {
      en: [
        'Routine screening for SDOH: Assess food insecurity, housing instability, financial barriers, and lack of social support at the initial visit and ongoing.',
        'Food Insecurity: Patients with food insecurity are at a higher risk of both hyperglycemia and severe hypoglycemia. Avoid prescribing medications that cause hypoglycemia (e.g., sulfonylureas, insulin without education) without ensuring consistent food access.',
        'Housing Instability: Increases the risk of acute complications (e.g., DKA) and hospital readmissions. Connect patients to community resources.',
        'Language and Literacy: Use culturally and linguistically appropriate educational materials. Employ professional medical interpreters rather than relying on family members.',
        'Digital Divide: Ensure telehealth options and diabetes technologies (CGM, pumps) are accessible to marginalized populations, providing training and technical support.'
      ],
      ar: [
        'الفحص الروتيني لـ SDOH: تقييم انعدام الأمن الغذائي، عدم استقرار السكن، العوائق المالية، ونقص الدعم الاجتماعي في الزيارة الأولى وبشكل مستمر.',
        'انعدام الأمن الغذائي: المرضى الذين يعانون منه معرضون بشكل أكبر لخطر ارتفاع السكر وكذلك الهبوط الشديد. تجنب وصف الأدوية المسببة للهبوط (مثل السلفونيليوريا) دون ضمان استمرار الحصول على الطعام.',
        'عدم استقرار السكن: يزيد من خطر المضاعفات الحادة (مثل الحماض الكيتوني DKA) وإعادة التنويم. يجب ربط المرضى بموارد المجتمع.',
        'اللغة ومحو الأمية: استخدم مواد تعليمية مناسبة ثقافياً ولغوياً. استخدم مترجمين طبيين محترفين بدلاً من الاعتماد على أفراد الأسرة.',
        'الفجوة الرقمية: ضمان إتاحة خيارات التطبيب عن بعد وتكنولوجيا السكري (CGM، المضخات) للفئات المهمشة، مع توفير التدريب والدعم.'
      ]
    }
  },
  {
    id: 'ada-2026-ch1-system',
    group: '1. Improving Care and Promoting Health in Populations',
    sourceIds: ['1-improving-care-and-promoting-health-in-populations-pdf', 'improving care'],
    tags: ['Care Delivery', 'Multidisciplinary', 'Registries'],
    title: {
      en: 'Care Delivery Systems and Quality Improvement',
      ar: 'أنظمة تقديم الرعاية وتحسين الجودة'
    },
    summary: {
      en: 'Optimal diabetes care requires a multidisciplinary team approach, proactive population health management, and continuous quality improvement strategies, moving away from reactive, acute-care models.',
      ar: 'تتطلب الرعاية المثلى للسكري نهجاً يشمل فريقاً متعدد التخصصات، وإدارة استباقية لصحة المجتمع، واستراتيجيات التحسين المستمر للجودة، والابتعاد عن نماذج الرعاية التفاعلية لحالات الطوارئ.'
    },
    points: {
      en: [
        'Care Teams: Care should be provided by a multidisciplinary team including physicians, nurse practitioners, physician assistants, nurses, dietitians, pharmacists, and mental health professionals.',
        'Chronic Care Model (CCM): Implement the CCM to transform daily care, focusing on proactive, patient-centered, and evidence-based interventions.',
        'Registries and Data: Utilize patient registries and electronic health records (EHR) to track clinical parameters (e.g., A1C, BP, lipids, screening for complications) and identify patients needing intensification of therapy.',
        'Treatment Inertia: System-level strategies must be employed to overcome therapeutic inertia (failure to intensify therapy when targets are not met). Use clinical decision support systems embedded in the EHR.',
        'Community Health Workers: Integrate Community Health Workers (CHWs) into care teams to provide peer support, navigate health systems, and bridge cultural gaps.'
      ],
      ar: [
        'فرق الرعاية: يجب تقديم الرعاية بواسطة فريق يضم الأطباء، الممرضين الممارسين، أخصائيي التغذية، الصيادلة، والمتخصصين في الصحة النفسية.',
        'نموذج الرعاية المزمنة (CCM): تطبيق نموذج CCM لتحويل الرعاية اليومية، مع التركيز على التدخلات الاستباقية والمبنية على الأدلة والمتمحورة حول المريض.',
        'السجلات والبيانات: استخدام سجلات المرضى والسجلات الصحية الإلكترونية (EHR) لتتبع المؤشرات السريرية (التراكمي، ضغط الدم، الدهون) وتحديد المرضى الذين يحتاجون لتكثيف العلاج.',
        'القصور العلاجي (Treatment Inertia): يجب استخدام استراتيجيات على مستوى النظام للتغلب على القصور في تكثيف العلاج عندما لا تتحقق الأهداف. استخدم أنظمة دعم القرار السريري.',
        'عاملون في صحة المجتمع: دمج العاملين في صحة المجتمع (CHWs) في فرق الرعاية لتقديم الدعم، وتوجيه المرضى في النظام الصحي، وسد الفجوات الثقافية.'
      ]
    }
  }
];`,

  'ch2-diagnosis.ts': `import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_2_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch2-criteria',
    group: '2. Diagnosis and Classification of Diabetes',
    sourceIds: ['2-diagnosis-and-classification-of-diabetes-pdf', 'diagnosis'],
    tags: ['A1C', 'FPG', 'OGTT', 'Diagnostic Criteria'],
    title: {
      en: 'Diagnostic Criteria for Diabetes and Prediabetes',
      ar: 'معايير تشخيص مرض السكري ومرحلة ما قبل السكري'
    },
    summary: {
      en: 'Diabetes may be diagnosed based on A1C criteria or plasma glucose criteria, either the fasting plasma glucose (FPG) or the 2-hour plasma glucose (2-h PG) value during a 75-g oral glucose tolerance test (OGTT).',
      ar: 'يمكن تشخيص السكري بناءً على معايير فحص السكر التراكمي A1C أو معايير الجلوكوز في البلازما (السكر الصائم FPG أو السكر بعد ساعتين من اختبار تحمل الجلوكوز الفموي OGTT).'
    },
    points: {
      en: [
        'Diabetes Diagnosis: A1C ≥6.5% OR Fasting Plasma Glucose (FPG) ≥126 mg/dL (7.0 mmol/L) OR 2-hour PG ≥200 mg/dL (11.1 mmol/L) during OGTT OR random plasma glucose ≥200 mg/dL in a patient with classic symptoms of hyperglycemia.',
        'Confirmation: In the absence of unequivocal hyperglycemia, diagnosis requires two abnormal test results from the same sample or in two separate test samples.',
        'Prediabetes Diagnosis: A1C 5.7–6.4% OR Impaired Fasting Glucose (IFG) 100–125 mg/dL (5.6–6.9 mmol/L) OR Impaired Glucose Tolerance (IGT) 140–199 mg/dL (7.8–11.0 mmol/L) during OGTT.',
        'A1C limitations: Conditions that affect red blood cell turnover (e.g., sickle cell disease, pregnancy, hemodialysis, blood loss/transfusion) invalidate the A1C test; use plasma glucose criteria instead.',
        'POC A1C: Point-of-care (POC) A1C assays should generally NOT be used for diagnosis unless they are FDA-approved specifically for diagnosis and performed in a CLIA-certified setting.'
      ],
      ar: [
        'تشخيص السكري: التراكمي ≥6.5% أو السكر الصائم ≥126 مجم/ديسيلتر أو السكر بعد ساعتين من شرب المحلول (OGTT) ≥200 مجم/ديسيلتر، أو السكر العشوائي ≥200 مجم/ديسيلتر مع وجود أعراض كلاسيكية.',
        'التأكيد: في غياب ارتفاع السكر الواضح جداً، يتطلب التشخيص نتيجتين غير طبيعيتين من نفس العينة أو من عينتين منفصلتين.',
        'تشخيص ما قبل السكري: التراكمي 5.7–6.4% أو السكر الصائم 100–125 مجم/ديسيلتر أو السكر بعد ساعتين (OGTT) بين 140–199 مجم/ديسيلتر.',
        'قيود فحص التراكمي A1C: الحالات التي تؤثر على دورة حياة خلايا الدم الحمراء (مثل فقر الدم المنجلي، الحمل، غسيل الكلى، نقل الدم) تجعل فحص التراكمي غير دقيق؛ استخدم فحوصات جلوكوز البلازما بدلاً من ذلك.',
        'أجهزة A1C السريعة (POC): لا ينبغي استخدامها للتشخيص إلا إذا كانت معتمدة خصيصاً لهذا الغرض وتستخدم في مختبرات معتمدة.'
      ]
    }
  },
  {
    id: 'ada-2026-ch2-screening',
    group: '2. Diagnosis and Classification of Diabetes',
    sourceIds: ['2-diagnosis-and-classification-of-diabetes-pdf', 'diagnosis'],
    tags: ['Screening', 'Type 1', 'Type 2', 'Risk Factors'],
    title: {
      en: 'Screening Protocols for Type 1 and Type 2 Diabetes',
      ar: 'بروتوكولات الفحص للكشف عن السكري من النوع الأول والثاني'
    },
    summary: {
      en: 'Early detection of prediabetes, type 2 diabetes, and stage 1/stage 2 type 1 diabetes is critical. Screening guidelines have broadened to capture younger populations due to the rising prevalence of obesity and diabetes.',
      ar: 'يعد الاكتشاف المبكر لمرحلة ما قبل السكري والنوع الثاني والنوع الأول (في مراحله المبكرة) أمراً بالغ الأهمية. تم توسيع إرشادات الفحص لتشمل الفئات العمرية الأصغر.'
    },
    points: {
      en: [
        'Type 2 Screening (Adults): Universal screening for prediabetes and type 2 diabetes should begin at age 35 for all adults.',
        'High-Risk Adults: Screen adults of any age with overweight or obesity (BMI ≥25 kg/m2 or ≥23 kg/m2 in Asian Americans) who have one or more risk factors (e.g., first-degree relative with diabetes, high-risk race/ethnicity, history of CVD, hypertension, HDL <35 mg/dL or triglycerides >250 mg/dL, PCOS, physical inactivity).',
        'Testing Frequency: If results are normal, repeat testing at a minimum of 3-year intervals.',
        'Type 2 Screening (Children/Adolescents): Consider testing youth with overweight/obesity (BMI >85th percentile) and one or more risk factors (maternal history of diabetes/GDM during child\\'s gestation, family history of T2D, high-risk race/ethnicity, signs of insulin resistance).',
        'Type 1 Screening: Screening for presymptomatic Type 1 diabetes by detecting autoantibodies is recommended for first-degree relatives of a proband with T1D, and can be considered in the general population via clinical trial settings to identify candidates for preventative therapy (e.g., Teplizumab).'
      ],
      ar: [
        'فحص النوع الثاني (البالغين): يجب أن يبدأ الفحص الشامل للجميع عند سن 35 عاماً.',
        'البالغين الأكثر عرضة: فحص أي شخص بالغ يعاني من زيادة الوزن (مؤشر كتلة الجسم ≥25) ولديه عامل خطر واحد أو أكثر (تاريخ عائلي للسكري، تاريخ لأمراض القلب، ارتفاع ضغط الدم، تكيس المبايض، قلة النشاط البدني).',
        'تكرار الفحص: إذا كانت النتائج طبيعية، كرر الاختبار على فترات لا تزيد عن 3 سنوات.',
        'فحص النوع الثاني (الأطفال): فحص الشباب الذين يعانون من زيادة الوزن (المؤشر > النسبة المئوية 85) مع عامل خطر آخر (تاريخ سكري الحمل للأم، تاريخ عائلي، علامات مقاومة الأنسولين كالشواك الأسود).',
        'فحص النوع الأول: يوصى بالفحص عن طريق الكشف عن الأجسام المضادة (Autoantibodies) للأقارب من الدرجة الأولى للمصابين بالنوع الأول، ويمكن النظر فيه لتحديد المرشحين للعلاجات الوقائية (مثل دواء Teplizumab).'
      ]
    }
  }
];`,

  'ch3-prevention.ts': `import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_3_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch3-lifestyle',
    group: '3. Prevention or Delay of Type 2 Diabetes',
    sourceIds: ['3-prevention-or-delay-of-type-2-diabetes-pdf', 'prevention'],
    tags: ['Lifestyle', 'Weight Loss', 'DPP'],
    title: {
      en: 'Lifestyle Interventions for Diabetes Prevention',
      ar: 'التدخلات في نمط الحياة للوقاية من السكري'
    },
    summary: {
      en: 'Intensive lifestyle behavior change programs, modeled on the Diabetes Prevention Program (DPP), are highly effective at reducing the progression from prediabetes to type 2 diabetes by promoting sustained weight loss and increased physical activity.',
      ar: 'برامج تغيير نمط الحياة المكثفة، المصممة على غرار برنامج الوقاية من السكري (DPP)، فعالة للغاية في تقليل التطور من ما قبل السكري إلى النوع الثاني عبر تعزيز فقدان الوزن والنشاط البدني.'
    },
    points: {
      en: [
        'Referral: Refer adults with prediabetes to an intensive, multi-component behavioral lifestyle intervention program.',
        'Weight Loss Goal: Target a sustained weight loss of at least 7% of initial body weight for most individuals.',
        'Physical Activity: Increase moderate-intensity physical activity (e.g., brisk walking) to at least 150 minutes per week.',
        'Dietary Patterns: Provide individualized Medical Nutrition Therapy (MNT). Mediterranean, low-calorie, low-fat, or low-carbohydrate eating patterns can all be effective.',
        'Maintenance: Continued support and behavioral counseling are necessary to maintain weight loss and health gains long-term.'
      ],
      ar: [
        'الإحالة: يجب إحالة البالغين المصابين بمرحلة ما قبل السكري إلى برنامج مكثف لتغيير نمط الحياة.',
        'هدف فقدان الوزن: استهداف فقدان وزن مستدام بنسبة 7% على الأقل من وزن الجسم الأولي لمعظم الأفراد.',
        'النشاط البدني: زيادة النشاط البدني المعتدل (مثل المشي السريع) إلى 150 دقيقة على الأقل أسبوعياً.',
        'الأنماط الغذائية: تقديم علاج تغذية طبي مخصص. أنماط مثل حمية البحر المتوسط، منخفضة السعرات، أو منخفضة الكربوهيدرات جميعها فعالة.',
        'الاستمرارية: الدعم المستمر والإرشاد السلوكي ضروريان للحفاظ على فقدان الوزن والمكاسب الصحية على المدى الطويل.'
      ]
    }
  },
  {
    id: 'ada-2026-ch3-pharmacologic',
    group: '3. Prevention or Delay of Type 2 Diabetes',
    sourceIds: ['3-prevention-or-delay-of-type-2-diabetes-pdf', 'prevention'],
    tags: ['Metformin', 'Pharmacotherapy', 'Obesity'],
    title: {
      en: 'Pharmacologic Interventions for Prevention',
      ar: 'التدخلات الدوائية للوقاية من السكري'
    },
    summary: {
      en: 'While lifestyle modification is the cornerstone of prevention, pharmacotherapy (specifically Metformin, and increasingly weight-loss medications) plays a critical role for high-risk patients who are unable to achieve goals through lifestyle alone.',
      ar: 'رغم أن نمط الحياة هو حجر الأساس للوقاية، يلعب العلاج الدوائي (تحديداً الميتفورمين، وبشكل متزايد أدوية إنقاص الوزن) دوراً حاسماً للمرضى المعرضين لمخاطر عالية.'
    },
    points: {
      en: [
        'Metformin indication: Strongly consider Metformin therapy for prevention in adults with prediabetes, especially those aged 25–59 years with BMI ≥35 kg/m2, higher fasting plasma glucose (e.g., ≥110 mg/dL), higher A1C (≥6.0%), and in women with prior gestational diabetes (GDM).',
        'B12 Monitoring: Long-term use of Metformin is associated with Vitamin B12 deficiency; consider periodic measurement of B12 levels, especially in patients with anemia or neuropathy.',
        'Anti-Obesity Medications: Pharmacotherapy for weight management (e.g., GLP-1 RAs, GIP/GLP-1 RAs) can be considered as an adjunct to lifestyle modifications in high-risk individuals with prediabetes and obesity to prevent progression to T2D.',
        'CVD Risk: Routine screening and treatment of modifiable cardiovascular risk factors (hypertension, dyslipidemia, tobacco use) are essential in all patients with prediabetes.'
      ],
      ar: [
        'دواعي استخدام الميتفورمين: يوصى بشدة بالميتفورمين للوقاية للبالغين في مرحلة ما قبل السكري، خاصة من أعمارهم 25-59 مع مؤشر كتلة جسم ≥35، وقراءات عالية للسكر الصائم (≥110) أو التراكمي (≥6.0%)، وللنساء اللاتي عانين من سكري الحمل.',
        'مراقبة فيتامين B12: يرتبط الاستخدام طويل الأمد للميتفورمين بنقص B12؛ يجب قياس مستوياته دورياً، خاصة لمن يعانون من فقر الدم أو الاعتلال العصبي.',
        'أدوية السمنة: يمكن استخدام الأدوية المخصصة لإنقاص الوزن (مثل GLP-1) كعامل مساعد لتغيير نمط الحياة للأشخاص المعرضين لمخاطر عالية والذين يعانون من السمنة.',
        'مخاطر القلب: الفحص الروتيني وعلاج عوامل خطر القلب القابلة للتعديل (الضغط، الكوليسترول، التدخين) أمر ضروري في مرحلة ما قبل السكري.'
      ]
    }
  }
];`,

  'ch4-evaluation.ts': `import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_4_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch4-comprehensive',
    group: '4. Comprehensive Medical Evaluation',
    sourceIds: ['4-comprehensive-medical-evaluation-and-assessment-of-comorbidities-pdf', 'evaluation'],
    tags: ['Initial Visit', 'Follow-up', 'Physical Exam'],
    title: {
      en: 'Components of the Comprehensive Medical Evaluation',
      ar: 'مكونات التقييم الطبي الشامل'
    },
    summary: {
      en: 'A comprehensive medical evaluation is essential at the initial visit to confirm the diagnosis, classify the type of diabetes, evaluate for complications, formulate a management plan, and engage the patient in shared decision-making.',
      ar: 'التقييم الطبي الشامل ضروري في الزيارة الأولى لتأكيد التشخيص، وتقييم المضاعفات، وصياغة خطة علاجية، وإشراك المريض في اتخاذ القرار.'
    },
    points: {
      en: [
        'Medical History: Must detail diabetes characteristics (onset, symptoms, prior A1C), family history, personal history of complications, current medications, dietary patterns, and physical activity.',
        'Physical Examination: Must include height, weight, BMI, blood pressure (orthostatic if indicated), fundoscopic exam, thyroid palpation, skin exam (acanthosis nigricans, injection sites), and a comprehensive foot exam.',
        'Laboratory Evaluation: Initial labs include A1C, fasting lipid profile, liver function tests, spot UACR, serum creatinine/eGFR, and TSH (in T1D or if indicated).',
        'Follow-up Frequency: Follow-up visits should occur every 3-6 months based on whether treatment goals are met and treatment changes are being made.',
        'Referrals: Routine referrals include eye care professional (annual dilated exam), family planning (for women of reproductive age), registered dietitian (for MNT), DSMES, and dentist.'
      ],
      ar: [
        'التاريخ الطبي: يجب أن يفصل خصائص السكري (بدايته، الأعراض، التراكمي السابق)، التاريخ العائلي، الأدوية الحالية، والأنماط الغذائية.',
        'الفحص البدني: يجب أن يشمل الطول والوزن ومؤشر كتلة الجسم وضغط الدم، فحص قاع العين، فحص الغدة الدرقية، فحص الجلد (أماكن الحقن)، وفحص شامل للقدم.',
        'التقييم المخبري: الفحوصات الأولية تشمل التراكمي، مستوى الدهون الصائم، وظائف الكبد، تحليل زلال البول UACR، الكرياتينين/eGFR، و TSH (في النوع الأول).',
        'معدل المتابعة: يجب أن تتم زيارات المتابعة كل 3-6 أشهر بناءً على مدى تحقيق أهداف العلاج.',
        'الإحالات: تشمل الإحالات الروتينية طبيب العيون (فحص قاع العين السنوي)، التخطيط العائلي، أخصائي التغذية، والمثقف الصحي.'
      ]
    }
  },
  {
    id: 'ada-2026-ch4-comorbidities',
    group: '4. Comprehensive Medical Evaluation',
    sourceIds: ['4-comprehensive-medical-evaluation-and-assessment-of-comorbidities-pdf', 'evaluation'],
    tags: ['Comorbidities', 'Immunizations', 'Liver Disease', 'Sleep Apnea'],
    title: {
      en: 'Assessment of Comorbidities and Immunizations',
      ar: 'تقييم الأمراض المصاحبة والتطعيمات'
    },
    summary: {
      en: 'Patients with diabetes are at an increased risk for several autoimmune, oncologic, hepatic, and infectious complications. Proactive screening and vaccinations are fundamental to comprehensive care.',
      ar: 'المرضى المصابون بالسكري معرضون لخطر متزايد للإصابة بالعديد من مضاعفات المناعة الذاتية، الأورام، الكبد، والأمراض المعدية. الفحص الاستباقي والتطعيمات أساسية للرعاية.'
    },
    points: {
      en: [
        'Autoimmune Conditions: In patients with Type 1 diabetes, screen for autoimmune thyroid disease (TSH) and celiac disease (IgA tissue transglutaminase antibodies) soon after diagnosis.',
        'MASLD/NASH: Screen all adult patients with T2D or prediabetes for Metabolic dysfunction-Associated Steatotic Liver Disease (MASLD) using the Fibrosis-4 (FIB-4) index, even if liver enzymes are normal.',
        'Obstructive Sleep Apnea (OSA): Evaluate for symptoms of OSA (snoring, daytime sleepiness) and refer for a sleep study if indicated. OSA significantly worsens glycemic control.',
        'Cancer Screening: Diabetes is associated with increased risk of certain cancers (liver, pancreas, endometrium, colon, breast). Perform age- and sex-appropriate cancer screenings.',
        'Immunizations: Provide routine vaccinations including annual Influenza, updated COVID-19 vaccines, Pneumococcal vaccine (PPSV23 / PCV15 / PCV20 depending on age/history), Hepatitis B (for unvaccinated adults 19–59), and RSV (for adults ≥60 yrs).'
      ],
      ar: [
        'أمراض المناعة الذاتية: لمرضى النوع الأول، افحص أمراض الغدة الدرقية المناعية (TSH) والداء البطني (Celiac) قريباً بعد التشخيص.',
        'مرض الكبد الدهني (MASLD): يجب فحص جميع البالغين المصابين بالنوع الثاني أو ما قبل السكري للكشف عن أمراض الكبد باستخدام مؤشر FIB-4، حتى لو كانت إنزيمات الكبد طبيعية.',
        'انقطاع النفس الانسدادي النومي (OSA): تقييم الأعراض (الشخير، النعاس) وإحالتهم لدراسة النوم. يسبب OSA تدهوراً في التحكم بالسكر.',
        'فحص السرطان: يرتبط السكري بزيادة خطر الإصابة ببعض أنواع السرطانات (الكبد، البنكرياس، بطانة الرحم، القولون). قم بالفحوصات الروتينية حسب العمر.',
        'التطعيمات: توفير التطعيمات الروتينية بما في ذلك لقاح الإنفلونزا السنوي، لقاح المكورات الرئوية، التهاب الكبد B (للبالغين 19-59 عاماً غير المطعمين)، والفيروس المخلوي التنفسي RSV (لمن هم فوق 60 عاماً).'
      ]
    }
  }
];`
};

for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(dataDir, filename), content);
}
console.log('Done chapters 1-4');
