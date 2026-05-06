/**
 * ScaleToolsPanel — لوحة أدوات التوسع للأدمن
 *
 * الفائدة: تمكّن الأدمن من تشغيل العدّاد وملخصات المرضى من الواجهة مباشرة،
 * بدون ما يحتاج يفتح Console أو يكتب أكواد. كل عملية بزرار واحد:
 *   - زرار إعادة حساب الإحصائيات (يستدعي recomputeDoctorStats)
 *   - زرار إعادة حساب ملفات المرضى (يستدعي recomputePatientSummaries)
 *   - أزرار تشغيل/إيقاف المفاتيح في localStorage
 *
 * الزرار يظهر بس لو الأدمن مسجّل دخول (isAdminUser=true). أي طبيب تاني،
 * هذا الـ panel مش هيكون متاح في الـ navigation.
 */

import React, { useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../services/firebaseConfig';

// مفاتيح الـ localStorage اللي بتتحكم في تشغيل المراحل من الواجهة
const FLAG_KEYS = [
  { key: 'dh_records_pagination_enabled', label: 'تحميل السجلات بالصفحات (المرحلة 3)' },
  { key: 'dh_doctor_stats_counter_enabled', label: 'عدّاد الإحصائيات (المرحلة 1)' },
  { key: 'dh_patient_summaries_enabled', label: 'ملخصات المرضى (المرحلة 2)' },
] as const;

const isFlagOn = (key: string): boolean => {
  try {
    const value = String(localStorage.getItem(key) || '').trim().toLowerCase();
    return value === 'true' || value === '1' || value === 'on';
  } catch {
    return false;
  }
};

type LogLine = { type: 'info' | 'success' | 'error'; text: string };

export const ScaleToolsPanel: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<LogLine[]>([]);
  const [flagStates, setFlagStates] = useState<Record<string, boolean>>({});

  // قراءة حالة المفاتيح من localStorage (يتحدث لما الـ panel يفتح)
  useEffect(() => {
    const states: Record<string, boolean> = {};
    FLAG_KEYS.forEach((f) => {
      states[f.key] = isFlagOn(f.key);
    });
    setFlagStates(states);
  }, []);

  const append = (line: LogLine) => setLog((prev) => [...prev, line]);

  // تشغيل أو إيقاف مفتاح معيّن في localStorage
  const toggleFlag = (key: string) => {
    try {
      const current = isFlagOn(key);
      if (current) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, 'true');
      }
      setFlagStates((prev) => ({ ...prev, [key]: !current }));
      append({
        type: 'info',
        text: `${current ? 'أوقفت' : 'شغّلت'} المفتاح: ${key}`,
      });
    } catch (e) {
      append({ type: 'error', text: `فشل تغيير المفتاح: ${(e as Error).message}` });
    }
  };

  // إعادة الحساب من الصفر — يستدعي Cloud Functions
  const runReconcileAll = async () => {
    setRunning(true);
    try {
      append({ type: 'info', text: '⏳ بدء حساب الإحصائيات من السجلات...' });
      const recomputeStats = httpsCallable(functions, 'recomputeDoctorStats');
      const r1 = await recomputeStats({});
      append({
        type: 'success',
        text: `✓ تم حساب الإحصائيات: ${JSON.stringify(r1.data)}`,
      });

      append({ type: 'info', text: '⏳ بدء حساب ملفات المرضى من السجلات...' });
      const recomputeSummaries = httpsCallable(functions, 'recomputePatientSummaries');
      const r2 = await recomputeSummaries({});
      append({
        type: 'success',
        text: `✓ تم حساب ملفات المرضى: ${JSON.stringify(r2.data)}`,
      });

      append({ type: 'success', text: '🎉 تمت كل العمليات بنجاح' });
    } catch (e) {
      append({ type: 'error', text: `✗ خطأ: ${(e as Error).message}` });
    } finally {
      setRunning(false);
    }
  };

  // تشغيل كل المفاتيح دفعة واحدة (للتجربة الكاملة)
  const enableAllFlags = () => {
    FLAG_KEYS.forEach((f) => {
      try {
        localStorage.setItem(f.key, 'true');
      } catch { /* no-op */ }
    });
    setFlagStates(Object.fromEntries(FLAG_KEYS.map((f) => [f.key, true])));
    append({ type: 'success', text: '✓ كل المفاتيح اتشغّلت — ارفرش الصفحة عشان تشتغل' });
  };

  // إيقاف كل المفاتيح (للرجوع للسلوك القديم)
  const disableAllFlags = () => {
    FLAG_KEYS.forEach((f) => {
      try {
        localStorage.removeItem(f.key);
      } catch { /* no-op */ }
    });
    setFlagStates(Object.fromEntries(FLAG_KEYS.map((f) => [f.key, false])));
    append({ type: 'info', text: 'كل المفاتيح اتقفلت — ارفرش الصفحة عشان ترجع للسلوك القديم' });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4" dir="rtl">
      <div>
        <h2 className="text-lg font-bold text-slate-800">أدوات التوسع (Scale Tools)</h2>
        <p className="text-xs text-slate-500 mt-1">
          أدوات لتشغيل وإدارة عدّاد الإحصائيات وملخصات المرضى. متاحة للأدمن فقط.
        </p>
      </div>

      {/* الخطوة 1: إعادة الحساب */}
      <section className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50/30">
        <div>
          <h3 className="font-bold text-slate-700 text-sm">الخطوة الأولى: إعادة حساب من السجلات</h3>
          <p className="text-xs text-slate-500 mt-1">
            دي بتقرا كل سجلاتك وتبني الإحصائيات وملفات المرضى من الصفر في السيرفر.
            لازم تشتغل مرة واحدة قبل تشغيل المفاتيح.
          </p>
        </div>
        <button
          onClick={runReconcileAll}
          disabled={running}
          className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {running ? '⏳ جاري الحساب...' : 'إعادة حساب الإحصائيات وملفات المرضى'}
        </button>
      </section>

      {/* الخطوة 2: المفاتيح */}
      <section className="border border-slate-100 rounded-xl p-4 space-y-3 bg-slate-50/30">
        <div>
          <h3 className="font-bold text-slate-700 text-sm">الخطوة الثانية: المفاتيح</h3>
          <p className="text-xs text-slate-500 mt-1">
            بعد إعادة الحساب، شغّل المفاتيح عشان الواجهة تستخدم البيانات الجاهزة من السيرفر.
            لو حصل أي خلل، اضغط "إيقاف الكل" والواجهة ترجع لسلوكها القديم فوراً.
          </p>
        </div>

        <div className="space-y-2">
          {FLAG_KEYS.map((f) => (
            <div
              key={f.key}
              className="flex items-center justify-between bg-white border border-slate-100 rounded-lg p-2.5"
            >
              <span className="text-xs font-bold text-slate-700">{f.label}</span>
              <button
                onClick={() => toggleFlag(f.key)}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                  flagStates[f.key]
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                {flagStates[f.key] ? 'مفعّل' : 'مقفول'}
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={enableAllFlags}
            className="flex-1 py-2 px-3 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-700 transition"
          >
            تشغيل الكل
          </button>
          <button
            onClick={disableAllFlags}
            className="flex-1 py-2 px-3 bg-slate-500 text-white rounded-lg font-bold text-xs hover:bg-slate-600 transition"
          >
            إيقاف الكل
          </button>
        </div>
      </section>

      {/* السجل */}
      {log.length > 0 && (
        <section className="border border-slate-100 rounded-xl p-3 bg-slate-900 text-slate-100">
          <div className="text-xs font-bold mb-2 text-slate-400">سجل العمليات</div>
          <div className="space-y-1 font-mono text-[11px] leading-relaxed max-h-48 overflow-y-auto">
            {log.map((line, idx) => (
              <div
                key={idx}
                className={
                  line.type === 'success'
                    ? 'text-emerald-400'
                    : line.type === 'error'
                      ? 'text-rose-400'
                      : 'text-slate-300'
                }
              >
                {line.text}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
