/**
 * إدارة مواعيد الحجز العام (Public Booking Slots Management)
 * هذا الملف مسؤول عن تنظيم الفترات الزمنية المتاحة للمرضى للحجز عبر الإنترنت:
 * 1. جلب المواعيد المتاحة والاشتراك اللحظي فيها.
 * 2. إضافة فترات زمنية جديدة من قبل الطبيب.
 * 3. حذف المواعيد (يدوياً أو تلقائياً عند انتهاء صلاحيتها).
 */

import { addDoc, collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, writeBatch } from 'firebase/firestore';

/**
 * الحد الأقصى لعدد المواعيد المتاحة للعرض في صفحة الحجز العامة.
 * المريض يختار من أقرب ٦٠ موعداً قادم — عدد كافٍ لخيارات عدة أسابيع،
 * ومنع استعلامات غير محدودة على مجموعة يمكن أن تنمو بلا سقف.
 */
const PUBLIC_SLOTS_QUERY_LIMIT = 60;
import { PublicBookingSlot } from '../../../types';
import { db } from '../../firebaseConfig';
import { getDocsCacheFirst } from '../cacheFirst';
import { isSlotExpired, normalizePublicSecret, sanitizeDocSegment } from './helpers';

/** 
 * معالجة وتحويل المواعيد الخام من Firestore إلى كائنات برمجية.
 * تتضمن الوظيفة "تنظيفاً تلقائياً" (Auto-Cleanup) للمواعيد التي مر تاريخها لضمان نظافة قاعدة البيانات.
 */
const mapSlots = (secret: string, nowMs: number, rows: Array<{ id: string; dateTime: unknown; branchId?: unknown }>) => {
  const normalizedSecret = normalizePublicSecret(secret);
  const slots = rows
    .map((row) => ({
      id: row.id,
      dateTime: typeof row.dateTime === 'string' ? row.dateTime : '',
      branchId: typeof row.branchId === 'string' && row.branchId ? row.branchId : undefined,
    }))
    .filter((slot) => Boolean(slot.dateTime));

  // حذف المواعيد منتهية الصلاحية تلقائياً من السيرفر
  if (normalizedSecret) {
    slots
      .filter((slot) => isSlotExpired(slot.dateTime, nowMs))
      .forEach((slot) => {
        const slotRef = doc(db, 'publicBookingConfig', normalizedSecret, 'slots', slot.id);
        deleteDoc(slotRef).catch(() => {
          // تجاهل فشل الحذف التلقائي لتجنب تعطيل واجهة المستخدم
        });
      });
  }

  // إرجاع المواعيد الصالحة فقط (التي لم تنتهِ بعد)
  return slots.filter((slot) => !isSlotExpired(slot.dateTime, nowMs));
};

/** جلب كافة المواعيد المتاحة للجمهور لسر محدد */
export const getPublicSlots = async (secret: string): Promise<PublicBookingSlot[]> => {
  const normalizedSecret = normalizePublicSecret(secret);
  if (!normalizedSecret) return [];

  const slotsRef = collection(db, 'publicBookingConfig', normalizedSecret, 'slots');
  const q = query(slotsRef, orderBy('dateTime', 'asc'), limit(PUBLIC_SLOTS_QUERY_LIMIT));
  const snapshot = await getDocsCacheFirst(q);
  const nowMs = Date.now();

  return mapSlots(
    normalizedSecret,
    nowMs,
    snapshot.docs.map((item) => ({ id: item.id, dateTime: item.data().dateTime, branchId: item.data().branchId }))
  );
};

/**
 * Migration تلقائي: الـ slots اللي بدون branchId تُحدَّث ليكون لها branchId: 'main'.
 * ده بيوحّد السلوك بين الدكتور والمريض (الاتنين يشوفوا legacy slots في الفرع الرئيسي بس).
 * بيشتغل best-effort مرة واحدة لكل جلسة — لو فشل مفيش مشكلة.
 */
const migrateLegacySlotsToMain = async (slotsRef: any, snapshot: any): Promise<void> => {
  try {
    const legacyDocs = snapshot.docs.filter((d: any) => !d.data()?.branchId);
    if (legacyDocs.length === 0) return;
    const batch = writeBatch(db);
    legacyDocs.slice(0, 400).forEach((d: any) => batch.update(d.ref, { branchId: 'main' }));
    await batch.commit();
  } catch {
    // best-effort: لو فشل بسبب permissions أو أي سبب، مفيش مشكلة — الفلترة client-side تحمي
  }
  void slotsRef;
};

/** الاشتراك اللحظي في المواعيد لضمان تحديثها عند قيام مريض آخر بالحجز أو قيام الطبيب بتغييرها */
export const subscribeToPublicSlots = (
  secret: string,
  onUpdate: (slots: PublicBookingSlot[]) => void
) => {
  const normalizedSecret = normalizePublicSecret(secret);
  if (!normalizedSecret) {
    onUpdate([]);
    return () => undefined;
  }

  const slotsRef = collection(db, 'publicBookingConfig', normalizedSecret, 'slots');
  const q = query(slotsRef, orderBy('dateTime', 'asc'), limit(PUBLIC_SLOTS_QUERY_LIMIT));
  let migrationDone = false;

  /** معالجة البيانات وتحويلها للنموذج الموحد */
  const handleSnap = (snapshot: any) => {
    const nowMs = Date.now();
    const slots = mapSlots(
      normalizedSecret,
      nowMs,
      snapshot.docs.map((item: any) => ({ id: item.id, dateTime: item.data().dateTime, branchId: item.data().branchId }))
    );
    onUpdate(slots);
    if (!migrationDone) {
      migrationDone = true;
      void migrateLegacySlotsToMain(slotsRef, snapshot);
    }
  };

  // 1. المحاولة الأولى: جلب المواعيد من الكاش للتحميل اللحظي (0ms) للمريض
  getDocsCacheFirst(q).then(snap => {
    if (!snap.empty) handleSnap(snap);
  }).catch(() => {});

  // 2. المحاولة الثانية: الاشتراك في التحديثات الحية من السيرفر
  return onSnapshot(q, handleSnap);
};

/** إضافة فترة زمنية جديدة متاحة للحجز (مع ربطها بفرع اختياري) */
export const addPublicSlot = async (
  userId: string,
  secret: string,
  dateTime: string,
  branchId?: string
): Promise<string> => {
  const normalizedUserId = sanitizeDocSegment(userId);
  const normalizedSecret = normalizePublicSecret(secret);
  if (!normalizedUserId || !normalizedSecret) {
    throw new Error('invalid-public-slot-context');
  }

  const payload: { dateTime: string; branchId?: string } = { dateTime };
  const trimmedBranch = typeof branchId === 'string' ? branchId.trim() : '';
  if (trimmedBranch) payload.branchId = trimmedBranch;

  const slotsRef = collection(db, 'publicBookingConfig', normalizedSecret, 'slots');
  const docRef = await addDoc(slotsRef, payload);
  return docRef.id;
};

/** حذف موعد متاح (إلغاء الفترة الزمنية من قبل الطبيب) */
export const deletePublicSlot = async (secret: string, slotId: string): Promise<void> => {
  const normalizedSecret = normalizePublicSecret(secret);
  const normalizedSlotId = sanitizeDocSegment(slotId);
  if (!normalizedSecret || !normalizedSlotId) return;

  const slotRef = doc(db, 'publicBookingConfig', normalizedSecret, 'slots', normalizedSlotId);
  await deleteDoc(slotRef);
};

