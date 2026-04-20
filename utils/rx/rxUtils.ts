import { AlternativeMed, Medication } from '../../types';
import { FOLLOWUP_WITHIN_WEEK_NOTE_AR_VARIANTS } from '../prescriptionText';

/**
 * وظيفة تطهير نص الجرعة (Sanitize Dosage):
 * تضمن عدم عرض قيم برمجية خاطئة (مثل NaN أو undefined) في الروشتة النهائية.
 */
export const sanitizeDosageText = (text: any): string => {
    const str = (text ?? '').toString();
    if (!str.trim()) return 'الجرعة تُحدد حسب الوزن/العمر';
    if (/nan|undefined|infinity/i.test(str)) return 'الجرعة تُحدد بعد إدخال وزن/عمر صحيح';
    return str;
};

/** إزالة الرموز المحطمة والحروف غير القابلة للقراءة */
const stripBrokenChars = (value: string): string =>
    (value || '').replace(/[\u0000-\u001F\u007F-\u009F\uFFFD]/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * معالجة "الموجيباكي" (Mojibake Fix):
 * وظيفة ذكية جداً تحاول إصلاح النصوص العربية التي تظهر كرموز غربية مشوهة
 * نتيجة خطأ في ترميز البيانات (Encoding) أثناء النقل أو النسخ.
 */
const tryFixArabicMojibake = (value: string): string => {
    const s = stripBrokenChars((value || '').toString());
    // إذا لم يحتوي النص على رموز تشويه شائعة، نرجعه كما هو
    if (!/[\u00D8\u00D9\u00C2]/.test(s)) return s;

    try {
        let current = s;
        for (let i = 0; i < 2; i += 1) {
            const bytes = new Uint8Array(Array.from(current).map((ch) => ch.charCodeAt(0) & 0xff));
            const decoded = new TextDecoder('utf-8').decode(bytes);
            const hasArabic = /[\u0600-\u06FF]/.test(decoded);
            const hasMojibake = /[\u00D8\u00D9\u00C2]/.test(decoded);
            if (hasArabic && !hasMojibake) return decoded;
            if (decoded === current) break;
            current = decoded;
        }
    } catch {
        // في حال فشل الإصلاح، نحتفظ بالنص الأصلي
    }

    return s;
};

/** تنظيم قائمة النصائح الطبية وإزالة التكرار أو النصوص الفارغة */
export const normalizeAdviceList = (arr: string[]): string[] => {
    const cleaned = (arr || [])
        .map((x) => stripBrokenChars(tryFixArabicMojibake((x ?? '').toString())).trim())
        .filter(Boolean);

    // استثناء ملاحظات المتابعة الدورية لتجنب تكرارها مع نظام المتابعة الآلي
    const variants = new Set(FOLLOWUP_WITHIN_WEEK_NOTE_AR_VARIANTS.map(v => (v || '').toString().trim()));
    return cleaned.filter(x => !variants.has((x || '').toString().trim()));
};

/** ضمان ظهور اسم التحليل باللغة الإنجليزية (عالمي) */
const ensureEnglishTestName = (test: string): string => {
    const t = (test || '').toString().trim();
    if (!t) return 'LAB TEST';

    const upper = t.toUpperCase().replace(/\s+/g, ' ').trim();
    if (/^[A-Z0-9+\-/.\s]+$/.test(upper)) return upper;

    // استخراج الحروف الإنجليزية فقط إذا كان الاسم هجيناً
    const englishPart = upper.replace(/[^A-Z0-9+\-/.\s]/g, '').replace(/\s+/g, ' ').trim();
    return englishPart || 'LAB TEST';
};

/** ضمان وجود سبب طبي باللغة العربية للتحليل المطلوب */
const ensureArabicReason = (reason: string): string => {
    const r = stripBrokenChars(tryFixArabicMojibake(reason || '')).trim();
    if (!r) return 'سبب سريري مرتبط بالحالة';
    const hasArabic = /[\u0600-\u06FF]/.test(r);
    if (!hasArabic) return 'سبب سريري مرتبط بالحالة';
    return r;
};

/** 
 * تنسيق طلب التحليل (formatLabInvestigationItem):
 * يحول النص المدخل من الطبيب إلى صيغة احترافية: "NAME (REASON)"
 * مثال: "CBC (للتأكد من نسبة الهيموجلوبين)"
 */
export const formatLabInvestigationItem = (raw: string): string => {
    const rawStr = (raw ?? '').toString();
    const normalized = stripBrokenChars(tryFixArabicMojibake(rawStr)).trim();
    if (!normalized) return '';

    // البحث عن نمط "الاسم (السبب)"
    const mParen = normalized.match(/^\s*([^()]+?)\s*\((.+)\)\s*$/);
    if (mParen) {
        const test = ensureEnglishTestName(mParen[1]);
        const reason = ensureArabicReason(mParen[2]);
        return `${test} (${reason})`;
    }

    // البحث عن فواصل يدوية مثل (-) أو (:)
    const parts = normalized.split(/\s*[-:|،]\s*/).filter(Boolean);
    if (parts.length >= 2) {
        const test = ensureEnglishTestName(parts[0]);
        const reason = ensureArabicReason(parts.slice(1).join(' - '));
        return `${test} (${reason})`;
    }

    const testOnly = ensureEnglishTestName(normalized);
    return `${testOnly} (سبب سريري مرتبط بالحالة)`;
};

/**
 * فلترة البديل حسب السن المدخل:
 * يرجع true لو البديل مناسب لعمر المريض، false لو خارج النطاق الآمن.
 * - لو مفيش عمر مدخل (ageMonths <= 0) يقبل كل البدائل (لا فلترة).
 * - لو البديل بدون minAgeMonths نعتبره صالح من الميلاد.
 * - لو البديل بدون maxAgeMonths نعتبره بدون حد أقصى.
 */
const isAgeAppropriate = (med: Medication, ageMonths: number): boolean => {
    if (!Number.isFinite(ageMonths) || ageMonths <= 0) return true;
    const minAge = Number.isFinite(med.minAgeMonths) ? (med.minAgeMonths as number) : 0;
    const maxAge = Number.isFinite(med.maxAgeMonths) ? (med.maxAgeMonths as number) : Infinity;
    return ageMonths >= minAge && ageMonths <= maxAge;
};

/**
 * بناء البدائل الدوائية (buildAlternativesSameScientific):
 * يبحث في قاعدة البيانات عن أدوية تحتوي على نفس المادة الفعالة (Generic Name)
 * أو تنتمي لنفس التصنيف الطبي، لتمكين الطبيب من تغيير الصنف إذا كان غير متوفر.
 *
 * فلتر السن (Age Safety Filter):
 * بعد جمع المرشحين، نستبعد الأدوية غير المناسبة لعمر المريض المدخل بناءً على
 * minAgeMonths / maxAgeMonths الخاصة بكل دواء. لو مفيش عمر مدخل يُعرض كل شيء.
 */
export const buildAlternativesSameScientific = (
    medication: Medication,
    weightKg: number,
    ageMonths: number,
    allMedications: Medication[] = []
): AlternativeMed[] => {
    const source = Array.isArray(allMedications) && allMedications.length > 0 ? allMedications : [medication];
    const safeWeight = Number.isFinite(weightKg) && weightKg > 0 ? weightKg : (medication.minWeight || 0);
    const safeAge = Number.isFinite(ageMonths) && ageMonths > 0 ? ageMonths : (medication.minAgeMonths || 0);

    // 1. البحث عن تطابق تام في المادة الفعالة
    let scientificMatches = source.filter(m => {
        if (m.id === medication.id) return false;
        return m.genericName.toLowerCase().trim() === medication.genericName.toLowerCase().trim();
    });

    // 2. البحث عن تطابق جزئي إذا كانت النتائج قليلة
    if (scientificMatches.length < 5) {
        const looseMatches = source.filter(m => {
            if (m.id === medication.id) return false;
            if (scientificMatches.some(ex => ex.id === m.id)) return false;

            return m.genericName.toLowerCase().includes(medication.genericName.toLowerCase()) ||
                medication.genericName.toLowerCase().includes(m.genericName.toLowerCase());
        });
        scientificMatches = [...scientificMatches, ...looseMatches];
    }

    // 3. البحث في نفس التصنيف الطبي كخيار أخير
    let categoryMatches: Medication[] = [];
    if (scientificMatches.length < 10) {
        categoryMatches = source.filter(m => {
            if (m.id === medication.id) return false;
            if (scientificMatches.some(ex => ex.id === m.id)) return false;
            return m.category === medication.category && m.form === medication.form;
        });
    }

    const allMatches = [...scientificMatches, ...categoryMatches];

    // 4. فلترة حسب السن: استبعاد الأدوية غير المناسبة لعمر المريض المدخل
    const ageFiltered = allMatches.filter(m => isAgeAppropriate(m, ageMonths));

    const limitedMatches = ageFiltered.slice(0, 10);

    return limitedMatches.map(m => ({
        name: m.name,
        scientificName: m.genericName,
        concentration: m.concentration,
        price: m.price,
        form: m.form,
        dosage: sanitizeDosageText(typeof m.calculationRule === 'function' ? m.calculationRule(safeWeight, safeAge) : (m as any).dosage || ''),
        instructions: m.instructions
    }));
};
