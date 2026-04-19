/**
 * بناء فهرس الترقيم بالأقدمية (Patient Files Seniority Index)
 *
 * هذه الوحدة تحتوي على `ensurePatientFilesSeniorityIndex` — عملية تهجير
 * دفعية (migration) تُشغَّل مرة واحدة لكل مستخدم عندما ترتفع نسخة
 * `PATIENT_FILES_SENIORITY_VERSION`. الخطوات:
 *
 *   1. قراءة كل الـ records الخاصة بالمستخدم واستخراج "مجموعات" بحسب
 *      مفتاح اسم المريض (`patientFileNameKey`).
 *   2. قراءة كل مستندات `patientFile__*` الموجودة مسبقاً لاستخراج أقدم
 *      زيارة محفوظة ورقم الملف الحالي إن وجد.
 *   3. ترتيب المجموعات تصاعدياً حسب أقدم زيارة (ثم الرقم الحالي، ثم الاسم).
 *   4. تعيين رقم ملف مريض متسلسل (1, 2, 3...) لكل مجموعة.
 *   5. كتابة النتائج دفعات إلى Firestore مع تحديث الـ records والمستندات.
 *   6. ختم العدّاد المركزي بالنسخة الحالية لتجنب إعادة التنفيذ.
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    serverTimestamp,
    writeBatch,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import {
    MAX_BATCH_OPERATIONS,
    PATIENT_FILE_DOC_PREFIX,
    PATIENT_FILES_COUNTER_DOC_ID,
    PATIENT_FILES_SENIORITY_VERSION,
} from './constants';
import {
    buildGroupSortKey,
    buildPatientFileDocIdFromNameKey,
    buildPatientFileNameKey,
    decodeNameKeyFromPatientFileDocId,
    normalizePatientNameForFile,
    toDateMsOrInfinity,
    toPositiveInteger,
    toPositiveIntegerOrZero,
} from './normalizers';
import type { PatientFileSeedRecord, PatientFileSeniorityGroup } from './types';

/** إعادة بناء فهرس ترقيم ملفات المرضى بالأقدمية (migration once-per-user) */
export const ensurePatientFilesSeniorityIndex = async (
    userId: string,
    records: PatientFileSeedRecord[]
): Promise<void> => {
    if (!userId) return;

    const counterRef = doc(db, 'users', userId, 'settings', PATIENT_FILES_COUNTER_DOC_ID);
    const settingsRef = collection(db, 'users', userId, 'settings');

    const counterSnap = await getDoc(counterRef);
    const counterData = counterSnap.data() as { seniorityIndexedVersion?: unknown; createdAt?: unknown; } | undefined;
    const seniorityIndexedVersion = toPositiveIntegerOrZero(counterData?.seniorityIndexedVersion);
    if (seniorityIndexedVersion >= PATIENT_FILES_SENIORITY_VERSION) return;

    const groupsByNameKey = new Map<string, PatientFileSeniorityGroup>();

    const ensureGroup = (nameKey: string): PatientFileSeniorityGroup => {
        const existing = groupsByNameKey.get(nameKey);
        if (existing) return existing;

        const created: PatientFileSeniorityGroup = {
            nameKey,
            patientName: nameKey,
            oldestVisitMs: Number.POSITIVE_INFINITY,
        };
        groupsByNameKey.set(nameKey, created);
        return created;
    };

    records.forEach((record) => {
        const normalizedNameKey = String(record.patientFileNameKey || '').trim() || buildPatientFileNameKey(record.patientName);
        if (!normalizedNameKey) return;

        const group = ensureGroup(normalizedNameKey);
        const patientNameText = normalizePatientNameForFile(record.patientName);
        const phoneText = String(record.phone || '').trim();
        const recordFileNumber = toPositiveInteger(record.patientFileNumber);
        const visitDateMs = toDateMsOrInfinity(record.date);
        const createdAtMs = toDateMsOrInfinity(record.createdAt);
        const visitMs = Number.isFinite(visitDateMs) ? visitDateMs : createdAtMs;

        if (patientNameText) group.patientName = patientNameText;
        if (!group.phone && phoneText) group.phone = phoneText;
        if (!group.existingNumber && recordFileNumber) group.existingNumber = recordFileNumber;
        if (visitMs < group.oldestVisitMs) group.oldestVisitMs = visitMs;
    });

    const settingsSnap = await getDocs(settingsRef);
    settingsSnap.docs.forEach((snap) => {
        if (!snap.id.startsWith(PATIENT_FILE_DOC_PREFIX)) return;

        const data = snap.data() as {
            patientFileNameKey?: unknown;
            patientName?: unknown;
            phone?: unknown;
            patientFileNumber?: unknown;
            firstVisitDate?: unknown;
            createdAt?: unknown;
            updatedAt?: unknown;
        };

        const nameKeyFromData = String(data.patientFileNameKey || '').trim();
        const decodedNameKey = decodeNameKeyFromPatientFileDocId(snap.id);
        const normalizedNameKey = nameKeyFromData || decodedNameKey;
        if (!normalizedNameKey) return;

        const group = ensureGroup(normalizedNameKey);
        const patientNameText = normalizePatientNameForFile(data.patientName as string);
        const phoneText = String(data.phone || '').trim();
        const existingNumber = toPositiveInteger(data.patientFileNumber);
        const firstVisitDateMs = toDateMsOrInfinity(data.firstVisitDate);
        const createdAtMs = toDateMsOrInfinity(data.createdAt);
        const updatedAtMs = toDateMsOrInfinity(data.updatedAt);
        const firstVisitMs = Number.isFinite(firstVisitDateMs)
            ? firstVisitDateMs
            : (Number.isFinite(createdAtMs) ? createdAtMs : updatedAtMs);

        if (patientNameText) group.patientName = patientNameText;
        if (!group.phone && phoneText) group.phone = phoneText;
        if (!group.existingNumber && existingNumber) group.existingNumber = existingNumber;
        if (firstVisitMs < group.oldestVisitMs) group.oldestVisitMs = firstVisitMs;
    });

    const sortedGroups = Array.from(groupsByNameKey.values()).sort((left, right) => {
        const leftSort = buildGroupSortKey(left);
        const rightSort = buildGroupSortKey(right);

        if (leftSort.hasKnownOldestDate !== rightSort.hasKnownOldestDate) {
            return leftSort.hasKnownOldestDate ? -1 : 1;
        }

        if (leftSort.oldestVisitMs !== rightSort.oldestVisitMs) {
            return leftSort.oldestVisitMs - rightSort.oldestVisitMs;
        }

        if (leftSort.existingNumber !== rightSort.existingNumber) {
            return leftSort.existingNumber - rightSort.existingNumber;
        }

        return leftSort.nameKey.localeCompare(rightSort.nameKey, 'ar');
    });

    const assignedNumbersByNameKey = new Map<string, number>();
    sortedGroups.forEach((group, index) => {
        assignedNumbersByNameKey.set(group.nameKey, index + 1);
    });

    let batch = writeBatch(db);
    let operationCount = 0;

    const commitBatchIfNeeded = async (force = false) => {
        if (operationCount === 0) return;
        if (!force && operationCount < MAX_BATCH_OPERATIONS) return;
        await batch.commit();
        batch = writeBatch(db);
        operationCount = 0;
    };

    for (const group of sortedGroups) {
        const assignedNumber = assignedNumbersByNameKey.get(group.nameKey);
        if (!assignedNumber) continue;

        const patientFileId = buildPatientFileDocIdFromNameKey(group.nameKey);
        const patientFileRef = doc(db, 'users', userId, 'settings', patientFileId);
        const payload: Record<string, unknown> = {
            patientName: group.patientName || group.nameKey,
            patientFileNameKey: group.nameKey,
            patientFileNumber: assignedNumber,
            updatedAt: serverTimestamp(),
        };

        if (group.phone) {
            payload.phone = group.phone;
        }

        if (Number.isFinite(group.oldestVisitMs)) {
            payload.firstVisitDate = new Date(group.oldestVisitMs).toISOString();
        }

        batch.set(patientFileRef, payload, { merge: true });
        operationCount += 1;
        await commitBatchIfNeeded();
    }

    await commitBatchIfNeeded(true);

    for (const record of records) {
        const normalizedNameKey = String(record.patientFileNameKey || '').trim() || buildPatientFileNameKey(record.patientName);
        if (!normalizedNameKey) continue;

        const assignedNumber = assignedNumbersByNameKey.get(normalizedNameKey);
        if (!assignedNumber) continue;

        const expectedPatientFileId = buildPatientFileDocIdFromNameKey(normalizedNameKey);
        const currentPatientFileId = String(record.patientFileId || '').trim();
        const currentPatientFileNameKey = String(record.patientFileNameKey || '').trim();
        const currentPatientFileNumber = toPositiveInteger(record.patientFileNumber);

        if (
            currentPatientFileId === expectedPatientFileId
            && currentPatientFileNameKey === normalizedNameKey
            && currentPatientFileNumber === assignedNumber
        ) {
            continue;
        }

        const recordRef = doc(db, 'users', userId, 'records', record.id);
        batch.update(recordRef, {
            patientFileId: expectedPatientFileId,
            patientFileNumber: assignedNumber,
            patientFileNameKey: normalizedNameKey,
            updatedAt: serverTimestamp(),
        });
        operationCount += 1;
        await commitBatchIfNeeded();
    }

    const assignedCount = sortedGroups.length;
    const counterPayload: Record<string, unknown> = {
        lastNumber: assignedCount,
        seniorityIndexedVersion: PATIENT_FILES_SENIORITY_VERSION,
        seniorityIndexedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdAt: counterSnap.exists() ? (counterData?.createdAt || serverTimestamp()) : serverTimestamp(),
    };
    batch.set(counterRef, counterPayload, { merge: true });
    operationCount += 1;

    await commitBatchIfNeeded(true);
};
