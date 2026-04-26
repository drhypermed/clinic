import { deleteField, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { normalizeBookingSecret, normalizeEmail, sanitizeDocSegment } from './helpers';

type SecretaryAuthRecord = {
  userId?: string;
  doctorEmail?: string;
  secretaryPasswordHash?: string;
  secretarySessionToken?: string;
  secretarySessionTokenUpdatedAt?: string;
};

export const getSecretaryAuthRef = (secret: string) => doc(db, 'secretaryAuth', secret);

export const updateLegacyBookingConfigCleanup = async (
  secret: string,
  extras?: Record<string, unknown>
): Promise<void> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedSecret) return;

  const configRef = doc(db, 'bookingConfig', normalizedSecret);
  await setDoc(
    configRef,
    {
      secretaryPasswordHash: deleteField(),
      secretarySessionToken: deleteField(),
      secretarySessionTokenUpdatedAt: deleteField(),
      secretaryPassword: deleteField(),
      ...extras,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
};

export const readSecretaryAuthBySecret = async (secret: string): Promise<SecretaryAuthRecord> => {
  const normalizedSecret = normalizeBookingSecret(secret);
  if (!normalizedSecret) return {};

  try {
    const authSnap = await getDoc(getSecretaryAuthRef(normalizedSecret));
    if (!authSnap.exists()) return {};
    const data = authSnap.data();
    return {
      userId: typeof data?.userId === 'string' ? sanitizeDocSegment(data.userId) : undefined,
      doctorEmail: typeof data?.doctorEmail === 'string' ? normalizeEmail(data.doctorEmail) : undefined,
      secretaryPasswordHash:
        typeof data?.secretaryPasswordHash === 'string' ? data.secretaryPasswordHash : undefined,
      secretarySessionToken:
        typeof data?.secretarySessionToken === 'string' ? data.secretarySessionToken : undefined,
      secretarySessionTokenUpdatedAt:
        typeof data?.secretarySessionTokenUpdatedAt === 'string'
          ? data.secretarySessionTokenUpdatedAt
          : undefined,
    };
  } catch {
    return {};
  }
};
