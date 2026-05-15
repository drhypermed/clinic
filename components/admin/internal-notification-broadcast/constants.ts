/**
 * ثوابت بث الإشعارات الداخلي (In-App Broadcast Constants)
 *
 * مستخرج من `InternalNotificationBroadcastPanel.tsx`.
 * ملاحظة: نستعير AUDIENCE_OPTIONS و CUSTOM_EMAIL_ROLE_MODE_OPTIONS و
 * EMAIL_REGEX من `external-notification-broadcast/constants` لتجنب التكرار،
 * مع إضافة STATUS_LABELS خاصة بالبث الداخلي.
 */

import type {
    CustomEmailRoleMode,
    ExternalNotificationAudience,
} from '../../../services/externalNotificationBroadcastService';
import { formatUserDateTime } from '../../../utils/cairoTime';

export {
    AUDIENCE_OPTIONS,
    CUSTOM_EMAIL_ROLE_MODE_OPTIONS,
    EMAIL_REGEX,
    getAudienceLabel,
    getCustomEmailRoleModeLabel,
    toSafeNumber,
    toSafeString,
} from '../external-notification-broadcast/constants';

/** سجل بث إشعار داخلي (من Firestore) */
export interface NotificationBroadcastRecord {
    id: string;
    status: string;
    title: string;
    body: string;
    targetAudience: ExternalNotificationAudience;
    customEmailRoleMode: CustomEmailRoleMode;
    targetEmail: string;
    targetEmailMasked: string;
    createdBy: string;
    createdAt: string;
    tokenCount: number;
    successCount: number;
    failureCount: number;
    failedBatchesCount: number;
    excludedDueToOverlapCount: number;
    matchedUserIdsCount: number;
    resultText: string;
}

/** حالات البث الداخلي (تختلف عن الخارجي: active/failed فقط) */
const STATUS_LABELS: Record<string, { label: string; className: string }> = {
    active: {
        label: 'نشط',
        className: 'bg-success-50 border-success-300 text-success-800',
    },
    failed: {
        label: 'فشل',
        className: 'bg-danger-50 border-danger-300 text-danger-800',
    },
};

export const getStatusDisplay = (status: string) =>
    STATUS_LABELS[status] || {
        label: status || 'غير معروف',
        className: 'bg-slate-100 border-slate-300 text-slate-800',
    };

export const formatInternalBroadcastDateTime = (value: string): string => {
    if (!value) return '-';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '-';
    return formatUserDateTime(parsed, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }, 'ar-EG');
};
