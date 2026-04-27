/**
 * مكون تعديل الملف الشخصي للطبيب (Doctor Profile Modal):
 * مسؤول عن تعديل البيانات الأساسية للطبيب (الاسم، الواتساب، صورة البروفايل).
 *
 * بعد التقسيم:
 *   - `SubscriptionStatusCard.tsx`       : بطاقة حالة الاشتراك (Pro/مجاني + تجديد).
 *   - `ProfileImageCropperOverlay.tsx`   : نافذة قص صورة البروفايل.
 *   - `useDoctorProfileData.ts`          : hook تحميل بيانات الطبيب ودمج الوثائق.
 *   - `useProfileImageCropper.ts`        : hook إدارة قص الصورة.
 *   - `saveDoctorProfile.ts`             : منطق الحفظ (Firestore + Storage + مزامنة).
 */

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LoadingText } from '../ui/LoadingText';
import { formatUserDate, formatUserTime } from '../../utils/cairoTime';
import { getExpiryStatus } from '../../utils/expiryTime';
import { useTrustedNow } from '../../hooks/useTrustedNow';
import { usePremiumExpiryCheck } from '../../hooks/usePremiumExpiryCheck';
import { SubscriptionStatusCard } from './doctor-profile/SubscriptionStatusCard';
import { ProfileImageCropperOverlay } from './doctor-profile/ProfileImageCropperOverlay';
import { useDoctorProfileData } from './doctor-profile/useDoctorProfileData';
import { useProfileImageCropper } from './doctor-profile/useProfileImageCropper';
import { saveDoctorProfile } from './doctor-profile/saveDoctorProfile';
import { MEDICAL_SPECIALTIES } from '../auth/medicalSpecialties';
import { useImageUploadGate } from '../../hooks/useImageUploadGate';
import { ImageUploadUpgradeModal } from '../common/ImageUploadUpgradeModal';

interface DoctorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentName: string;
  currentSpecialty: string;
  currentWhatsApp?: string;
  currentEmail: string;
  currentProfileImage?: string;
  onNameUpdate: (name: string) => void;
  onSpecialtyUpdate?: (specialty: string) => void;
  onProfileImageUpdate: (base64: string) => void;
}

export const DoctorProfileModal: React.FC<DoctorProfileModalProps> = ({
  isOpen,
  onClose,
  userId,
  currentName,
  currentSpecialty,
  currentWhatsApp,
  currentEmail,
  currentProfileImage,
  onNameUpdate,
  onSpecialtyUpdate,
  onProfileImageUpdate,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // تحميل بيانات الطبيب + حالة الاشتراك (مستخرج في hook)
  const {
    isLoading,
    loadError,
    name,
    specialty,
    whatsapp,
    profileImage,
    premiumStartDate,
    premiumEndDate,
    accountType,
    specialtyEditedOnce,
    setName,
    setSpecialty,
    setWhatsapp,
    setProfileImage,
  } = useDoctorProfileData({
    isOpen,
    userId,
    currentName,
    currentSpecialty,
    currentProfileImage,
  });

  // ─── تعديل التخصص لمرة واحدة للحسابات القديمة ───
  // الحساب الجديد: التخصص مطلوب في signup → لا يدخل هذا الفرع (currentSpecialty موجود)
  // الحساب القديم بدون تخصص: يحصل على فرصة واحدة للتعديل من داخل الملف الشخصي
  // بعد أول حفظ تخصص → يُقفل الحقل للأبد عبر specialtyEditedOnce في Firestore
  const resolvedSpecialty = (specialty || '').trim() || (currentSpecialty || '').trim();
  const canEditSpecialty = !resolvedSpecialty && !specialtyEditedOnce;

  // حالة القص (مستخرجة في hook)
  const cropper = useProfileImageCropper({
    onCroppedReady: (base64) => setProfileImage(base64),
    onError: (msg) => setError(msg),
  });

  // ─ gate رفع الصور: Pro/ProMax مسموح، Free حسب إعدادات الأدمن
  const imageGate = useImageUploadGate();

  // فحص حالة اشتراك برو لعرض شارة التميز
  const { isPro } = usePremiumExpiryCheck(userId ? { uid: userId } : null);
  const { nowMs } = useTrustedNow();
  const premiumEndStatus = getExpiryStatus(premiumEndDate, nowMs);
  const isProExpired = premiumEndStatus.isExpired;
  // برو وبرو ماكس الاتنين يحسبوا Pro لعرض حالة الاشتراك
  const isProAccount = (accountType === 'premium' || accountType === 'pro_max' || isPro) && !isProExpired;

  // ─── مساعدات تنسيق تواريخ الاشتراك ──────────────────────────────────
  const formatSubscriptionDate = (dateValue: string) => {
    if (!dateValue) return 'غير متاح';
    const parsedDate = new Date(dateValue);
    if (!Number.isFinite(parsedDate.getTime())) return 'غير متاح';
    return formatUserDate(
      parsedDate,
      { year: 'numeric', month: 'long', day: 'numeric' },
      'ar-EG',
    );
  };

  const formatSubscriptionTime = (dateValue: string) => {
    if (!dateValue) return 'غير متاح';
    const parsedDate = new Date(dateValue);
    if (!Number.isFinite(parsedDate.getTime())) return 'غير متاح';
    return formatUserTime(parsedDate, { hour: '2-digit', minute: '2-digit' }, 'ar-EG');
  };

  // فتح واتساب الدعم لتجديد الاشتراك
  const handleContactRenewalWhatsApp = () => {
    const phoneNumber = '201092805293';
    const message = encodeURIComponent('مرحبًا، انتهى اشتراكي برو وأرغب في تجديد الاشتراك.');
    if (typeof window !== 'undefined') {
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
    }
  };

  // ─── دمج خطأ التحميل مع خطأ الحفظ لعرض رسالة واحدة ──────────────────
  useEffect(() => {
    if (loadError) setError(loadError);
  }, [loadError]);

  // ─── منع تمرير الصفحة الخلفية عند فتح النافذة المنبثقة ──────────────
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const previousPaddingInlineEnd = document.body.style.paddingInlineEnd;

    // تعويض عرض شريط التمرير حتى لا ينقفز المحتوى
    const scrollbarCompensation = Math.max(
      0,
      window.innerWidth - document.documentElement.clientWidth,
    );

    document.body.style.overflow = 'hidden';
    if (scrollbarCompensation > 0) {
      const computedPaddingRight =
        Number.parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;
      const compensatedPadding = `${computedPaddingRight + scrollbarCompensation}px`;
      document.body.style.paddingRight = compensatedPadding;
      document.body.style.paddingInlineEnd = compensatedPadding;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      document.body.style.paddingInlineEnd = previousPaddingInlineEnd;
    };
  }, [isOpen]);

  // التمرير للأعلى عند فتح النافذة لتجنب البدء من الأسفل
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  // استخدام props هنا للتغلب على تحذير "useWhatsapp فقط بدون قراءة currentWhatsApp"
  useEffect(() => {
    if (isOpen && currentWhatsApp && !whatsapp) {
      setWhatsapp(currentWhatsApp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleDeleteImage = () => setProfileImage('');

  // حفظ التعديلات النهائية (المنطق مستخرج في saveDoctorProfile)
  const handleSave = async () => {
    if (!name.trim()) {
      setError('يرجى إدخال الاسم');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      await saveDoctorProfile({
        userId,
        name,
        specialty,
        currentSpecialty,
        whatsapp,
        profileImage,
        currentProfileImage,
        // نطلب ختم specialtyEditedOnce فقط لو الحقل كان قابل للتعديل وتم إدخال تخصص فعلاً
        shouldMarkSpecialtyEdited: canEditSpecialty && Boolean((specialty || '').trim()),
        onNameUpdate,
        onSpecialtyUpdate,
        onProfileImageUpdate,
      });

      setSuccess('✅ تم حفظ التعديلات بنجاح');
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setTimeout(() => {
        onClose();
      }, 1600);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('فشل حفظ التعديلات. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        ref={scrollContainerRef}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto overscroll-contain"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header — أزرق متدرج فقط (blue-only premium) بدل brand→slate المخلوط */}
        <div className="sticky top-0 bg-gradient-to-l from-blue-700 via-blue-600 to-blue-500 text-white px-6 py-4 rounded-t-3xl flex items-center justify-between z-10 shadow-[0_2px_12px_-2px_rgba(8,112,184,0.4)]">
          <h2 className="text-2xl font-black">الملف الشخصي</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isLoading && (
            <div className="text-center py-8">
              {/* spinner أزرق فقط */}
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-slate-600 mt-2 font-bold">
                <LoadingText>جاري التحميل</LoadingText>
              </p>
            </div>
          )}

          {/* خطأ — أحمر دلالي (rose) — استثناء مقبول (الـerror لازم يبان واضح) */}
          {error && (
            <div className="bg-rose-50 border-r-4 border-rose-500 p-4 rounded-lg">
              <p className="text-rose-700 font-bold">{error}</p>
            </div>
          )}

          {/* نجاح — أخضر متدرج فقط (emerald) */}
          {success && (
            <div className="bg-emerald-50 border-r-4 border-emerald-500 p-4 rounded-lg">
              <p className="text-emerald-700 font-bold">{success}</p>
            </div>
          )}

          {!isLoading && (
            <>
              {/* Profile Image */}
              <div className="flex flex-col items-center">
                <div className="relative mb-3">
                  <div
                    className={`w-32 h-32 rounded-full p-[3px] shadow-[0_8px_24px_-6px_rgba(8,112,184,0.45)] ${
                      isProAccount
                        ? // برو: تاج ذهبي (gold gradient) — استثناء دلالي للـpremium
                          'bg-gradient-to-tr from-amber-300 via-amber-500 to-amber-600 shadow-[0_8px_24px_-6px_rgba(245,158,11,0.5)]'
                        : // عادي: حلقة أزرق متدرج فقط
                          'bg-gradient-to-tr from-blue-300 via-blue-500 to-blue-700'
                    }`}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-white">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-white" />
                      )}
                    </div>
                  </div>
                  <input
                    id="profile-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      // الـlabel.onClick gate لو الـbrowser تخطّاه (rare) — defense in depth
                      if (!imageGate.requestImageUpload()) { e.target.value = ''; return; }
                      cropper.handleImageChange(e);
                    }}
                  />
                </div>

                <div className="flex items-center gap-2 mb-2">
                  {/* زر "تعديل" — أزرق فاتح فقط */}
                  <label
                    htmlFor="profile-image-upload"
                    onClick={(e) => {
                      // gate قبل ما متصفح الملفات يفتح — لو الحساب free مش مفعّل،
                      // نمنع الـclick ونعرض مودال الترقية بدلاً من ذلك
                      if (!imageGate.requestImageUpload()) e.preventDefault();
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200/70 rounded-full text-sm font-bold hover:bg-blue-100 cursor-pointer transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    تعديل
                  </label>

                  {profileImage && (
                    /* زر "حذف" — أحمر متدرج (destructive action) */
                    <button
                      onClick={handleDeleteImage}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-l from-rose-600 to-rose-500 text-white border border-rose-700 hover:from-rose-700 hover:to-rose-600 shadow-[0_2px_8px_-2px_rgba(225,29,72,0.4)] hover:shadow-[0_4px_12px_-2px_rgba(225,29,72,0.5)] rounded-full text-sm font-bold transition-all"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      حذف
                    </button>
                  )}
                </div>

                <SubscriptionStatusCard
                  isProAccount={isProAccount}
                  isProExpired={isProExpired}
                  // نمرّر الفئة الفعلية عشان البطاقة تعرف إذا كانت برو ولا برو ماكس
                  tier={
                    accountType === 'pro_max' ? 'pro_max'
                    : accountType === 'premium' ? 'pro'
                    : 'free'
                  }
                  premiumStartDate={premiumStartDate}
                  premiumEndDate={premiumEndDate}
                  formatSubscriptionDate={formatSubscriptionDate}
                  formatSubscriptionTime={formatSubscriptionTime}
                  onContactRenewalWhatsApp={handleContactRenewalWhatsApp}
                />
              </div>

              {/* Name Field — focus ring أزرق */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  الاسم الكامل <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 font-semibold"
                  placeholder="د. عبدالرحمن جمال"
                />
              </div>

              {/* Specialty Field */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  التخصص الطبي <span className="text-rose-500">*</span>
                </label>
                {canEditSpecialty ? (
                  // حساب قديم بدون تخصص: dropdown قابل للتعديل مرة واحدة (تنبيه = amber دلالي)
                  <>
                    <select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full px-4 py-3 border border-amber-300 rounded-xl bg-amber-50 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                      dir="rtl"
                    >
                      <option value="">اختر التخصص</option>
                      {MEDICAL_SPECIALTIES.map((spec) => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                    <p className="text-xs text-amber-700 mt-1 font-bold">
                      ⚠️ فرصة واحدة فقط: حسابك القديم بدون تخصص — اختر تخصصك دلوقتي وبعد الحفظ لن يُمكن التعديل مرة أخرى.
                    </p>
                  </>
                ) : (
                  // التخصص محفوظ بالفعل → عرض فقط
                  <>
                    <div className="w-full px-4 py-3 border border-blue-200 rounded-xl bg-blue-50 text-slate-800 font-semibold">
                      {resolvedSpecialty || 'غير محدد'}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 font-semibold">
                      التخصص غير قابل للتعديل من الملف الشخصي
                    </p>
                  </>
                )}
              </div>

              {/* WhatsApp Field — focus ring أزرق */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  رقم الواتساب
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 font-semibold"
                  placeholder="01xxxxxxxxx"
                  dir="ltr"
                />
              </div>

              {/* Email Field (Read-only) — خلفية صلبة عشان النص يبان */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  البريد الإلكتروني (Google)
                </label>
                <div className="w-full px-4 py-3 border border-blue-200 rounded-xl bg-blue-50 text-slate-800 font-semibold">
                  {currentEmail}
                </div>
                <p className="text-xs text-slate-600 mt-1 font-semibold">
                  البريد الإلكتروني لا يمكن تعديله
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {/* زر "حفظ" — أخضر متدرج (CTA = action إيجابي) */}
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-l from-emerald-700 via-emerald-600 to-emerald-500 hover:from-emerald-800 hover:via-emerald-700 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-black shadow-[0_4px_14px_-2px_rgba(5,150,105,0.45)] hover:shadow-[0_6px_22px_-2px_rgba(5,150,105,0.55)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      جاري الحفظ
                    </span>
                  ) : (
                    'حفظ التعديلات'
                  )}
                </button>
                {/* زر "إلغاء" — أحمر متدرج (action سلبي/خروج) */}
                <button
                  onClick={onClose}
                  disabled={isSaving}
                  className="px-6 py-3 rounded-xl bg-gradient-to-l from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white font-black shadow-[0_4px_12px_-2px_rgba(225,29,72,0.4)] hover:shadow-[0_6px_18px_-2px_rgba(225,29,72,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  إلغاء
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cropper Overlay (مكوّن مستخرج) */}
      {cropper.isCropping && cropper.imageToCrop && (
        <ProfileImageCropperOverlay
          imageToCrop={cropper.imageToCrop}
          crop={cropper.crop}
          zoom={cropper.zoom}
          onCropChange={cropper.setCrop}
          onZoomChange={cropper.setZoom}
          onCropComplete={cropper.onCropComplete}
          onConfirm={cropper.handleConfirmCrop}
          onCancel={cropper.cancelCrop}
        />
      )}

      {/* مودال الترقية — يظهر للحساب المجاني لو الأدمن مغلق رفع الصور */}
      <ImageUploadUpgradeModal
        isOpen={imageGate.showUpgradeModal}
        onClose={imageGate.closeUpgradeModal}
        message={imageGate.upgradeMessage}
        whatsappUrl={imageGate.whatsappUrl}
      />
    </div>,
    document.body
  );
};
