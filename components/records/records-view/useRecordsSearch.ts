/**
 * useRecordsSearch:
 * hook البحث داخل السجلات الطبية:
 * - يفلتر السجلات عميقاً في كل الحقول (اسم، هاتف، تشخيص، أدوية، تعليمات).
 * - يبني قائمة اقتراحات autocomplete بحد أقصى 8 عنصر (3 رقم ملف + 6 نصوص).
 */
import { useMemo, useState } from 'react';
import type { PatientRecord } from '../../../types';

export interface SearchSuggestion {
  value: string;
  isFileNumber: boolean;
}

export function useRecordsSearch(records: PatientRecord[]) {
  const [searchTerm, setSearchTerm] = useState('');

  // نتائج البحث العميقة — نطابق نص البحث داخل كل حقل نصي ممكن
  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return records.filter((rec) => {
      const allRx = [...(rec.rxItems || []), ...(rec.consultation?.rxItems || [])];
      return (
        rec.patientName.toLowerCase().includes(term) ||
        String(rec.patientFileNumber || '').includes(term) ||
        (rec.phone || '').toLowerCase().includes(term) ||
        (rec.insuranceMembershipId || '').toLowerCase().includes(term) ||
        (rec.insuranceApprovalCode || '').toLowerCase().includes(term) ||
        rec.date.includes(term) ||
        (rec.complaintAr || '').toLowerCase().includes(term) ||
        (rec.historyAr || '').toLowerCase().includes(term) ||
        (rec.examAr || '').toLowerCase().includes(term) ||
        (rec.investigationsAr || '').toLowerCase().includes(term) ||
        (rec.complaintEn || '').toLowerCase().includes(term) ||
        (rec.historyEn || '').toLowerCase().includes(term) ||
        (rec.examEn || '').toLowerCase().includes(term) ||
        (rec.investigationsEn || '').toLowerCase().includes(term) ||
        (rec.diagnosisEn || '').toLowerCase().includes(term) ||
        (rec.consultation?.complaintAr || '').toLowerCase().includes(term) ||
        (rec.consultation?.historyAr || '').toLowerCase().includes(term) ||
        (rec.consultation?.examAr || '').toLowerCase().includes(term) ||
        (rec.consultation?.investigationsAr || '').toLowerCase().includes(term) ||
        (rec.consultation?.complaintEn || '').toLowerCase().includes(term) ||
        (rec.consultation?.historyEn || '').toLowerCase().includes(term) ||
        (rec.consultation?.examEn || '').toLowerCase().includes(term) ||
        (rec.consultation?.investigationsEn || '').toLowerCase().includes(term) ||
        (rec.consultation?.diagnosisEn || '').toLowerCase().includes(term) ||
        allRx.some(
          (i) =>
            (i.medication?.name || '').toLowerCase().includes(term) ||
            (i.instructions || '').toLowerCase().includes(term),
        )
      );
    });
  }, [records, searchTerm]);

  // اقتراحات الـ autocomplete — لا تظهر قبل حرفين + حد 8 عنصر
  const suggestions = useMemo<SearchSuggestion[]>(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    const term = searchTerm.toLowerCase();
    const textSet = new Set<string>();
    const fileNumSet = new Set<string>();
    const add = (v?: string) => {
      if (v && v.toLowerCase().includes(term)) textSet.add(v);
    };
    records.forEach((r) => {
      add(r.complaintAr);
      add(r.historyAr);
      add(r.examAr);
      add(r.investigationsAr);
      add(r.patientName);
      add(r.diagnosisEn);
      add(r.complaintEn);
      add(r.historyEn);
      add(r.examEn);
      add(r.investigationsEn);
      add(r.insuranceMembershipId);
      add(r.insuranceApprovalCode);
      add(r.consultation?.complaintAr);
      add(r.consultation?.historyAr);
      add(r.consultation?.examAr);
      add(r.consultation?.investigationsAr);
      add(r.consultation?.diagnosisEn);
      add(r.consultation?.complaintEn);
      add(r.consultation?.historyEn);
      add(r.consultation?.examEn);
      add(r.consultation?.investigationsEn);
      const fNum = String(r.patientFileNumber || '');
      if (fNum && fNum.includes(term)) fileNumSet.add(fNum);
    });
    return [
      ...Array.from(fileNumSet)
        .slice(0, 3)
        .map((v) => ({ value: v, isFileNumber: true })),
      ...Array.from(textSet)
        .slice(0, 6)
        .map((v) => ({ value: v, isFileNumber: false })),
    ].slice(0, 8);
  }, [records, searchTerm]);

  return { searchTerm, setSearchTerm, filtered, suggestions };
}
