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

  const DEFAULT_BRANCH_ID = 'main';

  /**
   * مقارنة خريطتين per-branch لاكتشاف **كل** الفروع التي تغيرت (أُضيفت / عُدِّلت).
   * يرجع array `[{ branchId, value }, ...]` لكل فرع له طلب جديد أو محدَّث.
   * بهذه الطريقة لو سكرتيرتان من فرعين مختلفتين أرسلتا في نفس النافذة الزمنية،
   * نُطلق إشعاراً منفصلاً لكل فرع بدل ضياع أحدهما.
   */
  const collectChangedRequestBranches = (beforeMap, afterMap) => {
    const before = (beforeMap && typeof beforeMap === 'object' && !Array.isArray(beforeMap)) ? beforeMap : {};
    const after = (afterMap && typeof afterMap === 'object' && !Array.isArray(afterMap)) ? afterMap : {};

    const branchIds = new Set([...Object.keys(before), ...Object.keys(after)]);
    const changed = [];

    branchIds.forEach((branchId) => {
      const prev = before[branchId] || null;
      const next = after[branchId] || null;
      const prevCreatedAt = prev && typeof prev === 'object' ? String(prev.createdAt || '') : '';
      const nextCreatedAt = next && typeof next === 'object' ? String(next.createdAt || '') : '';
      if (prevCreatedAt !== nextCreatedAt && next && next.appointmentId) {
        changed.push({ branchId, value: next });
      }
    });

    return changed;
  };

  /**
   * جلب اسم الفرع وعدد الفروع للطبيب — عشان نضيف "فرع: X" في الإشعار
   * بس لما الطبيب عنده أكتر من فرع. لو فرع واحد، الإضافة دي مالهاش لازمة.
   *
   * يرجع: { branchName: string, hasMultipleBranches: boolean }
   * - branchName فاضي لو متقدرش تجيبه أو userId مش معروف
   * - hasMultipleBranches = true لو عدد الفروع >= 2
   */
  const loadBranchContextForDoctor = async ({ db, userId, branchId }) => {
    const result = { branchName: '', hasMultipleBranches: false };
    if (!userId) return result;
    try {
      const branchesSnap = await db.collection(`users/${userId}/branches`).get();
      const docs = branchesSnap.docs || [];
      result.hasMultipleBranches = docs.length >= 2;
      // لو الفرع 'main' مش موجود في collection بشكل صريح، عدّه ك+1 لو في فروع تانية
      // عشان "main" دائماً موجود ضمنياً للحساب الأساسي.
      if (!docs.some((d) => d.id === 'main') && docs.length >= 1) {
        result.hasMultipleBranches = true;
      }
      const matchDoc = docs.find((d) => d.id === branchId);
      if (matchDoc) {
        const data = matchDoc.data() || {};
        result.branchName = String(data.name || '').trim();
      } else if (branchId === 'main') {
        // الفرع الرئيسي — اسمه الافتراضي "الفرع الرئيسي" لو مفيش doc صريح
        result.branchName = 'الرئيسي';
      }
    } catch (err) {
      console.warn('[notifyDoctorOnSecretaryEntryRequest] Failed to load branch context:', err?.message || err);
    }
    return result;
  };

  /**
   * إرسال إشعار push للطبيب عن طلب دخول من فرع محدد.
   * يُستدعى مرة لكل فرع تغير. فصل الـ logic لتمكين تعدد الإشعارات في نفس event.
   */
  const sendDoctorEntryRequestNotification = async ({
    secret,
    branchId,
    requestData,
    configData,
    correlationId,
    stats,
  }) => {
    const patientName = requestData.patientName || 'مريض';

    const db = getDb();
    const userId = String(configData.userId || requestData?.doctorId || '').trim();

    // جلب اسم الفرع وعدد الفروع — عشان نقرر هل نضيف اسم الفرع للعنوان والجسم ولا لأ
    const { branchName, hasMultipleBranches } = await loadBranchContextForDoctor({
      db,
      userId,
      branchId,
    });

    // اسم الفرع بيظهر في:
    //   1) العنوان كبادئة بارزة "[فرع X]" — أول حاجة عين الطبيب بتقع عليها
    //      في إشعار الـOS، فبيعرف من أنهي فرع فوراً قبل ما يفتح التنبيه.
    //   2) نهاية الجسم (احتياطي) — للأجهزة اللي بتقص العنوان لو طويل.
    // الشرطان معاً: hasMultipleBranches (فرع واحد بس مالوش لازمة) + branchName
    // (لو متعرفناش اسمه ما نكتبش "فرع:" فاضي).
    const showBranchInfo = hasMultipleBranches && Boolean(branchName);
    const titlePrefix = showBranchInfo ? `[فرع ${branchName}] ` : '';
    const title = `${titlePrefix}السكرتارية تطلب دخول حالة`;
    const branchSuffix = showBranchInfo ? ` — فرع: ${branchName}` : '';
    const body = `السكرتارية تطلب دخول حالة: ${patientName}${branchSuffix}`;
    const doctorEmail = String(configData.doctorEmail || '').trim().toLowerCase();
    const candidateUserIds = await resolveDoctorCandidateUserIds({
      secret,
      preferredUserId: userId,
      doctorEmail,
    });
    let tokens = await loadDoctorFcmTokensForCandidates(candidateUserIds);

    // Prevent self-notification — استبعاد tokens السكرتيرات (كل الفروع)
    try {
      const secretaryTokenSnap = await db.doc(`secretaryFcmTokens/${secret}`).get().catch(() => null);
      if (secretaryTokenSnap?.exists) {
        const secretaryTokens = getFcmTokensFromDoc(secretaryTokenSnap.data());
        tokens = tokens.filter(t => !secretaryTokens.includes(t));
      }
    } catch (_) { }

    if (tokens.length === 0) {
      console.warn('[notifyDoctorOnSecretaryEntryRequest] No valid doctor tokens found', {
        secret,
        userId,
        doctorEmail,
        branchId,
        candidateUserIds,
      });
      return;
    }
    const appointmentId = String(requestData.appointmentId || '');
    // تمرير branchId في رابط الـ deep-link حتى يعرف الطبيب أي فرع يرد عليه
    const defaultLink = `/appointments?branchId=${encodeURIComponent(branchId)}`;
    const defaultAbsoluteLink = toAbsoluteWebUrl(defaultLink);
    const notificationTag = `secretary_entry_${secret}_${branchId}_${appointmentId || Date.now()}`;

    try {
      const response = await admin.messaging().sendEachForMulticast({
        tokens,
        data: {
          type: 'secretary_entry_request',
          dh_action: 'doctor_entry_response',
          title,
          body,
          icon: WEB_PUSH_ICON,
          badge: WEB_PUSH_BADGE,
          tag: notificationTag,
          patientName: String(requestData.patientName || ''),
          appointmentId,
          secret: String(secret || ''),
          branchId,
          url: defaultAbsoluteLink,
          link: defaultLink,
        },
        webpush: {
          headers: HIGH_URGENCY_HEADERS,
          notification: {
            title,
            body,
            icon: WEB_PUSH_ICON,
            badge: WEB_PUSH_BADGE,
            tag: notificationTag,
            renotify: true,
            requireInteraction: true,
            data: {
              type: 'secretary_entry_request',
              dh_action: 'doctor_entry_response',
              url: defaultAbsoluteLink,
              link: defaultLink,
              secret: String(secret || ''),
              appointmentId,
              branchId,
            },
            actions: [
              { action: 'dh_open_app', title: 'لمزيد ادخل التطبيق' },
            ],
          },
        }
      });
      logMulticastResult(`notifyDoctorOnSecretaryEntryRequest[${correlationId}/${branchId}]`, response, tokens);
      if (stats) {
        stats.tokensTargeted += tokens.length;
        stats.tokensSucceeded += Number(response?.successCount || 0);
        stats.tokensFailed += Number(response?.failureCount || 0);
      }
      const invalidTokens = getInvalidFcmTokensFromResponse(response, tokens);
      if (invalidTokens.length > 0) {
        if (stats) stats.invalidTokensCleaned += invalidTokens.length;
        await Promise.all(
          candidateUserIds.map((candidateUserId) =>
            cleanupInvalidDoctorTokens(candidateUserId, invalidTokens)
          )
        );
      }
    } catch (err) {
      console.error('[notifyDoctorOnSecretaryEntryRequest] FCM send failed:', { correlationId, err });
    }
  };

  const notifyDoctorOnSecretaryEntryRequest = async (event) => {
    const afterSnap = event.data?.after;
    if (!afterSnap?.exists) return;
    const beforeSnap = event.data?.before;

    const secret = event.params.secret;
    const afterData = afterSnap.data() || {};
    const beforeData = beforeSnap?.exists ? (beforeSnap.data() || {}) : {};

    // 1) جمع كل الفروع التي تغيرت في خريطة requestsByBranch
    const changedBranches = collectChangedRequestBranches(
      beforeData.requestsByBranch,
      afterData.requestsByBranch
    );

    // 2) Fallback للـ client القديم: لو مفيش requestsByBranch بس flat fields تغيرت
    //    وفيها appointmentId، اعتبر التغيير لفرع flat.branchId (أو main).
    let branchesToNotify = changedBranches;
    if (branchesToNotify.length === 0) {
      const flatAfterCreatedAt = String(afterData?.createdAt || '');
      const flatBeforeCreatedAt = String(beforeData?.createdAt || '');
      if (
        flatAfterCreatedAt &&
        flatAfterCreatedAt !== flatBeforeCreatedAt &&
        afterData.appointmentId
      ) {
        const flatBranchId = String(afterData.branchId || DEFAULT_BRANCH_ID).trim() || DEFAULT_BRANCH_ID;
        branchesToNotify = [{ branchId: flatBranchId, value: afterData }];
      }
    }

    if (branchesToNotify.length === 0) return;

    // Telemetry: correlationId يربط كل الـlogs للحدث ده + stats للتتبع.
    const correlationId = `${secret.slice(0, 6)}_${Date.now()}`;
    const stats = { tokensTargeted: 0, tokensSucceeded: 0, tokensFailed: 0, invalidTokensCleaned: 0 };

    // 3) جلب config مرة واحدة لكل الإشعارات (نفس secret)
    const db = getDb();
    const configSnap = await db.doc(`bookingConfig/${secret}`).get();
    if (!configSnap.exists) return;
    const configData = configSnap.data() || {};

    // 4) إرسال إشعار منفصل لكل فرع تغير — بالتوازي
    await Promise.all(
      branchesToNotify.map(({ branchId, value }) => {
        const normalizedBranchId =
          String(branchId || value?.branchId || DEFAULT_BRANCH_ID).trim() || DEFAULT_BRANCH_ID;
        return sendDoctorEntryRequestNotification({
          secret,
          branchId: normalizedBranchId,
          requestData: value,
          configData,
          correlationId,
          stats,
        });
      })
    );

    // ملخّص telemetry — كل الإحصاءات في سطر واحد للفلترة في Cloud Logs.
    if (stats.tokensTargeted > 0 || stats.tokensFailed > 0 || stats.invalidTokensCleaned > 0) {
      console.log('[notifyDoctorOnSecretaryEntryRequest] summary', {
        correlationId, secret, branchCount: branchesToNotify.length, ...stats,
      });
    }
  };

  

  return notifyDoctorOnSecretaryEntryRequest;
};
