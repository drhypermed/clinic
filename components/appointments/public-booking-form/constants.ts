/**
 * الملف: constants.ts
 * الوصف: "الثوابت والمعايير" الخاصة بالفورم العام. 
 * يحدد هذا الملف القيود التقنية (Limits) المفروضة على الحقول؛ 
 * مثل أقصى طول لاسم المريض أو رقم الهاتف، لضمان استقرار قاعدة البيانات 
 * ومنع محاولات إغراق النظام ببيانات غير منطقية.
 */
const MAX_PUBLIC_FIELD_LENGTH = 49;

export const MAX_PUBLIC_NAME_LENGTH = MAX_PUBLIC_FIELD_LENGTH;
export const MAX_PUBLIC_PHONE_LENGTH = MAX_PUBLIC_FIELD_LENGTH;
export const MAX_PUBLIC_REASON_LENGTH = MAX_PUBLIC_FIELD_LENGTH;
export const MAX_PUBLIC_AGE_LENGTH = MAX_PUBLIC_FIELD_LENGTH;
