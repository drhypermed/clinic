/**
 * صفحة إنشاء حساب الطبيب (Doctor Signup Page):
 * تصميم فيسبوك-style: كارد أبيض بسيط، حقول واضحة، زر أزرق عريض.
 * تقوم الصفحة بفحوصات أمان مستقلة (حظر، حساب مكرر، حساب جمهور) قبل إتمام التسجيل.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { FcGoogle } from 'react-icons/fc';
import {
  FaWhatsapp,
  FaCamera,
  FaXmark,
  FaTriangleExclamation,
} from 'react-icons/fa6';
import { useAuth } from '../../hooks/useAuth';
import { db, storage, auth, googleProvider } from '../../services/firebaseConfig';
import { PUBLIC_AUTH_ERROR_KEY } from '../../services/auth-service';
import { formatUserDate } from '../../utils/cairoTime';
import { AuthLayout } from './AuthLayout';
import { BrandLogo } from '../common/BrandLogo';
import { MEDICAL_SPECIALTIES } from './medicalSpecialties';
import { LegalConsentGate } from './legal/LegalConsentGate';
import {
  buildDoctorUserProfilePayload,
  getUserProfileDocRef,
  isDoctorLikeUserData,
  isPublicLikeUserData,
} from '../../services/firestore/profileRoles';
import { clearAuthFlowGuard, clearAuthFlowGuardSoon, setAuthFlowGuard } from './authFlowGuard';
// حفظ بيانات الـsignup قبل الـredirect — عشان لما الطبيب يرجع من Google نكمل تلقائياً
import {
  saveSignupForm,
  loadSignupForm,
  clearSignupForm,
  setSignupRedirectFlag,
  consumeSignupRedirectFlag,
  fileToDataUrl,
  dataUrlToFile,
} from './signupFormPersistence';

const SESSION_ROLE_STORAGE_KEY = 'dh_auth_role';
const SIGNUP_DOCTOR_PATH = '/signup/doctor';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const inputBase =
  'w-full h-12 px-4 bg-white border border-slate-300 rounded-lg text-slate-900 text-base font-semibold placeholder:text-slate-400 placeholder:font-normal shadow-[inset_0_1px_0_rgba(15,23,42,0.02)] focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 hover:border-slate-400 transition';

const labelBase = 'block text-sm font-bold text-slate-900 mb-1.5';

export const DoctorSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { loading, error, clearError, user } = useAuth();

  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [licenseImage, setLicenseImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const [loginError, setLoginError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isLegalReady, setIsLegalReady] = useState(false);

  // علم "الطبيب رجع للتو من signInWithRedirect".
  // الـconsume بيحصل مرّه واحده عند الـmount (في useState init) — لو الـflag كان
  // موجود في sessionStorage، الـstate يبقى true ونعمل auto-submit. بعدين
  // نخليه false عشان ميشتغلش تاني.
  const [hasReturnedFromRedirect, setHasReturnedFromRedirect] = useState<boolean>(
    () => consumeSignupRedirectFlag(),
  );

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/', { replace: true });
  };

  useEffect(() => {
    localStorage.removeItem(PUBLIC_AUTH_ERROR_KEY);
    const blacklistMsg = localStorage.getItem('blacklist_message');
    const blacklistErr = localStorage.getItem('blacklist_error');
    const duplicateErr = localStorage.getItem('duplicate_account_error');
    const publicRoleErr = localStorage.getItem('public_role_error');

    if (blacklistMsg) {
      setLoginError(blacklistMsg);
      localStorage.removeItem('blacklist_message');
    } else if (blacklistErr) {
      setLoginError(blacklistErr);
      localStorage.removeItem('blacklist_error');
    } else if (publicRoleErr) {
      setLoginError(publicRoleErr);
      localStorage.removeItem('public_role_error');
    } else if (duplicateErr) {
      setLoginError(duplicateErr);
      localStorage.removeItem('duplicate_account_error');
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Auto-submit بعد الرجوع من signInWithRedirect
  // ─────────────────────────────────────────────────────────────────────────
  // لما الـpopup يفشل على Safari/iOS/PWA، handleGoogleSignup بيعمل
  // signInWithRedirect وبيحفظ الـform في sessionStorage. الـpage بتتعاد تحميلها،
  // الطبيب يدخل بـGoogle، يرجع للـapp. هنا بنلتقط الـpending form ونكمل الـsubmit
  // تلقائياً — الطبيب ميحتاجش يضغط الزر تاني ولا يرفع الصورة من جديد.
  useEffect(() => {
    if (!hasReturnedFromRedirect) return;
    // ننتظر useAuth يخلص الـinit (loading=false) و auth.currentUser يتاح
    if (loading) return;
    if (!auth.currentUser) {
      // الـauth لسه ما جهزش — هنحاول تاني لما user/loading يتغير
      return;
    }

    const pending = loadSignupForm();
    if (!pending) {
      // مفيش form محفوظ (TTL منتهي أو الـuser فتح الصفحه يدوياً) — اخرج
      setHasReturnedFromRedirect(false);
      return;
    }

    const restoredFile = dataUrlToFile(pending.licenseImageDataUrl, pending.licenseImageName);
    if (!restoredFile) {
      // الـbase64 تالف — نطلب من الطبيب يرفع الصوره من جديد
      setLoginError('تعذَّر استرجاع صورة الترخيص بعد العودة من Google. يرجى رفعها من جديد.');
      clearSignupForm();
      setHasReturnedFromRedirect(false);
      return;
    }

    // عرض البيانات في الـUI أثناء الـsubmit (شفافية للطبيب)
    setDoctorName(pending.doctorName);
    setSpecialty(pending.specialty);
    setWhatsapp(pending.whatsapp);
    setLicenseImage(restoredFile);
    setImagePreview(pending.licenseImageDataUrl);

    setAuthFlowGuard(SIGNUP_DOCTOR_PATH);
    setIsChecking(true);
    setHasReturnedFromRedirect(false);  // عشان الـeffect ميشتغلش تاني

    submitDoctorProfile(auth.currentUser, {
      doctorName: pending.doctorName,
      specialty: pending.specialty,
      whatsapp: pending.whatsapp,
      licenseImage: restoredFile,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps -- submitDoctorProfile
  // معرَّفه داخل الـcomponent ومش memoized — حطها في الـdeps هيخلي الـeffect يشتغل
  // كل render. الـlogic معتمد فقط على hasReturnedFromRedirect/loading/user.
  }, [hasReturnedFromRedirect, loading, user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE) {
      setLoginError('حجم الصورة يجب أن لا يتجاوز 5 MB');
      return;
    }
    setLicenseImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    setLoginError('');
  };

  // ─────────────────────────────────────────────────────────────────────────
  // submitDoctorProfile: المنطق المشترك بين تسجيل-عبر-popup وتسجيل-بعد-redirect
  // ─────────────────────────────────────────────────────────────────────────
  // بعد ما الطبيب يدخل بـGoogle (سواء من popup أو من redirect)، الفنكشن دي
  // بتعمل: blacklist check → duplicate check → upload صوره → save profile → signout.
  // الـerror handling هنا بيعرض رسالة في الـUI وبيمسح الـpending form.
  const submitDoctorProfile = async (
    user: import('firebase/auth').User,
    formValues: {
      doctorName: string;
      specialty: string;
      whatsapp: string;
      licenseImage: File;
    },
  ): Promise<void> => {
    const clearSignupGuardSoon = (delayMs = 0) => clearAuthFlowGuardSoon(SIGNUP_DOCTOR_PATH, delayMs);

    try {
      const userEmail = (user.email || '').trim().toLowerCase();

      const [userProfileDoc, blacklistDoc] = await Promise.all([
        getDoc(getUserProfileDocRef(user.uid)),
        getDoc(doc(db, 'blacklistedEmails', userEmail)),
      ]);

      const userProfileData = userProfileDoc.exists() ? (userProfileDoc.data() as Record<string, any>) : null;

      // 1. فحص القائمة السوداء أولاً
      if (blacklistDoc.exists()) {
        const blacklistData = blacklistDoc.data();
        const blockMsg = blacklistData.reason
          ? `⛔ تم حظر هذا البريد الإلكتروني من التسجيل\n\nسبب الحظر: ${blacklistData.reason}\n\nتاريخ الحظر: ${formatUserDate(blacklistData.blockedAt, undefined, 'ar-EG')}`
          : '⛔ تم حظر هذا البريد الإلكتروني من التسجيل في النظام';
        localStorage.setItem('blacklist_message', blockMsg);
        try { await firebaseSignOut(auth); } catch { /* best effort */ }
        clearSignupForm();
        setLoginError(blockMsg);
        clearSignupGuardSoon(500);
        setIsChecking(false);
        return;
      }

      // 2. فحص إذا كان الحساب مسجل كطبيب
      if (isDoctorLikeUserData(userProfileData)) {
        let errorMsg: string;
        let errorKey: string;
        if (userProfileData!.isAccountDisabled) {
          errorKey = 'blacklist_message';
          errorMsg = userProfileData!.disabledReason
            ? `⛔ عذراً، تم تعطيل حسابك.\n\nالسبب: ${userProfileData!.disabledReason}\n\nيرجى التواصل مع الإدارة.`
            : '⛔ عذراً، تم تعطيل حسابك.\n\nيرجى التواصل مع الإدارة للمزيد من التفاصيل.';
        } else if (userProfileData!.verificationStatus === 'rejected') {
          errorKey = 'blacklist_message';
          errorMsg = userProfileData!.rejectionReason
            ? `⛔ تم رفض طلب التسجيل.\n\nسبب الرفض: ${userProfileData!.rejectionReason}`
            : '⛔ تم رفض طلب التسجيل. لا يمكنك الدخول للنظام.';
        } else {
          errorKey = 'duplicate_account_error';
          errorMsg = `⛔ هذا الحساب مسجل كطبيب بالفعل!\n\nالبريد الإلكتروني: ${userEmail}\n\nيرجى استخدام صفحة تسجيل الدخول للدخول إلى حسابك الموجود.`;
        }
        localStorage.setItem(errorKey, errorMsg);
        localStorage.removeItem(SESSION_ROLE_STORAGE_KEY);
        try { await firebaseSignOut(auth); } catch { /* best effort */ }
        clearSignupForm();
        setLoginError(errorMsg);
        clearSignupGuardSoon(500);
        setIsChecking(false);
        return;
      }

      // 3. فحص إذا كان الحساب مسجل كجمهور
      if (isPublicLikeUserData(userProfileData)) {
        const publicMsg = `⛔ هذا الحساب مسجل كحساب جمهور بالفعل.\n\nالبريد الإلكتروني: ${userEmail}\n\nلا يمكن استخدام حساب الجمهور للتسجيل كطبيب.`;
        localStorage.setItem('public_role_error', publicMsg);
        localStorage.removeItem(PUBLIC_AUTH_ERROR_KEY);
        localStorage.removeItem(SESSION_ROLE_STORAGE_KEY);
        try { await firebaseSignOut(auth); } catch { /* best effort */ }
        clearSignupForm();
        setLoginError(publicMsg);
        clearSignupGuardSoon(500);
        setIsChecking(false);
        return;
      }

      // 4. رفع صورة الترخيص + حفظ البروفايل
      const safeName = formValues.licenseImage.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storageRef = ref(storage, `doctor-verification/${user.uid}/${Date.now()}_${safeName}`);
      await uploadBytes(storageRef, formValues.licenseImage);
      const licenseImageUrl = await getDownloadURL(storageRef);

      await setDoc(getUserProfileDocRef(user.uid), buildDoctorUserProfilePayload({
        uid: user.uid,
        doctorName: formValues.doctorName.trim(),
        doctorSpecialty: formValues.specialty,
        doctorWhatsApp: formValues.whatsapp.trim(),
        doctorEmail: (user.email || '').trim().toLowerCase(),
        verificationDocUrl: licenseImageUrl,
        verificationStatus: 'submitted',
        emailVerified: user.emailVerified ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }), { merge: true });

      // ─ إجراء أمان: signout الطبيب فور تسجيل البيانات.
      // محدش يدخل التطبيق غير بعد ما الأدمن يعتمده يدوياً (verificationStatus = 'approved').
      try { await firebaseSignOut(auth); } catch { /* best effort — الـguard في useAuth backup */ }

      localStorage.setItem(SESSION_ROLE_STORAGE_KEY, 'doctor');
      clearAuthFlowGuard();
      clearSignupForm();

      alert(
        '✅ تم تسجيل طلبك بنجاح!\n\n' +
        '📋 سيتم مراجعة حسابك من الإدارة خلال 24 ساعة.\n' +
        '🔐 جرّب تسجيل الدخول من صفحة الدخول دورياً — حسابك هيشتغل فور اعتماد الإدارة.',
      );

      window.location.href = '/login';
    } catch (err: any) {
      try { await firebaseSignOut(auth); } catch { /* best effort */ }
      localStorage.removeItem(SESSION_ROLE_STORAGE_KEY);
      clearSignupForm();

      const errorCode = String(err?.code || '');
      const errorMessage = String(err?.message || '');

      // ─ "Missing or insufficient permissions" بيحصل لما الـuser doc موجود
      //   بالفعل (طبيب مسجّل قبل كده) — نعرض رسالة مفهومة بدل نص الـerror الخام.
      const isPermissionError =
        errorCode === 'permission-denied' ||
        /missing or insufficient permissions/i.test(errorMessage);

      if (isPermissionError) {
        setLoginError(
          '✅ يوجد حساب مسجّل بالفعل بهذا البريد، وهو حالياً قيد مراجعة الإدارة.\n\n' +
          '📋 سيتم تفعيل الحساب فور الاعتماد بعد الاطلاع على البيانات.\n' +
          '🔐 لا داعي لإنشاء حساب جديد — جرّب تسجيل الدخول من صفحة الدخول دورياً.',
        );
      } else {
        setLoginError(errorMessage || 'فشل في حفظ بياناتك. حاول مرة أخرى.');
      }

      clearAuthFlowGuard();
      setIsChecking(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoginError('');
    clearError();

    if (!isLegalReady) {
      setLoginError('يلزم الموافقة على شروط وسياسة خصوصية الأطباء قبل إنشاء الحساب.');
      return;
    }
    if (!doctorName.trim()) { setLoginError('يرجى إدخال الاسم الكامل'); return; }
    if (!specialty) { setLoginError('يرجى اختيار التخصص الطبي'); return; }
    if (!whatsapp.trim() || whatsapp.trim().length < 8) { setLoginError('يرجى إدخال رقم واتساب صحيح'); return; }
    if (!licenseImage) { setLoginError('صورة الكارنيه أو الترخيص مطلوبة'); return; }

    localStorage.removeItem(PUBLIC_AUTH_ERROR_KEY);
    localStorage.removeItem('blacklist_message');
    localStorage.removeItem('duplicate_account_error');
    setAuthFlowGuard(SIGNUP_DOCTOR_PATH);
    setIsChecking(true);

    // حفظ الـform في sessionStorage قبل ما نحاول signInWithPopup.
    // ضروري عشان لو الـpopup فشل (Safari/iOS/PWA)، نـfallback لـsignInWithRedirect
    // اللي بيـreload الصفحه. بعد ما الطبيب يرجع من Google، useEffect هيسترجع
    // الـform ويكمل الـsubmit تلقائياً. لو الصورة كبيره (>4.5MB)، الحفظ هيفشل
    // ونسقط لرسالة واضحه (الحل القديم).
    let formSavedForRedirect = false;
    try {
      const dataUrl = await fileToDataUrl(licenseImage);
      const saveResult = saveSignupForm({
        doctorName: doctorName.trim(),
        specialty,
        whatsapp: whatsapp.trim(),
        licenseImageDataUrl: dataUrl,
        licenseImageName: licenseImage.name,
      });
      formSavedForRedirect = saveResult.ok;
    } catch {
      formSavedForRedirect = false;
    }

    try {
      const credential = await signInWithPopup(auth, googleProvider);
      // popup نجح — نـconsume أي flag قديم من محاولات سابقة، ثم نكمل الـsubmit.
      consumeSignupRedirectFlag();
      await submitDoctorProfile(credential.user, {
        doctorName: doctorName.trim(),
        specialty,
        whatsapp: whatsapp.trim(),
        licenseImage,
      });
    } catch (err: any) {
      const errorCode = String(err?.code || '');
      const errorMessage = String(err?.message || '');

      const isPopupBlocked =
        errorCode === 'auth/popup-blocked' ||
        errorCode === 'auth/operation-not-supported-in-this-environment';
      const isPopupClosed =
        errorCode === 'auth/popup-closed-by-user' ||
        errorCode === 'auth/cancelled-popup-request';
      const isPermissionError =
        errorCode === 'permission-denied' ||
        /missing or insufficient permissions/i.test(errorMessage);

      if (isPopupBlocked && formSavedForRedirect) {
        // الـbrowser منع الـpopup → fallback لـsignInWithRedirect.
        // الـpage هتتعاد تحميلها، useEffect عند الرجوع هيلتقط الـpending form
        // ويكمل الـsubmit تلقائياً بدون تدخل من الطبيب.
        setSignupRedirectFlag();
        try {
          await signInWithRedirect(auth, googleProvider);
          // العمليه سلّمت تحكّم للـbrowser — مش بنعمل setIsChecking(false)
          // لأن الصفحه هتتعاد تحميلها فوراً.
          return;
        } catch (redirectErr: any) {
          // الـredirect نفسه فشل (نادر) — نسقط لرسالة واضحه
          clearSignupForm();
          setLoginError(
            '🚫 تعذَّر فتح صفحة Google لتسجيل الدخول.\n\n' +
            '💡 الحلول:\n' +
            '• اسمح بالنوافذ المنبثقة لهذا الموقع\n' +
            '• على iPhone: افتح الموقع في Safari مباشرةً\n' +
            '• جرّب متصفّح تاني زي Chrome أو Firefox',
          );
          clearAuthFlowGuard();
          setIsChecking(false);
          return;
        }
      }

      // باقي الأخطاء — مفيش redirect fallback
      try { await firebaseSignOut(auth); } catch { /* best effort */ }
      localStorage.removeItem(SESSION_ROLE_STORAGE_KEY);
      clearSignupForm();

      if (isPopupBlocked && !formSavedForRedirect) {
        // الـform كانت أكبر من حد التخزين — نعرض رسالة بديله للـuser
        setLoginError(
          '🚫 المتصفّح منع نافذة تسجيل دخول جوجل، وصورة الترخيص أكبر من 4.5MB ' +
          'فتعذَّر حفظ بياناتك للمتابعة التلقائية.\n\n' +
          '💡 الحلول:\n' +
          '• اضغط الصورة لتقل عن 4.5MB ثم حاول تاني\n' +
          '• اسمح بالنوافذ المنبثقة لهذا الموقع\n' +
          '• جرّب متصفّح تاني زي Chrome أو Firefox',
        );
      } else if (isPopupClosed) {
        setLoginError('تم إلغاء تسجيل الدخول. اضغط الزر مرة تانية للمتابعة — بياناتك محفوظه.');
      } else if (isPermissionError) {
        setLoginError(
          '✅ يوجد حساب مسجّل بالفعل بهذا البريد، وهو حالياً قيد مراجعة الإدارة.\n\n' +
          '📋 سيتم تفعيل الحساب فور الاعتماد بعد الاطلاع على البيانات.\n' +
          '🔐 لا داعي لإنشاء حساب جديد — جرّب تسجيل الدخول من صفحة الدخول دورياً.',
        );
      } else {
        setLoginError(errorMessage || 'فشل تسجيل الدخول عبر Google');
      }

      clearAuthFlowGuard();
      setIsChecking(false);
    }
  };

  const mergedError = loginError || error;

  return (
    <AuthLayout>
      <div className="w-full max-w-md" dir="rtl">
        <div className="flex flex-col items-center mb-2 lg:mb-5">
          <BrandLogo className="w-36 h-36 lg:w-48 lg:h-48" size={192} fetchPriority="high" />
        </div>

        <div className="relative bg-white rounded-2xl shadow-card ring-1 ring-slate-200/60 overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-brand-700 to-brand-500" />
          <div className="px-6 pt-6 pb-4 border-b border-slate-200">
            <h2 className="text-2xl font-black text-slate-900 leading-tight">إنشاء حساب جديد للطبيب</h2>
            <p className="text-sm text-slate-600 font-semibold mt-1">أكمل بياناتك ثم سجّل بحساب Google.</p>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div>
              <label htmlFor="doctorName" className={labelBase}>
                الاسم الكامل <span className="text-danger-600">*</span>
              </label>
              <input
                id="doctorName"
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="د. محمد أحمد"
                className={inputBase}
                dir="rtl"
              />
            </div>

            <div>
              <label htmlFor="specialty" className={labelBase}>
                التخصص الطبي <span className="text-danger-600">*</span>
              </label>
              <select
                id="specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className={inputBase}
                dir="rtl"
              >
                <option value="">اختر التخصص</option>
                {MEDICAL_SPECIALTIES.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="whatsapp" className={labelBase}>
                رقم واتساب <span className="text-danger-600">*</span>
              </label>
              <input
                id="whatsapp"
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="01234567890"
                className={`${inputBase} text-left`}
                dir="ltr"
              />
            </div>

            <div>
              <label htmlFor="licenseImage" className={labelBase}>
                صورة الكارنيه أو الترخيص <span className="text-danger-600">*</span>
              </label>
              <input
                id="licenseImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="licenseImage"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border border-dashed border-slate-400 rounded-md text-slate-800 text-sm font-bold hover:bg-slate-100 hover:border-brand-500 cursor-pointer transition"
              >
                <FaCamera className="w-4 h-4 text-slate-600" />
                <span className="truncate max-w-[220px]">
                  {licenseImage ? licenseImage.name : 'اختر صورة الكارنيه أو الترخيص'}
                </span>
              </label>
              {imagePreview && (
                <div className="mt-3 relative inline-block">
                  <img
                    src={imagePreview}
                    alt="معاينة الكارنيه"
                    className="max-h-40 rounded-md border border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setLicenseImage(null);
                    }}
                    aria-label="إزالة الصورة"
                    className="absolute -top-2 -right-2 bg-danger-600 hover:bg-danger-700 text-white rounded-full w-7 h-7 flex items-center justify-center shadow transition"
                  >
                    <FaXmark className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {mergedError && (
              <div className="p-3 bg-danger-50 border border-danger-300 rounded-md space-y-3">
                <div className="flex items-start gap-2">
                  <FaTriangleExclamation className="w-5 h-5 flex-shrink-0 text-danger-600 mt-0.5" />
                  <div className="text-danger-800 text-sm font-semibold whitespace-pre-wrap leading-relaxed">
                    {mergedError}
                  </div>
                </div>

                {mergedError.includes('مسجل كطبيب بالفعل') && (
                  <button
                    type="button"
                    onClick={() => navigate('/login/doctor', { replace: true })}
                    className="w-full py-2 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-md transition"
                  >
                    اذهب لصفحة تسجيل الدخول
                  </button>
                )}

                {mergedError.includes('حساب جمهور') && (
                  <button
                    type="button"
                    onClick={() => navigate('/login/public', { replace: true })}
                    className="w-full py-2 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-md transition"
                  >
                    اذهب لتسجيل دخول الجمهور
                  </button>
                )}

                {(mergedError.includes('تم تعطيل') || mergedError.includes('تم رفض') || mergedError.includes('تم حظر') || mergedError.includes('حساب جمهور')) && (
                  <a
                    href="https://wa.me/201092805293"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-success-600 hover:bg-success-700 text-white font-bold text-sm rounded-md transition"
                  >
                    <FaWhatsapp className="w-4 h-4" />
                    واتساب الإدارة
                  </a>
                )}
              </div>
            )}

            <LegalConsentGate
              audience="doctor"
              onValidityChange={(ready) => {
                setIsLegalReady(ready);
              }}
            />

            <button
              type="button"
              onClick={() => {
                clearError();
                void handleGoogleSignup();
              }}
              // تعطيل الزر لو أي حقل إجباري ناقص — خط دفاع أول قبل فاليديشن handleGoogleSignup
              disabled={
                loading ||
                isChecking ||
                !isLegalReady ||
                !doctorName.trim() ||
                !specialty ||
                !whatsapp.trim() ||
                !licenseImage
              }
              className="w-full py-3 px-4 bg-gradient-to-b from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-black text-base rounded-lg shadow-cta transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.99]"
            >
              {(loading || isChecking) ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isChecking ? 'جاري إنشاء الحساب' : 'جاري تسجيل الدخول'}</span>
                </>
              ) : (
                <>
                  <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                    <FcGoogle className="w-4 h-4" />
                  </span>
                  <span>إنشاء حساب بـ Google</span>
                </>
              )}
            </button>

            <div className="pt-3 border-t border-slate-200 text-center space-y-2">
              <button
                type="button"
                onClick={() => navigate('/login/doctor', { replace: true })}
                className="text-sm font-bold text-brand-700 hover:underline"
              >
                لديك حساب بالفعل؟ تسجيل الدخول
              </button>
              <div>
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
                >
                  ← العودة للخلف
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};
