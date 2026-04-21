/**
 * useDrHyper.saveRecord — منطق حفظ سجل المريض
 *
 * `createSaveRecordAction` هو factory يُرجع `handleSaveRecord` كـ دالة
 * async تغلف كل منطق حفظ سجل المريض الجديد أو تحديث الحالي.
 *
 * بعد التقسيم:
 *   - `useDrHyper.saveRecord.types.ts`          : واجهات الـ params والنتيجة.
 *   - `useDrHyper.saveRecord.patientFile.ts`    : حل مرجع ملف المريض والمزامنة.
 *   - `useDrHyper.saveRecord.priceResolvers.ts` : جلب الأسعار + branchId المحفوظة.
 *   - `useDrHyper.saveRecord.quotaCheck.ts`     : فحص الحصة اليومية قبل الحفظ.
 *   - `useDrHyper.saveRecord.paymentPayload.ts` : بناء جزء الدفع (كاش/تأمين/خصم).
 */

import React from 'react';
import { addDoc, collection, deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { DEFAULT_BRANCH_ID } from '../../services/firestore/branches';
import { usageTrackingService } from '../../services/usageTrackingService';
import { buildClinicalPayload } from './useDrHyper.recordHelpers';
import {
  CONSULTATION_RECORD_PREFIX,
  buildGeneratedConsultationRecordId,
} from './useDrHyper.consultationRecords';
import { buildCairoDateWithCurrentTime } from '../../utils/cairoTime';
import { buildPatientFileNameKey } from '../../services/patient-files';
import type { CreateSaveRecordActionParams, SaveRecordResult } from './useDrHyper.saveRecord.types';
import {
  resolvePatientFileReference,
  syncPatientIdentityAfterSave,
} from './useDrHyper.saveRecord.patientFile';
import {
  getPersistedBranchId,
  getPersistedServiceBasePrice,
  resolveCurrentServicePrices,
} from './useDrHyper.saveRecord.priceResolvers';
import { runPreSaveQuotaCheck } from './useDrHyper.saveRecord.quotaCheck';
import { buildPaymentPayload } from './useDrHyper.saveRecord.paymentPayload';

export type { CreateSaveRecordActionParams, SaveRecordResult } from './useDrHyper.saveRecord.types';

export const createSaveRecordAction = ({
  user,
  patientName,
  phone,
  ageYears,
  ageMonths,
  ageDays,
  weight,
  height,
  bmi,
  vitals,
  complaintEn,
  historyEn,
  examEn,
  investigationsEn,
  diagnosisEn,
  rxItems,
  generalAdvice,
  labInvestigations,
  complaint,
  medicalHistory,
  examination,
  investigations,
  visitDate,
  visitType,
  activeVisitDateTime,
  lastSavedHash,
  activeRecordId,
  isConsultationMode,
  consultationSourceRecordId,
  activePatientFileId,
  activePatientFileNumber,
  activePatientFileNameKey,
  setActiveRecordId,
  setActiveVisitDateTime,
  setActivePatientFileId,
  setActivePatientFileNumber,
  setActivePatientFileNameKey,
  setIsConsultationMode,
  setConsultationSourceRecordId,
  setIsPastConsultationMode,
  setLastSavedHash,
  sanitizeRxItemsForSave,
  sanitizeForFirestore,
  consumeStorageQuota,
  extractSmartQuotaErrorDetails,
  getQuotaReachedMessage,
  openQuotaNoticeModal,
  showNotification,
  markOfflineSyncPendingIfNeeded,
  paymentType,
  insuranceCompanyId,
  insuranceCompanyName,
  insuranceApprovalCode,
  insuranceMembershipId,
  patientSharePercent,
  discountAmount,
  discountPercent,
  discountReasonId,
  discountReasonLabel,
  activeBranchId,
}: CreateSaveRecordActionParams) => {
  // تنبيه بنتيجة الحفظ — رسالة أوفلاين أو نجاح عادي
  const notifySaveResult = (offlineMessage: string, onlineMessage: string) => {
    if (markOfflineSyncPendingIfNeeded()) {
      showNotification(offlineMessage, 'info', { id: 'save-record-success' });
      return;
    }
    showNotification(onlineMessage, 'success', { id: 'save-record-success' });
  };

  // تتبّع عدد السجلات المحفوظة في usage analytics
  const trackSavedRecord = (type: string, recordId: string) => {
    void usageTrackingService.trackEvent({
      doctorId: user?.uid || '',
      eventType: 'patientRecord',
      metadata: { type, recordId },
    });
  };

  const handleSaveRecord = async (e?: React.MouseEvent<HTMLElement>): Promise<SaveRecordResult> => {
    // ─── Validations المبدئية ──────────────────────────────────────────
    if (!patientName.trim()) {
      showNotification('يرجى إدخال اسم المريض أولاً', 'error', { id: 'save-record-validation' });
      return { ok: false, reason: 'validation' };
    }
    if (!user) {
      showNotification('يجب تسجيل الدخول أولاً', 'error', e);
      return { ok: false, reason: 'auth' };
    }

    // ─── بناء تاريخ الزيارة (ISO) مع حماية السجل المحمّل ───────────────
    const buildVisitIso = () => {
      const preservedVisitIso = String(activeVisitDateTime || '').trim();
      // لو عندنا سجل محمّل بتاريخ ISO صالح، نحافظ عليه (ما نكتبش فوقه)
      if (activeRecordId && preservedVisitIso) {
        const preservedTs = Date.parse(preservedVisitIso);
        if (Number.isFinite(preservedTs)) {
          return new Date(preservedTs).toISOString();
        }
      }
      const cairoDate = buildCairoDateWithCurrentTime(visitDate);
      if (Number.isNaN(cairoDate.getTime())) return new Date().toISOString();
      return cairoDate.toISOString();
    };

    const visitIso = buildVisitIso();
    // dateMs: رقم ثابت بالميلي ثانية — يُستعمل للفرز والفلترة على السيرفر بأمان.
    // بديل موحد لحقل date المتغير النوع (string/Timestamp/number) في السجلات القديمة.
    const visitDateMs = (() => {
      const parsed = Date.parse(visitIso);
      return Number.isFinite(parsed) ? parsed : Date.now();
    })();
    const shouldSaveAsConsultation = visitType === 'consultation';

    // ─── جلب الأسعار الحالية (helper مستخرج) ───────────────────────────
    const { examPrice: resolvedExamServicePrice, consultationPrice: resolvedConsultServicePrice } =
      await resolveCurrentServicePrices(user.uid, activeBranchId);
    const resolvedServiceBasePrice = shouldSaveAsConsultation
      ? resolvedConsultServicePrice
      : resolvedExamServicePrice;

    // ─── بناء الـ clinical payload + بيانات الدفع ──────────────────────
    const sanitizedRxItems = sanitizeRxItemsForSave(rxItems);
    const clinicalPayload = buildClinicalPayload({
      complaintEn,
      historyEn,
      examEn,
      investigationsEn,
      diagnosisEn,
      rxItems: sanitizedRxItems,
      generalAdvice,
      labInvestigations,
      complaintAr: complaint,
      historyAr: medicalHistory,
      examAr: examination,
      investigationsAr: investigations,
    });

    const paymentPayload = buildPaymentPayload({
      paymentType,
      insuranceCompanyId,
      insuranceCompanyName,
      insuranceApprovalCode,
      insuranceMembershipId,
      patientSharePercent,
      discountAmount,
      discountPercent,
      discountReasonId,
      discountReasonLabel,
    });

    const currentData = {
      patientName,
      phone: phone || undefined,
      age: { years: ageYears, months: ageMonths, days: ageDays },
      weight,
      height: height || undefined,
      bmi: bmi || undefined,
      vitals,
      ...clinicalPayload,
      date: visitIso,
      dateMs: visitDateMs,
      branchId: activeBranchId || DEFAULT_BRANCH_ID,
      ...paymentPayload,
      serviceBasePrice: Number.isFinite(Number(resolvedServiceBasePrice))
        ? Number(resolvedServiceBasePrice)
        : undefined,
    };

    // نضمن إن تبديل النوع (كشف/استشارة) يغيّر الـ hash حتى لو الأسعار متطابقة
    const currentHash = JSON.stringify({ ...currentData, __visitType: visitType });
    if (currentHash === lastSavedHash) {
      showNotification('لا توجد تغييرات جديدة ليتم حفظها في سجلات المرضى', 'info', e);
      return { ok: false, reason: 'no-changes' };
    }

    // ─── فحص الحصة اليومية قبل الحفظ (helper مستخرج) ──────────────────
    const quotaResult = await runPreSaveQuotaCheck({
      consumeStorageQuota,
      extractSmartQuotaErrorDetails,
      getQuotaReachedMessage,
      openQuotaNoticeModal,
      showNotification,
      e,
    });
    if (!quotaResult.ok) return quotaResult;

    try {
      let savedRecordId: string | undefined;

      // ─── حل مرجع ملف المريض (helper مستخرج) ───────────────────────────
      const patientFileReference = await resolvePatientFileReference({
        userId: user.uid,
        patientName,
        phone,
        ageYears,
        ageMonths,
        ageDays,
        activePatientFileId,
        activePatientFileNumber,
        activePatientFileNameKey,
      });

      const normalizedActivePatientFileId = String(activePatientFileId || '').trim();
      const parsedActivePatientFileNumber = Number(activePatientFileNumber);
      const normalizedActivePatientFileNameKey = String(activePatientFileNameKey || '').trim();

      const targetPatientFileNameKey =
        buildPatientFileNameKey(patientName) ||
        String(patientFileReference?.patientFileNameKey || '').trim();

      const patientFilePayload = patientFileReference
        ? {
            patientFileId: patientFileReference.patientFileId,
            patientFileNumber: patientFileReference.patientFileNumber,
            patientFileNameKey: targetPatientFileNameKey,
          }
        : {};

      const payload = sanitizeForFirestore(currentData) as Record<string, unknown>;
      if (!payload || typeof payload !== 'object') {
        showNotification('خطأ: بيانات غير صالحة للحفظ', 'error', e);
        return { ok: false, reason: 'error' };
      }

      // ─── الحالات الخمس: أي طريقة حفظ ستُستخدم ────────────────────────

      // حالة خاصة: سجل محمّل كاستشارة لكن الطبيب بدّل النوع إلى "كشف"
      // المطلوب: تحويل الاستشارة إلى كشف — نحذف المستند القديم ونحفظ مستند كشف جديد
      // علشان ما يفضلش `isConsultationOnly: true` أو ID بـ prefix الاستشارة.
      const isConvertingConsultationToExam =
        isConsultationMode && visitType === 'exam' && Boolean(activeRecordId);

      if (isConvertingConsultationToExam) {
        const oldConsultationRecordId = String(activeRecordId || '').trim();
        if (oldConsultationRecordId) {
          try {
            await deleteDoc(doc(db, 'users', user.uid, 'records', oldConsultationRecordId));
          } catch (deleteError) {
            console.warn(
              'Failed to delete old consultation during conversion to exam:',
              deleteError,
            );
          }
        }

        const docRef = await addDoc(collection(db, 'users', user.uid, 'records'), {
          ...payload,
          ...patientFilePayload,
          createdAt: serverTimestamp(),
        });
        setActiveRecordId(docRef.id);
        setIsConsultationMode(false);
        setConsultationSourceRecordId(null);
        savedRecordId = docRef.id;

        notifySaveResult(
          'تم تحويل الاستشارة إلى كشف محليا بدون إنترنت، وستتم المزامنة تلقائيا عند عودة الاتصال',
          'تم تحويل الاستشارة إلى كشف وحفظها بنجاح',
        );

        trackSavedRecord('consultation_converted_to_exam', docRef.id);
      } else if (isConsultationMode) {
        // حفظ/تحديث استشارة (مرتبطة بكشف أو مستقلة)
        const activeRecordIdText = String(activeRecordId || '').trim();
        const isEditingExistingConsultationRecord = activeRecordIdText.startsWith(
          CONSULTATION_RECORD_PREFIX,
        );
        const sourceExamRecordId =
          String(consultationSourceRecordId || '').trim() ||
          (!isEditingExistingConsultationRecord ? activeRecordIdText : '');

        const consultationDocId = isEditingExistingConsultationRecord
          ? activeRecordIdText
          : buildGeneratedConsultationRecordId(
              sourceExamRecordId || undefined,
              String(currentData.date || ''),
            );

        if (!consultationDocId) {
          showNotification('تعذر تحديد سجل الاستشارة المطلوب حفظه', 'error', e);
          return { ok: false, reason: 'error' };
        }

        const persistedConsultationServiceBasePrice = isEditingExistingConsultationRecord
          ? await getPersistedServiceBasePrice(user.uid, consultationDocId)
          : undefined;
        // حماية branchId للاستشارات الموجودة (نفس منطق الكشف)
        const persistedConsultationBranchId = isEditingExistingConsultationRecord
          ? await getPersistedBranchId(user.uid, consultationDocId)
          : undefined;

        const consultationUpdate = sanitizeForFirestore({
          patientName,
          phone: phone || undefined,
          age: { years: ageYears, months: ageMonths, days: ageDays },
          weight,
          height: height || undefined,
          bmi: bmi || undefined,
          vitals,
          date: visitIso,
          dateMs: visitDateMs,
          ...clinicalPayload,
          isConsultationOnly: true,
          branchId: persistedConsultationBranchId || activeBranchId || DEFAULT_BRANCH_ID,
          sourceExamRecordId: sourceExamRecordId || undefined,
          ...patientFilePayload,
          ...paymentPayload,
          serviceBasePrice: Number.isFinite(Number(persistedConsultationServiceBasePrice))
            ? Number(persistedConsultationServiceBasePrice)
            : Number.isFinite(Number(resolvedConsultServicePrice))
              ? Number(resolvedConsultServicePrice)
              : undefined,
        }) as Record<string, unknown>;

        await setDoc(
          doc(db, 'users', user.uid, 'records', consultationDocId),
          {
            ...consultationUpdate,
            ...(isEditingExistingConsultationRecord ? {} : { createdAt: serverTimestamp() }),
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
        savedRecordId = consultationDocId;

        if (!isEditingExistingConsultationRecord) {
          setActiveRecordId(consultationDocId);
        }

        notifySaveResult(
          'تم حفظ الاستشارة محليا بدون إنترنت، وستتم المزامنة تلقائيا عند عودة الاتصال',
          'تم حفظ الاستشارة بنجاح',
        );

        trackSavedRecord('consultation', consultationDocId);
      } else if (activeRecordId) {
        // تحديث كشف موجود — نحمي السعر و branchId الأصليين من الكتابة
        const persistedExamServiceBasePrice = await getPersistedServiceBasePrice(
          user.uid,
          activeRecordId,
        );
        const persistedExamBranchId = await getPersistedBranchId(user.uid, activeRecordId);
        const updatePayload = {
          ...payload,
          serviceBasePrice: Number.isFinite(Number(persistedExamServiceBasePrice))
            ? Number(persistedExamServiceBasePrice)
            : payload.serviceBasePrice,
          branchId: persistedExamBranchId || payload.branchId,
        };

        await setDoc(
          doc(db, 'users', user.uid, 'records', activeRecordId),
          {
            ...updatePayload,
            ...patientFilePayload,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
        savedRecordId = activeRecordId;

        notifySaveResult(
          'تم تحديث السجل محليا بدون إنترنت، وستتم المزامنة تلقائيا عند عودة الاتصال',
          'تم تحديث السجل بنجاح',
        );
      } else if (shouldSaveAsConsultation) {
        // استشارة جديدة مستقلة (بدون كشف مرتبط)
        const minimalRecordRaw = {
          patientName,
          phone: phone || undefined,
          age: { years: ageYears, months: ageMonths, days: ageDays },
          weight,
          height: height || undefined,
          bmi: bmi || undefined,
          vitals,
          date: visitIso,
          dateMs: visitDateMs,
          ...clinicalPayload,
          isConsultationOnly: true,
          branchId: activeBranchId || DEFAULT_BRANCH_ID,
          ...patientFilePayload,
          ...paymentPayload,
          serviceBasePrice: Number.isFinite(Number(resolvedConsultServicePrice))
            ? Number(resolvedConsultServicePrice)
            : undefined,
        };

        const sanitizedRecord = sanitizeForFirestore(minimalRecordRaw) as Record<string, unknown>;
        const finalRecord = {
          ...sanitizedRecord,
          createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, 'users', user.uid, 'records'), finalRecord);
        setActiveRecordId(docRef.id);
        savedRecordId = docRef.id;
        setIsPastConsultationMode(false);

        notifySaveResult(
          'تم حفظ الاستشارة كسجل جديد محليا بدون إنترنت، وستتم المزامنة تلقائيا عند عودة الاتصال',
          'تم حفظ الاستشارة كسجل جديد بنجاح',
        );

        trackSavedRecord('new_consultation', docRef.id);
      } else {
        // سجل كشف جديد تماماً
        const docRef = await addDoc(collection(db, 'users', user.uid, 'records'), {
          ...payload,
          ...patientFilePayload,
          createdAt: serverTimestamp(),
        });
        setActiveRecordId(docRef.id);
        savedRecordId = docRef.id;

        notifySaveResult(
          'تم حفظ السجل الجديد محليا بدون إنترنت، وستتم المزامنة تلقائيا عند عودة الاتصال',
          'تم حفظ السجل الجديد بنجاح',
        );

        trackSavedRecord('new_record', docRef.id);
      }

      // ─── تحديث الحالة المحلية بمرجع ملف المريض ───────────────────────
      if (patientFileReference) {
        setActivePatientFileId(patientFileReference.patientFileId);
        setActivePatientFileNumber(patientFileReference.patientFileNumber);
        setActivePatientFileNameKey(
          targetPatientFileNameKey || patientFileReference.patientFileNameKey,
        );
      }

      // مزامنة هوية المريض عبر كل السجلات/المواعيد (helper مستخرج)
      const syncResult = await syncPatientIdentityAfterSave({
        userId: user.uid,
        patientName,
        phone,
        ageYears,
        ageMonths,
        ageDays,
        patientFileReference,
        normalizedActivePatientFileId,
        parsedActivePatientFileNumber,
        normalizedActivePatientFileNameKey,
        targetPatientFileNameKey,
      });

      if (syncResult) {
        setActivePatientFileId(syncResult.patientFileId);
        setActivePatientFileNumber(syncResult.patientFileNumber);
        setActivePatientFileNameKey(syncResult.patientFileNameKey);
      }

      setActiveVisitDateTime(visitIso);
      setLastSavedHash(currentHash);
      return { ok: true, recordId: savedRecordId };
    } catch (error: unknown) {
      console.error('Error saving record:', error);
      const friendly = 'حدث خطأ أثناء الحفظ. يرجى التحقق من اتصال الإنترنت';
      showNotification(friendly, 'error', { id: 'save-record-error' });
      return { ok: false, reason: 'error' };
    }
  };

  return { handleSaveRecord };
};
