import {
  type GuidelineCollection,
  type GuidelineCollectionData,
  type GuidelineLanguage,
  type GuidelineSource,
  type GuidelineTopic,
} from './guidelinesData';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firebaseConfig';
import { hasReliablePdfPageNumbers } from './guidelineSourceUtils';

export type GuidelineChatScope = 'current-guideline' | 'all-guidelines' | 'current-file';

export type GuidelineChatResponseMode = 'clinical' | 'concise' | 'detailed' | 'table' | 'official';

export type GuidelineChatCollectionBundle = {
  collection: GuidelineCollection;
  data: GuidelineCollectionData;
};

export type GuidelineChatSourceChunk = {
  id: string;
  bookId?: string;
  collectionId: string;
  collectionTitle: string;
  school: string;
  year: number;
  group?: GuidelineTopic['group'];
  topicId?: string;
  sourceId?: string;
  sourceTitle?: string;
  folderTitle?: string;
  fileTitle?: string;
  localFile?: string;
  url?: string;
  page?: number;
  endPage?: number;
  pageStart?: number;
  pageEnd?: number;
  chunkIndex?: number;
  globalOrder?: number;
  sourcePath?: string;
  heading?: string;
  label: string;
  text: string;
  normalizedText?: string;
  kind: 'summary' | 'detail' | 'recommendation' | 'table' | 'visual' | 'full-text';
  score?: number;
  contextOnly?: boolean;
  concepts?: string[];
  intentTags?: string[];
  embeddingModel?: string;
  publicPdfPath?: string;
  storagePdfPath?: string;
  storagePdfUrl?: string;
  pdfHighlight?: {
    pageStart: number;
    pageEnd: number;
    pageSizes: Record<string, { width: number; height: number }>;
    rects: Array<{
      page: number;
      x: number;
      y: number;
      width: number;
      height: number;
    }>;
    matchStrategy?: string;
    generatedAt?: string;
  };
};

export type GuidelineBookSummary = {
  id: string;
  bookId: string;
  collectionId: string;
  school: string;
  year: number;
  title: string;
  sourceTitle: string;
  folderTitle: string;
  fileTitle: string;
  sourcePath: string;
  pageCount: number;
  chunkCount: number;
  textChars: number;
  storagePdfPath?: string;
  storagePdfUrl?: string;
};

export type GuidelineBookTextResponse = {
  book: GuidelineBookSummary | null;
  chunks: GuidelineChatSourceChunk[];
  nextAfterChunkIndex: number | null;
  hasMore: boolean;
};

export type GuidelineChatSearchContext = {
  selectedCollectionId?: string;
  selectedGroup?: GuidelineTopic['group'];
  scope: GuidelineChatScope;
};

export class GuidelineChatSearchError extends Error {
  originalError: unknown;

  constructor(message: string, originalError: unknown) {
    super(message);
    this.name = 'GuidelineChatSearchError';
    this.originalError = originalError;
  }
}

const normalizeSearchText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/\bhaem/g, 'hem')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

// --- Helpers used by buildGuidelineChatIndex (consumed by upload script) ---

const getSourceById = (collection: GuidelineCollection, sourceId?: string): GuidelineSource | undefined =>
  sourceId ? collection.sources.find((source) => source.id === sourceId) : undefined;

const buildSourceMeta = (collection: GuidelineCollection, sourceId?: string) => {
  const source = getSourceById(collection, sourceId);
  return {
    sourceTitle: source?.title,
    folderTitle: source?.folderTitle,
    fileTitle: source?.localFile?.split(/[\\/]/).pop() ?? source?.title,
    localFile: source?.localFile,
    url: source?.url,
  };
};

/**
 * Builds a flat array of searchable chunks from structured guideline data.
 * Used by the Firestore upload script (upload-guidelines-to-firestore.ts).
 */
export const buildGuidelineChatIndex = (bundles: GuidelineChatCollectionBundle[]): GuidelineChatSourceChunk[] => {
  const chunks: GuidelineChatSourceChunk[] = [];

  for (const { collection, data } of bundles) {
    const topicGroupsById = new Map(data.topics.map((topic) => [topic.id, topic.group]));

    for (const topic of data.topics) {
      const topicSource = buildSourceMeta(collection, topic.sourceIds[0]);
      const base = {
        collectionId: collection.id,
        collectionTitle: collection.title.en,
        school: collection.school,
        year: collection.year,
        group: topic.group,
        topicId: topic.id,
        sourceId: topic.sourceIds[0],
        ...topicSource,
      };

      const summaryText = [
        topic.title.en,
        topic.title.ar,
        topic.summary.en,
        topic.summary.ar,
        topic.points.en.join('\n'),
        topic.points.ar.join('\n'),
        topic.practiceNote?.en,
        topic.practiceNote?.ar,
        topic.tags.join(', '),
      ].filter(Boolean).join('\n');

      chunks.push({
        ...base,
        id: `${collection.id}:${topic.id}:summary`,
        kind: 'summary',
        label: `${collection.school} ${collection.year} - ${topic.title.en}`,
        text: summaryText,
        normalizedText: normalizeSearchText(summaryText),
      });

      topic.details?.forEach((detail, detailIndex) => {
        const text = [
          detail.title.en,
          detail.title.ar,
          detail.items.en.join('\n'),
          detail.items.ar.join('\n'),
        ].join('\n');
        chunks.push({
          ...base,
          id: `${collection.id}:${topic.id}:detail:${detailIndex}`,
          kind: 'detail',
          label: `${collection.school} ${collection.year} - ${detail.title.en}`,
          text,
          normalizedText: normalizeSearchText(text),
        });
      });

      topic.visuals?.forEach((visual) => {
        const visualSource = buildSourceMeta(collection, visual.sourceId);
        const text = [
          visual.label,
          visual.title.en,
          visual.title.ar,
          visual.takeaways?.en.join('\n'),
          visual.takeaways?.ar.join('\n'),
        ].filter(Boolean).join('\n');
        chunks.push({
          ...base,
          ...visualSource,
          id: `${collection.id}:${topic.id}:visual:${visual.imageSrc}`,
          kind: 'visual',
          sourceId: visual.sourceId,
          page: visual.page,
          label: `${collection.school} ${collection.year} - ${visual.label}`,
          text,
          normalizedText: normalizeSearchText(text),
        });
      });
    }

    data.recommendationDigest?.forEach((digest) => {
      const sourceMeta = buildSourceMeta(collection, digest.sourceId);
      const recommendationGroupsById = new Map(
        digest.recommendations.map((recommendation) => [
          recommendation.id,
          recommendation.topicId ? topicGroupsById.get(recommendation.topicId) : undefined,
        ]),
      );

      digest.recommendations.forEach((recommendation) => {
        const text = [
          recommendation.id,
          recommendation.grade ? `Grade ${recommendation.grade}` : '',
          recommendation.text,
        ].filter(Boolean).join('\n');
        chunks.push({
          collectionId: collection.id,
          collectionTitle: collection.title.en,
          school: collection.school,
          year: collection.year,
          group: recommendation.topicId ? topicGroupsById.get(recommendation.topicId) : undefined,
          topicId: recommendation.topicId,
          sourceId: digest.sourceId,
          ...sourceMeta,
          id: `${collection.id}:${digest.sourceId}:rec:${recommendation.id}`,
          kind: 'recommendation',
          page: recommendation.page,
          label: `${digest.title} - ${recommendation.id}`,
          text,
          normalizedText: normalizeSearchText(text),
        });
      });

      digest.tableTextRows?.forEach((table, tableIndex) => {
        const text = [
          table.relatedItems.join(', '),
          table.rows.join('\n'),
        ].filter(Boolean).join('\n');
        chunks.push({
          collectionId: collection.id,
          collectionTitle: collection.title.en,
          school: collection.school,
          year: collection.year,
          group: table.relatedItems
            .map((itemId) => recommendationGroupsById.get(itemId))
            .find((group): group is GuidelineTopic['group'] => Boolean(group)),
          sourceId: digest.sourceId,
          ...sourceMeta,
          id: `${collection.id}:${digest.sourceId}:table:${tableIndex}`,
          kind: 'table',
          page: table.page,
          label: `${digest.title} - table text p.${table.page}`,
          text,
          normalizedText: normalizeSearchText(text),
        });
      });
    });
  }

  return chunks;
};

// --- Citation formatting ---

export const formatChunkCitation = (chunk: GuidelineChatSourceChunk, language: GuidelineLanguage) => {
  const page = hasReliablePdfPageNumbers(chunk) && chunk.page
    ? (chunk.endPage && chunk.endPage !== chunk.page ? `pp. ${chunk.page}-${chunk.endPage}` : `p. ${chunk.page}`)
    : '';
  const file = chunk.fileTitle || chunk.sourceTitle || chunk.collectionTitle;
  const folder = chunk.folderTitle ? `${chunk.folderTitle} / ` : '';
  if (language === 'ar') {
    return `${chunk.school} ${chunk.year} - ${folder}${file}${page ? ` - ${page}` : ''}`;
  }
  return `${chunk.school} ${chunk.year} - ${folder}${file}${page ? ` - ${page}` : ''}`;
};

// --- Cloud function wrappers (active search path) ---

export const searchGuidelineChatIndexCloud = async (
  query: string,
  context: GuidelineChatSearchContext,
  limit = 12,
  selectedSource?: Pick<GuidelineSource, 'localFile' | 'title' | 'folderTitle'> | null,
): Promise<GuidelineChatSourceChunk[]> => {
  try {
    const searchFn = httpsCallable<
      {
        query: string;
        selectedCollectionId?: string | null;
        selectedGroup?: string | null;
        selectedSourceLocalFile?: string | null;
        selectedSourceTitle?: string | null;
        sourcePathCandidates?: string[];
        strictSource?: boolean;
        limit?: number;
      },
      { results: GuidelineChatSourceChunk[] }
    >(functions, 'searchGuidelineIndex');

    const response = await searchFn({
      query,
      selectedCollectionId: context.scope !== 'all-guidelines' ? (context.selectedCollectionId || null) : null,
      selectedGroup: null,
      selectedSourceLocalFile: context.scope === 'current-file' ? (selectedSource?.localFile || null) : null,
      selectedSourceTitle: context.scope === 'current-file' ? (selectedSource?.title || null) : null,
      sourcePathCandidates: context.scope === 'current-file' && selectedSource?.localFile ? [selectedSource.localFile] : [],
      strictSource: context.scope === 'current-file',
      limit,
    });

    const results = response.data?.results || [];

    // Client-side fallback strict filtering for 'current-file' scope
    if (context.scope === 'current-file' && selectedSource?.localFile) {
      const normalizedLocalFile = selectedSource.localFile.replace(/\\/g, '/').toLowerCase().trim();
      const filtered = results.filter((chunk) => {
        const chunkLocalFile = (chunk.localFile || chunk.sourcePath || '').replace(/\\/g, '/').toLowerCase().trim();
        return chunkLocalFile === normalizedLocalFile ||
               chunkLocalFile.endsWith('/' + normalizedLocalFile) ||
               normalizedLocalFile.endsWith('/' + chunkLocalFile);
      });
      return filtered.slice(0, limit);
    }

    return results.slice(0, limit);
  } catch (error) {
    console.error('Error calling searchGuidelineIndex cloud function:', error);
    throw new GuidelineChatSearchError('Guideline source search failed', error);
  }
};

export const listGuidelineBooksCloud = async (
  selectedCollectionId?: string | null,
): Promise<GuidelineBookSummary[]> => {
  try {
    const listFn = httpsCallable<
      { selectedCollectionId?: string | null },
      { books: GuidelineBookSummary[] }
    >(functions, 'listGuidelineBooks');
    const response = await listFn({ selectedCollectionId: selectedCollectionId || null });
    return response.data?.books || [];
  } catch (error) {
    console.error('Error calling listGuidelineBooks cloud function:', error);
    return [];
  }
};

export const getGuidelineBookTextCloud = async (
  params: {
    bookId?: string | null;
    selectedCollectionId?: string | null;
    selectedSourceLocalFile?: string | null;
    sourcePathCandidates?: string[];
    afterChunkIndex?: number | null;
    limit?: number;
    samplingMode?: 'summary';
  },
): Promise<GuidelineBookTextResponse> => {
  try {
    const getFn = httpsCallable<
      typeof params,
      GuidelineBookTextResponse
    >(functions, 'getGuidelineBookText');
    const response = await getFn(params);
    return {
      book: response.data?.book || null,
      chunks: response.data?.chunks || [],
      nextAfterChunkIndex: response.data?.nextAfterChunkIndex ?? null,
      hasMore: Boolean(response.data?.hasMore),
    };
  } catch (error) {
    console.error('Error calling getGuidelineBookText cloud function:', error);
    return { book: null, chunks: [], nextAfterChunkIndex: null, hasMore: false };
  }
};
