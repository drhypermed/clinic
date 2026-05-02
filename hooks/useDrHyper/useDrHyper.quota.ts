/**
 * أدوات الكوتا — helpers مشتركة (extract error details + URL helpers + placeholders).
 *
 * ملاحظة (2026-05): شيلنا `createQuotaActions` factory — كانت dead code (مفيش حد
 * بيستوردها). الكود اللي كان داخلها كان wrapper بسيط حوالين الـAPI calls، والـuseDrHyper
 * بقى بيستدعي الـservice مباشرة بدون الـwrapper ده.
 */

import {
  SmartQuotaLimitErrorDetails,
} from '../../services/accountTypeControlsService';

const applyQuotaPlaceholders = (template: string, details: SmartQuotaLimitErrorDetails): string => {
  const raw = String(template || '').trim();
  if (!raw) return '';

  return raw
    .replace(/\{\s*limit\s*\}/gi, String(Number(details.limit || 0)))
    .replace(/\{\s*used\s*\}/gi, String(Number(details.used || 0)))
    .replace(/\{\s*remaining\s*\}/gi, String(Number(details.remaining || 0)));
};

const internalExtractSmartQuotaErrorDetails = (error: any): SmartQuotaLimitErrorDetails | null => {
    const details = error?.details;
    if (!details || typeof details !== 'object') return null;
    const d = details as Record<string, unknown>;
    if (d.accountType !== 'free' && d.accountType !== 'premium' && d.accountType !== 'pro_max') return null;
    return {
        accountType: d.accountType as 'free' | 'premium' | 'pro_max',
        limit: Number(d.limit || 0),
        used: Number(d.used || 0),
        remaining: Number(d.remaining || 0),
        dayKey: String(d.dayKey || ''),
        whatsappNumber: String(d.whatsappNumber || ''),
        whatsappUrl: String(d.whatsappUrl || ''),
        limitReachedMessage: String(d.limitReachedMessage || ''),
    };
};

export const extractSmartQuotaErrorDetails = (error: any): SmartQuotaLimitErrorDetails | null => {
  return internalExtractSmartQuotaErrorDetails(error);
};

export const buildWhatsAppUrlFromNumber = (number: string, message: string): string => {
    const digits = String(number || '').replace(/\D/g, '');
    if (!digits) return '';
    const text = encodeURIComponent(String(message || '').trim());
    return `https://wa.me/${digits}${text ? `?text=${text}` : ''}`;
};

const startsWithHttpProtocol = (value: string) => /^https?:\/\//i.test(value);
const startsWithWhatsAppHost = (value: string) =>
    /^(wa\.me\/|api\.whatsapp\.com\/)/i.test(value);

export const sanitizeExternalHttpUrl = (value?: string): string => {
    const raw = String(value || '').trim();
    if (!raw) return '';

    const normalized = startsWithHttpProtocol(raw)
        ? raw
        : (startsWithWhatsAppHost(raw) ? `https://${raw}` : '');
    if (!normalized) return '';

    try {
        const parsed = new URL(normalized);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
        return parsed.toString();
    } catch {
        return '';
    }
};

export const getQuotaReachedMessage = (details: SmartQuotaLimitErrorDetails, fallback: string): string => {
  const fromBackend = applyQuotaPlaceholders(details.limitReachedMessage || '', details);
    return fromBackend || fallback;
};

export const applyLimitPlaceholder = (template: string, limit: number, fallback: string): string => {
    const raw = String(template || '').trim();
    if (!raw) return fallback;
    return raw.replace(/\{\s*limit\s*\}/gi, String(limit));
};
