/**
 * مرآة هوية المريض إلى إعدادات الحجز (Booking Config Identity Mirror)
 *
 * عند تحديث اسم/هاتف/عمر أي مريض، يجب أن يُعكس التحديث على النسخ المرآة
 * الموجودة تحت `bookingConfig/{secret}` — هذه النسخ هي التي يقرأها نظام
 * السكرتارية والحجز العام بدون صلاحيات كاملة.
 *
 * يحتوي هذا الـ module على:
 *   1. `resolveBookingSecretForUser` — البحث عن bookingSecret للمستخدم،
 *      أولاً من مستند المستخدم ثم من مجموعة bookingConfig.
 *   2. `syncBookingConfigIdentityMirror` — تحديث المصفوفات التالية في
 *      مستند bookingConfig الخاص بالعيادة:
 *         - todayAppointments (المواعيد اليوم)
 *         - recentExamPatients (آخر المرضى اللي تم كشفهم)
 *         - patientDirectory (دليل المرضى العام)
 *      مع تطبيق patch فقط على الإدخالات المرتبطة بالمريض المُحدَّث.
 *
 * هذه العملية Best-effort — أي فشل يُسجَّل في console ولا يُعاد توليده.
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    query,
    serverTimestamp,
    setDoc,
    where,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import {
    normalizePatientNameForFile,
    toPhoneDigits,
    toPlainObject,
    toPositiveInteger,
    toTrimmedText,
} from './normalizers';
import type { SyncBookingConfigIdentityInput } from './types';

/** حل bookingSecret لمستخدم محدد (من مستند المستخدم أولاً، ثم من bookingConfig) */
export const resolveBookingSecretForUser = async (userId: string): Promise<string> => {
    const normalizedUserId = toTrimmedText(userId);
    if (!normalizedUserId) return '';

    try {
        const userSnap = await getDoc(doc(db, 'users', normalizedUserId));
        const userData = userSnap.data() as { bookingSecret?: unknown } | undefined;
        const fromUserDoc = toTrimmedText(userData?.bookingSecret);
        if (fromUserDoc) return fromUserDoc;
    } catch (error) {
        console.error('Error reading booking secret from user document:', error);
    }

    try {
        const byConfigUserIdSnap = await getDocs(
            query(collection(db, 'bookingConfig'), where('userId', '==', normalizedUserId), limit(1))
        );

        if (!byConfigUserIdSnap.empty) {
            return toTrimmedText(byConfigUserIdSnap.docs[0].id);
        }
    } catch (error) {
        console.error('Error reading booking secret from booking config:', error);
    }

    return '';
};

/**
 * تحديث مرآة هوية مريض في مستند bookingConfig.
 * يُعدِّل فقط الإدخالات المرتبطة بالمريض (بحسب ID أو تطابق الاسم/الهاتف).
 */
export const syncBookingConfigIdentityMirror = async (input: SyncBookingConfigIdentityInput): Promise<void> => {
    const userId = toTrimmedText(input.userId);
    if (!userId) return;

    const bookingSecret = await resolveBookingSecretForUser(userId);
    if (!bookingSecret) return;

    const configRef = doc(db, 'bookingConfig', bookingSecret);
    const configSnap = await getDoc(configRef);
    if (!configSnap.exists()) return;

    const configData = (configSnap.data() || {}) as Record<string, unknown>;
    const patch: Record<string, unknown> = {};
    let hasPatch = false;

    const isIdentityMatch = (candidateName: unknown, candidatePhone: unknown): boolean => {
        const normalizedCandidateName = normalizePatientNameForFile(candidateName as string);
        if (!normalizedCandidateName || !input.knownNames.has(normalizedCandidateName)) return false;

        const normalizedCandidatePhone = toTrimmedText(candidatePhone);
        const normalizedCandidatePhoneDigits = toPhoneDigits(candidatePhone);

        if (input.knownPhones.size === 0 && input.knownPhoneDigits.size === 0) return true;
        if (!normalizedCandidatePhone && !normalizedCandidatePhoneDigits) return true;

        return (
            input.knownPhones.has(normalizedCandidatePhone)
            || (normalizedCandidatePhoneDigits ? input.knownPhoneDigits.has(normalizedCandidatePhoneDigits) : false)
        );
    };

    const applyIdentity = (item: Record<string, unknown>): { updated: Record<string, unknown>; changed: boolean } => {
        const existingName = normalizePatientNameForFile(item.patientName as string);
        const existingPhone = toTrimmedText(item.phone);
        const existingAge = toTrimmedText(item.age);

        const updated: Record<string, unknown> = {
            ...item,
            patientName: input.patientName,
        };

        if (input.phone) {
            updated.phone = input.phone;
        } else {
            delete updated.phone;
        }

        if (input.ageText) {
            updated.age = input.ageText;
        } else {
            delete updated.age;
        }

        const changed = (
            existingName !== input.patientName
            || existingPhone !== input.phone
            || existingAge !== input.ageText
        );

        return { updated, changed };
    };

    const todayAppointmentsRaw = configData.todayAppointments;
    if (Array.isArray(todayAppointmentsRaw)) {
        let changedTodayAppointments = false;
        const updatedTodayAppointments = todayAppointmentsRaw.map((entry) => {
            const item = toPlainObject(entry);
            if (!item) return entry;

            const appointmentId = toTrimmedText(item.id);
            const linkedByAppointmentId = Boolean(appointmentId) && input.updatedAppointmentIds.has(appointmentId);
            const linkedByIdentity = isIdentityMatch(item.patientName, item.phone);
            if (!linkedByAppointmentId && !linkedByIdentity) return entry;

            const { updated, changed } = applyIdentity(item);
            if (!changed) return entry;

            changedTodayAppointments = true;
            return updated;
        });

        if (changedTodayAppointments) {
            patch.todayAppointments = updatedTodayAppointments;
            hasPatch = true;
        }
    }

    const recentExamPatientsRaw = configData.recentExamPatients;
    if (Array.isArray(recentExamPatientsRaw)) {
        let changedRecentExamPatients = false;
        const updatedRecentExamPatients = recentExamPatientsRaw.map((entry) => {
            const item = toPlainObject(entry);
            if (!item) return entry;

            const recordId = toTrimmedText(item.id);
            const linkedByRecordId = Boolean(recordId) && input.updatedRecordIds.has(recordId);
            const linkedByIdentity = isIdentityMatch(item.patientName, item.phone);
            if (!linkedByRecordId && !linkedByIdentity) return entry;

            const { updated, changed } = applyIdentity(item);
            if (!changed) return entry;

            changedRecentExamPatients = true;
            return updated;
        });

        if (changedRecentExamPatients) {
            patch.recentExamPatients = updatedRecentExamPatients;
            hasPatch = true;
        }
    }

    const patientDirectoryRaw = configData.patientDirectory;
    if (Array.isArray(patientDirectoryRaw)) {
        let changedPatientDirectory = false;
        const updatedPatientDirectory = patientDirectoryRaw.map((entry) => {
            const item = toPlainObject(entry);
            if (!item) return entry;

            const itemPatientFileNumber = toPositiveInteger(item.patientFileNumber);
            const linkedByFileNumber = input.patientFileNumber > 0 && itemPatientFileNumber === input.patientFileNumber;
            const linkedByIdentity = isIdentityMatch(item.patientName, item.phone);
            if (!linkedByFileNumber && !linkedByIdentity) return entry;

            const identityUpdate = applyIdentity(item);
            let updated = identityUpdate.updated;
            let changed = identityUpdate.changed;

            if (input.patientFileNumber > 0 && itemPatientFileNumber !== input.patientFileNumber) {
                updated = {
                    ...updated,
                    patientFileNumber: input.patientFileNumber,
                };
                changed = true;
            }

            if (!changed) return entry;

            changedPatientDirectory = true;
            return updated;
        });

        if (changedPatientDirectory) {
            patch.patientDirectory = updatedPatientDirectory;
            hasPatch = true;
        }
    }

    if (!hasPatch) return;

    await setDoc(configRef, {
        ...patch,
        updatedAt: serverTimestamp(),
    }, { merge: true });
};
