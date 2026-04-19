/** أنماط التعرف على النصوص المشوهة (Mojibake) واللغة العربية */
const MOJIBAKE_PATTERN = /[\u00D8\u00D9\u00C3\u00C2\u00D0\u00D1]|\u00E2\u20AC|\uFFFD/;
const ARABIC_PATTERN = /[\u0600-\u06FF]/;

/** تحويل النص إلى مصفوفة بايتات بتنسيق Latin1 */
const toLatin1Bytes = (value: string): Uint8Array => {
  const bytes = new Uint8Array(value.length);
  for (let i = 0; i < value.length; i += 1) {
    bytes[i] = value.charCodeAt(i) & 0xff;
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
      const decoded = new TextDecoder('utf-8').decode(toLatin1Bytes(current));
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
