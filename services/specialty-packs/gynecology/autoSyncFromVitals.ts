/**
 * المزامنه التلقائيه: فايتالز الكشف → وزن الأم في زياره الحمل
 *
 * بعد ما الدكتورة تحفظ كشف لمريضه حامل، الدالّه دي بتشوف:
 *   1. هل باكدج النسا مفعّل من الأدمن؟
 *   2. هل تخصص الدكتورة "أمراض النساء والتوليد"؟
 *   3. هل المريضه حامل (LMP مسجل + الملف مفتوح)؟
 *   4. هل في وزن في الفايتالز؟
 *
 * لو كل ده آه → بتضيف زياره حمل بنفس التاريخ (لو مش موجوده) أو
 * بتحدّث وزن الأم في الزياره الموجوده. وزن الجنين والنبض والسونار
 * بيظلوا يدويين لأنهم مش متوفرين في الفايتالز.
 *
 * ده بيوفر للدكتورة الكتابه المكرره ويبني سلسله وزن الأم تلقائياً.
 */

import { getCachedSpecialtyPacks, PACK_SPECIALTIES } from '../index';
import { invalidatePackBadgeCache } from '../badgeCache';
import { calculateGestationalWeek } from './calculations';
import { loadPregnancyFile, savePregnancyFile } from './service';
import type { PregnancyVisit } from './types';

const newId = (): string =>
    `pv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

/** صياغه التاريخ YYYY-MM-DD من قيمه أيا كانت */
const toDateKey = (value: unknown): string => {
    const s = String(value || '').trim();
    if (!s) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const ts = Date.parse(s);
    if (!Number.isFinite(ts)) return '';
    const d = new Date(ts);
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${y}-${mo}-${da}`;
};

/** تنظيف الرقم — مفيش 0 أو سالب */
const cleanNumeric = (value: unknown): string | undefined => {
    const s = String(value || '').trim();
    if (!s) return undefined;
    const n = parseFloat(s);
    if (!Number.isFinite(n) || n <= 0) return undefined;
    return s;
};

interface SyncVitalsToPregnancyArgs {
    userId: string;
    patientFileNameKey: string;
    doctorSpecialty: string;
    visitDateKey: string;
    /** وزن الأم من الفايتالز */
    weightKg?: string;
}

/**
 * المزامنه الفعليه. بترجع 'created' / 'updated' / 'skipped'.
 * بترفع exception فقط لو فشل Firestore — الـcaller يعالج.
 */
export const syncVitalsToPregnancyIfGyn = async ({
    userId, patientFileNameKey, doctorSpecialty, visitDateKey, weightKg,
}: SyncVitalsToPregnancyArgs): Promise<'created' | 'updated' | 'skipped'> => {
    if (!userId || !patientFileNameKey) return 'skipped';

    // 1) الباكدج مفعّل
    const packs = getCachedSpecialtyPacks();
    if (!packs?.packs.gynecology?.enabled) return 'skipped';

    // 2) التخصص مطابق
    const specialty = String(doctorSpecialty || '').trim();
    if (!PACK_SPECIALTIES.gynecology.includes(specialty)) return 'skipped';

    // 3) وزن متوفر
    const cleanWeight = cleanNumeric(weightKg);
    if (!cleanWeight) return 'skipped';

    // 4) التاريخ
    const dateKey = toDateKey(visitDateKey);
    if (!dateKey) return 'skipped';

    // 5) قراءه الملف
    const file = await loadPregnancyFile(userId, patientFileNameKey);

    // الـbusiness rule: لازم يكون فيه LMP + الملف مفتوح
    // لو الملف مغلق (ولاده/إجهاض) → ما نضيفش زيارات جديده
    if (!file.lastMenstrualPeriod) return 'skipped';
    if (file.closedAt) return 'skipped';

    // 6) ندوّر على زياره بنفس التاريخ
    const existingIdx = file.visits.findIndex((v) => v.dateKey === dateKey);
    const now = new Date().toISOString();
    const week = calculateGestationalWeek(file.lastMenstrualPeriod, dateKey);

    let updatedVisits: PregnancyVisit[];
    let action: 'created' | 'updated';

    if (existingIdx >= 0) {
        // تحديث وزن الأم — بنحافظ على وزن الجنين والنبض والسونار
        const existing = file.visits[existingIdx];
        const merged: PregnancyVisit = {
            ...existing,
            gestationalWeek: existing.gestationalWeek || week || undefined,
            maternalWeight: cleanWeight,
            updatedAt: now,
        };
        updatedVisits = file.visits.map((v, i) => (i === existingIdx ? merged : v));
        action = 'updated';
    } else {
        // زياره جديده — وزن الأم + الأسبوع المحسوب من LMP فقط
        // وزن الجنين والنبض والسونار يبقوا فاضيين عشان الدكتورة تملاهم
        const created: PregnancyVisit = {
            id: newId(),
            dateKey,
            gestationalWeek: week ?? undefined,
            maternalWeight: cleanWeight,
            updatedAt: now,
        };
        updatedVisits = [created, ...file.visits].sort((a, b) =>
            a.dateKey < b.dateKey ? 1 : a.dateKey > b.dateKey ? -1 : 0,
        );
        action = 'created';
    }

    // 7) حفظ الملف
    await savePregnancyFile(userId, { ...file, visits: updatedVisits });

    // 8) إبطال كاش الشاره عشان صفحه السجلات تعرض الأحدث
    invalidatePackBadgeCache(userId, patientFileNameKey, 'pregnancy');

    return action;
};
