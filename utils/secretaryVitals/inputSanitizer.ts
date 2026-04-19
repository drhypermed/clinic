/**
 * تنظيف مدخلات علامات السكرتارية (Secretary Vitals Input Sanitizer)
 *
 * الدوال التي تتعامل مع البيانات المستلمة من الواجهة/Firestore وتحولها
 * إلى `SecretaryVitalsInput` أو قائمة `SecretaryVitalEntry` قابلة للعرض:
 *   - `sanitizeSecretaryVitalsInput` : تنظيف وتوحيد المدخلات.
 *   - `toSecretaryVitalsEntries`     : تحويل المدخلات إلى قائمة للعرض.
 */

import type {
    SecretaryVitalFieldDefinition,
    SecretaryVitalsInput,
    SecretaryVitalsVisibility,
} from '../../types';
import { SECRETARY_VITAL_FIELDS, SECRETARY_VITAL_KEYS, toSecretaryCustomFieldId, toSecretaryVitalFieldId } from './constants';
import { normalizeSecretaryVitalFieldDefinitions } from './fieldDefinitions';
import {
    computeSecretaryBmiValue,
    getDefaultSecretaryFieldByKey,
    isSecretaryVitalKey,
    normalizeSecretaryFieldKey,
    normalizeSecretaryVitalValue,
} from './helpers';
import { resolveVisibilityByField } from './visibility';

/** نوع إدخال في قائمة العرض النهائية */
export type SecretaryVitalEntry = {
    key: string;
    label: string;
    shortLabel: string;
    unit: string;
    value: string;
};

/** استخراج قيمة من المصدر بحسب تعريف الحقل (مع fallback للمفاتيح المختلفة) */
const getSecretarySourceValueByField = (
    source: Record<string, unknown>,
    field: SecretaryVitalFieldDefinition
): unknown => {
    if (field.kind === 'vital' && field.key) {
        return source[field.key] ?? source[field.id];
    }

    if (field.customBoxId) {
        const customKey = toSecretaryCustomFieldId(field.customBoxId);
        return source[field.id] ?? source[customKey] ?? source[field.customBoxId];
    }

    return source[field.id];
};

/** تنظيف مدخلات السكرتارية مع فلترة حسب الرؤية وحساب BMI تلقائياً */
export const sanitizeSecretaryVitalsInput = (
    value: unknown,
    options: {
        visibility?: SecretaryVitalsVisibility;
        fieldDefinitions?: SecretaryVitalFieldDefinition[];
    } = {}
): SecretaryVitalsInput | undefined => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return undefined;
    }

    const source = value as Record<string, unknown>;
    const sanitized: SecretaryVitalsInput = {};
    const visibility = options.visibility;
    const normalizedFields = Array.isArray(options.fieldDefinitions) && options.fieldDefinitions.length > 0
        ? normalizeSecretaryVitalFieldDefinitions(options.fieldDefinitions)
        : null;

    if (normalizedFields) {
        normalizedFields.forEach((field) => {
            const canUse = resolveVisibilityByField(visibility, field.id, field.key);
            if (!canUse) return;
            const normalizedValue = normalizeSecretaryVitalValue(getSecretarySourceValueByField(source, field));
            if (!normalizedValue) return;

            if (field.kind === 'vital' && field.key) {
                sanitized[field.key] = normalizedValue;
            } else {
                sanitized[field.id] = normalizedValue;
            }
        });
    } else {
        SECRETARY_VITAL_KEYS.forEach((key) => {
            const fieldId = toSecretaryVitalFieldId(key);
            if (!resolveVisibilityByField(visibility, fieldId, key)) return;

            const normalizedValue = normalizeSecretaryVitalValue(source[key] ?? source[fieldId]);
            if (!normalizedValue) return;
            sanitized[key] = normalizedValue;
        });

        Object.keys(source).forEach((rawKey) => {
            const normalizedKey = normalizeSecretaryFieldKey(rawKey);
            if (!normalizedKey) return;
            if (isSecretaryVitalKey(normalizedKey)) return;
            if (normalizedKey.startsWith('vital:')) return;

            if (visibility) {
                if (!Object.prototype.hasOwnProperty.call(visibility, normalizedKey)) return;
                if (!Boolean(visibility[normalizedKey])) return;
            }

            const normalizedValue = normalizeSecretaryVitalValue(source[rawKey]);
            if (!normalizedValue) return;
            sanitized[normalizedKey] = normalizedValue;
        });
    }

    // إذا كان BMI مفعّل ولم يُدخل يدوياً، احسبه من الوزن والطول
    if (resolveVisibilityByField(visibility, toSecretaryVitalFieldId('bmi'), 'bmi') && !sanitized.bmi) {
        const computedBmi = computeSecretaryBmiValue(sanitized.weight, sanitized.height);
        if (computedBmi) sanitized.bmi = computedBmi;
    }

    return Object.keys(sanitized).length > 0 ? sanitized : undefined;
};

/** تحويل المدخلات إلى قائمة مسطّحة قابلة للعرض (مع تطبيق الرؤية والترتيب) */
export const toSecretaryVitalsEntries = (
    value: SecretaryVitalsInput | undefined,
    options: {
        visibility?: SecretaryVitalsVisibility;
        includeEmpty?: boolean;
        fieldDefinitions?: SecretaryVitalFieldDefinition[];
    } = {}
): SecretaryVitalEntry[] => {
    if (!value) return [];

    const source = value as Record<string, unknown>;
    const visibility = options.visibility;
    const normalizedFields = Array.isArray(options.fieldDefinitions) && options.fieldDefinitions.length > 0
        ? normalizeSecretaryVitalFieldDefinitions(options.fieldDefinitions)
        : null;

    if (normalizedFields) {
        return normalizedFields
            .filter((field) => resolveVisibilityByField(visibility, field.id, field.key))
            .map((field) => {
                const valueText = normalizeSecretaryVitalValue(getSecretarySourceValueByField(source, field));
                const label = String(field.labelAr || field.label || '').trim() || 'حقل';
                const shortLabel = field.kind === 'vital' && field.key
                    ? (getDefaultSecretaryFieldByKey(field.key)?.shortLabel || label)
                    : label;
                return {
                    key: field.kind === 'vital' && field.key ? field.key : field.id,
                    label,
                    shortLabel,
                    unit: String(field.unit || '').trim(),
                    value: valueText,
                };
            })
            .filter((entry) => options.includeEmpty || Boolean(entry.value));
    }

    return SECRETARY_VITAL_FIELDS
        .filter((field) => resolveVisibilityByField(visibility, field.id, field.key))
        .map((field) => ({
            key: field.key,
            label: field.label,
            shortLabel: field.shortLabel,
            unit: field.unit,
            value: normalizeSecretaryVitalValue(source[field.key]),
        }))
        .filter((entry) => options.includeEmpty || Boolean(entry.value));
};
