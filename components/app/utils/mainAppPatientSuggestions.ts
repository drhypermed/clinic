import type { PatientRecord } from '../../../types';
import type { BasicPatientSuggestion } from '../../consultation/PatientInfoSection';

const toPositiveFileNumber = (value: unknown): number | undefined => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return Math.floor(parsed);
};

export const buildBasicPatientSuggestions = (records: PatientRecord[]): BasicPatientSuggestion[] => {
  const buildAgeText = (years?: string, months?: string, days?: string) => {
    const parts: string[] = [];
    if (years && years !== '0') parts.push(`${years} سنة`);
    if (months && months !== '0') parts.push(`${months} شهر`);
    if (days && days !== '0') parts.push(`${days} يوم`);
    return parts.join(' - ') || undefined;
  };

  const groups = new Map<string, PatientRecord[]>();
  records.forEach((record) => {
    const name = (record.patientName || '').trim();
    const phoneValue = (record.phone || '').trim();
    if (!name && !phoneValue) return;
    const key = `${name}|${phoneValue}`;
    const list = groups.get(key) || [];
    list.push(record);
    groups.set(key, list);
  });

  const suggestions: BasicPatientSuggestion[] = [];
  groups.forEach((list) => {
    const sorted = [...list].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    const latest = sorted[0];

    const lastExamDate = sorted
      .filter((item) => !item.isConsultationOnly)
      .map((item) => item.date)
      .filter(Boolean)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

    const lastConsultationDate = sorted
      .map((item) => item.isConsultationOnly ? item.date : item.consultation?.date)
      .filter((value): value is string => !!value)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

    // نختار أحدث قياس وزن/طول متاح من السجلات (حتى لو السجل الأحدث فاضي القياسات)
    const firstWithWeight = sorted.find((item) => String(item.weight || '').trim());
    const firstWithHeight = sorted.find((item) => String(item.height || '').trim());
    // أحدث gender/dateOfBirth متاحين — ثابتان، ما يتغيروش بين سجلات نفس المريض
    const genderFromRecords = sorted.map((item) => item.gender).find((value) => Boolean(value));

    suggestions.push({
      id: latest.id,
      patientName: latest.patientName,
      phone: latest.phone,
      ageYears: latest.age?.years || '',
      ageMonths: latest.age?.months || '',
      ageDays: latest.age?.days || '',
      ageText: buildAgeText(latest.age?.years, latest.age?.months, latest.age?.days),
      lastExamDate,
      lastConsultationDate,
      patientFileNumber:
        toPositiveFileNumber(latest.patientFileNumber)
        ?? sorted.map((item) => toPositiveFileNumber(item.patientFileNumber)).find((value) => Boolean(value)),
      // آخر وزن/طول متاح — يُستخدم لجلبهم تلقائياً في الاستشارة
      lastWeight: String(firstWithWeight?.weight || '').trim() || undefined,
      lastHeight: String(firstWithHeight?.height || '').trim() || undefined,
      // الهوية الثابتة — للـ auto-fill عند اختيار المريض
      gender: genderFromRecords,
    });
  });

  return suggestions
    .sort((a, b) => {
      const aTime = new Date(a.lastExamDate || a.lastConsultationDate || 0).getTime();
      const bTime = new Date(b.lastExamDate || b.lastConsultationDate || 0).getTime();
      return bTime - aTime;
    });
};

