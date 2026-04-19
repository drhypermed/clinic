/**
 * StatCard.tsx — بطاقة إحصائية ذرية
 *
 * بطاقة بيضاء نظيفة مع أيقونة ملونة لعرض قيمة إحصائية واحدة.
 * متوافقة تماماً مع التصميم المتجاوب وتدعم RTL.
 */

import React from 'react';

interface StatCardProps {
  title: string;
  value: number;
  unit?: string;
  icon: React.ReactElement;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  icon,
  iconBg,
  iconColor,
  valueColor = 'text-slate-900',
}) => (
  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 sm:p-4">
    <div className="flex items-center gap-1.5 mb-2">
      <div className={`${iconBg} ${iconColor} rounded-lg p-1.5 sm:p-2`}>
        {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-3.5 h-3.5 sm:w-4 sm:h-4' })}
      </div>
      <span className="text-[10px] sm:text-[11px] font-bold text-slate-500">{title}</span>
    </div>
    <p className={`text-lg sm:text-2xl font-black font-numeric ${valueColor} tracking-tight`}>
      {value.toLocaleString('ar-EG')}
    </p>
    {unit && <p className="mt-0.5 text-[9px] sm:text-[10px] font-semibold text-slate-400">{unit}</p>}
  </div>
);
