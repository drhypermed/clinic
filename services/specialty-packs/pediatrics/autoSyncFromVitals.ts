/**
 * المزامنه التلقائيه: فايتالز الكشف → قياس نمو الطفل
 *
 * بعد ما الدكتور يحفظ كشف لطفل، الدالّه دي بتشوف:
 *   1. هل باكدج الأطفال مفعّل من الأدمن؟
 *   2. هل تخصص الدكتور "طب الأطفال وحديثي الولادة"؟
 *   3. هل في وزن أو طول في الفايتالز؟
 *
 * لو كل ده آه → بتضيف قياس نمو في ملف الطفل بتاريخ الزياره.
 * لو فيه قياس بنفس التاريخ → بتحدّثه (مفيش تكرار).
 *
 * الفلسفه: السكرتارية بتسجل الوزن مره واحده في الفايتالز، والنظام يوزّعه
 * تلقائياً على سجل النمو الطولي. الدكتور يبص يلاقي اتجاه القياسات جاهز
 * بدون عمل إضافي.
 *
 * فشل المزامنه ما بيوقفش حفظ الكشف — بنرجع true/false بس للـlogging.
 */

import { getCachedSpecialtyPacks, PACK_SPECIALTIES } from '../index';
import { invalidatePackBadgeCache } from '../badgeCache';
import { buildPediatricFileStorageKey, loadPediatricFile, savePediatricFile } from './service';
import type { GrowthEntry } from './types';

/** ولّد معرّف فريد لقياس جديد */
const newId = (): string =>
    `gr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

/** صياغه التاريخ YYYY-MM-DD من ISO أو تاريخ */
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

/** تنظيف الأرقام (مفيش صفر، مفيش negative) */
const cleanNumeric = (value: unknown): string | undefined => {
    const s = String(value || '').trim();
    if (!s) return undefined;
    const n = parseFloat(s);
    if (!Number.isFinite(n) || n <= 0) return undefined;
    // نخزن النص زي ما الطبيب كتبه (مش بنحوّل لـnumber)
    return s;
};

interface SyncVitalsToGrowthArgs {
    userId: string;
    patientFileId?: string | null;
    patientFileNumber?: number | null;
    patientFileNameKey?: string | null;
    doctorSpecialty: string;
    visitDateKey: string;
    dateOfBirth?: string;
    weightKg?: string;
    heightCm?: string;
    /** 🆕 محيط الرأس من الفايتالز — بيتنقل لجدول النمو تلقائياً */
    headCircCm?: string;
}

/**
 * المزامنه الفعليه. بترجع 'created' / 'updated' / 'skipped' للـlogging.
 * بترفع exception فقط لو فشل قراءه/كتابه Firestore — الـcaller يعالج.
 */
export const syncVitalsToGrowthIfPediatric = async ({
    userId, patientFileId, patientFileNumber, patientFileNameKey, doctorSpecialty, visitDateKey, dateOfBirth, weightKg, heightCm, headCircCm,
}: SyncVitalsToGrowthArgs): Promise<'created' | 'updated' | 'skipped'> => {
    const storageKey = buildPediatricFileStorageKey({ patientFileId, patientFileNumber, patientFileNameKey });
    if (!userId || !storageKey) return 'skipped';

    // 1) الباكدج لازم يكون مفعّل من الأدمن
    const packs = getCachedSpecialtyPacks();
    if (!packs?.packs.pediatrics?.enabled) return 'skipped';

    // 2) التخصص لازم يطابق
    const specialty = String(doctorSpecialty || '').trim();
    if (!PACK_SPECIALTIES.pediatrics.includes(specialty)) return 'skipped';

    // 3) لازم في قياس واحد على الأقل (وزن أو طول أو محيط رأس)
    const cleanWeight = cleanNumeric(weightKg);
    const cleanHeight = cleanNumeric(heightCm);
    const cleanHeadCirc = cleanNumeric(headCircCm);
    const cleanDateOfBirth = toDateKey(dateOfBirth);
    const hasMeasurement = Boolean(cleanWeight || cleanHeight || cleanHeadCirc);
    if (!hasMeasurement && !cleanDateOfBirth) return 'skipped';

    // 4) التاريخ
    const dateKey = toDateKey(visitDateKey);
    if (!dateKey) return 'skipped';

    // 5) قراءه الملف
    const file = await loadPediatricFile(userId, storageKey, patientFileNameKey);
    if (!hasMeasurement) {
        if (cleanDateOfBirth && cleanDateOfBirth !== file.dateOfBirth) {
            await savePediatricFile(userId, { ...file, dateOfBirth: cleanDateOfBirth });
            invalidatePackBadgeCache(userId, storageKey, 'pediatric');
            return 'updated';
        }
        return 'skipped';
    }

    // 6) ندوّر على قياس بنفس التاريخ
    const existingIdx = file.growthEntries.findIndex((g) => g.dateKey === dateKey);
    const now = new Date().toISOString();

    let updatedEntries: GrowthEntry[];
    let action: 'created' | 'updated';

    if (existingIdx >= 0) {
        // تحديث — كل القياسات الجديده تغلب لو موجوده، القديم يفضل لو الجديد فاضي
        const existing = file.growthEntries[existingIdx];
        const merged: GrowthEntry = {
            ...existing,
            weightKg: cleanWeight || existing.weightKg,
            heightCm: cleanHeight || existing.heightCm,
            headCircCm: cleanHeadCirc || existing.headCircCm,
            updatedAt: now,
        };
        updatedEntries = file.growthEntries.map((e, i) => (i === existingIdx ? merged : e));
        action = 'updated';
    } else {
        // إضافه قياس جديد
        const created: GrowthEntry = {
            id: newId(),
            dateKey,
            weightKg: cleanWeight,
            heightCm: cleanHeight,
            headCircCm: cleanHeadCirc,
            updatedAt: now,
        };
        updatedEntries = [created, ...file.growthEntries].sort((a, b) =>
            a.dateKey < b.dateKey ? 1 : a.dateKey > b.dateKey ? -1 : 0,
        );
        action = 'created';
    }

    // 7) حفظ الملف
    await savePediatricFile(userId, {
        ...file,
        dateOfBirth: cleanDateOfBirth || file.dateOfBirth,
        growthEntries: updatedEntries,
    });

    // 8) إبطال كاش الشاره عشان صفحه السجلات تعرض الأحدث
    invalidatePackBadgeCache(userId, storageKey, 'pediatric');

    return action;
};
