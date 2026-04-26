// ─────────────────────────────────────────────────────────────────────────────
// Hook منطق البث الخارجي (useExternalNotificationBroadcast)
// ─────────────────────────────────────────────────────────────────────────────
// يجمع كل الـ state والإجراءات الخاصة بإرسال إشعار خارجي (Push Notification):
//   • حالة نموذج الإدخال (العنوان، النص، الفئة، البريد المخصص ...)
//   • الاشتراك اللحظي بسجلات آخر 30 يوم من Firestore
//   • تقدير حجم الجمهور قبل الإرسال (handleEstimate)
//   • إرسال الإشعار فعلياً (handleSend) مع تأكيد
//   • إعادة إرسال سجل قديم (handleResendRecord)
//   • حذف سجل نهائياً (handleDeleteRecord)
//
// الفرق عن البث الداخلي: هنا الإشعار بيطلع كـ Push للأجهزة خارج التطبيق
// (عبر FCM)، مع retry تلقائي ورصد أسباب الفشل.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import {
  sendExternalNotificationBroadcast,
  estimateAudienceSize,
  type ExternalNotificationAudience,
  type CustomEmailRoleMode,
  type FailureReasonItem,
} from '../../../services/externalNotificationBroadcastService';
import {
  EMAIL_REGEX,
  formatFailureReasons,
  getAudienceLabel,
  toSafeNumber,
  toSafeString,
  type NotificationBroadcastRecord,
} from './constants';

/** نوع نتيجة الـ feedback للمكون (success/error/info لتحديد الألوان). */
type BroadcastFeedbackType = 'success' | 'error' | 'info';

export const useExternalNotificationBroadcast = (isAdminUser: boolean) => {
  // ── حالة نموذج الإرسال ──
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetAudience, setTargetAudience] = useState<ExternalNotificationAudience>('all');
  const [targetEmail, setTargetEmail] = useState('');
  const [customEmailRoleMode, setCustomEmailRoleMode] = useState<CustomEmailRoleMode>('all_linked');
  const [sending, setSending] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [estimateInfo, setEstimateInfo] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<BroadcastFeedbackType>('info');

  // ── حالة السجلات ──
  const [records, setRecords] = useState<NotificationBroadcastRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [visibleCount, setVisibleCount] = useState(1);
  const [deletingRecordId, setDeletingRecordId] = useState('');
  const [resendingRecordId, setResendingRecordId] = useState('');

  const isCustomAudience = targetAudience === 'custom';

  /** نموذج صحيح إذا: العنوان والنص موجودين، ولو Custom فالبريد صالح. */
  const isFormValid = useMemo(
    () => {
      if (title.trim().length === 0 || body.trim().length === 0) return false;
      if (!isCustomAudience) return true;
      return EMAIL_REGEX.test(targetEmail.trim().toLowerCase());
    },
    [title, body, isCustomAudience, targetEmail]
  );

  // ── الاشتراك اللحظي بالسجلات (آخر 30 يوم، أحدث 100 سجل) ──
  useEffect(() => {
    if (!isAdminUser) {
      setRecords([]);
      setLoadingRecords(false);
      return;
    }

    const cutoffMs = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const recordsQuery = query(
      collection(db, 'externalNotificationBroadcasts'),
      where('createdAtMs', '>=', cutoffMs),
      orderBy('createdAtMs', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      recordsQuery,
      (snapshot) => {
        const nextRecords: NotificationBroadcastRecord[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as Record<string, unknown>;
          return {
            id: docSnap.id,
            status: toSafeString(data.status, 'sent'),
            title: toSafeString(data.title),
            body: toSafeString(data.body),
            targetAudience: toSafeString(data.targetAudience, 'all') as ExternalNotificationAudience,
            targetEmail: toSafeString(data.targetEmail),
            customEmailRoleMode: toSafeString(data.customEmailRoleMode, 'all_linked') as CustomEmailRoleMode,
            createdBy: toSafeString(data.createdBy, '-'),
            createdAt: toSafeString(data.createdAt),
            sentAt: toSafeString(data.sentAt),
            tokenCount: toSafeNumber(data.tokenCount),
            successCount: toSafeNumber(data.successCount),
            failureCount: toSafeNumber(data.failureCount),
            failedBatchesCount: toSafeNumber(data.failedBatchesCount),
            excludedDueToOverlapCount: toSafeNumber(data.excludedDueToOverlapCount),
            retryPolicy: toSafeString(data.retryPolicy, 'no_auto_retry'),
            retryAttempted: Boolean(data.retryAttempted),
            // failureReasons: مصفوفة معقدة — نفك كل عنصر ونحتفظ بالمعرفة فقط
            failureReasons: Array.isArray(data.failureReasons)
              ? (data.failureReasons
                  .map((item) => ({
                    code: toSafeString((item as FailureReasonItem)?.code),
                    count: toSafeNumber((item as FailureReasonItem)?.count),
                    message: toSafeString((item as FailureReasonItem)?.message),
                  }))
                  .filter((item) => item.code) as FailureReasonItem[])
              : [],
            resultText: toSafeString(data.resultText),
          };
        });

        setRecords(nextRecords);
        setVisibleCount((prev) => {
          if (nextRecords.length === 0) return 1;
          return Math.max(1, Math.min(prev, nextRecords.length));
        });
        setLoadingRecords(false);
      },
      (error) => {
        setFeedbackType('error');
        setFeedback(
          `❌ تعذر قراءة السجل: ${toSafeString((error as { message?: string })?.message, 'Permission denied')}`
        );
        setLoadingRecords(false);
      }
    );

    return () => unsubscribe();
  }, [isAdminUser]);

  // ── الإجراءات ──

  /**
   * P3: تقدير حجم الجمهور قبل البث — يعرض للأدمن عدد الأجهزة المتوقعة
   * ويستبعد الحسابات المعطّلة قبل الإرسال الفعلي.
   */
  const handleEstimate = async () => {
    if (!isAdminUser || estimating) return;
    if (isCustomAudience && !EMAIL_REGEX.test(targetEmail.trim().toLowerCase())) {
      setEstimateInfo('');
      setFeedbackType('error');
      setFeedback('❌ يرجى إدخال بريد صحيح لتقدير الجمهور.');
      return;
    }
    setEstimating(true);
    setEstimateInfo('');
    try {
      const result = await estimateAudienceSize({
        targetAudience,
        targetEmail: isCustomAudience ? targetEmail.trim().toLowerCase() : undefined,
        customEmailRoleMode: isCustomAudience ? customEmailRoleMode : undefined,
      });
      const label = isCustomAudience
        ? `بريد محدد: ${targetEmail.trim()}`
        : getAudienceLabel(targetAudience);
      const msg =
        `📊 تقدير الجمهور: ${label}\n` +
        `• أجهزة مستهدفة: ${result.tokenCount.toLocaleString('ar-EG')}\n` +
        `• أجهزة فريدة: ${result.uniqueTokenCount.toLocaleString('ar-EG')}` +
        (result.excludedDueToOverlapCount > 0
          ? `\n• مستبعد (تداخل فئات): ${result.excludedDueToOverlapCount.toLocaleString('ar-EG')}`
          : '') +
        (result.tokenCount === 0
          ? '\n⚠️ لا توجد أجهزة نشطة لهذه الفئة حالياً.'
          : '');
      setEstimateInfo(msg);
    } catch (err) {
      const message = toSafeString((err as { message?: string })?.message, 'تعذر تقدير حجم الجمهور.');
      setFeedbackType('error');
      setFeedback(`❌ ${message}`);
    } finally {
      setEstimating(false);
    }
  };

  /** إرسال الإشعار فعلياً لكل الأجهزة في الفئة المستهدفة. */
  const handleSend = async () => {
    if (!isAdminUser) return;
    if (!isFormValid || sending) return;

    // تأكيد قبل البث — تفادي الإرسال العرضي لآلاف المستخدمين.
    const audienceLabel = isCustomAudience
      ? `بريد محدد: ${targetEmail.trim()}`
      : getAudienceLabel(targetAudience);
    const preview =
      `تأكيد بث إشعار خارجي (Push)\n\n` +
      `الجمهور المستهدف: ${audienceLabel}\n\n` +
      `العنوان: ${title.trim()}\n\n` +
      `الرسالة: ${body.trim().slice(0, 200)}${body.trim().length > 200 ? '…' : ''}\n\n` +
      `⚠️ سيتم الإرسال لكل الأجهزة المسجّلة في هذه الفئة. لا يمكن التراجع.`;
    if (!window.confirm(preview)) return;

    setSending(true);
    setFeedback('');

    try {
      const result = await sendExternalNotificationBroadcast({
        title: title.trim(),
        body: body.trim(),
        targetAudience,
        targetEmail: isCustomAudience ? targetEmail.trim().toLowerCase() : undefined,
        customEmailRoleMode: isCustomAudience ? customEmailRoleMode : undefined,
      });

      // ملخص النتيجة — مفصل عشان الأدمن يقدر يشوف إيه اللي حصل بدقة
      const summary = `الأجهزة المستهدفة: ${result.tokenCount} • نجح: ${result.successCount} • فشل: ${result.failureCount}`;
      const overlapSummary = `تم استبعاد ${toSafeNumber(result.excludedDueToOverlapCount)} جهاز بسبب تداخل فئات قديم.`;
      const retrySummary = `إعادة الإرسال التلقائي: ${result.retryAttempted ? 'تمت' : 'غير مفعلة'} (${toSafeString(result.retryPolicy, 'no_auto_retry')})`;
      const failureSummary = `أسباب الفشل:\n${formatFailureReasons(result.failureReasons)}`;

      if (result.ok) {
        setFeedbackType('success');
        setFeedback(`✅ ${result.message}\n${summary}\n${overlapSummary}\n${retrySummary}\n${failureSummary}`);
      } else {
        setFeedbackType('error');
        setFeedback(`❌ ${result.message}\n${summary}\n${overlapSummary}\n${retrySummary}\n${failureSummary}`);
      }

      // إعادة ضبط النموذج فقط في حالة النجاح
      if (result.ok) {
        setTitle('');
        setBody('');
        setTargetAudience('all');
        setTargetEmail('');
        setCustomEmailRoleMode('all_linked');
      }
    } catch (error) {
      const message = toSafeString((error as { message?: string })?.message, 'حدث خطأ أثناء إرسال الإشعار.');
      setFeedbackType('error');
      setFeedback(`❌ ${message}`);
    } finally {
      setSending(false);
    }
  };

  /** إعادة إرسال سجل قديم بنفس المعطيات — مفيد لو البث الأول فشل. */
  const handleResendRecord = async (record: NotificationBroadcastRecord) => {
    if (sending || resendingRecordId) return;

    setResendingRecordId(record.id);
    setFeedback('');

    try {
      const result = await sendExternalNotificationBroadcast({
        title: record.title,
        body: record.body,
        targetAudience: record.targetAudience,
        targetEmail: record.targetAudience === 'custom' ? record.targetEmail : undefined,
        customEmailRoleMode: record.targetAudience === 'custom' ? record.customEmailRoleMode : undefined,
      });

      const summary = `الأجهزة المستهدفة: ${result.tokenCount} • نجح: ${result.successCount} • فشل: ${result.failureCount}`;
      const overlapSummary = `تم استبعاد ${toSafeNumber(result.excludedDueToOverlapCount)} جهاز بسبب تداخل فئات قديم.`;
      const retrySummary = `إعادة الإرسال التلقائي: ${result.retryAttempted ? 'تمت' : 'غير مفعلة'} (${toSafeString(result.retryPolicy, 'no_auto_retry')})`;
      const failureSummary = `أسباب الفشل:\n${formatFailureReasons(result.failureReasons)}`;
      setFeedbackType(result.ok ? 'success' : 'error');
      setFeedback(`${result.ok ? '✅' : '❌'} ${result.message}\n${summary}\n${overlapSummary}\n${retrySummary}\n${failureSummary}`);
    } catch (error) {
      const message = toSafeString((error as { message?: string })?.message, 'حدث خطأ أثناء إعادة الإرسال.');
      setFeedbackType('error');
      setFeedback(`❌ ${message}`);
    } finally {
      setResendingRecordId('');
    }
  };

  /** حذف سجل نهائياً من Firestore (بعد تأكيد المستخدم). */
  const handleDeleteRecord = async (record: NotificationBroadcastRecord) => {
    if (deletingRecordId || sending || resendingRecordId) return;
    if (!window.confirm('هل تريد حذف هذا السجل نهائيا من السحابة؟ لا يمكن التراجع.')) return;

    setDeletingRecordId(record.id);
    setFeedback('');

    try {
      await deleteDoc(doc(db, 'externalNotificationBroadcasts', record.id));
      setFeedbackType('success');
      setFeedback('✅ تم حذف السجل نهائيا من السحابة.');
    } catch (error) {
      const message = toSafeString((error as { message?: string })?.message, 'تعذر حذف السجل حاليا.');
      setFeedbackType('error');
      setFeedback(`❌ ${message}`);
    } finally {
      setDeletingRecordId('');
    }
  };

  return {
    // بيانات النموذج
    title, setTitle,
    body, setBody,
    targetAudience, setTargetAudience,
    targetEmail, setTargetEmail,
    customEmailRoleMode, setCustomEmailRoleMode,
    isCustomAudience,
    isFormValid,
    // حالة العمليات
    sending,
    estimating,
    estimateInfo,
    feedback,
    feedbackType,
    // السجلات
    records,
    loadingRecords,
    visibleCount,
    setVisibleCount,
    deletingRecordId,
    resendingRecordId,
    // الإجراءات
    handleEstimate,
    handleSend,
    handleResendRecord,
    handleDeleteRecord,
  };
};
