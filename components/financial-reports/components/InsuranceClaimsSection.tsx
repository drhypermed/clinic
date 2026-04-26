// ─────────────────────────────────────────────────────────────────────────────
// مكون كشف حساب شركات التأمين (InsuranceClaimsSection)
// ─────────────────────────────────────────────────────────────────────────────
// يعرض:
//   1) إجمالي المطالبات الشهرية من كل الشركات (ملخص سريع)
//   2) كشف حساب لكل شركة: كشوفات + استشارات + تداخلات + دخل آخر + الإجمالي
//   3) فورم إصدار فاتورة شركة عن فترة مخصصة مع طباعة
//
// يعتمد على patientRecord.paymentType === 'insurance' + insuranceCompanyName
// بعد التقسيم: الملف ده JSX بحت — كل المنطق في useInsuranceClaims.
// الأنواع والـ helpers في insuranceClaimsHelpers.ts.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import type { PatientRecord } from '../../../types';
import type { DailyFinancialData } from '../../../services/financial-data';
import { formatCurrency } from '../utils/formatters';
import type { DailyInsuranceExtraEntry } from '../hooks/useFinancialData';
import { useInsuranceClaims } from '../hooks/useInsuranceClaims';

interface InsuranceClaimsSectionProps {
  /** معرف المستخدم (لتحميل إعدادات الروشتة للفاتورة) */
  userId: string;
  /** اسم الشهر الحالي (للعرض في الهيدر) */
  currentMonthLabel: string;
  records: PatientRecord[];
  selectedDate: Date;
  /** اليوم المحدد فعلياً (YYYY-MM-DD) — للتحديث الفوري */
  selectedDayKey: string;
  examPrice: number;
  consultPrice: number;
  /** الإضافات التأمينية لليوم المحدد (مفلترة بالفرع من useFinancialData) */
  dailyInsuranceExtras?: DailyInsuranceExtraEntry[];
  /** خريطة Firestore اليومية (مفلترة بالفرع) — لجلب extras للأيام الماضية */
  yearlyDailyMap: Record<string, DailyFinancialData>;
}

export const InsuranceClaimsSection: React.FC<InsuranceClaimsSectionProps> = ({
  userId,
  currentMonthLabel,
  records,
  selectedDate,
  selectedDayKey,
  examPrice,
  consultPrice,
  dailyInsuranceExtras = [],
  yearlyDailyMap,
}) => {
  const {
    claims,
    totalCompanyShare,
    invoiceCompany,
    invoiceDateFrom,
    invoiceDateTo,
    setInvoiceDateFrom,
    setInvoiceDateTo,
    // ملاحظات تطبع على الكشف التفصيلي + دالة الطباعة التفصيلية
    statementNotes,
    setStatementNotes,
    openInvoiceForCompany,
    handlePrintInsuranceInvoice,
    handlePrintDetailedStatement,
  } = useInsuranceClaims({
    userId,
    records,
    selectedDate,
    selectedDayKey,
    examPrice,
    consultPrice,
    dailyInsuranceExtras,
    yearlyDailyMap,
  });

  // لا نعرض القسم إذا لم يكن هناك حالات تأمين في الشهر
  if (claims.length === 0) return null;

  return (
    <div className="rounded-2xl shadow-sm overflow-hidden">
      {/* ─── الهيدر ─── */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-brand-700 to-brand-600">
        <span className="text-base">🏥</span>
        <span className="text-sm font-black text-white">مطالبات التأمين الشهرية</span>
        <span className="mr-auto text-xs font-bold text-white/80 bg-white/15 rounded-full px-2.5 py-0.5">{currentMonthLabel}</span>
      </div>

      {/* ─── المحتوى ─── */}
      <div className="bg-white p-4 space-y-4">
        {/* ملخص سريع: إجمالي المطالبات */}
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-warning-50 rounded-xl p-3 border border-warning-100 text-center">
            <p className="text-xs font-bold text-warning-600 mb-1">مطالبات من الشركات</p>
            <p className="text-xl font-black text-warning-800">{formatCurrency(totalCompanyShare)}</p>
          </div>
        </div>

        {/* كشف حساب كل شركة */}
        <div className="space-y-3">
          {claims.map((claim) => (
            <div key={claim.companyName} className="bg-white rounded-xl p-3 sm:p-4 border border-slate-100">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏢</span>
                  <h4 className="text-sm sm:text-base font-black text-slate-800">{claim.companyName}</h4>
                </div>
              </div>

              {/* شبكة تفاصيل المطالبة: 4 فئات + الإجمالي */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="bg-brand-50 rounded-lg p-2 border border-brand-100">
                  <p className="text-[10px] font-bold text-brand-600">كشوفات</p>
                  <p className="text-sm font-black text-brand-800">{formatCurrency(claim.examsCompanyShare)}</p>
                </div>
                <div className="bg-brand-50 rounded-lg p-2 border border-brand-100">
                  <p className="text-[10px] font-bold text-brand-600">استشارات</p>
                  <p className="text-sm font-black text-brand-800">{formatCurrency(claim.consultsCompanyShare)}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 col-span-2">
                  <p className="text-[10px] font-bold text-slate-600">تداخلات</p>
                  <p className="text-sm font-black text-slate-800">{formatCurrency(claim.interventionsExtrasTotal)}</p>
                </div>
                <div className="bg-brand-50 rounded-lg p-2 border border-brand-100 col-span-2">
                  <p className="text-[10px] font-bold text-brand-600">دخل آخر</p>
                  <p className="text-sm font-black text-brand-800">{formatCurrency(claim.otherExtrasTotal)}</p>
                </div>
                <div className="bg-warning-50 rounded-lg p-2 border border-warning-100 col-span-2 sm:col-span-2">
                  <p className="text-[10px] font-bold text-warning-600">مطالبة الشركة</p>
                  <p className="text-sm font-black text-warning-800">{formatCurrency(claim.companyShare + claim.insuranceExtrasTotal)}</p>
                </div>
              </div>

              {/* زر إصدار فاتورة للشركة */}
              <div className="mt-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => openInvoiceForCompany(claim.companyName)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-[11px] font-black text-white hover:bg-brand-700"
                >
                  {invoiceCompany === claim.companyName ? 'إلغاء' : 'إصدار فاتورة للشركة'}
                </button>
              </div>

              {/* نموذج اختيار الفترة (يظهر فقط للشركة المختارة) */}
              {invoiceCompany === claim.companyName && (
                <div className="mt-2 rounded-xl bg-brand-50 border border-brand-200 p-3 space-y-2">
                  <div className="text-[11px] font-black text-brand-700">اختر الفترة لكشف {claim.companyName}</div>
                  <div className="flex flex-wrap items-end gap-2">
                    <div>
                      <label className="mb-0.5 block text-[10px] font-black text-slate-500">من</label>
                      <input
                        type="date"
                        value={invoiceDateFrom}
                        onChange={(e) => setInvoiceDateFrom(e.target.value)}
                        dir="ltr"
                        className="rounded-lg border border-brand-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-0.5 block text-[10px] font-black text-slate-500">إلى</label>
                      <input
                        type="date"
                        value={invoiceDateTo}
                        onChange={(e) => setInvoiceDateTo(e.target.value)}
                        dir="ltr"
                        className="rounded-lg border border-brand-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* خانة ملاحظات تطبع على الكشف التفصيلي (اختياري — مساحة حرة للطبيب) */}
                  <div>
                    <label className="mb-0.5 block text-[10px] font-black text-slate-500">
                      ملاحظات للكشف التفصيلي (اختياري)
                    </label>
                    <textarea
                      value={statementNotes}
                      onChange={(e) => setStatementNotes(e.target.value)}
                      rows={2}
                      placeholder="أي ملاحظات تكتبها هنا هتظهر مطبوعة في الكشف التفصيلي..."
                      className="w-full resize-y rounded-lg border border-brand-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  {/* زرين: فاتورة مجمعة (الموجود) + كشف تفصيلي (الجديد) */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handlePrintInsuranceInvoice(claim.companyName)}
                      disabled={!invoiceDateFrom || !invoiceDateTo}
                      className={`rounded-lg px-4 py-1.5 text-[11px] font-black text-white ${!invoiceDateFrom || !invoiceDateTo ? 'bg-slate-300 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700'}`}
                      title="ورقة A5 فيها مجاميع الكشوفات والاستشارات والتداخلات"
                    >
                      🧾 فاتورة مجمعة
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrintDetailedStatement(claim.companyName)}
                      disabled={!invoiceDateFrom || !invoiceDateTo}
                      className={`rounded-lg px-4 py-1.5 text-[11px] font-black text-white ${!invoiceDateFrom || !invoiceDateTo ? 'bg-slate-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                      title="ورقة A4 فيها صف لكل حالة بكارنيه + تاريخ + كود موافقة (للمراجعة من شركة التأمين)"
                    >
                      📋 كشف تفصيلي بالحالات
                    </button>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 leading-relaxed">
                    💡 الفاتورة المجمعة = ملخص بالأرقام • الكشف التفصيلي = جدول بكل حالة على حدة (لإثبات الشغل لشركة التأمين)
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* الإجمالي الكبير في الأسفل */}
        <div className="pt-2 border-t border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-brand-50 rounded-xl p-3 border border-brand-200">
            <span className="font-bold text-brand-700">💰 إجمالي مطالبات الشهر لدى الشركات</span>
            <span className="text-base sm:text-xl font-black text-brand-700">
              {formatCurrency(totalCompanyShare)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
