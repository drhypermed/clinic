export type GuidelineLanguage = 'ar' | 'en';

export type LocalizedText = Record<GuidelineLanguage, string>;

export type GuidelineSource = {
  id: string;
  title: string;
  citation: string;
  url: string;
  localFile?: string;
};

export type GuidelineSourceRecommendation = {
  id: string;
  grade: string;
  page: number;
  text: string;
};

export type GuidelineSourceTableFigure = {
  kind: string;
  id: string;
  page: number;
  caption: string;
  imageSrc?: string;
  title?: string;
};

export type GuidelineSourceTableExtract = {
  page: number;
  relatedItems: string[];
  rows: string[];
};

export type GuidelineSourceDigest = {
  sourceId: string;
  title: string;
  sourcePdf: string;
  recommendations: GuidelineSourceRecommendation[];
  tablesAndFigures: GuidelineSourceTableFigure[];
  tableTextRows?: GuidelineSourceTableExtract[];
};

export type GuidelineQuickDecisionBlock = {
  title: LocalizedText;
  content: LocalizedText;
  color?: 'amber' | 'emerald' | 'blue' | 'red' | 'purple' | 'slate';
};

export type GuidelineQuickDecision = {
  when?: LocalizedText;
  start?: LocalizedText;
  followUp?: LocalizedText;
  warn?: LocalizedText;
  customBlocks?: GuidelineQuickDecisionBlock[];
};

export type GuidelineDetailBlock = {
  title: LocalizedText;
  items: Record<GuidelineLanguage, string[]>;
};

export type GuidelineVisualAsset = {
  title: LocalizedText;
  label: string;
  imageSrc: string;
  sourceId: string;
  page: number;
  takeaways?: Record<GuidelineLanguage, string[]>;
};

export type GuidelineTopic = {
  id: string;
  group:
    | 'populationCare'
    | 'diagnosisClassification'
    | 'preventionEvaluation'
    | 'behaviorsGoalsTech'
    | 'weightPharmacology'
    | 'complicationsRisk'
    | 'specialPopulations'
    | 'ginaIntroduction'
    | 'ginaGeneralPrinciples'
    | 'ginaAdultMedication'
    | 'ginaChildMedication'
    | 'ginaSpecificPopulations'
    | 'ginaExacerbations'
    | 'ginaReferenceTables'
    | 'ginaDiagnosis'
    | 'ginaAssessment';
  title: LocalizedText;
  summary: LocalizedText;
  points: Record<GuidelineLanguage, string[]>;
  details?: GuidelineDetailBlock[];
  quickDecision?: GuidelineQuickDecision;
  practiceNote?: LocalizedText;
  visuals?: GuidelineVisualAsset[];

  sourceIds: string[];
  tags: string[];
};

export type GuidelineCollection = {
  id: string;
  school: string;
  year: number;
  title: LocalizedText;
  subtitle: LocalizedText;
  sourceDate: string;
  sources: GuidelineSource[];
};

export type GuidelineCollectionData = {
  topics: GuidelineTopic[];
  recommendationDigest?: GuidelineSourceDigest[];
};

import { ADA_2025_REMAINING_SOURCES } from './data/ada2025/sources';
import { ADA_2026_REMAINING_SOURCES } from './data/ada2026/sources';
import { GINA_2025_SOURCES } from './data/gina2025/sources';

export const loadGuidelineCollectionData = async (id: string): Promise<GuidelineCollectionData | null> => {
  if (id === 'ada-2026') {
    const [
      { ADA_2026_IMPROVING_CARE_TOPICS },
      { ADA_2026_DIAGNOSIS_TOPICS },
      { ADA_2026_PREVENTION_EVALUATION_TOPICS },
      { ADA_2026_BEHAVIORS_GOALS_TECH_TOPICS },
      { ADA_2026_WEIGHT_PHARMACOLOGY_TOPICS },
      { ADA_2026_COMPLICATIONS_TOPICS },
      { ADA_2026_SPECIAL_SITUATIONS_TOPICS },
      { ADA_2026_CLINICAL_ESSENTIALS_TOPICS, ADA_2026_TOPIC_VISUALS },
      { ADA_2026_RECOMMENDATION_DIGEST },
    ] = await Promise.all([
      import('./data/ada2026/improvingCare'),
      import('./data/ada2026/diagnosisClassification'),
      import('./data/ada2026/preventionEvaluation'),
      import('./data/ada2026/behaviorsGoalsTechnology'),
      import('./data/ada2026/weightPharmacology'),
      import('./data/ada2026/complications'),
      import('./data/ada2026/specialSituations'),
      import('./data/ada2026/clinicalEssentials'),
      import('./data/ada2026/recommendationDigest'),
    ]);
    const topics = [
        ...ADA_2026_CLINICAL_ESSENTIALS_TOPICS,
        ...ADA_2026_IMPROVING_CARE_TOPICS,
        ...ADA_2026_DIAGNOSIS_TOPICS,
        ...ADA_2026_PREVENTION_EVALUATION_TOPICS,
        ...ADA_2026_BEHAVIORS_GOALS_TECH_TOPICS,
        ...ADA_2026_WEIGHT_PHARMACOLOGY_TOPICS,
        ...ADA_2026_COMPLICATIONS_TOPICS,
        ...ADA_2026_SPECIAL_SITUATIONS_TOPICS,
      ].map((topic) => {
        const visuals = ADA_2026_TOPIC_VISUALS[topic.id];
        return visuals ? { ...topic, visuals: [...(topic.visuals ?? []), ...visuals] } : topic;
      });
    return {
      topics,
      recommendationDigest: ADA_2026_RECOMMENDATION_DIGEST,
    };
  }
  if (id === 'ada-2025') {
    const [
      { ADA_2025_IMPROVING_CARE_TOPICS },
      { ADA_2025_DIAGNOSIS_TOPICS },
      { ADA_2025_PREVENTION_EVALUATION_TOPICS },
      { ADA_2025_BEHAVIORS_GOALS_TECH_TOPICS },
      { ADA_2025_WEIGHT_PHARMACOLOGY_TOPICS },
      { ADA_2025_COMPLICATIONS_TOPICS },
      { ADA_2025_SPECIAL_SITUATIONS_TOPICS },
      { ADA_2025_CLINICAL_ESSENTIALS_TOPICS },
      { ADA_2025_TOPIC_VISUALS },
      { ADA_2025_RECOMMENDATION_DIGEST },
    ] = await Promise.all([
      import('./data/ada2025/improvingCare'),
      import('./data/ada2025/diagnosisClassification'),
      import('./data/ada2025/preventionEvaluation'),
      import('./data/ada2025/behaviorsGoalsTechnology'),
      import('./data/ada2025/weightPharmacology'),
      import('./data/ada2025/complications'),
      import('./data/ada2025/specialSituations'),
      import('./data/ada2025/clinicalEssentials'),
      import('./data/ada2025/topicVisuals'),
      import('./data/ada2025/recommendationDigest'),
    ]);
    const topics = [
      ...ADA_2025_CLINICAL_ESSENTIALS_TOPICS,
      ...ADA_2025_IMPROVING_CARE_TOPICS,
      ...ADA_2025_DIAGNOSIS_TOPICS,
      ...ADA_2025_PREVENTION_EVALUATION_TOPICS,
      ...ADA_2025_BEHAVIORS_GOALS_TECH_TOPICS,
      ...ADA_2025_WEIGHT_PHARMACOLOGY_TOPICS,
      ...ADA_2025_COMPLICATIONS_TOPICS,
      ...ADA_2025_SPECIAL_SITUATIONS_TOPICS,
    ].map((topic) => {
      const visuals = ADA_2025_TOPIC_VISUALS[topic.id];
      return visuals ? { ...topic, visuals: [...(topic.visuals ?? []), ...visuals] } : topic;
    });
    return {
      topics,
      recommendationDigest: ADA_2025_RECOMMENDATION_DIGEST,
    };
  }

  if (id === 'gina-2025') {
    const [
      { GINA_2025_INTRODUCTION_TOPICS },
      { GINA_2025_DIAGNOSIS_TOPICS },
      { GINA_2025_ASSESSMENT_TOPICS },
      { GINA_2025_GENERAL_PRINCIPLES_TOPICS },
      { GINA_2025_ADULT_MEDICATION_TOPICS },
      { GINA_2025_CHILD_MEDICATION_TOPICS },
      { GINA_2025_SPECIFIC_POPULATIONS_TOPICS },
      { GINA_2025_EXACERBATIONS_TOPICS },
      { GINA_2025_REFERENCE_TABLES_TOPICS },
      { GINA_2025_CLINICAL_ESSENTIALS_TOPICS },
      { GINA_2025_RECOMMENDATION_DIGEST },
    ] = await Promise.all([
      import('./data/gina2025/introduction'),
      import('./data/gina2025/diagnosingAsthma'),
      import('./data/gina2025/assessingAsthma'),
      import('./data/gina2025/generalPrinciples'),
      import('./data/gina2025/adultMedication'),
      import('./data/gina2025/childMedication'),
      import('./data/gina2025/specificPopulations'),
      import('./data/gina2025/exacerbations'),
      import('./data/gina2025/referenceTables'),
      import('./data/gina2025/clinicalEssentials'),
      import('./data/gina2025/recommendationDigest'),
    ]);
    return {
      topics: [
        ...GINA_2025_INTRODUCTION_TOPICS,
        ...GINA_2025_DIAGNOSIS_TOPICS,
        ...GINA_2025_ASSESSMENT_TOPICS,
        ...GINA_2025_GENERAL_PRINCIPLES_TOPICS,
        ...GINA_2025_ADULT_MEDICATION_TOPICS,
        ...GINA_2025_CHILD_MEDICATION_TOPICS,
        ...GINA_2025_SPECIFIC_POPULATIONS_TOPICS,
        ...GINA_2025_EXACERBATIONS_TOPICS,
        ...GINA_2025_REFERENCE_TABLES_TOPICS,
        ...GINA_2025_CLINICAL_ESSENTIALS_TOPICS,
      ],
      recommendationDigest: GINA_2025_RECOMMENDATION_DIGEST,
    };
  }
  return null;
};

export const GUIDELINE_COLLECTIONS: GuidelineCollection[] = [
  {
    id: 'ada-2026',
    school: 'ADA',
    year: 2026,
    sourceDate: 'January 2026',
    title: {
      en: 'ADA Standards of Care in Diabetes 2026',
      ar: 'معايير الرعاية في السكري ADA 2026',
    },
    subtitle: {
      en: 'A bilingual, source-linked clinical digest focused on actionable ADA 2026 clinical topics.',
      ar: 'ملخص سريري ثنائي اللغة مبني على المصادر، يركز على الموضوعات السريرية العملية في ADA 2026.',
    },
    sources: [
      {
        id: 'improving-care',
        title: '1. Improving Care and Promoting Health in Populations',
        citation:
          'American Diabetes Association Professional Practice Committee. 1. Improving care and promoting health in populations: Standards of Care in Diabetes-2026. Diabetes Care 2026;49(Suppl. 1).',
        url: 'https://doi.org/10.2337/dc26-S001',
        localFile: '1. Improving Care and Promoting Health in Populations.pdf',
      },
      {
        id: 'diagnosis-classification',
        title: '2. Diagnosis and Classification of Diabetes',
        citation:
          'American Diabetes Association Professional Practice Committee. 2. Diagnosis and classification of diabetes: Standards of Care in Diabetes-2026. Diabetes Care 2026;49(Suppl. 1).',
        url: 'https://doi.org/10.2337/dc26-S002',
        localFile: '2. Diagnosis and Classification of Diabetes.pdf',
      },
      ...ADA_2026_REMAINING_SOURCES,
    ],
  },
  {
    id: 'ada-2025',
    school: 'ADA',
    year: 2025,
    sourceDate: 'December 2024',
    title: {
      en: 'ADA Standards of Care in Diabetes 2025',
      ar: 'معايير الرعاية في السكري ADA 2025',
    },
    subtitle: {
      en: 'A bilingual, source-linked clinical digest focused on actionable ADA 2025 clinical topics.',
      ar: 'ملخص سريري ثنائي اللغة مبني على المصادر، يركز على الموضوعات السريرية العملية في ADA 2025.',
    },
    sources: [
      {
        id: 'improving-care',
        title: '1. Improving Care and Promoting Health in Populations',
        citation:
          'American Diabetes Association Professional Practice Committee. 1. Improving care and promoting health in populations: Standards of Care in Diabetes-2025. Diabetes Care 2025;48(Suppl. 1):S14-S26. doi:10.2337/dc25-S001.',
        url: 'https://doi.org/10.2337/dc25-S001',
        localFile: '1. Improving Care and Promoting.pdf',
      },
      {
        id: 'diagnosis-classification',
        title: '2. Diagnosis and Classification of Diabetes',
        citation:
          'American Diabetes Association Professional Practice Committee. 2. Diagnosis and classification of diabetes: Standards of Care in Diabetes-2025. Diabetes Care 2025;48(Suppl. 1):S27-S49. doi:10.2337/dc25-S002.',
        url: 'https://doi.org/10.2337/dc25-S002',
        localFile: '2. Diagnosis and Classification of DM.pdf',
      },
      ...ADA_2025_REMAINING_SOURCES,
    ],
  },
  {
    id: 'gina-2025',
    school: 'GINA',
    year: 2025,
    sourceDate: 'June 2025',
    title: {
      en: 'GINA Global Strategy for Asthma 2025',
      ar: 'استراتيجية GINA لمرض الربو 2025',
    },
    subtitle: {
      en: 'A comprehensive, source-linked digest focused on actionable GINA 2025 topics.',
      ar: 'ملخص شامل وموثق يركز على الموضوعات العملية في GINA 2025.',
    },
    sources: GINA_2025_SOURCES,
  },
];

export const GUIDELINE_GROUP_LABELS: Record<GuidelineTopic['group'], LocalizedText> = {
  populationCare: {
    en: '1. Improving Care',
    ar: '1. تحسين الرعاية وصحة السكان',
  },
  diagnosisClassification: {
    en: '2. Diagnosis and Classification',
    ar: '2. التشخيص والتصنيف',
  },
  preventionEvaluation: {
    en: '3-4. Prevention and Evaluation',
    ar: '3-4. الوقاية والتقييم الشامل',
  },
  behaviorsGoalsTech: {
    en: '5-7. Behaviors, Goals, and Technology',
    ar: '5-7. السلوكيات والأهداف والتكنولوجيا',
  },
  weightPharmacology: {
    en: '8-9. Weight and Pharmacology',
    ar: '8-9. الوزن والعلاج الدوائي',
  },
  complicationsRisk: {
    en: '10-12. Complications and Risk',
    ar: '10-12. المضاعفات وإدارة الخطورة',
  },
  specialPopulations: {
    en: '13-17. Special Populations and Settings',
    ar: '13-17. فئات وسياقات خاصة',
  },
  ginaIntroduction: { en: 'Introduction & Facts', ar: 'مقدمة وحقائق' },
  ginaDiagnosis: { en: 'Diagnosing Asthma', ar: 'تشخيص الربو' },
  ginaAssessment: { en: 'Assessing Asthma', ar: 'تقييم الربو' },
  ginaGeneralPrinciples: { en: 'General Principles', ar: 'مبادئ عامة' },
  ginaAdultMedication: { en: 'Treating Adults & Adolescents', ar: 'علاج البالغين والمراهقين' },
  ginaChildMedication: { en: 'Treating Children 6-11 Years', ar: 'علاج الأطفال 6-11 سنة' },
  ginaSpecificPopulations: { en: 'Specific Populations', ar: 'حالات خاصة' },
  ginaExacerbations: { en: 'Exacerbations', ar: 'الانتكاسات' },
  ginaReferenceTables: { en: 'Reference Tables', ar: 'جداول مرجعية' },
};

