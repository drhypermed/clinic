import React from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
// أيقونات Lucide للعناصر اللي مش براندات (تقييم/عنوان/اتصال...)
import {
  LuGraduationCap, // 🎓 → شهاده أكاديميه
  LuStar,          // ⭐ → تقييم
  LuMapPin,        // 📍 → العنوان
  LuStethoscope,   // 🩺 → خدمات طبّيه
  LuPhone,         // 📞 → اتصال هاتفي
  LuSearch,        // أيقونة البحث الفارغ (بديل الـinline svg القديمه)
} from 'react-icons/lu';
import type { DoctorAdProfile } from '../../../types';
import { LoadingText } from '../../ui/LoadingText';
import {
  formatLocation,
  formatPrice,
  getAvatarImage,
  getClinicServices,
  getDoctorRatingStats,
  getPrimaryBranch,
  normalizePhoneForTel,
  normalizePhoneForWhatsApp,
  sanitizeBioForDisplay,
} from './helpers';
// ستايلات السوشيال موحّده مع DoctorDetailsModal — نفس الألوان والشعارات.
import { getSocialStyle } from './socialStyles';

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
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-brand-50 to-brand-50 flex items-center justify-center">
          {/* أيقونة البحث لحالة "مفيش نتائج" */}
          <LuSearch className="w-10 h-10 text-brand-500" strokeWidth={2} />
        </div>
        <h3 className="text-lg md:text-xl font-black text-slate-800">لا توجد نتائج مطابقة</h3>
        <p className="mt-2 text-slate-500 font-bold">جرّب تغيير معايير البحث أو مسح الفلاتر</p>
        <button
          type="button"
          onClick={onResetFilters}
          className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 text-white font-black hover:shadow-lg transition-all"
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
        // البطاقة بتعرض بيانات الفرع الأساسي (الأول) — لو الطبيب عنده فروع
        // متعددة، الجمهور بيشوف التفاصيل الباقية لما يفتح صفحة تفاصيل الطبيب.
        const primaryBranch = getPrimaryBranch(ad);
        const callPhone = normalizePhoneForTel(primaryBranch.contactPhone);
        const whatsappPhone = normalizePhoneForWhatsApp(primaryBranch.whatsapp || primaryBranch.contactPhone);
        const ratingStats = getDoctorRatingStats(ad);
        const locationText = formatLocation(ad) || 'العنوان غير محدد';
        const cardSummary = sanitizeBioForDisplay(
          ad.featuredServicesSummary || ad.subSpecialties || ad.workplace || ad.extraInfo || ad.bio || ''
        );
        // الأسعار المعروضة في البطاقة = أسعار الفرع الأساسي
        const hasExamDiscount = primaryBranch.discountedExaminationPrice != null &&
          (primaryBranch.examinationPrice == null || primaryBranch.discountedExaminationPrice < primaryBranch.examinationPrice);
        const hasConsultDiscount = primaryBranch.discountedConsultationPrice != null &&
          (primaryBranch.consultationPrice == null || primaryBranch.discountedConsultationPrice < primaryBranch.consultationPrice);
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
            className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-[0_8px_24px_-12px_rgba(2,6,23,0.12)] hover:shadow-[0_20px_40px_-16px_rgba(37,99,235,0.25)] hover:border-brand-200 transition-all duration-300"
          >
            {anyDiscount && (
              <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-gradient-to-r from-danger-500 to-slate-500 text-white text-[10px] font-black shadow-lg">
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
                    // تحسينات الأداء (Priority 3 من خطّة التوفير):
                    // loading="lazy"   = الصوره متحمّلش إلا لمّا تقرّب من الـviewport
                    // decoding="async" = البراوزر بيفك الصوره في thread منفصل بدون ما يعلّق الصفحه
                    // width/height     = البراوزر بيحجز المكان قبل التحميل (منع Layout Shift)
                    // fetchPriority low = الصور ثانويه، العنوان والنص أهم = تحميل أسرع للمحتوى المهم
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    width={112}
                    height={128}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    {/* Placeholder لو مفيش صوره — أيقونه "دكتور" بدل السيلويت القديم */}
                    <LuStethoscope className="w-10 h-10" strokeWidth={1.5} />
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

                <p className="mt-1 inline-flex px-2 py-0.5 rounded-full bg-brand-50 text-brand-800 border border-brand-200 text-[11px] font-black">
                  {ad.doctorSpecialty || 'بدون تخصص'}
                </p>

                {ad.academicDegree && (
                  // الشهاده الأكاديميه — أيقونة قبّعة تخرّج بدل إيموجي 🎓
                  <p className="mt-1.5 flex items-center gap-1 text-[11px] font-black text-brand-700 truncate" title={ad.academicDegree}>
                    <LuGraduationCap className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                    <span className="truncate">{ad.academicDegree}</span>
                  </p>
                )}

                <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                  {ratingStats.count > 0 ? (
                    <button
                      type="button"
                      onClick={() => onOpenDoctorReviews(ad)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning-50 text-warning-800 border border-warning-200 text-[11px] font-black hover:bg-warning-100 transition-colors"
                    >
                      {/* نجمه ممتلئه للتقييم — بديل إيموجي ⭐ */}
                      <LuStar className="w-3 h-3 fill-warning-500 text-warning-500" strokeWidth={2} />
                      {ratingStats.average.toFixed(1)} ({ratingStats.count})
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-400">بدون تقييمات</span>
                  )}
                  {ad.yearsExperience != null && ad.yearsExperience > 0 && (
                    <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 text-brand-700 text-[11px] font-black px-2 py-0.5">
                      خبرة {ad.yearsExperience} سنة
                    </span>
                  )}
                </div>

                {/* العنوان — دبّوس خريطه بدل إيموجي 📍 */}
                <p
                  className="mt-1.5 flex items-center gap-1 text-[11px] sm:text-xs font-bold text-slate-600 line-clamp-1"
                  title={locationText}
                >
                  <LuMapPin className="w-3.5 h-3.5 shrink-0 text-slate-500" strokeWidth={2} />
                  <span className="truncate">{locationText}</span>
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
              <div className="rounded-lg bg-success-50 border border-success-100 px-2.5 py-1.5 text-success-800">
                <div className="text-[10px] font-bold text-success-600">الكشف</div>
                {hasExamDiscount ? (
                  <div className="flex items-baseline gap-1 flex-wrap">
                    <span className="font-black">{formatPrice(primaryBranch.discountedExaminationPrice ?? null)}</span>
                    {primaryBranch.examinationPrice != null && (
                      <span className="text-[10px] text-slate-400 line-through">{formatPrice(primaryBranch.examinationPrice)}</span>
                    )}
                  </div>
                ) : (
                  <div>{formatPrice(primaryBranch.examinationPrice ?? null)}</div>
                )}
              </div>
              <div className="rounded-lg bg-brand-50 border border-brand-100 px-2.5 py-1.5 text-brand-800">
                <div className="text-[10px] font-bold text-brand-600">الاستشارة</div>
                {hasConsultDiscount ? (
                  <div className="flex items-baseline gap-1 flex-wrap">
                    <span className="font-black">{formatPrice(primaryBranch.discountedConsultationPrice ?? null)}</span>
                    {primaryBranch.consultationPrice != null && (
                      <span className="text-[10px] text-slate-400 line-through">{formatPrice(primaryBranch.consultationPrice)}</span>
                    )}
                  </div>
                ) : (
                  <div>{formatPrice(primaryBranch.consultationPrice ?? null)}</div>
                )}
              </div>
            </div>

            {clinicServices.length > 0 && (
              <div className="px-3 sm:px-4 mt-2">
                {/* عدد الخدمات الطبّيه — سمّاعه بدل إيموجي 🩺 */}
                <div className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1.5 text-[11px] font-black text-slate-700 flex items-center gap-1.5">
                  <LuStethoscope className="w-3.5 h-3.5 shrink-0 text-brand-600" strokeWidth={2} />
                  <span>{clinicServices.length} خدمة{hasDiscountedService ? ' • يوجد خصومات' : ''}</span>
                </div>
              </div>
            )}

            {socialLinks.length > 0 && (
              // تصميم 2026:
              // - دايره ملوّنه بلون البراند الرسمي (Facebook أزرق، Instagram gradient، YouTube أحمر...)
              // - شعار مملوء أبيض فوق الخلفيّه الملوّنه = شكل واضح ومعروف
              // - shadow + lift effect لمّا الماوس يعدّي = إحساس 3D ناعم
              // - title بيبان لمّا المستخدم يحوّم (accessibility)
              <div className="px-3 sm:px-4 mt-2 flex flex-wrap gap-1.5">
                {socialLinks.slice(0, 5).map((social) => {
                  const { iconNode, bg, label } = getSocialStyle(social.platform);
                  return (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={label}
                      aria-label={label}
                      className={`w-10 h-10 rounded-full ${bg} text-white inline-flex items-center justify-center shadow-[0_2px_6px_-1px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_14px_-3px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 transition-all duration-200`}
                    >
                      {iconNode('w-5 h-5')}
                    </a>
                  );
                })}
              </div>
            )}

            {/* Actions */}
            <div className="px-3 sm:px-4 pt-3 pb-3 mt-3 border-t border-slate-100 bg-gradient-to-b from-transparent to-slate-50/50">
              {(callPhone || whatsappPhone) && (
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {/* زر الاتصال — أيقونة سمّاعه هاتف بدل إيموجي 📞 */}
                  <a
                    href={callPhone ? `tel:${callPhone}` : undefined}
                    className={`h-9 rounded-lg border font-black text-[11px] inline-flex items-center justify-center gap-1.5 transition-all ${
                      callPhone
                        ? 'border-brand-200 bg-brand-50 text-brand-800 hover:bg-brand-100'
                        : 'border-slate-200 bg-slate-50 text-slate-400 pointer-events-none'
                    }`}
                  >
                    <LuPhone className="w-3.5 h-3.5" strokeWidth={2.25} />
                    اتصال
                  </a>
                  {/* زر واتساب — الشعار الرسمي (أوضح من الإيموجي 💬 لأنه بيدلّ على واتساب بالتحديد) */}
                  <a
                    href={whatsappPhone ? `https://wa.me/${whatsappPhone}` : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`h-9 rounded-lg border font-black text-[11px] inline-flex items-center justify-center gap-1.5 transition-all ${
                      whatsappPhone
                        ? 'border-success-200 bg-success-50 text-success-800 hover:bg-success-100'
                        : 'border-slate-200 bg-slate-50 text-slate-400 pointer-events-none'
                    }`}
                  >
                    <FaWhatsapp className="w-4 h-4" />
                    واتساب
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
                  className="h-10 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 text-white font-black text-xs hover:shadow-lg hover:from-brand-700 hover:to-brand-800 transition-all"
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
                : 'bg-gradient-to-r from-brand-600 to-brand-700 text-white hover:shadow-xl hover:from-brand-700 hover:to-brand-800'
            }`}
          >
            {loadingMore ? <LoadingText>جاري التحميل</LoadingText> : 'عرض المزيد من الأطباء'}
          </button>
        </div>
      )}
    </section>
  );
};
