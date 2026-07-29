import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppointmentSyncOnSave } from '../../../../components/app/main-app/useAppointmentSyncOnSave';
import type { ClinicAppointment, VitalSigns } from '../../../../types';
import { getAppointmentSyncQueue } from '../../../../services/appointmentRecordSyncService';

const firestoreMock = vi.hoisted(() => ({
  saveAppointment: vi.fn(),
  markPublicUserBookingCompleted: vi.fn(),
}));

const visitServicesMock = vi.hoisted(() => ({
  getActiveVisitServiceScope: vi.fn(),
  finalizePendingVisitServices: vi.fn(),
}));

vi.mock('../../../../services/firestore', () => ({
  firestoreService: firestoreMock,
}));

vi.mock('../../../../services/visit-services/activeVisitServiceScope', () => ({
  getActiveVisitServiceScope: visitServicesMock.getActiveVisitServiceScope,
}));

vi.mock('../../../../services/visit-services/doctorVisitServicesService', () => ({
  finalizePendingVisitServices: visitServicesMock.finalizePendingVisitServices,
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
    window.localStorage.clear();
    firestoreMock.saveAppointment.mockReset();
    firestoreMock.markPublicUserBookingCompleted.mockReset();
    firestoreMock.saveAppointment.mockResolvedValue(undefined);
    firestoreMock.markPublicUserBookingCompleted.mockResolvedValue(undefined);
    visitServicesMock.getActiveVisitServiceScope.mockReset();
    visitServicesMock.finalizePendingVisitServices.mockReset();
    visitServicesMock.getActiveVisitServiceScope.mockReturnValue(null);
    visitServicesMock.finalizePendingVisitServices.mockResolvedValue(0);
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
    expect(visitServicesMock.finalizePendingVisitServices).not.toHaveBeenCalled();
  });

  it('posts pending services only after the medical record saves successfully', async () => {
    visitServicesMock.getActiveVisitServiceScope.mockReturnValue({
      visitId: 'apt-1',
      patientFileId: 'patient-file-1',
      appointmentId: 'apt-1',
      branchId: 'main',
    });
    const args = buildArgs({
      handleSaveRecord: vi.fn(async () => ({ ok: true, recordId: 'record-1' })),
    });

    const { result } = renderHook(() => useAppointmentSyncOnSave(args));
    await result.current.handleSaveRecordWithAppointmentSync();

    expect(visitServicesMock.finalizePendingVisitServices).toHaveBeenCalledTimes(1);
    expect(visitServicesMock.finalizePendingVisitServices).toHaveBeenCalledWith({
      userId: 'doctor-1',
      branchId: 'main',
      patientFileId: 'patient-file-1',
      visitId: 'apt-1',
      appointmentId: 'apt-1',
      recordId: 'record-1',
    });
    expect(
      visitServicesMock.finalizePendingVisitServices.mock.invocationCallOrder[0],
    ).toBeLessThan(firestoreMock.saveAppointment.mock.invocationCallOrder[0]);
  });

  it('keeps the appointment open when service posting fails so saving can retry', async () => {
    const setOpenedAppointmentContext = vi.fn();
    const showNotification = vi.fn();
    visitServicesMock.getActiveVisitServiceScope.mockReturnValue({
      visitId: 'apt-1',
      patientFileId: 'patient-file-1',
      appointmentId: 'apt-1',
    });
    visitServicesMock.finalizePendingVisitServices.mockRejectedValueOnce(new Error('offline'));

    const args = buildArgs({
      setOpenedAppointmentContext,
      showNotification,
      handleSaveRecord: vi.fn(async () => ({ ok: true, recordId: 'record-1' })),
    });
    const { result } = renderHook(() => useAppointmentSyncOnSave(args));
    await result.current.handleSaveRecordWithAppointmentSync();

    expect(firestoreMock.saveAppointment).not.toHaveBeenCalled();
    expect(setOpenedAppointmentContext).not.toHaveBeenCalled();
    expect(showNotification).toHaveBeenCalledWith(
      expect.stringContaining('ستظل معلّقة'),
      'info',
      { id: 'visit-services-finalize-pending' },
    );
  });

  it('queues only the selected appointment completion when appointment sync fails', async () => {
    const setOpenedAppointmentContext = vi.fn();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    firestoreMock.saveAppointment.mockRejectedValueOnce(new Error('offline'));
    const args = buildArgs({
      setOpenedAppointmentContext,
      handleSaveRecord: vi.fn(async () => ({ ok: true, recordId: 'record-1' })),
    });

    try {
      const { result } = renderHook(() => useAppointmentSyncOnSave(args));
      await result.current.handleSaveRecordWithAppointmentSync();

      const queue = getAppointmentSyncQueue('doctor-1');
      expect(queue).toHaveLength(1);
      expect(queue[0]).toMatchObject({
        userId: 'doctor-1',
        appointmentId: 'apt-1',
        appointmentPatch: {
          appointmentStatus: 'completed',
        },
        recordId: 'record-1',
      });
      expect(JSON.stringify(queue[0])).not.toContain('Patient');
      expect(setOpenedAppointmentContext).toHaveBeenCalledWith(null);
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
