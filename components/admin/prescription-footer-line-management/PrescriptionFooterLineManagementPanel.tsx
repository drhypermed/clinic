/**
 * لوحة إدارة تذييل الروشتة (Prescription Footer Line Management Panel)
 *
 * تمكن المسؤولين من التحكم في النصوص والروابط المعروضة أسفل الروشتات المطبوعة.
 *
 * الميزات:
 *   1. التحكم في إظهار/إخفاء السطر السفلي بالكامل
 *   2. إدارة وسائل التواصل (واتساب، فيسبوك، انستجرام، تليجرام، هاتف...)
 *   3. تخصيص تنسيق الخط (اللون، الحجم، النوع، الوزن)
 *   4. معاينة حية للتغييرات قبل الحفظ
 *
 * تصميم: light theme موحد مع باقي لوحة الادمن.
 *
 * إصلاحات بعد المراجعة:
 *   - تحذير لما عدد الوسائل > 10 (الـ normalize كان يقص بصمت)
 *   - sanitize للروابط في المعاينة (مش بس عند الحفظ) لمنع XSS
 *   - تحذير لما القيم الافتراضية (01000000000) لسه موجودة
 *   - مزامنة تلقائية بين رقم الواتساب والرابط
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  FaFileLines,
  FaFloppyDisk,
  FaPlus,
  FaTrashCan,
  FaTriangleExclamation,
  FaPalette,
  FaLink,
} from 'react-icons/fa6';
import { LoadingStateScreen } from '../../app/LoadingStateScreen';
import { LoadingText } from '../../ui/LoadingText';
import { SocialIconRenderer } from '../../common/SocialIconRenderer';
import { SystemRequestContact, SystemRequestLineSettings } from '@/app/drug-catalog/types';
import { useSystemRequestLineSettings } from '@/hooks/useSystemRequestLineSettings';
import {
  createEmptySystemRequestContact,
  DEFAULT_SYSTEM_REQUEST_LINE_SETTINGS,
  normalizeSystemRequestLineSettings,
  SYSTEM_REQUEST_ICON_OPTIONS,
} from '@/services/systemRequestLineService';

interface PrescriptionFooterLineManagementPanelProps {
  adminEmail?: string | null;
}

// أقصى عدد وسائل تواصل مسموح بها — متوافق مع MAX_CONTACTS_PER_FOOTER في الخدمة
const MAX_CONTACTS = 10;
// رقم/رابط افتراضي — لو لسه موجود بعد الحفظ يبان تحذير
const DEFAULT_PLACEHOLDER_VALUES = ['01000000000', '201000000000', 'wa.me/201000000000'];

/**
 * فحص بسيط للروابط قبل عرضها في المعاينة (يمنع javascript:/data:)
 * نستخدم نفس قائمة البروتوكولات الآمنة في الخدمة
 */
const SAFE_URL_PROTOCOLS = ['http:', 'https:', 'tel:', 'mailto:', 'sms:'];
const safePreviewUrl = (raw: string): string => {
  const text = String(raw || '').trim();
  if (!text) return '';
  if (!/^[a-z][a-z0-9+.-]*:/i.test(text)) return text;
  try {
    const parsed = new URL(text);
    return SAFE_URL_PROTOCOLS.includes(parsed.protocol.toLowerCase()) ? text : '';
  } catch {
    return '';
  }
};

/**
 * مزامنة رقم الواتساب مع الرابط تلقائياً (لو الـ icon = whatsapp والـ value تغيّر)
 * مثلاً: value = "01234567890" → url = "https://wa.me/201234567890"
 */
const buildWhatsAppUrlFromNumber = (rawNumber: string): string => {
  const digits = String(rawNumber || '').replace(/\D/g, '');
  if (!digits) return '';
  // لو بدأ بـ 0 (محلي مصري)، نضيف 2 (مفتاح مصر)
  const normalized = digits.startsWith('0') ? `2${digits}` : digits;
  return `https://wa.me/${normalized}`;
};

export const PrescriptionFooterLineManagementPanel: React.FC<
  PrescriptionFooterLineManagementPanelProps
> = ({ adminEmail }) => {
  const { settings, loading, error, saveSettings } = useSystemRequestLineSettings();
  const [form, setForm] = useState<SystemRequestLineSettings>(DEFAULT_SYSTEM_REQUEST_LINE_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // وسائل تواصل مفعّلة فقط — للمعاينة
  const activeContacts = useMemo(
    () =>
      form.contacts.filter(
        (item) => item.enabled !== false && (item.value || item.label || item.url),
      ),
    [form.contacts],
  );

  // تحذير: لو فيه قيم افتراضية لسه موجودة (الأدمن نسي يعدلها)
  const hasDefaultPlaceholders = useMemo(
    () =>
      form.contacts.some((c) =>
        DEFAULT_PLACEHOLDER_VALUES.some(
          (placeholder) =>
            (c.value || '').includes(placeholder) || (c.url || '').includes(placeholder),
        ),
      ),
    [form.contacts],
  );

  // تحذير: لو عدد الوسائل تجاوز الحد الأقصى (الـ normalize هيقص عند الحفظ)
  const exceedsMaxContacts = form.contacts.length > MAX_CONTACTS;

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const updateField = <K extends keyof SystemRequestLineSettings>(
    key: K,
    value: SystemRequestLineSettings[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateLineStyle = (
    key: keyof SystemRequestLineSettings['lineStyle'],
    value: string | number,
  ) => {
    setForm((prev) => ({
      ...prev,
      lineStyle: { ...prev.lineStyle, [key]: value },
    }));
  };

  const updateContact = (index: number, patch: Partial<SystemRequestContact>) => {
    setForm((prev) => {
      const next = [...prev.contacts];
      const current = next[index];
      const updated = { ...current, ...patch };

      // مزامنة تلقائية: لو غيّرنا رقم واتساب، نحدّث الرابط ما لم يكن المستخدم عدّل الرابط يدوياً
      if (
        updated.icon === 'whatsapp' &&
        'value' in patch &&
        patch.value !== undefined &&
        // فقط إذا الرابط الحالي يطابق المتولد من القيمة القديمة (يعني ما اتعدّلش يدوياً)
        (current.url === buildWhatsAppUrlFromNumber(current.value || '') || !current.url)
      ) {
        updated.url = buildWhatsAppUrlFromNumber(updated.value || '');
      }

      next[index] = updated;
      return { ...prev, contacts: next };
    });
  };

  const addContact = () => {
    if (form.contacts.length >= MAX_CONTACTS) {
      setMessage({ type: 'error', text: `الحد الأقصى ${MAX_CONTACTS} وسائل تواصل.` });
      return;
    }
    setForm((prev) => ({
      ...prev,
      contacts: [...prev.contacts, createEmptySystemRequestContact()],
    }));
  };

  const removeContact = (index: number) => {
    setForm((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const normalized = normalizeSystemRequestLineSettings(form);
      await saveSettings(normalized, adminEmail);
      setMessage({ type: 'success', text: 'تم حفظ إعدادات السطر السفلي بنجاح.' });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: `فشل حفظ الإعدادات: ${err?.message || 'خطأ غير معروف'}`,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingStateScreen message="جاري تحميل الإعدادات" />;
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ── الهيدر ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 dh-stagger-1">
        <div>
          <div className="flex items-center gap-2">
            <div className="bg-brand-50 text-brand-600 rounded-lg p-1.5 sm:p-2">
              <FaFileLines className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <h2 className="text-base sm:text-lg lg:text-xl font-black text-slate-800 tracking-tight">
              تذييل الروشتة (السطر السفلي)
            </h2>
          </div>
          <p className="mt-1 text-[11px] sm:text-xs text-slate-500">
            يظهر أسفل كل روشتة وكل تقرير طبي مطبوع — أي تعديل ينعكس فوراً.
          </p>
        </div>
      </div>

      {/* ── المعاينة الحية (sticky في الأعلى) ── */}
      <div className="sticky top-3 z-20 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden dh-stagger-2">
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50/60 border-b border-slate-100">
          <h3 className="text-[11px] sm:text-xs font-black text-slate-700">
            معاينة حية للجزء المعدل
          </h3>
        </div>
        <div className="p-3">
          <div className="bg-white rounded-lg border border-slate-200 px-2 py-2">
            {form.showLine ? (
              <div
                className="pt-1 border-t border-slate-200 flex flex-wrap items-center justify-center gap-1.5 text-center"
                style={{
                  color: form.lineStyle.textColor,
                  fontFamily: form.lineStyle.fontFamily,
                  fontWeight: form.lineStyle.fontWeight as any,
                  fontSize: `${Math.max(8, form.lineStyle.fontSize - 1)}px`,
                  lineHeight: 1.2,
                }}
              >
                <span>{form.message || DEFAULT_SYSTEM_REQUEST_LINE_SETTINGS.message}</span>
                {activeContacts.map((item, idx) => {
                  // sanitize URL في المعاينة برضو (مش بس عند الحفظ)
                  const safeUrl = safePreviewUrl(item.url);
                  return (
                    <React.Fragment key={item.id}>
                      {safeUrl ? (
                        <a
                          href={safeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-black no-underline"
                          style={{ color: item.color || '#334155' }}
                        >
                          {form.showIcons && item.showIcon !== false && (
                            <SocialIconRenderer icon={item.icon} color={item.color || '#334155'} />
                          )}
                          <span dir="ltr">{item.value || item.label}</span>
                        </a>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 font-black"
                          style={{ color: item.color || '#334155' }}
                        >
                          {form.showIcons && item.showIcon !== false && (
                            <SocialIconRenderer icon={item.icon} color={item.color || '#334155'} />
                          )}
                          <span dir="ltr">{item.value || item.label}</span>
                        </span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            ) : (
              <div className="pt-1 border-t border-slate-100 text-center text-[11px] text-slate-400">
                السطر السفلي مخفي حالياً
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── خطأ تحميل ── */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-bold text-danger-700">
          {error}
        </div>
      )}

      {/* ── تحذيرات ── */}
      {(hasDefaultPlaceholders || exceedsMaxContacts) && (
        <div className="space-y-2">
          {hasDefaultPlaceholders && (
            <div className="flex items-start gap-2 rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-xs font-bold text-warning-800">
              <FaTriangleExclamation className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                فيه قيم افتراضية لسه موجودة (مثل 01000000000). هتظهر للمرضى لو حفظت بدون تعديل.
              </span>
            </div>
          )}
          {exceedsMaxContacts && (
            <div className="flex items-start gap-2 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-xs font-bold text-danger-700">
              <FaTriangleExclamation className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                عدد وسائل التواصل ({form.contacts.length}) تجاوز الحد الأقصى ({MAX_CONTACTS}).
                الزيادة هتُحذف عند الحفظ.
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── التحكم العام (إظهار/إخفاء + الأيقونات) ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden dh-stagger-3">
        <div className="px-4 py-2.5 bg-slate-50/60 border-b border-slate-100">
          <h3 className="text-xs sm:text-sm font-black text-slate-700">إظهار وإخفاء</h3>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-50 transition">
            <input
              type="checkbox"
              checked={form.showLine}
              onChange={(e) => updateField('showLine', e.target.checked)}
              className="h-4 w-4 accent-brand-600"
            />
            إظهار السطر السفلي
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-50 transition">
            <input
              type="checkbox"
              checked={form.showIcons}
              onChange={(e) => updateField('showIcons', e.target.checked)}
              className="h-4 w-4 accent-brand-600"
            />
            إظهار الأيقونات
          </label>
        </div>
      </div>

      {/* ── النص الأساسي ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-50/60 border-b border-slate-100">
          <h3 className="text-xs sm:text-sm font-black text-slate-700">النص الأساسي</h3>
        </div>
        <div className="p-4">
          <textarea
            value={form.message}
            onChange={(e) => updateField('message', e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-100"
            placeholder="اكتب النص الثابت الذي يظهر أسفل الروشتة"
          />
        </div>
      </div>

      {/* ── تنسيق النص ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50/60 border-b border-slate-100">
          <FaPalette className="w-3 h-3 text-slate-500" />
          <h3 className="text-xs sm:text-sm font-black text-slate-700">تنسيق النص</h3>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="mb-1.5 block text-[11px] font-bold text-slate-500">لون الخط</label>
            <input
              type="color"
              value={form.lineStyle.textColor}
              onChange={(e) => updateLineStyle('textColor', e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white cursor-pointer"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold text-slate-500">نوع الخط</label>
            <select
              value={form.lineStyle.fontFamily}
              onChange={(e) => updateLineStyle('fontFamily', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-100"
            >
              <option value="sans-serif">Sans Serif</option>
              <option value="Tahoma, sans-serif">Tahoma</option>
              <option value="Arial, sans-serif">Arial</option>
              <option value="'Cairo', sans-serif">Cairo</option>
              <option value="'Amiri', serif">Amiri</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold text-slate-500">وزن الخط</label>
            <select
              value={form.lineStyle.fontWeight}
              onChange={(e) => updateLineStyle('fontWeight', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-100"
            >
              <option value="500">متوسط</option>
              <option value="700">عريض</option>
              <option value="800">عريض جداً</option>
              <option value="900">أسود</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold text-slate-500">حجم الخط</label>
            <input
              type="number"
              min={8}
              max={18}
              value={form.lineStyle.fontSize}
              onChange={(e) => updateLineStyle('fontSize', Number(e.target.value || 10))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-100"
            />
          </div>
        </div>
      </div>

      {/* ── وسائل التواصل ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-slate-50/60 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FaLink className="w-3 h-3 text-slate-500" />
            <h3 className="text-xs sm:text-sm font-black text-slate-700">
              وسائل التواصل ({form.contacts.length}/{MAX_CONTACTS})
            </h3>
          </div>
          <button
            type="button"
            onClick={addContact}
            disabled={form.contacts.length >= MAX_CONTACTS}
            className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3 py-1.5 text-[11px] font-bold text-brand-700 transition hover:bg-brand-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlus className="w-2.5 h-2.5" />
            إضافة وسيلة
          </button>
        </div>

        <div className="p-4 space-y-3">
          {form.contacts.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-6">لا يوجد وسائل تواصل مضافة.</p>
          ) : (
            form.contacts.map((contact, index) => (
              <div
                key={contact.id}
                className="rounded-xl border border-slate-200 bg-slate-50/40 p-3 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={contact.enabled !== false}
                      onChange={(e) => updateContact(index, { enabled: e.target.checked })}
                      className="h-4 w-4 accent-brand-600"
                    />
                    مفعّل
                  </label>
                  <button
                    type="button"
                    onClick={() => removeContact(index)}
                    className="inline-flex items-center gap-1 rounded-lg border border-danger-200 bg-danger-50 px-2.5 py-1 text-[10px] font-bold text-danger-700 transition hover:bg-danger-100"
                  >
                    <FaTrashCan className="w-2.5 h-2.5" />
                    حذف
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1 block text-[10px] font-bold text-slate-500">
                      الاسم الظاهر
                    </label>
                    <input
                      type="text"
                      value={contact.label}
                      onChange={(e) => updateContact(index, { label: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-bold text-slate-500">
                      القيمة الظاهرة
                    </label>
                    <input
                      type="text"
                      value={contact.value || ''}
                      onChange={(e) => updateContact(index, { value: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-100"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-bold text-slate-500">الرابط</label>
                    <input
                      type="url"
                      value={contact.url}
                      onChange={(e) => updateContact(index, { url: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-100"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-bold text-slate-500">
                      نوع الأيقونة
                    </label>
                    <select
                      value={contact.icon}
                      onChange={(e) =>
                        updateContact(index, { icon: e.target.value as SystemRequestContact['icon'] })
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-100"
                    >
                      {SYSTEM_REQUEST_ICON_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-bold text-slate-500">
                      لون الوسيلة
                    </label>
                    <input
                      type="color"
                      value={contact.color || '#334155'}
                      onChange={(e) => updateContact(index, { color: e.target.value })}
                      className="w-full h-10 rounded-lg border border-slate-200 bg-white cursor-pointer"
                    />
                  </div>
                  <label className="flex items-center gap-2 mt-5 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contact.showIcon !== false}
                      onChange={(e) => updateContact(index, { showIcon: e.target.checked })}
                      className="h-4 w-4 accent-brand-600"
                    />
                    إظهار أيقونة الوسيلة
                  </label>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── زر الحفظ + رسالة الحالة ── */}
      <div className="flex flex-wrap items-center gap-3 sticky bottom-3 z-10 bg-white/80 backdrop-blur rounded-xl border border-slate-200 px-4 py-3 shadow-sm">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl border border-success-200 bg-success-50 px-4 py-2 text-sm font-black text-success-700 transition hover:bg-success-100 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <FaFloppyDisk className="w-3.5 h-3.5" />
          {saving ? <LoadingText>جاري الحفظ</LoadingText> : 'حفظ الإعدادات'}
        </button>
        {message && (
          <span
            className={`text-sm font-bold ${
              message.type === 'success' ? 'text-success-700' : 'text-danger-700'
            }`}
          >
            {message.text}
          </span>
        )}
      </div>
    </div>
  );
};
