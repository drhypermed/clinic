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
import { Medication, PatientGender, PrescriptionItem, VitalSigns } from '../../types';
import { runSmartRx } from '../../utils/rx/smartRx';
import { buildAlternativesSameScientific, MAX_PRESCRIPTION_ITEMS_PER_LIST, sanitizeDosageText } from '../../utils/rx/rxUtils';
import type { SmartQuotaLimitErrorDetails } from '../../services/accountTypeControlsService';
import { isQuotaTransientError } from '../../services/account-type-controls/quotaErrors';
import { SMART_QUOTA_NOTICE_STORAGE_KEY } from './useDrHyper.helpers';
// خدمة التحليل الغني (DDx + Must-Not-Miss + Investigations + ...)
// منفصلة عن runSmartRx عشان كل فلو ياخد نداء AI مستقل ومناسب
import { analyzeCaseDeeply, type CaseAnalysisResult } from '../../services/geminiCaseAnalysisService';
// كاش سحابي للتحليل — يحفظ النتيجة شهر ويرجعها فوراً لنفس الكشف
// (توفير ضخم في الكوتا والتكلفة لو الطبيب فتح نفس الكشف مرة تانية)
import {
  computeCaseAnalysisCacheKey,
  getCachedCaseAnalysis,
  saveCaseAnalysisToCache,
  type CachedTranslations,
} from '../../services/caseAnalysisCacheService';

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
  height: string;
  // حقول الهوية الجديدة: حرجة للتحليل الغني لأنها تحدد الـ DDx في الإناث
  gender: PatientGender | '';
  pregnant: boolean | null;
  breastfeeding: boolean | null;
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
  // state الخاص بنافذة تحليل الحالة الغنية (DDx + Must-Not-Miss + ...)
  setCaseAnalysisOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setCaseAnalysisResult: React.Dispatch<React.SetStateAction<CaseAnalysisResult | null>>;
  setCaseAnalysisLoading: React.Dispatch<React.SetStateAction<boolean>>;
  // علامة لإجبار عرض صف Dx فاضي بعد التحليل (تنبيه الطبيب للإضافة اليدوية)
  setNeedsManualDxHint: React.Dispatch<React.SetStateAction<boolean>>;
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
  height,
  gender,
  pregnant,
  breastfeeding,
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
  setCaseAnalysisOpen,
  setCaseAnalysisResult,
  setCaseAnalysisLoading,
  setNeedsManualDxHint,
  prescriptionRef,
  lastAddedItemIdRef,
  onTrackSmartPrescription,
  trackMedUsage,
  rxItems,
  buildRxInstructions,
  medications,
}: CreateSmartRxActionsParams) => {
  /**
   * تشغيل التحقق من الكوتا — دالة مشتركة بين الزرّين.
   * ترجع true لو نقدر نكمل، false لو الكوتا انتهت (وبتفتح مودال الكوتا لوحدها).
   */
  const checkQuotaBeforeAnalyze = async (e?: React.MouseEvent<any>): Promise<boolean> => {
    try {
      await consumeSmartPrescriptionQuota();
      return true;
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
        return false;
      }

      // ─ تشديد أمني (2026-04): ما عدش نكمل لو فحص الحد فشل ─
      // كان قبل: transient = continue (لتجربة offline أحسن)
      // المشكلة الأمنية: طبيب فاهم تقنياً يقدر يقفل استدعاء الـquota فقط (مع
      // إبقاء استدعاء الـAI شغال) ويستخدم الذكاء الاصطناعي بدون احتساب الحد.
      // الحل: لو الفحص فشل لأي سبب، نمنع الإجراء — حتى لو كانت شبكة عابرة.
      // ميزات الـAI محتاجة نت في كل الأحوال، فالـUX مايتأثرش فعلياً.
      if (isQuotaTransientError(error)) {
        showNotification(
          'تعذّر التحقق من حد تحليل الحالة. تأكد من اتصال الإنترنت وحاول مرة أخرى.',
          'error', e,
        );
        return false;
      }

      console.error('Case analysis quota check failed:', error);
      showNotification('حدث خطأ أثناء التحقق من حد التحليل اليومي. حاول مرة أخرى.', 'error', e);
      return false;
    }
  };

  /**
   * المرحلة المشتركة: ترجمة البيانات السريرية من عربي لإنجليزي طبي مع تخطي
   * حساب التشخيص (skipDiagnosis=true) — الزرّين الجدد يتركا Dx فاضي عشان
   * يُضاف يدوياً أو من نافذة DDx.
   * ترجع الترجمات المحفوظة عشان يتم كاشها.
   */
  const runTranslationPass = async (): Promise<CachedTranslations> => {
    const weightNum = parseFloat(weight);
    const weightValue = Number.isNaN(weightNum) ? 0 : weightNum;

    // ─ نقرأ التخصص من localStorage (نفس مصدر تحليل الحالة) عشان الترجمة تنتقي
    //   المصطلحات الإنجليزية الأنسب للتخصص.
    const doctorSpecialty = userId
      ? (() => {
          try {
            return localStorage.getItem(`doctor_specialty_${userId}`) || '';
          } catch {
            return '';
          }
        })()
      : '';

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
      userId, // للكاش per-doctor في الترجمة السريرية
      doctorSpecialty, // التخصص يدخل البرومبت + cache key مفصول حسب التخصص
      skipDiagnosis: true, // ← مهم: لا نستدعي analyzeComplaint (توفير نداء AI كامل)
    });

    // ملء الحقول الإنجليزية في الروشتة (الشكوى، التاريخ، الفحص، الفحوصات)
    setComplaintEn(out.translated.complaintEn);
    setHistoryEn(out.translated.historyEn);
    setExamEn(out.translated.examEn);
    setInvestigationsEn(out.translated.investigationsEn);
    // ⚠️ نترك diagnosisEn فاضي حسب طلب المستخدم — الطبيب يكتبه يدوياً أو من popup
    setDiagnosisEn('');
    // قص مخرجات الذكاء الاصطناعي لـ15 عنصر كحد أقصى حتى لا يتجاوز السقف المتفق عليه
    setRxItems((out.rxItems || []).slice(0, MAX_PRESCRIPTION_ITEMS_PER_LIST));

    return {
      complaintEn: out.translated.complaintEn,
      historyEn: out.translated.historyEn,
      examEn: out.translated.examEn,
      investigationsEn: out.translated.investigationsEn,
    };
  };

  /**
   * تطبيق ترجمة من الكاش مباشرة بدون أي نداء AI.
   * يحدّث الحقول في الـ state عشان تظهر في الروشتة زي اللي بيحصل بعد نداء AI.
   */
  const applyCachedTranslations = (translations: CachedTranslations) => {
    setComplaintEn(translations.complaintEn);
    setHistoryEn(translations.historyEn);
    setExamEn(translations.examEn);
    setInvestigationsEn(translations.investigationsEn);
    setDiagnosisEn('');
  };

  /**
   * إضافة سطر فارغ وتمرير تلقائي للروشتة — سلوك UI مشترك بين الزرّين.
   * (نفس منطق الزر القديم عشان تجربة الطبيب ما تتغيرش)
   */
  const scheduleUiPolish = () => {
    setTimeout(() => prescriptionRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
    setTimeout(() => {
      const newId = `empty-${Date.now()}`;
      lastAddedItemIdRef.current = newId;
      setRxItems((prev) => {
        // عدم إضافة السطر الفارغ لو وصلنا للحد الأقصى 15 عنصر
        if ((prev?.length || 0) >= MAX_PRESCRIPTION_ITEMS_PER_LIST) return prev;
        return [
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
      ];
      });
      setTimeout(() => {
        if (!lastAddedItemIdRef.current) return;
        const lastItem = getElementByRxItemId(lastAddedItemIdRef.current);
        if (lastItem) {
          lastItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
          const input = lastItem.querySelector(
            'input[placeholder*="اسم الدواء"], input[placeholder*="Medication"]'
          );
          if (input instanceof HTMLInputElement) input.focus();
        }
      }, 150);
    }, 450);
  };

  /**
   * زر "إضافة إلى الروشتة والسجلات" (السريع — بدون popup):
   * يترجم البيانات السريرية ويملّي الحقول الإنجليزية، ويترك Dx فاضي
   * لتنبيه الطبيب بكتابته يدوياً. لا يستدعي التحليل الغني (DDx) ولا يفتح نافذة.
   *
   * يستخدم الكاش السحابي للترجمة (نفس الكاش بتاع زر تحليل الحالة) — لو الطبيب
   * ضغط نفس الكشف قبل كده من أي زر، الترجمة تيجي جاهزة = صفر نداء AI = صفر تكلفة.
   */
  const handleQuickAddToRx = async (e?: React.MouseEvent<any>) => {
    if (!complaint.trim()) {
      showNotification('يرجى إدخال الشكوى قبل إضافة البيانات للروشتة', 'error', e);
      return;
    }

    // بيانات الكاش (نفس شكل إدخال deep analyze عشان نفس cacheKey = يستفيد من الكاش
    // السابق لو الطبيب ضغط "تحليل الحالة" قبل كده على نفس البيانات)
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const cacheInput = {
      complaint,
      medicalHistory,
      examination,
      investigations,
      ageYears: parseInt(ageYears) || 0,
      ageMonths: parseInt(ageMonths) || 0,
      ageDays: parseInt(ageDays) || 0,
      weightKg: Number.isNaN(weightNum) ? 0 : weightNum,
      heightCm: Number.isNaN(heightNum) ? undefined : heightNum,
      gender,
      pregnant,
      breastfeeding,
      vitals,
    };

    setAnalyzing(true);
    setErrorMsg(null);
    setSmartQuotaNotice(null);
    setSmartQuotaModalOpen(false);
    clearSmartQuotaStorage();

    // ─── 1) محاولة الكاش أولاً — لو ترجمة محفوظة نستخدمها مباشرة بدون AI ───
    let cacheKey = '';
    if (userId) {
      try {
        cacheKey = await computeCaseAnalysisCacheKey(cacheInput);
        const cached = await getCachedCaseAnalysis(userId, cacheKey);
        if (cached.hit && cached.translations) {
          // ⚡ Cache hit مع ترجمة — صفر نداء AI
          saveHistory();
          applyCachedTranslations(cached.translations);
          setNeedsManualDxHint(true);
          if (userId && onTrackSmartPrescription) onTrackSmartPrescription(complaint);
          scheduleUiPolish();
          showNotification('تمت الإضافة للروشتة — اكتب التشخيص يدوياً في حقل Dx', 'success', e);
          setAnalyzing(false);
          return;
        }
      } catch (cacheError) {
        // فشل الكاش = نكمل بنداء AI عادي
        console.warn('Quick add cache lookup failed:', cacheError);
      }
    }

    // ─── 2) Cache miss — نشيّك الكوتا ثم نعمل الترجمة ───
    const canProceed = await checkQuotaBeforeAnalyze(e);
    if (!canProceed) {
      setAnalyzing(false);
      return;
    }

    saveHistory();

    try {
      const freshTranslations = await runTranslationPass();
      // تفعيل الـ hint لإظهار صف Dx فاضي في الروشتة (علامة للطبيب إن يكتبه)
      setNeedsManualDxHint(true);

      // ─── 3) حفظ الترجمة في الكاش — الضغطة الجاية مجانية ───
      // merge:true بيحفظ translations بدون ما يمسح result لو كان موجود من deep analyze
      if (userId && cacheKey) {
        void saveCaseAnalysisToCache(userId, cacheKey, { translations: freshTranslations });
      }

      if (userId && onTrackSmartPrescription) {
        onTrackSmartPrescription(complaint);
      }

      scheduleUiPolish();
      showNotification('تمت الإضافة للروشتة — اكتب التشخيص يدوياً في حقل Dx', 'success', e);
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error));
      showNotification('حدث خطأ أثناء الإضافة للروشتة', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  /**
   * زر "تحليل الحالة" (الغني — بالـ popup):
   * يعمل نفس "إضافة سريعة" (ترجمة + Dx فاضي + سطر أدوية فاضي) زائد:
   *   - يفتح نافذة منبثقة بالـ DDx / Must-Not-Miss / Investigations / Instructions / ...
   *   - يحلل بالذكاء الاصطناعي مع الأخذ في الاعتبار: النوع، الحمل، الرضاعة،
   *     السن، الوزن، العلامات الحيوية، وكل البيانات السريرية.
   *   - يتحقق من كاش سحابي لنفس المدخلات الأول (30 يوم) — لو لقى نتيجة محفوظة
   *     يفتح النافذة فوراً بدون نداء AI (توفير كوتا + سرعة ~20x).
   * الترجمة + التحليل يجريان بالتوازي عشان نوفر وقت.
   */
  const handleDeepAnalyzeWithPopup = async (e?: React.MouseEvent<any>) => {
    if (!complaint.trim()) {
      showNotification('يرجى إدخال الشكوى قبل تحليل الحالة', 'error', e);
      return;
    }

    // ─ نقرأ تخصص الطبيب من الـlocalStorage (مكتوب من useMainAppProfile وقت
    //   تحميل الصفحة). الموديل بيستخدمه كـrole + يكيّف الـDDx على نطاق التخصص.
    //   لو مش موجود (signup قديم) → الموديل بيكمل بنمط طب الأسرة كـfallback.
    const doctorSpecialty = userId
      ? (() => {
          try {
            return localStorage.getItem(`doctor_specialty_${userId}`) || '';
          } catch {
            return '';
          }
        })()
      : '';

    // تجميع بيانات التحليل الغني — مع النوع/الحمل/الرضاعة + التخصص (مطلب المستخدم الأساسي)
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const deepInput = {
      complaint,
      medicalHistory,
      examination,
      investigations,
      ageYears: parseInt(ageYears) || 0,
      ageMonths: parseInt(ageMonths) || 0,
      ageDays: parseInt(ageDays) || 0,
      weightKg: Number.isNaN(weightNum) ? 0 : weightNum,
      heightCm: Number.isNaN(heightNum) ? undefined : heightNum,
      gender,
      pregnant,
      breastfeeding,
      vitals,
      doctorSpecialty,
    };

    setAnalyzing(true);
    setErrorMsg(null);
    setSmartQuotaNotice(null);
    setSmartQuotaModalOpen(false);
    clearSmartQuotaStorage();

    // افتح المودال فوراً في وضع "جاري التحميل" (تحقق الكاش سريع لكن مش فوري)
    setCaseAnalysisResult(null);
    setCaseAnalysisLoading(true);
    setCaseAnalysisOpen(true);

    // ─── 1) محاولة الكاش أولاً (قبل أي نداء AI أو استهلاك كوتا) ───
    // الكاش ممكن يرجع 4 حالات:
    //   (أ) miss تماماً → نشغل AI كامل (تحليل + ترجمة)
    //   (ب) hit بترجمة فقط (من زر Quick سابق) → نشغل AI للتحليل بس، نوفّر الترجمة
    //   (ج) hit بتحليل فقط (كاش قديم قبل إضافة الترجمة) → نشغل AI للترجمة بس
    //   (د) hit كامل (تحليل + ترجمة) → صفر نداء AI، فوري
    let cacheKey = '';
    let cachedTranslationsForReuse: CachedTranslations | null = null;
    let needsAnalysisCall = true;   // هل نحتاج نشغل analyzeCaseDeeply؟
    let needsTranslationCall = true; // هل نحتاج نشغل runTranslationPass؟

    if (userId) {
      try {
        cacheKey = await computeCaseAnalysisCacheKey(deepInput);
        const cached = await getCachedCaseAnalysis(userId, cacheKey);
        if (cached.hit) {
          // حالة (د): كل شيء موجود → فوري بدون أي AI
          if (cached.result && cached.translations) {
            setCaseAnalysisResult(cached.result);
            setCaseAnalysisLoading(false);
            saveHistory();
            applyCachedTranslations(cached.translations);
            setNeedsManualDxHint(true);
            scheduleUiPolish();
            showNotification('اكتمل تحليل الحالة — راجع الاقتراحات في النافذة', 'success', e);
            setAnalyzing(false);
            return;
          }

          // حالة (ج): تحليل موجود، ترجمة لا → نعرض التحليل + نشغل ترجمة فقط
          if (cached.result && !cached.translations) {
            setCaseAnalysisResult(cached.result);
            setCaseAnalysisLoading(false);
            needsAnalysisCall = false;  // التحليل محفوظ، مش محتاج AI
          }

          // حالة (ب): ترجمة موجودة، تحليل لا (من زر Quick) → نوفر الترجمة فقط
          if (cached.translations && !cached.result) {
            cachedTranslationsForReuse = cached.translations;
            needsTranslationCall = false; // الترجمة محفوظة، مش محتاج AI
          }
        }
      } catch (cacheError) {
        console.warn('Case analysis cache lookup failed:', cacheError);
      }
    }

    // ─── 2) نحتاج نداء AI جديد (أي حالة غير الكاش الكامل) ───
    const canProceed = await checkQuotaBeforeAnalyze(e);
    if (!canProceed) {
      setAnalyzing(false);
      setCaseAnalysisLoading(false);
      setCaseAnalysisOpen(false);
      return;
    }

    saveHistory();

    // لو الترجمة جاية من الكاش نطبّقها فوراً عشان الطبيب يشوف الحقول ممتلئة
    // حتى أثناء تشغيل التحليل الغني
    if (cachedTranslationsForReuse) {
      applyCachedTranslations(cachedTranslationsForReuse);
    }

    try {
      // نشغل بس اللي محتاجينه: الترجمة و/أو التحليل. لو كلاهما → بالتوازي
      const tasks: Array<Promise<unknown>> = [];
      if (needsTranslationCall) tasks.push(runTranslationPass());
      if (needsAnalysisCall) tasks.push(analyzeCaseDeeply(deepInput));
      const results = await Promise.all(tasks);

      // نفك النتائج حسب الـ order اللي ضفناها بيه
      let freshTranslations: CachedTranslations | null = null;
      let deepResult: CaseAnalysisResult | null = null;
      let idx = 0;
      if (needsTranslationCall) freshTranslations = results[idx++] as CachedTranslations;
      if (needsAnalysisCall) deepResult = results[idx++] as CaseAnalysisResult;

      // لو التحليل اتعمل دلوقتي نعرضه؛ لو كان من الكاش فـ state متحدّث أصلاً
      if (deepResult) {
        setCaseAnalysisResult(deepResult);
        setCaseAnalysisLoading(false);
      }
      setNeedsManualDxHint(true);

      // ─── 3) حفظ الجديد في الكاش (merge: ما يمسحش الحاجات القديمة الموجودة) ───
      // بنحفظ بس اللي اتعمل جديد — والـ merge في saveCaseAnalysisToCache بيضمن
      // إن الحاجات الموجودة (من الكاش) ما تتمسحش.
      if (userId && cacheKey) {
        const patch: { result?: CaseAnalysisResult; translations?: CachedTranslations } = {};
        if (deepResult && !deepResult.insufficientData) patch.result = deepResult;
        if (freshTranslations) patch.translations = freshTranslations;
        if (patch.result || patch.translations) {
          void saveCaseAnalysisToCache(userId, cacheKey, patch);
        }
      }

      if (userId && onTrackSmartPrescription) {
        onTrackSmartPrescription(complaint);
      }

      scheduleUiPolish();
      showNotification('اكتمل تحليل الحالة — راجع الاقتراحات في النافذة', 'success', e);
    } catch (error: unknown) {
      setCaseAnalysisLoading(false);
      setErrorMsg(getErrorMessage(error));
      showNotification('حدث خطأ أثناء تحليل الحالة', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  /**
   * توافق عكسي (backward compat): اسم الدالة القديم `handleFullAutomatedRX`
   * لسه مُستعمل في useDrHyper.ts و MainAppViewRouter. نوجّهه للدالة الغنية
   * الجديدة (التحليل الكامل مع popup) لأنه ده المطلب الأساسي من المستخدم.
   */
  const handleFullAutomatedRX = handleDeepAnalyzeWithPopup;

  /** إضافة دواء يدوياً من قاعدة البيانات المحلية للجهاز */
  const handleAddManualMedication = (med: Medication, dosage: string) => {
    // منع تجاوز الحد الأقصى 15 دواء/ملاحظة في الروشتة
    if ((rxItems?.length || 0) >= MAX_PRESCRIPTION_ITEMS_PER_LIST) {
      showNotification(`الحد الأقصى ${MAX_PRESCRIPTION_ITEMS_PER_LIST} عنصر في قائمة الأدوية`, 'error');
      return;
    }
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
    handleFullAutomatedRX,          // يعمل handleDeepAnalyzeWithPopup (توافق عكسي)
    handleDeepAnalyzeWithPopup,     // زر "تحليل الحالة" — بالـ popup
    handleQuickAddToRx,             // زر "إضافة إلى الروشتة والسجلات" — بدون popup
    handleAddManualMedication,
  };
};

