import { doc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from './firebaseConfig';
import { subscribeDocCacheFirst } from './firestore/cacheFirst';
import {
  EMPTY_PATIENT_ADDRESS_TEMPLATES,
  normalizePatientAddressTemplateLibrary,
  type PatientAddressTemplateInput,
  type PatientAddressTemplateLibrary,
} from '../utils/patientAddressTemplates';

export type PatientAddressTemplateRole = 'doctor' | 'secretary';

export interface PatientAddressTemplateSource {
  role: PatientAddressTemplateRole;
  userId?: string | null;
  bookingSecret?: string | null;
}

export interface SavePatientAddressTemplateInput extends PatientAddressTemplateSource {
  sessionToken?: string;
  branchId?: string;
  template: PatientAddressTemplateInput;
}

const normalizeId = (value: unknown): string => String(value || '').trim();

export const subscribeToPatientAddressTemplates = (
  source: PatientAddressTemplateSource,
  onUpdate: (library: PatientAddressTemplateLibrary) => void,
  onError?: (error: Error) => void,
): (() => void) => {
  const userId = normalizeId(source.userId);
  const bookingSecret = normalizeId(source.bookingSecret);
  const reference = source.role === 'secretary'
    ? (bookingSecret ? doc(db, 'bookingConfig', bookingSecret) : null)
    : (userId ? doc(db, 'users', userId, 'settings', 'patientAddressTemplates') : null);

  if (!reference) {
    onUpdate({ ...EMPTY_PATIENT_ADDRESS_TEMPLATES, cities: [], details: [] });
    return () => undefined;
  }

  return subscribeDocCacheFirst(reference, {
    next: (snapshot) => {
      const data = snapshot.exists() ? snapshot.data() : {};
      onUpdate(normalizePatientAddressTemplateLibrary(data));
    },
    error: (error) => onError?.(error),
  });
};

export const savePatientAddressTemplate = async (
  input: SavePatientAddressTemplateInput,
): Promise<PatientAddressTemplateLibrary> => {
  const callable = httpsCallable<
    {
      userId?: string;
      secret?: string;
      sessionToken?: string;
      branchId?: string;
      kind: PatientAddressTemplateInput['kind'];
      governorate: string;
      cityArea?: string;
      value: string;
    },
    { templates?: unknown }
  >(functions, 'upsertPatientAddressTemplate');

  const response = await callable({
    userId: normalizeId(input.userId) || undefined,
    secret: normalizeId(input.bookingSecret) || undefined,
    sessionToken: normalizeId(input.sessionToken) || undefined,
    branchId: normalizeId(input.branchId) || undefined,
    kind: input.template.kind,
    governorate: input.template.governorate,
    cityArea: input.template.cityArea,
    value: input.template.value,
  });

  return normalizePatientAddressTemplateLibrary(response.data?.templates);
};
