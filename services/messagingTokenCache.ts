import { safeLsGet, safeLsRemove, safeLsSet } from '../utils/localStorageHelpers';

const DOCTOR_PUSH_TOKEN_CACHE_PREFIX = 'dh_push_token_doctor_';
const SECRETARY_PUSH_TOKEN_CACHE_PREFIX = 'dh_push_token_secretary_';
const PUBLIC_PUSH_TOKEN_CACHE_PREFIX = 'dh_push_token_public_';

const getPushTokenCacheKey = (
  role: 'doctor' | 'secretary' | 'public',
  targetId: string
): string => {
  const normalizedTargetId = String(targetId || '').trim();
  let prefix = DOCTOR_PUSH_TOKEN_CACHE_PREFIX;
  if (role === 'secretary') prefix = SECRETARY_PUSH_TOKEN_CACHE_PREFIX;
  if (role === 'public') prefix = PUBLIC_PUSH_TOKEN_CACHE_PREFIX;
  return `${prefix}${normalizedTargetId}`;
};

export const readCachedPushToken = (
  role: 'doctor' | 'secretary' | 'public',
  targetId: string
): string => {
  // نحافظ على العقد الحالي بإرجاع '' (وليس null) عند الفشل
  return safeLsGet(getPushTokenCacheKey(role, targetId)) || '';
};

export const cachePushToken = (
  role: 'doctor' | 'secretary' | 'public',
  targetId: string,
  token: string
): void => {
  const normalizedToken = String(token || '').trim();
  if (!normalizedToken) return;
  safeLsSet(getPushTokenCacheKey(role, targetId), normalizedToken);
};

export const clearCachedPushToken = (
  role: 'doctor' | 'secretary' | 'public',
  targetId: string
): void => {
  safeLsRemove(getPushTokenCacheKey(role, targetId));
};
