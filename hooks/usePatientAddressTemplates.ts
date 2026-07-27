import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  savePatientAddressTemplate,
  subscribeToPatientAddressTemplates,
  type PatientAddressTemplateRole,
} from '../services/patientAddressTemplatesService';
import {
  addPatientAddressTemplateLocally,
  getPatientAddressCityTemplates,
  getPatientAddressDetailsTemplates,
  type PatientAddressTemplateInput,
  type PatientAddressTemplateLibrary,
} from '../utils/patientAddressTemplates';

interface UsePatientAddressTemplatesInput {
  role?: PatientAddressTemplateRole;
  userId?: string | null;
  bookingSecret?: string | null;
  secretarySessionToken?: string | null;
  branchId?: string | null;
}

const createEmptyLibrary = (): PatientAddressTemplateLibrary => ({
  version: 1,
  cities: [],
  details: [],
});

export const usePatientAddressTemplates = ({
  role = 'doctor',
  userId,
  bookingSecret,
  secretarySessionToken,
  branchId,
}: UsePatientAddressTemplatesInput) => {
  const [templates, setTemplates] = useState<PatientAddressTemplateLibrary>(createEmptyLibrary);
  const [saveError, setSaveError] = useState('');
  const templatesRef = useRef(templates);

  useEffect(() => {
    setSaveError('');
    return subscribeToPatientAddressTemplates(
      { role, userId, bookingSecret },
      (nextTemplates) => {
        templatesRef.current = nextTemplates;
        setTemplates(nextTemplates);
      },
      () => setSaveError('تعذر تحديث قوالب العناوين لحظيًا.'),
    );
  }, [bookingSecret, role, userId]);

  const rememberTemplate = useCallback(async (template: PatientAddressTemplateInput) => {
    const normalizedValue = String(template.value || '').replace(/\s+/g, ' ').trim();
    const normalizedGovernorate = String(template.governorate || '').trim();
    const normalizedCity = String(template.cityArea || '').replace(/\s+/g, ' ').trim();
    if (!normalizedGovernorate || !normalizedValue) return;

    const normalizedTemplate = {
      ...template,
      governorate: normalizedGovernorate,
      cityArea: normalizedCity || undefined,
      value: normalizedValue,
    };

    const relevantValues = normalizedTemplate.kind === 'city'
      ? getPatientAddressCityTemplates(templatesRef.current, normalizedGovernorate)
      : getPatientAddressDetailsTemplates(
        templatesRef.current,
        normalizedGovernorate,
        normalizedCity,
      );
    if (relevantValues.includes(normalizedValue)) return;

    const optimistic = addPatientAddressTemplateLocally(
      templatesRef.current,
      normalizedTemplate,
    );
    templatesRef.current = optimistic;
    setTemplates(optimistic);

    try {
      const saved = await savePatientAddressTemplate({
        role,
        userId,
        bookingSecret,
        sessionToken: secretarySessionToken || undefined,
        branchId: branchId || undefined,
        template: normalizedTemplate,
      });
      templatesRef.current = saved;
      setTemplates(saved);
      setSaveError('');
    } catch {
      setSaveError('تعذر حفظ القالب الآن؛ سيظل العنوان موجودًا في بيانات المريض.');
    }
  }, [bookingSecret, branchId, role, secretarySessionToken, userId]);

  const rememberCity = useCallback(
    (governorate: string, cityArea: string) =>
      rememberTemplate({ kind: 'city', governorate, value: cityArea }),
    [rememberTemplate],
  );
  const rememberDetails = useCallback(
    (governorate: string, cityArea: string, details: string) =>
      rememberTemplate({ kind: 'details', governorate, cityArea, value: details }),
    [rememberTemplate],
  );

  return useMemo(() => ({
    templates,
    saveError,
    rememberCity,
    rememberDetails,
  }), [rememberCity, rememberDetails, saveError, templates]);
};
