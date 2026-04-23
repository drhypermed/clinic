// ─────────────────────────────────────────────────────────────────────────────
// تحليل استهلاك الباقات في نظرة الأدمن (OverviewUsageAnalysis)
// ─────────────────────────────────────────────────────────────────────────────
// قسم يعرض مقارنة 3 فئات (مجاني / برو / برو ماكس) عبر:
//   • جدول ديسكتوب: 3 صفوف × 5 أعمدة (نشاط، مجاني، برو، برو ماكس، إجمالي)
//   • بطاقات موبايل: كل نشاط في بطاقة مستقلة مع 4 خانات
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { FaChartBar } from 'react-icons/fa6';
import type { DashboardStats } from './types';

interface OverviewUsageAnalysisProps {
  stats: DashboardStats;
}

export const OverviewUsageAnalysis: React.FC<OverviewUsageAnalysisProps> = ({ stats }) => {
  // 3 صفوف × 4 أعمدة: نشاط / مجاني / برو / برو ماكس — الإجمالي محسوب
  const usageRows = [
    {
      title: 'عدد الأطباء النشطين',
      free: stats.freeDocsCount,
      premium: stats.premiumDocsCount,
      proMax: stats.proMaxDocsCount || 0,
    },
    {
      title: 'استخدام الروشتة الذكية (AI)',
      free: stats.totalSmartRxFree,
      premium: stats.totalSmartRxPro,
      proMax: stats.totalSmartRxProMax || 0,
    },
    {
      title: 'إجمالي الروشتات المطبوعة',
      free: stats.totalPrintsFree,
      premium: stats.totalPrintsPro,
      proMax: stats.totalPrintsProMax || 0,
    },
  ].map((row) => ({ ...row, total: row.free + row.premium + row.proMax }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 bg-slate-50/60">
        <div className="flex items-center gap-2">
          <FaChartBar className="w-3.5 h-3.5 text-indigo-600" />
          <h2 className="text-xs sm:text-sm font-black text-slate-800">تحليل استهلاك الباقات</h2>
        </div>
        <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] sm:text-[11px] font-bold text-sky-700">
          مجاني / برو / برو ماكس
        </span>
      </div>

      {/* ═══ عرض ديسكتوب: جدول 5 أعمدة ═══ */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-slate-50 text-xs font-bold tracking-wide text-slate-500">
              <th className="px-4 py-3">النشاط</th>
              <th className="px-4 py-3">المجاني</th>
              <th className="px-4 py-3">برو</th>
              <th className="px-4 py-3">برو ماكس</th>
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
                <td className="px-4 py-3 font-black font-numeric text-[#B45309]">
                  {row.proMax.toLocaleString('ar-EG')}
                </td>
                <td className="px-4 py-3 font-black font-numeric text-sky-700">
                  {row.total.toLocaleString('ar-EG')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ═══ عرض موبايل: بطاقات (4 خانات: مجاني/برو/برو ماكس/إجمالي) ═══ */}
      <div className="grid gap-3 p-3 sm:p-4 md:hidden">
        {usageRows.map((row) => (
          <article key={row.title} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
            <h4 className="text-xs sm:text-sm font-black text-slate-800 mb-2">{row.title}</h4>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="rounded-lg bg-white px-1.5 py-2 border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400">مجاني</p>
                <p className="mt-1 font-black font-numeric text-slate-800">{row.free.toLocaleString('ar-EG')}</p>
              </div>
              <div className="rounded-lg bg-amber-50/60 px-1.5 py-2 border border-amber-100/60">
                <p className="text-[9px] font-bold text-amber-600">برو</p>
                <p className="mt-1 font-black font-numeric text-amber-700">{row.premium.toLocaleString('ar-EG')}</p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-[#FFFDE7] to-[#FFF8E1] px-1.5 py-2 border border-[#FFE082]">
                <p className="text-[9px] font-bold text-[#B45309]">برو ماكس</p>
                <p className="mt-1 font-black font-numeric text-[#B45309]">{row.proMax.toLocaleString('ar-EG')}</p>
              </div>
              <div className="rounded-lg bg-sky-50/60 px-1.5 py-2 border border-sky-100/60">
                <p className="text-[9px] font-bold text-sky-600">الإجمالي</p>
                <p className="mt-1 font-black font-numeric text-sky-700">{row.total.toLocaleString('ar-EG')}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="border-t border-slate-100 bg-slate-50/40 px-4 py-2.5 text-center text-[10px] sm:text-[11px] font-bold text-slate-400">
        تساعدك هذه القراءة على متابعة تكلفة الحسابات المجانية ومعدل استفادة الحسابات المدفوعة (برو + برو ماكس).
      </div>
    </div>
  );
};
