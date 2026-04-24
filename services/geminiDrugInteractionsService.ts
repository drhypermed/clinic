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
  // IndexedDB async — لازم await
  const cached = await getCache<DrugInteractionsResult>(
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

  const prompt = `You are a senior clinical pharmacist (PharmD, BCPS-level). Analyze drug-drug interactions ONLY between the drugs listed below. Zero tolerance for hallucination or speculation.

DRUGS (exactly as written in prescription):
${drugList}

═══ ABSOLUTE ANTI-HALLUCINATION RULES ═══
1. Only report interactions documented in Lexicomp, Stockley's Drug Interactions, or Micromedex. If you can't cite the mechanism precisely, DO NOT include the interaction.
2. Use EXACT drug names from the list (verbatim copy — no corrections, no brand→generic conversion in the output).
3. If a drug name is ambiguous, misspelled, or unknown → silently skip it. Never guess.
4. If two drugs have NO established clinically significant interaction → don't include them. A missing interaction is better than a fabricated one.
5. Do NOT invent drugs not in the list. Do NOT add "possible" or "theoretical" interactions without clinical evidence.
6. If you're uncertain about severity → downgrade one level (prefer false-safe over false-alarm).

═══ REPORTING SCOPE ═══
- Report clinically significant interactions: contraindicated / major / moderate. Skip minor unless there's a specific safety flag.
- Each interaction MUST have a mechanism (the actual pharmacological reason — CYP inhibition, QT prolongation, additive CNS depression, protein displacement, etc). NO vague "may interact" statements.

═══ WRITING STYLE (ARABIC MEDICAL TONE) ═══
- Mechanism: ≤20 كلمة — ابدأ بالآلية الفارماكولوجية ثم النتيجة السريرية.
  · Good: "يثبط إنزيم CYP3A4 فيرفع تركيز الدواء الثاني ويزيد خطر السمية القلبية."
  · Bad: "ممكن يحصل تداخل" (vague, no mechanism)
- Recommendation: ≤20 كلمة — فعل محدد (تجنب/عدّل الجرعة/راقب X).
  · Good: "تجنب المزج. لو مفيش بديل قلل الجرعة للنصف وراقب ECG أسبوعياً."

═══ SEVERITY SCALE (STRICT DEFINITIONS) ═══
- contraindicated: مثبت خطر على الحياة — black box warning أو توصية FDA بالمنع الكامل.
- major: خطر حقيقي موثق — يحتاج تغيير الخطة (بديل/جرعة/مراقبة مخبرية).
- moderate: تأثير سريري واضح — يحتاج مراقبة أو timing adjustment.
- minor: تأثير محدود — اذكره فقط لو فيه safety flag عملي.

═══ OUTPUT ═══
Strict JSON, no fences, no prose. If NO interactions found: empty interactions[] + Arabic summary "لا توجد تداخلات دوائية ذات أهمية إكلينيكية موثقة بين الأدوية المذكورة."

{
  "interactions": [
    {
      "drugA": "<exact name from list>",
      "drugB": "<exact name from list>",
      "severity": "contraindicated|major|moderate|minor",
      "mechanism": "<Arabic ≤20 words — الآلية الفارماكولوجية ثم النتيجة السريرية>",
      "recommendation": "<Arabic ≤20 words — فعل محدد>"
    }
  ],
  "summaryAr": "<Arabic 1-2 sentences — verdict + أهم تداخل لو موجود>",
  "insufficientData": false,
  "insufficientDataNote": ""
}`;

  try {
    // ⚙️ إعدادات متوازنة (Balanced Quality/Cost) — التداخلات الدوائية
    // ─────────────────────────────────────────────────────────────────────
    // temperature=0: ثبات مطلق — الموديل لازم يختار الاستجابة الأرجح فقط،
    // بدون أي عشوائية. التداخلات الدوائية مش مجال للتخمين.
    //
    // thinkingBudget=1000: نقطة التوازن المثلى (Sweet Spot)
    //   • يسمح للموديل يراجع آليات الأدوية (CYP enzymes, QT, إلخ) بدقة كافية
    //   • الفرق في الجودة بين 1000 و 2000 ضئيل جداً (< 5%) بسبب law of
    //     diminishing returns — القرارات الصعبة بتخلص قبل 1000
    //   • مع temperature=0 + قواعد anti-hallucination في الـ prompt + الكاش،
    //     1000 كافي تماماً للمستوى السريري المطلوب.
    const responseText = await generateContentWithSecurity(prompt, {
      model: GEMINI_MODEL,
      responseMimeType: 'application/json',
      temperature: 0,
      thinkingBudget: 1000,
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
    // نحفظ الكاش فقط لو النتيجة صالحة — الأخطاء ما بتتخزنش عشان الطبيب يعيد المحاولة.
    // بنستخدم void عشان ما ننتظرش الحفظ — النتيجة ترجع للـ UI فوراً والحفظ في الخلفية.
    if (!result.insufficientData) {
      void setCache(CACHE_KIND_DRUG_INTERACTIONS, userId, cacheKey, result);
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
