import type { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_WEIGHT_PHARMACOLOGY_TOPICS: GuidelineTopic[] = [
  {
    id: 'obesity-weight-management-full',
    group: 'weightPharmacology',
    title: {
      en: '8. Obesity and Weight Management',
      ar: '8. السمنة وإدارة الوزن',
    },
    summary: {
      en: 'Comprehensive guidelines for managing overweight and obesity in diabetes, including behavioral counseling, pharmacotherapy (e.g., GLP-1/GIP agonists), and metabolic surgery.',
      ar: 'إرشادات شاملة لإدارة زيادة الوزن والسمنة في السكري، تشمل الاستشارات السلوكية، العلاج الدوائي (مثل محفزات GLP-1/GIP)، وجراحات السمنة (الأيض).',
    },
    points: {
      en: [
        'Diagnosis & Stigma: Screen for obesity using BMI annually (or every visit). Use person-centered, nonjudgmental language. Measure waist circumference occasionally as an indicator of visceral fat.',
        'Primary Goal: Weight management is a primary goal alongside glycemia. 5-7% weight loss improves glycemic control; >10% to 15% sustained loss provides disease-modifying benefits and can induce T2D remission.',
        'Intensive Interventions: Recommend intensive lifestyle programs with ≥16 sessions over 6 months, targeting a 500-750 kcal/day deficit.',
        'Pharmacotherapy: Initiate highly effective weight-loss medications (GLP-1 RA like Semaglutide or GIP/GLP-1 RA like Tirzepatide) for BMI ≥27 kg/m2 with comorbidities. Titrate to the highest tolerated and approved dose.',
        'Chronic Treatment: Obesity is a chronic disease. Do not stop anti-obesity medications once weight is lost, as discontinuation causes rapid regain and reverses cardiometabolic benefits.',
        'Medication Review: Minimize concomitant medications that cause weight gain (e.g., Pioglitazone, Sulfonylureas, Insulin, certain antipsychotics/antidepressants). Switch to weight-neutral or weight-loss-promoting alternatives if clinically appropriate.',
        'Metabolic Surgery: Strongly consider for BMI ≥30 kg/m2 (or ≥27.5 kg/m2 for Asian populations). Monitor for post-op hypoglycemia using CGM, and manage post-op vitamin/mineral deficiencies.',
        'Safety with GLP-1/GIP: Warn patients of gastrointestinal side effects. Contraindicated in personal/family history of Medullary Thyroid Carcinoma (MTC) or Multiple Endocrine Neoplasia syndrome type 2 (MEN 2). Discontinue temporarily if pancreatitis occurs.',
      ],
      ar: [
        'التشخيص والوصمة: افحص السمنة بـ BMI سنوياً (أو في كل زيارة). استخدم لغة خالية من الأحكام. قياس محيط الخصر مفيد كمؤشر لدهون البطن.',
        'الهدف الأساسي: إدارة الوزن هدف رئيسي بموازاة السكر. نزول 5-7% يحسن التحكم، ونزول 10-15% يمنح فوائد استثنائية وقد يؤدي لـ "هدأة" أو تعافي (Remission) تام من السكري.',
        'التدخل المكثف: انصح ببرامج مكثفة تشمل ≥16 جلسة خلال 6 أشهر، بهدف تقليل السعرات بمقدار 500-750 سعرة حرارية يومياً.',
        'العلاج الدوائي: ابدأ بالأدوية عالية الفعالية (مثل سيماجلوتيد أو تيرزيباتيد) لمن لديهم BMI ≥27 مع أمراض مصاحبة. ارفع الجرعة تدريجياً للوصول لأعلى جرعة معتمدة يتحملها المريض.',
        'العلاج المزمن: السمنة مرض مزمن؛ إيقاف الأدوية يؤدي لاستعادة سريعة للوزن وفقدان الفوائد القلبية والأيضية. يجب الاستمرار عليها طالما هي فعالة ومحتملة.',
        'مراجعة أدوية المريض: قلل الأدوية التي تزيد الوزن (مثل بيوجليتازون، سلفونيل يوريا، الأنسولين، وبعض مضادات الاكتئاب/الذهان) واستبدلها ببدائل لا تزيد الوزن متى أمكن.',
        'جراحات السمنة: خيار قوي إذا كان BMI ≥30 (أو ≥27.5 للآسيويين). راقب خطر الهبوط بعد العملية بـ CGM، وعالج أي نقص في الفيتامينات والمعادن.',
        'أمان إبر التنحيف: نبه المريض للأعراض الهضمية. ممنوعة لمن لديهم تاريخ شخصي/عائلي لسرطان الغدة الدرقية النخاعي (MTC) أو MEN 2. أوقفها فوراً إذا حدث التهاب بالبنكرياس.',
      ],
    },
    practiceNote: {
      en: 'View obesity as a chronic disease requiring continuous care. Discontinuation of medications generally leads to weight regain.',
      ar: 'تعامل مع السمنة كمرض مزمن يحتاج لرعاية مستمرة. إيقاف أدوية السمنة يؤدي غالباً لاستعادة الوزن المفقود.',
    },
    details: [
      {
        title: { en: 'Pharmacotherapy', ar: 'العلاج الدوائي' },
        items: {
          en: [
            'Preferred agents: Semaglutide and Tirzepatide (highly effective for both weight and glycemia).',
            'Continue chronically: Discontinuation typically reverses weight loss and cardiometabolic benefits.',
            'Dose individualization: The highest tolerated and effective dose is preferred, which may not always be the maximum approved dose.',
          ],
          ar: [
            'الأدوية المفضلة: سيماجلوتيد وتيرزيباتيد (عالية الفعالية للوزن والسكر).',
            'الاستمرارية: يجب الاستمرار بها كعلاج مزمن؛ التوقف يعكس النتائج.',
            'تخصيص الجرعة: استخدم أعلى جرعة فعالة ومحتملة، والتي قد لا تكون الجرعة القصوى المعتمدة.',
          ],
        },
      },
      {
        title: { en: 'Metabolic Surgery', ar: 'جراحات السمنة (الأيض)' },
        items: {
          en: [
            'Consider for BMI ≥30 kg/m2 (or ≥27.5 kg/m2 for Asian Americans).',
            'Post-operative hypoglycemia is a known risk; evaluate using CGM and treat with MNT/medications.',
            'If weight recurrence occurs post-surgery, consider adding anti-obesity medications.',
          ],
          ar: [
            'يُنظر فيها لمن مؤشر كتلة جسمهم ≥30 (أو ≥27.5 للأمريكيين الآسيويين).',
            'الهبوط بعد الجراحة خطر معروف؛ قَيّم الحالة بـ CGM وعالج بالتغذية والأدوية.',
            'إذا عاد الوزن بعد الجراحة، يُنصح بإضافة أدوية السمنة كتدخل مساعد.',
          ],
        },
      },
    ],
    quickDecision: {
      when: {
        en: 'At any point a patient with diabetes is identified as having overweight or obesity (BMI ≥25 or ≥23 for Asian populations).',
        ar: 'في أي وقت يتم تشخيص المريض بزيادة الوزن أو السمنة (مؤشر كتلة الجسم ≥25، أو ≥23 للآسيويين).',
      },
      start: {
        en: 'Initiate highly effective weight-loss GLP-1/GIP agonists (if no contraindications) alongside intensive lifestyle modifications.',
        ar: 'ابدأ بأدوية GLP-1/GIP ذات الفعالية العالية في إنقاص الوزن (إن لم يوجد مانع) مع تغييرات مكثفة في نمط الحياة.',
      },
      followUp: {
        en: 'Monitor weight every 3 months during active loss. If targets not met, step up therapy (add medications or consider surgery).',
        ar: 'راقب الوزن كل 3 أشهر أثناء مرحلة نزول الوزن. إن لم تتحقق الأهداف، كثف العلاج (إضافة أدوية أو جراحة).',
      },
      warn: {
        en: 'Be cautious of severe caloric restrictions without medical supervision due to risk of malnutrition, arrhythmias, and muscle loss.',
        ar: 'احذر من الحميات القاسية جداً بدون إشراف طبي بسبب خطر سوء التغذية، اضطراب نبض القلب، وفقدان العضلات.',
      },
    },
    sourceIds: ['obesity-weight'],
    tags: ['obesity', 'BMI', 'GLP-1', 'tirzepatide', 'semaglutide', 'metabolic surgery', 'weight loss'],
  },
  {
    id: 'type1-pharmacology',
    group: 'weightPharmacology',
    title: {
      en: '9. Pharmacologic Therapy for Type 1 Diabetes',
      ar: '9. العلاج الدوائي للنوع الأول من السكري',
    },
    summary: {
      en: 'Recommendations for insulin therapy in type 1 diabetes, focusing on continuous subcutaneous insulin infusion or multiple daily injections, and matching insulin to carbohydrate intake.',
      ar: 'توصيات العلاج بالأنسولين للنوع الأول من السكري، مع التركيز على مضخات الأنسولين أو الحقن المتعددة، ومطابقة جرعة الأنسولين مع كمية النشويات.',
    },
    points: {
      en: [
        'Delivery Method: Treat most adults with Type 1 diabetes using automated insulin delivery (AID) systems, continuous subcutaneous insulin infusion (CSII), or Multiple Daily Injections (MDI - basal/bolus).',
        'Insulin Types: Modern analog insulins (Glargine, Detemir, Degludec, Lispro, Aspart) or inhaled insulin are strongly preferred over human insulins (NPH/Regular) due to significantly lower hypoglycemia risk.',
        'Starting Dose: Typical starting requirement is 0.4–1.0 units/kg/day. Usually distributed as 50% basal and 50% prandial (divided across meals). Needs increase during puberty, illness, or pregnancy.',
        'Meal Matching: Teach patients to match prandial insulin doses strictly to carbohydrate intake, considering fat and protein content, and expected physical activity.',
        'Correction Doses: Provide a clear formula for correction doses to treat hyperglycemia pre-meal or between meals.',
        'Non-Insulin Add-ons: Pramlintide is FDA approved for T1D to reduce A1C and weight, but increases risk of severe hypoglycemia. GLP-1/SGLT2 inhibitors are NOT approved for T1D and increase DKA risk.',
        'Monitoring: Reevaluate regimens, injection techniques, and lipohypertrophy every 3-6 months.',
      ],
      ar: [
        'طريقة العلاج: استخدم أنظمة ضخ الأنسولين الآلية (AID)، أو مضخات الأنسولين (CSII)، أو الحقن المتعددة MDI (قاعدي/وجبات) كمعيار أساسي لمعظم البالغين.',
        'أنواع الأنسولين: يُفضل بشدة استخدام نظائر الأنسولين الحديثة (جلارجين، ديتيمير، ديجلوديك، ليسبرو، أسبارت) أو المستنشق، وتجنب الأنسولين البشري (NPH/Regular) لتقليل خطر الهبوط.',
        'جرعات البداية: تتراوح الاحتياجات عادة بين 0.4 إلى 1.0 وحدة/كجم/يوم، وتقسم 50% قاعدي و 50% للوجبات. تزيد الاحتياجات أثناء البلوغ، فترات المرض، أو الحمل.',
        'معايرة الوجبات: علّم المريض حساب النشويات (Carb counting) لضبط الجرعة، مع الأخذ في الاعتبار نسبة الدهون والبروتين والمجهود البدني المتوقع.',
        'الجرعات التصحيحية: أعطِ المريض معادلة واضحة للجرعة التصحيحية للتعامل مع الارتفاعات قبل أو بين الوجبات.',
        'الأدوية المساعدة: دواء (Pramlintide) هو الوحيد المعتمد كإضافة للأنسولين، لكنه يزيد خطر الهبوط. أدوية GLP-1 ومثبطات SGLT2 غير معتمدة للنوع الأول وتزيد خطر الحماض الكيتوني (DKA).',
        'المتابعة الدورية: افحص أماكن الحقن لتجنب التورم الدهني (Lipohypertrophy) وراجع خطة العلاج كل 3-6 أشهر.',
      ],
    },
    practiceNote: {
      en: 'Frequent reassessment of insulin dosing and administration technique is vital for achieving glycemic goals while minimizing hypoglycemia.',
      ar: 'إعادة التقييم المستمرة لجرعات الأنسولين وطريقة الحقن أمر حيوي لتحقيق أهداف السكر مع تقليل نوبات الهبوط.',
    },
    details: [
      {
        title: { en: 'Insulin Dosing', ar: 'جرعات الأنسولين' },
        items: {
          en: [
            'Typical starting dose: 0.4 to 1.0 units/kg/day, divided roughly 50% basal and 50% prandial.',
            'Adjustment required for puberty, illness, or menstrual cycle.',
          ],
          ar: [
            'جرعة البداية المعتادة: 0.4 إلى 1.0 وحدة/كجم/يوم، مقسمة تقريباً 50% قاعدي و 50% وجبات.',
            'تتطلب الجرعات تعديلاً خلال البلوغ، المرض، أو الدورة الشهرية.',
          ],
        },
      },
    ],
    quickDecision: {
      when: {
        en: 'A patient is newly diagnosed with type 1 diabetes or returning for follow-up.',
        ar: 'عند تشخيص مريض بالسكري من النوع الأول، أو خلال المتابعة الدورية.',
      },
      start: {
        en: 'Initiate multiple daily injections (basal/bolus) or continuous subcutaneous insulin infusion using insulin analogs.',
        ar: 'ابدأ بالحقن المتعددة (قاعدي/وجبات) أو مضخة الأنسولين باستخدام نظائر الأنسولين.',
      },
      followUp: {
        en: 'Follow up in 3-6 months to adjust insulin dosing, review self-monitoring data, and provide diabetes education.',
        ar: 'تابع المريض كل 3-6 أشهر لتعديل الجرعات، مراجعة قراءات السكر، وتقديم التثقيف.',
      },
      warn: {
        en: 'Human regular/NPH insulin has a higher risk of hypoglycemia and variability compared to modern analogs.',
        ar: 'الأنسولين البشري (العادي/NPH) يحمل خطراً أعلى لهبوط السكر وتذبذب القراءات مقارنة بنظائر الأنسولين.',
      },
    },
    sourceIds: ['pharmacologic-treatment'],
    tags: ['type 1 diabetes', 'insulin', 'CSII', 'MDI', 'analogs'],
  },
  {
    id: 'type2-pharmacology-core',
    group: 'weightPharmacology',
    title: {
      en: '9. Pharmacologic Therapy for Type 2 Diabetes',
      ar: '9. العلاج الدوائي للنوع الثاني من السكري',
    },
    summary: {
      en: 'Recommendations for type 2 diabetes pharmacotherapy, highlighting the use of GLP-1 RAs, dual GIP/GLP-1 RAs, and SGLT2 inhibitors to achieve glycemic, cardiovascular, and kidney goals.',
      ar: 'توصيات العلاج الدوائي للنوع الثاني من السكري، مع التركيز على استخدام محفزات GLP-1، محفزات GIP/GLP-1 المزدوجة، ومثبطات SGLT2 لتحقيق أهداف السكر والقلب والكلى.',
    },
    points: {
      en: [
        'ASCVD (High Risk/Established): Prescribe a GLP-1 RA or SGLT2i with proven CV benefit to reduce MACE, independent of baseline A1C or metformin use.',
        'Heart Failure: SGLT2 inhibitors are strictly recommended for all HF (both HFrEF and HFpEF). If HFpEF is accompanied by obesity, GLP-1/GIP agonists (like Semaglutide/Tirzepatide) also provide significant morbidity benefits.',
        'CKD: For eGFR 20-60 mL/min or albuminuria (UACR ≥200 mg/g), prioritize SGLT2i to slow progression. If SGLT2i is contraindicated, use a GLP-1 RA. For advanced CKD (eGFR <30), GLP-1 RA is preferred for glycemic control without hypoglycemia.',
        'MASLD/MASH: Prioritize GLP-1 RA, dual GIP/GLP-1 RA, or Pioglitazone for combined glycemic and liver fibrosis/steatohepatitis benefits.',
        'Insulin Initiation: Start basal insulin if A1C >10% (86 mmol/mol), BG ≥300 mg/dL, or symptoms of catabolism (weight loss, polyuria). Otherwise, GLP-1 RAs are preferred over insulin as the first injectable.',
        'Basal Titration: Start basal insulin at 10 units/day OR 0.1-0.2 units/kg/day. Titrate by 2 units every 3 days until fasting target is met without hypoglycemia.',
        'Prandial Initiation: If A1C remains above target despite basal insulin, add prandial insulin (4 units or 10% of basal dose) at the largest meal. Titrate by 1-2 units twice weekly.',
        'Step-Down Therapy: When starting insulin, CONTINUE Metformin and SGLT2/GLP-1 for weight and CV/kidney benefits. STOP Sulfonylureas or DPP-4 inhibitors to minimize hypoglycemia and redundancy.',
        'Avoid Combinations: Do NOT combine DPP-4 inhibitors with GLP-1 RA or GIP/GLP-1 RA.',
      ],
      ar: [
        'أمراض القلب (ASCVD): صِف GLP-1 أو SGLT2i ذات الفائدة المثبتة لتقليل الجلطات، بغض النظر عن مستوى التراكمي أو استخدام الميتفورمين.',
        'هبوط القلب (HF): مثبطات SGLT2 موصى بها بشدة لكلا النوعين (HFrEF و HFpEF). في حالات HFpEF المصحوبة بسمنة، توفر إبر GLP-1/GIP فوائد عظيمة للقلب.',
        'أمراض الكلى (CKD): إذا كان معدل الفلترة (eGFR) 20-60 أو يوجد زلال (UACR ≥200)، استخدم SGLT2i لإبطاء التدهور. للحالات المتقدمة (eGFR <30)، يفضل GLP-1 للتحكم بأمان دون هبوط.',
        'الكبد الدهني (MASH): الأولوية لإبر GLP-1 أو GIP/GLP-1 أو دواء بيوجليتازون لفوائدها المزدوجة للسكر وتليف الكبد.',
        'بدء الأنسولين: ابدأ الأنسولين القاعدي فوراً إذا التراكمي >10% أو السكر ≥300 أو توجد أعراض حادة (نزول وزن/تبول). عدا ذلك، إبر GLP-1 مفضلة كأول حقن.',
        'جرعة القاعدي (Basal): ابدأ بـ 10 وحدات أو (0.1-0.2 وحدة/كجم) يومياً. ارفع الجرعة بمقدار وحدتين كل 3 أيام حتى تصل للهدف الصباحي بدون هبوط.',
        'أنسولين الوجبات (Prandial): إذا ظل التراكمي مرتفعاً، أضف 4 وحدات (أو 10% من القاعدي) مع أكبر وجبة. ارفع الجرعة 1-2 وحدة مرتين أسبوعياً.',
        'إيقاف الأدوية (Step-down): عند بدء الأنسولين، استمر على الميتفورمين و GLP-1/SGLT2 لفوائدها. أوقف السلفونيل يوريا (لتجنب الهبوط) ومثبطات DPP-4.',
        'تجنب الدمج: لا تدمج أبداً بين مثبطات DPP-4 ومحفزات GLP-1 أو GIP.',
      ],
    },
    practiceNote: {
      en: 'Treatment in type 2 diabetes has shifted from simple glucose lowering to prioritizing cardiovascular and kidney risk reduction.',
      ar: 'تحول علاج السكري النوع الثاني من مجرد خفض السكر إلى التركيز على تقليل مخاطر القلب والكلى.',
    },
    details: [
      {
        title: { en: 'Medication Synergy', ar: 'تآزر الأدوية' },
        items: {
          en: [
            'SGLT2 inhibitors + GLP-1 RAs provide complementary benefits for CV and kidney outcomes.',
            'Continuing metformin and SGLT2/GLP-1 agents upon insulin initiation is highly recommended for ongoing cardiovascular, weight, and renal benefits.',
          ],
          ar: [
            'مثبطات SGLT2 مع محفزات GLP-1 تقدم فوائد تكاملية للقلب والكلى.',
            'الاستمرار على الميتفورمين وأدوية SGLT2/GLP-1 عند بدء الأنسولين يوصى به بشدة لاستمرار فوائدها للقلب والوزن والكلى.',
          ],
        },
      },
    ],
    quickDecision: {
      when: {
        en: 'A patient with type 2 diabetes requires initial or intensified pharmacological therapy.',
        ar: 'مريض سكري من النوع الثاني يحتاج إلى بدء أو تكثيف العلاج الدوائي.',
      },
      start: {
        en: 'Select agents based on comorbidities: SGLT2i/GLP-1 RA for ASCVD, HF, or CKD. Consider GLP-1/GIP agonists for robust weight loss.',
        ar: 'اختر الأدوية بناءً على الأمراض المصاحبة: SGLT2i/GLP-1 لأمراض القلب، هبوط القلب، الكلى. واعتبر GIP/GLP-1 لإنقاص قوي للوزن.',
      },
      followUp: {
        en: 'Reevaluate A1C, weight, and side effects in 3 months. Modify therapy without delay if targets are not met.',
        ar: 'أعد تقييم التراكمي، الوزن، والأعراض الجانبية بعد 3 أشهر. كثف العلاج بلا تأخير إن لم تُحقق الأهداف.',
      },
      warn: {
        en: 'Be vigilant about hypoglycemia risk when combining insulin secretagogues or insulin with other medications.',
        ar: 'احذر من خطر هبوط السكر عند دمج محفزات الإفراز (كالسلفونيل يوريا) أو الأنسولين مع أدوية أخرى.',
      },
    },
    sourceIds: ['pharmacologic-treatment'],
    tags: ['type 2 diabetes', 'GLP-1', 'SGLT2', 'GIP', 'heart failure', 'CKD', 'MASLD'],
  },
  {
    id: 'type2-pharmacology-general-special',
    group: 'weightPharmacology',
    title: {
      en: '9. General Principles and Special Situations in Glycemic Treatment',
      ar: '9. المبادئ العامة والحالات الخاصة في العلاج الدوائي',
    },
    summary: {
      en: 'General strategies for diabetes care including CGM use, insulin overbasalization, cost considerations, and medication management in specific scenarios like post-transplantation or immunotherapy.',
      ar: 'استراتيجيات عامة لرعاية السكري تشمل استخدام CGM، تجنب الجرعات القاعدية الزائدة، اعتبارات التكلفة، وإدارة الأدوية في حالات خاصة كبعد زراعة الأعضاء أو العلاج المناعي.',
    },
    points: {
      en: [
        'Overbasalization: Suspect overbasalization if basal dose is >0.5 units/kg/day, bedtime-to-morning differential is >50 mg/dL, or if there is recurrent hypoglycemia. Instead of pushing basal higher, add prandial insulin or GLP-1 RA.',
        'Cost Barriers: If cost is a primary barrier, Metformin, Pioglitazone (avoid in HF), newer generation Sulfonylureas (like Glimepiride/Gliclazide), and human insulins (NPH/Regular) are viable, cost-effective options.',
        'Compounded Drugs: Strictly avoid unapproved compounded GLP-1s or unauthorized formulations due to unknown dosing, efficacy, and sterility risks.',
        'Steroid-Induced Hyperglycemia: Matches the steroid kinetic profile. For morning Prednisone, consider NPH insulin given in the morning. Adjust therapy rapidly as steroid doses taper.',
        'Cancer Immunotherapy (Checkpoint Inhibitors): Can trigger autoimmune Type 1 diabetes and rapid DKA. Promptly test for ketones and start insulin. Do not use oral meds for new-onset acute hyperglycemia in these patients.',
        'Targeted Cancer Therapies (PI3K/mTOR Inhibitors): Frequently cause insulin resistance. Use Metformin or Pioglitazone for mild cases; insulin is required for severe hyperglycemia.',
        'Post-Transplant (PTDM): Insulin is the safest choice immediately post-op due to variable kidney function and steroid use. Once stable, noninsulin agents (e.g., SGLT2i, GLP-1 RA) can be used with careful kidney monitoring.',
      ],
      ar: [
        'أزمة الجرعة القاعدية (Overbasalization): توقف عن زيادة الأنسولين القاعدي إذا تجاوز 0.5 وحدة/كجم/يوم، أو كان الفارق بين سكر النوم والصباح >50 مجم، أو تكرر الهبوط. بدلاً من ذلك، أضف أنسولين وجبات أو إبرة GLP-1.',
        'بدائل منخفضة التكلفة: إذا كانت التكلفة عائقاً، يُنصح باستخدام ميتفورمين، بيوجليتازون (تجنبه في هبوط القلب)، سلفونيل يوريا الحديثة (جليمبيريد/جليكلازيد)، والأنسولين البشري (NPH/عادي).',
        'مخاطر الأدوية المركبة: يحظر استخدام أدوية GLP-1 المركّبة يدوياً (غير المعتمدة) نظراً لمخاطر العقم (Sterility) وعدم دقة الجرعات.',
        'كورتيزون وسكر الدم: استخدم علاجاً يطابق عمر الكورتيزون، مثل إعطاء (NPH) صباحاً ليتوافق مع جرعة (Prednisone) الصباحية. خفض جرعة السكر فوراً عند سحب الكورتيزون تجنباً للهبوط.',
        'العلاج المناعي للسرطان: قد يسبب تدمير البنكرياس (سكري نوع أول) وحدوث DKA سريع. افحص الكيتون وابدأ الأنسولين فوراً. الأقراص لا تنفع في هذه الحالة.',
        'العلاجات الموجهة (PI3K/mTOR): تسبب مقاومة أنسولين شديدة. استخدم ميتفورمين أو بيوجليتازون للحالات الخفيفة، والأنسولين للحالات الشديدة.',
        'بعد زراعة الأعضاء (PTDM): الأنسولين هو الخيار الآمن والمفضل في الأسابيع الأولى بسبب الكورتيزون وتذبذب الكلى. لاحقاً، يمكن استخدام الأقراص أو الإبر بحذر ومع المراقبة.',
      ],
    },
    practiceNote: {
      en: 'Consider the whole clinical picture: finances, technological capacity, and specific co-occurring medical conditions (cancer therapies, transplant, etc.) when managing diabetes.',
      ar: 'انظر للصورة الطبية الكاملة: الوضع المالي، القدرة التكنولوجية، والحالات الطبية المتزامنة (علاجات السرطان، زراعة الأعضاء، وغيرها).',
    },
    details: [
      {
        title: { en: 'SGLT2 Inhibitor DKA Risk', ar: 'خطر DKA مع مثبطات SGLT2' },
        items: {
          en: [
            'Ketogenic diets dramatically increase DKA risk with SGLT2 inhibitors.',
            'Blood ketone (beta-hydroxybutyrate) testing is preferred over urine testing.',
          ],
          ar: [
            'الحميات الكيتونية تزيد من خطر DKA بشكل كبير عند استخدام مثبطات SGLT2.',
            'فحص الكيتون في الدم (بيتا-هيدروكسي بيوتيريت) مفضل على فحص البول.',
          ],
        },
      },
    ],
    quickDecision: {
      when: {
        en: 'A patient is on glucocorticoids, cancer immunotherapy, or is post-transplant and develops hyperglycemia.',
        ar: 'مريض يتناول الكورتيزون، العلاج المناعي للسرطان، أو أجرى زراعة أعضاء، وظهر لديه ارتفاع في السكر.',
      },
      start: {
        en: 'Start insulin proactively for immunotherapy or immediate post-transplant settings. Use metformin for targeted cancer therapies if mild.',
        ar: 'ابدأ الأنسولين فوراً لمرضى العلاج المناعي أو بعد الزراعة مباشرة. للميتفورمين دور في العلاجات الموجهة إذا كان الارتفاع طفيفاً.',
      },
      followUp: {
        en: 'Monitor closely as glucocorticoid doses change or post-operative stress resolves.',
        ar: 'راقب السكر عن كثب مع تغير جرعات الكورتيزون أو زوال ضغط ما بعد العملية.',
      },
      warn: {
        en: 'Do not use compounded unapproved weight loss/diabetes drugs unless absolutely necessary and legally permissible, due to safety concerns.',
        ar: 'لا تستخدم الأدوية المركبة غير المعتمدة إلا للضرورة القصوى وضمن القانون، لمخاوف تتعلق بالسلامة.',
      },
    },
    sourceIds: ['pharmacologic-treatment'],
    tags: ['CGM', 'glucagon', 'cost', 'post-transplant', 'immunotherapy', 'glucocorticoids', 'SGLT2i', 'DKA'],
  }
];
