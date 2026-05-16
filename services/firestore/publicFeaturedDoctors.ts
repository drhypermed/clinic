import {
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  runTransaction,
  where,
  collection,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import type { DoctorAdProfile } from '../../types';
import { doctorAdsService } from './doctorAds';
import { normalizeEmail } from '../auth-service/validation';

export interface PublicFeaturedDoctorEntry {
  doctorId: string;
  doctorEmail: string;
  doctorName: string;
  doctorSpecialty: string;
  addedAt: string;
  addedBy: string;
  expiresAt: string;
  isActive: boolean;
}

interface PublicFeaturedDoctorsSettings {
  items?: PublicFeaturedDoctorEntry[];
  updatedAt?: string;
  updatedBy?: string;
}

const SETTINGS_REF = doc(db, 'settings', 'publicFeaturedDoctors');
const MAX_FEATURED_DOCTORS = 20;
const MAX_DURATION_DAYS = 365;

const nowIso = () => new Date().toISOString();

const isFutureIso = (value: string): boolean => {
  const ms = Date.parse(value);
  return Number.isFinite(ms) && ms > Date.now();
};

const toSafeString = (value: unknown): string => String(value || '').trim();

const sanitizeDurationDays = (value: number): number => {
  if (!Number.isFinite(value)) return 30;
  return Math.min(MAX_DURATION_DAYS, Math.max(1, Math.floor(value)));
};

const normalizeEntry = (value: unknown): PublicFeaturedDoctorEntry | null => {
  const raw = (value || {}) as Record<string, unknown>;
  const doctorId = toSafeString(raw.doctorId);
  if (!doctorId) return null;

  return {
    doctorId,
    doctorEmail: normalizeEmail(toSafeString(raw.doctorEmail)),
    doctorName: toSafeString(raw.doctorName),
    doctorSpecialty: toSafeString(raw.doctorSpecialty),
    addedAt: toSafeString(raw.addedAt) || nowIso(),
    addedBy: normalizeEmail(toSafeString(raw.addedBy)),
    expiresAt: toSafeString(raw.expiresAt),
    isActive: raw.isActive !== false,
  };
};

const normalizeSettings = (data: unknown): PublicFeaturedDoctorEntry[] => {
  const raw = (data || {}) as PublicFeaturedDoctorsSettings;
  return Array.isArray(raw.items)
    ? raw.items.map(normalizeEntry).filter((item): item is PublicFeaturedDoctorEntry => Boolean(item))
    : [];
};

const getUserByEmail = async (email: string) => {
  const usersRef = collection(db, 'users');
  const [byDoctorEmail, byEmail] = await Promise.all([
    getDocs(query(usersRef, where('doctorEmail', '==', email), limit(1))),
    getDocs(query(usersRef, where('email', '==', email), limit(1))),
  ]);

  const found = byDoctorEmail.docs[0] || byEmail.docs[0] || null;
  if (!found) return null;

  const data = found.data() as Record<string, unknown>;
  return {
    id: found.id,
    authRole: toSafeString(data.authRole),
    doctorEmail: normalizeEmail(toSafeString(data.doctorEmail || data.email || email)),
    doctorName: toSafeString(data.doctorName || data.displayName || data.name),
    doctorSpecialty: toSafeString(data.doctorSpecialty),
  };
};

export const publicFeaturedDoctorsService = {
  listPublicFeaturedDoctors: async (): Promise<PublicFeaturedDoctorEntry[]> => {
    const snap = await getDoc(SETTINGS_REF);
    if (!snap.exists()) return [];
    return normalizeSettings(snap.data())
      .sort((a, b) => Date.parse(b.addedAt) - Date.parse(a.addedAt));
  },

  getActivePublicFeaturedDoctorAds: async (): Promise<{
    data: DoctorAdProfile[];
    featuredDoctorIds: string[];
  }> => {
    const snap = await getDoc(SETTINGS_REF);
    if (!snap.exists()) return { data: [], featuredDoctorIds: [] };

    const activeEntries = normalizeSettings(snap.data())
      .filter((item) => item.isActive && isFutureIso(item.expiresAt))
      .sort((a, b) => Date.parse(b.addedAt) - Date.parse(a.addedAt))
      .slice(0, MAX_FEATURED_DOCTORS);

    const loaded = await Promise.all(
      activeEntries.map((item) => doctorAdsService.getDoctorAdByDoctorId(item.doctorId)),
    );

    const byDoctorId = new Map(activeEntries.map((item, index) => [item.doctorId, index]));
    const data = loaded
      .filter((ad): ad is DoctorAdProfile => Boolean(ad?.isPublished))
      .sort((a, b) => (byDoctorId.get(a.doctorId) ?? 0) - (byDoctorId.get(b.doctorId) ?? 0));

    return {
      data,
      featuredDoctorIds: activeEntries.map((item) => item.doctorId),
    };
  },

  addPublicFeaturedDoctorByEmail: async (
    emailInput: string,
    durationDaysInput: number,
    adminEmailInput: string,
  ): Promise<PublicFeaturedDoctorEntry> => {
    const email = normalizeEmail(emailInput);
    if (!email) throw new Error('ادخل بريد الطبيب أولا.');

    const user = await getUserByEmail(email);
    if (!user || user.authRole !== 'doctor') {
      throw new Error('لم يتم العثور على حساب طبيب بهذا البريد.');
    }

    const ad = await doctorAdsService.getDoctorAdByDoctorId(user.id);
    if (!ad?.isPublished) {
      throw new Error('إعلان الطبيب غير منشور، انشر الإعلان أولا حتى يظهر للجمهور.');
    }

    const durationDays = sanitizeDurationDays(durationDaysInput);
    const createdAt = nowIso();
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
    const adminEmail = normalizeEmail(adminEmailInput);

    const entry: PublicFeaturedDoctorEntry = {
      doctorId: user.id,
      doctorEmail: user.doctorEmail || email,
      doctorName: ad.doctorName || user.doctorName,
      doctorSpecialty: ad.doctorSpecialty || user.doctorSpecialty,
      addedAt: createdAt,
      addedBy: adminEmail,
      expiresAt,
      isActive: true,
    };

    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(SETTINGS_REF);
      const existing = snap.exists() ? normalizeSettings(snap.data()) : [];
      const withoutSameDoctor = existing.filter((item) => item.doctorId !== entry.doctorId);
      const activeCount = withoutSameDoctor.filter((item) => item.isActive && isFutureIso(item.expiresAt)).length;
      if (activeCount >= MAX_FEATURED_DOCTORS) {
        throw new Error(`الحد الأقصى ${MAX_FEATURED_DOCTORS} طبيب مميز. احذف طبيبا أو انتظر انتهاء مدة أحدهم.`);
      }

      transaction.set(
        SETTINGS_REF,
        {
          items: [entry, ...withoutSameDoctor],
          updatedAt: createdAt,
          updatedBy: adminEmail,
        },
        { merge: true },
      );
    });

    return entry;
  },

  removePublicFeaturedDoctor: async (doctorId: string, adminEmailInput: string): Promise<void> => {
    const safeDoctorId = toSafeString(doctorId);
    if (!safeDoctorId) return;
    const updatedAt = nowIso();
    const adminEmail = normalizeEmail(adminEmailInput);

    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(SETTINGS_REF);
      const existing = snap.exists() ? normalizeSettings(snap.data()) : [];
      transaction.set(
        SETTINGS_REF,
        {
          items: existing.filter((item) => item.doctorId !== safeDoctorId),
          updatedAt,
          updatedBy: adminEmail,
        },
        { merge: true },
      );
    });
  },

  cleanupExpiredPublicFeaturedDoctors: async (adminEmailInput: string): Promise<number> => {
    const updatedAt = nowIso();
    const adminEmail = normalizeEmail(adminEmailInput);
    let removed = 0;

    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(SETTINGS_REF);
      const existing = snap.exists() ? normalizeSettings(snap.data()) : [];
      const nextItems = existing.filter((item) => item.isActive && isFutureIso(item.expiresAt));
      removed = existing.length - nextItems.length;

      transaction.set(
        SETTINGS_REF,
        { items: nextItems, updatedAt, updatedBy: adminEmail },
        { merge: true },
      );
    });

    return removed;
  },
};
