/**
 * مودال مراجعة تقييمات المريض (Patient Reviews Modal)
 * نافذة منبثقة تعرض كافة التقييمات والتعليقات التي تركها مريض معين للأطباء، مع إمكانية حذفها.
 */

import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
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
    <div className="fixed inset-0 z-[9995] flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-600">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-2xl font-black text-white">💬 تعليقات وتقييمات: {highlightMatch(selectedPatientName)}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold">
            ✖
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {ratedReviews.length > 0 ? (
            ratedReviews.map((booking) => (
              <div
                key={booking.id}
                className="bg-slate-700 p-4 rounded-xl border border-slate-600 flex flex-col md:flex-row justify-between gap-4"
              >
                <div>
                  <p className="text-white font-bold mb-1">
                    👨‍⚕️ طبيب: <span className="text-blue-400">{highlightMatch(booking.doctorName)}</span>
                  </p>

                  <div className="flex gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <span
                        key={index}
                        className={`text-xl ${index < (booking.rating || 0) ? 'text-yellow-400' : 'text-slate-500'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  {booking.reviewComment && (
                    <p className="text-slate-300 bg-slate-800 p-3 rounded-lg text-sm italic">
                      "{highlightMatch(booking.reviewComment)}"
                    </p>
                  )}

                  <p className="text-slate-400 text-xs mt-2">
                    تاريخ التقييم: {booking.reviewedAt ? formatUserDate(booking.reviewedAt, undefined, 'ar-EG') : '-'}
                  </p>
                </div>

                <div className="flex items-start">
                  <button
                    onClick={() => {
                      if (selectedPatientId && booking.id) {
                        void onDeleteReview(selectedPatientId, booking.id);
                      }
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg whitespace-nowrap"
                  >
                    🗑️ حذف التقييم
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-400 py-8">لا يوجد تعليقات مسجلة حالياً</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
