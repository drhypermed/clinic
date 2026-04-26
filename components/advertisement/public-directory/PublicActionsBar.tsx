import React, { useEffect, useRef, useState } from 'react';
// أيقونات FA6 — توحيد مع سايد بار الطبيب (Sidebar.tsx) عشان الجمهور والطبيب يبقوا
// نفس الستايل والـvisual identity بناءً على طلب المالك.
import {
  FaStethoscope,        // دليل الأطباء — نفس أيقونة "كشف جديد" عند الطبيب (هويّه طبّيه)
  FaCalendarCheck,      // حجوزاتي — تقويم بعلامة صح (نفس أيقونة المواعيد عند الطبيب)
  FaCircleUser,         // حسابي + الـavatar في الموبايل (نفس "الملف الشخصي" عند الطبيب)
  FaUserDoctor,         // انضمام كطبيب — أيقونة طبيب
  FaWhatsapp,           // اتصل بنا = واتساب (الشعار الرسمي بيوضّح الفعل فوراً)
  FaRightFromBracket,   // تسجيل خروج (نفس أيقونة الخروج عند الطبيب)
  FaBars, FaXmark,      // فتح/إغلاق قائمة الموبايل
} from 'react-icons/fa6';
import { BrandLogo } from '../../common/BrandLogo';

interface PublicActionsBarProps {
  onOpenAccount: () => void;
  onOpenBookings: () => void;
  onJoinAsDoctor: () => void;
  onContactWhatsApp: () => void;
  onLogout: () => void;
  accountName?: string;
  isLoggedIn?: boolean;
}

export const PublicActionsBar: React.FC<PublicActionsBarProps> = ({
  onOpenAccount,
  onOpenBookings,
  onJoinAsDoctor,
  onContactWhatsApp,
  onLogout,
  accountName,
  isLoggedIn,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileHeaderHidden, setMobileHeaderHidden] = useState(false);
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);

  // أول حرف من الاسم — fallback لو مفيش صوره (نفس منطق سايد بار الطبيب).
  const trimmedName = (accountName || '').trim();
  const initialLetter = (() => {
    if (!trimmedName) return 'م';
    return Array.from(trimmedName)[0] || 'م';
  })();

  const navItems = [
    {
      id: 'directory',
      label: 'دليل الأطباء',
      isActive: true,
      onClick: () => { /* الصفحة الحالية بالفعل */ },
      icon: <FaStethoscope className="w-5 h-5" />,
    },
    {
      id: 'bookings',
      label: 'حجوزاتي',
      isActive: false,
      onClick: onOpenBookings,
      icon: <FaCalendarCheck className="w-5 h-5" />,
    },
    {
      id: 'account',
      label: 'حسابي',
      isActive: false,
      onClick: onOpenAccount,
      icon: <FaCircleUser className="w-5 h-5" />,
    },
    {
      id: 'join',
      label: 'انضمام كطبيب',
      isActive: false,
      onClick: onJoinAsDoctor,
      icon: <FaUserDoctor className="w-5 h-5" />,
    },
    {
      id: 'contact',
      label: 'اتصل بنا',
      isActive: false,
      onClick: onContactWhatsApp,
      icon: <FaWhatsapp className="w-5 h-5" />,
    },
  ];

  // إخفاء هيدر الموبايل أثناء التمرير لأسفل (نفس سلوك سايد بار الطبيب)
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

        if (window.innerWidth >= 768) {
          setMobileHeaderHidden(false);
          lastScrollYRef.current = window.scrollY;
          return;
        }

        const currentY = window.scrollY;
        const delta = currentY - lastScrollYRef.current;
        const threshold = 12;

        if (currentY < 8) setMobileHeaderHidden(false);
        else if (delta > threshold) setMobileHeaderHidden(true);
        else if (delta < -threshold) setMobileHeaderHidden(false);

        lastScrollYRef.current = currentY;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen]);

  // قفل تمرير الصفحة وراء قائمة الموبايل — نفس منطق سايد بار الطبيب
  // (position:fixed لأن overflow:hidden لوحده لا يكفي على iOS Safari).
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

  const handleNavClick = (onClick: () => void) => {
    onClick();
    setMobileMenuOpen(false);
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`flex flex-col ${isMobile ? 'min-h-full' : 'h-full'}`}>
      {/* Header — نفس بنية سايد بار الطبيب: دايره أفاتار + اسم + زر "حسابي".
          البطاقه الـDH اتشالت وبدلت بشعار الموقع المتأنّق (BrandLogo فيه نور بيتحرّك). */}
      <div className="border-b border-slate-100 flex flex-col items-center shrink-0 p-4">
        {/* الـAvatar: لو المستخدم مسجّل → أول حرف من اسمه في دايره زرقا (هويّه الطبيب).
            لو ضيف → شعار الموقع نفسه ليحس المستخدم بالعلامه التجاريّه قبل التسجيل. */}
        <div className="relative mb-3">
          <div className="mx-auto rounded-full p-[3px] bg-gradient-to-tr from-slate-300 via-slate-200 to-slate-100 w-24 h-24 shadow-lg">
            <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-white">
              {isLoggedIn && trimmedName ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-500 to-brand-600 text-white font-black text-4xl select-none">
                  {initialLetter}
                </div>
              ) : (
                // ضيف → شعار Dr Hyper المتألّق نفسه
                <BrandLogo className="w-full h-full" size={96} loading="lazy" glow={false} />
              )}
            </div>
          </div>
        </div>

        {/* "مرحباً" + اسم الحساب — نفس مكان اسم الطبيب في السايد بار الأصلي.
            للضيف: بنعرض اسم العلامه عشان الـheader ميبقاش فاضي. */}
        <div className="text-center mb-4 w-full">
          {isLoggedIn ? (
            <>
              <p className="text-xs font-bold text-slate-500">مرحباً</p>
              <p className="text-base font-black text-slate-800 truncate max-w-[160px] mx-auto">
                {trimmedName || 'مستخدم'}
              </p>
            </>
          ) : (
            <>
              <p className="text-base font-black text-slate-800">Dr Hyper</p>
              <p className="text-xs font-bold text-slate-500 mt-0.5">دليل الأطباء</p>
            </>
          )}
        </div>

        {/* زر "حسابي" — نفس زر "الملف الشخصي" عند الطبيب (blue gradient). */}
        <button
          type="button"
          onClick={() => handleNavClick(onOpenAccount)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 text-white border border-brand-500/60 hover:brightness-105 transition-all text-sm font-bold mb-2"
        >
          <FaCircleUser className="w-4 h-4" />
          حسابي
        </button>
      </div>

      {/* Navigation — Active بـblue gradient مطابق للطبيب (شيلت teal/cyan). */}
      <nav className="flex-1 flex flex-col p-3 space-y-1.5">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleNavClick(item.onClick)}
            className={`group w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
              item.isActive
                ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-lg'
                : 'text-slate-600 bg-transparent hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center transition-all ${
              item.isActive
                ? 'bg-brand-500 text-white'
                : 'bg-slate-100 group-hover:bg-slate-200 group-hover:text-slate-700'
            }`}>
              {item.icon}
            </div>
            <span className="text-sm font-bold whitespace-nowrap">{item.label}</span>
          </button>
        ))}

        {/* تسجيل الخروج — نفس استايل سايد بار الطبيب (slate hover، مش rose). */}
        {isLoggedIn && (
          <button
            type="button"
            onClick={() => handleNavClick(onLogout)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800 bg-transparent group mt-auto"
          >
            <div className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center bg-slate-100 group-hover:bg-slate-200 group-hover:text-slate-700 transition-all">
              <FaRightFromBracket className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold">تسجيل خروج</span>
          </button>
        )}

        {/* Powered by — شعار Dr Hyper الأصلي (نفس الطبيب) بدل البطاقه DH القديمه */}
        <div className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl ${isLoggedIn ? '' : 'mt-auto'}`}>
          <BrandLogo className="w-9 h-9 shrink-0" size={36} loading="lazy" glow={false} />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight">Powered by</p>
            <p className="text-xs font-black text-slate-700 leading-tight">Dr Hyper</p>
          </div>
        </div>
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Header — نفس بنية الطبيب: hamburger يسار، عنوان وسط، avatar شمال */}
      <div
        className={`md:hidden fixed top-0 right-0 left-0 bg-white border-b border-slate-200 shadow-sm z-[999] transition-transform duration-200 ease-out will-change-transform ${
          mobileHeaderHidden ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <FaBars className="w-5 h-5 text-slate-600" />
          </button>

          <h1 className="font-black text-slate-800 text-lg">دليل الأطباء</h1>

          {/* Avatar صغير في موبايل — أول حرف لو مسجّل، وإلا شعار الموقع */}
          <button
            type="button"
            onClick={onOpenAccount}
            className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-brand-500 via-slate-500 to-slate-500"
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-white">
              {isLoggedIn && trimmedName ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-500 to-brand-600 text-white font-black text-sm select-none">
                  {initialLetter}
                </div>
              ) : (
                <BrandLogo className="w-full h-full" size={36} loading="lazy" glow={false} />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-[990]"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar — w-64 زي سايد بار الطبيب (مش w-72 زي القديم) */}
      <aside
        className={`
          md:hidden fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-[1000]
          transform transition-transform duration-300 ease-out overflow-y-auto
          ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <FaXmark className="w-5 h-5 text-slate-600" />
        </button>
        <SidebarContent isMobile={true} />
      </aside>

      {/* Desktop Sidebar — نفس عرض/ستايل سايد بار الطبيب */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-l border-slate-200 shadow-sm fixed right-0 top-0 h-full z-50 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        <SidebarContent isMobile={false} />
      </aside>
    </>
  );
};
