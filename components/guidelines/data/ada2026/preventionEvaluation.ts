import type { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_PREVENTION_EVALUATION_TOPICS: GuidelineTopic[] = [
  {
    id: 'prevention-delay-full',
    group: 'preventionEvaluation',
    title: {
      en: '3. Prevention or Delay of Diabetes and Associated Comorbidities',
      ar: '3. الوقاية من السكري أو تأخيره والأمراض المصاحبة',
    },
    summary: {
      en: 'Guidelines for monitoring and interventions (lifestyle, nutrition, and pharmacotherapy) to prevent or delay the onset of type 2 diabetes and progression of type 1 diabetes, while managing associated cardiovascular risks.',
      ar: 'إرشادات المراقبة والتدخلات (نمط الحياة، التغذية، والعلاج الدوائي) لمنع أو تأخير ظهور السكري من النوع 2 وتطور النوع 1، مع إدارة مخاطر أمراض القلب والأوعية الدموية المرتبطة.',
    },
    points: {
      en: [
        'Prediabetes: Monitor at least annually; use A1C, FPG, or OGTT.',
        'Presymptomatic Type 1: Monitor with A1C every 6 months and OGTT annually.',
        'Prescribe a structured weight loss program (≥5–7% weight reduction) and ≥150 min/week of moderate physical activity for all high-risk patients.',
        'Metformin is highly recommended for adults aged 25–59 with BMI ≥35, FPG ≥110, A1C ≥6.0%, or prior GDM.',
        'Consider Metformin to prevent steroid-induced or PI3Kα inhibitor-induced hyperglycemia.',
        'Monitor Vitamin B12 periodically if on long-term Metformin.',
        'Do NOT stop statins out of fear of new-onset diabetes; the cardiovascular benefit far outweighs the risk.',
        'Discuss Teplizumab infusion with eligible patients (≥8 years old, Stage 2 Type 1) to delay clinical onset.',
      ],
      ar: [
        'مقدمات السكري: راقب سنوياً على الأقل باستخدام السكر الصائم، التراكمي، أو OGTT.',
        'النوع الأول قبل الأعراض (المرحلة 2): راقب التراكمي كل 6 أشهر وOGTT سنوياً.',
        'صِف برنامجاً منظماً لإنقاص الوزن (≥5-7%) مع نشاط بدني معتدل (150 دقيقة/أسبوع) لجميع المعرضين للخطر.',
        'الميتفورمين (جلوكوفاج) موصى به بقوة للبالغين 25-59 عاماً إذا كان BMI ≥35، السكر الصائم ≥110، التراكمي ≥6.0%، أو يوجد تاريخ سكري حمل.',
        'فكر في الميتفورمين للوقاية من ارتفاع السكر الناتج عن الكورتيزون بجرعات عالية أو أدوية السرطان (PI3Kα).',
        'راقب مستويات فيتامين B12 دورياً للمرضى الذين يستخدمون الميتفورمين لفترة طويلة.',
        'لا توقف الستاتين خوفاً من تسببه في السكري؛ فالفائدة في حماية القلب تفوق الخطر بكثير.',
        'ناقش إمكانية استخدام (Teplizumab) لتأخير ظهور النوع الأول لدى المرضى المناسبين (≥8 سنوات، المرحلة 2).',
      ],
    },
    practiceNote: {
      en: 'Do not just label prediabetes; actively prescribe a concrete prevention plan, monitor cardiovascular risk, and set follow-up intervals.',
      ar: 'لا تكتفِ بتشخيص "ما قبل السكري"؛ بل صِف خطة وقاية واضحة، وراقب خطورة أمراض القلب، وحدد فترات للمتابعة.',
    },
    details: [
      {
        title: { en: 'Monitoring Guidelines', ar: 'إرشادات المراقبة' },
        items: {
          en: [
            'Monitor prediabetes at least annually.',
            'Monitor presymptomatic Type 1 Diabetes (Stage 2) using A1C every 6 months and 75-g OGTT annually.'
          ],
          ar: [
            'مراقبة مقدمات السكري سنوياً على الأقل.',
            'مراقبة السكري من النوع الأول قبل ظهور الأعراض (المرحلة 2) باستخدام تراكمي السكر (A1C) كل 6 أشهر واختبار تحمل الجلوكوز الفموي (OGTT) سنوياً.'
          ]
        }
      },
      {
        title: { en: 'Lifestyle Interventions', ar: 'تدخلات نمط الحياة' },
        items: {
          en: [
            'Target ≥5-7% weight reduction.',
            'Achieve ≥150 minutes per week of moderate-intensity physical activity.',
            'Prescribe evidence-based eating patterns like Mediterranean or low-carbohydrate diets.'
          ],
          ar: [
            'استهدف إنقاص الوزن بنسبة ≥5-7%.',
            'تحقيق نشاط بدني معتدل الشدة لمدة ≥150 دقيقة أسبوعياً.',
            'وصف أنماط غذائية مثبتة الفعالية مثل حمية البحر الأبيض المتوسط أو الأنظمة قليلة الكربوهيدرات.'
          ]
        }
      },
      {
        title: { en: 'Pharmacotherapy', ar: 'العلاج الدوائي' },
        items: {
          en: [
            'Metformin for BMI ≥35 kg/m2, age 25-59, higher fasting glucose, or prior GDM.',
            'Metformin to prevent hyperglycemia from PI3Kα inhibitors or high-dose glucocorticoids.',
            'Monitor Vitamin B12 periodically with long-term Metformin.',
            'Consider Teplizumab for selected individuals ≥8 years old with Stage 2 Type 1 Diabetes.'
          ],
          ar: [
            'الميتفورمين لمن لديهم مؤشر كتلة الجسم ≥35، العمر 25-59، صيام جلوكوز مرتفع، أو تاريخ سكري حمل.',
            'الميتفورمين للوقاية من ارتفاع السكر بسبب مثبطات PI3Kα أو الكورتيكوستيرويدات بجرعات عالية.',
            'مراقبة فيتامين B12 دورياً مع الاستخدام طويل الأمد للميتفورمين.',
            'التفكير في إعطاء Teplizumab لأفراد مختارين بعمر ≥8 سنوات المصابين بالمرحلة 2 من النوع الأول.'
          ]
        }
      }
    ],
    quickDecision: {
      when: {
        en: 'When encountering patients with prediabetes, presymptomatic type 1 diabetes, or high risk for type 2 diabetes.',
        ar: 'عند التعامل مع مرضى مقدمات السكري، أو السكري من النوع الأول قبل ظهور الأعراض، أو ذوي المخاطر العالية للنوع الثاني.',
      },
      start: {
        en: 'Refer to intensive lifestyle intervention (weight loss, physical activity). Consider Metformin in specific high-risk groups.',
        ar: 'قم بالإحالة إلى تدخلات نمط الحياة المكثفة (فقدان الوزن، النشاط البدني). فكر في الميتفورمين للفئات عالية المخاطر.',
      },
      followUp: {
        en: 'Annually at minimum, modifying frequency based on individual risk. Bi-annually A1C for presymptomatic Type 1.',
        ar: 'سنوياً كحد أدنى مع تعديل التكرار بناءً على المخاطر الفردية. وكل 6 أشهر للتراكمي لمقدمات النوع الأول.',
      },
      warn: {
        en: 'Do not discontinue statins out of fear of incident diabetes; monitor glucose instead.',
        ar: 'لا توقف الستاتين خوفاً من تسببه في السكري؛ بل راقب الجلوكوز بدلاً من ذلك.',
      },
    },
    sourceIds: ['prevention-delay'],
    tags: ['prediabetes', 'prevention', 'metformin', 'teplizumab', 'lifestyle', 'DPP'],
  },
  {
    id: 'comprehensive-evaluation-full',
    group: 'preventionEvaluation',
    title: {
      en: '4. Comprehensive Medical Evaluation and Assessment of Comorbidities',
      ar: '4. التقييم الطبي الشامل وتقييم الأمراض المصاحبة',
    },
    summary: {
      en: 'Provides a structured framework for diabetes evaluation, emphasizing person-centered communication, interprofessional care, and screening for comorbidities including bone health, cognitive impairment, sexual health, and MASLD.',
      ar: 'يوفر إطاراً منظماً لتقييم السكري، مؤكداً على التواصل المتمركز حول المريض، الرعاية المهنية المشتركة، والفحص للأمراض المصاحبة بما في ذلك صحة العظام، التدهور الإدراكي، الصحة الجنسية، و MASLD.',
    },
    points: {
      en: [
        'Perform a comprehensive evaluation at the initial visit to establish diagnosis, assess complications/comorbidities, and form a care plan.',
        'Thyroid & Celiac: Screen Type 1 patients for autoimmune thyroid disease immediately, and for celiac if symptomatic.',
        'Bone Health: Assess fracture risk in older adults. Get a DEXA scan every 2-3 years for those ≥65. Avoid TZDs and Sulfonylureas in high-risk patients.',
        'Cognitive: Simplify treatment in patients with cognitive impairment to avoid dangerous hypoglycemia.',
        'Sexual Health: Routinely ask men about erectile dysfunction/hypogonadism, and postmenopausal women about genitourinary symptoms.',
        'Liver (MASLD/MASH): Use the FIB-4 index to screen adults with Type 2 diabetes. If FIB-4 ≥ 1.3, evaluate liver stiffness.',
        'For MASH with Type 2 Diabetes, GLP-1 RAs are preferred. Avoid TZDs in heart failure, but pioglitazone can help MASH.',
        'Avoid metabolic surgery in decompensated cirrhosis.',
      ],
      ar: [
        'قم بتقييم شامل في الزيارة الأولى لتأكيد التشخيص، تقييم المضاعفات، ووضع خطة الرعاية.',
        'الغدة والسيلياك: افحص مرضى النوع الأول لأمراض الغدة الدرقية المناعية فوراً، وللسيلياك عند وجود أعراض.',
        'صحة العظام: قَيّم خطر الكسور لكبار السن. اطلب فحص DEXA كل 2-3 سنوات لمن هم ≥65. تجنب الـ TZDs والـ Sulfonylureas لمن لديهم خطر كسور عالي.',
        'الإدراك: بسّط خطة العلاج لمرضى الضعف الإدراكي لتجنب نوبات الهبوط الخطيرة.',
        'الصحة الجنسية: اسأل الرجال روتينياً عن ضعف الانتصاب، والنساء بعد انقطاع الطمث عن أعراض الجفاف والألم.',
        'الكبد (MASLD/MASH): استخدم مؤشر FIB-4 لفحص مرضى النوع الثاني. إذا كان FIB-4 ≥ 1.3، قَيّم صلابة الكبد.',
        'لمرضى MASH مع النوع الثاني، يُفضل استخدام إبر GLP-1. يمكن استخدام بيوجليتازون بحذر.',
        'تجنب جراحات السمنة تماماً في حالات تليف الكبد غير المتكافئ (Decompensated cirrhosis).',
      ],
    },
    practiceNote: {
      en: 'Systematically assess for MASLD with FIB-4, evaluate fracture risk in older adults, and proactively inquire about sexual health, dental care, and cognitive impairment.',
      ar: 'قَيّم خطر MASLD باستخدام FIB-4 بصورة منهجية، وافحص خطر الكسور في كبار السن، واستفسر بفاعلية عن الصحة الجنسية، ورعاية الأسنان، والضعف الإدراكي.',
    },
    details: [
      {
        title: { en: 'MASLD and Steatohepatitis (MASH)', ar: 'مرض الكبد الدهني المرتبط بخلل الأيض (MASLD/MASH)' },
        items: {
          en: [
            'Use FIB-4 index to assess advanced liver fibrosis risk. Adults with a FIB-4 >= 1.3 should have additional stratification by liver stiffness measurement (LSM) or ELF test.',
            'Refer individuals with indicated high-risk liver fibrosis to a gastroenterologist or hepatologist.',
            'Consider GLP-1 RAs, dual GIP/GLP-1 RAs, or pioglitazone for glycemic management with potential benefits in MASH.'
          ],
          ar: [
            'استخدم مؤشر FIB-4 لتقييم خطر تليف الكبد. البالغون الذين لديهم FIB-4 >= 1.3 يجب تصنيفهم إضافياً بقياس صلابة الكبد (LSM) أو اختبار ELF.',
            'أحل الأفراد المعرضين لخطر عالي لتليف الكبد إلى طبيب جهاز هضمي أو كبد.',
            'فكر في استخدام GLP-1 RAs، أو dual GIP/GLP-1 RAs، أو pioglitazone لإدارة السكر بفوائد محتملة في مرض MASH.'
          ]
        }
      },
      {
        title: { en: 'Bone Health & Aging', ar: 'صحة العظام والشيخوخة' },
        items: {
          en: [
            'Monitor bone mineral density using DEXA every 2-3 years for individuals ≥65 years.',
            'Avoid TZDs and Sulfonylureas in individuals at elevated risk for fractures to minimize falls and bone loss.',
            'Assess cognitive impairment and simplify care to minimize hypoglycemia.'
          ],
          ar: [
            'راقب كثافة العظام بـ DEXA كل 2-3 سنوات لمن هم ≥65 عاماً.',
            'تجنب TZDs و Sulfonylureas لمن لديهم خطر كسور عالي لتقليل السقوط وفقدان العظام.',
            'قَيّم الضعف الإدراكي وبسّط الرعاية لتقليل هبوط السكر.'
          ]
        }
      },
      {
        title: { en: 'Other Comorbidities', ar: 'أمراض مصاحبة أخرى' },
        items: {
          en: [
            'Type 1 Diabetes: Screen for Autoimmune Thyroid Disease and Celiac Disease.',
            'Dental: Annual dental exam; adjust medications prior to procedures.',
            'Sexual Health: Screen for erectile dysfunction and signs of hypogonadism in men, and genitourinary syndrome in women.'
          ],
          ar: [
            'النوع الأول: افحص أمراض الغدة الدرقية المناعية ومرض السيلياك.',
            'الأسنان: فحص أسنان سنوي؛ وضبط الأدوية قبل الإجراءات السنية.',
            'الصحة الجنسية: افحص ضعف الانتصاب وعلامات نقص الهرمونات لدى الرجال، ومتلازمة انقطاع الطمث لدى النساء.'
          ]
        }
      }
    ],
    quickDecision: {
      when: {
        en: 'During the initial medical evaluation, annual follow-ups, or when a patient presents with new complications or signs of comorbidities.',
        ar: 'أثناء التقييم الطبي الأولي، والمتابعات السنوية، أو عند ظهور مضاعفات أو علامات أمراض مصاحبة جديدة.',
      },
      start: {
        en: 'Compute FIB-4 for all adults with T2D, review bone fracture risk in the elderly, and implement person-centered communication.',
        ar: 'احسب FIB-4 لجميع البالغين بالنوع الثاني، وراجع خطر الكسور لكبار السن، وطبق تواصلاً متمركزاً حول المريض.',
      },
      followUp: {
        en: 'At every visit, assess functional/cognitive status; annually perform comprehensive reviews (dental, bone, liver).',
        ar: 'قَيّم الحالة الوظيفية/الإدراكية في كل زيارة؛ وقم بمراجعة شاملة سنوياً (الأسنان، العظام، الكبد).',
      },
      warn: {
        en: 'Be cautious of hypoglycemia risk in cognitively impaired patients. Avoid TZDs/SUs in patients with high fracture risk.',
        ar: 'احذر من خطر هبوط السكر لمرضى الضعف الإدراكي. وتجنب TZDs/SUs لمرضى خطر الكسور العالي.',
      },
    },
    sourceIds: ['comprehensive-evaluation'],
    tags: ['medical evaluation', 'MASLD', 'FIB-4', 'bone health', 'cognitive impairment', 'celiac'],
  },
];
