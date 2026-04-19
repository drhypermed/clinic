/**
 * recordsViewParts — المكونات الرئيسية لعرض السجلات
 *
 * تم فصل معظم المحتوى إلى `records-view-parts/`:
 *   - `helpers.ts`       : types + buildCase + helpers خالصة.
 *   - `highlight.tsx`    : تظليل كلمة البحث.
 *   - `CasePanel.tsx`    : لوحة عرض زيارة واحدة.
 *
 * ما بقي هنا:
 *   - `DailyGroup` — حاوية السجلات اليومية القابلة للطي.
 *   - `StatCard`   — بطاقة إحصائية صغيرة.
 *
 * كما يُعاد تصدير `CasePanel`, `toDateOnly`, `highlight`, والأنواع للحفاظ
 * على التوافق مع مستهلكي `recordsViewParts` الحاليين.
 */

import React, { useState } from 'react';
import { PatientRecord } from '../../types';
import { buildCairoDateTime, formatUserDate } from '../../utils/cairoTime';
import { PatientContactActions } from '../common/PatientContactActions';
import { CasePanel } from './records-view-parts/CasePanel';
import { highlight } from './records-view-parts/highlight';
import {
  buildCase,
  formatDateTimeSep,
  getBMICategory,
  getConsultationSequenceLabel,
  getRecordDiagnosisSummary,
  type RecordTimelineEntry,
} from './records-view-parts/helpers';

// Re-exports للحفاظ على التوافق مع المستهلكين الخارجيين
export { CasePanel } from './records-view-parts/CasePanel';
export { highlight } from './records-view-parts/highlight';
export {
  buildCase,
  getBMICategory,
  toDateOnly,
} from './records-view-parts/helpers';
export type { CaseData, RecordTimelineEntry } from './records-view-parts/helpers';

/**
 * مكون المجموعة اليومية (Daily Group):
 * يجمع سجلات المرضى الذين حضروا في نفس اليوم في حاوية واحدة قابلة للطي (Accordion).
 */
export const DailyGroup: React.FC<{
  dateKey: string;                          // التاريخ (مفتاح المجموعة)
  entries: RecordTimelineEntry[];           // زيارات اليوم (كل زيارة تمثل كشفاً أو استشارة)
  term: string;                             // كلمة البحث الحالية
  onLoadRecord: (record: PatientRecord) => void;
  onOpenPatientFile: (record: PatientRecord) => void;
  onOpenConsultation: (record: PatientRecord) => void;
  onLoadConsultation: (record: PatientRecord) => void;
  onNewExam: (record: PatientRecord) => void;
  onDelete: (id: string) => void;
  onDeleteConsultation: (record: PatientRecord) => void;
  onDeleteExam: (record: PatientRecord) => void;
  openByDefault?: boolean;                  // هل تفتح المجموعة تلقائياً (عادةً ليوم اليوم)
}> = ({ dateKey, entries, term, onLoadRecord, onOpenPatientFile, onOpenConsultation, onLoadConsultation, onNewExam, onDelete, onDeleteConsultation, onDeleteExam, openByDefault }) => {
  const [open, setOpen] = useState(!!openByDefault);
  const [expandedRecordIds, setExpandedRecordIds] = useState<Set<string>>(new Set());
  const totalCasesCount = entries.length;
  const examCasesCount = entries.filter((entry) => entry.visitType === 'exam').length;
  const consultationCasesCount = totalCasesCount - examCasesCount;

  /** فتح/إغلاق تفاصيل مريض معين داخل المجموعة */
  const toggleRecordExpansion = (recordId: string) => {
    setExpandedRecordIds((prev) => {
      const next = new Set(prev);
      if (next.has(recordId)) {
        next.delete(recordId);
      } else {
        next.add(recordId);
      }
      return next;
    });
  };

  return (
    <div className="dh-day-shell rounded-2xl border overflow-hidden">
      {/* رأس المجموعة اليومية */}
      <button
        onClick={() => setOpen(v => !v)}
        className="dh-day-head w-full p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-white hover:brightness-110 transition-colors"
      >
        <div className="font-black text-sm sm:text-base leading-relaxed text-right break-words">
          {formatUserDate(buildCairoDateTime(dateKey, '12:00'), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <div className="w-full sm:w-auto shrink-0 flex flex-wrap sm:flex-nowrap items-center justify-start sm:justify-end gap-1.5 sm:gap-2">
          <span className="text-[11px] font-bold bg-white/20 text-white rounded-full px-2.5 py-1">{totalCasesCount} حالة</span>
          <span className="text-[11px] font-bold bg-white/15 text-white rounded-full px-2.5 py-1">{examCasesCount} كشف</span>
          <span className="text-[11px] font-bold bg-white/15 text-white rounded-full px-2.5 py-1">{consultationCasesCount} استشارة</span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-black transition-colors ${open ? 'bg-white text-blue-700 border-white' : 'bg-white/20 text-white border-white/40'}`}>
            {open ? 'طي' : 'عرض'}
            <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </button>

      {/* قائمة السجلات داخل اليوم */}
      {open && (
        <div className="bg-slate-50/50 p-4 sm:p-5 space-y-3">
          {entries.map((entry) => {
            const rec = entry.record;
            const examCase = entry.visitType === 'exam' ? buildCase(rec, 'exam') : null;
            const consultationCase = entry.visitType === 'consultation' ? buildCase(rec, 'consultation') : null;
            const diagnosisSummary = getRecordDiagnosisSummary(rec, entry.visitType);
            const isExpanded = expandedRecordIds.has(entry.entryId);
            const linkedConsultationDates = entry.visitType === 'exam'
              ? (Array.isArray(rec.consultationHistoryDates) && rec.consultationHistoryDates.length > 0
                ? rec.consultationHistoryDates
                : (rec.consultation?.date ? [rec.consultation.date] : []))
              : [];
            const consultationOrdinals = ['', 'ثانية', 'ثالثة', 'رابعة', 'خامسة', 'سادسة', 'سابعة'];
            const linkedConsultationLines: string[] = entry.visitType === 'exam' && linkedConsultationDates.length > 0
              ? linkedConsultationDates.map((date, i) => {
                  const ord = consultationOrdinals[i] ?? `${i + 1}`;
                  return ord ? `تمت استشارة ${ord} بتاريخ ${formatDateTimeSep(date)}` : `تمت استشارة بتاريخ ${formatDateTimeSep(date)}`;
                })
              : [];
            const linkedExamText = entry.visitType === 'consultation' && entry.sourceExamDate
              ? `مرتبطة بكشف يوم ${formatDateTimeSep(entry.sourceExamDate)}`
              : '';
            const consultationSequenceLabel = entry.visitType === 'consultation' && (entry.consultationSequenceForPatient || 0) > 1
              ? getConsultationSequenceLabel(entry.consultationSequenceForPatient || 0)
              : '';
            const canLoadExam = !rec.isConsultationOnly;
            const canLoadConsultation = entry.visitType === 'consultation' || Boolean(rec.consultation);
            const canOpenConsultation = entry.visitType === 'exam';
            const normalizedDiscountAmount = Number(rec.discountAmount || 0) || 0;
            const normalizedDiscountPercent = Number(rec.discountPercent || 0) || 0;
            const discountDetails =
              normalizedDiscountPercent > 0
                ? `${normalizedDiscountPercent}%`
                : (normalizedDiscountAmount > 0 ? `${normalizedDiscountAmount.toFixed(2)} ج.م` : '');
            const paymentMetaText = rec.paymentType === 'insurance'
              ? 'الدفع: تأمين'
              : rec.paymentType === 'discount'
                ? `الدفع: خصم${discountDetails ? ` (${discountDetails})` : ''}`
                : 'الدفع: كاش';
            const discountReasonSummary = String(rec.discountReasonLabel || '').trim();
            const insuranceMeta = [
              rec.insuranceMembershipId ? `رقم الكارنية: ${rec.insuranceMembershipId}` : null,
              rec.insuranceApprovalCode ? `كود الموافقة: ${rec.insuranceApprovalCode}` : null,
            ].filter(Boolean) as string[];
            const sessionVitals = {
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

            return (
              <div key={entry.entryId} className="dh-patient-shell rounded-2xl border overflow-hidden">
                <div className="w-full p-3 text-right">
                  {/* الاسم + زر التوسيع */}
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleRecordExpansion(entry.entryId)}
                        className="font-black text-slate-900 hover:text-blue-700 transition-colors text-right leading-tight"
                      >
                        {highlight(rec.patientName || 'مريض بدون اسم', term)}
                      </button>
                      {/* رقم الملف + زر ملف المريض */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {typeof rec.patientFileNumber === 'number' && Number.isFinite(rec.patientFileNumber) && rec.patientFileNumber > 0 && (
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-500">
                            #{rec.patientFileNumber}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onOpenPatientFile(rec); }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-3.5 py-1.5 text-xs font-black text-white shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                          ملف المريض
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleRecordExpansion(entry.entryId)}
                      className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${isExpanded ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600'}`}
                    >
                      {isExpanded ? 'طي' : 'تفاصيل'}
                      <svg className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>

                  {/* نوع الزيارة + التاريخ والوقت + الدفع + إضافيات */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600">
                      {entry.visitType === 'consultation' || rec.isConsultationOnly ? 'استشارة' : 'كشف'}
                      <span className="text-slate-300 mx-0.5">·</span>
                      <span className="font-medium text-slate-400">{formatDateTimeSep(entry.visitType === 'consultation' ? entry.date : rec.date)}</span>
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600">
                      {paymentMetaText}
                    </span>
                    {rec.paymentType === 'discount' && discountReasonSummary && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-[11px] font-medium">
                        {highlight(`سبب الخصم: ${discountReasonSummary}`, term)}
                      </span>
                    )}
                    {insuranceMeta.map((item, index) => (
                      <span
                        key={`${rec.id}-insurance-meta-${index}`}
                        className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-200 text-[11px] font-medium"
                      >
                        {highlight(item, term)}
                      </span>
                    ))}
                    {consultationSequenceLabel && (
                      <span className="inline-flex items-center text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-0.5">{consultationSequenceLabel}</span>
                    )}
                  </div>

                  {/* مرتبط - فقط للاستشارة المرتبطة بكشف */}
                  {linkedExamText && (
                    <div className="mt-1 text-[11px] font-bold bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
                      {linkedExamText}
                    </div>
                  )}
                  {linkedConsultationLines.map((line, i) => (
                    <div key={i} className="mt-0.5 text-[11px] font-bold bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
                      {line}
                    </div>
                  ))}

                  {/* التشخيص */}
                  <div className="flex items-baseline gap-1.5 mt-1.5">
                    <span className="text-xs font-black text-slate-700 shrink-0">التشخيص:</span>
                    <span className="text-xs font-bold text-slate-700 leading-snug whitespace-pre-wrap break-words">{highlight(diagnosisSummary, term)}</span>
                  </div>

                  {/* رقم الهاتف + أزرار التواصل */}
                  {rec.phone && (
                    <div className="mt-1.5 flex items-center flex-wrap gap-2">
                      <span className="text-xs font-medium text-slate-500" dir="ltr">{highlight(rec.phone, term)}</span>
                      <PatientContactActions phone={rec.phone} compact />
                    </div>
                  )}
                </div>

                {/* تفاصيل الحالة وأزرار الإجراءات (تظهر عند التوسيع) */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/40 px-3 pt-2.5 pb-3 space-y-2.5">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => onNewExam(rec)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-black shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                        كشف جديد
                      </button>
                      {canOpenConsultation && (
                        <button onClick={() => onOpenConsultation(rec)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-black shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                          فتح استشارة
                        </button>
                      )}
                      {canLoadConsultation && (
                        <button onClick={() => onLoadConsultation(rec)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-black shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                          تحميل الاستشارة
                        </button>
                      )}
                      {canLoadExam && (
                        <button onClick={() => onLoadRecord(rec)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-black shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                          تحميل الكشف
                        </button>
                      )}
                    </div>

                    {examCase && <CasePanel data={examCase} term={term} onDeleteCase={() => onDeleteExam(rec)} vitals={Object.keys(sessionVitals).length > 0 ? sessionVitals : undefined} />}
                    {consultationCase && <CasePanel data={consultationCase} term={term} onDeleteCase={() => onDeleteConsultation(rec)} />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/** بطاقة الإحصاءات المصغرة (Stat Card) */
export const StatCard: React.FC<{ label: string; value: number; tone: 'blue' | 'purple' | 'emerald' | 'amber' | 'indigo'; className?: string }> = ({ label, value, tone, className = '' }) => {
  const color: Record<string, string> = {
    blue: 'text-blue-700',
    purple: 'text-blue-700',
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
    indigo: 'text-blue-700',
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-100 p-2.5 shadow-sm flex flex-col gap-0.5 ${className}`}>
      <div className="text-[11px] text-slate-400 font-semibold leading-tight">{label}</div>
      <div className={`text-2xl font-black leading-none ${color[tone]}`}>{value}</div>
    </div>
  );
};
