import React, { useEffect, useRef, useState } from 'react';
import { useOnlineStatus, type SyncState } from '../../hooks/useOnlineStatus';

type MessageKind = 'offline' | 'unstable' | 'back-online' | 'syncing' | 'synced';

interface Message {
  kind: MessageKind;
  /** هل الرسالة دي بتختفي تلقائي؟ — رسائل الحالة السيئة (offline/unstable) لا تختفي */
  persistent: boolean;
  id: number;
}

const AUTO_HIDE_MS = 5000;

/**
 * شريط حالة الاتصال — يظهر فوق الشاشة:
 *   - offline   → "غير متصل بالإنترنت" — يفضل ظاهر طول ما النت فاصل
 *   - unstable  → "الإنترنت غير مستقر" — يفضل ظاهر طول ما الشبكة ضعيفة
 *   - syncing   → "جاري المزامنة" — يفضل ظاهر لحد ما المزامنة تخلص
 *   - back-online/synced → رسالة نجاح، تختفي بعد 5 ثوان تلقائياً
 *
 * المنطق: الرسائل الـ"persistent" بتظل ظاهرة طول ما الحالة قائمة.
 * بس الـ"success" بنخفيها بعد فترة قصيرة عشان مايبقاش فيه إزعاج بصري دائم.
 */
export const OfflineIndicator: React.FC = () => {
  const state = useOnlineStatus();
  const [message, setMessage] = useState<Message | null>(null);
  const prevStateRef = useRef<SyncState>(state);
  const hideTimerRef = useRef<number | null>(null);
  const messageCounterRef = useRef(0);

  useEffect(() => {
    const prev = prevStateRef.current;
    prevStateRef.current = state;

    // تحديد نوع الرسالة المناسبة لكل تغيير حالة
    let kind: MessageKind | null = null;
    let persistent = false;

    if (state === 'offline') {
      kind = 'offline';
      persistent = true;
    } else if (state === 'unstable') {
      kind = 'unstable';
      persistent = true;
    } else if (state === 'syncing') {
      kind = 'syncing';
      persistent = true;
    } else if (state === 'online') {
      // الانتقال من حالة سيئة لحالة جيدة — نعرض رسالة نجاح مؤقتة
      if (prev === 'offline') {
        kind = 'back-online';
        persistent = false;
      } else if (prev === 'syncing') {
        kind = 'synced';
        persistent = false;
      } else if (prev === 'unstable') {
        // الشبكة كانت ضعيفة وبقت كويسة — رسالة نجاح خفيفة
        kind = 'back-online';
        persistent = false;
      }
    }

    // لو نفس الحالة ومفيش تغيير، مايتعملش حاجة (بس لو الـmessage موجود بنخليه)
    if (!kind) {
      // لو الحالة بقت online ومفيش تغيير سابق محتاج رسالة نجاح، نخفي أي رسالة قائمة
      if (state === 'online' && message?.persistent) {
        setMessage(null);
        if (hideTimerRef.current != null) {
          window.clearTimeout(hideTimerRef.current);
          hideTimerRef.current = null;
        }
      }
      return;
    }

    // نلغي أي مؤقت إخفاء سابق قبل ما نعرض رسالة جديدة
    if (hideTimerRef.current != null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    const id = ++messageCounterRef.current;
    setMessage({ kind, persistent, id });

    // الرسائل المؤقتة بس هي اللي بتختفي تلقائي
    if (!persistent) {
      hideTimerRef.current = window.setTimeout(() => {
        setMessage((current) => (current && current.id === id ? null : current));
        hideTimerRef.current = null;
      }, AUTO_HIDE_MS);
    }
  }, [state, message]);

  useEffect(() => () => {
    if (hideTimerRef.current != null) window.clearTimeout(hideTimerRef.current);
  }, []);

  if (!message) return null;

  const config = {
    offline: {
      bg: 'bg-slate-900/95',
      text: 'text-white',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m-3.536-3.536a4 4 0 010-5.656M3 3l18 18" />
        </svg>
      ),
      label: 'غير متصل بالإنترنت — التطبيق يعمل من الذاكرة المحلية',
    },
    unstable: {
      // أصفر warning — تحذير بسيط بدون ما نخوّف المستخدم زي offline الأسود
      bg: 'bg-warning-500/95',
      text: 'text-white',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
        </svg>
      ),
      label: 'الإنترنت غير مستقر — قد تتأخر عمليات الحفظ',
    },
    syncing: {
      bg: 'bg-warning-500/95',
      text: 'text-white',
      icon: (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      label: 'جاري مزامنة التغييرات مع السيرفر',
    },
    'back-online': {
      bg: 'bg-success-600/95',
      text: 'text-white',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      label: 'عاد الاتصال — تم تحديث البيانات',
    },
    synced: {
      bg: 'bg-success-600/95',
      text: 'text-white',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
      label: 'تم حفظ جميع التغييرات',
    },
  }[message.kind];

  return (
    <div
      key={message.id}
      className={`fixed top-0 left-0 right-0 z-[9999] ${config.bg} ${config.text} backdrop-blur-sm shadow-lg pointer-events-none animate-[slideDown_0.25s_ease-out]`}
      dir="rtl"
      role="status"
      aria-live="polite"
    >
      <div className="max-w-5xl mx-auto px-4 py-1.5 flex items-center justify-center gap-2 text-xs md:text-sm font-black">
        {config.icon}
        <span>{config.label}</span>
      </div>
    </div>
  );
};
