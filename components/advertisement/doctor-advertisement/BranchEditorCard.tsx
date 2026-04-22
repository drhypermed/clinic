/**
 * كارت تحرير فرع واحد — يجمع كل الأقسام الخاصة بالفرع:
 *   اسم الفرع → العنوان والتواصل → الأسعار والخدمات → المواعيد → الصور.
 *
 * المكوّن ده بيتعرض لكل فرع على حدة داخل DoctorAdBranchesSection.
 * بياخد الفرع نفسه + CRUD functions، وبيحول كل تعديل يمر على
 * updateBranchField (أو update/add/remove للأسطر الفرعية) في الـhook.
 */
import React, { useState } from 'react';
import type { DoctorAdBranch, DoctorClinicScheduleRow, DoctorClinicServiceRow } from '../../../types';
import { DAYS_OF_WEEK, GOVERNORATES } from '../constants';
import { DoctorAdContactSection } from './DoctorAdContactSection';
import { DoctorAdPricingServicesSection } from './DoctorAdPricingServicesSection';
import { DoctorAdScheduleSection } from './DoctorAdScheduleSection';
import { DoctorAdImagesSection } from './DoctorAdImagesSection';
import { CUSTOM_CITY_OPTION, LEGACY_CUSTOM_CITY_OPTION, formatTimeWithPeriod, isCustomCityValue, toNumber } from './utils';
import { CITIES_BY_GOVERNORATE } from '../constants';

interface BranchEditorCardProps {
  branch: DoctorAdBranch;

  // CRUD على الفرع
  onRename: (name: string) => void;
  onUpdateField: (
    field: 'governorate' | 'city' | 'addressDetails' | 'contactPhone' | 'whatsapp'
         | 'examinationPrice' | 'discountedExaminationPrice'
         | 'consultationPrice' | 'discountedConsultationPrice',
    value: string | number | null
  ) => void;

  // CRUD للخدمات داخل الفرع
  onAddServiceRow: () => void;
  onUpdateServiceRow: (rowId: string, patch: Partial<DoctorClinicServiceRow>) => void;
  onRemoveServiceRow: (rowId: string) => void;

  // CRUD للمواعيد داخل الفرع
  onAddScheduleRow: (row: Omit<DoctorClinicScheduleRow, 'id'>) => void;
  onUpdateScheduleRow: (rowId: string, patch: Partial<DoctorClinicScheduleRow>) => void;
  onRemoveScheduleRow: (rowId: string) => void;

  // الصور
  deletingImageIndex: number | null;
  onAddImageFromFile: (file: File) => Promise<void>;
  onRemoveImage: (index: number) => Promise<void>;

  // علشان نعرض رسالة خطأ لو المستخدم ضغط "إضافة موعد" بدون حقول
  onInlineError: (message: string) => void;
}

export const BranchEditorCard: React.FC<BranchEditorCardProps> = ({
  branch,
  onRename,
  onUpdateField,
  onAddServiceRow,
  onUpdateServiceRow,
  onRemoveServiceRow,
  onAddScheduleRow,
  onUpdateScheduleRow,
  onRemoveScheduleRow,
  deletingImageIndex,
  onAddImageFromFile,
  onRemoveImage,
  onInlineError,
}) => {
  // قائمة مدن المحافظة المختارة — بتتحسب لكل فرع على حدة
  const cityOptions = React.useMemo(() => {
    if (!branch.governorate) return [] as string[];
    const raw = CITIES_BY_GOVERNORATE[branch.governorate] || [LEGACY_CUSTOM_CITY_OPTION];
    // بنوحّد الاسم القديم "إضافة مدينة" مع الجديد "أخرى"
    const normalized = raw.map((c) => (c === LEGACY_CUSTOM_CITY_OPTION ? CUSTOM_CITY_OPTION : c));
    return Array.from(new Set(normalized));
  }, [branch.governorate]);

  // حالة محلية: هل الدروب داون فاتح على "أخرى"؟ نستخدمها لما branch.city فاضية
  // بعد ما المستخدم يختار "أخرى" لحد ما يبدأ يكتب الاسم الفعلي.
  const initialIsCustom = !!branch.city && !cityOptions.includes(branch.city);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(initialIsCustom);

  // لما المحافظة تتغير، نعيد تقييم حالة "أخرى"
  React.useEffect(() => {
    if (branch.city && !cityOptions.includes(branch.city)) {
      setIsCustomMode(true);
    } else if (cityOptions.includes(branch.city)) {
      setIsCustomMode(false);
    }
  }, [branch.city, cityOptions]);

  // قيمة الـselect المعروضة: المدينة الفعلية لو موجودة في القائمة، وإلا "أخرى"
  const dropdownValue = cityOptions.includes(branch.city)
    ? branch.city
    : (isCustomMode ? CUSTOM_CITY_OPTION : '');

  const handleCityDropdownChange = (value: string) => {
    if (isCustomCityValue(value)) {
      setIsCustomMode(true);
      // نمسح branch.city لو كانت قيمة من القائمة، عشان المستخدم يبدأ يكتب الاسم الفعلي
      if (cityOptions.includes(branch.city)) onUpdateField('city', '');
    } else {
      setIsCustomMode(false);
      onUpdateField('city', value);
    }
  };

  return (
    <div className="space-y-3">
      {/* اسم الفرع */}
      <section className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm p-3">
        <label className="block text-[11px] font-bold text-slate-400 mb-1">اسم الفرع (يظهر للجمهور)</label>
        <input
          value={branch.name}
          onChange={(event) => onRename(event.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
          placeholder="مثال: فرع المعادي"
        />
      </section>

      {/* العنوان وأرقام التواصل */}
      <DoctorAdContactSection
        governorate={branch.governorate}
        city={dropdownValue}
        otherCity={isCustomMode ? branch.city : ''}
        addressDetails={branch.addressDetails}
        contactPhone={branch.contactPhone}
        whatsapp={branch.whatsapp}
        governorates={GOVERNORATES}
        cityOptions={cityOptions}
        isCustomCityValue={isCustomCityValue}
        onGovernorateChange={(value) => {
          onUpdateField('governorate', value);
          // لما المحافظة تتغير، نمسح المدينة لأن الـcityOptions هتتغير
          onUpdateField('city', '');
          setIsCustomMode(false);
        }}
        onCityChange={handleCityDropdownChange}
        onOtherCityChange={(value) => onUpdateField('city', value)}
        onAddressDetailsChange={(value) => onUpdateField('addressDetails', value)}
        onContactPhoneChange={(value) => onUpdateField('contactPhone', value)}
        onWhatsappChange={(value) => onUpdateField('whatsapp', value)}
      />

      {/* الأسعار والخدمات */}
      <DoctorAdPricingServicesSection
        examinationPrice={branch.examinationPrice != null ? String(branch.examinationPrice) : ''}
        discountedExaminationPrice={branch.discountedExaminationPrice != null ? String(branch.discountedExaminationPrice) : ''}
        consultationPrice={branch.consultationPrice != null ? String(branch.consultationPrice) : ''}
        discountedConsultationPrice={branch.discountedConsultationPrice != null ? String(branch.discountedConsultationPrice) : ''}
        clinicServices={branch.clinicServices}
        onExaminationPriceChange={(v) => onUpdateField('examinationPrice', toNumber(v))}
        onDiscountedExaminationPriceChange={(v) => onUpdateField('discountedExaminationPrice', toNumber(v))}
        onConsultationPriceChange={(v) => onUpdateField('consultationPrice', toNumber(v))}
        onDiscountedConsultationPriceChange={(v) => onUpdateField('discountedConsultationPrice', toNumber(v))}
        onServiceNameChange={(id, value) => onUpdateServiceRow(id, { name: value })}
        onServicePriceChange={(id, value) => onUpdateServiceRow(id, { price: toNumber(value) })}
        onServiceDiscountedPriceChange={(id, value) => onUpdateServiceRow(id, { discountedPrice: toNumber(value) })}
        onRemoveService={onRemoveServiceRow}
        onAddService={onAddServiceRow}
      />

      {/* المواعيد — كل فرع له مواعيده وبافره الخاص لإضافة صف جديد */}
      <BranchScheduleWrapper
        clinicSchedule={branch.clinicSchedule}
        onAddScheduleRow={onAddScheduleRow}
        onUpdateScheduleRow={onUpdateScheduleRow}
        onRemoveScheduleRow={onRemoveScheduleRow}
        onInlineError={onInlineError}
      />

      {/* صور الفرع */}
      <DoctorAdImagesSection
        imageUrls={branch.imageUrls}
        deletingImageIndex={deletingImageIndex}
        onAddImageFromFile={onAddImageFromFile}
        onRemoveImage={onRemoveImage}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// غلاف للمواعيد: بيمسك بافر الإدخال (اليوم/من/إلى/ملاحظات) محلياً لكل فرع،
// وبيستدعي onAddScheduleRow لما المستخدم يضغط "إضافة".
// ─────────────────────────────────────────────────────────────────────────────
interface BranchScheduleWrapperProps {
  clinicSchedule: DoctorClinicScheduleRow[];
  onAddScheduleRow: (row: Omit<DoctorClinicScheduleRow, 'id'>) => void;
  onUpdateScheduleRow: (rowId: string, patch: Partial<DoctorClinicScheduleRow>) => void;
  onRemoveScheduleRow: (rowId: string) => void;
  onInlineError: (message: string) => void;
}

const BranchScheduleWrapper: React.FC<BranchScheduleWrapperProps> = ({
  clinicSchedule,
  onAddScheduleRow,
  onUpdateScheduleRow,
  onRemoveScheduleRow,
  onInlineError,
}) => {
  const [newDay, setNewDay] = useState('');
  const [newFrom, setNewFrom] = useState('');
  const [newTo, setNewTo] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handleAdd = () => {
    if (!newDay || !newFrom || !newTo) {
      onInlineError('يرجى إدخال اليوم ووقت البداية والنهاية قبل إضافة الموعد.');
      return;
    }
    onAddScheduleRow({ day: newDay, from: newFrom, to: newTo, notes: newNotes.trim() });
    setNewDay('');
    setNewFrom('');
    setNewTo('');
    setNewNotes('');
  };

  return (
    <DoctorAdScheduleSection
      clinicSchedule={clinicSchedule}
      newScheduleDay={newDay}
      newScheduleFrom={newFrom}
      newScheduleTo={newTo}
      newScheduleNotes={newNotes}
      daysOfWeek={DAYS_OF_WEEK}
      formatTimeWithPeriod={formatTimeWithPeriod}
      onNewScheduleDayChange={setNewDay}
      onNewScheduleFromChange={setNewFrom}
      onNewScheduleToChange={setNewTo}
      onNewScheduleNotesChange={setNewNotes}
      onAddScheduleRow={handleAdd}
      onRemoveScheduleRow={onRemoveScheduleRow}
      onUpdateScheduleRow={onUpdateScheduleRow}
    />
  );
};
