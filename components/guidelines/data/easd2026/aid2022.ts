import { GuidelineTopic } from '../../guidelinesData';

export const EASD_2022_AID_TOPICS: GuidelineTopic[] = [
  {
    id: 'easd-2022-aid-part1',
    group: '2022 Automated Insulin Delivery Consensus Report',
    sourceIds: ['easd-2022-automated-insulin-delivery-consensus-report'],
    tags: ['AID', 'CGM', 'Terminology', 'TIR', 'Closed Loop'],
    title: {
      en: 'Part 1: Introduction and Basic Concepts',
      ar: 'الجزء الأول: مقدمة ومفاهيم أساسية'
    },
    summary: {
      en: 'An introduction to Automated Insulin Delivery (AID) systems, their terminology, and the evolution of diabetes control metrics such as Time in Range (TIR).',
      ar: 'مقدمة ومفاهيم أساسية حول أنظمة توصيل الأنسولين الآلي (AID)، المصطلحات الطبية المتداولة، والتطور في مقاييس تقييم التحكم في السكري.'
    },
    points: {
      en: [],
      ar: []
    },
    details: [
      {
        title: {
          en: '1. What are Automated Insulin Delivery (AID) Systems?',
          ar: '1. ما هي أنظمة توصيل الأنسولين الآلي (AID)؟'
        },
        items: {
          en: [
            'In the past, traditional insulin pumps were relied upon to pump insulin at constant pre-programmed rates. But with technological progress, AID systems emerged, representing a qualitative leap in diabetes management.',
            'Any AID system consists primarily of integrating three main elements to work together as a closed loop:',
            'Continuous Glucose Monitor (CGM): Continuously measures glucose levels.',
            'Control Algorithm: The "brain" of the system; a software program that receives and analyzes glucose readings.',
            'Insulin Pump: Receives commands from the algorithm to automatically adjust the rate of subcutaneous insulin delivery.'
          ],
          ar: [
            'في الماضي، كان يتم الاعتماد على مضخات الأنسولين التقليدية التي تضخ الأنسولين بمعدلات ثابتة مسبقة البرمجة. لكن مع التقدم التكنولوجي، ظهرت أنظمة (AID) التي تمثل نقلة نوعية في إدارة مرض السكري.',
            'يتكون أي نظام (AID) بشكل أساسي من دمج ثلاثة عناصر رئيسية لتعمل معاً كحلقة مغلقة (Closed Loop):',
            'جهاز المراقبة المستمرة للجلوكوز (CGM): والذي يقوم بقياس مستويات السكر بشكل مستمر.',
            'خوارزمية التحكم (Control Algorithm): وهي "عقل" النظام؛ عبارة عن برنامج حاسوبي يستقبل قراءات الجلوكوز ويقوم بتحليلها.',
            'مضخة الأنسولين (Insulin Pump): التي تتلقى الأوامر من الخوارزمية لتعديل وتيرة ضخ الأنسولين تحت الجلد بشكل آلي.'
          ]
        }
      },
      {
        title: {
          en: '2. Terminology of AID Systems',
          ar: '2. المصطلحات الطبية المتداولة لهذه الأنظمة (Terminology)'
        },
        items: {
          en: [
            'It is crucial for physicians to distinguish between the available types of AID systems due to their varying degrees of autonomy and patient intervention requirements:',
            'Hybrid AID: Automatically increases or decreases basal insulin in response to glucose readings but requires manual intervention for prandial insulin.',
            'Advanced Hybrid AID: The latest available generation; automatically adjusts basal insulin and delivers automatic correction boluses for hyperglycemia, but still requires patient input for meals.',
            'Full AID: Advanced systems that fully automate all types of insulin delivery (including meal coverage without patient intervention).',
            'Bihormonal/Bionic Pancreas: Systems that do not rely solely on insulin but integrate another hormone (like Glucagon or Pramlintide) to more accurately mimic natural pancreatic function.'
          ],
          ar: [
            'من المهم جداً للطبيب التفريق بين أنواع أنظمة (AID) المتاحة، نظراً لاختلاف درجة استقلاليتها وحاجتها لتدخل المريض:',
            'الأنظمة الهجينة (Hybrid AID): هي أنظمة تقوم بزيادة أو تقليل ضخ الأنسولين القاعدي (Basal Insulin) بشكل آلي استجابةً لقراءات الجلوكوز، ولكنها تتطلب من المريض التدخل اليدوي لإعطاء جرعات الأنسولين الخاصة بالوجبات (Prandial insulin).',
            'الأنظمة الهجينة المتقدمة (Advanced Hybrid AID): تمثل الجيل الأحدث المتوفر حالياً؛ فهي لا تقوم فقط بتعديل الأنسولين القاعدي، بل تمتلك القدرة على إعطاء جرعات تصحيحية تلقائية (Automatic correction boluses) للتعامل مع ارتفاع السكر، ولكنها لا تزال تتطلب من المريض إدخال بيانات الوجبات لأخذ جرعة الطعام.',
            'الأنظمة الكاملة (Full AID): هي أنظمة متطورة تقوم بضبط كافة أنواع ضخ الأنسولين آلياً بشكل كلي (بما في ذلك تغطية الوجبات دون تدخل المريض).',
            'الأنظمة ثنائية الهرمون (Bihormonal/Bionic Pancreas): أنظمة لا تعتمد على الأنسولين وحده، بل تدمج هرموناً آخر (مثل الجلوكاجون Glucagon، أو يتم دراسة استخدام دواء براملينتيد Pramlintide) لتقليد عمل البنكرياس الطبيعي بشكل أدق في رفع وخفض السكر.'
          ]
        }
      },
      {
        title: {
          en: '3. Evolution of Diabetes Control Metrics',
          ar: '3. التطور في مقاييس تقييم التحكم في السكري'
        },
        items: {
          en: [
            'HbA1c has long been the gold standard for evaluating diabetes control and its association with microvascular complications risk. However, despite its importance in reflecting the 2-3 month average, it has clear limitations: it does not reflect daily patient experience or the frequency/severity of hypoglycemia or glucose variability.',
            'Therefore, with the availability of CGM and AID systems, clinical focus has shifted to a more precise metric: Time in Range (TIR).',
            'Clinical Target: For most Type 1 diabetes patients (excluding pregnancy or high-risk older adults), the goal is to remain ≥70% of the time within the target glucose range of 70–180 mg/dL (3.9–10.0 mmol/L).',
            'Clinical Significance: Achieving even a 5% increase in TIR is considered a significant and clinically meaningful improvement for the patient.',
            'AGP Reporting: Physicians are advised to use standardized reports like the Ambulatory Glucose Profile (AGP) to visualize data consistently and facilitate therapeutic decisions.'
          ],
          ar: [
            'لطالما كان السكر التراكمي (HbA1c) هو المعيار الذهبي لتقييم التحكم في السكري وارتباطه بمخاطر المضاعفات الدقيقة للأوعية الدموية. ورغم أهميته في عكس متوسط السكر لـ 2-3 أشهر، إلا أنه يمتلك قصوراً واضحاً: فهو لا يعكس تجربة المريض اليومية، ولا يكشف عن تكرار أو شدة نوبات هبوط السكر (Hypoglycemia) أو تذبذب القراءات.',
            'لذلك، مع توفر أجهزة (CGM) وأنظمة (AID)، انتقل التركيز الطبي إلى مقياس أكثر دقة وهو "الوقت في النطاق المستهدف" (Time in Range - TIR).',
            'الهدف السريري: بالنسبة لمعظم مرضى السكري من النوع الأول (باستثناء فترات الحمل أو كبار السن ذوي المخاطر العالية)، فإن الهدف هو بقاء المريض بنسبة ≥70% من الوقت ضمن النطاق المستهدف للجلوكوز، وهو 70–180 مجم/ديسيلتر (3.9–10.0 مليمول/لتر).',
            'الأهمية السريرية: يُعتبر تحقيق زيادة بنسبة 5% فقط في قيمة (TIR) تحسناً كبيراً وذا مغزى إكلينيكي للمريض.',
            'لتقييم هذه البيانات، يُنصح الأطباء باستخدام التقارير الموحدة مثل "الملف الشخصي للجلوكوز المتنقل" (AGP - Ambulatory Glucose Profile)، والذي يتيح تصوير البيانات بطريقة قياسية تسهل اتخاذ القرارات العلاجية.'
          ]
        }
      }
    ]
  },
  {
    id: 'easd-2022-aid-part2',
    group: '2022 Automated Insulin Delivery Consensus Report',
    sourceIds: ['easd-2022-automated-insulin-delivery-consensus-report'],
    tags: ['Benefits', 'Limitations', 'Technical Limitations', 'Behavioral Limitations'],
    title: {
      en: 'Part 2: Benefits and Limitations (Clinical and Technical Challenges)',
      ar: 'الجزء الثاني: الفوائد والقيود (التحديات السريرية والتقنية)'
    },
    summary: {
      en: 'This section highlights the benefits of AID systems and discusses their physiological, technical, and behavioral limitations to help physicians manage patient expectations.',
      ar: 'يستعرض هذا الجزء الفوائد السريرية لأنظمة (AID) بالإضافة إلى القيود الفسيولوجية والتقنية والسلوكية، مما يساعد الطبيب على إدارة توقعات المريض بشكل واقعي وتدريبه على التعامل مع المشكلات الطارئة.'
    },
    points: {
      en: [],
      ar: []
    },
    details: [
      {
        title: {
          en: '1. Clinical Benefits',
          ar: '1. الفوائد السريرية (Benefits)'
        },
        items: {
          en: [
            'AID systems have brought about a real breakthrough in diabetes management. Their proven benefits include:',
            'Improved Glycemic Control: Studies have shown tangible improvements in HbA1c levels and an increase in Time in Range (TIR) across adults, children, and adolescents.',
            'Improved Quality of Life: These systems help alleviate the continuous daily burden of disease management, improve sleep quality for patients and their families, and significantly reduce anxiety related to hypoglycemic episodes.'
          ],
          ar: [
            'أحدثت أنظمة AID طفرة حقيقية في إدارة السكري، وتتلخص فوائدها المثبتة في:',
            'تحسين التحكم الجلايسيمي: أظهرت الدراسات تحسناً ملموساً في مستويات السكر التراكمي (HbA1c) وزيادة في مقياس "الوقت في النطاق المستهدف" (TIR) لدى البالغين والأطفال والمراهقين.',
            'تحسين جودة الحياة: تساهم هذه الأنظمة في تخفيف العبء اليومي المستمر لإدارة المرض، وتحسن جودة النوم للمرضى وذويهم، وتقلل بشكل كبير من القلق المتعلق بنوبات هبوط السكر.'
          ]
        }
      },
      {
        title: {
          en: '2. Physiological Limitations',
          ar: '2. القيود الفسيولوجية (Physiological Limitations)'
        },
        items: {
          en: [
            'Despite technological advancements, algorithms face purely physiological barriers preventing them from replicating a natural pancreas 100%:',
            'Sensor Time Lag: CGM devices read glucose levels from interstitial fluid (ISF) under the skin, not directly from the blood, creating a time delay in sensing rapid blood glucose changes.',
            'Pharmacodynamics: Even with the latest rapid-acting insulins, absorption from subcutaneous tissue remains slow compared to insulin secreted directly into the hepatic portal circulation by a natural pancreas.'
          ],
          ar: [
            'رغم التطور التقني، تواجه الخوارزميات عوائق فسيولوجية بحتة تمنعها من محاكاة البنكرياس الطبيعي بنسبة 100%:',
            'التأخير الزمني للمستشعر (Time Lag): أجهزة القياس (CGM) تقرأ مستوى السكر من السائل الخلالي (ISF) تحت الجلد وليس من الدم مباشرة، مما يخلق تأخيراً زمنياً في استشعار التغيرات السريعة في جلوكوز الدم.',
            'بطء حركية الدواء (Pharmacodynamics): حتى مع استخدام أحدث أنواع الأنسولين السريع، يظل امتصاص الأنسولين من النسيج تحت الجلد بطيئاً مقارنة بالأنسولين الذي يفرزه البنكرياس الطبيعي مباشرة في الدورة الدموية الكبدية.'
          ]
        }
      },
      {
        title: {
          en: '3. Technological Limitations',
          ar: '3. القيود التقنية (Technological Limitations)'
        },
        items: {
          en: [
            'Physicians and patients must recognize that devices are prone to malfunction, including:',
            'Infusion Set Failure: Tubing occlusions are considered the "Achilles heel" of these systems. The absence of insulin for several hours due to a set occlusion leads to rapid hyperglycemia and the risk of Diabetic Ketoacidosis (DKA).',
            'Compression Lows: When a patient sleeps in a way that compresses the sensor, blood flow in that area decreases, leading to false low glucose readings, which may prompt the system to unnecessarily suspend insulin delivery.',
            'Loss of Connectivity and Data: If the wireless connection between the sensor and pump drops, the automated system stops and reverts to "Manual Mode," relying on pre-programmed delivery rates that may not accurately match the patient\'s immediate needs.'
          ],
          ar: [
            'من الضروري أن يدرك الطبيب والمريض أن الأجهزة معرضة للأعطال، وتشمل:',
            'فشل مجموعة التسريب (Infusion Sets): تُعتبر انسدادات أنابيب الضخ هي "كعب أخيل" (Achilles heel) لهذه الأنظمة. غياب الأنسولين لعدة ساعات بسبب انسداد المجموعة يؤدي إلى ارتفاع سريع في السكر وخطر الدخول في حماض كيتوني (DKA).',
            'الانخفاض الانضغاطي (Compression Lows): عند نوم المريض بشكل يضغط على المستشعر، يقل تدفق الدم في تلك المنطقة، مما يؤدي إلى قراءات منخفضة كاذبة للسكر، وقد تدفع النظام لإيقاف الأنسولين بشكل غير ضروري.',
            'فقدان الاتصال والبيانات: إذا انقطع الاتصال اللاسلكي بين المستشعر والمضخة، سيتوقف النظام الآلي ويعود إلى "الوضع اليدوي" (Manual Mode) معتمداً على معدلات الضخ المبرمجة مسبقاً، والتي قد لا تكون دقيقة لاحتياج المريض في تلك اللحظة.'
          ]
        }
      },
      {
        title: {
          en: '4. Behavioral Limitations and Patient Intervention',
          ar: '4. القيود السلوكية وتدخل المريض (Behavioral Limitations)'
        },
        items: {
          en: [
            'The system is not fully autonomous (Cure-all) and requires patient commitment and intervention:',
            'Necessity of Manual Prandial Bolusing: In the current generation of hybrid systems, the patient must count carbohydrates and administer a bolus before eating. Delaying the bolus (after eating) may lead to hypoglycemia because the system will have already intervened by delivering extra insulin in response to the initial glucose rise, causing dose overlap.',
            'Changing Hypoglycemia Management: This is a critical point for physicians to educate patients on. Since the system suspends insulin delivery before and during hypoglycemia, the patient will need fewer carbohydrates than usual to correct the low. Overcorrection will lead to severe hyperglycemia later.',
            'Physical Activity Challenges: The patient must inform the system in advance of physical activity (activating exercise mode) to adjust the algorithm and avoid hypoglycemia during or after exercise.'
          ],
          ar: [
            'النظام ليس مستقلاً تماماً (Cure-all)، بل يتطلب التزاماً وتدخلاً من المريض:',
            'ضرورة الإدخال اليدوي لوجبات الطعام (Prandial Bolusing): في الجيل الحالي من الأنظمة الهجينة، يجب على المريض حساب الكربوهيدرات وإعطاء جرعة الطعام قبل الأكل. التأخر في أخذ الجرعة (بعد الأكل) قد يؤدي إلى هبوط السكر، لأن النظام سيكون قد تدخل مسبقاً وضخ أنسولين إضافي استجابة لارتفاع السكر الأولي، فيحدث تداخل وتراكم للجرعات.',
            'تغيير طريقة التعامل مع هبوط السكر: هذه نقطة حرجة جداً للطبيب لتثقيف المريض. نظراً لأن النظام يُوقف ضخ الأنسولين قبل وأثناء حدوث الهبوط، فإن المريض سيحتاج إلى كمية كربوهيدرات أقل من المعتاد لتصحيح الهبوط. المبالغة في أكل السكريات (Overcorrection) ستؤدي لارتفاعات شديدة في السكر لاحقاً.',
            'تحديات النشاط البدني: يتعين على المريض إعلام النظام مسبقاً بالقيام بنشاط رياضي (تفعيل وضع الرياضة) لتعديل الخوارزمية وتجنب هبوط السكر أثناء أو بعد التمرين.'
          ]
        }
      }
    ]
  },
  {
    id: 'easd-2022-aid-part3',
    group: '2022 Automated Insulin Delivery Consensus Report',
    sourceIds: ['easd-2022-automated-insulin-delivery-consensus-report'],
    tags: ['Patient Selection', 'Special Populations', 'Pregnancy', 'Remote Monitoring'],
    title: {
      en: 'Part 3: Patient Selection and Special Populations',
      ar: 'الجزء الثالث: اختيار المرضى المناسبين والحالات الخاصة'
    },
    summary: {
      en: 'This section provides practical guidance for physicians on selecting suitable patients for AID systems and managing special populations requiring exceptional care.',
      ar: 'هذا الجزء يمثل الدليل العملي للطبيب لتحديد من هو المريض الذي سيستفيد بأمان من هذه التكنولوجيا، وكيف نتعامل مع الفئات التي تحتاج رعاية استثنائية.'
    },
    points: {
      en: [],
      ar: []
    },
    details: [
      {
        title: {
          en: '1. Patient Selection Criteria',
          ar: '1. معايير اختيار المريض المناسب (Patient Selection)'
        },
        items: {
          en: [
            'For successful AID therapy, patients should ideally possess certain characteristics to ensure maximum safety:',
            'Technical and Practical Competence: The patient must be able to use an insulin pump, understand basic carbohydrate counting and the effect of fats/proteins on glucose, replace pump parts, and calibrate the sensor if necessary.',
            'Realistic Expectations: The patient must realize the system is not a "magic cure" to avoid frustration when facing technical limitations or malfunctions.',
            'Psychological and Behavioral Stability: It is important that the patient does not suffer from severe psychological disorders (e.g., severe depression, anxiety) or eating disorders, and has a genuine motivation to improve metabolic control.',
            'Important Clinical Note: While the above group is considered "safest", in clinical reality, the patients who achieve the Greatest Benefit are often those with severely elevated HbA1c and recurrent hypoglycemia due to self-management issues. Therefore, the consensus report advises against restricting technology only to "ideal patients" to avoid healthcare inequity.'
          ],
          ar: [
            'لنجاح العلاج بأنظمة التوصيل الآلي للأنسولين (AID)، يُفضل أن تتوفر في المريض الخصائص التالية لضمان أعلى درجات الأمان:',
            'الكفاءة التقنية والعملية: يجب أن يكون المريض قادراً على استخدام مضخة الأنسولين، ولديه معرفة بأساسيات حساب الكربوهيدرات وتأثير الدهون والبروتينات على السكر، وقادراً على استبدال أجزاء المضخة، ومعايرة المستشعر إذا لزم الأمر.',
            'التوقعات الواقعية (Realistic Expectations): يجب أن يدرك المريض أن النظام ليس "علاجاً سحرياً"، وذلك لتجنب الشعور بالإحباط عند مواجهة أي قيود تقنية أو أعطال.',
            'الاستقرار النفسي والسلوكي: من المهم ألا يعاني المريض من اضطرابات نفسية شديدة (مثل الاكتئاب الحاد والقلق) أو اضطرابات الأكل، وأن يكون لديه دافع حقيقي لتحسين تحكمه الأيضي.',
            'ملاحظة سريرية هامة للطبيب: الفئة المذكورة أعلاه تُعتبر "الأكثر أماناً" لاستخدام النظام، ولكن في الواقع الطبي، المرضى الذين يحققون أكبر فائدة إكلينيكية (Greatest Benefit) هم غالباً المرضى الذين يعانون من ارتفاع شديد في التراكمي وتكرار نوبات الهبوط (Hypoglycemia) بسبب مشاكل في الإدارة الذاتية للمرض، لذا ينصح التقرير التوافقي بعدم قصر وصف التكنولوجيا على "المرضى المثاليين" فقط، لتجنب عدم المساواة في الرعاية الصحية.'
          ]
        }
      },
      {
        title: {
          en: '2. Special Populations and Medical Conditions',
          ar: '2. الفئات والحالات الطبية الخاصة (Special Populations)'
        },
        items: {
          en: [
            'How does the system handle groups other than healthy adults with Type 1 Diabetes?',
            'Pregnancy: A crucial clinical point. Glycemic targets for pregnant women are very strict (much lower than the usual range). Most current commercial AID systems do not allow programming targets low enough for pregnancy. The only system currently approved for pregnancy is (CamAPS FX). Physicians must also exercise extreme caution and immediately adjust the system post-delivery due to a drastic drop in insulin requirements.',
            'Young Children and Older Adults (in care facilities): The most important feature for these groups is Remote Monitoring, allowing parents or caregivers to track glucose levels and insulin delivery via smartphones. Clinically, it is preferable to restrict or simplify available features on the pump screen itself to prevent accidental bolus administration by the child or older adult.',
            'Type 2 Diabetes and Other Conditions: Studies have shown short-term benefits of these systems for Type 2 patients, specifically those who have lost pancreatic function (low C-peptide levels) and clinically resemble Type 1. They are also recommended for diabetes resulting from Cystic Fibrosis or post-pancreatectomy.',
            'Patients with Acute Changes in Insulin Sensitivity: In cases such as corticosteroid use (which severely spikes glucose) or kidney failure/dialysis (affecting insulin clearance), the importance of these systems is highlighted, though they may require more robust and responsive algorithms to handle extreme fluctuations in insulin needs.',
            'Transition of Care (Childhood to Adulthood): Adolescents who have relied entirely on their parents to manage the system will require intensive retraining to become self-reliant before transitioning to adult clinics.'
          ],
          ar: [
            'كيف يتصرف النظام مع فئات غير مرضى السكري من النوع الأول البالغين الأصحاء؟',
            'النساء الحوامل (Pregnancy): هذه من أهم النقاط الإكلينيكية. الأهداف الجلايسيمية للمرأة الحامل صارمة جداً (أقل بكثير من النطاق المعتاد للمرضى الآخرين). معظم أنظمة AID التجارية الحالية لا تسمح ببرمجة أهداف منخفضة بما يكفي لتناسب الحمل. النظام الوحيد المعتمد حالياً للحوامل هو نظام (CamAPS FX). كما يجب على الطبيب توخي الحذر الشديد وتعديل النظام فوراً بعد الولادة مباشرة نتيجة الانخفاض الجذري في احتياجات المريضة للأنسولين.',
            'الأطفال الصغار وكبار السن (في دور الرعاية): الميزة الأهم لهذه الفئات هي خاصية المراقبة عن بعد (Remote Monitoring)، والتي تتيح للآباء أو مقدمي الرعاية متابعة مستويات الجلوكوز وضخ الأنسولين عبر الهواتف الذكية. إكلينيكياً، يُفضل في هذه الحالات تقييد أو تبسيط الخصائص المتاحة على شاشة المضخة نفسها لمنع إعطاء جرعات أنسولين إضافية (Boluses) عن طريق الخطأ من قبل الطفل أو المسن.',
            'مرضى السكري من النوع الثاني (Type 2 Diabetes) وحالات أخرى: أظهرت الدراسات فوائد قصيرة المدى لهذه الأنظمة لمرضى النوع الثاني، وتحديداً أولئك الذين فقدوا وظيفة البنكرياس (نقص مستويات C-peptide) ويشبهون سريرياً النوع الأول. كما يُنصح بها لمرضى السكري الناتج عن التليف الكيسي (Cystic Fibrosis) أو بعد استئصال البنكرياس.',
            'المرضى ذوي التغيرات الحادة في حساسية الأنسولين: في حالات مثل استخدام الكورتيزون (الذي يرفع السكر بشدة) أو حالات الفشل الكلوي والغسيل الكلوي (حيث يتأثر تصفية الأنسولين)، تبرز أهمية هذه الأنظمة، ولكنها قد تحتاج إلى خوارزميات أكثر قوة وسرعة استجابة للتعامل مع هذا التذبذب الحاد في احتياج الأنسولين.',
            'الانتقال من مرحلة الطفولة للبالغين (Transition of Care): المراهقون الذين اعتمدوا كلياً على آبائهم في إدارة النظام سيحتاجون إلى إعادة تدريب مكثفة للاعتماد على أنفسهم قبل انتقالهم لعيادات البالغين.'
          ]
        }
      }
    ]
  },
  {
    id: 'easd-2022-aid-part4',
    group: '2022 Automated Insulin Delivery Consensus Report',
    sourceIds: ['easd-2022-automated-insulin-delivery-consensus-report'],
    tags: ['CARES', 'Training', 'Education', 'Clinical Support', 'Managing Expectations'],
    title: {
      en: 'Part 4: Training, Education, and Clinical Support (CARES Approach)',
      ar: 'الجزء الرابع: التدريب، التعليم، والدعم السريري للأطباء والمرضى (ونهج CARES)'
    },
    summary: {
      en: 'Due to the variety of AID systems available, this section provides a clear methodology (CARES approach) for physicians to manage expectations, educate patients, and provide robust clinical and technical support.',
      ar: 'نظراً لاختلاف وتعدد أنظمة (AID) المتاحة، يحتاج الطبيب إلى منهجية واضحة للتعامل مع أي نظام يختاره المريض، بالإضافة إلى خطة واضحة لإدارة توقعات المريض وتوفير الدعم له.'
    },
    points: {
      en: [],
      ar: []
    },
    details: [
      {
        title: {
          en: '1. Managing Expectations and Patient Education',
          ar: '1. إدارة التوقعات وتثقيف المريض (Managing Expectations)'
        },
        items: {
          en: [
            'The first step to successful therapy is building realistic expectations for the patient before starting:',
            'Not a Magic Cure: The patient must understand that the system is a powerful tool to improve control, but it is not a definitive "cure" and still requires daily interaction.',
            '"Insulin-on-board" Concept: When hyperglycemia occurs, a patient might try to give a manual correction bolus only to find the pump refuses. It must be explained that the system proactively pumps extra insulin, and this restriction protects them from dose stacking and subsequent hypoglycemia.',
            'Meal Bolus Timing: In current hybrid systems, the patient must input carbohydrate data and give the meal bolus before eating to prevent severe postprandial spikes.'
          ],
          ar: [
            'الخطوة الأولى لنجاح العلاج هي بناء توقعات واقعية للمريض قبل البدء:',
            'ليس علاجاً سحرياً: يجب إفهام المريض أن النظام أداة قوية لتحسين التحكم، ولكنه ليس "علاجاً نهائياً" (Cure)، ولا يزال يتطلب تفاعلاً يومياً منه.',
            'مفهوم "الأنسولين النشط" (Insulin-on-board): عند حدوث ارتفاع في السكر، قد يحاول المريض إعطاء جرعة تصحيحية يدوية ليفاجأ بأن المضخة ترفض ذلك. يجب شرح أن النظام يقوم استباقياً بضخ أنسولين إضافي، وهذا التقييد يحميه من تراكم الجرعات وتجنب الهبوط اللاحق.',
            'توقيت جرعة الوجبات: في الأنظمة الهجينة الحالية، يجب على المريض إدخال بيانات الكربوهيدرات وإعطاء جرعة الوجبة قبل الأكل لتجنب الارتفاعات الحادة بعد الوجبة.'
          ]
        }
      },
      {
        title: {
          en: '2. The "CARES" Clinical Approach for Physicians',
          ar: '2. نهج "CARES" السريري للأطباء'
        },
        items: {
          en: [
            'To make it easier for physicians to understand any new AID system introduced to the market, the report recommends using a framework known as (CARES), an acronym for five key areas the physician must know about the system:',
            '1. Calculate: How does the algorithm calculate insulin? Does the system rely on a fixed target (e.g., 120 mg/dL) or work within a target range (e.g., 112.5 - 160 mg/dL)?',
            '2. Adjust: What settings can the physician adjust? In most systems, the physician can adjust the "Insulin-to-carbohydrate ratio", the "Correction factor", and active insulin time. (Note: some advanced systems like Diabeloop use AI to auto-adjust meal ratios).',
            '3. Revert: When should the automated system be stopped and reverted to pre-programmed manual delivery? The physician must instruct the patient to stop the system when: Ketones appear without significant hyperglycemia; using medications like corticosteroids; or during periods of severe illness associated with acute insulin resistance.',
            '4. Educate: What are the core educational points for the patient? Such as how to handle malfunctions and providing a backup plan (reserve insulin pens) when the system fails.',
            '5. Sensor/Share: What are the features of the connected sensor? Does it require fingerstick calibration? How can its data be shared in the cloud with family (e.g., parents monitoring children) or with the physician?'
          ],
          ar: [
            'لتسهيل فهم الأطباء لأي نظام (AID) جديد يطرح في الأسواق، يوصي التقرير باستخدام إطار عمل يُعرف بـ (CARES)، وهو اختصار لخمسة محاور رئيسية يجب على الطبيب معرفتها عن النظام:',
            '1. الحساب (Calculate): كيف تحسب الخوارزمية الأنسولين؟ هل يعتمد النظام على هدف ثابت (مثل 120 مجم/ديسيلتر) أم يعمل ضمن نطاق مستهدف (مثل 112.5 - 160 مجم/ديسيلتر)؟',
            '2. التعديل (Adjust): ما هي الإعدادات التي يمكن للطبيب تعديلها؟ في معظم الأنظمة، يمكن للطبيب تعديل "نسبة الأنسولين إلى الكربوهيدرات" (Insulin-to-carbohydrate ratio)، ومعامل الحساسية (Correction factor)، ومدة بقاء الأنسولين الفعال. (ملاحظة: بعض الأنظمة المتقدمة مثل Diabeloop تستخدم الذكاء الاصطناعي لتعديل نسبة الوجبات تلقائياً).',
            '3. العودة للوضع اليدوي (Revert): متى يجب إيقاف النظام الآلي والعودة للضخ اليدوي المبرمج مسبقاً؟ يجب على الطبيب توجيه المريض لإيقاف النظام في حالات: ظهور الكيتونات دون ارتفاع ملحوظ في السكر؛ استخدام أدوية مثل الكورتيزون؛ أو أثناء فترات المرض الشديد (Illness) التي تترافق مع مقاومة حادة للأنسولين.',
            '4. التثقيف (Educate): ما هي نقاط التعليم الأساسية للمريض؟ مثل كيفية التعامل مع الأعطال، وتوفير خطة بديلة (أقلام أنسولين احتياطية) عند فشل النظام.',
            '5. المستشعر والمشاركة (Sensor/Share): ما هي خصائص المستشعر المتصل؟ وهل يحتاج لمعايرة بوخز الإصبع؟ وكيف يمكن مشاركة بياناته سحابياً مع العائلة (مثل مراقبة الآباء لأطفالهم) أو مع الطبيب؟'
          ]
        }
      },
      {
        title: {
          en: '3. Clinical & Technical Support',
          ar: '3. الدعم السريري والتقني (Clinical & Technical Support)'
        },
        items: {
          en: [
            'To ease the burden on clinics and ensure patient safety, a clear distinction must be made between two types of support:',
            'Technical Support: This is the manufacturer\'s responsibility. A 24/7 multilingual hotline must be provided to resolve issues like broken screens, loss of connection between sensor and pump, and replacement of damaged parts.',
            'Clinical Support: An emergency line for medical staff (or specialized diabetes nursing staff) must be available to answer patient queries regarding insulin doses, dealing with persistent hypoglycemia, or how to stop the system during illness.',
            'Standardized Reporting: To facilitate the physician\'s work in adjusting doses, it is recommended to rely on standardized reports for AID system data (similar to AGP reports used with continuous glucose monitors) so the physician can read the data quickly and accurately.'
          ],
          ar: [
            'لتخفيف العبء عن العيادات وضمان سلامة المريض، يجب التفرقة بوضوح بين نوعين من الدعم:',
            'الدعم التقني (Technical Support): وهو مسؤولية الشركة المصنعة. يجب توفير خط ساخن على مدار الساعة بلغات متعددة لحل مشاكل الشاشات المكسورة، فقدان الاتصال بين المستشعر والمضخة، واستبدال القطع التالفة.',
            'الدعم السريري (Clinical Support): يجب توفير خط طوارئ للطاقم الطبي (أو طاقم تمريض متخصص في السكري) للرد على استفسارات المرضى حول جرعات الأنسولين، التعامل مع الهبوط المستمر، أو كيفية إيقاف النظام وقت المرض.',
            'توحيد التقارير: لتسهيل عمل الطبيب في تعديل الجرعات، يوصى بالاعتماد على تقارير موحدة لبيانات أنظمة AID (مشابهة لتقارير AGP المستخدمة مع أجهزة قياس السكر المستمر) ليتمكن الطبيب من قراءة البيانات بسرعة ودقة.'
          ]
        }
      }
    ]
  },
  {
    id: 'easd-2022-aid-part5',
    group: '2022 Automated Insulin Delivery Consensus Report',
    sourceIds: ['easd-2022-automated-insulin-delivery-consensus-report'],
    tags: ['Safety', 'Cybersecurity', 'Data Privacy', 'GDPR', 'Skin Reactions'],
    title: {
      en: 'Part 5: Safety, Cybersecurity, and Data Privacy',
      ar: 'الجزء الخامس: جوانب السلامة، الأمن السيبراني، وخصوصية البيانات'
    },
    summary: {
      en: 'As AID systems become internet-connected devices relying on complex algorithms, this section outlines the emerging clinical, technological, and legal challenges regarding safety, cybersecurity, and data privacy.',
      ar: 'مع تحول أنظمة (AID) إلى أجهزة متصلة بالإنترنت وتعتمد على خوارزميات معقدة، تظهر تحديات جديدة تتجاوز الجانب الطبي البحت لتشمل التكنولوجيا والقانون.'
    },
    points: {
      en: [],
      ar: []
    },
    details: [
      {
        title: {
          en: '1. Clinical Safety',
          ar: '1. جوانب السلامة السريرية (Clinical Safety)'
        },
        items: {
          en: [
            'Safety requirements for these systems are similar to insulin pumps and CGM devices but carry additional dimensions:',
            'Hypoglycemia & DKA: The primary risk lies in a system malfunction (e.g., incorrect dose recommendation) or user error (e.g., giving extra manual doses on top of the system\'s correction doses). Conversely, an infusion set occlusion can lead to a rapid lack of insulin and Diabetic Ketoacidosis (DKA).',
            'Skin Reactions: Skin reactions, specifically contact dermatitis (both allergic and irritant), have become a common clinical issue due to the continuous use of device adhesives. Many severe allergic reactions have been linked to a chemical in the adhesives called (isobornyl acrylate). The physician may sometimes need to perform patch testing to identify the cause and exclude allergens.',
            'Malfunction Reporting and Device Recalls: It is essential for the physician and patient to report any malfunctions to regulatory authorities (such as the FDA\'s MAUDE database in the US). This continuous reporting has previously helped discover serious issues leading to market recalls, such as the recall of the (Medtronic 670G) system due to a problem with the pump\'s retainer ring that affected insulin delivery.'
          ],
          ar: [
            'تتشابه متطلبات السلامة لهذه الأنظمة مع مضخات الأنسولين وأجهزة القياس المستمر، ولكنها تحمل أبعاداً إضافية:',
            'نوبات الهبوط والحماض الكيتوني (Hypoglycemia & DKA): الخطر الأساسي يكمن في حدوث خلل في النظام (مثل التوصية بجرعات خاطئة) أو خطأ من المستخدم (مثل إعطاء جرعات يدوية إضافية فوق جرعات النظام التصحيحية). في المقابل، قد يؤدي انسداد مجموعة التسريب (Infusion set) إلى نقص الأنسولين السريع وحدوث الحماض الكيتوني السكري.',
            'المضاعفات الجلدية (Skin Reactions): أصبحت التفاعلات الجلدية، وتحديداً التهاب الجلد التماسي (Contact dermatitis) بشقيه التحسسي والتهيُّجي، مشكلة سريرية شائعة بسبب الاستخدام المستمر للواصق الأجهزة. تم ربط العديد من حالات الحساسية الشديدة بوجود مادة كيميائية في اللواصق تُسمى (isobornyl acrylate). قد يحتاج الطبيب في بعض الحالات لإجراء اختبار حساسية (Patch testing) لتحديد المسبب واستبعاد المواد المسببة للحساسية.',
            'الإبلاغ عن الأعطال وسحب الأجهزة: من الضروري أن يقوم الطبيب والمريض بالإبلاغ عن أي أعطال للجهات الرقابية (مثل قاعدة بيانات MAUDE التابعة لـ FDA في الولايات المتحدة). هذا الإبلاغ المستمر هو ما ساعد سابقاً في اكتشاف مشاكل خطيرة أدت لسحب منتجات من الأسواق، مثل سحب نظام (Medtronic 670G) بسبب مشكلة في الحلقة المثبتة للمضخة والتي كانت تؤثر على ضخ الأنسولين.'
          ]
        }
      },
      {
        title: {
          en: '2. Cybersecurity',
          ar: '2. الأمن السيبراني (Cybersecurity)'
        },
        items: {
          en: [
            'Since system components (sensor, pump, and smartphone) communicate wirelessly, they are vulnerable to hacking:',
            'Hacking Risks: In 2019, the FDA issued a warning about the potential for an unauthorized person to wirelessly connect to certain types of insulin pumps. This breach could allow the hacker to change settings to deliver massive amounts of insulin (causing severe hypoglycemia) or stop delivery entirely (causing DKA).',
            'Multiple Manufacturers: Cybersecurity vulnerabilities increase when an AID system consists of components from different companies, requiring continuous vigilance from developers, physicians, and patients, and constant software updates to patch vulnerabilities.'
          ],
          ar: [
            'نظراً لأن أجزاء النظام (المستشعر، المضخة، والهاتف الذكي) تتواصل معاً لاسلكياً، فهي عُرضة للاختراق التقني:',
            'مخاطر الاختراق: في عام 2019، أصدرت إدارة الغذاء والدواء الأمريكية (FDA) تحذيراً يفيد باحتمالية تمكن شخص غير مصرح له من الاتصال لاسلكياً ببعض أنواع مضخات الأنسولين. هذا الاختراق قد يسمح للمخترق بتغيير الإعدادات لضخ كميات هائلة من الأنسولين (مما يسبب هبوطاً حاداً) أو إيقاف الضخ تماماً (مما يسبب حماضاً كيتونياً).',
            'تعدد الشركات المصنعة: تزداد ثغرات الأمن السيبراني عندما يتكون نظام AID من مكونات تابعة لشركات مختلفة، مما يتطلب يقظة مستمرة من الشركات المطورة والأطباء والمرضى، وتحديثات برمجية دائمة لسد الثغرات.'
          ]
        }
      },
      {
        title: {
          en: '3. Data Privacy & Protection',
          ar: '3. خصوصية البيانات وحمايتها (Data Privacy & Protection)'
        },
        items: {
          en: [
            'These systems generate massive amounts of precise data about a patient\'s life, automatically uploaded to cloud servers, raising significant ethical and legal questions:',
            'Use of Data in Research: Companies are increasingly using patients\' cloud data in "Real-world studies". Although the patient agrees to the terms of use, they often do not fully understand them. This brings up the concept of "Data donation" as an ethical option that must be clarified to the patient.',
            'Legal Risks and Insurance Companies: Do insurance companies have the right to access this data to adjust the patient\'s insurance coverage? What if the patient is involved in a fatal car accident; can the court extract the pump\'s data to prove the patient neglected to treat hypoglycemia, leading to unconsciousness and causing the accident? These questions currently pose major legal challenges.',
            'European Laws (GDPR): In Europe, laws are very strict (e.g., GDPR). The patient enjoys the "Right to be forgotten," meaning the total deletion of their data from the company\'s servers if they decide to stop using the system.',
            'Social and Professional Stigma: It must be recognized that the mere presence of recorded CGM and AID data discloses a diabetes diagnosis, which in some countries could negatively impact employment opportunities or insurance access.'
          ],
          ar: [
            'تُنتج هذه الأنظمة كميات هائلة من البيانات الدقيقة حول حياة المريض، وتُرفع تلقائياً إلى الخوادم السحابية، مما يثير أسئلة أخلاقية وقانونية هامة:',
            'استخدام البيانات في الأبحاث: تتجه الشركات لاستخدام بيانات المرضى السحابية في "الدراسات الواقعية" (Real-world studies). ورغم أن المريض يوافق على شروط الاستخدام، إلا أنه غالباً لا يفهمها بالكامل. وهنا يبرز مفهوم "التبرع بالبيانات" (Data donation) كخيار أخلاقي يجب توضيحه للمريض.',
            'المخاطر القانونية وشركات التأمين: هل يحق لشركات التأمين الوصول لهذه البيانات لتعديل التغطية التأمينية للمريض؟ وماذا لو تورط المريض في حادث سير مميت، هل يمكن للمحكمة استخراج بيانات المضخة لإثبات أن المريض أهمل في علاج هبوط السكر مما أدى لفقدانه الوعي وتسببه في الحادث؟ هذه التساؤلات تشكل تحديات قانونية كبرى حالياً.',
            'القوانين الأوروبية (GDPR): في أوروبا، القوانين صارمة جداً (مثل GDPR). يحق للمريض التمتع بـ "الحق في النسيان" (Right to be forgotten)؛ أي حذف بياناته كلياً من خوادم الشركة إذا قرر التوقف عن استخدام النظام.',
            'الوصمة الاجتماعية والمهنية: يجب إدراك أن مجرد وجود بيانات مسجلة لمراقبة السكر المستمر (CGM) ونظام (AID) يفصح عن التشخيص بمرض السكري، وهو ما قد يؤثر سلباً في بعض الدول على فرص التوظيف أو الحصول على تأمين.'
          ]
        }
      }
    ]
  },
  {
    id: 'easd-2022-aid-part6',
    group: '2022 Automated Insulin Delivery Consensus Report',
    sourceIds: ['easd-2022-automated-insulin-delivery-consensus-report'],
    tags: ['Regulation', 'Access', 'Health Policy', 'HCPs Recommendations', 'Health Disparities'],
    title: {
      en: 'Part 6: Final Guidelines and Recommendations for Physicians and Health Systems',
      ar: 'الجزء السابع والأخير: الإرشادات التوجيهية وتوصيات التقرير التوافقي النهائية'
    },
    summary: {
      en: 'This final section provides a clear roadmap for integrating these technologies into clinical practice and health policies, highlighting regulatory landscapes, healthcare disparities, and direct recommendations.',
      ar: 'هذا الجزء يضع النقاط على الحروف، حيث يقدم التقرير المشترك خارطة طريق واضحة لكيفية دمج هذه التقنيات في الممارسة السريرية والسياسات الصحية.'
    },
    points: {
      en: [],
      ar: []
    },
    details: [
      {
        title: {
          en: '1. Regulation & Access',
          ar: '1. المشهد التشريعي والوصول للتكنولوجيا (Regulation & Access)'
        },
        items: {
          en: [
            'It is important for the physician to understand how these devices are approved to justify the availability of some and the delay of others:',
            'United States (FDA): The US FDA is highly flexible, issuing guidance to accelerate approvals and creating a new regulatory category called "Interoperable devices" to ease restrictions and facilitate integrating components from different companies.',
            'European Union (EU MDR): The EU recently began enforcing stricter laws (EU MDR), placing a heavier burden on manufacturers to provide rigorous clinical and technical evidence, relying on independent "Notified bodies" rather than a single evaluating entity.',
            'Access Challenges and Cost: The high cost of systems (purchasing devices and ongoing supplies like sensors and batteries) remains the biggest barrier. The report warns of Health disparities, where low-income patients or rural residents, who might need and benefit from this technology the most, are denied access due to cost or implicit bias from some care providers.'
          ],
          ar: [
            'من المهم للطبيب أن يفهم كيف تُعتمد هذه الأجهزة لتبرير توفر بعضها وتأخر بعضها الآخر:',
            'الولايات المتحدة (FDA): تتميز إدارة الغذاء والدواء الأمريكية بمرونة عالية، حيث أصدرت إرشادات لتسريع الاعتمادات، وابتكرت فئة تنظيمية جديدة تسمى "الأجهزة القابلة للتشغيل البيني" (Interoperable devices) لتخفيف القيود وتسهيل دمج مكونات من شركات مختلفة.',
            'الاتحاد الأوروبي (EU MDR): بدأ الاتحاد الأوروبي مؤخراً بتطبيق قوانين أكثر صرامة (EU MDR)، والتي تضع عبئاً أكبر على الشركات المصنعة لتقديم أدلة سريرية وتقنية دقيقة، ولا تعتمد على جهة تقييم واحدة بل على "هيئات معتمدة" مستقلة (Notified bodies).',
            'تحديات الوصول والتكلفة: التكلفة المرتفعة للأنظمة (شراء الأجهزة والمستلزمات المستمرة كالمستشعرات والبطاريات) تظل العائق الأكبر. يحذر التقرير من التفاوت في الرعاية الصحية (Health disparities)، حيث يُحرم المرضى ذوو الدخل المنخفض أو سكان المناطق الريفية، والذين قد يكونون الأكثر حاجة واستفادة من هذه التكنولوجيا، من الوصول إليها بسبب التكلفة أو التحيز الضمني لبعض مقدمي الرعاية.'
          ]
        }
      },
      {
        title: {
          en: '2. HCPs Recommendations',
          ar: '2. التوصيات المباشرة للأطباء ومقدمي الرعاية الصحية (HCPs Recommendations)'
        },
        items: {
          en: [
            'The report outlined clear and direct responsibilities for medical staff:',
            'Precise Technical Knowledge: Physicians must build robust knowledge of the various AID systems available in their countries, understand their nuances, and recognize the strengths and weaknesses of each system.',
            'Shared Decision-Making and Expectation Management: A specific system should not be imposed; rather, the patient must be involved in a Shared decision-making process, providing them with realistic information on what the system can and cannot do to avoid subsequent frustration.',
            'Providing Contingency Plans and Continuous Support: Clinics must provide a communication mechanism (like a dedicated emergency hotline) allowing the patient 24/7 medical support (including weekends and nights) to handle critical emergencies. Clear protocols must also be established for situations where the AID system must be completely stopped and reverted to manual injections.',
            'Utilizing Data to Improve Care Quality: The precise health data generated by these systems should be utilized to personalize treatment and improve health outcomes for each individual patient.'
          ],
          ar: [
            'حدد التقرير مسؤوليات واضحة ومباشرة على عاتق الطاقم الطبي تتمثل في:',
            'المعرفة التقنية الدقيقة: يجب على الأطباء بناء معرفة قوية بأنظمة (AID) المختلفة المتاحة في بلدانهم، وفهم الفروق الدقيقة بينها، وإدراك نقاط القوة والضعف لكل نظام.',
            'القرار المشترك وإدارة التوقعات: لا يجب فرض نظام معين، بل يجب إشراك المريض في اتخاذ القرار (Shared decision-making)، وتزويده بمعلومات واقعية حول ما يمكن للنظام فعله وما لا يمكنه فعله، لتجنب الإحباط اللاحق.',
            'توفير خطط طوارئ ودعم مستمر: يجب على العيادات توفير آلية تواصل (مثل رقم هاتف مخصص للطوارئ) تتيح للمريض الحصول على دعم طبي على مدار الساعة (بما في ذلك عطلات نهاية الأسبوع والليل) للتعامل مع الحالات الحرجة الطارئة. كما يجب وضع بروتوكولات واضحة للحالات التي يجب فيها إيقاف نظام AID كلياً والعودة للحقن اليدوي.',
            'توظيف البيانات لرفع جودة الرعاية: يجب استغلال البيانات الصحية الدقيقة التي تنتجها هذه الأنظمة لتخصيص العلاج وتحسين المخرجات الصحية لكل مريض على حدة.'
          ]
        }
      },
      {
        title: {
          en: '3. Health Policy Recommendations',
          ar: '3. التوصيات المتعلقة بسياسات المنظومة الصحية (Health Policy Recommendations)'
        },
        items: {
          en: [
            'For this technology to succeed at a public health level, the report recommends decision-makers:',
            'Dynamic Policy Review: Given the extremely rapid evolution of diabetes technology, coverage and access policies must not be rigid; they must be reviewed and updated frequently and continuously.',
            'Addressing Inequity: Health policies must include clear mechanisms to reduce disparities in accessing technology across different societal strata.',
            'Patient Evaluations: "Patient-reported outcomes" must be integrated when drafting policies to ensure the technology actually improves their quality of life.'
          ],
          ar: [
            'لكي تنجح هذه التكنولوجيا على مستوى الصحة العامة، يوصي التقرير صناع القرار بما يلي:',
            'المراجعة الديناميكية للسياسات: نظراً للتطور السريع جداً في تكنولوجيا السكري، يجب ألا تكون سياسات التغطية التأمينية والوصول جامدة، بل يجب مراجعتها وتحديثها بشكل متكرر ومستمر.',
            'معالجة عدم المساواة: يجب أن تتضمن السياسات الصحية آليات واضحة للحد من التفاوت في فرص الحصول على التكنولوجيا بين مختلف طبقات المجتمع.',
            'تقييمات المرضى: يجب دمج "النتائج المبلغ عنها من قبل المرضى" (Patient-reported outcomes) عند صياغة السياسات، لضمان أن التكنولوجيا تحسن جودة حياتهم الفعلية.'
          ]
        }
      }
    ]
  }
];
