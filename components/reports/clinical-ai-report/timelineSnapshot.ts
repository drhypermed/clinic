import { extractVisitContent, formatPatientFileDateLabel } from '../../patient-files/patientFilesShared';
import type { PatientFileData } from '../../patient-files/patientFilesShared';

import type {
  ClinicalReportLanguage,
  ClinicalVisitSnapshot,
  PatientAgeSnapshot,
  PatientClinicalTimelineSnapshot,
} from './types';

const toText = (value: unknown): string => String(value ?? '').trim();

const toTimestamp = (value?: string): number => {
  const parsed = Date.parse(String(value || ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const uniqueNonEmpty = (values: string[]): string[] => {
  const seen = new Set<string>();
  const output: string[] = [];

  values.forEach((value) => {
    const normalized = toText(value);
    if (!normalized) return;
    if (seen.has(normalized)) return;
    seen.add(normalized);
    output.push(normalized);
  });

  return output;
};

const pickLocalizedText = (
  language: ClinicalReportLanguage,
  arabicValue?: string,
  englishValue?: string,
): string => {
  const ar = toText(arabicValue);
  const en = toText(englishValue);

  if (language === 'ar') {
    return ar || en;
  }

  return en || ar;
};

const normalizeAge = (age?: { years?: unknown; months?: unknown; days?: unknown }): PatientAgeSnapshot => {
  return {
    years: toText(age?.years) || '0',
    months: toText(age?.months) || '0',
    days: toText(age?.days) || '0',
  };
};

/** هل القيمة صفرية فعلاً (فاضي، 0، أو أصفار مكررة)؟ — نستخدمها لحذف الأجزاء الصفرية من نص العمر */
const isZeroAgePart = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) return true;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed === 0;
};

/** بناء نص العمر بالعربي مع تجاهل الأجزاء الصفرية */
const buildAgeTextAr = (age: PatientAgeSnapshot): string => {
  const parts: string[] = [];
  if (!isZeroAgePart(age.years)) parts.push(`${age.years} سنة`);
  if (!isZeroAgePart(age.months)) parts.push(`${age.months} شهر`);
  if (!isZeroAgePart(age.days)) parts.push(`${age.days} يوم`);
  return parts.join(' - ') || '0 يوم';
};

/** بناء نص العمر بالإنجليزي مع تجاهل الأجزاء الصفرية */
const buildAgeTextEn = (age: PatientAgeSnapshot): string => {
  const parts: string[] = [];
  if (!isZeroAgePart(age.years)) parts.push(`${age.years}y`);
  if (!isZeroAgePart(age.months)) parts.push(`${age.months}m`);
  if (!isZeroAgePart(age.days)) parts.push(`${age.days}d`);
  return parts.join(' ') || '0d';
};

/**
 * تحويل اسم المريض العربي إلى حروف لاتينية (Romanization)
 *
 * خريطة تقريبية تتعامل مع التوحيدات الشائعة للهمزات والألف المقصورة والتاء
 * المربوطة. الاسم الناتج قابل للقراءة بإنجليزي وإن كانت الترجمة الصوتية
 * تختلف باختلاف اللهجات — الغرض هنا دعم التقرير الإنجليزي.
 */
const ARABIC_TRANSLITERATION_MAP: Record<string, string> = {
  '\u0627': 'a',
  '\u0623': 'a',
  '\u0625': 'i',
  '\u0622': 'aa',
  '\u0671': 'a',
  '\u0628': 'b',
  '\u062a': 't',
  '\u062b': 'th',
  '\u062c': 'j',
  '\u062d': 'h',
  '\u062e': 'kh',
  '\u062f': 'd',
  '\u0630': 'dh',
  '\u0631': 'r',
  '\u0632': 'z',
  '\u0633': 's',
  '\u0634': 'sh',
  '\u0635': 's',
  '\u0636': 'd',
  '\u0637': 't',
  '\u0638': 'z',
  '\u0639': 'a',
  '\u063a': 'gh',
  '\u0641': 'f',
  '\u0642': 'q',
  '\u0643': 'k',
  '\u0644': 'l',
  '\u0645': 'm',
  '\u0646': 'n',
  '\u0647': 'h',
  '\u0629': 'a',
  '\u0648': 'w',
  '\u064a': 'y',
  '\u0649': 'a',
  '\u0626': 'i',
  '\u0624': 'u',
  '\u0621': '',
  '\u0640': '',
  '\u064b': '',
  '\u064c': '',
  '\u064d': '',
  '\u064e': '',
  '\u064f': '',
  '\u0650': '',
  '\u0651': '',
  '\u0652': '',
};

const transliterateArabicToEnglish = (value: string): string => {
  const raw = toText(value);
  if (!raw) return '';
  const latin = Array.from(raw)
    .map((ch) => {
      if (Object.prototype.hasOwnProperty.call(ARABIC_TRANSLITERATION_MAP, ch)) {
        return ARABIC_TRANSLITERATION_MAP[ch];
      }
      return ch;
    })
    .join('');

  return latin
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * نقرر اسم المريض المعروض في التقرير حسب اللغة. للإنجليزي نُحاول نحوّل الاسم
 * العربي لحروف لاتينية (إن كان اللي محفوظ عربي)، ولو الاسم أصلاً إنجليزي نسيبه زي ما هو.
 */
const ARABIC_LETTER_REGEX = /[\u0600-\u06FF]/;

const resolvePatientNameForReport = (
  name: string,
  language: ClinicalReportLanguage,
): string => {
  const trimmed = toText(name);
  if (!trimmed) return language === 'ar' ? 'مريض بدون اسم' : 'Unnamed Patient';
  if (language === 'ar') return trimmed;
  if (!ARABIC_LETTER_REGEX.test(trimmed)) return trimmed;
  return transliterateArabicToEnglish(trimmed) || trimmed;
};

const buildMedicationLines = (rxItems: Array<{ type?: string; medication?: { name?: string }; instructions?: string }>): string[] => {
  const lines: string[] = [];

  rxItems
    .filter((item) => item.type === 'medication')
    .forEach((item) => {
      const medName = toText(item.medication?.name);
      const instructions = toText(item.instructions);
      if (!medName && !instructions) return;
      if (medName && instructions) {
        lines.push(`${medName}: ${instructions}`);
        return;
      }
      lines.push(medName || instructions);
    });

  return uniqueNonEmpty(lines);
};

const buildLabsAndNotes = (
  rxItems: Array<{ type?: string; instructions?: string }>,
  labInvestigations: string[]
): string[] => {
  const notes = rxItems
    .filter((item) => item.type === 'note')
    .map((item) => toText(item.instructions));

  return uniqueNonEmpty([
    ...labInvestigations.map((item) => toText(item)),
    ...notes,
  ]);
};

const buildVisitSnapshot = (
  visit: PatientFileData['visits'][number],
  language: ClinicalReportLanguage,
): ClinicalVisitSnapshot => {
  const visitContent = extractVisitContent(visit);

  const localizedDiagnosis = pickLocalizedText(
    language,
    visitContent.diagnosisEn,
    visitContent.diagnosisEn,
  );

  const normalizedVitals = {
    bp: toText(visitContent.vitals?.bp) || undefined,
    pulse: toText(visitContent.vitals?.pulse) || undefined,
    temp: toText(visitContent.vitals?.temp) || undefined,
    rbs: toText(visitContent.vitals?.rbs) || undefined,
    spo2: toText(visitContent.vitals?.spo2) || undefined,
    rr: toText(visitContent.vitals?.rr) || undefined,
  };
  const hasVitals = Object.values(normalizedVitals).some(Boolean);

  return {
    id: visit.visitId,
    visitType: visit.type,
    visitDateIso: visit.date,
    visitDateLabel: formatPatientFileDateLabel(visit.date),
    sourceExamDateIso: toText(visit.sourceExamDate) || undefined,
    sourceExamDateLabel: visit.sourceExamDate ? formatPatientFileDateLabel(visit.sourceExamDate) : undefined,
    // نستخدم النسخة اللي اتحفظت بعد معالجة الذكاء الاصطناعي + تعديلات الطبيب (زي ما بيظهر في سجلات المرضى)
    complaint: toText(visitContent.complaintEn),
    history: toText(visitContent.historyEn),
    examination: toText(visitContent.examEn),
    investigations: toText(visitContent.investigationsEn),
    diagnosis: toText(localizedDiagnosis),
    medications: buildMedicationLines(visitContent.rxItems || []),
    advice: uniqueNonEmpty((visitContent.generalAdvice || []).map((item) => toText(item))),
    labsAndNotes: buildLabsAndNotes(visitContent.rxItems || [], visitContent.labInvestigations || []),
    vitals: hasVitals ? normalizedVitals : undefined,
    weight: toText(visit.record.weight) || undefined,
    height: toText(visit.record.height) || undefined,
    bmi: toText(visit.record.bmi) || undefined,
    attachments: [],
    paymentType: visitContent.paymentType,
  };
};

export const buildPatientClinicalTimelineSnapshot = (
  patientFile: PatientFileData,
  language: ClinicalReportLanguage,
): PatientClinicalTimelineSnapshot | null => {
  if (!patientFile) return null;

  const orderedVisits = [...(patientFile.visits || [])]
    .filter((visit) => toText(visit.date))
    .sort((left, right) => toTimestamp(left.date) - toTimestamp(right.date));

  if (orderedVisits.length === 0) return null;

  const latestVisitRecord = orderedVisits[orderedVisits.length - 1]?.record;
  const age = normalizeAge(latestVisitRecord?.age);

  const phoneCandidates = uniqueNonEmpty([
    ...(patientFile.phones || []),
    toText(latestVisitRecord?.phone),
  ]);

  return {
    patientName: resolvePatientNameForReport(toText(patientFile.name), language),
    patientFileNumber: patientFile.fileNumber,
    patientPhone: phoneCandidates[0],
    patientAge: age,
    patientAgeTextAr: buildAgeTextAr(age),
    patientAgeTextEn: buildAgeTextEn(age),
    visitCount: orderedVisits.length,
    examCount: Number(patientFile.examCount || 0),
    consultationCount: Number(patientFile.consultationCount || 0),
    visits: orderedVisits.map((visit) => buildVisitSnapshot(visit, language)),
  };
};
