// ─────────────────────────────────────────────────────────────────────────────
// مودال تأكيد الإجراءات (ActionConfirmationModal)
// ─────────────────────────────────────────────────────────────────────────────
// يُستخدم لتأكيد الإجراءات الحساسة على حسابات الأطباء:
//   • disable: تعطيل الحساب (يلزم سبب)
//   • enable: تفعيل الحساب (بدون سبب)
//   • delete: حذف نهائي مع حظر البريد (يلزم سبب + تحذير إضافي)
//
// فصلناه في ملف مستقل لأن حجمه كبير (~130 سطر) وبيحتوي على قواعد
// عرض مختلفة لكل نوع إجراء (رسائل، ألوان، حاجة لإدخال سبب).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  FaBan,
  FaCircleCheck,
  FaCircleXmark,
  FaTrashCan,
  FaTriangleExclamation,
} from 'react-icons/fa6';
import { Modal } from '../../ui/Modal';
import { LoadingText } from '../../ui/LoadingText';
import type { ActionModalState } from './types';

/** إعدادات العرض لكل نوع إجراء (عنوان، لون، أيقونة، هل يحتاج سبب). */
const MODAL_CONFIG: Record<string, { title: string; color: string; icon: React.ReactElement; needsReason: boolean }> = {
  disable: { title: 'تعطيل حساب طبيب', color: 'amber', icon: <FaBan className="w-5 h-5 text-amber-600" />, needsReason: true },
  enable: { title: 'تفعيل حساب طبيب', color: 'emerald', icon: <FaCircleCheck className="w-5 h-5 text-emerald-600" />, needsReason: false },
  delete: { title: 'حذف طبيب نهائيا', color: 'red', icon: <FaTrashCan className="w-5 h-5 text-red-600" />, needsReason: true },
};

interface ActionConfirmationModalProps {
  actionModal: ActionModalState | null;
  modalReason: string;
  modalError: string;
  modalSuccess: string;
  actionInProgress: Record<string, boolean>;
  onChangeReason: (reason: string) => void;
  onClose: () => void;
  onExecute: () => void;
}

export const ActionConfirmationModal: React.FC<ActionConfirmationModalProps> = ({
  actionModal,
  modalReason,
  modalError,
  modalSuccess,
  actionInProgress,
  onChangeReason,
  onClose,
  onExecute,
}) => {
  if (!actionModal) {
    return <Modal isOpen={false} onClose={onClose} title=""><></></Modal>;
  }

  const config = MODAL_CONFIG[actionModal.type];

  return (
    <Modal isOpen={!!actionModal} onClose={onClose} title={config?.title || ''}>
      <div className="p-5 sm:p-6 space-y-4" dir="rtl">
        {/* ── معلومات الطبيب المستهدف ── */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          {config?.icon}
          <div>
            <p className="text-sm font-black text-slate-800">{actionModal.doctorName || 'طبيب'}</p>
            <p className="text-xs text-slate-500" dir="ltr">{actionModal.doctorEmail}</p>
          </div>
        </div>

        {/* ── تحذير خاص بالحذف ── */}
        {actionModal.type === 'delete' && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <FaTriangleExclamation className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-xs font-bold text-red-700">
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الحساب نهائيا وحظر البريد.
            </p>
          </div>
        )}

        {/* ── تحذير خاص بالتعطيل ── */}
        {actionModal.type === 'disable' && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <FaTriangleExclamation className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-xs font-bold text-amber-700">
              سيتم تعطيل الحساب. الطبيب لن يستطيع الدخول حتى يتم تفعيله مرة أخرى.
            </p>
          </div>
        )}

        {/* ── حقل السبب (للتعطيل/الحذف فقط) ── */}
        {config?.needsReason && (
          <div>
            <label className="mb-1.5 block text-xs font-black text-slate-600">
              {actionModal.type === 'delete' ? 'سبب الحذف (مطلوب)' : 'سبب التعطيل (مطلوب)'}
            </label>
            <textarea
              value={modalReason}
              onChange={(e) => onChangeReason(e.target.value)}
              placeholder="اكتب السبب هنا..."
              rows={3}
              maxLength={500}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-100 resize-none"
            />
            <p className="mt-1 text-[10px] text-slate-400 text-left" dir="ltr">{modalReason.length}/500</p>
          </div>
        )}

        {/* ── نص تأكيد التفعيل (بدون تحذير/سبب) ── */}
        {actionModal.type === 'enable' && (
          <p className="text-sm text-slate-600">
            هل تريد تفعيل حساب <strong>{actionModal.doctorName}</strong>؟
          </p>
        )}

        {/* ── رسالة خطأ ── */}
        {modalError && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
            <FaCircleXmark className="w-3 h-3 shrink-0" /> {modalError}
          </div>
        )}

        {/* ── رسالة نجاح ── */}
        {modalSuccess && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
            <FaCircleCheck className="w-3 h-3 shrink-0" /> {modalSuccess}
          </div>
        )}

        {/* ── أزرار الإجراء (مخفية بعد النجاح) ── */}
        {!modalSuccess && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              إلغاء
            </button>
            <button
              onClick={onExecute}
              disabled={actionInProgress[actionModal.doctorId]}
              className={`rounded-xl px-4 py-2.5 text-sm font-black text-white transition disabled:opacity-50 disabled:cursor-not-allowed ${
                actionModal.type === 'delete'
                  ? 'bg-red-600 hover:bg-red-700'
                  : actionModal.type === 'disable'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {actionInProgress[actionModal.doctorId] ? (
                <LoadingText>جاري التنفيذ</LoadingText>
              ) : (
                actionModal.type === 'delete' ? 'تأكيد الحذف'
                  : actionModal.type === 'disable' ? 'تأكيد التعطيل'
                    : 'تأكيد التفعيل'
              )}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
