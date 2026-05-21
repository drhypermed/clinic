import type { GuidelineTopic } from '../../guidelinesData';

export const GINA_2025_ADULT_MEDICATION_TOPICS: GuidelineTopic[] = [
  {
    id: 'adult-treatment-tracks',
    group: 'ginaAdultMedication',
    title: {
      en: 'The Two Treatment Tracks (Track 1 & Track 2)',
      ar: 'مسارات العلاج الأساسية (المسار الأول والثاني)',
    },
    summary: {
      en: 'GINA recommends two tracks for asthma management based on the choice of reliever inhaler. Track 1 is the preferred approach.',
      ar: 'توصي GINA بمسارين لعلاج الربو بناءً على نوع البخاخة الإسعافية. المسار الأول هو الأفضل والأكثر أماناً.',
    },
    points: {
      en: [
        'Track 1 (Preferred): The reliever is low-dose ICS-formoterol (Anti-Inflammatory Reliever - AIR). It reduces the risk of severe exacerbations compared to SABA.',
        'In Track 1 Steps 3-5, the same ICS-formoterol inhaler is used for both daily maintenance AND as needed for symptom relief (MART approach).',
        'Track 2 (Alternative): The reliever is as-needed SABA or ICS-SABA. Maintenance is a separate daily ICS or ICS-LABA inhaler.',
        'Track 2 should only be used if ICS-formoterol is unavailable or if a stable patient strictly prefers and adheres to their current regimen.',
        'Warning: Before prescribing Track 2 (SABA reliever), you must confirm the patient will adhere to their daily ICS. Poor adherence leaves them on dangerous SABA-only treatment.',
      ],
      ar: [
        'المسار الأول (المُفضل): البخاخة الإسعافية هي (ICS-formoterol). هذا المسار يقلل خطر الانتكاسات الشديدة مقارنة بالفينتولين.',
        'في الدرجات 3-5 من المسار الأول، يتم استخدام نفس بخاخة (ICS-formoterol) كعلاج وقائي يومي وكعلاج إسعافي عند اللزوم (تُعرف بطريقة MART).',
        'المسار الثاني (البديل): البخاخة الإسعافية هي الفينتولين (SABA). العلاج الوقائي يكون بخاخة كورتيزون يومية منفصلة.',
        'يُستخدم المسار الثاني فقط إذا لم تتوفر بخاخات المسار الأول، أو إذا كان المريض مستقراً ومتمسكاً بعلاجه القديم وملتزماً به جداً.',
        'تحذير: قبل كتابة المسار الثاني (الذي يعتمد على الفينتولين كإسعاف)، يجب أن تتأكد بنسبة 100% أن المريض سيلتزم بالبخاخة الوقائية اليومية، وإلا سيعتمد على الفينتولين فقط وهذا خطر على حياته.',
      ],
    },
    sourceIds: ['gina-2025-adult'],
    tags: ['Track 1', 'Track 2', 'MART', 'AIR'],
  },
  {
    id: 'adult-initial-treatment',
    group: 'ginaAdultMedication',
    title: {
      en: 'Initial Treatment Selection (Adults & Adolescents)',
      ar: 'اختيار العلاج المبدئي (البالغين والمراهقين)',
    },
    summary: {
      en: 'How to choose the correct starting step for a newly diagnosed patient based on their current symptom frequency.',
      ar: 'كيفية اختيار درجة العلاج (Step) الصحيحة لمريض حديث التشخيص بناءً على معدل تكرار الأعراض لديه.',
    },
    points: {
      en: [
        'Infrequent symptoms (≤2 days/week): Start Step 1/2. Use Low-dose ICS-formoterol as needed.',
        'Symptoms < 3-5 days/week (normal lung function): Start Step 1/2. Use Low-dose ICS-formoterol as needed.',
        'Symptoms most days OR waking ≥1/week OR low lung function: Start Step 3. Use Low-dose ICS-formoterol MART (daily + as needed).',
        'Daily symptoms, waking ≥1/week, low lung function: Start Step 4. Use Medium-dose ICS-formoterol MART.',
        'During an acute exacerbation: Treat the exacerbation, then start Step 4 (Medium-dose MART).',
      ],
      ar: [
        'الأعراض نادرة (يوم ليومين أسبوعياً أو أقل): ابدأ (Step 1/2). اكتب بخاخة ICS-formoterol بجرعة منخفضة (عند اللزوم فقط).',
        'الأعراض أقل من 3-5 أيام أسبوعياً (وظائف رئة طبيعية): ابدأ (Step 1/2). اكتب بخاخة ICS-formoterol بجرعة منخفضة (عند اللزوم فقط).',
        'الأعراض في معظم الأيام أو استيقاظ بالليل (مرة أسبوعياً أو أكثر) أو ضعف وظائف الرئة: ابدأ (Step 3). طريقة MART (بخاخة يومياً وعند اللزوم) بجرعة منخفضة.',
        'أعراض يومية، استيقاظ ليلي متكرر، وضعف بوظائف الرئة: ابدأ (Step 4). طريقة MART بجرعة متوسطة (Medium-dose).',
        'أثناء الانتكاسة الحادة: عالج الانتكاسة أولاً، ثم ابدأ المريض على (Step 4) جرعة متوسطة.',
      ],
    },
    sourceIds: ['gina-2025-adult'],
    tags: ['initial treatment', 'steps', 'MART'],
  },
  {
    id: 'adult-stepwise-approach',
    group: 'ginaAdultMedication',
    title: {
      en: 'The Stepwise Approach (Steps 1 to 5)',
      ar: 'العلاج المتدرج للربو (من الدرجة 1 للدرجة 5)',
    },
    summary: {
      en: 'Detailed breakdown of the 5 steps for asthma treatment in adults and adolescents.',
      ar: 'شرح تفصيلي لدرجات علاج الربو الخمسة للبالغين والمراهقين.',
    },
    points: {
      en: [
        'Steps 1 & 2: As-needed low-dose ICS-formoterol. (No daily maintenance inhaler required).',
        'Step 3: Low-dose ICS-formoterol maintenance AND reliever therapy (MART). E.g., 1 inhalation twice daily + extra as needed.',
        'Step 4: Medium-dose ICS-formoterol MART. E.g., 2 inhalations twice daily + extra as needed.',
        'Step 5: Refer for expert assessment. Add-on LAMA, Biologics (Anti-IgE, Anti-IL5, etc.), or consider High-dose ICS-formoterol.',
        'LAMA (e.g., Tiotropium) can be added at Step 5 if asthma remains uncontrolled on ICS-LABA.',
      ],
      ar: [
        'الدرجة 1 و 2: بخاخة ICS-formoterol بجرعة منخفضة عند اللزوم فقط (بدون جرعات وقائية يومية منتظمة).',
        'الدرجة 3: طريقة MART بجرعة منخفضة. (مثلاً بخة صباحاً ومساءً + بخات إضافية عند اللزوم من نفس البخاخة).',
        'الدرجة 4: طريقة MART بجرعة متوسطة. (مثلاً بختين صباحاً ومساءً + بخات إضافية عند اللزوم).',
        'الدرجة 5: حوّل المريض لطبيب متخصص. سيتم إضافة LAMA أو أدوية بيولوجية، أو رفع الجرعة إلى (High-dose ICS-formoterol).',
        'يمكن إضافة LAMA (مثل Tiotropium) في الدرجة الخامسة إذا لم تتم السيطرة على الأعراض رغم استخدام ICS-LABA بجرعات عالية.',
      ],
    },
    sourceIds: ['gina-2025-adult'],
    tags: ['stepwise', 'Step 1', 'Step 5', 'LAMA', 'MART'],
  }
];