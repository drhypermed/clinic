const nodemailer = require('nodemailer');

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
  String(email || '').trim().toLowerCase()
);

let emailMailer = null;

const getEmailMailer = () => {
  if (emailMailer) return emailMailer;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465;

  if (!host || !user || !pass) return null;

  emailMailer = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
  return emailMailer;
};

module.exports = {
  isValidEmail,
  getEmailMailer,
};
