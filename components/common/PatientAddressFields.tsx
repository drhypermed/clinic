import React, { useEffect, useMemo, useState } from 'react';
import { usePatientAddressTemplates } from '../../hooks/usePatientAddressTemplates';
import type { PatientAddressTemplateRole } from '../../services/patientAddressTemplatesService';
import { EGYPT_GOVERNORATES, isEgyptGovernorate } from '../../utils/egyptGovernorates';
import {
  getPatientAddressCityTemplates,
  getPatientAddressDetailsTemplates,
} from '../../utils/patientAddressTemplates';

const OTHER_VALUE = '__other__';

interface PatientAddressFieldsProps {
  governorate: string;
  onGovernorateChange: (value: string) => void;
  cityArea: string;
  onCityAreaChange: (value: string) => void;
  details: string;
  onDetailsChange: (value: string) => void;
  role?: PatientAddressTemplateRole;
  userId?: string | null;
  bookingSecret?: string | null;
  secretarySessionToken?: string | null;
  branchId?: string | null;
  fieldClassName: string;
  labelClassName?: string;
  governorateContainerClassName?: string;
  cityContainerClassName?: string;
  detailsContainerClassName?: string;
}

export const PatientAddressFields: React.FC<PatientAddressFieldsProps> = ({
  governorate,
  onGovernorateChange,
  cityArea,
  onCityAreaChange,
  details,
  onDetailsChange,
  role = 'doctor',
  userId,
  bookingSecret,
  secretarySessionToken,
  branchId,
  fieldClassName,
  labelClassName = 'mb-1.5 block text-xs font-bold text-slate-500',
  governorateContainerClassName,
  cityContainerClassName,
  detailsContainerClassName,
}) => {
  const { templates, saveError, rememberCity, rememberDetails } = usePatientAddressTemplates({
    role,
    userId,
    bookingSecret,
    secretarySessionToken,
    branchId,
  });
  const [customCityOpen, setCustomCityOpen] = useState(false);
  const [customDetailsOpen, setCustomDetailsOpen] = useState(false);
  const canRemember = role === 'secretary' ? Boolean(bookingSecret) : Boolean(userId);

  const cityOptions = useMemo(
    () => getPatientAddressCityTemplates(templates, governorate),
    [governorate, templates],
  );
  const detailsOptions = useMemo(
    () => getPatientAddressDetailsTemplates(templates, governorate, cityArea),
    [cityArea, governorate, templates],
  );

  useEffect(() => {
    if (!cityArea) return;
    setCustomCityOpen(!cityOptions.includes(cityArea));
  }, [cityArea, cityOptions]);

  useEffect(() => {
    if (!details) return;
    setCustomDetailsOpen(!detailsOptions.includes(details));
  }, [details, detailsOptions]);

  const handleGovernorateChange = (value: string) => {
    onGovernorateChange(value);
    onCityAreaChange('');
    onDetailsChange('');
    setCustomCityOpen(false);
    setCustomDetailsOpen(false);
  };

  const handleCitySelection = (value: string) => {
    if (value === OTHER_VALUE) {
      onCityAreaChange('');
      onDetailsChange('');
      setCustomCityOpen(true);
      setCustomDetailsOpen(false);
      return;
    }
    onCityAreaChange(value);
    onDetailsChange('');
    setCustomCityOpen(false);
    setCustomDetailsOpen(false);
  };

  const handleDetailsSelection = (value: string) => {
    if (value === OTHER_VALUE) {
      onDetailsChange('');
      setCustomDetailsOpen(true);
      return;
    }
    onDetailsChange(value);
    setCustomDetailsOpen(false);
  };

  const citySelectValue = customCityOpen ? OTHER_VALUE : cityArea;
  const detailsSelectValue = customDetailsOpen ? OTHER_VALUE : details;

  return (
    <>
      <div className={governorateContainerClassName}>
        <label className={labelClassName}>المحافظة (اختياري)</label>
        <select
          value={governorate}
          onChange={(event) => handleGovernorateChange(event.target.value)}
          className={fieldClassName}
        >
          <option value="">اختر المحافظة</option>
          {!isEgyptGovernorate(governorate) && governorate && (
            <option value={governorate}>{governorate}</option>
          )}
          {EGYPT_GOVERNORATES.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className={cityContainerClassName}>
        <label className={labelClassName}>المدينة / المنطقة (اختياري)</label>
        <select
          value={citySelectValue}
          onChange={(event) => handleCitySelection(event.target.value)}
          className={fieldClassName}
          disabled={!governorate}
        >
          <option value="">{governorate ? 'اختر المدينة أو المنطقة' : 'اختر المحافظة أولًا'}</option>
          {cityOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          <option value={OTHER_VALUE}>أخرى — إضافة مدينة أو منطقة جديدة</option>
        </select>
        {customCityOpen && (
          <>
            <input
              type="text"
              value={cityArea}
              onChange={(event) => onCityAreaChange(event.target.value)}
              onBlur={() => canRemember && void rememberCity(governorate, cityArea)}
              placeholder="اكتب المدينة أو المنطقة الجديدة"
              className={`${fieldClassName} mt-2`}
              maxLength={150}
              autoFocus
            />
            {canRemember && <p className="mt-1 text-[10px] font-bold text-brand-600">سيُحفظ تلقائيًا ضمن الاختيارات.</p>}
          </>
        )}
      </div>

      <div className={detailsContainerClassName}>
        <label className={labelClassName}>العنوان التفصيلي (اختياري)</label>
        <select
          value={detailsSelectValue}
          onChange={(event) => handleDetailsSelection(event.target.value)}
          className={fieldClassName}
          disabled={!governorate}
        >
          <option value="">{governorate ? 'اختر عنوانًا محفوظًا' : 'اختر المحافظة أولًا'}</option>
          {detailsOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          <option value={OTHER_VALUE}>أخرى — إضافة عنوان تفصيلي جديد</option>
        </select>
        {customDetailsOpen && (
          <>
            <input
              type="text"
              value={details}
              onChange={(event) => onDetailsChange(event.target.value)}
              onBlur={() => canRemember && void rememberDetails(governorate, cityArea, details)}
              placeholder="الشارع، رقم العقار، الدور أو علامة مميزة"
              className={`${fieldClassName} mt-2`}
              maxLength={400}
              autoFocus
            />
            {canRemember && <p className="mt-1 text-[10px] font-bold text-brand-600">سيُحفظ تلقائيًا ضمن الاختيارات.</p>}
          </>
        )}
        {saveError && <p className="mt-1 text-[10px] font-bold text-danger-600">{saveError}</p>}
      </div>
    </>
  );
};
