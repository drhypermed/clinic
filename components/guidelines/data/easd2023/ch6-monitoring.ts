import { GuidelineTopic } from '../../guidelinesData';

export const EASD_2023_CHAPTER_6_TOPICS: GuidelineTopic[] = [
  {
    id: 'easd-2023-ch6-complete',
    group: '6. Monitoring of glucose levels',
    sourceIds: ['type 1 diabetes'],
    tags: ['Monitoring', 'HbA1c', 'CGM', 'BGM', 'Ketone Measurement'],
    title: {
      en: 'Section 6: Monitoring of glucose levels',
      ar: 'القسم 6: مراقبة مستويات الجلوكوز'
    },
    summary: {
      en: 'Guidelines on the importance of periodic glucose assessment, focusing on the transition to Continuous Glucose Monitoring (CGM) as the gold standard, alongside the importance of traditional BGM and ketone measurement.',
      ar: 'إرشادات حول أهمية التقييم الدوري لمستويات السكر، مع التركيز على التطور نحو حساسات المراقبة المستمرة (CGM) كمعيار ذهبي، بجانب أهمية الفحص التقليدي وقياس الكيتونات.'
    },
    points: {
      en: [
        '**1. HbA1c.. Importance and Limitations:**\n- Although historically linked to assessing complication risk, it **does not reflect Glycemic Variability or hypoglycemic episodes**.\n- HbA1c should not be the "sole" method for assessing the patient.\n- **Clinic Precaution:** HbA1c is affected and can be misleading (giving inaccurate readings) in conditions such as pregnancy (in the second and third trimesters), advanced kidney disease, liver disease, and anemia or hemoglobinopathies.',
        '**2. Continuous Glucose Monitoring (CGM).. The New Gold Standard:**\n- These sensors are now considered the primary standard for most adults with Type 1 Diabetes.\n- Thanks to their advancement, most current sensors do not require a fingerstick blood glucose check to confirm the reading before making a treatment decision (taking insulin), unless their accuracy is in doubt.\n- **Clinic Reports:** The physician must regularly review standardized reports (like the AGP report) and train the patient to monitor them.\n- These devices significantly reduce HbA1c and lower hypoglycemic episodes, and they are extremely useful for older adults and patients experiencing Impaired Awareness of Hypoglycemia (IAH).\n- **Skin Issues:** Patients should be warned about the possibility of contact dermatitis (allergies) from sensor adhesives. In severe cases, Implanted Sensors can be considered as an alternative.',
        '**3. Traditional Blood Glucose Monitoring (BGM):**\n- Despite the superiority of sensors, every patient must have a fingerstick glucose meter and consider it a "backup plan".\n- When should it be used? During emergencies, before driving, before and after exercising, and if the patient feels hypoglycemia symptoms that do not match the sensor\'s reading.\n- **Psychological Burden:** As a physician, you must realize that frequently seeing high or low daily readings via fingersticks can cause the patient frustration, anxiety, and guilt, often leading them to evade measuring.',
        '**4. Ketone Measurement:**\n- Measurement is highly necessary during sick days or when blood sugar is high to prevent Diabetic Ketoacidosis (DKA).\n- **Important Clinical Recommendation:** It is always preferable to measure ketones in **blood** rather than urine. Blood strips measure beta-hydroxybutyrate (which is the most accurate), while urine strips can continue to give false positive results for up to 48 hours after the patient recovers from acidosis, which can confuse clinical assessment. Therefore, blood ketone meters should be provided to all adults with Type 1 Diabetes (where available).'
      ],
      ar: [
        '**1. السكر التراكمي (HbA1c).. أهميته ومحدوديته:**\n- رغم أن التراكمي ارتبط تاريخياً بتقييم خطر المضاعفات، إلا أنه **لا يعكس التذبذب في قراءات السكر (Glycemic Variability) أو نوبات الهبوط**.\n- لا يجب أن يكون التراكمي هو الوسيلة "الوحيدة" لتقييم المريض.\n- **احذر في العيادة:** يتأثر التراكمي ويكون خادعاً (يعطي قراءات غير دقيقة) في حالات مثل الحمل (في الثلثين الثاني والثالث)، أمراض الكلى المتقدمة، أمراض الكبد، والأنيميا وتغيرات الهيموجلوبين.',
        '**2. أجهزة المراقبة المستمرة (CGM).. المعيار الذهبي الجديد:**\n- تعتبر هذه الحساسات الآن هي المعيار الأساسي لمعظم البالغين المصابين بالنوع الأول.\n- بفضل تطورها، أصبحت معظم الحساسات الحالية لا تتطلب إجراء فحص بوخز الأصابع لتأكيد القراءة قبل اتخاذ قرار علاجي (أخذ الإنسولين)، إلا إذا كان هناك شك في دقتها.\n- **تقارير العيادة:** يجب على الطبيب مراجعة التقارير الموحدة (مثل تقرير AGP) بانتظام وتدريب المريض على متابعتها.\n- تقلل هذه الأجهزة بشكل كبير من التراكمي وتقلل نوبات الهبوط، وهي مفيدة جداً للمرضى الذين يعانون من فقدان الشعور بالهبوط (IAH) وكبار السن.\n- **مشاكل جلدية:** يجب تحذير المرضى من احتمالية حدوث التهاب جلدي تماسي (حساسية) منواصق الحساسات. وفي بعض الحالات الشديدة، يمكن اللجوء للحساسات المزروعة تحت الجلد (Implanted Sensors) كحل بديل.',
        '**3. القياس التقليدي بوخز الأصابع (BGM):**\n- رغم تفوق الحساسات، يجب أن يمتلك كل مريض جهاز قياس بوخز الأصابع وأن يعتبره كـ "خطة بديلة".\n- متى يجب استخدامه؟ في حالات الطوارئ، قبل القيادة، قبل وبعد ممارسة الرياضة، وإذا كان المريض يشعر بأعراض هبوط لا تتطابق مع قراءة الحساس.\n- **العبء النفسي:** يجب أن تدرك كطبيب أن كثرة رؤية المريض لقراءات مرتفعة أو منخفضة يومياً عبر الوخز قد تسبب له الإحباط، القلق، والشعور بالذنب، مما يؤدي غالباً إلى تهربه من القياس.',
        '**4. قياس الكيتونات (Ketone Measurement):**\n- القياس ضروري جداً أثناء أيام المرض الجسدي أو عند ارتفاع السكر للوقاية من الحماض الكيتوني السكري (DKA).\n- **توصية سريرية هامة:** يُفضل دائماً قياس الكيتونات في **الدم** وليس البول. شرائط الدم تقيس حمض بيتا-هيدروكسي بيوتيريت (وهو الأدق)، بينما شرائط البول قد تستمر في إعطاء نتائج إيجابية كاذبة لمدة تصل إلى 48 ساعة بعد تعافي المريض من الحموضة، مما قد يربك التقييم السريري. ولذلك، يجب توفير أجهزة فحص الكيتونات في الدم لجميع البالغين المصابين بالنوع الأول (حيثما توفرت).'
      ]
    }
  }
];
