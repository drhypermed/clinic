import React from 'react';
import { normalizeDiscountForBasePrice } from '../../utils/paymentDiscount';

export interface DiscountReasonOption {
  id: string;
  name: string;
}

interface DiscountPaymentFieldsProps {
  visitType: 'exam' | 'consultation';
  examPrice: number;
  consultationPrice: number;
  servicePrice: number;
  discountAmount: number;
  setDiscountAmount: (value: number) => void;
  discountPercent: number;
  setDiscountPercent: (value: number) => void;
  discountReasonId?: string;
  discountReasonLabel?: string;
  setDiscountReasonId?: (value: string) => void;
  setDiscountReasonLabel?: (value: string) => void;
  discountReasons?: DiscountReasonOption[];
}

export const DiscountPaymentFields: React.FC<DiscountPaymentFieldsProps> = ({
  visitType,
  examPrice,
  consultationPrice,
  servicePrice,
  discountAmount,
  setDiscountAmount,
  discountPercent,
  setDiscountPercent,
  discountReasonId = '',
  discountReasonLabel = '',
  setDiscountReasonId,
  setDiscountReasonLabel,
  discountReasons = [],
}) => {
  const normalizedFinal = normalizeDiscountForBasePrice(servicePrice, discountAmount, discountPercent);

  const normalizeLocalizedDigits = (value: string): string => {
    return String(value || '')
      .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
      .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0));
  };

  const toPositiveNumber = (value: string): number => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return 0;
    return parsed;
  };

  const clampPercent = (value: number): number => {
    if (!Number.isFinite(value) || value <= 0) return 0;
    return Math.min(100, value);
  };

  const limitToFourDigits = (value: string): string => {
    const raw = normalizeLocalizedDigits(value);
    const normalized = raw.replace(/[^\d.]/g, '');
    if (!normalized) return '';

    const hasDecimal = normalized.includes('.');
    const [integerPartRaw = '', decimalPartRaw = ''] = normalized.split('.');
    const integerDigits = integerPartRaw.replace(/\D/g, '');
    const decimalDigits = decimalPartRaw.replace(/\D/g, '');
    const combinedDigits = `${integerDigits}${decimalDigits}`.slice(0, 4);

    if (!hasDecimal) return combinedDigits;

    const safeIntegerLength = Math.min(integerDigits.length, combinedDigits.length);
    const safeInteger = combinedDigits.slice(0, safeIntegerLength) || '0';
    const safeDecimal = combinedDigits.slice(safeIntegerLength);

    return safeDecimal ? `${safeInteger}.${safeDecimal}` : safeInteger;
  };

  const handleDiscountAmountInputChange = (value: string) => {
    const normalizedInput = limitToFourDigits(value);
    const typedAmount = toPositiveNumber(normalizedInput);

    // اسمح للسكرتيرة بالكتابة حتى لو سعر الخدمة غير متاح حالياً.
    if (servicePrice <= 0) {
      setDiscountAmount(typedAmount);
      setDiscountPercent(0);
      return;
    }

    const normalized = normalizeDiscountForBasePrice(servicePrice, typedAmount, 0);
    setDiscountAmount(normalized.discountAmount);
    setDiscountPercent(normalized.discountPercent);
  };

  const handleDiscountPercentInputChange = (value: string) => {
    const normalizedInput = limitToFourDigits(value);
    const typedPercent = clampPercent(toPositiveNumber(normalizedInput));

    // اسمح بالكتابة المباشرة في النسبة عند غياب السعر؛ تتم المزامنة الكاملة عند توفره.
    if (servicePrice <= 0) {
      setDiscountPercent(typedPercent);
      setDiscountAmount(0);
      return;
    }

    const normalized = normalizeDiscountForBasePrice(servicePrice, 0, typedPercent);
    setDiscountAmount(normalized.discountAmount);
    setDiscountPercent(normalized.discountPercent);
  };

  const handleDiscountReasonChange = (reasonId: string) => {
    setDiscountReasonId?.(reasonId);
    if (!setDiscountReasonLabel) return;
    const selected = discountReasons.find((item) => item.id === reasonId);
    setDiscountReasonLabel(selected?.name || '');
  };

  const resolvedReasonLabel = String(discountReasonLabel || '').trim();
  const shouldShowReasonSelector = Boolean(
    setDiscountReasonId || setDiscountReasonLabel || discountReasonId || resolvedReasonLabel
  );

  return (
    <div className="space-y-3 pt-3 mt-3 border-t border-slate-200">
      <div className="rounded-xl border border-warning-200 bg-warning-50 px-3 py-2 text-xs font-black text-warning-700">
        <div>النوع الحالي: {visitType === 'consultation' ? 'استشارة' : 'كشف'}</div>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <span
            className={`rounded-lg border px-2 py-1 ${
              visitType === 'exam'
                ? 'border-success-300 bg-success-100 text-success-800'
                : 'border-warning-200 bg-white/70 text-warning-700'
            }`}
          >
            سعر الكشف: {examPrice.toFixed(2)} ج.م
          </span>
          <span
            className={`rounded-lg border px-2 py-1 ${
              visitType === 'consultation'
                ? 'border-success-300 bg-success-100 text-success-800'
                : 'border-warning-200 bg-white/70 text-warning-700'
            }`}
          >
            سعر الاستشارة: {consultationPrice.toFixed(2)} ج.م
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-black text-slate-700 mb-1">مبلغ الخصم (ج.م)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={discountAmount > 0 ? String(discountAmount) : ''}
            onChange={(event) => handleDiscountAmountInputChange(event.target.value)}
            placeholder="0"
            className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-warning-400 focus:ring-2 focus:ring-warning-100 text-sm font-bold bg-white text-slate-800 text-center"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-xs font-black text-slate-700 mb-1">نسبة الخصم (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={discountPercent > 0 ? String(discountPercent) : ''}
            onChange={(event) => handleDiscountPercentInputChange(event.target.value)}
            placeholder="0"
            className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-warning-400 focus:ring-2 focus:ring-warning-100 text-sm font-bold bg-white text-slate-800 text-center"
            dir="ltr"
          />
        </div>
      </div>

      {shouldShowReasonSelector && (
        <div>
          <label className="block text-xs font-black text-slate-700 mb-1">سبب الخصم (اختياري)</label>
          {discountReasons.length === 0 ? (
            <p className="text-xs text-slate-500 bg-white rounded-xl px-3 py-2 border border-slate-200">
              لا توجد عناصر خصم مضافة بعد. أضفها من صفحة التقارير المالية.
            </p>
          ) : (
            <select
              value={discountReasonId}
              onChange={(event) => handleDiscountReasonChange(event.target.value)}
              className="w-full px-3 py-3 rounded-xl border-2 border-slate-200 focus:border-warning-400 focus:ring-2 focus:ring-warning-100 text-sm font-bold bg-white text-slate-800"
            >
              <option value="">-- اختر سبب الخصم --</option>
              {discountReasons.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          )}
          {resolvedReasonLabel && (
            <p className="mt-2 rounded-xl border border-warning-200 bg-warning-50 px-3 py-2 text-xs font-black text-warning-800">
              ملخص سبب الخصم: {resolvedReasonLabel}
            </p>
          )}
        </div>
      )}

      <div className="bg-white/90 rounded-xl px-3 py-2.5 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-slate-700 font-black">📊 بعد الخصم</span>
        <span className="bg-warning-100 text-warning-700 px-2 py-1 rounded-lg font-black">
          {normalizedFinal.finalPrice.toFixed(2)} ج.م
        </span>
      </div>
    </div>
  );
};
