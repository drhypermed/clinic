import type {
  VisitServiceCharge,
  VisitServiceTemplate,
  VisitServiceType,
} from './types';

export const normalizeServiceName = (value: unknown): string =>
  String(value || '')
    .normalize('NFKC')
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    .replace(/[\u0623\u0625\u0622\u0671]/g, '\u0627')
    .replace(/\u0649/g, '\u064A')
    .replace(/\u0629/g, '\u0647')
    .replace(/\u0624/g, '\u0648')
    .replace(/\u0626/g, '\u064A')
    .replace(/\u0621/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();

export const buildVisitServiceTemplateId = (
  type: VisitServiceType,
  normalizedName: string,
): string => {
  let hash = 2166136261;
  const value = `${type}:${normalizedName}`;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `svc_${type === 'interventions' ? 'i' : 'o'}_${(hash >>> 0).toString(36)}`;
};

export const normalizeVisitServiceTemplates = (value: unknown): VisitServiceTemplate[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is VisitServiceTemplate => {
      if (!item || typeof item !== 'object') return false;
      const candidate = item as VisitServiceTemplate;
      return Boolean(
        candidate.id
        && candidate.name
        && (candidate.type === 'interventions' || candidate.type === 'other')
        && Number.isFinite(Number(candidate.defaultPrice)),
      );
    })
    .map((item) => ({
      ...item,
      normalizedName: normalizeServiceName(item.normalizedName || item.name),
      defaultPrice: Math.max(0, Number(item.defaultPrice) || 0),
      active: item.active !== false,
      usageCount: Math.max(0, Number(item.usageCount) || 0),
    }))
    .sort((left, right) => {
      const usageDifference = right.usageCount - left.usageCount;
      if (usageDifference !== 0) return usageDifference;
      return right.lastUsedAt - left.lastUsedAt;
    });
};

export const filterVisitServiceItems = (
  items: VisitServiceCharge[],
  visitId: string,
  dateKey: string,
): VisitServiceCharge[] =>
  items
    .filter((item) => (
      visitId
        ? item.visitId === visitId
        : !item.visitId && item.dateKey === dateKey
    ))
    .sort((left, right) => right.createdAt - left.createdAt);

