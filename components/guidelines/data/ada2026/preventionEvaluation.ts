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
        'Prediabetes Monitoring: Monitor patients with prediabetes at least annually using A1C, FPG, or 2-h OGTT. For those with a history of GDM, monitor every 1-3 years lifelong.',
        'Type 1 Diabetes Prevention (Stage 2): Monitor individuals with multiple autoantibodies and normal glycemia (Stage 1), or dysglycemia (Stage 2). For Stage 2, monitor A1C every 6 months and perform an OGTT annually.',
        'Teplizumab for T1D: Teplizumab (an anti-CD3 antibody) is FDA approved to delay the onset of Stage 3 (clinical) T1D in adults and pediatric patients ≥8 years old with Stage 2 T1D. Refer these patients to a specialized center immediately.',
        'Lifestyle Interventions (T2D): Refer patients with prediabetes to an intensive lifestyle program. Target: ≥5–7% sustained weight reduction and ≥150 minutes/week of moderate-to-vigorous physical activity.',
        'Pharmacotherapy (Metformin): Metformin is highly recommended to prevent T2D in adults aged 25–59 years with BMI ≥35 kg/m2, higher fasting glucose (≥110 mg/dL), higher A1C (≥6.0%), and in women with a history of GDM.',
        'Pharmacotherapy (GLP-1): GLP-1 RAs, GIP/GLP-1 RAs, and pioglitazone may be considered for T2D prevention in very high-risk individuals, though lifestyle and Metformin remain first-line.',
        'Vitamin B12: Long-term Metformin use is associated with Vitamin B12 deficiency. Measure B12 periodically, especially in patients with anemia or peripheral neuropathy.',
        'Statin-Induced Diabetes: Statins slightly increase the risk of incident diabetes, but the massive cardiovascular benefits completely outweigh this risk. Do NOT stop statins; instead, monitor glucose and manage if it rises.',
        'Steroid/PI3Kα Hyperglycemia: Consider Metformin proactively to prevent severe hyperglycemia in patients receiving high-dose glucocorticoids or PI3Kα inhibitors for cancer therapy.',
      ],
      ar: [
        'مراقبة ما قبل السكري (النوع الثاني): افحص المريض سنوياً كحد أدنى بـ (التراكمي، السكر الصائم، أو OGTT). للنساء ذوات تاريخ سكري حمل، الفحص كل 1-3 سنوات مدى الحياة.',
        'الوقاية من النوع الأول (المرحلة 2): للمرضى الذين لديهم أجسام مضادة متعددة واضطراب طفيف في السكر (المرحلة 2)، راقب التراكمي كل 6 أشهر، واختبار OGTT سنوياً.',
        'دواء (Teplizumab) للنوع الأول: معتمد لمنع أو تأخير ظهور السكري (المرحلة 3) للأطفال (≥8 سنوات) والبالغين في المرحلة الثانية. قم بإحالة المريض لمركز متخصص لتقييم إمكانية استخدامه.',
        'نمط الحياة (النوع الثاني): قم بإحالة المريض لبرنامج مكثف. الأهداف: نزول وزن مستدام ≥5-7%، ومجهود بدني معتدل ≥150 دقيقة في الأسبوع.',
        'الميتفورمين (الجلوكوفاج) للوقاية: موصى به بقوة للبالغين من 25-59 عاماً إذا كان وزنهم كبيراً (BMI ≥ 35)، أو الصائم مرتفعاً (≥110)، أو التراكمي (≥6.0%)، أو للسيدات اللاتي أُصبن بسكري الحمل.',
        'خيارات أخرى للوقاية: يمكن النظر في إبر GLP-1 أو GIP/GLP-1 أو بيوجليتازون للمرضى شديدي الخطورة، لكن الميتفورمين ونمط الحياة هما الأساس.',
        'نقص فيتامين B12: الاستخدام الطويل للميتفورمين قد يسبب نقص B12. افحصه دورياً، خاصة لمن يعانون من أنيميا أو تنميل (اعتلال أعصاب طرفية).',
        'الستاتين (أدوية الكوليسترول) والسكري: الستاتين يرفع خطر السكري بشكل طفيف جداً، لكن فوائده في منع الجلطات تفوق الخطر بمراحل. لا توقفه أبداً خوفاً من السكري، بل استمر وراقب السكر.',
        'كورتيزون وأدوية السرطان (PI3Kα): فكر في استخدام الميتفورمين بشكل استباقي لمنع الارتفاع الشديد للسكر عند استخدام هذه الأدوية.',
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
        'Initial Visit: Perform a comprehensive evaluation to confirm diagnosis, classify diabetes, screen for complications, assess psychosocial status, and formulate a care plan.',
        'Autoimmune Thyroid Disease (Type 1): Screen all Type 1 diabetes patients for autoimmune thyroid disease (TSH and TPO antibodies) soon after diagnosis and periodically thereafter.',
        'Celiac Disease (Type 1): Screen for celiac disease (IgA tissue transglutaminase antibodies) soon after Type 1 diagnosis, especially if symptomatic (growth failure, diarrhea, unexplained hypoglycemia).',
        'Liver Disease (MASLD/MASH): Screen all adults with Type 2 diabetes or prediabetes (especially with obesity) using the FIB-4 index to assess liver fibrosis risk. Do NOT rely on liver enzymes alone as they are often normal.',
        'FIB-4 Index Workflow: If FIB-4 is low (<1.3), recheck every 2-3 years. If FIB-4 is indeterminate (1.3-2.67) or high (>2.67), refer for Liver Stiffness Measurement (LSM) or elastography. For confirmed MASH, use GLP-1 RAs or Pioglitazone.',
        'Bone Health & Fractures: T1D and T2D both increase fracture risk. Monitor bone mineral density (DEXA) every 2-3 years for individuals ≥65. Strictly AVOID TZDs (Pioglitazone) and use caution with Sulfonylureas in those at high fracture risk.',
        'Cognitive Impairment: Routinely screen older adults for cognitive impairment. If detected, urgently simplify the diabetes regimen to minimize the risk of severe hypoglycemia.',
        'Sexual Health: Routinely assess men for erectile dysfunction, retrograde ejaculation, and hypogonadism. Assess postmenopausal women for genitourinary syndrome of menopause (vaginal dryness/pain).',
        'Obstructive Sleep Apnea: Screen for OSA in patients with obesity using questionnaires (e.g., STOP-BANG) and refer for a sleep study if indicated.',
      ],
      ar: [
        'الزيارة التأسيسية (Initial Visit): قم بتقييم طبي شامل لتأكيد التشخيص، تحديد النوع، فحص المضاعفات، تقييم الحالة النفسية، ووضع خطة الرعاية.',
        'أمراض الغدة الدرقية (النوع الأول): افحص جميع مرضى النوع الأول لأمراض الغدة الدرقية المناعية (TSH و أجسام TPO المضادة) فور التشخيص ثم دورياً.',
        'مرض السيلياك (النوع الأول): افحص حساسية القمح (أجسام IgA-tTG المضادة) للنوع الأول، خاصة عند وجود أعراض كضعف النمو، الإسهال، أو هبوط السكر غير المبرر.',
        'دهون الكبد (MASLD/MASH): افحص جميع البالغين بالنوع الثاني أو مقدمات السكري (وخاصة السمنة) باستخدام مؤشر (FIB-4) لتقييم خطر التليف. لا تعتمد على إنزيمات الكبد (ALT/AST) لأنها غالباً طبيعية!',
        'خوارزمية FIB-4: إذا كان أقل من 1.3 (خطر منخفض)، أعده كل 2-3 سنوات. إذا كان بين 1.3 و 2.67 أو أعلى، قَيّم صلابة الكبد (FibroScan) وحوّله لطبيب كبد. لمرضى MASH المؤكدين، إبر GLP-1 أو بيوجليتازون هي المفضلة.',
        'صحة العظام: النوع الأول والثاني يزيدان خطر الكسور. اطلب فحص (DEXA) كل 2-3 سنوات لمن هم ≥65 عاماً. تجنب نهائياً (TZDs) كبيوجليتازون، وكن حذراً مع السلفونيل يوريا لمن لديهم خطر كسور أو هشاشة.',
        'الضعف الإدراكي: افحص كبار السن دورياً. إذا وجد ضعف إدراكي، يجب تبسيط خطة العلاج فوراً (تقليل أو إيقاف الأنسولين/السلفونيل يوريا) لتجنب نوبات الهبوط القاتلة.',
        'الصحة الجنسية: اسأل الرجال روتينياً عن ضعف الانتصاب وانخفاض التستوستيرون. واسأل النساء بعد انقطاع الطمث عن متلازمة انقطاع الطمث (جفاف المهبل/ألم الجماع).',
        'انقطاع النفس النومي (OSA): افحص توقف التنفس أثناء النوم لمرضى السمنة باستخدام استبيان (STOP-BANG) وحوّل المريض لعيادة النوم إذا لزم الأمر.',
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
