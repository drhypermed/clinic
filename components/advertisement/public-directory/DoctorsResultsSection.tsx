import React from 'react';
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaYoutube } from 'react-icons/fa6';
import { FaLink } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import type { DoctorAdProfile } from '../../../types';
import { LoadingText } from '../../ui/LoadingText';
import {
  formatLocation,
  formatPrice,
  getAvatarImage,
  getClinicServices,
  getDoctorRatingStats,
  normalizePhoneForTel,
  normalizePhoneForWhatsApp,
  sanitizeBioForDisplay,
} from './helpers';

interface DoctorsResultsSectionProps {
  filteredAds: DoctorAdProfile[];
  onResetFilters: () => void;
  onSelectDoctor: (doctorId: string) => void;
  onBookDoctor: (doctorId: string) => void;
  onOpenDoctorReviews: (doctor: DoctorAdProfile) => void;
  loadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  facebook: <FaFacebook className="w-3.5 h-3.5" />,
  instagram: <FaInstagram className="w-3.5 h-3.5" />,
  tiktok: <FaTiktok className="w-3.5 h-3.5" />,
  youtube: <FaYoutube className="w-3.5 h-3.5" />,
  x: <FaXTwitter className="w-3.5 h-3.5" />,
  twitter: <FaXTwitter className="w-3.5 h-3.5" />,
  linkedin: <FaLinkedin className="w-3.5 h-3.5" />,
};

const getSocialIcon = (platform?: string): React.ReactNode => {
  const key = (platform || '').toLowerCase();
  for (const [name, icon] of Object.entries(SOCIAL_ICONS)) {
    if (key.includes(name)) return icon;
  }
  return <FaLink className="w-3.5 h-3.5" />;
};

export const DoctorsResultsSection: React.FC<DoctorsResultsSectionProps> = ({
  filteredAds,
  onResetFilters,
  onSelectDoctor,
  onBookDoctor,
  onOpenDoctorReviews,
  loadMore,
  hasMore,
  loadingMore,
}) => {
  if (filteredAds.length === 0) {
    return (
      <section className="rounded-3xl border-2 border-dashed border-slate-200 bg-white/95 p-10 text-center shadow-[0_24px_60px_-48px_rgba(2,6,23,0.8)]">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center">
          <svg className="w-10 h-10 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg md:text-xl font-black text-slate-800">لا توجد نتائج مطابقة</h3>
        <p className="mt-2 text-slate-500 font-bold">جرّب تغيير معايير البحث أو مسح الفلاتر</p>
        <button
          type="button"
          onClick={onResetFilters}
          className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-black hover:shadow-lg transition-all"
        >
          عرض كل الأطباء
        </button>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-5">
      {filteredAds.map((ad) => {
        const avatarImage = getAvatarImage(ad);
        const clinicServices = getClinicServices(ad);
        const callPhone = normalizePhoneForTel(ad.contactPhone);
        const whatsappPhone = normalizePhoneForWhatsApp(ad.whatsapp || ad.contactPhone);
        const ratingStats = getDoctorRatingStats(ad);
        const locationText = formatLocation(ad) || 'العنوان غير محدد';
        const cardSummary = sanitizeBioForDisplay(
          ad.featuredServicesSummary || ad.subSpecialties || ad.workplace || ad.extraInfo || ad.bio || ''
        );
        const hasExamDiscount = ad.discountedExaminationPrice != null &&
          (ad.examinationPrice == null || ad.discountedExaminationPrice < ad.examinationPrice);
        const hasConsultDiscount = ad.discountedConsultationPrice != null &&
          (ad.consultationPrice == null || ad.discountedConsultationPrice < ad.consultationPrice);
        const hasDiscountedService = clinicServices.some(
          (s) => s.discountedPrice != null && (s.price == null || s.discountedPrice < s.price)
        );
        const anyDiscount = hasExamDiscount || hasConsultDiscount || hasDiscountedService;
        const socialLinks = (Array.isArray(ad.socialLinks) ? ad.socialLinks : [])
          .filter((item) => item?.platform && item?.url)
          .concat(
            ad.socialMediaUrl
              ? [{ id: 'legacy-social', platform: ad.socialMediaPlatform || 'Social', url: ad.socialMediaUrl }]
              : []
          )
          .filter((item, i, arr) => arr.findIndex((x) => x.url === item.url) === i);

        return (
          <article
            key={ad.doctorId}
            className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-[0_8px_24px_-12px_rgba(2,6,23,0.12)] hover:shadow-[0_20px_40px_-16px_rgba(13,148,136,0.25)] hover:border-teal-200 transition-all duration-300"
          >
            {anyDiscount && (
              <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-black shadow-lg">
                عرض خاص
              </div>
            )}

            <div className="flex gap-3 p-3 sm:p-4">
              {/* Avatar */}
              <div className="shrink-0 w-24 h-28 sm:w-28 sm:h-32 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 ring-2 ring-white shadow-sm">
                {avatarImage ? (
                  <img
                    src={avatarImage}
                    alt={`صورة ${ad.doctorName}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-black text-slate-900 text-base sm:text-lg leading-tight truncate">
                    {ad.doctorName}
                  </h3>
                </div>

                <p className="mt-1 inline-flex px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 text-[11px] font-black">
                  {ad.doctorSpecialty || 'بدون تخصص'}
                </p>

                {ad.academicDegree && (
                  <p className="mt-1.5 text-[11px] font-black text-indigo-700 truncate" title={ad.academicDegree}>
                    🎓 {ad.academicDegree}
                  </p>
                )}

                <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                  {ratingStats.count > 0 ? (
                    <button
                      type="button"
                      onClick={() => onOpenDoctorReviews(ad)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-black hover:bg-amber-100 transition-colors"
                    >
                      ⭐ {ratingStats.average.toFixed(1)} ({ratingStats.count})
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-400">بدون تقييمات</span>
                  )}
                  {ad.yearsExperience != null && ad.yearsExperience > 0 && (
                    <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 text-[11px] font-black px-2 py-0.5">
                      خبرة {ad.yearsExperience} سنة
                    </span>
                  )}
                </div>

                <p className="mt-1.5 text-[11px] sm:text-xs font-bold text-slate-600 line-clamp-1" title={locationText}>
                  📍 {locationText}
                </p>

                {cardSummary && (
                  <p
                    className="mt-1.5 text-[11px] sm:text-xs font-bold text-slate-500 leading-relaxed overflow-hidden"
                    style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                  >
                    {cardSummary}
                  </p>
                )}
              </div>
            </div>

            {/* Prices row */}
            <div className="px-3 sm:px-4 grid grid-cols-2 gap-2 text-[11px] font-black">
              <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 text-emerald-800">
                <div className="text-[10px] font-bold text-emerald-600">الكشف</div>
                {hasExamDiscount ? (
                  <div className="flex items-baseline gap-1 flex-wrap">
                    <span className="font-black">{formatPrice(ad.discountedExaminationPrice ?? null)}</span>
                    {ad.examinationPrice != null && (
                      <span className="text-[10px] text-slate-400 line-through">{formatPrice(ad.examinationPrice)}</span>
                    )}
                  </div>
                ) : (
                  <div>{formatPrice(ad.examinationPrice ?? null)}</div>
                )}
              </div>
              <div className="rounded-lg bg-sky-50 border border-sky-100 px-2.5 py-1.5 text-sky-800">
                <div className="text-[10px] font-bold text-sky-600">الاستشارة</div>
                {hasConsultDiscount ? (
                  <div className="flex items-baseline gap-1 flex-wrap">
                    <span className="font-black">{formatPrice(ad.discountedConsultationPrice ?? null)}</span>
                    {ad.consultationPrice != null && (
                      <span className="text-[10px] text-slate-400 line-through">{formatPrice(ad.consultationPrice)}</span>
                    )}
                  </div>
                ) : (
                  <div>{formatPrice(ad.consultationPrice ?? null)}</div>
                )}
              </div>
            </div>

            {clinicServices.length > 0 && (
              <div className="px-3 sm:px-4 mt-2">
                <div className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1.5 text-[11px] font-black text-slate-700">
                  🩺 {clinicServices.length} خدمة{hasDiscountedService ? ' • يوجد خصومات' : ''}
                </div>
              </div>
            )}

            {socialLinks.length > 0 && (
              <div className="px-3 sm:px-4 mt-2 flex flex-wrap gap-1.5">
                {socialLinks.slice(0, 5).map((social) => (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-7 px-2 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-800 font-black text-[10px] inline-flex items-center justify-center gap-1 hover:bg-indigo-100 transition-all"
                  >
                    {getSocialIcon(social.platform)}
                    <span>{social.platform || 'Social'}</span>
                  </a>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="px-3 sm:px-4 pt-3 pb-3 mt-3 border-t border-slate-100 bg-gradient-to-b from-transparent to-slate-50/50">
              {(callPhone || whatsappPhone) && (
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <a
                    href={callPhone ? `tel:${callPhone}` : undefined}
                    className={`h-9 rounded-lg border font-black text-[11px] inline-flex items-center justify-center gap-1 transition-all ${
                      callPhone
                        ? 'border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100'
                        : 'border-slate-200 bg-slate-50 text-slate-400 pointer-events-none'
                    }`}
                  >
                    📞 اتصال
                  </a>
                  <a
                    href={whatsappPhone ? `https://wa.me/${whatsappPhone}` : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`h-9 rounded-lg border font-black text-[11px] inline-flex items-center justify-center gap-1 transition-all ${
                      whatsappPhone
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        : 'border-slate-200 bg-slate-50 text-slate-400 pointer-events-none'
                    }`}
                  >
                    💬 واتساب
                  </a>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { if (ad.doctorId) onSelectDoctor(ad.doctorId); }}
                  className="h-10 rounded-xl border border-slate-300 bg-white text-slate-800 font-black text-xs hover:bg-slate-50 hover:border-slate-400 transition-all"
                >
                  الملف الكامل
                </button>
                <button
                  type="button"
                  onClick={() => onBookDoctor(ad.doctorId)}
                  className="h-10 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-black text-xs hover:shadow-lg hover:from-teal-700 hover:to-cyan-700 transition-all"
                >
                  احجز الآن
                </button>
              </div>
            </div>
          </article>
        );
      })}

      {hasMore && (
        <div className="col-span-1 xl:col-span-2 flex justify-center mt-4 mb-2">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className={`px-8 py-3 rounded-2xl font-black text-sm transition-all ${
              loadingMore
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:shadow-xl hover:from-teal-700 hover:to-cyan-700'
            }`}
          >
            {loadingMore ? <LoadingText>جاري التحميل</LoadingText> : 'عرض المزيد من الأطباء'}
          </button>
        </div>
      )}
    </section>
  );
};
