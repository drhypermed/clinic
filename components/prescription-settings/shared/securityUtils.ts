const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
]);

export const validateImageFile = (file: File): string | null => {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'حجم الصورة كبير جدا (أقصى 5MB)';
  }

  const normalizedType = String(file.type || '').toLowerCase();
  if (!ALLOWED_IMAGE_TYPES.has(normalizedType)) {
    return 'نوع الصورة غير مدعوم. استخدم PNG أو JPG أو WEBP أو GIF';
  }

  return null;
};

export const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('failed-to-read-file'));
    reader.readAsDataURL(file);
  });
};

export const sanitizeRichHtml = (html: string): string => {
  if (!html) return '';
  if (typeof document === 'undefined') return String(html);

  const template = document.createElement('template');
  template.innerHTML = String(html);

  const blockedTags = new Set([
    'script',
    'iframe',
    'object',
    'embed',
    'link',
    'meta',
    'base',
    'form',
    'input',
    'button',
    'textarea',
    'select',
    'option',
  ]);

  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_ELEMENT);
  const toRemove: Element[] = [];

  while (walker.nextNode()) {
    const element = walker.currentNode as Element;
    const tagName = element.tagName.toLowerCase();

    if (blockedTags.has(tagName)) {
      toRemove.push(element);
      continue;
    }

    const attrs = Array.from(element.attributes);
    attrs.forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value || '';

      if (name.startsWith('on')) {
        element.removeAttribute(attr.name);
        return;
      }

      const isScriptUrlAttr =
        (name === 'href' || name === 'src' || name === 'xlink:href') &&
        /^\s*javascript:/i.test(value);
      if (isScriptUrlAttr) {
        element.removeAttribute(attr.name);
        return;
      }

      if (name === 'style' && /expression\s*\(|javascript\s*:|url\s*\(\s*['"]?\s*javascript:/i.test(value)) {
        element.removeAttribute(attr.name);
      }
    });
  }

  toRemove.forEach((el) => el.remove());
  return template.innerHTML;
};

export const sanitizeStringArray = (value: unknown): unknown => {
  if (!Array.isArray(value)) return value;
  return value.map((item) => (typeof item === 'string' ? sanitizeRichHtml(item) : item));
};

