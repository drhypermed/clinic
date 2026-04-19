import { httpsCallable } from 'firebase/functions';
import { functions } from './firebaseConfig';

export type ExternalNotificationAudience =
  | 'doctors'
  | 'secretaries'
  | 'public'
  | 'doctor_secretaries'
  | 'doctor_public'
  | 'doctors_premium_active'
  | 'doctors_free_never_premium'
  | 'doctors_free_expired_premium'
  | 'all'
  | 'custom';

export type CustomEmailRoleMode =
  | 'all_linked'
  | 'doctor_only'
  | 'secretary_only'
  | 'doctor_and_secretary';

export interface FailureReasonItem {
  code: string;
  count: number;
  message?: string;
}

export interface SendExternalNotificationPayload {
  title: string;
  body: string;
  targetAudience: ExternalNotificationAudience;
  targetEmail?: string;
  customEmailRoleMode?: CustomEmailRoleMode;
}

export interface SendExternalNotificationResult {
  ok: boolean;
  status: 'sent' | 'partial' | 'failed' | string;
  broadcastId: string;
  targetAudience: ExternalNotificationAudience;
  tokenCount: number;
  successCount: number;
  failureCount: number;
  failedBatchesCount: number;
  excludedDueToOverlapCount?: number;
  retryPolicy?: string;
  retryAttempted?: boolean;
  failureReasons?: FailureReasonItem[];
  message: string;
}

const sendExternalNotificationBroadcastCallable = httpsCallable(
  functions,
  'sendExternalAudienceNotificationBroadcast'
);

export async function sendExternalNotificationBroadcast(
  payload: SendExternalNotificationPayload
): Promise<SendExternalNotificationResult> {
  const response = await sendExternalNotificationBroadcastCallable(payload);
  return (response.data || {}) as SendExternalNotificationResult;
}

export interface EstimateAudiencePayload {
  targetAudience: ExternalNotificationAudience;
  targetEmail?: string;
  customEmailRoleMode?: CustomEmailRoleMode;
}

export interface EstimateAudienceResult {
  targetAudience: ExternalNotificationAudience;
  tokenCount: number;
  uniqueTokenCount: number;
  excludedDueToOverlapCount: number;
  candidateUserIds: number;
}

const estimateAudienceSizeCallable = httpsCallable(functions, 'estimateAudienceSize');

export async function estimateAudienceSize(
  payload: EstimateAudiencePayload
): Promise<EstimateAudienceResult> {
  const response = await estimateAudienceSizeCallable(payload);
  return (response.data || {}) as EstimateAudienceResult;
}
