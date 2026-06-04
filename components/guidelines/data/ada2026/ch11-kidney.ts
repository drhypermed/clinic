import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_11_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch11-screening',
    group: '11. Chronic Kidney Disease and Risk Management',
    sourceIds: ['11-chronic-kidney-disease-and-risk-management-pdf', 'kidney'],
    tags: ['Screening', 'eGFR', 'UACR', 'Albuminuria'],
    title: {
      en: 'Routine Screening and Correct Diagnosis',
      ar: 'الفحص الدوري والتشخيص الصحيح'
    },
    summary: {
      en: 'Clear guidelines on how and when to screen for Chronic Kidney Disease (CKD), and when to suspect non-diabetic causes.',
      ar: 'إرشادات واضحة حول كيفية ومتى يتم فحص الكلى، ومتى نشك في أسباب أخرى غير السكري.'
    },
    points: {
      en: [
        'How to screen: Kidney function must be evaluated annually using two tests together: Urine Albumin-to-Creatinine Ratio (UACR) from a random urine sample, and estimated Glomerular Filtration Rate (eGFR). Relying on standard urine dipsticks is not recommended; precise quantitative testing is required.',
        'Who and When: Screening is done annually for those with Type 1 (5 years after diagnosis) and for all those with Type 2 (immediately upon diagnosis). If CKD is confirmed, the frequency increases to 1 to 4 times annually depending on the disease stage.',
        'Albuminuria Classification: Considered normal if < 30 mg/g, moderately increased (30-299 mg/g), and severely increased if ≥ 300 mg/g.',
        'Suspecting Other Causes: Diabetes is not always the sole culprit. Another cause should be suspected and the patient referred to a nephrologist if: severe albuminuria appears without diabetic retinopathy (especially in Type 1), there is a very rapid decline in kidney function, or red blood cells or casts are present in the urine.'
      ],
      ar: [
        'كيفية الفحص: يجب تقييم وظائف الكلى سنوياً باستخدام اختبارين معاً: نسبة الألبومين إلى الكرياتينين في عينة بول عشوائية (UACR)، ومعدل الترشيح الكبيبي المقدر (eGFR). لا يُنصح بالاعتماد على شرائط البول العادية، بل يجب إجراء الفحص الكمي الدقيق.',
        'لمن ومتى؟ يُجرى الفحص سنوياً للمصابين بالنوع الأول (بعد 5 سنوات من التشخيص) ولجميع المصابين بالنوع الثاني (فور التشخيص)، وإذا تم تأكيد الإصابة بمرض الكلى، تزيد وتيرة الفحص لتصبح من 1 إلى 4 مرات سنوياً حسب مرحلة المرض.',
        'تصنيف الزلال: يُعتبر طبيعياً إذا كان أقل من 30 مجم/جم، ومرتفعاً بشكل متوسط (30-299 مجم/جم)، ومرتفعاً بشدة إذا كان ≥ 300 مجم/جم.',
        'متى نشك في أسباب أخرى غير السكري؟ السكري ليس دائماً الجاني الوحيد. يجب الشك في وجود سبب آخر وتحويل المريض لطبيب كلى إذا: ظهر زلال شديد بدون وجود اعتلال في شبكية العين (خاصة في النوع الأول)، أو كان هناك انخفاض سريع جداً في وظائف الكلى، أو وجود خلايا دم حمراء أو ترسبات في البول.'
      ]
    }
  },
  {
    id: 'ada-2026-ch11-nutrition',
    group: '11. Chronic Kidney Disease and Risk Management',
    sourceIds: ['11-chronic-kidney-disease-and-risk-management-pdf', 'kidney'],
    tags: ['Nutrition', 'Protein', 'Dialysis'],
    title: {
      en: 'Nutrition and Lifestyle for Kidney Patients',
      ar: 'التغذية ونمط الحياة لمرضى الكلى'
    },
    summary: {
      en: 'Correcting misconceptions about protein restriction in CKD and dialysis patients.',
      ar: 'تصحيح المفاهيم الخاطئة حول المنع التام للبروتين لمرضى الكلى والغسيل الكلوي.'
    },
    points: {
      en: [
        'Protein Amount: There is a misconception that protein must be completely restricted. The guide recommends that kidney patients (stages 3 to 5 prior to dialysis) consume the same recommended protein amount for a normal person, which is 0.8 grams per kilogram of body weight daily. Avoid excessive protein as it accelerates kidney deterioration, and avoid severe restriction as it does not improve glucose or kidney function.',
        'Dialysis Patients: Contrary to what some might think, it is recommended to INCREASE the protein amount for dialysis patients to (1.0 - 1.2 g/kg/day) to compensate for losses and prevent malnutrition and muscle weakness.'
      ],
      ar: [
        'كمية البروتين: هناك مفهوم خاطئ بضرورة منع البروتين تماماً. الدليل يوصي بأن يتناول مرضى الكلى (المراحل 3 إلى 5 قبل الغسيل) نفس كمية البروتين الموصى بها للشخص الطبيعي وهي 0.8 جرام لكل كيلوجرام من وزن الجسم يومياً. تجنب الإفراط في البروتين لأنه يسرع من تدهور الكلى، وتجنب النقص الشديد لأنه لا يحسن السكر أو وظائف الكلى.',
        'مرضى الغسيل الكلوي: على عكس ما يظنه البعض، يُنصح بزيادة كمية البروتين لمرضى الغسيل الكلوي لتصل إلى (1.0 - 1.2 جرام/كجم/يوم) لتعويض الفاقد ومنع سوء التغذية وضعف العضلات.'
      ]
    }
  },
  {
    id: 'ada-2026-ch11-goals',
    group: '11. Chronic Kidney Disease and Risk Management',
    sourceIds: ['11-chronic-kidney-disease-and-risk-management-pdf', 'kidney'],
    tags: ['A1C', 'Blood Pressure', 'Hypoglycemia'],
    title: {
      en: 'Glucose and Blood Pressure Goals',
      ar: 'أهداف السكر وضغط الدم'
    },
    summary: {
      en: 'The importance of relaxing glycemic targets in advanced CKD and tightening blood pressure goals.',
      ar: 'أهمية تخفيف أهداف السكر لتجنب الهبوط في المراحل المتقدمة، وصرامة أهداف ضغط الدم.'
    },
    points: {
      en: [
        'Glucose Goals (A1C): In advanced stages of kidney disease, the risk of hypoglycemia increases, and the A1C test becomes less accurate. Therefore, relaxing treatment targets is recommended to avoid hypos, and alternatives like "Fructosamine" testing can be used.',
        'Blood Pressure: The primary goal is to reach a BP less than 130/80 mmHg. The new update recommends encouraging a systolic pressure of less than 120 mmHg if it can be achieved safely.'
      ],
      ar: [
        'أهداف السكر (A1C): في المراحل المتقدمة من مرض الكلى، يزداد خطر التعرض لهبوط السكر، كما يصبح فحص التراكمي (A1C) أقل دقة. لذلك يُنصح بتخفيف الأهداف العلاجية لتجنب الهبوط، ويمكن الاعتماد على بدائل مثل تحليل "الفركتوزامين".',
        'ضغط الدم: الهدف الأساسي هو الوصول لضغط أقل من 130/80 ملم زئبق. والتحديث الجديد يوصي بتشجيع الوصول بالضغط الانقباضي إلى أقل من 120 ملم زئبق إذا أمكن تحقيق ذلك بأمان.'
      ]
    }
  },
  {
    id: 'ada-2026-ch11-bp-meds',
    group: '11. Chronic Kidney Disease and Risk Management',
    sourceIds: ['11-chronic-kidney-disease-and-risk-management-pdf', 'kidney'],
    tags: ['ACEi', 'ARB', 'Creatinine'],
    title: {
      en: 'Blood Pressure Medications (ACEi & ARBs) - Golden Rules',
      ar: 'أدوية الضغط (ACEi و ARBs) - قواعد ذهبية'
    },
    summary: {
      en: 'Crucial rules regarding the cornerstone blood pressure medications used for kidney protection.',
      ar: 'قواعد هامة وحاسمة تخص أدوية الضغط الأساسية المستخدمة لحماية الكلى.'
    },
    points: {
      en: [
        'Indications: Highly recommended as the first-line choice for treating hypertension if there is albuminuria (above 30 mg/g) or if kidney function (eGFR) is less than 60. The dose must be titrated to the maximum tolerated by the patient.',
        'Important Contraindications - No Primary Prevention: These drugs should not be prescribed to a diabetic patient with normal blood pressure and no albuminuria for the purpose of "kidney protection".',
        'Important Contraindications - No Combining: It is strictly forbidden to combine an ACE inhibitor with an ARB due to lack of benefit and increased risk of acute kidney failure and high potassium.',
        'Phantom Creatinine Rise: When starting these medications (or SGLT2i), creatinine may rise by up to 30%. This rise is normal due to changes in intrarenal blood pressure and is not acute kidney failure, and the medication MUST NOT be stopped as long as the patient is not dehydrated.'
      ],
      ar: [
        'دواعي الاستخدام: يوصى بها بشدة كخيار أول لعلاج الضغط إذا كان هناك زلال بول (أعلى من 30 مجم/جم) أو إذا كانت وظائف الكلى (eGFR) أقل من 60. ويجب رفع الجرعة للحد الأقصى الذي يتحمله المريض.',
        'لا تستخدم للوقاية الأولية: لا ينبغي وصف هذه الأدوية لمريض سكري ضغطه طبيعي ولا يعاني من زلال في البول بغرض "وقاية الكلى".',
        'الدمج ممنوع: يُمنع تماماً الجمع بين دواء من عائلة (ACEi) ودواء من عائلة (ARBs) لعدم وجود فائدة ولزيادة خطر الفشل الكلوي الحاد وارتفاع البوتاسيوم.',
        'ارتفاع الكرياتينين الوهمي: عند بدء هذه الأدوية (أو أدوية SGLT2i)، قد يرتفع الكرياتينين بنسبة تصل إلى 30%. هذا الارتفاع طبيعي بسبب تغير ضغط الدم داخل الكلى ولا يعتبر فشلاً كلوياً حاداً، ويجب عدم إيقاف الدواء بسببه طالما المريض لا يعاني من جفاف.'
      ]
    }
  },
  {
    id: 'ada-2026-ch11-modern-meds',
    group: '11. Chronic Kidney Disease and Risk Management',
    sourceIds: ['11-chronic-kidney-disease-and-risk-management-pdf', 'kidney'],
    tags: ['SGLT2', 'GLP-1', 'Finerenone'],
    title: {
      en: 'The Revolution of Modern Kidney-Protective Drugs',
      ar: 'ثورة الأدوية الحديثة لحماية الكلى'
    },
    summary: {
      en: 'Three major drug classes have radically transformed CKD treatment, protecting kidneys and extending life independent of glucose lowering.',
      ar: 'تغيرت خريطة العلاج جذرياً بفضل ثلاث عائلات دوائية تحمي الكلى وتطيل عمرها بشكل مستقل عن خفض السكر.'
    },
    points: {
      en: [
        'SGLT2 inhibitors: Highly recommended for Type 2 patients with eGFR of 20 or higher. These drugs have proven their ability to slow kidney deterioration and prevent failure entirely independent of their glucose-lowering ability.',
        'SGLT2 Update: If kidney function drops below 20 while using the drug, it is safe to continue taking it until the patient reaches the dialysis stage.',
        'GLP-1 RAs: Strongly used to reduce the risk of heart disease and slow kidney decline. A major advantage is that they can be initiated or continued even for patients on dialysis to reduce their mortality and cardiac risks.',
        'Finerenone (nsMRA): A modern drug recommended for diabetic patients suffering from declining kidney function (eGFR ≥ 25) with albuminuria, due to its high efficacy in slowing the disease and preventing cardiac complications. Potassium levels must be monitored after a month of use.',
        'Dual Intervention: Based on recent studies, prescribing SGLT2 inhibitors along with Finerenone simultaneously can be considered for patients with high albuminuria to increase kidney protection efficacy.'
      ],
      ar: [
        'عائلة (SGLT2 inhibitors): تُوصى بشدة لمرضى النوع الثاني الذين لديهم كفاءة كلى (eGFR) تبلغ 20 فأكثر. أثبتت هذه الأدوية قدرتها على إبطاء تدهور الكلى ومنع الفشل الكلوي بشكل مستقل تماماً عن قدرتها على خفض السكر.',
        'تحديث هام حول (SGLT2): إذا انخفضت كفاءة الكلى لأقل من 20 أثناء استخدام الدواء، يُمكن الاستمرار في تناوله بأمان حتى يصل المريض لمرحلة الغسيل الكلوي.',
        'عائلة (GLP-1 RAs): تُستخدم بقوة لتقليل خطر أمراض القلب وإبطاء تدهور الكلى. ميزتها الكبرى أنه يمكن البدء بها أو الاستمرار عليها حتى للمرضى الذين يغسلون الكلى، لتقليل وفيات ومخاطر القلب لديهم.',
        'دواء الفينيرينون (Finerenone - nsMRA): دواء حديث يوصى به لمرضى السكري الذين يعانون من تراجع وظائف الكلى (eGFR ≥ 25) مع وجود زلال في البول، لفعاليته العالية في إبطاء المرض ومنع المضاعفات القلبية. يجب فقط مراقبة مستويات البوتاسيوم بعد شهر من استخدامه.',
        'التدخل المزدوج: بناءً على الدراسات الحديثة، يُمكن التفكير في وصف (SGLT2 inhibitors) مع (Finerenone) في نفس الوقت للمرضى ذوي الزلال المرتفع لزيادة فعالية حماية الكلى.'
      ]
    }
  },
  {
    id: 'ada-2026-ch11-pregnancy',
    group: '11. Chronic Kidney Disease and Risk Management',
    sourceIds: ['11-chronic-kidney-disease-and-risk-management-pdf', 'kidney'],
    tags: ['Pregnancy', 'Teratogenic'],
    title: {
      en: 'Pregnancy and Kidney Medications',
      ar: 'الحمل وأدوية الكلى'
    },
    summary: {
      en: 'A critical warning regarding the teratogenic nature of many kidney-protective drugs during pregnancy.',
      ar: 'تحذير هام حول خطورة أدوية حماية الكلى وتأثيرها المشوه أثناء الحمل.'
    },
    points: {
      en: [
        'During pregnancy, kidney protection medications (ACE inhibitors, ARBs, SGLT2 inhibitors, MRAs) are considered teratogenic and highly harmful to the fetus. Pregnancy must be planned in advance, and these medications must be stopped and replaced with safe alternatives prior to conception.'
      ],
      ar: [
        'خلال فترة الحمل، تعتبر أدوية حماية الكلى (ACE inhibitors, ARBs, SGLT2 inhibitors, MRAs) أدوية مشوهة للأجنة ومضرة جداً. يجب التخطيط المسبق للحمل وإيقاف هذه الأدوية واستبدالها ببدائل آمنة قبل حدوث الحمل.'
      ]
    }
  },
  {
    id: 'ada-2026-ch11-referral',
    group: '11. Chronic Kidney Disease and Risk Management',
    sourceIds: ['11-chronic-kidney-disease-and-risk-management-pdf', 'kidney'],
    tags: ['Referral', 'Nephrologist'],
    title: {
      en: 'When to Refer to a Nephrologist',
      ar: 'متى يتم التحويل لطبيب كلى مختص (Nephrologist)؟'
    },
    summary: {
      en: 'Clear indications on when specialized nephrology care is required.',
      ar: 'مؤشرات واضحة متى يتطلب الأمر تدخلاً من استشاري أمراض الكلى.'
    },
    points: {
      en: [
        'Decline in kidney function (eGFR) to less than 30 for proactive preparation for advanced treatment options or dialysis.',
        'Rapid decline in kidney function or rapid spike in albuminuria.',
        'Difficulty controlling blood pressure, high potassium, or CKD-associated anemia.'
      ],
      ar: [
        'تراجع وظائف الكلى (eGFR) لأقل من 30 للتحضير الاستباقي لخيارات العلاج المتقدمة أو الغسيل.',
        'التدهور السريع في وظائف الكلى أو الارتفاع السريع في الزلال.',
        'صعوبة السيطرة على ضغط الدم أو ارتفاع البوتاسيوم أو الأنيميا المرتبطة بالكلى.'
      ]
    }
  },
  {
    id: 'ada-2026-ch11-conclusion',
    group: '11. Chronic Kidney Disease and Risk Management',
    sourceIds: ['11-chronic-kidney-disease-and-risk-management-pdf', 'kidney'],
    tags: ['Conclusion', 'Summary'],
    title: {
      en: 'Conclusion',
      ar: 'الخلاصة'
    },
    summary: {
      en: 'Chapter 11 confirms that kidney protection is no longer confined to merely lowering blood sugar or restricting protein. Aggressive early screening with precise quantitative tools, utilizing breakthrough medications (SGLT2i, GLP-1 RAs, Finerenone), and understanding the phantom rise in creatinine are the keys to preserving kidney function and avoiding dialysis.',
      ar: 'الفصل الحادي عشر يؤكد أن حماية الكلى لم تعد تقتصر على مجرد خفض السكر أو تقليل البروتين. الفحص الاستباقي الدقيق، واستخدام الأدوية الحديثة (SGLT2i, GLP-1 RAs, Finerenone)، وفهم الارتفاع الوهمي للكرياتينين، هي المفاتيح للحفاظ على الكلى ومنع الوصول لمرحلة الغسيل.'
    },
    points: {
      en: [],
      ar: []
    }
  }
];
