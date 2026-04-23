import { getDoc } from 'firebase/firestore';
import { resolveEffectiveAccountTypeFromData } from '../../utils/accountStatusTime';
import { getTrustedNowMs, syncTrustedTime } from '../../utils/trustedTime';
import { getUserProfileDocRef } from '../../services/firestore/profileRoles';

// قراءه مباشره من السيرفر — لا نستخدم الكاش لأن نوع الحساب يحدد صلاحيات مدفوعه
// وأي تقادم في الكاش قد يمنح مستخدماً منتهياً اشتراكه وصولاً غير مصرح به.
// قراءه واحده فقط — قبل كده كانت 2 reads بسبب alias قديم لنفس الـdoc.
export const resolveCurrentUserAccountType = async (
  userId?: string | null
): Promise<'free' | 'premium' | 'pro_max'> => {
  if (!userId) return 'free';

  const userDoc = await getDoc(getUserProfileDocRef(userId));
  if (!userDoc.exists()) return 'free';

  const data = userDoc.data() as Record<string, unknown>;
  await syncTrustedTime();
  return resolveEffectiveAccountTypeFromData(data, getTrustedNowMs());
};
