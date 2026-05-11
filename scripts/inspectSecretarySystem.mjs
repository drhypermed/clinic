#!/usr/bin/env node
/**
 * فحص نظام السكرتيرة-الطبيب على قاعدة البيانات الفعلية.
 *
 * بيرد على الأسئلة:
 *   1. كم طبيب عنده bookingConfig؟ كم سكرتيرة (per-branch sessions)؟
 *   2. هل في collections قديمة لسه موجودة؟ (legacy paths)
 *   3. هل في null values جوّه الـper-branch maps (entryAlertByBranch إلخ)؟
 *   4. هل في bookingConfig يتيمة (بدون doctor)؟
 *   5. كم secretaryEntryRequest نشط؟
 *
 * التشغيل:
 *   node scripts/inspectSecretarySystem.mjs
 *
 * يحتاج: firebase login + application default credentials.
 * Read-only — مش بيعدل أي حاجة في القاعدة.
 */

import admin from 'firebase-admin';

// ─── تهيئة ───────────────────────────────────────────────────────
// بيستخدم application default credentials لو متاحة (gcloud auth)،
// أو تشغيله من ضمن Firebase Functions emulator/runtime.
admin.initializeApp({
  projectId: 'gen-lang-client-0444130146',
});

const db = admin.firestore();

// ─── أدوات ─────────────────────────────────────────────────────────
const fmt = (n) => Number(n).toLocaleString('en-US');

const hasNullValuesInMap = (mapValue) => {
  if (!mapValue || typeof mapValue !== 'object') return false;
  return Object.values(mapValue).some((v) => v === null);
};

// ─── الفحص ─────────────────────────────────────────────────────────
const inspect = async () => {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('   فحص نظام السكرتيرة — قاعدة بيانات DrHyper الفعلية');
  console.log('═══════════════════════════════════════════════════════\n');

  // (1) عدد المستخدمين (الأطباء)
  console.log('▶ عد الأطباء (users collection)…');
  const usersSnap = await db.collection('users').count().get();
  const totalDoctors = usersSnap.data().count;
  console.log(`  → ${fmt(totalDoctors)} طبيب\n`);

  // (2) عدد bookingConfig
  console.log('▶ عد bookingConfig docs…');
  const configsSnap = await db.collection('bookingConfig').count().get();
  const totalConfigs = configsSnap.data().count;
  console.log(`  → ${fmt(totalConfigs)} bookingConfig doc\n`);

  // (3) فحص عينة عشوائية من bookingConfig — أول 20
  console.log('▶ فحص 20 bookingConfig (بحث عن: legacy fields, null values, branches)…');
  const sample = await db.collection('bookingConfig').limit(20).get();

  let docsWithBranches = 0;
  let docsWithEntryAlertByBranch = 0;
  let docsWithTodayApptsByBranch = 0;
  let docsWithNullInBranchMaps = 0;
  let docsWithLegacyTodayAppointments = 0; // الحقل القديم بدون ByBranch
  let docsWithLegacyEntryAlert = 0;
  let totalBranchKeys = 0;
  let orphanConfigs = 0; // bookingConfig بدون user مطابق

  for (const doc of sample.docs) {
    const data = doc.data() || {};

    if (data.todayAppointmentsByBranch) {
      docsWithTodayApptsByBranch++;
      if (hasNullValuesInMap(data.todayAppointmentsByBranch)) docsWithNullInBranchMaps++;
      totalBranchKeys += Object.keys(data.todayAppointmentsByBranch).length;
    }
    if (data.entryAlertByBranch) {
      docsWithEntryAlertByBranch++;
      if (hasNullValuesInMap(data.entryAlertByBranch)) docsWithNullInBranchMaps++;
    }
    if (data.todayAppointments && !data.todayAppointmentsByBranch) docsWithLegacyTodayAppointments++;
    if (data.entryAlert && !data.entryAlertByBranch) docsWithLegacyEntryAlert++;

    // فحص الـowner
    const ownerId = data.userId || data.doctorId || data.uid;
    if (ownerId) {
      const ownerDoc = await db.collection('users').doc(String(ownerId)).get();
      if (!ownerDoc.exists) orphanConfigs++;
    }

    // فحص فروع subcollection
    const branchesSnap = await db.collection('bookingConfig').doc(doc.id).collection('branches').count().get();
    if (branchesSnap.data().count > 0) docsWithBranches++;
  }

  console.log(`  → docs بـ todayAppointmentsByBranch:  ${docsWithTodayApptsByBranch}/20`);
  console.log(`  → docs بـ entryAlertByBranch:        ${docsWithEntryAlertByBranch}/20`);
  console.log(`  → docs فيها null في per-branch maps:  ${docsWithNullInBranchMaps}/20  ${docsWithNullInBranchMaps > 0 ? '⚠️' : '✅'}`);
  console.log(`  → docs بحقل قديم todayAppointments:   ${docsWithLegacyTodayAppointments}/20  ${docsWithLegacyTodayAppointments > 0 ? '⚠️ legacy' : '✅'}`);
  console.log(`  → docs بحقل قديم entryAlert:         ${docsWithLegacyEntryAlert}/20  ${docsWithLegacyEntryAlert > 0 ? '⚠️ legacy' : '✅'}`);
  console.log(`  → docs بـ branches subcollection:     ${docsWithBranches}/20`);
  console.log(`  → docs يتيمة (بدون owner):           ${orphanConfigs}/20  ${orphanConfigs > 0 ? '⚠️' : '✅'}`);
  console.log(`  → متوسط فروع لكل عيادة:              ${docsWithTodayApptsByBranch > 0 ? (totalBranchKeys / docsWithTodayApptsByBranch).toFixed(1) : 'N/A'}\n`);

  // (4) Collections قديمة محتمل وجودها (من قبل الـ refactor)
  console.log('▶ بحث عن collections قديمة (legacy paths من قبل الـ refactor)…');
  const legacyCollections = [
    'secretaryAuth',           // قبل الـrefactor: top-level بدلاً من جوّه bookingConfig
    'secretaryEntryAlert',     // الاسم القديم
    'secretarySession',        // اسم محتمل قديم
    'doctorSecretaries',       // اسم محتمل قديم
  ];

  for (const colName of legacyCollections) {
    try {
      const snap = await db.collection(colName).limit(1).get();
      if (snap.empty) {
        console.log(`  ✅ ${colName}: فاضية أو غير موجودة`);
      } else {
        const countSnap = await db.collection(colName).count().get();
        console.log(`  ⚠️  ${colName}: ${fmt(countSnap.data().count)} doc — لسه موجودة!`);
      }
    } catch (err) {
      console.log(`  ✅ ${colName}: غير موجودة (${err.code || 'not-found'})`);
    }
  }

  // (5) secretaryEntryRequests — ده الـcollection الفعلي للطلبات
  console.log('\n▶ secretaryEntryRequests (الطلبات النشطة من السكرتيرة للطبيب)…');
  try {
    const requestsCount = await db.collection('secretaryEntryRequests').count().get();
    console.log(`  → ${fmt(requestsCount.data().count)} طلب نشط في الـcollection`);

    // sample 5
    const sampleReqs = await db.collection('secretaryEntryRequests').limit(5).get();
    let withResponseField = 0;
    let withoutResponseField = 0;
    for (const r of sampleReqs.docs) {
      const d = r.data() || {};
      if ('response' in d || 'responseAt' in d) withResponseField++;
      else withoutResponseField++;
    }
    console.log(`  → عينة 5: مع response=${withResponseField}, بدون response=${withoutResponseField}`);
  } catch (err) {
    console.log(`  → خطأ: ${err.message}`);
  }

  // (6) secretaryEntryAlertResponse
  console.log('\n▶ secretaryEntryAlertResponse (ردود الطبيب على السكرتيرة)…');
  try {
    const responsesCount = await db.collection('secretaryEntryAlertResponse').count().get();
    console.log(`  → ${fmt(responsesCount.data().count)} رد نشط`);
  } catch (err) {
    console.log(`  → غير موجودة أو فارغة`);
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('   انتهى الفحص');
  console.log('═══════════════════════════════════════════════════════\n');
};

inspect().catch((err) => {
  console.error('\n❌ خطأ في الفحص:', err.message);
  if (err.code === 'app/no-app' || String(err).includes('default credentials')) {
    console.error('\nمحتاج تعمل: gcloud auth application-default login');
    console.error('أو ضبط GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccountKey.json');
  }
  process.exit(1);
});
