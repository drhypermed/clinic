// ─────────────────────────────────────────────────────────────────────────────
// زر اختصار سريع (QuickAction)
// ─────────────────────────────────────────────────────────────────────────────
// زر مربع الشكل يستخدم كاختصار للتنقل بين أقسام لوحة الأدمن.
// فيه أيقونة + تسمية رئيسية + تسمية فرعية + شارة اختيارية (مثل عدد الطلبات المعلقة).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';

interface QuickActionProps {
  icon: React.ReactElement;
  /** النص الرئيسي (مثال: "تحقق") */
  label: string;
  /** وصف مختصر تحت النص الرئيسي (مثال: "تحقق الأطباء الجدد") */
  sublabel: string;
  /** لون الحدود (مثل "border-sky-200") */
  borderColor: string;
  /** خلفية الزر (مثل "bg-sky-50/60") */
  bgColor: string;
  /** لون النصوص داخل الزر */
  textColor: string;
  /** لون الأيقونة */
  iconColor: string;
  /** عدد الإشعارات/الطلبات المعلقة — يظهر كشارة حمراء لو > 0 */
  badge?: number;
  onClick: () => void;
}

export const QuickAction: React.FC<QuickActionProps> = ({
  icon,
  label,
  sublabel,
  borderColor,
  bgColor,
  textColor,
  iconColor,
  badge,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`relative rounded-2xl border ${borderColor} ${bgColor} px-3 py-3 sm:py-4 text-right transition hover:shadow-sm w-full`}
  >
    <div className="flex items-center gap-2 mb-1">
      <span className={iconColor}>
        {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-3.5 h-3.5 sm:w-4 sm:h-4' })}
      </span>
      <span className={`text-xs sm:text-sm font-bold ${textColor}`}>{label}</span>
    </div>
    <p className={`text-[10px] sm:text-[11px] font-medium ${textColor} opacity-70`}>{sublabel}</p>

    {/* الشارة الحمراء: تظهر فقط لو في عدد > 0. لو > 99 نعرض "99+" */}
    {badge != null && badge > 0 && (
      <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-black text-white shadow-sm">
        {badge > 99 ? '99+' : badge}
      </span>
    )}
  </button>
);
