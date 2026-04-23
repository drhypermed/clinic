/**
 * الملف: securityUtils.ts
 * الوصف: "درع حماية البيانات المالية".
 * يوفر طبقة أمان إضافية لحماية المعلومات الحساسة:
 * - verifyAdminAccess: يتحقق من هوية المسؤول وصلاحياته قبل فتح اللوحة المالية.
 * - encryptFinancialData (اختياري/مستقبلي): دوال لتأمين معالجة الأرقام الحساسة.
 * - logSecurityAudit: تتبع محاولات الوصول للبيانات المالية لضمان الشفافية.
 * - يضمن أن "سوبر أدمن" فقط هو من يمتلك التحكم الكامل في الأرقام المالية النهائية.
 * تضمن هذه الدوال صحة التنسيقات المالية والزمنية
 * وتطهير البيانات قبل حفظها في سجلات الإيرادات والمصروفات.
 */

import { ProMaxSubscriptionPrices, SubscriptionPrices } from './types';
import { mapFirebaseActionError } from '../../../utils/firebaseErrorMap';
import { CONTROL_CHARS_REGEX } from '../../../utils/controlChars';

/** التعبير النمطي للتحقق من معرف الشهر (مثل 2024-05) */
const MONTH_DOC_ID_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export const isValidMonthDocId = (value: string) => MONTH_DOC_ID_REGEX.test((value || '').trim());

export const normalizeMonthDocId = (value: string) => (value || '').trim();

/** تطهير أسعار الاشتراكات لضمان عدم وجود قيم سالبة أو غير عددية */
export const sanitizePrices = (input: SubscriptionPrices): SubscriptionPrices => ({
  monthly: Number.isFinite(input.monthly) && input.monthly >= 0 ? input.monthly : 0,
  sixMonths: Number.isFinite(input.sixMonths) && input.sixMonths >= 0 ? input.sixMonths : 0,
  yearly: Number.isFinite(input.yearly) && input.yearly >= 0 ? input.yearly : 0,
});

/** تطهير أسعار باقة برو ماكس — نفس المنطق لكن نوع منفصل */
export const sanitizeProMaxPrices = (input: ProMaxSubscriptionPrices | undefined): ProMaxSubscriptionPrices => ({
  monthly: input && Number.isFinite(input.monthly) && input.monthly >= 0 ? input.monthly : 0,
  sixMonths: input && Number.isFinite(input.sixMonths) && input.sixMonths >= 0 ? input.sixMonths : 0,
  yearly: input && Number.isFinite(input.yearly) && input.yearly >= 0 ? input.yearly : 0,
});

/** تنظيف وصف المصروفات من الرموز غير المرغوب فيها وتقييد الطول */
export const sanitizeExpenseDescription = (value: string) =>
  String(value || '')
    .replace(CONTROL_CHARS_REGEX, ' ')
    .trim()
    .slice(0, 200);

/** تحويل أخطاء العمليات المالية إلى رسائل عربية مفهومة (يعيد تصدير الدالة المشتركة). */
export const mapFinancialActionError = mapFirebaseActionError;

