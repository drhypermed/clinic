/**
 * ملف التصدير الرئيسي لخدمة المصادقة (Auth Service Entry Point):
 * يعمل هذا الملف كواجهة موحدة (Barrel File) لجميع وظائف المصادقة في التطبيق.
 * يجمع الوظائف من الملفات الفرعية ويوفرها بشكل منظم للمكونات والصفحات.
 */

export {
  SESSION_ROLE_STORAGE_KEY,
  PUBLIC_AUTH_ERROR_KEY,
} from './constants';

export {
  completePendingGoogleRedirect,
  signInWithGoogle,
} from './google-auth';

export {
  signOut,
  onAuthStateChanged,
  updateUserProfile,
} from './session';
