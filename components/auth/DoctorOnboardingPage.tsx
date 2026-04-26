/** 
 * صفحة فحص حالة الطبيب (Doctor Onboarding/Shield Page):
 * تعمل هذه الصفحة كحاجز أمان (Safety Buffer) فور تسجيل الدخول للطبيب.
 * تقوم بالتحقق من:
 * 1. وجود حساب للطبيب في قاعدة البيانات.
 * 2. حالة التحقق (Verification) - ما إذا كان الحساب مقبولاً أو مرفوضاً من الإدارة.
 */
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { useAuth } from '../../hooks/useAuth';
import { getDocCacheFirst } from '../../services/firestore/cacheFirst';
import {
  getUserProfileDocRef,
  isDoctorLikeUserData,
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
        // قراءه واحده من users/{uid} — كانت قبل كده 2 reads بسبب alias قديم لنفس الـdoc.
        const userSnap = await getDocCacheFirst(getUserProfileDocRef(user.uid));
        if (!isMountedRef.current) return;

        const data = userSnap.exists() ? (userSnap.data() as Record<string, any>) : null;

        if (!userSnap.exists() || !isDoctorLikeUserData(data)) {
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

  // أثناء التحقق: مفيش أي UI ظاهر — الصفحة دي مجرد جسر يُحوِّل المستخدم لمكانه فوراً
  if (checking) return null;

  // الخطأ بس هو اللي يستاهل عرض — لو حصل رفض أو حساب غير موجود
  if (error) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md text-center" dir="rtl">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 space-y-6">
            <div className="text-3xl mb-4">❌</div>
            <p className="text-danger-200 font-bold text-lg">{error}</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return null;
};
