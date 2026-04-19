import React from 'react';
import type { User } from 'firebase/auth';
import { LoadingText } from '../../ui/LoadingText';
import { AdminListItem } from '../../../types';
import { formatUserDateTime } from '../../../utils/cairoTime';

// يتم حقنهما من vite.config.ts وقت الـ build — يعكسان الإصدار الحقيقي من package.json والتاريخ الفعلي للبناء.
const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';
const BUILD_DATE_ISO = typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : '';

interface SettingsSectionProps {
  user: User;
  newAdminEmail: string;
  adminActionLoading: boolean;
  adminActionMessage: string;
  adminListLoading: boolean;
  adminList: AdminListItem[];
  canManageAdmins: boolean;
  onChangeNewAdminEmail: (value: string) => void;
  onAddAdmin: () => void;
  onRemoveAdmin: (email: string) => void;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  user,
  newAdminEmail,
  adminActionLoading,
  adminActionMessage,
  adminListLoading,
  adminList,
  canManageAdmins,
  onChangeNewAdminEmail,
  onAddAdmin,
  onRemoveAdmin,
}) => {
  const userDisplayName = user.displayName || 'مسؤول النظام';

  return (
    <div className="space-y-4 sm:space-y-5">
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
              <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-sm font-black text-slate-900 sm:text-base">حساب الجلسة الحالية</h3>
          </div>
          <div className="space-y-2">
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
              <p className="text-[11px] font-bold text-slate-400">البريد الإلكتروني</p>
              <p className="mt-0.5 break-all text-sm font-black text-slate-800">{user.email || '-'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
              <p className="text-[11px] font-bold text-slate-400">الاسم</p>
              <p className="mt-0.5 text-sm font-black text-slate-800">{userDisplayName}</p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 border border-amber-100">
              <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-black text-slate-900 sm:text-base">معلومات النظام</h3>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
              <p className="text-[11px] font-bold text-slate-400">إصدار التطبيق</p>
              <p className="mt-0.5 text-sm font-black text-slate-800" dir="ltr">{APP_VERSION}</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
              <p className="text-[11px] font-bold text-slate-400">تاريخ آخر نشر (Build)</p>
              <p className="mt-0.5 text-sm font-black text-slate-800">
                {BUILD_DATE_ISO
                  ? formatUserDateTime(BUILD_DATE_ISO, { dateStyle: 'medium', timeStyle: 'short' }, 'ar-EG')
                  : 'غير معروف'}
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-50 border border-cyan-100">
              <svg className="w-3.5 h-3.5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-black text-slate-900 sm:text-base">إدارة المسؤولين</h3>
          </div>
          <span className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-[11px] font-bold text-cyan-700">
            صلاحيات كاملة
          </span>
        </div>

        <p className="mb-4 text-sm text-slate-500">إضافة أو حذف مسؤولين مع الحفاظ على حماية الأدمن الأساسي.</p>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <input
            type="email"
            value={newAdminEmail}
            onChange={(e) => onChangeNewAdminEmail(e.target.value)}
            placeholder="أدخل بريد الأدمن الجديد"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 outline-none transition"
            disabled={!canManageAdmins}
          />
          <button
            onClick={onAddAdmin}
            disabled={adminActionLoading || !canManageAdmins}
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-black text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            إضافة أدمن
          </button>
        </div>

        {adminActionMessage && (
          <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700">
            {adminActionMessage}
          </div>
        )}

        <div className="mt-4 space-y-2">
          {adminListLoading ? (
            <p className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-3 text-sm text-slate-500"><LoadingText>جاري تحميل قائمة المسؤولين</LoadingText></p>
          ) : (
            adminList.map((admin) => (
              <div
                key={admin.email}
                className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="break-all text-sm font-black text-slate-800">{admin.email}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {admin.isRoot ? 'الأدمن الأساسي' : `مضاف بواسطة: ${admin.addedBy || 'غير معروف'}`}
                  </p>
                </div>

                {!admin.isRoot && (
                  <button
                    onClick={() => onRemoveAdmin(admin.email)}
                    disabled={adminActionLoading || !canManageAdmins}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    حذف الأدمن
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
