/**
 * إدارة الكوتا والصلاحيات (createQuotaActions):
 * يتحكم هذا الملف في التواصل مع نظام التحقق من حدود الاستخدام (Quota System).
 * 
 * المهام الرئيسية:
 * 1. استهلاك كوتا الحفظ (Record Saving Quota).
 * 2. استهلاك كوتا التحليل الذكي (Smart Analysis Quota).
 * 3. استخراج تفاصيل الخطأ في حالة الوصول للحد الأقصى (WhatsApp Support info, etc).
 */

import { 
  SmartQuotaLimitErrorDetails,
  consumeSmartPrescriptionQuota as apiConsumeSmartPrescriptionQuota,
  consumeStorageQuota as apiConsumeStorageQuota,
} from '../../services/accountTypeControlsService';

interface CreateQuotaActionsParams {
  user: { uid: string } | null | undefined;
}

const applyQuotaPlaceholders = (template: string, details: SmartQuotaLimitErrorDetails): string => {
  const raw = String(template || '').trim();
  if (!raw) return '';

  return raw
    .replace(/\{\s*limit\s*\}/gi, String(Number(details.limit || 0)))
    .replace(/\{\s*used\s*\}/gi, String(Number(details.used || 0)))
    .replace(/\{\s*remaining\s*\}/gi, String(Number(details.remaining || 0)));
};

const createQuotaActions = ({ user }: CreateQuotaActionsParams) => {
  /** استهلاك كوتا التخزين (حفظ الكشوفات أو الروشتات الجاهزة) */
  const consumeStorageQuota = async (feature: 'recordSave' | 'readyPrescriptionSave') => {
    if (!user) throw new Error('User not logged in');
    // Note: The service uses internal authentication, so we don't pass UID here anymore
    return await apiConsumeStorageQuota(feature);
  };

  /** استهلاك كوتا التحليل الذكي باستخدام الذكاء الاصطناعي */
  const consumeSmartPrescriptionQuota = async () => {
    if (!user) throw new Error('User not logged in');
    return await apiConsumeSmartPrescriptionQuota();
  };

  /** استخراج تفاصيل خطأ الكوتا لعرضها في مودال مخصص (مثل رابط واتساب للدعم) */
  const extractSmartQuotaErrorDetails = (error: unknown) => {
    // This function is defined below in this file
    return internalExtractSmartQuotaErrorDetails(error);
  };

  /** صياغة رسالة واضحة للمستخدم عند الوصول للحد الأقصى */
  const getQuotaReachedMessage = (details: SmartQuotaLimitErrorDetails, fallback: string) => {
    const fromBackend = applyQuotaPlaceholders(details.limitReachedMessage || '', details);
    return fromBackend || fallback;
  };

  return {
    consumeStorageQuota,
    consumeSmartPrescriptionQuota,
    extractSmartQuotaErrorDetails,
    getQuotaReachedMessage,
  };
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
