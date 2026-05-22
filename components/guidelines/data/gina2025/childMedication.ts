import type { GuidelineTopic } from '../../guidelinesData';

export const GINA_2025_CHILD_MEDICATION_TOPICS: GuidelineTopic[] = [
  {
    id: 'child-initial-treatment',
    group: 'ginaChildMedication',
    title: {
      en: 'Initial Treatment Selection (Children 6-11)',
      ar: 'اختيار العلاج المبدئي (للأطفال 6-11 سنة)',
    },
    summary: {
      en: 'How to choose the correct starting step for a child newly diagnosed with asthma. Children should not be treated with SABA alone.',
      ar: 'كيفية اختيار درجة العلاج الصحيحة لطفل حديث التشخيص. لا ينبغي علاج الأطفال بـ SABA وحده.',
    },
    points: {
      en: [
        'Symptoms 1-2 days/week or less: Prescribe Low-dose ICS to be taken whenever SABA is taken (Step 1).',
        'Symptoms 2-5 days/week: Start daily Low-dose ICS maintenance, plus SABA as needed (Step 2).',
        'Symptoms most days or waking >=1/week: options are low-dose maintenance ICS plus SABA as needed, medium-dose maintenance ICS plus SABA as needed, or very-low-dose ICS-formoterol MART (Step 3).',
        'Daily symptoms, waking at night, low lung function: Start Medium-dose ICS-LABA or Low-dose MART (Step 4).',
        'During acute exacerbation: Treat the exacerbation, then start Step 3 or 4 treatment.',
      ],
      ar: [
        'أعراض نادرة (1-2 يوم/أسبوع أو أقل): جرعة منخفضة من ICS تؤخذ كلما أخذ الطفل SABA للأعراض (الخطوة 1).',
        'أعراض 2-5 أيام/أسبوع: ابدأ جرعة منخفضة يومية من ICS كعلاج مداومة، مع SABA عند اللزوم (الخطوة 2).',
        'أعراض في معظم الأيام أو استيقاظ ليلي مرة أسبوعياً أو أكثر: الخيارات هي ICS منخفض الجرعة يومياً مع SABA، أو ICS متوسط الجرعة يومياً مع SABA، أو MART بجرعة منخفضة جداً من ICS-formoterol (الخطوة 3).',
        'أعراض يومية مع استيقاظ ليلي مرة أسبوعياً أو أكثر ووظائف رئة منخفضة: الخيارات هي ICS-LABA متوسط الجرعة مع SABA عند اللزوم، أو MART بجرعة منخفضة من ICS-formoterol (الخطوة 4).',
        'أثناء الانتكاسة الحادة: عالج الانتكاسة أولاً، ثم ابدأ أحد خيارات الخطوة 3 أو 4 حسب شدة الحالة.',
      ],
    },
    sourceIds: ['gina-2025-child'],
    tags: ['children', 'pediatric asthma', 'initial treatment'],
  },
  {
    id: 'child-stepwise-approach',
    group: 'ginaChildMedication',
    title: {
      en: 'Stepwise Approach (Children 6-11) Steps 1-5',
      ar: 'العلاج المتدرج (للأطفال 6-11 سنة) من 1 لـ 5',
    },
    summary: {
      en: 'Detailed management steps for children aged 6-11.',
      ar: 'تفاصيل درجات العلاج الخمسة للأطفال من عمر 6 إلى 11 سنة.',
    },
    points: {
      en: [
        'Step 1 (Preferred): Low-dose ICS taken whenever SABA is taken. Or Daily low-dose ICS.',
        'Step 2 (Preferred): Daily low-dose ICS + SABA as needed.',
        'Step 3 (Preferred): Low-dose ICS-LABA OR medium-dose ICS OR very-low-dose ICS-formoterol MART.',
        'Step 4 (Preferred): Medium-dose ICS-LABA OR low-dose ICS-formoterol MART OR refer for expert advice.',
        'Step 5: Refer for phenotypic assessment. Options include higher-dose ICS-LABA or add-on therapy such as LAMA, anti-IgE, anti-IL4Ralpha, or anti-IL5.',
      ],
      ar: [
        'الدرجة 1 (المُفضل): جرعة منخفضة من ICS تؤخذ كلما استُخدم SABA. أو جرعة منخفضة يومية من ICS.',
        'الدرجة 2 (المُفضل): جرعة منخفضة يومية من ICS مع SABA عند اللزوم.',
        'الدرجة 3 (المُفضل): ICS-LABA بجرعة منخفضة، أو ICS بجرعة متوسطة، أو MART بجرعة منخفضة جداً من ICS-formoterol.',
        'الدرجة 4 (المُفضل): ICS-LABA بجرعة متوسطة، أو MART بجرعة منخفضة من ICS-formoterol، أو التحويل لاستشارة متخصصة.',
        'الدرجة 5: حوّل الطفل لتقييم النمط الظاهري. الخيارات قد تشمل جرعة أعلى من ICS-LABA أو علاجات إضافية مثل LAMA أو anti-IgE أو anti-IL4Ralpha أو anti-IL5.',
      ],
    },
    quickDecision: {
      customBlocks: [
        {
          title: { en: 'SABA Warning in Children', ar: 'تحذير بخصوص SABA للأطفال' },
          content: {
            en: 'Children aged 6-11 years with asthma should not be treated with SABA alone; they should receive ICS-containing treatment.',
            ar: 'الأطفال 6-11 سنة المصابون بالربو لا ينبغي علاجهم بـ SABA وحده؛ يجب أن يتلقوا علاجاً يحتوي على ICS.',
          },
          color: 'red'
        }
      ]
    },
    sourceIds: ['gina-2025-child'],
    tags: ['stepwise', 'children', 'Step 1-5'],
  }
];
