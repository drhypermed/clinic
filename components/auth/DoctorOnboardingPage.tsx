/** 
 * صفحة فحص حالة الطبيب (Doctor Onboarding/Shield Page):
 * تعمل هذه الصفحة كحاجز أمان (Safety Buffer) فور تسجيل الدخول للطبيب.
 * تقوم بالتحقق من:
 * 1. وجود حساب للطبيب في قاعدة البيانات.
 * 2. حالة التحقق (Verification) - ما إذا كان الحساب مقبولاً أو مرفوضاً من الإدارة.
 */
import React, { useEffect, useState, useRef } from 'react';
import { LoadingText } from '../ui/LoadingText';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { useAuth } from '../../hooks/useAuth';
import { getDocCacheFirst } from '../../services/firestore/cacheFirst';
import {
  getLegacyDoctorProfileDocRef,
  getUserProfileDocRef,
  isDoctorLikeUserData,
  mergePrimaryProfileData,
} from '../../services/firestore/profileRoles';


export const DoctorOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const isMountedRef = useRef(true);

  useEffect(() => {
    if (!user?.uid) {
      setChecking(false);
      navigate('/login/doctor', { replace: true });
      return;
    }

    isMountedRef.current = true;

    const checkAccount = async () => {
      try {
        const [userSnap, legacyDoctorSnap] = await Promise.all([
          getDocCacheFirst(getUserProfileDocRef(user.uid)),
          getDocCacheFirst(getLegacyDoctorProfileDocRef(user.uid)),
        ]);
        if (!isMountedRef.current) return;

        const data = mergePrimaryProfileData(
          userSnap.exists() ? (userSnap.data() as Record<string, any>) : null,
          legacyDoctorSnap.exists() ? (legacyDoctorSnap.data() as Record<string, any>) : null,
        );

        if ((!userSnap.exists() && !legacyDoctorSnap.exists()) || !isDoctorLikeUserData(data)) {
          setError('هذا الحساب غير موجود. سيتم تسجيل الخروج.');
          setChecking(false);
          await signOut();
          navigate('/login/doctor', { replace: true });
          return;
        }

        const status = data?.verificationStatus;

        if (status === 'rejected') {
          setError('تم رفض طلب التسجيل. سيتم تسجيل الخروج.');
          setChecking(false);
          await signOut();
          setTimeout(() => {
            if (isMountedRef.current) {
              navigate('/login/doctor', { replace: true });
            }
          }, 2000);
          return;
        }

        // أي حالة أخرى، اذهب للصفحة الرئيسية
        navigate('/home', { replace: true });
      } catch (err) {
        console.error('Error checking account:', err);
        setChecking(false);
      }
    };

    checkAccount();

    return () => {
      isMountedRef.current = false;
    };
  }, [user?.uid, navigate, signOut]);

  return (
    <AuthLayout>
      <div className="w-full max-w-md text-center" dir="rtl">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 space-y-6">
          {checking ? (
            <>
              <div className="w-16 h-16 border-4 border-white/70 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/90 font-bold text-lg"><LoadingText>جاري التحقق</LoadingText></p>
              <p className="text-white/70 text-sm">يرجى الانتظار</p>
            </>
          ) : error ? (
            <>
              <div className="text-3xl mb-4">❌</div>
              <p className="text-red-200 font-bold text-lg">{error}</p>
            </>
          ) : null}
        </div>
      </div>
    </AuthLayout>
  );
};
