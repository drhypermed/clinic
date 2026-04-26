// ─────────────────────────────────────────────────────────────────────────────
// بطاقة طبيب قابلة للتوسيع (DoctorAccountCard)
// ─────────────────────────────────────────────────────────────────────────────
// تعرض طبيب واحد في شكل بطاقة لها حالتين:
//   - مطوية: أفاتار + الاسم + التخصص + شارات الحالة (تحقق / مميز / قرب ينتهي)
//   - موسعة: معلومات الاتصال + محرر نوع الحساب + تفاصيل الاشتراك + السجل + إجراءات
//
// الـ state الخاص بالتعديل محفوظ في المكون الأب (AccountManagementTable) — الكارد
// ده بس بيعرض ويطلب التحديث عبر props كولباكس.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  FaBan,
  FaChevronDown,
  FaCircleCheck,
  FaCircleXmark,
  FaClock,
  FaCrown,
  FaEnvelope,
  FaPlus,
  FaShieldHalved,
  FaWhatsapp,
} from 'react-icons/fa6';
import { ActionModalState, ApprovedDoctor, AccountType, EditMode, SubscriptionUnit } from './types';
import { useTrustedNow } from '../../../hooks/useTrustedNow';
import { getExpiryStatus, getRemainingTimeParts, parseIsoTimeMs } from '../../../utils/expiryTime';
import {
  DURATION_PRESETS,
  SEVEN_DAYS_MS,
  getInitials,
  getStatusConfig,
} from './accountTableHelpers';
import { DoctorSubscriptionDetails } from './DoctorSubscriptionDetails';

interface DoctorAccountCardProps {
  doctor: ApprovedDoctor;
  isExpanded: boolean;
  isAdmin: boolean;
  onToggleExpand: () => void;
  actionInProgress: boolean;

  // state التعديل (كلها من المكون الأب)
  editingDurationId: string;
  editingStartDate: Record<string, string>;
  editingEndDate: Record<string, string>;
  editingStartTime: Record<string, string>;
  editingEndTime: Record<string, string>;
  editMode: Record<string, EditMode>;
  setEditingDurationId: React.Dispatch<React.SetStateAction<string>>;
  setEditingStartDate: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setEditingEndDate: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setEditingStartTime: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setEditingEndTime: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setEditMode: React.Dispatch<React.SetStateAction<Record<string, EditMode>>>;
  setEditingDurationValue: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setEditingDurationUnit: React.Dispatch<React.SetStateAction<Record<string, SubscriptionUnit>>>;

  // الإجراءات
  onOpenActionModal: (modal: ActionModalState) => void;
  onUpdateAccountType: (doctorId: string, newType: AccountType, durationDays?: number) => Promise<void>;
  onUpdateSubscriptionDates: (
    doctorId: string, newStartDate: string, newEndDate: string,
    newStartTime?: string, newEndTime?: string,
  ) => Promise<void>;
  onUpdateSubscriptionDuration: (doctorId: string, value: number, unit: SubscriptionUnit) => Promise<void>;
}

export const DoctorAccountCard: React.FC<DoctorAccountCardProps> = ({
  doctor,
  isExpanded,
  isAdmin,
  onToggleExpand,
  actionInProgress,
  editingDurationId,
  editingStartDate, editingEndDate, editingStartTime, editingEndTime,
  editMode,
  setEditingDurationId,
  setEditingStartDate, setEditingEndDate, setEditingStartTime, setEditingEndTime,
  setEditMode,
  setEditingDurationValue, setEditingDurationUnit,
  onOpenActionModal,
  onUpdateAccountType, onUpdateSubscriptionDates, onUpdateSubscriptionDuration,
}) => {
  // state محلي: أي duration picker مفتوح لهذا الكارد
  //   new = اشتراك برو جديد | new-max = اشتراك برو ماكس جديد | extend = تمديد الاشتراك الحالي
  const [durationPicker, setDurationPicker] = useState<'new' | 'new-max' | 'extend' | null>(null);
  const { nowMs } = useTrustedNow();

  const statusCfg = getStatusConfig(doctor.verificationStatus);
  // Pro = premium (القيمة الداخلية ما تغيرتش — الـ label بقى "برو" في الـ UI)
  const isPro = doctor.accountType === 'premium';
  const isProMax = doctor.accountType === 'pro_max';
  // حساب مدفوع = برو أو برو ماكس (الاتنين لهم expiry وتحذيرات)
  const isPaid = isPro || isProMax;

  // ── حسابات اشتراك برو (تاريخ البداية، النهاية، المتبقي) ──
  const premiumStartMs = parseIsoTimeMs(doctor.premiumStartDate);
  const premiumStatus = getExpiryStatus(doctor.premiumExpiryDate, nowMs);
  const premiumExpiryMs = premiumStatus.expiryMs;
  const premiumStartDate = premiumStartMs !== null ? new Date(premiumStartMs) : null;
  const expiryDate = premiumExpiryMs !== null ? new Date(premiumExpiryMs) : null;
  const remainingTimeParts = getRemainingTimeParts(premiumExpiryMs, nowMs);
  const isExpired = premiumStatus.isExpired;
  const premiumStartIso = premiumStartDate ? premiumStartDate.toISOString() : '';
  const premiumEndIso = expiryDate ? expiryDate.toISOString() : '';
  const defaultStartDate = premiumStartIso ? premiumStartIso.split('T')[0] : '';
  const defaultEndDate = premiumEndIso ? premiumEndIso.split('T')[0] : '';
  const defaultStartTime = premiumStartIso ? premiumStartIso.split('T')[1].substring(0, 5) : '';
  const defaultEndTime = premiumEndIso ? premiumEndIso.split('T')[1].substring(0, 5) : '';
  const isEditingThis = editingDurationId === doctor.id;
  // حساب الأدمن بيكون له premium ينتهي في 9999 (فعلياً مدى الحياة)
  const isAdminAccount = isAdmin && doctor.premiumExpiryDate?.startsWith('9999');
  const isExpiringSoon = isPro && !isAdminAccount && !isExpired && premiumExpiryMs !== null
    && (premiumExpiryMs - nowMs) < SEVEN_DAYS_MS;

  // ── دالة تنظيف: تفرغ كل state التعديل عند الإلغاء ──
  const clearEditor = () => {
    setEditingDurationId('');
    setEditingStartDate({});
    setEditingEndDate({});
    setEditingStartTime({});
    setEditingEndTime({});
    setEditingDurationValue({});
    setEditingDurationUnit({});
    setEditMode({});
  };

  return (
    <article className={doctor.isAccountDisabled ? 'bg-danger-50/30' : ''}>
      {/* ═════════ الرأس المطوي (دائماً ظاهر) ═════════ */}
      <div className="flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50/80">
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex items-center gap-3 flex-1 min-w-0 text-right"
        >
          {/* الأفاتار: أخضر للنشط، أحمر للمعطل */}
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white font-black text-sm shadow-sm ${
            doctor.isAccountDisabled
              ? 'bg-gradient-to-br from-danger-400 to-danger-600'
              : 'bg-gradient-to-br from-brand-400 to-brand-600'
          }`}>
            {getInitials(doctor.doctorName || 'د')}
          </div>

          {/* الاسم والتخصص */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-slate-800 truncate">
              {doctor.doctorName || 'بدون اسم'}
              {doctor.isAccountDisabled && (
                <span className="mr-1.5 text-[10px] font-bold text-danger-500">(معطل)</span>
              )}
            </p>
            <p className="text-[11px] font-bold text-slate-400 truncate">
              {doctor.doctorSpecialty || 'بدون تخصص'}
            </p>
          </div>

          {/* الشارات: حالة التحقق + نوع الحساب + تحذيرات الانتهاء */}
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusCfg.cls}`}>
              {statusCfg.icon} {statusCfg.label}
            </span>
            {(isProMax || isAdmin) ? (
              // برو ماكس (أو الأدمن = دايماً برو ماكس مدى الحياة): ذهبي لامع + علامة صح
              <span className="inline-flex items-center gap-1 rounded-full border border-[#FF8F00] bg-gradient-to-r from-[#FFF176] via-[#FFD54F] to-[#FFB300] px-2 py-0.5 text-[10px] font-black text-[#B45309] shadow-[0_1px_4px_rgba(255,193,7,0.55)]">
                <FaCrown className="w-2.5 h-2.5 text-[#E65100]" /> برو ماكس
                {/* الأدمن دايماً نشط — لغير الأدمن نعرض الصح بس لو مش منتهي */}
                {(isAdmin || !isExpired) && (
                  <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-blue-500 text-white" aria-label="مفعّل">
                    <svg className="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  </span>
                )}
              </span>
            ) : isPro ? (
              // برو: ذهبي هادئ + علامة صح
              <span className="inline-flex items-center gap-1 rounded-full border border-warning-200 bg-warning-50 px-2 py-0.5 text-[10px] font-bold text-warning-700">
                <FaCrown className="w-2 h-2" /> برو
                {!isExpired && (
                  <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-blue-500 text-white" aria-label="مفعّل">
                    <svg className="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  </span>
                )}
              </span>
            ) : (
              <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                مجاني
              </span>
            )}
            {/* تحذير انتهاء الاشتراك */}
            {isPaid && isExpired && !isAdminAccount && (
              <span className="inline-flex items-center gap-0.5 rounded-full border border-danger-300 bg-danger-50 px-2 py-0.5 text-[10px] font-bold text-danger-600 animate-pulse">
                <FaClock className="w-2 h-2" /> منتهي
              </span>
            )}
            {isExpiringSoon && (
              <span className="inline-flex items-center gap-0.5 rounded-full border border-warning-300 bg-warning-50 px-2 py-0.5 text-[10px] font-bold text-warning-600">
                <FaClock className="w-2 h-2" /> قرب ينتهي
              </span>
            )}
          </div>

          {/* سهم التوسيع */}
          <FaChevronDown className={`w-3 h-3 text-slate-400 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>

        {/* زر تجديد سريع خارج زر التوسيع (للحسابات المنتهية فقط — برو أو برو ماكس) */}
        {isPaid && isExpired && !isAdminAccount && !isAdmin && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!isExpanded) onToggleExpand();
              setDurationPicker('extend');
            }}
            className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-success-300 bg-success-50 px-3 py-1.5 text-[11px] font-bold text-success-700 transition hover:bg-success-100"
          >
            <FaPlus className="w-2.5 h-2.5" /> تجديد
          </button>
        )}
      </div>

      {/* ═════════ المحتوى الموسع (يظهر عند التوسيع فقط) ═════════ */}
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/30 px-4 py-4 space-y-4">
          {/* ── معلومات الاتصال ── */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {doctor.doctorEmail && (
              <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2.5">
                <FaEnvelope className="w-3 h-3 text-brand-500 shrink-0" />
                <span className="text-[11px] font-bold text-slate-400 shrink-0">البريد</span>
                <span className="text-xs font-bold text-slate-700 truncate mr-auto" dir="ltr">{doctor.doctorEmail}</span>
              </div>
            )}
            {doctor.doctorWhatsApp && (
              <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2.5">
                <FaWhatsapp className="w-3 h-3 text-success-500 shrink-0" />
                <span className="text-[11px] font-bold text-slate-400 shrink-0">واتساب</span>
                <span className="text-xs font-bold text-slate-700 mr-auto" dir="ltr">{doctor.doctorWhatsApp}</span>
              </div>
            )}
          </div>

          {/* ── اختيار نوع الحساب (أدمن = برو ماكس مدى الحياة / غير أدمن = مجاني/برو/برو ماكس) ── */}
          {isAdmin ? (
            // ستايل ذهبي لامع للأدمن (برو ماكس مدى الحياة)
            <div className="relative flex items-center gap-2 rounded-xl border-2 border-[#FF8F00] bg-gradient-to-r from-[#FFF176] via-[#FFD54F] to-[#FFB300] px-4 py-3 shadow-[0_2px_8px_rgba(255,193,7,0.35)] overflow-hidden">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-50"
                style={{ background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%)' }}
              />
              <FaCrown className="relative w-4 h-4 text-[#E65100] drop-shadow-soft" />
              <span className="relative text-sm font-black text-[#B45309]">برو ماكس مدى الحياة</span>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-100 bg-white p-3 space-y-2">
              <label className="block text-[11px] font-black text-slate-500">نوع الحساب</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => { onUpdateAccountType(doctor.id, 'free'); setDurationPicker(null); }}
                  disabled={!isPaid}
                  className={`flex items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-[11px] font-bold transition ${
                    !isPaid
                      ? 'border-2 border-slate-600 bg-slate-600 text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >مجاني</button>
                <button
                  type="button"
                  onClick={() => { if (!isPro) setDurationPicker('new'); }}
                  disabled={isPro}
                  className={`flex items-center justify-center gap-1 rounded-xl px-2.5 py-2 text-[11px] font-bold transition ${
                    isPro
                      ? 'border-2 border-warning-500 bg-warning-500 text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                ><FaCrown className="w-3 h-3" /> برو</button>
                <button
                  type="button"
                  onClick={() => { if (!isProMax) setDurationPicker('new-max'); }}
                  disabled={isProMax}
                  className={`flex items-center justify-center gap-1 rounded-xl px-2.5 py-2 text-[11px] font-black transition ${
                    isProMax
                      ? 'border-2 border-[#FF8F00] bg-gradient-to-r from-[#FFF176] via-[#FFD54F] to-[#FFB300] text-[#B45309] shadow-[0_2px_6px_rgba(255,193,7,0.4)]'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-warning-50 hover:border-warning-200'
                  }`}
                ><FaCrown className={`w-3 h-3 ${isProMax ? 'text-[#E65100]' : ''}`} /> برو ماكس</button>
              </div>

              {/* اختيار مدة للاشتراك الجديد (بعد ما يختار "برو" أو "برو ماكس") — الاتنين ذهبي */}
              {(durationPicker === 'new' || durationPicker === 'new-max') && (
                <div className={`rounded-xl border p-3 space-y-2 ${
                  durationPicker === 'new-max'
                    ? 'border-[#FFB300] bg-gradient-to-r from-[#FFF8E1] via-[#FFF3C4] to-[#FFF8E1]'
                    : 'border-warning-200 bg-warning-50/60'
                }`}>
                  <p className={`text-[11px] font-black ${
                    durationPicker === 'new-max' ? 'text-[#B45309]' : 'text-warning-700'
                  }`}>
                    اختر مدة الاشتراك {durationPicker === 'new-max' ? 'برو ماكس' : 'برو'}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {DURATION_PRESETS.map((opt) => (
                      <button
                        key={opt.days}
                        type="button"
                        onClick={() => {
                          const targetType = durationPicker === 'new-max' ? 'pro_max' : 'premium';
                          onUpdateAccountType(doctor.id, targetType, opt.days);
                          setDurationPicker(null);
                        }}
                        disabled={actionInProgress}
                        className={`rounded-xl border bg-white px-3 py-2.5 text-xs font-bold transition disabled:opacity-50 ${
                          durationPicker === 'new-max'
                            ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                            : 'border-warning-300 text-warning-700 hover:bg-warning-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setDurationPicker(null)}
                    className="w-full text-center text-[10px] font-bold text-slate-400 hover:text-slate-600 transition"
                  >
                    إلغاء
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── تفاصيل الاشتراك (للأطباء المدفوعين: برو أو برو ماكس) ── */}
          {isPaid && (
            <DoctorSubscriptionDetails
              doctor={doctor}
              isAdmin={isAdmin}
              actionInProgress={actionInProgress}
              premiumStartDate={premiumStartDate}
              expiryDate={expiryDate}
              premiumStartIso={premiumStartIso}
              premiumEndIso={premiumEndIso}
              defaultStartDate={defaultStartDate}
              defaultEndDate={defaultEndDate}
              defaultStartTime={defaultStartTime}
              defaultEndTime={defaultEndTime}
              premiumExpiryMs={premiumExpiryMs}
              isExpired={isExpired}
              remainingTimeParts={remainingTimeParts}
              isEditingThis={isEditingThis}
              editMode={editMode}
              editingStartDate={editingStartDate}
              editingEndDate={editingEndDate}
              editingStartTime={editingStartTime}
              editingEndTime={editingEndTime}
              durationPicker={durationPicker}
              setEditingDurationId={setEditingDurationId}
              setEditingStartDate={setEditingStartDate}
              setEditingEndDate={setEditingEndDate}
              setEditingStartTime={setEditingStartTime}
              setEditingEndTime={setEditingEndTime}
              setEditMode={setEditMode}
              setDurationPicker={(value) => setDurationPicker(value)}
              clearEditor={clearEditor}
              onUpdateSubscriptionDates={onUpdateSubscriptionDates}
              onUpdateSubscriptionDuration={onUpdateSubscriptionDuration}
            />
          )}

          {/* ── أزرار الإجراءات (تفعيل/تعطيل/حذف) ── */}
          <div className="flex flex-wrap gap-2 pt-1">
            {isAdmin ? (
              <span className="inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-[11px] font-bold text-brand-700">
                <FaShieldHalved className="w-2.5 h-2.5" /> حساب أدمن — لا يمكن تعديله
              </span>
            ) : (
              <>
                {doctor.isAccountDisabled ? (
                  <button
                    onClick={() => onOpenActionModal({ type: 'enable', doctorId: doctor.id, doctorName: doctor.doctorName || 'طبيب', doctorEmail: doctor.doctorEmail || '' })}
                    disabled={actionInProgress}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-success-200 bg-success-50 px-4 py-2 text-[11px] font-bold text-success-700 transition hover:bg-success-100 disabled:opacity-50 disabled:cursor-not-allowed">
                    <FaCircleCheck className="w-3 h-3" /> تفعيل الحساب
                  </button>
                ) : (
                  <button
                    onClick={() => onOpenActionModal({ type: 'disable', doctorId: doctor.id, doctorName: doctor.doctorName || 'طبيب', doctorEmail: doctor.doctorEmail || '' })}
                    disabled={actionInProgress}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-warning-200 bg-warning-50 px-4 py-2 text-[11px] font-bold text-warning-700 transition hover:bg-warning-100 disabled:opacity-50 disabled:cursor-not-allowed">
                    <FaBan className="w-3 h-3" /> تعطيل الحساب
                  </button>
                )}
                <button
                  onClick={() => onOpenActionModal({ type: 'delete', doctorId: doctor.id, doctorName: doctor.doctorName || 'طبيب', doctorEmail: doctor.doctorEmail || '' })}
                  disabled={actionInProgress}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-danger-200 bg-danger-50 px-4 py-2 text-[11px] font-bold text-danger-700 transition hover:bg-danger-100 disabled:opacity-50 disabled:cursor-not-allowed">
                  <FaCircleXmark className="w-3 h-3" /> حذف الطبيب
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </article>
  );
};
