import { useMemo } from 'react';
import type { ClinicAppointment } from '../../../types';
import { buildCairoDateTime, formatUserDate } from '../../../utils/cairoTime';
import { currentTimeMin, toLocalDateStr } from '../utils';
import {
  groupCompletedAppointments,
  groupPendingAppointments,
} from './helpers';

/**
 * الملف: useAppointmentsDerivedData.ts (Hook)
 * الوصف: هذا الـ Hook هو "المحرك التحليلي" لشاشة المواعيد. 
 * يقوم باستقبال قائمة المواعيد الخام من قاعدة البيانات، ثم يجري عليها عمليات: 
 * - الترتيب الزمني الدقيق (من الأقدم للأحدث). 
 * - التصنيف (منتظر / مكتمل). 
 * - حساب الإحصائيات (كم مريض اليوم؟ كم مريض تم الكشف عليه هذا الشهر؟). 
 * هذا يسهل عمل المكونات المرئية التي تكتفي بعرض النتائج الجاهزة.
 */

interface UseAppointmentsDerivedDataArgs {
  appointments: ClinicAppointment[];
  currentDayStr: string;                // التاريخ الحالي للعيادة
  dateStr: string;                      // التاريخ المختار في النموذج
}

export const useAppointmentsDerivedData = ({
  appointments,
  currentDayStr,
  dateStr,
}: UseAppointmentsDerivedDataArgs) => {
  // 1. فرز القائمة الكلية زمنياً من الأقدم للأحدث
  const sortedList = useMemo(
    () => [...appointments].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()),
    [appointments]
  );

  // الفلترة: المنتظرة (التي لم يتم الكشف عليها) والمكتملة (تم الكشف عليها)
  const pendingList = useMemo(() => sortedList.filter((a) => !a.examCompletedAt), [sortedList]);
  
  /** 
   * المواعيد المكتملة (Completed List). 
   * يتم ترتيب المكتملين تنازلياً (الأحدث كشفاً في الأعلى) 
   * ليسهل على الطبيب مراجعة آخر حالة انتهى منها.
   */
  const completedList = useMemo(
    () => {
      // عرض المنفذة آخر 3 شهور فقط — البيانات الأقدم تُحذف من السحابة تلقائياً
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return [...sortedList]
        .filter((a) => !!a.examCompletedAt && new Date(a.examCompletedAt) >= threeMonthsAgo)
        .sort((a, b) => (b.examCompletedAt || '').localeCompare(a.examCompletedAt || ''));
    },
    [sortedList]
  );

  const now = Date.now();
  const todayStr = currentDayStr;
  
  // تحديد الحد الأدنى للوقت (فقط إذا كان التاريخ المختار هو اليوم)
  const timeMin = dateStr === todayStr ? currentTimeMin() : undefined;

  // توليد بيانات التاريخ للترويسة (مثلاً: الأحد - 25 مارس)
  const todayDateMeta = useMemo(() => {
    const dateObj = buildCairoDateTime(todayStr, '12:00');
    return {
      dayName: formatUserDate(dateObj, { weekday: 'long' }, 'ar-EG'),
      fullDate: formatUserDate(dateObj, { day: 'numeric', month: 'long', year: 'numeric' }, 'ar-EG-u-nu-latn'),
    };
  }, [todayStr]);

  // تقسيم المواعيد المنتظرة إلى مجموعات يومية
  const { todayPending, futurePendingGroups } = useMemo(
    () => groupPendingAppointments(pendingList, todayStr),
    [pendingList, todayStr]
  );

  // تجميع المواعيد المكتملة حسب اليوم
  const completedGroups = useMemo(() => groupCompletedAppointments(completedList), [completedList]);

  // حساب الإحصائيات الشهرية واليومية
  const lastMonthMs = 30 * 24 * 60 * 60 * 1000;
  
  const completedInLastMonth = useMemo(() => 
    sortedList.filter(a => a.examCompletedAt && new Date(a.examCompletedAt).getTime() >= now - lastMonthMs).length
  , [sortedList, now]);

  const bookedInLastMonth = useMemo(() => 
    sortedList.filter(a => {
      const t = new Date(a.createdAt || a.dateTime).getTime();
      return t >= now - lastMonthMs && t <= now;
    }).length
  , [sortedList, now]);

  const todayCount = useMemo(() =>
    sortedList.filter(a => !a.examCompletedAt && toLocalDateStr(new Date(a.dateTime)) === todayStr).length
  , [sortedList, todayStr]);

  const upcomingCount = useMemo(() => 
    sortedList.filter(a => new Date(a.dateTime).getTime() > now).length
  , [sortedList, now]);

  return {
    sortedList, now, todayStr, timeMin, todayDateMeta, todayPending,
    futurePendingGroups, completedGroups, completedInLastMonth,
    bookedInLastMonth, todayCount, upcomingCount,
  };
};
