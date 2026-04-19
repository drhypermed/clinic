/**
 * usePresetDraft:
 * hook لإدارة مسودة تعديل/إنشاء قالب روشتة جاهزة:
 * - يفتح القالب في محرر مع نسخة منفصلة (deep clone) حتى لا يتأثر الأصلي.
 * - يدير حالات محرر البحث عن الدواء داخل الـ Rx.
 * - يوفّر دوال updateDraftRxItem و insertNoteAfterLastMedication.
 * - يحفظ عبر onCreate/onUpdate ثم يقفل المحرر.
 */
import { useState } from 'react';
import type { Medication, PrescriptionItem, ReadyPrescription } from '../../../types';
import {
  extractDoctorFinalInstruction,
  normalizeReadyPrescriptionTextList,
  sanitizeReadyPrescriptionText,
} from '../../../utils/readyPrescriptionUtils';

interface SavePayload {
  name: string;
  rxItems: PrescriptionItem[];
  generalAdvice: string[];
  labInvestigations: string[];
}

interface HookArgs {
  onCreate: (payload: SavePayload) => Promise<boolean>;
  onUpdate: (id: string, payload: SavePayload) => Promise<boolean>;
}

/** نسخة عميقة من القالب للتحرير دون التأثير على الأصل قبل الحفظ */
function clonePreset(preset: ReadyPrescription): ReadyPrescription {
  return {
    ...preset,
    rxItems: (preset.rxItems || []).map((item) => ({
      ...item,
      dosage:
        item.type === 'medication' ? sanitizeReadyPrescriptionText(item.dosage) : item.dosage,
      instructions:
        item.type === 'medication'
          ? extractDoctorFinalInstruction(item)
          : sanitizeReadyPrescriptionText(item.instructions),
      medication: item.medication ? { ...item.medication } : undefined,
      alternatives: Array.isArray(item.alternatives) ? [...item.alternatives] : [],
    })),
    generalAdvice: normalizeReadyPrescriptionTextList(preset.generalAdvice),
    labInvestigations: normalizeReadyPrescriptionTextList(preset.labInvestigations),
  };
}

export function usePresetDraft({ onCreate, onUpdate }: HookArgs) {
  const [openedPresetId, setOpenedPresetId] = useState<string | null>(null);
  const [contentDraft, setContentDraft] = useState<ReadyPrescription | null>(null);
  const [savingContent, setSavingContent] = useState(false);
  const [medSearchTerms, setMedSearchTerms] = useState<Record<string, string>>({});
  const [activeMedicationSearchId, setActiveMedicationSearchId] = useState<string | null>(null);

  const isCreatingNew = openedPresetId === 'new';
  const isEditorOpen = Boolean(openedPresetId && contentDraft);

  // فتح قالب موجود للتعديل
  const handleOpenPreset = (preset: ReadyPrescription) => {
    setOpenedPresetId(preset.id);
    setContentDraft(clonePreset(preset));
  };

  // إغلاق المحرر + إعادة الحالة الافتراضية
  const handleClosePresetEditor = () => {
    setOpenedPresetId(null);
    setContentDraft(null);
    setSavingContent(false);
    setMedSearchTerms({});
    setActiveMedicationSearchId(null);
  };

  // بدء إنشاء قالب جديد فارغ
  const handleStartCreateNew = () => {
    setOpenedPresetId('new');
    setContentDraft({
      id: 'new',
      name: 'روشتة جاهزة جديدة',
      rxItems: [],
      generalAdvice: [],
      labInvestigations: [],
    });
  };

  // تحديث بند محدد داخل rxItems بمساعدة دالة تحويل
  const updateDraftRxItem = (
    index: number,
    updater: (item: PrescriptionItem) => PrescriptionItem,
  ) => {
    setContentDraft((prev) => {
      if (!prev) return prev;
      const nextItems = [...prev.rxItems];
      nextItems[index] = updater(nextItems[index]);
      return { ...prev, rxItems: nextItems };
    });
  };

  // إدراج ملاحظة جديدة بعد آخر دواء (أو في النهاية إذا لا يوجد)
  const insertNoteAfterLastMedication = () => {
    setContentDraft((prev) => {
      if (!prev) return prev;
      const noteItem = {
        id: `manual-note-${Date.now()}`,
        type: 'note',
        instructions: '',
      } as PrescriptionItem;
      const nextItems = [...prev.rxItems];
      const lastMedicationIndex = nextItems
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => item.type === 'medication')
        .map(({ index }) => index)
        .pop();

      if (lastMedicationIndex === undefined) {
        nextItems.push(noteItem);
      } else {
        nextItems.splice(lastMedicationIndex + 1, 0, noteItem);
      }

      return { ...prev, rxItems: nextItems };
    });
  };

  // حفظ القالب (إنشاء جديد أو تحديث قائم)
  const handleSaveContent = async () => {
    if (!openedPresetId || !contentDraft) return;
    setSavingContent(true);
    try {
      const payload: SavePayload = {
        name: contentDraft.name,
        rxItems: contentDraft.rxItems,
        generalAdvice: contentDraft.generalAdvice,
        labInvestigations: contentDraft.labInvestigations,
      };
      const saved = isCreatingNew
        ? await onCreate(payload)
        : await onUpdate(openedPresetId, payload);
      if (saved) handleClosePresetEditor();
    } finally {
      setSavingContent(false);
    }
  };

  const getDraftItemKey = (item: PrescriptionItem, index: number) =>
    item.id || `idx-${index}`;

  // اختيار دواء من نتائج البحث داخل المحرر
  const handleSelectMedicationForDraft = (index: number, med: Medication) => {
    updateDraftRxItem(index, (current) => ({
      ...current,
      medication: med,
      dosage: '',
      instructions: '',
    }));
    const current = contentDraft?.rxItems?.[index];
    const key = getDraftItemKey(
      current || ({ id: `idx-${index}` } as PrescriptionItem),
      index,
    );
    setMedSearchTerms((prev) => ({ ...prev, [key]: med.name || '' }));
    setActiveMedicationSearchId(null);
  };

  return {
    openedPresetId,
    contentDraft,
    savingContent,
    medSearchTerms,
    activeMedicationSearchId,
    isCreatingNew,
    isEditorOpen,
    setContentDraft,
    setMedSearchTerms,
    setActiveMedicationSearchId,
    handleOpenPreset,
    handleClosePresetEditor,
    handleStartCreateNew,
    updateDraftRxItem,
    insertNoteAfterLastMedication,
    handleSaveContent,
    handleSelectMedicationForDraft,
  };
}
