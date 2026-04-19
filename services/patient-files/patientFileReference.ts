/**
 * ضمان وجود مرجع ملف مريض (Patient File Reference Ensurer)
 *
 * `ensurePatientFileReference` هي نقطة الدخول الأساسية عند إنشاء أو فتح
 * سجل مريض: تضمن وجود مستند `patientFile__{encodedNameKey}` تحت
 * `users/{uid}/settings/` وتُعيد مرجعه الكامل (id + number + nameKey).
 *
 * السلوك:
 *   1. إذا كان المستند موجوداً، تُسترجع بياناته الحالية مع تصحيح الحقول
 *      الناقصة (الاسم، الهاتف، الرقم) إن وجدت.
 *   2. إذا لم يكن موجوداً، يُنشأ برقم جديد = آخر رقم + 1 (من العدّاد
 *      المركزي `patientFilesMeta`).
 *
 * كل هذا يتم داخل Firestore `runTransaction` لضمان عدم إعطاء نفس الرقم
 * لاثنين من المرضى عند الحفظ المتزامن.
 */

import {
    doc,
    runTransaction,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { PATIENT_FILES_COUNTER_DOC_ID } from './constants';
import {
    buildPatientFileDocIdFromNameKey,
    buildPatientFileNameKey,
    normalizePatientNameForFile,
    toPositiveIntegerOrZero,
} from './normalizers';
import type { PatientFileReference } from './types';

/** ضمان وجود ملف مريض (أو إنشائه) وإرجاع مرجعه الكامل */
export const ensurePatientFileReference = async (
    userId: string,
    patientName: string,
    phone?: string
): Promise<PatientFileReference | null> => {
    const patientFileNameKey = buildPatientFileNameKey(patientName);
    if (!userId || !patientFileNameKey) return null;

    const patientNameText = normalizePatientNameForFile(patientName);
    const phoneText = String(phone || '').trim();
    const patientFileId = buildPatientFileDocIdFromNameKey(patientFileNameKey);

    const patientFileRef = doc(db, 'users', userId, 'settings', patientFileId);
    const counterRef = doc(db, 'users', userId, 'settings', PATIENT_FILES_COUNTER_DOC_ID);

    return runTransaction(db, async (transaction) => {
        const patientFileSnap = await transaction.get(patientFileRef);
        const counterSnap = await transaction.get(counterRef);
        const counterData = counterSnap.data() as { lastNumber?: unknown; createdAt?: unknown; } | undefined;
        const lastNumber = toPositiveIntegerOrZero(counterData?.lastNumber);

        if (patientFileSnap.exists()) {
            const existing = patientFileSnap.data() as {
                patientFileNumber?: unknown;
                phone?: unknown;
                patientName?: unknown;
                patientFileNameKey?: unknown;
            };

            let patientFileNumber = toPositiveIntegerOrZero(existing.patientFileNumber);
            const patch: Record<string, unknown> = {};

            if (!String(existing.patientName || '').trim() && patientNameText) {
                patch.patientName = patientNameText;
            }
            if (!String(existing.patientFileNameKey || '').trim()) {
                patch.patientFileNameKey = patientFileNameKey;
            }
            if (!String(existing.phone || '').trim() && phoneText) {
                patch.phone = phoneText;
            }

            if (patientFileNumber > lastNumber) {
                transaction.set(counterRef, {
                    lastNumber: patientFileNumber,
                    updatedAt: serverTimestamp(),
                    createdAt: counterSnap.exists() ? (counterData?.createdAt || serverTimestamp()) : serverTimestamp(),
                }, { merge: true });
            }

            if (patientFileNumber <= 0) {
                patientFileNumber = lastNumber + 1;

                transaction.set(counterRef, {
                    lastNumber: patientFileNumber,
                    updatedAt: serverTimestamp(),
                    createdAt: counterSnap.exists() ? (counterData?.createdAt || serverTimestamp()) : serverTimestamp(),
                }, { merge: true });

                patch.patientFileNumber = patientFileNumber;
            }

            if (Object.keys(patch).length > 0) {
                patch.updatedAt = serverTimestamp();
                transaction.set(patientFileRef, patch, { merge: true });
            }

            return {
                patientFileId,
                patientFileNumber,
                patientFileNameKey,
            };
        }

        const patientFileNumber = lastNumber + 1;

        transaction.set(counterRef, {
            lastNumber: patientFileNumber,
            updatedAt: serverTimestamp(),
            createdAt: counterSnap.exists() ? (counterData?.createdAt || serverTimestamp()) : serverTimestamp(),
        }, { merge: true });

        transaction.set(patientFileRef, {
            patientName: patientNameText,
            patientFileNameKey,
            patientFileNumber,
            ...(phoneText ? { phone: phoneText } : {}),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }, { merge: true });

        return {
            patientFileId,
            patientFileNumber,
            patientFileNameKey,
        };
    });
};
