/**
 * بنّاء سياق حزم التخصصات للذكاء الاصطناعي (Specialty Packs Context Builder)
 *
 * بيحوّل بيانات الباكدج (حمل/أطفال) لفقرات نصيه قصيره بالإنجليزيه عشان
 * تنحقن في prompt الـCase Analysis. الهدف: AI يعرف "آخر وزن جنين"
 * أو "تطعيمات متأخره" زي ما الدكتور شايف، بدون ما يدخل خام البيانات كلها.
 *
 * كل دوال البناء بترجع undefined لو:
 *   - الباكدج مش مفعّل
 *   - الملف مش موجود/فاضي
 *   - مفيش بيانات مفيده للـAI
 *
 * فايده الفصل: smartActions يطلب context بدون ما يعرف هيكل الباكدج الداخلي.
 */

import {
    calculateGestationalWeek, getTodayDateKey as gynToday,
    loadPregnancyFile,
} from './gynecology';
import {
    calculateAgeInMonths, calculateVaccinationTiming,
    EGYPTIAN_VACCINATION_SCHEDULE, getTodayDateKey as pedToday,
    buildPediatricFileStorageKey,
    loadPediatricFile,
} from './pediatrics';
import { getCachedSpecialtyPacks } from './service';

/**
 * بناء فقره سياق الحمل — تظهر بس لو الباكدج مفعّل والـLMP مسجل.
 * بترجع فقره مختصره فيها: الأسبوع الحالي + EDD + آخر زياره (وزن/نبض/حركه).
 */
export const buildPregnancyContext = async (
    userId: string,
    nameKey: string,
): Promise<string | undefined> => {
    if (!userId || !nameKey) return undefined;
    const packs = getCachedSpecialtyPacks();
    if (!packs?.packs.gynecology?.enabled) return undefined;

    try {
        const file = await loadPregnancyFile(userId, nameKey);
        if (!file.lastMenstrualPeriod) return undefined;

        const lines: string[] = [];
        const week = calculateGestationalWeek(file.lastMenstrualPeriod, gynToday());
        if (week !== null) lines.push(`Current gestational week (from LMP): ${week}`);
        if (file.estimatedDueDate) lines.push(`Estimated due date: ${file.estimatedDueDate}`);

        const latest = file.visits[0];
        if (latest) {
            const summary: string[] = [];
            if (latest.fetalWeight) summary.push(`fetal weight ~${latest.fetalWeight}g`);
            if (latest.fetalHeartRate) summary.push(`FHR ~${latest.fetalHeartRate}bpm`);
            if (latest.fetalMovement === 'decreased') summary.push('DECREASED fetal movement');
            else if (latest.fetalMovement === 'absent') summary.push('ABSENT fetal movement');
            else if (latest.fetalMovement === 'normal') summary.push('normal fetal movement');
            if (latest.maternalWeight) summary.push(`maternal weight ${latest.maternalWeight}kg`);
            if (latest.ultrasoundNotes) summary.push(`US notes: ${latest.ultrasoundNotes}`);
            if (summary.length) lines.push(`Last pregnancy visit (${latest.dateKey}): ${summary.join(', ')}`);
        }

        // اتجاه وزن الأم — آخر زيارتين فيهم وزن أم — مفيد لو الزياده سريعه (preeclampsia signal)
        const visitsWithMaternalWeight = file.visits.filter((v) => v.maternalWeight);
        if (visitsWithMaternalWeight.length >= 2) {
            const [curr, prev] = visitsWithMaternalWeight;
            const cw = parseFloat(curr.maternalWeight || '0');
            const pw = parseFloat(prev.maternalWeight || '0');
            if (Number.isFinite(cw) && Number.isFinite(pw) && pw > 0) {
                const delta = cw - pw;
                const sign = delta >= 0 ? '+' : '';
                lines.push(`Maternal weight trend: ${prev.maternalWeight}kg (${prev.dateKey}) → ${curr.maternalWeight}kg (${curr.dateKey}) [${sign}${delta.toFixed(1)}kg]`);
            }
        }

        if (file.closedAt) {
            lines.push(`Pregnancy file closed on ${file.closedAt} (${file.closureType || 'unspecified'})`);
        }

        if (lines.length === 0) return undefined;
        return lines.join('. ');
    } catch {
        return undefined;
    }
};

/**
 * بناء فقره سياق الطفل — تظهر بس لو الباكدج مفعّل وتاريخ الميلاد مسجل.
 * بترجع فقره فيها: العمر بالشهور + اتجاه آخر قياس وزن + التطعيمات المتأخره.
 */
export const buildPediatricContext = async (
    userId: string,
    nameKey: string,
    identity?: {
        patientFileId?: string | null;
        patientFileNumber?: number | null;
        patientFileNameKey?: string | null;
    },
): Promise<string | undefined> => {
    if (!userId || !nameKey) return undefined;
    const packs = getCachedSpecialtyPacks();
    if (!packs?.packs.pediatrics?.enabled) return undefined;

    try {
        const storageKey = buildPediatricFileStorageKey({
            patientFileId: identity?.patientFileId,
            patientFileNumber: identity?.patientFileNumber,
            patientFileNameKey: identity?.patientFileNameKey || nameKey,
        }) || nameKey;
        const file = await loadPediatricFile(userId, storageKey, nameKey);
        if (!file.dateOfBirth) return undefined;

        const lines: string[] = [];
        const ageMonths = calculateAgeInMonths(file.dateOfBirth, pedToday());
        if (ageMonths !== null) {
            lines.push(`Pediatric: DOB ${file.dateOfBirth}, age ${ageMonths} months`);
        }
        if (file.sex) {
            lines.push(`Sex: ${file.sex}`);
        }

        // اتجاه الوزن — آخر قياسين
        if (file.growthEntries.length >= 2) {
            const [curr, prev] = file.growthEntries;
            if (curr.weightKg && prev.weightKg) {
                const cw = parseFloat(curr.weightKg);
                const pw = parseFloat(prev.weightKg);
                if (Number.isFinite(cw) && Number.isFinite(pw)) {
                    const delta = cw - pw;
                    const sign = delta >= 0 ? '+' : '';
                    lines.push(`Weight trend: ${prev.weightKg}kg (${prev.dateKey}) → ${curr.weightKg}kg (${curr.dateKey}) [${sign}${delta.toFixed(2)}kg]`);
                }
            }
            if (curr.heightCm && prev.heightCm) {
                const ch = parseFloat(curr.heightCm);
                const ph = parseFloat(prev.heightCm);
                if (Number.isFinite(ch) && Number.isFinite(ph)) {
                    const delta = ch - ph;
                    const sign = delta >= 0 ? '+' : '';
                    lines.push(`Height trend: ${prev.heightCm}cm → ${curr.heightCm}cm [${sign}${delta.toFixed(1)}cm]`);
                }
            }
        } else if (file.growthEntries.length === 1) {
            const c = file.growthEntries[0];
            const parts: string[] = [];
            if (c.weightKg) parts.push(`weight ${c.weightKg}kg`);
            if (c.heightCm) parts.push(`height ${c.heightCm}cm`);
            if (c.headCircCm) parts.push(`HC ${c.headCircCm}cm`);
            if (parts.length) lines.push(`Latest measurement (${c.dateKey}): ${parts.join(', ')}`);
        }

        // التطعيمات المتأخره (overdue فقط — مش الجايه)
        if (ageMonths !== null) {
            const overdue = EGYPTIAN_VACCINATION_SCHEDULE.filter((v) => {
                const rec = file.vaccinations[v.id];
                if (rec?.status === 'given' || rec?.status === 'skipped') return false;
                return calculateVaccinationTiming(v.ageMonths, ageMonths) === 'overdue';
            });
            if (overdue.length > 0) {
                const names = overdue.slice(0, 6).map((v) => v.shortName).join(', ');
                const extra = overdue.length > 6 ? ` (+${overdue.length - 6} more)` : '';
                lines.push(`Overdue vaccinations (Egyptian schedule): ${names}${extra}`);
            }
        }

        if (lines.length === 0) return undefined;
        return lines.join('. ');
    } catch {
        return undefined;
    }
};
