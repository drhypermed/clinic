import type { PublicBranchInfo } from '../types';

type PublicBookingPresentationConfig = {
  title?: string;
  contactInfo?: string;
  publicFormSettingsByBranch?: Record<string, { title?: string; contactInfo?: string }>;
  doctorDisplayName?: string;
  doctorProfileImage?: string;
};

type PublicBookingPresentationDoctor = {
  doctorName?: string;
  doctorSpecialty?: string;
  profileImage?: string;
};

type ResolvePublicBookingPresentationParams = {
  config?: PublicBookingPresentationConfig | null;
  doctorSummary?: PublicBookingPresentationDoctor | null;
  branches: PublicBranchInfo[];
  selectedBranchId?: string;
};

const clean = (value?: string | null): string => String(value || '').trim();

export const resolvePublicBookingPresentation = ({
  config,
  doctorSummary,
  branches,
  selectedBranchId,
}: ResolvePublicBookingPresentationParams) => {
  const branchId = clean(selectedBranchId);
  const selectedBranch = branches.find((branch) => branch.id === branchId);
  const branchSettings = branchId ? config?.publicFormSettingsByBranch?.[branchId] : undefined;

  const configTitle = clean(branchSettings?.title) || clean(selectedBranch?.formTitle) || clean(config?.title);
  const contactInfo =
    clean(branchSettings?.contactInfo) ||
    clean(selectedBranch?.contactInfo) ||
    clean(config?.contactInfo);
  const doctorName = clean(doctorSummary?.doctorName) || clean(config?.doctorDisplayName);
  const doctorProfileImage = clean(doctorSummary?.profileImage) || clean(config?.doctorProfileImage);

  return {
    configTitle,
    contactInfo,
    doctorName,
    doctorSpecialty: clean(doctorSummary?.doctorSpecialty),
    doctorProfileImage,
    selectedBranch,
    branchName: clean(selectedBranch?.name),
    branchAddress: clean(selectedBranch?.address),
  };
};
