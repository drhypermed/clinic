type DoctorVerificationStatus = 'submitted' | 'approved' | 'rejected';

const normalizeRawStatus = (value: unknown): string => String(value || '').trim().toLowerCase();

export const normalizeDoctorVerificationStatus = (value: unknown): DoctorVerificationStatus => {
  const normalized = normalizeRawStatus(value);
  if (normalized === 'approved') return 'approved';
  if (normalized === 'rejected') return 'rejected';

  // Legacy status "pending" is treated as "submitted".
  return 'submitted';
};

export const isDoctorPendingVerification = (value: unknown): boolean =>
  normalizeDoctorVerificationStatus(value) === 'submitted';

export const isDoctorApprovedVerification = (value: unknown): boolean =>
  normalizeDoctorVerificationStatus(value) === 'approved';

export const isDoctorRejectedVerification = (value: unknown): boolean =>
  normalizeDoctorVerificationStatus(value) === 'rejected';

