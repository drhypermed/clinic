
const crypto = require('crypto');
const nodemailer = require('nodemailer');


const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim().toLowerCase());


const otpEmailDocId = (email) => Buffer.from(String(email).trim().toLowerCase()).toString('base64url');


const normalizeOtpCode = (code) => String(code || '').replace(/\D/g, '').slice(0, 4);


const otpHash = (email, code) => {
  const pepper = String(process.env.OTP_PEPPER || '');
  if (!pepper) {
    console.warn('[otpUtils] OTP_PEPPER env variable is not set. Set it as a Firebase secret for production security.');
  }
  const effectivePepper = pepper || 'drhyper-public-otp';
  return crypto
    .createHash('sha256')
    .update(`${String(email).trim().toLowerCase()}::${String(code)}::${effectivePepper}`)
    .digest('hex');
};

let otpMailer = null;

const getOtpMailer = () => {
  if (otpMailer) return otpMailer;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465;

  if (!host || !user || !pass) {
    return null;
  }

  otpMailer = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
  return otpMailer;
};

module.exports = {
  isValidEmail,
  otpEmailDocId,
  normalizeOtpCode,
  otpHash,
  getOtpMailer,
};
