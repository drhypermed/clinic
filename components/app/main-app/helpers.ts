/**
 * مساعدات الواجهة الرئيسية للتطبيق (Main App Helpers)
 *
 * دوال مساعدة خالصة يستخدمها مكون `MainApp`:
 *   1. `extractQuotaErrorDetails` — استخراج تفاصيل خطأ الحصة من Cloud Function.
 *   2. `applyQuotaPlaceholders`   — استبدال {limit}/{used}/{remaining} في نص الحصة.
 *   3. `buildAgeTextFromParts`    — بناء نص عمر منسق من (سنوات/أشهر/أيام).
 *   4. `resolveAppointmentVisitDate` — تحويل Date موعد إلى YYYY-MM-DD محلي.
 */

import type { SmartQuotaLimitErrorDetails } from '../../../services/accountTypeControlsService';
import { toLocalDateStr } from '../../appointments/utils';

/**
 * استخراج تفاصيل حصة ذكية من كائن خطأ صادر عن Cloud Function.
 * ترجع null إن لم يحمل الخطأ الشكل المتوقع.
 */
export const extractQuotaErrorDetails = (error: unknown): SmartQuotaLimitErrorDetails | null => {
  const details = (error as { details?: unknown })?.details;
  if (!details || typeof details !== 'object') return null;

  const raw = details as Record<string, unknown>;
  const accountType = raw.accountType === 'premium' ? 'premium'
    : raw.accountType === 'pro_max' ? 'pro_max'
    : raw.accountType === 'free' ? 'free'
    : null;
  if (!accountType) return null;

  return {
    accountType,
    limit: Number(raw.limit || 0),
    used: Number(raw.used || 0),
    remaining: Number(raw.remaining || 0),
    dayKey: String(raw.dayKey || ''),
    whatsappNumber: String(raw.whatsappNumber || ''),
    whatsappUrl: String(raw.whatsappUrl || ''),
    limitReachedMessage: String(raw.limitReachedMessage || ''),
    whatsappMessage: String(raw.whatsappMessage || ''),
  };
};

/**
 * استبدال الـ placeholders القياسية {limit}/{used}/{remaining} في نص
 * رسالة الحصة القادم من الـ backend.
 */
export const applyQuotaPlaceholders = (template: string, details: SmartQuotaLimitErrorDetails): string => {
  const raw = String(template || '').trim();
  if (!raw) return '';

  return raw
    .replace(/\{\s*limit\s*\}/gi, String(Number(details.limit || 0)))
    .replace(/\{\s*used\s*\}/gi, String(Number(details.used || 0)))
    .replace(/\{\s*remaining\s*\}/gi, String(Number(details.remaining || 0)));
};

/**
 * بناء نص عمر مقروء بالعربية من أجزاء (سنة/شهر/يوم).
 * يتجاهل الأجزاء الصفرية ويُرجع undefined إن كانت كلها فارغة/صفراً.
 */
export const buildAgeTextFromParts = (years?: string, months?: string, days?: string): string | undefined => {
  const y = String(years || '').trim();
  const m = String(months || '').trim();
  const d = String(days || '').trim();
  const parts: string[] = [];
  if (y && y !== '0') parts.push(`${y} سنة`);
  if (m && m !== '0') parts.push(`${m} شهر`);
  if (d && d !== '0') parts.push(`${d} يوم`);
  return parts.length > 0 ? parts.join(' - ') : undefined;
};

/**
 * تحويل حقل `dateTime` لموعد (ISO أو أي صيغة Date قابلة للتحليل) إلى
 * مفتاح تاريخ محلي بصيغة YYYY-MM-DD. يُرجع null إن تعذر التحليل.
 */
export const resolveAppointmentVisitDate = (dateTime: string): string | null => {
  const parsed = new Date(String(dateTime || ''));
  if (Number.isNaN(parsed.getTime())) return null;
  return toLocalDateStr(parsed);
};
