/**
 * مكون الشريط الجانبي (Sidebar):
 * يمثل هذا المكون العصب الرئيسي للتنقل داخل التطبيق.
 * المهام الرئيسية:
 * 1. عرض قائمة التنقل (الرئيسية، الروشتة، السجلات، الخ) مع تنبيهات بأعداد المواعيد.
 * 2. إدارة الواجهة في وضع الهواتف (Mobile Menu) مع ميزة إخفاء الهيدر عند التمرير.
 * 3. عرض بيانات الطبيب (الاسم، الصورة، حالة الاشتراك) وتوفير وصول سريع للملف الشخصي وتسجيل الخروج.
 * 4. إدارة ظهور لوحة التحكم للمديرين (Admin Dashboard) بناءً على صلاحيات المستخدم.
 */

import React, { useEffect, useRef, useState, useTransition } from 'react';
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
import { UserGuideSidebarLink } from '../common/UserGuideSidebarLink';
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

    // ─── Optimistic Active View ─────────────────────────────────────────────
    // الفكرة: لما الطبيب يضغط زر، ميقعدش يستنى لحد ما الصفحة الجديدة تتحمل عشان
    // يشوف الزر active. بنحفظ "الـview المختار" محلياً ونحدّثه فوراً على الضغط
    // (urgent update) قبل ما نطلب من الـparent يحمل الصفحة (transition update).
    const [optimisticView, setOptimisticView] = useState<string>(currentView);
    const [, startTransition] = useTransition();

    // مزامنة العرض المحلي مع التغييرات اللي بتيجي من برّه (مثل breadcrumbs)
    useEffect(() => {
        setOptimisticView(currentView);
    }, [currentView]);
    const { isPro, tier } = usePremiumExpiryCheck(user);
    const isProMax = tier === 'pro_max';
    const pendingDoctorsCount = usePendingDoctorsCount();
    const isAdminUser = useIsAdmin(user);
    const verificationStatus = (user as any)?.verificationStatus;
    // الأدمن verified تلقائياً — عشان البادج (التاج + برو ماكس) يظهر جنب اسمه
    // بدون ما نعتمد على حقل isVerified اللي ممكن يكون ناقص في مستند الأدمن.
    const isAdminVerified = Boolean(isAdminUser || (user as any)?.isVerified || verificationStatus === 'approved');

    // قائمة بنود التنقل — كل البنود لها نفس الاستايل (أزرق متدرج لما تكون active).
    // مفيش استثناءات لون — موحّد بالكامل عشان مفيش تلوّث بصري.
    const navItems: Array<{
        id: ViewType;
        label: string;
        icon: React.ReactElement;
        badge?: number;
    }> = [
        { id: 'home',             label: 'الرئيسية',         icon: <FaHouse className="w-5 h-5" /> },
        { id: 'prescription',     label: 'كشف جديد',          icon: <FaStethoscope className="w-5 h-5" /> },
        { id: 'records',          label: 'سجلات المرضى',     icon: <FaClipboardList className="w-5 h-5" /> },
        { id: 'patientFiles',     label: 'ملفات المرضى',     icon: <FaFolderOpen className="w-5 h-5" /> },
        { id: 'appointments',     label: 'المواعيد',           icon: <FaCalendarCheck className="w-5 h-5" />, badge: todayAppointmentsCount > 0 ? todayAppointmentsCount : undefined },
        { id: 'financialReports', label: 'التقارير المالية',  icon: <FaChartPie className="w-5 h-5" /> },
        { id: 'drugtools',        label: 'أدوات الأدوية',     icon: <FaFlask className="w-5 h-5" /> },
        { id: 'secretary',        label: 'السكرتارية',         icon: <FaKey className="w-5 h-5" /> },
        { id: 'settings',         label: 'تصميم الروشتة',     icon: <FaPaintbrush className="w-5 h-5" /> },
        { id: 'advertisement',    label: 'الإعلان',             icon: <FaBullhorn className="w-5 h-5" /> },
        { id: 'branchSettings',   label: 'إدارة الفروع',       icon: <FaBuilding className="w-5 h-5" /> },
    ];

    const handleNavClick = (viewId: ViewType) => {
        // 1) تحديث فوري للـ Sidebar فقط — الزر يبان active على طول
        setOptimisticView(viewId);
        setMobileMenuOpen(false);
        // 2) تحديث الـ parent (تحميل الصفحة الجديدة) في الخلفية كـ transition،
        //    عشان لو الـ render تقيل ميأخّرش الـ paint بتاع الزر.
        startTransition(() => {
            setCurrentView(viewId);
        });
    };

    // Get display name: prefer doctorName from settings, fallback to user info
    const displayName = doctorName || user?.displayName || 'Dr. Hyper';

    // Use the resolved app profile image only, so explicit delete stays blank.
    const displayImage = profileImage;

    // لو الصورة فشلت في التحميل، نرجع نعرض أول حرف من الاسم بدل أيقونه مكسوره.
    // ده state واحد بنستخدمه للنسختين (ديسكتوب وموبايل) عشان أي URL بايظ يبان fallback فورًا.
    const [profileImgFailed, setProfileImgFailed] = useState(false);

    // لما الـURL نفسه يتغير، نعيد تفعيل محاولة التحميل (مش نعلّقه على الفشل السابق).
    useEffect(() => { setProfileImgFailed(false); }, [displayImage]);

    // أول حرف من اسم الحساب — بيتعرض كـ fallback بدل ما نسيب الدائرة بيضاء فاضيه.
    // Array.from عشان نتعامل مع الحروف العربية صح (مش .charAt).
    const initialLetter = (() => {
        const trimmed = (displayName || '').trim();
        if (!trimmed) return 'د';
        return Array.from(trimmed)[0] || 'د';
    })();

    // هل نعرض الصورة فعلاً؟ شرط: فيه URL + الصورة ما فشلتش.
    const showProfileImage = Boolean(displayImage) && !profileImgFailed;

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

    // ملاحظة مهمة: ده render function (مش component جوّه component) عشان يعرّف
    // SidebarContent كمكون متداخل بيخلي React يـ unmount/mount الشجرة كلها
    // كل ما الـ parent يعمل re-render، فبيحصل تأخير في الـ click وحركة متقطعة.
    const renderSidebarContent = (isMobile: boolean) => (
        <div className={`flex flex-col ${isMobile ? 'min-h-full' : 'h-full'}`}>
            {/* User Profile Section - TOP */}
            {/* خلفية الـsection العلوي بـtint أزرق فاتح بدل الأبيض الباهت */}
            <div className={`border-b border-blue-100 bg-gradient-to-b from-blue-50/50 to-transparent flex flex-col items-center shrink-0 p-4`}>
                {/* Profile Image (Read-only, Display)
                    fallback: لو مفيش صورة أو الصورة فشلت، بنعرض أول حرف من الاسم في دايره ملوّنه
                    بدل ما تبقى بيضا فاضيه (أو تطلع كلمة "Profile" من الـalt). */}
                <div className="relative mb-3">
                    {/* حلقة حول الصورة — أزرق متدرج فقط (premium ring) بدل slate الباهت */}
                    <div className={`mx-auto rounded-full p-[3px] bg-gradient-to-tr from-blue-600 via-blue-400 to-blue-300 w-24 h-24 shadow-[0_6px_18px_-4px_rgba(8,112,184,0.45)]`}>
                        <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-white">
                            {showProfileImage ? (
                                <img
                                    src={displayImage}
                                    alt=""
                                    onError={() => setProfileImgFailed(true)}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                /* أيقونة fallback (أول حرف): أزرق متدرج فقط */
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 text-white font-black text-4xl select-none">
                                    {initialLetter}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Doctor Name */}
                <div className="text-center mb-4 w-full flex items-center justify-center gap-1">
                    <p className={`text-base font-black text-slate-800 truncate max-w-[160px]`}>
                        {displayName}
                    </p>
                    {/* شارة التحقق: تاج ذهبي (برو) أو تاج برو ماكس مع Pro Max label + علامة صح */}
                    {isAdminVerified && (
                        isProMax ? (
                            // برو ماكس: تاج ذهبي + علامة صح زرقاء — استثناء دلالي (gold premium)
                            <span className="inline-flex items-center gap-1 shrink-0">
                                <svg className="w-5 h-5 text-[#FF9800] drop-shadow-[0_2px_6px_rgba(255,152,0,0.8)] transition-all duration-300" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                                </svg>
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#FFD54F] via-[#FFB300] to-[#FF8F00] text-white text-[8.5px] font-black tracking-wider shadow-[0_1px_4px_rgba(255,152,0,0.5)] uppercase">
                                    Pro Max
                                </span>
                                {/* علامة صح زرقاء فقط (text-blue-500 بدل brand-500 اللي مش معرف) */}
                                <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                                    <path fill="white" d="M10 15l-3.5-3.5 1.5-1.5L10 12l6-6 1.5 1.5L10 15z" />
                                </svg>
                            </span>
                        ) : isPro ? (
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

                {/* Profile Button — أزرق متدرج خفيف */}
                <button
                    onClick={() => { onShowProfile(); if (isMobile) setMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-l from-blue-600 to-blue-500 text-white border border-blue-400/40 hover:from-blue-700 hover:to-blue-600 shadow-[0_2px_8px_-2px_rgba(37,99,235,0.35)] hover:shadow-[0_4px_12px_-2px_rgba(37,99,235,0.45)] text-sm font-bold mb-2`}
                >
                    <FaCircleUser className="w-4 h-4" />
                    الملف الشخصي
                </button>

            </div>

            {/* Navigation Items */}
            <nav className={`flex-1 flex flex-col p-3 space-y-1.5`}>
                {navItems.map((item) => {
                    // نقرأ من optimisticView (المحلي) عشان الزر يبان active فوراً على الضغط
                    const isActive = optimisticView === item.id ||
                        (item.id === 'drugtools' && optimisticView === 'medicationEdit');

                    // ── ستايل موحد، أخف من قبل ──
                    // الـactive: أزرق متدرج هادي (blue-600→500) بدل (700→500 التقيل) + ظل أخف
                    // الـidle: نص رمادي + hover بـtint أزرق فاتح
                    const activeBg = 'bg-gradient-to-l from-blue-600 to-blue-500 text-white shadow-[0_2px_8px_-2px_rgba(37,99,235,0.4)]';
                    const idleBg = 'text-slate-700 bg-transparent hover:bg-blue-50 hover:text-blue-800';
                    // أيقونة الـactive: شفافية خفيفة على الـgradient عشان تتميّز
                    const activeIconBg = 'bg-white/25 text-white';
                    const idleIconBg = 'bg-blue-50 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700';

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl relative ${isActive ? activeBg : idleBg}`}
                        >
                            <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${isActive ? activeIconBg : idleIconBg}`}>
                                {item.icon}
                            </div>
                            <span className={`text-sm font-bold whitespace-nowrap`}>{item.label}</span>

                            {/* Badge للمواعيد — أحمر متدرج للتنبيه (semantic) */}
                            {item.badge && (
                                <span className={`
                  absolute left-3 top-1/2 -translate-y-1/2 min-w-[22px] h-[22px] px-1.5
                  flex items-center justify-center rounded-full text-[11px] font-black
                  ${isActive
                                        ? 'bg-white text-blue-700'
                                        : 'bg-gradient-to-l from-rose-600 to-rose-500 text-white shadow-sm'
                                    }
                `}>
                                    {item.badge > 99 ? '99+' : item.badge}
                                </span>
                            )}
                        </button>
                    );
                })}

                {/* Admin Dashboard — أزرق متدرج فقط في hover */}
                {isAdminUser && (
                    <button
                        onClick={() => {
                            setLoadingAction('admin');
                            if (isMobile) setMobileMenuOpen(false);
                            setTimeout(() => navigate('/admin'), 150);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl relative text-slate-600 hover:bg-blue-50 hover:text-blue-800 bg-transparent group"
                    >
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-700">
                            <FaShieldHalved className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-sm">الإدارة</span>
                        <div className="flex items-center gap-2 mr-auto">
                            {pendingDoctorsCount > 0 && (
                                /* بادج طلبات معلقة — أحمر متدرج */
                                <span className="flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-gradient-to-l from-rose-600 to-rose-500 text-white text-[11px] font-black shadow-sm">
                                    {pendingDoctorsCount > 99 ? '99+' : pendingDoctorsCount}
                                </span>
                            )}
                            {/* badge "Admin" — أزرق فاتح صلب (مش شفاف) */}
                            <span className="text-xs bg-blue-100 text-blue-800 border border-blue-300 px-2 py-0.5 rounded-full font-bold">Admin</span>
                        </div>
                    </button>
                )}

                {/* دليل الاستخدام — نفس الصفحه اللي برا (/user-guide) بدون تكرار للكود.
                    بنحطه قبل زر تسجيل الخروج عشان يوصله المستخدم في أي وقت. */}
                <div className="mt-auto">
                    <UserGuideSidebarLink
                        variant="doctor"
                        onBeforeNavigate={() => { if (isMobile) setMobileMenuOpen(false); }}
                    />
                </div>

                {/* Logout Button — neutral hover (slate خفيف ميخدش هوية لون لتسجيل الخروج) */}
                <button
                    onClick={() => {
                        setLoadingAction('logout');
                        if (isMobile) setMobileMenuOpen(false);
                        setTimeout(() => onLogout(), 150);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl relative text-slate-600 hover:bg-slate-100 hover:text-slate-800 bg-transparent group"
                >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-100 group-hover:bg-slate-200 group-hover:text-slate-700">
                        <FaRightFromBracket className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm">تسجيل خروج</span>
                </button>

                {/* Brand logo */}
                <div className="w-full flex items-center gap-3 px-3 py-2 rounded-xl relative">
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

            {/* Mobile Header with Hamburger — حدود سفلية بـtint أزرق */}
            <div
                className={`md:hidden fixed top-0 right-0 left-0 bg-white border-b border-blue-100 shadow-sm z-[999] no-print transition-transform duration-200 ease-out will-change-transform ${mobileHeaderHidden ? '-translate-y-full' : 'translate-y-0'}`}
            >
                <div className="flex items-center justify-between px-4 py-3">
                    {/* Hamburger Button — أزرق فاتح بدل slate */}
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200/70 transition-colors"
                    >
                        <FaBars className="w-5 h-5 text-blue-700" />
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

                    {/* User Avatar — حلقة أزرق متدرج فقط (بدل brand→slate→slate المخلوطة) */}
                    <button
                        onClick={onShowProfile}
                        className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-blue-700 via-blue-500 to-blue-300 shadow-[0_2px_8px_-1px_rgba(8,112,184,0.4)]"
                    >
                        <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-white">
                            {showProfileImage ? (
                                <img
                                    src={displayImage}
                                    alt=""
                                    onError={() => setProfileImgFailed(true)}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                /* fallback: أزرق متدرج فقط */
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 text-white font-black text-sm select-none">
                                    {initialLetter}
                                </div>
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
                {/* Close Button — أزرق فاتح بدل slate */}
                <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200/70 transition-colors"
                >
                    <FaXmark className="w-5 h-5 text-blue-700" />
                </button>

                {renderSidebarContent(true)}
            </aside>

            {/* Desktop Sidebar — حدود يسرى أزرق فاتح بدل slate الباهت */}
            <aside className={`hidden md:flex flex-col w-60 bg-white border-l border-blue-100 shadow-[0_0_24px_-8px_rgba(8,112,184,0.15)] no-print fixed right-0 top-0 h-full z-50 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-100 scrollbar-track-transparent`}>
                {renderSidebarContent(false)}
            </aside>
        </>
    );
};



