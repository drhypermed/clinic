import { httpsCallable } from 'firebase/functions';
import { functions } from './firebaseConfig';
import { normalizeSecretaryUsername } from '../utils/secretaryUsername';

type SetSecretaryUsernamePayload = {
  username: string;
  branchId: string;
  secret: string;
};

type SetSecretaryUsernameResult = {
  username: string;
  branchId: string;
};

const normalizeFunctionsErrorCode = (error: unknown): string =>
  String((error as { code?: unknown })?.code || '')
    .trim()
    .toLowerCase()
    .replace(/^functions\//, '');

export const getSecretaryUsernameSaveErrorMessage = (error: unknown): string => {
  const code = normalizeFunctionsErrorCode(error);
  const message = String((error as { message?: unknown })?.message || '').toUpperCase();

  if (code === 'already-exists' || message.includes('SECRETARY_USERNAME_TAKEN')) {
    return 'اسم المستخدم مستخدم بالفعل. اختر اسمًا آخر.';
  }
  if (code === 'invalid-argument' || message.includes('INVALID_SECRETARY_USERNAME')) {
    return 'صيغة اسم المستخدم غير صحيحة.';
  }
  if (
    code === 'failed-precondition' ||
    message.includes('SECRETARY_BRANCH_SECRET_MISMATCH') ||
    message.includes('BRANCH_NOT_FOUND')
  ) {
    return 'تعذر ربط اسم المستخدم بالفرع الحالي. حدّث الصفحة وحاول مرة أخرى.';
  }
  if (code === 'unauthenticated') {
    return 'انتهت جلسة الطبيب. سجّل الدخول مرة أخرى ثم أعد المحاولة.';
  }
  if (code === 'not-found') {
    return 'خدمة حفظ اسم المستخدم غير متاحة على السيرفر الحالي. حدّث الصفحة وحاول مرة أخرى.';
  }
  if (code === 'unavailable' || code === 'deadline-exceeded') {
    return 'تعذر الاتصال بالسيرفر الآن. حاول مرة أخرى.';
  }
  return 'تعذر حفظ اسم مستخدم السكرتارية.';
};

export const setSecretaryUsername = async (
  payload: SetSecretaryUsernamePayload
): Promise<SetSecretaryUsernameResult> => {
  const callable = httpsCallable(functions, 'setSecretaryUsername');
  const response = await callable({
    ...payload,
    username: normalizeSecretaryUsername(payload.username),
  });
  const data = (response.data || {}) as Partial<SetSecretaryUsernameResult>;
  if (!data.username || !data.branchId) {
    throw new Error('INVALID_SECRETARY_USERNAME_RESPONSE');
  }
  return { username: data.username, branchId: data.branchId };
};
