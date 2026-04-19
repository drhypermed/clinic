export interface PatientContactLinks {
  tel: string;
  wa: string;
  normalizedDigits: string;
}

const toDigits = (value: unknown): string => String(value || '').replace(/\D/g, '');

const normalizeForContact = (rawPhone: string): string => {
  if (!rawPhone) return '';

  let digits = rawPhone;
  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  // Normalize local Egyptian mobile format to international format when needed.
  if (digits.startsWith('0')) {
    return `20${digits.slice(1)}`;
  }

  if (digits.startsWith('1') && digits.length === 10) {
    return `20${digits}`;
  }

  return digits;
};

export const buildPatientContactLinks = (phone?: string): PatientContactLinks | null => {
  const digits = normalizeForContact(toDigits(phone));
  if (!digits) return null;

  return {
    tel: `tel:+${digits}`,
    wa: `https://wa.me/${digits}`,
    normalizedDigits: digits,
  };
};
