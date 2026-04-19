/**
 * مسميات بنود الدخل (Financial Labels)
 *
 * يسمح هذا الـ module للطبيب بتخصيص نصوص البنود (مثل تسمية "التداخلات" أو
 * "دخل آخر") لعرضها في الواجهة بالأسماء التي يفضلها. القيم الافتراضية هي:
 *   - interventionsLabel: "التداخلات"
 *   - otherRevenueLabel : "دخل آخر"
 *
 * تُخزَّن في: `users/{uid}/financialData/labels`
 *
 * ملاحظة — auto-migration: الإصدارات القديمة كانت تحفظ "(كاش)" كجزء من المسمى
 * (مثلاً "التداخلات (كاش)"). `getLabels` و `subscribeToLabels` ينظّفان هذه
 * اللاحقة تلقائياً ويعيدان كتابة النسخة النضيفة إلى Firestore مرة واحدة،
 * بحيث لا يحتاج أي مستهلك بعد الآن لتطبيق stripping محلي.
 */

import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getDocCacheFirst } from '../firestore/cacheFirst';
import type { FinancialLabels } from './types';
import { branchDocKey } from './normalizers';

const DEFAULT_LABELS: FinancialLabels = {
    interventionsLabel: 'التداخلات',
    otherRevenueLabel: 'دخل آخر',
};

/** يزيل لاحقة "(كاش)" القديمة من نهاية المسمى (legacy data cleanup) */
const stripLegacyCashSuffix = (value?: string): string => {
    if (!value) return '';
    return value.replace(/\s*\(كاش\)\s*$/u, '').trim();
};

/**
 * يُنظّف المسميات القادمة من Firestore.
 * يُرجع { labels, migrated } — `migrated=true` لو حصل تنظيف فعلي يستحق إعادة الحفظ.
 */
const normalizeLabels = (raw: FinancialLabels): { labels: FinancialLabels; migrated: boolean } => {
    const origIntv = raw?.interventionsLabel || '';
    const origOther = raw?.otherRevenueLabel || '';
    const cleanIntv = stripLegacyCashSuffix(origIntv);
    const cleanOther = stripLegacyCashSuffix(origOther);
    const migrated =
        (origIntv.trim() !== cleanIntv) ||
        (origOther.trim() !== cleanOther);
    return {
        labels: {
            ...raw,
            interventionsLabel: cleanIntv || DEFAULT_LABELS.interventionsLabel,
            otherRevenueLabel: cleanOther || DEFAULT_LABELS.otherRevenueLabel,
        },
        migrated,
    };
};

/** حفظ المسميات المخصصة لبنود الدخل */
export const saveLabels = async (userId: string, labels: FinancialLabels, branchId?: string): Promise<void> => {
    if (!userId) throw new Error('User ID is required');

    try {
        const docRef = doc(db, 'users', userId, 'financialData', branchDocKey('labels', branchId));
        await setDoc(docRef, {
            ...labels,
            updatedAt: Date.now()
        }, { merge: true });
    } catch (error) {
        console.error('[FinancialData] Error saving labels:', error);
        throw error;
    }
};

/** كتابة صامتة للنسخة المُنظّفة (migration) — لا تُرمى أي أخطاء */
const persistMigratedLabels = (userId: string, labels: FinancialLabels, branchId?: string) => {
    saveLabels(userId, labels, branchId).catch(() => { /* silent */ });
};

/** جلب المسميات المخصصة (مع قيم افتراضية + auto-migration للاحقة "(كاش)" القديمة) */
export const getLabels = async (userId: string, branchId?: string): Promise<FinancialLabels> => {
    try {
        const docRef = doc(db, 'users', userId, 'financialData', branchDocKey('labels', branchId));
        const snapshot = await getDocCacheFirst(docRef);

        if (snapshot.exists()) {
            const { labels, migrated } = normalizeLabels(snapshot.data() as FinancialLabels);
            if (migrated && userId) persistMigratedLabels(userId, labels, branchId);
            return labels;
        }
        return { ...DEFAULT_LABELS };
    } catch (error) {
        console.error('[FinancialData] Error getting labels:', error);
        return { ...DEFAULT_LABELS };
    }
};

/** الاشتراك اللحظي في تحديثات المسميات (مع auto-migration للاحقة "(كاش)") */
export const subscribeToLabels = (
    userId: string,
    onUpdate: (labels: FinancialLabels) => void,
    onError?: (error: string) => void,
    branchId?: string,
) => {
    const docRef = doc(db, 'users', userId, 'financialData', branchDocKey('labels', branchId));
    let migrationAttempted = false;

    const handleSnap = (snapshot: any) => {
        if (snapshot.exists()) {
            const { labels, migrated } = normalizeLabels(snapshot.data() as FinancialLabels);
            if (migrated && userId && !migrationAttempted) {
                migrationAttempted = true;
                persistMigratedLabels(userId, labels, branchId);
            }
            onUpdate(labels);
        } else {
            onUpdate({ ...DEFAULT_LABELS });
        }
    };

    // 1. جلب فوري من الكاش
    getDocCacheFirst(docRef).then(snap => {
        if (snap.exists()) handleSnap(snap);
    }).catch(() => { });

    // 2. مزامنة حية من السيرفر
    return onSnapshot(docRef, handleSnap, (error) => {
        console.error('[FinancialData] Error subscribing to labels:', error);
        if (onError) onError(error.message);
    });
};
