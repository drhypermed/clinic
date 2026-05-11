/**
 * Pack Badge Cache — module-level cache لشارات السجلات
 *
 * منفصل عن الـhook عشان نقدر نبطل الكاش من خدمات الـauto-sync
 * بدون circular dependency بين services و hooks.
 */

import { normalizePatientNameForFile } from '../patient-files';

export type PackBadgeKind = 'pregnancy' | 'pediatric';
export type PackBadgeTone = 'pink' | 'sky';

export interface PackBadge {
    kind: PackBadgeKind;
    label: string;
    tone: PackBadgeTone;
}

type CacheValue = { badge: PackBadge | null };

const moduleCache = new Map<string, CacheValue>();
const pendingFetches = new Map<string, Promise<CacheValue>>();

export const buildCacheKey = (
    userId: string,
    nameKey: string,
    kind: PackBadgeKind,
): string => `${userId}|${nameKey}|${kind}`;

export const getBadgeFromCache = (
    userId: string,
    nameKey: string,
    kind: PackBadgeKind,
): CacheValue | undefined => moduleCache.get(buildCacheKey(userId, nameKey, kind));

export const setBadgeCache = (
    userId: string,
    nameKey: string,
    kind: PackBadgeKind,
    value: CacheValue,
): void => {
    moduleCache.set(buildCacheKey(userId, nameKey, kind), value);
};

export const getPendingBadgeFetch = (
    userId: string,
    nameKey: string,
    kind: PackBadgeKind,
): Promise<CacheValue> | undefined =>
    pendingFetches.get(buildCacheKey(userId, nameKey, kind));

export const setPendingBadgeFetch = (
    userId: string,
    nameKey: string,
    kind: PackBadgeKind,
    promise: Promise<CacheValue>,
): void => {
    pendingFetches.set(buildCacheKey(userId, nameKey, kind), promise);
};

export const clearPendingBadgeFetch = (
    userId: string,
    nameKey: string,
    kind: PackBadgeKind,
): void => {
    pendingFetches.delete(buildCacheKey(userId, nameKey, kind));
};

/** إبطال كاش الشاره — يتنادى من autoSync بعد ما الـpack file يتعدّل */
export const invalidatePackBadgeCache = (
    userId: string,
    nameKey: string,
    kind?: PackBadgeKind,
): void => {
    const cleanKey = normalizePatientNameForFile(nameKey || '') || nameKey;
    if (!userId || !cleanKey) return;
    if (kind) {
        moduleCache.delete(buildCacheKey(userId, cleanKey, kind));
    } else {
        moduleCache.delete(buildCacheKey(userId, cleanKey, 'pregnancy'));
        moduleCache.delete(buildCacheKey(userId, cleanKey, 'pediatric'));
    }
};
