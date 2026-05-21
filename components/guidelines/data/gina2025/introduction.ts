import type { GuidelineTopic } from '../../guidelinesData';

export const GINA_2025_INTRODUCTION_TOPICS: GuidelineTopic[] = [
  {
    id: 'gina-introduction-facts',
    group: 'ginaIntroduction',
    title: {
      en: 'Introduction & Asthma Facts',
      ar: 'مقدمة وحقائق عن الربو',
    },
    summary: {
      en: 'Global prevalence, goals of the GINA initiative, and fundamental facts about asthma management.',
      ar: 'مدى انتشار الربو عالمياً، أهداف مبادرة GINA، وحقائق أساسية حول إمكانية العلاج والسيطرة عليه.',
    },
    points: {
      en: [
        'Approximately 300 million people globally have asthma. 96% of asthma deaths occur in low/middle-income countries.',
        'Asthma is a common chronic disease causing respiratory symptoms and restricting activity.',
        'Asthma exacerbations can be mild or severe, and severe ones can cause death.',
        'Asthma CAN be treated effectively. Most patients can achieve good long-term control with ICS-containing treatments.',
        'All adults, adolescents, and children 6-11 years should receive treatment that includes ICS to reduce exacerbations and death risk.',
        'Treatment must be personalized based on symptom control, risk factors, phenotype, cost, inhaler technique, and patient preference.',
      ],
      ar: [
        'حوالي 300 مليون شخص عالمياً مصابون بالربو، و96% من الوفيات تحدث في الدول ذات الدخل المنخفض أو المتوسط.',
        'الربو مرض مزمن شائع يسبب أعراضاً تنفسية وقد يقيد نشاط المريض.',
        'انتكاسات الربو قد تكون خفيفة أو شديدة (وقد تسبب الوفاة).',
        'يمكن علاج الربو بفاعلية. معظم المرضى يمكنهم الوصول لسيطرة ممتازة على المدى الطويل باستخدام الكورتيزون المستنشق (ICS).',
        'يجب أن يحصل كل البالغين، والمراهقين، والأطفال فوق 6 سنوات على علاج يحتوي على ICS لتقليل خطر الموت والانتكاسات.',
        'العلاج يُفصّل لكل مريض بناءً على: مدى السيطرة على أعراضه، المخاطر المستقبلية، تكلفة العلاج، وقدرته على استخدام البخاخة بشكل صحيح.',
      ],
    },
    sourceIds: ['gina-2025-intro'],
    tags: ['facts', 'prevalence', 'ICS'],
  }
];