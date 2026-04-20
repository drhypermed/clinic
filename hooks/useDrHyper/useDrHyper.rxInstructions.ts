import { sanitizeDosageText } from '../../utils/rx/rxUtils';

export const buildRxInstructions = (
  dosage: string,
  _medInstructions?: string | null
): string => {
  return sanitizeDosageText(dosage).trim();
};

