import React from 'react';
import type { BasicPatientSuggestion } from '../consultation/PatientInfoSection';
import { PatientInfoSection } from '../consultation/PatientInfoSection';
import { ClinicalInsightSection } from '../consultation/ClinicalInsightSection';
import { VitalSignsSection } from '../consultation/VitalSignsSection';
import { QuickSearchSection } from '../consultation/QuickSearchSection';
import { PrescriptionPreview } from '../prescription/PrescriptionPreview';
import type {
  AlternativeMed,
  CustomBox,
  Medication,
  PatientGender,
  PaymentType,
  PrescriptionItem,
  PrescriptionSettings,
  VitalSigns,
} from '../../types';
import { InsurancePaymentSelector } from '../prescription/InsurancePaymentSelector';
// دوال هوية المريض: تطبيع الجنس + حساب السن الجديد من آخر زيارة
import {
  advanceAgeByElapsedTime,
  normalizeGender,
} from '../../utils/patientIdentity';

/**
 * مكون قسم الروشتة الرئيسي (Main App Prescription Section Component)
 * هذا المكون هو المسؤول عن واجهة تحرير الروشتة بالكامل.
 * ينقسم المكون من الناحية البصرية إلى جزئين رئيسيين:
 * 1. الجانب الأيمن (Editor): يحتوي على مدخلات بيانات المريض، العلامات الحيوية، بيانات الكشف، ومحرك البحث السريع عن الأدوية.
 * 2. الجانب الأيسر (Preview): يحتوي على الروشتة بشكلها الوردي النهائي القابل للطباعة.
 */

interface MainAppPrescriptionSectionProps {
  analyzing: boolean; // هل الذكاء الاصطناعي يقوم بالتحليل حالياً؟
  onCancelAnalyze: () => void;
  
  // بيانات المريض الأساسية
  patientName: string;
  setPatientName: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  ageYears: string;
  setAgeYears: (value: string) => void;
  ageMonths: string;
  setAgeMonths: (value: string) => void;
  ageDays: string;
  setAgeDays: (value: string) => void;
  // حقول الهوية الجديدة: الجنس ثابت للمريض، والحمل والرضاعة snapshot للزيارة
  gender: PatientGender | '';
  setGender: (value: PatientGender | '') => void;
  pregnant: boolean | null;
  setPregnant: (value: boolean | null) => void;
  breastfeeding: boolean | null;
  setBreastfeeding: (value: boolean | null) => void;
  setActivePatientFileId: (value: string | null) => void;
  setActivePatientFileNumber: (value: number | null) => void;
  setActivePatientFileNameKey: (value: string | null) => void;
  patientSuggestions: BasicPatientSuggestion[];
  visitDate: string;
  setVisitDate: (value: string) => void;
  visitType: 'exam' | 'consultation';
  setVisitType: (value: 'exam' | 'consultation') => void;
  onReset: () => void; // مسح بيانات الكشف الحالي
  
  // بيانات الكشف السريري
  complaint: string;
  setComplaint: (value: string) => void;
  medicalHistory: string;
  setMedicalHistory: (value: string) => void;
  examination: string;
  setExamination: (value: string) => void;
  investigations: string;
  setInvestigations: (value: string) => void;
  
  // التحكم في الذكاء الاصطناعي
  onAnalyze: () => void;
  smartQuotaNotice: { message: string } | null;
  isQuotaLimitError: boolean;
  errorMsg: string | null;
  
  // العلامات الحيوية
  weight: string;
  setWeight: (value: string) => void;
  height: string;
  setHeight: (value: string) => void;
  bmi: string;
  vitals: VitalSigns;
  updateVital: (field: string, value: string) => void;
  customBoxes?: CustomBox[];
  customBoxValues?: Record<string, string>;
  onCustomBoxValueChange?: (boxId: string, value: string) => void;
  
  // إعدادات الروشتة ومحتوياتها
  prescriptionSettings: PrescriptionSettings | null;
  totalAgeInMonths: number;
  parsedWeight: number;
  onAddManualMedication: (med: Medication, dosage: string) => void;
  onAddEmptyMedication: () => void;
  onAddCustomItem: () => void;
  onAddManualLab: () => void;
  onAddManualAdvice: () => void;
  onOpenReadyPrescriptions: () => void;
  consultationDate: string | null;
  rxItems: PrescriptionItem[];
  generalAdvice: string[];
  labInvestigations: string[];
  
  // حقول الترجمة الإنجليزية (للطباعة)
  complaintEn: string;
  setComplaintEn: (value: string) => void;
  historyEn: string;
  setHistoryEn: (value: string) => void;
  examEn: string;
  setExamEn: (value: string) => void;
  investigationsEn: string;
  setInvestigationsEn: (value: string) => void;
  diagnosisEn: string;
  setDiagnosisEn: (value: string) => void;
  
  // وظائف التعديل على عناصر الروشتة
  onRemoveItem: (index: number) => void;
  onUpdateItemName: (index: number, value: string) => void;
  onUpdateItemInstruction: (index: number, value: string) => void;
  onUpdateItemFontSize: (index: number, value: string) => void;
  onSwapItem: (index: number, newMed: AlternativeMed) => void;
  onSelectMedication: (index: number, med: Medication) => void;
  onMedicationClick: (med: Medication) => void;
  onUpdateAdvice: (index: number, value: string) => void;
  onRemoveAdvice: (index: number) => void;
  onUpdateLab: (index: number, value: string) => void;
  onRemoveLab: (index: number) => void;
  
  // حالة العرض والطباعة
  isPrintMode: boolean;
  isDataOnlyMode: boolean;
  setIsDataOnlyMode: React.Dispatch<React.SetStateAction<boolean>>;
  prescriptionRef: React.RefObject<HTMLDivElement | null>;
  usageStats: Record<string, number>;
  onPrint: () => void;
  isPrinting?: boolean;
  onDownloadPdf: () => void;
  isDownloadingPdf?: boolean;
  onShareWhatsApp: () => void;
  isSharingViaWhatsApp?: boolean;
  onSaveRecord: (e?: React.MouseEvent<any>) => void | Promise<void>;
  onOpenSaveReadyPrescriptionModal: () => void;
  
  // سجل التراجع (History)
  onUndo: () => void;
  onRedo: () => void;
  historyLength: number;
  futureLength: number;

  // بيانات التأمين
  userId: string;
  /** الفرع النشط — يُمرَّر لـ InsurancePaymentSelector لاختيار نسبة تحمل المريض per-branch. */
  activeBranchId?: string;
  paymentType: PaymentType;
  setPaymentType: (v: PaymentType) => void;
  insuranceCompanyId: string;
  setInsuranceCompanyId: (v: string) => void;
  insuranceCompanyName: string;
  setInsuranceCompanyName: (v: string) => void;
  insuranceApprovalCode: string;
  setInsuranceApprovalCode: (v: string) => void;
  insuranceMembershipId: string;
  setInsuranceMembershipId: (v: string) => void;
  patientSharePercent: number;
  setPatientSharePercent: (v: number) => void;
  discountAmount: number;
  setDiscountAmount: (v: number) => void;
  discountPercent: number;
  setDiscountPercent: (v: number) => void;
  discountReasonId: string;
  setDiscountReasonId: (v: string) => void;
  discountReasonLabel: string;
  setDiscountReasonLabel: (v: string) => void;
}


export const MainAppPrescriptionSection: React.FC<MainAppPrescriptionSectionProps> = ({
  analyzing, onCancelAnalyze, patientName, setPatientName, phone, setPhone, ageYears, setAgeYears, ageMonths, setAgeMonths, ageDays, setAgeDays,
  gender, setGender, pregnant, setPregnant, breastfeeding, setBreastfeeding,
  setActivePatientFileId, setActivePatientFileNumber, setActivePatientFileNameKey, patientSuggestions, visitDate, setVisitDate, visitType, setVisitType, onReset,
  complaint, setComplaint, medicalHistory, setMedicalHistory, examination, setExamination, investigations, setInvestigations, onAnalyze, smartQuotaNotice, isQuotaLimitError, errorMsg,
  weight, setWeight, height, setHeight, bmi, vitals, updateVital, customBoxes = [], customBoxValues = {}, onCustomBoxValueChange, prescriptionSettings, totalAgeInMonths, parsedWeight, onAddManualMedication, onAddEmptyMedication, onAddCustomItem, onAddManualLab, onAddManualAdvice, onOpenReadyPrescriptions,
  consultationDate, rxItems, generalAdvice, labInvestigations, complaintEn, setComplaintEn, historyEn, setHistoryEn, examEn, setExamEn, investigationsEn, setInvestigationsEn, diagnosisEn, setDiagnosisEn,
  onRemoveItem, onUpdateItemName, onUpdateItemInstruction, onUpdateItemFontSize, onSwapItem, onSelectMedication, onMedicationClick, onUpdateAdvice, onRemoveAdvice, onUpdateLab, onRemoveLab,
  isPrintMode, isDataOnlyMode, setIsDataOnlyMode, prescriptionRef, usageStats, onPrint, isPrinting,
  onDownloadPdf, isDownloadingPdf, onShareWhatsApp, isSharingViaWhatsApp,
  onSaveRecord, onOpenSaveReadyPrescriptionModal, onUndo, onRedo, historyLength, futureLength,
  userId, activeBranchId, paymentType, setPaymentType, insuranceCompanyId, setInsuranceCompanyId, insuranceCompanyName, setInsuranceCompanyName, insuranceApprovalCode, setInsuranceApprovalCode, insuranceMembershipId, setInsuranceMembershipId, patientSharePercent, setPatientSharePercent, discountAmount, setDiscountAmount, discountPercent, setDiscountPercent, discountReasonId, setDiscountReasonId, discountReasonLabel, setDiscountReasonLabel,
}) => {
  const [isSavingRecord, setIsSavingRecord] = React.useState(false);
  const [showInlineCancelHint, setShowInlineCancelHint] = React.useState(false);
  const handlePaymentTypeChange = React.useCallback((nextPaymentType: PaymentType) => {
    setPaymentType(nextPaymentType);

    if (nextPaymentType !== 'insurance') {
      setInsuranceCompanyId('');
      setInsuranceCompanyName('');
      setInsuranceApprovalCode('');
      setInsuranceMembershipId('');
      setPatientSharePercent(0);
    }

    if (nextPaymentType !== 'discount') {
      setDiscountAmount(0);
      setDiscountPercent(0);
      setDiscountReasonId('');
      setDiscountReasonLabel('');
    }
  }, [
    setDiscountAmount,
    setDiscountPercent,
    setDiscountReasonId,
    setDiscountReasonLabel,
    setInsuranceApprovalCode,
    setInsuranceCompanyId,
    setInsuranceCompanyName,
    setInsuranceMembershipId,
    setPatientSharePercent,
    setPaymentType,
  ]);
  // نظام موحد: نفس روح زر "كشف جديد" في الألوان لتقليل التشتيت البصري.
  const previewPrimaryActionClass = 'prescription-save-cta rx-gradient-btn rx-gradient-btn--blue flex items-center gap-2 px-4 md:px-3 lg:px-5 py-2.5 rounded-2xl transition-all active:scale-[0.98] font-black text-[11px] md:text-xs lg:text-sm whitespace-nowrap';
  const previewSecondaryActionClass = 'rx-gradient-btn flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-2.5 lg:px-4 py-2.5 rounded-2xl transition-all active:scale-[0.98] font-black text-[11px] md:text-xs lg:text-sm whitespace-nowrap';
  const historyArrowIconClass = 'w-4 h-4 md:w-[18px] md:h-[18px]';

  const handleSaveClick = async (e?: React.MouseEvent<any>) => {
    if (isSavingRecord) return;
    setIsSavingRecord(true);
    try {
      await onSaveRecord(e);
    } finally {
      setIsSavingRecord(false);
    }
  };

  React.useEffect(() => {
    if (!analyzing) {
      setShowInlineCancelHint(false);
      return;
    }

    const timerId = window.setTimeout(() => setShowInlineCancelHint(true), 2500);
    return () => window.clearTimeout(timerId);
  }, [analyzing]);

  const handleAnalyzeAction = () => {
    if (analyzing) return;
    onAnalyze();
  };

  return (
    <>
      <div className="prescription-workspace">
        <div className="prescription-editor">
          <div className="apple-exam-shell new-exam-shell">
            <div className="apple-exam-stack prescription-editor-grid">
              <div className="editor-block editor-block--patient dh-stagger-1">
                <PatientInfoSection
                  patientName={patientName} setPatientName={setPatientName}
                  phone={phone} setPhone={setPhone}
                  ageYears={ageYears} setAgeYears={setAgeYears}
                  ageMonths={ageMonths} setAgeMonths={setAgeMonths}
                  ageDays={ageDays} setAgeDays={setAgeDays}
                  gender={gender} setGender={setGender}
                  pregnant={pregnant} setPregnant={setPregnant}
                  breastfeeding={breastfeeding} setBreastfeeding={setBreastfeeding}
                  patientSuggestions={patientSuggestions}
                  onSelectPatientSuggestion={(item) => {
                    const parsedFileNumber = Number(item.patientFileNumber);
                    setPatientName(item.patientName || '');
                    setPhone(item.phone || '');
                    // نقل الجنس (ثابت) + حساب السن الحالي تلقائياً من السن القديم + فرق الوقت
                    setGender(normalizeGender(item.gender) ?? '');
                    const lastVisit = item.lastExamDate || item.lastConsultationDate;
                    if (lastVisit) {
                      const advanced = advanceAgeByElapsedTime(
                        { years: item.ageYears, months: item.ageMonths, days: item.ageDays },
                        lastVisit,
                      );
                      // لو حسبنا قيم أكبر من صفر نستخدمها، وإلا نرجع للسن القديم كما هو
                      if (advanced.years || advanced.months || advanced.days) {
                        setAgeYears(advanced.years);
                        setAgeMonths(advanced.months);
                        setAgeDays(advanced.days);
                      } else {
                        setAgeYears(item.ageYears || '');
                        setAgeMonths(item.ageMonths || '');
                        setAgeDays(item.ageDays || '');
                      }
                    } else {
                      setAgeYears(item.ageYears || '');
                      setAgeMonths(item.ageMonths || '');
                      setAgeDays(item.ageDays || '');
                    }
                    // الحمل/الرضاعة لا يُنقلا — بنسأل كل زيارة من الصفر
                    setPregnant(null);
                    setBreastfeeding(null);
                    setActivePatientFileId(null);
                    setActivePatientFileNumber(Number.isFinite(parsedFileNumber) && parsedFileNumber > 0 ? Math.floor(parsedFileNumber) : null);
                    setActivePatientFileNameKey((item.patientName || '').trim() || null);
                    // في الاستشارة بس: نجلب آخر وزن/طول تلقائياً من سجلات المريض
                    // الكشف بيقاس من جديد في كل زيارة، والاستشارة بتبني على قياسات الكشف السابق
                    if (visitType === 'consultation') {
                      if (item.lastWeight) setWeight(item.lastWeight);
                      if (item.lastHeight) setHeight(item.lastHeight);
                    }
                  }}
                  visitDate={visitDate} setVisitDate={setVisitDate}
                  visitType={visitType}
                  setVisitType={setVisitType}
                  paymentType={paymentType}
                  setPaymentType={handlePaymentTypeChange}
                  onReset={onReset}
                />
              </div>

              {paymentType !== 'cash' && (
              <div className="editor-block editor-block--payment dh-stagger-2">
                <InsurancePaymentSelector
                  userId={userId}
                  activeBranchId={activeBranchId}
                  visitDate={visitDate}
                  visitType={visitType}
                  paymentType={paymentType}
                  setPaymentType={handlePaymentTypeChange}
                  insuranceCompanyId={insuranceCompanyId}
                  setInsuranceCompanyId={setInsuranceCompanyId}
                  insuranceCompanyName={insuranceCompanyName}
                  setInsuranceCompanyName={setInsuranceCompanyName}
                  insuranceApprovalCode={insuranceApprovalCode}
                  setInsuranceApprovalCode={setInsuranceApprovalCode}
                  insuranceMembershipId={insuranceMembershipId}
                  setInsuranceMembershipId={setInsuranceMembershipId}
                  patientSharePercent={patientSharePercent}
                  setPatientSharePercent={setPatientSharePercent}
                  discountAmount={discountAmount}
                  setDiscountAmount={setDiscountAmount}
                  discountPercent={discountPercent}
                  setDiscountPercent={setDiscountPercent}
                  discountReasonId={discountReasonId}
                  discountReasonLabel={discountReasonLabel}
                  setDiscountReasonId={setDiscountReasonId}
                  setDiscountReasonLabel={setDiscountReasonLabel}
                  isPrintMode={isPrintMode}
                  showToggle={false}
                />
              </div>
              )}

              <div className="editor-block editor-block--vitals dh-stagger-2">
                <VitalSignsSection
                  weight={weight} setWeight={setWeight}
                  height={height} setHeight={setHeight} bmi={bmi}
                  vitals={vitals} setVitals={updateVital}
                  vitalsConfig={prescriptionSettings?.vitals || []}
                  customBoxes={customBoxes}
                  customBoxValues={customBoxValues}
                  setCustomBoxValue={onCustomBoxValueChange}
                />
              </div>

              <div className="editor-block editor-block--clinical dh-stagger-3">
                <ClinicalInsightSection
                  complaint={complaint} setComplaint={setComplaint}
                  history={medicalHistory} setHistory={setMedicalHistory}
                  exam={examination} setExam={setExamination}
                  investigations={investigations} setInvestigations={setInvestigations}
                  errorMsg={smartQuotaNotice || isQuotaLimitError ? null : errorMsg}
                />
              </div>

              <div className="editor-block editor-block--analyze dh-stagger-4">
                <section className="apple-action-card">
                  <button
                    onClick={handleAnalyzeAction}
                    disabled={analyzing}
                    aria-busy={analyzing}
                    className={`apple-action-btn analyze-ai-btn flex items-center justify-center gap-2.5 ${analyzing ? 'is-analyzing' : ''}`}
                  >
                    {analyzing ? (
                      <>
                        <span className="analyze-ai-btn__spinner-circle" aria-hidden />
                        <span className="text-[0.96rem] sm:text-[1.02rem] font-black">جاري التحليل</span>
                      </>
                    ) : (
                      <>
                        <span className="text-[1.02rem] sm:text-[1.12rem] font-black">تحليل الحالة</span>
                        <span className="relative top-[1px] inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/25">
                          <svg className="h-[18px] w-[18px] text-emerald-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M8.4 4.8a3.3 3.3 0 0 0-2.9 5 3.8 3.8 0 0 0 .5 7.2 3.6 3.6 0 0 0 6 2.2" /><path d="M15.6 4.8a3.3 3.3 0 0 1 2.9 5 3.8 3.8 0 0 1-.5 7.2 3.6 3.6 0 0 1-6 2.2" /><path d="M12 6.2v11.2" /><path d="M10 9.5c.9.1 1.7.7 2 1.6" /><path d="M14 9.5c-.9.1-1.7.7-2 1.6" /></svg>
                        </span>
                      </>
                    )}
                  </button>
                  {analyzing && showInlineCancelHint && (
                    <button
                      type="button"
                      onClick={onCancelAnalyze}
                      className="analyze-inline-cancel-btn"
                    >
                      إيقاف التحليل والرجوع للتحرير اليدوي
                    </button>
                  )}
                  {smartQuotaNotice && <div className="apple-action-note">⚠️ {smartQuotaNotice.message}</div>}
                </section>
              </div>

              <div className="editor-block editor-block--search dh-stagger-5">
                <QuickSearchSection
                  totalAgeMonths={totalAgeInMonths} weight={parsedWeight}
                  onAddMedication={onAddManualMedication}
                  onAddEmptyMedication={onAddEmptyMedication}
                  onAddCustomItem={onAddCustomItem}
                  onAddManualLab={onAddManualLab}
                  onAddManualAdvice={onAddManualAdvice}
                  onOpenReadyPrescriptions={onOpenReadyPrescriptions}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="prescription-preview-panel dh-stagger-3">
          <PrescriptionPreview
            consultationDate={consultationDate} rxItems={rxItems} generalAdvice={generalAdvice} labInvestigations={labInvestigations}
            patientName={patientName} setPatientName={setPatientName} ageYears={ageYears} ageMonths={ageMonths} ageDays={ageDays}
            weight={weight} setWeight={setWeight} height={height} setHeight={setHeight} bmi={bmi} vitals={vitals}
            complaint={complaint} complaintEn={complaintEn} setComplaintEn={setComplaintEn}
            medicalHistory={medicalHistory} historyEn={historyEn} setHistoryEn={setHistoryEn}
            examination={examination} examEn={examEn} setExamEn={setExamEn}
            investigations={investigations} investigationsEn={investigationsEn} setInvestigationsEn={setInvestigationsEn}
            diagnosisEn={diagnosisEn} setDiagnosisEn={setDiagnosisEn}
            onRemoveItem={onRemoveItem} onUpdateItemName={onUpdateItemName} onUpdateItemInstruction={onUpdateItemInstruction} onUpdateItemFontSize={onUpdateItemFontSize} onSwapItem={onSwapItem} onSelectMedication={onSelectMedication} onMedicationClick={onMedicationClick}
            onUpdateAdvice={onUpdateAdvice} onRemoveAdvice={onRemoveAdvice} onUpdateLab={onUpdateLab} onRemoveLab={onRemoveLab}
            isPrintMode={isPrintMode} isDataOnlyMode={isDataOnlyMode} ref={prescriptionRef} usageStats={usageStats} prescriptionSettings={prescriptionSettings ?? undefined}
            actionsBar={
              <div className="prescription-actions-wrapper">
                <div className="prescription-actions-print-row">
                  <button onClick={onPrint} disabled={isPrinting || isDownloadingPdf || isSharingViaWhatsApp} className={`${previewSecondaryActionClass} rx-gradient-btn--green flex-1`}>
                    {isPrinting ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    )}
                    {isPrinting ? 'جاري الطباعة…' : 'طباعة'}
                  </button>

                  <button onClick={onDownloadPdf} disabled={isPrinting || isDownloadingPdf || isSharingViaWhatsApp} className={`${previewSecondaryActionClass} rx-gradient-btn--green flex-1`} title="تنزيل الروشتة كملف PDF">
                    {isDownloadingPdf ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" /></svg>
                    )}
                    {isDownloadingPdf ? 'جاري التنزيل…' : 'تنزيل الروشتة'}
                  </button>

                  <button onClick={onShareWhatsApp} disabled={isPrinting || isDownloadingPdf || isSharingViaWhatsApp} className={`${previewSecondaryActionClass} rx-gradient-btn--green flex-1`} title="إرسال الروشتة عبر واتساب كملف PDF">
                    {isSharingViaWhatsApp ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.5 0 .14 5.36.14 11.92c0 2.1.55 4.16 1.6 5.97L0 24l6.27-1.64a11.9 11.9 0 0 0 5.79 1.48h.01c6.56 0 11.92-5.36 11.92-11.92 0-3.18-1.24-6.18-3.47-8.44ZM12.07 21.8h-.01a9.85 9.85 0 0 1-5.02-1.37l-.36-.21-3.72.97.99-3.63-.23-.37a9.86 9.86 0 0 1-1.51-5.27c0-5.45 4.43-9.88 9.87-9.88 2.64 0 5.12 1.03 6.99 2.9a9.84 9.84 0 0 1 2.9 6.99c0 5.45-4.44 9.87-9.9 9.87Zm5.42-7.4c-.3-.15-1.76-.87-2.04-.97-.27-.1-.47-.15-.66.15-.2.3-.76.97-.93 1.16-.17.2-.34.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.5.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.66-1.59-.9-2.18-.24-.57-.48-.5-.66-.5-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.21 5.1 4.5.71.3 1.27.49 1.7.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.69.25-1.28.18-1.41-.07-.13-.27-.2-.57-.35Z"/></svg>
                    )}
                    {isSharingViaWhatsApp ? 'جاري الإرسال…' : 'إرسال واتساب'}
                  </button>
                </div>

                <div className="prescription-actions-save-row">
                  <button
                    onClick={(e) => handleSaveClick(e)}
                    disabled={isSavingRecord}
                    className={`${previewPrimaryActionClass} prescription-action-save flex-1 md:w-auto md:min-w-[172px] lg:min-w-[220px] justify-center ${isSavingRecord ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {isSavingRecord ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />جاري الحفظ</>
                    ) : (
                      <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>حفظ في سجلات المرضى</>
                    )}
                  </button>

                  <button onClick={onOpenSaveReadyPrescriptionModal} className={`${previewSecondaryActionClass} rx-gradient-btn--violet flex-1 md:flex-none`}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    حفظ روشتة جاهزة
                  </button>
                </div>

                <div className="prescription-actions-tools-row">
                  <button onClick={() => setIsDataOnlyMode(!isDataOnlyMode)} disabled={isPrinting || isDownloadingPdf || isSharingViaWhatsApp} className={`${previewSecondaryActionClass} rx-gradient-btn--amber flex-1 md:flex-none`}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    {isDataOnlyMode ? 'عرض كامل' : 'بيانات فقط'}
                  </button>

                  <div className="prescription-actions-history-group">
                    <button onClick={onUndo} disabled={historyLength === 0} className="rx-icon-btn" title="رجوع" aria-label="رجوع">
                      <svg className={historyArrowIconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                    </button>
                    <button onClick={onRedo} disabled={futureLength === 0} className="rx-icon-btn" title="إعادة" aria-label="إعادة">
                      <svg className={historyArrowIconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            }
          />
        </div>
      </div>

    </>
  );
};
