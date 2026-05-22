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
        'الدرجة 1: فينتولين عند اللزوم + بخة كورتيزون (ICS) بجرعة منخفضة (مثل Budesonide 100-200 mcg) في نفس الوقت.',
        'الدرجة 2: بخاخة كورتيزون يومياً بجرعة منخفضة (مثل Budesonide 100-200 mcg) + فينتولين عند اللزوم.',
        'الدرجة 3: بخاخة ICS-LABA يومياً بجرعة منخفضة، أو طريقة MART بجرعة منخفضة جداً (Budesonide-Formoterol 100/6 mcg) بحد أقصى 8 بخات يومياً.',
        'الدرجة 4: بخاخة ICS-LABA يومياً بجرعة متوسطة، أو طريقة MART (Budesonide-Formoterol).',
        'الدرجة 5 (الربو الشديد): يجب التحويل لاستشاري أطفال. يُضاف العلاج البيولوجي (مثل Omalizumab للربو التحسسي ≥6 سنوات، و Mepolizumab ≥6 سنوات أو Dupilumab ≥6 سنوات للربو الإيزينوفيلي الشديد).',
        'المونتيلوكاست (LTRA): يمكن إضافته بجرعة (5 مجم يومياً للأطفال 6-14 سنة)، لكن يجب تحذير الأهل بشدة من احتمالية حدوث أعراض جانبية نفسية وسلوكية وعقلية خطيرة (كوابيس، عنف، أفكار انتحارية).',
        'إضافة (LAMA): يمكن استخدام رذاذ (Tiotropium 2.5 mcg يومياً للأطفال ≥6 سنوات) كإضافة في الدرجة الرابعة.',
        'أمصال الحساسية (SLIT): يمكن استخدامها لحساسية حبوب اللقاح (Ragweed) بشرط أن تكون وظائف الرئة للطفل ممتازة (FEV1 > 80%) لمنع الانتكاسات.',
        'أدوية ممنوعة/غير منصوح بها: كورتيزون الأقراص اليومي هو الملاذ الأخير فقط (بأقل جرعة ممكنة). شراب/أقراص السالبوتامول، أقراص الثيوفيللين، وبخاخات الفينوتيرول لا يُنصح بها إطلاقاً لكثرة أضرارها.',
        'تقليل العلاج (Step-down): لا تبدأ بتقليل الجرعات إلا بعد استقرار حالة الطفل تماماً لمدة 2-3 أشهر متواصلة، وخفض جرعة الكورتيزون بنسبة 25-50% بحذر لعدم حدوث انتكاسات.',
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
        'الدرجة 2 (المُفضل): بخاخة كورتيزون يومية بجرعة منخفضة (مثل Budesonide 100-200 mcg) + فينتولين عند اللزوم.',
        'الدرجة 3 (المُفضل): بخاخة ICS-LABA يومية بجرعة منخفضة/متوسطة + فينتولين عند اللزوم. (أو طريقة MART بجرعة منخفضة جداً بحد أقصى 8 بخات يومياً).',
        'الدرجة 4 (المُفضل): بخاخة ICS-LABA يومية بجرعة متوسطة + فينتولين عند اللزوم. (أو طريقة MART بجرعة منخفضة).',
        'الدرجة 5: حوّل الطفل لطبيب متخصص. العلاجات المتاحة تشمل إضافة LAMA (مثل Tiotropium 2.5 mcg لسن ≥6)، أو الأدوية البيولوجية.',
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