/**
 * secretConfig.settings — إدارة إعدادات حجز السكرتارية
 *
 * يحتوي على القراءة والكتابة الأساسية لإعدادات الـ booking:
 *   - `getBookingConfigByUserId` : جلب الإعدادات من مستند المستخدم.
 *   - `saveBookingCredentials`   : الحفظ الأولي عند إنشاء bookingConfig.
 *   - `getBookingConfig`         : قراءة مستند bookingConfig.
 *   - `setBookingSecretaryVitalsVisibility`: تحديث visibility + fields فقط.
 *   - `setSecretarySessionToken` : تحديث token جلسة السكرتارية.
 *
 * تم فصل الوظائف الكبيرة إلى ملفات فرعية:
 *   - `secretConfig.settings.loginTargets.ts`  : البحث عن هدف دخول.
 *   - `secretConfig.settings.updateBooking.ts` : تحديث شامل + password hash.
 */

import type { BookingConfigView, SecretaryLoginTarget } from './types';
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getDocCacheFirst } from '../cacheFirst';
import { db } from '../../firebaseConfig';
import { normalizeBookingSecret, normalizeEmail, sanitizeDocSegment, toOptionalText } from './helpers';
import { getOrCreateBookingUrlSlug, getOrCreatePublicUrlSlug } from './slugs';
import { hashPassword } from '../../../utils/bookingAuth';
import type {
  SecretaryVitalFieldDefinition,
  SecretaryVitalsVisibility,
} from '../../../app/drug-catalog/types';
import {
  normalizeSecretaryVitalFieldDefinitions,
  normalizeSecretaryVitalsVisibility,
} from '../../../utils/secretaryVitals';
import {
  getSecretaryAuthRef,
  readSecretaryAuthBySecret,
  updateLegacyBookingConfigCleanup,
} from './secretaryAuthStorage';
import {
  getSecretaryLoginTargetByDoctorEmail as _getSecretaryLoginTargetByDoctorEmail,
  getSecretaryLoginTargetByUserEmail as _getSecretaryLoginTargetByUserEmail,
} from './secretConfig.settings.loginTargets';
import { updateBookingSettings as _updateBookingSettings } from './secretConfig.settings.updateBooking';

/** مفتاح الفرع لخرائط الـ per-branch (undefined => 'main') */
const resolveBranchMapKey = (branchId?: string): string =>
  !branchId || branchId === 'main' ? 'main' : branchId;

/**
 * يقرأ إعدادات العلامات الحيوية للفرع المطلوب من حقول map الجديدة،
 * مع fallback للقيم العامة (legacy top-level) للتوافق الرجعي.
 */
const pickPerBranchVitalsSettings = (
  source: Record<string, unknown> | undefined,
  branchId?: string
): {
  visibility?: SecretaryVitalsVisibility;
  fields?: SecretaryVitalFieldDefinition[];
} => {
  const result: {
    visibility?: SecretaryVitalsVisibility;
    fields?: SecretaryVitalFieldDefinition[];
  } = {};
  if (!source || typeof source !== 'object') return result;

  const branchKey = resolveBranchMapKey(branchId);
  const visibilityMap = source.secretaryVitalsVisibilityByBranch as
    | Record<string, unknown>
    | undefined;
  const fieldsMap = source.secretaryVitalFieldsByBranch as
    | Record<string, unknown>
    | undefined;

  const mapVisibility =
    visibilityMap && typeof visibilityMap === 'object'
      ? (visibilityMap as Record<string, unknown>)[branchKey]
      : undefined;
  const mapFields =
    fieldsMap && typeof fieldsMap === 'object'
      ? (fieldsMap as Record<string, unknown>)[branchKey]
      : undefined;

  if (mapVisibility && typeof mapVisibility === 'object') {
    result.visibility = normalizeSecretaryVitalsVisibility(
      mapVisibility as SecretaryVitalsVisibility
    );
  } else if (source.secretaryVitalsVisibility && typeof source.secretaryVitalsVisibility === 'object') {
    result.visibility = normalizeSecretaryVitalsVisibility(
      source.secretaryVitalsVisibility as SecretaryVitalsVisibility
    );
  }

  if (Array.isArray(mapFields)) {
    result.fields = normalizeSecretaryVitalFieldDefinitions(
      mapFields as SecretaryVitalFieldDefinition[]
    );
  } else if (Array.isArray(source.secretaryVitalFields)) {
    result.fields = normalizeSecretaryVitalFieldDefinitions(
      source.secretaryVitalFields as SecretaryVitalFieldDefinition[]
    );
  }

  return result;
};

const getSecretaryLoginIndexRef = (doctorEmail: string) => {
  const normalizedEmail = normalizeEmail(doctorEmail);
  const docId = sanitizeDocSegment(normalizedEmail);
  if (!docId) return null;
  return doc(db, 'secretaryLoginIndex', docId);
};

const upsertSecretaryLoginIndex = async (
  doctorEmail: string,
  userId: string,
  hasPasswordHash: boolean
): Promise<void> => {
  const indexRef = getSecretaryLoginIndexRef(doctorEmail);
  const normalizedUserId = sanitizeDocSegment(userId);
  const normalizedEmail = normalizeEmail(doctorEmail);

  if (!indexRef || !normalizedUserId || !normalizedEmail) return;

  await setDoc(
    indexRef,
    {
      doctorEmail: normalizedEmail,
      userId: normalizedUserId,
      secret: deleteField(),
      hasPasswordHash,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
};

export const getBookingConfigByUserId = async (
  userId: string,
  branchId?: string,
): Promise<{
  formTitle?: string;
  secretaryPasswordHash?: string;
  secretaryPasswordPlain?: string;
  secretaryVitalsVisibility?: SecretaryVitalsVisibility;
  secretaryVitalFields?: SecretaryVitalFieldDefinition[];
} | null> => {
  const normalizedUserId = sanitizeDocSegment(userId);
  if (!normalizedUserId) return null;

  const userRef = doc(db, 'users', normalizedUserId);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data();

  const formTitle = toOptionalText(userData?.bookingFormTitle);
  const perBranch = pickPerBranchVitalsSettings(userData, branchId);
  const secretaryVitalsVisibility = perBranch.visibility;
  const secretaryVitalFields = perBranch.fields;
  const branchKey = resolveBranchMapKey(branchId);
  const plainMap = userData?.secretaryPasswordPlainByBranch;
  const secretaryPasswordPlain =
    plainMap && typeof plainMap === 'object' && typeof (plainMap as Record<string, unknown>)[branchKey] === 'string'
      ? String((plainMap as Record<string, unknown>)[branchKey]).trim()
      : undefined;
  const doctorEmailValue = normalizeEmail(userData?.doctorEmail);
  const bookingSecretValue = normalizeBookingSecret(userData?.bookingSecret);
  const legacySecretaryPassword =
    typeof userData?.secretaryPassword === 'string' ? userData.secretaryPassword.trim() : '';
  let secretaryPasswordHash =
    typeof userData?.secretaryPasswordHash === 'string' ? userData.secretaryPasswordHash : undefined;

  const authData = bookingSecretValue ? await readSecretaryAuthBySecret(bookingSecretValue) : {};
  if (!secretaryPasswordHash && typeof authData.secretaryPasswordHash === 'string') {
    secretaryPasswordHash = authData.secretaryPasswordHash;
  }

  // Migration وحيد: لو فيه legacy plain password ومفيش hash → نهاجم لمره واحده.
  // الـcondition `!secretaryPasswordHash && legacySecretaryPassword` بيضمن ما يتنفّذش غير مره أولى.
  if (!secretaryPasswordHash && legacySecretaryPassword) {
    try {
      secretaryPasswordHash = await hashPassword(legacySecretaryPassword);
      await setDoc(
        userRef,
        {
          secretaryPasswordHash,
          secretaryPassword: deleteField(),
        },
        { merge: true }
      );

      if (bookingSecretValue) {
        await setDoc(
          getSecretaryAuthRef(bookingSecretValue),
          {
            userId: normalizedUserId,
            doctorEmail: doctorEmailValue || deleteField(),
            secretaryPasswordHash,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        await updateLegacyBookingConfigCleanup(bookingSecretValue, {
          secretaryAuthRequired: true,
        });
        // الـindex بيتحدّث هنا فقط لأن الـhash اتغير فعلاً (migration حصل).
        if (doctorEmailValue) {
          await upsertSecretaryLoginIndex(doctorEmailValue, normalizedUserId, true).catch(() => undefined);
        }
      }
    } catch (error) {
      console.warn('[Firestore] Failed migrating legacy secretary password to hash:', error);
    }
  }

  // ملاحظه: شيلنا الـunconditional sync (updateLegacyBookingConfigCleanup + upsertSecretaryLoginIndex)
  // اللي كان بيشتغل على كل قراءه. كان bug تكلفه: 2 writes زائده على كل getBookingConfigByUserId.
  // الـsync دلوقت مسؤولية save functions (saveBookingCredentials / updateBookingSettings) فقط.

  return { formTitle, secretaryPasswordHash, secretaryPasswordPlain, secretaryVitalsVisibility, secretaryVitalFields };
};

export const saveBookingCredentials = async (
  userId: string,
  secret: string,
  formTitle?: string,
  doctorDisplayName?: string,
  doctorEmail?: string,
  branchId?: string,
): Promise<void> => {
  const normalizedUserId = sanitizeDocSegment(userId);
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedUserId || !normalizedSecret) return;

  const userRef = doc(db, 'users', normalizedUserId);
  const userSnap = await getDoc(userRef);
  const existingUserData = userSnap.data();
  const existingSecretaryVitalsVisibility =
    existingUserData?.secretaryVitalsVisibility && typeof existingUserData.secretaryVitalsVisibility === 'object'
      ? normalizeSecretaryVitalsVisibility(existingUserData.secretaryVitalsVisibility)
      : undefined;
  const existingSecretaryVitalFields = Array.isArray(existingUserData?.secretaryVitalFields)
    ? normalizeSecretaryVitalFieldDefinitions(existingUserData.secretaryVitalFields)
    : undefined;
  const formTitleVal = toOptionalText(formTitle) || '';
  const doctorDisplayNameVal = toOptionalText(doctorDisplayName) || '';
  const doctorEmailValue = normalizeEmail(doctorEmail);

  const bookingSlug = await getOrCreateBookingUrlSlug(normalizedUserId);
  const publicSlug = await getOrCreatePublicUrlSlug(normalizedUserId);

  const isNonMainBranch = branchId && branchId !== 'main';

  await setDoc(
    userRef,
    {
      // فقط الفرع الرئيسي يكتب على bookingSecret العام
      ...(isNonMainBranch ? {} : { bookingSecret: normalizedSecret }),
      bookingFormTitle: formTitleVal,
      bookingUrlSlug: bookingSlug,
      publicUrlSlug: publicSlug,
      doctorEmail: doctorEmailValue || deleteField(),
      ...(existingSecretaryVitalsVisibility
        ? { secretaryVitalsVisibility: existingSecretaryVitalsVisibility }
        : {}),
      ...(existingSecretaryVitalFields
        ? { secretaryVitalFields: existingSecretaryVitalFields }
        : {}),
    },
    { merge: true }
  );

  // ملاحظة: تم إيقاف حذف الـ configs القديمة لأن كل فرع ليه config مستقل.

  const authData = await readSecretaryAuthBySecret(normalizedSecret);
  await setDoc(
    doc(db, 'bookingConfig', normalizedSecret),
    {
      userId: normalizedUserId,
      doctorDisplayName: doctorDisplayNameVal,
      formTitle: formTitleVal,
      doctorEmail: doctorEmailValue || deleteField(),
      username: null,
      passwordHash: null,
      secretaryAuthRequired: Boolean(authData.secretaryPasswordHash),
      secretaryPasswordHash: deleteField(),
      secretarySessionToken: deleteField(),
      secretarySessionTokenUpdatedAt: deleteField(),
      secretaryPassword: deleteField(),
      ...(existingSecretaryVitalsVisibility
        ? { secretaryVitalsVisibility: existingSecretaryVitalsVisibility }
        : {}),
      ...(existingSecretaryVitalFields
        ? { secretaryVitalFields: existingSecretaryVitalFields }
        : {}),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  await setDoc(
    getSecretaryAuthRef(normalizedSecret),
    {
      userId: normalizedUserId,
      doctorEmail: doctorEmailValue || deleteField(),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  // الفرع الرئيسي بس يحدث فهرس الدخول — الفروع التانية بتستخدم الرابط مباشرة
  if (doctorEmailValue && !isNonMainBranch) {
    try {
      await upsertSecretaryLoginIndex(
        doctorEmailValue,
        normalizedUserId,
        Boolean(authData.secretaryPasswordHash)
      );
    } catch (error) {
      console.warn('[Firestore] Failed to sync secretary login index after saveBookingCredentials:', error);
    }
  }
};

export const getBookingConfig = async (
  secret: string,
  branchId?: string,
): Promise<BookingConfigView | null> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedSecret) return null;

  const configRef = doc(db, 'bookingConfig', normalizedSecret);
  const snap = await getDocCacheFirst(configRef);
  if (!snap.exists()) return null;

  const data = snap.data();
  if (typeof data?.userId !== 'string') return null;

  const perBranch = pickPerBranchVitalsSettings(data, branchId);
  const secretaryVitalsVisibility = perBranch.visibility;
  const secretaryVitalFields = perBranch.fields;
  const secretaryVitalsVisibilityByBranch =
    data?.secretaryVitalsVisibilityByBranch && typeof data.secretaryVitalsVisibilityByBranch === 'object'
      ? (data.secretaryVitalsVisibilityByBranch as Record<string, SecretaryVitalsVisibility>)
      : undefined;
  const secretaryVitalFieldsByBranch =
    data?.secretaryVitalFieldsByBranch && typeof data.secretaryVitalFieldsByBranch === 'object'
      ? (data.secretaryVitalFieldsByBranch as Record<string, SecretaryVitalFieldDefinition[]>)
      : undefined;

  return {
    userId: data.userId,
    username: typeof data?.username === 'string' ? data.username : undefined,
    passwordHash: typeof data?.passwordHash === 'string' ? data.passwordHash : undefined,
    doctorDisplayName: toOptionalText(data?.doctorDisplayName),
    formTitle: toOptionalText(data?.formTitle),
    doctorEmail: typeof data?.doctorEmail === 'string' ? normalizeEmail(data.doctorEmail) : undefined,
    secretaryAuthRequired: Boolean(data?.secretaryAuthRequired),
    secretaryVitalsVisibility,
    secretaryVitalFields,
    secretaryVitalsVisibilityByBranch,
    secretaryVitalFieldsByBranch,
  };
};

// Re-export من login targets file (يحتاج تمرير getBookingConfig للثاني)
export const getSecretaryLoginTargetByDoctorEmail = _getSecretaryLoginTargetByDoctorEmail;

export const getSecretaryLoginTargetByUserEmail = async (
  email: string
): Promise<SecretaryLoginTarget | null> =>
  _getSecretaryLoginTargetByUserEmail(email, getBookingConfig);

// updateBookingSettings — مُوَجَّه إلى الملف الفرعي مع تمرير upsertSecretaryLoginIndex
export const updateBookingSettings = async (
  userId: string,
  secret: string,
  formTitle: string,
  doctorDisplayName: string,
  secretaryPassword?: string,
  doctorEmail?: string,
  secretaryVitalsVisibility?: SecretaryVitalsVisibility,
  secretaryVitalFields?: SecretaryVitalFieldDefinition[],
  branchId?: string,
): Promise<void> => {
  return _updateBookingSettings(
    userId,
    secret,
    formTitle,
    doctorDisplayName,
    secretaryPassword,
    doctorEmail,
    secretaryVitalsVisibility,
    secretaryVitalFields,
    upsertSecretaryLoginIndex,
    branchId,
  );
};

export const setBookingSecretaryVitalsVisibility = async (
  userId: string,
  secret: string,
  secretaryVitalsVisibility: SecretaryVitalsVisibility,
  secretaryVitalFields?: SecretaryVitalFieldDefinition[],
  branchId?: string,
): Promise<void> => {
  const normalizedUserId = sanitizeDocSegment(userId);
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedUserId || !normalizedSecret) return;

  const normalizedVisibility = normalizeSecretaryVitalsVisibility(secretaryVitalsVisibility);
  const normalizedFields = Array.isArray(secretaryVitalFields)
    ? normalizeSecretaryVitalFieldDefinitions(secretaryVitalFields)
    : undefined;
  const nowIso = new Date().toISOString();

  const branchKey = resolveBranchMapKey(branchId);
  const isMain = branchKey === 'main';

  // الكتابة per-branch في حقل map مخصص بالفرع. للفرع الرئيسي نكتب كذلك على الحقول
  // العامة (legacy top-level) لضمان عمل القرّاء التاريخيين (unscoped readers).
  // نستخدم nested objects بدلاً من dotted paths لأن setDoc({merge:true}) يعاملها كمفاتيح حرفية.
  // مع merge=true، كتابة map فرعية (مثلاً { main: ... }) تدمج مع الحقول الحالية للمستند
  // لكنها تستبدل المحتوى الكامل للخريطة الفرعية. لحل هذه المشكلة نستخدم updateDoc مع dotted
  // paths للحفاظ على بقية المفاتيح داخل map الفرع.
  const userRef = doc(db, 'users', normalizedUserId);
  const configRef = doc(db, 'bookingConfig', normalizedSecret);

  const userTop: Record<string, unknown> = {
    bookingSecret: normalizedSecret,
    updatedAt: nowIso,
  };
  if (isMain) {
    userTop.secretaryVitalsVisibility = normalizedVisibility;
    if (normalizedFields) userTop.secretaryVitalFields = normalizedFields;
  }

  const configTop: Record<string, unknown> = {
    userId: normalizedUserId,
    updatedAt: nowIso,
  };
  if (isMain) {
    configTop.secretaryVitalsVisibility = normalizedVisibility;
    if (normalizedFields) configTop.secretaryVitalFields = normalizedFields;
  }

  // updateDoc يدعم dot-paths بشكل صحيح: يحدّث المفتاح الفرعي داخل الـ map بدون مسح الباقي.
  // نتجنّب فشل updateDoc لو المستند غير موجود بإنشاء الحقول الأساسية عبر setDoc أولاً.
  await Promise.all([
    setDoc(userRef, userTop, { merge: true }),
    setDoc(configRef, configTop, { merge: true }),
  ]);

  const userMapUpdates: Record<string, unknown> = {
    [`secretaryVitalsVisibilityByBranch.${branchKey}`]: normalizedVisibility,
  };
  if (normalizedFields) {
    userMapUpdates[`secretaryVitalFieldsByBranch.${branchKey}`] = normalizedFields;
  }
  const configMapUpdates: Record<string, unknown> = {
    [`secretaryVitalsVisibilityByBranch.${branchKey}`]: normalizedVisibility,
  };
  if (normalizedFields) {
    configMapUpdates[`secretaryVitalFieldsByBranch.${branchKey}`] = normalizedFields;
  }

  await Promise.all([
    updateDoc(userRef, userMapUpdates),
    updateDoc(configRef, configMapUpdates),
  ]);
};

export const setSecretarySessionToken = async (
  secret: string,
  sessionToken: string
): Promise<void> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedSecret || !sessionToken) return;

  await setDoc(
    getSecretaryAuthRef(normalizedSecret),
    {
      secretarySessionToken: sessionToken,
      secretarySessionTokenUpdatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
};
