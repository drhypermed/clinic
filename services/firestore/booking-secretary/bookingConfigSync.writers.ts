/**
 * bookingConfigSync.writers:
 * دوال الكتابة إلى Firestore (set*) لتحديث بيانات السكرتير.
 * جميعها تستخدم `{ merge: true }` + dot-notation للإصدارات per-branch
 * حتى لا تدهس مفاتيح الفروع الأخرى.
 */
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { normalizeBookingSecret } from './helpers';
import type { PatientDirectoryItem, RecentExamPatient } from './types';
import type { BookingConfigTodayAppointment } from '../../../types';
import { DEFAULT_BRANCH_ID } from './bookingConfigSync.types';
import {
  sanitizePatientDirectoryItem,
  sanitizeRecentExamPatient,
  sanitizeTodayAppointment,
} from './bookingConfigSync.transforms';

/**
 * تحديث قائمة مواعيد اليوم — النسخة القديمة (غير مُقسَّمة بالفرع).
 * ما زالت مستخدمة كـ fallback، لكن يُنصح باستخدام النسخة ByBranch.
 */
export const setBookingConfigTodayAppointments = async (
  secret: string,
  list: BookingConfigTodayAppointment[],
): Promise<void> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedSecret) return;

  const configRef = doc(db, 'bookingConfig', normalizedSecret);
  const sanitizedList = list.map(sanitizeTodayAppointment);

  await setDoc(configRef, { todayAppointments: sanitizedList }, { merge: true });
};

/**
 * تحديث قائمة مواعيد اليوم مقسّمة بالفرع.
 *
 * **يستخدم dot-notation لكل branch** — بذلك لو الـ caller مرر فرع واحد فقط
 * (مثل السكرتيرة) لا ندهس مفاتيح الفروع الأخرى في الخريطة.
 *
 * ⚠️ الحقل flat `todayAppointments` لا يُكتب هنا عمداً — السكرتيرة مش المصدر
 * الصحيح لقائمة موحدة. الطبيب يكتب flat عبر مسار آخر لو لازم.
 */
export const setBookingConfigTodayAppointmentsByBranch = async (
  secret: string,
  listByBranch: Record<string, BookingConfigTodayAppointment[]>,
): Promise<void> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedSecret) return;

  const branchKeys = Object.keys(listByBranch || {});
  if (branchKeys.length === 0) return;

  const configRef = doc(db, 'bookingConfig', normalizedSecret);
  const payload: Record<string, unknown> = {};

  branchKeys.forEach((branchId) => {
    const normalizedBranch = branchId || DEFAULT_BRANCH_ID;
    const list = listByBranch[branchId] || [];
    const sanitizedList = list.map((item) =>
      sanitizeTodayAppointment({ ...item, branchId: item.branchId || normalizedBranch }),
    );
    // dot-notation: نحدث مفتاح واحد فقط بدون دهس الباقي
    payload[`todayAppointmentsByBranch.${normalizedBranch}`] = sanitizedList;
  });

  await setDoc(configRef, payload, { merge: true });
};

/**
 * تحديث قائمة المواعيد القادمة (بعد اليوم) مقسّمة بالفرع.
 * يستخدم dot-notation مثل `setBookingConfigTodayAppointmentsByBranch`.
 */
export const setBookingConfigUpcomingAppointmentsByBranch = async (
  secret: string,
  listByBranch: Record<string, BookingConfigTodayAppointment[]>,
): Promise<void> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedSecret) return;

  const branchKeys = Object.keys(listByBranch || {});
  if (branchKeys.length === 0) return;

  const configRef = doc(db, 'bookingConfig', normalizedSecret);
  const payload: Record<string, unknown> = {};

  branchKeys.forEach((branchId) => {
    const normalizedBranch = branchId || DEFAULT_BRANCH_ID;
    const list = listByBranch[branchId] || [];
    const sanitizedList = list.map((item) =>
      sanitizeTodayAppointment({ ...item, branchId: item.branchId || normalizedBranch }),
    );
    payload[`upcomingAppointmentsByBranch.${normalizedBranch}`] = sanitizedList;
  });

  await setDoc(configRef, payload, { merge: true });
};

/**
 * تحديث قائمة المواعيد المنفذة مقسّمة بالفرع.
 * تُخزَّن في نفس الـ bookingConfig document — حقول مختصرة جداً (id + name + dateTime + examCompletedAt فقط)
 * مع حد أقصى 20 لكل فرع لتجنب تجاوز حد الحجم.
 */
export const setBookingConfigCompletedAppointmentsByBranch = async (
  secret: string,
  listByBranch: Record<string, BookingConfigTodayAppointment[]>,
): Promise<void> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedSecret) return;

  const branchKeys = Object.keys(listByBranch || {});
  if (branchKeys.length === 0) return;

  const configRef = doc(db, 'bookingConfig', normalizedSecret);
  const payload: Record<string, unknown> = {};

  branchKeys.forEach((branchId) => {
    const normalizedBranch = branchId || DEFAULT_BRANCH_ID;
    const list = (listByBranch[branchId] || []).slice(0, 20);
    // حقول مختصرة جداً لتقليل حجم الـ document
    const compactList = list.map((item) => ({
      id: item.id,
      patientName: String(item.patientName || '').slice(0, 60),
      dateTime: item.dateTime,
      examCompletedAt: item.examCompletedAt || '',
      phone: item.phone ? String(item.phone).slice(0, 15) : undefined,
      visitReason: item.visitReason ? String(item.visitReason).slice(0, 80) : undefined,
      source: item.source,
      appointmentType: item.appointmentType,
    }));
    payload[`completedAppointmentsByBranch.${normalizedBranch}`] = compactList;
  });

  await setDoc(configRef, payload, { merge: true });
};

/** تحديث قائمة "تم الكشف عليهم مؤخراً" لتسهيل متابعة السكرتير للحالات الخارجة من غرفة الكشف */
export const setBookingConfigRecentExamPatients = async (
  secret: string,
  list: RecentExamPatient[],
): Promise<void> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedSecret) return;

  const configRef = doc(db, 'bookingConfig', normalizedSecret);
  const sanitizedList = list.map(sanitizeRecentExamPatient);

  await setDoc(configRef, { recentExamPatients: sanitizedList }, { merge: true });
};

/**
 * تحديث قائمة "تم الكشف عليهم مؤخراً" مقسّمة بالفرع.
 * يستخدم dot-notation — يكتب فقط الفروع الممرّرة بدون مسح الباقي.
 */
export const setBookingConfigRecentExamPatientsByBranch = async (
  secret: string,
  listByBranch: Record<string, RecentExamPatient[]>,
): Promise<void> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedSecret) return;

  const configRef = doc(db, 'bookingConfig', normalizedSecret);
  const payload: Record<string, unknown> = {};

  Object.keys(listByBranch || {}).forEach((branchId) => {
    const normalizedBranch = (branchId || DEFAULT_BRANCH_ID).trim() || DEFAULT_BRANCH_ID;
    const list = listByBranch[branchId] || [];
    payload[`recentExamPatientsByBranch.${normalizedBranch}`] = list.map(
      sanitizeRecentExamPatient,
    );
  });

  if (Object.keys(payload).length === 0) return;
  await setDoc(configRef, payload, { merge: true });
};

/** تحديث دليل المرضى (سجل البحث) المتاح للسكرتير للبحث عن الملفات القديمة */
export const setBookingConfigPatientDirectory = async (
  secret: string,
  list: PatientDirectoryItem[],
): Promise<void> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedSecret) return;

  const configRef = doc(db, 'bookingConfig', normalizedSecret);
  // نحد من عدد العناصر (300) لضمان سرعة التحميل واستهلاك البيانات
  const sanitizedList = list
    .map(sanitizePatientDirectoryItem)
    .filter((item) => typeof item.patientName === 'string' && item.patientName.trim().length > 0)
    .slice(0, 300);

  await setDoc(configRef, { patientDirectory: sanitizedList }, { merge: true });
};

/**
 * تحديث دليل المرضى مقسّم بالفرع.
 * يستخدم dot-notation — يحدّث فقط الفروع الممرّرة بدون مسح الباقي.
 */
export const setBookingConfigPatientDirectoryByBranch = async (
  secret: string,
  directoryByBranch: Record<string, PatientDirectoryItem[]>,
): Promise<void> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedSecret) return;

  const configRef = doc(db, 'bookingConfig', normalizedSecret);
  const payload: Record<string, unknown> = {};

  Object.keys(directoryByBranch || {}).forEach((branchId) => {
    const normalizedBranch = (branchId || DEFAULT_BRANCH_ID).trim() || DEFAULT_BRANCH_ID;
    const list = directoryByBranch[branchId] || [];
    payload[`patientDirectoryByBranch.${normalizedBranch}`] = list
      .map(sanitizePatientDirectoryItem)
      .filter((item) => typeof item.patientName === 'string' && item.patientName.trim().length > 0)
      .slice(0, 300);
  });

  if (Object.keys(payload).length === 0) return;
  await setDoc(configRef, payload, { merge: true });
};
