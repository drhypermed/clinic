export const MAX_PATIENT_IMAGES = 50;
export const MAX_PATIENT_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_CASE_ANALYSIS_IMAGES = MAX_PATIENT_IMAGES;
export const PATIENT_IMAGES_REQUIRED_ACCOUNT_TYPE = 'pro_max' as const;

export type PatientImagesAccountType = 'free' | 'premium' | 'plus' | 'pro_max';

export const canUsePatientImages = (accountType?: PatientImagesAccountType): boolean =>
  accountType === PATIENT_IMAGES_REQUIRED_ACCOUNT_TYPE;

export const PATIENT_IMAGES_PRO_MAX_MESSAGE =
  'إضافة صور الفحوصات وملفات المرضى متاحة حصرياً في باقة برو ماكس.';

export const getPatientImagesLimitMessage = (availableSlots = 0): string =>
  availableSlots > 0
    ? `يمكن إضافة ${availableSlots} صورة فقط قبل الوصول إلى الحد الأقصى (${MAX_PATIENT_IMAGES} صورة لكل مريض). يرجى تقليل الصور المختارة أو حذف بعض الصور القديمة.`
    : `تم الوصول إلى الحد الأقصى (${MAX_PATIENT_IMAGES} صورة لكل مريض). يرجى حذف بعض الصور القديمة حتى تتمكن من إضافة صور جديدة.`;
