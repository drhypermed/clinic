import { collection, doc, query, where, type QueryConstraint } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export type SupportedAuthRole = 'doctor' | 'public' | 'secretary';

const normalizeRoleValue = (value: unknown): string => String(value || '').trim().toLowerCase();
const normalizeOptionalString = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

export const isDoctorAuthRole = (value: unknown): boolean => normalizeRoleValue(value) === 'doctor';
export const isPublicAuthRole = (value: unknown): boolean => normalizeRoleValue(value) === 'public';

export const isPublicLikeUserData = (data: Record<string, any> | null | undefined): boolean => {
  if (!data) return false;
  return (
    isPublicAuthRole(data.authRole) ||
    isPublicAuthRole(data.userRole) ||
    isPublicAuthRole(data.role) ||
    normalizeRoleValue(data.accountType) === 'public'
  );
};

export const isDoctorLikeUserData = (data: Record<string, any> | null | undefined): boolean => {
  if (!data || isPublicLikeUserData(data)) return false;
  return (
    isDoctorAuthRole(data.authRole) ||
    isDoctorAuthRole(data.userRole) ||
    isDoctorAuthRole(data.role) ||
    Boolean(normalizeOptionalString(data.doctorName)) ||
    Boolean(normalizeOptionalString(data.doctorEmail)) ||
    Boolean(normalizeOptionalString(data.doctorWhatsApp)) ||
    Boolean(normalizeOptionalString(data.doctorSpecialty)) ||
    Boolean(normalizeOptionalString(data.verificationDocUrl))
  );
};

export const resolveAuthRoleFromProfileData = (
  data: Record<string, any> | null | undefined,
): 'doctor' | 'public' | undefined => {
  if (!data) return undefined;
  if (isDoctorLikeUserData(data)) return 'doctor';
  if (isPublicLikeUserData(data)) return 'public';
  return undefined;
};

export const mergePrimaryProfileData = (
  primaryData: Record<string, any> | null | undefined,
  legacyData: Record<string, any> | null | undefined,
): Record<string, any> => ({
  ...(legacyData || {}),
  ...(primaryData || {}),
});

export const buildDoctorUserProfilePayload = (payload: Record<string, unknown>) => ({
  authRole: 'doctor',
  userRole: 'doctor',
  ...payload,
});

export const buildPublicUserProfilePayload = (payload: Record<string, unknown>) => ({
  authRole: 'public',
  userRole: 'public',
  ...payload,
});

export const getUserProfileDocRef = (userId: string) => doc(db, 'users', userId);
// Backward-compatible aliases while all callers migrate to users-only helpers.
export const getLegacyDoctorProfileDocRef = (userId: string) => getUserProfileDocRef(userId);
export const getLegacyPublicProfileDocRef = (userId: string) => getUserProfileDocRef(userId);
export const getDoctorNotificationsCollectionRef = (userId: string) => collection(db, 'users', userId, 'notifications');
export const getDoctorNotificationDocRef = (userId: string, notificationId: string) => doc(db, 'users', userId, 'notifications', notificationId);

export const getDoctorUsersQuery = (...constraints: QueryConstraint[]) =>
  query(collection(db, 'users'), where('authRole', '==', 'doctor'), ...constraints);

export const getPublicUsersQuery = (...constraints: QueryConstraint[]) =>
  query(collection(db, 'users'), where('authRole', '==', 'public'), ...constraints);