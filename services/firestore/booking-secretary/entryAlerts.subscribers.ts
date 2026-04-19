/**
 * entryAlerts.subscribers:
 * اشتراكات القراءة الحية (onSnapshot) + دوال المسح (delete) لتنبيهات الدخول.
 * مستخرج من entryAlerts.ts لتقليل حجم الملف الأصلي.
 */
import { deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { normalizeBookingSecret } from './helpers';
import type { SecretaryEntryResponse } from '../../../types';
import { getDocCacheFirst } from '../cacheFirst';
import { DEFAULT_BRANCH_ID, normalizeBranchId } from './entryAlerts.helpers';

/**
 * الاشتراك في رد السكرتيرة على طلب الطبيب (يستخدم من قبل شاشة الطبيب).
 *
 * - إذا تم تمرير `branchId`: يُرجع الرد المطابق لهذا الفرع فقط.
 * - إذا **لم** يتم تمرير `branchId` (الحالة الشائعة للطبيب الذي يراقب كل
 *   فروعه): يُرجع **آخر** رد بغض النظر عن الفرع — يختار الأحدث حسب
 *   `respondedAt` بين خريطة `responsesByBranch` والحقل flat.
 *
 * ⚠️ الفرق عن النسخة السابقة: قبل، بدون branchId كان يفترض 'main' ويرفض
 * ردود الفروع الأخرى → الطبيب لم يكن يرى toast عند رد سكرتيرات غير main.
 */
export const subscribeToSecretaryEntryAlertResponse = (
  secret: string,
  onUpdate: (data: SecretaryEntryResponse | null) => void,
  branchId?: string,
) => {
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedSecret) {
    onUpdate(null);
    return () => undefined;
  }

  const ref = doc(db, 'secretaryEntryAlertResponse', normalizedSecret);
  // `branchId === undefined` = الطبيب (يشوف كل الفروع). معرّف = فرع محدد.
  const explicitBranchId = branchId !== undefined ? normalizeBranchId(branchId) : null;

  // type guard لقيمة رد صالحة
  const isValidResponseValue = (
    v: unknown,
  ): v is { status: 'approved' | 'rejected'; appointmentId: string; respondedAt: string } => {
    if (!v || typeof v !== 'object') return false;
    const r = v as { status?: unknown; appointmentId?: unknown; respondedAt?: unknown };
    return (
      (r.status === 'approved' || r.status === 'rejected') &&
      typeof r.appointmentId === 'string' &&
      typeof r.respondedAt === 'string'
    );
  };

  const handleSnap = (snap: {
    exists: () => boolean;
    data: () => Record<string, unknown> | undefined;
  }) => {
    if (!snap.exists()) return onUpdate(null);
    const data = snap.data() || {};

    // (1) تجميع كل الردود المتاحة من الخريطة + الـ flat
    const candidates: Array<{
      status: 'approved' | 'rejected';
      appointmentId: string;
      respondedAt: string;
      branchId?: string;
    }> = [];

    const byBranchRaw = data.responsesByBranch as Record<string, unknown> | undefined;
    if (byBranchRaw && typeof byBranchRaw === 'object') {
      Object.keys(byBranchRaw).forEach((bId) => {
        const v = byBranchRaw[bId];
        if (isValidResponseValue(v)) {
          candidates.push({
            status: v.status,
            appointmentId: v.appointmentId,
            respondedAt: v.respondedAt,
            branchId: bId,
          });
        }
      });
    }

    if (isValidResponseValue(data)) {
      // data narrowed إلى الحقول الثلاثة فقط — نقرأ branchId من الـ source الأصلي
      // (قبل narrow) حتى لا يشكو TypeScript.
      const rawData = snap.data() || {};
      const flatBranch = typeof rawData.branchId === 'string' ? rawData.branchId : undefined;
      candidates.push({
        status: data.status,
        appointmentId: data.appointmentId,
        respondedAt: data.respondedAt,
        branchId: flatBranch,
      });
    }

    // (2) فلترة بالـ branchId لو الـ caller طلب فرع محدد
    const filtered = explicitBranchId
      ? candidates.filter((c) => {
          // لو لا فرع في الـ candidate، يعتبر main
          const bId = c.branchId || DEFAULT_BRANCH_ID;
          return bId === explicitBranchId;
        })
      : candidates;

    if (filtered.length === 0) return onUpdate(null);

    // (3) اختيار الأحدث حسب respondedAt
    filtered.sort((a, b) => {
      const aMs = Date.parse(a.respondedAt) || 0;
      const bMs = Date.parse(b.respondedAt) || 0;
      return bMs - aMs;
    });
    const latest = filtered[0];

    return onUpdate({
      status: latest.status,
      appointmentId: latest.appointmentId,
      respondedAt: latest.respondedAt,
    });
  };

  // (1) المحاولة الأولى: جلب الرد من الكاش للسرعة (~0ms)
  getDocCacheFirst(ref)
    .then((snap) => {
      if (snap.exists()) handleSnap(snap);
    })
    .catch(() => {});

  // (2) المحاولة الثانية: الاشتراك في التحديثات الحية من السيرفر
  return onSnapshot(ref, handleSnap);
};

/** مسح رد الطبيب (بعد انتهاء العملية أو الإغلاق) */
export const clearSecretaryEntryAlertResponse = async (secret: string): Promise<void> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedSecret) return;

  const ref = doc(db, 'secretaryEntryAlertResponse', normalizedSecret);
  await deleteDoc(ref);
};

/**
 * الاشتراك في قائمة المعرفات المعتمدة للسكرتارية لمعرفة المواعيد المسموح بفتحها.
 * يقبل branchId (اختياري) لإرجاع قائمة الفرع المحدد فقط — مع fallback للقائمة القديمة الموحدة.
 */
export const subscribeToSecretaryApprovedEntryIds = (
  secret: string,
  onUpdate: (ids: string[]) => void,
  branchId?: string,
) => {
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedSecret) {
    onUpdate([]);
    return () => undefined;
  }

  const normalizedBranch = normalizeBranchId(branchId);
  const ref = doc(db, 'secretaryApprovedEntryIds', normalizedSecret);

  // معالجة واستخراج المعرفات — تفضيل قائمة الفرع ثم fallback للقائمة القديمة
  const handleSnap = (snap: {
    exists: () => boolean;
    data: () => Record<string, unknown> | undefined;
  }) => {
    if (!snap.exists()) return onUpdate([]);
    const data = snap.data() || {};

    // تفضيل القائمة المعزولة بالفرع
    const byBranchRaw = data?.idsByBranch as Record<string, unknown> | undefined;
    if (
      byBranchRaw &&
      typeof byBranchRaw === 'object' &&
      Array.isArray(byBranchRaw[normalizedBranch])
    ) {
      return onUpdate(
        (byBranchRaw[normalizedBranch] as unknown[]).filter(
          (id): id is string => typeof id === 'string',
        ),
      );
    }

    // Fallback للقائمة القديمة الموحدة
    const arr = data?.ids;
    if (!Array.isArray(arr)) return onUpdate([]);
    onUpdate(arr.filter((id: unknown): id is string => typeof id === 'string'));
  };

  // (1) القراءة الفورية من الملفات المحلية
  getDocCacheFirst(ref)
    .then((snap) => {
      if (snap.exists()) handleSnap(snap);
    })
    .catch(() => {});

  // (2) المزامنة مع السحاب
  return onSnapshot(ref, handleSnap);
};
