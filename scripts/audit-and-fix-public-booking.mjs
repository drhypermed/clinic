import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';

const args = new Set(process.argv.slice(2));
const APPLY = args.has('--apply');
const LIMIT_ARG = process.argv.find((arg) => arg.startsWith('--limit='));
const LIMIT = LIMIT_ARG ? Number(LIMIT_ARG.split('=')[1]) : 0;
const NOW_ISO = new Date().toISOString();
const DEFAULT_BRANCH_ID = 'main';

const serviceAccountPath = path.resolve('service-account.json');
if (!fs.existsSync(serviceAccountPath)) {
  throw new Error(`Missing service account: ${serviceAccountPath}`);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

const report = {
  mode: APPLY ? 'apply' : 'dry-run',
  startedAt: NOW_ISO,
  doctorsScanned: 0,
  doctorsWithPublicSecret: 0,
  configsUpdated: 0,
  lookupsUpdated: 0,
  slugsUpdated: 0,
  slotsUpdated: 0,
  expiredSlotsDeleted: 0,
  staleConfigsDeleted: 0,
  ambiguousSlots: [],
  staleConfigs: [],
  missingUsers: [],
  errors: [],
  samples: [],
};

const normalizeText = (value = '') =>
  String(value || '')
    .trim()
    .replace(/\u0640/g, '')
    .replace(/^(ال)?فرع\s+/i, '')
    .replace(/^ال/i, '')
    .replace(/\s+/g, ' ')
    .replace(/[^\u0600-\u06FFa-z0-9]+/gi, '')
    .toLocaleLowerCase();

const clean = (value = '') => String(value || '').trim();
const unique = (items) => (items.length === 1 ? items[0] : null);

const normalizeBranch = (doc) => {
  const data = doc.data() || {};
  const id = clean(doc.id || data.id);
  const name = clean(data.name) || (id === DEFAULT_BRANCH_ID ? 'الفرع الرئيسي' : id);
  return {
    id,
    name,
    address: clean(data.address),
    order: Number.isFinite(Number(data.order)) ? Number(data.order) : 9999,
  };
};

const normalizePublishedBranch = (item, index) => ({
  id: clean(item?.id),
  name: clean(item?.name),
  address: clean(item?.address),
  formTitle: clean(item?.formTitle),
  contactInfo: clean(item?.contactInfo),
  isActive: item?.isActive !== false,
  index,
});

const normalizeAdBranch = (item, index) => ({
  id: clean(item?.id),
  name: clean(item?.name),
  address: [item?.governorate, item?.city, item?.addressDetails].map(clean).filter(Boolean).join(' - '),
  index,
});

const buildDefaultBranch = (userData = {}) => ({
  id: DEFAULT_BRANCH_ID,
  name: 'الفرع الرئيسي',
  address: clean(userData.clinicAddress || userData.address || ''),
  order: 0,
});

const sortBranches = (branches) =>
  [...branches].sort((a, b) => {
    if (a.id === DEFAULT_BRANCH_ID) return -1;
    if (b.id === DEFAULT_BRANCH_ID) return 1;
    if (a.order !== b.order) return a.order - b.order;
    return a.name.localeCompare(b.name);
  });

const sameBranchPayload = (a, b) =>
  JSON.stringify(
    (a || []).map((branch) => ({
      id: clean(branch.id),
      name: clean(branch.name),
      address: clean(branch.address),
      formTitle: clean(branch.formTitle),
      contactInfo: clean(branch.contactInfo),
      isActive: branch.isActive !== false,
    })),
  ) ===
  JSON.stringify(
    (b || []).map((branch) => ({
      id: clean(branch.id),
      name: clean(branch.name),
      address: clean(branch.address),
      formTitle: clean(branch.formTitle),
      contactInfo: clean(branch.contactInfo),
      isActive: branch.isActive !== false,
    })),
  );

const stripEmptyBranchFields = (branch) => {
  const payload = {
    id: clean(branch.id),
    name: clean(branch.name),
    isActive: branch.isActive !== false,
  };
  const address = clean(branch.address);
  const formTitle = clean(branch.formTitle);
  const contactInfo = clean(branch.contactInfo);
  if (address) payload.address = address;
  if (formTitle) payload.formTitle = formTitle;
  if (contactInfo) payload.contactInfo = contactInfo;
  return payload;
};

const findAdForClinicBranch = (clinicBranch, clinicIndex, adBranches) => {
  const byId = adBranches.find((branch) => branch.id && branch.id === clinicBranch.id);
  if (byId) return byId;

  const clinicAddress = normalizeText(clinicBranch.address);
  if (clinicAddress) {
    const byAddress = unique(adBranches.filter((branch) => normalizeText(branch.address) === clinicAddress));
    if (byAddress) return byAddress;
  }

  const clinicName = normalizeText(clinicBranch.name);
  if (clinicName) {
    const byName = unique(adBranches.filter((branch) => normalizeText(branch.name) === clinicName));
    if (byName) return byName;
  }

  return adBranches[clinicIndex] || null;
};

const buildBranchIdMap = (publishedBranches, adBranches, realBranches, publishBranches) => {
  const realIds = new Set(realBranches.map((branch) => branch.id));
  const map = new Map();
  for (const branch of realBranches) map.set(branch.id, branch.id);

  const mapByCandidate = (candidate, index) => {
    if (!candidate?.id || realIds.has(candidate.id)) return;

    const byAddress = candidate.address
      ? unique(publishBranches.filter((branch) => normalizeText(branch.address) === normalizeText(candidate.address)))
      : null;
    if (byAddress) {
      map.set(candidate.id, byAddress.id);
      return;
    }

    const byName = candidate.name
      ? unique(publishBranches.filter((branch) => normalizeText(branch.name) === normalizeText(candidate.name)))
      : null;
    if (byName) {
      map.set(candidate.id, byName.id);
      return;
    }

    if (index === 0 && realIds.has(DEFAULT_BRANCH_ID)) {
      map.set(candidate.id, DEFAULT_BRANCH_ID);
    }
  };

  publishedBranches.forEach(mapByCandidate);
  adBranches.forEach(mapByCandidate);
  return map;
};

const writeReport = () => {
  fs.mkdirSync('scratch', { recursive: true });
  fs.writeFileSync(
    path.join('scratch', 'public-booking-audit-report.json'),
    JSON.stringify({ ...report, finishedAt: new Date().toISOString() }, null, 2),
  );
};

const commitBatch = async (ops) => {
  if (!APPLY || ops.length === 0) return;
  for (let i = 0; i < ops.length; i += 450) {
    const batch = db.batch();
    for (const op of ops.slice(i, i + 450)) op(batch);
    await batch.commit();
  }
};

const usersSnap = await db.collection('users').get();
const users = LIMIT > 0 ? usersSnap.docs.slice(0, LIMIT) : usersSnap.docs;

for (const userDoc of users) {
  const userId = userDoc.id;
  const userData = userDoc.data() || {};
  report.doctorsScanned += 1;

  const publicSecret = clean(userData.publicBookingSecret);
  if (!publicSecret) continue;
  report.doctorsWithPublicSecret += 1;

  try {
    const [branchesSnap, adSnap, configSnap, lookupSnap] = await Promise.all([
      db.collection('users').doc(userId).collection('branches').get(),
      db.collection('doctorAds').doc(userId).get(),
      db.collection('publicBookingConfig').doc(publicSecret).get(),
      db.collection('publicBookingLookup').doc(userId).get(),
    ]);

    const realBranches = sortBranches(
      branchesSnap.empty
        ? [buildDefaultBranch(userData)]
        : branchesSnap.docs.map(normalizeBranch).filter((branch) => branch.id),
    );
    const adBranchesRaw = Array.isArray(adSnap.data()?.branches) ? adSnap.data().branches : [];
    const adBranches = adBranchesRaw.map(normalizeAdBranch).filter((branch) => branch.id || branch.name || branch.address);
    const configData = configSnap.data() || {};
    const publishedBranches = (Array.isArray(configData.branches) ? configData.branches : [])
      .map(normalizePublishedBranch)
      .filter((branch) => branch.id && branch.name);
    const existingById = new Map(publishedBranches.map((branch) => [branch.id, branch]));

    const publishBranches = realBranches.map((clinicBranch, index) => {
      const adBranch = findAdForClinicBranch(clinicBranch, index, adBranches);
      const existing = existingById.get(clinicBranch.id);
      return stripEmptyBranchFields({
        id: clinicBranch.id,
        name: clean(adBranch?.name) || clinicBranch.name || clinicBranch.id,
        address: clean(existing?.address) || clean(adBranch?.address) || clean(clinicBranch.address),
        formTitle: clean(existing?.formTitle),
        contactInfo: clean(existing?.contactInfo),
        isActive: true,
      });
    });

    const branchIdMap = buildBranchIdMap(publishedBranches, adBranches, realBranches, publishBranches);
    const realIds = new Set(realBranches.map((branch) => branch.id));
    const ops = [];
    const publicSlug = clean(userData.publicUrlSlug || lookupSnap.data()?.publicUrlSlug || configData.publicUrlSlug);
    const adData = adSnap.data() || {};
    const doctorDisplayName = clean(adData.doctorName || userData.doctorName || userData.displayName || userData.name);
    const doctorProfileImage = clean(adData.profileImage || userData.profileImage || userData.photoURL);

    const configPatch = {
      userId,
      branches: publishBranches,
      updatedAt: new Date().toISOString(),
    };
    if (publicSlug) configPatch.publicUrlSlug = publicSlug;
    if (doctorDisplayName) configPatch.doctorDisplayName = doctorDisplayName;
    if (doctorProfileImage) configPatch.doctorProfileImage = doctorProfileImage;

    if (
      !configSnap.exists ||
      clean(configData.userId) !== userId ||
      clean(configData.publicUrlSlug) !== publicSlug ||
      (doctorDisplayName && clean(configData.doctorDisplayName) !== doctorDisplayName) ||
      (doctorProfileImage && clean(configData.doctorProfileImage) !== doctorProfileImage) ||
      !sameBranchPayload(publishedBranches, publishBranches)
    ) {
      report.configsUpdated += 1;
      ops.push((batch) => batch.set(db.collection('publicBookingConfig').doc(publicSecret), configPatch, { merge: true }));
    }

    const lookupData = lookupSnap.data() || {};
    if (clean(lookupData.publicBookingSecret) !== publicSecret || (publicSlug && clean(lookupData.publicUrlSlug) !== publicSlug)) {
      report.lookupsUpdated += 1;
      ops.push((batch) =>
        batch.set(
          db.collection('publicBookingLookup').doc(userId),
          {
            publicBookingSecret: publicSecret,
            ...(publicSlug ? { publicUrlSlug: publicSlug } : {}),
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        ),
      );
    }

    if (publicSlug) {
      const slugRef = db.collection('slugLookup').doc(publicSlug);
      const slugSnap = await slugRef.get();
      if (clean(slugSnap.data()?.userId) !== userId) {
        report.slugsUpdated += 1;
        ops.push((batch) => batch.set(slugRef, { userId, slug: publicSlug, updatedAt: new Date().toISOString() }, { merge: true }));
      }
    }

    const slotsSnap = await db.collection('publicBookingConfig').doc(publicSecret).collection('slots').get();
    for (const slotDoc of slotsSnap.docs) {
      const slot = slotDoc.data() || {};
      const dateTime = clean(slot.dateTime);
      if (dateTime && dateTime < NOW_ISO) {
        report.expiredSlotsDeleted += 1;
        ops.push((batch) => batch.delete(slotDoc.ref));
        continue;
      }

      const currentBranchId = clean(slot.branchId) || DEFAULT_BRANCH_ID;
      let nextBranchId = currentBranchId;
      if (!realIds.has(currentBranchId)) {
        nextBranchId = branchIdMap.get(currentBranchId) || '';
      }
      if (!nextBranchId && realBranches.length === 1) nextBranchId = realBranches[0].id;

      if (nextBranchId && nextBranchId !== currentBranchId && realIds.has(nextBranchId)) {
        report.slotsUpdated += 1;
        ops.push((batch) => batch.update(slotDoc.ref, { branchId: nextBranchId, updatedAt: new Date().toISOString() }));
      } else if (!realIds.has(currentBranchId)) {
        report.ambiguousSlots.push({ userId, publicSecret, slotId: slotDoc.id, branchId: currentBranchId, dateTime });
      }
    }

    await commitBatch(ops);

    if (report.samples.length < 20) {
      report.samples.push({
        userId,
        publicSecret,
        publicSlug,
        realBranches: realBranches.map((branch) => branch.id),
        publishedBranches: publishBranches.map((branch) => ({ id: branch.id, name: branch.name, address: branch.address || '' })),
        operations: ops.length,
      });
    }
  } catch (error) {
    report.errors.push({ userId, message: error?.message || String(error) });
  }
}

const configsSnap = await db.collection('publicBookingConfig').get();
const currentPublicSecrets = new Set(
  usersSnap.docs.map((doc) => clean(doc.data()?.publicBookingSecret)).filter(Boolean),
);
for (const configDoc of configsSnap.docs) {
  if (!currentPublicSecrets.has(configDoc.id)) {
    const slotsSnap = await configDoc.ref.collection('slots').get();
    const allSlotsExpired = slotsSnap.docs.every((slotDoc) => {
      const dateTime = clean(slotDoc.data()?.dateTime);
      return dateTime && dateTime < NOW_ISO;
    });
    const canDelete = slotsSnap.empty || allSlotsExpired;
    if (APPLY && canDelete) {
      for (let i = 0; i < slotsSnap.docs.length; i += 450) {
        const batch = db.batch();
        for (const slotDoc of slotsSnap.docs.slice(i, i + 450)) batch.delete(slotDoc.ref);
        await batch.commit();
      }
      await configDoc.ref.delete();
    }
    if (canDelete) report.staleConfigsDeleted += 1;
    report.staleConfigs.push({
      publicSecret: configDoc.id,
      userId: clean(configDoc.data()?.userId),
      sampleSlotCount: slotsSnap.size,
      allSlotsExpired,
      deleted: APPLY && canDelete,
    });
  }
}

writeReport();

console.log(JSON.stringify({
  mode: report.mode,
  doctorsScanned: report.doctorsScanned,
  doctorsWithPublicSecret: report.doctorsWithPublicSecret,
  configsUpdated: report.configsUpdated,
  lookupsUpdated: report.lookupsUpdated,
  slugsUpdated: report.slugsUpdated,
  slotsUpdated: report.slotsUpdated,
  expiredSlotsDeleted: report.expiredSlotsDeleted,
  staleConfigsDeleted: report.staleConfigsDeleted,
  ambiguousSlots: report.ambiguousSlots.length,
  staleConfigs: report.staleConfigs.length,
  errors: report.errors.length,
  reportPath: 'scratch/public-booking-audit-report.json',
}, null, 2));
