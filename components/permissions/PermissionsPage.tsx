/**
 * صفحة الأذونات (PermissionsPage)
 * ─────────────────────────────────────────────
 * صفحة مخصصة لإدارة كل أذونات الجهاز اللي بيحتاجها التطبيق:
 *   1. إذن الإشعارات (Notification Permission) — الأهم.
 *
 * الفايدة الأساسية:
 *  - الطبيب يقدر يشوف هل الإشعارات مفعّلة فعلاً ولا لأ، حتى لو فاتت بطاقة التذكير.
 *  - لو حصل تعليق في الـ FCM token (شبكة بطيئة، SW تالف) — هنا فيه زر إعادة محاولة
 *    وtimeout واضح، فالطبيب ميفضلش مستني للأبد زي البطاقة العادية.
 *  - شرح مكتوب باللغة العربية البسيطة لكل حالة (مدعومة، مرفوضة، مش مدعومة).
 *
 * مكان الصفحة في التنقل: قبل زر تسجيل الخروج مباشرةً في السايدبار.
 */

import React, { useEffect, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  FaBell,
  FaCircleCheck,
  FaCircleExclamation,
  FaCircleXmark,
  FaArrowsRotate,
  FaShieldHalved,
} from 'react-icons/fa6';

type MessagingModule = typeof import('../../services/messagingService');

interface PermissionsPageProps {
  user: User | null;
}

/** حالة إذن الإشعارات الموسّعة — أكتر تفصيلاً من Notification.permission المجرد */
type NotificationStatus =
  | 'granted'         // مفعّل ومخزّن في Firebase
  | 'denied'          // المستخدم رفضه — لازم يفعّله من إعدادات المتصفح
  | 'default'         // لسه ما اتسألش — يقدر يفعّل بضغطة
  | 'unsupported'     // المتصفح/الجهاز ما بيدعمش
  | 'ios-install'     // iPhone محتاج Add to Home Screen الأول
  | 'unknown';

const STATUS_REFRESH_INTERVAL_MS = 4_000;

export const PermissionsPage: React.FC<PermissionsPageProps> = ({ user }) => {
  const [status, setStatus] = useState<NotificationStatus>('unknown');
  const [unsupportedReason, setUnsupportedReason] = useState<string>('');
  const [isToggling, setIsToggling] = useState(false);
  // رسالة آخر محاولة — تظهر بعد ضغط الزر فقط (نجاح/فشل/مهلة)
  const [lastActionMessage, setLastActionMessage] = useState<{ kind: 'success' | 'error' | 'info'; text: string } | null>(null);
  const messagingModuleRef = useRef<MessagingModule | null>(null);

  const getMessagingModule = async (): Promise<MessagingModule> => {
    if (messagingModuleRef.current) return messagingModuleRef.current;
    const mod = await import('../../services/messagingService');
    messagingModuleRef.current = mod;
    return mod;
  };

  const refreshStatus = async () => {
    try {
      const mod = await getMessagingModule();
      const support = mod.getPushSupportInfo();
      if (!support.supported) {
        if (support.reason === 'ios-install-required') {
          setStatus('ios-install');
        } else {
          setStatus('unsupported');
        }
        setUnsupportedReason(String(support.reason || ''));
        return;
      }
      setUnsupportedReason('');
      const perm = typeof Notification !== 'undefined' ? Notification.permission : 'default';
      if (perm === 'granted') setStatus('granted');
      else if (perm === 'denied') setStatus('denied');
      else setStatus('default');
    } catch (err) {
      console.warn('[PermissionsPage] refreshStatus failed:', err);
      setStatus('unknown');
    }
  };

  // فحص أوّلي + متابعة دورية — لو المستخدم غيّر الإذن من إعدادات المتصفح
  // الصفحة تتحدّث تلقائياً من غير ما يلزم refresh.
  useEffect(() => {
    void refreshStatus();
    const interval = setInterval(() => { void refreshStatus(); }, STATUS_REFRESH_INTERVAL_MS);
    const onVis = () => { if (!document.hidden) void refreshStatus(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  const handleEnable = async () => {
    if (!user) {
      setLastActionMessage({ kind: 'error', text: 'لا يوجد مستخدم حالياً. سجّل الدخول وأعد المحاولة.' });
      return;
    }
    setIsToggling(true);
    setLastActionMessage(null);
    try {
      const userRole = (user as any).authRole || 'doctor';
      const mod = await getMessagingModule();

      // نستخدم نسخة WithDetails عشان نقدر نعرض سبب الفشل (timeout / denied / token-empty)
      // في رسالة واضحة بدل ما الزر يرجع من غير سياق.
      const result =
        userRole === 'secretary'
          ? await mod.requestPermissionAndSaveTokenForSecretaryWithDetails(user.uid)
          : await mod.requestPermissionAndSaveTokenWithDetails(user.uid);

      if (result.ok) {
        setLastActionMessage({ kind: 'success', text: 'تم تفعيل الإشعارات بنجاح ✅' });
      } else {
        // ترجمة سبب الفشل لرسالة عربية مفهومة للطبيب — مش كود تقني
        const reasonText = (() => {
          switch (result.reason) {
            case 'timeout':
              return 'استغرق التفعيل وقتاً طويلاً. تأكّد من جودة الإنترنت وأعد المحاولة. لو استمرت المشكلة، أعد تشغيل المتصفح.';
            case 'permission-denied':
              return 'تم رفض الإذن. افتح إعدادات الموقع في المتصفح وفعّل الإشعارات يدوياً ثم أعد المحاولة.';
            case 'token-empty':
              return 'تعذّر تسجيل الجهاز عند خادم الإشعارات. أغلق التطبيق وافتحه مرة أخرى.';
            case 'sw-registration-failed':
              return 'فشل تشغيل خدمة الإشعارات في الخلفية. أعد تحميل الصفحة (Ctrl+Shift+R) ثم حاول.';
            case 'unsupported':
              return 'هذا الجهاز/المتصفح لا يدعم الإشعارات.';
            case 'save-failed':
              return 'تم منح الإذن لكن فشل الحفظ في الحساب. تحقق من الإنترنت وأعد المحاولة.';
            default:
              return 'حدث خطأ غير متوقع. أعد المحاولة بعد لحظات.';
          }
        })();
        setLastActionMessage({ kind: 'error', text: reasonText });
      }
    } catch (err) {
      console.error('[PermissionsPage] enable failed:', err);
      setLastActionMessage({ kind: 'error', text: 'حدث خطأ غير متوقع. أعد المحاولة.' });
    } finally {
      setIsToggling(false);
      void refreshStatus();
    }
  };

  // ── ألوان ورموز كل حالة ── (قراءة سهلة من غلطة بصرية واحدة)
  const statusVisuals = (() => {
    switch (status) {
      case 'granted':
        return {
          icon: <FaCircleCheck className="w-5 h-5" />,
          label: 'مفعّلة',
          textColor: 'text-success-700',
          bg: 'bg-success-50',
          border: 'border-success-200',
          dot: 'bg-success-500',
        };
      case 'denied':
        return {
          icon: <FaCircleXmark className="w-5 h-5" />,
          label: 'مرفوضة',
          textColor: 'text-danger-700',
          bg: 'bg-danger-50',
          border: 'border-danger-200',
          dot: 'bg-danger-500',
        };
      case 'default':
        return {
          icon: <FaCircleExclamation className="w-5 h-5" />,
          label: 'غير مفعّلة',
          textColor: 'text-warning-700',
          bg: 'bg-warning-50',
          border: 'border-warning-200',
          dot: 'bg-warning-500',
        };
      case 'ios-install':
        return {
          icon: <FaCircleExclamation className="w-5 h-5" />,
          label: 'يلزم تثبيت التطبيق',
          textColor: 'text-warning-700',
          bg: 'bg-warning-50',
          border: 'border-warning-200',
          dot: 'bg-warning-500',
        };
      case 'unsupported':
        return {
          icon: <FaCircleXmark className="w-5 h-5" />,
          label: 'غير مدعومة',
          textColor: 'text-slate-700',
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          dot: 'bg-slate-400',
        };
      default:
        return {
          icon: <FaCircleExclamation className="w-5 h-5" />,
          label: 'جاري التحقّق...',
          textColor: 'text-slate-700',
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  })();

  // النص التفسيري تحت الحالة — ببساطة للأطباء، بدون مصطلحات تقنية
  const statusDescription = (() => {
    switch (status) {
      case 'granted':
        return 'الإشعارات مفعّلة على هذا الجهاز. ستصلك تنبيهات طلبات السكرتارية وغيرها فوراً.';
      case 'denied':
        return 'الإشعارات مرفوضة من إعدادات المتصفح. افتح أيقونة القفل بجوار العنوان في الأعلى، اختر "إعدادات الموقع"، وفعّل خيار "الإشعارات"، ثم أعد تحميل الصفحة.';
      case 'default':
        return 'الإشعارات غير مفعّلة. اضغط زر "تفعيل" بالأسفل وستظهر نافذة طلب الإذن من المتصفح.';
      case 'ios-install':
        return 'على أجهزة iPhone و iPad، يلزم تثبيت التطبيق على الشاشة الرئيسية أولاً (Add to Home Screen) من قائمة المشاركة في Safari، ثم فتحه من الأيقونة المثبّتة لتفعيل الإشعارات.';
      case 'unsupported':
        return 'هذا المتصفح أو الجهاز لا يدعم الإشعارات الفورية. جرّب استخدام Chrome أو Edge على Windows/Android.';
      default:
        return 'لحظة، نتحقّق من حالة الإشعارات على هذا الجهاز...';
    }
  })();

  // متى يظهر زر التفعيل؟ بس لما يقدر فعلاً يفعّل (default) أو يعيد المحاولة بعد فشل.
  const canEnable = status === 'default' || status === 'denied';
  // زر "إعادة المحاولة" يظهر بعد محاولة فاشلة بنفس الـ default — ولكن النص بيتغيّر.
  const enableButtonLabel = status === 'denied' ? 'إعادة المحاولة بعد التفعيل من المتصفح' : 'تفعيل الإشعارات';

  return (
    <div dir="rtl" className="max-w-3xl mx-auto p-4 sm:p-6 space-y-5">
      {/* ── العنوان ── */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shadow-sm">
          <FaShieldHalved className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">الأذونات</h1>
          <p className="text-xs sm:text-sm font-bold text-slate-500 mt-0.5">إدارة أذونات الجهاز التي يحتاجها التطبيق</p>
        </div>
      </div>

      {/* ── بطاقة إذن الإشعارات ── */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* رأس البطاقة — أيقونة + اسم الإذن */}
        <header className="flex items-center gap-3 px-4 sm:px-5 py-4 border-b border-slate-100 bg-gradient-to-l from-slate-50 to-white">
          <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
            <FaBell className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-black text-slate-800 text-sm sm:text-base">إشعارات التطبيق</h2>
            <p className="text-xs font-bold text-slate-500 mt-0.5">تنبيهات طلبات السكرتارية والمواعيد والتحديثات المهمة</p>
          </div>
          {/* مؤشر الحالة الصغير — نقطة ملوّنة + نص */}
          <div className={`flex items-center gap-2 rounded-full px-3 py-1 ${statusVisuals.bg} ${statusVisuals.border} border`}>
            <span className={`w-2 h-2 rounded-full ${statusVisuals.dot}`} aria-hidden="true" />
            <span className={`text-xs font-black ${statusVisuals.textColor}`}>{statusVisuals.label}</span>
          </div>
        </header>

        {/* جسم البطاقة — التفاصيل + زر التفعيل */}
        <div className="px-4 sm:px-5 py-4 space-y-4">
          <div className={`flex items-start gap-3 rounded-xl p-3 ${statusVisuals.bg} ${statusVisuals.border} border`}>
            <span className={`shrink-0 mt-0.5 ${statusVisuals.textColor}`}>{statusVisuals.icon}</span>
            <p className={`text-sm font-bold leading-relaxed ${statusVisuals.textColor}`}>{statusDescription}</p>
          </div>

          {/* رسالة آخر محاولة — تظهر بعد ضغط الزر فقط */}
          {lastActionMessage && (
            <div
              className={`rounded-xl p-3 text-sm font-bold leading-relaxed border
                ${lastActionMessage.kind === 'success'
                  ? 'bg-success-50 border-success-200 text-success-800'
                  : lastActionMessage.kind === 'error'
                    ? 'bg-danger-50 border-danger-200 text-danger-800'
                    : 'bg-blue-50 border-blue-200 text-blue-800'}`}
            >
              {lastActionMessage.text}
            </div>
          )}

          {/* أزرار الإجراءات */}
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => { void refreshStatus(); }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-colors"
            >
              <FaArrowsRotate className="w-3.5 h-3.5" />
              تحديث الحالة
            </button>

            {canEnable && (
              <button
                type="button"
                onClick={handleEnable}
                disabled={isToggling}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs sm:text-sm font-black hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow"
              >
                {isToggling ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    جاري التفعيل...
                  </>
                ) : (
                  <>
                    <FaBell className="w-3.5 h-3.5" />
                    {enableButtonLabel}
                  </>
                )}
              </button>
            )}
          </div>

          {/* تنبيه إضافي للحالات اللي محتاجة خطوات يدوية */}
          {status === 'denied' && (
            <details className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <summary className="text-xs font-black text-slate-700 cursor-pointer">كيف أفعّل الإشعارات يدوياً من المتصفح؟</summary>
              <ol className="mt-2 mr-4 text-xs font-bold text-slate-600 leading-relaxed list-decimal space-y-1">
                <li>اضغط على أيقونة القفل (🔒) بجوار عنوان الموقع أعلى المتصفح.</li>
                <li>اختر "إعدادات الموقع" أو "Site settings".</li>
                <li>غيّر "الإشعارات" من "حظر" إلى "السماح".</li>
                <li>أعد تحميل الصفحة (F5)، ثم ارجع لهذه الصفحة واضغط "إعادة المحاولة".</li>
              </ol>
            </details>
          )}

          {status === 'ios-install' && (
            <details className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <summary className="text-xs font-black text-slate-700 cursor-pointer">كيف أثبّت التطبيق على iPhone؟</summary>
              <ol className="mt-2 mr-4 text-xs font-bold text-slate-600 leading-relaxed list-decimal space-y-1">
                <li>افتح الموقع من متصفح Safari (مش Chrome).</li>
                <li>اضغط زر "المشاركة" في الأسفل (مربّع وسهم لأعلى).</li>
                <li>اختر "Add to Home Screen / إضافة للشاشة الرئيسية".</li>
                <li>افتح التطبيق من الأيقونة الجديدة على الشاشة الرئيسية.</li>
                <li>ارجع لصفحة الأذونات وفعّل الإشعارات من هنا.</li>
              </ol>
            </details>
          )}

          {/* للديباج: لو في reason غير معروف نظهره خفيف للأدمن — شائع في الأجهزة الغريبة */}
          {status === 'unsupported' && unsupportedReason && (
            <p className="text-[11px] text-slate-400 font-mono leading-snug">السبب التقني: {unsupportedReason}</p>
          )}
        </div>
      </section>

      {/* ملاحظة عامة في الأسفل */}
      <p className="text-xs text-slate-500 font-bold leading-relaxed text-center">
        تنبيه: لو سبق وفعّلت الإشعارات وما بتوصل، اضغط "تفعيل" مرّة أخرى من هنا — أحياناً يُلغى التسجيل بعد فترة طويلة من عدم الاستخدام أو بعد تنظيف بيانات المتصفح.
      </p>
    </div>
  );
};
