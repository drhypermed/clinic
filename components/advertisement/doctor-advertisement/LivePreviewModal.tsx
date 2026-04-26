/**
 * نافذة المعاينة المباشرة (Live Preview Modal):
 * تحاكي تمامًا عرض الملف الشخصي للطبيب في "الدليل العام" (Public Directory).
 * تدعم عرض عدة فروع عبر تبويبات لو الطبيب مضيف أكتر من فرع.
 */
import React, { useState } from 'react';
import { createPortal } from 'react-dom';

import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaYoutube } from 'react-icons/fa6';
import { FaLink } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import type { DoctorAdProfile, DoctorClinicScheduleRow } from '../../../types';
import {
  getAdBranches,
  getInitials,
  sanitizeBioForDisplay,
} from '../public-directory/helpers';
import { BranchPublicView, BranchTabs } from '../public-directory/BranchPublicView';
import { sanitizeSocialUrl } from './securityUtils';

interface LivePreviewModalProps {
  showPreview: boolean;
  onClose: () => void;
  profileImage?: string;
  previewData: DoctorAdProfile;
  imageUrls: string[];
  // مافيش استهلاك فعلي لها بعد ما نقلنا عرض الجدول داخل BranchPublicView،
  // بس سايبينها في الـinterface لتوافق الاستدعاء القديم.
  normalizeScheduleRows?: (rows: DoctorClinicScheduleRow[] | undefined | null) => DoctorClinicScheduleRow[];
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
}) => {
  const branches = getAdBranches(previewData);
  const [activeBranchId, setActiveBranchId] = useState(branches[0]?.id || '');

  // لو branches اتغيرت (مثلاً الطبيب ضاف/شال فرع وفضل الـmodal مفتوح)،
  // نتأكد إن الـactiveBranchId لسه موجود؛ وإلا نرجع لأول فرع.
  React.useEffect(() => {
    if (!branches.find((b) => b.id === activeBranchId)) {
      setActiveBranchId(branches[0]?.id || '');
    }
  }, [branches, activeBranchId]);

  if (!showPreview) return null;

  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0];

  const safeSocialLinks = (
    previewData.socialLinks && previewData.socialLinks.length > 0
      ? previewData.socialLinks.filter((item) => item?.platform && item?.url)
      : previewData.socialMediaUrl
        ? [{ id: 'legacy-social', platform: previewData.socialMediaPlatform || 'Social', url: previewData.socialMediaUrl }]
        : []
  )
    .map((item) => ({ ...item, url: sanitizeSocialUrl(item.url) }))
    .filter((item) => item.url);

  const primaryLocation = activeBranch
    ? [activeBranch.governorate, activeBranch.city, activeBranch.addressDetails].filter(Boolean).join(' - ')
    : '';

  return createPortal(
    <div
      className="fixed inset-0 z-[9995] bg-slate-950/80 backdrop-blur-sm p-3 md:p-5 flex items-start md:items-center justify-center overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[92vh] rounded-3xl overflow-hidden border-2 border-white/50 bg-gradient-to-b from-white to-slate-50 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="px-4 md:px-6 py-5 relative max-h-[92vh] overflow-y-auto">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-l from-brand-100/70 via-brand-50/70 to-transparent" />

          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 left-3 w-10 h-10 rounded-full bg-white/95 border border-slate-200 text-slate-800 font-black text-xl shadow-sm hover:bg-slate-100 transition-colors z-10"
          >
            ×
          </button>

          {/* هيدر الطبيب العام (اسم، تخصص، صورة) — مشترك لكل الفروع */}
          <div className="relative z-10 mt-8 rounded-3xl border border-brand-100 bg-white/90 p-4 md:p-5 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-24 h-24 md:w-28 md:h-28 aspect-square shrink-0 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-xl ring-2 ring-brand-200">
                  {profileImage ? (
                    <img src={profileImage} alt={previewData.doctorName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white font-black text-2xl">
                      {getInitials(previewData.doctorName)}
                    </div>
                  )}
                </div>
                <div className="pb-1 min-w-0">
                  <h3 className="text-xl md:text-3xl font-black text-slate-900 leading-tight">{previewData.doctorName}</h3>
                  <p className="text-sm md:text-base font-black text-brand-700 mt-1">{previewData.doctorSpecialty}</p>
                  <p className="text-xs md:text-sm font-bold text-slate-600 mt-1">{primaryLocation || 'العنوان غير محدد'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* معلومات الطبيب العامة (عالمية) */}
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            {previewData.academicDegree && (
              <>
                <p className="text-xs text-slate-500 font-black mb-2">الدرجة العلمية</p>
                <p className="text-sm md:text-base font-bold text-brand-700 leading-relaxed whitespace-pre-line break-words mb-3">
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
            {!previewData.subSpecialties && !previewData.featuredServicesSummary && !previewData.workplace && !previewData.extraInfo && !previewData.academicDegree && (
              <p className="text-sm md:text-base font-bold text-slate-500">لا توجد معلومات إضافية مضافة حتى الآن.</p>
            )}
          </div>

          {/* تبويبات الفروع (تظهر بس لو فيه أكتر من فرع) */}
          <div className="mt-4">
            <BranchTabs
              branches={branches}
              activeBranchId={activeBranchId}
              onSelect={setActiveBranchId}
            />
            {activeBranch && <BranchPublicView branch={activeBranch} />}
          </div>

          {/* روابط السوشيال (عالمية — واحدة لكل الفروع) */}
          {safeSocialLinks.length > 0 && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500 font-black mb-2">تواصل عبر السوشيال</p>
              <div className="flex flex-wrap gap-2">
                {safeSocialLinks.map((social) => (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 rounded-xl border border-brand-200 bg-brand-50 text-brand-800 font-black text-sm inline-flex items-center justify-center gap-2 px-4 hover:bg-brand-100 transition-colors"
                  >
                    <span>{getSocialIcon(social.platform)}</span>
                    <span>{social.platform || 'Social'}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
