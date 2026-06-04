import { GuidelineTopic } from '../../guidelinesData';

export const EASD_2023_CHAPTER_2_TOPICS: GuidelineTopic[] = [
  {
    id: 'easd-2023-ch2-complete',
    group: '2. Diagnosis of type 1 diabetes',
    sourceIds: ['type 1 diabetes'],
    tags: ['Diagnosis', 'Clinical Discriminators', 'Autoantibodies', 'C-peptide', 'Monogenic Diabetes'],
    title: {
      en: 'Section 2: Diagnosis of type 1 diabetes',
      ar: 'القسم 2: تشخيص السكري من النوع الأول'
    },
    summary: {
      en: 'Crucial rules and algorithms for confirming a Type 1 diagnosis and distinguishing it from other types (such as Type 2 or Monogenic), as over 40% of adults diagnosed after age 30 are initially misdiagnosed.',
      ar: 'قواعد وخوارزميات حاسمة لتأكيد التشخيص بالنوع الأول والتفريق بينه وبين الأنواع الأخرى (مثل النوع الثاني أو الجيني)، نظراً لأن أكثر من 40% من البالغين الذين يصابون به بعد سن 30 يُشخصون بالخطأ في البداية.'
    },
    points: {
      en: [
        '**1. Clinical Discriminators Suggesting Type 1:**\nThere is no single clinical sign that confirms the diagnosis on its own, but the presence of the following signs strongly suggests Type 1 Diabetes:\n- Age at diagnosis is less than 35 years.\n- Body Mass Index (BMI) is less than 25.\n- Unexplained weight loss, or the patient presenting with Diabetic Ketoacidosis (DKA).\n- Blood sugar level at diagnosis is higher than 360 mg/dL (20 mmol/L).\n- The rapid need to initiate insulin therapy (within less than 3 years of diagnosis) is considered a strong indicator of Type 1 regardless of age.',
        '**2. Islet Autoantibodies Testing:**\nThis test is the primary first step when Type 1 is suspected, and should be requested in the following order:\n- Start with the GAD test as the first choice.\n- If the GAD test is negative, it is recommended to request IA2 and/or ZNT8 (if available).\n**Important Note:** The report completely advises AGAINST using Islet Cell Autoantibodies (ICA) testing because it is inaccurate and outdated.\n- If the antibody result is positive, this confirms the diagnosis of Type 1 even if the patient does not need insulin at the time of diagnosis.\n- The absence of antibodies (a negative result) does NOT rule out the disease, as 5-10% of those with Type 1 do not have these antibodies.',
        '**3. The Role of C-peptide in Resolving Doubt:**\nExperts do not recommend requesting this test immediately upon diagnosis for most cases; instead, it is used to clarify ambiguity as follows:\n- It is requested after more than 3 years have passed since diagnosis if there is doubt about the type of diabetes.\n- It MUST be measured randomly (non-fasting) simultaneously with a blood sugar measurement, within 5 hours of eating.\n**Interpreting Results:**\n- If C-peptide is higher than 600 pmol/l: this strongly suggests Type 2, and these patients can often stop insulin and rely on other medications.\n- Low levels confirm a Type 1 diagnosis.',
        '**4. Differentiating between Type 1 and Monogenic Diabetes:**\nMany mistakenly diagnose monogenic diabetes as Type 1 due to the patient\'s young age. You should suspect monogenic diabetes and request a genetic test if the following criteria are met:\n- Age at diagnosis is less than 35 years.\n- HbA1c is less than 7.5% at diagnosis.\n- Strong family history (an affected parent).\n**Labs:** Autoantibodies will be negative, while (non-fasting) C-peptide is higher than 200 pmol/l.'
      ],
      ar: [
        '**1. العلامات السريرية المرجحة للنوع الأول (Clinical Discriminators):**\nلا توجد علامة سريرية واحدة تؤكد التشخيص بمفردها، لكن وجود العلامات التالية يرجح بقوة الإصابة بالنوع الأول:\n- العمر عند التشخيص أقل من 35 عاماً.\n- مؤشر كتلة الجسم (BMI) أقل من 25.\n- فقدان غير مبرر في الوزن، أو ظهور المريض بحالة الحماض الكيتوني (DKA).\n- مستوى السكر في الدم عند التشخيص أعلى من 360 مجم/ديسيلتر (20 مليمول/لتر).\n- الاحتياج السريع لبدء العلاج بالإنسولين (خلال أقل من 3 سنوات من التشخيص) يُعد مؤشراً قوياً على النوع الأول بغض النظر عن العمر.',
        '**2. تحليل الأجسام المضادة (Islet Autoantibodies):**\nيُعد هذا الفحص الخطوة الأساسية الأولى عند الشك في النوع الأول، ويجب طلبه وفقاً للترتيب التالي:\n- ابدأ بفحص GAD كخيار أولي.\n- إذا كان فحص GAD سلبياً، يُنصح بطلب IA2 و/أو ZNT8 (إن توفرت).\n**ملاحظة هامة:** التقرير لا يوصي بتاتاً باستخدام تحليل الأجسام المضادة لخلايا جزر البنكرياس (ICA) لكونه غير دقيق وقد تجاوزه الزمن.\n- إذا كانت نتيجة الأجسام المضادة إيجابية، فهذا يؤكد التشخيص بالنوع الأول حتى وإن لم يكن المريض بحاجة للإنسولين وقت التشخيص.\n- غياب الأجسام المضادة (النتيجة السلبية) لا ينفي المرض، حيث أن 5-10% من المصابين بالنوع الأول لا تظهر لديهم هذه الأجسام.',
        '**3. دور تحليل السي ببتيد (C-peptide) في حسم الشك:**\nلا يوصي الخبراء بطلب هذا التحليل فور التشخيص لمعظم الحالات، بل يُستخدم لفك الالتباس كالتالي:\n- يُطلب بعد مرور أكثر من 3 سنوات على التشخيص في حال وجود شك حول نوع السكري.\n- يجب أن يُقاس عشوائياً (بدون صيام) بالتزامن مع قياس سكر الدم، خلال 5 ساعات من تناول الطعام.\n**تفسير النتائج:**\n- إذا كان C-peptide أعلى من 600 pmol/l: هذا يرجح بقوة الإصابة بالنوع الثاني، وغالباً ما يتمكن هؤلاء المرضى من إيقاف الإنسولين والاعتماد على أدوية أخرى.\n- المستويات المنخفضة تؤكد التشخيص بالنوع الأول.',
        '**4. التفريق بين النوع الأول والسكري الجيني (Monogenic Diabetes):**\nيُخطئ الكثيرون في تشخيص السكري الجيني على أنه نوع أول بسبب صغر سن المريض. يجب أن تشك في السكري الجيني وتطلب تحليلاً جينياً للمريض إذا توافرت فيه المواصفات التالية:\n- العمر عند التشخيص أقل من 35 عاماً.\n- السكر التراكمي (HbA1c) أقل من 7.5% عند التشخيص.\n- تاريخ عائلي قوي (إصابة أحد الأبوين).\n**التحاليل:** تكون الأجسام المضادة سلبية، بينما تحليل C-peptide (غير الصائم) أعلى من 200 pmol/l.'
      ]
    }
  }
];
