/**
 * صفحة استكمال بيانات الطبيب (Doctor Onboarding Page):
 * تشتغل لما الطبيب يدخل بحساب معتمد لكن ملفه ناقص واحدة من 3 بيانات أساسية:
 * 1. التخصص الطبي
 * 2. رقم الواتساب
 * 3. صورة الترخيص (الكارنيه)
 *
 * بدل ما نطرد الطبيب على /login، الصفحة بتعرض نموذج بسيط لاستكمال الناقص
 * فقط، تحفظ التغييرات في ملفه، وتوجّهه على الصفحة الرئيسية بإعادة تحميل
 * كاملة (عشان الذاكرة المؤقتة للحارس تتحدّث).
 *
 * حالات استثنائية لسه بنعمل فيها تسجيل خروج (السلوك القديم):
 * - الحساب مش موجود أصلاً في قاعدة البيانات
 * - الحساب مرفوض من الإدارة (verificationStatus === 'rejected')
 * - فشل قراءة البيانات (شبكة/صلاحيات)
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoc, setDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FaWhatsapp, FaCamera, FaXmark } from 'react-icons/fa6';
import { AuthLayout } from './AuthLayout';
import { BrandLogo } from '../common/BrandLogo';
import { MEDICAL_SPECIALTIES } from './medicalSpecialties';
import { useAuth } from '../../hooks/useAuth';
import { storage } from '../../services/firebaseConfig';
import {
  getUserProfileDocRef,
  isDoctorLikeUserData,
} from '../../services/firestore/profileRoles';

// حد أقصى لحجم صورة الترخيص — نفس قيمة صفحة الـsignup للاتساق
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// أنماط الحقول — منسوخة من DoctorSignupPage عشان نوحّد الشكل البصري
const inputBase =
  'w-full h-12 px-4 bg-white border border-slate-300 rounded-lg text-slate-900 text-base font-semibold placeholder:text-slate-400 placeholder:font-normal shadow-[inset_0_1px_0_rgba(15,23,42,0.02)] focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 hover:border-slate-400 transition';
const labelBase = 'block text-sm font-bold text-slate-900 mb-1.5';

// شكل البيانات اللي بنفحصها من ملف الطبيب
type DoctorProfileSnapshot = {
  doctorSpecialty?: string;
  doctorWhatsApp?: string;
  verificationDocUrl?: string;
  verificationStatus?: string;
};

// أي حقل ناقص محتاج استكمال
type MissingFlags = {
  specialty: boolean;
  whatsapp: boolean;
  license: boolean;
};

// حساب أي بيانات ناقصة من ملف الطبيب
const computeMissingFlags = (data: DoctorProfileSnapshot | null): MissingFlags => ({
  specialty: !data?.doctorSpecialty,
  whatsapp: !data?.doctorWhatsApp,
  license: !data?.verificationDocUrl,
});

// هل في أي بيانات ناقصة؟ — لو لأ، الطبيب مش محتاج يستكمل أي حاجة
const hasAnyMissing = (flags: MissingFlags): boolean =>
  flags.specialty || flags.whatsapp || flags.license;

export const DoctorOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // مراحل العرض: loading أثناء قراءة الملف، form لما يبان الناقص، fatal للأخطاء النهائية
  const [phase, setPhase] = useState<'loading' | 'form' | 'fatal'>('loading');
  const [fatalMessage, setFatalMessage] = useState('');

  // الحقول اللي ناقصة — بيتحدّد بعد قراءة الملف من السيرفر
  const [missing, setMissing] = useState<MissingFlags>({ specialty: false, whatsapp: false, license: false });

  // قيم النموذج — بنبدأها فاضية لأن الطبيب لازم يدخّلها
  const [specialty, setSpecialty] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [licenseImage, setLicenseImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  // حالة الحفظ + رسالة خطأ مرئية للطبيب
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // حارس الـmount — يمنع setState بعد ما الكومبوننت يـunmount
  const isMountedRef = useRef(true);

  // قراءة ملف الطبيب من السيرفر مباشرة (مش من الذاكرة المؤقتة)
  // عشان نضمن إن الفحص اللي هيحدّد الناقص متطابق مع آخر حالة في قاعدة البيانات
  useEffect(() => {
    isMountedRef.current = true;

    if (!user?.uid) {
      // مفيش جلسة — رجّعه على بوابة دخول الأطباء
      navigate('/login/doctor', { replace: true });
      return;
    }

    const loadProfile = async () => {
      try {
        // قراءة مباشرة من السيرفر — مش getDocCacheFirst
        // لأن الكاش ممكن يكون قديم وبيقول "البيانات مكتملة" غلط
        const snap = await getDoc(getUserProfileDocRef(user.uid));
        if (!isMountedRef.current) return;

        const data = snap.exists() ? (snap.data() as Record<string, any>) : null;

        // حالة 1: الحساب مش موجود أو مش طبيب → خروج
        if (!snap.exists() || !isDoctorLikeUserData(data)) {
          setFatalMessage('هذا الحساب غير موجود. سيتم تسجيل الخروج.');
          setPhase('fatal');
          await signOut();
          setTimeout(() => {
            if (isMountedRef.current) navigate('/login/doctor', { replace: true });
          }, 2000);
          return;
        }

        const profile = data as DoctorProfileSnapshot;

        // حالة 2: الحساب مرفوض من الإدارة → خروج
        if (profile.verificationStatus === 'rejected') {
          setFatalMessage('تم رفض طلب التسجيل. سيتم تسجيل الخروج.');
          setPhase('fatal');
          await signOut();
          setTimeout(() => {
            if (isMountedRef.current) navigate('/login/doctor', { replace: true });
          }, 2000);
          return;
        }

        const flags = computeMissingFlags(profile);

        // حالة 3: مفيش أي ناقص → روّحه على الصفحة الرئيسية
        if (!hasAnyMissing(flags)) {
          navigate('/home', { replace: true });
          return;
        }

        // حالة 4: في ناقص → اعرض النموذج لاستكمال الحقول الناقصة فقط
        setMissing(flags);
        setPhase('form');
      } catch (err) {
        // فشل قراءة البيانات (شبكة/صلاحيات) — نعرض رسالة ونعمل خروج بعد ثانيتين
        console.error('Onboarding profile load error:', err);
        if (!isMountedRef.current) return;
        setFatalMessage('تعذَّر قراءة بيانات حسابك. تأكَّد من اتصالك بالإنترنت ثم سجَّل دخول مرة أخرى.');
        setPhase('fatal');
        setTimeout(async () => {
          try { await signOut(); } catch { /* أفضل جهد */ }
          if (isMountedRef.current) navigate('/login/doctor', { replace: true });
        }, 2500);
      }
    };

    loadProfile();

    return () => {
      isMountedRef.current = false;
    };
  }, [user?.uid, navigate, signOut]);

  // اختيار صورة الترخيص + معاينة فورية
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE) {
      setFormError('حجم الصورة يجب ألا يتجاوز 5 ميجابايت');
      return;
    }
    setLicenseImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    setFormError('');
  };

  // إزالة الصورة المختارة — يرجّع الحقل لحالته الفارغة
  const handleRemoveImage = () => {
    setLicenseImage(null);
    setImagePreview('');
  };

  // التحقق من اكتمال النموذج قبل الإرسال — كل حقل ناقص لازم الطبيب يدخّله
  const isFormValid = useMemo(() => {
    if (missing.specialty && !specialty) return false;
    if (missing.whatsapp && (!whatsapp.trim() || whatsapp.trim().length < 8)) return false;
    if (missing.license && !licenseImage) return false;
    return true;
  }, [missing, specialty, whatsapp, licenseImage]);

  // حفظ البيانات الناقصة فقط — بدون لمس باقي الحقول (verificationStatus, الاعتماد، إلخ)
  const handleSave = async () => {
    if (!user?.uid) return;
    if (!isFormValid) {
      setFormError('يرجى إكمال جميع الحقول المطلوبة قبل الحفظ.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      // payload بناخده تدريجياً — كل حقل ناقص بنضيفه فقط لو الطبيب دخّل قيمته
      const payload: Record<string, unknown> = {
        updatedAt: new Date().toISOString(),
      };

      if (missing.specialty) {
        payload.doctorSpecialty = specialty;
      }
      if (missing.whatsapp) {
        payload.doctorWhatsApp = whatsapp.trim();
      }
      if (missing.license && licenseImage) {
        // رفع صورة الترخيص لـStorage بنفس مسار صفحة الـsignup
        const safeName = licenseImage.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `doctor-verification/${user.uid}/${Date.now()}_${safeName}`;
        const fileRef = storageRef(storage, path);
        await uploadBytes(fileRef, licenseImage);
        payload.verificationDocUrl = await getDownloadURL(fileRef);
      }

      // setDoc مع merge:true — بيحدّث الحقول الناقصة فقط بدون لمس باقي الملف
      // مهم: ما بنبعتش authRole/userRole — لأنهم حقول محمية في الـrules،
      // ولو الحساب القديم ما عندوش الحقول دي، إضافتهم هتترفض من السيرفر.
      await setDoc(getUserProfileDocRef(user.uid), payload, { merge: true });

      // إعادة تحميل كاملة على /home — ضرورية عشان الحارس useDoctorOnboardingStatus
      // ميـreuseش حالة 'incomplete' القديمة من الذاكرة المؤقتة. التحميل الجديد
      // يقرأ الملف المحدّث من السيرفر ويسمح بالدخول الطبيعي.
      window.location.href = '/home';
    } catch (err: any) {
      console.error('Onboarding save error:', err);
      if (!isMountedRef.current) return;
      const code = String(err?.code || '');
      const isPermissionError = code === 'permission-denied' || /missing or insufficient permissions/i.test(String(err?.message || ''));
      setFormError(
        isPermissionError
          ? 'لا تملك صلاحية لتحديث هذه البيانات. يرجى التواصل مع الإدارة.'
          : 'فشل حفظ البيانات. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.',
      );
      setSaving(false);
    }
  };

  // مرحلة التحميل الأولية — مفيش UI ظاهر، الصفحة بتقرر فين توديك
  if (phase === 'loading') return null;

  // مرحلة الخطأ النهائي (حساب مش موجود/مرفوض/فشل قراءة) — نفس عرض الإصدار القديم
  if (phase === 'fatal') {
    return (
      <AuthLayout>
        <div className="w-full max-w-md text-center" dir="rtl">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 space-y-6">
            <div className="text-3xl mb-4">❌</div>
            <p className="text-danger-200 font-bold text-lg">{fatalMessage}</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // مرحلة النموذج — بنعرض فقط الحقول الناقصة
  return (
    <AuthLayout>
      <div className="w-full max-w-md" dir="rtl">
        <div className="flex flex-col items-center mb-2 lg:mb-5">
          <BrandLogo className="w-32 h-32 lg:w-40 lg:h-40" size={160} fetchPriority="high" />
        </div>

        <div className="relative bg-white rounded-2xl shadow-card ring-1 ring-slate-200/60 overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-brand-700 to-brand-500" />

          {/* رأس الصفحة — يوضّح للطبيب ليه الصفحة دي ظهرت */}
          <div className="px-6 pt-6 pb-4 border-b border-slate-200">
            <h2 className="text-2xl font-black text-slate-900 leading-tight">استكمال بيانات حسابك</h2>
            <p className="text-sm text-slate-700 font-semibold mt-2 leading-relaxed">
              ملفك ناقص بعض البيانات الأساسية. أكملها مرّة واحدة وادخل لحسابك مباشرة بدون انتظار اعتماد الإدارة.
            </p>
          </div>

          <div className="px-6 py-5 space-y-4">
            {/* حقل التخصص — يظهر فقط لو ناقص */}
            {missing.specialty && (
              <div>
                <label htmlFor="onboarding-specialty" className={labelBase}>التخصص الطبي</label>
                <select
                  id="onboarding-specialty"
                  value={specialty}
                  onChange={(e) => { setSpecialty(e.target.value); setFormError(''); }}
                  className={inputBase}
                  disabled={saving}
                >
                  <option value="">اختر تخصصك من القائمة</option>
                  {MEDICAL_SPECIALTIES.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
            )}

            {/* حقل الواتساب — يظهر فقط لو ناقص */}
            {missing.whatsapp && (
              <div>
                <label htmlFor="onboarding-whatsapp" className={labelBase}>رقم الواتساب</label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-3 flex items-center text-emerald-600">
                    <FaWhatsapp size={20} />
                  </span>
                  <input
                    id="onboarding-whatsapp"
                    type="tel"
                    inputMode="tel"
                    value={whatsapp}
                    onChange={(e) => { setWhatsapp(e.target.value); setFormError(''); }}
                    className={`${inputBase} pr-11`}
                    placeholder="01xxxxxxxxx"
                    disabled={saving}
                  />
                </div>
              </div>
            )}

            {/* حقل صورة الترخيص — يظهر فقط لو ناقصة */}
            {missing.license && (
              <div>
                <label className={labelBase}>صورة الكارنيه أو الترخيص</label>
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="معاينة الترخيص"
                      className="w-full h-44 object-cover rounded-lg border border-slate-300"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={saving}
                      className="absolute top-2 left-2 w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md hover:bg-rose-700 transition disabled:opacity-50"
                      aria-label="إزالة الصورة"
                    >
                      <FaXmark size={14} />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="onboarding-license"
                    className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-brand-500 hover:bg-slate-50 transition"
                  >
                    <FaCamera size={28} className="text-slate-400 mb-2" />
                    <span className="text-sm font-bold text-slate-700">اضغط لرفع الصورة</span>
                    <span className="text-xs text-slate-500 mt-1">الحد الأقصى 5 ميجابايت</span>
                    <input
                      id="onboarding-license"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={saving}
                    />
                  </label>
                )}
              </div>
            )}

            {/* رسالة الخطأ — تظهر فوق الزر لما الطبيب يحاول حفظ ناقص */}
            {formError && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                <p className="text-sm font-bold text-rose-700 leading-relaxed">{formError}</p>
              </div>
            )}

            {/* زر الحفظ — معطّل لو في ناقص أو لسه بيحفظ */}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !isFormValid}
              className="w-full h-12 rounded-lg bg-brand-600 text-white font-bold text-base shadow-md hover:bg-brand-700 transition disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {saving ? 'جاري الحفظ…' : 'حفظ ومتابعة'}
            </button>

            {/* مخرج آمن — لو الطبيب عايز يخرج بدون استكمال */}
            <button
              type="button"
              onClick={async () => {
                try { await signOut(); } catch { /* أفضل جهد */ }
                navigate('/login/doctor', { replace: true });
              }}
              disabled={saving}
              className="w-full text-sm font-semibold text-slate-600 hover:text-slate-900 transition disabled:opacity-50"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};
