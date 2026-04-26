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
        <div className="flex items-center gap-3 rounded-2xl border border-danger-200 bg-gradient-to-l from-danger-50 via-danger-50 to-danger-50 px-4 py-3 sm:py-4 shadow-sm dh-stagger-2">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-danger-100 text-danger-600 shrink-0">
            <FaTriangleExclamation className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 text-right">
            <p className="text-sm sm:text-base font-black text-danger-800">
              معدل رفض الأطباء مرتفع: {rejectionRate.toLocaleString('ar-EG', { maximumFractionDigits: 1 })}%
            </p>
            <p className="text-[11px] sm:text-xs font-medium text-danger-600/80">
              تجاوز الحد الآمن (40%). راجع معايير القبول أو جودة طلبات التسجيل.
            </p>
          </div>
        </div>
      )}

      {/* ═══ 3) شريط تنبيه عاجل: أطباء بانتظار المراجعة ═══ */}
      {pendingDoctorsCount > 0 && (
        <button onClick={() => onNavigate('verification')} className="w-full group dh-stagger-2">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-warning-200 bg-gradient-to-l from-warning-50 via-warning-50 to-warning-50 px-4 py-3 sm:py-4 shadow-sm transition hover:shadow-md">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-warning-100 text-warning-600 shrink-0">
                <FaTriangleExclamation className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 text-right">
                <p className="text-sm sm:text-base font-black text-warning-800">
                  {/* صياغة ذكية: مفرد / مثنى / جمع حسب العدد */}
                  {pendingDoctorsCount === 1
                    ? 'يوجد طبيب واحد بانتظار المراجعة'
                    : pendingDoctorsCount === 2
                      ? 'يوجد طبيبان بانتظار المراجعة'
                      : `يوجد ${pendingDoctorsCount.toLocaleString('ar-EG')} أطباء بانتظار المراجعة`}
                </p>
                <p className="text-[11px] sm:text-xs font-medium text-warning-600/80">
                  اضغط هنا لمراجعة الطلبات والتحقق من الحسابات
                </p>
              </div>
            </div>
            <FaArrowLeft className="w-4 h-4 text-warning-500 shrink-0 transition-transform group-hover:-translate-x-1" />
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
          iconBg="bg-brand-50"
          iconColor="text-brand-600"
          valueColor="text-brand-700"
        />
        <StatCard
          title="إجمالي الجمهور"
          value={stats.totalPatients}
          icon={<FaUsers />}
          iconBg="bg-brand-50"
          iconColor="text-brand-600"
          valueColor="text-brand-700"
        />
        {/* اشتراكات برو — العدد المحدد للبريميوم فقط (ذهبي فاتح) */}
        <StatCard
          title="اشتراكات برو"
          value={stats.premiumDocsCount}
          unit="اشتراك نشط"
          icon={<FaCrown />}
          iconBg="bg-warning-50"
          iconColor="text-warning-600"
          valueColor="text-warning-700"
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
          iconBg={stats.netProfit >= 0 ? 'bg-success-50' : 'bg-danger-50'}
          iconColor={stats.netProfit >= 0 ? 'text-success-600' : 'text-danger-600'}
          valueColor={stats.netProfit >= 0 ? 'text-success-700' : 'text-danger-700'}
        />
      </div>

      {/* ═══ 5) بطاقات تفصيلية: حالة الأطباء + الملخص المالي ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 dh-stagger-4">
        {/* ── بطاقة حالة الأطباء ── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-brand-50/60 border-b border-brand-100/60">
            <FaStethoscope className="w-3.5 h-3.5 text-brand-600" />
            <h2 className="text-xs sm:text-sm font-black text-brand-800">حالة حسابات الأطباء</h2>
          </div>
          <div className="p-3 sm:p-4 space-y-2">
            <DetailRow icon={<FaCircleCheck />} label="مقبولون" value={stats.approvedDoctors}
              iconBg="bg-success-50" iconColor="text-success-600" valueColor="text-success-700" />
            <DetailRow icon={<FaHourglassHalf />} label="قيد المراجعة" value={stats.pendingDoctors}
              iconBg="bg-warning-50" iconColor="text-warning-600" valueColor="text-warning-700" />
            <DetailRow icon={<FaCircleXmark />} label="مرفوضون" value={stats.rejectedDoctors}
              iconBg="bg-danger-50" iconColor="text-danger-600" valueColor="text-danger-700" />
            <DetailRow icon={<FaBan />} label="محظورون" value={stats.totalBlacklisted}
              iconBg="bg-danger-50" iconColor="text-danger-600" valueColor="text-danger-700" />

            {/* شريط تقدم نسبة الموافقة */}
            <div className="pt-2 mt-1 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1.5 text-[11px] sm:text-xs">
                <span className="font-bold text-slate-500">نسبة الموافقة</span>
                <span className="font-black text-brand-700 font-numeric">{approvalRate}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-brand-400 to-brand-500 transition-all duration-500"
                  style={{ width: `${approvalRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── بطاقة الملخص المالي ── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-success-50/60 border-b border-success-100/60">
            <FaMoneyBillWave className="w-3.5 h-3.5 text-success-600" />
            <h2 className="text-xs sm:text-sm font-black text-success-800">الملخص المالي</h2>
          </div>
          <div className="p-3 sm:p-4 space-y-2">
            <DetailRow icon={<FaMoneyBillWave />} label="إجمالي الإيرادات" value={stats.totalRevenue}
              iconBg="bg-success-50" iconColor="text-success-600" valueColor="text-success-700" />
            <DetailRow icon={<FaCoins />} label="إجمالي المصروفات" value={stats.totalExpenses}
              iconBg="bg-warning-50" iconColor="text-warning-600" valueColor="text-warning-700" />

            {/* إبراز صافي الربح في مربع ملون (أخضر لو موجب، وردي لو سالب) */}
            <div className="pt-2 mt-1 border-t border-slate-100">
              <div
                className={`flex items-center justify-between rounded-xl px-3 py-3 ${
                  stats.netProfit >= 0
                    ? 'bg-success-50 border border-success-100'
                    : 'bg-danger-50 border border-danger-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FaChartLine className={`w-4 h-4 ${stats.netProfit >= 0 ? 'text-success-600' : 'text-danger-600'}`} />
                  <span className={`text-sm font-bold ${stats.netProfit >= 0 ? 'text-success-700' : 'text-danger-700'}`}>
                    صافي الربح
                  </span>
                </div>
                <div className="text-left">
                  <span className={`text-lg sm:text-xl font-black font-numeric ${stats.netProfit >= 0 ? 'text-success-800' : 'text-danger-800'}`}>
                    {stats.netProfit.toLocaleString('ar-EG')}
                  </span>
                  <span className={`mr-1 text-[10px] font-bold ${stats.netProfit >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                    ج.م
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 6) تحليل استهلاك الباقات (إجمالي lifetime — بدون range filter للتوفير) ═══ */}
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

        {/* 4 اختصارات بالظبط — `lg:grid-cols-4` يخلي الـgrid يملأ الصف بدون خانات فاضية */}
        <div className="p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickAction
            icon={<FaShieldHalved />} label="تحقق" sublabel="تحقق الأطباء الجدد"
            borderColor="border-brand-200" bgColor="bg-brand-50/60" textColor="text-brand-700" iconColor="text-brand-600"
            badge={pendingDoctorsCount}
            onClick={() => onNavigate('verification')}
          />
          <QuickAction
            icon={<FaStethoscope />} label="أطباء" sublabel="إدارة الأطباء"
            borderColor="border-brand-200" bgColor="bg-brand-50/60" textColor="text-brand-700" iconColor="text-brand-600"
            onClick={() => onNavigate('accounts')}
          />
          {/* استبدلنا "حظر" بـ"إدارة الجمهور" — الحظر موجود في الـsidebar،
              والجمهور كان مفيش له اختصار قبل كده. */}
          <QuickAction
            icon={<FaUsers />} label="الجمهور" sublabel="إدارة حسابات الجمهور"
            borderColor="border-brand-200" bgColor="bg-brand-50/60" textColor="text-brand-700" iconColor="text-brand-600"
            onClick={() => onNavigate('patients')}
          />
          <QuickAction
            icon={<FaMoneyBillWave />} label="مالي" sublabel="الإدارة المالية"
            borderColor="border-success-200" bgColor="bg-success-50/60" textColor="text-success-700" iconColor="text-success-600"
            onClick={() => onNavigate('financial')}
          />
        </div>
      </div>
    </div>
  );
};
