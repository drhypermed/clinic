import React, { useEffect, useMemo, useState } from 'react';
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaWhatsapp, FaYoutube, FaXTwitter } from 'react-icons/fa6';
import { FaLink } from 'react-icons/fa';
import type { DoctorAdProfile, DoctorClinicScheduleRow } from '../../../types';
import { useCopyFeedback } from '../../../hooks/useCopyFeedback';
import {
  formatLocation,
  formatPrice,
  formatTimeWithPeriod,
  getAvatarImage,
  getClinicServices,
  getInitials,
  normalizePhoneForTel,
  normalizePhoneForWhatsApp,
  sanitizeBioForDisplay,
} from './helpers';

interface DoctorDetailsModalProps {
  selectedDoctor: DoctorAdProfile | null;
  selectedDoctorFilledSchedule: DoctorClinicScheduleRow[];
  selectedDoctorRatingStats: { count: number; average: number };
  onClose: () => void;
  onBookDoctor: (doctorId: string) => void;
  onPreviewAvatar: (url: string) => void;
  onPreviewGalleryImage: (url: string) => void;
  onOpenDoctorReviews: (doctor: DoctorAdProfile) => void;
}

const getSocialIcon = (platform?: string) => {
  const p = (platform || '').toLowerCase();
  if (p.includes('facebook')) return <FaFacebook className="w-3.5 h-3.5" />;
  if (p.includes('instagram')) return <FaInstagram className="w-3.5 h-3.5" />;
  if (p.includes('tiktok')) return <FaTiktok className="w-3.5 h-3.5" />;
  if (p.includes('youtube')) return <FaYoutube className="w-3.5 h-3.5" />;
  if (p === 'x' || p.includes('twitter')) return <FaXTwitter className="w-3.5 h-3.5" />;
  if (p.includes('linkedin')) return <FaLinkedin className="w-3.5 h-3.5" />;
  return <FaLink className="w-3.5 h-3.5" />;
};

interface BioItem { label: string; value: string; accent: string; }

export const DoctorDetailsModal: React.FC<DoctorDetailsModalProps> = ({
  selectedDoctor,
  selectedDoctorFilledSchedule,
  selectedDoctorRatingStats,
  onClose,
  onBookDoctor,
  onPreviewAvatar,
  onPreviewGalleryImage,
  onOpenDoctorReviews,
}) => {
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number | null>(null);
  const { copied: linkCopied, copy: copyShareLink } = useCopyFeedback();

  const galleryImages = useMemo(
    () => (Array.isArray(selectedDoctor?.imageUrls) ? selectedDoctor.imageUrls.filter(Boolean) : []),
    [selectedDoctor?.imageUrls]
  );

  const socialLinks = (Array.isArray(selectedDoctor?.socialLinks) ? selectedDoctor?.socialLinks : [])
    .filter((item) => item?.platform && item?.url)
    .concat(selectedDoctor?.socialMediaUrl ? [{ id: 'legacy-social', platform: selectedDoctor.socialMediaPlatform || 'Social', url: selectedDoctor.socialMediaUrl }] : [])
    .filter((item, index, arr) => arr.findIndex((x) => x.url === item.url) === index);

  const activeGalleryUrl = activeGalleryIndex != null ? galleryImages[activeGalleryIndex] : null;

  const goNextGalleryImage = () => {
    if (galleryImages.length === 0) return;
    setActiveGalleryIndex((prev) => ((prev ?? 0) + 1) % galleryImages.length);
  };
  const goPrevGalleryImage = () => {
    if (galleryImages.length === 0) return;
    setActiveGalleryIndex((prev) => ((prev ?? 0) - 1 + galleryImages.length) % galleryImages.length);
  };

  useEffect(() => {
    if (!activeGalleryUrl) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') { event.preventDefault(); goNextGalleryImage(); }
      else if (event.key === 'ArrowLeft') { event.preventDefault(); goPrevGalleryImage(); }
      else if (event.key === 'Escape') { event.preventDefault(); setActiveGalleryIndex(null); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeGalleryUrl, galleryImages.length]);

  if (!selectedDoctor) return null;

  const avatarImage = getAvatarImage(selectedDoctor);
  const locationText = formatLocation(selectedDoctor) || 'العنوان غير محدد';
  const callPhone = normalizePhoneForTel(selectedDoctor.contactPhone);
  const whatsappPhone = normalizePhoneForWhatsApp(selectedDoctor.whatsapp || selectedDoctor.contactPhone);
  const clinicServices = getClinicServices(selectedDoctor);
  const hasExamDiscount = selectedDoctor.discountedExaminationPrice != null && selectedDoctor.examinationPrice != null && selectedDoctor.discountedExaminationPrice < selectedDoctor.examinationPrice;
  const hasConsultDiscount = selectedDoctor.discountedConsultationPrice != null && selectedDoctor.consultationPrice != null && selectedDoctor.discountedConsultationPrice < selectedDoctor.consultationPrice;

  const bioItems: BioItem[] = [];
  if (selectedDoctor.academicDegree) bioItems.push({ label: 'الدرجة العلمية', value: sanitizeBioForDisplay(selectedDoctor.academicDegree), accent: 'indigo' });
  if (selectedDoctor.subSpecialties) bioItems.push({ label: 'التخصصات الدقيقة', value: sanitizeBioForDisplay(selectedDoctor.subSpecialties), accent: 'cyan' });
  if (selectedDoctor.featuredServicesSummary) bioItems.push({ label: 'الخدمات المميزة', value: sanitizeBioForDisplay(selectedDoctor.featuredServicesSummary), accent: 'emerald' });
  if (selectedDoctor.workplace) bioItems.push({ label: 'محل العمل', value: sanitizeBioForDisplay(selectedDoctor.workplace), accent: 'sky' });
  if (selectedDoctor.extraInfo) bioItems.push({ label: 'معلومات إضافية', value: sanitizeBioForDisplay(selectedDoctor.extraInfo), accent: 'amber' });
  if (bioItems.length === 0 && selectedDoctor.bio) bioItems.push({ label: 'نبذة', value: sanitizeBioForDisplay(selectedDoctor.bio), accent: 'slate' });

  const accentMap: Record<string, string> = {
    indigo: 'border-indigo-200 bg-indigo-50/60 text-indigo-900',
    cyan: 'border-cyan-200 bg-cyan-50/60 text-cyan-900',
    emerald: 'border-emerald-200 bg-emerald-50/60 text-emerald-900',
    sky: 'border-sky-200 bg-sky-50/60 text-sky-900',
    amber: 'border-amber-200 bg-amber-50/60 text-amber-900',
    slate: 'border-slate-200 bg-slate-50/60 text-slate-900',
  };

  const handleShare = () => {
    // الـ hook يتحقّق داخلياً من توفر navigator.clipboard ويبتلع الخطأ بصمت.
    if (typeof window === 'undefined') return;
    copyShareLink(window.location.href);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-[2px] flex items-center justify-center md:p-5"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full md:h-auto md:max-w-5xl md:max-h-[92vh] bg-white md:rounded-[28px] overflow-hidden shadow-[0_40px_120px_-45px_rgba(2,6,23,0.95)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Sticky Header */}
        <div className="relative shrink-0 border-b border-slate-200 bg-gradient-to-l from-cyan-50 via-teal-50/80 to-white">
          <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-cyan-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -top-10 -left-10 w-40 h-40 rounded-full bg-amber-200/30 blur-3xl" />

          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 left-3 z-20 w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-700 font-black shadow hover:bg-slate-50 transition-colors"
            title="إغلاق"
          >
            ✕
          </button>

          <div className="relative px-4 md:px-6 py-4 md:py-5 flex items-center gap-3 md:gap-4">
            <button
              type="button"
              onClick={() => { if (avatarImage) onPreviewAvatar(avatarImage); }}
              className="shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl border-4 border-white bg-slate-100 overflow-hidden shadow-lg ring-2 ring-cyan-200"
              title="عرض الصورة بالحجم الكامل"
            >
              {avatarImage ? (
                <img src={avatarImage} alt={selectedDoctor.doctorName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white font-black text-xl">
                  {getInitials(selectedDoctor.doctorName)}
                </div>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg md:text-2xl font-black text-slate-900 leading-tight truncate">{selectedDoctor.doctorName}</h3>
              <p className="text-xs md:text-sm font-black text-teal-700 mt-0.5 truncate">{selectedDoctor.doctorSpecialty || 'بدون تخصص'}</p>
              <p className="text-[11px] md:text-xs font-bold text-slate-600 mt-0.5 truncate">📍 {locationText}</p>

              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {selectedDoctorRatingStats.count > 0 ? (
                  <button
                    type="button"
                    onClick={() => onOpenDoctorReviews(selectedDoctor)}
                    className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-black text-amber-800 hover:bg-amber-100 transition-colors"
                  >
                    ⭐ {selectedDoctorRatingStats.average.toFixed(1)} ({selectedDoctorRatingStats.count})
                  </button>
                ) : (
                  <span className="text-[11px] font-bold text-slate-400">بدون تقييمات</span>
                )}
                {selectedDoctor.yearsExperience != null && selectedDoctor.yearsExperience > 0 && (
                  <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 text-[11px] font-black px-2 py-0.5">
                    خبرة {selectedDoctor.yearsExperience} سنة
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="relative px-4 md:px-6 pb-4 flex gap-2">
            <button
              type="button"
              onClick={() => onBookDoctor(selectedDoctor.doctorId)}
              className="flex-1 h-11 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-black text-sm hover:shadow-lg hover:from-teal-700 hover:to-cyan-700 transition-all"
            >
              احجز موعد الآن
            </button>
            {callPhone && (
              <a
                href={`tel:${callPhone}`}
                className="h-11 px-3 rounded-xl border border-sky-200 bg-sky-50 text-sky-800 font-black text-sm inline-flex items-center gap-1.5 hover:bg-sky-100 transition-colors"
              >
                📞 اتصال
              </a>
            )}
            {whatsappPhone && (
              <a
                href={`https://wa.me/${whatsappPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 px-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 font-black text-sm inline-flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
              >
                <FaWhatsapp className="w-4 h-4" /> واتساب
              </a>
            )}
            <button
              type="button"
              onClick={handleShare}
              className="h-11 px-3 rounded-xl border border-teal-200 bg-teal-50 text-teal-700 font-black text-sm hover:bg-teal-100 transition-colors"
              title="نسخ الرابط"
            >
              {linkCopied ? '✓' : '↗'}
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4 bg-slate-50/40">
          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-white p-3 md:p-4 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-emerald-400 to-teal-400" />
              <p className="text-[10px] md:text-xs text-emerald-600 font-black">الكشف</p>
              {hasExamDiscount ? (
                <>
                  <p className="text-base md:text-lg font-black text-emerald-700 mt-0.5">{formatPrice(selectedDoctor.discountedExaminationPrice)}</p>
                  <p className="text-[10px] md:text-xs font-bold text-slate-500 line-through">{formatPrice(selectedDoctor.examinationPrice)}</p>
                </>
              ) : (
                <p className="text-base md:text-lg font-black text-slate-800 mt-0.5">{formatPrice(selectedDoctor.examinationPrice)}</p>
              )}
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-sky-200 bg-white p-3 md:p-4 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-sky-400 to-cyan-400" />
              <p className="text-[10px] md:text-xs text-sky-600 font-black">الاستشارة</p>
              {hasConsultDiscount ? (
                <>
                  <p className="text-base md:text-lg font-black text-sky-700 mt-0.5">{formatPrice(selectedDoctor.discountedConsultationPrice)}</p>
                  <p className="text-[10px] md:text-xs font-bold text-slate-500 line-through">{formatPrice(selectedDoctor.consultationPrice)}</p>
                </>
              ) : (
                <p className="text-base md:text-lg font-black text-slate-800 mt-0.5">{formatPrice(selectedDoctor.consultationPrice)}</p>
              )}
            </div>
          </div>

          {/* Bio Sections */}
          {bioItems.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-3 md:p-4 shadow-sm space-y-2.5">
              {bioItems.map((item) => (
                <div key={item.label} className={`rounded-xl border px-3 py-2.5 ${accentMap[item.accent]}`}>
                  <p className="text-[10px] font-black opacity-70 mb-1">{item.label}</p>
                  <p className="text-xs md:text-sm font-bold leading-relaxed whitespace-pre-line break-words">{item.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Schedule + Services grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Schedule */}
            <div className="rounded-2xl border border-slate-200 bg-white p-3 md:p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-black text-slate-700">🗓️ مواعيد العيادة</p>
                <span className="text-[10px] font-black text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5">
                  {selectedDoctorFilledSchedule.length > 0 ? `${selectedDoctorFilledSchedule.length} يوم` : '—'}
                </span>
              </div>
              {selectedDoctorFilledSchedule.length === 0 ? (
                <p className="text-xs font-bold text-slate-400 py-2">لا توجد مواعيد مضافة</p>
              ) : (
                <div className="space-y-1.5">
                  {selectedDoctorFilledSchedule.map((row) => (
                    <div key={row.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5">
                      <span className="font-black text-slate-800 text-[11px] md:text-xs">{row.day}</span>
                      <span className="font-black text-slate-600 text-[11px] md:text-xs">
                        {formatTimeWithPeriod(row.from)} - {formatTimeWithPeriod(row.to)}
                        {row.notes ? ` (${row.notes})` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Services */}
            <div className="rounded-2xl border border-slate-200 bg-white p-3 md:p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-black text-slate-700">🩺 الخدمات والأسعار</p>
                <span className="text-[10px] font-black text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-full px-2 py-0.5">
                  {clinicServices.length > 0 ? `${clinicServices.length} خدمة` : '—'}
                </span>
              </div>
              {clinicServices.length === 0 ? (
                <p className="text-xs font-bold text-slate-400 py-2">لا توجد خدمات مضافة</p>
              ) : (
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {clinicServices.map((service) => {
                    const discounted = service.discountedPrice != null && service.price != null && service.discountedPrice < service.price;
                    return (
                      <div key={service.id} className="flex items-center justify-between gap-2 rounded-lg border border-cyan-100 bg-cyan-50/60 px-2.5 py-1.5">
                        <span className="text-[11px] md:text-xs font-black text-cyan-900 truncate">{service.name}</span>
                        {discounted ? (
                          <div className="text-left shrink-0">
                            <span className="text-[11px] md:text-xs font-black text-emerald-700">{service.discountedPrice} ج</span>
                            <span className="text-[10px] font-bold text-slate-400 line-through block leading-none">{service.price} ج</span>
                          </div>
                        ) : (
                          <span className="text-[11px] md:text-xs font-black text-cyan-700 shrink-0">
                            {service.price == null ? '—' : `${service.price} ج`}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-3 md:p-4 shadow-sm">
              <p className="text-xs font-black text-slate-700 mb-2">🔗 روابط التواصل الاجتماعي</p>
              <div className="flex flex-wrap gap-1.5">
                {socialLinks.map((social) => (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 px-2.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-800 font-black text-[11px] inline-flex items-center gap-1.5 hover:bg-indigo-100 transition-colors"
                  >
                    {getSocialIcon(social.platform)}
                    <span>{social.platform || 'Social'}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Gallery */}
          {galleryImages.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-3 md:p-4 shadow-sm">
              <p className="text-xs font-black text-slate-700 mb-2">📸 صور إضافية ({galleryImages.length})</p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {galleryImages.map((src, idx) => (
                  <button
                    key={`${src}-${idx}`}
                    type="button"
                    onClick={() => {
                      onPreviewGalleryImage(src);
                      setActiveGalleryIndex(idx);
                    }}
                    className="relative aspect-square rounded-xl border border-slate-200 overflow-hidden bg-slate-100 hover:ring-2 hover:ring-teal-400 transition-all"
                    title="عرض الصورة"
                  >
                    <img src={src} alt={`${selectedDoctor.doctorName}-${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gallery Lightbox */}
      {activeGalleryUrl && (
        <div
          className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-sm p-3 md:p-6 flex items-center justify-center"
          onClick={() => setActiveGalleryIndex(null)}
        >
          <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setActiveGalleryIndex(null)}
              className="absolute top-3 left-3 z-10 w-10 h-10 rounded-full bg-white/95 border border-slate-200 text-slate-800 font-black text-xl shadow"
            >
              ✕
            </button>
            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrevGalleryImage}
                  className="absolute top-1/2 -translate-y-1/2 right-3 z-10 w-11 h-11 rounded-full bg-white/90 border border-slate-200 text-slate-800 font-black text-2xl shadow"
                  title="السابق"
                >
                  ›
                </button>
                <button
                  type="button"
                  onClick={goNextGalleryImage}
                  className="absolute top-1/2 -translate-y-1/2 left-3 z-10 w-11 h-11 rounded-full bg-white/90 border border-slate-200 text-slate-800 font-black text-2xl shadow"
                  title="التالي"
                >
                  ‹
                </button>
              </>
            )}
            <div className="rounded-3xl border border-white/20 bg-black/40 p-3 md:p-4">
              <img
                src={activeGalleryUrl}
                alt={`صورة إضافية ${activeGalleryIndex != null ? activeGalleryIndex + 1 : 1}`}
                className="w-full max-h-[78vh] object-contain rounded-2xl bg-slate-950"
              />
              <div className="mt-3 text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/90 text-slate-900 text-sm font-black">
                  {activeGalleryIndex != null ? activeGalleryIndex + 1 : 1} / {galleryImages.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
