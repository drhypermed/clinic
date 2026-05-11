/**
 * Hook حزم التخصصات (Specialty Pack Hook)
 *
 *   - useSpecialtyPacksConfig: يقرا إعدادات الأدمن (cache-first من الـservice).
 *   - useEnabledSpecialtyPack: يدمج تخصص الطبيب + مفتاح الأدمن → معرّف الباكدج
 *     المفعّل (أو null لو مفيش).
 *
 * الكاش نفسه عند الـservice (module-level) عشان save الأدمن يحدثه تلقائياً.
 */

import { useEffect, useMemo, useState } from 'react';
import {
    DEFAULT_SPECIALTY_PACKS,
    getCachedSpecialtyPacks,
    getSpecialtyPacks,
    PACK_SPECIALTIES,
    type SpecialtyPackId,
    type SpecialtyPacksConfig,
} from '../services/specialty-packs';

/** Hook لقراءه الإعدادات — يبدأ بالكاش لو موجود، ويجلب async لو لأ */
export const useSpecialtyPacksConfig = (): SpecialtyPacksConfig => {
    const [config, setConfig] = useState<SpecialtyPacksConfig>(
        () => getCachedSpecialtyPacks() || DEFAULT_SPECIALTY_PACKS,
    );

    useEffect(() => {
        let cancelled = false;
        getSpecialtyPacks().then((next) => {
            if (!cancelled) setConfig(next);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    return config;
};

/**
 * يحدد الباكدج المفعّل للطبيب الحالي بناء على تخصصه + مفاتيح الأدمن.
 *
 * @param doctorSpecialty تخصص الطبيب كما هو محفوظ في بروفايله
 * @returns معرّف الباكدج المفعّل أو null لو مفيش
 */
export const useEnabledSpecialtyPack = (
    doctorSpecialty: string | null | undefined,
): SpecialtyPackId | null => {
    const config = useSpecialtyPacksConfig();

    return useMemo(() => {
        const specialty = String(doctorSpecialty || '').trim();
        if (!specialty) return null;
        const packIds = Object.keys(PACK_SPECIALTIES) as SpecialtyPackId[];
        for (const id of packIds) {
            if (!PACK_SPECIALTIES[id].includes(specialty)) continue;
            if (config.packs[id]?.enabled) return id;
        }
        return null;
    }, [doctorSpecialty, config]);
};
