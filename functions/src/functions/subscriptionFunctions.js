const {
  buildDoctorUserProfilePayload,
} = require('../profileStore');

const EXPIRED_SUBSCRIPTIONS_BATCH_SIZE = 450;
const NO_EXPIRED_SUBSCRIPTIONS_MESSAGE = '\u0644\u0627 \u062a\u0648\u062c\u062f \u0627\u0634\u062a\u0631\u0627\u0643\u0627\u062a \u0645\u0646\u062a\u0647\u064a\u0629 \u062d\u0627\u0644\u064a\u064b\u0627.';
const getManualConvertedMessage = (count) => `\u062a\u0645 \u062a\u062d\u0648\u064a\u0644 ${count} \u062d\u0633\u0627\u0628 \u0645\u0646\u062a\u0647\u064a \u0625\u0644\u0649 \u0627\u0644\u062e\u0637\u0629 \u0627\u0644\u0645\u062c\u0627\u0646\u064a\u0629.`;

module.exports = ({
  HttpsError,
  ENFORCE_APP_CHECK,
  getDb,
  assertAdminRequest,
}) => {
  const queueExpiredDoctorUpdate = ({
    db,
    batch,
    docSnap,
    nowIso,
  }) => {
    const docRef = db.collection('users').doc(docSnap.id);
    const doctorData = docSnap.data() || {};
    const expiryIso = (typeof doctorData.premiumExpiryDate === 'string' && doctorData.premiumExpiryDate.trim())
      ? doctorData.premiumExpiryDate
      : nowIso;

    batch.set(docRef, buildDoctorUserProfilePayload({
      accountType: 'free',
      premiumNotificationSent: false,
      lastProExpiryDate: expiryIso,
      subscriptionUpdatedAt: nowIso,
    }), { merge: true });
  };

  const commitExpiredDoctorsInChunks = async ({
    db,
    expiredDoctorDocs,
    nowIso,
    logPrefix,
  }) => {
    let converted = 0;

    for (let i = 0; i < expiredDoctorDocs.length; i += EXPIRED_SUBSCRIPTIONS_BATCH_SIZE) {
      const chunk = expiredDoctorDocs.slice(i, i + EXPIRED_SUBSCRIPTIONS_BATCH_SIZE);
      const batch = db.batch();

      chunk.forEach((docSnap) => {
        queueExpiredDoctorUpdate({
          db,
          batch,
          docSnap,
          nowIso,
        });
      });

      await batch.commit();
      converted += chunk.length;

      const chunkNumber = Math.floor(i / EXPIRED_SUBSCRIPTIONS_BATCH_SIZE) + 1;
      console.log(`${logPrefix} Committed batch ${chunkNumber} with ${chunk.length} update(s).`);
    }

    return converted;
  };

  const checkExpiredProSubscriptions = async () => {
    try {
      const db = getDb();
      const now = new Date();
      const nowIso = now.toISOString();
      console.log('[checkExpiredProSubscriptions] Running at:', nowIso);

      const expiredDoctorsSnap = await db.collection('users')
        .where('authRole', '==', 'doctor')
        .where('accountType', '==', 'premium')
        .where('premiumExpiryDate', '<', nowIso)
        .get();

      if (expiredDoctorsSnap.empty) {
        console.log('[checkExpiredProSubscriptions] No expired subscriptions found.');
        return { success: true, converted: 0 };
      }

      const count = await commitExpiredDoctorsInChunks({
        db,
        expiredDoctorDocs: expiredDoctorsSnap.docs,
        nowIso,
        logPrefix: '[checkExpiredProSubscriptions]',
      });
      console.log(`[checkExpiredProSubscriptions] Converted ${count} expired premium account(s) to free.`);

      return { success: true, converted: count };
    } catch (err) {
      console.error('[checkExpiredProSubscriptions] Error:', err);
      throw err;
    }
  };

  const runExpiredSubscriptionsCheckNow = async (request) => {
    try {
      await assertAdminRequest(request);
      const db = getDb();
      const now = new Date();
      const nowIso = now.toISOString();
      console.log('[runExpiredSubscriptionsCheckNow] Running manual check at:', nowIso);

      const expiredDoctorsSnap = await db.collection('users')
        .where('authRole', '==', 'doctor')
        .where('accountType', '==', 'premium')
        .where('premiumExpiryDate', '<', nowIso)
        .get();

      if (expiredDoctorsSnap.empty) {
        return { success: true, converted: 0, message: NO_EXPIRED_SUBSCRIPTIONS_MESSAGE };
      }

      const count = await commitExpiredDoctorsInChunks({
        db,
        expiredDoctorDocs: expiredDoctorsSnap.docs,
        nowIso,
        logPrefix: '[runExpiredSubscriptionsCheckNow]',
      });

      return {
        success: true,
        converted: count,
        message: getManualConvertedMessage(count),
      };
    } catch (err) {
      console.error('[runExpiredSubscriptionsCheckNow] Error:', err);
      throw new HttpsError('internal', `\u062d\u062f\u062b \u062e\u0637\u0623 \u0623\u062b\u0646\u0627\u0621 \u0641\u062d\u0635 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643\u0627\u062a: ${err instanceof Error ? err.message : 'unknown'}`);
    }
  };

  return {
    checkExpiredProSubscriptions,
    runExpiredSubscriptionsCheckNow,
  };
};