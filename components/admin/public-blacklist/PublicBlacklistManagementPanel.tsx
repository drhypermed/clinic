/**
 * لوحة إدارة قائمة حظر الجمهور (Public Blacklist Management Panel)
 * تتيح للمسؤول إدارة الحسابات المحظورة من فئة الجمهور (المرضى) واستعادة حساباتهم عند الضرورة.
 * 
 * الميزات:
 * 1. عرض قائمة بكافة حسابات الجمهور المحظورة مع سبب الحظر والمسؤول عنه.
 * 2. فك الحظر (Unblock) واستعادة الحساب للعمل في مجموعات البيانات المختلفة.
 * 3. البحث الآلي عن المعرف (ID) للمستخدم عبر البريد إذا كان مفقوداً في سجل الحظر.
 */

import React, { useEffect, useState } from 'react';
import { collection, deleteDoc, deleteField, doc, getDocs, limit, query, setDoc, where } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { getDocsCacheFirst } from '../../../services/firestore/cacheFirst';
import { formatUserDateTime } from '../../../utils/cairoTime';
import { LoadingText } from '../../ui/LoadingText';

type PublicBlacklistItem = {
  id: string;
  email: string;
  reason: string;
  blockedAt: string;
  blockedBy: string;
  publicUserId?: string;
  publicUserName?: string;
  isBlocked?: boolean;
};

type PublicBlacklistManagementPanelProps = {
  isAdminUser: boolean;
  adminEmail?: string | null;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const raw = error instanceof Error ? error.message.toLowerCase() : '';
  if (raw.includes('permission-denied')) return 'لا تملك صلاحية تنفيذ هذا الإجراء.';
  if (raw.includes('unauthenticated')) return 'يجب تسجيل الدخول أولاً.';
  if (raw.includes('unavailable')) return 'الخدمة غير متاحة حالياً، حاول مرة أخرى.';
  return fallback;
};

export const PublicBlacklistManagementPanel: React.FC<PublicBlacklistManagementPanelProps> = ({
  isAdminUser,
  adminEmail,
}) => {
  const [items, setItems] = useState<PublicBlacklistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  /** جلب قائمة الحظر من Firestore عند التحميل أو التحديث */
  useEffect(() => {
    if (!isAdminUser) return;

    const loadPublicBlacklist = async () => {
      setLoading(true);
      setError('');
      try {
        const snap = await getDocsCacheFirst(query(collection(db, 'publicBlacklistedEmails')));
        const rows = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<PublicBlacklistItem, 'id'>) }))
          .filter((row) => row.isBlocked !== false) // تجاهل السجلات التي تم فك حظرها سابقاً
          .sort((a, b) => new Date(b.blockedAt || 0).getTime() - new Date(a.blockedAt || 0).getTime());
        setItems(rows);
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'تعذر تحميل قائمة حظر الجمهور.'));
      } finally {
        setLoading(false);
      }
    };

    void loadPublicBlacklist();
  }, [isAdminUser, refreshKey]);

  /**
   * فك الحظر عن بريد جمهور.
   *
   * ملاحظة مهمة: في معظم الحالات حساب Firebase Auth تم حذفه مسبقاً عند إضافة
   * البريد للـ blacklist (عبر Cloud Function deletePublicAccount). لذلك فك الحظر
   * هنا لا يُعيد الدخول — بل يُزيل المنع، فيصبح المستخدم قادراً على **إعادة
   * التسجيل من الصفر** بنفس البريد كحساب جديد (جمهور أو طبيب).
   */
  const handleUnblock = async (item: PublicBlacklistItem) => {
    if (!isAdminUser) return;

    const confirmUnblock = window.confirm(
      `⚠️ فك حظر بريد جمهور\n\n` +
      `البريد: ${item.email}\n\n` +
      `ماذا يحدث:\n` +
      `• يُحذف البريد من قائمة الحظر\n` +
      `• لو كان هناك وثيقة باقية في users لهذا المستخدم، تُنظَّف أدوارها بالكامل\n\n` +
      `ملاحظة: حساب Firebase Auth قد يكون مُحذفاً مسبقاً (لا يستطيع الدخول بجلسة قديمة).\n` +
      `يجب على صاحب البريد **إعادة التسجيل من جديد** — ليس تسجيل دخول فقط.\n\n` +
      `هل تريد المتابعة؟`
    );
    if (!confirmUnblock) return;

    try {
      const now = new Date().toISOString();
      const normalizedAdmin = String(adminEmail || '').trim().toLowerCase() || 'admin';
      const normalizedEmail = String(item.email || '').trim().toLowerCase();
      let publicUserId = item.publicUserId || '';

      // إذا كان معرف المستخدم مفقوداً، نبحث عنه في مجموعة users الحديثة فقط.
      // (أُزيل الـ fallback على مجموعة 'patients' القديمة — لم تعد موجودة.)
      if (!publicUserId && normalizedEmail) {
        try {
          const byEmail = await getDocs(
            query(collection(db, 'users'), where('email', '==', normalizedEmail), limit(1))
          );
          if (!byEmail.empty) {
            publicUserId = byEmail.docs[0].id;
          }
        } catch {
          // تعذر البحث — نكمل بلا معرف، فك الحظر يحذف الـ blacklist فقط.
        }
      }

      // إذا وجدنا المعرف، نقوم بتحديث حالته لاستعادة الوصول
      if (publicUserId) {
        // نستخدم deleteField بدلاً من false لتنظيف الحساب بالكامل
        // بحيث يصبح حساباً طازجاً (Fresh) لا يصنف כطبيب ولا كجمهور
        const restorePayload = {
          authRole: deleteField(),
          userRole: deleteField(),
          role: deleteField(),
          accountType: deleteField(),
          doctorName: deleteField(),
          doctorEmail: deleteField(),
          doctorSpecialty: deleteField(),
          doctorWhatsApp: deleteField(),
          verificationDocUrl: deleteField(),
          publicProfile: deleteField(),
          isAccountDisabled: deleteField(),
          disabledReason: deleteField(),
          disabledAt: deleteField(),
          verificationStatus: deleteField(),
          deletedAt: deleteField(),
          updatedAt: now,
          unblockedAt: now,
          unblockedBy: normalizedAdmin,
        };

        await setDoc(doc(db, 'users', publicUserId), restorePayload, { merge: true });
      }

      // حذف السجل نهائياً من قائمة الحظر
      await deleteDoc(doc(db, 'publicBlacklistedEmails', item.id));
      
      // تحديث الواجهة فوراً
      setItems((prev) => prev.filter((row) => row.id !== item.id));
      alert('تم فك حظر حساب الجمهور بنجاح.');
    } catch (err: unknown) {
      console.error('Error unblocking public user:', err);
      alert(getErrorMessage(err, 'حدث خطأ أثناء فك الحظر.'));
    }
  };

  if (!isAdminUser) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-xl p-4 text-red-200">
        غير مصرح لك بالوصول إلى قائمة حظر الجمهور.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl shadow-xl p-6 border-t-4 border-red-500 dh-stagger-1">
        <h1 className="text-3xl font-black text-white mb-2">🚫 قائمة حظر الجمهور</h1>
        <p className="text-slate-300">الحسابات الموجودة هنا لا يمكنها تسجيل الدخول حتى يتم فك الحظر.</p>
      </div>

      <div className="bg-slate-700 rounded-2xl shadow-xl overflow-hidden dh-stagger-2">
        <div className="p-6 border-b-2 border-slate-600 flex items-center justify-between">
          <div>
            <h3 className="font-black text-white text-lg">الحسابات المحظورة</h3>
            <p className="text-slate-300 text-sm mt-1">{items.length} حساب محظور</p>
          </div>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-600 text-white hover:bg-slate-500 transition"
          >
            تحديث
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-900/20 border border-red-700 rounded-lg text-red-200 text-sm font-bold">
            {error}
          </div>
        )}

        {loading && <p className="text-slate-300 text-sm p-6"><LoadingText>جاري التحميل</LoadingText></p>}

        {!loading && items.length === 0 && (
          <div className="p-6 text-slate-300 text-sm">لا توجد حسابات جمهور محظورة حالياً.</div>
        )}

        {!loading && items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-600 border-b-2 border-slate-500">
                <tr>
                  <th className="px-6 py-3 text-right text-white font-bold">الإجراء</th>
                  <th className="px-6 py-3 text-right text-white font-bold">الاسم</th>
                  <th className="px-6 py-3 text-right text-white font-bold">البريد</th>
                  <th className="px-6 py-3 text-right text-white font-bold">سبب الحظر</th>
                  <th className="px-6 py-3 text-right text-white font-bold">تاريخ الحظر</th>
                  <th className="px-6 py-3 text-right text-white font-bold">بواسطة</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-600 hover:bg-slate-600/40 transition">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleUnblock(item)}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-all active:scale-95"
                      >
                        🔓 فك الحظر
                      </button>
                    </td>
                    <td className="px-6 py-4 text-white font-bold">{item.publicUserName || 'مستخدم جمهور'}</td>
                    <td className="px-6 py-4 text-slate-200 text-sm">{item.email || '-'}</td>
                    <td className="px-6 py-4 text-slate-200 text-sm">{item.reason || 'بدون سبب'}</td>
                    <td className="px-6 py-4 text-slate-300 text-sm">
                      {item.blockedAt ? formatUserDateTime(item.blockedAt, { dateStyle: 'medium', timeStyle: 'short' }, 'ar-EG') : '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm">{item.blockedBy || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

