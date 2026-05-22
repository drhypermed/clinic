import type { GuidelineTopic, GuidelineVisualAsset } from '../../guidelinesData';

const adaVisual = (
  sourceId: string,
  page: number,
  label: string,
  en: string,
  ar: string,
): GuidelineVisualAsset => ({
  sourceId,
  page,
  label,
  imageSrc: `/guidelines-sources/ADA/2026/pages/${sourceId}/page_${page}.png`,
  title: { en, ar },
});

export const ADA_2026_CLINICAL_ESSENTIALS_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada2026-clinical-diagnosis-screening-numbers',
    group: 'diagnosisClassification',
    title: {
      en: 'Clinical Essentials: Diagnosis & Screening Numbers',
      ar: 'الخلاصة العملية: أرقام التشخيص والفحص',
    },
    summary: {
      en: 'High-yield diagnostic thresholds, screening intervals, and situations where A1C should not be trusted alone.',
      ar: 'أهم أرقام التشخيص، فترات الفحص، والمواقف التي لا يكفي فيها الاعتماد على HbA1c وحده.',
    },
    points: {
      en: [
        'Diagnose diabetes in nonpregnant adults by A1C >=6.5%, FPG >=126 mg/dL after at least 8 h fasting, 2-h PG >=200 mg/dL during 75-g OGTT, or random plasma glucose >=200 mg/dL with classic symptoms or hyperglycemic crisis.',
        'If hyperglycemia is not unequivocal, confirm diagnosis with two abnormal results, either from the same test on different days or from two different tests collected together.',
        'Prediabetes is A1C 5.7-6.4%, FPG 100-125 mg/dL, or 2-h PG 140-199 mg/dL during 75-g OGTT.',
        'Screen asymptomatic adults of any age if BMI >=25 kg/m2, or >=23 kg/m2 in Asian ancestry, plus at least one risk factor; otherwise begin screening at age 35 years.',
        'If screening is normal, repeat at least every 3 years; screen yearly in people with prediabetes and every 1-3 years lifelong after GDM.',
        'For OGTT screening, ensure at least 150 g/day carbohydrate intake for 3 days before testing.',
        'Use plasma glucose criteria rather than A1C when A1C may be misleading, including pregnancy, hemoglobin variants, G6PD deficiency, HIV, altered red cell turnover, kidney failure/dialysis, recent transfusion, or major A1C-glucose discordance.',
        'Presymptomatic type 1 diabetes screening uses islet autoantibodies to insulin, GAD, IA-2, and ZnT8; multiple confirmed autoantibodies require metabolic staging and specialist referral.',
        'Consider standardized islet autoantibodies in adults with overlapping type 1 features: younger age at diagnosis, unintentional weight loss, ketoacidosis, or short time to insulin.',
      ],
      ar: [
        'تشخيص السكري في غير الحوامل: HbA1c >=6.5% أو سكر صائم FPG >=126 mg/dL بعد صيام 8 ساعات على الأقل، أو سكر بعد ساعتين في 75-g OGTT >=200 mg/dL، أو سكر عشوائي >=200 mg/dL مع أعراض كلاسيكية أو أزمة فرط سكر.',
        'إذا لم تكن الزيادة واضحة بلا شك، أكد التشخيص بنتيجتين غير طبيعيتين: نفس الاختبار في يومين مختلفين أو اختبارين مختلفين في نفس الوقت.',
        'ما قبل السكري: HbA1c 5.7-6.4% أو FPG 100-125 mg/dL أو 2-h PG 140-199 mg/dL في OGTT.',
        'افحص البالغين بلا أعراض في أي عمر إذا كان BMI >=25 kg/m2، أو >=23 kg/m2 للآسيويين، مع عامل خطورة واحد على الأقل؛ وغير ذلك يبدأ الفحص من عمر 35 سنة.',
        'إذا كان الفحص طبيعيًا، أعده على الأقل كل 3 سنوات؛ وافحص سنويًا في prediabetes، وكل 1-3 سنوات مدى الحياة بعد سكري الحمل.',
        'قبل OGTT تأكد من تناول كربوهيدرات لا تقل عن 150 g/day لمدة 3 أيام.',
        'استخدم معايير الجلوكوز لا HbA1c وحده عند احتمال عدم دقة HbA1c: الحمل، اعتلالات الهيموجلوبين، G6PD deficiency، HIV، تغير دوران كريات الدم، الفشل الكلوي/الغسيل، نقل دم حديث، أو عدم توافق واضح بين HbA1c وقراءات السكر.',
        'فحص النوع الأول قبل ظهور الأعراض يعتمد على أجسام مضادة: insulin, GAD, IA-2, ZnT8؛ وجود عدة أجسام مضادة مؤكدة يستدعي staging وتحويلًا لمركز متخصص.',
        'اطلب islet autoantibodies للبالغين إذا كانت الصورة تتداخل مع النوع الأول: سن أصغر، نقص وزن غير مقصود، ketoacidosis، أو احتياج سريع للأنسولين.',
      ],
    },
    quickDecision: {
      when: {
        en: 'Use at diagnosis, annual screening visits, pregnancy/postpartum review, or whenever A1C does not match glucose readings.',
        ar: 'استخدمها عند التشخيص، زيارات الفحص السنوية، مراجعة الحمل/ما بعد الولادة، أو عند عدم توافق HbA1c مع قراءات السكر.',
      },
      start: {
        en: 'Confirm with laboratory A1C or plasma glucose criteria; do not rely on nonapproved point-of-care A1C for diagnosis.',
        ar: 'أكد التشخيص بمعمل HbA1c أو معايير الجلوكوز البلازمي؛ ولا تعتمد على HbA1c منزلي/نقطة رعاية غير معتمد للتشخيص.',
      },
      warn: {
        en: 'A normal or discordant A1C does not exclude diabetes when red-cell turnover, pregnancy, hemoglobin variants, HIV, or kidney failure may distort the result.',
        ar: 'HbA1c الطبيعي أو غير المتوافق لا ينفي السكري إذا كان هناك حمل، اضطراب هيموجلوبين، HIV، فشل كلوي، أو تغير في عمر كريات الدم.',
      },
    },
    sourceIds: ['diagnosis-classification'],
    tags: ['diagnosis', 'screening', 'A1C', 'FPG', 'OGTT', 'prediabetes', 'type 1 diabetes'],
  },
  {
    id: 'ada2026-clinical-prevention-and-annual-evaluation',
    group: 'preventionEvaluation',
    title: {
      en: 'Clinical Essentials: Prevention & Annual Evaluation',
      ar: 'الخلاصة العملية: الوقاية والتقييم السنوي',
    },
    summary: {
      en: 'The practical prevention prescription for prediabetes plus the annual diabetes review items that should not be missed.',
      ar: 'روشتة الوقاية العملية لمرحلة ما قبل السكري مع عناصر المراجعة السنوية التي لا يجب نسيانها.',
    },
    points: {
      en: [
        'For high-risk adults with overweight or obesity, refer to an intensive lifestyle program targeting at least 7% weight loss and at least 150 min/week moderate-intensity physical activity.',
        'Monitor people with prediabetes at least yearly for progression to diabetes.',
        'Consider metformin for prevention in high-risk adults, especially age 25-59 years, BMI >=35 kg/m2, FPG 110-125 mg/dL, A1C >=6.0%, or prior GDM.',
        'During chronic metformin use, periodically assess vitamin B12; risk is higher with anemia, neuropathy, long duration, higher dose such as >=1,500 mg/day, or concomitant PPI use.',
        'At the initial and annual comprehensive review, document diabetes type, complications, comorbidities, medications, hypoglycemia, weight/BMI, BP, smoking, sleep, dental care, vaccinations, psychosocial status, and barriers to care.',
        'Annual labs usually include A1C, lipid profile, serum creatinine/eGFR, urine albumin-to-creatinine ratio, liver-related risk assessment when indicated, and tests guided by medications and comorbidities.',
        'Screen for MASLD risk and fibrosis in appropriate people with diabetes or prediabetes, especially with obesity or cardiometabolic risk.',
        'Keep immunizations current according to age and risk, including influenza, COVID-19, pneumococcal, hepatitis B when indicated, zoster, RSV when eligible, and routine adult vaccines.',
      ],
      ar: [
        'للبالغين عاليي الخطورة مع زيادة وزن/سمنة: أحِل إلى برنامج مكثف لتغيير نمط الحياة بهدف نقص وزن >=7% ونشاط متوسط الشدة >=150 دقيقة/أسبوع.',
        'تابع مرضى prediabetes مرة سنويًا على الأقل لاكتشاف التحول للسكري.',
        'فكر في metformin للوقاية عند عاليي الخطورة، خصوصًا عمر 25-59 سنة، BMI >=35 kg/m2، FPG 110-125 mg/dL، HbA1c >=6.0%، أو تاريخ GDM.',
        'مع metformin المزمن، راقب فيتامين B12 دوريًا؛ الخطر أعلى مع الأنيميا، neuropathy، مدة طويلة، جرعة عالية مثل >=1,500 mg/day، أو استخدام PPI.',
        'في التقييم الأول والسنوي: وثق نوع السكري، المضاعفات، الأمراض المصاحبة، الأدوية، الهبوط، الوزن/BMI، الضغط، التدخين، النوم، الأسنان، التطعيمات، الحالة النفسية، وعوائق الرعاية.',
        'الفحوصات السنوية عادة تشمل HbA1c، الدهون، creatinine/eGFR، UACR، تقييم مخاطر الكبد عند اللزوم، وفحوصات حسب الأدوية والأمراض المصاحبة.',
        'قيّم خطر MASLD والتليف في مرضى السكري/ما قبل السكري المناسبين، خصوصًا مع السمنة أو عوامل الخطر القلبية الاستقلابية.',
        'حدّث التطعيمات حسب العمر والخطورة: influenza، COVID-19، pneumococcal، hepatitis B عند اللزوم، zoster، RSV عند الأهلية، وباقي تطعيمات البالغين.',
      ],
    },
    sourceIds: ['prevention-delay', 'comprehensive-evaluation'],
    tags: ['prevention', 'prediabetes', 'metformin', 'annual review', 'vaccines', 'MASLD'],
  },
  {
    id: 'ada2026-clinical-glycemic-goals-technology',
    group: 'behaviorsGoalsTech',
    title: {
      en: 'Clinical Essentials: Glycemic Goals, Hypoglycemia & Technology',
      ar: 'الخلاصة العملية: أهداف السكر والهبوط والتكنولوجيا',
    },
    summary: {
      en: 'Actionable outpatient glycemic targets, CGM metrics, hypoglycemia rules, and technology safety points.',
      ar: 'أهداف السكر العملية، مؤشرات CGM، قواعد الهبوط، ونقاط أمان التكنولوجيا.',
    },
    points: {
      en: [
        'Measure A1C at least twice yearly when stable and meeting goals; measure every 3 months, or more often when needed, if not meeting goals, after therapy changes, or with frequent severe hypo/hyperglycemia.',
        'For many nonpregnant adults, target A1C <7%; consider <6.5% only when safely achievable, and use less stringent goals with frailty, severe comorbidity, cognitive/functional limitations, or high hypoglycemia risk.',
        'Usual capillary glucose targets for many nonpregnant adults: premeal 80-130 mg/dL and peak postprandial <180 mg/dL.',
        'For CGM interpretation, prefer at least 14 days of data with at least 70% active sensor wear; usual goals are TIR 70-180 mg/dL >70%, TAR >180 <25%, TAR >250 <5%, TBR <70 <4%, and TBR <54 <1%.',
        'For older or high-risk adults, prioritize safety: TIR >50%, TBR <70 <1%, and minimize symptomatic or severe hypoglycemia.',
        'Hypoglycemia levels: Level 1 is <70 and >=54 mg/dL, Level 2 is <54 mg/dL, and Level 3 is severe cognitive/physical impairment requiring assistance.',
        'Treat conscious hypoglycemia with fast glucose/carbohydrate, recheck after 15 minutes, repeat if still low, and avoid high-fat/high-protein foods as the initial treatment.',
        'Prescribe glucagon for everyone using insulin or at high risk for hypoglycemia; teach family/caregivers and prefer ready-to-use preparations when available.',
        'Any Level 2 or Level 3 hypoglycemia should trigger treatment reevaluation, possible deintensification, education refresh, and review of driving/work safety.',
        'Offer CGM for people on insulin therapy and consider it when noninsulin therapy may cause hypoglycemia or CGM meaningfully improves management; keep a BGM backup and remove devices before MRI/CT/diathermy unless device labeling permits otherwise.',
      ],
      ar: [
        'قِس HbA1c مرتين سنويًا على الأقل إذا كان المريض مستقرًا ومحققًا للأهداف؛ وكل 3 أشهر أو أكثر عند عدم تحقيق الهدف، بعد تغيير العلاج، أو مع هبوط/ارتفاع شديد متكرر.',
        'لمعظم البالغين غير الحوامل: الهدف HbA1c <7%؛ يمكن <6.5% فقط إذا كان آمنًا، واستخدم أهدافًا أقل صرامة مع الهشاشة، أمراض شديدة، قصور معرفي/وظيفي، أو خطر هبوط عال.',
        'أهداف القياس المنزلي الشائعة: قبل الأكل 80-130 mg/dL وبعد الأكل في الذروة <180 mg/dL.',
        'لتفسير CGM: الأفضل بيانات 14 يومًا على الأقل مع sensor active >=70%؛ الأهداف المعتادة TIR 70-180 >70%، TAR >180 <25%، TAR >250 <5%، TBR <70 <4%، وTBR <54 <1%.',
        'لكبار السن أو عاليي الخطورة: الأولوية للأمان: TIR >50%، وTBR <70 <1%، وتقليل الهبوط العرضي أو الشديد.',
        'درجات الهبوط: Level 1 أقل من 70 وحتى 54 mg/dL، Level 2 أقل من 54 mg/dL، Level 3 هبوط شديد يحتاج مساعدة شخص آخر.',
        'علاج الهبوط مع وعي المريض: كربوهيدرات/جلوكوز سريع، أعد القياس بعد 15 دقيقة، وكرر إذا ظل منخفضًا؛ وتجنب الدهون/البروتين كعلاج أولي.',
        'اكتب glucagon لكل من يستخدم أنسولين أو لديه خطر هبوط عال؛ درب الأسرة/المرافقين وفضل التركيبات الجاهزة للاستخدام عند توفرها.',
        'أي Level 2 أو Level 3 hypoglycemia يستدعي مراجعة الخطة، احتمال تقليل العلاج، إعادة تعليم، ومراجعة أمان القيادة/العمل.',
        'اعرض CGM لمرضى الأنسولين وفكر فيه مع علاجات غير أنسولين قد تسبب هبوطًا أو عندما يحسن الإدارة؛ حافظ على BGM احتياطي وانزع الأجهزة قبل MRI/CT/diathermy ما لم تسمح تعليمات الجهاز.',
      ],
    },
    sourceIds: ['glycemic-goals', 'diabetes-technology'],
    tags: ['A1C', 'CGM', 'TIR', 'hypoglycemia', 'glucagon', 'technology'],
  },
  {
    id: 'ada2026-clinical-lifestyle-nutrition-exercise',
    group: 'behaviorsGoalsTech',
    title: {
      en: 'Clinical Essentials: Nutrition, Activity & Behavioral Care',
      ar: 'الخلاصة العملية: التغذية والنشاط والسلوكيات',
    },
    summary: {
      en: 'A concise visit checklist for DSMES, MNT, activity prescriptions, smoking, sleep, and psychosocial screening.',
      ar: 'قائمة زيارة مختصرة للتثقيف، التغذية العلاجية، النشاط، التدخين، النوم، والفحص النفسي الاجتماعي.',
    },
    points: {
      en: [
        'Offer diabetes self-management education and support at diagnosis, annually or when not meeting targets, when complications or life transitions occur, and when care needs change.',
        'Refer for individualized medical nutrition therapy; there is no single ideal carbohydrate, protein, and fat distribution for all people with diabetes.',
        'Use eating patterns that fit preferences and metabolic goals; emphasize nutrient-dense foods, minimize added sugars and refined grains, and avoid routine supplements for glycemic control unless deficiency exists.',
        'Limit sodium to <2,300 mg/day in most adults with diabetes and hypertension or cardiovascular risk.',
        'Adults should aim for at least 150 min/week moderate-to-vigorous aerobic activity, spread over at least 3 days/week with no more than 2 consecutive days without activity when feasible.',
        'Add resistance exercise 2-3 sessions/week on nonconsecutive days; older adults should also include flexibility and balance training 2-3 times/week.',
        'Break up prolonged sitting every 30 minutes with brief activity, especially in insulin-resistant or sedentary adults.',
        'Advise tobacco and e-cigarette cessation, screen for cannabis/substance risks, and assess sleep quality, sleep duration, and symptoms of obstructive sleep apnea.',
        'Screen for diabetes distress, depression, anxiety, disordered eating, cognitive impairment, and social needs when clinically indicated and at routine intervals.',
      ],
      ar: [
        'قدم DSMES عند التشخيص، سنويًا أو عند عدم تحقيق الأهداف، عند ظهور مضاعفات أو انتقالات حياتية، وعندما تتغير احتياجات الرعاية.',
        'أحِل إلى تغذية علاجية فردية؛ لا توجد نسبة مثالية واحدة للكربوهيدرات/البروتين/الدهون لكل مرضى السكري.',
        'اختر نمط غذاء مناسب لتفضيلات المريض وأهدافه الاستقلابية؛ ركز على أطعمة عالية القيمة الغذائية، قلل السكر المضاف والحبوب المكررة، ولا تستخدم مكملات روتينية لضبط السكر إلا مع نقص مثبت.',
        'قلل الصوديوم إلى <2,300 mg/day لمعظم البالغين مع السكري وارتفاع الضغط أو الخطورة القلبية.',
        'الهدف للبالغين: نشاط هوائي متوسط-شديد >=150 دقيقة/أسبوع موزعًا على 3 أيام/أسبوع على الأقل، ويفضل ألا يمر أكثر من يومين متتاليين بلا نشاط.',
        'أضف تمارين مقاومة 2-3 مرات/أسبوع في أيام غير متتالية؛ وكبار السن يحتاجون أيضًا مرونة وتوازن 2-3 مرات/أسبوع.',
        'اكسر الجلوس الطويل كل 30 دقيقة بنشاط قصير، خصوصًا مع مقاومة الأنسولين أو نمط الحياة الخامل.',
        'انصح بإيقاف التدخين والسجائر الإلكترونية، قيّم مخاطر cannabis/المواد، واسأل عن جودة النوم ومدته وأعراض OSA.',
        'افحص diabetes distress والاكتئاب والقلق واضطرابات الأكل والقصور المعرفي والاحتياجات الاجتماعية عند اللزوم وبفواصل منتظمة.',
      ],
    },
    sourceIds: ['health-behaviors'],
    tags: ['DSMES', 'nutrition', 'exercise', 'smoking', 'sleep', 'psychosocial'],
  },
  {
    id: 'ada2026-clinical-obesity-pharmacology-insulin',
    group: 'weightPharmacology',
    title: {
      en: 'Clinical Essentials: Weight, Pharmacology & Insulin',
      ar: 'الخلاصة العملية: الوزن والعلاج الدوائي والأنسولين',
    },
    summary: {
      en: 'Treatment-selection priorities for obesity, type 1 diabetes, type 2 diabetes, comorbidities, insulin starts, and drug-safety alerts.',
      ar: 'أولويات اختيار العلاج للسمنة، النوع الأول، النوع الثاني، الأمراض المصاحبة، بدء الأنسولين، وتحذيرات الأدوية.',
    },
    points: {
      en: [
        'Screen BMI and obesity-related anthropometric measures at least annually; during active weight treatment, monitor at least every 3 months.',
        'Weight loss of 5-7% improves glycemia and cardiovascular risk factors; sustained loss >10% usually adds greater benefits and may support type 2 diabetes remission.',
        'Consider metabolic surgery in type 2 diabetes with BMI >=30 kg/m2, or >=27.5 kg/m2 in Asian American individuals, when otherwise a good surgical candidate.',
        'Most adults with type 1 diabetes need basal plus prandial insulin by MDI or pump; insulin analogs are preferred over human insulin to reduce hypoglycemia risk when accessible.',
        'Teach carbohydrate matching, correction dosing, sick-day rules, physical-activity adjustments, ketone/DKA prevention, injection-site rotation, and pump failure backup.',
        'In type 2 diabetes with ASCVD or high ASCVD risk, include GLP-1 RA and/or SGLT2 inhibitor with demonstrated benefit irrespective of A1C.',
        'In type 2 diabetes with heart failure, use an SGLT2 inhibitor irrespective of A1C; in obesity with symptomatic HFpEF, consider dual GIP/GLP-1 RA or GLP-1 RA with outcome benefit.',
        'In type 2 diabetes with CKD, use SGLT2 inhibitor or GLP-1 RA with demonstrated benefit when eGFR is 20-60 mL/min/1.73 m2 and/or albuminuria; GLP-1 RA is preferred for glycemia when eGFR <30 or dialysis when suitable.',
        'Consider insulin in type 2 diabetes if symptomatic hyperglycemia is present or A1C >10% or glucose >=300 mg/dL; if insulin is used, combine with GLP-1 RA or dual GIP/GLP-1 RA when appropriate and reassess insulin dose.',
        'Do not combine DPP-4 inhibitor with GLP-1 RA or dual GIP/GLP-1 RA; when adding potent glucose-lowering therapy, reassess sulfonylurea, meglitinide, and insulin doses to reduce hypoglycemia.',
      ],
      ar: [
        'افحص BMI والقياسات المرتبطة بالسمنة مرة سنويًا على الأقل؛ وأثناء علاج الوزن النشط تابع كل 3 أشهر على الأقل.',
        'نقص وزن 5-7% يحسن السكر وعوامل الخطورة القلبية؛ ونقص مستمر >10% يعطي غالبًا فوائد أكبر وقد يساعد في remission للنوع الثاني.',
        'فكر في metabolic surgery للنوع الثاني عند BMI >=30 kg/m2، أو >=27.5 kg/m2 للآسيويين الأمريكيين، إذا كان المريض مناسبًا جراحيًا.',
        'معظم البالغين بالنوع الأول يحتاجون basal + prandial insulin عبر MDI أو pump؛ وتفضل insulin analogs على human insulin لتقليل الهبوط إذا كانت متاحة.',
        'درّب على حساب الكربوهيدرات، correction dose، قواعد أيام المرض، تعديل النشاط، منع الكيتون/DKA، تدوير مواضع الحقن، وخطة احتياطية عند تعطل المضخة.',
        'في النوع الثاني مع ASCVD أو خطورة ASCVD عالية: أدخل GLP-1 RA و/أو SGLT2 inhibitor مثبت الفائدة بغض النظر عن HbA1c.',
        'في النوع الثاني مع heart failure: استخدم SGLT2 inhibitor بغض النظر عن HbA1c؛ ومع السمنة وHFpEF عرضي فكر في dual GIP/GLP-1 RA أو GLP-1 RA مثبت الفائدة.',
        'في النوع الثاني مع CKD: استخدم SGLT2 inhibitor أو GLP-1 RA مثبت الفائدة عند eGFR 20-60 mL/min/1.73 m2 و/أو albuminuria؛ ويفضل GLP-1 RA لضبط السكر عند eGFR <30 أو dialysis إذا كان مناسبًا.',
        'فكر في الأنسولين للنوع الثاني إذا وجدت أعراض فرط سكر أو HbA1c >10% أو glucose >=300 mg/dL؛ وإذا استُخدم الأنسولين فاجمعه مع GLP-1 RA أو dual GIP/GLP-1 RA عند الملاءمة وراجع جرعة الأنسولين.',
        'لا تجمع DPP-4 inhibitor مع GLP-1 RA أو dual GIP/GLP-1 RA؛ وعند إضافة علاج قوي راجع جرعات sulfonylurea/meglitinide/insulin لتقليل الهبوط.',
      ],
    },
    sourceIds: ['obesity-weight', 'pharmacologic-treatment'],
    tags: ['obesity', 'GLP-1 RA', 'GIP', 'SGLT2', 'insulin', 'ASCVD', 'HF', 'CKD'],
  },
  {
    id: 'ada2026-clinical-cardiorenal-risk-management',
    group: 'complicationsRisk',
    title: {
      en: 'Clinical Essentials: Cardiovascular & Kidney Protection',
      ar: 'الخلاصة العملية: حماية القلب والكلى',
    },
    summary: {
      en: 'The key BP, lipid, antiplatelet, albuminuria, SGLT2 inhibitor, and finerenone thresholds.',
      ar: 'أهم عتبات الضغط والدهون ومضادات الصفائح والزلال وSGLT2 وfinerenone.',
    },
    points: {
      en: [
        'Measure BP at every routine visit. For most people with diabetes and hypertension, target <130/80 mmHg if safely attainable.',
        'Start pharmacologic BP therapy with one agent when confirmed BP is >=130/80 mmHg; start two different classes when BP is >=150/90 mmHg.',
        'Use ACE inhibitor or ARB first-line when albuminuria is present or CAD exists; titrate to maximum tolerated dose and do not combine ACE inhibitor plus ARB or direct renin inhibitor.',
        'Check eGFR and potassium at initiation and periodically when using ACE inhibitor, ARB, diuretic, or mineralocorticoid receptor antagonist; do not stop ACE/ARB for creatinine rise <=30% unless volume depletion or other concern exists.',
        'For age 40-75 years without ASCVD, use at least moderate-intensity statin; if higher risk, use high-intensity statin aiming LDL-C reduction >=50% and LDL-C <70 mg/dL.',
        'For established ASCVD, use high-intensity statin aiming LDL-C reduction >=50% and LDL-C <55 mg/dL; add ezetimibe or PCSK9 inhibitor if the LDL-C target is not reached.',
        'Use aspirin 75-162 mg/day for secondary prevention in ASCVD; primary prevention requires individualized shared decision-making because bleeding risk may outweigh benefit.',
        'Assess UACR and eGFR at least annually in type 1 diabetes duration >=5 years and in all type 2 diabetes; in CKD, monitor UACR/eGFR 1-4 times/year depending on stage.',
        'In type 2 diabetes with CKD, initiate SGLT2 inhibitor with kidney/CV benefit if eGFR >=20 mL/min/1.73 m2 and continue until kidney failure if tolerated.',
        'For CKD with albuminuria, use nonsteroidal MRA such as finerenone when eGFR >=25 mL/min/1.73 m2 and potassium is appropriate; check potassium 1 month after initiation.',
        'Refer to nephrology for rapidly rising albuminuria, rapidly falling eGFR, eGFR <30 mL/min/1.73 m2, uncertain cause, or difficult management.',
      ],
      ar: [
        'قِس الضغط في كل زيارة روتينية. لمعظم مرضى السكري مع ارتفاع الضغط، الهدف <130/80 mmHg إذا كان آمنًا.',
        'ابدأ دواء ضغط واحد عند تأكيد BP >=130/80 mmHg؛ وابدأ دواءين من فئتين مختلفتين إذا BP >=150/90 mmHg.',
        'استخدم ACE inhibitor أو ARB كخط أول عند وجود albuminuria أو CAD؛ ارفع لأقصى جرعة محتملة ولا تجمع ACE inhibitor + ARB أو direct renin inhibitor.',
        'راجع eGFR والبوتاسيوم عند البدء ودوريًا مع ACE inhibitor/ARB/diuretic/MRA؛ ولا توقف ACE/ARB لارتفاع creatinine <=30% إلا مع نقص حجم أو سبب مقلق.',
        'عمر 40-75 بدون ASCVD: استخدم statin متوسط الشدة على الأقل؛ ومع خطورة أعلى استخدم high-intensity بهدف خفض LDL-C >=50% والوصول إلى <70 mg/dL.',
        'مع ASCVD مثبت: high-intensity statin بهدف خفض LDL-C >=50% والوصول إلى <55 mg/dL؛ أضف ezetimibe أو PCSK9 inhibitor إذا لم يتحقق الهدف.',
        'استخدم aspirin 75-162 mg/day للوقاية الثانوية في ASCVD؛ أما الوقاية الأولية فتحتاج قرارًا فرديًا مشتركًا لأن خطر النزف قد يفوق الفائدة.',
        'قيّم UACR وeGFR سنويًا على الأقل في النوع الأول بعد مدة >=5 سنوات وفي كل النوع الثاني؛ ومع CKD راقب 1-4 مرات/سنة حسب المرحلة.',
        'في النوع الثاني مع CKD: ابدأ SGLT2 inhibitor مثبت الفائدة الكلوية/القلبية إذا eGFR >=20 mL/min/1.73 m2 واستمر حتى kidney failure إذا كان محتملًا.',
        'في CKD مع albuminuria: استخدم nonsteroidal MRA مثل finerenone إذا eGFR >=25 mL/min/1.73 m2 والبوتاسيوم مناسب؛ افحص البوتاسيوم بعد شهر من البدء.',
        'حوّل للكلى عند زيادة سريعة في albuminuria، انخفاض سريع في eGFR، eGFR <30، سبب غير واضح، أو صعوبة في الإدارة.',
      ],
    },
    sourceIds: ['cardiovascular-risk', 'kidney-disease'],
    tags: ['blood pressure', 'LDL', 'statin', 'aspirin', 'UACR', 'eGFR', 'SGLT2', 'finerenone'],
  },
  {
    id: 'ada2026-clinical-retina-neuropathy-foot',
    group: 'complicationsRisk',
    title: {
      en: 'Clinical Essentials: Retina, Neuropathy & Foot',
      ar: 'الخلاصة العملية: الشبكية والأعصاب والقدم',
    },
    summary: {
      en: 'Screening intervals, red flags, and referral rules for microvascular and foot complications.',
      ar: 'مواعيد الفحص، علامات الخطر، وقواعد التحويل لمضاعفات الشبكية والأعصاب والقدم.',
    },
    points: {
      en: [
        'Eye screening: type 1 diabetes gets an initial dilated comprehensive eye exam 5 years after onset; type 2 diabetes gets it at diagnosis.',
        'If one or more annual eye exams show no retinopathy and glycemic indicators are at goal, screening every 1-2 years may be considered; if retinopathy is present, repeat at least annually and more often if progressing or sight-threatening.',
        'Before pregnancy or in the first trimester, people with preexisting type 1 or type 2 diabetes need an eye exam; monitor every trimester and for 1 year postpartum as indicated by retinopathy severity.',
        'Refer promptly for any diabetic macular edema, moderate or worse NPDR, or any PDR to an ophthalmologist experienced in diabetic retinopathy.',
        'Screen for peripheral neuropathy at diagnosis of type 2 diabetes and 5 years after type 1 diagnosis, then at least annually.',
        'Neuropathy exam includes history plus temperature or pinprick, vibration with 128-Hz tuning fork, and annual 10-g monofilament testing to identify feet at risk.',
        'Initial painful neuropathy options include gabapentinoids, SNRIs, TCAs, and sodium-channel blockers; avoid opioids, including tramadol/tapentadol, except in rare circumstances.',
        'Perform a comprehensive foot exam at least annually; include skin, deformities, neurologic assessment, and vascular assessment with leg/foot pulses.',
        'Inspect feet at every visit in people with sensory loss, prior ulcer, or prior amputation; obtain ABI/toe pressures and vascular assessment when PAD symptoms or decreased/absent pulses exist.',
        'Foot risk follow-up: category 0 annually, category 1 every 6-12 months, category 2 every 3-6 months, and category 3 every 1-3 months.',
      ],
      ar: [
        'فحص العين: النوع الأول يحتاج فحص قاع عين شامل بعد 5 سنوات من البداية؛ والنوع الثاني عند التشخيص.',
        'إذا كانت فحوصات سنوية واحدة أو أكثر بلا retinopathy والسكر ضمن الهدف، يمكن الفحص كل 1-2 سنة؛ ومع وجود retinopathy يعاد على الأقل سنويًا وأكثر عند التدهور أو تهديد البصر.',
        'قبل الحمل أو في الثلث الأول، مريضة السكري النوع الأول/الثاني تحتاج فحص عين؛ وتتابع كل trimester ولمدة سنة بعد الولادة حسب شدة retinopathy.',
        'حوّل سريعًا لأي diabetic macular edema أو moderate/worse NPDR أو أي PDR إلى طبيب عيون متمرس في diabetic retinopathy.',
        'افحص neuropathy عند تشخيص النوع الثاني وبعد 5 سنوات من تشخيص النوع الأول، ثم سنويًا على الأقل.',
        'فحص neuropathy يشمل تاريخ مرضي + حرارة أو pinprick، اهتزاز 128-Hz tuning fork، و10-g monofilament سنويًا لتحديد القدم المعرضة للقرح.',
        'خيارات ألم neuropathy الأولى: gabapentinoids، SNRIs، TCAs، sodium-channel blockers؛ وتجنب opioids بما فيها tramadol/tapentadol إلا نادرًا.',
        'افحص القدم شاملًا سنويًا على الأقل: الجلد، التشوهات، الأعصاب، والأوعية مع نبضات الساق/القدم.',
        'افحص القدم في كل زيارة عند sensory loss أو قرحة سابقة أو بتر سابق؛ واطلب ABI/toe pressures وتقييم أوعية عند أعراض PAD أو ضعف/غياب النبض.',
        'متابعة خطر القدم: category 0 سنويًا، category 1 كل 6-12 شهرًا، category 2 كل 3-6 أشهر، category 3 كل 1-3 أشهر.',
      ],
    },
    sourceIds: ['retina-neuro-foot'],
    tags: ['retinopathy', 'neuropathy', 'foot care', 'monofilament', 'PAD', 'PDR'],
  },
  {
    id: 'ada2026-clinical-pregnancy-children-older-adults',
    group: 'specialPopulations',
    title: {
      en: 'Clinical Essentials: Pregnancy, Children & Older Adults',
      ar: 'الخلاصة العملية: الحمل والأطفال وكبار السن',
    },
    summary: {
      en: 'Practical targets and safety priorities for pregnancy, pediatrics, and older adults.',
      ar: 'الأهداف العملية وأولويات الأمان للحمل والأطفال وكبار السن.',
    },
    points: {
      en: [
        'Before pregnancy, discuss family planning and use effective contraception until treatment and A1C are optimized; aim preconception A1C <6.5% if safely achievable.',
        'Routine preconception folic acid supplementation is 400-800 micrograms/day.',
        'Pregnancy glucose targets: fasting <95 mg/dL and either 1-h postprandial <140 mg/dL or 2-h postprandial <120 mg/dL.',
        'Pregnancy A1C goal is ideally <6% if achievable without significant hypoglycemia, but may be relaxed to <7% to prevent hypoglycemia.',
        'In pregnancy with chronic hypertension, initiate or titrate therapy at BP threshold 140/90 mmHg; deintensify if BP <90/60 mmHg.',
        'After GDM, screen at 4-12 weeks postpartum with a 75-g OGTT using nonpregnancy diagnostic criteria, then continue lifelong screening every 1-3 years.',
        'Older adults: healthy status usually A1C <7.0-7.5%; complex/intermediate health usually <8%; very complex/poor health should prioritize avoiding hypoglycemia and symptomatic hyperglycemia over a numeric A1C target.',
        'Children and adolescents: individualize A1C, but <7% is appropriate for many; use less stringent goals when hypoglycemia risk, limited resources, or safety concerns are prominent.',
        'All pediatric care should include developmentally appropriate DSMES, family involvement, psychosocial screening, school/daycare plans, and transition planning to adult care.',
      ],
      ar: [
        'قبل الحمل: ناقش تنظيم الأسرة واستخدم وسيلة منع حمل فعالة حتى يتحسن العلاج وHbA1c؛ الهدف قبل الحمل HbA1c <6.5% إذا كان آمنًا.',
        'جرعة folic acid الروتينية قبل الحمل: 400-800 micrograms/day.',
        'أهداف السكر في الحمل: fasting <95 mg/dL، وبعد الأكل إما 1-h <140 mg/dL أو 2-h <120 mg/dL.',
        'هدف HbA1c في الحمل مثاليًا <6% إذا أمكن بلا هبوط مهم، ويمكن تخفيفه إلى <7% لمنع الهبوط.',
        'في الحمل مع chronic hypertension: ابدأ/عدّل العلاج عند BP 140/90 mmHg؛ وخفف العلاج إذا BP <90/60 mmHg.',
        'بعد GDM: افحص بعد 4-12 أسبوعًا postpartum باستخدام 75-g OGTT ومعايير غير الحوامل، ثم فحص مدى الحياة كل 1-3 سنوات.',
        'كبار السن: الصحي غالبًا HbA1c <7.0-7.5%؛ المعقد/المتوسط غالبًا <8%؛ شديد التعقيد/صحة ضعيفة نركز على منع الهبوط وفرط السكر العرضي أكثر من رقم HbA1c.',
        'الأطفال والمراهقون: خصص هدف HbA1c، لكن <7% مناسب لكثيرين؛ واستخدم هدفًا أقل صرامة عند خطر الهبوط أو ضعف الموارد أو مخاوف الأمان.',
        'رعاية الأطفال يجب أن تشمل DSMES مناسب للعمر، مشاركة الأسرة، فحص نفسي اجتماعي، خطة مدرسة/حضانة، وخطة انتقال لرعاية البالغين.',
      ],
    },
    sourceIds: ['pregnancy-management', 'children-adolescents', 'older-adults'],
    tags: ['pregnancy', 'GDM', 'postpartum', 'children', 'older adults', 'A1C'],
  },
  {
    id: 'ada2026-clinical-hospital-dka-hhs',
    group: 'specialPopulations',
    title: {
      en: 'Clinical Essentials: Hospital, Perioperative Care, DKA & HHS',
      ar: 'الخلاصة العملية: المستشفى والجراحة وDKA/HHS',
    },
    summary: {
      en: 'Inpatient glucose thresholds, perioperative targets, and crisis diagnostic criteria.',
      ar: 'عتبات السكر داخل المستشفى، أهداف الجراحة، ومعايير تشخيص أزمات DKA/HHS.',
    },
    points: {
      en: [
        'On admission, check A1C in all people with diabetes or hyperglycemia, defined as random glucose >140 mg/dL, if no A1C is available from the prior 3 months.',
        'Initiate or intensify insulin/therapy for persistent hyperglycemia >=180 mg/dL confirmed twice within 24 hours in most ICU and non-ICU patients.',
        'After treatment starts, ICU glucose goal is usually 140-180 mg/dL; non-ICU goal is 100-180 mg/dL if achievable without significant hypoglycemia.',
        'Use IV insulin for critically ill patients; for noncritically ill patients with poor/no oral intake use basal or basal plus correction; with adequate intake use basal-prandial-correction.',
        'Avoid correction-only or sliding-scale insulin without basal insulin for most hospitalized patients.',
        'Elective surgery: aim preoperative A1C <8% within 3 months; 14-day GMI <8% and/or TIR >50% can also support readiness.',
        'Perioperative glucose target is 100-180 mg/dL before, during, and after surgery, individualized for procedure and hypoglycemia risk.',
        'DKA criteria: glucose >=200 mg/dL or prior diabetes plus beta-hydroxybutyrate >=3.0 mmol/L or urine ketone >=2+, with pH <7.3 and/or bicarbonate <18 mmol/L.',
        'Euglycemic DKA is glucose <200 mg/dL with ketosis and metabolic acidosis; suspect it especially with SGLT2 inhibitors, pregnancy, fasting, illness, or perioperative states.',
        'HHS criteria: glucose >=600 mg/dL, effective osmolality >300 mOsm/kg or total osmolality >320 mOsm/kg, beta-hydroxybutyrate <3.0 mmol/L or urine ketone <2+, pH >=7.3, and bicarbonate >=15 mmol/L.',
        'Treat DKA/HHS with IV fluids, insulin, electrolytes, frequent monitoring, treatment of the precipitating cause, and a timely bridged transition to maintenance subcutaneous insulin.',
      ],
      ar: [
        'عند الدخول: افحص HbA1c لكل مريض سكري أو hyperglycemia، أي سكر عشوائي >140 mg/dL، إذا لم توجد نتيجة HbA1c خلال آخر 3 أشهر.',
        'ابدأ أو كثف الأنسولين/العلاج عند hyperglycemia مستمر >=180 mg/dL مؤكد مرتين خلال 24 ساعة في أغلب مرضى ICU وغير ICU.',
        'بعد بدء العلاج: هدف ICU غالبًا 140-180 mg/dL؛ وهدف غير ICU هو 100-180 mg/dL إذا أمكن بلا هبوط مهم.',
        'استخدم IV insulin للمرضى الحرجين؛ وغير الحرجين مع أكل ضعيف/لا أكل: basal أو basal + correction؛ ومع أكل كافٍ: basal-prandial-correction.',
        'تجنب correction-only أو sliding scale بلا basal insulin لمعظم مرضى المستشفى.',
        'الجراحة الاختيارية: الهدف HbA1c <8% خلال 3 أشهر؛ ويمكن استخدام 14-day GMI <8% و/أو TIR >50% كدليل جاهزية.',
        'هدف السكر حول الجراحة 100-180 mg/dL قبل وأثناء وبعد الجراحة، مع تخصيصه حسب العملية وخطر الهبوط.',
        'معايير DKA: glucose >=200 mg/dL أو تاريخ سكري + beta-hydroxybutyrate >=3.0 mmol/L أو urine ketone >=2+، مع pH <7.3 و/أو bicarbonate <18 mmol/L.',
        'Euglycemic DKA: glucose <200 mg/dL مع ketosis وmetabolic acidosis؛ اشتبه به خصوصًا مع SGLT2 inhibitors، الحمل، الصيام، المرض، أو فترة الجراحة.',
        'معايير HHS: glucose >=600 mg/dL، effective osmolality >300 أو total osmolality >320 mOsm/kg، beta-hydroxybutyrate <3.0 أو urine ketone <2+، pH >=7.3، وbicarbonate >=15 mmol/L.',
        'علاج DKA/HHS: سوائل وريدية، أنسولين، إلكتروليتات، متابعة متقاربة، علاج السبب المحفز، وانتقال bridged في الوقت المناسب إلى أنسولين تحت الجلد مستمر.',
      ],
    },
    sourceIds: ['hospital-care'],
    tags: ['hospital', 'perioperative', 'DKA', 'HHS', 'insulin', 'hyperglycemia'],
  },
];

export const ADA_2026_TOPIC_VISUALS: Record<string, GuidelineVisualAsset[]> = {
  'population-health-core': [
    adaVisual('improving-care', 4, 'Table 1.1', 'Care team members across diabetes subpopulations', 'فريق الرعاية حسب فئات مرضى السكري'),
  ],
  'care-models-teams': [
    adaVisual('improving-care', 4, 'Table 1.1', 'Person-centered diabetes care team', 'فريق رعاية السكري المتمركز حول المريض'),
  ],
  'patient-subgroups': [
    adaVisual('improving-care', 4, 'Table 1.1', 'Unique care considerations by subpopulation', 'اعتبارات الرعاية حسب الفئات المختلفة'),
  ],
  'quality-improvement': [
    adaVisual('improving-care', 4, 'Table 1.1', 'Team-based care context for quality improvement', 'سياق الفريق متعدد التخصصات لتحسين الجودة'),
  ],
  'sdoh-disparities': [
    adaVisual('improving-care', 4, 'Table 1.1', 'Social needs and subgroup care considerations', 'الاحتياجات الاجتماعية واعتبارات الفئات المختلفة'),
  ],
  'diagnostic-criteria': [
    adaVisual('diagnosis-classification', 2, 'Tables 2.1-2.2', 'Diabetes and prediabetes diagnostic criteria', 'معايير تشخيص السكري وما قبل السكري'),
    adaVisual('diagnosis-classification', 3, 'Table 2.3', 'Interpreting glucose and A1C tests', 'تفسير اختبارات الجلوكوز و HbA1c'),
  ],
  'classification-type1': [
    adaVisual('diagnosis-classification', 5, 'Figure 2.1', 'Suspected type 1 diabetes workup in adults', 'تقييم الاشتباه في النوع الأول عند البالغين'),
    adaVisual('diagnosis-classification', 6, 'Table 2.4', 'Stages of type 1 diabetes', 'مراحل النوع الأول من السكري'),
  ],
  'prediabetes-type2-screening': [
    adaVisual('diagnosis-classification', 9, 'Table 2.5', 'Adult screening criteria for diabetes and prediabetes', 'معايير فحص البالغين للسكري وما قبل السكري'),
    adaVisual('diagnosis-classification', 10, 'Table 2.6', 'Youth risk-based screening criteria', 'معايير فحص الأطفال والمراهقين حسب الخطورة'),
  ],
  'medication-disease-screening': [
    adaVisual('diagnosis-classification', 3, 'Table 2.3', 'When A1C and glucose interpretation can be distorted', 'متى قد يكون تفسير HbA1c أو الجلوكوز مضللًا'),
  ],
  'monogenic-diabetes': [
    adaVisual('diagnosis-classification', 16, 'Table 2.7', 'Common causes of monogenic diabetes', 'أشيع أسباب السكري أحادي الجين'),
  ],
  'gdm-diagnosis': [
    adaVisual('diagnosis-classification', 17, 'Table 2.8', 'Screening for and diagnosis of GDM', 'فحص وتشخيص سكري الحمل'),
  ],
  'comprehensive-evaluation-full': [
    adaVisual('comprehensive-evaluation', 4, 'Table 4.1', 'Comprehensive diabetes medical evaluation', 'التقييم الطبي الشامل للسكري'),
    adaVisual('comprehensive-evaluation', 6, 'Table 4.2', 'Assessment, planning, and referral essentials', 'أساسيات التقييم والتخطيط والتحويل'),
    adaVisual('comprehensive-evaluation', 7, 'Table 4.3', 'Highly recommended immunizations', 'التطعيمات المهمة لمرضى السكري'),
    adaVisual('comprehensive-evaluation', 17, 'Figure 4.2', 'MASLD fibrosis risk stratification', 'تصنيف خطر تليف الكبد في MASLD'),
  ],
  'prevention-delay-full': [
    adaVisual('prevention-delay', 2, 'Section 3 page 2', 'Lifestyle prevention recommendations and DPP targets', 'توصيات الوقاية بنمط الحياة وأهداف DPP'),
    adaVisual('prevention-delay', 4, 'Section 3 page 4', 'Metformin prevention and B12 monitoring recommendations', 'توصيات metformin للوقاية ومتابعة B12'),
  ],
  'health-behaviors-well-being': [
    adaVisual('health-behaviors', 5, 'Table 5.1', 'Nutrition recommendations', 'توصيات التغذية'),
    adaVisual('health-behaviors', 6, 'Table 5.2', 'Nutrition behaviors to encourage', 'السلوكيات الغذائية المشجعة'),
    adaVisual('health-behaviors', 13, 'Table 5.3', 'Fasting risk calculation', 'حساب خطورة الصيام'),
    adaVisual('health-behaviors', 15, 'Table 5.4', 'Medication changes during fasting', 'تعديل الأدوية أثناء الصيام'),
    adaVisual('health-behaviors', 18, 'Figure 5.2', '24-hour physical behaviors', 'سلوكيات الحركة خلال 24 ساعة'),
    adaVisual('health-behaviors', 23, 'Table 5.5', 'Behavioral health referral situations', 'متى يحتاج المريض لتحويل للصحة النفسية'),
  ],
  'glycemic-goals-hypoglycemia-full': [
    adaVisual('glycemic-goals', 3, 'Table 6.2', 'CGM metrics for clinical care', 'مؤشرات CGM للرعاية السريرية'),
    adaVisual('glycemic-goals', 4, 'Table 6.3', 'Glycemic goals for many nonpregnant adults', 'أهداف السكر لمعظم البالغين غير الحوامل'),
    adaVisual('glycemic-goals', 8, 'Table 6.4', 'Hypoglycemia classification', 'تصنيف هبوط السكر'),
    adaVisual('glycemic-goals', 13, 'Table 6.8', 'Hyperglycemic crisis risk factors', 'عوامل خطر أزمات فرط السكر'),
  ],
  'diabetes-technology-full': [
    adaVisual('diabetes-technology', 4, 'Table 7.1', 'Glucose meter accuracy standards', 'معايير دقة أجهزة قياس السكر'),
    adaVisual('diabetes-technology', 6, 'Table 7.3', 'CGM device types', 'أنواع أجهزة CGM'),
    adaVisual('diabetes-technology', 7, 'Table 7.4', 'CGM and meter interfering substances', 'المواد التي تتداخل مع قراءات الأجهزة'),
  ],
  'obesity-weight-management-full': [
    adaVisual('obesity-weight', 9, 'Table 8.2', 'Obesity pharmacotherapy doses and costs', 'جرعات وتكاليف أدوية السمنة'),
  ],
  'type1-pharmacology': [
    adaVisual('pharmacologic-treatment', 2, 'Figure 9.1', 'Insulin plan choices in type 1 diabetes', 'اختيارات خطط الأنسولين في النوع الأول'),
    adaVisual('pharmacologic-treatment', 6, 'Figure 9.2', 'Type 1 insulin initiation and adjustment', 'بدء وتعديل أنسولين النوع الأول'),
    adaVisual('pharmacologic-treatment', 8, 'Figure 9.3', 'Beta-cell replacement therapy indications', 'دواعي علاج استبدال خلايا بيتا'),
  ],
  'type2-pharmacology-core': [
    adaVisual('pharmacologic-treatment', 9, 'Figure 9.4', 'Type 2 glucose-lowering medication algorithm', 'خوارزمية أدوية النوع الثاني'),
    adaVisual('pharmacologic-treatment', 16, 'Figure 9.5', 'Intensifying to injectable therapies', 'تصعيد العلاج إلى الحقن'),
  ],
  'type2-pharmacology-general-special': [
    adaVisual('pharmacologic-treatment', 21, 'Table 9.3', 'Noninsulin medication maximum doses', 'الجرعات القصوى للأدوية غير الأنسولين'),
    adaVisual('pharmacologic-treatment', 22, 'Table 9.4', 'Insulin product cost table', 'جدول منتجات الأنسولين'),
  ],
  'cvd-hypertension': [
    adaVisual('cardiovascular-risk', 5, 'Figure 10.2', 'Hypertension treatment in diabetes', 'علاج ارتفاع الضغط في السكري'),
  ],
  'cvd-lipids-antiplatelet': [
    adaVisual('cardiovascular-risk', 9, 'Table 10.1', 'High- and moderate-intensity statin therapy', 'جرعات الستاتين عالية ومتوسطة الشدة'),
    adaVisual('cardiovascular-risk', 10, 'Figures 10.3-10.4', 'Primary and secondary ASCVD lipid prevention', 'وقاية ASCVD الأولية والثانوية بالدهون'),
    adaVisual('cardiovascular-risk', 22, 'Figure 10.6', 'ASCVD prevention in type 2 diabetes', 'وقاية ASCVD في النوع الثاني'),
  ],
  'cvd-heart-failure-screening': [
    adaVisual('cardiovascular-risk', 19, 'Figure 10.5', 'Heart failure prevention and treatment', 'وقاية وعلاج فشل القلب'),
    adaVisual('cardiovascular-risk', 22, 'Figure 10.6', 'ASCVD prevention in type 2 diabetes', 'وقاية ASCVD في النوع الثاني'),
  ],
  'ckd-management': [
    adaVisual('kidney-disease', 2, 'Figure 11.1', 'CKD risk and monitoring frequency', 'خطورة CKD ومعدل المتابعة'),
    adaVisual('kidney-disease', 3, 'Table 11.1', 'When to consider nondiabetic kidney disease', 'متى نشتبه في مرض كلوي غير سكري'),
    adaVisual('kidney-disease', 4, 'Tables 11.2-11.3', 'CKD complications and albuminuria interventions', 'مضاعفات CKD وتدخلات خفض الزلال'),
    adaVisual('kidney-disease', 7, 'Figure 11.2', 'Holistic CKD treatment approach', 'النهج الشامل لعلاج CKD'),
  ],
  'retinopathy-care': [
    adaVisual('retina-neuro-foot', 2, 'Section 12 page 2', 'Retinopathy screening and pregnancy eye care recommendations', 'توصيات فحص الشبكية ورعاية العين في الحمل'),
  ],
  'neuropathy-care': [
    adaVisual('retina-neuro-foot', 5, 'Section 12 page 5', 'Neuropathy screening recommendations', 'توصيات فحص الاعتلال العصبي'),
  ],
  'foot-care': [
    adaVisual('retina-neuro-foot', 9, 'Table 12.1', 'Diabetic foot risk categories and screening frequency', 'تصنيف خطورة القدم ومعدل الفحص'),
  ],
  'older-adults': [
    adaVisual('older-adults', 2, 'Figure 13.1', '4Ms framework in older adults', 'إطار 4Ms لكبار السن'),
    adaVisual('older-adults', 11, 'Figure 13.2', 'Assessing treatment-plan difficulty', 'تقييم صعوبة خطة العلاج'),
    adaVisual('older-adults', 13, 'Figure 13.3', 'Insulin simplification in older adults', 'تبسيط الأنسولين لكبار السن'),
    adaVisual('older-adults', 14, 'Table 13.3', 'Treatment simplification and deintensification', 'تبسيط وتقليل العلاج'),
  ],
  'children-type2': [
    adaVisual('children-adolescents', 4, 'Figure 14.1', 'New-onset youth diabetes with suspected type 2 diabetes', 'سكري حديث في الأطفال مع اشتباه النوع الثاني'),
  ],
  'children-dsmes-psychosocial': [
    adaVisual('children-adolescents', 2, 'Section 14 page 2', 'Pediatric DSMES recommendation', 'توصيات DSMES للأطفال والمراهقين'),
    adaVisual('children-adolescents', 6, 'Section 14 page 6', 'Pediatric technology and A1C goals', 'التكنولوجيا وأهداف HbA1c للأطفال'),
  ],
  'children-type1': [
    adaVisual('children-adolescents', 6, 'Section 14 page 6', 'Pediatric type 1 technology and A1C goals', 'تكنولوجيا وأهداف النوع الأول للأطفال'),
  ],
  'children-complications': [
    adaVisual('children-adolescents', 13, 'Section 14 page 13', 'Pediatric complication screening recommendations', 'توصيات فحص مضاعفات الأطفال'),
  ],
  'children-transition': [
    adaVisual('children-adolescents', 17, 'Section 14 page 17', 'Transition to adult care recommendations', 'توصيات الانتقال لرعاية البالغين'),
  ],
  'pregnancy-preconception': [
    adaVisual('pregnancy-management', 3, 'Table 15.1', 'Preconception care checklist', 'قائمة رعاية ما قبل الحمل'),
  ],
  'pregnancy-glycemic-targets': [
    adaVisual('pregnancy-management', 5, 'Table 15.2', 'Blood glucose goals in pregnancy', 'أهداف السكر في الحمل'),
  ],
  'pregnancy-management': [
    adaVisual('pregnancy-management', 5, 'Table 15.2', 'Blood glucose goals in pregnancy', 'أهداف السكر في الحمل'),
  ],
  'pregnancy-complications-meds': [
    adaVisual('pregnancy-management', 3, 'Table 15.1', 'Preconception safety checklist', 'قائمة أمان ما قبل الحمل'),
  ],
  'pregnancy-postpartum': [
    adaVisual('pregnancy-management', 3, 'Table 15.1', 'Preconception and postpartum care context', 'سياق رعاية ما قبل الحمل وما بعد الولادة'),
  ],
  'hospital-dka-hhs-discharge': [
    adaVisual('hospital-care', 10, 'Figure 16.1', 'DKA and HHS treatment pathways', 'مسارات علاج DKA و HHS'),
    adaVisual('hospital-care', 11, 'Tables 16.1-16.2', 'DKA/HHS diagnostic criteria and presentation', 'معايير وتشخيص DKA/HHS'),
  ],
  'hospital-admission-goals': [
    adaVisual('hospital-care', 2, 'Section 16 page 2', 'Inpatient hyperglycemia thresholds and goals', 'عتبات وأهداف فرط السكر داخل المستشفى'),
  ],
  'hospital-insulin-technology': [
    adaVisual('hospital-care', 4, 'Section 16 page 4', 'Hospital insulin and technology recommendations', 'توصيات الأنسولين والتكنولوجيا داخل المستشفى'),
  ],
  'hospital-hypoglycemia-perioperative': [
    adaVisual('hospital-care', 8, 'Section 16 page 8', 'Perioperative A1C and glucose targets', 'أهداف HbA1c والسكر حول الجراحة'),
  ],
  'advocacy-full': [
    adaVisual('advocacy', 1, 'Section 17 page 1', 'Diabetes advocacy source page', 'صفحة مصدر من قسم advocacy'),
  ],
  'ada2026-clinical-diagnosis-screening-numbers': [
    adaVisual('diagnosis-classification', 2, 'Tables 2.1-2.2', 'Diabetes and prediabetes diagnostic criteria', 'معايير تشخيص السكري وما قبل السكري'),
    adaVisual('diagnosis-classification', 9, 'Table 2.5', 'Adult screening criteria', 'معايير فحص البالغين'),
    adaVisual('diagnosis-classification', 5, 'Figure 2.1', 'Type 1 diabetes diagnostic workup', 'تقييم تشخيص النوع الأول'),
  ],
  'ada2026-clinical-prevention-and-annual-evaluation': [
    adaVisual('comprehensive-evaluation', 4, 'Table 4.1', 'Comprehensive diabetes medical evaluation', 'التقييم الطبي الشامل للسكري'),
    adaVisual('comprehensive-evaluation', 7, 'Table 4.3', 'Recommended immunizations', 'التطعيمات الموصى بها'),
    adaVisual('comprehensive-evaluation', 17, 'Figure 4.2', 'MASLD fibrosis risk stratification', 'تصنيف خطر تليف الكبد في MASLD'),
  ],
  'ada2026-clinical-glycemic-goals-technology': [
    adaVisual('glycemic-goals', 3, 'Table 6.2', 'CGM metrics for clinical care', 'مؤشرات CGM للرعاية السريرية'),
    adaVisual('glycemic-goals', 4, 'Table 6.3', 'Glycemic goals', 'أهداف السكر'),
    adaVisual('glycemic-goals', 8, 'Table 6.4', 'Hypoglycemia classification', 'تصنيف هبوط السكر'),
    adaVisual('diabetes-technology', 6, 'Table 7.3', 'CGM device types', 'أنواع أجهزة CGM'),
  ],
  'ada2026-clinical-lifestyle-nutrition-exercise': [
    adaVisual('health-behaviors', 5, 'Table 5.1', 'Nutrition recommendations', 'توصيات التغذية'),
    adaVisual('health-behaviors', 6, 'Table 5.2', 'Nutrition behaviors', 'السلوكيات الغذائية'),
    adaVisual('health-behaviors', 18, 'Figure 5.2', '24-hour physical behaviors', 'سلوكيات الحركة خلال 24 ساعة'),
    adaVisual('health-behaviors', 23, 'Table 5.5', 'Behavioral health referral', 'تحويل الصحة النفسية'),
  ],
  'ada2026-clinical-obesity-pharmacology-insulin': [
    adaVisual('obesity-weight', 9, 'Table 8.2', 'Obesity pharmacotherapies', 'أدوية السمنة'),
    adaVisual('pharmacologic-treatment', 2, 'Figure 9.1', 'Type 1 insulin plans', 'خطط أنسولين النوع الأول'),
    adaVisual('pharmacologic-treatment', 9, 'Figure 9.4', 'Type 2 medication algorithm', 'خوارزمية أدوية النوع الثاني'),
    adaVisual('pharmacologic-treatment', 16, 'Figure 9.5', 'Injectable therapy intensification', 'تصعيد العلاج بالحقن'),
  ],
  'ada2026-clinical-cardiorenal-risk-management': [
    adaVisual('cardiovascular-risk', 5, 'Figure 10.2', 'Hypertension treatment', 'علاج الضغط'),
    adaVisual('cardiovascular-risk', 9, 'Table 10.1', 'Statin intensity', 'شدة جرعات الستاتين'),
    adaVisual('kidney-disease', 2, 'Figure 11.1', 'CKD risk and monitoring', 'خطورة CKD والمتابعة'),
    adaVisual('kidney-disease', 7, 'Figure 11.2', 'CKD treatment approach', 'نهج علاج CKD'),
  ],
  'ada2026-clinical-retina-neuropathy-foot': [
    adaVisual('retina-neuro-foot', 9, 'Table 12.1', 'Foot risk and screening frequency', 'خطورة القدم ومعدل الفحص'),
  ],
  'ada2026-clinical-pregnancy-children-older-adults': [
    adaVisual('older-adults', 13, 'Figure 13.3', 'Insulin simplification in older adults', 'تبسيط الأنسولين لكبار السن'),
    adaVisual('children-adolescents', 4, 'Figure 14.1', 'Youth new-onset diabetes algorithm', 'خوارزمية السكري حديث الظهور للأطفال'),
    adaVisual('pregnancy-management', 3, 'Table 15.1', 'Preconception care checklist', 'قائمة ما قبل الحمل'),
    adaVisual('pregnancy-management', 5, 'Table 15.2', 'Pregnancy glucose goals', 'أهداف السكر في الحمل'),
  ],
  'ada2026-clinical-hospital-dka-hhs': [
    adaVisual('hospital-care', 10, 'Figure 16.1', 'DKA/HHS treatment pathways', 'مسارات علاج DKA/HHS'),
    adaVisual('hospital-care', 11, 'Tables 16.1-16.2', 'DKA/HHS diagnostic criteria and presentation', 'معايير وتشخيص DKA/HHS'),
  ],
};
