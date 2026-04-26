// ─────────────────────────────────────────────────────────────────────────────
// تحليل استهلاك الباقات في نظرة الأدمن (OverviewUsageAnalysis)
// ─────────────────────────────────────────────────────────────────────────────
// جدول موحد يعرض كل أنشطة المنصة في مكان واحد (إجمالي طوال العمر):
//   • صفوف عامة: عدد الأطباء النشطين + إجمالي الروشتات المطبوعة
//   • فاصل بصري ثم 6 ميزات ذكاء اصطناعي:
//     تحليل الحالة، الترجمة، فحص التداخلات، أمان الحمل/الرضاعة،
//     جرعات الكلى، طباعة تقرير طبي.
//   • صف إجمالي كلي للـAI في النهاية.
//
// كل الأرقام cumulative lifetime من بداية الإطلاق — مفيش filter زمني
// (مقصود للتوفير في تكلفة Firestore writes).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { FaChartBar } from 'react-icons/fa6';
import type { DashboardStats } from './types';

interface OverviewUsageAnalysisProps {
  stats: DashboardStats;
}

type RowKind = 'general' | 'ai' | 'aiTotal' | 'separator';

interface UsageRow {
  kind: RowKind;
  title: string;
  emoji?: string;
  free: number;
  premium: number;
  proMax: number;
  total: number;
}

const fmtNum = (value: number): string => value.toLocaleString('ar-EG');

export const OverviewUsageAnalysis: React.FC<OverviewUsageAnalysisProps> = ({ stats }) => {
  const buildRow = (
    kind: RowKind,
    title: string,
    free: number,
    premium: number,
    proMax: number,
    emoji?: string,
  ): UsageRow => ({
    kind,
    title,
    emoji,
    free,
    premium,
    proMax,
    total: free + premium + proMax,
  });

  // 6 ميزات الـAI (cumulative lifetime من stats)
  const aiFeatureRows: UsageRow[] = [
    buildRow('ai', 'تحليل الحالة',                    stats.caseAnalysisFreeCount,    stats.caseAnalysisProCount,    stats.caseAnalysisProMaxCount,    '🩺'),
    buildRow('ai', 'الترجمة الذكية للروشتة',           stats.translationFreeCount,     stats.translationProCount,     stats.translationProMaxCount,     '🌐'),
    buildRow('ai', 'فحص التداخلات الدوائية',           stats.drugInteractionsFreeCount, stats.drugInteractionsProCount, stats.drugInteractionsProMaxCount, '💊'),
    buildRow('ai', 'أمان الحمل والرضاعة',              stats.pregnancySafetyFreeCount, stats.pregnancySafetyProCount, stats.pregnancySafetyProMaxCount, '🤰'),
    buildRow('ai', 'تعديل جرعات الكلى',                stats.renalDoseFreeCount,        stats.renalDoseProCount,        stats.renalDoseProMaxCount,        '🧪'),
    buildRow('ai', 'طباعة تقرير طبي',                   stats.medicalReportFreeCount,    stats.medicalReportProCount,    stats.medicalReportProMaxCount,    '📄'),
  ];

  const aiTotalRow: UsageRow = buildRow(
    'aiTotal',
    'الإجمالي الكلي لميزات الـAI',
    aiFeatureRows.reduce((s, r) => s + r.free, 0),
    aiFeatureRows.reduce((s, r) => s + r.premium, 0),
    aiFeatureRows.reduce((s, r) => s + r.proMax, 0),
    '📊',
  );

  // الترتيب النهائي: عام → فاصل → ميزات AI → إجمالي AI
  const allRows: UsageRow[] = [
    buildRow('general', 'عدد الأطباء النشطين',     stats.freeDocsCount,    stats.premiumDocsCount,  stats.proMaxDocsCount || 0),
    buildRow('general', 'إجمالي الروشتات المطبوعة', stats.totalPrintsFree,  stats.totalPrintsPro,    stats.totalPrintsProMax || 0),
    { kind: 'separator', title: '🤖 ميزات الذكاء الاصطناعي', free: 0, premium: 0, proMax: 0, total: 0 },
    ...aiFeatureRows,
    aiTotalRow,
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 bg-slate-50/60">
        <div className="flex items-center gap-2">
          <FaChartBar className="w-3.5 h-3.5 text-brand-600" />
          <h2 className="text-xs sm:text-sm font-black text-slate-800">تحليل استهلاك الباقات</h2>
        </div>
        <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-[10px] sm:text-[11px] font-bold text-brand-700">
          مجاني / برو / برو ماكس
        </span>
      </div>

      {/* ═══ عرض ديسكتوب: جدول واحد موحد ═══ */}
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
            {allRows.map((row, idx) => {
              if (row.kind === 'separator') {
                return (
                  <tr key={`sep-${idx}`} className="bg-gradient-to-l from-brand-50/50 to-slate-50/30">
                    <td colSpan={5} className="px-4 py-2 text-xs font-black text-brand-700 border-r-4 border-brand-400">
                      {row.title}
                    </td>
                  </tr>
                );
              }
              if (row.kind === 'aiTotal') {
                return (
                  <tr key={`total-${idx}`} className="bg-slate-100/70 font-black">
                    <td className="px-4 py-3 text-slate-800">
                      {row.emoji && <span className="ml-1.5">{row.emoji}</span>}{row.title}
                    </td>
                    <td className="px-4 py-3 font-numeric text-slate-800">{fmtNum(row.free)}</td>
                    <td className="px-4 py-3 font-numeric text-warning-700">{fmtNum(row.premium)}</td>
                    <td className="px-4 py-3 font-numeric text-[#B45309]">{fmtNum(row.proMax)}</td>
                    <td className="px-4 py-3 font-numeric text-brand-700">{fmtNum(row.total)}</td>
                  </tr>
                );
              }
              return (
                <tr key={`${row.kind}-${idx}`} className="hover:bg-brand-50/30">
                  <td className="px-4 py-3 font-bold text-slate-700">
                    {row.emoji && <span className="ml-1.5">{row.emoji}</span>}{row.title}
                  </td>
                  <td className="px-4 py-3 font-black font-numeric text-slate-800">{fmtNum(row.free)}</td>
                  <td className="px-4 py-3 font-black font-numeric text-warning-700">{fmtNum(row.premium)}</td>
                  <td className="px-4 py-3 font-black font-numeric text-[#B45309]">{fmtNum(row.proMax)}</td>
                  <td className="px-4 py-3 font-black font-numeric text-brand-700">{fmtNum(row.total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ═══ عرض موبايل: بطاقات ═══ */}
      <div className="grid gap-3 p-3 sm:p-4 md:hidden">
        {allRows.map((row, idx) => {
          if (row.kind === 'separator') {
            return (
              <div
                key={`sep-${idx}`}
                className="rounded-xl bg-gradient-to-l from-brand-50/60 to-slate-50/30 border-r-4 border-brand-400 px-3 py-2 text-xs font-black text-brand-700"
              >
                {row.title}
              </div>
            );
          }
          const isTotal = row.kind === 'aiTotal';
          const cardBg = isTotal
            ? 'border-slate-300 bg-slate-100/70'
            : 'border-slate-100 bg-slate-50/50';
          return (
            <article key={`${row.kind}-${idx}`} className={`rounded-xl border ${cardBg} p-3`}>
              <h4 className="text-xs sm:text-sm font-black text-slate-800 mb-2">
                {row.emoji && <span className="ml-1.5">{row.emoji}</span>}{row.title}
              </h4>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="rounded-lg bg-white px-1.5 py-2 border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400">مجاني</p>
                  <p className="mt-1 font-black font-numeric text-slate-800">{fmtNum(row.free)}</p>
                </div>
                <div className="rounded-lg bg-warning-50/60 px-1.5 py-2 border border-warning-100/60">
                  <p className="text-[9px] font-bold text-warning-600">برو</p>
                  <p className="mt-1 font-black font-numeric text-warning-700">{fmtNum(row.premium)}</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-[#FFFDE7] to-[#FFF8E1] px-1.5 py-2 border border-[#FFE082]">
                  <p className="text-[9px] font-bold text-[#B45309]">برو ماكس</p>
                  <p className="mt-1 font-black font-numeric text-[#B45309]">{fmtNum(row.proMax)}</p>
                </div>
                <div className="rounded-lg bg-brand-50/60 px-1.5 py-2 border border-brand-100/60">
                  <p className="text-[9px] font-bold text-brand-600">الإجمالي</p>
                  <p className="mt-1 font-black font-numeric text-brand-700">{fmtNum(row.total)}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="border-t border-slate-100 bg-slate-50/40 px-4 py-2.5 text-center text-[10px] sm:text-[11px] font-bold text-slate-400">
        كل الأرقام إجمالي طوال العمر من بداية الإطلاق — مفصول حسب نوع الباقة (مجاني/برو/برو ماكس).
      </div>
    </div>
  );
};
