#!/usr/bin/env node

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const DOCUMENT_ID = admin.firestore.FieldPath.documentId();
const SERVER_TIMESTAMP = admin.firestore.FieldValue.serverTimestamp;
const ARRAY_UNION = admin.firestore.FieldValue.arrayUnion;

const DEFAULT_PAGE_SIZE = 200;
const DOCTOR_SUBCOLLECTIONS = Object.freeze([
  'notifications',
  'usageDaily',
  'appointments',
  'records',
  'settings',
  'readyPrescriptions',
  'monthlyPrices',
  'financialData',
  'insuranceCompanies',
  'publicBookings',
]);

const ROOT_MAPPINGS = Object.freeze([
  {
    legacyCollection: 'doctors',
    role: 'doctor',
    subcollections: DOCTOR_SUBCOLLECTIONS,
  },
  {
    legacyCollection: 'public',
    role: 'public',
    subcollections: [],
  },
]);

const normalizeText = (value) => String(value || '').trim();
const normalizeEmail = (value) => normalizeText(value).toLowerCase();

const parseIntegerArg = (value, fallback) => {
  const parsed = Number.parseInt(String(value || '').trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const getArgValue = (name) => {
    const exact = `${name}=`;
    const found = args.find((entry) => entry.startsWith(exact));
    return found ? found.slice(exact.length) : '';
  };

  const collection = normalizeText(getArgValue('--collection')).toLowerCase() || 'all';
  const apply = args.includes('--apply');
  const cleanupLegacy = args.includes('--cleanup-legacy');
  const withDoctorSubcollections = args.includes('--with-doctor-subcollections');
  const pageSize = parseIntegerArg(getArgValue('--page-size'), DEFAULT_PAGE_SIZE);
  const limitPerCollection = parseIntegerArg(getArgValue('--limit'), 0);

  if (!['all', 'doctors', 'public'].includes(collection)) {
    throw new Error(`Unsupported --collection value: ${collection}`);
  }

  if (cleanupLegacy && !apply) {
    throw new Error('--cleanup-legacy requires --apply');
  }

  if (cleanupLegacy && collection !== 'public' && !withDoctorSubcollections) {
    console.warn('[migrateProfilesToUsers] cleanup for doctor docs was requested without --with-doctor-subcollections.');
    console.warn('[migrateProfilesToUsers] Doctor cleanup will be skipped to avoid leaving orphaned legacy subcollections.');
  }

  return {
    apply,
    cleanupLegacy,
    withDoctorSubcollections,
    pageSize,
    limitPerCollection,
    collection,
  };
};

const mergePrimaryProfileData = (primaryData, legacyData) => ({
  ...(legacyData || {}),
  ...(primaryData || {}),
});

const buildCanonicalUserPayload = ({ role, userId, mergedData, legacyCollection }) => {
  const payload = {
    ...mergedData,
    uid: normalizeText(mergedData?.uid) || userId,
    authRole: role,
    userRole: role,
    role,
    migratedFromLegacyCollections: ARRAY_UNION(legacyCollection),
    migratedToUsersAt: SERVER_TIMESTAMP(),
  };

  if (role === 'doctor') {
    const normalizedDoctorEmail = normalizeEmail(payload.doctorEmail);
    const normalizedEmail = normalizeEmail(payload.email);
    if (!normalizedDoctorEmail && normalizedEmail) {
      payload.doctorEmail = normalizedEmail;
    }
  }

  if (role === 'public') {
    const normalizedEmail = normalizeEmail(payload.email);
    if (normalizedEmail) {
      payload.email = normalizedEmail;
    }
  }

  return payload;
};

const shouldProcessMapping = (mapping, options) =>
  options.collection === 'all' || options.collection === mapping.legacyCollection;

const createStats = () => ({
  legacyRootDocsScanned: 0,
  userRootDocsWritten: 0,
  doctorSubcollectionDocsScanned: 0,
  doctorSubcollectionDocsWritten: 0,
  legacyRootDocsDeleted: 0,
  legacySubcollectionDocsDeleted: 0,
  cleanupSkipped: 0,
});

const enqueueSubcollectionMigration = async ({
  legacyRef,
  userRef,
  subcollectionName,
  writer,
  options,
  stats,
}) => {
  let lastDoc = null;

  while (true) {
    let query = legacyRef.collection(subcollectionName)
      .orderBy(DOCUMENT_ID)
      .limit(options.pageSize);

    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();
    if (snapshot.empty) {
      break;
    }

    snapshot.docs.forEach((docSnap) => {
      stats.doctorSubcollectionDocsScanned += 1;
      const targetRef = userRef.collection(subcollectionName).doc(docSnap.id);

      if (options.apply) {
        writer.set(targetRef, docSnap.data() || {}, { merge: true });
        stats.doctorSubcollectionDocsWritten += 1;

        if (options.cleanupLegacy) {
          writer.delete(docSnap.ref);
          stats.legacySubcollectionDocsDeleted += 1;
        }
      }
    });

    lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
    if (snapshot.size < options.pageSize) {
      break;
    }
  }
};

const migrateLegacyDoc = async ({ mapping, legacyDocSnap, writer, options, stats }) => {
  const userId = normalizeText(legacyDocSnap.id);
  if (!userId) {
    return;
  }

  const legacyData = legacyDocSnap.data() || {};
  const userRef = db.collection('users').doc(userId);
  const userSnap = await userRef.get();
  const mergedData = mergePrimaryProfileData(userSnap.exists ? (userSnap.data() || {}) : {}, legacyData);

  stats.legacyRootDocsScanned += 1;

  if (options.apply) {
    writer.set(userRef, buildCanonicalUserPayload({
      role: mapping.role,
      userId,
      mergedData,
      legacyCollection: mapping.legacyCollection,
    }), { merge: true });
    stats.userRootDocsWritten += 1;
  }

  if (mapping.legacyCollection === 'doctors' && options.withDoctorSubcollections) {
    for (const subcollectionName of mapping.subcollections) {
      await enqueueSubcollectionMigration({
        legacyRef: legacyDocSnap.ref,
        userRef,
        subcollectionName,
        writer,
        options,
        stats,
      });
    }
  }

  const canCleanupRoot = options.apply && options.cleanupLegacy && (
    mapping.legacyCollection === 'public' ||
    options.withDoctorSubcollections
  );

  if (canCleanupRoot) {
    writer.delete(legacyDocSnap.ref);
    stats.legacyRootDocsDeleted += 1;
  } else if (options.cleanupLegacy) {
    stats.cleanupSkipped += 1;
  }
};

const migrateMapping = async (mapping, options, writer) => {
  const stats = createStats();
  let processed = 0;
  let lastDoc = null;

  while (true) {
    let query = db.collection(mapping.legacyCollection)
      .orderBy(DOCUMENT_ID)
      .limit(options.pageSize);

    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();
    if (snapshot.empty) {
      break;
    }

    for (const docSnap of snapshot.docs) {
      if (options.limitPerCollection > 0 && processed >= options.limitPerCollection) {
        return stats;
      }

      await migrateLegacyDoc({
        mapping,
        legacyDocSnap: docSnap,
        writer,
        options,
        stats,
      });
      processed += 1;
    }

    lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
    if (snapshot.size < options.pageSize) {
      break;
    }
  }

  return stats;
};

const printUsage = () => {
  console.log('Usage: npm run migrate:profiles -- [--apply] [--cleanup-legacy] [--with-doctor-subcollections] [--collection=all|doctors|public] [--page-size=200] [--limit=100]');
  console.log('');
  console.log('Default mode is dry-run.');
  console.log('--apply writes merged legacy profiles into users.');
  console.log('--with-doctor-subcollections also copies doctor subcollections like notifications and usageDaily.');
  console.log('--cleanup-legacy deletes legacy docs after copy and requires --apply.');
};

const main = async () => {
  const options = parseArgs();
  const writer = db.bulkWriter();
  writer.onWriteError((error) => {
    console.error('[migrateProfilesToUsers] write failed:', {
      code: error.code,
      message: error.message,
      path: error.documentRef?.path || '',
    });
    return false;
  });

  const summary = {
    mode: options.apply ? 'apply' : 'dry-run',
    cleanupLegacy: options.cleanupLegacy,
    withDoctorSubcollections: options.withDoctorSubcollections,
    collection: options.collection,
    pageSize: options.pageSize,
    limitPerCollection: options.limitPerCollection,
    emulator: Boolean(process.env.FIRESTORE_EMULATOR_HOST),
    hasGoogleApplicationCredentials: Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS),
    collections: {},
  };

  for (const mapping of ROOT_MAPPINGS) {
    if (!shouldProcessMapping(mapping, options)) {
      continue;
    }

    console.log(`[migrateProfilesToUsers] Processing legacy collection: ${mapping.legacyCollection}`);
    summary.collections[mapping.legacyCollection] = await migrateMapping(mapping, options, writer);
  }

  await writer.close();

  console.log('[migrateProfilesToUsers] Summary');
  console.log(JSON.stringify(summary, null, 2));
};

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  printUsage();
  process.exit(0);
}

main().catch((error) => {
  console.error('[migrateProfilesToUsers] Failed:', error);
  printUsage();
  process.exitCode = 1;
});
