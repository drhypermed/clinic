/**
 * حل مرجع ملف المريض قبل حفظ السجل (Patient File Resolution Logic)
 *
 * مستخرج من `useDrHyper.saveRecord.ts`. الغرض: بناء `patientFileReference`
 * (id + number + nameKey) الذي سيُرفق بالسجل عند حفظه. يستخدم منطقاً متسلسلاً:
 *
 *   1. إذا كانت البيانات النشطة كاملة (id + number)، استخدمها مباشرة.
 *   2. وإلا، إذا كان هناك number أو nameKey فقط، استدعِ
 *      `patientFilesService.syncPatientIdentityByFile` لحلها.
 *   3. وإلا، استدعِ `patientFilesService.ensurePatientFileReference` لإنشائها
 *      من اسم المريض والهاتف.
 */

import { buildPatientFileNameKey, patientFilesService } from '../../services/patient-files';
import type { ResolvedPatientFileReference } from './useDrHyper.saveRecord.types';

interface ResolvePatientFileReferenceInput {
    userId: string;
    patientName: string;
    phone?: string;
    ageYears: string;
    ageMonths: string;
    ageDays: string;
    activePatientFileId: string | null;
    activePatientFileNumber: number | null;
    activePatientFileNameKey: string | null;
}

export const resolvePatientFileReference = async (
    input: ResolvePatientFileReferenceInput
): Promise<ResolvedPatientFileReference | null> => {
    const { userId, patientName, phone } = input;
    let patientFileReference: ResolvedPatientFileReference | null = null;

    const normalizedActivePatientFileId = String(input.activePatientFileId || '').trim();
    const parsedActivePatientFileNumber = Number(input.activePatientFileNumber);
    const normalizedActivePatientFileNameKey = String(input.activePatientFileNameKey || '').trim();

    // 1. البيانات النشطة كاملة → استخدمها مباشرة
    if (
        normalizedActivePatientFileId
        && Number.isFinite(parsedActivePatientFileNumber)
        && parsedActivePatientFileNumber > 0
    ) {
        patientFileReference = {
            patientFileId: normalizedActivePatientFileId,
            patientFileNumber: Math.floor(parsedActivePatientFileNumber),
            patientFileNameKey: normalizedActivePatientFileNameKey || buildPatientFileNameKey(patientName),
        };
    }

    // 2. رقم أو nameKey فقط → حل عبر syncPatientIdentityByFile
    if (
        !patientFileReference
        && (
            (Number.isFinite(parsedActivePatientFileNumber) && parsedActivePatientFileNumber > 0)
            || normalizedActivePatientFileNameKey
        )
    ) {
        try {
            const resolvedByFile = await patientFilesService.syncPatientIdentityByFile({
                userId,
                patientName,
                phone: phone || undefined,
                age: {
                    years: input.ageYears,
                    months: input.ageMonths,
                    days: input.ageDays,
                },
                patientFileNumber: Number.isFinite(parsedActivePatientFileNumber) && parsedActivePatientFileNumber > 0
                    ? Math.floor(parsedActivePatientFileNumber)
                    : undefined,
                patientFileNameKey: normalizedActivePatientFileNameKey || undefined,
            });

            if (resolvedByFile) {
                patientFileReference = {
                    patientFileId: resolvedByFile.patientFileId,
                    patientFileNumber: resolvedByFile.patientFileNumber,
                    patientFileNameKey: resolvedByFile.patientFileNameKey,
                };
            }
        } catch (resolveByFileError) {
            console.error('Error resolving patient file by active number/key:', resolveByFileError);
        }
    }

    // 3. fallback نهائي: ensurePatientFileReference
    try {
        if (!patientFileReference) {
            patientFileReference = await patientFilesService.ensurePatientFileReference(
                userId,
                patientName,
                phone || undefined
            );
        }
    } catch (patientFileError) {
        // لا نمنع الحفظ إذا تعذر إصدار رقم الملف حالياً (مثلاً وضع عدم الاتصال).
        console.error('Error ensuring patient file reference:', patientFileError);
    }

    return patientFileReference;
};

interface SyncPatientIdentityAfterSaveInput {
    userId: string;
    patientName: string;
    phone?: string;
    ageYears: string;
    ageMonths: string;
    ageDays: string;
    patientFileReference: ResolvedPatientFileReference | null;
    normalizedActivePatientFileId: string;
    parsedActivePatientFileNumber: number;
    normalizedActivePatientFileNameKey: string;
    targetPatientFileNameKey: string;
}

/** مزامنة هوية المريض عبر كل السجلات/المواعيد بعد نجاح الحفظ */
export const syncPatientIdentityAfterSave = async (
    input: SyncPatientIdentityAfterSaveInput
): Promise<ResolvedPatientFileReference | null> => {
    const fallbackPatientFileNumber =
        Number.isFinite(input.parsedActivePatientFileNumber) && input.parsedActivePatientFileNumber > 0
            ? Math.floor(input.parsedActivePatientFileNumber)
            : undefined;

    try {
        const syncResult = await patientFilesService.syncPatientIdentityByFile({
            userId: input.userId,
            patientName: input.patientName,
            phone: input.phone || undefined,
            age: {
                years: input.ageYears,
                months: input.ageMonths,
                days: input.ageDays,
            },
            patientFileId:
                input.patientFileReference?.patientFileId || input.normalizedActivePatientFileId || undefined,
            patientFileNumber: input.patientFileReference?.patientFileNumber || fallbackPatientFileNumber,
            patientFileNameKey:
                input.targetPatientFileNameKey
                || input.patientFileReference?.patientFileNameKey
                || input.normalizedActivePatientFileNameKey
                || undefined,
        });

        return syncResult
            ? {
                patientFileId: syncResult.patientFileId,
                patientFileNumber: syncResult.patientFileNumber,
                patientFileNameKey: syncResult.patientFileNameKey,
            }
            : null;
    } catch (syncError) {
        console.error('Error syncing patient identity by file:', syncError);
        return null;
    }
};
