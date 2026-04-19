/**
 * useRecordsTimeline:
 * hook لبناء الخط الزمني (Timeline) للسجلات الطبية:
 * - يفصل الكشف (exam) عن الاستشارة (consultation) كزيارتين منفصلتين.
 * - يرقّم الاستشارات لكل مريض (1, 2, 3...).
 * - يطبّق فلاتر التاريخ ويرتّب تنازلياً أو تصاعدياً.
 * - يجمّع الزيارات حسب اليوم ويحسب الإحصائيات اليومية/الشهرية.
 */
import { useMemo } from 'react';
import type { PatientRecord } from '../../../types';
import { toDateOnly, type RecordTimelineEntry } from '../recordsViewParts';
import {
  applyConsultationSequence,
  buildPatientTimelineKey,
  isTimelineEntryWithinDateFilters,
  normalizeDateRange,
  type TimelineDateFilterMode,
  type TimelineSortOrder,
} from './helpers';

interface HookArgs {
  records: PatientRecord[];
  filtered: PatientRecord[];
  timelineSortOrder: TimelineSortOrder;
  dateFilterMode: TimelineDateFilterMode;
  singleDayFilterDate: string;
  rangeStartDate: string;
  rangeEndDate: string;
  todayStr: string;
  firstDayOfMonthStr: string;
}

/** تحويل السجلات إلى زيارات منفصلة (كشف/استشارة) مع تاريخ كل زيارة الحقيقي */
function buildTimelineEntries(
  sourceRecords: PatientRecord[],
  examDatesByRecordId: Map<string, string>,
  sortOrder: TimelineSortOrder,
): RecordTimelineEntry[] {
  const entries: RecordTimelineEntry[] = [];

  sourceRecords.forEach((rec) => {
    // الكشف — يُضاف كزيارة مستقلة
    if (!rec.isConsultationOnly) {
      entries.push({
        entryId: `${rec.id}:exam`,
        visitType: 'exam',
        date: rec.date,
        record: rec,
      });
    }

    // استشارة مستقلة (بدون كشف) — تُضاف كزيارة مستقلة
    if (rec.isConsultationOnly) {
      entries.push({
        entryId: `${rec.id}:consultation`,
        visitType: 'consultation',
        date: rec.date,
        sourceExamDate:
          rec.sourceExamDate ||
          (rec.sourceExamRecordId
            ? examDatesByRecordId.get(rec.sourceExamRecordId)
            : undefined),
        record: rec,
      });
      return;
    }

    // استشارة مرتبطة بكشف — تُضاف بتاريخ الاستشارة الحقيقي
    if (rec.consultation?.date && !rec.consultationRecordId) {
      entries.push({
        entryId: `${rec.id}:consultation`,
        visitType: 'consultation',
        date: rec.consultation.date,
        sourceExamDate: rec.date,
        record: rec,
      });
    }
  });

  return entries.sort((a, b) => {
    const leftTs = new Date(a.date).getTime();
    const rightTs = new Date(b.date).getTime();
    return sortOrder === 'newestToOldest' ? rightTs - leftTs : leftTs - rightTs;
  });
}

export function useRecordsTimeline({
  records,
  filtered,
  timelineSortOrder,
  dateFilterMode,
  singleDayFilterDate,
  rangeStartDate,
  rangeEndDate,
  todayStr,
  firstDayOfMonthStr,
}: HookArgs) {
  // تطبيع حدود النطاق (نضمن from ≤ to)
  const normalizedRange = useMemo(
    () => normalizeDateRange(rangeStartDate, rangeEndDate),
    [rangeStartDate, rangeEndDate],
  );

  // خريطة تاريخ الكشف لكل recordId — تُستخدم لاستنتاج sourceExamDate للاستشارة المستقلة
  const examDatesByRecordId = useMemo(() => {
    const map = new Map<string, string>();
    records.forEach((record) => {
      if (!record.isConsultationOnly) {
        map.set(record.id, record.date);
      }
    });
    return map;
  }, [records]);

  // كل الزيارات (بدون فلاتر) — لإحصائيات اليوم والشهر + ترقيم الاستشارات
  const allTimelineEntriesBase = useMemo<RecordTimelineEntry[]>(
    () => buildTimelineEntries(records, examDatesByRecordId, 'newestToOldest'),
    [records, examDatesByRecordId],
  );

  // ترقيم الاستشارات تصاعدياً لكل مريض (consultation #1, #2, ...)
  const consultationSequenceByEntryId = useMemo(() => {
    const sequenceMap = new Map<string, number>();
    const patientConsultationCounter = new Map<string, number>();

    const sortedConsultationEntries = [...allTimelineEntriesBase]
      .filter((entry) => entry.visitType === 'consultation')
      .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());

    sortedConsultationEntries.forEach((entry) => {
      const patientKey = buildPatientTimelineKey(entry.record);
      const nextSequence = (patientConsultationCounter.get(patientKey) || 0) + 1;
      patientConsultationCounter.set(patientKey, nextSequence);
      sequenceMap.set(entry.entryId, nextSequence);
    });

    return sequenceMap;
  }, [allTimelineEntriesBase]);

  const allTimelineEntries = useMemo<RecordTimelineEntry[]>(
    () => applyConsultationSequence(allTimelineEntriesBase, consultationSequenceByEntryId),
    [allTimelineEntriesBase, consultationSequenceByEntryId],
  );

  // الخط الزمني بعد فلترة البحث + الترتيب المختار
  const timelineEntriesBase = useMemo<RecordTimelineEntry[]>(
    () => buildTimelineEntries(filtered, examDatesByRecordId, timelineSortOrder),
    [filtered, examDatesByRecordId, timelineSortOrder],
  );

  // تطبيق فلاتر التاريخ (كل التواريخ / يوم واحد / نطاق)
  const timelineEntriesDateFilteredBase = useMemo<RecordTimelineEntry[]>(() => {
    return timelineEntriesBase.filter((entry) => {
      const entryDate = toDateOnly(entry.date);
      return isTimelineEntryWithinDateFilters(
        entryDate,
        dateFilterMode,
        singleDayFilterDate,
        normalizedRange.from,
        normalizedRange.to,
      );
    });
  }, [
    timelineEntriesBase,
    dateFilterMode,
    singleDayFilterDate,
    normalizedRange.from,
    normalizedRange.to,
  ]);

  const timelineEntries = useMemo<RecordTimelineEntry[]>(
    () =>
      applyConsultationSequence(timelineEntriesDateFilteredBase, consultationSequenceByEntryId),
    [timelineEntriesDateFilteredBase, consultationSequenceByEntryId],
  );

  // إحصائيات اليوم والشهر (كشوفات/استشارات)
  const stats = useMemo(() => {
    let examsToday = 0;
    let consultationsToday = 0;
    let examsThisMonth = 0;
    let consultationsThisMonth = 0;

    allTimelineEntries.forEach((entry) => {
      const entryDate = toDateOnly(entry.date);
      const inToday = entryDate === todayStr;
      const inMonth = entryDate >= firstDayOfMonthStr && entryDate <= todayStr;

      if (entry.visitType === 'exam') {
        if (inToday) examsToday += 1;
        if (inMonth) examsThisMonth += 1;
        return;
      }

      if (inToday) consultationsToday += 1;
      if (inMonth) consultationsThisMonth += 1;
    });

    return {
      examsToday,
      consultationsToday,
      examsThisMonth,
      consultationsThisMonth,
      totalThisMonth: examsThisMonth + consultationsThisMonth,
    };
  }, [allTimelineEntries, todayStr, firstDayOfMonthStr]);

  // تجميع الزيارات حسب اليوم — كل يوم له list مفرزة حسب الترتيب المختار
  const grouped = useMemo(() => {
    const groups: Record<string, RecordTimelineEntry[]> = {};

    timelineEntries.forEach((entry) => {
      const key = toDateOnly(entry.date);
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
    });

    Object.values(groups).forEach((dayEntries) => {
      dayEntries.sort((a, b) => {
        const leftTs = new Date(a.date).getTime();
        const rightTs = new Date(b.date).getTime();
        return timelineSortOrder === 'newestToOldest' ? rightTs - leftTs : leftTs - rightTs;
      });
    });

    return Object.entries(groups).sort((a, b) => {
      return timelineSortOrder === 'newestToOldest'
        ? b[0].localeCompare(a[0])
        : a[0].localeCompare(b[0]);
    });
  }, [timelineEntries, timelineSortOrder]);

  return { normalizedRange, stats, grouped };
}
