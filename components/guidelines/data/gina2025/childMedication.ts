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
      en: 'How to choose the correct starting step for a child newly diagnosed with asthma. SABA-only treatment is NOT allowed.',
      ar: 'كيفية اختيار درجة العلاج الصحيحة لطفل حديث التشخيص. يمنع تماماً الاعتماد على موسع الشعب فقط.',
    },
    points: {
      en: [
        'Symptoms 1-2 days/week or less: Prescribe Low-dose ICS to be taken whenever SABA is taken (Step 1).',
        'Symptoms 2-5 days/week: Start daily Low-dose ICS maintenance, plus SABA as needed (Step 2).',
        'Symptoms most days or waking ≥1/week: Options are Low/Medium-dose ICS daily OR Very-low-dose ICS-formoterol MART (Step 3).',
        'Daily symptoms, waking at night, low lung function: Start Medium-dose ICS-LABA or Low-dose MART (Step 4).',
        'During acute exacerbation: Treat the exacerbation, then start Step 3 or 4 treatment.',
      ],
      ar: [
        'الأعراض يوم ليومين أسبوعياً (أو أقل): اكتب بخاخة كورتيزون (ICS) بجرعة منخفضة ليأخذها الطفل (في نفس الوقت) كلما استخدم الفينتولين (Step 1).',
        'الأعراض 2-5 أيام أسبوعياً: ابدأ بـ بخاخة ICS يومياً كعلاج وقائي، بالإضافة للفينتولين عند اللزوم (Step 2).',
        'الأعراض في معظم الأيام أو استيقاظ بسبب الربو (مرة أو أكثر أسبوعياً): بخاخة ICS يومياً، أو طريقة MART (بخاخة ICS-formoterol بجرعة منخفضة جداً كوقاية وإسعاف) (Step 3).',
        'أعراض يومية، استيقاظ ليلي متكرر، ضعف وظائف الرئة: اكتب بخاخة ICS-LABA بجرعة متوسطة، أو طريقة MART بجرعة منخفضة (Step 4).',
        'أثناء الانتكاسة الحادة: عالج الانتكاسة أولاً، ثم ابدأ المريض على الدرجة 3 أو 4 مباشرة.',
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
        'Step 3 (Preferred): Daily low/medium-dose ICS-LABA + SABA PRN. OR Very-low-dose ICS-formoterol MART.',
        'Step 4 (Preferred): Daily medium-dose ICS-LABA + SABA PRN. OR Low-dose ICS-formoterol MART.',
        'Step 5: Refer for phenotypic assessment. Options include adding LAMA, Anti-IgE, Anti-IL4Ra, Anti-IL5, or higher dose ICS-LABA.',
      ],
      ar: [
        'الدرجة 1 (المُفضل): بخاخة كورتيزون منخفضة الجرعة في كل مرة يستخدم فيها الفينتولين. أو بخاخة كورتيزون يومية.',
        'الدرجة 2 (المُفضل): بخاخة كورتيزون يومية بجرعة منخفضة + فينتولين عند اللزوم.',
        'الدرجة 3 (المُفضل): بخاخة ICS-LABA يومية بجرعة منخفضة/متوسطة + فينتولين عند اللزوم. (أو طريقة MART بجرعة منخفضة جداً).',
        'الدرجة 4 (المُفضل): بخاخة ICS-LABA يومية بجرعة متوسطة + فينتولين عند اللزوم. (أو طريقة MART بجرعة منخفضة).',
        'الدرجة 5: حوّل الطفل لطبيب متخصص. العلاجات المتاحة تشمل LAMA، الأدوية البيولوجية، أو رفع الجرعة لدرجة عالية.',
      ],
    },
    quickDecision: {
      customBlocks: [
        {
          title: { en: 'SABA Warning in Children', ar: 'تحذير بخصوص الفينتولين للأطفال' },
          content: {
            en: 'Never prescribe SABA alone without ICS for a child with asthma. This is a common error and is dangerous.',
            ar: 'ممنوع كتابة الفينتولين (SABA) كعلاج وحيد للطفل بدون بخاخة كورتيزون وقائية. هذا خطأ شائع وخطير.',
          },
          color: 'red'
        }
      ]
    },
    sourceIds: ['gina-2025-child'],
    tags: ['stepwise', 'children', 'Step 1-5'],
  }
];