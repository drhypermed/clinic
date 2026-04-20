/**
 * مكون تعديل الملف الشخصي للطبيب (Doctor Profile Modal):
 * مسؤول عن تعديل البيانات الأساسية للطبيب (الاسم، الواتساب، صورة البروفايل).
 *
 * بعد التقسيم:
 *   - `SubscriptionStatusCard.tsx`       : بطاقة حالة الاشتراك (Premium/مجاني + تجديد).
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
  // ملاحظة: setSpecialty غير مستعمل هنا (التخصص عرض فقط في هذه النافذة)
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
    setName,
    setWhatsapp,
    setProfileImage,
  } = useDoctorProfileData({
    isOpen,
    userId,
    currentName,
    currentSpecialty,
    currentProfileImage,
  });

  // حالة القص (مستخرجة في hook)
  const cropper = useProfileImageCropper({
    onCroppedReady: (base64) => setProfileImage(base64),
    onError: (msg) => setError(msg),
  });

  // فحص حالة الاشتراك المميز لعرض شارة التميز
  const { isPremium } = usePremiumExpiryCheck(userId ? { uid: userId } : null);
  const { nowMs } = useTrustedNow();
  const premiumEndStatus = getExpiryStatus(premiumEndDate, nowMs);
  const isPremiumExpired = premiumEndStatus.isExpired;
  const isPremiumAccount = (accountType === 'premium' || isPremium) && !isPremiumExpired;

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
    const phoneNumber = '201551020238';
    const message = encodeURIComponent('مرحبًا، انتهى اشتراكي المميز وأرغب في تجديد الاشتراك.');
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
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-t-3xl flex items-center justify-between z-10">
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
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-slate-600 mt-2 font-bold">
                <LoadingText>جاري التحميل</LoadingText>
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-lg">
              <p className="text-red-700 font-bold">{error}</p>
            </div>
          )}

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
                    className={`w-32 h-32 rounded-full p-[3px] shadow-lg ${
                      isPremiumAccount
                        ? 'bg-gradient-to-tr from-yellow-300 via-yellow-500 to-amber-600'
                        : 'bg-gradient-to-tr from-sky-300 via-sky-400 to-cyan-500'
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
                    onChange={cropper.handleImageChange}
                  />
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <label
                    htmlFor="profile-image-upload"
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-bold hover:bg-blue-100 cursor-pointer transition-colors"
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
                    <button
                      onClick={handleDeleteImage}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-bold hover:bg-red-100 transition-colors"
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
                  isPremiumAccount={isPremiumAccount}
                  isPremiumExpired={isPremiumExpired}
                  premiumStartDate={premiumStartDate}
                  premiumEndDate={premiumEndDate}
                  formatSubscriptionDate={formatSubscriptionDate}
                  formatSubscriptionTime={formatSubscriptionTime}
                  onContactRenewalWhatsApp={handleContactRenewalWhatsApp}
                />
              </div>

              {/* Name Field */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  الاسم الكامل <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  placeholder="د. عبدالرحمن جمال"
                />
              </div>

              {/* Specialty Field */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  التخصص الطبي <span className="text-red-500">*</span>
                </label>
                <div className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-600 font-semibold">
                  {specialty || currentSpecialty || 'غير محدد'}
                </div>
                <p className="text-xs text-slate-500 mt-1 font-semibold">
                  التخصص غير قابل للتعديل من الملف الشخصي
                </p>
              </div>

              {/* WhatsApp Field */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  رقم الواتساب
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  placeholder="01xxxxxxxxx"
                  dir="ltr"
                />
              </div>

              {/* Email Field (Read-only) */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  البريد الإلكتروني (Google)
                </label>
                <div className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 font-semibold">
                  {currentEmail}
                </div>
                <p className="text-xs text-slate-500 mt-1 font-semibold">
                  البريد الإلكتروني لا يمكن تعديله
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-black hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                <button
                  onClick={onClose}
                  disabled={isSaving}
                  className="px-6 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-black hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>,
    document.body
  );
};
