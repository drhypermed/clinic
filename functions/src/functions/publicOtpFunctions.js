
module.exports = ({
  HttpsError,
  admin,
  crypto,
  getDb,
  isValidEmail,
  getOtpMailer,
  otpEmailDocId,
  normalizeOtpCode,
  otpHash,
}) => {
  const OTP_COLLECTION = 'publicEmailOtps';
  const OTP_EXPIRY_MS = 5 * 60 * 1000; 
  const OTP_COOLDOWN_MS = 60 * 1000;  
  const OTP_MAX_ATTEMPTS = 5;          

  
  const sendPublicEmailOtpCode = async (request) => {
    const email = String(request?.data?.email || '').trim().toLowerCase();
    if (!isValidEmail(email)) {
      throw new HttpsError('invalid-argument', 'Invalid email');
    }

    const transporter = getOtpMailer();
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    if (!transporter || !from) {
      throw new HttpsError('failed-precondition', 'SMTP is not configured');
    }

    const db = getDb();
    const docRef = db.collection(OTP_COLLECTION).doc(otpEmailDocId(email));
    const existingSnap = await docRef.get();
    const nowMs = Date.now();
    const nowTs = admin.firestore.Timestamp.fromMillis(nowMs);

    if (existingSnap.exists) {
      const existing = existingSnap.data() || {};
      const lastSentAtMs = existing.lastSentAt && typeof existing.lastSentAt.toMillis === 'function'
        ? existing.lastSentAt.toMillis()
        : 0;
      if (nowMs - lastSentAtMs < OTP_COOLDOWN_MS) {
        throw new HttpsError('resource-exhausted', 'Too many requests');
      }
    }

    const code = String(crypto.randomInt(1000, 10000));
    const expiresAtMs = nowMs + OTP_EXPIRY_MS;
    const expiresAtTs = admin.firestore.Timestamp.fromMillis(expiresAtMs);
    const codeDigest = otpHash(email, code);

    await docRef.set({
      email,
      codeHash: codeDigest,
      attempts: 0,
      createdAt: nowTs,
      lastSentAt: nowTs,
      expiresAt: expiresAtTs,
    }, { merge: true });

    await transporter.sendMail({
      from,
      to: email,
      subject: 'رمز التحقق - DR HYPER',
      text: `رمز التحقق الخاص بك هو: ${code}\nمدة الصلاحية: 5 دقائق.`,
      html: `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif">
      <h3>رمز التحقق</h3>
      <p>رمز التحقق الخاص بك:</p>
      <p style="font-size:32px;font-weight:700;letter-spacing:6px">${code}</p>
      <p>مدة الصلاحية: 5 دقائق.</p>
    </div>`,
    });

    return { ok: true, expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000) };
  };

  
  const verifyPublicEmailOtpCode = async (request) => {
    const email = String(request?.data?.email || '').trim().toLowerCase();
    const code = normalizeOtpCode(request?.data?.code || '');

    if (!isValidEmail(email) || !/^\d{4}$/.test(code)) {
      throw new HttpsError('invalid-argument', 'Invalid verification code');
    }

    const db = getDb();
    const docRef = db.collection(OTP_COLLECTION).doc(otpEmailDocId(email));
    const snap = await docRef.get();
    if (!snap.exists) {
      throw new HttpsError('not-found', 'OTP not found');
    }

    const data = snap.data() || {};
    const attempts = Number(data.attempts || 0);
    if (attempts >= OTP_MAX_ATTEMPTS) {
      throw new HttpsError('permission-denied', 'Too many failed attempts');
    }

    const expiresAtMs = data.expiresAt && typeof data.expiresAt.toMillis === 'function'
      ? data.expiresAt.toMillis()
      : 0;
    if (!expiresAtMs || Date.now() > expiresAtMs) {
      await docRef.delete();
      throw new HttpsError('deadline-exceeded', 'OTP expired');
    }

    const expectedHash = String(data.codeHash || '');
    const incomingHash = otpHash(email, code);
    if (!expectedHash || incomingHash !== expectedHash) {
      await docRef.set({
        attempts: attempts + 1,
        updatedAt: admin.firestore.Timestamp.now(),
      }, { merge: true });
      throw new HttpsError('invalid-argument', 'Invalid verification code');
    }

    await docRef.delete();
    return { ok: true };
  };

  return {
    sendPublicEmailOtpCode,
    verifyPublicEmailOtpCode,
  };
};
