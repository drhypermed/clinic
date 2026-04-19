/**
 * لوحة إدارة تذييل الروشتة (Prescription Footer Line Management Panel)
 * تمكن المسؤولين من التحكم في النصوص والروابط المعروضة في أسفل الروشتات المطبوعة.
 * 
 * الميزات:
 * 1. التحكم في إظهار أو إخفاء السطر السفلي بالكامل.
 * 2. إدارة وسائل التواصل (واتساب، فيسبوك، انستجرام، تليجرام، هاتف).
 * 3. تخصيص تنسيق الخط (اللون، الحجم، النوع، الوزن).
 * 4. معاينة حية للتغييرات قبل الحفظ.
 */

import React, { useEffect, useState } from 'react';
import { LoadingText } from '../../ui/LoadingText';
import { LoadingStateScreen } from '../../app/LoadingStateScreen';
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

export const PrescriptionFooterLineManagementPanel: React.FC<PrescriptionFooterLineManagementPanelProps> = ({ adminEmail }) => {
  const { settings, loading, error, saveSettings } = useSystemRequestLineSettings();
  const [form, setForm] = useState<SystemRequestLineSettings>(DEFAULT_SYSTEM_REQUEST_LINE_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const activeContacts = form.contacts.filter((item) => item.enabled !== false && (item.value || item.label || item.url));

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const updateField = <K extends keyof SystemRequestLineSettings>(key: K, value: SystemRequestLineSettings[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateLineStyle = (key: keyof SystemRequestLineSettings['lineStyle'], value: string | number) => {
    setForm((prev) => ({
      ...prev,
      lineStyle: {
        ...prev.lineStyle,
        [key]: value,
      },
    }));
  };

  const updateContact = (index: number, patch: Partial<SystemRequestContact>) => {
    setForm((prev) => {
      const next = [...prev.contacts];
      next[index] = { ...next[index], ...patch };
      return { ...prev, contacts: next };
    });
  };

  const addContact = () => {
    setForm((prev) => ({ ...prev, contacts: [...prev.contacts, createEmptySystemRequestContact()] }));
  };

  const removeContact = (index: number) => {
    setForm((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const normalized = normalizeSystemRequestLineSettings(form);
      await saveSettings(normalized, adminEmail);
      setMessage('✅ تم حفظ إعدادات السطر السفلي بنجاح.');
    } catch (err: any) {
      setMessage(`❌ فشل حفظ الإعدادات: ${err?.message || 'خطأ غير معروف'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingStateScreen message="جاري تحميل الإعدادات" />;
  }

  const renderPreviewIcon = (icon: SystemRequestContact['icon'], color: string) => (
    <SocialIconRenderer icon={icon} color={color} />
  );

  return (
    <div className="space-y-6">
      <div className="sticky top-3 z-20 bg-slate-700 rounded-2xl shadow-xl p-4 border-t-4 border-blue-500 dh-stagger-1">
        <p className="text-slate-200 text-xs font-bold mb-2">معاينة الجزء المعدل فقط</p>
        <div className="bg-white rounded-lg border border-slate-300 px-2 py-2">
          {form.showLine ? (
            <div
              className="pt-1 border-t border-slate-300 flex flex-wrap items-center justify-center gap-1.5 text-center"
              style={{
                color: form.lineStyle.textColor,
                fontFamily: form.lineStyle.fontFamily,
                fontWeight: form.lineStyle.fontWeight as any,
                fontSize: `${Math.max(8, form.lineStyle.fontSize - 1)}px`,
                lineHeight: 1.2,
              }}
            >
              <span>{form.message || DEFAULT_SYSTEM_REQUEST_LINE_SETTINGS.message}</span>
              {activeContacts.map((item, idx) => (
                <React.Fragment key={item.id}>
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-black no-underline"
                      style={{ color: item.color || '#334155' }}
                    >
                      {form.showIcons && item.showIcon !== false && renderPreviewIcon(item.icon, item.color || '#334155')}
                      <span dir="ltr">{item.value || item.label}</span>
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-black" style={{ color: item.color || '#334155' }}>
                      {form.showIcons && item.showIcon !== false && renderPreviewIcon(item.icon, item.color || '#334155')}
                      <span dir="ltr">{item.value || item.label}</span>
                    </span>
                  )}
                  {idx < activeContacts.length - 1 && <span>—</span>}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="pt-1 border-t border-slate-200 text-center text-[11px] text-slate-400">
              السطر السفلي مخفي حالياً
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-700 rounded-2xl shadow-xl p-8 border-t-4 border-cyan-500 space-y-6 dh-stagger-2">
        <div>
          <h3 className="text-xl font-black text-white mb-2">التحكم في السطر المتثبت أسفل الروشتة</h3>
          <p className="text-slate-300 text-sm">أي تعديل هنا ينعكس مباشرة على الروشتة وعلى طباعة التقرير الطبي.</p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/20 border border-red-400/30 text-red-100 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <label className="flex items-center gap-3 bg-slate-600 rounded-xl p-3 text-slate-100 font-bold">
          <input
            type="checkbox"
            checked={form.showLine}
            onChange={(e) => updateField('showLine', e.target.checked)}
            className="h-4 w-4"
          />
          إظهار السطر السفلي
        </label>

        <label className="flex items-center gap-3 bg-slate-600 rounded-xl p-3 text-slate-100 font-bold">
          <input
            type="checkbox"
            checked={form.showIcons}
            onChange={(e) => updateField('showIcons', e.target.checked)}
            className="h-4 w-4"
          />
          إظهار الأيقونات
        </label>
        </div>

        <div>
        <label className="block text-slate-200 font-bold mb-2">النص الأساسي</label>
        <textarea
          value={form.message}
          onChange={(e) => updateField('message', e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-slate-500 bg-slate-600 text-white px-4 py-3"
          placeholder="اكتب النص الثابت الذي يظهر أسفل الروشتة"
        />
        </div>

        <div className="rounded-xl bg-slate-600/60 border border-slate-500 p-4 space-y-4">
        <h4 className="text-white font-black">تنسيق النص</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-slate-200 font-bold mb-2">لون الخط</label>
            <input
              type="color"
              value={form.lineStyle.textColor}
              onChange={(e) => updateLineStyle('textColor', e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-500 bg-slate-700"
            />
          </div>
          <div>
            <label className="block text-slate-200 font-bold mb-2">نوع الخط</label>
            <select
              value={form.lineStyle.fontFamily}
              onChange={(e) => updateLineStyle('fontFamily', e.target.value)}
              className="w-full rounded-xl border border-slate-500 bg-slate-600 text-white px-3 py-2"
            >
              <option value="sans-serif">Sans Serif</option>
              <option value="Tahoma, sans-serif">Tahoma</option>
              <option value="Arial, sans-serif">Arial</option>
              <option value="'Cairo', sans-serif">Cairo</option>
              <option value="'Amiri', serif">Amiri</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-200 font-bold mb-2">وزن الخط</label>
            <select
              value={form.lineStyle.fontWeight}
              onChange={(e) => updateLineStyle('fontWeight', e.target.value)}
              className="w-full rounded-xl border border-slate-500 bg-slate-600 text-white px-3 py-2"
            >
              <option value="500">متوسط</option>
              <option value="700">Bold</option>
              <option value="800">Extra Bold</option>
              <option value="900">Black</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-200 font-bold mb-2">حجم الخط</label>
            <input
              type="number"
              min={8}
              max={18}
              value={form.lineStyle.fontSize}
              onChange={(e) => updateLineStyle('fontSize', Number(e.target.value || 10))}
              className="w-full rounded-xl border border-slate-500 bg-slate-600 text-white px-3 py-2"
            />
          </div>
        </div>
        </div>

        <div className="rounded-xl bg-slate-600/60 border border-slate-500 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-black">وسائل التواصل</h4>
          <button
            onClick={addContact}
            type="button"
            className="px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold rounded-lg"
          >
            + إضافة وسيلة تواصل
          </button>
        </div>

        {form.contacts.length === 0 && (
          <p className="text-slate-300 text-sm">لا يوجد وسائل تواصل مضافة.</p>
        )}

        {form.contacts.map((contact, index) => (
          <div key={contact.id} className="rounded-xl border border-slate-500 bg-slate-700 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-slate-100 font-bold text-sm">
                <input
                  type="checkbox"
                  checked={contact.enabled !== false}
                  onChange={(e) => updateContact(index, { enabled: e.target.checked })}
                />
                مفعّل
              </label>
              <button
                type="button"
                onClick={() => removeContact(index)}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg"
              >
                حذف
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-200 text-xs mb-1">الاسم الظاهر</label>
                <input
                  type="text"
                  value={contact.label}
                  onChange={(e) => updateContact(index, { label: e.target.value })}
                  className="w-full rounded-lg border border-slate-500 bg-slate-600 text-white px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-slate-200 text-xs mb-1">القيمة الظاهرة</label>
                <input
                  type="text"
                  value={contact.value || ''}
                  onChange={(e) => updateContact(index, { value: e.target.value })}
                  className="w-full rounded-lg border border-slate-500 bg-slate-600 text-white px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-slate-200 text-xs mb-1">الرابط</label>
                <input
                  type="url"
                  value={contact.url}
                  onChange={(e) => updateContact(index, { url: e.target.value })}
                  className="w-full rounded-lg border border-slate-500 bg-slate-600 text-white px-3 py-2"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-slate-200 text-xs mb-1">نوع الأيقونة</label>
                <select
                  value={contact.icon}
                  onChange={(e) => updateContact(index, { icon: e.target.value as SystemRequestContact['icon'] })}
                  className="w-full rounded-lg border border-slate-500 bg-slate-600 text-white px-3 py-2"
                >
                  {SYSTEM_REQUEST_ICON_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-200 text-xs mb-1">لون الوسيلة</label>
                <input
                  type="color"
                  value={contact.color || '#334155'}
                  onChange={(e) => updateContact(index, { color: e.target.value })}
                  className="w-full h-10 rounded-lg border border-slate-500 bg-slate-600"
                />
              </div>
              <div className="flex items-center gap-2 mt-5">
                <input
                  type="checkbox"
                  checked={contact.showIcon !== false}
                  onChange={(e) => updateContact(index, { showIcon: e.target.checked })}
                />
                <span className="text-slate-200 text-sm">إظهار أيقونة الوسيلة</span>
              </div>
            </div>
          </div>
        ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-black rounded-xl"
          >
            {saving ? 'جاري الحفظ' : '💾 حفظ الإعدادات'}
          </button>
          {message && <span className="text-sm text-slate-100">{message}</span>}
        </div>
      </div>

    </div>
  );
};
