/**
 * ثوابت بث الإشعارات الخارجي (External Notification Broadcast Constants)
 *
 * ثوابت + helpers خالصة مستخرجة من `ExternalNotificationBroadcastPanel.tsx`.
 */

import type {
    CustomEmailRoleMode,
    ExternalNotificationAudience,
    FailureReasonItem,
} from '../../../services/externalNotificationBroadcastService';
import { formatUserDateTime } from '../../../utils/cairoTime';

/** سجل بث إشعار خارجي (من Firestore) */
export interface NotificationBroadcastRecord {
    id: string;
    status: string;
    title: string;
    body: string;
    targetAudience: ExternalNotificationAudience;
    targetEmail: string;
    customEmailRoleMode: CustomEmailRoleMode;
    createdBy: string;
    createdAt: string;
    sentAt: string;
    tokenCount: number;
    successCount: number;
    failureCount: number;
    failedBatchesCount: number;
    excludedDueToOverlapCount: number;
    retryPolicy: string;
    retryAttempted: boolean;
    failureReasons: FailureReasonItem[];
    resultText: string;
}

/** الجمهور المستهدف للبث */
export const AUDIENCE_OPTIONS: Array<{ value: ExternalNotificationAudience; label: string }> = [
    { value: 'doctors', label: 'الأطباء فقط' },
    { value: 'secretaries', label: 'السكرتارية فقط' },
    { value: 'public', label: 'الجمهور فقط' },
    { value: 'doctor_secretaries', label: 'الأطباء + السكرتارية' },
    { value: 'doctor_public', label: 'الأطباء + الجمهور' },
    { value: 'doctors_premium_active', label: 'أطباء برو حاليا' },
    { value: 'doctors_free_never_premium', label: 'أطباء مجانيون لم يشتركوا من قبل' },
    { value: 'doctors_free_expired_premium', label: 'أطباء عادوا للمجاني بعد انتهاء برو' },
    { value: 'all', label: 'الجميع' },
    { value: 'custom', label: 'مخصص (إيميل محدد)' },
];

/** regex للتحقق من صيغة البريد الإلكتروني */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** أنماط دور المستخدم المرتبط بإيميل مخصص */
export const CUSTOM_EMAIL_ROLE_MODE_OPTIONS: Array<{ value: CustomEmailRoleMode; label: string }> = [
    { value: 'all_linked', label: 'الكل المرتبط بالإيميل' },
    { value: 'doctor_only', label: 'الطبيب فقط' },
    { value: 'secretary_only', label: 'السكرتارية فقط' },
    { value: 'doctor_and_secretary', label: 'الطبيب + السكرتارية' },
];

/** تسميات حالات البث (ألوان + عربي) */
const STATUS_LABELS: Record<string, { label: string; className: string }> = {
    sending: {
        label: 'جارٍ الإرسال',
        className: 'bg-warning-50 border-warning-300 text-warning-800',
    },
    sent: {
        label: 'تم الإرسال',
        className: 'bg-success-50 border-success-300 text-success-800',
    },
    partial: {
        label: 'إرسال جزئي',
        className: 'bg-brand-50 border-brand-300 text-brand-800',
    },
    failed: {
        label: 'فشل الإرسال',
        className: 'bg-danger-50 border-danger-300 text-danger-800',
    },
};

// ─── Helpers خالصة ───────────────────────────────────────

export const toSafeString = (value: unknown, fallback = ''): string => {
    const normalized = String(value || '').trim();
    return normalized || fallback;
};

export const toSafeNumber = (value: unknown): number => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
};

export const formatBroadcastDateTime = (value: string): string => {
    if (!value) return '-';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '-';
    return formatUserDateTime(parsed, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }, 'ar-EG');
};

export const getAudienceLabel = (audience: ExternalNotificationAudience): string =>
    AUDIENCE_OPTIONS.find((item) => item.value === audience)?.label || audience;

export const getStatusDisplay = (status: string) =>
    STATUS_LABELS[status] || {
        label: status || 'غير معروف',
        className: 'bg-slate-100 border-slate-300 text-slate-800',
    };

export const getCustomEmailRoleModeLabel = (mode: CustomEmailRoleMode): string =>
    CUSTOM_EMAIL_ROLE_MODE_OPTIONS.find((item) => item.value === mode)?.label || mode;

export const formatFailureReasons = (failureReasons: FailureReasonItem[] | undefined): string => {
    if (!Array.isArray(failureReasons) || failureReasons.length === 0) {
        return 'لا توجد أسباب فشل مسجلة.';
    }

    return failureReasons
        .slice(0, 5)
        .map((item) => {
            const code = toSafeString(item.code, 'unknown_error');
            const count = toSafeNumber(item.count);
            const message = toSafeString(item.message);
            return message ? `- ${code} (${count}) — ${message}` : `- ${code} (${count})`;
        })
        .join('\n');
};
