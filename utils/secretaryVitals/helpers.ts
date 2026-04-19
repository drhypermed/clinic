/**
 * مساعدات داخلية لعلامات السكرتارية الحيوية (Secretary Vitals Helpers)
 *
 * دوال خالصة مستخدمة من طرف modules أخرى في هذه الوحدة:
 *   - فحص المفاتيح والصيغ.
 *   - تحويل قيم نصية/رقمية إلى الصيغ المعيارية.
 *   - حساب BMI.
 *   - Lookup للحقول الافتراضية.
 */

import type { SecretaryVitalFieldDefinition, SecretaryVitalKey } from '../../types';
import {
    SECRETARY_FIELD_KEY_PATTERN,
    SECRETARY_VITAL_FIELDS,
    SECRETARY_VITAL_KEYS,
    SECRETARY_VITAL_KEY_SET,
    SECRETARY_VITAL_MAX_VALUE_LENGTH,
    toSecretaryVitalFieldId,
    type SecretaryVitalFieldMeta,
} from './constants';

/** هل القيمة مفتاح علامة حيوية صالح؟ */
export const isSecretaryVitalKey = (value: unknown): value is SecretaryVitalKey =>
    SECRETARY_VITAL_KEY_SET.has(String(value || '').trim());

/** استخراج مفتاح علامة حيوية من معرّف حقل vital:... */
export const parseSecretaryVitalKeyFromFieldId = (fieldId: unknown): SecretaryVitalKey | null => {
    const text = String(fieldId || '').trim();
    if (!text.startsWith('vital:')) return null;
    const maybeKey = text.slice('vital:'.length);
    return isSecretaryVitalKey(maybeKey) ? maybeKey : null;
};

/** تحليل قيمة بوليانية من أي نوع (true/false/null إن لم تصلح) */
export const parseBoolean = (value: unknown): boolean | null => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (normalized === 'true') return true;
        if (normalized === 'false') return false;
    }
    return null;
};

/** توحيد مفتاح حقل سكرتارية (regex validation) */
export const normalizeSecretaryFieldKey = (value: unknown): string => {
    const normalized = String(value || '').trim();
    if (!normalized) return '';
    if (!SECRETARY_FIELD_KEY_PATTERN.test(normalized)) return '';
    return normalized;
};

/** توحيد تسمية حقل (مع fallback) */
export const normalizeSecretaryVitalLabel = (value: unknown, fallback: string): string => {
    const normalized = String(value || '').trim();
    return normalized || fallback;
};

/** توحيد وحدة حقل (مع fallback) */
export const normalizeSecretaryVitalUnit = (value: unknown, fallback: string): string => {
    const normalized = String(value || '').trim();
    return normalized || fallback;
};

/** توحيد ترتيب حقل (integer موجب) */
export const normalizeSecretaryVitalOrder = (value: unknown, fallback: number): number => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(1, Math.floor(parsed));
};

/** توحيد قيمة علامة حيوية (trim + cap طول) */
export const normalizeSecretaryVitalValue = (value: unknown): string => {
    const normalized = String(value ?? '').replace(/\s+/g, ' ').trim();
    if (!normalized) return '';
    return normalized.slice(0, SECRETARY_VITAL_MAX_VALUE_LENGTH);
};

/** حساب BMI من الوزن والطول (weight kg / height cm) */
export const computeSecretaryBmiValue = (weightValue: unknown, heightValue: unknown): string => {
    const weight = Number.parseFloat(normalizeSecretaryVitalValue(weightValue));
    const heightCm = Number.parseFloat(normalizeSecretaryVitalValue(heightValue));
    if (!Number.isFinite(weight) || !Number.isFinite(heightCm) || weight <= 0 || heightCm <= 0) {
        return '';
    }

    const heightMeter = heightCm / 100;
    if (heightMeter <= 0) return '';
    return (weight / (heightMeter * heightMeter)).toFixed(1);
};

/** الحصول على metadata حقل افتراضي حسب المفتاح */
export const getDefaultSecretaryFieldByKey = (key: SecretaryVitalKey): SecretaryVitalFieldMeta =>
    SECRETARY_VITAL_FIELDS.find((field) => field.key === key) || SECRETARY_VITAL_FIELDS[0];

/** بناء قائمة التعريفات الافتراضية لكل العلامات الحيوية */
export const getSecretaryDefaultDefinitions = (): SecretaryVitalFieldDefinition[] =>
    SECRETARY_VITAL_KEYS.map((key, index) => {
        const fallbackField = getDefaultSecretaryFieldByKey(key);
        return {
            id: toSecretaryVitalFieldId(key),
            kind: 'vital',
            key,
            label: fallbackField.label,
            labelAr: fallbackField.label,
            unit: fallbackField.unit,
            order: index + 1,
            enabled: false,
        };
    });
