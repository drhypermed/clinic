import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { ClinicAppointment, PatientGender, PatientRecord } from '../../../types';
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
// دوال هوية المريض: حساب السن الجديد من آخر زيارة + تطبيع الجنس
import {
  advanceAgeByElapsedTime,
  normalizeGender,
} from '../../../utils/patientIdentity';
import { formatAgeForStorage } from '../utils';

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
  // حقول الهوية الجديدة: الجنس ثابت، الحمل/الرضاعة متغيرين لكل زيارة
  const [gender, setGender] = useState<PatientGender | ''>('');
  const [pregnant, setPregnant] = useState<boolean | null>(null);
  const [breastfeeding, setBreastfeeding] = useState<boolean | null>(null);
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

  /**
   * حساب السن الجديد من السن القديم + فرق الوقت بين آخر زيارة واليوم.
   * لو ما عندناش تاريخ زيارة، نستخدم السن القديم كما هو.
   */
  const resolveAdvancedAgeText = (candidate: { age?: string; lastExamDate?: string; lastConsultationDate?: string }): string => {
    const lastVisit = candidate.lastExamDate || candidate.lastConsultationDate;
    if (!lastVisit || !candidate.age) return candidate.age ?? '';
    // نحلل السن النصي القديم ("10 سنة") لأجزاء years/months/days
    const ageText = candidate.age;
    const isMonth = /شهر/.test(ageText);
    const isDay = /يوم/.test(ageText);
    const match = ageText.replace(/[٠-٩]/g, (d) => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]).match(/(\d+)/);
    const num = match ? String(parseInt(match[1] || '0', 10) || 0) : '';
    const oldAge = isDay
      ? { years: '', months: '', days: num }
      : isMonth
        ? { years: '', months: num, days: '' }
        : { years: num, months: '', days: '' };
    const advanced = advanceAgeByElapsedTime(oldAge, lastVisit);
    // نرجع نص سن بأكبر وحدة غير صفرية
    const y = parseInt(advanced.years || '0', 10);
    const m = parseInt(advanced.months || '0', 10);
    const d = parseInt(advanced.days || '0', 10);
    if (y > 0) return formatAgeForStorage(String(y), 'year');
    if (m > 0) return formatAgeForStorage(String(m), 'month');
    if (d > 0) return formatAgeForStorage(String(d), 'day');
    return candidate.age ?? '';
  };

  /** ملء البيانات عند اختيار مريض من قائمة الاستشارات */
  const handleSelectConsultationCandidate = (candidate: RecentExamPatientOption) => {
    setSelectedConsultationCandidateId(candidate.id);
    setPatientName(candidate.patientName ?? '');
    setPhone(candidate.phone ?? '');
    // نقل الجنس (ثابت) + حساب السن الحالي من فرق الوقت
    setGender(normalizeGender(candidate.gender) ?? '');
    setAge(resolveAdvancedAgeText({ age: candidate.age, lastExamDate: candidate.examCompletedAt }));
    // الحمل/الرضاعة يُسألوا من الصفر (متغيرين لكل زيارة)
    setPregnant(null);
    setBreastfeeding(null);
  };

  /** ملء البيانات عند اختيار مريض من قائمة الاقتراحات */
  const handleSelectPatientSuggestion = (candidate: PatientSuggestionOption) => {
    setPatientName(candidate.patientName ?? '');
    setPhone(candidate.phone ?? '');
    setGender(normalizeGender(candidate.gender) ?? '');
    setAge(resolveAdvancedAgeText(candidate));
    setPregnant(null);
    setBreastfeeding(null);
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
    // تحميل حقول الهوية لو الموعد القديم محفوظ بها
    setGender(normalizeGender(apt.gender) ?? '');
    setPregnant(typeof apt.pregnant === 'boolean' ? apt.pregnant : null);
    setBreastfeeding(typeof apt.breastfeeding === 'boolean' ? apt.breastfeeding : null);

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

    // ─ حماية من تحويل تعديل لإضافة جديده بالغلط ─
    // لو السكرتيره داخله في وضع تعديل لكن الموعد اختفى من القائمه (اتشال من جهاز
    // تاني مثلاً)، الكود قبل الإصلاح كان بيكمل كأنه إضافه جديده ويولّد id جديد —
    // ده كمان كان بيعدّي الـquota check (لأن editingAppointmentId لسه مش فاضي).
    // الإصلاح: نوقف العمليه ونرشد السكرتيره لإعاده فتح النموذج بحاله محدّثه.
    if (editingAppointmentId && !editingAppointment) {
      setFormError('الموعد ده مش موجود في القائمه (يمكن اتحذف من جهاز تاني). أغلق النموذج وافتحه من جديد.');
      return;
    }

    // تطبيع الحقول الجديدة قبل الحفظ (undefined لو فاضي عشان Firestore ما يحفظش قيم فارغة)
    const genderForPayload = normalizeGender(gender);
    const pregnantForPayload = typeof pregnant === 'boolean' ? pregnant : undefined;
    const breastfeedingForPayload = typeof breastfeeding === 'boolean' ? breastfeeding : undefined;

    // بناء كائن الموعد (Payload)
    const basePayload: ClinicAppointment = editingAppointment ? {
      ...editingAppointment,
      patientName: name, phone: ph, dateTime: chosenDateTime.toISOString(),
      age: ageVal, visitReason: reasonVal, appointmentType: resolvedType,
      gender: genderForPayload,
      pregnant: pregnantForPayload,
      breastfeeding: breastfeedingForPayload,
    } : {
      id: `apt-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      patientName: name, phone: ph, dateTime: chosenDateTime.toISOString(),
      createdAt: new Date().toISOString(), age: ageVal, visitReason: reasonVal,
      source: 'clinic', appointmentType: resolvedType,
      gender: genderForPayload,
      pregnant: pregnantForPayload,
      breastfeeding: breastfeedingForPayload,
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
      setGender(''); setPregnant(null); setBreastfeeding(null);
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
    gender, setGender, pregnant, setPregnant, breastfeeding, setBreastfeeding,
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
