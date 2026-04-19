type ConsoleMethod = 'debug' | 'info' | 'log';

const FILTERED_METHODS: ConsoleMethod[] = ['debug', 'info', 'log'];
let isFilterInstalled = false;

const noop = () => undefined;

const muteMethod = (method: ConsoleMethod) => {
  const current = console[method];
  if (typeof current !== 'function') {
    return;
  }

  console[method] = noop as Console[ConsoleMethod];
};

export const installConsoleProductionFilter = (): void => {
  if (isFilterInstalled) {
    return;
  }

  isFilterInstalled = true;

  if (!import.meta.env.PROD) {
    return;
  }

  FILTERED_METHODS.forEach(muteMethod);
};

