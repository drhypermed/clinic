/**
 * خدمه ملفات الحمل (Pregnancy File Service)
 *
 * Firestore read/write لوثيقه الحمل الخاصه بكل مريضه:
 *   users/{uid}/settings/pregnancyFile__{patientFileNameKey}
 *
 * - cache-first في القراءه عشان السرعه والتكلفه.
 * - merge: true في الحفظ عشان مايمسحش حقول ما اتبعتش.
 * - normalize عند القراءه عشان أي حقل ناقص في الوثيقه القديمه يطلع آمن.
 */

import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { getDocCacheFirst } from '../../firestore/cacheFirst';
import { stripUndefinedDeep } from '../firestoreSanitize';
import { calculateEDD } from './calculations';
import {
    createEmptyPregnancyFile,
    PREGNANCY_FILE_DOC_PREFIX,
    type PregnancyClosureType,
    type PregnancyFile,
    type PregnancyVisit,
} from './types';

/** بناء معرّف الوثيقه الكامل من nameKey */
const buildDocId = (nameKey: string): string =>
    `${PREGNANCY_FILE_DOC_PREFIX}${encodeURIComponent(nameKey)}`;

/** مرجع وثيقه الحمل */
const getDocRef = (userId: string, nameKey: string) =>
    doc(db, 'users', userId, 'settings', buildDocId(nameKey));

// ─ helpers تنظيف ─

const trimStr = (v: unknown): string => String(v || '').trim();

const toMovement = (v: unknown): PregnancyVisit['fetalMovement'] => {
    const s = trimStr(v);
    if (s === 'normal' || s === 'decreased' || s === 'absent') return s;
    return '';
};

const toClosureType = (v: unknown): PregnancyClosureType | undefined => {
    const s = trimStr(v);
    if (s === 'delivery' || s === 'miscarriage' || s === 'other') return s;
    return undefined;
};

const normalizeVisit = (raw: unknown): PregnancyVisit | null => {
    if (!raw || typeof raw !== 'object') return null;
    const r = raw as Record<string, unknown>;
    const id = trimStr(r.id);
    const dateKey = trimStr(r.dateKey);
    if (!id || !dateKey) return null;
    const week = typeof r.gestationalWeek === 'number' ? r.gestationalWeek : undefined;
    return {
        id,
        dateKey,
        gestationalWeek: week && week > 0 ? Math.floor(week) : undefined,
        fetalWeight: trimStr(r.fetalWeight) || undefined,
        fetalHeartRate: trimStr(r.fetalHeartRate) || undefined,
        ultrasoundNotes: trimStr(r.ultrasoundNotes) || undefined,
        fetalMovement: toMovement(r.fetalMovement),
        maternalWeight: trimStr(r.maternalWeight) || undefined,
        notes: trimStr(r.notes) || undefined,
        updatedAt: trimStr(r.updatedAt) || undefined,
    };
};

/** تنظيف الوثيقه الخام لـ shape مضمون */
export const normalizePregnancyFile = (
    nameKey: string,
    raw: unknown,
): PregnancyFile => {
    if (!raw || typeof raw !== 'object') return createEmptyPregnancyFile(nameKey);
    const r = raw as Record<string, unknown>;
    const lmp = trimStr(r.lastMenstrualPeriod) || undefined;
    // EDD محسوب — لو متخزن، نتحقق إنه مطابق للحساب الحالي
    const storedEDD = trimStr(r.estimatedDueDate) || undefined;
    const expectedEDD = lmp ? calculateEDD(lmp) : null;
    const edd = expectedEDD || storedEDD || undefined;

    const rawVisits = Array.isArray(r.visits) ? r.visits : [];
    const visits = rawVisits
        .map(normalizeVisit)
        .filter((v): v is PregnancyVisit => v !== null)
        // ترتيب من الأحدث للأقدم
        .sort((a, b) => (a.dateKey < b.dateKey ? 1 : a.dateKey > b.dateKey ? -1 : 0));

    return {
        patientFileNameKey: nameKey,
        lastMenstrualPeriod: lmp,
        estimatedDueDate: edd,
        visits,
        closedAt: trimStr(r.closedAt) || undefined,
        closureType: toClosureType(r.closureType),
        generalNotes: trimStr(r.generalNotes) || undefined,
        updatedAt: trimStr(r.updatedAt) || undefined,
    };
};

/** قراءه ملف الحمل (cache-first) — يرجع ملف فاضي لو مش موجود */
export const loadPregnancyFile = async (
    userId: string,
    nameKey: string,
): Promise<PregnancyFile> => {
    if (!userId || !nameKey) return createEmptyPregnancyFile(nameKey);
    try {
        const snap = await getDocCacheFirst(getDocRef(userId, nameKey));
        if (!snap.exists()) return createEmptyPregnancyFile(nameKey);
        return normalizePregnancyFile(nameKey, snap.data() || {});
    } catch {
        return createEmptyPregnancyFile(nameKey);
    }
};

/**
 * حفظ ملف الحمل (دمج كلي مع الوثيقه الحاليه).
 * EDD بيتعاد حسابه دايماً من LMP — مش بناخده من الـpayload.
 */
export const savePregnancyFile = async (
    userId: string,
    file: PregnancyFile,
): Promise<PregnancyFile> => {
    if (!userId || !file.patientFileNameKey) {
        throw new Error('بيانات ناقصه — يلزم معرّف الطبيب واسم ملف المريضه.');
    }
    // إعاده حساب EDD عشان نتأكد دايماً متسق مع LMP
    const edd = file.lastMenstrualPeriod
        ? calculateEDD(file.lastMenstrualPeriod) || undefined
        : undefined;

    const payload: PregnancyFile = {
        ...file,
        estimatedDueDate: edd,
        updatedAt: new Date().toISOString(),
    };

    // Firestore بيرفض undefined — نشيل أي حقول فاضيه قبل ما نكتب
    const cleanPayload = stripUndefinedDeep(payload);
    await setDoc(getDocRef(userId, file.patientFileNameKey), cleanPayload, { merge: true });
    return payload;
};
