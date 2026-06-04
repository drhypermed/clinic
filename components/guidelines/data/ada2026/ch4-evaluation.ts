import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_4_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch4-communication',
    group: '4. Comprehensive Medical Evaluation',
    sourceIds: ['4-comprehensive-medical-evaluation-and-assessment-of-comorbidities-pdf', 'evaluation'],
    tags: ['Communication', 'Patient-Centered', 'Language'],
    title: {
      en: 'Patient-Centered Care and Communication Language',
      ar: 'لغة التواصل والرعاية المرتكزة على المريض'
    },
    summary: {
      en: 'The guidelines emphasize a precise roadmap for patient evaluation, noting that diabetes is not just a number to lower but a systemic condition.',
      ar: 'يقدم الدليل خريطة طريق دقيقة لكيفية فحص المريض وتقييم حالته الصحية من كافة النواحي، مع التأكيد على أن السكري ليس مجرد رقم يجب خفضه.'
    },
    points: {
      en: [
        'Language Makes a Difference: The guide stresses the importance of using positive, non-judgmental language. For example, it is recommended to avoid the word "Diabetic" and use "Person with diabetes" instead.',
        'Avoid Scolding: Terms like "Nonadherent" or "Noncompliant" should be avoided because they put the patient on the defensive. Instead, focus on collaborative problem solving to overcome obstacles.'
      ],
      ar: [
        'اللغة تصنع الفارق: يشدد الدليل على أهمية استخدام لغة إيجابية وخالية من إطلاق الأحكام المسبقة. على سبيل المثال، يُنصح بتجنب كلمة "مريض سكري" (Diabetic) واستخدام "شخص مصاب بالسكري" (Person with diabetes).',
        'الابتعاد عن التوبيخ: يجب تجنب مصطلحات مثل "غير ملتزم" أو "غير مطيع" (Nonadherent/Noncompliant) لأنها تضع المريض في موقف دفاعي، وبدلاً من ذلك يجب التركيز على التعاون المشترك لحل المشكلات وتجاوز العقبات.'
      ]
    }
  },
  {
    id: 'ada-2026-ch4-immunizations',
    group: '4. Comprehensive Medical Evaluation',
    sourceIds: ['4-comprehensive-medical-evaluation-and-assessment-of-comorbidities-pdf', 'evaluation'],
    tags: ['Immunizations', 'Vaccines', 'Infections'],
    title: {
      en: 'Immunizations and Vaccines',
      ar: 'التطعيمات والتحصينات (Immunizations)'
    },
    summary: {
      en: 'Patients with diabetes are more susceptible to severe complications when infected, so the guide recommends a routine vaccination schedule.',
      ar: 'مرضى السكري أكثر عرضة للمضاعفات عند الإصابة بالعدوى، لذا يوصي الدليل بجدول تطعيمات روتيني.'
    },
    points: {
      en: [
        'Influenza: Annual vaccine for all patients (older than 6 months).',
        'Hepatitis B: For adults under 60 years of age not previously vaccinated.',
        'Pneumococcal: For all patients to prevent severe pneumonia.',
        'RSV (Respiratory Syncytial Virus): For older adults (60 years and above) at risk, and universally for everyone from age 75.',
        'COVID-19: Updated doses to reduce the risk of severe symptoms.'
      ],
      ar: [
        'الإنفلونزا: تطعيم سنوي لجميع المرضى (فوق 6 أشهر).',
        'الكبد الوبائي (B): للبالغين الذين تقل أعمارهم عن 60 عاماً غير المطعمين سابقاً.',
        'المكورات الرئوية (Pneumococcal): لجميع المرضى لمنع الالتهاب الرئوي الحاد.',
        'الفيروس المخلوي التنفسي (RSV): لكبار السن (60 عاماً فما فوق) المعرضين للخطر، وللجميع من سن 75 عاماً.',
        'كوفيد-19: الجرعات المحدثة لتقليل خطر الأعراض الشديدة.'
      ]
    }
  },
  {
    id: 'ada-2026-ch4-liver',
    group: '4. Comprehensive Medical Evaluation',
    sourceIds: ['4-comprehensive-medical-evaluation-and-assessment-of-comorbidities-pdf', 'evaluation'],
    tags: ['Liver', 'MASLD', 'MASH', 'FIB-4'],
    title: {
      en: 'Liver Health (MASLD & MASH) - Core Update',
      ar: 'صحة الكبد (MASLD & MASH) - تحديث جوهري'
    },
    summary: {
      en: 'A major update: NAFLD is now termed MASLD (Metabolic Dysfunction-Associated Steatotic Liver Disease) to clarify its link to insulin resistance and obesity.',
      ar: 'هذا من أهم المحاور المحدثة. تم تغيير مصطلح الكبد الدهني غير الكحولي (NAFLD) إلى (MASLD - مرض الكبد الدهني المرتبط بالخلل الأيضي) لتوضيح ارتباطه الوثيق بمقاومة الإنسولين والسمنة.'
    },
    points: {
      en: [
        'Screening Shift: Do not rely on liver enzymes (ALT/AST) for diagnosis, as a large percentage of patients have normal enzymes despite severe fibrosis.',
        'Using the FIB-4 Index: All at-risk patients must be screened using this calculation (based on age, enzymes, and platelets). If the score is ≥ 1.3, the patient must be referred for Elastography to confirm fibrosis grade.',
        'Beneficial Medications: Obesity and diabetes drugs like GLP-1 RAs (e.g., Semaglutide) and Pioglitazone have proven effective in improving liver inflammation and fibrosis. A new drug specifically for liver fibrosis named (Resmetirom) has also been approved for moderate to advanced fibrosis.',
        'In Advanced Fibrosis (Decompensated Cirrhosis): Most oral medications are contraindicated, and Insulin is considered the safest option for glycemic control.'
      ],
      ar: [
        'تغيير طريقة الفحص: لا يجب الاعتماد على إنزيمات الكبد (ALT/AST) للتشخيص، لأن نسبة كبيرة من المرضى لديهم إنزيمات طبيعية رغم وجود تليف خطير.',
        'استخدام مؤشر FIB-4: يجب فحص جميع المرضى المعرضين للخطر باستخدام هذه المعادلة الحسابية (تعتمد على العمر، الإنزيمات، والصفائح الدموية). إذا كانت النتيجة ≥ 1.3، فيجب تحويل المريض لفحص مرونة الكبد (Elastography) للتأكد من درجة التليف.',
        'الأدوية المفيدة للكبد: أثبتت أدوية السمنة والسكري مثل (GLP-1 RAs) (مثل سيماجلوتيد) ودواء بيوجليتازون (Pioglitazone) فعاليتها في تحسين التهاب الكبد وتليفه. كما تم اعتماد دواء جديد مخصص لتليف الكبد اسمه (Resmetirom) لحالات التليف المتوسطة والمتقدمة.',
        'في حالات التليف المتقدم (Decompensated Cirrhosis): يُمنع استخدام معظم الأدوية الفموية، ويُعتبر الإنسولين هو الخيار الأكثر أماناً للتحكم في السكر.'
      ]
    }
  },
  {
    id: 'ada-2026-ch4-bone',
    group: '4. Comprehensive Medical Evaluation',
    sourceIds: ['4-comprehensive-medical-evaluation-and-assessment-of-comorbidities-pdf', 'evaluation'],
    tags: ['Bone Health', 'Fracture', 'BMD', 'DXA'],
    title: {
      en: 'Bone Health and Fracture Risk',
      ar: 'صحة العظام وخطر الكسور'
    },
    summary: {
      en: 'Type 2 diabetes brings deceptive bone density metrics paired with a much higher fracture risk.',
      ar: 'النوع الثاني يرافقه كثافة عظام خادعة مع خطر إصابة مرتفع جداً بالكسور.'
    },
    points: {
      en: [
        'Type 2 and Deceptive Bone Density: Patients with Type 2 have normal or even elevated bone mineral density (BMD) compared to non-diabetics, yet they are 40-70% more susceptible to fractures due to poor bone quality.',
        'Diagnostic Adjustment: When reading a DXA scan, it is recommended to adjust the score to be more accurate for diabetics (e.g., if the T-score is -2.0, it should be considered -2.5).',
        'Medication Impact: Avoid medications that increase fracture risk for susceptible patients, such as Thiazolidinediones and Sulfonylureas.'
      ],
      ar: [
        'النوع الثاني وكثافة العظام الخادعة: المرضى المصابون بالنوع الثاني لديهم كثافة عظام (BMD) طبيعية أو حتى مرتفعة مقارنة بغير المصابين، لكنهم مع ذلك أكثر عرضة للكسور بنسبة 40-70% بسبب رداءة جودة العظام.',
        'تعديل التشخيص: عند قراءة فحص هشاشة العظام (DXA)، يوصى بتعديل النتيجة لتكون أكثر دقة لمرضى السكري (مثلاً، إذا كان T-score هو -2.0 يجب اعتباره -2.5).',
        'تأثير الأدوية: يجب تجنب الأدوية التي تزيد من خطر الكسور للمرضى المعرضين للخطر، مثل الـ Thiazolidinediones والسلفونيل يوريا.'
      ]
    }
  },
  {
    id: 'ada-2026-ch4-cognitive',
    group: '4. Comprehensive Medical Evaluation',
    sourceIds: ['4-comprehensive-medical-evaluation-and-assessment-of-comorbidities-pdf', 'evaluation'],
    tags: ['Cognitive Impairment', 'Dementia', 'Alzheimer'],
    title: {
      en: 'Cognitive Function and Dementia',
      ar: 'الوظائف الإدراكية والخرف (Cognitive Impairment)'
    },
    summary: {
      en: 'Diabetes significantly increases the risk of cognitive decline, Alzheimer’s, and vascular dementia.',
      ar: 'السكري يزيد من خطر التدهور الإدراكي، ومرض ألزهايمر، والخرف الوعائي بشكل كبير.'
    },
    points: {
      en: [
        'Vicious Cycle: Severe and recurrent hypoglycemia leads to mental deterioration, and simultaneously, mental decline causes the patient to forget medications or proper dosing, leading to more hypoglycemia.',
        'Treatment Plan: In cases of cognitive impairment or dementia, the golden rule is to "simplify the treatment plan as much as possible" and relax A1C targets to avoid hypos entirely. Intensive therapy is never recommended for these patients to improve memory.'
      ],
      ar: [
        'دائرة مفرغة: الهبوط الحاد والمتكرر للسكر يؤدي إلى تدهور عقلي، وفي الوقت نفسه، التدهور العقلي يجعل المريض ينسى أخذ أدويته أو جرعاته بشكل صحيح، مما يؤدي لمزيد من الهبوط.',
        'خطة العلاج: في حالات الضعف الإدراكي أو الخرف، القاعدة الذهبية هي "تبسيط خطة العلاج قدر الإمكان" وتخفيف أهداف السكر التراكمي لتجنب الهبوط تماماً. لا يُنصح أبداً بالعلاج المكثف لهؤلاء المرضى بغرض تحسين الذاكرة.'
      ]
    }
  },
  {
    id: 'ada-2026-ch4-sexual',
    group: '4. Comprehensive Medical Evaluation',
    sourceIds: ['4-comprehensive-medical-evaluation-and-assessment-of-comorbidities-pdf', 'evaluation'],
    tags: ['Sexual Health', 'Erectile Dysfunction', 'Testosterone'],
    title: {
      en: 'Sexual Health',
      ar: 'الصحة الجنسية (نقطة يغفل عنها الكثير)'
    },
    summary: {
      en: 'Often overlooked, sexual dysfunction is highly prevalent and severely impacts quality of life.',
      ar: 'الصحة الجنسية نقطة يغفل عنها الكثير، لكن الخلل الوظيفي الجنسي يؤثر بشدة على جودة الحياة.'
    },
    points: {
      en: [
        'Men: Erectile Dysfunction (ED) is very common and is considered an early marker of cardiovascular disease. Routine screening is necessary, and if there are symptoms of testosterone deficiency, morning testosterone must be measured.',
        'Women: Many face reduced desire, pain, or vaginal dryness (especially post-menopause), leading to psychological stress and poor quality of life. The guide recommends routine screening, asking female patients about these symptoms, and providing appropriate treatment.'
      ],
      ar: [
        'الرجال: ضعف الانتصاب (ED) شائع جداً، ويعتبره الدليل مؤشراً مبكراً لأمراض القلب والأوعية الدموية. يجب الفحص الروتيني له، وإذا كانت هناك أعراض نقص هرمون ذكورة، يجب قياس هرمون التستوستيرون الصباحي.',
        'النساء: تواجه الكثيرات ضعفاً في الرغبة، الألم، أو جفاف المهبل (خاصة بعد انقطاع الطمث)، مما يؤدي لضغط نفسي وضعف في جودة الحياة. يوصي الدليل بالفحص الروتيني وسؤال المريضات عن هذه الأعراض وتقديم العلاج المناسب.'
      ]
    }
  },
  {
    id: 'ada-2026-ch4-dental',
    group: '4. Comprehensive Medical Evaluation',
    sourceIds: ['4-comprehensive-medical-evaluation-and-assessment-of-comorbidities-pdf', 'evaluation'],
    tags: ['Dental Care', 'Periodontitis'],
    title: {
      en: 'Dental Care',
      ar: 'العناية بالأسنان (Dental Care)'
    },
    summary: {
      en: 'There is a bidirectional relationship between oral health and glycemic control.',
      ar: 'هناك علاقة متبادلة وثيقة بين صحة الفم والأسنان ومستويات السكر.'
    },
    points: {
      en: [
        'Bidirectional Relationship: High blood glucose causes periodontitis, and severe periodontitis raises A1C levels.',
        'Referral & Care: It is recommended to refer the patient to a dentist at least once annually, as studies prove that cleaning and treating the gums improves glucose levels. Coordination with the dentist is needed to avoid hypoglycemia during treatment sessions.'
      ],
      ar: [
        'علاقة متبادلة: السكري المرتفع يسبب التهابات اللثة، والتهابات اللثة الحادة ترفع السكر التراكمي.',
        'الإحالة: يُوصى بتحويل المريض لطبيب أسنان مرة سنوياً على الأقل، حيث أثبتت الدراسات أن تنظيف وعلاج اللثة يحسن من مستويات السكر. يجب التنسيق مع طبيب الأسنان لتجنب حدوث هبوط في السكر أثناء جلسات العلاج.'
      ]
    }
  },
  {
    id: 'ada-2026-ch4-autoimmune',
    group: '4. Comprehensive Medical Evaluation',
    sourceIds: ['4-comprehensive-medical-evaluation-and-assessment-of-comorbidities-pdf', 'evaluation'],
    tags: ['Autoimmune', 'Thyroid', 'Celiac', 'Type 1'],
    title: {
      en: 'Autoimmune Comorbidities (Especially in Type 1)',
      ar: 'الأمراض المناعية المصاحبة (خاصة بالنوع الأول)'
    },
    summary: {
      en: 'Patients with Type 1 Diabetes are at significantly higher risk for other autoimmune diseases.',
      ar: 'المرضى بالنوع الأول أكثر عرضة لأمراض مناعية أخرى، ولذلك يتطلبون فحصاً خاصاً.'
    },
    points: {
      en: [
        'Autoimmune Thyroid Disease: Screen shortly after diagnosis and periodically thereafter.',
        'Celiac Disease: Screen adults if GI symptoms, malabsorption, or unexplained deficiencies in iron and vitamins appear.'
      ],
      ar: [
        'فحص أمراض الغدة الدرقية المناعية بعد التشخيص بوقت قصير وبشكل دوري.',
        'فحص مرض حساسية القمح (Celiac Disease) عند البالغين إذا ظهرت أعراض في الجهاز الهضمي، أو سوء امتصاص، أو نقص غير مبرر في الفيتامينات والحديد.'
      ]
    }
  },
  {
    id: 'ada-2026-ch4-conclusion',
    group: '4. Comprehensive Medical Evaluation',
    sourceIds: ['4-comprehensive-medical-evaluation-and-assessment-of-comorbidities-pdf', 'evaluation'],
    tags: ['Conclusion', 'Summary'],
    title: {
      en: 'Conclusion',
      ar: 'الخلاصة'
    },
    summary: {
      en: 'Chapter 4 emphasizes that diabetes is a systemic condition affecting all body systems. A comprehensive medical evaluation and a precise roadmap are the foundation of successful management.',
      ar: 'يؤكد الفصل الرابع على أن السكري ليس مجرد رقم يجب خفضه، بل هو حالة تؤثر على كافة أجهزة الجسم. التقييم الشامل وخريطة الطريق الدقيقة هما أساس العلاج الناجح.'
    },
    points: {
      en: [],
      ar: []
    }
  }
];
