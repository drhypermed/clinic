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
        '10.1–10.2 (E, A): Measure BP at every visit. Diagnose hypertension if average BP ≥130/80 mmHg over ≥2 occasions, or ≥180/110 mmHg with CVD at a single visit. Counsel on home BP monitoring.',
        '10.3–10.4 (B, A): Individualize BP targets. The general target is <130/80 mmHg if safely attained. A systolic target <120 mmHg should be encouraged for high CV/kidney risk.',
        '10.5 (A): For BP >120/80 mmHg, advise lifestyle modifications (weight loss, DASH diet, sodium reduction, exercise, smoking cessation).',
        '10.6–10.7 (A): Initiate pharmacotherapy if confirmed BP ≥130/80. If BP ≥150/90, initiate two drugs or a single-pill combination promptly.',
        '10.8–10.9 (A): Use drug classes proven to reduce CV events (ACEi, ARBs, CCBs, diuretics). Do not combine ACEi, ARBs, and direct renin inhibitors.',
        '10.10–10.11 (B): ACEi or ARB is strongly recommended for albuminuria (UACR ≥30) or eGFR <60 to prevent kidney disease progression. Monitor eGFR and potassium.',
        '10.12 (A): Avoid ACEi, ARBs, MRAs, and direct renin inhibitors in individuals of childbearing potential not using reliable contraception.',
        '10.13 (A): Consider adding an MRA for resistant hypertension (not at goal on 3 classes including a diuretic).',
      ],
      ar: [
        '10.1–10.2 (E, A): قس الضغط في كل زيارة. يُشخص ارتفاع الضغط إذا كان المتوسط ≥130/80 في زيارتين فأكثر، أو ≥180/110 مع أمراض قلب في زيارة واحدة. انصح بالمراقبة المنزلية للضغط.',
        '10.3–10.4 (B, A): حدد هدف الضغط فردياً. الهدف العام هو أقل من 130/80 إذا كان آمناً. يُشجع على هدف انقباضي أقل من 120 لمرضى القلب والكلى عالي الخطورة.',
        '10.5 (A): للضغط >120/80، انصح بتغيير نمط الحياة (نزول الوزن، حمية DASH، تقليل الصوديوم، الرياضة، وقف التدخين).',
        '10.6–10.7 (A): ابدأ العلاج الدوائي إذا كان الضغط المؤكد ≥130/80. وإذا كان ≥150/90، ابدأ بدواءين أو حبة مركبة فوراً.',
        '10.8–10.9 (A): استخدم أدوية تقلل جلطات القلب (ACEi، ARBs). يمنع دمج ACEi مع ARBs.',
        '10.10–10.11 (B): يوصى بشدة بـ ACEi أو ARB لمن لديهم زلال في البول (UACR ≥30) أو وظائف كلى eGFR <60 لحماية الكلى. راقب الكرياتينين والبوتاسيوم.',
        '10.12 (A): تجنب استخدام ACEi و ARBs و MRAs للنساء في سن الإنجاب دون وسيلة منع حمل موثوقة (ممنوعة في الحمل).',
        '10.13 (A): فكر في إضافة MRA لارتفاع الضغط المقاوم (لا يستجيب لـ 3 أدوية منها مدر للبول).',
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
    sourceIds: ['cardiovascular-disease'],
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
        '10.15–10.17 (A, C, E): Obtain a lipid profile at diagnosis/initial evaluation. For those on statins, check lipids 4–12 weeks after initiation/dose change and annually thereafter.',
        '10.18–10.19 (A, C): For primary prevention in ages 40–75 without ASCVD, use moderate-intensity statins. In ages 20-39 with additional ASCVD risk factors, statins may be reasonable.',
        '10.20–10.21 (A, B): In ages 40–75 with higher CV risk/multiple risk factors, use high-intensity statin (target LDL reduction ≥50% and LDL <70 mg/dL). Add ezetimibe or PCSK9i if target not met.',
        '10.26–10.28 (A, B, E): For ANY age with established ASCVD (secondary prevention), use high-intensity statins targeting LDL reduction ≥50% and LDL <55 mg/dL. Add ezetimibe, PCSK9i, or bempedoic acid if goal not met or if statin intolerant.',
        '10.29–10.32 (A, B, C): For triglycerides ≥500 mg/dL, treat to prevent pancreatitis. For triglycerides 150-499 mg/dL in patients on statins with managed LDL, adding icosapent ethyl can reduce CV risk. Fibrates or niacin are not recommended with statins.',
        '10.33–10.34 (A, B): Use aspirin (75-162 mg/day) for secondary prevention in those with a history of ASCVD (or clopidogrel if allergic).',
        '10.36 (A): Aspirin may be considered for primary prevention in increased CV risk patients after discussing bleeding risks.',
      ],
      ar: [
        '10.15–10.17 (A, C, E): افحص الدهون عند التشخيص. لمستخدمي الستاتين، افحص بعد 4-12 أسبوع من البدء/تغيير الجرعة، ثم سنوياً.',
        '10.18–10.19 (A, C): للوقاية الأولية (أعمار 40-75 بدون أمراض قلب)، استخدم ستاتين متوسط الشدة. في أعمار 20-39 مع عوامل خطر أخرى، قد يكون الستاتين مناسباً.',
        '10.20–10.21 (A, B): للأعمار 40-75 المعرضين لخطر أعلى للقلب، استخدم ستاتين عالي الشدة لخفض LDL بنسبة ≥50% وهدف LDL <70. يمكن إضافة إزيتيميب أو PCSK9i إذا لم يتحقق الهدف.',
        '10.26–10.28 (A, B, E): لأي عمر مع أمراض قلب سابقة (وقاية ثانوية)، استخدم ستاتين عالي الشدة لهدف LDL <55. أضف إزيتيميب أو PCSK9i أو حمض بيمبيدويك إذا لم يتحقق الهدف أو لعدم تحمل الستاتين.',
        '10.29–10.32 (A, B, C): للدهون الثلاثية ≥500، عالج لمنع التهاب البنكرياس. للمرضى على الستاتين ولديهم دهون ثلاثية 150-499، إضافة icosapent ethyl يقلل الخطر. لا يوصى بدمج الفايبرات أو النياسين مع الستاتين.',
        '10.33–10.34 (A, B): استخدم الأسبرين (75-162 ملجم) كوقاية ثانوية لمن لديهم تاريخ جلطات أو أمراض قلب (أو كلوبيدوجريل عند الحساسية).',
        '10.36 (A): يمكن استخدام الأسبرين كوقاية أولية لمن لديهم خطورة عالية بعد نقاش مخاطر النزيف.',
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
    sourceIds: ['cardiovascular-disease'],
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
        '10.37 (A, E): Routine screening for coronary artery disease in asymptomatic individuals is not recommended. Investigate only if signs, symptoms, or ECG abnormalities are present.',
        '10.38 (B, A): Consider screening for stage B heart failure using natriuretic peptides (BNP or NT-proBNP) in asymptomatic adults. Echocardiography is recommended if levels are abnormal.',
        '10.39 (B): Screen for PAD with ankle-brachial index testing in asymptomatic individuals ≥65 years, or with microvascular/foot complications.',
        '10.40 (A, B): In established ASCVD or CKD, an SGLT2 inhibitor or GLP-1 RA with proven CV benefit is recommended. Combining both may be considered for additive risk reduction.',
        '10.41 (A): In established heart failure (HFrEF or HFpEF), an SGLT2i with proven benefit is recommended to reduce worsening HF and CV death, and improve quality of life.',
        '10.42, 10.44f (A): For CKD with albuminuria, use a nonsteroidal MRA (finerenone) to improve CV outcomes, reduce CKD progression, and decrease HF hospitalization.',
        '10.44a–10.44c (A, B): For asymptomatic (stage B) HF, optimize ACEi/ARB, β-blockers, and SGLT2 inhibitors to prevent progression to symptomatic HF.',
        '10.44d–10.44e (A, B): For obesity and symptomatic HFpEF, use dual GIP/GLP-1 RA or GLP-1 RA for symptom reduction.',
        '10.45 (B): Metformin may be continued in stable HF if eGFR >30, but avoid in unstable/hospitalized HF individuals.',
      ],
      ar: [
        '10.37 (A, E): الفحص الروتيني لشرايين القلب للمرضى بلا أعراض غير موصى به. افحص فقط عند وجود أعراض، علامات، أو تغيرات في تخطيط القلب.',
        '10.38 (B, A): فكر في الفحص المبكر لهبوط القلب (مرحلة B) باستخدام إنزيمات (BNP/NT-proBNP) للمرضى بلا أعراض. يوصى بالأشعة التلفزيونية للقلب (إيكو) إذا كانت الإنزيمات غير طبيعية.',
        '10.39 (B): افحص الشرايين الطرفية (PAD) بمؤشر الكاحل-العضد (ABI) لمن هم ≥65 سنة، أو لديهم مضاعفات دقيقة أو مشاكل بالقدم.',
        '10.40 (A, B): لمرضى جلطات القلب السابقة أو الكلى (ASCVD/CKD)، يوصى بـ SGLT2i أو GLP-1 RA. يمكن دمج الاثنين لتقليل المخاطر بشكل أكبر.',
        '10.41 (A): لمرضى هبوط القلب (بنوعيه)، يوصى باستخدام مثبطات SGLT2 لتقليل تدهور الهبوط وتحسين جودة الحياة.',
        '10.42, 10.44f (A): لمرضى الكلى مع زلال، استخدم nonsteroidal MRA (finerenone) لتحسين القلب وتقليل تطور الفشل الكلوي وتنويم هبوط القلب.',
        '10.44a–10.44c (A, B): لهبوط القلب بدون أعراض (مرحلة B)، استخدم ACEi/ARB وحاصرات بيتا و SGLT2i لمنع تطور المرض لظهور أعراض.',
        '10.44d–10.44e (A, B): لمرضى السمنة مع هبوط قلب محافظ (HFpEF) وأعراض، استخدم GIP/GLP-1 أو GLP-1 RA لتقليل الأعراض.',
        '10.45 (B): الميتفورمين آمن في هبوط القلب المستقر (إذا كان الكرياتينين يسمح)، ولكن تجنبه في هبوط القلب غير المستقر أو المنومين.',
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
    sourceIds: ['cardiovascular-disease'],
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
        '11.1 (B): Assess kidney function with UACR and eGFR at least annually for type 1 diabetes (duration ≥5 years) and all type 2 diabetes. For established CKD, monitor 1–4 times per year depending on stage.',
        '11.2 (B): Aim to reduce urinary albumin by ≥30% in people with CKD and albuminuria ≥300 mg/g to slow progression.',
        '11.3 (B): For CKD stage G3+, protein intake should be 0.8 g/kg/day. For dialysis, 1.0–1.2 g/kg/day.',
        '11.4–11.5 (A): Optimize glucose and aim for BP <130/80 mmHg (or <120 systolic if safely attainable) to reduce CKD risk/progression.',
        '11.6 (B, A): Use ACEi or ARB for moderately increased albuminuria (UACR 30-299) and strongly recommended for severe albuminuria (UACR ≥300) or eGFR <60. Do NOT use them for primary prevention in normal BP, UACR, and eGFR.',
        '11.7 (A): For type 2 diabetes and CKD, use an SGLT2 inhibitor to reduce CKD progression and CV events (initiate if eGFR ≥20, can continue until kidney failure). A GLP-1 RA with proven benefit is also recommended.',
        '11.8–11.9 (A, B): To reduce CKD progression and CV events with albuminuria, a nonsteroidal MRA (finerenone) is recommended. Simultaneous initiation of SGLT2i and nsMRA can be considered.',
        '11.10 (B): Avoid potentially harmful kidney-protective medications (like ACEi/ARB) in pregnancy or individuals of childbearing potential not using reliable contraception.',
        '11.11 (C, A): SGLT2i can be safely continued if eGFR <20 (not on dialysis). For patients on dialysis, GLP-1 RAs not dependent on kidney clearance can be initiated/continued.',
        '11.12 (A): Refer to a nephrologist if rapidly increasing albuminuria, rapidly decreasing eGFR, eGFR <30, or for uncertainty regarding etiology or management.',
      ],
      ar: [
        '11.1 (B): افحص وظائف الكلى (الكرياتينين والزلال UACR) سنوياً على الأقل لمرضى النوع الأول (مدة ≥5 سنوات) وجميع مرضى النوع الثاني. لمرضى الكلى المؤكدين، راقب 1-4 مرات سنوياً حسب المرحلة.',
        '11.2 (B): استهدف تقليل زلال البول بنسبة ≥30% لمن لديهم زلال ≥300 لإبطاء تدهور الكلى.',
        '11.3 (B): لمرضى الكلى مرحلة 3 فأكثر، تناول البروتين 0.8 جم/كجم/يوم. لمرضى الغسيل الكلوي 1.0-1.2 جم/كجم/يوم.',
        '11.4–11.5 (A): حسن مستوى السكر والضغط لهدف <130/80 (أو انقباضي <120 إن كان آمناً) لتقليل المخاطر.',
        '11.6 (B, A): استخدم ACEi/ARB لزلال البول المتوسط (30-299) ويوصى بشدة للزلال الشديد (≥300) أو الكرياتينين (eGFR <60). لا تستخدمها كوقاية أولية للضغط والزلال الطبيعي.',
        '11.7 (A): لمرضى السكري والقصور الكلوي، استخدم SGLT2i (ابدأ إذا الكفاءة ≥20 واستمر حتى الفشل الكلوي). ويوصى أيضاً باستخدام GLP-1 RA.',
        '11.8–11.9 (A, B): يوصى باستخدام (finerenone) لتقليل التدهور ومخاطر القلب. يمكن دمجه مع SGLT2i بأمان.',
        '11.10 (B): تجنب أدوية حماية الكلى التي قد تضر الجنين (مثل ACEi/ARB) أثناء الحمل أو لمن يخططون له.',
        '11.11 (C, A): يمكن الاستمرار على SGLT2i لمن لديهم eGFR <20 (بدون غسيل). لمرضى الغسيل الكلوي، يمكن البدء/الاستمرار على GLP-1 RA التي لا تعتمد على إخراج الكلى.',
        '11.12 (A): حوّل المريض لطبيب كلى إذا زاد الزلال بسرعة، أو تدهورت الوظائف بسرعة، أو الكرياتينين eGFR <30، أو لصعوبة الحالة.',
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
    sourceIds: ['ckd-risk-management'],
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
        '12.1–12.2 (A): Optimize glycemic, blood pressure, and lipid control to reduce the risk or slow progression of diabetic retinopathy.',
        '12.3–12.4 (B): Initial dilated eye exam: at diagnosis for type 2 diabetes, and 5 years after onset for type 1 diabetes.',
        '12.5 (B): If no retinopathy and glycemia is controlled, screen every 1–2 years. If retinopathy is present, screen at least annually.',
        '12.6 (B): Retinal photography with remote reading or FDA-approved AI algorithms are appropriate screening strategies, provided there is a pathway for timely referral.',
        '12.7–12.8 (B): Counsel on retinopathy risk before pregnancy. Eye exams should occur before pregnancy, in the first trimester, and monitored throughout pregnancy and 1 year postpartum.',
        '12.9 (A): Promptly refer any macular edema, moderate/severe nonproliferative retinopathy, or any proliferative retinopathy to an experienced ophthalmologist.',
        '12.10–12.11 (A): Panretinal laser photocoagulation or intravitreous anti-VEGF injections reduce vision loss in proliferative diabetic retinopathy.',
        '12.12 (A): Intravitreous anti-VEGF is the first-line treatment for diabetic macular edema involving the foveal center.',
        '12.14 (A): Retinopathy is not a contraindication to aspirin therapy for cardioprotection.',
        '12.15–12.16 (E): Refer individuals with vision loss for vision rehabilitation and provide educational materials for eye care support.',
      ],
      ar: [
        '12.1–12.2 (A): تحسين السكر والضغط والدهون لتقليل خطر وإبطاء تطور اعتلال الشبكية.',
        '12.3–12.4 (B): فحص قاع العين الأولي: عند التشخيص للنوع الثاني، وبعد 5 سنوات من التشخيص للنوع الأول.',
        '12.5 (B): إذا لم يكن هناك اعتلال والسكر منتظم، يمكن الفحص كل 1-2 سنة. إذا كان هناك اعتلال، افحص سنوياً على الأقل.',
        '12.6 (B): تصوير الشبكية عن بعد أو باستخدام الذكاء الاصطناعي (المعتمد) هي استراتيجيات فحص مناسبة بشرط وجود مسار للتحويل العاجل.',
        '12.7–12.8 (B): انصح بمخاطر اعتلال الشبكية قبل الحمل. يجب فحص العين قبل الحمل، في الثلث الأول، والمتابعة خلال الحمل وسنة بعد الولادة.',
        '12.9 (A): حول المريض فوراً لطبيب عيون مختص عند وجود أي ارتشاح في البقعة الصفراء، أو اعتلال شبكية تكاثري أو ما قبل التكاثري (المتوسط/الشديد).',
        '12.10–12.11 (A): العلاج بالليزر (Panretinal) أو حقن العين (anti-VEGF) تقلل فقدان البصر في اعتلال الشبكية التكاثري.',
        '12.12 (A): حقن العين (anti-VEGF) هي الخط الأول لعلاج ارتشاح البقعة الصفراء السكري المؤثر على مركز الرؤية.',
        '12.14 (A): وجود اعتلال بالشبكية لا يمنع استخدام الأسبرين لحماية القلب.',
        '12.15–12.16 (E): حول مرضى ضعف البصر لبرامج التأهيل البصري ووفر لهم مواد تثقيفية داعمة.',
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
    sourceIds: ['retinopathy-neuropathy-foot-care'],
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
        '12.17 (B): Assess for peripheral neuropathy at diagnosis for type 2 diabetes and 5 years after diagnosis for type 1 diabetes, then at least annually.',
        '12.18 (B): Assessment should include history, temperature or pinprick sensation, vibration (128-Hz tuning fork), and annual 10-g monofilament testing to identify foot ulcer risk.',
        '12.19 (E): Assess for autonomic neuropathy (orthostatic dizziness, syncope, resting tachycardia, early satiety, erectile dysfunction, sweating changes) at the same intervals or if other microvascular complications exist.',
        '12.20 (B, C): Optimize glucose, weight, blood pressure, and lipids to prevent or slow progression of neuropathy.',
        '12.21–12.22 (E, B): Treat neuropathic pain to improve quality of life. Initial pharmacological treatments include gabapentinoids, SNRIs, TCAs, and sodium channel blockers. Combinations can provide additional relief. Opioids should NOT be used.',
      ],
      ar: [
        '12.17 (B): افحص الأعصاب الطرفية عند التشخيص للنوع الثاني، وبعد 5 سنوات للنوع الأول، ثم سنوياً على الأقل.',
        '12.18 (B): يجب أن يشمل الفحص التاريخ المرضي، فحص الإحساس بالحرارة أو الوخز، فحص الاهتزاز (بشوكة رنانة 128 هرتز)، وفحص المونوفيلامينت (10 جرام) السنوي لتحديد خطر تقرح القدم.',
        '12.19 (E): افحص علامات اعتلال الأعصاب اللاإرادية (الدوخة عند الوقوف، الإغماء، تسارع نبض القلب وقت الراحة، الشبع المبكر، الضعف الجنسي، تغير التعرق) بنفس الفترات أو عند وجود مضاعفات أخرى.',
        '12.20 (B, C): حسن مستوى السكر، الوزن، الضغط، والدهون لمنع أو إبطاء تطور اعتلال الأعصاب.',
        '12.21–12.22 (E, B): عالج آلام الأعصاب لتحسين جودة الحياة. أدوية الخط الأول تشمل جابابنتينويد، SNRIs، ومضادات الاكتئاب ثلاثية الحلقات. يمكن الدمج بينها. لا ينبغي استخدام الأفيونات.',
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
    sourceIds: ['retinopathy-neuropathy-foot-care'],
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
        '12.23–12.24 (B): Perform a comprehensive foot evaluation annually. Inspect skin, assess deformities, check pulses, and perform neurological tests (10-g monofilament + pinprick/temperature/vibration).',
        '12.25 (A): Inspect feet at EVERY visit for individuals with sensory loss, prior ulcers, or amputations.',
        '12.26 (B): Obtain a history of ulcers, amputations, Charcot foot, vascular surgery, smoking, retinopathy, and renal disease.',
        '12.27 (B): Screen for PAD (pulses, capillary refill). Refer for ankle-brachial index if claudication, leg fatigue, or decreased pulses are present.',
        '12.28 (B): Use an interprofessional team (including a podiatrist) for high-risk feet (dialysis, Charcot foot, PAD, prior ulcers).',
        '12.29 (A, B): Refer smokers with high-risk feet to specialists for ongoing care and provide smoking cessation counseling.',
        '12.30 (B): Provide preventive foot self-care education to all, especially daily surveillance using a mirror for those with loss of protective sensation (LOPS).',
        '12.31 (B): Recommend specialized therapeutic footwear for high-risk individuals (LOPS, deformities, poor circulation).',
        '12.32 (A): For chronic ulcers failing standard care, consider adjunctive treatments (negative-pressure therapy, skin substitutes, topical oxygen).',
      ],
      ar: [
        '12.23–12.24 (B): قم بفحص شامل للقدم سنوياً (فحص الجلد، التشوهات، النبض، والفحص العصبي بالمونوفيلامينت والوخز/الاهتزاز).',
        '12.25 (A): افحص القدمين في "كل زيارة" لمن يعانون من فقدان الإحساس أو تقرحات/بتر سابق.',
        '12.26 (B): اسأل عن تاريخ التقرحات، البتر، قدم شاركوت، جراحات الأوعية الدموية، التدخين، ومشاكل الكلى والشبكية.',
        '12.27 (B): افحص الشرايين الطرفية (PAD). حول لعمل أشعة الأوعية (ABI) إذا كان هناك ألم عند المشي (عرج) أو ضعف في النبض.',
        '12.28 (B): استخدم فريقاً طبياً متكاملاً (بما في ذلك أخصائي القدم) للمرضى ذوي الخطورة العالية (مرضى الغسيل الكلوي، قدم شاركوت، تقرحات سابقة).',
        '12.29 (A, B): حوّل المدخنين ذوي الأقدام عالية الخطورة للمختصين للمتابعة مدى الحياة، وانصحهم بقوة بوقف التدخين.',
        '12.30 (B): ثقف الجميع حول العناية الذاتية بالقدم، خاصة الفحص اليومي (باستخدام مرآة) لمن فقدوا الإحساس الوقائي.',
        '12.31 (B): يوصى باستخدام أحذية طبية مخصصة لمرضى الخطورة العالية (فقد الإحساس، تشوهات، ضعف الدورة الدموية).',
        '12.32 (A): للقرح المزمنة التي لا تستجيب للعلاج العادي، فكر في العلاجات المتقدمة (مثل العلاج بالضغط السلبي أو بدائل الجلد).',
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
    sourceIds: ['retinopathy-neuropathy-foot-care'],
    tags: ['foot care', 'diabetic foot ulcer', 'PAD', 'monofilament test', 'amputation prevention'],
  }
];
