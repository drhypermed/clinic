/**
 * فلاتر إدارة الأطباء — 5 فلاتر بتصميم عصري
 * بحث + حالة التحقق + التخصص + نوع الاشتراك + الترتيب
 */

import React from 'react';
import { FaFilter } from 'react-icons/fa6';
import { SmartFilter } from './types';

interface AccountManagementFiltersProps {
  filters: SmartFilter;
  setFilters: React.Dispatch<React.SetStateAction<SmartFilter>>;
  specialties: string[];
}

export const AccountManagementFilters: React.FC<AccountManagementFiltersProps> = ({
  filters,
  setFilters,
  specialties,
}) => {
  const update = <K extends keyof SmartFilter>(key: K, value: SmartFilter[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50/60 border-b border-slate-100">
        <FaFilter className="w-3 h-3 text-slate-500" />
        <h3 className="text-xs sm:text-sm font-black text-slate-700">تصفية وبحث</h3>
      </div>

      <div className="p-3 sm:p-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {/* Search */}
        <div>
          <label className="mb-1.5 block text-[11px] sm:text-xs font-bold text-slate-500">بحث عام</label>
          <input
            type="text"
            placeholder="بحث بالاسم أو البريد..."
            value={filters.searchTerm}
            onChange={(e) => update('searchTerm', e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-100"
          />
        </div>

        {/* Verification Status */}
        <div>
          <label className="mb-1.5 block text-[11px] sm:text-xs font-bold text-slate-500">حالة التحقق</label>
          <select
            value={filters.verificationStatus}
            onChange={(e) => update('verificationStatus', e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-100"
          >
            <option value="all">الكل</option>
            <option value="approved">مقبول</option>
            <option value="rejected">مرفوض</option>
            <option value="submitted">قيد المراجعة</option>
          </select>
        </div>

        {/* Specialty */}
        <div>
          <label className="mb-1.5 block text-[11px] sm:text-xs font-bold text-slate-500">التخصص</label>
          <select
            value={filters.specialty}
            onChange={(e) => update('specialty', e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-100"
          >
            <option value="all">كل التخصصات</option>
            {specialties.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Subscription Type */}
        <div>
          <label className="mb-1.5 block text-[11px] sm:text-xs font-bold text-slate-500">نوع الاشتراك</label>
          <select
            value={filters.subscriptionType}
            onChange={(e) => update('subscriptionType', e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-100"
          >
            <option value="all">الكل</option>
            <option value="free">مجاني</option>
            <option value="premium">برو</option>
            <option value="pro_max">برو ماكس</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="mb-1.5 block text-[11px] sm:text-xs font-bold text-slate-500">الترتيب</label>
          <select
            value={filters.sortBy}
            onChange={(e) => update('sortBy', e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-100"
          >
            <option value="recent">الأحدث</option>
            <option value="name">الاسم</option>
          </select>
        </div>
      </div>
    </div>
  );
};
