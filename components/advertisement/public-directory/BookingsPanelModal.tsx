/** لوحة الحجوزات: تستعرض قائمة مواعيد المستخدم القادمة والسابقة مع إمكانية إضافة تقييمات للزيارات المكتملة. */
import React from 'react';
import { createPortal } from 'react-dom';

import { LoadingText } from '../../ui/LoadingText';
import type { PublicUserBooking } from '../../../types';
import { formatBookingDateTime } from './helpers';

interface BookingsPanelModalProps {
  open: boolean;
  onClose: () => void;
  myBookingsLoading: boolean;
  myBookings: PublicUserBooking[];
  accountName: string;
  reviewFeedback: Record<string, { type: 'success' | 'error'; message: string }>;
  reviewSubmittingId: string | null;
  getBookingReviewDraft: (booking: PublicUserBooking) => { rating: number; comment: string };
  updateBookingReviewDraft: (
    booking: PublicUserBooking,
    patch: Partial<{ rating: number; comment: string }>
  ) => void;
  submitBookingReview: (booking: PublicUserBooking) => void;
  deleteBookingReview: (booking: PublicUserBooking) => void;
  onBookDoctor: (doctorId: string) => void;
}

export const BookingsPanelModal: React.FC<BookingsPanelModalProps> = ({
  open,
  onClose,
  myBookingsLoading,
  myBookings,
  accountName,
  reviewFeedback,
  reviewSubmittingId,
  getBookingReviewDraft,
  updateBookingReviewDraft,
  submitBookingReview,
  deleteBookingReview,
  onBookDoctor,
}) => {
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9995] bg-slate-950/60 backdrop-blur-[2px] p-3 sm:p-4 flex items-start sm:items-center justify-center overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg clinic-section p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="flex items-center justify-between gap-2 mb-4">
          <h3 className="text-xl font-black text-slate-900">حجوزاتي</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-black"
          >
            ×
          </button>
        </div>

        {myBookingsLoading ? (
          <div className="py-8 text-center text-slate-600 font-black"><LoadingText>جاري تحميل الحجوزات</LoadingText></div>
        ) : myBookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-slate-700 font-black">لا توجد حجوزات حتى الآن</p>
            <p className="text-slate-500 font-bold text-sm mt-1">احجز موعدًا مع طبيب ليظهر هنا مباشرة</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {myBookings.map((booking) => {
              const reviewDraft = getBookingReviewDraft(booking);
              const bookingFeedback = reviewFeedback[booking.id];
              const isReviewSubmitting = reviewSubmittingId === booking.id;

              return (
                <div
                  key={booking.id}
                  className="rounded-2xl border border-cyan-100 bg-cyan-50/40 p-3 space-y-1.5"
                >
                  <p className="text-slate-900 font-black">{booking.doctorName || 'طبيب'}</p>
                  <p className="text-cyan-800 text-xs font-black">{booking.doctorSpecialty || 'بدون تخصص'}</p>
                  <p className="text-slate-700 text-xs font-bold">{formatBookingDateTime(booking.dateTime)}</p>
                  <p className="text-slate-500 text-xs font-bold">المريض: {booking.patientName || accountName}</p>
                  {booking.status === 'completed' ? (
                    <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-1 text-emerald-800 text-xs font-black">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.2 7.2a1 1 0 01-1.415 0l-3-3a1 1 0 111.414-1.42l2.293 2.294 6.493-6.494a1 1 0 011.415 0z" clipRule="evenodd" />
                      </svg>
                      حجز منفذ
                    </p>
                  ) : (
                    <p className="inline-flex items-center rounded-full bg-amber-100 border border-amber-200 px-2.5 py-1 text-amber-800 text-xs font-black">
                      قيد الانتظار
                    </p>
                  )}

                  {booking.status === 'completed' && (
                    <div className="mt-2 rounded-xl border border-amber-100 bg-amber-50/70 p-2.5 space-y-2">
                      {typeof booking.rating === 'number' && Number.isFinite(booking.rating) ? (
                        <>
                          <p className="text-xs font-black text-emerald-800">تم تقييم هذه الزيارة</p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((starValue) => (
                              <span
                                key={`${booking.id}-rated-star-${starValue}`}
                                className="w-8 h-8 rounded-lg inline-flex items-center justify-center"
                              >
                                <svg
                                  className={`w-5 h-5 ${starValue <= Math.round(booking.rating || 0) ? 'text-amber-500' : 'text-amber-200'}`}
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  aria-hidden="true"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.071 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.196-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z" />
                                </svg>
                              </span>
                            ))}
                            <span className="text-xs font-black text-amber-800 mr-1">{Math.round(booking.rating)}/5</span>
                          </div>
                          {booking.reviewComment?.trim() && (
                            <div className="rounded-lg border border-amber-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 whitespace-pre-wrap">
                              {booking.reviewComment.trim()}
                            </div>
                          )}
                          {bookingFeedback && (
                            <p className={`text-xs font-black ${bookingFeedback.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
                              {bookingFeedback.message}
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={() => deleteBookingReview(booking)}
                            disabled={isReviewSubmitting}
                            className="h-9 px-3 rounded-lg bg-rose-500 text-white text-xs font-black hover:bg-rose-600 disabled:opacity-60"
                          >
                            {isReviewSubmitting ? 'جاري الحذف' : 'حذف التقييم'}
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-black text-amber-900">قيّم الطبيب بعد تنفيذ الحجز (مرة واحدة لكل زيارة)</p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((starValue) => (
                              <button
                                key={`${booking.id}-star-${starValue}`}
                                type="button"
                                onClick={() => updateBookingReviewDraft(booking, { rating: starValue })}
                                className="w-8 h-8 rounded-lg inline-flex items-center justify-center hover:bg-white/80 transition-colors"
                                aria-label={`تقييم ${starValue} نجوم`}
                              >
                                <svg
                                  className={`w-5 h-5 ${starValue <= reviewDraft.rating ? 'text-amber-500' : 'text-amber-200'}`}
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  aria-hidden="true"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.071 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.196-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z" />
                                </svg>
                              </button>
                            ))}
                            <span className="text-xs font-black text-amber-800 mr-1">
                              {reviewDraft.rating > 0 ? `${reviewDraft.rating}/5` : 'اختر التقييم'}
                            </span>
                          </div>
                          <textarea
                            value={reviewDraft.comment}
                            onChange={(e) => updateBookingReviewDraft(booking, { comment: e.target.value })}
                            placeholder="اكتب تعليقك (اختياري)"
                            className="w-full min-h-[72px] rounded-lg border border-amber-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300"
                            maxLength={600}
                          />
                          {bookingFeedback && (
                            <p className={`text-xs font-black ${bookingFeedback.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
                              {bookingFeedback.message}
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={() => submitBookingReview(booking)}
                            disabled={isReviewSubmitting}
                            className="h-9 px-3 rounded-lg bg-amber-500 text-white text-xs font-black hover:bg-amber-600 disabled:opacity-60"
                          >
                            {isReviewSubmitting ? 'جاري الحفظ' : 'إرسال التقييم'}
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onBookDoctor(booking.doctorId);
                    }}
                    className="apple-action-btn min-h-[40px] px-4 mt-2 text-sm flex items-center justify-center p-0"
                  >
                    حجز جديد مع الطبيب
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

