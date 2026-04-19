/**
 * الملف: ReadyPrescriptionsModal.tsx
 * الوصف: يدير "الروشتات الجاهزة" (Templates) — قوالب علاجية لتشخيصات متكررة.
 * يسمح للأطباء بتطبيق قالب بضغطة مع اختيار "دمج" أو "استبدال" البيانات الحالية.
 *
 * بعد التقسيم:
 *   - `PresetEditor.tsx`          : محرر إضافة/تعديل قالب.
 *   - `PresetConfirmDialogs.tsx`  : نوافذ تأكيد الحذف والتطبيق.
 *   - `PresetListItem.tsx`        : بطاقة قالب واحدة في القائمة.
 *   - `usePresetSearch.ts`        : فرز وبحث القوالب.
 *   - `usePresetDraft.ts`         : مسودة التعديل + إدارة محرر البحث.
 *   - `usePresetApplyFlow.ts`     : تدفق التطبيق (دمج/استبدال).
 */

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ReadyPrescription, PrescriptionItem } from '../../types';
import { useMedicationSearch } from '../../hooks/medications';
import { Button } from '../ui/Button';
import { PresetEditor } from './ready-prescriptions/PresetEditor';
import {
  ApplyPresetDialog,
  DeletePresetDialog,
} from './ready-prescriptions/PresetConfirmDialogs';
import { PresetListItem } from './ready-prescriptions/PresetListItem';
import { usePresetSearch } from './ready-prescriptions/usePresetSearch';
import { usePresetDraft } from './ready-prescriptions/usePresetDraft';
import { usePresetApplyFlow } from './ready-prescriptions/usePresetApplyFlow';

interface ReadyPrescriptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** قائمة القوالب المحفوظة */
  presets: ReadyPrescription[];
  onApply: (
    preset: ReadyPrescription,
    options?: {
      medicationsMode?: 'merge' | 'replace';
      adviceMode?: 'merge' | 'replace';
      labsMode?: 'merge' | 'replace';
    },
  ) => void;
  onUpdate: (
    id: string,
    payload: {
      name: string;
      rxItems: PrescriptionItem[];
      generalAdvice: string[];
      labInvestigations: string[];
    },
  ) => Promise<boolean>;
  onCreate: (payload: {
    name: string;
    rxItems: PrescriptionItem[];
    generalAdvice: string[];
    labInvestigations: string[];
  }) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;

  /** البيانات الحالية في الروشتة (تستخدم للمقارنة عند الطلب Apply) */
  currentRxItems: PrescriptionItem[];
  currentGeneralAdvice: string[];
  currentLabInvestigations: string[];
}

export const ReadyPrescriptionsModal: React.FC<ReadyPrescriptionsModalProps> = ({
  isOpen,
  onClose,
  presets,
  onApply,
  onUpdate,
  onCreate,
  onDelete,
  currentRxItems,
  currentGeneralAdvice,
  currentLabInvestigations,
}) => {
  // ─── الحالات الرئيسية (عرض فقط) ─────────────────────────────────────
  const [expandedPresetId, setExpandedPresetId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<ReadyPrescription | null>(null);

  const { search } = useMedicationSearch();

  // فرز/بحث القوالب (hook)
  const { searchTerm, setSearchTerm, filteredPresets } = usePresetSearch(presets);

  // محرر المسودة (hook)
  const draft = usePresetDraft({ onCreate, onUpdate });

  // تدفق تطبيق القالب (hook)
  const applyFlow = usePresetApplyFlow({
    currentRxItems,
    currentGeneralAdvice,
    currentLabInvestigations,
    onApply,
  });

  // منع التمرير في الخلفية أثناء فتح النافذة
  useEffect(() => {
    if (!isOpen) return;
    const htmlEl = document.documentElement;
    const previousOverflow = document.body.style.overflow;
    const previousHtmlOverflow = htmlEl.style.overflow;
    document.body.style.overflow = 'hidden';
    htmlEl.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      htmlEl.style.overflow = previousHtmlOverflow;
    };
  }, [isOpen]);

  // إعادة ضبط الحالة عند إغلاق النافذة
  useEffect(() => {
    if (isOpen) return;
    setSearchTerm('');
    setExpandedPresetId(null);
    setDeleteCandidate(null);
    draft.handleClosePresetEditor();
    applyFlow.setApplyCandidate(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirmDelete = async (id: string) => {
    setDeletingId(id);
    if (await onDelete(id)) setDeleteCandidate(null);
    setDeletingId(null);
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-slate-900/45 backdrop-blur-md z-[10020] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="my-auto flex h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.45)]"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* رأس النافذة الرئيسية */}
        <div className="shrink-0 border-b border-slate-100 bg-gradient-to-r from-white via-slate-50 to-white p-4 sm:p-5">
          <div
            className={`flex items-center gap-2 ${
              draft.isEditorOpen ? 'justify-between' : 'justify-between flex-wrap lg:flex-nowrap'
            }`}
          >
            <div className="order-1 flex min-w-0 items-center gap-2">
              <h3 className="flex items-center gap-2 whitespace-nowrap text-lg font-black text-slate-800 sm:text-xl">
                <span className="h-6 w-1.5 rounded-full bg-blue-600"></span>
                الروشتات الجاهزة
              </h3>
              {!draft.isEditorOpen && (
                <Button
                  onClick={draft.handleStartCreateNew}
                  variant="info"
                  size="sm"
                  className="shrink-0 text-xs sm:text-sm"
                >
                  إضافة روشتة
                </Button>
              )}
            </div>
            <Button
              onClick={onClose}
              variant="danger"
              size="sm"
              className={`${
                draft.isEditorOpen ? 'order-last' : 'order-2 lg:order-3'
              } flex h-9 min-h-9 w-9 min-w-9 items-center justify-center px-0 text-xl leading-none font-black`}
            >
              ×
            </Button>
            {!draft.isEditorOpen && (
              <div className="order-3 relative w-full lg:order-2 lg:flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="بحث داخل الروشتات..."
                  className="w-full rounded-xl border border-slate-300 bg-white py-1.5 pr-8 pl-2 text-[11px] font-bold text-slate-700 focus:border-blue-400 focus:outline-none sm:text-xs"
                />
                <svg
                  className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-4.35-4.35m1.35-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* عرض القائمة الرئيسية للروشتات */}
        {!draft.isEditorOpen && (
          <div className="min-h-0 flex-1 overflow-y-auto bg-white p-3 sm:p-4">
            <div className="flex min-h-full flex-col gap-3">
              {filteredPresets.length === 0 && (
                <div className="flex min-h-full flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500 font-bold">
                  {searchTerm.trim()
                    ? 'لا توجد نتائج مطابقة للبحث داخل الروشتات.'
                    : 'لا توجد روشتات جاهزة محفوظة بعد.'}
                </div>
              )}
              {filteredPresets.map((preset) => (
                <PresetListItem
                  key={preset.id}
                  preset={preset}
                  isExpanded={expandedPresetId === preset.id}
                  deletingId={deletingId}
                  onToggleExpand={(id) =>
                    setExpandedPresetId((prev) => (prev === id ? null : id))
                  }
                  onOpenEditor={draft.handleOpenPreset}
                  onRequestDelete={setDeleteCandidate}
                  onStartApply={applyFlow.handleStartApplyPreset}
                />
              ))}
            </div>
          </div>
        )}

        {/* محرر الروشتة (تعديل أو إنشاء جديد) */}
        {draft.isEditorOpen && draft.contentDraft && (
          <PresetEditor
            contentDraft={draft.contentDraft}
            isCreatingNew={draft.isCreatingNew}
            savingContent={draft.savingContent}
            medSearchTerms={draft.medSearchTerms}
            activeMedicationSearchId={draft.activeMedicationSearchId}
            searchMedications={search}
            setContentDraft={draft.setContentDraft}
            setMedSearchTerms={draft.setMedSearchTerms}
            setActiveMedicationSearchId={draft.setActiveMedicationSearchId}
            onClose={draft.handleClosePresetEditor}
            onSave={draft.handleSaveContent}
            updateDraftRxItem={draft.updateDraftRxItem}
            insertNoteAfterLastMedication={draft.insertNoteAfterLastMedication}
            handleSelectMedicationForDraft={draft.handleSelectMedicationForDraft}
          />
        )}

        {/* نافذة تأكيد الحذف */}
        <DeletePresetDialog
          candidate={deleteCandidate}
          deletingId={deletingId}
          onCancel={() => setDeleteCandidate(null)}
          onConfirm={handleConfirmDelete}
        />

        {/* نافذة خيارات الإضافة (دمج أو استبدال) */}
        <ApplyPresetDialog
          candidate={applyFlow.applyCandidate}
          medicationsMode={applyFlow.medicationsMode}
          adviceMode={applyFlow.adviceMode}
          labsMode={applyFlow.labsMode}
          hasRealMedsState={applyFlow.hasRealMedsState}
          hasRealAdviceState={applyFlow.hasRealAdviceState}
          hasRealLabsState={applyFlow.hasRealLabsState}
          setMedicationsMode={applyFlow.setMedicationsMode}
          setAdviceMode={applyFlow.setAdviceMode}
          setLabsMode={applyFlow.setLabsMode}
          setAllApplyModes={applyFlow.setAllApplyModes}
          onCancel={() => applyFlow.setApplyCandidate(null)}
          onConfirm={applyFlow.confirmApply}
        />
      </div>
    </div>
  );

  if (typeof document === 'undefined') return modalContent;
  return createPortal(modalContent, document.body);
};
