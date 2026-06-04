import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_15_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch15-preconception',
    group: '15. Management of Diabetes in Pregnancy',
    sourceIds: ['15-management-of-diabetes-in-pregnancy-pdf', 'pregnancy'],
    tags: ['Preconception', 'A1C', 'Teratogenic', 'Retinopathy'],
    title: {
      en: 'Preconception Care and Planning',
      ar: 'التخطيط والرعاية ما قبل الحمل (Preconception Care)'
    },
    summary: {
      en: 'The golden rule: good planning before pregnancy prevents most complications. Strict A1C targets and stopping teratogenic medications.',
      ar: 'القاعدة الذهبية: التخطيط الجيد قبل الحمل يمنع أغلب المضاعفات.'
    },
    points: {
      en: [
        'A1C Target: All women of childbearing age must be counseled on the importance of achieving an A1C of less than 6.5% before conception to reduce the risk of congenital anomalies (which occur in the first 5-8 weeks of fetal development), and to reduce the chances of preterm birth and preeclampsia.',
        'Stopping Dangerous Medications: Medications must be reviewed, and types unsafe for pregnancy must be stopped immediately upon planning for it. This includes blood pressure medications (ACE inhibitors and ARBs), most cholesterol medications (Statins), and modern weight-loss/diabetes medications like (GLP-1 RAs), which must be stopped at least two months prior to conception due to their long half-life in the body.',
        'Retinal Screening: A comprehensive fundus exam must be performed before pregnancy and in the first trimester, as rapid lowering of blood sugar can lead to sudden retinal deterioration.'
      ],
      ar: [
        'الهدف التراكمي: يجب توجيه جميع النساء في سن الإنجاب لأهمية الوصول لسكر تراكمي (A1C) أقل من 6.5% قبل حدوث الحمل، لتقليل خطر التشوهات الخلقية (التي تحدث في الأسابيع الأولى 5-8 من تكوين الجنين)، وتقليل فرص الولادة المبكرة وتسمم الحمل.',
        'إيقاف الأدوية الخطرة: يجب مراجعة الأدوية وإيقاف الأنواع غير الآمنة للحمل فور التخطيط له. يشمل ذلك أدوية الضغط (ACE inhibitors و ARBs)، ومعظم أدوية الكوليسترول (Statins)، وأدوية إنقاص الوزن والسكري الحديثة مثل (GLP-1 RAs) التي يجب إيقافها قبل الحمل بشهرين على الأقل نظراً لبقائها في الجسم لفترة طويلة.',
        'فحص الشبكية: يجب إجراء فحص قاع عين شامل قبل الحمل وفي الثلث الأول منه، لأن الخفض السريع للسكر قد يؤدي لتدهور مفاجئ في شبكية العين.'
      ]
    }
  },
  {
    id: 'ada-2026-ch15-targets',
    group: '15. Management of Diabetes in Pregnancy',
    sourceIds: ['15-management-of-diabetes-in-pregnancy-pdf', 'pregnancy'],
    tags: ['A1C', 'Daily Monitoring', 'Glucose Goals'],
    title: {
      en: 'Stricter Glycemic Targets During Pregnancy',
      ar: 'أهداف السكر أثناء الحمل (أكثر صرامة)'
    },
    summary: {
      en: 'Pregnancy physiology changes necessitate highly precise daily blood sugar monitoring and stricter goals.',
      ar: 'تتغير فسيولوجيا الجسم أثناء الحمل، مما يستدعي أهدافاً أكثر دقة ومراقبة يومية.'
    },
    points: {
      en: [
        'Daily Monitoring: The recommended blood sugar targets are: Fasting less than 95 mg/dL, 1 hour postprandial less than 140 mg/dL, or 2 hours postprandial less than 120 mg/dL.',
        'A1C: Due to increased red blood cell turnover during pregnancy, A1C naturally falls physiologically. Therefore, the ideal goal during pregnancy is less than 6.0% (and can be relaxed to 7.0% to avoid severe hypoglycemia). However, it is not recommended to rely on A1C as the sole metric or a substitute for daily blood sugar monitoring.'
      ],
      ar: [
        'القياس اليومي: أهداف السكر الموصى بها هي: الصائم أقل من 95 مجم/ديسيلتر، وبعد ساعة من الأكل أقل من 140، أو بعد ساعتين أقل من 120.',
        'السكر التراكمي (A1C): بسبب زيادة تجدد خلايا الدم الحمراء أثناء الحمل، ينخفض مستوى التراكمي بشكل فسيولوجي طبيعي. لذا، الهدف المثالي أثناء الحمل هو أقل من 6.0% (ويمكن تخفيفه إلى 7.0% لتجنب الهبوط الشديد). لكن لا يُنصح بالاعتماد على التراكمي كمعيار وحيد أو بديل عن قياس السكر اليومي.'
      ]
    }
  },
  {
    id: 'ada-2026-ch15-medications',
    group: '15. Management of Diabetes in Pregnancy',
    sourceIds: ['15-management-of-diabetes-in-pregnancy-pdf', 'pregnancy'],
    tags: ['Insulin', 'Metformin', 'Sulfonylureas', 'PCOS'],
    title: {
      en: 'Pharmacological Treatment: Insulin is the Cornerstone',
      ar: 'العلاج الدوائي: الإنسولين هو الأساس'
    },
    summary: {
      en: 'Major updates downgrading oral medications like Metformin and reaffirming Insulin as the absolute first choice.',
      ar: 'تحديثات هامة جداً بخصوص الأدوية الفموية وتأكيد أن الإنسولين هو الخيار الأول والمفضل.'
    },
    points: {
      en: [
        'Insulin is the first and preferred choice: For treating Type 1, Type 2, and Gestational Diabetes Mellitus (GDM). It is effective, safe, and does not cross the placenta to reach the fetus.',
        'Metformin and Sulfonylureas (Downgraded Recommendation): Metformin (Glucophage) or sulfonylureas (like Glyburide) are NOT recommended as first-line treatments for GDM because both cross the placenta. Recent studies show that children exposed to Metformin during pregnancy are born with lower birth weights, but later experience accelerated growth, leading to a higher BMI and increased risk of childhood obesity.',
        'PCOS Patients: If a woman is using Metformin to induce ovulation, it MUST be stopped by the end of the first trimester and there is no need to continue it.'
      ],
      ar: [
        'الإنسولين هو الخيار الأول والمفضل: لعلاج السكري من النوع الأول، والثاني، وسكري الحمل (GDM). فهو فعال وآمن ولا يعبر المشيمة ليصل للجنين.',
        'الميتفورمين والسلفونيل يوريا (تراجع التوصية): لا يُنصح باستخدام الميتفورمين (الجلوكوفاج) أو السلفونيل يوريا (مثل الجلايبورايد) كخط علاج أول لسكري الحمل. السبب هو أن كلاهما يعبر المشيمة. الدراسات الحديثة أظهرت أن الأطفال الذين تعرضوا للميتفورمين أثناء الحمل يولدون بوزن أقل، لكنهم يعانون لاحقاً من تسارع في النمو يؤدي لارتفاع مؤشر كتلة الجسم وزيادة خطر السمنة في مرحلة الطفولة.',
        'مرضى تكيس المبايض (PCOS): إذا كانت السيدة تستخدم الميتفورمين لتحفيز التبويض، يجب إيقافه بنهاية الثلث الأول من الحمل ولا يوجد داعٍ للاستمرار عليه.'
      ]
    }
  },
  {
    id: 'ada-2026-ch15-tech',
    group: '15. Management of Diabetes in Pregnancy',
    sourceIds: ['15-management-of-diabetes-in-pregnancy-pdf', 'pregnancy'],
    tags: ['CGM', 'TIR', 'AID'],
    title: {
      en: 'Technology and Continuous Glucose Monitoring (CGM)',
      ar: 'التكنولوجيا ومراقبة السكر المستمرة (CGM)'
    },
    summary: {
      en: 'The importance of CGM in pregnancy, specialized TIR targets, and cautions regarding smart pumps.',
      ar: 'استخدام أجهزة المراقبة المستمرة والنطاق المستهدف (TIR) الخاص بالحمل ومحاذير المضخات الذكية.'
    },
    points: {
      en: [
        'CGM use is strongly recommended for pregnant patients with Type 1, as it improves outcomes and reduces the risk of macrosomia (large birth weight) and neonatal hypoglycemia.',
        'Time In Range (TIR) for pregnancy: This differs from non-pregnant individuals; blood sugar must remain between (63 - 140 mg/dL) for more than 70% of the time.',
        'Smart Pumps (AID): Automated Insulin Delivery systems can be used, but with extreme caution and with the help of specialized medical teams, because most currently available devices do not have algorithms customized for strict pregnancy targets (they target higher numbers than required for pregnant women).'
      ],
      ar: [
        'يُوصى بشدة باستخدام أجهزة المراقبة المستمرة (CGM) للمريضات بالنوع الأول، لأنها تحسن النتائج وتقلل من خطر العملقة (ولادة طفل كبير الحجم) وانخفاض سكر حديثي الولادة.',
        'النطاق المستهدف (TIR) للحمل: يختلف عن غير الحوامل؛ حيث يجب أن يظل السكر بين (63 - 140 مجم/ديسيلتر) لأكثر من 70% من الوقت.',
        'المضخات الذكية (AID): يمكن استخدام أنظمة الضخ الآلي للإنسولين، ولكن بحذر شديد وبمساعدة فرق طبية متخصصة، لأن معظم الأجهزة الحالية المتاحة لا تحتوي على خوارزميات مخصصة لأهداف الحمل الصارمة (تستهدف أرقاماً أعلى من المطلوب للحوامل).'
      ]
    }
  },
  {
    id: 'ada-2026-ch15-preeclampsia',
    group: '15. Management of Diabetes in Pregnancy',
    sourceIds: ['15-management-of-diabetes-in-pregnancy-pdf', 'pregnancy'],
    tags: ['Preeclampsia', 'Aspirin', 'Blood Pressure'],
    title: {
      en: 'Blood Pressure and Preeclampsia Prevention',
      ar: 'ضغط الدم والوقاية من تسمم الحمل (Preeclampsia)'
    },
    summary: {
      en: 'Aspirin prophylaxis guidelines to prevent preeclampsia and blood pressure targets.',
      ar: 'الوقاية من تسمم الحمل باستخدام الأسبرين وأهداف ضغط الدم للحوامل.'
    },
    points: {
      en: [
        'Aspirin for Prevention: It is recommended to prescribe a low dose of Aspirin (100 - 150 mg daily, or 162 mg) to ALL pregnant women with Type 1 or Type 2 starting from week (12-16) of pregnancy to reduce the risk of developing preeclampsia.',
        'Blood Pressure Goal: The new target for initiating or adjusting pharmacological blood pressure treatment during pregnancy is less than 140/90 mmHg, and treatment should be reduced if blood pressure drops below 90/60 mmHg.'
      ],
      ar: [
        'الأسبرين للوقاية: يُوصى بوصف جرعة منخفضة من الأسبرين (100 - 150 مجم يومياً، أو 162 مجم) لجميع الحوامل المصابات بالنوع الأول أو الثاني بدءاً من الأسبوع (12-16) من الحمل لتقليل خطر الإصابة بتسمم الحمل.',
        'هدف الضغط: الهدف الجديد لبدء أو تعديل العلاج الدوائي لضغط الدم أثناء الحمل هو أقل من 140/90 ملم زئبق، وتخفيف العلاج إذا انخفض الضغط لأقل من 90/60.'
      ]
    }
  },
  {
    id: 'ada-2026-ch15-postpartum',
    group: '15. Management of Diabetes in Pregnancy',
    sourceIds: ['15-management-of-diabetes-in-pregnancy-pdf', 'pregnancy'],
    tags: ['Postpartum', 'Insulin Resistance', 'Breastfeeding', 'GDM'],
    title: {
      en: 'Postpartum Care',
      ar: 'الرعاية ما بعد الولادة (Postpartum Care)'
    },
    summary: {
      en: 'Managing the drastic physiological changes post-delivery, breastfeeding benefits, and GDM follow-up.',
      ar: 'إدارة الانخفاض المفاجئ في متطلبات الإنسولين، أهمية الرضاعة الطبيعية، ومتابعة سكري الحمل مدى الحياة.'
    },
    points: {
      en: [
        'Severe drop in insulin needs: Immediately upon delivery of the placenta, the body\'s insulin resistance drops massively and suddenly. Therefore, the mother\'s insulin doses MUST be reduced immediately (sometimes dropping by 34% compared to pre-pregnancy doses) to avoid severe hypoglycemia.',
        'Breastfeeding: Strongly recommended for all mothers, providing a dual benefit: it reduces the child\'s risk of obesity and asthma, and reduces the mother\'s risk of developing Type 2 diabetes later (especially for those who had GDM).',
        'GDM Follow-up: Women who had gestational diabetes must be screened postpartum between 4 to 12 weeks using the Oral Glucose Tolerance Test (OGTT), with a necessity for regular lifelong screening every 1-3 years to catch any development of overt diabetes early.'
      ],
      ar: [
        'انخفاض حاد في جرعات الإنسولين: فور ولادة المشيمة، تقل مقاومة الجسم للإنسولين بشكل هائل ومفاجئ. لذا، يجب تقليل جرعات الإنسولين للأم فوراً (تنخفض أحياناً بنسبة 34% عن جرعة ما قبل الحمل) لتجنب هبوط السكر الشديد.',
        'الرضاعة الطبيعية: يُوصى بها بقوة لجميع الأمهات، ولها فائدة مزدوجة؛ فهي تقلل من خطر إصابة الطفل بالسمنة والربو، وتقلل من خطر إصابة الأم بالسكري من النوع الثاني لاحقاً (خاصة لمن أصبن بسكري الحمل).',
        'متابعة سكري الحمل (GDM): السيدات اللاتي أصبن بسكري الحمل يجب فحصهن بعد الولادة بفترة تتراوح بين 4 إلى 12 أسبوعاً باستخدام اختبار تحمل الجلوكوز (OGTT)، مع ضرورة الفحص الدوري كل 1-3 سنوات مدى الحياة لاكتشاف أي تطور لسكري صريح مبكراً.'
      ]
    }
  },
  {
    id: 'ada-2026-ch15-conclusion',
    group: '15. Management of Diabetes in Pregnancy',
    sourceIds: ['15-management-of-diabetes-in-pregnancy-pdf', 'pregnancy'],
    tags: ['Conclusion', 'Summary'],
    title: {
      en: 'Conclusion',
      ar: 'الخلاصة'
    },
    summary: {
      en: 'This chapter emphasizes the absolute necessity of rigorous preconception planning. It confirms Insulin as the gold standard for treatment, downgrades oral alternatives like Metformin due to fetal implications, and highlights the crucial need to adjust insulin doses immediately postpartum.',
      ar: 'يؤكد هذا الفصل على الضرورة القصوى للتخطيط قبل الحمل، ويثبت أن الإنسولين هو المعيار الذهبي للعلاج، محذراً من الأدوية الفموية كالميتفورمين نظراً لتأثيرها المستقبلي على الطفل، مع أهمية التخفيض الفوري لجرعات الإنسولين بعد الولادة لتجنب هبوط السكر المميت.'
    },
    points: {
      en: [],
      ar: []
    }
  }
];
