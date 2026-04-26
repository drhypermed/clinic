import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const FIRESTORE_AUTO_RELOAD_KEY = 'drh_firestore_assertion_auto_reload_done';
const CHUNK_AUTO_RECOVERY_KEY = 'drh_chunk_auto_recovery_ts';
const CHUNK_AUTO_RECOVERY_COOLDOWN_MS = 2 * 60 * 1000;
const RECOVERY_QUERY_PARAM = 'reset_pwa';
const RECOVERY_TS_QUERY_PARAM = 'dh_recover_ts';

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error ?? '');
};

const isFirestoreInternalAssertion = (error: unknown): boolean => {
  const message = toErrorMessage(error);
  return message.includes('FIRESTORE') && message.includes('INTERNAL ASSERTION FAILED');
};

const isDynamicImportChunkFailure = (error: unknown): boolean => {
  const message = toErrorMessage(error).toLowerCase();
  if (!message) return false;

  return (
    message.includes('chunkloaderror') ||
    message.includes('failed to fetch dynamically imported module') ||
    message.includes('loading chunk') ||
    message.includes('unsupported mime type') ||
    message.includes("mime type ('text/html')") ||
    message.includes('importscripts failed')
  );
};

/** هل الجهاز أوفلاين دلوقتي؟ */
const isOffline = (): boolean =>
  typeof navigator !== 'undefined' && navigator.onLine === false;

/** هل الخطأ بسبب انقطاع النت (مش بسبب تحديث فعلي للتطبيق)؟ */
const isNetworkError = (error: unknown): boolean => {
  const message = toErrorMessage(error).toLowerCase();
  return (
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('err_internet_disconnected') ||
    message.includes('err_network') ||
    message.includes('load failed')
  );
};

const canAttemptChunkRecovery = (): boolean =>
  typeof window !== 'undefined' && window.navigator.onLine !== false;

const hasRecentChunkRecovery = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const raw = window.sessionStorage.getItem(CHUNK_AUTO_RECOVERY_KEY);
    const timestamp = Number.parseInt(raw || '0', 10);
    if (!Number.isFinite(timestamp) || timestamp <= 0) return false;
    return Date.now() - timestamp < CHUNK_AUTO_RECOVERY_COOLDOWN_MS;
  } catch {
    return false;
  }
};

const markChunkRecovery = () => {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.setItem(CHUNK_AUTO_RECOVERY_KEY, String(Date.now()));
  } catch {
    // Ignore storage access failures and continue with hard reload fallback.
  }
};

const triggerChunkRecovery = () => {
  if (!canAttemptChunkRecovery()) return;
  if (hasRecentChunkRecovery()) return;

  markChunkRecovery();

  try {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set(RECOVERY_QUERY_PARAM, '1');
    nextUrl.searchParams.set(RECOVERY_TS_QUERY_PARAM, String(Date.now()));
    window.location.replace(nextUrl.toString());
  } catch {
    window.location.reload();
  }
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);

    if (isDynamicImportChunkFailure(error)) {
      // لو النت فاصل — ما نحاولش نحدث التطبيق، نخلي المستخدم يعرف إنه أوفلاين
      if (isOffline()) return;
      triggerChunkRecovery();
      return;
    }

    if (typeof window !== 'undefined' && isFirestoreInternalAssertion(error)) {
      try {
        const wasReloaded = window.sessionStorage.getItem(FIRESTORE_AUTO_RELOAD_KEY) === '1';
        if (!wasReloaded) {
          window.sessionStorage.setItem(FIRESTORE_AUTO_RELOAD_KEY, '1');
          window.location.reload();
        }
      } catch {
        // Keep fallback UI if sessionStorage is unavailable.
      }
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const chunkFailure = isDynamicImportChunkFailure(this.state.error);
      const firestoreFailure = isFirestoreInternalAssertion(this.state.error);
      const offline = isOffline();
      const networkFail = isNetworkError(this.state.error);

      // لو النت فاصل + الخطأ مرتبط بالشبكة — نقول "بدون اتصال" مش "خطأ"
      // لازم يكون الشرطين متحققين عشان ما نخبيش خطأ حقيقي مش متعلق بالنت
      const isOfflineError = offline && (chunkFailure || networkFail);

      const message = isOfflineError
        ? 'أنت حاليًا بدون اتصال بالإنترنت. تأكد من اتصالك وأعد المحاولة.'
        : chunkFailure
          ? 'تم تحديث التطبيق أثناء الاستخدام. جارٍ استرجاع أحدث نسخة تلقائيًا.'
          : firestoreFailure
            ? 'حدث خلل مؤقت في مزامنة البيانات. يمكنك إعادة تحميل الصفحة الآن.'
            : this.state.error?.message || 'يُرجى إعادة تحميل الصفحة أو المحاولة لاحقًا.';
      const actionLabel = isOfflineError
        ? 'إعادة المحاولة'
        : chunkFailure
          ? 'تحديث التطبيق الآن'
          : 'إعادة تحميل الصفحة';

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6" dir="rtl">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-slate-100">
            <div className="text-5xl mb-4">{isOfflineError ? '📡' : '⚠️'}</div>
            <h2 className="text-xl font-black text-slate-800 mb-2">
              {isOfflineError ? 'بدون اتصال بالإنترنت' : 'حدث خطأ غير متوقع'}
            </h2>
            <p className="text-slate-500 text-sm mb-6">{message}</p>
            <button
              onClick={() => {
                if (chunkFailure) {
                  triggerChunkRecovery();
                  return;
                }
                window.location.reload();
              }}
              className="bg-success-600 hover:bg-success-700 text-white font-black py-2.5 px-6 rounded-xl transition-all active:scale-95"
            >
              {actionLabel}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
