/**
 * مكون اختيار الدفع والتأمين (Insurance Payment Selector)
 * 
 * يظهر في شاشة الكشف لتحديد:
 * 1. الدفع (كاش / تأمين)
 * 2. اختيار شركة التأمين (إذا كان تأمين)
 * 3. إدخال رقم الكارنيه وكود الموافقة
 * 
 * لا يظهر في وضع الطباعة
 */

import React, { useState, useEffect } from 'react';
import type { PaymentType } from '../../types';
import {
  insuranceService,
  resolvePatientSharePercentForBranch,
  type InsuranceCompany,
} from '../../services/insuranceService';
import { discountReasonService } from '../../services/discountReasonService';
import { useVisitServicePrices } from '../../hooks/useVisitServicePrices';
import { DiscountPaymentFields, type DiscountReasonOption } from './DiscountPaymentFields';

interface InsurancePaymentSelectorProps {
  userId: string;
  bookingSecret?: string;
  /** الفرع النشط — يُستخدم لاختيار override نسبة تحمل المريض من شركة التأمين (لو موجود). */
  activeBranchId?: string;
  visitDate: string;
  visitType: 'exam' | 'consultation';
  paymentType: PaymentType;
  setPaymentType: (v: PaymentType) => void;
  insuranceCompanyId: string;
  setInsuranceCompanyId: (v: string) => void;
  insuranceCompanyName: string;
  setInsuranceCompanyName: (v: string) => void;
  insuranceApprovalCode: string;
  setInsuranceApprovalCode: (v: string) => void;
  insuranceMembershipId: string;
  setInsuranceMembershipId: (v: string) => void;
  patientSharePercent: number;
  setPatientSharePercent: (v: number) => void;
  discountAmount: number;
  setDiscountAmount: (v: number) => void;
  discountPercent: number;
  setDiscountPercent: (v: number) => void;
  discountReasonId?: string;
  discountReasonLabel?: string;
  setDiscountReasonId?: (v: string) => void;
  setDiscountReasonLabel?: (v: string) => void;
  discountReasons?: DiscountReasonOption[];
  insuranceCompanies?: InsuranceCompany[];
  isPrintMode?: boolean;
  showToggle?: boolean;
}

export const InsurancePaymentSelector: React.FC<InsurancePaymentSelectorProps> = ({
  userId,
  bookingSecret,
  activeBranchId,
  visitDate,
  visitType,
  paymentType,
  setPaymentType,
  insuranceCompanyId,
  setInsuranceCompanyId,
  insuranceCompanyName,
  setInsuranceCompanyName,
  insuranceApprovalCode,
  setInsuranceApprovalCode,
  insuranceMembershipId,
  setInsuranceMembershipId,
  patientSharePercent,
  setPatientSharePercent,
  discountAmount,
  setDiscountAmount,
  discountPercent,
  setDiscountPercent,
  discountReasonId,
  discountReasonLabel,
  setDiscountReasonId,
  setDiscountReasonLabel,
  discountReasons,
  insuranceCompanies,
  isPrintMode,
  showToggle = true,
}) => {
  const [localCompanies, setLocalCompanies] = useState<InsuranceCompany[]>([]);
  const [localReasons, setLocalReasons] = useState<DiscountReasonOption[]>([]);
  const effectiveCompanies = insuranceCompanies || localCompanies;
  const effectiveReasons = discountReasons || localReasons;
  const { examPrice, consultationPrice, servicePrice } = useVisitServicePrices({
    userId,
    bookingSecret,
    visitDate,
    visitType,
  });

  useEffect(() => {
    if (insuranceCompanies) return;
    if (bookingSecret) {
      const unsubscribe = insuranceService.subscribeToCompaniesBySecret(bookingSecret, setLocalCompanies);
      return () => unsubscribe();
    }
    if (!userId) {
      setLocalCompanies([]);
      return;
    }
    const unsubscribe = insuranceService.subscribeToCompanies(userId, setLocalCompanies);
    return () => unsubscribe();
  }, [userId, bookingSecret, insuranceCompanies]);

  useEffect(() => {
    if (discountReasons) return;
    if (bookingSecret) {
      const unsubscribe = discountReasonService.subscribeToReasonsBySecret(bookingSecret, (reasons) => {
        setLocalReasons(reasons);
      });
      return () => unsubscribe();
    }
    if (!userId) {
      setLocalReasons([]);
      return;
    }
    const unsubscribe = discountReasonService.subscribeToReasons(userId, (reasons) => {
      setLocalReasons(reasons);
    });
    return () => unsubscribe();
  }, [userId, bookingSecret, discountReasons]);

  // عند اختيار شركة من القائمة
  // تُستخدم النسبة المخصصة للفرع النشط إن وُجدت، وإلا النسبة الافتراضية للشركة.
  const handleCompanyChange = (companyId: string) => {
    setInsuranceCompanyId(companyId);
    const company = effectiveCompanies.find((c) => c.id === companyId);
    if (company) {
      setInsuranceCompanyName(company.name);
      setPatientSharePercent(resolvePatientSharePercentForBranch(company, activeBranchId));
    } else {
      setInsuranceCompanyName('');
      setPatientSharePercent(0);
    }
  };

  const clearInsuranceFields = () => {
    setInsuranceCompanyId('');
    setInsuranceCompanyName('');
    setInsuranceMembershipId('');
    setInsuranceApprovalCode('');
    setPatientSharePercent(0);
  };

  const clearDiscountFields = () => {
    setDiscountAmount(0);
    setDiscountPercent(0);
    setDiscountReasonId?.('');
    setDiscountReasonLabel?.('');
  };

  // لا يظهر في وضع الطباعة
  if (isPrintMode) return null;
  // عند إخفاء السويتش واختيار كاش لا توجد تفاصيل إضافية للعرض
  if (!showToggle && paymentType === 'cash') return null;

  return (
    <section className="clinic-section no-print rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-5 text-right bg-white border border-slate-200 shadow-sm" dir="rtl">
      {/* اختيار الدفع */}
      {showToggle && (
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <span className="text-sm sm:text-base font-black text-slate-800">💳 الدفع</span>
        <div className="grid grid-cols-3 gap-2 w-full sm:w-auto sm:min-w-[360px]">
          <button
            type="button"
            onClick={() => {
              setPaymentType('cash');
              clearInsuranceFields();
              clearDiscountFields();
            }}
            className={`px-4 py-2 rounded-xl text-sm font-black transition-all duration-200 ${
              paymentType === 'cash'
                ? 'bg-blue-600 text-white shadow-sm scale-[1.01]'
                : 'bg-blue-50 text-blue-700 border border-blue-200 hover:border-blue-300 hover:bg-blue-100'
            }`}
          >
            💵 كاش
          </button>
          <button
            type="button"
            onClick={() => {
              setPaymentType('insurance');
              clearDiscountFields();
            }}
            className={`px-4 py-2 rounded-xl text-sm font-black transition-all duration-200 ${
              paymentType === 'insurance'
                ? 'bg-emerald-600 text-white shadow-sm scale-[1.01]'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            🏢 تأمين
          </button>
          <button
            type="button"
            onClick={() => {
              setPaymentType('discount');
              clearInsuranceFields();
            }}
            className={`px-4 py-2 rounded-xl text-sm font-black transition-all duration-200 ${
              paymentType === 'discount'
                ? 'bg-amber-600 text-white shadow-sm scale-[1.01]'
                : 'bg-amber-50 text-amber-700 border border-amber-200 hover:border-amber-300 hover:bg-amber-100'
            }`}
          >
            🏷️ خصم
          </button>
        </div>
      </div>
      )}

      {/* حقول التأمين (تظهر فقط عند اختيار تأمين) */}
      {paymentType === 'insurance' && (
        <div className="space-y-3 pt-3 mt-3 border-t border-slate-200">
          {/* اختيار الشركة */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1">شركة التأمين</label>
            {effectiveCompanies.length === 0 ? (
              <p className="text-xs text-slate-500 bg-white rounded-xl px-3 py-2 border border-slate-200">
                لم تُضَف شركات تأمين بعد. أضفها من التقارير المالية
              </p>
            ) : (
              <select
                value={insuranceCompanyId}
                onChange={(e) => handleCompanyChange(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border-2 border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm font-bold bg-white text-slate-800"
              >
                <option value="">-- اختر الشركة --</option>
                {effectiveCompanies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (تحمل المريض: {c.patientSharePercent}%)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* رقم كارنيه التأمين + كود الموافقة */}
          {insuranceCompanyId && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">رقم الكارنيه</label>
                <input
                  type="text"
                  value={insuranceMembershipId}
                  onChange={(e) => setInsuranceMembershipId(e.target.value)}
                  placeholder="رقم كارنيه المريض"
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm font-bold bg-white text-slate-800"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">كود الموافقة</label>
                <input
                  type="text"
                  value={insuranceApprovalCode}
                  onChange={(e) => setInsuranceApprovalCode(e.target.value)}
                  placeholder="Approval Code"
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm font-bold bg-white text-slate-800"
                  dir="ltr"
                />
              </div>
            </div>
          )}

          {/* ملخص التقسيم المالي */}
          {insuranceCompanyId && (
            <div className="bg-white/90 rounded-xl px-3 py-2.5 border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-700 font-black">📊 تقسيم التكلفة</span>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg font-black">
                  المريض: {patientSharePercent}%
                </span>
                <span className="bg-sky-100 text-sky-700 px-2 py-1 rounded-lg font-black">
                  الشركة: {100 - patientSharePercent}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {paymentType === 'discount' && (
        <DiscountPaymentFields
          visitType={visitType}
          examPrice={examPrice}
          consultationPrice={consultationPrice}
          servicePrice={servicePrice}
          discountAmount={discountAmount}
          setDiscountAmount={setDiscountAmount}
          discountPercent={discountPercent}
          setDiscountPercent={setDiscountPercent}
          discountReasonId={discountReasonId}
          discountReasonLabel={discountReasonLabel}
          setDiscountReasonId={setDiscountReasonId}
          setDiscountReasonLabel={setDiscountReasonLabel}
          discountReasons={effectiveReasons}
        />
      )}
    </section>
  );
};
