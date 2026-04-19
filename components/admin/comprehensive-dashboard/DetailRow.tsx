// ─────────────────────────────────────────────────────────────────────────────
// صف تفصيلي داخل بطاقات الإحصائيات (DetailRow)
// ─────────────────────────────────────────────────────────────────────────────
// مكون صغير مخصوص يعرض: أيقونة ملونة + تسمية + قيمة رقمية (بالعربي).
// يستخدم داخل "حالة الأطباء" و "الملخص المالي" في OverviewSection.
// فصلناه لأنه يتكرر 6 مرات ومن الأسهل صيانته في ملف مستقل.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';

interface DetailRowProps {
  icon: React.ReactElement;
  label: string;
  value: number;
  /** كلاس الخلفية للأيقونة (مثل "bg-emerald-50") */
  iconBg: string;
  /** كلاس لون الأيقونة (مثل "text-emerald-600") */
  iconColor: string;
  /** كلاس لون القيمة — اختياري (افتراضي: slate-900) */
  valueColor?: string;
}

export const DetailRow: React.FC<DetailRowProps> = ({
  icon,
  label,
  value,
  iconBg,
  iconColor,
  valueColor = 'text-slate-900',
}) => (
  <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5">
    <div className="flex items-center gap-2">
      <div className={`${iconBg} ${iconColor} rounded-md p-1`}>
        {/* نستنسخ الأيقونة عشان نضيف لها className مخصص بحجم ثابت */}
        {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-2.5 h-2.5 sm:w-3 sm:h-3' })}
      </div>
      <span className="text-xs sm:text-sm font-semibold text-slate-600">{label}</span>
    </div>
    <span className={`text-sm sm:text-base font-black font-numeric ${valueColor}`}>
      {value.toLocaleString('ar-EG')}
    </span>
  </div>
);
