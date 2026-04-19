const TRANSIENT_KEYS_TO_CLEAR = [
  'dh_auth_flow_guard',
  'dh_public_auth_error',
  'blacklist_message',
  'blacklist_error',
  'not_found_error',
  'rejection_error',
  'duplicate_account_error',
  'public_role_error',
  'not_found_timestamp',
  'duplicate_account_timestamp',
];

const removeTransientAuthKeys = () => {
  try {
    TRANSIENT_KEYS_TO_CLEAR.forEach((key) => {
      window.localStorage.removeItem(key);
    });
  } catch {
    // Ignore storage access errors.
  }

  try {
    TRANSIENT_KEYS_TO_CLEAR.forEach((key) => {
      window.sessionStorage.removeItem(key);
    });
  } catch {
    // Ignore storage access errors.
  }
};

const disablePersistentWebStorage = () => {
  if (typeof window === 'undefined') return;

  const globalWindow = window as Window & { __dhPersistentStorageDisabled__?: boolean };
  if (globalWindow.__dhPersistentStorageDisabled__) return;

  // Keep browser storage available for Firebase/Auth persistence and Firestore cache.
  // Only clear transient auth-error flags to prevent stale redirect loops.
  removeTransientAuthKeys();

  globalWindow.__dhPersistentStorageDisabled__ = true;
  window.dispatchEvent(new Event('dh-web-storage-disabled'));
};

disablePersistentWebStorage();
