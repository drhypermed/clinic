import React, { useEffect, useRef, useState } from 'react';

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

  const navItems = [
    {
      id: 'directory',
      label: 'دليل الأطباء',
      isActive: true,
      onClick: () => {},
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      id: 'bookings',
      label: 'حجوزاتي',
      isActive: false,
      onClick: onOpenBookings,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'account',
      label: 'حسابي',
      isActive: false,
      onClick: onOpenAccount,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: 'join',
      label: 'انضمام كطبيب',
      isActive: false,
      onClick: onJoinAsDoctor,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      id: 'contact',
      label: 'اتصل بنا',
      isActive: false,
      onClick: onContactWhatsApp,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
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
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
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
            <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <h1 className="font-black text-slate-800 text-lg">دليل الأطباء</h1>

          <button
            type="button"
            onClick={onOpenAccount}
            className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-teal-500 via-cyan-500 to-blue-500"
          >
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
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
          <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
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
