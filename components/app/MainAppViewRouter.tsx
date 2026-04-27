// ─────────────────────────────────────────────────────────────────────────────
// موجّه الشاشات الرئيسي (MainAppViewRouter)
// ─────────────────────────────────────────────────────────────────────────────
// مكوّن كبير يعرض الشاشة المناسبة بناء على currentView:
//   home / prescription / appointments / secretary / records / patientFiles
//   financialReports / drugtools / medicationEdit / settings / branchSettings
//   advertisement
//
// فصلناه من MainApp عشان JSX الـ switch بقى ~130 سطر وكان الملف الأب ضخم.
// كل شاشة بتستلم props مخصصة لها — المكون ده مجرد switch case على JSX.
//
// ملاحظة: props كتيرة جداً (50+) لأن المكون ده "خام" — بيمرر كل state
// وevery setter من useDrHyper. ده مقبول لأن:
//   1) دوره واحد فقط: يعرض الـ view المناسبة
//   2) لا يحتفظ بأي state (stateless)
//   3) بيتم استدعاؤه من مكان واحد فقط (MainApp)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import type {
  ClinicAppointment, PatientRecord, PaymentType,
  SecretaryVitalFieldDefinition, SecretaryVitalsVisibility,
  PrescriptionSettings, Medication, VitalSigns, Branch,
} from '../../types';
import type { AppView } from './utils';
import { MedicationDetailsModal } from '../medication/MedicationDetailsModal';

// كل الشاشات مُحمَّلة بشكل كسول (lazy) عشان أول فتح للتطبيق يبقى أسرع.
// الـ loaders الأساسية منفصلة في متغيرات عشان نقدر نستدعيها للـ preload
// (بيحمّل الصفحة في الخلفية قبل ما المستخدم يدوس عليها).
const loadDashboard = () => import('../dashboard/Dashboard').then(m => ({ default: m.Dashboard }));
const loadPrescription = () => import('./MainAppPrescriptionSection').then(m => ({ default: m.MainAppPrescriptionSection }));
const loadRecords = () => import('../records/RecordsView').then(m => ({ default: m.RecordsView }));
const loadPatientFiles = () => import('../patient-files/PatientFilesPage').then(m => ({ default: m.PatientFilesPage }));
const loadAppointments = () => import('../appointments/appointments-view/AppointmentsView').then(m => ({ default: m.AppointmentsView }));
const loadSecretary = () => import('../secretary/SecretaryPage').then(m => ({ default: m.SecretaryPage }));
const loadDrugTools = () => import('../drug-tools/DrugToolsView').then(m => ({ default: m.DrugToolsView }));
const loadMedicationEdit = () => import('../medication/MedicationEditPage').then(m => ({ default: m.MedicationEditPage }));
const loadPrescriptionSettings = () => import('../prescription-settings').then(m => ({ default: m.PrescriptionSettingsPage }));
const loadAdvertisement = () => import('../advertisement/AdvertisementAndPublicPage').then(m => ({ default: m.AdvertisementAndPublicPage }));
const loadFinancialReports = () => import('../financial-reports/FinancialReportsPage').then(m => ({ default: m.FinancialReportsPage }));
const loadBranchSettings = () => import('../branch-settings').then(m => ({ default: m.BranchSettingsPage }));

const Dashboard = React.lazy(loadDashboard);
const MainAppPrescriptionSection = React.lazy(loadPrescription);
const RecordsView = React.lazy(loadRecords);
const PatientFilesPage = React.lazy(loadPatientFiles);
const AppointmentsView = React.lazy(loadAppointments);
const SecretaryPage = React.lazy(loadSecretary);
const DrugToolsView = React.lazy(loadDrugTools);
const MedicationEditPage = React.lazy(loadMedicationEdit);
const PrescriptionSettingsPage = React.lazy(loadPrescriptionSettings);
const AdvertisementAndPublicPage = React.lazy(loadAdvertisement);
const FinancialReportsPage = React.lazy(loadFinancialReports);
const BranchSettingsPage = React.lazy(loadBranchSettings);

/**
 * Preload لصفحات السايد بار الأكثر استخداماً فقط — بيستدعي نفس دوال الـimport
 * عشان الـbrowser يحمّلهم في الخلفية. الـimport() كاش في Vite — استدعاؤه تاني
 * لما المستخدم يدوس على الصفحة مش بيحمّل مرة تانية، بيجيب النسخة المحمّلة فوراً.
 *
 * ─ تقليل من 12 صفحة لـ4 صفحات (2026-04): الـpreloading الكامل كان بيـsaturate
 *   الـCPU والشبكة في أول 10 ثواني من فتح التطبيق ويسبب تهنيج. دلوقتي بنـpreload
 *   الـ4 الأكثر استخداماً فقط، والباقي بيتحمّل لما الطبيب يضغط عليه (تأخير ~1
 *   ثانية أول مرة، ثم كاش بعدها).
 */
export const preloadMainAppViewChunks = () => {
  // الـ4 صفحات الأكثر استخداماً يومياً — preload في الخلفية
  void loadDashboard();
  void loadPrescription();
  void loadRecords();
  void loadAppointments();
  // باقي الصفحات (Secretary/PatientFiles/FinancialReports/DrugTools/Settings/...)
  // بتتحمّل lazy عند الضغط عليها — وفرنا بكدا تحميل ~3 ميجا في الخلفية وقت
  // الإقلاع، ودا بيخلي التطبيق responsive من أول ثانية.
};

// القوائم دي طويلة جداً عمداً — Props متجمعة لتجنب ترتيب متناثر.
// أي شاشة بتاخد بس الـ props اللي تخصها.
interface MainAppViewRouterProps {
  // ── توجيه عام ──
  currentView: AppView;
  navigateToView: (view: AppView) => void;

  // ── بيانات المستخدم والفرع ──
  user: import('firebase/auth').User | null;
  userId: string;
  activeBranchId: string | null;
  branches: Branch[];
  branchesLoading: boolean;
  normalizedDoctorName: string;
  normalizedDoctorSpecialty: string;
  profileImage: string | null;

  // ── بيانات مشتركة بين الشاشات ──
  records: PatientRecord[];
  appointments: ClinicAppointment[];
  todayAppointmentsList: ClinicAppointment[];
  /** dashboardStats له أشكال مختلفة بين الـ hooks — any للمرونة */
  dashboardStats: any;

  // ── Home ──
  onStartNewExam: () => void;

  // ── Prescription ──
  analyzing: boolean;
  setAnalyzing: (v: boolean) => void;
  patientName: string; setPatientName: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  ageYears: string; setAgeYears: (v: string) => void;
  ageMonths: string; setAgeMonths: (v: string) => void;
  ageDays: string; setAgeDays: (v: string) => void;
  // حقول الهوية الجديدة: الجنس ثابت + الحمل/الرضاعة snapshot
  gender: import('../../types').PatientGender | ''; setGender: (v: import('../../types').PatientGender | '') => void;
  pregnant: boolean | null; setPregnant: (v: boolean | null) => void;
  breastfeeding: boolean | null; setBreastfeeding: (v: boolean | null) => void;
  setActivePatientFileId: (v: string | null) => void;
  setActivePatientFileNumber: (v: number | null) => void;
  setActivePatientFileNameKey: (v: string | null) => void;
  /** اقتراحات المرضى من السجلات — any لأن الشكل الخاص بيها معقد */
  basicPatientSuggestions: any;
  visitDate: string; setVisitDate: (v: string) => void;
  visitType: 'exam' | 'consultation'; setVisitType: (v: 'exam' | 'consultation') => void;
  handleResetAndClearOpenedAppointment: () => void;
  complaint: string; setComplaint: (v: string) => void;
  medicalHistory: string; setMedicalHistory: (v: string) => void;
  examination: string; setExamination: (v: string) => void;
  investigations: string; setInvestigations: (v: string) => void;
  handleFullAutomatedRX: () => Promise<void>;
  /** زر "إضافة إلى الروشتة والسجلات" — يضيف البيانات بدون popup ويسيب Dx فاضي */
  handleQuickAddToRx: () => Promise<void>;
  /** زر "تحليل الحالة" — يضيف للروشتة + يفتح popup بالـ DDx/Must-Not-Miss */
  handleDeepAnalyzeWithPopup: () => Promise<void>;
  // state نافذة تحليل الحالة — أنواع any للتبسيط (بنستخدمها internally بس)
  caseAnalysisOpen: boolean;
  setCaseAnalysisOpen: (v: boolean) => void;
  caseAnalysisResult: any;
  caseAnalysisLoading: boolean;
  addedDiagnosesFromModal: string[];
  setAddedDiagnosesFromModal: React.Dispatch<React.SetStateAction<string[]>>;
  addedInvestigationsFromModal: string[];
  setAddedInvestigationsFromModal: React.Dispatch<React.SetStateAction<string[]>>;
  addedInstructionsFromModal: string[];
  setAddedInstructionsFromModal: React.Dispatch<React.SetStateAction<string[]>>;
  needsManualDxHint: boolean;
  smartQuotaNotice: any; isQuotaLimitError: boolean; errorMsg: string | null;
  weight: string; setWeight: (v: string) => void;
  height: string; setHeight: (v: string) => void;
  bmi: string; vitals: VitalSigns; updateVital: (key: string, value: string) => void;
  prescriptionSettings: PrescriptionSettings | null | undefined;
  appointmentSecretaryCustomValues: Record<string, string>;
  updateAppointmentSecretaryCustomValue: (boxId: string, nextValue: string) => void;
  totalAgeInMonths: number; parsedWeight: number;
  // signatures مختلفة من useDrHyper (بعضها يأخذ arguments) — any للمرونة
  handleAddManualMedication: any; handleAddEmptyMedication: any;
  handleAddCustomItem: any; handleAddManualLab: any; handleAddManualAdvice: any;
  setShowReadyPrescriptionsModal: (v: boolean) => void;
  consultationDate: string;
  /** rxItems شكلها PrescriptionItem — any للمرونة عند التمرير */
  rxItems: any;
  generalAdvice: string[]; labInvestigations: string[];
  // setters مباشرة للنصائح والفحوصات — يستخدمها مودال تحليل الحالة للإضافة
  setGeneralAdvice: React.Dispatch<React.SetStateAction<string[]>>;
  setLabInvestigations: React.Dispatch<React.SetStateAction<string[]>>;
  complaintEn: string; setComplaintEn: (v: string) => void;
  historyEn: string; setHistoryEn: (v: string) => void;
  examEn: string; setExamEn: (v: string) => void;
  investigationsEn: string; setInvestigationsEn: (v: string) => void;
  diagnosisEn: string; setDiagnosisEn: (v: string) => void;
  // الـ prescription item callbacks بيستخدموا signatures مختلفة من useDrHyper — any للتبسيط
  removeItem: any; updateItemName: any;
  updateItemInstruction: any;
  updateItemFontSize: any;
  handleSwapItem: any;
  selectMedicationForItem: any;
  setSelectedMed: (med: Medication | null) => void;
  selectedMed: Medication | null;
  updateAdvice: (idx: number, text: string) => void; removeAdvice: (idx: number) => void;
  updateLab: (idx: number, text: string) => void; removeLab: (idx: number) => void;
  isExportingPrescription: boolean;
  isDataOnlyMode: boolean; setIsDataOnlyMode: (v: boolean) => void;
  prescriptionRef: React.RefObject<HTMLDivElement>;
  usageStats: Record<string, number>;
  handleNativePrint: () => void; isPrinting: boolean;
  handleDownloadPrescriptionPdf: () => void; isDownloading: boolean;
  handleSharePrescriptionViaWhatsApp: () => void; isSharingViaWhatsApp: boolean;
  handleSaveRecordWithAppointmentSync: () => void;
  openSaveReadyPrescriptionModal: () => void;
  handleUndo: () => void; handleRedo: () => void;
  historyStackLength: number; futureStackLength: number;
  paymentType: PaymentType; setPaymentType: (v: PaymentType) => void;
  insuranceCompanyId: string; setInsuranceCompanyId: (v: string) => void;
  insuranceCompanyName: string; setInsuranceCompanyName: (v: string) => void;
  insuranceApprovalCode: string; setInsuranceApprovalCode: (v: string) => void;
  insuranceMembershipId: string; setInsuranceMembershipId: (v: string) => void;
  patientSharePercent: number; setPatientSharePercent: (v: number) => void;
  discountAmount: number; setDiscountAmount: (v: number) => void;
  discountPercent: number; setDiscountPercent: (v: number) => void;
  discountReasonId: string; setDiscountReasonId: (v: string) => void;
  discountReasonLabel: string; setDiscountReasonLabel: (v: string) => void;

  // ── Appointments / Secretary ──
  bookingSecret: string | null;
  handleBookingSecretReady: (secret: string) => void;
  handleSyncSecretaryVitalsVisibility: (
    visibility: SecretaryVitalsVisibility,
    fields: SecretaryVitalFieldDefinition[],
    resolvedSecret?: string
  ) => Promise<void>;
  openExam: (apt: ClinicAppointment) => void;
  openConsultationForAppointment: (apt: ClinicAppointment) => boolean;
  showNotification: (msg: string, type?: unknown, options?: unknown) => void;

  // ── Records / Patient Files ──
  setOpenedAppointmentContext: (apt: ClinicAppointment | null) => void;
  handleLoadRecord: (rec: PatientRecord) => void;
  handleOpenConsultation: (rec: PatientRecord) => void;
  handleLoadConsultation: (rec: PatientRecord) => void;
  handleNewExamFromRecord: (rec: PatientRecord) => void;
  /** تعمد استخدام any هنا لأن الـ payload معقد ومختلف بين المستدعين (RecordsView/PatientFilesPage) */
  handleGeneratePatientMedicalReport: any;
  handleDeleteRecord: (id: string) => void;
  handleDeleteConsultation: (record: PatientRecord) => void;
  handleDeleteExam: (record: PatientRecord) => void;
  handleAddPastExam: (date: string) => void;
  handleAddPastConsultation: (date: string) => void;

  // ── Branch Settings ──
  setActiveBranchId: (id: string) => void;
  addBranch: (branch: Omit<Branch, 'id'>) => Promise<void>;
  updateBranch: (branch: Branch) => Promise<void>;
  deleteBranch: (id: string) => Promise<void>;

  // ── Prescription Settings ──
  savePrescriptionSettings: (settings: PrescriptionSettings) => Promise<void>;
}

export const MainAppViewRouter: React.FC<MainAppViewRouterProps> = (p) => {
  return (
    <>
      {p.currentView === 'home' && (
        <Dashboard
          user={p.user}
          stats={p.dashboardStats}
          onNavigate={(view) => p.navigateToView(view as AppView)}
          onStartNewExam={p.onStartNewExam}
          doctorName={p.normalizedDoctorName || undefined}
          todayAppointments={p.todayAppointmentsList}
          records={p.records}
          userId={p.userId}
          activeBranchId={p.activeBranchId}
        />
      )}

      {p.currentView === 'prescription' && (
        <MainAppPrescriptionSection
          analyzing={p.analyzing}
          onCancelAnalyze={() => { if (window.confirm('هل تريد إيقاف التحليل؟')) { p.setAnalyzing(false); } }}
          patientName={p.patientName} setPatientName={p.setPatientName}
          phone={p.phone} setPhone={p.setPhone}
          ageYears={p.ageYears} setAgeYears={p.setAgeYears}
          ageMonths={p.ageMonths} setAgeMonths={p.setAgeMonths}
          ageDays={p.ageDays} setAgeDays={p.setAgeDays}
          gender={p.gender} setGender={p.setGender}
          pregnant={p.pregnant} setPregnant={p.setPregnant}
          breastfeeding={p.breastfeeding} setBreastfeeding={p.setBreastfeeding}
          setActivePatientFileId={p.setActivePatientFileId}
          setActivePatientFileNumber={p.setActivePatientFileNumber}
          setActivePatientFileNameKey={p.setActivePatientFileNameKey}
          patientSuggestions={p.basicPatientSuggestions}
          visitDate={p.visitDate} setVisitDate={p.setVisitDate}
          onReset={p.handleResetAndClearOpenedAppointment}
          visitType={p.visitType} setVisitType={p.setVisitType}
          complaint={p.complaint} setComplaint={p.setComplaint}
          medicalHistory={p.medicalHistory} setMedicalHistory={p.setMedicalHistory}
          examination={p.examination} setExamination={p.setExamination}
          investigations={p.investigations} setInvestigations={p.setInvestigations}
          onAnalyze={p.handleDeepAnalyzeWithPopup}
          onQuickAddToRx={p.handleQuickAddToRx}
          // state نافذة تحليل الحالة الغنية
          caseAnalysisOpen={p.caseAnalysisOpen}
          setCaseAnalysisOpen={p.setCaseAnalysisOpen}
          caseAnalysisResult={p.caseAnalysisResult}
          caseAnalysisLoading={p.caseAnalysisLoading}
          addedDiagnosesFromModal={p.addedDiagnosesFromModal}
          setAddedDiagnosesFromModal={p.setAddedDiagnosesFromModal}
          addedInvestigationsFromModal={p.addedInvestigationsFromModal}
          setAddedInvestigationsFromModal={p.setAddedInvestigationsFromModal}
          addedInstructionsFromModal={p.addedInstructionsFromModal}
          setAddedInstructionsFromModal={p.setAddedInstructionsFromModal}
          needsManualDxHint={p.needsManualDxHint}
          // تمرير setters للنصائح والفحوصات من MainApp prop chain
          setGeneralAdvice={p.setGeneralAdvice}
          setLabInvestigations={p.setLabInvestigations}
          smartQuotaNotice={p.smartQuotaNotice}
          isQuotaLimitError={p.isQuotaLimitError} errorMsg={p.errorMsg}
          weight={p.weight} setWeight={p.setWeight}
          height={p.height} setHeight={p.setHeight}
          bmi={p.bmi} vitals={p.vitals} updateVital={p.updateVital}
          customBoxes={p.prescriptionSettings?.customBoxes || []}
          customBoxValues={p.appointmentSecretaryCustomValues}
          onCustomBoxValueChange={p.updateAppointmentSecretaryCustomValue}
          prescriptionSettings={p.prescriptionSettings}
          totalAgeInMonths={p.totalAgeInMonths} parsedWeight={p.parsedWeight}
          onAddManualMedication={p.handleAddManualMedication}
          onAddEmptyMedication={p.handleAddEmptyMedication}
          onAddCustomItem={p.handleAddCustomItem}
          onAddManualLab={p.handleAddManualLab}
          onAddManualAdvice={p.handleAddManualAdvice}
          onOpenReadyPrescriptions={() => p.setShowReadyPrescriptionsModal(true)}
          consultationDate={p.consultationDate}
          rxItems={p.rxItems} generalAdvice={p.generalAdvice} labInvestigations={p.labInvestigations}
          complaintEn={p.complaintEn} setComplaintEn={p.setComplaintEn}
          historyEn={p.historyEn} setHistoryEn={p.setHistoryEn}
          examEn={p.examEn} setExamEn={p.setExamEn}
          investigationsEn={p.investigationsEn} setInvestigationsEn={p.setInvestigationsEn}
          diagnosisEn={p.diagnosisEn} setDiagnosisEn={p.setDiagnosisEn}
          onRemoveItem={p.removeItem} onUpdateItemName={p.updateItemName}
          onUpdateItemInstruction={p.updateItemInstruction}
          onUpdateItemFontSize={p.updateItemFontSize}
          onSwapItem={p.handleSwapItem} onSelectMedication={p.selectMedicationForItem}
          onMedicationClick={p.setSelectedMed}
          onUpdateAdvice={p.updateAdvice} onRemoveAdvice={p.removeAdvice}
          onUpdateLab={p.updateLab} onRemoveLab={p.removeLab}
          isPrintMode={p.isExportingPrescription}
          isDataOnlyMode={p.isDataOnlyMode} setIsDataOnlyMode={p.setIsDataOnlyMode}
          prescriptionRef={p.prescriptionRef} usageStats={p.usageStats}
          onPrint={p.handleNativePrint} isPrinting={p.isPrinting}
          onDownloadPdf={p.handleDownloadPrescriptionPdf} isDownloadingPdf={p.isDownloading}
          onShareWhatsApp={p.handleSharePrescriptionViaWhatsApp}
          isSharingViaWhatsApp={p.isSharingViaWhatsApp}
          onSaveRecord={p.handleSaveRecordWithAppointmentSync}
          onOpenSaveReadyPrescriptionModal={p.openSaveReadyPrescriptionModal}
          onUndo={p.handleUndo} onRedo={p.handleRedo}
          historyLength={p.historyStackLength} futureLength={p.futureStackLength}
          userId={p.userId}
          activeBranchId={p.activeBranchId}
          paymentType={p.paymentType} setPaymentType={p.setPaymentType}
          insuranceCompanyId={p.insuranceCompanyId} setInsuranceCompanyId={p.setInsuranceCompanyId}
          insuranceCompanyName={p.insuranceCompanyName} setInsuranceCompanyName={p.setInsuranceCompanyName}
          insuranceApprovalCode={p.insuranceApprovalCode} setInsuranceApprovalCode={p.setInsuranceApprovalCode}
          insuranceMembershipId={p.insuranceMembershipId} setInsuranceMembershipId={p.setInsuranceMembershipId}
          patientSharePercent={p.patientSharePercent} setPatientSharePercent={p.setPatientSharePercent}
          discountAmount={p.discountAmount} setDiscountAmount={p.setDiscountAmount}
          discountPercent={p.discountPercent} setDiscountPercent={p.setDiscountPercent}
          discountReasonId={p.discountReasonId} setDiscountReasonId={p.setDiscountReasonId}
          discountReasonLabel={p.discountReasonLabel} setDiscountReasonLabel={p.setDiscountReasonLabel}
          showNotification={p.showNotification}
        />
      )}

      {p.currentView === 'appointments' && (
        <AppointmentsView
          bookingSecret={p.bookingSecret}
          appointments={p.appointments}
          records={p.records}
          activeBranchId={p.activeBranchId}
          prescriptionVitalsConfig={p.prescriptionSettings?.vitals || []}
          prescriptionCustomBoxes={p.prescriptionSettings?.customBoxes || []}
          onSyncSecretaryVitalsVisibility={p.handleSyncSecretaryVitalsVisibility}
          onBookingSecretReady={p.handleBookingSecretReady}
          onOpenExam={p.openExam}
          onOpenConsultation={p.openConsultationForAppointment}
          showNotification={p.showNotification}
          onClose={() => p.navigateToView('prescription')}
        />
      )}

      {p.currentView === 'secretary' && (
        <SecretaryPage
          bookingSecret={p.bookingSecret}
          onBookingSecretReady={p.handleBookingSecretReady}
          prescriptionVitalsConfig={p.prescriptionSettings?.vitals || []}
          prescriptionCustomBoxes={p.prescriptionSettings?.customBoxes || []}
          onSyncSecretaryVitalsVisibility={p.handleSyncSecretaryVitalsVisibility}
        />
      )}

      {p.currentView === 'records' && (
        <RecordsView
          records={p.records}
          onLoadRecord={(rec) => { p.setOpenedAppointmentContext(null); p.handleLoadRecord(rec); }}
          onOpenConsultation={(rec) => { p.setOpenedAppointmentContext(null); p.handleOpenConsultation(rec); p.navigateToView('prescription'); }}
          onLoadConsultation={(rec) => { p.setOpenedAppointmentContext(null); p.handleLoadConsultation(rec); p.navigateToView('prescription'); }}
          onNewExam={(rec) => { p.setOpenedAppointmentContext(null); p.handleNewExamFromRecord(rec); p.navigateToView('prescription'); }}
          onGeneratePatientMedicalReport={p.handleGeneratePatientMedicalReport}
          onDeleteRecord={p.handleDeleteRecord}
          onDeleteConsultation={p.handleDeleteConsultation}
          onDeleteExam={p.handleDeleteExam}
          onAddPastExam={p.handleAddPastExam}
          onAddPastConsultation={p.handleAddPastConsultation}
          onClose={() => p.navigateToView('prescription')}
          branchId={p.activeBranchId}
        />
      )}

      {p.currentView === 'patientFiles' && (
        <PatientFilesPage
          records={p.records}
          onLoadRecord={(rec) => {
            p.setOpenedAppointmentContext(null);
            p.handleLoadRecord(rec);
            p.navigateToView('prescription');
          }}
          onLoadConsultation={(rec) => {
            p.setOpenedAppointmentContext(null);
            p.handleLoadConsultation(rec);
            p.navigateToView('prescription');
          }}
          onGeneratePatientMedicalReport={p.handleGeneratePatientMedicalReport}
          branchId={p.activeBranchId}
        />
      )}

      {p.currentView === 'financialReports' && (
        <FinancialReportsPage
          records={p.records}
          onBack={() => p.navigateToView('home')}
          userId={p.userId}
          branchId={p.activeBranchId}
          branches={p.branches}
        />
      )}

      {p.currentView === 'drugtools' && (
        <DrugToolsView
          onClose={() => p.navigateToView('prescription')}
          onOpenMedicationEdit={() => p.navigateToView('medicationEdit')}
        />
      )}

      {p.currentView === 'medicationEdit' && (
        <MedicationEditPage onBack={() => p.navigateToView('drugtools')} />
      )}

      {p.currentView === 'settings' && p.prescriptionSettings && (
        <PrescriptionSettingsPage
          settings={p.prescriptionSettings}
          onSave={p.savePrescriptionSettings}
          onBack={() => p.navigateToView('prescription')}
        />
      )}

      {p.currentView === 'branchSettings' && (
        <BranchSettingsPage
          branches={p.branches}
          activeBranchId={p.activeBranchId}
          loading={p.branchesLoading}
          onSetActiveBranch={p.setActiveBranchId}
          onAddBranch={p.addBranch}
          onUpdateBranch={p.updateBranch}
          onDeleteBranch={p.deleteBranch}
          onBack={() => p.navigateToView('home')}
        />
      )}

      {p.currentView === 'advertisement' && (
        <AdvertisementAndPublicPage
          doctorId={p.userId}
          doctorName={p.normalizedDoctorName}
          doctorSpecialty={p.normalizedDoctorSpecialty}
          profileImage={p.profileImage || undefined}
        />
      )}

      {p.selectedMed && (
        <MedicationDetailsModal
          medication={p.selectedMed}
          onClose={() => p.setSelectedMed(null)}
          weight={p.weight}
          totalAgeInMonths={p.totalAgeInMonths}
        />
      )}
    </>
  );
};
