/**
 * entryAlerts.helpers:
 * ثوابت ومساعدات تُستخدم في كل من writers + subscribers لطلبات الدخول:
 * - normalizeBranchId: يمنع injection عبر dot-notation في مفاتيح Firestore maps.
 * - trimApprovedIdsList: قص القوائم لحماية حد Firestore (1MB).
 * - buildApprovedIdsPayload: دمج الـ appointmentId الجديد في قائمتَي legacy + byBranch
 *   (كان مكرر بين addSecretaryApprovedEntryId و writeApprovedEntryIdToCollectionOnly).
 */
import type { DocumentReference } from 'firebase/firestore';
import { getDocCacheFirst } from '../cacheFirst';

export const DEFAULT_BRANCH_ID = 'main';

// branchId صالح: 1-64 حرف/رقم/شرطة/underscore فقط.
// هذا يمنع محاولات injection عبر dot-notation (مثل "../main" أو "main.nested")
// التي قد تفسد هيكل المفاتيح داخل خرائط Firestore.
const SAFE_BRANCH_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

export const normalizeBranchId = (branchId?: string): string => {
  const trimmed = String(branchId || '').trim();
  if (!trimmed) return DEFAULT_BRANCH_ID;
  // لو الـ branchId غير صالح (أحرف خاصة/طول زائد) نعود للفرع الرئيسي بدلاً من رميها
  // لتجنب data corruption في Firestore maps.
  if (!SAFE_BRANCH_ID_PATTERN.test(trimmed)) return DEFAULT_BRANCH_ID;
  return trimmed;
};

/**
 * الحد الأقصى لعدد الـ appointmentIds في قائمة المعتمدين لكل فرع / للـ legacy.
 * المواعيد القديمة لا تُفيد السكرتيرة (المواعيد مفلترة باليوم في الواجهة)،
 * فنحتفظ فقط بآخر N لحماية المستند من تجاوز حد Firestore (1MB).
 *
 * الحساب: كل id ~ 20 byte × 500 = 10KB فقط لكل قائمة (آمن جداً).
 */
const MAX_APPROVED_IDS_PER_LIST = 500;

/** يقص قائمة الـ ids ليحفظ آخر maxSize فقط (FIFO — الأقدم يُزال أولاً). */
export const trimApprovedIdsList = (
  ids: string[],
  maxSize: number = MAX_APPROVED_IDS_PER_LIST,
): string[] => {
  if (ids.length <= maxSize) return ids;
  return ids.slice(ids.length - maxSize);
};

/**
 * بيانات الـ payload الجاهزة لكتابة حقول الموافقة في bookingConfig — تُرجعها
 * الـ helpers ليختار الـ caller يكتبها دفعة واحدة أو يدمجها مع حقول أخرى.
 */
export interface ApprovedIdsBookingConfigPayload {
  legacyIds: string[];
  branchIds: string[];
  openedAt: string;
  normalizedAppointmentId: string;
  normalizedBranch: string;
}

/**
 * يقرأ وثيقة secretaryApprovedEntryIds الحالية، يضم appointmentId الجديد إلى
 * قائمتَي legacy + byBranch (بدون تكرار)، يقصّ كلاهما للحد الأقصى،
 * ويُنتج `openedAt` فريد بـ millisecond + suffix عشوائي.
 *
 * **الـ payload المرجع لا يُكتب هنا** — الـ caller يختار كيف يكتب.
 */
export const buildApprovedIdsPayload = async (
  approvedIdsRef: DocumentReference,
  normalizedAppointmentId: string,
  normalizedBranch: string,
): Promise<ApprovedIdsBookingConfigPayload> => {
  // نجلب الـ doc الأصلي لبناء القائمة المحدَّثة (الإضافة idempotent: لو موجود لا نكرر)
  const snap = await getDocCacheFirst(approvedIdsRef);
  const data = (snap.exists() ? snap.data() || {} : {}) as Record<string, unknown>;

  // القائمة القديمة (union للتوافق) — مع قص للحفاظ على حد أقصى
  const legacyIdsRaw = Array.isArray(data.ids) ? (data.ids as unknown[]) : [];
  const legacyIds = legacyIdsRaw.filter((id): id is string => typeof id === 'string');
  if (!legacyIds.includes(normalizedAppointmentId)) legacyIds.push(normalizedAppointmentId);

  // القائمة الجديدة المُقسَّمة بالفرع — مع قص مستقل لكل فرع
  const byBranchRaw = data.idsByBranch as Record<string, unknown> | undefined;
  const existingBranchIds =
    byBranchRaw &&
    typeof byBranchRaw === 'object' &&
    Array.isArray(byBranchRaw[normalizedBranch])
      ? (byBranchRaw[normalizedBranch] as unknown[]).filter(
          (id): id is string => typeof id === 'string',
        )
      : [];
  const branchIds = [...existingBranchIds];
  if (!branchIds.includes(normalizedAppointmentId)) branchIds.push(normalizedAppointmentId);

  // علامة زمنية فريدة بحسب الميلّي ثانية + جزء عشوائي.
  // لو الطبيب ضغط "بدء الكشف" مرتين في نفس الـ millisecond (نادر لكن ممكن مع
  // batched writes أو retry)، الـ suffix العشوائي يضمن الـ string مختلف
  // ⇒ الـ Cloud Function تكتشف التغيير.
  const openedAt = `${new Date().toISOString()}#${Math.random().toString(36).slice(2, 10)}`;

  return {
    legacyIds: trimApprovedIdsList(legacyIds),
    branchIds: trimApprovedIdsList(branchIds),
    openedAt,
    normalizedAppointmentId,
    normalizedBranch,
  };
};
