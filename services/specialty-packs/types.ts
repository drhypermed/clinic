/**
 * أنواع بيانات حزم التخصصات (Specialty Packs Types)
 *
 * كل "حزمه تخصص" بيتفعل تلقائياً للأطباء اللي تخصصهم مطابق، بشرط
 * إن الأدمن مفعّل الباكدج من اللوحه. ده بيدّينا:
 *   1. مفتاح أمان مركزي للأدمن (kill switch لأي باكدج).
 *   2. اختيار تلقائي للطبيب (مفيش خطوه تفعيل يدويه).
 *
 * البيانات بتتخزن في settings/specialtyPacks (مستند واحد).
 */

// ─ معرّفات حزم التخصصات المتاحه ─
// لو ضفنا حزمه جديده، نضيف معرّفها هنا فقط.
export type SpecialtyPackId =
    | 'gynecology'         // النساء والتوليد — متابعه الحمل + حاسبه الأسبوع/ميعاد الولاده
    | 'pediatrics';        // الأطفال — قياسات النمو + جدول التطعيمات المصري

/** إعدادات حزمه تخصص واحده */
export interface SpecialtyPackEntry {
    /** هل الباكدج مفعّل عالمياً للأطباء المؤهلين؟ */
    enabled: boolean;
}

/** الإعدادات الكامله لحزم التخصصات (وثيقه settings/specialtyPacks) */
export interface SpecialtyPacksConfig {
    /** الباكدجات مفهرسه بمعرّفها */
    packs: Record<SpecialtyPackId, SpecialtyPackEntry>;
}

/**
 * خريطه تربط معرّف الباكدج بالتخصصات اللي بتفعّله.
 * طبيب تخصصه ضمن القائمه دي → الباكدج يظهر له (لو الأدمن فعّله).
 */
export const PACK_SPECIALTIES: Record<SpecialtyPackId, readonly string[]> = {
    gynecology: ['أمراض النساء والتوليد'],
    pediatrics: ['طب الأطفال وحديثي الولادة'],
} as const;

/** أسماء عربيه ودّيه للحزم — تستخدم في لوحه الأدمن ودليل الاستخدام */
export const PACK_DISPLAY_NAMES: Record<SpecialtyPackId, string> = {
    gynecology: 'حزمه النساء والتوليد',
    pediatrics: 'حزمه الأطفال',
};

/** وصف مختصر لكل باكدج — يظهر في كرت الأدمن */
export const PACK_DESCRIPTIONS: Record<SpecialtyPackId, string> = {
    gynecology:
        'متابعه الحمل: حاسبه الأسبوع وميعاد الولاده + سجل زيارات الحمل لكل مريضه.',
    pediatrics:
        'متابعه نمو الأطفال: تسجيل الوزن والطول ومحيط الرأس + جدول التطعيمات المصري الرسمي.',
};
