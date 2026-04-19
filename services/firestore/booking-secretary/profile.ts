/**
 * ملف السكرتارية (Secretary Profile Service)
 * هذا الملف مسؤول عن إدارة البيانات الشخصية للسكرتير:
 * 1. جلب اسم السكرتير المخزن.
 * 2. تحديث بيانات الملف الشخصي.
 * 3. الاشتراك في التحديثات اللحظية (Subscription) لضمان مزامنة الاسم عبر الأجهزة.
 */

import { doc, setDoc } from 'firebase/firestore';
import { getDocCacheFirst } from '../cacheFirst';
import { db } from '../../firebaseConfig';
import { normalizeBookingSecret, toOptionalText } from './helpers';
import { SecretaryProfile } from '../../../types';

/** جلب الملف الشخصي للسكرتير باستخدام الرمز السري للعيادة */
export const getSecretaryProfile = async (secret: string): Promise<SecretaryProfile | null> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedSecret) return null;

  const profileRef = doc(db, 'secretaryProfiles', normalizedSecret);
  const snap = await getDocCacheFirst(profileRef);
  if (!snap.exists()) return null;

  const data = snap.data();
  return {
    name: toOptionalText(data?.name),
  };
};

/** حفظ أو تحديث اسم السكرتير في قاعدة البيانات */
export const saveSecretaryProfile = async (
  secret: string,
  payload: { name?: string }
): Promise<void> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedSecret) return;

  const profileRef = doc(db, 'secretaryProfiles', normalizedSecret);
  const normalizedName = toOptionalText(payload?.name);

  await setDoc(
    profileRef,
    {
      name: normalizedName ?? null,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
};

/**
 * الاشتراك في تغييرات ملف السكرتير مع (Smart Cache).
 * يضمن ظهور اسم السكرتير فوراً من الكاش ثم تحديثه لحظياً من السيرفر.
 */
export const subscribeToSecretaryProfile = (
  secret: string,
  onUpdate: (data: SecretaryProfile) => void,
  onError?: (error: unknown) => void
) => {
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedSecret) {
    onUpdate({});
    return () => undefined;
  }

  const profileRef = doc(db, 'secretaryProfiles', normalizedSecret);
  let cancelled = false;

  getDocCacheFirst(profileRef).then((snap) => {
    if (cancelled) return;
    if (!snap.exists()) {
      onUpdate({});
      return;
    }
    const data = snap.data();
    onUpdate({
      name: toOptionalText(data?.name),
    });
  }).catch((error) => {
    if (cancelled) return;
    const code = String((error as { code?: unknown })?.code || '');
    if (code !== 'permission-denied') {
      console.error('[Firestore] Error reading secretary profile:', error);
    }
    if (onError) onError(error);
  });

  return () => { cancelled = true; };
};

