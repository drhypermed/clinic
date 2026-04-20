/**
 * خدمة ملفات المرضى (Patient Files Service) — الواجهة الموحّدة
 *
 * Aggregator يجمع كل الوظائف الموزعة على modules فرعية ويُصدّرها كـ object
 * واحد `patientFilesService` مع re-exports للـ helpers العامة للحفاظ على
 * التوافق مع جميع المستهلكين الحاليين:
 *
 *   - `patientFilesService.ensurePatientFilesSeniorityIndex`
 *   - `patientFilesService.ensurePatientFileReference`
 *   - `patientFilesService.syncPatientIdentityByFile`
 *
 * Helpers public لا تمر عبر الـ object لأنها مُستخدمة مباشرة:
 *   - `normalizePatientNameForFile`
 *   - `buildPatientFileNameKey`
 *   - `buildPatientFileDocIdFromNameKey`
 *
 * البنية الداخلية للوحدة:
 *   - `constants.ts`             : ثوابت المسارات والحد الأقصى للدفعات.
 *   - `types.ts`                 : واجهات البيانات.
 *   - `normalizers.ts`           : دوال تنظيف/بناء مفاتيح خالصة.
 *   - `bookingConfigMirror.ts`   : مرآة الهوية في إعدادات الحجز.
 *   - `seniorityIndex.ts`        : فهرس الترقيم بالأقدمية (migration).
 *   - `patientFileReference.ts`  : ضمان وجود/إنشاء مرجع ملف المريض.
 *   - `syncIdentity.ts`          : مزامنة هوية المريض عبر السجلات/المواعيد.
 */

import { ensurePatientFileReference } from './patientFileReference';
import { ensurePatientFilesSeniorityIndex } from './seniorityIndex';
import { syncPatientIdentityByFile } from './syncIdentity';
import { savePatientAdditionalInfo } from './additionalInfo';
import {
    getDefaultReportPreferences,
    loadReportPreferences,
    readReportPreferencesFromLocalStorage,
    saveReportPreferences,
} from './reportPreferences';

export {
    buildPatientFileDocIdFromNameKey,
    buildPatientFileNameKey,
    normalizePatientNameForFile,
} from './normalizers';

export type {
    PatientFileReference,
    PatientFileSeedRecord,
    PatientIdentityAgeInput,
    SyncPatientIdentityByFileInput,
    SyncPatientIdentityByFileResult,
} from './types';

export type {
    SavePatientAdditionalInfoInput,
    SavePatientAdditionalInfoResult,
} from './additionalInfo';

export type {
    ReportPreferences,
    ReportLanguagePref,
    ReportPageSizePref,
} from './reportPreferences';

/** الواجهة الموحّدة لخدمة ملفات المرضى */
export const patientFilesService = {
    ensurePatientFilesSeniorityIndex,
    ensurePatientFileReference,
    syncPatientIdentityByFile,
    savePatientAdditionalInfo,
    loadReportPreferences,
    saveReportPreferences,
    readReportPreferencesFromLocalStorage,
    getDefaultReportPreferences,
};
