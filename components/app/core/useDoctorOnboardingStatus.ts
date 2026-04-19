import { useEffect, useState } from 'react';
import type { ExtendedUser } from '../../../hooks/useAuth';
import { getDocCacheFirst } from '../../../services/firestore/cacheFirst';
import {
  getLegacyDoctorProfileDocRef,
  getUserProfileDocRef,
  isDoctorLikeUserData,
  mergePrimaryProfileData,
} from '../../../services/firestore/profileRoles';

/**
 * Hook متابعة حالة إعداد حساب الطبيب (useDoctorOnboardingStatus)
 * وظيفته هي التحقق مما إذا كان الطبيب قد أكمل ملفه الشخصي ورفع الوثائق المطلوبة للتحقق.
 * مخرجات الـ Hook:
 * - idle: المرحلة الأولية.
 * - loading: جاري جلب البيانات من Firestore.
 * - complete: الطبيب أكمل بياناته وتم التحقق منها (أو قيد المراجعة وليست مرفوضة).
 * - incomplete: الطبيب يحتاج لإكمال بياناته (اسم العيادة، التخصص، الوثائق).
 */

export type DoctorOnboardingStatus = 'idle' | 'loading' | 'complete' | 'incomplete';

type UseDoctorOnboardingStatusParams = {
  user: ExtendedUser | null;
  isAdminUser: boolean; // استثناء الأدمن من فحص الـ Onboarding
};

export const useDoctorOnboardingStatus = ({
  user,
  isAdminUser,
}: UseDoctorOnboardingStatusParams): DoctorOnboardingStatus => {
  const [doctorOnboardingStatus, setDoctorOnboardingStatus] = useState<DoctorOnboardingStatus>('idle');

  useEffect(() => {
    if (!user) {
      setDoctorOnboardingStatus('idle');
      return;
    }

    // 1. استثناء مدراء النظام (Admin)
    if (isAdminUser) {
      setDoctorOnboardingStatus('complete');
      return;
    }

    // 2. إذا لم يكن مسجلاً كطبيب (مثلاً مستخدم عام)
    if (user.authRole !== 'doctor') {
      setDoctorOnboardingStatus('idle');
      return;
    }

    let isMounted = true;
    setDoctorOnboardingStatus('loading');

    // 3. جلب بيانات الطبيب من قاعدة البيانات باستخدام تقنية "الكاش أولاً" لسرعة التحميل
    Promise.all([
      getDocCacheFirst(getUserProfileDocRef(user.uid)),
      getDocCacheFirst(getLegacyDoctorProfileDocRef(user.uid)),
    ])
      .then(([userSnap, legacyDoctorSnap]) => {
        if (!isMounted) return;

        const data = mergePrimaryProfileData(
          userSnap.exists() ? (userSnap.data() as Record<string, any>) : null,
          legacyDoctorSnap.exists() ? (legacyDoctorSnap.data() as Record<string, any>) : null,
        );

        if ((!userSnap.exists() && !legacyDoctorSnap.exists()) || !isDoctorLikeUserData(data)) {
          setDoctorOnboardingStatus('incomplete');
          return;
        }
        
        // التحقق من الحقول الأساسية (التخصص، واتساب، ورابط وثيقة التحقق)
        const hasBasics = Boolean(data?.doctorSpecialty && data?.doctorWhatsApp && data?.verificationDocUrl);
        
        // التحقق إذا كان الطلب قد تم رفضه سابقاً من قبل الإدارة
        const isRejected = data?.verificationStatus === 'rejected';

        // الحساب يعتبر مكتملاً إذا وُجدت البيانات الأساسية ولم يكن مرفوضاً
        setDoctorOnboardingStatus(hasBasics && !isRejected ? 'complete' : 'incomplete');
      })
      .catch((err) => {
        console.error('Onboarding Check Error:', err);
        if (!isMounted) return;
        setDoctorOnboardingStatus('incomplete');
      });

    return () => {
      isMounted = false;
    };
  }, [user, isAdminUser]);

  return doctorOnboardingStatus;
};
