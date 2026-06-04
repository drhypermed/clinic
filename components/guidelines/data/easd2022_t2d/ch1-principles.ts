import { GuidelineTopic } from '../../guidelinesData';

export const EASD_2022_CHAPTER_1_TOPICS: GuidelineTopic[] = [
  {
    id: 'easd-ada-2022-ch1-principles',
    group: '1. Principles of Care',
    sourceIds: ['type 2 diabetes'],
    tags: ['Principles', 'Person-centered Care', 'Language', 'SDOH', 'Therapeutic Inertia'],
    title: {
      en: 'Section 1: Principles of Care',
      ar: 'المحور الأول: أسس ومبادئ الرعاية المتمركزة حول المريض'
    },
    summary: {
      en: 'This section represents the cornerstone of a successful treatment plan, requiring a holistic approach that places the patient at the center of care, rather than just prescriptions.',
      ar: 'هذا المحور يمثل حجر الأساس لخطة العلاج الناجحة، حيث يتطلب نهجاً شمولياً يضع المريض في مركز الرعاية ولا يقتصر على الوصفات الطبية.'
    },
    points: {
      en: [
        '**1. Language Matters:**\nCommunication between care providers and the patient must be positive, respectful, and collaborative. Neutral, non-stigmatizing, fact-based language focusing on the patient\'s strengths should be used. For example, **referring to patients as "diabetics" or describing them as "non-compliant" is prohibited**; instead, person-centered language should be used to encourage their engagement in the treatment plan.',
        '**2. Diabetes Self-Management Education and Support (DSMES):**\nSelf-management education and support is a key intervention no less important than choosing medications. These programs should be provided at key points: **at diagnosis, annually, when new complications arise, and during life or healthcare transitions**. Scientific evidence has proven that this education improves glucose levels, clinical and psychological outcomes, and reduces hospitalizations and mortality rates. This education must be tailored to fit the patient\'s individual context, beliefs, and preferences.',
        '**3. Personalised Approach and Shared Decision Making:**\nType 2 diabetes is highly heterogeneous in terms of onset time, associated obesity, insulin resistance, and tendency to develop complications. Therefore, **care must be personalized, respecting individual preferences and meeting the patient\'s needs**. **Shared decision-making is a necessary strategy to select the best treatment pathway**, taking into account individual barriers such as cognitive impairment, limited literacy, health concerns, and cultural beliefs.',
        '**4. Social Determinants of Health (SDOH):**\nThe circumstances surrounding the patient directly affect their medical and psychological outcomes; these are often lifelong risk factors beyond the individual\'s control. These determinants include **financial and social status, living and working conditions, and the cultural and political context**. **The physician must assess and address these determinants to achieve healthcare equity**, ensuring the patient\'s access to care and high-cost medications that protect the heart and kidneys.',
        '**5. Adherence & Therapeutic Inertia:**\nAbout half of patients suffer from non-adherence to their pharmacological treatment plan, leading to uncontrolled blood sugar, increased risk of complications, and higher hospitalization and mortality rates. **Treatment persistence and adherence are affected by several key factors, including belief in medication inefficacy, fear of hypoglycemia, lack of medication availability, or side effects**. On the other hand, "Therapeutic Inertia" is defined as **the failure to intensify therapy when goals are not met, or failure to de-intensify therapy in cases of overtreatment**. To overcome this inertia, which can occur from the physician, patient, or healthcare system, **it is recommended to involve multidisciplinary medical teams (such as pharmacists and specialized nurses) to assist in early pharmacological adjustments and prevent condition deterioration**.'
      ],
      ar: [
        '**1. أهمية التواصل واللغة السريرية (Language Matters):**\n**يجب أن يكون التواصل بين مقدمي الرعاية والمريض إيجابياً ومبنياً على الاحترام والتعاون**. يجب استخدام لغة محايدة وخالية من الوصم وتستند إلى الحقائق، بحيث تركز على نقاط القوة لدى المريض. على سبيل المثال، **يمنع الإشارة للمرضى بكلمة "سكريين" (Diabetics) أو وصفهم بـ "غير الملتزمين"**، بل يجب استخدام لغة تتمحور حول الشخص نفسه لتشجيعه على الانخراط في خطة العلاج.',
        '**2. التثقيف والدعم لإدارة السكري ذاتياً (DSMES):**\n**يُعد التثقيف والدعم الذاتي تدخلاً رئيسياً لا يقل أهمية عن اختيار الأدوية العلاجية**. يجب تقديم هذه البرامج للمريض في محطات أساسية: **عند التشخيص، وسنوياً، وعند ظهور مضاعفات جديدة، وخلال فترات الانتقال في الحياة أو الرعاية الصحية**. أثبتت الأدلة العلمية أن هذا التثقيف يُحسن من مستوى الجلوكوز والنتائج السريرية والنفسية، ويقلل من حالات التنويم في المستشفيات ومعدلات الوفيات. يجب أن يتم تخصيص هذا التثقيف ليتناسب مع سياق المريض ومعتقداته وتفضيلاته الفردية.',
        '**3. النهج المخصص واتخاذ القرار المشترك (Personalised Approach):**\nمرض السكري من النوع الثاني هو مرض شديد التنوع من حيث وقت الظهور، والسمنة المرتبطة به، ومقاومة الإنسولين، والميل لتطوير المضاعفات. لذلك، **يجب أن تكون الرعاية مخصصة وتحترم التفضيلات الفردية وتلبي احتياجات المريض**. يُعد **اتخاذ القرار المشترك استراتيجية ضرورية لاختيار أفضل مسار علاجي**، مع الأخذ في الاعتبار العوائق الفردية مثل الضعف الإدراكي، ومحدودية القراءة والكتابة، والمخاوف الصحية، والمعتقدات الثقافية.',
        '**4. المحددات الاجتماعية للصحة (SDOH):**\nتؤثر الظروف المحيطة بالمريض بشكل مباشر على نتائجه الطبية والنفسية، وهي غالباً عوامل تمثل مخاطر مدى الحياة وتكون خارجة عن إرادة الفرد. تشمل هذه المحددات **الوضع المادي والاجتماعي، وظروف المعيشة والعمل، والسياق الثقافي والسياسي**. **يجب على الطبيب تقييم هذه المحددات ومعالجتها لتحقيق المساواة في الرعاية الصحية**، وضمان وصول المريض للرعاية والأدوية عالية التكلفة التي تحمي القلب والكلى.',
        '**5. الالتزام الدوائي وتجنب القصور العلاجي (Adherence & Therapeutic Inertia):**\nيعاني حوالي نصف المرضى من عدم الالتزام بالخطة العلاجية الدوائية، مما يؤدي إلى عدم السيطرة على السكر، وزيادة خطر المضاعفات، وارتفاع معدلات التنويم والوفيات. **تتأثر استمرارية العلاج وعدم الالتزام بعدة عوامل رئيسية منها الاعتقاد بعدم فعالية الدواء، أو الخوف من هبوط السكر، أو نقص توفر الدواء، أو الآثار الجانبية**. من ناحية أخرى، يُعرف "القصور العلاجي" بأنه **الفشل في تكثيف العلاج عندما لا يتم تحقيق الأهداف، أو الفشل في تقليل العلاج في حالات الإفراط العلاجي**. ولتجاوز هذا القصور الذي قد يحدث من الطبيب أو المريض أو النظام الصحي، **يُنصح بإشراك فرق طبية متعددة التخصصات (مثل الصيادلة والتمريض المتخصص) للمساعدة في التعديل الدوائي المبكر وتجنب تدهور الحالة**.'
      ]
    }
  }
];
