import React, { useEffect, useRef, useState } from 'react';
// أيقونات Lucide الحديثه (سُمك خط ناعم، ستايل 2026) — بدون إضافة أي مكتبه جديده
import {
  LuStethoscope,        // دليل الأطباء — سمّاعة طبيب (هويّه طبّيه واضحه)
  LuCalendarCheck,      // حجوزاتي — تقويم بعلامة صح
  LuCircleUserRound,    // حسابي — مستخدم داخل دائره (نسخه حديثه بدل السيلويت القديم)
  LuBriefcaseMedical,   // انضمام كطبيب — شنطه طبّيه
  LuLogOut,             // تسجيل خروج — سهم خروج عصري
  LuMenu,               // فتح القائمه الجانبيه (موبايل)
  LuX,                  // إغلاق القائمه الجانبيه (موبايل)
} from 'react-icons/lu';
import { FaWhatsapp } from 'react-icons/fa6'; // زر "اتصل بنا" = واتساب (الشعار الرسمي بيوضّح الفعل فوراً)

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

  // مصفوفة عناصر التنقّل — كل أيقونه بقت من Lucide (ستايل حديث موحّد + هويّه طبّيه)
  const navItems = [
    {
      id: 'directory',
      label: 'دليل الأطباء',
      isActive: true,
      onClick: () => {},
      // سمّاعه طبيب بدل أيقونة درج الملفّات القديمه
      icon: <LuStethoscope className="w-5 h-5" strokeWidth={2} />,
    },
    {
      id: 'bookings',
      label: 'حجوزاتي',
      isActive: false,
      onClick: onOpenBookings,
      // تقويم مع علامة صح — بيقول "موعد مؤكّد" بشكل مباشر
      icon: <LuCalendarCheck className="w-5 h-5" strokeWidth={2} />,
    },
    {
      id: 'account',
      label: 'حسابي',
      isActive: false,
      onClick: onOpenAccount,
      // مستخدم داخل دائره — شكل 2026 بدل السيلويت القديم
      icon: <LuCircleUserRound className="w-5 h-5" strokeWidth={2} />,
    },
    {
      id: 'join',
      label: 'انضمام كطبيب',
      isActive: false,
      onClick: onJoinAsDoctor,
      // شنطه طبّيه — دلاله مباشره إن الانضمام للأطباء تحديداً
      icon: <LuBriefcaseMedical className="w-5 h-5" strokeWidth={2} />,
    },
    {
      id: 'contact',
      label: 'اتصل بنا',
      isActive: false,
      onClick: onContactWhatsApp,
      // شعار واتساب الرسمي — المستخدم بيعرف الفعل من غير ما يقرأ
      icon: <FaWhatsapp className="w-5 h-5" />,
    },
  ];

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

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleNavClick = (onClick: () => void) => {
    onClick();
    setMobileMenuOpen(false);
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`flex flex-col ${isMobile ? 'min-h-full' : 'h-full'}`}>
      {/* Branding Section */}
      <div className="border-b border-slate-100 flex flex-col items-center shrink-0 p-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg mb-3">
          <span className="text-white font-black text-xl tracking-tight">DH</span>
        </div>

        <p className="text-base font-black text-slate-800 text-center leading-tight">Dr Hyper</p>
        <p className="text-xs font-bold text-slate-500 text-center mt-0.5">دليل الأطباء</p>

        {isLoggedIn && accountName && (
          <div className="mt-3 w-full px-3 py-2 rounded-xl bg-teal-50 border border-teal-100 text-center">
            <p className="text-xs font-bold text-slate-500">مرحباً</p>
            <p className="text-sm font-black text-teal-800 truncate">{accountName}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col p-3 space-y-1.5">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleNavClick(item.onClick)}
            className={`group w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
              item.isActive
                ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg'
                : 'text-slate-600 bg-transparent hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center transition-all ${
              item.isActive
                ? 'bg-teal-500 text-white'
                : 'bg-slate-100 group-hover:bg-slate-200 group-hover:text-slate-700'
            }`}>
              {item.icon}
            </div>
            <span className="text-sm font-bold whitespace-nowrap">{item.label}</span>
          </button>
        ))}

        <div className="flex-1" />

        {/* Logout */}
        {isLoggedIn && (
          <button
            type="button"
            onClick={() => handleNavClick(onLogout)}
            className="group w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-rose-600 hover:bg-rose-50 bg-transparent"
          >
            <div className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center bg-rose-50 group-hover:bg-rose-100 transition-all">
              {/* أيقونه تسجيل خروج Lucide — سهم نظيف بدل السهم القديم */}
              <LuLogOut className="w-5 h-5" strokeWidth={2} />
            </div>
            <span className="text-sm font-bold">تسجيل خروج</span>
          </button>
        )}

        {/* Powered by */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0">
            <span className="text-xs font-black text-slate-400">DH</span>
          </div>
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
      {/* Mobile Header */}
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
            {/* أيقونه القائمه (الثلاث شرطات) — Lucide */}
            <LuMenu className="w-6 h-6 text-slate-600" strokeWidth={2} />
          </button>

          <h1 className="font-black text-slate-800 text-lg">دليل الأطباء</h1>

          <button
            type="button"
            onClick={onOpenAccount}
            // توحيد: شيلت التدرّج التلاثي (teal→cyan→blue) وخلّيته تدرّج العلامه الأساسيّه نفسه
            className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-teal-600 to-cyan-600"
          >
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              {/* أيقونه الحساب للموبايل — نفس شكل قائمه "حسابي" للاتساق */}
              <LuCircleUserRound className="w-5 h-5 text-teal-600" strokeWidth={2} />
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

      {/* Mobile Sidebar */}
      <aside
        className={`
          md:hidden fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-[1000]
          transform transition-transform duration-300 ease-out overflow-y-auto
          ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          {/* زر إغلاق القائمه الجانبيه — X من Lucide */}
          <LuX className="w-5 h-5 text-slate-600" strokeWidth={2} />
        </button>
        <SidebarContent isMobile={true} />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-l border-slate-200 shadow-sm fixed right-0 top-0 h-full z-50 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        <SidebarContent isMobile={false} />
      </aside>
    </>
  );
};
