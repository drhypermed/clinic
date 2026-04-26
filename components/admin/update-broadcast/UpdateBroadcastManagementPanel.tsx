import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { formatUserDateTime } from '../../../utils/cairoTime';
import {
  sendAppUpdateBroadcast,
  type UpdateBroadcastAudience,
} from '../../../services/updateBroadcastService';
import { getPwaDeploymentInfo } from '../../../services/pwaDeploymentInfoService';
import { LoadingText } from '../../ui/LoadingText';

type UpdateRolloutRecord = {
  id: string;
  targetAudience: UpdateBroadcastAudience;
  status: 'sending' | 'sent' | 'failed' | string;
  createdAt: string;
  sentAt: string;
  sentAtMs: number;
  createdBy: string;
  resultText: string;
};

const AUDIENCE_OPTIONS: Array<{ value: UpdateBroadcastAudience; label: string }> = [
  { value: 'public', label: 'الجمهور فقط' },
  { value: 'doctors', label: 'الأطباء فقط' },
  { value: 'secretaries', label: 'السكرتارية فقط' },
  { value: 'doctor_secretaries', label: 'الأطباء + السكرتارية' },
  { value: 'all', label: 'الجميع' },
];

const getAudienceLabel = (audience: UpdateBroadcastAudience): string =>
  AUDIENCE_OPTIONS.find((item) => item.value === audience)?.label || audience;

const toSafeString = (value: unknown, fallback = ''): string => {
  const normalized = String(value || '').trim();
  return normalized || fallback;
};

const toSafeNumber = (value: unknown): number => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const formatDateTime = (value: string): string => {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';
  return formatUserDateTime(parsed, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }, 'ar-EG');
};

const deriveDateMs = (isoDate: string, fallbackMs: number): number => {
  if (fallbackMs > 0) return fallbackMs;
  const parsed = new Date(isoDate);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const getStatusLabel = (status: string): { text: string; className: string } => {
  if (status === 'sent') {
    return { text: 'تم التنفيذ', className: 'bg-success-700/30 border-success-500 text-success-200' };
  }
  if (status === 'sending') {
    return { text: 'جارٍ التنفيذ', className: 'bg-warning-700/30 border-warning-500 text-warning-200' };
  }
  if (status === 'failed') {
    return { text: 'فشل التنفيذ', className: 'bg-danger-700/30 border-danger-500 text-danger-200' };
  }
  return { text: status || 'غير معروف', className: 'bg-slate-600/60 border-slate-400 text-slate-200' };
};

export const UpdateBroadcastManagementPanel: React.FC = () => {
  const [targetAudience, setTargetAudience] = useState<UpdateBroadcastAudience>('all');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [adminHasWaitingUpdate, setAdminHasWaitingUpdate] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateStatusText, setUpdateStatusText] = useState('جارٍ فحص وجود تحديث جديد');
  const [lastCheckedAt, setLastCheckedAt] = useState('');
  const [firebaseDeployAtIso, setFirebaseDeployAtIso] = useState('');
  const [firebaseDeployAtMs, setFirebaseDeployAtMs] = useState(0);
  const [firebaseDeployEtag, setFirebaseDeployEtag] = useState('');
  const [records, setRecords] = useState<UpdateRolloutRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);

  // علم لمنع تشغيل فحوصات متوازية: لو فحص شغال ودخل الـ interval لتشغيل واحد جديد،
  // بنتجاهله. ده اللي كان بيخلي "جارٍ الفحص" يفضل ظاهر دايماً على الشبكات البطيئة.
  const checkInProgressRef = useRef(false);

  const runUpdateCheck = useCallback(async () => {
    if (checkInProgressRef.current) return;
    checkInProgressRef.current = true;
    setCheckingUpdate(true);
    try {
      const deploymentInfo = await getPwaDeploymentInfo();
      setAdminHasWaitingUpdate(deploymentInfo.hasWaitingUpdate);
      setFirebaseDeployAtIso(deploymentInfo.deployedAtIso);
      setFirebaseDeployAtMs(deploymentInfo.deployedAtMs);
      setFirebaseDeployEtag(deploymentInfo.etag);

      if (deploymentInfo.deployedAtMs > 0 && deploymentInfo.hasWaitingUpdate) {
        setUpdateStatusText('تم رصد نسخة جديدة على Firebase، وجهاز الأدمن لديه تحديث محلي بانتظار التثبيت.');
      } else if (deploymentInfo.deployedAtMs > 0) {
        setUpdateStatusText('تم رصد آخر نسخة مرفوعة على Firebase بنجاح.');
      } else if (deploymentInfo.hasWaitingUpdate) {
        setUpdateStatusText('يوجد تحديث على جهاز الأدمن لكن تعذر قراءة وقت الرفع من Firebase.');
      } else {
        setUpdateStatusText('لا توجد بيانات رفع جديدة متاحة من Firebase حالياً.');
      }
    } catch {
      setAdminHasWaitingUpdate(false);
      setFirebaseDeployAtIso('');
      setFirebaseDeployAtMs(0);
      setFirebaseDeployEtag('');
      setUpdateStatusText('تعذر فحص حالة التحديث الآن. يمكنك إعادة الفحص أو التنفيذ يدويًا.');
    } finally {
      setCheckingUpdate(false);
      checkInProgressRef.current = false;
      setLastCheckedAt(
        formatUserDateTime(new Date(), {
          dateStyle: 'short',
          timeStyle: 'short',
        }, 'ar-EG')
      );
    }
  }, []);

  useEffect(() => {
    void runUpdateCheck();
    const intervalId = setInterval(() => {
      void runUpdateCheck();
    }, 45000);
    return () => clearInterval(intervalId);
  }, [runUpdateCheck]);

  useEffect(() => {
    // نعرض آخر ٥ سجلات فقط — الأقدم يتمسح تلقائياً من السحابة عند كتابة أي
    // أمر تحديث جديد (انظر sendAppUpdateBroadcast.js).
    const updatesQuery = query(
      collection(db, 'appUpdateRollouts'),
      orderBy('createdAtMs', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(
      updatesQuery,
      (snapshot) => {
        const nextRecords: UpdateRolloutRecord[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as Record<string, unknown>;
          return {
            id: docSnap.id,
            targetAudience: (toSafeString(data.targetAudience) || 'all') as UpdateBroadcastAudience,
            status: toSafeString(data.status, 'sent'),
            createdAt: toSafeString(data.createdAt),
            sentAt: toSafeString(data.sentAt),
            sentAtMs: toSafeNumber(data.sentAtMs),
            createdBy: toSafeString(data.createdBy, '-'),
            resultText: toSafeString(
              data.resultText,
              'تم تسجيل تنفيذ التحديث الصامت بنجاح للفئة المستهدفة.'
            ),
          };
        });
        setRecords(nextRecords);
        setLoadingRecords(false);
      },
      (error) => {
        if ((error as { code?: string })?.code === 'permission-denied') {
          setFeedback('❌ لا توجد صلاحية قراءة سجل التنفيذات. تأكد من نشر Firestore Rules الجديدة.');
        }
        setLoadingRecords(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const latestSentRecord = useMemo(
    () => records.find((record) => record.status === 'sent') || null,
    [records]
  );

  const latestSentMs = useMemo(
    () => (latestSentRecord ? deriveDateMs(latestSentRecord.sentAt, latestSentRecord.sentAtMs) : 0),
    [latestSentRecord]
  );

  const hasFirebaseDeployment = firebaseDeployAtMs > 0;
  const deploymentSendGraceMs = 2 * 60 * 1000;
  const isCurrentDeploymentAlreadySent =
    hasFirebaseDeployment && latestSentMs > 0 && latestSentMs + deploymentSendGraceMs >= firebaseDeployAtMs;
  const hasPendingDeploymentForRollout = hasFirebaseDeployment && !isCurrentDeploymentAlreadySent;

  const canSend = useMemo(
    () => !sending && !isCurrentDeploymentAlreadySent,
    [sending, isCurrentDeploymentAlreadySent]
  );

  const sendStatusForCurrentDeployment = useMemo(() => {
    if (!hasFirebaseDeployment) {
      return {
        text: 'غير متاح حتى الآن',
        className: 'bg-slate-600/60 border-slate-400 text-slate-100',
      };
    }
    if (!latestSentRecord) {
      return {
        text: 'لم يتم التنفيذ بعد',
        className: 'bg-warning-700/30 border-warning-500 text-warning-200',
      };
    }
    if (isCurrentDeploymentAlreadySent) {
      return {
        text: 'تم التنفيذ لهذا التحديث',
        className: 'bg-success-700/30 border-success-500 text-success-200',
      };
    }
    return {
      text: 'لم يتم تنفيذ آخر تحديث بعد',
      className: 'bg-danger-700/30 border-danger-500 text-danger-200',
    };
  }, [hasFirebaseDeployment, isCurrentDeploymentAlreadySent, latestSentRecord]);

  const effectiveUpdateStatusText = useMemo(() => {
    if (isCurrentDeploymentAlreadySent && latestSentRecord) {
      return '✅ تم تنفيذ آخر تحديث بنجاح على الفئة المستهدفة.';
    }
    return updateStatusText;
  }, [isCurrentDeploymentAlreadySent, latestSentRecord, updateStatusText]);

  const submitRollout = async (payload: { targetAudience: UpdateBroadcastAudience }) => {
    setSending(true);
    setFeedback('');
    try {
      const result = await sendAppUpdateBroadcast({
        targetAudience: payload.targetAudience,
      });

      if (!result?.ok) {
        setFeedback('❌ تعذر تنفيذ التحديث الصامت. حاول مرة أخرى.');
        return;
      }

      setFeedback(result.resultText || '✅ تم تنفيذ أمر التحديث الصامت فورًا للفئة المختارة.');
      setUpdateStatusText('✅ تم تنفيذ آخر تحديث بنجاح على الفئة المختارة.');
      void runUpdateCheck();
    } catch (error) {
      void error;
      setFeedback('❌ حدث خطأ أثناء التنفيذ. تأكد من صلاحيات الأدمن ثم أعد المحاولة.');
    } finally {
      setSending(false);
    }
  };

  const handleSendNow = async () => {
    if (isCurrentDeploymentAlreadySent) {
      setFeedback('⚠️ تم تنفيذ هذا الإصدار بالفعل. ارفع إصدارًا جديدًا ثم نفّذ مرة أخرى.');
      return;
    }
    if (!canSend) return;

    // تأكيد قبل التنفيذ — إعادة التحميل الفورية تؤثر على كل المستخدمين في هذه الفئة.
    const confirmMsg =
      `⚠️ تأكيد تنفيذ التحديث الصامت\n\n` +
      `الفئة: ${getAudienceLabel(targetAudience)}\n\n` +
      `سيتم إعادة تحميل التطبيق فوراً على كل الأجهزة النشطة في هذه الفئة.\n` +
      `الأطباء الذين لديهم جلسات مفتوحة قد تنقطع عليهم العملية لحظياً.\n\n` +
      `هل تريد المتابعة؟`;
    if (!window.confirm(confirmMsg)) return;

    await submitRollout({ targetAudience });
  };

  const handleResend = async (record: UpdateRolloutRecord) => {
    // نمنع إعادة التنفيذ على إصدار مُطبَّق بالفعل — كان الزر يقدر يعمل reload
    // لكل المستخدمين بدون فائدة (نفس النسخة) لو ما رفعتش إصدار جديد.
    if (isCurrentDeploymentAlreadySent) {
      setFeedback('⚠️ آخر تحديث اتنفّذ بالفعل. ارفع إصدار جديد على الموقع قبل ما تعيد التنفيذ.');
      return;
    }

    const confirmMsg =
      `🔁 تأكيد إعادة التنفيذ\n\n` +
      `الفئة: ${getAudienceLabel(record.targetAudience)}\n\n` +
      `سيُنشأ أمر تحديث جديد — كل المستخدمين في هذه الفئة سيتم إعادة تحميل تطبيقهم فوراً، ` +
      `حتى لو طبّقوا تحديث سابق.\n\n` +
      `هل تريد المتابعة؟`;
    if (!window.confirm(confirmMsg)) return;

    await submitRollout({ targetAudience: record.targetAudience });
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-700 rounded-2xl shadow-xl p-5 sm:p-6 border-t-4 border-success-400 dh-stagger-1" dir="rtl">
        <h3 className="text-white text-xl sm:text-2xl font-black mb-2">إدارة تحديثات التطبيق</h3>
        <p className="text-slate-300 text-sm mb-5">
          تنفيذ تحديث صامت وفوري للفئة المختارة بدون إرسال رسائل أو إشعارات.
        </p>

        <div
          className={`mb-5 rounded-xl border p-4 ${
            hasPendingDeploymentForRollout || adminHasWaitingUpdate
              ? 'border-success-400 bg-success-900/20'
              : 'border-warning-400 bg-warning-900/20'
          }`}
        >
          <p className="text-white font-black text-sm sm:text-base">حالة التحديث على الموقع</p>
          <p className="text-slate-100 text-sm mt-1 break-words">{effectiveUpdateStatusText}</p>
          {/* الكروت داخل الـ grid: نستخدم min-w-0 + break-words لمنع النص من
              الخروج عن إطار الكارت على الموبايل (التواريخ والنصوص الطويلة كانت تطفح). */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs sm:text-sm">
            <div className="rounded-lg border border-slate-500/60 bg-slate-800/60 px-3 py-2 text-slate-100 min-w-0 break-words">
              <span className="font-black block sm:inline">وقت رفع التحديث:</span>{' '}
              <span className="break-words">
                {firebaseDeployAtIso ? formatDateTime(firebaseDeployAtIso) : 'غير متاح'}
              </span>
            </div>
            <div className="rounded-lg border border-slate-500/60 bg-slate-800/60 px-3 py-2 text-slate-100 min-w-0 break-words">
              <span className="font-black block sm:inline">آخر تنفيذ ناجح:</span>{' '}
              <span className="break-words">
                {latestSentRecord ? formatDateTime(latestSentRecord.sentAt || latestSentRecord.createdAt) : 'لا يوجد'}
              </span>
            </div>
            <div className={`rounded-lg border px-3 py-2 font-black min-w-0 break-words ${sendStatusForCurrentDeployment.className}`}>
              <span className="block sm:inline">حالة تنفيذ آخر تحديث:</span>{' '}
              <span className="break-words">{sendStatusForCurrentDeployment.text}</span>
            </div>
          </div>

          <div
            className={`mt-2 rounded-lg border px-3 py-2 text-xs sm:text-sm font-bold break-words ${
              adminHasWaitingUpdate
                ? 'border-brand-300/70 bg-brand-900/20 text-brand-100'
                : 'border-slate-500/60 bg-slate-800/60 text-slate-200'
            }`}
          >
            حالة جهاز الأدمن:{' '}
            {adminHasWaitingUpdate
              ? 'يوجد تحديث محلي وسيتم تطبيقه تلقائيًا على جهاز الأدمن.'
              : 'جهاز الأدمن على أحدث نسخة حالياً.'}
          </div>

          {firebaseDeployEtag && (
            // ETag قد يكون هاش طويل — break-all يكسر الكلمة الواحدة على الموبايل
            // عشان ما تطفحش خارج الكارت.
            <p className="text-slate-300 text-[11px] mt-2 font-semibold break-all">ETag: {firebaseDeployEtag}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                void runUpdateCheck();
              }}
              disabled={checkingUpdate}
              className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-500 text-white text-sm font-black hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {checkingUpdate ? 'جارٍ الفحص' : 'فحص التحديث الجديد'}
            </button>
            {lastCheckedAt && (
              <span className="text-slate-300 text-xs font-semibold break-words">آخر فحص: {lastCheckedAt}</span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-slate-200 text-sm font-bold">الفئة المستهدفة</label>
          <select
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value as UpdateBroadcastAudience)}
            className="w-full rounded-xl border border-slate-500 bg-slate-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-success-400"
          >
            {AUDIENCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={handleSendNow}
            disabled={!canSend}
            className="px-5 py-2.5 rounded-xl bg-success-500 hover:bg-success-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black"
          >
            {sending ? 'جارٍ التنفيذ' : 'تنفيذ التحديث الآن'}
          </button>
          {feedback && (
            <div className="text-sm font-bold text-slate-100 bg-slate-800/70 border border-slate-500 rounded-lg px-3 py-2">
              {feedback}
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-700 rounded-2xl shadow-xl p-5 sm:p-6 border-t-4 border-brand-400 dh-stagger-2" dir="rtl">
        <h4 className="text-white text-lg sm:text-xl font-black mb-4">سجل تنفيذ التحديثات</h4>
        {loadingRecords ? (
          <div className="text-slate-300 text-sm"><LoadingText>جارٍ تحميل السجل</LoadingText></div>
        ) : records.length === 0 ? (
          <div className="text-slate-300 text-sm">لا توجد عمليات تنفيذ حتى الآن.</div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => {
              const status = getStatusLabel(record.status);
              // الزر يتعطل في حالتين: (١) في عملية إرسال شغالة، (٢) آخر تحديث
              // اتنفذ بالفعل ومفيش إصدار جديد — ضغطه ساعتها هيعمل reload للمستخدمين
              // بدون فائدة.
              const resendDisabled = sending || isCurrentDeploymentAlreadySent;
              return (
                <div
                  key={record.id}
                  className="rounded-xl border border-slate-500 bg-slate-800/70 p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 rounded-lg bg-slate-700 text-slate-100 border border-slate-500 break-words">
                          الفئة: {getAudienceLabel(record.targetAudience)}
                        </span>
                        <span className={`px-2 py-1 rounded-lg border break-words ${status.className}`}>
                          {status.text}
                        </span>
                        <span className="px-2 py-1 rounded-lg bg-slate-700 text-slate-100 border border-slate-500 break-words">
                          {formatDateTime(record.createdAt)}
                        </span>
                      </div>
                      {/* ألوان النصوص هنا تم تفتيحها من slate-400/success-200
                          إلى slate-200/success-100 لتحسين الوضوح على خلفية slate-800/70. */}
                      <p className="text-xs text-slate-200 break-all">
                        <span className="text-slate-400">تم بواسطة:</span> {record.createdBy}
                      </p>
                      <p className="text-xs text-success-100 font-semibold break-words">
                        <span className="text-slate-400 font-normal">النتيجة:</span> {record.resultText}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        void handleResend(record);
                      }}
                      disabled={resendDisabled}
                      title={
                        isCurrentDeploymentAlreadySent
                          ? 'الإصدار الحالي اتنفّذ بالفعل. ارفع إصدار جديد قبل إعادة التنفيذ.'
                          : 'إعادة كتابة أمر تحديث بنفس الفئة لإجبار التطبيقات الفاتحة على التجديد.'
                      }
                      className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-black w-full sm:w-auto shrink-0"
                    >
                      إعادة التنفيذ الآن
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
