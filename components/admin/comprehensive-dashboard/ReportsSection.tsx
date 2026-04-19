/**
 * ReportsSection — تقارير إدارية مع رسوم بيانية وتصدير CSV.
 *
 * يعرض:
 *   1. إجمالي الأطباء الجدد شهرياً (آخر 12 شهر) — رسم بياني خطي
 *   2. توزيع الأطباء حسب نوع الحساب (Free/Premium) — رسم دائري
 *   3. أعلى 10 أطباء نشاطاً (حسب usage counters) — رسم أعمدة
 *   4. زر تصدير CSV لكل جدول
 *
 * البيانات تُقرأ من users/* مع client-side aggregation (مناسب للأعداد الحالية).
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
} from 'recharts';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { getDoctorUsersQuery } from '../../../services/firestore/profileRoles';
import { LoadingText } from '../../ui/LoadingText';
import { DashboardStats } from './types';

interface ReportsSectionProps {
  stats: DashboardStats;
}

interface MonthlyCount {
  month: string;      // YYYY-MM
  monthLabel: string; // عربي للعرض
  newDoctors: number;
}

interface SpecialtyCount {
  specialty: string;
  count: number;
}

interface TopDoctor {
  name: string;
  email: string;
  totalActions: number;
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

const sumUsage = (stats: Record<string, unknown> | undefined | null): number => {
  if (!stats || typeof stats !== 'object') return 0;
  let total = 0;
  for (const value of Object.values(stats)) {
    const n = Number(value);
    if (Number.isFinite(n)) total += n;
  }
  return total;
};

export const ReportsSection: React.FC<ReportsSectionProps> = ({ stats }) => {
  const [loading, setLoading] = useState(true);
  const [monthlySignups, setMonthlySignups] = useState<MonthlyCount[]>([]);
  const [specialtyBreakdown, setSpecialtyBreakdown] = useState<SpecialtyCount[]>([]);
  const [topDoctors, setTopDoctors] = useState<TopDoctor[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const snap = await getDocs(getDoctorUsersQuery());
        if (cancelled) return;

        // آخر 12 شهر
        const monthCounts = new Map<string, number>();
        const today = new Date();
        for (let i = 11; i >= 0; i--) {
          const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          monthCounts.set(key, 0);
        }

        const specialtyMap = new Map<string, number>();
        const doctorsForTop: TopDoctor[] = [];

        snap.docs.forEach((docSnap) => {
          const data = docSnap.data() as Record<string, any>;
          const createdAt = String(data.createdAt || '');
          if (createdAt) {
            const key = createdAt.slice(0, 7); // YYYY-MM
            if (monthCounts.has(key)) {
              monthCounts.set(key, (monthCounts.get(key) || 0) + 1);
            }
          }

          const specialty = String(data.doctorSpecialty || '').trim() || 'بدون تخصص';
          specialtyMap.set(specialty, (specialtyMap.get(specialty) || 0) + 1);

          const totalActions = sumUsage(data.usageStats);
          if (totalActions > 0) {
            doctorsForTop.push({
              name: String(data.doctorName || data.displayName || 'طبيب'),
              email: String(data.doctorEmail || data.email || ''),
              totalActions,
            });
          }
        });

        if (cancelled) return;

        setMonthlySignups(
          Array.from(monthCounts.entries()).map(([month, newDoctors]) => ({
            month,
            monthLabel: monthKeyToLabel(month),
            newDoctors,
          })),
        );

        setSpecialtyBreakdown(
          Array.from(specialtyMap.entries())
            .map(([specialty, count]) => ({ specialty, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8),
        );

        setTopDoctors(
          doctorsForTop.sort((a, b) => b.totalActions - a.totalActions).slice(0, 10),
        );
      } catch (err) {
        console.warn('[ReportsSection] Load error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, []);

  const summaryNumbers = useMemo(
    () => [
      { label: 'إجمالي الأطباء', value: stats.totalDoctors, color: 'text-cyan-700' },
      { label: 'مقبولون', value: stats.approvedDoctors, color: 'text-emerald-700' },
      { label: 'مرفوضون', value: stats.rejectedDoctors, color: 'text-rose-700' },
      { label: 'مميزون', value: stats.activeSubscriptions, color: 'text-amber-700' },
    ],
    [stats],
  );

  const accountTypeData = useMemo(
    () => [
      { name: 'مجاني', value: stats.freeDocsCount || 0 },
      { name: 'مميز', value: stats.premiumDocsCount || 0 },
    ],
    [stats],
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500">
        <LoadingText>جاري تحميل التقارير</LoadingText>
      </div>
    );
  }

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
                  {accountTypeData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
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
                    <td className="px-3 py-2 font-black text-cyan-700">{doc.totalActions.toLocaleString('ar-EG')}</td>
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
