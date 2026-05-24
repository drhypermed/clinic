import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';

export type GuidelineLanguage = 'ar' | 'en';

export type LocalizedText = Record<GuidelineLanguage, string>;

export type GuidelineSource = {
  id: string;
  title: string;
  citation: string;
  url: string;
  localFile?: string;
  folderTitle?: string;
  folderTopicId?: string;
  fileTopicId?: string;
  fileType?: string;
  pageCount?: number;
  chunkCount?: number;
  textChars?: number;
  structuredTextPath?: string;
  rawTextPath?: string;
  sha256?: string;
};

export type GuidelineSourceRecommendation = {
  id: string;
  grade: string;
  page: number;
  text: string;
  topicId?: string;
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
    | 'ginaAssessment'
    | 'kdigoLibrary'
    | 'kdigoFileIndex'
    | 'kdigoChapter1'
    | 'kdigoChapter2'
    | 'kdigoChapter3'
    | 'kdigoChapter4'
    | 'kdigoChapter5'
    | 'kdigoChapter6';
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
import { KDIGO_SOURCES } from './data/kdigo/sources';

export const loadGuidelineCollectionData = async (id: string): Promise<GuidelineCollectionData | null> => {
  try {
    // 1. Fetch structured topics from 'guideline_topics' collection
    const topicsQuery = query(
      collection(db, 'guideline_topics'),
      where('collectionId', '==', id)
    );
    const topicsSnapshot = await getDocs(topicsQuery);
    const topics: GuidelineTopic[] = [];
    topicsSnapshot.forEach((doc) => {
      topics.push(doc.data() as GuidelineTopic);
    });

    // 2. Fetch recommendation digests from 'guideline_digests' collection
    const digestsQuery = query(
      collection(db, 'guideline_digests'),
      where('collectionId', '==', id)
    );
    const digestsSnapshot = await getDocs(digestsQuery);
    const recommendationDigest: GuidelineSourceDigest[] = [];
    digestsSnapshot.forEach((doc) => {
      recommendationDigest.push(doc.data() as GuidelineSourceDigest);
    });

    if (topics.length === 0) {
      console.warn(`No structured topics found in Firestore for collection ${id}`);
      return null;
    }

    return {
      topics,
      recommendationDigest: recommendationDigest.length > 0 ? recommendationDigest : undefined,
    };
  } catch (error) {
    console.error(`Error loading guideline collection data from Firestore for ${id}:`, error);
    return null;
  }
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
  {
    id: 'kdigo-2026',
    school: 'KDIGO',
    year: 2026,
    sourceDate: '2026',
    title: {
      en: 'KDIGO Clinical Practice Guidelines',
      ar: 'أدلة الممارسة السريرية KDIGO',
    },
    subtitle: {
      en: 'A comprehensive, source-linked kidney disease library.',
      ar: 'مكتبة شاملة لأمراض الكلى موثقة بالمصادر.',
    },
    sources: KDIGO_SOURCES,
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
  kdigoLibrary: { en: 'KDIGO Library', ar: 'مكتبة KDIGO' },
  kdigoFileIndex: { en: 'File Index', ar: 'فهرس الملفات' },
  kdigoChapter1: { en: 'Chapter 1', ar: 'الفصل 1' },
  kdigoChapter2: { en: 'Chapter 2', ar: 'الفصل 2' },
  kdigoChapter3: { en: 'Chapter 3', ar: 'الفصل 3' },
  kdigoChapter4: { en: 'Chapter 4', ar: 'الفصل 4' },
  kdigoChapter5: { en: 'Chapter 5', ar: 'الفصل 5' },
  kdigoChapter6: { en: 'Chapter 6', ar: 'الفصل 6' },
};

