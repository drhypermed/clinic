import React from 'react';
import { MedicationCustomization, Category } from '../../types';

interface Props {
  formData: MedicationCustomization;
  isNewMedication: boolean;
  updateField: <K extends keyof MedicationCustomization>(field: K, value: MedicationCustomization[K]) => void;
}

export const MedicationBasicInfoSection: React.FC<Props> = ({ formData, isNewMedication, updateField }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* الاسم */}
    <div className="bg-white p-5 rounded-2xl border border-slate-100">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">الاسم</label>
      <input
        type="text"
        value={formData.name || ''}
        onChange={(e) => updateField('name', e.target.value)}
        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold"
      />
    </div>

    {/* الشكل الصيدلاني - للأدوية الجديدة فقط */}
    {isNewMedication && (
      <div className="bg-white p-5 rounded-2xl border border-slate-100">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">الشكل الصيدلاني</label>
        <input
          type="text"
          list="form-options"
          value={formData.form || ''}
          onChange={(e) => updateField('form', e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold"
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

    {/* الاسم العلمي */}
    <div className="bg-white p-5 rounded-2xl border border-slate-100">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">الاسم العلمي</label>
      <input
        type="text"
        value={formData.genericName || ''}
        onChange={(e) => updateField('genericName', e.target.value)}
        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold"
      />
    </div>

    {/* التركيز */}
    <div className="bg-white p-5 rounded-2xl border border-slate-100">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">التركيز</label>
      <input
        type="text"
        value={formData.concentration || ''}
        onChange={(e) => updateField('concentration', e.target.value)}
        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold"
      />
    </div>

    {/* السعر */}
    <div className="bg-white p-5 rounded-2xl border border-slate-100">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">السعر (EGP)</label>
      <input
        type="number"
        value={formData.price || ''}
        onChange={(e) => updateField('price', e.target.value ? parseFloat(e.target.value) : undefined)}
        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold"
      />
    </div>

    {/* التصنيف */}
    <div className="bg-white p-5 rounded-2xl border border-slate-100">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">التصنيف</label>
      <input
        list="category-options"
        type="text"
        value={formData.category || ''}
        onChange={(e) => updateField('category', e.target.value)}
        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold"
        placeholder="اكتب التصنيف أو اختر من القائمة"
      />
      <datalist id="category-options">
        {Object.values(Category).map((cat) => (
          <option key={cat} value={cat} />
        ))}
      </datalist>
    </div>

    {/* دواعي الاستعمال */}
    <div className="bg-white p-5 rounded-2xl border border-slate-100 md:col-span-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">دواعي الاستعمال</label>
      <textarea
        value={formData.usage || ''}
        onChange={(e) => updateField('usage', e.target.value)}
        rows={3}
        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold resize-none"
      />
    </div>

    {/* التوقيت */}
    <div className="bg-white p-5 rounded-2xl border border-slate-100">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">التوقيت</label>
      <input
        type="text"
        value={formData.timing || ''}
        onChange={(e) => updateField('timing', e.target.value)}
        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold"
      />
    </div>

    {/* العمر الأدنى */}
    <div className="bg-white p-5 rounded-2xl border border-slate-100">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">العمر الأدنى (شهر)</label>
      <input
        type="number"
        value={formData.minAgeMonths || ''}
        onChange={(e) => updateField('minAgeMonths', e.target.value ? parseInt(e.target.value) : undefined)}
        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold"
      />
    </div>

    {/* العمر الأقصى */}
    <div className="bg-white p-5 rounded-2xl border border-slate-100">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">العمر الأقصى (شهر)</label>
      <input
        type="number"
        value={formData.maxAgeMonths || ''}
        onChange={(e) => updateField('maxAgeMonths', e.target.value ? parseInt(e.target.value) : undefined)}
        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold"
      />
    </div>

    {/* الوزن الأدنى */}
    <div className="bg-white p-5 rounded-2xl border border-slate-100">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">الوزن الأدنى (كجم)</label>
      <input
        type="number"
        value={formData.minWeight || ''}
        onChange={(e) => updateField('minWeight', e.target.value ? parseFloat(e.target.value) : undefined)}
        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold"
      />
    </div>

    {/* الوزن الأقصى */}
    <div className="bg-white p-5 rounded-2xl border border-slate-100">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">الوزن الأقصى (كجم)</label>
      <input
        type="number"
        value={formData.maxWeight || ''}
        onChange={(e) => updateField('maxWeight', e.target.value ? parseFloat(e.target.value) : undefined)}
        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold"
      />
    </div>

    {/* التعليمات */}
    <div className="bg-white p-5 rounded-2xl border border-slate-100 md:col-span-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">التعليمات</label>
      <textarea
        value={formData.instructions || ''}
        onChange={(e) => updateField('instructions', e.target.value)}
        rows={4}
        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold resize-none"
      />
    </div>

    {/* التحذيرات */}
    <div className="bg-white p-5 rounded-2xl border border-slate-100 md:col-span-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">التحذيرات (كل سطر = تحذير)</label>
      <textarea
        value={formData.warnings?.join('\n') || ''}
        onChange={(e) => updateField('warnings', e.target.value.split('\n').filter(w => w.trim()))}
        rows={3}
        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold resize-none"
      />
    </div>
  </div>
);
