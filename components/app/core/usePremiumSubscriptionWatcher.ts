import { useEffect } from 'react';
import { addDoc, setDoc } from 'firebase/firestore';
import type { ExtendedUser } from '../../../hooks/useAuth';
import { getDocCacheFirst } from '../../../services/firestore/cacheFirst';
import { formatUserDate } from '../../../utils/cairoTime';
import { parseIsoTimeMs } from '../../../utils/expiryTime';
import { getTrustedNowMs, syncTrustedTime } from '../../../utils/trustedTime';
import {
  buildDoctorUserProfilePayload,
  getDoctorNotificationsCollectionRef,
  getUserProfileDocRef,
} from '../../../services/firestore/profileRoles';

/**
 * Hook متابعة اشتراكات العضوية الممتازة (Pro Subscription Watcher)
 * وظيفته:
 * 1. فحص حالة اشتراك الطبيب (هل هو Pro؟).
 * 2. إذا كان الاشتراك سينتهي خلال (24 ساعة) أو أقل، يتم إرسال إشعار داخلي للطبيب للتذكير بالتجديد.
 * 3. تحديث قاعدة البيانات لضمان عدم تكرار الإشعار.
 * ملاحظة: تخفيض مستوى الحساب (Downgrade) يتم عبر Cloud Functions وليس من الكود البرمجي للمتصفح لدواعي الأمان والحماية.
 */

type UseProSubscriptionWatcherParams = {
  user: ExtendedUser | null;
};

export const usePremiumSubscriptionWatcher = ({ user }: UseProSubscriptionWatcherParams) => {
  useEffect(() => {
    if (!user) return;

    // الفحص موجه للأطباء فقط
    if (user.authRole !== 'doctor') return;

    let isMounted = true;

    const checkSubscription = async () => {
      try {
        // قراءه واحده من users/{uid} — كانت قبل كده 2 reads بسبب alias قديم لنفس الـdoc.
        const userDoc = await getDocCacheFirst(getUserProfileDocRef(user.uid));
        if (!isMounted || !userDoc.exists()) return;

        const data = userDoc.data() as Record<string, any>;
        const accountType = data?.accountType;             // نوع الحساب (free / premium)
        const premiumStartDate = data?.premiumStartDate;   // تاريخ بدء الاشتراك
        const premiumExpiryDate = data?.premiumExpiryDate; // تاريخ انتهاء الاشتراك
        const premiumNotificationSent = data?.premiumNotificationSent; // هل تم إرسال تنبيه سابقاً؟

        // إذا كان الحساب "برو" أو "برو ماكس" وله تاريخ انتهاء — نتابع تنبيهات الانتهاء
        if ((accountType === 'premium' || accountType === 'pro_max') && premiumExpiryDate) {
          await syncTrustedTime();
          const expiryTime = parseIsoTimeMs(premiumExpiryDate);
          if (expiryTime === null) return;
          const now = getTrustedNowMs();
          const startTime = parseIsoTimeMs(premiumStartDate);

          // وقت إطلاق التنبيه: عند الوصول لآخر 5% من المدة الإجمالية
          let notifyAtTime = expiryTime - 24 * 60 * 60 * 1000;
          if (startTime !== null && startTime < expiryTime) {
            const totalDuration = expiryTime - startTime;
            notifyAtTime = expiryTime - (totalDuration * 0.05);
          }

          // إذا حل وقت التنبيه ولم يتم إرساله بعد
          if (now >= notifyAtTime && now < expiryTime && !premiumNotificationSent) {
            // أ. إضافة إشعار جديد في مجموعة الإشعارات الخاصة بالطبيب
            await addDoc(getDoctorNotificationsCollectionRef(user.uid), {
              type: 'premium-expiry',
              title: '⏰ اشتراكك برو سينتهي قريبًا',
              message: `اشتراك برو سينتهي في ${formatUserDate(premiumExpiryDate, undefined, 'ar-EG')}. الرجاء تجديد اشتراكك للاستمرار في استخدام كافة بروات.`,
              actionUrl: '/admin',
              actionLabel: 'تجديد الآن',
              createdAt: new Date(now).toISOString(),
              read: false,
              expiryDate: expiryTime + 3 * 24 * 60 * 60 * 1000, // صلاحية الإشعار نفسه
            });

            // ب. تحديث حالة إرسال الإشعار لمنع التكرار
            await setDoc(getUserProfileDocRef(user.uid), buildDoctorUserProfilePayload({
              premiumNotificationSent: true,
            }), { merge: true });
          }

          // ج. إشعار بانتهاء الاشتراك الفعلي (Cloud Functions تتولى سحب الصلاحيات)
          if (now >= expiryTime) {
            console.log('[Subscription] Pro expired. Cloud Function will handle downgrade.');
          }
        }
      } catch (err) {
        console.error('Error checking subscription:', err);
      }
    };

    checkSubscription();

    return () => {
      isMounted = false;
    };
  }, [user]);
};
