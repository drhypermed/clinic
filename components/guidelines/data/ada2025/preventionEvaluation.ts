import type { GuidelineTopic } from '../../guidelinesData';

export const ADA_2025_PREVENTION_EVALUATION_TOPICS: GuidelineTopic[] = [
  {
    id: 'prevention-delay-full',
    group: 'preventionEvaluation',
    title: {
      en: '3. Prevention or Delay of Diabetes and Comorbidities',
      ar: '3. الوقاية من السكري أو تأخيره والأمراض المصاحبة',
    },
    summary: {
      en: 'This chapter turns prediabetes into an active intervention window: lifestyle, weight, medication selection, and cardiovascular risk management should start before diabetes develops.',
      ar: 'يحوّل هذا الفصل مرحلة ما قبل السكري إلى فرصة تدخل مبكرة: نمط الحياة، والوزن، واختيار الدواء، وإدارة خطر القلب تبدأ قبل ظهور السكري.',
    },
    points: {
      en: [
        'Adults with overweight or obesity and high diabetes risk should be referred to an intensive lifestyle program aiming for sustainable weight loss and regular moderate physical activity.',
        'Lifestyle intervention should be individualized and culturally appropriate, with attention to nutrition, physical activity, sleep, and long-term behavior support.',
        'Metformin can be considered for diabetes prevention in selected high-risk adults, especially younger adults, people with BMI >=35 kg/m2, higher fasting glucose or A1C, or prior gestational diabetes.',
        'People with prediabetes should be monitored for progression to diabetes and treated for cardiovascular risk factors such as blood pressure, lipids, and smoking.',
        'Anti-obesity pharmacotherapy or metabolic surgery may reduce progression to diabetes in appropriate people with obesity, but decisions should be individualized.',
      ],
      ar: [
        'البالغون ذوو زيادة الوزن أو السمنة وخطر السكري العالي ينبغي إحالتهم إلى برنامج نمط حياة مكثف يستهدف نقص وزن مستداما ونشاطا بدنيا متوسطا منتظما.',
        'تدخل نمط الحياة يجب أن يكون فرديا ومناسبا ثقافيا، مع الانتباه للتغذية والنشاط والنوم والدعم السلوكي طويل المدى.',
        'يمكن التفكير في metformin للوقاية من السكري في بالغين مختارين عاليي الخطورة، خصوصا الأصغر سنا، أو BMI >=35 kg/m2، أو ارتفاع FPG/A1C، أو تاريخ سكري حمل.',
        'من لديهم prediabetes يحتاجون متابعة تطور السكري وعلاج عوامل خطورة القلب مثل الضغط والدهون والتدخين.',
        'قد تقلل أدوية علاج السمنة أو جراحة الأيض تطور السكري في الأشخاص المناسبين المصابين بالسمنة، لكن القرار يجب أن يكون فرديا.',
      ],
    },
    practiceNote: {
      en: 'Do not label prediabetes and stop; record a concrete prevention plan and follow-up interval.',
      ar: 'لا تكتف بكتابة prediabetes؛ سجل خطة وقاية واضحة وموعد متابعة محدد.',
    },
    details: [
      {
        title: { en: 'Core prevention targets', ar: 'أهداف الوقاية الأساسية' },
        items: {
          en: [
            'For DPP-style programs, practical targets are about 7% weight loss and at least 150 min/week of moderate-intensity physical activity when feasible.',
            'Care goals in high-risk adults with overweight or obesity include weight-loss maintenance, slowing hyperglycemia progression, and active cardiovascular risk reduction.',
            'Prediabetes should usually be followed at least annually for progression to diabetes, with earlier review if weight, symptoms, pregnancy plans, or risk factors change.',
          ],
          ar: [
            'في برامج نمط الحياة المشابهة لـ DPP، الأهداف العملية هي إنقاص نحو 7% من الوزن ونشاط بدني متوسط لا يقل عن 150 دقيقة أسبوعيا عند الإمكان.',
            'أهداف الرعاية في البالغين عاليي الخطورة مع زيادة وزن أو سمنة تشمل تثبيت نقص الوزن، إبطاء تدهور الجلوكوز، وتقليل خطورة القلب بفاعلية.',
            'ما قبل السكري يحتاج غالبا متابعة سنوية على الأقل لرصد التحول إلى سكري، وبشكل أبكر عند تغير الوزن أو الأعراض أو خطط الحمل أو عوامل الخطورة.',
          ],
        },
      },
      {
        title: { en: 'When metformin prevention is most relevant', ar: 'متى يصبح metformin للوقاية أكثر ملاءمة' },
        items: {
          en: [
            'Consider metformin in adults at high risk, especially age 25-59 years, BMI >=35 kg/m2, FPG >=110 mg/dL, A1C >=6.0%, or previous GDM.',
            'If metformin is used long term, periodically assess vitamin B12, especially with anemia or peripheral neuropathy.',
          ],
          ar: [
            'يناقش metformin للوقاية في البالغين عاليي الخطورة، خصوصا العمر 25-59 سنة، BMI >=35 kg/m2، أو FPG >=110 mg/dL، أو HbA1c >=6.0%، أو تاريخ GDM.',
            'عند استخدام metformin لفترة طويلة، يفضل تقييم فيتامين B12 دوريا، خصوصا مع أنيميا أو اعتلال أعصاب طرفية.',
          ],
        },
      },
    ],
    quickDecision: {
      when: {
        en: 'When a patient is diagnosed with prediabetes or is at high risk for Type 2 diabetes.',
        ar: 'عند تشخيص المريض بما قبل السكري أو كونه عرضة لخطر عالي للسكري من النوع الثاني.',
      },
      start: {
        en: 'Prescribe intensive lifestyle intervention (target 7% weight loss, 150 min activity). Consider Metformin.',
        ar: 'ابدأ تدخل مكثف لنمط الحياة (الهدف نقص وزن 7%، و150 دقيقة نشاط). فكر في الميتفورمين.',
      },
      followUp: {
        en: 'Annually at minimum, or sooner if weight increases or risk factors change.',
        ar: 'سنوياً على الأقل، أو قبل ذلك إذا زاد الوزن أو تغيرت عوامل الخطورة.',
      },
      warn: {
        en: 'Do not simply label "prediabetes" without an active management and cardiovascular risk plan.',
        ar: 'لا تكتف بتشخيص "ما قبل السكري" دون وضع خطة إدارة نشطة وخطة لتقليل خطر القلب.',
      },
    },
    sourceIds: ['prevention-delay'],
    tags: ['prediabetes', 'prevention', 'metformin', 'lifestyle', 'cardiovascular risk'],
  },
  {
    id: 'comprehensive-evaluation-full',
    group: 'preventionEvaluation',
    title: {
      en: '4. Comprehensive Medical Evaluation and Comorbidity Assessment',
      ar: '4. التقييم الطبي الشامل وتقييم الأمراض المصاحبة',
    },
    summary: {
      en: 'ADA treats the diabetes visit as a structured review of diagnosis, complications, comorbidities, preventive care, medications, psychosocial needs, and shared goals.',
      ar: 'تتعامل ADA مع زيارة السكري كمراجعة منظمة للتشخيص، والمضاعفات، والأمراض المصاحبة، والرعاية الوقائية، والأدوية، والاحتياجات النفسية الاجتماعية، والأهداف المشتركة.',
    },
    points: {
      en: [
        'The initial and follow-up evaluation should confirm diabetes type, assess complications and comorbidities, review previous treatment, and build a person-centered care plan.',
        'Routine assessment should include cardiovascular risk, kidney disease, eye disease, neuropathy, foot risk, obesity, sleep, liver disease, bone health, dental health, immunizations, and psychosocial concerns when relevant.',
        'Medication review should look for effectiveness, hypoglycemia, adverse effects, cost, access, adherence, and opportunities to simplify or intensify therapy.',
        'Preventive services include vaccination, smoking cessation support, cancer and age-appropriate screening, pregnancy planning when relevant, and referrals for specialty care.',
        'The plan should be revisited regularly because diabetes phenotype, comorbidities, finances, function, and goals change over time.',
      ],
      ar: [
        'التقييم الأولي والمتابعة يجب أن يؤكدا نوع السكري، ويقيما المضاعفات والأمراض المصاحبة، ويراجعا العلاج السابق، ويبنيا خطة متمركزة حول الشخص.',
        'التقييم الروتيني يشمل خطر القلب، والكلى، والعين، والأعصاب، وخطورة القدم، والسمنة، والنوم، وأمراض الكبد، وصحة العظام، وصحة الأسنان، والتطعيمات، والجوانب النفسية الاجتماعية عند اللزوم.',
        'مراجعة الأدوية يجب أن تبحث الفاعلية، ونقص السكر، والآثار الجانبية، والتكلفة، والإتاحة، والالتزام، وفرص تبسيط العلاج أو تكثيفه.',
        'الرعاية الوقائية تشمل التطعيم، ودعم إيقاف التدخين، والفحوصات العمرية وفحوصات السرطان المناسبة، وتخطيط الحمل عند اللزوم، والإحالات التخصصية.',
        'الخطة يجب أن تراجع بانتظام لأن نمط السكري، والأمراض المصاحبة، والقدرة المالية، والوظيفة، والأهداف تتغير مع الوقت.',
      ],
    },
    details: [
      {
        title: { en: 'Minimum recurring review', ar: 'المراجعة الدورية الأساسية' },
        items: {
          en: [
            'At routine visits, update glycemic status, hypoglycemia history, medication access/adherence, weight trajectory, blood pressure, lipid plan, kidney risk, and smoking status.',
            'At least annually, refresh complication screening status, vaccinations, foot risk, eye-care timing, kidney labs, dental care, mental health, sleep, and social barriers.',
          ],
          ar: [
            'في الزيارات الروتينية: حدث حالة السكر، تاريخ نقص السكر، إتاحة الأدوية والالتزام، مسار الوزن، الضغط، خطة الدهون، خطورة الكلى، وحالة التدخين.',
            'سنويا على الأقل: راجع حالة فحوص المضاعفات، التطعيمات، خطورة القدم، موعد فحص العين، تحاليل الكلى، الأسنان، الصحة النفسية، النوم، والعوائق الاجتماعية.',
          ],
        },
      },
      {
        title: { en: 'Clinical problems to actively look for', ar: 'مشكلات يجب البحث عنها بفاعلية' },
        items: {
          en: [
            'Comorbidities commonly needing deliberate assessment include ASCVD, heart failure, CKD, obesity, NAFLD/MASLD, sleep apnea, depression, cognitive impairment, and bone or dental disease.',
            'The evaluation should identify when a patient needs DSMES, nutrition therapy, behavioral health, eye care, nephrology, cardiology, podiatry, or pregnancy counseling.',
          ],
          ar: [
            'الأمراض المصاحبة التي تحتاج بحثا مقصودا تشمل ASCVD، فشل القلب، CKD، السمنة، NAFLD/MASLD، انقطاع النفس أثناء النوم، الاكتئاب، ضعف الإدراك، وأمراض العظام أو الأسنان.',
            'التقييم يجب أن يحدد الحاجة إلى DSMES، علاج تغذية طبي، صحة نفسية، رعاية عيون، كلى، قلب، قدم سكري، أو استشارة حمل.',
          ],
        },
      },
      {
        title: { en: 'High-yield comorbidity checklist', ar: 'قائمة أمراض مصاحبة عالية الأهمية' },
        items: {
          en: [
            'Vaccination status should be reviewed as part of diabetes care, including influenza, COVID-19, pneumococcal, hepatitis B, RSV, Tdap, and zoster according to age and local policy.',
            'Dental history matters: refer for a dental and periodontal exam at least annually, and coordinate around dental procedures when hypoglycemia risk or infection is relevant.',
            'Assess bone and fracture risk in older adults and high-risk patients; avoid medications that worsen fracture risk when safer alternatives fit.',
          ],
          ar: [
            'راجع التطعيمات ضمن رعاية السكري: الإنفلونزا، COVID-19، المكورات الرئوية، التهاب كبدي B، RSV، Tdap، والحزام الناري حسب العمر والسياسة المحلية.',
            'تاريخ الأسنان مهم: أحل لفحص أسنان ولثة سنويا على الأقل، ونسق حول إجراءات الأسنان عند وجود خطر نقص سكر أو عدوى.',
            'قيم خطر هشاشة وكسور العظام في كبار السن وعاليي الخطورة؛ وتجنب الأدوية التي تزيد خطر الكسور عندما تتاح بدائل أكثر أمانا.',
          ],
        },
      },
      {
        title: { en: 'MASLD and sleep apnea flags', ar: 'إشارات MASLD وانقطاع النفس أثناء النوم' },
        items: {
          en: [
            'In type 2 diabetes or prediabetes with obesity or cardiometabolic risk, consider MASLD risk assessment using liver enzymes and noninvasive fibrosis tools such as FIB-4 when appropriate.',
            'Refer for liver evaluation when noninvasive tests suggest advanced fibrosis, liver stiffness is high, or the cause of liver disease is uncertain.',
            'Evaluate obstructive sleep apnea symptoms, especially with obesity, resistant hypertension, daytime sleepiness, loud snoring, or witnessed apneas.',
          ],
          ar: [
            'في النوع الثاني أو ما قبل السكري مع سمنة أو خطورة قلبية أيضية، فكر في تقييم MASLD باستخدام إنزيمات الكبد وأدوات غير غازية مثل FIB-4 عند الملاءمة.',
            'أحل لتقييم كبد عند وجود اختبارات غير غازية تشير إلى تليف متقدم، أو ارتفاع liver stiffness، أو عدم وضوح سبب مرض الكبد.',
            'قيم أعراض انقطاع النفس أثناء النوم خصوصا مع السمنة، ضغط مقاوم، نعاس نهاري، شخير عال، أو توقف نفس مشاهد أثناء النوم.',
          ],
        },
      },
    ],
    sourceIds: ['comprehensive-evaluation'],
    tags: ['medical evaluation', 'comorbidities', 'immunization', 'dental', 'bone health'],
  },
];
