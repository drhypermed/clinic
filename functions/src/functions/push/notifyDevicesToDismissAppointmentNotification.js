/**
 * Cloud Function: notifyDevicesToDismissAppointmentNotification
 *
 * Trigger: onDocumentCreated('users/{userId}/dismissedAppointmentNotifications/{appointmentId}')
 *
 * الغرض:
 *   لما جهاز من أجهزة الطبيب يكتب وثيقة "تم التعامل مع إشعار الحجز"،
 *   هذه الدالة تُرسل push صامت (data-only) لكل أجهزة الطبيب الأخرى — والـ
 *   Service Worker على كل جهاز يقرأ `dh_action: 'dismiss_notification'`
 *   ويحذف الإشعار من درج النظام بنفس الـ tag.
 *
 * نقطة تكلفة:
 *   - FCM مجاني تماماً (Google).
 *   - الـ trigger يستهلك ~1 invocation لكل dismiss + قراءة tokens المستخدم.
 *   - متوسط الحجوزات اليومية × عدد الأطباء = حساب التكلفة الفعلي
 *     (راجع docs/scale-optimization-plan.md).
 */

module.exports = (context) => {
  const {
    admin,
    loadDoctorFcmTokens,
    cleanupInvalidDoctorTokens,
    getInvalidFcmTokensFromResponse,
    logMulticastResult,
    HIGH_URGENCY_HEADERS,
  } = context;

  // بناء الـ tag الأصلي للإشعار — نفس الصيغة المستخدمة في notifyDoctorOnNewAppointment
  // (لو الـ caller حدد tag صراحة، استعمله؛ وإلا اشتقّه من branchId + appointmentId).
  const buildDismissTag = (storedTag, branchId, appointmentId) => {
    const explicitTag = String(storedTag || '').trim();
    if (explicitTag) return explicitTag;
    const safeBranch = String(branchId || '').trim() || 'main';
    const safeAptId = String(appointmentId || '').trim();
    if (!safeAptId) return '';
    return `new_appointment_${safeBranch}_${safeAptId}`;
  };

  const notifyDevicesToDismissAppointmentNotification = async (event) => {
    const snap = event.data;
    if (!snap?.exists) return;

    const userId = String(event.params.userId || '').trim();
    const appointmentId = String(event.params.appointmentId || '').trim();
    if (!userId || !appointmentId) return;

    const data = snap.data() || {};
    const branchId = String(data.branchId || '').trim() || 'main';
    const dismissTag = buildDismissTag(data.tag, branchId, appointmentId);
    if (!dismissTag) {
      console.warn('[notifyDevicesToDismissAppointmentNotification] could not derive tag', {
        userId,
        appointmentId,
      });
      return;
    }

    // تحميل FCM tokens للطبيب (نفس آلية notifyDoctorOnNewAppointment لكن بدون
    // candidates — الـ dismiss خاص بحساب الطبيب نفسه فقط).
    const tokens = await loadDoctorFcmTokens(userId);
    if (!Array.isArray(tokens) || tokens.length === 0) {
      // لا يوجد أجهزة مسجَّلة — مفيش حاجة نمسحها
      return;
    }

    // payload خفيف (data-only) — الـ Service Worker بيتعرّف على dh_action
    // ويمسح الإشعار من درج النظام بدون إظهار إشعار جديد.
    const baseData = {
      dh_action: 'dismiss_notification',
      type: 'dismiss_notification',
      tag: dismissTag,
      appointmentId,
      branchId,
    };

    try {
      // ملاحظة: بنرسل data-only بدون webpush.notification — المتصفح يسلّمها للـ
      // onBackgroundMessage في الـ Service Worker بدون عرض إشعار جديد.
      const response = await admin.messaging().sendEachForMulticast({
        tokens,
        data: baseData,
        webpush: {
          headers: HIGH_URGENCY_HEADERS,
          // عمداً مفيش notification هنا — المعالجة تتم في SW يدوياً.
        },
      });
      logMulticastResult('notifyDevicesToDismissAppointmentNotification', response, tokens);
      const invalid = getInvalidFcmTokensFromResponse(response, tokens);
      if (invalid.length > 0) {
        await cleanupInvalidDoctorTokens(userId, invalid);
      }
    } catch (err) {
      // فشل الـ send مش كارثي — الجهاز اللي عمل dismiss أصلاً اتعالج، والأجهزة
      // التانية لما تفتح التطبيق هتقرأ الـ Firestore subscription وتعرف.
      console.error('[notifyDevicesToDismissAppointmentNotification] FCM send failed:', err);
    }
  };

  return notifyDevicesToDismissAppointmentNotification;
};
