/**
 * خدمة إدارة الجلسة (Session Management Service):
 * هذا الملف مسؤول عن إدارة الحالة الراهنة للمستخدم المسجل دخوله.
 * يشمل ذلك:
 * 1. تسجيل الخروج (Sign Out).
 * 2. مراقبة تغير حالة المصادقة (Auth State Change).
 * 3. تحديث بيانات الملف الشخصي (Profile Update) مثل الاسم والصورة.
 * 4. إعادة إرسال بريد توثيق الحساب (Email Verification).
 */

import {
  onAuthStateChanged as firebaseOnAuthStateChanged,
  sendEmailVerification,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { doctorAuthActionCodeSettings } from './constants';
import { clearStoredAuthState } from './storage';

/**
 * تسجيل خروج المستخدم من Firebase ومسح البيانات المخزنة محلياً.
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    // مسح الدور والبيانات المؤقتة من الذاكرة المحلية (LocalStorage)
    clearStoredAuthState();
  } catch {
    throw new Error('حدث خطأ أثناء تسجيل الخروج');
  }
};

/**
 * الحصول على كائن المستخدم الحالي من Firebase Auth.
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * الاشتراك في تغييرات حالة المصادقة (دخول/خروج/تغير بيانات).
 */
export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  return firebaseOnAuthStateChanged(auth, callback);
};

/**
 * إعادة إرسال رابط توثيق البريد الإلكتروني للأطباء.
 */
export const resendVerificationEmail = async (): Promise<void> => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('لا يوجد مستخدم مسجل دخول');
  }

  if (user.emailVerified) {
    throw new Error('البريد الإلكتروني موثق بالفعل');
  }

  try {
    // إرسال البريد مع إعدادات العودة للتطبيق (ActionCodeSettings)
    await sendEmailVerification(user, doctorAuthActionCodeSettings);
  } catch {
    throw new Error('حدث خطأ أثناء إرسال بريد التوثيق');
  }
};

/**
 * تحديث بيانات الملف الشخصي للمستخدم الحالي في Firebase Auth.
 */
export const updateUserProfile = async (
  displayName?: string,
  photoURL?: string
): Promise<void> => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('لا يوجد مستخدم مسجل دخول');
  }

  try {
    const updates: { displayName?: string; photoURL?: string } = {};
    if (displayName !== undefined) updates.displayName = displayName.trim();

    if (photoURL !== undefined) {
      // التحقق من طول الرابط لتجنب تجاوز حد حجم الملف الشخصي في Firebase
      if (photoURL.length > 3000) {
        console.warn('Photo URL is too large for Firebase profile. Consider using Firebase Storage.');
      } else {
        updates.photoURL = photoURL;
      }
    }

    await updateProfile(user, updates);
  } catch (error: any) {
    console.error('Profile update error:', error);
    throw new Error(error.message || 'حدث خطأ أثناء تحديث الملف الشخصي');
  }
};

