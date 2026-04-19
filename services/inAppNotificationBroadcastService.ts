import { httpsCallable } from 'firebase/functions';
import { functions } from './firebaseConfig';
import type {
  ExternalNotificationAudience,
  CustomEmailRoleMode,
} from './externalNotificationBroadcastService';

export interface SendInAppNotificationPayload {
  title: string;
  body: string;
  targetAudience: ExternalNotificationAudience;
  targetEmail?: string;
  customEmailRoleMode?: CustomEmailRoleMode;
}

export interface SendInAppNotificationResult {
  ok: boolean;
  status: 'active' | 'failed' | string;
  broadcastId: string;
  targetAudience: ExternalNotificationAudience;
  customEmailRoleMode?: CustomEmailRoleMode;
  tokenCount: number;
  successCount: number;
  failureCount: number;
  failedBatchesCount: number;
  matchedUserIdsCount?: number;
  excludedDueToOverlapCount?: number;
  message: string;
}

const sendInAppNotificationBroadcastCallable = httpsCallable(
  functions,
  'sendInAppAudienceNotificationBroadcast'
);

export async function sendInAppNotificationBroadcast(
  payload: SendInAppNotificationPayload
): Promise<SendInAppNotificationResult> {
  const response = await sendInAppNotificationBroadcastCallable(payload);
  return (response.data || {}) as SendInAppNotificationResult;
}
