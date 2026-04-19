# Load Testing Guide

This project includes a simple HTTP burst test to validate production readiness under high traffic.

## Quick Start

Run the default test:

```bash
npm run load:test
```

Defaults:
- `TARGET_URL=https://www.drhypermed.com/`
- `REQUESTS=5000`
- `CONCURRENCY=200`
- `TIMEOUT_MS=12000`
- `MIN_SUCCESS_RATE=99`
- `MAX_P95_MS=1500`

## PowerShell Example (Windows)

```powershell
$env:TARGET_URL = "https://www.drhypermed.com/"
$env:REQUESTS = "10000"
$env:CONCURRENCY = "400"
$env:TIMEOUT_MS = "15000"
$env:MIN_SUCCESS_RATE = "99.5"
$env:MAX_P95_MS = "1800"
npm run load:test
```

Optional cache-busting mode (each request has a unique query param):

```powershell
$env:BUST_CACHE = "true"
npm run load:test
```

## Cloud Functions Scaling Controls

The callable functions runtime now reads these environment variables from `functions/index.js`:

- `CALLABLE_MIN_INSTANCES` (default `1`)
- `CALLABLE_MAX_INSTANCES` (default `300`)
- `CALLABLE_CONCURRENCY` (default `120`)
- `GEMINI_MAX_INSTANCES` (default `40`)
- `GEMINI_CONCURRENCY` (default `20`)

Suggested production baseline for thousands of concurrent users (tune by real metrics and budget):

- `CALLABLE_MIN_INSTANCES=2`
- `CALLABLE_MAX_INSTANCES=400`
- `CALLABLE_CONCURRENCY=120`
- `GEMINI_MAX_INSTANCES=60`
- `GEMINI_CONCURRENCY=20`

## Validation Checklist

1. Run `npm run load:test` before deployment.
2. Confirm the command exits with `PASS`.
3. Verify Firebase/Google Cloud metrics during test:
   - cold starts
   - function latency p95/p99
   - error rate
   - Firestore read/write throttling
4. Re-run after each major frontend bundle or backend change.
