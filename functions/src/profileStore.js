const normalizeRoleValue = (value) => String(value || '').trim().toLowerCase();
const normalizeOptionalString = (value) => (typeof value === 'string' ? value.trim() : '');

const isPublicLikeUserData = (data) => {
  if (!data || typeof data !== 'object') return false;
  return (
    normalizeRoleValue(data.authRole) === 'public' ||
    normalizeRoleValue(data.userRole) === 'public' ||
    normalizeRoleValue(data.role) === 'public' ||
    normalizeRoleValue(data.accountType) === 'public'
  );
};

const isDoctorLikeUserData = (data) => {
  if (!data || typeof data !== 'object' || isPublicLikeUserData(data)) return false;
  return (
    normalizeRoleValue(data.authRole) === 'doctor' ||
    normalizeRoleValue(data.userRole) === 'doctor' ||
    normalizeRoleValue(data.role) === 'doctor' ||
    Boolean(normalizeOptionalString(data.doctorName)) ||
    Boolean(normalizeOptionalString(data.doctorEmail)) ||
    Boolean(normalizeOptionalString(data.doctorWhatsApp)) ||
    Boolean(normalizeOptionalString(data.doctorSpecialty)) ||
    Boolean(normalizeOptionalString(data.verificationDocUrl))
  );
};

const resolveAuthRoleFromProfileData = (data) => {
  if (!data || typeof data !== 'object') return '';
  if (isDoctorLikeUserData(data)) return 'doctor';
  if (isPublicLikeUserData(data)) return 'public';
  return '';
};

const mergePrimaryProfileData = (primaryData, legacyData) => ({
  ...(legacyData || {}),
  ...(primaryData || {}),
});

const buildDoctorUserProfilePayload = (payload) => ({
  authRole: 'doctor',
  userRole: 'doctor',
  ...payload,
});

const buildPublicUserProfilePayload = (payload) => ({
  authRole: 'public',
  userRole: 'public',
  ...payload,
});

const getUserProfileRef = (db, userId) => db.collection('users').doc(String(userId || '').trim());
const getUserUsageDailyRef = (db, userId, usageDocId) => getUserProfileRef(db, userId).collection('usageDaily').doc(usageDocId);

const loadUnifiedDoctorProfile = async ({ db, userId, tx }) => {
  const userRef = getUserProfileRef(db, userId);
  const userSnap = tx ? await tx.get(userRef) : await userRef.get();

  const userData = userSnap.exists ? (userSnap.data() || {}) : null;
  const mergedData = userData || {};

  return {
    userRef,
    userSnap,
    userData,
    mergedData,
    exists: userSnap.exists,
    role: resolveAuthRoleFromProfileData(mergedData),
  };
};

const loadUnifiedUsageDoc = async ({ db, userId, usageDocId, tx }) => {
  const userUsageRef = getUserUsageDailyRef(db, userId, usageDocId);
  const userUsageSnap = tx ? await tx.get(userUsageRef) : await userUsageRef.get();

  const userUsageData = userUsageSnap.exists ? (userUsageSnap.data() || {}) : null;

  return {
    userUsageRef,
    userUsageSnap,
    userUsageData,
    mergedUsageData: userUsageData || {},
  };
};

module.exports = {
  isPublicLikeUserData,
  isDoctorLikeUserData,
  resolveAuthRoleFromProfileData,
  mergePrimaryProfileData,
  buildDoctorUserProfilePayload,
  buildPublicUserProfilePayload,
  getUserProfileRef,
  getUserUsageDailyRef,
  loadUnifiedDoctorProfile,
  loadUnifiedUsageDoc,
};