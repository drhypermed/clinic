/**
 * usePublicBookingPageLogic.helpers — مساعدات خالصة
 *
 * دوال خالصة يستخدمها `usePublicBookingPageLogicCore` أثناء دمج وتنسيق
 * بيانات المرضى القادمة من مصادر متعددة (bookingConfig + recentRecords).
 *
 * تم فصلها عن الـ hook الرئيسي لتقليل حجمه.
 */

import type { PatientSuggestionOption } from '../add-appointment-form/types';

export const toPositiveFileNumber = (value: unknown): number | undefined => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
    return Math.floor(parsed);
};

export const toDateMsOrZero = (value?: string): number => {
    const parsed = Date.parse(String(value || ''));
    return Number.isFinite(parsed) ? parsed : 0;
};

/** اختيار أحدث تاريخ بين قيمتين (أو الصالح منهما) */
export const pickLatestDate = (left?: string, right?: string): string | undefined => {
    const leftText = String(left || '').trim();
    const rightText = String(right || '').trim();
    if (!leftText) return rightText || undefined;
    if (!rightText) return leftText || undefined;
    return toDateMsOrZero(rightText) >= toDateMsOrZero(leftText) ? rightText : leftText;
};

/** دمج عنصرَي مريض (incoming يأخذ الأولوية عندما تكون حقوله أحدث) */
export const mergePatientDirectoryItem = (
    current: PatientSuggestionOption,
    incoming: PatientSuggestionOption,
): PatientSuggestionOption => {
    const incomingName = String(incoming.patientName || '').trim();
    const currentName = String(current.patientName || '').trim();
    const incomingAge = String(incoming.age || '').trim();
    const currentAge = String(current.age || '').trim();
    const incomingPhone = String(incoming.phone || '').trim();
    const currentPhone = String(current.phone || '').trim();
    const incomingFileNumber = toPositiveFileNumber(incoming.patientFileNumber);
    const currentFileNumber = toPositiveFileNumber(current.patientFileNumber);

    return {
        id: String(incoming.id || current.id || '').trim(),
        patientName: incomingName || currentName || 'بدون اسم',
        age: incomingAge || currentAge || undefined,
        phone: incomingPhone || currentPhone || undefined,
        lastExamDate: pickLatestDate(current.lastExamDate, incoming.lastExamDate),
        lastConsultationDate: pickLatestDate(current.lastConsultationDate, incoming.lastConsultationDate),
        patientFileNumber: incomingFileNumber ?? currentFileNumber,
    };
};

/** دمج قائمتي مرضى مع الحفاظ على 300 عنصر كحد أقصى */
export const mergePatientDirectoryLists = (
    current: PatientSuggestionOption[],
    incoming: PatientSuggestionOption[],
): PatientSuggestionOption[] => {
    if (incoming.length === 0) return current;

    const mergedById = new Map<string, PatientSuggestionOption>();
    current.forEach((item) => {
        const idText = String(item.id || '').trim();
        if (!idText) return;
        mergedById.set(idText, item);
    });

    incoming.forEach((item) => {
        const idText = String(item.id || '').trim();
        if (!idText) return;
        const existing = mergedById.get(idText);
        mergedById.set(idText, existing ? mergePatientDirectoryItem(existing, item) : item);
    });

    return Array.from(mergedById.values()).slice(0, 300);
};
