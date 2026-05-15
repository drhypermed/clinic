/**
 * قسم إعادة تصفير البيانات المالية (Reset Financial Data)
 * ───────────────────────────────────────────────────────────────────
 * بيتيح للأدمن مسح كل بيانات الإيرادات والمصروفات (للبدء من جديد):
 *   1) مسح subscriptionHistory[] من كل الأطباء (بيمسح كل الترقيات السابقة)
 *   2) مسح كل المصروفات الشهرية (expenses/*)
 *   3) (اختياري) مسح أسعار الاشتراكات التاريخية (subscriptionPrices/*)
 *   4) تصفير الإحصائيات في settings/adminDashboardStats
 *
 * ⚠️ عملية حذف ضخمة وغير قابلة للتراجع — بنطلب تأكيد مزدوج (نص confirmation).
 */

import React, { useState } from 'react';
import {
  collection, doc, getDocs, updateDoc, deleteDoc, setDoc, writeBatch, query,
} from 'firebase/firestore';
import { FaTrashCan, FaTriangleExclamation, FaCircleCheck, FaCircleXmark } from 'react-icons/fa6';
import { db } from '../../../services/firebaseConfig';
import { getDoctorUsersQuery } from '../../../services/firestore/profileRoles';
import { LoadingText } from '../../ui/LoadingText';

// النص اللي الأدمن لازم يكتبه عشان يأكد العملية (حماية ضد الضغط بالغلط)
const CONFIRMATION_TEXT = 'تصفير';

interface ResetOptions {
  /** مسح subscriptionHistory[] من كل الأطباء — الإيرادات هترجع صفر */
  clearSubscriptionHistory: boolean;
  /** مسح كل المصروفات (expenses/*) */
  clearExpenses: boolean;
  /** مسح أسعار الاشتراكات التاريخية (subscriptionPrices/*) — افتراضياً off */
  clearSubscriptionPrices: boolean;
  /** تصفير totals في settings/adminDashboardStats */
  resetDashboardStats: boolean;
}

interface ResetProgress {
  doctorsUpdated: number;
  totalDoctors: number;
  expensesDeleted: number;
  pricesDeleted: number;
  statsReset: boolean;
}

const DEFAULT_OPTIONS: ResetOptions = {
  clearSubscriptionHistory: true,
  clearExpenses: true,
  clearSubscriptionPrices: false, // off by default — الأسعار اعتبارها config
  resetDashboardStats: true,
};

export const ResetFinancialDataSection: React.FC<{ onResetComplete?: () => void }> = ({
  onResetComplete,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [options, setOptions] = useState<ResetOptions>(DEFAULT_OPTIONS);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<ResetProgress | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const canConfirm =
    confirmText.trim() === CONFIRMATION_TEXT &&
    !running &&
    (
      options.clearSubscriptionHistory ||
      options.clearExpenses ||
      options.clearSubscriptionPrices ||
      options.resetDashboardStats
    );

  const handleReset = async () => {
    if (!canConfirm) return;

    // تأكيد إضافي عبر window.confirm — حماية مضاعفة لعملية الحذف
    if (!window.confirm(
      '⚠️ تأكيد أخير:\n\n' +
      'هذه العملية ستحذف بيانات مالية بشكل نهائي. لا يمكن التراجع.\n\n' +
      'هل أنت متأكد؟',
    )) return;

    setRunning(true);
    setFeedback(null);
    setProgress({
      doctorsUpdated: 0,
      totalDoctors: 0,
      expensesDeleted: 0,
      pricesDeleted: 0,
      statsReset: false,
    });

    try {
      // ─── 1) مسح subscriptionHistory من الأطباء ───
      if (options.clearSubscriptionHistory) {
        const doctorsSnap = await getDocs(getDoctorUsersQuery());
        setProgress((prev) => prev ? { ...prev, totalDoctors: doctorsSnap.size } : prev);

        // batch writes (500 كحد أقصى لكل batch في Firestore)
        const docs = doctorsSnap.docs;
        for (let i = 0; i < docs.length; i += 400) {
          const batch = writeBatch(db);
          const chunk = docs.slice(i, i + 400);
          chunk.forEach((d) => {
            batch.update(d.ref, { subscriptionHistory: [] });
          });
          await batch.commit();
          setProgress((prev) => prev ? { ...prev, doctorsUpdated: i + chunk.length } : prev);
        }
      }

      // ─── 2) مسح كل المصروفات ───
      if (options.clearExpenses) {
        const expensesSnap = await getDocs(query(collection(db, 'expenses')));
        const docs = expensesSnap.docs;
        for (let i = 0; i < docs.length; i += 400) {
          const batch = writeBatch(db);
          const chunk = docs.slice(i, i + 400);
          chunk.forEach((d) => batch.delete(d.ref));
          await batch.commit();
          setProgress((prev) => prev ? { ...prev, expensesDeleted: i + chunk.length } : prev);
        }
      }

      // ─── 3) مسح subscriptionPrices (اختياري) ───
      if (options.clearSubscriptionPrices) {
        const pricesSnap = await getDocs(query(collection(db, 'subscriptionPrices')));
        const docs = pricesSnap.docs;
        for (let i = 0; i < docs.length; i += 400) {
          const batch = writeBatch(db);
          const chunk = docs.slice(i, i + 400);
          chunk.forEach((d) => batch.delete(d.ref));
          await batch.commit();
          setProgress((prev) => prev ? { ...prev, pricesDeleted: i + chunk.length } : prev);
        }
      }

      // ─── 4) تصفير adminDashboardStats ───
      if (options.resetDashboardStats) {
        await setDoc(
          doc(db, 'settings', 'adminDashboardStats'),
          {
            totalRevenue: 0,
            monthlyPlansCount: 0,
            sixMonthsPlansCount: 0,
            yearlyPlansCount: 0,
            proMaxMonthlyPlansCount: 0,
            proMaxSixMonthsPlansCount: 0,
            proMaxYearlyPlansCount: 0,
            proMaxRevenue: 0,
            updatedAt: new Date().toISOString(),
            resetAt: new Date().toISOString(),
          },
          { merge: true },
        );
        setProgress((prev) => prev ? { ...prev, statsReset: true } : prev);
      }

      setFeedback({ type: 'success', message: '✅ تم تصفير البيانات المالية بنجاح. حدّث الصفحة لرؤية النتيجة.' });
      setConfirmText('');
      onResetComplete?.();
    } catch (error) {
      console.error('[ResetFinancialDataSection] reset failed:', error);
      const message = error instanceof Error ? error.message : 'حدث خطأ غير معروف.';
      setFeedback({ type: 'error', message: `❌ فشل التصفير: ${message}` });
    } finally {
      setRunning(false);
    }
  };

  return (
    <section className="bg-white rounded-2xl border-2 border-danger-300 p-5 sm:p-6 shadow-sm dh-stagger-1">
      <div className="flex items-start gap-3 mb-4">
        <FaTrashCan className="w-5 h-5 text-danger-600 shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          <h3 className="text-danger-900 text-lg sm:text-xl font-black mb-1">
            تصفير البيانات المالية
          </h3>
          <p className="text-danger-800 text-xs sm:text-sm leading-relaxed">
            تستخدم هذه العملية للبدء من جديد — تمسح الإيرادات والمصروفات نهائياً ولا يمكن التراجع.
          </p>
        </div>
      </div>

      {/* الخيارات — checkboxes */}
      <div className="space-y-2 mb-4">
        <label className="flex items-start gap-2 rounded-xl bg-danger-50 border border-danger-200 p-3 cursor-pointer hover:bg-danger-100 transition">
          <input
            type="checkbox"
            checked={options.clearSubscriptionHistory}
            onChange={(e) => setOptions((prev) => ({ ...prev, clearSubscriptionHistory: e.target.checked }))}
            disabled={running}
            className="mt-1"
          />
          <div className="flex-1 min-w-0">
            <p className="text-slate-950 text-sm font-black">مسح سجل الاشتراكات للأطباء</p>
            <p className="text-slate-700 text-xs leading-relaxed">
              يحذف <code className="bg-white border border-danger-200 px-1 rounded text-[10px] text-slate-900">subscriptionHistory</code> من كل حسابات الأطباء.
              <br />⚠️ كل الترقيات السابقة لن تُحسب في الإيراد بعد التصفير.
            </p>
          </div>
        </label>

        <label className="flex items-start gap-2 rounded-xl bg-danger-50 border border-danger-200 p-3 cursor-pointer hover:bg-danger-100 transition">
          <input
            type="checkbox"
            checked={options.clearExpenses}
            onChange={(e) => setOptions((prev) => ({ ...prev, clearExpenses: e.target.checked }))}
            disabled={running}
            className="mt-1"
          />
          <div className="flex-1 min-w-0">
            <p className="text-slate-950 text-sm font-black">مسح كل المصروفات الشهرية</p>
            <p className="text-slate-700 text-xs leading-relaxed">
              يحذف كل وثائق <code className="bg-white border border-danger-200 px-1 rounded text-[10px] text-slate-900">expenses/*</code>.
            </p>
          </div>
        </label>

        <label className="flex items-start gap-2 rounded-xl bg-danger-50 border border-danger-200 p-3 cursor-pointer hover:bg-danger-100 transition">
          <input
            type="checkbox"
            checked={options.clearSubscriptionPrices}
            onChange={(e) => setOptions((prev) => ({ ...prev, clearSubscriptionPrices: e.target.checked }))}
            disabled={running}
            className="mt-1"
          />
          <div className="flex-1 min-w-0">
            <p className="text-slate-950 text-sm font-black">مسح جدول الأسعار التاريخية</p>
            <p className="text-slate-700 text-xs leading-relaxed">
              يحذف كل وثائق <code className="bg-white border border-danger-200 px-1 rounded text-[10px] text-slate-900">subscriptionPrices/*</code>.
              <br />⚠️ ينصح ب<strong>عدم</strong> اختياره — الأسعار التاريخية مفيدة للتقارير. اتركها وهتقدر تعدّلها بعدين.
            </p>
          </div>
        </label>

        <label className="flex items-start gap-2 rounded-xl bg-danger-50 border border-danger-200 p-3 cursor-pointer hover:bg-danger-100 transition">
          <input
            type="checkbox"
            checked={options.resetDashboardStats}
            onChange={(e) => setOptions((prev) => ({ ...prev, resetDashboardStats: e.target.checked }))}
            disabled={running}
            className="mt-1"
          />
          <div className="flex-1 min-w-0">
            <p className="text-slate-950 text-sm font-black">تصفير ملخص لوحة الأدمن</p>
            <p className="text-slate-700 text-xs leading-relaxed">
              يضع كل الإيرادات والعدّادات في <code className="bg-white border border-danger-200 px-1 rounded text-[10px] text-slate-900">settings/adminDashboardStats</code> على صفر.
            </p>
          </div>
        </label>
      </div>

      {/* خانة تأكيد بكتابة "تصفير" */}
      <div className="rounded-xl bg-warning-50 border border-warning-300 p-3 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <FaTriangleExclamation className="w-3.5 h-3.5 text-warning-700 shrink-0" />
          <p className="text-warning-800 text-xs font-black">تأكيد العملية</p>
        </div>
        <p className="text-warning-800 text-xs mb-2 leading-relaxed">
          اكتب الكلمة <strong className="font-black">«{CONFIRMATION_TEXT}»</strong> في الخانة لتأكيد العملية:
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          disabled={running}
          placeholder={CONFIRMATION_TEXT}
          className="w-full rounded-lg border-2 border-warning-300 bg-white text-slate-900 px-3 py-2 text-sm font-bold focus:outline-none focus:border-warning-500"
        />
      </div>

      {/* progress أثناء التشغيل */}
      {progress && running && (
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 mb-4 text-xs text-slate-800 space-y-1">
          {options.clearSubscriptionHistory && (
            <p>📋 الأطباء: {progress.doctorsUpdated} / {progress.totalDoctors}</p>
          )}
          {options.clearExpenses && <p>💸 مصروفات محذوفة: {progress.expensesDeleted}</p>}
          {options.clearSubscriptionPrices && <p>💰 أسعار محذوفة: {progress.pricesDeleted}</p>}
          {options.resetDashboardStats && progress.statsReset && <p>📊 ملخص الأدمن: تم التصفير</p>}
        </div>
      )}

      {/* رسالة النتيجة */}
      {feedback && (
        <div
          className={`rounded-xl border-2 px-3 py-2 text-sm font-bold mb-4 shadow-sm ${
            feedback.type === 'success'
              ? 'bg-success-50 border-success-400 text-success-900'
              : 'bg-danger-50 border-danger-400 text-danger-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <FaCircleCheck className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <FaCircleXmark className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        </div>
      )}

      {/* زر التنفيذ */}
      <button
        type="button"
        onClick={handleReset}
        disabled={!canConfirm}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-danger-600 to-danger-700 hover:from-danger-700 hover:to-danger-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-3 text-sm shadow-md transition"
      >
        {running ? (
          <LoadingText>جاري التصفير</LoadingText>
        ) : (
          <>
            <FaTrashCan className="w-3.5 h-3.5" />
            تنفيذ التصفير
          </>
        )}
      </button>
    </section>
  );
};
