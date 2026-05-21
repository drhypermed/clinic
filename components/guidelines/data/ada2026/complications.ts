import type { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_COMPLICATIONS_TOPICS: GuidelineTopic[] = [
  {
    id: 'cvd-hypertension',
    group: 'complicationsRisk',
    title: {
      en: '10. Cardiovascular Disease & Risk: Hypertension',
      ar: '10. أمراض القلب والأوعية الدموية والمخاطر: ارتفاع ضغط الدم',
    },
    summary: {
      en: 'Guidelines for blood pressure measurement, goals, and pharmacologic treatment in people with diabetes to reduce cardiovascular events and microvascular complications.',
      ar: 'إرشادات قياس ضغط الدم، الأهداف، والعلاج الدوائي لمرضى السكري لتقليل أمراض القلب والمضاعفات الدقيقة.',
    },
    points: {
      en: [
        'Diagnosis: Measure BP at every visit. Diagnose if average ≥130/80 on ≥2 occasions, or ≥180/110 with CVD at a single visit.',
        'Targets: Target <130/80 for most. Target <120/80 if high CV/kidney risk and safely attainable.',
        'Treatment: If BP ≥130/80, start one drug. If ≥150/90, start two drugs immediately.',
        'Drug Choice: Use ACEi or ARB first-line, especially if albuminuria (UACR ≥30) or eGFR <60 exists. NEVER combine ACEi with ARB.',
        'Pregnancy: Stop ACEi/ARB immediately if pregnancy is planned or occurs.',
        'Resistant Hypertension: Add an MRA (e.g., spironolactone) if not at goal on 3 classes including a diuretic.',
      ],
      ar: [
        'التشخيص: قس الضغط بكل زيارة. يُشخص إذا كان المتوسط ≥130/80 بزيارتين، أو ≥180/110 بزيارة واحدة مع مرض قلبي.',
        'الأهداف: الهدف <130/80 لمعظم المرضى. ويمكن استهداف <120/80 لمرضى القلب/الكلى إذا أمكن بأمان.',
        'العلاج: إذا الضغط ≥130/80 ابدأ دواء واحداً. وإذا ≥150/90 ابدأ دواءين فوراً.',
        'اختيار الدواء: أدوية ACEi أو ARB هي الخط الأول، خصوصاً مع زلال البول أو القصور الكلوي. لا تدمج أبداً بين ACEi و ARB.',
        'الحمل: أوقف أدوية ACEi/ARB فوراً في حال التخطيط للحمل أو حدوثه.',
        'الضغط المقاوم: أضف MRA (مثل سبيرونولاكتون) إذا لم ينتظم الضغط على 3 أدوية (أحدها مدر للبول).',
      ],
    },
    practiceNote: {
      en: 'Proper BP measurement technique is critical: seated, feet on floor, arm supported at heart level, after 5 mins of rest, using appropriate cuff size.',
      ar: 'الطريقة الصحيحة لقياس الضغط أساسية: الجلوس، الأقدام على الأرض، الذراع بمستوى القلب، بعد 5 دقائق من الراحة، مع مقاس سوار مناسب.',
    },
    details: [
      {
        title: { en: 'Kidney Protection in Hypertension', ar: 'حماية الكلى في ارتفاع الضغط' },
        items: {
          en: [
            'ACE inhibitors or ARBs are the first-line therapy for hypertension in people with diabetes who have albuminuria or coronary artery disease.',
            'Maximize the tolerated dose for optimal renal and cardiovascular protection.',
          ],
          ar: [
            'أدوية ACEi أو ARBs هي الخط الأول لعلاج الضغط لدى مرضى السكري المصابين بزلال البول أو أمراض الشرايين التاجية.',
            'استخدم أقصى جرعة يتحملها المريض للحصول على أفضل حماية للكلى والقلب.',
          ],
        },
      },
    ],
    quickDecision: {
      when: {
        en: 'A patient presents with elevated blood pressure during a clinic visit.',
        ar: 'مريض يراجع العيادة ولديه قراءات ضغط مرتفعة.',
      },
      start: {
        en: 'Confirm with multiple readings/home monitoring. If ≥130/80, start medication. If ≥150/90, start dual therapy. Prefer ACEi/ARB if albuminuria is present.',
        ar: 'أكد القراءات. إذا كانت ≥130/80، ابدأ دواء. إذا كانت ≥150/90، ابدأ دواءين. يفضل ACEi/ARB إذا كان هناك زلال.',
      },
      followUp: {
        en: 'Recheck BP in 2-4 weeks. Monitor eGFR and Potassium 7-14 days after starting or changing ACEi/ARB/MRA/Diuretics.',
        ar: 'أعد فحص الضغط خلال أسبوعين لأربعة. راقب الكرياتينين والبوتاسيوم بعد 7-14 يوماً من بدء ACEi/ARB/MRA أو مدرات البول.',
      },
      warn: {
        en: 'Never combine ACE inhibitors with ARBs. Stop these medications immediately if pregnancy occurs.',
        ar: 'لا تدمج أبداً بين أدوية ACEi و ARBs. أوقف هذه الأدوية فوراً في حالة حدوث حمل.',
      },
    },
    sourceIds: ['cardiovascular-risk'],
    tags: ['hypertension', 'blood pressure', 'ACEi', 'ARB', 'CVD risk'],
  },
  {
    id: 'cvd-lipids-antiplatelet',
    group: 'complicationsRisk',
    title: {
      en: '10. Cardiovascular Disease & Risk: Lipids & Antiplatelet Therapy',
      ar: '10. أمراض القلب والأوعية الدموية والمخاطر: الدهون ومضادات التخثر',
    },
    summary: {
      en: 'Guidelines for statin therapy, lipid profile monitoring, triglyceride management, and aspirin use for primary and secondary cardiovascular prevention.',
      ar: 'إرشادات استخدام الستاتين، مراقبة الكوليسترول، علاج الدهون الثلاثية، واستخدام الأسبرين للوقاية الأولية والثانوية لأمراض القلب.',
    },
    points: {
      en: [
        'Primary Prevention (Age 40-75): Use moderate-intensity statins. If high risk, use high-intensity to target LDL <70 mg/dL.',
        'Secondary Prevention (Established ASCVD): For ANY age, use high-intensity statin targeting LDL <55 mg/dL. Add ezetimibe or PCSK9i if not at goal.',
        'Triglycerides: Treat severe hypertriglyceridemia (≥500) to prevent pancreatitis. Do NOT combine statins with fibrates routinely.',
        'Aspirin: Use (75-162 mg) for secondary prevention in all patients with ASCVD. Consider for primary prevention if high CV risk.',
      ],
      ar: [
        'وقاية أولية (40-75 سنة): استخدم ستاتين متوسط الشدة. إذا كان المريض عالي الخطورة، استخدم ستاتين عالي الشدة لهدف LDL <70.',
        'وقاية ثانوية (مرض قلبي سابق): لأي عمر، استخدم ستاتين عالي الشدة لهدف LDL <55. أضف إزيتيميب أو PCSK9i إذا لم تصل للهدف.',
        'الدهون الثلاثية: عالج الارتفاع الشديد (≥500) لمنع التهاب البنكرياس. لا تدمج الستاتين مع الفايبرات روتينياً.',
        'الأسبرين: استخدمه كوقاية ثانوية لجميع مرضى القلب. وفكر فيه كوقاية أولية لمن لديهم خطورة عالية.',
      ],
    },
    practiceNote: {
      en: 'The cardiovascular benefit of statins far outweighs the small risk of incident diabetes associated with their use. Statins should be stopped prior to conception.',
      ar: 'الفائدة القلبية للستاتين تفوق بكثير خطر الإصابة بالسكري المرتبط باستخدامه. يجب إيقاف الستاتين قبل التخطيط للحمل.',
    },
    details: [
      {
        title: { en: 'LDL Targets summary', ar: 'ملخص أهداف LDL' },
        items: {
          en: [
            'Primary prevention, Standard risk (40-75 yrs): Moderate-intensity statin.',
            'Primary prevention, High risk (40-75 yrs): High-intensity statin, target LDL <70 mg/dL.',
            'Secondary prevention (established ASCVD): High-intensity statin, target LDL <55 mg/dL.',
          ],
          ar: [
            'وقاية أولية، خطورة عادية (40-75 سنة): ستاتين متوسط الشدة.',
            'وقاية أولية، خطورة عالية (40-75 سنة): ستاتين عالي الشدة، هدف LDL <70.',
            'وقاية ثانوية (جلطات أو أمراض قلب سابقة): ستاتين عالي الشدة، هدف LDL <55.',
          ],
        },
      },
    ],
    quickDecision: {
      when: {
        en: 'Determining lipid-lowering therapy for a patient with diabetes.',
        ar: 'تحديد العلاج الخافض للدهون لمريض السكري.',
      },
      start: {
        en: 'Age 40-75: start moderate statin. ASCVD or high risk: start high-intensity statin. Add ezetimibe if LDL targets (<70 or <55) are not met.',
        ar: 'العمر 40-75: ابدأ ستاتين متوسط. أمراض قلب أو خطورة عالية: ستاتين عالي. أضف إزيتيميب إذا لم تصل للهدف.',
      },
      followUp: {
        en: 'Re-check lipid panel 4-12 weeks after starting or adjusting statins.',
        ar: 'أعد فحص الدهون بعد 4-12 أسبوع من بدء أو تعديل الستاتين.',
      },
      warn: {
        en: 'Do not routinely combine statins with fibrates due to lack of additional benefit and potential risks.',
        ar: 'لا تدمج الستاتين مع الفايبرات بشكل روتيني لعدم وجود فائدة إضافية ومخاطر محتملة.',
      },
    },
    sourceIds: ['cardiovascular-risk'],
    tags: ['statins', 'lipids', 'LDL', 'triglycerides', 'aspirin', 'ASCVD'],
  },
  {
    id: 'cvd-heart-failure-screening',
    group: 'complicationsRisk',
    title: {
      en: '10. Cardiovascular Disease & Risk: Heart Failure, Screening & Cardiorenal Agents',
      ar: '10. أمراض القلب: هبوط القلب، الفحص المبكر، والأدوية القلبية-الكلوية',
    },
    summary: {
      en: 'Screening protocols for heart failure and peripheral artery disease (PAD), and the targeted use of SGLT2 inhibitors and GLP-1 RAs to improve CV and HF outcomes.',
      ar: 'بروتوكولات الفحص المبكر لهبوط القلب وأمراض الشرايين الطرفية، والاستخدام الموجه لمثبطات SGLT2 ومحفزات GLP-1 لتحسين نتائج القلب وهبوطه.',
    },
    points: {
      en: [
        'Screening: Do not routinely screen for CAD in asymptomatic individuals. Consider screening for stage B heart failure with BNP/NT-proBNP; screen for PAD (ABI) if ≥65 years.',
        'ASCVD & CKD: Recommend SGLT2i or GLP-1 RA. Combining both provides additive risk reduction.',
        'Heart Failure (HFrEF/HFpEF): SGLT2i is highly recommended to reduce hospitalizations and CV death.',
        'CKD with Albuminuria: Use a nonsteroidal MRA (e.g., finerenone) to improve CV outcomes and reduce CKD progression.',
        'HFpEF with Obesity: Use dual GIP/GLP-1 RA or GLP-1 RA to reduce symptoms.',
        'Metformin: Safe in stable HF (if eGFR >30) but must be avoided in unstable or hospitalized HF.',
      ],
      ar: [
        'الفحص المبكر: لا تفحص شرايين القلب روتينياً بدون أعراض. فكر في فحص هبوط القلب (BNP) والشرايين الطرفية (ABI) لمن هم ≥65 سنة.',
        'أمراض القلب والكلى: يوصى بـ SGLT2i أو GLP-1 RA. دمج الاثنين يعطي حماية إضافية.',
        'هبوط القلب (بنوعيه): يوصى بشدة بـ SGLT2i لتقليل التنويم والوفيات.',
        'الكلى مع الزلال: استخدم (finerenone - nsMRA) لتحسين القلب وتقليل تدهور الكلى.',
        'هبوط القلب مع سمنة: استخدم GLP-1 RA أو GIP/GLP-1 RA لتقليل الأعراض.',
        'الميتفورمين: آمن في هبوط القلب المستقر، ويُمنع في الحالات غير المستقرة أو المنومة.',
      ],
    },
    practiceNote: {
      en: 'Heart failure is a prominent and often under-recognized complication. Utilizing biomarkers (BNP/NT-proBNP) can help detect asymptomatic HF and initiate timely therapy like SGLT2i.',
      ar: 'هبوط القلب مضاعفة خطيرة ومغفول عنها غالباً. استخدام دلالات (BNP/NT-proBNP) يساعد في اكتشاف المرض مبكراً وبدء علاج SGLT2i.',
    },
    details: [
      {
        title: { en: 'SGLT2i Risk Mitigation', ar: 'تقليل مخاطر SGLT2i' },
        items: {
          en: [
            'Educate patients taking SGLT2 inhibitors about DKA risks and signs.',
            'Provide blood ketone testing tools and strongly discourage ketogenic diets.',
          ],
          ar: [
            'ثقف مرضى SGLT2i حول مخاطر وعلامات الحموضة الكيتونية (DKA).',
            'وفر أدوات فحص الكيتون في الدم، وحذر بشدة من الحميات الكيتونية.',
          ],
        },
      },
    ],
    quickDecision: {
      when: {
        en: 'A patient has established ASCVD, Heart Failure, or Chronic Kidney Disease.',
        ar: 'مريض لديه أمراض قلب سابقة، هبوط قلب، أو مرض كلى مزمن.',
      },
      start: {
        en: 'Incorporate an SGLT2 inhibitor or GLP-1 RA into their regimen regardless of A1C. SGLT2i is highly preferred for Heart Failure.',
        ar: 'أضف SGLT2i أو GLP-1 RA لعلاجه بغض النظر عن مستوى التراكمي. SGLT2i هو المفضل بقوة لهبوط القلب.',
      },
      followUp: {
        en: 'Monitor renal function and volume status. Reassess heart failure symptoms.',
        ar: 'راقب وظائف الكلى وحالة السوائل. أعد تقييم أعراض هبوط القلب.',
      },
      warn: {
        en: 'Discontinue metformin during acute, unstable heart failure exacerbations.',
        ar: 'أوقف الميتفورمين خلال نوبات هبوط القلب الحادة وغير المستقرة.',
      },
    },
    sourceIds: ['cardiovascular-risk'],
    tags: ['heart failure', 'SGLT2i', 'GLP-1 RA', 'BNP', 'PAD', 'screening'],
  },
  {
    id: 'ckd-management',
    group: 'complicationsRisk',
    title: {
      en: '11. Chronic Kidney Disease and Risk Management',
      ar: '11. مرض الكلى المزمن وإدارة المخاطر',
    },
    summary: {
      en: 'Guidelines for screening, diagnosis, and comprehensive management of chronic kidney disease (CKD) in diabetes, including the use of ACEi/ARBs, SGLT2 inhibitors, GLP-1 RAs, and MRAs.',
      ar: 'إرشادات الفحص والتشخيص والإدارة الشاملة لمرض الكلى المزمن مع السكري، بما في ذلك استخدام أدوية ACEi/ARBs ومثبطات SGLT2 ومحفزات GLP-1 و MRAs.',
    },
    points: {
      en: [
        'Screening: Assess UACR and eGFR annually. In established CKD, monitor 1-4 times per year.',
        'Treatment: Optimize glucose and BP (<130/80).',
        'ACEi/ARB: First-line for albuminuria (UACR ≥30) or eGFR <60. Do NOT use for primary prevention in normal patients.',
        'SGLT2i: Strongly recommended to reduce CKD progression (initiate if eGFR ≥20).',
        'GLP-1 RA: Recommended for cardiovascular and kidney benefits.',
        'Finerenone: Nonsteroidal MRA is recommended for albuminuria to reduce CKD progression.',
        'Referral: Refer to nephrology if rapidly increasing albuminuria, rapidly decreasing eGFR, or eGFR <30.',
      ],
      ar: [
        'الفحص: افحص الكرياتينين وزلال البول سنوياً. لمرضى الكلى، راقب 1-4 مرات سنوياً.',
        'العلاج: حسن السكر والضغط (الهدف <130/80).',
        'أدوية ACEi/ARB: الخط الأول لزلال البول أو القصور الكلوي. لا تستخدمها كوقاية للمرضى الطبيعيين.',
        'أدوية SGLT2i: موصى بها بشدة لإبطاء تدهور الكلى (ابدأها إذا كان الكرياتينين ≥20).',
        'إبر GLP-1: موصى بها لفوائدها للقلب والكلى.',
        'أدوية Finerenone: موصى بها مع الزلال لتقليل تدهور الكلى.',
        'التحويل: حول المريض لطبيب الكلى إذا تدهورت الوظائف بسرعة أو كان eGFR <30.',
      ],
    },
    practiceNote: {
      en: 'ACE inhibitors and ARBs remain the mainstay for hypertension and CKD with albuminuria, acting synergistically with SGLT2 inhibitors and nonsteroidal MRAs.',
      ar: 'تظل ACEi و ARBs الأساس لعلاج الضغط والكلى مع الزلال، وتعمل بتآزر قوي مع مثبطات SGLT2 و MRAs.',
    },
    details: [
      {
        title: { en: 'Monitoring after Intervention', ar: 'المراقبة بعد التدخل' },
        items: {
          en: [
            'Monitor eGFR and potassium routinely after initiating ACEi, ARB, or MRA.',
            'A mild decrease in eGFR (up to 30%) upon starting RAS blockade is expected and not a reason to stop therapy unless volume depleted.',
          ],
          ar: [
            'راقب الكرياتينين والبوتاسيوم بشكل روتيني بعد بدء ACEi أو ARB أو MRA.',
            'النقص الطفيف في كفاءة الكلى (حتى 30%) عند بدء أدوية الضغط متوقع وليس سبباً لإيقافها ما لم يكن المريض يعاني من الجفاف.',
          ],
        },
      },
    ],
    quickDecision: {
      when: {
        en: 'A patient with diabetes shows evidence of CKD (eGFR <60 or albuminuria).',
        ar: 'مريض سكري تظهر لديه علامات قصور الكلى (كفاءة <60 أو زلال).',
      },
      start: {
        en: 'Start an ACEi or ARB (maximize dose). Add an SGLT2 inhibitor. Consider adding finerenone if albuminuria persists on max RAS blockade.',
        ar: 'ابدأ ACEi/ARB (بأقصى جرعة). أضف SGLT2i. ضع في الاعتبار إضافة finerenone إذا استمر الزلال.',
      },
      followUp: {
        en: 'Monitor UACR and eGFR 1-4 times yearly depending on severity. Refer to nephrology if eGFR <30.',
        ar: 'راقب الكرياتينين والزلال 1-4 مرات سنوياً حسب المرحلة. حول المريض لطبيب كلى إذا كانت الكفاءة <30.',
      },
      warn: {
        en: 'Never combine an ACE inhibitor with an ARB. Avoid starting MRA if potassium is elevated.',
        ar: 'لا تدمج أبداً ACEi مع ARB. تجنب بدء MRA إذا كان البوتاسيوم مرتفعاً.',
      },
    },
    sourceIds: ['kidney-disease'],
    tags: ['CKD', 'kidney', 'eGFR', 'UACR', 'albuminuria', 'SGLT2i', 'ACEi', 'ARB', 'finerenone'],
  },
  {
    id: 'retinopathy-care',
    group: 'complicationsRisk',
    title: {
      en: '12. Microvascular Complications: Retinopathy',
      ar: '12. المضاعفات الدقيقة: اعتلال الشبكية',
    },
    summary: {
      en: 'Guidelines for screening, preventing, and treating diabetic retinopathy, including the use of eye exams, AI screening tools, and treatments like anti-VEGF therapy and photocoagulation.',
      ar: 'إرشادات الفحص والوقاية والعلاج لاعتلال الشبكية السكري، بما في ذلك فحص العين، أدوات الذكاء الاصطناعي، وعلاجات الحقن والليزر.',
    },
    points: {
      en: [
        'Prevention: Optimize glucose, blood pressure, and lipids to slow progression.',
        'Screening: Initial dilated exam at diagnosis (T2D) or 5 years post-diagnosis (T1D). Screen every 1-2 years if no retinopathy; annually if present.',
        'Pregnancy: Counsel on risks before pregnancy. Screen in first trimester and monitor through 1 year postpartum.',
        'Referral: Promptly refer macular edema, moderate/severe nonproliferative, or any proliferative retinopathy to an ophthalmologist.',
        'Treatment: Panretinal laser or anti-VEGF injections reduce vision loss in proliferative disease. Anti-VEGF is first-line for macular edema.',
        'Aspirin: Retinopathy is NOT a contraindication to aspirin therapy.',
      ],
      ar: [
        'الوقاية: ضبط السكر، الضغط، والدهون يبطئ تطور اعتلال الشبكية.',
        'الفحص: فحص قاع عين مبدئي عند التشخيص للنوع الثاني، وبعد 5 سنوات للنوع الأول. الفحص كل 1-2 سنة إذا كانت سليمة، وسنوياً إذا كان بها اعتلال.',
        'الحمل: انصح بمخاطر الحمل. افحص الشبكية في أول 3 شهور وتابعها حتى سنة بعد الولادة.',
        'التحويل: حول المريض لطبيب عيون فوراً عند وجود ارتشاح بالبقعة الصفراء أو اعتلال متوسط/شديد.',
        'العلاج: الليزر أو حقن العين (anti-VEGF) تقلل فقدان البصر. الحقن هي الخط الأول لارتشاح البقعة الصفراء.',
        'الأسبرين: اعتلال الشبكية لا يمنع استخدام الأسبرين.',
      ],
    },
    practiceNote: {
      en: 'Aspirin use does not increase the risk of retinal hemorrhage and should not be withheld if indicated for cardiovascular disease.',
      ar: 'استخدام الأسبرين لا يزيد من خطر نزيف الشبكية ولا ينبغي إيقافه إذا كان مطلوباً لأمراض القلب.',
    },
    details: [
      {
        title: { en: 'Pregnancy and Retinopathy', ar: 'الحمل واعتلال الشبكية' },
        items: {
          en: [
            'Pregnancy can rapidly accelerate the progression of diabetic retinopathy.',
            'Close monitoring (every trimester and up to 1 year postpartum) is essential for women with preexisting diabetes.',
          ],
          ar: [
            'الحمل يمكن أن يسرع تطور اعتلال الشبكية السكري بشكل كبير.',
            'المتابعة الدقيقة (كل ثلث حمل وحتى سنة بعد الولادة) ضرورية للسيدات المصابات بالسكري مسبقاً.',
          ],
        },
      },
    ],
    quickDecision: {
      when: {
        en: 'A patient is due for their regular diabetes follow-up.',
        ar: 'مريض يراجع للمتابعة الدورية للسكري.',
      },
      start: {
        en: 'Check date of last dilated eye exam. Arrange screening if >1 year (or 2 years if low risk).',
        ar: 'تأكد من تاريخ آخر فحص لقاع العين. رتب فحصاً إذا مر أكثر من سنة (أو سنتين للمنخفض الخطورة).',
      },
      followUp: {
        en: 'If retinal changes are detected, ensure follow-up with an ophthalmologist is scheduled.',
        ar: 'إذا تم اكتشاف تغيرات في الشبكية، تأكد من حجز موعد مع طبيب العيون.',
      },
      warn: {
        en: 'Do not ignore vision complaints; refer promptly, as macular edema can occur at any stage of retinopathy.',
        ar: 'لا تتجاهل شكاوى النظر؛ حول المريض فوراً، فارتشاح البقعة الصفراء قد يحدث في أي مرحلة.',
      },
    },
    sourceIds: ['retina-neuro-foot'],
    tags: ['retinopathy', 'eye exam', 'macular edema', 'anti-VEGF', 'photocoagulation', 'pregnancy'],
  },
  {
    id: 'neuropathy-care',
    group: 'complicationsRisk',
    title: {
      en: '12. Microvascular Complications: Neuropathy',
      ar: '12. المضاعفات الدقيقة: اعتلال الأعصاب',
    },
    summary: {
      en: 'Guidelines for assessing and managing diabetic peripheral neuropathy (DPN) and autonomic neuropathy, including screening methods and pain management strategies.',
      ar: 'إرشادات تقييم وإدارة اعتلال الأعصاب الطرفية والمستقلة، بما في ذلك طرق الفحص واستراتيجيات علاج الألم.',
    },
    points: {
      en: [
        'Screening: Assess for peripheral neuropathy at diagnosis (T2D) or 5 years post-diagnosis (T1D), then annually.',
        'Exam Components: Use 10-g monofilament plus one of: temperature, pinprick, or vibration (128-Hz tuning fork).',
        'Autonomic Neuropathy: Assess for orthostatic dizziness, resting tachycardia, or erectile dysfunction if microvascular complications exist.',
        'Treatment: Optimize glucose to prevent progression. Treat pain to improve quality of life using gabapentinoids (pregabalin/gabapentin), SNRIs (duloxetine), or TCAs.',
        'Avoid Opioids: Do NOT use opioids for neuropathic pain due to high risks.',
      ],
      ar: [
        'الفحص: افحص الأعصاب الطرفية عند التشخيص للنوع الثاني وبعد 5 سنوات للنوع الأول، ثم سنوياً.',
        'مكونات الفحص: استخدم فحص المونوفيلامينت (10 جرام) بالإضافة إلى الحرارة، الوخز، أو الاهتزاز.',
        'الأعصاب اللاإرادية: ابحث عن الدوخة عند الوقوف، تسارع النبض وقت الراحة، أو الضعف الجنسي.',
        'العلاج: ضبط السكر يمنع تدهور الأعصاب. عالج الألم لتحسين جودة الحياة باستخدام جابابنتين، بريجابالين، دولوكستين، أو مضادات الاكتئاب.',
        'تجنب الأفيونات: يمنع استخدام المسكنات الأفيونية (مثل الترامادول) لآلام الأعصاب.',
      ],
    },
    practiceNote: {
      en: 'Neuropathic pain treatments do not reverse the underlying nerve damage; they only treat the symptoms. Strict glycemic control is the only proven way to prevent progression.',
      ar: 'علاجات ألم الأعصاب لا تعالج التلف العصبي الكامن وإنما تعالج الأعراض فقط. التحكم الدقيق بالسكر هو الطريقة الوحيدة المثبتة لمنع التدهور.',
    },
    details: [
      {
        title: { en: 'Pharmacologic Pain Management', ar: 'إدارة الألم دوائياً' },
        items: {
          en: [
            'First-line agents: Pregabalin, Duloxetine, Gabapentin, TCAs (e.g., amitriptyline).',
            'Avoid opioids (including tramadol) due to high risks of addiction and adverse events.',
          ],
          ar: [
            'أدوية الخط الأول: بريجابالين، دولوكستين، جابابنتين، ومضادات الاكتئاب (مثل أميتريبتيلين).',
            'تجنب الأفيونات (بما فيها الترامادول) لارتفاع مخاطر الإدمان والآثار الجانبية.',
          ],
        },
      },
    ],
    quickDecision: {
      when: {
        en: 'A patient complains of burning, tingling, or numbness in their feet.',
        ar: 'مريض يشتكي من حرارة، وخز، أو خدر في قدميه.',
      },
      start: {
        en: 'Perform a full neurological foot exam. Initiate first-line pain medication (e.g., pregabalin or duloxetine) if pain impacts quality of life.',
        ar: 'قم بفحص عصبي كامل للقدم. ابدأ بأدوية الخط الأول للألم (مثل بريجابالين أو دولوكستين) إذا كان الألم يؤثر على حياته.',
      },
      followUp: {
        en: 'Reassess pain control and medication side effects in 2-4 weeks. Adjust dose or combine classes if needed.',
        ar: 'أعد تقييم الألم والأعراض الجانبية بعد 2-4 أسابيع. عدل الجرعة أو ادمج بين الأدوية إذا لزم الأمر.',
      },
      warn: {
        en: 'Check for orthostatic hypotension and resting tachycardia, as autonomic neuropathy significantly increases cardiovascular risk.',
        ar: 'افحص هبوط الضغط الانتصابي وتسارع نبض القلب، لاعتلال الأعصاب اللاإرادية يزيد خطورة أمراض القلب.',
      },
    },
    sourceIds: ['retina-neuro-foot'],
    tags: ['neuropathy', 'neuropathic pain', 'gabapentinoids', 'monofilament test', 'autonomic neuropathy'],
  },
  {
    id: 'foot-care',
    group: 'complicationsRisk',
    title: {
      en: '12. Foot Care and Ulcer Prevention',
      ar: '12. العناية بالقدم والوقاية من التقرحات',
    },
    summary: {
      en: 'Comprehensive guidelines for foot evaluation, peripheral artery disease (PAD) screening, preventive self-care education, and management of foot ulcers to prevent amputations.',
      ar: 'إرشادات الفحص الشامل للقدم، الفحص المبكر للشرايين الطرفية، التثقيف الوقائي، وإدارة تقرحات القدم لمنع البتر.',
    },
    points: {
      en: [
        'Annual Exam: Perform a comprehensive foot evaluation annually (skin, deformities, pulses, monofilament, and vibration/pinprick).',
        'High-Risk Patients: Inspect feet at EVERY visit for individuals with sensory loss, prior ulcers, or amputations.',
        'PAD Screening: Screen for peripheral artery disease (pulses/capillary refill). Refer for ABI if claudication or decreased pulses.',
        'Education: Teach daily preventive foot self-care, especially mirror use for those with loss of protective sensation (LOPS).',
        'Specialized Care: Prescribe therapeutic footwear for high-risk patients and refer smokers for cessation programs.',
      ],
      ar: [
        'الفحص السنوي: قم بفحص شامل للقدم سنوياً (الجلد، التشوهات، النبض، والإحساس).',
        'المرضى الخطرين: افحص القدمين في "كل زيارة" لمن لديهم فقدان إحساس أو تقرحات سابقة.',
        'فحص الشرايين: افحص الشرايين الطرفية. حول لعمل أشعة (ABI) إذا كان هناك ألم عند المشي (عرج).',
        'التثقيف: علم المريض العناية الذاتية والفحص اليومي بالمرآة، خصوصاً من فقدوا الإحساس الوقائي.',
        'العناية الخاصة: اصرف أحذية طبية لمرضى الخطورة العالية وحول المدخنين لبرامج الإقلاع.',
      ],
    },
    practiceNote: {
      en: 'Loss of protective sensation (LOPS) means the patient cannot feel the 10-g monofilament. This drastically increases the risk of undetected trauma and ulcers.',
      ar: 'فقدان الإحساس الوقائي (LOPS) يعني أن المريض لا يشعر بضغط 10 جرام. هذا يزيد بشكل كبير من خطر الإصابات غير المكتشفة والتقرحات.',
    },
    details: [
      {
        title: { en: 'Foot Exam Components', ar: 'مكونات فحص القدم' },
        items: {
          en: [
            'Dermatologic: skin integrity, sweating, calluses, fungal infection.',
            'Neurologic: 10-g monofilament AND one of (vibration, pinprick, temperature).',
            'Vascular: dorsalis pedis and posterior tibial pulses.',
          ],
          ar: [
            'جلدياً: سلامة الجلد، التعرق، التصلبات الجلدية (الكالو)، الفطريات.',
            'عصبياً: المونوفيلامينت بالإضافة إلى (الاهتزاز أو الوخز أو الحرارة).',
            'وعائياً: نبضات شرايين القدم.',
          ],
        },
      },
    ],
    quickDecision: {
      when: {
        en: 'A patient has loss of protective sensation (LOPS) or a prior history of foot ulcer.',
        ar: 'مريض لديه فقدان في الإحساس الوقائي أو تاريخ لتقرحات القدم.',
      },
      start: {
        en: 'Remove shoes and socks at EVERY visit to inspect the feet. Prescribe specialized therapeutic footwear.',
        ar: 'اخلع الحذاء والجوارب في "كل زيارة" لفحص القدمين. اصرف له حذاء طبي مخصص.',
      },
      followUp: {
        en: 'Refer to a podiatrist for regular preventive care and callus debridement.',
        ar: 'حول المريض لأخصائي العناية بالقدم للمتابعة الدورية وإزالة التصلبات الجلدية.',
      },
      warn: {
        en: 'Patients with LOPS must never walk barefoot, even indoors, and should visually inspect their shoes before wearing.',
        ar: 'يمنع منعاً باتاً المشي حافياً (حتى داخل المنزل) لمن فقدوا الإحساس، ويجب فحص الحذاء من الداخل قبل ارتدائه.',
      },
    },
    sourceIds: ['retina-neuro-foot'],
    tags: ['foot care', 'diabetic foot ulcer', 'PAD', 'monofilament test', 'amputation prevention'],
  }
];
