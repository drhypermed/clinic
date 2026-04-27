// ─────────────────────────────────────────────────────────────────────────────
// notifyDoctorOnApproval — إخطار الطبيب بالإيميل لما الأدمن يعتمد حسابه
// ─────────────────────────────────────────────────────────────────────────────
// Trigger: onDocumentWritten('users/{userId}')
//
// الـtrigger بيتنفذ على كل update في users/, بس بيـreturn فوراً (~50ms) لو
// التغيير مش متعلق بالاعتماد. الفلتر:
//   - before.verificationStatus !== 'approved' (كانت مش معتمدة)
//   - after.verificationStatus === 'approved'  (بقت معتمدة)
//
// بنبعث مرة واحدة بس (نخزن approvalEmailSentAt في الـdoc عشان لو الأدمن
// عدّل بيانات الطبيب لاحقاً، ما نبعتش إيميل تاني).
//
// 💰 التكلفة: invocation ~$0.40/million. لو 10k updates يومياً = ~$0.12/شهر.
// ─────────────────────────────────────────────────────────────────────────────

const admin = require('firebase-admin');
const { getOtpMailer, isValidEmail } = require('../otpUtils');

const CLINIC_LOGIN_URL = 'https://clinic.drhypermed.com/login/doctor';
// الشعار الموجود بالفعل في الـPWA — نستخدمه في الإيميل عشان يبقى موحّد
// مع شكل التطبيق على الموبايل (نفس الأيقونة اللي بتظهر بعد التثبيت).
const LOGO_URL = 'https://clinic.drhypermed.com/pwa-512x512.png';

// يبني محتوى الإيميل (نص + HTML بـRTL).
const buildApprovalEmail = (doctorName) => {
  const safeName = String(doctorName || '').trim() || 'دكتور';
  const subject = '✅ تم اعتماد حسابكم في DrHyper';

  const text =
    `مرحباً د/${safeName}،\n\n` +
    `تم اعتماد حسابكم للدخول في تطبيق DrHyper لإدارة العيادات الذكية\n\n` +
    `يمكنك الآن تسجيل الدخول من:\n${CLINIC_LOGIN_URL}\n\n` +
    `في خدمتك في أي وقت،\nفريق Dr Hyper`;

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(15,23,42,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#16a34a,#2563eb);padding:28px 24px;text-align:center;color:#ffffff;">
              <!-- الشعار: حلقة بيضاء حواليه عشان يبان واضح فوق الخلفية المتدرجة -->
              <div style="display:inline-block;width:84px;height:84px;background:#ffffff;border-radius:50%;padding:8px;margin-bottom:14px;box-shadow:0 4px 12px rgba(0,0,0,0.15);">
                <img src="${LOGO_URL}" alt="Dr Hyper" width="68" height="68" style="display:block;width:68px;height:68px;border-radius:50%;object-fit:contain;" />
              </div>
              <div style="font-size:32px;line-height:1;margin-bottom:8px;">✅</div>
              <div style="font-size:20px;font-weight:800;">تم اعتماد حسابكم</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px;color:#0f172a;font-size:15px;line-height:1.7;">
              <p style="margin:0 0 16px;">مرحباً د/${safeName} 👋</p>
              <p style="margin:0 0 20px;">تم اعتماد حسابكم للدخول في تطبيق <strong>DrHyper</strong> لإدارة العيادات الذكية. تقدر دلوقتي تسجّل الدخول وتبدأ تستخدم النظام.</p>
              <div style="text-align:center;margin:24px 0;">
                <a href="${CLINIC_LOGIN_URL}" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#16a34a);color:#ffffff;text-decoration:none;font-weight:800;padding:12px 28px;border-radius:10px;">تسجيل الدخول</a>
              </div>
              <p style="margin:0 0 8px;color:#475569;font-size:13px;">أو افتح الرابط مباشرة:</p>
              <p style="margin:0;word-break:break-all;color:#2563eb;font-size:13px;">${CLINIC_LOGIN_URL}</p>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;padding:16px 24px;text-align:center;color:#64748b;font-size:12px;border-top:1px solid #e2e8f0;">
              في خدمتك في أي وقت — فريق Dr Hyper
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
};

const notifyDoctorOnApproval = async (event) => {
  const userId = event.params?.userId;
  const beforeData = event.data?.before?.data();
  const afterData = event.data?.after?.data();

  // الـdoc اتحذف أو ما اتعملش — تجاهل
  if (!afterData) {
    console.log(`[notifyDoctorOnApproval] ${userId}: doc deleted, skipping`);
    return;
  }

  // فلتر: لازم verificationStatus يتغير من != approved → approved
  const beforeStatus = String(beforeData?.verificationStatus || '').toLowerCase();
  const afterStatus = String(afterData.verificationStatus || '').toLowerCase();
  const wasApproved = beforeStatus === 'approved';
  const isApproved = afterStatus === 'approved';
  if (wasApproved || !isApproved) {
    // لوج خفيف: مش approval transition (الحالة الأكثر شيوعاً — لا داعي للقلق)
    console.log(`[notifyDoctorOnApproval] ${userId}: not approval transition (${beforeStatus || 'none'} → ${afterStatus || 'none'}), skipping`);
    return;
  }

  console.log(`[notifyDoctorOnApproval] ${userId}: ✅ APPROVAL DETECTED — proceeding to send email`);

  // حماية إضافية: لو الإيميل اتبعت قبل كده، ما نكررش
  if (afterData.approvalEmailSentAt) {
    console.log(`[notifyDoctorOnApproval] ${userId}: email already sent at ${afterData.approvalEmailSentAt}, skipping`);
    return;
  }

  const doctorEmail = String(afterData.doctorEmail || afterData.email || '').trim().toLowerCase();
  if (!isValidEmail(doctorEmail)) {
    console.warn(`[notifyDoctorOnApproval] ${userId}: invalid email "${doctorEmail}", skipping`);
    return;
  }

  console.log(`[notifyDoctorOnApproval] ${userId}: target email = ${doctorEmail}`);

  const mailer = getOtpMailer();
  if (!mailer) {
    console.error(`[notifyDoctorOnApproval] ${userId}: ❌ SMTP NOT CONFIGURED — env vars missing (SMTP_HOST=${process.env.SMTP_HOST ? 'set' : 'MISSING'}, SMTP_USER=${process.env.SMTP_USER ? 'set' : 'MISSING'}, SMTP_PASS=${process.env.SMTP_PASS ? 'set' : 'MISSING'})`);
    return;
  }

  console.log(`[notifyDoctorOnApproval] ${userId}: SMTP mailer ready, sending...`);

  // SMTP_FROM موجود في .env بالفعل (مستخدم للـOTP) — نستخدمه نفس الـsender
  const senderEmail =
    process.env.APPROVAL_EMAIL_FROM ||
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    'no-reply@drhypermed.com';

  const { subject, text, html } = buildApprovalEmail(afterData.doctorName);

  try {
    await mailer.sendMail({
      from: `"Dr Hyper" <${senderEmail}>`,
      to: doctorEmail,
      subject,
      text,
      html,
    });
    console.log(`[notifyDoctorOnApproval] ${userId}: ✅ EMAIL SENT successfully to ${doctorEmail}`);

    // نحدّث الـdoc عشان نعرف إن الإيميل اتبعت (يحمي من التكرار)
    if (userId) {
      await admin.firestore().collection('users').doc(userId).set(
        { approvalEmailSentAt: new Date().toISOString() },
        { merge: true },
      );
    }
  } catch (err) {
    console.error(`[notifyDoctorOnApproval] ${userId}: ❌ FAILED TO SEND EMAIL:`, err?.message || err);
  }
};

module.exports = { notifyDoctorOnApproval };
