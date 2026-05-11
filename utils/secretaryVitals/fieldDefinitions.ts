/**
 * تعريفات حقول علامات السكرتارية الحيوية (Secretary Vital Field Definitions)
 *
 * يحتوي على الدوال التي تبني/تنظّف مصفوفات `SecretaryVitalFieldDefinition`
 * من مصادر مختلفة (إعدادات الروشتة، custom boxes، بيانات خام قادمة من
 * Firestore):
 *
 *   - `sanitizeSecretaryFieldDefinition`  : تنظيف تعريف واحد.
 *   - `buildSecretaryVitalFieldDefinitions`: بناء من vitalsConfig + customBoxes.
 *   - `normalizeSecretaryVitalFieldDefinitions`: توحيد قائمة جاءت من أي مصدر.
 *   - `createDefaultSecretaryVitalsVisibility`: بناء خريطة رؤية افتراضية.
 */

import type {
    CustomBox,
    SecretaryVitalFieldDefinition,
    SecretaryVitalKey,
    SecretaryVitalsVisibility,
    VitalSignConfig,
} from '../../types';
import {
    HEAD_CIRC_VITAL_KEY,
    SECRETARY_CUSTOM_ORDER_OFFSET,
    getSecretaryVitalKeysForSpecialty,
    isPediatricSpecialtyForSecretaryVitals,
    isSecretaryVitalKeyAllowedForSpecialty,
    toSecretaryCustomFieldId,
    toSecretaryVitalFieldId,
    type SecretaryVitalsSpecialtyOptions,
} from './constants';
import {
    getDefaultSecretaryFieldByKey,
    getSecretaryDefaultDefinitions,
    isSecretaryVitalKey,
    normalizeSecretaryFieldKey,
    normalizeSecretaryVitalLabel,
    normalizeSecretaryVitalOrder,
    normalizeSecretaryVitalUnit,
    parseBoolean,
    parseSecretaryVitalKeyFromFieldId,
} from './helpers';

/** توحيد ترتيب تعريف حقل (alias لـ normalizeSecretaryVitalOrder للوضوح) */
const normalizeSecretaryFieldDefinitionOrder = (value: unknown, fallback: number): number =>
    normalizeSecretaryVitalOrder(value, fallback);

const isSecretaryFieldDefinitionAllowedForSpecialty = (
    field: SecretaryVitalFieldDefinition,
    options: SecretaryVitalsSpecialtyOptions = {}
): boolean =>
    field.kind !== 'vital' ||
    !field.key ||
    isSecretaryVitalKeyAllowedForSpecialty(field.key, options.doctorSpecialty);

/** تحليل نوع الحقل (vital أو customBox) */
const normalizeSecretaryFieldDefinitionKind = (
    value: unknown,
    fallback: 'vital' | 'customBox'
): 'vital' | 'customBox' => {
    const normalized = String(value || '').trim().toLowerCase();
    if (normalized === 'vital') return 'vital';
    if (normalized === 'custombox' || normalized === 'custom_box') return 'customBox';
    return fallback;
};

/** تنظيف تعريف حقل واحد قادم من بيانات خام */
const sanitizeSecretaryFieldDefinition = (
    value: unknown,
    fallback?: SecretaryVitalFieldDefinition
): SecretaryVitalFieldDefinition | null => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return fallback || null;
    }

    const source = value as Record<string, unknown>;

    const inferredVitalKey = isSecretaryVitalKey(source.key)
        ? source.key
        : parseSecretaryVitalKeyFromFieldId(source.id);
    const inferredKind: 'vital' | 'customBox' = inferredVitalKey ? 'vital' : 'customBox';

    const kind = normalizeSecretaryFieldDefinitionKind(source.kind, fallback?.kind || inferredKind);
    const vitalKey = kind === 'vital'
        ? (inferredVitalKey || fallback?.key || null)
        : null;

    if (kind === 'vital' && !vitalKey) return null;

    const fallbackId = fallback?.id || (vitalKey ? toSecretaryVitalFieldId(vitalKey) : '');
    const rawId = normalizeSecretaryFieldKey(source.id);
    const resolvedId = rawId || fallbackId;
    if (!resolvedId) return null;

    const customBoxId = kind === 'customBox'
        ? normalizeSecretaryFieldKey(source.customBoxId) || fallback?.customBoxId || ''
        : '';

    const fallbackLabel = fallback?.label || (vitalKey ? getDefaultSecretaryFieldByKey(vitalKey).label : 'حقل مخصص');
    const fallbackLabelAr = fallback?.labelAr || fallbackLabel;

    const enabledValue =
        parseBoolean(source.enabled) ??
        (typeof fallback?.enabled === 'boolean' ? fallback.enabled : undefined);

    const normalized: SecretaryVitalFieldDefinition = {
        id: resolvedId,
        kind,
        label: normalizeSecretaryVitalLabel(source.label, fallbackLabel),
        labelAr: normalizeSecretaryVitalLabel(source.labelAr, fallbackLabelAr),
        unit: normalizeSecretaryVitalUnit(source.unit, fallback?.unit || ''),
        order: normalizeSecretaryFieldDefinitionOrder(source.order, fallback?.order || 1),
    };

    if (kind === 'vital' && vitalKey) {
        normalized.key = vitalKey;
    }

    if (kind === 'customBox') {
        const inferredCustomId =
            customBoxId ||
            (resolvedId.startsWith('custom:') ? resolvedId.slice('custom:'.length) : '');
        if (inferredCustomId) {
            normalized.customBoxId = inferredCustomId;
        }
    }

    if (enabledValue !== undefined) {
        normalized.enabled = enabledValue;
    }

    return normalized;
};

/** بناء تعريفات الحقول من vitalsConfig + customBoxes (مستخدم في MainApp) */
export const buildSecretaryVitalFieldDefinitions = (
    vitalsConfig: VitalSignConfig[] | undefined,
    customBoxes: CustomBox[] | undefined = [],
    options: SecretaryVitalsSpecialtyOptions = {}
): SecretaryVitalFieldDefinition[] => {
    const allowedVitalKeys = getSecretaryVitalKeysForSpecialty(options.doctorSpecialty);
    const sourceByKey = new Map<SecretaryVitalKey, VitalSignConfig>();
    if (Array.isArray(vitalsConfig)) {
        vitalsConfig.forEach((item) => {
            const key = String(item?.key || '').trim();
            if (!isSecretaryVitalKey(key)) return;
            if (!isSecretaryVitalKeyAllowedForSpecialty(key, options.doctorSpecialty)) return;
            sourceByKey.set(key, item);
        });
    }

    const vitalDefinitions = allowedVitalKeys.map((key, index) => {
        const fallbackField = getDefaultSecretaryFieldByKey(key);
        const source = sourceByKey.get(key);

        return {
            id: toSecretaryVitalFieldId(key),
            kind: 'vital' as const,
            key,
            label: normalizeSecretaryVitalLabel(source?.labelAr, fallbackField.label),
            labelAr: normalizeSecretaryVitalLabel(source?.labelAr, fallbackField.label),
            unit: normalizeSecretaryVitalUnit(source?.unit, fallbackField.unit),
            order: normalizeSecretaryVitalOrder(source?.order, index + 1),
            enabled: source
                ? Boolean(source.enabled)
                : key === HEAD_CIRC_VITAL_KEY && isPediatricSpecialtyForSecretaryVitals(options.doctorSpecialty),
        };
    });

    const customDefinitions: SecretaryVitalFieldDefinition[] = Array.isArray(customBoxes)
        ? customBoxes
            .filter((box) => Boolean(box?.enabled))
            .map<SecretaryVitalFieldDefinition | null>((box, index) => {
                const customBoxId = String(box?.id || '').trim();
                const id = toSecretaryCustomFieldId(customBoxId);
                if (!id) return null;

                const label = String(box?.label || '').trim();
                const fallbackLabel = label || `حقل مخصص ${index + 1}`;

                return {
                    id,
                    kind: 'customBox' as const,
                    customBoxId,
                    label: fallbackLabel,
                    labelAr: fallbackLabel,
                    unit: '',
                    order: SECRETARY_CUSTOM_ORDER_OFFSET + normalizeSecretaryVitalOrder(box?.order, index + 1),
                    enabled: true,
                };
            })
            .filter((item): item is SecretaryVitalFieldDefinition => Boolean(item))
        : [];

    return [...vitalDefinitions, ...customDefinitions].sort((left, right) => left.order - right.order);
};

/** توحيد قائمة تعريفات حقول قادمة من أي مصدر (مع fallback افتراضي) */
export const normalizeSecretaryVitalFieldDefinitions = (
    value: unknown,
    fallback?: SecretaryVitalFieldDefinition[],
    options: SecretaryVitalsSpecialtyOptions = {}
): SecretaryVitalFieldDefinition[] => {
    const normalizedById = new Map<string, SecretaryVitalFieldDefinition>();
    const fallbackDefinitions = Array.isArray(fallback)
        ? fallback
        : getSecretaryDefaultDefinitions();

    fallbackDefinitions.forEach((item, index) => {
        const normalized = sanitizeSecretaryFieldDefinition(item, {
            ...item,
            order: normalizeSecretaryFieldDefinitionOrder(item.order, index + 1),
        });
        if (!normalized) return;
        if (!isSecretaryFieldDefinitionAllowedForSpecialty(normalized, options)) return;
        normalizedById.set(normalized.id, normalized);
    });

    if (Array.isArray(value)) {
        value.forEach((item, index) => {
            const source = item as Record<string, unknown>;
            const fallbackById = normalizeSecretaryFieldKey(source?.id)
                ? normalizedById.get(normalizeSecretaryFieldKey(source?.id))
                : undefined;
            const normalized = sanitizeSecretaryFieldDefinition(item, fallbackById || undefined);
            if (!normalized) return;
            if (!isSecretaryFieldDefinitionAllowedForSpecialty(normalized, options)) return;

            if (!Number.isFinite(normalized.order) || normalized.order <= 0) {
                normalized.order = normalizeSecretaryFieldDefinitionOrder(normalized.order, index + 1);
            }

            normalizedById.set(normalized.id, normalized);
        });
    }

    getSecretaryVitalKeysForSpecialty(options.doctorSpecialty).forEach((key, index) => {
        const vitalId = toSecretaryVitalFieldId(key);
        if (normalizedById.has(vitalId)) return;
        const fallbackField = getDefaultSecretaryFieldByKey(key);
        normalizedById.set(vitalId, {
            id: vitalId,
            kind: 'vital',
            key,
            label: fallbackField.label,
            labelAr: fallbackField.label,
            unit: fallbackField.unit,
            order: index + 1,
            enabled: key === HEAD_CIRC_VITAL_KEY && isPediatricSpecialtyForSecretaryVitals(options.doctorSpecialty),
        });
    });

    return Array.from(normalizedById.values())
        .filter((field) => isSecretaryFieldDefinitionAllowedForSpecialty(field, options))
        .sort((left, right) => left.order - right.order);
};

/** بناء خريطة رؤية افتراضية (كل الحقول مخفية) */
export const createDefaultSecretaryVitalsVisibility = (
    options: SecretaryVitalsSpecialtyOptions = {}
): SecretaryVitalsVisibility => {
    const visibility: SecretaryVitalsVisibility = {};
    getSecretaryVitalKeysForSpecialty(options.doctorSpecialty).forEach((key) => {
        visibility[key] = false;
        visibility[toSecretaryVitalFieldId(key)] = false;
    });
    return visibility;
};

/**
 * العلامات الحيوية الشائعة المُفعَّلة افتراضياً — تُستخدم كـ fallback عندما
 * لم يضبط الطبيب إعدادات السكرتيرة بعد. السكرتيرة تقدر تكتب فيهم فوراً بدون
 * انتظار إعدادات الطبيب. BMI مُفعَّل كمان لأنه محسوب تلقائياً من weight+height.
 */
const COMMON_ENABLED_VITAL_KEYS: ReadonlySet<SecretaryVitalKey> = new Set<SecretaryVitalKey>([
    'weight',
    'height',
    'bmi',
    'bp',
    'pulse',
    'temp',
]);

const isCommonEnabledVitalKey = (
    key: SecretaryVitalKey,
    options: SecretaryVitalsSpecialtyOptions = {}
): boolean =>
    COMMON_ENABLED_VITAL_KEYS.has(key) ||
    (key === HEAD_CIRC_VITAL_KEY && isPediatricSpecialtyForSecretaryVitals(options.doctorSpecialty));

/**
 * بناء تعريفات حقول العلامات الحيوية مع تمكين الحقول الشائعة افتراضياً.
 * تُستخدم في الحالة التي لم يُهيّئ فيها الطبيب إعدادات السكرتيرة بعد —
 * بدونها كل الحقول ترجع enabled=false ولا تظهر أي واجهة إدخال للسكرتيرة.
 */
export const buildSecretaryVitalFieldDefinitionsWithDefaults = (
    options: SecretaryVitalsSpecialtyOptions = {}
): SecretaryVitalFieldDefinition[] =>
    getSecretaryVitalKeysForSpecialty(options.doctorSpecialty).map((key, index) => {
        const fallbackField = getDefaultSecretaryFieldByKey(key);
        return {
            id: toSecretaryVitalFieldId(key),
            kind: 'vital' as const,
            key,
            label: fallbackField.label,
            labelAr: fallbackField.label,
            unit: fallbackField.unit,
            order: index + 1,
            enabled: isCommonEnabledVitalKey(key, options),
        };
    });

/**
 * بناء خريطة رؤية افتراضية مع تمكين العلامات الحيوية الشائعة.
 * تُستخدم كـ initial state للسكرتيرة حتى تشوف الحقول فوراً.
 */
export const createDefaultSecretaryVitalsVisibilityWithCommonEnabled = (
    options: SecretaryVitalsSpecialtyOptions = {}
): SecretaryVitalsVisibility => {
    const visibility: SecretaryVitalsVisibility = {};
    getSecretaryVitalKeysForSpecialty(options.doctorSpecialty).forEach((key) => {
        const enabled = isCommonEnabledVitalKey(key, options);
        visibility[key] = enabled;
        visibility[toSecretaryVitalFieldId(key)] = enabled;
    });
    return visibility;
};
