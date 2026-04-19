import { generateContentWithSecurity, GEMINI_MODEL, tryParseJson } from './geminiUtils';

/**
 * خدمة أدوات الأدوية المعتمدة على الذكاء الاصطناعي (Gemini Drug Tools Service)
 * توفر ميزات متقدمة للأطباء مثل:
 * 1. فحص التداخلات الدوائية (Drug Interactions)
 * 2. حساب تعديل الجرعات لمرضى القصور الكلوي (Renal Dose Adjustment)
 * 3. التحقق من أمان الأدوية أثناء الحمل والرضاعة (Pregnancy & Breastfeeding Safety)
 */

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severityLevel: 'minor' | 'moderate' | 'major' | 'contraindicated';
  mechanism: string;
  clinicalEffects: string;
  recommendations: string;
  source: string;
}

export interface InteractionsResult {
  interactions: DrugInteraction[];
  overallRisk: 'low' | 'moderate' | 'high' | 'contraindicated';
  generalAdvice: string;
  references: string[];
}

/**
 * فحص التداخلات الدوائية لمجموعة من الأدوية باستخدام معاينة اكلينيكية ذكية
 */
export const checkDrugInteractions = async (
  drugs: Array<{ name: string; genericName: string }>
): Promise<InteractionsResult> => {

  const drugList = drugs.map((d, idx) => `${idx + 1}. ${d.name} (${d.genericName})`).join('\n');

  const prompt = `
    ACT AS: Clinical Pharmacist Expert.

    DRUGS TO CHECK:
    ${drugList}

    TASK:
    Identify clinically significant interactions.

    SOURCES:
    Use MAJOR trusted clinical databases (lexicomp, bnf, drugs.com, medscape).

    OUTPUT REQUIREMENTS:
    1. **BE DIRECT**: No fluff. Doctors are busy.
    2. **CONCISE**: Short sentences.
    3. **LANGUAGE**: Professional Arabic.
    4. **NO "SUPPORTED BY"**: Do not mention the source in the output unless critical.

    OUTPUT SCHEMA (JSON):
    {
      "interactions": [
        {
          "drug1": "Drug A",
          "drug2": "Drug B",
          "severityLevel": "minor|moderate|major|contraindicated",
          "mechanism": "Brief mechanism",
          "clinicalEffects": "What happens?",
          "recommendations": "Actionable advice",
          "source": "DB Name"
        }
      ],
      "overallRisk": "low|moderate|high|contraindicated",
      "generalAdvice": "One-line clinical summary",
      "references": ["List of sources used"]
    }
  `;

  try {
    const responseText = await generateContentWithSecurity(prompt, {
      model: GEMINI_MODEL,
      responseMimeType: 'application/json',
      temperature: 0.1
    });

    const result = tryParseJson(responseText || '{}') || {};
    return {
      interactions: result.interactions || [],
      overallRisk: result.overallRisk || 'low',
      generalAdvice: result.generalAdvice || 'لا توجد تداخلات دوائية حرجة ظاهرة.',
      references: result.references || ['Medscape Drug Interactions']
    };
  } catch (error) {
    console.error('Drug Interactions Check Error:', error);
    throw new Error('حدث خطأ في فحص التداخلات الدوائية. يرجى المحاولة مرة أخرى.');
  }
};

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

export interface PregnancySafetyResult {
  drugName: string;
  genericName?: string;
  pregnancyCategory: string;
  pregnancySafety: {
    trimester1: string;
    trimester2: string;
    trimester3: string;
    overall: string;
  };
  breastfeedingSafety: {
    safety: string;
    riskLevel: 'safe' | 'caution' | 'unsafe' | 'unknown';
    recommendations: string;
    milkTransfer: string;
  };
  clinicalNotes: string[];
  references: string[];
}

/**
 * فحص أمان الدواء أثناء الحمل والرضاعة باستخدام الذكاء الاصطناعي
 */
export const checkPregnancySafety = async (
  drugName: string,
  genericName?: string
): Promise<PregnancySafetyResult> => {
  const prompt = `
    ACT AS: Clinical Pharmacist Expert specializing in Obstetric and Perinatal Pharmacology.

    AUDIENCE: This information is for PHYSICIANS/CLINICIANS, NOT for patients. Use professional medical terminology and clinical language.

    DRUG TO CHECK:
    - Brand Name: ${drugName}
    ${genericName ? `- Generic Name: ${genericName}` : ''}

    TASK:
    Provide comprehensive clinical safety information for pregnancy and breastfeeding to assist physicians in making informed prescribing decisions.

    SOURCES:
    Use MAJOR trusted clinical databases (FDA Pregnancy Categories, Briggs Drugs in Pregnancy and Lactation, LactMed, BNF, UpToDate, Drugs.com).

    OUTPUT REQUIREMENTS:
    1. **TARGET AUDIENCE**: Write for PHYSICIANS, not patients. Use clinical terminology.
    2. **BE VERY CONCISE**: Maximum 1-2 sentences per field. No fluff. Get straight to the point.
    3. **CLINICAL LANGUAGE**: Use professional medical Arabic with appropriate technical terms.
    4. **EVIDENCE-BASED**: Reference clinical data, teratogenicity risks when critical.
    5. **ACCURACY**: If data is limited, state "البيانات غير كافية" briefly.
    6. **BRIEF FORMAT**: Keep all text SHORT. Physicians need quick reference, not essays.

    OUTPUT SCHEMA (JSON):
    {
      "drugName": "${drugName}",
      "genericName": "${genericName || 'N/A'}",
      "pregnancyCategory": "A|B|C|D|X|N/A",
      "pregnancySafety": {
        "trimester1": "Brief assessment (1 sentence max)",
        "trimester2": "Brief assessment (1 sentence max)",
        "trimester3": "Brief assessment (1 sentence max)",
        "overall": "One-line recommendation"
      },
      "breastfeedingSafety": {
        "safety": "Brief: Compatible/Use with caution/Contraindicated (1 sentence)",
        "riskLevel": "safe|caution|unsafe|unknown",
        "recommendations": "Brief guidance (1 sentence max)",
        "milkTransfer": "Brief: Yes/No/Unknown with key data if critical (1 sentence max)"
      },
      "clinicalNotes": [
        "Very brief note 1 (max 1 sentence)",
        "Very brief note 2 (max 1 sentence)"
      ],
      "references": ["Source 1", "Source 2"]
    }
    `;

  try {
    const responseText = await generateContentWithSecurity(prompt, {
      model: GEMINI_MODEL,
      responseMimeType: 'application/json',
      temperature: 0.1
    });

    const result = tryParseJson(responseText || '{}') || {};
    return {
      drugName: result.drugName || drugName,
      genericName: result.genericName || genericName,
      pregnancyCategory: result.pregnancyCategory || 'N/A',
      pregnancySafety: result.pregnancySafety || {
        trimester1: 'لا توجد بيانات كافية.',
        trimester2: 'لا توجد بيانات كافية.',
        trimester3: 'لا توجد بيانات كافية.',
        overall: 'يرجى الرجوع إلى مرجع دوائي موثوق قبل الاستخدام.'
      },
      breastfeedingSafety: result.breastfeedingSafety || {
        safety: 'لا توجد بيانات كافية.',
        riskLevel: 'unknown',
        recommendations: 'يرجى تقييم الفائدة مقابل المخاطر قبل الاستخدام.',
        milkTransfer: 'غير معروف'
      },
      clinicalNotes: result.clinicalNotes || [],
      references: result.references || ['General Pharmacology References']
    };
  } catch (error) {
    console.error("Pregnancy Safety Check Error:", error);
    throw new Error("حدث خطأ في فحص الأمان أثناء الحمل. الرجاء المحاولة لاحقاً.");
  }
};
