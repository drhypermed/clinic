// ─────────────────────────────────────────────────────────────────────────────
// Pagination — أزرار التنقل بين الصفحات (1, 2, 3, ..., →)
// ─────────────────────────────────────────────────────────────────────────────
// يدعم:
//   • أزرار صفحات مرئية (بنص محدود، بإختصارات "..." لما الصفحات كتيرة)
//   • أزرار "السابق" و"التالي"
//   • تعطيل تلقائي عند الحدود
//   • RTL friendly (ترتيب الأرقام صحيح في اللغة العربية)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa6';

interface PaginationProps {
  currentPage: number;        // رقم الصفحة الحالية (1-based)
  totalPages: number;         // إجمالي عدد الصفحات
  onPageChange: (page: number) => void;
  /** لتغيير حجم الصفحة (اختياري) — لو مفعّل بيظهر dropdown */
  pageSize?: number;
  pageSizeOptions?: readonly number[];
  onPageSizeChange?: (size: number) => void;
}

/**
 * يبني قائمة أرقام الصفحات للعرض مع "..." للاختصار.
 * أمثلة:
 *   1 صفحة:   [1]
 *   3 صفحات:  [1, 2, 3]
 *   10 صفحة (currentPage=5): [1, '...', 4, 5, 6, '...', 10]
 *   10 صفحة (currentPage=1): [1, 2, 3, '...', 10]
 */
const buildPageNumbers = (current: number, total: number): (number | '...')[] => {
  if (total <= 7) {
    // 7 صفحات أو أقل = عرض الكل بدون اختصار
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [1]; // دائماً نعرض الصفحة الأولى

  // نطاق الصفحات حول الـcurrent (current ± 1)
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  // "..." لو في فجوة بعد الصفحة الأولى
  if (start > 2) pages.push('...');

  // الصفحات الوسطى
  for (let i = start; i <= end; i++) pages.push(i);

  // "..." لو في فجوة قبل الصفحة الأخيرة
  if (end < total - 1) pages.push('...');

  pages.push(total); // دائماً نعرض الصفحة الأخيرة
  return pages;
};

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
}) => {
  // مفيش pagination لو صفحة واحدة فقط (أو لا يوجد بيانات)
  if (totalPages <= 1) {
    // ما زلنا نعرض pageSize selector لو موجود، حتى مع صفحة واحدة (لتغيير الحجم)
    if (!pageSize || !onPageSizeChange) return null;
  }

  const pageNumbers = buildPageNumbers(currentPage, totalPages);
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm">
      {/* عدد الصفحات الإجمالي + اختيار حجم الصفحة (لو مفعّل) */}
      <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-slate-500">
        <span>صفحة {currentPage.toLocaleString('ar-EG')} من {totalPages.toLocaleString('ar-EG')}</span>
        {pageSize && onPageSizeChange && pageSizeOptions && (
          <>
            <span className="text-slate-300">•</span>
            <label className="flex items-center gap-1.5">
              <span>اعرض:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-100"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
      </div>

      {/* أزرار التنقل (Previous / Numbers / Next) — مخفية لو صفحة واحدة */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* السابق (في RTL: السهم لليمين بصرياً) */}
          <button
            type="button"
            onClick={() => canGoPrev && onPageChange(currentPage - 1)}
            disabled={!canGoPrev}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="الصفحة السابقة"
          >
            <FaChevronRight className="w-3 h-3" />
          </button>

          {/* أرقام الصفحات */}
          {pageNumbers.map((page, idx) => {
            if (page === '...') {
              // فاصل بدون click
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="inline-flex h-8 w-8 items-center justify-center text-slate-400 text-xs"
                >
                  …
                </span>
              );
            }
            const isActive = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-xs font-black transition ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {page.toLocaleString('ar-EG')}
              </button>
            );
          })}

          {/* التالي (في RTL: السهم لليسار بصرياً) */}
          <button
            type="button"
            onClick={() => canGoNext && onPageChange(currentPage + 1)}
            disabled={!canGoNext}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="الصفحة التالية"
          >
            <FaChevronLeft className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
