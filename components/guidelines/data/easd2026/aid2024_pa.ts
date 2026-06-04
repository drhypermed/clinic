import { GuidelineTopic } from '../../guidelinesData';

export const EASD_2024_AID_PA_TOPICS: GuidelineTopic[] = [
  {
    id: 'easd-2024-aid-pa',
    group: '2024 Automated Insulin Delivery Around Physical Activity Type 1 Diabetes',
    sourceIds: ['easd-2024-automated-insulin-delivery-around-physical-activity-typ'],
    tags: ['Physical Activity', 'AID', 'CGM', 'Exercise', 'Consensus Recommendations', 'Physiology', 'Commercial AID', 'Special Circumstances'],
    title: {
      en: '2024 Automated Insulin Delivery Around Physical Activity',
      ar: 'مضخات الأنسولين الآلية أثناء النشاط البدني 2024'
    },
    summary: {
      en: 'Comprehensive consensus recommendations and clinical guidelines for managing Automated Insulin Delivery (AID) systems during physical activity.',
      ar: 'توصيات مرجعية وإرشادات سريرية شاملة لإدارة أنظمة ضخ الأنسولين الآلية (AID) أثناء النشاط البدني.'
    },
    points: {
      en: [],
      ar: []
    },
    details: [
      {
        title: {
          en: 'Part 1: Context and Consensus Recommendations',
          ar: 'الجزء الأول: المقدمة والتوصيات الأساسية'
        },
        items: {
          en: [
            'Physical activity is a cornerstone in diabetes care, but it causes rapid glucose fluctuations that pose a challenge for current AID systems. A major challenge is the Time Lag between the sensor reading in the interstitial fluid and the actual blood glucose level, especially with rapid changes during exercise. Additionally, algorithms struggle to curb insulin delivery quickly enough if glucose is high before exercise and an automated correction bolus is given.',
            'To overcome these challenges, the associations (EASD and ISPAD) have established five rules that physicians must train their patients on:',
            'First: Planned PA - Setting the Target. If glucose is expected to drop or remain stable during activity, a "Higher glucose target" must be set 1 to 2 hours before starting the activity. This proactive measure reduces Insulin on Board (IOB) before starting the effort. However, if glucose is expected to rise (as sometimes happens in high-intensity anaerobic exercises and competitions), it is recommended to keep the usual target or set a lower target.',
            'Second: Prandial Bolus Reduction. If the planned activity will occur within two hours of consuming a carbohydrate-rich meal, and a glucose drop is expected, the Prandial bolus must be reduced by 25% to 33%. Important Clinical Note: The patient must activate the "Higher glucose target" in the pump *before* reducing the meal bolus, to prevent the system from giving automated correction boluses to compensate for the missing dose.',
            'Third: Monitoring and Carbohydrate Intervention During Effort. Close attention must be paid to CGM readings and trend arrows. If glucose drops below 7.0 mmol/L during activity, the patient must immediately start consuming small amounts of fast-acting carbohydrates (3 to 20 g) based on the number and direction of the downward arrows. These carbs should be consumed without announcing it to the pump. Medical Warning: Patients must be advised not to over-consume carbohydrates, as this may lead to a rebound hyperglycemia, prompting the automated system to pump additional insulin, resulting in a sudden drop during or immediately after exercise.',
            'Fourth: Unplanned PA. Since there was no time to prepare, the higher glucose target must be activated immediately upon starting the activity (if a glucose drop is expected), along with consuming 10 to 20 g of fast-acting carbs if glucose is below 7.0 mmol/L. If a glucose rise is expected, the normal or low target is maintained.',
            'Fifth: Choosing the Safe Timing and Contraindications to Exercise. It is always preferable to plan exercise when the "Insulin on Board (IOB)" is low, such as during fasted states or before meals, to reduce the risk of hypoglycemia. Low-intensity activities after meals are recommended as a way to lower high glucose and return it to the target range. Absolute Contraindications: Exercise must be avoided entirely if glucose is above 15.0 mmol/L accompanied by blood ketones above 1.5 mmol/L, as this indicates a risk of Diabetic Ketoacidosis (DKA).'
          ],
          ar: [
            '1. السياق والتحديات الطبية (Context & Challenges)',
            'النشاط البدني هو ركن أساسي في رعاية مرضى السكري، لكنه يسبب تقلبات سريعة في الجلوكوز تشكل تحدياً لأنظمة (AID) الحالية. من أبرز هذه التحديات وجود تأخر زمني (Lag time) بين قراءة الحساس للسكر في السائل الخلالي (Interstitial glucose) ومستوى السكر الفعلي في الدم، خاصة مع التغيرات السريعة التي تحدث وقت الرياضة. بالإضافة إلى ذلك، تواجه الخوارزميات صعوبة في كبح ضخ الأنسولين بسرعة كافية إذا كان السكر مرتفعاً قبل الرياضة وتم إعطاء جرعة تصحيحية آلية.',
            '2. التوصيات الخمس الأساسية (The 5 Key Strategies)',
            'للتغلب على هذه التحديات، وضعت الجمعيات (EASD و ISPAD) خمس قواعد يجب على الأطباء تدريب مرضاهم عليها:',
            'أولاً: التعامل مع النشاط المخطط له مسبقاً (Planned PA) - ضبط الهدف. إذا كان من المتوقع أن ينخفض السكر أو يظل مستقراً أثناء النشاط، يجب تعيين "هدف جلوكوز أعلى" (Higher glucose target) قبل 1 إلى 2 ساعة من بدء النشاط. هذا الإجراء الاستباقي يقلل من الأنسولين المتبقي (IOB) قبل بدء المجهود. أما إذا كان متوقعاً أن يرتفع السكر (كما يحدث أحياناً في التمارين اللاهوائية عالية الشدة والمنافسات)، فيُنصح بالاحتفاظ بالهدف المعتاد أو تعيين هدف أقل.',
            'ثانياً: تعديل جرعات الوجبات ما قبل الرياضة (Prandial Bolus Reduction). إذا كان النشاط المخطط له سيحدث خلال ساعتين (أقل من 2 ساعة) من تناول وجبة غنية بالكربوهيدرات، وكان متوقعاً انخفاض السكر، يجب تقليل جرعة الأنسولين للوجبة (Prandial bolus) بنسبة 25% إلى 33%. نقطة سريرية هامة: يجب على المريض تفعيل "الهدف الجلوكوزي الأعلى" في المضخة *قبل* تقليل جرعة الوجبة؛ لتجنب قيام النظام بضخ جرعات تصحيحية آلية تعويضاً عن الجرعة الناقصة.',
            'ثالثاً: المراقبة والتدخل بالكربوهيدرات أثناء المجهود. يجب الانتباه بشدة لقراءات الحساس (CGM) وأسهم الاتجاه. إذا انخفض السكر عن 7.0 مليمول/لتر أثناء النشاط، يجب البدء فوراً بتناول كميات صغيرة من الكربوهيدرات سريعة الامتصاص (من 3 إلى 20 جم) بناءً على عدد واتجاه أسهم الانخفاض. يجب أن يتم تناول هذه الكربوهيدرات دون إدخالها في نظام المضخة (Without announcing it). تحذير طبي: يجب توعية المرضى بعدم الإفراط في تناول الكربوهيدرات؛ لأن ذلك قد يؤدي إلى ارتفاع ارتدادي في السكر، مما يحفز النظام الآلي لضخ كميات إضافية من الأنسولين، وبالتالي حدوث هبوط مفاجئ أثناء أو بعد الرياضة مباشرة.',
            'رابعاً: التعامل مع النشاط المفاجئ أو غير المخطط له (Unplanned PA). بما أنه لم يكن هناك وقت للتجهيز، يجب تفعيل الهدف الجلوكوزي الأعلى فوراً عند بدء النشاط (إذا كان متوقعاً انخفاض السكر)، مع تناول 10 إلى 20 جم من الكربوهيدرات السريعة إذا كان السكر أقل من 7.0 مليمول/لتر. إذا كان متوقعاً ارتفاع السكر، يتم الإبقاء على الهدف العادي أو المنخفض.',
            'خامساً: اختيار التوقيت الآمن وموانع ممارسة الرياضة. يُفضل دائماً التخطيط للرياضة عندما يكون مستوى "الأنسولين المتبقي في الجسم" (Insulin on board - IOB) منخفضاً، مثل أوقات الصيام (Fasted state) أو قبل الوجبات، لتقليل خطر الهبوط. يُنصح بالأنشطة منخفضة الشدة بعد الوجبات كوسيلة لخفض السكر المرتفع وإعادته للنطاق المستهدف. موانع قاطعة: يجب تجنب الرياضة تماماً إذا كان السكر أعلى من 15.0 مليمول/لتر مترافقاً مع وجود كيتونات في الدم أعلى من 1.5 مليمول/لتر، حيث يشير ذلك لخطر حدوث حماض كيتوني (DKA).'
          ]
        }
      },
      {
        title: {
          en: 'Part 2: General Principles of Physiology and Clinical Considerations',
          ar: 'الجزء الثاني: المبادئ العامة للفسيولوجيا والاعتبارات السريرية'
        },
        items: {
          en: [
            'The average glucose response varies significantly based on several factors, including active insulin level, baseline glucose, time of exercise (like morning or evening), fitness level, and even menstrual cycle phases. Generally, it can be categorized as:',
            'Continuous Aerobic Exercise: Like walking or cycling after meals, usually leads to a decrease in glucose levels.',
            'Mixed and Team Sports: Like tennis or basketball, may maintain glucose stability or cause a slight decrease.',
            'High-Intensity Anaerobic Exercise and Competitions: Especially if performed in a fasted state overnight, these are associated with a high response of stress hormones and tend to raise glucose levels significantly.',
            'A high level of Insulin on Board (IOB) is a strong indicator of an increased risk of hypoglycemia during physical activity. Therefore, it is medically recommended that patients begin their exercises when the IOB level is low, as a preventive strategy if a glucose drop is expected during the activity.',
            'If glucose drops below 7.0 mmol/L during physical activity (even with a higher glucose target activated), the required amount of fast-acting carbohydrates is precisely determined based on the CGM trend arrow, and must be consumed without announcing it to the pump to avoid extra automated insulin doses:',
            'Horizontal Arrow: Recommend giving 3 to 6 grams of carbohydrates.',
            'Slightly Decreasing Arrow: Recommend giving 6 to 9 grams of carbohydrates.',
            'Decreasing Arrow: Recommend giving 9 to 12 grams of carbohydrates.',
            'Two or Three Downward Arrows: Recommend giving 12 to 20 grams of carbohydrates.',
            'Follow-up Intervention: Glucose levels must be rechecked 20 to 30 minutes after consuming carbohydrates, repeating the aforementioned treatment if necessary.',
            'Patients must be guided to take specific steps before starting physical activity (whether planned or unplanned) based on their current glucose level:',
            'If glucose is below 5.0 mmol/L: Activate the "Higher glucose target" in the pump. Consume a light snack containing 10 to 20 g of carbs without giving a prandial bolus upon starting the activity. If the planned activity occurs within two hours of a previous meal, reduce the meal bolus by 25-33%.',
            'If glucose is between 5.0 and 15.0 mmol/L: Activate the "Higher glucose target" (preferably 1-2 hours before planned activity, or immediately for unplanned). The 25-33% meal bolus reduction also applies if consumed within two hours prior to planned activity. For unplanned activity, consider consuming 10-20 g of carbs without giving insulin to prevent hypoglycemia.',
            'If glucose is above 15.0 mmol/L: It may not be necessary to raise the glucose target in the pump for exercise. The pump infusion site must be carefully checked for any mechanical causes of occlusion (e.g., kinked tubing or pressure/discomfort at the site), especially if there are symptoms indicating Diabetic Ketoacidosis (DKA). As mentioned in the core recommendations, exercise is absolutely contraindicated if glucose is above 15.0 mmol/L accompanied by blood ketones above 1.5 mmol/L.'
          ],
          ar: [
            'أولاً: استجابة الجلوكوز حسب نوع الرياضة وشدتها',
            'الاستجابة لمتوسط الجلوكوز تختلف بشكل كبير بناءً على عدة عوامل، منها مستوى الأنسولين المتبقي، ومستوى الجلوكوز الأساسي، ووقت الرياضة (مثل الصباح أو المساء)، ومستوى اللياقة البدنية، وحتى أطوار الدورة الشهرية. وبشكل عام يمكن تصنيف التأثير كالتالي:',
            'التمارين الهوائية المستمرة والمطولة (Aerobic): مثل المشي أو ركوب الدراجة بعد الوجبات، تؤدي عادةً إلى انخفاض مستوى الجلوكوز.',
            'الرياضات المختلطة والفردية والجماعية: مثل التنس أو كرة السلة، قد تحافظ على استقرار الجلوكوز أو تسبب انخفاضاً طفيفاً.',
            'التمارين اللاهوائية عالية الشدة والمنافسات (Anaerobic & Explosive): خاصة إذا تمت في حالة الصيام طوال الليل، فإنها تترافق مع استجابة عالية لهرمونات التوتر (Stress hormones)، وتميل إلى رفع مستويات الجلوكوز بشكل ملحوظ.',
            'ثانياً: الاعتبارات الخاصة بالأنسولين المتبقي في الجسم (Insulin on Board - IOB)',
            'يُعد ارتفاع مستوى الأنسولين المتبقي في الجسم (IOB) مؤشراً قوياً لزيادة خطر التعرض لهبوط السكر أثناء النشاط البدني. لذلك، يُنصح طبياً بأن يبدأ المريض تمارينه عندما يكون مستوى (IOB) منخفضاً، وذلك كاستراتيجية وقائية إذا كان يُتوقع انخفاض الجلوكوز خلال النشاط.',
            'ثالثاً: التدخل الدقيق بالكربوهيدرات بناءً على أسهم الحساس (CGM Trend Arrows)',
            'إذا انخفض الجلوكوز عن 7.0 مليمول/لتر أثناء النشاط البدني (حتى مع تفعيل هدف جلوكوز مرتفع في المضخة)، يتم تحديد كمية الكربوهيدرات سريعة الامتصاص المطلوبة بدقة بناءً على اتجاه السهم في جهاز المراقبة المستمرة (CGM)، ويجب تناولها دون إدخالها في المضخة لتجنب ضخ النظام لجرعات أنسولين إضافية:',
            'إذا كان السهم أفقياً (Horizontal): يُنصح بإعطاء 3 إلى 6 جرامات من الكربوهيدرات.',
            'إذا كان السهم مائلاً للأسفل (Slightly decreasing): يُنصح بإعطاء 6 إلى 9 جرامات من الكربوهيدرات.',
            'إذا كان السهم مستقيماً للأسفل (Decreasing): يُنصح بإعطاء 9 إلى 12 جراماً من الكربوهيدرات.',
            'إذا كان هناك سهمان أو ثلاثة للأسفل: يُنصح بإعطاء 12 إلى 20 جراماً من الكربوهيدرات.',
            'متابعة التدخل: يجب إعادة فحص مستوى الجلوكوز بعد 20 إلى 30 دقيقة من تناول الكربوهيدرات، وتكرار العلاج المذكور إذا لزم الأمر.',
            'رابعاً: الاستراتيجيات السريرية ما قبل التمرين بناءً على قراءات الجلوكوز',
            'يجب توجيه المرضى لاتخاذ خطوات محددة قبل بدء النشاط البدني (سواء كان مخططاً أو غير مخطط له) استناداً إلى مستوى الجلوكوز الحالي لديهم:',
            'إذا كان السكر أقل من 5.0 مليمول/لتر: يجب تفعيل "الهدف الجلوكوزي الأعلى" في المضخة. يجب تناول وجبة خفيفة تحتوي على 10 إلى 20 جم من الكربوهيدرات دون إعطاء جرعة أنسولين للوجبة (No prandial bolus) عند بدء النشاط. إذا كان النشاط المخطط له سيتم خلال ساعتين من وجبة سابقة، يجب تقليل جرعة الوجبة بنسبة 25-33%.',
            'إذا كان السكر بين 5.0 و 15.0 مليمول/لتر: يتم تفعيل "الهدف الجلوكوزي الأعلى" (يُفضل قبل النشاط المخطط بمدة 1-2 ساعة، أو فوراً للنشاط المفاجئ). يُطبق أيضاً تخفيض جرعة الوجبة بنسبة 25-33% إذا تم تناولها خلال الساعتين السابقتين للنشاط المخطط له. في حال كان النشاط مفاجئاً، يمكن التفكير في تناول 10-20 جم كربوهيدرات دون إعطاء أنسولين لتفادي الهبوط.',
            'إذا كان السكر أعلى من 15.0 مليمول/لتر: قد لا يكون من الضروري للمريض رفع الهدف الجلوكوزي في المضخة للرياضة. يجب فحص موقع حقن المضخة بعناية للبحث عن أي أسباب ميكانيكية للانسداد (مثل التواء الأنبوب أو وجود ضغط/انزعاج في موقع الحقن)، لا سيما إذا كانت هناك أعراض تشير للحماض الكيتوني السكري (DKA). كما ورد في التوصيات الأساسية، يُمنع ممارسة الرياضة تماماً إذا كان الجلوكوز أعلى من 15.0 مليمول/لتر مع وجود كيتونات بالدم أعلى من 1.5 مليمول/لتر.'
          ]
        }
      },
      {
        title: {
          en: 'Part 3: Clinical Guidelines for Commercial AID Systems',
          ar: 'الجزء الثالث: الدليل السريري للأنظمة التجارية المتاحة'
        },
        items: {
          en: [
            '1. Beta Bionics iLet Bionic Pancreas',
            'Mechanism: Does not require precise carb counting; relies on the patient\'s estimation of meal size (usual, more, less), and has no dedicated exercise feature.',
            'Clinical Intervention:',
            '- It is recommended to change the glucose target manually to a higher target (7.2 mmol/L) 1-2 hours before starting the activity.',
            '- To reduce the pre-exercise meal bolus, the patient must be instructed to choose a "Less" meal size in the system, which will automatically reduce the meal bolus by 50%.',
            '- For sports with a high risk of hypoglycemia, it is preferable to suspend insulin delivery or disconnect the pump entirely 30 minutes prior to the activity.',
            '2. CamDiab mylife CamAPS FX',
            'Mechanism: Has two primary modes; "Ease-off" mode which reduces insulin, raises the target, and suspends delivery if glucose drops below 7.0 mmol/L, and "Boost" mode which increases the algorithm\'s responsiveness by up to 35% to lower glucose.',
            'Clinical Intervention:',
            '- For Expected Hypoglycemia: Activate "Ease-off" mode or manually raise the target 1-2 hours before exercise.',
            '- For Expected Hyperglycemia: In high-intensity exercises or fasted states, it is recommended to activate "Boost" mode to control glucose rises.',
            '- Medical Alert: For unplanned exercise requiring carbohydrates to raise glucose, they must be entered into the system as "Hypoglycaemia treatment" and not as a regular meal, preventing the system from delivering insulin for this food.',
            '3. Diabeloop Generation 1',
            'Mechanism: Features a "Physical Activity" mode that raises the glucose target by 3.9 mmol/L and reduces insulin aggressiveness, and a "ZEN" mode to slightly raise the target.',
            'Clinical Intervention:',
            '- It is recommended to activate Physical Activity mode at least 30 minutes prior (preferably 1-2 hours).',
            '- A great feature of this system is that it assesses glucose 15 minutes before starting exercise, and if it is below 8.9 mmol/L, it automatically suggests the required amount of carbohydrates to prevent hypoglycemia.',
            '- The system automatically reduces basal insulin for 16 hours after finishing physical activity to prevent late-onset hypoglycemia.',
            '4. Insulet Omnipod 5',
            'Mechanism: A wireless patch pump using an "Activity" feature to raise and fix the glucose target at 8.3 mmol/L.',
            'Clinical Intervention:',
            '- Activate the Activity feature 1-2 hours prior to protect against hypoglycemia.',
            '- If a glucose rise is expected (high-intensity exercise), the glucose target can be lowered to 6.1 mmol/L.',
            '- Critical Medical Point: The system has a "Reverse Correction" feature. If the patient reduces the pre-exercise meal bolus, it may lead to a glucose rise, prompting the system to automatically deliver insulin to lower it, which causes subsequent hypoglycemia. Therefore, it may be advised to pause this feature, or reduce the entered carbohydrate count instead of directly reducing the dose.',
            '5. Medtronic MiniMed 780G',
            'Mechanism: Relies on activating a "Temp Target" at 8.3 mmol/L. The most important clinical feature here is that this mode completely stops Auto-correction boluses.',
            'Clinical Intervention:',
            '- Activate the Temp Target 1-2 hours before starting the activity.',
            '- Pay close attention to activating the Temp Target *before* entering any meals or reducing their doses prior to exercise, as it prevents the system from giving correction boluses due to the glucose rise resulting from the reduced meal dose.',
            '- If a glucose rise is expected (or exercising in a competitive environment), normal settings can be kept or the target can be lowered to 5.5 mmol/L.',
            '6. Tandem t:slim X2 with Control-IQ',
            'Mechanism: Has two modes; "Exercise mode" which raises the glucose target to (7.8-8.9 mmol/L) but *allows an automated correction bolus once an hour*, and "Sleep mode" which narrows the glucose target to (6.3-6.7 mmol/L) but *completely prevents automated correction boluses*.',
            'Clinical Intervention:',
            '- Activate Exercise mode 1-2 hours prior for expected hypoglycemia.',
            '- Physicians are advised to encourage patients to create a "Personal Profile" for exercise days to reduce basal insulin and adjust sensitivity.',
            '- Medical trick to prevent hypoglycemia: Since the system may give a correction bolus during exercise, physicians are advised to teach patients to give a "micro-bolus" (e.g., 0.05 units) before starting exercise. This action tricks the system and prevents it from giving any automated correction boluses for 60 minutes.',
            '- For sports that raise glucose (like sprinting), the system can be placed in "Sleep mode" during exercise, as it prevents random corrective deliveries and targets strict control.'
          ],
          ar: [
            '1. نظام (Beta Bionics iLet Bionic Pancreas)',
            'آلية عمله: لا يطلب هذا النظام إدخال حساب دقيق للكربوهيدرات، بل يعتمد على تقدير المريض لحجم الوجبة (معتاد، أكثر، أقل)، ولا يحتوي على ميزة مخصصة للرياضة مثل باقي الأجهزة.',
            'التدخل السريري:',
            '- يُنصح بتغيير هدف الجلوكوز يدوياً من الهدف المعتاد إلى الهدف الأعلى (7.2 مليمول/لتر) قبل 1-2 ساعة من بدء النشاط.',
            '- لتقليل جرعة الأنسولين للوجبة التي تسبق الرياضة، يجب توجيه المريض لاختيار حجم وجبة "أقل" (Less) في النظام، وهو ما سيخفض جرعة الوجبة تلقائياً بنسبة 50%.',
            '- في الرياضات ذات الخطر العالي لهبوط السكر، يُفضل التوقف عن ضخ الأنسولين (Suspend) أو فصل المضخة تماماً قبل 30 دقيقة من النشاط.',
            '2. نظام (CamDiab mylife CamAPS FX)',
            'آلية عمله: يحتوي على وضعين أساسيين؛ وضع (Ease-off) الذي يقلل الأنسولين ويرفع هدف الجلوكوز ويوقف الضخ إذا انخفض السكر عن 7.0 مليمول/لتر، ووضع (Boost) الذي يزيد من استجابة الخوارزمية بنسبة تصل إلى 35% لخفض السكر.',
            'التدخل السريري:',
            '- للهبوط المتوقع: تفعيل وضع (Ease-off) أو رفع الهدف يدوياً قبل 1-2 ساعة من التمرين.',
            '- للارتفاع المتوقع: في التمارين عالية الشدة أو وقت الصيام، يُنصح بتفعيل وضع (Boost) للسيطرة على ارتفاع السكر.',
            '- تنبيه للطبيب: في حالة الرياضة المفاجئة التي تتطلب أكل كربوهيدرات لرفع السكر، يجب إدخالها في النظام تحت خيار "علاج هبوط السكر" (Hypoglycaemia treatment) وليس كوجبة عادية، لمنع النظام من ضخ أنسولين مقابل هذا الأكل.',
            '3. نظام (Diabeloop Generation 1)',
            'آلية عمله: يمتلك وضع (Physical Activity) الذي يرفع هدف الجلوكوز بمقدار 3.9 مليمول/لتر ويقلل من شراسة ضخ الأنسولين، كما يحتوي على وضع يُسمى (ZEN) لرفع الهدف بشكل طفيف.',
            'التدخل السريري:',
            '- يُنصح بتفعيل وضع الرياضة قبل 30 دقيقة على الأقل (ويفضل قبل 1-2 ساعة).',
            '- الجميل في هذا النظام أنه يقيم السكر قبل بدء الرياضة بـ 15 دقيقة، وإذا كان أقل من 8.9 مليمول/لتر، فإنه يقترح على المريض "آلياً" كمية الكربوهيدرات المطلوبة لمنع الهبوط.',
            '- النظام يخفض الأنسولين الأساسي آلياً لمدة 16 ساعة بعد انتهاء النشاط البدني للوقاية من الهبوط المتأخر.',
            '4. نظام (Insulet Omnipod 5)',
            'آلية عمله: مضخة لاسلكية (Patch pump) تستخدم خاصية (Activity) لرفع وتثبيت هدف الجلوكوز عند 8.3 مليمول/لتر.',
            'التدخل السريري:',
            '- تُفعل ميزة (Activity) قبل 1-2 ساعة للحماية من الهبوط.',
            '- أما إذا كان متوقعاً ارتفاع السكر (تمرين عالي الشدة)، فيمكن خفض الهدف الجلوكوزي إلى 6.1 مليمول/لتر.',
            '- نقطة طبية حرجة: يحتوي النظام على ميزة "التصحيح العكسي" (Reverse Correction). إذا قام المريض بخفض جرعة الوجبة ما قبل الرياضة، قد يؤدي ذلك لارتفاع السكر، فيقوم النظام آلياً بالضخ لخفضه، مما يسبب هبوطاً لاحقاً. لذا قد يُنصح بإيقاف هذه الميزة مؤقتاً، أو تقليل حساب الكربوهيدرات المُدخل للنظام بدلاً من الخفض المباشر للجرعة.',
            '5. نظام (Medtronic MiniMed 780G)',
            'آلية عمله: يعتمد على تفعيل "الهدف المؤقت" (Temp Target) عند 8.3 مليمول/لتر، والميزة السريرية الأهم هنا هي أن هذا الوضع يوقف تماماً الجرعات التصحيحية الآلية (Auto-correction boluses).',
            'التدخل السريري:',
            '- تفعيل الهدف المؤقت قبل 1-2 ساعة من بدء النشاط.',
            '- يجب الانتباه بشدة لتفعيل (Temp Target) *قبل* إدخال أي وجبات أو تقليل جرعتها قبل الرياضة، لأنه يمنع النظام من إعطاء جرعات تصحيحية بسبب ارتفاع السكر الناتج عن تقليل جرعة الوجبة.',
            '- في حال توقع ارتفاع الجلوكوز (أو ممارسة الرياضة في بيئة تنافسية)، يمكن إبقاء الإعدادات الطبيعية أو خفض الهدف إلى 5.5 مليمول/لتر.',
            '6. نظام (Tandem t:slim X2 with Control-IQ)',
            'آلية عمله: يمتلك وضعين؛ وضع الرياضة (Exercise mode) الذي يرفع الهدف الجلوكوزي إلى (7.8-8.9 مليمول/لتر) لكنه *يسمح بإعطاء جرعة تصحيحية آلية مرة كل ساعة*، ووضع النوم (Sleep mode) الذي يضيق هدف الجلوكوز إلى (6.3-6.7 مليمول/لتر) ولكنه *يمنع إعطاء الجرعات التصحيحية الآلية نهائياً*.',
            'التدخل السريري:',
            '- يُفعل وضع الرياضة قبل 1-2 ساعة للهبوط المتوقع.',
            '- يُنصح الأطباء بتشجيع المرضى على إنشاء "ملف إعدادات شخصي" (Personal Profile) خاص بأيام الرياضة لتقليل الأنسولين الأساسي (Basal) وتعديل معامل الحساسية.',
            '- حيلة طبية لمنع الهبوط: نظراً لأن النظام قد يعطي جرعة تصحيحية أثناء الرياضة، يُنصح الأطباء بتعليم المرضى إعطاء "جرعة يدوية صغيرة جداً" (مثلاً 0.05 وحدة) قبل بدء الرياضة. هذا الإجراء يخدع النظام ويمنعه من إعطاء أي جرعات تصحيحية آلية لمدة 60 دقيقة.',
            '- للرياضات التي ترفع السكر (مثل الركض السريع)، يمكن وضع النظام على وضع "النوم" (Sleep mode) أثناء الرياضة، كونه يمنع الضخ التصحيحي العشوائي ويستهدف سكر منضبط.'
          ]
        }
      },
      {
        title: {
          en: 'Part 4: Special Circumstances and Extreme Environments for Practitioners',
          ar: 'الجزء الرابع: الظروف الخاصة والبيئات القاسية للممارسين'
        },
        items: {
          en: [
            '1. Prolonged Sporting Events (Marathons, Triathlons, and Long Trails)',
            'Physiological Challenge: The patient faces a dual risk; severe insulin deficiency (raising ketone risk) along with the risk of hypo- or hyperglycemia.',
            'Clinical Intervention:',
            '- It is preferable to avoid setting a "higher glucose target" for the entire activity duration to prevent severe insulin deficiency during prolonged effort.',
            '- Rely on continuous carbohydrate feeding (Regular CHO feeding) throughout the duration of the activity.',
            '- Medical Warning: Patients must be prevented from eating large "uncovered snacks" (without an insulin bolus), as this will drive the algorithm to deliver large amounts of automated correction insulin, leading to severe subsequent hypoglycemia.',
            '2. Prolonged Pump Disconnection (>120 mins) and Contact Sports',
            'Physiological Challenge: Disconnecting the pump in water or contact sports (like wrestling or rugby) stops insulin delivery completely, raising the risk of Diabetic Ketoacidosis (DKA).',
            'Clinical Intervention:',
            '- The system must be suspended in the settings before disconnecting the pump, so the algorithm "knows" that insulin delivery has stopped.',
            '- It is recommended to instruct the patient to reconnect the pump every hour to deliver a small bolus, approximately equal to 50% of the usual basal insulin, to compensate for the deficiency.',
            '- In contact sports, if stress causes a glucose rise, it may not be suitable to set a high glucose target before playing.',
            '- Clinically, consider using an "Un-tethered approach" by administering a dose of long-acting basal insulin via pens along with pump disconnection.',
            '3. Stress and Competitive Sports',
            'Physiological Challenge: The stress hormone response leads to a noticeable rise in glucose before and during competition, followed by delayed hypoglycemia after the event ends.',
            'Clinical Intervention:',
            '- "Insulin on Board" (IOB) must be monitored closely, as the automated system will deliver extra amounts in response to stress-induced hyperglycemia.',
            '- It is preferable not to set a high glucose target 1-2 hours before the competition to avoid keeping glucose high.',
            '- If glucose exceeds 15.0 mmol/L due to stress, the physician can advise giving a manual correction bolus equal to only 50% of the usual correction dose.',
            '4. Water Sports (Swimming, Diving)',
            'Technical and Clinical Challenge: Being in water severs the Bluetooth connection between the CGM and the pump, completely stopping automation. Hypoglycemia here is a life-threatening risk.',
            'Clinical Intervention:',
            '- Avoid having high levels of "Insulin on Board" (IOB) before entering the water.',
            '- For the Omnipod 5 system, it is recommended to place the pod and sensor close to each other to increase the chance of picking up the Bluetooth signal.',
            '- In cases of very prolonged water exposure (which raises DKA risk), the sound medical decision may be to temporarily switch to Multiple Daily Injections (MDI) under medical supervision.',
            '5. Extreme Environments: Heat, Cold, and Altitude',
            'In Extreme Heat: Heat increases sweating, significantly increasing the speed of insulin absorption and the risk of hypoglycemia. CGM accuracy may also be affected; thus, it is recommended to perform a fingerstick check, reduce pre-exercise meal boluses by 25-33%, and secure devices with medical tape.',
            'In Extreme Cold (e.g., Skiing): Vasoconstriction and shivering to generate heat affect the physiological response. The biggest risk is the freezing of insulin in the pump or freezing of the glucose gel used to treat hypoglycemia; they must be kept close to the body, and "solid glucose tabs" used as a safe alternative. Attention must also be paid to the potential loss of signal or devices shutting down until warmed.',
            'At High Altitudes: Hypoxia affects the patient\'s decision-making and the accuracy of fingerstick glucose meters. Short-term exposure to altitude causes temporary insulin resistance due to sympathetic stimulation, which subsides after several days. However, at altitudes exceeding 5000 meters, cortisol secretion increases, vastly raising the risk of hyperglycemia.'
          ],
          ar: [
            '1. الفعاليات الرياضية المطولة (مثل الماراثون، الترايثلون، والمسارات الطويلة)',
            'التحدي الفسيولوجي: يواجه المريض خطراً مزدوجاً؛ نقص شديد في الأنسولين (مما يرفع خطر تكون الكيتونات) بالتزامن مع خطر هبوط أو ارتفاع السكر.',
            'التدخل السريري:',
            '- يُفضل تجنب تعيين "هدف جلوكوز أعلى" طوال فترة النشاط بالكامل، لتفادي النقص الحاد في الأنسولين أثناء المجهود المطول.',
            '- الاعتماد على التغذية المستمرة بالكربوهيدرات (Regular CHO feeding) طوال مدة النشاط.',
            '- تحذير طبي: يجب منع المريض من تناول وجبات أو وجبات خفيفة كبيرة "غير مغطاة بجرعة أنسولين" (Uncovered snacks)، لأن ذلك سيدفع خوارزمية النظام لضخ كميات كبيرة من الأنسولين التصحيحي الآلي، مما يؤدي إلى هبوط حاد لاحقاً.',
            '2. فصل المضخة المطول (أكثر من 120 دقيقة) والرياضات التلامسية',
            'التحدي الفسيولوجي: فصل المضخة في الرياضات المائية أو التلامسية (مثل المصارعة أو الرغبي) يوقف إمداد الأنسولين تماماً، مما يرفع خطر الحماض الكيتوني (DKA).',
            'التدخل السريري:',
            '- يجب إيقاف عمل النظام (Suspend) في الإعدادات قبل فصل المضخة، لكي "تدرك الخوارزمية" أنه تم إيقاف ضخ الأنسولين.',
            '- يُوصى بتوجيه المريض لإعادة توصيل المضخة كل ساعة لضخ جرعة صغيرة، تعادل تقريباً 50% من جرعة الأنسولين الأساسي المعتادة (Usual Basal) لتعويض النقص.',
            '- في الرياضات التلامسية، إذا كان التوتر يسبب ارتفاعاً في الجلوكوز، قد لا يكون من المناسب تعيين هدف جلوكوز مرتفع قبل اللعب.',
            '- يمكن التفكير سريرياً في استخدام استراتيجية الحقن المشترك (Un-tethered approach) بإعطاء جرعة أنسولين قاعدي طويل المفعول بالأقلام مع فصل المضخة.',
            '3. التوتر والمنافسات الرياضية (مثل مباريات كرة القدم)',
            'التحدي الفسيولوجي: استجابة هرمونات التوتر (Stress response) تؤدي إلى ارتفاع ملحوظ في الجلوكوز قبل وأثناء المنافسة، يعقبه هبوط متأخر (Delayed Hypoglycemia) بعد انتهاء الحدث.',
            'التدخل السريري:',
            '- يجب مراقبة "الأنسولين المتبقي" (IOB) عن كثب، لأن النظام الآلي سيضخ كميات إضافية استجابةً لارتفاع السكر الناتج عن التوتر.',
            '- يُفضل عدم تعيين هدف جلوكوز مرتفع قبل المنافسة بساعة إلى ساعتين لتجنب بقاء السكر مرتفعاً.',
            '- إذا تجاوز السكر 15.0 مليمول/لتر بسبب التوتر، يمكن للطبيب النصح بإعطاء جرعة تصحيحية يدوية تعادل 50% فقط من الجرعة التصحيحية المعتادة.',
            '4. الرياضات المائية (مثل السباحة والغوص)',
            'التحدي التقني والسريري: التواجد في الماء يقطع اتصال (Bluetooth) بين الحساس (CGM) والمضخة، مما يوقف التشغيل الآلي بالكامل، ويعتبر هبوط السكر هنا خطراً يهدد الحياة.',
            'التدخل السريري:',
            '- يجب تجنب وجود مستويات عالية من "الأنسولين المتبقي" (IOB) قبل النزول للماء.',
            '- بالنسبة لنظام (Omnipod 5)، يُنصح بوضع المضخة (Pod) والحساس بالقرب من بعضهما البعض لزيادة فرصة التقاط إشارة البلوتوث.',
            '- في حالات التواجد المطول جداً في الماء (والذي يرفع خطر الـ DKA)، قد يكون القرار الطبي السليم هو التحول مؤقتاً إلى نظام الحقن المتعدد (MDI) تحت إشراف طبي.',
            '5. البيئات القاسية: الحرارة، البرودة، والمرتفعات',
            'في البيئات شديدة الحرارة: الحرارة تزيد التعرق، مما يزيد سرعة امتصاص الأنسولين بشكل كبير وخطر الهبوط. دقة الـ CGM قد تتأثر أيضاً؛ لذا يُنصح بإجراء فحص بوخز الإصبع، وتقليل جرعات الوجبات ما قبل الرياضة بنسبة 25-33%، وتثبيت الأجهزة بشريط طبي.',
            'في البيئات شديدة البرودة (مثل التزلج): تضيق الأوعية الدموية والارتجاف لتوليد الحرارة يؤثران على الاستجابة الفسيولوجية. الخطر الأكبر هو تجمد الأنسولين في المضخة أو تجمد جل الجلوكوز المستخدم لعلاج الهبوط؛ يجب الاحتفاظ بها قريبة من الجسم، واستخدام "أقراص الجلوكوز الصلبة" كبديل آمن. يجب الانتباه لاحتمال فقدان الإشارة أو توقف الأجهزة حتى تدفأ.',
            'في المرتفعات العالية: نقص الأكسجين يؤثر على قدرة المريض على اتخاذ القرار ودقة أجهزة قياس الجلوكوز بوخز الإصبع. التعرض قصير الأمد للارتفاع يسبب مقاومة مؤقتة للأنسولين بسبب تحفيز الجهاز السمبثاوي، وتتلاشى بعد عدة أيام. أما في الارتفاعات التي تتجاوز 5000 متر، يزداد إفراز الكورتيزول، مما يرفع خطر ارتفاع السكر بشدة.'
          ]
        }
      }
    ]
  }
];
