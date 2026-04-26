/**
 * useDrHyperDraft — حفظ تلقائي لصفحة "كشف جديد" + تتبع التغييرات غير المحفوظة
 *
 * يقوم بثلاث مهام:
 *  1. Autosave: يخزن الحقول الحالية (اسم المريض، الأعمار، الشكوى، الأدوية، …)
 *     في localStorage بشكل debounced حتى لو انقطع التيار يعود المستخدم للبيانات.
 *  2. Restore: عند إقلاع الهوك لأول مرة لمستخدم معين، يقرأ الـ draft المحفوظ
 *     ويعيد ملء الفورم، ويظهر toast معلوماتية.
 *  3. Dirty tracking: يحسب بصمة (signature) حية للفورم ويقارنها ببصمة آخر حفظ
 *     ليعرف هل توجد تغييرات غير محفوظة.
 */

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { DrHyperPatientState } from './useDrHyper.patientState';

const DRAFT_KEY_PREFIX = 'dh_rx_draft_v1:';
const DRAFT_DEBOUNCE_MS = 700;

interface DraftPayload {
  v: 1;
  ts: number;
  state: Record<string, unknown>;
}

/**
 * يبني كائن من حقول المحتوى التي يحررها المستخدم فقط.
 * ملاحظة: لا يتضمن متعلقات الجلسة (activeRecordId، activePatientFileId، visitDate…)
 * لأن تلك الحقول تتعدل كجانب‑أثر أثناء الحفظ، وإدراجها كان يجعل hasUnsavedChanges
 * يظل true بعد الحفظ مباشرة.
 */
const buildSerializableState = (state: DrHyperPatientState): Record<string, unknown> => ({
  patientName: state.patientName,
  phone: state.phone,
  ageYears: state.ageYears,
  ageMonths: state.ageMonths,
  ageDays: state.ageDays,
  weight: state.weight,
  height: state.height,
  vitals: state.vitals,
  complaint: state.complaint,
  medicalHistory: state.medicalHistory,
  examination: state.examination,
  investigations: state.investigations,
  complaintEn: state.complaintEn,
  historyEn: state.historyEn,
  examEn: state.examEn,
  investigationsEn: state.investigationsEn,
  diagnosisEn: state.diagnosisEn,
  rxItems: state.rxItems,
  generalAdvice: state.generalAdvice,
  labInvestigations: state.labInvestigations,
  visitType: state.visitType,
  paymentType: state.paymentType,
  insuranceCompanyId: state.insuranceCompanyId,
  insuranceCompanyName: state.insuranceCompanyName,
  insuranceApprovalCode: state.insuranceApprovalCode,
  insuranceMembershipId: state.insuranceMembershipId,
  patientSharePercent: state.patientSharePercent,
  discountAmount: state.discountAmount,
  discountPercent: state.discountPercent,
  discountReasonId: state.discountReasonId,
  discountReasonLabel: state.discountReasonLabel,
});

/** هل الحقول الحالية تحوي أي بيانات ذات معنى؟ يستخدم لتجنب حفظ draft فارغ وللتحذير. */
const hasMeaningfulContent = (snapshot: Record<string, unknown>): boolean => {
  const s = snapshot as any;
  if (String(s.patientName || '').trim()) return true;
  if (String(s.phone || '').trim()) return true;
  if (Array.isArray(s.rxItems) && s.rxItems.length > 0) return true;
  if (Array.isArray(s.generalAdvice) && s.generalAdvice.length > 0) return true;
  if (Array.isArray(s.labInvestigations) && s.labInvestigations.length > 0) return true;
  if (String(s.complaint || '').trim()) return true;
  if (String(s.medicalHistory || '').trim()) return true;
  if (String(s.examination || '').trim()) return true;
  if (String(s.investigations || '').trim()) return true;
  if (String(s.diagnosisEn || '').trim()) return true;
  if (String(s.weight || '').trim()) return true;
  if (String(s.height || '').trim()) return true;
  const vitals = s.vitals || {};
  if (Object.values(vitals).some((v: any) => String(v || '').trim())) return true;
  return false;
};

const readDraftFromStorage = (userId: string): DraftPayload | null => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY_PREFIX + userId);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.v !== 1 || !parsed.state) return null;
    return parsed as DraftPayload;
  } catch {
    return null;
  }
};

const writeDraftToStorage = (userId: string, state: Record<string, unknown>) => {
  try {
    const payload: DraftPayload = { v: 1, ts: Date.now(), state };
    localStorage.setItem(DRAFT_KEY_PREFIX + userId, JSON.stringify(payload));
  } catch {
    // تجاهل أخطاء التخزين (quota/privacy mode)
  }
};

const removeDraftFromStorage = (userId: string) => {
  try {
    localStorage.removeItem(DRAFT_KEY_PREFIX + userId);
  } catch {
    // ignore
  }
};

interface UseDrHyperDraftParams {
  userId: string | undefined;
  patientState: DrHyperPatientState;
  showNotification: (
    message: string,
    type?: 'success' | 'error' | 'info',
    options?: any,
  ) => void;
}

interface UseDrHyperDraftReturn {
  /** هل توجد بيانات في الفورم غير محفوظة في سجلات المرضى؟ */
  hasUnsavedChanges: boolean;
  /** يتم استدعاؤها بعد نجاح handleSaveRecord: تحدد "البصمة المحفوظة" وتمسح الـ draft. */
  markDraftSaved: () => void;
  /** يتم استدعاؤها بعد handleReset: تمسح الـ draft وتعيد ضبط dirty-tracking. */
  clearDraft: () => void;
}

export const useDrHyperDraft = ({
  userId,
  patientState,
  showNotification,
}: UseDrHyperDraftParams): UseDrHyperDraftReturn => {
  // بصمة آخر حفظ/إعادة ضبط — نستخدمها لمقارنة التغييرات غير المحفوظة.
  const [savedSignature, setSavedSignature] = useState<string>('');
  const restoredRef = useRef<string | null>(null);

  // البصمة الحية للفورم — تتغير مع أي تعديل.
  const { liveSignature, liveSnapshot } = useMemo(() => {
    const snapshot = buildSerializableState(patientState);
    return { liveSignature: JSON.stringify(snapshot), liveSnapshot: snapshot };
  }, [
    patientState.patientName,
    patientState.phone,
    patientState.ageYears,
    patientState.ageMonths,
    patientState.ageDays,
    patientState.weight,
    patientState.height,
    patientState.vitals,
    patientState.complaint,
    patientState.medicalHistory,
    patientState.examination,
    patientState.investigations,
    patientState.complaintEn,
    patientState.historyEn,
    patientState.examEn,
    patientState.investigationsEn,
    patientState.diagnosisEn,
    patientState.rxItems,
    patientState.generalAdvice,
    patientState.labInvestigations,
    patientState.visitType,
    patientState.paymentType,
    patientState.insuranceCompanyId,
    patientState.insuranceCompanyName,
    patientState.insuranceApprovalCode,
    patientState.insuranceMembershipId,
    patientState.patientSharePercent,
    patientState.discountAmount,
    patientState.discountPercent,
    patientState.discountReasonId,
    patientState.discountReasonLabel,
  ]);

  // الاستعادة عند الإقلاع — تحدث مرة واحدة لكل userId.
  useEffect(() => {
    if (!userId) return;
    if (restoredRef.current === userId) return;
    restoredRef.current = userId;

    const draft = readDraftFromStorage(userId);
    if (!draft) {
      // لا يوجد draft محفوظ — نعتبر البصمة الحالية (الفارغة) كحالة "محفوظة".
      setSavedSignature(JSON.stringify(buildSerializableState(patientState)));
      return;
    }

    // لو الفورم الحالي فيه بيانات (مثلا فتح من موعد) لا نستبدلها بالـ draft.
    const currentSnapshot = buildSerializableState(patientState);
    if (hasMeaningfulContent(currentSnapshot)) {
      setSavedSignature(JSON.stringify(currentSnapshot));
      return;
    }

    if (!hasMeaningfulContent(draft.state)) {
      removeDraftFromStorage(userId);
      setSavedSignature(JSON.stringify(currentSnapshot));
      return;
    }

    // استرجاع البيانات إلى الفورم.
    const s = draft.state as any;
    try {
      if (typeof s.patientName === 'string') patientState.setPatientName(s.patientName);
      if (typeof s.phone === 'string') patientState.setPhone(s.phone);
      if (typeof s.ageYears === 'string') patientState.setAgeYears(s.ageYears);
      if (typeof s.ageMonths === 'string') patientState.setAgeMonths(s.ageMonths);
      if (typeof s.ageDays === 'string') patientState.setAgeDays(s.ageDays);
      if (typeof s.weight === 'string') patientState.setWeight(s.weight);
      if (typeof s.height === 'string') patientState.setHeight(s.height);
      if (s.vitals && typeof s.vitals === 'object') patientState.setVitals(s.vitals);
      if (typeof s.complaint === 'string') patientState.setComplaint(s.complaint);
      if (typeof s.medicalHistory === 'string') patientState.setMedicalHistory(s.medicalHistory);
      if (typeof s.examination === 'string') patientState.setExamination(s.examination);
      if (typeof s.investigations === 'string') patientState.setInvestigations(s.investigations);
      if (typeof s.complaintEn === 'string') patientState.setComplaintEn(s.complaintEn);
      if (typeof s.historyEn === 'string') patientState.setHistoryEn(s.historyEn);
      if (typeof s.examEn === 'string') patientState.setExamEn(s.examEn);
      if (typeof s.investigationsEn === 'string') patientState.setInvestigationsEn(s.investigationsEn);
      if (typeof s.diagnosisEn === 'string') patientState.setDiagnosisEn(s.diagnosisEn);
      if (Array.isArray(s.rxItems)) patientState.setRxItems(s.rxItems);
      if (Array.isArray(s.generalAdvice)) patientState.setGeneralAdvice(s.generalAdvice);
      if (Array.isArray(s.labInvestigations)) patientState.setLabInvestigations(s.labInvestigations);
      if (s.visitType === 'exam' || s.visitType === 'consultation') patientState.setVisitType(s.visitType);
      if (s.paymentType === 'cash' || s.paymentType === 'insurance' || s.paymentType === 'discount') {
        patientState.setPaymentType(s.paymentType);
      }
      if (typeof s.insuranceCompanyId === 'string') patientState.setInsuranceCompanyId(s.insuranceCompanyId);
      if (typeof s.insuranceCompanyName === 'string') patientState.setInsuranceCompanyName(s.insuranceCompanyName);
      if (typeof s.insuranceApprovalCode === 'string') patientState.setInsuranceApprovalCode(s.insuranceApprovalCode);
      if (typeof s.insuranceMembershipId === 'string') patientState.setInsuranceMembershipId(s.insuranceMembershipId);
      if (typeof s.patientSharePercent === 'number') patientState.setPatientSharePercent(s.patientSharePercent);
      if (typeof s.discountAmount === 'number') patientState.setDiscountAmount(s.discountAmount);
      if (typeof s.discountPercent === 'number') patientState.setDiscountPercent(s.discountPercent);
      if (typeof s.discountReasonId === 'string') patientState.setDiscountReasonId(s.discountReasonId);
      if (typeof s.discountReasonLabel === 'string') patientState.setDiscountReasonLabel(s.discountReasonLabel);
    } catch (err) {
      console.error('Failed to restore prescription draft:', err);
      removeDraftFromStorage(userId);
      return;
    }

    // لا نغير savedSignature — البيانات المستعادة تعتبر "غير محفوظة" فعلاً.
    setSavedSignature('');
    showNotification('تم استرجاع بيانات كشف غير محفوظ من جلستك السابقة', 'info', { id: 'draft-restored' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // الحفظ التلقائي — debounced.
  useEffect(() => {
    if (!userId) return;
    if (restoredRef.current !== userId) return; // ننتظر لحد ما الاستعادة تخلص

    if (!hasMeaningfulContent(liveSnapshot)) {
      // لو الفورم فاضي، نمسح أي draft قديم.
      removeDraftFromStorage(userId);
      return;
    }

    const timer = setTimeout(() => {
      writeDraftToStorage(userId, liveSnapshot);
    }, DRAFT_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [userId, liveSignature, liveSnapshot]);

  const hasUnsavedChanges = useMemo(() => {
    if (!hasMeaningfulContent(liveSnapshot)) return false;
    return liveSignature !== savedSignature;
  }, [liveSignature, liveSnapshot, savedSignature]);

  const markDraftSaved = useCallback(() => {
    setSavedSignature(liveSignature);
    if (userId) removeDraftFromStorage(userId);
  }, [liveSignature, userId]);

  const clearDraft = useCallback(() => {
    if (userId) removeDraftFromStorage(userId);
    // بعد reset يكون الفورم فارغ — البصمة الحية الجديدة ستتطابق مع "محفوظ فارغ".
    // نضع savedSignature على البصمة الحالية بعد دوران render، لكن الطريقة الأبسط:
    // نخلي useMemo يحسبها بنفسه — وبما إن الفورم فارغ فـ hasMeaningfulContent سيعيد false.
    setSavedSignature('');
  }, [userId]);

  return { hasUnsavedChanges, markDraftSaved, clearDraft };
};
