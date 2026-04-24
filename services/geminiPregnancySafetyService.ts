// ═══════════════════════════════════════════════════════════════════════════
// خدمة فحص سلامة الدواء أثناء الحمل (Pregnancy Drug Safety Service)
// ───────────────────────────────────────────────────────────────────────────
// الغرض: إرسال قائمة أدوية مختارة (يحددها الطبيب من الروشتة) لـ Gemini ليُرجع
// تقريراً مختصراً طبياً عن سلامة كل دواء في الحمل، مستنداً على المراجع العلمية
// المعتمدة (FDA, TGA, ACOG, LactMed). بدون هلوسة — كل حكم مبني على أدلة.
//
// التقرير يشمل لكل دواء:
//   1) تصنيف السلامة (FDA Category لو متوفر + تصنيف بسيط: آمن / حذر / تجنب / ممنوع)
//   2) الأدلة / الآلية (مختصرة)
//   3) التوصية السريرية (عربي بسيط — هل يُعطى؟ بديل؟ متى؟)
//   4) الثلث الأخطر من الحمل (إن وُجد)
//
// التكلفة: Gemini 2.5 Flash + thinkingBudget=500 (أعلى من التداخلات لأن الاعتماد
// على المراجع يحتاج دقة أكتر). روشتة الحامل نادراً تعدي 5 أدوية → رخيص.
// ═══════════════════════════════════════════════════════════════════════════

import { generateContentWithSecurity, GEMINI_MODEL, tryParseJson } from './geminiUtils';
import {
  CACHE_KIND_PREGNANCY_SAFETY,
  TTL_PREGNANCY_SAFETY,
  getCache,
  normalizeDrugForKey,
  setCache,
} from './aiResultsCache';

// ─── أنواع النتيجة الخارجية ──────────────────────────────────────────────
/** تصنيف السلامة العام — 4 مستويات عملية للطبيب */
export type PregnancySafetyLevel = 'safe' | 'caution' | 'avoid' | 'contraindicated';

/** الثلث الأخطر من الحمل — لو الموديل قدر يحدده */
export type RiskTrimester = 'first' | 'second' | 'third' | 'all' | 'unknown';

/** تقييم سلامة دواء واحد */
export interface PregnancyDrugAssessment {
  drugName: string;               // اسم الدواء (كما كتبه الطبيب)
  level: PregnancySafetyLevel;    // التصنيف العام
  fdaCategory?: string;           // A / B / C / D / X — لو الموديل عرفها
  evidence: string;               // الأدلة/الآلية (عربي بسيط ≤30 كلمة)
  recommendation: string;         // التوصية السريرية (عربي بسيط ≤25 كلمة)
  riskTrimester: RiskTrimester;   // الثلث الأكثر خطورة
  references: string[];           // المراجع (FDA, ACOG, LactMed, Briggs...)
}

/** نتيجة الفحص الكاملة */
export interface PregnancySafetyResult {
  assessments: PregnancyDrugAssessment[]; // تقييم كل دواء
  overallSummaryAr: string;               // ملخص عام مختصر (عربي)
  insufficientData: boolean;              // هل القائمة فارغة؟
  insufficientDataNote?: string;          // ملاحظة للطبيب
}

// ─── أدوات داخلية ────────────────────────────────────────────────────────
const toText = (v: unknown): string => (v ?? '').toString();
const toTrimmed = (v: unknown): string => toText(v).trim();

/** تطبيع مستوى السلامة — أي قيمة غير معروفة → "caution" (الأحوط) */
const normalizeLevel = (v: unknown): PregnancySafetyLevel => {
  const s = toTrimmed(v).toLowerCase();
  if (s === 'safe' || s === 'caution' || s === 'avoid' || s === 'contraindicated') {
    return s;
  }
  return 'caution';
};

/** تطبيع الثلث — أي قيمة غير معروفة → "unknown" */
const normalizeTrimester = (v: unknown): RiskTrimester => {
  const s = toTrimmed(v).toLowerCase();
  if (s === 'first' || s === 'second' || s === 'third' || s === 'all' || s === 'unknown') {
    return s;
  }
  return 'unknown';
};

/** تأكيد أن القيمة مصفوفة نصوص نظيفة بحد أقصى معين */
const toStringArray = (value: unknown, maxItems: number): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map(toTrimmed)
    .filter((s) => s.length > 0)
    .slice(0, maxItems);
};

/** تنظيف استجابة الموديل وضمان البنية */
const sanitizeResult = (raw: unknown, drugNames: string[]): PregnancySafetyResult => {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;

  // أسماء الأدوية المطلوبة (عشان نمنع هلوسة أدوية مش مذكورة)
  const drugsLower = new Set(drugNames.map((d) => d.toLowerCase().trim()));

  const rawAssessments = Array.isArray(obj.assessments) ? obj.assessments : [];
  const assessments: PregnancyDrugAssessment[] = rawAssessments
    .map((item) => {
      const it = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
      return {
        drugName: toTrimmed(it.drugName),
        level: normalizeLevel(it.level),
        fdaCategory: toTrimmed(it.fdaCategory) || undefined,
        evidence: toTrimmed(it.evidence),
        recommendation: toTrimmed(it.recommendation),
        riskTrimester: normalizeTrimester(it.riskTrimester),
        references: toStringArray(it.references, 4),
      };
    })
    // حماية من الهلوسة: الاسم لازم يكون واحد من اللي الطبيب اختاره
    .filter((x) => x.drugName.length > 0 && drugsLower.has(x.drugName.toLowerCase()));

  return {
    assessments,
    overallSummaryAr: toTrimmed(obj.overallSummaryAr),
    insufficientData: obj.insufficientData === true,
    insufficientDataNote: toTrimmed(obj.insufficientDataNote) || undefined,
  };
};

// ─── الدالة الرئيسية ─────────────────────────────────────────────────────
/**
 * فحص سلامة قائمة الأدوية أثناء الحمل. الأدوية تُمرر كما هي مكتوبة في الروشتة
 * (الطبيب اختارها من مودال الاختيار). النتيجة مستندة على المراجع العلمية
 * المعتمدة بدون هلوسة.
 */
export const checkPregnancySafety = async (
  drugNames: string[],
  userId?: string | null,
): Promise<PregnancySafetyResult> => {
  // تنظيف القائمة
  const cleaned = Array.from(
    new Set(
      drugNames
        .map((d) => (d || '').trim())
        .filter((d) => d.length > 0),
    ),
  );

  if (cleaned.length === 0) {
    return {
      assessments: [],
      overallSummaryAr: '',
      insufficientData: true,
      insufficientDataNote: 'اختر على الأقل دواء واحد لفحصه.',
    };
  }

  // ─── فحص الكاش per-drug ────────────────────────────────────────────────
  // كل دواء ليه entry منفصل في الكاش (لأن تقييم كل دواء مستقل عن الباقي).
  // كدا لو الطبيب فحص Panadol + Augmentin قبل كدا، ودلوقتي بيفحص Panadol + Zyrtec،
  // Panadol هييجي من الكاش و Zyrtec هو اللي يتبعت لـ Gemini.
  const cachedAssessments: PregnancyDrugAssessment[] = [];
  const drugsToFetch: string[] = [];
  for (const drug of cleaned) {
    const subkey = normalizeDrugForKey(drug);
    const cached = getCache<PregnancyDrugAssessment>(
      CACHE_KIND_PREGNANCY_SAFETY,
      userId,
      subkey,
      TTL_PREGNANCY_SAFETY,
    );
    if (cached) {
      // نرجع الاسم كما كتبه الطبيب دلوقتي (مش كما كان في الكاش) عشان الـ UI
      // يعرض الاسم المتسق مع الروشتة الحالية
      cachedAssessments.push({ ...cached, drugName: drug });
    } else {
      drugsToFetch.push(drug);
    }
  }

  // لو كل الأدوية من الكاش → نرجع فوراً بدون أي استدعاء Gemini (توفير كامل)
  if (drugsToFetch.length === 0) {
    return {
      assessments: cachedAssessments,
      overallSummaryAr: 'تم استرجاع التقييم من الذاكرة المحلية (بدون استهلاك quota).',
      insufficientData: false,
    };
  }

  // قائمة مرقّمة — فقط الأدوية اللي مش في الكاش
  const drugList = drugsToFetch.map((d, i) => `${i + 1}. ${d}`).join('\n');

  const prompt = `You are a senior obstetric clinical pharmacist. Assess the safety of the following drugs during pregnancy. Base EVERY assessment on established references (FDA, ACOG, Briggs Drugs in Pregnancy, LactMed, TGA). DO NOT speculate or invent data.

DRUGS (exactly as written in prescription):
${drugList}

RULES
- Produce ONE assessment per drug in the list. Use the EXACT drug name from the list (copy verbatim).
- If a drug is unknown or too ambiguous to assess safely, still include it with level="caution" and note the ambiguity in "evidence".
- Evidence and recommendation must be simple professional Arabic (Egyptian medical tone acceptable), no jargon.
- "references" should list 1-3 source names only (e.g., "FDA", "Briggs", "ACOG Committee Opinion", "LactMed"). No URLs, no invented paper titles.
- Keep recommendation actionable: "آمن في الحمل", "تجنب في الثلث الأول — البديل: X", "ممنوع تماماً", etc.
- riskTrimester: pick the trimester where risk is highest; "all" if risky throughout; "unknown" if no specific trimester data.

SAFETY LEVELS
- safe: أدلة كافية تدعم الأمان (FDA A/B, known safe profile)
- caution: يمكن استعماله بحذر مع مراقبة أو لفترات قصيرة (FDA C غالباً)
- avoid: يُفضّل تجنبه ويُستبدل لو أمكن (FDA D أو بيانات غير كافية)
- contraindicated: ممنوع تماماً — تيراتوجين مثبت (FDA X)

OUTPUT (strict JSON, no fences, no prose):
{
  "assessments": [
    {
      "drugName": "<exact name from list>",
      "level": "safe|caution|avoid|contraindicated",
      "fdaCategory": "<A|B|C|D|X or empty>",
      "evidence": "<Arabic ≤30 words — الأدلة/الآلية>",
      "recommendation": "<Arabic ≤25 words — التوصية>",
      "riskTrimester": "first|second|third|all|unknown",
      "references": ["<source name>", "<source name>"]
    }
  ],
  "overallSummaryAr": "<Arabic 1-2 sentences — overall safety verdict>",
  "insufficientData": false,
  "insufficientDataNote": ""
}`;

  try {
    // temperature=0.1: ثبات عالي جداً — سلامة الحمل مجال لا يحتمل تخمين
    // thinkingBudget=500: أعلى شوية من التداخلات لأن الاعتماد على مراجع متعددة
    const responseText = await generateContentWithSecurity(prompt, {
      model: GEMINI_MODEL,
      responseMimeType: 'application/json',
      temperature: 0.1,
      thinkingBudget: 500,
    });

    const parsed = tryParseJson(responseText || '{}');
    if (!parsed) {
      // لو فيه أدوية اتجابت من الكاش قبل، نحافظ عليها ونرجعها بدل ما الطبيب يخسرها
      if (cachedAssessments.length > 0) {
        return {
          assessments: cachedAssessments,
          overallSummaryAr: 'تم عرض النتائج المحفوظة فقط — تعذّر فحص باقي الأدوية الجديدة.',
          insufficientData: false,
        };
      }
      return {
        assessments: [],
        overallSummaryAr: '',
        insufficientData: true,
        insufficientDataNote: 'تعذّر تحليل استجابة الذكاء الاصطناعي. حاول مرة أخرى.',
      };
    }

    // sanitize يقيّد النتائج على أسماء drugsToFetch فقط (مش كل cleaned)
    // عشان ما يحصلش overlap مع اللي في الكاش
    const apiResult = sanitizeResult(parsed, drugsToFetch);

    // ─── حفظ كل دواء جديد في الكاش ────────────────────────────────────────
    // نحفظ كل assessment بمفتاح منفصل = normalized drug name → قابل لإعادة
    // الاستخدام لأي روشتة مستقبلية فيها نفس الدواء.
    for (const assessment of apiResult.assessments) {
      const subkey = normalizeDrugForKey(assessment.drugName);
      setCache(CACHE_KIND_PREGNANCY_SAFETY, userId, subkey, assessment);
    }

    // ─── دمج الكاش + النتائج الجديدة ──────────────────────────────────────
    // الترتيب الأصلي لأدوية الطبيب نحافظ عليه — cachedAssessments + apiResult
    const allAssessments: PregnancyDrugAssessment[] = [
      ...cachedAssessments,
      ...apiResult.assessments,
    ];

    // ملخص مركّب: لو فيه أدوية من الكاش نضيف إشارة ليها
    const hasCached = cachedAssessments.length > 0;
    const summary = apiResult.overallSummaryAr ||
      (hasCached ? 'تم استرجاع جزء من التقييم من الذاكرة المحلية.' : '');

    return {
      assessments: allAssessments,
      overallSummaryAr: summary,
      insufficientData: false,
    };
  } catch (error) {
    console.error('Pregnancy safety check failed:', error);
    // لو حصل خطأ ومعانا نتائج من الكاش، نرجعها بدل ما نخلي الشاشة فاضية
    if (cachedAssessments.length > 0) {
      return {
        assessments: cachedAssessments,
        overallSummaryAr: 'تم عرض النتائج المحفوظة فقط — حدث خطأ في جلب باقي الأدوية.',
        insufficientData: false,
      };
    }
    return {
      assessments: [],
      overallSummaryAr: '',
      insufficientData: true,
      insufficientDataNote: 'حدث خطأ أثناء الاتصال بالذكاء الاصطناعي لفحص سلامة الحمل.',
    };
  }
};
