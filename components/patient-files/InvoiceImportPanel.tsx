/**
 * InvoiceImportPanel — لوحة استيراد البنود من قسم التكاليف لفورم الفاتورة
 *
 * بتعرض بنود التكاليف+التأمين الموجودة في ملف المريض كقائمة قابلة للاختيار،
 * والطبيب يحدد اللي يحب يضيفها للفاتورة بضغطة. اللوحة بتدير حالتها بنفسها
 * (إظهار/إخفاء + تحديدات) عشان نخفف الـ props على المكوّن الأب.
 */

import React, { useMemo, useState } from 'react';
import type {
  PatientCostItem,
  PatientInsuranceItem,
} from '../../services/patientCostService';
import {
  buildImportableList,
  groupImportableByDate,
  formatImportDayLabel,
  type ImportableInvoiceItem,
} from './invoiceImportHelpers';

interface InvoiceImportPanelProps {
  /** بنود الكاش الموجودة في ملف المريض */
  costItems: PatientCostItem[];
  /** مطالبات التأمين الموجودة في ملف المريض */
  insuranceItems: PatientInsuranceItem[];
  /** المعرّفات اللي اتسحبت قبل كده — متخفي من القائمة عشان منكررش */
  importedIds: Set<string>;
  /** يُستدعى لما الطبيب يضغط "أضف للفاتورة" مع البنود المختارة */
  onAdd: (items: ImportableInvoiceItem[]) => void;
}

export const InvoiceImportPanel: React.FC<InvoiceImportPanelProps> = ({
  costItems,
  insuranceItems,
  importedIds,
  onAdd,
}) => {
  // الحالة الداخلية: مفتوحة/مقفولة + تحديدات الـcheckboxes
  const [showImportPanel, setShowImportPanel] = useState(false);
  const [selectedImportIds, setSelectedImportIds] = useState<Set<string>>(new Set());

  // البنود المتاحة للاستيراد (بعد إخفاء اللي اتسحبت)
  const importableItems = useMemo(() => {
    const all = buildImportableList(costItems, insuranceItems);
    return all.filter((item) => !importedIds.has(item.id));
  }, [costItems, insuranceItems, importedIds]);

  const importGroups = useMemo(() => groupImportableByDate(importableItems), [importableItems]);

  // toggle بند واحد
  const toggleImportItem = (id: string) => {
    setSelectedImportIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // toggle كل بنود يوم: لو الكل محدد → نلغي، وإلا نحدد الكل
  const toggleImportDay = (dateKey: string) => {
    const dayIds = importableItems.filter((i) => i.dateKey === dateKey).map((i) => i.id);
    const allSelected = dayIds.every((id) => selectedImportIds.has(id));
    setSelectedImportIds((prev) => {
      const next = new Set(prev);
      if (allSelected) dayIds.forEach((id) => next.delete(id));
      else dayIds.forEach((id) => next.add(id));
      return next;
    });
  };

  // إضافة المختار → يستدعي callback المكوّن الأب وينضّف الحالة
  const handleAddSelected = () => {
    if (selectedImportIds.size === 0) return;
    const picked = importableItems.filter((i) => selectedImportIds.has(i.id));
    onAdd(picked);
    setSelectedImportIds(new Set());
    setShowImportPanel(false);
  };

  // مفيش بنود تكاليف على الإطلاق → اللوحة كلها متخفية
  if (costItems.length === 0 && insuranceItems.length === 0) return null;

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2">
      <button
        type="button"
        onClick={() => {
          setShowImportPanel((v) => !v);
          if (!showImportPanel) setSelectedImportIds(new Set());
        }}
        className="inline-flex w-full items-center justify-between gap-1.5 rounded-md bg-white border border-emerald-300 px-2.5 py-1.5 text-[11px] font-black text-emerald-700 hover:bg-emerald-100"
      >
        <span>📥 استيراد من التكاليف المالية</span>
        <span className="text-[10px] text-emerald-600">
          {showImportPanel ? 'إخفاء' : `${importableItems.length} بند متاح`}
        </span>
      </button>

      {showImportPanel && (
        <div className="mt-2 space-y-2">
          {importableItems.length === 0 ? (
            <div className="py-2 text-center text-[10px] font-bold text-slate-400">
              كل البنود المتاحة اتضافت للفاتورة
            </div>
          ) : (
            <>
              {/* قائمة البنود مجمّعة بالأيام مع scroll لو طويلة */}
              <div className="max-h-56 overflow-y-auto rounded-md border border-emerald-100 bg-white p-1.5 space-y-2">
                {importGroups.map(([dateKey, dayItems]) => {
                  const allSelected = dayItems.every((i) => selectedImportIds.has(i.id));
                  return (
                    <div key={dateKey} className="rounded-md bg-slate-50 p-1.5">
                      {/* رأس اليوم — checkbox لاختيار كل اليوم دفعة واحدة */}
                      <label className="flex items-center gap-1.5 cursor-pointer pb-1 border-b border-slate-200">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={() => toggleImportDay(dateKey)}
                          className="h-3 w-3 accent-emerald-600"
                        />
                        <span className="text-[10px] font-black text-slate-600">
                          {formatImportDayLabel(dateKey)}
                        </span>
                        <span className="mr-auto text-[10px] font-bold text-slate-400">
                          {dayItems.length} بند
                        </span>
                      </label>
                      {/* بنود اليوم */}
                      {dayItems.map((item) => (
                        <label
                          key={item.id}
                          className="flex items-center gap-1.5 py-1 cursor-pointer hover:bg-white rounded px-1"
                        >
                          <input
                            type="checkbox"
                            checked={selectedImportIds.has(item.id)}
                            onChange={() => toggleImportItem(item.id)}
                            className="h-3 w-3 accent-emerald-600"
                          />
                          <span
                            className={`flex-1 truncate text-[11px] font-bold ${
                              item.kind === 'insurance' ? 'text-amber-700' : 'text-slate-700'
                            }`}
                          >
                            {item.label}
                          </span>
                          <span className="text-[11px] font-black text-slate-700" dir="ltr">
                            {item.amount.toLocaleString('ar-EG')} ج.م
                          </span>
                        </label>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* زر "أضف للفاتورة" */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black text-emerald-700">
                  {selectedImportIds.size > 0
                    ? `${selectedImportIds.size} بند مختار`
                    : 'حدد البنود اللي تحب تضيفها'}
                </span>
                <button
                  type="button"
                  onClick={handleAddSelected}
                  disabled={selectedImportIds.size === 0}
                  className={`rounded-md px-3 py-1 text-[11px] font-black text-white ${
                    selectedImportIds.size === 0
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  + أضف للفاتورة
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
