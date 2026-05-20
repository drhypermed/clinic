import type { GuidelineTopic } from '../../guidelinesData';

export const ADA_2025_COMPLICATIONS_TOPICS: GuidelineTopic[] = [
  {
    id: 'cardiovascular-risk-full',
    group: 'complicationsRisk',
    title: {
      en: '10. Cardiovascular Disease and Risk Management',
      ar: '10. أمراض القلب والأوعية وإدارة الخطورة',
    },
    summary: {
      en: 'Cardiovascular prevention in diabetes combines blood pressure, lipids, antiplatelet decisions, kidney protection, smoking cessation, lifestyle, and cardioprotective glucose-lowering drugs.',
      ar: 'الوقاية القلبية في السكري تجمع بين الضغط، والدهون، وقرار مضادات الصفائح، وحماية الكلى، وإيقاف التدخين، ونمط الحياة، وأدوية السكر ذات الفائدة القلبية.',
    },
    points: {
      en: [
        'Assess ASCVD risk factors regularly: duration of diabetes, obesity, hypertension, dyslipidemia, smoking, kidney disease, albuminuria, family history, and symptoms.',
        'Blood pressure and lipid management should be individualized but treated proactively because cardiovascular disease is a major cause of morbidity and mortality in diabetes.',
        'Statin intensity, nonstatin lipid therapy, and triglyceride management depend on age, ASCVD status, lipid values, and overall risk.',
        'ACE inhibitor or ARB therapy is central when hypertension is accompanied by albuminuria or kidney disease indications.',
        'In established ASCVD, high ASCVD risk, heart failure, or CKD, choose glucose-lowering agents with proven cardiovascular and/or kidney benefit when indicated.',
      ],
      ar: [
        'تقييم عوامل خطورة ASCVD يتم بانتظام: مدة السكري، والسمنة، والضغط، واضطراب الدهون، والتدخين، ومرض الكلى، والزلال، والتاريخ العائلي، والأعراض.',
        'إدارة الضغط والدهون يجب أن تكون فردية لكنها استباقية لأن أمراض القلب سبب رئيسي للمراضة والوفاة في السكري.',
        'شدة statin، والأدوية غير الستاتينية، وإدارة الدهون الثلاثية تعتمد على العمر ووجود ASCVD وقيم الدهون والخطر الكلي.',
        'ACE inhibitor أو ARB مهمان عند وجود ضغط مع زلال أو مؤشرات مرض كلى.',
        'في ASCVD المؤكد، أو خطر ASCVD العالي، أو فشل القلب، أو CKD، اختر أدوية خفض السكر ذات فائدة قلبية أو كلوية مثبتة عند الاستطباب.',
      ],
    },
    details: [
      {
        title: { en: 'Blood pressure and lipid anchors', ar: 'مرتكزات الضغط والدهون' },
        items: {
          en: [
            'Measure blood pressure at every routine visit, or at least every 6 months, and confirm elevated readings when possible with repeat or home/ambulatory measurements.',
            'For diabetes with hypertension, the on-treatment blood pressure goal is <130/80 mmHg if it can be safely attained.',
            'Age 40-75 with diabetes and no ASCVD: use at least moderate-intensity statin therapy in addition to lifestyle therapy.',
            'Age 40-75 with diabetes and higher cardiovascular risk: high-intensity statin aims for >=50% LDL reduction and LDL <70 mg/dL.',
            'Established ASCVD: use high-intensity statin unless contraindicated; ADA 2025 supports an LDL goal <55 mg/dL with additional LDL-lowering therapy if needed.',
          ],
          ar: [
            'يقاس الضغط في كل زيارة روتينية أو كل 6 أشهر على الأقل، وتؤكد القراءات المرتفعة عند الإمكان بإعادة القياس أو بقياسات منزلية/متنقلة.',
            'في السكري مع ارتفاع الضغط، هدف الضغط أثناء العلاج هو <130/80 mmHg إذا أمكن تحقيقه بأمان.',
            'العمر 40-75 سنة مع سكري ودون ASCVD: استخدم statin متوسط الشدة على الأقل بالإضافة إلى نمط الحياة.',
            'العمر 40-75 سنة مع سكري وخطورة قلبية أعلى: statin عالي الشدة بهدف خفض LDL بنسبة >=50% والوصول إلى LDL <70 mg/dL.',
            'عند وجود ASCVD مؤكد: يستخدم statin عالي الشدة ما لم يوجد مانع؛ وتدعم ADA 2025 هدف LDL <55 mg/dL مع إضافة علاج خافض LDL عند الحاجة.',
          ],
        },
      },
      {
        title: { en: 'Drug choices with cardiorenal benefit', ar: 'اختيارات دوائية ذات فائدة قلبية كلوية' },
        items: {
          en: [
            'For ASCVD or high ASCVD risk, consider GLP-1 receptor agonist and/or SGLT2 inhibitor with proven cardiovascular benefit independent of A1C needs.',
            'For heart failure, especially reduced ejection fraction or high HF risk, prioritize an SGLT2 inhibitor with heart-failure benefit if eGFR allows.',
            'For CKD, coordinate glucose-lowering therapy with kidney-protective therapy rather than treating A1C alone.',
          ],
          ar: [
            'عند وجود ASCVD أو خطورة ASCVD عالية، يناقش GLP-1 RA و/أو SGLT2 inhibitor ذو فائدة قلبية مثبتة بغض النظر عن احتياج HbA1c وحده.',
            'في فشل القلب، خصوصا انخفاض الكسر القذفي أو خطورة HF العالية، يعطى SGLT2 inhibitor ذو فائدة لفشل القلب أولوية إذا سمح eGFR.',
            'في CKD، تنسق أدوية السكر مع العلاج الحامي للكلى بدلا من علاج HbA1c فقط.',
          ],
        },
      },
      {
        title: { en: 'Triglycerides and antiplatelet decisions', ar: 'الدهون الثلاثية ومضادات الصفائح' },
        items: {
          en: [
            'Fasting triglycerides >=500 mg/dL need evaluation for secondary causes and treatment to reduce pancreatitis risk; lifestyle, glycemic control, alcohol avoidance, and medication review are central.',
            'For triglycerides 150-499 mg/dL, prioritize lifestyle, secondary causes, glycemic control, and statin-based ASCVD risk reduction; icosapent ethyl may be considered in selected statin-treated patients with controlled LDL and high risk.',
            'Aspirin is used for secondary prevention in diabetes with ASCVD unless contraindicated; primary prevention requires careful bleeding-risk discussion and is not routine in low-risk or older high-bleeding-risk patients.',
          ],
          ar: [
            'الدهون الثلاثية الصائمة >=500 mg/dL تحتاج بحثا عن أسباب ثانوية وعلاجا لتقليل خطر التهاب البنكرياس؛ نمط الحياة، ضبط السكر، تجنب الكحول، ومراجعة الأدوية عناصر أساسية.',
            'عند triglycerides 150-499 mg/dL: الأولوية لنمط الحياة، الأسباب الثانوية، ضبط السكر، وتقليل خطر ASCVD بالـ statin؛ ويمكن التفكير في icosapent ethyl لفئات مختارة على statin مع LDL مضبوط وخطورة عالية.',
            'Aspirin يستخدم للوقاية الثانوية عند وجود ASCVD ما لم يوجد مانع؛ الوقاية الأولية تحتاج نقاش خطر النزيف وليست روتينية في منخفضي الخطورة أو كبار السن عاليي النزيف.',
          ],
        },
      },
    ],
    quickDecision: {
      when: {
        en: 'At least annually, or whenever cardiovascular status or risk factors change.',
        ar: 'سنوياً على الأقل، أو عندما تتغير حالة القلب أو عوامل الخطورة.',
      },
      start: {
        en: 'Optimize BP, prescribe statins based on risk, and use cardioprotective glucose agents (SGLT2i/GLP-1 RA).',
        ar: 'اضبط الضغط، صف الستاتين حسب الخطورة، واستخدم أدوية سكر تحمي القلب (SGLT2i/GLP-1 RA).',
      },
      followUp: {
        en: 'Every 3-6 months to monitor BP, lipids, and medication tolerance.',
        ar: 'كل 3-6 أشهر لمتابعة الضغط، والدهون، وتحمل المريض للأدوية.',
      },
      warn: {
        en: 'Do not delay starting cardioprotective medications just because the A1C is at target.',
        ar: 'لا تؤخر البدء بأدوية حماية القلب لمجرد أن السكر التراكمي في النطاق المستهدف.',
      },
    },

    sourceIds: ['cardiovascular-risk'],
    tags: ['ASCVD', 'blood pressure', 'lipids', 'statin', 'heart failure'],
  },
  {
    id: 'kidney-disease-full',
    group: 'complicationsRisk',
    title: {
      en: '11. Chronic Kidney Disease and Risk Management',
      ar: '11. مرض الكلى المزمن وإدارة الخطورة',
    },
    summary: {
      en: 'Kidney protection depends on early detection with eGFR and UACR, blood pressure control, RAAS blockade when indicated, SGLT2 inhibitors, and appropriate referral.',
      ar: 'حماية الكلى تعتمد على الاكتشاف المبكر بـ eGFR وUACR، وضبط الضغط، واستخدام RAAS blockade عند الاستطباب، وSGLT2 inhibitors، والإحالة المناسبة.',
    },
    points: {
      en: [
        'At least annually, assess urinary albumin and eGFR in people with type 1 diabetes of at least 5 years duration and in all people with type 2 diabetes.',
        'Persistent albuminuria, falling eGFR, or both should trigger staging, risk reduction, medication review, and consideration of referral.',
        'ACE inhibitor or ARB therapy is recommended for hypertension with albuminuria and should be titrated carefully with monitoring.',
        'SGLT2 inhibitors with kidney benefit are recommended for many people with type 2 diabetes and CKD when eGFR criteria are met.',
        'Finerenone and GLP-1 receptor agonists may be considered in selected people to reduce kidney and cardiovascular risk according to indications.',
      ],
      ar: [
        'يقيم UACR وeGFR سنويا على الأقل في النوع الأول بعد مدة 5 سنوات، وفي كل مرضى النوع الثاني.',
        'استمرار الزلال أو انخفاض eGFR أو كلاهما يستدعي تحديد المرحلة، وتقليل الخطورة، ومراجعة الدواء، والتفكير في الإحالة.',
        'ACE inhibitor أو ARB يوصى بهما عند وجود ضغط مع زلال، مع المعايرة والمتابعة بحذر.',
        'SGLT2 inhibitors ذات الفائدة الكلوية يوصى بها في كثير من مرضى النوع الثاني مع CKD عند تحقق شروط eGFR.',
        'يمكن التفكير في finerenone وGLP-1 receptor agonists في فئات مختارة لتقليل خطر الكلى والقلب حسب الاستطباب.',
      ],
    },
    details: [
      {
        title: { en: 'Screening and staging', ar: 'الفحص وتحديد المرحلة' },
        items: {
          en: [
            'Screen with both eGFR and UACR at least annually in all type 2 diabetes and in type 1 diabetes starting 5 years after diagnosis.',
            'Higher-risk CKD, rising albuminuria, or falling eGFR requires more frequent monitoring, medication adjustment, and earlier referral consideration.',
            'Do not rely on serum creatinine alone; albuminuria can identify risk even when eGFR is preserved.',
          ],
          ar: [
            'يفحص eGFR وUACR معا سنويا على الأقل في كل مرضى النوع الثاني، وفي النوع الأول بدءا من 5 سنوات بعد التشخيص.',
            'CKD الأعلى خطورة أو زيادة الزلال أو انخفاض eGFR يحتاج متابعة أكثر تكرارا، تعديل الأدوية، والتفكير المبكر في الإحالة.',
            'لا تعتمد على الكرياتينين وحده؛ فالزلال قد يكشف خطورة حتى مع eGFR محفوظ.',
          ],
        },
      },
      {
        title: { en: 'Kidney-protective therapy', ar: 'العلاج الحامي للكلى' },
        items: {
          en: [
            'ACE inhibitor or ARB is indicated for hypertension with albuminuria; monitor creatinine and potassium after initiation or dose increase.',
            'SGLT2 inhibitors with kidney benefit are recommended in type 2 diabetes with CKD down to eGFR >=20 mL/min/1.73 m2 when clinically appropriate.',
            'Finerenone can be considered when albuminuria persists despite maximally tolerated ACE inhibitor or ARB, if eGFR and potassium criteria are met.',
            'Refer to nephrology for continuously rising UACR, falling eGFR, eGFR <30 mL/min/1.73 m2, uncertain cause, difficult management, or rapidly progressing kidney disease.',
          ],
          ar: [
            'ACE inhibitor أو ARB يستطب عند وجود ضغط مع زلال؛ راقب الكرياتينين والبوتاسيوم بعد البدء أو زيادة الجرعة.',
            'SGLT2 inhibitors ذات الفائدة الكلوية يوصى بها في النوع الثاني مع CKD حتى eGFR >=20 mL/min/1.73 m2 عند الملاءمة السريرية.',
            'يمكن التفكير في finerenone عند استمرار الزلال رغم أعلى جرعة محتملة من ACE inhibitor أو ARB، إذا تحققت شروط eGFR والبوتاسيوم.',
            'أحل إلى الكلى عند ارتفاع UACR باستمرار، انخفاض eGFR، أو eGFR <30 mL/min/1.73 m2، أو سبب غير واضح، أو صعوبة التحكم، أو تدهور سريع.',
          ],
        },
      },
    ],
    quickDecision: {
      when: {
        en: 'Annually for all Type 2 patients, and after 5 years of disease duration for Type 1.',
        ar: 'سنوياً لكل مرضى النوع الثاني، وبعد 5 سنوات من التشخيص لمرضى النوع الأول.',
      },
      start: {
        en: 'Order both eGFR and UACR. Add ACEi/ARB for HTN+albuminuria, and SGLT2i for CKD.',
        ar: 'اطلب eGFR و UACR معاً. أضف ACEi/ARB للضغط مع الزلال، و SGLT2i لمرضى CKD.',
      },
      followUp: {
        en: 'More frequently (e.g., 3-6 months) if eGFR is falling or albuminuria is progressing.',
        ar: 'بشكل أكثر تقارباً (مثل 3-6 أشهر) إذا كان eGFR ينخفض أو الزلال يزداد.',
      },
      warn: {
        en: 'Do not rely on serum creatinine alone; UACR is critical to catch early kidney damage.',
        ar: 'لا تعتمد على الكرياتينين وحده؛ قياس الزلال (UACR) حيوي لاكتشاف ضرر الكلى المبكر.',
      },
    },

    sourceIds: ['kidney-disease'],
    tags: ['CKD', 'eGFR', 'UACR', 'SGLT2', 'finerenone'],
  },
  {
    id: 'retina-neuro-foot-full',
    group: 'complicationsRisk',
    title: {
      en: '12. Retinopathy, Neuropathy, and Foot Care',
      ar: '12. الشبكية والأعصاب ورعاية القدم',
    },
    summary: {
      en: 'Microvascular protection is a scheduled-care problem: retinal exams, neuropathy assessment, foot risk stratification, and rapid referral prevent irreversible harm.',
      ar: 'حماية الأوعية الدقيقة مسألة متابعة منظمة: فحص الشبكية، وتقييم الأعصاب، وتصنيف خطورة القدم، والإحالة السريعة تمنع ضررا غير عكوس.',
    },
    points: {
      en: [
        'Retinopathy screening depends on diabetes type, duration, pregnancy status, prior findings, and access to eye care.',
        'Optimize glycemia, blood pressure, and lipids to reduce retinopathy risk and progression.',
        'Assess for distal symmetric polyneuropathy and autonomic neuropathy when symptoms or duration indicate, and treat pain and safety risks.',
        'Foot evaluation should include inspection, pulses, protective sensation, deformity, ulcer history, footwear, and risk-based follow-up frequency.',
        'Urgent referral is needed for active ulcer, infection, ischemia, Charcot suspicion, or rapidly worsening foot findings.',
      ],
      ar: [
        'فحص الشبكية يعتمد على نوع السكري ومدته وحالة الحمل والنتائج السابقة وإتاحة رعاية العين.',
        'تحسين السكر والضغط والدهون يقلل خطر اعتلال الشبكية وتطوره.',
        'يتم تقييم اعتلال الأعصاب الطرفي المتناظر والاعتلال الذاتي عند وجود أعراض أو مدة مرض مناسبة، مع علاج الألم ومخاطر السلامة.',
        'تقييم القدم يشمل الفحص، والنبضات، والإحساس الوقائي، والتشوهات، وتاريخ القرح، والحذاء، وتكرار المتابعة حسب الخطورة.',
        'الإحالة العاجلة مطلوبة عند وجود قرحة نشطة، أو عدوى، أو نقص تروية، أو اشتباه Charcot، أو تدهور سريع في القدم.',
      ],
    },
    details: [
      {
        title: { en: 'Eye and nerve screening', ar: 'فحص العين والأعصاب' },
        items: {
          en: [
            'Type 1 diabetes: initial dilated eye exam generally starts within 5 years after onset; type 2 diabetes: start at diagnosis because disease may predate detection.',
            'Pregnancy with preexisting diabetes requires eye assessment before pregnancy or early in the first trimester, then follow-up according to retinopathy severity.',
            'Assess distal symmetric polyneuropathy with symptoms plus pinprick/temperature or vibration and 10-g monofilament to identify loss of protective sensation.',
          ],
          ar: [
            'في النوع الأول: يبدأ فحص قاع العين الموسع غالبا خلال 5 سنوات من بداية المرض؛ وفي النوع الثاني يبدأ عند التشخيص لأن المرض قد يسبق اكتشافه.',
            'الحمل مع سكري سابق للحمل يحتاج تقييم العين قبل الحمل أو مبكرا في الثلث الأول ثم متابعة حسب شدة اعتلال الشبكية.',
            'يقيم اعتلال الأعصاب الطرفي بالأعراض مع وخز/حرارة أو اهتزاز، وبخيط 10 g monofilament لاكتشاف فقد الإحساس الوقائي.',
          ],
        },
      },
      {
        title: { en: 'Foot red flags', ar: 'علامات خطورة القدم' },
        items: {
          en: [
            'Perform a comprehensive foot evaluation at least annually and at every visit for people with prior ulcer, amputation, loss of protective sensation, PAD, or deformity.',
            'IWGDF-style follow-up frequency is practical: risk 0 yearly, risk 1 every 6-12 months, risk 2 every 3-6 months, and risk 3 every 1-3 months.',
            'Urgent same-day or rapid referral is needed for ulcer with infection, suspected ischemia, gangrene, Charcot foot, spreading cellulitis, systemic illness, or deep tissue involvement.',
            'Foot-care plans should include footwear assessment, callus/nail care, vascular assessment when pulses are abnormal, and patient education on daily inspection.',
          ],
          ar: [
            'يجرى تقييم قدم شامل سنويا على الأقل، وفي كل زيارة لمن لديهم قرحة سابقة، بتر، فقد إحساس وقائي، PAD، أو تشوه.',
            'تكرار المتابعة حسب IWGDF عملي للطبيب: خطورة 0 سنويا، خطورة 1 كل 6-12 شهرا، خطورة 2 كل 3-6 أشهر، وخطورة 3 كل 1-3 أشهر.',
            'تحتاج الإحالة العاجلة أو السريعة عند قرحة مع عدوى، اشتباه نقص تروية، غرغرينا، قدم Charcot، التهاب خلوي ممتد، مرض جهازي، أو إصابة أنسجة عميقة.',
            'خطة القدم تشمل تقييم الحذاء، العناية بالكالو والأظافر، تقييم الأوعية عند اضطراب النبض، وتعليم المريض الفحص اليومي.',
          ],
        },
      },
    ],
    quickDecision: {
      when: {
        en: 'Annually for general screening, or at every visit if the patient has a history of foot complications.',
        ar: 'سنوياً للفحص العام، أو في كل زيارة إذا كان للمريض تاريخ من مضاعفات القدم.',
      },
      start: {
        en: 'Refer for dilated eye exam, test with 10-g monofilament, and perform a full foot inspection.',
        ar: 'حول المريض لفحص قاع عين، وافحص القدم بخيط 10-g monofilament مع فحص نظري كامل.',
      },
      followUp: {
        en: 'Adjust frequency based on risk (e.g., high-risk foot every 1-3 months).',
        ar: 'عدل تكرار الفحص بناءً على الخطورة (مثل القدم عالية الخطورة تفحص كل 1-3 أشهر).',
      },
      warn: {
        en: 'Refer urgently for any active ulcer, deep infection, suspected ischemia, or Charcot foot.',
        ar: 'أحل المريض بشكل عاجل عند وجود قرحة نشطة، أو عدوى عميقة، أو اشتباه بنقص التروية، أو قدم شاركو.',
      },
    },
    sourceIds: ['retina-neuro-foot'],
    tags: ['retinopathy', 'neuropathy', 'foot care', 'ulcer', 'screening'],
  },
];
