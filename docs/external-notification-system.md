# External Notification System

## Overview

This system provides admin-only targeted external push notifications with strict audience separation:

- doctors
- secretaries
- public
- doctors + secretaries
- doctors + public
- all
- custom (single email)

Default audience is `all`.

It now also includes an admin-controlled in-app popup channel with the same audience model.

## Admin Page

UI panel:
- `components/admin/external-notification-broadcast/ExternalNotificationBroadcastPanel.tsx`
- `components/admin/internal-notification-broadcast/InternalNotificationBroadcastPanel.tsx`

Dashboard integration:
- `components/admin/comprehensive-dashboard/types.ts`
- `components/admin/comprehensive-dashboard/constants.ts`
- `components/admin/comprehensive-dashboard/ComprehensiveAdminDashboard.tsx`

## Client Service

Callable wrapper:
- `services/externalNotificationBroadcastService.ts`
- `services/inAppNotificationBroadcastService.ts`

Popup renderer:
- `components/common/InAppAudienceNotificationPopup.tsx`

## Cloud Functions

Entry exports:
- `functions/index.js`

Push handlers:
- `functions/src/functions/push/sendExternalAudienceNotificationBroadcast.js`
- `functions/src/functions/push/sendInAppAudienceNotificationBroadcast.js`
- `functions/src/functions/push/cleanupExternalNotificationBroadcastLogs.js`
- `functions/src/functions/push/audienceTokenResolver.js`
- `functions/src/functions/pushFunctions.js`

Role topics and audience mapping:
- `functions/src/fcmTopics.js`

Token-topic synchronization:
- `functions/src/fcmHelpers.js`
- `functions/src/functions/push/registerPushToken.js`
- `functions/src/functions/push/unregisterPushToken.js`

## Firestore Data

Logs collection:
- `externalNotificationBroadcasts`
- `inAppNotificationBroadcasts`

Fields include:
- `title`, `body`, `targetAudience`
- `targetEmail` (external custom only, admin log)
- `targetEmailMasked` (in-app custom)
- `tokenCount`, `successCount`, `failureCount`, `failedBatchesCount`
- `excludedDueToOverlapCount`
- `status`, `resultText`
- `createdAtMs`, `sentAtMs`, `expiresAtMs`

Retention:
- 30 days, auto-deleted by scheduled function `cleanupExternalNotificationBroadcastLogs`.

## Security

Rules:
- `firestore.rules` includes admin-only read/write for `externalNotificationBroadcasts`.
- `firestore.rules` includes `read: if true` and admin-only write for `inAppNotificationBroadcasts`.

## Scaling Notes

The broadcast callable uses high-capacity runtime options in `functions/index.js`:
- `timeoutSeconds: 540`
- configurable `EXTERNAL_BROADCAST_MAX_INSTANCES`
- configurable `EXTERNAL_BROADCAST_CONCURRENCY`

`sendInAppAudienceNotificationBroadcast` uses the same high-capacity callable profile for consistent scalability under large audience resolutions.

Use environment variables to tune scale based on production load.
