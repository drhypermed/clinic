/** 
 * وظيفة تنظيف بيانات الاعتماد (Clear All Auth):
 * تقوم هذه الدالة بمسح كافة بيانات الجلسة وسجلات التخزين المحلي (LocalStorage) 
 * المتعلقة بالطبيب، السكرتارية، أو المريض لضمان تسجيل خروج آمن وشامل من المتصفح.
 */
import { auth } from '../services/firebaseConfig';

import { signOut as authSignOut } from 'firebase/auth';

export const clearAllAuth = async () => {
    const currentUid = auth.currentUser?.uid || null;

    // 1. تسجيل الخروج من Firebase (للطبيب أو المستخدم العام)
    if (auth.currentUser) {
        try {
            await authSignOut(auth);
        } catch (err) {
            console.error('Error signing out of Firebase:', err);
        }
    }

    // 2. مسح مفاتيح التخزين المحددة (الأدوار، الأسماء، العرض الحالي)
    localStorage.removeItem('dh_auth_role');
    localStorage.removeItem('dh_secretary_last_secret');
    localStorage.removeItem('dh_pending_google_auth_role');
    localStorage.removeItem('dh_pending_google_redirect_role');
    localStorage.removeItem('dh_current_view');
    if (currentUid) {
        localStorage.removeItem(`dh_user_profile_${currentUid}`);
    }

    // 3. مسح كافة المفاتيح الديناميكية (الرموز التعريفية، التنبيهات، ملفات السكرتارية)
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        if (key.startsWith('sec_auth_') || 
            key.startsWith('dh_secretary_profile_name_') || 
            key.startsWith('dh_user_profile_') ||
            key.startsWith('dh_secretary_doctor_response_toast_') ||
            key.startsWith('dh_secretary_action_toast_') ||
            key.startsWith('dh_doctor_secretary_response_toast_') ||
            key.startsWith('dh_doctor_new_appointment_toast_') ||
            key.startsWith('dh_push_token_doctor_') ||
            key.startsWith('dh_push_token_secretary_')) {
            keysToRemove.push(key);
        }
    }

    // تنظيف القيود الجلسية وأخطاء المصادقة القديمة
    sessionStorage.removeItem('dh_auth_flow_guard');
    localStorage.removeItem('dh_public_auth_error');
    localStorage.removeItem('public_auth_error'); // مفتاح قديم للأمان

    keysToRemove.forEach(k => localStorage.removeItem(k));
};
