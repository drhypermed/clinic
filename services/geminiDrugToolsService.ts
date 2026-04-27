import { generateContentWithSecurity, GEMINI_MODEL, tryParseJson } from './geminiUtils';

/**
 * خدمة أدوات الأدوية المعتمدة على الذكاء الاصطناعي (Gemini Drug Tools Service)
 *
 * بقت فيها دالة واحدة بس: حساب تعديل الجرعات لمرضى القصور الكلوي.
 *
 * إصلاح أمان حرج (2026-04-27):
 *   البرومبت السابق كان بيقول للموديل "make your best guess" + "DO NOT RETURN NO DATA".
 *   ده كان بيشجّع الهلوسة صراحة في قرارات طبية حساسة (جرعات الكلى ممكن تكون سامة).
 *   الإصدار ده بيمنع التخمين، بيسمح بـstatus="insufficient_data"، وبيتحقق من
 *   المصادر المعروفة فقط.
 */

// ─ المصادر الكلوية الموثقة المسموح بيها فقط (whitelist).
//   لو الموديل رد بمصدر تاني = نرفض الـ output كـerror.
const ALLOWED_RENAL_REFERENCES = [
  'Renal Drug Handbook',
  'Lexicomp',
  'Micromedex',
  'UpToDate',
  'KDIGO Guidelines',
  'Sanford Guide',
  'FDA Label',
  'Drug Prescribing in Renal Failure (Aronoff)',
];

// ─ الحالات المسموح بها فقط للـstatus
const ALLOWED_STATUSES = ['normal', 'adjust', 'avoid', 'insufficient_data'] as const;
type RenalStatus = typeof ALLOWED_STATUSES[number];

interface RenalDoseResult {
  status: RenalStatus;
  recommendation: string;
  reasoning: string;
  reference: string;
  criticalNote: string | null;
  /** علم تحذيري للواجهة لما الموديل ميقدرش يجاوب بثقة */
  isInsufficientData?: boolean;
}

/**
 * حساب تعديل الجرعات لمرضى الكلى بناءً على معدل تصفية الكرياتينين (CrCl).
 *
 * @returns ينتج result يحتوي status="insufficient_data" لو الموديل مش متأكد —
 *          الواجهة لازم تعرض رسالة "ارجع لمرجع كلوي موثوق" بدل ما تعرض جرعة وهمية.
 */
export const calculateRenalDoseAdjustment = async (
  drugName: string,
  crcl: number,
  patientData: { age: number; weight: number; gender: string; scr: number }
): Promise<RenalDoseResult> => {
  // ─ البرومبت الجديد: قواعد anti-hallucination صريحة على نمط فحص التداخلات (8.5/10).
  //   ممنوع التخمين. لازم مصدر من الـwhitelist. مسموح يقول "insufficient_data".
  const prompt = `
You are a clinical pharmacist specializing in renal dosing. Your output will guide
real medical decisions for a patient with kidney impairment.

═══ PATIENT CONTEXT ═══
- Gender: ${patientData.gender}
- Age: ${patientData.age} years
- Weight: ${patientData.weight} kg
- Serum Creatinine: ${patientData.scr} mg/dL
- Calculated CrCl (Cockcroft-Gault): ${crcl} mL/min

═══ DRUG TO EVALUATE ═══
"${drugName}"

═══ STRICT SAFETY RULES (CRITICAL) ═══
1. **DO NOT GUESS.** If you are not >90% confident about the renal dose adjustment
   for THIS specific drug at THIS CrCl, respond with status="insufficient_data".
2. **DO NOT FABRICATE** dosing recommendations. Only use information you are certain
   comes from the references below.
3. **DO NOT INVENT REFERENCES.** Cite ONLY one of these (exact name match required):
   - Renal Drug Handbook
   - Lexicomp
   - Micromedex
   - UpToDate
   - KDIGO Guidelines
   - Sanford Guide
   - FDA Label
   - Drug Prescribing in Renal Failure (Aronoff)
4. If the drug name is ambiguous or unrecognized → status="insufficient_data".
5. If CrCl > 90 mL/min and the drug has no specific renal warning → status="normal".
6. If the drug is **contraindicated** in this CrCl range → status="avoid".
7. If a documented dose adjustment exists → status="adjust" with EXACT dosing from
   the cited source. Format example: "Reduce to 250 mg every 12 hours" (specific numbers).

═══ STATUS DEFINITIONS ═══
- "normal": Drug requires no renal adjustment at this CrCl.
- "adjust": Drug requires specific dose modification (must include exact numbers).
- "avoid": Drug is contraindicated or strongly discouraged at this CrCl.
- "insufficient_data": You cannot confidently recommend a dose. (PREFER THIS over guessing.)

═══ OUTPUT FORMAT (JSON ONLY, NO MARKDOWN) ═══
{
  "status": "normal" | "adjust" | "avoid" | "insufficient_data",
  "recommendation": "<Arabic, specific. For adjust: exact dose+frequency. For insufficient_data: 'يُرجى الرجوع لمرجع كلوي موثوق'>",
  "reasoning": "<Arabic, ≤30 words, mechanism + why this CrCl matters>",
  "reference": "<EXACT name from whitelist above, or empty string for insufficient_data>",
  "criticalNote": "<Arabic, optional. Critical warnings only (nephrotoxicity, monitoring needed)>"
}

═══ EXAMPLE — confident answer ═══
Drug: "Gentamicin", CrCl: 30 mL/min
{
  "status": "adjust",
  "recommendation": "خفض الجرعة إلى 1.5 ملغم/كغم كل 24 ساعة بدلاً من كل 8 ساعات",
  "reasoning": "الـ Gentamicin يخرج بالكلى مباشرة وله سمية كلوية وأذنية تتراكم في القصور الكلوي",
  "reference": "Renal Drug Handbook",
  "criticalNote": "متابعة Trough Level قبل كل جرعة + قياس وظائف الكلى أسبوعياً"
}

═══ EXAMPLE — uncertain answer (PREFER THIS over guessing) ═══
Drug: "Drug-X" (unknown/rare), CrCl: 40 mL/min
{
  "status": "insufficient_data",
  "recommendation": "يُرجى الرجوع لمرجع كلوي موثوق قبل الوصف",
  "reasoning": "لا توجد بيانات موثقة عن تعديل جرعة هذا الدواء في القصور الكلوي",
  "reference": "",
  "criticalNote": null
}

RESPONSE (JSON ONLY):
`.trim();

  try {
    const responseText = await generateContentWithSecurity(prompt, {
      model: GEMINI_MODEL,
      responseMimeType: 'application/json',
      // temperature=0 (مش 0.1) لقرارات طبية — ميكروأي حركة عشوائية ممكن تغيّر الجرعة.
      temperature: 0,
      // thinkingBudget=1500 (كان 0 تلقائياً) — قرارات الجرعات الكلوية محتاجة تفكير عميق.
      thinkingBudget: 1500,
      feature: 'renal_dose',
    });

    const parsed = tryParseJson(responseText || '{}') || {};
    return sanitizeRenalDoseResult(parsed, crcl);
  } catch (error: any) {
    console.error('Renal Dose API Error:', error);
    // ─ في حالة فشل الـAPI، نرجع insufficient_data بدل ما نخترع جرعة.
    return {
      status: 'insufficient_data',
      recommendation: 'تعذّر الاتصال بالخدمة. يُرجى الرجوع لمرجع كلوي موثوق قبل الوصف.',
      reasoning: `تعذّر إكمال الحساب التلقائي مع قيمة CrCl = ${crcl} مل/دقيقة.`,
      reference: '',
      criticalNote: null,
      isInsufficientData: true,
    };
  }
};

/**
 * تنقية وفحص رد الموديل قبل تسليمه للواجهة.
 *
 * القواعد:
 *   1. status لازم يكون من القائمة المسموحة، وإلا → insufficient_data.
 *   2. reference لازم يكون من الـwhitelist (إلا في حالة insufficient_data).
 *   3. لو status="adjust" بدون أرقام جرعة فعلية → insufficient_data.
 *   4. لو CrCl > 90 و status != "normal" → علم تحذيري (الموديل ممكن غلط).
 */
const sanitizeRenalDoseResult = (raw: any, crcl: number): RenalDoseResult => {
  const rawStatus = String(raw?.status || '').trim().toLowerCase();
  const recommendation = String(raw?.recommendation || '').trim();
  const reasoning = String(raw?.reasoning || '').trim();
  const reference = String(raw?.reference || '').trim();
  const criticalNote = raw?.criticalNote ? String(raw.criticalNote).trim() : null;

  // 1) فحص الـstatus
  const isValidStatus = (ALLOWED_STATUSES as readonly string[]).includes(rawStatus);
  let status: RenalStatus = isValidStatus ? (rawStatus as RenalStatus) : 'insufficient_data';

  // 2) فحص المصدر — لازم يكون من القائمة المعروفة (إلا في insufficient_data).
  //    لو الموديل ادّعى مصدر مخترع، نعتبر النتيجة غير موثوقة.
  if (status !== 'insufficient_data') {
    const referenceIsKnown = ALLOWED_RENAL_REFERENCES.some(
      (allowed) => reference.toLowerCase().includes(allowed.toLowerCase())
    );
    if (!referenceIsKnown) {
      status = 'insufficient_data';
    }
  }

  // 3) فحص "adjust" — لازم تحتوي توصية على أرقام جرعة (mg/ملغ + frequency).
  //    لو قال "adjust" بدون أرقام = هلوسة محتملة.
  if (status === 'adjust') {
    const hasNumbers = /\d/.test(recommendation);
    const hasDoseUnit = /(mg|ملغ|ميكروغرام|مل|gram|جم|unit|وحدة)/i.test(recommendation);
    if (!hasNumbers || !hasDoseUnit) {
      status = 'insufficient_data';
    }
  }

  // 4) لو الـoutput بقى insufficient_data بعد الفحص، نوحّد الرسالة للواجهة.
  if (status === 'insufficient_data') {
    return {
      status,
      recommendation: recommendation || 'يُرجى الرجوع لمرجع كلوي موثوق قبل الوصف.',
      reasoning: reasoning || 'البيانات غير كافية للوصول لتوصية موثوقة لهذا الدواء.',
      reference: '',
      criticalNote,
      isInsufficientData: true,
    };
  }

  return {
    status,
    recommendation,
    reasoning,
    reference,
    criticalNote,
    isInsufficientData: false,
  };
};
