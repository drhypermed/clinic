// ─────────────────────────────────────────────────────────────────────────────
// جدول إدارة الأطباء — عرض بطاقات قابلة للتوسيع (AccountManagementTable)
// ─────────────────────────────────────────────────────────────────────────────
// بعد التقسيم: الملف ده بقى مجرد غلاف:
//   - يعرض header بعدد النتائج
//   - لو في بيانات: يمرر كل طبيب لـ DoctorAccountCard
//   - لو مفيش بيانات: يعرض empty state
// كل منطق الكارد (حالة التوسيع، محررات الاشتراك، السجل) في DoctorAccountCard.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { FaStethoscope } from 'react-icons/fa6';
import { ActionModalState, ApprovedDoctor, AccountType, EditMode, SubscriptionUnit } from './types';
import { DoctorAccountCard } from './DoctorAccountCard';

interface AccountManagementTableProps {
  approvedDoctors: ApprovedDoctor[];
  /** الأطباء المعروضين في الصفحة الحالية (subset من الـfiltered) */
  filteredDoctors: ApprovedDoctor[];
  /** إجمالي عدد الأطباء بعد الفلترة (قبل الـpagination) — اختياري للـlabel فقط */
  totalFilteredCount?: number;
  isAdminDoctorEmail: (email?: string) => boolean;
  actionInProgress: Record<string, boolean>;

  // state التعديل — كلها مخزنة في المكون الأب (AccountManagementPanel)
  editingDurationId: string;
  editingStartDate: Record<string, string>;
  editingEndDate: Record<string, string>;
  editingStartTime: Record<string, string>;
  editingEndTime: Record<string, string>;
  editMode: Record<string, EditMode>;
  editingDurationValue: Record<string, number>;
  editingDurationUnit: Record<string, SubscriptionUnit>;
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

export const AccountManagementTable: React.FC<AccountManagementTableProps> = (props) => {
  const { approvedDoctors, filteredDoctors, totalFilteredCount, isAdminDoctorEmail, actionInProgress } = props;
  // عدد الفلتر الإجمالي (لو ما اتمررش، نستخدم filteredDoctors.length) — يتعرض في الـheader
  const totalAfterFilter = typeof totalFilteredCount === 'number' ? totalFilteredCount : filteredDoctors.length;

  // حالة التوسيع على مستوى الجدول (أي كاردات مفتوحة حالياً)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  /** toggle توسيع كارد طبيب معين. */
  const toggleExpand = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* ── Header: عدد النتائج + تلميح ── */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 bg-slate-50/60 border-b border-slate-100">
        <h3 className="text-xs sm:text-sm font-black text-slate-800">
          {/* لو في pagination (totalAfterFilter > filteredDoctors.length) يبان "X في الصفحة من Y المفلتر" */}
          {totalAfterFilter > filteredDoctors.length
            ? `عرض ${filteredDoctors.length.toLocaleString('ar-EG')} في هذه الصفحة (من ${totalAfterFilter.toLocaleString('ar-EG')} نتيجة)`
            : `عرض النتائج (${totalAfterFilter.toLocaleString('ar-EG')} من ${approvedDoctors.length.toLocaleString('ar-EG')})`}
        </h3>
        <p className="text-[10px] font-bold text-slate-400">اضغط على أي طبيب للتوسيع</p>
      </div>

      {filteredDoctors.length === 0 ? (
        /* ── Empty state: لما مفيش نتائج مطابقة للفلاتر ── */
        <div className="flex flex-col items-center justify-center py-14">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 mb-3">
            <FaStethoscope className="w-6 h-6 text-slate-200" />
          </div>
          <p className="text-sm font-bold text-slate-400">لا توجد نتائج مطابقة</p>
          <p className="text-[11px] text-slate-300 mt-1">جرب تغيير معايير البحث</p>
        </div>
      ) : (
        /* ── قائمة البطاقات ── */
        <div className="divide-y divide-slate-100">
          {filteredDoctors.map((doctor) => (
            <DoctorAccountCard
              key={doctor.id}
              doctor={doctor}
              isExpanded={expandedIds.has(doctor.id)}
              isAdmin={isAdminDoctorEmail(doctor.doctorEmail)}
              onToggleExpand={() => toggleExpand(doctor.id)}
              actionInProgress={!!actionInProgress[doctor.id]}
              // state التعديل (يُمرَّر مباشرة من props للكارد)
              editingDurationId={props.editingDurationId}
              editingStartDate={props.editingStartDate}
              editingEndDate={props.editingEndDate}
              editingStartTime={props.editingStartTime}
              editingEndTime={props.editingEndTime}
              editMode={props.editMode}
              setEditingDurationId={props.setEditingDurationId}
              setEditingStartDate={props.setEditingStartDate}
              setEditingEndDate={props.setEditingEndDate}
              setEditingStartTime={props.setEditingStartTime}
              setEditingEndTime={props.setEditingEndTime}
              setEditMode={props.setEditMode}
              setEditingDurationValue={props.setEditingDurationValue}
              setEditingDurationUnit={props.setEditingDurationUnit}
              // الإجراءات
              onOpenActionModal={props.onOpenActionModal}
              onUpdateAccountType={props.onUpdateAccountType}
              onUpdateSubscriptionDates={props.onUpdateSubscriptionDates}
              onUpdateSubscriptionDuration={props.onUpdateSubscriptionDuration}
            />
          ))}
        </div>
      )}
    </div>
  );
};
