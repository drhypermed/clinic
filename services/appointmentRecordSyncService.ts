import { doc, setDoc } from 'firebase/firestore';
import type { ClinicAppointment } from '../types';
import { db } from './firebaseConfig';
import { firestoreService } from './firestore';
import { omitUndefined } from '../utils/firestoreHelpers';

const QUEUE_KEY = 'dh_appointment_record_sync_queue_v1';
const QUEUE_EVENT = 'dh:appointment-record-sync-queue';
export const APPOINTMENT_OPTIMISTIC_UPDATE_EVENT = 'dh:appointment-optimistic-update';

export interface AppointmentRecordSyncTask {
  userId: string;
  appointmentId: string;
  appointmentPatch: Pick<
    ClinicAppointment,
    | 'appointmentStatus'
    | 'examStartedAt'
    | 'examCompletedAt'
    | 'consultationCompletedAt'
    | 'clinicDayKey'
    | 'clinicDayCutoffMinutes'
  >;
  recordId?: string;
  publicUserId?: string;
  queuedAt: string;
  attempts: number;
}

const canUseWindow = () => typeof window !== 'undefined';

const readAllTasks = (): AppointmentRecordSyncTask[] => {
  if (!canUseWindow()) return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(QUEUE_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((task): task is AppointmentRecordSyncTask =>
      Boolean(
        task
        && typeof task === 'object'
        && typeof task.userId === 'string'
        && typeof task.appointmentId === 'string'
        && task.appointmentPatch
        && typeof task.appointmentPatch === 'object',
      ),
    );
  } catch {
    return [];
  }
};

const emitQueueChange = () => {
  if (!canUseWindow()) return;
  window.dispatchEvent(new CustomEvent(QUEUE_EVENT));
};

const writeAllTasks = (tasks: AppointmentRecordSyncTask[]) => {
  if (!canUseWindow()) return;
  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(tasks));
  emitQueueChange();
};

export const getAppointmentSyncQueue = (userId?: string): AppointmentRecordSyncTask[] => {
  const tasks = readAllTasks();
  return userId ? tasks.filter((task) => task.userId === userId) : tasks;
};

export const subscribeToAppointmentSyncQueue = (listener: () => void): (() => void) => {
  if (!canUseWindow()) return () => {};
  window.addEventListener(QUEUE_EVENT, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(QUEUE_EVENT, listener);
    window.removeEventListener('storage', listener);
  };
};

export const emitOptimisticAppointmentUpdate = (
  userId: string,
  appointment: ClinicAppointment,
) => {
  if (!canUseWindow()) return;
  window.dispatchEvent(new CustomEvent(APPOINTMENT_OPTIMISTIC_UPDATE_EVENT, {
    detail: { userId, appointment },
  }));
};

export const enqueueAppointmentRecordSync = (
  task: Omit<AppointmentRecordSyncTask, 'queuedAt' | 'attempts'>,
) => {
  const tasks = readAllTasks();
  const existing = tasks.find(
    (item) => item.userId === task.userId && item.appointmentId === task.appointmentId,
  );
  const nextTask: AppointmentRecordSyncTask = {
    ...task,
    recordId: task.recordId || existing?.recordId,
    queuedAt: existing?.queuedAt || new Date().toISOString(),
    attempts: existing?.attempts || 0,
  };
  writeAllTasks([
    ...tasks.filter(
      (item) => !(item.userId === task.userId && item.appointmentId === task.appointmentId),
    ),
    nextTask,
  ]);
};

export const syncAppointmentRecordTask = async (
  task: AppointmentRecordSyncTask,
  appointmentSnapshot?: ClinicAppointment,
) => {
  const { userId, appointmentId, appointmentPatch, recordId } = task;

  if (appointmentSnapshot) {
    await firestoreService.saveAppointment(userId, appointmentSnapshot);
  } else {
    await setDoc(
      doc(db, 'users', userId, 'appointments', appointmentId),
      omitUndefined(appointmentPatch as Record<string, unknown>),
      { merge: true },
    );
  }

  if (recordId) {
    await setDoc(
      doc(db, 'users', userId, 'records', recordId),
      {
        sourceAppointmentId: appointmentId,
        sourceAppointmentLinkedAt: new Date().toISOString(),
      },
      { merge: true },
    );
  }

  if (task.publicUserId) {
    await firestoreService.markPublicUserBookingCompleted(
      task.publicUserId,
      appointmentId,
      appointmentPatch.examCompletedAt || new Date().toISOString(),
    );
  }
};

export const removeAppointmentRecordSync = (userId: string, appointmentId: string) => {
  writeAllTasks(readAllTasks().filter(
    (task) => !(task.userId === userId && task.appointmentId === appointmentId),
  ));
};

export const flushAppointmentSyncQueue = async (
  userId: string,
): Promise<{ completed: number; remaining: number }> => {
  const allTasks = readAllTasks();
  const ownTasks = allTasks.filter((task) => task.userId === userId);
  const originalById = new Map(
    ownTasks.map((task) => [task.appointmentId, JSON.stringify(task)]),
  );
  const failedById = new Map<string, AppointmentRecordSyncTask>();
  let completed = 0;

  for (const task of ownTasks) {
    try {
      await syncAppointmentRecordTask(task);
      completed += 1;
    } catch {
      failedById.set(task.appointmentId, { ...task, attempts: task.attempts + 1 });
    }
  }

  // اقرأ أحدث نسخة قبل الكتابة حتى لا تُحذف مهمة أُضيفت أثناء انتظار الشبكة.
  const latestTasks = readAllTasks();
  const nextTasks = latestTasks.flatMap((latestTask) => {
    if (latestTask.userId !== userId) return [latestTask];
    const original = originalById.get(latestTask.appointmentId);
    if (!original) return [latestTask];
    if (JSON.stringify(latestTask) !== original) return [latestTask];
    const failed = failedById.get(latestTask.appointmentId);
    return failed ? [failed] : [];
  });

  writeAllTasks(nextTasks);
  return {
    completed,
    remaining: nextTasks.filter((task) => task.userId === userId).length,
  };
};
