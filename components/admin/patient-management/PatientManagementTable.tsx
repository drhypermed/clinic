/**
 * مكون جدول إدارة الجمهور (Patient Management Table)
 *
 * يعرض بيانات المستخدمين (المرضى) في جدول منظم بنفس نمط لوحة الادمن (light theme).
 * الإحصائيات (المواعيد/التقييمات) تُعرض زر "عرض" بدل أرقام مزيفة، وتُجلب عند الضغط فقط (lazy).
 */

import React from 'react';
import { FaUserSlash } from 'react-icons/fa6';
import { LoadingText } from '../../ui/LoadingText';
import { PatientManagementTableProps } from './types';
import { formatUserDate, formatUserTime } from '../../../utils/cairoTime';

export const PatientManagementTable: React.FC<PatientManagementTableProps> = ({
  patients,
  filteredPatients,
  highlightMatch,
  onDisableAccount,
  onEnableAccount,
  onDeletePatient,
  onOpenReviews,
  onLoadStats,
  bookingsLoadingId,
  hasMore,
  loadingMore,
  onLoadMore,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* ── الهيدر بعدد النتائج ── */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 bg-slate-50/60 border-b border-slate-100">
        <h3 className="text-xs sm:text-sm font-black text-slate-800">
          عرض النتائج ({filteredPatients.length.toLocaleString('ar-EG')} من {patients.length.toLocaleString('ar-EG')})
        </h3>
        <p className="text-[10px] font-bold text-slate-400">
          الإحصائيات تُحمّل عند الضغط لتوفير القراءات
        </p>
      </div>

      {filteredPatients.length === 0 ? (
        /* ── empty state ── */
        <div className="flex flex-col items-center justify-center py-14">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 mb-3">
            <FaUserSlash className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-sm font-bold text-slate-400">لا توجد بيانات جمهور</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/40 border-b border-slate-100">
              <tr>
                <th className="px-4 py-2.5 text-right text-[11px] font-bold text-slate-500">الإجراءات</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-bold text-slate-500">الاسم</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-bold text-slate-500">البريد</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-bold text-slate-500">تاريخ الانضمام</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-bold text-slate-500">آخر دخول</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-bold text-slate-500">الإحصائيات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((patient) => {
                const isLoadingStats = bookingsLoadingId === patient.id;
                return (
                  <tr
                    key={patient.id}
                    className={`hover:bg-slate-50/40 transition ${
                      patient.isAccountDisabled ? 'bg-danger-50/40' : ''
                    }`}
                  >
                    {/* أزرار الإجراءات */}
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        {patient.isAccountDisabled ? (
                          <button
                            onClick={() => onEnableAccount(patient.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-success-200 bg-success-50 px-2.5 py-1 text-[10px] font-bold text-success-700 transition hover:bg-success-100 active:scale-95 whitespace-nowrap"
                          >
                            تفعيل
                          </button>
                        ) : (
                          <button
                            onClick={() => onDisableAccount(patient.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-warning-200 bg-warning-50 px-2.5 py-1 text-[10px] font-bold text-warning-700 transition hover:bg-warning-100 active:scale-95 whitespace-nowrap"
                          >
                            تعطيل
                          </button>
                        )}
                        <button
                          onClick={() => onDeletePatient(patient.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-danger-200 bg-danger-50 px-2.5 py-1 text-[10px] font-bold text-danger-700 transition hover:bg-danger-100 active:scale-95 whitespace-nowrap"
                        >
                          حذف
                        </button>
                      </div>
                    </td>

                    {/* الاسم + سبب التعطيل لو معطل */}
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-800 text-sm whitespace-nowrap">
                        {highlightMatch(patient.name)}
                      </span>
                      {patient.isAccountDisabled && (
                        <span className="block text-danger-600 text-[10px] mt-0.5">
                          معطل: {highlightMatch(patient.disabledReason || '')}
                        </span>
                      )}
                    </td>

                    {/* البريد */}
                    <td className="px-4 py-3">
                      <span className="text-slate-600 text-xs">{highlightMatch(patient.email)}</span>
                    </td>

                    {/* تاريخ الانضمام */}
                    <td className="px-4 py-3">
                      <span className="text-slate-500 text-xs whitespace-nowrap">
                        {patient.createdAt ? formatUserDate(patient.createdAt, undefined, 'ar-EG') : '—'}
                      </span>
                    </td>

                    {/* آخر دخول */}
                    <td className="px-4 py-3">
                      <span className="text-slate-500 text-xs whitespace-nowrap">
                        {patient.lastLoginAt
                          ? `${formatUserDate(patient.lastLoginAt, undefined, 'ar-EG')} ${formatUserTime(patient.lastLoginAt, { hour: '2-digit', minute: '2-digit' }, 'ar-EG')}`
                          : 'لم يسجل'}
                      </span>
                    </td>

                    {/* الإحصائيات: لو ما اتجلبتش، نعرض زر "عرض"؛ لو اتجلبت نعرض الأرقام */}
                    <td className="px-4 py-3">
                      {!patient.bookingsLoaded ? (
                        <button
                          onClick={() => onLoadStats(patient.id)}
                          disabled={isLoadingStats}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                        >
                          {isLoadingStats ? <LoadingText>جاري…</LoadingText> : 'عرض الإحصائيات'}
                        </button>
                      ) : (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                            مواعيد: {patient.totalAppointments}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full border border-success-200 bg-success-50 px-2 py-0.5 text-[10px] font-bold text-success-700">
                            مكتمل: {patient.completedAppointments}
                          </span>
                          <button
                            onClick={() => onOpenReviews(patient)}
                            disabled={isLoadingStats}
                            className="inline-flex items-center gap-1 rounded-full border border-warning-200 bg-warning-50 px-2 py-0.5 text-[10px] font-bold text-warning-700 transition hover:bg-warning-100 disabled:opacity-60"
                          >
                            تقييمات: {patient.totalReviews}
                            {patient.totalReviews > 0 && ` (متوسط ${patient.averageRating})`}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* زر "تحميل المزيد" */}
      {hasMore && (
        <div className="flex justify-center p-4 border-t border-slate-100 bg-slate-50/40">
          <button
            type="button"
            onClick={() => { void onLoadMore(); }}
            disabled={loadingMore}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingMore ? <LoadingText>جاري تحميل المزيد</LoadingText> : 'تحميل مزيد من المرضى'}
          </button>
        </div>
      )}
    </div>
  );
};
