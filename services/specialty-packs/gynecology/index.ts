/**
 * نقطه الدخول لخدمات حزمه النساء والتوليد
 */

export {
    loadPregnancyFile,
    savePregnancyFile,
    normalizePregnancyFile,
} from './service';

export {
    syncVitalsToPregnancyIfGyn,
} from './autoSyncFromVitals';

export {
    buildPregnancyRecordSnapshot,
} from './recordSnapshot';

export {
    calculateEDD,
    calculateGestationalWeek,
    calculateGestationalDay,
    formatGestationalAge,
    getTodayDateKey,
    getTrimester,
} from './calculations';

export {
    createEmptyPregnancyFile,
    PREGNANCY_FILE_DOC_PREFIX,
} from './types';

export type {
    PregnancyFile,
    PregnancyVisit,
    PregnancyClosureType,
} from './types';
