import type { GuidelineTopic } from '../../guidelinesData';

export const GINA_2025_EXACERBATIONS_TOPICS: GuidelineTopic[] = [
  {
    id: 'exacerbation-action-plan',
    group: 'ginaExacerbations',
    title: {
      en: 'Written Action Plan (Patient Self-Management)',
      ar: 'خطة العمل المكتوبة (تصرف المريض في المنزل)',
    },
    summary: {
      en: 'How patients should adjust their own medication when symptoms worsen before reaching the hospital.',
      ar: 'كيف يجب أن يعدل المريض جرعاته بنفسه في المنزل بمجرد شعوره ببداية الانتكاسة.',
    },
    points: {
      en: [
        'Track 1 / MART users: Take extra doses of ICS-formoterol reliever whenever needed. Continue the daily maintenance doses as well.',
        'Track 2 (ICS-SABA or SABA users): Take extra reliever doses. Also increase the daily ICS maintenance dose for at least 1-2 weeks (for adults, up to 4x the usual dose).',
        'When to start Oral Corticosteroids (OCS) at home? If symptoms rapidly worsen over 2-3 days despite extra reliever, or PEF < 60%.',
        'Adults home OCS dose: Prednisolone 40-50 mg each morning for 5-7 days.',
        'Children home OCS dose: Prednisolone 1-2 mg/kg (max 40 mg) each morning for 3-5 days.',
      ],
      ar: [
        'مرضى المسار الأول (MART): يأخذ المريض بخات إضافية من الـ ICS-formoterol متى شاء، مع الاستمرار في جرعته اليومية المعتادة.',
        'مرضى المسار الثاني (الفينتولين): يأخذ المريض الفينتولين عند اللزوم، ويجب رفع جرعة الكورتيزون المستنشق اليومية لمدة أسبوعين (في البالغين قد نرفع الجرعة لـ 4 أضعاف).',
        'متى يأخذ المريض كورتيزون بالفم (أقراص) في المنزل؟ إذا تدهورت حالته بسرعة خلال يومين بالرغم من العلاج الإضافي، أو إذا كان قياس (PEF) أقل من 60%.',
        'جرعة الأقراص المنزلية للبالغين: بريدنيزولون 40-50 مجم (صباحاً) لمدة 5 إلى 7 أيام. (يُفضل استخدام أقراص قابلة للذوبان أو شراب إذا كان المريض يعاني من ضيق تنفس شديد).',
        'جرعة الأقراص المنزلية للأطفال: بريدنيزولون 1 إلى 2 مجم لكل كيلو (بحد أقصى 40 مجم يومياً للأطفال <12 سنة) (صباحاً) لمدة 3 إلى 5 أيام.',
        'سحب الكورتيزون: إذا كانت مدة كورس الكورتيزون أقل من أسبوعين، (لا داعي) لسحبه تدريجياً (No tapering)، ويمكن إيقافه فجأة بأمان لتجنب إطالة مدة الكورتيزون بلا داعٍ.',
      ],
    },
    sourceIds: ['gina-2025-exacerbations'],
    tags: ['action plan', 'MART', 'OCS', 'home treatment'],
  },
  {
    id: 'primary-care-exacerbation',
    group: 'ginaExacerbations',
    title: {
      en: 'Managing Exacerbations in Primary Care',
      ar: 'علاج الانتكاسات الحادة في الاستقبال أو العيادة',
    },
    summary: {
      en: 'Initial assessment and treatment of acute asthma attacks in a healthcare setting.',
      ar: 'التقييم والعلاج المبدئي لأزمات الربو الحادة في العيادة أو الاستقبال.',
    },
    points: {
      en: [
        'Assess severity: Check for altered consciousness, inability to speak, cyanosis, silent chest. If present, it is life-threatening (transfer to ER/ICU immediately).',
        'Mild/Moderate Exacerbation: SABA 4-10 puffs by pMDI+spacer every 20 mins for 1 hour. OR start systemic corticosteroids immediately (e.g., Prednisolone 40-50 mg for adults).',
        'Give controlled Oxygen if hypoxemic (Target SpO2 93-95% for adults, 94-98% for children).',
        'Do NOT use routine antibiotics unless there is clear evidence of bacterial infection (e.g., pneumonia).',
        'Follow-up: Discharge with a short course of oral corticosteroids (3-5 days for kids, 5-7 days for adults) AND step up their regular controller treatment (ICS) for 2-4 weeks.',
      ],
      ar: [
        'الانتكاسة الشديدة/المهددة للحياة: اطلب الإسعاف أو حوله للطوارئ فوراً. أثناء الانتظار، أعطه: فينتولين، أتروفينت (Ipratropium bromide)، أكسجين، وكورتيزون جهازي (IV/Oral).',
        'علاج الانتكاسة الخفيفة/المتوسطة بالعيادة: أعطِ المريض 4 إلى 10 بخات فينتولين عبر القمع (Spacer) كل 20 دقيقة (تُكرر 3 مرات في أول ساعة). بعدها 4-10 بخات كل 3-4 ساعات. أعطِ أقراص بريدنيزولون 40-50 مجم. أعطِ أكسجين للوصول لنسبة 93-95% للبالغين و 94-98% للأطفال.',
        'إضافات للطوارئ للانتكاسات الشديدة: يجب إضافة Ipratropium bromide للـ SABA. ويمكن التفكير في إعطاء المغنيسيوم الوريدي (Magnesium sulfate 2g IV على مدار 20 دقيقة) للمرضى الذين لم يستجيبوا للعلاج الأولي.',
        'ممنوعات: (لا) تطلب أشعة مقطعية/عادية أو غازات بالدم بشكل روتيني، (لا) تكتب مضادات حيوية إلا إذا كان هناك دليل على عدوى بكتيرية (مثل التهاب رئوي)، وممنوع إعطاء المهدئات لاحتمالية تثبيط التنفس.',
        'روشتة الخروج (Follow-up): اكتب كورتيزون بالفم لمدة أيام قليلة، والأهم: ارفع جرعة البخاخة الوقائية (ICS) الخاصة به (Step-up) لمدة 2-4 أسابيع لمنع تكرار الأزمة.',
      ],
    },
    quickDecision: {
      warn: {
        en: 'Do not use routine antibiotics for asthma exacerbations.',
        ar: 'المضادات الحيوية ليس لها أي دور روتيني في علاج انتكاسات الربو الحادة.',
      }
    },
    sourceIds: ['gina-2025-exacerbations'],
    tags: ['acute', 'ER', 'primary care', 'oxygen', 'SABA'],
  }
];