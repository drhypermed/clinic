/**
 * DisabledAccountsPanel — قائمة الحسابات المعطّلة (تظهر تحت "قائمة الحظر" في السايدبار).
 *
 * يعرض كل الأطباء المعطّلين (isAccountDisabled === true) مع سبب التعطيل، تاريخه،
 * ومَن قام به. يسمح بإعادة التفعيل عبر Cloud Function `setDoctorAccountDisabled`
 * التي تنفّذ التعطيل/التفعيل ذرياً على Firebase Auth + Firestore.
 */

import React, { useEffect, useState } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from '../../../services/firebaseConfig';
import { getDocsCacheFirst } from '../../../services/firestore/cacheFirst';
import { useAuth } from '../../../hooks/useAuth';
import { useIsAdmin } from '../../../hooks/useIsAdmin';
import { formatUserDate, formatUserDateTime } from '../../../utils/cairoTime';
import { LoadingText } from '../../ui/LoadingText';

interface DisabledDoctor {
  id: string;
  doctorEmail: string;
  doctorName: string;
  disabledReason: string;
  disabledAt: string;
  disabledBy: string;
}

export const DisabledAccountsPanel: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = useIsAdmin(user);

  const [items, setItems] = useState<DisabledDoctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [enablingId, setEnablingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const snap = await getDocsCacheFirst(
          query(
            collection(db, 'users'),
            where('authRole', '==', 'doctor'),
            where('isAccountDisabled', '==', true),
          ),
        );
        const data: DisabledDoctor[] = snap.docs.map((d) => {
          const raw = d.data() as Record<string, any>;
          return {
            id: d.id,
            doctorEmail: raw?.doctorEmail || raw?.email || '',
            doctorName: raw?.doctorName || raw?.displayName || '',
            disabledReason: raw?.disabledReason || '',
            disabledAt: raw?.disabledAt || '',
            disabledBy: raw?.disabledBy || '',
          };
        });
        data.sort((a, b) => new Date(b.disabledAt || 0).getTime() - new Date(a.disabledAt || 0).getTime());
        setItems(data);
      } catch (err: any) {
        setError(err?.message || 'فشل تحميل قائمة الحسابات المعطّلة');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [isAdmin, refreshKey]);

  const handleEnable = async (doctorId: string, doctorName: string) => {
    const confirmMsg = `هل أنت متأكد من إعادة تفعيل حساب: ${doctorName || doctorId}؟\n\nسيتمكن الطبيب من الدخول فوراً.`;
    if (!window.confirm(confirmMsg)) return;

    setError('');
    setEnablingId(doctorId);
    try {
      if (auth.currentUser) await auth.currentUser.getIdToken(true);
      const setDisabled = httpsCallable(functions, 'setDoctorAccountDisabled');
      await setDisabled({ doctorId, disabled: false });
      setItems((prev) => prev.filter((item) => item.id !== doctorId));
      alert('✅ تم تفعيل الحساب بنجاح.');
    } catch (err: any) {
      const msg = err?.message || 'فشل تفعيل الحساب';
      setError(msg);
      alert('❌ ' + msg);
    } finally {
      setEnablingId(null);
    }
  };

  if (!isAdmin) return null;

  return (
    <section className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-between dh-stagger-1">
        <div>
          <h2 className="text-lg font-black text-slate-800">الحسابات المعطّلة</h2>
          <p className="text-xs text-slate-500 mt-1">حسابات الأطباء الموقوفة مؤقتاً (قابلة لإعادة التفعيل)</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-warning-100 text-warning-800">
            {items.length} معطّل
          </span>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
          >
            🔄 تحديث
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-success-200 bg-success-50/70 px-4 py-3 text-xs font-bold text-success-800">
        🛡️ التعطيل يُنفَّذ على Firebase Auth مباشرة: الطبيب المعطّل لا يستطيع الدخول ولا استخدام أي token قديم — حماية كاملة غير قابلة للاختراق.
      </div>

      {error && (
        <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm font-bold">
          {error}
        </div>
      )}

      {loading && (
        <p className="text-sm text-slate-500 text-center py-4">
          <LoadingText>جاري التحميل</LoadingText>
        </p>
      )}

      {!loading && items.length === 0 && !error && (
        <div className="text-center py-8 text-slate-500">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-sm font-semibold">لا توجد حسابات معطّلة</p>
          <p className="text-xs mt-1">جميع الأطباء المعتمدين نشطون</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto dh-stagger-2">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-50">
                  <th className="px-3 py-2 font-bold text-slate-700">الاسم</th>
                  <th className="px-3 py-2 font-bold text-slate-700">البريد الإلكتروني</th>
                  <th className="px-3 py-2 font-bold text-slate-700">سبب التعطيل</th>
                  <th className="px-3 py-2 font-bold text-slate-700">تاريخ التعطيل</th>
                  <th className="px-3 py-2 font-bold text-slate-700">عُطِّل بواسطة</th>
                  <th className="px-3 py-2 font-bold text-slate-700">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-3 py-3">
                      <span className="text-slate-800 font-semibold">{item.doctorName || '-'}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs bg-warning-100 text-warning-800 px-2 py-1 rounded font-mono">
                        {item.doctorEmail || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-slate-600 text-xs bg-slate-100 px-2 py-1 rounded max-w-xs">
                        {item.disabledReason || '—'}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-slate-500 text-xs">
                        {item.disabledAt
                          ? formatUserDateTime(
                              item.disabledAt,
                              { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
                              'ar-EG',
                            )
                          : '-'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-slate-500 text-xs">{item.disabledBy || '-'}</span>
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => handleEnable(item.id, item.doctorName)}
                        disabled={enablingId === item.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-success-600 text-white hover:bg-success-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {enablingId === item.id ? (
                          <LoadingText>جاري التفعيل</LoadingText>
                        ) : (
                          '🔓 إعادة تفعيل'
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3 dh-stagger-2">
            {items.map((item) => (
              <div key={item.id} className="border border-slate-200 rounded-xl p-4 space-y-2.5 bg-slate-50">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{item.doctorName || 'بدون اسم'}</p>
                    <p className="text-xs text-warning-700 font-mono mt-0.5 break-all">{item.doctorEmail}</p>
                  </div>
                  <button
                    onClick={() => handleEnable(item.id, item.doctorName)}
                    disabled={enablingId === item.id}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold bg-success-600 text-white hover:bg-success-700 transition disabled:opacity-50"
                  >
                    {enablingId === item.id ? '...' : '🔓 تفعيل'}
                  </button>
                </div>
                <div className="bg-white rounded-lg p-2.5 border border-slate-200">
                  <p className="text-xs text-slate-500 mb-0.5 font-bold">سبب التعطيل:</p>
                  <p className="text-xs text-slate-700">{item.disabledReason || '—'}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {item.disabledAt
                      ? formatUserDate(item.disabledAt, { year: 'numeric', month: 'short', day: 'numeric' }, 'ar-EG')
                      : ''}
                  </span>
                  <span>بواسطة: {item.disabledBy || '-'}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
};
