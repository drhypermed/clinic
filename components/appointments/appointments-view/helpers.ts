import type { ClinicAppointment, PatientRecord } from '../../../types';
import type { BookingQuotaNoticeInfo, PatientSuggestionOption, RecentExamPatientOption } from '../add-appointment-form/types';
import { normalizeText } from '../../../utils/textEncoding';
import { toLocalDateStr } from '../utils';
import type { AppointmentDayGroup } from '../../../types';
import { sanitizeExternalHttpUrl } from './securityUtils';

/**
 * الملف: helpers.ts
 * الوصف: مجموعة من الوظائف المساعدة (Utilities) الخاصة بمدير المواعيد. 
 * تشمل هذه الوظائف: 
 * - معالجة النصوص والأسماء العربية (Normalization) للبحث الدقيق. 
 * - حساب درجات التشابه بين الأسماء (Fuzzy Matching). 
 * - التعامل مع أخطاء الـ Quota واستخراج روابط الواتساب. 
 * - ربط المواعيد الحالية بسجلات المرضى التاريخية بذكاء.
 */

/** بناء نص السن (سنوات - شهور - أيام) بشكل مقروء بالعربي */
const buildAgeTextFromParts = (years?: string, months?: string, days?: string) => {
  const parts: string[] = [];
  const y = (years || '').trim();
  const m = (months || '').trim();
  const d = (days || '').trim();
  if (y && y !== '0') parts.push(`${y} سنة`);
  if (m && m !== '0') parts.push(`${m} شهر`);
  if (d && d !== '0') parts.push(`${d} يوم`);
  return parts.join(' - ') || undefined;
};

const buildAgeTextFromRecordAge = (age?: { years: string; months: string; days: string }) => {
  if (!age) return undefined;
  return buildAgeTextFromParts(age.years, age.months, age.days);
};

/** بناء رابط واتساب من رقم هاتف ورسالة */
const buildWhatsAppUrlFromNumber = (number: string, message: string): string => {
  const digits = String(number || '').replace(/\D/g, '');
  if (!digits) return '';
  const text = encodeURIComponent(String(message || '').trim());
  return `https://wa.me/${digits}${text ? `?text=${text}` : ''}`;
};

/**
 * استخراج معلومات تنبيه الكوتا (Quota Notice) من أخطاء Cloud Functions.
 * يحدد ما إذا كانت العيادة قد تجاوزت الحد اليومي للحجوزات ويوفر رابطاً للتواصل.
 */
export const extractBookingQuotaNotice = (error: any): BookingQuotaNoticeInfo | null => {
  const code = String(error?.code || '').replace(/^functions\//, '');
  const message = String(error?.message || '');
  const isDailyLimit = code === 'resource-exhausted' || message.includes('BOOKING_DAILY_LIMIT_REACHED');
  if (!isDailyLimit) return null;

  const details = error?.details && typeof error.details === 'object' ? (error.details as Record<string, unknown>) : null;
  const limit = Number(details?.limit || 0);
  const withLimit = (template: string) => template.replace(/\{\s*limit\s*\}/gi, String(limit));
  
  const limitReachedMessage = withLimit(String(details?.limitReachedMessage || '').trim());
  const whatsappMessage = withLimit(String(details?.whatsappMessage || '').trim());
  const whatsappNumber = String(details?.whatsappNumber || '').trim();
  
  const generatedWhatsappUrl = buildWhatsAppUrlFromNumber(whatsappNumber, whatsappMessage || limitReachedMessage);
  const fallbackWhatsappUrl = sanitizeExternalHttpUrl(String(details?.whatsappUrl || '').trim());
  
  return {
    message: limitReachedMessage || 'تم استهلاك الحد اليومي للمواعيد.',
    whatsappUrl: generatedWhatsappUrl || fallbackWhatsappUrl,
    whatsappNumber,
  };
};

/** توحيد وتنظيف الأسماء العربية */
const normalizeName = (value: string) =>
  normalizeText(value)
    .toLocaleLowerCase()
    .normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/\u0640/g, '')
    .replace(/[إأآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ئ/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();

const normalizePhone = (value?: string) => (value || '').replace(/\D/g, '');

const toPositiveFileNumber = (value: unknown): number | undefined => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return Math.floor(parsed);
};

/** اختيار أفضل سجل (Record) للمريض لاستخدامه كمصدر للاستشارة (يفضل الكشوفات على الاستشارات) */
const getLatestPreferredRecordId = (items: PatientRecord[]): string | undefined => {
  if (!items.length) return undefined;
  const withoutConsultation = items.filter((rec) => !rec.consultation);
  const pool = withoutConsultation.length > 0 ? withoutConsultation : items;
  return [...pool].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())[0]?.id;
};

/** البحث عن آخر سجل مريض بواسطة رقم التليفون */
export const resolveLatestRecordIdByPhone = (records: PatientRecord[], phone?: string): string | undefined => {
  const targetPhone = normalizePhone(phone);
  if (!targetPhone) return undefined;
  const matches = records.filter((rec) => !rec.isConsultationOnly && normalizePhone(rec.phone) === targetPhone);
  return getLatestPreferredRecordId(matches);
};

/** 
 * حساب درجة التشابه بين اسمين (Fuzzy Name Score). 
 * تستخدم هذه الدالة خوارزمية بسيطة لتقييم مدى تطابق اسمين عربيين، مما يسمح 
 * بالعثور على المريض حتى لو كتب السكرتير اسمه بطريقة مختلفة قليلاً (مثل: "أحمد" بدلاً من "احمد").
 */
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

/** البحث عن آخر سجل مريض بواسطة الاسم (مع دعم البحث التقريبي Fuzzy) */
export const resolveLatestRecordIdByName = (records: PatientRecord[], patientName: string): string | undefined => {
  const targetName = normalizeName(patientName || '');
  if (!targetName) return undefined;

  const matches = records.filter((rec) => !rec.isConsultationOnly && normalizeName(rec.patientName || '') === targetName);
  if (matches.length) return getLatestPreferredRecordId(matches);

  const fuzzyMatches = records
    .filter((rec) => !rec.isConsultationOnly)
    .map((rec) => ({ rec, score: fuzzyNameScore(targetName, normalizeName(rec.patientName || '')) }))
    .filter((item) => item.score >= 60)
    .sort((a, b) => b.score - a.score || new Date(b.rec.date || 0).getTime() - new Date(a.rec.date || 0).getTime())
    .map((item) => item.rec);

  return getLatestPreferredRecordId(fuzzyMatches);
};

/** محاولة إيجاد "كشف اليوم" للمريض لربط الاستشارة به برمجياً */
export const resolveSourceRecordIdByPatientAndDay = (records: PatientRecord[], patientName: string, phone?: string, sourceIso?: string): string | undefined => {
  const targetName = normalizeName(patientName || '');
  const targetPhone = normalizePhone(phone);
  if (!targetName && !targetPhone) return undefined;

  const byIdentity = records.filter((rec) => {
    if (rec.isConsultationOnly) return false;
    const recName = normalizeName(rec.patientName || '');
    const recPhone = normalizePhone(rec.phone);
    if (targetPhone && recPhone) return recPhone === targetPhone;
    if (targetPhone) return false;
    return recName === targetName;
  });
  if (!byIdentity.length) return undefined;

  const sourceMs = new Date(sourceIso || 0).getTime();
  if (Number.isFinite(sourceMs)) {
    const sourceDayKey = toLocalDateStr(new Date(sourceMs));
    const sameDay = byIdentity.filter((rec) => Number.isFinite(new Date(rec.date || 0).getTime()) && toLocalDateStr(new Date(rec.date || 0)) === sourceDayKey);
    if (sameDay.length === 1) return sameDay[0].id;
    if (sameDay.length > 1) {
      const sameDayWithoutConsultation = sameDay.filter((rec) => !rec.consultation);
      if (sameDayWithoutConsultation.length === 1) return sameDayWithoutConsultation[0].id;
    }
  }

  if (byIdentity.length === 1) return byIdentity[0].id;
  const byIdentityWithoutConsultation = byIdentity.filter((rec) => !rec.consultation);
  if (byIdentityWithoutConsultation.length === 1) return byIdentityWithoutConsultation[0].id;
  return undefined;
};

/** حل معرّف السجل لموعد كشف موجود فعلاً */
export const resolveSourceRecordIdFromExamAppointment = (records: PatientRecord[], apt: ClinicAppointment): string | undefined => {
  return resolveSourceRecordIdByPatientAndDay(records, apt.patientName || '', apt.phone, apt.examCompletedAt || apt.dateTime)
    || resolveLatestRecordIdByPhone(records, apt.phone)
    || resolveLatestRecordIdByName(records, apt.patientName || '');
};

/** بناء قائمة اقتراحات المرضى من سجل التاريخ (History) */
export const buildPatientSuggestions = (records: PatientRecord[]): PatientSuggestionOption[] => {
  const byKey = new Map<string, PatientSuggestionOption & { _time: number }>();
  records.forEach((record) => {
    const name = (record.patientName || '').trim();
    const phoneValue = (record.phone || '').trim();
    if (!name && !phoneValue) return;
    const key = `${name}|${phoneValue}`;
    const recTime = new Date(record.date || 0).getTime();

    if (!byKey.has(key) || recTime > byKey.get(key)!._time) {
      const previous = byKey.get(key);
      // نحتفظ بأحدث gender متاح (الأحدث = الأدق بعد تعديلات المستخدم)
      const inheritedGender = record.gender ?? previous?.gender;
      byKey.set(key, {
        id: record.id,
        patientName: name,
        phone: phoneValue || undefined,
        age: buildAgeTextFromRecordAge(record.age),
        lastExamDate: records.filter(r => (r.patientName||'').trim() === name && (r.phone||'').trim() === phoneValue && !r.isConsultationOnly).map(r => r.date).filter(Boolean).sort((a,b) => new Date(b!).getTime() - new Date(a!).getTime())[0],
        lastConsultationDate: records.filter(r => (r.patientName||'').trim() === name && (r.phone||'').trim() === phoneValue && (r.isConsultationOnly || !!r.consultation?.date)).map(r => r.isConsultationOnly ? r.date : r.consultation?.date).filter(Boolean).sort((a,b) => new Date(b!).getTime() - new Date(a!).getTime())[0],
        patientFileNumber: toPositiveFileNumber(record.patientFileNumber) ?? previous?.patientFileNumber,
        gender: inheritedGender,
        _time: recTime,
      });
    }
  });

  return Array.from(byKey.values()).sort((a, b) => b._time - a._time).slice(0, 300).map(({ _time, ...item }) => item);
};

/** بناء قائمة الكشوفات خلال آخر 30 يوم (بدون اشتراط وجود/عدم وجود استشارة) */
export const buildRecentExamCandidates = (records: PatientRecord[]): RecentExamPatientOption[] => {
  const consultationDatesBySourceRecordId = new Map<string, string[]>();

  const parseSourceExamRecordIdFromConsultationRecord = (record: PatientRecord): string | undefined => {
    const explicitSource = String(record.sourceExamRecordId || '').trim();
    if (explicitSource) return explicitSource;

    if (!record.id.startsWith('consultation__')) return undefined;
    const raw = record.id.slice('consultation__'.length);
    if (!raw) return undefined;
    const separatorIndex = raw.indexOf('__');
    const parsed = separatorIndex === -1 ? raw : raw.slice(0, separatorIndex);
    return parsed.trim() || undefined;
  };

  records.forEach((record) => {
    if (!record.isConsultationOnly) return;

    const sourceRecordId = parseSourceExamRecordIdFromConsultationRecord(record);
    const consultationDate = String(record.date || '').trim();
    if (!sourceRecordId || !consultationDate) return;

    const existing = consultationDatesBySourceRecordId.get(sourceRecordId) || [];
    if (!existing.includes(consultationDate)) {
      existing.push(consultationDate);
      consultationDatesBySourceRecordId.set(sourceRecordId, existing);
    }
  });

  const sortIsoDatesDescending = (dates: string[]): string[] =>
    [...dates]
      .filter((value) => Number.isFinite(Date.parse(value)))
      .sort((left, right) => Date.parse(right) - Date.parse(left));

  const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000);
  return [...records]
    .filter((rec) => {
      if (rec.isConsultationOnly) return false;
      const recMs = new Date(rec.date || 0).getTime();
      return Number.isFinite(recMs) && recMs >= cutoff;
    })
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .map((rec) => ({
      ...(() => {
        const mergedConsultationDates = [
          ...(consultationDatesBySourceRecordId.get(rec.id) || []),
          ...(rec.consultation?.date ? [rec.consultation.date] : []),
        ];
        const consultationCompletedDates = sortIsoDatesDescending(
          Array.from(new Set(mergedConsultationDates))
        );
        const consultationCompletedAt = consultationCompletedDates[0];

        return {
          consultationCompletedAt,
          consultationCompletedDates: consultationCompletedDates.length > 0
            ? consultationCompletedDates
            : undefined,
        };
      })(),
      id: rec.id,
      patientName: (rec.patientName || '').trim() || 'بدون اسم',
      age: buildAgeTextFromRecordAge(rec.age),
      phone: rec.phone,
      examCompletedAt: rec.date,
      consultationSourceRecordId: rec.id,
      // نقل الهوية الثابتة (الجنس) مع المريض للاستشارة التالية
      gender: rec.gender,
    }));
};

/** تقسيم المواعيد قيد الانتظار إلى موعد اليوم والمواعيد القادمة */
export const groupPendingAppointments = (pendingList: ClinicAppointment[], todayStr: string): { todayPending: ClinicAppointment[]; futurePendingGroups: AppointmentDayGroup[] } => {
  const today: ClinicAppointment[] = [];
  const groups: Record<string, ClinicAppointment[]> = {};

  pendingList.forEach((apt) => {
    const dStr = toLocalDateStr(new Date(apt.dateTime));
    if (dStr === todayStr) today.push(apt);
    else {
      if (!groups[dStr]) groups[dStr] = [];
      groups[dStr].push(apt);
    }
  });

  return { todayPending: today, futurePendingGroups: Object.keys(groups).sort().map(date => ({ date, appointments: groups[date] })) };
};

/** تقسيم المواعيد المكتملة حسب اليوم (لعرضها في تاريخ العيادة) */
export const groupCompletedAppointments = (completedList: ClinicAppointment[]): AppointmentDayGroup[] => {
  const groups: Record<string, ClinicAppointment[]> = {};
  completedList.forEach((apt) => {
    const dStr = toLocalDateStr(new Date(apt.dateTime));
    if (!groups[dStr]) groups[dStr] = [];
    groups[dStr].push(apt);
  });
  return Object.keys(groups).sort().reverse().map(date => ({ date, appointments: groups[date] }));
};
