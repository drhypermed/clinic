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

export const PlanGroupSection: React.FC<FeatureRowProps> = ({
  group,
  form,
  setForm,
  whatsappNumber,
}) => {
  const icon = GROUP_ICON[group.id] || <FaSliders />;
  const [isExpanded, setIsExpanded] = useState(false);

  const updateLimit = (key: keyof AccountTypeControlsForm, raw: string) => {
    const value = clampLimit(Number(raw || 0));
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <article className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 sm:p-4">
      {/* Header: unified blue gradient icon + title */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-lg p-1.5 sm:p-2 shrink-0 shadow-sm">
          {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-3.5 h-3.5 text-white' })}
        </div>
        <h3 className="flex-1 min-w-0 text-sm sm:text-base font-black text-slate-800 tracking-tight truncate">
          {group.title}
        </h3>
      </div>

      {/* Unified input boxes — 3 أعمدة: مجاني / برو / برو ماكس */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
        {/* Free */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5 px-1">
            <FaUser className="w-3 h-3 text-slate-500" />
            <span className="text-[11px] sm:text-[12px] font-black text-slate-700">مجاني</span>
          </div>
          <input
            type="number"
            min={0}
            max={5000}
            value={form[group.free.limitKey]}
            onChange={(e) => updateLimit(group.free.limitKey, e.target.value)}
            className="w-full h-[44px] px-3 sm:px-4 rounded-2xl border-2 border-slate-200 bg-white text-sm font-black text-slate-900 placeholder-slate-400 focus:border-blue-400 hover:border-blue-300 focus:outline-none transition-colors font-numeric"
          />
        </div>

        {/* Pro (premium) */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5 px-1">
            <FaCrown className="w-3 h-3 text-amber-500" />
            <span className="text-[11px] sm:text-[12px] font-black text-amber-700">برو</span>
          </div>
          <input
            type="number"
            min={0}
            max={5000}
            value={form[group.premium.limitKey]}
            onChange={(e) => updateLimit(group.premium.limitKey, e.target.value)}
            className="w-full h-[44px] px-3 sm:px-4 rounded-2xl border-2 border-slate-200 bg-white text-sm font-black text-slate-900 placeholder-slate-400 focus:border-blue-400 hover:border-blue-300 focus:outline-none transition-colors font-numeric"
          />
        </div>

        {/* Pro Max — ذهبي لامع (أغنى من برو) */}
        {group.proMax && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5 px-1">
              <FaCrown className="w-3 h-3 text-[#E65100] drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]" />
              <span className="text-[11px] sm:text-[12px] font-black text-[#B45309]">برو ماكس</span>
            </div>
            <input
              type="number"
              min={0}
              max={5000}
              value={(form[group.proMax.limitKey] as number | undefined) ?? 0}
              onChange={(e) => updateLimit(group.proMax!.limitKey, e.target.value)}
              className="w-full h-[44px] px-3 sm:px-4 rounded-2xl border-2 border-[#FFE082] bg-gradient-to-br from-white to-[#FFFDE7] text-sm font-black text-slate-900 placeholder-slate-400 focus:border-[#FFB300] hover:border-[#FFD54F] focus:outline-none transition-colors font-numeric"
            />
          </div>
        )}
      </div>

      {/* Toggle messages button */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className={`w-full flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2 text-xs font-black transition-colors ${
          isExpanded
            ? 'border-blue-400 bg-blue-50 text-blue-700 hover:bg-blue-100'
            : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50/50'
        }`}
      >
        <FaPenToSquare className="w-3 h-3" />
        {isExpanded ? 'إخفاء الرسائل' : 'تعديل الرسائل والواتساب'}
        <FaChevronDown className={`w-2.5 h-2.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
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
