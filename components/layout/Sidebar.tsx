/**
 * مكون الشريط الجانبي (Sidebar):
 * يمثل هذا المكون العصب الرئيسي للتنقل داخل التطبيق.
 * المهام الرئيسية:
 * 1. عرض قائمة التنقل (الرئيسية، الروشتة، السجلات، الخ) مع تنبيهات بأعداد المواعيد.
 * 2. إدارة الواجهة في وضع الهواتف (Mobile Menu) مع ميزة إخفاء الهيدر عند التمرير.
 * 3. عرض بيانات الطبيب (الاسم، الصورة، حالة الاشتراك) وتوفير وصول سريع للملف الشخصي وتسجيل الخروج.
 * 4. إدارة ظهور لوحة التحكم للمديرين (Admin Dashboard) بناءً على صلاحيات المستخدم.
 */

import React, { useEffect, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { usePremiumExpiryCheck } from '../../hooks/usePremiumExpiryCheck';
import { usePendingDoctorsCount } from '../../hooks/usePendingDoctorsCount';
import { useIsAdmin } from '../../hooks/useIsAdmin';
import { LoadingStateScreen } from '../app/LoadingStateScreen';
import {
    FaHouse, FaStethoscope, FaClipboardList, FaFolderOpen,
    FaCalendarCheck, FaChartPie, FaFlask, FaKey,
    FaPaintbrush, FaBullhorn, FaBuilding, FaShieldHalved,
    FaRightFromBracket, FaCircleUser, FaBars, FaXmark,
} from 'react-icons/fa6';
import { Breadcrumbs } from './Breadcrumbs';
import { BrandLogo } from '../common/BrandLogo';
import type { BreadcrumbSegment } from '../app/utils/breadcrumbConfig';
import type { AppView } from '../app/utils/mainAppRouting';

/** أنواع الواجهات المتاحة للتنقل */
type ViewType = 'home' | 'prescription' | 'records' | 'patientFiles' | 'appointments' | 'secretary' | 'financialReports' | 'drugtools' | 'medicationEdit' | 'settings' | 'branchSettings' | 'advertisement';

interface SidebarProps {
    currentView: string; // الواجهة المحددة حالياً
    setCurrentView: (view: ViewType) => void; // دالة لتغيير الواجهة
    todayAppointmentsCount: number; // عدد مواعيد اليوم (للعرض في الشارة)
    user: User | null; // بيانات المستخدم من Firebase
    onShowProfile: () => void; // دالة لفتح المودال الخاص بالملف الشخصي
    onLogout: () => void; // دالة تسجيل الخروج
    doctorName?: string; // اسم الطبيب من الإعدادات
    profileImage?: string; // رابط الصورة الشخصية
    breadcrumbs?: BreadcrumbSegment[]; // شرائح مسار التنقل
    onNavigateView?: (view: AppView) => void; // دالة التنقل عبر مسار التنقل
}

export const Sidebar: React.FC<SidebarProps> = ({
    currentView,
    setCurrentView,
    todayAppointmentsCount,
    user,
    onShowProfile,
    onLogout,
    doctorName,
    profileImage,
    breadcrumbs,
    onNavigateView,
}) => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileHeaderHidden, setMobileHeaderHidden] = useState(false);
    const [loadingAction, setLoadingAction] = useState<'admin' | 'logout' | null>(null);
    const lastScrollYRef = useRef(0);
    const tickingRef = useRef(false);
    const { isPremium } = usePremiumExpiryCheck(user);
    const pendingDoctorsCount = usePendingDoctorsCount();
    const isAdminUser = useIsAdmin(user);
    const verificationStatus = (user as any)?.verificationStatus;
    const isAdminVerified = Boolean((user as any)?.isVerified || verificationStatus === 'approved');

    const navItems = [
        {
            id: 'home' as ViewType,
            label: 'الرئيسية',
            icon: <FaHouse className="w-5 h-5" />,
            activeColor: 'bg-blue-600',
            activeTextColor: 'text-white',
            iconBgActive: 'bg-blue-500',
        },
        {
            id: 'prescription' as ViewType,
            label: 'كشف جديد',
            icon: <FaStethoscope className="w-5 h-5" />,
            activeColor: 'bg-emerald-600',
            activeTextColor: 'text-white',
            iconBgActive: 'bg-emerald-500',
        },
        {
            id: 'records' as ViewType,
            label: 'سجلات المرضى',
            icon: <FaClipboardList className="w-5 h-5" />,
            activeColor: 'bg-purple-600',
            activeTextColor: 'text-white',
            iconBgActive: 'bg-purple-500',
        },
        {
            id: 'patientFiles' as ViewType,
            label: 'ملفات المرضى',
            icon: <FaFolderOpen className="w-5 h-5" />,
            activeColor: 'bg-fuchsia-600',
            activeTextColor: 'text-white',
            iconBgActive: 'bg-fuchsia-500',
        },
        {
            id: 'appointments' as ViewType,
            label: 'المواعيد',
            icon: <FaCalendarCheck className="w-5 h-5" />,
            activeColor: 'bg-teal-600',
            activeTextColor: 'text-white',
            iconBgActive: 'bg-teal-500',
            badge: todayAppointmentsCount > 0 ? todayAppointmentsCount : undefined,
        },
        {
            id: 'financialReports' as ViewType,
            label: 'التقارير المالية',
            icon: <FaChartPie className="w-5 h-5" />,
            activeColor: 'bg-rose-600',
            activeTextColor: 'text-white',
            iconBgActive: 'bg-rose-500',
        },
        {
            id: 'drugtools' as ViewType,
            label: 'أدوات الأدوية',
            icon: <FaFlask className="w-5 h-5" />,
            activeColor: 'bg-indigo-600',
            activeTextColor: 'text-white',
            iconBgActive: 'bg-indigo-500',
        },
        {
            id: 'secretary' as ViewType,
            label: 'السكرتارية',
            icon: <FaKey className="w-5 h-5" />,
            activeColor: 'bg-violet-600',
            activeTextColor: 'text-white',
            iconBgActive: 'bg-violet-500',
        },
        {
            id: 'settings' as ViewType,
            label: 'تصميم الروشتة',
            icon: <FaPaintbrush className="w-5 h-5" />,
            activeColor: 'bg-orange-600',
            activeTextColor: 'text-white',
            iconBgActive: 'bg-orange-500',
        },
        {
            id: 'advertisement' as ViewType,
            label: 'الإعلان والجمهور',
            icon: <FaBullhorn className="w-5 h-5" />,
            activeColor: 'bg-cyan-600',
            activeTextColor: 'text-white',
            iconBgActive: 'bg-cyan-500',
        },
        {
            id: 'branchSettings' as ViewType,
            label: 'إدارة الفروع',
            icon: <FaBuilding className="w-5 h-5" />,
            activeColor: 'bg-amber-600',
            activeTextColor: 'text-white',
            iconBgActive: 'bg-amber-500',
        },
    ];

    const handleNavClick = (viewId: ViewType) => {
        setCurrentView(viewId);
        setMobileMenuOpen(false);
    };

    // Get display name: prefer doctorName from settings, fallback to user info
    const displayName = doctorName || user?.displayName || 'Dr. Hyper';

    // Use the resolved app profile image only, so explicit delete stays blank.
    const displayImage = profileImage;

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleScroll = () => {
            if (tickingRef.current) return;
            tickingRef.current = true;

            window.requestAnimationFrame(() => {
                tickingRef.current = false;
                if (mobileMenuOpen) {
                    setMobileHeaderHidden(false);
                    lastScrollYRef.current = window.scrollY;
                    return;
                }

                const isMobile = window.innerWidth < 768;
                if (!isMobile) {
                    setMobileHeaderHidden(false);
                    lastScrollYRef.current = window.scrollY;
                    return;
                }

                const currentY = window.scrollY;
                const delta = currentY - lastScrollYRef.current;
                const threshold = 12;

                if (currentY < 8) {
                    setMobileHeaderHidden(false);
                } else if (delta > threshold) {
                    setMobileHeaderHidden(true);
                } else if (delta < -threshold) {
                    setMobileHeaderHidden(false);
                }

                lastScrollYRef.current = currentY;
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [mobileMenuOpen]);

    // قفل تمرير الصفحة وراء القائمة المفتوحة في الموبايل
    // ملاحظة: `overflow: hidden` على body وحده لا يمنع التمرير باللمس على iOS Safari،
    // لذلك نستخدم `position: fixed` مع حفظ واستعادة الـ scrollY حتى لا يقفز المستخدم للأعلى عند الإغلاق.
    useEffect(() => {
        if (!mobileMenuOpen) return;

        const scrollY = window.scrollY;
        const body = document.body;
        const previous = {
            position: body.style.position,
            top: body.style.top,
            width: body.style.width,
            overflow: body.style.overflow,
        };

        body.style.position = 'fixed';
        body.style.top = `-${scrollY}px`;
        body.style.width = '100%';
        body.style.overflow = 'hidden';

        return () => {
            body.style.position = previous.position;
            body.style.top = previous.top;
            body.style.width = previous.width;
            body.style.overflow = previous.overflow;
            window.scrollTo(0, scrollY);
        };
    }, [mobileMenuOpen]);

    const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
        <div className={`flex flex-col ${isMobile ? 'min-h-full' : 'h-full'}`}>
            {/* User Profile Section - TOP */}
            <div className={`border-b border-slate-100 flex flex-col items-center shrink-0 p-4`}>
                {/* Profile Image (Read-only, Display) */}
                <div className="relative mb-3">
                    <div className={`mx-auto rounded-full p-[3px] bg-gradient-to-tr from-slate-300 via-slate-200 to-slate-100 w-24 h-24 shadow-lg`}>
                        <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-white">
                            {displayImage ? (
                                <img src={displayImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-white" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Doctor Name */}
                <div className="text-center mb-4 w-full flex items-center justify-center gap-1">
                    <p className={`text-base font-black text-slate-800 truncate max-w-[160px]`}>
                        {displayName}
                    </p>
                    {/* Verification Badge: يظهر فقط عند اعتماد الأدمن */}
                    {isAdminVerified && (
                        isPremium ? (
                            <span className="inline-flex items-center gap-1.5 shrink-0">
                                <svg className="w-5 h-5 text-[#FFD700] drop-shadow-[0_2px_4px_rgba(218,165,32,0.6)] transition-all duration-300" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                                </svg>
                                <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                                    <path fill="white" d="M10 15l-3.5-3.5 1.5-1.5L10 12l6-6 1.5 1.5L10 15z" />
                                </svg>
                            </span>
                        ) : (
                            <svg className="w-4 h-4 text-blue-500 shrink-0" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                                <path fill="white" d="M10 15l-3.5-3.5 1.5-1.5L10 12l6-6 1.5 1.5L10 15z" />
                            </svg>
                        )
                    )}
                </div>

                {/* Profile Button */}
                <button
                    onClick={() => { onShowProfile(); if (isMobile) setMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white border border-blue-500/60 hover:brightness-105 transition-all text-sm font-bold mb-2`}
                >
                    <FaCircleUser className="w-4 h-4" />
                    الملف الشخصي
                </button>

            </div>

            {/* Navigation Items */}
            <nav className={`flex-1 flex flex-col p-3 space-y-1.5`}>
                {navItems.map((item) => {
                    const isActive = currentView === item.id ||
                        (item.id === 'drugtools' && currentView === 'medicationEdit');

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            className={`group w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative ${isActive ? `bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg` : `text-slate-600 bg-transparent hover:bg-slate-100 hover:text-slate-800`}`}
                        >
                            <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center transition-all ${isActive ? `bg-blue-500 text-white` : 'bg-slate-100 group-hover:bg-slate-200 group-hover:text-slate-700'}`}>
                                {item.icon}
                            </div>
                            <span className={`text-sm font-bold whitespace-nowrap`}>{item.label}</span>

                            {/* Badge for appointments */}
                            {item.badge && (
                                <span className={`
                  absolute left-3 top-1/2 -translate-y-1/2 min-w-[22px] h-[22px] px-1.5
                  flex items-center justify-center rounded-full text-[11px] font-black
                  ${isActive
                                        ? 'bg-white text-teal-600'
                                        : 'bg-red-500 text-white'
                                    }
                `}>
                                    {item.badge > 99 ? '99+' : item.badge}
                                </span>
                            )}
                        </button>
                    );
                })}

                {/* Admin Dashboard - last item before logout, only visible to admin */}
                {isAdminUser && (
                    <button
                        onClick={() => {
                            setLoadingAction('admin');
                            if (isMobile) setMobileMenuOpen(false);
                            setTimeout(() => navigate('/admin'), 150);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative text-slate-600 hover:bg-slate-100 hover:text-slate-800 bg-transparent group"
                    >
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-all bg-slate-100 group-hover:bg-slate-200 group-hover:text-slate-700">
                            <FaShieldHalved className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-sm">الإدارة</span>
                        <div className="flex items-center gap-2 mr-auto">
                            {pendingDoctorsCount > 0 && (
                                <span className="flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-red-500 text-white text-[11px] font-black shadow-sm">
                                    {pendingDoctorsCount > 99 ? '99+' : pendingDoctorsCount}
                                </span>
                            )}
                            <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full font-bold">Admin</span>
                        </div>
                    </button>
                )}

                {/* Logout Button */}
                <button
                    onClick={() => {
                        setLoadingAction('logout');
                        if (isMobile) setMobileMenuOpen(false);
                        setTimeout(() => onLogout(), 150);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative text-slate-600 hover:bg-slate-100 hover:text-slate-800 bg-transparent group mt-auto"
                >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-all bg-slate-100 group-hover:bg-slate-200 group-hover:text-slate-700">
                        <FaRightFromBracket className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm">تسجيل خروج</span>
                </button>

                {/* Brand logo */}
                <div className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 relative">
                    <BrandLogo className="w-9 h-9 shrink-0" size={36} loading="lazy" glow={false} />
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight">Powered by</p>
                        <p className="text-xs font-black text-slate-700 leading-tight">Dr Hyper</p>
                    </div>
                </div>
            </nav>
        </div >
    );

    return (
        <>
            {/* Loading Overlay */}
            {loadingAction && (
                <div className="fixed inset-0 z-[9999]">
                    <LoadingStateScreen message={loadingAction === 'logout' ? 'جاري تسجيل الخروج' : 'جاري التحميل'} />
                </div>
            )}

            {/* Mobile Header with Hamburger */}
            <div
                className={`md:hidden fixed top-0 right-0 left-0 bg-white border-b border-slate-200 shadow-sm z-[999] no-print transition-transform duration-200 ease-out will-change-transform ${mobileHeaderHidden ? '-translate-y-full' : 'translate-y-0'}`}
            >
                <div className="flex items-center justify-between px-4 py-3">
                    {/* Hamburger Button */}
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                        <FaBars className="w-5 h-5 text-slate-600" />
                    </button>

                    {/* Breadcrumb Navigation / Page Title */}
                    <div className="flex-1 min-w-0 mx-2">
                        {breadcrumbs && onNavigateView ? (
                            <Breadcrumbs segments={breadcrumbs} onNavigateView={onNavigateView} variant="mobile" />
                        ) : (
                            <h1 className="font-black text-slate-800 text-lg text-center truncate">
                                {currentView === 'home' && 'الرئيسية'}
                                {currentView === 'prescription' && 'كشف جديد'}
                                {currentView === 'records' && 'سجلات المرضى'}
                                {currentView === 'patientFiles' && 'ملفات المرضى'}
                                {currentView === 'appointments' && 'المواعيد'}
                                {currentView === 'financialReports' && 'التقارير المالية'}
                                {currentView === 'drugtools' && 'أدوات الأدوية'}
                                {currentView === 'medicationEdit' && 'تعديل الأدوية'}
                                {currentView === 'settings' && 'تصميم الروشتة'}
                                {currentView === 'branchSettings' && 'إعدادات الفروع'}
                                {currentView === 'advertisement' && 'الإعلان'}
                                {currentView === 'secretary' && 'السكرتارية'}
                            </h1>
                        )}
                    </div>

                    {/* User Avatar - Just opens profile */}
                    <button
                        onClick={onShowProfile}
                        className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500"
                    >
                        <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-white">
                            {displayImage ? (
                                <img src={displayImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-white" />
                            )}
                        </div>
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-[990]"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`
          md:hidden fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-[1000] no-print
          transform transition-transform duration-300 ease-out overflow-y-auto
          ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
            >
                {/* Close Button */}
                <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                    <FaXmark className="w-5 h-5 text-slate-600" />
                </button>

                <SidebarContent isMobile={true} />
            </aside>

            {/* Desktop Sidebar */}
            <aside className={`hidden md:flex flex-col w-60 bg-white border-l border-slate-200 shadow-sm no-print fixed right-0 top-0 h-full z-50 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent`}>
                <SidebarContent isMobile={false} />
            </aside>
        </>
    );
};



