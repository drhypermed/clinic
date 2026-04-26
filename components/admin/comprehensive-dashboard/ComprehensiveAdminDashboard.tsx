/**
 * ComprehensiveAdminDashboard — لوحة تحكم الأدمن الشاملة
 *
 * نقطة الدخول الرئيسية للوحة إدارة النظام. يُحضِّر كل الـ state العام
 * ويوجّه العرض بين الأقسام المختلفة (نظرة شاملة، تحقق الأطباء، إدارة
 * الحسابات، الماليات، قوائم الحظر، البث، الإعدادات، ...).
 *
 * تم فصل المنطق المعقّد إلى:
 *   - `useAdminListManagement` : hook لإدارة قائمة المسؤولين (CRUD + subscribe).
 *   - `useDashboardStats`      : hook لتحميل إحصائيات النظام (مع polling).
 *
 * المكوّن نفسه يركّز على:
 *   1. إدارة الـ currentView (الربط مع search params).
 *   2. إدارة السلوك المتجاوب للـ sidebar.
 *   3. التوجيه JSX بين الأقسام (switch-case على currentView).
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DoctorVerificationPanel } from '../doctor-verification/DoctorVerificationPanel';
import { ReportsSection } from './ReportsSection';
import { PatientManagementPanel } from '../patient-management/PatientManagementPanel';
import { PublicBlacklistManagementPanel } from '../public-blacklist/PublicBlacklistManagementPanel';
import { LoadingText } from '../../ui/LoadingText';
import { AccountManagementPanel } from '../account-management/AccountManagementPanel';
import { FinancialPanel } from '../financial-panel/FinancialPanel';
import { HomepageBannerManagementPanel } from '../homepage-banner-management/HomepageBannerManagementPanel';
import { PrescriptionFooterLineManagementPanel } from '../prescription-footer-line-management/PrescriptionFooterLineManagementPanel';
import { AccountTypeControlsPanel } from '../account-type-controls/AccountTypeControlsPanel';
import { UpdateBroadcastManagementPanel } from '../update-broadcast/UpdateBroadcastManagementPanel';
import { ExternalNotificationBroadcastPanel } from '../external-notification-broadcast/ExternalNotificationBroadcastPanel';
import { InternalNotificationBroadcastPanel } from '../internal-notification-broadcast/InternalNotificationBroadcastPanel';
import { RestrictedAccountsPanel } from './RestrictedAccountsPanel';
import { usePendingDoctorsCount } from '../../../hooks/usePendingDoctorsCount';
import { ADMIN_EMAIL } from '../../../app/drug-catalog/admin';
import { useIsAdmin } from '../../../hooks/useIsAdmin';
import { DashboardSidebar } from './DashboardSidebar';
import { OverviewSection } from './OverviewSection';
import { SettingsSection } from './SettingsSection';
import { NAV_GROUPS, NAV_ITEMS } from './constants';
import { AdminDashboardProps } from '../../../types';
import { normalizeEmail } from '../../../services/auth-service/validation';
import type { AdminView } from './types';
import { useAdminListManagement } from './useAdminListManagement';
import { useDashboardStats } from './useDashboardStats';

const VIEW_META: Record<AdminView, { title: string }> = {
  overview: { title: 'نظرة تشغيلية شاملة' },
  verification: { title: 'تحقق الأطباء' },
  patients: { title: 'إدارة الجمهور' },
  publicBlacklist: { title: 'حظر الجمهور' },
  accounts: { title: 'إدارة الأطباء' },
  accountTypesControl: { title: 'التحكم في أنواع الحساب' },
  financial: { title: 'الإدارة المالية' },
  // ─ يضم: حظر الأطباء + الأطباء المعطّلين فقط (حظر الجمهور اتنقل لقسمه)
  restrictedAccounts: { title: 'الحسابات المقيدة' },
  externalNotifications: { title: 'بث الإشعارات' },
  updateBroadcasts: { title: 'تحديثات التطبيق' },
  reports: { title: 'التقارير والإحصاءات' },
  homeBanner: { title: 'بانرات الصفحة الرئيسية' },
  prescriptionFooterLine: { title: 'سطر أسفل الروشتة' },
  settings: { title: 'إعدادات النظام' },
};

const isAdminView = (value: string | null): value is AdminView => {
  if (!value) return false;
  return NAV_ITEMS.some((item) => item.id === value);
};

const MOBILE_SIDEBAR_BREAKPOINT = 1024;

const AdminViewShell: React.FC<{
  view: AdminView;
  children: React.ReactNode;
}> = ({ view, children }) => {
  const meta = VIEW_META[view];

  return (
    <section key={view} className="admin-modern-view space-y-3 sm:space-y-4">
      <div className="admin-modern-view-header rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-[0_14px_30px_-26px_rgba(15,23,42,0.45)] sm:px-4 sm:py-3 dh-stagger-1">
        <h2 className="text-base font-black text-slate-900 sm:text-lg">{meta.title}</h2>
      </div>

      <section className="admin-modern-content rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_20px_45px_-38px_rgba(15,23,42,0.5)] sm:p-4 dh-stagger-2">
        {children}
      </section>
    </section>
  );
};

export const ComprehensiveAdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAdminUser = useIsAdmin(user);
  const [currentView, setCurrentView] = useState<AdminView>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pendingDoctorsCount = usePendingDoctorsCount();
  const rootAdminEmail = normalizeEmail(ADMIN_EMAIL);

  // إدارة قائمة المسؤولين + المنطق الكامل للإضافة/الحذف
  const {
    adminList,
    adminListLoading,
    newAdminEmail,
    adminActionLoading,
    adminActionMessage,
    setNewAdminEmail,
    handleAddAdmin,
    handleRemoveAdmin,
  } = useAdminListManagement({
    isAdminUser,
    userEmail: user?.email,
    rootAdminEmail,
  });

  // تحميل إحصائيات النظام مع polling كل 30 ثانية
  const { stats, loading, refreshing, refresh } = useDashboardStats(isAdminUser, user);

  // مزامنة تصرف الـ sidebar مع مقاس الشاشة (منع overflow body على الموبايل)
  useEffect(() => {
    const syncOverflow = () => {
      const isMobileViewport = window.innerWidth < MOBILE_SIDEBAR_BREAKPOINT;
      document.body.style.overflow = sidebarOpen && isMobileViewport ? 'hidden' : '';
    };

    const handleResize = () => {
      if (window.innerWidth >= MOBILE_SIDEBAR_BREAKPOINT) {
        setSidebarOpen(false);
      }
      syncOverflow();
    };

    syncOverflow();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = '';
      }
    };
  }, [sidebarOpen]);

  // مزامنة currentView مع URL search params (?view=...)
  useEffect(() => {
    const requestedView = searchParams.get('view');
    if (requestedView === null) {
      // لا يوجد ?view= يعني نحن في الـ overview
      setCurrentView('overview');
    } else if (isAdminView(requestedView)) {
      setCurrentView(requestedView);
    }
  }, [searchParams]);

  const handleSelectView = (view: AdminView) => {
    setCurrentView(view);
    setSidebarOpen(false);

    const nextParams = new URLSearchParams(searchParams);
    if (view === 'overview') {
      nextParams.delete('view');
    } else {
      nextParams.set('view', view);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const effectivePendingDoctorsCount = Math.max(stats.pendingDoctors, pendingDoctorsCount);

  const viewCounts = useMemo<Partial<Record<AdminView, number>>>(
    () => ({
      overview: stats.totalDoctors + stats.totalPatients,
      verification: effectivePendingDoctorsCount,
      patients: stats.totalPatients,
      // ─ حظر الجمهور بقى عداده مستقل (تحت قسم "إدارة الجمهور")
      publicBlacklist: stats.publicBlacklisted,
      accounts: stats.totalDoctors,
      accountTypesControl: stats.activeSubscriptions,
      financial: stats.activeSubscriptions,
      // ─ المقيدين = حظر أطباء + معطّلين فقط (حظر الجمهور انفصل)
      restrictedAccounts: stats.doctorBlacklisted,
      externalNotifications: 0,
      updateBroadcasts: 0,
      reports: stats.totalDoctors,
      homeBanner: stats.homeBannerItems,
      prescriptionFooterLine: stats.footerContacts,
      settings: adminList.length,
    }),
    [stats, effectivePendingDoctorsCount, adminList.length],
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'overview':
        return (
          <AdminViewShell view="overview">
            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-700 sm:p-8">
                <LoadingText>جاري تحميل الإحصاءات</LoadingText>
              </div>
            ) : (
              <OverviewSection
                stats={stats}
                pendingDoctorsCount={effectivePendingDoctorsCount}
                onNavigate={handleSelectView}
                onRefresh={refresh}
                refreshing={refreshing}
              />
            )}
          </AdminViewShell>
        );
      case 'verification':
        return <AdminViewShell view="verification"><DoctorVerificationPanel /></AdminViewShell>;
      case 'patients':
        return <AdminViewShell view="patients"><PatientManagementPanel currentView="patients" /></AdminViewShell>;
      // ─ حظر الجمهور — view منفصل تحت "إدارة الجمهور" (نُقل من RestrictedAccountsPanel)
      case 'publicBlacklist':
        return (
          <AdminViewShell view="publicBlacklist">
            <PublicBlacklistManagementPanel isAdminUser={isAdminUser} adminEmail={user?.email} />
          </AdminViewShell>
        );
      case 'accounts':
        return <AdminViewShell view="accounts"><AccountManagementPanel /></AdminViewShell>;
      case 'accountTypesControl':
        return <AdminViewShell view="accountTypesControl"><AccountTypeControlsPanel /></AdminViewShell>;
      case 'financial':
        return <AdminViewShell view="financial"><FinancialPanel /></AdminViewShell>;
      // ─ view موحد جديد يجمع 3 panels قديمة في tabs (blacklist + disabled + publicBlacklist)
      case 'restrictedAccounts':
        return (
          <AdminViewShell view="restrictedAccounts">
            <RestrictedAccountsPanel isAdminUser={isAdminUser} adminEmail={user?.email} />
          </AdminViewShell>
        );
      case 'externalNotifications':
        return (
          <AdminViewShell view="externalNotifications">
            <div className="space-y-5">
              <ExternalNotificationBroadcastPanel isAdminUser={isAdminUser} />
              <InternalNotificationBroadcastPanel isAdminUser={isAdminUser} />
            </div>
          </AdminViewShell>
        );
      case 'updateBroadcasts':
        return <AdminViewShell view="updateBroadcasts"><UpdateBroadcastManagementPanel /></AdminViewShell>;
      case 'reports':
        return <AdminViewShell view="reports"><ReportsSection stats={stats} /></AdminViewShell>;
      case 'homeBanner':
        return (
          <AdminViewShell view="homeBanner">
            <div className="space-y-5">
              <HomepageBannerManagementPanel
                adminEmail={user.email}
                settingsDocId="homepageBanner"
                panelTitle="بانر الدكاترة"
                panelDescription="هذا البانر يظهر في صفحة الداشبورد للدكاترة."
              />
              <HomepageBannerManagementPanel
                adminEmail={user.email}
                settingsDocId="homepageBannerPublic"
                panelTitle="بانر الجمهور"
                panelDescription="هذا البانر يظهر في صفحة الجمهور أعلى الصفحة."
              />
            </div>
          </AdminViewShell>
        );
      case 'prescriptionFooterLine':
        return (
          <AdminViewShell view="prescriptionFooterLine">
            <PrescriptionFooterLineManagementPanel adminEmail={user.email} />
          </AdminViewShell>
        );
      case 'settings':
        return (
          <AdminViewShell view="settings">
            <SettingsSection
              user={user}
              newAdminEmail={newAdminEmail}
              adminActionLoading={adminActionLoading}
              adminActionMessage={adminActionMessage}
              adminListLoading={adminListLoading}
              adminList={adminList}
              canManageAdmins={isAdminUser}
              onChangeNewAdminEmail={setNewAdminEmail}
              onAddAdmin={handleAddAdmin}
              onRemoveAdmin={handleRemoveAdmin}
            />
          </AdminViewShell>
        );
      default:
        return null;
    }
  };

  return (
    <div className="admin-modern-scope relative min-h-screen overflow-hidden bg-[#f3f7fb]" dir="rtl">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-24 right-[-8rem] h-72 w-72 rounded-full bg-brand-300/30 blur-3xl" />
        <div className="absolute left-[-10rem] top-1/3 h-96 w-96 rounded-full bg-brand-200/35 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-1/4 h-72 w-72 rounded-full bg-success-200/35 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen w-full flex-col lg:flex-row">
        <div className="admin-modern-mobile-bar absolute top-0 left-0 right-0 flex items-center justify-between gap-2 border-b border-slate-200 bg-white/85 px-3 py-2.5 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.6)] lg:hidden z-50">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
            aria-label="فتح القائمة الجانبية"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="min-w-0 flex-1 text-right">
            <p className="truncate text-sm font-bold text-slate-900">{VIEW_META[currentView].title}</p>
          </div>
          <span className="inline-flex min-w-[2rem] items-center justify-center rounded-full bg-warning-100 px-2 py-1 text-xs font-black text-warning-700">
            {effectivePendingDoctorsCount > 99 ? '99+' : effectivePendingDoctorsCount}
          </span>
        </div>

        <div className="admin-modern-layout flex min-h-0 flex-1">
          <DashboardSidebar
            navGroups={NAV_GROUPS}
            currentView={currentView}
            sidebarOpen={sidebarOpen}
            viewCounts={viewCounts}
            onSelectView={handleSelectView}
            onCloseSidebar={() => setSidebarOpen(false)}
            onNavigateHome={() => navigate('/')}
            onLogout={onLogout}
          />

          <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-2 py-2 sm:px-3 sm:py-3 lg:px-5 pt-14 lg:pt-2 pb-3 sm:pb-4 mx-auto w-full max-w-[1780px] lg:mr-72">
            {!isAdminUser && (
              <div className="mb-6 rounded-2xl border border-danger-300 bg-danger-50 p-4 text-danger-700">
                غير مصرح لك بالوصول الكامل إلى لوحة الإدارة.
              </div>
            )}

            {renderCurrentView()}
          </main>
        </div>
      </div>
    </div>
  );
};
