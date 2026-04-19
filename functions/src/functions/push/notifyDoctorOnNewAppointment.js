module.exports = (context) => {
  const {
    HttpsError,
    admin,
    getDb,
    toAbsoluteWebUrl,
    WEB_PUSH_ICON,
    WEB_PUSH_BADGE,
    getFcmTokensFromDoc,
    loadDoctorFcmTokens,
    resolveDoctorCandidateUserIds,
    loadDoctorFcmTokensForCandidates,
    resolveDoctorCandidatesForAppointment,
    logMulticastResult,
    getInvalidFcmTokensFromResponse,
    removeTokenFromCollection,
    cleanupInvalidDoctorTokens,
    cleanupInvalidSecretaryTokens,
    buildRelativeLink,
    stringifyNotificationData,
    HIGH_URGENCY_HEADERS,
  } = context;

  const SECRETARY_VITAL_FIELDS = [
    { key: 'weight', label: 'الوزن' },
    { key: 'height', label: 'الطول' },
    { key: 'bmi', label: 'مؤشر الكتلة' },
    { key: 'rbs', label: 'سكر الدم' },
    { key: 'bp', label: 'ضغط الدم' },
    { key: 'pulse', label: 'النبض' },
    { key: 'temp', label: 'الحرارة' },
    { key: 'spo2', label: 'تشبع الاكسجين' },
    { key: 'rr', label: 'معدل التنفس' },
  ];

  const normalizeSecretaryVitals = (value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const normalized = {};

    SECRETARY_VITAL_FIELDS.forEach(({ key }) => {
      const nextValue = String(value[key] || '').trim();
      if (!nextValue) return;
      normalized[key] = nextValue.slice(0, 24);
    });

    return Object.keys(normalized).length > 0 ? normalized : null;
  };

  const buildSecretaryVitalsSummary = (vitals) => {
    if (!vitals) return '';
    const parts = SECRETARY_VITAL_FIELDS
      .map(({ key, label }) => {
        const value = String(vitals[key] || '').trim();
        if (!value) return '';
        return `${label}: ${value}`;
      })
      .filter(Boolean);

    return parts.join(' | ');
  };

  const buildSecretaryVitalsNotificationData = (vitals) => {
    if (!vitals) return {};
    const data = {};
    SECRETARY_VITAL_FIELDS.forEach(({ key }) => {
      const value = String(vitals[key] || '').trim();
      if (!value) return;
      data[`sv_${key}`] = value;
    });
    return data;
  };

  const notifyDoctorOnNewAppointment = async (event) => {
    const snap = event.data;
    if (!snap?.exists) return;
    const userId = event.params.userId;
    const aptId = event.params.aptId;
    const data = snap.data();
    const sourceKey = String(data?.source || '').trim();
    if (sourceKey !== 'secretary' && sourceKey !== 'public') {
      return;
    }
    const patientName = data.patientName || 'مريض';
    const dateTime = data.dateTime ? new Date(data.dateTime).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Africa/Cairo' }) : '';
    const sourceLabel = sourceKey === 'public' ? 'حجز من الفورم العام' : 'حجز من السكرتارية';
    const age = String(data?.age || '').trim() || 'غير متوفر';
    const visitReason = String(data?.visitReason || '').trim();
    const secretaryVitals = normalizeSecretaryVitals(data?.secretaryVitals);
    const secretaryVitalsSummary = buildSecretaryVitalsSummary(secretaryVitals);
    const rawType = String(data?.appointmentType || 'exam').trim().toLowerCase();
    const typeLabel = rawType === 'consultation' ? 'استشارة' : 'كشف';
    const bodyParts = [
      `مصدر الحجز: ${sourceLabel}`,
      `نوع الحجز: ${typeLabel}`,
      `اسم المريض: ${patientName}`,
      `السن: ${age}`,
    ];
    if (visitReason) bodyParts.push(`سبب الزيارة: ${visitReason}`);
    if (secretaryVitalsSummary) bodyParts.push(`القياسات والعلامات الحيوية: ${secretaryVitalsSummary}`);
    if (dateTime) bodyParts.push(`الموعد: ${dateTime}`);
    const body = bodyParts.join(' · ');

    const candidateUserIds = await resolveDoctorCandidatesForAppointment({
      eventUserId: userId,
      appointmentData: data,
    });
    let tokens = await loadDoctorFcmTokensForCandidates(candidateUserIds);
    if (tokens.length === 0) {
      console.warn('[notifyDoctorOnNewAppointment] No doctor tokens found', {
        eventUserId: userId,
        candidateUserIds,
        bookingSecret: String(data?.bookingSecret || ''),
        publicBookingSecret: String(data?.publicBookingSecret || ''),
      });
      return;
    }

    
    try {
      const secretsToCheck = new Set();
      const normalizedBookingSecret = String(data?.bookingSecret || '').trim();
      const normalizedPublicSecret = String(data?.publicBookingSecret || '').trim();
      if (normalizedBookingSecret) secretsToCheck.add(normalizedBookingSecret);
      if (normalizedPublicSecret) secretsToCheck.add(normalizedPublicSecret);
      // Also look up secrets linked to the doctor userId
      if (secretsToCheck.size === 0) {
        const db = getDb();
        // Try to find secretaryFcmTokens by userId
        const relatedDocs = await db.collection('secretaryFcmTokens').where('userId', '==', userId).limit(20).get().catch(() => null);
        if (relatedDocs) {
          relatedDocs.forEach((docSnap) => secretsToCheck.add(String(docSnap.id || '').trim()));
        }
      }
      const secretaryTokensSet = new Set();
      const db2 = getDb();
      for (const sec of secretsToCheck) {
        if (!sec) continue;
        const secTokenSnap = await db2.doc(`secretaryFcmTokens/${sec}`).get().catch(() => null);
        if (secTokenSnap?.exists) {
          getFcmTokensFromDoc(secTokenSnap.data()).forEach((t) => secretaryTokensSet.add(t));
        }
      }
      if (secretaryTokensSet.size > 0) {
        const filteredTokens = tokens.filter((t) => !secretaryTokensSet.has(t));
        tokens = filteredTokens;
      }
    } catch (_) {
      // Non-fatal: if we can't filter, send to all doctor tokens
    }

    if (tokens.length === 0) {
      console.warn('[notifyDoctorOnNewAppointment] all doctor tokens matched secretary tokens; skipping doctor push');
      return;
    }

    try {
      // تمرير branchId في الـ deep-link حتى يعرف الطبيب في أي فرع الموعد (لتوجيه واجهته)
      const branchId = String(data?.branchId || '').trim() || 'main';
      const appointmentsLink = `/appointments?branchId=${encodeURIComponent(branchId)}`;
      const appointmentsAbsoluteLink = toAbsoluteWebUrl(appointmentsLink);
      const notificationTitle = 'موعد جديد';
      // tag per-branch عشان إشعار فرع لا يستبدل إشعار فرع آخر لنفس الموعد
      const notificationTag = `new_appointment_${branchId}_${aptId}`;
      const response = await admin.messaging().sendEachForMulticast({
        tokens,
        data: {
          type: 'new_appointment',
          title: notificationTitle,
          body,
          icon: WEB_PUSH_ICON,
          badge: WEB_PUSH_BADGE,
          tag: notificationTag,
          url: appointmentsAbsoluteLink,
          link: appointmentsLink,
          appointmentId: String(aptId),
          branchId,
          patientName: String(data.patientName || ''),
          dateTime: String(data.dateTime || ''),
          source: String(data.source || ''),
          appointmentType: String(data.appointmentType || 'exam'),
          ...(data.consultationSourceAppointmentId ? { consultationSourceAppointmentId: String(data.consultationSourceAppointmentId) } : {}),
          ...(data.consultationSourceCompletedAt ? { consultationSourceCompletedAt: String(data.consultationSourceCompletedAt) } : {}),
          ...(data.consultationSourceRecordId ? { consultationSourceRecordId: String(data.consultationSourceRecordId) } : {}),
          ...(data.age ? { age: String(data.age) } : {}),
          ...(data.visitReason ? { visitReason: String(data.visitReason) } : {}),
          ...buildSecretaryVitalsNotificationData(secretaryVitals),
        },
        webpush: {
          headers: HIGH_URGENCY_HEADERS,
          notification: {
            title: notificationTitle,
            body,
            icon: WEB_PUSH_ICON,
            badge: WEB_PUSH_BADGE,
            tag: notificationTag,
            renotify: true,
            requireInteraction: true,
            data: {
              type: 'new_appointment',
              url: appointmentsAbsoluteLink,
              link: appointmentsLink,
              appointmentId: String(aptId),
              branchId,
            },
            actions: [
              { action: 'dh_open_app', title: 'لمزيد ادخل التطبيق' },
            ],
          },
        }
      });
      logMulticastResult('notifyDoctorOnNewAppointment', response, tokens);
      const invalidTokens = getInvalidFcmTokensFromResponse(response, tokens);
      if (invalidTokens.length > 0) {
        await Promise.all(
          candidateUserIds.map((candidateUserId) =>
            cleanupInvalidDoctorTokens(candidateUserId, invalidTokens)
          )
        );
      }
    } catch (err) {
      console.error('[notifyDoctorOnNewAppointment] FCM send failed:', err);
    }
  };


  return notifyDoctorOnNewAppointment;
};
