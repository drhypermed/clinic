/** تعريفات الواجهات (Interfaces) والأنواع (Types) المستخدمة في موديول إعلانات الأطباء. */
import type { DoctorClinicScheduleRow, DoctorClinicServiceRow } from '../../../types';


export interface DoctorAdvertisementPageProps {
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  profileImage?: string;
}

export interface DoctorSocialLink {
  id: string;
  platform: string;
  url: string;
}

export interface DoctorAdHeaderProps {
  adDoctorName: string;
  doctorSpecialty: string;
  academicDegree: string;
}

export interface DoctorAdInfoSectionProps {
  adDoctorName: string;
  yearsExperience: string;
  academicDegree: string;
  subSpecialties: string;
  featuredServicesSummary: string;
  workplace: string;
  extraInfo: string;
  onDoctorNameChange: (value: string) => void;
  onYearsExperienceChange: (value: string) => void;
  onAcademicDegreeChange: (value: string) => void;
  onSubSpecialtiesChange: (value: string) => void;
  onFeaturedServicesSummaryChange: (value: string) => void;
  onWorkplaceChange: (value: string) => void;
  onExtraInfoChange: (value: string) => void;
}

export interface DoctorAdContactSectionProps {
  governorate: string;
  city: string;
  otherCity: string;
  addressDetails: string;
  contactPhone: string;
  whatsapp: string;
  socialLinks: DoctorSocialLink[];
  governorates: readonly string[];
  cityOptions: string[];
  isCustomCityValue: (value: string) => boolean;
  onGovernorateChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onOtherCityChange: (value: string) => void;
  onAddressDetailsChange: (value: string) => void;
  onContactPhoneChange: (value: string) => void;
  onWhatsappChange: (value: string) => void;
  onSocialPlatformChange: (id: string, value: string) => void;
  onSocialUrlChange: (id: string, value: string) => void;
  onSocialRemove: (id: string) => void;
  onSocialAdd: () => void;
}

export interface DoctorAdPricingServicesSectionProps {
  examinationPrice: string;
  discountedExaminationPrice: string;
  consultationPrice: string;
  discountedConsultationPrice: string;
  clinicServices: DoctorClinicServiceRow[];
  onExaminationPriceChange: (value: string) => void;
  onDiscountedExaminationPriceChange: (value: string) => void;
  onConsultationPriceChange: (value: string) => void;
  onDiscountedConsultationPriceChange: (value: string) => void;
  onServiceNameChange: (serviceId: string, value: string) => void;
  onServicePriceChange: (serviceId: string, value: string) => void;
  onServiceDiscountedPriceChange: (serviceId: string, value: string) => void;
  onRemoveService: (serviceId: string) => void;
  onAddService: () => void;
}

export interface DoctorAdScheduleSectionProps {
  clinicSchedule: DoctorClinicScheduleRow[];
  newScheduleDay: string;
  newScheduleFrom: string;
  newScheduleTo: string;
  newScheduleNotes: string;
  daysOfWeek: readonly string[];
  formatTimeWithPeriod: (value?: string) => string;
  onNewScheduleDayChange: (value: string) => void;
  onNewScheduleFromChange: (value: string) => void;
  onNewScheduleToChange: (value: string) => void;
  onNewScheduleNotesChange: (value: string) => void;
  onAddScheduleRow: () => void;
  onRemoveScheduleRow: (id: string) => void;
}

export interface DoctorAdImagesSectionProps {
  imageUrls: string[];
  deletingImageIndex: number | null;
  onAddImageFromFile: (file: File) => Promise<void>;
  onRemoveImage: (index: number) => Promise<void>;
}

export interface DoctorAdActionsBarProps {
  saving: boolean;
  isPublished: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
}

