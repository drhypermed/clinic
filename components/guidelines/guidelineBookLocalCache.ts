import type { GuidelineBookSummary, GuidelineBookTextResponse } from './guidelineChatSearch';
import type { GuidelineCollectionData } from './guidelinesData';

type CacheStoreName = 'bookLists' | 'bookText' | 'collectionData';

type CacheEntry<T> = {
  key: string;
  value: T;
  cachedAt: number;
  expiresAt: number;
  lastAccessedAt: number;
  sizeBytes: number;
};

const DB_NAME = 'drhyper-guidelines-cache';
const DB_VERSION = 2;
const MAX_CACHE_BYTES = 200 * 1024 * 1024;
const COLLECTION_DATA_TTL_MS = 24 * 60 * 60 * 1000;
const BOOK_LIST_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const BOOK_TEXT_TTL_MS = 90 * 24 * 60 * 60 * 1000;

let dbPromise: Promise<IDBDatabase> | null = null;

const canUseIndexedDb = () =>
  typeof window !== 'undefined'
  && typeof window.indexedDB !== 'undefined';

const openCacheDb = () => {
  if (!canUseIndexedDb()) return Promise.resolve(null);
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('bookLists')) {
        db.createObjectStore('bookLists', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('bookText')) {
        db.createObjectStore('bookText', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('collectionData')) {
        db.createObjectStore('collectionData', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Guidelines cache database upgrade is blocked'));
  }).catch((error) => {
    dbPromise = null;
    throw error;
  });

  return dbPromise;
};

const runStoreRequest = async <T>(
  storeName: CacheStoreName,
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T | null> => {
  try {
    const db = await openCacheDb();
    if (!db) return null;

    return await new Promise<T | null>((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const request = action(tx.objectStore(storeName));
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    return null;
  }
};

const getCachedValue = async <T>(storeName: CacheStoreName, key: string): Promise<T | null> => {
  const entry = await runStoreRequest<CacheEntry<T>>(storeName, 'readonly', (store) => store.get(key));
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    void runStoreRequest(storeName, 'readwrite', (store) => store.delete(key));
    return null;
  }
  void runStoreRequest(storeName, 'readwrite', (store) => store.put({
    ...entry,
    lastAccessedAt: Date.now(),
  }));
  return entry.value;
};

const estimateSizeBytes = (value: unknown) => {
  try {
    return new TextEncoder().encode(JSON.stringify(value)).length;
  } catch {
    return 0;
  }
};

const pruneGuidelineCache = async () => {
  try {
    const stores: CacheStoreName[] = ['bookLists', 'bookText', 'collectionData'];
    const entriesByStore = await Promise.all(stores.map(async (storeName) => ({
      storeName,
      entries: await runStoreRequest<CacheEntry<unknown>[]>(
        storeName,
        'readonly',
        (store) => store.getAll(),
      ) ?? [],
    })));

    const entries = entriesByStore.flatMap(({ storeName, entries }) =>
      entries.map((entry) => ({ ...entry, storeName })),
    );
    const now = Date.now();
    const expired = entries.filter((entry) => now > Number(entry.expiresAt || 0));
    await Promise.all(expired.map((entry) =>
      runStoreRequest(entry.storeName, 'readwrite', (store) => store.delete(entry.key)),
    ));

    const activeEntries = entries.filter((entry) => now <= Number(entry.expiresAt || 0));
    let totalBytes = activeEntries.reduce((sum, entry) => sum + Number(entry.sizeBytes || 0), 0);
    if (totalBytes <= MAX_CACHE_BYTES) return;

    const oldestFirst = activeEntries
      .sort((a, b) => Number(a.lastAccessedAt || a.cachedAt || 0) - Number(b.lastAccessedAt || b.cachedAt || 0));

    let remainingEntries = oldestFirst.length;
    for (const entry of oldestFirst) {
      if (totalBytes <= MAX_CACHE_BYTES || remainingEntries <= 1) break;
      await runStoreRequest(entry.storeName, 'readwrite', (store) => store.delete(entry.key));
      totalBytes -= Number(entry.sizeBytes || 0);
      remainingEntries -= 1;
    }
  } catch {
    // Cache pruning is best-effort; failed pruning should never block guideline loading.
  }
};

const setCachedValue = async <T>(
  storeName: CacheStoreName,
  key: string,
  value: T,
  ttlMs: number,
): Promise<void> => {
  const now = Date.now();
  await runStoreRequest(storeName, 'readwrite', (store) => store.put({
    key,
    value,
    cachedAt: now,
    expiresAt: now + ttlMs,
    lastAccessedAt: now,
    sizeBytes: estimateSizeBytes(value),
  }));
  void pruneGuidelineCache();
};

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
};

export const makeGuidelineBookListCacheKey = (selectedCollectionId?: string | null) =>
  stableStringify({ selectedCollectionId: selectedCollectionId || null });

export const makeGuidelineCollectionDataCacheKey = (collectionId: string) =>
  stableStringify({ collectionId });

export const makeGuidelineBookTextCacheKey = (params: {
  bookId?: string | null;
  selectedCollectionId?: string | null;
  selectedSourceLocalFile?: string | null;
  sourcePathCandidates?: string[];
  afterChunkIndex?: number | null;
  limit?: number;
  samplingMode?: 'summary';
}) =>
  stableStringify({
    bookId: params.bookId || null,
    selectedCollectionId: params.selectedCollectionId || null,
    selectedSourceLocalFile: params.selectedSourceLocalFile || null,
    sourcePathCandidates: (params.sourcePathCandidates || []).map((item) => item.replace(/\\/g, '/').trim()).filter(Boolean),
    afterChunkIndex: params.afterChunkIndex || 0,
    limit: params.limit || 40,
    samplingMode: params.samplingMode || '',
  });

export const getCachedGuidelineBookList = (key: string) =>
  getCachedValue<GuidelineBookSummary[]>('bookLists', key);

export const cacheGuidelineBookList = (key: string, books: GuidelineBookSummary[]) =>
  setCachedValue('bookLists', key, books, BOOK_LIST_TTL_MS);

export const getCachedGuidelineBookText = (key: string) =>
  getCachedValue<GuidelineBookTextResponse>('bookText', key);

export const cacheGuidelineBookText = (key: string, response: GuidelineBookTextResponse) => {
  if (!response.book && response.chunks.length === 0) return Promise.resolve();
  return setCachedValue('bookText', key, response, BOOK_TEXT_TTL_MS);
};

export const getCachedGuidelineCollectionData = (key: string) =>
  getCachedValue<GuidelineCollectionData>('collectionData', key);

export const cacheGuidelineCollectionData = (key: string, data: GuidelineCollectionData) => {
  if (!data.topics.length) return Promise.resolve();
  return setCachedValue('collectionData', key, data, COLLECTION_DATA_TTL_MS);
};
