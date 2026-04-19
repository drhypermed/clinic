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
  // state محلي: أي duration picker مفتوح لهذا الكارد (new = اشتراك جديد، extend = تمديد)
  const [durationPicker, setDurationPicker] = useState<'new' | 'extend' | null>(null);
  const { nowMs } = useTrustedNow();

  const statusCfg = getStatusConfig(doctor.verificationStatus);
  const isPremium = doctor.accountType === 'premium';

  // ── حسابات الاشتراك المميز (تاريخ البداية، النهاية، المتبقي) ──
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
  const isExpiringSoon = isPremium && !isAdminAccount && !isExpired && premiumExpiryMs !== null
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
    <article className={doctor.isAccountDisabled ? 'bg-red-50/30' : ''}>
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
              ? 'bg-gradient-to-br from-red-400 to-red-600'
              : 'bg-gradient-to-br from-teal-400 to-teal-600'
          }`}>
            {getInitials(doctor.doctorName || 'د')}
          </div>

          {/* الاسم والتخصص */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-slate-800 truncate">
              {doctor.doctorName || 'بدون اسم'}
              {doctor.isAccountDisabled && (
                <span className="mr-1.5 text-[10px] font-bold text-red-500">(معطل)</span>
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
            {isPremium ? (
              <span className="inline-flex items-center gap-0.5 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                <FaCrown className="w-2 h-2" /> مميز
              </span>
            ) : (
              <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                مجاني
              </span>
            )}
            {/* تحذير انتهاء الاشتراك */}
            {isPremium && isExpired && !isAdminAccount && (
              <span className="inline-flex items-center gap-0.5 rounded-full border border-red-300 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600 animate-pulse">
                <FaClock className="w-2 h-2" /> منتهي
              </span>
            )}
            {isExpiringSoon && (
              <span className="inline-flex items-center gap-0.5 rounded-full border border-orange-300 bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-600">
                <FaClock className="w-2 h-2" /> قرب ينتهي
              </span>
            )}
          </div>

          {/* سهم التوسيع */}
          <FaChevronDown className={`w-3 h-3 text-slate-400 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>

        {/* زر تجديد سريع خارج زر التوسيع (للحسابات المنتهية فقط) */}
        {isPremium && isExpired && !isAdminAccount && !isAdmin && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!isExpanded) onToggleExpand();
              setDurationPicker('extend');
            }}
            className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-100"
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
                <FaEnvelope className="w-3 h-3 text-blue-500 shrink-0" />
                <span className="text-[11px] font-bold text-slate-400 shrink-0">البريد</span>
                <span className="text-xs font-bold text-slate-700 truncate mr-auto" dir="ltr">{doctor.doctorEmail}</span>
              </div>
            )}
            {doctor.doctorWhatsApp && (
              <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2.5">
                <FaWhatsapp className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="text-[11px] font-bold text-slate-400 shrink-0">واتساب</span>
                <span className="text-xs font-bold text-slate-700 mr-auto" dir="ltr">{doctor.doctorWhatsApp}</span>
              </div>
            )}
          </div>

          {/* ── اختيار نوع الحساب (أدمن = مميز مدى الحياة / غير أدمن = مجاني أو مميز) ── */}
          {isAdmin ? (
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3">
              <FaCrown className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-black text-amber-700">مميز مدى الحياة</span>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-100 bg-white p-3 space-y-2">
              <label className="block text-[11px] font-black text-slate-500">نوع الحساب</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { onUpdateAccountType(doctor.id, 'free'); setDurationPicker(null); }}
                  disabled={!isPremium}
                  className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                    !isPremium
                      ? 'border-2 border-slate-600 bg-slate-600 text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >مجاني</button>
                <button
                  type="button"
                  onClick={() => { if (!isPremium) setDurationPicker('new'); }}
                  disabled={isPremium}
                  className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                    isPremium
                      ? 'border-2 border-amber-500 bg-amber-500 text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                ><FaCrown className="w-3 h-3" /> مميز</button>
              </div>

              {/* اختيار مدة للاشتراك الجديد (بعد ما يختار "مميز") */}
              {durationPicker === 'new' && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 space-y-2">
                  <p className="text-[11px] font-black text-amber-700">اختر مدة الاشتراك المميز</p>
                  <div className="grid grid-cols-3 gap-2">
                    {DURATION_PRESETS.map((opt) => (
                      <button
                        key={opt.days}
                        type="button"
                        onClick={() => {
                          onUpdateAccountType(doctor.id, 'premium', opt.days);
                          setDurationPicker(null);
                        }}
                        disabled={actionInProgress}
                        className="rounded-xl border border-amber-300 bg-white px-3 py-2.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
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

          {/* ── تفاصيل الاشتراك المميز (للأطباء المميزين فقط) ── */}
          {isPremium && (
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
              <span className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] font-bold text-blue-700">
                <FaShieldHalved className="w-2.5 h-2.5" /> حساب أدمن — لا يمكن تعديله
              </span>
            ) : (
              <>
                {doctor.isAccountDisabled ? (
                  <button
                    onClick={() => onOpenActionModal({ type: 'enable', doctorId: doctor.id, doctorName: doctor.doctorName || 'طبيب', doctorEmail: doctor.doctorEmail || '' })}
                    disabled={actionInProgress}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed">
                    <FaCircleCheck className="w-3 h-3" /> تفعيل الحساب
                  </button>
                ) : (
                  <button
                    onClick={() => onOpenActionModal({ type: 'disable', doctorId: doctor.id, doctorName: doctor.doctorName || 'طبيب', doctorEmail: doctor.doctorEmail || '' })}
                    disabled={actionInProgress}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-[11px] font-bold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed">
                    <FaBan className="w-3 h-3" /> تعطيل الحساب
                  </button>
                )}
                <button
                  onClick={() => onOpenActionModal({ type: 'delete', doctorId: doctor.id, doctorName: doctor.doctorName || 'طبيب', doctorEmail: doctor.doctorEmail || '' })}
                  disabled={actionInProgress}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-[11px] font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed">
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
