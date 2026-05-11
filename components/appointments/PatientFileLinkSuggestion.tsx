/**
 * PatientFileLinkSuggestion.tsx
 * مكوّن صغير بيظهر في كرت موعد الحجز العام لو المريض لسه مش متربط بملف موجود.
 *
 * الفلسفة (Cost-efficient):
 * - مفيش بحث تلقائي وقت تحميل قائمة المواعيد — هيكلّفنا قراءة لكل موعد.
 * - الطبيب يضغط زرار "🔍 ابحث عن ملف بنفس الهاتف" فقط لو هو شاكك إن المريض قديم.
 * - وقتها بنبحث في patientSummaries بـ array-contains على الهاتف (قراءة واحدة).
 * - لو في مطابقات، Modal بيعرضهم والطبيب يختار اللي مناسب.
 */
import React, { useState } from 'react';
import { firestoreService } from '../../services/firestore';
import type { MatchedPatientSummary } from '../../services/firestore/patient-matching';

interface PatientFileLinkSuggestionProps {
  doctorId: string;
  appointmentId: string;
  phone: string;
  patientName: string;
  /** بنخفي الزرار لو الموعد متربط بالفعل بملف */
  hasPatientFile: boolean;
  /** callback بعد الربط الناجح — الـ parent يقدر يحدّث UI أو يعمل refresh */
  onLinked?: () => void;
}

const formatLastVisit = (ms?: number): string => {
  if (!ms) return 'غير معروفه';
  try {
    const date = new Date(ms);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return 'غير معروفه';
  }
};

export const PatientFileLinkSuggestion: React.FC<PatientFileLinkSuggestionProps> = ({
  doctorId,
  appointmentId,
  phone,
  patientName,
  hasPatientFile,
  onLinked,
}) => {
  const [searching, setSearching] = useState(false);
  const [matches, setMatches] = useState<MatchedPatientSummary[] | null>(null);
  const [linking, setLinking] = useState<string | null>(null); // patientFileNameKey اللي بيتم ربطه دلوقتي
  const [modalOpen, setModalOpen] = useState(false);
  const [linked, setLinked] = useState(false);

  // الموعد متربط بالفعل، أو الموعد مش عام، أو مفيش هاتف → مفيش لزوم للزرار
  if (hasPatientFile || !phone || !phone.trim() || linked) return null;

  const handleSearch = async () => {
    setSearching(true);
    setModalOpen(true);
    try {
      const results = await firestoreService.findPatientSummariesByPhone(doctorId, phone);
      setMatches(results);
    } catch {
      setMatches([]);
    } finally {
      setSearching(false);
    }
  };

  const handleLink = async (match: MatchedPatientSummary) => {
    setLinking(match.patientFileNameKey);
    try {
      await firestoreService.linkAppointmentToPatientFile(doctorId, appointmentId, {
        patientFileId: match.patientFileId,
        patientFileNumber: match.patientFileNumber,
        patientFileNameKey: match.patientFileNameKey,
      });
      setLinked(true);
      setModalOpen(false);
      onLinked?.();
    } catch (err) {
      console.warn('[PatientFileLinkSuggestion] linking failed:', err);
    } finally {
      setLinking(null);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleSearch}
        disabled={searching}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700 text-[10px] font-black disabled:opacity-50"
        title="ابحث في ملفاتك عن مريض بنفس رقم الهاتف"
      >
        🔍 {searching ? 'جاري البحث' : 'هل ده مريض قديم؟'}
      </button>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => !linking && setModalOpen(false)}
          dir="rtl"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-slate-800">البحث عن ملف موجود</h3>
                <p className="text-xs font-bold text-slate-500 mt-0.5">
                  بنبحث عن مريض عندك بنفس رقم: <span dir="ltr">{phone}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => !linking && setModalOpen(false)}
                disabled={Boolean(linking)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-50"
                aria-label="إغلاق"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-3">
              {searching && (
                <p className="text-center text-sm font-bold text-slate-500">جاري البحث...</p>
              )}

              {!searching && matches && matches.length === 0 && (
                <div className="text-center space-y-2">
                  <p className="text-sm font-bold text-slate-700">مفيش ملف بنفس رقم الهاتف.</p>
                  <p className="text-xs text-slate-500 font-bold">
                    الحجز ده لمريض جديد. يبقى ملف جديد هيتعمل أوتوماتيك أول ما تبدأ الكشف.
                  </p>
                </div>
              )}

              {!searching && matches && matches.length > 0 && (
                <>
                  <p className="text-xs font-bold text-slate-600">
                    لقينا {matches.length} ملف بنفس الرقم — اختر اللي مناسب:
                  </p>
                  {matches.map((match) => {
                    const visits = match.totalExams + match.totalConsultations;
                    return (
                      <button
                        key={match.patientFileNameKey}
                        type="button"
                        onClick={() => handleLink(match)}
                        disabled={Boolean(linking)}
                        className="w-full text-right p-3 rounded-xl border-2 border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-300 transition disabled:opacity-50"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-slate-800">
                              {match.patientName || 'بدون اسم'}
                              {typeof match.patientFileNumber === 'number' && (
                                <span className="mr-2 text-xs text-slate-500">#{match.patientFileNumber}</span>
                              )}
                            </p>
                            <p className="text-xs text-slate-600 font-bold mt-1">
                              📊 {visits} زياره · آخر زياره: {formatLastVisit(match.lastVisitAtMs)}
                            </p>
                            {/* تنبيه لو الاسم في الحجز مختلف عن الاسم في الملف القديم */}
                            {match.patientName.trim() &&
                              patientName.trim() &&
                              match.patientName.trim() !== patientName.trim() && (
                                <p className="text-[11px] text-amber-700 font-bold mt-1">
                                  ⚠️ الاسم في الحجز ({patientName}) مختلف عن اسم الملف ({match.patientName})
                                </p>
                              )}
                          </div>
                          <span className="px-2 py-1 rounded-lg bg-sky-600 text-white text-xs font-black shrink-0">
                            {linking === match.patientFileNameKey ? '...' : 'اربط'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
