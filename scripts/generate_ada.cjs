const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'components', 'guidelines', 'data', 'ada2026');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const files = {
  'ch2-diagnosis.ts': `import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_2_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch2-screening',
    group: '2. Diagnosis and Classification of Diabetes',
    sourceIds: ['2-diagnosis-and-classification-of-diabetes-pdf', 'diagnosis and classification'],
    tags: ['Screening', 'HbA1c', 'FPG', 'OGTT'],
    title: {
      en: 'Screening and Diagnostic Criteria',
      ar: 'معايير الفحص والتشخيص'
    },
    summary: {
      en: 'Diabetes is diagnosed based on A1C criteria or plasma glucose criteria (FPG or 2-h PG during a 75-g OGTT). Screening should begin at age 35 for all people, or earlier for adults with overweight/obesity and one or more risk factors.',
      ar: 'يتم تشخيص السكري بناءً على الفحص التراكمي (A1C) أو معايير جلوكوز البلازما (الصائم أو بعد ساعتين من اختبار تحمل الجلوكوز). يجب أن يبدأ الفحص في سن 35 لجميع الأشخاص، أو قبل ذلك للبالغين الذين يعانون من زيادة الوزن/السمنة ولديهم عامل خطر واحد أو أكثر.'
    },
    points: {
      en: [
        'FPG ≥126 mg/dL (7.0 mmol/L) after at least 8 hours of fasting.',
        '2-h PG ≥200 mg/dL (11.1 mmol/L) during an OGTT.',
        'A1C ≥6.5% (48 mmol/mol) performed in a certified laboratory.',
        'In a patient with classic symptoms of hyperglycemia, a random plasma glucose ≥200 mg/dL (11.1 mmol/L).',
        'In the absence of unequivocal hyperglycemia, diagnosis requires two abnormal test results from the same sample or in two separate test samples.'
      ],
      ar: [
        'سكر الصائم (FPG) ≥ 126 مجم/ديسيلتر بعد صيام 8 ساعات على الأقل.',
        'سكر بعد ساعتين (2-h PG) ≥ 200 مجم/ديسيلتر خلال اختبار تحمل الجلوكوز (OGTT).',
        'السكر التراكمي (A1C) ≥ 6.5% مع إجراء الفحص في مختبر معتمد.',
        'في المريض الذي يعاني من أعراض كلاسيكية لارتفاع السكر، يكون قياس السكر العشوائي ≥ 200 مجم/ديسيلتر.',
        'في غياب ارتفاع السكر الواضح، يتطلب التشخيص نتيجتين غير طبيعيتين من نفس العينة أو في عينتين منفصلتين.'
      ]
    }
  },
  {
    id: 'ada-2026-ch2-prediabetes',
    group: '2. Diagnosis and Classification of Diabetes',
    sourceIds: ['2-diagnosis-and-classification-of-diabetes-pdf', 'diagnosis and classification'],
    tags: ['Prediabetes', 'Risk Assessment'],
    title: {
      en: 'Prediabetes Risk and Evaluation',
      ar: 'تقييم مخاطر مرحلة ما قبل السكري'
    },
    summary: {
      en: 'Prediabetes indicates an increased risk for diabetes and cardiovascular disease. Screening for prediabetes is critical to implement preventive lifestyle modifications and potential pharmacotherapy.',
      ar: 'تشير مرحلة ما قبل السكري إلى زيادة خطر الإصابة بالسكري وأمراض القلب والأوعية الدموية. الفحص لهذه المرحلة ضروري لتطبيق تعديلات وقائية في نمط الحياة وربما العلاج الدوائي.'
    },
    points: {
      en: [
        'Prediabetes is defined as FPG 100–125 mg/dL (5.6–6.9 mmol/L) or 2-h PG 140–199 mg/dL (7.8–11.0 mmol/L) or A1C 5.7–6.4% (39–47 mmol/mol).',
        'Test for prediabetes in adults of any age with overweight or obesity (BMI ≥25 kg/m², or ≥23 kg/m² in Asian Americans) with one or more risk factors.',
        'If tests are normal, repeat screening at a minimum of 3-year intervals.',
        'Women with a history of gestational diabetes should have lifelong screening at least every 3 years.'
      ],
      ar: [
        'تُعرّف مرحلة ما قبل السكري بـ سكر صائم 100-125 مجم/ديسيلتر، أو سكر بعد ساعتين 140-199 مجم/ديسيلتر، أو تراكمي 5.7-6.4%.',
        'افحص البالغين من أي عمر الذين يعانون من زيادة الوزن أو السمنة ولديهم عامل خطر أو أكثر.',
        'إذا كانت النتائج طبيعية، كرر الفحص بحد أدنى كل 3 سنوات.',
        'يجب فحص النساء اللاتي لديهن تاريخ من سكري الحمل مدى الحياة كل 3 سنوات على الأقل.'
      ]
    }
  },
  {
    id: 'ada-2026-ch2-t1d',
    group: '2. Diagnosis and Classification of Diabetes',
    sourceIds: ['2-diagnosis-and-classification-of-diabetes-pdf', 'diagnosis and classification'],
    tags: ['Type 1 Diabetes', 'Autoantibodies', 'Staging'],
    title: {
      en: 'Type 1 Diabetes Staging and Autoantibodies',
      ar: 'مراحل السكري من النوع الأول والأجسام المضادة'
    },
    summary: {
      en: 'Type 1 diabetes is characterized by autoimmune beta-cell destruction. Screening for islet autoantibodies identifies individuals at risk, allowing for staging and potential delay of clinical onset.',
      ar: 'يتميز السكري من النوع الأول بتدمير خلايا بيتا المناعي الذاتي. يحدد فحص الأجسام المضادة الأفراد المعرضين للخطر، مما يسمح بتحديد المراحل وتأخير البداية السريرية للمرض.'
    },
    points: {
      en: [
        'Stage 1: Multiple autoantibodies, normal blood glucose, no symptoms.',
        'Stage 2: Multiple autoantibodies, abnormal blood glucose (dysglycemia), no classic symptoms.',
        'Stage 3: Clinical diagnosis with typical symptoms and hyperglycemia.',
        'Screening for islet autoantibodies is recommended in the setting of a research trial or for first-degree family members of a proband with T1D.'
      ],
      ar: [
        'المرحلة 1: أجسام مضادة متعددة، سكر دم طبيعي، بدون أعراض.',
        'المرحلة 2: أجسام مضادة متعددة، سكر دم غير طبيعي (خلل في الجلوكوز)، بدون أعراض كلاسيكية.',
        'المرحلة 3: تشخيص سريري مع أعراض نموذجية وارتفاع السكر في الدم.',
        'يوصى بفحص الأجسام المضادة في إطار الأبحاث أو لأفراد الأسرة من الدرجة الأولى للمريض.'
      ]
    }
  }
];`,

  'ch3-prevention.ts': `import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_3_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch3-lifestyle',
    group: '3. Prevention or Delay of Type 2 Diabetes',
    sourceIds: ['3-prevention-or-delay-of-type-2-diabetes-and-associated-comorbidities-pdf', 'prevention or delay'],
    tags: ['Lifestyle', 'Weight Loss', 'Nutrition'],
    title: {
      en: 'Lifestyle Interventions for Prevention',
      ar: 'التدخلات في نمط الحياة للوقاية'
    },
    summary: {
      en: 'Intensive lifestyle behavior change programs are highly effective in preventing or delaying the onset of type 2 diabetes in high-risk individuals. The primary goals are clinically meaningful weight loss and increased physical activity.',
      ar: 'برامج تغيير نمط الحياة المكثفة فعالة للغاية في الوقاية من السكري النوع 2 أو تأخيره لدى الأفراد المعرضين لخطر كبير. الأهداف الأساسية هي فقدان الوزن وزيادة النشاط البدني.'
    },
    points: {
      en: [
        'Refer adults with overweight/obesity at high risk of T2D to an intensive lifestyle behavior change program.',
        'Aim to achieve and maintain a weight reduction of at least 7% of initial body weight.',
        'Increase moderate-intensity physical activity (e.g., brisk walking) to at least 150 minutes/week.',
        'A variety of eating patterns are acceptable; emphasize non-starchy vegetables, whole grains, and lean proteins.'
      ],
      ar: [
        'إحالة البالغين الذين يعانون من زيادة الوزن/السمنة والمعرضين لخطر كبير إلى برنامج مكثف لتغيير نمط الحياة.',
        'الهدف هو تحقيق والحفاظ على فقدان وزن لا يقل عن 7% من وزن الجسم الأولي.',
        'زيادة النشاط البدني المعتدل (مثل المشي السريع) إلى 150 دقيقة/أسبوع على الأقل.',
        'تتعدد أنماط الأكل المقبولة؛ مع التركيز على الخضار غير النشوية والحبوب الكاملة والبروتينات الخالية من الدهون.'
      ]
    }
  },
  {
    id: 'ada-2026-ch3-pharmacologic',
    group: '3. Prevention or Delay of Type 2 Diabetes',
    sourceIds: ['3-prevention-or-delay-of-type-2-diabetes-and-associated-comorbidities-pdf', 'prevention or delay'],
    tags: ['Metformin', 'GLP-1', 'Pharmacotherapy'],
    title: {
      en: 'Pharmacologic Interventions for Prevention',
      ar: 'التدخلات الدوائية للوقاية'
    },
    summary: {
      en: 'When lifestyle modifications are insufficient or in very high-risk individuals, pharmacotherapy can be considered to delay the onset of type 2 diabetes. Metformin is the most extensively studied agent.',
      ar: 'عندما تكون التعديلات في نمط الحياة غير كافية أو لدى الأفراد المعرضين لخطر عالٍ جدًا، يمكن التفكير في العلاج الدوائي لتأخير السكري. الميتفورمين هو الدواء الأكثر دراسة.'
    },
    points: {
      en: [
        'Metformin therapy for prevention of T2D should be considered in adults with prediabetes, especially those aged 25–59 years with BMI ≥35 kg/m², higher fasting plasma glucose (≥110 mg/dL), higher A1C (≥6.0%), or prior gestational diabetes.',
        'Long-term use of metformin may be associated with biochemical vitamin B12 deficiency; consider periodic measurement of vitamin B12 levels.',
        'Other medications, such as GLP-1 receptor agonists and pioglitazone, have shown efficacy in delaying T2D but are less commonly recommended solely for prevention due to cost and side effects.'
      ],
      ar: [
        'يجب التفكير في علاج الميتفورمين للبالغين في مرحلة ما قبل السكري، خاصة من أعمار 25-59 بمؤشر كتلة جسم ≥35، أو سكر صائم ≥110 مجم/ديسيلتر، أو تراكمي ≥6.0%، أو تاريخ سكري حمل.',
        'قد يرتبط الاستخدام طويل الأمد للميتفورمين بنقص فيتامين ب12؛ يجب النظر في قياس مستوياته بشكل دوري.',
        'أظهرت أدوية أخرى مثل GLP-1 فعالية في تأخير المرض ولكن لا ينصح بها عادة للوقاية فقط بسبب التكلفة والآثار الجانبية.'
      ]
    }
  }
];`,

  'ch8-obesity.ts': `import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_8_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch8-assessment',
    group: '8. Obesity and Weight Management',
    sourceIds: ['8-obesity-and-weight-management-for-the-prevention-and-treatment-of-type-2-diabetes-pdf', 'obesity and weight management'],
    tags: ['Obesity', 'BMI', 'Weight Management'],
    title: {
      en: 'Assessment of Obesity and Treatment Goals',
      ar: 'تقييم السمنة وأهداف العلاج'
    },
    summary: {
      en: 'Obesity management is a primary pillar in the treatment of type 2 diabetes. Significant weight loss can improve glycemic control, cardiovascular risk, and even lead to diabetes remission.',
      ar: 'إدارة السمنة هي ركيزة أساسية في علاج السكري من النوع الثاني. فقدان الوزن بشكل كبير يمكن أن يحسن التحكم في نسبة السكر، ويقلل مخاطر القلب، بل وقد يؤدي إلى تراجع المرض.'
    },
    points: {
      en: [
        'Use patient-centered, nonjudgmental language. Measure height and weight and calculate BMI at annual visits or more frequently.',
        'Diet, physical activity, and behavioral therapy to achieve and maintain ≥5% weight loss is recommended for most people with T2D and overweight or obesity.',
        'Weight loss of 10-15% or more has a disease-modifying effect and can lead to remission of type 2 diabetes and improve cardiovascular outcomes.',
        'Assess readiness to engage in weight management and identify potential barriers (e.g., SDOH, psychological factors).'
      ],
      ar: [
        'استخدم لغة تركز على المريض وتجنب الأحكام. قم بقياس الطول والوزن وحساب مؤشر كتلة الجسم في الزيارات السنوية.',
        'يوصى بالنظام الغذائي والنشاط البدني والعلاج السلوكي لتحقيق والحفاظ على فقدان وزن ≥5% لمعظم المصابين.',
        'فقدان الوزن بنسبة 10-15% أو أكثر له تأثير معدل للمرض ويمكن أن يؤدي إلى تراجع (remission) السكري من النوع الثاني.',
        'تقييم الاستعداد للمشاركة في إدارة الوزن وتحديد العوائق المحتملة.'
      ]
    }
  },
  {
    id: 'ada-2026-ch8-pharmacotherapy',
    group: '8. Obesity and Weight Management',
    sourceIds: ['8-obesity-and-weight-management-for-the-prevention-and-treatment-of-type-2-diabetes-pdf', 'obesity and weight management'],
    tags: ['Pharmacotherapy', 'GLP-1', 'GIP', 'Tirzepatide', 'Semaglutide'],
    title: {
      en: 'Pharmacotherapy for Weight Management',
      ar: 'العلاج الدوائي لإدارة الوزن'
    },
    summary: {
      en: 'Weight-loss medications are highly effective adjuncts to lifestyle changes for patients with T2D and obesity. Incretin-based therapies (GLP-1 RAs, dual GIP/GLP-1 RAs) offer the most profound weight reduction and glycemic benefits.',
      ar: 'أدوية فقدان الوزن تعتبر إضافات فعالة لتغييرات نمط الحياة. العلاجات المعتمدة على الإنكريتين (GLP-1 و GIP/GLP-1) تقدم أكبر قدر من إنقاص الوزن وفوائد للتحكم بالسكر.'
    },
    points: {
      en: [
        'When choosing glucose-lowering medications for patients with overweight/obesity, prioritize agents with high efficacy for weight loss (e.g., semaglutide, tirzepatide).',
        'Pharmacotherapy for weight loss is indicated as an adjunct to diet and exercise for people with BMI ≥27 kg/m² and obesity-related comorbidities.',
        'Tirzepatide and Semaglutide are considered highly effective for weight loss. Dulaglutide and Liraglutide are considered intermediately effective.',
        'If a patient response to a weight-loss medication is insufficient (<5% weight loss after 3 months of therapeutic dose), discontinue and evaluate alternative options.'
      ],
      ar: [
        'عند اختيار أدوية السكري للمرضى الذين يعانون من زيادة الوزن/السمنة، أعطِ الأولوية للأدوية ذات الفعالية العالية لإنقاص الوزن (مثل سيماجلوتيد وتيرزيباتيد).',
        'يُشار إلى العلاج الدوائي كعامل مساعد للنظام الغذائي والتمارين للأشخاص الذين يبلغ مؤشر كتلة الجسم لديهم ≥27 مجم/م2 مع أمراض مصاحبة.',
        'يُعتبر تيرزيباتيد وسيماجلوتيد ذات فعالية عالية جداً لفقدان الوزن. في حين يعتبر دولاجلوتيد وليراجلوتيد ذوي فعالية متوسطة.',
        'إذا كانت استجابة المريض لدواء فقدان الوزن غير كافية (<5% بعد 3 أشهر من الجرعة العلاجية)، قم بإيقافه وتقييم خيارات بديلة.'
      ]
    }
  },
  {
    id: 'ada-2026-ch8-surgery',
    group: '8. Obesity and Weight Management',
    sourceIds: ['8-obesity-and-weight-management-for-the-prevention-and-treatment-of-type-2-diabetes-pdf', 'obesity and weight management'],
    tags: ['Bariatric Surgery', 'Metabolic Surgery', 'Remission'],
    title: {
      en: 'Metabolic Surgery',
      ar: 'الجراحة الأيضية'
    },
    summary: {
      en: 'Metabolic surgery is a highly effective treatment option for severe obesity and T2D, offering substantial, sustained weight loss and high rates of diabetes remission.',
      ar: 'تعد الجراحة الأيضية خيارًا علاجيًا عالي الفعالية للسمنة المفرطة والسكري، حيث توفر فقدانًا كبيرًا ومستدامًا للوزن ومعدلات عالية من تراجع مرض السكري.'
    },
    points: {
      en: [
        'Metabolic surgery is recommended for adults with T2D and BMI ≥35 kg/m² (≥32.5 kg/m² in Asian Americans), especially if diabetes or comorbidities are difficult to control.',
        'It should be considered for adults with T2D and BMI 30.0–34.9 kg/m² (27.5–32.4 kg/m² in Asian Americans) who do not achieve durable weight loss and improvement in comorbidities with reasonable nonsurgical methods.',
        'Long-term lifestyle support and routine monitoring of micronutrients are essential post-surgery.'
      ],
      ar: [
        'يوصى بالجراحة الأيضية للبالغين المصابين بالسكري ومؤشر كتلة جسم ≥35 (≥32.5 للأمريكيين الآسيويين)، خاصة إذا كان السيطرة على السكري أو الأمراض المصاحبة صعباً.',
        'يجب التفكير فيها للمرضى بمؤشر كتلة جسم 30-34.9 الذين لم يحققوا فقدان وزن مستدام بالطرق غير الجراحية.',
        'يعتبر دعم نمط الحياة طويل الأمد والمراقبة الروتينية للمغذيات الدقيقة أمراً ضرورياً بعد الجراحة.'
      ]
    }
  }
];`,

  'ch9-pharmacologic.ts': `import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_9_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch9-t2d-approach',
    group: '9. Pharmacologic Approaches to Glycemic Treatment',
    sourceIds: ['9-pharmacologic-approaches-to-glycemic-treatment-pdf', 'pharmacologic approaches'],
    tags: ['Pharmacotherapy', 'Type 2 Diabetes', 'Algorithm', 'First-line'],
    title: {
      en: 'Pharmacologic Treatment of Type 2 Diabetes',
      ar: 'العلاج الدوائي للسكري من النوع الثاني'
    },
    summary: {
      en: 'The approach to glucose-lowering in T2D is now deeply individualized. First-line therapy depends on comorbidities (ASCVD, HF, CKD), weight management goals, and hypoglycemia risk, moving away from a strict "metformin-first" for everyone.',
      ar: 'أصبح نهج خفض الجلوكوز مخصصاً بشكل عميق لكل مريض. يعتمد العلاج الأول على الأمراض المصاحبة (أمراض القلب، فشل القلب، أمراض الكلى)، وأهداف الوزن، ومخاطر هبوط السكر، مبتعداً عن نهج "الميتفورمين أولاً" للجميع.'
    },
    points: {
      en: [
        'For individuals with ASCVD or high risk for ASCVD, a GLP-1 RA or SGLT2 inhibitor with proven cardiovascular benefit is recommended independent of baseline A1C or metformin use.',
        'For individuals with Heart Failure (HFrEF or HFpEF), an SGLT2 inhibitor is recommended for glycemic management and prevention of HF hospitalizations.',
        'For individuals with CKD, an SGLT2 inhibitor is recommended to reduce CKD progression and cardiovascular events.',
        'If compelling indications are absent, choice of therapy should be guided by efficacy in glucose lowering, weight impact, hypoglycemia risk, and cost.'
      ],
      ar: [
        'للأفراد المصابين بأمراض القلب (ASCVD) أو المعرضين لخطر كبير، يوصى باستخدام منبهات مستقبلات GLP-1 أو مثبطات SGLT2 ذات الفائدة المثبتة للقلب، بغض النظر عن مستوى التراكمي الأولي.',
        'للأفراد المصابين بفشل القلب، يوصى باستخدام مثبطات SGLT2 لإدارة السكر والوقاية من تفاقم الحالة.',
        'للأفراد المصابين بأمراض الكلى المزمنة (CKD)، يوصى بمثبطات SGLT2 لتقليل تطور المرض الكلوي.',
        'في غياب الدواعي القهرية (كأمراض القلب والكلى)، يجب أن يعتمد اختيار العلاج على فعالية خفض السكر، والتأثير على الوزن، ومخاطر الهبوط، والتكلفة.'
      ]
    }
  },
  {
    id: 'ada-2026-ch9-insulin-initiation',
    group: '9. Pharmacologic Approaches to Glycemic Treatment',
    sourceIds: ['9-pharmacologic-approaches-to-glycemic-treatment-pdf', 'pharmacologic approaches'],
    tags: ['Insulin', 'Basal Insulin', 'Intensification'],
    title: {
      en: 'Insulin Initiation and Intensification',
      ar: 'بدء الأنسولين وتكثيفه'
    },
    summary: {
      en: 'When initiating injectable therapy, GLP-1 RAs are preferred over insulin for most patients. If insulin is needed, basal insulin is started first. Over-basalization should be avoided.',
      ar: 'عند بدء العلاج بالحقن، تُفضل منبهات GLP-1 على الأنسولين لمعظم المرضى. وإذا كانت هناك حاجة للأنسولين، يُبدأ بالأنسولين القاعدي (Basal) أولاً مع تجنب الإفراط في الجرعات.'
    },
    points: {
      en: [
        'Consider initiating insulin if there is evidence of ongoing catabolism (weight loss), symptoms of hyperglycemia, or when A1C levels (>10% or blood glucose ≥300 mg/dL) suggest insulin deficiency.',
        'In most adults with T2D requiring injectable therapy, GLP-1 RAs are preferred to insulin.',
        'When basal insulin is added, start at 10 units/day or 0.1–0.2 units/kg/day, and titrate based on fasting glucose.',
        'Avoid "overbasalization", suspected when basal dose >0.5 units/kg/day, high bedtime-morning or post-preprandial glucose differential, or frequent hypoglycemia. If overbasalized, evaluate adding prandial insulin or GLP-1 RA.'
      ],
      ar: [
        'فكر في بدء الأنسولين إذا كان هناك دليل على الهدم (فقدان الوزن)، أو أعراض شديدة لارتفاع السكر، أو إذا كان التراكمي (>10% أو السكر ≥300 مجم/ديسيلتر).',
        'في معظم البالغين الذين يحتاجون لعلاج بالحقن، تُفضل منبهات GLP-1 على الأنسولين.',
        'عند إضافة الأنسولين القاعدي، ابدأ بـ 10 وحدات/يوم أو 0.1-0.2 وحدة/كجم/يوم، واضبط الجرعة بناءً على سكر الصائم.',
        'تجنب "الإفراط في الأنسولين القاعدي" (overbasalization)، ويُشتبه به عندما تكون الجرعة >0.5 وحدة/كجم/يوم، مع تفاوت كبير بين سكر قبل وبعد الوجبات. في هذه الحالة أضف أنسولين الوجبات أو GLP-1.'
      ]
    }
  }
];`
};

for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(dataDir, filename), content);
}

// Update guidelinesData.ts
const mainFile = path.join(__dirname, '..', 'components', 'guidelines', 'guidelinesData.ts');
let mainContent = fs.readFileSync(mainFile, 'utf8');

const imports = [
  "import { ADA_2026_CHAPTER_2_TOPICS } from './data/ada2026/ch2-diagnosis';",
  "import { ADA_2026_CHAPTER_3_TOPICS } from './data/ada2026/ch3-prevention';",
  "import { ADA_2026_CHAPTER_8_TOPICS } from './data/ada2026/ch8-obesity';",
  "import { ADA_2026_CHAPTER_9_TOPICS } from './data/ada2026/ch9-pharmacologic';"
];

// Insert imports
mainContent = mainContent.replace(
  "import { ADA_2026_CHAPTER_1_TOPICS } from './data/ada2026/intro';",
  "import { ADA_2026_CHAPTER_1_TOPICS } from './data/ada2026/intro';\n" + imports.join('\n')
);

// Insert topics pushes
mainContent = mainContent.replace(
  "topics.push(...ADA_2026_CHAPTER_1_TOPICS);",
  "topics.push(...ADA_2026_CHAPTER_1_TOPICS);\n    topics.push(...ADA_2026_CHAPTER_2_TOPICS);\n    topics.push(...ADA_2026_CHAPTER_3_TOPICS);\n    topics.push(...ADA_2026_CHAPTER_8_TOPICS);\n    topics.push(...ADA_2026_CHAPTER_9_TOPICS);"
);

fs.writeFileSync(mainFile, mainContent);
console.log('Done generating chapters 2, 3, 8, 9');
