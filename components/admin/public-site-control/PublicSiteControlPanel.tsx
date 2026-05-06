/**
 * لوحة التحكم في واجهة الجمهور (Public Site Control Panel)
 * ───────────────────────────────────────────────────────────────────
 * تتيح للأدمن:
 *   1) تشغيل/إيقاف عرض www.drhypermed.com للجمهور (kill-switch)
 *   2) تعديل عنوان ونص رسالة الحجب اللي بتظهر للزوار
 *   3) إخفاء/إظهار شعار التطبيق على شاشة الحجب
 *   4) معاينة فورية للشاشة قبل الحفظ
 *
 * الـdoc الوحيد: settings/publicSiteControl
 * - قراءة عامة (الموقع لازم يقراها قبل تسجيل الدخول)
 * - كتابة للأدمن فقط (firestore.rules)
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  FaGlobe, FaFloppyDisk, FaEye, FaEyeSlash, FaTriangleExclamation, FaCircleCheck, FaCircleXmark,
  FaEnvelope, FaPlus, FaXmark,
} from 'react-icons/fa6';
import { useAuth } from '../../../hooks/useAuth';
import { useIsAdmin } from '../../../hooks/useIsAdmin';
import {
  getPublicSiteControl,
  savePublicSiteControl,
  DEFAULT_PUBLIC_SITE_CONTROL,
  normalizeAllowedEmail,
  type PublicSiteControl,
} from '../../../services/firestore/publicSiteControl';
import { LoadingStateScreen } from '../../app/LoadingStateScreen';
import { LoadingText } from '../../ui/LoadingText';
import { PublicSiteBlockedScreen } from '../../landing/PublicSiteBlockedScreen';

const MAX_TITLE_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_ALLOWED_EMAILS = 200;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PublicSiteControlPanel: React.FC = () => {
  const { user } = useAuth();
  const isAdminUser = useIsAdmin(user);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PublicSiteControl>(DEFAULT_PUBLIC_SITE_CONTROL);
  const [originalForm, setOriginalForm] = useState<PublicSiteControl>(DEFAULT_PUBLIC_SITE_CONTROL);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState('');

  // ─ تحميل الإعدادات الحالية من Firestore ─
  useEffect(() => {
    let mounted = true;
    if (!isAdminUser) {
      setLoading(false);
      return undefined;
    }
    (async () => {
      try {
        const data = await getPublicSiteControl();
        if (!mounted) return;
        setForm(data);
        setOriginalForm(data);
      } catch (err) {
        console.error('[PublicSiteControlPanel] load failed:', err);
        if (mounted) {
          setFeedback({ type: 'error', message: 'تعذّر تحميل الإعدادات الحالية.' });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [isAdminUser]);

  // dirty state — هل في تعديلات لسه ما اتحفظتش؟
  const isDirty = useMemo(
    () =>
      form.enabled !== originalForm.enabled ||
      form.blockTitle !== originalForm.blockTitle ||
      form.blockMessage !== originalForm.blockMessage ||
      form.showLogo !== originalForm.showLogo ||
      // مقارنة قائمة الإيميلات: لو الطول مختلف أو فيه إيميل مفقود/زائد → dirty
      form.allowedEmails.length !== originalForm.allowedEmails.length ||
      form.allowedEmails.some((email) => !originalForm.allowedEmails.includes(email)),
    [form, originalForm],
  );

  // ─ إدارة قائمة الإيميلات المسموحة ─
  const handleAddEmail = () => {
    const normalized = normalizeAllowedEmail(emailInput);
    if (!normalized) {
      setEmailError('من فضلك ادخل بريد إلكتروني.');
      return;
    }
    if (!EMAIL_REGEX.test(normalized)) {
      setEmailError('شكل البريد الإلكتروني غير صحيح.');
      return;
    }
    if (form.allowedEmails.includes(normalized)) {
      setEmailError('البريد ده موجود بالفعل في القائمة.');
      return;
    }
    if (form.allowedEmails.length >= MAX_ALLOWED_EMAILS) {
      setEmailError(`الحد الأقصى ${MAX_ALLOWED_EMAILS} بريد. احذف بعض الإيميلات قبل الإضافة.`);
      return;
    }
    setForm((prev) => ({ ...prev, allowedEmails: [...prev.allowedEmails, normalized] }));
    setEmailInput('');
    setEmailError('');
  };

  const handleRemoveEmail = (email: string) => {
    setForm((prev) => ({
      ...prev,
      allowedEmails: prev.allowedEmails.filter((e) => e !== email),
    }));
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  // تحذير قبل مغادرة الصفحة لو في تعديلات غير محفوظة
  useEffect(() => {
    if (!isDirty) return undefined;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const handleSave = async () => {
    if (!isAdminUser || saving) return;
    setSaving(true);
    setFeedback(null);
    try {
      await savePublicSiteControl(form, user?.email || undefined);
      setOriginalForm(form);
      setFeedback({ type: 'success', message: 'تم حفظ الإعدادات بنجاح.' });
      window.setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error('[PublicSiteControlPanel] save failed:', err);
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء الحفظ.';
      setFeedback({ type: 'error', message: `فشل الحفظ: ${message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!window.confirm('هل تريد إعادة الرسالة للنص الافتراضي؟ ستفقد التعديلات الحالية.')) return;
    setForm({
      ...form,
      blockTitle: DEFAULT_PUBLIC_SITE_CONTROL.blockTitle,
      blockMessage: DEFAULT_PUBLIC_SITE_CONTROL.blockMessage,
    });
  };

  if (loading) {
    return <LoadingStateScreen message="جاري تحميل إعدادات الموقع" />;
  }

  if (!isAdminUser) {
    return (
      <div className="rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm font-bold text-danger-700">
        غير مصرح لك بالوصول إلى التحكم في موقع الجمهور.
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 pb-24 max-w-full overflow-x-hidden" dir="rtl">
      {/* ═══ Header ═══ */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 text-white rounded-lg p-1.5 sm:p-2 shrink-0 shadow-sm">
          <FaGlobe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-lg lg:text-xl font-black text-slate-800 tracking-tight">
            التحكم في موقع الجمهور
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500" dir="ltr">
            www.drhypermed.com
          </p>
        </div>
      </div>

      {/* ═══ Toggle: تفعيل/تعطيل الموقع ═══ */}
      <div
        className={`rounded-2xl border-2 p-4 sm:p-5 shadow-sm transition-colors ${
          form.enabled
            ? 'border-success-200 bg-success-50/50'
            : 'border-danger-200 bg-danger-50/50'
        }`}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1 flex items-center gap-2">
              {form.enabled ? (
                <>
                  <FaEye className="w-4 h-4 text-success-600 shrink-0" />
                  الموقع مفتوح للجمهور
                </>
              ) : (
                <>
                  <FaEyeSlash className="w-4 h-4 text-danger-600 shrink-0" />
                  الموقع محجوب — رسالة فقط تظهر للزوار
                </>
              )}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {form.enabled
                ? 'الزوار بيشوفوا الصفحة الرئيسية الكاملة بكل الميزات.'
                : form.allowedEmails.length > 0
                  ? `الزوار بيشوفوا شاشة الحجب — إلا ${form.allowedEmails.length} حساب مسموح ليهم بالدخول العادي بعد تسجيل الدخول.`
                  : 'الزوار بيشوفوا شاشة بشعار التطبيق + الرسالة المكتوبة تحت بدون أي محتوى تاني.'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={form.enabled}
              onChange={(e) => setForm((prev) => ({ ...prev, enabled: e.target.checked }))}
            />
            <div className="w-14 h-8 bg-slate-300 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-success-500 peer-checked:to-success-600 transition-all after:content-[''] after:absolute after:top-1 after:right-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:-translate-x-6 after:shadow-md" />
          </label>
        </div>
      </div>

      {/* ═══ 🆕 (2026-05) قائمة الإيميلات المسموح لها رؤية الموقع رغم الحجب ═══
          مفيدة لو الأدمن عايز يفتح الموقع لمجموعة محددة (private beta) قبل النشر العام.
          القائمة بتشتغل فقط لما enabled=false — لو enabled=true، الكل بيشوف الموقع. */}
      <div
        className={`rounded-2xl border-2 p-4 sm:p-5 shadow-sm ${
          form.enabled ? 'border-slate-200 bg-slate-50/40' : 'border-brand-300 bg-brand-50/60'
        }`}
      >
        <div className="flex items-start gap-2 mb-3">
          <FaEnvelope className="w-4 h-4 text-brand-700 shrink-0 mt-1" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-black text-slate-900 mb-1">
              إيميلات مسموح لها بالدخول رغم الحجب
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
              {form.enabled
                ? '⚠️ الموقع مفتوح للجميع حالياً — القائمة دي مش شغالة. اقفل الموقع فوق عشان الإيميلات دي بس هي اللي تشوف الموقع.'
                : 'صاحب الإيميل لازم يسجل دخول بنفس الإيميل ده عشان يدخل الموقع. باقي الزوار بيشوفوا شاشة الحجب.'}
            </p>
          </div>
        </div>

        {/* خانة الإضافة */}
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <input
            type="email"
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value);
              if (emailError) setEmailError('');
            }}
            onKeyDown={handleEmailKeyDown}
            placeholder="example@gmail.com"
            dir="ltr"
            className="flex-1 min-w-0 rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-brand-400 hover:border-brand-300 focus:outline-none transition-colors"
          />
          <button
            type="button"
            onClick={handleAddEmail}
            disabled={!emailInput.trim() || form.allowedEmails.length >= MAX_ALLOWED_EMAILS}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-sm px-4 py-2.5 shrink-0 shadow-sm transition"
          >
            <FaPlus className="w-3.5 h-3.5" />
            إضافة
          </button>
        </div>

        {emailError && (
          <p className="mb-3 text-[11px] font-bold text-danger-700 flex items-center gap-1.5">
            <FaTriangleExclamation className="w-3 h-3 shrink-0" />
            {emailError}
          </p>
        )}

        {/* قائمة الإيميلات الحالية */}
        {form.allowedEmails.length === 0 ? (
          <p className="text-center text-xs sm:text-sm font-bold text-slate-400 py-4 border-2 border-dashed border-slate-200 rounded-xl">
            مفيش إيميلات مضافة — أضف إيميلات للسماح بالوصول
          </p>
        ) : (
          <div className="space-y-1.5">
            <p className="text-[11px] font-black text-slate-600 mb-1">
              {form.allowedEmails.length} {form.allowedEmails.length === 1 ? 'إيميل مسموح' : 'إيميل مسموح'}:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {form.allowedEmails.map((email) => (
                <div
                  key={email}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white border-2 border-brand-200 pr-2 pl-1 py-1 text-xs font-bold text-slate-800 shadow-sm"
                  dir="ltr"
                >
                  <span>{email}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveEmail(email)}
                    aria-label={`حذف ${email}`}
                    className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-danger-50 hover:bg-danger-100 text-danger-700 transition-colors"
                  >
                    <FaXmark className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-2" dir="ltr">
              {form.allowedEmails.length} / {MAX_ALLOWED_EMAILS}
            </p>
          </div>
        )}
      </div>

      {/* ═══ شعار التطبيق على شاشة الحجب ═══ */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm sm:text-base font-black text-slate-800 mb-0.5">
              عرض شعار التطبيق
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
              الشعار بيظهر فوق الرسالة على شاشة الحجب.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={form.showLogo}
              onChange={(e) => setForm((prev) => ({ ...prev, showLogo: e.target.checked }))}
            />
            <div className="w-12 h-7 bg-slate-200 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-brand-500 peer-checked:to-brand-600 transition-all after:content-[''] after:absolute after:top-0.5 after:right-0.5 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:-translate-x-5 after:shadow-sm" />
          </label>
        </div>
      </div>

      {/* ═══ عنوان رسالة الحجب ═══ */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="block text-sm font-black text-slate-800 mb-2">
          عنوان الرسالة
        </label>
        <input
          type="text"
          value={form.blockTitle}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, blockTitle: e.target.value.slice(0, MAX_TITLE_LENGTH) }))
          }
          placeholder="مثال: الموقع تحت الصيانة"
          className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-brand-400 hover:border-brand-300 focus:outline-none transition-colors"
        />
        <p className="mt-1 text-[10px] text-slate-400 text-left" dir="ltr">
          {form.blockTitle.length}/{MAX_TITLE_LENGTH}
        </p>
      </div>

      {/* ═══ نص الرسالة ═══ */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-2">
          <label className="text-sm font-black text-slate-800">
            نص الرسالة
          </label>
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] font-black text-warning-700 hover:text-warning-800 underline underline-offset-2"
          >
            استعادة النص الافتراضي
          </button>
        </div>
        <textarea
          value={form.blockMessage}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, blockMessage: e.target.value.slice(0, MAX_MESSAGE_LENGTH) }))
          }
          rows={6}
          placeholder="اكتب الرسالة اللي هتظهر للزوار. تقدر تستخدم سطور جديدة."
          className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-brand-400 hover:border-brand-300 focus:outline-none transition-colors resize-y"
        />
        <div className="mt-2 flex items-center justify-between gap-2 text-[11px]">
          <p className="text-slate-500">
            💡 لتنسيق <strong className="font-black text-slate-700">كلمة مهمة</strong> اكتبها بين علامتين:
            <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded mx-1" dir="ltr">**كلمة**</code>
          </p>
          <p className="text-slate-400 shrink-0" dir="ltr">
            {form.blockMessage.length}/{MAX_MESSAGE_LENGTH}
          </p>
        </div>
      </div>

      {/* ═══ زر المعاينة ═══ */}
      <button
        type="button"
        onClick={() => setShowPreview(true)}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-brand-300 bg-brand-50 hover:bg-brand-100 text-brand-700 font-black py-3 transition-colors"
      >
        <FaEye className="w-4 h-4" />
        معاينة شاشة الحجب
      </button>

      {/* ═══ آخر تحديث ═══ */}
      {originalForm.updatedAt && (
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-[11px] text-slate-500">
          آخر تحديث: {new Date(originalForm.updatedAt).toLocaleString('ar-EG')}
          {originalForm.updatedBy && (
            <>
              {' '}بواسطة <span className="font-bold text-slate-700" dir="ltr">{originalForm.updatedBy}</span>
            </>
          )}
        </div>
      )}

      {/* ═══ Sticky Save Bar ═══ */}
      <div className="sticky bottom-0 sm:bottom-2 z-20 mt-6 bg-white/95 backdrop-blur-md rounded-t-2xl sm:rounded-2xl border border-slate-200/80 shadow-[0_-8px_24px_-12px_rgba(15,23,42,0.15)] px-3 sm:px-4 py-3 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 min-w-0 max-w-full">
        {feedback ? (
          <div
            className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-xs font-bold min-w-0 max-w-full shadow-sm ${
              feedback.type === 'success'
                ? 'bg-success-50 border-success-400 text-success-900'
                : 'bg-danger-50 border-danger-400 text-danger-900'
            }`}
          >
            {feedback.type === 'success' ? (
              <FaCircleCheck className="w-3 h-3 shrink-0" />
            ) : (
              <FaCircleXmark className="w-3 h-3 shrink-0" />
            )}
            <span className="min-w-0 break-words">{feedback.message}</span>
          </div>
        ) : isDirty ? (
          <p className="text-[11px] font-black text-warning-600 inline-flex items-center gap-1.5 text-center sm:text-start">
            <FaTriangleExclamation className="w-3 h-3 shrink-0" />
            تعديلات غير محفوظة
          </p>
        ) : (
          <p className="text-[11px] font-bold text-slate-400 text-center sm:text-start">كل التعديلات محفوظة</p>
        )}

        <button
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-success-600 to-brand-600 px-4 sm:px-5 py-3 sm:py-2.5 text-sm font-black text-white shadow-sm transition hover:from-success-700 hover:to-brand-700 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:from-success-600 disabled:hover:to-brand-600 sm:shrink-0"
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

      {/* ═══ Preview Modal ═══ */}
      {showPreview && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 bg-slate-50">
              <h3 className="font-black text-slate-800">معاينة شاشة الحجب</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-700 text-white font-bold text-sm hover:bg-slate-800"
              >
                إغلاق
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <PublicSiteBlockedScreen settings={form} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
