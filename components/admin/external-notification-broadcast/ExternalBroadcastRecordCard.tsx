// ─────────────────────────────────────────────────────────────────────────────
// بطاقة سجل إشعار خارجي واحد (ExternalBroadcastRecordCard)
// ─────────────────────────────────────────────────────────────────────────────
// عرض سجل إشعار خارجي (Push) مع:
//   • شارات الحالة + الفئة + التاريخ
//   • أزرار إعادة الإرسال والحذف
//   • العنوان والنص
//   • إحصائيات التوصيل (نجح/فشل/استبعاد)
//   • تفاصيل إضافية: المُرسل، وقت الإرسال، retry policy، أسباب الفشل
//
// فرق عن بطاقة البث الداخلي: هنا فيه حقول زيادة زي retryPolicy و failureReasons
// اللي بيتعمل عليها تتبع لو البث الأول فشل.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  formatBroadcastDateTime as formatDateTime,
  formatFailureReasons,
  getAudienceLabel,
  getCustomEmailRoleModeLabel,
  getStatusDisplay,
  type NotificationBroadcastRecord,
} from './constants';

interface ExternalBroadcastRecordCardProps {
  record: NotificationBroadcastRecord;
  deletingRecordId: string;
  resendingRecordId: string;
  sending: boolean;
  onResend: (record: NotificationBroadcastRecord) => void;
  onDelete: (record: NotificationBroadcastRecord) => void;
}

export const ExternalBroadcastRecordCard: React.FC<ExternalBroadcastRecordCardProps> = ({
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

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
      {/* شريط الشارات العلوي */}
      <div className="flex flex-wrap gap-2 text-xs mb-2">
        <span className={`px-2 py-1 rounded-lg border font-bold ${status.className}`}>{status.label}</span>
        <span className="px-2 py-1 rounded-lg bg-white text-slate-900 border border-slate-300 font-bold">
          {getAudienceLabel(record.targetAudience)}
        </span>
        {record.targetEmail ? (
          <span className="px-2 py-1 rounded-lg bg-white text-slate-900 border border-slate-300 font-bold break-all">
            {record.targetEmail}
          </span>
        ) : null}
        {record.targetAudience === 'custom' ? (
          <span className="px-2 py-1 rounded-lg bg-white text-slate-900 border border-slate-300 font-bold">
            {getCustomEmailRoleModeLabel(record.customEmailRoleMode)}
          </span>
        ) : null}
        <span className="px-2 py-1 rounded-lg bg-white text-slate-900 border border-slate-300 font-bold">
          {formatDateTime(record.createdAt)}
        </span>
      </div>

      {/* أزرار الإجراءات */}
      <div className="mb-3 flex flex-wrap gap-2">
        <button
          onClick={() => onResend(record)}
          disabled={isResendingThis || sending || isDeletingThis}
          className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-xs font-black"
        >
          {isResendingThis ? 'جارٍ إعادة الإرسال' : 'إعادة إرسال'}
        </button>
        <button
          onClick={() => onDelete(record)}
          disabled={isDeletingThis || sending || isResendingThis || record.status === 'sending'}
          className="px-3 py-1.5 rounded-lg bg-danger-600 hover:bg-danger-700 disabled:opacity-60 text-white text-xs font-black"
        >
          {isDeletingThis ? 'جارٍ الحذف' : '🗑️ حذف نهائي'}
        </button>
      </div>

      {/* محتوى الإشعار */}
      <h5 className="text-slate-950 font-black text-sm sm:text-base">{record.title}</h5>
      <p className="text-slate-700 text-sm mt-1 whitespace-pre-wrap">{record.body}</p>

      {/* إحصائيات التوصيل */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs sm:text-sm">
        <div className="rounded-lg bg-white border border-slate-200 px-3 py-2 text-slate-800">
          الأجهزة المستهدفة: <span className="font-black">{record.tokenCount}</span>
        </div>
        <div className="rounded-lg bg-success-50 border border-success-200 px-3 py-2 text-success-800">
          نجح: <span className="font-black">{record.successCount}</span>
        </div>
        <div className="rounded-lg bg-danger-50 border border-danger-200 px-3 py-2 text-danger-800">
          فشل: <span className="font-black">{record.failureCount}</span>
        </div>
        <div className="rounded-lg bg-warning-50 border border-warning-200 px-3 py-2 text-warning-800">
          دفعات فاشلة: <span className="font-black">{record.failedBatchesCount}</span>
        </div>
        <div className="rounded-lg bg-white border border-slate-200 px-3 py-2 text-slate-800 sm:col-span-2 lg:col-span-4">
          تم استبعاد بسبب تداخل فئات: <span className="font-black">{record.excludedDueToOverlapCount}</span>
        </div>
      </div>

      {/* معلومات تفصيلية: المُنشئ، وقت الإرسال، retry policy، أسباب الفشل */}
      <div className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 space-y-1">
        <p>بواسطة: {record.createdBy || '-'}</p>
        <p>وقت الإرسال: {formatDateTime(record.sentAt)}</p>
        <p>إعادة الإرسال التلقائي: {record.retryAttempted ? 'تمت' : 'غير مفعلة'} ({record.retryPolicy})</p>
        {record.failureReasons.length > 0 ? (
          <p className="whitespace-pre-wrap">أسباب الفشل:\n{formatFailureReasons(record.failureReasons)}</p>
        ) : null}
        {record.resultText ? <p>النتيجة: {record.resultText}</p> : null}
      </div>
    </div>
  );
};
