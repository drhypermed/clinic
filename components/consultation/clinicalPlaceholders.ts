/**
 * Placeholders الذكيه للمعلومات السريريه (Smart Clinical Placeholders)
 *
 * بدل ما نحط أمثله ثابته (زي "احتقان في الحلق") اللي بتكون مناسبه
 * لتخصص بدون التاني، الدوال دي بترجع أمثله مفصّله حسب تخصص الطبيب.
 *
 * لو التخصص غير معروف أو غير محدد، بنرجع نصوص محايده (مفيش انحياز).
 */

interface ClinicalPlaceholders {
    complaint: string;
    history: string;
    exam: string;
    investigations: string;
}

// ─ النصوص المحايده — تستخدم لو التخصص غير معروف ─
const DEFAULT_PLACEHOLDERS: ClinicalPlaceholders = {
    complaint: 'اكتب الشكوى الرئيسيه للمريض...',
    history: 'الأمراض المزمنه والأدويه والحساسيات...',
    exam: 'نتائج الفحص السريري...',
    investigations: 'فحوصات المريض الجاي بيها: مثال HGB 15، CXR طبيعي...',
};

// ─ أمثله حسب التخصص — مأخوذه من الممارسه الإكلينيكيه الفعليه في مصر ─
const PLACEHOLDERS_BY_SPECIALTY: Record<string, ClinicalPlaceholders> = {
    'الطب العام (ممارس عام)': {
        complaint: 'مثال: صداع، حراره، إرهاق عام',
        history: 'مثال: ضغط، سكر، حساسيه، أدويه دائمه',
        exam: 'مثال: عام جيد، علامات حيويه طبيعيه',
        investigations: 'مثال: HGB 15، WBC 7.5، Cr 0.9، ALT 28',
    },
    'طب الأسرة': {
        complaint: 'مثال: متابعه روتينيه، شكوى عرضيه',
        history: 'مثال: تاريخ عائلي، أمراض مزمنه، تطعيمات',
        exam: 'مثال: فحص شامل عام',
        investigations: 'مثال: HbA1c 6.4%، LDL 110، سونار بطن طبيعي',
    },
    'الباطنة العامة': {
        complaint: 'مثال: إرهاق، فقدان وزن، تعرّق ليلي',
        history: 'مثال: ضغط، سكر، قرحه، أمراض مزمنه',
        exam: 'مثال: لا تورم، الكبد والطحال غير مجسوسين',
        investigations: 'مثال: HGB 11.2، TSH 2.1، Cr 1.0، ALT 32',
    },
    'طب الأطفال وحديثي الولادة': {
        complaint: 'مثال: حراره، نزله شعبيه، إسهال، حساسيه',
        history: 'مثال: ولاده طبيعيه، تطعيمات كامله، حساسيه',
        exam: 'مثال: عام جيد، حراره ٣٧.٥، حلق طبيعي',
        investigations: 'مثال: HGB 12، CRP 6، CXR: perihilar markings',
    },
    'أمراض القلب والأوعية الدموية': {
        complaint: 'مثال: ألم صدر، خفقان، ضيق نفس عند المجهود',
        history: 'مثال: ضغط مرتفع، سكر، احتشاء سابق، تدخين',
        exam: 'مثال: BP 140/90، صوت قلب طبيعي، تورم بسيط',
        investigations: 'مثال: ECG: sinus rhythm، EF 60%، Troponin سلبي، LDL 130',
    },
    'الأمراض الصدرية': {
        complaint: 'مثال: كحه، صعوبه تنفس، صفير، بلغم',
        history: 'مثال: ربو، تدخين، حساسيه صدر، التهابات',
        exam: 'مثال: صوت تنفس طبيعي، wheezes، crackles',
        investigations: 'مثال: CXR طبيعي، FEV1 65%، WBC 11، Eosinophils 6%',
    },
    'أمراض الجهاز الهضمي والكبد': {
        complaint: 'مثال: ألم بطن، حموضه، إسهال، إمساك، انتفاخ',
        history: 'مثال: قرحه، فيروس C، أدويه، نظام غذائي',
        exam: 'مثال: بطن لينه، لا تورم، الكبد طبيعي',
        investigations: 'مثال: ALT 65، HBsAg سلبي، سونار: fatty liver grade I، Hb 13',
    },
    'أمراض الكلى والمسالك البولية': {
        complaint: 'مثال: حرقان بول، تكرار بول، ألم خاصره',
        history: 'مثال: حصوات، التهابات سابقه، ضغط، سكر',
        exam: 'مثال: لا ألم في الجوف الكلوي، عام جيد',
        investigations: 'مثال: Urine: pus cells 20-25، Cr 1.1، سونار: حصوة 6 mm',
    },
    'أمراض النساء والتوليد': {
        complaint: 'مثال: ألم بطن، نزيف، إفرازات، متابعه حمل',
        history: 'مثال: عدد الحمل (G3P2)، آخر دوره، أمراض مزمنه',
        exam: 'مثال: فحص بطن طبيعي، ارتفاع رحم مناسب للأسبوع',
        investigations: 'مثال: US: حمل 8 أسابيع + نبض، HGB 11.5، β-hCG 45000',
    },
    'جراحة العظام والمفاصل': {
        complaint: 'مثال: ألم مفصل، إصابه، تورم، تيبس',
        history: 'مثال: حوادث سابقه، عمليات، خشونه، روماتيزم',
        exam: 'مثال: ROM محدوده، تورم، نقطه ألم محدده',
        investigations: 'مثال: X-ray: no fracture، MRI: L4-L5 disc، Vit D 18',
    },
    'الرمد (طب وجراحة العيون)': {
        complaint: 'مثال: ضعف رؤيه، احمرار، ألم، حساسيه ضوء',
        history: 'مثال: نضاره/عدسات، جلوكوما، سكر، عمليات',
        exam: 'مثال: VA 6/9، IOP 16، الجزء الأمامي طبيعي',
        investigations: 'مثال: VA 6/9، IOP 16، Fundus طبيعي، OCT: no edema',
    },
    'الأنف والأذن والحنجرة': {
        complaint: 'مثال: احتقان، ألم أذن، صعوبه بلع، شخير',
        history: 'مثال: التهابات متكرره، حساسيه، عمليات سابقه',
        exam: 'مثال: احتقان حلق، طبله سليمه، أنف به انسداد',
        investigations: 'مثال: Tympanogram type B، Audiometry: CHL 25 dB، CT sinuses: mucosal thickening',
    },
    'السمعيات واتزان الأذن': {
        complaint: 'مثال: ضعف سمع، طنين، دوخه مع تغيير الوضع',
        history: 'مثال: تعرض لضوضاء، التهاب أذن متكرر، أدويه مؤثره على السمع',
        exam: 'مثال: Romberg سلبي، Dix-Hallpike موجب يمين، قناة الأذن سليمه',
        investigations: 'مثال: PTA: SNHL 40 dB، Tympanogram type A، VNG: right canal weakness 30%',
    },
    'الأمراض الجلدية والتناسلية': {
        complaint: 'مثال: حساسيه، حبوب، حكه، تساقط شعر',
        history: 'مثال: حساسيه سابقه، مستحضرات، أدويه، أمراض',
        exam: 'مثال: طفح في ___، توزيع، حجم، لون',
        investigations: 'مثال: KOH positive، Biopsy: psoriasiform dermatitis، IgE 250',
    },
    'أمراض الذكورة والعقم': {
        complaint: 'مثال: ضعف انتصاب، تأخر إنجاب، ألم خصيه',
        history: 'مثال: مده الزواج، تاريخ جنسي، أمراض مزمنه',
        exam: 'مثال: فحص خصيتين، أعضاء تناسليه طبيعيه',
        investigations: 'مثال: Semen count 18M/ml، Motility 35%، Testosterone 420، FSH 5',
    },
    'طب وجراحة الفم والأسنان': {
        complaint: 'مثال: ألم ضرس، تورم لثه، حساسيه مع البارد، نزيف لثه',
        history: 'مثال: خلع سابق، علاج عصب، سكر، حساسيه من بنج',
        exam: 'مثال: Caries 36، percussion موجب، gingival inflammation، no mobility',
        investigations: 'مثال: Periapical X-ray: periapical lesion 36، OPG: impacted 38',
    },
    'المخ والأعصاب (باطنة)': {
        complaint: 'مثال: صداع، دوار، تنميل، ضعف، تشنجات',
        history: 'مثال: صداع نصفي، تشنجات سابقه، ضغط، سكر',
        exam: 'مثال: قوه عضليه ٥/٥، GCS 15، حركه عيون طبيعيه',
        investigations: 'مثال: MRI brain طبيعي، EEG: focal discharges، B12 280',
    },
    'جراحة المخ والأعصاب': {
        complaint: 'مثال: صداع شديد، إصابه رأس، ألم ظهر',
        history: 'مثال: حوادث، عمليات سابقه، تشنجات',
        exam: 'مثال: GCS، علامات عصبيه، صعوبه حركه',
        investigations: 'مثال: CT brain: no bleed، MRI lumbar: L5-S1 prolapse',
    },
    'الطب النفسي وعلاج الإدمان': {
        complaint: 'مثال: قلق، اكتئاب، أرق، توتر، ميول إدمانيه',
        history: 'مثال: تاريخ عائلي، أدويه نفسيه سابقه، تعاطي',
        exam: 'مثال: تواصل بصري، مزاج، أفكار، إدراك',
        investigations: 'مثال: PHQ-9 = 18، GAD-7 = 14، MMSE = 28/30',
    },
    'الروماتيزم والمناعة': {
        complaint: 'مثال: ألم مفاصل، تيبس صباحي، طفح، إرهاق',
        history: 'مثال: روماتيزم عائلي، طفح سابق، أدويه',
        exam: 'مثال: تورم مفاصل، حدود حركه، علامات جلديه',
        investigations: 'مثال: ESR 55، CRP 24، RF positive، Anti-CCP 80، ANA negative',
    },
    'الغدد الصماء والسكر': {
        complaint: 'مثال: عطش، فقدان وزن، إرهاق، عرق زائد',
        history: 'مثال: سكر عائلي، ضغط، أدويه، نظام غذائي',
        exam: 'مثال: BMI، فحص قدمين سكر، تورم غده درقيه',
        investigations: 'مثال: HbA1c 8.2%، TSH 0.1، FT4 2.1، Vit D 16',
    },
    'أمراض الدم': {
        complaint: 'مثال: شحوب، إرهاق، كدمات، نزيف، تضخم غدد',
        history: 'مثال: تاريخ عائلي، نقل دم، أدويه',
        exam: 'مثال: شحوب، تضخم طحال/كبد، كدمات',
        investigations: 'مثال: HGB 8.5، MCV 68، Ferritin 7، Platelets 90k، INR 1.1',
    },
    'الجراحة العامة': {
        complaint: 'مثال: ألم بطن، فتق، تورم، كتله',
        history: 'مثال: عمليات سابقه، أمراض مزمنه، أدويه',
        exam: 'مثال: بطن لينه، نقطه ألم، فتق إربي',
        investigations: 'مثال: US: gallstones، CT: appendicitis، WBC 14، CEA 2.5',
    },
    'جراحة التجميل والحروق': {
        complaint: 'مثال: حرق، جرح، ندبه، تشوه بعد إصابه',
        history: 'مثال: وقت الحرق، نوعه، تطعيم تيتانوس، أمراض مزمنه',
        exam: 'مثال: burn 2nd degree 5% TBSA، لا علامات عدوى، capillary refill جيد',
        investigations: 'مثال: CBC طبيعي، Albumin 3.8، Wound swab: no growth',
    },
    'جراحة الأوعية الدموية': {
        complaint: 'مثال: ألم ساق مع المشي، تورم طرف، دوالي، قرحه قدم',
        history: 'مثال: تدخين، سكر، جلطة سابقه، قسطره/دعامة',
        exam: 'مثال: DP ضعيف، edema +، varicose veins، قرحه 2 سم',
        investigations: 'مثال: Duplex: GSV reflux، ABI 0.7، D-dimer 0.3، CTA: SFA stenosis',
    },
    'جراحة القلب والصدر': {
        complaint: 'مثال: ألم صدر جراحي، ضيق نفس، كتله رئويه، تاريخ CABG',
        history: 'مثال: ذبحه صدريه، جراحه قلب سابقه، تدخين، COPD',
        exam: 'مثال: scar sternotomy ملتئم، air entry أقل يمين، لا cyanosis',
        investigations: 'مثال: CT chest: RUL mass 3 cm، Echo EF 45%، CXR: pleural effusion',
    },
    'جراحة الأطفال': {
        complaint: 'مثال: فتق إربي، خصيه معلّقه، قيء متكرر، ألم بطن',
        history: 'مثال: ولاده مبكره، عمليات سابقه، دخول حضّانه',
        exam: 'مثال: reducible inguinal hernia، testes palpable، abdomen soft',
        investigations: 'مثال: U/S: hydrocele، CBC طبيعي، AXR: no obstruction',
    },
    'جراحة الأورام': {
        complaint: 'مثال: كتله ثدي، تورم غدد، كتله رقبه، نزيف شرجي',
        history: 'مثال: تاريخ عائلي أورام، علاج كيماوي/إشعاعي سابق',
        exam: 'مثال: breast mass 2 cm UOQ، axillary nodes palpable، mobile',
        investigations: 'مثال: Biopsy: IDC grade II، Mammography BIRADS 4، CEA 5',
    },
    'طب الأورام': {
        complaint: 'مثال: متابعه كيماوي، فقدان وزن، ألم عظمي، غثيان بعد العلاج',
        history: 'مثال: نوع الورم، stage، بروتوكول العلاج، آخر جرعه',
        exam: 'مثال: ECOG 1، no palpable nodes، mucositis grade I',
        investigations: 'مثال: CT: partial response، CA-125 35، ANC 1.8، Hb 10.2',
    },
    'السمنة والنحافة والتغذية العلاجية': {
        complaint: 'مثال: زياده وزن، فقدان شهيه، اضطراب أكل',
        history: 'مثال: تاريخ وزن، أنظمه غذائيه، أمراض مزمنه',
        exam: 'مثال: BMI، توزيع دهون، علامات أيضيه',
        investigations: 'مثال: HbA1c 5.8%، LDL 145، TSH 3.2، Vit D 14، Ferritin 20',
    },
    'العلاج الطبيعي والتأهيل': {
        complaint: 'مثال: ألم ظهر، إصابه رياضيه، صعوبه حركه',
        history: 'مثال: حادث، عمليه، أمراض روماتيزميه',
        exam: 'مثال: ROM، قوه عضليه، ألم محدد',
        investigations: 'مثال: X-ray knee: OA grade II، MRI: meniscal tear، EMG: mild CTS',
    },
    'التخاطب وتعديل السلوك': {
        complaint: 'مثال: تأخر كلام، لدغه، تشتت انتباه، سلوك عدواني',
        history: 'مثال: حمل وولاده، تطور لغوي، حضانه/مدرسه، تاريخ أسري',
        exam: 'مثال: eye contact مناسب، receptive language أقل من العمر، articulation errors',
        investigations: 'مثال: IQ 90، CARS 28، Audiometry طبيعي، EEG طبيعي',
    },
    'علاج الألم (تخدير)': {
        complaint: 'مثال: ألم مزمن، ألم عصبي، ألم سرطاني',
        history: 'مثال: مده الألم، علاجات سابقه، أمراض مزمنه',
        exam: 'مثال: شده الألم (VAS)، نقاط حساسه',
        investigations: 'مثال: MRI lumbar: canal stenosis، EMG: radiculopathy، CRP 4',
    },
    'طب المسنين': {
        complaint: 'مثال: ضعف، نسيان، سقوط، شكاوى متعدده',
        history: 'مثال: أمراض مزمنه متعدده، أدويه كتيره',
        exam: 'مثال: علامات حيويه، نقاط ضغط، حاله إدراكيه',
        investigations: 'مثال: HGB 10.8، Cr 1.4، Na 132، B12 190، TSH 5.5',
    },
    'الطب الرياضي وإصابات الملاعب': {
        complaint: 'مثال: التواء كاحل، ألم ركبه بعد تمرين، إصابه كتف',
        history: 'مثال: نوع الرياضه، آليه الإصابه، إصابات سابقه، رجوع للعب',
        exam: 'مثال: Lachman موجب، swelling +، ROM محدود، tenderness على ATFL',
        investigations: 'مثال: MRI: ACL tear، X-ray: no fracture، U/S: partial tendon tear',
    },
};

/** يرجع placeholders مناسبه للتخصص. مع fallback للنصوص المحايده */
export const getClinicalPlaceholders = (
    doctorSpecialty?: string | null,
): ClinicalPlaceholders => {
    const specialty = String(doctorSpecialty || '').trim();
    return PLACEHOLDERS_BY_SPECIALTY[specialty] || DEFAULT_PLACEHOLDERS;
};
