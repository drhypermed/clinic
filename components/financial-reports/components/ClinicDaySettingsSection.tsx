import React from 'react';
import {
  clinicCutoffMinutesToTimeInput,
  clinicTimeInputToCutoffMinutes,
  formatClinicCutoffArabic,
} from '../../../utils/clinicWorkday';

interface ClinicDaySettingsSectionProps {
  cutoffMinutes: number;
  onSave: (cutoffMinutes: number) => Promise<void>;
}

export const ClinicDaySettingsSection: React.FC<ClinicDaySettingsSectionProps> = ({
  cutoffMinutes,
  onSave,
}) => {
  const [draftTime, setDraftTime] = React.useState(
    () => clinicCutoffMinutesToTimeInput(cutoffMinutes),
  );
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    setDraftTime(clinicCutoffMinutesToTimeInput(cutoffMinutes));
    setMessage('');
  }, [cutoffMinutes]);

  const draftMinutes = clinicTimeInputToCutoffMinutes(draftTime, cutoffMinutes);
  const isDirty = draftMinutes !== cutoffMinutes;

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');
      await onSave(draftMinutes);
      setMessage('تم حفظ وقت بداية يوم العمل لهذا الفرع.');
    } catch {
      setMessage('تعذر حفظ الإعداد الآن. حاول مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-3xl border border-indigo-100 bg-white p-4 shadow-lg sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900">يوم عمل العيادة</h2>
          <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
            السجلات والمواعيد المكتملة والتقارير المالية بعد منتصف الليل تظل تابعة
            لليوم السابق حتى هذا الوقت. وقت الحدث الحقيقي يظل محفوظًا كما هو.
          </p>
        </div>
        <div className="rounded-2xl bg-indigo-50 px-4 py-3 text-center">
          <p className="text-xs font-bold text-indigo-600">بداية اليوم الجديد</p>
          <p className="mt-1 text-lg font-black text-indigo-900">
            {formatClinicCutoffArabic(draftMinutes)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block flex-1">
          <span className="mb-2 block text-sm font-black text-slate-700">وقت الإغلاق وبداية اليوم التالي</span>
          <input
            type="time"
            value={draftTime}
            onChange={(event) => {
              setDraftTime(event.target.value);
              setMessage('');
            }}
            className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-center text-lg font-black text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
          />
        </label>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'جاري الحفظ...' : 'حفظ وقت يوم العمل'}
        </button>
      </div>

      <p className="mt-3 text-xs font-bold leading-5 text-slate-500">
        مثال: عند اختيار 6:00 صباحًا، أي كشف محفوظ الساعة 2:00 صباحًا يُحسب ضمن
        يوم العمل السابق. تغيير هذا الإعداد يطبّق على السجلات الجديدة فقط.
      </p>
      {message && (
        <p className={`mt-3 text-sm font-black ${message.startsWith('تم ') ? 'text-success-700' : 'text-danger-700'}`}>
          {message}
        </p>
      )}
    </section>
  );
};
