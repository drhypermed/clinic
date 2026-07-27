export interface PatientAddressCityTemplateGroup {
  governorate: string;
  values: string[];
}

export interface PatientAddressDetailsTemplateGroup {
  governorate: string;
  cityArea: string;
  values: string[];
}

export interface PatientAddressTemplateLibrary {
  version: 1;
  cities: PatientAddressCityTemplateGroup[];
  details: PatientAddressDetailsTemplateGroup[];
}

export type PatientAddressTemplateKind = 'city' | 'details';

export interface PatientAddressTemplateInput {
  kind: PatientAddressTemplateKind;
  governorate: string;
  cityArea?: string;
  value: string;
}

export const EMPTY_PATIENT_ADDRESS_TEMPLATES: PatientAddressTemplateLibrary = Object.freeze({
  version: 1,
  cities: [],
  details: [],
});

const normalizeText = (value: unknown, maxLength: number): string =>
  String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);

const uniqueSorted = (values: unknown, maxLength: number, maxItems: number): string[] => {
  if (!Array.isArray(values)) return [];
  return Array.from(
    new Set(values.map((value) => normalizeText(value, maxLength)).filter(Boolean)),
  )
    .sort((left, right) => left.localeCompare(right, 'ar'))
    .slice(0, maxItems);
};

export const normalizePatientAddressTemplateLibrary = (
  value: unknown,
): PatientAddressTemplateLibrary => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { version: 1, cities: [], details: [] };
  }

  const source = value as {
    cities?: unknown;
    details?: unknown;
    patientAddressTemplates?: unknown;
  };
  if (source.patientAddressTemplates && source.patientAddressTemplates !== value) {
    return normalizePatientAddressTemplateLibrary(source.patientAddressTemplates);
  }

  const cityMap = new Map<string, Set<string>>();
  if (Array.isArray(source.cities)) {
    source.cities.forEach((rawGroup) => {
      if (!rawGroup || typeof rawGroup !== 'object' || Array.isArray(rawGroup)) return;
      const group = rawGroup as { governorate?: unknown; values?: unknown };
      const governorate = normalizeText(group.governorate, 100);
      if (!governorate) return;
      const values = uniqueSorted(group.values, 150, 100);
      if (values.length === 0) return;
      const current = cityMap.get(governorate) || new Set<string>();
      values.forEach((item) => current.add(item));
      cityMap.set(governorate, current);
    });
  }

  const detailsMap = new Map<string, PatientAddressDetailsTemplateGroup>();
  if (Array.isArray(source.details)) {
    source.details.forEach((rawGroup) => {
      if (!rawGroup || typeof rawGroup !== 'object' || Array.isArray(rawGroup)) return;
      const group = rawGroup as { governorate?: unknown; cityArea?: unknown; values?: unknown };
      const governorate = normalizeText(group.governorate, 100);
      const cityArea = normalizeText(group.cityArea, 150);
      if (!governorate) return;
      const values = uniqueSorted(group.values, 400, 150);
      if (values.length === 0) return;
      const key = `${governorate}\u0000${cityArea}`;
      const current = detailsMap.get(key) || { governorate, cityArea, values: [] };
      current.values = uniqueSorted([...current.values, ...values], 400, 150);
      detailsMap.set(key, current);
    });
  }

  return {
    version: 1,
    cities: Array.from(cityMap.entries())
      .map(([governorate, values]) => ({
        governorate,
        values: Array.from(values).sort((left, right) => left.localeCompare(right, 'ar')).slice(0, 100),
      }))
      .sort((left, right) => left.governorate.localeCompare(right.governorate, 'ar')),
    details: Array.from(detailsMap.values()).sort((left, right) => {
      const governorateOrder = left.governorate.localeCompare(right.governorate, 'ar');
      return governorateOrder || left.cityArea.localeCompare(right.cityArea, 'ar');
    }),
  };
};

export const addPatientAddressTemplateLocally = (
  library: PatientAddressTemplateLibrary,
  input: PatientAddressTemplateInput,
): PatientAddressTemplateLibrary => {
  const normalized = normalizePatientAddressTemplateLibrary(library);
  const governorate = normalizeText(input.governorate, 100);
  const cityArea = normalizeText(input.cityArea, 150);
  const templateValue = normalizeText(input.value, input.kind === 'city' ? 150 : 400);
  if (!governorate || !templateValue) return normalized;

  if (input.kind === 'city') {
    const groups = normalized.cities.map((group) => ({
      governorate: group.governorate,
      values: [...group.values],
    }));
    const existing = groups.find((group) => group.governorate === governorate);
    if (existing) {
      existing.values = uniqueSorted([...existing.values, templateValue], 150, 100);
    } else {
      groups.push({ governorate, values: [templateValue] });
    }
    return normalizePatientAddressTemplateLibrary({ ...normalized, cities: groups });
  }

  const groups = normalized.details.map((group) => ({
    governorate: group.governorate,
    cityArea: group.cityArea,
    values: [...group.values],
  }));
  const existing = groups.find(
    (group) => group.governorate === governorate && group.cityArea === cityArea,
  );
  if (existing) {
    existing.values = uniqueSorted([...existing.values, templateValue], 400, 150);
  } else {
    groups.push({ governorate, cityArea, values: [templateValue] });
  }
  return normalizePatientAddressTemplateLibrary({ ...normalized, details: groups });
};

export const getPatientAddressCityTemplates = (
  library: PatientAddressTemplateLibrary,
  governorate: string,
): string[] =>
  normalizePatientAddressTemplateLibrary(library).cities.find(
    (group) => group.governorate === normalizeText(governorate, 100),
  )?.values || [];

export const getPatientAddressDetailsTemplates = (
  library: PatientAddressTemplateLibrary,
  governorate: string,
  cityArea: string,
): string[] =>
  normalizePatientAddressTemplateLibrary(library).details.find(
    (group) =>
      group.governorate === normalizeText(governorate, 100) &&
      group.cityArea === normalizeText(cityArea, 150),
  )?.values || [];
