// اختبار حِمل بحساب واحد جاهز — يكتب N سجل متوازي ويمسحهم
// يتجنّب مشكلة rate-limit بتاع signUp بإنه يسجّل دخول مرة واحدة
// ثم يفجّر الكتابة بالتوازي على نفس الحساب

import { performance } from 'node:perf_hooks';

const TRUTHY = new Set(['1', 'true', 'yes', 'y']);

const parseInt2 = (v, fallback, min, max) => {
  const n = Number.parseInt(String(v ?? ''), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

const parsePct = (v, fallback) => {
  const n = Number.parseFloat(String(v ?? ''));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(100, Math.max(0, n));
};

const percentile = (sorted, p) => {
  if (sorted.length === 0) return 0;
  const i = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.min(sorted.length - 1, Math.max(0, i))];
};

// إعدادات Firebase — نفس مفاتيح الاختبار الأصلي
const API_KEY = String(
  process.env.FIREBASE_API_KEY ||
  'AIzaSyAravOjVTZH-uSdvCPlkTv6GksUxjhNnRw'
).trim();
const PROJECT_ID = String(
  process.env.FIREBASE_PROJECT_ID ||
  'gen-lang-client-0444130146'
).trim();
const REGION = String(process.env.FIREBASE_FUNCTIONS_REGION || 'us-central1').trim();

// بيانات الحساب — لازم تجيها من البيئة
const EMAIL = String(process.env.TEST_EMAIL || '').trim();
const PASSWORD = String(process.env.TEST_PASSWORD || '').trim();

// إعدادات الاختبار
const requests = parseInt2(process.env.REQUESTS, 1000, 1, 10000);
const concurrency = parseInt2(process.env.CONCURRENCY, 50, 1, 500);
const timeoutMs = parseInt2(process.env.TIMEOUT_MS, 30000, 1000, 120000);
const minSuccessRate = parsePct(process.env.MIN_SUCCESS_RATE, 99);
const maxP95Ms = parseInt2(process.env.MAX_P95_MS, 3000, 1, 120000);
const cleanup = TRUTHY.has(String(process.env.CLEANUP ?? 'true').toLowerCase());
const skipQuota = TRUTHY.has(String(process.env.SKIP_QUOTA ?? 'true').toLowerCase());

if (!EMAIL || !PASSWORD) {
  console.error('[single-load-test] Missing TEST_EMAIL / TEST_PASSWORD env vars');
  process.exit(1);
}

const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(API_KEY)}`;
const callableBase = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net`;
const firestoreBase = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

const statusCounts = new Map();
const errorCounts = new Map();
const durations = [];
const writtenIds = [];

let successCount = 0;
let failureCount = 0;
let started = 0;

const recordStatus = (k) => statusCounts.set(k, (statusCounts.get(k) || 0) + 1);
const recordError = (k) => errorCounts.set(k, (errorCounts.get(k) || 0) + 1);

const readJsonSafe = async (response) => {
  const text = await response.text();
  try { return { text, json: JSON.parse(text) }; }
  catch { return { text, json: null }; }
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
  return { ok: response.ok, status: response.status, text, json };
};

// تحويل JS object إلى Firestore REST fields
const toFsFields = (payload) => {
  const fields = {};
  for (const [k, v] of Object.entries(payload)) {
    if (v === null || v === undefined) continue;
    if (typeof v === 'string') fields[k] = { stringValue: v };
    else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
    else if (typeof v === 'number') {
      fields[k] = Number.isInteger(v)
        ? { integerValue: String(v) }
        : { doubleValue: v };
    }
  }
  return fields;
};

const signIn = async () => {
  const r = await requestJson({
    url: signInUrl,
    method: 'POST',
    body: { email: EMAIL, password: PASSWORD, returnSecureToken: true },
  });
  if (!r.ok || !r.json?.idToken || !r.json?.localId) {
    const reason = r.json?.error?.message || `SIGNIN_HTTP_${r.status}`;
    throw new Error(`signIn failed: ${reason}`);
  }
  return { uid: r.json.localId, idToken: r.json.idToken };
};

const writeOneRecord = async ({ uid, idToken, index }) => {
  // ID فريد ويبدأ بـ lt_ علشان نعرف نمسحهم
  const recordId = `lt_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 8)}`;
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();

  // استدعاء validateRecordsCapacity (لو الحساب premium يبقى bypass فوري)
  if (!skipQuota) {
    const quota = await requestJson({
      url: `${callableBase}/validateRecordsCapacity`,
      method: 'POST',
      token: idToken,
      body: { data: {} },
    });
    if (!quota.ok) {
      return {
        ok: false,
        stage: 'quota',
        status: quota.status,
        reason: quota.json?.error?.status || quota.json?.error?.message || `HTTP_${quota.status}`,
      };
    }
  }

  // كتابة السجل بالشكل الحقيقي — لازم dateMs و isConsultationOnly عشان triggers تشتغل صح
  const writeResp = await requestJson({
    url: `${firestoreBase}/users/${uid}/records/${recordId}`,
    method: 'PATCH',
    token: idToken,
    body: {
      fields: toFsFields({
        patientName: `Load Test Patient ${index}`,
        phone: '01000000000',
        date: nowIso,
        dateMs: nowMs,
        branchId: 'main',
        isConsultationOnly: false,
        complaint: 'load test complaint',
        diagnosis: 'load test diagnosis',
        source: 'load-test',
      }),
    },
  });

  if (!writeResp.ok) {
    return {
      ok: false,
      stage: 'write',
      status: writeResp.status,
      reason: writeResp.json?.error?.status || writeResp.json?.error?.message || `HTTP_${writeResp.status}`,
    };
  }

  writtenIds.push(recordId);
  return { ok: true, stage: 'write', status: writeResp.status };
};

const runPool = async (items, poolSize, worker) => {
  let cursor = 0;
  const wrapped = async () => {
    while (true) {
      const i = cursor;
      cursor += 1;
      if (i >= items.length) return;
      await worker(items[i], i);
    }
  };
  const workers = Array.from({ length: Math.min(poolSize, items.length) }, () => wrapped());
  await Promise.all(workers);
};

const cleanupRecords = async ({ uid, idToken }) => {
  console.log(`[single-load-test] Cleanup: deleting ${writtenIds.length} records...`);
  let deleted = 0;
  let failed = 0;
  // المسح بتوازي محدود علشان ما نضربش Firestore تاني
  await runPool(writtenIds, 20, async (recordId) => {
    try {
      const r = await requestJson({
        url: `${firestoreBase}/users/${uid}/records/${recordId}`,
        method: 'DELETE',
        token: idToken,
      });
      if (r.ok) deleted += 1;
      else failed += 1;
    } catch {
      failed += 1;
    }
  });
  console.log(`[single-load-test] Cleanup done: deleted=${deleted} failed=${failed}`);
};

const printSummary = ({ elapsedMs }) => {
  const elapsedSec = elapsedMs / 1000;
  const sorted = [...durations].sort((a, b) => a - b);
  const p50 = percentile(sorted, 50);
  const p95 = percentile(sorted, 95);
  const p99 = percentile(sorted, 99);
  const successRate = (successCount / Math.max(1, started)) * 100;
  const throughput = started / Math.max(0.001, elapsedSec);

  console.log('');
  console.log('[single-load-test] Summary');
  console.log(`[single-load-test] Total=${started} Success=${successCount} Failed=${failureCount}`);
  console.log(`[single-load-test] SuccessRate=${successRate.toFixed(2)}% Throughput=${throughput.toFixed(2)} req/s`);
  console.log(`[single-load-test] LatencyMs p50=${p50.toFixed(1)} p95=${p95.toFixed(1)} p99=${p99.toFixed(1)}`);
  if (statusCounts.size > 0) {
    const s = Array.from(statusCounts.entries()).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(', ');
    console.log(`[single-load-test] Stages=${s}`);
  }
  if (errorCounts.size > 0) {
    const e = Array.from(errorCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k}:${v}`).join(' | ');
    console.log(`[single-load-test] Errors=${e}`);
  }

  const ok = successRate >= minSuccessRate && p95 <= maxP95Ms;
  if (!ok) {
    if (successRate < minSuccessRate) {
      console.log(`[single-load-test] FAIL: success rate ${successRate.toFixed(2)}% < target ${minSuccessRate}%`);
    }
    if (p95 > maxP95Ms) {
      console.log(`[single-load-test] FAIL: p95 ${p95.toFixed(1)}ms > target ${maxP95Ms}ms`);
    }
    process.exitCode = 1;
  } else {
    console.log('[single-load-test] PASS: thresholds achieved.');
  }
};

const main = async () => {
  console.log(`[single-load-test] Email=${EMAIL.replace(/(.{2}).+(@.+)/, '$1***$2')}`);
  console.log(`[single-load-test] Requests=${requests} Concurrency=${concurrency} TimeoutMs=${timeoutMs}`);
  console.log(`[single-load-test] Cleanup=${cleanup} SkipQuota=${skipQuota}`);
  console.log(`[single-load-test] Thresholds: minSuccessRate=${minSuccessRate}% maxP95Ms=${maxP95Ms}`);

  console.log('[single-load-test] Signing in...');
  let session;
  try {
    session = await signIn();
  } catch (err) {
    console.error(`[single-load-test] ${err.message}`);
    process.exit(1);
  }
  console.log(`[single-load-test] Signed in. UID=${session.uid.slice(0, 8)}...`);

  const indexes = Array.from({ length: requests }, (_, i) => i);
  const startAt = performance.now();

  await runPool(indexes, concurrency, async (i) => {
    started += 1;
    const t0 = performance.now();
    let result;
    try {
      result = await writeOneRecord({ uid: session.uid, idToken: session.idToken, index: i });
    } catch (err) {
      result = { ok: false, stage: 'exception', reason: err?.message || String(err) };
    }
    const elapsed = performance.now() - t0;
    durations.push(elapsed);

    if (result.ok) {
      successCount += 1;
      recordStatus(`ok:${result.stage}`);
    } else {
      failureCount += 1;
      recordStatus(`fail:${result.stage}`);
      recordError(result.reason || 'unknown');
    }
  });

  const elapsedMs = performance.now() - startAt;
  printSummary({ elapsedMs });

  if (cleanup && writtenIds.length > 0) {
    await cleanupRecords(session);
  }
};

main().catch((err) => {
  console.error(`[single-load-test] Fatal: ${err?.message || err}`);
  process.exit(1);
});
