/**
 * FeatureRow — سطر ميزة واحدة بتصميم موحد
 *
 * Header موحد: أيقونة blue gradient مع أيقونة بيضاء جواها.
 * الخانات موحدة: أبيض + border-2 slate-200 + focus أزرق (زي صفحة كشف جديد).
 */

import React, { useState } from 'react';
import {
  FaSliders, FaWandMagicSparkles, FaFloppyDisk,
  FaPrint, FaCalendarCheck, FaUserTie, FaFileLines,
  FaPills, FaBoxArchive, FaCrown, FaUser,
  FaPenToSquare, FaChevronDown,
} from 'react-icons/fa6';
import { AccountTypeControlsForm, GroupConfig } from './types';
import { clampLimit } from './utils';
import { PlanConfigCard } from './PlanConfigCard';

interface FeatureRowProps {
  group: GroupConfig;
  form: AccountTypeControlsForm;
  setForm: React.Dispatch<React.SetStateAction<AccountTypeControlsForm>>;
  whatsappNumber: string;
  isOpen?: boolean;
  onToggle?: () => void;
  onOpenMessages?: (groupId: string) => void;
}

/* أيقونة لكل ميزة (نفس الأيقونة، خلفية موحدة) */
const GROUP_ICON: Record<string, React.ReactElement> = {
  analysis: <FaWandMagicSparkles />,
  records: <FaFloppyDisk />,
  medical_report_print: <FaPrint />,
  public_booking: <FaCalendarCheck />,
  secretary_request: <FaUserTie />,
  public_form_booking: <FaFileLines />,
  ready_daily: <FaPills />,
  ready_capacity: <FaBoxArchive />,
  medication_customizations_capacity: <FaSliders />,
};

/**
 * 🆕 (2026-05): الميزات اللي اتفتحت للـ paid tiers بلا حد — التشغيل أسرع.
 * في الـ Admin UI: حقول الأرقام للـ برو/برو ماكس بتختفي وتظهر علامة "مفتوح بلا حد"
 * بدل ما الأدمن يدخل أرقام بدون فايدة (الفرونت/السيرفر بيتخطى الفحص أصلاً).
 */
const GROUPS_OPEN_FOR_PAID = new Set([
  'prescription_print',
  'prescription_download',
  'prescription_whatsapp',
  'records_capacity',
  'ready_daily',
  'ready_capacity',
  'medication_customizations_capacity',
]);

/** بادج "مفتوح بلا حد" — يظهر بدل input في الميزات اللي اتفتحت للـ paid tiers */
const UnlimitedBadge: React.FC<{ tier: 'pro' | 'pro_max' }> = ({ tier }) => (
  <div
    className={`w-full min-w-0 h-[40px] sm:h-[44px] px-2 sm:px-3 rounded-xl sm:rounded-2xl border-2 flex items-center justify-center gap-1 sm:gap-1.5 ${
      tier === 'pro_max'
        ? 'border-[#FFE082] bg-gradient-to-br from-[#FFFDE7] to-[#FFF59D] text-[#B45309]'
        : 'border-warning-200 bg-warning-50 text-warning-700'
    }`}
    title="هذه الميزة مفتوحة للحساب المدفوع بلا حد — التشغيل أسرع لأن مفيش فحص كوتا."
  >
    <span className="text-[10px] sm:text-[12px] font-black truncate">∞ مفتوح</span>
  </div>
);

export const PlanGroupSection: React.FC<FeatureRowProps> = ({
  group,
  form,
  setForm,
  whatsappNumber,
}) => {
  const icon = GROUP_ICON[group.id] || <FaSliders />;
  const [isExpanded, setIsExpanded] = useState(false);
  // 🆕 لو الميزة اتفتحت للـ paid tiers بلا حد، نخفي حقول الأرقام للبرو والبرو ماكس
  const isOpenForPaid = GROUPS_OPEN_FOR_PAID.has(group.id);

  const updateLimit = (key: keyof AccountTypeControlsForm, raw: string) => {
    const value = clampLimit(Number(raw || 0));
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    // ─ min-w-0 ضروري لإن الـarticle جوّه grid/flex يقدر يـshrink (مايخرجش برا الشاشة).
    //   p-2.5 على الموبايل عشان نوسّع المساحة الداخلية لخانات الأرقام (3 أعمدة).
    <article className="min-w-0 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-2.5 sm:p-4">
      {/* Header: أيقونة زرقاء موحّدة + عنوان (truncate لمنع الخروج للأطراف) */}
      <div className="flex items-center gap-2 sm:gap-2.5 mb-2.5 sm:mb-3 min-w-0">
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 text-white rounded-lg p-1.5 sm:p-2 shrink-0 shadow-sm">
          {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-3.5 h-3.5 text-white' })}
        </div>
        <h3 className="flex-1 min-w-0 text-[13px] sm:text-base font-black text-slate-800 tracking-tight truncate">
          {group.title}
        </h3>
      </div>

      {/* خانات الأرقام — 3 أعمدة: مجاني / برو / برو ماكس
          gap-1.5 على الموبايل عشان نكسب كل بكسل ممكن لكتابة 6 أرقام */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-3 mb-2.5 sm:mb-3 min-w-0">
        {/* Free */}
        <div className="min-w-0">
          <div className="flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-1.5 px-0.5 sm:px-1 min-w-0">
            <FaUser className="w-3 h-3 text-slate-500 shrink-0" />
            <span className="text-[10px] sm:text-[12px] font-black text-slate-700 truncate">مجاني</span>
          </div>
          <input
            type="number"
            min={0}
            max={999999}
            value={form[group.free.limitKey]}
            onChange={(e) => updateLimit(group.free.limitKey, e.target.value)}
            className="w-full min-w-0 h-[40px] sm:h-[44px] px-2 sm:px-4 rounded-xl sm:rounded-2xl border-2 border-slate-200 bg-white text-[13px] sm:text-sm font-black text-slate-900 placeholder-slate-400 focus:border-brand-400 hover:border-brand-300 focus:outline-none transition-colors font-numeric text-center sm:text-start"
          />
        </div>

        {/* Pro (premium) */}
        <div className="min-w-0">
          <div className="flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-1.5 px-0.5 sm:px-1 min-w-0">
            <FaCrown className="w-3 h-3 text-warning-500 shrink-0" />
            <span className="text-[10px] sm:text-[12px] font-black text-warning-700 truncate">برو</span>
          </div>
          {/* 🆕 (2026-05): الميزات المفتوحة للـ paid → عرض "∞ مفتوح" بدل input */}
          {isOpenForPaid ? (
            <UnlimitedBadge tier="pro" />
          ) : (
            <input
              type="number"
              min={0}
              max={999999}
              value={form[group.premium.limitKey]}
              onChange={(e) => updateLimit(group.premium.limitKey, e.target.value)}
              className="w-full min-w-0 h-[40px] sm:h-[44px] px-2 sm:px-4 rounded-xl sm:rounded-2xl border-2 border-slate-200 bg-white text-[13px] sm:text-sm font-black text-slate-900 placeholder-slate-400 focus:border-brand-400 hover:border-brand-300 focus:outline-none transition-colors font-numeric text-center sm:text-start"
            />
          )}
        </div>

        {/* Pro Max — ذهبي لامع (أغنى من برو) */}
        {group.proMax && (
          <div className="min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-1.5 px-0.5 sm:px-1 min-w-0">
              <FaCrown className="w-3 h-3 text-[#E65100] drop-shadow-soft shrink-0" />
              {/* "برو ماكس" بيتلف لسطرين على شاشات صغيرة لو لازم بدل ما يضغط الإدخال */}
              <span className="text-[10px] sm:text-[12px] font-black text-[#B45309] truncate">برو ماكس</span>
            </div>
            {/* 🆕 (2026-05): الميزات المفتوحة للـ paid → عرض "∞ مفتوح" بدل input */}
            {isOpenForPaid ? (
              <UnlimitedBadge tier="pro_max" />
            ) : (
              <input
                type="number"
                min={0}
                max={999999}
                value={(form[group.proMax.limitKey] as number | undefined) ?? 0}
                onChange={(e) => updateLimit(group.proMax!.limitKey, e.target.value)}
                className="w-full min-w-0 h-[40px] sm:h-[44px] px-2 sm:px-4 rounded-xl sm:rounded-2xl border-2 border-[#FFE082] bg-gradient-to-br from-white to-[#FFFDE7] text-[13px] sm:text-sm font-black text-slate-900 placeholder-slate-400 focus:border-[#FFB300] hover:border-[#FFD54F] focus:outline-none transition-colors font-numeric text-center sm:text-start"
              />
            )}
          </div>
        )}
      </div>

      {/* Toggle messages button */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className={`w-full min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl border-2 px-2 sm:px-3 py-2 text-[11px] sm:text-xs font-black transition-colors ${
          isExpanded
            ? 'border-brand-400 bg-brand-50 text-brand-700 hover:bg-brand-100'
            : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-brand-50/50'
        }`}
      >
        <FaPenToSquare className="w-3 h-3 shrink-0" />
        <span className="truncate">{isExpanded ? 'إخفاء الرسائل' : 'تعديل الرسائل والواتساب'}</span>
        <FaChevronDown className={`w-2.5 h-2.5 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Inline expansion */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="mb-2 text-[11px] font-bold text-slate-400">
            رسائل النظام تظهر عند الوصول للحد · رسائل الواتساب تُستخدم للتواصل للترقية.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            <PlanConfigCard plan={group.free} form={form} setForm={setForm} whatsappNumber={whatsappNumber} />
            <PlanConfigCard plan={group.premium} form={form} setForm={setForm} whatsappNumber={whatsappNumber} />
            {group.proMax && (
              <PlanConfigCard plan={group.proMax} form={form} setForm={setForm} whatsappNumber={whatsappNumber} />
            )}
          </div>
        </div>
      )}
    </article>
  );
};
