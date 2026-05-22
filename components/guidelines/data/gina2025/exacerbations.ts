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
        'مرضى المسار الثاني الذين يستخدمون SABA: يأخذ المريض SABA عند اللزوم، ويزيد علاج المداومة المحتوي على ICS لمدة 1-2 أسبوع على الأقل؛ وفي البالغين يمكن التفكير في رفع جرعة ICS إلى 4 أضعاف الجرعة المعتادة لمدة 1-2 أسبوع.',
        'متى يبدأ الكورتيزون بالفم في خطة العمل المنزلية؟ إذا ساءت الأعراض خلال 2-3 أيام رغم زيادة المسكن، أو ساءت سريعاً، أو كان FEV1/PEF أقل من 60%.',
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
        'Mild/moderate exacerbation: start SABA 4-10 puffs by pMDI+spacer every 20 minutes for 3 doses if needed; give prednisolone for moderate exacerbations (adults 40-50 mg, children 1-2 mg/kg up to 40 mg).',
        'Give controlled Oxygen if hypoxemic (Target SpO2 93-95% for adults, 94-98% for children).',
        'Do not use routine antibiotics unless there is clear evidence of bacterial infection (e.g., pneumonia).',
        'Before discharge and follow-up: continue/complete the short OCS course if used (3-5 days for children, 5-7 days for adults), confirm or start ICS-containing controller treatment, reduce reliever to as-needed use, check technique/adherence, provide an action plan, and arrange follow-up within 2-7 days (1-3 working days for children).',
      ],
      ar: [
        'الانتكاسة الشديدة/المهددة للحياة: رتّب التحويل الفوري للرعاية الحادة. أثناء الانتظار أعطِ SABA، وipratropium bromide، وأكسجين، وكورتيزون جهازي.',
        'علاج الانتكاسة الخفيفة/المتوسطة بالعيادة: أعطِ SABA 4-10 بخات عبر pMDI مع spacer كل 20 دقيقة لثلاث جرعات عند الحاجة. أعطِ prednisolone للانتكاسة المتوسطة: 40-50 مجم للبالغين، و1-2 مجم/كجم للأطفال بحد أقصى 40 مجم. اضبط الأكسجين لهدف 93-95% للبالغين و>=94% للأطفال.',
        'إضافات للطوارئ للانتكاسات الشديدة: يجب إضافة Ipratropium bromide للـ SABA. ويمكن التفكير في إعطاء المغنيسيوم الوريدي (Magnesium sulfate 2g IV على مدار 20 دقيقة) للمرضى الذين لم يستجيبوا للعلاج الأولي.',
        'لا تُجرِ أشعة مقطعية/عادية أو غازات بالدم بشكل روتيني، ولا تستخدم مضادات حيوية إلا إذا كان هناك دليل على عدوى بكتيرية مثل الالتهاب الرئوي. تجنب إعطاء المهدئات لاحتمالية تثبيط التنفس.',
        'قبل الخروج والمتابعة: أكمل كورس الكورتيزون بالفم إذا استُخدم، وتأكد أن المريض يستخدم علاجاً يحتوي على ICS، وقلل المسكن ليكون عند اللزوم فقط، وافحص التقنية والالتزام، وأعطِ خطة عمل مكتوبة، وحدد متابعة خلال 2-7 أيام (1-3 أيام عمل للأطفال).',
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
