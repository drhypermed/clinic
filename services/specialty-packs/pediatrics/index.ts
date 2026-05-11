/**
 * نقطه الدخول لخدمات حزمه الأطفال
 */

export {
    loadPediatricFile,
    savePediatricFile,
    normalizePediatricFile,
} from './service';

export {
    syncVitalsToGrowthIfPediatric,
} from './autoSyncFromVitals';

export {
    calculateAgeInDays,
    calculateAgeInMonths,
    calculateDelta,
    calculateVaccinationTiming,
    formatChildAge,
    getTodayDateKey,
    type MeasurementDelta,
    type VaccinationTiming,
} from './calculations';

export {
    EGYPTIAN_VACCINATION_SCHEDULE,
    SCHEDULE_BY_ID,
    type VaccineScheduleItem,
} from './vaccinationSchedule';

export {
    createEmptyPediatricFile,
    PEDIATRIC_FILE_DOC_PREFIX,
} from './types';

export type {
    ChildSex,
    GrowthEntry,
    PediatricFile,
    VaccinationRecord,
    VaccinationStatus,
} from './types';
