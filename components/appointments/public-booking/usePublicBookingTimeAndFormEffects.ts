/**
 * الملف: usePublicBookingTimeAndFormEffects.ts (Hook)
 * الوصف: "ضابط الوقت والتأثيرات". 
 * يتولى هذا الملف إدارة الزمن وتحديثات الحالة المرتبطة بالوقت: 
 * - يحدّث "تاريخ اليوم" تلقائياً كل دقيقة لضمان دقة البيانات المعروضة. 
 * - يزامن التاريخ والوقت داخل نماذج الحجز (Forms) عند حلول يوم جديد. 
 * - يدير "حالة التحميل" (Loading States) عند فتح وإغلاق النوافذ لضمان انتقالات سلسة. 
 * - يمنع حدوث أخطاء في المواعيد الناتجة عن اختلاف التوقيت المحلي للجهاز.
 */
import { useEffect, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';

import { getDefaultTimeStr } from './helpers';

type UsePublicBookingTimeAndFormEffectsParams = {
  currentDayStr: string;
  previousDayStrRef: MutableRefObject<string>;
  dateStr: string;
  setDateStr: Dispatch<SetStateAction<string>>;
  setTimeStr: Dispatch<SetStateAction<string>>;
  publicSlotDateStr: string;
  setPublicSlotDateStr: Dispatch<SetStateAction<string>>;
  setPublicSlotTimeStr: Dispatch<SetStateAction<string>>;
  bookingFormOpen: boolean;
  setFormError: Dispatch<SetStateAction<string | null>>;
  setBookingFormLoading: Dispatch<SetStateAction<boolean>>;
  bookingFormLoadingTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;
};

export const usePublicBookingTimeAndFormEffects = ({
  currentDayStr,
  previousDayStrRef,
  dateStr,
  setDateStr,
  setTimeStr,
  publicSlotDateStr,
  setPublicSlotDateStr,
  setPublicSlotTimeStr,
  bookingFormOpen,
  setFormError,
  setBookingFormLoading,
  bookingFormLoadingTimerRef,
}: UsePublicBookingTimeAndFormEffectsParams) => {
  useEffect(() => {
    const previousDayStr = previousDayStrRef.current;
    if (currentDayStr === previousDayStr) return;

    if (dateStr === previousDayStr) {
      setDateStr(currentDayStr);
      setTimeStr(getDefaultTimeStr());
    }
    if (publicSlotDateStr === previousDayStr) {
      setPublicSlotDateStr(currentDayStr);
      setPublicSlotTimeStr(getDefaultTimeStr());
    }

    previousDayStrRef.current = currentDayStr;
  }, [
    currentDayStr,
    dateStr,
    publicSlotDateStr,
    previousDayStrRef,
    setDateStr,
    setTimeStr,
    setPublicSlotDateStr,
    setPublicSlotTimeStr,
  ]);

  useEffect(() => {
    if (!bookingFormOpen) return;
    setFormError(null);
    setBookingFormLoading(true);
    setTimeStr(getDefaultTimeStr());
    if (bookingFormLoadingTimerRef.current) clearTimeout(bookingFormLoadingTimerRef.current);
    bookingFormLoadingTimerRef.current = setTimeout(() => {
      setBookingFormLoading(false);
    }, 250);
    return () => {
      if (bookingFormLoadingTimerRef.current) {
        clearTimeout(bookingFormLoadingTimerRef.current);
        bookingFormLoadingTimerRef.current = null;
      }
    };
  }, [
    bookingFormOpen,
    setFormError,
    setBookingFormLoading,
    setTimeStr,
    bookingFormLoadingTimerRef,
  ]);
};
