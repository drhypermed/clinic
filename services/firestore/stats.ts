/**
 * خدمة الإحصائيات (Stats Service)
 * تدير هذه الخدمة بيانات الاستخدام الخاصة بالطبيب:
 * 1. متابعة عدد الروشتات الصادرة.
 * 2. تتبع استهلاك الكوتة (Quota) والميزات المختلفة.
 * 3. حفظ إحصائيات الاستخدام بشكل دوري في سجل المستخدم.
 */

import { db } from '../firebaseConfig';
import {
    doc,
    setDoc,
} from 'firebase/firestore';
import { getDocCacheFirst } from './cacheFirst';

export const statsService = {
    /**
     * الاشتراك في إحصائيات الاستخدام مع (Smart Cache).
     * يعرض الأرقام من الكاش فوراً للداشبورد ثم يحدثها من السيرفر.
     */
    subscribeToStats: (userId: string, onUpdate: (stats: any) => void) => {
        const userRef = doc(db, 'users', userId);
        let cancelled = false;

        getDocCacheFirst(userRef).then((snap) => {
            if (cancelled) return;
            if (snap.exists()) {
                const data = snap.data();
                onUpdate(data.usageStats || {});
            } else {
                onUpdate({});
            }
        }).catch(() => {});

        return () => { cancelled = true; };
    },

    /**
     * حفظ وتحديث إحصائيات الاستخدام.
     * يستخدم خاصية { merge: true } لضمان عدم مسح بيانات المستخدم الأخرى (مثل الاسم أو التخصص)
     * أثناء تحديث الإحصائيات فقط.
     */
    saveStats: async (userId: string, stats: Record<string, number>) => {
        try {
            const userRef = doc(db, 'users', userId);
            await setDoc(userRef, { usageStats: stats }, { merge: true });
        } catch (error) {
            console.error("Error saving stats:", error);
        }
    },
};
