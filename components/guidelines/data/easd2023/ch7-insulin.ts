import { GuidelineTopic } from '../../guidelinesData';

export const EASD_2023_CHAPTER_7_TOPICS: GuidelineTopic[] = [
  {
    id: 'easd-2023-ch7-complete',
    group: '7. Insulin therapy',
    sourceIds: ['type 1 diabetes'],
    tags: ['Insulin Therapy', 'Pumps', 'Injection Techniques', 'Adverse Effects'],
    title: {
      en: 'Section 7: Insulin therapy',
      ar: 'القسم 7: العلاج بالإنسولين'
    },
    summary: {
      en: 'Clinical guidelines for selecting insulin regimens and delivery technologies that mimic the natural pancreas, with a focus on advanced pumps and managing side effects.',
      ar: 'توجيهات سريرية لاختيار أنظمة وتقنيات توصيل الإنسولين التي تحاكي البنكرياس الطبيعي، مع التركيز على المضخات المتقدمة وإدارة الآثار الجانبية.'
    },
    points: {
      en: [
        '**1. Choice of regimen:**\n- **The Golden Rule:** Treatment should mimic physiological insulin secretion, achieved through Multiple Daily Injections (MDI) (basal insulin + meal/correction insulin) or via insulin pumps.\n- **Insulin Analogues are the First Choice:** It is always preferable to use insulin analogues (both basal and rapid-acting) instead of human insulin (NPH and Regular). Studies have proven that modern analogues significantly reduce hypoglycemic episodes and provide better meal coverage.',
        '**2. Mode of Delivery:**\n- **Hybrid Closed-Loop Systems:** Currently considered the most effective method for maintaining blood sugar within the target range and reducing hypoglycemic episodes. These systems automatically adjust basal insulin (and some deliver correction doses) based on CGM readings, while the patient inputs meal doses.\n- **DIY Open-Source Systems:** Some patients use non-officially approved algorithms to link their pumps with sensors. The report advises physicians that although they cannot medically prescribe these systems, they must respect the patient\'s informed choice and continue to provide medical support in the clinic.',
        '**3. Injection Techniques and Physical Exam in the Clinic:**\n- **Needle Length:** Contrary to the common belief that obese patients need long needles, very short needles (4 mm) injected at a 90-degree angle reach the subcutaneous tissue highly efficiently and almost painlessly, reducing the risk of accidental intramuscular injection.\n- **Lipohypertrophy:** A very common problem caused by repeated injections in the same site, leading to significant and unexplained glucose variability. As a physician, you must palpate injection sites **at least annually** and educate the patient on the necessity of regularly rotating injection sites.\n- **Skin Allergies:** Patients should be warned about potential skin inflammation or allergies caused by pump adhesives.',
        '**4. Adverse Effects & Alternatives:**\n- **Hypoglycemia and Weight Gain:** These are the primary barriers to successful treatment. You must address any patient concerns regarding weight gain in your clinic, as some patients (especially young women) may intentionally reduce or stop insulin to avoid obesity.\n- **Inhaled Insulin:** Available in the US as a rapid-acting alternative for meals, notable for its speed of action, but its short duration may not cover delayed blood sugar spikes, and it requires periodic lung function testing because it may cause coughing.\n- **Peritoneal Delivery:** Available in some European countries via implanted pumps. It excellently reduces A1c and hypoglycemia because it goes directly to the liver (like natural insulin), but it carries risks of catheter blockage and the formation of anti-insulin antibodies.'
      ],
      ar: [
        '**1. اختيار نظام الإنسولين (Choice of regimen):**\n- **القاعدة الذهبية:** يجب أن يحاكي العلاج إفراز الإنسولين الفسيولوجي، وهذا يتحقق عبر الحقن اليومية المتعددة (MDI) (إنسولين قاعدي + إنسولين الوجبات/التصحيح) أو عبر مضخات الإنسولين.\n- **نظائر الإنسولين (Analogues) هي الخيار الأول:** يُفضل دائماً استخدام نظائر الإنسولين (سواء القاعدية أو سريعة المفعول) بدلاً من الإنسولين البشري (NPH و Regular). أثبتت الدراسات أن النظائر الحديثة تقلل بشكل ملحوظ من نوبات هبوط السكر وتحقق تغطية أفضل لوجبات الطعام.',
        '**2. تكنولوجيا التوصيل والمضخات (Mode of delivery):**\n- **المضخات ذات الحلقة المغلقة الهجينة (Hybrid closed-loop systems):** تعتبر حالياً الوسيلة الأكثر فعالية للحفاظ على السكر في النطاق الطبيعي وتقليل نوبات الهبوط. تقوم هذه الأنظمة بضبط الإنسولين القاعدي (وبعضها يعطي جرعات تصحيحية) تلقائياً بناءً على قراءات الحساس (CGM)، بينما يقوم المريض بإدخال جرعات الوجبات.\n- **أنظمة "اصنعها بنفسك" (DIY open-source systems):** بعض المرضى يستخدمون خوارزميات غير معتمدة رسمياً لربط مضخاتهم بحساساتهم. يوجه التقرير الأطباء بأنه رغم عدم قدرتهم على وصف هذه الأنظمة طبياً، يجب عليهم احترام اختيار المريض المدعوم بالمعرفة، والاستمرار في تقديم الدعم الطبي له في العيادة.',
        '**3. تقنيات الحقن والفحص البدني في العيادة:**\n- **طول الإبرة:** على عكس الاعتقاد الشائع بأن مرضى السمنة يحتاجون إبراً طويلة، فإن الإبر القصيرة جداً (4 مم) التي تُحقن بزاوية 90 درجة تصل لطبقة ما تحت الجلد بكفاءة عالية وبدون ألم تقريباً، وتقلل من خطر الحقن العضلي الخاطئ.\n- **التضخم الدهني (Lipohypertrophy):** مشكلة شائعة جداً تحدث بسبب الحقن المتكرر في نفس المكان، وتؤدي إلى تذبذب كبير وغير مبرر في السكر. يجب عليك كطبيب فحص وتحسس أماكن الحقن **سنوياً على الأقل** وتوعية المريض بضرورة تغيير أماكن الحقن بانتظام.\n- **حساسية الجلد:** يجب تحذير المرضى من احتمالية حدوث التهابات أو حساسية جلدية بسبب لواصق المضخات.',
        '**4. الآثار الجانبية والبدائل (Adverse effects & Alternatives):**\n- **هبوط السكر وزيادة الوزن:** هما العائقان الأساسيان لنجاح العلاج. يجب أن تراجع في عيادتك أي مخاوف لدى المريض بشأن زيادة الوزن، لأن بعض المرضى (وخاصة الشابات) قد يتعمدون تقليل أو إيقاف الإنسولين لتجنب السمنة.\n- **الإنسولين المستنشق (Inhaled insulin):** متوفر في الولايات المتحدة كبديل سريع المفعول لوجبات الطعام، ويمتاز بسرعة عمله، لكن مفعوله القصير قد لا يغطي الارتفاع المتأخر للسكر، ويتطلب فحصاً دورياً لوظائف الرئة لأنه قد يسبب السعال.\n- **الحقن البريتوني (Peritoneal delivery):** متوفر في بعض الدول الأوروبية عبر مضخات مزروعة، ويقلل التراكمي والهبوط بشكل ممتاز لأنه يذهب للكبد مباشرة (مثل الإنسولين الطبيعي)، لكنه يحمل مخاطر انسداد القسطرة وتكوين أجسام مضادة للإنسولين.'
      ]
    }
  }
];
