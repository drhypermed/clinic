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
    // ─ عند الميلاد / أول 24 ساعة ─
    {
        id: 'birth-hepb1',
        ageLabel: 'عند الميلاد (أول 24 ساعة)',
        ageMonths: 0,
        vaccine: 'تطعيم الالتهاب الكبدي B - الجرعه الأولى',
        shortName: 'HepB 1',
        protectsAgainst: 'فيروس الكبد B',
    },

    // ─ عند الميلاد ─
    {
        id: 'birth-opv0',
        ageLabel: 'عند الميلاد',
        ageMonths: 0,
        vaccine: 'شلل الأطفال الفموي - الجرعه الصفرية',
        shortName: 'OPV 0',
        protectsAgainst: 'فيروس شلل الأطفال',
    },
    {
        id: 'birth-bcg',
        ageLabel: 'عند الميلاد',
        ageMonths: 0,
        vaccine: 'تطعيم الدرن (BCG)',
        shortName: 'BCG',
        protectsAgainst: 'مرض الدرن (السل)',
    },

    // ─ شهرين ─
    {
        id: 'month2-opv1',
        ageLabel: 'شهرين',
        ageMonths: 2,
        vaccine: 'شلل الأطفال الفموي - الجرعه الأولى',
        shortName: 'OPV 1',
        protectsAgainst: 'فيروس شلل الأطفال',
    },
    {
        id: 'month2-ipv1',
        ageLabel: 'شهرين',
        ageMonths: 2,
        vaccine: 'شلل الأطفال بالحقن (سولك/IPV) - الجرعه الأولى',
        shortName: 'IPV 1',
        protectsAgainst: 'فيروس شلل الأطفال',
    },
    {
        id: 'month2-penta1',
        ageLabel: 'شهرين',
        ageMonths: 2,
        vaccine: 'التطعيم الخماسي - الجرعه الأولى',
        shortName: 'Pentavalent 1',
        protectsAgainst: 'الدفتيريا، التيتانوس، السعال الديكي، الكبد B، المستدميه النزليه',
    },

    // ─ ٤ شهور ─
    {
        id: 'month4-opv2',
        ageLabel: '٤ شهور',
        ageMonths: 4,
        vaccine: 'شلل الأطفال الفموي - الجرعه الثانيه',
        shortName: 'OPV 2',
        protectsAgainst: 'فيروس شلل الأطفال',
    },
    {
        id: 'month4-ipv2',
        ageLabel: '٤ شهور',
        ageMonths: 4,
        vaccine: 'شلل الأطفال بالحقن (سولك/IPV) - الجرعه الثانيه',
        shortName: 'IPV 2',
        protectsAgainst: 'فيروس شلل الأطفال',
    },
    {
        id: 'month4-penta2',
        ageLabel: '٤ شهور',
        ageMonths: 4,
        vaccine: 'التطعيم الخماسي - الجرعه الثانيه',
        shortName: 'Pentavalent 2',
        protectsAgainst: 'الدفتيريا، التيتانوس، السعال الديكي، الكبد B، المستدميه النزليه',
    },

    // ─ ٦ شهور ─
    {
        id: 'month6-opv3',
        ageLabel: '٦ شهور',
        ageMonths: 6,
        vaccine: 'شلل الأطفال الفموي - الجرعه الثالثه',
        shortName: 'OPV 3',
        protectsAgainst: 'فيروس شلل الأطفال',
    },
    {
        id: 'month6-ipv3',
        ageLabel: '٦ شهور',
        ageMonths: 6,
        vaccine: 'شلل الأطفال بالحقن (سولك/IPV) - الجرعه الثالثه',
        shortName: 'IPV 3',
        protectsAgainst: 'فيروس شلل الأطفال',
    },
    {
        id: 'month6-penta3',
        ageLabel: '٦ شهور',
        ageMonths: 6,
        vaccine: 'التطعيم الخماسي - الجرعه الثالثه',
        shortName: 'Pentavalent 3',
        protectsAgainst: 'الدفتيريا، التيتانوس، السعال الديكي، الكبد B، المستدميه النزليه',
    },
    {
        id: 'month6-vitamina1',
        ageLabel: '٦ شهور',
        ageMonths: 6,
        vaccine: 'فيتامين أ - ١٠٠ ألف وحدة',
        shortName: 'Vitamin A 100k',
        protectsAgainst: 'نقص فيتامين أ ومضاعفاته',
    },

    // ─ ٩ شهور ─
    {
        id: 'month9-opv4',
        ageLabel: '٩ شهور',
        ageMonths: 9,
        vaccine: 'شلل الأطفال الفموي - الجرعه الرابعة',
        shortName: 'OPV 4',
        protectsAgainst: 'فيروس شلل الأطفال',
    },

    // ─ ١٢ شهر ─
    {
        id: 'month12-opv5',
        ageLabel: '١٢ شهر',
        ageMonths: 12,
        vaccine: 'شلل الأطفال الفموي - جرعه السنة',
        shortName: 'OPV 5',
        protectsAgainst: 'فيروس شلل الأطفال',
    },
    {
        id: 'month12-mmr',
        ageLabel: '١٢ شهر',
        ageMonths: 12,
        vaccine: 'الثلاثي الفيروسي MMR - الجرعه الأولى',
        shortName: 'MMR 1',
        protectsAgainst: 'الحصبه، النكاف، الحصبه الألمانيه',
    },
    {
        id: 'month12-vitamina2',
        ageLabel: '١٢ شهر',
        ageMonths: 12,
        vaccine: 'فيتامين أ - ١٠٠ ألف وحدة',
        shortName: 'Vitamin A 100k',
        protectsAgainst: 'نقص فيتامين أ ومضاعفاته',
    },

    // ─ ١٨ شهر ─
    {
        id: 'month18-opvBoost',
        ageLabel: '١٨ شهر',
        ageMonths: 18,
        vaccine: 'شلل الأطفال الفموي - الجرعه المنشطة',
        shortName: 'OPV Boost',
        protectsAgainst: 'فيروس شلل الأطفال',
    },
    {
        id: 'month18-dptBoost',
        ageLabel: '١٨ شهر',
        ageMonths: 18,
        vaccine: 'الثلاثي البكتيري DPT - الجرعه المنشطة',
        shortName: 'DPT Boost',
        protectsAgainst: 'الدفتيريا، التيتانوس، السعال الديكي',
    },
    {
        id: 'month18-mmrBoost',
        ageLabel: '١٨ شهر',
        ageMonths: 18,
        vaccine: 'الثلاثي الفيروسي MMR - الجرعه الثانية',
        shortName: 'MMR 2',
        protectsAgainst: 'منشط الحصبه والنكاف والحصبه الألمانيه',
    },
    {
        id: 'month18-vitamina3',
        ageLabel: '١٨ شهر',
        ageMonths: 18,
        vaccine: 'فيتامين أ - ٢٠٠ ألف وحدة',
        shortName: 'Vitamin A 200k',
        protectsAgainst: 'نقص فيتامين أ ومضاعفاته',
    },

    // ─ فيتامين أ كل ٦ شهور حتى ٥ سنوات ─
    {
        id: 'month24-vitamina4',
        ageLabel: '٢٤ شهر',
        ageMonths: 24,
        vaccine: 'فيتامين أ - ٢٠٠ ألف وحدة',
        shortName: 'Vitamin A 200k',
        protectsAgainst: 'نقص فيتامين أ ومضاعفاته',
    },
    {
        id: 'month30-vitamina5',
        ageLabel: '٣٠ شهر',
        ageMonths: 30,
        vaccine: 'فيتامين أ - ٢٠٠ ألف وحدة',
        shortName: 'Vitamin A 200k',
        protectsAgainst: 'نقص فيتامين أ ومضاعفاته',
    },
    {
        id: 'month36-vitamina6',
        ageLabel: '٣٦ شهر',
        ageMonths: 36,
        vaccine: 'فيتامين أ - ٢٠٠ ألف وحدة',
        shortName: 'Vitamin A 200k',
        protectsAgainst: 'نقص فيتامين أ ومضاعفاته',
    },
    {
        id: 'month42-vitamina7',
        ageLabel: '٤٢ شهر',
        ageMonths: 42,
        vaccine: 'فيتامين أ - ٢٠٠ ألف وحدة',
        shortName: 'Vitamin A 200k',
        protectsAgainst: 'نقص فيتامين أ ومضاعفاته',
    },
    {
        id: 'month48-vitamina8',
        ageLabel: '٤ سنوات',
        ageMonths: 48,
        vaccine: 'فيتامين أ - ٢٠٠ ألف وحدة',
        shortName: 'Vitamin A 200k',
        protectsAgainst: 'نقص فيتامين أ ومضاعفاته',
    },
    {
        id: 'month54-vitamina9',
        ageLabel: '٤ سنوات ونصف',
        ageMonths: 54,
        vaccine: 'فيتامين أ - ٢٠٠ ألف وحدة',
        shortName: 'Vitamin A 200k',
        protectsAgainst: 'نقص فيتامين أ ومضاعفاته',
    },
    {
        id: 'month60-vitamina10',
        ageLabel: '٥ سنوات',
        ageMonths: 60,
        vaccine: 'فيتامين أ - ٢٠٠ ألف وحدة',
        shortName: 'Vitamin A 200k',
        protectsAgainst: 'نقص فيتامين أ ومضاعفاته',
    },

    // ─ جدول التطعيم المدرسي ─
    {
        id: 'year4-meningococcal1',
        ageLabel: '٤ سنوات (مدرسي)',
        ageMonths: 48,
        vaccine: 'التطعيم ضد الالتهاب السحائي - الجرعه الأولى',
        shortName: 'Meningococcal 1',
        protectsAgainst: 'الالتهاب السحائي',
    },
    {
        id: 'year6-meningococcal2',
        ageLabel: '٦ سنوات (مدرسي)',
        ageMonths: 72,
        vaccine: 'التطعيم ضد الالتهاب السحائي - الجرعه الثانية',
        shortName: 'Meningococcal 2',
        protectsAgainst: 'الالتهاب السحائي',
    },
    {
        id: 'year7-td1',
        ageLabel: '٧ سنوات (مدرسي)',
        ageMonths: 84,
        vaccine: 'الثنائي Td - الجرعه الأولى',
        shortName: 'Td 1',
        protectsAgainst: 'الدفتيريا والتيتانوس',
    },
    {
        id: 'year10-td2',
        ageLabel: '١٠ سنوات (مدرسي)',
        ageMonths: 120,
        vaccine: 'الثنائي Td - الجرعه الثانية',
        shortName: 'Td 2',
        protectsAgainst: 'الدفتيريا والتيتانوس',
    },
    {
        id: 'year12-meningococcal3',
        ageLabel: '١٢ سنة (مدرسي)',
        ageMonths: 144,
        vaccine: 'التطعيم ضد الالتهاب السحائي - الجرعه الثالثة',
        shortName: 'Meningococcal 3',
        protectsAgainst: 'الالتهاب السحائي',
    },
    {
        id: 'year15-meningococcal4',
        ageLabel: '١٥ سنة (مدرسي)',
        ageMonths: 180,
        vaccine: 'التطعيم ضد الالتهاب السحائي - الجرعه الرابعة',
        shortName: 'Meningococcal 4',
        protectsAgainst: 'الالتهاب السحائي',
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
