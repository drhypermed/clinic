// ─────────────────────────────────────────────────────────────────────────────
// أدوات مساعدة لتحقق الأطباء (Doctor Verification Helpers)
// ─────────────────────────────────────────────────────────────────────────────
// يحتوي على:
//   - الأنواع (DoctorVerificationItem, RejectConfirmState)
//   - helpers (getInitials, formatRegistrationDate)
//   - الثوابت (DURATION_OPTIONS, PENDING_FETCH_LIMIT, إلخ)
//   - ContactRow: مكون مشترك صغير (واتساب/بريد)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';

/** بيانات طبيب قيد المراجعة. */
export interface DoctorVerificationItem {
  id: string;
  doctorName?: string;
  doctorSpecialty?: string;
  doctorWhatsApp?: string;
  doctorEmail?: string;
  verificationDocUrl?: string;
  verificationStatus?: string;
  accountType?: 'free' | 'premium';
  createdAt?: string;
}

/** حالة مودال تأكيد الرفض. */
export interface RejectConfirmState {
  id: string;
  name: string;
  reason: string;
}

/** استخراج أول حرفين من اسم الطبيب لاستخدامهم في الأفاتار الدائري. */
export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.[0] || '?').toUpperCase();
};

/** تنسيق تاريخ التسجيل بالعربي (الشهر مختصر). */
export const formatRegistrationDate = (isoDate: string): string => {
  if (!isoDate) return 'غير محدد';
  try {
    return new Date(isoDate).toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return 'غير محدد';
  }
};

/** مدد الاشتراك الجاهزة اللي بيعرضها الأدمن للطبيب برو الجديد. */
export const DURATION_OPTIONS = [
  { value: 30, label: '30 يوم' },
  { value: 90, label: '90 يوم' },
  { value: 180, label: '180 يوم' },
  { value: 365, label: '365 يوم' },
] as const;

/** عدد أقصى للطلبات اللي نجيبها في المرة الواحدة (لكل status) — لحماية الأداء. */
export const PENDING_FETCH_LIMIT_PER_STATUS = 250;

/** النص اللي لازم الأدمن يكتبه يدوياً لتأكيد حذف الكل (حماية إضافية). */
export const BULK_DELETE_CONFIRM_PHRASE = 'حذف الكل';

/** عدد العمال المتوازين في الحذف الجماعي — توازن بين السرعة والضغط على السيرفر. */
export const BULK_DELETE_CONCURRENCY = 10;

interface ContactRowProps {
  icon: React.ReactElement;
  label: string;
  value: string;
  iconBg: string;
  iconColor: string;
  dir?: 'ltr' | 'rtl';
}

/** صف معلومة تواصل (واتساب/بريد) — مكون صغير مكرر في البطاقة. */
export const ContactRow: React.FC<ContactRowProps> = ({ icon, label, value, iconBg, iconColor, dir }) => (
  <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5">
    <div className="flex items-center gap-2">
      <div className={`${iconBg} ${iconColor} rounded-md p-1`}>
        {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-2.5 h-2.5 sm:w-3 sm:h-3' })}
      </div>
      <span className="text-xs sm:text-sm font-semibold text-slate-600">{label}</span>
    </div>
    <span className={`text-xs sm:text-sm font-bold text-slate-800 ${dir === 'ltr' ? 'direction-ltr' : ''}`} dir={dir}>
      {value}
    </span>
  </div>
);
