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
import { subscribeDocCacheFirst } from './cacheFirst';

export const statsService = {
    /**
     * الاشتراك اللحظي في إحصائيات الاستخدام (cache-first + onSnapshot حقيقي).
     * كان قبل كده one-shot — الـUI ما كانش بيتحدث لمّا Cloud Function تحدّث usageStats
     * بعد كل smart prescription، فالعدّاد كان يفضل ثابت لحد الـrefresh.
     */
    subscribeToStats: (userId: string, onUpdate: (stats: any) => void) => {
        const userRef = doc(db, 'users', userId);
        return subscribeDocCacheFirst(userRef, {
            next: (snap) => {
                onUpdate(snap.exists() ? (snap.data()?.usageStats || {}) : {});
            },
        });
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
