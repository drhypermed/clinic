import { GuidelineTopic } from '../../guidelinesData';

export const EASD_2022_CHAPTER_6_TOPICS: GuidelineTopic[] = [
  {
    id: 'easd-ada-2022-ch6-comorbidities',
    group: '6. Tailoring Treatment Based on Comorbidities',
    sourceIds: ['type 2 diabetes'],
    tags: ['Comorbidities', 'Heart Failure', 'CKD', 'ASCVD', 'NAFLD', 'NASH', 'Cognitive Impairment', 'OSA'],
    title: {
      en: 'Section 6: Tailoring Treatment Based on Comorbidities',
      ar: 'المحور السادس: تفصيل العلاج حسب الحالات المصاحبة'
    },
    summary: {
      en: 'A radical shift directing physicians to prescribe specific organ-protecting medications based on comorbidities, independently of the need for glucose lowering.',
      ar: 'تغيير جذري في توجيه الأطباء لوصف أدوية محددة لحماية الأعضاء الحيوية بناءً على الأمراض المصاحبة، بشكل مستقل عن الحاجة لخفض الجلوكوز.'
    },
    points: {
      en: [
        '**1. Heart Failure:**\n- **Mandatory Choice:** SGLT2i with proven efficacy MUST be used for all heart failure patients.\n- **Scope of Efficacy:** Recent trials (e.g., EMPEROR-Reduced, EMPEROR-Preserved, SOLOIST-WHF) proved this drug class reduces hospitalizations and mortality due to heart failure, whether the patient has reduced ejection fraction (HFrEF) or preserved ejection fraction (HFpEF), and independently of the drug\'s effect on glucose.',
        '**2. Chronic Kidney Disease (CKD):**\n- **First Choice:** SGLT2i must be initiated for patients with an eGFR of 20 ml/min or higher and albuminuria (UACR > 30 mg/g), to limit renal decline and reduce cardiovascular events.\n- **Continuation:** Once started, it is recommended to continue the medication even if kidney function declines, only stopping when dialysis or a kidney transplant is needed [63, 84].\n- **Alternative:** If SGLT2i is not tolerated or contraindicated, GLP-1 RA with proven cardiovascular benefits should be considered.',
        '**3. Atherosclerotic Cardiovascular Disease (ASCVD) or High Risk:**\n- **Established CVD:** Patients (e.g., prior stroke, angina, or arterial disease) must be treated with GLP-1 RA or SGLT2i with proven benefit in reducing Major Adverse Cardiovascular Events (MACE).\n- **High-Risk Patients:** People without prior cardiac events but who are 55 or older with two or more risk factors (e.g., obesity, hypertension, smoking, dyslipidemia, or albuminuria). It is also recommended to prescribe GLP-1 RA or SGLT2i to reduce their cardiac risk.',
        '**4. Non-Alcoholic Fatty Liver Disease (NAFLD) / NASH:**\n- Type 2 diabetes patients are at high risk of progression from fatty liver to NASH, fibrosis, and cirrhosis.\n- **Primary Intervention:** Strong focus on weight loss via lifestyle changes or metabolic surgery.\n- **Pharmacotherapy:** Patients at moderate or high risk for liver fibrosis are recommended to take Pioglitazone or GLP-1 RA, as these drugs reduce inflammation activity. Pioglitazone and surgery may even help improve and reduce the fibrosis itself [80, 104]. SGLT2i lower liver enzymes and fat, but current evidence supporting their direct use for NASH is lower compared to others.',
        '**5. Cognitive Impairment:**\n- Diabetes (especially chronic hyperglycemia) is associated with cognitive decline.\n- **Clinical Guidance:** The patient should be screened for cognitive impairment if warning signs appear, such as recurrent hypoglycemia, sudden difficulty in diabetes self-management, or unexplained frequent falls. In such cases, the treatment regimen must be simplified and hypoglycemia-inducing drugs (like insulin and sulfonylureas) should be avoided.',
        '**6. Obstructive Sleep Apnea (OSA):**\n- A common comorbidity in obese diabetic patients. Its severity correlates with poor glucose control, and management must include strong weight loss interventions. Some trials suggest SGLT2i might reduce the occurrence of sleep apnea, though it is unclear if this effect is indirectly due to weight loss.'
      ],
      ar: [
        '**1. مرضى قصور القلب (Heart Failure):**\n- **الخيار الإلزامي:** يجب استخدام أدوية مثبطات ناقل الصوديوم والجلوكوز (SGLT2i) ذات الفعالية المثبتة لجميع مرضى قصور القلب.\n- **نطاق الفعالية:** أثبتت التجارب الحديثة أن هذه العائلة تقلل من معدلات التنويم والوفيات بسبب قصور القلب، سواء مع انخفاض الكفاءة القذفية (HFrEF) أو حتى مع حفظ الكفاءة القذفية (HFpEF)، وبشكل مستقل عن تأثير الدواء على الجلوكوز.',
        '**2. أمراض الكلى المزمنة (Chronic Kidney Disease - CKD):**\n- **الخيار الأول:** يجب البدء بمثبطات (SGLT2i) للمرضى الذين يبلغ (eGFR) لديهم 20 مل/دقيقة فأكثر، مع وجود زلال في البول (UACR > 30)، للحد من التدهور الكلوي.\n- **الاستمرارية:** بمجرد بدء الدواء، يُنصح بالاستمرار عليه حتى وإن تدهورت وظائف الكلى، ولا يُوقف إلا عند الحاجة للغسيل الكلوي أو الزراعة [63، 84].\n- **البديل:** إذا كانت (SGLT2i) ممنوعة، يجب استخدام (GLP-1 RA) التي أثبتت فائدتها لحماية القلب والأوعية الدموية.',
        '**3. أمراض القلب والأوعية الدموية (ASCVD) أو المعرضون لخطورة عالية:**\n- **مرضى السوابق القلبية (Established CVD):** (مثل جلطات سابقة أو ذبحة) يجب علاجهم باستخدام (GLP-1 RA) أو (SGLT2i) لتقليل الأحداث القلبية الكبرى (MACE).\n- **المرضى المعرضون لخطورة عالية:** (العمر 55 عاماً فأكثر مع عاملين أو أكثر من عوامل الخطورة مثل السمنة والضغط). يُنصح أيضاً بوصف (GLP-1 RA) أو (SGLT2i) لتقليل الخطر القلبي لديهم.',
        '**4. مرض الكبد الدهني والتهاب الكبد الدهني غير الكحولي (NAFLD / NASH):**\n- مرضى النوع الثاني معرضون بشكل كبير لخطر تدهور الكبد الدهني إلى (NASH) وتليف.\n- **التدخل الأساسي:** التركيز بقوة على فقدان الوزن عبر تغيير نمط الحياة أو الجراحة.\n- **التدخل الدوائي:** يُنصح بوصف (Pioglitazone) أو (GLP-1 RA) للمرضى ذوي الخطورة المتوسطة أو العالية، حيث تقلل نشاط الالتهاب، وقد يساهم البيوجليتازون في تقليل التليف نفسه [80، 104].',
        '**5. الضعف الإدراكي والتدهور المعرفي (Cognitive Impairment):**\n- يرتبط السكري (وخاصة الارتفاع المزمن) بالتدهور الإدراكي.\n- **التوجيه السريري:** يجب فحص المريض بحثاً عن ضعف إدراكي عند ظهور علامات مثل: التعرض المتكرر لهبوط السكر، أو صعوبة مفاجئة في إدارة السكري ذاتياً، أو كثرة السقوط. يجب تبسيط النظام العلاجي وتجنب الأدوية المسببة للهبوط (كالإنسولين والسلفونيل يوريا).',
        '**6. انقطاع النفس الانسدادي النومي (Obstructive Sleep Apnea):**\nمصاحب شائع للمرضى الذين يعانون من السمنة، وترتبط شدته بضعف السيطرة على الجلوكوز. يجب أن تتضمن الإدارة تدخلاً قوياً لإنقاص الوزن. أظهرت بعض التجارب أن مثبطات (SGLT2i) قد تقلل من حدوثه، رغم عدم وضوح ما إذا كان هذا ناتجاً عن فقدان الوزن.'
      ]
    }
  }
];
