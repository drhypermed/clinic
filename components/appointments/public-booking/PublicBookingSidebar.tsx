import React, { useEffect, useRef, useState } from 'react';

export type SecretaryBookingView = 'newBooking' | 'todayAppointments' | 'upcomingAppointments' | 'completedAppointments' | 'publicForm';

interface PublicBookingSidebarProps {
  currentView: SecretaryBookingView;
  onChangeView: (view: SecretaryBookingView) => void;
  secretaryAvatarText: string;
  todayAppointmentsCount?: number;
  upcomingAppointmentsCount?: number;
  onLogout: () => void;
  onOpenProfile: () => void;
}

const navItems: {
  id: SecretaryBookingView;
  label: string;
  icon: React.ReactNode;
  activeGradient: string;
  iconBgActive: string;
  badgeKey?: 'today' | 'upcoming';
}[] = [
  {
    id: 'newBooking',
    label: 'حجز موعد جديد',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
    activeGradient: 'from-teal-600 to-emerald-600',
    iconBgActive: 'bg-teal-500',
  },
  {
    id: 'todayAppointments',
    label: 'مواعيد اليوم',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    activeGradient: 'from-violet-600 to-purple-600',
    iconBgActive: 'bg-violet-500',
    badgeKey: 'today',
  },
  {
    id: 'upcomingAppointments',
    label: 'مواعيد قادمة',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    ),
    activeGradient: 'from-amber-500 to-orange-500',
    iconBgActive: 'bg-amber-500',
    badgeKey: 'upcoming',
  },
  {
    id: 'completedAppointments',
    label: 'المواعيد المنفذة',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    activeGradient: 'from-emerald-600 to-green-600',
    iconBgActive: 'bg-emerald-500',
  },
  {
    id: 'publicForm',
    label: 'فورم الجمهور',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
      </svg>
    ),
    activeGradient: 'from-orange-500 to-red-500',
    iconBgActive: 'bg-orange-500',
  },
];

const viewLabels: Record<SecretaryBookingView, string> = {
  newBooking: 'حجز موعد جديد',
  todayAppointments: 'مواعيد اليوم',
  upcomingAppointments: 'مواعيد قادمة',
  completedAppointments: 'المواعيد المنفذة',
  publicForm: 'فورم الجمهور',
};

export const PublicBookingSidebar: React.FC<PublicBookingSidebarProps> = ({
  currentView,
  onChangeView,
  secretaryAvatarText,
  todayAppointmentsCount = 0,
  upcomingAppointmentsCount = 0,
  onLogout,
  onOpenProfile,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileHeaderHidden, setMobileHeaderHidden] = useState(false);
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);

  const handleNavClick = (viewId: SecretaryBookingView) => {
    onChangeView(viewId);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      window.requestAnimationFrame(() => {
        tickingRef.current = false;
        if (mobileMenuOpen) { setMobileHeaderHidden(false); lastScrollYRef.current = window.scrollY; return; }
        if (window.innerWidth >= 768) { setMobileHeaderHidden(false); lastScrollYRef.current = window.scrollY; return; }
        const currentY = window.scrollY;
        const delta = currentY - lastScrollYRef.current;
        if (currentY < 8) setMobileHeaderHidden(false);
        else if (delta > 12) setMobileHeaderHidden(true);
        else if (delta < -12) setMobileHeaderHidden(false);
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

  const getBadge = (item: typeof navItems[number]) => {
    if (item.badgeKey === 'today' && todayAppointmentsCount > 0) return todayAppointmentsCount;
    if (item.badgeKey === 'upcoming' && upcomingAppointmentsCount > 0) return upcomingAppointmentsCount;
    return undefined;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Profile area — same design as doctor sidebar */}
      <div className="border-b border-slate-100 flex flex-col items-center shrink-0 p-4">
        <div className="relative mb-3">
          <div className="mx-auto rounded-full p-[3px] bg-gradient-to-tr from-slate-300 via-slate-200 to-slate-100 w-20 h-20 shadow-lg">
            <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center text-white font-black text-xl border-2 border-white">
              {secretaryAvatarText}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { onOpenProfile(); setMobileMenuOpen(false); }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white border border-blue-500/60 hover:brightness-105 transition-all text-sm font-bold"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          الملف الشخصي
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col p-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const badge = getBadge(item);
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`group w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative ${
                isActive
                  ? `bg-gradient-to-r ${item.activeGradient} text-white shadow-lg`
                  : 'text-slate-600 bg-transparent hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center transition-all ${
                isActive ? `${item.iconBgActive} text-white` : 'bg-slate-100 group-hover:bg-slate-200 group-hover:text-slate-700'
              }`}>
                {item.icon}
              </div>
              <span className="text-sm font-bold whitespace-nowrap">{item.label}</span>
              {badge !== undefined && (
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 min-w-[22px] h-[22px] px-1.5 flex items-center justify-center rounded-full text-[11px] font-black ${
                  isActive ? 'bg-white/25 text-white' : 'bg-violet-500 text-white'
                }`}>
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="flex-1" />

        {/* Logout */}
        <button
          onClick={onLogout}
          className="group w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <div className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center bg-red-50 group-hover:bg-red-100 transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H9m4 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
            </svg>
          </div>
          <span className="text-sm font-bold">تسجيل الخروج</span>
        </button>
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className={`md:hidden fixed top-0 right-0 left-0 bg-white/95 backdrop-blur border-b border-teal-200 shadow-sm z-[999] transition-transform duration-200 ease-out will-change-transform ${mobileHeaderHidden ? '-translate-y-full' : 'translate-y-0'}`}>
        <div className="flex items-center justify-between px-3 py-2.5">
          <button onClick={() => setMobileMenuOpen(true)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors shrink-0">
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="font-black text-slate-800 text-base text-center truncate flex-1 mx-2">{viewLabels[currentView]}</h1>
          <button onClick={onOpenProfile} className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-cyan-600 text-white flex items-center justify-center font-black text-[10px] border-2 border-white shadow-md shrink-0">
            {secretaryAvatarText}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && <div className="md:hidden fixed inset-0 bg-black/50 z-[990]" onClick={() => setMobileMenuOpen(false)} />}

      {/* Mobile Drawer */}
      <aside className={`md:hidden fixed top-0 right-0 h-full w-[min(18rem,85vw)] bg-white shadow-2xl z-[1000] transform transition-transform duration-300 ease-out overflow-y-auto ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <button onClick={() => setMobileMenuOpen(false)} className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors z-10">
          <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-l border-slate-200 shadow-sm fixed right-0 top-0 h-full z-50 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        <SidebarContent />
      </aside>
    </>
  );
};
