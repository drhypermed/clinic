// ─────────────────────────────────────────────────────────────────────────────
// Hook اشتراك لحظي بقائمة الأدمن (useAdminEmails)
// ─────────────────────────────────────────────────────────────────────────────
// بدلاً من ADMIN_EMAIL الثابت الفارغ، نشترك لحظياً في /admins/* لـ:
//   1) حماية كل حسابات الأدمن (ليس المستخدم الحالي فقط) من التعطيل/الحذف.
//   2) يتحدث تلقائياً لو تم إضافة/حذف أدمن في مكان آخر بدون ما نعمل refresh.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { ADMIN_EMAIL } from '../../../app/drug-catalog/admin';
import { normalizeEmail } from '../../../services/auth-service/validation';

export const useAdminEmails = (enabled: boolean) => {
  // نبدأ بـ ADMIN_EMAIL الثابت كـ fallback حتى لو فشل الاشتراك بالـ Firestore
  const [adminEmails, setAdminEmails] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    const hardcoded = normalizeEmail(ADMIN_EMAIL);
    if (hardcoded) initial.add(hardcoded);
    return initial;
  });

  useEffect(() => {
    if (!enabled) return undefined;
    const unsub = onSnapshot(
      collection(db, 'admins'),
      (snapshot) => {
        const next = new Set<string>();
        const hardcoded = normalizeEmail(ADMIN_EMAIL);
        if (hardcoded) next.add(hardcoded);
        snapshot.docs.forEach((snapDoc) => {
          const data = snapDoc.data() as Record<string, unknown>;
          // الـ email إما في الحقل مباشرة أو في الـ doc id
          const email = normalizeEmail((data?.email as string) || snapDoc.id);
          if (email) next.add(email);
        });
        setAdminEmails(next);
      },
      (error) => {
        console.warn('[useAdminEmails] Could not subscribe to admins collection:', error);
      },
    );
    return () => unsub();
  }, [enabled]);

  return adminEmails;
};
