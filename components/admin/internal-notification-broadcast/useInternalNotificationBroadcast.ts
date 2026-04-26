// ─────────────────────────────────────────────────────────────────────────────
// Hook منطق البث الداخلي (useInternalNotificationBroadcast)
// ─────────────────────────────────────────────────────────────────────────────
// يجمع كل الـ state والإجراءات الخاصة بنشر إشعار داخلي (In-App Popup):
//   • حالة نموذج الإدخال (العنوان، النص، الفئة، البريد المخصص ...)
//   • الاشتراك اللحظي بسجلات آخر 30 يوم من Firestore
//   • تقدير حجم الجمهور قبل الإرسال (handleEstimate)
//   • نشر الإشعار فعلياً (handleSend) مع تأكيد
//   • إعادة إرسال سجل قديم (handleResendRecord)
//   • حذف سجل نهائياً (handleDeleteRecord)
//
// تم فصله عن المكون لأن:
//   1) المنطق كبير ومعقد، والمكون الناتج بقى JSX بحت.
//   2) لو احتجنا نفس المنطق في مكان تاني (widget ملخص) نستدعي الـ hook مباشرة.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import {
  sendInAppNotificationBroadcast,
  type SendInAppNotificationResult,
} from '../../../services/inAppNotificationBroadcastService';
import { estimateAudienceSize } from '../../../services/externalNotificationBroadcastService';
import type {
  ExternalNotificationAudience,
  CustomEmailRoleMode,
} from '../../../services/externalNotificationBroadcastService';
import {
  EMAIL_REGEX,
  getAudienceLabel,
  toSafeNumber,
  toSafeString,
  type NotificationBroadcastRecord,
} from './constants';

/**
 * نص موجز لنتيجة البث الداخلي.
 *
 * البث الداخلي ما يرسل push فعلي، يكتب وثيقة فقط ويظهر الـ popup عند فتح
 * التطبيق. لذا ما عندناش "نجاح/فشل توصيل" — فقط تقدير حجم الجمهور المستهدف.
 */
const buildFeedbackText = (result: SendInAppNotificationResult): string => {
  const summary = `أجهزة متوقعة: ${result.tokenCount}`;
  const userScopeSummary = `مستخدمون مطابقون: ${toSafeNumber(result.matchedUserIdsCount)}.`;
  return `${result.message}\n${summary}\n${userScopeSummary}`;
};

/** نوع نتيجة الـ feedback للمكون (success/error/info لتحديد الألوان). */
type BroadcastFeedbackType = 'success' | 'error' | 'info';

export const useInternalNotificationBroadcast = (isAdminUser: boolean) => {
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
  const isFormValid = useMemo(() => {
    if (title.trim().length === 0 || body.trim().length === 0) return false;
    if (!isCustomAudience) return true;
    return EMAIL_REGEX.test(targetEmail.trim().toLowerCase());
  }, [title, body, isCustomAudience, targetEmail]);

  // ── الاشتراك اللحظي بالسجلات (آخر 30 يوم، أحدث 100 سجل) ──
  useEffect(() => {
    if (!isAdminUser) {
      setRecords([]);
      setLoadingRecords(false);
      return;
    }

    const cutoffMs = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const recordsQuery = query(
      collection(db, 'inAppNotificationBroadcasts'),
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
            status: toSafeString(data.status, 'active'),
            title: toSafeString(data.title),
            body: toSafeString(data.body),
            targetAudience: toSafeString(data.targetAudience, 'all') as ExternalNotificationAudience,
            customEmailRoleMode: toSafeString(data.customEmailRoleMode, 'all_linked') as CustomEmailRoleMode,
            targetEmail: toSafeString(data.targetEmail),
            targetEmailMasked: toSafeString(data.targetEmailMasked),
            createdBy: toSafeString(data.createdBy, '-'),
            createdAt: toSafeString(data.createdAt),
            tokenCount: toSafeNumber(data.tokenCount),
            successCount: toSafeNumber(data.successCount),
            failureCount: toSafeNumber(data.failureCount),
            failedBatchesCount: toSafeNumber(data.failedBatchesCount),
            excludedDueToOverlapCount: toSafeNumber(data.excludedDueToOverlapCount),
            matchedUserIdsCount: toSafeNumber(data.matchedUserIdsCount),
            resultText: toSafeString(data.resultText),
          };
        });

        setRecords(nextRecords);
        // لو قل عدد السجلات نرجع visibleCount لقيمة صحيحة
        setVisibleCount((prev) => {
          if (nextRecords.length === 0) return 1;
          return Math.max(1, Math.min(prev, nextRecords.length));
        });
        setLoadingRecords(false);
      },
      (error) => {
        setFeedbackType('error');
        setFeedback(
          `❌ تعذر قراءة سجل الإشعارات الداخلية: ${toSafeString((error as { message?: string })?.message, 'Permission denied')}`
        );
        setLoadingRecords(false);
      }
    );

    return () => unsubscribe();
  }, [isAdminUser]);

  // ── الإجراءات ──

  /** تقدير حجم الجمهور قبل الإرسال الفعلي (تفادي البث العشوائي). */
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
        `📊 تقدير جمهور البث الداخلي: ${label}\n` +
        `• مستخدمون متوقعون: ${result.tokenCount.toLocaleString('ar-EG')}` +
        (result.excludedDueToOverlapCount > 0
          ? `\n• مستبعد (تداخل فئات): ${result.excludedDueToOverlapCount.toLocaleString('ar-EG')}`
          : '') +
        (result.tokenCount === 0
          ? '\n⚠️ لا يوجد مستخدمون نشطون لهذه الفئة حالياً.'
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

  /** نشر الإشعار الداخلي فعلياً — يظهر كـ popup داخل التطبيق لكل المستخدمين. */
  const handleSend = async () => {
    if (!isAdminUser || !isFormValid || sending) return;

    // تأكيد قبل النشر — تفادي الضغط الخاطئ.
    const audienceLabel = isCustomAudience
      ? `بريد محدد: ${targetEmail.trim()}`
      : getAudienceLabel(targetAudience);
    const preview =
      `تأكيد نشر إشعار داخلي (In-App Popup)\n\n` +
      `الجمهور المستهدف: ${audienceLabel}\n\n` +
      `العنوان: ${title.trim()}\n\n` +
      `الرسالة: ${body.trim().slice(0, 200)}${body.trim().length > 200 ? '…' : ''}\n\n` +
      `⚠️ سيظهر Popup داخل التطبيق لكل المستخدمين المستهدفين عند فتحه.`;
    if (!window.confirm(preview)) return;

    setSending(true);
    setFeedback('');

    try {
      const result = await sendInAppNotificationBroadcast({
        title: title.trim(),
        body: body.trim(),
        targetAudience,
        targetEmail: isCustomAudience ? targetEmail.trim().toLowerCase() : undefined,
        customEmailRoleMode: isCustomAudience ? customEmailRoleMode : undefined,
      });

      if (result.ok) {
        setFeedbackType('success');
        setFeedback(`✅ ${buildFeedbackText(result)}`);
        // إعادة ضبط النموذج بعد النجاح
        setTitle('');
        setBody('');
        setTargetAudience('all');
        setTargetEmail('');
        setCustomEmailRoleMode('all_linked');
      } else {
        setFeedbackType('error');
        setFeedback(`❌ ${buildFeedbackText(result)}`);
      }
    } catch (error) {
      const message = toSafeString(
        (error as { message?: string })?.message,
        'حدث خطأ أثناء نشر الإشعار الداخلي.'
      );
      setFeedbackType('error');
      setFeedback(`❌ ${message}`);
    } finally {
      setSending(false);
    }
  };

  /** إعادة إرسال سجل قديم بنفس المعطيات — مفيد لما البث الأول فشل. */
  const handleResendRecord = async (record: NotificationBroadcastRecord) => {
    if (sending || resendingRecordId) return;
    // حماية: لو سجل مخصص والبريد مش محفوظ نمنع إعادة الإرسال
    if (record.targetAudience === 'custom' && !record.targetEmail) {
      setFeedbackType('error');
      setFeedback('❌ لا يمكن إعادة إرسال هذا السجل المخصص لأن البريد الأصلي غير محفوظ.');
      return;
    }

    setResendingRecordId(record.id);
    setFeedback('');

    try {
      const result = await sendInAppNotificationBroadcast({
        title: record.title,
        body: record.body,
        targetAudience: record.targetAudience,
        targetEmail: record.targetAudience === 'custom' ? record.targetEmail : undefined,
        customEmailRoleMode: record.targetAudience === 'custom' ? record.customEmailRoleMode : undefined,
      });

      setFeedbackType(result.ok ? 'success' : 'error');
      setFeedback(`${result.ok ? '✅' : '❌'} ${buildFeedbackText(result)}`);
    } catch (error) {
      const message = toSafeString(
        (error as { message?: string })?.message,
        'حدث خطأ أثناء إعادة الإرسال الداخلي.'
      );
      setFeedbackType('error');
      setFeedback(`❌ ${message}`);
    } finally {
      setResendingRecordId('');
    }
  };

  /** حذف سجل نهائياً من Firestore (بعد تأكيد المستخدم). */
  const handleDeleteRecord = async (record: NotificationBroadcastRecord) => {
    if (deletingRecordId || sending || resendingRecordId) return;
    if (!window.confirm('هل تريد حذف هذا السجل الداخلي نهائيا من السحابة؟ لا يمكن التراجع.')) return;

    setDeletingRecordId(record.id);
    setFeedback('');

    try {
      await deleteDoc(doc(db, 'inAppNotificationBroadcasts', record.id));
      setFeedbackType('success');
      setFeedback('✅ تم حذف السجل الداخلي نهائيا من السحابة.');
    } catch (error) {
      const message = toSafeString(
        (error as { message?: string })?.message,
        'تعذر حذف السجل الداخلي حاليا.'
      );
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
