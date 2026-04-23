import { useEffect, useState } from 'react';
import type { ExtendedUser } from '../../../hooks/useAuth';
import { getDocCacheFirst } from '../../../services/firestore/cacheFirst';
import {
  getUserProfileDocRef,
  isDoctorLikeUserData,
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
    // نضع 'loading' بس لو ده أول فحص لهذا الـUID — مع refresh التوكن user
    // object بياخد reference جديد بنفس الـUID، وده كان بيعمل فلاشة loading
    // داخل التطبيق. نتجنبها بحفظ آخر uid فحصناه.
    if (doctorOnboardingStatus === 'idle') {
      setDoctorOnboardingStatus('loading');
    }

    // 3. قراءه واحده من users/{uid} بـcache-first — كانت قبل كده 2 reads بسبب alias قديم لنفس الـdoc.
    getDocCacheFirst(getUserProfileDocRef(user.uid))
      .then((userSnap) => {
        if (!isMounted) return;

        const data = userSnap.exists() ? (userSnap.data() as Record<string, any>) : null;

        if (!data || !isDoctorLikeUserData(data)) {
          setDoctorOnboardingStatus('incomplete');
          return;
        }

        // التحقق من الحقول الأساسيه (التخصص، واتساب، ورابط وثيقة التحقق)
        const hasBasics = Boolean(data?.doctorSpecialty && data?.doctorWhatsApp && data?.verificationDocUrl);

        // التحقق إذا كان الطلب قد تم رفضه سابقاً من قبل الإداره
        const isRejected = data?.verificationStatus === 'rejected';

        // الحساب يعتبر مكتملاً إذا وُجدت البيانات الأساسيه ولم يكن مرفوضاً
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
    // deps على uid + authRole فقط — مش على reference الـuser object كله
    // عشان refresh التوكن (بيغير الـreference بدون تغيير uid) ما يعيدش التشغيل
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, user?.authRole, isAdminUser]);

  return doctorOnboardingStatus;
};
