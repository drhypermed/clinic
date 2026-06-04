import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_9_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch9-t1d',
    group: '9. Pharmacologic Approaches',
    sourceIds: ['9-pharmacologic-approaches-to-glycemic-treatment-pdf', 'pharmacologic'],
    tags: ['Type 1', 'Insulin', 'AID', 'SGLT2'],
    title: {
      en: 'Type 1 Diabetes Treatment',
      ar: 'علاج السكري من النوع الأول (Type 1 Diabetes)'
    },
    summary: {
      en: 'Recommendations for insulin delivery technology and adjunctive therapies in Type 1 Diabetes.',
      ar: 'توصيات التكنولوجيا والإنسولين والعلاجات المساعدة لمرضى النوع الأول.'
    },
    points: {
      en: [
        'Insulin and Delivery Technology: Insulin analogs are preferred over human insulin to reduce hypoglycemia risk. Automated Insulin Delivery (AID) Systems are considered the best and most preferred choice, as they increase Time in Range (TIR) and reduce hypoglycemia better than traditional pumps or injections.',
        'SGLT2 Inhibitors Warning: Although these drugs improve A1C and weight, they are not approved for Type 1 due to their association with an increased risk of Diabetic Ketoacidosis (DKA) by up to 5-17 times.',
        'Adjunctive Therapies: Pramlintide can be used as an adjunct with insulin. GLP-1 RAs are still under study, and their use has been associated with increased rates of DKA and gastrointestinal symptoms.'
      ],
      ar: [
        'الإنسولين وتكنولوجيا التوصيل: يُفضل استخدام نظائر الإنسولين (Insulin Analogs) على الإنسولين البشري لتقليل خطر هبوط السكر. وتُعتبر أنظمة التوصيل الآلي للإنسولين (AID Systems) الخيار الأفضل والأكثر تفضيلاً، لأنها تزيد من "الوقت في النطاق المستهدف" (TIR) وتقلل من الهبوط بشكل أفضل من المضخات التقليدية أو الحقن.',
        'تحذير من أدوية (SGLT2 inhibitors): رغم أن هذه الأدوية تُحسن التراكمي والوزن، إلا أنها غير مصرح بها للنوع الأول لارتباطها بزيادة خطر حدوث الحموضة الكيتونية (DKA) بنسبة تصل إلى 5-17 ضعفاً.',
        'العلاجات المساعدة: يمكن استخدام عقار "براملينتيد" (Pramlintide) كعلاج مساعد مع الإنسولين، بينما لا تزال أدوية (GLP-1 RAs) قيد الدراسة، واستخدامها ارتبط بزيادة معدلات الحموضة الكيتونية وأعراض الجهاز الهضمي.'
      ]
    }
  },
  {
    id: 'ada-2026-ch9-t2d-organ',
    group: '9. Pharmacologic Approaches',
    sourceIds: ['9-pharmacologic-approaches-to-glycemic-treatment-pdf', 'pharmacologic'],
    tags: ['Type 2', 'Organ Protection', 'ASCVD', 'HF', 'CKD', 'GLP-1', 'SGLT2'],
    title: {
      en: 'Type 2 Diabetes: The New Paradigm (Organ Protection)',
      ar: 'علاج السكري من النوع الثاني: التوجه الجديد (Organ Protection)'
    },
    summary: {
      en: 'The golden rule now is: choosing a drug no longer depends solely on A1C level, but on the comorbidities.',
      ar: 'القاعدة الذهبية الآن هي: اختيار الدواء لم يعد يعتمد على مستوى التراكمي (A1C) فقط، بل على الأمراض المصاحبة.'
    },
    points: {
      en: [
        'Heart Disease and Atherosclerosis (ASCVD): GLP-1 RAs or SGLT2 inhibitors with proven cardiovascular benefit must be prescribed, regardless of the A1C level.',
        'Heart Failure (HF): SGLT2 inhibitors are the first and primary choice to prevent heart failure hospitalizations, whether HF is with reduced or preserved ejection fraction. For HF with preserved ejection fraction (HFpEF) accompanied by obesity, GLP-1 RAs or dual GIP/GLP-1 drugs are strongly recommended.',
        'Chronic Kidney Disease (CKD): SGLT2 inhibitors are preferred for those with an eGFR above 20. If eGFR is below 45, the glucose-lowering effect of these drugs diminishes, and here (or in very advanced cases) it is preferable to use GLP-1 RAs, which can be safely used even with dialysis to protect the heart.',
        'Metabolic Dysfunction-Associated Steatotic Liver Disease (MASH/MASLD): GLP-1 RAs (like Semaglutide) are explicitly recommended as a preferred choice to reduce liver inflammation and fibrosis. Pioglitazone or dual drugs (GIP/GLP-1) can also be used.',
        'Weight Management: To achieve the strongest combined glucose- and weight-lowering effect, dual drugs (Tirzepatide) and GLP-1 RAs (Semaglutide) lead the list, followed by Dulaglutide and Liraglutide.'
      ],
      ar: [
        'أمراض القلب وتصلب الشرايين (ASCVD): يجب وصف أدوية (GLP-1 RAs) أو (SGLT2 inhibitors) ذات الفائدة القلبية المثبتة، بغض النظر عن مستوى السكر التراكمي.',
        'هبوط عضلة القلب (Heart Failure): أدوية (SGLT2 inhibitors) هي الخيار الأول والأساسي لمنع دخول المستشفى بسبب هبوط القلب، سواء كان الهبوط مع انخفاض أو احتفاظ بكفاءة العضلة. وفي حالات هبوط القلب مع احتفاظ الكفاءة (HFpEF) المصحوب بالسمنة، يُوصى بشدة باستخدام (GLP-1 RAs) أو الأدوية المزدوجة (GIP/GLP-1).',
        'أمراض الكلى المزمنة (CKD): تُفضل أدوية (SGLT2 inhibitors) لمن لديهم كفاءة كلى (eGFR) أعلى من 20. إذا كانت الكفاءة أقل من 45، يقل التأثير الخافض للسكر لهذه الأدوية، وهنا (أو في الحالات المتقدمة جداً) يُفضل استخدام (GLP-1 RAs) التي يمكن استخدامها بأمان حتى مع غسيل الكلى لحماية القلب.',
        'الكبد الدهني المرتبط بالخلل الأيضي (MASH/MASLD): تم التوصية صراحة باستخدام (GLP-1 RAs) (مثل سيماجلوتيد) كخيار مفضل لتقليل التهاب وتليف الكبد. كما يمكن استخدام "بيوجليتازون" أو الأدوية المزدوجة (GIP/GLP-1).',
        'إدارة الوزن: لتحقيق أقوى تأثير خافض للسكر والوزن معاً، تتصدر الأدوية المزدوجة (تيرزيباتيد) وأدوية (GLP-1 RAs) (سيماجلوتيد) القائمة، تليها دولاجلوتيد وليراجلوتيد.'
      ]
    }
  },
  {
    id: 'ada-2026-ch9-insulin-t2d',
    group: '9. Pharmacologic Approaches',
    sourceIds: ['9-pharmacologic-approaches-to-glycemic-treatment-pdf', 'pharmacologic'],
    tags: ['Insulin', 'Overbasalization', 'Prandial'],
    title: {
      en: 'Using Insulin in Type 2 and "Overbasalization"',
      ar: 'استخدام الإنسولين في النوع الثاني ومصطلح "الإفراط القاعدي"'
    },
    summary: {
      en: 'Guidelines on when to initiate insulin and warnings against unnecessary escalation of basal insulin.',
      ar: 'إرشادات متى نبدأ الإنسولين فوراً والتحذير من الإفراط في رفع جرعة الإنسولين القاعدي.'
    },
    points: {
      en: [
        'When to start insulin immediately? If A1C is higher than 10%, random blood glucose is 300 mg/dL or more, or in the presence of catabolic symptoms (unexplained weight loss or ketones).',
        'Basal Insulin Overbasalization: The guidelines strongly warn against continuing to increase the basal insulin dose without justification. Warning signs of overbasalization: a large gap (more than 50 mg/dL) between bedtime and morning glucose readings, frequent hypoglycemia, or extreme fluctuation in readings. In these cases, focus should be on controlling "post-prandial" sugar rather than increasing the basal dose.',
        'Prandial Insulin Alternative: If a patient is on basal insulin and needs additional control, it is preferable to add a GLP-1 RA rather than adding mealtime insulin (Prandial Insulin) to achieve higher efficacy while avoiding weight gain and hypo risks.'
      ],
      ar: [
        'متى نبدأ الإنسولين فوراً؟ إذا كان السكر التراكمي أعلى من 10%، أو السكر العشوائي 300 مجم/ديسيلتر فأكثر، أو في وجود أعراض تقويضية (فقدان وزن غير مبرر أو كيتونات).',
        'الإفراط في الإنسولين القاعدي (Overbasalization): يحذر الدليل بشدة من الاستمرار في رفع جرعة الإنسولين القاعدي دون مبرر. العلامات التحذيرية للإفراط: وجود فرق كبير (أكثر من 50 مجم/ديسيلتر) بين قياس السكر وقت النوم وفي الصباح، حدوث هبوط سكر متكرر، أو تذبذب شديد في القراءات. في هذه الحالات يجب التركيز على ضبط سكر "ما بعد الوجبات" بدلاً من زيادة القاعدي.',
        'بديل إنسولين الوجبات: إذا كان المريض على إنسولين قاعدي ويحتاج لضبط إضافي، يُفضل إضافة (GLP-1 RA) بدلاً من إضافة إنسولين الوجبات (Prandial Insulin)، للحصول على فعالية أعلى مع تجنب زيادة الوزن وخطر الهبوط.'
      ]
    }
  },
  {
    id: 'ada-2026-ch9-oncology',
    group: '9. Pharmacologic Approaches',
    sourceIds: ['9-pharmacologic-approaches-to-glycemic-treatment-pdf', 'pharmacologic'],
    tags: ['Oncology', 'Immunotherapy', 'Glucocorticoids'],
    title: {
      en: 'Diabetes Induced by Oncology and Immune Therapies (Critical Points)',
      ar: 'السكري الناتج عن أدوية الأورام والمناعة (نقاط حرجة)'
    },
    summary: {
      en: 'Handling diabetes that emerges as a side effect of advanced cancer and immune therapies.',
      ar: 'التعامل مع السكري الذي يظهر كأثر جانبي لعلاجات الأورام المتقدمة والمناعة.'
    },
    points: {
      en: [
        'Immune Checkpoint Inhibitors (ICIs): May suddenly destroy beta cells and cause a Type 1-like diabetes with ketoacidosis. Action: Immediate initiation of insulin, and it is strictly forbidden to stop the oncology treatment because this cell destruction is irreversible.',
        'Oncology Therapies (PI3K & mTOR inhibitors): Cause severe insulin resistance. The first-line diabetes treatment here is Metformin, and SGLT2 inhibitors can be used with caution. Insulin should be delayed as a last resort, as it may counteract the action of these tumor drugs.',
        'Cortisone (Glucocorticoids): The insulin plan must be tailored to match the cortisone peak. For example, morning "Prednisone" severely spikes sugar in the afternoon and evening and returns to normal in the morning, so relying solely on fasting sugar measurements will hide the real problem.'
      ],
      ar: [
        'العلاجات المناعية للأورام (ICIs): قد تدمر خلايا بيتا فجأة وتسبب سكرياً يشبه النوع الأول مع حموضة كيتونية. التصرف: البدء الفوري بالإنسولين، ويُمنع إيقاف علاج الأورام لأن هذا التدمير للخلايا لا رجعة فيه.',
        'علاجات الأورام (PI3K & mTOR inhibitors): تسبب ارتفاعاً شديداً في مقاومة الإنسولين. الخيار الأول لعلاج السكر هنا هو "الميتفورمين" (Metformin) ويمكن استخدام (SGLT2 inhibitors) بحذر. يجب تأجيل استخدام الإنسولين كخيار أخير فقط، لأنه قد يعاكس عمل أدوية الأورام هذه.',
        'الكورتيزون (Glucocorticoids): يجب تفصيل خطة الإنسولين لتطابق ذروة الكورتيزون؛ فمثلاً "البريدنيزون" الصباحي يرفع السكر بشدة في فترة ما بعد الظهر والمساء ويعود لطبيعته صباحاً، لذا الاعتماد على قياس سكر الصائم فقط سيخفي المشكلة الحقيقية.'
      ]
    }
  },
  {
    id: 'ada-2026-ch9-caveats',
    group: '9. Pharmacologic Approaches',
    sourceIds: ['9-pharmacologic-approaches-to-glycemic-treatment-pdf', 'pharmacologic'],
    tags: ['Compounding', 'Glucagon', 'Cost', 'DPP-4'],
    title: {
      en: 'General Pharmacological and Economic Caveats',
      ar: 'محاذير دوائية واقتصادية عامة'
    },
    summary: {
      en: 'Important warnings regarding compounded medications, glucagon prescribing, treatment cost, and drug combinations.',
      ar: 'تحذيرات هامة حول التركيبات الدوائية المقلدة، وصف الجلوكاجون، التكلفة، والدمج الخاطئ للأدوية.'
    },
    points: {
      en: [
        'Compounded Products: Due to the global shortage of GLP-1 drugs, alternative compounded pharmaceuticals have proliferated. The guide strongly warns against using these unapproved (FDA) formulations due to risks related to safety, impurities, and dosing errors.',
        'Emergency Glucagon Injections: Glucagon MUST be prescribed to any patient using insulin or at a high risk of hypoglycemia. Ready-for-immediate-use types (like the nasal spray) are preferred for their ease during a coma.',
        'Financial Cost: The guidelines stress the necessity of routinely discussing medication costs with patients. If modern drugs are not reasonably affordable, older drugs (Metformin, human insulin, Sulfonylurea, Thiazolidinediones) can be used with thorough patient education about the risks of hypoglycemia and weight gain.',
        'Wrong Combination: It is never recommended to combine DPP-4 inhibitors with GLP-1 RAs, as there is no additional benefit in lowering blood sugar.'
      ],
      ar: [
        'التركيبات الدوائية المقلدة (Compounded Products): بسبب النقص العالمي في أدوية (GLP-1)، انتشرت تركيبات صيدلانية بديلة. يُحذر الدليل بشدة من استخدام هذه التركيبات غير المعتمدة من (FDA) نظراً للمخاطر المتعلقة بالسلامة، والشوائب، وأخطاء الجرعات.',
        'حقن الجلوكاجون الطارئة: يجب وصف الجلوكاجون لأي مريض يستخدم الإنسولين أو معرض لخطر هبوط عالٍ. ويُفضل الأنواع الجاهزة للاستخدام الفوري (مثل البخاخ الأنفي) لسهولتها وقت الغيبوبة.',
        'التكلفة المالية: يشدد الدليل على ضرورة مناقشة تكلفة الأدوية مع المرضى بشكل روتيني. إذا كانت الأدوية الحديثة غير معقولة التكلفة، يمكن استخدام الأدوية القديمة (الميتفورمين، الإنسولين البشري، السلفونيل يوريا، الثيازوليدينديون) مع تثقيف المريض جيداً حول مخاطر هبوط السكر وزيادة الوزن.',
        'الدمج الخاطئ: لا يُنصح أبداً بالجمع بين أدوية (DPP-4 inhibitors) وأدوية (GLP-1 RAs) معاً، لعدم وجود أي فائدة إضافية في خفض السكر.'
      ]
    }
  },
  {
    id: 'ada-2026-ch9-conclusion',
    group: '9. Pharmacologic Approaches',
    sourceIds: ['9-pharmacologic-approaches-to-glycemic-treatment-pdf', 'pharmacologic'],
    tags: ['Conclusion', 'Summary'],
    title: {
      en: 'Conclusion',
      ar: 'الخلاصة'
    },
    summary: {
      en: 'Chapter 9 directs the compass of treatment towards "Customized Care." Metformin is no longer the sole starting choice for Type 2 patients if cardiovascular or renal diseases exist, and automated delivery tech is the foundation for Type 1. Paying attention to medication-induced diabetes has also become an essential part of modern clinical practice.',
      ar: 'الفصل التاسع يوجه بوصلة العلاج نحو "الرعاية المخصصة". لم يعد الميتفورمين هو الخيار الوحيد للبدء في مرضى النوع الثاني إذا كانت هناك أمراض قلبية أو كلوية، وتكنولوجيا التوصيل الآلي هي الأساس للنوع الأول. كما أن الانتباه للسكري الناتج عن الأدوية (الأورام والزراعة) أصبح جزءاً أساسياً من الممارسة السريرية الحديثة.'
    },
    points: {
      en: [],
      ar: []
    }
  }
];
