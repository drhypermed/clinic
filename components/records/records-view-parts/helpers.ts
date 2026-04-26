/**
 * مساعدات عرض السجلات (Records View Parts Helpers)
 *
 * أنواع + دوال خالصة تُستخدم داخل `recordsViewParts.tsx` وفروعه:
 *   - تحويل التاريخ إلى مفتاح يوم.
 *   - تنسيق التاريخ والوقت للعرض.
 *   - فحص/fallback نصوص الحقول.
 *   - بناء CaseData من PatientRecord.
 *   - تصنيف BMI.
 *   - تسميات تسلسل الاستشارة.
 */

import type { PatientRecord } from '../../../types';
import { formatUserDate, formatUserDateTime, formatUserTime, getCairoDayKey } from '../../../utils/cairoTime';

type CaseType = 'exam' | 'consultation';

/** entry في الخط الزمني للسجلات (كشف أو استشارة) */
export interface RecordTimelineEntry {
    entryId: string;
    visitType: CaseType;
    date: string;
    record: PatientRecord;
    sourceExamDate?: string;
    consultationSequenceForPatient?: number;
}

/** هيكل البيانات الموحد لعرض الحالة في لوحة (Panel) */
export interface CaseData {
    type: CaseType;
    title: string;
    date: string;
    complaintAr: string;
    complaintEn: string;
    historyAr: string;
    historyEn: string;
    examAr: string;
    examEn: string;
    investigationsAr: string;
    investigationsEn: string;
    diagnosisEn: string;
    rxItems: PatientRecord['rxItems'];
    generalAdvice: string[];
    labInvestigations: string[];
}

/** تحويل التاريخ إلى صيغة YYYY-MM-DD للمقارنة والفرز */
export const toDateOnly = (dateStr: string) => getCairoDayKey(dateStr);

/** تنسيق التاريخ والوقت للعرض في الملخصات */
export const formatDateTime = (dateStr: string): string => formatUserDateTime(dateStr);

/** تنسيق التاريخ والوقت مع فاصل مرئي | بينهما */
export const formatDateTimeSep = (dateStr: string): string => {
    const d = formatUserDate(dateStr, { year: 'numeric', month: '2-digit', day: '2-digit' });
    const t = formatUserTime(dateStr);
    return `${d} | ${t}`;
};

/** تصنيف مؤشر كتلة الجسم */
export const getBMICategory = (bmi: string): string => {
    const v = parseFloat(bmi);
    if (isNaN(v) || v === 0) return '';
    if (v < 18.5) return 'نحافة';
    if (v < 25) return 'وزن طبيعي';
    if (v < 30) return 'وزن زائد';
    return 'سمنة';
};

/** جلب التشخيص المناسب لنوع الزيارة المعروضة */
export const getRecordDiagnosisSummary = (rec: PatientRecord, visitType: CaseType) => {
    if (visitType === 'consultation') {
        return (rec.isConsultationOnly ? rec.diagnosisEn : rec.consultation?.diagnosisEn || '').trim() || 'غير متوفر';
    }

    const examDiagnosis = (rec.diagnosisEn || '').trim();
    return examDiagnosis || 'غير متوفر';
};

/** التحقق من وجود نص صالح (غير فارغ) */
export const hasText = (value?: string) => !!(value || '').trim();

/** النص الإنجليزي الذي يعني "لا توجد معلومات" */
export const NO_PERTINENT_EN = 'No pertinent information.';

/** النص البديل بالعربي لكل خانة */
export const getFieldFallback = (title: string): string => {
    const map: Record<string, string> = {
        'الشكوى': 'لا توجد شكوى مسجلة',
        'التاريخ المرضي': 'لا يوجد تاريخ مرضي مسجل',
        'ملاحظات الكشف': 'لا توجد ملاحظات كشف مسجلة',
        'الفحوصات الموجودة': 'لا توجد فحوصات مسجلة',
        'التشخيص': 'لا يوجد تشخيص مسجل',
    };
    return map[title] || 'لا توجد بيانات مسجلة';
};

/** رسالة تنبيه عند تكرار الاستشارة لنفس المريض */
export const getConsultationSequenceLabel = (sequence: number): string => {
    switch (sequence) {
        case 2:
            return 'تنبيه: الاستشارة الثانية لهذا المريض';
        case 3:
            return 'تنبيه: الاستشارة الثالثة لهذا المريض';
        case 4:
            return 'تنبيه: الاستشارة الرابعة لهذا المريض';
        case 5:
            return 'تنبيه: الاستشارة الخامسة لهذا المريض';
        default:
            return `تنبيه: الاستشارة رقم ${sequence} لهذا المريض`;
    }
};

/**
 * بناء بيانات الحالة (Build Case):
 * دالة تقوم باستخراج وتحويل بيانات الكشف أو الاستشارة من السجل الطبي
 * وتنسيقها في هيكل موحد (CaseData) يسهل عرضه.
 */
export const buildCase = (rec: PatientRecord, type: CaseType): CaseData | null => {
    if (type === 'exam') {
        if (rec.isConsultationOnly) return null;
        return {
            type,
            title: 'الكشف',
            date: rec.date,
            complaintAr: rec.complaintAr || '',
            complaintEn: rec.complaintEn || '',
            historyAr: rec.historyAr || '',
            historyEn: rec.historyEn || '',
            examAr: rec.examAr || '',
            examEn: rec.examEn || '',
            investigationsAr: rec.investigationsAr || '',
            investigationsEn: rec.investigationsEn || '',
            diagnosisEn: rec.diagnosisEn || '',
            rxItems: rec.rxItems || [],
            generalAdvice: rec.generalAdvice || [],
            labInvestigations: rec.labInvestigations || [],
        };
    }

    if (rec.isConsultationOnly) {
        return {
            type,
            title: 'الاستشارة',
            date: rec.date,
            complaintAr: rec.complaintAr || '',
            complaintEn: rec.complaintEn || '',
            historyAr: rec.historyAr || '',
            historyEn: rec.historyEn || '',
            examAr: rec.examAr || '',
            examEn: rec.examEn || '',
            investigationsAr: rec.investigationsAr || '',
            investigationsEn: rec.investigationsEn || '',
            diagnosisEn: rec.diagnosisEn || '',
            rxItems: rec.rxItems || [],
            generalAdvice: rec.generalAdvice || [],
            labInvestigations: rec.labInvestigations || [],
        };
    }

    if (!rec.consultation) return null;

    return {
        type,
        title: 'الاستشارة',
        date: rec.consultation.date,
        complaintAr: rec.consultation.complaintAr || '',
        complaintEn: rec.consultation.complaintEn || '',
        historyAr: rec.consultation.historyAr || '',
        historyEn: rec.consultation.historyEn || '',
        examAr: rec.consultation.examAr || '',
        examEn: rec.consultation.examEn || '',
        investigationsAr: rec.consultation.investigationsAr || '',
        investigationsEn: rec.consultation.investigationsEn || '',
        diagnosisEn: rec.consultation.diagnosisEn || '',
        rxItems: rec.consultation.rxItems || [],
        generalAdvice: rec.consultation.generalAdvice || [],
        labInvestigations: rec.consultation.labInvestigations || [],
    };
};
