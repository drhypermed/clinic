// ─────────────────────────────────────────────────────────────────────────────
// لوحة البث الخارجي (ExternalNotificationBroadcastPanel)
// ─────────────────────────────────────────────────────────────────────────────
// نقطة الدخول لإدارة الإشعارات الخارجية (Push Notifications عبر FCM).
// المكون ده مسؤول عن العرض فقط:
//   - نموذج إرسال إشعار جديد
//   - عرض سجل السجلات السابقة (آخر 30 يوم)
// كل المنطق موجود في useExternalNotificationBroadcast (الـ hook).
// بطاقة السجل الواحدة في ExternalBroadcastRecordCard.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { LoadingText } from '../../ui/LoadingText';
import {
  AUDIENCE_OPTIONS,
  CUSTOM_EMAIL_ROLE_MODE_OPTIONS,
} from './constants';
import type {
  CustomEmailRoleMode,
  ExternalNotificationAudience,
} from '../../../services/externalNotificationBroadcastService';
import { ExternalBroadcastRecordCard } from './ExternalBroadcastRecordCard';
import { useExternalNotificationBroadcast } from './useExternalNotificationBroadcast';

interface ExternalNotificationBroadcastPanelProps {
  isAdminUser: boolean;
}

export const ExternalNotificationBroadcastPanel: React.FC<ExternalNotificationBroadcastPanelProps> = ({
  isAdminUser,
}) => {
  const {
    title, setTitle,
    body, setBody,
    targetAudience, setTargetAudience,
    targetEmail, setTargetEmail,
    customEmailRoleMode, setCustomEmailRoleMode,
    isCustomAudience,
    isFormValid,
    sending,
    estimating,
    estimateInfo,
    feedback,
    feedbackType,
    records,
    loadingRecords,
    visibleCount,
    setVisibleCount,
    deletingRecordId,
    resendingRecordId,
    handleEstimate,
    handleSend,
    handleResendRecord,
    handleDeleteRecord,
  } = useExternalNotificationBroadcast(isAdminUser);

  const displayedRecords = records.slice(0, Math.max(1, visibleCount));
  const remainingRecordsCount = Math.max(0, records.length - displayedRecords.length);

  // حماية: المستخدم لازم يكون أدمن
  if (!isAdminUser) {
    return (
      <div className="bg-danger-900/20 border border-danger-700 rounded-xl p-4 text-danger-200">
        غير مصرح لك باستخدام صفحة إرسال الإشعارات.
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* ═════════ قسم: نموذج إرسال إشعار جديد ═════════ */}
      <div className="bg-slate-700 rounded-2xl shadow-xl p-5 sm:p-6 border-t-4 border-slate-400 dh-stagger-1">
        <h3 className="text-white text-xl sm:text-2xl font-black mb-2">إرسال إشعار خارجي مستهدف</h3>
        <p className="text-slate-300 text-sm mb-5">
          إرسال إشعار Push خارجي فقط للفئة المحددة بدقة. الوضع الافتراضي: الجميع.
        </p>

        <div className="space-y-4">
          {/* حقل العنوان */}
          <div>
            <label className="text-slate-200 text-sm font-bold mb-2 block">عنوان الإشعار</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              placeholder="مثال: تحديث هام في النظام"
              className="w-full rounded-xl border border-slate-500 bg-slate-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <p className="text-xs text-slate-400 mt-1">{title.length}/120</p>
          </div>

          {/* حقل النص */}
          <div>
            <label className="text-slate-200 text-sm font-bold mb-2 block">نص الإشعار</label>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="اكتب نص الإشعار هنا..."
              className="w-full rounded-xl border border-slate-500 bg-slate-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <p className="text-xs text-slate-400 mt-1">{body.length}/1000</p>
          </div>

          {/* اختيار الفئة المستهدفة */}
          <div>
            <label className="text-slate-200 text-sm font-bold mb-2 block">الفئة المستهدفة</label>
            <select
              value={targetAudience}
              onChange={(event) => setTargetAudience(event.target.value as ExternalNotificationAudience)}
              className="w-full rounded-xl border border-slate-500 bg-slate-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              {AUDIENCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* حقول خاصة بفئة "بريد مخصص" */}
          {isCustomAudience ? (
            <>
              <div>
                <label className="text-slate-200 text-sm font-bold mb-2 block">الإيميل المستهدف</label>
                <input
                  value={targetEmail}
                  onChange={(event) => setTargetEmail(event.target.value)}
                  type="email"
                  placeholder="doctor@example.com"
                  className="w-full rounded-xl border border-slate-500 bg-slate-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
                <p className="text-xs text-slate-400 mt-1">
                  سيتم إرسال الإشعار للأجهزة النشطة المرتبطة بهذا البريد فقط.
                </p>
              </div>

              <div>
                <label className="text-slate-200 text-sm font-bold mb-2 block">نطاق الإرسال داخل الإيميل المخصص</label>
                <select
                  value={customEmailRoleMode}
                  onChange={(event) => setCustomEmailRoleMode(event.target.value as CustomEmailRoleMode)}
                  className="w-full rounded-xl border border-slate-500 bg-slate-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  {CUSTOM_EMAIL_ROLE_MODE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  لو الإيميل لحساب جمهور سيتم الإرسال للجمهور طبيعيًا حتى مع اختيار وضع الطبيب/السكرتارية.
                </p>
              </div>
            </>
          ) : null}

          {/* أزرار الإجراءات */}
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={() => { void handleEstimate(); }}
              disabled={estimating || sending}
              className="px-4 py-2.5 rounded-xl border border-slate-500 bg-slate-700 hover:bg-slate-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm"
            >
              {estimating ? 'جارٍ التقدير' : '📊 تقدير الجمهور'}
            </button>

            <button
              onClick={() => { void handleSend(); }}
              disabled={!isFormValid || sending}
              className="px-5 py-2.5 rounded-xl bg-slate-500 hover:bg-slate-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black"
            >
              {sending ? 'جارٍ الإرسال' : 'إرسال الإشعار الآن'}
            </button>

            <div className="text-xs sm:text-sm text-slate-300 font-semibold">
              سيتم حفظ السجل لمدة 30 يوما ثم حذفه تلقائيا ونهائيا.
            </div>
          </div>

          {/* نتيجة تقدير الجمهور */}
          {estimateInfo && (
            <div className="mt-3 p-3 rounded-lg bg-slate-800/60 border border-slate-600 text-slate-200 text-xs sm:text-sm whitespace-pre-line font-semibold">
              {estimateInfo}
            </div>
          )}

          {/* رسالة نتيجة العملية */}
          {feedback && (
            <div
              className={`rounded-xl border px-3 py-2 text-sm font-bold whitespace-pre-wrap ${
                feedbackType === 'success'
                  ? 'bg-success-900/30 border-success-500 text-success-200'
                  : feedbackType === 'error'
                    ? 'bg-danger-900/30 border-danger-500 text-danger-200'
                    : 'bg-slate-800/70 border-slate-500 text-slate-200'
              }`}
            >
              {feedback}
            </div>
          )}
        </div>
      </div>

      {/* ═════════ قسم: سجل الإشعارات السابقة ═════════ */}
      <div className="bg-slate-700 rounded-2xl shadow-xl p-5 sm:p-6 border-t-4 border-brand-400 dh-stagger-2">
        <h4 className="text-white text-lg sm:text-xl font-black mb-2">سجل الإشعارات (آخر 30 يوم)</h4>
        <p className="text-slate-300 text-sm mb-4">يتم حذف السجل القديم تلقائيا عبر مهام الصيانة اليومية.</p>

        {loadingRecords ? (
          <div className="text-slate-300 text-sm"><LoadingText>جارٍ تحميل السجل</LoadingText></div>
        ) : records.length === 0 ? (
          <div className="text-slate-300 text-sm">لا توجد إشعارات مسجلة حاليا.</div>
        ) : (
          <div className="space-y-3">
            {displayedRecords.map((record) => (
              <ExternalBroadcastRecordCard
                key={record.id}
                record={record}
                sending={sending}
                deletingRecordId={deletingRecordId}
                resendingRecordId={resendingRecordId}
                onResend={handleResendRecord}
                onDelete={handleDeleteRecord}
              />
            ))}

            {/* زر "عرض المزيد" لو في سجلات مخفية */}
            {remainingRecordsCount > 0 ? (
              <div className="pt-1">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 5)}
                  className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white text-sm font-black"
                >
                  عرض المزيد (+5) • متبقي {remainingRecordsCount}
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
