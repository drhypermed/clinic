/**
 * DrugToolsSection — أدوات الأدوية بتصميم موحد
 *
 * نفس نظام الـheader الموحد (blue gradient + white icon) والخانات (white + slate-200).
 */

import React, { useState } from 'react';
import {
  FaPills, FaDroplet,
  FaCrown, FaUser, FaLock, FaLockOpen, FaPenToSquare, FaChevronDown,
} from 'react-icons/fa6';
import { AccountTypeControlsForm } from './types';
import { clampLimit } from './utils';

interface DrugToolsSectionProps {
  form: AccountTypeControlsForm;
  setForm: React.Dispatch<React.SetStateAction<AccountTypeControlsForm>>;
  drugToolsOpen?: boolean;
  onToggle?: () => void;
}

type ToolFreeLimitKey =
  | 'freeInteractionToolDailyLimit'
  | 'freeRenalToolDailyLimit'
  | 'freePregnancyToolDailyLimit';

type ToolProLimitKey =
  | 'premiumInteractionToolDailyLimit'
  | 'premiumRenalToolDailyLimit'
  | 'premiumPregnancyToolDailyLimit';

type ToolProOnlyKey =
  | 'interactionToolPremiumOnly'
  | 'renalToolPremiumOnly'
  | 'pregnancyToolPremiumOnly';

type ToolLockedMessageKey =
  | 'interactionToolLockedMessage'
  | 'renalToolLockedMessage'
  | 'pregnancyToolLockedMessage';

type DrugToolConfig = {
  id: 'interaction' | 'renal' | 'pregnancy';
  title: string;
  freeLimitKey: ToolFreeLimitKey;
  premiumLimitKey: ToolProLimitKey;
  premiumOnlyKey: ToolProOnlyKey;
  lockedMessageKey: ToolLockedMessageKey;
  showProTagField?: boolean;
  icon: React.ReactElement;
};

// ─ التداخلات + الحمل/الرضاعة اتنقلوا 2026-04 لقسم "حدود الميزات" كحدود يومية كاملة ─
// ─ (هما "الأزرار الذهبية تحت الروشتة" — أصبح الأدمن يضبطهم زي باقي الميزات)
// ─ الكلى لسه هنا لأنها أداة منفصلة (مش زر تحت الروشتة)
const DRUG_TOOL_CONFIGS: DrugToolConfig[] = [
  {
    id: 'renal',
    title: 'حاسبة جرعات الكلى (حد يومي)',
    freeLimitKey: 'freeRenalToolDailyLimit',
    premiumLimitKey: 'premiumRenalToolDailyLimit',
    premiumOnlyKey: 'renalToolPremiumOnly',
    lockedMessageKey: 'renalToolLockedMessage',
    showProTagField: true,
    icon: <FaDroplet />,
  },
];

export const DrugToolsSection: React.FC<DrugToolsSectionProps> = ({
  form,
  setForm,
}) => {
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});

  const updateField = <K extends keyof AccountTypeControlsForm>(
    key: K,
    value: AccountTypeControlsForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleExpanded = (toolId: string) => {
    setExpandedTools((prev) => ({ ...prev, [toolId]: !prev[toolId] }));
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center gap-2 px-1">
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 text-white rounded-lg p-1.5 shadow-sm">
          <FaPills className="w-3.5 h-3.5 text-white" />
        </div>
        <h3 className="text-sm sm:text-base font-black text-slate-800">أدوات البحث الدوائي</h3>
        <span className="text-[10px] sm:text-[11px] font-bold text-slate-400">
          ({DRUG_TOOL_CONFIGS.length} أدوات)
        </span>
      </div>

      {/* Tool Rows */}
      <div className="space-y-3">
        {DRUG_TOOL_CONFIGS.map((tool) => {
          const isAllowedForFree = !form[tool.premiumOnlyKey];
          const isExpanded = !!expandedTools[tool.id];
          const lockedMessageValue = form[tool.lockedMessageKey] as string;

          return (
            <article key={tool.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 sm:p-4">
              {/* Header: unified blue gradient icon + title */}
              <div className="flex items-center gap-2.5 mb-3">
                <div className="bg-gradient-to-br from-brand-500 to-brand-700 text-white rounded-lg p-1.5 sm:p-2 shrink-0 shadow-sm">
                  {React.cloneElement(tool.icon as React.ReactElement<any>, { className: 'w-3.5 h-3.5 text-white' })}
                </div>
                <h4 className="flex-1 min-w-0 text-sm sm:text-base font-black text-slate-800 tracking-tight truncate">
                  {tool.title}
                </h4>
              </div>

              {/* Clear question: can free users access this? */}
              <div className="mb-3 rounded-2xl border-2 border-slate-200 bg-slate-50/40 p-3">
                <p className="text-[12px] font-black text-slate-700 mb-2 px-1">
                  هل المجاني يقدر يستخدمها؟
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateField(tool.premiumOnlyKey, false as AccountTypeControlsForm[typeof tool.premiumOnlyKey])}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border-2 px-3 py-2 text-xs font-black transition-colors ${
                      isAllowedForFree
                        ? 'border-success-500 bg-success-500 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-success-300 hover:bg-success-50/50'
                    }`}
                  >
                    <FaLockOpen className="w-3 h-3" />
                    نعم، يقدر
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField(tool.premiumOnlyKey, true as AccountTypeControlsForm[typeof tool.premiumOnlyKey])}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border-2 px-3 py-2 text-xs font-black transition-colors ${
                      !isAllowedForFree
                        ? 'border-danger-500 bg-danger-500 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-danger-300 hover:bg-danger-50/50'
                    }`}
                  >
                    <FaLock className="w-3 h-3" />
                    لا لبرو فقط
                  </button>
                </div>
                <p className="mt-2 text-[10px] font-bold text-slate-500 px-1 leading-relaxed">
                  {isAllowedForFree
                    ? '• المجاني: يستخدمها في حدود يومي (الرقم تحت) · برو: متاح له دايما'
                    : '• المجاني: مقفولة تماما (هتظهرله رسالة القفل) · برو: متاح له دايما'}
                </p>
              </div>

              {/* Unified input boxes — new exam page style (label above, input h-[44px]) */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
                <div className={!isAllowedForFree ? 'opacity-50' : ''}>
                  <div className="flex items-center gap-1.5 mb-1.5 px-1">
                    <FaUser className="w-3 h-3 text-slate-500" />
                    <span className="text-[12px] font-black text-slate-700">
                      مجاني {!isAllowedForFree && <span className="text-[10px] text-slate-400 font-bold">(غير مستخدم)</span>}
                    </span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={999999}
                    value={form[tool.freeLimitKey]}
                    onChange={(e) =>
                      updateField(
                        tool.freeLimitKey,
                        clampLimit(Number(e.target.value || 0)) as AccountTypeControlsForm[typeof tool.freeLimitKey],
                      )
                    }
                    disabled={!isAllowedForFree}
                    className="w-full h-[44px] px-4 rounded-2xl border-2 border-slate-200 bg-white text-sm font-black text-slate-900 placeholder-slate-400 focus:border-brand-400 hover:border-brand-300 focus:outline-none transition-colors font-numeric disabled:bg-slate-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-1.5 px-1">
                    <FaCrown className="w-3 h-3 text-warning-500" />
                    <span className="text-[12px] font-black text-warning-700">برو</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={999999}
                    value={form[tool.premiumLimitKey]}
                    onChange={(e) =>
                      updateField(
                        tool.premiumLimitKey,
                        clampLimit(Number(e.target.value || 0)) as AccountTypeControlsForm[typeof tool.premiumLimitKey],
                      )
                    }
                    className="w-full h-[44px] px-4 rounded-2xl border-2 border-slate-200 bg-white text-sm font-black text-slate-900 placeholder-slate-400 focus:border-brand-400 hover:border-brand-300 focus:outline-none transition-colors font-numeric"
                  />
                </div>
              </div>

              {/* Toggle button */}
              <button
                type="button"
                onClick={() => toggleExpanded(tool.id)}
                className={`w-full flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2 text-xs font-black transition-colors ${
                  isExpanded
                    ? 'border-brand-400 bg-brand-50 text-brand-700 hover:bg-brand-100'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-brand-50/50'
                }`}
              >
                <FaPenToSquare className="w-3 h-3" />
                {isExpanded ? 'إخفاء الرسائل' : 'تعديل رسالة القفل'}
                {tool.showProTagField && <span className="text-slate-400">+ تاج برو</span>}
                <FaChevronDown className={`w-2.5 h-2.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {/* Inline expansion */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                  <div>
                    <label className="block mb-1.5 text-[12px] font-black text-slate-700 px-1">
                      الرسالة اللي تظهر للمجاني لو الأداة مقفولة
                    </label>
                    <textarea
                      value={lockedMessageValue}
                      onChange={(e) =>
                        updateField(
                          tool.lockedMessageKey,
                          e.target.value.slice(0, 500) as AccountTypeControlsForm[typeof tool.lockedMessageKey],
                        )
                      }
                      rows={3}
                      maxLength={500}
                      className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-brand-400 hover:border-brand-300 focus:outline-none transition-colors resize-none"
                    />
                    <p className="mt-1 text-[10px] text-slate-400 text-left" dir="ltr">
                      {(lockedMessageValue || '').length}/500
                    </p>
                  </div>

                  {tool.showProTagField && (
                    <div>
                      <label className="block mb-1.5 text-[12px] font-black text-slate-700 px-1">تاج برو في التحذير</label>
                      <input
                        type="text"
                        value={form.premiumTagLabel}
                        onChange={(e) =>
                          updateField(
                            'premiumTagLabel',
                            e.target.value.slice(0, 40) as AccountTypeControlsForm['premiumTagLabel'],
                          )
                        }
                        placeholder="Pro"
                        className="w-full h-[44px] rounded-2xl border-2 border-slate-200 bg-white px-4 text-sm font-black text-slate-900 placeholder-slate-400 focus:border-brand-400 hover:border-brand-300 focus:outline-none transition-colors"
                      />
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};
