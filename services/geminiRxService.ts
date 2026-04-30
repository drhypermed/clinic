// استيراد أنواع البيانات والمرافق الخاصة بـ Gemini AI
import { VitalSigns } from '../types';
import { generateContentWithSecurity, generateJson, GEMINI_MODEL, tryParseJson } from './geminiUtils';
import {
  CACHE_KIND_TRANSLATION,
  TTL_TRANSLATION,
  getCache,
  hashText,
  setCache,
} from './aiResultsCache';

// واجهة برمجية لنتائج التحليل (التشخيص بالعربية والإنجليزية)
interface AnalysisResult {
  diagnosisAr: string;
  diagnosisEn: string;
}

const toText = (v: any): string => (v ?? '').toString();

/**
 * وظيفة لتنظيف البيانات السريرية من النصوص "الفارغة" أو الكلمات التي تعبر عن عدم وجود بيانات
 * تمنع ظهور كلمات مثل "No findings" في أماكن غير مرغوب فيها
 */
const normalizeEmptyClinicalPlaceholder = (value: any, source: string): string => {
  const out = toText(value).trim();
  if (!out) return '';

  const sourceText = toText(source).trim();
  if (sourceText) return out;

  const normalized = out
    .toLowerCase()
    .replace(/[\s._\-:;!?,/]+/g, ' ')
    .trim();

  // قائمة الكلمات والعبارات التي تعتبر "لا توجد بيانات"
  const placeholders = new Set([
    'no data', 'no data provided', 'no data available',
    'no investigations performed', 'no investigation performed',
    'no information provided', 'no information', 'not available',
    'no findings documented', 'no finding documented',
    'no investigations documented', 'no investigation documented',
    'no findings', 'no investigations', 'no significant findings',
    'not documented', 'not provided', 'none', 'n a', 'na'
  ]);

  return placeholders.has(normalized) ? '' : out;
};


/**
 * ترجمة سريعة (أوفلاين) لبعض المصطلحات العامة إلى مصطلحات طبية بالإنجليزية
 * تساعد في تسريع عملية التحليل وجعلها أدق بدون الاعتماد الكلي على الذكاء الاصطناعي
 */
const smartClinicalFallbackTranslate = (s: string): string => {
  let out = (s || '').toString().trim();
  if (!out) return '';

  const repl: Array<[RegExp, string]> = [
    [/\bكحة\b/g, 'cough'], [/\bكحه\b/g, 'cough'],
    [/\bبلغم\b/g, 'sputum'],
    [/\bسخونية\b/g, 'fever'], [/\bحرارة\b/g, 'fever'],
    [/\bالتهاب\b/g, 'inflammation'],
    [/\bحرقان بول\b/g, 'dysuria'],
    [/\bتكرار بول\b/g, 'urinary frequency'],
    [/\bإسهال\b/g, 'diarrhea'],
    [/\bقيء\b/g, 'vomiting'], [/\bترجيع\b/g, 'vomiting'],
    [/\bدوخة\b/g, 'dizziness'],
    [/\bصداع\b/g, 'headache'],
    [/\bضيق نفس\b/g, 'dyspnea'], [/\bنهجان\b/g, 'dyspnea'],
    [/\bألم صدر\b/g, 'chest pain'],
    [/\bحساسية\b/g, 'allergy'],
    [/\bرشح\b/g, 'rhinorrhea'],
    [/\bاحتقان\b/g, 'nasal congestion'],
    [/\bالتهاب حلق\b/g, 'sore throat'],
    [/\bألم بطن\b/g, 'abdominal pain'],
    [/\bمغص\b/g, 'colicky abdominal pain'],
  ];

  for (const [r, v] of repl) out = out.replace(r, v);

  // تصحيح حالة الأحرف (للتحاليل الشائعة) لتظهر بشكل احتراف في الروشتة
  out = out
    .replace(/\bcbc\b/gi, 'CBC')
    .replace(/\bcrp\b/gi, 'CRP')
    .replace(/\besr\b/gi, 'ESR')
    .replace(/\brbs\b/gi, 'RBS')
    .replace(/\bhba1c\b/gi, 'HbA1c')
    .replace(/\bua\b/gi, 'UA')
    .replace(/\bus\b/gi, 'U/S')
    .replace(/\bcxr\b/gi, 'CXR')
    .replace(/\becg\b/gi, 'ECG')
    .replace(/\bct\b/gi, 'CT')
    .replace(/\bmri\b/gi, 'MRI');

  return out.replace(/\s+/g, ' ').trim();
};


const buildVitalsSummary = (v: VitalSigns): string => {
  const parts: string[] = [];
  if (v.bp) parts.push(`BP ${v.bp}`);
  if (v.pulse) parts.push(`Pulse ${v.pulse}`);
  if (v.temp) parts.push(`Temp ${v.temp}`);
  if (v.rbs) parts.push(`RBS ${v.rbs}`);
  if (v.spo2) parts.push(`SpO2 ${v.spo2}`);
  if (v.rr) parts.push(`RR ${v.rr}`);
  return parts.length ? parts.join(', ') : 'N/A';
};


const sanitizeAnalysisResult = (raw: any): AnalysisResult => {
  return {
    diagnosisAr: toText(raw?.diagnosisAr).trim(),
    diagnosisEn: toText(raw?.diagnosisEn).trim(),
  };
};

/**
 * الوظيفة الأساسية لتحليل الحالة الصحية للمريض (AI Analysis)
 * ترسل بيانات المريض (الشكوى، التاريخ المرضي، الفحص، التحاليل) إلى Gemini AI
 * ليعطي "التشخيص المحتمل" بالعربية والإنجليزية لتسهيل عمل الطبيب
 */
export const analyzeComplaint = async (
  complaint: string, history: string, exam: string, investigations: string,
  ageDetails: { years: number; months: number; days: number },
  weight: number, vitalSigns: VitalSigns
): Promise<AnalysisResult> => {

  const ageMonths = (ageDetails?.years || 0) * 12 + (ageDetails?.months || 0);
  const vitals = buildVitalsSummary(vitalSigns || ({} as any));

  // إعداد "الأمر" (Prompt) الموجه للذكاء الاصطناعي
  // نحدد له دوره كـ "استشاري طب أسرة" ونضع شروط صارمة للرد (JSON فقط)
  const stage1Prompt = `
You are a Senior Family Medicine Consultant.

Goal: Provide one most-likely diagnosis only.

Rules:
1) Use all clinical inputs (complaint, history, exam, investigations, vitals) to make clinical decisions.
2) Output one most-likely diagnosis in Arabic and English.
3) Do NOT propose or mention specific medications, brands, doses, investigations, or treatment instructions.
4) diagnosisAr/diagnosisEn must be disease names only.

---
PATIENT
Age: ${ageDetails.years}y ${ageDetails.months}m ${ageDetails.days}d (TotalMonths: ${ageMonths})
WeightKg: ${Number.isFinite(weight) ? weight : 0}
Vitals: ${vitals}
Complaint: ${toText(complaint) || 'NOT PROVIDED'}
History: ${toText(history) || 'NOT PROVIDED'}
Exam: ${toText(exam) || 'NOT PROVIDED'}
Investigations: ${toText(investigations) || 'NOT PROVIDED'}

---
Return STRICT JSON ONLY:
{
  "diagnosisAr": "...",
  "diagnosisEn": "..."
}
`;

  try {
    // thinking=200: تشخيص مفرد (اسم مرض واحد) محتاج تفكير خفيف بس. الدالة
    // دي مش مستخدمة حالياً (الفلو الحالي يستعمل analyzeCaseDeeply للتحليل الغني)
    // بس لو حد استدعاها مستقبلاً، الإعداد ده بيخليها رخيصة.
    const stage1 = await generateJson(stage1Prompt, { temperature: 0.25, thinkingBudget: 200, feature: 'translation' });
    return sanitizeAnalysisResult(stage1);
  } catch (error) {
    console.error('Gemini Rx Error:', error);
    // تظهر هذه الرسالة للمستخدم في حال حدوث فشل في الاتصال بالخادم
    throw new Error('حدث خطأ أثناء تحليل الحالة. حاول مرة أخرى.');
  }
};


/** حقول الترجمة الخمسة — بنستخدمها عشان ما نكررش أسماء الحقول في الكود */
type TranslationField = 'complaintEn' | 'historyEn' | 'examEn' | 'investigationsEn' | 'diagnosisEn';

/** سطر واحد في الـ prompt — اسم الحقل كما يظهر لـ Gemini + النص العربي */
interface FieldSpec { field: TranslationField; label: string; inputText: string; }

/**
 * وظيفة لتحويل المصطلحات السريرية من العربية (أو خليط) إلى الإنجليزية الطبية.
 * تساعد الطبيب في كتابة روشتة احترافية تترجم "نهجان" إلى "dyspnea" و"كحة" إلى "cough" إلخ.
 *
 * الكاش per-field (IndexedDB):
 *   كل حقل (شكوى، تاريخ، فحص، فحوصات، تشخيص) ليه entry منفصل في الكاش
 *   مفتاحه = hash للنص العربي بتاعه. لو الطبيب عدّل الشكوى وسيب الباقي،
 *   بنسأل Gemini عن الشكوى فقط — نوفر ~80% من الـ tokens في المكالمات اللاحقة.
 */
export const translateClinicalData = async (
  complaint: string,
  history: string,
  exam: string,
  diagnosis: string,
  investigations: string,
  /** userId اختياري للكاش per-doctor. لو undefined بنتعدى الكاش. */
  userId?: string | null,
  /** تخصص الطبيب — يساعد الموديل يختار مصطلحات دقيقة (eruption للجلدية،
   *  cephalalgia للأعصاب، إلخ). الكاش مفصول حسب التخصص لتفادي خلط المصطلحات. */
  doctorSpecialty?: string,
): Promise<{ complaintEn: string; historyEn: string; examEn: string; investigationsEn: string; diagnosisEn: string }> => {

  const pickText = (...values: Array<string | undefined | null>): string => {
    for (const v of values) {
      const s = toText(v).trim();
      if (s) return s;
    }
    return '';
  };
  const parseLine = (text: string, key: string): string => {
    const re = new RegExp(`^\\s*${key}\\s*:\\s*(.*)$`, 'im');
    const m = (text || '').match(re);
    return (m?.[1] || '').trim();
  };
  const complaintText = toText(complaint).trim();
  const historyText = toText(history).trim();
  const examText = toText(exam).trim();
  const invText = toText(investigations).trim();
  const dxText = toText(diagnosis).trim();

  // لو كل الحقول فاضية — ما نعملش نداء AI من الأساس (توفير تكلفة).
  if (!complaintText && !historyText && !examText && !invText && !dxText) {
    return { complaintEn: '', historyEn: '', examEn: '', investigationsEn: '', diagnosisEn: '' };
  }

  // ─── فحص الكاش لكل حقل على حدة ──────────────────────────────────────────
  const allFields: FieldSpec[] = [
    { field: 'complaintEn',      label: 'Complaint',      inputText: complaintText },
    { field: 'historyEn',        label: 'History',        inputText: historyText   },
    { field: 'examEn',           label: 'Examination',    inputText: examText      },
    { field: 'investigationsEn', label: 'Investigations', inputText: invText       },
    { field: 'diagnosisEn',      label: 'Diagnosis',      inputText: dxText        },
  ];

  // ─ التخصص جزء من cache key:
  //   نفس النص ممكن يترجم بشكل مختلف حسب التخصص (rash للأسرة vs eruption للجلدية).
  //   لو غير محدد، نستخدم 'general' كقيمة افتراضية ثابتة.
  const specialtyKey = (doctorSpecialty || '').trim().toLowerCase() || 'general';

  // نبني cache subkey لكل حقل = "specialty:field:hash(input)"
  const cacheSubkey = (field: TranslationField, text: string): string =>
    `${specialtyKey}:${field}:${hashText(text)}`;

  // قراءة متوازية للكاش (كل الحقول مع بعض) — IndexedDB أسرع بكتير من التتابع
  const cacheResults = await Promise.all(
    allFields.map(async (spec) => {
      if (!spec.inputText) return { field: spec.field, cached: '' };
      const cached = await getCache<string>(
        CACHE_KIND_TRANSLATION,
        userId,
        cacheSubkey(spec.field, spec.inputText),
        TTL_TRANSLATION,
      );
      return { field: spec.field, cached: cached || '' };
    }),
  );
  const cacheByField = new Map<TranslationField, string>(
    cacheResults.map((r) => [r.field, r.cached]),
  );

  // الحقول اللي محتاجة استدعاء Gemini (فاضية في الكاش، ولها نص مدخل)
  const missingFields = allFields.filter(
    (spec) => spec.inputText && !cacheByField.get(spec.field),
  );

  // لو كل الحقول المليانة طلعت من الكاش → نرجع فوراً بدون أي استدعاء
  if (missingFields.length === 0) {
    return {
      complaintEn: cacheByField.get('complaintEn') || '',
      historyEn: cacheByField.get('historyEn') || '',
      examEn: cacheByField.get('examEn') || '',
      investigationsEn: cacheByField.get('investigationsEn') || '',
      diagnosisEn: cacheByField.get('diagnosisEn') || '',
    };
  }

  // ─── prompt ديناميكي — فيه فقط الحقول المفقودة من الكاش ─────────────────
  // كدا بنقلل tokens الـ input المُرسلة لـ Gemini في كل مرة الطبيب يعدّل حقل واحد.
  const inputSection = missingFields
    .map((spec) => `${spec.label}: """${spec.inputText}"""`)
    .join('\n');
  const jsonKeys = missingFields.map((spec) => `"${spec.field}": "..."`).join(', ');

  // ─ تخصص الطبيب يدخل البرومبت كـcontext (مش role كامل زي تحليل الحالة)
  //   لأن الترجمة في الأساس مهمة ميكانيكية — التخصص يساعد بس في انتقاء المصطلح
  //   الأدق وقت ما يكون فيه أكتر من مصطلح صحيح.
  const specialtyContext = (doctorSpecialty || '').trim()
    ? `\n\nCLINICAL CONTEXT: These notes are from a **${(doctorSpecialty || '').trim()}** clinic. When a term has multiple valid English translations, choose the one most precise for this specialty (e.g., dermatology prefers "eruption/exanthem" over "rash" when describing specific lesion patterns; cardiology prefers "palpitations" over "heart racing"; psychiatry uses DSM-5 terminology). DO NOT add specialty-specific findings that aren't in the input — only refine word choice.`
    : '';

  // ─ البرومبت اتعاد كتابته 2026-04-27:
  //   المشكلة الأقدم: "CLEANUP REQUIREMENTS" كانت قبل قواعد المنع، فالموديل
  //   كان ممكن يضيف أعراض في معرض "التنظيف" (مثلاً يترجم "دوخة" لـvertigo
  //   بدل dizziness). الإصلاح: قواعد المنع الصارمة في الأول قبل أي تعليمات تنظيف.
  const prompt = `You are a medical translator. Translate Arabic/English clinical notes into professional medical English.${specialtyContext}

═══ ABSOLUTE RULES — VIOLATING ANY OF THESE IS A FAILURE ═══
1. **DO NOT add ANY symptom, finding, diagnosis, test, or detail not in the input.**
2. **DO NOT change the meaning.** If unsure, keep the original wording.
3. **DO NOT invent** severity (mild/severe/acute), duration, frequency, laterality, or anatomical specificity.
4. **DO NOT translate ambiguous Arabic terms aggressively.** Examples:
   - "دوخة" → "dizziness" (NOT "vertigo" — that's a specific vestibular disorder).
   - "ألم" → "pain" (NOT "severe pain" or "dull pain" unless stated).
   - "تعب" → "fatigue" (NOT "exhaustion" or "weakness").
5. **PRESERVE EXACTLY** all numbers, units, dates, drug names, brand names, dosages, and measurements.
6. **PRESERVE NEGATIONS** intact (e.g., "لا يوجد" → "no ...", "denies ..." stays "denies ...").

═══ ALLOWED CLEANUP (only these — nothing else) ═══
- Fix obvious spelling errors only (e.g., "dyspnia" → "dyspnea"). DO NOT change words you're not 100% sure are misspellings.
- Capitalize standard abbreviations: CBC, CRP, ESR, RBS, HbA1c, BP, ECG, CXR, U/S, MRI, CT, UA, LFTs, RFTs.
- Replace ONLY these exact mappings (very high-confidence colloquialisms):
   "belly pain"→"abdominal pain", "SOB"→"dyspnea", "نهجان"→"dyspnea", "كحة"→"cough", "سخونية"→"fever", "حرارة"→"fever".
- Trim extra spaces and punctuation noise.

═══ FINAL CHECK BEFORE RESPONDING ═══
For each output field, ask yourself: "Did I add any word/concept that wasn't in the input?"
If yes → remove it. If you couldn't translate something cleanly → leave it as-is (close to the original).

═══ INPUT ═══
${inputSection}

Return STRICT JSON ONLY with these keys only:
{ ${jsonKeys} }`;

  try {
    const responseText = await generateContentWithSecurity(prompt, {
      model: GEMINI_MODEL,
      responseMimeType: 'application/json',
      temperature: 0,
      // thinking=0: الترجمة شغلة ميكانيكية (ألم بطن → abdominal pain) مش محتاجة
      // تفكير عميق — تشييله بيوفر ~50-60% من تكلفة الترجمة بدون أي فقد في الجودة.
      thinkingBudget: 0,
      feature: 'translation', // تتسجل في تقارير الاستهلاك تحت "الترجمة الذكية"
    });

    const parsed = tryParseJson(responseText || '{}') || {};

    // نبني النتيجة: الحقول من الكاش + الحقول الجديدة من Gemini
    const getNewOrCached = (field: TranslationField, inputText: string): string => {
      const fromCache = cacheByField.get(field) || '';
      if (fromCache) return fromCache;
      return normalizeEmptyClinicalPlaceholder(parsed[field], inputText);
    };

    const normalized = {
      complaintEn: getNewOrCached('complaintEn', complaintText),
      historyEn: getNewOrCached('historyEn', historyText),
      examEn: getNewOrCached('examEn', examText),
      investigationsEn: getNewOrCached('investigationsEn', invText),
      diagnosisEn: getNewOrCached('diagnosisEn', dxText),
    };

    // ─── حفظ الحقول الجديدة في الكاش للاستخدام المستقبلي ─────────────────
    // void: الحفظ في الخلفية ما يأخرش الـ return للـ UI.
    for (const spec of missingFields) {
      const translatedValue = normalized[spec.field];
      if (translatedValue) {
        void setCache(
          CACHE_KIND_TRANSLATION,
          userId,
          cacheSubkey(spec.field, spec.inputText),
          translatedValue,
        );
      }
    }

    // If model returned unusable empty output, fallback instead of propagating blanks.
    const hasAnyOutput =
      !!pickText(
        normalized.complaintEn,
        normalized.historyEn,
        normalized.examEn,
        normalized.investigationsEn,
        normalized.diagnosisEn
      );
    if (!hasAnyOutput) {
      throw new Error('Empty translation output');
    }

    return normalized;
  } catch (e) {
    // Second-pass fallback with plain text format (more tolerant than strict JSON)
    try {
      const textPrompt = `Translate to medical English and return ONLY these 5 lines:
complaintEn: ...
historyEn: ...
examEn: ...
investigationsEn: ...
diagnosisEn: ...

Complaint: ${complaintText}
History: ${historyText}
Examination: ${examText}
Investigations: ${invText}
Diagnosis: ${dxText}`;

      const textResponse = await generateContentWithSecurity(textPrompt, {
        model: GEMINI_MODEL,
        responseMimeType: 'text/plain',
        temperature: 0,
        // نفس الـ fallback — ترجمة لا تحتاج تفكير
        thinkingBudget: 0,
        feature: 'translation', // fallback ترجمة (text mode) — نفس الميزة
      });

      const out = {
        complaintEn: parseLine(textResponse, 'complaintEn'),
        historyEn: parseLine(textResponse, 'historyEn'),
        examEn: parseLine(textResponse, 'examEn'),
        investigationsEn: parseLine(textResponse, 'investigationsEn'),
        diagnosisEn: parseLine(textResponse, 'diagnosisEn')
      };

      if (pickText(out.complaintEn, out.historyEn, out.examEn, out.investigationsEn, out.diagnosisEn)) {
        return out;
      }
    } catch {
      // continue to offline fallback
    }

    // Final fallback without breaking Rx generation
    return {
      complaintEn: smartClinicalFallbackTranslate(complaintText),
      historyEn: smartClinicalFallbackTranslate(historyText),
      examEn: smartClinicalFallbackTranslate(examText),
      investigationsEn: smartClinicalFallbackTranslate(invText),
      diagnosisEn: smartClinicalFallbackTranslate(dxText)
    };
  }
};
