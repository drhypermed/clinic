import { collection, doc, query, where, type QueryConstraint } from 'firebase/firestore';
import { db } from '../firebaseConfig';


const normalizeRoleValue = (value: unknown): string => String(value || '').trim().toLowerCase();
const normalizeOptionalString = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const isDoctorAuthRole = (value: unknown): boolean => normalizeRoleValue(value) === 'doctor';
const isPublicAuthRole = (value: unknown): boolean => normalizeRoleValue(value) === 'public';

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

// ملاحظه: اتشال `mergePrimaryProfileData` و `getLegacyDoctorProfileDocRef`
// و `getLegacyPublicProfileDocRef` لأنهم بقوا aliases عديمه الفايده —
// كلهم كانوا بيرجعوا نفس doc من users/. ده كان بيخلي كل caller يقرا نفس
// الـdoc مرتين عبر Promise.all (ضعف القراءات وضعف التكلفه بدون فايده).
// كل caller دلوقت بيستخدم getUserProfileDocRef مباشرةً مع قراءه واحده.

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
export const getDoctorNotificationsCollectionRef = (userId: string) => collection(db, 'users', userId, 'notifications');
export const getDoctorNotificationDocRef = (userId: string, notificationId: string) => doc(db, 'users', userId, 'notifications', notificationId);

export const getDoctorUsersQuery = (...constraints: QueryConstraint[]) =>
  query(collection(db, 'users'), where('authRole', '==', 'doctor'), ...constraints);

