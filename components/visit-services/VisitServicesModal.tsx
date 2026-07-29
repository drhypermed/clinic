import React from 'react';
import { ModalOverlay } from '../ui/ModalOverlay';
import {
  getPaymentMethodLabel,
  type DirectPaymentType,
} from '../../utils/paymentMethods';
import {
  normalizeServiceName,
} from '../../services/visit-services/helpers';
import type {
  AddVisitServiceInput,
  VisitServiceCharge,
  VisitServiceTemplate,
  VisitServiceType,
} from '../../services/visit-services/types';

interface VisitServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  templates: VisitServiceTemplate[];
  items: VisitServiceCharge[];
  loading?: boolean;
  saving?: boolean;
  initialPaymentType?: DirectPaymentType;
  error?: string | null;
  onAdd: (input: AddVisitServiceInput) => Promise<void> | void;
  onDelete: (itemId: string) => Promise<void> | void;
}

const paymentTypes: Array<{ value: DirectPaymentType; label: string }> = [
  { value: 'cash', label: getPaymentMethodLabel('cash') },
  { value: 'instapay', label: getPaymentMethodLabel('instapay') },
  { value: 'wallet', label: getPaymentMethodLabel('wallet') },
  { value: 'bank_transfer', label: getPaymentMethodLabel('bank_transfer') },
];

const formatMoney = (value: number) =>
  `${Number(value || 0).toLocaleString('ar-EG', { maximumFractionDigits: 2 })} ج.م`;

export const VisitServicesModal: React.FC<VisitServicesModalProps> = ({
  isOpen,
  onClose,
  patientName,
  templates,
  items,
  loading = false,
  saving = false,
  initialPaymentType = 'cash',
  error,
  onAdd,
  onDelete,
}) => {
  const [type, setType] = React.useState<VisitServiceType>('interventions');
  const [name, setName] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [paymentType, setPaymentType] = React.useState<DirectPaymentType>(initialPaymentType);
  const [saveAsTemplate, setSaveAsTemplate] = React.useState(true);
  const [localError, setLocalError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    setPaymentType(initialPaymentType);
    setLocalError(null);
  }, [initialPaymentType, isOpen]);

  const normalizedQuery = normalizeServiceName(name);
  const matchingTemplates = React.useMemo(
    () => templates
      .filter((template) => template.active !== false && template.type === type)
      .filter((template) => (
        !normalizedQuery
        || template.normalizedName.includes(normalizedQuery)
        || normalizedQuery.includes(template.normalizedName)
      ))
      .slice(0, 8),
    [normalizedQuery, templates, type],
  );
  const exactTemplate = templates.find(
    (template) => template.type === type && template.normalizedName === normalizedQuery,
  );
  const total = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const selectTemplate = (template: VisitServiceTemplate) => {
    setType(template.type);
    setName(template.name);
    setAmount(String(template.defaultPrice));
    setSaveAsTemplate(true);
    setLocalError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanName = name.trim().replace(/\s+/g, ' ');
    const parsedAmount = Number(amount);
    if (!patientName.trim()) {
      setLocalError('يرجى إدخال اسم المريض أولاً.');
      return;
    }
    if (!cleanName) {
      setLocalError('يرجى كتابة اسم الخدمة.');
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setLocalError('يرجى إدخال سعر صحيح أكبر من الصفر.');
      return;
    }
    setLocalError(null);
    try {
      await onAdd({
        name: cleanName,
        amount: parsedAmount,
        type,
        paymentType,
        saveAsTemplate,
      });
      setName('');
      setAmount('');
      setSaveAsTemplate(true);
    } catch {
      // رسالة الخطأ تأتي من الـwrapper وتُعرض في نفس النافذة.
    }
  };

  return (
    <ModalOverlay
      isOpen={isOpen}
      onClose={onClose}
      zIndex={10150}
      noPrint
      contentClassName="w-full max-w-2xl max-h-[calc(100dvh-2rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
      labelledBy="visit-services-title"
    >
      <div dir="rtl" className="flex max-h-[calc(100dvh-2rem)] flex-col">
        <header className="shrink-0 border-b border-slate-200 bg-gradient-to-l from-brand-700 via-brand-600 to-success-600 px-4 py-4 text-white sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="visit-services-title" className="text-base font-black sm:text-lg">
                إضافة خدمة/رسوم
              </h2>
              <p className="mt-1 text-xs font-bold text-white/85">
                {patientName.trim() || 'أدخل اسم المريض أولاً'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/30 bg-white/15 p-2 text-white hover:bg-white/25"
              aria-label="إغلاق"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 6l12 12M18 6L6 18" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
              <button
                type="button"
                onClick={() => { setType('interventions'); setName(''); setAmount(''); }}
                className={`rounded-xl px-3 py-2 text-xs font-black transition ${
                  type === 'interventions'
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                تداخل طبي
              </button>
              <button
                type="button"
                onClick={() => { setType('other'); setName(''); setAmount(''); }}
                className={`rounded-xl px-3 py-2 text-xs font-black transition ${
                  type === 'other'
                    ? 'bg-white text-success-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                دخل آخر
              </button>
            </div>

            <div>
              <label htmlFor="visit-service-name" className="mb-1 block text-xs font-black text-slate-600">
                اسم الخدمة
              </label>
              <input
                id="visit-service-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={120}
                autoComplete="off"
                placeholder={type === 'interventions' ? 'مثال: رسم قلب' : 'مثال: تقرير طبي'}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
              {matchingTemplates.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5" aria-label="الخدمات الجاهزة">
                  {matchingTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => selectTemplate(template)}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-black transition ${
                        exactTemplate?.id === template.id
                          ? 'border-brand-400 bg-brand-100 text-brand-800'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-brand-50'
                      }`}
                    >
                      {template.name} · {formatMoney(template.defaultPrice)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="visit-service-amount" className="mb-1 block text-xs font-black text-slate-600">
                  السعر
                </label>
                <div className="relative">
                  <input
                    id="visit-service-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    inputMode="decimal"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-2.5 pe-3 ps-14 text-sm font-black text-slate-800 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                  />
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs font-bold text-slate-400">
                    ج.م
                  </span>
                </div>
              </div>
              <div>
                <label htmlFor="visit-service-payment" className="mb-1 block text-xs font-black text-slate-600">
                  طريقة التحصيل
                </label>
                <select
                  id="visit-service-payment"
                  value={paymentType}
                  onChange={(event) => setPaymentType(event.target.value as DirectPaymentType)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                >
                  {paymentTypes.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-brand-100 bg-brand-50/60 px-3 py-2.5">
              <input
                type="checkbox"
                checked={saveAsTemplate}
                onChange={(event) => setSaveAsTemplate(event.target.checked)}
                className="mt-0.5 h-4 w-4 accent-brand-600"
              />
              <span>
                <span className="block text-xs font-black text-brand-800">حفظ كخدمة جاهزة للمستقبل</span>
                <span className="block text-[10px] font-bold text-brand-600">
                  لن تتكرر الخدمة إذا كان الاسم موجودًا بالفعل.
                </span>
              </span>
            </label>

            {(localError || error) && (
              <div className="rounded-xl border border-danger-200 bg-danger-50 px-3 py-2 text-xs font-black text-danger-700">
                {localError || error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving || !patientName.trim()}
              className="w-full rounded-xl bg-gradient-to-l from-brand-700 to-brand-500 px-4 py-3 text-sm font-black text-white shadow-md transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'جاري الإضافة...' : 'إضافة إلى الزيارة'}
            </button>
          </form>

          <section className="mt-6 border-t border-slate-200 pt-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-black text-slate-800">خدمات هذه الزيارة</h3>
              <span className="rounded-full bg-success-100 px-2.5 py-1 text-xs font-black text-success-700">
                الإجمالي {formatMoney(total)}
              </span>
            </div>

            {loading ? (
              <div className="py-6 text-center text-xs font-bold text-slate-400">جاري تحميل الخدمات...</div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-6 text-center text-xs font-bold text-slate-400">
                لم تتم إضافة خدمات لهذه الزيارة بعد
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-black text-slate-900">{item.serviceName || item.note || 'خدمة'}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                            item.type === 'interventions'
                              ? 'bg-brand-100 text-brand-700'
                              : 'bg-success-100 text-success-700'
                          }`}>
                            {item.type === 'interventions' ? 'تداخل' : 'دخل آخر'}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-[10px] font-bold text-slate-500">
                          <span>{getPaymentMethodLabel(item.paymentType)}</span>
                          <span>أضيف بواسطة: {item.addedByName || (item.addedByRole === 'secretary' ? 'السكرتارية' : 'الطبيب')}</span>
                          {item.financialStatus === 'pending' && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">
                              معلّقة حتى حفظ السجل
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 text-left">
                        <div className="text-sm font-black text-slate-900">{formatMoney(item.amount)}</div>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => {
                            if (window.confirm(`حذف خدمة «${item.serviceName || item.note || 'الخدمة'}» من الزيارة؟`)) {
                              void onDelete(item.id);
                            }
                          }}
                          className="mt-1 text-[10px] font-black text-danger-600 hover:text-danger-700 disabled:opacity-50"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </ModalOverlay>
  );
};
