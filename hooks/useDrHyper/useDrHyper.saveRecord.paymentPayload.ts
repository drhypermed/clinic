/**
 * useDrHyper.saveRecord.paymentPayload:
 * بناء جزء الـ payment من payload الحفظ (كاش/تأمين/خصم).
 * مستخرج لأنه كان مكرر 3 مرات في نفس الملف (exam، consultation update، consultation new).
 */

interface PaymentPayloadArgs {
  paymentType?: string;
  insuranceCompanyId?: string;
  insuranceCompanyName?: string;
  insuranceApprovalCode?: string;
  insuranceMembershipId?: string;
  patientSharePercent?: number;
  discountAmount?: number;
  discountPercent?: number;
  discountReasonId?: string;
  discountReasonLabel?: string;
}

/**
 * يُرجع object جاهز للـ spread داخل payload الحفظ، بيحتوي:
 * - `paymentType` دائماً (cash افتراضي).
 * - بيانات التأمين لو النوع insurance.
 * - بيانات الخصم لو النوع discount.
 * القيم الفاضية بتترمي كـ undefined حتى Firestore ما يحفظهاش.
 */
export function buildPaymentPayload(args: PaymentPayloadArgs): Record<string, unknown> {
  const {
    paymentType,
    insuranceCompanyId,
    insuranceCompanyName,
    insuranceApprovalCode,
    insuranceMembershipId,
    patientSharePercent,
    discountAmount,
    discountPercent,
    discountReasonId,
    discountReasonLabel,
  } = args;

  const normalizedDiscountReasonId = String(discountReasonId || '').trim();
  const normalizedDiscountReasonLabel = String(discountReasonLabel || '').trim();

  return {
    paymentType: paymentType || 'cash',
    ...(paymentType === 'insurance'
      ? {
          insuranceCompanyId: insuranceCompanyId || undefined,
          insuranceCompanyName: insuranceCompanyName || undefined,
          insuranceApprovalCode: insuranceApprovalCode || undefined,
          insuranceMembershipId: insuranceMembershipId || undefined,
          // تقصير نسبة مشاركة المريض على صفر لو مش محدد
          patientSharePercent: patientSharePercent ?? 0,
        }
      : {}),
    ...(paymentType === 'discount'
      ? {
          // clamp القيم داخل نطاق صالح (≥0 وللنسبة ≤100)
          discountAmount: Number.isFinite(discountAmount)
            ? Math.max(0, Number(discountAmount))
            : 0,
          discountPercent: Number.isFinite(discountPercent)
            ? Math.max(0, Math.min(100, Number(discountPercent)))
            : 0,
          discountReasonId: normalizedDiscountReasonId || undefined,
          discountReasonLabel: normalizedDiscountReasonLabel || undefined,
        }
      : {}),
  };
}
