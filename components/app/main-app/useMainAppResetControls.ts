// ─────────────────────────────────────────────────────────────────────────────
// Hook أدوات إعادة ضبط الفورم + ماضي/استشارة (useMainAppResetControls)
// ─────────────────────────────────────────────────────────────────────────────
// يغلف 3 مجموعات من الـ callbacks الصغيرة:
//
//   1) Reset controls:
//      - performReset: إعادة الضبط الفعلي (بعد تأكيد المستخدم)
//      - handleResetAndClearOpenedAppointment: نسخة "آمنة" — تسأل قبل الحذف
//        لو في بيانات غير محفوظة (showUnsavedResetModal)
//      - handleConfirm/Cancel UnsavedReset: أزرار تأكيد المودال
//
//   2) Past exam/consultation handlers:
//      - handleAddPastExam: إنشاء كشف قديم بتاريخ سابق
//      - handleAddPastConsultation: إنشاء استشارة قديمة بتاريخ سابق
//
//   3) Push prompt timing:
//      - handlePushPromptLater: تأجيل عرض تنبيه الإشعارات لفترة
//      - canShowPushPrompt: هل نعرض التنبيه حالياً؟
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useRef, useState } from 'react';
import type { AppView } from '../utils';
import { safeStorageSetItem } from '../../../services/auth-service/storage';
import type { ClinicAppointment } from '../../../types';
import { PUSH_PROMPT_HIDE_MS, PUSH_PROMPT_HIDE_UNTIL_KEY } from './constants';

interface UseMainAppResetControlsParams {
  hasUnsavedChanges: boolean;
  handleReset: () => void;
  setOpenedAppointmentContext: (apt: ClinicAppointment | null) => void;
  setAppointmentSecretaryCustomValues: (values: Record<string, string>) => void;
  setVisitDate: (date: string) => void;
  setConsultationDate: (date: string) => void;
  setVisitType: (type: 'exam' | 'consultation') => void;
  setIsPastConsultationMode: (mode: boolean) => void;
  navigateToView: (view: AppView) => void;
  showPushPrompt: boolean;
  hidePushPromptUntil: number;
  setHidePushPromptUntil: (value: number) => void;
}

export const useMainAppResetControls = ({
  hasUnsavedChanges,
  handleReset,
  setOpenedAppointmentContext,
  setAppointmentSecretaryCustomValues,
  setVisitDate,
  setConsultationDate,
  setVisitType,
  setIsPastConsultationMode,
  navigateToView,
  showPushPrompt,
  hidePushPromptUntil,
  setHidePushPromptUntil,
}: UseMainAppResetControlsParams) => {
  // ── 1) Reset controls ──
  /** الريست الفعلي: يفرغ الموعد المفتوح + القيم المخصصة + يستدعي handleReset الأساسي. */
  const performReset = useCallback(() => {
    setOpenedAppointmentContext(null);
    setAppointmentSecretaryCustomValues({});
    handleReset();
  }, [handleReset, setOpenedAppointmentContext, setAppointmentSecretaryCustomValues]);

  // تحذير داخلي قبل تفريغ الفورم لو فيه بيانات غير محفوظة في سجلات المرضى
  const [showUnsavedResetModal, setShowUnsavedResetModal] = useState(false);
  // إجراء معلق ينفذ بعد ما المستخدم يأكد المودال (مثلاً: تعبئة بيانات الموعد الجديد).
  // نستخدم ref بدل state عشان نتجنب re-render إضافي ونضمن إن الـcallback الأحدث هو اللي ينفذ.
  const pendingAfterResetRef = useRef<(() => void) | null>(null);
  // وصف بشري للإجراء المعلق — يظهر في رسالة المودال عشان المستخدم يفهم هيحصل إيه بعد التأكيد.
  const [pendingActionLabel, setPendingActionLabel] = useState<string | null>(null);

  /**
   * ريست آمن: لو في تعديلات غير محفوظة، نعرض مودال التأكيد أولاً ونحفظ
   * أي إجراء بعدي (zb. فتح موعد جديد) عشان ينفذ بعد الـreset.
   * لو مفيش تعديلات: ينفذ الـreset والإجراء فوراً.
   *
   * @param afterReset - callback اختياري ينفذ بعد الـreset مباشرة
   * @param actionLabel - وصف للإجراء يظهر في المودال (مثلاً "فتح بيانات المريض الجديد")
   */
  const handleResetAndClearOpenedAppointment = useCallback((
    afterReset?: () => void,
    actionLabel?: string,
  ) => {
    if (hasUnsavedChanges) {
      // نخزن الإجراء المعلق ووصفه ثم نظهر المودال — التنفيذ يحصل في handleConfirmUnsavedReset
      pendingAfterResetRef.current = afterReset || null;
      setPendingActionLabel(actionLabel || null);
      setShowUnsavedResetModal(true);
      return;
    }
    // مفيش بيانات غير محفوظة — ننفذ الـreset والإجراء فوراً (الترتيب مهم)
    performReset();
    if (afterReset) afterReset();
  }, [hasUnsavedChanges, performReset]);

  const handleConfirmUnsavedReset = useCallback(() => {
    setShowUnsavedResetModal(false);
    // الترتيب حرج: الـreset أولاً (يمسح الفورم القديم)، ثم الإجراء المعلق (يعبي البيانات الجديدة).
    // لو عكسنا الترتيب، الـreset هيمسح البيانات الجديدة اللي للتو اتعبت — وده كان أصل البق الأصلي.
    performReset();
    const pending = pendingAfterResetRef.current;
    pendingAfterResetRef.current = null;
    setPendingActionLabel(null);
    if (pending) pending();
  }, [performReset]);

  const handleCancelUnsavedReset = useCallback(() => {
    setShowUnsavedResetModal(false);
    // المستخدم رفض — نلغي الإجراء المعلق عشان ما ينفذش لاحقاً عن طريق الخطأ
    pendingAfterResetRef.current = null;
    setPendingActionLabel(null);
  }, []);

  // ── 2) Past exam/consultation handlers ──
  // ─ defense in depth: لو حد بعدين بعت "YYYY-MM-DDTHH:mm:ss" بدل "YYYY-MM-DD"،
  //   ناخد الجزء اللي قبل T فقط عشان خانة <input type="date"> ما تظهرش الوقت
  //   ملصوق فيها. الـmodal الحالي بيبعت تاريخ نظيف بس، لكن الـguard هنا أمان زيادة.
  const extractDateOnly = (datetime: string): string => {
    const trimmed = String(datetime || '').trim();
    const tIndex = trimmed.indexOf('T');
    return tIndex === -1 ? trimmed : trimmed.slice(0, tIndex);
  };

  /** إضافة كشف قديم: ريست كامل + تعيين التاريخ المحدد + تبديل للروشتة. */
  const handleAddPastExam = useCallback((datetime: string) => {
    const dateOnly = extractDateOnly(datetime);
    handleReset();
    setVisitDate(dateOnly);
    setConsultationDate(dateOnly);
    setVisitType('exam');
    setIsPastConsultationMode(false);
    navigateToView('prescription');
  }, [handleReset, setVisitDate, setConsultationDate, setVisitType, setIsPastConsultationMode, navigateToView]);

  /** إضافة استشارة قديمة: نفس الفكرة لكن مع تفعيل وضع الاستشارة التاريخية. */
  const handleAddPastConsultation = useCallback((datetime: string) => {
    const dateOnly = extractDateOnly(datetime);
    handleReset();
    setVisitDate(dateOnly);
    setConsultationDate(dateOnly);
    setVisitType('consultation');
    setIsPastConsultationMode(true);
    navigateToView('prescription');
  }, [handleReset, setVisitDate, setConsultationDate, setVisitType, setIsPastConsultationMode, navigateToView]);

  // ── 3) Push prompt timing ──
  /** تأجيل تنبيه تفعيل الإشعارات — يحفظ "hide until" في localStorage. */
  const handlePushPromptLater = useCallback(() => {
    const until = Date.now() + PUSH_PROMPT_HIDE_MS;
    setHidePushPromptUntil(until);
    safeStorageSetItem(PUSH_PROMPT_HIDE_UNTIL_KEY, String(until));
  }, [setHidePushPromptUntil]);

  const canShowPushPrompt = showPushPrompt && Date.now() >= hidePushPromptUntil;

  return {
    performReset,
    showUnsavedResetModal,
    pendingActionLabel,
    handleResetAndClearOpenedAppointment,
    handleConfirmUnsavedReset,
    handleCancelUnsavedReset,
    handleAddPastExam,
    handleAddPastConsultation,
    handlePushPromptLater,
    canShowPushPrompt,
  };
};
