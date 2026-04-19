export const USER_TEXT_MAX_LENGTH = 1000;

export const clampUserTextLength = (
  value: unknown,
  maxLength = USER_TEXT_MAX_LENGTH
): string => {
  const safeMaxLength = Number.isFinite(maxLength)
    ? Math.max(1, Math.floor(maxLength))
    : USER_TEXT_MAX_LENGTH;
  const text = String(value ?? '');
  return text.length > safeMaxLength ? text.slice(0, safeMaxLength) : text;
};
