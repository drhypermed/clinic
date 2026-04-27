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
interface DifferentialDiagnosisItem {
  diagnosis: string;      // اسم المرض بالإنجليزية (مصطلح سريري)
  reasoning: string;      // المنطق السريري (1-2 جملة بالإنجليزية)
  isMostLikely: boolean;  // هل هذا الأكثر احتمالاً؟ (الأول فقط = true)
}

/** عنصر في قائمة الحالات الخطيرة التي لا يجب تفويتها */
interface MustNotMissItem {
  diagnosis: string;      // اسم الحالة بالإنجليزية
  reasoning: string;      // لماذا خطيرة / لماذا لا تُفوَّت (إنجليزي قصير)
  alreadyInDDx: boolean;  // هل مذكورة في الـ DDx؟ (لو نعم نضع ⚠️ بدلاً من التكرار)
}

/** فحص مقترح — اسم إنجليزي وسبب عربي */
interface SuggestedInvestigationItem {
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

  // ── التشخيصات التفريقية: 1-4 (مرن — كانت ثابتة 3 قبل كده).
  //    الموديل بيرجع 1 لو الحالة pathognomonic، أو 4 لو الحالة معقدة.
  //    دايماً أول واحد بس = isMostLikely=true.
  const rawDDx = Array.isArray(obj.differentialDiagnoses) ? obj.differentialDiagnoses : [];
  const ddx: DifferentialDiagnosisItem[] = rawDDx
    .slice(0, 4)
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
interface CaseAnalysisInput {
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
  // ─ تخصص الطبيب — يُمرَّر من profile الطبيب (Arabic or English).
  //   لو موجود، الموديل يلعب دور استشاري في هذا التخصص ويكيّف الـDDx والفحوصات
  //   على نطاق التخصص بدل ما يجاوب كطبيب أسرة دائماً.
  //   لو غير موجود (signup قديم) → ينحاز للنمط العام (طب أسرة).
  doctorSpecialty?: string;
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

  // ─ تحديد التخصص: لو الطبيب مش محدد تخصص (signup قديم) نوع الافتراض = طب أسرة.
  //   التخصص بيدخل البرومبت كـrole + بيوجّه الـDDx لمدى التخصص.
  const specialty = (input.doctorSpecialty || '').trim();
  const consultantRole = specialty
    ? `Senior consultant in ${specialty} (MD, board-certified in this specialty)`
    : 'Senior Family Medicine Consultant (MD, board-certified)';
  const specialtyGuidance = specialty
    ? `\n═══ SPECIALTY-AWARE REASONING ═══
- You are practicing as a **${specialty}** specialist. Tailor differential diagnoses, must-not-miss conditions, and suggested investigations to your specialty's scope and most common presentations.
- Use specialty-standard terminology, classification systems, and reasoning frameworks (e.g., DSM-5 for psychiatry, NYHA for cardiology, GOLD for pulmonology, DSM lesion description for dermatology, NIHSS/GCS for neurology, Salter-Harris for pediatric orthopedics, FIGO for gynecology, etc. — apply whichever frameworks fit your specialty).
- For symptoms that overlap multiple specialties, prioritize conditions a ${specialty} specialist would commonly see in clinic — but DO NOT miss life-threatening cross-specialty emergencies (cardiac, neurological, sepsis, etc.) in the must-not-miss list.
- Suggested investigations should reflect tests a ${specialty} clinic would order, not generic primary-care panels.`
    : '';

  // Prompt محسّن (تقليص ~40%): شلنا الفواصل الزخرفية والشرح المكرر — حافظنا على
  // كل القواعد الأمنية الحرجة (حمل/رضاعة/أطفال/علامات حيوية/ممنوع أدوية) والـ schema.
  const prompt = `${consultantRole}. Produce a structured case workup based ONLY on the patient data below. Zero tolerance for hallucination.${specialtyGuidance}

PATIENT
Gender: ${genderLabel}
Age: ${input.ageYears}y ${input.ageMonths}m ${input.ageDays}d (${totalMonths}mo)
Weight: ${weight}, Height: ${height}
Vitals: ${vitalsSummary}
Complaint: ${toTrimmed(input.complaint) || 'NOT PROVIDED'}
History: ${toTrimmed(input.medicalHistory) || 'NOT PROVIDED'}
Exam: ${toTrimmed(input.examination) || 'NOT PROVIDED'}
Prior investigations: ${toTrimmed(input.investigations) || 'NOT PROVIDED'}

═══ ABSOLUTE ANTI-HALLUCINATION RULES ═══
1. Use ONLY the data provided above. NEVER invent symptoms, findings, history, or vital signs not stated.
2. If the stated symptoms don't fit a common disease pattern → say so in missingInformation. Don't force a diagnosis.
3. Every DDx reasoning MUST cite at least one specific symptom/finding from the data above. NO generic statements like "common in adults."
4. Every "Must Not Miss" entry MUST be clinically plausible for THIS patient (age/gender/pregnancy state) — not a generic textbook list.
5. If the data is ambiguous or sparse → set insufficientData=true with a brief Arabic note. Don't compensate with speculation.
6. NEVER suggest treatments, medications, doses, or drug brands — only diagnostic reasoning.

═══ MUST-NOT-MISS ADAPTIVE LOGIC (CRITICAL) ═══
The mustNotMiss list size depends on case severity — be honest, NOT paranoid:
• **Empty array []** if ALL these are true:
   - Presentation is clearly mild AND localized (e.g., small skin reaction, sore throat 1 day, mild headache)
   - No red flag in vitals, history, or exam
   - The DDx is straightforward and doesn't suggest anything sinister
   - Patient is otherwise healthy adult (not very young, very old, pregnant, immunocompromised)
   Example: dermatology — "small itchy patch on forearm, no systemic symptoms" → mustNotMiss=[]
• **1-2 entries** if the presentation has any concerning feature but is mostly benign.
• **3 entries** ONLY if symptoms are non-specific, severe, or have systemic features that genuinely warrant ruling out life-threatening causes.

NEVER pad the list to reach 3 items "just in case." Padding erodes the doctor's trust in the tool.

═══ CLINICAL SAFETY RULES ═══
- If pregnant/breastfeeding → reflect in DDx and must-not-miss (ectopic, preeclampsia, HELLP, mastitis, etc).
- Vital red flags (e.g., fever+tachycardia+hypotension→sepsis; chest pain+ECG findings→MI) MUST surface in Red Flags or Must-Not-Miss.
- Investigations must be confirmatory/exclusionary for the DDx or Must-Not-Miss — no routine filler.

═══ AGE-BAND REASONING (apply ONLY the band that fits) ═══
- **Neonate (0-28 days)**: Sepsis / hypoglycemia / metabolic disorders / congenital anomalies are top concerns even with mild symptoms. Low threshold for must-not-miss.
- **Infant (1-12 months)**: Bronchiolitis, dehydration, intussusception, UTI, vaccine-preventable conditions matter more than adult patterns.
- **Toddler (1-3 years)**: Foreign body aspiration, febrile convulsions, viral exanthems are common.
- **School age (4-12 years)**: Asthma, allergic rhinitis, viral infections, behavioral issues common; neoplasms rare but important.
- **Adolescent (13-18 years)**: Mental health, eating disorders, sexual health, athletic injuries frequent; consider IBD, autoimmune onset.
- **Adult (18-65 years)**: Standard adult reasoning.
- **Elderly (>65 years)**: ATYPICAL presentations are the norm — pneumonia may present as confusion (not cough), MI as fatigue, UTI as delirium. Polypharmacy adverse effects high. Lower threshold for must-not-miss.

═══ DRUG ALLERGIES & CURRENT MEDICATIONS ═══
- Scan the History field for any mention of allergies, drug reactions, or current medications.
- If found → factor into DDx (e.g., "rash + recent antibiotic" → drug eruption in DDx; "joint pain + statin" → statin myopathy).
- If NOT mentioned and they would change the DDx materially → add a question in missingInformation (e.g., "Any current medications? Any drug allergies?").

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

COUNTS (all adaptive — be honest, not paranoid; never pad to fill quotas)
- differentialDiagnoses: 1-4, ordered most→least likely (only first isMostLikely=true).
   • **1 DDx** if presentation is pathognomonic (e.g., classic chickenpox in unvaccinated child, classic herpes zoster).
   • **2-3 DDx** for typical cases.
   • **4 DDx** only when truly multiple conditions overlap and ranking is ambiguous.
- mustNotMiss: 0-3 entries — adaptive (see "MUST-NOT-MISS ADAPTIVE LOGIC" above). Empty [] is a valid honest answer for clearly mild localized cases.
- suggestedInvestigations: 0-6 entries.
   • Empty [] for clinical diagnoses that need no labs/imaging (e.g., mild URTI, classic contact dermatitis, simple migraine).
   • Otherwise 1-6 confirmatory/exclusionary tests.
- importantInstructionsAr: 0-6 lines.
   • Empty [] if no specific instructions are warranted beyond standard advice.
   • Otherwise focused, actionable items the patient must follow (e.g., "ارجع فوراً لو الحمى زادت عن 39 لأكثر من يوم").
- missingInformation: 0-5 (empty if data is sufficient).
- redFlags: 0-5.`;

  try {
    // ⚙️ إعدادات متوازنة (Balanced Quality/Cost) — تحليل الحالة السريرية
    // ─────────────────────────────────────────────────────────────────────
    // temperature=0: صفر عشوائية — نفس المعيار اللي في التداخلات والحمل. التحليل
    // السريري مجال يحتمل تكرار منطقي، مش عشوائية. مع قواعد anti-hallucination
    // الصارمة في الـ prompt، الموديل هيبقى محكوم على البيانات المقدّمة فقط.
    //
    // thinkingBudget=1000: نقطة التوازن المثلى (Sweet Spot)
    //   • يسمح للموديل يبني سلسلة منطقية: أعراض → DDx → Must-Not-Miss → فحوصات
    //   • يراعى حالة الحمل/الرضاعة/العمر عند الترتيب
    //   • يكتشف الـ red flags الخفية في العلامات الحيوية
    //   • الزيادة لـ 2000 بتجيب تحسين < 5% بتكلفة ضعف.
    const responseText = await generateContentWithSecurity(prompt, {
      model: GEMINI_MODEL,
      responseMimeType: 'application/json',
      temperature: 0,
      thinkingBudget: 1000,
      feature: 'case_analysis', // تتسجل في تقارير الاستهلاك تحت "تحليل الحالة"
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
