/**
 * اختبارات منطق المصالحة في handleBookingSecretReady.
 *
 * السياق:
 *   الفروع كانت ممكن تخزن سرّين مختلفين في نفس الوقت (race condition):
 *     - users/{uid}.bookingSecretByBranch[branchId] = b_NEW...
 *     - branches/{id}.secretarySecret = b_OLD...
 *   النتيجة: الطبيب يكتب على bookingConfig/b_NEW، السكرتيرة تقرا من b_OLD.
 *
 * المصالحة (في useMainAppBookingSecret.ts):
 *   - لو فيه سر في المكان الآمن مختلف عن الوارد → نفضّل الموجود
 *   - لو القديم legacy موجود ومختلف → نهاجره ونستخدمه
 *   - لو مفيش حاجة → نكتب اللي وصلنا
 *
 * نختبر منطق التفضيل بدون mocking Firestore — مجرد دالة pure لمحاكاة القرار.
 */

import { describe, it, expect } from 'vitest';

/**
 * نسخة pure من منطق التفضيل في handleBookingSecretReady.
 * يأخذ الـsecret الوارد + الموجود في الـmap الآمن + الـlegacy، ويرجع السر اللي
 * يجب استخدامه + action عشان نتأكد من قرار الكتابة الصحيح.
 */
type ReconcileDecision = {
  useSecret: string;
  action: 'use-existing' | 'use-legacy-and-migrate' | 'write-new' | 'unchanged';
};

const decideSecret = (
  incoming: string,
  existingInSafeMap: string,
  legacy: string,
): ReconcileDecision => {
  if (existingInSafeMap && existingInSafeMap !== incoming) {
    return { useSecret: existingInSafeMap, action: 'use-existing' };
  }
  if (existingInSafeMap) {
    return { useSecret: existingInSafeMap, action: 'unchanged' };
  }
  if (legacy && legacy !== incoming) {
    return { useSecret: legacy, action: 'use-legacy-and-migrate' };
  }
  return { useSecret: incoming, action: 'write-new' };
};

describe('decideSecret — منطق مصالحة السرّ المتضارب', () => {
  it('لا تعارض ومفيش سر سابق → نكتب الوارد', () => {
    const result = decideSecret('b_NEW', '', '');
    expect(result).toEqual({ useSecret: 'b_NEW', action: 'write-new' });
  });

  it('السر في الـmap الآمن مطابق للوارد → unchanged', () => {
    const result = decideSecret('b_NEW', 'b_NEW', '');
    expect(result).toEqual({ useSecret: 'b_NEW', action: 'unchanged' });
  });

  it('السر في الـmap الآمن مختلف → نفضّل الموجود (السكرتيرة عارفاه)', () => {
    const result = decideSecret('b_NEW', 'b_OLD_IN_MAP', '');
    expect(result).toEqual({ useSecret: 'b_OLD_IN_MAP', action: 'use-existing' });
  });

  it('الـlegacy موجود ومختلف عن الوارد → نهاجر للـlegacy', () => {
    const result = decideSecret('b_NEW', '', 'b_LEGACY');
    expect(result).toEqual({ useSecret: 'b_LEGACY', action: 'use-legacy-and-migrate' });
  });

  it('الـlegacy مطابق للوارد → نكتب الوارد (نفس الشيء)', () => {
    const result = decideSecret('b_NEW', '', 'b_NEW');
    expect(result).toEqual({ useSecret: 'b_NEW', action: 'write-new' });
  });

  it('safe map له أولوية على الـlegacy', () => {
    // الـmap الآمن فيه قيمة، الـlegacy فيه قيمة تانية — الـmap يفوز.
    const result = decideSecret('b_NEW', 'b_MAP', 'b_LEGACY');
    expect(result).toEqual({ useSecret: 'b_MAP', action: 'use-existing' });
  });

  it('safe map له أولوية حتى لو مطابق للوارد', () => {
    // الـmap نفسه = الوارد، الـlegacy مختلف — نـskip التحقق من legacy
    const result = decideSecret('b_NEW', 'b_NEW', 'b_LEGACY_DIFFERENT');
    expect(result).toEqual({ useSecret: 'b_NEW', action: 'unchanged' });
  });
});
