import type { GuidelineCollectionData } from './guidelinesData';
import {
  buildGuidelineStaticUrl,
  fetchGuidelineStaticJson,
  getGuidelineStaticBaseUrl,
  getGuidelineStaticVersion,
} from './guidelineStaticConfig';

type StaticCollectionDataPayload = GuidelineCollectionData & {
  collectionId?: string;
  exportedAt?: string;
};

const collectionDataCache = new Map<string, Promise<GuidelineCollectionData | null>>();

export const getGuidelineCollectionDataStatic = async (
  collectionId: string,
): Promise<GuidelineCollectionData | null> => {
  const baseUrl = getGuidelineStaticBaseUrl();
  if (!baseUrl || !collectionId) return null;

  const key = `${baseUrl}/${getGuidelineStaticVersion()}/${collectionId}`;
  const existing = collectionDataCache.get(key);
  if (existing) return existing;

  const promise = fetchGuidelineStaticJson<StaticCollectionDataPayload>(
    buildGuidelineStaticUrl(baseUrl, `${collectionId}/collection-data.json`),
  ).then((payload) => {
    if (!payload) return null;
    return {
      topics: Array.isArray(payload.topics) ? payload.topics : [],
      recommendationDigest: payload.recommendationDigest?.length
        ? payload.recommendationDigest
        : undefined,
    };
  });

  collectionDataCache.set(key, promise);
  return promise;
};
