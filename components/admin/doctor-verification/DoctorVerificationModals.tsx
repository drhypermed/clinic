// ─────────────────────────────────────────────────────────────────────────────
// مودالات شاشة تحقق الأطباء (DoctorVerificationModals)
// ─────────────────────────────────────────────────────────────────────────────
// مودالين للإجراءات الحساسة:
//   • RejectConfirmModal: تأكيد رفض طبيب واحد (مع عرض سبب الرفض قبل الحذف)
//   • BulkDeleteModal: حذف كل الطلبات المعلقة دفعة واحدة (للاختبار فقط)
//     - يطلب كتابة نص تأكيد يدوي كحماية إضافية
//     - يعرض progress bar أثناء الحذف
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { FaCircleXmark, FaTriangleExclamation } from 'react-icons/fa6';
import { Modal } from '../../ui/Modal';
import { BULK_DELETE_CONFIRM_PHRASE, type RejectConfirmState } from './doctorVerificationHelpers';

interface RejectConfirmModalProps {
  rejectConfirm: RejectConfirmState | null;
  onClose: () => void;
  onConfirm: () => void;
}

/** مودال تأكيد رفض طبيب واحد — يعرض اسم الطبيب والسبب قبل التنفيذ النهائي. */
export const RejectConfirmModal: React.FC<RejectConfirmModalProps> = ({
  rejectConfirm,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal isOpen={!!rejectConfirm} onClose={onClose} title="تأكيد رفض الطبيب">
      {rejectConfirm && (
        <div className="p-5 sm:p-6 space-y-4" dir="rtl">
          {/* تحذير واضح بأن الإجراء غير قابل للتراجع */}
          <div className="rounded-xl bg-red-50 border border-red-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaTriangleExclamation className="w-4 h-4 text-red-500" />
              <p className="text-sm font-black text-red-800">هذا الإجراء لا يمكن التراجع عنه</p>
            </div>
            <p className="text-xs text-red-600 leading-relaxed">
              سيتم حذف حساب <strong>{rejectConfirm.name}</strong> نهائيا وإضافة بريده الإلكتروني إلى قائمة الحظر.
              لن يتمكن من التسجيل مرة أخرى بنفس البريد.
            </p>
          </div>

          {/* عرض السبب اللي هيتبعت للطبيب */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            <p className="text-[11px] font-bold text-slate-500 mb-1">سبب الرفض (يظهر للطبيب):</p>
            <p className="text-sm font-bold text-slate-800">{rejectConfirm.reason}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              إلغاء
            </button>
            <button
              onClick={onConfirm}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-700"
            >
              تأكيد الرفض
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

interface BulkDeleteModalProps {
  isOpen: boolean;
  itemsCount: number;
  confirmText: string;
  running: boolean;
  error: string;
  progress: { done: number; total: number; succeeded: number; failed: number };
  onConfirmTextChange: (value: string) => void;
  onClose: () => void;
  onExecute: () => void;
}

/**
 * مودال الحذف الجماعي — لحذف كل الطلبات المعلقة دفعة واحدة.
 * الاستخدام: تنظيف حسابات اختبار فقط.
 * الحماية:
 *   1) ما يتفتحش إلا لو فيه عناصر
 *   2) يطلب من الأدمن يكتب "حذف الكل" يدوياً
 *   3) يعرض progress bar + عدد نجاح/فشل
 *   4) ما يقفلش المودال تلقائياً إلا لو كل الحذف نجح
 */
export const BulkDeleteModal: React.FC<BulkDeleteModalProps> = ({
  isOpen,
  itemsCount,
  confirmText,
  running,
  error,
  progress,
  onConfirmTextChange,
  onClose,
  onExecute,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { if (!running) onClose(); }}
      title="حذف جميع الطلبات المعلقة"
    >
      <div className="p-5 sm:p-6 space-y-4" dir="rtl">
        {/* تحذير واضح بأن الإجراء خطير */}
        <div className="rounded-xl bg-red-50 border border-red-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <FaTriangleExclamation className="w-4 h-4 text-red-500" />
            <p className="text-sm font-black text-red-800">إجراء خطير لا يمكن التراجع عنه</p>
          </div>
          <p className="text-xs text-red-600 leading-relaxed">
            سيتم حذف <strong>{itemsCount.toLocaleString('ar-EG')}</strong> حساب طبيب معلق نهائياً
            (من Authentication و Firestore و Storage). استخدم هذا الإجراء فقط لتنظيف حسابات الاختبار.
          </p>
        </div>

        {/* شريط التقدم أثناء الحذف */}
        {running && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span>جاري الحذف…</span>
              <span>
                {progress.done.toLocaleString('ar-EG')} / {progress.total.toLocaleString('ar-EG')}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all"
                style={{
                  width: progress.total > 0 ? `${(progress.done / progress.total) * 100}%` : '0%',
                }}
              />
            </div>
            <div className="flex items-center gap-4 text-[11px] font-bold">
              <span className="text-emerald-700">نجح: {progress.succeeded.toLocaleString('ar-EG')}</span>
              <span className="text-red-700">فشل: {progress.failed.toLocaleString('ar-EG')}</span>
            </div>
          </div>
        )}

        {/* حقل نص التأكيد اليدوي (يختفي أثناء الحذف) */}
        {!running && (
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">
              اكتب "{BULK_DELETE_CONFIRM_PHRASE}" للتأكيد:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => onConfirmTextChange(e.target.value)}
              placeholder={BULK_DELETE_CONFIRM_PHRASE}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-800 placeholder-slate-400 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-100"
            />
          </div>
        )}

        {/* رسالة خطأ (مثلاً: نص تأكيد غلط أو فشل حذف بعض الطلبات) */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
            <FaCircleXmark className="w-3 h-3 shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            disabled={running}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            onClick={onExecute}
            disabled={running || confirmText.trim() !== BULK_DELETE_CONFIRM_PHRASE}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {running ? 'جاري الحذف…' : `حذف ${itemsCount.toLocaleString('ar-EG')} حساب`}
          </button>
        </div>
      </div>
    </Modal>
  );
};
