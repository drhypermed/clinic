/**
 * خدمة إحصائيات استخدام الأدوية (Medication Usage Stats) — سحابي
 *
 * تحفظ عداد استخدام كل دواء (كم مرة أضافه الطبيب للروشتة) في
 * `users/{uid}/settings/medicationUsage`، بحيث يترتب البحث عن الأدوية
 * حسب الأكثر استخداماً وتتزامن الأرقام عبر الأجهزة.
 *
 * ملاحظة: حقل `users/{uid}.usageStats` مخصَّص لعدّادات الكوتة (Free/Premium)
 * وله منطق مختلف — لذلك نستخدم مستند منفصل في `settings/` لتجنب التعارض.
 */

import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { getDocCacheFirst } from './firestore/cacheFirst';

const MED_USAGE_DOC_ID = 'medicationUsage';

/** قراءة العدّادات من السحابة (cache-first — مجاني لو كان في الكاش المحلي) */
export const loadMedicationUsageStats = async (
    userId: string,
): Promise<Record<string, number>> => {
    const trimmed = String(userId || '').trim();
    if (!trimmed) return {};
    try {
        const ref = doc(db, 'users', trimmed, 'settings', MED_USAGE_DOC_ID);
        const snap = await getDocCacheFirst(ref);
        if (!snap.exists()) return {};
        const data = snap.data() as { stats?: Record<string, number> };
        const stats = data.stats;
        if (!stats || typeof stats !== 'object') return {};
        const clean: Record<string, number> = {};
        for (const [id, count] of Object.entries(stats)) {
            const n = Number(count);
            if (Number.isFinite(n) && n > 0) clean[id] = Math.floor(n);
        }
        return clean;
    } catch (err) {
        console.warn('[MedicationUsageStats] load failed:', err);
        return {};
    }
};

/** حفظ العدّادات في السحابة — يُستدعى مع debounce لتقليل عدد الكتابات */
export const saveMedicationUsageStats = async (
    userId: string,
    stats: Record<string, number>,
): Promise<void> => {
    const trimmed = String(userId || '').trim();
    if (!trimmed) return;
    try {
        const ref = doc(db, 'users', trimmed, 'settings', MED_USAGE_DOC_ID);
        await setDoc(
            ref,
            { stats, updatedAt: serverTimestamp() },
            { merge: true },
        );
    } catch (err) {
        console.warn('[MedicationUsageStats] save failed:', err);
    }
};
