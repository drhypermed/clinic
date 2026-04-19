// ─────────────────────────────────────────────────────────────────────────────
// Hook تطبيع إعدادات العلامات الحيوية للسكرتارية (useSecretaryVitalsNormalizer)
// ─────────────────────────────────────────────────────────────────────────────
// يختار إعدادات الفرع الحالي من الخرائط per-branch قبل الرجوع للحقول
// العامة (legacy). ثم يطبّع:
//   - الحقول (secretaryVitalFields)
//   - إظهار/إخفاء كل حقل (secretaryVitalsVisibility)
//
// سبب الفصل: كان ~35 سطر داخل usePublicBookingPageLogicCore وهو منطق
// مستقل يتعلق بـ config الوحيد.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, type Dispatch, type SetStateAction } from 'react';
import {
  buildSecretaryVisibilityByFieldDefinitions,
  normalizeSecretaryVitalFieldDefinitions,
  normalizeSecretaryVitalsVisibility,
} from '../../../utils/secretaryVitals';
import type {
  SecretaryVitalFieldDefinition,
  SecretaryVitalsVisibility,
} from '../../../types';

/** الحد الأدنى من config الذي نحتاجه — بدون الاعتماد على الشكل الكامل. */
interface MinimalConfig {
  secretaryVitalFields?: SecretaryVitalFieldDefinition[];
  secretaryVitalsVisibility?: SecretaryVitalsVisibility;
  secretaryVitalFieldsByBranch?: Record<string, SecretaryVitalFieldDefinition[] | undefined>;
  secretaryVitalsVisibilityByBranch?: Record<string, SecretaryVitalsVisibility | undefined>;
}

interface UseSecretaryVitalsNormalizerParams {
  sessionBranchId: string;
  config: MinimalConfig | null | undefined;
  setSecretaryVitalFields: Dispatch<SetStateAction<SecretaryVitalFieldDefinition[]>>;
  setSecretaryVitalsVisibility: Dispatch<SetStateAction<SecretaryVitalsVisibility>>;
}

export const useSecretaryVitalsNormalizer = ({
  sessionBranchId,
  config,
  setSecretaryVitalFields,
  setSecretaryVitalsVisibility,
}: UseSecretaryVitalsNormalizerParams) => {
  useEffect(() => {
    // اختيار إعدادات الفرع الحالي من الخرائط per-branch قبل الرجوع للحقول العامة (legacy).
    const branchKey = !sessionBranchId || sessionBranchId === 'main' ? 'main' : sessionBranchId;
    const branchFields = config?.secretaryVitalFieldsByBranch?.[branchKey];
    const branchVisibility = config?.secretaryVitalsVisibilityByBranch?.[branchKey];

    const sourceFields =
      Array.isArray(branchFields) && branchFields.length > 0
        ? branchFields
        : config?.secretaryVitalFields;
    const sourceVisibility = branchVisibility || config?.secretaryVitalsVisibility;

    const normalizedFields = normalizeSecretaryVitalFieldDefinitions(sourceFields);
    setSecretaryVitalFields(normalizedFields);

    if (!sourceVisibility) {
      setSecretaryVitalsVisibility(
        buildSecretaryVisibilityByFieldDefinitions(normalizedFields)
      );
      return;
    }

    const normalizedVisibility = normalizeSecretaryVitalsVisibility(sourceVisibility);
    setSecretaryVitalsVisibility(
      buildSecretaryVisibilityByFieldDefinitions(normalizedFields, normalizedVisibility)
    );
  }, [
    sessionBranchId,
    config?.secretaryVitalFields,
    config?.secretaryVitalsVisibility,
    config?.secretaryVitalFieldsByBranch,
    config?.secretaryVitalsVisibilityByBranch,
    setSecretaryVitalFields,
    setSecretaryVitalsVisibility,
  ]);
};
