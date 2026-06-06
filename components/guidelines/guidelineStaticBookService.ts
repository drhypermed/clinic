import type { GuidelineBookSummary, GuidelineBookTextResponse, GuidelineChatSourceChunk } from './guidelineChatSearch';

type StaticBookManifest = {
  collectionId: string;
  books: Array<GuidelineBookSummary & {
    staticJsonPath?: string;
    staticGzipPath?: string;
    staticSha256?: string;
  }>;
};

type StaticBookPayload = {
  book: GuidelineBookSummary | null;
  chunks: GuidelineChatSourceChunk[];
};

const manifestCache = new Map<string, Promise<StaticBookManifest | null>>();
const bookPayloadCache = new Map<string, Promise<StaticBookPayload | null>>();

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, '');
const normalizePath = (value: string) => String(value || '').replace(/\\/g, '/').toLowerCase().trim();

const getStaticBaseUrl = () => {
  const env = import.meta as unknown as { env?: { VITE_GUIDELINE_STATIC_BASE_URL?: string } };
  return String(env.env?.VITE_GUIDELINE_STATIC_BASE_URL || '').trim();
};

const buildStaticUrl = (baseUrl: string, relativePath: string) => {
  const path = relativePath.replace(/^\/+/, '');
  if (baseUrl.includes('{path}')) {
    return baseUrl.replace('{path}', encodeURIComponent(path));
  }
  return `${normalizeBaseUrl(baseUrl)}/${path}`;
};

const fetchJson = async <T>(url: string): Promise<T | null> => {
  try {
    const response = await fetch(url, {
      credentials: 'omit',
      cache: 'force-cache',
    });
    if (!response.ok) return null;
    return await response.json() as T;
  } catch {
    return null;
  }
};

const loadManifest = (collectionId: string) => {
  const baseUrl = getStaticBaseUrl();
  if (!baseUrl || !collectionId) return Promise.resolve(null);
  const key = `${baseUrl}/${collectionId}`;
  const existing = manifestCache.get(key);
  if (existing) return existing;

  const promise = fetchJson<StaticBookManifest>(buildStaticUrl(baseUrl, `${collectionId}/manifest.json`));
  manifestCache.set(key, promise);
  return promise;
};

const loadBookPayload = (baseUrl: string, staticJsonPath: string) => {
  const url = buildStaticUrl(baseUrl, staticJsonPath);
  const existing = bookPayloadCache.get(url);
  if (existing) return existing;

  const promise = fetchJson<StaticBookPayload>(url);
  bookPayloadCache.set(url, promise);
  return promise;
};

const isSameSourcePath = (left: string, right: string) => {
  const a = normalizePath(left);
  const b = normalizePath(right);
  return Boolean(a && b && (a === b || a.endsWith(`/${b}`) || b.endsWith(`/${a}`)));
};

const findBook = (
  manifest: StaticBookManifest,
  params: {
    bookId?: string | null;
    selectedSourceLocalFile?: string | null;
    sourcePathCandidates?: string[];
  },
) => {
  if (params.bookId) {
    const byId = manifest.books.find((book) => book.bookId === params.bookId || book.id === params.bookId);
    if (byId) return byId;
  }

  const candidates = [
    params.selectedSourceLocalFile,
    ...(params.sourcePathCandidates || []),
  ].filter(Boolean) as string[];
  return manifest.books.find((book) =>
    candidates.some((candidate) =>
      isSameSourcePath(book.sourcePath, candidate)
      || isSameSourcePath((book as { localFile?: string }).localFile || '', candidate),
    ),
  ) || null;
};

const selectSummaryChunks = (chunks: GuidelineChatSourceChunk[], limit: number) => {
  const selected = new Map<string, GuidelineChatSourceChunk>();
  const add = (chunk?: GuidelineChatSourceChunk) => {
    if (!chunk) return;
    selected.set(chunk.id || `${chunk.bookId || chunk.sourcePath}:${chunk.chunkIndex}`, chunk);
  };

  chunks.slice(0, 5).forEach(add);
  const highValuePattern = /\b(recommend|recommendation|should|diagnos|criteria|classif|management|treat|therapy|contraindicat|avoid|monitor|follow-up|follow up|screen|refer|risk|dose|dosage|target|threshold|algorithm|emergency|acute|severe|pregnan|child|elderly|renal|hepatic)\b/i;
  chunks
    .filter((chunk) => highValuePattern.test(`${chunk.heading || ''} ${chunk.text || ''}`))
    .slice(0, Math.max(8, limit - 8))
    .forEach(add);

  const remainingSlots = Math.max(0, limit - selected.size);
  const step = remainingSlots > 0 ? Math.max(1, Math.floor(chunks.length / remainingSlots)) : chunks.length || 1;
  for (let i = 0; selected.size < limit && i < chunks.length; i += step) add(chunks[i]);
  chunks.slice(-3).forEach(add);

  return Array.from(selected.values())
    .sort((a, b) => (a.chunkIndex || 0) - (b.chunkIndex || 0))
    .slice(0, limit);
};

export const getGuidelineBookTextStatic = async (
  params: {
    bookId?: string | null;
    selectedCollectionId?: string | null;
    selectedSourceLocalFile?: string | null;
    sourcePathCandidates?: string[];
    afterChunkIndex?: number | null;
    limit?: number;
    samplingMode?: 'summary';
  },
): Promise<GuidelineBookTextResponse | null> => {
  const baseUrl = getStaticBaseUrl();
  const collectionId = params.selectedCollectionId || '';
  if (!baseUrl || !collectionId) return null;

  const manifest = await loadManifest(collectionId);
  if (!manifest?.books?.length) return null;

  const book = findBook(manifest, params);
  const staticPath = book?.staticGzipPath || book?.staticJsonPath;
  if (!staticPath) return null;

  const payload = await loadBookPayload(baseUrl, staticPath);
  const allChunks = (payload?.chunks || [])
    .slice()
    .sort((a, b) => (a.chunkIndex || 0) - (b.chunkIndex || 0));
  if (!payload?.book || allChunks.length === 0) return null;

  const limit = Math.min(80, Math.max(12, Number(params.limit || 40) || 40));
  if (params.samplingMode === 'summary') {
    return {
      book: payload.book,
      chunks: selectSummaryChunks(allChunks, limit),
      nextAfterChunkIndex: null,
      hasMore: false,
    };
  }

  const afterChunkIndex = Math.max(0, Number(params.afterChunkIndex || 0) || 0);
  const filtered = allChunks.filter((chunk) => (chunk.chunkIndex || 0) > afterChunkIndex);
  const page = filtered.slice(0, limit);
  const last = page[page.length - 1];
  return {
    book: payload.book,
    chunks: page,
    nextAfterChunkIndex: last ? last.chunkIndex || null : null,
    hasMore: filtered.length > page.length,
  };
};
