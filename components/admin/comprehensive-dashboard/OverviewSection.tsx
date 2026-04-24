// ─────────────────────────────────────────────────────────────────────────────
// النظرة الشاملة لوحة الأدمن (OverviewSection)
// ─────────────────────────────────────────────────────────────────────────────
// الشاشة الرئيسية التي يراها الأدمن أول ما يدخل لوحة التحكم.
// بعد التقسيم، الملف ده بقى مركز تنسيق (composition) بس:
//   1) OverviewWelcomeHeader: الترحيب + الساعة الحية + زر التحديث
//   2) تنبيه معدل الرفض المرتفع (inline)
//   3) شريط تنبيه الأطباء المعلقين (inline)
//   4) 4 بطاقات KPI رئيسية (StatCard × 4)
//   5) بطاقة حالة الأطباء + الملخص المالي (DetailRow × 6)
//   6) OverviewUsageAnalysis: تحليل استهلاك الباقات (جدول + بطاقات)
//   7) اختصارات سريعة (QuickAction × 4)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  FaStethoscope, FaStethoscope as _FaStethoscope, FaUsers, FaCrown,
  FaCircleCheck, FaHourglassHalf, FaCircleXmark,
  FaBan, FaCoins, FaMoneyBillWave, FaChartLine,
  FaTriangleExclamation, FaArrowLeft,
  FaShieldHalved, FaGear,
} from 'react-icons/fa6';
import { AdminView, DashboardStats } from './types';
import { StatCard } from './StatCard';
import { DetailRow } from './DetailRow';
import { QuickAction } from './QuickAction';
import { OverviewWelcomeHeader } from './OverviewWelcomeHeader';
import { OverviewUsageAnalysis } from './OverviewUsageAnalysis';

interface OverviewSectionProps {
  stats: DashboardStats;
  pendingDoctorsCount: number;
  onNavigate: (view: AdminView) => void;
  onRefresh?: () => void | Promise<void>;
  refreshing?: boolean;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  stats,
  pendingDoctorsCount,
  onNavigate,
  onRefresh,
  refreshing = false,
}) => {
  // ── قيم مستنتجة للتنبيهات ──
  const approvalRate =
    stats.totalDoctors > 0 ? Math.round((stats.approvedDoctors / stats.totalDoctors) * 100) : 0;

  // نسبة رفض الأطباء — تنبيه مبكر للأدمن لو معدل الرفض مرتفع بشكل غير عادي.
  // نعرض التحذير فقط لو عدد الأطباء ≥ 10 عشان نتفادى الإنذارات الكاذبة في البداية.
  const rejectionRate =
    stats.totalDoctors > 0 ? (stats.rejectedDoctors / stats.totalDoctors) * 100 : 0;
  const showHighRejectionAlert = stats.totalDoctors >= 10 && rejectionRate > 40;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ═══ 1) هيدر الترحيب ═══ */}
      <OverviewWelcomeHeader onRefresh={onRefresh} refreshing={refreshing} />

      {/* ═══ 2) تنبيه معدل رفض مرتفع (من SmartAlertSystem القديم) ═══ */}
      {showHighRejectionAlert && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-gradient-to-l from-red-50 via-rose-50 to-red-50 px-4 py-3 sm:py-4 shadow-sm dh-stagger-2">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 shrink-0">
            <FaTriangleExclamation className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 text-right">
            <p className="text-sm sm:text-base font-black text-red-800">
              معدل رفض الأطباء مرتفع: {rejectionRate.toLocaleString('ar-EG', { maximumFractionDigits: 1 })}%
            </p>
            <p className="text-[11px] sm:text-xs font-medium text-red-600/80">
              تجاوز الحد الآمن (40%). راجع معايير القبول أو جودة طلبات التسجيل.
            </p>
          </div>
        </div>
      )}

      {/* ═══ 3) شريط تنبيه عاجل: أطباء بانتظار المراجعة ═══ */}
      {pendingDoctorsCount > 0 && (
        <button onClick={() => onNavigate('verification')} className="w-full group dh-stagger-2">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-gradient-to-l from-amber-50 via-orange-50 to-amber-50 px-4 py-3 sm:py-4 shadow-sm transition hover:shadow-md">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 shrink-0">
                <FaTriangleExclamation className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 text-right">
                <p className="text-sm sm:text-base font-black text-amber-800">
                  {/* صياغة ذكية: مفرد / مثنى / جمع حسب العدد */}
                  {pendingDoctorsCount === 1
                    ? 'يوجد طبيب واحد بانتظار المراجعة'
                    : pendingDoctorsCount === 2
                      ? 'يوجد طبيبان بانتظار المراجعة'
                      : `يوجد ${pendingDoctorsCount.toLocaleString('ar-EG')} أطباء بانتظار المراجعة`}
                </p>
                <p className="text-[11px] sm:text-xs font-medium text-amber-600/80">
                  اضغط هنا لمراجعة الطلبات والتحقق من الحسابات
                </p>
              </div>
            </div>
            <FaArrowLeft className="w-4 h-4 text-amber-500 shrink-0 transition-transform group-hover:-translate-x-1" />
          </div>
        </button>
      )}

      {/* ═══ 4) بطاقات الـ KPI الرئيسية (أطباء، جمهور، برو، برو ماكس، أرباح) ═══ */}
      {/* فصلنا "اشتراكات برو" لبطاقتين (برو + برو ماكس) عشان الأدمن يشوف التفصيل */}
      {/* grid-cols-5 على الديسكتوب لاستيعاب 5 بطاقات. الموبايل يفضل 2 → 3 صفوف */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 dh-stagger-3">
        <StatCard
          title="إجمالي الأطباء"
          value={stats.totalDoctors}
          icon={<FaStethoscope />}
          iconBg="bg-cyan-50"
          iconColor="text-cyan-600"
          valueColor="text-cyan-700"
        />
        <StatCard
          title="إجمالي الجمهور"
          value={stats.totalPatients}
          icon={<FaUsers />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          valueColor="text-blue-700"
        />
        {/* اشتراكات برو — العدد المحدد للبريميوم فقط (ذهبي فاتح) */}
        <StatCard
          title="اشتراكات برو"
          value={stats.premiumDocsCount}
          unit="اشتراك نشط"
          icon={<FaCrown />}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          valueColor="text-amber-700"
        />
        {/* اشتراكات برو ماكس — منفصلة (ذهبي غامق) عشان الأدمن يعرف الفئة الأعلى */}
        <StatCard
          title="اشتراكات برو ماكس"
          value={stats.proMaxDocsCount}
          unit="اشتراك نشط"
          icon={<FaCrown />}
          iconBg="bg-[#FFF8E1]"
          iconColor="text-[#B45309]"
          valueColor="text-[#B45309]"
        />
        <StatCard
          title="صافي الربح"
          value={stats.netProfit}
          unit="جنيه مصري"
          icon={<FaChartLine />}
          iconBg={stats.netProfit >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}
          iconColor={stats.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}
          valueColor={stats.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}
        />
      </div>

      {/* ═══ 5) بطاقات تفصيلية: حالة الأطباء + الملخص المالي ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 dh-stagger-4">
        {/* ── بطاقة حالة الأطباء ── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-cyan-50/60 border-b border-cyan-100/60">
            <FaStethoscope className="w-3.5 h-3.5 text-cyan-600" />
            <h2 className="text-xs sm:text-sm font-black text-cyan-800">حالة حسابات الأطباء</h2>
          </div>
          <div className="p-3 sm:p-4 space-y-2">
            <DetailRow icon={<FaCircleCheck />} label="مقبولون" value={stats.approvedDoctors}
              iconBg="bg-emerald-50" iconColor="text-emerald-600" valueColor="text-emerald-700" />
            <DetailRow icon={<FaHourglassHalf />} label="قيد المراجعة" value={stats.pendingDoctors}
              iconBg="bg-amber-50" iconColor="text-amber-600" valueColor="text-amber-700" />
            <DetailRow icon={<FaCircleXmark />} label="مرفوضون" value={stats.rejectedDoctors}
              iconBg="bg-rose-50" iconColor="text-rose-600" valueColor="text-rose-700" />
            <DetailRow icon={<FaBan />} label="محظورون" value={stats.totalBlacklisted}
              iconBg="bg-red-50" iconColor="text-red-600" valueColor="text-red-700" />

            {/* شريط تقدم نسبة الموافقة */}
            <div className="pt-2 mt-1 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1.5 text-[11px] sm:text-xs">
                <span className="font-bold text-slate-500">نسبة الموافقة</span>
                <span className="font-black text-cyan-700 font-numeric">{approvalRate}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-cyan-400 to-teal-500 transition-all duration-500"
                  style={{ width: `${approvalRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── بطاقة الملخص المالي ── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50/60 border-b border-emerald-100/60">
            <FaMoneyBillWave className="w-3.5 h-3.5 text-emerald-600" />
            <h2 className="text-xs sm:text-sm font-black text-emerald-800">الملخص المالي</h2>
          </div>
          <div className="p-3 sm:p-4 space-y-2">
            <DetailRow icon={<FaMoneyBillWave />} label="إجمالي الإيرادات" value={stats.totalRevenue}
              iconBg="bg-emerald-50" iconColor="text-emerald-600" valueColor="text-emerald-700" />
            <DetailRow icon={<FaCoins />} label="إجمالي المصروفات" value={stats.totalExpenses}
              iconBg="bg-orange-50" iconColor="text-orange-600" valueColor="text-orange-700" />

            {/* إبراز صافي الربح في مربع ملون (أخضر لو موجب، وردي لو سالب) */}
            <div className="pt-2 mt-1 border-t border-slate-100">
              <div
                className={`flex items-center justify-between rounded-xl px-3 py-3 ${
                  stats.netProfit >= 0
                    ? 'bg-emerald-50 border border-emerald-100'
                    : 'bg-rose-50 border border-rose-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FaChartLine className={`w-4 h-4 ${stats.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} />
                  <span className={`text-sm font-bold ${stats.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    صافي الربح
                  </span>
                </div>
                <div className="text-left">
                  <span className={`text-lg sm:text-xl font-black font-numeric ${stats.netProfit >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                    {stats.netProfit.toLocaleString('ar-EG')}
                  </span>
                  <span className={`mr-1 text-[10px] font-bold ${stats.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ج.م
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 6) تحليل استهلاك الباقات ═══ */}
      <OverviewUsageAnalysis stats={stats} />

      {/* ═══ 7) اختصارات سريعة ═══ */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <FaGear className="w-3.5 h-3.5 text-slate-500" />
            <h2 className="text-xs sm:text-sm font-black text-slate-800">اختصارات سريعة</h2>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] sm:text-[11px] font-bold text-slate-500">
            نقطة دخول سريعة
          </span>
        </div>

        <div className="p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <QuickAction
            icon={<FaShieldHalved />} label="تحقق" sublabel="تحقق الأطباء الجدد"
            borderColor="border-sky-200" bgColor="bg-sky-50/60" textColor="text-sky-700" iconColor="text-sky-600"
            badge={pendingDoctorsCount}
            onClick={() => onNavigate('verification')}
          />
          <QuickAction
            icon={<FaStethoscope />} label="أطباء" sublabel="إدارة الأطباء"
            borderColor="border-blue-200" bgColor="bg-blue-50/60" textColor="text-blue-700" iconColor="text-blue-600"
            onClick={() => onNavigate('accounts')}
          />
          <QuickAction
            icon={<FaBan />} label="حظر" sublabel="قائمة الحظر"
            borderColor="border-rose-200" bgColor="bg-rose-50/60" textColor="text-rose-700" iconColor="text-rose-600"
            onClick={() => onNavigate('blacklist')}
          />
          <QuickAction
            icon={<FaMoneyBillWave />} label="مالي" sublabel="الإدارة المالية"
            borderColor="border-emerald-200" bgColor="bg-emerald-50/60" textColor="text-emerald-700" iconColor="text-emerald-600"
            onClick={() => onNavigate('financial')}
          />
        </div>
      </div>
    </div>
  );
};
