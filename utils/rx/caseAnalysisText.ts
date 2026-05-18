const BIDI_CONTROL_RE = /[\u200e\u200f\u202a-\u202e\u2066-\u2069]/gu;
const LEADING_BULLET_RE = /^[\s\u00a0]*(?:[\u2022\u00b7\u25cf\u25cb\u25a0\u25aa\u25ab\u2043\u2219*\-+\u2013\u2014]+\s*)+/u;
const LEADING_NUMBER_RE = /^[\s\u00a0]*(?:[\d\u0660-\u0669\u06f0-\u06f9]+[\.)\]]+|[\(\[][\d\u0660-\u0669\u06f0-\u06f9]+[\)\]])\s*/u;
const LEADING_NUMBER_DASH_RE = /^[\s\u00a0]*[\d\u0660-\u0669\u06f0-\u06f9]+\s*[-\u2013\u2014]\s+/u;
const INLINE_SPACES_RE = /[ \t\f\v\u00a0]+/g;
const NEWLINE_SPACES_RE = /\n[ \t\f\v\u00a0]+/g;

export function normalizeCaseAnalysisPrescriptionListText(value: string | null | undefined): string {
  let text = (value ?? '')
    .toString()
    .normalize('NFKC')
    .replace(BIDI_CONTROL_RE, '')
    .replace(/\r\n?/g, '\n')
    .trim();

  for (let pass = 0; pass < 6; pass += 1) {
    const next = text
      .replace(LEADING_BULLET_RE, '')
      .replace(LEADING_NUMBER_DASH_RE, '')
      .replace(LEADING_NUMBER_RE, '')
      .trim();

    if (next === text) break;
    text = next;
  }

  return text
    .replace(INLINE_SPACES_RE, ' ')
    .replace(NEWLINE_SPACES_RE, '\n')
    .trim();
}

export function caseAnalysisPrescriptionListTextKey(value: string | null | undefined): string {
  return normalizeCaseAnalysisPrescriptionListText(value).toLowerCase();
}
