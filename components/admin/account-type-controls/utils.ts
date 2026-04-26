/**
 * الملف: utils.ts
 * الوصف: "محرك معالجة البيانات". 
 * يوفر هذا الملف الأدوات البرمجية اللازمة لضمان عمل واجهة الإدارة بكفاءة: 
 * - clampLimit: يضمن بقاء الأرقام المدخلة ضمن نطاق منطقي (0 - 5000). 
 * - trimTo: ينظف النصوص من الرموز الغريبة ويقلص طولها للأمان. 
 * - buildPayloadForSave: وظيفة حرجة تقوم بتجميع وتنظيف كافة بيانات النموذج قبل إرسالها للـ Firestore. 
 * - getErrorMessage: يحول رسائل Firebase التقنية الصعبة إلى جمل عربية واضحة للطبيب. 
 * - buildWhatsAppUrl: ينشئ روابط تواصل فورية مع الإدارة بنقرة زر واحدة.
 */

import type { AccountTypeControls } from '../../../services/accountTypeControlsService';
import {
  DRUG_TOOLS_LIMIT_KEYS,
  LIMIT_KEYS,
  LIMIT_MESSAGE_KEYS,
  WHATSAPP_MESSAGE_KEYS,
} from './constants';

const CONTROL_CHARS_REGEX = /[\u0000-\u001f\u007f]/g;

// ─ السقف الأقصى للحدود — ٦ أرقام (كان 5000 ورفعناه 2026-04 عشان السجلات لـبرو/برو ماكس) ─
export const clampLimit = (value: number): number => Math.max(0, Math.min(999999, Math.floor(value || 0)));

// دالة لاستخراج الأرقام فقط من النصوص (تستخدم لأرقام الهواتف)
export const digitsOnly = (value: string): string => (value || '').replace(/\D/g, '').slice(0, 20);

// دالة لتنظيف النصوص من الرموز غير المرغوب فيها وتحديد طول النص
const trimTo = (value: unknown, max = 500): string =>
  String(value || '').replace(CONTROL_CHARS_REGEX, ' ').trim().slice(0, max);

// تحويل رسائل خطأ Firebase إلى رسائل مفهومة للمستخدم باللغة العربية
const mapReadableError = (text: string): string => {
  const normalized = (text || '').toLowerCase();
  if (normalized.includes('permission-denied')) return 'هذا الإجراء متاح لحساب الأدمن فقط.';
  if (normalized.includes('unauthenticated')) return 'يجب تسجيل الدخول أولاً.';
  return text;
};

// استخراج رسالة الخطأ ومعالجتها
export const getErrorMessage = (error: unknown, fallback = 'خطأ غير معروف'): string => {
  const raw = error instanceof Error && error.message ? error.message : fallback;
  return mapReadableError(trimTo(raw, 180));
};

// بناء رابط الواتساب (Web/App Hook) للتواصل المباشر
export const buildWhatsAppUrl = (digits: string, message: string): string => {
  if (!digits) return '';
  const text = encodeURIComponent((message || '').trim());
  return `https://wa.me/${digits}${text ? `?text=${text}` : ''}`;
};

/**
 * بناء حمولة البيانات (Payload) لعملية الحفظ
 * تضمن هذه الدالة تنظيف كافة الحقول وتطبيق القيود (Limits) قبل إرسالها إلى Firestore.
 */
export const buildPayloadForSave = (form: AccountTypeControls): Partial<AccountTypeControls> => {
  const payload: Partial<AccountTypeControls> = {};

  // تنظيف قيم الحدود القصوى للميزات العامة
  LIMIT_KEYS.forEach((key) => {
    payload[key] = clampLimit(form[key]);
  });

  // تنظيف قيم الحدود القصوى لأدوات الأدوية
  DRUG_TOOLS_LIMIT_KEYS.forEach((key) => {
    payload[key] = clampLimit(form[key]);
  });

  // تنظيف نصوص التنبيهات
  LIMIT_MESSAGE_KEYS.forEach((key) => {
    payload[key] = trimTo(form[key]);
  });

  // تنظيف رسائل الواتساب
  WHATSAPP_MESSAGE_KEYS.forEach((key) => {
    payload[key] = trimTo(form[key]);
  });

  // معالجة الحقول الفردية الأخرى
  payload.whatsappNumber = digitsOnly(form.whatsappNumber);
  payload.interactionToolPremiumOnly = !!form.interactionToolPremiumOnly;
  payload.renalToolPremiumOnly = !!form.renalToolPremiumOnly;
  payload.pregnancyToolPremiumOnly = !!form.pregnancyToolPremiumOnly;
  payload.interactionToolLockedMessage = trimTo(form.interactionToolLockedMessage);
  payload.renalToolLockedMessage = trimTo(form.renalToolLockedMessage);
  payload.pregnancyToolLockedMessage = trimTo(form.pregnancyToolLockedMessage);
  payload.premiumTagLabel = trimTo(form.premiumTagLabel, 40);

  return payload;
};
