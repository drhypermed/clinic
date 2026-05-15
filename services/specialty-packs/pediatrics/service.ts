/**
 * خدمه ملفات الأطفال (Pediatric File Service)
 *
 * Firestore read/write لوثيقه الطفل تحت:
 *   users/{uid}/settings/pediatricFile__{patientFileNameKey}
 *
 * نفس النمط بتاع ملفات الحمل:
 *   - cache-first في القراءه (سرعه + توفير تكلفه)
 *   - merge: true في الحفظ (نحافظ على الحقول اللي مش في الـpayload)
 *   - normalize عند القراءه لـshape مضمون
 */

import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { getDocCacheFirst } from '../../firestore/cacheFirst';
import { stripUndefinedDeep } from '../firestoreSanitize';
import {
    createEmptyPediatricFile,
    PEDIATRIC_FILE_DOC_PREFIX,
    type ChildSex,
    type GrowthEntry,
    type PediatricFile,
    type VaccinationRecord,
    type VaccinationStatus,
} from './types';

interface PediatricFileIdentity {
    patientFileId?: string | null;
    patientFileNumber?: number | null;
    patientFileNameKey?: string | null;
}

const buildDocId = (nameKey: string): string =>
    `${PEDIATRIC_FILE_DOC_PREFIX}${encodeURIComponent(nameKey)}`;

const getDocRef = (userId: string, nameKey: string) =>
    doc(db, 'users', userId, 'settings', buildDocId(nameKey));

// ─ helpers تنظيف ─

const trimStr = (v: unknown): string => String(v || '').trim();

export const buildPediatricFileStorageKey = ({
    patientFileId,
    patientFileNumber,
    patientFileNameKey,
}: PediatricFileIdentity): string => {
    const parsedFileNumber = Number(patientFileNumber);
    if (Number.isFinite(parsedFileNumber) && parsedFileNumber > 0) {
        return `fileNumber_${Math.floor(parsedFileNumber)}`;
    }

    const cleanFileId = trimStr(patientFileId);
    if (cleanFileId) return `fileId_${cleanFileId}`;

    return trimStr(patientFileNameKey);
};

const toSex = (v: unknown): ChildSex => {
    const s = trimStr(v);
    if (s === 'male' || s === 'female') return s;
    return '';
};

const toStatus = (v: unknown): VaccinationStatus => {
    const s = trimStr(v);
    if (s === 'given' || s === 'skipped') return s;
    return 'pending';
};

const normalizeGrowthEntry = (raw: unknown): GrowthEntry | null => {
    if (!raw || typeof raw !== 'object') return null;
    const r = raw as Record<string, unknown>;
    const id = trimStr(r.id);
    const dateKey = trimStr(r.dateKey);
    if (!id || !dateKey) return null;
    return {
        id,
        dateKey,
        weightKg: trimStr(r.weightKg) || undefined,
        heightCm: trimStr(r.heightCm) || undefined,
        headCircCm: trimStr(r.headCircCm) || undefined,
        notes: trimStr(r.notes) || undefined,
        updatedAt: trimStr(r.updatedAt) || undefined,
    };
};

const normalizeVaccination = (raw: unknown): VaccinationRecord | null => {
    if (!raw || typeof raw !== 'object') return null;
    const r = raw as Record<string, unknown>;
    const scheduleId = trimStr(r.scheduleId);
    if (!scheduleId) return null;
    return {
        scheduleId,
        status: toStatus(r.status),
        givenDate: trimStr(r.givenDate) || undefined,
        batchNumber: trimStr(r.batchNumber) || undefined,
        notes: trimStr(r.notes) || undefined,
        updatedAt: trimStr(r.updatedAt) || undefined,
    };
};

/** تنظيف الوثيقه الخام لـ shape مضمون */
export const normalizePediatricFile = (
    nameKey: string,
    raw: unknown,
): PediatricFile => {
    if (!raw || typeof raw !== 'object') return createEmptyPediatricFile(nameKey);
    const r = raw as Record<string, unknown>;

    const rawGrowth = Array.isArray(r.growthEntries) ? r.growthEntries : [];
    const growthEntries = rawGrowth
        .map(normalizeGrowthEntry)
        .filter((e): e is GrowthEntry => e !== null)
        // مرتبه من الأحدث للأقدم
        .sort((a, b) => (a.dateKey < b.dateKey ? 1 : a.dateKey > b.dateKey ? -1 : 0));

    const rawVacc = (r.vaccinations && typeof r.vaccinations === 'object')
        ? (r.vaccinations as Record<string, unknown>)
        : {};
    const vaccinations: Record<string, VaccinationRecord> = {};
    Object.keys(rawVacc).forEach((key) => {
        const rec = normalizeVaccination({ ...((rawVacc[key] as object) || {}), scheduleId: key });
        if (rec) vaccinations[key] = rec;
    });

    return {
        patientFileNameKey: nameKey,
        dateOfBirth: trimStr(r.dateOfBirth) || undefined,
        sex: toSex(r.sex),
        growthEntries,
        vaccinations,
        generalNotes: trimStr(r.generalNotes) || undefined,
        updatedAt: trimStr(r.updatedAt) || undefined,
    };
};

/** قراءه ملف الطفل (cache-first) — يرجع ملف فاضي لو مش موجود */
export const loadPediatricFile = async (
    userId: string,
    nameKey: string,
    legacyNameKey?: string | null,
): Promise<PediatricFile> => {
    if (!userId || !nameKey) return createEmptyPediatricFile(nameKey);
    try {
        const snap = await getDocCacheFirst(getDocRef(userId, nameKey));
        if (!snap.exists()) {
            const fallbackKey = trimStr(legacyNameKey);
            if (fallbackKey && fallbackKey !== nameKey) {
                const legacySnap = await getDocCacheFirst(getDocRef(userId, fallbackKey));
                if (legacySnap.exists()) return normalizePediatricFile(nameKey, legacySnap.data() || {});
            }
            return createEmptyPediatricFile(nameKey);
        }
        return normalizePediatricFile(nameKey, snap.data() || {});
    } catch {
        return createEmptyPediatricFile(nameKey);
    }
};

/** حفظ ملف الطفل (merge كامل). */
export const savePediatricFile = async (
    userId: string,
    file: PediatricFile,
): Promise<PediatricFile> => {
    if (!userId || !file.patientFileNameKey) {
        throw new Error('بيانات ناقصه — يلزم معرّف الطبيب واسم ملف الطفل.');
    }
    const payload: PediatricFile = {
        ...file,
        updatedAt: new Date().toISOString(),
    };
    // Firestore بيرفض undefined — نشيل أي حقول فاضيه قبل ما نكتب
    const cleanPayload = stripUndefinedDeep(payload);
    await setDoc(getDocRef(userId, file.patientFileNameKey), cleanPayload);
    return payload;
};
