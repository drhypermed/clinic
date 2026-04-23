/**
 * إدارة إعدادات الحساب (Account Type Controls Manager)
 * هذا الملف مسؤول عن جلب وتحديث إعدادات الحساب (Free/Pro) من السيرفر:
 * 1. جلب الإعدادات من Firestore مباشرة لسرعة القراءة.
 * 2. توفير آلية بديلة (Fallback) عبر Cloud Functions إذا فشلت القراءة المباشرة.
 * 3. تحديث الإعدادات من قبل المسؤولين (Admins) مع تسجيل بيانات التعديل.
 */

import { httpsCallable } from 'firebase/functions';
import { doc, setDoc } from 'firebase/firestore';
import { getDocCacheFirst } from '../firestore/cacheFirst';
import { auth, db, functions } from '../firebaseConfig';
import { ACCOUNT_TYPE_CONTROL_DOC_ID, DEFAULT_CONTROLS } from './defaults';
import { callWithAuthRetry, ensureAuthenticatedUser, mapCallableError } from './auth';
import { normalizeControls } from './normalize';
import type { AccountTypeControls } from '../../types';

/** المرجع لملف الإعدادات في Firestore */
const getControlsDocRef = () => doc(db, 'settings', ACCOUNT_TYPE_CONTROL_DOC_ID);

/** محاولة جلب الإعدادات من Firestore مباشرة مع كاش أولاً */
const getControlsFromFirestore = async (): Promise<AccountTypeControls | null> => {
  const snap = await getDocCacheFirst(getControlsDocRef());
  if (!snap.exists()) return null;
  return normalizeControls(snap.data() || {});
};

/** 
 * جلب إعدادات التحكم في الحساب. 
 * يحاول القراءة من Firestore أولاً، ثم ينتقل لطلبها من السيرفر (Callable Function).
 */
export const getAccountTypeControls = async (): Promise<AccountTypeControls> => {
  try {
    const direct = await getControlsFromFirestore();
    if (direct) return direct;
  } catch {
    // فشل القراءة المباشرة، سنحاول عبر الـ Cloud Function
  }

  try {
    const callable = httpsCallable(functions, 'getAccountTypeControls');
    const result = await callWithAuthRetry(() => callable());
    return normalizeControls((result.data || {}) as Record<string, unknown>);
  } catch (error: unknown) {
    return mapCallableError(error);
  }
};

/** 
 * تحديث إعدادات التحكم في الحساب (للمسؤولين فقط).
 * يقوم بدمج التعديلات الجديدة مع الإعدادات الحالية وحفظها.
 */
export const updateAccountTypeControls = async (payload: Partial<AccountTypeControls>): Promise<AccountTypeControls> => {
  await ensureAuthenticatedUser();

  let baseConfig = DEFAULT_CONTROLS;
  try {
    const direct = await getControlsFromFirestore();
    if (direct) baseConfig = direct;
  } catch {
    // في حال تعذر الجلب، نستخدم القيم الافتراضية كأساس
  }

  const mergedConfig = normalizeControls({ ...baseConfig, ...(payload || {}) });

  try {
    // محاولة الحفظ المباشر في Firestore
    await setDoc(
      getControlsDocRef(),
      {
        ...mergedConfig,
        updatedAt: new Date().toISOString(),
        updatedBy: auth.currentUser?.email || auth.currentUser?.uid || 'admin',
      },
      { merge: true }
    );
    return mergedConfig;
  } catch {
    // إذا فشل الحفظ المباشر (بسبب الصلاحيات مثلاً)، نحاول عبر السيرفر
  }

  try {
    const callable = httpsCallable(functions, 'updateAccountTypeControls');
    const result = await callWithAuthRetry(() => callable(payload));
    const config = (result.data as { config?: Partial<AccountTypeControls> } | null)?.config || payload;
    return normalizeControls(config);
  } catch (error: unknown) {
    return mapCallableError(error);
  }
};
