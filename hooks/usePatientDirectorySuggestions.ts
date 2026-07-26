import { useEffect, useRef, useState } from 'react';
import type { PatientSuggestionOption } from '../types';
import { normalizePatientNameForFile } from '../services/patient-files';
import {
  normalizePatientPhoneForSearch,
  rankPatientSuggestions,
} from '../services/patientSuggestionSearch';
import { searchPatientsForDoctor } from '../services/secretaryPatientSearchService';

const SEARCH_RESULT_LIMIT = 20;

interface UsePatientDirectorySuggestionsArgs {
  userId: string;
  branchId?: string;
  nameQuery: string;
  phoneQuery: string;
  enabled?: boolean;
}

interface CachedSearch {
  nameQuery: string;
  phoneQuery: string;
  patients: PatientSuggestionOption[];
}

export const usePatientDirectorySuggestions = ({
  userId,
  branchId = 'main',
  nameQuery,
  phoneQuery,
  enabled = true,
}: UsePatientDirectorySuggestionsArgs): PatientSuggestionOption[] => {
  const [patients, setPatients] = useState<PatientSuggestionOption[]>([]);
  const cacheRef = useRef(new Map<string, CachedSearch>());
  const requestIdRef = useRef(0);

  useEffect(() => {
    const normalizedName = normalizePatientNameForFile(nameQuery);
    const normalizedPhone = normalizePatientPhoneForSearch(phoneQuery);
    const requestId = ++requestIdRef.current;

    if (!enabled || !userId || (normalizedName.length < 2 && normalizedPhone.length < 7)) {
      setPatients([]);
      return;
    }

    const contextKey = `${userId}|${branchId}`;
    const exactKey = `${contextKey}|${normalizedName}|${normalizedPhone}`;
    const exact = cacheRef.current.get(exactKey);
    if (exact) {
      setPatients(rankPatientSuggestions(exact.patients, nameQuery, phoneQuery));
      return;
    }

    const reusable = Array.from(cacheRef.current.entries())
      .filter(([key, entry]) => (
        key.startsWith(`${contextKey}|`)
        && entry.patients.length < SEARCH_RESULT_LIMIT
        && (
          (normalizedPhone === '' && entry.phoneQuery === '' && normalizedName.startsWith(entry.nameQuery))
          || (normalizedName === '' && entry.nameQuery === '' && normalizedPhone.startsWith(entry.phoneQuery))
        )
      ))
      .sort((left, right) => (
        right[1].nameQuery.length + right[1].phoneQuery.length
        - left[1].nameQuery.length - left[1].phoneQuery.length
      ))[0]?.[1];

    if (reusable) {
      const ranked = rankPatientSuggestions(reusable.patients, nameQuery, phoneQuery);
      cacheRef.current.set(exactKey, {
        nameQuery: normalizedName,
        phoneQuery: normalizedPhone,
        patients: ranked,
      });
      setPatients(ranked);
      return;
    }

    let disposed = false;
    const timer = window.setTimeout(() => {
      void searchPatientsForDoctor({ userId, branchId, nameQuery, phoneQuery })
        .then((result) => {
          if (disposed || requestIdRef.current !== requestId) return;
          const ranked = rankPatientSuggestions(result, nameQuery, phoneQuery);
          cacheRef.current.set(exactKey, {
            nameQuery: normalizedName,
            phoneQuery: normalizedPhone,
            patients: ranked,
          });
          setPatients(ranked);
        })
        .catch(() => {
          if (disposed || requestIdRef.current !== requestId) return;
          setPatients([]);
        });
    }, 300);

    return () => {
      disposed = true;
      window.clearTimeout(timer);
    };
  }, [branchId, enabled, nameQuery, phoneQuery, userId]);

  return patients;
};
