import type {
    PregnancyTrackingSnapshot,
    PregnancyVisitSnapshot,
} from '../../../types';
import {
    calculateGestationalDay,
    calculateGestationalWeek,
    formatGestationalAge,
    getTodayDateKey,
} from './calculations';
import { loadPregnancyFile } from './service';
import type { PregnancyVisit } from './types';

const toDateKey = (value: unknown): string => {
    const s = String(value || '').trim();
    if (!s) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const ts = Date.parse(s);
    if (!Number.isFinite(ts)) return '';
    const d = new Date(ts);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const cleanText = (value: unknown): string | undefined => {
    const s = String(value || '').trim();
    return s || undefined;
};

const toVisitSnapshot = (
    visit: PregnancyVisit,
    maternalWeightFallback?: string,
): PregnancyVisitSnapshot => ({
    dateKey: visit.dateKey,
    gestationalWeek: visit.gestationalWeek,
    fetalWeight: cleanText(visit.fetalWeight),
    fetalHeartRate: cleanText(visit.fetalHeartRate),
    fetalMovement: visit.fetalMovement || undefined,
    maternalWeight: cleanText(visit.maternalWeight) || cleanText(maternalWeightFallback),
    ultrasoundNotes: cleanText(visit.ultrasoundNotes),
    notes: cleanText(visit.notes),
});

interface BuildPregnancyRecordSnapshotArgs {
    userId: string;
    patientFileNameKey: string;
    visitDateKey?: string | null;
    maternalWeightKg?: string;
}

export const buildPregnancyRecordSnapshot = async ({
    userId,
    patientFileNameKey,
    visitDateKey,
    maternalWeightKg,
}: BuildPregnancyRecordSnapshotArgs): Promise<PregnancyTrackingSnapshot | undefined> => {
    if (!userId || !patientFileNameKey) return undefined;

    const file = await loadPregnancyFile(userId, patientFileNameKey);
    const hasTrackingData = Boolean(
        file.lastMenstrualPeriod
        || file.visits.length > 0
        || file.closedAt
    );
    if (!hasTrackingData) return undefined;

    const dateKey = toDateKey(visitDateKey) || getTodayDateKey();
    const active = Boolean(file.lastMenstrualPeriod && !file.closedAt);
    const week = active
        ? calculateGestationalWeek(file.lastMenstrualPeriod, dateKey) ?? undefined
        : undefined;
    const day = active
        ? calculateGestationalDay(file.lastMenstrualPeriod, dateKey) ?? undefined
        : undefined;
    const text = active ? formatGestationalAge(file.lastMenstrualPeriod, dateKey) : undefined;

    const currentVisitRaw = file.visits.find((visit) => visit.dateKey === dateKey);
    const currentVisit = currentVisitRaw
        ? toVisitSnapshot(currentVisitRaw, maternalWeightKg)
        : (active && cleanText(maternalWeightKg)
            ? {
                dateKey,
                gestationalWeek: week,
                maternalWeight: cleanText(maternalWeightKg),
            }
            : undefined);

    return {
        active,
        visitDateKey: dateKey,
        lastMenstrualPeriod: cleanText(file.lastMenstrualPeriod),
        estimatedDueDate: cleanText(file.estimatedDueDate),
        gestationalAgeWeeks: week,
        gestationalAgeDays: day,
        gestationalAgeText: cleanText(text),
        currentVisit,
        latestVisit: file.visits[0] ? toVisitSnapshot(file.visits[0]) : undefined,
        closedAt: cleanText(file.closedAt),
        closureType: file.closureType,
    };
};
