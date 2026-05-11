/**
 * جدول التطعيمات المصري الرسمي (Egyptian MOH Vaccination Schedule)
 *
 * المصدر: وزاره الصحه والسكان المصريه — برنامج التحصينات الموسع (EPI).
 * كل تطعيم له:
 *   - id: معرّف فريد (نستخدمه في الـVaccinationRecord)
 *   - ageLabel: العمر الموصى به بصيغه عربيه
 *   - ageMonths: العمر بالشهور (لحساب لو الموعد جاي ولا فات)
 *   - vaccine: اسم اللقاح (الإنجليزي شائع طبياً مع الشرح العربي)
 *   - protectsAgainst: الأمراض اللي بيحمي منها (للأهل)
 *
 * ملاحظه: الجدول ده ممكن يتغيّر مستقبلاً — لو وزاره الصحه عدّلت،
 * نحدّث الملف ده فقط، وكل الأطباء ياخدوا التحديث.
 */

export interface VaccineScheduleItem {
    /** معرّف فريد — يستخدم كمفتاح في VaccinationRecord */
    id: string;
    /** العمر الموصى به (عرض) */
    ageLabel: string;
    /** العمر بالشهور — لترتيب وحساب الـ"متأخر/جاي" */
    ageMonths: number;
    /** اسم اللقاح */
    vaccine: string;
    /** اختصار اللقاح (للعرض المدمج) */
    shortName: string;
    /** الأمراض المحمي منها */
    protectsAgainst: string;
}

export const EGYPTIAN_VACCINATION_SCHEDULE: readonly VaccineScheduleItem[] = [
    // ─ عند الولاده ─
    {
        id: 'birth-bcg',
        ageLabel: 'عند الولاده',
        ageMonths: 0,
        vaccine: 'تطعيم الدرن (BCG)',
        shortName: 'BCG',
        protectsAgainst: 'مرض الدرن (السل)',
    },
    {
        id: 'birth-hepb1',
        ageLabel: 'عند الولاده',
        ageMonths: 0,
        vaccine: 'تطعيم الالتهاب الكبدي B - الجرعه الأولى',
        shortName: 'HepB 1',
        protectsAgainst: 'فيروس الكبد B',
    },

    // ─ شهرين ─
    {
        id: 'month2-penta1',
        ageLabel: 'شهرين',
        ageMonths: 2,
        vaccine: 'التطعيم الخماسي - الجرعه الأولى',
        shortName: 'Pentavalent 1',
        protectsAgainst: 'الدفتيريا، التيتانوس، السعال الديكي، الكبد B، المستدميه النزليه',
    },
    {
        id: 'month2-opv1',
        ageLabel: 'شهرين',
        ageMonths: 2,
        vaccine: 'شلل الأطفال الفموي - الجرعه الأولى',
        shortName: 'OPV 1',
        protectsAgainst: 'فيروس شلل الأطفال',
    },
    {
        id: 'month2-rotavirus1',
        ageLabel: 'شهرين',
        ageMonths: 2,
        vaccine: 'الروتا - الجرعه الأولى',
        shortName: 'Rotavirus 1',
        protectsAgainst: 'فيروس الروتا (إسهال الأطفال)',
    },

    // ─ ٤ شهور ─
    {
        id: 'month4-penta2',
        ageLabel: '٤ شهور',
        ageMonths: 4,
        vaccine: 'التطعيم الخماسي - الجرعه الثانيه',
        shortName: 'Pentavalent 2',
        protectsAgainst: 'الدفتيريا، التيتانوس، السعال الديكي، الكبد B، المستدميه النزليه',
    },
    {
        id: 'month4-opv2',
        ageLabel: '٤ شهور',
        ageMonths: 4,
        vaccine: 'شلل الأطفال الفموي - الجرعه الثانيه',
        shortName: 'OPV 2',
        protectsAgainst: 'فيروس شلل الأطفال',
    },
    {
        id: 'month4-rotavirus2',
        ageLabel: '٤ شهور',
        ageMonths: 4,
        vaccine: 'الروتا - الجرعه الثانيه',
        shortName: 'Rotavirus 2',
        protectsAgainst: 'فيروس الروتا',
    },

    // ─ ٦ شهور ─
    {
        id: 'month6-penta3',
        ageLabel: '٦ شهور',
        ageMonths: 6,
        vaccine: 'التطعيم الخماسي - الجرعه الثالثه',
        shortName: 'Pentavalent 3',
        protectsAgainst: 'الدفتيريا، التيتانوس، السعال الديكي، الكبد B، المستدميه النزليه',
    },
    {
        id: 'month6-opv3',
        ageLabel: '٦ شهور',
        ageMonths: 6,
        vaccine: 'شلل الأطفال الفموي - الجرعه الثالثه',
        shortName: 'OPV 3',
        protectsAgainst: 'فيروس شلل الأطفال',
    },

    // ─ ٩ شهور ─
    {
        id: 'month9-measles',
        ageLabel: '٩ شهور',
        ageMonths: 9,
        vaccine: 'الحصبه (جرعه أولى)',
        shortName: 'Measles',
        protectsAgainst: 'الحصبه',
    },

    // ─ ١٢ شهر ─
    {
        id: 'month12-mmr',
        ageLabel: 'سنه',
        ageMonths: 12,
        vaccine: 'الثلاثي الفيروسي MMR',
        shortName: 'MMR',
        protectsAgainst: 'الحصبه، النكاف، الحصبه الألمانيه',
    },

    // ─ ١٨ شهر ─
    {
        id: 'month18-pentaBoost',
        ageLabel: 'سنه ونص',
        ageMonths: 18,
        vaccine: 'منشط الخماسي + شلل أطفال',
        shortName: 'DPT Boost',
        protectsAgainst: 'منشط الدفتيريا والتيتانوس والسعال الديكي + شلل الأطفال',
    },
    {
        id: 'month18-mmrBoost',
        ageLabel: 'سنه ونص',
        ageMonths: 18,
        vaccine: 'منشط الثلاثي الفيروسي MMR',
        shortName: 'MMR Boost',
        protectsAgainst: 'منشط الحصبه والنكاف والحصبه الألمانيه',
    },

    // ─ ٤–٦ سنوات (للدخول المدرسي) ─
    {
        id: 'year5-dpt',
        ageLabel: '٤ – ٦ سنوات (قبل المدرسه)',
        ageMonths: 60,
        vaccine: 'منشط الدفتيريا والتيتانوس والسعال الديكي',
        shortName: 'DPT School',
        protectsAgainst: 'الدفتيريا، التيتانوس، السعال الديكي',
    },
] as const;

/** فهرسه بالـid عشان البحث السريع */
export const SCHEDULE_BY_ID: Record<string, VaccineScheduleItem> =
    EGYPTIAN_VACCINATION_SCHEDULE.reduce(
        (acc, item) => {
            acc[item.id] = item;
            return acc;
        },
        {} as Record<string, VaccineScheduleItem>,
    );
