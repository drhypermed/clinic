import { USER_TEXT_MAX_LENGTH, clampUserTextLength } from '../../utils/userTextLengthPolicy';

const TEXT_INPUT_TYPES = new Set([
  '',
  'text',
  'search',
  'email',
  'url',
  'tel',
  'password',
]);

let installed = false;

const isTextLikeInput = (element: HTMLInputElement): boolean => {
  const normalizedType = String(element.type || '').trim().toLowerCase();
  return TEXT_INPUT_TYPES.has(normalizedType);
};

const shouldSkipGuard = (element: HTMLElement): boolean =>
  element.getAttribute('data-allow-long-text') === 'true';

const needsMaxLengthUpdate = (currentMaxLength: number, maxLength: number): boolean =>
  currentMaxLength < 0 || currentMaxLength > maxLength;

const truncateContentEditableText = (root: HTMLElement, maxLength: number): boolean => {
  let remaining = maxLength;
  let changed = false;

  const walkNode = (node: Node) => {
    if (remaining <= 0) {
      if (node.nodeType === Node.TEXT_NODE) {
        if ((node.nodeValue || '').length > 0) {
          node.nodeValue = '';
          changed = true;
        }
      } else {
        const hadChildren = node.hasChildNodes();
        while (node.firstChild) {
          node.removeChild(node.firstChild);
        }
        if (hadChildren) changed = true;
      }
      return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const value = node.nodeValue || '';
      if (value.length > remaining) {
        node.nodeValue = value.slice(0, remaining);
        remaining = 0;
        changed = true;
        return;
      }
      remaining -= value.length;
      return;
    }

    let child = node.firstChild;
    while (child) {
      const next = child.nextSibling;
      walkNode(child);
      if (remaining <= 0) {
        let extra = next;
        while (extra) {
          const nextExtra = extra.nextSibling;
          node.removeChild(extra);
          changed = true;
          extra = nextExtra;
        }
        break;
      }
      child = next;
    }
  };

  walkNode(root);
  return changed;
};

const applyLimitToElement = (
  element: HTMLInputElement | HTMLTextAreaElement,
  maxLength: number
): void => {
  if (shouldSkipGuard(element)) return;

  if (element instanceof HTMLInputElement && !isTextLikeInput(element)) return;

  if (needsMaxLengthUpdate(element.maxLength, maxLength)) {
    element.maxLength = maxLength;
  }

  if (element.value.length > maxLength) {
    element.value = clampUserTextLength(element.value, maxLength);
  }
};

const applyLimitToContentEditableElement = (element: HTMLElement, maxLength: number): void => {
  if (shouldSkipGuard(element) || !element.isContentEditable) return;

  const textLength = (element.textContent || '').length;
  if (textLength <= maxLength) return;

  truncateContentEditableText(element, maxLength);
};

const applyLimitToTarget = (target: HTMLElement, maxLength: number): void => {
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement) {
    applyLimitToElement(target, maxLength);
    return;
  }

  if (target.isContentEditable) {
    applyLimitToContentEditableElement(target, maxLength);
  }
};

const scanAndApply = (root: ParentNode, maxLength: number): void => {
  root.querySelectorAll('textarea, input, [contenteditable]').forEach((node) => {
    if (node instanceof HTMLElement) {
      applyLimitToTarget(node, maxLength);
    }
  });
};

export const installUserTextLengthGuard = (maxLength = USER_TEXT_MAX_LENGTH): void => {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  const safeMaxLength = Number.isFinite(maxLength)
    ? Math.max(1, Math.floor(maxLength))
    : USER_TEXT_MAX_LENGTH;

  const handleInput = (event: Event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement) {
      applyLimitToTarget(target, safeMaxLength);
      return;
    }

    const editableHost = target.closest('[contenteditable]');
    if (editableHost instanceof HTMLElement) {
      applyLimitToTarget(editableHost, safeMaxLength);
    }
  };

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node instanceof HTMLElement) {
          applyLimitToTarget(node, safeMaxLength);
        }
        scanAndApply(node, safeMaxLength);
      });
    }
  });

  scanAndApply(document, safeMaxLength);
  document.addEventListener('input', handleInput, true);
  observer.observe(document.documentElement, { childList: true, subtree: true });
};
