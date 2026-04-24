import { generateContentWithSecurity, GEMINI_MODEL, tryParseJson } from './geminiUtils';

/**
 * خدمة أدوات الأدوية المعتمدة على الذكاء الاصطناعي (Gemini Drug Tools Service)
 *
 * بقت فيها دالة واحدة بس: حساب تعديل الجرعات لمرضى القصور الكلوي.
 *
 * التاريخ (2026-04): اتحذفت دوال checkDrugInteractions و checkPregnancySafety
 * لأنهم اتنقلوا لشاشة «كشف جديد» في ملفات منفصلة:
 *   • services/geminiDrugInteractionsService.ts (مع كاش + prompt أدق)
 *   • services/geminiPregnancySafetyService.ts (مع تصنيف حمل ورضاعة + كاش per-drug)
 */

/**
 * حساب تعديل الجرعات لمرضى الكلى بناءً على معدل تصفية الكرياتينين (CrCl)
 */
export const calculateRenalDoseAdjustment = async (
  drugName: string,
  crcl: number,
  patientData: { age: number; weight: number; gender: string; scr: number }
): Promise<any> => {
  const prompt = `
    You are a Medical AI Assistant specializing in Renal Dosing.

    PATIENT CONTEXT:
    - Gender: ${patientData.gender}
    - Age: ${patientData.age} years
    - Weight: ${patientData.weight} kg
    - Serum Creatinine: ${patientData.scr} mg/dL
    - Calculated CrCl: ${crcl} ml/min

    DRUG: "${drugName}"

    YOUR GOAL:
    Calculate the recommended dose adjustment for this patient.

    INSTRUCTIONS:
    1. If the drug name is unclear, make your best guess based on similar drug names.
    2. If specific data for this drug is missing, provide a recommendation based on the pharmacological class or general renal dosing principles.
    3. DO NOT RETURN "NO DATA". Provide a helpful recommendation.
    4. Translate all recommendations and reasoning into Arabic.

    EXAMPLE OUTPUT (JSON):
    {
      "status": "adjust",
      "recommendation": "تعديل الجرعة إلى 500 مجم كل 24 ساعة",
      "reasoning": "...",
      "reference": "Renal Drug Handbook",
      "criticalNote": "المتابعة السريرية الدقيقة مطلوبة"
    }

    RESPONSE (JSON ONLY):
  `;

  try {
    const responseText = await generateContentWithSecurity(prompt, {
      model: GEMINI_MODEL,
      responseMimeType: 'application/json',
      temperature: 0.1
    });

    const parsed = tryParseJson(responseText || '{}') || {};

    return {
      status: parsed.status || 'normal',
      recommendation: parsed.recommendation || 'راجع الجرعة حسب وظائف الكلى الحالية.',
      reasoning: parsed.reasoning || `تم حساب CrCl بقيمة ${crcl} مل/دقيقة، لذا يلزم ضبط الجرعة وفق حالة المريض.`,
      reference: parsed.reference || 'General Nephrology Guidelines',
      criticalNote: parsed.criticalNote || null
    };
  } catch (error: any) {
    console.error('Renal Dose API Error:', error);
    return {
      status: 'avoid',
      recommendation: 'تعذر توليد توصية دقيقة. يُفضل مراجعة مرجع كلوي موثوق قبل الوصف.',
      reasoning: `تعذر إكمال الحساب التلقائي مع قيمة CrCl = ${crcl} مل/دقيقة.`,
      reference: 'N/A',
      criticalNote: error.message
    };
  }
};
