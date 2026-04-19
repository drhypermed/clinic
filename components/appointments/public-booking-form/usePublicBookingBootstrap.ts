/**
 * الملف: usePublicBookingBootstrap.ts (Hook)
 * الوصف: "محرك التهيئة" لفورم الجمهور. 
 * هذا الـ Hook هو أول ما يعمل عند فتح الرابط، ومسؤول عن: 
 * 1. تحويل الـ Slug (الاسم اللطيف في الرابط) إلى معرف الطبيب (User ID). 
 * 2. جلب "المفتاح السري" (Public Secret) الخاص بالعيادة. 
 * 3. تحميل إعدادات العيادة (العنوان، بيانات التواصل). 
 * 4. جلب قائمة المواعيد المتاحة (Slots) ليتم عرضها للمريض. 
 * يضمن الـ Hook أن الصفحة لن تعرض أي بيانات قبل التأكد من صحة الرابط تماماً.
 */
import { useEffect, useState } from 'react';

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

  useEffect(() => {
    if (userIdRouteParam) {
      setUserIdParam(userIdRouteParam);
      setResolvingSecret(!secretParam);
    }
  }, [userIdRouteParam, secretParam]);

  useEffect(() => {
    if (!slugParam) return;

    let isCancelled = false;

    (async () => {
      const resolvedUserId = await firestoreService.getUserIdByPublicSlug(slugParam);
      if (isCancelled) return;

      if (resolvedUserId) {
        setUserIdParam(resolvedUserId);
        setResolvingSecret(true);
      } else {
        setResolvingSecret(false);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [slugParam]);

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

    firestoreService
      .getPublicSecretByUserId(userIdParam)
      .then((s) => {
        if (s) setSecret(s);
        setResolvingSecret(false);
      })
      .catch((err) => {
        console.error('[PublicForm] getPublicSecretByUserId error:', err);
        setResolvingSecret(false);
      });
  }, [userIdParam, secretParam]);

  useEffect(() => {
    if (resolvingSecret) return;
    if (!secret) {
      setConfigLoading(false);
      return;
    }

    const unsub = firestoreService.subscribeToPublicConfig(secret, (c) => {
      setConfig((prev) => ({ userId: prev?.userId || userIdParam || '', ...c }));
      setConfigLoading(false);
    });

    return () => unsub();
  }, [secret, resolvingSecret, userIdParam]);

  useEffect(() => {
    if (!userIdParam) return;

    let isCancelled = false;

    firestoreService
      .getDoctorAdByDoctorId(userIdParam)
      .then((ad) => {
        if (isCancelled) return;

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
        if (isCancelled) return;
        setDoctorSummary({ doctorName: '', doctorSpecialty: '' });
      });

    return () => {
      isCancelled = true;
    };
  }, [userIdParam]);

  useEffect(() => {
    if (resolvingSecret) return;
    if (!secret) {
      setSlotsLoading(false);
      return;
    }

    let isCancelled = false;

    firestoreService.getPublicSlots(secret).then((list) => {
      if (isCancelled) return;
      setSlots(list);
      setSlotsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [secret, resolvingSecret]);

  // تحميل الفروع المنشورة من publicBookingConfig
  useEffect(() => {
    if (resolvingSecret || !secret) return;
    let cancelled = false;
    firestoreService.getPublicBranches(secret).then((list) => {
      if (!cancelled) setBranches(list.filter((b) => b.isActive !== false));
    }).catch(() => { if (!cancelled) setBranches([]); });
    return () => { cancelled = true; };
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

