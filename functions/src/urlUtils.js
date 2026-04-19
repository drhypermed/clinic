
const buildBaseUrl = () => String(process.env.APP_BASE_URL || 'https://www.drhypermed.com').trim().replace(/\/+$/, '');

const APP_BASE_URL = buildBaseUrl();


const toAbsoluteWebUrl = (value) => {
  const raw = String(value || '').trim() || '/';
  try {
    return new URL(raw, `${APP_BASE_URL}/`).toString();
  } catch {
    return `${APP_BASE_URL}${raw.startsWith('/') ? raw : `/${raw}`}`;
  }
};

const WEB_PUSH_ICON = toAbsoluteWebUrl('/pwa-192x192.png');
const WEB_PUSH_BADGE = toAbsoluteWebUrl('/logo.png');


const buildRelativeLink = (path, params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    const trimmed = String(value).trim();
    if (!trimmed) return;
    searchParams.set(key, trimmed);
  });
  const qs = searchParams.toString();
  return qs ? `${path}?${qs}` : path;
};


const stringifyNotificationData = (data = {}) => {
  const output = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    output[key] = String(value);
  });
  return output;
};

module.exports = {
  toAbsoluteWebUrl,
  WEB_PUSH_ICON,
  WEB_PUSH_BADGE,
  buildRelativeLink,
  stringifyNotificationData,
};
