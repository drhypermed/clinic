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
import { PatientFileVisitsList } from './PatientFileVisitsList';

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
  const [reportLanguage, setReportLanguage] = useState<ClinicalReportLanguage>('ar');
  const [reportPageSize, setReportPageSize] = useState<ClinicalReportPageSize>('A4');
  const [reportFontSize, setReportFontSize] = useState('13');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [isReportSettingsOpen, setIsReportSettingsOpen] = useState(false);

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
    setReportLanguage('ar');
    setReportPageSize('A4');
    setReportFontSize('13');
    setReportError(null);
    setIsGeneratingReport(false);
    setIsReportSettingsOpen(false);
  }, [latestVisitRecord, patientFile]);

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
                        <span className="inline-flex items-center bg-white/15 border border-white/25 text-blue-100 rounded-full px-2.5 py-0.5 text-[11px] font-bold">
                          آخر زيارة: {formatPatientFileDateLabel(patientFile.latestVisitDate)}
                        </span>
                      )}
                    </div>
                    {/* السطر الثالث: الهاتف + أيقونات التواصل */}
                    {patientFile.phones.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm font-medium text-blue-100 block">{patientFile.phones.join(' | ')}</span>
                        <div className="mt-1.5">
                          <PatientContactActions phone={patientFile.phones[0]} compact />
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="shrink-0 rounded-xl border border-red-400/60 bg-gradient-to-br from-red-600 to-rose-500 px-3 py-2 text-xs font-black text-white shadow-sm transition-opacity hover:opacity-90"
                  >
                    إغلاق
                  </button>
                </div>
                {/* السطر الرابع: زر تعديل بيانات المريض */}
                <div className="mt-3 pt-3 border-t border-white/20">
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
                </div>
              </div>
            </header>

            {/* قسم تعديل بيانات المريض — يظهر عند الضغط على الزر في الهيدر */}
            {isIdentityEditorOpen && (
              <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
                {identityUpdateSuccess && (
                  <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-black text-emerald-700">
                    {identityUpdateSuccess}
                  </div>
                )}
                {identityUpdateError && (
                  <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-black text-rose-700">
                    {identityUpdateError}
                  </div>
                )}
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-black text-slate-600">الاسم</label>
                    <input
                      value={editPatientName}
                      onChange={(event) => setEditPatientName(event.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 focus:border-indigo-500 focus:outline-none"
                      placeholder="اسم المريض"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-black text-slate-600">رقم التليفون</label>
                    <input
                      value={editPhone}
                      onChange={(event) => setEditPhone(event.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 focus:border-indigo-500 focus:outline-none"
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
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 focus:border-indigo-500 focus:outline-none"
                        placeholder="سنوات"
                      />
                      <input
                        type="number"
                        value={editAgeMonths}
                        onChange={(event) => setEditAgeMonths(event.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 focus:border-indigo-500 focus:outline-none"
                        placeholder="شهور"
                      />
                      <input
                        type="number"
                        value={editAgeDays}
                        onChange={(event) => setEditAgeDays(event.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 focus:border-indigo-500 focus:outline-none"
                        placeholder="أيام"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSubmitIdentityUpdate}
                      disabled={isUpdatingIdentity}
                      className={`rounded-lg px-3 py-2 text-xs font-black text-white ${isUpdatingIdentity ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                      {isUpdatingIdentity ? 'جاري تحديث البيانات' : 'حفظ التعديلات في كل الأماكن'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* قسم التقرير الطبي */}
            <div className="dh-day-shell rounded-2xl border overflow-hidden">
              <div className="dh-day-head px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-black text-white">طباعة تقرير طبي للحالة</div>
                    <div className="text-[11px] font-medium text-blue-100 mt-0.5">
                      {isReportSettingsOpen ? 'اختر لغة التقرير وحجم الورق وحجم الخط ثم اطبع' : 'اضغط على الإعدادات لتخصيص التقرير'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsReportSettingsOpen(v => !v)}
                      className="shrink-0 rounded-xl border border-white/40 bg-white/15 px-3 py-2 text-xs font-black text-white transition-colors hover:bg-white/25"
                    >
                      {isReportSettingsOpen ? 'طي' : 'الإعدادات'}
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateMedicalReport}
                      disabled={isGeneratingReport}
                      className={`shrink-0 rounded-xl px-4 py-2 text-xs font-black transition-all ${isGeneratingReport ? 'bg-emerald-500/50 text-white/70 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm hover:from-emerald-600 hover:to-emerald-700 hover:shadow-md active:scale-[0.98]'}`}
                    >
                      {isGeneratingReport ? (
                        <span className="inline-flex items-center gap-2">
                          <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          جاري التوليد
                        </span>
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
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm font-black text-slate-700 focus:border-indigo-500 focus:outline-none"
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
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm font-black text-slate-700 focus:border-indigo-500 focus:outline-none"
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
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm font-black text-slate-700 focus:border-indigo-500 focus:outline-none"
                      />
                    </label>
                  </div>
                  {reportError && (
                    <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-black text-rose-700">
                      {reportError}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ─── فاصل: التكاليف المالية ─────────────────────────────── */}
            <div className="flex items-center gap-3 px-1 pt-1">
              <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 shrink-0 shadow-sm">
                <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                  <line x1="7" y1="15" x2="7.01" y2="15" strokeWidth="3" />
                  <line x1="11" y1="15" x2="13" y2="15" />
                </svg>
                <span className="text-[11px] font-black text-emerald-700 whitespace-nowrap">التكاليف المالية</span>
              </span>
              <div className="flex-1 h-px bg-gradient-to-l from-emerald-100 to-slate-100" />
            </div>

            <PatientFileCostsSection patientFile={patientFile} userId={user?.uid} branchId={branchId} />

            {/* ─── فاصل: سجل الزيارات ─────────────────────────────────── */}
            <div className="flex items-center gap-3 px-1 pt-1">
              <span className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 shrink-0 shadow-sm">
                <svg className="w-4 h-4 text-blue-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                  <line x1="9" y1="12" x2="15" y2="12" />
                  <line x1="9" y1="16" x2="13" y2="16" />
                </svg>
                <span className="text-[11px] font-black text-blue-700 whitespace-nowrap">سجل الزيارات</span>
              </span>
              <div className="flex-1 h-px bg-gradient-to-l from-blue-100 to-slate-100" />
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
