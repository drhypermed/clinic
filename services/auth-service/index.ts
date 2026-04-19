/**
 * ملف التصدير الرئيسي لخدمة المصادقة (Auth Service Entry Point):
 * يعمل هذا الملف كواجهة موحدة (Barrel File) لجميع وظائف المصادقة في التطبيق.
 * يجمع الوظائف من الملفات الفرعية ويوفرها بشكل منظم للمكونات والصفحات.
 */

export {
  SESSION_ROLE_STORAGE_KEY,
  PUBLIC_PENDING_EMAIL_KEY,
  PUBLIC_PENDING_PROFILE_KEY,
  PUBLIC_AUTH_ERROR_KEY,
  PENDING_GOOGLE_REDIRECT_ROLE_KEY,
} from './constants';

export { validatePassword } from './validation';

export {
  finalizeDoctorGoogleSignIn,
  checkDoctorApprovalStatus,
} from './doctor-account';

export {
  completePendingGoogleRedirect,
  signInWithGoogle,
} from './google-auth';

export {
  signInPublicWithEmail,
  sendPublicEmailOtpCode,
  verifyPublicEmailOtpCode,
  createPublicAccountWithEmail,
  signInAsPublicGuest,
  sendPublicLoginLink,
  isPublicLoginEmailLink,
  completePublicLoginWithEmailLink,
} from './public-auth';

export {
  signOut,
  getCurrentUser,
  onAuthStateChanged,
  resendVerificationEmail,
  updateUserProfile,
} from './session';
