/**
 * خدمة تكاليف ملفات المرضى (Patient Cost Service)
 * تخزن التكاليف النقدية ومطالبات التأمين المُدخَلة من ملف المريض،
 * وتُغذِّي التقارير المالية تلقائيًا بدون إدخال يدوي.
 */

import { db } from './firebaseConfig';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { getDocCacheFirst } from './firestore/cacheFirst';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PatientCostItem {
  id: string;
  patientFileId: string;
  patientName: string;
  amount: number;
  /** 'interventions' = التداخلات | 'other' = دخل آخر */
  type: 'interventions' | 'other';
  dateKey: string; // YYYY-MM-DD
  note?: string;
  createdAt: number;
  /**
   * الفرع اللي اتضافت فيه التكلفة. العناصر القديمة (قبل ما الحقل ده يتضاف)
   * بتتعامل كأنها فرع 'main' عن طريق `resolveItemBranch()`.
   */
  branchId?: string;
}

export interface PatientInsuranceItem {
  id: string;
  patientFileId: string;
  patientName: string;
  companyId?: string;
  companyName: string;
  amount: number;
  /** 'interventions' = التداخلات | 'other' = دخل آخر */
  type: 'interventions' | 'other';
  dateKey: string; // YYYY-MM-DD
  insuranceMembershipId?: string;
  insuranceApprovalCode?: string;
  note?: string;
  /**
   * نسبة تحمل المريض % (0–100) — بتتعبأ افتراضياً من شركة التأمين وقت الإضافة،
   * ويقدر الطبيب يعدّلها لو الحالة دي ليها نسبة مختلفة.
   * العناصر القديمة بدون الحقل ده بتتعامل كأن النسبة 0 (الشركة بتدفع كل المبلغ).
   */
  patientSharePercent?: number;
  createdAt: number;
  /**
   * الفرع اللي اتضافت فيه المطالبة. العناصر القديمة بتتعامل كأنها فرع 'main'.
   */
  branchId?: string;
}

// ─── Branch helpers ───────────────────────────────────────────────────────────

/**
 * الفرع الفعلي لعنصر (backward compat): العناصر القديمة بدون branchId تخص الفرع 'main'.
 */
const resolveItemBranch = (item: { branchId?: string } | null | undefined): string =>
  (item && item.branchId) ? item.branchId : 'main';

/**
 * مفتاح localStorage متوافق مع الفرع. 'main' أو undefined بيرجّع المفتاح الأصلي
 * (backward compat). أي فرع تاني بيتحط prefix: `{branchId}__{key}`.
 */
const branchLocalKey = (key: string, branchId?: string): string => {
  if (!branchId || branchId === 'main') return key;
  return `${branchId}__${key}`;
};

// ─── localStorage key helpers ─────────────────────────────────────────────────

const FILE_COST_KEY = (fileId: string) => `patientFileCosts_${fileId}`;
const FILE_INS_KEY = (fileId: string) => `patientFileInsurance_${fileId}`;

// ─── localStorage - patient file view (indexed by patientFileId) ──────────────

export function loadPatientFileCosts(fileId: string): PatientCostItem[] {
  try { return JSON.parse(localStorage.getItem(FILE_COST_KEY(fileId)) ?? '[]'); }
  catch { return []; }
}

export function loadPatientFileInsurance(fileId: string): PatientInsuranceItem[] {
  try { return JSON.parse(localStorage.getItem(FILE_INS_KEY(fileId)) ?? '[]'); }
  catch { return []; }
}

function persistFileCosts(fileId: string, items: PatientCostItem[]): void {
  localStorage.setItem(FILE_COST_KEY(fileId), JSON.stringify(items));
}

function persistFileInsurance(fileId: string, items: PatientInsuranceItem[]): void {
  localStorage.setItem(FILE_INS_KEY(fileId), JSON.stringify(items));
}

// ─── localStorage - date-indexed (for financial totals) ──────────────────────

function loadDateCosts(dateKey: string): PatientCostItem[] {
  try { return JSON.parse(localStorage.getItem(`patientCostItems_${dateKey}`) ?? '[]'); }
  catch { return []; }
}

function persistDateCosts(dateKey: string, items: PatientCostItem[]): void {
  localStorage.setItem(`patientCostItems_${dateKey}`, JSON.stringify(items));
  localStorage.setItem(`patientCostItems_${dateKey}_timestamp`, Date.now().toString());
}

// ─── Recompute financial totals ───────────────────────────────────────────────

/**
 * يعيد حساب interventionsRevenue / otherRevenue لتاريخ معين.
 * - لو ما اتمرّرش branchId: بيعيد الحساب لكل الفروع اللي ليها عناصر في اليوم ده
 *   (محتاج كده عشان loadCostsFromFirestore لما يقرا ملف فيه عناصر من فروع متعددة).
 * - لو اتمرّر branchId: بيعيد الحساب لهذا الفرع فقط.
 *
 * المفاتيح بتتكتب بصيغة branch-aware:
 *   - فرع main → `interventionsRevenue_{dateKey}` (backward compat)
 *   - أي فرع تاني → `{branchId}__interventionsRevenue_{dateKey}`
 */
function recomputeDailyTotals(dateKey: string, branchId?: string): void {
  const allItems = loadDateCosts(dateKey);
  const branchesToRecompute = branchId
    ? [branchId]
    : Array.from(new Set(allItems.map(resolveItemBranch)));

  // لو مفيش أي عناصر في اليوم، نتأكد إن الفرع الحالي على الأقل يتصفر
  if (branchesToRecompute.length === 0 && branchId) {
    branchesToRecompute.push(branchId);
  }

  for (const b of branchesToRecompute) {
    const branchItems = allItems.filter(i => resolveItemBranch(i) === b);
    const interventions = branchItems
      .filter(i => i.type === 'interventions')
      .reduce((s, i) => s + i.amount, 0);
    const other = branchItems
      .filter(i => i.type === 'other')
      .reduce((s, i) => s + i.amount, 0);

    const intvKey = `${branchLocalKey('interventionsRevenue', b)}_${dateKey}`;
    const otherKey = `${branchLocalKey('otherRevenue', b)}_${dateKey}`;
    localStorage.setItem(intvKey, interventions.toFixed(2));
    localStorage.setItem(`${intvKey}_timestamp`, Date.now().toString());
    localStorage.setItem(otherKey, other.toFixed(2));
    localStorage.setItem(`${otherKey}_timestamp`, Date.now().toString());
  }
}

// ─── Add / Edit / Delete cost items ─────────────────────────────────────────

export function addCostItem(
  fileId: string,
  patientName: string,
  fields: Pick<PatientCostItem, 'amount' | 'type' | 'dateKey' | 'note'>,
  branchId?: string,
): PatientCostItem {
  const item: PatientCostItem = {
    id: `ci_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    patientFileId: fileId,
    patientName,
    amount: fields.amount,
    type: fields.type,
    dateKey: fields.dateKey,
    note: fields.note,
    createdAt: Date.now(),
    branchId: branchId || undefined,
  };

  // patient-file index
  persistFileCosts(fileId, [...loadPatientFileCosts(fileId), item]);

  // date index
  persistDateCosts(item.dateKey, [...loadDateCosts(item.dateKey), item]);
  recomputeDailyTotals(item.dateKey, resolveItemBranch(item));

  return item;
}

export function editCostItem(
  fileId: string,
  itemId: string,
  changes: Partial<Pick<PatientCostItem, 'amount' | 'type' | 'dateKey' | 'note'>>
): void {
  const fileCosts = loadPatientFileCosts(fileId);
  const existing = fileCosts.find(c => c.id === itemId);
  if (!existing) return;

  const updated: PatientCostItem = { ...existing, ...changes };

  // patient-file index
  persistFileCosts(fileId, fileCosts.map(c => c.id === itemId ? updated : c));

  const oldDateKey = existing.dateKey;
  const newDateKey = changes.dateKey ?? oldDateKey;
  const itemBranch = resolveItemBranch(existing);

  if (newDateKey !== oldDateKey) {
    // remove from old date
    persistDateCosts(oldDateKey, loadDateCosts(oldDateKey).filter(c => c.id !== itemId));
    recomputeDailyTotals(oldDateKey, itemBranch);
    // add to new date
    persistDateCosts(newDateKey, [...loadDateCosts(newDateKey), updated]);
  } else {
    persistDateCosts(oldDateKey, loadDateCosts(oldDateKey).map(c => c.id === itemId ? updated : c));
  }
  recomputeDailyTotals(newDateKey, itemBranch);
}

export function deleteCostItem(fileId: string, itemId: string): void {
  const fileCosts = loadPatientFileCosts(fileId);
  const item = fileCosts.find(c => c.id === itemId);
  if (!item) return;

  persistFileCosts(fileId, fileCosts.filter(c => c.id !== itemId));
  const dateCosts = loadDateCosts(item.dateKey).filter(c => c.id !== itemId);
  persistDateCosts(item.dateKey, dateCosts);
  recomputeDailyTotals(item.dateKey, resolveItemBranch(item));
}

/** Fallback: delete cost item directly from the date index when patientFileId is unknown */
export function deleteCostItemFromDateIndex(dateKey: string, itemId: string): void {
  // نلاقي الـ branch من العنصر قبل ما نشيله، عشان نعيد الحساب صح
  const itemToDelete = loadDateCosts(dateKey).find(c => c.id === itemId);
  const targetBranch = itemToDelete ? resolveItemBranch(itemToDelete) : undefined;
  persistDateCosts(dateKey, loadDateCosts(dateKey).filter(c => c.id !== itemId));
  recomputeDailyTotals(dateKey, targetBranch);
}

/** Fallback: edit cost item directly in the date index when patientFileId is unknown */
export function editCostItemInDateIndex(
  dateKey: string,
  itemId: string,
  changes: Partial<Pick<PatientCostItem, 'amount' | 'type' | 'note'>>
): void {
  const items = loadDateCosts(dateKey);
  const existingItem = items.find(c => c.id === itemId);
  const targetBranch = existingItem ? resolveItemBranch(existingItem) : undefined;
  persistDateCosts(dateKey, items.map(c => c.id === itemId ? { ...c, ...changes } : c));
  recomputeDailyTotals(dateKey, targetBranch);
}

/** Fallback: delete insurance extra directly from the date extras when patientFileId is unknown */
export function deleteInsuranceExtraFromDate(dateKey: string, itemId: string): void {
  const key = `insuranceExtra_${dateKey}`;
  let extras: PatientInsuranceItem[] = [];
  try { extras = JSON.parse(localStorage.getItem(key) ?? '[]'); } catch { /* noop */ }
  localStorage.setItem(key, JSON.stringify(extras.filter((e: any) => e.id !== itemId)));
  localStorage.setItem(`${key}_timestamp`, Date.now().toString());
}

// ─── Insurance items ──────────────────────────────────────────────────────────

/** Adds insurance item and merges into the insuranceExtra_{dateKey} localStorage array */
export function addInsuranceItem(
  fileId: string,
  patientName: string,
  fields: Pick<PatientInsuranceItem, 'companyId' | 'companyName' | 'amount' | 'type' | 'dateKey' | 'insuranceMembershipId' | 'insuranceApprovalCode' | 'note' | 'patientSharePercent'>,
  branchId?: string,
): PatientInsuranceItem {
  const item: PatientInsuranceItem = {
    id: `ins_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    patientFileId: fileId,
    patientName,
    companyId: fields.companyId,
    companyName: fields.companyName,
    amount: fields.amount,
    type: fields.type,
    dateKey: fields.dateKey,
    insuranceMembershipId: fields.insuranceMembershipId,
    insuranceApprovalCode: fields.insuranceApprovalCode,
    note: fields.note,
    patientSharePercent: fields.patientSharePercent,
    createdAt: Date.now(),
    branchId: branchId || undefined,
  };

  // patient-file insurance index
  persistFileInsurance(fileId, [...loadPatientFileInsurance(fileId), item]);

  // merge into the shared insurance extras array for this date
  _mergeInsuranceIntoDateExtras(item.dateKey, item, 'add');

  return item;
}

export function editInsuranceItem(
  fileId: string,
  itemId: string,
  changes: Partial<Pick<PatientInsuranceItem, 'companyId' | 'companyName' | 'amount' | 'type' | 'dateKey' | 'insuranceMembershipId' | 'insuranceApprovalCode' | 'note' | 'patientSharePercent'>>
): void {
  const fileIns = loadPatientFileInsurance(fileId);
  const existing = fileIns.find(i => i.id === itemId);
  if (!existing) return;

  const updated: PatientInsuranceItem = { ...existing, ...changes };
  persistFileInsurance(fileId, fileIns.map(i => i.id === itemId ? updated : i));

  const oldDateKey = existing.dateKey;
  const newDateKey = changes.dateKey ?? oldDateKey;

  // remove from old date extras
  _mergeInsuranceIntoDateExtras(oldDateKey, existing, 'remove');
  // add to new date extras
  _mergeInsuranceIntoDateExtras(newDateKey, updated, 'add');
}

export function deleteInsuranceItem(fileId: string, itemId: string): void {
  const fileIns = loadPatientFileInsurance(fileId);
  const item = fileIns.find(i => i.id === itemId);
  if (!item) return;

  persistFileInsurance(fileId, fileIns.filter(i => i.id !== itemId));
  _mergeInsuranceIntoDateExtras(item.dateKey, item, 'remove');
}

/** Merges (or removes) a patient insurance item inside insuranceExtra_{dateKey} */
function _mergeInsuranceIntoDateExtras(
  dateKey: string,
  item: PatientInsuranceItem,
  action: 'add' | 'remove'
): void {
  const key = `insuranceExtra_${dateKey}`;
  let extras: any[] = [];
  try { extras = JSON.parse(localStorage.getItem(key) ?? '[]'); } catch {}

  if (action === 'remove') {
    extras = extras.filter((e: any) => e.id !== item.id);
  } else {
    // remove existing entry with same id (in case of re-add after edit)
    extras = extras.filter((e: any) => e.id !== item.id);
    extras.push({
      id: item.id,
      companyId: item.companyId ?? '',
      companyName: item.companyName,
      type: item.type,
      amount: item.amount,
      branchId: item.branchId,
      insuranceMembershipId: item.insuranceMembershipId,
      insuranceApprovalCode: item.insuranceApprovalCode,
      note: item.note,
      // نسبة تحمل المريض — لازم تتنسخ هنا عشان الـ cache المحلي يبقى متطابق
      // مع Firestore daily doc (اللي بيتغذّى من toInsuranceExtra في costsHandlers)
      patientSharePercent: item.patientSharePercent,
      fromPatientFile: true,
      patientFileId: item.patientFileId,
      patientName: item.patientName,
    });
  }

  localStorage.setItem(key, JSON.stringify(extras));
  localStorage.setItem(`${key}_timestamp`, Date.now().toString());
}

// ─── Firestore sync ───────────────────────────────────────────────────────────

/** Firestore path: users/{uid}/patientFileData/{fileId} */
const fileDataRef = (userId: string, fileId: string) =>
  doc(db, 'users', userId, 'patientFileData', fileId);

export async function syncCostsToFirestore(
  userId: string,
  fileId: string,
  costItems: PatientCostItem[],
  insuranceItems: PatientInsuranceItem[]
): Promise<void> {
  if (!userId || !fileId) return;
  await setDoc(fileDataRef(userId, fileId), {
    costItems,
    insuranceItems,
    updatedAt: Date.now(),
  }, { merge: true });
}

/** Load from Firestore and populate localStorage caches (called on patient file open) */
export async function loadCostsFromFirestore(
  userId: string,
  fileId: string
): Promise<{ costItems: PatientCostItem[]; insuranceItems: PatientInsuranceItem[] }> {
  if (!userId || !fileId) return { costItems: [], insuranceItems: [] };
  try {
    const snap = await getDocCacheFirst(fileDataRef(userId, fileId));
    if (!snap.exists()) return { costItems: [], insuranceItems: [] };
    const data = snap.data() as { costItems?: PatientCostItem[]; insuranceItems?: PatientInsuranceItem[] };
    const costItems = data.costItems ?? [];
    const insuranceItems = data.insuranceItems ?? [];

    // Populate patient-file caches
    persistFileCosts(fileId, costItems);
    persistFileInsurance(fileId, insuranceItems);

    // Repopulate date-cost caches per unique date
    // ملاحظة: العناصر القادمة من Firestore بتحمل branchId (لو موجود)، فبيتفضّل تخزينها كده
    const datesWithCosts = new Set(costItems.map(c => c.dateKey));
    for (const dk of datesWithCosts) {
      const others = loadDateCosts(dk).filter(c => c.patientFileId !== fileId);
      persistDateCosts(dk, [...others, ...costItems.filter(c => c.dateKey === dk)]);
      // إعادة الحساب لكل الفروع اللي ليها عناصر في اليوم ده (بدون تمرير branchId محدد)
      recomputeDailyTotals(dk);
    }

    // Repopulate date-insurance caches per unique date
    const datesWithIns = new Set(insuranceItems.map(i => i.dateKey));
    for (const dk of datesWithIns) {
      // rebuild insurance extras for that date excluding old entries from this file then re-adding
      const extraKey = `insuranceExtra_${dk}`;
      let extras: any[] = [];
      try { extras = JSON.parse(localStorage.getItem(extraKey) ?? '[]'); } catch {}
      // remove old entries from this file
      extras = extras.filter((e: any) => e.patientFileId !== fileId);
      // add current — مع branchId عشان InsuranceClaimsSection يقدر يفلتر حسب الفرع
      for (const ins of insuranceItems.filter(i => i.dateKey === dk)) {
        extras.push({
          id: ins.id, companyId: ins.companyId ?? '', companyName: ins.companyName,
          type: ins.type, amount: ins.amount,
          branchId: ins.branchId,
          insuranceMembershipId: ins.insuranceMembershipId,
          insuranceApprovalCode: ins.insuranceApprovalCode,
          note: ins.note,
          // نسبة تحمل المريض — للحسابات المالية والكشف التفصيلي
          patientSharePercent: ins.patientSharePercent,
          fromPatientFile: true, patientFileId: ins.patientFileId, patientName: ins.patientName,
        });
      }
      localStorage.setItem(extraKey, JSON.stringify(extras));
      localStorage.setItem(`${extraKey}_timestamp`, Date.now().toString());
    }

    return { costItems, insuranceItems };
  } catch (err) {
    console.warn('[PatientCostService] Firestore load failed:', err);
    return { costItems: [], insuranceItems: [] };
  }
}

// ─── Real-time Firestore subscription ────────────────────────────────────────

/**
 * يراقب تغيُّرات ملف تكاليف المريض في Firestore لحظةً بلحظة.
 * يحدِّث localStorage والواجهة تلقائيًا على كل الأجهزة.
 * يُعيد دالة إلغاء الاشتراك (unsubscribe).
 */
export function subscribeToPatientFileCosts(
  userId: string,
  fileId: string,
  onUpdate: (costs: PatientCostItem[], insuranceItems: PatientInsuranceItem[]) => void,
): () => void {
  if (!userId || !fileId) return () => {};

  const ref = fileDataRef(userId, fileId);

  return onSnapshot(
    ref,
    (snap) => {
      const costItems: PatientCostItem[] = [];
      const insuranceItems: PatientInsuranceItem[] = [];

      if (snap.exists()) {
        const data = snap.data() as { costItems?: PatientCostItem[]; insuranceItems?: PatientInsuranceItem[] };
        costItems.push(...(data.costItems ?? []));
        insuranceItems.push(...(data.insuranceItems ?? []));
      }

      // ─── تحديث كاشات localStorage ───────────────────────────────────

      persistFileCosts(fileId, costItems);
      persistFileInsurance(fileId, insuranceItems);

      // cost date-index
      const datesWithCosts = new Set(costItems.map(c => c.dateKey));
      for (const dk of datesWithCosts) {
        const others = loadDateCosts(dk).filter(c => c.patientFileId !== fileId);
        persistDateCosts(dk, [...others, ...costItems.filter(c => c.dateKey === dk)]);
        recomputeDailyTotals(dk);
      }

      // insurance date-index
      const datesWithIns = new Set(insuranceItems.map(i => i.dateKey));
      for (const dk of datesWithIns) {
        const extraKey = `insuranceExtra_${dk}`;
        let extras: any[] = [];
        try { extras = JSON.parse(localStorage.getItem(extraKey) ?? '[]'); } catch {}
        extras = extras.filter((e: any) => e.patientFileId !== fileId);
        // Bug #C1 fix: لازم نحفظ branchId عشان الـ consumers يفلتروا صح
        // (كان ناقص هنا بينما موجود في loadCostsFromFirestore)
        for (const ins of insuranceItems.filter(i => i.dateKey === dk)) {
          extras.push({
            id: ins.id, companyId: ins.companyId ?? '', companyName: ins.companyName,
            type: ins.type, amount: ins.amount,
            branchId: ins.branchId,
            insuranceMembershipId: ins.insuranceMembershipId,
            insuranceApprovalCode: ins.insuranceApprovalCode,
            note: ins.note,
            // نسبة تحمل المريض — لازم تتنسخ هنا عشان الـcache المحلي يبقى متطابق
            // مع المصدر الموحّد في Firestore + الكشف التفصيلي يقرأ نسبة صحيحة
            patientSharePercent: ins.patientSharePercent,
            fromPatientFile: true, patientFileId: ins.patientFileId, patientName: ins.patientName,
          });
        }
        localStorage.setItem(extraKey, JSON.stringify(extras));
        localStorage.setItem(`${extraKey}_timestamp`, Date.now().toString());
      }

      onUpdate(costItems, insuranceItems);
      window.dispatchEvent(new Event('financialDataUpdated'));
    },
    (err) => {
      console.warn('[PatientCostService] Firestore snapshot error:', err);
      // استدعاء onUpdate ببيانات فارغة لإيقاف حالة التحميل في الواجهة
      onUpdate([], []);
    },
  );
}
