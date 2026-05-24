import {
  GUIDELINE_COLLECTIONS,
  type GuidelineCollection,
  type GuidelineCollectionData,
  type GuidelineLanguage,
  type GuidelineSource,
  type GuidelineTopic,
  loadGuidelineCollectionData,
} from './guidelinesData';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firebaseConfig';

export type GuidelineChatScope = 'current-section' | 'current-guideline' | 'all-guidelines';

export type GuidelineChatResponseMode = 'concise' | 'detailed' | 'table' | 'official';

export type GuidelineChatCollectionBundle = {
  collection: GuidelineCollection;
  data: GuidelineCollectionData;
};

export type GuidelineChatSourceChunk = {
  id: string;
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
  sourcePath?: string;
  label: string;
  text: string;
  normalizedText: string;
  kind: 'summary' | 'detail' | 'recommendation' | 'table' | 'visual' | 'full-text';
  score?: number;
};

export type GuidelineChatSearchContext = {
  selectedCollectionId?: string;
  selectedGroup?: GuidelineTopic['group'];
  scope: GuidelineChatScope;
};

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

const stopWords = new Set([
  'a',
  'an',
  'and',
  'are',
  'be',
  'can',
  'do',
  'does',
  'for',
  'from',
  'how',
  'i',
  'in',
  'is',
  'me',
  'of',
  'on',
  'or',
  'should',
  'the',
  'to',
  'use',
  'what',
  'when',
  'with',
  'ابدا',
  'استخدم',
  'ايه',
  'الى',
  'او',
  'ال',
  'انا',
  'في',
  'كيف',
  'ما',
  'متي',
  'مع',
  'من',
  'ممكن',
  'هل',
]);

const clinicalAliasGroups = [
  ['aki', 'acute kidney injury', 'kidney injury', 'acute renal failure', 'اصابه كلويه حاده', 'فشل كلوي حاد'],
  ['akd', 'acute kidney disease', 'acute kidney diseases and disorders', 'مرض كلوي حاد'],
  ['ckd', 'chronic kidney disease', 'chronic renal disease', 'قصور كلوي مزمن', 'مرض كلوي مزمن'],
  ['rrt', 'krt', 'renal replacement therapy', 'kidney replacement therapy', 'dialysis', 'hemodialysis', 'haemodialysis', 'peritoneal dialysis', 'غسيل كلوي', 'بدء الغسيل'],
  ['esa', 'erythropoiesis stimulating agent', 'epoetin', 'darbepoetin', 'erythropoietin', 'محفزات تكوين الدم'],
  ['hb', 'hgb', 'hemoglobin', 'haemoglobin', 'هيموجلوبين'],
  ['iron', 'ferritin', 'tsat', 'transferrin saturation', 'حديد', 'فيريتين'],
  ['egfr', 'gfr', 'estimated glomerular filtration rate', 'glomerular filtration rate'],
  ['scr', 'serum creatinine', 'creatinine', 'كرياتينين'],
  ['urine output', 'oliguria', 'anuria', 'diuresis', 'بول', 'قلة البول', 'انقطاع البول'],
  ['hyperkalemia', 'hyperkalaemia', 'potassium', 'k', 'بوتاسيوم'],
  ['acidosis', 'metabolic acidosis', 'حماض'],
  ['fluid overload', 'volume overload', 'pulmonary edema', 'oedema', 'وذمه', 'احتقان'],
  ['uremia', 'uraemia', 'uremic', 'يوريميا'],
  ['diabetes', 'dm', 't2d', 't2dm', 'type 2 diabetes', 'سكري'],
  ['a1c', 'hba1c', 'glycated hemoglobin', 'glycaemic', 'glycemic', 'سكر تراكمي'],
  ['bp', 'blood pressure', 'hypertension', 'ضغط الدم', 'ضغط'],
  ['sglt2', 'sglt2 inhibitor', 'sodium glucose cotransporter 2'],
  ['glp1', 'glp 1', 'glp 1 ra', 'glp-1 receptor agonist'],
  ['ascvd', 'atherosclerotic cardiovascular disease', 'cardiovascular disease', 'cvd'],
  ['asthma', 'ربو', 'حساسيه صدر'],
  ['ics', 'inhaled corticosteroid', 'corticosteroid inhaled', 'كورتيزون استنشاق'],
  ['saba', 'short acting beta agonist', 'salbutamol', 'albuterol'],
  ['laba', 'long acting beta agonist', 'formoterol', 'salmeterol'],
  ['mart', 'maintenance and reliever therapy', 'smart', 'anti inflammatory reliever'],
];

const splitTerms = (value: string) =>
  value
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2 && !stopWords.has(term));

const getExpandedTerms = (value: string) => {
  const normalizedQuery = normalizeSearchText(value);
  const terms = new Set(splitTerms(normalizedQuery));

  for (const aliases of clinicalAliasGroups) {
    const normalizedAliases = aliases.map(normalizeSearchText);
    const matched = normalizedAliases.some((alias) => {
      if (!alias) return false;
      if (normalizedQuery.includes(alias)) return true;
      return splitTerms(alias).some((term) => terms.has(term));
    });

    if (matched) {
      normalizedAliases.forEach((alias) => {
        splitTerms(alias).forEach((term) => terms.add(term));
      });
    }
  }

  return {
    normalizedQuery,
    terms: Array.from(terms),
  };
};

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

export const loadAllGuidelineChatCollections = async (): Promise<GuidelineChatCollectionBundle[]> => {
  const entries = await Promise.all(
    GUIDELINE_COLLECTIONS.map(async (collection) => {
      const data = await loadGuidelineCollectionData(collection.id);
      return data ? { collection, data } : null;
    }),
  );
  return entries.filter((entry): entry is GuidelineChatCollectionBundle => Boolean(entry));
};

type FullTextGuidelineIndexFile = {
  generatedAt: string;
  documentCount: number;
  chunkCount: number;
  chunks: Array<Omit<GuidelineChatSourceChunk, 'normalizedText' | 'kind'> & { kind: 'full-text' }>;
};

export const loadFullTextGuidelineChatIndex = async (): Promise<GuidelineChatSourceChunk[]> => {
  // Client-side full-text index is disabled in favor of high-performance server-side Firestore search.
  // This reduces client bandwidth and memory load to virtually zero.
  return [];
};

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

const getChunkMetadata = (chunk: GuidelineChatSourceChunk) =>
  normalizeSearchText([
    chunk.label,
    chunk.sourceTitle,
    chunk.folderTitle,
    chunk.fileTitle,
    chunk.collectionTitle,
    chunk.school,
    String(chunk.year),
  ].filter(Boolean).join(' '));

const hasSoftTokenMatch = (chunkTokens: Set<string>, term: string) => {
  if (term.length < 4) return false;
  for (const token of chunkTokens) {
    if (token.length >= 4 && (token.startsWith(term) || term.startsWith(token))) return true;
  }
  return false;
};

const scoreChunk = (
  chunk: GuidelineChatSourceChunk,
  queryProfile: ReturnType<typeof getExpandedTerms>,
) => {
  const { normalizedQuery, terms } = queryProfile;
  if (terms.length === 0) return 0;
  let score = 0;
  let matchedTerms = 0;
  const metadata = getChunkMetadata(chunk);
  const chunkTokens = new Set(splitTerms(chunk.normalizedText));

  if (normalizedQuery.length >= 8 && chunk.normalizedText.includes(normalizedQuery)) {
    score += 18;
  }

  for (const term of terms) {
    let matched = false;
    if (chunk.normalizedText.includes(term)) {
      score += term.length <= 2 ? 1.5 : 4;
      matched = true;
    } else if (hasSoftTokenMatch(chunkTokens, term)) {
      score += 1.5;
      matched = true;
    }
    if (metadata.includes(term)) {
      score += 3;
      matched = true;
    }
    if (matched) matchedTerms += 1;
  }

  const coverage = matchedTerms / terms.length;
  score += coverage * 10;
  if (matchedTerms >= 2) score += 4;
  if (matchedTerms >= 3) score += 4;
  if (chunk.kind === 'recommendation') score += 3;
  if (chunk.kind === 'table') score += 2.5;
  if (chunk.kind === 'full-text') score += 2;
  if (chunk.kind === 'summary') score += 1.5;
  return score;
};

const filterByScope = (
  chunk: GuidelineChatSourceChunk,
  context: GuidelineChatSearchContext,
  scope: GuidelineChatScope,
) => {
  if (scope === 'current-guideline' && context.selectedCollectionId) {
    return chunk.collectionId === context.selectedCollectionId;
  }
  if (scope === 'current-section' && context.selectedCollectionId && context.selectedGroup) {
    return chunk.collectionId === context.selectedCollectionId && chunk.group === context.selectedGroup;
  }
  return true;
};

const searchInScope = (
  index: GuidelineChatSourceChunk[],
  queryProfile: ReturnType<typeof getExpandedTerms>,
  context: GuidelineChatSearchContext,
  scope: GuidelineChatScope,
  limit: number,
) =>
  index
    .filter((chunk) => filterByScope(chunk, context, scope))
    .map((chunk) => ({ ...chunk, score: scoreChunk(chunk, queryProfile) }))
    .filter((chunk) => (chunk.score ?? 0) >= 2)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, limit);

export const searchGuidelineChatIndex = (
  index: GuidelineChatSourceChunk[],
  query: string,
  context: GuidelineChatSearchContext,
  limit = 8,
): GuidelineChatSourceChunk[] => {
  const queryProfile = getExpandedTerms(query);
  if (queryProfile.terms.length === 0) return [];

  const scopesToTry: GuidelineChatScope[] = [context.scope];
  if (context.scope === 'current-section') scopesToTry.push('current-guideline', 'all-guidelines');
  if (context.scope === 'current-guideline') scopesToTry.push('all-guidelines');

  const byId = new Map<string, GuidelineChatSourceChunk>();
  for (const scope of scopesToTry) {
    searchInScope(index, queryProfile, context, scope, limit).forEach((chunk) => {
      if (!byId.has(chunk.id)) byId.set(chunk.id, chunk);
    });
    if (byId.size >= Math.min(4, limit)) break;
  }

  return Array.from(byId.values())
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, limit);
};

export const formatChunkCitation = (chunk: GuidelineChatSourceChunk, language: GuidelineLanguage) => {
  const page = chunk.page ? (chunk.endPage && chunk.endPage !== chunk.page ? `pp. ${chunk.page}-${chunk.endPage}` : `p. ${chunk.page}`) : '';
  const file = chunk.fileTitle || chunk.sourceTitle || chunk.collectionTitle;
  const folder = chunk.folderTitle ? `${chunk.folderTitle} / ` : '';
  if (language === 'ar') {
    return `${chunk.school} ${chunk.year} - ${folder}${file}${page ? ` - ${page}` : ''}`;
  }
  return `${chunk.school} ${chunk.year} - ${folder}${file}${page ? ` - ${page}` : ''}`;
};

export const searchGuidelineChatIndexCloud = async (
  query: string,
  context: GuidelineChatSearchContext,
  limit = 12
): Promise<GuidelineChatSourceChunk[]> => {
  try {
    const searchFn = httpsCallable<
      { query: string; selectedCollectionId?: string | null; selectedGroup?: string | null },
      { results: GuidelineChatSourceChunk[] }
    >(functions, 'searchGuidelineIndex');

    const response = await searchFn({
      query,
      selectedCollectionId: context.scope !== 'all-guidelines' ? (context.selectedCollectionId || null) : null,
      selectedGroup: context.scope === 'current-section' ? (context.selectedGroup || null) : null,
    });

    const results = response.data?.results || [];
    return results.slice(0, limit);
  } catch (error) {
    console.error('Error calling searchGuidelineIndex cloud function:', error);
    return [];
  }
};
