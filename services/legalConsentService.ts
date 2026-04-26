import { getLegalPoliciesForAudience } from '../app/legal/policies';
import type { LegalAudience, LegalDocumentDefinition, LegalDocumentKind } from '../app/legal/types';

const buildLegalConsentVersionKey = (audience: LegalAudience, kind: LegalDocumentKind) =>
  `dh_legal_${audience}_${kind}_version`;

const buildLegalConsentAtKey = (audience: LegalAudience, kind: LegalDocumentKind) =>
  `dh_legal_${audience}_${kind}_accepted_at`;

const readStoredValue = (key: string): string => {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(key) || '';
  } catch {
    return '';
  }
};

const writeStoredValue = (key: string, value: string) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage write failures.
  }
};

const removeStoredValue = (key: string) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage remove failures.
  }
};

export const hasAcceptedLegalDocumentVersion = (
  audience: LegalAudience,
  documentDef: LegalDocumentDefinition,
): boolean => {
  const storedVersion = readStoredValue(buildLegalConsentVersionKey(audience, documentDef.kind));
  return storedVersion === documentDef.version;
};

export const persistLegalDocumentConsent = (
  audience: LegalAudience,
  documentDef: LegalDocumentDefinition,
  accepted: boolean,
) => {
  const versionKey = buildLegalConsentVersionKey(audience, documentDef.kind);
  const acceptedAtKey = buildLegalConsentAtKey(audience, documentDef.kind);

  if (!accepted) {
    removeStoredValue(versionKey);
    removeStoredValue(acceptedAtKey);
    return;
  }

  writeStoredValue(versionKey, documentDef.version);
  writeStoredValue(acceptedAtKey, new Date().toISOString());
};

const isAudienceLegalConsentComplete = (audience: LegalAudience): boolean => {
  const policies = getLegalPoliciesForAudience(audience);
  return (
    hasAcceptedLegalDocumentVersion(audience, policies.terms) &&
    hasAcceptedLegalDocumentVersion(audience, policies.privacy)
  );
};

const LEGAL_CONSENT_REQUIRED_MESSAGES: Record<LegalAudience, string> = {
  doctor: 'يلزم الموافقة على شروط وسياسة خصوصية الأطباء قبل المتابعة.',
  public: 'يلزم الموافقة على شروط وسياسة خصوصية الجمهور قبل المتابعة.',
};

export const assertAudienceLegalConsentOrThrow = (audience: LegalAudience): void => {
  if (isAudienceLegalConsentComplete(audience)) return;
  throw new Error(LEGAL_CONSENT_REQUIRED_MESSAGES[audience]);
};
