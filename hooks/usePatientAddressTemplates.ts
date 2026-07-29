import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  deletePatientAddressTemplate,
  savePatientAddressTemplate,
  subscribeToPatientAddressTemplates,
  type PatientAddressTemplateRole,
} from '../services/patientAddressTemplatesService';
import {
  createPatientAddressTemplateId,
  deletePatientAddressTemplateLocally,
  findPatientAddressTemplate,
  upsertPatientAddressTemplateLocally,
  type PatientAddressTemplate,
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
  version: 2,
  addresses: [],
});

const normalizeText = (value: unknown, maxLength: number): string =>
  String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);

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

  const persistTemplate = useCallback(async (template: PatientAddressTemplateInput) => {
    const optimistic = upsertPatientAddressTemplateLocally(templatesRef.current, template);
    templatesRef.current = optimistic;
    setTemplates(optimistic);

    try {
      const saved = await savePatientAddressTemplate({
        role,
        userId,
        bookingSecret,
        sessionToken: secretarySessionToken || undefined,
        branchId: branchId || undefined,
        template,
      });
      templatesRef.current = saved;
      setTemplates(saved);
      setSaveError('');
      return saved.addresses.find((item) => item.id === template.id);
    } catch {
      setSaveError('تعذر حفظ قالب العنوان الآن؛ سيظل العنوان موجودًا في بيانات المريض.');
      return undefined;
    }
  }, [bookingSecret, branchId, role, secretarySessionToken, userId]);

  const rememberAddress = useCallback(async (addressValue: string) => {
    const address = normalizeText(addressValue, 500);
    if (!address) return undefined;
    const existing = findPatientAddressTemplate(templatesRef.current, address);
    if (existing) return existing;

    const template: PatientAddressTemplateInput = {
      id: createPatientAddressTemplateId(),
      name: address.slice(0, 100),
      address,
    };
    await persistTemplate(template);
    return template;
  }, [persistTemplate]);

  const updateTemplate = useCallback(
    async (template: PatientAddressTemplate): Promise<boolean> => {
      const id = normalizeText(template.id, 120);
      const name = normalizeText(template.name, 100);
      const address = normalizeText(template.address, 500);
      if (!id || !name || !address) return false;
      const saved = await persistTemplate({ id, name, address });
      return Boolean(saved);
    },
    [persistTemplate],
  );

  const removeTemplate = useCallback(async (templateId: string): Promise<boolean> => {
    const normalizedId = normalizeText(templateId, 120);
    if (!normalizedId) return false;
    const previous = templatesRef.current;
    const optimistic = deletePatientAddressTemplateLocally(previous, normalizedId);
    templatesRef.current = optimistic;
    setTemplates(optimistic);

    try {
      const saved = await deletePatientAddressTemplate({
        role,
        userId,
        bookingSecret,
        sessionToken: secretarySessionToken || undefined,
        branchId: branchId || undefined,
        templateId: normalizedId,
      });
      templatesRef.current = saved;
      setTemplates(saved);
      setSaveError('');
      return true;
    } catch {
      templatesRef.current = previous;
      setTemplates(previous);
      setSaveError('تعذر حذف قالب العنوان الآن.');
      return false;
    }
  }, [bookingSecret, branchId, role, secretarySessionToken, userId]);

  return useMemo(() => ({
    templates,
    saveError,
    rememberAddress,
    updateTemplate,
    removeTemplate,
  }), [rememberAddress, removeTemplate, saveError, templates, updateTemplate]);
};
