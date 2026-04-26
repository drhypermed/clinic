/**
 * CostItemsLists:
 * - InvoiceSelectionPanel: لوحة اختيار بنود الفاتورة للطباعة.
 * - CashCostList: قائمة تكاليف الكاش.
 * - InsuranceClaimsList: قائمة مطالبات التأمين.
 * مكوّنات عرض خالصة (تعتمد على props فقط).
 */
import React from 'react';
import type {
  PatientCostItem,
  PatientInsuranceItem,
} from '../../../services/patientCostService';
import type { UnifiedInvoiceItem } from './useCostInvoiceSelection';
import { formatDayLabel } from './useCostInvoiceSelection';

// ─── لوحة اختيار بنود الفاتورة ────────────────────────────────────────
interface InvoicePanelProps {
  dateGroups: [string, UnifiedInvoiceItem[]][];
  selectedCostIds: Set<string>;
  selectedInsIds: Set<string>;
  selectedCount: number;
  onToggleItem: (id: string, kind: 'cash' | 'insurance') => void;
  onToggleDay: (dateKey: string) => void;
  onPrint: () => void;
}

export const InvoiceSelectionPanel: React.FC<InvoicePanelProps> = ({
  dateGroups,
  selectedCostIds,
  selectedInsIds,
  selectedCount,
  onToggleItem,
  onToggleDay,
  onPrint,
}) => (
  <div className="rounded-xl bg-brand-50 border border-brand-200 p-3 space-y-2">
    <div className="text-[11px] font-black text-brand-700">اختر البنود لطباعة فاتورة</div>

    {dateGroups.length === 0 && (
      <div className="py-3 text-center text-xs text-slate-400 font-bold">لا توجد بنود</div>
    )}

    {dateGroups.map(([dateKey, items]) => {
      // هل كل بنود اليوم مختارة؟ → يحدد حالة الـ checkbox الرأسي
      const dayAllSelected = items.every((i) =>
        (i.kind === 'cash' ? selectedCostIds : selectedInsIds).has(i.id),
      );
      return (
        <div
          key={dateKey}
          className="rounded-lg border border-brand-100 bg-white overflow-hidden"
        >
          {/* رأس اليوم: checkbox تحديد الكل + اسم اليوم + عدد البنود */}
          <label className="flex items-center gap-2 px-3 py-1.5 bg-brand-100/60 cursor-pointer hover:bg-brand-100">
            <input
              type="checkbox"
              checked={dayAllSelected}
              onChange={() => onToggleDay(dateKey)}
              className="accent-brand-600 w-3.5 h-3.5"
            />
            <span className="text-[10px] font-black text-brand-700">{formatDayLabel(dateKey)}</span>
            <span className="text-[10px] font-bold text-brand-400 mr-auto">
              {items.length} بند
            </span>
          </label>
          {/* البنود الفردية */}
          <div className="divide-y divide-brand-50">
            {items.map((item) => {
              const checked = (item.kind === 'cash' ? selectedCostIds : selectedInsIds).has(
                item.id,
              );
              return (
                <label
                  key={item.id}
                  className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleItem(item.id, item.kind)}
                    className="accent-brand-600 w-3.5 h-3.5"
                  />
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${
                      item.kind === 'cash'
                        ? 'bg-brand-100 text-brand-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.kind === 'cash' ? 'كاش' : 'تأمين'}
                  </span>
                  <span className="text-[11px] text-slate-700 font-medium flex-1 min-w-0 truncate">
                    {item.label}
                  </span>
                  <span className="text-[11px] font-black text-slate-800 shrink-0" dir="ltr">
                    {item.amount.toLocaleString('ar-EG')} ج.م
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      );
    })}

    {/* زر الطباعة + عدّاد التحديد */}
    <div className="flex items-center justify-between pt-1">
      <span className="text-[11px] font-black text-brand-600">
        {selectedCount > 0 ? `محدد: ${selectedCount} بند` : 'اختر بند واحد على الأقل'}
      </span>
      <button
        type="button"
        disabled={selectedCount === 0}
        onClick={onPrint}
        className={`rounded-lg px-4 py-1.5 text-[11px] font-black text-white ${
          selectedCount === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700'
        }`}
      >
        طباعة الفاتورة
      </button>
    </div>
  </div>
);

// ─── قائمة تكاليف الكاش ───────────────────────────────────────────────
interface CashListProps {
  items: PatientCostItem[];
  onEdit: (item: PatientCostItem) => void;
  onDelete: (id: string) => void;
}

export const CashCostList: React.FC<CashListProps> = ({ items, onEdit, onDelete }) => {
  if (items.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
        تكاليف كاش
      </div>
      {[...items]
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between gap-2 rounded-xl border border-brand-100 bg-brand-50/60 px-3 py-2"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-sm font-black text-slate-800">
                  {item.amount.toLocaleString('ar-EG')} ج.م
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                    item.type === 'interventions'
                      ? 'bg-brand-100 text-brand-700'
                      : 'bg-brand-100 text-brand-700'
                  }`}
                >
                  {item.type === 'interventions' ? 'التداخلات' : 'دخل آخر'}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">{item.dateKey}</span>
              </div>
              {item.note && <div className="text-[11px] text-slate-500 mt-0.5">{item.note}</div>}
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => onEdit(item)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-black text-slate-600 hover:bg-slate-50"
              >
                تعديل
              </button>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="rounded-lg border border-danger-200 bg-danger-50 px-2 py-1 text-[10px] font-black text-danger-600 hover:bg-danger-100"
              >
                حذف
              </button>
            </div>
          </div>
        ))}
    </div>
  );
};

// ─── قائمة مطالبات التأمين ────────────────────────────────────────────
interface InsListProps {
  items: PatientInsuranceItem[];
  onEdit: (item: PatientInsuranceItem) => void;
  onDelete: (id: string) => void;
}

export const InsuranceClaimsList: React.FC<InsListProps> = ({ items, onEdit, onDelete }) => {
  if (items.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
        مطالبات التأمين
      </div>
      {[...items]
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((item) => {
          // حساب نصيب الشركة من المبلغ بناءً على نسبة تحمل المريض
          const sharePct = typeof item.patientSharePercent === 'number'
            ? Math.max(0, Math.min(100, item.patientSharePercent))
            : 0;
          const patientShareAmt = Math.round((item.amount * sharePct) / 100);
          const companyShareAmt = item.amount - patientShareAmt;
          return (
          <div
            key={item.id}
            className="flex items-start justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-black text-slate-800">{item.companyName}</span>
                <span className="text-sm font-black text-slate-800">
                  {item.amount.toLocaleString('ar-EG')} ج.م
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                    item.type === 'interventions'
                      ? 'bg-brand-100 text-brand-700'
                      : 'bg-brand-100 text-brand-700'
                  }`}
                >
                  {item.type === 'interventions' ? 'التداخلات' : 'دخل آخر'}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">{item.dateKey}</span>
              </div>
              {/* صف ثاني: نسبة التحمل + توزيع المبلغ بين المريض والشركة */}
              {sharePct > 0 && (
                <div className="text-[10px] text-slate-600 mt-0.5 flex flex-wrap gap-1.5">
                  <span className="rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-amber-700 font-black">
                    تحمل المريض {sharePct}% = {patientShareAmt.toLocaleString('ar-EG')} ج
                  </span>
                  <span className="rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-emerald-700 font-black">
                    حصة الشركة {companyShareAmt.toLocaleString('ar-EG')} ج
                  </span>
                </div>
              )}
              {(item.insuranceMembershipId || item.insuranceApprovalCode) && (
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {item.insuranceMembershipId ? `كارنيه: ${item.insuranceMembershipId}` : ''}
                  {item.insuranceMembershipId && item.insuranceApprovalCode ? ' · ' : ''}
                  {item.insuranceApprovalCode ? `موافقة: ${item.insuranceApprovalCode}` : ''}
                </div>
              )}
              {item.note && <div className="text-[11px] text-slate-500 mt-0.5">{item.note}</div>}
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => onEdit(item)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-black text-slate-600 hover:bg-slate-50"
              >
                تعديل
              </button>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="rounded-lg border border-danger-200 bg-danger-50 px-2 py-1 text-[10px] font-black text-danger-600 hover:bg-danger-100"
              >
                حذف
              </button>
            </div>
          </div>
          );
        })}
    </div>
  );
};
