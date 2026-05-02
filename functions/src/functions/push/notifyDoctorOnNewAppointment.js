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
    const isFirstVisit = typeof data?.isFirstVisit === 'boolean' ? data.isFirstVisit : null;
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
    if (isFirstVisit === true) bodyParts.push('أول زيارة');
    else if (isFirstVisit === false) bodyParts.push('زار العيادة من قبل');
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
      // نكمّل لحجز الجمهور لأن إشعار السكرتارية لا يزال مطلوباً حتى لو الطبيب مش مسجّل tokens.
    }

    // فرع الموعد — لازم يتحدد قبل قراءة الـ tokens لأن الإشعار يخص فرع واحد فقط
    const branchId = String(data?.branchId || '').trim() || 'main';

    // تجميع tokens السكرتارية:
    //   - allSecretaryTokensSet = كل الـ tokens (لكل الفروع) → للاستبعاد من إرسال الطبيب
    //     (لو نفس الجهاز عليه طبيب وسكرتيرة، مش عاوزين الطبيب يستلم نسختين).
    //   - branchSecretaryTokensSet = tokens الفرع المستهدف فقط → للإرسال الفعلي.
    //
    // ⚠️ إصلاح bug تسريب إشعارات بين الفروع:
    //   الكود القديم كان بيستخدم getFcmTokensFromDoc اللي بيقرا حقل fcmTokens الجذري
    //   اللي فيه كل الـ tokens مدمجة. النتيجة: إشعار موعد على فرع شبرا كان بيوصل
    //   لسكرتيرة فرع المعادي. الإصلاح: نستخدم tokensByBranch[branchId] لو موجود.
    //   نسقط على الجذر فقط لو الـ doc كله legacy schema (ميفهمش tokensByBranch).
    const allSecretaryTokensSet = new Set();
    const branchSecretaryTokensSet = new Set();
    const relatedSecretsSet = new Set();
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
      const db2 = getDb();
      for (const sec of secretsToCheck) {
        if (!sec) continue;
        relatedSecretsSet.add(sec);
        const secTokenSnap = await db2.doc(`secretaryFcmTokens/${sec}`).get().catch(() => null);
        if (!secTokenSnap?.exists) continue;
        const tokenData = secTokenSnap.data() || {};

        // كل tokens المستند (الجذر + كل الفروع) → للاستبعاد من إرسال الطبيب
        getFcmTokensFromDoc(tokenData).forEach((t) => allSecretaryTokensSet.add(t));
        const tokensByBranchMap =
          tokenData.tokensByBranch && typeof tokenData.tokensByBranch === 'object'
            ? tokenData.tokensByBranch
            : null;
        if (tokensByBranchMap) {
          Object.values(tokensByBranchMap).forEach((arr) => {
            if (Array.isArray(arr)) {
              arr.forEach((t) => {
                if (typeof t === 'string' && t) allSecretaryTokensSet.add(t);
              });
            }
          });
        }

        // tokens الفرع المستهدف فقط → للإرسال
        const branchTokens =
          tokensByBranchMap && Array.isArray(tokensByBranchMap[branchId])
            ? tokensByBranchMap[branchId].filter((t) => typeof t === 'string' && t)
            : null;
        if (branchTokens && branchTokens.length > 0) {
          // الفرع المستهدف عنده tokens مسجلة صراحة → نستخدمها فقط
          branchTokens.forEach((t) => branchSecretaryTokensSet.add(t));
        } else if (!tokensByBranchMap) {
          // legacy schema بالكامل (الـ doc ميعرفش tokensByBranch) → نسقط على الجذر
          // ده مسار توافق مع أجهزة قديمة لم تُسجل بعد على الـ schema الجديد.
          getFcmTokensFromDoc(tokenData).forEach((t) => branchSecretaryTokensSet.add(t));
        }
        // غير ذلك: الفرع مفيهوش tokens لكن في فروع تانية → ميتبعتش (منع تسريب).
      }
      if (allSecretaryTokensSet.size > 0) {
        const filteredTokens = tokens.filter((t) => !allSecretaryTokensSet.has(t));
        tokens = filteredTokens;
      }
    } catch (_) {
      // Non-fatal: if we can't filter, send to all doctor tokens
    }
    const notificationTitle = 'موعد جديد';

    // ينفِّذ send + cleanup tokens الفاسدة لمستلم واحد (طبيب/سكرتيرة).
    const sendPush = async ({ logLabel, tokens: targetTokens, type, tag, link, extraData, cleanupInvalid }) => {
      if (!Array.isArray(targetTokens) || targetTokens.length === 0) return;
      const absoluteLink = toAbsoluteWebUrl(link);
      const baseData = {
        type,
        title: notificationTitle,
        body,
        icon: WEB_PUSH_ICON,
        badge: WEB_PUSH_BADGE,
        tag,
        url: absoluteLink,
        link,
        appointmentId: String(aptId),
        branchId,
        patientName: String(data.patientName || ''),
        dateTime: String(data.dateTime || ''),
        // وقت إنشاء الإشعار — يستخدمه الـ client لتجاهل الإشعارات الأقدم من 3 أيام
        // (لو الموعد ما عندوش createdAt مسجَّل، نستخدم وقت الـ trigger كقيمة احتياطية).
        createdAt: String(data.createdAt || new Date().toISOString()),
        source: String(data.source || ''),
        appointmentType: String(data.appointmentType || 'exam'),
        ...(data.age ? { age: String(data.age) } : {}),
        ...(data.visitReason ? { visitReason: String(data.visitReason) } : {}),
        ...(isFirstVisit !== null ? { isFirstVisit: String(isFirstVisit) } : {}),
        ...(extraData || {}),
      };
      try {
        const response = await admin.messaging().sendEachForMulticast({
          tokens: targetTokens,
          data: baseData,
          webpush: {
            headers: HIGH_URGENCY_HEADERS,
            notification: {
              title: notificationTitle,
              body,
              icon: WEB_PUSH_ICON,
              badge: WEB_PUSH_BADGE,
              tag,
              renotify: true,
              requireInteraction: true,
              data: { type, url: absoluteLink, link, appointmentId: String(aptId), branchId },
              actions: [{ action: 'dh_open_app', title: 'لمزيد ادخل التطبيق' }],
            },
          },
        });
        logMulticastResult(logLabel, response, targetTokens);
        const invalid = getInvalidFcmTokensFromResponse(response, targetTokens);
        if (invalid.length > 0 && cleanupInvalid) await cleanupInvalid(invalid);
      } catch (err) {
        console.error(`[${logLabel}] FCM send failed:`, err);
      }
    };

    const doctorPush = tokens.length === 0
      ? Promise.resolve(console.warn('[notifyDoctorOnNewAppointment] all doctor tokens matched secretary tokens; skipping doctor push'))
      : sendPush({
          logLabel: 'notifyDoctorOnNewAppointment',
          tokens,
          type: 'new_appointment',
          tag: `new_appointment_${branchId}_${aptId}`,
          link: `/appointments?branchId=${encodeURIComponent(branchId)}`,
          extraData: {
            ...(data.consultationSourceAppointmentId ? { consultationSourceAppointmentId: String(data.consultationSourceAppointmentId) } : {}),
            ...(data.consultationSourceCompletedAt ? { consultationSourceCompletedAt: String(data.consultationSourceCompletedAt) } : {}),
            ...(data.consultationSourceRecordId ? { consultationSourceRecordId: String(data.consultationSourceRecordId) } : {}),
            ...buildSecretaryVitalsNotificationData(secretaryVitals),
          },
          cleanupInvalid: (invalid) => Promise.all(
            candidateUserIds.map((candidateUserId) => cleanupInvalidDoctorTokens(candidateUserId, invalid))
          ),
        });

    // لا نرسل للسكرتارية لو هي اللي حجزت (source === 'secretary') لتجنب إشعار ذاتي.
    // نستخدم branchSecretaryTokensSet (فرع الموعد فقط) عشان متبعتش لسكرتيرة فرع تاني.
    const secretaryPush = (sourceKey === 'public' && branchSecretaryTokensSet.size > 0)
      ? sendPush({
          logLabel: 'notifySecretaryOnNewPublicAppointment',
          tokens: Array.from(branchSecretaryTokensSet),
          type: 'new_public_appointment',
          tag: `new_public_appointment_${branchId}_${aptId}`,
          link: `/book/s/${encodeURIComponent(Array.from(relatedSecretsSet)[0] || '')}?branchId=${encodeURIComponent(branchId)}`,
          cleanupInvalid: (invalid) => Promise.all(
            Array.from(relatedSecretsSet).map((sec) => cleanupInvalidSecretaryTokens(sec, invalid))
          ),
        })
      : Promise.resolve();

    await Promise.allSettled([doctorPush, secretaryPush]);
  };


  return notifyDoctorOnNewAppointment;
};
