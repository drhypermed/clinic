import React, { useState } from 'react';
import {
  FaBoxArchive,
  FaCalendarCheck,
  FaChevronDown,
  FaCrown,
  FaFileMedical,
  FaFloppyDisk,
  FaHospital,
  FaIdCard,
  FaPills,
  FaPenToSquare,
  FaPrint,
  FaRobot,
  FaShieldHalved,
  FaSliders,
  FaStethoscope,
  FaUser,
  FaUserTie,
  FaWandMagicSparkles,
} from 'react-icons/fa6';
import { AccountTypeControlsForm, GroupConfig } from './types';
import { clampLimit } from './utils';
import { PlanConfigCard } from './PlanConfigCard';

interface FeatureRowProps {
  group: GroupConfig;
  form: AccountTypeControlsForm;
  setForm: React.Dispatch<React.SetStateAction<AccountTypeControlsForm>>;
  whatsappNumber: string;
}

const GROUP_ICON: Record<string, React.ReactElement> = {
  analysis: <FaWandMagicSparkles />,
  quick_add: <FaFloppyDisk />,
  interaction_tool: <FaShieldHalved />,
  pregnancy_tool: <FaStethoscope />,
  renal_tool: <FaFileMedical />,
  guidelines_chat: <FaRobot />,
  records_capacity: <FaBoxArchive />,
  medical_report_print: <FaPrint />,
  public_booking: <FaCalendarCheck />,
  secretary_request: <FaUserTie />,
  ready_daily: <FaPills />,
  ready_capacity: <FaBoxArchive />,
  medication_customizations_capacity: <FaSliders />,
  branches_capacity: <FaHospital />,
  insurance_companies_capacity: <FaIdCard />,
};

const PAID_OPEN_GROUPS = new Set([
  'records_capacity',
  'public_booking',
  'secretary_request',
  'ready_daily',
  'ready_capacity',
  'medication_customizations_capacity',
  'insurance_companies_capacity',
]);

const UI_TEXT = {
  free: '\u0645\u062c\u0627\u0646\u064a',
  pro: '\u0628\u0631\u0648',
  proMax: '\u0628\u0631\u0648 \u0645\u0627\u0643\u0633',
  open: '\u221e \u0645\u0641\u062a\u0648\u062d',
  openTitle: 'Open for paid tiers without quota checks, except AI tools and branches.',
  editMessages:
    '\u062a\u0639\u062f\u064a\u0644 \u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0648\u0627\u0644\u0648\u0627\u062a\u0633\u0627\u0628',
  hideMessages: '\u0625\u062e\u0641\u0627\u0621 \u0627\u0644\u0631\u0633\u0627\u0626\u0644',
  messagesHelp:
    '\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u0646\u0638\u0627\u0645 \u062a\u0638\u0647\u0631 \u0639\u0646\u062f \u0627\u0644\u0648\u0635\u0648\u0644 \u0644\u0644\u062d\u062f\u060c \u0648\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u0648\u0627\u062a\u0633\u0627\u0628 \u062a\u0633\u062a\u062e\u062f\u0645 \u0644\u0644\u062a\u0648\u0627\u0635\u0644 \u062d\u0633\u0628 \u0627\u0644\u0628\u0627\u0642\u0629 \u0648\u0627\u0644\u0633\u0628\u0628.',
};

type LimitInputProps = {
  label: string;
  icon: React.ReactNode;
  value: number | undefined;
  onChange: (raw: string) => void;
  tone?: 'free' | 'plus' | 'pro' | 'proMax';
};

const toneClass: Record<NonNullable<LimitInputProps['tone']>, string> = {
  free: 'border-slate-200 bg-white focus:border-brand-400 hover:border-brand-300',
  plus: 'border-slate-300 bg-slate-50 focus:border-slate-400 hover:border-slate-400',
  pro: 'border-slate-200 bg-white focus:border-brand-400 hover:border-brand-300',
  proMax: 'border-[#FFE082] bg-gradient-to-br from-white to-[#FFFDE7] focus:border-[#FFB300] hover:border-[#FFD54F]',
};

const LimitInput: React.FC<LimitInputProps> = ({
  label,
  icon,
  value,
  onChange,
  tone = 'free',
}) => (
  <div className="min-w-0">
    <div className="flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-1.5 px-0.5 sm:px-1 min-w-0">
      {icon}
      <span className="text-[10px] sm:text-[12px] font-black text-slate-700 truncate">{label}</span>
    </div>
    <input
      type="number"
      min={0}
      max={999999}
      value={value ?? 0}
      onChange={(event) => onChange(event.target.value)}
      className={`w-full min-w-0 h-[40px] sm:h-[44px] px-2 sm:px-4 rounded-xl sm:rounded-2xl border-2 text-[13px] sm:text-sm font-black text-slate-900 placeholder-slate-400 focus:outline-none transition-colors font-numeric text-center sm:text-start ${toneClass[tone]}`}
    />
  </div>
);

const PaidOpenBadge: React.FC<{ tone: 'plus' | 'pro' | 'proMax' }> = ({ tone }) => {
  const classNameByTone = {
    plus: 'border-slate-300 bg-slate-50 text-slate-700',
    pro: 'border-warning-200 bg-warning-50 text-warning-700',
    proMax: 'border-[#FFE082] bg-gradient-to-br from-[#FFFDE7] to-[#FFF59D] text-[#B45309]',
  }[tone];

  return (
    <div
      className={`w-full min-w-0 h-[40px] sm:h-[44px] px-2 sm:px-3 rounded-xl sm:rounded-2xl border-2 flex items-center justify-center ${classNameByTone}`}
      title={UI_TEXT.openTitle}
    >
      <span className="text-[10px] sm:text-[12px] font-black truncate">{UI_TEXT.open}</span>
    </div>
  );
};

export const PlanGroupSection: React.FC<FeatureRowProps> = ({
  group,
  form,
  setForm,
  whatsappNumber,
}) => {
  const icon = GROUP_ICON[group.id] || <FaSliders />;
  const [isExpanded, setIsExpanded] = useState(false);
  const isOpenForPaid = PAID_OPEN_GROUPS.has(group.id);

  const updateLimit = (key: keyof AccountTypeControlsForm, raw: string) => {
    const value = clampLimit(Number(raw || 0));
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <article className="w-full min-w-0 max-w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm p-2.5 sm:p-4 overflow-hidden">
      <div className="flex items-center gap-2 sm:gap-2.5 mb-2.5 sm:mb-3 min-w-0">
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 text-white rounded-lg p-1.5 sm:p-2 shrink-0 shadow-sm">
          {React.cloneElement(icon, { className: 'w-3.5 h-3.5 text-white' })}
        </div>
        <h3 className="flex-1 min-w-0 text-[13px] sm:text-base font-black text-slate-800 tracking-tight break-words">
          {group.title}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3 mb-2.5 sm:mb-3 min-w-0">
        <LimitInput
          label={UI_TEXT.free}
          icon={<FaUser className="w-3 h-3 text-slate-500 shrink-0" />}
          value={form[group.free.limitKey] as number}
          onChange={(raw) => updateLimit(group.free.limitKey, raw)}
          tone="free"
        />

        {group.plus && (
          isOpenForPaid ? (
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-1.5 px-0.5 sm:px-1 min-w-0">
                <FaCrown className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="text-[10px] sm:text-[12px] font-black text-slate-700 truncate">Plus</span>
              </div>
              <PaidOpenBadge tone="plus" />
            </div>
          ) : (
            <LimitInput
              label="Plus"
              icon={<FaCrown className="w-3 h-3 text-slate-500 shrink-0" />}
              value={form[group.plus.limitKey] as number | undefined}
              onChange={(raw) => updateLimit(group.plus!.limitKey, raw)}
              tone="plus"
            />
          )
        )}

        {isOpenForPaid ? (
          <div className="min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-1.5 px-0.5 sm:px-1 min-w-0">
              <FaCrown className="w-3 h-3 text-warning-500 shrink-0" />
              <span className="text-[10px] sm:text-[12px] font-black text-warning-700 truncate">{UI_TEXT.pro}</span>
            </div>
            <PaidOpenBadge tone="pro" />
          </div>
        ) : (
          <LimitInput
            label={UI_TEXT.pro}
            icon={<FaCrown className="w-3 h-3 text-warning-500 shrink-0" />}
            value={form[group.premium.limitKey] as number}
            onChange={(raw) => updateLimit(group.premium.limitKey, raw)}
            tone="pro"
          />
        )}

        {group.proMax && (
          isOpenForPaid ? (
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-1.5 px-0.5 sm:px-1 min-w-0">
                <FaCrown className="w-3 h-3 text-[#E65100] drop-shadow-soft shrink-0" />
                <span className="text-[10px] sm:text-[12px] font-black text-[#B45309] truncate">{UI_TEXT.proMax}</span>
              </div>
              <PaidOpenBadge tone="proMax" />
            </div>
          ) : (
            <LimitInput
              label={UI_TEXT.proMax}
              icon={<FaCrown className="w-3 h-3 text-[#E65100] drop-shadow-soft shrink-0" />}
              value={form[group.proMax.limitKey] as number | undefined}
              onChange={(raw) => updateLimit(group.proMax!.limitKey, raw)}
              tone="proMax"
            />
          )
        )}
      </div>

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
        <span className="truncate">{isExpanded ? UI_TEXT.hideMessages : UI_TEXT.editMessages}</span>
        <FaChevronDown className={`w-2.5 h-2.5 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="mb-2 text-[11px] font-bold text-slate-400 break-words">
            {UI_TEXT.messagesHelp}
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-3 min-w-0">
            <PlanConfigCard plan={group.free} form={form} setForm={setForm} whatsappNumber={whatsappNumber} />
            {group.plus && (
              <PlanConfigCard plan={group.plus} form={form} setForm={setForm} whatsappNumber={whatsappNumber} />
            )}
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
