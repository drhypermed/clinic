import React, { useEffect, useMemo, useState } from 'react';
import {
  LuArrowRight,
  LuBriefcaseMedical,
  LuCalendarDays,
  LuClock3,
  LuGraduationCap,
  LuMapPin,
  LuPhone,
  LuShieldCheck,
  LuSparkles,
  LuStar,
} from 'react-icons/lu';
import { FaWhatsapp } from 'react-icons/fa6';
import type { DoctorAdBranch, DoctorAdProfile } from '../../../types';
import {
  getAdBranches,
  getAvatarImage,
  getDoctorRatingStats,
  getInitials,
  normalizePhoneForTel,
  normalizePhoneForWhatsApp,
  sanitizeBioForDisplay,
} from './helpers';
import { getSocialStyle } from './socialStyles';
import { BranchPublicView, BranchTabs } from './BranchPublicView';

type PublicProfileMode = 'page' | 'preview';

type PublicSocialLink = {
  id: string;
  platform: string;
  url: string;
};

interface DoctorPublicProfileViewProps {
  doctor: DoctorAdProfile;
  mode?: PublicProfileMode;
  profileImage?: string;
  headerLabel?: string;
  showBookingAction?: boolean;
  showBranchContactActions?: boolean;
  onBack?: () => void;
  onClose?: () => void;
  onBookDoctor?: (branch: DoctorAdBranch) => void;
  onOpenReviews?: (doctor: DoctorAdProfile) => void;
  onAvatarClick?: (url: string) => void;
  onImageClick?: (url: string) => void;
}

const isSafeExternalUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const getSafeSocialLinks = (doctor: DoctorAdProfile): PublicSocialLink[] => {
  const modernLinks = Array.isArray(doctor.socialLinks) ? doctor.socialLinks : [];
  const legacyLinks = doctor.socialMediaUrl
    ? [{ id: 'legacy-social', platform: doctor.socialMediaPlatform || 'Social', url: doctor.socialMediaUrl }]
    : [];

  return [...modernLinks, ...legacyLinks]
    .map((item, index) => ({
      id: String(item?.id || `social-${index + 1}`),
      platform: String(item?.platform || '').trim(),
      url: String(item?.url || '').trim(),
    }))
    .filter((item) => item.platform && item.url && isSafeExternalUrl(item.url))
    .filter((item, index, arr) => arr.findIndex((candidate) => candidate.url === item.url) === index);
};

const getProfileInfoBlocks = (doctor: DoctorAdProfile) => [
  {
    key: 'academic-degree',
    label: 'الدرجة العلمية',
    value: sanitizeBioForDisplay(doctor.academicDegree),
    icon: LuGraduationCap,
    className: 'border-cyan-100 bg-cyan-50/80 text-cyan-950',
  },
  {
    key: 'sub-specialties',
    label: 'التخصصات الدقيقة',
    value: sanitizeBioForDisplay(doctor.subSpecialties),
    icon: LuSparkles,
    className: 'border-emerald-100 bg-emerald-50/80 text-emerald-950',
  },
  {
    key: 'featured-services',
    label: 'الخدمات المميزة',
    value: sanitizeBioForDisplay(doctor.featuredServicesSummary),
    icon: LuBriefcaseMedical,
    className: 'border-blue-100 bg-blue-50/80 text-blue-950',
  },
  {
    key: 'workplace',
    label: 'محل العمل',
    value: sanitizeBioForDisplay(doctor.workplace),
    icon: LuShieldCheck,
    className: 'border-violet-100 bg-violet-50/80 text-violet-950',
  },
  {
    key: 'extra-info',
    label: 'معلومات إضافية',
    value: sanitizeBioForDisplay(doctor.extraInfo),
    icon: LuSparkles,
    className: 'border-amber-100 bg-amber-50/80 text-amber-950',
  },
  {
    key: 'bio',
    label: 'نبذة عن الطبيب',
    value: sanitizeBioForDisplay(doctor.bio),
    icon: LuBriefcaseMedical,
    className: 'border-slate-200 bg-white text-slate-900',
  },
].filter((item) => item.value);

const formatPublicPrice = (value: number | null | undefined) => {
  if (value == null || value <= 0) return 'غير محدد';
  return `${value} جنيه`;
};

export const DoctorPublicProfileView: React.FC<DoctorPublicProfileViewProps> = ({
  doctor,
  mode = 'page',
  profileImage,
  headerLabel,
  showBookingAction = true,
  showBranchContactActions = mode === 'page',
  onBack,
  onClose,
  onBookDoctor,
  onOpenReviews,
  onAvatarClick,
  onImageClick,
}) => {
  const branches = useMemo(() => getAdBranches(doctor), [doctor]);
  const [activeBranchId, setActiveBranchId] = useState(branches[0]?.id || '');

  useEffect(() => {
    if (!branches.some((branch) => branch.id === activeBranchId)) {
      setActiveBranchId(branches[0]?.id || '');
    }
  }, [activeBranchId, branches]);

  const activeBranch = branches.find((branch) => branch.id === activeBranchId) || branches[0];
  const avatar = profileImage || getAvatarImage(doctor);
  const initials = getInitials(doctor.doctorName);
  const ratingStats = getDoctorRatingStats(doctor);
  const infoBlocks = getProfileInfoBlocks(doctor);
  const socialLinks = getSafeSocialLinks(doctor);
  const location = activeBranch
    ? [activeBranch.governorate, activeBranch.city, activeBranch.addressDetails].filter(Boolean).join(' - ')
    : '';
  const callPhone = normalizePhoneForTel(activeBranch?.contactPhone || doctor.contactPhone);
  const whatsappPhone = normalizePhoneForWhatsApp(activeBranch?.whatsapp || activeBranch?.contactPhone || doctor.whatsapp);
  const examPrice = formatPublicPrice(activeBranch?.discountedExaminationPrice ?? activeBranch?.examinationPrice);
  const consultPrice = formatPublicPrice(activeBranch?.discountedConsultationPrice ?? activeBranch?.consultationPrice);
  const shellClass = mode === 'preview'
    ? 'bg-[linear-gradient(135deg,#f8fafc_0%,#ecfeff_46%,#f0fdf4_100%)]'
    : 'min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#ecfeff_42%,#f7fee7_100%)]';

  const avatarNode = avatar ? (
    <img
      src={avatar}
      alt={doctor.doctorName}
      className="h-full w-full object-cover"
      loading="eager"
      decoding="async"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-slate-950 text-3xl font-black">
      {initials}
    </div>
  );

  return (
    <div className={shellClass} dir="rtl">
      <header className="sticky top-0 z-20 border-b border-white/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-cyan-100 bg-white px-3 text-sm font-black text-cyan-800 shadow-sm transition-colors hover:bg-cyan-50"
            >
              <LuArrowRight className="h-4 w-4" aria-hidden="true" />
              دليل الأطباء
            </button>
          ) : (
            <span className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800">
              {headerLabel || 'معاينة الجمهور'}
            </span>
          )}

          <span className="text-xs font-black text-slate-500">Dr Hyper</span>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg font-black text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
              aria-label="إغلاق المعاينة"
            >
              ×
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-5 md:py-8">
        <section className="overflow-hidden rounded-lg border border-white/80 bg-white shadow-[0_28px_70px_-48px_rgba(8,47,73,0.7)]">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative bg-[linear-gradient(135deg,#0f766e_0%,#0369a1_50%,#1e293b_100%)] p-5 text-white md:p-7">
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end">
                {avatar && onAvatarClick ? (
                  <button
                    type="button"
                    onClick={() => onAvatarClick(avatar)}
                    className="h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-white/85 bg-white/15 shadow-2xl"
                    aria-label="عرض صورة الطبيب"
                  >
                    {avatarNode}
                  </button>
                ) : (
                  <div className="h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-white/85 bg-white/15 shadow-2xl">
                    {avatarNode}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="mb-2 inline-flex rounded-lg border border-white/20 bg-white/15 px-3 py-1 text-xs font-black text-cyan-50">
                    ملف الطبيب العام
                  </p>
                  <h1 className="break-words text-3xl font-black leading-tight md:text-4xl">
                    {doctor.doctorName || 'اسم الطبيب'}
                  </h1>
                  <p className="mt-2 text-base font-black text-cyan-50 md:text-lg">
                    {doctor.doctorSpecialty || 'التخصص غير محدد'}
                  </p>
                  {doctor.academicDegree && (
                    <p className="mt-2 max-w-2xl whitespace-pre-line text-sm font-bold leading-relaxed text-white/82">
                      {sanitizeBioForDisplay(doctor.academicDegree)}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {ratingStats.count > 0 ? (
                  <button
                    type="button"
                    onClick={() => onOpenReviews?.(doctor)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-amber-200/40 bg-amber-300/20 px-3 text-xs font-black text-amber-50"
                  >
                    <LuStar className="h-4 w-4 fill-amber-300 text-amber-300" aria-hidden="true" />
                    {ratingStats.average.toFixed(1)} ({ratingStats.count} تقييم)
                  </button>
                ) : (
                  <span className="inline-flex h-9 items-center rounded-lg border border-white/15 bg-white/10 px-3 text-xs font-black text-white/75">
                    بدون تقييمات
                  </span>
                )}

                {doctor.yearsExperience != null && doctor.yearsExperience > 0 && (
                  <span className="inline-flex h-9 items-center rounded-lg border border-white/15 bg-white/10 px-3 text-xs font-black text-white">
                    خبرة {doctor.yearsExperience} سنة
                  </span>
                )}
              </div>
            </div>

            <div className="grid content-between gap-4 p-5 md:p-7">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-cyan-100 bg-cyan-50/80 p-3">
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-black text-cyan-700">
                    <LuMapPin className="h-4 w-4" aria-hidden="true" />
                    العنوان
                  </p>
                  <p className="text-sm font-black leading-relaxed text-slate-900">{location || 'غير محدد'}</p>
                </div>
                <div className="rounded-lg border border-emerald-100 bg-emerald-50/80 p-3">
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-black text-emerald-700">
                    <LuBriefcaseMedical className="h-4 w-4" aria-hidden="true" />
                    الكشف
                  </p>
                  <p className="text-lg font-black text-emerald-950">{examPrice}</p>
                </div>
                <div className="rounded-lg border border-blue-100 bg-blue-50/80 p-3">
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-black text-blue-700">
                    <LuClock3 className="h-4 w-4" aria-hidden="true" />
                    الاستشارة
                  </p>
                  <p className="text-lg font-black text-blue-950">{consultPrice}</p>
                </div>
                {showBookingAction && (
                  <div className="rounded-lg border border-amber-100 bg-amber-50/80 p-3">
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-black text-amber-700">
                      <LuShieldCheck className="h-4 w-4" aria-hidden="true" />
                      الحجز
                    </p>
                    <p className="text-sm font-black text-amber-950">
                      {mode === 'preview' ? 'زر الحجز يظهر للجمهور' : 'حجز مباشر أونلاين'}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {showBookingAction && (
                  <button
                    type="button"
                    onClick={() => activeBranch && onBookDoctor?.(activeBranch)}
                    disabled={!activeBranch || !onBookDoctor}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[linear-gradient(135deg,#0891b2,#059669)] px-5 text-sm font-black text-white shadow-[0_18px_34px_-22px_rgba(5,150,105,0.9)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_38px_-24px_rgba(5,150,105,0.95)] disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:translate-y-0"
                  >
                    <LuCalendarDays className="h-5 w-5" aria-hidden="true" />
                    احجز ميعاد
                  </button>
                )}

                {callPhone && (
                  <a
                    href={`tel:${callPhone}`}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-800 transition-colors hover:bg-slate-50"
                  >
                    <LuPhone className="h-4 w-4" aria-hidden="true" />
                    اتصال
                  </a>
                )}

                {whatsappPhone && (
                  <a
                    href={`https://wa.me/${whatsappPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 text-sm font-black text-emerald-800 transition-colors hover:bg-emerald-100"
                  >
                    <FaWhatsapp className="h-4 w-4" aria-hidden="true" />
                    واتساب
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {infoBlocks.length > 0 && (
          <section className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {infoBlocks.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.key} className={`rounded-lg border p-4 shadow-sm ${item.className}`}>
                  <p className="mb-2 flex items-center gap-2 text-xs font-black opacity-75">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </p>
                  <p className="whitespace-pre-line break-words text-sm font-bold leading-relaxed">
                    {item.value}
                  </p>
                </article>
              );
            })}
          </section>
        )}

        <section className="mt-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm md:p-4">
          <BranchTabs branches={branches} activeBranchId={activeBranchId} onSelect={setActiveBranchId} />
          {activeBranch && (
            <BranchPublicView
              branch={activeBranch}
              showContactActions={showBranchContactActions}
              onImageClick={onImageClick ? (index) => {
                const url = activeBranch.imageUrls[index];
                if (url) onImageClick(url);
              } : undefined}
            />
          )}
        </section>

        {socialLinks.length > 0 && (
          <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-sm font-black text-slate-900">روابط التواصل</p>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map((social) => {
                const { iconNode, bg, label } = getSocialStyle(social.platform);
                return (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex h-10 items-center gap-2 rounded-lg px-3 text-xs font-black text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${bg}`}
                    aria-label={label}
                    title={label}
                  >
                    {iconNode('h-4 w-4')}
                    {label}
                  </a>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {mode === 'page' && (
        <footer className="border-t border-white/80 bg-white/70 px-4 py-5 text-center text-xs font-bold text-slate-500">
          Dr Hyper - دليل الأطباء وحجز المواعيد في مصر
        </footer>
      )}
    </div>
  );
};
