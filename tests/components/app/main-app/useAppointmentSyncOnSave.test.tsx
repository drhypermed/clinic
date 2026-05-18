import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppointmentSyncOnSave } from '../../../../components/app/main-app/useAppointmentSyncOnSave';
import type { ClinicAppointment, VitalSigns } from '../../../../types';

const firestoreMock = vi.hoisted(() => ({
  saveAppointment: vi.fn(),
  markPublicUserBookingCompleted: vi.fn(),
}));

vi.mock('../../../../services/firestore', () => ({
  firestoreService: firestoreMock,
}));

const emptyVitals: VitalSigns = {
  bp: '',
  pulse: '',
  temp: '',
  rbs: '',
  spo2: '',
  rr: '',
  headCirc: '',
};

const consultationAppointment: ClinicAppointment = {
  id: 'apt-1',
  patientName: 'Patient',
  phone: '01000000000',
  dateTime: '2026-05-18T12:00:00.000Z',
  appointmentType: 'consultation',
  consultationSourceRecordId: 'record-1',
};

const buildArgs = (overrides: Partial<Parameters<typeof useAppointmentSyncOnSave>[0]> = {}) => ({
  userId: 'doctor-1',
  openedAppointmentContext: consultationAppointment,
  setOpenedAppointmentContext: vi.fn(),
  patientName: 'Patient',
  phone: '01000000000',
  ageYears: '30',
  ageMonths: '',
  ageDays: '',
  weight: '',
  height: '',
  vitals: emptyVitals,
  activePatientFileId: null,
  activePatientFileNumber: null,
  activePatientFileNameKey: null,
  paymentType: 'cash' as const,
  insuranceCompanyId: '',
  insuranceCompanyName: '',
  insuranceApprovalCode: '',
  insuranceMembershipId: '',
  patientSharePercent: 0,
  discountAmount: 0,
  discountPercent: 0,
  discountReasonId: '',
  discountReasonLabel: '',
  appointmentSecretaryCustomValues: {},
  prescriptionSecretaryFieldDefinitions: [],
  doctorSpecialty: '',
  handleSaveRecord: vi.fn(async () => ({ ok: true })),
  showNotification: vi.fn(),
  ...overrides,
});

describe('useAppointmentSyncOnSave', () => {
  beforeEach(() => {
    firestoreMock.saveAppointment.mockReset();
    firestoreMock.markPublicUserBookingCompleted.mockReset();
    firestoreMock.saveAppointment.mockResolvedValue(undefined);
    firestoreMock.markPublicUserBookingCompleted.mockResolvedValue(undefined);
  });

  it('marks a consultation appointment completed even when the record has no new changes', async () => {
    const setOpenedAppointmentContext = vi.fn();
    const args = buildArgs({
      setOpenedAppointmentContext,
      handleSaveRecord: vi.fn(async () => ({ ok: false, reason: 'no-changes' })),
    });

    const { result } = renderHook(() => useAppointmentSyncOnSave(args));

    await result.current.handleSaveRecordWithAppointmentSync();

    await waitFor(() => expect(firestoreMock.saveAppointment).toHaveBeenCalledTimes(1));
    const savedAppointment = firestoreMock.saveAppointment.mock.calls[0][1] as ClinicAppointment;
    expect(savedAppointment.examCompletedAt).toEqual(expect.any(String));
    expect(savedAppointment.consultationCompletedAt).toBe(savedAppointment.examCompletedAt);
    expect(setOpenedAppointmentContext).toHaveBeenCalledWith(null);
  });

  it('does not complete the appointment when record saving fails', async () => {
    const args = buildArgs({
      handleSaveRecord: vi.fn(async () => ({ ok: false, reason: 'validation' })),
    });

    const { result } = renderHook(() => useAppointmentSyncOnSave(args));

    await result.current.handleSaveRecordWithAppointmentSync();

    expect(firestoreMock.saveAppointment).not.toHaveBeenCalled();
  });
});
