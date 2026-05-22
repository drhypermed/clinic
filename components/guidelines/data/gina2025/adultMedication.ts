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
        'In Track 1 Steps 3-5, the same ICS-formoterol inhaler is used for daily maintenance and as-needed symptom relief (MART approach).',
        'Track 2 (Alternative): The reliever is as-needed SABA or ICS-SABA. Maintenance is a separate daily ICS or ICS-LABA inhaler.',
        'Track 2 should only be used if ICS-formoterol is unavailable or if a stable patient strictly prefers and adheres to their current regimen.',
        'Warning: Before prescribing Track 2 (SABA reliever), you must confirm the patient will adhere to their daily ICS. Poor adherence leaves them on dangerous SABA-only treatment.',
      ],
      ar: [
        'المسار الأول (المُفضل): البخاخة الإسعافية هي جرعة منخفضة من ICS-formoterol كمسكن مضاد للالتهاب (AIR)، وهو يقلل خطر الانتكاسات الشديدة مقارنة باستخدام SABA.',
        'في خطوات 3-5 من المسار الأول، تُستخدم نفس بخاخة ICS-formoterol كعلاج مداومة يومي وكإسعاف عند اللزوم، وهذا هو نظام MART.',
        'المسار الثاني (بديل): المسكن يكون SABA عند اللزوم أو ICS-SABA، مع بخاخة مداومة منفصلة يومية تحتوي على ICS أو ICS-LABA.',
        'لا يُستخدم المسار الثاني إلا إذا لم يتوفر ICS-formoterol، أو إذا كان المريض مستقراً ومفضلاً لنظامه الحالي وملتزماً به جيداً.',
        'تحذير: قبل وصف مسكن SABA في المسار الثاني، تأكد من التزام المريض بالعلاج الوقائي اليومي؛ ضعف الالتزام يتركه عملياً على علاج SABA فقط وهو خطر.',
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
        'Daily symptoms, waking >=1/week, low lung function, or current smoking: Start Step 4. Use Medium-dose ICS-formoterol MART.',
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
        'Step 5: Refer for expert assessment and phenotype review. Options include add-on LAMA, a trial of high-dose maintenance ICS-formoterol, or biologics such as anti-IgE, anti-IL5/5R, anti-IL4Ralpha, or anti-TSLP.',
        'LAMA (e.g., Tiotropium) can be added at Step 5 if asthma remains uncontrolled on ICS-LABA.',
      ],
      ar: [
        'المسار الأول هو المفضل لأن استخدام ICS-formoterol كمسكن يقلل خطر الانتكاسات مقارنة بالاعتماد على مسكن SABA، ويُبسط العلاج ببخاخة واحدة عبر معظم الخطوات.',
        'الدرجة 1 و 2: جرعة منخفضة من ICS-formoterol عند اللزوم فقط. هذا يقلل زيارات الطوارئ/الحجز بنحو الثلثين مقارنة بـ SABA وحده.',
        'الدرجة 3 (MART بجرعة منخفضة): بخة صباحاً ومساءً كوقاية يومية، بالإضافة إلى بخة إضافية عند اللزوم (عند الشعور بضيق التنفس).',
        'الدرجة 4 (MART بجرعة متوسطة): بختين صباحاً ومساءً كوقاية يومية، بالإضافة إلى بخة إضافية عند اللزوم (عند الشعور بضيق التنفس).',
        'الدرجة 5: تحويل لاستشاري للتقييم وإضافة الأدوية البيولوجية أو (LAMA).',
        'الحدود القصوى حسب جدول AIR/MART: budesonide-formoterol 200/6 [160/4.5] بحد أقصى 12 بخة/يوم للبالغين والمراهقين، وbeclometasone-formoterol 100/6 بحد أقصى مقترح 12 بخة/يوم للبالغين عند استخدام MART.',
        'يمكن إضافة LAMA (مثل Tiotropium) في الدرجة الخامسة إذا لم تتم السيطرة على الأعراض رغم استخدام ICS-LABA بجرعات عالية.',
      ],
    },
    sourceIds: ['gina-2025-adult'],
    tags: ['stepwise', 'Step 1', 'Step 5', 'LAMA', 'MART'],
  }
];
