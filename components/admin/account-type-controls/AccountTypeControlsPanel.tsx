/**
 * AccountTypeControlsPanel — تصميم مسطح مع توسيع inline
 *
 * Bugs fixed:
 *   1. الحفظ معطل أثناء التحميل (loading)
 *   2. فشل التحميل بيمنع الحفظ تماما (عشان ما يدوسش على البيانات الحقيقية)
 *   3. Dirty state tracking + تحذير قبل الخروج لو في تعديلات غير محفوظة
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FaSliders, FaWhatsapp, FaFloppyDisk,
  FaCircleCheck, FaCircleXmark, FaListCheck,
  FaTriangleExclamation, FaArrowRotateLeft,
} from 'react-icons/fa6';
import { useAuth } from '../../../hooks/useAuth';
import { useIsAdmin } from '../../../hooks/useIsAdmin';
import {
  getAccountTypeControls, updateAccountTypeControls,
} from '../../../services/accountTypeControlsService';
import {
  DEFAULT_FORM, ORDERED_GROUPS,
  LIMIT_MESSAGE_KEYS, WHATSAPP_MESSAGE_KEYS,
} from './constants';
import { AccountTypeControlsForm } from '../../../types';
import { PlanGroupSection } from './PlanGroupSection';
import { buildPayloadForSave, digitsOnly, getErrorMessage } from './utils';
import { LoadingText } from '../../ui/LoadingText';
import { LoadingStateScreen } from '../../app/LoadingStateScreen';

export const AccountTypeControlsPanel: React.FC = () => {
  const { user } = useAuth();
  const canManageControls = useIsAdmin(user);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [form, setForm] = useState<AccountTypeControlsForm>(DEFAULT_FORM);
  const [loadError, setLoadError] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  /* ── Wrap setForm to auto-mark dirty on any change ── */
  const setFormAndMarkDirty: React.Dispatch<React.SetStateAction<AccountTypeControlsForm>> =
    useCallback((updater) => {
      setForm(updater);
      setIsDirty(true);
    }, []);

  /* ── Load data ── */
  const didLoadRef = useRef(false);
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!canManageControls) {
        if (mounted) setLoading(false);
        return;
      }
      setLoading(true);
      setLoadError('');
      try {
        const data = await getAccountTypeControls();
        if (!mounted) return;
        setForm((prev) => ({ ...prev, ...(data as Partial<AccountTypeControlsForm>) }));
        didLoadRef.current = true;
        setIsDirty(false); // إعادة التعيين بعد التحميل
      } catch (error: unknown) {
        if (!mounted) return;
        const msg = getErrorMessage(error);
        setLoadError(msg);
        setMessage(`فشل تحميل الإعدادات: ${msg}`);
        setMessageType('error');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [canManageControls]);

  /* ── Warn before leaving with unsaved changes ── */
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  /* ── إعادة تعيين كل الرسائل للافتراضية ──────────────────────────────────
   * لو الأدمن قبل كده حافظ رسائل قديمة، الافتراضيات الجديدة ما بتظهرش لأنها
   * بيتم تخطيها بالقيم المحفوظة. الزرار ده بيستبدل كل الرسائل بالافتراضية
   * الحالية (limit + whatsapp + locked) — بدون حفظ تلقائي عشان الأدمن يقدر
   * يراجع قبل ما يضغط "حفظ".
   */
  const handleResetMessagesToDefaults = useCallback(() => {
    const ok = window.confirm(
      'هل تريد إعادة تعيين كل رسائل تجاوز الحد ورسائل الواتساب للقيم الافتراضية؟\n\n'
        + 'هذا سيستبدل أي تعديلات سابقة في نصوص الرسائل فقط (لن يغيّر الأرقام أو الإعدادات الأخرى).\n\n'
        + 'تحتاج للضغط على "حفظ الإعدادات" بعد التأكد عشان التغيير يتطبّق.',
    );
    if (!ok) return;
    setFormAndMarkDirty((prev) => {
      const next = { ...prev };
      // كل رسائل تجاوز الحد + رسائل الواتساب
      LIMIT_MESSAGE_KEYS.forEach((key) => {
        next[key] = DEFAULT_FORM[key] || '';
      });
      WHATSAPP_MESSAGE_KEYS.forEach((key) => {
        next[key] = DEFAULT_FORM[key] || '';
      });
      // ✂️ شيلنا رسائل القفل للأدوات — مش مستخدمة دلوقتي.
      return next;
    });
    setMessage('تم تحميل الرسائل الافتراضية. اضغط "حفظ الإعدادات" للتطبيق.');
    setMessageType('success');
    setTimeout(() => { setMessage(''); setMessageType(null); }, 5000);
  }, [setFormAndMarkDirty]);

  /* ── Save ── */
  const handleSave = async () => {
    if (!canManageControls) {
      setMessage('غير مصرح لك بتعديل إعدادات أنواع الحساب.');
      setMessageType('error');
      return;
    }
    if (loadError || !didLoadRef.current) {
      setMessage('لا يمكن الحفظ قبل تحميل الإعدادات الحالية بنجاح.');
      setMessageType('error');
      return;
    }
    setSaving(true);
    setMessage('');
    setMessageType(null);
    try {
      const payload = buildPayloadForSave(form);
      const saved = await updateAccountTypeControls(payload);
      setForm((prev) => ({ ...prev, ...(saved as Partial<AccountTypeControlsForm>) }));
      setIsDirty(false);
      setMessage('تم حفظ إعدادات أنواع الحساب بنجاح.');
      setMessageType('success');
      setTimeout(() => { setMessage(''); setMessageType(null); }, 4000);
    } catch (error: unknown) {
      setMessage(`فشل حفظ الإعدادات: ${getErrorMessage(error)}`);
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingStateScreen message="جاري تحميل إعدادات أنواع الحساب" />;
  }

  if (!canManageControls) {
    return (
      <div className="rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm font-bold text-danger-700">
        غير مصرح لك بالوصول إلى إعدادات أنواع الحساب.
      </div>
    );
  }

  const saveDisabled = saving || !!loadError || !didLoadRef.current;

  return (
    <div className="space-y-4 sm:space-y-5 pb-24">

      {/* ═══ Header ═══
          shrink-0 على الأيقونة + min-w-0 flex-1 على كتلة النص = عشان النص يتلف
          بأمان من غير ما يخرج برا الشاشة على الموبايل. */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 text-white rounded-lg p-1.5 sm:p-2 shrink-0 shadow-sm">
          <FaSliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-lg lg:text-xl font-black text-slate-800 tracking-tight">
            ضبط أنواع الحساب
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500">
            الأرقام قابلة للتعديل المباشر · الرسائل بتتوسع داخل نفس البطاقة.
          </p>
        </div>
      </div>

      {/* ═══ Load Error Banner (blocks editing) ═══ */}
      {loadError && (
        <div className="flex items-start gap-3 rounded-2xl border-2 border-danger-200 bg-danger-50 p-4">
          <FaTriangleExclamation className="w-4 h-4 text-danger-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-danger-800">فشل تحميل الإعدادات الحالية</p>
            <p className="mt-1 text-[11px] font-bold text-danger-600/80">
              {loadError}
            </p>
            <p className="mt-2 text-[11px] font-bold text-danger-700">
              الحفظ معطل لحماية الإعدادات الحالية. حدث الصفحة بعد ما يرجع الاتصال.
            </p>
          </div>
        </div>
      )}

      {/* ═══ Dirty Indicator ═══ */}
      {isDirty && !loadError && (
        <div className="flex items-center gap-2 rounded-xl border-2 border-warning-200 bg-warning-50 px-3 py-2">
          <FaTriangleExclamation className="w-3.5 h-3.5 text-warning-600 shrink-0" />
          <p className="text-[11px] font-black text-warning-700">
            عندك تعديلات لسه مش محفوظة — اضغط "حفظ الإعدادات" قبل ما تخرج من الصفحة.
          </p>
        </div>
      )}

      {/* Wrap editable content — disable interactions if loadError */}
      <fieldset disabled={!!loadError} className="space-y-4 sm:space-y-5 disabled:opacity-60">

        {/* ═══ WhatsApp Number Card ═══ */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-2.5 sm:p-4 min-w-0">
          {/* flex-wrap عشان "(دولي بدون +)" يلف لسطر تاني على الموبايل بدل ما يخرج برا */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2 min-w-0">
            <div className="bg-gradient-to-br from-success-500 to-success-700 text-white rounded-lg p-1.5 shrink-0 shadow-sm">
              <FaWhatsapp className="w-3 h-3 text-white" />
            </div>
            <label className="text-xs sm:text-sm font-black text-slate-800">رقم واتساب الاشتراك</label>
            <span className="text-[10px] font-bold text-slate-400">(دولي بدون +)</span>
          </div>
          <input
            type="text"
            inputMode="numeric"
            value={form.whatsappNumber}
            onChange={(e) =>
              setFormAndMarkDirty((prev) => ({ ...prev, whatsappNumber: digitsOnly(e.target.value) }))
            }
            placeholder="201092805293"
            dir="ltr"
            className="w-full max-w-md min-w-0 h-[44px] rounded-2xl border-2 border-slate-200 bg-white px-4 text-sm font-black text-slate-900 placeholder-slate-400 focus:border-brand-400 hover:border-brand-300 focus:outline-none transition-colors"
          />
        </div>

        {/* ═══ 🆕 رفع الصور للحساب المجاني — toggle بسيط ═══
            القاعدة: Pro/Pro Max دايماً يقدروا. Free يقدر فقط لو الـtoggle مفعّل هنا.
            المنع بيظهر للطبيب كمودال "ترقية للـPro" بدل ما يفتح متصفح الملفات. */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 sm:p-4 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-black text-slate-800 mb-1">
                🖼️ السماح برفع الصور للحساب المجاني
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                لو مغلق: الطبيب المجاني هيشوف مودال "ترقية للـPro" لما يحاول يرفع أي صورة
                (بروفايل / شعار الروشتة / إعلان العيادة). Pro و Pro Max مش متأثرين.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={form.freeImageUploadsEnabled}
                onChange={(e) =>
                  setFormAndMarkDirty((prev) => ({ ...prev, freeImageUploadsEnabled: e.target.checked }))
                }
              />
              <div className="w-12 h-7 bg-slate-200 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-brand-500 peer-checked:to-brand-600 transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-5 after:shadow-sm" />
            </label>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <label className="block text-[11px] font-black text-slate-600 mb-1.5">
              رسالة الترقية (تظهر في المودال)
            </label>
            <textarea
              rows={2}
              value={form.freeImageUploadsUpgradeMessage}
              onChange={(e) =>
                setFormAndMarkDirty((prev) => ({ ...prev, freeImageUploadsUpgradeMessage: e.target.value }))
              }
              maxLength={500}
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-400 focus:outline-none transition-colors resize-none"
              placeholder="عزيزي الطبيب، ميزة رفع الصور متاحة للحسابات المدفوعة..."
            />
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <label className="block text-[11px] font-black text-slate-600 mb-1.5">
              رسالة الواتساب (تتبعت لما الطبيب يضغط "تواصل للترقية")
            </label>
            <textarea
              rows={2}
              value={form.freeImageUploadsUpgradeWhatsappMessage}
              onChange={(e) =>
                setFormAndMarkDirty((prev) => ({ ...prev, freeImageUploadsUpgradeWhatsappMessage: e.target.value }))
              }
              maxLength={500}
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-400 focus:outline-none transition-colors resize-none"
              placeholder="تحية طيبة، أرغب في تفعيل ميزة رفع الصور..."
            />
          </div>
        </div>

        {/* ═══ Features Section ═══ */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1 flex-wrap min-w-0">
            <div className="bg-gradient-to-br from-brand-500 to-brand-700 text-white rounded-lg p-1.5 shrink-0 shadow-sm">
              <FaListCheck className="w-3.5 h-3.5 text-white" />
            </div>
            <h3 className="text-sm sm:text-base font-black text-slate-800">حدود الميزات</h3>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400">
              ({ORDERED_GROUPS.length} ميزات)
            </span>
            {/* ─ زرار "إعادة تعيين الرسائل" — لو الأدمن عايز يرجّع كل الرسائل للصياغة الافتراضية ─ */}
            <button
              type="button"
              onClick={handleResetMessagesToDefaults}
              className="mr-auto inline-flex items-center gap-1.5 rounded-lg border border-warning-200 bg-warning-50 px-2 sm:px-2.5 py-1.5 text-[10px] sm:text-[11px] font-black text-warning-700 hover:bg-warning-100 transition"
              title="استبدال كل رسائل تجاوز الحد ورسائل الواتساب بالقيم الافتراضية الجديدة"
            >
              <FaArrowRotateLeft className="w-3 h-3 shrink-0" />
              إعادة تعيين الرسائل
            </button>
          </div>

          <div className="space-y-3">
            {ORDERED_GROUPS.map((group) => (
              <PlanGroupSection
                key={group.id}
                group={group}
                form={form}
                setForm={setFormAndMarkDirty}
                whatsappNumber={digitsOnly(form.whatsappNumber)}
              />
            ))}
          </div>
        </div>

        {/* ─ قسم "أدوات الأدوية" المنفصل اتشال 2026-04 — كل أدوات الأدوية بقت في "حدود الميزات" ─ */}

      </fieldset>

      {/* ═══ Sticky Save Bar ═══
          min-w-0 على الـmessage box عشان النص الطويل يلف بدل ما يخرج برا الشاشة. */}
      <div className="sticky bottom-2 z-20 mt-6 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-[0_-8px_24px_-12px_rgba(15,23,42,0.15)] px-3 sm:px-4 py-3 flex flex-wrap items-center justify-between gap-2 sm:gap-3 min-w-0">
        {message ? (
          <div
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold min-w-0 max-w-full ${
              messageType === 'success'
                ? 'border-success-200 bg-success-50 text-success-700'
                : 'border-danger-200 bg-danger-50 text-danger-700'
            }`}
          >
            {messageType === 'success' ? <FaCircleCheck className="w-3 h-3 shrink-0" /> : <FaCircleXmark className="w-3 h-3 shrink-0" />}
            <span className="min-w-0 break-words">{message}</span>
          </div>
        ) : isDirty ? (
          <p className="text-[11px] font-black text-warning-600">تعديلات غير محفوظة</p>
        ) : (
          <p className="text-[11px] font-bold text-slate-400">كل التعديلات محفوظة</p>
        )}

        <button
          onClick={handleSave}
          disabled={saveDisabled}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-success-600 to-brand-600 px-4 sm:px-5 py-2.5 text-[13px] sm:text-sm font-black text-white shadow-sm transition hover:from-success-700 hover:to-brand-700 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:from-success-600 disabled:hover:to-brand-600 shrink-0"
        >
          {saving ? (
            <LoadingText>جاري الحفظ</LoadingText>
          ) : (
            <>
              <FaFloppyDisk className="w-3.5 h-3.5 shrink-0" />
              حفظ الإعدادات
            </>
          )}
        </button>
      </div>
    </div>
  );
};
