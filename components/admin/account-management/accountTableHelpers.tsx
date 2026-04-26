// ─────────────────────────────────────────────────────────────────────────────
// أدوات مساعدة لجدول إدارة الحسابات (Account Table Helpers)
// ─────────────────────────────────────────────────────────────────────────────
// يحتوي على:
//   - getInitials: تحويل اسم الطبيب لحرفين للأفاتار
//   - getStatusConfig: تعيين أيقونة ولون بناء على حالة التحقق
//   - CHANGE_TYPE_LABELS: تسميات عربية لأنواع تغيير الاشتراك
//   - DURATION_PRESETS: مدد الاشتراك الشائعة (شهر / 6 شهور / سنة)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { FaCircleCheck, FaCircleXmark, FaHourglassHalf } from 'react-icons/fa6';
import {
  isDoctorApprovedVerification,
  isDoctorRejectedVerification,
} from '../../../utils/doctorVerificationStatus';

/**
 * استخراج أول حرفين من اسم الطبيب لاستخدامهم في الأفاتار الدائري.
 * مثال: "أحمد محمد" → "أم" | "أحمد" → "أ"
 */
export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.[0] || '?').toUpperCase();
};

/** تعريف شكل شارة الحالة (أيقونة + تسمية + كلاسات CSS). */
interface StatusConfig {
  icon: React.ReactElement;
  label: string;
  cls: string;
}

/**
 * اختيار شكل الشارة المناسب لحالة تحقق الطبيب.
 * مقبول → أخضر | مرفوض → أحمر | قيد المراجعة → أصفر (افتراضي).
 */
export const getStatusConfig = (status?: string): StatusConfig => {
  if (isDoctorApprovedVerification(status))
    return {
      icon: <FaCircleCheck className="w-2.5 h-2.5" />,
      label: 'مقبول',
      cls: 'border-success-200 bg-success-50 text-success-700',
    };
  if (isDoctorRejectedVerification(status))
    return {
      icon: <FaCircleXmark className="w-2.5 h-2.5" />,
      label: 'مرفوض',
      cls: 'border-danger-200 bg-danger-50 text-danger-700',
    };
  return {
    icon: <FaHourglassHalf className="w-2.5 h-2.5" />,
    label: 'قيد المراجعة',
    cls: 'border-warning-200 bg-warning-50 text-warning-700',
  };
};

/**
 * تسميات عربية لأنواع تغيير الاشتراك — تستخدم في عرض السجل التاريخي للاشتراكات.
 * new = اشتراك جديد | extension = تمديد | manual_edit = تعديل يدوي | plan_switch = تغيير خطة
 */
export const CHANGE_TYPE_LABELS: Record<string, { label: string; cls: string }> = {
  new: { label: 'اشتراك جديد', cls: 'border-success-200 bg-success-50 text-success-700' },
  extension: { label: 'تمديد', cls: 'border-brand-200 bg-brand-50 text-brand-700' },
  manual_edit: { label: 'تعديل يدوي', cls: 'border-brand-200 bg-brand-50 text-brand-700' },
  plan_switch: { label: 'تغيير خطة', cls: 'border-warning-200 bg-warning-50 text-warning-700' },
  '': { label: 'غير محدد', cls: 'border-slate-200 bg-slate-50 text-slate-500' },
};

/** مدد الاشتراك الشائعة اللي بنعرضها للأدمن في اختيار سريع بدل الإدخال اليدوي. */
export const DURATION_PRESETS = [
  { days: 30, label: 'شهر' },
  { days: 180, label: '6 شهور' },
  { days: 365, label: 'سنة' },
] as const;

/** ميلي ثانية في 7 أيام — نستخدمه لتحديد "اشتراك قرب ينتهي". */
export const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
