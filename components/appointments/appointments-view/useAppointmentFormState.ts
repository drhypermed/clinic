import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { ClinicAppointment, PatientRecord } from '../../../types';
import { firestoreService } from '../../../services/firestore';
import { consumeBookingQuota } from '../../../services/accountTypeControlsService';
import { isQuotaTransientError } from '../../../services/account-type-controls/quotaErrors';
import { discountReasonService, type DiscountReason } from '../../../services/discountReasonService';
import type {
  AppointmentType,
  BookingQuotaNoticeInfo,
  PatientSuggestionOption,
  RecentExamPatientOption,
} from '../AddAppointmentForm';
import { buildLocalDateTime, currentTimeMin, toLocalDateStr } from '../utils';
import {
  buildPatientSuggestions,
  buildRecentExamCandidates,
  extractBookingQuotaNotice,
} from './helpers';
import { branchesService } from '../../../services/firestore/branches';

/**
 * الملف: useAppointmentFormState.ts (Hook)
 * الوصف: هذا الـ Hook هو المسؤول عن "الحالة الداخلية" لنموذج إضافة/تعديل المواعيد. 
 * يدير كل تفاصيل المدخلات (اسم المريض، السن، الهاتف، نوع الحجز) ويقوم بمزامنة 
 * التواريخ والأوقات تلقائياً. كما ينظم عملية "تعديل موعد قديم" عبر تعبئة النموذج 
 * بالبيانات الأصلية، ويتعامل مع قيود اشتراك الطبيب (Quota) قبل الحفظ النهائي.
 */
interface UseAppointmentFormStateArgs {
  userId: string;
  records: PatientRecord[];
  appointments: ClinicAppointment[];
}

export const useAppointmentFormState = ({
  userId,
  records,
  appointments,
}: UseAppointmentFormStateArgs) => {
  // حالات النموذج الأساسية
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [currentDayStr, setCurrentDayStr] = useState(() => toLocalDateStr(new Date()));
  const [dateStr, setDateStr] = useState(() => toLocalDateStr(new Date()));
  const [timeStr, setTimeStr] = useState(() => currentTimeMin());
  const [visitReason, setVisitReason] = useState('');
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('exam');
  const [selectedConsultationCandidateId, setSelectedConsultationCandidateId] = useState<string>('');
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  
  // حالات التأمين
  const [paymentType, setPaymentType] = useState<'cash' | 'insurance' | 'discount'>('cash');
  const [insuranceCompanyId, setInsuranceCompanyId] = useState('');
  const [insuranceCompanyName, setInsuranceCompanyName] = useState('');
  const [insuranceApprovalCode, setInsuranceApprovalCode] = useState('');
  const [insuranceMembershipId, setInsuranceMembershipId] = useState('');
  const [patientSharePercent, setPatientSharePercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountReasonId, setDiscountReasonId] = useState('');
  const [discountReasonLabel, setDiscountReasonLabel] = useState('');
  const [discountReasons, setDiscountReasons] = useState<DiscountReason[]>([]);

  // حالات التحكم بالواجهة (أخطاء، نجاح، تحميل)
  const [formError, setFormError] = useState<string | null>(null);
  const [bookingQuotaNotice, setBookingQuotaNotice] = useState<BookingQuotaNoticeInfo | null>(null);
  const [saving, setSaving] = useState(false);
  const [addSuccessToast, setAddSuccessToast] = useState(false);
  const [addAppointmentFormOpen, setAddAppointmentFormOpen] = useState(false);

  // تثبيت الفرع لحظة فتح النموذج لمنع تضارب عند تبديل الفرع أثناء الكتابة
  const formBranchIdRef = useRef<string | null>(null);

  const previousDayStrRef = useRef(currentDayStr);

  // حساب الاقتراحات والمرشحين بشكل ذكي (Memoized)
  const patientSuggestions = useMemo(() => buildPatientSuggestions(records), [records]);
  const recentExamCandidates = useMemo(() => buildRecentExamCandidates(records), [records]);
  const visibleConsultationCandidates = recentExamCandidates;

  // تحديث "تاريخ اليوم" كل دقيقة لضمان دقة الاختيار التلقائي (Auto-Refresh)
  useEffect(() => {
    const syncCurrentDay = () => setCurrentDayStr(toLocalDateStr(new Date()));
    syncCurrentDay();
    const interval = setInterval(syncCurrentDay, 60000);
    return () => clearInterval(interval);
  }, []);

  /** 
   * مزامنة التواريخ (Date Sync).
   * إذا تغير اليوم الفعلي (عبر منتصف الليل مثلاً) وكان الطبيب قد ترك النموذج على "اليوم"، 
   * نقوم بتحديث تاريخ الحجز المختار والوقت تلقائياً ليظلا مواكبين للحظة الحالية.
   */
  useEffect(() => {
    if (currentDayStr !== previousDayStrRef.current) {
      if (dateStr === previousDayStrRef.current) {
        setDateStr(currentDayStr);
        setTimeStr(currentTimeMin());
      }
      previousDayStrRef.current = currentDayStr;
    }
  }, [currentDayStr, dateStr]);

  // تحديث الوقت عند فتح النموذج لضمان اختيار أقرب وقت متاح حالياً
  useEffect(() => {
    if (addAppointmentFormOpen) setTimeStr(currentTimeMin());
  }, [addAppointmentFormOpen]);

  useEffect(() => {
    if (!userId) {
      setDiscountReasons([]);
      return;
    }

    const unsubscribe = discountReasonService.subscribeToReasons(userId, setDiscountReasons);
    return () => unsubscribe();
  }, [userId]);

  /** تغيير نوع الحجز (كشف / استشارة) */
  const handleAppointmentTypeChange = (value: AppointmentType) => {
    setAppointmentType(value);
    if (value !== 'consultation') {
      setSelectedConsultationCandidateId('');
    }
  };

  /** ملء البيانات عند اختيار مريض من قائمة الاستشارات */
  const handleSelectConsultationCandidate = (candidate: RecentExamPatientOption) => {
    setSelectedConsultationCandidateId(candidate.id);
    setPatientName(candidate.patientName ?? '');
    setAge(candidate.age ?? '');
    setPhone(candidate.phone ?? '');
  };

  /** ملء البيانات عند اختيار مريض من قائمة الاقتراحات */
  const handleSelectPatientSuggestion = (candidate: PatientSuggestionOption) => {
    setPatientName(candidate.patientName ?? '');
    setAge(candidate.age ?? '');
    setPhone(candidate.phone ?? '');
  };

  /** دخول وضع تعديل موعد موجود */
  const handleEditAppointment = (apt: ClinicAppointment) => {
    const dt = new Date(apt.dateTime);
    if (Number.isNaN(dt.getTime())) return;
    const pad = (v: number) => String(v).padStart(2, '0');

    setEditingAppointmentId(apt.id);
    // عند تعديل موعد، نحافظ على فرعه الأصلي — لا نسمح لتبديل الفرع الحالي بنقله
    formBranchIdRef.current = (apt.branchId && String(apt.branchId).trim())
      || (userId ? branchesService.getActiveBranchId(userId) : null);
    setPatientName(apt.patientName ?? '');
    setAge(apt.age ?? '');
    setPhone(apt.phone ?? '');
    setVisitReason(apt.visitReason ?? '');
    setDateStr(toLocalDateStr(dt));
    setTimeStr(`${pad(dt.getHours())}:${pad(dt.getMinutes())}`);

    // استعادة بيانات التأمين المحفوظة في الموعد
    setPaymentType(apt.paymentType ?? 'cash');
    setInsuranceCompanyId(apt.insuranceCompanyId ?? '');
    setInsuranceCompanyName(apt.insuranceCompanyName ?? '');
    setInsuranceApprovalCode(apt.insuranceApprovalCode ?? '');
    setInsuranceMembershipId(apt.insuranceMembershipId ?? '');
    setPatientSharePercent(apt.patientSharePercent ?? 0);
    setDiscountAmount(Number(apt.discountAmount || 0) || 0);
    setDiscountPercent(Number(apt.discountPercent || 0) || 0);
    setDiscountReasonId(String(apt.discountReasonId || '').trim());
    setDiscountReasonLabel(String(apt.discountReasonLabel || '').trim());

    if (apt.appointmentType === 'consultation') {
      setAppointmentType('consultation');
      setSelectedConsultationCandidateId(apt.consultationSourceAppointmentId ?? '');
    } else {
      setAppointmentType('exam');
      setSelectedConsultationCandidateId('');
    }

    setFormError(null);
    setAddAppointmentFormOpen(true);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** حفظ الأبونتمنت (إضافة أو تعديل) */
  const addAppointment = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setBookingQuotaNotice(null);
    if (!userId) return;

    // 1. التحقق من البيانات (Validation)
    const name = patientName.trim();
    const ageVal = age.trim();
    const ph = phone.trim();
    const reasonVal = visitReason.trim();
    if (!name || !ageVal || !dateStr || !timeStr) {
      setFormError('يرجى إكمال جميع الحقول المطلوبة');
      return;
    }

    let chosenDateTime = buildLocalDateTime(dateStr, timeStr);
    if (Number.isNaN(chosenDateTime.getTime())) {
      setFormError('تاريخ أو وقت غير صالح');
      return;
    }
    // منع حجز موعد في الماضي (تحويله للحال)
    if (chosenDateTime.getTime() < Date.now()) {
      chosenDateTime = new Date();
      setDateStr(toLocalDateStr(chosenDateTime));
      setTimeStr(currentTimeMin());
    }

    const selectedConsultationCandidate = recentExamCandidates.find(c => c.id === selectedConsultationCandidateId);
    const resolvedType = appointmentType;

    const editingAppointment = editingAppointmentId ? appointments.find(a => a.id === editingAppointmentId) : null;
    
    // بناء كائن الموعد (Payload)
    const basePayload: ClinicAppointment = editingAppointment ? {
      ...editingAppointment,
      patientName: name, phone: ph, dateTime: chosenDateTime.toISOString(),
      age: ageVal, visitReason: reasonVal, appointmentType: resolvedType
    } : {
      id: `apt-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      patientName: name, phone: ph, dateTime: chosenDateTime.toISOString(),
      createdAt: new Date().toISOString(), age: ageVal, visitReason: reasonVal,
      source: 'clinic', appointmentType: resolvedType,
      // استخدم الفرع المثبّت وقت فتح النموذج لا وقت الحفظ (تفادي التضارب)
      branchId: formBranchIdRef.current
        || (userId ? branchesService.getActiveBranchId(userId) : undefined)
        || undefined,
    };

    const finalPayload: ClinicAppointment = {
      ...basePayload,
      appointmentType: resolvedType,
      consultationSourceAppointmentId:
        resolvedType === 'consultation' ? (selectedConsultationCandidateId || undefined) : undefined,
      consultationSourceCompletedAt:
        resolvedType === 'consultation' ? selectedConsultationCandidate?.examCompletedAt : undefined,
      consultationSourceRecordId:
        resolvedType === 'consultation' ? selectedConsultationCandidate?.consultationSourceRecordId : undefined,
    };

    // إضافة بيانات التأمين لللواح (payload)
    const normalizedDiscountAmount = Number.isFinite(discountAmount) && discountAmount > 0
      ? discountAmount
      : 0;
    const normalizedDiscountPercent = Number.isFinite(discountPercent) && discountPercent > 0
      ? Math.min(100, discountPercent)
      : 0;

    const payloadWithInsurance: ClinicAppointment = {
      ...finalPayload,
      paymentType,
      insuranceCompanyId:
        paymentType === 'insurance' ? (insuranceCompanyId || undefined) : undefined,
      insuranceCompanyName:
        paymentType === 'insurance' ? (insuranceCompanyName || undefined) : undefined,
      insuranceApprovalCode:
        paymentType === 'insurance' ? (insuranceApprovalCode || undefined) : undefined,
      insuranceMembershipId:
        paymentType === 'insurance' ? (insuranceMembershipId || undefined) : undefined,
      patientSharePercent: paymentType === 'insurance' ? patientSharePercent : undefined,
      discountAmount: paymentType === 'discount' ? normalizedDiscountAmount : undefined,
      discountPercent: paymentType === 'discount' ? normalizedDiscountPercent : undefined,
      discountReasonId: paymentType === 'discount' ? (discountReasonId || undefined) : undefined,
      discountReasonLabel: paymentType === 'discount' ? (discountReasonLabel || undefined) : undefined,
    };

    setSaving(true);
    try {
      // 2. التحقق من كوتا الحجوزات (فقط عند الإضافة الجديدة)
      if (!editingAppointmentId) {
        try {
          await consumeBookingQuota('publicBooking', userId);
        } catch (quotaErr: any) {
          const notice = extractBookingQuotaNotice(quotaErr);
          if (notice) { setBookingQuotaNotice(notice); setFormError(notice.message); return; }
          if (!isQuotaTransientError(quotaErr)) { setFormError('تعذر التحقق من حد المواعيد'); return; }
        }
      }

      // 3. الحفظ الفعلي في Firestore
      await firestoreService.saveAppointment(userId, payloadWithInsurance);
      
      // 4. تصفير النموذج
      setPatientName(''); setAge(''); setPhone(''); setVisitReason('');
      setAppointmentType('exam'); setSelectedConsultationCandidateId('');
      setEditingAppointmentId(null); setAddSuccessToast(true);
      // تصفير الفرع المثبّت بعد نجاح الحفظ
      formBranchIdRef.current = null;
      // تصفير حقول التأمين
      setPaymentType('cash'); setInsuranceCompanyId(''); setInsuranceCompanyName('');
      setInsuranceApprovalCode(''); setInsuranceMembershipId(''); setPatientSharePercent(0);
      setDiscountAmount(0); setDiscountPercent(0);
      setDiscountReasonId(''); setDiscountReasonLabel('');
      setTimeout(() => setAddSuccessToast(false), 4000);
    } catch (err) {
      console.error('Save failed:', err);
      setFormError('فشل حفظ الموعد. حاول مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  const clearEditing = () => {
    setEditingAppointmentId(null);
    setAppointmentType('exam');
    setSelectedConsultationCandidateId('');
    setFormError(null);
    formBranchIdRef.current = null;
  };

  /** إضافة الوظائف المفقودة التي يطلبها المكون الرئيسي */
  const toggleAddAppointmentFormOpen = () => setAddAppointmentFormOpen(prev => {
    const next = !prev;
    // عند فتح النموذج، نثبّت الفرع الحالي حتى لو بدّله الطبيب قبل الحفظ
    if (next) {
      formBranchIdRef.current = userId ? branchesService.getActiveBranchId(userId) : null;
    } else {
      formBranchIdRef.current = null;
    }
    return next;
  });

  return {
    patientName, setPatientName, age, setAge, phone, setPhone, currentDayStr,
    dateStr, setDateStr, timeStr, setTimeStr, visitReason, setVisitReason,
    appointmentType, selectedConsultationCandidateId, editingAppointmentId,
    formError, bookingQuotaNotice, saving, addSuccessToast, addAppointmentFormOpen,
    patientSuggestions, recentExamCandidates, visibleConsultationCandidates,
    handleAppointmentTypeChange,
    handleSelectConsultationCandidate, handleSelectPatientSuggestion,
    handleEditAppointment, addAppointment, toggleAddAppointmentFormOpen,
    clearEditing, closeAddSuccessToast: () => setAddSuccessToast(false),
    // حالات التأمين
    paymentType, setPaymentType,
    insuranceCompanyId, setInsuranceCompanyId,
    insuranceCompanyName, setInsuranceCompanyName,
    insuranceApprovalCode, setInsuranceApprovalCode,
    insuranceMembershipId, setInsuranceMembershipId,
    patientSharePercent, setPatientSharePercent,
    discountAmount, setDiscountAmount,
    discountPercent, setDiscountPercent,
    discountReasonId, setDiscountReasonId,
    discountReasonLabel, setDiscountReasonLabel,
    discountReasons,
  };
};
