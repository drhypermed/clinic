/**
 * الملف: types.ts
 * الوصف: "قاموس الأنواع" (TypeScript Types). 
 * يحتوي على تعريفات الهياكل البيانية المستخدمة في فورم الجمهور؛ 
 * مثل هيكل تنبيه الكوتا (BookingQuotaNotice) وأنواع منصات المشاركة المدعومة. 
 * يساعد هذا الملف المطورين في الحفاظ على توافق أنواع البيانات عبر كافة مكونات الفورم.
 */
export type BookingQuotaNotice = {
  message: string;
  whatsappUrl: string;
  whatsappNumber: string;
};

export type SharePlatform = 'facebook' | 'whatsapp' | 'twitter' | 'gmail' | 'copy';
