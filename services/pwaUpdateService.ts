const WAITING_WORKER_TIMEOUT_MS = 5000;
const SKIP_WAITING_RELOAD_FALLBACK_MS = 2800;

const hasServiceWorkerSupport = (): boolean =>
  typeof window !== 'undefined' && 'serviceWorker' in navigator;

const hasWaitingWorker = (registration: ServiceWorkerRegistration | null): boolean =>
  Boolean(registration?.waiting) && Boolean(navigator.serviceWorker.controller);

const waitForWaitingWorker = async (
  registration: ServiceWorkerRegistration,
  timeoutMs = WAITING_WORKER_TIMEOUT_MS
): Promise<boolean> => {
  if (hasWaitingWorker(registration)) return true;

  return new Promise<boolean>((resolve) => {
    let settled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let onUpdateFound: (() => void) | null = null;

    const finish = (value: boolean) => {
      if (settled) return;
      settled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (onUpdateFound) {
        registration.removeEventListener('updatefound', onUpdateFound);
        onUpdateFound = null;
      }
      resolve(value);
    };

    const attachInstallingListener = () => {
      const installing = registration.installing;
      if (!installing) return;
      const onStateChange = () => {
        if (hasWaitingWorker(registration)) {
          installing.removeEventListener('statechange', onStateChange);
          finish(true);
        }
      };
      installing.addEventListener('statechange', onStateChange);
    };

    onUpdateFound = () => {
      if (hasWaitingWorker(registration)) {
        finish(true);
        return;
      }
      attachInstallingListener();
    };

    registration.addEventListener('updatefound', onUpdateFound);
    attachInstallingListener();

    timeoutId = setTimeout(() => {
      registration.removeEventListener('updatefound', onUpdateFound);
      finish(hasWaitingWorker(registration));
    }, Math.max(1200, timeoutMs));
  });
};

export const checkPendingPwaUpdate = async (): Promise<boolean> => {
  if (!hasServiceWorkerSupport()) return false;

  let registration: ServiceWorkerRegistration | null = null;
  try {
    registration = await navigator.serviceWorker.getRegistration('/');
    if (!registration) {
      registration = await navigator.serviceWorker.ready;
    }
  } catch {
    registration = null;
  }

  if (!registration) return false;

  try {
    await registration.update();
  } catch {
    // ignore update errors and continue with current registration state
  }

  if (hasWaitingWorker(registration)) return true;
  return waitForWaitingWorker(registration);
};

export const applyPendingPwaUpdateNow = async (): Promise<void> => {
  if (!hasServiceWorkerSupport()) {
    return;
  }

  let registration: ServiceWorkerRegistration | null = null;
  try {
    registration = await navigator.serviceWorker.getRegistration('/');
    if (!registration) {
      registration = await navigator.serviceWorker.ready;
    }
  } catch {
    registration = null;
  }

  if (!registration) {
    return;
  }

  try {
    await registration.update();
  } catch {
    // ignore
  }

  const hasPendingUpdate = hasWaitingWorker(registration) || await waitForWaitingWorker(registration, 3500);
  if (!hasPendingUpdate || !registration.waiting) {
    return;
  }

  const didSwitchController = await new Promise<boolean>((resolve) => {
    let done = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const complete = (reloadedController: boolean) => {
      if (done) return;
      done = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      resolve(reloadedController);
    };

    const onControllerChange = () => {
      complete(true);
    };

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    try {
      registration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
    } catch {
      // ignore
    }

    timeoutId = setTimeout(() => complete(false), SKIP_WAITING_RELOAD_FALLBACK_MS);
  });

  if (didSwitchController) {
    window.location.reload();
  }
};
