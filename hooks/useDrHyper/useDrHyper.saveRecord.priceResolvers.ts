/**
 * useDrHyper.saveRecord.priceResolvers:
 * دوال مساعدة لحل الأسعار والـ branchId قبل حفظ السجل:
 * - resolveCurrentServicePrices: يجلب أسعار الكشف والاستشارة الحالية من financialData.
 * - getPersistedServiceBasePrice: يقرأ السعر المحفوظ سابقاً في السجل نفسه (للحماية عند التعديل).
 * - getPersistedBranchId: يقرأ الفرع الأصلي للسجل (منع انتقاله بين الفروع عند التعديل).
 */
import { doc } from 'firebase/firestore';
import { getDocCacheFirst } from '../../services/firestore/cacheFirst';
import { db } from '../../services/firebaseConfig';
import { financialDataService } from '../../services/financial-data';

interface ResolvedServicePrices {
  examPrice?: number;
  consultationPrice?: number;
}

/** جلب أسعار الكشف والاستشارة الحالية من Financial Data (برجع undefined لو الأسعار غير متاحة). */
export async function resolveCurrentServicePrices(
  userId: string,
  branchId: string | undefined,
): Promise<ResolvedServicePrices> {
  try {
    const currentPrices = await financialDataService.getPrices(userId, branchId);
    const exam = Number(currentPrices.examinationPrice);
    const consult = Number(currentPrices.consultationPrice);
    return {
      examPrice: Number.isFinite(exam) && exam >= 0 ? exam : undefined,
      consultationPrice: Number.isFinite(consult) && consult >= 0 ? consult : undefined,
    };
  } catch {
    // احتياطي: لو القراءة فشلت، نكمل بدون سعر (stats resolver هيتولّى الحل).
    return {};
  }
}

/**
 * يقرأ `serviceBasePrice` المحفوظ في السجل (لو موجود).
 * نستخدم القيمة دي عند تحديث السجل بدل ما نسمح لسعر جديد يكتب فوقها ويشوّه التقارير المالية القديمة.
 */
export async function getPersistedServiceBasePrice(
  userId: string | undefined,
  recordId: string,
): Promise<number | undefined> {
  const normalizedRecordId = String(recordId || '').trim();
  if (!normalizedRecordId || !userId) return undefined;

  try {
    const snapshot = await getDocCacheFirst(
      doc(db, 'users', userId, 'records', normalizedRecordId),
    );
    if (!snapshot.exists()) return undefined;

    const data = snapshot.data() as { serviceBasePrice?: unknown };
    const parsed = Number(data.serviceBasePrice);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  } catch {
    // لو القراءة فشلت، الـ caller هيستخدم السعر المحسوب كـ fallback.
  }

  return undefined;
}

/**
 * يقرأ `branchId` الأصلي للسجل (لو موجود) — لحمايته من overwrite عند التعديل.
 *
 * الفكرة: لو الطبيب حمّل سجل من فرع A، بدّل للفرع B، بعدين حفظ → السجل
 * يفضل في فرع A بدل ما يتنقل لـ B.
 *
 * بترجع `undefined` لو السجل مش موجود أو الجلب فشل — وساعتها الـ caller
 * يستخدم activeBranchId كـ fallback (للسجلات القديمة بدون branchId).
 */
export async function getPersistedBranchId(
  userId: string | undefined,
  recordId: string,
): Promise<string | undefined> {
  const normalizedRecordId = String(recordId || '').trim();
  if (!normalizedRecordId || !userId) return undefined;

  try {
    const snapshot = await getDocCacheFirst(
      doc(db, 'users', userId, 'records', normalizedRecordId),
    );
    if (!snapshot.exists()) return undefined;

    const data = snapshot.data() as { branchId?: unknown };
    const branchText = String(data.branchId || '').trim();
    if (branchText) return branchText;
  } catch {
    // لو القراءة فشلت، الـ caller هيرجع للـ activeBranchId (fallback آمن).
  }

  return undefined;
}
