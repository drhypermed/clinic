import assert from 'node:assert/strict';

import { countLines } from '../auditLargeFiles.mjs';
import { countConsoleCallsInSource } from '../lintReadiness.mjs';

const checks = [];

const registerCheck = (name, fn) => {
  checks.push({ name, fn });
};

registerCheck('countLines returns 0 for empty text', () => {
  assert.equal(countLines(''), 0);
});

registerCheck('countLines handles one and many lines', () => {
  assert.equal(countLines('one line'), 1);
  assert.equal(countLines('line 1\nline 2\nline 3'), 3);
});

registerCheck('countConsoleCallsInSource tracks each console method', () => {
  const source = `
    console.log('a');
    console.warn('b');
    console.error('c');
    console.info('d');
    console.debug('e');
    const consoleLog = () => {};
  `;

  assert.deepEqual(countConsoleCallsInSource(source), {
    debug: 1,
    info: 1,
    log: 1,
    warn: 1,
    error: 1,
  });
});

let failures = 0;

checks.forEach(({ name, fn }) => {
  try {
    fn();
    console.log(`[PASS] ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`[FAIL] ${name}`);
    console.error(error);
  }
});

if (failures > 0) {
  console.error(`[readiness.check] ${failures} check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log(`[readiness.check] all ${checks.length} checks passed.`);
}

