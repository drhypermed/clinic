const PBKDF2_PREFIX = 'dh2';
const PBKDF2_ITERATIONS = 150_000;
const PBKDF2_SALT_BYTES = 16;
const PBKDF2_BITS = 256;

/** 
 * ثوابت التشفير (Cryptography Constants) 
 * نستخدم معيار PBKDF2 لضمان أقصى درجات الأمان لكلمة مرور السكرتارية.
 */

const hasSubtleCrypto = (): boolean =>
  typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';

/** التأكد من دعم المتصفح لمكتبة التشفير الحديثة (WebCrypto API) */

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

/** تحويل مصفوفة بايتات إلى نص هيكس (Hexadecimal) */

const fromHex = (hex: string): Uint8Array | null => {
  const normalized = String(hex || '').trim().toLowerCase();
  if (!/^[0-9a-f]+$/.test(normalized) || normalized.length % 2 !== 0) return null;

  const bytes = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < normalized.length; i += 2) {
    const value = Number.parseInt(normalized.slice(i, i + 2), 16);
    if (!Number.isFinite(value)) return null;
    bytes[i / 2] = value;
  }
  return bytes;
};

/** تحويل نص هيكس إلى مصفوفة بايتات */

const getRandomHex = (size: number): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(size);
    crypto.getRandomValues(bytes);
    return toHex(bytes);
  }

  return Array.from({ length: size * 2 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
};

/** توليد ملح (Salt) عشوائي للتشفير لضمان أن نفس كلمة المرور لا تعطي نفس الهاش */

const timingSafeHexEqual = (a: string, b: string): boolean => {
  const aa = String(a || '');
  const bb = String(b || '');
  if (aa.length !== bb.length) return false;

  let diff = 0;
  for (let i = 0; i < aa.length; i += 1) {
    diff |= aa.charCodeAt(i) ^ bb.charCodeAt(i);
  }
  return diff === 0;
};

/** مقارنة آمنة زمنياً (Timing Safe) لمنع هجمات التوقيت (Side-channel attacks) */

async function pbkdf2Hash(password: string, saltHex: string, iterations: number): Promise<string | null> {
  if (!hasSubtleCrypto()) return null;

  const saltBytes = fromHex(saltHex);
  if (!saltBytes) return null;

  try {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        hash: 'SHA-256',
        salt: saltBytes as Uint8Array,
        iterations,
      } as Pbkdf2Params,
      keyMaterial,
      PBKDF2_BITS
    );

    return toHex(new Uint8Array(bits));
  } catch {
    return null;
  }
}

/** تنفيذ خوارزمية PBKDF2 لاشتقاق الهاش من كلمة المرور */

function simpleHash(password: string): string {
  let hash = 5381;
  const str = password + '_drh_booking_2024';

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) + hash) + char;
    hash = hash & 0xFFFFFFFF;
  }

  let result = Math.abs(hash >>> 0).toString(16).padStart(8, '0');

  for (let round = 0; round < 3; round++) {
    hash = 5381;
    const roundStr = result + '_r' + round.toString() + '_drh';
    for (let i = 0; i < roundStr.length; i++) {
      const char = roundStr.charCodeAt(i);
      hash = ((hash << 5) + hash) + char;
      hash = hash & 0xFFFFFFFF;
    }
    result += Math.abs(hash >>> 0).toString(16).padStart(8, '0');
  }

  return 'dh_' + result;
}

/** نظام تشفير بسيط (Fallback) في حال عدم توفر مكتبة المتصفح الحديثة */

async function sha256Hash(message: string): Promise<string> {
  if (hasSubtleCrypto()) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      return toHex(new Uint8Array(hashBuffer));
    } catch {
      // Fall through to pure JS implementation.
    }
  }

  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const lengthProperty = 'length';
  let i, j;
  let result = '';
  const words: number[] = [];
  const asciiBitLength = message[lengthProperty] * 8;

  let hash = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  for (i = 0; i < message[lengthProperty]; i++) {
    words[i >> 2] |= message.charCodeAt(i) << (24 - (i % 4) * 8);
  }

  words[i >> 2] |= 0x80 << (24 - (i % 4) * 8);
  words[((i + 64 >> 9) << 4) + 15] = asciiBitLength;

  for (i = 0; i < words[lengthProperty]; i += 16) {
    const w = words.slice(i, i + 16);
    const oldHash = hash.slice(0);

    for (j = 0; j < 64; j++) {
      if (j >= 16) {
        w[j] =
          (rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10)) +
          w[j - 7] +
          (rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3)) +
          w[j - 16];
        w[j] = w[j] | 0;
      }

      const a = hash[0];
      const e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[j] +
        w[j];
      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
      hash.pop();
    }

    for (j = 0; j < 8; j++) {
      hash[j] = (hash[j] + oldHash[j]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

/** خوارزمية SHA-256 (تنفيذ برمجي محض في حال الحاجة) */

const parsePbkdf2Hash = (storedHash: string) => {
  const parts = String(storedHash || '').split('$');
  if (parts.length !== 4 || parts[0] !== PBKDF2_PREFIX) return null;

  const iterations = Number.parseInt(parts[1], 10);
  const saltHex = parts[2];
  const hashHex = parts[3];

  if (!Number.isFinite(iterations) || iterations < 10_000) return null;
  if (!/^[0-9a-f]+$/i.test(saltHex) || !/^[0-9a-f]+$/i.test(hashHex)) return null;

  return { iterations, saltHex: saltHex.toLowerCase(), hashHex: hashHex.toLowerCase() };
};

/** تحليل الهاش المخزن لاستخراج عدد الدورات والملح والقيمة المشتقة */

export async function hashPassword(password: string): Promise<string> {
  const normalizedPassword = String(password || '');
  const saltHex = getRandomHex(PBKDF2_SALT_BYTES);
  const derived = await pbkdf2Hash(normalizedPassword, saltHex, PBKDF2_ITERATIONS);

  if (derived) {
    return `${PBKDF2_PREFIX}$${PBKDF2_ITERATIONS}$${saltHex}$${derived}`;
  }

  // Legacy deterministic fallback when WebCrypto is unavailable.
  return simpleHash(normalizedPassword);
}

/**
 * دالة تشفير كلمة المرور (hashPassword):
 * تُستخدم عند قيام الطبيب بتعيين كلمة مرور جديدة للسكرتارية.
 */

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const normalizedPassword = String(password || '');
  const normalizedStored = String(storedHash || '').trim();
  if (!normalizedStored) return false;

  const parsed = parsePbkdf2Hash(normalizedStored);
  if (parsed) {
    const derived = await pbkdf2Hash(normalizedPassword, parsed.saltHex, parsed.iterations);
    return Boolean(derived && timingSafeHexEqual(derived, parsed.hashHex));
  }

  // Legacy deterministic format.
  if (simpleHash(normalizedPassword) === normalizedStored) {
    return true;
  }

  // Very old SHA-256 format.
  const sha256 = await sha256Hash(normalizedPassword);
  return timingSafeHexEqual(sha256, normalizedStored);
}

/** 
 * دالة التحقق من كلمة المرور (verifyPassword):
 * تُستخدم عند تسجيل دخول السكرتارية أو المريض لصفحة الحجز المحمية.
 */
