import { MEDICATIONS, MEDICATIONS_DEDUPE_REPORT } from '../app/drug-catalog/constants';

type DedupeReport = typeof MEDICATIONS_DEDUPE_REPORT & {
  beforeNameAndPrice?: number;
  removedDuplicateNameAndPrice?: number;
  remainingAfterNameAndPrice?: number;
  finalAfterIdDedup?: number;
  'قبل_اسم_وسعر'?: number;
  'محذوف_مكرر_اسم_وسعر'?: number;
  'باقي_بعد_اسم_وسعر'?: number;
  'نهائي_بعد_إزالة_تكرار_id'?: number;
};

const report = MEDICATIONS_DEDUPE_REPORT as DedupeReport;
const before = report.beforeNameAndPrice ?? report['قبل_اسم_وسعر'] ?? 0;
const removed = report.removedDuplicateNameAndPrice ?? report['محذوف_مكرر_اسم_وسعر'] ?? 0;
const remaining = report.remainingAfterNameAndPrice ?? report['باقي_بعد_اسم_وسعر'] ?? 0;
const finalCount = report.finalAfterIdDedup ?? report['نهائي_بعد_إزالة_تكرار_id'] ?? 0;

console.log('--- Deduplication Report (name + price, keep first) ---');
console.log('Before (all source files):', before);
console.log('Removed duplicates:', removed);
console.log('Remaining after name+price dedupe:', remaining);
console.log('Final after id dedupe:', finalCount);
console.log('---');
console.log('MEDICATIONS.length =', MEDICATIONS.length);
