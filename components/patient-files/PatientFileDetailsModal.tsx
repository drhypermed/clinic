import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import type { PatientRecord } from '../../types';
import {
  formatPatientFileDateLabel,
  isPositiveFileNumber,
  type PatientFileData,
} from './patientFilesShared';
import type { ClinicalReportLanguage, ClinicalReportPageSize } from '../reports/clinical-ai-report';
import { PatientContactActions } from '../common/PatientContactActions';
import { useAuth } from '../../hooks/useAuth';
import { PatientFileCostsSection } from './PatientFileCostsSection';
import { PatientFileInvoiceSection } from './PatientFileInvoiceSection';
import { PatientFileVisitsList } from './PatientFileVisitsList';
import { patientFilesService } from '../../services/patient-files';

const getTodayDateKey = (): string =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' });

interface PatientFileDetailsModalProps {
  patientFile: PatientFileData | null;
  onClose: () => void;
  onEditExamVisit: (record: PatientRecord) => void;
  onEditConsultationVisit: (record: PatientRecord) => void;
  onGeneratePatientMedicalReport: (payload: {
    patientFile: PatientFileData;
    language: ClinicalReportLanguage;
    pageSize: ClinicalReportPageSize;
    fontSize: number;
  }) => Promise<void>;
  onUpdatePatientIdentity: (payload: {
    patientFileId?: string;
    patientFileNumber?: number;
    patientFileNameKey?: string;
    patientName: string;
    phone?: string;
    ageYears?: string;
    ageMonths?: string;
    ageDays?: string;
  }) => Promise<{
    updatedRecordsCount: number;
    updatedAppointmentsCount: number;
  } | null>;
  onSaveAdditionalInfo: (payload: {
    patientFileId?: string;
    patientFileNumber?: number;
    patientFileNameKey?: string;
    patientName: string;
    phone?: string;
    additionalInfo: string;
  }) => Promise<{
    patientFileId: string;
    patientFileNumber: number;
    patientFileNameKey: string;
    additionalInfo: string;
  } | null>;
  /** الفرع النشط — يمرر لـ PatientFileCostsSection لفصل التكاليف بين الفروع */
  branchId?: string;
}

export const PatientFileDetailsModal: React.FC<PatientFileDetailsModalProps> = ({
  patientFile,
  onClose,
  onEditExamVisit,
  onEditConsultationVisit,
  onGeneratePatientMedicalReport,
  onUpdatePatientIdentity,
  onSaveAdditionalInfo,
  branchId,
}) => {
  const { user } = useAuth();
  const [isIdentityEditorOpen, setIsIdentityEditorOpen] = useState(false);
  const [editPatientName, setEditPatientName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAgeYears, setEditAgeYears] = useState('');
  const [editAgeMonths, setEditAgeMonths] = useState('');
  const [editAgeDays, setEditAgeDays] = useState('');
  const [isUpdatingIdentity, setIsUpdatingIdentity] = useState(false);
  const [identityUpdateError, setIdentityUpdateError] = useState<string | null>(null);
  const [identityUpdateSuccess, setIdentityUpdateSuccess] = useState<string | null>(null);
  const [isAdditionalInfoEditorOpen, setIsAdditionalInfoEditorOpen] = useState(false);
  const [editAdditionalInfo, setEditAdditionalInfo] = useState('');
  const [isSavingAdditionalInfo, setIsSavingAdditionalInfo] = useState(false);
  const [additionalInfoError, setAdditionalInfoError] = useState<string | null>(null);
  const [additionalInfoSuccess, setAdditionalInfoSuccess] = useState<string | null>(null);
  const [reportLanguage, setReportLanguage] = useState<ClinicalReportLanguage>('ar');
  const [reportPageSize, setReportPageSize] = useState<ClinicalReportPageSize>('A5');
  const [reportFontSize, setReportFontSize] = useState('13');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [isReportSettingsOpen, setIsReportSettingsOpen] = useState(false);
  const [reportSettingsSaved, setReportSettingsSaved] = useState(false);

  useEffect(() => {
    if (!patientFile || typeof window === 'undefined') return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [patientFile, onClose]);

  useEffect(() => {
    if (!patientFile || typeof document === 'undefined') return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarCompensation = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarCompensation > 0) {
      document.body.style.paddingRight = `${scrollbarCompensation}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [patientFile]);

  const modalPortalTarget = typeof document !== 'undefined' ? document.body : null;

  const latestVisitRecord = useMemo(() => {
    if (!patientFile || patientFile.visits.length === 0) return null;
    return patientFile.visits[0].record;
  }, [patientFile]);

  useEffect(() => {
    if (!patientFile) return;

    setEditPatientName(String(patientFile.name || '').trim());
    setEditPhone(String(patientFile.phones?.[0] || latestVisitRecord?.phone || '').trim());
    setEditAgeYears(String(latestVisitRecord?.age?.years || '').trim());
    setEditAgeMonths(String(latestVisitRecord?.age?.months || '').trim());
    setEditAgeDays(String(latestVisitRecord?.age?.days || '').trim());
    setIdentityUpdateError(null);
    setIdentityUpdateSuccess(null);
    setIsIdentityEditorOpen(false);
    setEditAdditionalInfo(String(patientFile.additionalInfo || '').trim());
    setIsAdditionalInfoEditorOpen(false);
    setAdditionalInfoError(null);
    setAdditionalInfoSuccess(null);
    // نبدأ بقيم من localStorage (mirror سريع) ثم بنحدّث من Firestore في الخلفية
    const defaults = patientFilesService.getDefaultReportPreferences();
    const local = patientFilesService.readReportPreferencesFromLocalStorage();
    setReportLanguage(local.language ?? defaults.language);
    setReportPageSize(local.pageSize ?? defaults.pageSize);
    setReportFontSize(String(local.fontSize ?? defaults.fontSize));
    setReportError(null);
    setIsGeneratingReport(false);
    setIsReportSettingsOpen(false);
    setReportSettingsSaved(false);
  }, [latestVisitRecord, patientFile]);

  // تحميل تفضيلات التقرير من Firestore — تتغلب على قيم localStorage لما يكون فيه مستخدم مسجل
  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;
    (async () => {
      const cloudPrefs = await patientFilesService.loadReportPreferences(user.uid);
      if (cancelled || !cloudPrefs) return;
      setReportLanguage(cloudPrefs.language);
      setReportPageSize(cloudPrefs.pageSize);
      setReportFontSize(String(cloudPrefs.fontSize));
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.uid, patientFile?.key]);

  const handleSaveReportSettings = async () => {
    try {
      const parsedFont = Number(reportFontSize);
      const normalizedFont = Number.isFinite(parsedFont)
        ? Math.max(10, Math.min(22, Math.round(parsedFont)))
        : 13;

      const saved = await patientFilesService.saveReportPreferences(user?.uid || '', {
        language: reportLanguage,
        pageSize: reportPageSize,
        fontSize: normalizedFont,
      });
      setReportFontSize(String(saved.fontSize));
      setReportSettingsSaved(true);
      setTimeout(() => setReportSettingsSaved(false), 2200);
    } catch (error) {
      console.error('Error saving report settings:', error);
    }
  };

  const handleSubmitIdentityUpdate = async () => {
    const normalizedName = String(editPatientName || '').trim();
    if (!normalizedName) {
      setIdentityUpdateError('يرجى إدخال اسم المريض قبل الحفظ.');
      return;
    }

    if (!patientFile) return;

    setIsUpdatingIdentity(true);
    setIdentityUpdateError(null);
    setIdentityUpdateSuccess(null);

    try {
      const result = await onUpdatePatientIdentity({
        patientFileId: patientFile.fileId,
        patientFileNumber: patientFile.fileNumber,
        patientFileNameKey: patientFile.key,
        patientName: normalizedName,
        phone: String(editPhone || '').trim() || undefined,
        ageYears: String(editAgeYears || '').trim() || undefined,
        ageMonths: String(editAgeMonths || '').trim() || undefined,
        ageDays: String(editAgeDays || '').trim() || undefined,
      });

      const updatedRecords = Number(result?.updatedRecordsCount || 0);
      const updatedAppointments = Number(result?.updatedAppointmentsCount || 0);
      setIdentityUpdateSuccess(`تم تحديث بيانات المريض بنجاح في ${updatedRecords} سجل و ${updatedAppointments} موعد.`);
      setIsIdentityEditorOpen(false);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'حدث خطأ أثناء تحديث بيانات المريض.';
      setIdentityUpdateError(message);
    } finally {
      setIsUpdatingIdentity(false);
    }
  };

  const handleSubmitAdditionalInfo = async () => {
    if (!patientFile) return;

    setIsSavingAdditionalInfo(true);
    setAdditionalInfoError(null);
    setAdditionalInfoSuccess(null);

    try {
      await onSaveAdditionalInfo({
        patientFileId: patientFile.fileId,
        patientFileNumber: patientFile.fileNumber,
        patientFileNameKey: patientFile.key,
        patientName: String(patientFile.name || '').trim(),
        phone: String(patientFile.phones?.[0] || '').trim() || undefined,
        additionalInfo: String(editAdditionalInfo || '').trim(),
      });

      setAdditionalInfoSuccess('تم حفظ المعلومات الإضافية بنجاح.');
      setIsAdditionalInfoEditorOpen(false);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'حدث خطأ أثناء حفظ المعلومات الإضافية.';
      setAdditionalInfoError(message);
    } finally {
      setIsSavingAdditionalInfo(false);
    }
  };

  const handleDeleteAdditionalInfo = async () => {
    if (!patientFile) return;
    const confirmed = typeof window !== 'undefined'
      ? window.confirm('هل أنت متأكد من حذف المعلومات الإضافية لهذا المريض؟')
      : true;
    if (!confirmed) return;

    setIsSavingAdditionalInfo(true);
    setAdditionalInfoError(null);
    setAdditionalInfoSuccess(null);

    try {
      await onSaveAdditionalInfo({
        patientFileId: patientFile.fileId,
        patientFileNumber: patientFile.fileNumber,
        patientFileNameKey: patientFile.key,
        patientName: String(patientFile.name || '').trim(),
        phone: String(patientFile.phones?.[0] || '').trim() || undefined,
        additionalInfo: '',
      });

      setEditAdditionalInfo('');
      setIsAdditionalInfoEditorOpen(false);
      setAdditionalInfoSuccess('تم حذف المعلومات الإضافية.');
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'حدث خطأ أثناء حذف المعلومات الإضافية.';
      setAdditionalInfoError(message);
    } finally {
      setIsSavingAdditionalInfo(false);
    }
  };

  const handleGenerateMedicalReport = async () => {
    if (!patientFile) return;

    const parsedFont = Number(reportFontSize);
    const normalizedFontSize = Number.isFinite(parsedFont)
      ? Math.max(10, Math.min(22, Math.round(parsedFont)))
      : 13;

    setIsGeneratingReport(true);
    setReportError(null);

    try {
      await onGeneratePatientMedicalReport({
        patientFile,
        language: reportLanguage,
        pageSize: reportPageSize,
        fontSize: normalizedFontSize,
      });
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'حدث خطأ أثناء توليد التقرير الطبي.';
      setReportError(message);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const sortedVisits = useMemo(() => {
    if (!patientFile) return [];
    return [...patientFile.visits].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [patientFile]);

  if (!patientFile || !modalPortalTarget) return null;

  return createPortal(
    <div
      className="fixed inset-0 md:right-60 z-[10050] bg-slate-950/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="h-full w-full overflow-y-auto" onClick={(event) => event.stopPropagation()}>
        <div className="min-h-full bg-slate-50">
          <div className="w-full space-y-3 px-2 pt-4 pb-3 sm:px-3 sm:pt-5 sm:pb-4">
            {/* رأس الملف — gradient أزرق مطابق لأسلوب dh-day-head في سجلات المرضى */}
            <header className="dh-day-shell rounded-2xl border overflow-hidden">
              <div className="dh-day-head px-4 py-4 text-white">
                {/* السطر الأول: الاسم + رقم الملف + زر الإغلاق */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-black leading-tight flex items-center gap-2 flex-wrap">
                      <span>{patientFile.name || 'مريض بدون اسم'}</span>
                      <span className="text-[12px] font-bold bg-white/25 border border-white/40 rounded-full px-2.5 py-0.5 shrink-0">
                        {isPositiveFileNumber(patientFile.fileNumber) ? `ملف #${patientFile.fileNumber}` : 'قيد التوليد'}
                      </span>
                    </h3>
                    {/* السطر الثاني: الزيارات والكشوفات والاستشارات */}
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center bg-white/20 border border-white/30 text-white rounded-full px-2.5 py-0.5 text-[11px] font-black">
                        {patientFile.visits.length} زيارة
                      </span>
                      <span className="inline-flex items-center bg-white/20 border border-white/30 text-white rounded-full px-2.5 py-0.5 text-[11px] font-black">
                        {patientFile.examCount} كشف
                      </span>
                      <span className="inline-flex items-center bg-white/20 border border-white/30 text-white rounded-full px-2.5 py-0.5 text-[11px] font-black">
                        {patientFile.consultationCount} استشارة
                      </span>
                      {patientFile.latestVisitDate && (
                        <span className="inline-flex items-center bg-white/15 border border-white/25 text-brand-100 rounded-full px-2.5 py-0.5 text-[11px] font-bold">
                          آخر زيارة: {formatPatientFileDateLabel(patientFile.latestVisitDate)}
                        </span>
                      )}
                    </div>
                    {/* السطر الثالث: الهاتف + أيقونات التواصل */}
                    {patientFile.phones.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm font-medium text-brand-100 block">{patientFile.phones.join(' | ')}</span>
                        <div className="mt-1.5">
                          <PatientContactActions phone={patientFile.phones[0]} compact />
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="shrink-0 rounded-xl border border-danger-400/60 bg-gradient-to-br from-danger-600 to-danger-500 px-3 py-2 text-xs font-black text-white shadow-sm transition-opacity hover:opacity-90"
                  >
                    إغلاق
                  </button>
                </div>
                {/* السطر الخامس: زر تعديل بيانات المريض + زر إضافة معلومات إضافية */}
                <div className="mt-3 pt-3 border-t border-white/20 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIdentityUpdateError(null);
                      setIdentityUpdateSuccess(null);
                      setIsIdentityEditorOpen((prev) => !prev);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/40 bg-white/15 px-4 py-2 text-xs font-black text-white transition-colors hover:bg-white/25"
                  >
                    {isIdentityEditorOpen ? 'إغلاق تعديل البيانات' : 'تعديل بيانات المريض'}
                  </button>
                  {!String(patientFile.additionalInfo || '').trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        setAdditionalInfoError(null);
                        setAdditionalInfoSuccess(null);
                        setEditAdditionalInfo('');
                        setIsAdditionalInfoEditorOpen((prev) => !prev);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/40 bg-white/15 px-4 py-2 text-xs font-black text-white transition-colors hover:bg-white/25"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                      {isAdditionalInfoEditorOpen ? 'إغلاق المعلومات الإضافية' : 'إضافة معلومات إضافية عن المريض'}
                    </button>
                  )}
                </div>
              </div>
            </header>

            {/* قسم تعديل بيانات المريض — يظهر عند الضغط على الزر في الهيدر */}
            {isIdentityEditorOpen && (
              <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
                {identityUpdateSuccess && (
                  <div className="mb-3 rounded-lg border border-success-200 bg-success-50 px-3 py-2 text-[11px] font-black text-success-700">
                    {identityUpdateSuccess}
                  </div>
                )}
                {identityUpdateError && (
                  <div className="mb-3 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-[11px] font-black text-danger-700">
                    {identityUpdateError}
                  </div>
                )}
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-black text-slate-600">الاسم</label>
                    <input
                      value={editPatientName}
                      onChange={(event) => setEditPatientName(event.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 focus:border-brand-500 focus:outline-none"
                      placeholder="اسم المريض"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-black text-slate-600">رقم التليفون</label>
                    <input
                      value={editPhone}
                      onChange={(event) => setEditPhone(event.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 focus:border-brand-500 focus:outline-none"
                      placeholder="01xxxxxxxxx"
                      dir="ltr"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-[11px] font-black text-slate-600">السن (سنوات / شهور / أيام)</label>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        value={editAgeYears}
                        onChange={(event) => setEditAgeYears(event.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 focus:border-brand-500 focus:outline-none"
                        placeholder="سنوات"
                      />
                      <input
                        type="number"
                        value={editAgeMonths}
                        onChange={(event) => setEditAgeMonths(event.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 focus:border-brand-500 focus:outline-none"
                        placeholder="شهور"
                      />
                      <input
                        type="number"
                        value={editAgeDays}
                        onChange={(event) => setEditAgeDays(event.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 focus:border-brand-500 focus:outline-none"
                        placeholder="أيام"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSubmitIdentityUpdate}
                      disabled={isUpdatingIdentity}
                      className={`rounded-lg px-3 py-2 text-xs font-black text-white ${isUpdatingIdentity ? 'bg-slate-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700'}`}
                    >
                      {isUpdatingIdentity ? 'جاري تحديث البيانات' : 'حفظ التعديلات في كل الأماكن'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ─── قسم المعلومات الإضافية عن المريض (حساسية/أمراض مزمنة/ملاحظات) ─── */}
            {(String(patientFile.additionalInfo || '').trim() || isAdditionalInfoEditorOpen) && (
              <>
                {/* فاصل أزرق مطابق لفاصل "سجل الزيارات" و"التكاليف المالية" */}
                <div className="flex items-center gap-3 px-1 pt-1">
                  <span className="flex items-center gap-1.5 bg-brand-50 border border-brand-200 rounded-full px-3 py-1 shrink-0 shadow-sm">
                    <svg className="w-4 h-4 text-brand-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="9" y1="13" x2="15" y2="13" />
                      <line x1="9" y1="17" x2="13" y2="17" />
                    </svg>
                    <span className="text-[11px] font-black text-brand-700 whitespace-nowrap">معلومات إضافية عن المريض</span>
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-l from-brand-100 to-slate-100" />
                </div>

                {/* رسائل النجاح/الفشل — تظهر فوق البطاقة */}
                {additionalInfoSuccess && (
                  <div className="rounded-lg border border-success-200 bg-success-50 px-3 py-2 text-[11px] font-black text-success-700">
                    {additionalInfoSuccess}
                  </div>
                )}
                {additionalInfoError && (
                  <div className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-[11px] font-black text-danger-700">
                    {additionalInfoError}
                  </div>
                )}

                {/* بطاقة عرض المعلومات — تظهر فقط لما يكون فيه معلومات محفوظة والمحرر مقفول */}
                {!isAdditionalInfoEditorOpen && String(patientFile.additionalInfo || '').trim() && (
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-brand-700">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="9" y1="13" x2="15" y2="13" />
                          <line x1="9" y1="17" x2="13" y2="17" />
                        </svg>
                        ملاحظات وتنبيهات المريض
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setAdditionalInfoError(null);
                            setAdditionalInfoSuccess(null);
                            setEditAdditionalInfo(String(patientFile.additionalInfo || '').trim());
                            setIsAdditionalInfoEditorOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-brand-600 hover:bg-brand-700 text-white px-2.5 py-1 text-[11px] font-black transition-colors"
                        >
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          تعديل
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteAdditionalInfo}
                          disabled={isSavingAdditionalInfo}
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-black text-white transition-colors ${isSavingAdditionalInfo ? 'bg-slate-400 cursor-not-allowed' : 'bg-danger-600 hover:bg-danger-700'}`}
                        >
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a2 2 0 012-2h2a2 2 0 012 2v2" />
                          </svg>
                          حذف
                        </button>
                      </div>
                    </div>
                    <div className="px-4 py-3 text-sm font-semibold text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {String(patientFile.additionalInfo || '').trim()}
                    </div>
                  </div>
                )}

                {/* بطاقة التحرير — تظهر عند الإضافة أو التعديل */}
                {isAdditionalInfoEditorOpen && (
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-black text-brand-700">
                        {String(patientFile.additionalInfo || '').trim() ? 'تعديل المعلومات الإضافية' : 'إضافة معلومات إضافية جديدة'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAdditionalInfoEditorOpen(false);
                          setAdditionalInfoError(null);
                        }}
                        className="inline-flex items-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 px-2.5 py-1 text-[11px] font-black transition-colors"
                      >
                        إلغاء
                      </button>
                    </div>
                    <div className="px-4 py-3 space-y-2">
                      <label className="block text-[11px] font-black text-slate-600">
                        اكتب أي معلومات مهمة عن المريض (مثال: الحساسية، أمراض مزمنة، ملاحظات)
                      </label>
                      <textarea
                        value={editAdditionalInfo}
                        onChange={(event) => setEditAdditionalInfo(event.target.value)}
                        rows={4}
                        placeholder="مثال: حساسية من البنسلين، مريض ضغط..."
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 leading-relaxed focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none resize-y"
                      />
                      <div className="flex flex-wrap justify-end gap-2 pt-1">
                        {String(patientFile.additionalInfo || '').trim() && (
                          <button
                            type="button"
                            onClick={handleDeleteAdditionalInfo}
                            disabled={isSavingAdditionalInfo}
                            className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-black text-white transition-colors ${isSavingAdditionalInfo ? 'bg-slate-400 cursor-not-allowed' : 'bg-danger-600 hover:bg-danger-700'}`}
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                            </svg>
                            حذف المعلومات
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleSubmitAdditionalInfo}
                          disabled={isSavingAdditionalInfo}
                          className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-black text-white transition-colors ${isSavingAdditionalInfo ? 'bg-slate-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700'}`}
                        >
                          {isSavingAdditionalInfo ? 'جاري الحفظ' : 'حفظ'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* قسم التقرير الطبي */}
            <div className="dh-day-shell rounded-2xl border overflow-hidden">
              <div className="dh-day-head px-4 py-3">
                {/* العنوان + الوصف فوق، الأزرار تحت على الموبايل، يمين على الشاشات الأكبر */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-black text-white">طباعة تقرير طبي للحالة</div>
                    <div className="text-[11px] font-medium text-brand-100 mt-0.5">
                      {isReportSettingsOpen ? 'اختر لغة التقرير وحجم الورق وحجم الخط ثم احفظ أو اطبع' : 'اضغط على الإعدادات لتخصيص التقرير'}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:shrink-0 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setIsReportSettingsOpen(v => !v)}
                      className="flex-1 sm:flex-none sm:shrink-0 rounded-xl border border-white/40 bg-white/15 px-3 py-2 text-xs font-black text-white transition-colors hover:bg-white/25"
                    >
                      {isReportSettingsOpen ? 'طي' : 'الإعدادات'}
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateMedicalReport}
                      disabled={isGeneratingReport}
                      className={`flex-1 sm:flex-none sm:shrink-0 rounded-xl px-4 py-2 text-xs font-black transition-all inline-flex items-center justify-center gap-2 ${isGeneratingReport ? 'bg-success-500/50 text-white/70 cursor-not-allowed' : 'bg-gradient-to-r from-success-500 to-success-600 text-white shadow-sm hover:from-success-600 hover:to-success-700 hover:shadow-md active:scale-[0.98]'}`}
                    >
                      {isGeneratingReport ? (
                        <>
                          <svg className="w-3.5 h-3.5 animate-spin shrink-0" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span>جاري التوليد</span>
                        </>
                      ) : 'طباعة التقرير'}
                    </button>
                  </div>
                </div>
              </div>
              {isReportSettingsOpen && (
                <div className="bg-white px-3 py-3">
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    <label className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                      <div className="mb-1 text-[11px] font-black text-slate-500">لغة التقرير</div>
                      <select
                        value={reportLanguage}
                        onChange={(event) => setReportLanguage(event.target.value as ClinicalReportLanguage)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm font-black text-slate-700 focus:border-brand-500 focus:outline-none"
                      >
                        <option value="ar">العربية</option>
                        <option value="en">English</option>
                      </select>
                    </label>
                    <label className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                      <div className="mb-1 text-[11px] font-black text-slate-500">حجم الورق</div>
                      <select
                        value={reportPageSize}
                        onChange={(event) => setReportPageSize(event.target.value as ClinicalReportPageSize)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm font-black text-slate-700 focus:border-brand-500 focus:outline-none"
                      >
                        <option value="A4">A4</option>
                        <option value="A5">A5</option>
                      </select>
                    </label>
                    <label className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                      <div className="mb-1 text-[11px] font-black text-slate-500">حجم الخط (10 - 22)</div>
                      <input
                        type="number"
                        min={10}
                        max={22}
                        value={reportFontSize}
                        onChange={(event) => setReportFontSize(event.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm font-black text-slate-700 focus:border-brand-500 focus:outline-none"
                      />
                    </label>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[11px] font-bold text-slate-500">
                      {reportSettingsSaved ? (
                        <span className="inline-flex items-center gap-1 text-success-700">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          تم حفظ الإعدادات
                        </span>
                      ) : (
                        'الإعدادات دي هتتحفظ سحابياً عشان تظهر في أي جهاز تفتحه'
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveReportSettings}
                      className="rounded-lg bg-brand-600 hover:bg-brand-700 text-white px-3 py-2 text-xs font-black transition-colors"
                    >
                      حفظ الإعدادات
                    </button>
                  </div>
                  {reportError && (
                    <div className="mt-2 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-[11px] font-black text-danger-700">
                      {reportError}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ─── فاصل: التكاليف المالية ─────────────────────────────── */}
            <div className="flex items-center gap-3 px-1 pt-1">
              <span className="flex items-center gap-1.5 bg-success-50 border border-success-200 rounded-full px-3 py-1 shrink-0 shadow-sm">
                <svg className="w-4 h-4 text-success-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                  <line x1="7" y1="15" x2="7.01" y2="15" strokeWidth="3" />
                  <line x1="11" y1="15" x2="13" y2="15" />
                </svg>
                <span className="text-[11px] font-black text-success-700 whitespace-nowrap">التكاليف المالية</span>
              </span>
              <div className="flex-1 h-px bg-gradient-to-l from-success-100 to-slate-100" />
            </div>

            <PatientFileCostsSection patientFile={patientFile} userId={user?.uid} branchId={branchId} />

            {/* ─── فاصل: الفواتير ──────────────────────────────────────── */}
            <div className="flex items-center gap-3 px-1 pt-1">
              <span className="flex items-center gap-1.5 bg-warning-50 border border-warning-200 rounded-full px-3 py-1 shrink-0 shadow-sm">
                <svg className="w-4 h-4 text-warning-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="9" y1="13" x2="15" y2="13" />
                  <line x1="9" y1="17" x2="13" y2="17" />
                </svg>
                <span className="text-[11px] font-black text-warning-700 whitespace-nowrap">الفواتير</span>
              </span>
              <div className="flex-1 h-px bg-gradient-to-l from-warning-100 to-slate-100" />
            </div>

            {/* قسم إصدار وطباعة فواتير المريض */}
            <PatientFileInvoiceSection patientFile={patientFile} activeBranchId={branchId} />

            {/* ─── فاصل: سجل الزيارات ─────────────────────────────────── */}
            <div className="flex items-center gap-3 px-1 pt-1">
              <span className="flex items-center gap-1.5 bg-brand-50 border border-brand-200 rounded-full px-3 py-1 shrink-0 shadow-sm">
                <svg className="w-4 h-4 text-brand-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                  <line x1="9" y1="12" x2="15" y2="12" />
                  <line x1="9" y1="16" x2="13" y2="16" />
                </svg>
                <span className="text-[11px] font-black text-brand-700 whitespace-nowrap">سجل الزيارات</span>
              </span>
              <div className="flex-1 h-px bg-gradient-to-l from-brand-100 to-slate-100" />
            </div>

            {/* قائمة الزيارات — مرتبة من الأحدث للأقدم */}
            <PatientFileVisitsList
              visits={sortedVisits}
              onEditExamVisit={onEditExamVisit}
              onEditConsultationVisit={onEditConsultationVisit}
            />
          </div>
        </div>
      </div>
    </div>,
    modalPortalTarget
  );
};
