/**
 * Hook إداره ملف طفل (usePediatricFile)
 *
 * بيحمّل ملف الطفل، بيوفّر دوال تعديل لكل من:
 *   - بيانات الطفل (تاريخ الميلاد، الجنس)
 *   - قياسات النمو (إضافه/تعديل/حذف)
 *   - سجلات التطعيمات (تحديث حاله كل تطعيم)
 *
 * الحفظ التلقائي بـdebounce 800ms — نفس نمط ملف الحمل.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
    createEmptyPediatricFile, loadPediatricFile, savePediatricFile,
    type ChildSex, type GrowthEntry, type PediatricFile,
    type VaccinationRecord, type VaccinationStatus,
} from '../../../services/specialty-packs/pediatrics';

const newGrowthId = (): string =>
    `gr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const AUTO_SAVE_DELAY = 800;

interface UsePediatricFileParams {
    userId?: string | null;
    patientFileNameKey?: string | null;
}

export const usePediatricFile = ({ userId, patientFileNameKey }: UsePediatricFileParams) => {
    const [file, setFile] = useState<PediatricFile>(() =>
        createEmptyPediatricFile(patientFileNameKey || ''),
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
        if (!userId || !patientFileNameKey) {
            setFile(createEmptyPediatricFile(patientFileNameKey || ''));
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        loadPediatricFile(userId, patientFileNameKey)
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
    }, [userId, patientFileNameKey]);

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

    const addGrowthEntry = useCallback((entry: Omit<GrowthEntry, 'id' | 'updatedAt'>) => {
        updateFile((prev) => ({
            ...prev,
            growthEntries: [
                { ...entry, id: newGrowthId(), updatedAt: new Date().toISOString() },
                ...prev.growthEntries,
            ].sort((a, b) => (a.dateKey < b.dateKey ? 1 : a.dateKey > b.dateKey ? -1 : 0)),
        }));
    }, [updateFile]);

    const updateGrowthEntry = useCallback((id: string, patch: Partial<GrowthEntry>) => {
        updateFile((prev) => ({
            ...prev,
            growthEntries: prev.growthEntries.map((e) =>
                e.id === id ? { ...e, ...patch, updatedAt: new Date().toISOString() } : e,
            ),
        }));
    }, [updateFile]);

    const deleteGrowthEntry = useCallback((id: string) => {
        updateFile((prev) => ({
            ...prev,
            growthEntries: prev.growthEntries.filter((e) => e.id !== id),
        }));
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
        addGrowthEntry, updateGrowthEntry, deleteGrowthEntry,
        updateVaccination, setVaccinationStatus,
        flush,
    };
};
