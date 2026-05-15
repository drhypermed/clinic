/**
 * Hook إداره ملف طفل (usePediatricFile)
 *
 * بيحمّل ملف الطفل، بيوفّر دوال تعديل لكل من:
 *   - بيانات الطفل (تاريخ الميلاد، الجنس)
 *   - سجلات التطعيمات (تحديث حاله كل تطعيم)
 *
 * قياسات النمو لا تتعدل من ملف الطفل؛ مصدرها مزامنه الفايتالز عند حفظ الكشف.
 *
 * الحفظ التلقائي بـdebounce 800ms — نفس نمط ملف الحمل.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
    buildPediatricFileStorageKey,
    createEmptyPediatricFile, loadPediatricFile, savePediatricFile,
    type ChildSex, type PediatricFile,
    type VaccinationRecord, type VaccinationStatus,
} from '../../../services/specialty-packs/pediatrics';

const AUTO_SAVE_DELAY = 800;

interface UsePediatricFileParams {
    userId?: string | null;
    patientFileId?: string | null;
    patientFileNumber?: number | null;
    patientFileNameKey?: string | null;
    legacyPatientFileNameKey?: string | null;
}

export const usePediatricFile = ({
    userId,
    patientFileId,
    patientFileNumber,
    patientFileNameKey,
    legacyPatientFileNameKey,
}: UsePediatricFileParams) => {
    const storageKey = buildPediatricFileStorageKey({
        patientFileId,
        patientFileNumber,
        patientFileNameKey,
    });
    const [file, setFile] = useState<PediatricFile>(() =>
        createEmptyPediatricFile(storageKey || ''),
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const didLoadRef = useRef(false);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingFileRef = useRef<PediatricFile | null>(null);

    // ─ تحميل الملف من Firestore ─
    useEffect(() => {
        let mounted = true;
        didLoadRef.current = false;
        if (!userId || !storageKey) {
            setFile(createEmptyPediatricFile(storageKey || ''));
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        loadPediatricFile(userId, storageKey, legacyPatientFileNameKey)
            .then((data) => {
                if (!mounted) return;
                setFile(data);
                didLoadRef.current = true;
            })
            .catch((err) => {
                if (!mounted) return;
                setError(err instanceof Error ? err.message : 'فشل التحميل');
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => {
            mounted = false;
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, [userId, storageKey, legacyPatientFileNameKey]);

    // ─ الحفظ التلقائي مع debounce ─
    const scheduleSave = useCallback((next: PediatricFile) => {
        if (!userId || !next.patientFileNameKey) return;
        pendingFileRef.current = next;
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(async () => {
            const toSave = pendingFileRef.current;
            if (!toSave) return;
            pendingFileRef.current = null;
            setIsSaving(true);
            setError(null);
            try {
                const saved = await savePediatricFile(userId, toSave);
                setFile((prev) => ({ ...prev, updatedAt: saved.updatedAt }));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'فشل الحفظ');
            } finally {
                setIsSaving(false);
            }
        }, AUTO_SAVE_DELAY);
    }, [userId]);

    // ─ flush() — يلغي الـdebounce ويحفظ فوراً ─
    // ده بيتنادى من زرار "حفظ الكشف" عشان مايبقاش فيه race بين الحفظ
    // التلقائي والـauto-sync اللي بيشوف بيانات قديمه من Firestore.
    const flush = useCallback(async (): Promise<void> => {
        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
            saveTimerRef.current = null;
        }
        const toSave = pendingFileRef.current;
        if (!toSave) return;
        pendingFileRef.current = null;
        if (!userId || !toSave.patientFileNameKey) return;
        try {
            await savePediatricFile(userId, toSave);
        } catch {
            // muted — الـcaller هيعمل الحفظ الرئيسي بعدها
        }
    }, [userId]);

    const updateFile = useCallback((updater: (prev: PediatricFile) => PediatricFile) => {
        setFile((prev) => {
            const next = updater(prev);
            if (didLoadRef.current) scheduleSave(next);
            return next;
        });
    }, [scheduleSave]);

    // ─ Public actions ─

    const setDateOfBirth = useCallback((dob: string) => {
        updateFile((prev) => ({ ...prev, dateOfBirth: dob || undefined }));
    }, [updateFile]);

    const setSex = useCallback((sex: ChildSex) => {
        updateFile((prev) => ({ ...prev, sex }));
    }, [updateFile]);

    const setGeneralNotes = useCallback((notes: string) => {
        updateFile((prev) => ({ ...prev, generalNotes: notes || undefined }));
    }, [updateFile]);

    const updateVaccination = useCallback(
        (scheduleId: string, patch: Partial<VaccinationRecord>) => {
            updateFile((prev) => {
                const existing = prev.vaccinations[scheduleId];
                const next: VaccinationRecord = {
                    scheduleId,
                    status: 'pending',
                    ...existing,
                    ...patch,
                    updatedAt: new Date().toISOString(),
                };
                return {
                    ...prev,
                    vaccinations: { ...prev.vaccinations, [scheduleId]: next },
                };
            });
        },
        [updateFile],
    );

    const setVaccinationStatus = useCallback(
        (scheduleId: string, status: VaccinationStatus, givenDate?: string) => {
            updateVaccination(scheduleId, {
                status,
                givenDate: status === 'given' ? givenDate || new Date().toISOString().split('T')[0] : undefined,
            });
        },
        [updateVaccination],
    );

    return {
        file, loading, error, isSaving,
        setDateOfBirth, setSex, setGeneralNotes,
        updateVaccination, setVaccinationStatus,
        flush,
    };
};
