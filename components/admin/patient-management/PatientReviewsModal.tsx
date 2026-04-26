/**
 * مودال مراجعة تقييمات المريض (Patient Reviews Modal)
 * نافذة منبثقة تعرض كافة التقييمات والتعليقات التي تركها مريض معين للأطباء، مع إمكانية حذفها.
 * يستخدم نفس نمط الألوان (light theme) لباقي لوحة الادمن.
 */

import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { FaXmark, FaStar, FaTrashCan, FaUserDoctor } from 'react-icons/fa6';
import { isRatedBooking } from './patientUtils';
import { PatientReviewsModalProps } from '../../../types';
import { formatUserDate } from '../../../utils/cairoTime';

export const PatientReviewsModal: React.FC<PatientReviewsModalProps> = ({
  selectedPatientId,
  selectedPatientName,
  selectedPatientReviews,
  highlightMatch,
  onDeleteReview,
  onClose,
}) => {
  const ratedReviews = useMemo(
    () => (selectedPatientReviews || []).filter((booking) => isRatedBooking(booking)),
    [selectedPatientReviews]
  );

  if (!selectedPatientReviews) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9995] flex items-start sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200">
        {/* ── الهيدر ── */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
          <h3 className="text-base sm:text-lg font-black text-slate-800">
            تعليقات وتقييمات: <span className="text-brand-700">{highlightMatch(selectedPatientName)}</span>
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            aria-label="إغلاق"
          >
            <FaXmark className="w-4 h-4" />
          </button>
        </div>

        {/* ── محتوى المودال ── */}
        <div className="p-5 overflow-y-auto space-y-3">
          {ratedReviews.length > 0 ? (
            ratedReviews.map((booking) => (
              <div
                key={booking.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-brand-50 text-brand-600 rounded-lg p-1.5">
                      <FaUserDoctor className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-slate-800 font-bold text-sm">
                      طبيب: <span className="text-brand-700">{highlightMatch(booking.doctorName)}</span>
                    </p>
                  </div>

                  {/* النجوم */}
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <FaStar
                        key={index}
                        className={`w-4 h-4 ${
                          index < (booking.rating || 0) ? 'text-warning-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>

                  {booking.reviewComment && (
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-lg text-sm border border-slate-100 italic">
                      "{highlightMatch(booking.reviewComment)}"
                    </p>
                  )}

                  <p className="text-slate-400 text-[11px] mt-2">
                    تاريخ التقييم: {booking.reviewedAt ? formatUserDate(booking.reviewedAt, undefined, 'ar-EG') : '—'}
                  </p>
                </div>

                <div className="flex items-start">
                  <button
                    onClick={() => {
                      if (selectedPatientId && booking.id) {
                        void onDeleteReview(selectedPatientId, booking.id);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-danger-200 bg-danger-50 px-3 py-1.5 text-xs font-bold text-danger-700 transition hover:bg-danger-100 whitespace-nowrap"
                  >
                    <FaTrashCan className="w-3 h-3" />
                    حذف التقييم
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-400 py-8 text-sm">لا يوجد تعليقات مسجلة حالياً</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
