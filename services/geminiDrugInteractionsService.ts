// ═══════════════════════════════════════════════════════════════════════════
// خدمة فحص التداخلات الدوائية (Drug-Drug Interactions Service)
// ───────────────────────────────────────────────────────────────────────────
// الغرض: إرسال قائمة الأدوية المكتوبة في الروشتة لـ Gemini ليُرجع تقريراً
// مختصراً بشكل طبي احترافي عن التداخلات الدوائية بين هذه الأدوية فقط، بدون
// هلوسة (أي تداخل يذكره لازم يكون بين دواءين مذكورين فعلاً). التقرير يشمل:
//   1) قائمة التداخلات (اسم الدواءين، خطورتها، الآلية، التوصية السريرية).
//   2) ملخص عام مختصر.
//   3) علم "لا يوجد تداخلات" لو كانت الأدوية آمنة مع بعض.
//
// التكلفة: Gemini 2.5 Flash + thinkingBudget=300 ≈ رخيص جداً.
// عادي روشتة فيها 2-6 أدوية → طلب صغير مش هيأثر على التكلفة عند 1k+ طبيب.
// ═══════════════════════════════════════════════════════════════════════════

import { generateContentWithSecurity, GEMINI_MODEL, tryParseJson } from './geminiUtils';
import {
  CACHE_KIND_DRUG_INTERACTIONS,
  TTL_DRUG_INTERACTIONS,
  getCache,
  hashDrugList,
  setCache,
} from './aiResultsCache';

// ─── أنواع النتيجة الخارجية ──────────────────────────────────────────────
/** خطورة التداخل — 4 مستويات معتمدة طبياً */
export type InteractionSeverity = 'contraindicated' | 'major' | 'moderate' | 'minor';

/** تداخل واحد بين دواءين */
export interface DrugInteraction {
  drugA: string;            // اسم الدواء الأول (كما كتبه الطبيب)
  drugB: string;            // اسم الدواء الثاني
  severity: InteractionSeverity; // مستوى الخطورة
  mechanism: string;        // الآلية باختصار (عربي بسيط)
  recommendation: string;   // التوصية السريرية (عربي بسيط)
}

/** نتيجة الفحص الكاملة */
export interface DrugInteractionsResult {
  hasInteractions: boolean;       // هل فيه تداخلات؟
  interactions: DrugInteraction[]; // قائمة التداخلات (قد تكون فارغة)
  summaryAr: string;              // ملخص عربي مختصر (1-2 جملة)
  insufficientData: boolean;      // هل الأدوية غير كافية للفحص (أقل من 2)؟
  insufficientDataNote?: string;  // ملاحظة للطبيب عند نقص البيانات
}

// ─── أدوات داخلية ────────────────────────────────────────────────────────
const toText = (v: unknown): string => (v ?? '').toString();
const toTrimmed = (v: unknown): string => toText(v).trim();

/** ضمان إن severity قيمة صالحة — لو الموديل رجّع أي حاجة تانية نعتبرها "moderate" */
const normalizeSeverity = (v: unknown): InteractionSeverity => {
  const s = toTrimmed(v).toLowerCase();
  if (s === 'contraindicated' || s === 'major' || s === 'moderate' || s === 'minor') {
    return s;
  }
  return 'moderate';
};

/** تنظيف استجابة الموديل وضمان البنية حتى لو جاء ناقص */
const sanitizeResult = (raw: unknown, drugNames: string[]): DrugInteractionsResult => {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;

  // قائمة أدوية موحّدة lowercase للتحقق من عدم الهلوسة
  // أي تداخل يذكر دواء مش في القائمة = نتجاهله (حماية من الهلوسة)
  const drugsLower = new Set(drugNames.map((d) => d.toLowerCase().trim()));

  const rawInteractions = Array.isArray(obj.interactions) ? obj.interactions : [];
  const interactions: DrugInteraction[] = rawInteractions
    .map((item) => {
      const it = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
      return {
        drugA: toTrimmed(it.drugA),
        drugB: toTrimmed(it.drugB),
        severity: normalizeSeverity(it.severity),
        mechanism: toTrimmed(it.mechanism),
        recommendation: toTrimmed(it.recommendation),
      };
    })
    // فلترة: ما نقبلش تداخل فيه دواء مش مذكور أصلاً في الروشتة
    .filter((x) => x.drugA && x.drugB && x.drugA.toLowerCase() !== x.drugB.toLowerCase())
    .filter((x) => drugsLower.has(x.drugA.toLowerCase()) && drugsLower.has(x.drugB.toLowerCase()))
    .slice(0, 15); // حد أقصى 15 تداخل (واقعياً نادر يتعدى 10)

  return {
    hasInteractions: interactions.length > 0,
    interactions,
    summaryAr: toTrimmed(obj.summaryAr),
    insufficientData: obj.insufficientData === true,
    insufficientDataNote: toTrimmed(obj.insufficientDataNote) || undefined,
  };
};

// ─── الدالة الرئيسية ─────────────────────────────────────────────────────
/**
 * فحص التداخلات الدوائية بين قائمة الأدوية المعطاة.
 * - `drugNames`: أسماء الأدوية كما كُتبت في الروشتة (عربي/إنجليزي/خليط).
 * - `userId`: اختياري — لو اتمرر بيتحفظ الكاش per-user.
 *
 * 💰 الكاش: نفس مجموعة الأدوية (بأي ترتيب/حالة حروف) بترجع من localStorage
 * بدون استدعاء Gemini — توفير حقيقي على الـ quota والتكلفة عند 1k+ طبيب.
 */
export const checkDrugInteractions = async (
  drugNames: string[],
  userId?: string | null,
): Promise<DrugInteractionsResult> => {
  // تنظيف القائمة من الفاضي والمكرر
  const cleaned = Array.from(
    new Set(
      drugNames
        .map((d) => (d || '').trim())
        .filter((d) => d.length > 0),
    ),
  );

  // لازم ≥2 أدوية عشان يكون فيه تداخل
  if (cleaned.length < 2) {
    return {
      hasInteractions: false,
      interactions: [],
      summaryAr: '',
      insufficientData: true,
      insufficientDataNote: 'محتاج على الأقل دوائين في الروشتة لفحص التداخلات.',
    };
  }

  // ─── فحص الكاش أولاً ────────────────────────────────────────────────────
  // المفتاح = hash لمجموعة الأدوية (مرتّبة ومطبّعة) — يعني ["Panadol","Augmentin"]
  // و ["augmentin","PANADOL"] يعطوا نفس الـ hash ونفس نتيجة الكاش.
  const cacheKey = hashDrugList(cleaned);
  const cached = getCache<DrugInteractionsResult>(
    CACHE_KIND_DRUG_INTERACTIONS,
    userId,
    cacheKey,
    TTL_DRUG_INTERACTIONS,
  );
  if (cached) {
    // كاش hit → نرجع فوراً بدون أي مكالمة Gemini
    return cached;
  }

  // قائمة مرقّمة عشان الموديل يلتزم بالأسماء بالظبط (بدون تصحيح أو هلوسة)
  const drugList = cleaned.map((d, i) => `${i + 1}. ${d}`).join('\n');

  const prompt = `You are a senior clinical pharmacist. Analyze drug-drug interactions ONLY between the drugs listed below. Do NOT invent or add drugs not in the list.

DRUGS (exactly as written in prescription):
${drugList}

RULES
- Only report interactions between drugs actually in the list. Use EXACT names from the list (copy verbatim).
- Report clinically significant interactions only (contraindicated / major / moderate). Skip trivial minor interactions unless relevant.
- If two drugs have no known clinically significant interaction, don't include them.
- If a drug name is unclear or unknown, skip it silently (do not guess).
- Base every interaction on established evidence (Lexicomp, Stockley, Micromedex). No speculation.
- Mechanism and recommendation must be in simple Arabic (Egyptian dialect acceptable), ≤20 words each, professional medical tone.
- If NO interactions found: return empty interactions array + brief Arabic summary like "لا توجد تداخلات دوائية ذات أهمية إكلينيكية بين الأدوية المذكورة."

SEVERITY LEVELS
- contraindicated: ممنوع تماماً الاستخدام المشترك
- major: خطر حقيقي — يحتاج تعديل أو بديل
- moderate: يحتاج مراقبة أو تعديل جرعة
- minor: تأثير محدود — للعلم فقط

OUTPUT (strict JSON, no fences, no prose):
{
  "interactions": [
    {
      "drugA": "<exact name from list>",
      "drugB": "<exact name from list>",
      "severity": "contraindicated|major|moderate|minor",
      "mechanism": "<Arabic ≤20 words — الآلية>",
      "recommendation": "<Arabic ≤20 words — التوصية الإكلينيكية>"
    }
  ],
  "summaryAr": "<Arabic 1-2 sentences overall summary>",
  "insufficientData": false,
  "insufficientDataNote": ""
}`;

  try {
    // temperature منخفضة جداً (0.1) للحد من الهلوسة — فحص الأدوية لازم يكون دقيق
    // thinkingBudget=400: كافي لتذكر التداخلات الشائعة بدون إسراف
    const responseText = await generateContentWithSecurity(prompt, {
      model: GEMINI_MODEL,
      responseMimeType: 'application/json',
      temperature: 0.1,
      thinkingBudget: 400,
    });

    const parsed = tryParseJson(responseText || '{}');
    if (!parsed) {
      return {
        hasInteractions: false,
        interactions: [],
        summaryAr: '',
        insufficientData: true,
        insufficientDataNote: 'تعذّر تحليل استجابة الذكاء الاصطناعي. حاول مرة أخرى.',
      };
    }

    const result = sanitizeResult(parsed, cleaned);
    // نحفظ الكاش فقط لو النتيجة صالحة — الأخطاء ما بتتخزنش عشان الطبيب يعيد المحاولة
    if (!result.insufficientData) {
      setCache(CACHE_KIND_DRUG_INTERACTIONS, userId, cacheKey, result);
    }
    return result;
  } catch (error) {
    console.error('Drug interactions check failed:', error);
    return {
      hasInteractions: false,
      interactions: [],
      summaryAr: '',
      insufficientData: true,
      insufficientDataNote: 'حدث خطأ أثناء الاتصال بالذكاء الاصطناعي لفحص التداخلات.',
    };
  }
};
