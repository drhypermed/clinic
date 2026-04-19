/**
 * أدوات تنظيف وبناء مفاتيح ملفات المرضى (Patient Files Normalizers)
 *
 * دوال خالصة (Pure functions) تُستخدم داخل كل modules الـ `patient-files`:
 *   - تنظيف أسماء المرضى (whitespace trim، توحيد صيغة).
 *   - بناء مفتاح اسم ملف المريض (`patientFileNameKey`) ومعرّف المستند.
 *   - فك ترميز مفتاح الاسم من معرّف المستند.
 *   - تحويل أرقام العمر وأرقام ملفات المرضى (Positive Integer/Zero).
 *   - تحويل نصوص الأرقام والهواتف إلى صيغ موحّدة.
 *   - تحويل بيانات Date/Firestore Timestamp إلى milliseconds أو ∞.
 *   - بناء نص عمر منسّق للمواعيد.
 *   - ترتيب مجموعات ملفات المرضى حسب الأقدمية.
 *
 * ملاحظة: بعض هذه الدوال مُصدَّرة باسمها الأصلي (`normalizePatientNameForFile`،
 * `buildPatientFileNameKey`، `buildPatientFileDocIdFromNameKey`) لأن مستهلكين
 * خارجيين يستوردونها مباشرة — لا يمكن تغيير أسمائها أو جعلها internal.
 */

import { PATIENT_FILE_DOC_PREFIX } from './constants';
import type {
    PatientFileSeniorityGroup,
    PatientIdentityAgeInput,
} from './types';

/**
 * توحيد اسم المريض كنص قابل للمقارنة (public — مُستخدم خارج هذه الوحدة)
 *
 * الغرض: ضمان إن نفس المريض يكون له ملف واحد بغض النظر عن اختلافات التهجئة
 * العربية الشائعة اللي بتحصل من الطبيب أو السكرتيرة أثناء إدخال الاسم.
 *
 * التحويلات المُطبَّقة:
 *  1. شيل علامات التشكيل (فتحة/كسرة/ضمة/شدة/سكون/تنوين).
 *  2. توحيد أشكال الألف: أ، إ، آ، ٱ → ا
 *  3. توحيد الياء والألف المقصورة: ى → ي
 *  4. توحيد التاء المربوطة والهاء: ة → ه
 *  5. توحيد الهمزات المستقلة: ء، ؤ، ئ → على ترك الحركة الأساسية (و/ي) أو شيلها
 *  6. توحيد المسافات المتعددة والداخلية إلى مسافة واحدة.
 *  7. تحويل الحروف الإنجليزية إلى lowercase (عشان Mohamed = mohamed).
 *  8. trim للأطراف.
 *
 * ملاحظة: الدالة دي خالصة (Pure) وُمصمَّمة بحيث الملفات القديمة المحفوظة
 * قبل الإصلاح ده تفضل موجودة بمفاتيحها الأصلية — الإصلاح بيأثر على الملفات
 * الجديدة فقط. لدمج الملفات القديمة المتشابهة، يحتاج migration منفصل.
 */
export const normalizePatientNameForFile = (name?: string): string => {
    const raw = String(name || '');
    if (!raw) return '';

    let result = raw
        // 1. شيل التشكيل العربي (التنوين، الفتحة، الكسرة، الضمة، الشدة، السكون، إلخ)
        .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
        // 2. توحيد الألف بكل أشكالها
        .replace(/[\u0623\u0625\u0622\u0671]/g, '\u0627') // أ، إ، آ، ٱ → ا
        // 3. توحيد الياء والألف المقصورة
        .replace(/\u0649/g, '\u064A') // ى → ي
        // 4. توحيد التاء المربوطة إلى هاء
        .replace(/\u0629/g, '\u0647') // ة → ه
        // 5. شيل الهمزة المستقلة (ء) والهمزات على و/ي (ؤ → و، ئ → ي)
        .replace(/\u0624/g, '\u0648') // ؤ → و
        .replace(/\u0626/g, '\u064A') // ئ → ي
        .replace(/\u0621/g, '')         // ء → (شيلها)
        // 6. توحيد المسافات (كل الـ whitespace) إلى مسافة واحدة
        .replace(/\s+/g, ' ')
        // 7. lowercase للإنجليزية
        .toLowerCase()
        // 8. trim
        .trim();

    return result;
};

/** بناء مفتاح اسم ملف المريض (يعتمد على الاسم المنظف) — public */
export const buildPatientFileNameKey = (patientName?: string): string => normalizePatientNameForFile(patientName);

/** بناء معرّف مستند ملف المريض من مفتاح الاسم — public */
export const buildPatientFileDocIdFromNameKey = (nameKey: string): string => {
    return `${PATIENT_FILE_DOC_PREFIX}${encodeURIComponent(nameKey)}`;
};

/** تحويل أي قيمة إلى Integer موجب أو صفر */
export const toPositiveIntegerOrZero = (value: unknown): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
};

/** تحويل أي قيمة إلى Integer موجب أو undefined إذا لم تكن صالحة */
export const toPositiveInteger = (value: unknown): number | undefined => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
    return Math.floor(parsed);
};

/** توحيد نص مقصوص بأمان حتى لو كان undefined */
export const toTrimmedText = (value: unknown): string => String(value || '').trim();

/** استخراج أرقام الهاتف فقط (بدون مسافات أو رموز) */
export const toPhoneDigits = (value: unknown): string => String(value || '').replace(/\D/g, '');

/** تحويل أي قيمة إلى كائن عادي (object) أو null */
export const toPlainObject = (value: unknown): Record<string, unknown> | null => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    return value as Record<string, unknown>;
};

/** تحويل كائن عمر المريض إلى نصوص منظفة (سنوات/أشهر/أيام) */
export const normalizeAgeInput = (
    age?: PatientIdentityAgeInput
): { years: string; months: string; days: string } => ({
    years: toTrimmedText(age?.years),
    months: toTrimmedText(age?.months),
    days: toTrimmedText(age?.days),
});

/** بناء نص عمر جاهز للعرض في بطاقة الموعد ("3 سنة - 2 شهر") */
export const buildAppointmentAgeText = (age: { years: string; months: string; days: string }): string => {
    const years = toTrimmedText(age.years);
    const months = toTrimmedText(age.months);
    const days = toTrimmedText(age.days);
    const parts: string[] = [];

    if (years && years !== '0') parts.push(`${years} سنة`);
    if (months && months !== '0') parts.push(`${months} شهر`);
    if (days && days !== '0') parts.push(`${days} يوم`);

    return parts.join(' - ');
};

/**
 * تحويل أي قيمة تاريخ (نص ISO / Firestore Timestamp / undefined) إلى
 * milliseconds. إذا كانت غير صالحة أو غير موجودة، ترجع ∞ (Positive Infinity)
 * لتُستخدم في منطق الترتيب (غير المعروف يأتي أخيراً).
 */
export const toDateMsOrInfinity = (value: unknown): number => {
    if (!value) return Number.POSITIVE_INFINITY;

    if (typeof value === 'string') {
        const parsed = Date.parse(value);
        return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
    }

    if (typeof value === 'object' && value !== null && typeof (value as { toDate?: () => Date }).toDate === 'function') {
        const asDate = (value as { toDate: () => Date }).toDate();
        const ms = asDate.getTime();
        return Number.isFinite(ms) ? ms : Number.POSITIVE_INFINITY;
    }

    return Number.POSITIVE_INFINITY;
};

/** فك ترميز مفتاح اسم ملف المريض من معرّف المستند (يعكس buildPatientFileDocIdFromNameKey) */
export const decodeNameKeyFromPatientFileDocId = (docId: string): string => {
    if (!docId.startsWith(PATIENT_FILE_DOC_PREFIX)) return '';
    const encoded = docId.slice(PATIENT_FILE_DOC_PREFIX.length);
    if (!encoded) return '';
    try {
        return decodeURIComponent(encoded).trim();
    } catch {
        return encoded.trim();
    }
};

/** بناء مفتاح ترتيب لمجموعة ملفات مريض (أقدم مَن له تاريخ معروف، ثم رقم موجود، ثم الاسم) */
export const buildGroupSortKey = (group: PatientFileSeniorityGroup) => {
    const hasKnownOldestDate = Number.isFinite(group.oldestVisitMs);
    return {
        hasKnownOldestDate,
        oldestVisitMs: group.oldestVisitMs,
        existingNumber: group.existingNumber ?? Number.MAX_SAFE_INTEGER,
        nameKey: group.nameKey,
    };
};
