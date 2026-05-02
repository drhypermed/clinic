const ROLE_TOPICS = Object.freeze({
  doctor: 'dh_role_doctors',
  secretary: 'dh_role_secretaries',
  public: 'dh_role_public',
});

const ALL_ROLE_TOPICS = Object.freeze(Array.from(new Set(Object.values(ROLE_TOPICS))));

const AUDIENCE_ROLE_KEYS = Object.freeze({
  doctors: Object.freeze(['doctor']),
  secretaries: Object.freeze(['secretary']),
  public: Object.freeze(['public']),
  doctor_secretaries: Object.freeze(['doctor', 'secretary']),
  doctor_public: Object.freeze(['doctor', 'public']),
  doctors_premium_active: Object.freeze(['doctor']),
  doctors_free_never_premium: Object.freeze(['doctor']),
  doctors_free_expired_premium: Object.freeze(['doctor']),
  all: Object.freeze(['doctor', 'secretary', 'public']),
});

const SUPPORTED_BROADCAST_AUDIENCES = Object.freeze([
  ...Object.keys(AUDIENCE_ROLE_KEYS),
  'custom',
]);

const normalizeAudience = (value) => String(value || '').trim().toLowerCase();

const resolveAudienceRoleKeys = (audience) => {
  const normalized = normalizeAudience(audience);
  return AUDIENCE_ROLE_KEYS[normalized] ? [...AUDIENCE_ROLE_KEYS[normalized]] : [];
};

module.exports = {
  ROLE_TOPICS,
  ALL_ROLE_TOPICS,
  AUDIENCE_ROLE_KEYS,
  SUPPORTED_BROADCAST_AUDIENCES,
  normalizeAudience,
  resolveAudienceRoleKeys,
};
