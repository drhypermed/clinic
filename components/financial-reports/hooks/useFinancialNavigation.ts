/**
 * هوك التنقل بين الأيام والشهور
 * يدير حالة التاريخ المحدد والتنقل بينهما
 * 
 * Hook for navigating between days and months
 * Manages selected date state and navigation between them
 */

import { useState, useCallback, useMemo } from 'react';
import { formatDateKey, formatMonthKey, formatMonthLabel, formatDayLabel } from '../utils/formatters';

// ─────────────────────────────────────────────────────────────────────────────
// الهوك الرئيسي | Main Hook
// ─────────────────────────────────────────────────────────────────────────────

interface UseFinancialNavigationReturn {
    // الشهر المحدد
    selectedDate: Date;
    selectedMonthKey: string;
    monthLabel: string;
    isCurrentMonth: boolean;

    // اليوم المحدد
    selectedDay: Date;
    selectedDayKey: string;
    formattedSelectedDay: string;
    currentDateKey: string;

    // حدود الشهر
    startOfMonth: Date;
    endOfMonth: Date;

    // التنقل بين الشهور
    prevMonth: () => void;
    nextMonth: () => void;

    // التنقل بين الأيام
    prevDay: () => void;
    nextDay: () => void;

    // تحديد يوم معين
    setSelectedDay: (date: Date) => void;

    // القفز المباشر عبر المنتقي الذكي
    jumpToYearMonth: (year: number, month: number) => void;
    setDayFromString: (dateStr: string) => void;
}

/**
 * هوك التنقل بين الأيام والشهور
 * 
 * يقوم بـ:
 * 1. إدارة الشهر واليوم المحدد
 * 2. توفير دوال التنقل (السابق/التالي)
 * 3. مزامنة الشهر تلقائياً عند تجاوز حدود الشهر
 * 4. حساب حدود الشهر للتصفية
 */
export const useFinancialNavigation = (): UseFinancialNavigationReturn => {

    // ─────────────────────────────────────────────────────────────────────────
    // الحالة | State
    // ─────────────────────────────────────────────────────────────────────────

    /** الشهر المحدد (افتراضي: الشهر الحالي) */
    const [selectedDate, setSelectedDate] = useState(new Date());

    /** اليوم المحدد (افتراضي: اليوم) */
    const [selectedDay, setSelectedDay] = useState(new Date());

    // ─────────────────────────────────────────────────────────────────────────
    // المفاتيح المحسوبة | Computed Keys
    // ─────────────────────────────────────────────────────────────────────────

    /** مفتاح الشهر المحدد (YYYY-MM) */
    const selectedMonthKey = useMemo(() => formatMonthKey(selectedDate), [selectedDate]);

    /** مفتاح اليوم المحدد (YYYY-MM-DD) */
    const selectedDayKey = useMemo(() => formatDateKey(selectedDay), [selectedDay]);

    /** مفتاح اليوم الحالي (YYYY-MM-DD) */
    const currentDateKey = useMemo(() => formatDateKey(new Date()), []);

    // ─────────────────────────────────────────────────────────────────────────
    // التسميات المنسقة | Formatted Labels
    // ─────────────────────────────────────────────────────────────────────────

    /** اسم الشهر بالعربية */
    const monthLabel = useMemo(() => formatMonthLabel(selectedDate), [selectedDate]);

    /** اليوم المحدد منسق بالعربية */
    const formattedSelectedDay = useMemo(() => formatDayLabel(selectedDay), [selectedDay]);

    /** هل الشهر المحدد هو الشهر الحالي؟ */
    const isCurrentMonth = useMemo(() => {
        const now = new Date();
        return now.getMonth() === selectedDate.getMonth() &&
            now.getFullYear() === selectedDate.getFullYear();
    }, [selectedDate]);

    // ─────────────────────────────────────────────────────────────────────────
    // حدود الشهر | Month Boundaries
    // ─────────────────────────────────────────────────────────────────────────

    /** بداية الشهر المحدد */
    const startOfMonth = useMemo(() =>
        new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
        [selectedDate]
    );

    /** نهاية الشهر المحدد */
    const endOfMonth = useMemo(() =>
        new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59, 999),
        [selectedDate]
    );

    // ─────────────────────────────────────────────────────────────────────────
    // التنقل بين الشهور | Month Navigation
    // ─────────────────────────────────────────────────────────────────────────

    /** الانتقال للشهر السابق */
    const prevMonth = useCallback(() => {
        setSelectedDate(prev => {
            const d = new Date(prev);
            d.setMonth(d.getMonth() - 1);
            return d;
        });
    }, []);

    /** الانتقال للشهر التالي (معطل إذا كان الشهر الحالي) */
    const nextMonth = useCallback(() => {
        if (isCurrentMonth) return;
        setSelectedDate(prev => {
            const d = new Date(prev);
            d.setMonth(d.getMonth() + 1);
            return d;
        });
    }, [isCurrentMonth]);

    // ─────────────────────────────────────────────────────────────────────────
    // التنقل بين الأيام | Day Navigation
    // ─────────────────────────────────────────────────────────────────────────

    /** الانتقال لليوم السابق */
    const prevDay = useCallback(() => {
        setSelectedDay(prev => {
            const d = new Date(prev);
            d.setDate(d.getDate() - 1);

            // مزامنة الشهر إذا تجاوزنا حدود الشهر الحالي
            if (d.getMonth() !== selectedDate.getMonth() || d.getFullYear() !== selectedDate.getFullYear()) {
                setSelectedDate(new Date(d));
            }

            return d;
        });
    }, [selectedDate]);

    /** الانتقال لليوم التالي */
    const nextDay = useCallback(() => {
        setSelectedDay(prev => {
            const d = new Date(prev);
            d.setDate(d.getDate() + 1);

            // مزامنة الشهر إذا تجاوزنا حدود الشهر الحالي
            if (d.getMonth() !== selectedDate.getMonth() || d.getFullYear() !== selectedDate.getFullYear()) {
                setSelectedDate(new Date(d));
            }

            return d;
        });
    }, [selectedDate]);

    /** تحديد يوم معين (من التقويم) */
    const handleSetSelectedDay = useCallback((date: Date) => {
        setSelectedDay(date);
    }, []);

    /** القفز مباشرة إلى شهر وسنة محددة عبر منتقي ذكي */
    const jumpToYearMonth = useCallback((year: number, month: number) => {
        const d = new Date(year, month, 1);
        setSelectedDate(d);
        setSelectedDay(d);
    }, []);

    /** تحديد يوم من نص (YYYY-MM-DD) - للاستخدام مع منتقي التاريخ الذكي */
    const setDayFromString = useCallback((dateStr: string) => {
        if (!dateStr) return;
        const d = new Date(dateStr + 'T12:00:00');
        if (isNaN(d.getTime())) return;
        setSelectedDay(d);
        setSelectedDate(new Date(d.getFullYear(), d.getMonth(), 1));
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // القيم المرجعة | Return Values
    // ─────────────────────────────────────────────────────────────────────────

    return {
        selectedDate,
        selectedMonthKey,
        monthLabel,
        isCurrentMonth,
        selectedDay,
        selectedDayKey,
        formattedSelectedDay,
        currentDateKey,
        startOfMonth,
        endOfMonth,
        prevMonth,
        nextMonth,
        prevDay,
        nextDay,
        setSelectedDay: handleSetSelectedDay,
        jumpToYearMonth,
        setDayFromString,
    };
};
