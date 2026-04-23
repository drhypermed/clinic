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

// ملحوظة: DoctorAdContactSectionProps اتشالت من هنا وبقت معرَّفة داخل
// DoctorAdContactSection.tsx نفسه — لأن المكون اتبسّط وبقى بيتعامل مع فرع واحد فقط.
// روابط السوشيال اتفصلت لقسم عالمي منفصل (DoctorAdSocialLinksSection).

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
  // تعديل صف مواعيد موجود: الطبيب بيضغط "تعديل" جنب "حذف" فيبقى الصف قابل للتحرير
  onUpdateScheduleRow: (id: string, patch: Partial<DoctorClinicScheduleRow>) => void;
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

