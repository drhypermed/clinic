/**
 * PresetListItem:
 * بطاقة عرض قالب روشتة واحدة في القائمة — مع:
 * - رأس + شارات الإحصائيات (أدوية/ملاحظات/فحوصات/تعليمات).
 * - زر عرض/إخفاء التفاصيل.
 * - أزرار تعديل/حذف/إضافة للروشتة الحالية.
 */
import React from 'react';
import type { ReadyPrescription } from '../../../types';
import { Button } from '../../ui/Button';
import {
  normalizeReadyPrescriptionTextList,
  sanitizeReadyPrescriptionText,
} from '../../../utils/readyPrescriptionUtils';
import { getPresetMedicationEntries, getPresetNoteEntries } from './usePresetSearch';

interface Props {
  preset: ReadyPrescription;
  isExpanded: boolean;
  deletingId: string | null;
  onToggleExpand: (id: string) => void;
  onOpenEditor: (preset: ReadyPrescription) => void;
  onRequestDelete: (preset: ReadyPrescription) => void;
  onStartApply: (preset: ReadyPrescription) => void;
}

export const PresetListItem: React.FC<Props> = ({
  preset,
  isExpanded,
  deletingId,
  onToggleExpand,
  onOpenEditor,
  onRequestDelete,
  onStartApply,
}) => {
  const medicationEntries = getPresetMedicationEntries(preset);
  const noteEntries = getPresetNoteEntries(preset);
  const adviceEntries = normalizeReadyPrescriptionTextList(preset.generalAdvice);
  const labEntries = normalizeReadyPrescriptionTextList(preset.labInvestigations);

  // شارات الإحصائيات — لا تظهر إلا للأقسام غير الفارغة
  const summaryChips = [
    { key: 'medications', label: 'أدوية', count: medicationEntries.length },
    { key: 'notes', label: 'ملاحظات', count: noteEntries.length },
    { key: 'labs', label: 'فحوصات', count: labEntries.length },
    { key: 'advice', label: 'تعليمات', count: adviceEntries.length },
  ].filter((chip) => chip.count > 0);

  return (
    <div
      className={`relative overflow-hidden bg-white border rounded-2xl p-3 sm:p-4 transition-all ${
        isExpanded
          ? 'border-slate-300 shadow-md ring-2 ring-slate-100'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-400"></div>
      <div className="mb-3 mt-1">
        <h4 className="font-black text-slate-800 text-sm sm:text-base break-words text-center">
          {preset.name}
        </h4>
      </div>

      {summaryChips.length > 0 && (
        <div className="mb-3 ml-auto flex w-fit max-w-full flex-wrap items-center justify-end gap-2">
          {summaryChips.map((chip) => (
            <span
              key={`${preset.id}-${chip.key}`}
              className="rounded-full border border-blue-700 bg-blue-600 px-3 py-1.5 text-xs font-black text-white shadow-sm md:px-4 md:py-2 md:text-sm"
            >
              {chip.label}: {chip.count}
            </span>
          ))}
        </div>
      )}

      <div className="mb-3 ml-auto flex w-fit max-w-full flex-wrap items-center gap-2">
        <Button
          onClick={() => onToggleExpand(preset.id)}
          variant="primary"
          size="sm"
          className="text-xs"
        >
          {isExpanded ? 'إخفاء تفاصيل الروشتة' : 'عرض تفاصيل الروشتة'}
        </Button>
        <Button onClick={() => onOpenEditor(preset)} variant="info" size="sm" className="text-xs">
          تعديل
        </Button>
        <Button
          onClick={() => onRequestDelete(preset)}
          disabled={deletingId === preset.id}
          variant="danger"
          size="sm"
          className="text-xs"
        >
          {deletingId === preset.id ? '...' : 'حذف'}
        </Button>
      </div>

      {isExpanded && (
        <div className="relative overflow-hidden mb-3 rounded-2xl border border-slate-200 bg-white p-2 sm:p-3 space-y-3 max-h-52 sm:max-h-64 overflow-y-auto custom-scrollbar">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500"></div>
          <div className="space-y-1.5">
            <div className="text-[11px] sm:text-xs font-black text-slate-700">
              الأدوية (الجرعة + التعليمات)
            </div>
            {medicationEntries.length === 0 && (
              <div className="text-[11px] sm:text-xs font-bold text-slate-400">لا توجد أدوية</div>
            )}
            {medicationEntries.map((med, index) => (
              <div
                key={`${preset.id}-med-${index}`}
                className="rounded-xl border border-slate-200 bg-white p-2"
              >
                <div className="text-[11px] sm:text-xs font-black text-slate-800 break-words">
                  {med.name || 'دواء بدون اسم'}
                </div>
                <div className="mt-1 text-[10px] sm:text-[11px] text-slate-600 break-words">
                  <span className="font-black text-slate-700">الجرعة والتعليمات:</span>{' '}
                  {sanitizeReadyPrescriptionText(med.instructions || med.dosage) || 'غير محددة'}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] sm:text-xs font-black text-slate-700">الملاحظات</div>
            {noteEntries.length === 0 && (
              <div className="text-[11px] sm:text-xs font-bold text-slate-400">لا توجد ملاحظات</div>
            )}
            {noteEntries.map((note, index) => (
              <div
                key={`${preset.id}-note-${index}`}
                className="text-[10px] sm:text-[11px] font-bold text-slate-600 break-words"
              >
                • {note}
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] sm:text-xs font-black text-slate-700">الفحوصات</div>
            {labEntries.length === 0 && (
              <div className="text-[11px] sm:text-xs font-bold text-slate-400">لا توجد فحوصات</div>
            )}
            {labEntries.map((lab, index) => (
              <div
                key={`${preset.id}-lab-${index}`}
                className="text-[10px] sm:text-[11px] font-bold text-slate-600 break-words"
              >
                • {lab}
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] sm:text-xs font-black text-slate-700">التعليمات الهامة</div>
            {adviceEntries.length === 0 && (
              <div className="text-[11px] sm:text-xs font-bold text-slate-400">
                لا توجد تعليمات هامة
              </div>
            )}
            {adviceEntries.map((advice, index) => (
              <div
                key={`${preset.id}-advice-${index}`}
                className="text-[10px] sm:text-[11px] font-bold text-slate-600 break-words"
              >
                • {advice}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={() => onStartApply(preset)}
          variant="primary"
          size="sm"
          className="text-xs sm:text-sm"
        >
          إضافة للروشتة الحالية
        </Button>
      </div>
    </div>
  );
};
