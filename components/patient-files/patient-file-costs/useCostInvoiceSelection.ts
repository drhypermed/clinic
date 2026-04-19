/**
 * hook اختيار وطباعة الفاتورة (useCostInvoiceSelection):
 * - يجمع بنود الكاش + التأمين في قائمة موحدة ويرتبها حسب التاريخ.
 * - يدير تحديدات المستخدم (checkbox) لكل بند أو ليوم كامل.
 * - يبني الفاتورة النهائية ويبعتها لـ printPatientInvoice.
 */
import { useCallback, useMemo, useState } from 'react';
import type {
  PatientCostItem,
  PatientInsuranceItem,
} from '../../../services/patientCostService';
import type { PatientFileData } from '../patientFilesShared';
import type { PrescriptionSettings } from '../../../types';
import { printPatientInvoice } from '../invoicePrintUtils';

// ─── نوع البند الموحّد بعد الدمج ────────────────────────────────────────
export type UnifiedInvoiceItem = {
  id: string;
  kind: 'cash' | 'insurance';
  dateKey: string;
  label: string;
  amount: number;
};

interface HookArgs {
  costItems: PatientCostItem[];
  insuranceItems: PatientInsuranceItem[];
  patientFile: PatientFileData | null;
  rxSettings: PrescriptionSettings;
}

export function useCostInvoiceSelection({
  costItems,
  insuranceItems,
  patientFile,
  rxSettings,
}: HookArgs) {
  // مجموعتا المُعرّفات المختارة (واحدة للكاش، واحدة للتأمين)
  const [selectedCostIds, setSelectedCostIds] = useState<Set<string>>(new Set());
  const [selectedInsIds, setSelectedInsIds] = useState<Set<string>>(new Set());

  // دمج البنود في شكل موحّد + ترتيب تنازلي حسب التاريخ
  const allItems = useMemo<UnifiedInvoiceItem[]>(() => {
    const cash: UnifiedInvoiceItem[] = costItems.map((c) => ({
      id: c.id,
      kind: 'cash',
      dateKey: c.dateKey,
      label: c.note
        ? `${c.type === 'interventions' ? 'تداخل' : 'دخل آخر'} — ${c.note}`
        : c.type === 'interventions'
          ? 'تداخل'
          : 'دخل آخر',
      amount: c.amount,
    }));
    const ins: UnifiedInvoiceItem[] = insuranceItems.map((i) => ({
      id: i.id,
      kind: 'insurance',
      dateKey: i.dateKey,
      label: i.note ? `تأمين ${i.companyName} — ${i.note}` : `تأمين ${i.companyName}`,
      amount: i.amount,
    }));
    return [...cash, ...ins].sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }, [costItems, insuranceItems]);

  // تجميع البنود حسب التاريخ (Map مرتّب تنازليًا)
  const dateGroups = useMemo(() => {
    const map = new Map<string, UnifiedInvoiceItem[]>();
    for (const item of allItems) {
      const arr = map.get(item.dateKey) || [];
      arr.push(item);
      map.set(item.dateKey, arr);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [allItems]);

  // تبديل اختيار بند واحد
  const toggleItem = useCallback((id: string, kind: 'cash' | 'insurance') => {
    const setter = kind === 'cash' ? setSelectedCostIds : setSelectedInsIds;
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // تبديل اختيار كل بنود يوم معيّن (select all/deselect all)
  const toggleDay = useCallback(
    (dateKey: string) => {
      const dayItems = allItems.filter((i) => i.dateKey === dateKey);
      const allSelected = dayItems.every((i) =>
        (i.kind === 'cash' ? selectedCostIds : selectedInsIds).has(i.id),
      );
      const cashIds = dayItems.filter((i) => i.kind === 'cash').map((i) => i.id);
      const insIds = dayItems.filter((i) => i.kind === 'insurance').map((i) => i.id);
      if (allSelected) {
        // إلغاء تحديد كل بنود اليوم
        setSelectedCostIds((prev) => {
          const n = new Set(prev);
          cashIds.forEach((id) => n.delete(id));
          return n;
        });
        setSelectedInsIds((prev) => {
          const n = new Set(prev);
          insIds.forEach((id) => n.delete(id));
          return n;
        });
      } else {
        // تحديد كل بنود اليوم
        setSelectedCostIds((prev) => {
          const n = new Set(prev);
          cashIds.forEach((id) => n.add(id));
          return n;
        });
        setSelectedInsIds((prev) => {
          const n = new Set(prev);
          insIds.forEach((id) => n.add(id));
          return n;
        });
      }
    },
    [allItems, selectedCostIds, selectedInsIds],
  );

  // عدد البنود المختارة إجمالاً
  const selectedCount = selectedCostIds.size + selectedInsIds.size;

  // إعادة تهيئة كل التحديدات (تُستدعى عند فتح/إغلاق لوحة الفاتورة)
  const resetSelections = useCallback(() => {
    setSelectedCostIds(new Set());
    setSelectedInsIds(new Set());
  }, []);

  // طباعة الفاتورة للبنود المختارة فقط
  const handlePrintCostsInvoice = useCallback(() => {
    if (!patientFile || selectedCount === 0) return;
    const items = allItems
      .filter((i) => (i.kind === 'cash' ? selectedCostIds : selectedInsIds).has(i.id))
      .map((i) => ({ description: i.label, amount: i.amount }));
    printPatientInvoice(
      {
        patientName: patientFile.name || 'مريض',
        patientFileNumber: patientFile.fileNumber,
        patientPhone: patientFile.phones?.[0],
        items,
        discount: 0,
      },
      rxSettings,
    );
  }, [patientFile, allItems, selectedCostIds, selectedInsIds, selectedCount, rxSettings]);

  return {
    allItems,
    dateGroups,
    selectedCostIds,
    selectedInsIds,
    selectedCount,
    toggleItem,
    toggleDay,
    resetSelections,
    handlePrintCostsInvoice,
  };
}

// ─── تنسيق تسمية اليوم (للعرض في الـ header) ──────────────────────────
export function formatDayLabel(dateKey: string): string {
  try {
    const d = new Date(dateKey + 'T00:00:00');
    return d.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      timeZone: 'Africa/Cairo',
    });
  } catch {
    return dateKey;
  }
}
