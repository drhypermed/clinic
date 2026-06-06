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
import type { Branch, PublicBookingSlot } from '../../../types';
import { formatUserDate, formatUserTime } from '../../../utils/cairoTime';
import { useCopyFeedback } from '../../../hooks/useCopyFeedback';
import { appendBranchToPublicBookingUrl, buildPublicBookingUrl } from '../../../utils/publicBookingLinks';
import { buildLocalDateTime, currentTimeMin, toLocalDateStr } from '../utils';
import { getDefaultTimeStr } from './helpers';
import { DEFAULT_BRANCH_ID } from '../../../services/firestore/branches';

const pad2 = (value: number) => String(value).padStart(2, '0');

const toSlotInputParts = (dateTime: string) => {
  const date = new Date(dateTime);
  if (Number.isNaN(date.getTime())) return { dateStr: toLocalDateStr(new Date()), timeStr: getDefaultTimeStr() };
  return {
    dateStr: toLocalDateStr(date),
    timeStr: `${pad2(date.getHours())}:${pad2(date.getMinutes())}`,
  };
};

type UsePublicBookingPublicSectionParams = {
  userId: string;
  currentDayStr: string;
  branches: Branch[];
  activeBranchId: string;
  // مرآة publicBookingSecret من bookingConfig — لو متوفّر (الطبيب كاتبها)،
  // نستخدمه مباشرةً بدل lookup لأن السكرتيرة معندهاش صلاحية على publicBookingConfig.
  seededPublicSecret?: string | null;
  // الـ slug القصير من bookingConfig mirror — لو موجود نبني الرابط الـcanonical /p/{slug}.
  // لو غايب (data قديمه قبل التحديث)، نقع على الـsecret-based legacy URL.
  seededPublicSlug?: string | null;
};

export const usePublicBookingPublicSection = ({
  userId,
  currentDayStr,
  branches,
  activeBranchId,
  seededPublicSecret,
  seededPublicSlug,
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
  const [publicFormTitle, setPublicFormTitle] = useState('');
  const [publicFormContactInfo, setPublicFormContactInfo] = useState('');
  const [publicFormSaving, setPublicFormSaving] = useState(false);
  const [publicSettingsSaved, setPublicSettingsSaved] = useState(false);
  const [editingPublicSlotId, setEditingPublicSlotId] = useState<string | null>(null);
  const [editingPublicSlotDateStr, setEditingPublicSlotDateStr] = useState('');
  const [editingPublicSlotTimeStr, setEditingPublicSlotTimeStr] = useState('');
  const [publicSlotUpdating, setPublicSlotUpdating] = useState(false);

  const currentBranchId = activeBranchId || DEFAULT_BRANCH_ID;
  const currentBranchForLink = useMemo(() => {
    const matched = branches.find((branch) => branch.id === currentBranchId);
    return matched || { id: currentBranchId, name: currentBranchId };
  }, [branches, currentBranchId]);

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
    // الـ canonical الجديد: /p/{slug} لو الـslug متاح. fallback للـ legacy لو لأ.
    const slug = String(seededPublicSlug || '').trim();
    const baseLink = slug ? buildPublicBookingUrl(slug) : (userId ? buildPublicBookingUrl(userId) : null);
    if (!baseLink) return null;
    return appendBranchToPublicBookingUrl(baseLink, currentBranchForLink);
  }, [publicSecret, seededPublicSlug, userId, currentBranchForLink]);

  const publicSlotTodayStr = currentDayStr;
  const publicTimeMin = publicSlotDateStr === publicSlotTodayStr ? currentTimeMin() : undefined;

  // Counter يزيد مع كل تغيُّر userId — يحمي من stale async responses عشان الرابط
  // العام ميـلصق-ش بدكتور سابق لو اتنقلنا لرابط تاني وقت ما الـlookup شغّال.
  const secretRequestIdRef = useRef(0);

  useEffect(() => {
    // مسح الـsecret القديم فوراً عند تغيُّر userId — قبل الإصلاح كان بيفضل
    // معلَّق بقيمته القديمه لو الـlookup الجديد فشل أو رجع null.
    secretRequestIdRef.current += 1;

    // المسار الأساسي: لو الطبيب كاتب المرآه على bookingConfig (seededPublicSecret)،
    // نستخدمها فوراً — السكرتيرة معندهاش صلاحية على publicBookingConfig list ولا
    // قراءة users/{uid}، فالـ lookup هيرجع null دايماً.
    const seeded = String(seededPublicSecret || '').trim();
    if (seeded) {
      setPublicSecret(seeded);
      return;
    }

    setPublicSecret(null);
    if (!userId) return;
    const myRequestId = secretRequestIdRef.current;

    // fallback: lookup للحالات النادرة (الطبيب نفسه فاتح الصفحة، أو data قديمة
    // قبل ما المرآه تتكتب). سيفشل بصمت للسكرتيرة بسبب rules.
    firestoreService.getPublicSecretByUserId(userId).then((s) => {
      if (secretRequestIdRef.current !== myRequestId) return;
      setPublicSecret(s || null);
    }).catch((err) => {
      if (secretRequestIdRef.current !== myRequestId) return;
      console.warn('[Secretary] Failed to resolve public secret (expected for secretaries before mirror exists):', err);
      setPublicSecret(null);
    });
  }, [userId, seededPublicSecret]);

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

  useEffect(() => {
    if (!publicSectionOpen || !publicSecret) return;

    setPublicFormTitle('');
    setPublicFormContactInfo('');
    const unsub = firestoreService.subscribeToPublicConfig(publicSecret, (config) => {
      const branchSettings = config.publicFormSettingsByBranch?.[currentBranchId];
      const legacyTitle = currentBranchId === DEFAULT_BRANCH_ID ? config.title : '';
      const legacyContactInfo = currentBranchId === DEFAULT_BRANCH_ID ? config.contactInfo : '';
      setPublicFormTitle(branchSettings?.title ?? legacyTitle ?? '');
      setPublicFormContactInfo(branchSettings?.contactInfo ?? legacyContactInfo ?? '');
    });

    return () => unsub();
  }, [publicSectionOpen, publicSecret, currentBranchId]);

  const branchNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    branches.forEach((b) => { map[b.id] = b.name; });
    return map;
  }, [branches]);

  const savePublicFormSettings = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId || !publicSecret) return;
    setPublicFormSaving(true);
    setPublicSettingsSaved(false);
    try {
      await firestoreService.savePublicFormSettings(
        userId,
        publicSecret,
        publicFormTitle,
        publicFormContactInfo,
        true,
        currentBranchId,
      );
      setPublicSettingsSaved(true);
      setTimeout(() => setPublicSettingsSaved(false), 2500);
    } catch (err) {
      console.warn('[PublicBooking] failed to save public form settings:', err);
      setPublicSlotError('تعذر حفظ بيانات الفورم. حاول مرة أخرى.');
    } finally {
      setPublicFormSaving(false);
    }
  };

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

  const startEditPublicSlot = (slot: PublicBookingSlot) => {
    const parts = toSlotInputParts(slot.dateTime);
    setEditingPublicSlotId(slot.id);
    setEditingPublicSlotDateStr(parts.dateStr);
    setEditingPublicSlotTimeStr(parts.timeStr);
    setPublicSlotError(null);
  };

  const cancelEditPublicSlot = () => {
    setEditingPublicSlotId(null);
    setEditingPublicSlotDateStr('');
    setEditingPublicSlotTimeStr('');
    setPublicSlotUpdating(false);
  };

  const saveEditedPublicSlot = async (e: FormEvent) => {
    e.preventDefault();
    setPublicSlotError(null);
    if (!publicSecret || !editingPublicSlotId) return;
    if (!editingPublicSlotDateStr || !editingPublicSlotTimeStr) {
      setPublicSlotError('يرجى اختيار التاريخ والوقت.');
      return;
    }
    const dt = buildLocalDateTime(editingPublicSlotDateStr, editingPublicSlotTimeStr);
    if (Number.isNaN(dt.getTime())) {
      setPublicSlotError('تاريخ أو وقت غير صالح.');
      return;
    }
    if (dt.getTime() < Date.now()) {
      setPublicSlotError('لا يمكن حفظ موعد في الماضي.');
      return;
    }
    setPublicSlotUpdating(true);
    try {
      await firestoreService.updatePublicSlot(publicSecret, editingPublicSlotId, dt.toISOString(), currentBranchId);
      cancelEditPublicSlot();
    } catch (err) {
      console.warn('[PublicBooking] failed to update public slot:', err);
      setPublicSlotError('تعذر تعديل الموعد. حاول مرة أخرى.');
      setPublicSlotUpdating(false);
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
    publicFormTitle,
    setPublicFormTitle,
    publicFormContactInfo,
    setPublicFormContactInfo,
    publicFormSaving,
    publicSettingsSaved,
    savePublicFormSettings,
    addPublicSlot,
    removePublicSlot,
    editingPublicSlotId,
    editingPublicSlotDateStr,
    setEditingPublicSlotDateStr,
    editingPublicSlotTimeStr,
    setEditingPublicSlotTimeStr,
    publicSlotUpdating,
    startEditPublicSlot,
    cancelEditPublicSlot,
    saveEditedPublicSlot,
    copyPublicBookingLink,
    formatSlotLabel,
    currentBranchId,
  };
};


