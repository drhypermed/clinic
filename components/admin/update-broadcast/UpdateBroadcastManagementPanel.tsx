import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
    return { text: 'تم التنفيذ', className: 'bg-emerald-700/30 border-emerald-500 text-emerald-200' };
  }
  if (status === 'sending') {
    return { text: 'جارٍ التنفيذ', className: 'bg-amber-700/30 border-amber-500 text-amber-200' };
  }
  if (status === 'failed') {
    return { text: 'فشل التنفيذ', className: 'bg-red-700/30 border-red-500 text-red-200' };
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

  const runUpdateCheck = useCallback(async () => {
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
    const updatesQuery = query(
      collection(db, 'appUpdateRollouts'),
      orderBy('createdAtMs', 'desc'),
      limit(25)
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
        className: 'bg-amber-700/30 border-amber-500 text-amber-200',
      };
    }
    if (isCurrentDeploymentAlreadySent) {
      return {
        text: 'تم التنفيذ لهذا التحديث',
        className: 'bg-emerald-700/30 border-emerald-500 text-emerald-200',
      };
    }
    return {
      text: 'لم يتم تنفيذ آخر تحديث بعد',
      className: 'bg-red-700/30 border-red-500 text-red-200',
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
    // تأكيد إضافي — "إعادة التنفيذ" تنشئ rollout جديد وقد تسبب reload لمستخدمين
    // أغلقوا البانر سابقاً.
    const confirmMsg =
      `🔁 تأكيد إعادة التنفيذ\n\n` +
      `الفئة: ${getAudienceLabel(record.targetAudience)}\n\n` +
      `سيُنشأ أمر تحديث جديد — المستخدمون في هذه الفئة قد يرون البانر مرة أخرى حتى لو أغلقوه سابقاً.\n\n` +
      `هل تريد المتابعة؟`;
    if (!window.confirm(confirmMsg)) return;

    await submitRollout({ targetAudience: record.targetAudience });
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-700 rounded-2xl shadow-xl p-5 sm:p-6 border-t-4 border-cyan-400 dh-stagger-1" dir="rtl">
        <h3 className="text-white text-xl sm:text-2xl font-black mb-2">إدارة تحديثات التطبيق</h3>
        <p className="text-slate-300 text-sm mb-5">
          تنفيذ تحديث صامت وفوري للفئة المختارة بدون إرسال رسائل أو إشعارات.
        </p>

        <div
          className={`mb-5 rounded-xl border p-4 ${
            hasPendingDeploymentForRollout || adminHasWaitingUpdate
              ? 'border-emerald-400 bg-emerald-900/20'
              : 'border-amber-400 bg-amber-900/20'
          }`}
        >
          <p className="text-white font-black text-sm sm:text-base">حالة التحديث على الموقع</p>
          <p className="text-slate-100 text-sm mt-1">{effectiveUpdateStatusText}</p>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs sm:text-sm">
            <div className="rounded-lg border border-slate-500/60 bg-slate-800/60 px-3 py-2 text-slate-100">
              <span className="font-black">وقت رفع التحديث على Firebase:</span>{' '}
              {firebaseDeployAtIso ? formatDateTime(firebaseDeployAtIso) : 'غير متاح'}
            </div>
            <div className="rounded-lg border border-slate-500/60 bg-slate-800/60 px-3 py-2 text-slate-100">
              <span className="font-black">آخر تنفيذ ناجح:</span>{' '}
              {latestSentRecord ? formatDateTime(latestSentRecord.sentAt || latestSentRecord.createdAt) : 'لا يوجد'}
            </div>
            <div className={`rounded-lg border px-3 py-2 font-black ${sendStatusForCurrentDeployment.className}`}>
              حالة تنفيذ آخر تحديث: {sendStatusForCurrentDeployment.text}
            </div>
          </div>

          <div
            className={`mt-2 rounded-lg border px-3 py-2 text-xs sm:text-sm font-bold ${
              adminHasWaitingUpdate
                ? 'border-cyan-300/70 bg-cyan-900/20 text-cyan-100'
                : 'border-slate-500/60 bg-slate-800/60 text-slate-200'
            }`}
          >
            حالة جهاز الأدمن:{' '}
            {adminHasWaitingUpdate
              ? 'يوجد تحديث محلي وسيتم تطبيقه تلقائيًا على جهاز الأدمن.'
              : 'جهاز الأدمن على أحدث نسخة حالياً.'}
          </div>

          {firebaseDeployEtag && (
            <p className="text-slate-300 text-[11px] mt-2 font-semibold">ETag: {firebaseDeployEtag}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3">
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
              <span className="text-slate-300 text-xs font-semibold">آخر فحص: {lastCheckedAt}</span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-slate-200 text-sm font-bold">الفئة المستهدفة</label>
          <select
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value as UpdateBroadcastAudience)}
            className="w-full rounded-xl border border-slate-500 bg-slate-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
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
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black"
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

      <div className="bg-slate-700 rounded-2xl shadow-xl p-5 sm:p-6 border-t-4 border-emerald-400 dh-stagger-2" dir="rtl">
        <h4 className="text-white text-lg sm:text-xl font-black mb-4">سجل تنفيذ التحديثات</h4>
        {loadingRecords ? (
          <div className="text-slate-300 text-sm"><LoadingText>جارٍ تحميل السجل</LoadingText></div>
        ) : records.length === 0 ? (
          <div className="text-slate-300 text-sm">لا توجد عمليات تنفيذ حتى الآن.</div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => {
              const status = getStatusLabel(record.status);
              return (
                <div
                  key={record.id}
                  className="rounded-xl border border-slate-500 bg-slate-800/70 p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 rounded-lg bg-slate-700 text-slate-100 border border-slate-500">
                          الفئة: {getAudienceLabel(record.targetAudience)}
                        </span>
                        <span className={`px-2 py-1 rounded-lg border ${status.className}`}>
                          {status.text}
                        </span>
                        <span className="px-2 py-1 rounded-lg bg-slate-700 text-slate-100 border border-slate-500">
                          {formatDateTime(record.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        تم بواسطة: {record.createdBy}
                      </p>
                      <p className="text-xs text-emerald-200 font-semibold">
                        النتيجة: {record.resultText}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        void handleResend(record);
                      }}
                      disabled={sending}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-black"
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
