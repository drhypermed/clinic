import { getDoc } from 'firebase/firestore';
import { resolveEffectiveAccountTypeFromData } from '../../utils/accountStatusTime';
import { getTrustedNowMs, syncTrustedTime } from '../../utils/trustedTime';
import {
  getLegacyDoctorProfileDocRef,
  getUserProfileDocRef,
  mergePrimaryProfileData,
} from '../../services/firestore/profileRoles';

// قراءة مباشرة من السيرفر — لا نستخدم الكاش لأن نوع الحساب يحدد صلاحيات مدفوعة
// وأي تقادم في الكاش قد يمنح مستخدماً منتهياً اشتراكه وصولاً غير مصرح به.
export const resolveCurrentUserAccountType = async (
  userId?: string | null
): Promise<'free' | 'premium'> => {
  if (!userId) return 'free';

  const [userDoc, legacyDoctorDoc] = await Promise.all([
    getDoc(getUserProfileDocRef(userId)),
    getDoc(getLegacyDoctorProfileDocRef(userId)),
  ]);

  if (!userDoc.exists() && !legacyDoctorDoc.exists()) return 'free';

  const data = mergePrimaryProfileData(
    userDoc.exists() ? (userDoc.data() as Record<string, unknown>) : null,
    legacyDoctorDoc.exists() ? (legacyDoctorDoc.data() as Record<string, unknown>) : null,
  );
  await syncTrustedTime();
  return resolveEffectiveAccountTypeFromData(data, getTrustedNowMs());
};
