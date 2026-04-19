/**
 * ترويسة إدارة الأطباء — تصميم عصري مع أيقونة + عدد النتائج
 */

import React from 'react';
import { FaStethoscope, FaUsers } from 'react-icons/fa6';

interface AccountManagementHeaderProps {
  totalCount: number;
  filteredCount: number;
}

export const AccountManagementHeader: React.FC<AccountManagementHeaderProps> = ({
  totalCount,
  filteredCount,
}) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <div className="flex items-center gap-2">
        <div className="bg-cyan-50 text-cyan-600 rounded-lg p-1.5 sm:p-2">
          <FaStethoscope className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
        <h2 className="text-base sm:text-lg lg:text-xl font-black text-slate-800 tracking-tight">
          إدارة الأطباء
        </h2>
      </div>
      <p className="mt-1 text-[11px] sm:text-xs text-slate-500">
        إدارة وتصفية ومراجعة حسابات الأطباء والاشتراكات.
      </p>
    </div>
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-[10px] sm:text-[11px] font-bold text-cyan-700">
        <FaUsers className="w-2.5 h-2.5" />
        {filteredCount === totalCount
          ? `${totalCount.toLocaleString('ar-EG')} طبيب`
          : `${filteredCount.toLocaleString('ar-EG')} من ${totalCount.toLocaleString('ar-EG')}`}
      </span>
    </div>
  </div>
);
