import { PrescriptionItem } from '../types';

export const sanitizeReadyPrescriptionText = (value: unknown): string =>
  String(value || '').replace(/\r\n/g, '\n').trim();

const normalizeSegmentForCompare = (segment: string): string => {
  return sanitizeReadyPrescriptionText(segment)
    .replace(/[\s\-–—|،:؛.]+$/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
};

const splitInstructionSegments = (text: string): string[] => {
  const value = sanitizeReadyPrescriptionText(text);
  if (!value) return [];

  return value
    .split(/(?:\n+|\s[-–—|]\s|\s*•\s*|\s*●\s*|\s*▪\s*)/)
    .map(part => sanitizeReadyPrescriptionText(part))
    .filter(Boolean);
};

export const extractDoctorFinalInstruction = (item: PrescriptionItem): string => {
  const rawInstructions = sanitizeReadyPrescriptionText(item.instructions);
  if (item.type !== 'medication' || !rawInstructions) return rawInstructions;

  const segments = splitInstructionSegments(rawInstructions);
  if (segments.length === 0) return '';

  const autoDoseKey = normalizeSegmentForCompare(sanitizeReadyPrescriptionText(item.dosage));
  const sourceInstructionKey = normalizeSegmentForCompare(sanitizeReadyPrescriptionText(item.medication?.instructions));

  const filteredSegments = segments.filter(segment => {
    const key = normalizeSegmentForCompare(segment);
    if (!key) return false;
    if (autoDoseKey && key === autoDoseKey) return false;
    if (sourceInstructionKey && key === sourceInstructionKey) return false;
    return true;
  });

  const dedupedSegments: string[] = [];
  const seen = new Set<string>();
  for (const segment of filteredSegments) {
    const key = normalizeSegmentForCompare(segment);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    dedupedSegments.push(segment);
  }

  if (dedupedSegments.length > 0) {
    return dedupedSegments[dedupedSegments.length - 1];
  }

  return segments[segments.length - 1];
};

export const sanitizeReadyPrescriptionRxItems = (
  items: PrescriptionItem[],
  sanitizeRxItemsForSave: (items: PrescriptionItem[]) => PrescriptionItem[]
): PrescriptionItem[] => {
  return sanitizeRxItemsForSave(items).map(item => {
    if (item.type === 'medication') {
      return {
        ...item,
        dosage: sanitizeReadyPrescriptionText(item.dosage),
        instructions: extractDoctorFinalInstruction(item),
      };
    }

    return {
      ...item,
      instructions: sanitizeReadyPrescriptionText(item.instructions),
    };
  });
};

export const normalizeReadyPrescriptionTextList = (values?: string[]): string[] => {
  return (values || []).map(v => sanitizeReadyPrescriptionText(v)).filter(Boolean);
};
