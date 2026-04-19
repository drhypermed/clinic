/**
 * خدمة التخزين المحلي (Storage Utility Service):
 * هذا الملف يوفر واجهة آمنة للتعامل مع الـ LocalStorage في المتصفح.
 * يستخدم لتخزين:
 * 1. دور المستخدم المسجل (طبيب/جمهور) للحفاظ على حالة الواجهة.
 * 2. رسائل الخطأ التي تحتاج للبقاء بعد إعادة تحميل الصفحة.
 * 3. البيانات المؤقتة لعمليات تسجيل الدخول المعلقة.
 */

import { safeLsGet, safeLsRemove, safeLsSet } from '../../utils/localStorageHelpers';
import {
  PENDING_GOOGLE_AUTH_ROLE_KEY,
  PUBLIC_PENDING_EMAIL_KEY,
  PUBLIC_PENDING_PROFILE_KEY,
  SESSION_ROLE_STORAGE_KEY,
} from './constants';

/**
 * وظيفة مساعدة لتنفيذ عدة عمليات تخزين متتالية بأمان.
 * تعتمد داخلياً على helpers المشتركة التي تتعامل مع بيئات SSR
 * وأخطاء التصفح الخاص.
 */
const withLocalStorage = (action: (storage: Storage) => void) => {
  if (typeof window === 'undefined') return;
  try {
    action(localStorage);
  } catch {
    // تجاهل الأخطاء (مثل وضع التصفح المتخفي أو حظر التخزين)
  }
};

/** تخزين دور المستخدم الحالي (طبيب أو جمهور) */
export const setStoredRole = (role: 'doctor' | 'public') => {
  withLocalStorage((storage) => {
    storage.setItem(SESSION_ROLE_STORAGE_KEY, role);
  });
};

/** حذف كافة بيانات المصادقة المخزنة (عند تسجيل الخروج) */
export const clearStoredAuthState = () => {
  withLocalStorage((storage) => {
    storage.removeItem(SESSION_ROLE_STORAGE_KEY);
    storage.removeItem(PUBLIC_PENDING_EMAIL_KEY);
    storage.removeItem(PUBLIC_PENDING_PROFILE_KEY);
    storage.removeItem(PENDING_GOOGLE_AUTH_ROLE_KEY);
  });
};

/** تنظيف رسائل الخطأ المتعلقة بدخول الأطباء من الذاكرة */
export const clearDoctorAuthErrors = () => {
  withLocalStorage((storage) => {
    [
      'blacklist_message',
      'blacklist_error',
      'not_found_error',
      'rejection_error',
      'duplicate_account_error',
      'public_role_error',
      'not_found_timestamp',
      'duplicate_account_timestamp',
    ].forEach((key) => storage.removeItem(key));
  });
};

/** حفظ رسالة خطأ معينة لتظهر للطبيب عند إعادة تحميل الصفحة */
export const persistDoctorAuthError = (key: string, message: string) => {
  withLocalStorage((storage) => {
    // تنظيف الأخطاء القديمة أولاً
    [
      'blacklist_message',
      'blacklist_error',
      'not_found_error',
      'rejection_error',
      'duplicate_account_error',
      'public_role_error',
      'not_found_timestamp',
      'duplicate_account_timestamp',
    ].forEach((errorKey) => storage.removeItem(errorKey));
    storage.setItem(key, message);
  });
};

/** وظيفة عامة لحفظ قيمة في التخزين المحلي */
export const safeStorageSetItem = (key: string, value: string) => safeLsSet(key, value);

/** وظيفة عامة لحذف قيمة من التخزين المحلي */
export const safeStorageRemoveItem = (key: string) => safeLsRemove(key);

/** وظيفة عامة لجلب قيمة من التخزين المحلي مع معالجة احتمالية عدم الوجود */
export const safeStorageGetItem = (key: string): string | null => safeLsGet(key);

