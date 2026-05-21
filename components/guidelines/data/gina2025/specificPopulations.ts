import type { GuidelineTopic } from '../../guidelinesData';

export const GINA_2025_SPECIFIC_POPULATIONS_TOPICS: GuidelineTopic[] = [
  {
    id: 'specific-populations-rhinitis-obesity',
    group: 'ginaSpecificPopulations',
    title: {
      en: 'Allergic Rhinitis, GERD & Obesity',
      ar: 'حساسية الأنف، ارتجاع المريء، والسمنة',
    },
    summary: {
      en: 'Common comorbidities that complicate asthma management and how to approach them.',
      ar: 'الأمراض المصاحبة الشائعة التي تعقد علاج الربو وكيفية التعامل معها.',
    },
    points: {
      en: [
        'Allergic rhinitis: Very common. Treat with intranasal corticosteroids.',
        'Chronic rhinosinusitis with nasal polyps: Associated with severe asthma. Some biologics (Anti-IgE, IL4Ra, IL5) treat both conditions.',
        'Obesity: Makes asthma difficult to control. Weight loss of even 5-10% significantly improves asthma control.',
        'GERD: Asymptomatic GERD does NOT cause poor asthma control. Only treat symptomatic reflux.',
      ],
      ar: [
        'حساسية الأنف: شائعة جداً ويجب علاجها ببخاخات الكورتيزون للأنف بالتوازي مع علاج الربو.',
        'التهاب الجيوب الأنفية المزمن مع اللحمية (Nasal Polyps): يرتبط بالربو الشديد. بعض الأدوية البيولوجية تعالج المرضين معاً في نفس الوقت.',
        'السمنة: تجعل الربو صعب السيطرة. فقدان المريض لـ 5% إلى 10% فقط من وزنه يُحسن حالته بشكل ملحوظ.',
        'ارتجاع المريء: الارتجاع (الصامت/بدون أعراض) لا يسبب تدهور الربو كما يُشاع. لا تعالج الارتجاع إلا لو كان المريض يشتكي من أعراضه.',
      ],
    },
    sourceIds: ['gina-2025-specific'],
    tags: ['rhinitis', 'obesity', 'GERD', 'comorbidities'],
  },
  {
    id: 'specific-populations-pregnancy',
    group: 'ginaSpecificPopulations',
    title: {
      en: 'Asthma in Pregnancy',
      ar: 'الربو أثناء الحمل',
    },
    summary: {
      en: 'Critical considerations for managing asthma in pregnant women.',
      ar: 'اعتبارات حاسمة لعلاج الربو لدى السيدات الحوامل.',
    },
    points: {
      en: [
        'Asthma control often changes during pregnancy (1/3 improve, 1/3 worsen, 1/3 stay the same).',
        'Uncontrolled asthma puts the baby at high risk of prematurity, low birth weight, and perinatal mortality.',
        'It is safer for pregnant women to take asthma medications than to have asthma exacerbations.',
        'NEVER stop ICS during pregnancy. Review asthma control every 4-6 weeks.',
      ],
      ar: [
        'السيطرة على الربو تتغير غالباً أثناء الحمل (الثلث يتحسن، الثلث يتدهور، الثلث يبقى كما هو).',
        'الربو غير المسيطر عليه يعرض الجنين لخطر الولادة المبكرة، نقص الوزن، أو حتى الوفاة.',
        'تناول أدوية الربو أثناء الحمل (آمن تماماً) وهو أفضل بكثير من ترك الأم تتعرض لانتكاسات ونقص أكسجين.',
        'إياك أن توقف الكورتيزون المستنشق (ICS) أثناء الحمل. راجع حالة الحامل كل 4-6 أسابيع.',
      ],
    },
    quickDecision: {
      warn: {
        en: 'Never step down or stop asthma controller medication (ICS) simply because the patient is pregnant.',
        ar: 'ممنوع تقليل أو إيقاف الأدوية الوقائية للربو لمجرد أن المريضة أصبحت حاملاً.',
      }
    },
    sourceIds: ['gina-2025-specific'],
    tags: ['pregnancy', 'maternal health'],
  }
];