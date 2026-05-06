import { useEffect, useState } from 'react';
import {
  DEFAULT_PUBLIC_SITE_CONTROL,
  PublicSiteControl,
  subscribeToPublicSiteControl,
} from '../services/firestore/publicSiteControl';

/**
 * Hook صغير لقراءة إعدادات حجب الموقع العام (PatientLandingPage).
 *
 * - بيبدأ بالافتراضيات (enabled=true) عشان الـUI يفتح فوراً ما يستناش الـnetwork
 * - لما الـsnapshot الأول يوصل من Firestore، بيستبدل الافتراضيات بالقيم الحقيقية
 * - أي تحديث من الأدمن (toggle/edit) بيتطبّق فوراً بدون reload
 * - `ready` = false في أول رندر (قبل ما الـdata توصل) — يفيد لو محتاج
 *   نمنع أي flash content قبل ما نتأكد من حالة الموقع
 */
export const usePublicSiteControl = () => {
  const [settings, setSettings] = useState<PublicSiteControl>(DEFAULT_PUBLIC_SITE_CONTROL);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToPublicSiteControl((next) => {
      setSettings(next);
      setReady(true);
    });
    return () => unsubscribe();
  }, []);

  return { settings, ready };
};
