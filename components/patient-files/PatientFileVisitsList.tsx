import React, { useState } from 'react';
import type { PatientRecord } from '../../types';
import { buildCase, CasePanel, getBMICategory } from '../records/recordsViewParts';
import { formatPatientFileDateLabel, type PatientVisitEntry } from './patientFilesShared';

interface PatientFileVisitsListProps {
  visits: PatientVisitEntry[];
  onEditExamVisit: (record: PatientRecord) => void;
  onEditConsultationVisit: (record: PatientRecord) => void;
}

export const PatientFileVisitsList: React.FC<PatientFileVisitsListProps> = ({
  visits,
  onEditExamVisit,
  onEditConsultationVisit,
}) => {
  const [expandedVisitIds, setExpandedVisitIds] = useState<Set<string>>(new Set());

  const toggleVisitExpansion = (visitId: string) => {
    setExpandedVisitIds(prev => {
      const next = new Set(prev);
      if (next.has(visitId)) { next.delete(visitId); } else { next.add(visitId); }
      return next;
    });
  };

  if (visits.length === 0) return null;

  return (
    <div className="space-y-2.5">
      {visits.map((visit) => {
        const rec = visit.record;
        const caseData = buildCase(rec, visit.type);
        const isExpanded = expandedVisitIds.has(visit.visitId);
        const isExam = visit.type === 'exam';

        const normalizedDiscountAmount = Number(rec.discountAmount || 0) || 0;
        const normalizedDiscountPercent = Number(rec.discountPercent || 0) || 0;
        const discountDetails = normalizedDiscountPercent > 0
          ? `${normalizedDiscountPercent}%`
          : (normalizedDiscountAmount > 0 ? `${normalizedDiscountAmount.toFixed(2)} ج.م` : '');
        const paymentLabel = rec.paymentType === 'insurance'
          ? 'تأمين'
          : rec.paymentType === 'discount'
            ? `خصم${discountDetails ? ` (${discountDetails})` : ''}`
            : 'كاش';
        const discountReasonSummary = String(rec.discountReasonLabel || '').trim();

        const sessionVitals: Record<string, string> = {
          ...(String(rec.weight || '').trim() ? { weight: String(rec.weight || '').trim() } : {}),
          ...(String(rec.height || '').trim() ? { height: String(rec.height || '').trim() } : {}),
          ...(String(rec.bmi || '').trim() ? { bmi: (() => { const b = String(rec.bmi || '').trim(); const cat = getBMICategory(b); return cat ? `${b} (${cat})` : b; })() } : {}),
          ...(String(rec.vitals?.rbs || '').trim() ? { rbs: String(rec.vitals?.rbs || '').trim() } : {}),
          ...(String(rec.vitals?.bp || '').trim() ? { bp: String(rec.vitals?.bp || '').trim() } : {}),
          ...(String(rec.vitals?.pulse || '').trim() ? { pulse: String(rec.vitals?.pulse || '').trim() } : {}),
          ...(String(rec.vitals?.temp || '').trim() ? { temp: String(rec.vitals?.temp || '').trim() } : {}),
          ...(String(rec.vitals?.spo2 || '').trim() ? { spo2: String(rec.vitals?.spo2 || '').trim() } : {}),
          ...(String(rec.vitals?.rr || '').trim() ? { rr: String(rec.vitals?.rr || '').trim() } : {}),
        };

        const headBg = isExam
          ? 'bg-gradient-to-br from-blue-900 via-blue-600 to-cyan-700'
          : 'bg-gradient-to-br from-green-900 via-green-600 to-emerald-700';

        return (
          <div key={visit.visitId} className="dh-patient-shell rounded-2xl border overflow-hidden">
            <button
              type="button"
              onClick={() => toggleVisitExpansion(visit.visitId)}
              className={`w-full ${headBg} px-4 py-3 text-white text-right transition-all hover:brightness-110`}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-white/20 border border-white/30 text-white">
                    {isExam ? 'كشف' : 'استشارة'}
                  </span>
                  <span className="text-[12px] font-bold text-white/90">{formatPatientFileDateLabel(visit.date)}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-white/15 border border-white/20 text-[11px] font-bold text-white/80">
                    {paymentLabel}
                  </span>
                  {rec.paymentType === 'discount' && discountReasonSummary && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-100 border border-amber-300/30 text-[11px] font-medium">
                      سبب الخصم: {discountReasonSummary}
                    </span>
                  )}
                  {!isExam && visit.sourceExamDate && (
                    <span className="inline-flex items-center text-[11px] font-bold text-green-100 bg-white/10 border border-white/20 rounded-lg px-2 py-0.5">
                      مرتبطة بكشف يوم {formatPatientFileDateLabel(visit.sourceExamDate)}
                    </span>
                  )}
                  {isExam && visit.linkedConsultationDates && visit.linkedConsultationDates.length > 0 && (
                    <span className="inline-flex items-center text-[11px] font-bold text-blue-100 bg-white/10 border border-white/20 rounded-lg px-2 py-0.5">
                      {visit.linkedConsultationDates.length === 1 ? 'له استشارة' : `له ${visit.linkedConsultationDates.length} استشارات`}
                    </span>
                  )}
                </div>
                <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${isExpanded ? 'bg-white text-blue-700 border-white' : 'bg-white/20 text-white border-white/40'}`}>
                  {isExpanded ? 'طي' : 'عرض'}
                  <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </button>

            {isExpanded && caseData && (
              <div className="bg-slate-50/40 px-3 pt-2.5 pb-3 space-y-2.5">
                <div className="flex flex-wrap gap-2">
                  {isExam && (
                    <button
                      type="button"
                      onClick={() => onEditExamVisit(rec)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-black shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                    >
                      تعديل الكشف
                    </button>
                  )}
                  {!isExam && (
                    <button
                      type="button"
                      onClick={() => onEditConsultationVisit(rec)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-black shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                    >
                      تعديل الاستشارة
                    </button>
                  )}
                </div>
                <CasePanel
                  data={caseData}
                  term=""
                  vitals={Object.keys(sessionVitals).length > 0 ? sessionVitals : undefined}
                />
              </div>
            )}
            {isExpanded && !caseData && (
              <div className="px-4 py-3 text-sm text-slate-400 font-medium bg-white">
                لا توجد بيانات تفصيلية لهذه الزيارة
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
