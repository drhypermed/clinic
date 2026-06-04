/**
 * إدارة إعدادات ورموز الحجز العام (Public Booking Secret & Config)
 * هذا الملف مسؤول عن:
 * 1. توليد "رمز سري" (Secret Key) فريد لكل عيادة لمشاركة رابط الحجز.
 * 2. ربط الرموز السرية ببيانات الطبيب (UserId) في Firestore.
 * 3. تخزين ومزامنة الرمز السري محلياً (LocalStorage) وعالمياً (Firestore).
 * 4. إدارة إعدادات نموذج الحجز (العنوان، معلومات التواصل).
 */

import {
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { getDocCacheFirst, getDocsCacheFirst } from '../cacheFirst';
import {
  createPublicBookingSecret,
  normalizePublicSecret,
  readLocalStorageSafe,
  sanitizeDocSegment,
  toOptionalText,
  writeLocalStorageSafe,
} from './helpers';

/** تحويل القيمة المعطاة إلى طابع زمني بالميلي ثانية */
const toTimestampMs = (value: unknown): number => {
  const t = new Date(String(value || '')).getTime();
  return Number.isFinite(t) ? t : 0;
};

/** تنظيف أكواد أخطاء Firestore لتكون سهلة القراءة في المنطق البرمجي */
const normalizeFirestoreErrorCode = (error: unknown): string =>
  String((error as { code?: unknown })?.code || '')
    .trim()
    .toLowerCase()
    .replace(/^firebase\//, '')
    .replace(/^firestore\//, '');

/** التحقق مما إذا كان الخطأ ناتجاً عن نقص الصلاحيات */
const isPermissionDeniedError = (error: unknown): boolean => {
  const code = normalizeFirestoreErrorCode(error);
  if (code === 'permission-denied' || code === 'insufficient-permission') return true;
  const message = String((error as { message?: unknown })?.message || '').toLowerCase();
  return message.includes('missing or insufficient permissions');
};

/** هيكل بيانات إعدادات الحجز العام */
interface PublicBookingConfigData {
  userId: string;
  title?: string;
  contactInfo?: string;
  publicFormSettingsByBranch?: Record<string, PublicBranchFormSettings>;
  doctorDisplayName?: string;
  doctorProfileImage?: string;
  // لو true: الفورم يطلب تسجيل دخول بحساب Google قبل تأكيد الحجز.
  // الفائدة: حماية ضد الحجوزات الوهمية لما الطبيب ينشر الرابط على منصات عامة.
  // الإعداد ده موحّد بدلاً من نظام "entry=public-site" القديم اللي كان يتحكّم فيه
  // مصدر الرابط (الديركتوري vs الرابط المباشر) — دلوقتي الطبيب نفسه يقرر.
  requireGoogleSignIn?: boolean;
}

type PublicBranchFormSettings = {
  title?: string;
  contactInfo?: string;
};

const MAIN_BRANCH_ID = 'main';

const normalizeBranchId = (branchId?: string): string => {
  const normalized = sanitizeDocSegment(branchId || MAIN_BRANCH_ID);
  return normalized || MAIN_BRANCH_ID;
};

const sanitizeBranchFormSettings = (raw: unknown): PublicBranchFormSettings => {
  if (!raw || typeof raw !== 'object') return {};
  const item = raw as { title?: unknown; contactInfo?: unknown };
  return {
    title: toOptionalText(item.title) || '',
    contactInfo: toOptionalText(item.contactInfo) || '',
  };
};

const sanitizeBranchFormSettingsMap = (raw: unknown): Record<string, PublicBranchFormSettings> => {
  if (!raw || typeof raw !== 'object') return {};
  const result: Record<string, PublicBranchFormSettings> = {};
  Object.entries(raw as Record<string, unknown>).forEach(([key, value]) => {
    const branchId = normalizeBranchId(key);
    result[branchId] = sanitizeBranchFormSettings(value);
  });
  return result;
};

export interface PublicBookingLookupData {
  publicBookingSecret?: string;
  publicUrlSlug?: string;
}

const readPublicBookingLookup = async (userId: string): Promise<PublicBookingLookupData | null> => {
  const normalizedUserId = sanitizeDocSegment(userId);
  if (!normalizedUserId) return null;

  const lookupRef = doc(db, 'publicBookingLookup', normalizedUserId);
  const snap = await getDocCacheFirst(lookupRef);
  if (!snap.exists()) return null;

  const data = snap.data();
  const publicBookingSecret = normalizePublicSecret(data?.publicBookingSecret);
  const publicUrlSlug = toOptionalText(data?.publicUrlSlug);
  if (!publicBookingSecret && !publicUrlSlug) return null;

  return {
    publicBookingSecret: publicBookingSecret || undefined,
    publicUrlSlug,
  };
};

const persistPublicBookingLookup = async (
  userId: string,
  values: PublicBookingLookupData
): Promise<void> => {
  const normalizedUserId = sanitizeDocSegment(userId);
  if (!normalizedUserId) return;

  const publicBookingSecret = normalizePublicSecret(values.publicBookingSecret);
  const publicUrlSlug = toOptionalText(values.publicUrlSlug);
  if (!publicBookingSecret && !publicUrlSlug) return;

  const payload: Record<string, unknown> = {
    userId: normalizedUserId,
    updatedAt: new Date().toISOString(),
  };
  if (publicBookingSecret) payload.publicBookingSecret = publicBookingSecret;
  if (publicUrlSlug) payload.publicUrlSlug = publicUrlSlug;

  try {
    await setDoc(doc(db, 'publicBookingLookup', normalizedUserId), payload, { merge: true });
  } catch (error) {
    console.warn('[Firestore] Failed to persist public booking lookup:', error);
  }
};

export const getPublicBookingLookupByUserId = async (
  userId: string
): Promise<PublicBookingLookupData | null> => {
  try {
    return await readPublicBookingLookup(userId);
  } catch (error) {
    if (!isPermissionDeniedError(error)) {
      console.warn('[Firestore] Failed to read public booking lookup:', error);
    }
    return null;
  }
};

/** 
 * التأكد من وجود ربط بين الـ UserId والـ Secret في Firestore.
 * يقوم أيضاً بحذف أي رموز قديمة (Stale) مرتبطة بنفس المستخدم لضمان وجود رمز فعال واحد فقط.
 */
export const ensurePublicBookingConfig = async (
  userId: string,
  activeSecret: string
): Promise<void> => {
  const normalizedUserId = sanitizeDocSegment(userId);
  const normalizedSecret = normalizePublicSecret(activeSecret);
  if (!normalizedUserId || !normalizedSecret) return;

  const configRef = doc(db, 'publicBookingConfig', normalizedSecret);
  const payload: Record<string, unknown> = {
    userId: normalizedUserId,
    updatedAt: new Date().toISOString(),
  };

  try {
    const userSnap = await getDocCacheFirst(doc(db, 'users', normalizedUserId));
    const userData = userSnap.exists() ? userSnap.data() : null;
    const doctorDisplayName = toOptionalText(userData?.doctorName || userData?.displayName || userData?.name);
    const doctorProfileImage = toOptionalText(userData?.profileImage || userData?.photoURL);
    if (doctorDisplayName) payload.doctorDisplayName = doctorDisplayName;
    if (doctorProfileImage) payload.doctorProfileImage = doctorProfileImage;
  } catch {
    // Best-effort mirror only. Public readers can still use doctorAds as fallback.
  }

  await setDoc(
    configRef,
    payload,
    { merge: true }
  );
  await persistPublicBookingLookup(normalizedUserId, { publicBookingSecret: normalizedSecret });

  try {
    // تنظيف الرموز القديمة لنفس المستخدم
    const configsRef = collection(db, 'publicBookingConfig');
    const q = query(configsRef, where('userId', '==', normalizedUserId));
    const snapshot = await getDocsCacheFirst(q);
    const deletePromises: Promise<void>[] = [];

    snapshot.forEach((item) => {
      if (item.id !== normalizedSecret) {
        deletePromises.push(deleteDoc(item.ref));
      }
    });

    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
    }
  } catch (error) {
    if (isPermissionDeniedError(error)) {
      return;
    }
    console.warn('[Firestore] Failed to cleanup stale public configs:', error);
  }
};

/** 
 * جلب الرمز السري الحالي للحجز أو إنشاء واحد جديد إذا لم يكن موجوداً.
 * يتبع استراتيجية (Server -> Cache -> LocalStorage) لضمان عدم ضياع التخصيصات.
 */
export const getOrCreatePublicBookingSecret = async (userId: string): Promise<string> => {
  const normalizedUserId = sanitizeDocSegment(userId);
  if (!normalizedUserId) {
    throw new Error('invalid-user-id');
  }

  const localKey = `public_booking_secret_${normalizedUserId}`;
  const userRef = doc(db, 'users', normalizedUserId);

  /** وظيفة مساعدة لاستخدام رمز موجود مع مزامنته */
  const useExistingSecret = async (
    rawSecret: unknown,
    rawPublicUrlSlug?: unknown
  ): Promise<string | null> => {
    const normalizedSecret = normalizePublicSecret(rawSecret);
    if (!normalizedSecret) return null;

    writeLocalStorageSafe(localKey, normalizedSecret);
    await ensurePublicBookingConfig(normalizedUserId, normalizedSecret);
    await persistPublicBookingLookup(normalizedUserId, {
      publicBookingSecret: normalizedSecret,
      publicUrlSlug: toOptionalText(rawPublicUrlSlug),
    });
    return normalizedSecret;
  };

  // 1. المحاولة من السيرفر مباشرة (الأكثر دقة)
  try {
    const snap = await getDocFromServer(userRef);
    const existing = await useExistingSecret(snap.data()?.publicBookingSecret, snap.data()?.publicUrlSlug);
    if (existing) return existing;
  } catch (error) {
    console.warn('[Firestore] Failed to get public secret from server, trying cache/local:', error);
  }

  // 2. المحاولة من الكاش المحلي (في حال عدم وجود اتصال)
  try {
    const snap = await getDocCacheFirst(userRef);
    const existing = await useExistingSecret(snap.data()?.publicBookingSecret, snap.data()?.publicUrlSlug);
    if (existing) return existing;
  } catch (error) {
    console.error('[Firestore] Failed to get public secret from cache:', error);
  }

  // 3. المحاولة من LocalStorage (الملاذ الأخير قبل الإنشاء)
  const cached = normalizePublicSecret(readLocalStorageSafe(localKey));
  if (cached) {
    await setDoc(userRef, { publicBookingSecret: cached }, { merge: true }).catch((error) =>
      console.error('[Firestore] Failed to sync local public secret to server:', error)
    );
    await ensurePublicBookingConfig(normalizedUserId, cached);
    await persistPublicBookingLookup(normalizedUserId, { publicBookingSecret: cached });
    return cached;
  }

  // 4. إنشاء رمز جديد كلياً
  const secret = createPublicBookingSecret();

  try {
    await setDoc(userRef, { publicBookingSecret: secret }, { merge: true });
  } catch (error) {
    console.error('[Firestore] Failed to save new public secret to server:', error);
  }

  writeLocalStorageSafe(localKey, secret);
  await ensurePublicBookingConfig(normalizedUserId, secret);
  await persistPublicBookingLookup(normalizedUserId, { publicBookingSecret: secret });
  return secret;
};

/** جلب بيانات إعدادات نموذج الحجز باستخدام الرمز السري */
export const getPublicBookingConfig = async (
  secret: string
): Promise<PublicBookingConfigData | null> => {
  const normalizedSecret = normalizePublicSecret(secret);
  if (!normalizedSecret) return null;

  const configRef = doc(db, 'publicBookingConfig', normalizedSecret);
  const snap = await getDocCacheFirst(configRef);
  if (!snap.exists()) return null;

  const data = snap.data();
  if (typeof data?.userId !== 'string') return null;

  return {
    userId: data.userId,
    title: toOptionalText(data?.title),
    contactInfo: toOptionalText(data?.contactInfo),
    publicFormSettingsByBranch: sanitizeBranchFormSettingsMap(data?.publicFormSettingsByBranch),
    doctorDisplayName: toOptionalText(data?.doctorDisplayName),
    doctorProfileImage: toOptionalText(data?.doctorProfileImage),
    // قراءة الـ flag من الـ doc — false default لو مش مسجّل (طبيب قديم/جديد ما عدلش الإعداد)
    requireGoogleSignIn: true,
  };
};

/** البحث عن الرمز السري الفعال للطبيب باستخدام الـ UserId (مفيد للإدارة أو الإعدادات) */
export const getPublicSecretByUserId = async (userId: string): Promise<string | null> => {
  const normalizedUserId = sanitizeDocSegment(userId);
  if (!normalizedUserId) return null;

  try {
    const lookup = await getPublicBookingLookupByUserId(normalizedUserId);
    if (lookup?.publicBookingSecret) return lookup.publicBookingSecret;

    const configsRef = collection(db, 'publicBookingConfig');

    // محاولة جلب أحدث رمز مسجل
    try {
      const q = query(
        configsRef,
        where('userId', '==', normalizedUserId),
        orderBy('updatedAt', 'desc'),
        limit(1)
      );
      const snapshot = await getDocsCacheFirst(q);
      if (!snapshot.empty) {
        const candidate = normalizePublicSecret(snapshot.docs[0].id);
        if (candidate) return candidate;
      }
    } catch {
      // الرجوع للمحاولة البسيطة في حال فشل الترتيب (نقص الـ Index)
    }

    const fallbackQuery = query(configsRef, where('userId', '==', normalizedUserId));
    const fallbackSnapshot = await getDocsCacheFirst(fallbackQuery);

    if (!fallbackSnapshot.empty) {
      const docs = fallbackSnapshot.docs
        .map((item) => ({ id: normalizePublicSecret(item.id), data: item.data() as Record<string, unknown> }))
        .filter((item) => Boolean(item.id));

      docs.sort((a, b) => toTimestampMs(b.data.updatedAt) - toTimestampMs(a.data.updatedAt));
      if (docs[0]?.id) return docs[0].id;
    }

    // المحاولة الأخيرة: جلب الرمز المباشر من وثيقة المستخدم
    try {
      const userRef = doc(db, 'users', normalizedUserId);
      const userSnap = await getDocCacheFirst(userRef);
      if (userSnap.exists()) {
        const secret = normalizePublicSecret(userSnap.data()?.publicBookingSecret);
        if (secret) {
          const configRef = doc(db, 'publicBookingConfig', secret);
          await setDoc(
            configRef,
            { userId: normalizedUserId, updatedAt: new Date().toISOString() },
            { merge: true }
          );
          return secret;
        }
      }
    } catch {
      return null;
    }

    return null;
  } catch (error) {
    if (isPermissionDeniedError(error)) {
      return null;
    }
    console.error('[Firestore] Unexpected error getting secret by userId:', error);
    return null;
  }
};

/** حفظ إعدادات شكل نموذج الحجز (العنوان، معلومات العيادة، وحماية جوجل) */
export const savePublicFormSettings = async (
  userId: string,
  secret: string,
  title: string,
  contactInfo: string,
  requireGoogleSignIn: boolean,
  branchId?: string
): Promise<void> => {
  const normalizedUserId = sanitizeDocSegment(userId);
  const normalizedSecret = normalizePublicSecret(secret);
  if (!normalizedUserId || !normalizedSecret) return;

  const branchKey = normalizeBranchId(branchId);
  const titleValue = toOptionalText(title) || '';
  const contactInfoValue = toOptionalText(contactInfo) || '';
  const legacyTopLevel =
    branchKey === MAIN_BRANCH_ID
      ? { title: titleValue, contactInfo: contactInfoValue }
      : {};

  const configRef = doc(db, 'publicBookingConfig', normalizedSecret);
  await setDoc(
    configRef,
    {
      userId: normalizedUserId,
      ...legacyTopLevel,
      publicFormSettingsByBranch: {
        [branchKey]: {
          title: titleValue,
          contactInfo: contactInfoValue,
        },
      },
      // حماية الحجز بجوجل — flag بسيط يتحكّم فيه الطبيب من لوحته
      requireGoogleSignIn: true,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
  await persistPublicBookingLookup(normalizedUserId, { publicBookingSecret: normalizedSecret });
};

export const syncPublicBookingDoctorProfile = async (
  userId: string,
  values: { doctorDisplayName?: string; doctorProfileImage?: string }
): Promise<void> => {
  const normalizedUserId = sanitizeDocSegment(userId);
  if (!normalizedUserId) return;

  const secret = await getPublicSecretByUserId(normalizedUserId);
  const normalizedSecret = normalizePublicSecret(secret);
  if (!normalizedSecret) return;

  await setDoc(
    doc(db, 'publicBookingConfig', normalizedSecret),
    {
      userId: normalizedUserId,
      doctorDisplayName: toOptionalText(values.doctorDisplayName) || '',
      doctorProfileImage: toOptionalText(values.doctorProfileImage) || '',
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
};

/** الاشتراك اللحظي في إعدادات الحجز لمراقبة أي تغييرات من الطبيب */
export const subscribeToPublicConfig = (
  secret: string,
  onUpdate: (config: { userId?: string; title?: string; contactInfo?: string; publicFormSettingsByBranch?: Record<string, PublicBranchFormSettings>; doctorDisplayName?: string; doctorProfileImage?: string; requireGoogleSignIn?: boolean }) => void
) => {
  const normalizedSecret = normalizePublicSecret(secret);
  if (!normalizedSecret) {
    onUpdate({});
    return () => undefined;
  }

  const configRef = doc(db, 'publicBookingConfig', normalizedSecret);

  /** معالجة وتحديث الحالة بالبيانات المجلوبة */
  const handleSnap = (snap: any) => {
    if (!snap.exists()) {
      onUpdate({});
      return;
    }

    const data = snap.data();
    onUpdate({
      userId: typeof data.userId === 'string' ? data.userId : undefined,
      title: toOptionalText(data.title),
      contactInfo: toOptionalText(data.contactInfo),
      publicFormSettingsByBranch: sanitizeBranchFormSettingsMap(data.publicFormSettingsByBranch),
      doctorDisplayName: toOptionalText(data.doctorDisplayName),
      doctorProfileImage: toOptionalText(data.doctorProfileImage),
      requireGoogleSignIn: true,
    });
  };

  // 1. المحاولة الأولى: جلب الإعدادات من الكاش للتحميل اللحظي (0ms) للمريض
  getDocCacheFirst(configRef).then(snap => {
    if (snap.exists()) handleSnap(snap);
  }).catch(() => {});

  // 2. المحاولة الثانية: الاشتراك في التحديثات الحية من السيرفر
  return onSnapshot(configRef, handleSnap);
};
