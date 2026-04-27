/**
 * الملف: usePublicBookingPublicSection.ts (Hook)
 * الوصف: "مدير المواعيد الإلكترونية". 
 * هذا الملف مسؤول عن الجانب "العام" (Public) من الحجز: 
 * 1. توليد وإدارة "رابط الحجز للجمهور" (Public Booking Link). 
 * 2. إضافة "فتحات حجز" (Slots) متاحة للمرضى أونلاين في توقيتات محددة. 
 * 3. حذف الفتحات أو المواعيد الملغاة. 
 * 4. تزويد السكرتير بخيارات لنسخ الرابط ومشاركته مع المرضى عبر واتساب أو غيره.
 */
import { useEffect, useMemo, useRef, useState } from 'react';

import type { FormEvent } from 'react';
import { firestoreService } from '../../../services/firestore';
import type { Branch, PublicBookingSlot, PublicBranchInfo } from '../../../types';
import { formatUserDate, formatUserTime } from '../../../utils/cairoTime';
import { useCopyFeedback } from '../../../hooks/useCopyFeedback';
import { buildLocalDateTime, currentTimeMin, toLocalDateStr } from '../utils';
import { getDefaultTimeStr } from './helpers';
import { DEFAULT_BRANCH_ID } from '../../../services/firestore/branches';

type UsePublicBookingPublicSectionParams = {
  userId: string;
  currentDayStr: string;
  branches: Branch[];
  activeBranchId: string;
};

export const usePublicBookingPublicSection = ({
  userId,
  currentDayStr,
  branches,
  activeBranchId,
}: UsePublicBookingPublicSectionParams) => {
  const [publicSectionOpen, setPublicSectionOpen] = useState(false);
  const [publicSecret, setPublicSecret] = useState<string | null>(null);
  const [publicSlotsAll, setPublicSlotsAll] = useState<PublicBookingSlot[]>([]);
  const [publicSlotsLoading, setPublicSlotsLoading] = useState(false);
  const [publicSlotDateStr, setPublicSlotDateStr] = useState(() => toLocalDateStr(new Date()));
  const [publicSlotTimeStr, setPublicSlotTimeStr] = useState('');
  const [publicSlotAdding, setPublicSlotAdding] = useState(false);
  const [publicSlotError, setPublicSlotError] = useState<string | null>(null);
  const { copied: publicLinkCopied, copy: copyPublicBookingLinkToClipboard } = useCopyFeedback();
  const [branchAddresses, setBranchAddresses] = useState<Record<string, string>>({});
  const [branchAddressesSaving, setBranchAddressesSaving] = useState(false);

  const currentBranchId = activeBranchId || DEFAULT_BRANCH_ID;

  // فلترة المواعيد: كل فرع يشوف مواعيده فقط.
  // المواعيد القديمة (بدون branchId) تظهر في الفرع الرئيسي.
  const publicSlots = useMemo(() => {
    return publicSlotsAll.filter((slot) => {
      const slotBranch = slot.branchId || DEFAULT_BRANCH_ID;
      return slotBranch === currentBranchId;
    });
  }, [publicSlotsAll, currentBranchId]);

  const publicBookingLink = useMemo(() => {
    if (!publicSecret) return null;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/book-public/s/${publicSecret}`;
  }, [publicSecret]);

  const publicSlotTodayStr = currentDayStr;
  const publicTimeMin = publicSlotDateStr === publicSlotTodayStr ? currentTimeMin() : undefined;

  // Counter يزيد مع كل تغيُّر userId — يحمي من stale async responses عشان الرابط
  // العام ميـلصق-ش بدكتور سابق لو اتنقلنا لرابط تاني وقت ما الـlookup شغّال.
  const secretRequestIdRef = useRef(0);

  useEffect(() => {
    // مسح الـsecret القديم فوراً عند تغيُّر userId — قبل الإصلاح كان بيفضل
    // معلَّق بقيمته القديمه لو الـlookup الجديد فشل أو رجع null.
    secretRequestIdRef.current += 1;
    setPublicSecret(null);

    if (!userId) return;
    const myRequestId = secretRequestIdRef.current;

    firestoreService.getPublicSecretByUserId(userId).then((s) => {
      if (secretRequestIdRef.current !== myRequestId) return;
      // s ممكن يكون null/undefined لو الدكتور ما عملش publish — نحط القيمه كما هي
      // (null) عشان نعكس الواقع بدل ما نسيب سر قديم متعلق.
      setPublicSecret(s || null);
    }).catch((err) => {
      if (secretRequestIdRef.current !== myRequestId) return;
      console.error('[Secretary] Failed to resolve public secret:', err);
      setPublicSecret(null);
    });
  }, [userId]);

  useEffect(() => {
    if (!publicSectionOpen || !publicSecret) return;
    setPublicSlotsLoading(true);
    const unsub = firestoreService.subscribeToPublicSlots(publicSecret, (slots) => {
      setPublicSlotsAll(slots);
      setPublicSlotsLoading(false);
    });
    return () => unsub();
  }, [publicSectionOpen, publicSecret]);

  useEffect(() => {
    if (!publicSectionOpen) return;
    setPublicSlotError(null);
    setPublicSlotTimeStr(getDefaultTimeStr());
  }, [publicSectionOpen]);

  // sync الفروع إلى publicBookingConfig + تحميل العناوين المخزنة
  useEffect(() => {
    if (!publicSectionOpen || !publicSecret || branches.length === 0) return;
    let cancelled = false;

    (async () => {
      try {
        // 1. اقرأ العناوين الموجودة حالياً في publicBookingConfig
        const existing = await firestoreService.getPublicBranches(publicSecret);
        if (cancelled) return;
        const addressMap: Record<string, string> = {};
        existing.forEach((b) => { if (b.address) addressMap[b.id] = b.address; });
        setBranchAddresses(addressMap);

        // 2. إذا الأسماء في publicBookingConfig تختلف عن useBranches → حدّثها (بدون مسح العناوين)
        const toPublish: PublicBranchInfo[] = branches.map((b) => ({
          id: b.id,
          name: b.name,
          address: addressMap[b.id] || undefined,
          isActive: true,
        }));
        const existingJson = JSON.stringify(existing.map((b) => ({ id: b.id, name: b.name, address: b.address || '' })));
        const newJson = JSON.stringify(toPublish.map((b) => ({ id: b.id, name: b.name, address: b.address || '' })));
        if (existingJson !== newJson) {
          await firestoreService.savePublicBranches(publicSecret, toPublish);
        }
      } catch (err) {
        if (!cancelled) console.warn('[PublicBooking] branches sync failed:', err);
      }
    })();

    return () => { cancelled = true; };
  }, [publicSectionOpen, publicSecret, branches]);

  const saveBranchAddress = async (branchId: string, address: string) => {
    if (!publicSecret || branches.length === 0) return;
    setBranchAddressesSaving(true);
    try {
      const trimmed = address.trim();
      const nextMap = { ...branchAddresses };
      if (trimmed) nextMap[branchId] = trimmed; else delete nextMap[branchId];
      setBranchAddresses(nextMap);
      const toPublish: PublicBranchInfo[] = branches.map((b) => ({
        id: b.id,
        name: b.name,
        address: nextMap[b.id] || undefined,
        isActive: true,
      }));
      await firestoreService.savePublicBranches(publicSecret, toPublish);
    } finally {
      setBranchAddressesSaving(false);
    }
  };

  const branchNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    branches.forEach((b) => { map[b.id] = b.name; });
    return map;
  }, [branches]);

  const addPublicSlot = async (e: FormEvent) => {
    e.preventDefault();
    setPublicSlotError(null);
    if (!userId || !publicSecret) {
      setPublicSlotError('تعذر إضافة الموعد. تحقق من الرابط.');
      return;
    }
    if (!publicSlotDateStr || !publicSlotTimeStr) {
      setPublicSlotError('يرجى اختيار التاريخ والوقت.');
      return;
    }
    const dt = buildLocalDateTime(publicSlotDateStr, publicSlotTimeStr);
    if (Number.isNaN(dt.getTime())) {
      setPublicSlotError('تاريخ أو وقت غير صالح.');
      return;
    }
    if (dt.getTime() < Date.now()) {
      setPublicSlotError('لا يمكن إضافة موعد في الماضي.');
      return;
    }
    setPublicSlotAdding(true);
    try {
      // الموعد يتحفظ تلقائياً على الفرع النشط حالياً — مفيش اختيار يدوي
      await firestoreService.addPublicSlot(userId, publicSecret, dt.toISOString(), currentBranchId);
      setPublicSlotDateStr(toLocalDateStr(new Date()));
      setPublicSlotTimeStr(getDefaultTimeStr());
    } finally {
      setPublicSlotAdding(false);
    }
  };

  const removePublicSlot = async (slotId: string) => {
    if (!publicSecret) return;
    try {
      await firestoreService.deletePublicSlot(publicSecret, slotId);
    } catch (err) {
      console.error('[Secretary] Failed to delete public slot:', err);
    }
  };

  const copyPublicBookingLink = () => {
    if (!publicBookingLink) return;
    copyPublicBookingLinkToClipboard(publicBookingLink, {
      onError: (error) => console.error('[Secretary] Failed to copy public booking link:', error),
    });
  };

  // ما عدش بنحتاج نعرض اسم الفرع لأن القائمة بتعرض فرع واحد فقط (النشط حالياً)
  const formatSlotLabel = (dateTime: string) => {
    return formatUserDate(dateTime, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }, 'ar-EG') +
      ' — ' + formatUserTime(dateTime, { hour: '2-digit', minute: '2-digit' }, 'ar-EG');
  };

  // مرجع غير مستخدم لكن محفوظ لو احتجنا مستقبلاً
  void branchNameMap;

  return {
    publicSectionOpen,
    setPublicSectionOpen,
    publicSecret,
    publicSlots,
    publicSlotsLoading,
    publicSlotDateStr,
    setPublicSlotDateStr,
    publicSlotTimeStr,
    setPublicSlotTimeStr,
    publicSlotAdding,
    publicSlotError,
    publicLinkCopied,
    publicBookingLink,
    publicSlotTodayStr,
    publicTimeMin,
    addPublicSlot,
    removePublicSlot,
    copyPublicBookingLink,
    formatSlotLabel,
    branchAddresses,
    branchAddressesSaving,
    saveBranchAddress,
    currentBranchId,
  };
};


