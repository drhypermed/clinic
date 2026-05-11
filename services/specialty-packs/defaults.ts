/**
 * القيم الافتراضيه لحزم التخصصات (Specialty Packs Defaults)
 *
 * كل الحزم بتبدأ "مقفوله" — الأدمن لازم يفعّلها يدوياً من اللوحه.
 * ده بيضمن إن أي حزمه جديده ما تظهرش للأطباء فجأه قبل ما تتجرّب.
 */

import type { SpecialtyPackId, SpecialtyPacksConfig } from './types';

/** معرّف مستند Firestore تحت settings/ */
export const SPECIALTY_PACKS_DOC_ID = 'specialtyPacks';

/** الحزم المتاحه — لو ضفنا واحده جديده، نضيف هنا */
export const ALL_PACK_IDS: readonly SpecialtyPackId[] = [
    'gynecology',
    'pediatrics',
] as const;

/** كل الحزم تبدأ مقفوله افتراضياً (آمن — kill switch مفعّل) */
export const DEFAULT_SPECIALTY_PACKS: SpecialtyPacksConfig = {
    packs: {
        gynecology: { enabled: false },
        pediatrics: { enabled: false },
    },
};
