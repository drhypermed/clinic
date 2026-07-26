export const SECRETARY_USERNAME_MIN_LENGTH = 4;
export const SECRETARY_USERNAME_MAX_LENGTH = 32;

const SECRETARY_USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9._-]{2,30}[a-z0-9])$/;
const RESERVED_SECRETARY_USERNAMES = new Set([
  'admin',
  'api',
  'clinic',
  'doctor',
  'drhyper',
  'mail',
  'root',
  'secretary',
  'support',
  'system',
  'www',
]);

export const normalizeSecretaryUsername = (value: unknown): string =>
  String(value ?? '').trim().toLowerCase();

export const isValidSecretaryUsername = (value: unknown): boolean => {
  const username = normalizeSecretaryUsername(value);
  return SECRETARY_USERNAME_PATTERN.test(username) && !RESERVED_SECRETARY_USERNAMES.has(username);
};

export const getSecretaryUsernameValidationMessage = (value: unknown): string => {
  const username = normalizeSecretaryUsername(value);
  if (!username) return 'اسم مستخدم السكرتارية مطلوب.';
  if (username.length < SECRETARY_USERNAME_MIN_LENGTH || username.length > SECRETARY_USERNAME_MAX_LENGTH) {
    return `اسم المستخدم يجب أن يكون من ${SECRETARY_USERNAME_MIN_LENGTH} إلى ${SECRETARY_USERNAME_MAX_LENGTH} حرفًا.`;
  }
  if (!SECRETARY_USERNAME_PATTERN.test(username)) {
    return 'استخدم حروفًا إنجليزية صغيرة وأرقامًا، ويمكن إضافة نقطة أو شرطة، ويجب أن يبدأ وينتهي بحرف أو رقم.';
  }
  if (RESERVED_SECRETARY_USERNAMES.has(username)) {
    return 'اسم المستخدم محجوز. اختر اسمًا آخر.';
  }
  return '';
};
