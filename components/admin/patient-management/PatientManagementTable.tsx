/**
 * مكون جدول إدارة الجمهور (Patient Management Table)
 * يعرض بيانات المستخدمين (المرضى) في جدول منظم مع خيارات التحكم في الحسابات.
 */

import React from 'react';
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
  hasMore,
  loadingMore,
  onLoadMore,
}) => {
  return (
    <div className="bg-slate-700 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-6 border-b-2 border-slate-600">
        <h3 className="font-black text-white text-lg">
          عرض النتائج ({filteredPatients.length} من {patients.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-600 border-b-2 border-slate-500">
            <tr>
              <th className="px-6 py-3 text-right text-white font-bold">⚙️ الإجراءات</th>
              <th className="px-6 py-3 text-right text-white font-bold">📂 الاسم</th>
              <th className="px-6 py-3 text-right text-white font-bold">📧 البريد</th>
              <th className="px-6 py-3 text-right text-white font-bold">📆 تاريخ الانضمام</th>
              <th className="px-6 py-3 text-right text-white font-bold">🕒 آخر دخول</th>
              <th className="px-6 py-3 text-right text-white font-bold">📈 إجمالي الحجوزات</th>
              <th className="px-6 py-3 text-right text-white font-bold">📊 حجوزات مؤكدة</th>
              <th className="px-6 py-3 text-right text-white font-bold">💬 التقييمات</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <tr
                  key={patient.id}
                  className={`border-b border-slate-600 hover:bg-slate-600/50 transition ${
                    patient.isAccountDisabled ? 'bg-red-900/20' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex gap-2 flex-wrap">
                      {patient.isAccountDisabled ? (
                        <button
                          onClick={() => onEnableAccount(patient.id)}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-all active:scale-95 whitespace-nowrap"
                        >
                          ✅ تفعيل
                        </button>
                      ) : (
                        <button
                          onClick={() => onDisableAccount(patient.id)}
                          className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg transition-all active:scale-95 whitespace-nowrap"
                        >
                          ⛔ تعطيل
                        </button>
                      )}
                      <button
                        onClick={() => onDeletePatient(patient.id)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all active:scale-95 whitespace-nowrap"
                      >
                        🗑️ حذف الحساب
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-white whitespace-nowrap">{highlightMatch(patient.name)}</span>
                    {patient.isAccountDisabled && (
                      <span className="block text-red-400 text-xs mt-1">🚫 معطل: {highlightMatch(patient.disabledReason || '')}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-300 text-sm">{highlightMatch(patient.email)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-300 border border-slate-600 bg-slate-800 px-2 py-1 rounded text-sm">
                      {patient.createdAt ? formatUserDate(patient.createdAt, undefined, 'ar-EG') : 'غير متوفر'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-300 text-sm">
                      {patient.lastLoginAt
                        ? `${formatUserDate(patient.lastLoginAt, undefined, 'ar-EG')} ${formatUserTime(patient.lastLoginAt, { hour: '2-digit', minute: '2-digit' }, 'ar-EG')}`
                        : 'لم يسجل'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full font-bold">
                      {patient.totalAppointments}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full font-bold">
                      {patient.completedAppointments}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onOpenReviews(patient)}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-all"
                    >
                      🌟 {patient.totalReviews} تقييم (متوسط {patient.averageRating})
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                  لا توجد بيانات جمهور
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="p-6 border-t-2 border-slate-600 bg-slate-700/50 flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-500 text-white font-black rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-3"
          >
            {loadingMore ? (
              <LoadingText>جاري التحميل</LoadingText>
            ) : (
              <>
                <span>⬇️ تحميل المزيد</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
