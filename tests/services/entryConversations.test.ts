/**
 * اختبارات الواجهة الموحدة للتواصل بين الطبيب والسكرتيرة.
 *
 * الهدف:
 *   نتأكد إن `entryConversations` بيوجّه كل عملية للـimplementation الصح
 *   حسب الـdirection (D2S أو S2D). أي bug في الـrouting بيكسر التواصل
 *   كله — والاختبارات دي بتحمي من ده.
 *
 * استراتيجية:
 *   نـmock كل الـimplementations الأقدم، ونتأكد إن الواجهة بتنادي الواحدة
 *   الصح بالـpayload الصحيح.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock الـimplementations قبل ما نـimport entryConversations
vi.mock('../../services/firestore/booking-secretary/entryAlerts', () => ({
  setEntryAlert: vi.fn(async () => undefined),
  addSecretaryApprovedEntryId: vi.fn(async () => undefined),
  respondToDoctorEntryAlert: vi.fn(async () => undefined),
}));

vi.mock('../../services/firestore/booking-secretary/entryAlerts.subscribers', () => ({
  subscribeToSecretaryEntryAlertResponse: vi.fn(() => vi.fn()),
  subscribeToSecretaryApprovedEntryIds: vi.fn(() => vi.fn()),
  clearSecretaryEntryAlertResponse: vi.fn(async () => undefined),
}));

vi.mock('../../services/firestore/booking-secretary/entryRequests', () => ({
  setSecretaryEntryRequest: vi.fn(async () => undefined),
  subscribeToSecretaryEntryRequest: vi.fn(() => vi.fn()),
  respondToSecretaryEntryRequest: vi.fn(async () => undefined),
  clearSecretaryEntryRequest: vi.fn(async () => undefined),
  clearDoctorEntryResponse: vi.fn(async () => undefined),
}));

import { entryConversations } from '../../services/firestore/entryConversations';
import * as entryAlerts from '../../services/firestore/booking-secretary/entryAlerts';
import * as entryAlertsSubs from '../../services/firestore/booking-secretary/entryAlerts.subscribers';
import * as entryRequests from '../../services/firestore/booking-secretary/entryRequests';

describe('entryConversations.request', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('D2S → ينادي setEntryAlert بالـsecret + اسم المريض + appointmentId + branchId', async () => {
    await entryConversations.request({
      secret: 'b_test123',
      direction: 'D2S',
      appointmentId: 'apt_1',
      patientName: 'محمد أحمد',
      branchId: 'branch_main',
    });
    expect(entryAlerts.setEntryAlert).toHaveBeenCalledWith('b_test123', 'محمد أحمد', 'apt_1', 'branch_main');
    expect(entryRequests.setSecretaryEntryRequest).not.toHaveBeenCalled();
  });

  it('S2D → ينادي setSecretaryEntryRequest بالبيانات الكاملة', async () => {
    await entryConversations.request({
      secret: 'b_test123',
      direction: 'S2D',
      appointmentId: 'apt_2',
      patientName: 'فاطمة',
      branchId: 'branch_b',
      doctorId: 'doctor_uid',
      patientInfo: { age: '30', gender: 'female', pregnant: false },
      appointmentType: 'exam',
    });
    expect(entryRequests.setSecretaryEntryRequest).toHaveBeenCalledTimes(1);
    const [secret, payload, doctorId] = (entryRequests.setSecretaryEntryRequest as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(secret).toBe('b_test123');
    expect(doctorId).toBe('doctor_uid');
    expect(payload).toMatchObject({
      appointmentId: 'apt_2',
      patientName: 'فاطمة',
      branchId: 'branch_b',
      age: '30',
      gender: 'female',
      pregnant: false,
      appointmentType: 'exam',
    });
    expect(entryAlerts.setEntryAlert).not.toHaveBeenCalled();
  });

  it('S2D — يمرر consultationSource لو الموعد استشارة', async () => {
    await entryConversations.request({
      secret: 'b_test',
      direction: 'S2D',
      appointmentId: 'apt_3',
      patientName: 'علي',
      appointmentType: 'consultation',
      consultationSource: {
        appointmentId: 'src_apt',
        completedAt: '2026-05-01',
        recordId: 'rec_1',
      },
    });
    const [, payload] = (entryRequests.setSecretaryEntryRequest as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(payload).toMatchObject({
      consultationSourceAppointmentId: 'src_apt',
      consultationSourceCompletedAt: '2026-05-01',
      consultationSourceRecordId: 'rec_1',
    });
  });
});

describe('entryConversations.respond', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('D2S → ينادي respondToDoctorEntryAlert (السكرتيرة بترد على alert الطبيب)', async () => {
    await entryConversations.respond({
      secret: 'b_t',
      direction: 'D2S',
      appointmentId: 'apt_1',
      status: 'approved',
      branchId: 'branch_a',
    });
    expect(entryAlerts.respondToDoctorEntryAlert).toHaveBeenCalledWith('b_t', 'apt_1', 'approved', 'branch_a');
    expect(entryRequests.respondToSecretaryEntryRequest).not.toHaveBeenCalled();
  });

  it('S2D → ينادي respondToSecretaryEntryRequest (الطبيب بيرد على request السكرتيرة)', async () => {
    await entryConversations.respond({
      secret: 'b_t',
      direction: 'S2D',
      appointmentId: 'apt_2',
      status: 'rejected',
      branchId: 'branch_b',
    });
    expect(entryRequests.respondToSecretaryEntryRequest).toHaveBeenCalledWith('b_t', 'apt_2', 'rejected', 'branch_b');
    expect(entryAlerts.respondToDoctorEntryAlert).not.toHaveBeenCalled();
  });
});

describe('entryConversations.subscribe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('role=doctor → يستمع لـsubscribeToSecretaryEntryRequest', () => {
    const onChange = vi.fn();
    entryConversations.subscribe({
      secret: 'b_t',
      role: 'doctor',
      branchId: 'branch_a',
      onChange,
    });
    expect(entryRequests.subscribeToSecretaryEntryRequest).toHaveBeenCalledWith('b_t', onChange, 'branch_a');
  });

  it('role=secretary → يرجع unsubscribe فارغ بدون استدعاء أي subscriber', () => {
    const onChange = vi.fn();
    const unsub = entryConversations.subscribe({
      secret: 'b_t',
      role: 'secretary',
      onChange,
    });
    expect(typeof unsub).toBe('function');
    expect(entryRequests.subscribeToSecretaryEntryRequest).not.toHaveBeenCalled();
    // الـunsubscribe الفارغ لازم يشتغل من غير ما يكسر
    expect(() => unsub()).not.toThrow();
  });
});

describe('entryConversations.subscribeToApprovedAppointments / subscribeToSecretaryResponses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('subscribeToApprovedAppointments — يمرر branchId للـimplementation', () => {
    const onChange = vi.fn();
    entryConversations.subscribeToApprovedAppointments({
      secret: 'b_t',
      branchId: 'branch_x',
      onChange,
    });
    expect(entryAlertsSubs.subscribeToSecretaryApprovedEntryIds).toHaveBeenCalledWith('b_t', onChange, 'branch_x');
  });

  it('subscribeToSecretaryResponses — يمرر branchId للـimplementation', () => {
    const onChange = vi.fn();
    entryConversations.subscribeToSecretaryResponses({
      secret: 'b_t',
      branchId: 'branch_y',
      onChange,
    });
    expect(entryAlertsSubs.subscribeToSecretaryEntryAlertResponse).toHaveBeenCalledWith('b_t', onChange, 'branch_y');
  });
});

describe('entryConversations.markExamOpened', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ينادي addSecretaryApprovedEntryId', async () => {
    await entryConversations.markExamOpened({
      secret: 'b_t',
      appointmentId: 'apt_open',
      branchId: 'branch_main',
    });
    expect(entryAlerts.addSecretaryApprovedEntryId).toHaveBeenCalledWith('b_t', 'apt_open', 'branch_main');
  });
});

describe('entryConversations.clearSecretaryResponse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ينادي clearSecretaryEntryAlertResponse', async () => {
    await entryConversations.clearSecretaryResponse('b_t');
    expect(entryAlertsSubs.clearSecretaryEntryAlertResponse).toHaveBeenCalledWith('b_t');
  });
});
