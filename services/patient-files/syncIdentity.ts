/**
 * مزامنة هوية المريض عبر كل السجلات والمواعيد (Patient Identity Sync)
 *
 * `syncPatientIdentityByFile` هي العملية الشاملة التي تُنفَّذ عند تغيير
 * اسم/هاتف/عمر مريض. الخطوات:
 *
 *   1. حل مرجع ملف المريض (id + number + nameKey) — يعتمد إما على
 *      المُدخلات المباشرة أو على البحث بالرقم أو مفتاح الاسم، ثم
 *      يُستدعى `ensurePatientFileReference` كحل أخير.
 *
 *   2. تحديث مستند ملف المريض تحت `users/{uid}/settings/patientFile__*`.
 *
 *   3. البحث عن كل الـ records التي تطابق المريض (بـ fileId أو number أو
 *      nameKey) ثم تجهيز patch على كل سجل — وتحديث بطاقات الهوية في كل
 *      المواعيد التي تطابق أسماء/هواتف المريض القديمة.
 *
 *   4. تطبيق التحديثات على دفعات (batches) ضمن حد `MAX_BATCH_OPERATIONS`.
 *
 *   5. استدعاء `syncBookingConfigIdentityMirror` لتحديث النسخة المرآة في
 *      `bookingConfig/{secret}` — Best-effort، لا تكسر العملية إن فشلت.
 *
 * يُرجع عدد الـ records والمواعيد التي تم تحديثها فعلياً لعرضه في الواجهة.
 */

import {
    collection,
    deleteField,
    doc,
    getDoc,
    getDocs,
    limit,
    query,
    serverTimestamp,
    where,
    writeBatch,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { MAX_BATCH_OPERATIONS } from './constants';
import { syncBookingConfigIdentityMirror } from './bookingConfigMirror';
import {
    buildAppointmentAgeText,
    buildPatientFileDocIdFromNameKey,
    buildPatientFileNameKey,
    decodeNameKeyFromPatientFileDocId,
    normalizeAgeInput,
    normalizePatientNameForFile,
    toPhoneDigits,
    toPositiveInteger,
    toTrimmedText,
} from './normalizers';
import { ensurePatientFileReference } from './patientFileReference';
import type {
    SyncPatientIdentityByFileInput,
    SyncPatientIdentityByFileResult,
} from './types';

/** مزامنة هوية مريض واحد عبر كل الـ records والمواعيد والمرآة */
export const syncPatientIdentityByFile = async (
    input: SyncPatientIdentityByFileInput
): Promise<SyncPatientIdentityByFileResult | null> => {
    const userId = toTrimmedText(input.userId);
    const patientNameText = normalizePatientNameForFile(input.patientName);
    if (!userId || !patientNameText) return null;

    const phoneText = toTrimmedText(input.phone);
    const normalizedAge = normalizeAgeInput(input.age);
    const agePayload = {
        years: normalizedAge.years,
        months: normalizedAge.months,
        days: normalizedAge.days,
    };
    const appointmentAgeText = buildAppointmentAgeText(normalizedAge);

    let resolvedPatientFileId = toTrimmedText(input.patientFileId);
    let resolvedPatientFileNumber = toPositiveInteger(input.patientFileNumber);
    let currentNameKey = toTrimmedText(input.patientFileNameKey);

    const settingsCollectionRef = collection(db, 'users', userId, 'settings');

    if (resolvedPatientFileId) {
        const patientFileSnap = await getDoc(doc(db, 'users', userId, 'settings', resolvedPatientFileId));
        if (patientFileSnap.exists()) {
            const data = patientFileSnap.data() as {
                patientFileNumber?: unknown;
                patientFileNameKey?: unknown;
            };
            resolvedPatientFileNumber = toPositiveInteger(data.patientFileNumber) || resolvedPatientFileNumber;
            currentNameKey = toTrimmedText(data.patientFileNameKey) || currentNameKey || decodeNameKeyFromPatientFileDocId(resolvedPatientFileId);
        }
    }

    if (!resolvedPatientFileId && resolvedPatientFileNumber) {
        const byNumberSnap = await getDocs(
            query(settingsCollectionRef, where('patientFileNumber', '==', resolvedPatientFileNumber), limit(1))
        );
        if (!byNumberSnap.empty) {
            const firstDoc = byNumberSnap.docs[0];
            const data = firstDoc.data() as { patientFileNameKey?: unknown };
            resolvedPatientFileId = firstDoc.id;
            currentNameKey = toTrimmedText(data.patientFileNameKey) || currentNameKey || decodeNameKeyFromPatientFileDocId(firstDoc.id);
        }
    }

    if (!resolvedPatientFileId && currentNameKey) {
        const byNameDocId = buildPatientFileDocIdFromNameKey(currentNameKey);
        const byNameSnap = await getDoc(doc(db, 'users', userId, 'settings', byNameDocId));
        if (byNameSnap.exists()) {
            const data = byNameSnap.data() as { patientFileNumber?: unknown; patientFileNameKey?: unknown };
            resolvedPatientFileId = byNameDocId;
            resolvedPatientFileNumber = toPositiveInteger(data.patientFileNumber) || resolvedPatientFileNumber;
            currentNameKey = toTrimmedText(data.patientFileNameKey) || currentNameKey;
        }
    }

    if (!resolvedPatientFileId || !resolvedPatientFileNumber) {
        const ensured = await ensurePatientFileReference(userId, patientNameText, phoneText || undefined);
        if (!ensured) return null;
        resolvedPatientFileId = ensured.patientFileId;
        resolvedPatientFileNumber = ensured.patientFileNumber;
        currentNameKey = ensured.patientFileNameKey;
    }

    const targetNameKey = buildPatientFileNameKey(patientNameText) || currentNameKey;

    await writeBatch(db)
        .set(doc(db, 'users', userId, 'settings', resolvedPatientFileId), {
            patientName: patientNameText,
            phone: phoneText || deleteField(),
            patientFileNumber: resolvedPatientFileNumber,
            patientFileNameKey: targetNameKey,
            updatedAt: serverTimestamp(),
        }, { merge: true })
        .commit();

    const recordsCollectionRef = collection(db, 'users', userId, 'records');
    const matchedRecordsById = new Map<string, ReturnType<typeof doc>>();
    const matchedRecordDataById = new Map<string, Record<string, unknown>>();

    const loadRecordsByField = async (field: 'patientFileId' | 'patientFileNumber' | 'patientFileNameKey', value?: string | number) => {
        if (value === undefined || value === null || value === '') return;
        const snap = await getDocs(query(recordsCollectionRef, where(field, '==', value)));
        snap.docs.forEach((recordSnap) => {
            matchedRecordsById.set(recordSnap.id, recordSnap.ref);
            matchedRecordDataById.set(recordSnap.id, recordSnap.data() as Record<string, unknown>);
        });
    };

    await loadRecordsByField('patientFileId', resolvedPatientFileId);
    await loadRecordsByField('patientFileNumber', resolvedPatientFileNumber);
    await loadRecordsByField('patientFileNameKey', currentNameKey);
    await loadRecordsByField('patientFileNameKey', targetNameKey);

    const oldNames = new Set<string>();
    const oldPhones = new Set<string>();
    const oldPhoneDigits = new Set<string>();
    matchedRecordDataById.forEach((data) => {
        const oldName = normalizePatientNameForFile(data.patientName as string);
        const oldPhone = toTrimmedText(data.phone);
        if (oldName) oldNames.add(oldName);
        if (oldPhone) {
            oldPhones.add(oldPhone);
            const oldPhoneNormalizedDigits = toPhoneDigits(oldPhone);
            if (oldPhoneNormalizedDigits) oldPhoneDigits.add(oldPhoneNormalizedDigits);
        }
    });

    oldNames.add(patientNameText);
    if (phoneText) {
        oldPhones.add(phoneText);
        const newPhoneNormalizedDigits = toPhoneDigits(phoneText);
        if (newPhoneNormalizedDigits) oldPhoneDigits.add(newPhoneNormalizedDigits);
    }

    type UpdateEntry = { ref: ReturnType<typeof doc>; payload: Record<string, unknown> };

    const recordUpdateEntries: UpdateEntry[] = [];
    Array.from(matchedRecordsById.entries()).forEach(([recordId, recordRef]) => {
        const existing = matchedRecordDataById.get(recordId) || {};
        const existingName = normalizePatientNameForFile(existing.patientName as string);
        const existingPhone = toTrimmedText(existing.phone);
        const existingAge = (existing.age && typeof existing.age === 'object')
            ? existing.age as { years?: unknown; months?: unknown; days?: unknown }
            : {};
        const existingYears = toTrimmedText(existingAge.years);
        const existingMonths = toTrimmedText(existingAge.months);
        const existingDays = toTrimmedText(existingAge.days);
        const existingFileId = toTrimmedText(existing.patientFileId);
        const existingFileNumber = toPositiveInteger(existing.patientFileNumber);
        const existingNameKey = toTrimmedText(existing.patientFileNameKey);

        const hasChanges = (
            existingName !== patientNameText
            || existingPhone !== phoneText
            || existingYears !== agePayload.years
            || existingMonths !== agePayload.months
            || existingDays !== agePayload.days
            || existingFileId !== resolvedPatientFileId
            || existingFileNumber !== resolvedPatientFileNumber
            || existingNameKey !== targetNameKey
        );

        if (!hasChanges) return;

        recordUpdateEntries.push({
            ref: recordRef,
            payload: {
                patientName: patientNameText,
                phone: phoneText || deleteField(),
                age: agePayload,
                patientFileId: resolvedPatientFileId,
                patientFileNumber: resolvedPatientFileNumber,
                patientFileNameKey: targetNameKey,
                updatedAt: serverTimestamp(),
            },
        });
    });

    const appointmentsCollectionRef = collection(db, 'users', userId, 'appointments');
    const appointmentsSnap = await getDocs(appointmentsCollectionRef);
    const appointmentUpdateEntries: UpdateEntry[] = [];
    appointmentsSnap.docs.forEach((appointmentSnap) => {
        const data = appointmentSnap.data() as Record<string, unknown>;
        const existingName = normalizePatientNameForFile(data.patientName as string);
        const existingPhone = toTrimmedText(data.phone);
        const existingPhoneDigits = toPhoneDigits(data.phone);
        const existingAgeText = toTrimmedText(data.age);
        const existingFileNumber = toPositiveInteger(data.patientFileNumber);

        const linkedByFileNumber = existingFileNumber === resolvedPatientFileNumber;
        const linkedByIdentity = oldNames.has(existingName) && (
            (oldPhones.size === 0 && oldPhoneDigits.size === 0)
            || (!existingPhone && !existingPhoneDigits)
            || oldPhones.has(existingPhone)
            || (existingPhoneDigits ? oldPhoneDigits.has(existingPhoneDigits) : false)
        );

        if (!linkedByFileNumber && !linkedByIdentity) return;

        const hasChanges = (
            existingName !== patientNameText
            || existingPhone !== phoneText
            || existingAgeText !== appointmentAgeText
            || existingFileNumber !== resolvedPatientFileNumber
        );

        if (!hasChanges) return;

        appointmentUpdateEntries.push({
            ref: appointmentSnap.ref,
            payload: {
                patientName: patientNameText,
                phone: phoneText || deleteField(),
                age: appointmentAgeText || deleteField(),
                patientFileNumber: resolvedPatientFileNumber,
                updatedAt: serverTimestamp(),
            },
        });
    });

    const applyUpdatesInChunks = async (
        updates: Array<{ ref: ReturnType<typeof doc>; payload: Record<string, unknown> }>
    ) => {
        let batch = writeBatch(db);
        let operationCount = 0;

        for (const item of updates) {
            batch.update(item.ref, item.payload);
            operationCount += 1;

            if (operationCount >= MAX_BATCH_OPERATIONS) {
                await batch.commit();
                batch = writeBatch(db);
                operationCount = 0;
            }
        }

        if (operationCount > 0) {
            await batch.commit();
        }
    };

    await applyUpdatesInChunks(recordUpdateEntries);
    await applyUpdatesInChunks(appointmentUpdateEntries);

    const updatedRecordIds = new Set(recordUpdateEntries.map((entry) => entry.ref.id));
    const updatedAppointmentIds = new Set(appointmentUpdateEntries.map((entry) => entry.ref.id));

    try {
        await syncBookingConfigIdentityMirror({
            userId,
            patientName: patientNameText,
            phone: phoneText,
            ageText: appointmentAgeText,
            patientFileNumber: resolvedPatientFileNumber || 0,
            knownNames: oldNames,
            knownPhones: oldPhones,
            knownPhoneDigits: oldPhoneDigits,
            updatedRecordIds,
            updatedAppointmentIds,
        });
    } catch (bookingConfigSyncError) {
        console.error('Error syncing patient identity to secretary booking config mirror:', bookingConfigSyncError);
    }

    return {
        patientFileId: resolvedPatientFileId,
        patientFileNumber: resolvedPatientFileNumber,
        patientFileNameKey: targetNameKey,
        updatedRecordsCount: recordUpdateEntries.length,
        updatedAppointmentsCount: appointmentUpdateEntries.length,
    };
};
