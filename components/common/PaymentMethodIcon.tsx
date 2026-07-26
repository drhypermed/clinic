import React from 'react';
import {
  FaBuildingColumns,
  FaMoneyBillWave,
  FaShieldHalved,
  FaTag,
  FaWallet,
} from 'react-icons/fa6';
import type { PaymentType } from '../../types';

interface PaymentMethodIconProps {
  type: PaymentType;
  className?: string;
}

const INSTAPAY_OFFICIAL_ICON = '/assets/payment-methods/instapay.png';

export const PaymentMethodIcon: React.FC<PaymentMethodIconProps> = ({ type, className = 'h-4 w-4' }) => {
  if (type === 'instapay') {
    return (
      <span
        aria-hidden="true"
        className={`${className} inline-flex shrink-0 overflow-hidden rounded-[22%] bg-white`}
      >
        <img
          src={INSTAPAY_OFFICIAL_ICON}
          alt=""
          draggable={false}
          className="h-full w-full scale-[1.45] object-cover"
        />
      </span>
    );
  }
  if (type === 'wallet') return <FaWallet className={className} aria-hidden="true" />;
  if (type === 'bank_transfer') return <FaBuildingColumns className={className} aria-hidden="true" />;
  if (type === 'insurance') return <FaShieldHalved className={className} aria-hidden="true" />;
  if (type === 'discount') return <FaTag className={className} aria-hidden="true" />;
  return <FaMoneyBillWave className={className} aria-hidden="true" />;
};
