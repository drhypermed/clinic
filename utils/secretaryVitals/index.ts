/**
 * وحدة علامات السكرتارية الحيوية (Secretary Vitals) — الواجهة الموحّدة
 *
 * هذا الملف aggregator يعيد تصدير كل الـ API العام من modules الفرعية.
 * المستهلكون يستخدمون `from '../../utils/secretaryVitals'` ويرى TypeScript
 * هذا الـ index.ts تلقائياً.
 *
 * البنية الداخلية:
 *   - `constants.ts`        : ثوابت + SECRETARY_VITAL_FIELDS + types.
 *   - `helpers.ts`           : دوال مساعدة داخلية (normalizers، BMI، lookups).
 *   - `fieldDefinitions.ts`  : sanitizers/builders لتعريفات الحقول.
 *   - `visibility.ts`        : منطق رؤية الحقول.
 *   - `inputSanitizer.ts`    : تنظيف المدخلات + تحويلها لعرض.
 *   - `vitalConfigs.ts`      : تحويل للـ VitalSignConfig + helpers الإشعارات.
 */

// Constants + types
export {
    toSecretaryCustomFieldId,
} from './constants';

// Helpers (public APIs only)
export {
    computeSecretaryBmiValue,
    isSecretaryVitalKey,
    normalizeSecretaryVitalValue,
} from './helpers';

// Field definitions
export {
    buildSecretaryVitalFieldDefinitions,
    buildSecretaryVitalFieldDefinitionsWithDefaults,
    createDefaultSecretaryVitalsVisibility,
    createDefaultSecretaryVitalsVisibilityWithCommonEnabled,
    normalizeSecretaryVitalFieldDefinitions,
} from './fieldDefinitions';

// Visibility
export {
    buildSecretaryVisibilityByFieldDefinitions,
    isSecretaryFieldEnabled,
    isSecretaryVitalEnabled,
    normalizeSecretaryVitalsVisibility,
} from './visibility';

// Input sanitizer + entries
export {
    sanitizeSecretaryVitalsInput,
    toSecretaryVitalsEntries,
} from './inputSanitizer';

// Vital configs + notification helpers
export {
    extractSecretaryVitalsFromNotificationData,
    toSecretaryVitalSignConfigs,
} from './vitalConfigs';
