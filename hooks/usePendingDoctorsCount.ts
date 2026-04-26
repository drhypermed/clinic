/**
 * Hook عداد طلبات الأطباء المعلقة بشكل لحظي (usePendingDoctorsCount)
 *
 * يستخدم في لوحة الأدمن لإظهار عدد الأطباء اللي عملوا signup ومستنين
 * المراجعة (verificationStatus = 'submitted' أو 'pending' للقديم).
 *
 * 🔔 لحظي (Real-time):
 * بنستخدم `onSnapshot` بدل `getCountFromServer` عشان أي طبيب جديد يعمل
 * إنشاء حساب يظهر فوراً في عدّاد الأدمن (إشعار فوري) بدون refresh.
 * - أول subscribe: قراءة لكل الـsubmitted/pending docs (~5-50 docs عادة)
 * - بعد كده: قراءة واحدة لكل تغيير (طبيب جديد دخل، أو الأدمن اعتمد/رفض)
 * - تكلفة Firestore reads: مهملة عند الـscale (10k طبيب) — حوالي $0.002/شهر
 */

import { useState, useEffect } from 'react';
import { onSnapshot, where } from 'firebase/firestore';
import { useAuth } from './useAuth';
import { useIsAdmin } from './useIsAdmin';
import { getDoctorUsersQuery } from '../services/firestore/profileRoles';

export const usePendingDoctorsCount = () => {
    const [count, setCount] = useState(0);
    const { user } = useAuth();
    const isAdmin = useIsAdmin(user);

    useEffect(() => {
        // حماية: غير الأدمن ما يقدرش يقرأ الـquery (Firestore rules بتمنع برضه)
        if (!isAdmin) {
            setCount(0);
            return;
        }

        // نـsubscribe على الـ2 statuses معاً ونجمع الـcounts
        // (نفصلهم لأن Firestore ما بيدعمش OR على نفس الحقل بسهولة)
        let submittedCount = 0;
        let legacyPendingCount = 0;

        const submittedQuery = getDoctorUsersQuery(where('verificationStatus', '==', 'submitted'));
        const legacyPendingQuery = getDoctorUsersQuery(where('verificationStatus', '==', 'pending'));

        // listener لطلبات submitted (الـstatus الجديد)
        const unsubSubmitted = onSnapshot(
            submittedQuery,
            (snap) => {
                submittedCount = snap.size;
                setCount(submittedCount + legacyPendingCount);
            },
            (error) => {
                const code = String((error as { code?: unknown })?.code || '');
                if (code === 'permission-denied') {
                    setCount(0);
                    return;
                }
                console.error('Error subscribing to submitted doctors:', error);
            },
        );

        // listener لطلبات pending (للتوافق مع البيانات القديمة)
        const unsubLegacy = onSnapshot(
            legacyPendingQuery,
            (snap) => {
                legacyPendingCount = snap.size;
                setCount(submittedCount + legacyPendingCount);
            },
            (error) => {
                const code = String((error as { code?: unknown })?.code || '');
                if (code === 'permission-denied') return; // مش هنصفّر — خلّ submittedCount يفضل صحيح
                console.error('Error subscribing to legacy pending doctors:', error);
            },
        );

        // cleanup: لما الـcomponent unmount، نلغي الـ2 subscriptions عشان مايفضلوش
        // يستهلكوا reads بدون داعي
        return () => {
            unsubSubmitted();
            unsubLegacy();
        };
    }, [isAdmin]);

    return count;
};
