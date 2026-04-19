/**
 * مساعدات عرض السجلات (Records View Helpers)
 *
 * دوال وأنواع خالصة تُستخدم داخل `RecordsView.tsx`:
 *   - بناء مفاتيح الفرز والتصفية للمرضى.
 *   - توحيد تنسيق المدى الزمني (Date Range) المُختار.
 *   - اختبار ما إذا كانت زيارة تقع داخل فلاتر التاريخ الحالية.
 *   - تعيين تسلسل الاستشارات لكل مريض.
 */

import type { PatientRecord } from '../../../types';
import type { RecordTimelineEntry } from '../recordsViewParts';

/** وضع ترتيب السجلات في الخط الزمني */
export type TimelineSortOrder = 'newestToOldest' | 'oldestToNewest';

/** وضع فلتر التاريخ في الخط الزمني */
export type TimelineDateFilterMode = 'all' | 'singleDay' | 'dateRange';

/** توحيد جزء من مفتاح هوية المريض (lowercase + trim) */
export const normalizePatientKeyPart = (value?: string): string => String(value || '').trim().toLowerCase();

/** بناء مفتاح هوية فريد للمريض يُستخدم في تجميع الاستشارات */
export const buildPatientTimelineKey = (record: PatientRecord): string => {
    const namePart = normalizePatientKeyPart(record.patientName);
    const phonePart = normalizePatientKeyPart(record.phone);
    return `${namePart}::${phonePart || 'no-phone'}`;
};

/**
 * تطبيق تسلسل الاستشارات على entries الخط الزمني.
 * يُرجع نسخة جديدة من الـ entries مع إضافة `consultationSequenceForPatient`
 * لكل entry من نوع استشارة.
 */
export const applyConsultationSequence = (
    entries: RecordTimelineEntry[],
    sequenceByEntryId: Map<string, number>
): RecordTimelineEntry[] => {
    return entries.map((entry) => {
        if (entry.visitType !== 'consultation') return entry;
        return {
            ...entry,
            consultationSequenceForPatient: sequenceByEntryId.get(entry.entryId) || 1,
        };
    });
};

/**
 * توحيد المدى الزمني: إذا كان التاريخ الأصغر أكبر من الأكبر يتم تبديلهما.
 * إذا كان أحدهما فارغاً يُستخدم الآخر لكلا الطرفين.
 */
export const normalizeDateRange = (startDate: string, endDate: string): { from: string; to: string } => {
    const start = String(startDate || '').trim();
    const end = String(endDate || '').trim();

    if (!start && !end) return { from: '', to: '' };
    if (!start) return { from: end, to: end };
    if (!end) return { from: start, to: start };
    return start <= end ? { from: start, to: end } : { from: end, to: start };
};

/** اختبار ما إذا كان تاريخ entry يقع داخل فلاتر التاريخ الحالية */
export const isTimelineEntryWithinDateFilters = (
    entryDate: string,
    mode: TimelineDateFilterMode,
    singleDayDate: string,
    rangeFrom: string,
    rangeTo: string,
): boolean => {
    if (mode === 'singleDay') {
        return !singleDayDate || entryDate === singleDayDate;
    }

    if (mode === 'dateRange') {
        if (!rangeFrom || !rangeTo) return true;
        return entryDate >= rangeFrom && entryDate <= rangeTo;
    }

    return true;
};
