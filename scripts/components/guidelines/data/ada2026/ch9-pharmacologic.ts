import { GuidelineTopic } from '../../guidelinesData';

export const ADA_2026_CHAPTER_9_TOPICS: GuidelineTopic[] = [
  {
    id: 'ada-2026-ch9-t2d-approach',
    group: '9. Pharmacologic Approaches to Glycemic Treatment',
    sourceIds: ['9-pharmacologic-approaches-to-glycemic-treatment-pdf', 'pharmacologic approaches'],
    tags: ['Pharmacotherapy', 'Type 2 Diabetes', 'Algorithm', 'First-line'],
    title: {
      en: 'Pharmacologic Treatment of Type 2 Diabetes',
      ar: 'العلاج الدوائي للسكري من النوع الثاني'
    },
    summary: {
      en: 'The approach to glucose-lowering in T2D is now deeply individualized. First-line therapy depends on comorbidities (ASCVD, HF, CKD), weight management goals, and hypoglycemia risk, moving away from a strict "metformin-first" for everyone.',
      ar: 'أصبح نهج خفض الجلوكوز مخصصاً بشكل عميق لكل مريض. يعتمد العلاج الأول على الأمراض المصاحبة (أمراض القلب، فشل القلب، أمراض الكلى)، وأهداف الوزن، ومخاطر هبوط السكر، مبتعداً عن نهج "الميتفورمين أولاً" للجميع.'
    },
    points: {
      en: [
        'For individuals with ASCVD or high risk for ASCVD, a GLP-1 RA or SGLT2 inhibitor with proven cardiovascular benefit is recommended independent of baseline A1C or metformin use.',
        'For individuals with Heart Failure (HFrEF or HFpEF), an SGLT2 inhibitor is recommended for glycemic management and prevention of HF hospitalizations.',
        'For individuals with CKD, an SGLT2 inhibitor is recommended to reduce CKD progression and cardiovascular events.',
        'If compelling indications are absent, choice of therapy should be guided by efficacy in glucose lowering, weight impact, hypoglycemia risk, and cost.'
      ],
      ar: [
        'للأفراد المصابين بأمراض القلب (ASCVD) أو المعرضين لخطر كبير، يوصى باستخدام منبهات مستقبلات GLP-1 أو مثبطات SGLT2 ذات الفائدة المثبتة للقلب، بغض النظر عن مستوى التراكمي الأولي.',
        'للأفراد المصابين بفشل القلب، يوصى باستخدام مثبطات SGLT2 لإدارة السكر والوقاية من تفاقم الحالة.',
        'للأفراد المصابين بأمراض الكلى المزمنة (CKD)، يوصى بمثبطات SGLT2 لتقليل تطور المرض الكلوي.',
        'في غياب الدواعي القهرية (كأمراض القلب والكلى)، يجب أن يعتمد اختيار العلاج على فعالية خفض السكر، والتأثير على الوزن، ومخاطر الهبوط، والتكلفة.'
      ]
    }
  },
  {
    id: 'ada-2026-ch9-insulin-initiation',
    group: '9. Pharmacologic Approaches to Glycemic Treatment',
    sourceIds: ['9-pharmacologic-approaches-to-glycemic-treatment-pdf', 'pharmacologic approaches'],
    tags: ['Insulin', 'Basal Insulin', 'Intensification'],
    title: {
      en: 'Insulin Initiation and Intensification',
      ar: 'بدء الأنسولين وتكثيفه'
    },
    summary: {
      en: 'When initiating injectable therapy, GLP-1 RAs are preferred over insulin for most patients. If insulin is needed, basal insulin is started first. Over-basalization should be avoided.',
      ar: 'عند بدء العلاج بالحقن، تُفضل منبهات GLP-1 على الأنسولين لمعظم المرضى. وإذا كانت هناك حاجة للأنسولين، يُبدأ بالأنسولين القاعدي (Basal) أولاً مع تجنب الإفراط في الجرعات.'
    },
    points: {
      en: [
        'Consider initiating insulin if there is evidence of ongoing catabolism (weight loss), symptoms of hyperglycemia, or when A1C levels (>10% or blood glucose ≥300 mg/dL) suggest insulin deficiency.',
        'In most adults with T2D requiring injectable therapy, GLP-1 RAs are preferred to insulin.',
        'When basal insulin is added, start at 10 units/day or 0.1–0.2 units/kg/day, and titrate based on fasting glucose.',
        'Avoid "overbasalization", suspected when basal dose >0.5 units/kg/day, high bedtime-morning or post-preprandial glucose differential, or frequent hypoglycemia. If overbasalized, evaluate adding prandial insulin or GLP-1 RA.'
      ],
      ar: [
        'فكر في بدء الأنسولين إذا كان هناك دليل على الهدم (فقدان الوزن)، أو أعراض شديدة لارتفاع السكر، أو إذا كان التراكمي (>10% أو السكر ≥300 مجم/ديسيلتر).',
        'في معظم البالغين الذين يحتاجون لعلاج بالحقن، تُفضل منبهات GLP-1 على الأنسولين.',
        'عند إضافة الأنسولين القاعدي، ابدأ بـ 10 وحدات/يوم أو 0.1-0.2 وحدة/كجم/يوم، واضبط الجرعة بناءً على سكر الصائم.',
        'تجنب "الإفراط في الأنسولين القاعدي" (overbasalization)، ويُشتبه به عندما تكون الجرعة >0.5 وحدة/كجم/يوم، مع تفاوت كبير بين سكر قبل وبعد الوجبات. في هذه الحالة أضف أنسولين الوجبات أو GLP-1.'
      ]
    }
  }
];