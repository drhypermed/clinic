export interface PatientAddressTemplate {
  id: string;
  name: string;
  address: string;
}

export interface PatientAddressTemplateLibrary {
  version: 2;
  addresses: PatientAddressTemplate[];
}

export interface PatientAddressTemplateInput {
  id: string;
  name: string;
  address: string;
}

export const EMPTY_PATIENT_ADDRESS_TEMPLATES: PatientAddressTemplateLibrary = Object.freeze({
  version: 2,
  addresses: [],
});

const normalizeText = (value: unknown, maxLength: number): string =>
  String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);

const normalizeId = (value: unknown): string =>
  normalizeText(value, 120).replace(/[^a-zA-Z0-9_-]/g, '');

const makeLegacyId = (value: string): string => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `legacy_${(hash >>> 0).toString(36)}`;
};

export const createPatientAddressTemplateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `address_${crypto.randomUUID().replace(/-/g, '')}`;
  }
  return `address_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};

const normalizeTemplate = (value: unknown): PatientAddressTemplate | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const source = value as { id?: unknown; name?: unknown; address?: unknown; value?: unknown };
  const address = normalizeText(source.address ?? source.value, 500);
  if (!address) return null;
  const id = normalizeId(source.id) || makeLegacyId(address);
  const name = normalizeText(source.name, 100) || address.slice(0, 100);
  return { id, name, address };
};

const legacyAddresses = (source: {
  cities?: unknown;
  details?: unknown;
}): PatientAddressTemplate[] => {
  const values: string[] = [];

  if (Array.isArray(source.details)) {
    source.details.forEach((rawGroup) => {
      if (!rawGroup || typeof rawGroup !== 'object' || Array.isArray(rawGroup)) return;
      const group = rawGroup as {
        governorate?: unknown;
        cityArea?: unknown;
        values?: unknown;
      };
      const prefix = [
        normalizeText(group.governorate, 100),
        normalizeText(group.cityArea, 150),
      ].filter(Boolean);
      if (!Array.isArray(group.values)) return;
      group.values.forEach((rawValue) => {
        const details = normalizeText(rawValue, 400);
        const address = [...prefix, details].filter(Boolean).join('، ');
        if (address) values.push(address);
      });
    });
  }

  if (Array.isArray(source.cities)) {
    source.cities.forEach((rawGroup) => {
      if (!rawGroup || typeof rawGroup !== 'object' || Array.isArray(rawGroup)) return;
      const group = rawGroup as { governorate?: unknown; values?: unknown };
      const governorate = normalizeText(group.governorate, 100);
      if (!Array.isArray(group.values)) return;
      group.values.forEach((rawValue) => {
        const city = normalizeText(rawValue, 150);
        const address = [governorate, city].filter(Boolean).join('، ');
        if (address) values.push(address);
      });
    });
  }

  return values.map((address) => ({
    id: makeLegacyId(address),
    name: address.slice(0, 100),
    address,
  }));
};

export const normalizePatientAddressTemplateLibrary = (
  value: unknown,
): PatientAddressTemplateLibrary => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { version: 2, addresses: [] };
  }

  const source = value as {
    addresses?: unknown;
    cities?: unknown;
    details?: unknown;
    patientAddressTemplates?: unknown;
  };
  if (source.patientAddressTemplates && source.patientAddressTemplates !== value) {
    return normalizePatientAddressTemplateLibrary(source.patientAddressTemplates);
  }

  const candidates = [
    ...(Array.isArray(source.addresses) ? source.addresses : []),
    ...legacyAddresses(source),
  ];
  const byId = new Map<string, PatientAddressTemplate>();
  const addressIds = new Map<string, string>();

  candidates.forEach((candidate) => {
    const template = normalizeTemplate(candidate);
    if (!template) return;
    const normalizedAddressKey = template.address.toLocaleLowerCase('ar');
    const duplicateId = addressIds.get(normalizedAddressKey);
    if (duplicateId && duplicateId !== template.id) return;
    byId.set(template.id, template);
    addressIds.set(normalizedAddressKey, template.id);
  });

  return {
    version: 2,
    addresses: Array.from(byId.values())
      .sort((left, right) => left.name.localeCompare(right.name, 'ar'))
      .slice(0, 300),
  };
};

export const upsertPatientAddressTemplateLocally = (
  library: PatientAddressTemplateLibrary,
  input: PatientAddressTemplateInput,
): PatientAddressTemplateLibrary => {
  const normalized = normalizePatientAddressTemplateLibrary(library);
  const template = normalizeTemplate(input);
  if (!template) return normalized;

  const addresses = normalized.addresses
    .filter((item) =>
      item.id !== template.id
      && item.address.toLocaleLowerCase('ar') !== template.address.toLocaleLowerCase('ar'))
    .concat(template);
  return normalizePatientAddressTemplateLibrary({ version: 2, addresses });
};

export const deletePatientAddressTemplateLocally = (
  library: PatientAddressTemplateLibrary,
  templateId: string,
): PatientAddressTemplateLibrary => {
  const normalizedId = normalizeId(templateId);
  const normalized = normalizePatientAddressTemplateLibrary(library);
  return {
    version: 2,
    addresses: normalized.addresses.filter((item) => item.id !== normalizedId),
  };
};

export const findPatientAddressTemplate = (
  library: PatientAddressTemplateLibrary,
  address: string,
): PatientAddressTemplate | undefined => {
  const normalizedAddress = normalizeText(address, 500).toLocaleLowerCase('ar');
  if (!normalizedAddress) return undefined;
  return normalizePatientAddressTemplateLibrary(library).addresses.find(
    (item) => item.address.toLocaleLowerCase('ar') === normalizedAddress,
  );
};
