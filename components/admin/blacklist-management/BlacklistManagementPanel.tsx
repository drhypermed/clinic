/**
 * الملف: BlacklistManagementPanel.tsx
 * الوصف: "نظام حظر المتطفلين". 
 * يوفر هذا المكون واجهة تحكم كاملة في القائمة السوداء (Blacklist) للنظام: 
 * 1. استعراض الحسابات المحظورة نهائياً من التسجيل (بالبريد الإلكتروني). 
 * 2. توثيق أسباب الحظر والمسؤول الذي قام بذلك لضمان المساءلة. 
 * 3. إمكانية فك الحظر (Unblock) بضغطة زر واحدة لإعادة تفعيل صلاحية التسجيل لبريد معين. 
 * 4. واجهة متجاوبة (Responsive) تعمل بكفاءة على الحواسيب والهواتف لسهولة الإدارة السريعة.
 */

import React, { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, query } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { getDocsCacheFirst } from '../../../services/firestore/cacheFirst';
import { useAuth } from '../../../hooks/useAuth';
import { useIsAdmin } from '../../../hooks/useIsAdmin';
import { formatUserDate, formatUserDateTime } from '../../../utils/cairoTime';
import { LoadingText } from '../../ui/LoadingText';

interface BlacklistedEmail {
  id: string;
  email: string;
  reason: string;
  blockedAt: string;
  blockedBy: string;
  originalDoctorId?: string;
  doctorName?: string;
}

export const BlacklistManagementPanel: React.FC = () => {
  const { user } = useAuth();
  const [blacklist, setBlacklist] = useState<BlacklistedEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const isAdmin = useIsAdmin(user);

  /** تحميل قائمة الحسابات المحظورة من Firestore */
  useEffect(() => {
    if (!isAdmin) return;

    const loadBlacklist = async () => {
      setLoading(true);
      setError('');
      try {
        const snap = await getDocsCacheFirst(query(collection(db, 'blacklistedEmails')));
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<BlacklistedEmail, 'id'>),
        }));
        // ترتيب التنازلي حسب تاريخ الحظر (الأحدث أولاً)
        data.sort((a, b) => new Date(b.blockedAt).getTime() - new Date(a.blockedAt).getTime());
        setBlacklist(data);
      } catch (err: any) {
        setError(err?.message || 'فشل تحميل القائمة السوداء');
      } finally {
        setLoading(false);
      }
    };

    loadBlacklist();
  }, [isAdmin, refreshKey]);

  /** دالة لفك الحظر عن بريد إلكتروني معين */
  const handleUnblock = async (email: string, doctorName?: string) => {
    const confirmMsg = doctorName
      ? `هل أنت متأكد من فك حظر: ${doctorName} (${email})؟\n\nسيتمكن من التسجيل في النظام مجدداً.`
      : `هل أنت متأكد من فك حظر: ${email}؟\n\nسيتمكن من التسجيل في النظام مجدداً.`;

    if (!window.confirm(confirmMsg)) return;

    setError('');
    try {
      // التأكد من استخدام البريد الإلكتروني بأحرف صغيرة للتطابق مع قاعدة البيانات
      const emailLower = email.toLowerCase();
      await deleteDoc(doc(db, 'blacklistedEmails', emailLower));

      // تحديث الواجهة بحذف العنصر من الحالة المحلية
      setBlacklist((prev) => prev.filter((item) => item.email !== emailLower));
      alert('✅ تم فك الحظر بنجاح. يمكن للمستخدم التسجيل الآن.');

      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      console.error('Error unblocking:', err);
      const errorMsg = err?.message || 'فشل فك الحظر';
      setError(errorMsg);
      alert('❌ حدث خطأ أثناء فك الحظر: ' + errorMsg);
    }
  };

  if (!isAdmin) return null;

  return (
    <section className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-between dh-stagger-1">
        <div>
          <h2 className="text-lg font-black text-slate-800">القائمة السوداء</h2>
          <p className="text-xs text-slate-500 mt-1">البريد الإلكتروني المحظور من التسجيل</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-danger-100 text-danger-800">
            {blacklist.length} محظور
          </span>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
          >
            🔄 تحديث
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm font-bold">
          {error}
        </div>
      )}

      {loading && <p className="text-sm text-slate-500 text-center py-4"><LoadingText>جاري التحميل</LoadingText></p>}

      {!loading && blacklist.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-sm font-semibold">لا توجد حسابات محظورة</p>
          <p className="text-xs mt-1">القائمة السوداء فارغة</p>
        </div>
      )}

      {!loading && blacklist.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto dh-stagger-2">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-50">
                  <th className="px-3 py-2 font-bold text-slate-700">البريد الإلكتروني</th>
                  <th className="px-3 py-2 font-bold text-slate-700">الاسم</th>
                  <th className="px-3 py-2 font-bold text-slate-700">سبب الحظر</th>
                  <th className="px-3 py-2 font-bold text-slate-700">تاريخ الحظر</th>
                  <th className="px-3 py-2 font-bold text-slate-700">محظور بواسطة</th>
                  <th className="px-3 py-2 font-bold text-slate-700">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {blacklist.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-3 py-3">
                      <span className="text-xs bg-danger-100 text-danger-700 px-2 py-1 rounded font-mono">
                        {item.email}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-slate-700 font-semibold">{item.doctorName || '-'}</span>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-slate-600 text-xs bg-slate-100 px-2 py-1 rounded max-w-xs">{item.reason}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-slate-500 text-xs">
                        {formatUserDateTime(item.blockedAt, {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        }, 'ar-EG')}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-slate-500 text-xs">{item.blockedBy}</span>
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => handleUnblock(item.email, item.doctorName)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-success-600 text-white hover:bg-success-700 transition"
                      >
                        🔓 فك الحظر
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3 dh-stagger-2">
            {blacklist.map((item) => (
              <div key={item.id} className="border border-slate-200 rounded-xl p-4 space-y-2.5 bg-slate-50">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{item.doctorName || 'بدون اسم'}</p>
                    <p className="text-xs text-danger-600 font-mono mt-0.5 break-all">{item.email}</p>
                  </div>
                  <button
                    onClick={() => handleUnblock(item.email, item.doctorName)}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold bg-success-600 text-white hover:bg-success-700 transition"
                  >
                    🔓 فك الحظر
                  </button>
                </div>
                <div className="bg-white rounded-lg p-2.5 border border-slate-200">
                  <p className="text-xs text-slate-500 mb-0.5 font-bold">سبب الحظر:</p>
                  <p className="text-xs text-slate-700">{item.reason}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {formatUserDate(item.blockedAt, {
                      year: 'numeric', month: 'short', day: 'numeric',
                    }, 'ar-EG')}
                  </span>
                  <span>بواسطة: {item.blockedBy}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && blacklist.length > 0 && (
        <div className="pt-4 border-t border-slate-200">
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
            <p className="text-xs text-warning-800">
              <strong>ملاحظة:</strong> فك الحظر سيسمح للبريد الإلكتروني بالتسجيل في النظام مجدداً.
              تأكد من السبب قبل فك الحظر.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

