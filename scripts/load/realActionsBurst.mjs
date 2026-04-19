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

const parseMode = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'analysis' || normalized === 'save') return normalized;
  return 'analysis';
};

const parseArgs = (argv) => {
  const map = new Map();
  argv.forEach((arg) => {
    if (!arg.startsWith('--')) return;
    const [key, value] = arg.slice(2).split('=');
    map.set(key, value ?? 'true');
  });
  return map;
};

const percentile = (sortedValues, p) => {
  if (sortedValues.length === 0) return 0;
  const index = Math.ceil((p / 100) * sortedValues.length) - 1;
  return sortedValues[Math.min(sortedValues.length - 1, Math.max(0, index))];
};

const args = parseArgs(process.argv.slice(2));

const API_KEY = String(
  process.env.FIREBASE_API_KEY ||
  args.get('api_key') ||
  'AIzaSyAravOjVTZH-uSdvCPlkTv6GksUxjhNnRw'
).trim();
const PROJECT_ID = String(
  process.env.FIREBASE_PROJECT_ID ||
  args.get('project_id') ||
  'gen-lang-client-0444130146'
).trim();
const REGION = String(
  process.env.FIREBASE_FUNCTIONS_REGION ||
  args.get('region') ||
  'us-central1'
).trim();

const mode = parseMode(process.env.MODE || args.get('mode'));
const requests = parsePositiveInt(process.env.REQUESTS || args.get('requests'), 325, 1, 5000);
const concurrency = parsePositiveInt(process.env.CONCURRENCY || args.get('concurrency'), requests, 1, 5000);
const setupConcurrency = parsePositiveInt(process.env.SETUP_CONCURRENCY || args.get('setup_concurrency'), 30, 1, 500);
const userPoolSize = parsePositiveInt(process.env.USER_POOL_SIZE || args.get('user_pool_size'), requests, 1, 5000);
const timeoutMs = parsePositiveInt(process.env.TIMEOUT_MS || args.get('timeout_ms'), 30000, 1000, 120000);
const minSuccessRate = parsePercent(process.env.MIN_SUCCESS_RATE || args.get('min_success_rate'), 99);
const maxP95Ms = parsePositiveInt(process.env.MAX_P95_MS || args.get('max_p95_ms'), 3000, 1, 120000);
const cleanupAfter = TRUTHY_VALUES.has(
  String(process.env.CLEANUP ?? args.get('cleanup') ?? 'true').toLowerCase()
);
const forcePremium = TRUTHY_VALUES.has(
  String(process.env.FORCE_PREMIUM ?? args.get('force_premium') ?? 'true').toLowerCase()
);
const password = String(process.env.TEST_PASSWORD || args.get('password') || 'P@ssw0rd!234567');
const emailPrefix = String(process.env.EMAIL_PREFIX || args.get('email_prefix') || 'loadtest_real');

if (!API_KEY || !PROJECT_ID || !REGION) {
  console.error('[real-load-test] Missing required Firebase config.');
  process.exit(1);
}

const signUpEndpoint = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${encodeURIComponent(API_KEY)}`;
const deleteAccountEndpoint = `https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${encodeURIComponent(API_KEY)}`;
const callableBase = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net`;
const firestoreBase = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

const statusCounts = new Map();
const errorCounts = new Map();
const durations = [];
const users = [];

let successCount = 0;
let failureCount = 0;
let startedActions = 0;

const recordStatus = (key) => {
  statusCounts.set(key, (statusCounts.get(key) || 0) + 1);
};

const recordError = (key) => {
  errorCounts.set(key, (errorCounts.get(key) || 0) + 1);
};

const readJsonSafe = async (response) => {
  const text = await response.text();
  try {
    return { text, json: JSON.parse(text) };
  } catch {
    return { text, json: null };
  }
};

const requestJson = async ({ url, method = 'POST', token = '', body = null }) => {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === null ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });

  const { text, json } = await readJsonSafe(response);
  return {
    ok: response.ok,
    status: response.status,
    text,
    json,
  };
};

const buildUserEmail = (index) => `${emailPrefix}_${Date.now()}_${index}@drhyperload.test`;

const toFirestoreFields = (payload) => {
  const fields = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (typeof value === 'string') {
      fields[key] = { stringValue: value };
      return;
    }
    if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value };
      return;
    }
    if (typeof value === 'number') {
      fields[key] = Number.isInteger(value)
        ? { integerValue: String(value) }
        : { doubleValue: value };
    }
  });
  return fields;
};

const createTestUser = async (index) => {
  const email = buildUserEmail(index);
  const nowIso = new Date().toISOString();
  const signUp = await requestJson({
    url: signUpEndpoint,
    method: 'POST',
    body: { email, password, returnSecureToken: true },
  });

  if (!signUp.ok || !signUp.json?.idToken || !signUp.json?.localId) {
    const reason = signUp.json?.error?.message || `SIGNUP_HTTP_${signUp.status}`;
    throw new Error(`signUp failed: ${reason}`);
  }

  const idToken = signUp.json.idToken;
  const uid = signUp.json.localId;

  const userDoc = await requestJson({
    url: `${firestoreBase}/users/${uid}`,
    method: 'PATCH',
    token: idToken,
    body: {
      fields: toFirestoreFields({
        accountType: forcePremium ? 'premium' : 'free',
        premiumStartDate: forcePremium ? nowIso : '',
        premiumExpiryDate: forcePremium ? '2099-12-31T23:59:59.999Z' : '',
        authRole: 'doctor',
        userRole: 'doctor',
        doctorName: 'Load Test Doctor',
        doctorEmail: email,
      }),
    },
  });

  if (!userDoc.ok) {
    const reason = userDoc.json?.error?.message || `USER_DOC_HTTP_${userDoc.status}`;
    throw new Error(`create users/${uid} failed: ${reason}`);
  }

  return {
    uid,
    email,
    idToken,
    createdRecordIds: [],
    usageDocIds: new Set(),
  };
};

const runAnalysisAction = async (user) => {
  const prompt = 'Return one short word: ok';
  const response = await requestJson({
    url: `${callableBase}/generateGeminiContent`,
    method: 'POST',
    token: user.idToken,
    body: {
      data: {
        prompt,
        model: 'gemini-2.5-flash',
        responseMimeType: 'text/plain',
        temperature: 0,
      },
    },
  });

  if (!response.ok) {
    return {
      ok: false,
      stage: 'analysis',
      status: response.status,
      reason:
        response.json?.error?.status ||
        response.json?.error?.message ||
        `HTTP_${response.status}`,
    };
  }

  const dayKey = response.json?.result?.dayKey;
  if (dayKey) {
    user.usageDocIds.add(`gemini-${dayKey}`);
  }

  return {
    ok: true,
    stage: 'analysis',
    status: response.status,
  };
};

const runSaveAction = async (user) => {
  const quotaResponse = await requestJson({
    url: `${callableBase}/consumeStorageQuota`,
    method: 'POST',
    token: user.idToken,
    body: { data: { feature: 'recordSave' } },
  });

  if (!quotaResponse.ok) {
    return {
      ok: false,
      stage: 'save:quota',
      status: quotaResponse.status,
      reason:
        quotaResponse.json?.error?.status ||
        quotaResponse.json?.error?.message ||
        `HTTP_${quotaResponse.status}`,
    };
  }

  const dayKey = quotaResponse.json?.result?.dayKey;
  if (dayKey) {
    user.usageDocIds.add(`recordSave-${dayKey}`);
  }

  const recordId = `lt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const writeResponse = await requestJson({
    url: `${firestoreBase}/users/${user.uid}/records/${recordId}`,
    method: 'PATCH',
    token: user.idToken,
    body: {
      fields: toFirestoreFields({
        patientName: 'Load Test Patient',
        date: new Date().toISOString(),
        complaint: 'headache',
        source: 'load-test',
      }),
    },
  });

  if (!writeResponse.ok) {
    return {
      ok: false,
      stage: 'save:record-write',
      status: writeResponse.status,
      reason:
        writeResponse.json?.error?.status ||
        writeResponse.json?.error?.message ||
        `HTTP_${writeResponse.status}`,
    };
  }

  user.createdRecordIds.push(recordId);

  return {
    ok: true,
    stage: 'save',
    status: writeResponse.status,
  };
};

const runPool = async (items, poolSize, worker) => {
  let cursor = 0;
  const output = new Array(items.length);

  const wrapped = async () => {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) return;
      output[index] = await worker(items[index], index);
    }
  };

  const workers = Array.from({ length: Math.min(poolSize, items.length) }, () => wrapped());
  await Promise.all(workers);
  return output;
};

const cleanupUser = async (user) => {
  const token = user.idToken;
  for (const recordId of user.createdRecordIds) {
    await requestJson({
      url: `${firestoreBase}/users/${user.uid}/records/${recordId}`,
      method: 'DELETE',
      token,
    }).catch(() => undefined);
  }

  for (const usageDocId of user.usageDocIds) {
    await requestJson({
      url: `${firestoreBase}/users/${user.uid}/usageDaily/${usageDocId}`,
      method: 'DELETE',
      token,
    }).catch(() => undefined);
  }

  await requestJson({
    url: `${firestoreBase}/users/${user.uid}`,
    method: 'DELETE',
    token,
  }).catch(() => undefined);

  await requestJson({
    url: deleteAccountEndpoint,
    method: 'POST',
    body: { idToken: token },
  }).catch(() => undefined);
};

const printSummary = ({ elapsedMs }) => {
  const elapsedSeconds = elapsedMs / 1000;
  const sortedDurations = [...durations].sort((a, b) => a - b);
  const p50 = percentile(sortedDurations, 50);
  const p95 = percentile(sortedDurations, 95);
  const p99 = percentile(sortedDurations, 99);
  const successRate = (successCount / Math.max(1, startedActions)) * 100;
  const throughput = startedActions / Math.max(0.001, elapsedSeconds);

  console.log('');
  console.log('[real-load-test] Summary');
  console.log(`[real-load-test] Mode=${mode} Total=${startedActions} Success=${successCount} Failed=${failureCount}`);
  console.log(`[real-load-test] SuccessRate=${successRate.toFixed(2)}% Throughput=${throughput.toFixed(2)} req/s`);
  console.log(`[real-load-test] LatencyMs p50=${p50.toFixed(1)} p95=${p95.toFixed(1)} p99=${p99.toFixed(1)}`);

  if (statusCounts.size > 0) {
    const normalizedStatus = [...statusCounts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    console.log(`[real-load-test] Statuses=${normalizedStatus.map(([key, count]) => `${key}:${count}`).join(', ')}`);
  }

  if (errorCounts.size > 0) {
    const normalizedErrors = [...errorCounts.entries()].sort((a, b) => b[1] - a[1]);
    console.log(`[real-load-test] Errors=${normalizedErrors.map(([key, count]) => `${key}:${count}`).join(', ')}`);
  }

  const meetsSuccess = successRate >= minSuccessRate;
  const meetsP95 = p95 <= maxP95Ms;
  if (!meetsSuccess || !meetsP95) {
    console.log('');
    if (!meetsSuccess) {
      console.log(`[real-load-test] FAIL: success rate ${successRate.toFixed(2)}% is below target ${minSuccessRate}%`);
    }
    if (!meetsP95) {
      console.log(`[real-load-test] FAIL: p95 ${p95.toFixed(1)}ms is above target ${maxP95Ms}ms`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('[real-load-test] PASS: thresholds achieved.');
};

const main = async () => {
  const setupUserCount = Math.max(1, Math.min(userPoolSize, requests));
  console.log(`[real-load-test] Mode=${mode}`);
  console.log(`[real-load-test] Requests=${requests} Concurrency=${Math.min(concurrency, requests)} SetupConcurrency=${Math.min(setupConcurrency, setupUserCount)} UserPoolSize=${setupUserCount}`);
  console.log(`[real-load-test] Cleanup=${cleanupAfter ? 'enabled' : 'disabled'}`);
  console.log(`[real-load-test] ForcePremium=${forcePremium ? 'enabled' : 'disabled'}`);
  console.log(`[real-load-test] Thresholds: minSuccessRate=${minSuccessRate}% maxP95Ms=${maxP95Ms}`);

  const setupStartedAt = performance.now();
  const createdUsers = await runPool(
    Array.from({ length: setupUserCount }, (_, i) => i + 1),
    Math.min(setupConcurrency, setupUserCount),
    async (index) => {
      try {
        return await createTestUser(index);
      } catch (error) {
        return { setupError: error instanceof Error ? error.message : String(error) };
      }
    }
  );
  const setupElapsed = performance.now() - setupStartedAt;

  createdUsers.forEach((entry) => {
    if (entry && !entry.setupError) {
      users.push(entry);
    } else {
      failureCount += 1;
      recordStatus('setup-failed');
      recordError(entry?.setupError || 'setup-failed');
    }
  });

  console.log(`[real-load-test] Setup complete: created=${users.length} failed=${setupUserCount - users.length} in ${setupElapsed.toFixed(1)}ms`);

  if (users.length === 0) {
    console.error('[real-load-test] No users available for action stage.');
    process.exit(1);
  }

  const actionWorker = mode === 'save' ? runSaveAction : runAnalysisAction;
  const runStartedAt = performance.now();
  const actionIndexes = Array.from({ length: requests }, (_, i) => i);

  await runPool(actionIndexes, concurrency, async (actionIndex) => {
    const user = users[actionIndex % users.length];
    const startedAt = performance.now();
    startedActions += 1;

    try {
      const result = await actionWorker(user);
      const duration = performance.now() - startedAt;
      durations.push(duration);

      if (result.ok) {
        successCount += 1;
        recordStatus(`${result.stage}:ok`);
        return;
      }

      failureCount += 1;
      recordStatus(`${result.stage}:http-${result.status}`);
      recordError(result.reason || `${result.stage}:unknown`);
    } catch (error) {
      const duration = performance.now() - startedAt;
      durations.push(duration);
      failureCount += 1;
      recordStatus('runtime:exception');
      recordError(error instanceof Error ? error.message : 'runtime:exception');
    }
  });

  const runElapsed = performance.now() - runStartedAt;
  printSummary({ elapsedMs: runElapsed });

  if (cleanupAfter) {
    const cleanupStartedAt = performance.now();
    await runPool(users, setupConcurrency, async (user) => {
      await cleanupUser(user);
    });
    const cleanupElapsed = performance.now() - cleanupStartedAt;
    console.log(`[real-load-test] Cleanup done in ${cleanupElapsed.toFixed(1)}ms`);
  }
};

main().catch((error) => {
  console.error('[real-load-test] Unexpected fatal error:', error);
  process.exit(1);
});
