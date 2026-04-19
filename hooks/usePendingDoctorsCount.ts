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
                setCount(submittedCount + pendingLegacyCount);
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
