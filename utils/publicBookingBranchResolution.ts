import type { PublicBookingSlot, PublicBranchInfo } from '../types';
import { DEFAULT_BRANCH_ID } from '../services/firestore/branches';

export type PublicBookingBranchLinkInput = {
  id?: string;
  name?: string;
  address?: string;
};

export const normalizePublicBranchMatchText = (value?: string): string =>
  String(value || '')
    .trim()
    .replace(/\u0640/g, '')
    .replace(/^(ال)?فرع\s+/i, '')
    .replace(/^ال/i, '')
    .replace(/\s+/g, ' ')
    .replace(/[^\u0600-\u06FFa-z0-9]+/gi, '')
    .toLocaleLowerCase();

const uniqueMatch = <T>(items: T[]): T | null => (items.length === 1 ? items[0] : null);

const isMainBranchLike = (
  branch: PublicBookingBranchLinkInput,
  index: number,
  options: { allowPositionFallback?: boolean } = {},
): boolean => {
  const branchId = String(branch.id || '').trim();
  if (branchId === DEFAULT_BRANCH_ID) return true;
  const normalizedName = normalizePublicBranchMatchText(branch.name);
  return (
    (options.allowPositionFallback !== false && index === 0) ||
    normalizedName === 'main' ||
    normalizedName === 'primary' ||
    normalizedName === normalizePublicBranchMatchText('الفرع الرئيسي')
  );
};

export const resolvePublicBookingBranchForLink = (
  publicBranches: PublicBookingBranchLinkInput[],
  requestedBranch: PublicBookingBranchLinkInput,
): PublicBookingBranchLinkInput | null => {
  const activeBranches = publicBranches
    .map((branch) => ({
      id: String(branch.id || '').trim(),
      name: String(branch.name || '').trim(),
      address: String(branch.address || '').trim(),
    }))
    .filter((branch) => branch.id);

  const requestedId = String(requestedBranch.id || '').trim();
  if (requestedId) {
    const exact = activeBranches.find((branch) => branch.id === requestedId);
    if (exact) return exact;
  }

  const requestedAddress = normalizePublicBranchMatchText(requestedBranch.address);
  if (requestedAddress) {
    const byAddress = uniqueMatch(
      activeBranches.filter((branch) => normalizePublicBranchMatchText(branch.address) === requestedAddress),
    );
    if (byAddress) return byAddress;
  }

  const requestedName = normalizePublicBranchMatchText(requestedBranch.name);
  if (requestedName) {
    const byName = uniqueMatch(
      activeBranches.filter((branch) => normalizePublicBranchMatchText(branch.name) === requestedName),
    );
    if (byName) return byName;
  }

  if (requestedId && isMainBranchLike(requestedBranch, -1, { allowPositionFallback: false })) {
    const mainBranch = activeBranches.find((branch, index) => isMainBranchLike(branch, index));
    if (mainBranch) return mainBranch;
  }

  return null;
};

export const getPublicSlotBranchIds = (slots: PublicBookingSlot[]): string[] => {
  const ids = new Set<string>();
  slots.forEach((slot) => {
    ids.add(slot.branchId || DEFAULT_BRANCH_ID);
  });
  return Array.from(ids).sort((a, b) => {
    if (a === DEFAULT_BRANCH_ID) return -1;
    if (b === DEFAULT_BRANCH_ID) return 1;
    return a.localeCompare(b);
  });
};

export const reconcilePublicBranchesWithSlots = (
  publicBranches: PublicBranchInfo[],
  slotBranchIds: string[],
): PublicBranchInfo[] => {
  if (publicBranches.length === 0 || slotBranchIds.length === 0) return publicBranches;

  const slotBranchIdSet = new Set(slotBranchIds);
  const usedBranchIds = new Set<string>();

  return publicBranches.map((branch, index) => {
    const branchId = String(branch.id || '').trim();
    if (branchId && slotBranchIdSet.has(branchId)) {
      usedBranchIds.add(branchId);
      return { ...branch, id: branchId };
    }

    let replacementId = '';
    if (slotBranchIdSet.has(DEFAULT_BRANCH_ID) && isMainBranchLike(branch, index)) {
      replacementId = DEFAULT_BRANCH_ID;
    } else if (publicBranches.length === 1 && slotBranchIds.length === 1) {
      replacementId = slotBranchIds[0];
    }

    if (replacementId && !usedBranchIds.has(replacementId)) {
      usedBranchIds.add(replacementId);
      return { ...branch, id: replacementId };
    }

    return branch;
  });
};

export const filterPublicSlotsForBranch = (
  slots: PublicBookingSlot[],
  branchId: string,
  isSingleBranch: boolean,
): PublicBookingSlot[] =>
  slots.filter((slot) => {
    const slotBranchId = slot.branchId || DEFAULT_BRANCH_ID;
    return slotBranchId === branchId || (!slot.branchId && isSingleBranch);
  });

export const getUniquePublicBranchNameMatch = (
  branches: PublicBranchInfo[],
  slotBranchIds: string[],
  namesToMatch: string[],
): PublicBranchInfo | undefined => {
  if (namesToMatch.length === 0) return undefined;
  const slotBranchIdSet = new Set(slotBranchIds);
  const matchingBranches = branches.filter((branch) =>
    namesToMatch.includes(normalizePublicBranchMatchText(branch.name)),
  );
  const matchingBranchesWithSlots = matchingBranches.filter((branch) => slotBranchIdSet.has(branch.id));
  if (matchingBranchesWithSlots.length === 1) return matchingBranchesWithSlots[0];
  if (matchingBranches.length === 1) return matchingBranches[0];
  return undefined;
};
