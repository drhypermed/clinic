/**
 * Hook إداره ملف حمل لمريضه (usePregnancyFile)
 *
 * بيحمّل ملف الحمل، بيوفّر دوال تعديل (LMP، الزيارات، الإغلاق)، وبيحفظ تلقائي
 * بـdebounce 800ms عشان الدكتوره ما تستناش زر حفظ مع كل تعديل.
 *
 * الحفظ التلقائي بيشتغل بس بعد التحميل الأولي (didLoadRef) عشان نتجنّب
 * إعاده الكتابه فوق الـserver state وقت أول render.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
    createEmptyPregnancyFile, loadPregnancyFile, savePregnancyFile,
    type PregnancyClosureType, type PregnancyFile, type PregnancyVisit,
} from '../../../services/specialty-packs/gynecology';

/** ولّد معرّف فريد لزياره جديده */
const newVisitId = (): string =>
    `pv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const AUTO_SAVE_DELAY = 800; // ms — توازن بين السرعه والـwrites القليله

interface UsePregnancyFileParams {
    userId?: string | null;
    patientFileNameKey?: string | null;
}

export const usePregnancyFile = ({ userId, patientFileNameKey }: UsePregnancyFileParams) => {
    const [file, setFile] = useState<PregnancyFile>(() =>
        createEmptyPregnancyFile(patientFileNameKey || ''),
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const didLoadRef = useRef(false);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingFileRef = useRef<PregnancyFile | null>(null);

    // ─ تحميل الملف من Firestore ─
    useEffect(() => {
        let mounted = true;
        didLoadRef.current = false;
        if (!userId || !patientFileNameKey) {
            setFile(createEmptyPregnancyFile(patientFileNameKey || ''));
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        loadPregnancyFile(userId, patientFileNameKey)
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
    const scheduleSave = useCallback((next: PregnancyFile) => {
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
                const saved = await savePregnancyFile(userId, toSave);
                setFile((prev) => ({ ...prev, estimatedDueDate: saved.estimatedDueDate, updatedAt: saved.updatedAt }));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'فشل الحفظ');
            } finally {
                setIsSaving(false);
            }
        }, AUTO_SAVE_DELAY);
    }, [userId]);

    // ─ flush() — يلغي الـdebounce ويحفظ فوراً ─
    // بيتنادى من زرار "حفظ الكشف" عشان نضمن الـauto-sync بعدها يقرا أحدث بيانات.
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
            await savePregnancyFile(userId, toSave);
        } catch {
            // muted — الـcaller هيعمل الحفظ الرئيسي بعدها
        }
    }, [userId]);

    /** Wrapper بيعدّل الـstate ويجدول الحفظ. لا يجدول قبل التحميل الأولي. */
    const updateFile = useCallback((updater: (prev: PregnancyFile) => PregnancyFile) => {
        setFile((prev) => {
            const next = updater(prev);
            if (didLoadRef.current) scheduleSave(next);
            return next;
        });
    }, [scheduleSave]);

    // ─ Public actions ─

    const setLMP = useCallback((lmp: string) => {
        updateFile((prev) => ({ ...prev, lastMenstrualPeriod: lmp || undefined }));
    }, [updateFile]);

    const setGeneralNotes = useCallback((notes: string) => {
        updateFile((prev) => ({ ...prev, generalNotes: notes || undefined }));
    }, [updateFile]);

    const addVisit = useCallback((visit: Omit<PregnancyVisit, 'id' | 'updatedAt'>) => {
        updateFile((prev) => ({
            ...prev,
            visits: [
                { ...visit, id: newVisitId(), updatedAt: new Date().toISOString() },
                ...prev.visits,
            ].sort((a, b) => (a.dateKey < b.dateKey ? 1 : a.dateKey > b.dateKey ? -1 : 0)),
        }));
    }, [updateFile]);

    const updateVisit = useCallback((id: string, patch: Partial<PregnancyVisit>) => {
        updateFile((prev) => ({
            ...prev,
            visits: prev.visits.map((v) =>
                v.id === id ? { ...v, ...patch, updatedAt: new Date().toISOString() } : v,
            ),
        }));
    }, [updateFile]);

    const deleteVisit = useCallback((id: string) => {
        updateFile((prev) => ({
            ...prev,
            visits: prev.visits.filter((v) => v.id !== id),
        }));
    }, [updateFile]);

    const closePregnancy = useCallback((type: PregnancyClosureType) => {
        updateFile((prev) => ({
            ...prev,
            closedAt: new Date().toISOString(),
            closureType: type,
        }));
    }, [updateFile]);

    const reopenPregnancy = useCallback(() => {
        updateFile((prev) => ({
            ...prev,
            closedAt: undefined,
            closureType: undefined,
        }));
    }, [updateFile]);

    return {
        file, loading, error, isSaving,
        setLMP, setGeneralNotes,
        addVisit, updateVisit, deleteVisit,
        closePregnancy, reopenPregnancy,
        flush,
    };
};
