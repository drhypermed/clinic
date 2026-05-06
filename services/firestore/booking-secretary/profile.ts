/**
 * ملف السكرتارية (Secretary Profile Service)
 * هذا الملف مسؤول عن إدارة البيانات الشخصية للسكرتير:
 * 1. جلب اسم السكرتير المخزن.
 * 2. تحديث بيانات الملف الشخصي.
 * 3. الاشتراك في التحديثات اللحظية (Subscription) لضمان مزامنة الاسم عبر الأجهزة.
 *
 * عزل الفروع (Branch Isolation):
 *   - الاسم بيتحفظ في `nameByBranch.{branchId}` لكل فرع على حدة.
 *   - الحقل القديم `name` (flat) بيتعدل على إنه fallback للتوافق فقط — ما نكتبش عليه
 *     من الكتابة الجديدة عشان فرعين بنفس secret ما يدوسوش على بعض.
 *   - عند القراءة: نقرأ `nameByBranch[branchId]` أولاً، fallback للـ flat لو فاضي
 *     (يعني سكرتيرة قديمة لسه ما عملتش re-save بعد التحديث).
 */

import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { getDocCacheFirst } from '../cacheFirst';
import { db } from '../../firebaseConfig';
import { normalizeBookingSecret, toOptionalText } from './helpers';
import { SecretaryProfile } from '../../../types';

const DEFAULT_BRANCH_ID = 'main';

// نفس الـ pattern المستخدم في entryAlerts.ts لمنع injection عبر dot-notation
const SAFE_BRANCH_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

/** توحيد معرّف الفرع — fallback لـ 'main' لو غير صالح */
const normalizeBranchId = (branchId?: string): string => {
  const trimmed = String(branchId || '').trim();
  if (!trimmed) return DEFAULT_BRANCH_ID;
  if (!SAFE_BRANCH_ID_PATTERN.test(trimmed)) return DEFAULT_BRANCH_ID;
  return trimmed;
};

/** اختيار اسم السكرتيرة للفرع المطلوب من بيانات Firestore */
const pickNameForBranch = (
  data: Record<string, unknown> | undefined,
  branchId: string,
): string | undefined => {
  if (!data) return undefined;
  const byBranchRaw = data.nameByBranch;
  // أولوية للفرع المحدد لو موجود
  if (byBranchRaw && typeof byBranchRaw === 'object' && !Array.isArray(byBranchRaw)) {
    const branchValue = (byBranchRaw as Record<string, unknown>)[branchId];
    const branchName = toOptionalText(branchValue);
    if (branchName) return branchName;
  }
  // fallback للحقل القديم (للتوافق مع البيانات قبل الإصلاح)
  return toOptionalText(data.name);
};

/**
 * جلب الملف الشخصي للسكرتير.
 * - بيقبل `branchId` لقراءة اسم الفرع المحدد.
 * - بدون `branchId` → fallback للـ flat field (سلوك قديم).
 */
export const getSecretaryProfile = async (
  secret: string,
  branchId?: string,
): Promise<SecretaryProfile | null> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedSecret) return null;

  const profileRef = doc(db, 'secretaryProfiles', normalizedSecret);
  const snap = await getDocCacheFirst(profileRef);
  if (!snap.exists()) return null;

  const data = snap.data() as Record<string, unknown>;
  const normalizedBranch = normalizeBranchId(branchId);
  return {
    name: pickNameForBranch(data, normalizedBranch),
  };
};

/**
 * حفظ اسم السكرتيرة في فرعها فقط — كل فرع له entry مستقل في خريطة `nameByBranch`.
 *
 * مهم — ليه nested object مش dot-notation:
 *   `setDoc({ "nameByBranch.branch-x": "..." }, { merge: true })` ما بيتفسرش
 *   كـ nested path في Firebase JS SDK — بيتعامل معاه كـ field literal فيه
 *   نقطه في اسمه. النتيجه: الـ rules بترفض (الـ key مش ضمن الـ allowlist)،
 *   وحتى لو نجحت الكتابه، القراءه من `data.nameByBranch[branchId]` ترجع undefined.
 *   الحل: nested object + merge:true — Firestore بيدمج الـ maps بعمق فلا فرع
 *   بيدوس على فرع تاني، وأي client بيقرأ `nameByBranch[branchId]` بيلاقي قيمته.
 */
export const saveSecretaryProfile = async (
  secret: string,
  payload: { name?: string },
  branchId?: string,
): Promise<void> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedSecret) return;

  const profileRef = doc(db, 'secretaryProfiles', normalizedSecret);
  const normalizedName = toOptionalText(payload?.name);
  const normalizedBranch = normalizeBranchId(branchId);

  // nested map — مع merge:true بيتم الدمج العميق فالفروع التانيه بتتحفظ
  const writePayload: Record<string, unknown> = {
    nameByBranch: { [normalizedBranch]: normalizedName ?? null },
    updatedAt: new Date().toISOString(),
  };

  // نـ touch الـ flat فقط للفرع الرئيسي عشان ما ندوسش بيانات فروع تانية
  if (normalizedBranch === DEFAULT_BRANCH_ID) {
    writePayload.name = normalizedName ?? null;
  }

  await setDoc(profileRef, writePayload, { merge: true });
};

/**
 * الاشتراك في تغييرات ملف السكرتير لحظياً.
 * - أول استدعاء بيجيب الاسم فوراً من الكاش (Zero-Latency).
 * - بعدها onSnapshot بيستقبل أي تحديث من السيرفر لحظياً.
 * - بيقبل `branchId` لعزل الفروع — كل فرع يقرأ اسمه فقط.
 *
 * ملاحظة: قبل الإصلاح كان الـ subscribe يقرأ من الكاش مرة واحدة فقط (بدون onSnapshot)،
 * فلو السكرتيرة حفظت الاسم وفتحت الصفحة على جهاز ثاني، الاسم ما كانش يظهر.
 */
export const subscribeToSecretaryProfile = (
  secret: string,
  onUpdate: (data: SecretaryProfile) => void,
  onError?: (error: unknown) => void,
  branchId?: string,
) => {
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedSecret) {
    onUpdate({});
    return () => undefined;
  }

  const profileRef = doc(db, 'secretaryProfiles', normalizedSecret);
  const normalizedBranch = normalizeBranchId(branchId);

  // قراءة فورية من الكاش لظهور الاسم بدون تأخير
  getDocCacheFirst(profileRef).then((snap) => {
    if (!snap.exists()) return;
    const data = snap.data() as Record<string, unknown>;
    onUpdate({ name: pickNameForBranch(data, normalizedBranch) });
  }).catch((error) => {
    const code = String((error as { code?: unknown })?.code || '');
    if (code !== 'permission-denied') {
      console.error('[Firestore] Error reading secretary profile (cache):', error);
    }
  });

  // اشتراك حقيقي — أي تحديث من السيرفر يصل لحظياً
  return onSnapshot(
    profileRef,
    (snap) => {
      if (!snap.exists()) {
        onUpdate({});
        return;
      }
      const data = snap.data() as Record<string, unknown>;
      onUpdate({ name: pickNameForBranch(data, normalizedBranch) });
    },
    (error) => {
      const code = String((error as { code?: unknown })?.code || '');
      if (code !== 'permission-denied') {
        console.error('[Firestore] Error subscribing to secretary profile:', error);
      }
      if (onError) onError(error);
    }
  );
};
