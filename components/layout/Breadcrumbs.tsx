/**
 * Breadcrumbs — مكون عرض مسار التنقل.
 * يعرض للمستخدم موقعه الحالي في التطبيق بشكل هرمي قابل للضغط.
 * يدعم نسختين: desktop (شريط كامل) و mobile (مختصر داخل الهيدر).
 */

import React from 'react';
import { FaChevronLeft, FaHouse } from 'react-icons/fa6';
import type { BreadcrumbSegment } from '../app/utils/breadcrumbConfig';
import type { AppView } from '../app/utils/mainAppRouting';

interface BreadcrumbsProps {
  segments: BreadcrumbSegment[];
  onNavigateView: (view: AppView) => void;
  variant?: 'desktop' | 'mobile';
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  segments,
  onNavigateView,
  variant = 'desktop',
}) => {
  if (segments.length === 0) return null;

  const handleClick = (segment: BreadcrumbSegment) => {
    if (segment.view) {
      onNavigateView(segment.view);
    }
  };

  // ---- Mobile Variant ----
  if (variant === 'mobile') {
    // لو صفحة واحدة بس (الرئيسية) → عنوان عادي
    if (segments.length === 1) {
      return (
        <span className="font-black text-slate-800 text-lg truncate">
          {segments[0].label}
        </span>
      );
    }

    return (
      <nav className="flex items-center gap-1 min-w-0 max-w-full overflow-hidden" dir="rtl" aria-label="مسار التنقل">
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const isFirst = index === 0;
          const isClickable = !!segment.view;

          return (
            <React.Fragment key={index}>
              {index > 0 && (
                <FaChevronLeft className="w-2.5 h-2.5 text-slate-300 shrink-0" aria-hidden="true" />
              )}
              {isFirst && segment.view === 'home' ? (
                <button
                  onClick={() => handleClick(segment)}
                  className="shrink-0 w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-brand-100 transition-colors"
                  aria-label={segment.label}
                >
                  <FaHouse className="w-3.5 h-3.5 text-brand-600" aria-hidden="true" />
                </button>
              ) : (
                <button
                  onClick={() => isClickable && handleClick(segment)}
                  className={`text-sm truncate transition-colors ${
                    isLast
                      ? 'font-black text-slate-800'
                      : isClickable
                        ? 'font-bold text-brand-600 hover:text-brand-800'
                        : 'font-bold text-slate-500'
                  }`}
                  disabled={!isClickable}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {segment.label}
                </button>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    );
  }

  // ---- Desktop Variant ----
  // لو صفحة الرئيسية فقط → لا نعرض breadcrumbs
  if (segments.length <= 1) return null;

  return (
    <nav
      className="bg-white/80 backdrop-blur-sm border-b border-slate-100 px-4 sm:px-6 h-11 flex items-center no-print"
      dir="rtl"
      aria-label="مسار التنقل"
    >
      <ol className="flex items-center gap-1 min-w-0 text-sm">
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const isFirst = index === 0;
          const isClickable = !!segment.view;

          return (
            <li key={index} className="flex items-center gap-1 min-w-0">
              {index > 0 && (
                <FaChevronLeft className="w-2.5 h-2.5 text-slate-300 shrink-0 mx-0.5" aria-hidden="true" />
              )}

              {isFirst && segment.view === 'home' ? (
                <button
                  onClick={() => handleClick(segment)}
                  className="shrink-0 w-7 h-7 rounded-lg bg-slate-50 hover:bg-brand-50 flex items-center justify-center transition-colors group"
                  aria-label={segment.label}
                >
                  <FaHouse className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 transition-colors" aria-hidden="true" />
                </button>
              ) : isLast ? (
                <span className="font-bold text-slate-700 truncate" aria-current="page">
                  {segment.label}
                </span>
              ) : isClickable ? (
                <button
                  onClick={() => handleClick(segment)}
                  className="font-semibold text-brand-600 hover:text-brand-800 truncate transition-colors hover:underline underline-offset-2"
                >
                  {segment.label}
                </button>
              ) : (
                <span className="font-semibold text-slate-500 truncate">
                  {segment.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
