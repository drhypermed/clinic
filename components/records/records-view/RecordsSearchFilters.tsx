/**
 * RecordsSearchFilters:
 * صندوق البحث + فلاتر الترتيب/التاريخ + اقتراحات autocomplete.
 * مكوّن عرض خالص — كل الحالة تُمرَّر عبر props.
 */
import React from 'react';
import { highlight } from '../recordsViewParts';
import type { TimelineDateFilterMode, TimelineSortOrder } from './helpers';
import type { SearchSuggestion } from './useRecordsSearch';

interface Props {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  suggestions: SearchSuggestion[];
  showSuggestions: boolean;
  setShowSuggestions: (v: boolean) => void;
  activeSuggestionIndex: number;
  setActiveSuggestionIndex: React.Dispatch<React.SetStateAction<number>>;

  timelineSortOrder: TimelineSortOrder;
  setTimelineSortOrder: (v: TimelineSortOrder) => void;
  dateFilterMode: TimelineDateFilterMode;
  setDateFilterMode: (v: TimelineDateFilterMode) => void;

  singleDayFilterDate: string;
  setSingleDayFilterDate: (v: string) => void;
  rangeStartDate: string;
  setRangeStartDate: (v: string) => void;
  rangeEndDate: string;
  setRangeEndDate: (v: string) => void;

  onResetFilters: () => void;
}

export const RecordsSearchFilters: React.FC<Props> = ({
  searchTerm,
  setSearchTerm,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  activeSuggestionIndex,
  setActiveSuggestionIndex,
  timelineSortOrder,
  setTimelineSortOrder,
  dateFilterMode,
  setDateFilterMode,
  singleDayFilterDate,
  setSingleDayFilterDate,
  rangeStartDate,
  setRangeStartDate,
  rangeEndDate,
  setRangeEndDate,
  onResetFilters,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm p-3 space-y-2.5 dh-stagger-3">
      {/* صندوق البحث مع لوحة الاقتراحات */}
      <div className="relative">
        <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
          <svg
            className="w-4 h-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
            setActiveSuggestionIndex(-1);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActiveSuggestionIndex((p) => Math.min(p + 1, suggestions.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActiveSuggestionIndex((p) => Math.max(p - 1, -1));
            } else if (
              e.key === 'Enter' &&
              activeSuggestionIndex >= 0 &&
              suggestions[activeSuggestionIndex]
            ) {
              e.preventDefault();
              setSearchTerm(suggestions[activeSuggestionIndex].value);
              setShowSuggestions(false);
              setActiveSuggestionIndex(-1);
            }
          }}
          placeholder="ابحث بالاسم أو الهاتف أو رقم الملف أو التشخيص أو الأدوية..."
          className="w-full bg-white border border-slate-200 rounded-xl pr-10 pl-4 py-3 font-medium text-slate-800 placeholder-slate-400 text-sm focus:ring-2 focus:ring-brand-100 focus:border-brand-400 outline-none transition-all"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setSearchTerm(s.value);
                  setShowSuggestions(false);
                }}
                className={`w-full text-right px-4 py-2.5 text-sm font-medium hover:bg-slate-50 border-b border-slate-50 last:border-0 flex items-center gap-2 ${
                  activeSuggestionIndex === i ? 'bg-brand-50 text-brand-700' : 'text-slate-700'
                }`}
              >
                {s.isFileNumber ? (
                  <>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-bold shrink-0">
                      ملف #
                    </span>
                    <span>{highlight(s.value, searchTerm)}</span>
                  </>
                ) : (
                  highlight(s.value, searchTerm)
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* فلاتر الترتيب والتاريخ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">ترتيب السجلات</label>
          <select
            value={timelineSortOrder}
            onChange={(e) => setTimelineSortOrder(e.target.value as TimelineSortOrder)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 focus:border-brand-400 focus:ring-2 focus:ring-brand-50 outline-none"
          >
            <option value="newestToOldest">من الأحدث إلى الأقدم</option>
            <option value="oldestToNewest">من الأقدم إلى الأحدث</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">فلتر التاريخ</label>
          <select
            value={dateFilterMode}
            onChange={(e) => setDateFilterMode(e.target.value as TimelineDateFilterMode)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 focus:border-brand-400 focus:ring-2 focus:ring-brand-50 outline-none"
          >
            <option value="all">كل التواريخ</option>
            <option value="singleDay">يوم محدد</option>
            <option value="dateRange">فترة من - إلى</option>
          </select>
        </div>

        {dateFilterMode === 'singleDay' && (
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">اختر اليوم</label>
            <input
              type="date"
              value={singleDayFilterDate}
              onChange={(e) => setSingleDayFilterDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 focus:border-brand-400 focus:ring-2 focus:ring-brand-50 outline-none"
            />
          </div>
        )}

        {dateFilterMode === 'dateRange' && (
          <>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">من تاريخ</label>
              <input
                type="date"
                value={rangeStartDate}
                onChange={(e) => setRangeStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 focus:border-brand-400 focus:ring-2 focus:ring-brand-50 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">إلى تاريخ</label>
              <input
                type="date"
                value={rangeEndDate}
                onChange={(e) => setRangeEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 focus:border-brand-400 focus:ring-2 focus:ring-brand-50 outline-none"
              />
            </div>
          </>
        )}

        <div className="sm:col-span-2 lg:col-span-4 flex justify-end pt-0.5">
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            إعادة ضبط
          </button>
        </div>
      </div>
    </div>
  );
};
