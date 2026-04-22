import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { getDocCacheFirst } from '../services/firestore/cacheFirst';
import { ADMIN_EMAIL } from '../app/drug-catalog/admin';
import { PUBLIC_AUTH_ERROR_KEY } from '../services/auth-service';
import { formatUserDate } from '../utils/cairoTime';
import type { ExtendedUser } from './useAuth';
import {
  getUserProfileDocRef,
  resolveAuthRoleFromProfileData,
} from '../services/firestore/profileRoles';

/**
 * هيكل تنبيه حالة الحساب (Account Status Alert)
 */
interface AccountStatusAlert {
  type: 'disabled' | 'deleted' | 'blacklisted' | 'rejected' | null;
  message: string;
}

/**
 * Hook مراقب حالة الحساب (useAccountStatusMonitor):
 * يعمل هذا الـ Hook كـ "حارس أمن" (Watchdog) لحظي. وظيفته هي مراقبة أي تغيير
 * في صلاحيات الطبيب أو المستخدم من قبل الإدارة في Firestore.
 * إذا تم حظر الطبيب أو تعطيل حسابه أثناء عمله، يقوم النظام فوراً بجلب التنبيه
 * وتسجيل خروج المستخدم تلقائياً لحماية العيادة ومنع الوصول غير المصرح به.
 */
export const useAccountStatusMonitor = (
  user: ExtendedUser | null,
  signOut: () => Promise<void>
) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [alert, setAlert] = useState<AccountStatusAlert>({ type: null, message: '' });
  const [adminAccountStatus, setAdminAccountStatus] = useState<'unknown' | 'admin' | 'user'>('unknown');

  // ref لقراءة alertType داخل effects بدون إضافته للـ deps (يمنع إعادة subscribe عند ظهور alert)
  const alertTypeRef = useRef(alert.type);
  alertTypeRef.current = alert.type;

  // ref لـ signOut لتجنب إضافتها في deps (دالة غير مستقرة المرجع في كل render)
  const signOutRef = useRef(signOut);
  signOutRef.current = signOut;

  // cache لنتيجة فحص الـ blacklist حتى لا يتكرر على كل snapshot
  const blacklistCheckedRef = useRef<{ email: string; result: boolean } | null>(null);
  
  const normalizeEmail = (email?: string | null) => (email || '').trim().toLowerCase();
  const isAdminAccount = adminAccountStatus === 'admin';

  // تحديد المسارات الخاصة بالمصادقة (لا نحتاج لمراقب لحظي فيها لتجنب التعارض)
  const isAuthPath =
    location.pathname === '/' ||
    location.pathname === '/signup/doctor' ||
    location.pathname === '/login/doctor' ||
    location.pathname === '/login/public' ||
    location.pathname === '/login/secretary';

  /** التحقق من أخطاء الصلاحيات (Permission Errors) */
  const isPermissionDeniedError = (error: any) => {
    const code = typeof error?.code === 'string' ? error.code : '';
    const message = typeof error?.message === 'string' ? error.message : '';
    return code === 'permission-denied' || message.includes('Missing or insufficient permissions');
  };

  /** تحديد دور الجلسة الحالية (طبيب أم جمهور) لتوجيه الاستعلام للمجموعة الصحيحة */
  const resolveSessionRole = (): 'doctor' | 'public' | null => {
    const authRole = user?.authRole;
    if (authRole === 'doctor' || authRole === 'public') return authRole;
    if (location.pathname.startsWith('/public') || location.pathname === '/login/public') return 'public';
    return null;
  };

  /** التأكد مما إذا كان المستخدم الحالي هو أحد مديري النظام (Admin) */
  useEffect(() => {
    if (!user?.uid) {
      setAdminAccountStatus('unknown');
      blacklistCheckedRef.current = null; // مسح كاش الـ blacklist عند تغيير المستخدم
      return;
    }

    const normalizedUserEmail = normalizeEmail(user.email);
    if (!normalizedUserEmail) {
      setAdminAccountStatus('user');
      return;
    }

    // Root admin UID from Firestore rules: 'OrdU20b9pBXfUYrh4z8hNR0F14B2'
    const ROOT_ADMIN_UID = 'OrdU20b9pBXfUYrh4z8hNR0F14B2';

    // فحص الإيميل البرمجي الثابت أو الـ UID أولاً
    if ((normalizedUserEmail && normalizedUserEmail === normalizeEmail(ADMIN_EMAIL)) || (user.uid === ROOT_ADMIN_UID)) {
      setAdminAccountStatus('admin');
      return;
    }

    let isMounted = true;
    // التأكد من وجود الإيميل في مجموعة المشرفين (Admins) — قراءة مباشرة من السيرفر لأن
    // صلاحيات الإدارة حساسة ولا يجوز الاعتماد على الكاش عند التحقق الأولي.
    getDoc(doc(db, 'admins', normalizedUserEmail))
      .then((snap) => {
        if (!isMounted) return;
        setAdminAccountStatus(snap.exists() ? 'admin' : 'user');
      })
      .catch(() => {
        if (!isMounted) return;
        setAdminAccountStatus('user');
      });

    return () => { isMounted = false; };
  }, [user?.uid, user?.email]);

  /** 
   * نظام المراقبة اللحظي (Real-time Watcher):
   * يقوم بالاشتراك في وثيقة المستخدم ورصد حقول (isAccountDisabled) و (verificationStatus).
   */
  useEffect(() => {
    if (!user?.uid || isAuthPath) return;
    if (adminAccountStatus === 'unknown') return;
    if (isAdminAccount) return; // الحسابات الإدارية محمية من الحظر الذاتي

    const sessionRole = resolveSessionRole();
    if (!sessionRole) return;
    const isPublicSession = sessionRole === 'public';
    let statusHandled = false;

    /** فحص "القائمة السوداء" (Blacklist): هل البريد الإلكتروني محظور نهائياً؟
     *  النتيجة تُحفظ في ref حتى لا يتكرر الطلب على كل snapshot. */
    const checkBlacklistedStatus = async () => {
      if (!user.email) return false;

      const userEmail = user.email.trim().toLowerCase();

      // استخدام النتيجة المحفوظة إذا كانت للنفس الإيميل (لا نعيد الطلب على كل snapshot)
      if (blacklistCheckedRef.current?.email === userEmail) {
        return blacklistCheckedRef.current.result;
      }

      const blacklistCollection = isPublicSession ? 'publicBlacklistedEmails' : 'blacklistedEmails';
      const blacklistRef = doc(db, blacklistCollection, userEmail);

      // قراءة مباشرة من السيرفر — فحص البلاك ليست أمني ولا يجوز الاعتماد على الكاش
      const blacklistDoc = await getDoc(blacklistRef);

      if (!blacklistDoc.exists()) {
        blacklistCheckedRef.current = { email: userEmail, result: false };
        return false;
      }

      const blacklistData = blacklistDoc.data();
      if (isPublicSession && blacklistData?.isBlocked === false) {
        blacklistCheckedRef.current = { email: userEmail, result: false };
        return false;
      }

      const blockMsg = blacklistData.reason
        ? `⛔ تم حظر هذا البريد الإلكتروني من التسجيل\n\nسبب الحظر: ${blacklistData.reason}\n\nتاريخ الحظر: ${formatUserDate(blacklistData.blockedAt, undefined, 'ar-EG')}`
        : '⛔ تم حظر هذا البريد الإلكتروني من التسجيل في النظام';

      // عرض الرسالة في صفحة تسجيل الدخول المقابلة
      localStorage.setItem(isPublicSession ? PUBLIC_AUTH_ERROR_KEY : 'blacklist_message', blockMsg);
      setAlert({ type: 'blacklisted', message: blockMsg });

      await signOutRef.current(); // طرد فوري للمستخدم المحظور
      navigate(isPublicSession ? '/login/public' : '/login/doctor', { replace: true });
      return true;
    };

    void checkBlacklistedStatus();

    // مراقبة حسابات الجمهور (Users/Patients)
    if (isPublicSession) {
      const handlePublicSnapshot = async (docSnap: any) => {
        if (statusHandled) return;
        const isBlacklisted = await checkBlacklistedStatus();
        if (isBlacklisted || statusHandled) return;
        if (!docSnap.exists()) return;

        const data = docSnap.data();
        if (data.isAccountDisabled === true) {
          // check-and-set ذري قبل أي عملية async — يمنع signOut المكرر
          // لو snapshot فات فجأة مرتين (server + cache).
          if (statusHandled) return;
          statusHandled = true;
          const disabledMsg = data.disabledReason ? `⛔ تم تعطيل حسابك.\n\nالسبب: ${data.disabledReason}` : '⛔ تم تعطيل حسابك بواسطة الإدارة.';
          localStorage.setItem(PUBLIC_AUTH_ERROR_KEY, disabledMsg);
          setAlert({ type: 'disabled', message: disabledMsg });
          await signOutRef.current();
          navigate('/login/public', { replace: true });
        }
      };

      const userDocRef = doc(db, 'users', user.uid);

      // 1. فحص فوري من الكاش للأداء والأمان
      getDocCacheFirst(userDocRef).then((snap) => {
        if (snap.exists()) handlePublicSnapshot(snap);
      }).catch(() => {});

      // 2. مراقبة حية من السيرفر
      const unsubUsers = onSnapshot(userDocRef, (snap) => handlePublicSnapshot(snap), (error) => {
        if (!isPermissionDeniedError(error)) console.error('Public monitor error:', error);
      });

      return () => unsubUsers();
    }

    // مراقبه حسابات الأطباء — listener واحد على users/{uid}.
    // كان قبل كده 2 listeners على نفس الـdoc بسبب alias قديم (ضعف القراءات والـonSnapshot triggers).
    const userDocRef = getUserProfileDocRef(user.uid);
    let latestUserData: Record<string, any> | null = null;

    const handleDoctorSnapshot = async () => {
      if (statusHandled) return;
      const isBlacklisted = await checkBlacklistedStatus();
      if (isBlacklisted) return;

      const data = latestUserData || {};
      if (Object.keys(data).length === 0 || resolveAuthRoleFromProfileData(data) !== 'doctor') return;

      // 1. فحص حالة التعطيل (Disabled)
      if (data.isAccountDisabled === true) {
        if (statusHandled) return; // حارس ذري — يمنع signOut المكرر من snapshot متزامن
        statusHandled = true;
        const disabledMsg = '⛔ تم تعطيل حسابك. يرجى التواصل مع الإدارة لإعادة التفعيل';
        localStorage.setItem('blacklist_message', disabledMsg);
        setAlert({ type: 'disabled', message: disabledMsg });
        await signOutRef.current();
        navigate('/login/doctor', { replace: true });
        return;
      }

      // 2. فحص حالة الرفض في التحقق (Rejected Verification)
      if (data.verificationStatus === 'rejected') {
        if (statusHandled) return;
        statusHandled = true;
        const rejectionReason = data.rejectionReason ? `\n\nسبب الرفض: ${data.rejectionReason}` : '';
        const rejectedMsg = `⛔ تم رفض طلب انضمامك للنظام${rejectionReason}\n\nللدعم، يرجى التواصل معنا`;
        localStorage.setItem('blacklist_message', rejectedMsg);
        setAlert({ type: 'rejected', message: rejectedMsg });
        await signOutRef.current();
        navigate('/login/doctor', { replace: true });
        return;
      }

      // 3. فحص حالة الحذف (Deleted)
      if (data.verificationStatus === 'deleted') {
        if (statusHandled) return;
        statusHandled = true;
        const deletedMsg = '⛔ تم حذف حسابك بشكل نهائي من قبل الإدارة.';
        localStorage.setItem('blacklist_message', deletedMsg);
        setAlert({ type: 'deleted', message: deletedMsg });
        await signOutRef.current();
        navigate('/login/doctor', { replace: true });
        return;
      }

      // تصفية التنبيهات إذا تم تصحيح الحالة برمجياً
      if (alertTypeRef.current === 'disabled' && data.isAccountDisabled === false) setAlert({ type: null, message: '' });
    };

    // 1. فحص فوري من الكاش
    getDocCacheFirst(userDocRef).then((userSnap) => {
      latestUserData = userSnap.exists() ? (userSnap.data() as Record<string, any>) : null;
      void handleDoctorSnapshot();
    }).catch(() => {});

    // 2. مراقبه حيه من السيرفر — listener واحد فقط على users/{uid}
    const unsubscribeUser = onSnapshot(
      userDocRef,
      (snap) => {
        latestUserData = snap.exists() ? (snap.data() as Record<string, any>) : null;
        void handleDoctorSnapshot();
      },
      (error) => {
        if (!isPermissionDeniedError(error)) console.error('Doctor monitor error:', error);
      }
    );

    return () => {
      unsubscribeUser();
    };
    // alert.type مُزال من deps عمداً لمنع إعادة subscribe عند ظهور/اختفاء alert
    // يُقرأ alert.type عبر alertTypeRef.current داخل الـ effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, user?.email, user?.authRole, isAdminAccount, isAuthPath, adminAccountStatus, location.pathname]);

  return alert;
};
