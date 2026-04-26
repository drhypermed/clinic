/**
 * Monitoring Service
 * يرصد أخطاء التطبيق ويرسلها لـ Firestore تلقائياً في الإنتاج.
 * يتيح للمطور معرفة المشاكل قبل أن يشكو منها المستخدمون.
 */

import { db } from './firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const IS_PROD = import.meta.env.PROD;
const MAX_STACK_LEN = 2000;

// ─── منع تكرار تسجيل نفس الخطأ (Deduplication) ───
// نفس الخطأ ما يتسجلش أكتر من مرة كل 5 دقايق
const DEDUPE_WINDOW_MS = 5 * 60 * 1000;
const recentErrors = new Map<string, number>();

function isDuplicateError(message: string): boolean {
  const now = Date.now();
  // تنظيف الأخطاء القديمة
  if (recentErrors.size > 100) {
    for (const [key, ts] of recentErrors) {
      if (now - ts > DEDUPE_WINDOW_MS) recentErrors.delete(key);
    }
  }
  const key = message.slice(0, 200);
  const lastSeen = recentErrors.get(key);
  if (lastSeen && now - lastSeen < DEDUPE_WINDOW_MS) return true;
  recentErrors.set(key, now);
  return false;
}

interface ErrorLog {
  message: string;
  stack: string;
  url: string;
  userAgent: string;
  userId: string | null;
  timestamp: ReturnType<typeof serverTimestamp>;
  type: 'unhandled_error' | 'unhandled_rejection' | 'manual';
}

async function sendErrorToFirestore(log: Omit<ErrorLog, 'timestamp'>): Promise<void> {
  if (!IS_PROD) return;
  // لو نفس الخطأ اتسجل في آخر 5 دقايق — نتجاهله لتوفير كتابات Firestore
  if (isDuplicateError(log.message)) return;
  try {
    await addDoc(collection(db, 'errorLogs'), {
      ...log,
      timestamp: serverTimestamp(),
    });
  } catch {
    // لا نرسل خطأ من داخل معالج الأخطاء
  }
}

function buildLog(
  error: unknown,
  type: ErrorLog['type']
): Omit<ErrorLog, 'timestamp'> {
  const err = error instanceof Error ? error : new Error(String(error));
  const auth = getAuth();
  return {
    message: err.message.slice(0, 500),
    stack: (err.stack || '').slice(0, MAX_STACK_LEN),
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    userId: auth.currentUser?.uid ?? null,
    type,
  };
}

/**
 * تثبيت المستمعين العالميين للأخطاء.
 * يُستدعى مرة واحدة عند بدء التطبيق.
 */
export function initMonitoring(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', (event) => {
    void sendErrorToFirestore(buildLog(event.error ?? event.message, 'unhandled_error'));
  });

  window.addEventListener('unhandledrejection', (event) => {
    void sendErrorToFirestore(buildLog(event.reason, 'unhandled_rejection'));
  });
}

