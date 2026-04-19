import { useState, useEffect, useMemo } from 'react';
import type { Medication, MedicationCustomization } from '../../types';
import { medicationCustomizationService } from '../../services/medicationCustomizationService';
import { useAuth } from '../useAuth';
import { getCachedBaseMedications, loadBaseMedications } from '../../app/drug-catalog/medicationsLoader';

interface UseMedicationsOptions {
    enabled?: boolean;
    deferLoadWhenDisabledMs?: number;
}

const hasOwn = (obj: unknown, prop: string): boolean =>
    !!obj && Object.prototype.hasOwnProperty.call(obj, prop);

const findMatchingDosageCondition = (
    conditions: MedicationCustomization['dosageConditions'],
    weight: number,
    ageMonths: number
) => {
    if (!conditions || conditions.length === 0) return undefined;
    return conditions.find(cond => {
        const minW = cond.minWeight ?? 0;
        const maxW = cond.maxWeight ?? 999;
        const minA = cond.minAgeMonths ?? 0;
        const maxA = cond.maxAgeMonths ?? 1200;
        return weight >= minW && weight <= maxW && ageMonths >= minA && ageMonths <= maxA;
    });
};

const resolveStringField = (
    customization: MedicationCustomization,
    field: keyof MedicationCustomization,
    fallback: string
) => {
    if (!hasOwn(customization, field as string)) return fallback;
    return (customization[field] as string | undefined) || fallback;
};

const resolveNumberField = (
    customization: MedicationCustomization,
    field: keyof MedicationCustomization,
    fallback: number
) => {
    if (!hasOwn(customization, field as string)) return fallback;
    const value = customization[field] as number | undefined;
    return value !== undefined ? value : fallback;
};

const buildCustomizedCalculationRule = (
    med: Medication,
    customization: MedicationCustomization
): Medication['calculationRule'] | null => {
    if (hasOwn(customization, 'dosageConditions') && customization.dosageConditions && customization.dosageConditions.length > 0) {
        return (weight: number, ageMonths: number) => {
            const matchingCondition = findMatchingDosageCondition(customization.dosageConditions, weight, ageMonths);
            if (matchingCondition) return matchingCondition.text;
            if (typeof med.calculationRule === 'function') return med.calculationRule(weight, ageMonths);
            return '';
        };
    }

    if (hasOwn(customization, 'dosageText') && customization.dosageText) {
        return () => customization.dosageText!;
    }

    return null;
};

const buildNewMedication = (c: MedicationCustomization): Medication => ({
    id: c.medicationId,
    name: c.name || 'دواء جديد',
    genericName: c.genericName || '',
    concentration: c.concentration || '',
    price: c.price || 0,
    usage: c.usage || '',
    timing: c.timing || '',
    instructions: c.instructions || '',
    warnings: c.warnings || [],
    minAgeMonths: c.minAgeMonths || 0,
    maxAgeMonths: c.maxAgeMonths || 0,
    minWeight: c.minWeight || 0,
    maxWeight: c.maxWeight || 0,
    category: c.category || 'General',
    form: (c.form as any) || 'Tablets',
    matchKeywords: c.matchKeywords || [],
    isNew: true,
    calculationRule: (weight: number, ageMonths: number) => {
        if (c.dosageConditions && c.dosageConditions.length > 0) {
            const matchingCondition = findMatchingDosageCondition(c.dosageConditions, weight, ageMonths);
            if (matchingCondition) return matchingCondition.text;
        }
        if (c.dosageText) return c.dosageText;
        return 'الجرعة غير محددة';
    }
});

export const useMedications = (options: UseMedicationsOptions = {}): Medication[] => {
    const { enabled = true, deferLoadWhenDisabledMs = 4500 } = options;
    const { user } = useAuth();
    const [baseMedications, setBaseMedications] = useState<Medication[]>(() => getCachedBaseMedications() || []);
    const [customizations, setCustomizations] = useState<Record<string, MedicationCustomization>>({});

    useEffect(() => {
        let isMounted = true;
        if (baseMedications.length > 0) return;

        const startLoading = () => {
            loadBaseMedications().then((loaded) => {
                if (!isMounted) return;
                setBaseMedications(loaded);
            });
        };

        if (enabled) {
            startLoading();
            return () => {
                isMounted = false;
            };
        }

        const browserWindow = typeof window !== 'undefined' ? (window as any) : null;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        let idleId: number | null = null;

        if (browserWindow?.requestIdleCallback) {
            idleId = browserWindow.requestIdleCallback(startLoading, { timeout: deferLoadWhenDisabledMs });
        } else {
            timeoutId = setTimeout(startLoading, deferLoadWhenDisabledMs);
        }

        return () => {
            isMounted = false;
            if (timeoutId) clearTimeout(timeoutId);
            if (idleId !== null && browserWindow?.cancelIdleCallback) {
                browserWindow.cancelIdleCallback(idleId);
            }
        };
    }, [baseMedications.length, enabled, deferLoadWhenDisabledMs]);

    useEffect(() => {
        if (!user?.uid) {
            setCustomizations({});
            return;
        }

        return medicationCustomizationService.subscribeToCustomizations(user.uid, setCustomizations);
    }, [user?.uid]);

    const customizedMedications = useMemo(() => {
        if (Object.keys(customizations).length === 0) return baseMedications;

        const baseMeds = baseMedications.map((med) => {
            const customization = customizations[med.id];
            if (!customization) return med;

            const enhancedMatchKeywords = [
                ...(med.matchKeywords || []),
                ...(customization.matchKeywords || []),
                ...(customization.dosageText ? [customization.dosageText] : [])
            ].filter(Boolean);

            const customizedCalculationRule = buildCustomizedCalculationRule(med, customization);

            return {
                ...med,
                name: resolveStringField(customization, 'name', med.name),
                genericName: resolveStringField(customization, 'genericName', med.genericName),
                concentration: resolveStringField(customization, 'concentration', med.concentration),
                price: resolveNumberField(customization, 'price', med.price),
                usage: resolveStringField(customization, 'usage', med.usage),
                timing: resolveStringField(customization, 'timing', med.timing),
                instructions: resolveStringField(customization, 'instructions', med.instructions),
                warnings: hasOwn(customization, 'warnings') ? (customization.warnings || []) : med.warnings,
                minAgeMonths: resolveNumberField(customization, 'minAgeMonths', med.minAgeMonths),
                maxAgeMonths: resolveNumberField(customization, 'maxAgeMonths', med.maxAgeMonths),
                minWeight: resolveNumberField(customization, 'minWeight', med.minWeight),
                maxWeight: resolveNumberField(customization, 'maxWeight', med.maxWeight),
                category: resolveStringField(customization, 'category', med.category),
                ...(enhancedMatchKeywords.length > 0 ? { matchKeywords: enhancedMatchKeywords } : {}),
                ...(customizedCalculationRule ? { calculationRule: customizedCalculationRule } : {})
            };
        });

        const newMedications: Medication[] = Object.values(customizations)
            .filter(c => c.isNew)
            .map(buildNewMedication);

        return [...baseMeds, ...newMedications];
    }, [baseMedications, customizations]);

    return customizedMedications;
};
