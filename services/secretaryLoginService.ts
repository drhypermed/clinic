import { httpsCallable } from 'firebase/functions';
import { signInWithCustomToken } from 'firebase/auth';
import { auth, functions } from './firebaseConfig';
import { formatUserDate } from '../utils/cairoTime';

export type SecretaryLoginPayload = {
  doctorEmail?: string;
  secret?: string;
  secretaryPassword: string;
};

export type SecretaryLoginResult = {
  secret: string;
  userId?: string;
  sessionToken: string;
  /** الفرع اللي السكرتارية مسموح لها شغل عليه (يُحدّد تلقائياً من كلمة السر المطابقة) */
  branchId: string;
  /** هل تم تسجيل الدخول في Firebase Auth بنجاح (للكتابة المصادقة على Firestore) */
  firebaseAuthSignedIn: boolean;
};

const normalizeFunctionsErrorCode = (error: unknown): string =>
  String((error as { code?: unknown })?.code || '')
    .trim()
    .toLowerCase()
    .replace(/^functions\//, '');

type CallableErrorDetails = Record<string, unknown>;

const getCallableErrorDetails = (error: unknown): CallableErrorDetails => {
  const details = (error as { details?: unknown })?.details;
  if (!details || typeof details !== 'object' || Array.isArray(details)) {
    return {};
  }
  return details as CallableErrorDetails;
};

const getDoctorAccountStatusCode = (
  message: string,
  details: CallableErrorDetails
): 'DOCTOR_ACCOUNT_BLACKLISTED' | 'DOCTOR_ACCOUNT_DISABLED' | '' => {
  const detailsStatus = String(details.status || '').trim().toUpperCase();
  if (detailsStatus === 'DOCTOR_ACCOUNT_BLACKLISTED') return 'DOCTOR_ACCOUNT_BLACKLISTED';
  if (detailsStatus === 'DOCTOR_ACCOUNT_DISABLED') return 'DOCTOR_ACCOUNT_DISABLED';

  const upperMessage = String(message || '').toUpperCase();
  if (upperMessage.includes('DOCTOR_ACCOUNT_BLACKLISTED')) return 'DOCTOR_ACCOUNT_BLACKLISTED';
  if (upperMessage.includes('DOCTOR_ACCOUNT_DISABLED')) return 'DOCTOR_ACCOUNT_DISABLED';

  return '';
};

const formatBlockedDate = (value: unknown): string => {
  const rawValue = String(value || '').trim();
  if (!rawValue) return '';
  const parsed = new Date(rawValue);
  if (Number.isNaN(parsed.getTime())) return '';
  return formatUserDate(parsed, undefined, 'ar-EG');
};

const buildDoctorBlacklistedMessage = (details: CallableErrorDetails): string => {
  const reason = String(details.reason || '').trim();
  const blockedAt = formatBlockedDate(details.blockedAt);

  if (reason) {
    if (blockedAt) {
      return `⛔ تم حظر هذا البريد الإلكتروني من الدخول\n\nسبب الحظر: ${reason}\n\nتاريخ الحظر: ${blockedAt}`;
    }
    return `⛔ تم حظر هذا البريد الإلكتروني من الدخول\n\nسبب الحظر: ${reason}`;
  }

  return '⛔ تم حظر هذا البريد الإلكتروني من الدخول للنظام';
};

const buildDoctorDisabledMessage = (details: CallableErrorDetails): string => {
  const disabledReason = String(details.disabledReason || '').trim();
  if (disabledReason) {
    return `⛔ عذراً، تم تعطيل حسابك.\n\nالسبب: ${disabledReason}\n\nيرجى التواصل مع الإدارة.`;
  }
  return '⛔ عذراً، تم تعطيل حسابك.\n\nيرجى التواصل مع الإدارة للمزيد من التفاصيل.';
};

export const getSecretaryLoginErrorMessage = (error: unknown): string => {
  const code = normalizeFunctionsErrorCode(error);
  const message = String((error as { message?: unknown })?.message || '');
  const details = getCallableErrorDetails(error);
  const accountStatusCode = getDoctorAccountStatusCode(message, details);
  const normalizedMessage = message.toUpperCase();
  const detailsStatus = String(details.status || '').trim().toUpperCase();

  if (accountStatusCode === 'DOCTOR_ACCOUNT_BLACKLISTED') {
    return buildDoctorBlacklistedMessage(details);
  }
  if (accountStatusCode === 'DOCTOR_ACCOUNT_DISABLED') {
    return buildDoctorDisabledMessage(details);
  }

  if (
    normalizedMessage.includes('SECRETARY_PASSWORD_NOT_SET') ||
    detailsStatus === 'SECRETARY_PASSWORD_NOT_SET'
  ) {
    return 'لم يتم اختيار كلمة سر من قبل الطبيب';
  }

  if (
    code === 'permission-denied' ||
    code === 'not-found' ||
    code === 'failed-precondition' ||
    normalizedMessage.includes('INVALID_CREDENTIALS') ||
    normalizedMessage.includes('INVALID_SECRETARY_PASSWORD') ||
    normalizedMessage.includes('DOCTOR_EMAIL_SECRET_MISMATCH')
  ) {
    return 'بيانات الدخول غير صحيحة أو نظام السكرتارية غير مفعّل';
  }
  if (code === 'resource-exhausted') {
    return 'تم تجاوز عدد محاولات الدخول. حاول مرة أخرى بعد قليل.';
  }
  if (code === 'unauthenticated') {
    return 'تعذر التحقق من الطلب الآن. حدِّث الصفحة ثم حاول تسجيل الدخول مرة أخرى.';
  }
  if (code === 'unavailable' || code === 'deadline-exceeded') {
    return 'تعذر الاتصال بالسيرفر الآن. حاول مرة أخرى.';
  }

  return 'تعذر تسجيل دخول السكرتارية الآن. حاول مرة أخرى';
};

export const secretaryLogin = async (
  payload: SecretaryLoginPayload
): Promise<SecretaryLoginResult> => {
  const callable = httpsCallable(functions, 'secretaryLoginWithDoctorEmail');
  const response = await callable(payload);
  const data = (response.data || {}) as (Partial<SecretaryLoginResult> & { customAuthToken?: string });

  if (!data.secret || !data.sessionToken) {
    throw new Error('INVALID_SECRETARY_LOGIN_RESPONSE');
  }

  // تسجيل الدخول في Firebase Auth بالـ custom token عشان نقدر نكتب على Firestore
  // بمصادقة حقيقية. لو فشلت، بنكمل بالـ sessionToken لكن الكتابة المباشرة مش هتشتغل.
  let firebaseAuthSignedIn = false;
  const customAuthToken = typeof data.customAuthToken === 'string' ? data.customAuthToken : '';
  if (customAuthToken) {
    try {
      await signInWithCustomToken(auth, customAuthToken);
      firebaseAuthSignedIn = true;
    } catch (signInErr) {
      console.warn('[secretaryLogin] Custom token sign-in failed:', signInErr);
      // نسمح بالتكميل بدونه — الكود القديم اللي بيستخدم sessionToken هيشتغل
    }
  }

  return {
    secret: data.secret,
    userId: typeof data.userId === 'string' ? data.userId : undefined,
    sessionToken: data.sessionToken,
    branchId: typeof data.branchId === 'string' && data.branchId ? data.branchId : 'main',
    firebaseAuthSignedIn,
  };
};
