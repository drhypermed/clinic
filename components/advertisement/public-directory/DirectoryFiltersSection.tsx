import React from 'react';
import { GOVERNORATES } from '../constants';

interface DirectoryFiltersSectionProps {
  searchFilter: string;
  onSearchFilterChange: (value: string) => void;
  specialtyFilter: string;
  onSpecialtyFilterChange: (value: string) => void;
  specialties: string[];
  governorateFilter: string;
  onGovernorateFilterChange: (value: string) => void;
  cityFilter: string;
  onCityFilterChange: (value: string) => void;
  citiesForFilter: string[];
  topSpecialties: string[];
  onTopSpecialtyClick: (value: string) => void;
  activeFiltersCount: number;
  filteredAdsCount: number;
  adsCount: number;
  onResetFilters: () => void;
}

export const DirectoryFiltersSection: React.FC<DirectoryFiltersSectionProps> = ({
  searchFilter,
  onSearchFilterChange,
  specialtyFilter,
  onSpecialtyFilterChange,
  specialties,
  governorateFilter,
  onGovernorateFilterChange,
  cityFilter,
  onCityFilterChange,
  citiesForFilter,
  topSpecialties,
  onTopSpecialtyClick,
  activeFiltersCount,
  filteredAdsCount,
  adsCount,
  onResetFilters,
}) => {
  const hasSearch = activeFiltersCount > 0 || searchFilter.trim().length > 0;

  return (
    <section className="relative clinic-section p-4 md:p-5">
      <div className="clinic-section-header mb-4">
        <h3 className="clinic-section-header__title">البحث والتصفية</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 relative z-10">
        <div className="md:col-span-5">
          <label className="block text-xs clinic-label mb-1">ابحث عن طبيب</label>
          <input
            value={searchFilter}
            onChange={(e) => onSearchFilterChange(e.target.value)}
            className="w-full h-12 rounded-xl clinic-field px-3 shadow-sm"
            placeholder="اسم الطبيب، التخصص، خدمة، عنوان"
          />
        </div>
        <div className="md:col-span-3">
          <label className="block text-xs clinic-label mb-1">التخصص</label>
          <select
            value={specialtyFilter}
            onChange={(e) => onSpecialtyFilterChange(e.target.value)}
            className="w-full h-12 rounded-xl clinic-field px-3 shadow-sm"
          >
            <option value="">كل التخصصات</option>
            {specialties.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs clinic-label mb-1">المحافظة</label>
          <select
            value={governorateFilter}
            onChange={(e) => onGovernorateFilterChange(e.target.value)}
            className="w-full h-12 rounded-xl clinic-field px-3 shadow-sm"
          >
            <option value="">كل المحافظات</option>
            {GOVERNORATES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs clinic-label mb-1">المدينة</label>
          <select
            value={cityFilter}
            onChange={(e) => onCityFilterChange(e.target.value)}
            className="w-full h-12 rounded-xl clinic-field px-3 shadow-sm disabled:opacity-50"
            disabled={!governorateFilter}
          >
            <option value="">كل المدن</option>
            {citiesForFilter.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {hasSearch && topSpecialties.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 relative z-10">
          {topSpecialties.map((specialty) => (
            <button
              key={specialty}
              type="button"
              onClick={() => onTopSpecialtyClick(specialty)}
              className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-black border transition-all ${
                specialtyFilter === specialty
                  ? 'bg-gradient-to-l from-cyan-600 to-teal-600 text-white border-transparent shadow-md'
                  : 'clinic-info hover:brightness-95'
              }`}
            >
              {specialty}
            </button>
          ))}
        </div>
      )}

      {hasSearch && (
        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap relative z-10">
          <p className="text-sm font-black text-slate-700">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full clinic-info text-cyan-800 border-cyan-200">
              النتائج: <span className="text-slate-900">{filteredAdsCount}</span>
            </span>
            {activeFiltersCount > 0 && (
              <span className="text-slate-500 font-bold mr-2"> من أصل {adsCount}</span>
            )}
          </p>
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="px-3 py-2 rounded-xl text-sm font-black bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
            >
              مسح الفلاتر
            </button>
          )}
        </div>
      )}
    </section>
  );
};
