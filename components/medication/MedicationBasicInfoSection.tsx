import React from 'react';
import { MedicationCustomization, Category } from '../../types';

interface Props {
  formData: MedicationCustomization;
  isNewMedication: boolean;
  updateField: <K extends keyof MedicationCustomization>(field: K, value: MedicationCustomization[K]) => void;
}

/**
 * يحوّل نص الإدخال إلى عدد صحيح. يرجع undefined لو النص فارغ أو غير قابل للتحليل.
 * يمنع تخزين NaN داخل الـ form state (bug: لو كتب المستخدم "abc" في حقل رقم).
 */
const parseNumInput = (raw: string, asInt: boolean): number | undefined => {
  if (!raw.trim()) return undefined;
  const n = asInt ? parseInt(raw, 10) : parseFloat(raw);
  return Number.isFinite(n) ? n : undefined;
};

const fieldClass =
  'w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-slate-800 transition-colors';

const labelClass = 'text-[11px] font-bold text-slate-600 mb-1.5 block';

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{title}</h4>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

export const MedicationBasicInfoSection: React.FC<Props> = ({ formData, isNewMedication, updateField }) => (
  <div className="space-y-4">
    {/* المعلومات الأساسية */}
    <SectionCard title="المعلومات الأساسية">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>الاسم</label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
            className={fieldClass}
          />
        </div>

        {isNewMedication && (
          <div>
            <label className={labelClass}>الشكل الصيدلاني</label>
            <input
              type="text"
              list="form-options"
              value={formData.form || ''}
              onChange={(e) => updateField('form', e.target.value)}
              className={fieldClass}
              placeholder="مثل: Tablet, Syrup, Injection..."
            />
            <datalist id="form-options">
              <option value="Tablet">أقراص</option>
              <option value="Syrup">شراب</option>
              <option value="Suspension">معلق</option>
              <option value="Capsule">كبسولات</option>
              <option value="Injection">حقن</option>
              <option value="Drops">قطرة</option>
              <option value="Cream">كريم</option>
              <option value="Ointment">مرهم</option>
            </datalist>
          </div>
        )}

        <div>
          <label className={labelClass}>الاسم العلمي</label>
          <input
            type="text"
            value={formData.genericName || ''}
            onChange={(e) => updateField('genericName', e.target.value)}
            className={fieldClass}
          />
        </div>

        <div>
          <label className={labelClass}>التركيز</label>
          <input
            type="text"
            value={formData.concentration || ''}
            onChange={(e) => updateField('concentration', e.target.value)}
            className={fieldClass}
          />
        </div>

        <div>
          <label className={labelClass}>السعر (EGP)</label>
          <input
            type="number"
            value={formData.price ?? ''}
            onChange={(e) => updateField('price', parseNumInput(e.target.value, false))}
            className={fieldClass}
          />
        </div>

        <div>
          <label className={labelClass}>التصنيف</label>
          <input
            list="category-options"
            type="text"
            value={formData.category || ''}
            onChange={(e) => updateField('category', e.target.value)}
            className={fieldClass}
            placeholder="اكتب التصنيف أو اختر من القائمة"
          />
          <datalist id="category-options">
            {Object.values(Category).map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        </div>
      </div>
    </SectionCard>

    {/* الفئة المستهدفة (العمر والوزن) */}
    <SectionCard title="الفئة المستهدفة">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className={labelClass}>العمر الأدنى (شهر)</label>
          <input
            type="number"
            value={formData.minAgeMonths ?? ''}
            onChange={(e) => updateField('minAgeMonths', parseNumInput(e.target.value, true))}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>العمر الأقصى (شهر)</label>
          <input
            type="number"
            value={formData.maxAgeMonths ?? ''}
            onChange={(e) => updateField('maxAgeMonths', parseNumInput(e.target.value, true))}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>الوزن الأدنى (كجم)</label>
          <input
            type="number"
            value={formData.minWeight ?? ''}
            onChange={(e) => updateField('minWeight', parseNumInput(e.target.value, false))}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>الوزن الأقصى (كجم)</label>
          <input
            type="number"
            value={formData.maxWeight ?? ''}
            onChange={(e) => updateField('maxWeight', parseNumInput(e.target.value, false))}
            className={fieldClass}
          />
        </div>
      </div>
    </SectionCard>

    {/* الاستخدام والتعليمات */}
    <SectionCard title="الاستخدام والتعليمات">
      <div className="space-y-3">
        <div>
          <label className={labelClass}>دواعي الاستعمال</label>
          <textarea
            value={formData.usage || ''}
            onChange={(e) => updateField('usage', e.target.value)}
            rows={3}
            className={`${fieldClass} resize-none leading-relaxed`}
          />
        </div>
        <div>
          <label className={labelClass}>التوقيت</label>
          <input
            type="text"
            value={formData.timing || ''}
            onChange={(e) => updateField('timing', e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>التحذيرات <span className="font-normal text-slate-400">(كل سطر = تحذير)</span></label>
          <textarea
            value={formData.warnings?.join('\n') || ''}
            onChange={(e) => updateField('warnings', e.target.value.split('\n').filter(w => w.trim()))}
            rows={3}
            className={`${fieldClass} resize-none leading-relaxed`}
          />
        </div>
      </div>
    </SectionCard>
  </div>
);
