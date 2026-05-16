import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getLegalPoliciesForAudience } from '../../app/legal/policies';
import {
  getAudienceLegalConsentSnapshot,
  hasAcceptedLegalDocumentVersion,
  persistLegalDocumentConsent,
} from '../../services/legalConsentService';

describe('legalConsentService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it('stores accepted document versions and returns a Firestore-ready snapshot', () => {
    const policies = getLegalPoliciesForAudience('doctor');

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-17T10:00:00.000Z'));
    persistLegalDocumentConsent('doctor', policies.terms, true);

    vi.setSystemTime(new Date('2026-05-17T10:01:00.000Z'));
    persistLegalDocumentConsent('doctor', policies.privacy, true);

    vi.setSystemTime(new Date('2026-05-17T10:02:00.000Z'));
    const snapshot = getAudienceLegalConsentSnapshot('doctor');

    expect(hasAcceptedLegalDocumentVersion('doctor', policies.terms)).toBe(true);
    expect(hasAcceptedLegalDocumentVersion('doctor', policies.privacy)).toBe(true);
    expect(snapshot).toEqual({
      audience: 'doctor',
      termsVersion: policies.terms.version,
      termsTitle: policies.terms.title,
      termsEffectiveDate: policies.terms.effectiveDate,
      privacyVersion: policies.privacy.version,
      privacyTitle: policies.privacy.title,
      privacyEffectiveDate: policies.privacy.effectiveDate,
      termsAcceptedAt: '2026-05-17T10:00:00.000Z',
      privacyAcceptedAt: '2026-05-17T10:01:00.000Z',
      recordedAt: '2026-05-17T10:02:00.000Z',
    });
  });
});
