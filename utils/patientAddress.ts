import type { PatientAddress } from '../types';

const cleanPart = (value: unknown): string =>
  String(value ?? '').replace(/\s+/g, ' ').trim();

export const normalizePatientAddress = (
  value?: Partial<PatientAddress> | string | null,
): PatientAddress | undefined => {
  if (typeof value === 'string') {
    const details = cleanPart(value);
    return details ? { details } : undefined;
  }

  const governorate = cleanPart(value?.governorate);
  const cityArea = cleanPart(value?.cityArea);
  const details = cleanPart(value?.details);

  if (!governorate && !cityArea && !details) return undefined;

  return {
    ...(governorate ? { governorate } : {}),
    ...(cityArea ? { cityArea } : {}),
    ...(details ? { details } : {}),
  };
};

export const formatPatientAddress = (
  value?: Partial<PatientAddress> | string | null,
  mode: 'full' | 'summary' = 'full',
): string => {
  const address = normalizePatientAddress(value);
  if (!address) return '';

  if (mode === 'summary') {
    return [address.governorate, address.cityArea].filter(Boolean).join('، ')
      || address.details
      || '';
  }

  return [address.governorate, address.cityArea, address.details]
    .filter(Boolean)
    .join('، ');
};

export const patientAddressSearchText = (
  value?: Partial<PatientAddress> | string | null,
): string => formatPatientAddress(value).toLowerCase();
