import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_16_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch16-assessment',
    group: '16. Diabetes Care in the Hospital',
    sourceIds: ['16-diabetes-care-in-the-hospital-pdf', 'hospital'],
    tags: ['Admission', 'A1C', 'CPOE'],
    title: {
      en: 'Patient Assessment Upon Admission',
      ar: 'تقييم المريض عند الدخول للمستشفى'
    },
    summary: {
      en: 'Initial screening using A1C and the importance of electronic protocols.',
      ar: 'أهمية فحص التراكمي المبدئي للتفرقة بين السكري المزمن وارتفاع السكر المؤقت.'
    },
    points: {
      en: [
        'A1C Testing: An A1C test must be performed for all patients with diabetes, or those with a random glucose ≥ 140 mg/dL upon admission, if there is no recent test within the last 3 months. This helps differentiate between chronic diabetes and "Stress Hyperglycemia".',
        'Electronic Systems and Teams: It is strongly recommended to use computerized provider order entry (CPOE) protocols to ensure accurate insulin dosing. Also, involving specialized diabetes management teams reduces hospital length of stay and readmission rates.'
      ],
      ar: [
        'فحص التراكمي (A1C): يجب إجراء تحليل السكر التراكمي لجميع المرضى المصابين بالسكري، أو من يبلغ لديهم قياس السكر العشوائي ≥ 140 مجم/ديسيلتر عند الدخول، وذلك في حال عدم وجود تحليل حديث خلال آخر 3 أشهر. هذا يساعد في التفرقة بين السكري المزمن و"الارتفاع المؤقت بسبب ضغط المرض" (Stress Hyperglycemia).',
        'الأنظمة الإلكترونية وفرق العمل: يُوصى بشدة باستخدام بروتوكولات وأنظمة طلبات إلكترونية (CPOE) لضمان دقة جرعات الإنسولين. كما أن إشراك فرق متخصصة في إدارة السكري يقلل من مدة البقاء في المستشفى ويخفض معدلات إعادة التنويم.'
      ]
    }
  },
  {
    id: 'ada-2026-ch16-targets',
    group: '16. Diabetes Care in the Hospital',
    sourceIds: ['16-diabetes-care-in-the-hospital-pdf', 'hospital'],
    tags: ['Glycemic Targets', 'ICU', 'Non-ICU'],
    title: {
      en: 'Glycemic Targets in the Hospital',
      ar: 'الأهداف الجلايسيمية (أرقام السكر المستهدفة)'
    },
    summary: {
      en: 'Hospital targets differ from outpatient clinics, prioritizing the avoidance of hypoglycemia.',
      ar: 'الأهداف في المستشفى تختلف عن العيادة، فالأولوية هي تجنب الهبوط الذي يرفع نسب الوفيات.'
    },
    points: {
      en: [
        'Hypoglycemia Classification: Divided into 3 levels; Level 1 (54-69 mg/dL), Level 2 (less than 54), and Level 3 is severe hypoglycemia requiring third-party assistance.',
        'ICU Patients: Insulin therapy is initiated if glucose is ≥ 180 mg/dL (confirmed by two readings). The therapeutic goal is to maintain glucose between 140 and 180 mg/dL. Stricter goals (110-140) can be used for some patients only if achievable without causing hypoglycemia.',
        'Non-ICU Patients: The therapeutic goal is to maintain glucose between 100 and 180 mg/dL.'
      ],
      ar: [
        'تصنيف الهبوط: يُقسم إلى 3 مستويات؛ المستوى الأول (54-69 مجم/ديسيلتر)، المستوى الثاني (أقل من 54)، والمستوى الثالث هو الهبوط الشديد الذي يحتاج لتدخل شخص آخر للإسعاف.',
        'المرضى في العناية المركزة (ICU): يُبدأ العلاج بالإنسولين إذا كان السكر ≥ 180 مجم/ديسيلتر (بعد تأكيده بقراءتين). الهدف العلاجي هو الحفاظ على السكر بين 140 و 180 مجم/ديسيلتر. يُمكن اللجوء لأهداف أكثر صرامة (110-140) لبعض المرضى فقط إذا أمكن تحقيق ذلك دون التسبب في هبوط.',
        'المرضى في الأقسام العادية (Non-ICU): الهدف العلاجي هو الحفاظ على السكر بين 100 و 180 مجم/ديسيلتر.'
      ]
    }
  },
  {
    id: 'ada-2026-ch16-insulin',
    group: '16. Diabetes Care in the Hospital',
    sourceIds: ['16-diabetes-care-in-the-hospital-pdf', 'hospital'],
    tags: ['Insulin', 'Transition', 'Sliding Scale'],
    title: {
      en: 'Insulin: The Cornerstone of Treatment',
      ar: 'الإنسولين: حجر الأساس في العلاج'
    },
    summary: {
      en: 'Guidelines on IV insulin, transitioning to subcutaneous, and a strict ban on using sliding scale alone.',
      ar: 'قواعد الإنسولين الوريدي، الانتقال للحقن، والمنع التام لنظام Sliding scale منفرداً.'
    },
    points: {
      en: [
        'In the ICU: Continuous Intravenous (IV) insulin is the most effective and safe choice for glucose control.',
        'Transitioning from IV to Subcutaneous: When stopping the IV drip, Basal insulin MUST be administered subcutaneously 2 hours before stopping the IV to prevent a rapid rebound in blood sugar or entering diabetic ketoacidosis.',
        'In Non-ICU settings (Eating Patients): The optimal regimen is (Basal Insulin + Prandial Insulin + Correctional Insulin).',
        'In Non-ICU settings (Fasting/Non-eating Patients): The preferred regimen is (Basal Insulin + Correctional Insulin).',
        'Crucial Rule: It is STRICTLY PROHIBITED to use Correctional Insulin alone (Sliding Scale) as a treatment plan in the hospital without basal insulin, as it causes severe glucose fluctuations, except for Type 2 patients with very mild glucose elevation.'
      ],
      ar: [
        'في العناية المركزة: يُعد الإنسولين الوريدي المستمر هو الخيار الأكثر فعالية وأماناً لضبط السكر.',
        'الانتقال من الوريدي إلى تحت الجلد: عند إيقاف المحلول الوريدي، يجب إعطاء الإنسولين القاعدي (Basal) تحت الجلد قبل ساعتين من إيقاف الوريدي، لمنع حدوث ارتداد سريع للسكر أو الدخول في حموضة كيتونية.',
        'في الأقسام العادية (للمرضى الذين يتناولون الطعام): النظام الأمثل هو (إنسولين قاعدي + إنسولين وجبات + إنسولين تصحيحي).',
        'في الأقسام العادية (للمرضى الذين لا يتناولون الطعام): يُفضل نظام (إنسولين قاعدي + إنسولين تصحيحي).',
        'قاعدة حاسمة: يُمنع تماماً استخدام نظام الإنسولين التصحيحي بمفرده (Sliding Scale) كخطة علاجية في المستشفى دون إنسولين قاعدي، لأنه يؤدي لتذبذب شديد في السكر، ويُستثنى من ذلك فقط مرضى النوع الثاني ذوو الارتفاع الطفيف في السكر.'
      ]
    }
  },
  {
    id: 'ada-2026-ch16-non-insulin',
    group: '16. Diabetes Care in the Hospital',
    sourceIds: ['16-diabetes-care-in-the-hospital-pdf', 'hospital'],
    tags: ['SGLT2', 'GLP-1', 'DKA'],
    title: {
      en: 'Non-Insulin Medications in the Hospital',
      ar: 'الأدوية غير الإنسولينية في المستشفى'
    },
    summary: {
      en: 'Warnings and guidelines on when to stop SGLT2 inhibitors and GLP-1 RAs in hospitalized patients.',
      ar: 'متى يجب إيقاف أدوية السكري الحديثة لتجنب المضاعفات.'
    },
    points: {
      en: [
        'SGLT2 inhibitors: Can be continued or initiated for heart failure patients provided their condition is stable and nutrition is available. HOWEVER, they must be stopped immediately in cases of severe illness, dehydration, or prolonged fasting to avoid the risk of Diabetic Ketoacidosis (DKA).',
        'GLP-1 RAs: Must be stopped for critically ill patients or those with acute illnesses inside the hospital.'
      ],
      ar: [
        'أدوية (SGLT2 inhibitors): يمكن استمرارها أو البدء بها لمرضى هبوط عضلة القلب بشرط استقرار حالتهم وتوفر التغذية. ولكن يجب إيقافها فوراً في حالات المرض الشديد، الجفاف، أو الصيام الطويل، لتجنب خطر "الحموضة الكيتونية" (DKA).',
        'أدوية (GLP-1 RAs): يجب إيقافها للمرضى الحرجين أو المصابين بأمراض حادة داخل المستشفى.'
      ]
    }
  },
  {
    id: 'ada-2026-ch16-perioperative',
    group: '16. Diabetes Care in the Hospital',
    sourceIds: ['16-diabetes-care-in-the-hospital-pdf', 'hospital'],
    tags: ['Surgery', 'Perioperative', 'Anesthesia', 'Aspiration'],
    title: {
      en: 'Perioperative Care',
      ar: 'الرعاية الخاصة بالعمليات الجراحية (Perioperative Care)'
    },
    summary: {
      en: 'Pre-surgery targets and managing medications (especially GLP-1 RAs and SGLT2i) to prevent complications and aspiration.',
      ar: 'أهداف السكر قبل الجراحة ومحاذير هامة بخصوص التخدير مع أدوية GLP-1.'
    },
    points: {
      en: [
        'Before scheduled surgery: An A1C of less than 8% is recommended to reduce the risk of wound infections and complications.',
        'During and after surgery: Glucose should be maintained between 100 and 180 mg/dL, using only insulin for control.',
        'SGLT2 inhibitors: Must be stopped 3 to 4 days before scheduled surgeries to prevent post-operative DKA.',
        'GLP-1 RAs and Anesthesia: Because these drugs slow gastric emptying, there is a risk of food remaining in the stomach and causing "pulmonary aspiration" during general anesthesia. It is recommended to follow a liquid diet for 24 hours prior to surgery, or take full-stomach precautions during anesthesia if GI symptoms are present.'
      ],
      ar: [
        'قبل الجراحة المجدولة: يُنصح بالوصول لسكر تراكمي أقل من 8% لتقليل خطر التهاب الجروح والمضاعفات.',
        'أثناء وبعد الجراحة: يجب الحفاظ على السكر بين 100 و 180 مجم/ديسيلتر واستخدام الإنسولين فقط للتحكم فيه.',
        'أدوية (SGLT2 inhibitors): يجب إيقافها قبل الجراحات المجدولة بـ 3 إلى 4 أيام لمنع حدوث حموضة كيتونية بعد الجراحة.',
        'أدوية (GLP-1 RAs) والتخدير: نظراً لأن هذه الأدوية تبطئ تفريغ المعدة، هناك خطر من بقاء الطعام في المعدة وحدوث "شفط رئوي" (Aspiration) أثناء التخدير العام. يُنصح باتباع نظام غذائي سائل لمدة 24 ساعة قبل الجراحة، أو اتخاذ تدابير المعدة الممتلئة أثناء التخدير في حال وجود أعراض هضمية.'
      ]
    }
  },
  {
    id: 'ada-2026-ch16-emergencies',
    group: '16. Diabetes Care in the Hospital',
    sourceIds: ['16-diabetes-care-in-the-hospital-pdf', 'hospital'],
    tags: ['DKA', 'HHS', 'Euglycemic DKA'],
    title: {
      en: 'Managing Diabetes Emergencies (DKA and HHS)',
      ar: 'التعامل مع طوارئ السكري (DKA و HHS)'
    },
    summary: {
      en: 'Pillars of emergency treatment and the critical management of Euglycemic DKA.',
      ar: 'الركائز الثلاث للعلاج وكيفية التعامل مع الحموضة الكيتونية بسكر طبيعي.'
    },
    points: {
      en: [
        'Treatment relies on 3 simultaneous pillars: Efficient IV fluids for dehydration, IV insulin, and regular potassium replacement.',
        'Euglycemic DKA: May occur especially with SGLT2i use, where glucose is < 200 mg/dL despite severe acidosis. In this case, an IV Dextrose (5% or 10%) solution MUST be added immediately alongside insulin to prevent hypoglycemia while continuing to clear the acidosis.'
      ],
      ar: [
        'يتم العلاج عبر 3 ركائز متزامنة: المحاليل الوريدية بكفاءة لتعويض الجفاف، الإنسولين الوريدي، وتعويض البوتاسيوم بانتظام.',
        'الحموضة الكيتونية بسكر طبيعي (Euglycemic DKA): قد تحدث خصوصاً مع أدوية (SGLT2i)، حيث يكون السكر أقل من 200 مجم/ديسيلتر مع وجود حموضة. في هذه الحالة، يجب إضافة محلول (دكستروز 5% أو 10%) إلى خطة العلاج فوراً بجانب الإنسولين لمنع هبوط السكر مع استمرار علاج الحموضة.'
      ]
    }
  },
  {
    id: 'ada-2026-ch16-hypoglycemia',
    group: '16. Diabetes Care in the Hospital',
    sourceIds: ['16-diabetes-care-in-the-hospital-pdf', 'hospital'],
    tags: ['Hypoglycemia', 'Rescue'],
    title: {
      en: 'Treating and Preventing Hypoglycemia',
      ar: 'علاج وتجنب هبوط السكر (Hypoglycemia)'
    },
    summary: {
      en: 'Standard protocols for treating hypos and the crucial step of regimen modification post-rescue.',
      ar: 'بروتوكول موحد لإسعاف الهبوط وضرورة تعديل الخطة العلاجية لمنع تكراره.'
    },
    points: {
      en: [
        'Every hospital must adopt a clear, standardized protocol for treating hypoglycemia (less than 70 mg/dL) using 15 grams of carbohydrates or IV glucose/glucagon.',
        'The most important step after rescuing the patient is to review and modify the pharmacological treatment plan IMMEDIATELY to prevent a recurrence of hypoglycemia in the coming hours.'
      ],
      ar: [
        'يجب أن تتبنى كل مستشفى بروتوكولاً واضحاً وموحداً لعلاج الهبوط (أقل من 70 مجم/ديسيلتر) باستخدام 15 جراماً من الكربوهيدرات أو الجلوكوز الوريدي/الجلوكاجون.',
        'الخطوة الأهم بعد إسعاف المريض هي مراجعة خطة العلاج الدوائي وتعديلها فوراً لتجنب تكرار الهبوط في الساعات القادمة.'
      ]
    }
  },
  {
    id: 'ada-2026-ch16-special-cases',
    group: '16. Diabetes Care in the Hospital',
    sourceIds: ['16-diabetes-care-in-the-hospital-pdf', 'hospital'],
    tags: ['Glucocorticoids', 'Enteral Nutrition', 'Parenteral Nutrition'],
    title: {
      en: 'Special Cases: Glucocorticoids and Tube Feeding',
      ar: 'حالات خاصة: الكورتيزون والتغذية الأنبوبية'
    },
    summary: {
      en: 'Matching insulin peaks to steroid spikes and covering continuous feeding safely.',
      ar: 'استراتيجية التعامل مع الارتفاع الشديد بسبب الكورتيزون والتغذية المعوية.'
    },
    points: {
      en: [
        'Glucocorticoids: Morning doses (like prednisone) cause a massive spike in blood sugar peaking in the afternoon and evening. The best strategy is to give NPH (intermediate-acting) insulin with the steroid dose to match the peak of insulin action with the peak of the steroid-induced glucose spike.',
        'Enteral/Parenteral Nutrition: Specific insulin must be assigned to cover the carbohydrates in the feeding solutions or tubes. Basal insulin should NEVER be relied upon alone to cover nutrition, to avoid severe hypoglycemia if the feeding is suddenly stopped.'
      ],
      ar: [
        'الكورتيزون: جرعة الكورتيزون الصباحية (مثل البريدنيزون) تؤدي لارتفاع شديد في السكر يبلغ ذروته في فترة الظهيرة والمساء. أفضل استراتيجية هي إعطاء إنسولين متوسط المفعول (NPH) مع جرعة الكورتيزون لمطابقة ذروة عمل الإنسولين مع ذروة ارتفاع السكر من الكورتيزون.',
        'التغذية الأنبوبية (Enteral/Parenteral): يجب تخصيص إنسولين لتغطية الكربوهيدرات الموجودة في المحاليل أو الأنابيب. لا ينبغي إطلاقاً الاعتماد على الإنسولين القاعدي وحده لتغطية التغذية لتجنب الهبوط إذا توقفت التغذية فجأة.'
      ]
    }
  },
  {
    id: 'ada-2026-ch16-technology',
    group: '16. Diabetes Care in the Hospital',
    sourceIds: ['16-diabetes-care-in-the-hospital-pdf', 'hospital'],
    tags: ['CGM', 'AID', 'Technology', 'Interference'],
    title: {
      en: 'Technology: CGM and Smart Pumps',
      ar: 'التكنولوجيا: أجهزة المراقبة (CGM) والمضخات'
    },
    summary: {
      en: 'Allowing personal devices in the hospital with necessary precautions and POC confirmations.',
      ar: 'السماح باستخدام الأجهزة الشخصية بالمستشفى مع ضرورة التأكد باستخدام أجهزة الوخز.'
    },
    points: {
      en: [
        'The guide strongly encourages allowing patients to continue wearing their personal insulin pumps (AID) and CGM sensors during hospitalization, provided they have the mental and physical capacity to manage them, and a hospital protocol is in place regulating this.',
        'However, CGM readings MUST be confirmed using Point-of-Care (POC) fingerstick devices when making decisions to change insulin doses or when hypoglycemia is suspected. Some common hospital medications (like high doses of Vitamin C and Paracetamol) may interfere with sensor accuracy.'
      ],
      ar: [
        'يُشجع الدليل بقوة على السماح للمريض بالاستمرار في ارتداء مضخة الإنسولين الخاصة به (AID) وحساس السكر (CGM) أثناء التنويم، بشرط قدرته العقلية والجسدية على التعامل معها، ووجود بروتوكول مستشفى ينظم ذلك.',
        'ومع ذلك، يجب التأكد من قراءات حساس الـ CGM باستخدام جهاز وخز الإصبع (POC) عند اتخاذ قرارات بتغيير جرعة الإنسولين أو عند الاشتباه بوجود هبوط. بعض الأدوية الشائعة في المستشفى (مثل الجرعات العالية من فيتامين سي والباراسيتامول) قد تؤثر على دقة هذه الحساسات.'
      ]
    }
  },
  {
    id: 'ada-2026-ch16-discharge',
    group: '16. Diabetes Care in the Hospital',
    sourceIds: ['16-diabetes-care-in-the-hospital-pdf', 'hospital'],
    tags: ['Discharge', 'Follow-up', 'Medication Reconciliation'],
    title: {
      en: 'Discharge Planning',
      ar: 'التخطيط للخروج (Discharge Planning)'
    },
    summary: {
      en: 'Crucial steps to ensure a safe transition home and prevent high rates of readmission.',
      ar: 'إجراءات صارمة لتجنب الانتكاسة وإعادة التنويم المتكررة لمرضى السكري.'
    },
    points: {
      en: [
        'Patient discharge is a high-risk period for relapse; readmission probabilities double for diabetic patients compared to others.',
        'Discharge planning should start from the day of admission, and must include "Medication Reconciliation" to ensure no duplicate or conflicting medications are dispensed.',
        'Basic education must be provided to the patient regarding signs of hypoglycemia and hyperglycemia, and how to inject insulin.',
        'An outpatient follow-up appointment must be scheduled within ONE month at most. If the patient\'s treatment plan was altered during hospitalization, the follow-up must be sooner (within 1 to 2 weeks) to ensure their condition stabilizes.'
      ],
      ar: [
        'خروج المريض هو مرحلة عالية الخطورة لتكرار الانتكاسة؛ حيث تتضاعف احتمالات إعادة التنويم لمرضى السكري مقارنة بغيرهم.',
        'يجب بدء التخطيط للخروج منذ يوم الدخول، ويتضمن "التوفيق بين الأدوية" (Medication Reconciliation) للتأكد من عدم صرف أدوية مزدوجة أو متعارضة.',
        'يجب توفير تثقيف أساسي للمريض حول علامات الهبوط والارتفاع وكيفية حقن الإنسولين.',
        'يجب ترتيب موعد متابعة خارجية خلال شهر واحد على الأكثر. أما إذا تم تغيير خطة المريض العلاجية أثناء التنويم، فيجب أن يكون موعد المتابعة أقرب (خلال أسبوع إلى أسبوعين) لضمان استقرار حالته.'
      ]
    }
  },
  {
    id: 'ada-2026-ch16-conclusion',
    group: '16. Diabetes Care in the Hospital',
    sourceIds: ['16-diabetes-care-in-the-hospital-pdf', 'hospital'],
    tags: ['Conclusion', 'Summary'],
    title: {
      en: 'Conclusion',
      ar: 'الخلاصة'
    },
    summary: {
      en: 'Chapter 16 provides a comprehensive roadmap for managing diabetes in the hospital. The priority is safety: avoiding hypoglycemia, relying strictly on insulin while banning solo sliding scales, pausing specific modern drugs pre-op, managing steroid spikes intelligently, and meticulously planning discharge.',
      ar: 'الفصل السادس عشر يقدم خريطة طريق شاملة حيث تكون الأولوية للأمان: تجنب الهبوط، الاعتماد على الإنسولين ومنع الجرعات التصحيحية المنفردة، التوقف الحذر عن بعض الأدوية الحديثة قبل الجراحة، التعامل الذكي مع الكورتيزون، والتخطيط المحكم للخروج.'
    },
    points: {
      en: [],
      ar: []
    }
  }
];
