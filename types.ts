export * from './app/drug-catalog/types';

// Feature-local type re-exports used عبر aliases (`@/types`) after modularization.
export type {
  ApprovedDoctor,
  AccountType,
} from './components/admin/account-management/types';

export type {
  AccountTypeControlsForm,
  GroupConfig,
} from './components/admin/account-type-controls/types';

export type {
  AdminDashboardProps,
  AdminListItem,
} from './components/admin/comprehensive-dashboard/types';

export type {
  FinancialViewMode,
  MonthlyExpense,
  MonthlyPrices,
  NewExpenseInput,
  ProMaxSubscriptionPrices,
  RevenueData,
  SubscriptionPrices,
} from './components/admin/financial-panel/types';

export type {
  BannerItem,
} from './components/admin/homepage-banner-management/types';

export type {
  PatientAccount,
  PatientReviewsModalProps,
  UsePatientManagementActionsParams,
} from './components/admin/patient-management/types';

export type {
  DoctorAdvertisementPageProps,
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
  SecretaryAuthCredentials,
  EntryAlert,
  TodayAppointment,
  DoctorEntryResponse,
} from './components/appointments/public-booking/types';

export type {
  FooterSectionSharedProps,
  FooterLogoSectionProps,
  FooterBackgroundSectionProps,
} from './components/prescription-settings/footer-settings/types';

export type {
  HeaderSectionSharedProps,
  HeaderPatientInfoSectionProps,
} from './components/prescription-settings/header-settings/types';

export type {
  VitalsSectionControlsProps,
} from './components/prescription-settings/vitals-settings/types';

export type {
  AccountTypeControls,
  BookingQuotaFeature,
} from './services/account-type-controls/types';

export type {
  SecretaryProfile,
  SecretaryEntryRequest,
  SecretaryEntryResponse,
  BookingConfigTodayAppointment,
} from './services/firestore/booking-secretary/types';
