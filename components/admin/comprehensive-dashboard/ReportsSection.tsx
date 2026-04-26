/**
 * ReportsSection — تقارير إدارية مع رسوم بيانية وتصدير CSV.
 *
 * يعرض:
 *   1. إجمالي الأطباء الجدد شهرياً (آخر 12 شهر) — رسم بياني خطي
 *   2. توزيع الأطباء حسب نوع الحساب (Free/Pro/ProMax) — رسم دائري
 *   3. أعلى 10 أطباء نشاطاً (حسب usage counters) — جدول
 *   4. زر تصدير CSV لكل جدول
 *
 * ─ مصدر البيانات (2026-04): الـsummary doc اللي بيحدّثه الـCloud Function كل 6 ساعات
 *   (refreshAdminDashboardAggregates) + عند ضغط "تحديث الآن". قبل كده كان ReportsSection
 *   بيقرا كل وثائق الأطباء من Firestore كل فتحة (مكلف جداً عند آلاف الأطباء).
 *   النتيجة: قراءة 1 read بدل آلاف لكل فتحة.
 */

import React, { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import { DashboardStats } from './types';

interface ReportsSectionProps {
  stats: DashboardStats;
}

interface MonthlyCountChart {
  month: string;
  monthLabel: string;
  newDoctors: number;
}

const CHART_COLORS = ['#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const ARABIC_MONTH_NAMES = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

const monthKeyToLabel = (key: string): string => {
  const [year, month] = key.split('-');
  const m = Number(month) - 1;
  if (m < 0 || m > 11) return key;
  return `${ARABIC_MONTH_NAMES[m]} ${year}`;
};

/**
 * تحويل مصفوفة كائنات إلى CSV وتحميلها كملف.
 * يدعم النصوص العربية عبر BOM (UTF-8).
 */
const downloadCsv = (rows: Record<string, unknown>[], filename: string): void => {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (value: unknown): string => {
    const text = String(value ?? '');
    if (text.includes(',') || text.includes('"') || text.includes('\n')) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };
  const csvBody = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(',')),
  ].join('\n');
  const bom = '\uFEFF'; // Excel يحتاج BOM لفهم UTF-8
  const blob = new Blob([bom + csvBody], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const ReportsSection: React.FC<ReportsSectionProps> = ({ stats }) => {
  // ─ القراءة من stats prop مباشرة — السيرفر بيعمل الـaggregation مرة كل 6 ساعات
  //   (أو فوراً عند ضغط "تحديث الآن") ويخزن النتائج في settings/adminDashboardStats.
  //   ReportsSection ما بيعملش أي قراءة من Firestore بنفسه — توفير ضخم في الـreads.
  const monthlySignups: MonthlyCountChart[] = useMemo(
    () => (stats.monthlySignups || []).map((item) => ({
      month: item.month,
      monthLabel: monthKeyToLabel(item.month),
      newDoctors: item.newDoctors,
    })),
    [stats.monthlySignups],
  );
  const specialtyBreakdown = stats.specialtyBreakdown || [];
  const topDoctors = stats.topDoctorsByActivity || [];

  // ─ لو الـsummary قديم (statsVersion 1) من قبل ما نضيف الـreports aggregates،
  //   هنعرض رسالة بدل الرسومات الفاضية ونوجّه الأدمن لزر "تحديث الآن".
  const hasReportsData =
    stats.monthlySignups !== undefined ||
    stats.specialtyBreakdown !== undefined ||
    stats.topDoctorsByActivity !== undefined;

  const summaryNumbers = useMemo(
    () => [
      { label: 'إجمالي الأطباء', value: stats.totalDoctors, color: 'text-brand-700' },
      { label: 'مقبولون', value: stats.approvedDoctors, color: 'text-success-700' },
      // برو لوحده + برو ماكس لوحده — بطاقات منفصلة
      { label: 'برو', value: stats.premiumDocsCount || 0, color: 'text-warning-700' },
      { label: 'برو ماكس', value: stats.proMaxDocsCount || 0, color: 'text-[#B45309]' },
    ],
    [stats],
  );

  // الـ pie chart — 3 شرائح: مجاني / برو / برو ماكس
  const accountTypeData = useMemo(
    () => [
      { name: 'مجاني', value: stats.freeDocsCount || 0 },
      { name: 'برو', value: stats.premiumDocsCount || 0 },
      { name: 'برو ماكس', value: stats.proMaxDocsCount || 0 },
    ],
    [stats],
  );

  return (
    <div className="space-y-4 sm:space-y-5" dir="rtl">
      {/* الملخص الرقمي */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryNumbers.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold text-slate-500">{item.label}</p>
            <p className={`mt-1 text-2xl font-black ${item.color}`}>{item.value.toLocaleString('ar-EG')}</p>
          </div>
        ))}
      </div>

      {/* تنبيه لو الـsummary قديم (مفيش reports aggregates) — يطلب من الأدمن تحديث */}
      {!hasReportsData && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
          ⚠️ التقارير التفصيلية لسه ما اتجهزتش بعد. اضغط "تحديث الآن" من الشريط الجانبي عشان يحسبها السيرفر.
        </div>
      )}

      {/* الأطباء الجدد شهرياً */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-800">الأطباء الجدد شهرياً (آخر 12 شهر)</h3>
            <p className="text-[11px] text-slate-400">عدد التسجيلات حسب شهر الإنشاء</p>
          </div>
          <button
            onClick={() => downloadCsv(monthlySignups.map((m) => ({
              'الشهر': m.monthLabel, 'أطباء جدد': m.newDoctors,
            })), 'monthly-signups.csv')}
            disabled={monthlySignups.length === 0}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
          >
            📥 CSV
          </button>
        </div>
        <div className="h-64" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlySignups}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ fontSize: '12px', direction: 'rtl' }}
                labelFormatter={(label) => `الشهر: ${label}`}
                formatter={(value: number) => [`${value.toLocaleString('ar-EG')} طبيب`, 'عدد الجدد']}
              />
              <Line
                type="monotone"
                dataKey="newDoctors"
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={{ fill: '#06b6d4', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* أنواع الحسابات */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-800">توزيع أنواع الحسابات</h3>
              <p className="text-[11px] text-slate-400">مجاني مقابل مميز</p>
            </div>
            <button
              onClick={() => downloadCsv(accountTypeData.map((d) => ({
                'النوع': d.name, 'العدد': d.value,
              })), 'account-types.csv')}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              📥 CSV
            </button>
          </div>
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={accountTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: { name?: string; value?: number }) =>
                    `${entry.name || ''}: ${(entry.value ?? 0).toLocaleString('ar-EG')}`
                  }
                  outerRadius={80}
                  dataKey="value"
                >
                  {/* ألوان مخصصة: مجاني=أزرق، برو=ذهبي، برو ماكس=ذهبي لامع */}
                  {accountTypeData.map((entry, i) => {
                    const color = entry.name === 'برو ماكس' ? '#FFB300'
                      : entry.name === 'برو' ? '#F59E0B'
                      : entry.name === 'مجاني' ? '#06B6D4'
                      : CHART_COLORS[i % CHART_COLORS.length];
                    return <Cell key={i} fill={color} />;
                  })}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '12px', direction: 'rtl' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* التخصصات */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-800">التخصصات الأكثر انتشاراً</h3>
              <p className="text-[11px] text-slate-400">أعلى 8 تخصصات</p>
            </div>
            <button
              onClick={() => downloadCsv(specialtyBreakdown.map((s) => ({
                'التخصص': s.specialty, 'العدد': s.count,
              })), 'specialties.csv')}
              disabled={specialtyBreakdown.length === 0}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
            >
              📥 CSV
            </button>
          </div>
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={specialtyBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis dataKey="specialty" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip contentStyle={{ fontSize: '12px', direction: 'rtl' }} />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* أعلى 10 أطباء نشاطاً */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-800">أعلى 10 أطباء نشاطاً</h3>
            <p className="text-[11px] text-slate-400">حسب إجمالي الإجراءات (روشتات + تقارير + طباعة + بحث)</p>
          </div>
          <button
            onClick={() => downloadCsv(topDoctors.map((d) => ({
              'الاسم': d.name, 'البريد': d.email, 'إجمالي الإجراءات': d.totalActions,
            })), 'top-doctors.csv')}
            disabled={topDoctors.length === 0}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
          >
            📥 CSV
          </button>
        </div>
        {topDoctors.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">لا توجد بيانات استخدام بعد.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th className="px-3 py-2 font-bold text-slate-700">#</th>
                  <th className="px-3 py-2 font-bold text-slate-700">الاسم</th>
                  <th className="px-3 py-2 font-bold text-slate-700">البريد</th>
                  <th className="px-3 py-2 font-bold text-slate-700">إجمالي الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {topDoctors.map((doc, idx) => (
                  <tr key={doc.email || doc.name} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2 font-bold text-slate-500">{(idx + 1).toLocaleString('ar-EG')}</td>
                    <td className="px-3 py-2 font-semibold text-slate-800">{doc.name}</td>
                    <td className="px-3 py-2 text-xs text-slate-500 font-mono" dir="ltr">{doc.email}</td>
                    <td className="px-3 py-2 font-black text-brand-700">{doc.totalActions.toLocaleString('ar-EG')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
