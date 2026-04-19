/**
 * خدمة إدارة شركات التأمين المتعاقدة (Insurance Companies Service)
 * 
 * المسؤوليات:
 * 1. إضافة/تعديل/حذف/جلب شركات التأمين من Firestore
 * 2. الاشتراك اللحظي (Real-time) في تحديثات الشركات
 * 3. حساب تحمل المريض وتحمل الشركة تلقائياً
 * 
 * مسارات التخزين في Firestore:
 *   users/{userId}/insuranceCompanies/{companyId}             (المصدر الأساسي للطبيب)
 *   bookingConfig/{secret}/insuranceCompanies/{companyId}     (مرآة للسكرتارية عبر secret)
 */

import { db } from './firebaseConfig';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  deleteField,
  query,
  orderBy,
} from 'firebase/firestore';
import { getDocCacheFirst, getDocsCacheFirst } from './firestore/cacheFirst';
import { getBookingSecretByUserId } from './firestore/booking-secretary/secretConfig.secret';
import type { PaymentType } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// أنواع البيانات | Data Types
// ─────────────────────────────────────────────────────────────────────────────

/** هيكل شركة التأمين المخزنة في Firestore */
export interface InsuranceCompany {
  id: string;
  /** اسم شركة التأمين (مثلاً: أكسا، ميتلايف، بوبا) */
  name: string;
  /** نسبة تحمل المريض الافتراضية من إجمالي قيمة الكشف (0-100) — تُستعمل لو لم يُحدَّد override للفرع. */
  patientSharePercent: number;
  /**
   * override لنسبة تحمل المريض لكل فرع على حدة. المفتاح هو `branchId`.
   * لو الفرع غير موجود في هذه الخريطة → يُستخدم `patientSharePercent` الافتراضية.
   * مثال: `{ 'branch-cairo': 25, 'branch-alex': 30 }` مع default 20%.
   */
  patientSharePercentByBranch?: Record<string, number>;
  /** ملاحظات إضافية عن الشركة */
  notes?: string;
  /** تاريخ إنشاء السجل */
  createdAt: string;
  /** تاريخ آخر تحديث */
  updatedAt?: string;
}

const DEFAULT_BRANCH_ID = 'main';

const normalizeBranchId = (branchId?: string): string =>
  (branchId || DEFAULT_BRANCH_ID).trim() || DEFAULT_BRANCH_ID;

const clampPercent = (value: number): number => Math.max(0, Math.min(100, value));

/**
 * يرجع نسبة تحمل المريض الفعلية لشركة في فرع محدد.
 * - لو فيه override للفرع في `patientSharePercentByBranch` → يُستخدم.
 * - وإلا يُستخدم الـ default `patientSharePercent`.
 */
export const resolvePatientSharePercentForBranch = (
  company: Pick<InsuranceCompany, 'patientSharePercent' | 'patientSharePercentByBranch'>,
  branchId?: string,
): number => {
  const normalizedBranch = normalizeBranchId(branchId);
  const overrides = company.patientSharePercentByBranch;
  if (overrides && typeof overrides === 'object') {
    const raw = overrides[normalizedBranch];
    if (typeof raw === 'number' && Number.isFinite(raw)) {
      return clampPercent(raw);
    }
  }
  return clampPercent(company.patientSharePercent || 0);
};

/** بيانات التأمين المرتبطة بكشف مريض */
interface InsuranceRecordData {
  /** الدفع */
  paymentType: PaymentType;
  /** معرف شركة التأمين */
  insuranceCompanyId?: string;
  /** اسم شركة التأمين (للعرض السريع بدون استعلام إضافي) */
  insuranceCompanyName?: string;
  /** كود الموافقة من شركة التأمين */
  insuranceApprovalCode?: string;
  /** رقم كارنيه التأمين الخاص بالمريض */
  insuranceMembershipId?: string;
  /** نسبة تحمل المريض وقت الكشف (تُحفظ لحفظ السجل التاريخي حتى لو تغيرت النسبة لاحقاً) */
  patientSharePercent?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// دوال حسابية | Financial Calculations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * حساب تقسيم التكلفة بين المريض وشركة التأمين
 * @param totalPrice - إجمالي سعر الكشف/الاستشارة
 * @param patientSharePercent - نسبة تحمل المريض (0-100)
 * @returns حصة المريض وحصة الشركة
 */
const calculateInsuranceShares = (
  totalPrice: number,
  patientSharePercent: number
): { patientShare: number; companyShare: number } => {
  const clampedPercent = Math.max(0, Math.min(100, patientSharePercent));
  const patientShare = Math.round((totalPrice * clampedPercent) / 100);
  const companyShare = totalPrice - patientShare;
  return { patientShare, companyShare };
};

// ─────────────────────────────────────────────────────────────────────────────
// خدمة Firestore | Firestore Service
// ─────────────────────────────────────────────────────────────────────────────

/** مرجع مجموعة شركات التأمين لمستخدم معين */
const getCompaniesRef = (userId: string) =>
  collection(db, 'users', userId, 'insuranceCompanies');

/** مرجع شركات التأمين المرآة داخل إعدادات السكرتارية عبر secret */
const getBookingConfigCompaniesRef = (secret: string) =>
  collection(db, 'bookingConfig', secret, 'insuranceCompanies');

const normalizeBookingSecret = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

const getUserBookingSecret = async (userId: string): Promise<string> => {
  try {
    if (!userId) return '';
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDocCacheFirst(userRef);
    const data = userSnap.exists() ? (userSnap.data() as { bookingSecret?: unknown }) : {};
    const secretFromUserDoc = normalizeBookingSecret(data?.bookingSecret);
    if (secretFromUserDoc) return secretFromUserDoc;

    // Fallback for legacy accounts where bookingSecret is only discoverable from bookingConfig.
    const fallbackSecret = await getBookingSecretByUserId(userId).catch(() => null);
    return normalizeBookingSecret(fallbackSecret);
  } catch (error) {
    console.warn('[InsuranceService] Failed to read booking secret for insurance mirror sync:', error);
    return '';
  }
};

const mapCompaniesSnapshot = (snapshot: any): InsuranceCompany[] =>
  snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() } as InsuranceCompany));

/**
 * مزامنة شركة تأمين إلى مرآة `bookingConfig/{secret}/insuranceCompanies`.
 * يقبل إما `InsuranceCompany` كاملة (للـ background sync من القائمة) أو
 * `Record<string, unknown>` (يدعم `deleteField()`) للـ writePayload الناتج من saveCompany —
 * بحيث لو الحقل تم مسحه في users، يُمسح كذلك في المرآة.
 */
const syncCompanyToBookingConfig = async (
  userId: string,
  companyIdOrCompany: string | InsuranceCompany,
  payload?: Record<string, unknown>
): Promise<void> => {
  try {
    const bookingSecret = await getUserBookingSecret(userId);
    if (!bookingSecret) return;

    // التوقيع القديم: (userId, company) → نمرر الكائن نفسه + نقرأ الـ id منه
    // التوقيع الجديد: (userId, companyId, writePayload) → نستخدم الـ payload صراحة
    const companyId = typeof companyIdOrCompany === 'string'
      ? companyIdOrCompany
      : companyIdOrCompany.id;
    // نطرح spread عشان نضمن متطابقة الـ index signature المطلوبة بـ setDoc
    const writeData: Record<string, unknown> =
      payload !== undefined
        ? payload
        : { ...(companyIdOrCompany as InsuranceCompany) };

    await setDoc(doc(getBookingConfigCompaniesRef(bookingSecret), companyId), writeData, { merge: true });
  } catch (error) {
    console.warn('[InsuranceService] Failed syncing insurance company to booking config:', error);
  }
};

const deleteCompanyFromBookingConfig = async (
  userId: string,
  companyId: string
): Promise<void> => {
  try {
    const bookingSecret = await getUserBookingSecret(userId);
    if (!bookingSecret) return;
    await deleteDoc(doc(getBookingConfigCompaniesRef(bookingSecret), companyId));
  } catch (error) {
    console.warn('[InsuranceService] Failed deleting mirrored insurance company from booking config:', error);
  }
};

export const insuranceService = {
  /**
   * جلب جميع شركات التأمين المتعاقدة (مع دعم الكاش)
   * تُستخدم عند فتح صفحة التقارير المالية أو بدء كشف جديد
   */
  getCompanies: async (userId: string): Promise<InsuranceCompany[]> => {
    if (!userId) return [];
    try {
      const q = query(getCompaniesRef(userId), orderBy('name', 'asc'));
      const snapshot = await getDocsCacheFirst(q);
      const companies = mapCompaniesSnapshot(snapshot);
      // مزامنة غير معيقة للخلفية حتى ترى السكرتارية نفس الشركات عبر secret.
      void Promise.all(companies.map((company) => syncCompanyToBookingConfig(userId, company)));
      return companies;
    } catch (error) {
      console.error('[InsuranceService] Error getting companies:', error);
      return [];
    }
  },

  /**
   * جلب شركات التأمين من مسار السكرتارية (bookingConfig/{secret}) للعرض في واجهة السكرتارية.
   */
  getCompaniesBySecret: async (secret: string): Promise<InsuranceCompany[]> => {
    const normalizedSecret = normalizeBookingSecret(secret);
    if (!normalizedSecret) return [];
    try {
      const q = query(getBookingConfigCompaniesRef(normalizedSecret), orderBy('name', 'asc'));
      const snapshot = await getDocsCacheFirst(q);
      return mapCompaniesSnapshot(snapshot);
    } catch (error) {
      console.error('[InsuranceService] Error getting companies by secret:', error);
      return [];
    }
  },

  /**
   * الاشتراك في تحديثات شركات التأمين بشكل لحظي
   * يُستخدم في واجهة إدارة الشركات لعرض التحديثات فوراً
   */
  subscribeToCompanies: (
    userId: string,
    callback: (companies: InsuranceCompany[]) => void
  ): (() => void) => {
    if (!userId) {
      callback([]);
      return () => {};
    }
    const q = query(getCompaniesRef(userId), orderBy('name', 'asc'));
    let cancelled = false;

    getDocsCacheFirst(q).then((snapshot) => {
      if (cancelled) return;
      const companies = mapCompaniesSnapshot(snapshot);
      // مزامنة غير معيقة للخلفية حتى ترى السكرتارية نفس الشركات عبر secret.
      void Promise.all(companies.map((company) => syncCompanyToBookingConfig(userId, company)));
      callback(companies);
    }).catch(() => {
      if (!cancelled) callback([]);
    });

    return () => { cancelled = true; };
  },

  /**
   * اشتراك لحظي في شركات التأمين عبر secret (مخصص لواجهة السكرتارية).
   */
  subscribeToCompaniesBySecret: (
    secret: string,
    callback: (companies: InsuranceCompany[]) => void
  ): (() => void) => {
    const normalizedSecret = normalizeBookingSecret(secret);
    if (!normalizedSecret) {
      callback([]);
      return () => {};
    }
    const q = query(getBookingConfigCompaniesRef(normalizedSecret), orderBy('name', 'asc'));
    let cancelled = false;

    getDocsCacheFirst(q).then((snapshot) => {
      if (cancelled) return;
      callback(mapCompaniesSnapshot(snapshot));
    }).catch(() => {
      if (!cancelled) callback([]);
    });

    return () => { cancelled = true; };
  },

  /**
   * إضافة أو تعديل شركة تأمين
   * إذا كان id فارغاً يتم إنشاء معرف جديد تلقائياً
   */
  saveCompany: async (
    userId: string,
    company: Omit<InsuranceCompany, 'id' | 'createdAt' | 'updatedAt'> & {
      id?: string;
      createdAt?: string;
    }
  ): Promise<string> => {
    if (!userId) throw new Error('User ID is required');

    const companyId = company.id || doc(getCompaniesRef(userId)).id;
    const docRef = doc(getCompaniesRef(userId), companyId);

    // تنظيف خريطة per-branch: نتجاهل القيم غير الصالحة ونـ clamp الباقي بين 0-100
    const rawOverrides = company.patientSharePercentByBranch;
    const normalizedOverrides: Record<string, number> = {};
    if (rawOverrides && typeof rawOverrides === 'object') {
      for (const [branchKey, value] of Object.entries(rawOverrides)) {
        if (typeof value === 'number' && Number.isFinite(value)) {
          normalizedOverrides[normalizeBranchId(branchKey)] = clampPercent(value);
        }
      }
    }

    const hasOverrides = Object.keys(normalizedOverrides).length > 0;

    // الكائن الأساسي للحقول العادية (يُستخدم أيضاً في المرآة)
    const data: InsuranceCompany = {
      id: companyId,
      name: company.name.trim(),
      patientSharePercent: clampPercent(company.patientSharePercent),
      notes: company.notes?.trim() || '',
      createdAt: company.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (hasOverrides) {
      data.patientSharePercentByBranch = normalizedOverrides;
    }

    // payload الفعلي للكتابة — لو الـ overrides فاضية لكنها كانت موجودة قبل،
    // لازم نمسحها صراحة من Firestore بـ deleteField() حتى لا يفضل الحقل القديم.
    const writePayload: Record<string, unknown> = { ...data };
    if (!hasOverrides) {
      writePayload.patientSharePercentByBranch = deleteField();
    }

    // الحفاظ على الحقول الأخرى (السجل التاريخي) عبر merge: true.
    // نعتمد على deleteField لمسح الـ overrides لو فاضية.
    await setDoc(docRef, writePayload, { merge: true });
    // تمرير نفس الـ payload للمرآة في bookingConfig حتى تُحذف overrides منها أيضاً.
    void syncCompanyToBookingConfig(userId, companyId, writePayload);
    return companyId;
  },

  /**
   * حذف شركة تأمين
   * ⚠️ لن يؤثر على السجلات القديمة لأن اسم الشركة محفوظ فيها
   */
  deleteCompany: async (userId: string, companyId: string): Promise<void> => {
    if (!userId || !companyId) throw new Error('User ID and Company ID are required');
    const docRef = doc(getCompaniesRef(userId), companyId);
    await deleteDoc(docRef);
    void deleteCompanyFromBookingConfig(userId, companyId);
  },
};
