import React, { useEffect, useRef, useState } from 'react';
import { useOnlineStatus, type SyncState } from '../../hooks/useOnlineStatus';

type MessageKind = 'offline' | 'back-online' | 'syncing' | 'synced';

interface Message {
  kind: MessageKind;
  id: number;
}

const AUTO_HIDE_MS = 5000;

/**
 * شريط حالة الاتصال: يظهر فقط عند حدوث تغيير في حالة الشبكة/المزامنة،
 * ويختفي تلقائياً بعد 5 ثوانٍ — لا يبقى معلّقاً على الشاشة.
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
    if (prev === state) return;

    let kind: MessageKind | null = null;
    if (state === 'offline') kind = 'offline';
    else if (state === 'syncing') kind = 'syncing';
    else if (state === 'online' && (prev === 'offline' || prev === 'syncing')) kind = prev === 'offline' ? 'back-online' : 'synced';

    if (!kind) return;

    const id = ++messageCounterRef.current;
    setMessage({ kind, id });

    if (hideTimerRef.current != null) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      setMessage((current) => (current && current.id === id ? null : current));
      hideTimerRef.current = null;
    }, AUTO_HIDE_MS);
  }, [state]);

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
      label: 'بدون اتصال — التطبيق يعمل من الذاكرة المحلية',
    },
    syncing: {
      bg: 'bg-amber-500/95',
      text: 'text-white',
      icon: (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      label: 'جاري مزامنة التغييرات مع السيرفر',
    },
    'back-online': {
      bg: 'bg-emerald-600/95',
      text: 'text-white',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      label: 'عاد الاتصال — تم تحديث البيانات',
    },
    synced: {
      bg: 'bg-emerald-600/95',
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
