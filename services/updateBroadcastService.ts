import { httpsCallable } from 'firebase/functions';
import { functions } from './firebaseConfig';

export type UpdateBroadcastAudience =
  | 'public'
  | 'doctors'
  | 'secretaries'
  | 'doctor_secretaries'
  | 'all';

interface SendUpdateBroadcastPayload {
  targetAudience: UpdateBroadcastAudience;
}

interface SendUpdateBroadcastResult {
  ok: boolean;
  broadcastId: string;
  targetAudience: UpdateBroadcastAudience;
  tokenCount: number;
  successCount: number;
  failureCount: number;
  failedBatchesCount: number;
  resultText?: string;
}

const sendAppUpdateBroadcastCallable = httpsCallable(functions, 'sendAppUpdateBroadcast');

export async function sendAppUpdateBroadcast(
  payload: SendUpdateBroadcastPayload
): Promise<SendUpdateBroadcastResult> {
  const response = await sendAppUpdateBroadcastCallable(payload);
  return (response.data || {}) as SendUpdateBroadcastResult;
}
