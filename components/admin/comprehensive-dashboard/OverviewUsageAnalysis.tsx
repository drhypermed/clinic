// ─────────────────────────────────────────────────────────────────────────────
// تحليل استهلاك الباقات في نظرة الأدمن (OverviewUsageAnalysis)
// ─────────────────────────────────────────────────────────────────────────────
// قسم يعرض مقارنة استهلاك الحسابات المجانية مقابل المميزة عبر:
//   • جدول ديسكتوب: 3 صفوف × 4 أعمدة (نشاط، مجاني، مميز، إجمالي)
//   • بطاقات موبايل: كل نشاط في بطاقة مستقلة
//
// بيساعد الأدمن يعرف كم تكلف عليه الحسابات المجانية ومعدل استفادة المميزة.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { FaChartBar } from 'react-icons/fa6';
import type { DashboardStats } from './types';

interface OverviewUsageAnalysisProps {
  stats: DashboardStats;
}

export const OverviewUsageAnalysis: React.FC<OverviewUsageAnalysisProps> = ({ stats }) => {
  // 3 صفوف تعرض مقارنة مجاني مقابل مميز للأنشطة الرئيسية
  const usageRows = [
    {
      title: 'عدد الأطباء النشطين',
      free: stats.freeDocsCount,
      premium: stats.premiumDocsCount,
      total: stats.totalDoctors,
    },
    {
      title: 'استخدام الروشتة الذكية (AI)',
      free: stats.totalSmartRxFree,
      premium: stats.totalSmartRxPremium,
      total: stats.totalSmartRxFree + stats.totalSmartRxPremium,
    },
    {
      title: 'إجمالي الروشتات المطبوعة',
      free: stats.totalPrintsFree,
      premium: stats.totalPrintsPremium,
      total: stats.totalPrintsFree + stats.totalPrintsPremium,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 bg-slate-50/60">
        <div className="flex items-center gap-2">
          <FaChartBar className="w-3.5 h-3.5 text-indigo-600" />
          <h2 className="text-xs sm:text-sm font-black text-slate-800">تحليل استهلاك الباقات</h2>
        </div>
        <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] sm:text-[11px] font-bold text-sky-700">
          مجاني / مميز
        </span>
      </div>

      {/* ═══ عرض ديسكتوب: جدول ═══ */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-slate-50 text-xs font-bold tracking-wide text-slate-500">
              <th className="px-4 py-3">النشاط</th>
              <th className="px-4 py-3">الحسابات المجانية</th>
              <th className="px-4 py-3">الحسابات المميزة</th>
              <th className="px-4 py-3">الإجمالي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {usageRows.map((row) => (
              <tr key={row.title} className="hover:bg-sky-50/50">
                <td className="px-4 py-3 font-bold text-slate-700">{row.title}</td>
                <td className="px-4 py-3 font-black font-numeric text-slate-800">
                  {row.free.toLocaleString('ar-EG')}
                </td>
                <td className="px-4 py-3 font-black font-numeric text-amber-700">
                  {row.premium.toLocaleString('ar-EG')}
                </td>
                <td className="px-4 py-3 font-black font-numeric text-sky-700">
                  {row.total.toLocaleString('ar-EG')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ═══ عرض موبايل: بطاقات ═══ */}
      <div className="grid gap-3 p-3 sm:p-4 md:hidden">
        {usageRows.map((row) => (
          <article key={row.title} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
            <h4 className="text-xs sm:text-sm font-black text-slate-800 mb-2">{row.title}</h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-white px-2 py-2 border border-slate-100">
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400">مجاني</p>
                <p className="mt-1 font-black font-numeric text-slate-800">{row.free.toLocaleString('ar-EG')}</p>
              </div>
              <div className="rounded-lg bg-amber-50/60 px-2 py-2 border border-amber-100/60">
                <p className="text-[9px] sm:text-[10px] font-bold text-amber-600">مميز</p>
                <p className="mt-1 font-black font-numeric text-amber-700">{row.premium.toLocaleString('ar-EG')}</p>
              </div>
              <div className="rounded-lg bg-sky-50/60 px-2 py-2 border border-sky-100/60">
                <p className="text-[9px] sm:text-[10px] font-bold text-sky-600">الإجمالي</p>
                <p className="mt-1 font-black font-numeric text-sky-700">{row.total.toLocaleString('ar-EG')}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="border-t border-slate-100 bg-slate-50/40 px-4 py-2.5 text-center text-[10px] sm:text-[11px] font-bold text-slate-400">
        تساعدك هذه القراءة على متابعة تكلفة الحسابات المجانية ومعدل استفادة الحسابات المميزة.
      </div>
    </div>
  );
};
