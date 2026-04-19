/**
 * نافذة المعاينة المباشرة (Live Preview Modal):
 * تحاكي تمامًا عرض الملف الشخصي للطبيب في "الدليل العام" (Public Directory).
 * تهدف لتقليل أخطاء الإدخال وضمان جودة عرض الإعلانات قبل نشرها للعامة.
 */
import React from 'react';

import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaYoutube } from 'react-icons/fa6';
import { FaLink } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import type { DoctorAdProfile } from '../../../types';
import {
  formatPrice,
  formatLocation,
  formatTimeWithPeriod as formatTime,
  sanitizeBioForDisplay,
  getClinicServices,
  getInitials,
} from '../public-directory/helpers';
import { sanitizeSocialUrl } from './securityUtils';

interface LivePreviewModalProps {
  showPreview: boolean;
  onClose: () => void;
  profileImage?: string;
  previewData: DoctorAdProfile;
  imageUrls: string[];
  normalizeScheduleRows: (rows: DoctorAdProfile['clinicSchedule'] | undefined | null) => { id: string; day: string; from: string; to: string; notes?: string }[];
}

const getSocialIcon = (platform?: string) => {
  const p = (platform || '').toLowerCase();
  if (p.includes('facebook')) return <FaFacebook className="w-4 h-4" />;
  if (p.includes('instagram')) return <FaInstagram className="w-4 h-4" />;
  if (p.includes('tiktok')) return <FaTiktok className="w-4 h-4" />;
  if (p.includes('youtube')) return <FaYoutube className="w-4 h-4" />;
  if (p === 'x' || p.includes('twitter')) return <FaXTwitter className="w-4 h-4" />;
  if (p.includes('linkedin')) return <FaLinkedin className="w-4 h-4" />;
  return <FaLink className="w-4 h-4" />;
};

export const LivePreviewModal: React.FC<LivePreviewModalProps> = ({
  showPreview,
  onClose,
  profileImage,
  previewData,
  imageUrls,
  normalizeScheduleRows,
}) => {
  if (!showPreview) return null;

  const safeSocialLinks = (
    previewData.socialLinks && previewData.socialLinks.length > 0
      ? previewData.socialLinks.filter((item) => item?.platform && item?.url)
      : previewData.socialMediaUrl
        ? [{ id: 'legacy-social', platform: previewData.socialMediaPlatform || 'Social', url: previewData.socialMediaUrl }]
        : []
  )
    .map((item) => ({
      ...item,
      url: sanitizeSocialUrl(item.url),
    }))
    .filter((item) => item.url);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-3 md:p-5 flex items-center justify-center overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[92vh] rounded-3xl overflow-hidden border-2 border-white/50 bg-gradient-to-b from-white to-slate-50 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="px-4 md:px-6 py-5 relative max-h-[92vh] overflow-y-auto">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-l from-cyan-100/70 via-teal-50/70 to-transparent" />

          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 left-3 w-10 h-10 rounded-full bg-white/95 border border-slate-200 text-slate-800 font-black text-xl shadow-sm hover:bg-slate-100 transition-colors z-10"
          >
            ×
          </button>

          <div className="relative z-10 mt-8 rounded-3xl border border-cyan-100 bg-white/90 p-4 md:p-5 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-24 h-24 md:w-28 md:h-28 aspect-square shrink-0 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-xl ring-2 ring-cyan-200">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={previewData.doctorName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white font-black text-2xl">
                      {getInitials(previewData.doctorName)}
                    </div>
                  )}
                </div>

                <div className="pb-1 min-w-0">
                  <h3 className="text-xl md:text-3xl font-black text-slate-900 leading-tight">{previewData.doctorName}</h3>
                  <p className="text-sm md:text-base font-black text-cyan-700 mt-1">{previewData.doctorSpecialty}</p>
                  <p className="text-xs md:text-sm font-bold text-slate-600 mt-1">{formatLocation(previewData) || 'العنوان غير محدد'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-200 p-4 bg-white shadow-sm">
              <p className="text-xs text-slate-500 font-black mb-1">العنوان</p>
              <p className="text-sm font-black text-slate-800">{formatLocation(previewData) || 'غير محدد'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 bg-white shadow-sm">
              <p className="text-xs text-slate-500 font-black mb-1">الكشف</p>
              {previewData.discountedExaminationPrice != null && previewData.examinationPrice != null && previewData.discountedExaminationPrice < previewData.examinationPrice ? (
                <div className="space-y-1">
                  <p className="text-sm font-black text-emerald-700">
                    {formatPrice(previewData.discountedExaminationPrice)}
                    <span className="text-slate-500 mr-1">بدلًا من</span>
                  </p>
                  <p className="text-xs font-bold text-slate-500 line-through">{formatPrice(previewData.examinationPrice)}</p>
                </div>
              ) : (
                <p className="text-sm font-black text-slate-800">{formatPrice(previewData.examinationPrice)}</p>
              )}
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 bg-white shadow-sm">
              <p className="text-xs text-slate-500 font-black mb-1">الاستشارة</p>
              {previewData.discountedConsultationPrice != null && previewData.consultationPrice != null && previewData.discountedConsultationPrice < previewData.consultationPrice ? (
                <div className="space-y-1">
                  <p className="text-sm font-black text-emerald-700">
                    {formatPrice(previewData.discountedConsultationPrice)}
                    <span className="text-slate-500 mr-1">بدلًا من</span>
                  </p>
                  <p className="text-xs font-bold text-slate-500 line-through">{formatPrice(previewData.consultationPrice)}</p>
                </div>
              ) : (
                <p className="text-sm font-black text-slate-800">{formatPrice(previewData.consultationPrice)}</p>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            {previewData.academicDegree && (
              <>
                <p className="text-xs text-slate-500 font-black mb-2">الدرجة العلمية</p>
                <p className="text-sm md:text-base font-bold text-indigo-700 leading-relaxed whitespace-pre-line break-words mb-3">
                  {previewData.academicDegree}
                </p>
              </>
            )}
            {previewData.subSpecialties && (
              <>
                <p className="text-xs text-slate-500 font-black mb-2">التخصصات الدقيقة</p>
                <p className="text-sm md:text-base font-bold text-slate-700 leading-relaxed whitespace-pre-line break-words mb-3">
                  {sanitizeBioForDisplay(previewData.subSpecialties)}
                </p>
              </>
            )}
            {previewData.featuredServicesSummary && (
              <>
                <p className="text-xs text-slate-500 font-black mb-2">الخدمات المميزة</p>
                <p className="text-sm md:text-base font-bold text-slate-700 leading-relaxed whitespace-pre-line break-words mb-3">
                  {sanitizeBioForDisplay(previewData.featuredServicesSummary)}
                </p>
              </>
            )}
            {previewData.workplace && (
              <>
                <p className="text-xs text-slate-500 font-black mb-2">محل العمل</p>
                <p className="text-sm md:text-base font-bold text-slate-700 leading-relaxed whitespace-pre-line break-words mb-3">
                  {sanitizeBioForDisplay(previewData.workplace)}
                </p>
              </>
            )}
            {previewData.extraInfo && (
              <>
                <p className="text-xs text-slate-500 font-black mb-2">معلومات إضافية</p>
                <p className="text-sm md:text-base font-bold text-slate-700 leading-relaxed whitespace-pre-line break-words">
                  {sanitizeBioForDisplay(previewData.extraInfo)}
                </p>
              </>
            )}
            {!previewData.subSpecialties && !previewData.featuredServicesSummary && !previewData.workplace && !previewData.extraInfo && (
              <p className="text-sm md:text-base font-bold text-slate-500">لا توجد معلومات إضافية مضافة حتى الآن.</p>
            )}
          </div>

          {(previewData.contactPhone || previewData.whatsapp || previewData.socialMediaUrl || (previewData.socialLinks && previewData.socialLinks.length > 0)) && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500 font-black mb-2">بيانات التواصل</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                  <p className="text-[11px] text-emerald-700 font-black mb-2">اتصال مباشر</p>
                  <div className="h-10 w-full rounded-xl border bg-white text-emerald-800 border-emerald-200 font-black text-sm inline-flex items-center justify-center gap-2">
                    📞 {previewData.contactPhone || 'غير متاح'}
                  </div>
                </div>
                <div className="rounded-xl bg-teal-50 border border-teal-100 p-3">
                  <p className="text-[11px] text-teal-700 font-black mb-2">واتساب</p>
                  <div className="h-10 w-full rounded-xl border bg-white text-teal-800 border-teal-200 font-black text-sm inline-flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#25D366"
                        d="M12.04 2c-5.52 0-10 4.48-10 10a9.93 9.93 0 0 0 1.46 5.2L2 22l4.93-1.5A10 10 0 1 0 12.04 2zm5.83 14.04c-.25.72-1.48 1.38-2.04 1.45-.5.06-1.13.09-1.82-.12-.42-.13-.97-.31-1.68-.63-2.94-1.28-4.86-4.3-5.01-4.5-.15-.2-1.19-1.59-1.19-3.02 0-1.42.74-2.12 1-2.41.25-.28.55-.35.74-.35h.54c.17 0 .4-.06.62.47.25.6.83 2.05.9 2.2.07.15.12.36.02.58-.1.21-.16.36-.31.56-.15.2-.32.44-.46.6-.15.15-.3.31-.13.6.17.28.77 1.27 1.66 2.05 1.14 1 2.1 1.31 2.39 1.45.29.13.46.12.63-.08.17-.2.73-.85.92-1.14.2-.28.39-.24.65-.15.27.09 1.7.8 1.99.94.3.15.5.22.57.35.07.13.07.75-.18 1.47z"
                      />
                    </svg>
                    {previewData.whatsapp || previewData.contactPhone || 'غير متاح'}
                  </div>
                </div>
              </div>
              {safeSocialLinks.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {safeSocialLinks.map((social) => (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-10 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-800 font-black text-sm inline-flex items-center justify-center gap-2 px-4 hover:bg-indigo-100 transition-colors"
                    >
                      <span>{getSocialIcon(social.platform)}</span>
                      <span>{social.platform || 'Social'}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-black mb-2">مواعيد العيادة</p>
            <div className="space-y-2">
              {normalizeScheduleRows(previewData.clinicSchedule).length === 0 ? (
                <p className="text-sm font-bold text-slate-500">لا توجد مواعيد مضافة.</p>
              ) : (
                normalizeScheduleRows(previewData.clinicSchedule).map((row) => (
                  <div key={row.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                    <span className="font-black text-slate-800 text-sm">{row.day}</span>
                    <span className="font-black text-slate-700 text-sm">
                      {formatTime(row.from)} - {formatTime(row.to)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {getClinicServices(previewData).length > 0 && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500 font-black mb-2">الخدمات المتاحة</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {getClinicServices(previewData).map((service, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                    <span className="font-black text-slate-800 text-sm">{service.name}</span>
                    {service.discountedPrice != null && service.price != null && service.discountedPrice < service.price ? (
                      <div className="text-left">
                        <span className="font-black text-emerald-700 text-sm block">{formatPrice(service.discountedPrice)}</span>
                        <span className="font-bold text-slate-500 text-xs line-through block">{formatPrice(service.price)}</span>
                      </div>
                    ) : service.price != null ? (
                      <span className="font-black text-cyan-700 text-sm">{formatPrice(service.price)}</span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}

          {imageUrls.length > 0 && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500 font-black mb-2">صور العيادة</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {imageUrls.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`صورة ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-xl"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

