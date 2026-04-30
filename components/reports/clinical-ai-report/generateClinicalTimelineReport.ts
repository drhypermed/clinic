import { generateJson } from '../../../services/geminiUtils';

import type {
  ClinicalAiNarrative,
  ClinicalLocalizedVisitRegistryItem,
  ClinicalReportLanguage,
  ClinicalTimelinePoint,
  GenerateClinicalAiNarrativeInput,
  GenerateClinicalAiNarrativeResult,
  PatientClinicalTimelineSnapshot,
} from './types';

const MAX_VISITS_FOR_PROMPT = 90;
const MAX_FIELD_CHARS = 700;

const toText = (value: unknown): string => String(value ?? '').replace(/\s+/g, ' ').trim();

const truncate = (value: unknown, limit = MAX_FIELD_CHARS): string => {
  const text = toText(value);
  if (!text) return '';
  if (text.length <= limit) return text;
  return `${text.slice(0, limit)}...`;
};

const toStringList = (value: unknown, fallback: string[] = []): string[] => {
  if (!Array.isArray(value)) return fallback;

  const result = value
    .map((item) => truncate(item, 700))
    .filter(Boolean);

  return result.length > 0 ? result : fallback;
};

const buildFallbackLocalizedVisitRegistry = (
  snapshot: PatientClinicalTimelineSnapshot,
  language: ClinicalReportLanguage,
): ClinicalLocalizedVisitRegistryItem[] => {
  return snapshot.visits.map((visit) => ({
    id: visit.id,
    visitTypeLabel: language === 'ar'
      ? (visit.visitType === 'exam' ? 'كشف' : 'استشارة')
      : (visit.visitType === 'exam' ? 'Examination' : 'Consultation'),
    dateLabel: visit.visitDateLabel,
    sourceExamLabel: visit.sourceExamDateLabel || '',
    diagnosis: truncate(visit.diagnosis, 260),
    medications: visit.medications.slice(0, 14).map((item) => truncate(item, 220)),
    advice: visit.advice.slice(0, 14).map((item) => truncate(item, 220)),
    labsAndNotes: visit.labsAndNotes.slice(0, 16).map((item) => truncate(item, 220)),
    keyClinicalDetails: [
      truncate(visit.complaint, 240),
      truncate(visit.history, 240),
      truncate(visit.examination, 240),
      truncate(visit.investigations, 240),
    ].filter(Boolean),
  }));
};

const buildFallbackTimeline = (
  snapshot: PatientClinicalTimelineSnapshot,
  language: ClinicalReportLanguage,
): ClinicalTimelinePoint[] => {
  return snapshot.visits.map((visit) => {
    const diagnosis = truncate(visit.diagnosis, 220);
    const complaint = truncate(visit.complaint, 220);
    const summary = diagnosis || complaint || (language === 'ar' ? 'لا توجد تفاصيل سريرية كافية.' : 'No sufficient clinical details provided.');

    return {
      dateLabel: visit.visitDateLabel,
      title: language === 'ar'
        ? (visit.visitType === 'exam' ? 'زيارة كشف' : 'زيارة استشارة')
        : (visit.visitType === 'exam' ? 'Examination Visit' : 'Consultation Visit'),
      summary,
      changeNotes: [
        language === 'ar'
          ? `نوع الزيارة: ${visit.visitType === 'exam' ? 'كشف' : 'استشارة'}`
          : `Visit type: ${visit.visitType === 'exam' ? 'Examination' : 'Consultation'}`,
      ],
    };
  });
};

const buildFallbackNarrative = (
  snapshot: PatientClinicalTimelineSnapshot,
  language: ClinicalReportLanguage,
): ClinicalAiNarrative => {
  const timeline = buildFallbackTimeline(snapshot, language);
  const localizedVisitRegistry = buildFallbackLocalizedVisitRegistry(snapshot, language);
  const latestVisit = snapshot.visits[snapshot.visits.length - 1];
  const latestDiagnosis = truncate(latestVisit?.diagnosis, 220);

  if (language === 'ar') {
    return {
      reportTitle: 'تقرير طبي تحليلي شامل',
      executiveSummary: [
        `عدد الزيارات الموثقة: ${snapshot.visitCount} (كشوفات: ${snapshot.examCount}، استشارات: ${snapshot.consultationCount}).`,
        latestDiagnosis
          ? `آخر انطباع تشخيصي موثق: ${latestDiagnosis}.`
          : 'لا يوجد تشخيص موثق بوضوح في آخر زيارة.',
      ],
      temporalEvolution: [
        'تم ترتيب الزيارات زمنيا من الأقدم إلى الأحدث لتوضيح تطور الحالة.',
      ],
      timeline,
      localizedVisitRegistry,
      currentClinicalPicture: [
        latestDiagnosis
          ? `الصورة السريرية الحالية مبنية على آخر تقييم موثق: ${latestDiagnosis}.`
          : 'الصورة السريرية الحالية تحتاج توثيقا أكثر تفصيلا في الزيارات القادمة.',
      ],
      recommendations: [
        'ينصح بالاستمرار في التوثيق الزمني المنهجي للأعراض والفحص والاستجابة العلاجية.',
      ],
      warningFlags: [
        'لا توجد إشارات تحذيرية كافية في البيانات المتاحة، ويجب الاعتماد على التقييم السريري المباشر.',
      ],
      confidenceStatement: 'تم إنشاء هذه النسخة الاحتياطية تلقائيا بسبب تعذر إكمال التحليل في هذه اللحظة.',
    };
  }

  return {
    reportTitle: 'Comprehensive Clinical Timeline Report',
    executiveSummary: [
      `Total documented visits: ${snapshot.visitCount} (examinations: ${snapshot.examCount}, consultations: ${snapshot.consultationCount}).`,
      latestDiagnosis
        ? `Most recent documented diagnostic impression: ${latestDiagnosis}.`
        : 'No clearly documented diagnosis in the latest visit.',
    ],
    temporalEvolution: [
      'Visits are arranged chronologically from earliest to latest to reflect disease evolution.',
    ],
    timeline,
    localizedVisitRegistry,
    currentClinicalPicture: [
      latestDiagnosis
        ? `Current clinical picture is based on the latest documented assessment: ${latestDiagnosis}.`
        : 'Current clinical picture remains limited due to sparse documentation.',
    ],
    recommendations: [
      'Continue structured chronological documentation of symptoms, examination findings, and treatment response.',
    ],
    warningFlags: [
      'No robust warning pattern can be inferred from the available data alone; direct clinical assessment is required.',
    ],
    confidenceStatement: 'Fallback report generated because AI synthesis was temporarily unavailable.',
  };
};

const normalizeTimeline = (
  value: unknown,
  fallback: ClinicalTimelinePoint[],
): ClinicalTimelinePoint[] => {
  if (!Array.isArray(value)) return fallback;

  const normalized = value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const rawItem = item as Record<string, unknown>;

      const dateLabel = truncate(rawItem.dateLabel, 120);
      const title = truncate(rawItem.title, 220);
      const summary = truncate(rawItem.summary, 900);
      const changeNotes = toStringList(rawItem.changeNotes, []);

      if (!dateLabel && !title && !summary) return null;

      return {
        dateLabel,
        title,
        summary,
        changeNotes,
      };
    })
    .filter((item): item is ClinicalTimelinePoint => Boolean(item));

  return normalized.length > 0 ? normalized : fallback;
};

const normalizeLocalizedVisitRegistry = (
  value: unknown,
  fallback: ClinicalLocalizedVisitRegistryItem[],
): ClinicalLocalizedVisitRegistryItem[] => {
  if (!Array.isArray(value)) return fallback;

  const normalized: ClinicalLocalizedVisitRegistryItem[] = [];

  value.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;
    const rawItem = item as Record<string, unknown>;

    const id = truncate(rawItem.id, 200) || `visit-${index + 1}`;
    const visitTypeLabel = truncate(rawItem.visitTypeLabel, 120);
    const dateLabel = truncate(rawItem.dateLabel, 160);
    const sourceExamLabel = truncate(rawItem.sourceExamLabel, 180);
    const diagnosis = truncate(rawItem.diagnosis, 500);
    const medications = toStringList(rawItem.medications, []);
    const advice = toStringList(rawItem.advice, []);
    const labsAndNotes = toStringList(rawItem.labsAndNotes, []);
    const keyClinicalDetails = toStringList(rawItem.keyClinicalDetails, []);

    if (!visitTypeLabel && !dateLabel && !diagnosis) return;

    normalized.push({
      id,
      visitTypeLabel,
      dateLabel,
      sourceExamLabel: sourceExamLabel || undefined,
      diagnosis,
      medications,
      advice,
      labsAndNotes,
      keyClinicalDetails,
    });
  });

  return normalized.length > 0 ? normalized : fallback;
};

const normalizeNarrative = (
  raw: unknown,
  snapshot: PatientClinicalTimelineSnapshot,
  language: ClinicalReportLanguage,
): ClinicalAiNarrative => {
  const fallback = buildFallbackNarrative(snapshot, language);
  if (!raw || typeof raw !== 'object') return fallback;

  const rawObject = raw as Record<string, unknown>;

  const reportTitle = truncate(rawObject.reportTitle, 220) || fallback.reportTitle;
  const executiveSummary = toStringList(rawObject.executiveSummary, fallback.executiveSummary);
  const temporalEvolution = toStringList(rawObject.temporalEvolution, fallback.temporalEvolution);
  const timeline = normalizeTimeline(rawObject.timeline, fallback.timeline);
  const localizedVisitRegistry = normalizeLocalizedVisitRegistry(rawObject.localizedVisitRegistry, fallback.localizedVisitRegistry);
  const currentClinicalPicture = toStringList(rawObject.currentClinicalPicture, fallback.currentClinicalPicture);
  const recommendations = toStringList(rawObject.recommendations, fallback.recommendations);
  const warningFlags = toStringList(rawObject.warningFlags, fallback.warningFlags);
  const confidenceStatement = truncate(rawObject.confidenceStatement, 320) || fallback.confidenceStatement;

  return {
    reportTitle,
    executiveSummary,
    temporalEvolution,
    timeline,
    localizedVisitRegistry,
    currentClinicalPicture,
    recommendations,
    warningFlags,
    confidenceStatement,
  };
};

const buildPrompt = (
  snapshot: PatientClinicalTimelineSnapshot,
  language: ClinicalReportLanguage,
): string => {
  const compressedPayload = {
    patient: {
      name: snapshot.patientName,
      fileNumber: snapshot.patientFileNumber,
      phone: snapshot.patientPhone,
      ageAr: snapshot.patientAgeTextAr,
      ageEn: snapshot.patientAgeTextEn,
      visitsCount: snapshot.visitCount,
      examCount: snapshot.examCount,
      consultationCount: snapshot.consultationCount,
    },
    visitsChronological: snapshot.visits
      .slice(-MAX_VISITS_FOR_PROMPT)
      .map((visit) => ({
        date: visit.visitDateLabel,
        type: visit.visitType,
        sourceExamDate: visit.sourceExamDateLabel || '',
        complaint: truncate(visit.complaint),
        history: truncate(visit.history),
        examination: truncate(visit.examination),
        investigations: truncate(visit.investigations),
        diagnosis: truncate(visit.diagnosis, 260),
        medications: visit.medications.slice(0, 12).map((item) => truncate(item, 180)),
        advice: visit.advice.slice(0, 12).map((item) => truncate(item, 180)),
        labsAndNotes: visit.labsAndNotes.slice(0, 16).map((item) => truncate(item, 180)),
        paymentType: visit.paymentType || '',
      })),
  };

  const targetLanguage = language === 'ar' ? 'Arabic' : 'English';

  return `You are a senior consultant physician composing a formal clinical referral and case summary report directed from one physician to a colleague physician. This report will be printed and handed to another treating doctor, so the language must be precise, objective, medically formal, and follow accepted clinical documentation standards — as if writing in a hospital discharge summary or a specialist referral letter.

Target language: ${targetLanguage}

═══ ABSOLUTE ANTI-HALLUCINATION RULES ═══
A) Use ONLY the provided structured data. Do NOT invent, assume, or extrapolate clinical facts.
B) NEVER fabricate drug dosings, lab values, vital signs, or clinical findings absent from the source.
C) "warningFlags" MUST be derived from documented evidence in the visits. If no clear warning pattern exists, return an array containing ONE honest disclaimer (e.g., "No specific warning signs derived from documentation; relies on direct clinical assessment").
D) "recommendations" MUST be generic clinical-documentation guidance, NOT specific treatment recommendations.
E) "confidenceStatement" MUST honestly reflect data quality:
   - High confidence: ≥10 visits with full documentation.
   - Moderate confidence: 3-10 visits OR partial documentation.
   - Low confidence: <3 visits OR sparse data — say so explicitly.

═══ STYLE & STRUCTURE ═══
1) Analyse the full chronological evolution; explicitly note changes in diagnosis, regimen, or status between visits.
2) Use formal third-person clinical language ("The patient presented with...", "Examination revealed...").
3) Keep sections concise yet informative; avoid lay language.
4) Acknowledge diagnostic uncertainty clearly ("No documented diagnosis in this encounter", "Clinical details limited to chief complaint").
5) Write every field strictly in the requested target language.
6) executiveSummary should read like the opening paragraph of a specialist referral letter.

Clinical data (JSON):
${JSON.stringify(compressedPayload, null, 2)}

Return STRICT JSON ONLY in this exact shape:
{
  "reportTitle": "string",
  "executiveSummary": ["string"],
  "temporalEvolution": ["string"],
  "timeline": [
    {
      "dateLabel": "string",
      "title": "string",
      "summary": "string",
      "changeNotes": ["string"]
    }
  ],
  "localizedVisitRegistry": [
    {
      "id": "string",
      "visitTypeLabel": "string",
      "dateLabel": "string",
      "sourceExamLabel": "string",
      "diagnosis": "string",
      "medications": ["string"],
      "advice": ["string"],
      "labsAndNotes": ["string"],
      "keyClinicalDetails": ["string"]
    }
  ],
  "currentClinicalPicture": ["string"],
  "recommendations": ["string"],
  "warningFlags": ["string"],
  "confidenceStatement": "string"
}`;
};

export const generateClinicalTimelineNarrative = async (
  input: GenerateClinicalAiNarrativeInput,
): Promise<GenerateClinicalAiNarrativeResult> => {
  const { snapshot, language } = input;

  try {
    const prompt = buildPrompt(snapshot, language);
    // التقرير الطبي الشامل = مهمة معقدة. نزوّد thinkingBudget لـ 1024 token
    // (بدل الـ dynamic الافتراضي اللي ممكن يديله 500 بس). ده بيعطي توازن
    // ممتاز: جودة أعلى من الـ dynamic، مع تكلفة معقولة للاشتراك $15/شهر.
    // لو لاحقاً رفعت سعر الاشتراك، ممكن ترفعه لـ 2048 لجودة أعلى.
    // temperature=0 (كان 0.2): التقرير الطبي قرار توثيقي، مش إبداع لغوي.
    // العشوائية بتزود مخاطر الفبركة في warningFlags و recommendations.
    const raw = await generateJson(prompt, {
      temperature: 0,
      thinkingBudget: 1024,
      feature: 'medical_report', // تتسجل في تقارير الاستهلاك تحت "طباعة تقرير طبي"
    });

    return {
      narrative: normalizeNarrative(raw, snapshot, language),
      generatedByAi: true,
    };
  } catch (error) {
    console.error('Failed to generate AI clinical report narrative:', error);

    return {
      narrative: buildFallbackNarrative(snapshot, language),
      generatedByAi: false,
    };
  }
};
