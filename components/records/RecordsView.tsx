/**
 * مكون عرض السجلات الطبية (Records View):
 * الأرشيف الرئيسي للعيادة — إحصائيات سريعة، بحث عميق، فلاتر تاريخ/ترتيب،
 * وإدارة حذف مركَّبة (كشف فقط / استشارة فقط / سجل كامل).
 *
 * بعد التقسيم:
 *   - `records-view/helpers.ts`                : مساعدات الخط الزمني + الأنواع.
 *   - `records-view/DeleteConfirmModals.tsx`   : نوافذ تأكيد الحذف الثلاث.
 *   - `records-view/PastRecordDatePickerModal.tsx` : اختيار تاريخ سجل فائت.
 *   - `records-view/useRecordsSearch.ts`       : البحث + اقتراحات autocomplete.
 *   - `records-view/useRecordsTimeline.ts`     : بناء الخط الزمني + الإحصائيات + التجميع.
 *   - `records-view/RecordsSearchFilters.tsx`  : صندوق البحث + الفلاتر.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PatientRecord } from '../../types';
import { DailyGroup, StatCard } from './recordsViewParts';
import { getCairoDayKey } from '../../utils/cairoTime';
import { PatientFileDetailsModal } from '../patient-files/PatientFileDetailsModal';
import {
  buildPatientFiles,
  resolvePatientFileKeyFromRecord,
  type PatientFileData,
} from '../patient-files/patientFilesShared';
import { useAuth } from '../../hooks/useAuth';
import { patientFilesService } from '../../services/patient-files';
import type {
  ClinicalReportLanguage,
  ClinicalReportPageSize,
} from '../reports/clinical-ai-report';
import {
  DeleteConfirmModals,
  type DeleteFullRecordState,
  type DeletePartialRecordState,
} from './records-view/DeleteConfirmModals';
import {
  PastRecordDatePickerModal,
  type PastRecordModalState,
  type PastRecordModalType,
} from './records-view/PastRecordDatePickerModal';
import type {
  TimelineDateFilterMode,
  TimelineSortOrder,
} from './records-view/helpers';
import { useRecordsSearch } from './records-view/useRecordsSearch';
import { useRecordsTimeline } from './records-view/useRecordsTimeline';
import { RecordsSearchFilters } from './records-view/RecordsSearchFilters';

interface RecordsViewProps {
  records: PatientRecord[];
  /** Pagination state — في legacy mode كلهم defaults معقولة. */
  recordsLoadingMore?: boolean;
  recordsHasMore?: boolean;
  recordsPagingEnabled?: boolean;
  onLoadMoreRecords?: () => Promise<void>;
  /** بحث على السيرفر (يستخدم في paginated mode عشان البحث يتعدّى الـ50). */
  onSearchRecordsOnServer?: (term: string) => Promise<number>;
  /** جلب سجلات نطاق تاريخ من السيرفر (لفلتر التاريخ في paginated mode). */
  onFetchRecordsByDateRange?: (startMs: number, endMs: number) => Promise<number>;
  onLoadRecord: (record: PatientRecord) => void;
  onOpenConsultation: (record: PatientRecord) => void;
  onLoadConsultation: (record: PatientRecord) => void;
  onNewExam: (record: PatientRecord) => void;
  onGeneratePatientMedicalReport: (payload: {
    patientFile: PatientFileData;
    language: ClinicalReportLanguage;
    pageSize: ClinicalReportPageSize;
    fontSize: number;
  }) => Promise<void>;
  onDeleteRecord: (id: string) => void;
  onDeleteConsultation: (record: PatientRecord) => void;
  onDeleteExam: (record: PatientRecord) => void;
  onAddPastExam: (date: string) => void;
  onAddPastConsultation: (date: string) => void;
  onClose: () => void;
  branchId?: string;
}

export const RecordsView: React.FC<RecordsViewProps> = ({
  records,
  recordsLoadingMore = false,
  recordsHasMore = false,
  recordsPagingEnabled = false,
  onLoadMoreRecords,
  onSearchRecordsOnServer,
  onFetchRecordsByDateRange,
  onLoadRecord,
  onOpenConsultation,
  onLoadConsultation,
  onNewExam,
  onGeneratePatientMedicalReport,
  onDeleteRecord,
  onDeleteConsultation,
  onDeleteExam,
  onAddPastExam,
  onAddPastConsultation,
  onClose: _onClose,
  branchId,
}) => {
  void _onClose;
  const { user } = useAuth();
  const userId = user?.uid || '';

  // ─── حالات الواجهة الأساسية ──────────────────────────────────────────
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [deleteFullRecord, setDeleteFullRecord] = useState<DeleteFullRecordState>({
    isOpen: false,
    recordId: null,
  });
  const [deleteExamState, setDeleteExamState] = useState<DeletePartialRecordState>({
    isOpen: false,
    record: null,
  });
  const [deleteConsultationState, setDeleteConsultationState] =
    useState<DeletePartialRecordState>({ isOpen: false, record: null });

  const now = new Date();
  const todayStr = getCairoDayKey(now);
  const firstDayOfMonthStr = `${todayStr.slice(0, 7)}-01`;


  // ─── حالات الفلاتر (ترتيب + تاريخ) ───────────────────────────────────
  const [timelineSortOrder, setTimelineSortOrder] =
    useState<TimelineSortOrder>('newestToOldest');
  const [dateFilterMode, setDateFilterMode] = useState<TimelineDateFilterMode>('all');
  const [singleDayFilterDate, setSingleDayFilterDate] = useState(todayStr);
  const [rangeStartDate, setRangeStartDate] = useState(firstDayOfMonthStr);
  const [rangeEndDate, setRangeEndDate] = useState(todayStr);
  const [selectedPatientFileKey, setSelectedPatientFileKey] = useState<string | null>(null);

  // حالة نافذة اختيار تاريخ السجلات الفائتة
  const [dateModal, setDateModal] = useState<PastRecordModalState>({
    isOpen: false,
    type: null,
    selectedDate: todayStr,
    selectedTime: '',
  });

  // ─── البحث + الاقتراحات (hook) ──────────────────────────────────────
  const { searchTerm, setSearchTerm, filtered, suggestions } = useRecordsSearch(records);

  // ─── بحث سيرفر-سايد في paginated mode ──────────────────────────────
  // الـsearchTerm لو طول 2+ حرف، نسأل السيرفر (debounced 350ms). النتايج
  // بتُدمج في records فيقدر الـlocal search يلاقيها. legacy mode = no-op
  // (records محملة كاملة بالفعل).
  useEffect(() => {
    if (!recordsPagingEnabled || !onSearchRecordsOnServer) return;
    const term = searchTerm.trim();
    if (term.length < 2) return;
    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (cancelled) return;
      void onSearchRecordsOnServer(term);
    }, 350);
    return () => { cancelled = true; window.clearTimeout(timeoutId); };
  }, [recordsPagingEnabled, onSearchRecordsOnServer, searchTerm]);

  // ─── جلب سجلات نطاق التاريخ في paginated mode ───────────────────────
  // لما المستخدم يفعّل فلتر تاريخ (يوم محدد أو نطاق)، نجيب السجلات اللي
  // فيها من السيرفر. legacy mode = no-op.
  const filterStartDate = dateFilterMode === 'singleDay' ? singleDayFilterDate
    : (dateFilterMode === 'dateRange' ? rangeStartDate : '');
  const filterEndDate = dateFilterMode === 'singleDay' ? singleDayFilterDate
    : (dateFilterMode === 'dateRange' ? rangeEndDate : '');
  useEffect(() => {
    if (!recordsPagingEnabled || !onFetchRecordsByDateRange) return;
    if (!filterStartDate || !filterEndDate) return;
    const startMs = new Date(`${filterStartDate}T00:00:00`).getTime();
    const endMs = new Date(`${filterEndDate}T23:59:59.999`).getTime();
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return;
    void onFetchRecordsByDateRange(startMs, endMs);
  }, [recordsPagingEnabled, onFetchRecordsByDateRange, filterStartDate, filterEndDate]);

  // ─── الخط الزمني + الإحصائيات + التجميع (hook) ──────────────────────
  const { normalizedRange, stats, grouped } = useRecordsTimeline({
    records,
    filtered,
    timelineSortOrder,
    dateFilterMode,
    singleDayFilterDate,
    rangeStartDate,
    rangeEndDate,
    todayStr,
    firstDayOfMonthStr,
  });

  // ─── ملفات المرضى (للنافذة المنبثقة) ────────────────────────────────
  const patientFiles = useMemo(() => buildPatientFiles(records), [records]);
  const patientFilesByKey = useMemo(
    () => new Map(patientFiles.map((file) => [file.key, file])),
    [patientFiles],
  );
  const selectedPatientFile = useMemo(() => {
    if (!selectedPatientFileKey) return null;
    return patientFilesByKey.get(selectedPatientFileKey) || null;
  }, [patientFilesByKey, selectedPatientFileKey]);

  // إذا اختفى الملف المختار من القائمة، أغلق نافذته
  useEffect(() => {
    if (!selectedPatientFileKey) return;
    if (!patientFilesByKey.has(selectedPatientFileKey)) {
      setSelectedPatientFileKey(null);
    }
  }, [patientFilesByKey, selectedPatientFileKey]);

  const handleOpenPatientFileFromRecord = (record: PatientRecord) => {
    const key = resolvePatientFileKeyFromRecord(record);
    if (!key) return;
    setSelectedPatientFileKey(key);
  };

  // مزامنة هوية المريض (اسم/هاتف/عمر) — تُستخدم من نافذة تفاصيل الملف
  const handleUpdatePatientIdentity = async (payload: {
    patientFileId?: string;
    patientFileNumber?: number;
    patientFileNameKey?: string;
    patientName: string;
    phone?: string;
    ageYears?: string;
    ageMonths?: string;
    ageDays?: string;
  }) => {
    if (!userId) {
      throw new Error('يجب تسجيل الدخول أولاً.');
    }
    return patientFilesService.syncPatientIdentityByFile({
      userId,
      patientFileId: payload.patientFileId,
      patientFileNumber: payload.patientFileNumber,
      patientFileNameKey: payload.patientFileNameKey,
      patientName: payload.patientName,
      phone: payload.phone,
      age: {
        years: payload.ageYears,
        months: payload.ageMonths,
        days: payload.ageDays,
      },
    });
  };

  // حفظ معلومات إضافية عن المريض (حساسية/أمراض مزمنة/ملاحظات) — تُستخدم من نافذة تفاصيل الملف
  const handleSaveAdditionalInfo = async (payload: {
    patientFileId?: string;
    patientFileNumber?: number;
    patientFileNameKey?: string;
    patientName: string;
    phone?: string;
    additionalInfo: string;
  }) => {
    if (!userId) {
      throw new Error('يجب تسجيل الدخول أولاً.');
    }
    return patientFilesService.savePatientAdditionalInfo({
      userId,
      patientFileId: payload.patientFileId,
      patientFileNumber: payload.patientFileNumber,
      patientFileNameKey: payload.patientFileNameKey,
      patientName: payload.patientName,
      phone: payload.phone,
      additionalInfo: payload.additionalInfo,
    });
  };

  const handleConfirmPastRecordDate = (type: PastRecordModalType, datetime: string) => {
    if (type === 'exam') {
      onAddPastExam(datetime);
    } else {
      onAddPastConsultation(datetime);
    }
  };

  // نافذة إعادة ضبط الفلاتر
  const handleResetFilters = () => {
    setTimelineSortOrder('newestToOldest');
    setDateFilterMode('all');
    setSingleDayFilterDate(todayStr);
    setRangeStartDate(firstDayOfMonthStr);
    setRangeEndDate(todayStr);
  };

  // ─── إدارة زر "تحميل المزيد" ──────────────────────────────────────
  // ضغطة واحدة = دفعة واحدة من السيرفر (50 سجل ≈ ثانية)، وبعدها نعمل scroll
  // لأول يوم جديد عشان المستخدم يحس إن في حاجة حصلت. لو عايز أكتر يدوس تاني.
  const handleLoadMoreClick = useCallback(() => {
    if (!onLoadMoreRecords) return;
    if (recordsLoadingMore) return;
    // نخزن عدد الأيام الحالي عشان بعد الجلب نعرف فين أول يوم جديد ظهر
    const baseGroupCount = grouped.length;
    void onLoadMoreRecords().then(() => {
      // requestAnimationFrame عشان نضمن إن الـDOM اتحدّث قبل ما نعمل scroll
      window.requestAnimationFrame(() => {
        // ملاحظة: grouped المغلَّف هنا قديم — بنستخدم getElementById اللي بياخد
        // أحدث DOM. لو ما اتضافش يوم جديد، الـscroll مش هيحصل (مفيش id جديد)
        const allDayElements = document.querySelectorAll('[id^="rv-day-"]');
        const firstNewElement = allDayElements[baseGroupCount];
        firstNewElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }, [onLoadMoreRecords, recordsLoadingMore, grouped.length]);

  return (
    <>
      {/* نوافذ التأكيد عند الحذف */}
      <DeleteConfirmModals
        deleteFullRecord={deleteFullRecord}
        setDeleteFullRecord={setDeleteFullRecord}
        deleteExam={deleteExamState}
        setDeleteExam={setDeleteExamState}
        deleteConsultation={deleteConsultationState}
        setDeleteConsultation={setDeleteConsultationState}
        onDeleteRecord={onDeleteRecord}
        onDeleteExam={onDeleteExam}
        onDeleteConsultation={onDeleteConsultation}
      />

      {/* نافذة اختيار التاريخ للسجلات الفائتة */}
      <PastRecordDatePickerModal
        state={dateModal}
        onStateChange={setDateModal}
        todayStr={todayStr}
        onConfirm={handleConfirmPastRecordDate}
      />

      <div data-no-reveal className="px-3 py-3 sm:px-5 sm:py-4 space-y-3" dir="rtl">
        {/* بطاقات الإحصائيات السريعة */}
        <div className="grid grid-cols-6 sm:grid-cols-5 gap-2 dh-stagger-1">
          <StatCard
            className="col-span-3 sm:col-span-1"
            label="كشوفات اليوم"
            value={stats.examsToday}
            tone="blue"
          />
          <StatCard
            className="col-span-3 sm:col-span-1"
            label="استشارات اليوم"
            value={stats.consultationsToday}
            tone="purple"
          />
          <StatCard
            className="col-span-2 sm:col-span-1"
            label="كشوفات الشهر"
            value={stats.examsThisMonth}
            tone="emerald"
          />
          <StatCard
            className="col-span-2 sm:col-span-1"
            label="استشارات الشهر"
            value={stats.consultationsThisMonth}
            tone="emerald"
          />
          <StatCard
            className="col-span-2 sm:col-span-1"
            label="إجمالي الشهر"
            value={stats.totalThisMonth}
            tone="indigo"
          />
        </div>

        {/* أزرار إضافة سجلات فائتة يدوياً */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm p-3 dh-stagger-2">
          <p className="text-xs font-bold text-slate-400 mb-2">إضافة سجل فائت</p>
          <div className="flex flex-row gap-2">
            <button
              onClick={() => {
                // selectedTime فاضي عمداً — كنا بنبعت الوقت الحالي وكان بيتلصق
                // مع التاريخ في خانة الـ date (شكل غريب). saveRecord بيحط 12:00:00
                // افتراضياً للسجلات الفائتة، فالوقت الحقيقي مش لازم يتحدد هنا.
                setDateModal({ isOpen: true, type: 'exam', selectedDate: todayStr, selectedTime: '' });
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 text-white font-black text-xs shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
            >
              <svg
                className="w-3.5 h-3.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              إضافة كشف فائت
            </button>
            <button
              onClick={() => {
                // نفس سبب زر الكشف الفائت فوق — selectedTime فاضي عشان خانة
                // التاريخ ما تظهرش الوقت ملصوق فيها. الحفظ بيحط الظهر افتراضياً.
                setDateModal({
                  isOpen: true,
                  type: 'consultation',
                  selectedDate: todayStr,
                  selectedTime: '',
                });
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl bg-gradient-to-r from-success-500 to-success-600 text-white font-black text-xs shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
            >
              <svg
                className="w-3.5 h-3.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              إضافة استشارة فائتة
            </button>
          </div>
        </div>

        {/* صندوق البحث + فلاتر التاريخ والترتيب */}
        <RecordsSearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          suggestions={suggestions}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
          activeSuggestionIndex={activeSuggestionIndex}
          setActiveSuggestionIndex={setActiveSuggestionIndex}
          timelineSortOrder={timelineSortOrder}
          setTimelineSortOrder={setTimelineSortOrder}
          dateFilterMode={dateFilterMode}
          setDateFilterMode={setDateFilterMode}
          singleDayFilterDate={singleDayFilterDate}
          setSingleDayFilterDate={setSingleDayFilterDate}
          rangeStartDate={rangeStartDate}
          setRangeStartDate={setRangeStartDate}
          rangeEndDate={rangeEndDate}
          setRangeEndDate={setRangeEndDate}
          onResetFilters={handleResetFilters}
        />

        {/* عرض السجلات المجمعة */}
        {grouped.length === 0 ? (
          <div className="bg-white/80 rounded-2xl border border-slate-100 py-16 text-center shadow-sm">
            <svg
              className="w-12 h-12 text-slate-200 mx-auto mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-slate-400 font-semibold text-sm">لا توجد سجلات مطابقة</p>
          </div>
        ) : (
          <div className="space-y-3 dh-stagger-4">
            {grouped.map(([dateKey, dayEntries]) => (
              // الـid على div خارجي عشان نعمل scrollIntoView بعد تحميل المزيد
              <div key={dateKey} id={`rv-day-${dateKey}`}>
                <DailyGroup
                  dateKey={dateKey}
                  entries={dayEntries}
                  term={searchTerm}
                  onLoadRecord={onLoadRecord}
                  onOpenPatientFile={handleOpenPatientFileFromRecord}
                  onOpenConsultation={onOpenConsultation}
                  onLoadConsultation={onLoadConsultation}
                  onNewExam={onNewExam}
                  onDelete={(id) => setDeleteFullRecord({ isOpen: true, recordId: id })}
                  onDeleteExam={(record) => setDeleteExamState({ isOpen: true, record })}
                  onDeleteConsultation={(record) =>
                    setDeleteConsultationState({ isOpen: true, record })
                  }
                  openByDefault={false}
                />
              </div>
            ))}

            {/* زر واحد بسيط: ضغطة = دفعة واحدة (50 سجل) + scroll تلقائي
                لأول يوم جديد ظهر. لو عايز أكتر، اضغط تاني. */}
            {recordsPagingEnabled && recordsHasMore && onLoadMoreRecords && (
              <button
                type="button"
                onClick={handleLoadMoreClick}
                disabled={recordsLoadingMore}
                className="w-full py-3.5 bg-white/80 border border-slate-100 rounded-2xl font-bold text-slate-600 text-sm shadow-sm hover:shadow-md hover:bg-white transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {recordsLoadingMore ? 'جاري التحميل...' : 'تحميل المزيد'}
              </button>
            )}
          </div>
        )}
      </div>

      <PatientFileDetailsModal
        patientFile={selectedPatientFile}
        onClose={() => setSelectedPatientFileKey(null)}
        onEditExamVisit={(record) => {
          setSelectedPatientFileKey(null);
          onLoadRecord(record);
        }}
        onEditConsultationVisit={(record) => {
          setSelectedPatientFileKey(null);
          onLoadConsultation(record);
        }}
        onGeneratePatientMedicalReport={onGeneratePatientMedicalReport}
        onUpdatePatientIdentity={handleUpdatePatientIdentity}
        onSaveAdditionalInfo={handleSaveAdditionalInfo}
        branchId={branchId}
      />
    </>
  );
};
