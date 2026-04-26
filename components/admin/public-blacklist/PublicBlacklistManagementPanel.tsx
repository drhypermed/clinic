/**
 * لوحة إدارة قائمة حظر الجمهور (Public Blacklist Management Panel)
 *
 * تتيح للمسؤول إدارة حسابات الجمهور المحظورة (المرضى) واستعادتها عند الحاجة.
 *
 * الميزات:
 *   1. عرض قائمة الحسابات المحظورة مع سبب الحظر والمسؤول عنه.
 *   2. فك الحظر وتنظيف وثيقة المستخدم لو لسه موجودة.
 *   3. البحث الآلي عن معرف المستخدم (UID) عبر البريد لو الحقل مفقود في سجل الحظر.
 *
 * تصميم: نفس نمط الألوان (light theme) لباقي لوحة الادمن.
 *
 * إصلاح bug فك الحظر:
 *   كان setDoc بـ merge=true على وثيقة محذوفة = Firestore يعتبرها create.
 *   قواعد users تمنع create للأدمن (تشترط request.auth.uid == userId)، فيرجع permission-denied.
 *   الإصلاح: نتحقق من وجود الوثيقة بـ getDoc الأول. لو موجودة، نستخدم updateDoc.
 *   لو غير موجودة (المريض اتحذف)، نخطّي خطوة تنظيف الأدوار ونكتفي بحذف سجل الحظر.
 */

import React, { useEffect, useState } from 'react';
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { FaBan, FaUnlock, FaArrowsRotate, FaUserSlash } from 'react-icons/fa6';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  // معرّف الصف الذي يجري عليه فك الحظر الآن (لتعطيل زره فقط)
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  /** جلب قائمة الحظر من Firestore عند التحميل أو التحديث */
  useEffect(() => {
    if (!isAdminUser) {
      setLoading(false);
      return;
    }

    const loadPublicBlacklist = async () => {
      setLoading(true);
      setError('');
      try {
        const snap = await getDocsCacheFirst(query(collection(db, 'publicBlacklistedEmails')));
        const rows = snap.docs
          .map((d: any) => ({ id: d.id, ...(d.data() as Omit<PublicBlacklistItem, 'id'>) }))
          .filter((row: PublicBlacklistItem) => row.isBlocked !== false)
          .sort(
            (a: PublicBlacklistItem, b: PublicBlacklistItem) =>
              new Date(b.blockedAt || 0).getTime() - new Date(a.blockedAt || 0).getTime(),
          );
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
   * ملاحظة مهمة: في معظم الحالات حساب Firebase Auth مُحذف مسبقاً عند إضافة البريد للـ blacklist
   * (عبر Cloud Function deletePublicAccount). فك الحظر هنا لا يُعيد الدخول، بل يُزيل المنع
   * فيصبح المستخدم قادراً على إعادة التسجيل من الصفر بنفس البريد.
   */
  const handleUnblock = async (item: PublicBlacklistItem) => {
    if (!isAdminUser) return;

    const confirmUnblock = window.confirm(
      `فك حظر بريد جمهور\n\n` +
        `البريد: ${item.email}\n\n` +
        `ماذا يحدث:\n` +
        `• يُحذف البريد من قائمة الحظر\n` +
        `• لو لسه فيه وثيقة باقية للمستخدم، تُنظَّف أدوارها بالكامل\n\n` +
        `ملاحظة: حساب Firebase Auth قد يكون مُحذفاً مسبقاً.\n` +
        `صاحب البريد سيحتاج لإعادة التسجيل من جديد، وليس مجرد تسجيل دخول.\n\n` +
        `هل تريد المتابعة؟`,
    );
    if (!confirmUnblock) return;

    setUnblockingId(item.id);
    try {
      const now = new Date().toISOString();
      const normalizedAdmin = String(adminEmail || '').trim().toLowerCase() || 'admin';
      const normalizedEmail = String(item.email || '').trim().toLowerCase();
      let publicUserId = item.publicUserId || '';

      // البحث عن معرف المستخدم بالبريد لو لم يكن مخزناً في سجل الحظر
      if (!publicUserId && normalizedEmail) {
        try {
          const byEmail = await getDocs(
            query(collection(db, 'users'), where('email', '==', normalizedEmail), limit(1)),
          );
          if (!byEmail.empty) {
            publicUserId = byEmail.docs[0].id;
          }
        } catch {
          // تعذر البحث — نكمل بلا معرف، فك الحظر يحذف سجل الحظر فقط
        }
      }

      // تنظيف وثيقة المستخدم لو لسه موجودة
      // ⚠️ مهم: نتحقق من وجود الوثيقة الأول. setDoc بـ merge=true على وثيقة محذوفة
      //     يُعتبر create في Firestore، وقواعد users تمنع create للأدمن (تشترط uid مطابق).
      //     لذلك نستخدم updateDoc الذي يعمل فقط على وثائق موجودة (يستخدم update rule).
      if (publicUserId) {
        try {
          const userRef = doc(db, 'users', publicUserId);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            // الوثيقة موجودة (المستخدم معطل لكن لم يُحذف بالكامل) — ننظف أدواره
            await updateDoc(userRef, {
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
            });
          }
          // لو الوثيقة محذوفة (الحالة الأكثر شيوعاً بعد deletePublicAccount)،
          // لا حاجة لتنظيف شيء — نكتفي بحذف سجل الحظر أدناه
        } catch (cleanupErr) {
          // تنظيف الوثيقة فشل — لكن لا نوقف العملية، حذف الـ blacklist هو الأهم
          console.warn('[PublicBlacklist] user doc cleanup failed:', cleanupErr);
        }
      }

      // حذف سجل الحظر نهائياً (الخطوة الأهم — تسمح بإعادة التسجيل بنفس البريد)
      await deleteDoc(doc(db, 'publicBlacklistedEmails', item.id));

      setItems((prev) => prev.filter((row) => row.id !== item.id));
      alert('تم فك حظر حساب الجمهور بنجاح. يقدر صاحب البريد يعيد التسجيل من جديد.');
    } catch (err: unknown) {
      console.error('Error unblocking public user:', err);
      alert(getErrorMessage(err, 'حدث خطأ أثناء فك الحظر.'));
    } finally {
      setUnblockingId(null);
    }
  };

  if (!isAdminUser) {
    return (
      <div className="rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm font-bold text-danger-700">
        غير مصرح لك بالوصول إلى قائمة حظر الجمهور.
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ── الهيدر ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 dh-stagger-1">
        <div>
          <div className="flex items-center gap-2">
            <div className="bg-danger-50 text-danger-600 rounded-lg p-1.5 sm:p-2">
              <FaBan className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <h2 className="text-base sm:text-lg lg:text-xl font-black text-slate-800 tracking-tight">
              قائمة حظر الجمهور
            </h2>
          </div>
          <p className="mt-1 text-[11px] sm:text-xs text-slate-500">
            الحسابات الموجودة هنا لا يمكنها التسجيل بنفس البريد حتى يتم فك الحظر.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-danger-200 bg-danger-50 px-3 py-1.5 text-[10px] sm:text-[11px] font-bold text-danger-700">
            <FaBan className="w-2.5 h-2.5" />
            {items.length.toLocaleString('ar-EG')} محظور
          </span>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[10px] sm:text-[11px] font-bold text-slate-700 transition hover:bg-slate-50"
            title="إعادة تحميل القائمة"
          >
            <FaArrowsRotate className="w-2.5 h-2.5" />
            تحديث
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-bold text-danger-700">
          {error}
        </div>
      )}

      {/* ── الجدول ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden dh-stagger-2">
        <div className="flex items-center justify-between gap-2 px-4 py-3 bg-slate-50/60 border-b border-slate-100">
          <h3 className="text-xs sm:text-sm font-black text-slate-800">الحسابات المحظورة</h3>
        </div>

        {loading ? (
          <div className="p-6 text-center text-sm text-slate-500">
            <LoadingText>جاري التحميل</LoadingText>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 mb-3">
              <FaUserSlash className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-400">لا توجد حسابات جمهور محظورة حالياً</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/40 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold text-slate-500">الإجراء</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold text-slate-500">الاسم</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold text-slate-500">البريد</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold text-slate-500">سبب الحظر</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold text-slate-500">تاريخ الحظر</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold text-slate-500">بواسطة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const isUnblocking = unblockingId === item.id;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/40 transition">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleUnblock(item)}
                          disabled={isUnblocking}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-success-200 bg-success-50 px-2.5 py-1 text-[10px] font-bold text-success-700 transition hover:bg-success-100 active:scale-95 disabled:opacity-60"
                        >
                          <FaUnlock className="w-2.5 h-2.5" />
                          {isUnblocking ? <LoadingText>جاري…</LoadingText> : 'فك الحظر'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-800 text-sm whitespace-nowrap">
                          {item.publicUserName || 'مستخدم جمهور'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-600 text-xs">{item.email || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-600 text-xs">{item.reason || 'بدون سبب'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-500 text-xs whitespace-nowrap">
                          {item.blockedAt
                            ? formatUserDateTime(
                                item.blockedAt,
                                { dateStyle: 'medium', timeStyle: 'short' },
                                'ar-EG',
                              )
                            : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-500 text-xs">{item.blockedBy || '—'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
