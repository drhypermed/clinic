// ─────────────────────────────────────────────────────────────────────────────
// بطاقة سجل إشعار داخلي واحد (InternalBroadcastRecordCard)
// ─────────────────────────────────────────────────────────────────────────────
// عرض سجل إشعار داخلي مع:
//   • شارات حالة الإشعار + الفئة المستهدفة + التاريخ
//   • أزرار إعادة الإرسال والحذف
//   • العنوان والنص
//   • إحصائيات التوصيل (أجهزة متوقعة، مطابق، غير مطابق، استبعاد، إلخ)
//
// مفصول عن الـ Panel الرئيسي عشان:
//   1) يختصر حجم ملف الـ panel (من 509 → ~150 سطر).
//   2) ممكن يتستخدم في أي مكان تاني يحتاج يعرض سجلات قديمة.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  formatInternalBroadcastDateTime as formatDateTime,
  getAudienceLabel,
  getCustomEmailRoleModeLabel,
  getStatusDisplay,
  type NotificationBroadcastRecord,
} from './constants';

interface InternalBroadcastRecordCardProps {
  record: NotificationBroadcastRecord;
  /** معرّف السجل الجاري حذفه (لتعطيل الأزرار) */
  deletingRecordId: string;
  /** معرّف السجل الجاري إعادة إرساله (لتعطيل الأزرار) */
  resendingRecordId: string;
  /** هل عملية إرسال جديدة شغالة في نفس الوقت (لتعطيل الأزرار) */
  sending: boolean;
  onResend: (record: NotificationBroadcastRecord) => void;
  onDelete: (record: NotificationBroadcastRecord) => void;
}

export const InternalBroadcastRecordCard: React.FC<InternalBroadcastRecordCardProps> = ({
  record,
  deletingRecordId,
  resendingRecordId,
  sending,
  onResend,
  onDelete,
}) => {
  const status = getStatusDisplay(record.status);
  const isResendingThis = resendingRecordId === record.id;
  const isDeletingThis = deletingRecordId === record.id;
  const isAnyActionInProgress = sending || Boolean(resendingRecordId) || Boolean(deletingRecordId);

  return (
    <div className="rounded-xl border border-slate-500 bg-slate-800/70 p-4">
      {/* شريط الشارات العلوي: الحالة + الفئة + البريد + الوضع + التاريخ */}
      <div className="flex flex-wrap gap-2 text-xs mb-2">
        <span className={`px-2 py-1 rounded-lg border ${status.className}`}>{status.label}</span>
        <span className="px-2 py-1 rounded-lg bg-slate-700 text-slate-100 border border-slate-500">
          {getAudienceLabel(record.targetAudience)}
        </span>
        {record.targetEmailMasked ? (
          <span className="px-2 py-1 rounded-lg bg-slate-700 text-slate-100 border border-slate-500">
            {record.targetEmailMasked}
          </span>
        ) : record.targetEmail ? (
          <span className="px-2 py-1 rounded-lg bg-slate-700 text-slate-100 border border-slate-500">
            {record.targetEmail}
          </span>
        ) : null}
        {record.targetAudience === 'custom' ? (
          <span className="px-2 py-1 rounded-lg bg-slate-700 text-slate-100 border border-slate-500">
            {getCustomEmailRoleModeLabel(record.customEmailRoleMode)}
          </span>
        ) : null}
        <span className="px-2 py-1 rounded-lg bg-slate-700 text-slate-100 border border-slate-500">
          {formatDateTime(record.createdAt)}
        </span>
      </div>

      {/* أزرار الإجراءات */}
      <div className="mb-3 flex flex-wrap gap-2">
        <button
          onClick={() => onResend(record)}
          disabled={isResendingThis || sending || isDeletingThis}
          className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white text-xs font-black"
        >
          {isResendingThis ? 'جارٍ إعادة النشر' : 'إعادة إرسال'}
        </button>
        <button
          onClick={() => onDelete(record)}
          disabled={isDeletingThis || sending || isResendingThis}
          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-black"
        >
          {isDeletingThis ? 'جارٍ الحذف' : '🗑️ حذف نهائي'}
        </button>
      </div>

      {/* محتوى الإشعار */}
      <h5 className="text-white font-black text-sm sm:text-base">{record.title}</h5>
      <p className="text-slate-200 text-sm mt-1 whitespace-pre-wrap">{record.body}</p>

      {/* إحصائيات التوصيل */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs sm:text-sm">
        <div className="rounded-lg bg-slate-700/70 border border-slate-500 px-3 py-2 text-slate-100">
          أجهزة متوقعة: <span className="font-black">{record.tokenCount}</span>
        </div>
        <div className="rounded-lg bg-emerald-900/25 border border-emerald-500 px-3 py-2 text-emerald-200">
          مطابق: <span className="font-black">{record.successCount}</span>
        </div>
        <div className="rounded-lg bg-red-900/25 border border-red-500 px-3 py-2 text-red-200">
          غير مطابق: <span className="font-black">{record.failureCount}</span>
        </div>
        <div className="rounded-lg bg-amber-900/25 border border-amber-500 px-3 py-2 text-amber-200">
          دفعات فاشلة: <span className="font-black">{record.failedBatchesCount}</span>
        </div>
        <div className="rounded-lg bg-purple-900/25 border border-purple-500 px-3 py-2 text-purple-200 sm:col-span-2">
          استبعاد تداخل: <span className="font-black">{record.excludedDueToOverlapCount}</span>
        </div>
        <div className="rounded-lg bg-sky-900/25 border border-sky-500 px-3 py-2 text-sky-200 sm:col-span-2">
          مستخدمون مطابقون: <span className="font-black">{record.matchedUserIdsCount}</span>
        </div>
      </div>

      {/* بيانات إضافية: المُنشئ ونتيجة الخادم */}
      <div className="mt-3 text-xs text-slate-400 space-y-1">
        <p>بواسطة: {record.createdBy || '-'}</p>
        {record.resultText ? <p>النتيجة: {record.resultText}</p> : null}
      </div>
    </div>
  );
};
