import {
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { getDocCacheFirst, getDocsCacheFirst } from './firestore/cacheFirst';
import { getBookingSecretByUserId } from './firestore/booking-secretary/secretConfig.secret';

export interface DiscountReason {
  id: string;
  name: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

const getReasonsRef = (userId: string) => collection(db, 'users', userId, 'discountReasons');

const getBookingConfigReasonsRef = (secret: string) =>
  collection(db, 'bookingConfig', secret, 'discountReasons');

const normalizeBookingSecret = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

const getUserBookingSecret = async (userId: string): Promise<string> => {
  try {
    if (!userId) return '';

    const userRef = doc(db, 'users', userId);
    const userSnap = await getDocCacheFirst(userRef);
    const userData = userSnap.exists() ? (userSnap.data() as { bookingSecret?: unknown }) : {};
    const secretFromUserDoc = normalizeBookingSecret(userData?.bookingSecret);
    if (secretFromUserDoc) return secretFromUserDoc;

    const fallbackSecret = await getBookingSecretByUserId(userId).catch(() => null);
    return normalizeBookingSecret(fallbackSecret);
  } catch (error) {
    console.warn('[DiscountReasonService] Failed to read booking secret for mirror sync:', error);
    return '';
  }
};

const mapReasonsSnapshot = (snapshot: any): DiscountReason[] =>
  snapshot.docs.map((item: any) => ({ id: item.id, ...item.data() } as DiscountReason));

const syncReasonToBookingConfig = async (
  userId: string,
  reason: DiscountReason
): Promise<void> => {
  try {
    const bookingSecret = await getUserBookingSecret(userId);
    if (!bookingSecret) return;
    await setDoc(doc(getBookingConfigReasonsRef(bookingSecret), reason.id), reason, { merge: true });
  } catch (error) {
    console.warn('[DiscountReasonService] Failed syncing discount reason to booking config:', error);
  }
};

const deleteReasonFromBookingConfig = async (
  userId: string,
  reasonId: string
): Promise<void> => {
  try {
    const bookingSecret = await getUserBookingSecret(userId);
    if (!bookingSecret) return;
    await deleteDoc(doc(getBookingConfigReasonsRef(bookingSecret), reasonId));
  } catch (error) {
    console.warn('[DiscountReasonService] Failed deleting mirrored discount reason from booking config:', error);
  }
};

export const discountReasonService = {
  getReasons: async (userId: string): Promise<DiscountReason[]> => {
    if (!userId) return [];
    try {
      const q = query(getReasonsRef(userId), orderBy('name', 'asc'));
      const snapshot = await getDocsCacheFirst(q);
      const reasons = mapReasonsSnapshot(snapshot);
      void Promise.all(reasons.map((reason) => syncReasonToBookingConfig(userId, reason)));
      return reasons;
    } catch (error) {
      console.error('[DiscountReasonService] Error getting reasons:', error);
      return [];
    }
  },

  getReasonsBySecret: async (secret: string): Promise<DiscountReason[]> => {
    const normalizedSecret = normalizeBookingSecret(secret);
    if (!normalizedSecret) return [];
    try {
      const q = query(getBookingConfigReasonsRef(normalizedSecret), orderBy('name', 'asc'));
      const snapshot = await getDocsCacheFirst(q);
      return mapReasonsSnapshot(snapshot);
    } catch (error) {
      console.error('[DiscountReasonService] Error getting reasons by secret:', error);
      return [];
    }
  },

  subscribeToReasons: (
    userId: string,
    callback: (reasons: DiscountReason[]) => void
  ): (() => void) => {
    if (!userId) {
      callback([]);
      return () => {};
    }

    const q = query(getReasonsRef(userId), orderBy('name', 'asc'));
    let cancelled = false;

    getDocsCacheFirst(q).then((snapshot) => {
      if (cancelled) return;
      const reasons = mapReasonsSnapshot(snapshot);
      void Promise.all(reasons.map((reason) => syncReasonToBookingConfig(userId, reason)));
      callback(reasons);
    }).catch(() => {
      if (!cancelled) callback([]);
    });

    return () => { cancelled = true; };
  },

  subscribeToReasonsBySecret: (
    secret: string,
    callback: (reasons: DiscountReason[]) => void
  ): (() => void) => {
    const normalizedSecret = normalizeBookingSecret(secret);
    if (!normalizedSecret) {
      callback([]);
      return () => {};
    }

    const q = query(getBookingConfigReasonsRef(normalizedSecret), orderBy('name', 'asc'));
    let cancelled = false;

    getDocsCacheFirst(q).then((snapshot) => {
      if (cancelled) return;
      callback(mapReasonsSnapshot(snapshot));
    }).catch(() => {
      if (!cancelled) callback([]);
    });

    return () => { cancelled = true; };
  },

  saveReason: async (
    userId: string,
    reason: Omit<DiscountReason, 'id' | 'createdAt' | 'updatedAt'> & {
      id?: string;
      createdAt?: string;
    }
  ): Promise<string> => {
    if (!userId) throw new Error('User ID is required');

    const reasonId = reason.id || doc(getReasonsRef(userId)).id;
    const reasonRef = doc(getReasonsRef(userId), reasonId);
    const data: DiscountReason = {
      id: reasonId,
      name: reason.name.trim(),
      notes: reason.notes?.trim() || '',
      createdAt: reason.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(reasonRef, data);
    void syncReasonToBookingConfig(userId, data);
    return reasonId;
  },

  deleteReason: async (userId: string, reasonId: string): Promise<void> => {
    if (!userId || !reasonId) throw new Error('User ID and Reason ID are required');
    const reasonRef = doc(getReasonsRef(userId), reasonId);
    await deleteDoc(reasonRef);
    void deleteReasonFromBookingConfig(userId, reasonId);
  },
};
