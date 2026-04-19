import { performance } from 'node:perf_hooks';

const TRUTHY_VALUES = new Set(['1', 'true', 'yes', 'y']);

const parsePositiveInt = (value, fallback, min, max) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};

const parsePercent = (value, fallback) => {
  const parsed = Number.parseFloat(String(value ?? ''));
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(100, Math.max(0, parsed));
};

const percentile = (sortedValues, p) => {
  if (sortedValues.length === 0) return 0;
  const index = Math.ceil((p / 100) * sortedValues.length) - 1;
  return sortedValues[Math.min(sortedValues.length - 1, Math.max(0, index))];
};

const targetUrl = (process.env.TARGET_URL || 'https://www.drhypermed.com/').trim();
const requests = parsePositiveInt(process.env.REQUESTS, 5000, 1, 1_000_000);
const concurrency = parsePositiveInt(process.env.CONCURRENCY, 200, 1, 5000);
const timeoutMs = parsePositiveInt(process.env.TIMEOUT_MS, 12000, 500, 120000);
const minSuccessRate = parsePercent(process.env.MIN_SUCCESS_RATE, 99);
const maxP95Ms = parsePositiveInt(process.env.MAX_P95_MS, 1500, 1, 120000);
const bustCache = TRUTHY_VALUES.has(String(process.env.BUST_CACHE || '').toLowerCase());

if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
  console.error('[load-test] TARGET_URL must start with http:// or https://');
  process.exit(1);
}

const statusCounts = new Map();
const errorCounts = new Map();
const durations = [];

let successCount = 0;
let failureCount = 0;
let started = 0;

const buildUrl = (sequence) => {
  if (!bustCache) return targetUrl;
  const next = new URL(targetUrl);
  next.searchParams.set('_lt', String(sequence));
  return next.toString();
};

const runSingleRequest = async (sequence) => {
  const startedAt = performance.now();
  const requestUrl = buildUrl(sequence);

  try {
    const response = await fetch(requestUrl, {
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store',
      headers: {
        'cache-control': 'no-cache',
      },
      signal: AbortSignal.timeout(timeoutMs),
    });

    const duration = performance.now() - startedAt;
    durations.push(duration);

    const statusKey = String(response.status);
    statusCounts.set(statusKey, (statusCounts.get(statusKey) || 0) + 1);

    if (response.ok) {
      successCount += 1;
    } else {
      failureCount += 1;
    }
  } catch (error) {
    const duration = performance.now() - startedAt;
    durations.push(duration);

    failureCount += 1;
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    errorCounts.set(errorName, (errorCounts.get(errorName) || 0) + 1);
  }
};

const nextIndex = () => {
  if (started >= requests) return null;
  const current = started;
  started += 1;
  return current;
};

const worker = async () => {
  while (true) {
    const index = nextIndex();
    if (index === null) return;
    await runSingleRequest(index + 1);
  }
};

const main = async () => {
  const workerCount = Math.min(concurrency, requests);
  const suiteStart = performance.now();

  console.log(`[load-test] Target=${targetUrl}`);
  console.log(`[load-test] Requests=${requests} Concurrency=${workerCount} TimeoutMs=${timeoutMs}`);
  console.log(`[load-test] Thresholds: minSuccessRate=${minSuccessRate}% maxP95Ms=${maxP95Ms}`);

  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  const elapsedMs = performance.now() - suiteStart;
  const elapsedSeconds = elapsedMs / 1000;

  const sortedDurations = [...durations].sort((a, b) => a - b);
  const p50 = percentile(sortedDurations, 50);
  const p95 = percentile(sortedDurations, 95);
  const p99 = percentile(sortedDurations, 99);

  const successRate = (successCount / requests) * 100;
  const rps = requests / Math.max(0.001, elapsedSeconds);

  console.log('');
  console.log('[load-test] Summary');
  console.log(`[load-test] Total=${requests} Success=${successCount} Failed=${failureCount}`);
  console.log(`[load-test] SuccessRate=${successRate.toFixed(2)}% Throughput=${rps.toFixed(2)} req/s`);
  console.log(`[load-test] LatencyMs p50=${p50.toFixed(1)} p95=${p95.toFixed(1)} p99=${p99.toFixed(1)}`);

  if (statusCounts.size > 0) {
    const normalizedStatus = [...statusCounts.entries()].sort((a, b) => Number(a[0]) - Number(b[0]));
    console.log(`[load-test] HTTP Statuses=${normalizedStatus.map(([status, count]) => `${status}:${count}`).join(', ')}`);
  }

  if (errorCounts.size > 0) {
    const normalizedErrors = [...errorCounts.entries()].sort((a, b) => b[1] - a[1]);
    console.log(`[load-test] Errors=${normalizedErrors.map(([name, count]) => `${name}:${count}`).join(', ')}`);
  }

  const meetsSuccessRate = successRate >= minSuccessRate;
  const meetsP95 = p95 <= maxP95Ms;

  if (!meetsSuccessRate || !meetsP95) {
    console.error('');
    if (!meetsSuccessRate) {
      console.error(`[load-test] FAIL: success rate ${successRate.toFixed(2)}% is below target ${minSuccessRate}%`);
    }
    if (!meetsP95) {
      console.error(`[load-test] FAIL: p95 ${p95.toFixed(1)}ms is above target ${maxP95Ms}ms`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('[load-test] PASS: thresholds achieved.');
};

main().catch((error) => {
  console.error('[load-test] Unexpected fatal error:', error);
  process.exit(1);
});
