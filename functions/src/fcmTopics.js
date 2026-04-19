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

const resolveAudienceTopics = (audience) => {
  const roles = resolveAudienceRoleKeys(audience);
  const topics = roles
    .map((role) => ROLE_TOPICS[role])
    .map((topic) => String(topic || '').trim())
    .filter(Boolean);
  return Array.from(new Set(topics));
};

const buildTopicCondition = (topics) => {
  const safeTopics = Array.isArray(topics)
    ? topics.map((topic) => String(topic || '').trim()).filter(Boolean)
    : [];

  if (!safeTopics.length) return '';

  return safeTopics
    .map((topic) => `'${topic.replace(/'/g, "")}' in topics`)
    .join(' || ');
};

module.exports = {
  ROLE_TOPICS,
  ALL_ROLE_TOPICS,
  AUDIENCE_ROLE_KEYS,
  SUPPORTED_BROADCAST_AUDIENCES,
  normalizeAudience,
  resolveAudienceRoleKeys,
  resolveAudienceTopics,
  buildTopicCondition,
};
