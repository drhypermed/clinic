/**
 * تنبيهات الدخول والموافقة (Entry Alerts & Approvals)
 * هذا الملف مسؤول عن التنسيق بين الطبيب والسكرتارية عند محاولة السكرتير الدخول لبيانات مريض:
 * 1. إرسال تنبيه للطبيب (Entry Alert) بطلب دخول السكرتير.
 * 2. استقبال رد الطبيب (موافقة/رفض).
 * 3. تتبع المعرفات المعتمدة (Approved Entry IDs) التي سُمح للسكرتير بالدخول إليها.
 *
 * بعد التقسيم:
 *   - `entryAlerts.helpers.ts`     : ثوابت + normalizeBranchId + buildApprovedIdsPayload المشترك.
 *   - `entryAlerts.subscribers.ts` : اشتراكات onSnapshot + clearSecretaryEntryAlertResponse.
 *   - هذا الملف: دوال الكتابة (setEntryAlert / respond / addApprovedEntryId).
 */

import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { normalizeBookingSecret, sanitizeDocSegment, toOptionalText } from './helpers';
import {
  ApprovedIdsBookingConfigPayload,
  buildApprovedIdsPayload,
  normalizeBranchId,
} from './entryAlerts.helpers';

// إعادة تصدير الـ subscribers والـ clear لتجنّب كسر أي imports سابقة للملف
export {
  subscribeToSecretaryEntryAlertResponse,
  subscribeToSecretaryApprovedEntryIds,
  clearSecretaryEntryAlertResponse,
} from './entryAlerts.subscribers';

/**
 * إرسال طلب دخول من السكرتير للطبيب.
 * يتم تخزينه في إعدادات الحجز (Booking Config) ليظهر كتنبيه فوري لدى الطبيب.
 * يقبل branchId لعزل الطلبات بين الفروع — طلب فرع 1 ما يشترشش مع طلب فرع 2.
 */
export const setEntryAlert = async (
  secret: string,
  caseName: string,
  appointmentId: string,
  branchId?: string,
): Promise<void> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  const normalizedAppointmentId = sanitizeDocSegment(appointmentId);
  if (!normalizedSecret || !normalizedAppointmentId) return;

  const normalizedBranch = normalizeBranchId(branchId);
  const configRef = doc(db, 'bookingConfig', normalizedSecret);
  const alertPayload = {
    caseName: toOptionalText(caseName) || '',
    createdAt: new Date().toISOString(),
    appointmentId: normalizedAppointmentId,
    branchId: normalizedBranch,
  };

  await setDoc(
    configRef,
    {
      // الحقل القديم (للتوافق) — يحمل آخر طلب من أي فرع
      entryAlert: alertPayload,
      entryAlertResponse: null,
      // الحقل الجديد المُقسَّم بالفرع — السكرتيرة تقرأ فرعها فقط
      [`entryAlertByBranch.${normalizedBranch}`]: alertPayload,
    },
    { merge: true },
  );
};

/** تسجيل رد السكرتير (المرسل من الطبيب فعلياً) على طلب الدخول. مقسم بالفرع. */
export const setSecretaryEntryAlertResponse = async (
  secret: string,
  appointmentId: string,
  status: 'approved' | 'rejected',
  branchId?: string,
): Promise<void> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  const normalizedAppointmentId = sanitizeDocSegment(appointmentId);
  if (!normalizedSecret || !normalizedAppointmentId) return;

  const normalizedBranch = normalizeBranchId(branchId);
  const ref = doc(db, 'secretaryEntryAlertResponse', normalizedSecret);
  const payload = {
    status,
    appointmentId: normalizedAppointmentId,
    respondedAt: new Date().toISOString(),
    branchId: normalizedBranch,
  };

  await setDoc(
    ref,
    {
      // الحقل القديم (legacy) — آخر رد لأي فرع
      ...payload,
      // الحقل الجديد المُقسَّم
      [`responsesByBranch.${normalizedBranch}`]: payload,
    },
    { merge: true },
  );
};

/**
 * إضافة معرف الموعد إلى قائمة "المعرفات المعتمدة" للسكرتير — مقسمة بالفرع.
 *
 * يكتب في **مسارين متزامنين** لتوحيد مصدر الحقيقة وضمان انطلاق push notification:
 *   1. `secretaryApprovedEntryIds/{secret}` — المسار التاريخي
 *      (مصدر subscribeToSecretaryApprovedEntryIds)
 *   2. `bookingConfig/{secret}.approvedEntryAppointmentIds*` — يطلق الـ trigger
 *      `notifySecretaryOnBookingConfigUpdate` لإرسال push "الطبيب فتح الكشف"
 *
 * يكتب كذلك حقل `lastExamOpenedAt.{branchId}` كعلامة زمنية فريدة في bookingConfig
 * لضمان أن الـ trigger يكتشف التغيير حتى لو الـ id موجود بالفعل في القائمة.
 */
export const addSecretaryApprovedEntryId = async (
  secret: string,
  appointmentId: string,
  branchId?: string,
): Promise<void> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  const normalizedAppointmentId = sanitizeDocSegment(appointmentId);
  if (!normalizedSecret || !normalizedAppointmentId) return;

  const normalizedBranch = normalizeBranchId(branchId);
  const approvedIdsRef = doc(db, 'secretaryApprovedEntryIds', normalizedSecret);
  const configRef = doc(db, 'bookingConfig', normalizedSecret);

  // بناء الـ payload المشترك (helper مستخرج)
  const built = await buildApprovedIdsPayload(
    approvedIdsRef,
    normalizedAppointmentId,
    normalizedBranch,
  );

  // كتابة متوازية للمصدرين (لا نحتاج transaction — idempotent):
  //   1. الـ collection التاريخي
  //   2. bookingConfig (لإطلاق push trigger)
  await Promise.all([
    setDoc(
      approvedIdsRef,
      {
        ids: built.legacyIds,
        [`idsByBranch.${built.normalizedBranch}`]: built.branchIds,
      },
      { merge: true },
    ),
    setDoc(
      configRef,
      {
        approvedEntryAppointmentIds: built.legacyIds,
        [`approvedEntryAppointmentIdsByBranch.${built.normalizedBranch}`]: built.branchIds,
        // علامة زمنية فريدة لضمان اكتشاف الـ trigger حتى لو الـ id موجود مسبقاً
        // (مثلاً الطبيب فتح الكشف مرة تانية بعد إلغاء)
        [`lastExamOpenedAt.${built.normalizedBranch}`]: built.openedAt,
        [`lastExamOpenedAppointmentId.${built.normalizedBranch}`]: built.normalizedAppointmentId,
      },
      { merge: true },
    ),
  ]);
};

/**
 * **نسخة مخففة من `addSecretaryApprovedEntryId`:**
 * - تكتب **فقط** على `secretaryApprovedEntryIds/{secret}` (الـ collection التاريخي).
 * - لا تكتب على `bookingConfig` — بدلاً من ذلك ترجع الـ payload الجاهز.
 *
 * الغرض: السماح للـ caller بدمج كتابة حقول الموافقة مع حقول أخرى (مثل
 * `doctorEntryResponse`) في **write واحد** على bookingConfig. بذلك
 * الـ Cloud Function trigger ينطلق مرة واحدة فقط، وينشر إشعار واحد فقط.
 *
 * إن كانت الـ inputs غير صالحة يرجع null.
 */
export const writeApprovedEntryIdToCollectionOnly = async (
  secret: string,
  appointmentId: string,
  branchId?: string,
): Promise<ApprovedIdsBookingConfigPayload | null> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  const normalizedAppointmentId = sanitizeDocSegment(appointmentId);
  if (!normalizedSecret || !normalizedAppointmentId) return null;

  const normalizedBranch = normalizeBranchId(branchId);
  const approvedIdsRef = doc(db, 'secretaryApprovedEntryIds', normalizedSecret);

  // بناء الـ payload المشترك (نفس helper المستخدم في addSecretaryApprovedEntryId)
  const built = await buildApprovedIdsPayload(
    approvedIdsRef,
    normalizedAppointmentId,
    normalizedBranch,
  );

  // كتابة فقط على الـ collection التاريخي
  await setDoc(
    approvedIdsRef,
    {
      ids: built.legacyIds,
      [`idsByBranch.${built.normalizedBranch}`]: built.branchIds,
    },
    { merge: true },
  );

  // إرجاع الـ payload ليدمجه الـ caller في كتابة bookingConfig الرئيسية
  return built;
};

/**
 * معالجة رد السكرتيرة على طلب الطبيب بدخول حالة (approved = متاحة، rejected = انتظار).
 * مقسم بالفرع — الرد يُسجَّل في الـ branch الخاص بالطلب الأصلي فقط.
 *
 * ⚠️ ملاحظة عن التسمية: الدالة `respondToDoctorEntryAlert` اسمها تاريخياً مضلل —
 *    في الواقع هي تُستدعى من **السكرتيرة** رداً على `entryAlert` الذي أرسله الطبيب.
 *    الحقل `doctorEntryResponse` هو نتيجة هذا الرد.
 *
 * عند الموافقة (approved):
 *   - نستدعي `writeApprovedEntryIdToCollectionOnly` — يكتب الـ id في
 *     secretaryApprovedEntryIds فقط، ويرجع الـ payload ليُدمج في كتابة
 *     bookingConfig الواحدة.
 *   - لا نكرر كتابة approvedIds هنا — تجنُّباً لـ double write وتجنب إشعار مكرر.
 */
export const respondToDoctorEntryAlert = async (
  secret: string,
  appointmentId: string,
  status: 'approved' | 'rejected',
  branchId?: string,
): Promise<void> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedSecret) return;

  const normalizedBranch = normalizeBranchId(branchId);
  const normalizedAppointmentId = sanitizeDocSegment(appointmentId);

  // ① الكتابة الأساسية (المطلوبة): إعلام الطبيب بالرد عبر المستند المنفصل.
  //    هذه الكتابة لها rule مرن (bookingConfigExists fallback) — نادراً ما تفشل.
  //    لو فشلت فقط هنا نرمي الخطأ للـ UI.
  await setSecretaryEntryAlertResponse(normalizedSecret, appointmentId, status, normalizedBranch);

  // ② الكتابات الثانوية (Best-effort): مسح entryAlert وكتابة doctorEntryResponse.
  //    الطبيب بالفعل استلم الرد في الخطوة ①. لو فشلت هذه الكتابات (مثلاً رفض
  //    بسبب rule للكتابة على bookingConfig)، لا نرمي — فقط نسجل التحذير.
  //    بدون ذلك، السكرتيرة كانت تشوف "فشل إرسال الرد للطبيب" بالرغم من وصوله.
  const configRef = doc(db, 'bookingConfig', normalizedSecret);
  const responsePayload = {
    status,
    appointmentId: normalizedAppointmentId,
    respondedAt: new Date().toISOString(),
    branchId: normalizedBranch,
    // 'secretary' = الطبيب في الشاشة يرى toast مباشرة — Cloud Function تتخطى push
    source: 'secretary' as const,
  };

  const configPayload: Record<string, unknown> = {
    entryAlert: null,
    [`entryAlertByBranch.${normalizedBranch}`]: null,
    doctorEntryResponse: responsePayload,
    [`doctorEntryResponseByBranch.${normalizedBranch}`]: responsePayload,
  };

  if (status === 'approved' && normalizedAppointmentId) {
    try {
      const approvedPayload = await writeApprovedEntryIdToCollectionOnly(
        normalizedSecret,
        appointmentId,
        normalizedBranch,
      );
      if (approvedPayload) {
        configPayload.approvedEntryAppointmentIds = approvedPayload.legacyIds;
        configPayload[`approvedEntryAppointmentIdsByBranch.${normalizedBranch}`] =
          approvedPayload.branchIds;
        configPayload[`lastExamOpenedAt.${normalizedBranch}`] = approvedPayload.openedAt;
        configPayload[`lastExamOpenedAppointmentId.${normalizedBranch}`] =
          approvedPayload.normalizedAppointmentId;
      }
    } catch (approvedErr) {
      console.warn(
        '[respondToDoctorEntryAlert] writeApprovedEntryIdToCollectionOnly failed (continuing):',
        approvedErr,
      );
    }
  }

  try {
    await setDoc(configRef, configPayload, { merge: true });
  } catch (configErr) {
    console.warn(
      '[respondToDoctorEntryAlert] bookingConfig cleanup failed (response already delivered to doctor):',
      configErr,
    );
    // لا نرمي الخطأ — الطبيب بالفعل استلم الرد من الخطوة ①.
  }
};
