import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { loadLocalGuidelineCollectionData } from './guidelineLocalData';

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
  bookId?: string;
  storagePdfUrl?: string;
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
  group: string;
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
  sourceCount?: number;
};

export type GuidelineCollectionData = {
  topics: GuidelineTopic[];
  recommendationDigest?: GuidelineSourceDigest[];
};

const fetchFirestoreCollectionData = async (
  id: string,
): Promise<GuidelineCollectionData> => {
  const topicsQuery = query(
    collection(db, 'guideline_topics'),
    where('collectionId', '==', id),
  );
  const digestsQuery = query(
    collection(db, 'guideline_digests'),
    where('collectionId', '==', id),
  );

  const [topicsSnapshot, digestsSnapshot] = await Promise.all([
    getDocs(topicsQuery),
    getDocs(digestsQuery),
  ]);

  const topics: GuidelineTopic[] = [];
  const recommendationDigest: GuidelineSourceDigest[] = [];

  topicsSnapshot.forEach((doc) => {
    topics.push(doc.data() as GuidelineTopic);
  });
  digestsSnapshot.forEach((doc) => {
    recommendationDigest.push(doc.data() as GuidelineSourceDigest);
  });

  return {
    topics,
    recommendationDigest: recommendationDigest.length > 0 ? recommendationDigest : undefined,
  };
};

export const loadGuidelineCollectionData = async (
  id: string,
  localOnly = false,
): Promise<GuidelineCollectionData | null> => {
  if (localOnly) return loadLocalGuidelineCollectionData(id);

  try {
    const firestoreData = await fetchFirestoreCollectionData(id);
    if (firestoreData.topics.length > 0) return firestoreData;
    return loadLocalGuidelineCollectionData(id);
  } catch (error) {
    console.error(`Error loading guideline collection data from Firestore for ${id}:`, error);
    return loadLocalGuidelineCollectionData(id);
  }
};

export {
  GUIDELINE_COLLECTIONS,
  loadGuidelineCollectionSources,
} from './guidelineCollectionRegistry';
export { GUIDELINE_GROUP_LABELS } from './guidelineGroupLabels';
