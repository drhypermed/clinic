/**
 * Hook شاره حزم التخصصات لمريض معيّن (usePackBadgeForPatient)
 *
 * بترجع معلومه مدمجه عن الباكدج لو المريض ده عنده ملف حمل/أطفال:
 *   - { kind: 'pregnancy', label: '🤰 الأسبوع 16' }
 *   - { kind: 'pediatric',  label: '👶 6 شهور' }
 *   - null لو الطبيب مش من تخصص الباكدج أو المريض مفيش له ملف
 *
 * بنستخدم module-level cache (في services/specialty-packs/badgeCache)
 * عشان لو القايمه فيها ٥٠ مريض، نعمل ٥٠ fetch مره واحده على الكتير،
 * والـrenders اللي بعدها كلها من الكاش. + الكاش بيتبطل تلقائياً بعد
 * أي auto-sync (وزن→نمو) عشان البيانات على الشاشه تكون أحدث.
 */

import { useEffect, useState } from 'react';
import { normalizePatientNameForFile } from '../services/patient-files';
import {
    PACK_SPECIALTIES,
} from '../services/specialty-packs';
import {
    buildCacheKey,
    clearPendingBadgeFetch,
    getBadgeFromCache,
    getPendingBadgeFetch,
    setBadgeCache,
    setPendingBadgeFetch,
    type PackBadge,
    type PackBadgeKind,
} from '../services/specialty-packs/badgeCache';
import {
    calculateGestationalWeek, getTodayDateKey as gynToday,
    loadPregnancyFile, type PregnancyFile,
} from '../services/specialty-packs/gynecology';
import {
    formatChildAge, loadPediatricFile,
    type PediatricFile,
} from '../services/specialty-packs/pediatrics';

export type { PackBadge, PackBadgeKind } from '../services/specialty-packs/badgeCache';
export { invalidatePackBadgeCache } from '../services/specialty-packs/badgeCache';

const buildPregnancyBadge = (file: PregnancyFile): PackBadge | null => {
    if (!file.lastMenstrualPeriod) return null;
    if (file.closedAt) return null;
    const week = calculateGestationalWeek(file.lastMenstrualPeriod, gynToday());
    if (week === null) return null;
    return { kind: 'pregnancy', label: `🤰 الأسبوع ${week}`, tone: 'pink' };
};

const buildPediatricBadge = (file: PediatricFile): PackBadge | null => {
    if (!file.dateOfBirth) return null;
    const age = formatChildAge(file.dateOfBirth);
    if (!age) return null;
    return { kind: 'pediatric', label: `👶 ${age}`, tone: 'sky' };
};

/** الجلب الفعلي مع caching — مره واحده لكل (مريض، باكدج) في الجلسه */
const fetchBadge = async (
    userId: string,
    nameKey: string,
    kind: PackBadgeKind,
): Promise<{ badge: PackBadge | null }> => {
    const cached = getBadgeFromCache(userId, nameKey, kind);
    if (cached) return cached;
    const pending = getPendingBadgeFetch(userId, nameKey, kind);
    if (pending) return pending;

    const promise = (async (): Promise<{ badge: PackBadge | null }> => {
        try {
            let badge: PackBadge | null = null;
            if (kind === 'pregnancy') {
                const file = await loadPregnancyFile(userId, nameKey);
                badge = buildPregnancyBadge(file);
            } else {
                const file = await loadPediatricFile(userId, nameKey);
                badge = buildPediatricBadge(file);
            }
            const value = { badge };
            setBadgeCache(userId, nameKey, kind, value);
            return value;
        } catch {
            const value = { badge: null };
            setBadgeCache(userId, nameKey, kind, value);
            return value;
        } finally {
            clearPendingBadgeFetch(userId, nameKey, kind);
        }
    })();
    setPendingBadgeFetch(userId, nameKey, kind, promise);
    return promise;
};

/**
 * Hook بسيط: ياخد اسم المريض + تخصص الطبيب، يرجع الشاره لو موجوده.
 * بيتأكد إن الطبيب من تخصص الباكدج قبل ما يجلب — مفيش fetches غير ضروريه.
 */
export const usePackBadgeForPatient = (
    userId: string | undefined | null,
    patientName: string | undefined | null,
    doctorSpecialty: string | undefined | null,
): PackBadge | null => {
    const [badge, setBadge] = useState<PackBadge | null>(null);

    useEffect(() => {
        const uid = String(userId || '').trim();
        const specialty = String(doctorSpecialty || '').trim();
        const nameKey = normalizePatientNameForFile(patientName || '');
        if (!uid || !specialty || !nameKey) {
            setBadge(null);
            return;
        }

        let kind: PackBadgeKind | null = null;
        if (PACK_SPECIALTIES.gynecology.includes(specialty)) kind = 'pregnancy';
        else if (PACK_SPECIALTIES.pediatrics.includes(specialty)) kind = 'pediatric';
        if (!kind) {
            setBadge(null);
            return;
        }

        const cached = getBadgeFromCache(uid, nameKey, kind);
        if (cached) {
            setBadge(cached.badge);
            return;
        }

        let cancelled = false;
        fetchBadge(uid, nameKey, kind).then((result) => {
            if (!cancelled) setBadge(result.badge);
        });
        return () => {
            cancelled = true;
        };
    }, [userId, patientName, doctorSpecialty]);

    return badge;
};
// helper export for sanity (unused but keeps the buildCacheKey re-exported for tests)
void buildCacheKey;
