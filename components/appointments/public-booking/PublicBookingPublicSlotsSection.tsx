import React from 'react';
import { LoadingText } from '../../ui/LoadingText';
import type { Branch, PublicBookingSlot } from '../../../types';

type PublicBookingPublicSlotsSectionProps = {
  publicSectionOpen: boolean;
  onToggleOpen: () => void;
  publicBookingLink: string | null;
  publicLinkCopied: boolean;
  onCopyPublicBookingLink: () => void;
  publicSlotDateStr: string;
  publicSlotTodayStr: string;
  onPublicSlotDateChange: (value: string) => void;
  publicSlotTimeStr: string;
  publicTimeMin: string | undefined;
  onPublicSlotTimeChange: (value: string) => void;
  branches: Branch[];
  currentBranchId: string;
  publicFormTitle: string;
  onPublicFormTitleChange: (value: string) => void;
  publicFormContactInfo: string;
  onPublicFormContactInfoChange: (value: string) => void;
  publicFormSaving: boolean;
  publicSettingsSaved: boolean;
  onSavePublicFormSettings: (e: React.FormEvent) => void;
  onAddPublicSlot: (e: React.FormEvent) => void;
  publicSecret: string | null;
  publicSlotAdding: boolean;
  publicSlotError: string | null;
  publicSlotsLoading: boolean;
  publicSlots: PublicBookingSlot[];
  onRemovePublicSlot: (slotId: string) => void;
  editingPublicSlotId: string | null;
  editingPublicSlotDateStr: string;
  onEditingPublicSlotDateChange: (value: string) => void;
  editingPublicSlotTimeStr: string;
  onEditingPublicSlotTimeChange: (value: string) => void;
  publicSlotUpdating: boolean;
  onStartEditPublicSlot: (slot: PublicBookingSlot) => void;
  onCancelEditPublicSlot: () => void;
  onSaveEditedPublicSlot: (e: React.FormEvent) => void;
  formatSlotLabel: (dateTime: string) => string;
};

const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="mb-1.5 block text-xs font-black text-slate-600">{children}</label>
);

const IconButton: React.FC<{
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'slate' | 'danger';
  children: React.ReactNode;
}> = ({ label, onClick, disabled, tone = 'slate', children }) => {
  const toneClass =
    tone === 'danger'
      ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50';
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${toneClass}`}
    >
      {children}
    </button>
  );
};

export const PublicBookingPublicSlotsSection: React.FC<PublicBookingPublicSlotsSectionProps> = ({
  publicSectionOpen,
  onToggleOpen,
  publicBookingLink,
  publicLinkCopied,
  onCopyPublicBookingLink,
  publicSlotDateStr,
  publicSlotTodayStr,
  onPublicSlotDateChange,
  publicSlotTimeStr,
  publicTimeMin,
  onPublicSlotTimeChange,
  branches,
  currentBranchId,
  publicFormTitle,
  onPublicFormTitleChange,
  publicFormContactInfo,
  onPublicFormContactInfoChange,
  publicFormSaving,
  publicSettingsSaved,
  onSavePublicFormSettings,
  onAddPublicSlot,
  publicSecret,
  publicSlotAdding,
  publicSlotError,
  publicSlotsLoading,
  publicSlots,
  onRemovePublicSlot,
  editingPublicSlotId,
  editingPublicSlotDateStr,
  onEditingPublicSlotDateChange,
  editingPublicSlotTimeStr,
  onEditingPublicSlotTimeChange,
  publicSlotUpdating,
  onStartEditPublicSlot,
  onCancelEditPublicSlot,
  onSaveEditedPublicSlot,
  formatSlotLabel,
}) => {
  const currentBranchName =
    branches.find((branch) => branch.id === currentBranchId)?.name ||
    (currentBranchId === 'main' ? 'الفرع الرئيسي' : currentBranchId);

  if (!publicSectionOpen) {
    return (
      <button
        type="button"
        onClick={onToggleOpen}
        className="w-full rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-right text-sm font-black text-warning-800"
      >
        فورم الجمهور
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 sm:px-5">
          <p className="text-sm font-black text-slate-900">رابط فورم الجمهور</p>
        </div>
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
          <p className="min-w-0 flex-1 break-all text-left text-xs font-bold leading-6 text-slate-500" dir="ltr">
            {publicBookingLink ?? 'جاري تجهيز الرابط'}
          </p>
          <button
            type="button"
            onClick={onCopyPublicBookingLink}
            disabled={!publicBookingLink}
            className="h-10 shrink-0 rounded-lg bg-slate-900 px-4 text-sm font-black text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {publicLinkCopied ? 'تم النسخ' : 'نسخ الرابط'}
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-sky-200 bg-gradient-to-l from-sky-50 via-white to-emerald-50 p-4 shadow-sm sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h18M5 21V7l8-4v18M19 21V10l-6-3M9 9h1m-1 4h1m-1 4h1m5-6h1m-1 4h1" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="break-words text-base font-black leading-7 text-slate-950">
              أنت دلوقتي بتدير مواعيد فرع: <span className="text-sky-800">{currentBranchName}</span>
            </p>
            <p className="mt-1 break-words text-sm font-bold leading-7 text-slate-600">
              أي موعد هتضيفه دلوقتي هيتحفظ على هذا الفرع فقط. لتغيير الفرع، استخدم قائمة الفروع في أعلى التطبيق.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <form onSubmit={onSavePublicFormSettings} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <FieldLabel>عنوان الفورم</FieldLabel>
              <textarea
                value={publicFormTitle}
                onChange={(e) => onPublicFormTitleChange(e.target.value)}
                rows={2}
                className="min-h-20 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold leading-6 text-slate-800 outline-none transition-colors focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
              />
            </div>
            <div>
              <FieldLabel>أرقام التواصل أو العنوان التفصيلي</FieldLabel>
              <textarea
                value={publicFormContactInfo}
                onChange={(e) => onPublicFormContactInfoChange(e.target.value)}
                rows={2}
                className="min-h-20 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold leading-6 text-slate-800 outline-none transition-colors focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={publicFormSaving || !publicSecret}
              className="h-10 rounded-lg bg-sky-700 px-4 text-sm font-black text-white transition-colors hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {publicFormSaving ? 'جاري الحفظ' : 'حفظ بيانات الفورم'}
            </button>
            {publicSettingsSaved && <span className="text-sm font-black text-emerald-700">تم الحفظ</span>}
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <form onSubmit={onAddPublicSlot} className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
          <div>
            <FieldLabel>التاريخ</FieldLabel>
            <input
              type="date"
              value={publicSlotDateStr}
              min={publicSlotTodayStr}
              onChange={(e) => onPublicSlotDateChange(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-800 outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
          </div>
          <div>
            <FieldLabel>الساعة</FieldLabel>
            <input
              type="time"
              value={publicSlotTimeStr}
              min={publicTimeMin}
              onChange={(e) => onPublicSlotTimeChange(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-800 outline-none focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
          </div>
          <button
            type="submit"
            disabled={!publicSecret || publicSlotAdding || !publicSlotDateStr || !publicSlotTimeStr}
            className="h-11 rounded-xl bg-emerald-700 px-5 text-sm font-black text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {publicSlotAdding ? 'جاري الإضافة' : 'إضافة موعد'}
          </button>
        </form>

        {publicSlotError && (
          <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-bold leading-6 text-red-700">
            {publicSlotError}
          </p>
        )}

        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-black text-slate-900">المواعيد المتاحة</p>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{publicSlots.length}</span>
          </div>
          {publicSlotsLoading ? (
            <p className="text-sm font-bold text-slate-500"><LoadingText>جاري تحميل المواعيد</LoadingText></p>
          ) : publicSlots.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm font-bold text-slate-500">
              لا توجد مواعيد متاحة حاليا.
            </p>
          ) : (
            <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {publicSlots.map((slot) => {
                const isEditing = editingPublicSlotId === slot.id;
                return (
                  <li key={slot.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    {isEditing ? (
                      <form onSubmit={onSaveEditedPublicSlot} className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] sm:items-end">
                        <input
                          type="date"
                          value={editingPublicSlotDateStr}
                          min={publicSlotTodayStr}
                          onChange={(e) => onEditingPublicSlotDateChange(e.target.value)}
                          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                        />
                        <input
                          type="time"
                          value={editingPublicSlotTimeStr}
                          min={editingPublicSlotDateStr === publicSlotTodayStr ? publicTimeMin : undefined}
                          onChange={(e) => onEditingPublicSlotTimeChange(e.target.value)}
                          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                        />
                        <button
                          type="submit"
                          disabled={publicSlotUpdating}
                          className="h-10 rounded-lg bg-sky-700 px-4 text-sm font-black text-white hover:bg-sky-800 disabled:opacity-50"
                        >
                          {publicSlotUpdating ? 'حفظ...' : 'حفظ'}
                        </button>
                        <button
                          type="button"
                          onClick={onCancelEditPublicSlot}
                          disabled={publicSlotUpdating}
                          className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          إلغاء
                        </button>
                      </form>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="break-words text-sm font-black leading-6 text-slate-800">{formatSlotLabel(slot.dateTime)}</p>
                        </div>
                        <IconButton label="تعديل" onClick={() => onStartEditPublicSlot(slot)}>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                          </svg>
                        </IconButton>
                        <IconButton label="حذف" onClick={() => onRemovePublicSlot(slot.id)} tone="danger">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166M18.16 19.673A2.25 2.25 0 0 1 15.916 21H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0A48.108 48.108 0 0 0 16.5 5.4m-9 0a48.11 48.11 0 0 0-2.728.39m12.728-.39L16.5 4.5A2.25 2.25 0 0 0 14.25 3h-4.5A2.25 2.25 0 0 0 7.5 4.5L7.5 5.4" />
                          </svg>
                        </IconButton>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};
