// ─────────────────────────────────────────────────────────────────────────────
// Hook إجراءات إدارة حسابات الأطباء (useAccountManagementActions)
// ─────────────────────────────────────────────────────────────────────────────
// يجمع كل الإجراءات اللي بيعملها الأدمن على حسابات الأطباء:
//   • handleEnableAccount / handleDisableAccount: تفعيل وتعطيل الحساب
//   • handleDeleteDoctor: حذف طبيب نهائياً (مع حظر البريد عبر Cloud Function)
//   • handleUpdateAccountType: تحويل حساب من/إلى مميز (مع حساب المدة)
//   • handleUpdateSubscriptionDates: تعديل يدوي لتاريخ بداية ونهاية الاشتراك
//   • handleUpdateSubscriptionDuration: تمديد الاشتراك بمدة محددة
//
// إصلاحات مهمة في النسخة الحالية:
//   1) تمديد المدة بيحسب من تاريخ النهاية الحالي (مش البداية) — منع الانقاص المفاجئ.
//   2) شيل window.prompt/confirm/alert — الـ caller بيتحكم في UI التأكيد (مودال مخصص).
//   3) Audit trail: كل عملية كتابة بتسجل مين عملها (lastModifiedBy + lastModifiedAt).
//   4) Rate limiting: actionInProgress[id] state يمنع الضغط المتكرر على نفس الطبيب.
// ─────────────────────────────────────────────────────────────────────────────

import { ApprovedDoctor, EditMode, SubscriptionChangeType, SubscriptionPeriod, SubscriptionTier, SubscriptionUnit } from './types';
import { computePeriodPricing } from './subscriptionPricing';
import { Dispatch, SetStateAction, useState } from 'react';
import { setDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from '../../../services/firebaseConfig';
import { isPositiveSafeInteger, parseAdminDateTime } from './securityUtils';
import { normalizeEmail } from '../../../services/auth-service/validation';
import { AccountType } from '../../../types';
import { buildDoctorUserProfilePayload, getUserProfileDocRef } from '../../../services/firestore/profileRoles';
import { normalizeDoctorVerificationStatus } from '../../../utils/doctorVerificationStatus';
import { buildUsageStatsForPlanSwitch, UsagePlan } from '../../../utils/usageStatsByPlan';

interface UseAccountManagementActionsParams {
  approvedDoctors: ApprovedDoctor[];
  setApprovedDoctors: Dispatch<SetStateAction<ApprovedDoctor[]>>;
  canManageAccounts: boolean;
  isAdminDoctorEmail: (email?: string) => boolean;
  userEmail: string;
}

export const useAccountManagementActions = ({
  approvedDoctors,
  setApprovedDoctors,
  canManageAccounts,
  isAdminDoctorEmail,
  userEmail,
}: UseAccountManagementActionsParams) => {
  const [editingDurationId, setEditingDurationId] = useState<string>('');
  const [editingStartDate, setEditingStartDate] = useState<Record<string, string>>({});
  const [editingEndDate, setEditingEndDate] = useState<Record<string, string>>({});
  const [editingStartTime, setEditingStartTime] = useState<Record<string, string>>({});
  const [editingEndTime, setEditingEndTime] = useState<Record<string, string>>({});
  const [editMode, setEditMode] = useState<Record<string, EditMode>>({});
  const [editingDurationValue, setEditingDurationValue] = useState<Record<string, number>>({});
  const [editingDurationUnit, setEditingDurationUnit] = useState<Record<string, SubscriptionUnit>>({});
  const [actionInProgress, setActionInProgress] = useState<Record<string, boolean>>({});

  const setLoading = (id: string, v: boolean) =>
    setActionInProgress((prev) => ({ ...prev, [id]: v }));

  const ensureAdminAccess = (): boolean => {
    if (!canManageAccounts) throw new Error('غير مسموح لك بإدارة الحسابات.');
    return true;
  };

  const writeDoctorProfile = async (doctorId: string, payload: Record<string, unknown>) => {
    await setDoc(
      getUserProfileDocRef(doctorId),
      buildDoctorUserProfilePayload({
        updatedAt: new Date().toISOString(),
        lastModifiedBy: userEmail || 'admin',
        lastModifiedAt: new Date().toISOString(),
        ...payload,
      }),
      { merge: true },
    );
  };

  const ensureDoctorDocumentExists = async (doctorId: string): Promise<void> => {
    if (!canManageAccounts) return;
    const target = approvedDoctors.find((d) => d.id === doctorId);
    if (!target) return;
    const nowIso = new Date().toISOString();
    await writeDoctorProfile(doctorId, {
      uid: doctorId,
      doctorName: target.doctorName || '',
      doctorSpecialty: target.doctorSpecialty || '',
      doctorEmail: normalizeEmail(target.doctorEmail),
      doctorWhatsApp: target.doctorWhatsApp || '',
      accountType: target.accountType === 'premium' ? 'premium'
        : target.accountType === 'pro_max' ? 'pro_max'
        : 'free',
      premiumStartDate: target.premiumStartDate || '',
      premiumExpiryDate: target.premiumExpiryDate || '',
      subscriptionHistory: target.subscriptionHistory || [],
      verificationStatus: normalizeDoctorVerificationStatus(target.verificationStatus),
      isAccountDisabled: Boolean(target.isAccountDisabled),
      disabledReason: target.disabledReason || '',
      disabledAt: target.disabledAt || '',
      authRole: 'doctor',
      userRole: 'doctor',
      createdAt: target.createdAt || nowIso,
    });
  };

  /* ══════════════════════════════════════════════════════════
     HANDLERS — No window.prompt/confirm/alert. Caller manages UI.
  ══════════════════════════════════════════════════════════ */

  /**
   * التعطيل والتفعيل يمرّان عبر Cloud Function `setDoctorAccountDisabled` التي
   * تنفّذ 3 عمليات ذرياً: تحديث Firestore + تعطيل Firebase Auth + إبطال tokens.
   * هذا يضمن حماية server-side لا يمكن تجاوزها من العميل.
   */
  const handleDisableAccount = async (doctorId: string, doctorEmail: string, reason: string) => {
    ensureAdminAccess();
    if (isAdminDoctorEmail(doctorEmail)) throw new Error('لا يمكن تعطيل حساب الأدمن.');
    if (!reason.trim()) throw new Error('يجب إدخال سبب التعطيل.');

    setLoading(doctorId, true);
    try {
      if (auth.currentUser) await auth.currentUser.getIdToken(true);
      const setDisabled = httpsCallable(functions, 'setDoctorAccountDisabled');
      const result = await setDisabled({ doctorId, disabled: true, reason: reason.trim() });
      const timestamp = (result.data as { timestamp?: string })?.timestamp || new Date().toISOString();
      setApprovedDoctors((prev) =>
        prev.map((d) =>
          d.id === doctorId
            ? { ...d, isAccountDisabled: true, disabledReason: reason.trim(), disabledAt: timestamp }
            : d,
        ),
      );
    } finally {
      setLoading(doctorId, false);
    }
  };

  const handleEnableAccount = async (doctorId: string) => {
    ensureAdminAccess();
    setLoading(doctorId, true);
    try {
      if (auth.currentUser) await auth.currentUser.getIdToken(true);
      const setDisabled = httpsCallable(functions, 'setDoctorAccountDisabled');
      await setDisabled({ doctorId, disabled: false });
      setApprovedDoctors((prev) =>
        prev.map((d) =>
          d.id === doctorId ? { ...d, isAccountDisabled: false, disabledReason: '', disabledAt: '' } : d,
        ),
      );
    } finally {
      setLoading(doctorId, false);
    }
  };

  /**
   * تغيير نوع الحساب مع اختيار المدة.
   * durationDays: 30 / 180 / 365 (مطلوب عند التحويل لمميز).
   */
  const handleUpdateAccountType = async (doctorId: string, newType: AccountType, durationDays?: number) => {
    ensureAdminAccess();
    setLoading(doctorId, true);
    try {
      await ensureDoctorDocumentExists(doctorId);
      const doctor = approvedDoctors.find((d) => d.id === doctorId);
      // 3 فئات: مجاني / برو (premium داخلياً) / برو ماكس (pro_max)
      const currentPlan: UsagePlan =
        doctor?.accountType === 'premium' ? 'premium'
        : doctor?.accountType === 'pro_max' ? 'pro_max'
        : 'free';
      const updateData: any = { accountType: newType };

      if (doctor && currentPlan !== newType) {
        const switchUsageResult = buildUsageStatsForPlanSwitch({
          currentPlan,
          targetPlan: newType,
          usageStats: doctor.usageStats,
          usageStatsByPlan: doctor.usageStatsByPlan,
        });
        updateData.usageStatsByPlan = switchUsageResult.usageStatsByPlan;
        updateData.usageStats = switchUsageResult.resetUsageStats;
      }

      if (newType === 'free') {
        updateData.premiumExpiryDate = null;
        updateData.premiumStartDate = null;
      } else if (newType === 'premium' || newType === 'pro_max') {
        // برو وبرو ماكس بيشاركوا نفس حقول الـ expiry (premiumStartDate/premiumExpiryDate)
        // — الفرق بس في accountType. الأدمن بيضبط مميزات برو ماكس من AccountTypeControls.
        const days = durationDays || 30;
        const now = new Date();
        const expiryDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        updateData.premiumStartDate = now.toISOString();
        updateData.premiumExpiryDate = expiryDate.toISOString();
        const currentHistory = doctor?.subscriptionHistory || [];
        // نحسب السعر لحظة العملية ونحفظه مع entry السجل — بحيث الإيراد التاريخي
        // يفضل ثابت حتى لو الأسعار اتغيرت بعدين.
        const tier: SubscriptionTier = newType === 'pro_max' ? 'pro_max' : 'premium';
        const pricing = await computePeriodPricing({
          startDate: now,
          endDate: expiryDate,
          tier,
        });
        const newPeriod: SubscriptionPeriod = {
          startDate: now.toISOString(),
          endDate: expiryDate.toISOString(),
          changeType: 'new',
          modifiedBy: userEmail,
          modifiedAt: now.toISOString(),
          tier,
          planType: pricing.planType,
          durationMonths: pricing.durationMonths,
          pricePaid: pricing.pricePaid,
          priceCurrency: 'EGP',
          priceSource: pricing.priceSource,
        };
        updateData.subscriptionHistory = [...currentHistory, newPeriod];
        updateData.premiumNotificationSent = false;
      }

      await writeDoctorProfile(doctorId, updateData);
      setApprovedDoctors((prev) =>
        prev.map((d) => {
          if (d.id !== doctorId) return d;
          const stateCurrentPlan: UsagePlan =
            d.accountType === 'premium' ? 'premium'
              : d.accountType === 'pro_max' ? 'pro_max'
              : 'free';
          const switchUsageResult =
            stateCurrentPlan !== newType
              ? buildUsageStatsForPlanSwitch({
                  currentPlan: stateCurrentPlan,
                  targetPlan: newType,
                  usageStats: d.usageStats,
                  usageStatsByPlan: d.usageStatsByPlan,
                })
              : null;

          return {
            ...d,
            accountType: newType,
            usageStatsByPlan: switchUsageResult?.usageStatsByPlan || d.usageStatsByPlan,
            usageStats: switchUsageResult?.resetUsageStats || d.usageStats,
            ...(newType === 'free' && { premiumExpiryDate: null, premiumStartDate: null }),
            ...(newType === 'premium' && {
              premiumStartDate: updateData.premiumStartDate,
              premiumExpiryDate: updateData.premiumExpiryDate,
              subscriptionHistory: updateData.subscriptionHistory,
            }),
          };
        }),
      );
    } finally {
      setLoading(doctorId, false);
    }
  };

  /**
   * "إضافة مدة" بتحسب من max(الآن، تاريخ النهاية الحالي) عشان لو الاشتراك منتهي
   * بالفعل، التمديد يبدأ من اليوم وليس من تاريخ في الماضي.
   * مثال سابق بخطأ: اشتراك انتهى 2024-01-01 + 30 يوم = 2024-01-31 (لا يزال في الماضي).
   * بعد الإصلاح: 2026-04-16 + 30 يوم = 2026-05-16.
   */
  const handleUpdateSubscriptionDuration = async (
    doctorId: string,
    value: number,
    unit: SubscriptionUnit,
  ) => {
    ensureAdminAccess();
    const doctor = approvedDoctors.find((d) => d.id === doctorId);
    if (!doctor || !doctor.premiumStartDate) {
      throw new Error('لا يمكن تحديث المدة: لا توجد بيانات اشتراك');
    }
    if (!isPositiveSafeInteger(value)) {
      throw new Error('يرجى إدخال قيمة أكبر من 0');
    }

    setLoading(doctorId, true);
    try {
      await ensureDoctorDocumentExists(doctorId);

      // تثبيت نقطة البداية عند max(الآن، تاريخ الانتهاء الحالي) لمنع التمديد إلى الماضي.
      const now = new Date();
      const currentExpiryRaw = doctor.premiumExpiryDate
        ? new Date(doctor.premiumExpiryDate)
        : new Date(doctor.premiumStartDate);
      const anchor = new Date(
        Math.max(now.getTime(), currentExpiryRaw.getTime()),
      );
      const expiryDate = new Date(anchor);

      switch (unit) {
        case 'hour':
          expiryDate.setHours(expiryDate.getHours() + value);
          break;
        case 'day':
          expiryDate.setDate(expiryDate.getDate() + value);
          break;
        case 'week':
          expiryDate.setDate(expiryDate.getDate() + value * 7);
          break;
        case 'month': {
          const dayBefore = expiryDate.getDate();
          expiryDate.setMonth(expiryDate.getMonth() + value);
          if (expiryDate.getDate() !== dayBefore) expiryDate.setDate(0);
          break;
        }
        case 'year':
          expiryDate.setFullYear(expiryDate.getFullYear() + value);
          break;
      }

      const startDate = new Date(doctor.premiumStartDate);
      const currentHistory = doctor.subscriptionHistory || [];

      // الـ entry الجديد للتمديد بيمثل **فترة التمديد فقط** (من anchor لـ expiryDate)،
      // مش الفترة الكلية من بداية الاشتراك. ده ضروري عشان الإيراد يتحسب على
      // مدة التمديد الحقيقية بسعر اللحظة الحالية.
      const tier: SubscriptionTier = doctor.accountType === 'pro_max' ? 'pro_max' : 'premium';
      const extensionPricing = await computePeriodPricing({
        startDate: anchor,
        endDate: expiryDate,
        tier,
      });
      const newPeriod: SubscriptionPeriod = {
        startDate: anchor.toISOString(),
        endDate: expiryDate.toISOString(),
        changeType: 'extension',
        modifiedBy: userEmail,
        modifiedAt: new Date().toISOString(),
        tier,
        planType: extensionPricing.planType,
        durationMonths: extensionPricing.durationMonths,
        pricePaid: extensionPricing.pricePaid,
        priceCurrency: 'EGP',
        priceSource: extensionPricing.priceSource,
      };
      const updatedHistory = [...currentHistory, newPeriod];

      await writeDoctorProfile(doctorId, {
        accountType: doctor.accountType === 'pro_max' ? 'pro_max' : 'premium',
        premiumStartDate: startDate.toISOString(),
        premiumExpiryDate: expiryDate.toISOString(),
        subscriptionHistory: updatedHistory,
        premiumNotificationSent: false,
      });

      setApprovedDoctors((prev) =>
        prev.map((d) =>
          d.id === doctorId
            ? {
                ...d,
                accountType: d.accountType === 'pro_max' ? 'pro_max' : 'premium',
                premiumStartDate: startDate.toISOString(),
                premiumExpiryDate: expiryDate.toISOString(),
                subscriptionHistory: updatedHistory,
              }
            : d,
        ),
      );

      setEditingDurationId('');
      setEditingDurationValue({});
      setEditingDurationUnit({});
      setEditMode({});
    } finally {
      setLoading(doctorId, false);
    }
  };

  const handleUpdateSubscriptionDates = async (
    doctorId: string,
    newStartDate: string,
    newEndDate: string,
    newStartTime: string = '00:00',
    newEndTime: string = '23:59',
  ) => {
    ensureAdminAccess();
    const doctor = approvedDoctors.find((d) => d.id === doctorId);
    if (!doctor) throw new Error('لا يمكن العثور على الطبيب');

    const startDate = parseAdminDateTime(newStartDate, newStartTime);
    const endDate = parseAdminDateTime(newEndDate, newEndTime);
    if (!startDate || !endDate) throw new Error('صيغة التاريخ أو الوقت غير صحيحة');
    if (endDate <= startDate) throw new Error('تاريخ النهاية يجب أن يكون بعد البداية');

    setLoading(doctorId, true);
    try {
      await ensureDoctorDocumentExists(doctorId);
      const currentHistory = doctor.subscriptionHistory || [];
      // التعديل اليدوي بيكتب فترة كلية جديدة. نحسب السعر بناءً على الفترة الجديدة.
      const tier: SubscriptionTier = doctor.accountType === 'pro_max' ? 'pro_max' : 'premium';
      const manualPricing = await computePeriodPricing({
        startDate,
        endDate,
        tier,
      });
      const newPeriod: SubscriptionPeriod = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        changeType: 'manual_edit',
        modifiedBy: userEmail,
        modifiedAt: new Date().toISOString(),
        tier,
        planType: manualPricing.planType,
        durationMonths: manualPricing.durationMonths,
        pricePaid: manualPricing.pricePaid,
        priceCurrency: 'EGP',
        priceSource: manualPricing.priceSource,
      };
      const updatedHistory = [...currentHistory, newPeriod];

      await writeDoctorProfile(doctorId, {
        accountType: doctor.accountType === 'pro_max' ? 'pro_max' : 'premium',
        premiumStartDate: startDate.toISOString(),
        premiumExpiryDate: endDate.toISOString(),
        subscriptionHistory: updatedHistory,
        premiumNotificationSent: false,
      });

      setApprovedDoctors((prev) =>
        prev.map((d) =>
          d.id === doctorId
            ? {
                ...d,
                accountType: d.accountType === 'pro_max' ? 'pro_max' : 'premium',
                premiumStartDate: startDate.toISOString(),
                premiumExpiryDate: endDate.toISOString(),
                subscriptionHistory: updatedHistory,
              }
            : d,
        ),
      );

      setEditingDurationId('');
      setEditingStartDate({});
      setEditingEndDate({});
      setEditingStartTime({});
      setEditingEndTime({});
      setEditMode({});
    } finally {
      setLoading(doctorId, false);
    }
  };

  const handleDeleteDoctor = async (doctorId: string, doctorEmail: string, reason: string) => {
    ensureAdminAccess();
    if (isAdminDoctorEmail(doctorEmail)) throw new Error('لا يمكن حذف حساب الأدمن.');
    if (!reason.trim()) throw new Error('يجب إدخال سبب الحذف.');

    if (!auth.currentUser) throw new Error('انتهت جلسة الإدارة. يرجى تسجيل الدخول مرة أخرى.');

    setLoading(doctorId, true);
    try {
      await auth.currentUser.getIdToken(true);
      await ensureDoctorDocumentExists(doctorId);
      const deleteDoctorAccount = httpsCallable(functions, 'deleteDoctorAccount');
      await deleteDoctorAccount({
        doctorId,
        deleteReason: reason.trim(),
        deletedBy: userEmail,
        keepFirestoreDoc: false,
      });
      setApprovedDoctors((prev) => prev.filter((d) => d.id !== doctorId));
    } finally {
      setLoading(doctorId, false);
    }
  };

  return {
    editingDurationId,
    editingStartDate,
    editingEndDate,
    editingStartTime,
    editingEndTime,
    editMode,
    editingDurationValue,
    editingDurationUnit,
    actionInProgress,
    setEditingDurationId,
    setEditingStartDate,
    setEditingEndDate,
    setEditingStartTime,
    setEditingEndTime,
    setEditMode,
    setEditingDurationValue,
    setEditingDurationUnit,
    handleDisableAccount,
    handleEnableAccount,
    handleUpdateAccountType,
    handleUpdateSubscriptionDuration,
    handleUpdateSubscriptionDates,
    handleDeleteDoctor,
  };
};
