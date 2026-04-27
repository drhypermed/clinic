/**
 * Helper لبناء رابط واتساب جاهز لإخطار الطبيب بالاعتماد.
 *
 * السبب: لما الأدمن يعتمد طبيب، مش بنبعت أي إشعار تلقائي حالياً (لا إيميل
 * ولا واتساب API). الـworkaround المؤقت: نفتح wa.me link بنص جاهز
 * عشان الأدمن يضغط Send في ثانية. تكلفة 0، setup 0.
 *
 * لو لاحقاً ربطنا WhatsApp Business API، نشيل الـhelper ده ونبعث أوتوماتيكياً.
 */

const CLINIC_LOGIN_URL = 'https://clinic.drhypermed.com/login/doctor';

/**
 * تنظيف رقم الواتساب لصيغة wa.me (أرقام فقط، بدون + أو 00 أو مسافات).
 *
 * منطق التحويل (مرتب بالأولوية):
 *   1. شيل أي حرف غير رقمي (مسافات، شرطات، +).
 *   2. شيل بادئة "00" (الصيغة الدولية القديمة).
 *   3. لو الرقم 11 خانة وبيبدأ بـ"01" = موبايل مصري محلي → ضيف "2" في الأول
 *      عشان يبقى "201..." (الصيغة الدولية اللي WhatsApp بيقبلها).
 *      الـpattern ده آمن لأن أرقام موبايل مصر كلها 11 خانة وبتبدأ بـ01.
 *   4. لو الرقم 10 خانات وبيبدأ بـ"1" = ممكن مصري بدون الـ0 الأولانية → ضيف "20".
 *   5. غير كده، نسيبه زي ما هو (دولي بالفعل).
 *
 * ⚠️ الـnormalization ده مفيد جداً لأن الأطباء بيكتبوا الرقم بالصيغة المحلية
 *    (01092805293) لكن WhatsApp wa.me بيحتاج الصيغة الدولية (201092805293).
 *    قبل الإصلاح ده، wa.me كان بيفتح بدون فتح المحادثة الفعلية.
 */
export const cleanWhatsAppNumberForWaMe = (raw: string | null | undefined): string => {
  if (!raw) return '';
  let digits = String(raw).replace(/\D/g, '');

  // شيل بادئة 00 الدولية القديمة
  if (digits.startsWith('00')) digits = digits.slice(2);

  // أرقام موبايل مصر: 11 خانة، تبدأ بـ01 (010/011/012/015 لكل الشبكات)
  if (digits.length === 11 && digits.startsWith('01')) {
    digits = '2' + digits; // 01092805293 → 201092805293
  }
  // حالة نادرة: 10 خانات تبدأ بـ1 (الـ0 الأولانية اتمسحت)
  else if (digits.length === 10 && digits.startsWith('1')) {
    digits = '20' + digits;
  }

  return digits;
};

/**
 * يبني رابط wa.me برسالة جاهزة لإخطار الطبيب بالاعتماد.
 * يرجع null لو رقم الواتساب غير صالح (مفيش fallback عشان الأدمن يلاحظ).
 */
export const buildApprovalWhatsAppUrl = (
  doctorName: string | null | undefined,
  doctorWhatsApp: string | null | undefined,
): string | null => {
  const cleanNumber = cleanWhatsAppNumberForWaMe(doctorWhatsApp);
  if (!cleanNumber) return null;

  const safeName = String(doctorName || '').trim() || 'دكتور';
  const message =
    `مرحباً د/${safeName}،\n\n` +
    `تم اعتماد حسابكم للدخول في تطبيق DrHyper لإدارة العيادات الذكية\n\n` +
    `تقدر تسجّل الدخول من:\n${CLINIC_LOGIN_URL}\n\n` +
    `في خدمتك في أي وقت.`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
};
