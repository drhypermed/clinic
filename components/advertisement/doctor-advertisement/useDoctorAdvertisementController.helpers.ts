import type {
  DoctorAdProfile,
  DoctorClinicScheduleRow,
  DoctorClinicServiceRow,
} from '../../../types';
import type { DoctorSocialLink } from './types';
import { sanitizeSocialLinks, sanitizeSocialUrl, sanitizeTextInput } from './securityUtils';
import { isCustomCityValue, toNumber } from './utils';

export const isDoctorAdImageOwnedByDoctor = (imageUrl: string, doctorId: string) => {
  const normalizedUrl = String(imageUrl || '').trim();
  const normalizedDoctorId = String(doctorId || '').trim();
  if (!normalizedUrl || !normalizedDoctorId) return false;
  const rawToken = `${normalizedDoctorId}_doctor_ad_`;
  const encodedToken = encodeURIComponent(rawToken);
  return normalizedUrl.includes(rawToken) || normalizedUrl.includes(encodedToken);
};

interface BuildDoctorAdPreviewDataParams {
  safeDoctorId: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  profileImage?: string;
  adDoctorName: string;
  academicDegree: string;
  subSpecialties: string;
  featuredServicesSummary: string;
  workplace: string;
  extraInfo: string;
  governorate: string;
  city: string;
  otherCity: string;
  addressDetails: string;
  clinicSchedule: DoctorClinicScheduleRow[];
  examinationPrice: string;
  discountedExaminationPrice: string;
  consultationPrice: string;
  discountedConsultationPrice: string;
  clinicServices: DoctorClinicServiceRow[];
  imageUrls: string[];
  contactPhone: string;
  whatsapp: string;
  socialLinks: DoctorSocialLink[];
  yearsExperience: string;
  isPublished: boolean;
  normalizeScheduleRows: (rows: DoctorClinicScheduleRow[]) => DoctorClinicScheduleRow[];
}

export const buildDoctorAdPreviewData = ({
  safeDoctorId,
  doctorId,
  doctorName,
  doctorSpecialty,
  profileImage,
  adDoctorName,
  academicDegree,
  subSpecialties,
  featuredServicesSummary,
  workplace,
  extraInfo,
  governorate,
  city,
  otherCity,
  addressDetails,
  clinicSchedule,
  examinationPrice,
  discountedExaminationPrice,
  consultationPrice,
  discountedConsultationPrice,
  clinicServices,
  imageUrls,
  contactPhone,
  whatsapp,
  socialLinks,
  yearsExperience,
  isPublished,
  normalizeScheduleRows,
}: BuildDoctorAdPreviewDataParams): DoctorAdProfile => {
  const cityValue = isCustomCityValue(city) ? otherCity.trim() : city;
  return {
    doctorId: safeDoctorId || doctorId,
    doctorName: sanitizeTextInput(adDoctorName, 160) || doctorName || '',
    doctorSpecialty: sanitizeTextInput(doctorSpecialty, 160) || '',
    academicDegree: sanitizeTextInput(academicDegree, 400),
    subSpecialties: sanitizeTextInput(subSpecialties, 1200),
    featuredServicesSummary: sanitizeTextInput(featuredServicesSummary, 1200),
    workplace: sanitizeTextInput(workplace, 800),
    extraInfo: sanitizeTextInput(extraInfo, 1500),
    profileImage: profileImage || '',
    clinicName: '',
    bio: sanitizeTextInput(extraInfo, 1500),
    governorate: sanitizeTextInput(governorate, 120),
    city: sanitizeTextInput(cityValue, 120),
    addressDetails: sanitizeTextInput(addressDetails, 800),
    clinicSchedule: normalizeScheduleRows(clinicSchedule),
    examinationPrice: toNumber(examinationPrice),
    discountedExaminationPrice: toNumber(discountedExaminationPrice),
    consultationPrice: toNumber(consultationPrice),
    discountedConsultationPrice: toNumber(discountedConsultationPrice),
    clinicServices: clinicServices.filter((service) => service.name.trim()),
    services: clinicServices.filter((service) => service.name.trim()).map((service) => service.name),
    imageUrls,
    contactPhone: sanitizeTextInput(contactPhone, 40),
    whatsapp: sanitizeTextInput(whatsapp, 40),
    socialLinks: sanitizeSocialLinks(socialLinks),
    socialMediaPlatform: sanitizeTextInput(socialLinks[0]?.platform, 80),
    socialMediaUrl: sanitizeSocialUrl(socialLinks[0]?.url),
    yearsExperience: toNumber(yearsExperience),
    isPublished,
    createdAt: String(Date.now()),
    updatedAt: String(Date.now()),
  };
};

interface ValidateDoctorAdBeforeSaveParams {
  adDoctorName: string;
  doctorSpecialty: string;
  governorate: string;
  city: string;
  otherCity: string;
  addressDetails: string;
  socialLinks: DoctorSocialLink[];
  examinationPrice: string;
  discountedExaminationPrice: string;
  consultationPrice: string;
  discountedConsultationPrice: string;
  clinicServices: DoctorClinicServiceRow[];
}

export const validateDoctorAdBeforeSave = ({
  adDoctorName,
  doctorSpecialty,
  governorate,
  city,
  otherCity,
  addressDetails,
  socialLinks,
  examinationPrice,
  discountedExaminationPrice,
  consultationPrice,
  discountedConsultationPrice,
  clinicServices,
}: ValidateDoctorAdBeforeSaveParams): string => {
  if (!adDoctorName.trim()) return 'يرجى إدخال اسم الطبيب.';
  if (!doctorSpecialty.trim()) return 'يرجى إدخال التخصص الطبي في الحساب.';
  if (!governorate) return 'يرجى اختيار المحافظة.';
  const cityValue = isCustomCityValue(city) ? otherCity.trim() : city;
  if (!cityValue) return 'يرجى اختيار المدينة أو كتابة مدينة أخرى.';
  if (!addressDetails.trim()) return 'يرجى إدخال العنوان بالتفصيل.';
  const invalidSocial = socialLinks.some((item) => item.url.trim() && !sanitizeSocialUrl(item.url));
  if (invalidSocial) return 'رابط السوشيال غير صحيح. يجب أن يبدأ بـ http أو https.';
  const exam = toNumber(examinationPrice);
  const discountedExam = toNumber(discountedExaminationPrice);
  if (discountedExam != null && exam == null) return 'يرجى إدخال سعر الكشف قبل إضافة سعر الخصم.';
  if (discountedExam != null && exam != null && discountedExam >= exam) {
    return 'سعر الكشف بعد الخصم يجب أن يكون أقل من السعر الأساسي.';
  }
  const consultation = toNumber(consultationPrice);
  const discountedConsultation = toNumber(discountedConsultationPrice);
  if (discountedConsultation != null && consultation == null) {
    return 'يرجى إدخال سعر الاستشارة قبل إضافة سعر الخصم.';
  }
  if (discountedConsultation != null && consultation != null && discountedConsultation >= consultation) {
    return 'سعر الاستشارة بعد الخصم يجب أن يكون أقل من السعر الأساسي.';
  }
  const invalidServiceDiscount = clinicServices.some((service) => {
    const p = toNumber(service.price == null ? '' : String(service.price));
    const d = toNumber(service.discountedPrice == null ? '' : String(service.discountedPrice));
    return d != null && (p == null || d >= p);
  });
  if (invalidServiceDiscount) return 'خصم الخدمة يجب أن يكون أقل من سعر الخدمة الأساسي.';
  return '';
};
