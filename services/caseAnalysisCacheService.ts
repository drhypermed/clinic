// ═══════════════════════════════════════════════════════════════════════════
// خدمة كاش تحليل الحالة (Case Analysis Cache Service)
// ───────────────────────────────────────────────────────────────────────────
// الغرض: حفظ نتيجة تحليل الحالة السحابياً لمدة شهر (30 يوم) بحيث لو الطبيب
// ضغط "تحليل الحالة" مرة تانية على نفس الكشف/الاستشارة (نفس البيانات) النافذة
// تفتح فوراً بدون نداء AI جديد = توفير كوتا وتكلفة ضخمة على سكيل 1000+ طبيب.
//
// آلية العمل:
//   1) نعمل hash (SHA-1) من كل المدخلات السريرية + الهوية (نوع/حمل/رضاعة/سن/وزن/علامات)
//   2) نبحث في users/{uid}/caseAnalysisCache/{hash} في Firestore
//   3) لو لقينا نتيجة غير منتهية → نرجعها مباشرة (hit)
//   4) لو مفيش → نعمل التحليل الجديد ونحفظه بـ expiresAt = now + 30 days
//
// ملاحظة TTL: Firestore عنده ميزة TTL لحذف المستندات المنتهية تلقائياً.
// لتفعيلها المالك يروح Firebase Console → Firestore → TTL → يضيف policy على
// `expiresAt`. حتى لو متفعلتش، الكود بيتجاهل أي entry منتهي عند القراءة.
// ═══════════════════════════════════════════════════════════════════════════

import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { PatientGender, VitalSigns } from '../types';
import type { CaseAnalysisResult } from './geminiCaseAnalysisService';

// ─── الإدخالات اللي بنعمل hash عليها ─────────────────────────────────────
// أي تغيير في أي حقل من دول = كاش جديد (عشان ما نعرضش نتيجة قديمة على بيانات
// المريض جديدة). النوع/الحمل/الرضاعة مهمين جداً للسلامة.
export interface CaseAnalysisCacheKeyInput {
  complaint: string;
  medicalHistory: string;
  examination: string;
  investigations: string;
  ageYears: number;
  ageMonths: number;
  ageDays: number;
  weightKg: number;
  heightCm?: number;
  gender: PatientGender | '';
  pregnant: boolean | null;
  breastfeeding: boolean | null;
  vitals: VitalSigns;
}

/**
 * الترجمة المحفوظة بجانب التحليل — لما الطبيب يفتح نفس الكشف تاني نرجّعها من
 * الكاش بدل ما نعمل نداء AI ثاني للترجمة = صفر نداء AI على cache hit!
 */
export interface CachedTranslations {
  complaintEn: string;
  historyEn: string;
  examEn: string;
  investigationsEn: string;
}

// ─── بنية المستند المحفوظ في الكاش ────────────────────────────────────────
// ملاحظة: result و translations الاتنين optional لأن:
//   - زر "إضافة للروشتة" يحفظ translations بس (مفيش تحليل غني)
//   - زر "تحليل الحالة" يحفظ الاتنين
// عند القراءة بنشيّك كل حقل على حدة — مش بنفترض وجوده.
interface CaseAnalysisCacheDoc {
  inputHash: string;                       // نفس الـ hash اللي في doc ID — للتأكيد
  result?: CaseAnalysisResult;             // النتيجة الغنية (DDx, Must-Not-Miss, ...)
  translations?: CachedTranslations;       // الترجمة المحفوظة
  createdAt: Timestamp;                    // وقت الإنشاء
  expiresAt: Timestamp;                    // وقت الانتهاء (createdAt + 30 days)
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// ─── أدوات داخلية ───────────────────────────────────────────────────────
const toText = (v: unknown): string => (v ?? '').toString().trim();

/**
 * تحويل قيمة رقمية إلى نص طبيعي للـ hash. Number.isFinite يمسك NaN و Infinity
 * وبيرجعنا لصفر عشان تطابق الـ inputs الفاضية.
 */
const toNumStr = (n: number | undefined): string => {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '0';
  // نقرّب العائم لرقمين عشريين عشان 10.001 و 10.002 ياخدوا نفس الكاش
  return n.toFixed(2);
};

/**
 * تسلسل الـ inputs لسلسلة deterministic (نفس الترتيب كل مرة).
 * ⚠️ الترتيب هنا حرج — لو غيّرناه الكاش القديم هيتجاهل كله ونضيّع لو معندناش
 * migration (مش مشكلة دلوقتي لأن الكاش tolerant لـ misses — هيبني نفسه تاني).
 */
const serializeInput = (input: CaseAnalysisCacheKeyInput): string => {
  const parts = [
    'c=' + toText(input.complaint).toLowerCase(),
    'h=' + toText(input.medicalHistory).toLowerCase(),
    'e=' + toText(input.examination).toLowerCase(),
    'i=' + toText(input.investigations).toLowerCase(),
    'ay=' + String(input.ageYears || 0),
    'am=' + String(input.ageMonths || 0),
    'ad=' + String(input.ageDays || 0),
    'w=' + toNumStr(input.weightKg),
    'ht=' + toNumStr(input.heightCm),
    'g=' + (input.gender || 'u'),          // u = unspecified
    'p=' + (input.pregnant === null ? 'u' : input.pregnant ? 'y' : 'n'),
    'b=' + (input.breastfeeding === null ? 'u' : input.breastfeeding ? 'y' : 'n'),
    // العلامات الحيوية — أي تغير في أي قياس = كاش جديد
    'v=' + [input.vitals.bp, input.vitals.pulse, input.vitals.temp, input.vitals.rbs, input.vitals.spo2, input.vitals.rr]
      .map(toText).join('|'),
  ];
  return parts.join('\n');
};

/**
 * حساب SHA-1 hex للنص — باستخدام Web Crypto API المتاح في المتصفح.
 * نستخدم SHA-1 عشان الطول مناسب لـ doc ID (40 حرف hex) والسرعة.
 * Fallback على hash بسيط لو الـ API مش متاح (بيئة قديمة جداً).
 */
const sha1Hex = async (text: string): Promise<string> => {
  const subtle = (globalThis as { crypto?: Crypto }).crypto?.subtle;
  if (subtle && typeof subtle.digest === 'function') {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await subtle.digest('SHA-1', data);
    const bytes = new Uint8Array(hashBuffer);
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
      hex += bytes[i].toString(16).padStart(2, '0');
    }
    return hex;
  }
  // Fallback: FNV-1a 32-bit (ضعيف لكن يشتغل — بيئات بدون crypto.subtle نادرة جداً)
  let h = 0x811c9dc5 >>> 0;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return ('fnv' + h.toString(16)).padStart(40, '0');
};

/**
 * إنشاء cache key مستقر للـ input السريري.
 * هتتحسب مرتين (عند القراءة وعند الكتابة) وتطلع نفس النتيجة كل مرة.
 */
export const computeCaseAnalysisCacheKey = async (
  input: CaseAnalysisCacheKeyInput,
): Promise<string> => {
  const serialized = serializeInput(input);
  return sha1Hex(serialized);
};

// ─── قراءة الكاش ─────────────────────────────────────────────────────────
/**
 * محاولة جلب نتيجة تحليل من الكاش.
 * - لو فيه نتيجة صالحة (غير منتهية) ترجع `{ hit: true, result }`.
 * - لو مفيش أو منتهية أو خطأ ترجع `{ hit: false }` بدون رمي استثناء.
 *
 * نستخدم { source: 'default' } عشان يستفيد من الـ Firestore offline cache
 * تلقائياً (القراءة من الجهاز أسرع + بدون تكلفة شبكة لو نفس الجلسة).
 */
export const getCachedCaseAnalysis = async (
  userId: string,
  cacheKey: string,
): Promise<
  | { hit: true; result?: CaseAnalysisResult; translations?: CachedTranslations }
  | { hit: false }
> => {
  if (!userId || !cacheKey) return { hit: false };
  try {
    const ref = doc(db, 'users', userId, 'caseAnalysisCache', cacheKey);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { hit: false };

    const data = snap.data() as CaseAnalysisCacheDoc | undefined;
    if (!data) return { hit: false };

    // تحقق من صلاحية الكاش (expiresAt في المستقبل)
    const expiresAtMs = data.expiresAt?.toMillis?.() ?? 0;
    if (!expiresAtMs || expiresAtMs < Date.now()) {
      // منتهي — نعتبره miss (الـ TTL hook في Firebase Console هيحذفه بعد شوية)
      return { hit: false };
    }

    // لو مفيش أي من result/translations = hit فارغ = اعتبره miss
    if (!data.result && !data.translations) return { hit: false };

    // ممكن يرجع translations بس (Quick حفظ) أو result + translations (Deep حفظ)
    return { hit: true, result: data.result, translations: data.translations };
  } catch (error) {
    // مش بنرمي الخطأ — offline أو permission denied = نمشي على نداء AI جديد
    console.warn('[caseAnalysisCache] read miss due to error:', error);
    return { hit: false };
  }
};

// ─── كتابة الكاش ─────────────────────────────────────────────────────────
/**
 * حفظ/تحديث الكاش لمدة 30 يوم.
 *
 * Signature مرن: بيقبل إما:
 *   - `translations` فقط (زر "إضافة للروشتة" — ترجمة بدون تحليل غني)
 *   - `result` فقط (نادر)
 *   - الاتنين مع بعض (زر "تحليل الحالة" بعد cache miss كامل)
 *
 * يستخدم `setDoc` مع `merge: true` عشان لو الكاش عنده `result` قديم والـ quick
 * بيحفظ `translations` بس، الـ `result` ما يتمسحش. كل حفظ يجدّد الـ expiresAt
 * تلقائياً = استخدام متكرر يحافظ على الكاش حي طول ما الطبيب بيشتغل.
 *
 * مش بنرمي أي خطأ — الحفظ best-effort؛ الفلو الأساسي شغال حتى لو فشل.
 */
export const saveCaseAnalysisToCache = async (
  userId: string,
  cacheKey: string,
  patch: { result?: CaseAnalysisResult; translations?: CachedTranslations },
): Promise<void> => {
  if (!userId || !cacheKey) return;
  if (!patch.result && !patch.translations) return; // مفيش حاجة نحفظها
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + THIRTY_DAYS_MS);
    const payload: Partial<CaseAnalysisCacheDoc> = {
      inputHash: cacheKey,
      createdAt: Timestamp.fromDate(now),
      expiresAt: Timestamp.fromDate(expiresAt),
    };
    if (patch.result) payload.result = patch.result;
    if (patch.translations) payload.translations = patch.translations;
    const ref = doc(db, 'users', userId, 'caseAnalysisCache', cacheKey);
    await setDoc(ref, payload, { merge: true });
  } catch (error) {
    console.warn('[caseAnalysisCache] save failed (non-fatal):', error);
  }
};
