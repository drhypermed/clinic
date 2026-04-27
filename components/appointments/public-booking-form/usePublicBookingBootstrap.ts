/**
 * الملف: usePublicBookingBootstrap.ts (Hook)
 * الوصف: "محرك التهيئة" لفورم الجمهور.
 * هذا الـ Hook هو أول ما يعمل عند فتح الرابط، ومسؤول عن:
 * 1. تحويل الـ Slug (الاسم اللطيف في الرابط) إلى معرف الطبيب (User ID).
 * 2. جلب "المفتاح السري" (Public Secret) الخاص بالعيادة.
 * 3. تحميل إعدادات العيادة (العنوان، بيانات التواصل).
 * 4. جلب قائمة المواعيد المتاحة (Slots) ليتم عرضها للمريض.
 * يضمن الـ Hook أن الصفحة لن تعرض أي بيانات قبل التأكد من صحة الرابط تماماً.
 *
 * حماية race conditions: contextRequestIdRef counter يزيد مع كل تغيُّر context،
 * وكل async effect بيحفظ snapshot منه في بدايته. لو الـpromise رجع بعد ما الـcounter
 * اتغيَّر (يعني المريض اتنقل لرابط تاني)، نتجاهل الـresponse عشان ميكتبش فوق
 * الحالة الجديدة. ده أنظف من isCancelled flag محلّي لأنه مركزي ويغطّي كل الـeffects.
 */
import { useEffect, useRef, useState } from 'react';

import { firestoreService } from '../../../services/firestore';
import type { PublicBookingSlot, PublicBranchInfo } from '../../../types';

type DoctorSummary = { doctorName: string; doctorSpecialty: string };

type PublicConfig = { userId: string; title?: string; contactInfo?: string };

export const usePublicBookingBootstrap = (
  slugParam: string,
  secretParam: string,
  userIdRouteParam: string,
) => {
  const [userIdParam, setUserIdParam] = useState<string>(userIdRouteParam);
  const [secret, setSecret] = useState(secretParam);
  const [resolvingSecret, setResolvingSecret] = useState(!secretParam);

  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [slots, setSlots] = useState<PublicBookingSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [branches, setBranches] = useState<PublicBranchInfo[]>([]);
  const [doctorSummary, setDoctorSummary] = useState<DoctorSummary>({
    doctorName: '',
    doctorSpecialty: '',
  });

  const userId = config?.userId || userIdParam || null;

  // ─── رقم طلب الـcontext (Request ID Counter) ───
  // بيزيد مع كل تغيُّر في الـrouting params. كل async effect بيحفظ snapshot منه
  // في بدايته، ويتأكد إن الـcounter ما اتغيَّرش قبل ما يكتب على الـstate. كده لو
  // المريض اتنقل لرابط حجز تاني وقت ما طلب قديم لسه شغّال، الرد القديم بيتجاهل
  // فوراً (race condition prevention).
  const contextRequestIdRef = useRef(0);

  // ─── Reset state عند تغيُّر الـcontext ───
  // قبل الإصلاح: لو المريض اتنقل بين روابط حجز مختلفة في نفس الـtab، الـstate
  // القديم (secret, config, slots, doctorSummary) كان بيفضل ظاهر للحظات قبل ما
  // يتحدّث، فممكن يشوف بيانات دكتور سابق. الحل: effect deps هي الـcontext params،
  // ولو اتغيّروا نـreset كل state مرتبط بدكتور لقيمه ابتدائيه، ونزوّد الـrequest id
  // عشان أي async رد قديم يتجاهل تلقائياً.
  useEffect(() => {
    contextRequestIdRef.current += 1;
    setUserIdParam(userIdRouteParam || '');
    setSecret(secretParam || '');
    setConfig(null);
    setSlots([]);
    setBranches([]);
    setDoctorSummary({ doctorName: '', doctorSpecialty: '' });
    setResolvingSecret(!secretParam);
    setConfigLoading(true);
    setSlotsLoading(true);
  }, [slugParam, userIdRouteParam, secretParam]);

  // ─── Slug → User ID lookup ───
  useEffect(() => {
    if (!slugParam) return;
    const myRequestId = contextRequestIdRef.current;

    (async () => {
      const resolvedUserId = await firestoreService.getUserIdByPublicSlug(slugParam);
      // الرد ده لطلب قديم؟ اخرج بدون setState
      if (contextRequestIdRef.current !== myRequestId) return;

      if (resolvedUserId) {
        setUserIdParam(resolvedUserId);
        setResolvingSecret(true);
      } else {
        // الـslug مش معروف — لو مفيش userIdRouteParam من الـURL، نمسح الـuserId
        // عشان الـsecondary effects ما تـtrigger بـuserId قديم.
        if (!userIdRouteParam) {
          setUserIdParam('');
        }
        setResolvingSecret(false);
      }
    })();
  }, [slugParam, userIdRouteParam]);

  // ─── Secret resolver (User ID → Public Secret) ───
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

    firestoreService
      .getPublicSecretByUserId(userIdParam)
      .then((s) => {
        if (contextRequestIdRef.current !== myRequestId) return;
        if (s) setSecret(s);
        setResolvingSecret(false);
      })
      .catch((err) => {
        if (contextRequestIdRef.current !== myRequestId) return;
        console.error('[PublicForm] getPublicSecretByUserId error:', err);
        setResolvingSecret(false);
      });
  }, [userIdParam, secretParam]);

  // ─── Public config subscription ───
  // ده subscription مش one-shot fetch — الـcleanup function (unsub) بتقفله صح
  // لما الـeffect يـrerun. بس برضه بنحط الـcounter check في الـcallback عشان لو
  // الـsubscription أصدر event بعد ما الـcontext اتغيَّر، الـrender ميتلخبطش.
  useEffect(() => {
    if (resolvingSecret) return;
    if (!secret) {
      setConfigLoading(false);
      return;
    }

    const myRequestId = contextRequestIdRef.current;

    const unsub = firestoreService.subscribeToPublicConfig(secret, (c) => {
      if (contextRequestIdRef.current !== myRequestId) return;
      setConfig((prev) => ({ userId: prev?.userId || userIdParam || '', ...c }));
      setConfigLoading(false);
    });

    return () => unsub();
  }, [secret, resolvingSecret, userIdParam]);

  // ─── Doctor ad (الاسم والتخصص) ───
  useEffect(() => {
    if (!userIdParam) return;
    const myRequestId = contextRequestIdRef.current;

    firestoreService
      .getDoctorAdByDoctorId(userIdParam)
      .then((ad) => {
        if (contextRequestIdRef.current !== myRequestId) return;

        if (!ad) {
          setDoctorSummary({ doctorName: '', doctorSpecialty: '' });
          return;
        }

        setDoctorSummary({
          doctorName: ad.doctorName || '',
          doctorSpecialty: ad.doctorSpecialty || '',
        });
      })
      .catch(() => {
        if (contextRequestIdRef.current !== myRequestId) return;
        setDoctorSummary({ doctorName: '', doctorSpecialty: '' });
      });
  }, [userIdParam]);

  // ─── Public slots (المواعيد المتاحه) ───
  useEffect(() => {
    if (resolvingSecret) return;
    if (!secret) {
      setSlotsLoading(false);
      return;
    }

    const myRequestId = contextRequestIdRef.current;

    // catch + finally — لو الـpromise رفض (شبكه/صلاحيات)، الـloading كان يفضل true
    // والمريض يشوف "تحميل المواعيد" للأبد. الإصلاح يضمن إن الـloading يقفل في كل
    // الحالات، ونعرض قائمه فاضيه (المريض يشوف "لا توجد مواعيد متاحه").
    firestoreService
      .getPublicSlots(secret)
      .then((list) => {
        if (contextRequestIdRef.current !== myRequestId) return;
        setSlots(list);
      })
      .catch((err) => {
        if (contextRequestIdRef.current !== myRequestId) return;
        console.warn('[PublicBooking] getPublicSlots failed:', err);
        setSlots([]);
      })
      .finally(() => {
        if (contextRequestIdRef.current !== myRequestId) return;
        setSlotsLoading(false);
      });
  }, [secret, resolvingSecret]);

  // ─── Public branches (الفروع المنشوره) ───
  useEffect(() => {
    if (resolvingSecret || !secret) return;
    const myRequestId = contextRequestIdRef.current;

    firestoreService
      .getPublicBranches(secret)
      .then((list) => {
        if (contextRequestIdRef.current !== myRequestId) return;
        setBranches(list.filter((b) => b.isActive !== false));
      })
      .catch(() => {
        if (contextRequestIdRef.current !== myRequestId) return;
        setBranches([]);
      });
  }, [secret, resolvingSecret]);

  return {
    userId,
    userIdParam,
    secret,
    resolvingSecret,
    config,
    configLoading,
    slots,
    slotsLoading,
    doctorSummary,
    branches,
  };
};
