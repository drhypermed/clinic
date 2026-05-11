/**
 * useDoctorStatsSummary:
 * Hook بيقرا doc الإحصائيات الجاهز من users/{uid}/stats/summary
 * بدلاً من ما الواجهة تعدّ كل السجلات في الذاكرة في كل فتحة.
 *
 * الفلسفة (مفتاح أمان):
 *   - الـ feature flag مقفول → بيرجع `null` (الواجهة تكمّل بالحساب المحلي).
 *   - الـ flag مفتوح → بيقرا doc الإحصائيات اللي بتحدّثه Cloud Function
 *     `syncDoctorStatsSummary` على كل save/delete سجل.
 *   - أي خطأ في القراءة → يرجع null والواجهة تكمّل بالحساب المحلي.
 *
 * مهم لما الـpagination مفعّل (المرحلة 3): الواجهة بتحمّل 50 سجل بس،
 * فالحساب المحلي للإحصائيات هيطلع غلط. الـsummary بيحلّ المشكلة دي
 * لأنه محسوب من كل السجلات على السيرفر.
 *
 * تكلفة Firestore: قراءة واحدة من الكاش (فوراً) + قراءة من السيرفر مرة
 * عند الفتح. لو الطبيب حفظ سجل، الـ Cloud Function تحدّث الـsummary بعد
 * ثوانٍ، وأقرب refresh من الواجهة (تنقّل بين الصفحات/فتح صفحة السجلات
 * تاني) هيقرأ الجديد. مفيش onSnapshot عشان نوفّر تكلفة الـlistener.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { doc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { getDocCacheFirst } from '../services/firestore/cacheFirst';

/** الشكل الموحّد لملخص إحصائيات الطبيب الجاي من السيرفر */
export interface DoctorStatsSummary {
  examsToday: number;
  consultationsToday: number;
  examsThisMonth: number;
  consultationsThisMonth: number;
  uniquePatients: number;
  /** YYYY-MM-DD — اليوم اللي عداد "اليوم" متخزّن له */
  todayKey?: string;
  /** YYYY-MM — الشهر اللي عداد "الشهر" متخزّن له */
  monthKey?: string;
}

/** هل الـ feature flag مفعّل؟
 *
 * الافتراضي: مفعّل لكل المستخدمين (بعد إطلاق المرحلة 1 على الإنتاج).
 * لإيقافه (kill switch) في حالة طارئة:
 *   - env var وقت البناء: VITE_DOCTOR_STATS_COUNTER_ENABLED=false
 *   - أو localStorage على الجهاز: dh_doctor_stats_counter_enabled = "false"
 * أي قيمة تانية أو غياب الـflag = الميزة شغّالة.
 */
const isStatsSummaryEnabled = (): boolean => {
  const envFlag = String(import.meta.env.VITE_DOCTOR_STATS_COUNTER_ENABLED || '').trim().toLowerCase();
  if (envFlag === 'false' || envFlag === '0' || envFlag === 'off' || envFlag === 'no') return false;
  try {
    const localFlag = String(localStorage.getItem('dh_doctor_stats_counter_enabled') || '').trim().toLowerCase();
    if (localFlag === 'false' || localFlag === '0' || localFlag === 'off' || localFlag === 'no') return false;
  } catch {
    // الـ localStorage مش متاح — نكمّل بالافتراضي (مفعّل)
  }
  return true;
};

export interface UseDoctorStatsSummaryResult {
  /** الإحصائيات الجاهزة، أو null لو الـflag مقفول/الـdoc مش موجود/خطأ. */
  summary: DoctorStatsSummary | null;
  /** Loading أول قراءة. */
  loading: boolean;
  /** إعادة قراءة الـdoc من السيرفر — تُستدعى بعد حفظ/حذف سجل. */
  refresh: () => Promise<void>;
}

/**
 * @param userId معرّف الطبيب (null = مفيش login)
 * @returns الـsummary أو null لو الـflag مقفول.
 */
export const useDoctorStatsSummary = (
  userId: string | null | undefined,
): UseDoctorStatsSummaryResult => {
  const [summary, setSummary] = useState<DoctorStatsSummary | null>(null);
  const [loading, setLoading] = useState(false);

  // مفتاح الجلسة عشان نلغي قراءات قديمة لو الـuserId اتغيّر
  const sessionKeyRef = useRef<string>('');

  const enabled = isStatsSummaryEnabled();

  // ─── تحويل DocumentSnapshot لـ DoctorStatsSummary ─────────────────
  const mapSnapshotToSummary = useCallback((data: unknown): DoctorStatsSummary | null => {
    if (!data || typeof data !== 'object') return null;
    const raw = data as Record<string, unknown>;
    return {
      examsToday: Number(raw.examsToday || 0),
      consultationsToday: Number(raw.consultationsToday || 0),
      examsThisMonth: Number(raw.examsThisMonth || 0),
      consultationsThisMonth: Number(raw.consultationsThisMonth || 0),
      uniquePatients: Number(raw.uniquePatients || 0),
      todayKey: typeof raw.todayKey === 'string' ? raw.todayKey : undefined,
      monthKey: typeof raw.monthKey === 'string' ? raw.monthKey : undefined,
    };
  }, []);

  // ─── دالة قراءة (تستخدمها mount + refresh) ─────────────────────────
  const fetchSummary = useCallback(async (sessionKey: string) => {
    if (!enabled || !userId) return;
    const summaryRef = doc(db, 'users', userId, 'stats', 'summary');
    try {
      const snap = await getDocCacheFirst(summaryRef);
      if (sessionKeyRef.current !== sessionKey) return;
      if (!snap.exists()) {
        setSummary(null);
        return;
      }
      const mapped = mapSnapshotToSummary(snap.data());
      setSummary(mapped);
    } catch (error) {
      if (sessionKeyRef.current !== sessionKey) return;
      console.warn('[useDoctorStatsSummary] fetch failed, falling back to local calc:', error);
      setSummary(null);
    }
  }, [enabled, userId, mapSnapshotToSummary]);

  // ─── أول قراءة عند الـmount أو تغيّر الـuserId ─────────────────────
  useEffect(() => {
    if (!enabled || !userId) {
      setSummary(null);
      setLoading(false);
      return;
    }

    const sessionKey = `${userId}-${Date.now()}`;
    sessionKeyRef.current = sessionKey;

    setLoading(true);
    fetchSummary(sessionKey).finally(() => {
      if (sessionKeyRef.current === sessionKey) setLoading(false);
    });

    return () => {
      // أي قراءة لاحقة سيتم تجاهل نتيجتها
      sessionKeyRef.current = '';
    };
  }, [enabled, userId, fetchSummary]);

  // ─── refresh: للتحديث اليدوي بعد حفظ سجل ──────────────────────────
  const refresh = useCallback(async () => {
    const sessionKey = sessionKeyRef.current || `${userId}-${Date.now()}`;
    sessionKeyRef.current = sessionKey;
    await fetchSummary(sessionKey);
  }, [fetchSummary, userId]);

  return { summary, loading, refresh };
};
