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
import {
  buildDrugNameMatchMap,
  buildResolvedDrugPromptList,
  normalizeDrugIdentityText,
  resolveDrugIdentities,
  type ResolvedDrugIdentity,
} from './drugIdentityResolutionService';

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
  source?: string;           // مصدر مختصر موثوق عند توفره
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

/**
 * تطبيع اسم دواء لمقارنة مرنة بين اللي الطبيب كتبه واللي رجع من الموديل.
 *
 * ليه ده مهم؟ الطبيب بيكتب أحياناً "Augmentin 1g" والموديل بيرجع "Augmentin" —
 * المقارنة المباشرة بـ exact-string بتفشل والتداخل بينحذف، فالطبيب يحس إن
 * الفحص فشل يتعرف على الدواء. التطبيع بيشيل:
 *   • محتوى الأقواس (غالباً جرعة أو شكل)
 *   • الجرعات بالأرقام مع وحدات شائعة (mg, g, mcg, ml, IU, kg, %)
 *   • الأشكال الصيدلانية الإنجليزية (tablet/capsule/syrup/...إلخ)
 *   • علامات الترقيم والمسافات الزائدة
 *
 * النتيجة: "Augmentin 1g" و "augmentin" و "Augmentin (1 g) tab" كلهم → "augmentin".
 */
const normalizeDrugForMatch = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    // أي محتوى داخل أقواس — غالباً جرعة أو شكل صيدلاني
    .replace(/\([^)]*\)|\[[^\]]*\]/g, ' ')
    // أرقام متبوعة بوحدات الجرعة الشائعة (مع \b بعدها لمنع match جزئي)
    .replace(/\d+(\.\d+)?\s*(mg\/ml|mg\/kg|mcg\/ml|mg|mcg|µg|g|ml|iu|kg|%)\b/gi, ' ')
    // أشكال صيدلانية إنجليزية ككلمات كاملة
    .replace(/\b(tablets?|tabs?|capsules?|caps?|syrup|drops?|amp(oules?)?|vials?|cream|gel|injections?|inj|suspensions?|susp|solutions?|sol|spray|patch(es)?|sachets?|ointment|lozenges?|effervescent)\b/gi, ' ')
    // علامات الترقيم → space (يضمن إن "5-HTP" و "5 HTP" يطابقوا بعض)
    .replace(/[.,\-_/\\(){}[\]:;|]+/g, ' ')
    // collapse مسافات
    .replace(/\s+/g, ' ')
    .trim();
};

type DrugIdentity = {
  original: string;
  normalized: string;
  keys: Set<string>;
};

type IdentityRule = {
  key: string;
  aliases: string[];
};

const IDENTITY_RULES: IdentityRule[] = [
  { key: 'warfarin', aliases: ['warfarin', 'marevan', 'coumadin'] },
  { key: 'apixaban', aliases: ['apixaban', 'eliquis'] },
  { key: 'rivaroxaban', aliases: ['rivaroxaban', 'xarelto'] },
  { key: 'dabigatran', aliases: ['dabigatran', 'pradaxa'] },
  { key: 'enoxaparin', aliases: ['enoxaparin', 'clexane', 'lovenox'] },
  { key: 'aspirin', aliases: ['aspirin', 'acetylsalicylic', 'jusprin', 'aspocid', 'disprin'] },
  { key: 'clopidogrel', aliases: ['clopidogrel', 'plavix', 'plavix plus'] },
  { key: 'ibuprofen', aliases: ['ibuprofen', 'brufen', 'advil', 'motrin'] },
  { key: 'diclofenac', aliases: ['diclofenac', 'voltaren', 'olfen', 'cataflam'] },
  { key: 'naproxen', aliases: ['naproxen', 'naprosyn', 'anaprox'] },
  { key: 'celecoxib', aliases: ['celecoxib', 'celebrex'] },
  { key: 'spironolactone', aliases: ['spironolactone', 'aldactone'] },
  { key: 'potassium', aliases: ['potassium', 'kcl', 'slow k', 'potassium chloride'] },
  { key: 'trimethoprim_sulfamethoxazole', aliases: ['trimethoprim sulfamethoxazole', 'co trimoxazole', 'bactrim', 'septrin', 'trimethoprim', 'sulfamethoxazole'] },
  { key: 'enalapril', aliases: ['enalapril', 'ezapril', 'renitec'] },
  { key: 'lisinopril', aliases: ['lisinopril', 'zestril'] },
  { key: 'ramipril', aliases: ['ramipril', 'tritace'] },
  { key: 'losartan', aliases: ['losartan', 'cozaar'] },
  { key: 'valsartan', aliases: ['valsartan', 'diovan'] },
  { key: 'candesartan', aliases: ['candesartan', 'atacand'] },
  { key: 'furosemide', aliases: ['furosemide', 'frusemide', 'lasix'] },
  { key: 'hydrochlorothiazide', aliases: ['hydrochlorothiazide', 'hctz'] },
  { key: 'clarithromycin', aliases: ['clarithromycin', 'klacid', 'claritt'] },
  { key: 'erythromycin', aliases: ['erythromycin', 'erythrocin'] },
  { key: 'azithromycin', aliases: ['azithromycin', 'zithromax', 'azrolid'] },
  { key: 'ciprofloxacin', aliases: ['ciprofloxacin', 'cipro', 'ciprobay', 'ciproxin'] },
  { key: 'levofloxacin', aliases: ['levofloxacin', 'tavanic', 'levaquin'] },
  { key: 'amiodarone', aliases: ['amiodarone', 'cordarone'] },
  { key: 'digoxin', aliases: ['digoxin', 'lanoxin'] },
  { key: 'simvastatin', aliases: ['simvastatin', 'zocor'] },
  { key: 'atorvastatin', aliases: ['atorvastatin', 'lipitor', 'ator'] },
  { key: 'rosuvastatin', aliases: ['rosuvastatin', 'crestor'] },
  { key: 'fluoxetine', aliases: ['fluoxetine', 'prozac'] },
  { key: 'sertraline', aliases: ['sertraline', 'zoloft', 'lustral'] },
  { key: 'citalopram', aliases: ['citalopram', 'cipram'] },
  { key: 'escitalopram', aliases: ['escitalopram', 'cipralex'] },
  { key: 'venlafaxine', aliases: ['venlafaxine', 'effexor'] },
  { key: 'duloxetine', aliases: ['duloxetine', 'cymbalta'] },
  { key: 'tramadol', aliases: ['tramadol', 'tramal', 'contramal'] },
  { key: 'ondansetron', aliases: ['ondansetron', 'zofran'] },
  { key: 'sildenafil', aliases: ['sildenafil', 'viagra'] },
  { key: 'tadalafil', aliases: ['tadalafil', 'cialis'] },
  { key: 'nitroglycerin', aliases: ['nitroglycerin', 'glyceryl trinitrate', 'gtN', 'nitroderm', 'nitrostat'] },
  { key: 'isosorbide', aliases: ['isosorbide', 'isordil', 'imdur', 'mononitrate', 'dinitrate'] },
  { key: 'methotrexate', aliases: ['methotrexate', 'mtx'] },
  { key: 'azathioprine', aliases: ['azathioprine', 'imuran'] },
  { key: 'allopurinol', aliases: ['allopurinol', 'zyloric'] },
];

const GROUPS: Record<string, string[]> = {
  anticoagulant: ['warfarin', 'apixaban', 'rivaroxaban', 'dabigatran', 'enoxaparin'],
  doac: ['apixaban', 'rivaroxaban', 'dabigatran'],
  antiplatelet: ['aspirin', 'clopidogrel'],
  nsaid: ['ibuprofen', 'diclofenac', 'naproxen', 'celecoxib'],
  acei_arb: ['enalapril', 'lisinopril', 'ramipril', 'losartan', 'valsartan', 'candesartan'],
  diuretic: ['furosemide', 'hydrochlorothiazide', 'spironolactone'],
  potassium_raising: ['spironolactone', 'potassium', 'trimethoprim_sulfamethoxazole'],
  qt_risk: ['amiodarone', 'azithromycin', 'clarithromycin', 'erythromycin', 'ciprofloxacin', 'levofloxacin', 'citalopram', 'escitalopram', 'ondansetron'],
  strong_cyp3a4_inhibitor: ['clarithromycin', 'erythromycin'],
  cyp3a4_statin: ['simvastatin', 'atorvastatin'],
  serotonergic_antidepressant: ['fluoxetine', 'sertraline', 'citalopram', 'escitalopram', 'venlafaxine', 'duloxetine'],
  pde5: ['sildenafil', 'tadalafil'],
  nitrate: ['nitroglycerin', 'isosorbide'],
};

const keyInGroup = (key: string, group: keyof typeof GROUPS): boolean => GROUPS[group].includes(key);

const resolveDrugIdentity = (original: string): DrugIdentity => {
  const normalized = normalizeDrugForMatch(original);
  const padded = ` ${normalized} `;
  const keys = new Set<string>();

  for (const rule of IDENTITY_RULES) {
    for (const alias of rule.aliases) {
      const normalizedAlias = normalizeDrugForMatch(alias);
      if (!normalizedAlias) continue;
      if (padded.includes(` ${normalizedAlias} `) || normalizedAlias.includes(normalized)) {
        keys.add(rule.key);
      }
    }
  }

  if (!keys.size && normalized) keys.add(normalized);
  return { original, normalized, keys };
};

const buildIdentityMap = (drugNames: string[]): Map<string, DrugIdentity> =>
  new Map(drugNames.map((name) => [name, resolveDrugIdentity(name)]));

const identitiesMatch = (identity: DrugIdentity, candidateName: string): boolean => {
  const candidate = resolveDrugIdentity(candidateName);
  if (identity.normalized && candidate.normalized === identity.normalized) return true;
  for (const key of candidate.keys) {
    if (identity.keys.has(key)) return true;
  }
  return false;
};

type LocalInteractionRule = {
  id: string;
  source: string;
  severity: InteractionSeverity;
  when: (a: string, b: string, allKeys: Set<string>) => boolean;
  mechanism: string;
  recommendation: string;
};

const pair = (a: string, b: string, pred: (x: string, y: string) => boolean) => pred(a, b) || pred(b, a);

const LOCAL_INTERACTION_RULES: LocalInteractionRule[] = [
  {
    id: 'pde5-nitrate',
    source: 'FDA Label / BNF',
    severity: 'contraindicated',
    when: (a, b) => pair(a, b, (x, y) => keyInGroup(x, 'pde5') && keyInGroup(y, 'nitrate')),
    mechanism: 'توسع وعائي تراكمي عبر nitric oxide/cGMP يسبب هبوط ضغط شديد.',
    recommendation: 'ممنوع الجمع. افصل حسب مدة مفعول الدواء واستبدل أحدهما.',
  },
  {
    id: 'allopurinol-azathioprine',
    source: 'FDA Label / Stockley',
    severity: 'contraindicated',
    when: (a, b) => pair(a, b, (x, y) => x === 'allopurinol' && y === 'azathioprine'),
    mechanism: 'Allopurinol يثبط أيض azathioprine فيرفع سمية نخاع العظم.',
    recommendation: 'تجنب الجمع؛ إن اضطررت استخدم جرعة azathioprine منخفضة جدا ومراقبة CBC صارمة.',
  },
  {
    id: 'anticoagulant-antiplatelet-nsaid',
    source: 'Lexicomp / Stockley',
    severity: 'major',
    when: (a, b) => pair(a, b, (x, y) => keyInGroup(x, 'anticoagulant') && (keyInGroup(y, 'antiplatelet') || keyInGroup(y, 'nsaid'))),
    mechanism: 'تأثير مضاد للتجلط/الصفائح أو تهيج معدي تراكمي يزيد خطر النزيف.',
    recommendation: 'تجنب إن أمكن؛ إن لزم فحدد مدة قصيرة وراقب نزيف/CBC وفكر في حماية معدة.',
  },
  {
    id: 'ssri-nsaid-anticoagulant',
    source: 'Lexicomp / Stockley',
    severity: 'major',
    when: (a, b) => pair(a, b, (x, y) => keyInGroup(x, 'serotonergic_antidepressant') && (keyInGroup(y, 'nsaid') || keyInGroup(y, 'anticoagulant'))),
    mechanism: 'تثبيط serotonin الصفائح مع NSAID/anticoagulant يزيد النزيف خصوصا الهضمي.',
    recommendation: 'راقب النزيف؛ تجنب NSAID المزمن وفكر في بديل أو PPI عند الخطورة.',
  },
  {
    id: 'ace-arb-potassium',
    source: 'Lexicomp / Stockley',
    severity: 'major',
    when: (a, b) => pair(a, b, (x, y) => keyInGroup(x, 'acei_arb') && keyInGroup(y, 'potassium_raising')),
    mechanism: 'تثبيط RAAS مع دواء رافع للبوتاسيوم يزيد hyperkalemia والفشل الكلوي.',
    recommendation: 'راقب K/creatinine خلال 3-7 أيام؛ تجنب الجمع عالي الخطورة أو خفض الجرعات.',
  },
  {
    id: 'nsaid-ace-arb-diuretic',
    source: 'Lexicomp / Stockley',
    severity: 'major',
    when: (a, b, all) => pair(a, b, (x, y) => keyInGroup(x, 'nsaid') && keyInGroup(y, 'acei_arb')) && [...all].some((key) => keyInGroup(key, 'diuretic')),
    mechanism: 'NSAID + RAAS blocker + diuretic يقلل perfusion الكلى ويرفع AKI.',
    recommendation: 'تجنب الثلاثي خصوصا مع الجفاف/كبار السن؛ راقب creatinine وK مبكرا.',
  },
  {
    id: 'qt-risk-combo',
    source: 'CredibleMeds / Lexicomp',
    severity: 'major',
    when: (a, b) => a !== b && keyInGroup(a, 'qt_risk') && keyInGroup(b, 'qt_risk'),
    mechanism: 'إطالة QT تراكمية ترفع خطر torsades خاصة مع نقص K/Mg أو مرض قلبي.',
    recommendation: 'تجنب الجمع عالي الخطورة أو راقب ECG والإلكتروليتات واختر بديل أقل QT.',
  },
  {
    id: 'statin-cyp3a4-inhibitor',
    source: 'FDA Label / Stockley',
    severity: 'major',
    when: (a, b) => pair(a, b, (x, y) => keyInGroup(x, 'cyp3a4_statin') && keyInGroup(y, 'strong_cyp3a4_inhibitor')),
    mechanism: 'تثبيط CYP3A4 يرفع تركيز statin ويزيد myopathy/rhabdomyolysis.',
    recommendation: 'أوقف simvastatin/atorvastatin مؤقتا أو استخدم بديل مثل rosuvastatin بجرعة مناسبة.',
  },
  {
    id: 'digoxin-pgp-inhibitors',
    source: 'FDA Label / Lexicomp',
    severity: 'major',
    when: (a, b) => pair(a, b, (x, y) => x === 'digoxin' && ['amiodarone', 'clarithromycin', 'erythromycin'].includes(y)),
    mechanism: 'تثبيط P-gp يقلل طرح digoxin ويرفع خطر السمية القلبية والهضمية.',
    recommendation: 'قلل digoxin غالبا وراقب المستوى والنبض وECG وأعراض السمية.',
  },
  {
    id: 'tramadol-serotonergic',
    source: 'Lexicomp / Stockley',
    severity: 'major',
    when: (a, b) => pair(a, b, (x, y) => x === 'tramadol' && keyInGroup(y, 'serotonergic_antidepressant')),
    mechanism: 'تأثير serotonergic وخفض عتبة التشنج يزيد serotonin syndrome/seizures.',
    recommendation: 'تجنب إن أمكن؛ استخدم مسكن بديل وراقب agitation, tremor, sweating.',
  },
  {
    id: 'methotrexate-tmp-smx',
    source: 'FDA Label / Stockley',
    severity: 'major',
    when: (a, b) => pair(a, b, (x, y) => x === 'methotrexate' && y === 'trimethoprim_sulfamethoxazole'),
    mechanism: 'تثبيط folate وطرح كلوي متداخل يرفع pancytopenia وسمية methotrexate.',
    recommendation: 'تجنب الجمع؛ إن اضطررت راقب CBC/creatinine عن قرب وابحث عن بديل مضاد حيوي.',
  },
];

export const getLocalDrugInteractions = (cleaned: string[]): DrugInteraction[] => {
  const identities = cleaned.map(resolveDrugIdentity);
  const allKeys = new Set(identities.flatMap((identity) => [...identity.keys]));
  const interactions: DrugInteraction[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < identities.length; i += 1) {
    for (let j = i + 1; j < identities.length; j += 1) {
      for (const keyA of identities[i].keys) {
        for (const keyB of identities[j].keys) {
          for (const rule of LOCAL_INTERACTION_RULES) {
            if (!rule.when(keyA, keyB, allKeys)) continue;
            const dedupeKey = `${rule.id}|${identities[i].original}|${identities[j].original}`;
            if (seen.has(dedupeKey)) continue;
            seen.add(dedupeKey);
            interactions.push({
              drugA: identities[i].original,
              drugB: identities[j].original,
              severity: rule.severity,
              mechanism: rule.mechanism,
              recommendation: rule.recommendation,
              source: rule.source,
            });
          }
        }
      }
    }
  }

  return interactions;
};

const mergeInteractionResults = (
  localInteractions: DrugInteraction[],
  aiResult: DrugInteractionsResult,
): DrugInteractionsResult => {
  const merged: DrugInteraction[] = [];
  const seen = new Set<string>();

  for (const interaction of [...localInteractions, ...(aiResult.interactions || [])]) {
    const a = normalizeDrugForMatch(interaction.drugA);
    const b = normalizeDrugForMatch(interaction.drugB);
    const key = [a, b].sort().join('|') + `|${interaction.severity}|${normalizeDrugForMatch(interaction.mechanism)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(interaction);
  }

  if (merged.length === 0) return aiResult;

  const localSummary = localInteractions.length > 0
    ? `تم التقاط ${localInteractions.length} تداخل موثق من قاعدة داخلية معتمدة، مع استكمال الفحص بالمراجع السحابية عند توفرها.`
    : '';

  return {
    hasInteractions: true,
    interactions: merged.slice(0, 15),
    summaryAr: aiResult.summaryAr || localSummary,
    insufficientData: false,
    insufficientDataNote: undefined,
  };
};

/**
 * تنظيف استجابة الموديل وضمان البنية حتى لو جاء ناقص.
 *
 * المنطق:
 *   1) نبني خريطة من "اسم مُطبَّع" → "الاسم الأصلي اللي الطبيب كتبه".
 *   2) لكل تداخل رجع من الموديل، نطبّع drugA/drugB ونحاول نلاقيهم في الخريطة.
 *   3) لو لقيناهم → نستبدل اسم الموديل بالاسم الأصلي (للعرض المتسق).
 *   4) لو واحد منهم مش موجود → نتجاهل التداخل (anti-hallucination guard).
 */
const sanitizeResult = (
  raw: unknown,
  drugNames: string[],
  resolvedIdentities: ResolvedDrugIdentity[] = [],
): DrugInteractionsResult => {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;

  const inputIdentities = buildIdentityMap(drugNames);
  const resolvedNameMap = buildDrugNameMatchMap(resolvedIdentities);
  const findMatchedInput = (rawName: string): string | undefined => {
    const resolvedMatch = resolvedNameMap.get(normalizeDrugIdentityText(rawName));
    if (resolvedMatch) return resolvedMatch;
    for (const identity of inputIdentities.values()) {
      if (identitiesMatch(identity, rawName)) return identity.original;
    }
    return undefined;
  };

  const rawInteractions = Array.isArray(obj.interactions) ? obj.interactions : [];
  const interactions: DrugInteraction[] = [];

  for (const item of rawInteractions) {
    if (interactions.length >= 15) break; // حد أقصى 15 تداخل
    const it = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
    const rawA = toTrimmed(it.drugA);
    const rawB = toTrimmed(it.drugB);
    if (!rawA || !rawB) continue;

    // نطبّع اسمي الدوائين ونحاول نلاقيهم في قائمة الطبيب
    const matchedA = findMatchedInput(rawA);
    const matchedB = findMatchedInput(rawB);
    // anti-hallucination: لو دواء واحد مش في القائمة، نرفض التداخل بالكامل
    if (!matchedA || !matchedB) continue;
    // ما نقبلش تداخل دواء مع نفسه (بعد التطبيع)
    if (matchedA.toLowerCase() === matchedB.toLowerCase()) continue;

    interactions.push({
      // نعرض الاسم زي ما الطبيب كتبه — مش الصيغة اللي الموديل ممكن غيّرها
      drugA: matchedA,
      drugB: matchedB,
      severity: normalizeSeverity(it.severity),
      mechanism: toTrimmed(it.mechanism),
      recommendation: toTrimmed(it.recommendation),
      source: toTrimmed(it.source) || toTrimmed(it.reference) || undefined,
    });
  }

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

  const localInteractions = getLocalDrugInteractions(cleaned);
  const resolvedIdentities = await resolveDrugIdentities(cleaned, userId, 'drug_interactions');

  // ─── فحص الكاش أولاً ────────────────────────────────────────────────────
  // المفتاح = hash لمجموعة الأدوية (مرتّبة ومطبّعة) — يعني ["Panadol","Augmentin"]
  // و ["augmentin","PANADOL"] يعطوا نفس الـ hash ونفس نتيجة الكاش.
  const cacheKey = `v3:${hashDrugList(cleaned)}`;
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
  const localRecognition = cleaned.map((d) => {
    const identity = resolveDrugIdentity(d);
    const recognized = [...identity.keys]
      .filter((key) => key !== identity.normalized)
      .join(', ');
    return recognized ? `${d}: ${recognized}` : '';
  }).filter(Boolean).join('\n');
  const drugList = buildResolvedDrugPromptList(resolvedIdentities);

  const prompt = `You are a senior clinical pharmacist (PharmD, BCPS-level). Analyze drug-drug interactions ONLY between the drugs listed below. Zero tolerance for hallucination or speculation.

DRUGS (internet-resolved before this interaction check):
${drugList}

LOCAL RECOGNITION KEYS:
${localRecognition || 'none'}

IMPORTANT: each numbered item has an "Original" line. Use only those exact Original names in drugA/drugB. Canonical names and active ingredients are only identity aids from internet search.

═══ ABSOLUTE ANTI-HALLUCINATION RULES ═══
1. Only report interactions documented in Lexicomp, Stockley's Drug Interactions, or Micromedex. If you can't cite the mechanism precisely, DO NOT include the interaction.
2. Use EXACT original drug names from the list before the "|" character. The recognized keys after "|" are only for active-ingredient identification.
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
      "recommendation": "<Arabic ≤20 words — فعل محدد>",
      "source": "Lexicomp|Stockley's Drug Interactions|Micromedex|FDA Label|CredibleMeds"
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
      feature: 'drug_interactions', // تتسجل في تقارير الاستهلاك تحت "فحص التداخلات"
    });

    const parsed = tryParseJson(responseText || '{}');
    if (!parsed) {
      if (localInteractions.length > 0) {
        return {
          hasInteractions: true,
          interactions: localInteractions,
          summaryAr: `تم العثور على ${localInteractions.length} تداخل موثق محليا بين الأدوية المذكورة. تعذر قراءة نتيجة الفحص السحابي.`,
          insufficientData: false,
        };
      }
      return {
        hasInteractions: false,
        interactions: [],
        summaryAr: '',
        insufficientData: true,
        insufficientDataNote: 'تعذّر قراءة نتيجة الفحص. حاول مرة أخرى.',
      };
    }

    const aiResult = sanitizeResult(parsed, cleaned, resolvedIdentities);
    const result = mergeInteractionResults(localInteractions, aiResult);
    // نحفظ الكاش فقط لو النتيجة صالحة — الأخطاء ما بتتخزنش عشان الطبيب يعيد المحاولة.
    // بنستخدم void عشان ما ننتظرش الحفظ — النتيجة ترجع للـ UI فوراً والحفظ في الخلفية.
    if (!result.insufficientData) {
      void setCache(CACHE_KIND_DRUG_INTERACTIONS, userId, cacheKey, result);
    }
    return result;
  } catch (error) {
    console.error('Drug interactions check failed:', error);
    if (localInteractions.length > 0) {
      return {
        hasInteractions: true,
        interactions: localInteractions,
        summaryAr: `تم العثور على ${localInteractions.length} تداخل موثق محليا بين الأدوية المذكورة. تعذر استكمال الفحص السحابي، فراجع النتيجة إكلينيكيا.`,
        insufficientData: false,
      };
    }
    return {
      hasInteractions: false,
      interactions: [],
      summaryAr: '',
      insufficientData: true,
      insufficientDataNote: 'حدث خطأ أثناء فحص التداخلات، حاول مرة أخرى.',
    };
  }
};
