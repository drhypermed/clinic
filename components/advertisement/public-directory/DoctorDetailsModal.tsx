import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaWhatsapp } from 'react-icons/fa6';
import type { DoctorAdProfile, DoctorClinicScheduleRow } from '../../../types';
import { useCopyFeedback } from '../../../hooks/useCopyFeedback';
import {
  getAdBranches,
  getAvatarImage,
  getInitials,
  normalizePhoneForTel,
  normalizePhoneForWhatsApp,
  sanitizeBioForDisplay,
} from './helpers';
import { BranchPublicView, BranchTabs } from './BranchPublicView';
// ستايلات السوشيال المشتركه = نفس الألوان والأيقونات اللي بتظهر في كرت الطبيب،
// عشان الجمهور يشوف الفيسبوك أزرق والإنستا gradient واليوتيوب أحمر زي الواقع.
import { getSocialStyle } from './socialStyles';

interface DoctorDetailsModalProps {
  selectedDoctor: DoctorAdProfile | null;
  selectedDoctorFilledSchedule: DoctorClinicScheduleRow[];
  selectedDoctorRatingStats: { count: number; average: number };
  onClose: () => void;
  // ملاحظة: حذفنا prop onBookDoctor — زر "احجز موعد" اتشال من الصفحة التعريفيّه
  // بناءً على طلب المالك. الحجز بقى يبدأ بس من زر "احجز الآن" الموجود في كرت
  // النتائج (DoctorsResultsSection).
  onPreviewAvatar: (url: string) => void;
  onPreviewGalleryImage: (url: string) => void;
  onOpenDoctorReviews: (doctor: DoctorAdProfile) => void;
}

interface BioItem { label: string; value: string; accent: string; }

export const DoctorDetailsModal: React.FC<DoctorDetailsModalProps> = ({
  selectedDoctor,
  selectedDoctorFilledSchedule,
  selectedDoctorRatingStats,
  onClose,
  onPreviewAvatar,
  onPreviewGalleryImage,
  onOpenDoctorReviews,
}) => {
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number | null>(null);
  const { copied: linkCopied, copy: copyShareLink } = useCopyFeedback();

  // فروع الطبيب + تبويب نشط (بيحدد الفرع اللي الجمهور بيشوف بياناته)
  const branches = useMemo(
    () => (selectedDoctor ? getAdBranches(selectedDoctor) : []),
    [selectedDoctor]
  );
  const [activeBranchId, setActiveBranchId] = useState<string>('');
  React.useEffect(() => {
    // كل ما الطبيب المختار يتغير، نرجع للفرع الأول
    setActiveBranchId(branches[0]?.id || '');
  }, [branches]);
  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0];

  // معرض الصور: صور الفرع النشط فقط
  const galleryImages = useMemo(
    () => (activeBranch ? activeBranch.imageUrls.filter(Boolean) : []),
    [activeBranch]
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
  // العنوان وأرقام التواصل بتاعة الفرع النشط (مش الحقول القديمة)
  const locationText = activeBranch
    ? [activeBranch.governorate, activeBranch.city, activeBranch.addressDetails].filter(Boolean).join(' - ') || 'العنوان غير محدد'
    : 'العنوان غير محدد';
  const callPhone = normalizePhoneForTel(activeBranch?.contactPhone);
  const whatsappPhone = normalizePhoneForWhatsApp(activeBranch?.whatsapp || activeBranch?.contactPhone);

  const bioItems: BioItem[] = [];
  if (selectedDoctor.academicDegree) bioItems.push({ label: 'الدرجة العلمية', value: sanitizeBioForDisplay(selectedDoctor.academicDegree), accent: 'indigo' });
  if (selectedDoctor.subSpecialties) bioItems.push({ label: 'التخصصات الدقيقة', value: sanitizeBioForDisplay(selectedDoctor.subSpecialties), accent: 'cyan' });
  if (selectedDoctor.featuredServicesSummary) bioItems.push({ label: 'الخدمات المميزة', value: sanitizeBioForDisplay(selectedDoctor.featuredServicesSummary), accent: 'emerald' });
  if (selectedDoctor.workplace) bioItems.push({ label: 'محل العمل', value: sanitizeBioForDisplay(selectedDoctor.workplace), accent: 'sky' });
  if (selectedDoctor.extraInfo) bioItems.push({ label: 'معلومات إضافية', value: sanitizeBioForDisplay(selectedDoctor.extraInfo), accent: 'amber' });
  if (bioItems.length === 0 && selectedDoctor.bio) bioItems.push({ label: 'نبذة', value: sanitizeBioForDisplay(selectedDoctor.bio), accent: 'slate' });

  const accentMap: Record<string, string> = {
    indigo: 'border-brand-200 bg-brand-50/60 text-brand-900',
    cyan: 'border-brand-200 bg-brand-50/60 text-brand-900',
    emerald: 'border-success-200 bg-success-50/60 text-success-900',
    sky: 'border-brand-200 bg-brand-50/60 text-brand-900',
    amber: 'border-warning-200 bg-warning-50/60 text-warning-900',
    slate: 'border-slate-200 bg-slate-50/60 text-slate-900',
  };

  const handleShare = () => {
    // الـ hook يتحقّق داخلياً من توفر navigator.clipboard ويبتلع الخطأ بصمت.
    if (typeof window === 'undefined') return;
    copyShareLink(window.location.href);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9995] bg-slate-950/70 backdrop-blur-[2px] flex items-start md:items-center justify-center md:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full md:h-auto md:max-w-5xl md:max-h-[92vh] bg-white md:rounded-[28px] overflow-hidden shadow-[0_40px_120px_-45px_rgba(2,6,23,0.95)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Sticky Header — اتوحّدت ألوانه بـblue/indigo مع باقي واجهة الجمهور */}
        <div className="relative shrink-0 border-b border-slate-200 bg-gradient-to-l from-brand-50 via-brand-50/80 to-white">
          <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-brand-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -top-10 -left-10 w-40 h-40 rounded-full bg-brand-200/30 blur-3xl" />

          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 left-3 z-20 w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-700 font-black shadow hover:bg-slate-50 transition-colors"
            title="إغلاق"
          >
            ✕
          </button>

          <div className="relative px-4 md:px-6 py-4 md:py-5 flex items-center gap-3 md:gap-4">
            {/* صورة الطبيب — دايره خالصه بدون إطار مربع.
                المستخدم طلب يبقى الشكل دايره صريحه (rounded-full) من غير أي
                مربع شفاف أو حواف مستديره مزدوجه ورا الصوره. */}
            <button
              type="button"
              onClick={() => { if (avatarImage) onPreviewAvatar(avatarImage); }}
              className="shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-100 overflow-hidden shadow-lg ring-2 ring-brand-200"
              title="عرض الصورة بالحجم الكامل"
            >
              {avatarImage ? (
                <img
                  src={avatarImage}
                  alt={selectedDoctor.doctorName}
                  className="w-full h-full object-cover rounded-full"
                  decoding="async"
                  width={96}
                  height={96}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center rounded-full bg-slate-800 text-white font-black text-xl">
                  {getInitials(selectedDoctor.doctorName)}
                </div>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg md:text-2xl font-black text-slate-900 leading-tight truncate">{selectedDoctor.doctorName}</h3>
              <p className="text-xs md:text-sm font-black text-brand-700 mt-0.5 truncate">{selectedDoctor.doctorSpecialty || 'بدون تخصص'}</p>
              <p className="text-[11px] md:text-xs font-bold text-slate-600 mt-0.5 truncate">📍 {locationText}</p>

              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {selectedDoctorRatingStats.count > 0 ? (
                  <button
                    type="button"
                    onClick={() => onOpenDoctorReviews(selectedDoctor)}
                    className="inline-flex items-center gap-1 rounded-full bg-warning-50 border border-warning-200 px-2 py-0.5 text-[11px] font-black text-warning-800 hover:bg-warning-100 transition-colors"
                  >
                    ⭐ {selectedDoctorRatingStats.average.toFixed(1)} ({selectedDoctorRatingStats.count})
                  </button>
                ) : (
                  <span className="text-[11px] font-bold text-slate-400">بدون تقييمات</span>
                )}
                {selectedDoctor.yearsExperience != null && selectedDoctor.yearsExperience > 0 && (
                  <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 text-brand-700 text-[11px] font-black px-2 py-0.5">
                    خبرة {selectedDoctor.yearsExperience} سنة
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* شريط الإجراءات — حذفنا زر "احجز موعد الآن" بناءً على طلب المالك.
              الحجز بقى من كرت الطبيب في صفحة النتائج فقط. */}
          <div className="relative px-4 md:px-6 pb-4 flex gap-2 flex-wrap">
            {callPhone && (
              <a
                href={`tel:${callPhone}`}
                className="h-11 px-3 rounded-xl border border-brand-200 bg-brand-50 text-brand-800 font-black text-sm inline-flex items-center gap-1.5 hover:bg-brand-100 transition-colors"
              >
                📞 اتصال
              </a>
            )}
            {whatsappPhone && (
              <a
                href={`https://wa.me/${whatsappPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 px-3 rounded-xl border border-success-200 bg-success-50 text-success-800 font-black text-sm inline-flex items-center gap-1.5 hover:bg-success-100 transition-colors"
              >
                <FaWhatsapp className="w-4 h-4" /> واتساب
              </a>
            )}
            <button
              type="button"
              onClick={handleShare}
              className="h-11 px-3 rounded-xl border border-brand-200 bg-brand-50 text-brand-700 font-black text-sm hover:bg-brand-100 transition-colors"
              title="نسخ الرابط"
            >
              {linkCopied ? '✓' : '↗'}
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4 bg-slate-50/40">
          {/* Bio Sections (عالمية للطبيب، فوق الفروع) */}
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

          {/* تبويبات الفروع + بيانات الفرع النشط (عنوان/أسعار/مواعيد/خدمات/صور) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3 md:p-4 shadow-sm">
            <BranchTabs
              branches={branches}
              activeBranchId={activeBranchId}
              onSelect={setActiveBranchId}
            />
            {activeBranch && (
              <BranchPublicView
                branch={activeBranch}
                showContactActions
                onImageClick={(idx) => {
                  onPreviewGalleryImage(activeBranch.imageUrls[idx]);
                  setActiveGalleryIndex(idx);
                }}
              />
            )}
          </div>

          {/* Social Links — كل لينك بلون البراند الرسمي + الشعار والاسم بأبيض،
              عشان الفيسبوك يبان أزرق واليوتيوب أحمر زي ما المريض متعوّد عليهم. */}
          {socialLinks.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-3 md:p-4 shadow-sm">
              <p className="text-xs font-black text-slate-700 mb-2">🔗 روابط التواصل الاجتماعي</p>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((social) => {
                  const { iconNode, bg, label } = getSocialStyle(social.platform);
                  return (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={label}
                      aria-label={label}
                      className={`h-9 px-3 rounded-full ${bg} text-white font-black text-[12px] inline-flex items-center gap-1.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
                    >
                      {iconNode('w-4 h-4')}
                      <span>{label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* ملحوظة: صور الفرع بقت جزء من BranchPublicView فوق، فمابقاش فيه قسم Gallery منفصل. */}
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
    </div>,
    document.body
  );
};
