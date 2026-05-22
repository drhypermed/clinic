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
        'BP Measurement & Diagnosis: Measure BP at every routine clinical visit. Diagnose hypertension if average BP is ≥130/80 mmHg on ≥2 separate occasions, or ≥180/110 mmHg with cardiovascular disease at a single visit.',
        'BP Targets: Target <130/80 mmHg for most individuals with diabetes to reduce cardiovascular events and albuminuria. Consider a stricter target of <120/80 mmHg for those at high CVD or kidney risk if safely attainable without severe adverse effects.',
        'Initial Therapy (BP ≥130/80): Start lifestyle therapy (DASH diet, weight loss, sodium reduction) and ONE blood pressure-lowering drug.',
        'Initial Therapy (BP ≥150/90): Start lifestyle therapy and TWO blood pressure-lowering drugs of different classes immediately.',
        'Drug Choice (No Albuminuria): First-line options include ACE inhibitors, ARBs, thiazide-like diuretics, or dihydropyridine calcium channel blockers.',
        'Drug Choice (Albuminuria or CAD): An ACE inhibitor or an ARB is strongly recommended as first-line therapy for patients with coronary artery disease or albuminuria (UACR ≥30 mg/g). Maximize the tolerated dose for optimal renal protection.',
        'Combination Warning: NEVER combine an ACE inhibitor with an ARB. Avoid combining an ACEi/ARB with a direct renin inhibitor.',
        'Resistant Hypertension: If BP is not at goal on 3 classes of anti-hypertensives (including a diuretic), consider adding a Mineralocorticoid Receptor Antagonist (MRA) like spironolactone, checking potassium/eGFR closely.',
        'Pregnancy Warning: ACE inhibitors, ARBs, statins, and most non-insulin diabetes meds must be stopped immediately if pregnancy is planned or occurs.',
      ],
      ar: [
        'التشخيص والقياس: قس الضغط في كل زيارة. يُشخص ارتفاع الضغط إذا كان المتوسط ≥130/80 في زيارتين منفصلتين، أو ≥180/110 في زيارة واحدة لمن لديه أمراض قلب.',
        'الأهداف: استهدف ضغطاً أقل من <130/80 لمعظم مرضى السكري. وفكر في تشديد الهدف لأقل من <120/80 لمرضى القلب والكلى إذا أمكن الوصول إليه بأمان وبدون هبوط.',
        'بدء العلاج (≥130/80): ابدأ بتعديل نمط الحياة (تقليل الملح، إنقاص الوزن، حمية DASH) مع دواء واحد لخفض الضغط.',
        'العلاج المزدوج (≥150/90): ابدأ نمط الحياة مع دواءين من عائلتين مختلفتين فوراً.',
        'اختيار الدواء (بدون زلال): الخيارات الأولى هي (ACEi، ARB، مدرات البول الثيازيدية، أو حاصرات قنوات الكالسيوم).',
        'اختيار الدواء (يوجد زلال أو مرض تاجّي): تعتبر أدوية (ACEi) أو (ARB) الخط الأول الإجباري والمفضل بقوة لحماية الكلى والقلب. ارفع الجرعة لأقصى حد يتحمله المريض.',
        'تحذير الدمج: يمنع منعاً باتاً دمج دواء من عائلة (ACEi) مع دواء من عائلة (ARB) لخطر الفشل الكلوي الحاد وارتفاع البوتاسيوم.',
        'الضغط المقاوم: إذا لم ينتظم الضغط على 3 أدوية (منها مدر للبول)، أضف دواء MRA (مثل سبيرونولاكتون) مع مراقبة البوتاسيوم ووظائف الكلى.',
        'تحذير الحمل: أوقف فوراً أدوية الضغط (ACEi/ARB) والستاتين وأغلب أدوية السكري الفموية بمجرد التخطيط للحمل أو حدوثه لتجنب تشوه الجنين.',
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
        'Primary Prevention (Age 40-75, Standard Risk): Start moderate-intensity statin therapy in addition to lifestyle therapy.',
        'Primary Prevention (Age 40-75, High Risk): Start high-intensity statin therapy. Target an LDL-C reduction of ≥50% and an absolute LDL-C goal of <70 mg/dL. High risk includes ≥1 ASCVD risk factor.',
        'Secondary Prevention (Established ASCVD, Any Age): Start high-intensity statin therapy. Target an LDL-C reduction of ≥50% and an absolute LDL-C goal of <55 mg/dL.',
        'Treatment Escalation: If the absolute LDL-C target (<70 or <55 mg/dL) is not met on maximum tolerated statin, add ezetimibe or a PCSK9 inhibitor.',
        'Older Adults (>75 years): If already on statins, continue them. If starting new, moderate-intensity statin may be reasonable after discussing risks/benefits.',
        'Triglycerides (≥500 mg/dL): Treat severe hypertriglyceridemia immediately with diet modification and medication (fibrates or omega-3s) to prevent acute pancreatitis.',
        'Triglycerides (135-499 mg/dL): If on a statin and high CV risk, consider icosapent ethyl. Do NOT routinely combine statins with fibrates (especially gemfibrozil) due to lack of CV benefit and increased risk of myopathy.',
        'Aspirin (Secondary Prevention): Use low-dose aspirin (75-162 mg/day) in all patients with a history of ASCVD. If allergic, use clopidogrel (75 mg/day).',
        'Aspirin (Primary Prevention): Consider low-dose aspirin in those aged ≥50 years with diabetes and ≥1 additional major CV risk factor, IF they are not at increased risk of bleeding.',
      ],
      ar: [
        'وقاية أولية (عمر 40-75، خطورة اعتيادية): ابدأ علاج ستاتين متوسط الشدة بالإضافة لنمط الحياة.',
        'وقاية أولية (عمر 40-75، خطورة عالية): ابدأ ستاتين عالي الشدة. الهدف: خفض الكوليسترول الضار بنسبة ≥50% والوصول لرقم أقل من <70 مجم/ديسيلتر. (الخطورة العالية تعني وجود عامل خطر قلبي إضافي).',
        'وقاية ثانوية (وجود مرض قلب وتصلب شرايين، أي عمر): ابدأ ستاتين عالي الشدة فوراً. الهدف: خفض الكوليسترول الضار بنسبة ≥50% والوصول لرقم أقل من <55 مجم/ديسيلتر.',
        'التصعيد العلاجي: إذا لم يصل المريض لهدف LDL (<70 أو <55) رغم أقصى جرعة ستاتين يتحملها، أضف دواء (Ezetimibe) أو إبر (PCSK9).',
        'كبار السن (>75 عاماً): إذا كان يستخدم الستاتين سابقاً، دعه يستمر. وإذا كانت بداية جديدة، ففكر في ستاتين متوسط الشدة بعد مناقشة الفوائد.',
        'الدهون الثلاثية (≥500): عالج الارتفاع الشديد فوراً بالحمية والأدوية (مثل الفايبرات) لمنع الالتهاب الحاد للبنكرياس.',
        'الدهون الثلاثية (135-499): لا تدمج الستاتين مع الفايبرات روتينياً لعدم وجود فائدة للقلب ولزيادة خطر آلام العضلات. يمكن التفكير في (icosapent ethyl) للمرضى ذوي الخطورة العالية.',
        'الأسبرين (وقاية ثانوية): استخدم الأسبرين بجرعة منخفضة (75-162 مجم/يوم) لجميع مرضى القلب. إذا كان هناك حساسية، استخدم كلوبيدوجريل.',
        'الأسبرين (وقاية أولية): فكر فيه لمن هم أكبر من 50 عاماً ولديهم عامل خطر إضافي للقلب، بشرط ألا يكون لديهم خطر قابلية للنزيف.',
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
        'CAD Screening: Do NOT routinely screen for coronary artery disease in asymptomatic individuals, as it does not improve outcomes beyond treating risk factors.',
        'Heart Failure Screening: Measure BNP or NT-proBNP periodically to screen for asymptomatic (Stage B) heart failure in patients with diabetes, enabling earlier intervention to prevent clinical HF.',
        'PAD Screening: Screen for peripheral arterial disease (PAD) with Ankle-Brachial Index (ABI) in asymptomatic patients aged ≥65, or ≥50 with history of smoking/hypertension. Any patient with claudication needs an ABI.',
        'Heart Failure Treatment: SGLT2 inhibitors are strongly recommended for individuals with diabetes and established heart failure (HFrEF or HFpEF) to reduce HF hospitalizations and CV death, independent of A1C.',
        'HFpEF with Obesity: In patients with heart failure with preserved ejection fraction and obesity, use GLP-1 RAs or dual GIP/GLP-1 RAs to significantly reduce HF symptoms, physical limitations, and weight.',
        'Established ASCVD or High Risk: Incorporate either an SGLT2 inhibitor or a GLP-1 RA with proven CV benefit to reduce Major Adverse Cardiovascular Events (MACE). Using both together provides additive cardiovascular and renal protection.',
        'Metformin in HF: Metformin is safe and may be continued in STABLE heart failure (if eGFR >30). It MUST be discontinued in unstable or hospitalized heart failure due to lactic acidosis risk.',
      ],
      ar: [
        'فحص الشرايين: لا تقم بإجراء فحوصات روتينية لشرايين القلب التاجية (مثل القسطرة أو التخطيط الإجهادي) للمرضى الذين ليس لديهم أعراض.',
        'فحص هبوط القلب: قم بقياس دلالات هبوط القلب (BNP/NT-proBNP) دورياً لاكتشاف هبوط القلب في مراحله المبكرة (Stage B) قبل ظهور الأعراض والبدء بالوقاية.',
        'فحص الشرايين الطرفية: افحص الشرايين بجهاز (ABI) للمرضى ≥65 عاماً، أو ≥50 عاماً إذا كانوا مدخنين. وأي مريض يشتكي من عرج أو ألم الساق عند المشي يحتاج لفحص ABI فوراً.',
        'علاج هبوط القلب: مثبطات SGLT2 موصى بها بشدة وبشكل أساسي لجميع مرضى السكري المصابين بهبوط القلب (سواء بضعف عضلة القلب أو بدون) لتقليل التنويم والوفيات.',
        'هبوط القلب (HFpEF) مع السمنة: استخدم إبر GLP-1 أو GIP/GLP-1 لتخفيف أعراض هبوط القلب وتحسين القدرة البدنية وتقليل الوزن.',
        'مرضى القلب والشرايين (ASCVD): أضف SGLT2i أو GLP-1 RA لخطتهم العلاجية لمنع الجلطات والوفيات. والجمع بين الدواءين يوفر حماية إضافية للقلب والكلى.',
        'الميتفورمين مع هبوط القلب: آمن ويمكن استخدامه إذا كان هبوط القلب "مستقراً". ولكن يُمنع منعاً باتاً استخدامه إذا كان هبوط القلب "غير مستقر" أو احتاج المريض للتنويم في المستشفى.',
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
        'CKD Screening: Assess urinary albumin-to-creatinine ratio (UACR) and estimated glomerular filtration rate (eGFR) at least annually in all patients with T2D, and starting 5 years after diagnosis in T1D.',
        'CKD Monitoring: For patients with established CKD (eGFR <60 or UACR ≥30), monitor UACR and eGFR 1-4 times per year depending on disease stage and risk of progression.',
        'BP Optimization: Target BP <130/80 mmHg. ACE inhibitors or ARBs are first-line therapy for patients with hypertension and albuminuria (UACR ≥30). Do NOT use ACEi/ARBs for primary prevention of CKD in patients with normal BP and normal UACR.',
        'SGLT2 Inhibitors: Highly recommended for patients with T2D and CKD (eGFR ≥20) to reduce CKD progression and cardiovascular events. Once initiated, continue even if eGFR falls below 20, until dialysis is required.',
        'Nonsteroidal MRAs: Finerenone is recommended for patients with T2D and CKD with albuminuria (UACR ≥30) who are on maximum tolerated ACEi/ARB, to further reduce CKD progression and CV events. Monitor potassium closely.',
        'GLP-1 RAs: Consider GLP-1 RAs with proven cardiovascular and kidney benefits for patients with CKD, especially if SGLT2 inhibitors are not tolerated or insufficient.',
        'Dietary Modifications: For non-dialysis CKD stage 3 or higher, restrict dietary protein to 0.8 g/kg body weight per day.',
        'Nephrology Referral: Refer for evaluation if eGFR <30, rapidly declining eGFR, continuously increasing albuminuria despite therapy, or difficult-to-manage hypertension or potassium levels.',
      ],
      ar: [
        'فحص الكلى: افحص زلال البول (UACR) ووظائف الكلى (eGFR) سنوياً على الأقل لمرضى النوع الثاني، وبعد 5 سنوات من التشخيص للنوع الأول.',
        'مراقبة مرضى الكلى: للمصابين بقصور كلوي (الكفاءة <60 أو زلال البول ≥30)، يجب إعادة الفحص من 1 إلى 4 مرات سنوياً حسب مرحلة المرض.',
        'ضبط الضغط: الهدف أقل من 130/80. أدوية ACEi أو ARB هي الأساس إذا وجد زلال في البول. يُمنع استخدامها كوقاية لمن لديهم ضغط طبيعي وبول خالٍ من الزلال.',
        'مثبطات SGLT2: موصى بها بشدة لإبطاء تدهور الكلى وتقليل جلطات القلب (ابدأها إذا كانت كفاءة الكلى ≥20). بمجرد البدء بها، لا توقفها حتى لو انخفضت الكفاءة عن 20، واستمر بها حتى مرحلة الغسيل الكلوي.',
        'دواء Finerenone: دواء جديد (nsMRA) يُنصح بإضافته لمرضى السكري المصابين بزلال البول (≥30) والذين يستخدمون أقصى جرعة من ACEi/ARB، لتقليل تدهور الكلى، مع مراقبة البوتاسيوم بانتظام.',
        'إبر GLP-1: أضفها للعلاج إذا كان المريض لا يتحمل أدوية SGLT2 أو كإضافة لتعزيز حماية الكلى والقلب.',
        'تعديل الغذاء: لمرضى القصور الكلوي (المرحلة 3 وما فوق) غير الخاضعين للغسيل، يجب تحديد كمية البروتين اليومية لتكون (0.8 جم لكل كجم من وزن الجسم).',
        'طبيب الكلى: حوّل المريض لطبيب متخصص فوراً إذا انخفضت كفاءة الكلى عن 30، أو كان هناك تدهور سريع للكلى، أو زلال متزايد باستمرار، أو ضغط/بوتاسيوم يصعب التحكم به.',
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
        'Prevention: Optimize glycemic, blood pressure, and lipid control to significantly reduce the risk and slow the progression of diabetic retinopathy.',
        'Screening Schedule: Perform an initial comprehensive eye exam (dilated or validated ultra-widefield imaging) at the time of diagnosis for T2D, and within 5 years of diagnosis for T1D.',
        'Screening Frequency: If there is no retinopathy, screen every 1–2 years. If any level of retinopathy is present, screen at least annually. Use of AI screening systems is acceptable if they provide FDA-approved results and have a clear referral pathway.',
        'Pregnancy & Retinopathy: Pregnancy drastically accelerates retinopathy. Women with preexisting diabetes planning pregnancy should be counseled on risk. Screen before conception, during the first trimester, and monitor closely up to 1 year postpartum.',
        'Macular Edema Treatment: Intravitreal anti-VEGF injections (e.g., aflibercept, bevacizumab) are the first-line treatment for diabetic macular edema involving the fovea with vision impairment.',
        'Proliferative Disease Treatment: Panretinal photocoagulation (laser therapy) or intravitreal anti-VEGF injections are highly effective in reducing the risk of severe vision loss in high-risk proliferative diabetic retinopathy.',
        'Aspirin Use: The presence of diabetic retinopathy is NOT a contraindication to cardiovascular aspirin therapy, as it does not increase the risk of retinal hemorrhage.',
      ],
      ar: [
        'الوقاية: التحكم الدقيق في السكر، وضغط الدم، والدهون يبطئ بشكل كبير من ظهور وتطور اعتلال الشبكية السكري.',
        'جدول الفحص: يجب فحص قاع العين الشامل (مع توسيع الحدقة أو بتصوير الشبكية المتطور) وقت التشخيص لمرضى النوع الثاني، وخلال 5 سنوات من التشخيص للنوع الأول.',
        'تكرار الفحص: إذا كانت الشبكية سليمة تماماً، يمكن إعادة الفحص كل سنة إلى سنتين. أما إذا ظهر أي اعتلال، فيجب الفحص "سنوياً" كحد أدنى. يُسمح باستخدام كاميرات الفحص المعتمدة على الذكاء الاصطناعي إذا كانت معتمدة وتوفر مسار تحويل واضح.',
        'الحمل واعتلال الشبكية: الحمل يُسرّع جداً من تلف الشبكية. انصح المريضة قبل الحمل، وافحص عينيها قبل الحمل وفي الثلث الأول منه، وتابعها بعناية حتى مرور سنة بعد الولادة.',
        'علاج ارتشاح البقعة الصفراء: الحقن داخل العين بمضادات (anti-VEGF) هو العلاج الأول والأساسي لارتشاح مركز الإبصار (Macular edema) الذي يؤثر على الرؤية.',
        'علاج الشبكية التكاثري (النزيفي): العلاج بالليزر (Panretinal photocoagulation) أو الحقن المستمر (anti-VEGF) فعالان جداً في منع فقدان البصر للشبكية التكاثرية عالية الخطورة.',
        'استخدام الأسبرين: وجود اعتلال ونزيف بالشبكية "لا يمنع" استخدام الأسبرين لحماية القلب، حيث أثبتت الدراسات أن الأسبرين لا يزيد من حدة نزيف الشبكية.',
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
        'Peripheral Neuropathy Screening: Screen all patients for diabetic peripheral neuropathy (DPN) at the time of diagnosis for T2D, and 5 years after diagnosis for T1D, then at least annually.',
        'Clinical Examination: The exam must include the 10-g monofilament test (to detect loss of protective sensation) PLUS at least one other test: temperature, pinprick, or vibration sensation (using a 128-Hz tuning fork).',
        'Autonomic Neuropathy Screening: Ask patients with microvascular complications about symptoms of autonomic neuropathy: orthostatic dizziness, resting tachycardia, unexpected hypoglycemia (due to gastroparesis), and erectile dysfunction or genitourinary symptoms.',
        'Prevention: Optimization of glucose control is the ONLY proven way to prevent or delay the development of neuropathy in T1D, and to slow its progression in T2D.',
        'Pain Management: Treat neuropathic pain to improve quality of life. Initial pharmacologic treatments include gabapentinoids (pregabalin, gabapentin), SNRIs (duloxetine, venlafaxine), or tricyclic antidepressants (amitriptyline, nortriptyline).',
        'Opioid Warning: Strongly avoid opioids (including tapentadol and tramadol) for the treatment of diabetic neuropathic pain due to high risks of addiction, lack of long-term efficacy, and serious side effects.',
      ],
      ar: [
        'فحص الأعصاب الطرفية: افحص جميع المرضى للكشف عن اعتلال الأعصاب عند التشخيص (النوع الثاني)، وبعد 5 سنوات من التشخيص (النوع الأول)، ثم سنوياً كحد أدنى.',
        'مكونات الفحص السريري: يجب أن يشمل الفحص جهاز "المونوفيلامينت 10 جرام" (لاختبار فقدان الإحساس الوقائي) بالإضافة لاختبار واحد آخر على الأقل: الإحساس بالحرارة، أو الوخز بالإبرة، أو الاهتزاز (بواسطة الشوكة الرنانة 128 هرتز).',
        'الأعصاب اللاإرادية (الذاتية): اسأل المرضى المصابين بمضاعفات دقيقة عن أعراض الأعصاب اللاإرادية: دوخة عند الوقوف (هبوط انتصابي)، تسارع نبض القلب وقت الراحة، هبوط سكر مفاجئ (بسبب شلل المعدة)، وضعف الانتصاب أو مشاكل التبول.',
        'الوقاية: الضبط الدقيق والمبكر لمستويات السكر هو الطريقة "الوحيدة" المثبتة علمياً لمنع أو تأخير تلف الأعصاب في النوع الأول، وإبطاء تدهوره في النوع الثاني.',
        'علاج الألم: عالج ألم الأعصاب لتحسين نوم المريض وجودة حياته. أدوية الخط الأول تشمل: (جابابنتين، بريجابالين)، أو أدوية (SNRI) مثل (دولوكستين، فنلافاكسين)، أو مضادات الاكتئاب ثلاثية الحلقات (أميتريبتيلين، نورتريبتيلين).',
        'تحذير من المسكنات الأفيونية: تجنب تماماً ومطلقاً إعطاء المسكنات الأفيونية (بما فيها الترامادول) لعلاج آلام الأعصاب السكرية، نظراً لغياب الفاعلية على المدى الطويل وارتفاع مخاطر الإدمان والمضاعفات.',
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
        'Comprehensive Annual Exam: Perform a full foot evaluation at least annually to identify risk factors for ulcers and amputations. The exam must assess skin (dryness, calluses), structural deformities, vascular status (pulses), and neurological status (10-g monofilament plus vibration/pinprick).',
        'High-Risk Foot Protocol: For patients with evidence of sensory loss (LOPS), prior foot ulcers, or amputations, the feet MUST be visually inspected at EVERY single clinical visit. Instruct them to take their shoes and socks off before you enter the room.',
        'Peripheral Arterial Disease (PAD): Check pedal pulses. Screen for PAD with an Ankle-Brachial Index (ABI) if pulses are diminished or if the patient reports claudication. Refer to vascular surgery if ABI is abnormal.',
        'Preventive Education: Provide structured education on daily preventive foot care. Teach patients with sensory loss to visually inspect the bottoms of their feet daily (using a mirror) and to check the inside of their shoes for foreign objects before wearing.',
        'Therapeutic Footwear: Recommend specialized therapeutic footwear (custom-molded shoes or inserts) for patients with severe neuropathy, foot deformities, or a history of ulcers to relieve pressure points.',
        'Tobacco Cessation: Actively counsel patients with foot complications to stop smoking, as tobacco drastically impairs peripheral circulation and wound healing.',
      ],
      ar: [
        'الفحص الشامل السنوي: أجرِ تقييماً كاملاً للقدم سنوياً لاكتشاف عوامل الخطر قبل حدوث التقرحات. يشمل الفحص: سلامة الجلد (الجفاف، التصلبات)، التشوهات العظمية، النبض الوعائي، وفحص الأعصاب (المونوفيلامينت مع الاهتزاز/الوخز).',
        'بروتوكول الخطورة العالية: لمرضى السكري الذين يعانون من فقدان الإحساس أو لديهم تقرحات سابقة، يجب "إجبارياً" فحص القدم بصرياً في "كل زيارة عيادة". اطلب من المريض خلع حذائه وجواربه بمجرد دخوله للعيادة.',
        'أمراض الشرايين الطرفية (PAD): افحص نبض شرايين القدم. اطلب فحص (ABI) إذا كان النبض ضعيفاً أو اشتكى المريض من ألم بعضلات الساق عند المشي (عرج متقطع). وحوّل المريض لجراحة الأوعية الدموية إذا لزم الأمر.',
        'التثقيف الوقائي: قدم تعليماً منظماً حول العناية اليومية. علم المرضى فاقدي الإحساس ضرورة فحص باطن أقدامهم يومياً "باستخدام مرآة"، وأهمية تفقد الحذاء من الداخل باليد لاكتشاف أي حصى أو أشياء حادة قبل ارتدائه.',
        'الأحذية العلاجية: اصرف وصفة طبية للحصول على أحذية علاجية مخصصة (تُفصل خصيصاً) للمرضى الذين يعانون من اعتلال عصبي شديد، أو تشوهات في القدم، أو تاريخ تقرحات لتخفيف الضغط وتوزيع وزن الجسم.',
        'إيقاف التدخين: التدخين يدمر الدورة الدموية الطرفية ويمنع التئام الجروح. وجه المريض بقوة لبرامج الإقلاع عن التدخين لحماية قدميه من البتر.',
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
