export * from './app/drug-catalog/types';

// Feature-local type re-exports used عبر aliases (`@/types`) after modularization.
export type {
  ApprovedDoctor,
  AccountType,
  SubscriptionPeriod,
  SubscriptionUnit,
  EditMode,
  SmartFilter,
} from './components/admin/account-management/types';

export type {
  AccountTypeControlsForm,
  PlanConfig,
  GroupConfig,
  LimitKey,
  MessageKey,
  WhatsappMessageKey,
} from './components/admin/account-type-controls/types';

export type {
  AdminDashboardProps,
  AdminListItem,
  AdminView,
  DashboardStats,
  NavItem,
} from './components/admin/comprehensive-dashboard/types';

export type {
  FinancialViewMode,
  MonthlyExpense,
  MonthlyPrices,
  NewExpenseInput,
  RevenueData,
  SubscriptionPrices,
  Totals,
  YearlyStats,
} from './components/admin/financial-panel/types';

export type {
  BannerItem,
  CropAreaPixels,
  HomeBannerData,
  HomepageBannerManagementPanelProps,
} from './components/admin/homepage-banner-management/types';

export type {
  PatientAccount,
  PatientManagementPanelProps,
  PatientManagementTableProps,
  PatientReviewsModalProps,
  UsePatientManagementActionsParams,
} from './components/admin/patient-management/types';

export type {
  DoctorAdvertisementPageProps,
  DoctorAdHeaderProps,
  DoctorAdInfoSectionProps,
  DoctorAdPricingServicesSectionProps,
  DoctorAdScheduleSectionProps,
  DoctorAdImagesSectionProps,
  DoctorAdActionsBarProps,
} from './components/advertisement/doctor-advertisement/types';

export type { PublicDoctorsDirectoryPageProps } from './components/advertisement/public-directory/types';

export type {
  AddAppointmentFormProps,
  AppointmentType,
  BookingQuotaNoticeInfo,
  PatientSuggestionOption,
  RecentExamPatientOption,
} from './components/appointments/add-appointment-form/types';

export type {
  AppointmentDayGroup,
  SecretaryEntryAlertResponse,
  AppointmentsViewProps,
} from './components/appointments/appointments-view/types';

export type { BookingQuotaNotice, SharePlatform } from './components/appointments/public-booking-form/types';

export type {
  Config,
  BookingQuotaNotice as PublicBookingQuotaNotice,
  SecretaryAuthCredentials,
  EntryAlert,
  TodayAppointment,
  DoctorEntryResponse,
} from './components/appointments/public-booking/types';

export type {
  FooterSettingsTabProps,
  FooterSectionSharedProps,
  FooterLogoSectionProps,
  FooterBackgroundSectionProps,
} from './components/prescription-settings/footer-settings/types';

export type {
  HeaderSettingsTabProps,
  HeaderSectionSharedProps,
  HeaderPatientInfoSectionProps,
} from './components/prescription-settings/header-settings/types';

export type {
  VitalsSettingsTabProps,
  VitalsSectionControlsProps,
  VitalsListSectionProps,
  VitalsSectionStylePanelProps,
  CustomBoxesSectionProps,
} from './components/prescription-settings/vitals-settings/types';

export type {
  AccountTypeControls,
  SmartPrescriptionQuotaResult,
  StorageQuotaFeature,
  StorageQuotaResult,
  BookingQuotaFeature,
  BookingQuotaResult,
  DrugToolQuotaFeature,
  DrugToolQuotaResult,
  SmartQuotaLimitErrorDetails,
} from './services/account-type-controls/types';

export type {
  BookingConfigView,
  SecretaryLoginTarget,
  SecretaryProfile,
  SecretaryEntryRequest,
  SecretaryEntryResponse,
  BookingConfigTodayAppointment,
  RecentExamPatient,
  PatientDirectoryItem,
} from './services/firestore/booking-secretary/types';
