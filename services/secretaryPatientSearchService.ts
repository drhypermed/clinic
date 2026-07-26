import { httpsCallable } from 'firebase/functions';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db, functions } from './firebaseConfig';
import type { PatientSuggestionOption } from '../types';
import { normalizePatientNameForFile } from './patient-files';
import { normalizePatientAddress } from '../utils/patientAddress';

type SearchPatientsPayload = {
  secret?: string;
  userId: string;
  sessionToken?: string;
  branchId?: string;
  nameQuery?: string;
  phoneQuery?: string;
};

type DirectoryPatient = PatientSuggestionOption & { latestMs: number };

const DIRECTORY_SCHEMA_VERSION = 2;
const MAX_DIRECT_RESULTS = 20;
const readyDirectoryKeys = new Set<string>();

const toOptionalText = (value: unknown): string | undefined => {
  const normalized = String(value || '').trim();
  return normalized || undefined;
};

const toPositiveFileNumber = (value: unknown): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : undefined;
};

const toPatientGender = (value: unknown): PatientSuggestionOption['gender'] =>
  value === 'male' || value === 'female' ? value : undefined;

const normalizePhoneSearchKey = (value: unknown): string => {
  let digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0020') && digits.length >= 14) digits = digits.slice(2);
  if (digits.startsWith('20') && digits.length >= 12) return `0${digits.slice(-10)}`;
  if (digits.length === 10 && digits.startsWith('1')) return `0${digits}`;
  if (digits.length > 11) return digits.slice(-11);
  return digits;
};

const mapDirectoryDoc = (snapshot: QueryDocumentSnapshot<DocumentData>): DirectoryPatient | null => {
  const data = snapshot.data() || {};
  const patientName = String(data.patientName || '').trim();
  if (!patientName) return null;
  const phones = Array.isArray(data.phones) ? data.phones : [];
  return {
    id: snapshot.id,
    patientFileId: toOptionalText(data.patientFileId) || snapshot.id,
    patientName,
    age: toOptionalText(data.age),
    phone: toOptionalText(phones.find((value) => toOptionalText(value))),
    address: normalizePatientAddress(data.address),
    lastExamDate: toOptionalText(data.lastExamDate),
    lastConsultationDate: toOptionalText(data.lastConsultationDate),
    patientFileNumber: toPositiveFileNumber(data.patientFileNumber),
    gender: toPatientGender(data.gender),
    dateOfBirth: toOptionalText(data.dateOfBirth),
    latestMs: Number(data.lastVisitAtMs || 0),
  };
};

const searchDirectoryDirectly = async (
  payload: SearchPatientsPayload,
): Promise<{ ready: boolean; patients: PatientSuggestionOption[] }> => {
  const userId = String(payload.userId || '').trim();
  const branchId = String(payload.branchId || '').trim() || 'main';
  const nameQuery = normalizePatientNameForFile(String(payload.nameQuery || '').trim());
  const phoneQuery = normalizePhoneSearchKey(payload.phoneQuery);
  const directoryKey = `${userId}|${branchId}`;
  const branchRef = doc(db, 'users', userId, 'secretaryPatientDirectories', branchId);
  const patientsRef = collection(branchRef, 'patients');
  const searches: Array<ReturnType<typeof getDocs>> = [];

  if (nameQuery.length >= 2) {
    searches.push(getDocs(query(
      patientsRef,
      where('nameSearchPrefixes', 'array-contains', nameQuery),
      orderBy('lastVisitAtMs', 'desc'),
      limit(MAX_DIRECT_RESULTS),
    )));
  }
  if (phoneQuery.length >= 7) {
    searches.push(getDocs(query(
      patientsRef,
      where('phoneSearchKeys', 'array-contains', phoneQuery),
      orderBy('lastVisitAtMs', 'desc'),
      limit(MAX_DIRECT_RESULTS),
    )));
  }
  if (searches.length === 0) return { ready: false, patients: [] };

  const metadataPromise = readyDirectoryKeys.has(directoryKey)
    ? Promise.resolve(true)
    : getDoc(branchRef).then((snapshot) => {
      const data = snapshot.data() || {};
      const ready = data.ready === true
        && Number(data.schemaVersion || 0) >= DIRECTORY_SCHEMA_VERSION;
      if (ready) readyDirectoryKeys.add(directoryKey);
      return ready;
    });
  const [ready, settled] = await Promise.all([
    metadataPromise,
    Promise.allSettled(searches),
  ]);
  const unique = new Map<string, DirectoryPatient>();
  settled.forEach((result) => {
    if (result.status !== 'fulfilled') return;
    result.value.docs.forEach((snapshot) => {
      const patient = mapDirectoryDoc(snapshot);
      if (!patient) return;
      const key = `${normalizePatientNameForFile(patient.patientName)}|${normalizePhoneSearchKey(patient.phone)}`;
      const previous = unique.get(key);
      if (!previous || patient.latestMs >= previous.latestMs) unique.set(key, patient);
    });
  });
  const patients = Array.from(unique.values())
    .sort((left, right) => right.latestMs - left.latestMs)
    .slice(0, MAX_DIRECT_RESULTS)
    .map(({ latestMs: _latestMs, ...patient }) => patient);
  const searchesSucceeded = settled.every((result) => result.status === 'fulfilled');
  return { ready: ready && searchesSucceeded, patients };
};

const searchThroughCallable = async (
  payload: SearchPatientsPayload,
): Promise<PatientSuggestionOption[]> => {
  const callable = httpsCallable(functions, 'searchPatientsForSecretary');
  const response = await callable(payload);
  const data = (response.data || {}) as { patients?: unknown };
  if (!Array.isArray(data.patients)) return [];
  return data.patients
    .filter(
      (item): item is Record<string, unknown> =>
        !!item && typeof item === 'object' && !Array.isArray(item),
    )
    .map((item) => ({
      id: String(item.id || '').trim(),
      patientFileId: toOptionalText(item.patientFileId) || toOptionalText(item.id),
      patientName: String(item.patientName || '').trim() || 'بدون اسم',
      age: toOptionalText(item.age),
      phone: toOptionalText(item.phone),
      address: normalizePatientAddress(
        item.address as Parameters<typeof normalizePatientAddress>[0],
      ),
      lastExamDate: toOptionalText(item.lastExamDate),
      lastConsultationDate: toOptionalText(item.lastConsultationDate),
      patientFileNumber: toPositiveFileNumber(item.patientFileNumber),
      gender: toPatientGender(item.gender),
      dateOfBirth: toOptionalText(item.dateOfBirth),
    }))
    .filter((item) => item.id && item.patientName);
};

export const searchPatientsForSecretary = async (
  payload: SearchPatientsPayload & { secret: string },
): Promise<PatientSuggestionOption[]> => {
  try {
    const direct = await searchDirectoryDirectly(payload);
    // A ready directory is authoritative, including a legitimate empty result.
    // While a one-time backfill is still pending, the callable merges partial
    // directory hits with legacy records so older files cannot disappear.
    if (direct.ready) return direct.patients;
  } catch {
    // Custom auth may still be refreshing or an older ruleset may be deployed.
    // The authenticated callable below preserves compatibility and security.
  }
  return searchThroughCallable(payload);
};

export const searchPatientsForDoctor = async (
  payload: Omit<SearchPatientsPayload, 'secret' | 'sessionToken'>,
): Promise<PatientSuggestionOption[]> => {
  try {
    const direct = await searchDirectoryDirectly(payload);
    if (direct.ready) return direct.patients;
  } catch {
    // Fall through to the authenticated callable for a directory that still
    // needs its one-time reconciliation or when the local auth cache is stale.
  }
  return searchThroughCallable(payload);
};
