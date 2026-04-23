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
  FaTriangleExclamation,
} from 'react-icons/fa6';
import { useAuth } from '../../../hooks/useAuth';
import { useIsAdmin } from '../../../hooks/useIsAdmin';
import {
  getAccountTypeControls, updateAccountTypeControls,
} from '../../../services/accountTypeControlsService';
import { DEFAULT_FORM, ORDERED_GROUPS } from './constants';
import { AccountTypeControlsForm } from '../../../types';
import { DrugToolsSection } from './DrugToolsSection';
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
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
        غير مصرح لك بالوصول إلى إعدادات أنواع الحساب.
      </div>
    );
  }

  const saveDisabled = saving || !!loadError || !didLoadRef.current;

  return (
    <div className="space-y-4 sm:space-y-5 pb-24">

      {/* ═══ Header ═══ */}
      <div className="flex items-center gap-2">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-lg p-1.5 sm:p-2 shadow-sm">
          <FaSliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        </div>
        <div>
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
        <div className="flex items-start gap-3 rounded-2xl border-2 border-red-200 bg-red-50 p-4">
          <FaTriangleExclamation className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-red-800">فشل تحميل الإعدادات الحالية</p>
            <p className="mt-1 text-[11px] font-bold text-red-600/80">
              {loadError}
            </p>
            <p className="mt-2 text-[11px] font-bold text-red-700">
              الحفظ معطل لحماية الإعدادات الحالية. حدث الصفحة بعد ما يرجع الاتصال.
            </p>
          </div>
        </div>
      )}

      {/* ═══ Dirty Indicator ═══ */}
      {isDirty && !loadError && (
        <div className="flex items-center gap-2 rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2">
          <FaTriangleExclamation className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <p className="text-[11px] font-black text-amber-700">
            عندك تعديلات لسه مش محفوظة — اضغط "حفظ الإعدادات" قبل ما تخرج من الصفحة.
          </p>
        </div>
      )}

      {/* Wrap editable content — disable interactions if loadError */}
      <fieldset disabled={!!loadError} className="space-y-4 sm:space-y-5 disabled:opacity-60">

        {/* ═══ WhatsApp Number Card ═══ */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-lg p-1.5 shadow-sm">
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
            className="w-full max-w-md h-[44px] rounded-2xl border-2 border-slate-200 bg-white px-4 text-sm font-black text-slate-900 placeholder-slate-400 focus:border-blue-400 hover:border-blue-300 focus:outline-none transition-colors"
          />
        </div>

        {/* ═══ Features Section ═══ */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-lg p-1.5 shadow-sm">
              <FaListCheck className="w-3.5 h-3.5 text-white" />
            </div>
            <h3 className="text-sm sm:text-base font-black text-slate-800">حدود الميزات</h3>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400">
              ({ORDERED_GROUPS.length} ميزات)
            </span>
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

        {/* ═══ Drug Tools Section ═══ */}
        <DrugToolsSection form={form} setForm={setFormAndMarkDirty} />

      </fieldset>

      {/* ═══ Sticky Save Bar ═══ */}
      <div className="sticky bottom-2 z-20 mt-6 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-[0_-8px_24px_-12px_rgba(15,23,42,0.15)] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {message ? (
          <div
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold ${
              messageType === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {messageType === 'success' ? <FaCircleCheck className="w-3 h-3 shrink-0" /> : <FaCircleXmark className="w-3 h-3 shrink-0" />}
            {message}
          </div>
        ) : isDirty ? (
          <p className="text-[11px] font-black text-amber-600">تعديلات غير محفوظة</p>
        ) : (
          <p className="text-[11px] font-bold text-slate-400">كل التعديلات محفوظة</p>
        )}

        <button
          onClick={handleSave}
          disabled={saveDisabled}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:from-emerald-600 disabled:hover:to-teal-600"
        >
          {saving ? (
            <LoadingText>جاري الحفظ</LoadingText>
          ) : (
            <>
              <FaFloppyDisk className="w-3.5 h-3.5" />
              حفظ الإعدادات
            </>
          )}
        </button>
      </div>
    </div>
  );
};
