const {
  normalizeAudience,
  resolveAudienceRoleKeys,
} = require('../../fcmTopics');

const ROLE_TOKEN_COLLECTIONS = Object.freeze({
  secretary: 'secretaryFcmTokens',
});

const QUERY_PAGE_SIZE = 300;
const DOCTOR_SEGMENT_AUDIENCES = Object.freeze([
  'doctors_premium_active',
  'doctors_free_never_premium',
  'doctors_free_expired_premium',
]);
const CUSTOM_EMAIL_ROLE_MODES = Object.freeze([
  'all_linked',
  'doctor_only',
  'secretary_only',
  'doctor_and_secretary',
]);

const normalizeText = (value) => String(value || '').trim();
const normalizeEmail = (value) => normalizeText(value).toLowerCase();
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
const normalizeCustomEmailRoleMode = (value) => {
  const normalized = normalizeText(value).toLowerCase();
  return CUSTOM_EMAIL_ROLE_MODES.includes(normalized) ? normalized : 'all_linked';
};

const isSupportedCustomEmailRoleMode = (value) =>
  CUSTOM_EMAIL_ROLE_MODES.includes(normalizeCustomEmailRoleMode(value));

module.exports = (context) => {
  const {
    admin,
    getDb,
    getFcmTokensFromDoc,
  } = context;

  const collectTokensFromCollection = async (collectionName) => {
    const db = getDb();
    const tokens = [];
    let lastDoc = null;

    while (true) {
      let roleQuery = db
        .collection(collectionName)
        .orderBy(admin.firestore.FieldPath.documentId())
        .limit(QUERY_PAGE_SIZE);

      if (lastDoc) {
        roleQuery = roleQuery.startAfter(lastDoc);
      }

      const snapshot = await roleQuery.get();
      if (snapshot.empty) break;

      snapshot.docs.forEach((docSnap) => {
        getFcmTokensFromDoc(docSnap.data()).forEach((token) => {
          const normalized = normalizeText(token);
          if (normalized) tokens.push(normalized);
        });
      });

      lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
      if (snapshot.size < QUERY_PAGE_SIZE) break;
    }

    return tokens;
  };

  const collectUsersRoleTokens = async (authRole) => {
    const db = getDb();
    const tokens = [];
    let lastDoc = null;

    while (true) {
      let usersQuery = db
        .collection('users')
        .where('authRole', '==', authRole)
        .orderBy(admin.firestore.FieldPath.documentId())
        .limit(QUERY_PAGE_SIZE);

      if (lastDoc) {
        usersQuery = usersQuery.startAfter(lastDoc);
      }

      const snapshot = await usersQuery.get();
      if (snapshot.empty) break;

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        // استبعاد الحسابات المعطّلة — لا معنى لإرسال إشعارات لمن لا يستطيع الدخول.
        if (data?.isAccountDisabled === true) return;
        getFcmTokensFromDoc(data).forEach((token) => {
          const normalized = normalizeText(token);
          if (normalized) tokens.push(normalized);
        });
      });

      lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
      if (snapshot.size < QUERY_PAGE_SIZE) break;
    }

    return tokens;
  };

  const collectRoleTokens = async (roleKey) => {
    if (roleKey === 'doctor' || roleKey === 'public') {
      return collectUsersRoleTokens(roleKey);
    }

    const collectionName = ROLE_TOKEN_COLLECTIONS[roleKey];
    if (!collectionName) return [];
    return collectTokensFromCollection(collectionName);
  };

  const resolveCandidateUserIdsByEmail = async (email) => {
    const db = getDb();
    const normalizedEmail = normalizeEmail(email);
    const candidateUserIds = new Set();

    if (!normalizedEmail) return [];

    try {
      const authUser = await admin.auth().getUserByEmail(normalizedEmail);
      if (authUser?.uid) {
        candidateUserIds.add(normalizeText(authUser.uid));
      }
    } catch (error) {
      const code = normalizeText(error?.code);
      if (code !== 'auth/user-not-found') {
        console.warn('[audienceTokenResolver] getUserByEmail failed:', {
          normalizedEmail,
          code,
          message: normalizeText(error?.message),
        });
      }
    }

    const lookups = [
      db.collection('users').where('email', '==', normalizedEmail).limit(20).get().catch(() => null),
      db.collection('users').where('doctorEmail', '==', normalizedEmail).limit(20).get().catch(() => null),
    ];

    const snapshots = await Promise.all(lookups);
    snapshots.forEach((snapshot) => {
      if (!snapshot) return;
      snapshot.docs.forEach((docSnap) => {
        const uid = normalizeText(docSnap.id);
        if (uid) candidateUserIds.add(uid);
      });
    });

    return Array.from(candidateUserIds).filter(Boolean).slice(0, 100);
  };

  const collectSecretaryTokensForUserId = async (userId) => {
    const normalizedUserId = normalizeText(userId);
    if (!normalizedUserId) return [];

    const db = getDb();
    const snapshot = await db
      .collection('secretaryFcmTokens')
      .where('userId', '==', normalizedUserId)
      .limit(500)
      .get();

    const tokens = [];
    snapshot.docs.forEach((docSnap) => {
      getFcmTokensFromDoc(docSnap.data()).forEach((token) => {
        const normalized = normalizeText(token);
        if (normalized) tokens.push(normalized);
      });
    });

    return tokens;
  };

  const parseDateMs = (value) => {
    const normalized = normalizeText(value);
    if (!normalized) return NaN;
    const parsed = new Date(normalized).getTime();
    return Number.isFinite(parsed) ? parsed : NaN;
  };

  // طبيب نشط في باقة مدفوعة (برو أو برو ماكس) — الاتنين يحسبوا "Pro Active"
  const isProActiveDoctor = (doctorData, nowMs) => {
    const accountType = normalizeText(doctorData?.accountType).toLowerCase();
    if (accountType !== 'premium' && accountType !== 'pro_max') return false;
    const expiryMs = parseDateMs(doctorData?.premiumExpiryDate);
    if (!Number.isFinite(expiryMs)) return true;
    return expiryMs >= nowMs;
  };

  const isFreeNeverProDoctor = (doctorData) => {
    const accountType = normalizeText(doctorData?.accountType).toLowerCase();
    if (accountType !== 'free') return false;

    const premiumStartDate = normalizeText(doctorData?.premiumStartDate);
    const premiumExpiryDate = normalizeText(doctorData?.premiumExpiryDate);
    const lastProExpiryDate = normalizeText(doctorData?.lastProExpiryDate);

    return !premiumStartDate && !premiumExpiryDate && !lastProExpiryDate;
  };

  const isFreeExpiredProDoctor = (doctorData, nowMs) => {
    const accountType = normalizeText(doctorData?.accountType).toLowerCase();
    if (accountType !== 'free') return false;

    const premiumStartDate = normalizeText(doctorData?.premiumStartDate);
    const lastProExpiryDate = normalizeText(doctorData?.lastProExpiryDate);
    const premiumExpiryMs = parseDateMs(doctorData?.premiumExpiryDate);

    return Boolean(
      premiumStartDate ||
      lastProExpiryDate ||
      (Number.isFinite(premiumExpiryMs) && premiumExpiryMs < nowMs)
    );
  };

  /**
   * يقرأ شريحة الأطباء (premium نشط/مجاني/منتهي) ويستخرج الـ tokens مباشرة
   * من نفس قراءة المستندات. النسخة السابقة كانت تقرأ كل طبيب مرتين (مرة للفلتر،
   * مرة لجلب الـ tokens). دلوقتي قراءة واحدة فقط.
   */
  const resolveDoctorSegmentUserIdsAndTokens = async (normalizedAudience) => {
    if (!DOCTOR_SEGMENT_AUDIENCES.includes(normalizedAudience)) {
      return { userIds: [], tokens: [] };
    }

    const db = getDb();
    const nowMs = Date.now();
    const accountTypeFilter =
      normalizedAudience === 'doctors_premium_active' ? 'premium' : 'free';

    const matchedUserIds = [];
    const tokenSet = new Set();
    let lastDoc = null;

    while (true) {
      let doctorsQuery = db
        .collection('users')
        .where('authRole', '==', 'doctor')
        .where('accountType', '==', accountTypeFilter)
        .orderBy(admin.firestore.FieldPath.documentId())
        .limit(QUERY_PAGE_SIZE);

      if (lastDoc) {
        doctorsQuery = doctorsQuery.startAfter(lastDoc);
      }

      const snapshot = await doctorsQuery.get();
      if (snapshot.empty) break;

      snapshot.docs.forEach((docSnap) => {
        const userId = normalizeText(docSnap.id);
        if (!userId) return;
        const data = docSnap.data() || {};

        // استبعاد الحسابات المعطّلة بالشريحة كمان — تماشياً مع منطق collectUsersRoleTokens.
        if (data.isAccountDisabled === true) return;

        const matches =
          normalizedAudience === 'doctors_premium_active'
            ? isProActiveDoctor(data, nowMs)
            : normalizedAudience === 'doctors_free_never_premium'
              ? isFreeNeverProDoctor(data)
              : isFreeExpiredProDoctor(data, nowMs);

        if (!matches) return;

        matchedUserIds.push(userId);
        getFcmTokensFromDoc(data).forEach((token) => {
          const normalized = normalizeText(token);
          if (normalized) tokenSet.add(normalized);
        });
      });

      lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
      if (snapshot.size < QUERY_PAGE_SIZE) break;
    }

    return {
      userIds: matchedUserIds,
      tokens: Array.from(tokenSet),
    };
  };

  const resolveCustomModeInclusions = (customEmailRoleMode) => {
    const normalizedMode = normalizeCustomEmailRoleMode(customEmailRoleMode);
    return {
      mode: normalizedMode,
      includeDoctor: normalizedMode === 'all_linked' || normalizedMode === 'doctor_only' || normalizedMode === 'doctor_and_secretary',
      includeSecretary: normalizedMode === 'all_linked' || normalizedMode === 'secretary_only' || normalizedMode === 'doctor_and_secretary',
      includePublic: normalizedMode === 'all_linked',
    };
  };

  const collectCustomModeTokensForUser = ({
    normalizedTargetEmail,
    customEmailRoleMode,
    userData,
    doctorTokens,
    secretaryTokens,
    publicTokens,
    userTokens,
  }) => {
    const tokenSet = new Set();
    const roleHints = {
      authRole: normalizeText(userData?.authRole).toLowerCase(),
      doctorEmail: normalizeEmail(userData?.doctorEmail),
      email: normalizeEmail(userData?.email),
    };

    const looksDoctorAccount =
      roleHints.authRole === 'doctor' ||
      doctorTokens.length > 0 ||
      secretaryTokens.length > 0 ||
      roleHints.doctorEmail === normalizedTargetEmail;

    const looksPublicAccount =
      roleHints.authRole === 'public' ||
      publicTokens.length > 0 ||
      (!looksDoctorAccount && roleHints.email === normalizedTargetEmail);

    const modeInclusions = resolveCustomModeInclusions(customEmailRoleMode);

    if (modeInclusions.mode === 'all_linked') {
      [...doctorTokens, ...secretaryTokens, ...publicTokens, ...userTokens].forEach((token) => {
        const normalized = normalizeText(token);
        if (normalized) tokenSet.add(normalized);
      });

      return {
        tokens: Array.from(tokenSet),
        mode: modeInclusions.mode,
      };
    }

    if (modeInclusions.includeDoctor) {
      doctorTokens.forEach((token) => {
        const normalized = normalizeText(token);
        if (normalized) tokenSet.add(normalized);
      });

      if (looksDoctorAccount) {
        userTokens.forEach((token) => {
          const normalized = normalizeText(token);
          if (normalized) tokenSet.add(normalized);
        });
      }
    }

    if (modeInclusions.includeSecretary) {
      secretaryTokens.forEach((token) => {
        const normalized = normalizeText(token);
        if (normalized) tokenSet.add(normalized);
      });
    }

    if (modeInclusions.includePublic) {
      publicTokens.forEach((token) => {
        const normalized = normalizeText(token);
        if (normalized) tokenSet.add(normalized);
      });

      if (looksPublicAccount) {
        userTokens.forEach((token) => {
          const normalized = normalizeText(token);
          if (normalized) tokenSet.add(normalized);
        });
      }
    }

    // If a doctor-oriented mode is selected but the email belongs to a public account,
    // fallback to public delivery instead of yielding a false empty result.
    if (tokenSet.size === 0 && looksPublicAccount) {
      [...publicTokens, ...userTokens].forEach((token) => {
        const normalized = normalizeText(token);
        if (normalized) tokenSet.add(normalized);
      });
    }

    return {
      tokens: Array.from(tokenSet),
      mode: modeInclusions.mode,
    };
  };

  const collectTokensForCustomEmail = async (targetEmail, customEmailRoleModeInput) => {
    const normalizedTargetEmail = normalizeEmail(targetEmail);
    const customEmailRoleMode = normalizeCustomEmailRoleMode(customEmailRoleModeInput);

    if (!normalizedTargetEmail) {
      return {
        mode: 'custom',
        customEmailRoleMode,
        normalizedTargetEmail,
        roleKeys: [],
        tokens: [],
        excludedDueToOverlapCount: 0,
        candidateUserIds: [],
      };
    }

    const candidateUserIds = await resolveCandidateUserIdsByEmail(normalizedTargetEmail);
    const tokens = new Set();

    for (const uid of candidateUserIds) {
      const [userSnap, secretaryTokens] = await Promise.all([
        getDb().doc(`users/${uid}`).get().catch(() => null),
        collectSecretaryTokensForUserId(uid),
      ]);

      const userData = userSnap?.exists ? userSnap.data() : {};
      const userTokens = userSnap?.exists ? getFcmTokensFromDoc(userData) : [];
      const normalizedAuthRole = normalizeText(userData?.authRole).toLowerCase();
      const doctorTokens = normalizedAuthRole === 'doctor' ? userTokens : [];
      const publicTokens = normalizedAuthRole === 'public' ? userTokens : [];

      const modeResult = collectCustomModeTokensForUser({
        normalizedTargetEmail,
        customEmailRoleMode,
        userData,
        doctorTokens,
        secretaryTokens,
        publicTokens,
        userTokens,
      });

      modeResult.tokens.forEach((token) => {
        const normalized = normalizeText(token);
        if (normalized) tokens.add(normalized);
      });
    }

    return {
      mode: 'custom',
      customEmailRoleMode,
      normalizedTargetEmail,
      roleKeys: [],
      tokens: Array.from(tokens),
      excludedDueToOverlapCount: 0,
      candidateUserIds,
    };
  };

  /**
   * يجمع الـ tokens المستهدفة لفئة جمهور معينة.
   *
   * تصميم التكلفة: يقرأ فقط مجموعات الأدوار المستهدفة. النسخة السابقة كانت
   * تقرأ المجموعات الثلاث (أطباء + سكرتارية + جمهور) لكل بث للتحقق من تداخل
   * الـ tokens — مكلفة جداً مع آلاف المستخدمين بدون فائدة عملية: نفس الجهاز
   * يكون له token فريد لكل دور تقريباً، والحالات النادرة من التداخل غير مبررة
   * مقابل تكلفة قراءة كل المستخدمين في كل بث.
   *
   * dedup الحالي يحدث عبر Set داخل tokens المستهدفة فقط.
   */
  const collectTokensByAudience = async ({ targetAudience, targetEmail, customEmailRoleMode }) => {
    const normalizedAudience = normalizeAudience(targetAudience || 'all');

    if (normalizedAudience === 'custom') {
      return collectTokensForCustomEmail(targetEmail, customEmailRoleMode);
    }

    if (DOCTOR_SEGMENT_AUDIENCES.includes(normalizedAudience)) {
      const { userIds, tokens } = await resolveDoctorSegmentUserIdsAndTokens(normalizedAudience);
      return {
        mode: 'audience',
        customEmailRoleMode: 'all_linked',
        normalizedTargetEmail: '',
        roleKeys: ['doctor'],
        tokens,
        excludedDueToOverlapCount: 0,
        candidateUserIds: userIds,
      };
    }

    const roleKeys = resolveAudienceRoleKeys(normalizedAudience);
    const tokenSet = new Set();

    // قراءة الأدوار المستهدفة فقط، وdedup داخلي عبر Set.
    for (const roleKey of roleKeys) {
      const roleTokens = await collectRoleTokens(roleKey);
      roleTokens.forEach((token) => {
        const normalized = normalizeText(token);
        if (normalized) tokenSet.add(normalized);
      });
    }

    return {
      mode: 'audience',
      customEmailRoleMode: 'all_linked',
      normalizedTargetEmail: '',
      roleKeys,
      tokens: Array.from(tokenSet),
      excludedDueToOverlapCount: 0,
      candidateUserIds: [],
    };
  };

  return {
    normalizeEmail,
    isValidEmail,
    normalizeCustomEmailRoleMode,
    isSupportedCustomEmailRoleMode,
    collectTokensByAudience,
  };
};
