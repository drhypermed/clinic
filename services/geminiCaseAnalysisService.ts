// ═══════════════════════════════════════════════════════════════════════════
// خدمة التحليل السريري الغني (Case Analysis Service)
// ───────────────────────────────────────────────────────────────────────────
// الغرض: توليد تحليل شامل للحالة بأسلوب استشاري طب أسرة، يشمل:
//   1) تشخيصات تفريقية (أعلى 3) مع منطق سريري وترتيب الأكثر احتمالاً.
//   2) حالات خطيرة لا يجب تفويتها (Must Not Miss) — 3 فقط.
//   3) فحوصات مقترحة بأسماء إنجليزية وأسباب عربية قصيرة.
//   4) تعليمات هامة للمريض بالعامية المصرية المبسطة.
//   5) معلومات ناقصة قد تغيّر التشخيص.
//   6) علامات خطر (Red Flags) عند وجودها.
//
// مهم جداً: هذه الخدمة تأخذ في الحسبان النوع (ذكر/أنثى)، الحمل، الرضاعة،
// السن، الوزن، العلامات الحيوية، وكل البيانات السريرية — لأن غياب أيٍّ منها
// قد يحوّل التشخيص تماماً (مثال: مغص بطن في حامل ≠ في غير حامل).
// ═══════════════════════════════════════════════════════════════════════════

import type { PatientGender, VitalSigns } from '../types';
import { generateContentWithSecurity, GEMINI_MODEL, tryParseJson } from './geminiUtils';

// ─── الواجهة الخارجية للنتائج ────────────────────────────────────────────
/** عنصر واحد في قائمة التشخيصات التفريقية */
export interface DifferentialDiagnosisItem {
  diagnosis: string;      // اسم المرض بالإنجليزية (مصطلح سريري)
  reasoning: string;      // المنطق السريري (1-2 جملة بالإنجليزية)
  isMostLikely: boolean;  // هل هذا الأكثر احتمالاً؟ (الأول فقط = true)
}

/** عنصر في قائمة الحالات الخطيرة التي لا يجب تفويتها */
export interface MustNotMissItem {
  diagnosis: string;      // اسم الحالة بالإنجليزية
  reasoning: string;      // لماذا خطيرة / لماذا لا تُفوَّت (إنجليزي قصير)
  alreadyInDDx: boolean;  // هل مذكورة في الـ DDx؟ (لو نعم نضع ⚠️ بدلاً من التكرار)
}

/** فحص مقترح — اسم إنجليزي وسبب عربي */
export interface SuggestedInvestigationItem {
  nameEn: string;   // اسم الفحص الإنجليزي (CBC, CRP, U/S abdomen ...)
  reasonAr: string; // سبب طلبه بالعربي البسيط
}

/** نتيجة التحليل السريري الشامل */
export interface CaseAnalysisResult {
  differentialDiagnoses: DifferentialDiagnosisItem[]; // أعلى 3 احتمالات
  differentialDiagnosesIntro: string;                 // جملة/جملتان عن الأهمية
  mustNotMiss: MustNotMissItem[];                     // 3 فقط (حالات مهددة للحياة)
  suggestedInvestigations: SuggestedInvestigationItem[]; // فحوصات مفيدة للتأكيد/الاستبعاد
  importantInstructionsAr: string[];                  // تعليمات مصرية مبسطة
  missingInformation: string[];                       // أسئلة عملية قصيرة (إنجليزي)
  redFlags: string[];                                 // علامات خطر (إنجليزي) — قد تكون فارغة
  insufficientData: boolean;                          // هل البيانات غير كافية لتحليل موثوق؟
  insufficientDataNote?: string;                      // ملاحظة بالعربي لو البيانات قليلة
}

// ─── أدوات داخلية ────────────────────────────────────────────────────────
const toText = (v: unknown): string => (v ?? '').toString();
const toTrimmed = (v: unknown): string => toText(v).trim();

/** تأكيد أن القيمة مصفوفة نصوص نظيفة بحجم محدد */
const toStringArray = (value: unknown, maxItems: number): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map(toTrimmed)
    .filter((s) => s.length > 0)
    .slice(0, maxItems);
};

/** ملخص العلامات الحيوية في سطر مختصر للـ prompt */
const buildVitalsSummary = (v: VitalSigns | undefined): string => {
  if (!v) return 'N/A';
  const parts: string[] = [];
  if (v.bp) parts.push(`BP ${v.bp}`);
  if (v.pulse) parts.push(`Pulse ${v.pulse}`);
  if (v.temp) parts.push(`Temp ${v.temp}`);
  if (v.rbs) parts.push(`RBS ${v.rbs}`);
  if (v.spo2) parts.push(`SpO2 ${v.spo2}`);
  if (v.rr) parts.push(`RR ${v.rr}`);
  return parts.length ? parts.join(', ') : 'N/A';
};

/** بناء ملخص نصي لحالة المرأة: حمل/رضاعة/سن خصوبة (مهم للسلامة الدوائية والتشخيص) */
const buildFemaleContext = (
  gender: PatientGender | '' | undefined,
  pregnant: boolean | null | undefined,
  breastfeeding: boolean | null | undefined,
): string => {
  // لو مش أنثى نخرج بدون أي تفاصيل (الذكور لا يحملون ولا يرضعون)
  if (gender !== 'female') return '';
  const flags: string[] = [];
  if (pregnant === true) flags.push('PREGNANT');
  else if (pregnant === false) flags.push('not pregnant');
  if (breastfeeding === true) flags.push('BREASTFEEDING');
  else if (breastfeeding === false) flags.push('not breastfeeding');
  return flags.length ? ` (${flags.join(' / ')})` : ' (pregnancy/breastfeeding status unknown)';
};

// ─── سانيتايزر نتائج الموديل ─────────────────────────────────────────────
/** تنظيف استجابة الموديل وضمان البنية حتى لو الـ AI رجّع حاجة ناقصة */
const sanitizeAnalysis = (raw: unknown): CaseAnalysisResult => {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;

  // ── التشخيصات التفريقية: نحتفظ بأعلى 3 فقط ونضمن إن واحد بس يكون "most likely"
  const rawDDx = Array.isArray(obj.differentialDiagnoses) ? obj.differentialDiagnoses : [];
  const ddx: DifferentialDiagnosisItem[] = rawDDx
    .slice(0, 3)
    .map((item, idx) => {
      const it = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
      return {
        diagnosis: toTrimmed(it.diagnosis),
        reasoning: toTrimmed(it.reasoning),
        // الأول فقط يُعلَّم "most likely" (نتجاهل ما يقوله الموديل ونضمن الترتيب)
        isMostLikely: idx === 0,
      };
    })
    .filter((d) => d.diagnosis.length > 0);

  // ── Must Not Miss: نأخذ 3 فقط ونحسب alreadyInDDx لو مش محسوب
  const ddxNames = new Set(ddx.map((d) => d.diagnosis.toLowerCase()));
  const rawMustNotMiss = Array.isArray(obj.mustNotMiss) ? obj.mustNotMiss : [];
  const mustNotMiss: MustNotMissItem[] = rawMustNotMiss
    .slice(0, 3)
    .map((item) => {
      const it = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
      const dx = toTrimmed(it.diagnosis);
      return {
        diagnosis: dx,
        reasoning: toTrimmed(it.reasoning),
        // لو الموديل قال نعم → نصدقه. ولو لا → نحسبها بنفسنا من أسماء الـ DDx
        alreadyInDDx: it.alreadyInDDx === true || ddxNames.has(dx.toLowerCase()),
      };
    })
    .filter((m) => m.diagnosis.length > 0);

  // ── الفحوصات المقترحة
  const rawInvs = Array.isArray(obj.suggestedInvestigations) ? obj.suggestedInvestigations : [];
  const investigations: SuggestedInvestigationItem[] = rawInvs
    .slice(0, 8)
    .map((item) => {
      const it = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
      return {
        nameEn: toTrimmed(it.nameEn),
        reasonAr: toTrimmed(it.reasonAr),
      };
    })
    .filter((x) => x.nameEn.length > 0);

  return {
    differentialDiagnoses: ddx,
    differentialDiagnosesIntro: toTrimmed(obj.differentialDiagnosesIntro),
    mustNotMiss,
    suggestedInvestigations: investigations,
    // تعليمات عربية للمريض (حد أقصى 6 نقاط عملية)
    importantInstructionsAr: toStringArray(obj.importantInstructionsAr, 6),
    // أسئلة/معلومات ناقصة (حد أقصى 5)
    missingInformation: toStringArray(obj.missingInformation, 5),
    // علامات خطر (حد أقصى 5)
    redFlags: toStringArray(obj.redFlags, 5),
    insufficientData: obj.insufficientData === true,
    insufficientDataNote: toTrimmed(obj.insufficientDataNote) || undefined,
  };
};

// ─── الإدخالات ─────────────────────────────────────────────────────────────
export interface CaseAnalysisInput {
  complaint: string;          // الشكوى (عربي أو مختلط)
  medicalHistory: string;     // التاريخ المرضي
  examination: string;        // الفحص السريري
  investigations: string;     // فحوصات سابقة
  ageYears: number;
  ageMonths: number;
  ageDays: number;
  weightKg: number;
  heightCm?: number;          // اختياري
  gender: PatientGender | '';
  pregnant: boolean | null;
  breastfeeding: boolean | null;
  vitals: VitalSigns;
}

// ─── الدالة الرئيسية ─────────────────────────────────────────────────────
/**
 * تحليل الحالة الغني — يُرسل للموديل كل البيانات المتاحة (نوع/حمل/رضاعة/
 * سن/وزن/قياسات/علامات حيوية/شكوى/تاريخ/فحص/فحوصات) ويطلب مخرجات JSON
 * منظمة. عند فشل الاتصال بيرجع بنية فاضية مع insufficientData=true
 * عشان الواجهة تعرض رسالة واضحة للطبيب بدلاً من نتائج مغلوطة.
 */
export const analyzeCaseDeeply = async (
  input: CaseAnalysisInput,
): Promise<CaseAnalysisResult> => {
  const totalMonths = (input.ageYears || 0) * 12 + (input.ageMonths || 0);
  const vitalsSummary = buildVitalsSummary(input.vitals);
  // ملخص حالة الأنثى (حمل/رضاعة) — يظهر فقط للإناث
  const femaleContext = buildFemaleContext(input.gender, input.pregnant, input.breastfeeding);
  // النوع نفسه — male / female / unspecified
  const genderLabel = input.gender === 'male'
    ? 'Male'
    : input.gender === 'female'
      ? `Female${femaleContext}`
      : 'Gender not specified';

  // قائمة الوزن/الطول/BMI (إن وُجد)
  const weight = Number.isFinite(input.weightKg) && input.weightKg > 0
    ? `${input.weightKg} kg`
    : 'not recorded';
  const height = typeof input.heightCm === 'number' && input.heightCm > 0
    ? `${input.heightCm} cm`
    : 'not recorded';

  // Prompt محسّن (تقليص ~40%): شلنا الفواصل الزخرفية والشرح المكرر — حافظنا على
  // كل القواعد الأمنية الحرجة (حمل/رضاعة/أطفال/علامات حيوية/ممنوع أدوية) والـ schema.
  const prompt = `Senior Family Medicine Consultant. Produce a structured case workup from ONLY the data below. Don't invent symptoms/findings/history.

PATIENT
Gender: ${genderLabel}
Age: ${input.ageYears}y ${input.ageMonths}m ${input.ageDays}d (${totalMonths}mo)
Weight: ${weight}, Height: ${height}
Vitals: ${vitalsSummary}
Complaint: ${toTrimmed(input.complaint) || 'NOT PROVIDED'}
History: ${toTrimmed(input.medicalHistory) || 'NOT PROVIDED'}
Exam: ${toTrimmed(input.examination) || 'NOT PROVIDED'}
Prior investigations: ${toTrimmed(input.investigations) || 'NOT PROVIDED'}

SAFETY RULES
- If pregnant/breastfeeding → reflect in DDx and must-not-miss (ectopic, preeclampsia, mastitis, etc).
- If age<18 → pediatric-aware reasoning (weight-based, age-specific conditions).
- Vital red flags (e.g., fever+tachycardia+hypotension→sepsis) MUST surface in Red Flags or Must-Not-Miss.
- Never propose medications, doses, or brands.
- If data too sparse for meaningful workup: set insufficientData=true, keep arrays short/empty, write brief Arabic note in insufficientDataNote.

OUTPUT (strict JSON, no fences, no prose):
{
  "differentialDiagnosesIntro": "1 short English sentence (≤25 words) tying symptoms to why these DDx matter.",
  "differentialDiagnoses": [
    {"diagnosis":"<English disease>","reasoning":"<1-2 English sentences linking symptoms to DDx>","isMostLikely":true},
    {"diagnosis":"<...>","reasoning":"<...>","isMostLikely":false},
    {"diagnosis":"<...>","reasoning":"<...>","isMostLikely":false}
  ],
  "mustNotMiss": [{"diagnosis":"<English life-threatening>","reasoning":"<1-2 English sentences>","alreadyInDDx":false}],
  "suggestedInvestigations": [{"nameEn":"<Standard test e.g. CBC, CRP, U/S abdomen, ECG>","reasonAr":"<سبب قصير عربي مصري>"}],
  "importantInstructionsAr": ["<تعليمة مصرية بسيطة ≤15 كلمة بدون أدوية>"],
  "missingInformation": ["<Short English question that could change diagnosis>"],
  "redFlags": ["<Short English urgent sign; [] if none>"],
  "insufficientData": false,
  "insufficientDataNote": ""
}

COUNTS
- differentialDiagnoses: exactly 3, ordered most→least likely (only first isMostLikely=true).
- mustNotMiss: exactly 3 life-threatening. alreadyInDDx=true if overlaps DDx.
- suggestedInvestigations: 3-6, only confirmatory/exclusionary tests (no routine filler).
- importantInstructionsAr: 3-6 lines.
- missingInformation: 2-5.
- redFlags: 0-5.`;

  try {
    // thinking=500: سقف متوسط للتفكير — يديلنا جودة سريرية (ترتيب DDx،
    // اكتشاف Must-Not-Miss، ربط الأعراض) بدون تضخم التكلفة. الاختبارات بتظهر
    // إن أغلب الحالات بتحتاج ~300-500 token تفكير، والباقي زيادة هدر.
    // temperature منخفضة (0.2) لثبات المخرجات السريرية.
    const responseText = await generateContentWithSecurity(prompt, {
      model: GEMINI_MODEL,
      responseMimeType: 'application/json',
      temperature: 0.2,
      thinkingBudget: 500,
    });

    const parsed = tryParseJson(responseText || '{}');
    if (!parsed) {
      // الموديل رجّع JSON مش صالح — نرجع بنية فاضية مع تنبيه البيانات غير كافية
      return {
        differentialDiagnoses: [],
        differentialDiagnosesIntro: '',
        mustNotMiss: [],
        suggestedInvestigations: [],
        importantInstructionsAr: [],
        missingInformation: [],
        redFlags: [],
        insufficientData: true,
        insufficientDataNote: 'تعذّر تحليل استجابة الذكاء الاصطناعي. حاول مرة أخرى.',
      };
    }

    return sanitizeAnalysis(parsed);
  } catch (error) {
    // خطأ في الشبكة أو في الـ gateway — نرجع بنية فاضية مفهومة بدلاً من رمي الاستثناء
    // عشان ما نكسرش الفلو الأساسي (ترجمة البيانات بتستمر)
    console.error('Deep case analysis failed:', error);
    return {
      differentialDiagnoses: [],
      differentialDiagnosesIntro: '',
      mustNotMiss: [],
      suggestedInvestigations: [],
      importantInstructionsAr: [],
      missingInformation: [],
      redFlags: [],
      insufficientData: true,
      insufficientDataNote: 'حدث خطأ أثناء الاتصال بالذكاء الاصطناعي لتحليل الحالة.',
    };
  }
};
