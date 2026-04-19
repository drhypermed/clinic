/**
 * الملف: usePublicBookingLinkResolution.ts (Hook)
 * الوصف: "محلل الروابط الذكي". 
 * يقوم هذا الملف بتحويل الرابط النصي (Slug) الذي يراه المستخدم إلى "هوية تقنية": 
 * - يحول الـ Slug (مثل اسم العيادة في المتصفح) إلى معرف الطبيب (User ID). 
 * - يستخرج "الكود السري" (Secret) اللازم للوصول لبيانات السكرتارية. 
 * - يضمن عدم فتح الصفحة إلا إذا كان الرابط صحيحاً ومرتبطاً بطبيب مسجل. 
 * - يعالج حالات الانتقال المباشر أو الروابط المختصرة.
 */
import { useEffect, useState } from 'react';

import { firestoreService } from '../../../services/firestore';

type UsePublicBookingLinkResolutionParams = {
  slugParam: string;
  secretParam: string;
};

export const usePublicBookingLinkResolution = ({
  slugParam,
  secretParam,
}: UsePublicBookingLinkResolutionParams) => {
  const [userIdParam, setUserIdParam] = useState<string>('');
  const [secret, setSecret] = useState(secretParam);
  const [resolvingSecret, setResolvingSecret] = useState(!secretParam);

  useEffect(() => {
    if (!slugParam || secretParam) return;

    (async () => {
      const resolvedUserId = await firestoreService.getUserIdByBookingSlug(slugParam);
      if (resolvedUserId) {
        setUserIdParam(resolvedUserId);
        setResolvingSecret(true);
      } else {
        setResolvingSecret(false);
      }
    })();
  }, [slugParam, secretParam]);

  useEffect(() => {
    if (secretParam) {
      setSecret(secretParam);
      setResolvingSecret(false);
      return;
    }

    if (userIdParam) {
      firestoreService.getBookingSecretByUserId(userIdParam)
        .then((s) => {
          if (s) setSecret(s);
          setResolvingSecret(false);
        })
        .catch((err) => {
          console.error('[Secretary] Error looking up secret:', err);
          setResolvingSecret(false);
        });
      return;
    }

    setResolvingSecret(false);
  }, [userIdParam, secretParam]);

  return {
    userIdParam,
    secret,
    resolvingSecret,
  };
};
