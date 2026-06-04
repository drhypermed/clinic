/** أنماط التعرف على النصوص المشوهة (Mojibake) واللغة العربية */
const MOJIBAKE_PATTERN = /[\u00D8\u00D9\u00C3\u00C2\u00D0\u00D1]|\u00E2\u20AC|\uFFFD/;
const ARABIC_PATTERN = /[\u0600-\u06FF]/;

const WINDOWS_1252_REVERSE_MAP = new Map<number, number>([
  [0x20ac, 0x80],
  [0x201a, 0x82],
  [0x0192, 0x83],
  [0x201e, 0x84],
  [0x2026, 0x85],
  [0x2020, 0x86],
  [0x2021, 0x87],
  [0x02c6, 0x88],
  [0x2030, 0x89],
  [0x0160, 0x8a],
  [0x2039, 0x8b],
  [0x0152, 0x8c],
  [0x017d, 0x8e],
  [0x2018, 0x91],
  [0x2019, 0x92],
  [0x201c, 0x93],
  [0x201d, 0x94],
  [0x2022, 0x95],
  [0x2013, 0x96],
  [0x2014, 0x97],
  [0x02dc, 0x98],
  [0x2122, 0x99],
  [0x0161, 0x9a],
  [0x203a, 0x9b],
  [0x0153, 0x9c],
  [0x017e, 0x9e],
  [0x0178, 0x9f],
]);

/** تحويل النص المشوه إلى بايتات Latin1/Windows-1252 قبل فك UTF-8 */
const toMojibakeBytes = (value: string): Uint8Array => {
  const bytes = new Uint8Array(value.length);
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    bytes[i] = code <= 0xff
      ? code
      : WINDOWS_1252_REVERSE_MAP.get(code) ?? (code & 0xff);
  }
  return bytes;
};

/** حساب عدد مرات ظهور نمط معين في النص */
const countMatches = (value: string, pattern: RegExp): number => {
  const matches = value.match(pattern);
  return matches ? matches.length : 0;
};

/**
 * دالة إصلاح نصوص الروشتة المشوهة (decodeMojibakeText):
 * وظيفة متقدمة تحاول استعادة النصوص العربية التي فقدت ترميزها الصحيح 
 * (مثلاً عند استيراد بيانات قديمة أو من ملفات Excel).
 * تستخدم نظام "النقاط" (Heuristic Scoring) لاختيار أفضل محاولة فك تشفير 
 * تعطي أكبر قدر من الحروف العربية المفهومة وأقل قدر من الرموز العشوائية.
 */
const decodeMojibakeText = (value: string): string => {
  // إذا كان النص سليماً أو لا يحتوي على أنماط تشويه، نرجعه كما هو
  if (!value || !MOJIBAKE_PATTERN.test(value)) return value;

  /** تقييم جودة النص: نقاط إيجابية للعربي، وسالبة للرموز المشوهة */
  const score = (text: string) => {
    const arabicCount = countMatches(text, ARABIC_PATTERN);
    const noiseCount = countMatches(text, MOJIBAKE_PATTERN);
    return arabicCount * 3 - noiseCount * 2;
  };

  let best = value;
  let current = value;
  let bestScore = score(value);

  // محاولة فك التشفير لعدة مستويات (Iterative Decoding)
  for (let i = 0; i < 4; i += 1) {
    if (!MOJIBAKE_PATTERN.test(current)) break;

    try {
      const decoded = new TextDecoder('utf-8').decode(toMojibakeBytes(current));
      if (!decoded || decoded === current) break;

      const decodedScore = score(decoded);
      if (decodedScore > bestScore) {
        best = decoded;
        bestScore = decodedScore;
      }
      current = decoded;
    } catch {
      break;
    }
  }

  return best;
};

/** تطبيع شامل للنص يشمل إصلاح التشفير وإزالة المسافات الزائدة */
export const normalizeText = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return decodeMojibakeText(value).trim();
};
