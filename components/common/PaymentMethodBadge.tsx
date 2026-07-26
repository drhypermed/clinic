import React from 'react';
import type { PaymentType } from '../../types';
import { getPaymentMethodLabel, normalizePaymentType } from '../../utils/paymentMethods';
import { PaymentMethodIcon } from './PaymentMethodIcon';

interface PaymentMethodBadgeProps {
  paymentType?: PaymentType;
  insuranceCompanyName?: string;
  discountText?: string;
  className?: string;
}

export const PaymentMethodBadge: React.FC<PaymentMethodBadgeProps> = ({
  paymentType,
  insuranceCompanyName,
  discountText,
  className = '',
}) => {
  const type = normalizePaymentType(paymentType);
  const extra = type === 'insurance'
    ? String(insuranceCompanyName || '').trim()
    : type === 'discount'
      ? String(discountText || '').trim()
      : '';
  const tone = type === 'insurance'
    ? 'border-success-200 bg-success-100 text-success-800'
    : type === 'discount'
      ? 'border-warning-200 bg-warning-100 text-warning-800'
      : type === 'instapay'
        ? 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800'
        : 'border-brand-200 bg-brand-50 text-brand-800';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black ${tone} ${className}`}>
      <PaymentMethodIcon type={type} className="h-3 w-3 shrink-0" />
      {getPaymentMethodLabel(type)} {extra ? `(${extra})` : ''}
    </span>
  );
};
