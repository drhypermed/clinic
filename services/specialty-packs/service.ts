/**
 * خدمه حزم التخصصات (Specialty Packs Service)
 *
 * بتقرأ وتعدّل إعدادات الحزم من Firestore عند settings/specialtyPacks.
 *   - getSpecialtyPacks: قراءه (للأدمن والأطباء). cache-first عشان التكلفه.
 *   - updateSpecialtyPacks: تعديل (للأدمن فقط — الحمايه عبر firestore.rules).
 *
 * normalizeSpecialtyPacks: بتدمج البيانات الخام مع الافتراضيات عشان
 * لو فيه باكدج جديد ما اتسجلش في الوثيقه القديمه، يطلع بقيمه افتراضيه.
 */

import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { getDocCacheFirst } from '../firestore/cacheFirst';
import {
    ALL_PACK_IDS,
    DEFAULT_SPECIALTY_PACKS,
    SPECIALTY_PACKS_DOC_ID,
} from './defaults';
import type { SpecialtyPackId, SpecialtyPacksConfig } from './types';

/** مرجع وثيقه الإعدادات في Firestore */
const getDocRef = () => doc(db, 'settings', SPECIALTY_PACKS_DOC_ID);

// ─ كاش جلسه واحد على مستوى الـmodule — يمنع التطبيق من إعاده الجلب مع كل modal ─
let sessionCache: SpecialtyPacksConfig | null = null;
let inFlight: Promise<SpecialtyPacksConfig> | null = null;

/** قراءه الكاش بدون إعاده جلب — للقراءه المباشره من الهوك */
export const getCachedSpecialtyPacks = (): SpecialtyPacksConfig | null => sessionCache;

/** تحويل قيمه أيا كانت إلى boolean آمن مع fallback */
const toBool = (value: unknown, fallback: boolean): boolean =>
    typeof value === 'boolean' ? value : fallback;

/**
 * توحيد الإعدادات الخام (من Firestore أو غيرها) لـ shape مضمون.
 * يضمن إن كل packId معروف عنده entry حتى لو الوثيقه قديمه.
 */
export const normalizeSpecialtyPacks = (raw: unknown): SpecialtyPacksConfig => {
    const rawPacks = (raw && typeof raw === 'object' && 'packs' in (raw as Record<string, unknown>))
        ? ((raw as { packs?: unknown }).packs as Record<string, unknown> | undefined)
        : undefined;

    const packs = {} as SpecialtyPacksConfig['packs'];
    ALL_PACK_IDS.forEach((id) => {
        const entry = rawPacks?.[id] as { enabled?: unknown } | undefined;
        packs[id] = {
            enabled: toBool(entry?.enabled, DEFAULT_SPECIALTY_PACKS.packs[id].enabled),
        };
    });

    return { packs };
};

/**
 * جلب الإعدادات مع كاش جلسه واحد:
 *   - لو في كاش → نرجعه فوراً.
 *   - لو في طلب بالفعل شغّال → نستنّاه.
 *   - وإلا نجلب من Firestore (cache-first بدوره).
 * أي فشل في الجلب → الافتراضيات الآمنه (كل الحزم مقفوله).
 */
export const getSpecialtyPacks = async (): Promise<SpecialtyPacksConfig> => {
    if (sessionCache) return sessionCache;
    if (inFlight) return inFlight;
    inFlight = (async () => {
        try {
            const snap = await getDocCacheFirst(getDocRef());
            const data = snap.exists()
                ? normalizeSpecialtyPacks(snap.data() || {})
                : DEFAULT_SPECIALTY_PACKS;
            sessionCache = data;
            return data;
        } catch {
            return DEFAULT_SPECIALTY_PACKS;
        } finally {
            inFlight = null;
        }
    })();
    return inFlight;
};

/**
 * تحديث الإعدادات (للأدمن فقط).
 * بنحفظ الكونفيج كامله بعد التطبيع — مفيش merge جزئي عشان مايبقاش حقول هايصه.
 */
export const updateSpecialtyPacks = async (
    payload: SpecialtyPacksConfig,
): Promise<SpecialtyPacksConfig> => {
    const normalized = normalizeSpecialtyPacks(payload);
    await setDoc(
        getDocRef(),
        {
            ...normalized,
            updatedAt: new Date().toISOString(),
            updatedBy: auth.currentUser?.email || auth.currentUser?.uid || 'admin',
        },
        { merge: true },
    );
    // تحديث كاش الجلسه فوراً عشان أي قراءه تاليه في نفس التطبيق تشوف الجديد
    sessionCache = normalized;
    return normalized;
};

/** هل الباكدج مفعّل من الأدمن؟ (helper سريع) */
export const isPackEnabled = (
    config: SpecialtyPacksConfig | null | undefined,
    packId: SpecialtyPackId,
): boolean => Boolean(config?.packs?.[packId]?.enabled);
