// ═══════════════════════════════════════════════════════════════════════════
// خدمة فحص سلامة الدواء أثناء الحمل والرضاعة (Pregnancy + Lactation Safety)
// ───────────────────────────────────────────────────────────────────────────
// الغرض: إرسال قائمة أدوية مختارة (يحددها الطبيب من الروشتة) لـ Gemini ليُرجع
// تقريراً علمياً دقيقاً ومختصراً (سطر-سطرين) عن سلامة كل دواء في الحمل والرضاعة،
// مستنداً على المراجع العلمية المعتمدة (FDA, ACOG, Briggs, LactMed/NIH, TGA).
// بدون هلوسة — كل حكم مبني على أدلة من مصدر محدد.
//
// التقرير يشمل لكل دواء:
//   1) تصنيف الحمل (FDA Category A/B/C/D/X — المعيار الأوسع إكلينيكياً)
//   2) تصنيف الرضاعة (LactMed L1-L5 من NIH — المعيار الموثوق للرضاعة)
//   3) المستوى العام (آمن/حذر/تجنب/ممنوع) — يعكس الأسوأ بين الحمل والرضاعة
//   4) السبب العلمي المختصر جداً (سطر واحد ≤20 كلمة) — يجمع الحمل+الرضاعة
//   5) المصدر العلمي الموثوق (1-2 مرجع max)
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

/** تقييم سلامة دواء واحد (حمل + رضاعة) */
export interface PregnancyDrugAssessment {
  drugName: string;               // اسم الدواء (كما كتبه الطبيب)
  level: PregnancySafetyLevel;    // التصنيف العام = الأسوأ بين الحمل والرضاعة
  fdaCategory?: string;           // A / B / C / D / X — تصنيف الحمل FDA
  lactationCategory?: string;     // L1 / L2 / L3 / L4 / L5 — تصنيف الرضاعة LactMed
  evidence: string;               // السبب العلمي المختصر (≤20 كلمة، سطر-سطرين)
  recommendation: string;         // مُحتفظ به للتوافق مع الكاش القديم (90 يوم)
  riskTrimester: RiskTrimester;   // الثلث الأكثر خطورة في الحمل
  references: string[];           // المصادر (FDA, ACOG, Briggs, LactMed)
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

/** تطبيع تصنيف الحمل FDA — قيم مقبولة فقط A/B/C/D/X */
const normalizeFdaCategory = (v: unknown): string | undefined => {
  const s = toTrimmed(v).toUpperCase();
  if (s === 'A' || s === 'B' || s === 'C' || s === 'D' || s === 'X') return s;
  return undefined; // أي قيمة غريبة تتشال لتجنب إظهار شارة مضللة
};

/** تطبيع تصنيف الرضاعة LactMed/Hale — قيم مقبولة فقط L1..L5 */
const normalizeLactationCategory = (v: unknown): string | undefined => {
  const s = toTrimmed(v).toUpperCase();
  if (s === 'L1' || s === 'L2' || s === 'L3' || s === 'L4' || s === 'L5') return s;
  return undefined;
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
        // القيم المقيدة A/B/C/D/X و L1..L5 فقط — أي هلوسة تترفض لتفادي شارة مضللة
        fdaCategory: normalizeFdaCategory(it.fdaCategory),
        lactationCategory: normalizeLactationCategory(it.lactationCategory),
        evidence: toTrimmed(it.evidence),
        recommendation: toTrimmed(it.recommendation),
        riskTrimester: normalizeTrimester(it.riskTrimester),
        // نقتصر على مصدرين max لإبقاء البطاقة مرتبة (قبل كان 4)
        references: toStringArray(it.references, 2),
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
  // بنعمل الـ lookups كلها بالـ parallel عشان ما نستنّاش لكل دواء ديسكه.
  const cacheLookups = await Promise.all(
    cleaned.map(async (drug) => {
      const subkey = normalizeDrugForKey(drug);
      const cached = await getCache<PregnancyDrugAssessment>(
        CACHE_KIND_PREGNANCY_SAFETY,
        userId,
        subkey,
        TTL_PREGNANCY_SAFETY,
      );
      return { drug, cached };
    }),
  );
  const cachedAssessments: PregnancyDrugAssessment[] = [];
  const drugsToFetch: string[] = [];
  for (const { drug, cached } of cacheLookups) {
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

  const prompt = `You are a senior obstetric + lactation clinical pharmacist. Assess the safety of each drug BOTH in pregnancy AND in lactation. Base EVERY assessment on established references (FDA Pregnancy Category, ACOG, Briggs Drugs in Pregnancy & Lactation, LactMed/NIH, TGA). DO NOT speculate, guess, or invent data.

DRUGS (exactly as written in prescription):
${drugList}

CATEGORIZATION STANDARDS (USE THESE EXACT SCALES)
- Pregnancy → FDA Category: A | B | C | D | X  (empty only if truly unknown)
- Lactation → Hale's LactMed Risk Category: L1 | L2 | L3 | L4 | L5
  · L1 Safest · L2 Safer · L3 Moderately safe · L4 Possibly hazardous · L5 Contraindicated
- Overall "level" = THE WORSE of the two:
  · safe: FDA A/B AND L1/L2
  · caution: FDA C OR L3 (acceptable short-term with monitoring)
  · avoid: FDA D OR L4 (prefer alternative)
  · contraindicated: FDA X OR L5 (never use)

CRITICAL WRITING RULES
- "evidence" is the SINGLE scientific reason covering BOTH pregnancy AND lactation, in simple Arabic, STRICTLY ≤20 words (1-2 lines max). Be precise and mechanistic — no filler words. Example good style:
  · "Teratogenic (cardiac defects, 1st trimester). ينتقل بكمية كبيرة في اللبن ويسبب خمول للرضيع."
  · "آمن — لا يعبر المشيمة بكميات ذات دلالة، ولا يظهر في اللبن."
- "recommendation" can repeat the action concisely (≤15 words) or be the same as evidence if it already implies action. Keep it short.
- "references" MUST be 1-2 source names ONLY, from trusted references. Preferred: "FDA", "LactMed (NIH)", "Briggs", "ACOG". No URLs, no invented paper titles, no generic "medical literature".
- riskTrimester: pick the trimester where pregnancy risk peaks; "all" if risky throughout; "unknown" if no trimester-specific data.
- If the drug name is ambiguous/unknown, return level="caution", empty categories, and put "بيانات غير كافية — راجع المرجع" in evidence.

OUTPUT (strict JSON, no fences, no prose):
{
  "assessments": [
    {
      "drugName": "<exact name from list>",
      "level": "safe|caution|avoid|contraindicated",
      "fdaCategory": "<A|B|C|D|X or empty>",
      "lactationCategory": "<L1|L2|L3|L4|L5 or empty>",
      "evidence": "<Arabic ≤20 words covering BOTH pregnancy and lactation>",
      "recommendation": "<Arabic ≤15 words actionable verdict>",
      "riskTrimester": "first|second|third|all|unknown",
      "references": ["<FDA|LactMed (NIH)|Briggs|ACOG>", "<optional 2nd source>"]
    }
  ],
  "overallSummaryAr": "<Arabic 1 sentence — overall verdict for pregnancy+lactation>",
  "insufficientData": false,
  "insufficientDataNote": ""
}`;

  try {
    // ⚙️ إعدادات متوازنة (Balanced Quality/Cost) — الحمل والرضاعة
    // ─────────────────────────────────────────────────────────────────────
    // temperature=0: ثبات مطلق — صفر عشوائية. مجال سلامة الحامل لا يحتمل تخمين.
    //
    // thinkingBudget=1000: نقطة التوازن المثلى (Sweet Spot)
    //   • كافي لمراجعة FDA Category + LactMed + Briggs في ~3 أدوية متوسط
    //   • الزيادة لـ 2000 بتجيب تحسين < 5% لكن بتضاعف التكلفة
    //   • مع الكاش per-drug (90 يوم TTL)، نفس الدواء بيفحص مرة واحدة فقط
    //     طول عمره — فالتكلفة الفعلية على المدى البعيد بتتآكل سريع.
    const responseText = await generateContentWithSecurity(prompt, {
      model: GEMINI_MODEL,
      responseMimeType: 'application/json',
      temperature: 0,
      thinkingBudget: 1000,
      feature: 'pregnancy_safety', // تتسجل في تقارير الاستهلاك تحت "أمان الحمل/الرضاعة"
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
    // setCache أصبح async (IndexedDB) فنستخدم void — الحفظ في الخلفية ما يعطلش الـ return.
    for (const assessment of apiResult.assessments) {
      const subkey = normalizeDrugForKey(assessment.drugName);
      void setCache(CACHE_KIND_PREGNANCY_SAFETY, userId, subkey, assessment);
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
