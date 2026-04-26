// ─────────────────────────────────────────────────────────────────────────────
// RestrictedAccountsPanel — view موحد لقيود حسابات الأطباء
// ─────────────────────────────────────────────────────────────────────────────
// قبل الدمج: 2 views منفصلة في الـsidebar (entries):
//   - blacklist          → قائمة الحظر للأطباء (إيميلات محظورة من التسجيل)
//   - disabledAccounts   → الأطباء المعطّلين (موقوفين مؤقتاً، قابلين للتفعيل)
//
// بعد الدمج: الـ2 panels في view واحد بـtabs — أنظف للأدمن وأقل تشتيت.
//
// ملاحظة: حظر الجمهور (publicBlacklist) كان هنا قديماً، اتنقل لقسم "إدارة الجمهور"
// عشان يكون بجانب باقي إدارة الجمهور — مش مع حظر الأطباء.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { FaBan, FaUserSlash } from 'react-icons/fa6';
import { BlacklistManagementPanel } from '../blacklist-management/BlacklistManagementPanel';
import { DisabledAccountsPanel } from '../disabled-accounts/DisabledAccountsPanel';

type RestrictedTab = 'doctorBlacklist' | 'doctorDisabled';

interface TabDef {
  id: RestrictedTab;
  label: string;
  shortLabel: string;        // ─ للموبايل (مساحة أقل)
  icon: React.ReactElement;
  description: string;
}

const TABS: readonly TabDef[] = [
  {
    id: 'doctorBlacklist',
    label: 'حظر الأطباء',
    shortLabel: 'حظر أطباء',
    icon: <FaBan className="w-3.5 h-3.5" />,
    description: 'إيميلات أطباء محظورين من التسجيل في النظام',
  },
  {
    id: 'doctorDisabled',
    label: 'الأطباء المعطّلين',
    shortLabel: 'معطّلين',
    icon: <FaUserSlash className="w-3.5 h-3.5" />,
    description: 'حسابات أطباء موقوفة مؤقتاً (قابلة لإعادة التفعيل)',
  },
];

interface RestrictedAccountsPanelProps {
  /** هل المستخدم الحالي أدمن — مُحتفظ به للـAPI compatibility (غير مستخدم داخلياً) */
  isAdminUser: boolean;
  /** بريد الأدمن الحالي — مُحتفظ به للـAPI compatibility */
  adminEmail?: string | null;
}

export const RestrictedAccountsPanel: React.FC<RestrictedAccountsPanelProps> = ({
  isAdminUser: _isAdminUser,
  adminEmail: _adminEmail,
}) => {
  const [activeTab, setActiveTab] = useState<RestrictedTab>('doctorBlacklist');
  const activeTabDef = TABS.find((tab) => tab.id === activeTab) || TABS[0];

  return (
    <div className="space-y-3">
      {/* ─ أزرار الـtabs — 2 tabs (شُيل tab الجمهور) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-2 gap-1 p-1.5 sm:p-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 sm:px-3 sm:py-2.5 text-[11px] sm:text-xs font-bold transition ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                {tab.icon}
                {/* النص الكامل على الديسكتوب، المختصر على الموبايل */}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* وصف الـtab الحالي */}
        <div className="border-t border-slate-100 bg-slate-50/40 px-4 py-2 text-[11px] sm:text-xs text-slate-500">
          {activeTabDef.description}
        </div>
      </div>

      {/* ─ محتوى الـtab — نعرض الـpanel المناسب حسب الاختيار */}
      {activeTab === 'doctorBlacklist' && <BlacklistManagementPanel />}
      {activeTab === 'doctorDisabled' && <DisabledAccountsPanel />}
    </div>
  );
};
