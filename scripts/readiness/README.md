# Stability and Readiness Scripts

This folder stores baseline data used by local readiness checks.

## Available scripts

- `npm run typecheck`
  - Runs TypeScript type checking with no output emit.
- `npm run lint`
  - Runs readiness checks:
    - `lint:readiness` for console usage drift and production console filter registration.
    - `lint:size` for large file risk auditing.
- `npm run test`
  - Runs Node test coverage for readiness script helpers.
- `npm run verify`
  - Runs `typecheck`, `lint`, `test`, and `build` in sequence.

## Console baseline

`consoleBaseline.json` is used by `lint:readiness` to detect console usage regressions.

If you intentionally reduce or refactor logging, refresh baseline:

```bash
npm run lint:readiness -- --write-baseline
```

