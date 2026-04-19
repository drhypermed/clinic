/**
 * تحويل تعريفات السكرتارية إلى VitalSignConfig (Secretary Vital Configs)
 *
 * يستخدم من طرف نظام الإعدادات لتحويل تعريفات الحقول إلى الصيغة المخزنة
 * في `PrescriptionSettings.vitals` (نفس شكل vitalsConfig الموجود في
 * إعدادات الروشتة).
 *
 * كذلك يحتوي على helpers الإشعارات لتسهيل إرسال قيم العلامات الحيوية
 * مع طلبات السكرتارية.
 */

import type {
    SecretaryVitalFieldDefinition,
    SecretaryVitalKey,
    SecretaryVitalsInput,
    SecretaryVitalsVisibility,
    VitalSignConfig,
} from '../../types';
import { SECRETARY_VITAL_KEYS, SECRETARY_VITAL_NOTIFICATION_PREFIX } from './constants';
import { buildSecretaryVitalFieldDefinitions, normalizeSecretaryVitalFieldDefinitions } from './fieldDefinitions';
import {
    getDefaultSecretaryFieldByKey,
    isSecretaryVitalKey,
    normalizeSecretaryVitalLabel,
    normalizeSecretaryVitalOrder,
    normalizeSecretaryVitalUnit,
    normalizeSecretaryVitalValue,
} from './helpers';
import { normalizeSecretaryVitalsVisibility, resolveVisibilityByField } from './visibility';
import { sanitizeSecretaryVitalsInput } from './inputSanitizer';

/** تحويل قائمة تعريفات حقول السكرتارية إلى VitalSignConfig (إعدادات الروشتة) */
export const toSecretaryVitalSignConfigs = (
    vitalsConfig: VitalSignConfig[] | undefined,
    options: {
        visibility?: SecretaryVitalsVisibility;
        fieldDefinitions?: SecretaryVitalFieldDefinition[];
    } = {}
): VitalSignConfig[] => {
    const sourceByKey = new Map<string, VitalSignConfig>();
    if (Array.isArray(vitalsConfig)) {
        vitalsConfig.forEach((item) => {
            const key = String(item?.key || '').trim();
            if (!isSecretaryVitalKey(key)) return;
            sourceByKey.set(key, item);
        });
    }

    const normalizedFields = normalizeSecretaryVitalFieldDefinitions(
        options.fieldDefinitions,
        buildSecretaryVitalFieldDefinitions(vitalsConfig, [])
    );

    const visibility = normalizeSecretaryVitalsVisibility(options.visibility);

    return normalizedFields
        .filter((field): field is SecretaryVitalFieldDefinition & { key: SecretaryVitalKey } =>
            field.kind === 'vital' && isSecretaryVitalKey(field.key)
        )
        .map((field, index) => {
            const key = field.key;
            const fallbackField = getDefaultSecretaryFieldByKey(key);
            const source = sourceByKey.get(key);

            return {
                key,
                label: normalizeSecretaryVitalLabel(source?.label, fallbackField.shortLabel),
                labelAr: normalizeSecretaryVitalLabel(field.labelAr || source?.labelAr, fallbackField.label),
                unit: normalizeSecretaryVitalUnit(field.unit || source?.unit, fallbackField.unit),
                enabled: resolveVisibilityByField(visibility, field.id, key),
                order: normalizeSecretaryVitalOrder(field.order || source?.order, index + 1),
            } as VitalSignConfig;
        })
        .sort((left, right) => left.order - right.order);
};

/** بناء مفتاح إشعار لعلامة حيوية (مثال: sv_weight) */
export const getSecretaryVitalNotificationKey = (key: SecretaryVitalKey): string =>
    `${SECRETARY_VITAL_NOTIFICATION_PREFIX}${key}`;

/** استخراج علامات حيوية من بيانات إشعار (مسطحة أو nested) */
export const extractSecretaryVitalsFromNotificationData = (
    value: Record<string, unknown>
): SecretaryVitalsInput | undefined => {
    const fromNested = sanitizeSecretaryVitalsInput(value.secretaryVitals);
    const fromFlat: SecretaryVitalsInput = {};

    SECRETARY_VITAL_KEYS.forEach((key) => {
        const notificationKey = getSecretaryVitalNotificationKey(key);
        const normalizedValue = normalizeSecretaryVitalValue(value[notificationKey]);
        if (!normalizedValue) return;
        fromFlat[key] = normalizedValue;
    });

    const merged: SecretaryVitalsInput = {
        ...(fromNested || {}),
        ...fromFlat,
    };

    return Object.keys(merged).length > 0 ? merged : undefined;
};
