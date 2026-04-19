/**
 * التأكد وإصلاح اتصال السكرتارية (Secretary Connection Assurance & Repair)
 * هذا الملف مسؤول عن الجوانب التقنية لربط السكرتارية بالطبيب:
 * 1. الربط الصحيح بين الرمز السري (Secret) ومعرف الطبيب (UserId).
 * 2. تنظيف الإعدادات القديمة أو المتكررة (Cleanup Stale Configs).
 * 3. وظيفة الإصلاح الذاتي (Self-Repair) في حال وجود مشاكل في الدخول.
 */

import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { normalizeBookingSecret, normalizeEmail, sanitizeDocSegment } from './helpers';

/** 
 * التأكد من أن الرمز السري يشير إلى الـ UserId الصحيح في Firestore.
 * يقوم أيضاً بحذف أي إعدادات قديمة مرتبطة بنفس الطبيب لضمان وجود قناة اتصال واحدة فعالة.
 */
export const ensureBookingConfigUserId = async (secret: string, userId: string, branchId?: string): Promise<void> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  const normalizedUserId = sanitizeDocSegment(userId);
  if (!normalizedSecret || !normalizedUserId) return;

  const configRef = doc(db, 'bookingConfig', normalizedSecret);
  const payload: Record<string, unknown> = { userId: normalizedUserId, updatedAt: new Date().toISOString() };
  if (branchId) payload.branchId = branchId;
  await setDoc(configRef, payload, { merge: true });

  // ملاحظة: تم إيقاف حذف الـ configs القديمة لأن كل فرع ليه config مستقل.
  // الحذف القديم كان بيمسح configs الفروع التانية.
};

/** ربط البريد الإلكتروني للطبيب بإعدادات السكرتارية (يستخدم للتحقق عند الدخول) */
export const setBookingDoctorEmail = async (
  secret: string,
  userId: string,
  doctorEmail: string
): Promise<void> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  const normalizedUserId = sanitizeDocSegment(userId);
  const doctorEmailValue = normalizeEmail(doctorEmail);

  if (!normalizedSecret || !normalizedUserId || !doctorEmailValue) return;

  const configRef = doc(db, 'bookingConfig', normalizedSecret);
  const userRef = doc(db, 'users', normalizedUserId);

  // تحديث البريد في مكانين: إعدادات الحجز، وملف المستخدم الرئيسي
  await Promise.all([
    setDoc(
      configRef,
      { userId: normalizedUserId, doctorEmail: doctorEmailValue, updatedAt: new Date().toISOString() },
      { merge: true }
    ),
    setDoc(userRef, { doctorEmail: doctorEmailValue }, { merge: true }),
  ]);
};

/** 
 * وظيفة الإصلاح اليدوي/الآلي للربط.
 * تحذف كافة الإعدادات التالفة أو القديمة وتبقي فقط على الرمز الحالي الفعال.
 */
export const repairBookingConnection = async (
  userId: string,
  currentSecret: string
): Promise<string> => {
  const normalizedUserId = sanitizeDocSegment(userId);
  const normalizedSecret = normalizeBookingSecret(currentSecret);
  if (!normalizedUserId || !normalizedSecret) {
    throw new Error('بيانات الإصلاح غير مكتملة.');
  }

  try {
    console.log('[Repair] Starting repair for user:', normalizedUserId);

    // إصلاح الربط للـ secret الحالي فقط — بدون حذف configs الفروع التانية
    const configRef = doc(db, 'bookingConfig', normalizedSecret);
    await setDoc(configRef, { userId: normalizedUserId }, { merge: true });

    return `✅ تم إصلاح الربط بنجاح.`;
  } catch (error) {
    console.error('[Repair] Failed:', error);
    throw new Error(`تعذر إكمال الإصلاح: ${(error as Error)?.message || String(error)}`);
  }
};
