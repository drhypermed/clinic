import { generateContentWithSecurity, GEMINI_MODEL, tryParseJson } from './geminiUtils';
import { getCache, normalizeDrugForKey, setCache } from './aiResultsCache';
import type { AiFeatureName } from './secureGeminiGateway';

const CACHE_KIND_DRUG_IDENTITY = 'drug_id_v1';
const TTL_DRUG_IDENTITY = 180 * 24 * 60 * 60 * 1000;

export interface ResolvedDrugIdentity {
  original: string;
  isMedication: boolean;
  canonicalName: string;
  activeIngredients: string[];
  confidence: 'high' | 'medium' | 'low';
  sourceNames: string[];
  note?: string;
}

const toText = (value: unknown): string => (value ?? '').toString();
const toTrimmed = (value: unknown): string => toText(value).trim();

const normalizeConfidence = (value: unknown): ResolvedDrugIdentity['confidence'] => {
  const text = toTrimmed(value).toLowerCase();
  if (text === 'high' || text === 'medium' || text === 'low') return text;
  return 'low';
};

const toStringArray = (value: unknown, maxItems: number): string[] => {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .map(toTrimmed)
        .filter(Boolean),
    ),
  ).slice(0, maxItems);
};

export const normalizeDrugIdentityText = (name: string): string => {
  return (name || '')
    .toLowerCase()
    .trim()
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/\([^)]*\)|\[[^\]]*\]/g, ' ')
    .replace(/\d+(\.\d+)?\s*(mg\/ml|mg\/kg|mcg\/ml|mg|mcg|µg|g|ml|iu|kg|%)\b/gi, ' ')
    .replace(/\b(tablets?|tabs?|capsules?|caps?|syrup|drops?|amp(oules?)?|vials?|cream|gel|injections?|inj|suspensions?|susp|solutions?|sol|spray|patch(es)?|sachets?|ointment|lozenges?|effervescent)\b/gi, ' ')
    .replace(/[.,\-_/\\(){}[\]:;|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const buildFallbackIdentity = (original: string): ResolvedDrugIdentity => ({
  original,
  isMedication: true,
  canonicalName: normalizeDrugIdentityText(original) || original,
  activeIngredients: [],
  confidence: 'low',
  sourceNames: [],
  note: 'unverified fallback',
});

const sanitizeIdentity = (raw: unknown, original: string): ResolvedDrugIdentity => {
  const obj = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const canonicalName = toTrimmed(obj.canonicalName);
  const activeIngredients = toStringArray(obj.activeIngredients, 8);
  const sourceNames = toStringArray(obj.sourceNames, 4);
  const isMedication = obj.isMedication !== false && (Boolean(canonicalName) || activeIngredients.length > 0);

  return {
    original,
    isMedication,
    canonicalName: canonicalName || normalizeDrugIdentityText(original) || original,
    activeIngredients,
    confidence: normalizeConfidence(obj.confidence),
    sourceNames,
    note: toTrimmed(obj.note) || undefined,
  };
};

const resolveMissingDrugIdentities = async (
  originals: string[],
  feature: AiFeatureName,
): Promise<ResolvedDrugIdentity[]> => {
  if (originals.length === 0) return [];

  const drugList = originals.map((drug, index) => `${index + 1}. ${drug}`).join('\n');
  const prompt = `You are a medication identity resolver for a clinical prescribing system.
Use Google Search first. Identify each item as a real medication product or substance, then extract active ingredient(s).

INPUT DRUG NAMES:
${drugList}

Rules:
- Search the web for each exact item. It may include dose, form, local brand, misspelling, Arabic/English mix, or extra prescription text.
- Prefer official labels, national drug databases, manufacturer pages, DailyMed, EMC, FDA, NIH, NHS, medicines.org.uk, Drugs.com, Medscape, or well-known pharmacy references.
- For combination products, include every clinically active ingredient.
- Do not invent. If uncertain, set confidence="low", keep activeIngredients empty, and explain briefly in note.
- Return the original string exactly as supplied in "original".
- Output strict JSON only.

{
  "drugs": [
    {
      "original": "<exact input>",
      "isMedication": true,
      "canonicalName": "<best product/generic name>",
      "activeIngredients": ["<generic ingredient>", "<optional>"],
      "confidence": "high|medium|low",
      "sourceNames": ["<short source name>", "<optional>"],
      "note": "<short note if needed>"
    }
  ]
}`;

  const responseText = await generateContentWithSecurity(prompt, {
    model: GEMINI_MODEL,
    responseMimeType: 'text/plain',
    temperature: 0,
    thinkingBudget: 1000,
    googleSearch: true,
    feature,
  });

  const parsed = tryParseJson<{ drugs?: unknown[] }>(responseText || '{}');
  const rawDrugs = Array.isArray(parsed?.drugs) ? parsed.drugs : [];
  const byOriginal = new Map<string, ResolvedDrugIdentity>();
  for (const item of rawDrugs) {
    const obj = item && typeof item === 'object' ? item as Record<string, unknown> : {};
    const original = toTrimmed(obj.original);
    if (!original || !originals.includes(original)) continue;
    byOriginal.set(original, sanitizeIdentity(obj, original));
  }

  return originals.map((original) => byOriginal.get(original) || buildFallbackIdentity(original));
};

export const resolveDrugIdentities = async (
  drugNames: string[],
  userId: string | null | undefined,
  feature: AiFeatureName,
): Promise<ResolvedDrugIdentity[]> => {
  const cleaned = Array.from(new Set(drugNames.map((drug) => drug.trim()).filter(Boolean)));
  if (cleaned.length === 0) return [];

  const cachedResults = await Promise.all(
    cleaned.map(async (drug) => {
      const cacheKey = normalizeDrugForKey(normalizeDrugIdentityText(drug) || drug);
      const cached = await getCache<ResolvedDrugIdentity>(
        CACHE_KIND_DRUG_IDENTITY,
        userId,
        cacheKey,
        TTL_DRUG_IDENTITY,
      );
      return { drug, cacheKey, cached };
    }),
  );

  const resolved: ResolvedDrugIdentity[] = [];
  const missing: Array<{ drug: string; cacheKey: string }> = [];
  for (const item of cachedResults) {
    if (item.cached) {
      resolved.push({ ...item.cached, original: item.drug });
    } else {
      missing.push({ drug: item.drug, cacheKey: item.cacheKey });
    }
  }

  if (missing.length > 0) {
    try {
      const fetched = await resolveMissingDrugIdentities(missing.map((item) => item.drug), feature);
      for (const identity of fetched) {
        resolved.push(identity);
        const cacheKey = missing.find((item) => item.drug === identity.original)?.cacheKey;
        if (cacheKey && identity.confidence !== 'low') {
          void setCache(CACHE_KIND_DRUG_IDENTITY, userId, cacheKey, identity);
        }
      }
    } catch (error) {
      console.warn('Drug identity internet resolution failed; using raw names:', error);
      resolved.push(...missing.map((item) => buildFallbackIdentity(item.drug)));
    }
  }

  const byOriginal = new Map(resolved.map((item) => [item.original, item]));
  return cleaned.map((drug) => byOriginal.get(drug) || buildFallbackIdentity(drug));
};

export const buildResolvedDrugPromptList = (identities: ResolvedDrugIdentity[]): string => {
  return identities.map((identity, index) => {
    const ingredients = identity.activeIngredients.length > 0
      ? identity.activeIngredients.join(', ')
      : 'unknown';
    const sources = identity.sourceNames.length > 0 ? identity.sourceNames.join(', ') : 'not verified';
    return [
      `${index + 1}. Original: ${identity.original}`,
      `   Canonical/product: ${identity.canonicalName}`,
      `   Active ingredients: ${ingredients}`,
      `   Search confidence: ${identity.confidence}`,
      `   Sources: ${sources}`,
    ].join('\n');
  }).join('\n');
};

export const buildDrugNameMatchMap = (identities: ResolvedDrugIdentity[]): Map<string, string> => {
  const candidates: Array<{ normalized: string; original: string }> = [];
  for (const identity of identities) {
    const names = [
      identity.original,
      identity.canonicalName,
      ...identity.activeIngredients,
      ...identity.activeIngredients.flatMap((ingredient) => ingredient.split(/[+/,&]/g)),
    ];
    for (const name of names) {
      const normalized = normalizeDrugIdentityText(name);
      if (normalized) candidates.push({ normalized, original: identity.original });
    }
  }

  const ownersByName = new Map<string, Set<string>>();
  for (const candidate of candidates) {
    const owners = ownersByName.get(candidate.normalized) || new Set<string>();
    owners.add(candidate.original);
    ownersByName.set(candidate.normalized, owners);
  }

  const map = new Map<string, string>();
  for (const candidate of candidates) {
    const owners = ownersByName.get(candidate.normalized);
    if (owners?.size === 1 && !map.has(candidate.normalized)) {
      map.set(candidate.normalized, candidate.original);
    }
  }
  return map;
};
