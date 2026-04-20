/**
 * حفظ المعلومات الإضافية عن المريض (Patient Additional Info)
 *
 * يحفظ نصاً حراً (مثل: الحساسية، أمراض مزمنة، ملاحظات خاصة) داخل مستند
 * ملف المريض في `users/{uid}/settings/patientFile__*` تحت المفتاح
 * `additionalInfo`. العملية Best-effort: تضمن وجود مرجع ملف المريض أولاً
 * ثم تُكتب القيمة مع `merge: true` حتى لا تمس باقي الحقول.
 */

import { deleteField, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { ensurePatientFileReference } from './patientFileReference';
import {
    buildPatientFileDocIdFromNameKey,
    toPositiveInteger,
    toTrimmedText,
} from './normalizers';

export interface SavePatientAdditionalInfoInput {
    userId: string;
    patientName: string;
    phone?: string;
    additionalInfo: string;
    patientFileId?: string;
    patientFileNumber?: number;
    patientFileNameKey?: string;
}

export interface SavePatientAdditionalInfoResult {
    patientFileId: string;
    patientFileNumber: number;
    patientFileNameKey: string;
    additionalInfo: string;
}

export const savePatientAdditionalInfo = async (
    input: SavePatientAdditionalInfoInput
): Promise<SavePatientAdditionalInfoResult | null> => {
    const userId = toTrimmedText(input.userId);
    const patientName = toTrimmedText(input.patientName);
    if (!userId || !patientName) return null;

    const additionalInfoText = String(input.additionalInfo ?? '').trim();

    let resolvedFileId = toTrimmedText(input.patientFileId);
    let resolvedFileNumber = toPositiveInteger(input.patientFileNumber);
    let resolvedNameKey = toTrimmedText(input.patientFileNameKey);

    if (!resolvedFileId && resolvedNameKey) {
        resolvedFileId = buildPatientFileDocIdFromNameKey(resolvedNameKey);
    }

    if (!resolvedFileId || !resolvedFileNumber || !resolvedNameKey) {
        const ensured = await ensurePatientFileReference(
            userId,
            patientName,
            toTrimmedText(input.phone) || undefined
        );
        if (!ensured) return null;
        resolvedFileId = ensured.patientFileId;
        resolvedFileNumber = ensured.patientFileNumber;
        resolvedNameKey = ensured.patientFileNameKey;
    }

    await writeBatch(db)
        .set(
            doc(db, 'users', userId, 'settings', resolvedFileId),
            {
                additionalInfo: additionalInfoText || deleteField(),
                additionalInfoUpdatedAt: additionalInfoText ? serverTimestamp() : deleteField(),
                patientFileNumber: resolvedFileNumber,
                patientFileNameKey: resolvedNameKey,
                updatedAt: serverTimestamp(),
            },
            { merge: true }
        )
        .commit();

    return {
        patientFileId: resolvedFileId,
        patientFileNumber: resolvedFileNumber,
        patientFileNameKey: resolvedNameKey,
        additionalInfo: additionalInfoText,
    };
};
