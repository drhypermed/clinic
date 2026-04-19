/**
 * الملف: PrescriptionSettingsTabs.tsx
 * الوصف: شريط التبويبات العلوي لإعدادات الروشتة.
 * خمسة أقسام: الجزء العلوي، السفلي، الجانبي، المنتصف، وإعدادات الطباعة.
 */

import React from 'react';

export type SettingsTabId = 'header' | 'footer' | 'vitals' | 'middle' | 'print';

interface TabConfig {
    id: SettingsTabId;
    label: string;
    shortLabel: string;
    icon: React.ReactNode;
    gradient: string;
    activeShadow: string;
}

const HeaderIcon = () => (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);
const FooterIcon = () => (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 17h18" />
    </svg>
);
const VitalsIcon = () => (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
);
const MiddleIcon = () => (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);
const PrintIcon = () => (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
);

const TABS: TabConfig[] = [
    {
        id: 'header',
        label: 'الجزء العلوي',
        shortLabel: 'العلوي',
        icon: <HeaderIcon />,
        gradient: 'from-blue-500 to-blue-600',
        activeShadow: 'shadow-blue-200',
    },
    {
        id: 'footer',
        label: 'الجزء السفلي',
        shortLabel: 'السفلي',
        icon: <FooterIcon />,
        gradient: 'from-emerald-500 to-teal-600',
        activeShadow: 'shadow-emerald-200',
    },
    {
        id: 'vitals',
        label: 'الجزء الجانبي',
        shortLabel: 'الجانبي',
        icon: <VitalsIcon />,
        gradient: 'from-rose-500 to-pink-600',
        activeShadow: 'shadow-rose-200',
    },
    {
        id: 'middle',
        label: 'منتصف الروشتة',
        shortLabel: 'الوسط',
        icon: <MiddleIcon />,
        gradient: 'from-violet-500 to-purple-600',
        activeShadow: 'shadow-violet-200',
    },
    {
        id: 'print',
        label: 'إعدادات الطباعة',
        shortLabel: 'الطباعة',
        icon: <PrintIcon />,
        gradient: 'from-amber-500 to-orange-500',
        activeShadow: 'shadow-amber-200',
    },
];

interface PrescriptionSettingsTabsProps {
    activeTab: SettingsTabId;
    onTabChange: (id: SettingsTabId) => void;
}

export const PrescriptionSettingsTabs: React.FC<PrescriptionSettingsTabsProps> = ({ activeTab, onTabChange }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-5">
        {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`
                        relative flex items-center justify-center gap-2 py-3 px-3 rounded-2xl
                        font-bold text-sm transition-all duration-200 select-none
                        ${tab.id === 'print' ? 'col-span-2 sm:col-span-1' : ''}
                        ${isActive
                            ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg ${tab.activeShadow} scale-[1.03]`
                            : 'bg-white text-slate-600 hover:text-slate-800 hover:bg-slate-50 shadow-sm border border-slate-200 hover:border-slate-300 hover:shadow-md'
                        }
                    `}
                >
                    <span className={isActive ? 'text-white' : 'text-slate-500'}>{tab.icon}</span>
                    <span className="hidden md:inline leading-tight">{tab.label}</span>
                    <span className="md:hidden leading-tight">{tab.shortLabel}</span>
                    {isActive && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/60" />
                    )}
                </button>
            );
        })}
    </div>
);
