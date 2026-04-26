/**
 * الملف: helpers.ts
 * الوصف: "الأدوات المساعدة" لواجهة السكرتارية. 
 * يحتوي على وظائف تقنية صغيرة تدعم العمليات اليومية: 
 * - توليد "توكنات الجلسة" (Session Tokens) العشوائية للأمان. 
 * - تحويل "أكواد الحالة" إلى نصوص عربية مفهومة (مثل مصدر الحجز). 
 * - معالجة وتنسيق الروابط الخارجية (مثل رابط الواتساب). 
 * - استخراج أخطاء "الكوتا" (Quota Errors) وتحويلها لتنبيهات سهلة القراءة.
 */
import type { BookingQuotaNotice } from './types';

// دوال مساعدة لإنشاء مفاتيح التخزين بناءً على معرف المستخدم أو الكود السري
export const secretaryAuthSecretKey = (secretValue: string) => `sec_auth_${secretValue}`;
export const secretaryAuthUserKey = (userIdValue: string) => `sec_auth_uid_${userIdValue}`;
/** الفرع المربوط بـ session السكرتارية الحالية */
export const secretaryBranchKey = (secretValue: string) => `sec_branch_${secretValue}`;

// جلب التوقيت الحالي بتنسيق (ساعة:دقيقة) مناسب لحقول الإدخال
export const getDefaultTimeStr = () => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

// تحويل مصدر الحجز إلى نص عربي مفهوم (الطبيب، السكرتارية، أونلاين)
export const getSourceLabel = (source?: 'clinic' | 'secretary' | 'public') => {
  if (source === 'secretary') return 'من السكرتيرة';
  if (source === 'public') return 'حجز إلكتروني';
  return 'من الطبيب';
};

/**
 * يرجع تنسيق Tailwind لـ badge مصدر الحجز — لون مختلف لكل مصدر للتمييز السريع.
 * - الطبيب (clinic): أزرق — يلفت الانتباه أن الموعد من حساب الطبيب
 * - السكرتيرة: بنفسجي — مواعيد السكرتيرة العادية
 * - الجمهور: أخضر — حجز إلكتروني خارجي
 */
export const getSourceBadgeStyle = (source?: 'clinic' | 'secretary' | 'public'): string => {
  if (source === 'clinic') return 'bg-brand-100 text-brand-700 border-brand-200';
  if (source === 'public') return 'bg-success-100 text-success-700 border-success-200';
  // secretary (و undefined fallback)
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

/** يرجع emoji icon قصير للتمييز البصري السريع. */
export const getSourceIcon = (source?: 'clinic' | 'secretary' | 'public'): string => {
  if (source === 'clinic') return '🩺';
  if (source === 'public') return '🌐';
  return '✍️';
};

// بناء رابط WhatsApp المباشر مع تنسيق رقم الهاتف والرسالة
const buildWhatsAppUrlFromNumber = (number: string, message: string): string => {
  const digits = String(number || '').replace(/\D/g, ''); // استخراج الأرقام فقط
  if (!digits) return '';
  const text = encodeURIComponent(String(message || '').trim());
  return `https://wa.me/${digits}${text ? `?text=${text}` : ''}`;
};

/**
 * استخراج تفاصيل تجاوز "حد الحجز اليومي" (Quota) من رسالة الخطأ القادمة من السيرفر.
 * تساعد في إظهار رسالة واضحة للمستخدم حول كيفية التواصل مع العيادة عبر واتساب في حال اكتمال العدد.
 */
export const extractBookingQuotaNotice = (error: unknown): BookingQuotaNotice | null => {
  const e = error as { code?: string; message?: string; details?: unknown };
  const code = String(e?.code || '').replace(/^functions\//, '');
  const message = String(e?.message || '');
  const isDailyLimit = code === 'resource-exhausted' || message.includes('BOOKING_DAILY_LIMIT_REACHED');
  if (!isDailyLimit) return null;

  const details =
    e?.details && typeof e.details === 'object'
      ? (e.details as Record<string, unknown>)
      : null;
  const limit = Number(details?.limit || 0);
  const withLimit = (template: string) => template.replace(/\{\s*limit\s*\}/gi, String(limit));
  const limitReachedMessage = withLimit(String(details?.limitReachedMessage || '').trim());
  const whatsappMessage = withLimit(String(details?.whatsappMessage || '').trim());
  const whatsappNumber = String(details?.whatsappNumber || '').trim();
  const whatsappUrl =
    buildWhatsAppUrlFromNumber(whatsappNumber, whatsappMessage || limitReachedMessage) ||
    String(details?.whatsappUrl || '').trim();

  return {
    message: limitReachedMessage || 'تم استهلاك الحد اليومي للمواعيد.',
    whatsappUrl,
    whatsappNumber,
  };
};
