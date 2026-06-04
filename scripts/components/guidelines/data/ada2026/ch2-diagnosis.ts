import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_2_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch2-screening',
    group: '2. Diagnosis and Classification of Diabetes',
    sourceIds: ['2-diagnosis-and-classification-of-diabetes-pdf', 'diagnosis and classification'],
    tags: ['Screening', 'HbA1c', 'FPG', 'OGTT'],
    title: {
      en: 'Screening and Diagnostic Criteria',
      ar: 'معايير الفحص والتشخيص'
    },
    summary: {
      en: 'Diabetes is diagnosed based on A1C criteria or plasma glucose criteria (FPG or 2-h PG during a 75-g OGTT). Screening should begin at age 35 for all people, or earlier for adults with overweight/obesity and one or more risk factors.',
      ar: 'يتم تشخيص السكري بناءً على الفحص التراكمي (A1C) أو معايير جلوكوز البلازما (الصائم أو بعد ساعتين من اختبار تحمل الجلوكوز). يجب أن يبدأ الفحص في سن 35 لجميع الأشخاص، أو قبل ذلك للبالغين الذين يعانون من زيادة الوزن/السمنة ولديهم عامل خطر واحد أو أكثر.'
    },
    points: {
      en: [
        'FPG ≥126 mg/dL (7.0 mmol/L) after at least 8 hours of fasting.',
        '2-h PG ≥200 mg/dL (11.1 mmol/L) during an OGTT.',
        'A1C ≥6.5% (48 mmol/mol) performed in a certified laboratory.',
        'In a patient with classic symptoms of hyperglycemia, a random plasma glucose ≥200 mg/dL (11.1 mmol/L).',
        'In the absence of unequivocal hyperglycemia, diagnosis requires two abnormal test results from the same sample or in two separate test samples.'
      ],
      ar: [
        'سكر الصائم (FPG) ≥ 126 مجم/ديسيلتر بعد صيام 8 ساعات على الأقل.',
        'سكر بعد ساعتين (2-h PG) ≥ 200 مجم/ديسيلتر خلال اختبار تحمل الجلوكوز (OGTT).',
        'السكر التراكمي (A1C) ≥ 6.5% مع إجراء الفحص في مختبر معتمد.',
        'في المريض الذي يعاني من أعراض كلاسيكية لارتفاع السكر، يكون قياس السكر العشوائي ≥ 200 مجم/ديسيلتر.',
        'في غياب ارتفاع السكر الواضح، يتطلب التشخيص نتيجتين غير طبيعيتين من نفس العينة أو في عينتين منفصلتين.'
      ]
    }
  },
  {
    id: 'ada-2026-ch2-prediabetes',
    group: '2. Diagnosis and Classification of Diabetes',
    sourceIds: ['2-diagnosis-and-classification-of-diabetes-pdf', 'diagnosis and classification'],
    tags: ['Prediabetes', 'Risk Assessment'],
    title: {
      en: 'Prediabetes Risk and Evaluation',
      ar: 'تقييم مخاطر مرحلة ما قبل السكري'
    },
    summary: {
      en: 'Prediabetes indicates an increased risk for diabetes and cardiovascular disease. Screening for prediabetes is critical to implement preventive lifestyle modifications and potential pharmacotherapy.',
      ar: 'تشير مرحلة ما قبل السكري إلى زيادة خطر الإصابة بالسكري وأمراض القلب والأوعية الدموية. الفحص لهذه المرحلة ضروري لتطبيق تعديلات وقائية في نمط الحياة وربما العلاج الدوائي.'
    },
    points: {
      en: [
        'Prediabetes is defined as FPG 100–125 mg/dL (5.6–6.9 mmol/L) or 2-h PG 140–199 mg/dL (7.8–11.0 mmol/L) or A1C 5.7–6.4% (39–47 mmol/mol).',
        'Test for prediabetes in adults of any age with overweight or obesity (BMI ≥25 kg/m², or ≥23 kg/m² in Asian Americans) with one or more risk factors.',
        'If tests are normal, repeat screening at a minimum of 3-year intervals.',
        'Women with a history of gestational diabetes should have lifelong screening at least every 3 years.'
      ],
      ar: [
        'تُعرّف مرحلة ما قبل السكري بـ سكر صائم 100-125 مجم/ديسيلتر، أو سكر بعد ساعتين 140-199 مجم/ديسيلتر، أو تراكمي 5.7-6.4%.',
        'افحص البالغين من أي عمر الذين يعانون من زيادة الوزن أو السمنة ولديهم عامل خطر أو أكثر.',
        'إذا كانت النتائج طبيعية، كرر الفحص بحد أدنى كل 3 سنوات.',
        'يجب فحص النساء اللاتي لديهن تاريخ من سكري الحمل مدى الحياة كل 3 سنوات على الأقل.'
      ]
    }
  },
  {
    id: 'ada-2026-ch2-t1d',
    group: '2. Diagnosis and Classification of Diabetes',
    sourceIds: ['2-diagnosis-and-classification-of-diabetes-pdf', 'diagnosis and classification'],
    tags: ['Type 1 Diabetes', 'Autoantibodies', 'Staging'],
    title: {
      en: 'Type 1 Diabetes Staging and Autoantibodies',
      ar: 'مراحل السكري من النوع الأول والأجسام المضادة'
    },
    summary: {
      en: 'Type 1 diabetes is characterized by autoimmune beta-cell destruction. Screening for islet autoantibodies identifies individuals at risk, allowing for staging and potential delay of clinical onset.',
      ar: 'يتميز السكري من النوع الأول بتدمير خلايا بيتا المناعي الذاتي. يحدد فحص الأجسام المضادة الأفراد المعرضين للخطر، مما يسمح بتحديد المراحل وتأخير البداية السريرية للمرض.'
    },
    points: {
      en: [
        'Stage 1: Multiple autoantibodies, normal blood glucose, no symptoms.',
        'Stage 2: Multiple autoantibodies, abnormal blood glucose (dysglycemia), no classic symptoms.',
        'Stage 3: Clinical diagnosis with typical symptoms and hyperglycemia.',
        'Screening for islet autoantibodies is recommended in the setting of a research trial or for first-degree family members of a proband with T1D.'
      ],
      ar: [
        'المرحلة 1: أجسام مضادة متعددة، سكر دم طبيعي، بدون أعراض.',
        'المرحلة 2: أجسام مضادة متعددة، سكر دم غير طبيعي (خلل في الجلوكوز)، بدون أعراض كلاسيكية.',
        'المرحلة 3: تشخيص سريري مع أعراض نموذجية وارتفاع السكر في الدم.',
        'يوصى بفحص الأجسام المضادة في إطار الأبحاث أو لأفراد الأسرة من الدرجة الأولى للمريض.'
      ]
    }
  }
];