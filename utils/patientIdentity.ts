/**
 * الملف: patientIdentity.ts
 * الوصف: دوال مشتركة للتعامل مع هوية المريض (الجنس + حساب السن الذكي).
 *
 * الفكرة الأساسية:
 * - المستخدم بيدخل السن مرّة واحدة للمريض الجديد.
 * - التطبيق بيحفظ السن + تاريخ السجل.
 * - لما نيجي نفتح سجل قديم/بحث عن مريض، بنضيف فرق الوقت (بين تاريخ السجل واليوم)
 *   على السن القديم → بيطلع السن الحالي تلقائياً.
 * - مش محتاجين من المريض/الطبيب يدخلوا تاريخ ميلاد أو أي تاريخ إضافي.
 *
 * الحمل والرضاعة: يظهروا بس لو الجنس أنثى وسنها 18-50 سنة.
 */

import type { PatientGender } from '../app/drug-catalog/types';

/** أجزاء السن (سنوات/شهور/أيام) — نفس الشكل المستخدم في PatientRecord.age */
export interface ComputedAgeParts {
    years: string;
    months: string;
    days: string;
}

/** نطاق السن اللي فيه الإناث بنسأل عن الحمل/الرضاعة (شامل الطرفين) */
export const FERTILITY_QUESTIONS_MIN_AGE_YEARS = 18; // بداية العمر الإنجابي التقريبي
export const FERTILITY_QUESTIONS_MAX_AGE_YEARS = 50; // نهاية العمر الإنجابي التقريبي

/** نحول الأرقام العربية إلى إنجليزية قبل الـparse (عشان الـparseInt ما يفشلش) */
const normalizeArabicDigits = (value: string): string =>
    value.replace(/[٠-٩]/g, (digit) => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(digit)]);

/** parse آمن لرقم السن — يرجع 0 لو القيمة غير صالحة */
const safeParseInt = (value?: string): number => {
    if (!value) return 0;
    const n = parseInt(normalizeArabicDigits(String(value)), 10);
    return Number.isFinite(n) ? n : 0;
};

/**
 * الدالة الأساسية: أضف الوقت المنقضي بين آخر زيارة واليوم على السن القديم.
 *
 * المثال: مريض جه الشنادي وعمره 10 سنين في 2025-04-23.
 * بعد سنة بالظبط (2026-04-23) لما ندوّر عليه في البحث:
 *   - oldAge = { years: '10', months: '0', days: '0' }
 *   - lastVisitDate = '2025-04-23'
 *   - referenceDate = 2026-04-23
 *   → النتيجة: { years: '11', months: '0', days: '0' }
 *
 * ملاحظة: نعتبر الشهر ≈ 30 يوم (تقريب عملي لتفادي تعقيدات التقويم).
 * الفرق الحقيقي عن السن الفعلي: أقصى 3-4 أيام في السنة — مقبول طبياً.
 */
export const advanceAgeByElapsedTime = (
    oldAge: { years?: string; months?: string; days?: string } | undefined,
    lastVisitDate: string | undefined,
    referenceDate?: Date,
): ComputedAgeParts => {
    const emptyAge: ComputedAgeParts = { years: '', months: '', days: '' };
    if (!oldAge || !lastVisitDate) return emptyAge;

    const oldYears = safeParseInt(oldAge.years);
    const oldMonths = safeParseInt(oldAge.months);
    const oldDays = safeParseInt(oldAge.days);
    // لو السن القديم كله أصفار/فاضي، ماعندناش baseline نبني عليه
    if (oldYears === 0 && oldMonths === 0 && oldDays === 0) return emptyAge;

    const last = new Date(lastVisitDate);
    if (Number.isNaN(last.getTime())) return {
        years: String(oldYears),
        months: String(oldMonths),
        days: String(oldDays),
    };

    const ref = referenceDate instanceof Date && !Number.isNaN(referenceDate.getTime())
        ? referenceDate
        : new Date();

    // الفرق بالأيام بين التاريخين (نضمن عدم السلبي — ما بنرجعش السن لوراء)
    const diffMs = ref.getTime() - last.getTime();
    if (diffMs <= 0) return {
        years: String(oldYears),
        months: String(oldMonths),
        days: String(oldDays),
    };
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // نحول كل شيء لأيام، نضيف الفرق، نرجع نكون سنوات/شهور/أيام
    // (تقريب: سنة = 365 يوم، شهر = 30 يوم — دقة كافية للسياق الطبي)
    const oldTotalDays = oldYears * 365 + oldMonths * 30 + oldDays;
    const newTotalDays = oldTotalDays + diffDays;

    const newYears = Math.floor(newTotalDays / 365);
    const remainderAfterYears = newTotalDays - newYears * 365;
    const newMonths = Math.floor(remainderAfterYears / 30);
    const newDays = remainderAfterYears - newMonths * 30;

    return {
        years: String(newYears),
        months: String(newMonths),
        days: String(newDays),
    };
};

/**
 * اختصار: يرجع نص السن الحالي (مثل "11 سنة") مبني على آخر سن محفوظ + تاريخ الزيارة.
 * يختار أكبر وحدة غير صفرية.
 */
export const advancedAgeText = (
    oldAge: { years?: string; months?: string; days?: string } | undefined,
    lastVisitDate: string | undefined,
    referenceDate?: Date,
): string => {
    const parts = advanceAgeByElapsedTime(oldAge, lastVisitDate, referenceDate);
    const y = safeParseInt(parts.years);
    const m = safeParseInt(parts.months);
    const d = safeParseInt(parts.days);
    if (y > 0) return `${y} سنة`;
    if (m > 0) return `${m} شهر`;
    if (d > 0) return `${d} يوم`;
    return '';
};

/**
 * حساب السن بالسنوات (رقم) من الأجزاء — لاستخدامها في قرار ظهور الحمل/الرضاعة.
 */
export const ageYearsFromParts = (parts?: { years?: string; months?: string; days?: string }): number => {
    if (!parts) return 0;
    return safeParseInt(parts.years);
};

/**
 * استخراج عدد السنوات من نص السن ("30 سنة" → 30، "6 شهر" → 0).
 * نرجع 0 للشهور/الأيام لأنها أصغر من سنة (غير مهمة لقرار الحمل).
 */
export const ageYearsFromAgeString = (ageText?: string): number => {
    if (!ageText || typeof ageText !== 'string') return 0;
    const normalized = normalizeArabicDigits(ageText);
    // لو نص الوحدة شهر/يوم فالمريض أقل من سنة
    if (/شهر|يوم/.test(normalized)) return 0;
    const match = normalized.match(/(\d+)/);
    if (!match) return 0;
    return safeParseInt(match[1]);
};

/**
 * تقدير أفضل لعدد سنوات المريض من أي مصدر متاح:
 * 1. الأجزاء (years/months/days) — أدق.
 * 2. النص ("30 سنة") — fallback.
 */
export const bestGuessAgeYears = (options: {
    ageParts?: { years?: string; months?: string; days?: string };
    ageText?: string;
}): number => {
    if (options.ageParts) {
        const fromParts = ageYearsFromParts(options.ageParts);
        if (fromParts > 0) return fromParts;
    }
    if (options.ageText) {
        return ageYearsFromAgeString(options.ageText);
    }
    return 0;
};

/**
 * القرار النهائي: هل نعرض حقول الحمل والرضاعة؟
 * الشرط: الجنس أنثى + السن بين 18 و 50 سنة (شامل).
 */
export const shouldAskFertilityQuestions = (
    gender: PatientGender | '' | undefined | null,
    ageInYears: number,
): boolean => {
    if (gender !== 'female') return false;
    if (!Number.isFinite(ageInYears)) return false;
    return ageInYears >= FERTILITY_QUESTIONS_MIN_AGE_YEARS
        && ageInYears <= FERTILITY_QUESTIONS_MAX_AGE_YEARS;
};

/**
 * تطبيع قيمة الجنس القادمة من مصدر غير موثوق (Firestore, URL).
 * يرجع قيمة محددة أو undefined لو غير صالحة.
 */
export const normalizeGender = (value: unknown): PatientGender | undefined => {
    if (value === 'male' || value === 'female') return value;
    return undefined;
};

/**
 * تحويل تاريخ الميلاد لنص سن قابل للعرض (مثلاً: "25 سنة" أو "8 أشهر").
 * يُستخدم لملء حقل السن تلقائياً في الفورم عند اختيار مريض قديم له تاريخ ميلاد.
 */
export const ageStringFromDateOfBirth = (dob: string): string => {
    if (!dob) return '';
    const birth = new Date(dob);
    if (!Number.isFinite(birth.getTime())) return '';
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (months < 0) { years -= 1; months += 12; }
    if (years > 0) return `${years}`;
    if (months > 0) return `0`;  // أقل من سنة — نُعيد 0 والطبيب يكمل
    return '0';
};

/**
 * تطبيع تاريخ الميلاد من أي مصدر: يقبل YYYY-MM-DD فقط، غير ذلك undefined.
 * يُستخدم لتنقية القيم القادمة من Firestore أو إدخال المستخدم.
 */
export const normalizeDateOfBirth = (value: unknown): string | undefined => {
    const str = typeof value === 'string' ? value.trim() : '';
    if (!str) return undefined;
    // نقبل YYYY-MM-DD فقط
    if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return undefined;
    const parsed = new Date(str);
    if (!Number.isFinite(parsed.getTime())) return undefined;
    return str;
};
