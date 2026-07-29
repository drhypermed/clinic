import React, { useMemo, useState } from 'react';
import { usePatientAddressTemplates } from '../../hooks/usePatientAddressTemplates';
import type { PatientAddressTemplateRole } from '../../services/patientAddressTemplatesService';
import type { PatientAddressTemplate } from '../../utils/patientAddressTemplates';

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

const cleanText = (value: unknown): string =>
  String(value || '').replace(/\s+/g, ' ').trim();

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
  const {
    templates,
    saveError,
    rememberAddress,
    updateTemplate,
    removeTemplate,
  } = usePatientAddressTemplates({
    role,
    userId,
    bookingSecret,
    secretarySessionToken,
    branchId,
  });
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PatientAddressTemplate | null>(null);
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editBusy, setEditBusy] = useState(false);
  const canManageTemplates = role === 'secretary' ? Boolean(bookingSecret) : Boolean(userId);

  const fullAddress = useMemo(() => {
    if (!cleanText(governorate) && !cleanText(cityArea)) return details;
    return [governorate, cityArea, details].map(cleanText).filter(Boolean).join('، ');
  }, [cityArea, details, governorate]);
  const matchingTemplates = useMemo(() => {
    const query = cleanText(fullAddress).toLocaleLowerCase('ar');
    if (!query) return templates.addresses;
    return templates.addresses.filter((template) =>
      template.name.toLocaleLowerCase('ar').includes(query)
      || template.address.toLocaleLowerCase('ar').includes(query));
  }, [fullAddress, templates.addresses]);

  const setFullAddress = (value: string) => {
    onGovernorateChange('');
    onCityAreaChange('');
    onDetailsChange(value);
  };

  const handleWidgetBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) return;
    setTemplatesOpen(false);
    if (canManageTemplates && cleanText(fullAddress)) {
      void rememberAddress(fullAddress);
    }
  };

  const startEditing = (template: PatientAddressTemplate) => {
    setEditingTemplate(template);
    setEditName(template.name);
    setEditAddress(template.address);
    setTemplatesOpen(false);
  };

  const saveEditedTemplate = async () => {
    if (!editingTemplate || !cleanText(editName) || !cleanText(editAddress)) return;
    setEditBusy(true);
    const saved = await updateTemplate({
      ...editingTemplate,
      name: editName,
      address: editAddress,
    });
    setEditBusy(false);
    if (saved) setEditingTemplate(null);
  };

  const deleteTemplate = async (template: PatientAddressTemplate) => {
    if (!window.confirm(`حذف قالب العنوان «${template.name}»؟`)) return;
    setEditBusy(true);
    const deleted = await removeTemplate(template.id);
    setEditBusy(false);
    if (deleted && editingTemplate?.id === template.id) setEditingTemplate(null);
  };

  const containerClassName = detailsContainerClassName
    || cityContainerClassName
    || governorateContainerClassName;

  return (
    <div className={containerClassName} onBlur={handleWidgetBlur}>
      <label className={labelClassName}>العنوان (اختياري)</label>
      <div className="relative">
        <input
          type="text"
          value={fullAddress}
          onChange={(event) => {
            setFullAddress(event.target.value);
            setTemplatesOpen(true);
          }}
          onFocus={() => setTemplatesOpen(true)}
          placeholder="مثال: بنها"
          className={`${fieldClassName} ${templates.addresses.length > 0 ? 'pl-20' : ''} placeholder:font-normal placeholder:text-slate-300`}
          maxLength={500}
          autoComplete="off"
          aria-label="العنوان"
          aria-expanded={templatesOpen}
        />
        {templates.addresses.length > 0 && (
          <button
            type="button"
            onClick={() => setTemplatesOpen((open) => !open)}
            className="absolute inset-y-0 left-2 my-auto h-7 rounded-lg px-2 text-[11px] font-black text-brand-600 hover:bg-brand-50"
            aria-label="عرض قوالب العناوين"
          >
            القوالب
          </button>
        )}

        {templatesOpen && templates.addresses.length > 0 && (
          <div className="absolute z-[180] mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 text-right shadow-xl">
            {matchingTemplates.length > 0 ? matchingTemplates.map((template) => (
              <div
                key={template.id}
                className="flex items-center gap-1 rounded-lg hover:bg-slate-50"
              >
                <button
                  type="button"
                  onClick={() => {
                    setFullAddress(template.address);
                    setTemplatesOpen(false);
                  }}
                  className="min-w-0 flex-1 px-2 py-2 text-right"
                >
                  <span className="block truncate text-xs font-black text-slate-800">
                    {template.name}
                  </span>
                  {template.name !== template.address && (
                    <span className="mt-0.5 block truncate text-[10px] font-bold text-slate-500">
                      {template.address}
                    </span>
                  )}
                </button>
                {canManageTemplates && (
                  <>
                    <button
                      type="button"
                      onClick={() => startEditing(template)}
                      className="rounded-md px-2 py-1 text-[10px] font-black text-brand-600 hover:bg-brand-50"
                    >
                      تعديل
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteTemplate(template)}
                      className="rounded-md px-2 py-1 text-[10px] font-black text-danger-600 hover:bg-danger-50"
                    >
                      حذف
                    </button>
                  </>
                )}
              </div>
            )) : (
              <p className="px-3 py-2 text-xs font-bold text-slate-500">
                لا يوجد قالب مطابق؛ سيُحفظ العنوان الجديد تلقائيًا.
              </p>
            )}
          </div>
        )}
      </div>

      {canManageTemplates && (
        <p className="mt-1 text-[10px] font-bold text-brand-600">
          أي عنوان جديد تكتبه سيُحفظ تلقائيًا كقالب جاهز للطبيب والسكرتارية.
        </p>
      )}

      {editingTemplate && (
        <div className="mt-2 rounded-xl border border-brand-100 bg-brand-50/50 p-3">
          <p className="mb-2 text-xs font-black text-slate-700">تعديل قالب العنوان</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input
              type="text"
              value={editName}
              onChange={(event) => setEditName(event.target.value)}
              placeholder="اسم القالب، مثال: المنزل"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-brand-400"
              maxLength={100}
              aria-label="اسم قالب العنوان"
            />
            <input
              type="text"
              value={editAddress}
              onChange={(event) => setEditAddress(event.target.value)}
              placeholder="نص العنوان"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-brand-400"
              maxLength={500}
              aria-label="نص قالب العنوان"
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void saveEditedTemplate()}
              disabled={editBusy || !cleanText(editName) || !cleanText(editAddress)}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-[11px] font-black text-white disabled:opacity-50"
            >
              حفظ التعديل
            </button>
            <button
              type="button"
              onClick={() => setEditingTemplate(null)}
              disabled={editBusy}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-black text-slate-600"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={() => void deleteTemplate(editingTemplate)}
              disabled={editBusy}
              className="rounded-lg border border-danger-200 bg-white px-3 py-1.5 text-[11px] font-black text-danger-600"
            >
              حذف القالب
            </button>
          </div>
        </div>
      )}

      {saveError && <p className="mt-1 text-[10px] font-bold text-danger-600">{saveError}</p>}
    </div>
  );
};
