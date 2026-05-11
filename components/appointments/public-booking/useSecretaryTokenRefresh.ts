// ─────────────────────────────────────────────────────────────────────────────
// Hook تجديد Firebase Custom Token للسكرتيرة (useSecretaryTokenRefresh)
// ─────────────────────────────────────────────────────────────────────────────
// 🔒 سياق أمني 2026-05-10:
// الـ Firebase Custom Token عمره ساعة بالظبط — بعدها auth.currentUser = null
// والكتابات على Firestore اللي بتطلب auth بترفض.
//
// الـ hook ده يضمن إن الـ Firebase Auth يفضل صالح طول جلسة السكرتيرة:
//   ١) فوراً على mount: لو الـ Firebase auth.currentUser = null أو الـ token هيخلص
//      قريب، نـrefresh على طول (مهم: لو السكرتيرة فتحت التطبيق بعد ساعة من الـlogin،
//      الـ token كان خلص بالفعل).
//   ٢) جدول دوري: كل ٥٠ دقيقة (الـ token عمره ساعة، فعندنا ١٠ دقايق احتياط)
//   ٣) عند تغيّر auth state: لو Firebase أعلن انتهاء الـ token، نجدّد فوراً
//   ٤) عند الـ retry بعد فشل: backoff قصير (دقيقة) عشان شبكة بتيجي وتروح
//
// لو الـ refresh كله فشل (offline طويل أو CF متعطل)، الـ session token عمره ٣٠ يوم،
// فلما الشبكة ترجع نقدر نجدّد.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import { httpsCallable } from 'firebase/functions';
import { signInWithCustomToken, onIdTokenChanged } from 'firebase/auth';
import { auth, functions } from '../../../services/firebaseConfig';

// كل ٥٠ دقيقة (الـ token عمره ساعة، فعندنا ١٠ دقايق احتياط)
const REFRESH_INTERVAL_MS = 50 * 60 * 1000;
// لو فشل refresh، نحاول تاني بعد دقيقة بدل ما نستنى ٥٠
const RETRY_AFTER_FAILURE_MS = 60 * 1000;
// لو الـ token هيخلص خلال ١٥ دقيقة → نجدّد فوراً
const REFRESH_BEFORE_EXPIRY_MS = 15 * 60 * 1000;

interface UseSecretaryTokenRefreshParams {
  /** سرّ الفرع/السكرتيرة (من الـ URL) */
  secret: string;
  /** session token المحفوظ في localStorage بعد الـ login */
  sessionToken: string;
  /** الفرع المسجّل دخوله (default: 'main') */
  branchId: string;
  /** فعّال بس لما السكرتيرة مسجلة دخول فعلاً */
  enabled: boolean;
}

const refreshCallable = httpsCallable(functions, 'refreshSecretaryCustomToken');

/**
 * يفحص لو الـ Firebase token الحالي هيخلص قريب أو خلص بالفعل.
 * بيرجع true لو محتاجين refresh، false لو فيه وقت كافي.
 */
const tokenNeedsRefresh = async (): Promise<boolean> => {
  const currentUser = auth.currentUser;
  if (!currentUser) return true; // مفيش auth → محتاج refresh
  try {
    const tokenResult = await currentUser.getIdTokenResult();
    const expirationTime = new Date(tokenResult.expirationTime).getTime();
    const msUntilExpiry = expirationTime - Date.now();
    return msUntilExpiry < REFRESH_BEFORE_EXPIRY_MS;
  } catch {
    // فشل قراءة token → نـrefresh للأمان
    return true;
  }
};

export const useSecretaryTokenRefresh = ({
  secret,
  sessionToken,
  branchId,
  enabled,
}: UseSecretaryTokenRefreshParams): void => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshInProgressRef = useRef(false);

  useEffect(() => {
    // لو مش مفعّل أو ناقص بيانات، نوقف
    if (!enabled || !secret || !sessionToken) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    let cancelled = false;

    const performRefresh = async (reason: string) => {
      if (cancelled || refreshInProgressRef.current) return;
      refreshInProgressRef.current = true;
      try {
        const result = await refreshCallable({
          secret,
          sessionToken,
          branchId: branchId || 'main',
        });
        const data = (result.data || {}) as { customAuthToken?: string };
        if (cancelled) return;
        const newToken = String(data.customAuthToken || '').trim();
        if (newToken) {
          await signInWithCustomToken(auth, newToken);
          console.info('[SecretaryTokenRefresh] Refreshed (' + reason + ')');
        }
        // نجح → نعيد جدولة الـ refresh التالي
        if (!cancelled) {
          timerRef.current = setTimeout(() => performRefresh('scheduled'), REFRESH_INTERVAL_MS);
        }
      } catch (error) {
        console.warn('[SecretaryTokenRefresh] Refresh failed (' + reason + '), retry in 1min:', error);
        // فشل → نحاول تاني بعد فترة قصيرة (شبكة بتيجي وتروح)
        if (!cancelled) {
          timerRef.current = setTimeout(() => performRefresh('retry'), RETRY_AFTER_FAILURE_MS);
        }
      } finally {
        refreshInProgressRef.current = false;
      }
    };

    // ١) على mount: نفحص حالة الـ token الحالي. لو خلص أو هيخلص قريب → refresh فوراً
    void (async () => {
      const needsRefresh = await tokenNeedsRefresh();
      if (cancelled) return;
      if (needsRefresh) {
        await performRefresh('on-mount-expired');
      } else {
        // الـ token لسه صالح — جدول refresh تالي على الـ interval العادي
        timerRef.current = setTimeout(() => performRefresh('scheduled'), REFRESH_INTERVAL_MS);
      }
    })();

    // ٢) Listener على تغيّر auth state — لو Firebase أعلن إن الـ token خلص فجأة
    const unsubAuth = onIdTokenChanged(auth, (user) => {
      if (cancelled) return;
      if (!user && enabled) {
        // الـ user اتـnull (token expired or cleared) → نـrefresh
        void performRefresh('auth-state-cleared');
      }
    });

    return () => {
      cancelled = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      unsubAuth();
    };
  }, [enabled, secret, sessionToken, branchId]);
};
