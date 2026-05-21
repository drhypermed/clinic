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
        'Diagnosis & Stigma: Screen for obesity using BMI annually. Use person-centered, nonjudgmental language and ensure privacy.',
        'Primary Goal: Weight management is a primary goal alongside glycemia. 5-7% loss improves glucose; >10% sustained loss can induce T2D remission.',
        'Intensive Interventions: Recommend programs with ≥16 sessions over 6 months targeting a 500-750 kcal/day deficit.',
        'Pharmacotherapy: GLP-1 or dual GIP/GLP-1 agonists (e.g., semaglutide, tirzepatide) are preferred due to high weight-loss efficacy and cardiovascular/kidney benefits.',
        'Chronic Treatment: View obesity as a chronic disease. Do not stop medications once weight is lost, as discontinuation causes regain.',
        'Medication Review: Minimize medications that cause weight gain. Switch to weight-neutral or weight-loss-promoting alternatives if possible.',
        'Metabolic Surgery: Consider for BMI ≥30 (≥27.5 for Asian populations). Monitor for post-op hypoglycemia using CGM.',
      ],
      ar: [
        'التشخيص والوصمة: افحص السمنة باستخدام مؤشر كتلة الجسم سنوياً. استخدم لغة خالية من الأحكام وحافظ على خصوصية المريض.',
        'هدف أساسي: إدارة الوزن مهمة كإدارة السكر. نزول 5-7% يحسن السكر؛ نزول >10% قد يؤدي لـ "هدأة" (Remission) النوع الثاني.',
        'التدخل المكثف: انصح ببرامج تشمل ≥16 جلسة في 6 أشهر لتقليل 500-750 سعرة حرارية يومياً.',
        'العلاج الدوائي: يُفضل استخدام محفزات GLP-1 أو GIP/GLP-1 (مثل سيماجلوتيد وتيرزيباتيد) لفعاليتها العالية في نزول الوزن وفوائدها للقلب.',
        'علاج مزمن: السمنة مرض مزمن. لا توقف الأدوية بعد نزول الوزن لأن إيقافها يؤدي لاستعادة الوزن المفقود.',
        'مراجعة الأدوية: قلل الأدوية التي تزيد الوزن (لأمراض أخرى) واستبدلها ببدائل لا تزيد الوزن متى أمكن.',
        'جراحات السمنة (الأيض): خيار إذا كان BMI ≥30 (أو ≥27.5 للآسيويين). راقب خطر الهبوط بعد العملية باستخدام CGM.',
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
        'Method: Treat most adults with Type 1 using automated insulin delivery (AID), continuous subcutaneous insulin infusion (CSII), or MDI (basal/bolus).',
        'Type of Insulin: Modern insulin analogs or inhaled insulin are strongly preferred over human insulins (NPH/Regular) to reduce hypoglycemia.',
        'Education: Teach patients to match prandial (mealtime) insulin to carbohydrate, fat, and protein intake, and to use correction doses.',
        'Monitoring: Reevaluate insulin regimens and patient injection techniques every 3-6 months.',
      ],
      ar: [
        'الوسيلة: عالج معظم البالغين (النوع الأول) بمضخات الأنسولين التلقائية (AID) أو الحقن المتعددة (قاعدي/وجبات).',
        'نوع الأنسولين: نظائر الأنسولين الحديثة (أو المستنشق) مفضلة بشدة على الأنسولين البشري (NPH/العادي) لتقليل الهبوط.',
        'التثقيف: علّم المريض مطابقة جرعة الوجبات مع كمية النشويات، الدهون، والبروتين، وكيفية حساب الجرعة التصحيحية.',
        'المتابعة: أعد تقييم خطة الأنسولين وطريقة الحقن كل 3-6 أشهر.',
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
        'ASCVD (High Risk/Established): Prescribe GLP-1 RA or SGLT2i with proven CV benefit, independent of baseline A1C.',
        'Heart Failure: SGLT2 inhibitors are strongly recommended for HF (both HFrEF and HFpEF). If HFpEF with obesity, GLP-1/GIP agonists are also beneficial.',
        'CKD: For eGFR 20-60 or albuminuria, prioritize SGLT2i or GLP-1 RA. For advanced CKD (eGFR <30), GLP-1 RA is preferred for safety.',
        'MASLD/MASH: Prioritize GLP-1 RA, dual GIP/GLP-1 RA, or pioglitazone for combined glycemic and liver benefits.',
        'Avoid Combinations: Do NOT combine DPP-4 inhibitors with GLP-1 RA or GIP/GLP-1 RA.',
        'Insulin Initiation: Start insulin if A1C >10% or BG ≥300 mg/dL. Otherwise, GLP-1 RAs are preferred over insulin as first injectable. If starting insulin, continue metformin and SGLT2i/GLP-1 RA for metabolic benefits.',
      ],
      ar: [
        'أمراض القلب (ASCVD): صِف محفزات GLP-1 أو SGLT2i ذات الفائدة القلبية المثبتة، بغض النظر عن مستوى التراكمي الأولي.',
        'هبوط القلب: مثبطات SGLT2 موصى بها بشدة لكلا النوعين (HFrEF و HFpEF). في حالات HFpEF مع سمنة، تفيد محفزات GLP-1/GIP أيضاً.',
        'أمراض الكلى: إذا كان eGFR 20-60 أو يوجد زلال، استخدم SGLT2i أو GLP-1. للحالات المتقدمة (<30)، GLP-1 هو المفضل لأمانه.',
        'الكبد الدهني (MASH): فضل استخدام GLP-1، أو GIP/GLP-1، أو بيوجليتازون لفوائدها للكبد.',
        'تجنب الدمج: لا تدمج بين مثبطات DPP-4 ومحفزات GLP-1 (أو GIP/GLP-1).',
        'بدء الأنسولين: ابدأ الأنسولين إذا كان التراكمي >10% أو السكر ≥300. عدا ذلك، إبر GLP-1 مفضلة على الأنسولين كبداية. عند إضافة الأنسولين، استمر على الميتفورمين و SGLT2i/GLP-1 لفوائدها المستمرة.',
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
        'Overbasalization: Suspect this if taking >0.5 units/kg/day of basal insulin, high bedtime-to-morning glucose discrepancies, or recurrent hypoglycemia. Do not just keep increasing basal insulin.',
        'Cost Barriers: If cost is an issue, consider metformin, sulfonylureas (caution: hypoglycemia), pioglitazone (caution: weight/HF), or NPH/Regular insulin.',
        'Compounded Drugs: Avoid non-FDA approved compounded products (e.g., compounded GLP-1s) due to safety and efficacy concerns.',
        'Steroid-Induced Hyperglycemia: Adjust therapies dynamically (e.g., NPH with morning steroids) as doses change.',
        'Cancer Immunotherapy / PI3K Inhibitors: Check for DKA in immunotherapy. Start insulin promptly if severely elevated. Use metformin for mTOR/PI3K induced hyperglycemia if mild.',
        'Post-Transplant (PTDM): Insulin is the safest choice immediately post-op. Noninsulin agents can be considered for long-term care.',
      ],
      ar: [
        'الجرعة القاعدية الزائدة (Overbasalization): اشتبه فيها إذا زادت الجرعة عن 0.5 وحدة/كجم، أو وجد تفاوت كبير بين قراءات النوم والصباح. لا تستمر بزيادة القاعدي بلا حدود.',
        'عوائق التكلفة: يمكن استخدام ميتفورمين، سلفونيل يوريا (بحذر من الهبوط)، بيوجليتازون (بحذر من الوزن/القلب)، والأنسولين البشري إذا كان السعر عائقاً.',
        'الأدوية المركّبة (Compounded): تجنب المستحضرات المركبة غير المعتمدة من FDA (مثل مركبات GLP-1) لمخاوف تتعلق بالسلامة.',
        'ارتفاع السكر بسبب الكورتيزون: عدّل الأدوية بشكل مرن (مثل إضافة NPH مع كورتيزون الصباح) بحسب الجرعات.',
        'العلاج المناعي للسرطان: افحص DKA عند استخدام العلاج المناعي وابدأ الأنسولين فوراً للحالات الشديدة. يمكن استخدام ميتفورمين مع أدوية PI3K/mTOR للحالات الخفيفة.',
        'بعد زراعة الأعضاء: الأنسولين هو الخيار الأكثر أماناً بعد العملية مباشرة. يمكن إضافة الأدوية الأخرى في المتابعة طويلة الأمد.',
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
