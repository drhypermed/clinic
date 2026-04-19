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

  const notifySecretaryOnBookingConfigUpdate = async (event) => {
    const before = event.data?.before?.exists ? event.data.before.data() : {};
    const after = event.data?.after?.exists ? event.data.after.data() : {};
    const secret = event.params.secret;
    const userId = String(after?.userId || before?.userId || '').trim();

    const db = getDb();
    const relatedSecrets = new Set([String(secret || '').trim()].filter(Boolean));

    // نحمّل بيانات الـ tokens المُقسَّمة بالفرع + القديمة (للتوافق)
    let tokensByBranch = {}; // { branchId: [token1, token2, ...] }
    const legacyTokenSet = new Set();

    const tokenSnap = await db.doc(`secretaryFcmTokens/${secret}`).get().catch(() => null);
    if (tokenSnap?.exists) {
      const tokenData = tokenSnap.data() || {};
      getFcmTokensFromDoc(tokenData).forEach((token) => legacyTokenSet.add(token));
      if (tokenData.tokensByBranch && typeof tokenData.tokensByBranch === 'object') {
        Object.keys(tokenData.tokensByBranch).forEach((branchId) => {
          const branchTokens = tokenData.tokensByBranch[branchId];
          if (Array.isArray(branchTokens) && branchTokens.length > 0) {
            tokensByBranch[branchId] = branchTokens.filter((t) => typeof t === 'string' && t.length > 0);
          }
        });
      }
    }

    if (legacyTokenSet.size === 0 && Object.keys(tokensByBranch).length === 0 && userId) {
      try {
        const relatedSecretaryTokenDocs = await db.collection('secretaryFcmTokens').where('userId', '==', userId).limit(20).get();
        relatedSecretaryTokenDocs.forEach((docSnap) => {
          relatedSecrets.add(String(docSnap.id || '').trim());
          getFcmTokensFromDoc(docSnap.data()).forEach((token) => legacyTokenSet.add(token));
        });
      } catch (error) {
        console.warn('[notifySecretaryOnBookingConfigUpdate] fallback secretary tokens lookup failed:', { userId, error });
      }
    }

    // Debug logging لتشخيص المشاكل إذا ظهرت في الإنتاج
    console.log('[notifySecretaryOnBookingConfigUpdate] invoked', {
      secret,
      userId,
      tokenBranches: Object.keys(tokensByBranch),
      legacyTokensCount: legacyTokenSet.size,
    });

    /**
     * اختيار الـ tokens المناسبة لفرع محدد.
     *
     * ⚠️ منع تسريب الإشعارات بين الفروع:
     *   - لو `tokensByBranch[branchId]` فيه tokens → نستخدمها حصرياً
     *   - لو فاضي/غير موجود **ولا يوجد أي فرع آخر فيه tokens** (يعني النظام
     *     كله على الـ legacy القديم) → fallback للـ legacyTokenSet (migration path)
     *   - لو فاضي **لكن هناك فروع أخرى لها tokens** → لا نرسل (الـ legacy قد يحوي
     *     أجهزة فروع أخرى — إرسالها هنا يسرب الإشعار). الفرع المستهدف ليس عنده
     *     سكرتيرة مسجلة فعلاً → السلوك الصحيح هو عدم الإرسال.
     */
    const pickTokensForBranch = (branchId) => {
      const normalizedBranch = (branchId || 'main').trim() || 'main';
      if (tokensByBranch[normalizedBranch] && tokensByBranch[normalizedBranch].length > 0) {
        return tokensByBranch[normalizedBranch].slice(0, 500);
      }
      // fallback للـ legacy مسموح فقط لو الـ tokensByBranch فاضية كلياً
      // (النظام لسه على الـ schema القديم — لم يُحدَّث بعد).
      const anyBranchHasTokens = Object.values(tokensByBranch).some(
        (arr) => Array.isArray(arr) && arr.length > 0
      );
      if (!anyBranchHasTokens) {
        return Array.from(legacyTokenSet).slice(0, 500);
      }
      // فرع محدد بدون tokens + فروع أخرى لها → لا نسرب للـ legacy
      console.warn('[pickTokensForBranch] no tokens for branch & other branches have tokens; skipping send', {
        branchId: normalizedBranch,
        availableBranches: Object.keys(tokensByBranch),
      });
      return [];
    };

    // تحقق مبكر — لو السكرتيرة ما مسجَّلتش أي token، نخرج مبكراً
    if (legacyTokenSet.size === 0 && Object.keys(tokensByBranch).length === 0) {
      console.warn('[notifySecretaryOnBookingConfigUpdate] No secretary tokens registered for this secret — exiting', { secret });
      return;
    }

    const entryAlertBefore = before.entryAlert;
    const entryAlertAfter = after.entryAlert;
    const doctorRespBefore = before.doctorEntryResponse;
    const doctorRespAfter = after.doctorEntryResponse;

    /** اكتشاف كل الفروع التي تغير فيها entryAlert (الطبيب أرسل طلب للسكرتيرة). */
    const collectChangedEntryAlertBranches = () => {
      const byBranchAfter = after.entryAlertByBranch || {};
      const byBranchBefore = before.entryAlertByBranch || {};
      const changed = [];
      const branchIds = new Set([...Object.keys(byBranchAfter), ...Object.keys(byBranchBefore)]);
      branchIds.forEach((branchId) => {
        const a = byBranchAfter[branchId];
        const b = byBranchBefore[branchId];
        const aCreatedAt = a && typeof a === 'object' ? String(a.createdAt || '') : '';
        const bCreatedAt = b && typeof b === 'object' ? String(b.createdAt || '') : '';
        if (aCreatedAt && aCreatedAt !== bCreatedAt && a.caseName && a.appointmentId) {
          changed.push({ branchId, alert: a });
        }
      });
      return changed;
    };

    /** اكتشاف كل الفروع التي تغير فيها doctorEntryResponse. */
    const collectChangedDoctorResponseBranches = () => {
      const byBranchAfter = after.doctorEntryResponseByBranch || {};
      const byBranchBefore = before.doctorEntryResponseByBranch || {};
      const changed = [];
      const branchIds = new Set([...Object.keys(byBranchAfter), ...Object.keys(byBranchBefore)]);
      branchIds.forEach((branchId) => {
        const a = byBranchAfter[branchId];
        const b = byBranchBefore[branchId];
        const aRespondedAt = a && typeof a === 'object' ? String(a.respondedAt || '') : '';
        const bRespondedAt = b && typeof b === 'object' ? String(b.respondedAt || '') : '';
        if (aRespondedAt && aRespondedAt !== bRespondedAt) {
          changed.push({ branchId, response: a });
        }
      });
      return changed;
    };

    /**
     * اكتشاف كل الفروع التي تغير فيها "الطبيب فتح الكشف" (lastExamOpenedAt.${branchId}).
     * هذا الحقل يُكتب من `addSecretaryApprovedEntryId` في كل مرة يضغط الطبيب "بدء الكشف".
     */
    const collectChangedExamOpenedBranches = () => {
      const afterMap = after.lastExamOpenedAt || {};
      const beforeMap = before.lastExamOpenedAt || {};
      const changed = [];
      const branchIds = new Set([...Object.keys(afterMap), ...Object.keys(beforeMap)]);
      branchIds.forEach((branchId) => {
        const a = String(afterMap[branchId] || '');
        const b = String(beforeMap[branchId] || '');
        if (a && a !== b) {
          const appointmentId = String((after.lastExamOpenedAppointmentId || {})[branchId] || '');
          changed.push({ branchId, openedAt: a, appointmentId });
        }
      });
      return changed;
    };

    // ─── Part 1: الطبيب أرسل طلب دخول (entryAlert) ───
    // يوصل push للسكرتيرة في الفرع المناسب لكل فرع تغير.
    const changedEntryAlerts = collectChangedEntryAlertBranches();
    // Fallback للـ flat field (إذا ما في byBranch لكن entryAlert flat تغير)
    if (
      changedEntryAlerts.length === 0 &&
      entryAlertAfter &&
      entryAlertAfter.caseName &&
      entryAlertAfter.createdAt &&
      entryAlertBefore?.createdAt !== entryAlertAfter.createdAt
    ) {
      const fallbackBranchId = String(entryAlertAfter.branchId || 'main').trim() || 'main';
      changedEntryAlerts.push({ branchId: fallbackBranchId, alert: entryAlertAfter });
    }

    for (const { branchId, alert } of changedEntryAlerts) {
      try {
        const appointmentId = String(alert.appointmentId || '');
        const defaultLink = `/book/s/${secret}?branchId=${encodeURIComponent(branchId)}`;
        const defaultAbsoluteLink = toAbsoluteWebUrl(defaultLink);
        const tag = `entry_${branchId}_${Date.now()}`;
        const caseName = alert.caseName || 'مريض';
        const title = `الطبيب يطلب دخول حالة: ${caseName}`;
        const body = `اضغط للمزيد لفتح التطبيق وتأكيد دخول حالة ${caseName}`;

        const finalTokens = pickTokensForBranch(branchId);
        if (finalTokens.length === 0) {
          console.warn('[notifySecretary] entryAlert: no tokens for branch', { secret, branchId });
          continue;
        }

        const response = await admin.messaging().sendEachForMulticast({
          tokens: finalTokens,
          data: {
            type: 'doctor_entry_request',
            dh_action: 'secretary_entry_response',
            tag, title, body,
            icon: WEB_PUSH_ICON, badge: WEB_PUSH_BADGE,
            caseName: String(caseName),
            appointmentId,
            branchId,
            secret: String(secret || ''),
            url: defaultAbsoluteLink, link: defaultLink,
          },
          webpush: {
            headers: HIGH_URGENCY_HEADERS,
            notification: {
              title, body, tag, icon: WEB_PUSH_ICON, badge: WEB_PUSH_BADGE,
              renotify: true, requireInteraction: true,
              data: {
                type: 'doctor_entry_request',
                dh_action: 'secretary_entry_response',
                url: defaultAbsoluteLink, link: defaultLink,
                secret: String(secret || ''), appointmentId, branchId,
              },
              actions: [{ action: 'dh_open_app', title: 'لمزيد ادخل التطبيق' }],
            },
          },
        });
        logMulticastResult(`notifySecretary.entryAlert[${branchId}]`, response, finalTokens);
        const invalidTokens = getInvalidFcmTokensFromResponse(response, finalTokens);
        if (invalidTokens.length > 0) {
          await Promise.all(
            Array.from(relatedSecrets).map((rs) => cleanupInvalidSecretaryTokens(rs, invalidTokens))
          );
        }
      } catch (err) {
        console.error('[notifySecretary] entryAlert FCM failed:', err);
      }
    }

    // ─── Part 2: doctorEntryResponse تغير ───
    // نميز مصدر الرد (السكرتيرة vs الطبيب) لتحديد الوجهة:
    //   source === 'secretary' → السكرتيرة ردت على طلب الطبيب — الطبيب في الشاشة، لا push للسكرتيرة
    //   source === 'doctor' أو undefined (legacy) → الطبيب رد على طلب السكرتيرة — push للسكرتيرة
    const changedDoctorResponses = collectChangedDoctorResponseBranches();
    // Fallback للـ flat
    if (
      changedDoctorResponses.length === 0 &&
      doctorRespAfter &&
      doctorRespAfter.respondedAt &&
      doctorRespBefore?.respondedAt !== doctorRespAfter.respondedAt
    ) {
      const fallbackBranchId = String(doctorRespAfter.branchId || 'main').trim() || 'main';
      changedDoctorResponses.push({ branchId: fallbackBranchId, response: doctorRespAfter });
    }

    for (const { branchId, response: resp } of changedDoctorResponses) {
      // إذا المصدر هو السكرتيرة (ردت على entryAlert) → لا نرسل push لنفسها
      const responseSource = String(resp.source || 'doctor').trim();
      if (responseSource === 'secretary') {
        console.log('[notifySecretary] doctorResponse source=secretary → skip (doctor in-screen)', {
          branchId,
        });
        continue;
      }

      try {
        const isApproved = resp.status === 'approved';
        const tag = `resp_${branchId}_${Date.now()}`;
        const title = isApproved ? 'تم الموافقة بالدخول' : 'يتم الانتظار قليلاً';
        const body = isApproved ? 'يمكن إدخال الحالة الآن.' : 'الطبيب لم يسمح بالدخول الآن.';
        const defaultLink = `/book/s/${secret}?branchId=${encodeURIComponent(branchId)}`;
        const defaultAbsoluteLink = toAbsoluteWebUrl(defaultLink);

        const finalTokens = pickTokensForBranch(branchId);
        if (finalTokens.length === 0) {
          console.warn('[notifySecretary] doctorResponse: no tokens for branch', { secret, branchId });
          continue;
        }

        const response = await admin.messaging().sendEachForMulticast({
          tokens: finalTokens,
          data: {
            type: 'doctor_entry_response',
            tag, title, body,
            icon: WEB_PUSH_ICON, badge: WEB_PUSH_BADGE,
            status: String(resp.status || ''),
            appointmentId: String(resp.appointmentId || ''),
            branchId,
            secret: String(secret || ''),
            url: defaultAbsoluteLink, link: defaultLink,
          },
          webpush: {
            headers: HIGH_URGENCY_HEADERS,
            notification: {
              title, body, tag, icon: WEB_PUSH_ICON, badge: WEB_PUSH_BADGE,
              renotify: true, requireInteraction: false,
              data: {
                type: 'doctor_entry_response',
                url: defaultAbsoluteLink, link: defaultLink,
                secret: String(secret || ''), branchId,
                status: String(resp.status || ''),
              },
              actions: [{ action: 'dh_open_app', title: 'لمزيد ادخل التطبيق' }],
            },
          },
        });
        logMulticastResult(`notifySecretary.doctorResponse[${branchId}]`, response, finalTokens);
        const invalidTokens = getInvalidFcmTokensFromResponse(response, finalTokens);
        if (invalidTokens.length > 0) {
          await Promise.all(
            Array.from(relatedSecrets).map((rs) => cleanupInvalidSecretaryTokens(rs, invalidTokens))
          );
        }
      } catch (err) {
        console.error('[notifySecretary] doctorResponse FCM failed:', err);
      }
    }

    // ─── Part 3: الطبيب فتح الكشف (lastExamOpenedAt تغير) ───
    // نرسل push للسكرتيرة فقط إذا لم يكن هناك doctorEntryResponse في نفس الـ event للفرع نفسه
    // (تجنب duplicate: إذا الطبيب رد بـ approved من خلال respondToSecretaryEntryRequest،
    //  فالإشعار "رد الطبيب" يغطي بالفعل حدث "فتح الكشف" — لا داعي لتكرار).
    const changedExamOpens = collectChangedExamOpenedBranches();
    const branchesAlreadyNotifiedViaDoctorResp = new Set(
      changedDoctorResponses
        .filter(({ response }) => String(response.source || 'doctor').trim() === 'doctor')
        .map(({ branchId }) => branchId)
    );

    for (const { branchId, openedAt, appointmentId } of changedExamOpens) {
      if (branchesAlreadyNotifiedViaDoctorResp.has(branchId)) {
        console.log('[notifySecretary] examOpened: skip (already notified via doctorResponse)', { branchId });
        continue;
      }

      // ⚠️ تخطي لو السكرتيرة هي اللي كتبت (source=secretary) — مش الطبيب.
      // السيناريو: السكرتيرة ضغطت "نعم" على entryAlert → الكود كتب
      // doctorEntryResponse (source=secretary) + lastExamOpenedAt في نفس الـ write.
      // بدون هذا الفحص، السكرتيرة هتستقبل push "الطبيب بدأ الكشف" رغم إنها هي اللي وافقت.
      const afterDoctorRespForBranch = (after.doctorEntryResponseByBranch || {})[branchId];
      if (afterDoctorRespForBranch && String(afterDoctorRespForBranch.source || '').trim() === 'secretary') {
        console.log('[notifySecretary] examOpened: skip (source=secretary, not doctor)', { branchId });
        continue;
      }

      try {
        const tag = `exam_opened_${branchId}_${openedAt}`;
        const title = 'الطبيب بدأ الكشف';
        const body = 'تم فتح الكشف للمريض، يمكن تحديث الجدول.';
        const defaultLink = `/book/s/${secret}?branchId=${encodeURIComponent(branchId)}`;
        const defaultAbsoluteLink = toAbsoluteWebUrl(defaultLink);

        const finalTokens = pickTokensForBranch(branchId);
        if (finalTokens.length === 0) {
          console.warn('[notifySecretary] examOpened: no tokens for branch', { secret, branchId });
          continue;
        }

        const response = await admin.messaging().sendEachForMulticast({
          tokens: finalTokens,
          data: {
            type: 'doctor_exam_opened',
            tag, title, body,
            icon: WEB_PUSH_ICON, badge: WEB_PUSH_BADGE,
            appointmentId,
            branchId,
            secret: String(secret || ''),
            url: defaultAbsoluteLink, link: defaultLink,
          },
          webpush: {
            headers: HIGH_URGENCY_HEADERS,
            notification: {
              title, body, tag, icon: WEB_PUSH_ICON, badge: WEB_PUSH_BADGE,
              renotify: true, requireInteraction: false,
              data: {
                type: 'doctor_exam_opened',
                url: defaultAbsoluteLink, link: defaultLink,
                secret: String(secret || ''), branchId, appointmentId,
              },
              actions: [{ action: 'dh_open_app', title: 'لمزيد ادخل التطبيق' }],
            },
          },
        });
        logMulticastResult(`notifySecretary.examOpened[${branchId}]`, response, finalTokens);
        const invalidTokens = getInvalidFcmTokensFromResponse(response, finalTokens);
        if (invalidTokens.length > 0) {
          await Promise.all(
            Array.from(relatedSecrets).map((rs) => cleanupInvalidSecretaryTokens(rs, invalidTokens))
          );
        }
      } catch (err) {
        console.error('[notifySecretary] examOpened FCM failed:', err);
      }
    }
  };

  

  return notifySecretaryOnBookingConfigUpdate;
};
