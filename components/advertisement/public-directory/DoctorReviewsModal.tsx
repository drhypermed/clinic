/** نافذة التقييمات: تستعرض آراء الجمهور والتعليقات النصية لتعزيز الشفافية والمساعدة في اختيار الطبيب. */
import React from 'react';
import { createPortal } from 'react-dom';

import { LoadingText } from '../../ui/LoadingText';
import type { DoctorPublicReview } from '../../../types';
import { formatUserDate } from '../../../utils/cairoTime';

interface DoctorReviewsModalProps {
  open: boolean;
  doctorName: string;
  reviews: DoctorPublicReview[];
  loading: boolean;
  onClose: () => void;
}

export const DoctorReviewsModal: React.FC<DoctorReviewsModalProps> = ({
  open,
  doctorName,
  reviews,
  loading,
  onClose,
}) => {
  if (!open) return null;
  const maskReviewerName = (name?: string) => {
    const normalized = (name || '').trim();
    if (!normalized) return 'مراجع موثّق';
    if (normalized.length <= 2) return `${normalized[0] || 'م'}*`;
    return `${normalized.slice(0, 2)}***`;
  };

  const textCommentsCount = reviews.filter((review) => Boolean(review.reviewComment?.trim())).length;

  return createPortal(
    <div
      className="fixed inset-0 z-[9995] bg-slate-950/65 backdrop-blur-[2px] p-3 sm:p-4 flex items-start sm:items-center justify-center overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[86vh] overflow-y-auto clinic-section p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="flex items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-xl font-black text-slate-900">تقييمات {doctorName || 'الطبيب'}</h3>
            <p className="text-xs font-bold text-slate-500 mt-1">تعليقات الجمهور من الزيارات المؤكدة</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-black"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-600 font-black"><LoadingText>جاري تحميل التقييمات</LoadingText></div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-slate-700 font-black">لا توجد تعليقات بعد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {textCommentsCount === 0 && (
              <div className="rounded-2xl border border-brand-200 bg-brand-50 p-3 text-center">
                <p className="text-brand-800 text-xs font-black">يوجد تقييمات بالنجوم، لكن لم يضف الزوار تعليقات نصية بعد.</p>
              </div>
            )}
            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-2xl border border-warning-100 bg-warning-50/70 p-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] font-black text-slate-600 truncate">{maskReviewerName(review.patientName)}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((starValue) => (
                        <svg
                          key={`${review.id}-star-${starValue}`}
                          className={`w-4 h-4 ${starValue <= review.rating ? 'text-warning-500' : 'text-warning-200'}`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.071 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.196-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-xs font-black text-warning-800 mr-1">{review.rating}/5</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    {formatUserDate(review.reviewedAt, undefined, 'ar-EG')}
                  </span>
                </div>
                {review.reviewComment?.trim() ? (
                  <p className="text-sm font-bold text-slate-700 whitespace-pre-wrap">{review.reviewComment.trim()}</p>
                ) : (
                  <p className="text-xs font-bold text-slate-500">بدون تعليق نصي</p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

