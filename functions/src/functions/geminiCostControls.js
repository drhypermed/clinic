const USD_TO_MICROS = 1_000_000;
const RESERVATION_TTL_MS = 15 * 60 * 1000;

// USD per one million tokens. Values intentionally round upward where a model
// is legacy/rare so the guard remains conservative when prices change.
const MODEL_RATES_PER_MILLION = Object.freeze({
  'gemini-2.5-flash': { input: 0.30, output: 2.50 },
  'gemini-2.5-flash-lite': { input: 0.10, output: 0.40 },
  'gemini-2.0-flash': { input: 0.10, output: 0.40 },
  'gemini-2.0-flash-lite': { input: 0.10, output: 0.40 },
  'gemini-1.5-flash': { input: 0.35, output: 1.05 },
  'gemini-1.5-pro': { input: 3.50, output: 10.50 },
});

const toPositiveNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const getTierKey = (accountType) => {
  if (accountType === 'pro_max') return 'proMaxMonthlyUsd';
  if (accountType === 'plus') return 'plusMonthlyUsd';
  if (accountType === 'premium') return 'premiumMonthlyUsd';
  return 'freeMonthlyUsd';
};

const getTierEnvName = (accountType) => {
  if (accountType === 'pro_max') return 'GEMINI_MONTHLY_BUDGET_USD_PRO_MAX';
  if (accountType === 'plus') return 'GEMINI_MONTHLY_BUDGET_USD_PLUS';
  if (accountType === 'premium') return 'GEMINI_MONTHLY_BUDGET_USD_PREMIUM';
  return 'GEMINI_MONTHLY_BUDGET_USD_FREE';
};

const resolveMonthlyBudgetMicros = ({ accountType, defaults, env = process.env }) => {
  const fallbackUsd = toPositiveNumber(defaults?.[getTierKey(accountType)], 0);
  const configuredUsd = toPositiveNumber(env?.[getTierEnvName(accountType)], fallbackUsd);
  return Math.floor(configuredUsd * USD_TO_MICROS);
};

const resolveMaxOutputTokens = ({ requested, defaults, env = process.env }) => {
  const fallback = Math.max(256, Math.floor(toPositiveNumber(defaults?.maxOutputTokens, 8192)));
  const configured = Math.max(256, Math.floor(toPositiveNumber(env?.GEMINI_MAX_OUTPUT_TOKENS, fallback)));
  const requestedValue = Number(requested);
  if (!Number.isFinite(requestedValue) || requestedValue <= 0) return configured;
  return Math.max(1, Math.min(configured, Math.floor(requestedValue)));
};

const resolveGoogleSearchCostMicros = ({ enabled, defaults, env = process.env }) => {
  if (!enabled) return 0;
  const fallbackUsd = toPositiveNumber(defaults?.googleSearchRequestUsd, 0.035);
  const configuredUsd = toPositiveNumber(env?.GEMINI_GOOGLE_SEARCH_REQUEST_USD, fallbackUsd);
  return Math.ceil(configuredUsd * USD_TO_MICROS);
};

const getRates = (model) => MODEL_RATES_PER_MILLION[model] || { input: 1, output: 4 };

const calculateActualCostMicros = ({ model, promptTokens, candidatesTokens, thoughtsTokens }) => {
  const rates = getRates(model);
  const input = Math.max(0, Number(promptTokens) || 0) * rates.input;
  const output = (
    Math.max(0, Number(candidatesTokens) || 0)
    + Math.max(0, Number(thoughtsTokens) || 0)
  ) * rates.output;
  return Math.ceil(input + output);
};

const estimateReservationMicros = ({ model, promptUtf8Bytes, maxOutputTokens, thinkingBudget }) => {
  const rates = getRates(model);
  // A token cannot contain less than one UTF-8 byte, so byte length is a safer
  // upper bound than JavaScript character count for Arabic and mixed prompts.
  // Dynamic thinking reserves one extra output window.
  const inputUpperBound = Math.max(1, Number(promptUtf8Bytes) || 0);
  const thinkingUpperBound = Number(thinkingBudget) === 0
    ? 0
    : Number(thinkingBudget) > 0
      ? Number(thinkingBudget)
      : Number(maxOutputTokens) || 0;
  const outputUpperBound = (Number(maxOutputTokens) || 0) + thinkingUpperBound;
  return Math.max(1, Math.ceil((inputUpperBound * rates.input) + (outputUpperBound * rates.output)));
};

const pruneReservations = (reservations, nowMs) => Object.fromEntries(
  Object.entries(reservations && typeof reservations === 'object' ? reservations : {})
    .filter(([, reservation]) => {
      const createdAtMs = Number(reservation?.createdAtMs || 0);
      return createdAtMs > 0 && nowMs - createdAtMs < RESERVATION_TTL_MS;
    }),
);

const reserveMonthlyCost = ({ data, reservationId, reserveMicros, capMicros, nowMs }) => {
  const accruedCostMicros = Math.max(0, Number(data?.accruedCostMicros || 0));
  const reservations = pruneReservations(data?.reservations, nowMs);
  const reservedCostMicros = Object.values(reservations)
    .reduce((sum, reservation) => sum + Math.max(0, Number(reservation?.amountMicros || 0)), 0);
  const projectedMicros = accruedCostMicros + reservedCostMicros + reserveMicros;

  if (capMicros <= 0 || projectedMicros > capMicros) {
    return { allowed: false, accruedCostMicros, reservedCostMicros, projectedMicros, reservations };
  }

  reservations[reservationId] = { amountMicros: reserveMicros, createdAtMs: nowMs };
  return { allowed: true, accruedCostMicros, reservedCostMicros: reservedCostMicros + reserveMicros, projectedMicros, reservations };
};

const settleMonthlyCost = ({ data, reservationId, actualCostMicros, nowMs }) => {
  const reservations = pruneReservations(data?.reservations, nowMs);
  delete reservations[reservationId];
  return {
    accruedCostMicros: Math.max(0, Number(data?.accruedCostMicros || 0)) + Math.max(0, Number(actualCostMicros || 0)),
    reservations,
  };
};

module.exports = {
  USD_TO_MICROS,
  calculateActualCostMicros,
  estimateReservationMicros,
  reserveMonthlyCost,
  resolveGoogleSearchCostMicros,
  resolveMaxOutputTokens,
  resolveMonthlyBudgetMicros,
  settleMonthlyCost,
};
