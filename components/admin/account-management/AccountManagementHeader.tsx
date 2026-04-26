/**
 * ترويسة إدارة الأطباء — تصميم عصري مع أيقونة + عدد النتائج + زرار تصدير
 */

import React from 'react';
import { FaStethoscope, FaUsers, FaFileCsv } from 'react-icons/fa6';

interface AccountManagementHeaderProps {
  totalCount: number;
  filteredCount: number;
  /** يُنادى عند الضغط على "تصدير" — الـpanel بيمرّر دالة بتصدر الـfiltered list */
  onExport?: () => void;
  /** disabled لو القائمة فاضية */
  exportDisabled?: boolean;
}

export const AccountManagementHeader: React.FC<AccountManagementHeaderProps> = ({
  totalCount,
  filteredCount,
  onExport,
  exportDisabled = false,
}) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <div className="flex items-center gap-2">
        <div className="bg-brand-50 text-brand-600 rounded-lg p-1.5 sm:p-2">
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
      {/* badge عدد الأطباء المعروضين / الإجمالي */}
      <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-[10px] sm:text-[11px] font-bold text-brand-700">
        <FaUsers className="w-2.5 h-2.5" />
        {filteredCount === totalCount
          ? `${totalCount.toLocaleString('ar-EG')} طبيب`
          : `${filteredCount.toLocaleString('ar-EG')} من ${totalCount.toLocaleString('ar-EG')}`}
      </span>

      {/* زرار التصدير لـCSV — يصدّر المفلتر فقط (لو في فلتر نشط) */}
      {onExport && (
        <button
          type="button"
          onClick={onExport}
          disabled={exportDisabled}
          className="inline-flex items-center gap-1.5 rounded-xl border border-success-200 bg-success-50 px-3 py-1.5 text-[10px] sm:text-[11px] font-bold text-success-700 transition hover:bg-success-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="تنزيل قائمة الأطباء كملف Excel"
        >
          <FaFileCsv className="w-2.5 h-2.5" />
          <span>تصدير</span>
        </button>
      )}
    </div>
  </div>
);
