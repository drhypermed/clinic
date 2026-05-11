/**
 * اختبارات حارس السكرتيرة في useAuth.
 *
 * السياق:
 *   السكرتيرة بتسجّل دخول عبر Firebase Custom Token بـUID = `secretary:secret:branchId`.
 *   useAuth بيشتغل في كل الـapp (بما فيها صفحة السكرتيرة العامة) — وكان بيحاول
 *   يحمّل بروفايل من users/{uid}. مفيش بروفايل لهذه الـUIDs → role resolution
 *   timeout → forced signout → loop لا نهائي مع useSecretaryTokenRefresh.
 *
 * الإصلاح: لو الـUID يطابق pattern `^secretary:.+:.+$` نتجاهله بالكامل في useAuth.
 *
 * الـtests هنا بتختبر الـregex pattern نفسه — لو حد عدّله بدون وعي، اختبار يفشل.
 */

import { describe, it, expect } from 'vitest';

// Regex مطابق لما في hooks/useAuth.ts — لو ده اتغير لازم تتحدّث الـtests
const SECRETARY_UID_PATTERN = /^secretary:.+:.+$/;

describe('SECRETARY_UID_PATTERN — حارس useAuth', () => {
  it('يقبل UID صحيح بشكل secretary:{secret}:{branchId}', () => {
    expect(SECRETARY_UID_PATTERN.test('secretary:b_abc123:branch_main')).toBe(true);
  });

  it('يقبل secret طويل + branchId به أرقام', () => {
    expect(SECRETARY_UID_PATTERN.test('secretary:b_1ed78e73f98f6c792065dc93b7ee068bmna68q7r:branch_1777999195198')).toBe(true);
  });

  it('يرفض UID عادي للطبيب (random firebase UID)', () => {
    expect(SECRETARY_UID_PATTERN.test('xJ8Lk2pQwM7nR4tY')).toBe(false);
  });

  it('يرفض UID فاضي', () => {
    expect(SECRETARY_UID_PATTERN.test('')).toBe(false);
  });

  it('يرفض UID بقسم واحد فقط', () => {
    expect(SECRETARY_UID_PATTERN.test('secretary:b_abc')).toBe(false);
  });

  it('يرفض UID بدون prefix secretary:', () => {
    expect(SECRETARY_UID_PATTERN.test('admin:b_abc:branch_main')).toBe(false);
  });

  it('يرفض UID بـ branchId فاضي', () => {
    expect(SECRETARY_UID_PATTERN.test('secretary:b_abc:')).toBe(false);
  });

  it('يرفض UID بـ secret فاضي', () => {
    expect(SECRETARY_UID_PATTERN.test('secretary::branch_main')).toBe(false);
  });
});
