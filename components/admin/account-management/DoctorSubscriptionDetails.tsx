// ─────────────────────────────────────────────────────────────────────────────
// قسم تفاصيل اشتراك برو (DoctorSubscriptionDetails)
// ─────────────────────────────────────────────────────────────────────────────
// الجزء الأكبر من كارد الطبيب — يعرض:
//   • تواريخ بداية ونهاية الاشتراك (مع الوقت)
//   • إجمالي المدة في نص قابل للقراءة
//   • الوقت المتبقي كشارات ملونة
//   • محررات الاشتراك (تعديل التواريخ / تمديد بمدة جاهزة)
//   • سجل تغييرات الاشتراك التاريخي
//
// مخصوص للاشتراكات المميزة فقط — الحسابات المجانية لا يظهر لها هذا القسم.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  FaCalendarDay,
  FaCheck,
  FaClock,
  FaClockRotateLeft,
  FaPen,
  FaPlus,
  FaXmark,
} from 'react-icons/fa6';
import { ApprovedDoctor, EditMode, SubscriptionUnit } from './types';
import { formatDuration } from './subscriptionUtils';
import { formatUserDate, formatUserTime } from '../../../utils/cairoTime';
import { CHANGE_TYPE_LABELS, DURATION_PRESETS } from './accountTableHelpers';

interface DoctorSubscriptionDetailsProps {
  doctor: ApprovedDoctor;
  isAdmin: boolean;
  actionInProgress: boolean;

  // بيانات التواريخ المحسوبة من الأب
  premiumStartDate: Date | null;
  expiryDate: Date | null;
  premiumStartIso: string;
  premiumEndIso: string;
  defaultStartDate: string;
  defaultEndDate: string;
  defaultStartTime: string;
  defaultEndTime: string;
  premiumExpiryMs: number | null;
  isExpired: boolean;
  remainingTimeParts: { key: string; value: number; label: string }[];

  // حالة التعديل
  isEditingThis: boolean;
  editMode: Record<string, EditMode>;
  editingStartDate: Record<string, string>;
  editingEndDate: Record<string, string>;
  editingStartTime: Record<string, string>;
  editingEndTime: Record<string, string>;
  durationPicker: 'new' | 'new-max' | 'extend' | null;

  // setters
  setEditingDurationId: React.Dispatch<React.SetStateAction<string>>;
  setEditingStartDate: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setEditingEndDate: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setEditingStartTime: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setEditingEndTime: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setEditMode: React.Dispatch<React.SetStateAction<Record<string, EditMode>>>;
  setDurationPicker: (value: 'new' | 'new-max' | 'extend' | null) => void;
  clearEditor: () => void;

  // الإجراءات
  onUpdateSubscriptionDates: (
    doctorId: string, newStartDate: string, newEndDate: string,
    newStartTime?: string, newEndTime?: string,
  ) => Promise<void>;
  onUpdateSubscriptionDuration: (doctorId: string, value: number, unit: SubscriptionUnit) => Promise<void>;
}

export const DoctorSubscriptionDetails: React.FC<DoctorSubscriptionDetailsProps> = ({
  doctor,
  isAdmin,
  actionInProgress,
  premiumStartDate, expiryDate,
  premiumStartIso, premiumEndIso,
  defaultStartDate, defaultEndDate, defaultStartTime, defaultEndTime,
  premiumExpiryMs, isExpired, remainingTimeParts,
  isEditingThis, editMode,
  editingStartDate, editingEndDate, editingStartTime, editingEndTime,
  durationPicker,
  setEditingDurationId,
  setEditingStartDate, setEditingEndDate, setEditingStartTime, setEditingEndTime,
  setEditMode,
  setDurationPicker,
  clearEditor,
  onUpdateSubscriptionDates, onUpdateSubscriptionDuration,
}) => {
  return (
    <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-3 space-y-3">
      <p className="text-[11px] font-black text-brand-700">تفاصيل اشتراك برو</p>

      {/* التواريخ: بداية ونهاية */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="flex items-center gap-2 rounded-lg border border-brand-100 bg-white px-3 py-2">
          <FaCalendarDay className="w-3 h-3 text-brand-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-400">البداية</p>
            {premiumStartDate ? (
              <p className="text-xs font-black text-slate-800">
                {formatUserDate(premiumStartDate, undefined, 'ar-EG')}
                <span className="text-slate-400 font-bold mr-1">
                  {formatUserTime(premiumStartDate, { hour: '2-digit', minute: '2-digit' }, 'ar-EG')}
                </span>
              </p>
            ) : <p className="text-xs text-slate-400">-</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-brand-100 bg-white px-3 py-2">
          <FaClock className="w-3 h-3 shrink-0" style={{ color: isExpired ? '#ef4444' : '#22c55e' }} />
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-400">النهاية</p>
            {expiryDate ? (
              <p className={`text-xs font-black ${isExpired ? 'text-danger-600' : 'text-success-700'}`}>
                {formatUserDate(expiryDate, undefined, 'ar-EG')}
                <span className="text-slate-400 font-bold mr-1">
                  {formatUserTime(expiryDate, { hour: '2-digit', minute: '2-digit' }, 'ar-EG')}
                </span>
              </p>
            ) : <p className="text-xs text-slate-400">-</p>}
          </div>
        </div>
      </div>

      {/* إجمالي المدة بصيغة قابلة للقراءة */}
      {premiumStartIso && premiumEndIso && (
        <div className="flex items-center gap-2 rounded-lg border border-brand-100 bg-white px-3 py-2">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">المدة:</span>
          <span className="text-xs font-black text-brand-700">{formatDuration(premiumStartIso, premiumEndIso)}</span>
        </div>
      )}

      {/* الوقت المتبقي كشارات ملونة */}
      {premiumExpiryMs !== null && (
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-[11px] font-bold text-slate-400">المتبقي:</span>
          {isExpired ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-danger-200 bg-danger-50 px-2.5 py-1 text-[10px] font-bold text-danger-600">
              <FaClock className="w-2.5 h-2.5" /> منتهي
            </span>
          ) : (
            remainingTimeParts.map((part) => (
              <span key={part.key} className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                {part.value} {part.label}
              </span>
            ))
          )}
        </div>
      )}

      {/* محررات الاشتراك (مخفية للأدمن — حسابه مدى الحياة) */}
      {!isAdmin && premiumStartIso && premiumEndIso && (
        <div className="space-y-2">
          {isEditingThis && editMode[doctor.id] === 'dates' ? (
            /* ── محرر التواريخ: 4 حقول ── */
            <div className="rounded-xl border border-brand-100 bg-white p-3 space-y-2">
              <p className="text-[11px] font-black text-brand-700">تعديل التواريخ</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">تاريخ البداية</label>
                  <input type="date" value={editingStartDate[doctor.id] || defaultStartDate}
                    onChange={(e) => setEditingStartDate((p) => ({ ...p, [doctor.id]: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-800" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">وقت البداية</label>
                  <input type="time" value={editingStartTime[doctor.id] || defaultStartTime}
                    onChange={(e) => setEditingStartTime((p) => ({ ...p, [doctor.id]: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-800" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">تاريخ النهاية</label>
                  <input type="date" value={editingEndDate[doctor.id] || defaultEndDate}
                    onChange={(e) => setEditingEndDate((p) => ({ ...p, [doctor.id]: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-800" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">وقت النهاية</label>
                  <input type="time" value={editingEndTime[doctor.id] || defaultEndTime}
                    onChange={(e) => setEditingEndTime((p) => ({ ...p, [doctor.id]: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-800" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => {
                  const sd = editingStartDate[doctor.id] || defaultStartDate;
                  const ed = editingEndDate[doctor.id] || defaultEndDate;
                  const st = editingStartTime[doctor.id] || defaultStartTime;
                  const et = editingEndTime[doctor.id] || defaultEndTime;
                  if (sd && ed) onUpdateSubscriptionDates(doctor.id, sd, ed, st, et);
                  else alert('يرجى ملء جميع الحقول');
                }}
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-success-600 px-3 py-2 text-xs font-bold text-white hover:bg-success-700 transition">
                  <FaCheck className="w-2.5 h-2.5" /> حفظ
                </button>
                <button onClick={clearEditor}
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition">
                  <FaXmark className="w-2.5 h-2.5" /> إلغاء
                </button>
              </div>
            </div>
          ) : durationPicker === 'extend' ? (
            /* ── تمديد بمدد جاهزة (شهر / 6 شهور / سنة) ── */
            <div className="rounded-xl border border-brand-100 bg-white p-3 space-y-2">
              <p className="text-[11px] font-black text-brand-700">تمديد الاشتراك</p>
              <div className="grid grid-cols-3 gap-2">
                {DURATION_PRESETS.map((opt) => (
                  <button
                    key={opt.days}
                    type="button"
                    onClick={() => {
                      onUpdateSubscriptionDuration(doctor.id, opt.days, 'day');
                      setDurationPicker(null);
                    }}
                    disabled={actionInProgress}
                    className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5 text-xs font-bold text-brand-700 transition hover:bg-brand-100 disabled:opacity-50"
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
          ) : (
            /* ── الحالة الافتراضية: زرين (تعديل التواريخ / تمديد) ── */
            <div className="flex gap-2">
              <button onClick={() => { setEditingDurationId(doctor.id); setEditMode((p) => ({ ...p, [doctor.id]: 'dates' })); }}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-[11px] font-bold text-brand-700 hover:bg-brand-100 transition">
                <FaPen className="w-2.5 h-2.5" /> تعديل التواريخ
              </button>
              <button onClick={() => setDurationPicker('extend')}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-[11px] font-bold text-brand-700 hover:bg-brand-100 transition">
                <FaPlus className="w-2.5 h-2.5" /> تمديد
              </button>
            </div>
          )}
        </div>
      )}

      {/* سجل تغييرات الاشتراك (آخر التعديلات والتمديدات) */}
      {doctor.subscriptionHistory && doctor.subscriptionHistory.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <FaClockRotateLeft className="w-2.5 h-2.5 text-slate-400" />
            <span className="text-[11px] font-black text-slate-500">سجل الاشتراكات ({doctor.subscriptionHistory.length})</span>
          </div>
          <div className="max-h-36 overflow-y-auto space-y-1.5 rounded-lg">
            {doctor.subscriptionHistory.map((period, index) => {
              const start = new Date(period.startDate);
              const end = new Date(period.endDate);
              const typeLabel = CHANGE_TYPE_LABELS[period.changeType || ''] || CHANGE_TYPE_LABELS[''];
              return (
                <div key={index} className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-[11px]">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="font-black text-slate-500">#{index + 1}</span>
                    <span className={`inline-flex rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${typeLabel.cls}`}>
                      {typeLabel.label}
                    </span>
                    <span className="text-slate-400">من</span>
                    <span className="font-bold text-brand-700">{formatUserDate(start, undefined, 'ar-EG')}</span>
                    <span className="text-slate-400">إلى</span>
                    <span className="font-bold text-brand-700">{formatUserDate(end, undefined, 'ar-EG')}</span>
                  </div>
                  {period.modifiedBy && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                      <span>بواسطة:</span>
                      <span className="font-bold text-slate-500" dir="ltr">{period.modifiedBy}</span>
                      {period.modifiedAt && (
                        <>
                          <span className="opacity-40">·</span>
                          <span>{formatUserDate(new Date(period.modifiedAt), undefined, 'ar-EG')}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
