import React, { useMemo } from 'react';
import type { RecentExamPatientOption } from './types';
import { getArabicDayName, groupConsultationCandidatesByDate } from './helpers';
import { buildCairoDateTime, formatUserDate, formatUserTime } from '../../../utils/cairoTime';
import { PatientContactActions } from '../../common/PatientContactActions';

/**
 * لوحة اختيار مرشحي الاستشارات (Consultation Candidates Panel)
 * تظهر عندما يختار الطبيب نوع الحجز "استشارة".
 * وظيفتها:
 * 1. عرض المرضى الذين تم الكشف عليهم مؤخراً (خلال آخر 30 يوم).
 * 2. تجميع هؤلاء المرضى حسب تاريخ الكشف لسهولة العثور عليهم.
 * 3. توفير أزرار سريعة للاتصال بالمريض أو مراسلته على واتساب.
 */

interface ConsultationCandidatesPanelProps {
  consultationCandidates: RecentExamPatientOption[];
  selectedConsultationCandidateId?: string;
  onSelectCandidate: (candidate: RecentExamPatientOption) => void;
  canLoadMoreConsultationCandidates?: boolean;
  onLoadMoreConsultationCandidates?: () => void;
}

export const ConsultationCandidatesPanel: React.FC<ConsultationCandidatesPanelProps> = ({
  consultationCandidates,
  selectedConsultationCandidateId,
  onSelectCandidate,
  canLoadMoreConsultationCandidates = false,
  onLoadMoreConsultationCandidates,
}) => {
  // تجميع المرشحين حسب التاريخ (مثلاً: كشوفات الأحد، كشوفات الإثنين...)
  const { grouped, sortedDates } = useMemo(
    () => groupConsultationCandidatesByDate(consultationCandidates),
    [consultationCandidates]
  );

  const formatConsultationDateTime = (value: string): string => {
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return value;

    const dateText = formatUserDate(parsedDate, { year: 'numeric', month: '2-digit', day: '2-digit' }, 'ar-EG-u-nu-latn');
    const timeText = formatUserTime(parsedDate, { hour: 'numeric', minute: '2-digit', hour12: true }, 'ar-EG-u-nu-latn');
    return `${dateText} - ${timeText}`;
  };

  const getConsultationDates = (candidate: RecentExamPatientOption): string[] => {
    const valuesFromList = Array.isArray(candidate.consultationCompletedDates)
      ? candidate.consultationCompletedDates.map((item) => String(item || '').trim()).filter(Boolean)
      : [];
    const singleValue = String(candidate.consultationCompletedAt || '').trim();

    const merged = Array.from(new Set([...valuesFromList, ...(singleValue ? [singleValue] : [])]));
    return merged
      .filter((item) => Number.isFinite(Date.parse(item)))
      .sort((left, right) => Date.parse(right) - Date.parse(left));
  };

  const getConsultationStatus = (candidate: RecentExamPatientOption) => {
    const consultationDates = getConsultationDates(candidate);
    if (consultationDates.length === 0) {
      return {
        hasConsultation: false,
        statusLabel: 'لم تتم الاستشارة',
        datesLabel: '',
      };
    }

    if (consultationDates.length === 1) {
      return {
        hasConsultation: true,
        statusLabel: 'تمت استشارة واحدة',
        datesLabel: `التاريخ والوقت: ${formatConsultationDateTime(consultationDates[0])}`,
      };
    }

    return {
      hasConsultation: true,
      statusLabel: `تمت ${consultationDates.length} استشارات`,
      datesLabel: consultationDates.map((item) => formatConsultationDateTime(item)).join(' | '),
    };
  };

  return (
    <div className="sm:col-span-2 lg:col-span-4 rounded-2xl border-2 border-brand-400 bg-gradient-to-r from-brand-600 via-brand-600 to-brand-500 p-3 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <p className="inline-flex items-center gap-1 rounded-lg bg-black/20 px-2.5 py-1 text-xs font-black text-white ring-1 ring-white/40">
          كشوفات اخر 30 يوم
        </p>
      </div>

      {consultationCandidates.length === 0 ? (
        <p className="text-xs font-bold text-white/90">لا يوجد مرضى مؤهلون للاستشارة حالياً.</p>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((dateKey) => (
            <div key={dateKey} className="space-y-1.5">
              {/* ترويسة التاريخ */}
              <div className="flex items-center gap-2 px-2 py-1">
                <span className="text-[11px] font-black text-brand-900 bg-brand-200 px-2 py-0.5 rounded-full">{getArabicDayName(dateKey)}</span>
                <span className="text-[11px] font-bold text-brand-50">{formatUserDate(buildCairoDateTime(dateKey, '12:00'), undefined, 'ar-EG')}</span>
              </div>

              {/* قائمة المرضى في هذا اليوم */}
              {grouped[dateKey].map((candidate) => {
                const consultationStatus = getConsultationStatus(candidate);
                return (
                <div key={candidate.id} className={`rounded-xl border-2 p-2.5 transition-all flex items-center justify-between gap-3 ${selectedConsultationCandidateId === candidate.id ? 'border-warning-400 bg-white shadow-md scale-[1.01]' : 'border-success-200 bg-white/95'}`}>
                  <div className="flex flex-wrap items-center gap-2 flex-1">
                    <p className="text-sm font-black text-slate-800">{candidate.patientName}</p>
                    <span className="text-[10px] font-black text-brand-800 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">{candidate.age || 'السن غير معروف'}</span>
                    <span className="text-[10px] font-black text-success-800 bg-success-50 px-2 py-0.5 rounded border border-success-100">{candidate.phone || 'بدون رقم هاتف'}</span>
                    <div className={`max-w-full text-[10px] font-black px-2 py-1 rounded border leading-relaxed ${consultationStatus.hasConsultation ? 'text-warning-800 bg-warning-50 border-warning-100' : 'text-danger-800 bg-danger-50 border-danger-100'}`}>
                      <div>{consultationStatus.statusLabel}</div>
                      {consultationStatus.datesLabel && (
                        <div className="font-bold text-[10px] text-slate-700 mt-0.5 break-words">{consultationStatus.datesLabel}</div>
                      )}
                    </div>
                    <PatientContactActions phone={candidate.phone} compact />
                  </div>
                  <button type="button" onClick={() => onSelectCandidate(candidate)} className="px-3 py-2 rounded-lg bg-brand-300 hover:bg-brand-400 text-brand-950 text-xs font-black transition-colors shrink-0">حجز استشارة</button>
                </div>
                );
              })}
            </div>
          ))}

          {canLoadMoreConsultationCandidates && onLoadMoreConsultationCandidates && (
            <div className="pt-1">
              <button
                type="button"
                onClick={onLoadMoreConsultationCandidates}
                className="w-full rounded-xl bg-white/90 hover:bg-white text-brand-700 text-xs font-black px-3 py-2 border border-brand-200 transition-colors"
              >
                تحميل المزيد
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
