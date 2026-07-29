import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseConfig';
import { normalizeVisitServiceTemplates } from './helpers';
import type {
  AddVisitServiceInput,
  VisitServiceCharge,
  VisitServicesSnapshot,
} from './types';

interface SecretaryVisitServiceContext {
  userId: string;
  secret: string;
  sessionToken?: string;
  branchId?: string;
  appointmentId: string;
  secretaryName?: string;
}

const parseItems = (value: unknown): VisitServiceCharge[] =>
  Array.isArray(value)
    ? value.filter((item): item is VisitServiceCharge => Boolean(
        item
        && typeof item === 'object'
        && String((item as VisitServiceCharge).id || '').trim(),
      ))
    : [];

export const loadSecretaryVisitServices = async (
  context: SecretaryVisitServiceContext,
): Promise<VisitServicesSnapshot> => {
  const callable = httpsCallable(functions, 'listVisitServicesForSecretary');
  const response = await callable(context);
  const data = (response.data || {}) as { items?: unknown; templates?: unknown };
  return {
    items: parseItems(data.items),
    templates: normalizeVisitServiceTemplates(data.templates),
  };
};

export const addSecretaryVisitService = async (
  context: SecretaryVisitServiceContext,
  input: AddVisitServiceInput,
): Promise<VisitServicesSnapshot> => {
  const callable = httpsCallable(functions, 'addVisitServiceForSecretary');
  const response = await callable({ ...context, ...input });
  const data = (response.data || {}) as { items?: unknown; templates?: unknown };
  return {
    items: parseItems(data.items),
    templates: normalizeVisitServiceTemplates(data.templates),
  };
};

export const deleteSecretaryVisitService = async (
  context: SecretaryVisitServiceContext,
  itemId: string,
): Promise<VisitServicesSnapshot> => {
  const callable = httpsCallable(functions, 'deleteVisitServiceForSecretary');
  const response = await callable({ ...context, itemId });
  const data = (response.data || {}) as { items?: unknown; templates?: unknown };
  return {
    items: parseItems(data.items),
    templates: normalizeVisitServiceTemplates(data.templates),
  };
};

