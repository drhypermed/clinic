import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type {
  CustomBox,
  PublicBranchInfo,
  PublicBookingSlot,
  SecretaryVitalFieldDefinition,
  VitalSignConfig,
  SecretaryVitalsVisibility,
} from '../../../types';
import { firestoreService } from '../../../services/firestore';
import { DEFAULT_BRANCH_ID, branchesService, getAllBranchSecretsMap } from '../../../services/firestore/branches';
import { useBranches } from '../../../hooks/useBranches';
import { useCopyFeedback } from '../../../hooks/useCopyFeedback';
import { buildPublicBookingUrl } from '../../../utils/publicBookingLinks';
import { buildLocalDateTime, currentTimeMin, toLocalDateStr } from '../utils';
import {
  buildSecretaryVitalFieldDefinitions,
  buildSecretaryVisibilityByFieldDefinitions,
  createDefaultSecretaryVitalsVisibility,
  normalizeSecretaryVitalFieldDefinitions,
  normalizeSecretaryVitalsVisibility,
} from '../../../utils/secretaryVitals';
import {
  getSecretaryUsernameValidationMessage,
  normalizeSecretaryUsername,
} from '../../../utils/secretaryUsername';
import {
  getSecretaryUsernameSaveErrorMessage,
  setSecretaryUsername as saveSecretaryUsername,
} from '../../../services/secretaryUsernameService';

const pad2 = (value: number) => String(value).padStart(2, '0');

const toPublicSlotInputParts = (dateTime: string) => {
  const date = new Date(dateTime);
  if (Number.isNaN(date.getTime())) return { dateStr: toLocalDateStr(new Date()), timeStr: '' };
  return {
    dateStr: toLocalDateStr(date),
    timeStr: `${pad2(date.getHours())}:${pad2(date.getMinutes())}`,
  };
};
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
  doctorSpecialty?: string | null;
  activeBranchId?: string | null;
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
  doctorSpecialty,
  activeBranchId: activeBranchIdProp,
}: UseBookingSectionControlsArgs) => {
  // قائمة الفروع — لإظهار اسم الفرع النشط في UI كلمة سر السكرتارية
  const branchesHook = useBranches(userId || null);
  const effectiveActiveBranchId = activeBranchIdProp || branchesHook.activeBranchId;
  const currentBranchLabel = useMemo(() => {
    const match = branchesHook.branches.find((b) => b.id === effectiveActiveBranchId);
    return match?.name || '';
  }, [branchesHook.branches, effectiveActiveBranchId]);
  const effectivePublicBranchId = effectiveActiveBranchId || DEFAULT_BRANCH_ID;
  const hasMultipleBranches = branchesHook.branches.length > 1;
  const secretaryVitalSpecialtyOptions = useMemo(
    () => ({ doctorSpecialty }),
    [doctorSpecialty]
  );

  // حالة روابط حجز السكرتارية
  const [bookingLink, setBookingLink] = useState<string | null>(null);
  const { copied: linkCopied, copy: copyBookingLinkToClipboard } = useCopyFeedback();
  const [credentialsSaving, setCredentialsSaving] = useState(false);
  const [credentialsError, setCredentialsError] = useState<string | null>(null);
  const [credentialsSuccess, setCredentialsSuccess] = useState(false);
  const [bookingSectionOpen, setBookingSectionOpen] = useState(false);
  const [bookingFormTitle, setBookingFormTitle] = useState('');
  const [secretaryUsername, setSecretaryUsername] = useState('');
  const [secretaryPassword, setSecretaryPassword] = useState('');
  const [secretaryPasswordTouched, setSecretaryPasswordTouched] = useState(false);
  const [secretarySettingsHydrated, setSecretarySettingsHydrated] = useState(false);
  const prescriptionSecretaryFields = useMemo(
    () => buildSecretaryVitalFieldDefinitions(
      prescriptionVitalsConfig,
      prescriptionCustomBoxes,
      secretaryVitalSpecialtyOptions
    ),
    [prescriptionVitalsConfig, prescriptionCustomBoxes, secretaryVitalSpecialtyOptions]
  );
  const [secretaryVitalFields, setSecretaryVitalFields] = useState<SecretaryVitalFieldDefinition[]>(
    () => normalizeSecretaryVitalFieldDefinitions(
      prescriptionSecretaryFields,
      undefined,
      secretaryVitalSpecialtyOptions
    )
  );
  const [secretaryVitalsVisibility, setSecretaryVitalsVisibility] = useState<SecretaryVitalsVisibility>(
    () => buildSecretaryVisibilityByFieldDefinitions(
      prescriptionSecretaryFields,
      createDefaultSecretaryVitalsVisibility(secretaryVitalSpecialtyOptions),
      secretaryVitalSpecialtyOptions
    )
  );
  const [secretarySettingsDirty, setSecretarySettingsDirty] = useState(false);

  // حالة روابط حجز الجمهور العام
  const [publicBookingLink, setPublicBookingLink] = useState<string | null>(null);
  const [publicLinkError, setPublicLinkError] = useState(false);
  const [publicLinkRetryCount, setPublicLinkRetryCount] = useState(0);
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
  const [editingPublicSlotId, setEditingPublicSlotId] = useState<string | null>(null);
  const [editingPublicSlotDateStr, setEditingPublicSlotDateStr] = useState('');
  const [editingPublicSlotTimeStr, setEditingPublicSlotTimeStr] = useState('');
  const [publicSlotUpdating, setPublicSlotUpdating] = useState(false);

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

  // 3. جلب أو توليد المعرف السري + الـ slug القصير لرابط الجمهور
  // الرابط الـcanonical الجديد: /p/{slug} (8 حروف عشوائيه) بدل /book-public/s/{secret}
  // الـ slug أنظف للطبيب لما ينسخه على واتساب وأسهل للمريض يحفظه.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setPublicLinkError(false);
    (async () => {
      try {
        const {
          publicBookingSecret: secret,
          publicUrlSlug: slug,
        } = await firestoreService.ensurePublicBookingIdentity(userId);
        if (cancelled) return;
        setPublicBookingSecret(secret);
        setPublicBookingLink(buildPublicBookingUrl(slug));
      } catch (err) {
        if (cancelled) return;
        console.warn('[Booking] Failed to build public booking link:', err);
        setPublicLinkError(true);
      }
    })();
    return () => { cancelled = true; };
  }, [userId, publicLinkRetryCount]);

  /** إعادة محاولة تحميل رابط الجمهور بعد فشل سابق */
  const retryPublicLink = useCallback(() => {
    setPublicLinkError(false);
    setPublicLinkRetryCount((c) => c + 1);
  }, []);

  // 3.1 مرآة publicBookingSecret + publicUrlSlug على bookingConfig — السكرتيرة
  // محرومة من قراءة users/{uid} ومن list على publicBookingConfig، فبدون المرآة دي
  // مش هتعرف رابط الفورم العام. الـ slug جديد بقى ضمن المرآة (2026-05) عشان
  // الرابط الـcanonical /p/{slug} يبقى متاح للسكرتيرة كمان.
  const branchesSignature = useMemo(
    () => branchesHook.branches.map((branch) => `${branch.id}:${branch.name}`).sort().join('|'),
    [branchesHook.branches],
  );

  useEffect(() => {
    if (!userId || !bookingSecret || !publicBookingSecret) return;
    let cancelled = false;
    (async () => {
      try {
        const slug = await firestoreService.getOrCreatePublicUrlSlug(userId);
        if (cancelled) return;
        const branchSecretsMap = await getAllBranchSecretsMap(userId).catch(() => ({}));
        if (cancelled) return;
        const targetSecrets = Array.from(
          new Set(
            [bookingSecret, ...Object.values(branchSecretsMap)]
              .map((secret) => String(secret || '').trim())
              .filter(Boolean),
          ),
        );
        await Promise.all(
          targetSecrets.map((secret) =>
            firestoreService.mirrorPublicSecretToBookingConfig(
              secret,
              userId,
              publicBookingSecret,
              slug,
            ),
          ),
        );
      } catch (err) {
        if (cancelled) return;
        console.warn('[Booking] Failed to mirror public secret/slug to bookingConfig:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [userId, bookingSecret, publicBookingSecret, branchesSignature]);

  // 4. مزامنة فترات الحجز المتاحة (Slots) للجمهور
  // Keep the public patient link aware of every clinic branch. Without this mirror,
  // the public form can only see stale/partial branches and may fall back to main.
  useEffect(() => {
    if (!publicBookingSecret || branchesHook.branches.length === 0) return;
    let cancelled = false;

    (async () => {
      try {
        const existing = await firestoreService.getPublicBranches(publicBookingSecret);
        if (cancelled) return;

        const addressByBranchId = new Map(
          existing.map((branch) => [branch.id, branch.address || ''])
        );
        const toPublish: PublicBranchInfo[] = branchesHook.branches.map((branch) => ({
          id: branch.id,
          name: branch.name,
          address: addressByBranchId.get(branch.id) || undefined,
          isActive: true,
        }));
        const normalizeForCompare = (list: PublicBranchInfo[]) =>
          JSON.stringify(
            list.map((branch) => ({
              id: branch.id,
              name: branch.name,
              address: branch.address || '',
              isActive: branch.isActive !== false,
            }))
          );

        if (normalizeForCompare(existing) !== normalizeForCompare(toPublish)) {
          await firestoreService.savePublicBranches(publicBookingSecret, toPublish);
        }
      } catch (err) {
        if (!cancelled) console.warn('[Booking] Failed to sync public branches:', err);
      }
    })();

    return () => { cancelled = true; };
  }, [publicBookingSecret, branchesHook.branches]);

  useEffect(() => {
    if (!publicSectionOpen || !publicBookingSecret) return;
    return firestoreService.subscribeToPublicSlots(publicBookingSecret, setPublicSlots);
  }, [publicSectionOpen, publicBookingSecret]);

  // 5. جلب إعدادات نموذج حجز الجمهور
  useEffect(() => {
    if (!publicSectionOpen || !publicBookingSecret) return;

    // مسح الحقول القديمه فوراً عند تغيُّر الـsecret — قبل الإصلاح، لو الـconfig
    // رجع null أو الـpromise رفض، الحقول كانت تفضل بقيم دكتور سابق وممكن
    // تتحفظ بالغلط على السياق الحالي.
    setPublicFormTitle('');
    setPublicFormContactInfo('');
    return firestoreService.subscribeToPublicConfig(publicBookingSecret, (config) => {
      const branchSettings = config.publicFormSettingsByBranch?.[effectivePublicBranchId];
      const legacyTitle = effectivePublicBranchId === DEFAULT_BRANCH_ID ? config.title : '';
      const legacyContactInfo = effectivePublicBranchId === DEFAULT_BRANCH_ID ? config.contactInfo : '';
      setPublicFormTitle(branchSettings?.title ?? legacyTitle ?? '');
      setPublicFormContactInfo(branchSettings?.contactInfo ?? legacyContactInfo ?? '');
    });
  }, [publicSectionOpen, publicBookingSecret, effectivePublicBranchId]);

  // Counter يزيد مع كل تغيُّر context للسكرتارية (secret/branch/user) — يحمي من
  // stale async responses لو السكرتيره بدّلت الفرع بسرعه ورد قديم رجع بعد الجديد.
  const secretarySettingsRequestIdRef = useRef(0);

  // 6. تحميل إعدادات السكرتارية (كلمة المرور وعنوان النموذج)
  useEffect(() => {
    if (!bookingSecret) return;
    const activeBranchId = effectiveActiveBranchId;
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
      setSecretaryUsername('');
      setSecretaryPassword('');
      setSecretaryPasswordTouched(false);
      const fallbackFields = normalizeSecretaryVitalFieldDefinitions(
        prescriptionSecretaryFields,
        undefined,
        secretaryVitalSpecialtyOptions
      );
      setSecretaryVitalFields(fallbackFields);
      setSecretaryVitalsVisibility(
        buildSecretaryVisibilityByFieldDefinitions(
          fallbackFields,
          createDefaultSecretaryVitalsVisibility(secretaryVitalSpecialtyOptions),
          secretaryVitalSpecialtyOptions
        )
      );
      setSecretarySettingsHydrated(true);
    };

    firestoreService.getBookingConfig(bookingSecret, activeBranchId)
      .then((config) => {
        // الرد ده لطلب قديم؟ اخرج بدون setState
        if (secretarySettingsRequestIdRef.current !== myRequestId) return;

        if (!userId) {
          setBookingFormTitle(config?.formTitle ?? '');
          setSecretaryUsername(config?.secretaryUsername ?? '');
          setSecretaryPassword('');
          setSecretaryPasswordTouched(false);
          const rawVisibility = config?.secretaryVitalsVisibility;
          const nextFields = normalizeSecretaryVitalFieldDefinitions(
            config?.secretaryVitalFields,
            prescriptionSecretaryFields,
            secretaryVitalSpecialtyOptions
          );
          setSecretaryVitalFields(nextFields);
          setSecretaryVitalsVisibility(
            buildSecretaryVisibilityByFieldDefinitions(
              nextFields,
              rawVisibility
                ? normalizeSecretaryVitalsVisibility(rawVisibility, undefined, secretaryVitalSpecialtyOptions)
                : undefined,
              secretaryVitalSpecialtyOptions
            )
          );
          setSecretarySettingsHydrated(true);
          return;
        }
        firestoreService.getBookingConfigByUserId(userId, activeBranchId)
          .then((legacyConfig) => {
            if (secretarySettingsRequestIdRef.current !== myRequestId) return;
            setBookingFormTitle((config?.formTitle ?? '').trim() || legacyConfig?.formTitle || '');
            setSecretaryUsername(legacyConfig?.secretaryUsername ?? config?.secretaryUsername ?? '');
            setSecretaryPassword((legacyConfig?.secretaryPasswordPlain ?? '').trim());
            const nextFields = normalizeSecretaryVitalFieldDefinitions(
              config?.secretaryVitalFields || legacyConfig?.secretaryVitalFields,
              prescriptionSecretaryFields,
              secretaryVitalSpecialtyOptions
            );
            const rawVisibility = config?.secretaryVitalsVisibility || legacyConfig?.secretaryVitalsVisibility;
            const nextVisibility = buildSecretaryVisibilityByFieldDefinitions(
              nextFields,
              rawVisibility
                ? normalizeSecretaryVitalsVisibility(rawVisibility, undefined, secretaryVitalSpecialtyOptions)
                : undefined,
              secretaryVitalSpecialtyOptions
            );

            setSecretaryVitalFields(nextFields);
            setSecretaryVitalsVisibility(nextVisibility);
            setSecretaryPasswordTouched(false);
            setSecretarySettingsHydrated(true);
          })
          .catch(handleLoadFailure);
      })
      .catch(handleLoadFailure);
  }, [bookingSecret, prescriptionSecretaryFields, secretaryVitalSpecialtyOptions, userId, effectiveActiveBranchId]);

  useEffect(() => {
    if (!secretarySettingsHydrated || secretarySettingsDirty) return;

    const nextFields = normalizeSecretaryVitalFieldDefinitions(
      prescriptionSecretaryFields,
      undefined,
      secretaryVitalSpecialtyOptions
    );
    const nextVisibility = buildSecretaryVisibilityByFieldDefinitions(
      nextFields,
      secretaryVitalsVisibility,
      secretaryVitalSpecialtyOptions
    );

    const fieldsChanged = JSON.stringify(secretaryVitalFields) !== JSON.stringify(nextFields);
    const visibilityChanged =
      JSON.stringify(normalizeSecretaryVitalsVisibility(secretaryVitalsVisibility, undefined, secretaryVitalSpecialtyOptions)) !==
      JSON.stringify(normalizeSecretaryVitalsVisibility(nextVisibility, undefined, secretaryVitalSpecialtyOptions));

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
    secretaryVitalSpecialtyOptions,
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

    const normalizedUsername = normalizeSecretaryUsername(secretaryUsername);
    const usernameValidationMessage = getSecretaryUsernameValidationMessage(normalizedUsername);
    if (usernameValidationMessage) {
      setCredentialsError(usernameValidationMessage);
      return;
    }

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
      const currentBranchId = effectiveActiveBranchId
        || (userId ? branchesService.getActiveBranchId(userId) : undefined)
        || DEFAULT_BRANCH_ID;

      try {
        const savedUsername = await saveSecretaryUsername({
          username: normalizedUsername,
          branchId: currentBranchId,
          secret: resolvedSecret,
        });
        setSecretaryUsername(savedUsername.username);
      } catch (usernameError) {
        throw new Error(getSecretaryUsernameSaveErrorMessage(usernameError));
      }

      await firestoreService.updateBookingSettings(
        userId,
        resolvedSecret,
        bookingFormTitle,
        (userDisplayName ?? '').trim(),
        pass,
        userEmail ?? undefined,
        secretaryVitalsVisibility,
        secretaryVitalFields,
        doctorSpecialty ?? undefined,
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
    secretaryUsername,
    bookingFormTitle,
    userDisplayName,
    userEmail,
    secretaryVitalsVisibility,
    secretaryVitalFields,
    doctorSpecialty,
    effectiveActiveBranchId,
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
      await firestoreService.savePublicFormSettings(
        userId,
        publicBookingSecret,
        publicFormTitle,
        publicFormContactInfo,
        effectivePublicBranchId,
      );
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
      const branchId = effectiveActiveBranchId || branchesService.getActiveBranchId(userId);
      await firestoreService.addPublicSlot(userId, publicBookingSecret, dt.toISOString(), branchId);
      setPublicSlotTimeStr('');
    } finally { setPublicSlotAdding(false); }
  };

  /** حذف فترة زمنية متاحة للحجز */
  const removePublicSlot = (slotId: string) => {
    if (publicBookingSecret) firestoreService.deletePublicSlot(publicBookingSecret, slotId).catch(() => {});
  };

  const startEditPublicSlot = (slot: PublicBookingSlot) => {
    const { dateStr, timeStr } = toPublicSlotInputParts(slot.dateTime);
    setEditingPublicSlotId(slot.id);
    setEditingPublicSlotDateStr(dateStr);
    setEditingPublicSlotTimeStr(timeStr);
  };

  const cancelEditPublicSlot = () => {
    setEditingPublicSlotId(null);
    setEditingPublicSlotDateStr('');
    setEditingPublicSlotTimeStr('');
  };

  const saveEditedPublicSlot = async (e: FormEvent) => {
    e.preventDefault();
    if (!publicBookingSecret || !editingPublicSlotId) return;
    const dt = buildLocalDateTime(editingPublicSlotDateStr, editingPublicSlotTimeStr);
    if (Number.isNaN(dt.getTime()) || dt.getTime() < Date.now()) return;

    setPublicSlotUpdating(true);
    try {
      await firestoreService.updatePublicSlot(
        publicBookingSecret,
        editingPublicSlotId,
        dt.toISOString(),
        effectivePublicBranchId,
      );
      cancelEditPublicSlot();
    } finally {
      setPublicSlotUpdating(false);
    }
  };

  const visiblePublicSlots = useMemo(() => {
    if (!hasMultipleBranches) return publicSlots;
    return publicSlots.filter((slot) => (slot.branchId || DEFAULT_BRANCH_ID) === effectivePublicBranchId);
  }, [publicSlots, hasMultipleBranches, effectivePublicBranchId]);

  return {
    bookingLink, linkCopied, copyBookingLink, credentialsSaving, credentialsError, credentialsSuccess,
    bookingSectionOpen, toggleBookingSection: () => setBookingSectionOpen(!bookingSectionOpen),
    bookingFormTitle, onBookingFormTitleChange: (v: string) => {
      setBookingFormTitle(v);
      setSecretarySettingsDirty(true);
      setCredentialsError(null);
      setCredentialsSuccess(false);
    },
    secretaryUsername, onSecretaryUsernameChange: (v: string) => {
      setSecretaryUsername(normalizeSecretaryUsername(v));
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
        }, secretaryVitalSpecialtyOptions)
      );
      setSecretarySettingsDirty(true);
      setCredentialsError(null);
      setCredentialsSuccess(false);
    },
    saveBookingCredentials,
    publicBookingLink, publicLinkError, retryPublicLink, publicBookingSecret, publicSectionOpen, togglePublicSection: () => setPublicSectionOpen(!publicSectionOpen),
    publicSlots: visiblePublicSlots, publicSlotDateStr, setPublicSlotDateStr, publicSlotTimeStr, setPublicSlotTimeStr,
    publicLinkCopied, copyPublicLink, publicSlotAdding, addPublicSlot, removePublicSlot,
    editingPublicSlotId, editingPublicSlotDateStr, setEditingPublicSlotDateStr,
    editingPublicSlotTimeStr, setEditingPublicSlotTimeStr, publicSlotUpdating,
    startEditPublicSlot, cancelEditPublicSlot, saveEditedPublicSlot,
    publicFormTitle, setPublicFormTitle, publicFormContactInfo, setPublicFormContactInfo,
    publicFormSaving, savePublicFormSettings, isPublicSettingsSaved,
    publicSlotTodayStr: toLocalDateStr(new Date()), publicTimeMin: publicSlotDateStr === toLocalDateStr(new Date()) ? currentTimeMin() : undefined,
    currentBranchLabel,
    hasMultipleBranches,
    // قائمة الفروع الكاملة — مستخدمة في BookingSectionPublic لتوليد رابط منفصل لكل فرع
    branches: branchesHook.branches,
  };
};
