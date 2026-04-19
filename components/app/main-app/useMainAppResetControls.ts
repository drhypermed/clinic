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

import { useCallback, useState } from 'react';
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

  /** ريست آمن: لو في تعديلات غير محفوظة، نعرض مودال التأكيد أولاً. */
  const handleResetAndClearOpenedAppointment = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowUnsavedResetModal(true);
      return;
    }
    performReset();
  }, [hasUnsavedChanges, performReset]);

  const handleConfirmUnsavedReset = useCallback(() => {
    setShowUnsavedResetModal(false);
    performReset();
  }, [performReset]);

  const handleCancelUnsavedReset = useCallback(() => {
    setShowUnsavedResetModal(false);
  }, []);

  // ── 2) Past exam/consultation handlers ──
  /** إضافة كشف قديم: ريست كامل + تعيين التاريخ المحدد + تبديل للروشتة. */
  const handleAddPastExam = useCallback((date: string) => {
    handleReset();
    setVisitDate(date);
    setConsultationDate(date);
    setVisitType('exam');
    setIsPastConsultationMode(false);
    navigateToView('prescription');
  }, [handleReset, setVisitDate, setConsultationDate, setVisitType, setIsPastConsultationMode, navigateToView]);

  /** إضافة استشارة قديمة: نفس الفكرة لكن مع تفعيل وضع الاستشارة التاريخية. */
  const handleAddPastConsultation = useCallback((date: string) => {
    handleReset();
    setVisitDate(date);
    setConsultationDate(date);
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
    handleResetAndClearOpenedAppointment,
    handleConfirmUnsavedReset,
    handleCancelUnsavedReset,
    handleAddPastExam,
    handleAddPastConsultation,
    handlePushPromptLater,
    canShowPushPrompt,
  };
};
