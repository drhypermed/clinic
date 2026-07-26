import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const controls = require('../../functions/src/functions/geminiCostControls.js') as {
  calculateActualCostMicros: (input: Record<string, unknown>) => number;
  estimateReservationMicros: (input: Record<string, unknown>) => number;
  reserveMonthlyCost: (input: Record<string, unknown>) => {
    allowed: boolean;
    accruedCostMicros: number;
    reservedCostMicros: number;
    reservations: Record<string, { amountMicros: number; createdAtMs: number }>;
  };
  resolveGoogleSearchCostMicros: (input: Record<string, unknown>) => number;
  resolveMaxOutputTokens: (input: Record<string, unknown>) => number;
  resolveMonthlyBudgetMicros: (input: Record<string, unknown>) => number;
  settleMonthlyCost: (input: Record<string, unknown>) => {
    accruedCostMicros: number;
    reservations: Record<string, unknown>;
  };
};

describe('Gemini monthly cost controls', () => {
  it('resolves tier defaults and explicit environment overrides', () => {
    const defaults = { freeMonthlyUsd: 0.1, premiumMonthlyUsd: 0.5 };

    expect(controls.resolveMonthlyBudgetMicros({ accountType: 'free', defaults, env: {} })).toBe(100_000);
    expect(controls.resolveMonthlyBudgetMicros({
      accountType: 'premium',
      defaults,
      env: { GEMINI_MONTHLY_BUDGET_USD_PREMIUM: '0.75' },
    })).toBe(750_000);
  });

  it('calculates Gemini 2.5 Flash token cost in microdollars', () => {
    expect(controls.calculateActualCostMicros({
      model: 'gemini-2.5-flash',
      promptTokens: 1_000_000,
      candidatesTokens: 1_000_000,
      thoughtsTokens: 0,
    })).toBe(2_800_000);
  });

  it('counts concurrent reservations before allowing another request', () => {
    const first = controls.reserveMonthlyCost({
      data: { accruedCostMicros: 20_000 },
      reservationId: 'first',
      reserveMicros: 40_000,
      capMicros: 100_000,
      nowMs: 1_000_000,
    });
    expect(first.allowed).toBe(true);

    const second = controls.reserveMonthlyCost({
      data: { accruedCostMicros: 20_000, reservations: first.reservations },
      reservationId: 'second',
      reserveMicros: 50_000,
      capMicros: 100_000,
      nowMs: 1_000_001,
    });

    expect(second.allowed).toBe(false);
    expect(second.reservedCostMicros).toBe(40_000);
  });

  it('prunes stale reservations and settles actual cost', () => {
    const nowMs = 2_000_000;
    const reserved = controls.reserveMonthlyCost({
      data: {
        accruedCostMicros: 10_000,
        reservations: {
          stale: { amountMicros: 90_000, createdAtMs: nowMs - (16 * 60 * 1000) },
        },
      },
      reservationId: 'fresh',
      reserveMicros: 20_000,
      capMicros: 50_000,
      nowMs,
    });

    expect(reserved.allowed).toBe(true);
    expect(reserved.reservations).not.toHaveProperty('stale');

    const settled = controls.settleMonthlyCost({
      data: { accruedCostMicros: 10_000, reservations: reserved.reservations },
      reservationId: 'fresh',
      actualCostMicros: 12_500,
      nowMs: nowMs + 1,
    });
    expect(settled.accruedCostMicros).toBe(22_500);
    expect(settled.reservations).toEqual({});
  });

  it('caps requested output tokens and reserves Arabic prompts by UTF-8 bytes', () => {
    expect(controls.resolveMaxOutputTokens({
      requested: 50_000,
      defaults: { maxOutputTokens: 8_192 },
      env: {},
    })).toBe(8_192);

    expect(controls.estimateReservationMicros({
      model: 'gemini-2.5-flash',
      promptUtf8Bytes: Buffer.byteLength('أحمد', 'utf8'),
      maxOutputTokens: 100,
      thinkingBudget: 0,
    })).toBeGreaterThanOrEqual(250);
  });

  it('reserves the configurable post-quota Google Search grounding charge', () => {
    expect(controls.resolveGoogleSearchCostMicros({ enabled: false, defaults: {}, env: {} })).toBe(0);
    expect(controls.resolveGoogleSearchCostMicros({ enabled: true, defaults: {}, env: {} })).toBe(35_000);
    expect(controls.resolveGoogleSearchCostMicros({
      enabled: true,
      defaults: {},
      env: { GEMINI_GOOGLE_SEARCH_REQUEST_USD: '0.04' },
    })).toBe(40_000);
  });
});
