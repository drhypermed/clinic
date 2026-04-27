/**
 * الملف: usePublicBookingLinkResolution.ts (Hook)
 * الوصف: "محلل الروابط الذكي".
 * يقوم هذا الملف بتحويل الرابط النصي (Slug) الذي يراه المستخدم إلى "هوية تقنية":
 * - يحول الـ Slug (مثل اسم العيادة في المتصفح) إلى معرف الطبيب (User ID).
 * - يستخرج "الكود السري" (Secret) اللازم للوصول لبيانات السكرتارية.
 * - يضمن عدم فتح الصفحة إلا إذا كان الرابط صحيحاً ومرتبطاً بطبيب مسجل.
 * - يعالج حالات الانتقال المباشر أو الروابط المختصرة.
 *
 * حماية race conditions: contextRequestIdRef counter يزيد مع كل تغيُّر context،
 * وكل async response بيتأكد إن الـcounter ما اتغيَّرش قبل ما يكتب على الـstate.
 * كده لو السكرتير اتنقل لرابط حجز تاني وقت ما طلب قديم لسه شغّال، الرد القديم
 * بيتجاهل تلقائياً ومش بيكتب فوق بيانات الدكتور الجديد.
 */
import { useEffect, useRef, useState } from 'react';

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

  // Counter يزيد مع كل تغيُّر context — يحمي من stale async responses.
  const contextRequestIdRef = useRef(0);

  // ─── Reset state عند تغيُّر الرابط ───
  // قبل الإصلاح: لو السكرتير اتنقل بين روابط مختلفة في نفس الـtab، الـuserIdParam
  // والـsecret القديمين كانوا بيفضلوا ظاهرين لحظات قبل ما يتحدّثوا. الحل:
  // نـreset الـstate فوراً عند تغيُّر الـslug/secret، ونزوّد الـrequest id عشان أي
  // async رد قديم يتجاهل تلقائياً.
  useEffect(() => {
    contextRequestIdRef.current += 1;
    setUserIdParam('');
    setSecret(secretParam || '');
    setResolvingSecret(!secretParam);
  }, [slugParam, secretParam]);

  // ─── Slug → User ID lookup ───
  useEffect(() => {
    if (!slugParam || secretParam) return;
    const myRequestId = contextRequestIdRef.current;

    (async () => {
      const resolvedUserId = await firestoreService.getUserIdByBookingSlug(slugParam);
      // الرد ده لطلب قديم؟ اخرج بدون setState
      if (contextRequestIdRef.current !== myRequestId) return;

      if (resolvedUserId) {
        setUserIdParam(resolvedUserId);
        setResolvingSecret(true);
      } else {
        // الـslug مش معروف — نمسح userIdParam (لو كان من lookup سابق) ونوقف الـresolving
        setUserIdParam('');
        setResolvingSecret(false);
      }
    })();
  }, [slugParam, secretParam]);

  // ─── User ID → Secret lookup ───
  useEffect(() => {
    if (secretParam) {
      setSecret(secretParam);
      setResolvingSecret(false);
      return;
    }

    if (!userIdParam) {
      setResolvingSecret(false);
      return;
    }

    const myRequestId = contextRequestIdRef.current;

    firestoreService.getBookingSecretByUserId(userIdParam)
      .then((s) => {
        if (contextRequestIdRef.current !== myRequestId) return;
        if (s) setSecret(s);
        setResolvingSecret(false);
      })
      .catch((err) => {
        if (contextRequestIdRef.current !== myRequestId) return;
        console.error('[Secretary] Error looking up secret:', err);
        setResolvingSecret(false);
      });
  }, [userIdParam, secretParam]);

  return {
    userIdParam,
    secret,
    resolvingSecret,
  };
};
