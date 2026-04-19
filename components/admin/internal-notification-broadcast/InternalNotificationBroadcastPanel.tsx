// ─────────────────────────────────────────────────────────────────────────────
// لوحة البث الداخلي (InternalNotificationBroadcastPanel)
// ─────────────────────────────────────────────────────────────────────────────
// نقطة الدخول لإدارة الإشعارات الداخلية (In-App Popup).
// المكون ده مسؤول عن العرض فقط:
//   - نموذج إرسال إشعار جديد
//   - عرض سجل السجلات السابقة (آخر 30 يوم)
// كل المنطق موجود في useInternalNotificationBroadcast (الـ hook).
// بطاقة السجل الواحدة في InternalBroadcastRecordCard.
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
import { InternalBroadcastRecordCard } from './InternalBroadcastRecordCard';
import { useInternalNotificationBroadcast } from './useInternalNotificationBroadcast';

interface InternalNotificationBroadcastPanelProps {
  isAdminUser: boolean;
}

export const InternalNotificationBroadcastPanel: React.FC<InternalNotificationBroadcastPanelProps> = ({
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
  } = useInternalNotificationBroadcast(isAdminUser);

  const displayedRecords = records.slice(0, Math.max(1, visibleCount));
  const remainingRecordsCount = Math.max(0, records.length - displayedRecords.length);

  // حماية: المستخدم لازم يكون أدمن
  if (!isAdminUser) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-xl p-4 text-red-200">
        غير مصرح لك باستخدام صفحة الإشعارات الداخلية.
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* ═════════ قسم: نموذج إرسال إشعار جديد ═════════ */}
      <div className="bg-slate-700 rounded-2xl shadow-xl p-5 sm:p-6 border-t-4 border-emerald-400 dh-stagger-1">
        <h3 className="text-white text-xl sm:text-2xl font-black mb-2">إرسال إشعار داخلي Popup</h3>
        <p className="text-slate-300 text-sm mb-5">
          يظهر كنافذة منبثقة داخل التطبيق بنفس منطق الاستهداف، مع زر إغلاق وحفظ اختيار المستخدم.
        </p>

        <div className="space-y-4">
          {/* حقل العنوان */}
          <div>
            <label className="text-slate-200 text-sm font-bold mb-2 block">عنوان الإشعار</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              placeholder="مثال: تنبيه داخلي مهم"
              className="w-full rounded-xl border border-slate-500 bg-slate-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
              placeholder="اكتب نص الإشعار الداخلي هنا..."
              className="w-full rounded-xl border border-slate-500 bg-slate-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <p className="text-xs text-slate-400 mt-1">{body.length}/1000</p>
          </div>

          {/* اختيار الفئة المستهدفة */}
          <div>
            <label className="text-slate-200 text-sm font-bold mb-2 block">الفئة المستهدفة</label>
            <select
              value={targetAudience}
              onChange={(event) => setTargetAudience(event.target.value as ExternalNotificationAudience)}
              className="w-full rounded-xl border border-slate-500 bg-slate-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
                  className="w-full rounded-xl border border-slate-500 bg-slate-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <p className="text-xs text-slate-400 mt-1">
                  سيتم الاستهداف حسب الحساب المرتبط بهذا البريد الإلكتروني فقط.
                </p>
              </div>

              <div>
                <label className="text-slate-200 text-sm font-bold mb-2 block">نطاق الإرسال داخل الإيميل المخصص</label>
                <select
                  value={customEmailRoleMode}
                  onChange={(event) => setCustomEmailRoleMode(event.target.value as CustomEmailRoleMode)}
                  className="w-full rounded-xl border border-slate-500 bg-slate-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black"
            >
              {sending ? 'جارٍ النشر' : 'نشر الإشعار الداخلي'}
            </button>

            <div className="text-xs sm:text-sm text-slate-300 font-semibold">
              يتم حفظ السجل 30 يوما ثم حذفه تلقائيا.
            </div>
          </div>

          {/* نتيجة تقدير الجمهور (لو اتضغط زر التقدير) */}
          {estimateInfo && (
            <div className="rounded-lg bg-slate-800/60 border border-slate-600 text-slate-200 text-xs sm:text-sm whitespace-pre-line font-semibold px-3 py-2">
              {estimateInfo}
            </div>
          )}

          {/* رسالة النتيجة (نجاح/فشل/معلومة) */}
          {feedback && (
            <div
              className={`rounded-xl border px-3 py-2 text-sm font-bold whitespace-pre-wrap ${
                feedbackType === 'success'
                  ? 'bg-emerald-900/30 border-emerald-500 text-emerald-200'
                  : feedbackType === 'error'
                    ? 'bg-red-900/30 border-red-500 text-red-200'
                    : 'bg-slate-800/70 border-slate-500 text-slate-200'
              }`}
            >
              {feedback}
            </div>
          )}
        </div>
      </div>

      {/* ═════════ قسم: سجل الإشعارات السابقة ═════════ */}
      <div className="bg-slate-700 rounded-2xl shadow-xl p-5 sm:p-6 border-t-4 border-cyan-400 dh-stagger-2">
        <h4 className="text-white text-lg sm:text-xl font-black mb-2">سجل الإشعارات الداخلية (آخر 30 يوم)</h4>
        <p className="text-slate-300 text-sm mb-4">يتم تنظيف السجل تلقائيا ضمن مهام الصيانة اليومية.</p>

        {loadingRecords ? (
          <div className="text-slate-300 text-sm"><LoadingText>جارٍ تحميل السجل</LoadingText></div>
        ) : records.length === 0 ? (
          <div className="text-slate-300 text-sm">لا توجد إشعارات داخلية حاليا.</div>
        ) : (
          <div className="space-y-3">
            {displayedRecords.map((record) => (
              <InternalBroadcastRecordCard
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
