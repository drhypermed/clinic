/**
 * bookingConfigSync.writers:
 * دوال الكتابة إلى Firestore (set*) لتحديث بيانات السكرتير، مقسّمة بالفرع.
 *
 * ⚠️ ممنوع dot-notation في setDoc — Firebase JS SDK ما بيفسرش الـ keys اللي
 * فيها نقاط في setDoc كـ nested paths، بل بيخزنها كأسماء حقول حرفية فيها نقطة.
 * النتيجة: subscriber بيقرأ `data.todayAppointmentsByBranch` (nested) → undefined
 * → السكرتيرة ما بتشوفش التحديثات لحظياً. الحل nested object + merge:true —
 * Firestore بيدمج الـ maps بعمق فالفروع التانية ما تتمسحش.
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
 * تحديث قائمة مواعيد اليوم مقسّمة بالفرع.
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
  const branchMap: Record<string, BookingConfigTodayAppointment[]> = {};

  branchKeys.forEach((branchId) => {
    const normalizedBranch = branchId || DEFAULT_BRANCH_ID;
    const list = listByBranch[branchId] || [];
    branchMap[normalizedBranch] = list.map((item) =>
      sanitizeTodayAppointment({ ...item, branchId: item.branchId || normalizedBranch }),
    );
  });

  // nested map — مع merge:true الفروع التانية في الخريطة الموجودة بتتحفظ
  await setDoc(
    configRef,
    { todayAppointmentsByBranch: branchMap },
    { merge: true },
  );
};

/**
 * تحديث قائمة المواعيد القادمة (بعد اليوم) مقسّمة بالفرع.
 *
 * ⚠️ سقف ٢٠٠ لكل فرع كـdefense-in-depth ضد تجاوز حد ١ميجا للوثيقة.
 * طبيب نشيط (٣٠ موعد/يوم × ٥ فروع × ٣٠ يوم قدّام = ٤٥٠٠ عنصر) كان ممكن يضرب الحد.
 * بـ٢٠٠ × ٥ فروع × ٣٠٠ بايت = ٣٠٠ KB مساحة آمنة. الـclient بيـsort تصاعدياً
 * فالـ ٢٠٠ المحفوظين هم الأقرب زمنياً (الأهم للسكرتيرة).
 */
const UPCOMING_APPOINTMENTS_PER_BRANCH_CAP = 200;

export const setBookingConfigUpcomingAppointmentsByBranch = async (
  secret: string,
  listByBranch: Record<string, BookingConfigTodayAppointment[]>,
): Promise<void> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedSecret) return;

  const branchKeys = Object.keys(listByBranch || {});
  if (branchKeys.length === 0) return;

  const configRef = doc(db, 'bookingConfig', normalizedSecret);
  const branchMap: Record<string, BookingConfigTodayAppointment[]> = {};

  branchKeys.forEach((branchId) => {
    const normalizedBranch = branchId || DEFAULT_BRANCH_ID;
    const list = (listByBranch[branchId] || []).slice(0, UPCOMING_APPOINTMENTS_PER_BRANCH_CAP);
    branchMap[normalizedBranch] = list.map((item) =>
      sanitizeTodayAppointment({ ...item, branchId: item.branchId || normalizedBranch }),
    );
  });

  await setDoc(
    configRef,
    { upcomingAppointmentsByBranch: branchMap },
    { merge: true },
  );
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
  const branchMap: Record<string, Array<Record<string, unknown>>> = {};

  branchKeys.forEach((branchId) => {
    const normalizedBranch = branchId || DEFAULT_BRANCH_ID;
    const list = (listByBranch[branchId] || []).slice(0, 20);
    // حقول مختصرة جداً لتقليل حجم الـ document — Firestore بيرفض أي قيمة undefined،
    // فلازم نحذف المفاتيح اللي قيمتها undefined بدل ما نحطها بقيمة فاضية.
    branchMap[normalizedBranch] = list.map((item) => {
      const entry: Record<string, unknown> = {
        id: item.id,
        patientName: String(item.patientName || '').slice(0, 60),
        dateTime: item.dateTime,
        examCompletedAt: item.examCompletedAt || '',
      };
      if (item.phone) entry.phone = String(item.phone).slice(0, 15);
      if (item.visitReason) entry.visitReason = String(item.visitReason).slice(0, 80);
      if (item.source !== undefined) entry.source = item.source;
      if (item.appointmentType !== undefined) entry.appointmentType = item.appointmentType;
      return entry;
    });
  });

  await setDoc(
    configRef,
    { completedAppointmentsByBranch: branchMap },
    { merge: true },
  );
};

/**
 * تحديث قائمة "تم الكشف عليهم مؤخراً" مقسّمة بالفرع.
 *
 * ⚠️ سقف ٥٠ لكل فرع. السكرتيرة بتستخدم القائمة دي للاقتراحات في الفورم بس،
 * فمش محتاجة كل ٩٠٠ مريض الـ٣٠ يوم اللي فاتوا. ٥٠ × ٥ فروع × ٢٥٠ بايت = ٦٢ KB.
 */
const RECENT_EXAM_PATIENTS_PER_BRANCH_CAP = 50;

export const setBookingConfigRecentExamPatientsByBranch = async (
  secret: string,
  listByBranch: Record<string, RecentExamPatient[]>,
): Promise<void> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedSecret) return;

  const branchKeys = Object.keys(listByBranch || {});
  if (branchKeys.length === 0) return;

  const configRef = doc(db, 'bookingConfig', normalizedSecret);
  const branchMap: Record<string, RecentExamPatient[]> = {};

  branchKeys.forEach((branchId) => {
    const normalizedBranch = (branchId || DEFAULT_BRANCH_ID).trim() || DEFAULT_BRANCH_ID;
    const list = (listByBranch[branchId] || []).slice(0, RECENT_EXAM_PATIENTS_PER_BRANCH_CAP);
    branchMap[normalizedBranch] = list.map(sanitizeRecentExamPatient);
  });

  await setDoc(
    configRef,
    { recentExamPatientsByBranch: branchMap },
    { merge: true },
  );
};

/** تحديث دليل المرضى مقسّم بالفرع. */
export const setBookingConfigPatientDirectoryByBranch = async (
  secret: string,
  directoryByBranch: Record<string, PatientDirectoryItem[]>,
): Promise<void> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedSecret) return;

  const branchKeys = Object.keys(directoryByBranch || {});
  if (branchKeys.length === 0) return;

  const configRef = doc(db, 'bookingConfig', normalizedSecret);
  const branchMap: Record<string, PatientDirectoryItem[]> = {};

  branchKeys.forEach((branchId) => {
    const normalizedBranch = (branchId || DEFAULT_BRANCH_ID).trim() || DEFAULT_BRANCH_ID;
    const list = directoryByBranch[branchId] || [];
    // نحد من عدد العناصر (300) لضمان سرعة التحميل واستهلاك البيانات
    branchMap[normalizedBranch] = list
      .map(sanitizePatientDirectoryItem)
      .filter((item) => typeof item.patientName === 'string' && item.patientName.trim().length > 0)
      .slice(0, 300);
  });

  await setDoc(
    configRef,
    { patientDirectoryByBranch: branchMap },
    { merge: true },
  );
};
