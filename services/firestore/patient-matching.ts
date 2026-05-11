/**
 * patient-matching.ts
 * خدمة بسيطة لربط الحجوزات العامة بملفات المرضى الموجودة عند الطبيب.
 *
 * استخدامها الأساسي:
 * - لما يصل حجز جديد من الرابط العام، نبحث في patientSummaries بنفس رقم الهاتف.
 * - لو لقينا ملف بنفس الرقم، نعرض للطبيب اقتراح "اربط الحجز بملف فلان".
 * - لما يقبل، نحدّث الـ appointment بـ patientFileId/patientFileNumber/patientFileNameKey.
 *
 * تكلفة كل بحث: قراءة واحدة (where phones array-contains) — رخيصة جداً.
 */
import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

/** نتيجة مطابقة مريض موجود */
export interface MatchedPatientSummary {
  patientFileNameKey: string;
  patientName: string;
  patientFileNumber?: number;
  patientFileId?: string;
  phones: string[];
  totalExams: number;
  totalConsultations: number;
  lastVisitAtMs?: number;
}

/** نطهر رقم الهاتف من أي رموز ونخلّي بس الأرقام (نفس آلية تخزين phones array) */
const normalizePhoneDigits = (phone: string | undefined | null): string => {
  return String(phone || '').replace(/\D/g, '');
};

/**
 * بحث عن ملفات مرضى للطبيب بنفس رقم الهاتف.
 * بيرجع array — ممكن يكون فيها صفر، واحد، أو أكتر (لو نفس الرقم لمرضى مختلفين، نادر).
 *
 * Limit = 5 — لو في أكتر من 5 مطابقات، احتمالية إن الرقم خطأ في الإدخال (مش رقم حقيقي).
 */
export const findPatientSummariesByPhone = async (
  doctorId: string,
  phone: string,
): Promise<MatchedPatientSummary[]> => {
  const normalizedDoctorId = String(doctorId || '').trim();
  const phoneDigits = normalizePhoneDigits(phone);
  // أقل من 7 أرقام = مش هاتف حقيقي، مفيش لزوم نبحث
  if (!normalizedDoctorId || phoneDigits.length < 7) return [];

  try {
    const summariesRef = collection(db, 'users', normalizedDoctorId, 'patientSummaries');
    const q = query(
      summariesRef,
      where('phones', 'array-contains', phoneDigits),
      limit(5),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data() || {};
      return {
        patientFileNameKey: String(data.patientFileNameKey || d.id),
        patientName: String(data.patientName || ''),
        patientFileNumber: Number.isFinite(Number(data.patientFileNumber))
          ? Number(data.patientFileNumber)
          : undefined,
        patientFileId: data.patientFileId ? String(data.patientFileId) : undefined,
        phones: Array.isArray(data.phones) ? data.phones.map(String) : [],
        totalExams: Number(data.totalExams || 0),
        totalConsultations: Number(data.totalConsultations || 0),
        lastVisitAtMs: Number.isFinite(Number(data.lastVisitAtMs))
          ? Number(data.lastVisitAtMs)
          : undefined,
      };
    });
  } catch (error) {
    console.warn('[patient-matching] findPatientSummariesByPhone failed:', error);
    return [];
  }
};

/**
 * ربط موعد حجز عام بملف مريض موجود.
 * بيحدّث الـ 3 حقول اللي بتعرّف الملف: patientFileId, patientFileNumber, patientFileNameKey.
 * بعد الربط، سجلات المريض القديمة هتظهر مع الموعد ده تلقائياً.
 */
export const linkAppointmentToPatientFile = async (
  doctorId: string,
  appointmentId: string,
  match: Pick<MatchedPatientSummary, 'patientFileId' | 'patientFileNumber' | 'patientFileNameKey'>,
): Promise<void> => {
  const normalizedDoctorId = String(doctorId || '').trim();
  const normalizedAppointmentId = String(appointmentId || '').trim();
  if (!normalizedDoctorId || !normalizedAppointmentId) return;

  const appointmentRef = doc(db, 'users', normalizedDoctorId, 'appointments', normalizedAppointmentId);
  // الحقول دي هي اللي بيستخدمها التطبيق لربط الموعد بسجلات المريض القديمة
  await updateDoc(appointmentRef, {
    patientFileId: match.patientFileId || null,
    patientFileNumber: match.patientFileNumber || null,
    patientFileNameKey: match.patientFileNameKey || null,
    linkedAt: new Date().toISOString(),
  });
};
