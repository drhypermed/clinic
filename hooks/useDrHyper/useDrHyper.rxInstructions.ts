import { sanitizeDosageText } from '../../utils/rx/rxUtils';

const shouldSuppressPrepInstructions = (
  instructions: string | undefined | null
): boolean => {
  const text = (instructions ?? '').toString().trim();
  return text.startsWith('تعليمات التحضير') || text.startsWith('التحضير ');
};

export const buildRxInstructions = (
  dosage: string,
  medInstructions: string | undefined | null
): string => {
  const safeDose = sanitizeDosageText(dosage);
  const instructions = (medInstructions ?? '').toString().trim();
  const filteredInstructions = shouldSuppressPrepInstructions(instructions) ? '' : instructions;
  return [safeDose, filteredInstructions]
    .filter((value) => (value ?? '').toString().trim())
    .join('\n')
    .trim();
};

