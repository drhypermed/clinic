import React, { useEffect, useMemo, useRef, useState } from 'react';
import { collection } from 'firebase/firestore';
import { getDocsCacheFirst } from '../../services/firestore/cacheFirst';
import type { PatientRecord } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../services/firebaseConfig';
import { normalizePatientNameForFile, patientFilesService } from '../../services/patient-files';
import type { ClinicalReportLanguage, ClinicalReportPageSize } from '../reports/clinical-ai-report';
import {
  PATIENT_FILE_DOC_PREFIX,
  buildPatientFiles,
  compareByFileNumberNewestToOldest,
  compareByFileNumberOldestToNewest,
  decodePatientFileNameKeyFromDocId,
  isPositiveFileNumber,
  type PatientFileData,
  uniqueTrimmed,
} from './patientFilesShared';
import { PatientFileDetailsModal } from './PatientFileDetailsModal';
import { PatientContactActions } from '../common/PatientContactActions';
import { StatCard } from '../records/recordsViewParts';

interface PatientFilesPageProps {
  records: PatientRecord[];
  onLoadRecord: (record: PatientRecord) => void;
  onLoadConsultation: (record: PatientRecord) => void;
  onGeneratePatientMedicalReport: (payload: {
    patientFile: PatientFileData;
    language: ClinicalReportLanguage;
    pageSize: ClinicalReportPageSize;
    fontSize: number;
  }) => Promise<void>;
  /** الفرع النشط — يمرر لـ PatientFileDetailsModal */
  branchId?: string;
}

type PatientFilesSortOption =
  | 'mostVisits'
  | 'alphabetical'
  | 'fileNumberOldestToNewest'
  | 'fileNumberNewestToOldest';

const PATIENT_FILES_PAGE_SIZE = 10;

export const PatientFilesPage: React.FC<PatientFilesPageProps> = ({
  records,
  onLoadRecord,
  onLoadConsultation,
  onGeneratePatientMedicalReport,
  branchId,
}) => {
  const { user } = useAuth();
  const userId = user?.uid || '';
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<PatientFilesSortOption>('fileNumberNewestToOldest');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(PATIENT_FILES_PAGE_SIZE);
  const [settingsPhonesByNameKey, setSettingsPhonesByNameKey] = useState<Record<string, string[]>>({});
  const [appointmentPhonesByNameKey, setAppointmentPhonesByNameKey] = useState<Record<string, string[]>>({});
  const seniorityIndexRunRef = useRef<{ userId: string; recordCount: number } | null>(null);

  const patientFiles = useMemo(() => buildPatientFiles(records), [records]);

  useEffect(() => {
    if (!userId || records.length === 0) {
      seniorityIndexRunRef.current = null;
      return;
    }

    const previousRun = seniorityIndexRunRef.current;
    if (
      previousRun
      && previousRun.userId === userId
      && previousRun.recordCount >= records.length
    ) {
      return;
    }

    seniorityIndexRunRef.current = {
      userId,
      recordCount: records.length,
    };

    patientFilesService
      .ensurePatientFilesSeniorityIndex(userId, records)
      .catch((error) => {
        console.error('Error ensuring patient files seniority index from patient files page:', error);
      });
  }, [records, userId]);

  useEffect(() => {
    if (!userId) {
      setSettingsPhonesByNameKey({});
      return;
    }

    let cancelled = false;

    const loadPatientFilePhones = async () => {
      try {
        const settingsSnap = await getDocsCacheFirst(collection(db, 'users', userId, 'settings'));
        if (cancelled) return;

        const nextPhonesByNameKey: Record<string, string[]> = {};
        settingsSnap.docs.forEach((snap) => {
          if (!snap.id.startsWith(PATIENT_FILE_DOC_PREFIX)) return;

          const data = snap.data() as Record<string, unknown>;
          const nameKey = String(data.patientFileNameKey || '').trim() || decodePatientFileNameKeyFromDocId(snap.id);
          if (!nameKey) return;

          const phoneCandidates = uniqueTrimmed([
            String(data.phone || '').trim(),
            String(data.phoneNumber || '').trim(),
            String(data.mobile || '').trim(),
            String(data.whatsapp || '').trim(),
          ]);

          if (phoneCandidates.length === 0) return;
          nextPhonesByNameKey[nameKey] = uniqueTrimmed([
            ...(nextPhonesByNameKey[nameKey] || []),
            ...phoneCandidates,
          ]);
        });

        setSettingsPhonesByNameKey(nextPhonesByNameKey);
      } catch (error) {
        console.error('Error loading patient file phones from settings:', error);
      }
    };

    void loadPatientFilePhones();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setAppointmentPhonesByNameKey({});
      return;
    }

    let cancelled = false;

    const loadAppointmentPhones = async () => {
      try {
        const appointmentsSnap = await getDocsCacheFirst(collection(db, 'users', userId, 'appointments'));
        if (cancelled) return;

        const nextPhonesByNameKey: Record<string, string[]> = {};
        appointmentsSnap.docs.forEach((snap) => {
          const data = snap.data() as Record<string, unknown>;
          const nameKey = normalizePatientNameForFile(String(data.patientName || '').trim());
          if (!nameKey) return;

          const phoneCandidates = uniqueTrimmed([
            String(data.phone || '').trim(),
            String(data.phoneNumber || '').trim(),
            String(data.patientPhone || '').trim(),
            String(data.mobile || '').trim(),
            String(data.whatsapp || '').trim(),
          ]);

          if (phoneCandidates.length === 0) return;
          nextPhonesByNameKey[nameKey] = uniqueTrimmed([
            ...(nextPhonesByNameKey[nameKey] || []),
            ...phoneCandidates,
          ]);
        });

        setAppointmentPhonesByNameKey(nextPhonesByNameKey);
      } catch (error) {
        console.error('Error loading patient phones from appointments:', error);
      }
    };

    void loadAppointmentPhones();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const patientFilesWithPhones = useMemo(() => {
    return patientFiles.map((file) => ({
      ...file,
      phones: uniqueTrimmed([
        ...file.phones,
        ...(settingsPhonesByNameKey[file.key] || []),
        ...(appointmentPhonesByNameKey[file.key] || []),
      ]),
    }));
  }, [patientFiles, settingsPhonesByNameKey, appointmentPhonesByNameKey]);

  const filteredPatientFiles = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return patientFilesWithPhones;

    return patientFilesWithPhones.filter((file) => {
      const fileNumberText = String(file.fileNumber || '');
      const phoneMatch = file.phones.some((phone) => phone.toLowerCase().includes(term));
      return (
        file.name.toLowerCase().includes(term)
        || fileNumberText.includes(term)
        || phoneMatch
      );
    });
  }, [patientFilesWithPhones, searchTerm]);

  const sortedPatientFiles = useMemo(() => {
    const next = [...filteredPatientFiles];

    if (sortOption === 'mostVisits') {
      return next.sort((left, right) => {
        const visitsDiff = right.visits.length - left.visits.length;
        if (visitsDiff !== 0) return visitsDiff;
        return compareByFileNumberOldestToNewest(left, right);
      });
    }

    if (sortOption === 'alphabetical') {
      return next.sort((left, right) => {
        const nameDiff = left.name.localeCompare(right.name, 'ar');
        if (nameDiff !== 0) return nameDiff;
        return compareByFileNumberOldestToNewest(left, right);
      });
    }

    if (sortOption === 'fileNumberNewestToOldest') {
      return next.sort(compareByFileNumberNewestToOldest);
    }

    return next.sort(compareByFileNumberOldestToNewest);
  }, [filteredPatientFiles, sortOption]);

  useEffect(() => {
    setVisibleCount(PATIENT_FILES_PAGE_SIZE);
  }, [searchTerm, sortOption]);

  useEffect(() => {
    if (!selectedKey) return;
    const exists = patientFilesWithPhones.some((item) => item.key === selectedKey);
    if (!exists) setSelectedKey(null);
  }, [patientFilesWithPhones, selectedKey]);

  const visiblePatientFiles = useMemo(
    () => sortedPatientFiles.slice(0, visibleCount),
    [sortedPatientFiles, visibleCount]
  );

  const canLoadMore = visibleCount < sortedPatientFiles.length;

  const handleLoadMoreClick = () => {
    setVisibleCount((prev) => prev + PATIENT_FILES_PAGE_SIZE);
  };

  const selectedPatientFile = useMemo(() => {
    if (!selectedKey) return null;
    return patientFilesWithPhones.find((item) => item.key === selectedKey) || null;
  }, [patientFilesWithPhones, selectedKey]);

  const globalStats = useMemo(() => {
    const totalPatients = patientFiles.length;
    const totalExams = patientFiles.reduce((sum, item) => sum + item.examCount, 0);
    const totalConsultations = patientFiles.reduce((sum, item) => sum + item.consultationCount, 0);
    return {
      totalPatients,
      totalExams,
      totalConsultations,
      totalVisits: totalExams + totalConsultations,
    };
  }, [patientFiles]);

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

  return (
    <div data-no-reveal className="px-3 pt-5 pb-3 sm:px-5 sm:pt-6 sm:pb-4 space-y-3" dir="rtl">

      {/* بطاقات الإحصائيات — مطابقة لأسلوب سجلات المرضى */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 dh-stagger-1">
        <StatCard label="عدد المرضى" value={globalStats.totalPatients} tone="emerald" />
        <StatCard label="إجمالي الكشوفات" value={globalStats.totalExams} tone="blue" />
        <StatCard label="إجمالي الاستشارات" value={globalStats.totalConsultations} tone="purple" />
        <StatCard label="إجمالي الزيارات" value={globalStats.totalVisits} tone="indigo" />
      </div>

      {/* صندوق البحث والترتيب */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm p-3 space-y-2.5 dh-stagger-2">
        <div className="relative">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="ابحث بالاسم أو رقم الملف أو الهاتف..."
            className="w-full bg-white border border-slate-200 rounded-xl pr-10 pl-4 py-3 font-medium text-slate-800 placeholder-slate-400 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">ترتيب الملفات</label>
            <select
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value as PatientFilesSortOption)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 outline-none"
            >
              <option value="fileNumberNewestToOldest">رقم الملف: من الأحدث للأقدم</option>
              <option value="fileNumberOldestToNewest">رقم الملف: من الأقدم للأحدث</option>
              <option value="mostVisits">الأكثر زيارة</option>
              <option value="alphabetical">الترتيب الأبجدي</option>
            </select>
          </div>
          <div className="flex items-end justify-end">
            <button
              type="button"
              onClick={() => { setSearchTerm(''); setSortOption('fileNumberNewestToOldest'); }}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              إعادة ضبط
            </button>
          </div>
        </div>
      </div>

      {/* قائمة ملفات المرضى */}
      {sortedPatientFiles.length === 0 ? (
        <div className="bg-white/80 rounded-2xl border border-slate-100 py-16 text-center shadow-sm">
          <svg className="w-12 h-12 text-slate-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-slate-400 font-semibold text-sm">لا توجد ملفات مطابقة</p>
        </div>
      ) : (
        <div className="space-y-3 dh-stagger-3">
          {visiblePatientFiles.map((file) => (
            /* كارت المريض — نفس أسلوب dh-day-shell/dh-day-head من سجلات المرضى */
            <div key={file.key} className="dh-day-shell rounded-2xl border overflow-hidden">
              <button
                type="button"
                onClick={() => setSelectedKey(file.key)}
                className="dh-day-head w-full p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-white hover:brightness-110 transition-colors text-right"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-black text-sm sm:text-base leading-tight flex items-center gap-1.5 flex-wrap">
                    <span className="truncate">{file.name || 'مريض بدون اسم'}</span>
                    <span className="shrink-0 text-[11px] font-bold bg-white/25 border border-white/40 rounded-full px-2 py-0.5">
                      {isPositiveFileNumber(file.fileNumber) ? `#${file.fileNumber}` : 'قيد التوليد'}
                    </span>
                  </div>
                  <div className="mt-1 text-[12px] font-medium text-blue-100">
                    <span className="truncate block">{file.phones.length > 0 ? file.phones.join(' | ') : 'لا يوجد هاتف مسجل'}</span>
                    {file.phones.length > 0 && (
                      <div className="mt-1">
                        <PatientContactActions phone={file.phones[0]} compact preventParentClick />
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-full sm:w-auto shrink-0 flex flex-wrap sm:flex-nowrap items-center justify-start sm:justify-end gap-1.5">
                  <span className="text-[11px] font-bold bg-white/20 text-white rounded-full px-2.5 py-1">
                    {file.visits.length} زيارة
                  </span>
                  <span className="text-[11px] font-bold bg-white/15 text-white rounded-full px-2.5 py-1">
                    {file.examCount} كشف
                  </span>
                  <span className="text-[11px] font-bold bg-white/15 text-white rounded-full px-2.5 py-1">
                    {file.consultationCount} استشارة
                  </span>
                  <span className="inline-flex items-center gap-1 bg-white/20 border border-white/30 text-white rounded-full px-2.5 py-1 text-[11px] font-black">
                    عرض
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </button>
            </div>
          ))}

          {/* زر تحميل المزيد */}
          {canLoadMore && (
            <button
              type="button"
              onClick={handleLoadMoreClick}
              className="w-full py-3.5 bg-white/80 border border-slate-100 rounded-2xl font-bold text-slate-600 text-sm shadow-sm hover:shadow-md hover:bg-white transition-all active:scale-[0.99]"
            >
              تحميل المزيد من الملفات
            </button>
          )}

          {/* مؤشر العدد */}
          {sortedPatientFiles.length > 0 && (
            <p className="text-center text-[11px] font-semibold text-slate-400">
              المعروض {Math.min(visibleCount, sortedPatientFiles.length)} من {sortedPatientFiles.length} ملف
            </p>
          )}
        </div>
      )}

      <PatientFileDetailsModal
        patientFile={selectedPatientFile}
        onClose={() => setSelectedKey(null)}
        onEditExamVisit={(record) => {
          setSelectedKey(null);
          onLoadRecord(record);
        }}
        onEditConsultationVisit={(record) => {
          setSelectedKey(null);
          onLoadConsultation(record);
        }}
        onGeneratePatientMedicalReport={onGeneratePatientMedicalReport}
        onUpdatePatientIdentity={handleUpdatePatientIdentity}
        branchId={branchId}
      />
    </div>
  );
};
