import { normalizePatientNameForFile } from './patient-files/normalizers';

export interface SearchablePatientSuggestion {
  id: string;
  patientName: string;
  phone?: string;
  patientFileId?: string;
  patientFileNumber?: number;
}

export const normalizePatientPhoneForSearch = (value?: string): string => {
  let digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0020') && digits.length >= 14) digits = digits.slice(2);
  if (digits.startsWith('20') && digits.length >= 12) return `0${digits.slice(-10)}`;
  if (digits.length === 10 && digits.startsWith('1')) return `0${digits}`;
  if (digits.length > 11) return digits.slice(-11);
  return digits;
};

const nameMatchScore = (candidateName: string, rawQuery: string): number => {
  const name = normalizePatientNameForFile(candidateName);
  const query = normalizePatientNameForFile(rawQuery);
  if (!name || !query) return 0;
  if (name === query) return 1_000;
  if (name.startsWith(query)) return 900;

  const nameTokens = name.split(' ').filter(Boolean);
  const queryTokens = query.split(' ').filter(Boolean);
  const allTokensMatch = queryTokens.length > 0 && queryTokens.every((queryToken) =>
    nameTokens.some((nameToken) => nameToken.startsWith(queryToken)),
  );
  if (allTokensMatch) {
    const exactTokenCount = queryTokens.filter((queryToken) => nameTokens.includes(queryToken)).length;
    return 780 + exactTokenCount * 10;
  }
  return name.includes(query) ? 600 : 0;
};

const phoneMatchScore = (candidatePhone: string | undefined, rawQuery: string): number => {
  const phone = normalizePatientPhoneForSearch(candidatePhone);
  const query = normalizePatientPhoneForSearch(rawQuery);
  if (!phone || !query) return 0;
  if (phone === query) return 1_100;
  if (phone.startsWith(query)) return 850;
  return phone.includes(query) ? 650 : 0;
};

export const patientSuggestionIdentityKey = (item: SearchablePatientSuggestion): string => {
  const normalizedPhone = normalizePatientPhoneForSearch(item.phone);
  if (normalizedPhone) {
    return `identity:${normalizePatientNameForFile(item.patientName)}|${normalizedPhone}`;
  }
  const explicitFileId = String(item.patientFileId || '').trim();
  if (explicitFileId) return `file:${explicitFileId}`;
  const fileNumber = Number(item.patientFileNumber || 0);
  if (Number.isFinite(fileNumber) && fileNumber > 0) return `number:${Math.floor(fileNumber)}`;
  return `identity:${normalizePatientNameForFile(item.patientName)}|no-phone`;
};

export const rankPatientSuggestions = <T extends SearchablePatientSuggestion>(
  items: T[],
  nameQuery: string,
  phoneQuery: string,
): T[] => items
  .map((item, index) => ({
    item,
    index,
    score: Math.max(
      nameMatchScore(item.patientName, nameQuery),
      phoneMatchScore(item.phone, phoneQuery),
    ),
  }))
  .filter(({ score }) => score > 0)
  .sort((left, right) => right.score - left.score || left.index - right.index)
  .map(({ item }) => item);

export const mergePatientSuggestions = <T extends SearchablePatientSuggestion>(
  primary: T[],
  fallback: T[],
): T[] => {
  const merged = new Map<string, T>();
  [...primary, ...fallback].forEach((item) => {
    const key = patientSuggestionIdentityKey(item);
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, item);
      return;
    }

    // المصدر الأساسي يظل صاحب الأولوية، مع استكمال الحقول الاختيارية الناقصة
    // (مثل العنوان) من السجلات المحلية المتاحة على الجهاز.
    const enriched: Record<string, unknown> = {
      ...(existing as unknown as Record<string, unknown>),
    };
    Object.entries(item as unknown as Record<string, unknown>).forEach(([field, value]) => {
      const current = enriched[field];
      if ((current === undefined || current === null || current === '') && value !== undefined && value !== null && value !== '') {
        enriched[field] = value;
      }
    });
    merged.set(key, enriched as T);
  });
  return Array.from(merged.values());
};
