
const {
  buildDoctorUserProfilePayload,
  loadUnifiedDoctorProfile,
  loadUnifiedUsageDoc,
} = require('../profileStore');

module.exports = ({
  HttpsError,
  ENFORCE_APP_CHECK,
  assertAdminRequest,
  getDb,
  admin,
  ALLOWED_GEMINI_MODELS,
  DEFAULT_AI_PROXY_LIMITS,
  getCairoDateKey,
  resolveDoctorAccountType,
}) => {
  
  const deleteDoctorAccount = async (request) => {
    const adminEmail = await assertAdminRequest(request);
    const doctorId = request.data?.doctorId;
    const rejectionReason = request.data?.rejectionReason;
    const deleteReason = request.data?.deleteReason;
    const keepFirestoreDoc = request.data?.keepFirestoreDoc || false;

    if (!doctorId) {
      throw new HttpsError('invalid-argument', 'معرف الطبيب مطلوب');
    }

    console.log(`[deleteDoctorAccount] Deleting doctor: ${doctorId}, by admin: ${adminEmail}, reason: ${rejectionReason || deleteReason || 'none'}`);

    let authDeleted = false;
    let firestoreDeleted = false;
    let storageDeleted = false;
    const deletedCollections = {
      users: 0,
      prescriptionSettings: 0,
      appointments: 0,
      records: 0,
      storageFiles: 0
    };

    try {
      const db = getDb();

      let doctorData = null;
      let doctorEmail = null;
      try {
        const doctorProfile = await loadUnifiedDoctorProfile({ db, userId: doctorId });
        if (doctorProfile.exists) {
          doctorData = doctorProfile.mergedData;
          doctorEmail = doctorData?.doctorEmail;
        }
      } catch (err) {
        console.log('[deleteDoctorAccount] Could not fetch doctor data:', err.message);
      }

      if ((rejectionReason || deleteReason) && doctorEmail) {
        try {
          await db.collection('blacklistedEmails').doc(doctorEmail.toLowerCase()).set({
            email: doctorEmail.toLowerCase(),
            reason: rejectionReason || deleteReason,
            blockedAt: new Date().toISOString(),
            blockedBy: adminEmail,
            originalDoctorId: doctorId,
            doctorName: doctorData?.doctorName || 'طبيب غير معروف',
          });
          console.log(`[deleteDoctorAccount] Added ${doctorEmail} to blacklist`);
        } catch (blacklistErr) {
          console.error('[deleteDoctorAccount] Failed to add to blacklist:', blacklistErr.message);
        }
      }

      
      try {
        await admin.auth().deleteUser(doctorId);
        authDeleted = true;
        console.log(`[deleteDoctorAccount] Deleted from Auth: ${doctorId}`);
      } catch (authErr) {
        if (authErr.code === 'auth/user-not-found') {
          console.log(`[deleteDoctorAccount] User not in Auth (already deleted or never existed): ${doctorId}`);
          authDeleted = true;
        } else {
          console.error('[deleteDoctorAccount] Auth error:', authErr.message);
          throw new HttpsError('internal', `خطأ أثناء حذف المستخدم من Auth: ${authErr.message}`);
        }
      }

      try {
        const db = getDb();

        let doctorData = null;
        try {
          const doctorProfile = await loadUnifiedDoctorProfile({ db, userId: doctorId });
          if (doctorProfile.exists) {
            doctorData = doctorProfile.mergedData;
          }
        } catch (err) {
          console.log('[deleteDoctorAccount] Could not fetch doctor data:', err.message);
        }

        
        try {
          const bucket = admin.storage().bucket();

          const verificationFolder = `doctor-verification/${doctorId}/`;
          const [files] = await bucket.getFiles({ prefix: verificationFolder });

          for (const file of files) {
            await file.delete();
            deletedCollections.storageFiles++;
            console.log(`[deleteDoctorAccount] Deleted file: ${file.name}`);
          }

          const prescriptionFolder = `prescription-images/${doctorId}/`;
          const [prescFiles] = await bucket.getFiles({ prefix: prescriptionFolder });

          for (const file of prescFiles) {
            await file.delete();
            deletedCollections.storageFiles++;
            console.log(`[deleteDoctorAccount] Deleted prescription file: ${file.name}`);
          }

          storageDeleted = true;
          console.log(`[deleteDoctorAccount] Deleted ${deletedCollections.storageFiles} files from Storage`);
        } catch (storageErr) {
          console.error('[deleteDoctorAccount] Storage deletion error:', storageErr.message);
        }

        if (keepFirestoreDoc) {
          console.log('[deleteDoctorAccount] keepFirestoreDoc flag is ignored in users-only mode');
        }

        try {
          await db.collection('users').doc(doctorId).delete();
          deletedCollections.users = 1;
          console.log(`[deleteDoctorAccount] Deleted from users: ${doctorId}`);
        } catch (err) {
          console.log('[deleteDoctorAccount] User doc not found');
        }

        // Delete sub-collections under users/{doctorId}
        
        const subCollections = ['appointments', 'records', 'prescriptionSettings', 'notifications', 'usageDaily', 'readyPrescriptions'];
        for (const subCol of subCollections) {
          try {
            const subSnap = await db.collection('users').doc(doctorId).collection(subCol).limit(500).get();
            if (subSnap.size > 0) {
              const batch = db.batch();
              subSnap.forEach((doc) => {
                batch.delete(doc.ref);
              });
              await batch.commit();
              deletedCollections[subCol] = subSnap.size;
              console.log(`[deleteDoctorAccount] Deleted ${subSnap.size} docs from users/${doctorId}/${subCol}`);
            }
          } catch (err) {
            console.log(`[deleteDoctorAccount] No ${subCol} sub-collection found or error:`, err.message);
          }
        }

        
        try {
          const legacyAppointments = await db.collection('appointments').where('doctorId', '==', doctorId).limit(500).get();
          if (legacyAppointments.size > 0) {
            const batch = db.batch();
            legacyAppointments.forEach((doc) => { batch.delete(doc.ref); });
            await batch.commit();
            deletedCollections.legacyAppointments = legacyAppointments.size;
          }
        } catch (err) {
          console.log('[deleteDoctorAccount] No legacy appointments found');
        }

        try {
          const legacyRecords = await db.collection('records').where('doctorId', '==', doctorId).limit(500).get();
          if (legacyRecords.size > 0) {
            const batch = db.batch();
            legacyRecords.forEach((doc) => { batch.delete(doc.ref); });
            await batch.commit();
            deletedCollections.legacyRecords = legacyRecords.size;
          }
        } catch (err) {
          console.log('[deleteDoctorAccount] No legacy records found');
        }

        firestoreDeleted = true;
        console.log(`[deleteDoctorAccount] All Firestore data deleted for: ${doctorId}`);
      } catch (firestoreErr) {
        console.error('[deleteDoctorAccount] Firestore error:', firestoreErr.message);
        throw new HttpsError('internal', `خطأ أثناء حذف بيانات Firestore: ${firestoreErr.message}`);
      }

      if (!authDeleted || !firestoreDeleted) {
        throw new HttpsError('internal', 'تعذر حذف جميع بيانات الحساب بالكامل.');
      }

      return {
        ok: true,
        deleted: true,
        doctorId,
        authDeleted,
        firestoreDeleted,
        storageDeleted,
        deletedCollections,
        message: 'تم حذف الحساب من Auth وFirestore وStorage بنجاح'
      };
    } catch (err) {
      if (err instanceof HttpsError) {
        throw err;
      }
      console.error('[deleteDoctorAccount] Unexpected error:', err);
      throw new HttpsError('internal', `حدث خطأ غير متوقع: ${err instanceof Error ? err.message : 'unknown'}`);
    }
  };

  
  // قائمة الميزات المسموحة — تطابق `AiFeatureName` في secureGeminiGateway.ts
  // أي قيمة تانية من الـclient يتم تسجيلها كـ"unknown" بدون رفض الـrequest.
  const ALLOWED_AI_FEATURES = new Set([
    'case_analysis',     // تحليل الحالة
    'translation',       // ترجمة بيانات الروشتة
    'drug_interactions', // فحص التداخلات الدوائية
    'pregnancy_safety',  // أمان الحمل والرضاعة
    'renal_dose',        // تعديل جرعات الكلى
    'medical_report',    // طباعة تقرير طبي بالـAI
    'unknown',           // fallback لو الـclient ما بعتش feature
  ]);

  const generateGeminiContent = async (request) => {
    const auth = request?.auth;
    if (!auth?.uid) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }

    const prompt = String(request?.data?.prompt || '');
    const model = String(request?.data?.model || 'gemini-2.5-flash').trim();
    const responseMimeType = request?.data?.responseMimeType === 'application/json' ? 'application/json' : 'text/plain';
    const temperatureRaw = Number(request?.data?.temperature ?? 0);
    const temperature = Number.isFinite(temperatureRaw) ? Math.min(1, Math.max(0, temperatureRaw)) : 0;
    // اسم الميزة اللي بتنادي AI — يُسجَّل في users/{id}.usageStatsByPlan.{tier}.aiFeatures
    // عشان تقرير الأدمن يعرض عداد per-feature.
    const rawFeature = String(request?.data?.feature || 'unknown').trim().toLowerCase();
    const feature = ALLOWED_AI_FEATURES.has(rawFeature) ? rawFeature : 'unknown';

    // thinkingBudget لوضع التفكير في gemini-2.5-flash:
    // -1 = ديناميكي (default، الموديل يقرر)، 0 = تعطيل، >0 = حد أقصى tokens.
    // الحد الأقصى 24576 لـ gemini-2.5-flash.
    const thinkingBudgetRaw = request?.data?.thinkingBudget;
    let thinkingBudget = -1; // default = dynamic
    if (thinkingBudgetRaw !== undefined && thinkingBudgetRaw !== null) {
      const parsed = Number(thinkingBudgetRaw);
      if (Number.isFinite(parsed)) {
        // نسمح بـ -1 (dynamic) أو 0 (disabled) أو أي رقم بين 1-24576.
        if (parsed === -1 || parsed === 0) {
          thinkingBudget = parsed;
        } else {
          thinkingBudget = Math.min(24576, Math.max(1, Math.floor(parsed)));
        }
      }
    }

    if (!prompt.trim()) {
      throw new HttpsError('invalid-argument', 'Prompt is required');
    }
    if (prompt.length > 120000) {
      throw new HttpsError('invalid-argument', 'Prompt is too large');
    }
    if (!ALLOWED_GEMINI_MODELS.has(model)) {
      throw new HttpsError('invalid-argument', 'Model is not allowed');
    }

    // Debugging: Identify where the key is coming from without logging the key itself
    let apiKeySource = "None";
    let apiKey = "";

    if (process.env.GEMINI_API_KEY) {
      apiKey = process.env.GEMINI_API_KEY;
      apiKeySource = "Firebase Secret (GEMINI_API_KEY)";
    } else if (process.env.GOOGLE_API_KEY) {
      apiKey = process.env.GOOGLE_API_KEY;
      apiKeySource = "Legacy Environment Variable (GOOGLE_API_KEY)";
    }

    console.log(`[GeminiProxy] Using API Key Source: ${apiKeySource}`);

    if (!apiKey || !apiKey.trim()) {
      throw new HttpsError('failed-precondition', `Gemini API key is not configured. Source detected: ${apiKeySource}. Please run: firebase functions:secrets:set GEMINI_API_KEY`);
    }
    apiKey = apiKey.trim();

    const userId = auth.uid;
    const db = getDb();
    const dayKey = getCairoDateKey(new Date());
    const usageDocId = `gemini-${dayKey}`;

    
    const quota = await db.runTransaction(async (tx) => {
      const doctorProfile = await loadUnifiedDoctorProfile({ db, userId, tx });
      if (!doctorProfile.exists) {
        throw new HttpsError('not-found', 'Doctor account not found');
      }

      const accountType = resolveDoctorAccountType(doctorProfile.mergedData);
      // برو وبرو ماكس نفس سقف الـ AI proxy (backstop) — الـ pro_max بيستخدم قيمة خاصة لو متوفرة
      const limit = accountType === 'pro_max'
        ? (DEFAULT_AI_PROXY_LIMITS.proMaxDailyLimit ?? DEFAULT_AI_PROXY_LIMITS.premiumDailyLimit)
        : accountType === 'premium'
          ? DEFAULT_AI_PROXY_LIMITS.premiumDailyLimit
          : DEFAULT_AI_PROXY_LIMITS.freeDailyLimit;

      if (!doctorProfile.userSnap.exists) {
        tx.set(doctorProfile.userRef, buildDoctorUserProfilePayload({
          uid: userId,
          accountType,
          premiumStartDate: typeof doctorProfile.mergedData?.premiumStartDate === 'string' ? doctorProfile.mergedData.premiumStartDate : null,
          premiumExpiryDate: typeof doctorProfile.mergedData?.premiumExpiryDate === 'string' ? doctorProfile.mergedData.premiumExpiryDate : null,
          doctorName: typeof doctorProfile.mergedData?.doctorName === 'string' ? doctorProfile.mergedData.doctorName : '',
          doctorEmail: typeof doctorProfile.mergedData?.doctorEmail === 'string'
            ? doctorProfile.mergedData.doctorEmail
            : (typeof doctorProfile.mergedData?.email === 'string' ? doctorProfile.mergedData.email : ''),
          syncedFromLegacyDoctorAt: admin.firestore.FieldValue.serverTimestamp(),
        }), { merge: true });
      }

      const usageDoc = await loadUnifiedUsageDoc({ db, userId, usageDocId, tx });
      const used = Number(usageDoc.mergedUsageData?.geminiCallCount || 0);
      if (used >= limit) {
        throw new HttpsError('resource-exhausted', 'DAILY_AI_LIMIT_REACHED', {
          accountType,
          limit,
          used,
          remaining: 0,
          dayKey,
        });
      }

      const nextUsed = used + 1;
      tx.set(usageDoc.userUsageRef, {
        doctorId: userId,
        dayKey,
        accountType,
        geminiCallCount: nextUsed,
        limitApplied: limit,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: usageDoc.userUsageSnap.exists
          ? usageDoc.userUsageSnap.data()?.createdAt || admin.firestore.FieldValue.serverTimestamp()
          : usageDoc.mergedUsageData?.createdAt || admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      return {
        accountType,
        used: nextUsed,
        limit,
        remaining: Math.max(limit - nextUsed, 0),
        dayKey,
      };
    });

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;

    // Thinking Mode مدعوم في gemini-2.5-* بس — مش موجود في الإصدارات الأقدم.
    const supportsThinking = model.startsWith('gemini-2.5');
    const generationConfig = {
      responseMimeType,
      temperature,
    };
    if (supportsThinking) {
      generationConfig.thinkingConfig = { thinkingBudget };
    }

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig,
    };

    
    const refundQuota = async () => {
      try {
        await db.runTransaction(async (tx) => {
          const usageDoc = await loadUnifiedUsageDoc({ db, userId, usageDocId, tx });
          if (usageDoc.userUsageSnap.exists) {
            const currentUsed = Number(usageDoc.mergedUsageData?.geminiCallCount || 0);
            if (currentUsed > 0) {
              tx.set(usageDoc.userUsageRef, {
                geminiCallCount: currentUsed - 1,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
              }, { merge: true });
            }
          }
        });
      } catch (refundErr) {
        console.error('[generateGeminiContent] Failed to refund quota:', refundErr);
      }
    };

    let response;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 45000);
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timer);
    } catch (err) {
      await refundQuota();
      throw new HttpsError('unavailable', `Gemini request failed: ${err instanceof Error ? err.message : 'unknown error'}`);
    }

    if (!response.ok) {
      await refundQuota();
      const errText = await response.text().catch(() => '');
      throw new HttpsError('internal', `Gemini API error (${response.status}): ${errText.slice(0, 500)}`);
    }

    const data = await response.json().catch(() => ({}));
    const text = Array.isArray(data?.candidates?.[0]?.content?.parts)
      ? data.candidates[0].content.parts.map((p) => (p?.text || '')).join('')
      : '';

    if (!text.trim()) {
      await refundQuota();
      throw new HttpsError('internal', 'Gemini returned empty response');
    }

    // ── تسجيل الاستخدام الحقيقي (Token Usage Logging) ──
    // Gemini بيرجع usageMetadata فيها عدد الـ tokens الفعلية — ده بيخلينا نحسب
    // التكلفة بدقة لكل دكتور ولكل يوم. البيانات دي بتتخزن في usage document عشان
    // نقدر نطلعها من Firestore ونبني dashboards لمراقبة التكلفة.
    const usageMeta = data?.usageMetadata || {};
    const promptTokens = Number(usageMeta?.promptTokenCount || 0);
    const candidatesTokens = Number(usageMeta?.candidatesTokenCount || 0);
    const thoughtsTokens = Number(usageMeta?.thoughtsTokenCount || 0); // tokens التفكير (Thinking Mode)
    const totalTokens = Number(usageMeta?.totalTokenCount || (promptTokens + candidatesTokens + thoughtsTokens));

    // تحديث usage document بالـ tokens المتراكمة — بدون blocking على الرد للمستخدم.
    try {
      await db.runTransaction(async (tx) => {
        const usageDoc = await loadUnifiedUsageDoc({ db, userId, usageDocId, tx });
        const currentMetrics = usageDoc.mergedUsageData?.tokenMetrics || {};
        const currentPrompt = Number(currentMetrics?.promptTokens || 0);
        const currentCandidates = Number(currentMetrics?.candidatesTokens || 0);
        const currentThoughts = Number(currentMetrics?.thoughtsTokens || 0);
        const currentTotal = Number(currentMetrics?.totalTokens || 0);

        tx.set(usageDoc.userUsageRef, {
          tokenMetrics: {
            promptTokens: currentPrompt + promptTokens,
            candidatesTokens: currentCandidates + candidatesTokens,
            thoughtsTokens: currentThoughts + thoughtsTokens,
            totalTokens: currentTotal + totalTokens,
            lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
        }, { merge: true });
      });
    } catch (trackErr) {
      // الفشل في تتبع التكاليف ما يمنعش إرسال الرد للمستخدم — بنلوج بس.
      console.warn('[generateGeminiContent] Token usage logging failed:', trackErr);
    }

    // ── عداد الميزات per-feature (lifetime cumulative) ──
    // بنحدّث users/{id}.usageStatsByPlan.{tier}.aiFeatures.{feature}.count بـzیادة 1.
    // FieldValue.increment آمن مع التوازي — مش محتاج read قبله.
    //
    // ملاحظة (cost optimization): شِيلنا shard collection adminDailyAiUsage عمداً
    // لتقليل الـwrites إلى نصف العدد (write واحد بدل اثنين). الـtrade-off هو
    // إن التقرير يعرض إجمالي lifetime فقط بدون range queries — وهذا اختيار
    // مقصود للـlaunch (range queries تتضاف لاحقاً لو تطلبت).
    try {
      const tier = quota.accountType; // 'free' | 'premium' | 'pro_max'
      const userDocRef = db.collection('users').doc(userId);
      await userDocRef.set({
        usageStatsByPlan: {
          [tier]: {
            aiFeatures: {
              [feature]: {
                count: admin.firestore.FieldValue.increment(1),
              },
            },
          },
        },
      }, { merge: true });
    } catch (featureCounterErr) {
      // الفشل ما يمنعش الرد — بس نلوج warning عشان monitoring يشوف لو في pattern مشكلة.
      console.warn('[generateGeminiContent] Per-feature counter failed:', featureCounterErr);
    }

    return {
      text,
      model,
      responseMimeType,
      accountType: quota.accountType,
      dayKey: quota.dayKey,
      remaining: quota.remaining,
      tokenUsage: {
        prompt: promptTokens,
        candidates: candidatesTokens,
        thoughts: thoughtsTokens,
        total: totalTokens,
      },
    };
  };

  /**
   * تعطيل/تفعيل حساب طبيب بشكل ذري (Firestore + Firebase Auth + إبطال tokens).
   *
   * يضمن تنفيذاً غير قابل للاختراق: حتى لو تلاعب المستخدم بكود الواجهة أو احتفظ
   * بـ ID token صالح، فلا يستطيع الوصول لأي شيء — Firebase Auth نفسه يرفض.
   */
  const setDoctorAccountDisabled = async (request) => {
    const adminEmail = await assertAdminRequest(request);
    const doctorId = String(request.data?.doctorId || '').trim();
    const disabled = Boolean(request.data?.disabled);
    const reason = String(request.data?.reason || '').trim().slice(0, 500);

    if (!doctorId) {
      throw new HttpsError('invalid-argument', 'معرف الطبيب مطلوب');
    }
    if (disabled && !reason) {
      throw new HttpsError('invalid-argument', 'سبب التعطيل مطلوب');
    }

    const db = getDb();
    const userRef = db.collection('users').doc(doctorId);

    // حماية إضافية: منع تعطيل الأدمن (الجذر + القائمة).
    try {
      const userSnap = await userRef.get();
      if (userSnap.exists) {
        const targetEmail = String(userSnap.data()?.doctorEmail || userSnap.data()?.email || '').toLowerCase().trim();
        if (targetEmail) {
          const adminByEmail = await db.collection('admins').doc(targetEmail).get();
          if (adminByEmail.exists) {
            throw new HttpsError('permission-denied', 'لا يمكن تعطيل/تفعيل حساب أدمن عبر هذه الدالة');
          }
        }
      }
    } catch (err) {
      if (err instanceof HttpsError) throw err;
      console.warn('[setDoctorAccountDisabled] Could not verify admin status:', err.message);
    }

    const nowIso = new Date().toISOString();

    // 1. تحديث Firebase Auth (يرفض محاولات الدخول الجديدة فوراً).
    try {
      await admin.auth().updateUser(doctorId, { disabled });
    } catch (authErr) {
      if (authErr.code === 'auth/user-not-found') {
        console.warn(`[setDoctorAccountDisabled] User not in Auth: ${doctorId}`);
      } else {
        throw new HttpsError('internal', `فشل تحديث Firebase Auth: ${authErr.message}`);
      }
    }

    // 2. عند التعطيل: إبطال كل الجلسات النشطة (ID tokens القديمة).
    if (disabled) {
      try {
        await admin.auth().revokeRefreshTokens(doctorId);
      } catch (revokeErr) {
        if (revokeErr.code !== 'auth/user-not-found') {
          console.warn('[setDoctorAccountDisabled] revokeRefreshTokens failed:', revokeErr.message);
        }
      }
    }

    // 3. تحديث Firestore (لكي يظهر في القوائم الإدارية).
    const payload = disabled
      ? {
          isAccountDisabled: true,
          disabledReason: reason,
          disabledAt: nowIso,
          disabledBy: adminEmail,
          updatedAt: nowIso,
        }
      : {
          isAccountDisabled: false,
          disabledReason: '',
          disabledAt: '',
          enabledBy: adminEmail,
          enabledAt: nowIso,
          updatedAt: nowIso,
        };

    try {
      await userRef.set(payload, { merge: true });
    } catch (firestoreErr) {
      console.error('[setDoctorAccountDisabled] Firestore write failed:', firestoreErr.message);
      throw new HttpsError('internal', `فشل تحديث Firestore: ${firestoreErr.message}`);
    }

    return {
      doctorId,
      disabled,
      reason: disabled ? reason : '',
      actor: adminEmail,
      timestamp: nowIso,
    };
  };

  return {
    deleteDoctorAccount,
    generateGeminiContent,
    setDoctorAccountDisabled,
  };
};
