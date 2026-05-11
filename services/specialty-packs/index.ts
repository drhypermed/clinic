/**
 * نقطه الدخول لوحده حزم التخصصات (Specialty Packs)
 * تجميع للأنواع والثوابت والخدمات تحت import واحد.
 */

export {
    getSpecialtyPacks,
    getCachedSpecialtyPacks,
    updateSpecialtyPacks,
    normalizeSpecialtyPacks,
    isPackEnabled,
} from './service';

export {
    buildPregnancyContext,
    buildPediatricContext,
} from './contextBuilder';

export {
    registerFlusher,
    flushAllSpecialtyPackSaves,
} from './flushBus';

export {
    SPECIALTY_PACKS_DOC_ID,
    DEFAULT_SPECIALTY_PACKS,
    ALL_PACK_IDS,
} from './defaults';

export {
    PACK_SPECIALTIES,
    PACK_DISPLAY_NAMES,
    PACK_DESCRIPTIONS,
} from './types';

export type {
    SpecialtyPackId,
    SpecialtyPackEntry,
    SpecialtyPacksConfig,
} from './types';
