import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type {
  CustomBox,
  PublicBookingSlot,
  SecretaryVitalFieldDefinition,
  VitalSignConfig,
  SecretaryVitalsVisibility,
} from '../../../types';
import { firestoreService } from '../../../services/firestore';
import { branchesService } from '../../../services/firestore/branches';
import { useBranches } from '../../../hooks/useBranches';
import { useCopyFeedback } from '../../../hooks/useCopyFeedback';
import { buildLocalDateTime, currentTimeMin, toLocalDateStr } from '../utils';
import {
  buildSecretaryVitalFieldDefinitions,
  buildSecretaryVisibilityByFieldDefinitions,
  createDefaultSecretaryVitalsVisibility,
  normalizeSecretaryVitalFieldDefinitions,
  normalizeSecretaryVitalsVisibility,
} from '../../../utils/secretaryVitals';
/**
 * الملف: useBookingSectionControls.ts (Hook)
 * الوصف: هذا الـ Hook مسؤول عن "إدارة روابط الحجز" بمختلف أنواعها. 
 * يتحكم في: 
 * 1. حجز السكرتارية: توليد الرابط السري، ضبط كلمة المرور، وتغيير عنوان النموذج. 
 * 2. حجز الجمهور: توليد الرابط العام، وتخصيص رسائل التواصل. 
 * 3. المواعيد المتاحة (Slots): إضافة وحذف فترات زمنية محددة ليقوم المرضى بالحجز فيها من الخارج. 
 * يضمن الـ Hook بقاء كافة الإعدادات متزامنة مع قاعدة البيانات وتحديث الروابط فورياً.
 */

interface UseBookingSectionControlsArgs {
  userId: string;
  bookingSecret: string | null;
  onBookingSecretReady?: (secret: string) => void;
  prescriptionVitalsConfig?: VitalSignConfig[];
  prescriptionCustomBoxes?: CustomBox[];
  onSyncSecretaryVitalsVisibility?: (
    visibility: SecretaryVitalsVisibility,
    fields: SecretaryVitalFieldDefinition[],
    resolvedSecret?: string
  ) => Promise<void> | void;
  userDisplayName?: string | null;
  userEmail?: string | null;
  currentDayStr: string;
}

export const useBookingSectionControls = ({
  userId,
  bookingSecret,
  onBookingSecretReady,
  prescriptionVitalsConfig,
  prescriptionCustomBoxes,
  onSyncSecretaryVitalsVisibility,
  userDisplayName,
  userEmail,
  currentDayStr,
}: UseBookingSectionControlsArgs) => {
  // قائمة الفروع — لإظهار اسم الفرع النشط في UI كلمة سر السكرتارية
  const branchesHook = useBranches(userId || null);
  const currentBranchLabel = useMemo(() => {
    const match = branchesHook.branches.find((b) => b.id === branchesHook.activeBranchId);
    return match?.name || '';
  }, [branchesHook.branches, branchesHook.activeBranchId]);
  const hasMultipleBranches = branchesHook.branches.length > 1;

  // حالة روابط حجز السكرتارية
  const [bookingLink, setBookingLink] = useState<string | null>(null);
  const { copied: linkCopied, copy: copyBookingLinkToClipboard } = useCopyFeedback();
  const [credentialsSaving, setCredentialsSaving] = useState(false);
  const [credentialsError, setCredentialsError] = useState<string | null>(null);
  const [credentialsSuccess, setCredentialsSuccess] = useState(false);
  const [bookingSectionOpen, setBookingSectionOpen] = useState(false);
  const [bookingFormTitle, setBookingFormTitle] = useState('');
  const [secretaryPassword, setSecretaryPassword] = useState('');
  const [secretaryPasswordTouched, setSecretaryPasswordTouched] = useState(false);
  const [secretarySettingsHydrated, setSecretarySettingsHydrated] = useState(false);
  const prescriptionSecretaryFields = useMemo(
    () => buildSecretaryVitalFieldDefinitions(prescriptionVitalsConfig, prescriptionCustomBoxes),
    [prescriptionVitalsConfig, prescriptionCustomBoxes]
  );
  const [secretaryVitalFields, setSecretaryVitalFields] = useState<SecretaryVitalFieldDefinition[]>(
    () => normalizeSecretaryVitalFieldDefinitions(prescriptionSecretaryFields)
  );
  const [secretaryVitalsVisibility, setSecretaryVitalsVisibility] = useState<SecretaryVitalsVisibility>(
    () => buildSecretaryVisibilityByFieldDefinitions(prescriptionSecretaryFields, createDefaultSecretaryVitalsVisibility())
  );
  const [secretarySettingsDirty, setSecretarySettingsDirty] = useState(false);

  // حالة روابط حجز الجمهور العام
  const [publicBookingLink, setPublicBookingLink] = useState<string | null>(null);
  const [publicBookingSecret, setPublicBookingSecret] = useState<string | null>(null);
  const [publicSectionOpen, setPublicSectionOpen] = useState(false);
  const [publicSlots, setPublicSlots] = useState<PublicBookingSlot[]>([]);
  const [publicSlotDateStr, setPublicSlotDateStr] = useState(() => toLocalDateStr(new Date()));
  const [publicSlotTimeStr, setPublicSlotTimeStr] = useState('');
  const { copied: publicLinkCopied, copy: copyPublicLinkToClipboard } = useCopyFeedback();
  const [publicSlotAdding, setPublicSlotAdding] = useState(false);
  const [publicFormTitle, setPublicFormTitle] = useState('');
  const [publicFormContactInfo, setPublicFormContactInfo] = useState('');
  const [publicFormSaving, setPublicFormSaving] = useState(false);
  const [isPublicSettingsSaved, setIsPublicSettingsSaved] = useState(false);

  // 1. جلب أو توليد المعرف السري لروابط حجز السكرتارية
  useEffect(() => {
    if (!userId || bookingSecret != null || !onBookingSecretReady) return;
    firestoreService.getOrCreateBookingSecret(userId).then(onBookingSecretReady);
  }, [userId, bookingSecret, onBookingSecretReady]);

  // 2. تحديث رابط حجز السكرتارية عند توفر المعرف السري
  useEffect(() => {
    if (!userId || !bookingSecret) { setBookingLink(null); return; }
    setBookingLink(`${window.location.origin}/book/s/${bookingSecret}`);
  }, [userId, bookingSecret]);

  // 3. جلب أو توليد المعرف السري لروابط الجمهور (Public)
  useEffect(() => {
    if (!userId) return;
    firestoreService.getOrCreatePublicBookingSecret(userId).then((secret) => {
      setPublicBookingSecret(secret);
      setPublicBookingLink(`${window.location.origin}/book-public/s/${secret}`);
    });
  }, [userId]);

  // 4. مزامنة فترات الحجز المتاحة (Slots) للجمهور
  useEffect(() => {
    if (!publicSectionOpen || !publicBookingSecret) return;
    return firestoreService.subscribeToPublicSlots(publicBookingSecret, setPublicSlots);
  }, [publicSectionOpen, publicBookingSecret]);

  // Counter لحماية بيانات نموذج الجمهور من stale responses عند تغيُّر الـsecret.
  const publicFormRequestIdRef = useRef(0);

  // 5. جلب إعدادات نموذج حجز الجمهور
  useEffect(() => {
    if (!publicSectionOpen || !publicBookingSecret) return;

    publicFormRequestIdRef.current += 1;
    const myRequestId = publicFormRequestIdRef.current;

    // مسح الحقول القديمه فوراً عند تغيُّر الـsecret — قبل الإصلاح، لو الـconfig
    // رجع null أو الـpromise رفض، الحقول كانت تفضل بقيم دكتور سابق وممكن
    // تتحفظ بالغلط على السياق الحالي.
    setPublicFormTitle('');
    setPublicFormContactInfo('');

    firestoreService.getPublicBookingConfig(publicBookingSecret)
      .then((config) => {
        if (publicFormRequestIdRef.current !== myRequestId) return;
        // null = الدكتور ما عملش publish لإعدادات بعد — نسيب الحقول فاضيه
        // (المسح اللي عملناه فوق) عشان السكرتيره تكتب من الصفر للسياق الحالي.
        if (config) {
          setPublicFormTitle(config.title ?? '');
          setPublicFormContactInfo(config.contactInfo ?? '');
        }
      })
      .catch((err) => {
        if (publicFormRequestIdRef.current !== myRequestId) return;
        console.warn('[Secretary] Failed to load public booking config:', err);
        // الحقول اتمسحت فوق فعلاً — مفيش لازم نعمل setState تاني، بس لو رجع
        // الاتصال هي تظهر فاضيه بدل قيم قديمه ضلّاله.
      });
  }, [publicSectionOpen, publicBookingSecret]);

  // Counter يزيد مع كل تغيُّر context للسكرتارية (secret/branch/user) — يحمي من
  // stale async responses لو السكرتيره بدّلت الفرع بسرعه ورد قديم رجع بعد الجديد.
  const secretarySettingsRequestIdRef = useRef(0);

  // 6. تحميل إعدادات السكرتارية (كلمة المرور وعنوان النموذج)
  useEffect(() => {
    if (!bookingSecret) return;
    const activeBranchId = branchesHook.activeBranchId;
    // نوقف الـ auto-save أثناء إعادة التحميل لفرع جديد حتى لا يُحفظ بيانات قديمة
    setSecretarySettingsHydrated(false);
    setSecretarySettingsDirty(false);

    secretarySettingsRequestIdRef.current += 1;
    const myRequestId = secretarySettingsRequestIdRef.current;

    // ─ مسار الخطأ المشترك ─
    // قبل الإصلاح: لو الـpromise رفض، secretarySettingsHydrated يفضل false → زر
    // الحفظ بيبقى بلا تأثير (performSaveBookingCredentials بيخرج early). الإصلاح:
    // نضع القيم الافتراضيه ونـset hydrated=true عشان الواجهه ترجع تشتغل.
    const handleLoadFailure = (err: unknown) => {
      if (secretarySettingsRequestIdRef.current !== myRequestId) return;
      console.warn('[Secretary] Failed to load booking settings:', err);
      setBookingFormTitle('');
      setSecretaryPassword('');
      setSecretaryPasswordTouched(false);
      const fallbackFields = normalizeSecretaryVitalFieldDefinitions(prescriptionSecretaryFields);
      setSecretaryVitalFields(fallbackFields);
      setSecretaryVitalsVisibility(
        buildSecretaryVisibilityByFieldDefinitions(fallbackFields, createDefaultSecretaryVitalsVisibility())
      );
      setSecretarySettingsHydrated(true);
    };

    firestoreService.getBookingConfig(bookingSecret, activeBranchId)
      .then((config) => {
        // الرد ده لطلب قديم؟ اخرج بدون setState
        if (secretarySettingsRequestIdRef.current !== myRequestId) return;

        if (!userId) {
          setBookingFormTitle(config?.formTitle ?? '');
          setSecretaryPassword('');
          setSecretaryPasswordTouched(false);
          const rawVisibility = config?.secretaryVitalsVisibility;
          const nextFields = normalizeSecretaryVitalFieldDefinitions(
            config?.secretaryVitalFields,
            prescriptionSecretaryFields
          );
          setSecretaryVitalFields(nextFields);
          setSecretaryVitalsVisibility(
            buildSecretaryVisibilityByFieldDefinitions(
              nextFields,
              rawVisibility ? normalizeSecretaryVitalsVisibility(rawVisibility) : undefined
            )
          );
          setSecretarySettingsHydrated(true);
          return;
        }
        firestoreService.getBookingConfigByUserId(userId, activeBranchId)
          .then((legacyConfig) => {
            if (secretarySettingsRequestIdRef.current !== myRequestId) return;
            setBookingFormTitle((config?.formTitle ?? '').trim() || legacyConfig?.formTitle || '');
            setSecretaryPassword((legacyConfig?.secretaryPasswordPlain ?? '').trim());
            const nextFields = normalizeSecretaryVitalFieldDefinitions(
              config?.secretaryVitalFields || legacyConfig?.secretaryVitalFields,
              prescriptionSecretaryFields
            );
            const rawVisibility = config?.secretaryVitalsVisibility || legacyConfig?.secretaryVitalsVisibility;
            const nextVisibility = buildSecretaryVisibilityByFieldDefinitions(
              nextFields,
              rawVisibility ? normalizeSecretaryVitalsVisibility(rawVisibility) : undefined
            );

            setSecretaryVitalFields(nextFields);
            setSecretaryVitalsVisibility(nextVisibility);
            setSecretaryPasswordTouched(false);
            setSecretarySettingsHydrated(true);
          })
          .catch(handleLoadFailure);
      })
      .catch(handleLoadFailure);
  }, [bookingSecret, prescriptionSecretaryFields, userId, branchesHook.activeBranchId]);

  useEffect(() => {
    if (!secretarySettingsHydrated || secretarySettingsDirty) return;

    const nextFields = normalizeSecretaryVitalFieldDefinitions(prescriptionSecretaryFields);
    const nextVisibility = buildSecretaryVisibilityByFieldDefinitions(nextFields, secretaryVitalsVisibility);

    const fieldsChanged = JSON.stringify(secretaryVitalFields) !== JSON.stringify(nextFields);
    const visibilityChanged =
      JSON.stringify(normalizeSecretaryVitalsVisibility(secretaryVitalsVisibility)) !==
      JSON.stringify(normalizeSecretaryVitalsVisibility(nextVisibility));

    if (fieldsChanged) {
      setSecretaryVitalFields(nextFields);
    }
    if (visibilityChanged) {
      setSecretaryVitalsVisibility(nextVisibility);
    }
  }, [
    prescriptionSecretaryFields,
    secretarySettingsHydrated,
    secretarySettingsDirty,
    secretaryVitalFields,
    secretaryVitalsVisibility,
  ]);

  /**
   * حفظ إعدادات السكرتارية (Save Secretary Settings).
   * تقوم هذه الدالة بتحديث كلمة المرور وعنوان نموذج الحجز في Firestore.
   * تدعم الدالة عملية "توليد المعرف السري" (Secret Key) لأول مرة إذا لم يكن موجوداً.
   * تُستدعى تلقائياً عبر الـ auto-save debounced، أو يدوياً من submit احتياطي.
   */
  const performSaveBookingCredentials = useCallback(async (): Promise<void> => {
    if (!userId) return;
    if (!secretarySettingsHydrated) return;
    if (credentialsSaving) return;

    // تحقق من طول الرقم السري للسكرتيرة (6 على الأقل) لو الطبيب غيّره فعلاً.
    // المستخدمون اللي مش بيغيّروا الباسورد معندهمش مشكلة لأن touched تفضل false.
    if (secretaryPasswordTouched) {
      const trimmedPass = secretaryPassword.trim();
      if (trimmedPass.length < 6) {
        setCredentialsError('الرقم السري للسكرتيرة لازم يكون 6 حروف/أرقام على الأقل.');
        return;
      }
    }

    setCredentialsError(null);
    setCredentialsSuccess(false);
    setCredentialsSaving(true);
    try {
      let resolvedSecret = bookingSecret;
      if (!resolvedSecret) {
        resolvedSecret = await firestoreService.getOrCreateBookingSecret(userId);
        onBookingSecretReady?.(resolvedSecret);
        setBookingLink(`${window.location.origin}/book/s/${resolvedSecret}`);
      }

      const pass = secretaryPasswordTouched ? secretaryPassword : undefined;
      const currentBranchId = branchesHook.activeBranchId
        || (userId ? branchesService.getActiveBranchId(userId) : undefined);
      await firestoreService.updateBookingSettings(
        userId,
        resolvedSecret,
        bookingFormTitle,
        (userDisplayName ?? '').trim(),
        pass,
        userEmail ?? undefined,
        secretaryVitalsVisibility,
        secretaryVitalFields,
        currentBranchId
      );

      if (onSyncSecretaryVitalsVisibility) {
        await onSyncSecretaryVitalsVisibility(
          secretaryVitalsVisibility,
          secretaryVitalFields,
          resolvedSecret
        );
      }

      if (secretaryPasswordTouched) {
        setSecretaryPassword(secretaryPassword.trim());
      }

      setSecretaryPasswordTouched(false);
      setSecretarySettingsDirty(false);
      setCredentialsSuccess(true);
      setTimeout(() => setCredentialsSuccess(false), 2000);
    } catch (err: any) {
      console.error('Saving secretary settings failed:', err);
      setCredentialsError(err?.message || 'تعذر حفظ إعدادات السكرتارية');
    } finally {
      setCredentialsSaving(false);
    }
  }, [
    userId,
    secretarySettingsHydrated,
    credentialsSaving,
    bookingSecret,
    onBookingSecretReady,
    secretaryPasswordTouched,
    secretaryPassword,
    bookingFormTitle,
    userDisplayName,
    userEmail,
    secretaryVitalsVisibility,
    secretaryVitalFields,
    branchesHook.activeBranchId,
    onSyncSecretaryVitalsVisibility,
  ]);

  const saveBookingCredentials = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    await performSaveBookingCredentials();
  }, [performSaveBookingCredentials]);

  /** نسخ رابط حجز السكرتارية */
  const copyBookingLink = () => {
    if (bookingLink) copyBookingLinkToClipboard(bookingLink);
  };

  /** نسخ رابط حجز الجمهور */
  const copyPublicLink = () => {
    if (publicBookingLink) copyPublicLinkToClipboard(publicBookingLink);
  };

  /** حفظ إعدادات نموذج حجز الجمهور يدوياً */
  const savePublicFormSettings = async (e: FormEvent) => {
    e.preventDefault();
    if (!publicBookingSecret || !userId) return;
    setPublicFormSaving(true);
    try {
      await firestoreService.savePublicFormSettings(userId, publicBookingSecret, publicFormTitle, publicFormContactInfo);
      setIsPublicSettingsSaved(true);
      setTimeout(() => setIsPublicSettingsSaved(false), 3000);
    } finally { setPublicFormSaving(false); }
  };

  /** إضافة فترة زمنية (Slot) جديدة لحيز الجمهور */
  const addPublicSlot = async (e: FormEvent) => {
    e.preventDefault();
    const dt = buildLocalDateTime(publicSlotDateStr, publicSlotTimeStr);
    if (!userId || !publicBookingSecret || Number.isNaN(dt.getTime()) || dt.getTime() < Date.now()) return;
    setPublicSlotAdding(true);
    try {
      await firestoreService.addPublicSlot(userId, publicBookingSecret, dt.toISOString());
      setPublicSlotTimeStr('');
    } finally { setPublicSlotAdding(false); }
  };

  /** حذف فترة زمنية متاحة للحجز */
  const removePublicSlot = (slotId: string) => {
    if (publicBookingSecret) firestoreService.deletePublicSlot(publicBookingSecret, slotId).catch(() => {});
  };

  return {
    bookingLink, linkCopied, copyBookingLink, credentialsSaving, credentialsError, credentialsSuccess,
    bookingSectionOpen, toggleBookingSection: () => setBookingSectionOpen(!bookingSectionOpen),
    bookingFormTitle, onBookingFormTitleChange: (v: string) => {
      setBookingFormTitle(v);
      setSecretarySettingsDirty(true);
      setCredentialsError(null);
      setCredentialsSuccess(false);
    },
    secretaryPassword, onSecretaryPasswordChange: (v: string) => {
      setSecretaryPassword(v);
      setSecretaryPasswordTouched(true);
      setSecretarySettingsDirty(true);
      setCredentialsError(null);
      setCredentialsSuccess(false);
    },
    secretaryVitalFields,
    secretaryVitalsVisibility,
    onSecretaryVitalVisibilityChange: (fieldId: string, enabled: boolean) => {
      const normalizedFieldId = String(fieldId || '').trim();
      if (!normalizedFieldId) return;
      setSecretaryVitalsVisibility((prev) =>
        buildSecretaryVisibilityByFieldDefinitions(secretaryVitalFields, {
          ...prev,
          [normalizedFieldId]: enabled,
        })
      );
      setSecretarySettingsDirty(true);
      setCredentialsError(null);
      setCredentialsSuccess(false);
    },
    saveBookingCredentials,
    publicBookingLink, publicBookingSecret, publicSectionOpen, togglePublicSection: () => setPublicSectionOpen(!publicSectionOpen),
    publicSlots, publicSlotDateStr, setPublicSlotDateStr, publicSlotTimeStr, setPublicSlotTimeStr,
    publicLinkCopied, copyPublicLink, publicSlotAdding, addPublicSlot, removePublicSlot,
    publicFormTitle, setPublicFormTitle, publicFormContactInfo, setPublicFormContactInfo,
    publicFormSaving, savePublicFormSettings, isPublicSettingsSaved, 
    publicSlotTodayStr: toLocalDateStr(new Date()), publicTimeMin: publicSlotDateStr === toLocalDateStr(new Date()) ? currentTimeMin() : undefined,
    currentBranchLabel,
    hasMultipleBranches,
  };
};
