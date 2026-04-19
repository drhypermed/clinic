/**
 * منطق رؤية حقول السكرتارية (Secretary Vitals Visibility)
 *
 * الدوال المرتبطة بإدارة `SecretaryVitalsVisibility` — خريطة boolean توضح
 * أي حقول مرئية للسكرتارية:
 *   - `normalizeSecretaryVitalsVisibility`         : تنظيف خريطة خام.
 *   - `buildSecretaryVisibilityByFieldDefinitions` : بناء خريطة من تعريفات.
 *   - `isSecretaryFieldEnabled`                    : فحص حقل بـ fieldId + legacy key.
 *   - `isSecretaryVitalEnabled`                    : فحص حقل بمفتاح vital.
 *   - `getEnabledSecretaryVitalKeys`               : قائمة المفاتيح الـ vitals المفعّلة.
 */

import type {
    SecretaryVitalFieldDefinition,
    SecretaryVitalKey,
    SecretaryVitalsVisibility,
} from '../../types';
import { SECRETARY_VITAL_KEYS, toSecretaryVitalFieldId } from './constants';
import { createDefaultSecretaryVitalsVisibility, normalizeSecretaryVitalFieldDefinitions } from './fieldDefinitions';
import { normalizeSecretaryFieldKey, parseBoolean } from './helpers';

/** توحيد خريطة رؤية قادمة من أي مصدر */
export const normalizeSecretaryVitalsVisibility = (
    value: unknown,
    fallback?: SecretaryVitalsVisibility
): SecretaryVitalsVisibility => {
    const base: SecretaryVitalsVisibility = {
        ...createDefaultSecretaryVitalsVisibility(),
        ...(fallback || {}),
    };

    if (value && typeof value === 'object' && !Array.isArray(value)) {
        const source = value as Record<string, unknown>;
        Object.keys(source).forEach((key) => {
            const normalizedKey = normalizeSecretaryFieldKey(key);
            if (!normalizedKey) return;
            const parsed = parseBoolean(source[key]);
            if (parsed === null) return;
            base[normalizedKey] = parsed;
        });
    }

    // ضمان التوافق الثنائي بين fieldId و legacy key (vital:weight == weight)
    SECRETARY_VITAL_KEYS.forEach((key) => {
        const vitalId = toSecretaryVitalFieldId(key);
        const hasId = Object.prototype.hasOwnProperty.call(base, vitalId);
        const hasKey = Object.prototype.hasOwnProperty.call(base, key);
        const resolved = hasId ? Boolean(base[vitalId]) : hasKey ? Boolean(base[key]) : false;
        base[vitalId] = resolved;
        base[key] = resolved;
    });

    return base;
};

/** فحص الرؤية حسب fieldId أولاً ثم legacy key (internal) */
export const resolveVisibilityByField = (
    visibility: SecretaryVitalsVisibility | undefined,
    fieldId: string,
    legacyKey?: string
): boolean => {
    if (!visibility) return true;

    if (Object.prototype.hasOwnProperty.call(visibility, fieldId)) {
        return Boolean(visibility[fieldId]);
    }

    if (legacyKey && Object.prototype.hasOwnProperty.call(visibility, legacyKey)) {
        return Boolean(visibility[legacyKey]);
    }

    return false;
};

/** بناء خريطة رؤية من قائمة تعريفات + رؤية موجودة (مع fallback للتعريفات) */
export const buildSecretaryVisibilityByFieldDefinitions = (
    fieldDefinitions: SecretaryVitalFieldDefinition[] | undefined,
    visibility?: SecretaryVitalsVisibility
): SecretaryVitalsVisibility => {
    const hasVisibilityInput = Boolean(
        visibility && typeof visibility === 'object' && !Array.isArray(visibility)
    );
    const normalizedVisibility: SecretaryVitalsVisibility = {};
    if (hasVisibilityInput) {
        const source = visibility as Record<string, unknown>;
        Object.keys(source).forEach((key) => {
            const normalizedKey = normalizeSecretaryFieldKey(key);
            if (!normalizedKey) return;
            const parsed = parseBoolean(source[key]);
            if (parsed === null) return;
            normalizedVisibility[normalizedKey] = parsed;
        });
    }
    const normalizedFields = normalizeSecretaryVitalFieldDefinitions(fieldDefinitions);
    const result: SecretaryVitalsVisibility = { ...normalizedVisibility };

    normalizedFields.forEach((field) => {
        const fallbackEnabled = Boolean(field.enabled);
        const hasFieldId = Object.prototype.hasOwnProperty.call(normalizedVisibility, field.id);
        const hasLegacyKey = Boolean(
            field.key && Object.prototype.hasOwnProperty.call(normalizedVisibility, field.key)
        );

        const isVisible = hasFieldId
            ? Boolean(normalizedVisibility[field.id])
            : hasLegacyKey && field.key
                ? Boolean(normalizedVisibility[field.key])
                : fallbackEnabled;

        result[field.id] = isVisible;
        if (field.kind === 'vital' && field.key) {
            result[field.key] = isVisible;
        }
    });

    return normalizeSecretaryVitalsVisibility(result);
};

/** فحص حقل سكرتارية (fieldId + legacy key fallback) */
export const isSecretaryFieldEnabled = (
    visibility: SecretaryVitalsVisibility | undefined,
    fieldId: string,
    legacyKey?: string
): boolean => resolveVisibilityByField(visibility, fieldId, legacyKey);

/** فحص حقل علامة حيوية بمفتاحه مباشرة */
export const isSecretaryVitalEnabled = (
    visibility: SecretaryVitalsVisibility | undefined,
    key: SecretaryVitalKey
): boolean => resolveVisibilityByField(visibility, toSecretaryVitalFieldId(key), key);

/** قائمة مفاتيح العلامات الحيوية المفعّلة فقط */
export const getEnabledSecretaryVitalKeys = (
    visibility: SecretaryVitalsVisibility | undefined
): SecretaryVitalKey[] => {
    if (!visibility) return [];
    return SECRETARY_VITAL_KEYS.filter((key) => isSecretaryVitalEnabled(visibility, key));
};
