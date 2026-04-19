import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LoadingText } from '../ui/LoadingText';
import type { PatientFileData } from './patientFilesShared';
import { useAuth } from '../../hooks/useAuth';
import { usePrescriptionSettings } from '../../hooks/usePrescriptionSettings';
import { printPatientInvoice } from './invoicePrintUtils';
import {
  type InvoiceLineItem,
  type PatientInvoice,
  addInvoice,
  deleteInvoice,
  loadPatientFileInvoices,
  subscribeToPatientFileInvoices,
  syncInvoicesToFirestore,
} from '../../services/patientInvoiceService';

// ─── helpers ──────────────────────────────────────────────────────────────────

const getTodayDateKey = (): string =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' });

const uid = () => `li_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// ─── Component ────────────────────────────────────────────────────────────────

interface PatientFileInvoiceSectionProps {
  patientFile: PatientFileData | null;
  /** الفرع النشط — يُسجَّل على كل فاتورة جديدة للعزل بين الفروع. */
  activeBranchId?: string;
}

export const PatientFileInvoiceSection: React.FC<PatientFileInvoiceSectionProps> = ({
  patientFile,
  activeBranchId,
}) => {
  const { user } = useAuth();
  const userId = user?.uid;
  const { settings: rxSettings } = usePrescriptionSettings(userId || null);

  const [isOpen, setIsOpen] = useState(false);
  const [invoices, setInvoices] = useState<PatientInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── New invoice form state ──────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [formItems, setFormItems] = useState<InvoiceLineItem[]>([
    { id: uid(), description: '', amount: 0 },
  ]);
  const [formDiscount, setFormDiscount] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formDate, setFormDate] = useState<string>(getTodayDateKey);

  // ─── Reset on file change ────────────────────────────────────────────────
  useEffect(() => {
    setIsOpen(false);
    setInvoices([]);
    setError(null);
    resetForm();
  }, [patientFile?.fileId]);

  // ─── Firestore subscription ──────────────────────────────────────────────
  const didReceiveFirstSnapshotRef = useRef(false);
  useEffect(() => {
    if (!isOpen || !userId || !patientFile?.fileId) return;
    const fileId = patientFile.fileId;
    setIsLoading(true);
    didReceiveFirstSnapshotRef.current = false;

    const safetyTimer = setTimeout(() => {
      if (!didReceiveFirstSnapshotRef.current) {
        didReceiveFirstSnapshotRef.current = true;
        setInvoices(loadPatientFileInvoices(fileId));
        setIsLoading(false);
      }
    }, 5000);

    const unsubscribe = subscribeToPatientFileInvoices(userId, fileId, (firestoreInvoices) => {
      clearTimeout(safetyTimer);
      if (!didReceiveFirstSnapshotRef.current) {
        didReceiveFirstSnapshotRef.current = true;
        setIsLoading(false);
        if (firestoreInvoices.length === 0) {
          const local = loadPatientFileInvoices(fileId);
          if (local.length > 0) {
            setInvoices(local);
            syncInvoicesToFirestore(userId, fileId, local).catch(console.error);
            return;
          }
        }
      }
      setInvoices(firestoreInvoices);
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, [isOpen, userId, patientFile?.fileId]);

  // ─── Form helpers ────────────────────────────────────────────────────────
  const resetForm = () => {
    setShowForm(false);
    setFormItems([{ id: uid(), description: '', amount: 0 }]);
    setFormDiscount('');
    setFormNotes('');
    setFormDate(getTodayDateKey());
    setError(null);
  };

  const addFormItem = () => {
    setFormItems(prev => [...prev, { id: uid(), description: '', amount: 0 }]);
  };

  const updateFormItem = (id: string, field: 'description' | 'amount', value: string) => {
    setFormItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, [field]: field === 'amount' ? parseFloat(value) || 0 : value }
          : item,
      ),
    );
  };

  const removeFormItem = (id: string) => {
    setFormItems(prev => (prev.length <= 1 ? prev : prev.filter(item => item.id !== id)));
  };

  const formSubtotal = formItems.reduce((s, i) => s + (i.amount || 0), 0);
  const formDiscountNum = parseFloat(formDiscount) || 0;
  const formTotal = Math.max(0, formSubtotal - formDiscountNum);

  // ─── Save invoice ────────────────────────────────────────────────────────
  const handleSaveInvoice = useCallback(
    (andPrint: boolean) => {
      if (!patientFile?.fileId) return;

      const validItems = formItems.filter(i => i.description.trim() && i.amount > 0);
      if (validItems.length === 0) {
        setError('يرجى إضافة بند واحد على الأقل بوصف ومبلغ.');
        return;
      }

      const invoice = addInvoice(patientFile.fileId, patientFile.name || 'مريض', {
        patientPhone: patientFile.phones?.[0],
        patientFileNumber: patientFile.fileNumber,
        items: validItems,
        discount: formDiscountNum,
        notes: formNotes.trim() || undefined,
        dateKey: formDate,
        branchId: activeBranchId,
      });

      const updated = loadPatientFileInvoices(patientFile.fileId);
      setInvoices(updated);

      if (userId) {
        syncInvoicesToFirestore(userId, patientFile.fileId, updated).catch(console.error);
      }

      if (andPrint) {
        printInvoice(invoice);
      }

      resetForm();
    },
    [patientFile, formItems, formDiscountNum, formNotes, formDate, userId, activeBranchId],
  );

  // ─── Delete invoice ──────────────────────────────────────────────────────
  const handleDeleteInvoice = (invoiceId: string) => {
    if (!patientFile?.fileId) return;
    deleteInvoice(patientFile.fileId, invoiceId);
    const updated = loadPatientFileInvoices(patientFile.fileId);
    setInvoices(updated);
    if (userId) {
      syncInvoicesToFirestore(userId, patientFile.fileId, updated).catch(console.error);
    }
  };

  // ─── Print invoice (shared utility) ──────────────────────────────────────
  const printInvoice = useCallback(
    (invoice: PatientInvoice) => {
      const invNum = String(invoice.invoiceNumber).padStart(6, '0');
      printPatientInvoice(
        {
          patientName: invoice.patientName,
          patientFileNumber: invoice.patientFileNumber,
          patientPhone: invoice.patientPhone,
          items: invoice.items.map(i => ({ description: i.description, amount: i.amount })),
          discount: invoice.discount,
          notes: invoice.notes,
          invoiceNumberLabel: `INV-${invNum}`,
          timestamp: invoice.createdAt,
        },
        rxSettings,
      );
    },
    [rxSettings],
  );

  if (!patientFile) return null;

  return (
    <div className="dh-day-shell rounded-2xl border overflow-hidden">
      {/* Header */}
      <div className="dh-day-head px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-sm font-black text-white">الفواتير</div>
            <div className="text-[11px] font-medium text-blue-100 mt-0.5">
              إصدار وطباعة فواتير للمريض
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(v => !v)}
            className="shrink-0 rounded-xl border border-white/40 bg-white/15 px-3 py-2 text-xs font-black text-white transition-colors hover:bg-white/25"
          >
            {isOpen ? 'إغلاق' : 'عرض / إصدار'}
          </button>
        </div>
        {invoices.length > 0 && !isOpen && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center bg-white/20 border border-white/30 text-white rounded-full px-2.5 py-0.5 text-[11px] font-black">
              {invoices.length} فاتورة
            </span>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="bg-white px-3 py-3 space-y-3">
          {isLoading && (
            <div className="py-4 text-center text-xs text-slate-400 font-black">
              <LoadingText>جاري تحميل الفواتير</LoadingText>
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-black text-rose-700">
              {error}
            </div>
          )}

          {/* New invoice button */}
          <button
            type="button"
            onClick={() => {
              setShowForm(v => !v);
              setError(null);
              if (!showForm) {
                setFormItems([{ id: uid(), description: '', amount: 0 }]);
                setFormDiscount('');
                setFormNotes('');
                setFormDate(getTodayDateKey());
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-black text-white hover:bg-indigo-700"
          >
            {showForm ? 'إلغاء الفاتورة الجديدة' : '+ إصدار فاتورة جديدة'}
          </button>

          {/* New invoice form */}
          {showForm && (
            <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-3 space-y-3">
              <div className="text-[11px] font-black text-indigo-700">فاتورة جديدة</div>

              {/* Date */}
              <div>
                <label className="mb-0.5 block text-[10px] font-black text-slate-500">التاريخ</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  dir="ltr"
                  className="w-full max-w-[200px] rounded-lg border border-indigo-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Line items */}
              <div className="space-y-2">
                <div className="text-[10px] font-black text-slate-500">البنود</div>
                {formItems.map((item, idx) => (
                  <div key={item.id} className="flex items-start gap-2">
                    <span className="mt-2 text-[10px] font-black text-slate-400 shrink-0 w-4 text-center">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      placeholder="وصف البند (مثال: كشف عام)"
                      value={item.description}
                      onChange={e => updateFormItem(item.id, 'description', e.target.value)}
                      className="flex-1 rounded-lg border border-indigo-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 focus:border-indigo-500 focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="المبلغ"
                      min={0}
                      step={0.5}
                      value={item.amount || ''}
                      onChange={e => updateFormItem(item.id, 'amount', e.target.value)}
                      dir="ltr"
                      className="w-24 rounded-lg border border-indigo-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 focus:border-indigo-500 focus:outline-none"
                    />
                    {formItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFormItem(item.id)}
                        className="mt-1 rounded-lg border border-rose-200 bg-rose-50 px-1.5 py-1 text-[10px] font-black text-rose-500 hover:bg-rose-100"
                      >
                        حذف
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFormItem}
                  className="rounded-lg border border-indigo-300 bg-white px-2.5 py-1 text-[10px] font-black text-indigo-600 hover:bg-indigo-50"
                >
                  + إضافة بند
                </button>
              </div>

              {/* Discount + Notes */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-0.5 block text-[10px] font-black text-slate-500">الخصم (ج.م)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={formDiscount}
                    onChange={e => setFormDiscount(e.target.value)}
                    placeholder="0"
                    dir="ltr"
                    className="w-full rounded-lg border border-indigo-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block text-[10px] font-black text-slate-500">ملاحظات (اختياري)</label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={e => setFormNotes(e.target.value)}
                    placeholder="ملاحظات إضافية..."
                    className="w-full rounded-lg border border-indigo-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Totals preview */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="text-[11px] font-black text-slate-500">
                  المجموع: <span className="text-slate-800">{formSubtotal.toLocaleString('ar-EG')} ج.م</span>
                </span>
                {formDiscountNum > 0 && (
                  <span className="text-[11px] font-black text-rose-500">
                    الخصم: - {formDiscountNum.toLocaleString('ar-EG')} ج.م
                  </span>
                )}
                <span className="text-[12px] font-black text-indigo-700">
                  الإجمالي: {formTotal.toLocaleString('ar-EG')} ج.م
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-black text-slate-500 hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveInvoice(false)}
                  className="rounded-lg border border-indigo-300 bg-white px-3 py-1.5 text-[11px] font-black text-indigo-600 hover:bg-indigo-50"
                >
                  حفظ فقط
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveInvoice(true)}
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-[11px] font-black text-white hover:bg-indigo-700"
                >
                  حفظ وطباعة
                </button>
              </div>
            </div>
          )}

          {/* Existing invoices list */}
          {invoices.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                الفواتير المحفوظة
              </div>
              {[...invoices]
                .sort((a, b) => b.createdAt - a.createdAt)
                .map(inv => {
                  const subtotal = inv.items.reduce((s, i) => s + i.amount, 0);
                  const total = Math.max(0, subtotal - (inv.discount || 0));
                  return (
                    <div
                      key={inv.id}
                      className="flex items-start justify-between gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded-full bg-indigo-100 text-indigo-700 px-2 py-0.5 text-[10px] font-black">
                            INV-{String(inv.invoiceNumber).padStart(6, '0')}
                          </span>
                          <span className="text-sm font-black text-slate-800">
                            {total.toLocaleString('ar-EG')} ج.م
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">{inv.dateKey}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {inv.items.length} بند
                          {inv.discount > 0 && ` · خصم ${inv.discount.toLocaleString('ar-EG')} ج.م`}
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => printInvoice(inv)}
                          className="rounded-lg border border-indigo-200 bg-white px-2 py-1 text-[10px] font-black text-indigo-600 hover:bg-indigo-50"
                        >
                          طباعة
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteInvoice(inv.id)}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] font-black text-rose-600 hover:bg-rose-100"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {invoices.length === 0 && !isLoading && !showForm && (
            <div className="py-4 text-center text-xs text-slate-400 font-bold">
              لا توجد فواتير مسجَّلة لهذا المريض
            </div>
          )}
        </div>
      )}
    </div>
  );
};
