import { beforeEach, describe, expect, it } from 'vitest';
import {
  enqueueAppointmentRecordSync,
  getAppointmentSyncQueue,
  removeAppointmentRecordSync,
} from '../../services/appointmentRecordSyncService';

describe('appointmentRecordSyncService queue', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('deduplicates by doctor and exact appointment id only', () => {
    const basePatch = {
      appointmentStatus: 'completed' as const,
      examCompletedAt: '2026-06-19T10:00:00.000Z',
    };

    enqueueAppointmentRecordSync({
      userId: 'doctor-1',
      appointmentId: 'apt-1',
      appointmentPatch: basePatch,
      recordId: 'record-1',
    });
    enqueueAppointmentRecordSync({
      userId: 'doctor-1',
      appointmentId: 'apt-2',
      appointmentPatch: basePatch,
      recordId: 'record-2',
    });
    enqueueAppointmentRecordSync({
      userId: 'doctor-1',
      appointmentId: 'apt-1',
      appointmentPatch: {
        ...basePatch,
        examCompletedAt: '2026-06-19T10:05:00.000Z',
      },
      recordId: 'record-1-new',
    });

    const queue = getAppointmentSyncQueue('doctor-1');
    expect(queue).toHaveLength(2);
    expect(queue.find((task) => task.appointmentId === 'apt-1')).toMatchObject({
      recordId: 'record-1-new',
      appointmentPatch: {
        examCompletedAt: '2026-06-19T10:05:00.000Z',
      },
    });
    expect(queue.some((task) => task.appointmentId === 'apt-2')).toBe(true);
  });

  it('removes only the requested appointment task', () => {
    const appointmentPatch = {
      appointmentStatus: 'completed' as const,
      examCompletedAt: '2026-06-19T10:00:00.000Z',
    };
    enqueueAppointmentRecordSync({ userId: 'doctor-1', appointmentId: 'apt-1', appointmentPatch });
    enqueueAppointmentRecordSync({ userId: 'doctor-1', appointmentId: 'apt-2', appointmentPatch });

    removeAppointmentRecordSync('doctor-1', 'apt-1');

    expect(getAppointmentSyncQueue('doctor-1').map((task) => task.appointmentId)).toEqual(['apt-2']);
  });
});
