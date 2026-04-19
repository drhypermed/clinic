import type { ClinicAppointment, PatientRecord } from '../../../types';
import { normalizeText } from '../../../utils/textEncoding';

const normalizeName = (value: string) =>
  normalizeText(value)
    .toLocaleLowerCase()
    .normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670]/g, '') // إزالة التشكيل
    .replace(/\u0640/g, '')               // إزالة الكشيدة
    .replace(/[إأآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ئ/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')                  // توحيد المسافات
    .trim();

const normalizePhone = (value?: string) => (value || '').replace(/\D/g, '');

const pickLatestPreferred = (list: PatientRecord[]) => {
  const withoutConsultation = list.filter((rec) => !rec.consultation);
  const pool = withoutConsultation.length > 0 ? withoutConsultation : list;
  return [...pool].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())[0];
};

const fuzzyNameScore = (targetName: string, candidateName: string): number => {
  if (!targetName || !candidateName) return 0;
  if (targetName === candidateName) return 100;
  if (candidateName.includes(targetName) || targetName.includes(candidateName)) return 80;
  const targetTokens = targetName.split(' ').filter(Boolean);
  const candidateTokens = candidateName.split(' ').filter(Boolean);
  if (!targetTokens.length || !candidateTokens.length) return 0;
  const overlap = targetTokens.filter((token) => candidateTokens.includes(token)).length;
  if (!overlap) return 0;
  return 40 + overlap * 10;
};

export const resolveConsultationRecordForAppointment = (
  appointment: ClinicAppointment,
  appointments: ClinicAppointment[],
  records: PatientRecord[]
): PatientRecord | undefined => {
  const sourceApt = appointment.consultationSourceAppointmentId
    ? appointments.find((item) => item.id === appointment.consultationSourceAppointmentId)
    : undefined;

  const baseName = sourceApt?.patientName || appointment.patientName || '';
  const basePhone = sourceApt?.phone || appointment.phone || '';
  
  const exactRecord = appointment.consultationSourceRecordId
    ? records.find((rec) => rec.id === appointment.consultationSourceRecordId)
    : undefined;

  if (exactRecord) return exactRecord;

  const targetPhone = normalizePhone(basePhone);
  if (targetPhone) {
    const byPhone = records.filter((rec) => !rec.isConsultationOnly && normalizePhone(rec.phone) === targetPhone);
    const bestByPhone = pickLatestPreferred(byPhone);
    if (bestByPhone) return bestByPhone;
  }

  const targetName = normalizeName(baseName);
  if (!targetName) return undefined;
  const exactByName = records.filter((rec) => !rec.isConsultationOnly && normalizeName(rec.patientName || '') === targetName);
  const bestExactByName = pickLatestPreferred(exactByName);
  if (bestExactByName) return bestExactByName;

  const fuzzyByName = records
    .filter((rec) => !rec.isConsultationOnly)
    .map((rec) => ({ rec, score: fuzzyNameScore(targetName, normalizeName(rec.patientName || '')) }))
    .filter((item) => item.score >= 60) // قبول التشابه بنسبة 60% فأكثر
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.rec.date || 0).getTime() - new Date(a.rec.date || 0).getTime();
    })
    .map((item) => item.rec);

  return pickLatestPreferred(fuzzyByName);
};

