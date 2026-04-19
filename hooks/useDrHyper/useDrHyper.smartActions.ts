/**
 * العمليات الذكية (createSmartRxActions):
 * يتحكم هذا الملف في منطق الذكاء الاصطناعي (Smart Exam Analysis) 
 * والتعامل اليدوي مع الأدوية المقترحة.
 * 
 * المهام الرئيسية:
 * 1. تشغيل تحليل الحالة (Gemini AI) وترجمة البيانات الطبية.
 * 2. التحقق من "كوتة" التحليل الذكي اليومية.
 * 3. إضافة الأدوية يدوياً مع حساب البدائل والجرعات بناءً على الوزن والعمر.
 * 4. ضبط التركيز (Focus) والتمرير (Scroll) التلقائي عند إضافة عناصر جديدة.
 */

import React from 'react';
import { Medication, PrescriptionItem, VitalSigns } from '../../types';
import { runSmartRx } from '../../utils/rx/smartRx';
import { buildAlternativesSameScientific, sanitizeDosageText } from '../../utils/rx/rxUtils';
import type { SmartQuotaLimitErrorDetails } from '../../services/accountTypeControlsService';
import { isQuotaTransientError } from '../../services/account-type-controls/quotaErrors';
import { SMART_QUOTA_NOTICE_STORAGE_KEY } from './useDrHyper.helpers';

interface CreateSmartRxActionsParams {
  complaint: string;
  medicalHistory: string;
  examination: string;
  investigations: string;
  complaintEn: string;
  historyEn: string;
  examEn: string;
  investigationsEn: string;
  diagnosisEn: string;
  ageYears: string;
  ageMonths: string;
  ageDays: string;
  weight: string;
  totalAgeInMonths: number;
  vitals: VitalSigns;
  userId?: string;
  consumeSmartPrescriptionQuota: () => Promise<unknown>;
  extractSmartQuotaErrorDetails: (error: unknown) => SmartQuotaLimitErrorDetails | null;
  openQuotaNoticeModal: (payload: {
    message: string;
    whatsappNumber?: string;
    whatsappUrl?: string;
    dayKey?: string;
    persist?: boolean;
  }) => void;
  saveHistory: () => void;
  showNotification: (
    message: string,
    type?: 'success' | 'error' | 'info',
    options?: React.MouseEvent<any> | { event?: React.MouseEvent<any>; id?: string; firestoreId?: string }
  ) => void;
  setAnalyzing: React.Dispatch<React.SetStateAction<boolean>>;
  setErrorMsg: React.Dispatch<React.SetStateAction<string | null>>;
  setSmartQuotaNotice: React.Dispatch<
    React.SetStateAction<{ message: string; whatsappNumber: string; whatsappUrl: string } | null>
  >;
  setSmartQuotaModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setComplaintEn: React.Dispatch<React.SetStateAction<string>>;
  setHistoryEn: React.Dispatch<React.SetStateAction<string>>;
  setExamEn: React.Dispatch<React.SetStateAction<string>>;
  setInvestigationsEn: React.Dispatch<React.SetStateAction<string>>;
  setDiagnosisEn: React.Dispatch<React.SetStateAction<string>>;
  setRxItems: React.Dispatch<React.SetStateAction<PrescriptionItem[]>>;
  prescriptionRef: React.RefObject<HTMLDivElement | null>;
  lastAddedItemIdRef: React.RefObject<string | null>;
  onTrackSmartPrescription?: (complaint: string) => void;
  trackMedUsage: (medId: string) => void;
  rxItems: PrescriptionItem[];
  buildRxInstructions: (dosage: string, medInstructions: string | undefined | null) => string;
  medications: Medication[];
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string') return message;
  }
  return 'حدث خطأ أثناء تحليل الحالة';
};

const clearSmartQuotaStorage = () => {
  try {
    localStorage.removeItem(SMART_QUOTA_NOTICE_STORAGE_KEY);
  } catch {
    // ignore
  }
};

const getElementByRxItemId = (itemId: string): HTMLElement | null => {
  if (typeof document === 'undefined') return null;
  const element = document.querySelector(`[data-rx-item-id="${itemId}"]`);
  return element instanceof HTMLElement ? element : null;
};

export const createSmartRxActions = ({
  complaint,
  medicalHistory,
  examination,
  investigations,
  complaintEn,
  historyEn,
  examEn,
  investigationsEn,
  diagnosisEn,
  ageYears,
  ageMonths,
  ageDays,
  weight,
  totalAgeInMonths,
  vitals,
  userId,
  consumeSmartPrescriptionQuota,
  extractSmartQuotaErrorDetails,
  openQuotaNoticeModal,
  saveHistory,
  showNotification,
  setAnalyzing,
  setErrorMsg,
  setSmartQuotaNotice,
  setSmartQuotaModalOpen,
  setComplaintEn,
  setHistoryEn,
  setExamEn,
  setInvestigationsEn,
  setDiagnosisEn,
  setRxItems,
  prescriptionRef,
  lastAddedItemIdRef,
  onTrackSmartPrescription,
  trackMedUsage,
  rxItems,
  buildRxInstructions,
  medications,
}: CreateSmartRxActionsParams) => {
  /** تحليل الحالة تلقائياً باستخدام الذكاء الاصطناعي */
  const handleFullAutomatedRX = async (e?: React.MouseEvent<any>) => {
    // الشكوى ضرورية للتحليل
    if (!complaint.trim()) {
      showNotification('يرجى إدخال الشكوى قبل تحليل الحالة', 'error', e);
      return;
    }

    setAnalyzing(true);
    setErrorMsg(null);
    setSmartQuotaNotice(null);
    setSmartQuotaModalOpen(false);
    clearSmartQuotaStorage();

    try {
      // التحقق من الحد اليومي لاستخدام الذكاء الاصطناعي
      await consumeSmartPrescriptionQuota();
    } catch (error: unknown) {
      const details = extractSmartQuotaErrorDetails(error);
      const typed = (error && typeof error === 'object' ? error as {
        code?: string;
        message?: string;
      } : {});
      const isDailyLimit = typed.code === 'resource-exhausted'
        || typed.message?.includes?.('SMART_RX_DAILY_LIMIT_REACHED');

      if (isDailyLimit && details) {
        const fallbackMessage = `تم استهلاك حد تحليل الحالات اليومي (${details.limit} حالة).`;
        const messageWithPlaceholders = String(details.limitReachedMessage || '').trim()
          .replace(/\{\s*limit\s*\}/gi, String(Number(details.limit || 0)))
          .replace(/\{\s*used\s*\}/gi, String(Number(details.used || 0)))
          .replace(/\{\s*remaining\s*\}/gi, String(Number(details.remaining || 0)));
        const message = messageWithPlaceholders || fallbackMessage;
        openQuotaNoticeModal({
          message,
          whatsappNumber: details.whatsappNumber,
          whatsappUrl: details.whatsappUrl,
          dayKey: details.dayKey,
          persist: true,
        });
        setAnalyzing(false);
        return;
      }

      if (isQuotaTransientError(error)) {
        console.warn('Smart Rx quota check transient/offline failure, continuing with local/offline-first analysis path:', error);
      } else {
        console.error('Case analysis quota check failed:', error);
        showNotification('حدث خطأ أثناء التحقق من حد التحليل اليومي. حاول مرة أخرى.', 'error', e);
        setAnalyzing(false);
        return;
      }
    }

    const weightNum = parseFloat(weight);
    const weightValue = Number.isNaN(weightNum) ? 0 : weightNum;

    saveHistory();

    try {
      // إرسال البيانات للمحرك الذكي (Gemini)
      const out = await runSmartRx({
        complaint,
        medicalHistory,
        examination,
        investigations,
        complaintEn,
        historyEn,
        examEn,
        investigationsEn,
        diagnosisEn,
        ageYears,
        ageMonths,
        ageDays,
        weightKg: weightValue,
        totalAgeInMonths,
        vitals,
      });

      // استقبال النتائج وتعبئة الحقول المترجمة والأدوية المقترحة
      setComplaintEn(out.translated.complaintEn);
      setHistoryEn(out.translated.historyEn);
      setExamEn(out.translated.examEn);
      setInvestigationsEn(out.translated.investigationsEn);
      setDiagnosisEn(out.translated.diagnosisEn);
      setRxItems(out.rxItems);

      if (userId && onTrackSmartPrescription) {
        onTrackSmartPrescription(complaint);
      }

      // التمرير التلقائي لأسفل لرؤية الروشتة
      setTimeout(() => prescriptionRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);

      // إضافة سطر فارغ في النهاية لتسهيل الإضافة اليدوية
      setTimeout(() => {
        const newId = `empty-${Date.now()}`;
        lastAddedItemIdRef.current = newId;
        setRxItems((prev) => [
          ...prev,
          {
            id: newId,
            type: 'medication',
            medication: undefined,
            dosage: '',
            instructions: '',
            reasonForUse: 'Manual entry',
            source: 'Local Database',
            alternatives: [],
          },
        ]);
        setTimeout(() => {
          if (!lastAddedItemIdRef.current) return;
          const lastItem = getElementByRxItemId(lastAddedItemIdRef.current);
          if (lastItem) {
            lastItem.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'nearest',
            });
            const input = lastItem.querySelector(
              'input[placeholder*="اسم الدواء"], input[placeholder*="Medication"]'
            );
            if (input instanceof HTMLInputElement) input.focus();
          }
        }, 150);
      }, 450);

      showNotification('تم تحليل الحالة بنجاح', 'success', e);
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error));
      showNotification('حدث خطأ أثناء تحليل الحالة', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  /** إضافة دواء يدوياً من قاعدة البيانات المحلية للجهاز */
  const handleAddManualMedication = (med: Medication, dosage: string) => {
    saveHistory();
    trackMedUsage(med.id);
    const safeDosage = sanitizeDosageText(dosage);
    // بناء التعليمات الكاملة (الجرعة المحددة + تعليمات الدواء العامة)
    const fullInstructions = dosage === '' ? '' : buildRxInstructions(safeDosage, med.instructions);

    // جلب البدائل التي تحتوي على نفس المادة الفعالة
    const alternatives = buildAlternativesSameScientific(
      med,
      parseFloat(weight) || 0,
      totalAgeInMonths,
      medications
    );

    const newId = `manual-${Math.random().toString(36).substr(2, 9)}`;
    const shouldAddEmpty = rxItems.length + 1 < 4;
    const emptyId = shouldAddEmpty ? `empty-${Date.now()}` : '';

    lastAddedItemIdRef.current = shouldAddEmpty ? emptyId : newId;

    setRxItems((prev) => {
      const next: PrescriptionItem[] = [
        ...prev,
        {
          id: newId,
          type: 'medication',
          medication: med,
          dosage: safeDosage,
          instructions: fullInstructions,
          reasonForUse: 'Added manually',
          source: 'Local Database',
          alternatives,
        },
      ];

      // إضافة سطر فارغ إذا كان عدد الأدوية قليلاً
      if (shouldAddEmpty) {
        next.push({
          id: emptyId,
          type: 'medication',
          medication: undefined,
          dosage: '',
          instructions: '',
          reasonForUse: 'Auto-add',
          source: 'Local Database',
          alternatives: [],
        });
      }

      return next;
    });

    // منطق تحسين تجربة المستخدم (UI Polish)
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (!lastAddedItemIdRef.current || typeof document === 'undefined') return;

        // إعادة ضبط حجم حقول النص تلقائياً بناءً على المحتوى
        const resizeAll = () => {
          const textareas = document.querySelectorAll('textarea[data-auto-resize="true"]');
          textareas.forEach((textarea) => {
            if (!(textarea instanceof HTMLTextAreaElement)) return;
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
          });
        };

        resizeAll();

        requestAnimationFrame(() => {
          setTimeout(() => {
            resizeAll();

            const lastItem = getElementByRxItemId(lastAddedItemIdRef.current as string);
            if (lastItem) {
              requestAnimationFrame(() => {
                lastItem.scrollIntoView({
                  behavior: 'smooth',
                  block: 'nearest',
                  inline: 'nearest',
                });

                // نقل التركيز (Focus) للحقل المناسب
                if (dosage === '') {
                  const manualItem = getElementByRxItemId(newId);
                  const instInput = manualItem?.querySelector('textarea[placeholder*="التعليمات"]');
                  if (instInput instanceof HTMLTextAreaElement) instInput.focus();
                } else if (shouldAddEmpty) {
                  const nameInput = lastItem.querySelector('textarea[placeholder*="Name"]');
                  if (nameInput instanceof HTMLTextAreaElement) nameInput.focus();
                }
              });
              return;
            }

            if (prescriptionRef.current) {
              requestAnimationFrame(() => {
                prescriptionRef.current?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'nearest',
                  inline: 'nearest',
                });
              });
            }
          }, 150);
        });
      }, 200);
    });
  };

  return {
    handleFullAutomatedRX,
    handleAddManualMedication,
  };
};

