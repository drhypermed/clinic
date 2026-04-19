/**
 * usePresetSearch:
 * hook للبحث والفرز داخل الروشتات الجاهزة:
 * - يرتب القوالب تنازلياً حسب تاريخ التحديث.
 * - يُكوّن نص البحث لكل قالب (اسم + أدوية + ملاحظات + تعليمات + فحوصات).
 * - يفلتر القائمة حسب نص البحث.
 */
import { useMemo, useState } from 'react';
import type { ReadyPrescription } from '../../../types';
import {
  extractDoctorFinalInstruction,
  normalizeReadyPrescriptionTextList,
  sanitizeReadyPrescriptionText,
} from '../../../utils/readyPrescriptionUtils';

/** استخلاص بيانات الأدوية من القالب للعرض */
export function getPresetMedicationEntries(preset: ReadyPrescription) {
  return (preset.rxItems || [])
    .filter((item) => item.type === 'medication')
    .map((item) => ({
      name: sanitizeReadyPrescriptionText(item.medication?.name),
      dosage: sanitizeReadyPrescriptionText(item.dosage),
      instructions: extractDoctorFinalInstruction(item),
    }))
    .filter((item) => item.name || item.dosage || item.instructions);
}

/** استخلاص الملاحظات من القالب */
export function getPresetNoteEntries(preset: ReadyPrescription): string[] {
  return (preset.rxItems || [])
    .filter((item) => item.type === 'note')
    .map((item) => sanitizeReadyPrescriptionText(item.instructions))
    .filter(Boolean);
}

/** بناء نص موحّد لكل قالب لاستخدامه في البحث النصي */
function buildPresetSearchCorpus(preset: ReadyPrescription): string {
  const parts: string[] = [sanitizeReadyPrescriptionText(preset.name)];

  (preset.rxItems || []).forEach((item) => {
    if (item.type === 'medication') {
      parts.push(sanitizeReadyPrescriptionText(item.medication?.name));
      parts.push(sanitizeReadyPrescriptionText(item.dosage));
      parts.push(extractDoctorFinalInstruction(item));
      return;
    }
    parts.push(sanitizeReadyPrescriptionText(item.instructions));
  });

  normalizeReadyPrescriptionTextList(preset.generalAdvice).forEach((line) => parts.push(line));
  normalizeReadyPrescriptionTextList(preset.labInvestigations).forEach((line) => parts.push(line));

  return parts.join(' ').toLowerCase();
}

export function usePresetSearch(presets: ReadyPrescription[]) {
  const [searchTerm, setSearchTerm] = useState('');

  // الترتيب التنازلي حسب updatedAt (أو createdAt كبديل) لإبراز الأحدث
  const sortedPresets = useMemo(() => {
    return [...presets].sort((a, b) => {
      const aa = (a.updatedAt || a.createdAt || '').toString();
      const bb = (b.updatedAt || b.createdAt || '').toString();
      return bb.localeCompare(aa);
    });
  }, [presets]);

  // الفلترة حسب نص البحث
  const filteredPresets = useMemo(() => {
    const term = sanitizeReadyPrescriptionText(searchTerm).toLowerCase();
    if (!term) return sortedPresets;
    return sortedPresets.filter((preset) => buildPresetSearchCorpus(preset).includes(term));
  }, [sortedPresets, searchTerm]);

  return { searchTerm, setSearchTerm, filteredPresets };
}
