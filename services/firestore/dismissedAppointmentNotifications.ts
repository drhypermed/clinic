/**
 * خدمة "إشعارات الحجز المُتعامل معاها" (Dismissed Appointment Notifications)
 *
 * الهدف:
 *   مزامنة حالة "تم رؤية إشعار الحجز" بين كل أجهزة الطبيب.
 *   لما الطبيب يتعامل مع إشعار حجز جديد على جهاز (يفتحه/يقفله/تعدّى وقت العرض)،
 *   كل أجهزته الأخرى تعرف وتمنع إعادة عرض نفس الإشعار + تمسحه من درج النظام.
 *
 * البنية: users/{userId}/dismissedAppointmentNotifications/{appointmentId}
 *   - وثيقة لكل موعد اتعامل معاه
 *   - حقول: appointmentId, branchId, tag, dismissedAt
 *   - الـ Cloud Function `notifyDevicesToDismissAppointmentNotification`
 *     بتراقب الـ collection ده وبتبعت إشعار صامت لكل الأجهزة لمسح الإشعار من
 *     درج النظام.
 *
 * نفس النمط المستخدم في `dismissedBroadcasts/{broadcastId}`.
 */

import {
  Timestamp,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

/**
 * نافذة قراءة الإشعارات المُتعامل معاها — 3 أيام.
 * أقصى مدة محتمل أن إشعار يبقى ذو معنى: المواعيد بتتم خلال أيام، فالإشعارات
 * الأقدم من 3 أيام ما حدش هيعيد عرضها. النافذة الضيّقة بتقلل reads على scale.
 */
const DISMISSED_NOTIFICATIONS_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

/** بيانات إشعار الحجز اللي تم التعامل معاه (واحدة لكل موعد). */
export interface DismissedAppointmentNotificationRecord {
  appointmentId: string;
  branchId?: string;
  tag?: string;
}

/**
 * تسجيل أن إشعار حجز تم التعامل معاه على هذا الجهاز.
 * يكتب وثيقة جديدة (أو يحدّث الموجودة) — والـ Cloud Function تقرأ التغيير
 * وتبعت silent push لباقي الأجهزة لمسح الإشعار من درج النظام.
 *
 * @param userId — معرّف الطبيب صاحب الحساب.
 * @param record — بيانات الإشعار (appointmentId إجباري، باقي حقول اختيارية).
 */
const markAppointmentNotificationDismissed = async (
  userId: string,
  record: DismissedAppointmentNotificationRecord,
): Promise<void> => {
  // التحقق من المدخلات — تجنُّب كتابات بيانات فاسدة
  const normalizedUserId = String(userId || '').trim();
  const normalizedAppointmentId = String(record.appointmentId || '').trim();
  if (!normalizedUserId || !normalizedAppointmentId) return;

  const ref = doc(
    db,
    'users',
    normalizedUserId,
    'dismissedAppointmentNotifications',
    normalizedAppointmentId,
  );

  // payload خفيف — بنخزّن بس اللي محتاجينه لإنشاء tag الإشعار الأصلي للمسح
  const payload: Record<string, unknown> = {
    appointmentId: normalizedAppointmentId,
    dismissedAt: serverTimestamp(),
  };
  const branchId = String(record.branchId || '').trim();
  if (branchId) payload.branchId = branchId;
  const tag = String(record.tag || '').trim();
  if (tag) payload.tag = tag;

  // merge=true عشان لو الجهاز تعامل معاه مرتين ما نزودش حقول قديمة فاسدة
  await setDoc(ref, payload, { merge: true });
};

/**
 * الاشتراك اللحظي في قائمة الإشعارات المُتعامل معاها للطبيب.
 * كل الأجهزة بتشترك → أول جهاز يعمل dismiss → باقي الأجهزة تعرف فوراً.
 *
 * @param userId — معرّف الطبيب.
 * @param onChange — callback يستقبل Set<appointmentId> محدّث.
 * @returns دالة إلغاء الاشتراك.
 */
const subscribeToDismissedAppointmentNotifications = (
  userId: string,
  onChange: (dismissedIds: Set<string>) => void,
): (() => void) => {
  const normalizedUserId = String(userId || '').trim();
  if (!normalizedUserId) return () => {};

  const ref = collection(
    db,
    'users',
    normalizedUserId,
    'dismissedAppointmentNotifications',
  );

  // فلتر على آخر 7 أيام فقط — حتى لو الـ cleanup اليومي اتأخر، ما نقراش مئات
  // الوثائق القديمة في الجلسة. الـ subscription بيقرأ Firestore Timestamp ولازم
  // نقارن بـ Timestamp.fromDate لتجنّب فشل الفلتر.
  const cutoff = Timestamp.fromDate(
    new Date(Date.now() - DISMISSED_NOTIFICATIONS_WINDOW_MS),
  );
  const recentQuery = query(ref, where('dismissedAt', '>', cutoff));

  const unsubscribe = onSnapshot(
    recentQuery,
    (snapshot) => {
      // بناء Set من معرّفات المواعيد المُتعامل معاها — استخدام O(1) في الفحص
      const ids = new Set<string>();
      snapshot.forEach((docSnap) => {
        const id = String(docSnap.id || '').trim();
        if (id) ids.add(id);
      });
      onChange(ids);
    },
    (error) => {
      // لا نُسقط التطبيق — نعتبر القائمة فارغة (الإشعارات ممكن تتكرر لكن مش breaking)
      console.warn(
        '[dismissedAppointmentNotifications] subscription failed:',
        error,
      );
      onChange(new Set());
    },
  );

  return unsubscribe;
};

export const dismissedAppointmentNotificationsService = {
  markAppointmentNotificationDismissed,
  subscribeToDismissedAppointmentNotifications,
};
