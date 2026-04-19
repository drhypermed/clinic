# Legal Policies Customization

The legal consent flow is split into dedicated files so you can edit each audience independently.

## Policy Content Files

Doctor:
- `app/legal/doctor/terms.ts`
- `app/legal/doctor/privacy.ts`

Public:
- `app/legal/public/terms.ts`
- `app/legal/public/privacy.ts`

Shared policy mapping:
- `app/legal/policies.ts`

## Consent UI Components

- `components/auth/legal/LegalConsentGate.tsx`
- `components/auth/legal/LegalDocumentModal.tsx`

## Where Enforcement Happens

Entry pages:
- `components/auth/DoctorGoogleLoginPage.tsx`
- `components/auth/DoctorSignupPage.tsx`
- `components/auth/PublicLoginPage.tsx`

Service-level guard:
- `services/legalConsentService.ts`
- `services/auth-service/google-auth.ts`

## Important Editing Note

If you change legal text in a way that requires users to re-accept, update the `version` field in each legal document file.
The consent system checks the stored accepted version, so version bumps force a fresh consent.
