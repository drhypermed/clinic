/**
 * Hook حساب عدد طلبات الانضمام المعلقة (usePendingDoctorsCount)
 * يستخدم هذا الـ Hook في لوحة تحكم المدير (Admin Dashboard) لإظهار عدد الأطباء
 * الذين سجلوا في النظام وينتظرون مراجعة أوراقهم وقبولهم (submitted/pending legacy).
 */

import { useState, useEffect } from 'react';
import { getCountFromServer, where } from 'firebase/firestore';
import { useAuth } from './useAuth';
import { useIsAdmin } from './useIsAdmin';
import { getDoctorUsersQuery } from '../services/firestore/profileRoles';

const asNumber = (value: unknown): number => {
    const normalized = Number(value);
    return Number.isFinite(normalized) ? normalized : 0;
};

/**
 * كاش على مستوى الوحدة — getCountFromServer مكلف (تُحسب كل واحدة كقراءة
 * لحد ١٠٠٠ مستند). نحتفظ بالنتيجة لمدة ساعة عشان إعادة فتح الأدمن
 * من نفس الجلسة لا تعيد الحساب.
 */
const PENDING_COUNT_CACHE_TTL_MS = 60 * 60 * 1000;
let pendingCountCache: { expiresAt: number; count: number } | null = null;

export const usePendingDoctorsCount = () => {
    const [count, setCount] = useState(0);
    const { user } = useAuth();
    const isAdmin = useIsAdmin(user);

    useEffect(() => {
        // حماية البيانات: لا يتم جلب العدد إلا إذا كان المستخدم الحالي مديراً للنظام
        if (!isAdmin) {
            setCount(0);
            return;
        }

        let cancelled = false;

        // لو الكاش لسه صالح، نستخدمه بدل إعادة الحساب
        const now = Date.now();
        if (pendingCountCache && pendingCountCache.expiresAt > now) {
            setCount(pendingCountCache.count);
            return () => { cancelled = true; };
        }

        // نتجاهل عن قصد ملخص settings/adminDashboardStats لأنه قد يتأخر لحظات (يُحدّث بجدولة)
        // ويعرض أرقاماً قديمة تسبب بانر تنبيه كاذب. الاستعلام الحي على مجموعة users دقيق دائماً.
        const loadPendingCount = async () => {
            try {
                const [submittedSnap, legacyPendingSnap] = await Promise.all([
                    getCountFromServer(getDoctorUsersQuery(where('verificationStatus', '==', 'submitted'))),
                    getCountFromServer(getDoctorUsersQuery(where('verificationStatus', '==', 'pending'))),
                ]);
                if (cancelled) return;

                const submittedCount = asNumber(submittedSnap.data()?.count);
                const pendingLegacyCount = asNumber(legacyPendingSnap.data()?.count);
                const total = submittedCount + pendingLegacyCount;
                pendingCountCache = {
                    expiresAt: Date.now() + PENDING_COUNT_CACHE_TTL_MS,
                    count: total,
                };
                setCount(total);
            } catch (error) {
                if (cancelled) return;
                const code = String((error as { code?: unknown })?.code || '');
                if (code === 'permission-denied') {
                    setCount(0);
                    return;
                }
                console.error('Error fetching pending doctors count:', error);
            }
        };

        void loadPendingCount();

        return () => { cancelled = true; };
    }, [isAdmin]);

    return count;
};
